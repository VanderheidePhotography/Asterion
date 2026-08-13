import * as THREE from 'three';
import { leanPath } from '../features/explorer/three/textureBudget';
import libraryJson from './library.json';
import { paintFallback } from './fallbacks';
import { roomEnvironment } from './environment';
import {
  SRGB_SLOTS,
  type AnyStandardMaterial,
  type MapSlot,
  type MaterialDef,
  type MaterialLibrary,
  type MaterialParams,
  type MaterialRequest,
  type TextureManifest,
} from './types';

/**
 * The material registry.
 *
 * One rule governs this file: geometry code must never know what a surface is
 * made of. It asks for `stone_limestone_ancient` and gets a material back,
 * synchronously, ready to render. Whether that material is currently wearing a
 * 4K scan or a painted stand-in, and whether the scan finished downloading, is
 * the registry's problem and nobody else's.
 *
 * That synchronous contract is what makes the whole thing droppable. The scene
 * builds once; textures land later and swap themselves in.
 *
 * ── Adding your own scans ──────────────────────────────────────────────────
 *   1. drop files into  public/textures/<material-id>/
 *      albedo.jpg  normal.png  roughness.jpg  ao.jpg  metalness.jpg  height.png
 *   2. run  npm run textures:scan
 *   3. reload. No code changes.
 */

const LIB = libraryJson as unknown as MaterialLibrary;

/** every id in the catalogue, as a literal union — a typo is a compile error */
export type MaterialId = keyof typeof libraryJson.materials;

export const MATERIAL_IDS = Object.keys(LIB.materials) as MaterialId[];

export function getMaterialDef(id: MaterialId): MaterialDef {
  return LIB.materials[id] as MaterialDef;
}

/** `/textures/Wood/wood_floor_polished` — the asset folder for a material */
function assetDir(id: MaterialId): string {
  const def = getMaterialDef(id);
  const category = def.category ?? LIB.categories[def.family] ?? 'Misc';
  return `${LIB.root}/${category}/${id}`;
}

/* ————— manifest: which ids actually have scans on disk ————— */

let manifest: TextureManifest | null = null;
let manifestPromise: Promise<void> | null = null;

/**
 * Fetch the scan manifest and upgrade every material already handed out.
 *
 * A manifest rather than blind probing. Forty materials times eight slots is
 * three hundred speculative requests on a cold load, and three hundred 404s in
 * the network panel bury the one error that actually matters.
 */
export function primeMaterials(): Promise<void> {
  if (manifestPromise) return manifestPromise;
  // the manifest counts as a scan in flight: it is what TELLS the registry
  // which scans exist, so a count that ignored it could reach zero before a
  // single real one had been asked for
  inFlight += 1;
  manifestPromise = fetch(`${LIB.root}/manifest.json`)
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then((json: TextureManifest) => {
      manifest = json ?? {};
      // anything built before the manifest landed is still on its stand-in
      for (const entry of live.values()) applyMaps(entry.material, entry.id, entry.request);
      inFlight = Math.max(0, inFlight - 1);
    });
  return manifestPromise;
}

/* ————— renderer-dependent settings ————— */

let maxAnisotropy = 4;

/**
 * The room's own reflection, for the surfaces that need one — see the header of
 * `environment.ts` for why a metal with no environment map renders black, and
 * why this is NOT hung on `scene.environment`.
 *
 * Null until the renderer arrives (PMREM needs a GL context). Materials built
 * before then are caught by the sweep in `configureMaterials`, exactly as they
 * are caught by the sweep in `primeMaterials` when their scans land.
 */
let environment: THREE.Texture | null = null;

/**
 * Which surfaces get it.
 *
 * METAL, always: that is the family the map exists for, and a metal without one
 * is not dark on purpose, it is broken.
 *
 * GLASS, at a lower intensity: crystal spheres, lenses and flask bodies are
 * doing the same job — showing the room back — and they have the same problem,
 * but glass is dielectric, so it keeps its diffuse term and needs far less help.
 *
 * Everything else is left alone. Image-based lighting on the stone and timber
 * would raise the black floor of the entire building at once, and this museum's
 * whole grade is built on that floor staying where it is.
 */
