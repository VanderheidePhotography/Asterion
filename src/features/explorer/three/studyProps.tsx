import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMaterial } from '../../../materials';
import { getGlowTexture } from './glowTexture';
import { mulberry32 } from '../../../domain/random';
import { TABLE_SPECS } from './furniture';

/**
 * THE FOUR WORKSTATIONS.
 *
 * Each reading table used to be a table, a chair and a candle. Nothing said
 * what was studied there, and nothing said anybody had ever sat there — which
 * is the difference between a museum with exhibits and a building somebody
 * works in.
 *
 * ── the brief, in one line ─────────────────────────────────────────────────
 *
 * The scholar stood up a minute ago and is coming back. So: nothing is
 * centred, nothing is square to the table, the books are open at the page they
 * were left at, a candle has been burning long enough to pool wax on the
 * boards, and the chair is pushed out at an angle. Arranged reads as a display
 * case; INTERRUPTED reads as a life.
 *
 * ── what the layout has to dodge ───────────────────────────────────────────
 *
 * Three things, and all three bite:
 *
 * 1. THE READING PROP. Every table already carries an interactive object and
 *    the visitor is seated in front of it with the camera framing it. The
 *    footprints are declared in `KEEP_CLEAR` below and measured off the props
 *    themselves — the alchemy slab is 2.10 × 0.50, the tarot spread reaches
 *    0.61 either side, the Kabbalah tablet stands up out of the table.
 * 2. THE SEATS. Chairs sit at z + 1.22 and at (−0.60, −0.95) (see
 *    `ReadingTables`). A scholar will eventually be animated into them, so the
 *    tabletop directly in front of a chair stays clear of anything taller than
 *    a sheet of paper — a body has to be able to occupy that space later
 *    without a mortar growing out of its ribs.
 * 3. THE COLLISION CIRCLE. Each table is an obstacle of radius 1.90. Anything
 *    on the FLOOR has to live inside that circle or a visitor walks through
 *    it; anything outside it has to be walkable-around, and nothing here is.
 *
 * ── and the draw-call budget ───────────────────────────────────────────────
 *
 * This is around four hundred primitives. Built as components that would be
 * four hundred draw calls in a museum that is already draw-call bound, so
 * every piece is baked into ONE world-space buffer per material at module
 * scope: nine meshes for all four stations together, plus one additive sheet
 * for the candle pools and one `Points` for the flames. Twelve calls, once.
 *
 * ── and the light budget ───────────────────────────────────────────────────
 *
 * "Each table casts its own warm pool of candlelight" costs four point lights
 * done literally, and a light here is about 1.5 fps whatever its `distance`
 * (three evaluates every light on every lit fragment of every draw call). Four
 * tables plus the statuary's two spotlights would have been six new lights and
 * something like a fifth of the frame rate.
 *
 * So this pass adds NO net light at all. The pools are additive planes lying on
 * the boards — the same trick the statue niches use, and it works for the same
 * reason — the flames are one `Points` object, and exactly ONE real practical
 * is lit: the tall candlestick on the kabbalist's table. That one replaces the
 * flickering candle `ReadingTables` used to own, so the count is unchanged and
 * the light has simply moved to a taller candle that throws it further.
 */

/* ————————————————————— the merge kit ————————————————————— */

type Bucket = 'wood' | 'paper' | 'leather' | 'brass' | 'iron' | 'wax' | 'glass' | 'stone' | 'cloth';

const BUCKETS: Bucket[] = ['wood', 'paper', 'leather', 'brass', 'iron', 'wax', 'glass', 'stone', 'cloth'];

interface Placement {
  /** world position of the piece's own origin */
  at: [number, number, number];
  /** yaw, then pitch, then roll — enough to lie a quill across an inkwell */
  rot?: [number, number, number];
  scale?: [number, number, number] | number;
}

/**
 * Accumulates primitives into one buffer per material.
 *
 * Everything is converted to non-indexed before merging. `mergeGeometries`
 * refuses a mix of indexed and non-indexed inputs, and the polyhedra used for
 * the mineral specimens come out of three non-indexed while every box and
 * cylinder comes out indexed — which is a silent `null` return and an empty
 * table, not an error.
 */
class Kit {
  private parts = new Map<Bucket, THREE.BufferGeometry[]>();
  private scratch: THREE.BufferGeometry[] = [];

  add(bucket: Bucket, geom: THREE.BufferGeometry, p: Placement): void {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const r = p.rot ?? [0, 0, 0];
    q.setFromEuler(new THREE.Euler(r[1], r[0], r[2], 'YXZ'));
    const s = p.scale ?? 1;
    m.compose(
      new THREE.Vector3(...p.at),
      q,
      typeof s === 'number' ? new THREE.Vector3(s, s, s) : new THREE.Vector3(...s),
    );
    const g = geom.index ? geom.toNonIndexed() : geom.clone();
    g.applyMatrix4(m);
    if (!this.parts.has(bucket)) this.parts.set(bucket, []);
    this.parts.get(bucket)!.push(g);
    this.scratch.push(g);
  }

  /** a primitive built here and thrown away — the kit owns the merged copy */
  own<T extends THREE.BufferGeometry>(g: T): T {
    this.scratch.push(g);
    return g;
  }

  build(): Partial<Record<Bucket, THREE.BufferGeometry>> {
    const out: Partial<Record<Bucket, THREE.BufferGeometry>> = {};
    for (const b of BUCKETS) {
      const list = this.parts.get(b);
      if (!list || list.length === 0) continue;
      const merged = mergeGeometries(list, false);
      if (merged) out[b] = merged;
    }
    // the per-piece copies have all been baked into the merges now
    this.scratch.forEach((g) => g.dispose());
    this.scratch = [];
    this.parts.clear();
    return out;
  }
}

/* ————————————————————— the pieces ————————————————————— */

/* Shared primitives. Built once and handed to `Kit.add`, which copies and
 * transforms — a `BoxGeometry` per screw would be several hundred allocations
 * for geometry that is thrown away a millisecond later. */
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
const CONE = new THREE.ConeGeometry(0.5, 1, 10);
const SPH = new THREE.SphereGeometry(0.5, 14, 10);
const TOR = new THREE.TorusGeometry(0.5, 0.08, 6, 16);
const ROCK = new THREE.DodecahedronGeometry(0.5, 0);
const SHARD = new THREE.OctahedronGeometry(0.5, 0);

/** where a flame stands, collected as the kit is built */
interface Flame {
  at: [number, number, number];
  size: number;
  /** the two brightest tapers get a real point light; the stubs never do */
  hero: boolean;
}

