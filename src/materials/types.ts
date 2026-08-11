import type * as THREE from 'three';

/**
 * The shape of the material library.
 *
 * Everything here is data, not code. `library.json` is the single catalogue of
 * every surface in the museum; this file only says what a catalogue entry is
 * allowed to contain. The point of the split is that swapping a 512px painted
 * stand-in for a 4K photogrammetric scan is a file drop plus at most one edited
 * number — never a code change, never a recompile of the scene.
 */

/** The map slots a surface can carry. `albedo` and `emissive` are colour data
 *  and decode as sRGB; everything else is measurement data and must stay
 *  linear, which is the single most common way a PBR pipeline goes wrong. */
export type MapSlot =
  | 'albedo'
  | 'normal'
  | 'roughness'
  | 'ao'
  | 'metalness'
  | 'height'
  | 'emissive'
  | 'alpha'
  /**
   * ARM: occlusion in R, roughness in G, metalness in B — one image carrying
   * three maps. This is exactly the channel layout three.js already reads for
   * `aoMap`, `roughnessMap` and `metalnessMap`, so a single ARM file can be
   * assigned to all three slots: a third of the bytes, a third of the requests,
   * and one GPU upload instead of three. Poly Haven publishes it as standard.
   *
   * When present it wins over separate ao/roughness/metalness files.
   */
  | 'arm';

export const SRGB_SLOTS: ReadonlySet<MapSlot> = new Set<MapSlot>(['albedo', 'emissive']);

/** Broad groupings, used for bulk tuning and for the debug inspector. */
export type MaterialFamily =
  | 'wood'
  | 'stone'
  | 'metal'
  | 'book'
  | 'fabric'
  | 'glass'
  | 'decal'
  | 'misc';

/**
 * A procedural stand-in. Until a real scan is dropped into
 * `public/textures/<id>/`, the surface is painted at runtime by one of the
 * canvas painters in `three/textures.ts`. This is what keeps the museum fully
 * dressed on a clean checkout — the pipeline degrades to what the project
 * already had rather than to untextured grey.
 */
export interface FallbackDef {
  /** key into the painter table in `fallbacks.ts` */
  painter: string;
  /** positional arguments forwarded to that painter */
  args?: (string | number)[];
}

/** Scalar material parameters. Names mirror three's own so overrides compose. */
export interface MaterialParams {
  color?: string;
  /**
   * Roughness when the surface is on its painted stand-in — it has to carry the
   * whole look on its own, so these sit high and matte.
   *
   * The moment a real roughness or ARM map lands this is REPLACED, not blended:
   * three multiplies `roughness` by the map's green channel, so leaving stone at
   * 0.88 against a scan reading 0.7 would land at 0.62 and make centuries-old
   * masonry shinier than the day it was cut. See `roughnessScale`.
   */
  roughness?: number;
  metalness?: number;
  /**
   * Multiplier applied to a roughness/ARM map, when one exists. Defaults to 1 —
   * the scan is trusted. Drop below 1 only for something genuinely polished:
   * a brass edge that hands have kept bright, a lens, fresh wax.
   */
  roughnessScale?: number;
  /** the same, for a metalness/ARM map. Defaults to 1. */
  metalnessScale?: number;
  /** multiplier on the normal map's strength, both axes */
  normalScale?: number;
  aoMapIntensity?: number;
  /** left at 0 unless the receiving geometry is actually tessellated */
  displacementScale?: number;
  displacementBias?: number;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  transparent?: boolean;
  /** MeshPhysicalMaterial only — ignored unless `physical` is set */
  transmission?: number;
  thickness?: number;
  ior?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  sheen?: number;
  sheenColor?: string;
  sheenRoughness?: number;
  iridescence?: number;
  /** cut-out foliage, decals and glass all want this */
  alphaTest?: number;
  depthWrite?: boolean;
  side?: 'front' | 'back' | 'double';
  /**
   * Read tone from baked vertex colours. The scene has no ambient occlusion
   * pass, so several shells (niche barrels, conches) carry their own baked
   * shading in the attribute — without this flag they render flat and the
   * hollow disappears.
   */
  vertexColors?: boolean;
}

