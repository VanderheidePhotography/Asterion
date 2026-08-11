import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMaterial, primeMaterials } from '../../../materials';
import { CLUSTER_META, type ClusterId } from '../../../domain/types';
import { APSE_Z, ENTRY_Z, WING_ANGLES, WING_U1 } from './layout';
import { GALLERY2_U, GALLERY_U } from './structure';
import { GATE_ANGLES, MANDALA_R, WAY_HALF, WAY_TILE_M } from './cosmographiaArt';

/**
 * THE COSMOGRAPHIA — the museum's floor, laid.
 *
 * The art is in `cosmographiaArt.ts`; this file is the setting-out. What it
 * replaces is worth naming, because the shape of the old code is the reason the
 * floor read as furniture: a `<circleGeometry args={[7]}>` rug dropped under the
 * centre table in `Rotunda`, a separate `Runners` component laying nine
 * unrelated planes, and four flat maroon quads under the reading tables in
 * `ReadingTables`. Three components, three ideas, no shared dimension between
 * any of them — so of course the joins didn't work; there were no joins.
 *
 * Everything is one composition now, and every number below is taken from the
 * plan rather than chosen:
 *
 *   THE MANDALA   a single 31.6 m sheet filling the drum, clear of the mouths.
 *   THE WAYS      one carpet per gate, leaving from UNDER the mandala's rim so
 *                 there is no butt joint, and running the full hall.
 *   THE ROUNDELS  stone discs breaking each way at the two galleries — the
 *                 change of material where the procession pauses.
 *   THE BRASS     the trim that makes all of it architecture instead of
 *                 textile: two rings round the mandala, a threshold arc in
 *                 every gate, and a rim round every roundel. It marks the
 *                 places the floor CHANGES — a doorway, a rim, a change of
 *                 material — and nowhere else. The fillets that used to run
 *                 down both selvedges of every way are gone; see the brass
 *                 builder for why a straight gold line down a 48 m hall is the
 *                 worst thing you can put on a carpet.
 *
 * ── The stack, in millimetres, and why it is this tight ────────────────────
 *
 *   0     the rotunda's board floor (and 8 mm for a wing's)
 *   11    the mandala
 *   13    the ways
 *   15    the roundels — laid OVER the ways' ends, so a stone rim covers the
 *         cut rather than the two meeting on a line
 *   6–25  the brass, spanning the lot
 *
 * The ceiling on all of it is 28 mm, which is where `WingChronology`'s era
 * sills sit: raise anything here above 25 mm and it will stand proud of the
 * slate and look broken.
 *
 * ── Cost ───────────────────────────────────────────────────────────────────
 * Four draw calls for the whole building's floor, against eighteen before
 * (nine runners, one rug, eight table quads). The ways are one interleaved
 * buffer, the roundels one, the brass one; only the mandala has a material of
 * its own, because only the mandala is a unique image.
 */

/* ————— setting out ————— */

/**
 * Where a way begins: at the OUTER edge of the mandala's pale outer band, not
 * under it.
 *
 * It used to start at 15.0, 800 mm inside the rim, so the two sheets lapped and
 * the runner appeared to slide out from beneath the pale ring that closes the
 * rotunda floor. That was the right answer while the runner was a differently
 * coloured strip and the lap was hiding a join. It is the wrong answer now: the
 * ring and the runner are the same cloth, there is no join to hide, and what
 * the lap actually did was bury the runner's own finished end — so the carpet
 * had no beginning, it just faded under a band.
 *
 * At MANDALA_R the two meet edge to edge, and the runner starts with a bound
 * end and its tassels lying on the boards where you can see them.
 */
const WAY_R0 = MANDALA_R;
/* The half-widths now live in cosmographiaArt, next to the band list, and are
 * imported rather than declared: the mandala paints the ways' own stripes into
 * its outer ring to meet them, and two copies of these numbers would let the
 * ring's stripes and the runner's stripes drift apart by a few centimetres —
 * which is exactly the kind of near-miss the eye reads as a seam. Their reasons
 * are written at the definition. */
