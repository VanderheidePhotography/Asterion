import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { registerPickable, tableReach, unregisterPickable } from './ManualPicker';
import {
  AXIAL_TILT_DEG,
  PLANETS,
  SATURN_RING,
  SATURN_TILT,
  eccentricAnomaly,
  meanAnomalyAtEpoch,
  orbitalPosition,
  type Planet,
} from '../../../data/solarSystem';
import {
  planetLabel,
  planetMap,
  saturnRingGeometry,
  saturnRingMap,
  sunMap,
} from './planetTexture';
import { getMaterial } from '../../../materials';
import { forgedMetal } from './textures';
import { getGlowTexture } from './glowTexture';
import { ZODIAC } from '../../../data/astrology';
import { PlateConsole, type OrreryMode } from './PlateConsole';
import { keepOnlyPlates } from './plateArt';
import { CircleOfArt } from './CircleOfArt';
import { SolomonSeals } from './SolomonSeals';

/**
 * The instrument shows SEVEN plates now, and the list of them — with their
 * names, their emblems and the console that selects them — lives in
 * PlateConsole. It is re-exported here because the rest of the museum has
 * always asked the orrery what charts it can show, and there is no reason to
 * make every caller learn a new address.
 */
export type { OrreryMode };

/**
 * The great orrery: the Sun at the dead centre of the rotunda, and all eight
 * planets — the Earth among them, in her own true place — wheeling around him.
 *
 * It is a working instrument, not a diagram of one. The chart is an oak-rimmed
 * round table painted like the night, and every body stands ABOVE it on a
 * slender brass pin — the pins lengthening as the orbits widen, so the whole
 * system rises into a shallow dome from Mercury at the hub to Neptune at the
 * rim. That lift is what makes it read as an orrery from across the rotunda:
 * flat on the plate, the outer planets simply buried themselves in the paint,
 * and Jupiter and Saturn fought each other for the same few centimetres.
 * ORRERY_REACH fences the rim so a visitor walks up and leans over the chart
 * rather than wading through it.
 *
 * The pins force one honest compromise: the display PROJECTS the system onto
 * the table plane, zeroing each body's ecliptic height, so every planet stands
 * directly over its own painted road. Orbital inclinations tip the true
 * positions by up to ±0.12 here — more than a small planet's whole radius, so
 * without the projection a body would wander off its road and hang over its
 * neighbour's. Every paper chart makes the same choice; the inclinations
 * survive in the data, just not in the display. The obliquities, by contrast,
 * ARE drawn: each body turns on its own tilted axis, which is why Saturn's
 * rings lean and Uranus lies on his side.
 *
 * And it is an instrument, so it is labelled and it answers. Every body carries
 * its planetary seal and name in gold — the Sun included, since he is chief of
 * the classical seven and has as much to say to this library as Saturn does.
 * Hovering swells the body, ignites its whole orbital road, and lifts the
 * label; a click hands the body's name to onPickBody so the room can open its
 * esoteric reading, and the reading's subject keeps a gilt ring painted around
 * its foot on the chart until it is dismissed.
 *
 * Each planet runs a real Kepler orbit — its own eccentricity, inclination,
 * ascending node and period, starting from where it stood at J2000 — so each
 * visibly quickens at perihelion and rides off-centre around the Sun, who sits
 * at the shared focus of all eight ellipses exactly as he should.
 *
 * The ellipses read shallower than the real ones. That is deliberate: the
 * room's radial compression is applied to each planet's instantaneous distance
 * rather than to its axis, which flattens eccentricity but guarantees the
 * orbits nest without crossing. See the note on orbitalPosition.
 *
 * An earlier build of this table was GEOCENTRIC — the Earth held the middle as
 * an antique library globe and was skipped from the orbits, a nod to the
 * Ptolemaic cosmos the library's traditions were written inside. It was a
 * pretty idea that failed in practice: a varnished parchment globe on a brass
 * meridian is a different KIND of object from seven photographed planets, so
 * the centrepiece read as two props that had wandered into each other. The
 * Sun holds the middle now and the Earth takes her true place between Venus
 * and Mars, drawn in the same register as her neighbours. The lost Ptolemaic
 * note is made up for in the readings — Earth's entry, and the bound of the
 * ancient world still ruled across the chart at Saturn's edge.
 *
 * See data/solarSystem.ts for what else is compressed.
 */

/* ————— fitting the system into the room —————
 * Orbital radii follow a power law r = K·aᴾ, fitted so Mercury lands at
 * ORBIT_MIN and Neptune at ORBIT_MAX. A power law is the right compression
 * here: it is monotonic, so the ORDER of the planets is exact, and it leaves
 * the inner planets legible instead of collapsed onto the centre. */

/** all eight planets orbit; only the Sun stands still, at the centre */
const ORBITERS: readonly Planet[] = PLANETS;
/** the name the Sun answers to when he is picked */
const SUN = 'Sun';

/** the five wanderers the ancients could see, which with the Sun and Moon made
 *  the classical seven. Uranus and Neptune are telescope-finds, and the chart
 *  says so: their roads are drawn in cold broken silver, not gold. */
