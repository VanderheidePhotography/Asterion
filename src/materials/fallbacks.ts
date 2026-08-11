import * as THREE from 'three';
import {
  ceremonialWay,
  cosmographiaMandala,
  observatoryRoundel,
} from '../features/explorer/three/cosmographiaArt';
import {
  bronzeFrieze,
  celestialRoundels,
  constellationPlaques,
} from '../features/explorer/three/drumUpperArt';
import {
  fernSheet,
  palmSheet,
  shrubSheet,
  soilSheet,
  terracotta,
  trailSheet,
} from '../features/explorer/three/floraArt';
import {
  bark,
  bookSpines,
  conchCoffers,
  domeCoffers,
  flutes,
  forgedMetal,
  ivyRunner,
  leafCluster,
  leather,
  conchMosaic,
  nicheDamask,
  rugRound,
  rugRunner,
  starryRobe,
  stainedGlassArch,
  stoneBlocks,
  vaultCoffer,
  wallPanels,
  woodBeam,
  woodPlanks,
} from '../features/explorer/three/textures';

/**
 * The stand-ins.
 *
 * A material definition names a painter here; until a real scan appears in
 * `public/textures/<id>/`, that painter supplies the albedo. This is deliberate
 * and permanent, not scaffolding: it means a clean checkout renders a fully
 * dressed museum with zero downloads, and it means dropping in one 4K scan
 * upgrades exactly one surface without leaving the other thirty-nine bare.
 *
 * Painters produce ALBEDO ONLY. There is no honest way to invent a normal or
 * roughness map from a colour canvas — a derived bump would fight the real one
 * the moment a scan arrives. Surfaces without scans therefore run on their
 * scalar `roughness`/`metalness`, which is what the library's params are tuned
 * for.
 */

type Painter = (...args: never[]) => THREE.Texture;

/** A flat field. Used where a definition wants nothing but its scalar params —
 *  metals especially, whose whole character is roughness and reflection rather
 *  than surface colour. */
function solid(hex = '#808080'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 4, 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const solidCache = new Map<string, THREE.CanvasTexture>();

const PAINTERS: Record<string, Painter> = {
  bark,
  bookSpines,
  // the upper drum's carving — see drumUpperArt.ts. Like the floor's diagrams
  // these three draw ORNAMENT rather than a material, so a scan dropped over
  // them would replace the frieze with a photograph of somebody's wall; if
  // real bronze ever lands here it wants to land on normal/roughness alone.
  bronzeFrieze,
  celestialRoundels,
  constellationPlaques,
  // the floor — see cosmographiaArt.ts. These three are stand-ins in exactly
  // the same sense as the rest, but they are the only ones drawing a diagram
  // rather than a material: a scan dropped over the mandala would replace the
  // museum's astronomical plan with a photograph of somebody's carpet, so if a
  // real weave ever lands here it wants to land on normal/roughness alone.
  ceremonialWay,
  cosmographiaMandala,
  observatoryRoundel,
  // the planting — see floraArt.ts. `leafCluster` below is what these replaced
  // and is kept only because `misc_leaves` still names it.
  fernSheet,
  palmSheet,
  shrubSheet,
  soilSheet,
  terracotta,
  trailSheet,
  conchCoffers,
  domeCoffers,
  flutes,
  forgedMetal,
  ivyRunner,
  leafCluster,
  leather,
  conchMosaic,
  nicheDamask,
  rugRound,
  rugRunner,
  starryRobe,
  stainedGlassArch,
  stoneBlocks,
  vaultCoffer,
  wallPanels,
  woodBeam,
  woodPlanks,
} as unknown as Record<string, Painter>;

/**
 * Resolve a fallback to a texture, or to null when the definition asks for
 * `none` — glass and decals want no stand-in at all, because a grey square
 * where a star chart should be reads far worse than an empty surface.
 */
export function paintFallback(painter: string, args: (string | number)[] = []): THREE.Texture | null {
  if (painter === 'none') return null;
  if (painter === 'solid') {
    const hex = String(args[0] ?? '#808080');
    let hit = solidCache.get(hex);
    if (!hit) {
      hit = solid(hex);
      solidCache.set(hex, hit);
    }
    return hit;
  }
  const fn = PAINTERS[painter];
  if (!fn) {
    console.warn(`[materials] unknown fallback painter "${painter}"`);
    return null;
  }
  return fn(...(args as never[]));
}
