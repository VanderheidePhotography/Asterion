import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { getMaterial } from '../../../materials';
import { Builder, DRUM_R_IN, newBuilder, sweptBand, toGeometry, type Profile } from './drumGeometry';
import { DRUM_MOUTHS, DRUM_PIERS, MOUTH_ARCHIVOLT, NICHES } from './structure';
import { PLAQUE_COLS, PLAQUE_COUNT, PLAQUE_ROWS, ROUNDEL_COLS, ROUNDEL_COUNT, ROUNDEL_ROWS } from './drumUpperArt';

/**
 * THE UPPER DRUM — the storeys between the statues' heads and the gallery.
 *
 * ── what was wrong ─────────────────────────────────────────────────────────
 *
 * Everything below 6.8 m had been worked over: niches, archivolts, damask,
 * statuary, a plinth, an impost course. Everything above it was ONE CYLINDER
 * with a wood texture on it. Six and a half metres of it, directly above every
 * figure, which is exactly where the eye goes when a visitor steps back to
 * look at a statue. It read as an extruded mesh because that is what it was.
 *
 * ── the rule this file obeys ───────────────────────────────────────────────
 *
 * The drum is ONE generated surface and nothing may be laid in front of it to
 * patch it (see the header of `drumGeometry.ts` and the warnings in
 * `structure.tsx`). That rule is not broken here. This is an ORDER standing on
 * the wall — pilasters, panel frames, an entablature, medallions — which is
 * the one thing the rule explicitly allows, in the same sense that the niche
 * archivolts and the impost course are allowed. Nothing here patches a hole,
 * nothing here is a second wall layer, and every piece stands PROUD of the
 * face rather than trying to occupy it.
 *
 * ── three layers, which is the entire point ────────────────────────────────
 *
 *   BACKGROUND  the drum's own timber, untouched. It is now the sunk field of
 *               a panelled wall instead of the whole wall.
 *   MIDDLE      panel frames and the fielded strips on the pilaster shafts —
 *               shallow, 5–7 cm, doing the job a bolection moulding does.
 *   FOREGROUND  pilasters, capitals, the entablature and the medallions, out
 *               to 28 cm. These are what throw a shadow across the layer
 *               behind them as the light moves.
 *
 * ── everything is generated in the drum's own polar frame ──────────────────
 *
 * A block here is given as (bearing, arc-metres either side, two heights, how
 * far proud). Its front face is SUBDIVIDED along the arc, so a 2 m panel frame
 * follows the curve instead of cutting the chord. Flat pieces laid on a round
 * wall is the mistake this building has already made twice, and it shows up as
 * an edge buried at the middle and lifting at the ends.
 *
 * ── the cost ───────────────────────────────────────────────────────────────
 *
 * Six draw calls for the whole order: walnut, stone, bronze, brass, and the
 * two texture atlases. Ten medallions do not cost ten materials because the
 * eight roundel designs live in ONE atlas and the discs sample cells of it —
 * the museum is draw-call bound, and an order like this is precisely the kind
 * of thing that arrives as three hundred little meshes if nobody is watching.
 */

/* ————————————————————— the elevation ————————————————————— */

/* Everything is set off two fixed lines: the impost course the arches spring
 * from (top 9.40) and the gallery's own cornice (starts 12.98, see
 * rotundaGallery.tsx). The order has to live BETWEEN them — the gallery is
 * real inhabited architecture and the frieze cannot run through it. */

/** clear of the niche archivolt's crown (5.20 springing + 1.35 + 0.22) */
const CONSOLE_Y0 = 6.8;
const CONSOLE_Y1 = 7.16;
/** the carved plaque over each figure, and the frame round it */
const PLAQUE_Y0 = 7.24;
const PLAQUE_Y1 = 8.8;
/** the top of the impost course — where the upper order stands */
const ORDER_Y0 = 9.4;
const BASE_Y1 = 9.84;
const SHAFT_Y1 = 11.74;
const NECK_Y1 = 11.9;
const ECHINUS_Y1 = 12.14;
const ABACUS_Y1 = 12.3;
/** the entablature, landing just under the gallery cornice at 12.98 */
const ARCH_Y1 = 12.48;
const FRIEZE_Y1 = 12.92;
const FILLET_Y1 = 12.96;
/** the coffered attic behind the gallery shelving */
const ATTIC_Y0 = 13.95;
const ATTIC_Y1 = 15.75;

