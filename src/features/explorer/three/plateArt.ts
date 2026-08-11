import * as THREE from 'three';

/**
 * Shared machinery for the great orrery's PLATES.
 *
 * The instrument used to show three charts. It now shows seven, and two things
 * had to be built before that was safe:
 *
 * 1. A CACHE THAT LETS GO. Every full-table sheet is a 3072² canvas — about
 *    38 MB once it is uploaded and mipmapped, and several plates bake more than
 *    one. Three sheets were tolerable to keep resident for the life of the page;
 *    seven charts' worth is not. So plates are cached per MODE, and changing the
 *    plate disposes every sheet belonging to a chart that is no longer up. A
 *    visitor pays the bake again if they come back, which costs a few hundred
 *    milliseconds once, against carrying a quarter of a gigabyte of texture all
 *    session for charts nobody is looking at.
 *
 * 2. ONE ENGRAVING HAND. The charts have to look like plates of one instrument
 *    made in one workshop, not seven textures by seven authors. Everything below
 *    is the vocabulary they share: the dark-stroke-plus-bright-highlight pair
 *    that reads as CUT rather than printed, letters set around an arc, ruled
 *    circles, degree scales, brass and parchment and night grounds.
 */

/* ————————————————————————————————————————————————————————————————
 * the plate cache
 * ———————————————————————————————————————————————————————————————— */

/** the standard full-table sheet, in pixels. 3072 puts about 400 px on a metre
 *  of a seven-and-a-half-metre table, which is where engraved lettering stops
 *  turning to mush at leaning distance. */
export const PLATE_S = 3072;

interface Held {
  mode: string;
  tex: THREE.CanvasTexture;
}

const held = new Map<string, Held>();

/**
 * Fetch (or bake) a plate texture, tagged with the mode that owns it.
 *
 * The baker returns a canvas rather than a texture so this is the only place
 * that decides colour space, anisotropy and filtering — nine plates disagreeing
 * about anisotropy is exactly the kind of drift that makes one chart look
 * softer than its neighbours for no reason anyone can name.
 */
export function plate(mode: string, key: string, bake: () => HTMLCanvasElement): THREE.CanvasTexture {
  const id = `${mode}/${key}`;
  const hit = held.get(id);
  if (hit) return hit.tex;
  const tex = new THREE.CanvasTexture(bake());
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  held.set(id, { mode, tex });
  return tex;
}

/**
 * The instrument has changed plate: let go of everything the other charts baked.
 *
 * Call this from an effect AFTER the new chart has mounted, so the outgoing
 * components have already unmounted and cannot be holding a texture we are
 * about to dispose.
 */
export function keepOnlyPlates(mode: string) {
  for (const [id, h] of held) {
    if (h.mode === mode) continue;
    h.tex.dispose();
    held.delete(id);
  }
}

/** how much texture the cache is currently sitting on, for the perf budget */
export function plateCount(): number {
  return held.size;
}

/* ————————————————————————————————————————————————————————————————
 * the engraving hand
 * ———————————————————————————————————————————————————————————————— */

export const SERIF = '"Cormorant Garamond", "Iowan Old Style", Georgia, serif';
/** the face the zodiac and planetary seals are set in. The U+FE0E variation
 *  selector has to follow every glyph or macOS swaps in its colour-emoji tiles
 *  and the chart sprouts cartoon planets — see `sym()`. */
export const SYMBOL = '"Segoe UI Symbol", "Arial Unicode MS", serif';

/** pin a symbol to its TEXT presentation */
export const sym = (glyph: string) => `${glyph}︎`;

/** a fresh square canvas and its 2d context */
export function square(S = PLATE_S): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  return [c, c.getContext('2d')!];
}