const HALF_WING = WAY_HALF.wing;
const HALF_ENTRY = WAY_HALF.entry;
const HALF_APSE = WAY_HALF.apse;
/** the mouth a threshold arc has to span, per gate kind */
const MOUTH_WING = 4.6;
const MOUTH_ENTRY = 2.9;
const MOUTH_APSE = 2.1;
/** the radius the threshold arcs ride. Set so even the widest arc's ends stay
 *  inside the drum's inner face at 17: √(16.4² + 4.6²) = 17.03 at the very
 *  outside edge of the bar, which the mouth reveal itself covers. */
const THRESHOLD_R = 16.32;

/** the stone discs. 2.25 m clears the benches and display cases, which hug the
 *  walls at n 2.73 with a ~0.5 m footprint. */
const ROUNDEL_R = 2.25;

/** how far down the hall a way runs before the end wall's window bay */
const WAY_U1 = WING_U1 - 1.2;

type GateKind = 'wing' | 'entry' | 'apse';

interface Gate {
  a: number;
  kind: GateKind;
  half: number;
  mouth: number;
  /** the carpet runs, as [from, to] along the gate's own axis */
  runs: [number, number][];
  /** where a stone roundel breaks the carpet */
  roundels: number[];
}

/**
 * Every gate, derived from the plan. The wings are read straight out of
 * `WING_ANGLES`; the entrance and apse are the two cardinal halls. Nothing here
 * is a literal angle, so this cannot drift out of step with layout.ts.
 */
const GATES: Gate[] = GATE_ANGLES.map((a) => {
  const isEntry = Math.abs(Math.sin(a) - 1) < 1e-6;
  const isApse = Math.abs(Math.sin(a) + 1) < 1e-6;
  const kind: GateKind = isEntry ? 'entry' : isApse ? 'apse' : 'wing';
  if (kind === 'entry') {
    const runs = [[WAY_R0, ENTRY_Z - 0.9]] as [number, number][];
    return { a, kind, half: HALF_ENTRY, mouth: MOUTH_ENTRY, runs, roundels: [] };
  }
  if (kind === 'apse') {
    const runs = [[WAY_R0, -APSE_Z - 0.9]] as [number, number][];
    return { a, kind, half: HALF_APSE, mouth: MOUTH_APSE, runs, roundels: [] };
  }
  // A wing's way is cut into three by the two galleries. Each run ends a little
  // PAST the roundel's inner edge and the next begins a little INSIDE its outer
  // one, so the stone always laps a carpet end and never reveals a gap.
  const lap = 0.45;
  return {
    a,
    kind,
    half: HALF_WING,
    mouth: MOUTH_WING,
    runs: [
      [WAY_R0, GALLERY_U - ROUNDEL_R + lap],
      [GALLERY_U + ROUNDEL_R - lap, GALLERY2_U - ROUNDEL_R + lap],
      [GALLERY2_U + ROUNDEL_R - lap, WAY_U1],
    ] as [number, number][],
    roundels: [GALLERY_U, GALLERY2_U],
  };
});

// the apse and entrance are cardinal halls; if the plan ever gains or loses one
// this assertion is the thing that will say so out loud rather than quietly
// laying a 4 m carpet down a 2 m corridor
if (GATES.filter((g) => g.kind === 'wing').length !== WING_ANGLES.length)
  console.warn('[cosmographia] gate kinds no longer match the plan in layout.ts');

/* ————— geometry helpers ————— */

/** unit axis and cross-axis of a gate, in world x/z */
function frame(a: number): { ax: number; az: number; nx: number; nz: number } {
  return { ax: Math.cos(a), az: Math.sin(a), nx: -Math.sin(a), nz: Math.cos(a) };
}

