import * as THREE from 'three';

/**
 * The rotunda drum, built as real architecture instead of a row of slabs.
 *
 * WHY THIS FILE EXISTS. The drum used to be 256 flat `boxGeometry` panels laid
 * round a circle, each one 6 cm wider than the pitch it sat on. That produced
 * every fault at once:
 *
 *  · the panels INTERPENETRATED — a 14% overlap at all 256 joints, so their
 *    side faces crossed inside the wall and z-fought wherever the view grazed;
 *  · the openings could only be cut in whole panels, so an arch was a
 *    STAIRCASE of 0.43 m treads — seventeen steps across a wing mouth, which is
 *    exactly the "jagged" arch top;
 *  · the piers were covered instead by a single FLAT plate, which met the round
 *    panel ring at a kink and stood up to 9 cm off it — the gap at every jamb;
 *  · and it cost 266 draw calls to do it.
 *
 * A wall that is round cannot be assembled out of flat pieces and then patched.
 * So the whole drum — both faces, every reveal, every arch — is generated here
 * as ONE surface from ONE profile function: `bottomAt`. There is nothing to
 * misalign, because there is only one piece.
 */

/** the drum's inner face — what you see standing in the rotunda */
export const DRUM_R_IN = 17.15;
/** the outer face — what you see looking back from a hall */
export const DRUM_R_OUT = 17.55;

/**
 * An opening cut in the drum: a doorway (`through`) or a statue niche.
 *
 * `headR` is the radius of the semicircular head MEASURED IN ARC LENGTH along
 * the inner face, and `halfArc` is that same radius expressed as an angle. They
 * are one number, not two — see `mkOpening` — which is what guarantees the head
 * lands exactly on the jamb with no notch, at any width.
 */
export interface Opening {
  theta: number;
  halfArc: number;
  springY: number;
  headR: number;
  through: boolean;
}

export function mkOpening(theta: number, headR: number, springY: number, through: boolean): Opening {
  return { theta, headR, springY, through, halfArc: headR / DRUM_R_IN };
}

/** how far the wall returns behind its own face around a niche: just enough to
 *  give the cut edge thickness and to lap the shell's rim, and no more — a
 *  deeper return would out-run the shell as it curves away and open a slot */
const NICHE_RETURN = 0.05;

/** underside of an opening at `d` radians off its centre: the floor outside it,
 *  the jamb up to the springing, then a true semicircle over the top. */
function bottomAt(o: Opening, d: number): number {
  const s = d * DRUM_R_IN;
  return o.springY + Math.sqrt(Math.max(0, o.headR * o.headR - s * s));
}

type V3 = [number, number, number];
type V2 = [number, number];
interface Col {
  t: number;
  y: number;
}

/** accumulates a non-indexed triangle soup with explicit normals and metre UVs */
export class Builder {
  pos: number[] = [];
  nrm: number[] = [];
  uvs: number[] = [];

  private tri(p: V3[], n: V3[], u: V2[], i: number, j: number, k: number) {
    for (const x of [i, j, k]) {
      this.pos.push(p[x][0], p[x][1], p[x][2]);
      this.nrm.push(n[x][0], n[x][1], n[x][2]);
      this.uvs.push(u[x][0], u[x][1]);
    }
  }

  /**
   * A quad A→B→C→D. `ref` is the direction the face must end up looking; the
   * winding is corrected against it rather than reasoned about at every call
   * site, which is how the old code came to have surfaces facing into the wall.
   */
  quad(p: [V3, V3, V3, V3], u: [V2, V2, V2, V2], ref: V3, n?: [V3, V3, V3, V3]) {
    const e1: V3 = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]];
    const e2: V3 = [p[2][0] - p[1][0], p[2][1] - p[1][1], p[2][2] - p[1][2]];
    const c: V3 = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (c[0] * c[0] + c[1] * c[1] + c[2] * c[2] < 1e-14) return; // degenerate — a duplicated column
    const normals = n ?? ([ref, ref, ref, ref] as [V3, V3, V3, V3]);
    if (c[0] * ref[0] + c[1] * ref[1] + c[2] * ref[2] >= 0) {
      this.tri(p, normals, u, 0, 1, 2);
      this.tri(p, normals, u, 0, 2, 3);
    } else {
      this.tri(p, normals, u, 0, 2, 1);
      this.tri(p, normals, u, 0, 3, 2);
    }
  }

  geometry(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2));
    g.computeBoundingSphere();
    return g;
  }
}

