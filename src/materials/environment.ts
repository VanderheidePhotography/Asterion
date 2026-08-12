import * as THREE from 'three';
import { texPx } from '../features/explorer/three/textureBudget';

/**
 * THE ROOM AS A LIGHT PROBE — why the building's gold was black.
 *
 * A `MeshStandardMaterial` with `metalness` near 1 has NO diffuse term at all.
 * That is not a three.js quirk, it is what metal is: a conductor reflects its
 * surroundings and scatters nothing. So a metal in a scene with no environment
 * map is lit by exactly one thing — the specular highlight of whatever point
 * lights happen to graze it — and everywhere else on its surface it renders
 * black.
 *
 * Every metal in this catalogue sits at metalness 0.84 to 1.0, and the scene
 * had no environment of any kind. That is why the niche archivolts, the gilt
 * fillets, the vault ridge rails, the door furniture, the orrery's pins and
 * every leaf of `metal_gold_leaf` read as dark brown bands rather than as
 * metal: they were physically correct renderings of gold in an empty universe.
 *
 * ── What this is, and what it deliberately is not ──────────────────────────
 *
 * It is a hand-painted equirectangular probe of THIS room — dark, warm at
 * candle height, cool and bright at the oculus — run once through
 * `PMREMGenerator` and handed to the metals.
 *
 * It is NOT `scene.environment`. That would apply image-based lighting to every
 * standard material in the building, which is a whole-scene regrade: the museum
 * is deliberately graded at roughly 85% shadow, and adding an ambient IBL term
 * to all of the stone, timber and cloth at once would lift the floor of the
 * whole picture and flatten it. The registry hands this map ONLY to surfaces
 * that are meant to be metal (and, at a lower intensity, to glass), so the
 * change is confined to the surfaces that were wrong.
 *
 * ── Why it is painted rather than captured ────────────────────────────────
 *
 * A `RoomEnvironment` or a captured cube map would be a lot of machinery for a
 * reflection that is never read directly: what a rough brass moulding samples
 * is a heavily blurred mip, so only the LOW frequencies survive — roughly
 * "warm below, silver above, dark behind". Those are exactly the frequencies
 * that can be painted deliberately, at 128×64, in a few dozen lines. The
 * bright spots are the room's real fixtures — the oculus, the chandelier ring,
 * the sconce band — so what the metal reflects is where the light in this
 * building actually comes from.
 *
 * Costs one small texture and one PMREM pass at startup. No draw calls, no
 * lights, no per-frame work.
 */

/** the equirect canvas, before PMREM. Small on purpose — see the header. */
const W = 128;
const H = 64;

/**
 * Paint the room, in equirectangular projection.
 *
 * `v` runs from straight DOWN at the bottom row to straight UP at the top row
 * (three's `equirectUv` is `asin(dir.y)/PI + 0.5`, and the canvas is flipped on
 * upload as every texture is), so the canvas reads like an elevation: floor at
 * the bottom, oculus at the top.
 */
function paintRoom(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  /* ——— the vertical run of the room, floor to crown ——— */
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  // the oculus and the dome above the springing: moonlight, cool and dim
  sky.addColorStop(0, '#4a5a73');
  sky.addColorStop(0.22, '#1d2536');
  // the dark middle of the drum — most of what a metal at eye level sees
  sky.addColorStop(0.46, '#100e0d');
  // the candle band: chandeliers, sconces, the braziers. The only warmth.
  sky.addColorStop(0.6, '#4a2f16');
  sky.addColorStop(0.72, '#2a1a0d');
  // the floor, and the warm bounce off it that keeps the underside of a
  // moulding from going dead
  sky.addColorStop(1, '#171008');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  /* ——— the oculus ——— */
  // A single cool source overhead, which is what puts the highlight along the
  // top arris of every horizontal brass member in the building.
  const eye = ctx.createRadialGradient(w * 0.5, -h * 0.06, 0, w * 0.5, -h * 0.06, h * 0.34);
  eye.addColorStop(0, '#c9d8ea');
  eye.addColorStop(0.5, 'rgba(140,164,196,0.55)');
  eye.addColorStop(1, 'rgba(140,164,196,0)');
  ctx.fillStyle = eye;
  ctx.fillRect(0, 0, w, h * 0.4);

  /* ——— the fixtures ——— */
  // The chandelier ring and the sconce band, as discrete warm spots rather than
  // one even glow: a ring of separate sources is what gives a curved metal
  // surface a RUN of highlights along it instead of a single flat sheen, and
  // that run is most of what reads as "polished" at a glance.
  const spot = (u: number, v: number, r: number, tone: string, a: number) => {
    const g = ctx.createRadialGradient(u * w, v * h, 0, u * w, v * h, r * h);
    g.addColorStop(0, tone);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a;
    ctx.fillStyle = g;
    ctx.fillRect(u * w - r * h, v * h - r * h, r * h * 2, r * h * 2);
    ctx.globalAlpha = 1;
  };
  ctx.globalCompositeOperation = 'lighter';
  // the chandelier ring, hung high — eight of them round the drum
  for (let i = 0; i < 8; i++) spot((i + 0.5) / 8, 0.4, 0.11, '#ffb757', 0.85);
  // the sconce and candle band at head height, offset from the chandeliers so
  // the two rings do not stack into one bright belt
  for (let i = 0; i < 8; i++) spot((i + 1) / 8, 0.62, 0.09, '#ffa445', 0.7);
  // the hearth, west: the one big warm source in the building, and the reason
  // a metal turned that way is warmer on one side than the other
  spot(0.25, 0.68, 0.22, '#c4581f', 0.75);
  ctx.globalCompositeOperation = 'source-over';
}

let cached: THREE.Texture | null = null;

/**
 * Build the probe once, PMREM it, and keep it.
 *
 * Idempotent: called from `configureMaterials`, which is a `useEffect` and so
 * runs again on every hot reload and on a remount. The PMREM target is NOT
 * disposed for the same reason the registry never disposes a material — every
 * metal in the building is holding a reference to it.
 */
export function roomEnvironment(gl: THREE.WebGLRenderer): THREE.Texture {
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = texPx(W);
  canvas.height = texPx(H);
  const ctx = canvas.getContext('2d')!;
  paintRoom(ctx, canvas.width, canvas.height);

  const src = new THREE.CanvasTexture(canvas);
  src.mapping = THREE.EquirectangularReflectionMapping;
  src.colorSpace = THREE.SRGBColorSpace;
  src.needsUpdate = true;

  const pmrem = new THREE.PMREMGenerator(gl);
  pmrem.compileEquirectangularShader();
  cached = pmrem.fromEquirectangular(src).texture;
  // the source canvas has been consumed into the mip chain and the generator's
  // own scratch targets are finished with; only `cached` outlives this call
  pmrem.dispose();
  src.dispose();
  return cached;
}