/** how far the widest thing on this wall stands into the room. Kept well
 *  inside the gallery's 1.95 m projection so nothing up here is ever the first
 *  thing a walker's eye hits. */
const MAX_PROUD = 0.28;

/** one bay of the bronze frieze, in metres of wall — twelve round the drum */
const FRIEZE_TILE = 4.0;

/* ————————————————————— polar primitives ————————————————————— */

type V3 = [number, number, number];
type V2 = [number, number];

const P = (r: number, t: number, y: number): V3 => [Math.cos(t) * r, y, Math.sin(t) * r];
const RAD = (t: number, sign: number): V3 => [sign * Math.cos(t), 0, sign * Math.sin(t)];
const TAN = (t: number, sign: number): V3 => [-sign * Math.sin(t), 0, sign * Math.cos(t)];

/**
 * A block standing on the drum face: `s0`..`s1` arc-metres either side of
 * `theta`, `y0`..`y1` high, `proud` metres out into the room.
 *
 * Five faces — front, both returns, top and bottom. The back is omitted
 * deliberately: it is flat against the wall and no eye can ever reach it, and
 * a coincident face there would z-fight the drum along every edge.
 *
 * UVs are in METRES, matching the convention the drum itself uses, so a piece
 * 2 m long and a piece 9 cm long carry the same grain at the same scale
 * without anyone having to think about it.
 */
function block(b: Builder, theta: number, s0: number, s1: number, y0: number, y1: number, proud: number): void {
  if (s1 <= s0 || y1 <= y0) return;
  const rf = DRUM_R_IN - proud;
  const rb = DRUM_R_IN;
  const t = (s: number) => theta + s / DRUM_R_IN;
  const u0 = theta * DRUM_R_IN;
  const segs = Math.max(1, Math.ceil((s1 - s0) / 0.28));

  for (let i = 0; i < segs; i++) {
    const a = s0 + ((s1 - s0) * i) / segs;
    const c = s0 + ((s1 - s0) * (i + 1)) / segs;
    const ta = t(a);
    const tc = t(c);
    const tm = (ta + tc) / 2;
    // front
    b.quad(
      [P(rf, ta, y0), P(rf, tc, y0), P(rf, tc, y1), P(rf, ta, y1)],
      [
        [u0 + a, y0],
        [u0 + c, y0],
        [u0 + c, y1],
        [u0 + a, y1],
      ],
      RAD(tm, -1),
      [RAD(ta, -1), RAD(tc, -1), RAD(tc, -1), RAD(ta, -1)],
    );
    // bottom and top
    for (const [y, n] of [
      [y0, [0, -1, 0] as V3],
      [y1, [0, 1, 0] as V3],
    ] as [number, V3][]) {
      b.quad(
        [P(rb, ta, y), P(rb, tc, y), P(rf, tc, y), P(rf, ta, y)],
        [
          [u0 + a, 0],
          [u0 + c, 0],
          [u0 + c, proud],
          [u0 + a, proud],
        ],
        n,
      );
    }
  }
  // the two returns, which are what actually read as depth from an angle
  for (const [s, sign] of [
    [s0, -1],
    [s1, 1],
  ] as [number, number][]) {
    const ts = t(s);
    b.quad(
      [P(rb, ts, y0), P(rf, ts, y0), P(rf, ts, y1), P(rb, ts, y1)],
      [
        [0, y0],
        [proud, y0],
        [proud, y1],
        [0, y1],
      ],
      TAN(ts, sign),
    );
  }
}

