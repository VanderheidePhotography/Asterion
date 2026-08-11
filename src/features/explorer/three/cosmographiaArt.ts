import * as THREE from 'three';
import { makeTexture, shade } from './textures';
import { mulberry32 } from '../../../domain/random';
import { ZODIAC } from '../../../data/astrology';
import { WING_ANGLES } from './layout';

/**
 * THE COSMOGRAPHIA — the museum's floor, painted.
 *
 * This module exists because the building's floor stopped being "some rugs" and
 * became one drawing. What was here before was three unrelated things: a round
 * Persian rug dropped under the centre table, eight 1.8 m runners laid down the
 * halls, and four flat maroon rectangles under the reading tables. Nothing
 * referred to anything else, and every one of them ended in a hard rectangular
 * edge on bare boards — the visual signature of a rug bought to decorate a room
 * that was already finished.
 *
 * The replacement is a single astronomical diagram struck across the whole
 * plan: a woven observatory mandala filling the rotunda, ten ceremonial ways
 * radiating from it (one per gate), and stone roundels set into the halls where
 * the ways pause at the galleries. Three painters serve it:
 *
 *   `cosmographiaMandala` — the rotunda, ONE 4K sheet, nothing tiled
 *   `ceremonialWay`       — the radial carpet, tiling along its length
 *   `observatoryRoundel`  — the stone inlay that breaks the carpet at a gallery
 *
 * ── Three rules the drawing obeys ──────────────────────────────────────────
 *
 * 1. TEN, NOT EIGHT. The gates are the eight wings plus the entrance (+z) and
 *    the apse (−z). Written out — 18°, 54°, 90°, 126°, 162°, 198°, 234°, 270°,
 *    306°, 342° — those are every 36° from 18°, a true decagon. That was not
 *    designed for, it fell out of the existing plan, and it is the reason this
 *    composition can be radial at all: the mandala's spokes land on real
 *    doorways instead of pointing at walls. The zodiac's twelvefold ring runs
 *    against it deliberately, the way a real instrument carries two scales.
 *
 * 2. GEOMETRY, NOT FONTS, for anything outside U+2600. The zodiac and the seven
 *    classical planets live in Miscellaneous Symbols and are safe (the dome
 *    already sets type from the same block). The alchemical block at U+1F700 is
 *    NOT — it renders as tofu on a machine without Apple Symbols, and a floor
 *    full of empty boxes is worse than no alchemy. Anything from that block is
 *    struck as the geometry it actually is, never set as type. (The four
 *    element triangles that used to prove the point are gone from the sheet —
 *    see the note where they stood — but the rule they were an example of
 *    holds for everything else on it.)
 *
 * 3. EMBROIDERY IS STITCHED, NOT FILLED. Gold here is never a flat `fill()`.
 *    `stitch` walks a path laying short slanted threads with jittered tone, and
 *    `couched` outlines a glyph the same way. A filled gold shape at this pixel
 *    density reads as printed vinyl; the eye finds the constant value instantly.
 */

/* ————— the dyer's shelf —————
 * Nothing saturated. These are what madder, kermes, woad, weld and walnut hull
 * actually fade to after some centuries under a dome, which is a long way from
 * the reds a modern loom can reach.
 */
/**
 * The ways, the mandala's ground and the gate wedges — ONE dye, which is the
 * point of it being one constant: the hall runner, the wedge each way leaves
 * from and the heart of the mandala are the same cloth, so they can only ever
 * be the same colour.
 *
 * Twice off the first cut now (#4a1f22 → #67201f → here). Under a room lit to
 * 15% the original read as brown wool and the second as dried blood; the
 * carpet is the one thing in this building allowed to be RED, and at the value
 * the rest of the palette sits at, a dye has to be well up the chroma scale
 * before it reads as red at all rather than as dark. Still madder rather than
 * anything a modern loom could reach — the chroma has moved a long way, the
 * value barely.
 */
const OXBLOOD = '#7e201f';
/** the ambulatory's ground, a shade lighter than the ways as before (#59252a) */
const BURGUNDY = '#89242c';
const CRIMSON_AGED = '#5e2b2a';
const UMBER = '#4a3524';
/** woad, not ultramarine. A saturated blue is the single loudest thing that can
 *  happen on this floor and it fought everything around it at the first cut. */
const INDIGO = '#282c3d';
const BRONZE = '#8a6a34';
const GOLD = '#b08a45';
const GOLD_LIT = '#d3b169';
const CREAM = '#c6b692';
/** The pavement. This was #8b8474 and it came out as poured concrete — a pale
 *  neutral ring cutting the drawing in half, the brightest thing in a room lit
 *  to 15%. Old interior limestone under candle smoke is far darker and much
 *  warmer than quarry-fresh stone, and it has to sit UNDER the gold, not over it. */
const STONE = '#6f6857';
const STONE_DK = '#575143';
const SLATE = '#3b3a38';

/** the seven classical planets, in the order the spheres were held to stand */
const PLANET_GLYPHS = ['☽', '☿', '♀', '☉', '♂', '♃', '♄'];

/* ————— the ten gates ————— */
/**
 * Every way out of the rotunda, in the scene's own convention (measured from
 * +x toward +z), sorted so neighbours are adjacent.
 *
 * DERIVED from the plan, never written down: eight wings out of `WING_ANGLES`
 * plus the entrance at +z and the apse at −z. Written out it comes to 18°, 54°,
 * 90° … 342° — every 36°, a true decagon — but that is a FACT ABOUT THE PLAN,
 * not a constant of this file. Move a wing in layout.ts and the mandala's
 * spokes move with it; hard-coding the decagon here would silently leave the
 * floor pointing at a wall.
 */
export const GATE_ANGLES = [...WING_ANGLES, Math.PI / 2, -Math.PI / 2]
  .map((a) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2))
  .sort((p, q) => p - q);

/* ————— stitchwork ————— */

type Ctx = CanvasRenderingContext2D;
type Rng = () => number;

/**
 * Lay gold thread along a path given as sampled points.
 *
 * Real gold-work is a line of short slanted stitches, each one catching the
 * light differently, and it is that jitter — not the colour — that separates
 * embroidery from print. `pitch` is the stitch length in pixels; `slant` how
 * far each stitch leans off the perpendicular.
 */
function stitch(
  ctx: Ctx,
  rng: Rng,
  pts: [number, number][],
  width: number,
  tone = GOLD,
  pitch = 7,
  slant = 0.5,
): void {
  ctx.lineCap = 'round';
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.round(seg / pitch));
    const dx = (x1 - x0) / n;
    const dy = (y1 - y0) / n;
    // unit normal, for the lean
    const nx = -dy / Math.hypot(dx, dy || 1e-6);
    const ny = dx / Math.hypot(dx, dy || 1e-6);
    for (let k = 0; k < n; k++) {
      const sx = x0 + dx * k;
      const sy = y0 + dy * k;
      const lean = (rng() - 0.5) * slant * width;
      ctx.strokeStyle = shade(tone, (rng() - 0.5) * 0.11);
      // ±12% of the nominal width, not ±25%. The variance is meant to read as
      // thread catching the light differently along a line; at a quarter of the
      // width it reads as a line that could not hold its own gauge.
      ctx.lineWidth = width * (0.88 + rng() * 0.24);
      ctx.beginPath();
      ctx.moveTo(sx - nx * lean, sy - ny * lean);
      ctx.lineTo(sx + dx + nx * lean, sy + dy + ny * lean);
      ctx.stroke();
    }
  }
}

/**
 * A stitched circle — the workhorse, since almost everything here is a ring.
 *
 * THE RING IS LAID ON A TRUE CIRCLE, and that is the whole difference between
 * this reading as embroidery and reading as a wobbly line. A ring drawn purely
 * as a chain of independently jittered stitches has nothing holding it to its
 * own radius: every stitch is a little off true in its own direction, and at
 * any size the eye reads the accumulated wander rather than the circle. Real
 * gold-work is laid along a struck line, and the line is what your eye follows.
 *
 * So: a soft continuous stroke first, at a third of the value — the couching
 * thread — and the stitches over the top of it. The wander is also down to a
 * fifth of the thread width from a half, because at 194 px/m the old figure was
 * a visible five-millimetre stagger in a rule that is supposed to be struck.
 */
function stitchRing(ctx: Ctx, rng: Rng, cx: number, cy: number, r: number, width: number, tone = GOLD, pitch = 9): void {
  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = shade(tone, -0.06);
  ctx.lineWidth = width * 0.8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  const n = Math.max(24, Math.round((2 * Math.PI * r) / pitch));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    // the thread wanders a little off true, as a hand-laid one does
    const rr = r + (rng() - 0.5) * width * 0.2;
    pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]);
  }
  stitch(ctx, rng, pts, width, tone, pitch, 0.28);
}

/**
 * A glyph laid in couched thread: the shape is outlined in gold stitches rather
 * than filled, with the faintest dark shadow under it so it sits ON the pile
 * instead of in it. Falls back to a soft fill for the very small sizes, where
 * stitch detail is below a pixel and only muddies the letter.
 */