/** the working frame of one table: local (x, z) → world */
interface Desk {
  x: number;
  z: number;
  rng: () => number;
  kit: Kit;
  flames: Flame[];
}

/**
 * The surface everything is currently being laid on.
 *
 * A module-level variable rather than a parameter threaded through forty
 * helpers. Both reading tables top out at 0.825 — the rectangular slab is
 * 0.09 thick centred at 0.78, the round one likewise — and the only surface
 * that differs is the zodiac station's side table, which `withTop` moves the
 * plane to for the length of one block. Passing a height into every single
 * placement instead would double the width of every call in this file for one
 * caller's benefit.
 */
let TOP = 0.825;

/** lay the next batch of pieces on a different surface (a side table, a shelf) */
function withTop(y: number, body: () => void): void {
  const saved = TOP;
  TOP = y;
  try {
    body();
  } finally {
    TOP = saved;
  }
}

const at = (d: Desk, x: number, y: number, z: number): [number, number, number] => [d.x + x, y, d.z + z];

/* ——— paper and books ——— */

/** a rolled sheet, always lying at an angle — a scroll square to a table edge
 *  is the single most obviously placed object in the world */
function scroll(d: Desk, x: number, z: number, len: number, r: number, yaw: number, tied = true): void {
  d.kit.add('paper', CYL, { at: at(d, x, TOP + r, z), rot: [yaw, 0, Math.PI / 2], scale: [r * 2, len, r * 2] });
  // the loose outer turn, a shade proud of the roll
  d.kit.add('paper', CYL, {
    at: at(d, x + Math.cos(yaw) * len * 0.28, TOP + r * 1.05, z - Math.sin(yaw) * len * 0.28),
    rot: [yaw, 0, Math.PI / 2],
    scale: [r * 2.2, len * 0.4, r * 2.2],
  });
  if (tied) {
    d.kit.add('iron', TOR, {
      at: at(d, x, TOP + r, z),
      rot: [yaw, 0, Math.PI / 2],
      scale: [r * 2.5, r * 2.5, r * 2.5],
    });
  }
}

/** a loose sheet, curled at one corner where it has been handled */
function sheet(d: Desk, x: number, z: number, w: number, h: number, yaw: number, lift = 0): void {
  d.kit.add('paper', BOX, { at: at(d, x, TOP + 0.002 + lift, z), rot: [yaw, 0, 0], scale: [w, 0.0035, h] });
  d.kit.add('paper', BOX, {
    at: at(d, x + w * 0.4, TOP + 0.012 + lift, z + h * 0.36),
    rot: [yaw, -0.22, 0],
    scale: [w * 0.26, 0.003, h * 0.26],
  });
}

/** a closed book: boards, a text block a little smaller, and a raised spine */
function bookClosed(d: Desk, x: number, y: number, z: number, w: number, dp: number, h: number, yaw: number): void {
  d.kit.add('leather', BOX, { at: at(d, x, y + h / 2, z), rot: [yaw, 0, 0], scale: [w, h, dp] });
  d.kit.add('paper', BOX, { at: at(d, x, y + h / 2, z), rot: [yaw, 0, 0], scale: [w * 0.94, h * 0.8, dp * 0.96] });
  d.kit.add('leather', CYL, {
    at: at(d, x - Math.cos(yaw) * w * 0.5, y + h / 2, z + Math.sin(yaw) * w * 0.5),
    rot: [yaw, 0, 0],
    scale: [h, dp, h],
  });
}

/** a book open at the page it was left at, its boards splayed unevenly */
function bookOpen(d: Desk, x: number, z: number, yaw: number, w = 0.30, h = 0.38): void {
  for (const s of [-1, 1]) {
    d.kit.add('paper', BOX, {
      at: at(d, x + Math.cos(yaw) * s * w * 0.52, TOP + 0.018, z - Math.sin(yaw) * s * w * 0.52),
      rot: [yaw, 0, s * -0.1],
      scale: [w, 0.024, h],
    });
    d.kit.add('leather', BOX, {
      at: at(d, x + Math.cos(yaw) * s * w * 0.54, TOP + 0.004, z - Math.sin(yaw) * s * w * 0.54),
      rot: [yaw, 0, s * -0.1],
      scale: [w * 1.08, 0.012, h * 1.06],
    });
  }
}

/** books left where they were put down, not stacked square */
function bookStack(d: Desk, x: number, y: number, z: number, n: number, yaw: number): number {
  let cy = y;
  for (let i = 0; i < n; i++) {
    const h = 0.045 + d.rng() * 0.035;
    bookClosed(
      d,
      x + (d.rng() - 0.5) * 0.05,
      cy,
      z + (d.rng() - 0.5) * 0.05,
      0.24 + d.rng() * 0.1,
      0.17 + d.rng() * 0.07,
      h,
      yaw + (d.rng() - 0.5) * 0.5,
    );
    cy += h;
  }
  return cy;
}

/** a letter with its seal still on it */
function letter(d: Desk, x: number, z: number, yaw: number): void {
  d.kit.add('paper', BOX, { at: at(d, x, TOP + 0.004, z), rot: [yaw, 0, 0], scale: [0.19, 0.007, 0.13] });
  d.kit.add('wax', CYL, { at: at(d, x, TOP + 0.011, z), rot: [0, 0, 0], scale: [0.032, 0.006, 0.032] });
}

/* ——— writing ——— */

function inkwell(d: Desk, x: number, z: number, open = true): void {
  d.kit.add('iron', CYL, { at: at(d, x, TOP + 0.026, z), scale: [0.072, 0.052, 0.072] });
  d.kit.add('brass', CYL, { at: at(d, x, TOP + 0.054, z), scale: [0.078, 0.008, 0.078] });
  if (open) {
    // the ink itself, a black disc just below the rim
    d.kit.add('iron', CYL, { at: at(d, x, TOP + 0.05, z), scale: [0.056, 0.004, 0.056] });
  } else {
    d.kit.add('brass', SPH, { at: at(d, x, TOP + 0.066, z), scale: [0.05, 0.036, 0.05] });
  }
}