/** a rectangular frame of four blocks — the moulding round a sunk panel */
function frame(
  b: Builder,
  theta: number,
  halfS: number,
  y0: number,
  y1: number,
  rail: number,
  proud: number,
): void {
  block(b, theta, -halfS, halfS, y0, y0 + rail, proud); // bottom rail
  block(b, theta, -halfS, halfS, y1 - rail, y1, proud); // top rail
  block(b, theta, -halfS, -halfS + rail, y0 + rail, y1 - rail, proud); // stiles
  block(b, theta, halfS - rail, halfS, y0 + rail, y1 - rail, proud);
}

/**
 * A disc lying on the wall: the medallion's face, as a fan whose UVs map the
 * disc's bounding square onto one cell of the roundel atlas.
 *
 * Drawn at a constant radius rather than curved to the drum. Over a 1.4 m
 * medallion on a 17 m wall that is 14 mm of sagitta — less than the thickness
 * of the piece — and a flat disc is what a carved roundel actually is.
 */
function disc(b: Builder, theta: number, cy: number, radius: number, proud: number, c: Cell): void {
  const rf = DRUM_R_IN - proud;
  const N = 40;
  const t = (s: number) => theta + s / DRUM_R_IN;
  const uv = (s: number, y: number): V2 => [
    c.u0 + (c.u1 - c.u0) * (0.5 + s / (2 * radius)),
    c.vBot + (c.vTop - c.vBot) * (0.5 + (y - cy) / (2 * radius)),
  ];
  const centre = P(rf, theta, cy);
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    const s0 = Math.cos(a0) * radius;
    const y0 = cy + Math.sin(a0) * radius;
    const s1 = Math.cos(a1) * radius;
    const y1 = cy + Math.sin(a1) * radius;
    b.quad(
      [centre, P(rf, t(s0), y0), P(rf, t(s1), y1), P(rf, t(s1), y1)],
      [uv(0, cy), uv(s0, y0), uv(s1, y1), uv(s1, y1)],
      RAD(theta, -1),
    );
  }
}

/** the skirt that gives a disc its thickness — a short cylinder from its rim
 *  back to the wall. Without it a medallion is a sticker. */
function discSkirt(b: Builder, theta: number, cy: number, radius: number, proud: number): void {
  const rf = DRUM_R_IN - proud;
  const N = 40;
  const t = (s: number) => theta + s / DRUM_R_IN;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    const s0 = Math.cos(a0) * radius;
    const y0 = cy + Math.sin(a0) * radius;
    const s1 = Math.cos(a1) * radius;
    const y1 = cy + Math.sin(a1) * radius;
    // the outward normal of the rim, in the wall's own tangent/up plane
    const nm: V3 = [
      Math.cos((a0 + a1) / 2) * TAN(theta, 1)[0],
      Math.sin((a0 + a1) / 2),
      Math.cos((a0 + a1) / 2) * TAN(theta, 1)[2],
    ];
    b.quad(
      [P(DRUM_R_IN, t(s0), y0), P(DRUM_R_IN, t(s1), y1), P(rf, t(s1), y1), P(rf, t(s0), y0)],
      [
        [radius * a0, 0],
        [radius * a1, 0],
        [radius * a1, proud],
        [radius * a0, proud],
      ],
      nm,
    );
  }
}

/** a flat panel on the wall carrying one cell of a texture atlas */
function plate(
  b: Builder,
  theta: number,
  halfS: number,
  y0: number,
  y1: number,
  proud: number,
  c: Cell,
): void {
  const rf = DRUM_R_IN - proud;
  const t = (s: number) => theta + s / DRUM_R_IN;
  const segs = Math.max(1, Math.ceil((halfS * 2) / 0.28));
  for (let i = 0; i < segs; i++) {
    const a = -halfS + ((halfS * 2) * i) / segs;
    const d = -halfS + ((halfS * 2) * (i + 1)) / segs;
    const ua = c.u0 + (c.u1 - c.u0) * (0.5 + a / (2 * halfS));
    const ud = c.u0 + (c.u1 - c.u0) * (0.5 + d / (2 * halfS));
    b.quad(
      [P(rf, t(a), y0), P(rf, t(d), y0), P(rf, t(d), y1), P(rf, t(a), y1)],
      [
        [ua, c.vBot],
        [ud, c.vBot],
        [ud, c.vTop],
        [ua, c.vTop],
      ],
      RAD(theta, -1),
    );
  }
}

