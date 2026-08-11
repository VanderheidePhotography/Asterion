import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Stop uploading the same bitmap to the GPU more than once.
 *
 * `THREE.Texture.clone()` copies the `image` by REFERENCE but produces a new
 * texture object with a new uuid — and WebGLTextures keys its uploads by the
 * texture object, not by the image. So every clone is a full, independent copy
 * resident in VRAM, of pixels that are already there. Cloning is the normal way
 * to give one canvas several different wrap/repeat/offset treatments (the book
 * spines do exactly this, sampling four columns of one sheet), so the pattern is
 * correct and common — but wherever a clone ended up with the SAME sampler state
 * as its original, the second upload buys nothing at all.
 *
 * Measured in a heavy view: 845 live textures over 748 distinct images —
 * 97 redundant uploads, **302 MB of duplicated VRAM**, no single one of them
 * large enough to notice. There is no hot spot to find here by looking; it is
 * a long tail of 1024² and 512² duplicates, which is exactly the shape of
 * problem a sweep finds and a person does not.
 *
 * This runs BEFORE MaterialDedup, and that ordering is the interesting part.
 * MaterialDedup keys a material's signature on its map UUIDs, so two materials
 * that were identical apart from holding two clones of one image could never
 * match. Collapsing the textures first makes those UUIDs equal and hands
 * MaterialDedup matches it could not otherwise see — which in turn hands
 * StaticMerge more geometry it can bake. Three passes, each one feeding the
 * next.
 *
 * Same three rules as [materialDedup.tsx], for the same reasons: a signature
 * must hold still across several checks (which excludes anything scrolling its
 * UVs), passes repeat across the settle window because the scene is still
 * streaming, and nothing is ever disposed — the component that created the
 * texture still owns it.
 */

const STABLE_CHECKS = 3;
const INTERVAL = 0.5;
/** starts earliest of the three passes, but runs the full settle window
 *  alongside MaterialDedup rather than finishing before it. Ordering only has
 *  to hold WITHIN a tick — this component is mounted first, so each tick it
 *  collapses textures before MaterialDedup fingerprints the materials, and a
 *  texture that only streams in at 4 s still gets picked up by a later material
 *  pass. Cutting this off at 3.4 s left 65 of the 97 duplicates unshared. */
const SETTLE_AFTER = 1.0;
const FINISH = 5.5;

/** every sampler-state field that changes how the image is READ. Two textures
 *  sharing an image but differing in any of these are genuinely different and
 *  must both stay — this is what keeps the four book-spine columns intact. */
const STATE_KEYS = [
  'wrapS',
  'wrapT',
  'magFilter',
  'minFilter',
  'anisotropy',
  'format',
  'type',
  'colorSpace',
  'flipY',
  'generateMipmaps',
  'premultiplyAlpha',
  'unpackAlignment',
  'channel',
] as const;

function signature(t: THREE.Texture): string {
  const anyT = t as unknown as Record<string, unknown>;
  const bits: string[] = [t.type === undefined ? '~' : String(t.type)];
  for (const k of STATE_KEYS) bits.push(String(anyT[k]));
  bits.push(
    `${t.offset.x.toFixed(5)},${t.offset.y.toFixed(5)}`,
    `${t.repeat.x.toFixed(5)},${t.repeat.y.toFixed(5)}`,
    `${t.center.x.toFixed(5)},${t.center.y.toFixed(5)}`,
    t.rotation.toFixed(5),
  );
  return bits.join('|');
}

/** the material slots that can hold a texture */
const SLOTS = [
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

function eachMaterial(scene: THREE.Scene, fn: (m: THREE.Material) => void) {
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) if (m) fn(m);
  });
}

export function TextureDedup({ enabled = true }: { enabled?: boolean }) {
  const { scene } = useThree();
  const elapsed = useRef(0);
  const sinceCheck = useRef(0);
  const done = useRef(false);
  const total = useRef(0);
  const seen = useRef(new Map<THREE.Texture, { sig: string; hits: number }>());

  useFrame((_, delta) => {
    if (!enabled || done.current) return;
    elapsed.current += delta;
    if (elapsed.current < SETTLE_AFTER) return;
    sinceCheck.current += delta;
    if (sinceCheck.current < INTERVAL) return;
    sinceCheck.current = 0;

    // ——— pass 1: fingerprint, and keep only the textures holding still ———
    const stable = new Map<THREE.Texture, string>();
    eachMaterial(scene, (m) => {
      const anyM = m as unknown as Record<string, unknown>;
      for (const slot of SLOTS) {
        const t = anyM[slot] as THREE.Texture | null | undefined;
        // a render target's texture has no shareable source image
        if (!t || !t.isTexture || !t.image) continue;
        const sig = signature(t);
        const prev = seen.current.get(t);
        if (prev && prev.sig === sig) {
          prev.hits++;
          if (prev.hits >= STABLE_CHECKS) stable.set(t, sig);
        } else {
          seen.current.set(t, { sig, hits: 1 });
        }
      }
    });
    if (stable.size === 0) {
      if (elapsed.current >= FINISH) done.current = true;
      return;
    }

    // ——— pass 2: one canonical texture per (image, sampler state) ———
    // grouped on the IMAGE OBJECT itself, so only genuinely identical pixels are
    // ever shared — never two canvases that merely came out looking alike
    const byImage = new Map<unknown, Map<string, THREE.Texture>>();
    for (const [t, sig] of stable) {
      let m = byImage.get(t.image);
      if (!m) byImage.set(t.image, (m = new Map()));
      if (!m.has(sig)) m.set(sig, t);
    }

    // ——— pass 3: repoint every slot at its canonical texture ———
    let replaced = 0;
    eachMaterial(scene, (m) => {
      const anyM = m as unknown as Record<string, unknown>;
      let dirty = false;
      for (const slot of SLOTS) {
        const t = anyM[slot] as THREE.Texture | null | undefined;
        if (!t) continue;
        const sig = stable.get(t);
        if (!sig) continue;
        const win = byImage.get(t.image)?.get(sig);
        if (!win || win === t) continue;
        anyM[slot] = win;
        replaced++;
        dirty = true;
      }
      // the shader samples the same slots, so no recompile is needed — but the
      // renderer must be told the material's texture bindings changed
      if (dirty) m.needsUpdate = true;
    });

    total.current += replaced;
    if (elapsed.current >= FINISH) {
      done.current = true;
      seen.current.clear();
    }
  });

  return null;
}