function envIntensityFor(def: MaterialDef): number | null {
  if (def.family === 'metal') return def.params?.envMapIntensity ?? 1;
  if (def.family === 'glass') return def.params?.envMapIntensity ?? 0.45;
  return def.params?.envMapIntensity ?? null;
}

function applyEnvironment(mat: AnyStandardMaterial, def: MaterialDef): void {
  if (!environment) return;
  const intensity = envIntensityFor(def);
  if (intensity === null) return;
  mat.envMap = environment;
  mat.envMapIntensity = intensity;
  mat.needsUpdate = true;
}

/**
 * Hand the registry the renderer once it exists. Anisotropy is the single
 * cheapest win in a building full of long floors and tall shafts seen at
 * grazing angles — without it every plank run turns to shimmer at ten metres.
 *
 * This is also where the room's reflection is built and swept over everything
 * already handed out. Both passes are idempotent — this runs again on every hot
 * reload — and `roomEnvironment` caches, so the PMREM pass happens once.
 */
export function configureMaterials(gl: THREE.WebGLRenderer): void {
  maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  for (const tex of textureCache.values()) {
    tex.anisotropy = maxAnisotropy;
    tex.needsUpdate = true;
  }
  environment = roomEnvironment(gl);
  for (const entry of live.values()) applyEnvironment(entry.material, getMaterialDef(entry.id));
}

/* ————— texture loading ————— */

const loader = new THREE.TextureLoader();
/** one download per file; per-material clones share the GPU upload */
const textureCache = new Map<string, THREE.Texture>();

/**
 * Files that failed to load, and the work waiting on them.
 *
 * `loader.load` hands back a texture straight away and fills it in later, so a
 * fetch that fails leaves a BLANK texture bound to the material — and a blank
 * map renders the surface black, not untextured. That is worse than having no
 * scan at all, because the painted stand-in below would have covered it: the
 * albedo slot is marked satisfied the moment the load is *started*, so a
 * failure took the surface black and skipped the fallback that exists for
 * exactly this case. Surfaces that draw their tone from baked vertex colours
 * (the niche conch, the drum) show it worst — the stand-in flashes up, then the
 * failed scan lands on top of it and the whole thing goes flat black.
 */
const failedTextures = new Set<string>();
const failureHandlers = new Map<string, (() => void)[]>();

/** run `fn` if `url` has already failed, or when it does */
function onTextureFailure(url: string, fn: () => void): void {
  if (failedTextures.has(url)) {
    fn();
    return;
  }
  const waiting = failureHandlers.get(url);
  if (waiting) waiting.push(fn);
  else failureHandlers.set(url, [fn]);
}

/**
 * THE HALF-SIZE SCAN, ON DEVICES THAT CANNOT HOLD THE FULL ONE.
 *
 * `scripts/optimize-textures-lean.mjs` writes a `.lean.jpg` beside every scan
 * at half its longest edge — a quarter of the pixels, so the 143 files fall
 * from about 487 MB resident to about 120 MB. That block is what remained
 * after the generated art was halved, and it is what an iPhone 11 still could
 * not hold: it rendered one frame and then lost its WebGL context, which is
 * Safari reclaiming GPU memory and leaves a frozen picture on screen.
 *
 * If a lean file is missing the load fails, and the FULL scan is fetched in
 * its place rather than leaving the surface black — the swap can never make a
 * texture disappear, only make it smaller.
 */
/**
 * HOW MANY SCANS ARE STILL IN THE AIR — read by the loading veil.
 *
 * Every surface is dressed in a painted stand-in the moment it is built and
 * swaps to its photographed scan when that lands, so a visitor let in too early
 * watches the walls change texture around them. The veil waits on this count
 * reaching zero (under its own cap — the long tail of scans is far too long to
 * hold a hall behind a curtain for, and the ones that miss the reveal simply
 * arrive as they always did).
 */
let inFlight = 0;

export function scansSettled(): boolean {
  return inFlight === 0;
}