/**
 * One cell of a texture atlas, as (left u, right u, bottom v, top v).
 *
 * Two things here are easy to get wrong and both were, first time round:
 *
 * · **V RUNS THE OTHER WAY.** three sets `flipY` on every texture, so v = 1
 *   samples the TOP row of the canvas and v = 0 the bottom, while the atlas is
 *   laid out in canvas rows counted from the top. Handing a cell's canvas
 *   fraction straight to v hangs every plaque upside down — which at fourteen
 *   metres reads not as "flipped" but as "the lettering is illegible", and is
 *   why it survived a first look.
 * · **THE INSET IS NOT FUSSINESS.** Cells are sampled with mipmaps and the
 *   registry gives every texture `RepeatWrapping`, so UVs running exactly to a
 *   cell's edge drag in the neighbouring roundel at distance and at grazing
 *   angles — which is the whole of how these are ever seen.
 */
function cell(k: number, cols: number, rows: number) {
  const pad = 0.005;
  const c = k % cols;
  const r = Math.floor(k / cols);
  return {
    u0: (c + pad) / cols,
    u1: (c + 1 - pad) / cols,
    vTop: 1 - (r + pad) / rows,
    vBot: 1 - (r + 1 - pad) / rows,
  };
}

type Cell = ReturnType<typeof cell>;

/* ————————————————————— breaking the bands round the arches ————————————————————— */

/**
 * The half-width of wall an opening takes out of a horizontal band running
 * between `y0` and `y1`, in arc-metres, archivolt included. Zero when the band
 * clears the arch's crown entirely — which is how the apse gets an unbroken
 * entablature and the wing mouths do not.
 *
 * The arch narrows monotonically above its springing, so the widest bite is at
 * the band's own FOOT. Measuring at the middle (the obvious thing) leaves the
 * band's bottom corner hanging in the opening.
 */
function biteAt(m: { headR: number; springY: number }, y0: number, y1: number): number {
  if (y1 <= m.springY) return m.headR + MOUTH_ARCHIVOLT + 0.06;
  const d = Math.max(0, y0 - m.springY);
  if (d >= m.headR) return 0;
  return Math.sqrt(m.headR * m.headR - d * d) + MOUTH_ARCHIVOLT + 0.06;
}

/** the clear arcs of wall a band may run along, given every arch it must dodge */
function bandArcs(y0: number, y1: number): [number, number][] {
  const cuts = DRUM_MOUTHS.map((m) => ({ theta: m.theta, half: biteAt(m, y0, y1) / DRUM_R_IN }))
    .filter((c) => c.half > 0)
    .sort((a, b) => a.theta - b.theta);
  if (cuts.length === 0) return [[0, Math.PI * 2]];
  return cuts.map((c, i) => {
    const next = cuts[(i + 1) % cuts.length];
    const t0 = c.theta + c.half;
    let t1 = next.theta - next.half;
    while (t1 <= t0) t1 += Math.PI * 2;
    return [t0, t1] as [number, number];
  });
}

/* ————————————————————— the shading bake ————————————————————— */

/**
 * There is no ambient occlusion in this renderer and no light source dedicated
 * to this wall, so an order built here renders as one flat tone and every
 * layer collapses back into the plane it was built to escape.
 *
 * What is baked instead is the light this part of the room ACTUALLY receives,
 * which is almost all of it from below: thirty-six chandeliers hanging at
 * eight metres and the gallery's own lamp line at fifteen. So an upward-facing
 * surface — the top of a rail, the shelf of a capital — catches; a downward
 * one — the soffit of the abacus, the underside of every moulding — goes dark,
 * and that dark line under a projecting member is the whole of what makes
 * carving read as carving.
 *
 * The front faces get a smaller share, warmed, and the tone falls off with
 * height because the practicals do. Bake for SHAPE, light for ENERGY — the
 * rule the dome and the niche shells are already built on.
 */