/** a small deterministic PRNG, so a plate bakes the same stars every time */
export function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/**
 * Cut a line of type into the plate.
 *
 * The dark stroke laid a pixel or two BELOW a bright one is the whole trick:
 * it is how a burin leaves a groove with a lit upper wall, and it is the only
 * treatment that still reads as engraving at the distance a visitor actually
 * stands from a seven-metre table. Printed flat type on brass reads as a decal.
 */
export function engrave(
  x: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  size: number,
  opts: { font?: string; dark?: string; light?: string; alpha?: number; align?: CanvasTextAlign } = {},
) {
  const { font = SERIF, dark = '#2c2010', light = '#ffeec2', alpha = 1, align = 'center' } = opts;
  x.save();
  x.font = `${size}px ${font}`;
  x.textAlign = align;
  x.textBaseline = 'middle';
  x.globalAlpha = alpha * 0.9;
  x.fillStyle = dark;
  x.fillText(text, cx, cy + Math.max(1.5, size * 0.035));
  x.globalAlpha = alpha;
  x.fillStyle = light;
  x.fillText(text, cx, cy - Math.max(1, size * 0.022));
  x.restore();
}

/**
 * Letter a string around an arc, each glyph turned to stand on the circle.
 *
 * Letter-spacing has to be worked out in RADIANS from each glyph's own width,
 * or an 'i' and a 'W' take the same arc and the line visibly limps.
 */