function loadTexture(url: string, slot: MapSlot): THREE.Texture {
  const hit = textureCache.get(url);
  if (hit) return hit;
  const wanted = leanPath(url);
  const settle = () => {
    inFlight = Math.max(0, inFlight - 1);
  };
  const onError = () => {
    // the lean set is optional: fall back to the full scan before giving up
    if (wanted !== url) {
      loader.load(
        url,
        (full) => {
          tex.image = full.image;
          tex.needsUpdate = true;
          settle();
        },
        undefined,
        () => {
          fail();
          settle();
        },
      );
      return;
    }
    fail();
    settle();
  };
  const fail = () => {
    failedTextures.add(url);
    const waiting = failureHandlers.get(url);
    failureHandlers.delete(url);
    waiting?.forEach((fn) => fn());
  };
  inFlight += 1;
  const tex = loader.load(wanted, settle, undefined, onError);
  // Colour data decodes as sRGB; measurement data must stay linear. Getting
  // this backwards is why hand-built PBR scenes come out washed out or muddy.
  tex.colorSpace = SRGB_SLOTS.has(slot) ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  textureCache.set(url, tex);
  return tex;
}

/** a private copy so this material can carry its own repeat/offset/rotation */
function instance(master: THREE.Texture, uv: ResolvedUv): THREE.Texture {
  const t = master.clone();
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(uv.repeat[0], uv.repeat[1]);
  t.offset.set(uv.offset[0], uv.offset[1]);
  t.center.set(0.5, 0.5);
  t.rotation = uv.rotation;
  t.needsUpdate = true;
  return t;
}

/* ————— UV resolution ————— */

interface ResolvedUv {
  repeat: [number, number];
  offset: [number, number];
  rotation: number;
}

/**
 * Work out the tiling. `tilesPerMetre` with a surface `size` is preferred over
 * a fixed repeat for architecture: one limestone definition then serves a 2 m
 * pilaster and a 40 m wall at the same apparent grain, and the caller passes
 * only the dimensions it already knows.
 */
function resolveUv(def: MaterialDef, req: MaterialRequest): ResolvedUv {
  const uv = def.uv ?? {};
  let repeat: [number, number] = uv.repeat ?? [1, 1];
  if (req.repeat) {
    repeat = req.repeat;
  } else if (req.size && uv.tilesPerMetre) {
    repeat = [req.size[0] * uv.tilesPerMetre, req.size[1] * uv.tilesPerMetre];
  }
  return { repeat, offset: uv.offset ?? [0, 0], rotation: uv.rotation ?? 0 };
}

/* ————— parameter application ————— */

const SIDES = { front: THREE.FrontSide, back: THREE.BackSide, double: THREE.DoubleSide } as const;

function applyParams(mat: AnyStandardMaterial, p: MaterialParams): void {
  if (p.color !== undefined) mat.color.set(p.color);
  if (p.roughness !== undefined) mat.roughness = p.roughness;
  if (p.metalness !== undefined) mat.metalness = p.metalness;
  if (p.normalScale !== undefined) mat.normalScale.set(p.normalScale, p.normalScale);
  if (p.aoMapIntensity !== undefined) mat.aoMapIntensity = p.aoMapIntensity;
  if (p.displacementScale !== undefined) mat.displacementScale = p.displacementScale;
  if (p.displacementBias !== undefined) mat.displacementBias = p.displacementBias;
  if (p.emissive !== undefined) mat.emissive.set(p.emissive);
  if (p.emissiveIntensity !== undefined) mat.emissiveIntensity = p.emissiveIntensity;
  if (p.opacity !== undefined) mat.opacity = p.opacity;
  if (p.transparent !== undefined) mat.transparent = p.transparent;
  if (p.alphaTest !== undefined) mat.alphaTest = p.alphaTest;
  if (p.depthWrite !== undefined) mat.depthWrite = p.depthWrite;
  if (p.side !== undefined) mat.side = SIDES[p.side];
  if (p.vertexColors !== undefined) mat.vertexColors = p.vertexColors;

  const phys = mat as THREE.MeshPhysicalMaterial;
  if (phys.isMeshPhysicalMaterial) {
    if (p.transmission !== undefined) phys.transmission = p.transmission;
    if (p.thickness !== undefined) phys.thickness = p.thickness;
    if (p.ior !== undefined) phys.ior = p.ior;
    if (p.clearcoat !== undefined) phys.clearcoat = p.clearcoat;
    if (p.clearcoatRoughness !== undefined) phys.clearcoatRoughness = p.clearcoatRoughness;
    if (p.sheen !== undefined) phys.sheen = p.sheen;
    if (p.sheenColor !== undefined) phys.sheenColor.set(p.sheenColor);
    if (p.sheenRoughness !== undefined) phys.sheenRoughness = p.sheenRoughness;
    if (p.iridescence !== undefined) phys.iridescence = p.iridescence;
  }
}