const P = (r: number, t: number, y: number): V3 => [Math.cos(t) * r, y, Math.sin(t) * r];
/** unit vector along increasing bearing */
const TAN = (t: number): V3 => [-Math.sin(t), 0, Math.cos(t)];
const RAD = (t: number, sign: number): V3 => [sign * Math.cos(t), 0, sign * Math.sin(t)];

/** the outline of one opening: up the near jamb, round the head, down the far
 *  jamb. The two columns that share a bearing at each jamb foot are deliberate —
 *  the zero-width step between them is what becomes the jamb's reveal face. */
function outline(o: Opening, headSegs: number): Col[] {
  const c: Col[] = [
    { t: o.theta - o.halfArc, y: 0 },
    { t: o.theta - o.halfArc, y: o.springY },
  ];
  for (let k = 1; k < headSegs; k++) {
    const d = -o.halfArc + (2 * o.halfArc * k) / headSegs;
    c.push({ t: o.theta + d, y: bottomAt(o, Math.abs(d)) });
  }
  c.push({ t: o.theta + o.halfArc, y: o.springY }, { t: o.theta + o.halfArc, y: 0 });
  return c;
}

/** every column of one face of the drum, in increasing bearing: each opening's
 *  outline, and plain floor-to-top wall in between */
function faceColumns(openings: Opening[], headSegs: number, step: number): Col[] {
  const os = [...openings].sort((a, b) => a.theta - b.theta);
  const cols: Col[] = [];
  for (let i = 0; i < os.length; i++) {
    cols.push(...outline(os[i], headSegs));
    const next = os[(i + 1) % os.length];
    const a = os[i].theta + os[i].halfArc;
    let b = next.theta - next.halfArc;
    while (b <= a) b += Math.PI * 2;
    const n = Math.max(1, Math.ceil((b - a) / step));
    for (let k = 1; k < n; k++) cols.push({ t: a + ((b - a) * k) / n, y: 0 });
  }
  return cols;
}

/** one cylindrical face of the drum, from its bottom profile up to `top` */
function faceStrip(b: Builder, cols: Col[], r: number, top: number, outward: boolean) {
  for (let i = 0; i < cols.length; i++) {
    const c0 = cols[i];
    const c1 = cols[(i + 1) % cols.length];
    const t1 = i + 1 === cols.length ? c1.t + Math.PI * 2 : c1.t;
    if (Math.abs(t1 - c0.t) < 1e-9) continue;
    const s = outward ? 1 : -1;
    b.quad(
      [P(r, c0.t, c0.y), P(r, t1, c1.y), P(r, t1, top), P(r, c0.t, top)],
      [
        [r * c0.t, c0.y],
        [r * t1, c1.y],
        [r * t1, top],
        [r * c0.t, top],
      ],
      RAD(c0.t, s),
      [RAD(c0.t, s), RAD(t1, s), RAD(t1, s), RAD(c0.t, s)],
    );
  }
}

/**
 * The reveal running round an opening — the face of the wall's own thickness.
 * `r0` is the inner face, `r1` how far back it returns (the far face for a
 * doorway, a few centimetres for a niche). Its normal is worked out in the
 * opening's own (arc, height) plane so a jamb faces sideways and a head faces
 * down, which is what stops the reveals reading as flat ribbons.
 */
function revealStrip(b: Builder, o: Opening, headSegs: number, r0: number, r1: number) {
  const c = outline(o, headSegs);
  for (let i = 0; i + 1 < c.length; i++) {
    const a = c[i];
    const d = c[i + 1];
    const tm = (a.t + d.t) / 2;
    const ym = (a.y + d.y) / 2;
    let ns: number;
    let ny: number;
    if (Math.abs(d.t - a.t) < 1e-9) {
      // the jamb foot: a vertical reveal facing across the opening
      ns = a.t < o.theta ? 1 : -1;
      ny = 0;
    } else {
      const s = (tm - o.theta) * DRUM_R_IN;
      const h = ym - o.springY;
      const m = Math.hypot(s, h) || 1;
      ns = -s / m;
      ny = -h / m;
    }
    const tg = TAN(tm);
    const ref: V3 = [ns * tg[0], ny, ns * tg[2]];
    b.quad(
      [P(r0, a.t, a.y), P(r0, d.t, d.y), P(r1, d.t, d.y), P(r1, a.t, a.y)],
      [
        [DRUM_R_IN * a.t, 0],
        [DRUM_R_IN * d.t, 0],
        [DRUM_R_IN * d.t, r1 - r0],
        [DRUM_R_IN * a.t, r1 - r0],
      ],
      ref,
    );
  }
}