export function arcText(
  x: CanvasRenderingContext2D,
  C: number,
  text: string,
  radius: number,
  centreAngle: number,
  size: number,
  colour: string,
  alpha = 1,
  flip = false,
  font = SERIF,
  tracking = 0.24,
) {
  x.save();
  x.font = `${size}px ${font}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = colour;
  x.globalAlpha = alpha;
  const widths = [...text].map((ch) => x.measureText(ch).width + size * tracking);
  const total = widths.reduce((a, b) => a + b, 0);
  let a = centreAngle - (flip ? -1 : 1) * (total / 2 / radius);
  for (let i = 0; i < text.length; i++) {
    const step = widths[i] / radius;
    a += (flip ? -1 : 1) * (step / 2);
    x.save();
    x.translate(C + Math.cos(a) * radius, C + Math.sin(a) * radius);
    x.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2));
    x.fillText(text[i], 0, 0);
    x.restore();
    a += (flip ? -1 : 1) * (step / 2);
  }
  x.restore();
}

/** the same, cut rather than painted: two passes at a hair's offset */
export function arcEngrave(
  x: CanvasRenderingContext2D,
  C: number,
  text: string,
  radius: number,
  centreAngle: number,
  size: number,
  dark = '#2c2010',
  light = '#ffeec2',
  alpha = 1,
  flip = false,
  font = SERIF,
) {
  arcText(x, C, text, radius + (flip ? -2 : 2), centreAngle, size, dark, alpha * 0.85, flip, font);
  arcText(x, C, text, radius, centreAngle, size, light, alpha, flip, font);
}

/** a ruled circle, the instrument-maker's basic mark */
export function ruleCircle(
  x: CanvasRenderingContext2D,
  C: number,
  r: number,
  colour: string,
  alpha = 1,
  width = 2,
  dash?: number[],
) {
  x.save();
  if (dash) x.setLineDash(dash);
  x.strokeStyle = colour;
  x.globalAlpha = alpha;
  x.lineWidth = width;
  x.beginPath();
  x.arc(C, C, r, 0, Math.PI * 2);
  x.stroke();
  x.restore();
}

/** a double rule with a hairline between, the way a plate's borders are drawn */
export function bandRule(
  x: CanvasRenderingContext2D,
  C: number,
  inner: number,
  outer: number,
  colour: string,
  alpha = 0.75,
) {
  ruleCircle(x, C, outer, colour, alpha, 3);
  ruleCircle(x, C, inner, colour, alpha, 3);
  ruleCircle(x, C, (inner + outer) / 2, colour, alpha * 0.35, 1);
}

/** a degree scale between two radii: fine ticks, heavier every `major` degrees */
export function degreeScale(
  x: CanvasRenderingContext2D,
  C: number,
  inner: number,
  outer: number,
  colour: string,
  step = 2.5,
  major = 30,
  alpha = 1,
) {
  x.save();
  x.strokeStyle = colour;
  for (let d = 0; d < 360; d += step) {
    const a = (d / 180) * Math.PI;
    const big = Math.abs(d % major) < 1e-6;
    const mid = Math.abs(d % 10) < 1e-6;
    const r0 = big ? inner : outer - (outer - inner) * (mid ? 0.62 : 0.34);
    x.globalAlpha = (big ? 0.85 : mid ? 0.55 : 0.35) * alpha;
    x.lineWidth = big ? 3 : mid ? 2 : 1.2;
    x.beginPath();
    x.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0);
    x.lineTo(C + Math.cos(a) * outer, C + Math.sin(a) * outer);
    x.stroke();
  }
  x.restore();
}

/** the night ground the sky plates stand on: deepest at the rim, breathing
 *  at the heart, so the black is never flat */
export function nightGround(x: CanvasRenderingContext2D, S: number, tone = '#161d33') {
  const C = S / 2;
  const g = x.createRadialGradient(C, C, 0, C, C, C);
  g.addColorStop(0, tone);
  g.addColorStop(0.55, '#0c1122');
  g.addColorStop(0.88, '#070a15');
  g.addColorStop(1, '#04060c');
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
}

/** sized parchment: a warm ground with the tooth and the foxing of old paper */
export function parchment(x: CanvasRenderingContext2D, S: number, base = '#c9b489', edge = '#8d7548') {
  const C = S / 2;
  const g = x.createRadialGradient(C, C, S * 0.06, C, C, C);
  g.addColorStop(0, base);
  g.addColorStop(0.72, base);
  g.addColorStop(1, edge);
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  const rng = seeded(4211);
  // the tooth
  x.save();
  for (let i = 0; i < 22000; i++) {
    const px = rng() * S;
    const py = rng() * S;
    x.globalAlpha = 0.02 + rng() * 0.05;
    x.fillStyle = rng() < 0.5 ? '#6c5730' : '#e6d6ae';
    x.fillRect(px, py, 1.6, 1.6);
  }
  // the foxing
  for (let i = 0; i < 90; i++) {
    const px = rng() * S;
    const py = rng() * S;
    const r = 6 + rng() * 46;
    const fg = x.createRadialGradient(px, py, 0, px, py, r);
    fg.addColorStop(0, 'rgba(120,86,44,0.14)');
    fg.addColorStop(1, 'rgba(120,86,44,0)');
    x.globalAlpha = 0.5;
    x.fillStyle = fg;
    x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  x.restore();
  x.globalAlpha = 1;
}

/** a lathe-turned brass ground for a plate that is meant to be metal */
export function brassGround(x: CanvasRenderingContext2D, S: number, warm = false) {
  const C = S / 2;
  /* Kept DARK on purpose. A plate baked at anything like the value of real
     polished brass comes back off the table as a flat sheet of gold with the
     engraving invisible in it: the room's own lamps, the material's specular
     and the emissive map all add on top of the canvas, and the fine line work
     is the first thing to go. A plate should bake at about the value of brass
     in shadow and let the room put the shine back. */
  const g = x.createRadialGradient(C * 0.72, C * 0.6, 0, C, C, C * 1.25);
  if (warm) {
    g.addColorStop(0, '#8a6636');
    g.addColorStop(0.45, '#6b4e26');
    g.addColorStop(0.82, '#4c3819');
    g.addColorStop(1, '#2c200e');
  } else {
    g.addColorStop(0, '#6b5c33');
    g.addColorStop(0.45, '#544728');
    g.addColorStop(0.82, '#3c331c');
    g.addColorStop(1, '#241e10');
  }
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  // the concentric turning marks a plate carries from the lathe
  const rng = seeded(90210);
  x.save();
  x.globalCompositeOperation = 'overlay';
  for (let i = 0; i < 340; i++) {
    const r = rng() * C;
    x.globalAlpha = 0.02 + rng() * 0.05;
    x.strokeStyle = rng() < 0.5 ? '#ffe9b8' : '#3a2c14';
    x.lineWidth = 0.6 + rng() * 1.8;
    x.beginPath();
    x.arc(C, C, r, rng() * 6.28, rng() * 6.28 + 1 + rng() * 4);
    x.stroke();
  }
  x.restore();
  x.globalAlpha = 1;
}

/** fixed stars over a night plate, with a few engraver's cross-flares so the
 *  eye has somewhere to settle */
export function starfield(
  x: CanvasRenderingContext2D,
  S: number,
  count = 900,
  flares = 26,
  inner = 0,
  outer = 0.985,
) {
  const C = S / 2;
  const rng = seeded(977);
  for (let i = 0; i < count; i++) {
    const sx = rng() * S;
    const sy = rng() * S;
    const d = Math.hypot(sx - C, sy - C) / C;
    if (d > outer || d < inner) continue;
    x.globalAlpha = 0.1 + rng() * 0.55;
    x.fillStyle = rng() < 0.22 ? '#cfe0ff' : '#f5efdd';
    x.beginPath();
    x.arc(sx, sy, 0.5 + rng() * 1.5, 0, Math.PI * 2);
    x.fill();
  }
  for (let i = 0; i < flares; i++) {
    const a = rng() * Math.PI * 2;
    const rr = (inner + rng() * (outer - inner)) * C;
    const sx = C + Math.cos(a) * rr;
    const sy = C + Math.sin(a) * rr;
    const len = 5 + rng() * 9;
    x.globalAlpha = 0.5 + rng() * 0.4;
    x.strokeStyle = '#fff6de';
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(sx - len, sy);
    x.lineTo(sx + len, sy);
    x.moveTo(sx, sy - len);
    x.lineTo(sx, sy + len);
    x.stroke();
    x.fillStyle = '#fffdf2';
    x.beginPath();
    x.arc(sx, sy, 1.9, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
}

/**
 * A lettered cartouche: the plate's own title block.
 *
 * Every engraved chart of this period has one, and it is the single cheapest
 * thing that makes a baked texture read as a DOCUMENT rather than as wallpaper
 * — it tells the eye that somebody drew this, and signed it.
 */
export function cartouche(
  x: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  lines: { text: string; size: number; gap?: number }[],
  opts: { ink?: string; ground?: string; rule?: string; alpha?: number } = {},
) {
  const { ink = '#f4e2b4', ground = 'rgba(10,12,22,0.62)', rule = '#c9a648', alpha = 1 } = opts;
  x.save();
  x.globalAlpha = alpha;
  x.fillStyle = ground;
  x.beginPath();
  // clipped corners, the way a plate's title block is cut
  const k = Math.min(w, h) * 0.16;
  x.moveTo(cx - w / 2 + k, cy - h / 2);
  x.lineTo(cx + w / 2 - k, cy - h / 2);
  x.lineTo(cx + w / 2, cy - h / 2 + k);
  x.lineTo(cx + w / 2, cy + h / 2 - k);
  x.lineTo(cx + w / 2 - k, cy + h / 2);
  x.lineTo(cx - w / 2 + k, cy + h / 2);
  x.lineTo(cx - w / 2, cy + h / 2 - k);
  x.lineTo(cx - w / 2, cy - h / 2 + k);
  x.closePath();
  x.fill();
  x.strokeStyle = rule;
  x.globalAlpha = alpha * 0.8;
  x.lineWidth = 3;
  x.stroke();
  x.globalAlpha = alpha * 0.35;
  x.lineWidth = 1;
  x.beginPath();
  x.rect(cx - w / 2 + 12, cy - h / 2 + 12, w - 24, h - 24);
  x.stroke();
  x.restore();

  const totalGap = lines.reduce((a, l) => a + l.size * (l.gap ?? 1.5), 0);
  let y = cy - totalGap / 2;
  for (const l of lines) {
    const step = l.size * (l.gap ?? 1.5);
    engrave(x, l.text, cx, y + step / 2, l.size, { light: ink, alpha });
    y += step;
  }
}

/* ————————————————————————————————————————————————————————————————
 * in-scene labels
 * ———————————————————————————————————————————————————————————————— */

const labelCache = new Map<string, { tex: THREE.CanvasTexture; aspect: number }>();

/**
 * A gilt legend for something standing on a plate: a device over a name, with
 * an optional gloss under it.
 *
 * The orrery's own `planetLabel` does this for the solar chart, but it looks its
 * glyph up out of PLANET_LORE and sets the name in English capitals — which is
 * no use to eight charts that need Latin, Hebrew and free-form devices. Same
 * register, same size, its own vocabulary.
 *
 * Sized for a sprite about 0.2 units tall. Do NOT bake these smaller: a
 * 256-wide canvas at this height downsamples the name into a gold smudge, and
 * the label is the only thing telling a visitor the object is worth touching.
 */
export function plateLabel(
  glyph: string,
  name: string,
  sub?: string,
  tint = '#ffe9b4',
): { tex: THREE.CanvasTexture; aspect: number } {
  const id = `${glyph}|${name}|${sub ?? ''}|${tint}`;
  const hit = labelCache.get(id);
  if (hit) return hit;
  const CW = 512;
  const CH = sub ? 384 : 320;
  const c = document.createElement('canvas');
  c.width = CW;
  c.height = CH;
  const x = c.getContext('2d')!;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  // these sprites cross a dark chart, a lit dome and a bright brass rete by
  // turns, so each carries its own shadow rather than trusting a background
  x.shadowColor = 'rgba(0,0,0,0.9)';
  x.shadowBlur = 16;
  if (glyph) {
    x.fillStyle = tint;
    x.font = `164px ${SYMBOL}`;
    x.fillText(sym(glyph), CW / 2, 104);
  }
  x.fillStyle = '#efdcae';
  const nameSize = name.length > 12 ? 48 : 60;
  x.font = `${nameSize}px ${SERIF}`;
  x.fillText(name, CW / 2, glyph ? 236 : 150);
  if (sub) {
    x.globalAlpha = 0.72;
    x.font = `34px ${SERIF}`;
    x.fillText(sub, CW / 2, glyph ? 316 : 216);
    x.globalAlpha = 1;
  }
  x.shadowBlur = 0;
  x.globalAlpha = 0.55;
  x.strokeStyle = '#d8bd7c';
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(CW / 2 - 92, glyph ? 274 : 188);
  x.lineTo(CW / 2 + 92, glyph ? 274 : 188);
  x.stroke();
  x.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const made = { tex, aspect: CW / CH };
  labelCache.set(id, made);
  return made;
}

/** a scale bar, ruled and lettered — an instrument states its scale */
export function scaleBar(
  x: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  len: number,
  divisions: number,
  label: string,
  colour = '#e8cf8e',
) {
  x.save();
  const h = Math.max(8, len * 0.024);
  for (let i = 0; i < divisions; i++) {
    x.fillStyle = i % 2 === 0 ? colour : 'rgba(20,16,10,0.7)';
    x.globalAlpha = 0.9;
    x.fillRect(cx - len / 2 + (i * len) / divisions, cy, len / divisions, h);
  }
  x.strokeStyle = colour;
  x.globalAlpha = 0.9;
  x.lineWidth = 2;
  x.strokeRect(cx - len / 2, cy, len, h);
  x.restore();
  engrave(x, label, cx, cy + h + len * 0.05, Math.max(15, len * 0.05), { light: colour });
}