/* ————— map application ————— */

const SLOT_TO_THREE: Record<Exclude<MapSlot, 'arm'>, keyof THREE.MeshPhysicalMaterial> = {
  albedo: 'map',
  normal: 'normalMap',
  roughness: 'roughnessMap',
  ao: 'aoMap',
  metalness: 'metalnessMap',
  height: 'displacementMap',
  emissive: 'emissiveMap',
  alpha: 'alphaMap',
};

/** the three slots one ARM file fills, in its channel order */
const ARM_SLOTS = ['ao', 'roughness', 'metalness'] as const;

/**
 * Dress a material in whatever is actually available: real scans for the slots
 * the manifest reports, the painted stand-in for albedo otherwise.
 *
 * Called twice in the normal case — once at construction (stand-in) and once
 * when the manifest resolves (upgrade). Both passes must be complete rather
 * than additive, or a material that loses a slot between runs keeps a stale map.
 */
function applyMaps(mat: AnyStandardMaterial, id: MaterialId, req: MaterialRequest): void {
  const def = getMaterialDef(id);
  const uv = resolveUv(def, req);
  // The manifest, not the definition, decides what exists and what it is
  // called — it is the only thing that has looked at the disk.
  const available = manifest?.[id] ?? {};
  const dir = assetDir(id);
  const set = (key: keyof THREE.MeshPhysicalMaterial, value: THREE.Texture | null) => {
    (mat as unknown as Record<string, unknown>)[key] = value;
  };

  let gotAlbedo = false;
  const armFile = available.arm;
  const wantsDisplacement = Boolean((req.overrides ?? def.params)?.displacementScale);

  for (const slot of Object.keys(SLOT_TO_THREE) as Exclude<MapSlot, 'arm'>[]) {
    const key = SLOT_TO_THREE[slot];
    // an ARM file supersedes any separate ao/roughness/metalness on disk
    if (armFile && (ARM_SLOTS as readonly string[]).includes(slot)) continue;
    // Height only bites on tessellated geometry, and none of this building is.
    // Skipping the SLOT rather than nulling the map afterwards matters: the
    // scans ship height maps, and loading one only to discard it was a real
    // download and a real GPU upload per material for nothing.
    if (slot === 'height' && !wantsDisplacement) {
      set(key, null);
      continue;
    }
    // the painted albedo is the design here, not a stand-in: leave the slot
    // unclaimed and let the fallback below fill it
    if (slot === 'albedo' && req.paintedAlbedo) continue;
    const file = available[slot];
    if (!file) {
      // only clear a slot the stand-in isn't about to fill
      if (slot !== 'albedo') set(key, null);
      continue;
    }
    const url = `${dir}/${file}`;
    const tex = instance(loadTexture(url, slot), uv);
    // aoMap defaults to the second UV set, which none of this geometry has.
    // Point it back at uv0 rather than duplicating an attribute everywhere.
    if (slot === 'ao') tex.channel = 0;
    set(key, tex);
    if (slot === 'albedo') {
      gotAlbedo = true;
      // ...but only optimistically: if the download fails, drop back to the
      // painted stand-in rather than leaving a blank map to render black
      if (def.fallback) {
        const fb = def.fallback;
        onTextureFailure(url, () => {
          const painted = paintFallback(fb.painter, fb.args);
          mat.map = painted ? instance(painted, uv) : null;
          if (req.emissiveFromAlbedo) mat.emissiveMap = mat.map;
          mat.needsUpdate = true;
        });
      }
    }
  }

  if (armFile) {
    // ONE texture object in all three slots. three.js samples .r for occlusion,
    // .g for roughness and .b for metalness, so the packed file is read
    // correctly by each without any shader work — and because it is the same
    // object, it uploads to the GPU once.
    const arm = instance(loadTexture(`${dir}/${armFile}`, 'arm'), uv);
    arm.channel = 0;
    set('aoMap', arm);
    set('roughnessMap', arm);
    set('metalnessMap', arm);
  }

  // Hand roughness and metalness over to the scans that now carry them. Both
  // slots MULTIPLY their scalar in three's shader, so a stand-in's hand-tuned
  // 0.88 would darken a measured 0.7 down to 0.62 — the exact opposite of the
  // intent, and the usual reason a scanned scene comes out looking varnished.
  const p = { ...(def.params ?? {}), ...(req.overrides ?? {}) };
  if (mat.roughnessMap) mat.roughness = p.roughnessScale ?? 1;
  if (mat.metalnessMap) mat.metalness = p.metalnessScale ?? 1;

  if (!gotAlbedo && def.fallback) {
    const painted = paintFallback(def.fallback.painter, def.fallback.args);
    mat.map = painted ? instance(painted, uv) : null;
  } else if (!gotAlbedo) {
    mat.map = null;
  }

  // Last, so it picks up whichever albedo won above — the scan, the painted
  // stand-in, or nothing. Same texture object in both slots: no second upload.
  if (req.emissiveFromAlbedo) mat.emissiveMap = mat.map;

  mat.needsUpdate = true;
}