/** a quill, always lying across something */
function quill(d: Desk, x: number, z: number, yaw: number, tilt = 0.18): void {
  d.kit.add('paper', CYL, {
    at: at(d, x, TOP + 0.05, z),
    rot: [yaw, tilt, Math.PI / 2],
    scale: [0.008, 0.24, 0.008],
  });
  // the vane: two thin blades, not a cylinder — a feather has an edge
  for (const s of [-1, 1]) {
    d.kit.add('paper', BOX, {
      at: at(d, x - Math.cos(yaw) * 0.09, TOP + 0.05 + Math.sin(tilt) * 0.09, z + Math.sin(yaw) * 0.09),
      rot: [yaw, tilt, s * 0.5],
      scale: [0.11, 0.002, 0.026],
    });
  }
  d.kit.add('iron', CONE, {
    at: at(d, x + Math.cos(yaw) * 0.12, TOP + 0.05 - Math.sin(tilt) * 0.12, z - Math.sin(yaw) * 0.12),
    rot: [yaw, 0, Math.PI / 2 + tilt],
    scale: [0.012, 0.03, 0.012],
  });
}

function spectacles(d: Desk, x: number, z: number, yaw: number): void {
  for (const s of [-1, 1]) {
    d.kit.add('brass', TOR, {
      at: at(d, x + Math.cos(yaw) * s * 0.036, TOP + 0.008, z - Math.sin(yaw) * s * 0.036),
      rot: [yaw, Math.PI / 2, 0],
      scale: [0.062, 0.062, 0.062],
    });
  }
  d.kit.add('brass', CYL, {
    at: at(d, x, TOP + 0.008, z),
    rot: [yaw, 0, Math.PI / 2],
    scale: [0.005, 0.03, 0.005],
  });
}

function paperweight(d: Desk, x: number, z: number): void {
  d.kit.add('stone', SPH, { at: at(d, x, TOP, z), scale: [0.09, 0.09, 0.09] });
  d.kit.add('brass', CYL, { at: at(d, x, TOP + 0.004, z), scale: [0.075, 0.008, 0.075] });
}

/* ——— light ——— */

/** a candle burnt most of the way down, wax run over its own saucer */
function candleStub(d: Desk, x: number, z: number, h: number, hero = false): void {
  d.kit.add('brass', CYL, { at: at(d, x, TOP + 0.006, z), scale: [0.088, 0.012, 0.088] });
  d.kit.add('wax', CYL, { at: at(d, x, TOP + 0.012 + h / 2, z), scale: [0.028, h, 0.028] });
  // the drips: three runs down one side only, because a candle guttering in a
  // draught always runs the same way
  for (let i = 0; i < 3; i++) {
    const a = 0.5 + i * 0.55;
    d.kit.add('wax', CONE, {
      at: at(d, x + Math.cos(a) * 0.026, TOP + 0.012 + h * (0.35 + i * 0.12), z + Math.sin(a) * 0.026),
      rot: [0, 0, Math.PI],
      scale: [0.016, h * 0.5, 0.016],
    });
  }
  d.kit.add('wax', CYL, { at: at(d, x, TOP + 0.016, z), scale: [0.075, 0.008, 0.075] });
  d.kit.add('iron', CYL, { at: at(d, x, TOP + 0.012 + h + 0.008, z), scale: [0.004, 0.018, 0.004] });
  d.flames.push({ at: at(d, x, TOP + 0.012 + h + 0.03, z), size: 0.2, hero });
}

/** a wax puddle where a candle stood and was moved */
function waxPuddle(d: Desk, x: number, z: number, r: number): void {
  d.kit.add('wax', CYL, { at: at(d, x, TOP + 0.0015, z), scale: [r * 2, 0.003, r * 1.6] });
  d.kit.add('wax', CYL, { at: at(d, x + r * 0.5, TOP + 0.0015, z + r * 0.3), scale: [r, 0.0026, r * 0.8] });
}

/** a tall brass candlestick — the scholar's own light, not the room's */
function candlestick(d: Desk, x: number, z: number, h: number, hero = false): void {
  d.kit.add('brass', CYL, { at: at(d, x, TOP + 0.008, z), scale: [0.1, 0.016, 0.1] });
  d.kit.add('brass', CYL, { at: at(d, x, TOP + h / 2, z), scale: [0.02, h, 0.02] });
  d.kit.add('brass', SPH, { at: at(d, x, TOP + h * 0.45, z), scale: [0.05, 0.035, 0.05] });
  d.kit.add('brass', CONE, { at: at(d, x, TOP + h + 0.014, z), rot: [0, 0, Math.PI], scale: [0.055, 0.04, 0.055] });
  d.kit.add('wax', CYL, { at: at(d, x, TOP + h + 0.09, z), scale: [0.024, 0.14, 0.024] });
  d.kit.add('iron', CYL, { at: at(d, x, TOP + h + 0.168, z), scale: [0.004, 0.02, 0.004] });
  d.flames.push({ at: at(d, x, TOP + h + 0.192, z), size: 0.24, hero });
}

/* ——— containers and furniture ——— */

function tray(d: Desk, x: number, z: number, w: number, dp: number, yaw: number): void {
  d.kit.add('wood', BOX, { at: at(d, x, TOP + 0.008, z), rot: [yaw, 0, 0], scale: [w, 0.016, dp] });
  for (const [ox, oz, sw, sd] of [
    [w / 2, 0, 0.014, dp],
    [-w / 2, 0, 0.014, dp],
    [0, dp / 2, w, 0.014],
    [0, -dp / 2, w, 0.014],
  ]) {
    d.kit.add('wood', BOX, {
      at: at(d, x + Math.cos(yaw) * ox + Math.sin(yaw) * oz, TOP + 0.026, z - Math.sin(yaw) * ox + Math.cos(yaw) * oz),
      rot: [yaw, 0, 0],
      scale: [sw, 0.036, sd],
    });
  }
}

/** a three-legged stool, always pushed away at an angle */
function stool(d: Desk, x: number, z: number, yaw: number): void {
  d.kit.add('wood', CYL, { at: at(d, x, 0.47, z), scale: [0.3, 0.045, 0.3] });
  for (let i = 0; i < 3; i++) {
    const a = yaw + (i / 3) * Math.PI * 2;
    d.kit.add('wood', CYL, {
      at: at(d, x + Math.cos(a) * 0.11, 0.225, z + Math.sin(a) * 0.11),
      rot: [a + Math.PI / 2, 0, 0.11],
      scale: [0.028, 0.46, 0.028],
    });
  }
}