function couched(ctx: Ctx, rng: Rng, glyph: string, cx: number, cy: number, size: number, tone = GOLD): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.font = `${size}px "Segoe UI Symbol", "Arial Unicode MS", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // the depression the thread sits in
  ctx.fillStyle = 'rgba(0,0,0,0.34)';
  ctx.fillText(glyph, size * 0.03, size * 0.045);
  if (size < 26) {
    ctx.fillStyle = tone;
    ctx.fillText(glyph, 0, 0);
    ctx.restore();
    return;
  }
  // three passes of jittered outline read as laid thread at this scale
  for (let p = 0; p < 3; p++) {
    ctx.strokeStyle = shade(tone, (rng() - 0.5) * 0.14 + (p === 2 ? 0.08 : 0));
    ctx.lineWidth = size * (0.075 - p * 0.018);
    ctx.lineJoin = 'round';
    ctx.strokeText(glyph, (rng() - 0.5) * size * 0.02, (rng() - 0.5) * size * 0.02);
  }
  ctx.fillStyle = shade(tone, -0.05);
  ctx.globalAlpha = 0.55;
  ctx.fillText(glyph, 0, 0);
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ————— cloth ————— */

/**
 * THE REAL PILE.
 *
 * Everything below `weavePattern` draws wool from arithmetic, and arithmetic
 * cannot do wool. A procedural weave gives you a regular grid of tufts; a
 * photograph of a carpet gives you crushed pile, stray fibres, knots that have
 * lost their twist, a hundred slightly wrong colours per centimetre and the
 * particular way light sits in a surface made of loose ends. At the distance a
 * visitor's own feet put them from this floor, that difference is the entire
 * difference between "a carpet" and "a picture of a carpet".
 *
 * So the ground of every woven surface here is a real scan — the same
 * `fabric_rug_persian` plate the registry already ships — reduced to its
 * LUMINANCE and multiplied into the dye. Taking only the luminance is what
 * makes one scan serve an oxblood way, an indigo zodiac band and a cream guard:
 * the photograph contributes structure, the dyer's shelf above contributes
 * colour, and no trace of the original carpet's own red survives to fight them.
 *
 * The load is asynchronous and the painters are not, so the procedural weave
 * stays exactly where it is as the stand-in. `onPileReady` re-bakes each sheet
 * once the plate lands.
 */
const PILE_URL = '/textures/Fabric/fabric_rug_persian/albedo.jpg';
/** how many metres of real carpet one copy of the plate covers */
const PILE_M = 1.15;

let pileTile: HTMLCanvasElement | null = null;
let pileWaiters: (() => void)[] | null = [];

function loadPile(): void {
  if (pileWaiters === null || pileTile) return;
  const img = new Image();
  img.onload = () => {
    // desaturate once, here, rather than per draw: a `saturation(0)` filter on
    // a 2K source costs nothing at bake time and would cost a full-canvas
    // filtered blit every time `cloth` was called otherwise
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const x = c.getContext('2d')!;
    x.filter = 'grayscale(1) contrast(1.15)';
    x.drawImage(img, 0, 0);
    // Lift it to a neutral mid grey. A photograph averages wherever it averages;
    // multiplied into a dye, anything below 0.5 mean darkens the whole floor
    // toward black and anything above washes it out. Normalising here means the
    // dyer's shelf means what it says.
    const d = x.getImageData(0, 0, c.width, c.height);
    let sum = 0;
    for (let i = 0; i < d.data.length; i += 4) sum += d.data[i];
    const mean = sum / (d.data.length / 4);
    const k = 208 / Math.max(1, mean);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.min(255, d.data[i] * k);
      d.data[i] = v;
      d.data[i + 1] = v;
      d.data[i + 2] = v;
    }
    x.putImageData(d, 0, 0);
    pileTile = c;
    const waiting = pileWaiters ?? [];
    pileWaiters = null;
    for (const fn of waiting) fn();
  };
  img.onerror = () => {
    // no scan, no problem: the procedural weave is the fallback and it is
    // already on screen. Nothing re-bakes and nothing is left blank.
    pileWaiters = null;
  };
  img.src = PILE_URL;
}

/** run `fn` when the scan is in hand — immediately if it already is, never if
 *  it failed. The carpet painters use this to re-bake themselves once. */
function onPileReady(fn: () => void): void {
  if (pileTile) {
    fn();
    return;
  }
  if (pileWaiters === null) return;
  pileWaiters.push(fn);
  loadPile();
}

const pilePatterns = new Map<number, CanvasPattern | null>();

/** the scan as a repeating pattern, scaled so one copy covers `PILE_M` metres */
function pilePattern(ctx: Ctx, pxPerM: number): CanvasPattern | null {
  if (!pileTile) return null;
  const px = Math.round(pxPerM * 100);
  const hit = pilePatterns.get(px);
  if (hit !== undefined) return hit;
  // resample to the size it will actually be drawn at, so the browser filters
  // it once here instead of on every fill
  const want = Math.max(64, Math.round(PILE_M * pxPerM));
  const c = document.createElement('canvas');
  c.width = want;
  c.height = want;
  c.getContext('2d')!.drawImage(pileTile, 0, 0, want, want);
  const pat = ctx.createPattern(c, 'repeat');
  pilePatterns.set(px, pat);
  return pat;
}

const rebaked = new Set<string>();

/**
 * A sheet that paints itself twice: once now, on whatever is in hand, and once
 * more when the carpet scan lands.
 *
 * The registry's contract is that a painter returns a finished texture
 * synchronously, and that stands — the first bake is complete and correct on
 * its own, with the procedural weave carrying the cloth. The second bake
 * replaces it in place: same canvas, same `THREE.CanvasTexture`, same GPU
 * binding, so no material anywhere has to be told anything beyond
 * `needsUpdate`. If the scan never arrives, the first bake is simply what
 * ships, which is why `onPileReady` drops its queue on error rather than
 * retrying.
 */
function rebakeable(
  key: string,
  size: [number, number],
  paint: (ctx: Ctx, w: number, h: number) => void,
  repeat = true,
): THREE.CanvasTexture {
  const tex = makeTexture(key, size, paint, repeat);
  /**
   * FLOOR sheets get the full anisotropic budget, not the shared default of 4.
   *
   * Everything else this cache bakes is looked at roughly face-on — a wall
   * hanging, a plate on a table. A floor is the one surface always seen at a
   * grazing angle, right out to the far side of a 31 m room, and 4 taps is
   * where the carpet's ruled circles go to mush a few metres from the eye. The
   * driver clamps this to whatever it actually supports, so 16 asks for the
   * most it can give and costs nothing where it cannot.
   */
  tex.anisotropy = 16;
  if (!rebaked.has(key)) {
    rebaked.add(key);
    onPileReady(() => {
      const canvas = tex.image as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      paint(ctx, canvas.width, canvas.height);
      tex.needsUpdate = true;
    });
  }
  return tex;
}

const weaveCache = new Map<number, CanvasPattern | null>();

/**
 * The weave itself: warp and weft as separate passes on a small tile, laid over
 * a dyed field with `multiply` so it darkens into the colour rather than
 * greying it. One tile serves every carpet in the building — the pitch is the
 * same loom.
 */
function weavePattern(ctx: Ctx, seed: number): CanvasPattern | null {
  const hit = weaveCache.get(seed);
  if (hit !== undefined) return hit;
  const T = 96;
  const tile = document.createElement('canvas');
  tile.width = T;
  tile.height = T;
  const t = tile.getContext('2d')!;
  const rng = mulberry32(seed);
  t.fillStyle = '#ffffff';
  t.fillRect(0, 0, T, T);
  /* The knots themselves.
   *
   * The old tile was ruled lines — a weft stripe every 3 px and a warp stripe
   * every 4 — and ruled lines are what a printed fabric looks like. A hand-
   * knotted pile is not a grid of lines, it is a grid of little TUFTS, each one
   * a pair of yarn ends bent over the warp, each catching light on its top edge
   * and shadowed under its chin. Drawing the tuft instead of the line is the
   * whole difference between cloth and gift wrap at close range, and this floor
   * is walked on.
   */
  const KX = 4; // knots across — the warp gauge
  const KY = 3; // and down: a slightly denser weft, as a real Persian knot is
  for (let y = 0; y < T; y += KY) {
    // the weft passes: two shots between every row of knots, in shadow
    t.fillStyle = `rgba(0,0,0,${0.05 + rng() * 0.06})`;
    t.fillRect(0, y, T, 0.8);
    for (let x = 0; x < T; x += KX) {
      // the tuft: lit crown, dark throat, and a hair of lateral wander so the
      // rows do not line up into columns of their own
      const j = (rng() - 0.5) * 0.9;
      t.fillStyle = `rgba(0,0,0,${0.16 + rng() * 0.2})`;
      t.fillRect(x + j, y + KY * 0.45, KX * 0.86, KY * 0.5);
      t.fillStyle = `rgba(255,255,255,${0.1 + rng() * 0.16})`;
      t.fillRect(x + j, y + KY * 0.1, KX * 0.72, KY * 0.34);
      // the warp thread showing in the ditch between two knots
      if (rng() > 0.6) {
        t.fillStyle = `rgba(0,0,0,${0.06 + rng() * 0.08})`;
        t.fillRect(x + KX * 0.9 + j, y, 0.9, KY);
      }
    }
  }
  // slubs: the thick places in a hand-spun yarn
  for (let i = 0; i < 150; i++) {
    t.fillStyle = `rgba(0,0,0,${0.05 + rng() * 0.12})`;
    t.fillRect(rng() * T, rng() * T, 1 + rng() * 4, 1 + rng() * 2.5);
  }
  // NO abrash in here. A dye-lot band belongs to the carpet, not to the loom
  // tile: put one in a 96 px tile and it repeats every 96 px, which is a ruled
  // horizontal line every 30 cm across the entire floor — the one artefact that
  // announces a tiled texture louder than the ornament ever could. `cloth`
  // paints the abrash at carpet scale, where it cannot repeat.
  const pat = ctx.createPattern(tile, 'repeat');
  weaveCache.set(seed, pat);
  return pat;
}

/**
 * The pixels-per-metre of the sheet currently being painted.
 *
 * `cloth` needs it to draw the scan at life size — a carpet photograph laid on
 * at the wrong scale is the single most obvious tell there is, because the
 * human eye knows exactly how big a knot of wool is. Set once at the top of
 * each painter rather than threaded through fifteen call sites.
 */
let sheetPxPerM = 160;

/** dye a region and then weave it, inside whatever path is currently set */
function cloth(ctx: Ctx, rng: Rng, base: string, x: number, y: number, w: number, h: number, seed: number): void {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  // dye lots never matched — vats varied, and the light has faded them unevenly
  for (let i = 0; i < 220; i++) {
    ctx.globalAlpha = 0.05 + rng() * 0.12;
    ctx.fillStyle = shade(base, (rng() - 0.5) * 0.13);
    const bw = w * (0.05 + rng() * 0.3);
    ctx.fillRect(x + rng() * w - bw / 2, y + rng() * h, bw, h * 0.004 + rng() * h * 0.05);
  }
  ctx.globalAlpha = 1;
  // the real pile if it has landed, the procedural weave until then. Both go on
  // as `multiply`, so they darken INTO the dye rather than greying it.
  const scan = pilePattern(ctx, sheetPxPerM);
  if (scan) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = scan;
    ctx.fillRect(x, y, w, h);
    // and a second pass at a different offset and a low alpha, which breaks the
    // scan's own repeat: one photograph tiled straight shows its seam as a grid
    // of identical blemishes, and a carpet has no such grid
    ctx.globalAlpha = 0.4;
    ctx.translate(w * 0.37, h * 0.19);
    ctx.fillRect(x - w * 0.37, y - h * 0.19, w, h);
    ctx.restore();
  } else {
    const pat = weavePattern(ctx, seed);
    if (pat) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = pat;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }
  }
}

/** limestone: bedding, shell flecks, the fine crazing of a walked pavement */
function pavement(ctx: Ctx, rng: Rng, base: string, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 900; i++) {
    ctx.globalAlpha = 0.06 + rng() * 0.16;
    ctx.fillStyle = shade(base, (rng() - 0.5) * 0.2);
    ctx.beginPath();
    ctx.ellipse(x + rng() * w, y + rng() * h, 2 + rng() * 22, 1 + rng() * 7, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // crazing
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = shade(base, -0.34);
  for (let i = 0; i < 260; i++) {
    const cx = x + rng() * w;
    const cy = y + rng() * h;
    ctx.lineWidth = 0.6 + rng();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (rng() - 0.5) * 90, cy + (rng() - 0.5) * 90);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** an inlaid brass line — bright core, dark seating groove either side */
function brassLine(ctx: Ctx, pts: [number, number][], width: number, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const run = (w: number, tone: string) => {
    ctx.strokeStyle = tone;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  };
  run(width * 1.9, 'rgba(0,0,0,0.42)');
  run(width, BRONZE);
  run(width * 0.42, GOLD_LIT);
  ctx.restore();
}

function brassRing(ctx: Ctx, cx: number, cy: number, r: number, width: number, alpha = 1): void {
  const n = Math.max(64, Math.round(r / 3));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
  }
  brassLine(ctx, pts, width, alpha);
}

/* ————— wear ————— */

/**
 * Centuries of feet. Compressed pile is LIGHTER and flatter, not darker — the
 * cut ends of the wool turn toward the eye and the dye has gone from the tips —
 * so the desire lines are painted with a pale wash, and the dirt that
 * accompanies them with a separate darker one at the margins of the track.
 */
function tread(ctx: Ctx, rng: Rng, cx: number, cy: number, ang: number, r0: number, r1: number, halfW: number): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, -halfW, 0, halfW);
  g.addColorStop(0, 'rgba(0,0,0,0.16)');
  g.addColorStop(0.22, 'rgba(214,199,166,0.13)');
  g.addColorStop(0.5, 'rgba(226,212,180,0.2)');
  g.addColorStop(0.78, 'rgba(214,199,166,0.13)');
  g.addColorStop(1, 'rgba(0,0,0,0.16)');
  ctx.fillStyle = g;
  ctx.fillRect(r0, -halfW, r1 - r0, halfW * 2);
  // the track is not a clean stripe — it wanders and thins
  for (let i = 0; i < 90; i++) {
    ctx.globalAlpha = 0.05 + rng() * 0.09;
    ctx.fillStyle = rng() > 0.55 ? '#ded0ab' : '#241a14';
    const rr = r0 + rng() * (r1 - r0);
    ctx.beginPath();
    ctx.ellipse(rr, (rng() - 0.5) * halfW * 1.5, 8 + rng() * 40, 5 + rng() * 16, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** wax, dust, and the pale bloom of a repair — the small accidents of use */
function soiling(ctx: Ctx, rng: Rng, x: number, y: number, w: number, h: number, count: number): void {
  for (let i = 0; i < count; i++) {
    const cx = x + rng() * w;
    const cy = y + rng() * h;
    const k = rng();
    if (k < 0.42) {
      // Dust settled into the pile. Held DOWN hard: at 0.04–0.11 these read as
      // soft grey discs floating over the weave — fog, not dirt — and a dozen
      // of them overlapping turned a carpet into a fogged photograph of one.
      // Dirt in wool is faint and wide; it is the tread and the bald patches
      // that carry the age, not this.
      ctx.globalAlpha = 0.018 + rng() * 0.035;
      ctx.fillStyle = '#b6ab90';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 20 + rng() * 90, 14 + rng() * 60, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    } else if (k < 0.72) {
      // candle wax — a hard-edged pale disc with a soft halo
      ctx.globalAlpha = 0.1 + rng() * 0.13;
      ctx.fillStyle = '#d9cead';
      const r = 4 + rng() * 13;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.05;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (k < 0.9) {
      // A stain sunk in the ground — and drawn as a stain, not as a shape. A
      // hard-edged ellipse of flat colour is a sticker; what a spill actually
      // leaves is a dark heart fading out with no edge at all, which is what
      // this gradient is for.
      const sr = 10 + rng() * 45;
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sr);
      sg.addColorStop(0, 'rgba(29,20,16,0.5)');
      sg.addColorStop(0.5, 'rgba(29,20,16,0.22)');
      sg.addColorStop(1, 'rgba(29,20,16,0)');
      ctx.globalAlpha = 0.35 + rng() * 0.4;
      ctx.fillStyle = sg;
      ctx.fillRect(cx - sr, cy - sr, sr * 2, sr * 2);
    } else {
      // a section reknotted in wool that never quite matched. Kept faint: a
      // repair is a change of DYE LOT, a couple of shades off, not a coloured
      // rectangle laid on the carpet.
      ctx.globalAlpha = 0.06 + rng() * 0.06;
      ctx.fillStyle = rng() > 0.5 ? '#6a4038' : '#3d3a52';
      const pw = 18 + rng() * 60;
      const ph = 14 + rng() * 44;
      ctx.fillRect(cx, cy, pw, ph);
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = '#241a14';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx, cy, pw, ph);
    }
  }
  ctx.globalAlpha = 1;
}

/* `ravage` used to live here: bald patches worn to the foundation, moth
 * grazing, creases, and holes punched clean through the alpha so the boards
 * showed. It is gone, along with every call to `soiling` on a carpet.
 *
 * It was accurate and it looked bad, which is the whole of the lesson. Damage
 * is not the same thing as age. A carpet in a room like this is READ at ten
 * metres in candlelight, and at ten metres a hole reads as a smudge, a moth
 * nest as a stain, and a bald patch as a dirty mark on an otherwise handsome
 * floor — so the surface stops looking centuries old and starts looking
 * unclean. What actually carries age here is what is left: dye lots that never
 * matched, the pale walked centre of every way, the nap lying in patches, and
 * the frayed selvedges. Those are all TONAL, they survive the distance, and
 * none of them reads as a blemish.
 *
 * `soiling` survives only for the observatory roundels, where a little dirt in
 * the joints of a stone disc is doing a different job.
 */

/**
 * Eat the edge away so the carpet ends in wool rather than in a cut line.
 *
 * This punches real holes in the ALPHA channel (`destination-out`), which is
 * what lets the material run on `alphaTest` instead of `transparent` — the
 * fringe is then free of the sorting problems a transparent 31 m disc would
 * bring, and the boards show through between the threads.
 */
function fray(ctx: Ctx, rng: Rng, pts: [number, number][], depth: number, along: number): void {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.round(seg / along));
    for (let k = 0; k < n; k++) {
      const t = (k + rng() * 0.9) / n;
      const px = x0 + (x1 - x0) * t;
      const py = y0 + (y1 - y0) * t;
      ctx.globalAlpha = 0.35 + rng() * 0.65;
      ctx.beginPath();
      ctx.ellipse(px, py, along * (0.4 + rng()), depth * (0.3 + rng() * 0.9), rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** the loose warp threads left standing where the pile has gone */
function fringe(ctx: Ctx, rng: Rng, pts: [number, number][], outward: [number, number][], len: number, pitch: number): void {
  for (let i = 0; i < pts.length; i++) {
    if (rng() > 0.72) continue;
    const [px, py] = pts[i];
    const [ox, oy] = outward[i];
    const l = len * (0.35 + rng() * 0.9);
    ctx.globalAlpha = 0.3 + rng() * 0.5;
    ctx.strokeStyle = rng() > 0.4 ? CREAM : shade(CREAM, -0.2);
    ctx.lineWidth = pitch * (0.1 + rng() * 0.16);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + ox * l * 0.6 + (rng() - 0.5) * l * 0.4, py + oy * l * 0.6 + (rng() - 0.5) * l * 0.4, px + ox * l, py + oy * l);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ————— ornament ————— */

/** an interlocking-circle rosette — the seed of life, the commonest sacred
 *  figure in a medieval mason's repertoire and the one that ties this floor to
 *  the compasses in the statuary */
function seedOfLife(ctx: Ctx, rng: Rng, cx: number, cy: number, r: number, width: number, tone = GOLD): void {
  stitchRing(ctx, rng, cx, cy, r, width, tone, r * 0.16);
  for (let i = 0; i < 6; i++) {
    const t = (i / 6) * Math.PI * 2;
    stitchRing(ctx, rng, cx + Math.cos(t) * r, cy + Math.sin(t) * r, r, width * 0.85, tone, r * 0.16);
  }
}

/** an n-pointed star struck by joining every `skip`-th vertex — a decagram at
 *  (10,3), the hermetic heptagram at (7,3), a hexagram at (6,2) */
function starPolygon(cx: number, cy: number, r: number, n: number, skip: number, phase = 0): [number, number][] {
  const pts: [number, number][] = [];
  let i = 0;
  for (let k = 0; k <= n; k++) {
    const t = phase + (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
    i = (i + skip) % n;
  }
  return pts;
}

/* ════════ THE SOLOMONIC REPERTOIRE ════════
 *
 * Marks for the places on this floor that a visitor stops and looks DOWN at:
 * the ten gate marks set in the stone pavement, the rugs under the four
 * reading tables, and the mandala's own figures. Nothing here goes on the
 * ambulatory or on the ways — see `ceremonialWay` for why the ornament came
 * off those two surfaces entirely and what replaced it.
 *
 * Three families, none of which needs a symbol font:
 *
 *   `kameaSigil`      — a planetary seal traced on its own magic square. This
 *                       is the real construction: the Key of Solomon's seals
 *                       are the numbers 1…n² of the kamea joined in order, and
 *                       every planet's square gives a completely different
 *                       figure. Seven planets, seven genuinely unlike glyphs,
 *                       which is what lets ten gate marks be ten marks rather
 *                       than one mark struck ten times.
 *   `pentacleRoundel` — a pentacle: two rules, a ring of characters between
 *                       them, and an inner figure. Eight inner figures.
 *   `charRing`        — the characters themselves, in the manner of the
 *                       Malachim and Passing-the-River hands: short strokes
 *                       pinned with small rings. Generated, so no two rings of
 *                       them are alike, and no glyph is a claim to mean anything.
 */

/* ————— the kameas ————— */

/**
 * The magic square of order `n`, built rather than tabulated.
 *
 * Three constructions, because the three residue classes of n need three
 * different arguments — odd by the Siamese walk, doubly-even by complementing
 * the marked cells of a 4×4 pattern, singly-even by LUX. The traditional
 * planetary kameas are particular reflections of these; a reflection of a magic
 * square is a magic square, and at 40 px across a floor what matters is that
 * the traced path is the real one for that order rather than a doodle.
 */
function magicSquare(n: number): number[][] {
  const g: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  if (n % 2 === 1) {
    // Siamese: start on the top middle, step up-right, drop down when blocked
    let r = 0;
    let c = (n - 1) >> 1;
    for (let k = 1; k <= n * n; k++) {
      g[r][c] = k;
      const nr = (r - 1 + n) % n;
      const nc = (c + 1) % n;
      if (g[nr][nc]) r = (r + 1) % n;
      else {
        r = nr;
        c = nc;
      }
    }
    return g;
  }
  if (n % 4 === 0) {
    // doubly even: fill 1…n² in reading order, then complement every cell whose
    // position falls on the diagonals of its own 4×4 block
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        const k = r * n + c + 1;
        const onDiag = (r % 4 === 0 || r % 4 === 3) === (c % 4 === 0 || c % 4 === 3);
        g[r][c] = onDiag ? n * n + 1 - k : k;
      }
    return g;
  }
  // singly even (6 = 2 × odd): LUX. Four odd squares of order m, offset by
  // quadrant, then the L/U/X row swaps that make the columns come right.
  const m = n / 2;
  const sub = magicSquare(m);
  const add = [0, 2, 3, 1].map((q) => q * m * m); // NW, NE, SW, SE
  for (let r = 0; r < m; r++)
    for (let c = 0; c < m; c++) {
      g[r][c] = sub[r][c] + add[0];
      g[r][c + m] = sub[r][c] + add[1];
      g[r + m][c] = sub[r][c] + add[2];
      g[r + m][c + m] = sub[r][c] + add[3];
    }
  const k = (m - 1) >> 1;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < k; c++) {
      // the middle row swaps one column across, not down its own
      const cc = r === k ? c + k : c;
      [g[r][cc], g[r + m][cc]] = [g[r + m][cc], g[r][cc]];
    }
    for (let c = n - k + 1; c < n; c++) [g[r][c], g[r + m][c]] = [g[r + m][c], g[r][c]];
  }
  return g;
}

const kameaCache = new Map<number, [number, number][]>();

/**
 * The seal path: the cells of the kamea in numerical order, as unit points in
 * [0,1]². This is what a planetary sigil IS — the rest of the drawing (the
 * opening ring, the closing bar) is the scribe's punctuation for "here it
 * begins" and "here it ends".
 */
function kameaPath(n: number): [number, number][] {
  const hit = kameaCache.get(n);
  if (hit) return hit;
  const g = magicSquare(n);
  const pos: [number, number][] = new Array(n * n);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) pos[g[r][c] - 1] = [(c + 0.5) / n, (r + 0.5) / n];
  kameaCache.set(n, pos);
  return pos;
}

/** the seven planets by the order of their squares — Saturn 3 … Luna 9 */
const PLANET_ORDERS = [3, 4, 5, 6, 7, 8, 9];

/**
 * A planetary seal, traced on its square and finished as a scribe finishes one:
 * a small ring where the thread starts, a cross-bar where it stops.
 *
 * The whole figure is laid in one stitched polyline so the light runs along it,
 * and it is deliberately NOT centred on the geometric middle of the square —
 * the path's own bounding box is what gets centred, which is why a Saturn seal
 * and a Luna seal come out the same visual weight despite one having 9 points
 * and the other 81.
 */
function kameaSigil(ctx: Ctx, rng: Rng, cx: number, cy: number, R: number, order: number, tone = GOLD, width = 0): void {
  const path = kameaPath(order);
  let x0 = 1;
  let x1 = 0;
  let y0 = 1;
  let y1 = 0;
  for (const [x, y] of path) {
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  const s = (2 * R) / Math.max(x1 - x0, y1 - y0);
  const mx = cx - ((x0 + x1) / 2) * s;
  const my = cy - ((y0 + y1) / 2) * s;
  const pts = path.map(([x, y]) => [mx + x * s, my + y * s] as [number, number]);
  const wdt = width || R * 0.1;
  // the shadow the thread sits in, so the seal reads as raised off the pile
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = '#150e0a';
  ctx.lineWidth = wdt * 1.9;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0] + wdt * 0.5, pts[0][1] + wdt * 0.6);
  for (const p of pts.slice(1)) ctx.lineTo(p[0] + wdt * 0.5, p[1] + wdt * 0.6);
  ctx.stroke();
  ctx.restore();
  stitch(ctx, rng, pts, wdt, tone, Math.max(4, R * 0.14), 0.28);
  // the opening ring
  stitchRing(ctx, rng, pts[0][0], pts[0][1], R * 0.13, wdt * 0.8, tone, R * 0.09);
  // and the closing bar, struck across the last thread
  const [ex, ey] = pts[pts.length - 1];
  const [px, py] = pts[pts.length - 2];
  const l = Math.hypot(ex - px, ey - py) || 1;
  const [nx, ny] = [-(ey - py) / l, (ex - px) / l];
  stitch(ctx, rng, [
    [ex - nx * R * 0.17, ey - ny * R * 0.17],
    [ex + nx * R * 0.17, ey + ny * R * 0.17],
  ], wdt, tone, R * 0.1, 0.2);
}

/* ————— the characters ————— */

/**
 * One character in the manner of the angelic hands: two or three strokes on a
 * 3×3 grid, with a small ring pinned to the ends that carry one. Malachim and
 * the Celestial alphabet are built exactly this way — strokes and rings — and
 * generating them from a seed rather than transcribing a real alphabet keeps
 * this ornament and stops it short of pretending to spell anything.
 */
function angelChar(ctx: Ctx, rng: Rng, cx: number, cy: number, size: number, tone: string): void {
  const g = (i: number): number => (i - 1) * size * 0.5;
  const strokes = 2 + Math.floor(rng() * 2);
  const w = size * 0.12;
  for (let s = 0; s < strokes; s++) {
    const ax = Math.floor(rng() * 3);
    const ay = Math.floor(rng() * 3);
    let bx = Math.floor(rng() * 3);
    const by = Math.floor(rng() * 3);
    if (bx === ax && by === ay) bx = (bx + 1) % 3;
    const pts: [number, number][] = [[cx + g(ax), cy + g(ay)], [cx + g(bx), cy + g(by)]];
    stitch(ctx, rng, pts, w, tone, size * 0.22, 0.25);
    // the ring that terminates a stroke — the single feature that makes these
    // read as a magical hand rather than as scratches
    if (rng() > 0.45) {
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = shade(tone, 0.08);
      ctx.lineWidth = w * 0.7;
      ctx.beginPath();
      ctx.arc(pts[1][0], pts[1][1], size * 0.14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

/** a band of those characters running round a ring, each one turned to face out */
function charRing(ctx: Ctx, rng: Rng, cx: number, cy: number, r: number, count: number, size: number, tone: string): void {
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2 + rng() * 0.04;
    ctx.save();
    ctx.translate(cx + Math.cos(t) * r, cy + Math.sin(t) * r);
    ctx.rotate(t + Math.PI / 2);
    angelChar(ctx, rng, 0, 0, size, tone);
    ctx.restore();
  }
}

/* ————— the inner figures ————— */

/** the interlaced Solomon's knot: two closed bands crossing at four points */
function solomonKnot(ctx: Ctx, rng: Rng, cx: number, cy: number, r: number, tone = GOLD): void {
  for (const [phase, t2] of [[0, tone], [Math.PI / 2, shade(tone, -0.16)]] as [number, string][]) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 160; i++) {
      const t = (i / 160) * Math.PI * 2;
      const rr = r * (0.62 + 0.38 * Math.abs(Math.cos(t * 2 + phase)));
      pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]);
    }
    stitch(ctx, rng, pts, r * 0.11, t2, r * 0.16, 0.3);
  }
}

/** a spirit sigil in the Goetic manner: an angular walk with terminators — a
 *  fork at one end, a barred cross at the other, a ring somewhere along it */
function spiritSigil(ctx: Ctx, rng: Rng, cx: number, cy: number, r: number, tone = GOLD): void {
  const n = 4 + Math.floor(rng() * 3);
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = rng() * Math.PI * 2;
    const rr = r * (0.25 + rng() * 0.75);
    pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]);
  }
  stitch(ctx, rng, pts, r * 0.11, tone, r * 0.15, 0.28);
  // the fork
  const [fx, fy] = pts[0];
  for (const s of [-1, 1])
    stitch(ctx, rng, [[fx, fy], [fx + s * r * 0.22, fy - r * 0.24]], r * 0.09, tone, r * 0.14, 0.25);
  // the barred cross
  const [ex, ey] = pts[pts.length - 1];
  stitch(ctx, rng, [[ex - r * 0.18, ey], [ex + r * 0.18, ey]], r * 0.09, tone, r * 0.14, 0.25);
  stitch(ctx, rng, [[ex, ey - r * 0.2], [ex, ey + r * 0.2]], r * 0.09, tone, r * 0.14, 0.25);
  // the ring on the shaft
  const mid = pts[1 + Math.floor(rng() * (pts.length - 2))];
  stitchRing(ctx, rng, mid[0], mid[1], r * 0.13, r * 0.055, tone, r * 0.1);
}

/**
 * A pentacle: the Key of Solomon's own page furniture — an outer rule, a band
 * of characters, an inner rule, and a figure in the middle.
 *
 * `variant` picks the figure, and there are eight, so a chain of pentacles can
 * run a long way before it repeats — which is the entire point of this module.
 */
function pentacleRoundel(ctx: Ctx, rng: Rng, cx: number, cy: number, R: number, variant: number, tone = GOLD): void {
  // the ground it is worked on, a shade darker than the field
  ctx.fillStyle = 'rgba(24,17,13,0.42)';
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  stitchRing(ctx, rng, cx, cy, R * 0.985, R * 0.055, tone, R * 0.1);
  stitchRing(ctx, rng, cx, cy, R * 0.7, R * 0.04, shade(tone, -0.14), R * 0.1);
  charRing(ctx, rng, cx, cy, R * 0.845, 9 + (variant % 4), R * 0.2, GOLD_LIT);
  const r = R * 0.6;
  const v = variant % 8;
  if (v === 0) {
    // the hexagram — the Seal of Solomon proper, its two triangles separately laid
    for (const ph of [0, Math.PI / 3]) stitch(ctx, rng, starPolygon(cx, cy, r, 3, 1, ph - Math.PI / 2), R * 0.055, ph ? shade(tone, -0.12) : tone, R * 0.1, 0.28);
    stitchRing(ctx, rng, cx, cy, r * 0.3, R * 0.035, GOLD_LIT, R * 0.08);
  } else if (v === 1) {
    stitch(ctx, rng, starPolygon(cx, cy, r, 5, 2, -Math.PI / 2), R * 0.055, tone, R * 0.1, 0.28);
    stitchRing(ctx, rng, cx, cy, r, R * 0.03, shade(tone, -0.1), R * 0.09);
  } else if (v === 2) {
    solomonKnot(ctx, rng, cx, cy, r, tone);
  } else if (v === 3) {
    // the wheel: a cross of four quarters, the commonest Venusian ground
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2;
      stitch(ctx, rng, [
        [cx + Math.cos(t) * r * 0.18, cy + Math.sin(t) * r * 0.18],
        [cx + Math.cos(t) * r, cy + Math.sin(t) * r],
      ], R * 0.05, i % 2 ? tone : shade(tone, -0.14), R * 0.1, 0.28);
    }
    stitchRing(ctx, rng, cx, cy, r * 0.55, R * 0.035, GOLD_LIT, R * 0.09);
  } else if (v === 4) {
    seedOfLife(ctx, rng, cx, cy, r * 0.5, R * 0.035, tone);
  } else if (v === 5) {
    stitch(ctx, rng, starPolygon(cx, cy, r, 7, 3, -Math.PI / 2), R * 0.05, tone, R * 0.1, 0.28);
  } else if (v === 6) {
    // the square in the circle — the alchemists' squaring, with its own triangle
    stitch(ctx, rng, starPolygon(cx, cy, r, 4, 1, Math.PI / 4), R * 0.055, tone, R * 0.1, 0.28);
    stitch(ctx, rng, starPolygon(cx, cy, r * 0.78, 3, 1, -Math.PI / 2), R * 0.045, shade(tone, -0.12), R * 0.1, 0.28);
    stitchRing(ctx, rng, cx, cy, r * 0.42, R * 0.035, GOLD_LIT, R * 0.09);
  } else {
    spiritSigil(ctx, rng, cx, cy, r, tone);
  }
}

/* ══════════════ 1. THE ROTUNDA MANDALA ══════════════ */

/** how far the mandala reaches. The drum's inner face is at r 17 and the wing
 *  mouths open at 16.2, so 15.8 leaves the sheet clear of both and lets the
 *  ways cross bare boards for a step before they enter a hall. */
export const MANDALA_R = 15.8;

/** the zones, in metres of world radius. Every ring in the drawing is derived
 *  from these, so the whole diagram re-strikes itself if one moves. */
export const MANDALA_RINGS = {
  sun: 1.05, // the gilt boss at the axis of the building
  spheres: 4.05, // the seven planetary spheres — under the orrery table
  orbits: 8.3, // the great woven orbit field
  zodiac: 8.95, // the twelvefold band
  pavementIn: 9.25, // where the woven field gives way to stone
  pavementOut: 11.95, // and back again
  ambulatory: 15.2, // the processional ring the ten ways leave from
  edge: MANDALA_R,
} as const;

/**
 * The four reading alcoves, in world metres. They sit in the inter-gate wedges
 * (67°, 113°, 247°, 293°) rather than on a gate, which is why a worn rug can be
 * drawn under each without ever lying across a processional way. These MUST
 * track `TABLE_SPECS` in furniture.tsx — the tables' own maroon under-planes
 * were deleted in favour of these.
 */
const ALCOVES: { x: number; z: number; r: number; rect?: [number, number] }[] = [
  { x: -4.5, z: 10.6, r: 1.72 },
  { x: 4.5, z: 10.6, r: 0, rect: [4.3, 3.0] },
  { x: -4.5, z: -10.6, r: 0, rect: [4.3, 3.0] },
  { x: 4.5, z: -10.6, r: 0, rect: [4.3, 3.0] },
];

/**
 * The rotunda floor: one sheet, 4096², nothing tiled, nothing repeated.
 *
 * Laid on a `circleGeometry` turned flat by `rotation-x={-PI/2}`, whose UVs put
 * world +x at canvas right and world +z at canvas BOTTOM — so a world angle
 * measured from +x toward +z is a canvas angle measured clockwise from east,
 * i.e. the same number, and north (the apse, −z) is the top of the image. See
 * the note in the orrery charts about why a cylinder cap is NOT interchangeable
 * with this.
 */
/**
 * The sheet size, and why it is the one number in this file worth spending on.
 *
 * This canvas carries the ENTIRE rotunda floor — 31.6 m of it, corner to
 * corner — and it is the surface a visitor spends the most time standing two
 * metres above and looking straight down at. At 4096 that is 130 px to the
 * metre: a 3 px rule is a 23 mm line, and every ruled circle in the
 * composition was being magnified about three times on screen. That is what
 * reads as "sloppy" — not the drawing, the resolution it was drawn at.
 *
 * 6144 buys 194 px/m for 2.25× the texels (≈200 MB resident with mipmaps).
 * That is a lot for one texture and it is still the right trade here: it is
 * ONE sheet, it is the floor of the room the whole building opens onto, and
 * nothing else in the museum is examined from that distance. 8192 would be
 * another 120 MB on top and is the next thing to try if this still reads soft,
 * but past roughly this density the limit stops being the texture and starts
 * being the anisotropic filter at grazing angles.
 */
const MANDALA_PX = 6144;

export function cosmographiaMandala(seed = 91): THREE.CanvasTexture {
  return rebakeable(`cosmographia|${seed}`, [MANDALA_PX, MANDALA_PX], (ctx, S) => {
    const rng = mulberry32(seed);
    const C = S / 2;
    /** world metres → canvas pixels */
    const P = C / MANDALA_R;
    sheetPxPerM = P;
    const r = (m: number) => m * P;
    /** world point → canvas point */
    const at = (wx: number, wz: number): [number, number] => [C + wx * P, C + wz * P];
    const R = MANDALA_RINGS;

    ctx.clearRect(0, 0, S, S);

    /* ——— the woven ground, out to the pavement ——— */
    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, r(R.pavementIn), 0, Math.PI * 2);
    ctx.clip();
    cloth(ctx, rng, OXBLOOD, 0, 0, S, S, seed);
    // the field is not one dye: the orbit ground is a shade warmer than the
    // heart, so the spheres read as a disc set into it rather than as more rug
    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, r(R.spheres), 0, Math.PI * 2);
    ctx.clip();
    cloth(ctx, rng, INDIGO, 0, 0, S, S, seed + 3);
    ctx.restore();
    ctx.restore();

    /* ——— the sun at the axis ——— */
    const sunR = r(R.sun);
    const sunG = ctx.createRadialGradient(C, C, sunR * 0.1, C, C, sunR);
    sunG.addColorStop(0, GOLD_LIT);
    sunG.addColorStop(0.62, GOLD);
    sunG.addColorStop(1, shade(BRONZE, -0.12));
    ctx.fillStyle = sunG;
    ctx.beginPath();
    ctx.arc(C, C, sunR, 0, Math.PI * 2);
    ctx.fill();
    // a rayed sun in couched thread, alternating straight and waved rays as the
    // engravers drew them — the solar symbol the brief asks for, at the exact
    // centre of the building and therefore under the dome's oculus
    for (let i = 0; i < 24; i++) {
      const t = (i / 24) * Math.PI * 2;
      const long = i % 2 === 0;
      const l0 = sunR * 0.62;
      const l1 = sunR * (long ? 1.34 : 1.1);
      const pts: [number, number][] = [];
      for (let k = 0; k <= 6; k++) {
        const d = l0 + ((l1 - l0) * k) / 6;
        const wob = long ? 0 : Math.sin((k / 6) * Math.PI * 2) * sunR * 0.05;
        pts.push([C + Math.cos(t) * d - Math.sin(t) * wob, C + Math.sin(t) * d + Math.cos(t) * wob]);
      }
      stitch(ctx, rng, pts, sunR * 0.05, GOLD_LIT, sunR * 0.1, 0.3);
    }
    ctx.fillStyle = 'rgba(40,28,14,0.5)';
    ctx.beginPath();
    ctx.arc(C, C, sunR * 0.38, 0, Math.PI * 2);
    ctx.fill();
    stitchRing(ctx, rng, C, C, sunR * 0.5, sunR * 0.06, GOLD_LIT, sunR * 0.14);

    /* ——— the seven spheres ——— */
    for (let i = 0; i < 7; i++) {
      const rr = r(R.sun + ((R.spheres - 0.5 - R.sun) * (i + 1)) / 7);
      stitchRing(ctx, rng, C, C, rr, r(0.035), i % 2 ? BRONZE : GOLD, r(0.09));
      // each sphere carries its planet, set on a different spoke so the eye
      // walks outward around the diagram instead of down one line
      const t = ((i * 3) / 7) * Math.PI * 2 + 0.4;
      couched(ctx, rng, PLANET_GLYPHS[i], C + Math.cos(t) * rr, C + Math.sin(t) * rr, r(0.34), GOLD_LIT);
    }
    // and the hermetic heptagram binding them, the figure that orders the week
    stitch(ctx, rng, starPolygon(C, C, r(R.spheres - 0.62), 7, 3, -Math.PI / 2), r(0.028), BRONZE, r(0.1), 0.25);
    brassRing(ctx, C, C, r(R.spheres), r(0.055), 0.9);

    /* ——— the great orbit field: the observatory proper ——— */
    // the decagram, struck on the ten gates. This is the figure that makes the
    // floor a plan of THIS building — its points are the ten doorways, so a
    // visitor standing anywhere on it is standing on a line that ends at a way out.
    // {10/3} only. A {10/4} was laid over it and had to come out: gcd(10,4) is
    // 2, so the walk closes after five vertices and draws a pentagon instead of
    // a star — a hard square-ish outline sitting across the orbit field with no
    // business being there. Ten-pointed stars come in exactly two honest forms
    // and this is the one that reads.
    stitch(ctx, rng, starPolygon(C, C, r(R.orbits - 0.35), 10, 3, GATE_ANGLES[0]), r(0.04), BRONZE, r(0.12), 0.25);
    // six rosettes of interlocking circles ride the field between the spokes
    for (let i = 0; i < 10; i++) {
      const t = GATE_ANGLES[i] + Math.PI / 10;
      const rr = r((R.spheres + R.orbits) / 2 + 0.35);
      seedOfLife(ctx, rng, C + Math.cos(t) * rr, C + Math.sin(t) * rr, r(0.62), r(0.028), i % 2 ? GOLD : BRONZE);
    }
    /* The four elements stood at the quarters here and are GONE.
     *
     * They were nearly a metre across, struck in plain gold outline, and they
     * sat on the open field between the sphere ring and the orbit rules with
     * nothing else at that radius — so at standing height they read as four
     * bare triangles dropped on the carpet rather than as part of the drawing.
     * Every other device on this sheet either rides a rule, closes a ring or
     * fills a sector; these did none of those. The field they were on carries
     * the composition better empty. */
    // three orbit rules, the outermost doubled as an armillary's scale is
    for (const m of [R.spheres + 1.7, R.spheres + 2.9, R.orbits - 0.12]) stitchRing(ctx, rng, C, C, r(m), r(0.032), GOLD, r(0.1));

    /* ——— the zodiac band ——— */
    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, r(R.zodiac), 0, Math.PI * 2);
    ctx.arc(C, C, r(R.orbits), 0, Math.PI * 2, true);
    ctx.clip();
    cloth(ctx, rng, INDIGO, 0, 0, S, S, seed + 7);
    ctx.restore();
    // The twelvefold ring runs against the tenfold spokes on purpose — two
    // scales on one instrument. Aries is set at the apse (north, −z) so the
    // band's order agrees with the sign order painted on the dome above it.
    const zMid = r((R.orbits + R.zodiac) / 2);
    for (let i = 0; i < 12; i++) {
      const t = -Math.PI / 2 + (i / 12) * Math.PI * 2;
      const tm = t + Math.PI / 12;
      // the division between houses
      brassLine(ctx, [
        [C + Math.cos(t) * r(R.orbits), C + Math.sin(t) * r(R.orbits)],
        [C + Math.cos(t) * r(R.zodiac), C + Math.sin(t) * r(R.zodiac)],
      ], r(0.035));
      couched(ctx, rng, ZODIAC[i].glyph, C + Math.cos(tm) * zMid, C + Math.sin(tm) * zMid, r(0.46), GOLD_LIT);
      // the degree scale — thirty ticks to a house, every fifth one long
      for (let d = 1; d < 30; d++) {
        const td = t + (d / 30) * (Math.PI / 6);
        const long = d % 5 === 0;
        const r0 = r(R.zodiac) - r(long ? 0.19 : 0.1);
        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = long ? GOLD : shade(BRONZE, -0.05);
        ctx.lineWidth = r(long ? 0.02 : 0.012);
        ctx.beginPath();
        ctx.moveTo(C + Math.cos(td) * r0, C + Math.sin(td) * r0);
        ctx.lineTo(C + Math.cos(td) * r(R.zodiac), C + Math.sin(td) * r(R.zodiac));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    brassRing(ctx, C, C, r(R.orbits), r(0.06));
    brassRing(ctx, C, C, r(R.zodiac), r(0.06));

    /* ——— the pale ring ———
     *
     * This was struck as a limestone pavement: procedural bedding, shell
     * flecks, crazing, forty cut voussoirs and a hundred and fifty chipped
     * arrises. It was the only surface left in the composition still drawing
     * its own material out of arithmetic, and next to the ways and the
     * ambulatory — which now carry a real scanned pile — it read exactly as
     * what it was, a flat pale band of noise between two pieces of cloth.
     *
     * So it is woven now, like everything else here: the same scan, the same
     * `cloth` treatment, in an undyed greige wool. Undyed rather than grey on
     * purpose — the ring's job in the composition is to be the one PALE course
     * in a floor of reds, which is what separates the mandala's drawing from
     * the ambulatory outside it, and natural fleece is how a carpet gets pale
     * without anybody dyeing it that colour.
     *
     * What was cut into the stone stays on the cloth: the ten gate marks, the
     * twenty-eight moons and the brass spokes are laid over it below, which is
     * a change of construction from inlay to appliqué and reads as one.
     */
    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, r(R.pavementOut), 0, Math.PI * 2);
    ctx.arc(C, C, r(R.pavementIn), 0, Math.PI * 2, true);
    ctx.clip();
    cloth(ctx, rng, STONE, 0, 0, S, S, seed + 61);
    // Forty radial courses, kept from the pavement — the rhythm was doing real
    // work (forty is 4 × 10, so they land on the gates AND the cardinals) — but
    // rewoven as SEAMS between forty strips of cloth rather than cut as open
    // joints: a soft dark line with a lit lip on one side, not a black slot.
    for (let i = 0; i < 40; i++) {
      const t = GATE_ANGLES[0] + (i / 40) * Math.PI * 2;
      const p0: [number, number] = [C + Math.cos(t) * r(R.pavementIn), C + Math.sin(t) * r(R.pavementIn)];
      const p1: [number, number] = [C + Math.cos(t) * r(R.pavementOut), C + Math.sin(t) * r(R.pavementOut)];
      for (const [off, tone, wd] of [[0, 'rgba(38,32,22,0.34)', 0.028], [r(0.03), 'rgba(236,226,198,0.22)', 0.02]] as [number, string, number][]) {
        ctx.strokeStyle = tone;
        ctx.lineWidth = r(wd);
        ctx.beginPath();
        ctx.moveTo(p0[0] + off, p0[1]);
        ctx.lineTo(p1[0] + off, p1[1]);
        ctx.stroke();
      }
    }
    for (const m of [R.pavementIn + 0.9, R.pavementIn + 1.8]) {
      ctx.strokeStyle = 'rgba(38,32,22,0.26)';
      ctx.lineWidth = r(0.026);
      ctx.beginPath();
      ctx.arc(C, C, r(m), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    /* the ten brass spokes inlaid across the pavement — the ways, continued
     * through the stone so the diagram never breaks at a change of material */
    for (const [gi, a] of GATE_ANGLES.entries()) {
      for (const s of [-1, 1]) {
        const off = r(1.55) * s;
        const [ax, ay] = [Math.cos(a), Math.sin(a)];
        const [nx, ny] = [-ay, ax];
        brassLine(ctx, [
          [C + ax * r(R.pavementIn) + nx * off, C + ay * r(R.pavementIn) + ny * off],
          [C + ax * r(R.pavementOut) + nx * off, C + ay * r(R.pavementOut) + ny * off],
        ], r(0.045));
      }
      /* The gate's own mark, cut into the middle of the stone — and the ten of
       * them are TEN DIFFERENT MARKS. Ten copies of one star round a ring is
       * the single most visible repetition on the floor: the eye catches the
       * ring, walks it, and finds the same figure ten times, which tells it
       * the whole drawing was stamped. Seven are the planetary seals traced on
       * their kameas (in the order of the spheres, so the mark on a gate agrees
       * with the ladder inside it) and the last three are the marks of the
       * three principles — salt, sulphur, mercury — struck as geometry. */
      const rr = r((R.pavementIn + R.pavementOut) / 2);
      const [gx, gy] = [C + Math.cos(a) * rr, C + Math.sin(a) * rr];
      ctx.fillStyle = 'rgba(30,26,20,0.55)';
      ctx.beginPath();
      ctx.arc(gx, gy, r(0.5), 0, Math.PI * 2);
      ctx.fill();
      if (gi < 7) {
        kameaSigil(ctx, rng, gx, gy, r(0.34), PLANET_ORDERS[gi], BRONZE, r(0.028));
      } else if (gi === 7) {
        // salt: a circle barred through
        brassRing(ctx, gx, gy, r(0.33), r(0.03));
        brassLine(ctx, [[gx - r(0.33), gy], [gx + r(0.33), gy]], r(0.03));
      } else if (gi === 8) {
        // sulphur: a triangle over a cross
        brassLine(ctx, starPolygon(gx, gy - r(0.1), r(0.28), 3, 1, -Math.PI / 2), r(0.03));
        brassLine(ctx, [[gx, gy + r(0.08)], [gx, gy + r(0.4)]], r(0.03));
        brassLine(ctx, [[gx - r(0.14), gy + r(0.28)], [gx + r(0.14), gy + r(0.28)]], r(0.03));
      } else {
        // mercury: the horned circle over its cross
        brassRing(ctx, gx, gy, r(0.19), r(0.028));
        brassLine(ctx, [[gx - r(0.22), gy - r(0.2)], [gx, gy - r(0.38)], [gx + r(0.22), gy - r(0.2)]], r(0.028));
        brassLine(ctx, [[gx, gy + r(0.19)], [gx, gy + r(0.44)]], r(0.028));
        brassLine(ctx, [[gx - r(0.15), gy + r(0.33)], [gx + r(0.15), gy + r(0.33)]], r(0.028));
      }
      brassRing(ctx, gx, gy, r(0.5), r(0.035));
    }

    /* the lunar month, twenty-eight phases inlaid round the outer course */
    for (let i = 0; i < 28; i++) {
      const t = -Math.PI / 2 + (i / 28) * Math.PI * 2;
      const rr = r(R.pavementOut - 0.42);
      const [mx, my] = [C + Math.cos(t) * rr, C + Math.sin(t) * rr];
      const mR = r(0.24);
      // A real phase, drawn in three strokes rather than by intersecting discs:
      // the whole limb lit, the unlit half laid over it, then the terminator —
      // an ellipse of half-width |cos 2πφ| that is DARK while the moon is a
      // crescent and LIT once it is gibbous. That sign flip is the whole trick,
      // and it is why this needs no arc-sweep flags to get right.
      const phi = i / 28;
      const k = Math.cos(phi * Math.PI * 2); // +1 new, −1 full
      const waxing = phi < 0.5;
      const lit = shade(CREAM, 0.06);
      ctx.save();
      ctx.beginPath();
      ctx.arc(mx, my, mR, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = lit;
      ctx.fillRect(mx - mR, my - mR, mR * 2, mR * 2);
      ctx.fillStyle = SLATE;
      ctx.beginPath();
      // canvas 0 rad is +x, so the left half is [π/2, 3π/2]
      ctx.arc(mx, my, mR, waxing ? Math.PI / 2 : -Math.PI / 2, waxing ? Math.PI * 1.5 : Math.PI / 2);
      ctx.fill();
      ctx.fillStyle = k > 0 ? SLATE : lit;
      ctx.beginPath();
      ctx.ellipse(mx, my, Math.abs(k) * mR, mR, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      brassRing(ctx, mx, my, mR, r(0.026));
    }
    brassRing(ctx, C, C, r(R.pavementIn), r(0.07));
    brassRing(ctx, C, C, r(R.pavementOut), r(0.07));

    /* ——— the ceremonial ambulatory ——— */
    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, r(R.edge), 0, Math.PI * 2);
    ctx.arc(C, C, r(R.pavementOut), 0, Math.PI * 2, true);
    ctx.clip();
    cloth(ctx, rng, BURGUNDY, 0, 0, S, S, seed + 11);
    // The ring alternates its ground by sector — the wedge ON a gate is the
    // deeper oxblood the ways are woven in, the wedge BETWEEN gates a quieter
    // umber. That is what makes a visitor read the gates off the floor without
    // being told: the darker tongue points at the door.
    for (let i = 0; i < 20; i++) {
      const t0 = GATE_ANGLES[0] - Math.PI / 20 + (i / 20) * Math.PI * 2;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(C, C);
      ctx.arc(C, C, r(R.edge), t0, t0 + Math.PI / 10);
      ctx.closePath();
      ctx.clip();
      cloth(ctx, rng, i % 2 === 0 ? WAY_GROUND : UMBER, 0, 0, S, S, seed + 13 + i);
      ctx.restore();
    }

    ctx.restore();

    /* NOTHING IS DRAWN ON THIS RING.
     *
     * The ambulatory carried a knotwork guard, a green fillet, ten embroidered
     * tongues and thirty small figures, and all of it came out. It is the same
     * lesson the ways learned (see `ceremonialWay`): this ring is 3.5 m of
     * carpet seen at a grazing angle from anywhere in a 31 m room, and gold
     * ornament laid on it at that angle collapses into a ring of glinting
     * scribble round the good drawing in the middle. The mandala inside the
     * stone pavement is where the iconography lives and where it can be read;
     * out here the carpet's job is to be carpet — dyed wool, a darker tongue
     * pointing at each door, and the wear of everyone who has walked round it.
     *
     * The sector dye above does the one piece of work this ring genuinely owes
     * the building: the deeper wedge points at the gate, so a visitor reads the
     * ten ways out off the floor without anything being drawn to tell them.
     */

    /* ——— the outer guard and the fringe ——— */
    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, r(R.edge), 0, Math.PI * 2);
    ctx.arc(C, C, r(R.ambulatory), 0, Math.PI * 2, true);
    ctx.clip();
    // the pale outer band, as colour. The knot guard that ran round it is gone
    // with the rest of the ambulatory's ornament: a 200-wave gold chain on a
    // 15 m radius is a hairline at any distance you can actually stand at, and
    // a hairline of gold on wool is aliasing, not embroidery.
    cloth(ctx, rng, CREAM, 0, 0, S, S, seed + 29);
    ctx.restore();

    /* ——— the alcoves: a small worn rug under each reading table ——— */
    for (const [ai, al] of ALCOVES.entries()) {
      const [cx, cy] = at(al.x, al.z);
      ctx.save();
      ctx.beginPath();
      if (al.rect) ctx.rect(cx - r(al.rect[0]) / 2, cy - r(al.rect[1]) / 2, r(al.rect[0]), r(al.rect[1]));
      else ctx.arc(cx, cy, r(al.r), 0, Math.PI * 2);
      ctx.clip();
      cloth(ctx, rng, CRIMSON_AGED, cx - S / 2, cy - S / 2, S, S, seed + 41 + ai);
      // These are the oldest things on the floor and have to look it. The first
      // cut skipped this wash and the four of them read as fresh pink patches
      // dropped on the pavement — which is precisely the "rug placed after the
      // building was finished" the redesign exists to get rid of. They are
      // pushed DOWN, below the value of the stone they lie on.
      const age = ctx.createRadialGradient(cx, cy, 0, cx, cy, r(2.4));
      age.addColorStop(0, 'rgba(28,20,14,0.34)');
      age.addColorStop(1, 'rgba(28,20,14,0.06)');
      ctx.fillStyle = age;
      ctx.fillRect(cx - S / 2, cy - S / 2, S, S);
      ctx.restore();
      const rw = al.rect ? r(al.rect[0]) / 2 : r(al.r);
      const rh = al.rect ? r(al.rect[1]) / 2 : r(al.r);
      // a plain gold guard and a medallion — a good rug, not a great one
      ctx.strokeStyle = GOLD;
      ctx.globalAlpha = 0.62;
      ctx.lineWidth = r(0.07);
      ctx.beginPath();
      if (al.rect) ctx.rect(cx - rw + r(0.16), cy - rh + r(0.16), rw * 2 - r(0.32), rh * 2 - r(0.32));
      else ctx.arc(cx, cy, rw - r(0.16), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // and its own medallion — a different pentacle under each table, so the
      // four alcoves are four rugs rather than one rug laid four times
      pentacleRoundel(ctx, rng, cx, cy, Math.min(rw, rh) * 0.5, ai * 2 + 1, GOLD);
      // and the frayed edge that says it has been dragged straight a thousand times
      const edge: [number, number][] = al.rect
        ? [[cx - rw, cy - rh], [cx + rw, cy - rh], [cx + rw, cy + rh], [cx - rw, cy + rh], [cx - rw, cy - rh]]
        : Array.from({ length: 49 }, (_, i) => {
            const t = (i / 48) * Math.PI * 2;
            return [cx + Math.cos(t) * rw, cy + Math.sin(t) * rw] as [number, number];
          });
      fray(ctx, rng, edge, r(0.09), r(0.13));
    }

    /* ——— centuries of feet ——— */
    // The ways in and out: heaviest of all, because every visitor walks them.
    for (const a of GATE_ANGLES) tread(ctx, rng, C, C, a, r(R.spheres), r(R.edge), r(1.5));
    // The gathering at the instrument — scholars stand round the orrery, so the
    // ring just off its rim is scuffed the whole way round rather than in tracks.
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const gather = ctx.createRadialGradient(C, C, r(R.spheres + 0.2), C, C, r(R.spheres + 2.6));
    gather.addColorStop(0, 'rgba(255,244,214,0.5)');
    gather.addColorStop(1, 'rgba(255,244,214,0)');
    ctx.fillStyle = gather;
    ctx.fillRect(0, 0, S, S);
    ctx.restore();
    // and the quiet corners keep their colour: a slow darkening toward the wall
    // that also reads as the room's own falloff away from the oculus
    const vign = ctx.createRadialGradient(C, C, r(R.pavementOut), C, C, r(R.edge));
    vign.addColorStop(0, 'rgba(20,14,10,0)');
    vign.addColorStop(1, 'rgba(20,14,10,0.3)');
    ctx.fillStyle = vign;
    ctx.beginPath();
    ctx.arc(C, C, r(R.edge), 0, Math.PI * 2);
    ctx.fill();

    /* ——— the edge itself ———
     *
     * Frayed and fringed everywhere EXCEPT across a gate. The rim used to be
     * fringed the whole way round, which meant a line of loose warp threads lay
     * straight across the mouth of every hall — a carpet ENDING exactly where
     * the drawing needs it to carry on into the runner. The apron above paints
     * the runner's stripes through that arc; the fringe has to get out of their
     * way or the stripes run into a hem.
     *
     * The gap is the way's half-width plus 150 mm of margin, converted from
     * metres of arc to radians at the rim.
     */
    const gaps = GATE_ANGLES.map((a) => [a, (WAY_HALF[gateKind(a)] + 0.15) / R.edge] as const);
    const inGate = (t: number): boolean =>
      gaps.some(([a, dt]) => {
        let d = Math.abs(((t - a + Math.PI) % (Math.PI * 2)) - Math.PI);
        if (d > Math.PI) d = Math.PI * 2 - d;
        return d < dt;
      });
    // built as RUNS between the gates, not as one ring with holes: `fringe` and
    // `fray` both walk a polyline, and feeding them a list that jumps a gate
    // would lay threads straight across the gap they exist to leave
    let run: [number, number][] = [];
    let runOut: [number, number][] = [];
    const flush = () => {
      if (run.length > 1) {
        fringe(ctx, rng, run, runOut, r(0.2), r(0.06));
        fray(ctx, rng, run, r(0.11), r(0.16));
      }
      run = [];
      runOut = [];
    };
    for (let i = 0; i <= 900; i++) {
      const t = (i / 900) * Math.PI * 2;
      if (inGate(t)) {
        flush();
        continue;
      }
      run.push([C + Math.cos(t) * r(R.edge), C + Math.sin(t) * r(R.edge)]);
      runOut.push([Math.cos(t), Math.sin(t)]);
    }
    flush();
    // finally, cut everything outside the circle — the canvas corners would
    // otherwise carry weave into the geometry's own rim
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(C, C, r(R.edge) + r(0.16), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, false);
}

/* ══════════════ 2. THE CEREMONIAL WAY ══════════════ */

/**
 * How many metres of hall one tile of the way covers.
 *
 * 19.2 m is not a taste decision, it is 6 × the way's 3.2 m width, and that is
 * the whole of the reason: the sheet is 1024 × 6144, so it carries 320 pixels
 * per metre ACROSS the way and 320 pixels per metre ALONG it. Texels are square.
 *
 * They were not before, and that is what "stretched" was. The old sheet put
 * 160 px on a metre of width and 197 on a metre of length; the one after it put
 * 320 against 197. Under either, a shape drawn in this canvas arrives in the
 * hall smeared along its length — every knot of the weave a rectangle, every
 * curve leaning. No amount of ornament survives that and no amount of
 * resolution hides it. The fix is arithmetic, not art: the tile is a whole
 * number of carpet widths and the canvas is the same multiple of its own width.
 */
export const WAY_TILE_M = 19.2;
/** the way's own width, and therefore the sheet's. See above. */
const WAY_W_M = 3.2;

/**
 * The half-widths of the ways, per gate kind. THESE LIVE HERE, not in
 * cosmographia.tsx, because the mandala has to paint the ways' own stripes into
 * its outer ring to meet them (see `wayApron`) — and a carpet whose stripes
 * stop 200 mm short of the runner they are supposed to continue into is worse
 * than no attempt at all. One list, read by the geometry and by the paint.
 *
 *   wing  — more than double the old runner's 0.9; still clears the chronology
 *           lecterns at n 2.5 and the shelf faces at n 3.16
 *   entry — the corridor is 6 m, but the two guardians stand at x ±2.5 with a
 *           0.9 m footing, so the way passes BETWEEN them
 *   apse  — deliberately narrow: Boaz and Jachin stand at x ±1.56 and end up
 *           flanking a ceremonial approach, which is what those two are for
 */
export const WAY_HALF = { wing: 1.6, entry: 1.5, apse: 1.2 } as const;

/** which kind of gate an angle is. The entrance is +z and the apse −z. */
export function gateKind(a: number): keyof typeof WAY_HALF {
  if (Math.abs(Math.sin(a) - 1) < 1e-6) return 'entry';
  if (Math.abs(Math.sin(a) + 1) < 1e-6) return 'apse';
  return 'wing';
}

/**
 * The dye the ways are woven in — the SAME dye the rotunda's ambulatory ring
 * uses in the wedge each way leaves from, which is the whole point: the ring
 * and the runner are one carpet, so they are one colour, and the join between
 * the two sheets is nothing but a change of wear.
 */
const WAY_GROUND = OXBLOOD;

/**
 * The ways: the carpet that runs out of the rotunda and down every hall.
 *
 * ── Why there is no ornament on this ───────────────────────────────────────
 *
 * There was, twice. First a single eight-pointed star repeated the length of
 * every hall, which read as wallpaper; then a full Solomonic programme —
 * planetary seals traced on their kameas, pentacles, character rings, a
 * stepped border, a lattice — which read as clutter. Both failed the same test
 * for the same reason, and the reason is worth writing down because it will
 * come up again for the next surface in this building:
 *
 * ORNAMENT DRAWN INTO A TEXTURE IS ORNAMENT SEEN AT EVERY DISTANCE AT ONCE.
 * A real carpet's medallion is one object your eye finds once. A medallion in
 * a tiled floor texture is a shape that recurs on a fixed pitch across 48 m of
 * hall, under a camera that can stand anywhere; at the far end it is a row of
 * identical marks marching to the vanishing point, and no choice of mark fixes
 * that. The thing a real carpet actually gives a room, at the distance a room
 * is seen from, is not its pattern. It is COLOUR and NAP: a deep even field
 * that changes tone as you walk along it, darker at the edges, walked pale
 * down the middle, with the loom's own irregularity everywhere in it.
 *
 * So this sheet is exactly that and nothing else — the real scanned pile
 * (`cloth`), the dyer's shelf, a quiet border of colour, and centuries of
 * wear. The drawing that carries the building's iconography stays where it can
 * be seen properly and only once: the rotunda mandala, which is a single
 * 31 m sheet under the visitor's feet at the centre of the plan.
 *
 * u runs ACROSS the way (0..1 over its full width) and v ALONG it. The long
 * edges are frayed into the alpha channel, which is what lets the boards show
 * past the selvedge instead of the carpet ending on a ruled line.
 */
export function ceremonialWay(seed = 31): THREE.CanvasTexture {
  return rebakeable(`cosmoway|${seed}`, [1024, 6144], (ctx, w, h) => {
    const rng = mulberry32(seed);
    sheetPxPerM = w / WAY_W_M;
    const M = sheetPxPerM; // one metre, in pixels
    ctx.clearRect(0, 0, w, h);

    /* ——— the ground ——— */
    cloth(ctx, rng, WAY_GROUND, 0, 0, w, h, seed);

    /* No borders, no bands, no field panel.
     *
     * The runner had a cream selvedge, an umber fillet, a wide indigo guard and
     * a burgundy field — the anatomy of a real hand-knotted runner, and wrong
     * here for a reason that has nothing to do with whether it was handsome. A
     * way does not START at the hall. It starts under the rotunda's ambulatory,
     * 800 mm inside the mandala's rim, and the ambulatory is plain dyed wool.
     * Any banding on the runner therefore has to be BORN somewhere in the middle
     * of the rotunda floor, and wherever that is, it is a line of stripes
     * appearing out of a plain carpet — which is precisely the "overlapping
     * strip of a different colour" this is meant to fix.
     *
     * So the ways are the ring's own cloth, continued: one dye, one weave, out
     * of the rotunda and down 48 m of hall. The floor changes at the doors
     * because the light does, not because the carpet does.
     */
    /* ——— the channel the timeline rule beds into ———
     * Every wing carries a slate-and-brass timeline down its centre line, and
     * the way is woven to receive it: a barely darker channel exactly wide
     * enough for the rule. Only a HAIR darker — in the entrance and the apse
     * there is no rule to cover it, and a dark stripe down the middle of a
     * carpet reads as a gap in the floor rather than as cloth.
     */
    ctx.save();
    ctx.beginPath();
    ctx.rect(w * 0.45, 0, w * 0.1, h);
    ctx.clip();
    cloth(ctx, rng, shade(WAY_GROUND, -0.02), 0, 0, w, h, seed + 4);
    ctx.restore();

    /* ——— nap ———
     * The one thing a flat sheet has to fake to read as pile: cut wool lies
     * over, and it lies over in patches, so the same carpet is lighter walking
     * up it than down it. These are broad, soft, and low-contrast — you should
     * never be able to point at one, only notice the floor is not evenly lit.
     */
    for (let i = 0; i < 70; i++) {
      const cx = rng() * w;
      const cy = rng() * h;
      const rx = M * (0.4 + rng() * 1.6);
      const ry = M * (0.5 + rng() * 3.5);
      const pale = rng() > 0.5;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
      g.addColorStop(0, pale ? 'rgba(226,212,180,0.09)' : 'rgba(26,18,12,0.11)');
      g.addColorStop(1, pale ? 'rgba(226,212,180,0)' : 'rgba(26,18,12,0)');
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
      ctx.fillStyle = g;
      ctx.fillRect(-Math.max(rx, ry), -Math.max(rx, ry), Math.max(rx, ry) * 2, Math.max(rx, ry) * 2);
      ctx.restore();
    }

    /* ——— centuries of feet ——— */
    // the middle is walked to the warp, the selvedge keeps its dye
    // Held well back at the selvedges. At 0.22 the two edges came out as dark
    // stripes down the length of the runner, and dark stripes on both sides of
    // a carpet are exactly how you draw "a separate strip laid on top of the
    // floor" — the thing this surface is supposed to stop looking like now that
    // it shares the ring's dye. The pale walked centre does the work instead;
    // the edges only need to be a little quieter than it.
    const worn = ctx.createLinearGradient(0, 0, w, 0);
    worn.addColorStop(0, 'rgba(0,0,0,0.09)');
    worn.addColorStop(0.16, 'rgba(0,0,0,0.03)');
    worn.addColorStop(0.5, 'rgba(226,212,180,0.14)');
    worn.addColorStop(0.84, 'rgba(0,0,0,0.03)');
    worn.addColorStop(1, 'rgba(0,0,0,0.09)');
    ctx.fillStyle = worn;
    ctx.fillRect(0, 0, w, h);
    // and unevenly down the length too: some stretches of a hall are stood on
    // and some only crossed. Feathered at both ends — drawn as plain rects
    // these were pale BARS lying across the carpet, which is what a light leak
    // in a photograph looks like. Wear has no edges.
    for (let i = 0; i < 30; i++) {
      const y = rng() * h;
      const hh = M * (0.3 + rng() * 1.8);
      const pale = rng() > 0.45;
      const tone = pale ? '222,208,171' : '32,23,15';
      const g = ctx.createLinearGradient(0, y, 0, y + hh);
      g.addColorStop(0, `rgba(${tone},0)`);
      g.addColorStop(0.5, `rgba(${tone},${0.05 + rng() * 0.07})`);
      g.addColorStop(1, `rgba(${tone},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, y, w, hh);
    }
    ctx.globalAlpha = 1;

    /* ——— the selvedge, frayed into the alpha ——— */
    const left: [number, number][] = [[w * 0.022, 0], [w * 0.022, h]];
    const right: [number, number][] = [[w * 0.978, 0], [w * 0.978, h]];
    fray(ctx, rng, left, w * 0.016, M * 0.06);
    fray(ctx, rng, right, w * 0.016, M * 0.06);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, w * 0.012, h);
    ctx.fillRect(w * 0.988, 0, w * 0.012, h);
    ctx.restore();
  });
}