/**
 * One carpet run as a single quad, with its UVs set the way `ceremonialWay` is
 * painted: u ACROSS the way (0..1 over the full width) and v ALONG it, one
 * repeat per `WAY_TILE_M`. Four vertices is enough — the surface is flat and
 * lit per fragment, so subdividing it would buy nothing but vertices.
 */
function wayQuad(a: number, u0: number, u1: number, half: number, y: number, tint: THREE.Color): THREE.BufferGeometry {
  const { ax, az, nx, nz } = frame(a);
  const p = (u: number, s: number): [number, number, number] => [ax * u + nx * half * s, y, az * u + nz * half * s];
  /* The way is mapped CONTINUOUSLY along the hall — v is the distance from the
   * centre of the building, not from the start of this run.
   *
   * With v starting at 0 on every run, the three pieces of a wing's way all
   * showed the SAME opening stretch of the tile, so the two stone roundels
   * separated three identical carpets. Anchoring v to u instead means the
   * ornament unrolls once down the whole 48 m hall: a run that begins beyond a
   * gallery picks up the pattern where the roundel covered it, and the sixteen
   * medallions in a tile are sixteen different figures the visitor meets in
   * order rather than one figure met sixteen times. */
  const v0 = u0 / WAY_TILE_M;
  const v1 = u1 / WAY_TILE_M;
  const p00 = p(u0, -1);
  const p01 = p(u0, 1);
  const p10 = p(u1, -1);
  const p11 = p(u1, 1);
  const g = new THREE.BufferGeometry();
  // wound so the face looks up: see the cross-product check in the commit that
  // added this — the other winding renders the whole floor as a hole
  g.setAttribute('position', new THREE.Float32BufferAttribute([...p00, ...p11, ...p10, ...p00, ...p01, ...p11], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, v0, 1, v1, 0, v1, 0, v0, 1, v0, 1, v1], 2));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  // the discipline's own dye lot — see `dyeLot`
  const c: number[] = [];
  for (let i = 0; i < 6; i++) c.push(tint.r, tint.g, tint.b);
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  return g;
}

/**
 * "Rare collections: unique carpets specific to that discipline." — the brief.
 *
 * Eight materials would be eight draw calls, which this building cannot spend
 * on a floor. So the ways stay ONE material and one buffer, and each wing's
 * quads carry its cluster colour as a vertex attribute instead: three.js
 * multiplies `color` into the map, so the same weave comes off the loom eight
 * times in eight dye lots at no cost whatever.
 *
 * The mix is only 0.22 from white and it lerps FROM white deliberately —
 * multiplying by a value at or below 1 can darken and cool the cloth but never
 * brighten it, so no wing can end up with a modern saturated carpet. What
 * survives is what survives in real dyed wool: the alchemists' hall pulls a
 * hair green, the Kabbalah hall a hair blue, and you would only notice standing
 * in one having just left the other. Wings map to clusters by index, exactly as
 * `atmosphere.tsx` maps their window light — the floor and the light through
 * the glass are keyed off the same list, so a hall's colour is one colour.
 */
function dyeLot(a: number): THREE.Color {
  // matched by tolerance, not by identity: GATE_ANGLES normalises through a
  // modulo, and `(x % 2π + 2π) % 2π` can move an angle by an ulp — enough for
  // `indexOf` to miss and silently leave a hall undyed
  const i = WING_ANGLES.findIndex((w) => Math.abs(w - a) < 1e-9);
  if (i < 0) return new THREE.Color(1, 1, 1); // the entrance and apse are undyed
  const cluster = (Object.keys(CLUSTER_META) as ClusterId[])[i];
  return new THREE.Color(1, 1, 1).lerp(new THREE.Color(CLUSTER_META[cluster].color), 0.22);
}