/** a shallow crate of folios on the floor beside the desk */
function crate(d: Desk, x: number, z: number, yaw: number): void {
  const w = 0.46;
  const dp = 0.34;
  d.kit.add('wood', BOX, { at: at(d, x, 0.02, z), rot: [yaw, 0, 0], scale: [w, 0.04, dp] });
  for (const [ox, oz, sw, sd] of [
    [w / 2, 0, 0.02, dp],
    [-w / 2, 0, 0.02, dp],
    [0, dp / 2, w, 0.02],
    [0, -dp / 2, w, 0.02],
  ]) {
    d.kit.add('wood', BOX, {
      at: at(d, x + Math.cos(yaw) * ox + Math.sin(yaw) * oz, 0.14, z - Math.sin(yaw) * ox + Math.cos(yaw) * oz),
      rot: [yaw, 0, 0],
      scale: [sw, 0.24, sd],
    });
  }
  // the folios standing in it, leaning against each other
  for (let i = 0; i < 5; i++) {
    const t = (i / 4 - 0.5) * (w - 0.14);
    d.kit.add('leather', BOX, {
      at: at(d, x + Math.cos(yaw) * t, 0.19, z - Math.sin(yaw) * t),
      rot: [yaw, 0, 0.06 + d.rng() * 0.12],
      scale: [0.05 + d.rng() * 0.03, 0.3 + d.rng() * 0.08, dp - 0.09],
    });
  }
}

/** a low side table — what the round zodiac table has instead of a spare edge */
function sideTable(d: Desk, x: number, z: number, yaw: number, w: number, dp: number): number {
  const h = 0.7;
  d.kit.add('wood', BOX, { at: at(d, x, h, z), rot: [yaw, 0, 0], scale: [w, 0.045, dp] });
  for (const [ox, oz] of [
    [w / 2 - 0.06, dp / 2 - 0.06],
    [-(w / 2 - 0.06), dp / 2 - 0.06],
    [w / 2 - 0.06, -(dp / 2 - 0.06)],
    [-(w / 2 - 0.06), -(dp / 2 - 0.06)],
  ]) {
    d.kit.add('wood', CYL, {
      at: at(d, x + Math.cos(yaw) * ox + Math.sin(yaw) * oz, (h - 0.02) / 2, z - Math.sin(yaw) * ox + Math.cos(yaw) * oz),
      scale: [0.038, h - 0.02, 0.038],
    });
  }
  return h + 0.022;
}

/* ——— instruments ——— */

function dividers(d: Desk, x: number, z: number, yaw: number, len = 0.2): void {
  for (const s of [-1, 1]) {
    d.kit.add('brass', CYL, {
      at: at(d, x + Math.cos(yaw) * len * 0.28 * s, TOP + 0.008, z - Math.sin(yaw) * len * 0.28 * s),
      rot: [yaw + s * 0.34, 0, Math.PI / 2],
      scale: [0.011, len, 0.011],
    });
  }
  d.kit.add('brass', SPH, {
    at: at(d, x - Math.cos(yaw) * len * 0.5, TOP + 0.012, z + Math.sin(yaw) * len * 0.5),
    scale: [0.028, 0.02, 0.028],
  });
}

function straightedge(d: Desk, x: number, z: number, yaw: number, len: number): void {
  d.kit.add('wood', BOX, { at: at(d, x, TOP + 0.007, z), rot: [yaw, 0, 0], scale: [len, 0.014, 0.05] });
  d.kit.add('brass', BOX, {
    at: at(d, x + Math.sin(yaw) * 0.026, TOP + 0.008, z + Math.cos(yaw) * 0.026),
    rot: [yaw, 0, 0],
    scale: [len, 0.012, 0.006],
  });
}

/** a small brass disc instrument seen edge-on — astrolabe, quadrant, dial */
function astrolabe(d: Desk, x: number, z: number, yaw: number, r: number, lean: number): void {
  d.kit.add('brass', CYL, { at: at(d, x, TOP + r * Math.cos(lean) * 0.98, z), rot: [yaw, 0, lean + Math.PI / 2], scale: [r * 2, 0.012, r * 2] });
  d.kit.add('brass', TOR, { at: at(d, x, TOP + r * Math.cos(lean) * 0.98, z), rot: [yaw, 0, lean + Math.PI / 2], scale: [r * 2, r * 2, r * 2] });
  // the rule pivoting across its face
  d.kit.add('brass', BOX, {
    at: at(d, x, TOP + r * Math.cos(lean) * 0.98, z),
    rot: [yaw, 0, lean + 0.6],
    scale: [r * 1.8, 0.02, 0.012],
  });
  // the little throne it hangs from
  d.kit.add('brass', TOR, {
    at: at(d, x, TOP + r * Math.cos(lean) * 2.02, z),
    rot: [yaw, 0, lean + Math.PI / 2],
    scale: [r * 0.24, r * 0.24, r * 0.24],
  });
}

function quadrant(d: Desk, x: number, z: number, yaw: number): void {
  d.kit.add('brass', BOX, { at: at(d, x, TOP + 0.006, z), rot: [yaw, 0, 0], scale: [0.24, 0.012, 0.24] });
  d.kit.add('brass', CYL, { at: at(d, x - 0.1, TOP + 0.013, z - 0.1), scale: [0.03, 0.008, 0.03] });
  d.kit.add('iron', CYL, {
    at: at(d, x - 0.04, TOP + 0.014, z - 0.04),
    rot: [yaw + 0.8, 0, Math.PI / 2],
    scale: [0.003, 0.17, 0.003],
  });
}

/** a small terrestrial or celestial globe in a brass meridian ring. The ball
 *  is PAPER, not stone: a globe is printed gores pasted over a shell, and in
 *  dark grey it read as a boulder somebody had left on the floor. */
function globe(d: Desk, x: number, y: number, z: number, r: number): void {
  d.kit.add('paper', SPH, { at: at(d, x, y + r + 0.05, z), scale: [r * 2, r * 2, r * 2] });
  d.kit.add('brass', TOR, {
    at: at(d, x, y + r + 0.05, z),
    rot: [0.3, 0, 0.41],
    scale: [r * 2.25, r * 2.25, r * 2.25],
  });
  d.kit.add('brass', CYL, { at: at(d, x, y + 0.025, z), scale: [r * 1.1, 0.05, r * 1.1] });
}

/* ——— the alchemist's glass ——— */

/**
 * Glass is a PLAIN ALPHA material here, never `transmission`.
 *
 * Anything in this scene with transmission > 0 makes three render the entire
 * museum a second time every frame into a refraction target: five small flasks
 * once took it from 29.8 fps to 4.2. Real refraction is reserved for a hero
 * prop a visitor puts their face against, and a retort at the back of a bench
 * is not that.
 */