/**
 * The whole drum wall: inner face, outer face, every reveal and the top bed —
 * one geometry, one draw call.
 *
 * Doorways are cut clean through the band and get a full-depth reveal. Niches
 * are cut in the inner face ONLY, with a short return; the outer face runs past
 * them unbroken, so there is no hole behind the recess for the room to see out
 * of and the shells simply plug the front.
 */
export function drumWall(openings: Opening[], top: number): THREE.BufferGeometry {
  const b = new Builder();
  const HEAD = 96; // segments across an arch head — 2° at the widest opening
  const STEP = 0.02; // ~1.1° of plain wall per quad
  const through = openings.filter((o) => o.through);

  faceStrip(b, faceColumns(openings, HEAD, STEP), DRUM_R_IN, top, false);
  faceStrip(b, faceColumns(through, HEAD, STEP), DRUM_R_OUT, top, true);
  for (const o of openings) {
    revealStrip(b, o, HEAD, DRUM_R_IN, o.through ? DRUM_R_OUT : DRUM_R_IN + NICHE_RETURN);
  }

  // the top bed the dome sits on
  const N = 256;
  for (let i = 0; i < N; i++) {
    const t0 = (i / N) * Math.PI * 2;
    const t1 = ((i + 1) / N) * Math.PI * 2;
    b.quad(
      [P(DRUM_R_IN, t0, top), P(DRUM_R_OUT, t0, top), P(DRUM_R_OUT, t1, top), P(DRUM_R_IN, t1, top)],
      [
        [DRUM_R_IN * t0, 0],
        [DRUM_R_IN * t0, 0.4],
        [DRUM_R_IN * t1, 0.4],
        [DRUM_R_IN * t1, 0],
      ],
      [0, 1, 0],
    );
  }
  return b.geometry();
}

/* ————————————————————— mouldings ————————————————————— */

/** a profile in (proud, height): `proud` is metres out from the inner face
 *  toward the room, and the polygon must be listed anticlockwise in that plane
 *  so its outward normals come out facing the room */
export type Profile = V2[];

/**
 * Sweeps a closed profile round an arc of the drum — the plinth, the impost
 * string course and the cornice. Bands are what give the wall a floor and a
 * top; without them a 17 m drum reads as an extruded circle, which is what it
 * literally was.
 */
export function sweptBand(bb: Builder, profile: Profile, t0: number, t1: number, cap: boolean, segLen = 0.12) {
  const segs = Math.max(2, Math.ceil(((t1 - t0) * DRUM_R_IN) / segLen));
  for (let i = 0; i < segs; i++) {
    const a = t0 + ((t1 - t0) * i) / segs;
    const c = t0 + ((t1 - t0) * (i + 1)) / segs;
    for (let k = 0; k < profile.length; k++) {
      const p0 = profile[k];
      const p1 = profile[(k + 1) % profile.length];
      const d: V2 = [p1[0] - p0[0], p1[1] - p0[1]];
      const nd: V2 = [d[1], -d[0]];
      const tm = (a + c) / 2;
      const ref: V3 = [nd[0] * -Math.cos(tm) + 0, nd[1], nd[0] * -Math.sin(tm)];
      const r0 = DRUM_R_IN - p0[0];
      const r1 = DRUM_R_IN - p1[0];
      bb.quad(
        [P(r0, a, p0[1]), P(r1, a, p1[1]), P(r1, c, p1[1]), P(r0, c, p0[1])],
        [
          [DRUM_R_IN * a, p0[1]],
          [DRUM_R_IN * a, p1[1]],
          [DRUM_R_IN * c, p1[1]],
          [DRUM_R_IN * c, p0[1]],
        ],
        ref,
      );
    }
  }
  if (cap) {
    for (const [t, s] of [
      [t0, -1],
      [t1, 1],
    ] as [number, number][]) {
      // profiles are convex, so a fan from the first vertex triangulates them
      for (let k = 1; k + 1 < profile.length; k++) {
        const q = [profile[0], profile[k], profile[k + 1]];
        bb.quad(
          [
            P(DRUM_R_IN - q[0][0], t, q[0][1]),
            P(DRUM_R_IN - q[1][0], t, q[1][1]),
            P(DRUM_R_IN - q[2][0], t, q[2][1]),
            P(DRUM_R_IN - q[2][0], t, q[2][1]),
          ],
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [1, 1],
          ],
          [s * TAN(t)[0], 0, s * TAN(t)[2]],
        );
      }
    }
  }
}

