import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { isPickable } from './ManualPicker';

/**
 * Collapse byte-identical materials onto a single shared instance.
 *
 * This attacks the single largest slice of the frame. Measured with
 * `scene.overrideMaterial = new MeshBasicMaterial()` — same geometry, same 372
 * draws, one cheap unlit shader — the scene render fell from 5.35 ms to
 * 2.39 ms. Over half the cost of a frame is not geometry, not fill rate and not
 * even shading: it is MATERIAL BINDING. three.js bumps its light-state version
 * every frame, so every DISTINCT material re-uploads the whole 43-light uniform
 * block the first time it is bound in that frame (~11.6 µs a bind, ~370 binds).
 * The cost scales as materials × lights, and lights are art-directed and fixed,
 * so the only lever left is the material count.
 *
 * Components create their materials independently, so the scene ends up with
 * many that are the same surface described twice — roughly 82 of 257 in a heavy
 * view. Sharing one instance between them means one uniform upload instead of
 * several, and no visual change whatsoever: the materials being merged are
 * identical in every property that can affect a pixel.
 *
 * It also compounds. StaticMerge buckets geometry by material IDENTITY, so
 * every pair of materials collapsed here turns two ungroupable meshes into one
 * mergeable group. That is why this runs first (SETTLE_AFTER 3.5 s) and
 * StaticMerge second (6 s).
 *
 * Three rules, each of which exists because breaking it caused a real problem:
 *
 *   STABLE    — a signature must repeat across several checks before its
 *               material is shared. Anything animated (a pulsing emissive, a
 *               fading niche key) changes signature between checks and is
 *               excluded automatically. Sharing an animated material would
 *               drive every user of it at once.
 *   UNPICKABLE— skip `isPickable` meshes. GLBModel deliberately clones each
 *               statue's material so that hovering warms only that figure;
 *               sharing them would light up the whole hall.
 *   NO DISPOSE— never dispose a material this replaces. The component that
 *               created it still owns it and will dispose it on unmount; a
 *               registry material may also be shared elsewhere by design.
 */

/** how many identical checks before a material counts as non-animated */
const STABLE_CHECKS = 3;

/** seconds between checks */
const INTERVAL = 0.5;

/** first check. The scene streams in over several seconds, so a single pass
 *  catches only whatever happened to exist and hold still by then — the first
 *  version of this stopped after one pass and collapsed 13 materials instead of
 *  hundreds. Passes therefore repeat (they are idempotent) until FINISH. */
const SETTLE_AFTER = 1.5;

/** stop before StaticMerge's 6 s, so merging sees the collapsed material set */
const FINISH = 5.5;

const MAP_KEYS = [
  'map',
  'alphaMap',
  'aoMap',
  'bumpMap',
  'displacementMap',
  'emissiveMap',
  'envMap',
  'lightMap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'specularMap',
  'gradientMap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
  'sheenColorMap',
  'sheenRoughnessMap',
  'transmissionMap',
  'thicknessMap',
  'iridescenceMap',
] as const;

/** every scalar/flag that can change a rendered pixel or a shader permutation */
const VALUE_KEYS = [
  'color',
  'emissive',
  'emissiveIntensity',
  'roughness',
  'metalness',
  'opacity',
  'transparent',
  'alphaTest',
  'side',
  'shadowSide',
  'blending',
  'blendSrc',
  'blendDst',
  'blendEquation',
  'depthTest',
  'depthWrite',
  'colorWrite',
  'toneMapped',
  'fog',
  'flatShading',
  'vertexColors',
  'wireframe',
  'dithering',
  'premultipliedAlpha',
  'polygonOffset',
  'polygonOffsetFactor',
  'polygonOffsetUnits',
  'visible',
  'clipShadows',
  'clipIntersection',
  'stencilWrite',
  'reflectivity',
  'ior',
  'sheen',
  'sheenRoughness',
  'clearcoat',
  'clearcoatRoughness',
  'transmission',
  'thickness',
  'attenuationDistance',
  'iridescence',
  'iridescenceIOR',
  'specularIntensity',
  'envMapIntensity',
  'aoMapIntensity',
  'lightMapIntensity',
  'bumpScale',
  'displacementScale',
  'displacementBias',
  'normalScale',
  'shininess',
  'sizeAttenuation',
  'rotation',
] as const;