/* ————— the registry itself ————— */

interface LiveEntry {
  material: AnyStandardMaterial;
  id: MaterialId;
  request: MaterialRequest;
}

const live = new Map<string, LiveEntry>();

function cacheKey(id: MaterialId, req: MaterialRequest): string {
  const uv = resolveUv(getMaterialDef(id), req);
  const o = req.overrides ? JSON.stringify(req.overrides) : '';
  const e = `${req.emissiveFromAlbedo ? '|em' : ''}${req.paintedAlbedo ? '|pa' : ''}`;
  return `${id}|${uv.repeat[0].toFixed(3)},${uv.repeat[1].toFixed(3)}|${uv.offset.join(',')}|${uv.rotation}|${o}${e}`;
}

/**
 * Get a material. Cached by id plus tiling plus overrides, so the hundreds of
 * shelves that all want the same walnut at the same scale share one material
 * and therefore one draw-call state.
 */
export function getMaterial(id: MaterialId, req: MaterialRequest = {}): AnyStandardMaterial {
  const key = cacheKey(id, req);
  const hit = live.get(key);
  if (hit) return hit.material;

  const def = getMaterialDef(id);
  const mat: AnyStandardMaterial = def.physical
    ? new THREE.MeshPhysicalMaterial()
    : new THREE.MeshStandardMaterial();
  mat.name = id;
  applyParams(mat, def.params ?? {});
  if (req.overrides) applyParams(mat, req.overrides);
  applyMaps(mat, id, req);
  applyEnvironment(mat, def);

  live.set(key, { material: mat, id, request: req });
  return mat;
}

/** Drop everything. Only for hot-reload and teardown. */
export function disposeMaterials(): void {
  for (const { material } of live.values()) material.dispose();
  for (const tex of textureCache.values()) tex.dispose();
  live.clear();
  textureCache.clear();
}

/** What the debug inspector reads: which surfaces are still on stand-ins. */
export function materialStatus(): { id: MaterialId; label: string; slots: MapSlot[] }[] {
  return MATERIAL_IDS.map((id) => ({
    id,
    label: getMaterialDef(id).label,
    slots: Object.keys(manifest?.[id] ?? {}) as MapSlot[],
  }));
}