const CLASSICAL = new Set(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']);

/**
 * The chart's surface height.
 *
 * Raised from 0.95, which was a dining table and read as one — a plate this
 * size sitting that near the floor looks like something being stored rather
 * than something being consulted. 1.15 is drafting-table height: high enough to
 * lean both hands on, and the working instruments of this period (plane
 * tables, great mural quadrants, the Uraniborg charts) all stand about there.
 *
 * The ceiling is the camera, which rides at 2.2. Everything on the chart is
 * read by looking DOWN onto it, so the surface has to stay far enough below the
 * eye that the planets' tiers still separate; at 1.15 the outermost pins top
 * out around 1.75 and the depth still reads. Much above 1.3 and the chart goes
 * edge-on and the whole dome flattens out.
 */
export const TABLE_Y = 1.15;

/** the Sun's scene radius. He is emphatically NOT to scale — at the orbits'
 *  compression a true-size Sun would be a speck — but he has to out-mass every
 *  planet by eye or the chart loses its centre. */
const SUN_R = 0.4;
/** how high the Sun's centre rides above the chart: mid-way up the planets'
 *  tiers, so he lights them roughly edge-on and every terminator reads */
const SUN_Y = 0.44;
/** air to leave between the Sun and the closest a planet ever comes */
const INNER_CLEARANCE = 0.28;

/** The innermost orbit has to clear the Sun, and Mercury is a sharper
 *  constraint than it first looks: its eccentricity is 0.206, so its
 *  perihelion falls at only 0.794 of its semi-major axis. Deriving the limit
 *  from SUN_R rather than hardcoding it means the orbits follow the Sun if he
 *  is ever resized. */
const ORBIT_MIN = (SUN_R + INNER_CLEARANCE) / (1 - ORBITERS[0].e);
/** The outer limit makes the table: Neptune's widest sweep plus his body
 *  reaches 3.3, a round table six and a half metres across. */
const ORBIT_MAX = 3.2;
/** planet radii are compressed the same way, between these scene radii. The
 *  ceiling is set by the Jupiter/Saturn pinch: the power law bunches those two
 *  orbits to 0.295 apart at closest approach, and Saturn's rings alone span
 *  2.27 of his radii, so a Saturn much over 0.09 puts ring into Jupiter. */
const SIZE_MIN = 0.045;
const SIZE_MAX = 0.09;

/** how high the pins stand: Mercury's at the hub, Neptune's at the rim. The
 *  ramp is what turns a flat plate into a dome you can read side-on. */
const LIFT_MIN = 0.1;
const LIFT_MAX = 0.54;

/** one Earth year, in seconds of wall-clock. Every other period follows from
 *  the real ratios, so Neptune takes 165 of these — effectively still, which
 *  is exactly how an orrery behaves and how the solar system actually is. */
const EARTH_YEAR_SECONDS = 90;
const DAYS_PER_YEAR = 365.256;

const RAD = Math.PI / 180;

const fit = (v: number, vMin: number, vMax: number, outMin: number, outMax: number) => {
  const p = Math.log(outMax / outMin) / Math.log(vMax / vMin);
  return outMin * Math.pow(v / vMin, p);
};

const A_MIN = ORBITERS[0].a;
const A_MAX = ORBITERS[ORBITERS.length - 1].a;
const KM_MIN = Math.min(...ORBITERS.map((p) => p.radius));
const KM_MAX = Math.max(...ORBITERS.map((p) => p.radius));

/** the room's compression, applied to a true distance in AU. Passed whole to
 *  orbitalPosition so it squeezes the instantaneous radius rather than just
 *  the axis — see the note there on why that keeps the orbits from crossing. */
const compress = (auRadius: number) => fit(auRadius, A_MIN, A_MAX, ORBIT_MIN, ORBIT_MAX);

/**
 * How much bare chart to leave outside Neptune's widest sweep.
 *
 * This was 0.2 and that was a bug, not a taste call: at 0.2 the tabletop came
 * out at 3.50, which put the zodiac band's inner rule at 3.15 — INSIDE
 * Neptune's road at 3.21. The outermost planet was driving straight through
 * the instrument's degree scale. The margin has to leave room for the whole
 * band (0.085 of the radius) plus air on both sides of it.
 */
const RIM_MARGIN = 0.62;
/** the tabletop's radius: Neptune's widest sweep plus his body plus the rim */
export const TABLE_R =
  compress(A_MAX * (1 + ORBITERS[ORBITERS.length - 1].e)) + SIZE_MAX + RIM_MARGIN;
/** the walk-up collision ring: the table's physical edge plus a hand */
export const ORRERY_REACH = TABLE_R + 0.12;
/** how thick the tabletop is */
const TABLE_T = 0.1;
/** orbit lines ride a hair above the top so they never z-fight the paint */
const LINE_LIFT = 0.012;
/** scene semi-major axis for a planet, for spacing checks and comments */
const orbitRadius = (p: Planet) => compress(p.a);
/** scene body radius for a planet */
const bodyRadius = (p: Planet) => fit(p.radius, KM_MIN, KM_MAX, SIZE_MIN, SIZE_MAX);
/**
 * How high this planet rides above the chart — one even tier per planet, by
 * ORBITAL ORDER rather than by distance.
 *
 * Keying the tiers to radius was the obvious choice and it fails on the inner
 * system: the power law leaves Venus and the Earth only 0.106 apart, which is
 * less than the sum of their two body radii, and a radius-keyed ramp puts them
 * within 0.025 of the same height as well — so they collide whenever their
 * longitudes agree. Eight even tiers give every neighbouring pair a 0.063
 * vertical gap, which clears that overlap and reads better besides: a stepped
 * instrument rather than a slumped one.
 */
const bodyLift = (p: Planet) =>
  LIFT_MIN +
  (LIFT_MAX - LIFT_MIN) * (ORBITERS.indexOf(p) / (ORBITERS.length - 1));
/** how long this planet's year lasts, in seconds */
const yearSeconds = (p: Planet) => (p.period / DAYS_PER_YEAR) * EARTH_YEAR_SECONDS;
/** how fast the body turns on its own axis. Not to scale with the real day —
 *  it is a legibility device, so a viewer can see that these are spheres with
 *  surfaces rather than painted discs; the giants simply spin visibly faster,
 *  which is at least true of them. */
const spinRate = (p: Planet) => (p.radius > 20000 ? 0.42 : 0.14);

/** the closed ellipse a planet actually travels, sampled for a path line and
 *  projected flat onto the tabletop (see the projection note up top) */
function orbitCurve(p: Planet, segments = 160): Float32Array {
  const pts = new Float32Array((segments + 1) * 3);
  for (let k = 0; k <= segments; k++) {
    // stepping the ECCENTRIC anomaly traces the true ellipse, and clusters
    // samples toward perihelion where the curvature is tightest
    const [x, , z] = orbitalPosition(p, (k / segments) * Math.PI * 2, compress);
    pts[k * 3] = x;
    pts[k * 3 + 1] = LINE_LIFT;
    pts[k * 3 + 2] = z;
  }
  return pts;
}

/**
 * A flat ribbon laid along an orbit path — the road that lights up when its
 * planet is pointed at. A LineBasicMaterial cannot be widened (lineWidth is
 * ignored on every desktop GL backend), and a one-pixel thread does not read
 * as "ignited" over the baked gold road beneath it, so the highlight is real
 * geometry: a triangle strip offset either side of the curve in the table
 * plane, drawn additively.
 */
function ribbonGeometry(path: Float32Array, width: number): THREE.BufferGeometry {
  const n = path.length / 3 - 1; // the last sample repeats the first
  const verts = new Float32Array(n * 2 * 3 + 6);
  const half = width / 2;
  for (let k = 0; k <= n; k++) {
    const i = (k % n) * 3;
    const j = ((k + 1) % n) * 3;
    // tangent in the table plane, then its perpendicular
    const tx = path[j] - path[i];
    const tz = path[j + 2] - path[i + 2];
    const len = Math.hypot(tx, tz) || 1;
    const nx = -tz / len;
    const nz = tx / len;
    verts[k * 6] = path[i] + nx * half;
    verts[k * 6 + 1] = LINE_LIFT;
    verts[k * 6 + 2] = path[i + 2] + nz * half;
    verts[k * 6 + 3] = path[i] - nx * half;
    verts[k * 6 + 4] = LINE_LIFT;
    verts[k * 6 + 5] = path[i + 2] - nz * half;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  const idx: number[] = [];
  for (let k = 0; k < n; k++) {
    const a = k * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  g.setIndex(idx);
  return g;
}

/* ————— the tabletop's paint —————
 * The whole chart is engraved into one baked canvas: the night ground with
 * its nebular washes and fixed stars, a compass rose under the Earth, the
 * orbit paths themselves (gold roads for the classical five, cold broken
 * silver for the two the telescopes found), the bound of the ancient cosmos
 * ruled and lettered between Saturn and Uranus, and an instrument's outer
 * band — double brass rules, degree ticks, and the twelve zodiac glyphs,
 * echoing the wheel in the dome above. Baking the roads costs nothing per
 * frame, since they are static once projected, and antialiases perfectly. */
let chartTexCache: THREE.CanvasTexture | null = null;
function chartTex(): THREE.CanvasTexture {
  if (chartTexCache) return chartTexCache;
  const S = 2048;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const x = c.getContext('2d')!;

  /* scene → canvas: the cylinder's top cap maps u=(x/R+1)/2, v=(z/R+1)/2,
     and the canvas row order inverts v */
  const px = (wx: number) => ((wx / TABLE_R + 1) / 2) * S;
  const py = (wz: number) => (1 - (wz / TABLE_R + 1) / 2) * S;
  const C = S / 2;
  const scale = S / (2 * TABLE_R);

  // — the night ground, deepest at the rim, breathing at the heart —
  const g = x.createRadialGradient(C, C, 0, C, C, C);
  g.addColorStop(0, '#161d33');
  g.addColorStop(0.55, '#0c1122');
  g.addColorStop(0.88, '#070a15');
  g.addColorStop(1, '#04060c');
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);

  // — nebular washes, barely there, so the black is never flat —
  const washes: [number, number, number, string, number][] = [
    [C * 0.62, C * 0.78, C * 0.55, '#5a4a8a', 0.1],
    [C * 1.42, C * 1.18, C * 0.5, '#3a6a72', 0.08],
    [C * 1.1, C * 0.5, C * 0.42, '#7a4a5e', 0.07],
  ];
  for (const [wx, wy, wr, tone, alpha] of washes) {
    const w = x.createRadialGradient(wx, wy, 0, wx, wy, wr);
    w.addColorStop(0, tone);
    w.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalAlpha = alpha;
    x.fillStyle = w;
    x.fillRect(wx - wr, wy - wr, wr * 2, wr * 2);
  }
  x.globalAlpha = 1;

  let seed = 977;
  const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // — the Milky Way, a soft river of light laid across the chart on the
  //   diagonal. It is the one thing that stops the ground reading as evenly
  //   sprinkled wallpaper: a real night sky is lopsided. —
  x.save();
  x.translate(C, C);
  x.rotate(-0.6);
  for (let i = 0; i < 3; i++) {
    const w = [C * 0.5, C * 0.3, C * 0.16][i];
    const a = [0.05, 0.05, 0.06][i];
    const g2 = x.createLinearGradient(0, -w, 0, w);
    g2.addColorStop(0, 'rgba(150,170,220,0)');
    g2.addColorStop(0.5, `rgba(176,190,235,${a})`);
    g2.addColorStop(1, 'rgba(150,170,220,0)');
    x.fillStyle = g2;
    x.fillRect(-C * 1.5, -w, C * 3, w * 2);
  }
  // the dense star clouds inside it
  for (let i = 0; i < 1600; i++) {
    const sx = (rng() - 0.5) * S * 1.4;
    const sy = (rng() - 0.5 + (rng() - 0.5)) * C * 0.42;
    x.globalAlpha = 0.06 + rng() * 0.3;
    x.fillStyle = rng() < 0.3 ? '#c3d4ff' : '#f2ead6';
    x.fillRect(sx, sy, 1.1, 1.1);
  }
  x.globalAlpha = 1;
  x.restore();

  // — the fixed stars, over the whole ground —
  for (let i = 0; i < 1100; i++) {
    const sx = rng() * S;
    const sy = rng() * S;
    if (Math.hypot(sx - C, sy - C) > C * 0.985) continue;
    const r = 0.5 + rng() * 1.5;
    x.globalAlpha = 0.1 + rng() * 0.55;
    x.fillStyle = rng() < 0.22 ? '#cfe0ff' : '#f5efdd';
    x.beginPath();
    x.arc(sx, sy, r, 0, Math.PI * 2);
    x.fill();
  }
  // a handful of brighter stars, drawn with a fine cross-flare like an
  // engraver's star, so the field has a few points the eye can settle on
  for (let i = 0; i < 34; i++) {
    const a = rng() * Math.PI * 2;
    const rr = (0.2 + rng() * 0.72) * C;
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

  // — the instrument's radial graticule: hairlines every 15° from the rose out
  //   to the band, the way an astrolabe rules its plate. Faint enough to be
  //   texture rather than pattern, but it is what makes the empty ground read
  //   as a measured chart instead of a painted disc. —
  x.strokeStyle = '#8f7f52';
  for (let d = 0; d < 360; d += 15) {
    const a = (d / 180) * Math.PI;
    x.globalAlpha = d % 45 === 0 ? 0.17 : 0.09;
    x.lineWidth = d % 45 === 0 ? 1.6 : 1;
    x.beginPath();
    x.moveTo(C + Math.cos(a) * C * 0.19, C + Math.sin(a) * C * 0.19);
    x.lineTo(C + Math.cos(a) * C * 0.9, C + Math.sin(a) * C * 0.9);
    x.stroke();
  }
  x.globalAlpha = 1;

  // — the compass rose under the Earth, its points just showing past the globe —
  x.save();
  x.translate(C, C);
  x.strokeStyle = '#c9a648';
  x.fillStyle = '#c9a648';
  for (let arm = 0; arm < 8; arm++) {
    const long = arm % 2 === 0;
    const len = (long ? 1.05 : 0.72) * scale;
    const half = 0.055 * scale;
    x.save();
    x.rotate((arm / 8) * Math.PI * 2);
    x.globalAlpha = long ? 0.5 : 0.34;
    x.beginPath();
    x.moveTo(0, -len);
    x.lineTo(half, 0);
    x.lineTo(0, len * 0.0);
    x.lineTo(-half, 0);
    x.closePath();
    x.fill();
    x.restore();
  }
  x.globalAlpha = 0.55;
  x.lineWidth = 2;
  x.beginPath();
  x.arc(0, 0, 1.12 * scale, 0, Math.PI * 2);
  x.stroke();
  x.restore();
  x.globalAlpha = 1;

  // — the orbit roads. The classical five are gold highways: a wide soft glow
  //   under a fine bright rule. Uranus and Neptune, which no ancient system had
  //   a chair for, are ruled instead in thin broken silver. —
  for (const p of ORBITERS) {
    const pts = orbitCurve(p, 240);
    const trace = () => {
      x.beginPath();
      for (let k = 0; k * 3 < pts.length; k++) {
        const cx = px(pts[k * 3]);
        const cy = py(pts[k * 3 + 2]);
        if (k === 0) x.moveTo(cx, cy);
        else x.lineTo(cx, cy);
      }
      x.closePath();
    };
    if (CLASSICAL.has(p.name)) {
      x.setLineDash([]);
      const layers: [string, number, number][] = [
        ['#8a6f33', 0.24, 16],
        ['#c9a648', 0.52, 4],
        ['#ffe2a8', 0.78, 1.6],
      ];
      for (const [colour, alpha, wide] of layers) {
        x.strokeStyle = colour;
        x.globalAlpha = alpha;
        x.lineWidth = wide;
        trace();
        x.stroke();
      }
    } else {
      // short, fine dashes: at motorway proportions these two roads read as
      // painted lane markings rather than as a ruled astronomical chart
      x.setLineDash([7, 11]);
      x.strokeStyle = '#7f93ad';
      x.globalAlpha = 0.2;
      x.lineWidth = 5;
      trace();
      x.stroke();
      x.strokeStyle = '#cfe0f2';
      x.globalAlpha = 0.55;
      x.lineWidth = 1.4;
      trace();
      x.stroke();
      x.setLineDash([]);
    }
  }
  x.globalAlpha = 1;

  // — the minor planets. The gap between Mars and Jupiter is by a long way the
  //   widest bare ring on the chart, and leaving it bare was a waste twice
  //   over: it is also the one region with something to say. Ceres was found
  //   on the first night of the nineteenth century, and the belt filled in
  //   over exactly the decades this library's revival was getting under way. —
  const beltIn = compress(1.52371034 * 1.0933941) * scale * 1.05;
  const beltOut = compress(5.202887 * (1 - 0.04838624)) * scale * 0.95;
  const beltMid = (beltIn + beltOut) / 2;
  {
    // the dust, densest along the middle of the ring
    const g3 = x.createRadialGradient(C, C, beltIn, C, C, beltOut);
    g3.addColorStop(0, 'rgba(150,140,120,0)');
    g3.addColorStop(0.5, 'rgba(168,156,132,0.07)');
    g3.addColorStop(1, 'rgba(150,140,120,0)');
    x.fillStyle = g3;
    x.beginPath();
    x.arc(C, C, beltOut, 0, Math.PI * 2);
    x.arc(C, C, beltIn, 0, Math.PI * 2, true);
    x.fill();
    // and the bodies themselves, gaussian-ish about the middle
    for (let i = 0; i < 1500; i++) {
      const a = rng() * Math.PI * 2;
      const spread = (rng() + rng() + rng() - 1.5) / 1.5;
      const rr = beltMid + spread * ((beltOut - beltIn) / 2);
      const px2 = C + Math.cos(a) * rr;
      const py2 = C + Math.sin(a) * rr;
      const big = rng() < 0.04;
      x.globalAlpha = big ? 0.75 : 0.2 + rng() * 0.45;
      x.fillStyle = big ? '#e2d3ac' : '#b6a98c';
      x.beginPath();
      x.arc(px2, py2, big ? 2.1 : 0.7 + rng() * 0.9, 0, Math.PI * 2);
      x.fill();
    }
    x.globalAlpha = 1;
  }

  /** letter a string around an arc, each glyph turned to stand on the circle */
  const arcText = (
    text: string,
    radius: number,
    centreAngle: number,
    size: number,
    colour: string,
    alpha: number,
    flip = false,
  ) => {
    x.font = `${size}px "Cormorant Garamond", Georgia, serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = colour;
    x.globalAlpha = alpha;
    // letter-spacing has to be computed in radians, from each glyph's width
    const widths = [...text].map((ch) => x.measureText(ch).width + size * 0.24);
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
    x.globalAlpha = 1;
  };

  // — the bound of the ancient cosmos: Saturn's sphere was the edge of the
  //   world, and beyond it only the fixed stars. The rule falls in the gap
  //   between Saturn's aphelion and Uranus's perihelion, which is exactly the
  //   space between what the ancients could see and what they could not. —
  const saturn = ORBITERS.find((p) => p.name === 'Saturn')!;
  const uranus = ORBITERS.find((p) => p.name === 'Uranus')!;
  const boundR =
    ((compress(saturn.a * (1 + saturn.e)) + compress(uranus.a * (1 - uranus.e))) / 2) * scale;
  x.strokeStyle = '#c9a648';
  for (const [dr, alpha, wide] of [
    [-9, 0.42, 2],
    [9, 0.42, 2],
  ] as [number, number, number][]) {
    x.globalAlpha = alpha;
    x.lineWidth = wide;
    x.beginPath();
    x.arc(C, C, boundR + dr, 0, Math.PI * 2);
    x.stroke();
  }
  x.globalAlpha = 1;
  arcText('FINIS · THE BOUND OF THE ANCIENT WORLD', boundR, -Math.PI / 2, 34, '#e8cf8e', 0.72);
  arcText('BEYOND · WHAT THE TELESCOPE FOUND', boundR, Math.PI / 2, 30, '#b8cbdd', 0.5, true);
  arcText('THE MINOR PLANETS · CERES MDCCCI', beltMid, -Math.PI / 2, 26, '#d8c8a4', 0.5);

  // — the instrument's outer band: double rules, degree ticks, the twelve
  //   signs. The band lives between Neptune's road and the oak rim. —
  const bandOuter = 0.985 * C;
  const bandInner = 0.9 * C;
  x.strokeStyle = '#c9a648';
  x.globalAlpha = 0.75;
  x.lineWidth = 3;
  for (const r of [bandOuter, bandInner]) {
    x.beginPath();
    x.arc(C, C, r, 0, Math.PI * 2);
    x.stroke();
  }
  // degree ticks, heavier every 30°
  for (let d = 0; d < 360; d += 2.5) {
    const a = (d / 180) * Math.PI;
    const major = d % 30 === 0;
    const r0 = major ? bandInner : (bandInner + bandOuter) / 2 - (d % 10 === 0 ? 9 : 4);
    x.globalAlpha = major ? 0.8 : 0.4;
    x.lineWidth = major ? 3 : 1.4;
    x.beginPath();
    x.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0);
    x.lineTo(C + Math.cos(a) * bandOuter, C + Math.sin(a) * bandOuter);
    x.stroke();
  }
  // the twelve glyphs, feet toward the centre so they read from the rim
  const glyphR = (bandInner + bandOuter) / 2;
  // the same face the dome's wheel uses; the U+FE0E variation selector pins
  // the TEXT presentation, or macOS swaps in its colour-emoji zodiac tiles
  x.font = `${Math.round(S * 0.031)}px "Segoe UI Symbol", "Arial Unicode MS", serif`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  ZODIAC.forEach((z, i) => {
    const a = ((i + 0.5) / 12) * Math.PI * 2;
    x.save();
    x.translate(C + Math.cos(a) * glyphR, C + Math.sin(a) * glyphR);
    x.rotate(a + Math.PI / 2);
    x.fillStyle = '#e8cf8e';
    x.globalAlpha = 0.9;
    x.fillText(z.glyph + '︎', 0, 0);
    x.restore();
  });
  x.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  chartTexCache = tex;
  return tex;
}

/* ————— the rim's engraved brass —————
 * The band runs around the table's edge at exactly the height a visitor leans
 * on, which makes it the closest thing on the whole instrument to their eye —
 * so it is the cheapest place to buy grandeur. One segment is baked and
 * repeated RIM_REPEATS times around; baking the whole 24 m circumference as a
 * single strip would need an absurd canvas to keep the lettering upright, and
 * at any sane width the glyphs come out smeared to a third of their height.
 *
 * What made an earlier version of this band read as plastic, and what fixes it:
 *
 *   NO GROUND      it was a five-stop vertical gradient and nothing else, so
 *                  every one of the 24 m had identical brightness at identical
 *                  height. Real metal is a field of hammer facets and rubbed
 *                  oxide, which is what `forgedMetal` already paints for every
 *                  other brass in the building — that goes down first here as
 *                  the ground, tiled across the strip, and the moulding's
 *                  shading is laid over it rather than instead of it.
 *   NO PROFILE     a band this deep is never one flat face. It is a moulding:
 *                  a fillet, a cavetto, the flat the letters sit on, an astragal
 *                  and a lower fillet, each catching the room differently. Those
 *                  are painted as horizontal zones, so the silhouette stays two
 *                  triangles while the surface reads as turned.
 *   NO ROUGHNESS   one scalar roughness over the whole band gives one hard
 *                  specular bar running dead level round the table, which is
 *                  the single most synthetic thing an eye can be shown. A
 *                  roughness map breaks that bar into polished flats, dulled
 *                  hollows and hand-worn passages.
 *   NO WEAR        four centuries and a great many sleeves. Bright rubbed
 *                  passages on the projecting members, verdigris pooling in the
 *                  cavetto, and dark runs under the lettering.
 */
const RIM_REPEATS = 6;
/* The canvas keeps the band's REAL aspect: one segment is a sixth of a 24.6 m
   circumference, 4.1 m of stone-to-stone by 0.19 m deep, which is 21:1. Paint
   it at any squarer ratio and the mapping squashes every letter to a third of
   its height. The resolution went up (4096 × 192, from 2048 × 96) because this
   band is the closest thing on the instrument to a visitor's eye; the shape did
   not, because the shape is not free to choose. */
const RIM_W = 4096;
const RIM_H = 192;

/** the moulding's zones, as fractions of the band's height: [top, bottom] */
const RIM_ZONES = {
  topFillet: [0.0, 0.1],
  cavetto: [0.1, 0.3],
  flat: [0.3, 0.74],
  astragal: [0.74, 0.9],
  botFillet: [0.9, 1.0],
} as const;

/** paint a horizontal member of the moulding: a lit crown falling to a shaded
 *  root, which is all a turned profile is once it is flattened onto a strip */
function rimMember(
  x: CanvasRenderingContext2D,
  zone: readonly [number, number],
  crown: number,
  light: string,
  dark: string,
  strength: number,
): void {
  const y0 = zone[0] * RIM_H;
  const y1 = zone[1] * RIM_H;
  const g = x.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, dark);
  g.addColorStop(Math.max(0.02, crown - 0.18), light);
  g.addColorStop(crown, '#fff3cf');
  g.addColorStop(Math.min(0.98, crown + 0.22), light);
  g.addColorStop(1, dark);
  x.globalAlpha = strength;
  x.fillStyle = g;
  x.fillRect(0, y0, RIM_W, y1 - y0);
  x.globalAlpha = 1;
}

let rimTexCache: THREE.CanvasTexture | null = null;
let rimRoughCache: THREE.CanvasTexture | null = null;

function bakeRim(): { map: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  if (rimTexCache && rimRoughCache) return { map: rimTexCache, rough: rimRoughCache };
  const c = document.createElement('canvas');
  c.width = RIM_W;
  c.height = RIM_H;
  const x = c.getContext('2d')!;

  /* the ground: the building's own hammered brass, tiled across the strip. */
  const stock = forgedMetal('#a8863c', 'brass', 41).image as HTMLCanvasElement;
  for (let tx = 0; tx < RIM_W; tx += stock.width) {
    for (let ty = 0; ty < RIM_H; ty += stock.height) {
      x.drawImage(stock, tx, ty);
    }
  }

  /* the moulding, member by member, multiplied over that ground so the facets
     keep showing through the shading instead of being buried by it */
  x.globalCompositeOperation = 'overlay';
  rimMember(x, RIM_ZONES.topFillet, 0.4, '#c9a154', '#4a3617', 0.9);
  rimMember(x, RIM_ZONES.cavetto, 0.85, '#8a6a2c', '#33260f', 0.95);
  rimMember(x, RIM_ZONES.flat, 0.32, '#c8a259', '#6d5122', 0.75);
  rimMember(x, RIM_ZONES.astragal, 0.38, '#d8b169', '#43310f', 0.95);
  rimMember(x, RIM_ZONES.botFillet, 0.3, '#8f6d2e', '#2a1f0b', 0.9);
  x.globalCompositeOperation = 'source-over';

  /* the quirks: the hairline shadow where one member meets the next. A turned
     moulding has a hard dark line at every arris and almost nothing else says
     'turned' as quickly. */
  x.globalAlpha = 0.55;
  x.fillStyle = '#241a08';
  for (const z of Object.values(RIM_ZONES)) {
    x.fillRect(0, z[0] * RIM_H, RIM_W, 2);
  }
  x.globalAlpha = 1;

  /* verdigris, pooling where the cavetto's hollow holds damp */
  const cav = RIM_ZONES.cavetto;
  for (let i = 0; i < 140; i++) {
    const px = Math.random() * RIM_W;
    const py = (cav[0] + Math.random() * (cav[1] - cav[0])) * RIM_H;
    x.globalAlpha = 0.05 + Math.random() * 0.16;
    x.fillStyle = Math.random() < 0.6 ? '#5c7a52' : '#3f5a4a';
    x.beginPath();
    x.ellipse(px, py, 6 + Math.random() * 44, 2 + Math.random() * 7, 0, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;

  /* The inscription, cut INTO the brass: a dark stroke with a bright highlight
     lifted above it. That offset pair is what reads as engraved rather than
     printed, at any distance you can actually see the band from. */
  const words = 'TABVLA · SYSTEMATIS · MVNDI';
  const midFlat = (RIM_ZONES.flat[0] + RIM_ZONES.flat[1]) / 2 * RIM_H;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = '92px "Cormorant Garamond", Georgia, serif';
  const letterSpaced = [...words].join(' ');
  x.fillStyle = '#2c1f0a';
  x.globalAlpha = 0.9;
  x.fillText(letterSpaced, RIM_W / 2, midFlat + 3);
  x.fillStyle = '#ffeec2';
  x.globalAlpha = 0.45;
  x.fillText(letterSpaced, RIM_W / 2, midFlat - 3);
  x.globalAlpha = 1;

  /* the ornament closing each end of the segment, so the repeat reads as a
     deliberate rhythm rather than as a seam: a lozenge between two beads */
  for (const cx of [0, RIM_W]) {
    for (const d of [-1, 1]) {
      x.globalAlpha = 0.75;
      x.fillStyle = '#3d2c12';
      x.beginPath();
      x.moveTo(cx + d * 120, midFlat);
      x.lineTo(cx + d * 192, midFlat - 30);
      x.lineTo(cx + d * 264, midFlat);
      x.lineTo(cx + d * 192, midFlat + 30);
      x.closePath();
      x.fill();
      x.globalAlpha = 0.5;
      x.strokeStyle = '#ffeec2';
      x.lineWidth = 2;
      x.stroke();
      x.globalAlpha = 0.7;
      x.fillStyle = '#ffe9b0';
      x.beginPath();
      x.arc(cx + d * 192, midFlat, 6, 0, Math.PI * 2);
      x.fill();
    }
  }
  x.globalAlpha = 1;

  /* wear: bright rubbed passages on the members that stand proud, and dark
     runs falling from the lettering. Both are LOCAL — wear that goes all the
     way round is not wear, it is a stripe. */
  for (let i = 0; i < 26; i++) {
    const px = Math.random() * RIM_W;
    const wd = 60 + Math.random() * 260;
    x.globalAlpha = 0.06 + Math.random() * 0.12;
    x.fillStyle = '#ffe9b0';
    const z = Math.random() < 0.5 ? RIM_ZONES.astragal : RIM_ZONES.topFillet;
    x.fillRect(px, z[0] * RIM_H, wd, (z[1] - z[0]) * RIM_H);
  }
  for (let i = 0; i < 34; i++) {
    const px = Math.random() * RIM_W;
    x.globalAlpha = 0.05 + Math.random() * 0.1;
    x.fillStyle = '#1d1406';
    x.fillRect(px, midFlat, 2 + Math.random() * 9, RIM_H - midFlat);
  }
  x.globalAlpha = 1;

  /* A warm glaze over the whole band. The overlay pass above multiplies the
     moulding's shading into the hammered ground, and two multiplies stacked
     take any painted metal down towards mud — this puts the brass back without
     flattening the modelling, the way a lacquer coat does on the real thing. */
  x.globalCompositeOperation = 'soft-light';
  x.globalAlpha = 0.55;
  x.fillStyle = '#f0c87a';
  x.fillRect(0, 0, RIM_W, RIM_H);
  x.globalCompositeOperation = 'source-over';
  x.globalAlpha = 1;

  /* ————— the roughness map —————
     Same layout, painted in greyscale: black where the metal is polished and
     white where it is dull. The members that stand proud get rubbed bright by
     sleeves; the cavetto's hollow, which nothing touches, stays dead. */
  const rc = document.createElement('canvas');
  rc.width = RIM_W / 4;
  rc.height = RIM_H / 4;
  const r = rc.getContext('2d')!;
  r.fillStyle = '#7a7a7a';
  r.fillRect(0, 0, rc.width, rc.height);
  const band = (zone: readonly [number, number], grey: string) => {
    r.fillStyle = grey;
    r.fillRect(0, zone[0] * rc.height, rc.width, (zone[1] - zone[0]) * rc.height);
  };
  band(RIM_ZONES.topFillet, '#3c3c3c');
  band(RIM_ZONES.cavetto, '#c8c8c8');
  band(RIM_ZONES.flat, '#6e6e6e');
  band(RIM_ZONES.astragal, '#333333');
  band(RIM_ZONES.botFillet, '#a0a0a0');
  for (let i = 0; i < 700; i++) {
    r.globalAlpha = 0.1 + Math.random() * 0.35;
    r.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#000000';
    r.beginPath();
    r.ellipse(
      Math.random() * rc.width,
      Math.random() * rc.height,
      2 + Math.random() * 26,
      1 + Math.random() * 4,
      0,
      0,
      Math.PI * 2,
    );
    r.fill();
  }
  r.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(RIM_REPEATS, 1);
  const rough = new THREE.CanvasTexture(rc);
  rough.wrapS = THREE.RepeatWrapping;
  rough.anisotropy = 4;
  rough.repeat.set(RIM_REPEATS, 1);
  rimTexCache = tex;
  rimRoughCache = rough;
  return { map: tex, rough };
}

/**
 * The base's profile, floor (y = 0) to the tabletop's underside, as radii.
 *
 * A SOLID mass — the trunk of a tree wide enough to lay the chart across — near
 * enough the tabletop's own width the whole way up. Two things drove that. The
 * chart used to stand on a colonnade with open air behind it, and open air
 * under a disc this wide reads as a void the eye keeps falling into rather than
 * as a table — the plate wants to look FOUNDED, like something the museum was
 * built around. And the underside is invisible from every reachable spot anyway
 * (the eye rides at 2.2, the top at 1.15, the walk-up fence outside the rim),
 * so a hollow stand spends its geometry where nobody can look while still
 * costing the silhouette. One lathe of revolution is also ONE draw call for the
 * entire mass, against the fourteen meshes the colonnade took.
 *
 * The profile is read as [y, radius] and turned into a lathe below: a root
 * flare spreading onto the floor, a long slightly-tapering trunk, and a swell
 * back out at the top so the chart sits on the wood rather than overhanging it.
 * The circular section it implies is broken up per-vertex in baseGeom — see the
 * note on the ribs there, and on why the silhouette is the part that matters.
 */
const BASE_PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.0, 4.0],
  [0.12, 3.96],
  [0.17, 3.8],
  [0.86, 3.66],
  [0.91, 3.78],
  [0.98, 3.9],
  [1.05, 3.95],
];

/* ————— the moons —————
 * Luna, and the four Galileans. Small enough to be a reward for walking up
 * rather than clutter from across the hall, and pointed: Jupiter's four are
 * the observation that broke the crystalline spheres open in 1610, which is
 * the hinge the rest of this library's story turns on.
 */
interface MoonSpec {
  host: string;
  name: string;
  /** orbit radius in scene units, from the host's centre */
  r: number;
  size: number;
  /** seconds per revolution — ordered like the real ones, not to scale */
  period: number;
}
const MOONS: readonly MoonSpec[] = [
  { host: 'Earth', name: 'Luna', r: 0.115, size: 0.014, period: 11 },
  { host: 'Jupiter', name: 'Io', r: 0.125, size: 0.01, period: 5 },
  { host: 'Jupiter', name: 'Europa', r: 0.15, size: 0.009, period: 8 },
  { host: 'Jupiter', name: 'Ganymede', r: 0.178, size: 0.013, period: 13 },
  { host: 'Jupiter', name: 'Callisto', r: 0.205, size: 0.012, period: 22 },
];

/** a body this small is a dishonest click target; the proxy is at least this.
 *  Kept under half the tightest orbit-to-orbit spacing, so neighbouring
 *  proxies do not swallow each other's clicks. */
const PICK_R_MIN = 0.18;
/** how tall the labels stand. Sized from a visitor leaning on the rim, now
 *  about 4 m from the far side of the wider chart: much under this and the
 *  engraved name is a gold smudge rather than a word. */
const LABEL_H = 0.21;

export function Orrery({
  still = false,
  selected = null,
  onPickBody,
  mode = 'system',
  onSetMode,
}: {
  still?: boolean;
  /** the body whose reading is open — it keeps a gilt ring on the chart */
  selected?: string | null;
  /** called with the body's name — 'Mercury', 'Saturn', … — when it is clicked */
  onPickBody?: (name: string) => void;
  /** which chart the instrument is showing */
  mode?: OrreryMode;
  /** called by the rim selector when a visitor changes the chart */
  onSetMode?: (mode: OrreryMode) => void;
}) {
  const system = mode === 'system';
  const bodies = useRef<(THREE.Object3D | null)[]>([]);
  const spheres = useRef<(THREE.Mesh | null)[]>([]);
  const glows = useRef<(THREE.Sprite | null)[]>([]);
  const labels = useRef<(THREE.Sprite | null)[]>([]);
  const proxies = useRef<(THREE.Mesh | null)[]>([]);
  const saturnRing = useRef<THREE.Mesh>(null);
  const footRing = useRef<THREE.Mesh>(null);
  const sunBody = useRef<THREE.Mesh>(null);
  const sunProxy = useRef<THREE.Mesh>(null);
  const sunLabel = useRef<THREE.Sprite>(null);
  const corona = useRef<THREE.Sprite>(null);
  const moonPivots = useRef<(THREE.Group | null)[]>([]);
  const hovered = useRef<number | null>(null);
  /** the Sun is hovered — he is not one of the ORBITERS, so he keeps his own */
  const sunHovered = useRef(false);
  const sunAttention = useRef(0);
  /** eased 0→1 attention per body: hover and selection both feed it */
  const attention = useRef<number[]>(ORBITERS.map(() => 0));
  /** seconds of orrery time; only advances while the scene is live */
  const clock = useRef(0);

  const specs = useMemo(
    () =>
      ORBITERS.map((p) => ({
        planet: p,
        aScene: orbitRadius(p),
        size: bodyRadius(p),
        lift: bodyLift(p),
        spin: spinRate(p),
        tilt: (AXIAL_TILT_DEG[p.name] ?? 0) * RAD,
        year: yearSeconds(p),
        m0: meanAnomalyAtEpoch(p),
        path: orbitCurve(p),
      })),
    [],
  );

  // the highlight roads, built once — the ribbon width tapers with the orbit so
  // Mercury's does not swamp the hub while Neptune's is still visible
  const ribbonGeoms = useMemo(
    () => specs.map((s) => ribbonGeometry(s.path, 0.03 + s.aScene * 0.016)),
    [specs],
  );
  const ribbonMats = useMemo(
    () =>
      specs.map(
        (s) =>
          new THREE.MeshBasicMaterial({
            color: CLASSICAL.has(s.planet.name) ? '#ffd88a' : '#bcd8f2',
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            /**
             * KEEP THE DEDUP PASS OFF THESE — one road per body is the whole
             * point of them.
             *
             * At rest all eight are byte-identical inside their colour group
             * (gold for the classical seven, blue for Uranus and Neptune) and
             * they hold still for as long as nobody is pointing at the table,
             * so `MaterialDedup` saw them as the same surface described eight
             * times and collapsed each group onto one instance. After that the
             * per-body writes below landed on a material either nothing was
             * using — the body lit no road at all — or every road in its group
             * was using, so hovering the Earth ignited Mercury, Venus, Mars,
             * Jupiter and Saturn with it. `signature()` returns null for any
             * material carrying userData, which is the sanctioned way to say
             * "this one is animated per instance".
             */
            userData: { animated: 'road opacity, per body' },
          }),
      ),
    [specs],
  );
  const bodyMats = useMemo(
    () =>
      ORBITERS.map((p) => {
        const map = planetMap(p.name);
        return new THREE.MeshStandardMaterial({
          map: map ?? undefined,
          color: map ? '#ffffff' : p.color,
          roughness: 0.82,
          metalness: 0.02,
          // with no sun in the system these bodies have nothing to light them
          // but the chart's own lamp, so each keeps a little of its own colour
          // in the shadowed limb. Driving the glow through the SURFACE map
          // rather than a flat colour means the belts and caps survive there
          // too, instead of washing out to a uniform disc.
          emissive: new THREE.Color(map ? '#ffffff' : p.color),
          emissiveMap: map ?? undefined,
          emissiveIntensity: 0.12,
        });
      }),
    [],
  );
  const ringGeom = useMemo(() => {
    const size = bodyRadius(ORBITERS.find((p) => p.name === 'Saturn')!);
    return saturnRingGeometry(size * SATURN_RING.inner, size * SATURN_RING.outer);
  }, []);
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: saturnRingMap(),
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const moonMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b8b2a6',
        roughness: 0.92,
        metalness: 0,
        emissive: new THREE.Color('#b8b2a6'),
        emissiveIntensity: 0.1,
      }),
    [],
  );
  const sunMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: sunMap(),
        // pushed past white on purpose. The tone mapper takes the overflow and
        // returns a body that reads as EMITTING rather than as a well-lit ball
        // of orange — which is the whole difference between a sun and a peach.
        color: new THREE.Color(1.5, 1.3, 1.0),
      }),
    [],
  );
  const sunLabelMat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: planetLabel(SUN).tex,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        depthTest: false,
      }),
    [],
  );
  const labelMats = useMemo(
    () =>
      ORBITERS.map(
        (p) =>
          new THREE.SpriteMaterial({
            map: planetLabel(p.name).tex,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            depthTest: false,
          }),
      ),
    [],
  );
  /* the base, revolved from BASE_PROFILE — the whole mound in one geometry.
     The profile carries a point at radius 0 so the lathe closes over the floor
     rather than leaving an open pipe, and the UVs are rescaled afterwards: a
     lathe runs v from 0 to 1 over the profile whatever its real length, which
     on a 1.05 m rise would stretch one tile of masonry over the whole height.
     Both axes are put back into METRES here, so the repeat the material is
     asked for is simply its tiles-per-metre and the courses come out life-size
     on a 24 m circumference and a 1 m rise alike. */
  const baseGeom = useMemo(() => {
    /* The profile is RESAMPLED before it is revolved. A lathe puts a ring of
       vertices at each profile point and nowhere else, so the eight points that
       describe this shape would give eight rings — and a displacement map can
       only move vertices that exist. Both the height map and the ribs below
       need somewhere to push, so each segment is subdivided into ~3 cm steps
       and the revolution is taken at 256 sides rather than 72. That is about
       20k vertices for the whole stump, which is nothing next to what it buys:
       this is one draw call either way, and this building is draw-call bound,
       not vertex bound. */
    const dense: THREE.Vector2[] = [];
    const STEP = 0.03;
    for (let i = 0; i < BASE_PROFILE.length - 1; i++) {
      const [y0, r0] = BASE_PROFILE[i];
      const [y1, r1] = BASE_PROFILE[i + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(y1 - y0, r1 - r0) / STEP));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        dense.push(new THREE.Vector2(r0 + (r1 - r0) * t, y0 + (y1 - y0) * t));
      }
    }
    dense.push(
      new THREE.Vector2(
        BASE_PROFILE[BASE_PROFILE.length - 1][1],
        BASE_PROFILE[BASE_PROFILE.length - 1][0],
      ),
    );
    const SIDES = 256;
    const geo = new THREE.LatheGeometry(dense, SIDES);

    /* ————— the ribs —————
       A trunk is not a cylinder, and no amount of normal map fixes a perfectly
       circular SILHOUETTE — the giveaway is the outline against the floor,
       which no surface shading can touch. So the radius is pushed in and out
       with a few slow harmonics in angle: broad ribs and hollows running up
       the stump, drifting a little as they climb the way real bark plates do,
       plus a faster ripple for the coarse texture between them. The scale is
       deliberately restrained — the tabletop has to keep sitting flat on it. */
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    const rise = BASE_PROFILE[BASE_PROFILE.length - 1][0];
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = Math.hypot(v.x, v.z);
      if (r < 0.001) continue;
      const a = Math.atan2(v.z, v.x);
      const h = v.y / rise;
      // fade the ribs out at the very top, so the cornice the chart rests on
      // stays a true circle and no gap opens under the rim
      const fade = THREE.MathUtils.smoothstep(1 - h, 0.0, 0.25);
      const ribs =
        Math.sin(a * 7 + h * 1.6) * 0.055 +
        Math.sin(a * 11 - h * 2.4) * 0.032 +
        Math.sin(a * 19 + h * 0.8) * 0.014 +
        Math.sin(a * 31 - h * 3.1) * 0.007;
      const k = (r + ribs * fade) / r;
      pos.setXYZ(i, v.x * k, v.y, v.z * k);
    }
    pos.needsUpdate = true;
    // the ribs changed the surface, so the normals the lathe generated are now
    // describing a shape that is no longer there
    geo.computeVertexNormals();

    /* the UVs last, since nothing above touches them: a lathe runs v from 0 to
       1 over the profile whatever its real length, which on a 1.05 m rise would
       stretch one tile of bark over the whole height. Both axes go back into
       METRES here, so the repeat the material is asked for is simply its tiles
       per metre and the grain holds at the same size on a 24 m circumference
       and a 1 m rise alike. */
    const uv = geo.attributes.uv;
    const around = 2 * Math.PI * TABLE_R;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) * around, uv.getY(i) * rise);
    }
    uv.needsUpdate = true;
    return geo;
  }, []);
  const topMat = useMemo(() => {
    const chart = chartTex();
    return new THREE.MeshStandardMaterial({
      map: chart,
      roughness: 0.9,
      metalness: 0,
      // The chart carries a little of its own light. This replaced a second
      // point light that existed only to keep the paint legible on the side of
      // the table facing away from the Sun: an emissive map costs nothing per
      // frame, where every extra point light is paid for by every lit fragment
      // in its radius — that one lamp alone took the rotunda from 93fps to 52.
      // It suits the subject too; the gold roads should look like they glow.
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: chart,
      emissiveIntensity: 0.34,
    });
  }, []);
  /* The base's surfaces come from the registry, not from here: everything under
     the chart is ARCHITECTURE, and architecture in this building wears the CC0
     photographic scans (Poly Haven / ambientCG) that the registry manages —
     albedo, normal, roughness and AO together, which is why real bark reads as
     bark and a hand-painted albedo never quite does. The chart face, the rim
     band and the brass are the opposite case: they are drawn instruments, and a
     photograph dropped over them would replace the diagram, so they stay
     painted in place.

     The base is a STUMP: `wood_arcade_timber` is the oak-bark scan the halls'
     order already wears, and it is the one surface in the catalogue with real
     vertical fissuring, which is the whole reading. Orientation matters and is
     free here — the lathe's v runs UP the mass and the scan's own v runs up the
     trunk, so the fissures fall the right way with no rotation. The repeats are
     tiles per metre, because the lathe's UVs below are in METRES; bark features
     are big, so a tile is close to two metres and the plates come out the size
     of plates instead of a rind. */
  const stoneMat = useMemo(
    () =>
      getMaterial('wood_arcade_timber', {
        repeat: [0.55, 0.55],
        overrides: {
          // The scan is grey where the shafts want it grey; a stump standing in
          // a warm-lit room wants the sap tone back in it. A tint here
          // MULTIPLIES the albedo, so this can only ever warm and darken —
          // which is the right direction, and why it is a tint not a repaint.
          color: '#a3855e',
          // REAL relief. Asking for a displacementScale is what makes the
          // registry load the scan's height map at all — it skips that slot by
          // default, on the sound argument that nothing else in the building is
          // tessellated enough for it to bite. This mass now is (see baseGeom),
          // so the fissures are cut into the geometry rather than faked in the
          // shading, and they hold up at the grazing angles a visitor walking
          // round the table sees them at, where a normal map visibly gives up.
          // The bias re-centres the push so the mean radius does not grow.
          displacementScale: 0.07,
          displacementBias: -0.035,
          // and the normal map harder, for everything finer than 3 cm steps
          normalScale: 2.2,
        },
      }),
    [],
  );
  /* the drip moulding under the chart is a turned member, not bark: the dark
     ancient walnut the keeper's own furniture is made of */
  const memberMat = useMemo(() => getMaterial('wood_walnut_ancient', { repeat: [12, 1] }), []);
  /* the console's ledge: the same walnut, but its geometry is a flat ring and a
     short arc of cylinder whose UVs both run 0–1 over the piece, so it needs
     its own repeat rather than the moulding's 12:1 wrap */
  const consoleWoodMat = useMemo(
    () => getMaterial('wood_walnut_ancient', { repeat: [6, 6] }),
    [],
  );
  const brassMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#b98a3d', metalness: 0.82, roughness: 0.32 }),
    [],
  );
  /* the chart's edge bead. A torus's u runs once round the ring and its v once
     round the tube, so the repeat has to be wildly anisotropic or the grain
     comes out smeared 200:1: 30 tiles round a 24.6 m circumference at the
     material's own 1.2 tiles/m, and 1 round a tube 14 cm in girth. */
  const beadMat = useMemo(
    () => getMaterial('metal_brass_burnished', { repeat: [30, 1] }),
    [],
  );
  const rimMat = useMemo(() => {
    const { map, rough } = bakeRim();
    return new THREE.MeshStandardMaterial({
      map,
      roughnessMap: rough,
      // NOT metalness 1, though brass is a metal and 1 is the physically
      // honest answer. A fully metallic surface has no diffuse response at
      // all: everything it shows is reflection, and this scene carries no
      // environment map, so there is nothing for it to reflect but four
      // point lights. At 1 the band went dead and read as dark wood. 0.75
      // leaves enough diffuse for the paint to show while the specular still
      // behaves like metal — the usual compromise for an IBL-less scene.
      metalness: 0.75,
      // left at 1 so the MAP decides: three.js MULTIPLIES roughnessMap by this
      // value, so anything lower quietly polishes the whole band back to a
      // mirror and throws away the variation the map exists to provide.
      roughness: 1,
      side: THREE.DoubleSide,
    });
  }, []);
  const footMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffd98d',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        // driven per frame, like the roads above — kept out of the dedup pass
        // for the same reason
        userData: { animated: 'selection foot' },
      }),
    [],
  );

  useEffect(
    () => () => {
      ribbonGeoms.forEach((g) => g.dispose());
      ribbonMats.forEach((m) => m.dispose());
      bodyMats.forEach((m) => m.dispose());
      labelMats.forEach((m) => m.dispose());
      sunMat.dispose();
      sunLabelMat.dispose();
      moonMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      topMat.dispose();
      brassMat.dispose();
      rimMat.dispose();
      footMat.dispose();
      // stoneMat and the other registry materials are shared with the rest of the
      // building and never ours to dispose
      baseGeom.dispose();
    },
    [
      ribbonGeoms,
      ribbonMats,
      bodyMats,
      labelMats,
      sunMat,
      sunLabelMat,
      moonMat,
      ringGeom,
      ringMat,
      topMat,
      brassMat,
      rimMat,
      footMat,
      baseGeom,
    ],
  );

  /* The instrument has changed plate: let go of the sheets the other charts
     baked. Full-table plates at 3072² would be close to a third of a
     gigabyte of resident texture, and the astrolabe alone bakes four tympans.
     This runs AFTER the new chart has mounted, so the outgoing components have
     already unmounted and cannot be holding a texture we are about to dispose;
     coming back to a plate costs one re-bake, which is a few hundred
     milliseconds paid once against a charge levied for the whole session. */
  useEffect(() => {
    keepOnlyPlates(mode);
  }, [mode]);

  // the pick-proxies are the click targets; their material never renders but
  // their geometry still answers the raycaster
  useEffect(() => {
    if (!onPickBody) return;
    const regd: THREE.Mesh[] = [];
    proxies.current.forEach((m, i) => {
      if (!m) return;
      registerPickable(m, {
        onPick: () => onPickBody(ORBITERS[i].name),
        onHover: (h) => {
          if (h) hovered.current = i;
          else if (hovered.current === i) hovered.current = null;
        },
        maxDist: tableReach(TABLE_R),
      });
      regd.push(m);
    });
    if (sunProxy.current) {
      registerPickable(sunProxy.current, {
        onPick: () => onPickBody(SUN),
        onHover: (h) => {
          sunHovered.current = h;
        },
        maxDist: tableReach(TABLE_R),
      });
      regd.push(sunProxy.current);
    }
    return () => regd.forEach((m) => unregisterPickable(m));
    /**
     * `system` IS A DEPENDENCY, and leaving it out cost the solar chart every
     * one of its clicks.
     *
     * The bodies live behind `{system && …}`, so changing plate unmounts them
     * and the ref callbacks null the proxies out. This effect did not re-run,
     * so the registry kept the DEAD meshes — detached from the scene, hit by
     * nothing — and when the visitor pressed I to come back, React built fresh
     * proxies that were never registered at all. The chart looked right and
     * answered no cursor.
     */
  }, [onPickBody, system]);

  // place every planet once up front, so a paused scene still shows the
  // J2000 configuration rather than a heap at the origin
  const place = (t: number) => {
    specs.forEach((s, idx) => {
      const node = bodies.current[idx];
      if (!node) return;
      const M = s.m0 + (t / s.year) * Math.PI * 2;
      const E = eccentricAnomaly(M, s.planet.e);
      // projected onto the table plane: the ecliptic height is dropped so every
      // body stands over its own painted road (see the projection note up top)
      const [x, , z] = orbitalPosition(s.planet, E, compress);
      node.position.set(x, 0, z);
    });
  };

  useFrame((_, delta) => {
    if (!still) clock.current += delta;
    place(clock.current);
    specs.forEach((s, i) => {
      // the attention cue: a pointed-at or opened body swells, brightens, lifts
      // its label out of the crowd, and ignites its whole orbital road
      const want = hovered.current === i || selected === s.planet.name ? 1 : 0;
      const a = THREE.MathUtils.damp(attention.current[i], want, 9, delta);
      attention.current[i] = a;

      const sphere = spheres.current[i];
      if (sphere) {
        sphere.scale.setScalar(1 + a * 0.9);
        if (!still) sphere.rotation.y += delta * s.spin;
        (sphere.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.12 + a * 0.3;
      }
      const glow = glows.current[i];
      if (glow) {
        glow.scale.setScalar(s.size * (5.5 + a * 5));
        (glow.material as THREE.SpriteMaterial).opacity = 0.3 + a * 0.35;
      }
      const label = labels.current[i];
      if (label) {
        (label.material as THREE.SpriteMaterial).opacity = 0.6 + a * 0.4;
        const h = LABEL_H * (1 + a * 0.3);
        label.scale.set(h * planetLabel(s.planet.name).aspect, h, 1);
        label.position.y = s.size * 1.5 + 0.14 + a * 0.06;
      }
      ribbonMats[i].opacity = a * 0.5;
      if (s.planet.name === 'Saturn' && saturnRing.current)
        saturnRing.current.scale.setScalar(1 + a * 0.9);
    });

    // the moons go round their hosts on the shared clock, so a stilled scene
    // freezes them with everything else
    MOONS.forEach((m, i) => {
      const pivot = moonPivots.current[i];
      if (pivot) pivot.rotation.y = (clock.current / m.period) * Math.PI * 2;
    });

    // the Sun: a slow turn, a breathing corona, and the same attention cue
    const sunWant = sunHovered.current || selected === SUN ? 1 : 0;
    sunAttention.current = THREE.MathUtils.damp(sunAttention.current, sunWant, 9, delta);
    const sa = sunAttention.current;
    if (sunBody.current && !still) sunBody.current.rotation.y += delta * 0.06;
    if (corona.current) {
      // the breath is slow and shallow; anything faster reads as a flicker
      const breath = still ? 1 : 1 + Math.sin(clock.current * 0.6) * 0.04;
      const s = SUN_R * 4.2 * breath * (1 + sa * 0.22);
      corona.current.scale.set(s, s, 1);
      (corona.current.material as THREE.SpriteMaterial).opacity = 0.42 + sa * 0.25;
    }
    if (sunLabel.current) {
      const lm = sunLabel.current.material as THREE.SpriteMaterial;
      lm.opacity = 0.6 + sa * 0.4;
      const h = LABEL_H * (1 + sa * 0.3);
      sunLabel.current.scale.set(h * planetLabel(SUN).aspect, h, 1);
    }

    // the gilt ring around the open body's foot, painted on the chart
    const ring = footRing.current;
    if (ring) {
      const idx = ORBITERS.findIndex((p) => p.name === selected);
      const target = idx >= 0 ? attention.current[idx] : 0;
      footMat.opacity = THREE.MathUtils.damp(footMat.opacity, target * 0.75, 8, delta);
      if (idx >= 0) {
        const node = bodies.current[idx];
        if (node) ring.position.set(node.position.x, 0.014, node.position.z);
        const r = Math.max(specs[idx].size * 3.4, 0.19);
        ring.scale.setScalar(r);
      }
      ring.visible = footMat.opacity > 0.01;
      ring.rotation.z += delta * 0.35;
    }
  });

  return (
    // centred on the globe itself: the Earth is the middle of this system, and
    // the only body in it that is not a moving mesh. The group's origin IS the
    // table's surface, so "y = 0" here means "lying on the chart".
    <group position={[0, TABLE_Y, 0]}>
      {/* ————— the chart table itself, built like furniture ————— */}
      {/* the space-dark top the system stands on */}
      <mesh position={[0, -TABLE_T / 2, 0]} material={topMat}>
        <cylinderGeometry args={[TABLE_R, TABLE_R, TABLE_T, 96]} />
      </mesh>
      {/* ————— the bead that finishes the chart's edge —————
          Where a hand rests, so it is the one piece of metal on the instrument
          a visitor actually touches, and it was a flat-coloured wire: one
          scalar colour, one scalar roughness, 8 segments round the tube. At
          that description it can only ever be a shaded torus.

          It now wears the building's real burnished brass — the CC0 scan the
          registry manages, so it arrives with a normal and a roughness map and
          picks up the same wear as every other brass in the room — and the
          tube is rounder (16 segments, up from 8) and slightly heavier, since
          a bead reads by the way its highlight travels round it and eight
          facets is not enough to travel round. A bead is also NOT smooth
          shaded into the tabletop: the hard line where it meets the chart is
          what makes it sit ON the surface rather than being part of it. */}
      <mesh position={[0, 0.012, 0]} rotation-x={Math.PI / 2} material={beadMat}>
        <torusGeometry args={[TABLE_R - 0.02, 0.026, 16, 160]} />
      </mesh>
      {/* the engraved brass band around the edge — TABVLA SYSTEMATIS MVNDI */}
      <mesh position={[0, -0.135, 0]} material={rimMat}>
        <cylinderGeometry args={[TABLE_R + 0.035, TABLE_R + 0.035, 0.19, 128, 1, true]} />
      </mesh>
      {/* the drip moulding under the band — a rounded stone lip, so rain (and
          the eye) leaves the chart's edge instead of running back underneath */}
      <mesh position={[0, -0.27, 0]} rotation-x={Math.PI / 2} material={memberMat}>
        <torusGeometry args={[TABLE_R + 0.005, 0.075, 10, 128]} />
      </mesh>
      {/* the brass seat ruled on the chart under the Sun */}
      {system && (
        <mesh position={[0, 0.008, 0]} rotation-x={Math.PI / 2} material={brassMat}>
          <torusGeometry args={[SUN_R + 0.16, 0.02, 8, 64]} />
        </mesh>
      )}

      {/* ————— the console: which plate the instrument is showing ————— */}
      <PlateConsole
        mode={mode}
        onSetMode={onSetMode}
        tableR={TABLE_R}
        woodMat={consoleWoodMat}
        metalMat={beadMat}
      />

      {/* the other plates, each mounting its own contents and its own light */}
      {mode === 'circulus' && (
        <CircleOfArt still={still} selected={selected} onPickBody={onPickBody} radius={TABLE_R} />
      )}
      {mode === 'sigilla' && (
        <SolomonSeals still={still} selected={selected} onPickBody={onPickBody} radius={TABLE_R} />
      )}

      {/* ————— the stand: the stump —————
          A chart table nearly eight metres across stood first on ONE turned
          baluster, then on a ring of oak columns under a frieze drum. Both had
          the same two faults. The table sat too near the floor to read as a
          working instrument, and everything under it was AIR: a disc this wide
          with daylight behind its legs reads as a lid balanced on sticks.

          It now stands on the trunk of the tree it was presumably cut from —
          bark, root flare and all — as though the museum were built around
          something that was already growing here. One lathe of revolution
          carries the entire mass (see BASE_PROFILE and baseGeom): one draw call
          against the colonnade's fourteen, and no void under the chart.

          The work that repays here is SILHOUETTE and SURFACE, not carving. The
          camera's eye rides at 2.2 and the chart at 1.15, so a visitor always
          looks down and the near rim occludes the far side of the trunk from
          every reachable distance — an earlier pass at twelve corbel brackets
          and brass capitals was invisible from everywhere and came out again.
          What IS always visible is the outline against the floor, which is why
          the ribs are cut into the geometry and not into a normal map. */}
      <mesh position={[0, -TABLE_Y, 0]} geometry={baseGeom} material={stoneMat} castShadow receiveShadow />
      {/* ————— the Sun: hub, and the light everything else is lit by ————— */}
      {system && (
      <group position={[0, SUN_Y, 0]}>
        {/* The photosphere wears a BASIC material, not a standard one: the Sun
            is the one body here that emits rather than receives, so shading him
            by his own lamp would be circular — and at intensity enough to light
            Neptune he would have blown out to a white ball anyway. */}
        <mesh
          ref={sunBody}
          rotation-z={(AXIAL_TILT_DEG[SUN] ?? 0) * RAD}
          material={sunMat}
        >
          <sphereGeometry args={[SUN_R, 40, 28]} />
        </mesh>
        {/* the corona, two additive shells that breathe against each other */}
        <sprite ref={corona} scale={[SUN_R * 4.2, SUN_R * 4.2, 1]}>
          <spriteMaterial
            map={getGlowTexture()}
            color="#ffa32a"
            transparent
            opacity={0.42}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        <sprite scale={[SUN_R * 2.4, SUN_R * 2.4, 1]}>
          <spriteMaterial
            map={getGlowTexture()}
            color="#fff6de"
            transparent
            opacity={0.68}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        {/* His actual light. It sits at his centre and at the planets' own
            height, so the bodies are lit edge-on and every one shows a real
            terminator — the single biggest reason the chart reads as a solar
            system now rather than as eight evenly-floodlit beads. `decay` is
            softened from the physical 2 so one lamp can carry the whole 3.5 m
            radius without cooking Mercury to reach Neptune. */}
        <pointLight color="#ffd9a0" intensity={8} distance={8} decay={1.5} />
        {/* the Sun's pick target, a shade proud of the photosphere */}
        <mesh ref={sunProxy}>
          <sphereGeometry args={[SUN_R * 1.05, 12, 10]} />
          <meshBasicMaterial visible={false} />
        </mesh>
        <sprite
          ref={sunLabel}
          position={[0, SUN_R * 1.9 + 0.14, 0]}
          material={sunLabelMat}
          scale={[LABEL_H * planetLabel(SUN).aspect, LABEL_H, 1]}
          renderOrder={4}
        />
      </group>
      )}

      {/* the gilt ring that marks the body whose reading is open */}
      {system && (
        <mesh ref={footRing} rotation-x={-Math.PI / 2} material={footMat} visible={false}>
          <ringGeometry args={[0.78, 1, 48]} />
        </mesh>
      )}

      {/* ————— the bodies: each on its pin, seal and name above ————— */}
      {system && specs.map((s, i) => (
        <group
          key={s.planet.name}
          ref={(g) => {
            bodies.current[i] = g;
          }}
        >
          {/* the brass pin, and its collar where it meets the chart */}
          <mesh position={[0, s.lift / 2, 0]} material={brassMat}>
            <cylinderGeometry args={[0.006, 0.009, s.lift, 6]} />
          </mesh>
          <mesh position={[0, 0.008, 0]} rotation-x={Math.PI / 2} material={brassMat}>
            <torusGeometry args={[0.028, 0.008, 5, 16]} />
          </mesh>

          {/* the body, turning on its own tilted axis */}
          <group position={[0, s.lift, 0]}>
            <mesh
              ref={(m) => {
                spheres.current[i] = m;
              }}
              rotation-z={s.tilt}
              material={bodyMats[i]}
            >
              <sphereGeometry args={[s.size, 32, 24]} />
            </mesh>
            {MOONS.map((m, k) =>
              m.host !== s.planet.name ? null : (
                <group
                  key={m.name}
                  ref={(g) => {
                    moonPivots.current[k] = g;
                  }}
                >
                  <mesh position={[m.r, 0, 0]} material={moonMat}>
                    <sphereGeometry args={[m.size, 10, 8]} />
                  </mesh>
                </group>
              ),
            )}
            {s.planet.name === 'Saturn' && (
              <mesh
                ref={saturnRing}
                rotation={[Math.PI / 2 - SATURN_TILT * RAD, 0, 0]}
                geometry={ringGeom}
                material={ringMat}
              />
            )}
            <sprite
              ref={(m) => {
                glows.current[i] = m;
              }}
              scale={[s.size * 5.5, s.size * 5.5, 1]}
            >
              <spriteMaterial
                map={getGlowTexture()}
                color={s.planet.color}
                transparent
                opacity={0.3}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
            {/* the engraved label. depthTest is off so a seal is never eaten by
                the body in front of it — an instrument's legend always reads. */}
            <sprite
              ref={(m) => {
                labels.current[i] = m;
              }}
              position={[0, s.size * 1.5 + 0.14, 0]}
              material={labelMats[i]}
              scale={[LABEL_H * planetLabel(s.planet.name).aspect, LABEL_H, 1]}
              renderOrder={4}
            />
            <mesh
              ref={(m) => {
                proxies.current[i] = m;
              }}
            >
              <sphereGeometry args={[Math.max(s.size * 2.2, PICK_R_MIN), 8, 6]} />
              <meshBasicMaterial visible={false} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ————— the roads that ignite under attention ————— */}
      {system && specs.map((s, i) => (
        <mesh
          key={`road-${s.planet.name}`}
          geometry={ribbonGeoms[i]}
          material={ribbonMats[i]}
          renderOrder={2}
        />
      ))}
    </group>
  );
}
