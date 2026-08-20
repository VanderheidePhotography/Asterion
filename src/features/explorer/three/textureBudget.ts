import leanModels from '../../../../public/models/lean-manifest.json';

/**
 * HOW BIG THE GENERATED TEXTURES ARE ALLOWED TO BE ON THIS DEVICE.
 *
 * The museum paints nearly everything it shows: the floor mandala, the dome's
 * gloria, the globes, the wall and timber surfaces, every label. Painted at
 * desktop sizes that came to about 1.4 GB of texture memory, and an iPhone 11
 * does not have it. Safari does not degrade there — it kills the tab, which
 * the visitor sees as "a problem repeatedly occurred" after the hall has
 * flashed up for half a second. There is no partial credit: either it fits or
 * the site does not exist on that device.
 *
 * So on a small, touch-driven device every generated canvas is painted at HALF
 * its linear size, which is a QUARTER of the pixels. This is the one number
 * that does it, and it is deliberately a scale rather than a cap: the art
 * keeps its proportions and its relative detail, so the mandala is still the
 * most detailed thing on the floor and a label is still sharper than the
 * plaster behind it. Everything just lands one octave lower.
 *
 * What this is NOT: it does not remove a light, an effect, a prop or a
 * feature. A phone renders the same building with the same lighting as a
 * desktop, drawn from smaller pictures. The visible cost is that the floor
 * mandala and small type are a little softer, and only on the devices that
 * could not otherwise show them at all.
 */

/**
 * Is this a device we should assume cannot hold a desktop's worth of texture?
 *
 * Deliberately crude, and deliberately not a user-agent sniff. `deviceMemory`
 * is the direct answer but Safari does not implement it — which is exactly
 * where we need one — so a coarse pointer on a small screen carries the test.
 * That is every phone and small tablet, and essentially no desktop: a laptop
 * with a touchscreen reports a FINE pointer for its trackpad.
 *
 * Evaluated once. It cannot change without a reload, and a texture already
 * painted is not going to be repainted at a different size anyway.
 */
/*
 * `?lean` and `?rich` force the answer, and exist for one reason: the phone
 * path could not be looked at anywhere except on a phone. `window.screen` is
 * the physical display, so no amount of resizing a desktop window reaches this
 * branch — every measurement of the lean load had to be taken through a cable,
 * which is why it went unmeasured. Same convention as `?diag`: nobody
 * stumbles into it, and it costs one query read at startup.
 */
function detect(): boolean {
  if (typeof window === 'undefined') return false;
  const q = new URLSearchParams(window.location.search);
  if (q.has('lean')) return true;
  if (q.has('rich')) return false;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === 'number' && memory <= 4) return true;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.screen.width, window.screen.height) <= 900;
  return coarse && small;
}

export const LEAN_TEXTURES = detect();

/** which figures have a `.lean.glb` on disk — written by the script that
 *  builds them, imported rather than fetched so it costs no round trip */
const LEAN_MODELS = new Set<string>(leanModels);

/**
 * The linear scale every generated canvas is painted at.
 *
 * 0.5 → 0.42 on 2026-08-13, on the user's call, as the last dial in a pass on
 * mobile load time. It is the same lever the header describes, turned once
 * more: painting cost, upload cost and texture memory all fall with the SQUARE
 * of this number, so 0.42 is about 30% less of all three than 0.5 — and unlike
 * everything else in that pass, it is a change to how the museum LOOKS on a
 * phone rather than to when it appears.
 *
 * What it softens: the floor mandala, the dome's gloria, the globes and the
 * painted plaster and timber. What it does not touch: type, which carries its
 * own density floor (see TextSprite's RASTER_FLOOR and MIN_PX_PER_METRE), and
 * the photographed scans, which are files rather than canvases.
 *
 * One number, one line, reversible.
 */
export const TEXTURE_SCALE = LEAN_TEXTURES ? 0.42 : 1;

/**
 * Scale one canvas dimension, never below 2px and always whole.
 *
 * Rounded rather than floored so a 1×N strip does not collapse to nothing,
 * and clamped because a canvas of zero width throws rather than degrades.
 */
export function texPx(px: number): number {
  return Math.max(2, Math.round(px * TEXTURE_SCALE));
}

/**
 * HOW MANY MARKS TO SCATTER ON A CANVAS THIS SIZE.
 *
 * The companion to `texPx`, and the half of the budget that was missing. A
 * phone's canvases are painted at TEXTURE_SCALE, but the painters kept
 * scattering the SAME NUMBER of speckles, chisel marks and grain streaks over
 * them — so the cost never fell, and the density per pixel went up by the
 * square of the scale: at 0.42 a stone field drawn with 1,200 flecks is
 * carrying 5.7 times the fleck density it was drawn to have, most of them
 * landing sub-pixel where they average out into flat noise.
 *
 * Measured on the production lean build: painting canvases is 798 ms of a
 * 2,071 ms pre-frame build, and 473 ms of that is two atlases of carved stone
 * on the upper drum. That is the largest identified item in the wait, and
 * nearly all of it is scatter loops.
 *
 * Scaling the COUNT by the AREA ratio keeps the marks-per-pixel identical, so
 * the surface looks the same and costs a fifth as much. Never below 8, because
 * a texture of four flecks reads as a mistake rather than as stone.
 */
export function texMarks(n: number): number {
  if (!LEAN_TEXTURES) return n;
  return Math.max(8, Math.round(n * TEXTURE_SCALE * TEXTURE_SCALE));
}

/**
 * The half-size scan to load in place of a full one, on a lean device.
 *
 * `scripts/optimize-textures-lean.mjs` writes a `.lean.jpg` beside every file
 * under `public/textures`, at half its longest edge. This is the only place
 * that knows the naming, and every loader in the app should go through it —
 * the registry, and the four components that reach for a `TextureLoader`
 * directly. Miss one and it quietly keeps the full-size upload, which is what
 * happened first time: six files, ~200 MB, still resident on a phone.
 *
 * Restricted to `/textures/`. The grimoire plates under `/art/` and the tarot
 * deck have no lean set — they are fetched one book at a time rather than all
 * at once, so they never sit in memory together.
 */
/**
 * THE SMALLER CARVING TO LOAD IN PLACE OF A FULL ONE, on a lean device.
 *
 * `scripts/optimize-models-lean.mjs` writes a `.lean.glb` beside each figure:
 * a quarter of the triangles and maps at half their edge, which takes the
 * statuary a phone eventually pulls from about 15 MB to about 4.4 MB. Like
 * `leanPath` above, this is the only place that knows the naming.
 *
 * GATED ON A MANIFEST, and that is not caution for its own sake. A `.glb` that
 * 404s throws inside `useGLTF`; Suspense does not catch a throw, so it goes to
 * the scene's error boundary and the whole museum is replaced by an apology —
 * one missing file would take the building down on precisely the devices this
 * exists to help. So a URL is only ever rewritten for a figure the manifest
 * says was actually built, and a figure added without running the script
 * simply serves its full model to everyone, exactly as before this existed.
 */
export function leanModelPath(url: string): string {
  if (!LEAN_TEXTURES) return url;
  const m = /^\/models\/([^/]+)\.glb$/.exec(url);
  if (!m || !LEAN_MODELS.has(m[1])) return url;
  return `/models/${m[1]}.lean.glb`;
}

export function leanPath(url: string): string {
  if (!LEAN_TEXTURES) return url;
  if (!url.includes('/textures/') || !url.endsWith('.jpg')) return url;
  return url.replace(/\.jpg$/, '.lean.jpg');
}