function flask(d: Desk, x: number, z: number, r: number, neck: number): void {
  d.kit.add('glass', SPH, { at: at(d, x, TOP + r * 0.92, z), scale: [r * 2, r * 1.85, r * 2] });
  d.kit.add('glass', CYL, { at: at(d, x, TOP + r * 1.8 + neck / 2, z), scale: [r * 0.5, neck, r * 0.5] });
  d.kit.add('glass', CYL, { at: at(d, x, TOP + r * 1.8 + neck, z), scale: [r * 0.72, 0.012, r * 0.72] });
}

/** an alembic: cucurbit, still-head and the beak running down to a receiver */
function alembic(d: Desk, x: number, z: number, yaw: number): void {
  d.kit.add('glass', SPH, { at: at(d, x, TOP + 0.11, z), scale: [0.2, 0.2, 0.2] });
  // the liquor still in it
  d.kit.add('glass', SPH, { at: at(d, x, TOP + 0.085, z), scale: [0.16, 0.1, 0.16] });
  d.kit.add('glass', CYL, { at: at(d, x, TOP + 0.225, z), scale: [0.11, 0.06, 0.11] });
  d.kit.add('glass', CONE, { at: at(d, x, TOP + 0.30, z), scale: [0.15, 0.12, 0.15] });
  // the beak, in three straight runs — a swan neck read from two metres is a
  // silhouette, and three segments give it one for a tenth of the triangles
  const seg: [number, number, number, number, number][] = [
    [0.13, 0.30, 0.10, 0.9, 0.0],
    [0.21, 0.24, 0.12, 0.5, 0.0],
    [0.28, 0.16, 0.14, 0.2, 0.0],
  ];
  for (const [ox, oy, len, tilt] of seg) {
    d.kit.add('glass', CYL, {
      at: at(d, x + Math.cos(yaw) * ox, TOP + oy, z - Math.sin(yaw) * ox),
      rot: [yaw, 0, Math.PI / 2 - tilt],
      scale: [0.028, len, 0.028],
    });
  }
  // the receiver it drips into
  d.kit.add('glass', SPH, { at: at(d, x + Math.cos(yaw) * 0.36, TOP + 0.055, z - Math.sin(yaw) * 0.36), scale: [0.12, 0.11, 0.12] });
  // and the iron ring stand holding the whole thing up
  d.kit.add('iron', CYL, { at: at(d, x - Math.cos(yaw) * 0.19, TOP + 0.16, z + Math.sin(yaw) * 0.19), scale: [0.016, 0.32, 0.016] });
  d.kit.add('iron', CYL, { at: at(d, x - Math.cos(yaw) * 0.19, TOP + 0.008, z + Math.sin(yaw) * 0.19), scale: [0.11, 0.016, 0.11] });
  d.kit.add('iron', TOR, { at: at(d, x, TOP + 0.06, z), rot: [0, Math.PI / 2, 0], scale: [0.36, 0.36, 0.36] });
}

/** a retort — the flask with a long down-turned neck, lying in its cradle */
function retort(d: Desk, x: number, z: number, yaw: number): void {
  d.kit.add('glass', SPH, { at: at(d, x, TOP + 0.115, z), scale: [0.19, 0.19, 0.19] });
  for (let i = 0; i < 3; i++) {
    const t = 0.1 + i * 0.1;
    d.kit.add('glass', CYL, {
      at: at(d, x + Math.cos(yaw) * (0.11 + i * 0.09), TOP + 0.15 - i * 0.028, z - Math.sin(yaw) * (0.11 + i * 0.09)),
      rot: [yaw, 0, Math.PI / 2 - t],
      scale: [0.032 - i * 0.005, 0.11, 0.032 - i * 0.005],
    });
  }
  d.kit.add('iron', TOR, { at: at(d, x, TOP + 0.06, z), rot: [0, Math.PI / 2, 0], scale: [0.32, 0.32, 0.32] });
}

function mortar(d: Desk, x: number, z: number): void {
  d.kit.add('stone', CYL, { at: at(d, x, TOP + 0.055, z), scale: [0.15, 0.11, 0.15] });
  d.kit.add('stone', CYL, { at: at(d, x, TOP + 0.016, z), scale: [0.19, 0.032, 0.19] });
  // the pestle laid across the rim rather than standing in it
  d.kit.add('stone', CYL, {
    at: at(d, x + 0.11, TOP + 0.125, z + 0.05),
    rot: [0.9, 0.32, Math.PI / 2],
    scale: [0.028, 0.19, 0.028],
  });
}

/** specimens: sulfur, salt and ore, tipped out of their papers */
function minerals(d: Desk, x: number, z: number): void {
  const spread: [number, number, Bucket, number][] = [
    [0, 0, 'wax', 0.055],
    [0.07, 0.04, 'wax', 0.036],
    [-0.06, 0.05, 'paper', 0.042],
    [0.03, -0.06, 'stone', 0.048],
    [-0.08, -0.03, 'iron', 0.038],
  ];
  for (const [ox, oz, b, r] of spread) {
    d.kit.add(b, b === 'paper' ? SHARD : ROCK, {
      at: at(d, x + ox, TOP + r * 0.5, z + oz),
      rot: [d.rng() * 3, d.rng() * 3, d.rng() * 3],
      scale: [r * 2, r * 1.4, r * 2],
    });
  }
  // the paper they were tipped from, still folded
  sheet(d, x + 0.13, z - 0.07, 0.13, 0.1, 0.5);
}

function tongs(d: Desk, x: number, z: number, yaw: number): void {
  for (const s of [-1, 1]) {
    d.kit.add('iron', BOX, {
      at: at(d, x, TOP + 0.007, z),
      rot: [yaw + s * 0.13, 0, 0],
      scale: [0.26, 0.008, 0.014],
    });
  }
  d.kit.add('iron', CYL, { at: at(d, x - Math.cos(yaw) * 0.13, TOP + 0.008, z + Math.sin(yaw) * 0.13), scale: [0.02, 0.012, 0.02] });
}

/* ——— the diviner's things ——— */