/* ══════════════ 3. THE OBSERVATORY ROUNDEL ══════════════ */

/**
 * The stone disc that BREAKS each way where it passes a gallery.
 *
 * This is the brief's "alternate carpet and stone sections" and it does real
 * work beyond variety: the galleries are where a visitor stops to look at the
 * art, and stopping on stone rather than on carpet is what tells the feet the
 * procession has paused. A compass rose, because a roundel this size in a
 * cathedral pavement is nearly always one, and because it points the visitor
 * back at the centre they came from.
 */
export function observatoryRoundel(seed = 17): THREE.CanvasTexture {
  return makeTexture(`cosmoroundel|${seed}`, [1024, 1024], (ctx, S) => {
    const rng = mulberry32(seed);
    const C = S / 2;
    ctx.clearRect(0, 0, S, S);

    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, C * 0.995, 0, Math.PI * 2);
    ctx.clip();
    pavement(ctx, rng, STONE, 0, 0, S, S);
    // the darker field the rose sits on
    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, C * 0.7, 0, Math.PI * 2);
    ctx.clip();
    pavement(ctx, rng, STONE_DK, 0, 0, S, S);
    ctx.restore();
    ctx.restore();

    // sixteen points, the long eight gilt and the short eight in slate — the
    // standard rose, and the one that reads at a glance from standing height
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * Math.PI * 2 - Math.PI / 2;
      const long = i % 2 === 0;
      const r1 = C * (long ? 0.66 : 0.44);
      const halfW = (Math.PI / 16) * C * (long ? 0.32 : 0.22);
      const nx = -Math.sin(t);
      const ny = Math.cos(t);
      // each point is drawn as two facets so the rose has a fold down its axis
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(C, C);
        ctx.lineTo(C + Math.cos(t) * r1, C + Math.sin(t) * r1);
        ctx.lineTo(C + nx * halfW * s, C + ny * halfW * s);
        ctx.closePath();
        ctx.fillStyle = long
          ? s > 0 ? shade(BRONZE, 0.1) : shade(BRONZE, -0.16)
          : s > 0 ? shade(SLATE, 0.1) : shade(SLATE, -0.06);
        ctx.fill();
        ctx.strokeStyle = 'rgba(20,16,12,0.5)';
        ctx.lineWidth = S * 0.0035;
        ctx.stroke();
      }
    }
    // the boss
    ctx.fillStyle = shade(BRONZE, 0.16);
    ctx.beginPath();
    ctx.arc(C, C, C * 0.075, 0, Math.PI * 2);
    ctx.fill();
    brassRing(ctx, C, C, C * 0.075, S * 0.006);

    // the outer courses: a brass rule, a ring of engraved zodiac, another rule
    brassRing(ctx, C, C, C * 0.7, S * 0.008);
    for (let i = 0; i < 12; i++) {
      const t = -Math.PI / 2 + ((i + 0.5) / 12) * Math.PI * 2;
      const rr = C * 0.83;
      // cut into the stone, not laid on it: a dark incision with a lit lower lip
      const gx = C + Math.cos(t) * rr;
      const gy = C + Math.sin(t) * rr;
      ctx.save();
      ctx.font = `${S * 0.075}px "Segoe UI Symbol", "Arial Unicode MS", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(240,232,208,0.32)';
      ctx.fillText(ZODIAC[i].glyph, gx, gy + S * 0.003);
      ctx.fillStyle = 'rgba(24,20,15,0.72)';
      ctx.fillText(ZODIAC[i].glyph, gx, gy);
      ctx.restore();
      ctx.strokeStyle = 'rgba(24,20,15,0.4)';
      ctx.lineWidth = S * 0.004;
      ctx.beginPath();
      ctx.moveTo(C + Math.cos(t - Math.PI / 12) * C * 0.71, C + Math.sin(t - Math.PI / 12) * C * 0.71);
      ctx.lineTo(C + Math.cos(t - Math.PI / 12) * C * 0.95, C + Math.sin(t - Math.PI / 12) * C * 0.95);
      ctx.stroke();
    }
    brassRing(ctx, C, C, C * 0.95, S * 0.01);

    // walked hollow in the middle, dirt in the joints at the rim
    // Warm, and not too pale. Under a chandelier this disc is the one lit thing
    // in a dark hall, so the highlight has to be held well back or it reads as a
    // white plate dropped on the boards rather than as stone set into them.
    const g = ctx.createRadialGradient(C, C, 0, C, C, C);
    g.addColorStop(0, 'rgba(232,206,158,0.1)');
    g.addColorStop(0.55, 'rgba(232,206,158,0.03)');
    g.addColorStop(1, 'rgba(26,19,12,0.4)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(C, C, C, 0, Math.PI * 2);
    ctx.fill();
    soiling(ctx, rng, 0, 0, S, S, 24);

    // and the disc itself, cut clean — this one is SET INTO the floor, so its
    // edge is a mason's line rather than a frayed selvedge
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(C, C, C * 0.985, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, false);
}