/** How the maps are laid onto the surface. */
export interface UvDef {
  /** fixed tiling, when a surface has authored UVs (a rug, a niche hanging) */
  repeat?: [number, number];
  /**
   * Tiles per metre. Preferred over `repeat` for architecture: it lets one
   * limestone definition serve a 2 m pilaster and a 40 m wall at the same
   * apparent grain, with the caller passing only the surface's size.
   */
  tilesPerMetre?: number;
  offset?: [number, number];
  /** radians */
  rotation?: number;
}

export interface MaterialDef {
  /** human label, for the debug inspector and for documentation */
  label: string;
  family: MaterialFamily;
  /**
   * Asset folder under `public/textures/`. Defaults to the family's own folder
   * (see `categories` in library.json); set explicitly for the finer buckets —
   * Leather, Rugs, Paper — that share a family with something else.
   */
  category?: string;
  /** promote to MeshPhysicalMaterial — needed for transmission, sheen, clearcoat */
  physical?: boolean;
  /**
   * Which map slots this surface WANTS. Advisory only — the loader takes both
   * the slot list and the real filenames from `manifest.json`, because the
   * scanner is the only thing that has looked at the disk. Keep it accurate as
   * documentation of intent; it is not what gets fetched.
   */
  maps?: Partial<Record<MapSlot, string>>;
  params?: MaterialParams;
  uv?: UvDef;
  fallback?: FallbackDef;
  /** free-form note explaining what the surface is meant to feel like */
  note?: string;
}

export interface MaterialLibrary {
  /** texture root, relative to the site root */
  root: string;
  /** family → asset folder name */
  categories: Record<string, string>;
  materials: Record<string, MaterialDef>;
}

/**
 * What ships in `public/textures/manifest.json`: for each material that has
 * scans on disk, the slots it supplies and the ACTUAL filename of each.
 * Generated by `npm run textures:scan`.
 *
 * A manifest rather than blind fetching, because probing sixty materials × nine
 * slots means five hundred 404s in the network panel on every cold load, which
 * buries the errors that matter.
 *
 * It carries filenames rather than just slot names because the scanner is the
 * only thing that has actually looked at the disk. `MaterialDef.maps` says
 * which slots a surface WANTS; this says what is really there and what it is
 * called. When the two disagree — a pack that ships `basecolor.png` where the
 * definition guessed `albedo.jpg` — reality wins and nothing 404s.
 */
export type TextureManifest = Record<string, Partial<Record<MapSlot, string>>>;

/** Options accepted when pulling a material out of the registry. */
export interface MaterialRequest {
  /** override the definition's tiling for this instance */
  repeat?: [number, number];
  /** surface size in metres; combined with `tilesPerMetre` to derive repeat */
  size?: [number, number];
  /** per-instance scalar overrides — tinting one shelf darker than its siblings */
  overrides?: MaterialParams;
  /**
   * Feed the albedo map into the EMISSIVE slot as well.
   *
   * For surfaces that must carry their own light because nothing in the scene
   * reaches them — the niche conches are the case this exists for. A flat
   * `emissive` on such a surface is worse than the dark it replaces: the glow
   * is uniform, so it swamps the map and the plaster arrives as one plain
   * colour. Multiplied by the albedo instead, the self-light carries the
   * material's own grain and the surface still reads as plaster.
   *
   * It cannot be done at the call site. `applyMaps` runs a second time when the
   * manifest resolves and CLEARS every slot the manifest does not list, so a
   * hand-assigned `emissiveMap` survives exactly until the scans land.
   */
  emissiveFromAlbedo?: boolean;
  /**
   * Keep the definition's painted albedo even when a scan is on disk.
   *
   * For the few surfaces whose fallback painter is not a stand-in but the
   * DESIGN — the niche conch's coffer grid, drawn to fan on the quarter
   * sphere's own UVs. A scan can say what plaster is made of; it cannot put
   * coffers in a dome. Without this the scan silently wins the albedo slot the
   * moment the manifest resolves and the ornament vanishes, which is exactly
   * what happened to the conches.
   *
   * The scan's normal, roughness and AO are still used — the grain is real,
   * only the pattern is ours.
   */
  paintedAlbedo?: boolean;
}

export type AnyStandardMaterial = THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