/**
 * Extrude a polyline into a real bar: a top face and two sides, capped at the
 * ends when it is open. Every piece of brass in the Cosmographia is one of
 * these — a straight one is a selvedge fillet, an arc is a gate threshold, a
 * closed circle is a mandala ring or a roundel rim.
 *
 * This is deliberately NOT a textured quad. The chronology sills already made
 * the argument in this building: a gold gradient on a flat plane reads as a
 * sticker, because there is no edge for a lamp to catch and the whole two
 * metres of "brass" sits at one value. A bar has a lit top and two shaded
 * flanks, and walking past it the flanks flare in turn.
 *
 * Built as a triangle soup on purpose — un-indexed geometry makes
 * `computeVertexNormals` flat-shade, which is what a milled bar wants. Indexing
 * it would round the arris off and undo the point of building it at all.
 */
function ribbon(pts: [number, number][], halfW: number, y0: number, y1: number, closed: boolean): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const n = pts.length;
  const last = closed ? n : n - 1;
  // running distance, so a repeating brass map would not bunch on the corners
  let run = 0;
  const tri = (
    A: [number, number, number], B: [number, number, number], C: [number, number, number],
    ta: [number, number], tb: [number, number], tc: [number, number],
  ) => {
    pos.push(...A, ...B, ...C);
    uv.push(...ta, ...tb, ...tc);
  };
  /** left/right edge points of the bar at vertex i */
  const edge = (i: number): { L: [number, number]; R: [number, number] } => {
    const p = pts[i % n];
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    // the mitre direction: the average of the two segment normals, which keeps
    // a bar the same width through a corner instead of pinching it
    const t0: [number, number] = closed || i > 0 ? [p[0] - prev[0], p[1] - prev[1]] : [next[0] - p[0], next[1] - p[1]];
    const t1: [number, number] = closed || i < n - 1 ? [next[0] - p[0], next[1] - p[1]] : [p[0] - prev[0], p[1] - prev[1]];
    const nn = (t: [number, number]): [number, number] => {
      const l = Math.hypot(t[0], t[1]) || 1;
      return [-t[1] / l, t[0] / l];
    };
    const [ax, ay] = nn(t0);
    const [bx, by] = nn(t1);
    let mx = ax + bx;
    let my = ay + by;
    const ml = Math.hypot(mx, my) || 1;
    mx /= ml;
    my /= ml;
    // 1/cos(θ/2) keeps the mitred width true; clamped so a hairpin cannot
    // throw the corner to infinity
    const k = Math.min(2.5, 1 / Math.max(0.4, (mx * ax + my * ay)));
    return { L: [p[0] + mx * halfW * k, p[1] + my * halfW * k], R: [p[0] - mx * halfW * k, p[1] - my * halfW * k] };
  };

  for (let i = 0; i < last; i++) {
    const e0 = edge(i);
    const e1 = edge(i + 1);
    const seg = Math.hypot(pts[(i + 1) % n][0] - pts[i][0], pts[(i + 1) % n][1] - pts[i][1]);
    const v0 = run;
    const v1 = run + seg;
    run = v1;
    const L0: [number, number, number] = [e0.L[0], y1, e0.L[1]];
    const R0: [number, number, number] = [e0.R[0], y1, e0.R[1]];
    const L1: [number, number, number] = [e1.L[0], y1, e1.L[1]];
    const R1: [number, number, number] = [e1.R[0], y1, e1.R[1]];
    // top
    tri(R0, L1, L0, [0, v0], [1, v1], [1, v0]);
    tri(R0, R1, L1, [0, v0], [0, v1], [1, v1]);
    // the two flanks, dropped to y0
    const Ld0: [number, number, number] = [e0.L[0], y0, e0.L[1]];
    const Ld1: [number, number, number] = [e1.L[0], y0, e1.L[1]];
    const Rd0: [number, number, number] = [e0.R[0], y0, e0.R[1]];
    const Rd1: [number, number, number] = [e1.R[0], y0, e1.R[1]];
    tri(L0, L1, Ld1, [0, v0], [0, v1], [1, v1]);
    tri(L0, Ld1, Ld0, [0, v0], [1, v1], [1, v0]);
    tri(R0, Rd1, R1, [0, v0], [1, v1], [0, v1]);
    tri(R0, Rd0, Rd1, [0, v0], [1, v0], [1, v1]);
  }
  if (!closed) {
    for (const [i, sign] of [[0, -1], [n - 1, 1]] as const) {
      const e = edge(i);
      const L: [number, number, number] = [e.L[0], y1, e.L[1]];
      const R: [number, number, number] = [e.R[0], y1, e.R[1]];
      const Ld: [number, number, number] = [e.L[0], y0, e.L[1]];
      const Rd: [number, number, number] = [e.R[0], y0, e.R[1]];
      if (sign > 0) {
        tri(L, R, Rd, [0, 0], [1, 0], [1, 1]);
        tri(L, Rd, Ld, [0, 0], [1, 1], [0, 1]);
      } else {
        tri(R, L, Ld, [0, 0], [1, 0], [1, 1]);
        tri(R, Ld, Rd, [0, 0], [1, 1], [0, 1]);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/**
 * The bound selvedge and the tasselled ends — the two things that stop a carpet
 * looking like a decal of a carpet.
 *
 * A woven floor covering is not a flat sheet: it has 15–20 mm of pile, its long
 * edges are whipped with a cord that stands proud of that pile, and its short
 * ends are the warp itself, knotted off into a fringe that lies loose on the
 * floor. None of those three things can be painted into a texture, because all
 * three are a change of HEIGHT — a painted binding is a stripe, and a stripe is
 * what the flat look was. So they are geometry.
 *
 * Everything here is built to merge into the ways' own buffer: same attributes
 * (position, uv, normal, colour), same material, so the whole carpet — sheet,
 * binding and fringe — stays one draw call for the entire building.
 *
 * The UVs park on a deliberately quiet patch of the way sheet (u ≈ 0.3, v
 * arbitrary), which is plain field. These pieces want the cloth's colour and
 * grain, not any part of its drawing.
 */
const BIND_HALF = 0.045; // the cord is 90 mm across
const BIND_TOP = 0.03; // and stands 17 mm above the pile's 13 mm
const TASSEL_LEN = 0.26;
const TASSEL_PITCH = 0.055;

/** one box, as a triangle soup with flat normals, uv parked and vertex-tinted */
function bar(
  cx: number, cy: number, cz: number,
  hx: number, hy: number, hz: number,
  yaw: number,
  tint: THREE.Color,
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2);
  g.rotateY(yaw);
  g.translate(cx, cy, cz);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    col[i * 3] = tint.r;
    col[i * 3 + 1] = tint.g;
    col[i * 3 + 2] = tint.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // park every vertex on the same quiet texel of the field
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.3, 0.3);
  uv.needsUpdate = true;
  return g.toNonIndexed();
}

/**
 * The cord along both selvedges of one run, and the fringe at an end.
 *
 * `ends` says which of the run's two ends are real ends of the carpet rather
 * than cuts hidden under a stone roundel — a fringe at a roundel would be a
 * carpet stopping in the middle of the hall, which is exactly what the stone is
 * there to avoid saying.
 */
function wayEdging(
  a: number, u0: number, u1: number, half: number, tint: THREE.Color, ends: [boolean, boolean],
): THREE.BufferGeometry[] {
  const { ax, az, nx, nz } = frame(a);
  const out: THREE.BufferGeometry[] = [];
  const mid = (u0 + u1) / 2;
  const len = u1 - u0;
  // the whipped cord down both long edges. Darker than the field: a binding is
  // a different, tougher yarn, and it is the shadow under its own roll that
  // gives the carpet an edge you can see from across a hall.
  const cord = tint.clone().multiplyScalar(0.72);
  for (const s of [-1, 1]) {
    const off = half - BIND_HALF * 0.35; // just inside the selvedge, as a whipping is
    out.push(bar(
      ax * mid + nx * off * s, BIND_TOP / 2, az * mid + nz * off * s,
      len / 2, BIND_TOP / 2, BIND_HALF,
      -a, cord,
    ));
  }
  // the fringe: the warp knotted off and left lying. Every strand is its own
  // small bar with its own length and a little wander, because a fringe that
  // is all one length reads as a comb.
  const rng = (seed: number) => {
    const x = Math.sin(seed * 127.1 + a * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const pale = tint.clone().lerp(new THREE.Color('#cdbb94'), 0.75);
  for (const [i, isEnd] of ends.entries()) {
    if (!isEnd) continue;
    const dir = i === 0 ? -1 : 1; // which way the strands point out of the carpet
    const u = i === 0 ? u0 : u1;
    const n = Math.floor((half * 2) / TASSEL_PITCH);
    for (let k = 0; k < n; k++) {
      const r0 = rng(k + i * 97);
      const r1 = rng(k + i * 97 + 13);
      const r2 = rng(k + i * 97 + 29);
      // A comb is what you get from an even row of even teeth, and an even row
      // of even teeth is what the first cut of this was. Real fringe has gaps
      // where a strand has gone, clumps where two have twisted together, and no
      // two the same length — so a few are dropped outright and the rest wander
      // most of a pitch either way.
      if (r2 > 0.88) continue;
      const lat = -half + (k + 0.5) * TASSEL_PITCH + (r0 - 0.5) * TASSEL_PITCH * 0.9;
      const l = TASSEL_LEN * (0.4 + r1 * 0.9);
      const cu = u + dir * (l / 2);
      out.push(bar(
        ax * cu + nx * lat, 0.006, az * cu + nz * lat,
        l / 2, 0.006, 0.011,
        -a + (r0 - 0.5) * 0.22, // each strand splayed a little off true
        pale.clone().multiplyScalar(0.82 + r1 * 0.3),
      ));
    }
  }
  return out;
}

/** a circle as a polyline, for `ribbon` */
function circlePts(cx: number, cz: number, r: number, segs: number): [number, number][] {
  return Array.from({ length: segs }, (_, i) => {
    const t = (i / segs) * Math.PI * 2;
    return [cx + Math.cos(t) * r, cz + Math.sin(t) * r] as [number, number];
  });
}

/** an arc of a circle centred on the origin, for a gate threshold */
function arcPts(a: number, halfArc: number, r: number, segs: number): [number, number][] {
  return Array.from({ length: segs + 1 }, (_, i) => {
    const t = a - halfArc + (i / segs) * halfArc * 2;
    return [Math.cos(t) * r, Math.sin(t) * r] as [number, number];
  });
}

/* ————— the component ————— */

const Y_MANDALA = 0.011;
const Y_WAY = 0.013;
const Y_ROUNDEL = 0.015;
const BRASS_Y0 = 0.006;
const BRASS_Y1 = 0.025;

export function Cosmographia() {
  // The mandala is the one image in the building that must not tile, so it asks
  // for repeat [1,1] and gets its whole 4K sheet across the disc. `alphaTest`
  // rather than `transparent` — the fringe is cut into the alpha, and a 31 m
  // transparent disc lying under every other transparent thing in the rotunda
  // would be a sorting problem with no upside.
  const mandalaMat = useMemo(() => getMaterial('fabric_cosmographia_mandala', { repeat: [1, 1] }), []);
  const wayMat = useMemo(
    () => getMaterial('fabric_ceremonial_way', { repeat: [1, 1], overrides: { vertexColors: true } }),
    [],
  );
  const roundelMat = useMemo(() => getMaterial('stone_observatory_roundel', { repeat: [1, 1] }), []);
  // A shade duller and less mirror-like than the lamp brass: this metal is
  // underfoot, and floor brass is polished by soles rather than by a cloth.
  const brassMat = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        overrides: { color: '#a8853f', metalness: 0.82, roughness: 0.46 },
      }),
    [],
  );

  /** every carpet run in the building, in one buffer */
  const waysGeom = useMemo(() => {
    const parts = GATES.flatMap((g) => {
      const tint = dyeLot(g.a);
      const last = g.runs.length - 1;
      return g.runs.flatMap(([u0, u1], i) => [
        wayQuad(g.a, u0, u1, g.half, Y_WAY, tint),
        // a real end only at the rotunda and at the far wall; every other run
        // boundary is a cut lying under a stone roundel
        ...wayEdging(g.a, u0, u1, g.half, tint, [i === 0, i === last]),
      ]);
    });
    const merged = mergeGeometries(parts, false)!;
    parts.forEach((p) => p.dispose());
    return merged;
  }, []);

  /** every stone roundel, in one buffer. A disc rather than an instanced mesh:
   *  sixteen of them is well under the point where instancing pays, and a
   *  merged buffer keeps them in the same draw call as nothing else. */
  const roundelsGeom = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (const g of GATES) {
      const { ax, az } = frame(g.a);
      for (const u of g.roundels) {
        const disc = new THREE.CircleGeometry(ROUNDEL_R, 56);
        disc.rotateX(-Math.PI / 2);
        // Turn the rose so its north points back down the hall at the mandala —
        // a compass set in a pavement points at something, and here that is the
        // centre of the building.
        //
        // The angle: `rotateY(θ)` sends a world direction φ to φ − θ, and the
        // sheet is painted with north at φ −π/2 (canvas up is world −z under
        // this UV convention). Wanting north at the gate's reciprocal, a + π,
        // gives θ = −π/2 − (a + π) ≡ π/2 − a.
        disc.rotateY(Math.PI / 2 - g.a);
        disc.translate(ax * u, Y_ROUNDEL, az * u);
        parts.push(disc);
      }
    }
    const merged = mergeGeometries(parts, false)!;
    parts.forEach((p) => p.dispose());
    return merged;
  }, []);

  /** all the trim: two rings, the ten thresholds, and the roundel rims */
  const brassGeom = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    // Two rings, struck ON the painted rules they cover so the drawing and the
    // metal are the same line rather than two near-misses.
    //
    // There is a third painted rule at 11.95 and it stays PAINTED. The four
    // reading tables stand at r 11.52 — a real bead there would run through
    // their legs and pedestals at ankle height. This is the one place the
    // diagram and the furniture disagree, and the metal is what gives way.
    for (const r of [9.25, 15.2]) parts.push(ribbon(circlePts(0, 0, r, 224), 0.075, BRASS_Y0, BRASS_Y1, true));
    for (const g of GATES) {
      const { ax, az } = frame(g.a);
      // the threshold: an arc following the drum, spanning the whole mouth, so
      // the gate is marked across its full width and not just where the carpet
      // happens to be
      parts.push(ribbon(arcPts(g.a, Math.asin(g.mouth / THRESHOLD_R), THRESHOLD_R, 26), 0.13, BRASS_Y0, BRASS_Y1, false));
      /* NO SELVEDGE FILLETS.
       *
       * There was a 70 mm brass bar down both edges of every way, the full
       * length of every hall. It made sense when the ways were banded runners
       * laid on the floor — metal is how you trim the edge of a thing that is
       * lying on top of another thing. The ways are not that any more: they are
       * the rotunda's own carpet continued out through the gates, one dye and
       * one weave, and a carpet does not have a brass rule down it.
       *
       * What it actually looked like is the more important half of the reason.
       * A perfectly straight gold line running 48 m to a vanishing point, in a
       * hall lit at 15%, is the brightest and straightest thing in the room —
       * so the eye follows it instead of the room, and the floor reads as
       * inlaid metalwork with some carpet between the lines. The thresholds
       * still mark every gate in brass; that is a doorway, and a doorway is
       * exactly where a hard bright line belongs.
       */
      for (const u of g.roundels)
        parts.push(ribbon(circlePts(ax * u, az * u, ROUNDEL_R + 0.02, 64), 0.07, BRASS_Y0, BRASS_Y1 + 0.002, true));
    }
    const merged = mergeGeometries(parts, false)!;
    parts.forEach((p) => p.dispose());
    return merged;
  }, []);

  /* ————— pile relief —————
   *
   * The carpets were albedo and nothing else, and an albedo-only surface is
   * flat by definition: the shader has one normal for the whole plane, so the
   * cloth cannot catch a lamp on one side of a knot and shade on the other, and
   * the eye — which reads a floor almost entirely by that — calls it a picture
   * of a carpet. The painted sheet already carries the pile's COLOUR (it is
   * built on a real scan); this gives it the pile's FORM.
   *
   * It is the scanned wool's own normal map, the companion file to the albedo
   * the painters composite, tiled at the same 1.15 m as that albedo so the
   * bumps land on the knots rather than beside them. Both sheets are UV-mapped
   * in metres, so the repeat is just the surface's size over the tile's.
   *
   * WHY IT IS ASSIGNED HERE, AFTER `primeMaterials`, AND NOT IN library.json:
   * `applyMaps` is a complete pass, not an additive one — it nulls every slot a
   * material has no scan of its own for, and the ways have no scan of their
   * own, only a painter. Assigned any earlier, this map is cleared the moment
   * the manifest lands. Chaining off the same promise is what makes it stick.
   */
  useLayoutEffect(() => {
    let live = true;
    void primeMaterials().then(() => {
      if (!live) return;
      const tex = new THREE.TextureLoader().load('/textures/Fabric/fabric_rug_persian/normal.jpg');
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 8;
      const PILE_M = 1.15;
      // the ways: u spans the 3.2 m width, v one WAY_TILE_M down the hall
      const wayN = tex.clone();
      wayN.needsUpdate = true;
      wayN.repeat.set((HALF_WING * 2) / PILE_M, WAY_TILE_M / PILE_M);
      wayMat.normalMap = wayN;
      wayMat.normalScale.set(0.7, 0.7);
      wayMat.needsUpdate = true;
      // the mandala: one sheet over the whole 2 × MANDALA_R disc
      const mandN = tex.clone();
      mandN.needsUpdate = true;
      mandN.repeat.set((MANDALA_R * 2) / PILE_M, (MANDALA_R * 2) / PILE_M);
      mandalaMat.normalMap = mandN;
      mandalaMat.normalScale.set(0.55, 0.55);
      mandalaMat.needsUpdate = true;
    });
    return () => {
      live = false;
    };
  }, [wayMat, mandalaMat]);

  // Only the geometry is ours. All four materials come from the registry and are
  // shared building-wide — disposing one here blanks every other surface using
  // it the moment the explorer remounts.
  useLayoutEffect(
    () => () => {
      waysGeom.dispose();
      roundelsGeom.dispose();
      brassGeom.dispose();
    },
    [waysGeom, roundelsGeom, brassGeom],
  );

  return (
    <group>
      {/* the rotunda. Laid on a circle turned flat, which is the UV convention
          the sheet is painted to — see cosmographiaArt.ts, and the orrery
          charts' note on why a cylinder cap is not interchangeable with it. */}
      <mesh rotation-x={-Math.PI / 2} position-y={Y_MANDALA} material={mandalaMat}>
        <circleGeometry args={[MANDALA_R, 192]} />
      </mesh>
      <mesh geometry={waysGeom} material={wayMat} />
      <mesh geometry={roundelsGeom} material={roundelMat} />
      <mesh geometry={brassGeom} material={brassMat} />
    </group>
  );
}
