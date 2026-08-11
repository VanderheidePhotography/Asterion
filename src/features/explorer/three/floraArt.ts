import * as THREE from 'three';
import { makeTexture, shade } from './textures';
import { mulberry32 } from '../../../domain/random';

/**
 * THE PLANTING — leaf sheets for the museum's greenery.
 *
 * These replace `leafCluster`, which was 26 flat ellipses scattered on a 128 px
 * square. Two things were wrong with it and both are fixed here.
 *
 * 1. IT WAS DRAWN AS A BLOB, so a plant was a blob. A leaf sheet has to be
 *    drawn as ONE PLANT SEEN FROM THE SIDE — a crown of fronds rising from a
 *    point at the bottom centre of the image — because that is the only way a
 *    quad carrying it can stand in a pot and look like something that grew
 *    there. Every sheet below springs from (w/2, h) and works upward.
 *
 * 2. IT WAS USED ON SPRITES. A `<sprite>` turns to face the camera every
 *    frame, so the old ferns pivoted as the visitor walked round them and had
 *    no thickness from any angle. These are meant for CROSS-QUADS — two or
 *    three fixed planes intersecting on the plant's axis — which is the oldest
 *    trick in real-time foliage and still the right one: from any direction you
 *    see one sheet nearly face-on and another edge-on, and the pair reads as
 *    volume. See `Greenery` in furniture.tsx.
 *
 * Everything is painted with alpha and meant to run under `alphaTest`, not
 * `transparent` — a room with forty transparent leaf quads in it spends the
 * whole frame sorting them, and a hard alpha edge is what a leaf has anyway.
 */

type Ctx = CanvasRenderingContext2D;
type Rng = () => number;

/* ————— the greens ————— */
/** Deliberately olive and dusty rather than emerald. These plants live by
 *  candlelight under a dome, and a saturated garden-centre green is the fastest
 *  way to make an interior look like a render. */
const FERN = '#4a6b42';
const PALM = '#55764a';
const IVY = '#3e5c3b';
const BOX = '#42603f';