export function newBuilder(): Builder {
  return new Builder();
}
export function toGeometry(b: Builder): THREE.BufferGeometry {
  return b.geometry();
}

/** a rail of the archivolt: how far outside the opening's edge it runs, and how
 *  far it stands proud of the wall face */
interface Rail {
  off: number;
  proud: number;
}

/** samples one offset of an opening's outline, in (arc, height) — head only, or
 *  head plus both jambs */
function mouldPath(o: Opening, off: number, y0: number, headOnly: boolean, hs: number, js: number) {
  const r = o.headR + off;
  const pts: { s: number; y: number; ws: number; wy: number }[] = [];
  if (!headOnly) {
    for (let k = 0; k <= js; k++) pts.push({ s: -r, y: y0 + ((o.springY - y0) * k) / js, ws: -1, wy: 0 });
  }
  for (let k = headOnly ? 0 : 1; k <= hs; k++) {
    const phi = Math.PI - (Math.PI * k) / hs;
    pts.push({ s: r * Math.cos(phi), y: o.springY + r * Math.sin(phi), ws: Math.cos(phi), wy: Math.sin(phi) });
  }
  if (!headOnly) {
    for (let k = 1; k <= js; k++) pts.push({ s: r, y: o.springY - ((o.springY - y0) * k) / js, ws: 1, wy: 0 });
  }
  return pts;
}

/**
 * The archivolt: a moulded band lying ON the drum face and following an
 * opening's arch, mitred round the curve because it is generated FROM the same
 * outline the opening is cut to. A torus was used here before and could not
 * work — a flat ring cannot sit on a cylinder, so it buried itself in the wall
 * at the springings and stood proud of it at the crown.
 */
export function archMoulding(
  bb: Builder,
  o: Opening,
  rails: Rail[],
  y0: number,
  headOnly: boolean,
  hs = 72,
  js = 8,
) {
  const paths = rails.map((r) => ({ rail: r, pts: mouldPath(o, r.off, y0, headOnly, hs, js) }));
  for (let k = 0; k + 1 < paths.length; k++) {
    const A = paths[k];
    const B = paths[k + 1];
    // the middle rail is the face of the moulding and looks into the room; the
    // two edge rails are its returns and look away from / toward the opening
    const mode = k === 0 ? -1 : k === paths.length - 2 ? 1 : 0;
    for (let i = 0; i + 1 < A.pts.length; i++) {
      const a0 = A.pts[i];
      const a1 = A.pts[i + 1];
      const b0 = B.pts[i];
      const b1 = B.pts[i + 1];
      const sm = (a0.s + a1.s) / 2;
      const tm = o.theta + sm / DRUM_R_IN;
      const wsm = (a0.ws + a1.ws) / 2;
      const wym = (a0.wy + a1.wy) / 2;
      const tg = TAN(tm);
      const ref: V3 =
        mode === 0
          ? RAD(tm, -1)
          : [mode * wsm * tg[0], mode * wym, mode * wsm * tg[2]];
      const pt = (p: { s: number; y: number }, proud: number): V3 =>
        P(DRUM_R_IN - proud, o.theta + p.s / DRUM_R_IN, p.y);
      bb.quad(
        [pt(a0, A.rail.proud), pt(a1, A.rail.proud), pt(b1, B.rail.proud), pt(b0, B.rail.proud)],
        [
          [a0.s, a0.y],
          [a1.s, a1.y],
          [b1.s, b1.y],
          [b0.s, b0.y],
        ],
        ref,
      );
    }
  }
}