function bakeUplight(g: THREE.BufferGeometry, y0: number, y1: number): void {
  const pos = g.attributes.position;
  const nrm = g.attributes.normal;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const ny = nrm.getY(i);
    const y = pos.getY(i);
    const up = Math.max(0, ny);
    const down = Math.max(0, -ny);
    // how far a face looks into the room, 0 for a return, 1 for a front
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const len = Math.hypot(x, z) || 1;
    const front = Math.max(0, -(nrm.getX(i) * (x / len) + nrm.getZ(i) * (z / len)));
    /** 0 at the foot of the order, 1 at the top — the practicals thin out */
    const h = Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
    const k = (0.80 + 0.34 * up - 0.26 * down + 0.14 * front) * (1 - 0.16 * h);
    const c = Math.min(1.2, Math.max(0.42, k));
    // warm from below, cooling as it climbs toward the moonlit dome
    col[i * 3] = c * (1 + 0.07 * (1 - h));
    col[i * 3 + 1] = c;
    col[i * 3 + 2] = c * (1 - 0.09 * (1 - h) + 0.05 * h);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
}

/* ————————————————————— the order ————————————————————— */

interface Built {
  walnut: THREE.BufferGeometry;
  stone: THREE.BufferGeometry;
  bronze: THREE.BufferGeometry;
  brass: THREE.BufferGeometry;
  roundels: THREE.BufferGeometry;
  plaques: THREE.BufferGeometry;
}