function part(v: unknown): string {
  if (v === undefined || v === null) return '~';
  if (v instanceof THREE.Color) return v.getHexString();
  if (v instanceof THREE.Vector2) return `${v.x},${v.y}`;
  if (typeof v === 'number') return v.toFixed(4);
  return String(v);
}

/**
 * A material's full appearance fingerprint. Two materials with the same
 * signature render identically — texture identity is by UUID, so two different
 * canvases with the same pixels are (conservatively) NOT merged.
 */
function signature(m: THREE.Material): string | null {
  const anyM = m as unknown as Record<string, unknown>;
  // shader materials carry arbitrary uniforms we cannot compare; leave them be
  if ((m as { isShaderMaterial?: boolean }).isShaderMaterial) return null;
  if (m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile) return null;
  if (m.userData && Object.keys(m.userData).length > 0) return null;
  if (m.defines && Object.keys(m.defines).length > 0) return null;
  if (m.clippingPlanes && m.clippingPlanes.length > 0) return null;

  const bits: string[] = [m.type];
  for (const k of VALUE_KEYS) bits.push(part(anyM[k]));
  for (const k of MAP_KEYS) {
    const t = anyM[k] as THREE.Texture | null | undefined;
    if (!t) {
      bits.push('~');
      continue;
    }
    // same texture object, but repeat/offset are per-material state on it
    bits.push(`${t.uuid}:${part(t.offset)}:${part(t.repeat)}:${t.rotation.toFixed(4)}`);
  }
  return bits.join('|');
}

export function MaterialDedup({ enabled = true }: { enabled?: boolean }) {
  const { scene } = useThree();
  const elapsed = useRef(0);
  const sinceCheck = useRef(0);
  const done = useRef(false);
  const total = useRef(0);
  /** last signature seen for a material, and how many checks it has held */
  const seen = useRef(new Map<THREE.Material, { sig: string; hits: number }>());

  useFrame((_, delta) => {
    if (!enabled || done.current) return;
    elapsed.current += delta;
    if (elapsed.current < SETTLE_AFTER) return;
    sinceCheck.current += delta;
    if (sinceCheck.current < INTERVAL) return;
    sinceCheck.current = 0;

    // ——— pass 1: fingerprint every material, keep only the ones holding still ———
    const stable = new Map<THREE.Material, string>();
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh && !(o as THREE.Points).isPoints && !(o as THREE.Line).isLine) return;
      if (isPickable(mesh)) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        if (!mat) continue;
        const sig = signature(mat);
        if (sig === null) continue;
        const prev = seen.current.get(mat);
        if (prev && prev.sig === sig) {
          prev.hits++;
          if (prev.hits >= STABLE_CHECKS) stable.set(mat, sig);
        } else {
          seen.current.set(mat, { sig, hits: 1 });
        }
      }
    });
    if (stable.size === 0) {
      if (elapsed.current >= FINISH) done.current = true;
      return;
    }

    // ——— pass 2: elect one canonical material per signature ———
    const canonical = new Map<string, THREE.Material>();
    for (const [mat, sig] of stable) if (!canonical.has(sig)) canonical.set(sig, mat);

    // ——— pass 3: repoint every user at its canonical instance ———
    // Replaced instances are NOT disposed: their creating component still owns
    // them and disposes on unmount.
    let replaced = 0;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh && !(o as THREE.Points).isPoints && !(o as THREE.Line).isLine) return;
      if (isPickable(mesh)) return;
      if (Array.isArray(mesh.material)) {
        const next = mesh.material.map((mat) => {
          const sig = stable.get(mat);
          const win = sig ? canonical.get(sig) : undefined;
          if (win && win !== mat) {
            replaced++;
            return win;
          }
          return mat;
        });
        mesh.material = next;
      } else {
        const sig = stable.get(mesh.material);
        const win = sig ? canonical.get(sig) : undefined;
        if (win && win !== mesh.material) {
          mesh.material = win;
          replaced++;
        }
      }
    });

    total.current += replaced;
    if (elapsed.current >= FINISH) {
      done.current = true;
      seen.current.clear();
    }
  });

  return null;
}
