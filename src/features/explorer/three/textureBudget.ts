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
function detect(): boolean {
  if (typeof window === 'undefined') return false;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === 'number' && memory <= 4) return true;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.screen.width, window.screen.height) <= 900;
  return coarse && small;
}

export const LEAN_TEXTURES = detect();

/** the linear scale every generated canvas is painted at */
export const TEXTURE_SCALE = LEAN_TEXTURES ? 0.5 : 1;

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
export function leanPath(url: string): string {
  if (!LEAN_TEXTURES) return url;
  if (!url.includes('/textures/') || !url.endsWith('.jpg')) return url;
  return url.replace(/\.jpg$/, '.lean.jpg');
}