function buildUpperDrum(): Built {
  const W = newBuilder(); // walnut: pilasters, panel frames, coffers
  const S = newBuilder(); // stone: the architrave, the abaci, the string course
  const Z = newBuilder(); // bronze: the frieze
  const B = newBuilder(); // brass: the fillets
  const R = newBuilder(); // the medallion faces
  const Q = newBuilder(); // the plaques over the figures

  const piers = DRUM_PIERS;

  piers.forEach((p, i) => {
    const th = p.theta;
    const halfW = p.width / 2;

    /* ——— over the figure: a console, a framed plaque ——— */
    const niche = NICHES.find((n) => Math.abs(n.theta - th) < 1e-9);
    if (niche) {
      // the console sitting on the crown of the niche's archivolt. A recess
      // that simply stops and gives way to blank wall is the tell that the
      // niche was punched rather than built; a bracket over the keystone is
      // what a mason puts there and what carries the plaque above it.
      block(W, th, -0.3, 0.3, CONSOLE_Y0, CONSOLE_Y0 + 0.1, 0.14);
      block(W, th, -0.24, 0.24, CONSOLE_Y0 + 0.1, CONSOLE_Y1 - 0.08, 0.2);
      block(W, th, -0.33, 0.33, CONSOLE_Y1 - 0.08, CONSOLE_Y1, 0.24);
    }
    // the plaque is the same size on every pier — the grand piers simply carry
    // more plain wall each side, which is what makes ten of them read as one
    // set rather than as ten decisions
    const pw = 1.18;
    if (halfW > pw + 0.34) {
      frame(W, th, pw, PLAQUE_Y0, PLAQUE_Y1, 0.16, 0.075);
      plate(
        Q,
        th,
        pw - 0.18,
        PLAQUE_Y0 + 0.2,
        PLAQUE_Y1 - 0.2,
        0.02,
        cell(i % PLAQUE_COUNT, PLAQUE_COLS, PLAQUE_ROWS),
      );
    }

    /* ——— the upper order: two pilasters and a panelled field ——— */
    const px = halfW - 0.56;
    for (const side of [-1, 1]) {
      const c = side * px;
      block(W, th, c - 0.27, c + 0.27, ORDER_Y0, BASE_Y1, 0.19);
      block(W, th, c - 0.225, c + 0.225, BASE_Y1, SHAFT_Y1, 0.14);
      // the fielded strip down the middle of the shaft: the shallowest layer
      // in the whole order and the one that stops a pilaster reading as a stick
      block(W, th, c - 0.145, c + 0.145, BASE_Y1 + 0.22, SHAFT_Y1 - 0.22, 0.175);
      block(W, th, c - 0.245, c + 0.245, SHAFT_Y1, NECK_Y1, 0.165);
      block(W, th, c - 0.3, c + 0.3, NECK_Y1, ECHINUS_Y1, 0.235);
      // the abacus is cut in stone, not timber — the capital is where the
      // timber order hands the load to the masonry above it
      block(S, th, c - 0.345, c + 0.345, ECHINUS_Y1, ABACUS_Y1, MAX_PROUD);
    }

    const fi = halfW - 0.95;
    if (fi > 0.45) {
      frame(W, th, fi, ORDER_Y0 + 0.54, ABACUS_Y1 - 0.14, 0.09, 0.06);
      const rad = Math.min(fi - 0.2, 0.72);
      if (rad > 0.3) {
        const cy = 11.05;
        discSkirt(W, th, cy, rad, 0.1);
        disc(R, th, cy, rad, 0.1, cell(i % ROUNDEL_COUNT, ROUNDEL_COLS, ROUNDEL_ROWS));
      }
    }
  });

  /* ——— the entablature, broken round every arch ——— */
  const entArcs = bandArcs(ABACUS_Y1, FILLET_Y1);
  const architrave: Profile = [
    [0, ABACUS_Y1],
    [0.1, ABACUS_Y1],
    [0.13, ABACUS_Y1 + 0.07],
    [0.13, ARCH_Y1 - 0.05],
    [0.17, ARCH_Y1 - 0.03],
    [0.17, ARCH_Y1],
    [0, ARCH_Y1],
  ];
  const fillet: Profile = [
    [0, FRIEZE_Y1],
    [0.185, FRIEZE_Y1],
    [0.185, FILLET_Y1],
    [0, FILLET_Y1],
  ];
  for (const [t0, t1] of entArcs) {
    sweptBand(S, architrave, t0, t1, true, 0.34);
    sweptBand(B, fillet, t0, t1, true, 0.34);
    // the frieze proper, with its own UVs so the cast band tiles by the metre
    friezeBand(Z, t0, t1, ARCH_Y1, FRIEZE_Y1, 0.13);
  }

  /* ——— the coffered attic behind the gallery shelving ——— */
  const railP: Profile = [
    [0, 0],
    [0.055, 0],
    [0.055, 0.09],
    [0, 0.09],
  ];
  for (const y of [ATTIC_Y0, (ATTIC_Y0 + ATTIC_Y1) / 2 - 0.045, ATTIC_Y1 - 0.09]) {
    sweptBand(
      W,
      railP.map(([a, b]) => [a, b + y] as [number, number]),
      0,
      Math.PI * 2,
      false,
      0.4,
    );
  }
  const MULL = Math.round((Math.PI * 2 * DRUM_R_IN) / 0.92);
  for (let i = 0; i < MULL; i++) {
    const t = (i / MULL) * Math.PI * 2;
    block(W, t, -0.045, 0.045, ATTIC_Y0, ATTIC_Y1, 0.055);
  }

  const walnut = toGeometry(W);
  const stone = toGeometry(S);
  bakeUplight(walnut, CONSOLE_Y0, ATTIC_Y1);
  bakeUplight(stone, CONSOLE_Y0, ATTIC_Y1);
  return {
    walnut,
    stone,
    bronze: toGeometry(Z),
    brass: toGeometry(B),
    roundels: toGeometry(R),
    plaques: toGeometry(Q),
  };
}

/** the frieze's own sweep: a plain proud band whose UVs run in frieze-bays
 *  along the wall and exactly once from its bottom edge to its top */