function crystalSphere(d: Desk, x: number, z: number, r: number): void {
  d.kit.add('brass', TOR, { at: at(d, x, TOP + 0.016, z), rot: [Math.PI / 2, 0, 0], scale: [r * 1.5, r * 1.5, r * 1.5] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    d.kit.add('brass', CYL, {
      at: at(d, x + Math.cos(a) * r * 0.66, TOP + 0.028, z + Math.sin(a) * r * 0.66),
      rot: [a, 0, 0.3],
      scale: [0.012, 0.06, 0.012],
    });
  }
  d.kit.add('glass', SPH, { at: at(d, x, TOP + 0.05 + r, z), scale: [r * 2, r * 2, r * 2] });
}

function bell(d: Desk, x: number, z: number): void {
  d.kit.add('brass', CONE, { at: at(d, x, TOP + 0.045, z), rot: [0, 0, 0], scale: [0.1, 0.09, 0.1] });
  d.kit.add('wood', CYL, { at: at(d, x, TOP + 0.105, z), scale: [0.016, 0.05, 0.016] });
  d.kit.add('wood', SPH, { at: at(d, x, TOP + 0.135, z), scale: [0.03, 0.03, 0.03] });
}

function pouch(d: Desk, x: number, z: number): void {
  d.kit.add('leather', SPH, { at: at(d, x, TOP + 0.045, z), scale: [0.13, 0.1, 0.11] });
  d.kit.add('leather', CYL, { at: at(d, x, TOP + 0.095, z), rot: [0, 0, 0.2], scale: [0.045, 0.045, 0.045] });
  d.kit.add('iron', TOR, { at: at(d, x, TOP + 0.088, z), rot: [Math.PI / 2, 0, 0], scale: [0.09, 0.09, 0.09] });
}

function coins(d: Desk, x: number, z: number, n: number): void {
  for (let i = 0; i < n; i++) {
    d.kit.add('brass', CYL, {
      at: at(d, x + (d.rng() - 0.5) * 0.09, TOP + 0.002 + i * 0.004, z + (d.rng() - 0.5) * 0.09),
      rot: [d.rng() * 3, 0, 0],
      scale: [0.034, 0.004, 0.034],
    });
  }
}

/** a deck part-shuffled and left in two heaps, which is how a deck is left */
function deck(d: Desk, x: number, z: number, yaw: number): void {
  for (const [ox, oz, n, ry] of [
    [0, 0, 9, 0],
    [0.1, 0.05, 6, 0.28],
  ] as [number, number, number, number][]) {
    for (let i = 0; i < n; i++) {
      d.kit.add(i === n - 1 ? 'leather' : 'paper', BOX, {
        at: at(d, x + ox + (d.rng() - 0.5) * 0.008, TOP + 0.003 + i * 0.0035, z + oz + (d.rng() - 0.5) * 0.008),
        rot: [yaw + ry + (d.rng() - 0.5) * 0.06, 0, 0],
        scale: [0.09, 0.0035, 0.15],
      });
    }
  }
}

function feather(d: Desk, x: number, z: number, yaw: number): void {
  d.kit.add('paper', CYL, { at: at(d, x, TOP + 0.005, z), rot: [yaw, 0, Math.PI / 2], scale: [0.005, 0.19, 0.005] });
  for (const s of [-1, 1]) {
    d.kit.add('paper', BOX, {
      at: at(d, x - Math.cos(yaw) * 0.05, TOP + 0.006, z + Math.sin(yaw) * 0.05),
      rot: [yaw, 0, s * 0.4],
      scale: [0.1, 0.0025, 0.03],
    });
  }
}

/* ————————————————————— the four stations ————————————————————— */

/**
 * Where the interactive prop already is, in table-local metres. Nothing may
 * be placed inside these; they are measured off the props, not guessed.
 */
export const KEEP_CLEAR: Record<string, { x0: number; x1: number; z0: number; z1: number }> = {
  // the slate slab and its seven phials (AlchemyTable: 2.10 × 0.50 at z + 0.08)
  alchemy: { x0: -1.06, x1: 1.06, z0: -0.19, z1: 0.35 },
  // the three-card spread (TarotTable: SLOT_X ±0.44, cards 0.34 × 0.56)
  tarot: { x0: -0.64, x1: 0.64, z0: -0.31, z1: 0.31 },
  // the standing Tree tablet (KabbalahTree: 0.78 wide at z − 0.12)
  kabbalah: { x0: -0.44, x1: 0.44, z0: -0.32, z1: 0.1 },
  // the whole top of the round table is the zodiac disc
  astrology: { x0: -0.9, x1: 0.9, z0: -0.9, z1: 0.9 },
};

function dressAlchemy(d: Desk): void {
  // BACK STRIP (z −0.57 … −0.20): the apparatus, set behind the phial row so
  // the seated camera looks over the phials INTO a working bench
  alembic(d, -0.72, -0.40, -0.5);
  retort(d, 0.05, -0.42, 2.5);
  flask(d, 0.42, -0.36, 0.075, 0.06);
  flask(d, 0.56, -0.44, 0.055, 0.05);
  mortar(d, -1.02, -0.36);
  d.kit.add('iron', CYL, { at: at(d, -0.32, TOP + 0.014, -0.5), scale: [0.16, 0.028, 0.16] }); // a burner plate
  candleStub(d, 0.86, -0.5, 0.09);
  // the tray the specimens get carried in and out on, shoved to one end
  tray(d, 1.02, -0.4, 0.36, 0.26, -0.22);

  // FRONT EDGE (z +0.37 … +0.57): the notebook the work is being recorded in,
  // left open, with the pen down beside it — and NOT in front of the chair
  bookOpen(d, -0.86, 0.44, 0.16, 0.28, 0.32);
  inkwell(d, -0.44, 0.46);
  quill(d, -0.34, 0.42, 2.3, 0.5);
  sheet(d, 0.72, 0.45, 0.2, 0.15, -0.35);
  minerals(d, 1.0, 0.42);
  waxPuddle(d, 0.4, 0.5, 0.05);
  tongs(d, -1.06, 0.46, 0.4);

  // THE FLOOR: a crate of folios and the stool the assistant uses
  crate(d, -1.35, -0.5, 0.35);
  stool(d, 1.3, 0.55, 0.6);
  bookStack(d, 1.42, 0, -0.75, 3, 0.5);
}

function dressAstrology(d: Desk): void {
  // The round table is ALL zodiac disc, so the working desk is a second table
  // pulled up beside it — which is also what an observatory actually looks
  // like: the instrument on one surface, the calculation on another.
  const deskTop = sideTable(d, -1.32, -0.62, 0.42, 0.78, 0.56);
  // the side table's own working plane, with its origin under it
  const sub: Desk = { ...d, x: d.x - 1.32, z: d.z - 0.62 };
  withTop(deskTop, () => {
    bookOpen(sub, -0.14, 0.06, 0.5, 0.3, 0.34); // the ephemeris, open at a date
    sheet(sub, 0.2, -0.12, 0.24, 0.18, -0.3); // a sheet of workings
    inkwell(sub, 0.28, 0.14);
    quill(sub, 0.2, 0.12, 2.6, 0.42);
    dividers(sub, -0.02, -0.18, 1.1);
    candleStub(sub, -0.3, -0.18, 0.12);
    spectacles(sub, 0.06, 0.2, 0.3);
    // the instruments themselves: the astrolabe standing on edge against the
    // book stack, the quadrant laid flat where it was last read off
    astrolabe(sub, -0.3, 0.14, 0.5, 0.11, 0.16);
    quadrant(sub, 0.02, -0.02, -0.42);
  });

  // on the wheel table's own rim, where the disc leaves 0.18 m: only flat
  // things, and only where a reader's forearms are not
  sheet(d, -0.05, -0.93, 0.22, 0.13, 0.12);
  d.kit.add('brass', CYL, { at: at(d, 0.88, TOP + 0.004, -0.35), scale: [0.07, 0.008, 0.07] });

  // leaning against the pedestal, a rolled star chart and a quadrant
  d.kit.add('paper', CYL, { at: at(d, 0.72, 0.42, 0.62), rot: [0.7, 0, 0.42], scale: [0.07, 0.86, 0.07] });
  d.kit.add('paper', CYL, { at: at(d, 0.8, 0.38, 0.68), rot: [0.9, 0, 0.5], scale: [0.055, 0.78, 0.055] });
  globe(d, 1.28, 0, 0.42, 0.19);
  stool(d, 0.1, 1.42, 0.3);
  crate(d, -1.24, 0.62, -0.5);
}

function dressTarot(d: Desk): void {
  // The cloth the cards are dealt on, laid a few degrees off square, with a
  // gilt rule round it. The cloth alone read as a slightly darker rectangle —
  // it is the BORDER that says "embroidered" rather than "a dark patch".
  const CW = 1.6;
  const CD = 0.86;
  d.kit.add('cloth', BOX, { at: at(d, 0, TOP + 0.003, 0.02), rot: [0.04, 0, 0], scale: [CW, 0.006, CD] });
  for (const [ox, oz, w, dp] of [
    [0, CD / 2 - 0.05, CW - 0.1, 0.012],
    [0, -(CD / 2 - 0.05), CW - 0.1, 0.012],
    [CW / 2 - 0.05, 0, 0.012, CD - 0.1],
    [-(CW / 2 - 0.05), 0, 0.012, CD - 0.1],
  ]) {
    d.kit.add('brass', BOX, {
      at: at(d, Math.cos(0.04) * ox + Math.sin(0.04) * oz, TOP + 0.0075, 0.02 - Math.sin(0.04) * ox + Math.cos(0.04) * oz),
      rot: [0.04, 0, 0],
      scale: [w, 0.003, dp],
    });
  }
  // and the corner tassels, which is where a cloth this old always frays first
  for (const s of [-1, 1]) {
    d.kit.add('brass', CONE, {
      at: at(d, s * (CW / 2 - 0.02), TOP + 0.02, -(CD / 2 - 0.02)),
      rot: [0, 0, Math.PI],
      scale: [0.035, 0.05, 0.035],
    });
  }

  crystalSphere(d, -0.92, -0.3, 0.075);
  deck(d, 0.88, -0.02, 0.24);
  bell(d, 0.94, -0.36);
  candleStub(d, -1.02, -0.44, 0.13);
  candleStub(d, 1.06, 0.44, 0.06);
  waxPuddle(d, 1.02, 0.36, 0.045);
  pouch(d, -0.78, 0.44);
  coins(d, -0.5, 0.47, 4);
  feather(d, 0.44, 0.47, -0.6);
  bookOpen(d, 0.74, 0.42, -0.2, 0.26, 0.3); // the journal the readings go in
  inkwell(d, 0.34, -0.44);
  quill(d, 0.26, -0.4, 2.1, 0.34);
  letter(d, -0.32, -0.46, 0.7);
  // a charcoal stub and its smudge, for the sketches
  d.kit.add('iron', CYL, { at: at(d, 0.56, TOP + 0.008, 0.34), rot: [0.9, 0, Math.PI / 2], scale: [0.014, 0.07, 0.014] });

  stool(d, -1.28, 0.62, 0.9);
  bookStack(d, -1.4, 0, -0.55, 2, -0.3);
}

function dressKabbalah(d: Desk): void {
  // the geometer's side: a straightedge, dividers and the construction itself
  sheet(d, -0.78, 0.2, 0.44, 0.36, 0.14);
  sheet(d, -0.72, 0.3, 0.3, 0.24, -0.25, 0.005);
  straightedge(d, -0.66, -0.1, 0.32, 0.46);
  dividers(d, -0.34, 0.34, 1.9, 0.22);
  inkwell(d, -1.0, -0.24);
  quill(d, -0.92, -0.2, 2.4, 0.4);
  spectacles(d, -0.5, -0.38, 0.5);

  // the scholar's side: the manuscript, its rolls and the thread markers
  bookOpen(d, 0.72, 0.16, -0.18, 0.32, 0.4);
  scroll(d, 0.98, -0.4, 0.42, 0.05, 0.5);
  scroll(d, 0.7, -0.46, 0.34, 0.04, 0.2, false);
  letter(d, 0.36, 0.44, -0.5);
  paperweight(d, 1.06, 0.3);
  // small carved cubes — the geometer works from solids as well as from lines
  for (let i = 0; i < 3; i++) {
    d.kit.add('wood', BOX, {
      at: at(d, 0.5 - i * 0.09, TOP + 0.025, -0.5 + (d.rng() - 0.5) * 0.06),
      rot: [d.rng() * 1.5, 0, 0],
      scale: [0.05, 0.05, 0.05],
    });
  }
  candlestick(d, -1.08, 0.42, 0.26, true);
  candleStub(d, 1.02, -0.5, 0.11);
  waxPuddle(d, -1.04, 0.34, 0.055);

  stool(d, 1.32, 0.5, -0.5);
  crate(d, -1.34, -0.44, 0.2);
}

/* ————————————————————— assembly ————————————————————— */

/**
 * Which table is which, in `TABLE_SPECS` order — and that order is load
 * bearing. The specs are, in sequence: the round zodiac table, the tarot
 * table, the alchemist's bench and the kabbalist's table, at ±4.5, ±10.6.
 * Re-order the specs and every station gets somebody else's tools.
 */
const DRESSERS: ((d: Desk) => void)[] = [dressAstrology, dressTarot, dressAlchemy, dressKabbalah];

interface Assembled {
  geoms: Partial<Record<Bucket, THREE.BufferGeometry>>;
  flames: Flame[];
  pools: THREE.BufferGeometry;
}

function assemble(): Assembled {
  const kit = new Kit();
  const flames: Flame[] = [];
  const poolParts: THREE.BufferGeometry[] = [];

  TABLE_SPECS.forEach((t, i) => {
    const d: Desk = { x: t.x, z: t.z, rng: mulberry32(9001 + i * 37), kit, flames };
    DRESSERS[i](d);

    // the pool of candlelight the table sits in. An additive sheet lying 6 mm
    // over the boards, wider than the table, so the light looks like it comes
    // OFF the table rather than out of a bulb hanging under it.
    const p = new THREE.PlaneGeometry(t.round ? 3.4 : 4.0, 3.2);
    p.rotateX(-Math.PI / 2);
    p.translate(t.x, 0.02, t.z);
    poolParts.push(p);
  });

  const pools = mergeGeometries(poolParts, false)!;
  poolParts.forEach((p) => p.dispose());
  return { geoms: kit.build(), flames, pools };
}

export function StudyProps({ still }: { still: boolean }) {
  const built = useMemo(assemble, []);
  useLayoutEffect(
    () => () => {
      Object.values(built.geoms).forEach((g) => g?.dispose());
      built.pools.dispose();
    },
    [built],
  );

  /* Registry surfaces throughout — nothing here builds its own
   * MeshStandardMaterial. The tints are per-bucket overrides so a walnut tray
   * and a walnut stool share one material and therefore one draw call. */
  const mats = useMemo(
    () => ({
      wood: getMaterial('wood_walnut_ancient', { repeat: [4, 4], overrides: { color: '#5a4028' } }),
      paper: getMaterial('book_parchment', { repeat: [3, 3], overrides: { color: '#bfae87' } }),
      leather: getMaterial('book_leather_aged', { repeat: [3, 3], overrides: { color: '#6b3f30' } }),
      brass: getMaterial('metal_brass_burnished', { repeat: [3, 3], overrides: { color: '#8c6d31', roughness: 0.44 } }),
      iron: getMaterial('metal_iron_forged', { repeat: [3, 3], overrides: { color: '#22201e' } }),
      wax: getMaterial('book_vellum', { repeat: [2, 2], overrides: { color: '#c3b48c', roughness: 0.6 } }),
      stone: getMaterial('stone_granite_dark', { repeat: [3, 3], overrides: { color: '#5a564d' } }),
      cloth: getMaterial('fabric_wool_hanging', { repeat: [2, 1], overrides: { color: '#3a2438' } }),
      // Plain alpha, never transmission — see the note on `flask`.
      glass: getMaterial('glass_crown_old', {
        repeat: [1, 1],
        overrides: {
          transmission: 0,
          transparent: true,
          opacity: 0.34,
          depthWrite: false,
          color: '#cfe0dc',
          roughness: 0.12,
          metalness: 0,
        },
      }),
    }),
    [],
  );

  /* ——— the flames ——— */

  /**
   * Every candle stub in all four stations as ONE `Points` object.
   *
   * Sprites were the obvious reach and are the wrong one: 288 of them once
   * cost this scene more than their draw-call count suggested, because each
   * goes into the transparent queue and gets depth-sorted and overdrawn.
   * `Points` are camera-facing and size-attenuated already, which is the only
   * reason a sprite was wanted.
   *
   * The flicker is per-flame and independent, driven through the COLOR
   * attribute — `PointsMaterial` has no per-point size, but a flame that
   * varies in brightness rather than in width is what a candle does anyway.
   */
  const flameGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = built.flames.length;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    built.flames.forEach((f, i) => {
      pos[i * 3] = f.at[0];
      pos[i * 3 + 1] = f.at[1];
      pos[i * 3 + 2] = f.at[2];
      col[i * 3] = 1;
      col[i * 3 + 1] = 0.72;
      col[i * 3 + 2] = 0.38;
    });
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, [built.flames]);

  const flameMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: getGlowTexture(),
        size: 0.26,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        opacity: 0.9,
        toneMapped: true,
      }),
    [],
  );

  const poolMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getGlowTexture(),
        color: '#ffb066',
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useLayoutEffect(
    () => () => {
      flameGeom.dispose();
      flameMat.dispose();
      poolMat.dispose();
    },
    [flameGeom, flameMat, poolMat],
  );

  /** the two flames that carry a real light, and the phase they burn on */
  const heroes = useMemo(() => built.flames.map((f, i) => ({ f, i })).filter((h) => h.f.hero), [built.flames]);
  const lights = useRef<(THREE.PointLight | null)[]>([]);

  useFrame((state) => {
    if (still) return;
    const t = state.clock.elapsedTime;
    const col = flameGeom.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < built.flames.length; i++) {
      // three incommensurate rates per flame, seeded off its index: no two
      // candles in the room ever gutter together, which is the whole tell
      const k =
        0.78 +
        0.16 * Math.sin(t * (7.3 + i * 0.61) + i * 2.1) +
        0.1 * Math.sin(t * (17.7 + i * 1.13) + i);
      col.setXYZ(i, k, k * 0.72, k * 0.36);
    }
    col.needsUpdate = true;
    lights.current.forEach((l, i) => {
      if (l) l.intensity = 6.4 + Math.sin(t * (8.1 + i * 1.7) + i * 3) * 1.3 + Math.sin(t * 21 + i) * 0.7;
    });
  });

  return (
    <group name="study-props">
      {BUCKETS.map((b) =>
        built.geoms[b] ? <mesh key={b} geometry={built.geoms[b]} material={mats[b]} /> : null,
      )}
      <mesh geometry={built.pools} material={poolMat} />
      <points geometry={flameGeom} material={flameMat} />
      {/* The one real flame in the four stations — the kabbalist's candlestick,
          which is the tallest and so throws the furthest. Every additional
          point light is about 1.5 fps in a forward renderer whatever its
          `distance`, so the other candles are the additive pool plus their own
          `Points` flame, which from standing height is indistinguishable. */}
      {heroes.map((h, i) => (
        <pointLight
          key={h.i}
          ref={(el) => {
            lights.current[i] = el;
          }}
          position={h.f.at}
          color="#ffb45e"
          intensity={6.4}
          distance={7}
          decay={2}
        />
      ))}
    </group>
  );
}