/** one leaf, drawn as a pointed blade with a midrib and a little asymmetry */
function blade(
  ctx: Ctx,
  rng: Rng,
  x: number,
  y: number,
  len: number,
  wid: number,
  ang: number,
  tone: string,
  curl = 0.35,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const t = shade(tone, (rng() - 0.5) * 0.16);
  // the blade: two quadratics meeting at the tip, one belly fatter than the
  // other so no leaf is a perfect lens
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(wid * (0.95 + rng() * 0.3), -len * 0.42, curl * wid * 1.4, -len);
  ctx.quadraticCurveTo(-wid * (0.8 + rng() * 0.3), -len * 0.46, 0, 0);
  ctx.fillStyle = t;
  ctx.fill();
  // the underside catching light along one edge
  ctx.strokeStyle = shade(t, 0.11);
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1.1;
  ctx.stroke();
  // midrib and a few veins
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = shade(t, -0.13);
  ctx.lineWidth = Math.max(0.8, wid * 0.1);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(wid * 0.1, -len * 0.5, curl * wid * 1.4, -len);
  ctx.stroke();
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = 0.32;
  for (let i = 1; i < 5; i++) {
    const f = i / 5;
    ctx.beginPath();
    ctx.moveTo(wid * 0.06 * f, -len * f);
    ctx.lineTo((rng() > 0.5 ? 1 : -1) * wid * (0.6 - f * 0.35), -len * (f + 0.14));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** a stem or rachis: tapered, slightly bowed, drawn as a filled sliver so it
 *  never disappears at a distance the way a 1 px stroke does */
function stem(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, w0: number, tone: string): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  const mx = (x0 + x1) / 2 - nx * l * 0.05;
  const my = (y0 + y1) / 2 - ny * l * 0.05;
  ctx.beginPath();
  ctx.moveTo(x0 + nx * w0, y0 + ny * w0);
  ctx.quadraticCurveTo(mx + nx * w0 * 0.5, my + ny * w0 * 0.5, x1, y1);
  ctx.quadraticCurveTo(mx - nx * w0 * 0.5, my - ny * w0 * 0.5, x0 - nx * w0, y0 - ny * w0);
  ctx.closePath();
  ctx.fillStyle = tone;
  ctx.fill();
}

/** the general grime of a houseplant that lives indoors: a little dust, a
 *  couple of browned tips, and a darkening down into the crown where no light
 *  reaches. Applied last, over whatever has been drawn. */
function weather(ctx: Ctx, rng: Rng, w: number, h: number, browns: number): void {
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  // depth: the middle of the plant is in its own shade
  const g = ctx.createRadialGradient(w / 2, h * 0.78, 0, w / 2, h * 0.78, w * 0.55);
  g.addColorStop(0, 'rgba(12,18,10,0.42)');
  g.addColorStop(1, 'rgba(12,18,10,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // dust, settled on the upper faces
  for (let i = 0; i < 90; i++) {
    ctx.globalAlpha = 0.03 + rng() * 0.06;
    ctx.fillStyle = '#b9b096';
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h * 0.8, 3 + rng() * 14, 2 + rng() * 7, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // browned tips — the single clearest sign a plant is real and not decoration
  for (let i = 0; i < browns; i++) {
    ctx.globalAlpha = 0.35 + rng() * 0.4;
    ctx.fillStyle = rng() > 0.5 ? '#8a6a36' : '#6d4f2a';
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h * 0.5, 2 + rng() * 6, 4 + rng() * 12, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ══════════ the sheets ══════════ */

/**
 * A fern: a shuttlecock of pinnate fronds. Each frond is a rachis with two rows
 * of small leaflets shortening toward the tip, which is what actually makes a
 * fern legible as a fern rather than as a generic green thing — the silhouette
 * is serrated, not smooth.
 */
export function fernSheet(tone = FERN, seed = 15): THREE.CanvasTexture {
  return makeTexture(`fern|${tone}|${seed}`, [256, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const base = h - 4;
    const N = 11;
    for (let i = 0; i < N; i++) {
      // fronds fan out; the outer ones arch further over and hang lower
      const f = (i / (N - 1)) * 2 - 1; // −1 .. 1
      const ang = f * 1.18 + (rng() - 0.5) * 0.16;
      const len = h * (0.86 - Math.abs(f) * 0.3) * (0.85 + rng() * 0.3);
      const arch = f * 0.5;
      // the rachis, as a chain of points so leaflets can hang off it
      const pts: [number, number][] = [];
      const SEG = 13;
      for (let k = 0; k <= SEG; k++) {
        const t = k / SEG;
        // straight near the crown, curving over toward the tip
        const a = ang + arch * t * t;
        pts.push([cx + Math.sin(a) * len * t, base - Math.cos(a) * len * t * (1 - 0.16 * t * t)]);
      }
      const dark = shade(tone, -0.14 + (rng() - 0.5) * 0.1);
      for (let k = 0; k < SEG; k++)
        stem(ctx, pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], 2.4 * (1 - k / SEG) + 0.5, dark);
      // leaflets, alternating sides, shortening to the tip
      for (let k = 1; k <= SEG; k++) {
        const [px, py] = pts[k];
        const [qx, qy] = pts[k - 1];
        const along = Math.atan2(px - qx, -(py - qy));
        const taper = Math.sin((k / SEG) * Math.PI * 0.92);
        const ll = (h * 0.115) * taper * (0.8 + rng() * 0.4);
        for (const side of [-1, 1] as const) {
          blade(ctx, rng, px, py, ll, ll * 0.3, along + side * (1.02 + rng() * 0.2), tone, side * 0.3);
        }
      }
    }
    weather(ctx, rng, w, h, 7);
  }, false);
}

/**
 * A parlour palm / aspidistra: a few long strap leaves rising straight out of
 * the crown and bending over under their own weight. The tall pots use this —
 * it wants to be seen against the wall from below, so the silhouette is a small
 * number of big shapes rather than the fern's many small ones.
 */
export function palmSheet(tone = PALM, seed = 27): THREE.CanvasTexture {
  return makeTexture(`palm|${tone}|${seed}`, [256, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const base = h - 4;
    const N = 8;
    for (let i = 0; i < N; i++) {
      const f = (i / (N - 1)) * 2 - 1;
      const ang = f * 1.02 + (rng() - 0.5) * 0.2;
      const len = h * (0.92 - Math.abs(f) * 0.26) * (0.85 + rng() * 0.28);
      // the petiole
      const tipX = cx + Math.sin(ang) * len * 0.42;
      const tipY = base - Math.cos(ang) * len * 0.42;
      stem(ctx, cx + f * 5, base, tipX, tipY, 3.2, shade(tone, -0.18));
      // the blade, long and bowing over
      ctx.save();
      ctx.translate(tipX, tipY);
      ctx.rotate(ang + f * 0.34);
      const bl = len * 0.66;
      const bw = h * (0.075 + rng() * 0.03);
      const t = shade(tone, (rng() - 0.5) * 0.15);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(bw * 1.5, -bl * 0.55, bw * 0.5, -bl);
      ctx.quadraticCurveTo(-bw * 1.4, -bl * 0.5, 0, 0);
      ctx.fillStyle = t;
      ctx.fill();
      // the pleats a strap leaf folds along
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = shade(t, -0.16);
      ctx.lineWidth = 1.2;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(bw * 0.4 * k, -bl * 0.5, bw * (0.5 + 0.28 * k), -bl * (0.95 - Math.abs(k) * 0.05));
        ctx.stroke();
      }
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = shade(t, 0.12);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(bw * 1.5, -bl * 0.55, bw * 0.5, -bl);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    weather(ctx, rng, w, h, 6);
  }, false);
}

/**
 * A clipped box / myrtle shrub: a dense dome of small leaves. Used for the
 * flowering pots, with blossoms scattered through it — `bloom` is the petal
 * colour, and passing nothing gives a plain evergreen.
 */
export function shrubSheet(tone = BOX, bloom = '', seed = 33): THREE.CanvasTexture {
  return makeTexture(`shrub|${tone}|${bloom}|${seed}`, [256, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const base = h - 4;
    // a few woody stems up into the crown
    for (let i = 0; i < 5; i++) {
      const a = ((i / 4) * 2 - 1) * 0.6;
      stem(ctx, cx, base, cx + Math.sin(a) * w * 0.3, base - h * 0.5, 3, '#5a4326');
    }
    // the crown: leaves laid on an ellipse, densest at the middle
    for (let i = 0; i < 260; i++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng());
      const px = cx + Math.cos(a) * r * w * 0.44;
      const py = base - h * 0.52 - Math.sin(a) * r * h * 0.34;
      if (py > base) continue;
      const ll = h * (0.05 + rng() * 0.035);
      blade(ctx, rng, px, py, ll, ll * 0.42, rng() * Math.PI * 2, tone, 0.2);
    }
    if (bloom) {
      for (let i = 0; i < 26; i++) {
        const a = rng() * Math.PI * 2;
        const r = Math.sqrt(rng());
        const px = cx + Math.cos(a) * r * w * 0.42;
        const py = base - h * 0.54 - Math.sin(a) * r * h * 0.32;
        const pr = h * (0.016 + rng() * 0.012);
        // five petals and a pale eye — a flower, not a dot
        for (let p = 0; p < 5; p++) {
          const pa = (p / 5) * Math.PI * 2 + rng();
          ctx.beginPath();
          ctx.ellipse(px + Math.cos(pa) * pr, py + Math.sin(pa) * pr, pr * 0.9, pr * 0.62, pa, 0, Math.PI * 2);
          ctx.fillStyle = shade(bloom, (rng() - 0.5) * 0.16);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(px, py, pr * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#e6d9a6';
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    weather(ctx, rng, w, h, 5);
  }, false);
}

/**
 * A trailing spill — the growth that hangs OVER a pot rim or a cornice, drawn
 * head-DOWN: it springs from the top centre of the image and falls. Used both
 * for the pot skirts and, at a much bigger scale, for the creepers coming off
 * the rotunda gallery.
 */
export function trailSheet(tone = IVY, seed = 39): THREE.CanvasTexture {
  return makeTexture(`trail|${tone}|${seed}`, [256, 512], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.clearRect(0, 0, w, h);
    const N = 7;
    for (let i = 0; i < N; i++) {
      // each runner leaves the top at its own lean and wanders down
      let x = w / 2 + ((i / (N - 1)) * 2 - 1) * w * 0.3;
      let y = 4;
      const drop = h * (0.42 + rng() * 0.56);
      const lean = ((i / (N - 1)) * 2 - 1) * 0.55;
      const SEG = 26;
      const pts: [number, number][] = [[x, y]];
      for (let k = 1; k <= SEG; k++) {
        const t = k / SEG;
        x += Math.sin(lean + Math.sin(t * 4 + i) * 0.4) * (w * 0.035) + (rng() - 0.5) * 3;
        y += (drop / SEG) * (0.7 + 0.6 * t); // accelerating: it hangs, it doesn't grow down
        pts.push([x, y]);
      }
      const woody = shade(tone, -0.2);
      for (let k = 0; k < SEG; k++)
        stem(ctx, pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], 2.1 * (1 - k / SEG) + 0.5, woody);
      // ivy leaves budding alternately, thinning toward the tip
      for (let k = 1; k < SEG; k++) {
        if (rng() > 0.72) continue;
        const [px, py] = pts[k];
        const side = k % 2 === 0 ? 1 : -1;
        const s = w * 0.1 * (1 - 0.5 * (k / SEG)) * (0.7 + rng() * 0.6);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(side * (0.7 + rng() * 0.6));
        const t = shade(tone, (rng() - 0.5) * 0.2);
        // a three-lobed ivy leaf on a short petiole
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(side * s * 0.3, -s * 0.1);
        ctx.quadraticCurveTo(side * s * 1.25, -s * 0.95, side * s * 1.05, -s * 0.1);
        ctx.quadraticCurveTo(side * s * 1.55, s * 0.1, side * s * 1.0, s * 0.85);
        ctx.quadraticCurveTo(side * s * 0.55, s * 0.35, 0, 0);
        ctx.fillStyle = t;
        ctx.fill();
        ctx.strokeStyle = shade(t, -0.2);
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 0.9;
        ctx.stroke();
        // the pale veining ivy is known by
        ctx.strokeStyle = shade(t, 0.22);
        ctx.globalAlpha = 0.42;
        ctx.lineWidth = 0.9;
        for (const va of [-0.7, 0, 0.7]) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(side * s * 0.95 * Math.cos(va), s * 0.85 * Math.sin(va));
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }
    // the weathering gradient runs the other way on a trailer: the crown is in
    // shade under whatever it is growing out of, the tips are in the open
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(10,16,9,0.5)');
    g.addColorStop(0.45, 'rgba(10,16,9,0.08)');
    g.addColorStop(1, 'rgba(10,16,9,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      ctx.globalAlpha = 0.25 + rng() * 0.4;
      ctx.fillStyle = rng() > 0.5 ? '#7d6132' : '#5f4726';
      ctx.beginPath();
      ctx.ellipse(rng() * w, h * 0.4 + rng() * h * 0.6, 3 + rng() * 8, 4 + rng() * 10, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }, false);
}

/**
 * The pots. Wheel-thrown earthenware that has stood indoors for a very long
 * time: throwing rings running round it, salt bloom and lime scale where water
 * has wicked out through the clay, chipped arrises, and a dull moss line at the
 * foot. Painted rather than left as a flat `#9a5636` fill, which is what these
 * were — and a flat orange cylinder is the single most plastic-looking thing a
 * scene like this can contain.
 */
export function terracotta(base = '#8e5334', seed = 63): THREE.CanvasTexture {
  return makeTexture(`terracotta|${base}|${seed}`, [256, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    // clay body: uneven firing, darker where the kiln ran hot
    for (let i = 0; i < 700; i++) {
      ctx.globalAlpha = 0.06 + rng() * 0.16;
      ctx.fillStyle = shade(base, (rng() - 0.5) * 0.22);
      ctx.beginPath();
      ctx.ellipse(rng() * w, rng() * h, 6 + rng() * 40, 4 + rng() * 16, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // throwing rings — horizontal, slightly irregular, the mark of the wheel
    for (let y = 0; y < h; y += 5 + rng() * 4) {
      ctx.globalAlpha = 0.1 + rng() * 0.14;
      ctx.fillStyle = shade(base, -0.14);
      ctx.fillRect(0, y, w, 1.3);
      ctx.fillStyle = shade(base, 0.11);
      ctx.fillRect(0, y + 1.5, w, 0.9);
    }
    ctx.globalAlpha = 1;
    // salt bloom and lime, wicking downward from the rim in pale runs
    for (let i = 0; i < 34; i++) {
      const x = rng() * w;
      const top = rng() * h * 0.4;
      const len = h * (0.15 + rng() * 0.5);
      const g = ctx.createLinearGradient(0, top, 0, top + len);
      g.addColorStop(0, 'rgba(226,216,192,0.3)');
      g.addColorStop(1, 'rgba(226,216,192,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, top, 3 + rng() * 12, len);
    }
    // chips: the clay under the surface is paler than the fired face
    for (let i = 0; i < 16; i++) {
      ctx.globalAlpha = 0.5 + rng() * 0.4;
      ctx.fillStyle = shade(base, 0.16);
      ctx.beginPath();
      ctx.ellipse(rng() * w, rng() * h, 2 + rng() * 6, 1.5 + rng() * 4, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // the mossy tide line at the foot (v=0 is the bottom once three flips Y)
    const foot = ctx.createLinearGradient(0, h, 0, h * 0.78);
    foot.addColorStop(0, 'rgba(52,64,42,0.5)');
    foot.addColorStop(1, 'rgba(52,64,42,0)');
    ctx.fillStyle = foot;
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
  });
}

/** the earth in a pot: dark crumb, grit, a scatter of fallen leaf and a little
 *  moss where it has been watered for years */
export function soilSheet(seed = 51): THREE.CanvasTexture {
  return makeTexture(`soil|${seed}`, [128, 128], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = '#2e2318';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const k = rng();
      ctx.globalAlpha = 0.25 + rng() * 0.5;
      ctx.fillStyle = k < 0.62 ? shade('#2e2318', (rng() - 0.5) * 0.2)
        : k < 0.86 ? shade('#6a6154', (rng() - 0.5) * 0.16) // grit
        : k < 0.95 ? shade('#4d5f3d', (rng() - 0.5) * 0.14) // moss
        : shade('#7a5a30', (rng() - 0.5) * 0.2); // fallen leaf
      ctx.beginPath();
      ctx.ellipse(rng() * w, rng() * h, 1 + rng() * 3.4, 0.8 + rng() * 2.4, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}