function friezeBand(b: Builder, t0: number, t1: number, y0: number, y1: number, proud: number): void {
  const rf = DRUM_R_IN - proud;
  const segs = Math.max(2, Math.ceil(((t1 - t0) * DRUM_R_IN) / 0.3));
  for (let i = 0; i < segs; i++) {
    const a = t0 + ((t1 - t0) * i) / segs;
    const c = t0 + ((t1 - t0) * (i + 1)) / segs;
    const ua = (a * DRUM_R_IN) / FRIEZE_TILE;
    const uc = (c * DRUM_R_IN) / FRIEZE_TILE;
    const tm = (a + c) / 2;
    b.quad(
      [P(rf, a, y0), P(rf, c, y0), P(rf, c, y1), P(rf, a, y1)],
      [
        [ua, 0],
        [uc, 0],
        [uc, 1],
        [ua, 1],
      ],
      RAD(tm, -1),
      [RAD(a, -1), RAD(c, -1), RAD(c, -1), RAD(a, -1)],
    );
    // the band's own top and bottom edges, so it is a course and not a decal
    for (const [y, n] of [
      [y0, [0, -1, 0] as V3],
      [y1, [0, 1, 0] as V3],
    ] as [number, V3][]) {
      b.quad(
        [P(DRUM_R_IN, a, y), P(DRUM_R_IN, c, y), P(rf, c, y), P(rf, a, y)],
        [
          [ua, 0],
          [uc, 0],
          [uc, 0.04],
          [ua, 0.04],
        ],
        n,
      );
    }
  }
  // the returns where the band dies into an archivolt
  for (const [t, sign] of [
    [t0, -1],
    [t1, 1],
  ] as [number, number][]) {
    b.quad(
      [P(DRUM_R_IN, t, y0), P(rf, t, y0), P(rf, t, y1), P(DRUM_R_IN, t, y1)],
      [
        [0, 0],
        [0.04, 0],
        [0.04, 1],
        [0, 1],
      ],
      TAN(t, sign),
    );
  }
}

/* ————————————————————— the component ————————————————————— */

export function DrumUpperOrder() {
  const geom = useMemo(buildUpperDrum, []);
  useLayoutEffect(
    () => () => Object.values(geom).forEach((g) => (g as THREE.BufferGeometry).dispose()),
    [geom],
  );

  /**
   * Aged walnut, deliberately NOT the drum's own wainscot: an order has to be
   * cut from a different timber than the ground it stands on, or the whole
   * thing reads as one moulded sheet. UVs arrive in metres, so the repeat is
   * 1/(tile size).
   *
   * The tint matters more than it looks. `wood_walnut_ancient` carries a real
   * scan, so `color` MULTIPLIES it — the first pass overrode it to white, and
   * a set of pilasters brighter than the wall behind them reads as grey
   * plaster stuck on. This is a stop warmer and a shade darker than the
   * wainscot at #63492f, which is what a walnut order on an oak ground does.
   */
  const walnutMat = useMemo(
    () =>
      getMaterial('wood_walnut_ancient', {
        repeat: [1 / 1.15, 1 / 1.15],
        overrides: { vertexColors: true, color: '#6b4c2e', roughness: 0.86 },
      }),
    [],
  );
  // and the stone keeps its own definition's tone rather than being bleached
  // to white — at #ffffff the entablature was the brightest thing in the room
  const stoneMat = useMemo(
    () =>
      getMaterial('stone_limestone_ancient', {
        repeat: [1 / 1.6, 1 / 1.6],
        overrides: { vertexColors: true, color: '#6f6759' },
      }),
    [],
  );
  // The frieze reads its relief off the painted atlas, so it wants the bronze
  // scan's roughness and normal but NOT its albedo — hence its own definition
  // rather than an override on metal_bronze_aged.
  const bronzeMat = useMemo(() => getMaterial('metal_bronze_frieze', { repeat: [1, 1] }), []);
  const brassMat = useMemo(
    () => getMaterial('metal_brass_burnished', { repeat: [1 / 0.6, 1 / 0.6], overrides: { color: '#8f7436' } }),
    [],
  );
  const roundelMat = useMemo(() => getMaterial('stone_celestial_roundel', { repeat: [1, 1] }), []);
  const plaqueMat = useMemo(() => getMaterial('stone_constellation_plaque', { repeat: [1, 1] }), []);

  return (
    <group>
      <mesh geometry={geom.walnut} material={walnutMat} />
      <mesh geometry={geom.stone} material={stoneMat} />
      <mesh geometry={geom.bronze} material={bronzeMat} />
      <mesh geometry={geom.brass} material={brassMat} />
      <mesh geometry={geom.roundels} material={roundelMat} />
      <mesh geometry={geom.plaques} material={plaqueMat} />
    </group>
  );
}
