import * as THREE from 'three';
import { PLANET_LORE } from '../../../data/planetLore';
import { earthMap } from './globeTexture';

/**
 * Surfaces for the orrery's bodies, baked procedurally.
 *
 * Every planet on the chart table used to be a flat-shaded sphere in its
 * "colour to the eye" — which made Jupiter, Saturn and Venus three identical
 * beige pebbles. A wandering body should be recognisable at a glance, so each
 * one now carries a real map: Jupiter's belts and his red spot, Mars's rust and
 * ice caps, Mercury's cratering, the ice giants' near-featureless haze.
 *
 * These are equirectangular maps (u = longitude, v = latitude), drawn on a
 * canvas rather than loaded — the museum ships no planet photography, and a
 * baked canvas costs nothing at runtime and never suspends the scene (see the
 * note on TextSprite for why loaded assets are avoided in 3D here).
 *
 * They are impressions, not survey data: the belts, spots and maria are in the
 * right latitudes and the right colours, but no feature is at a real longitude.
 */

const W = 512;
const H = 256;

/** deterministic per-planet noise, so a reload draws the same Jupiter */
const rngFor = (seed: number) => {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
};

const ctx2d = () => {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return c.getContext('2d')!;
};

const finish = (x: CanvasRenderingContext2D): THREE.CanvasTexture => {
  const t = new THREE.CanvasTexture(x.canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  // longitude wraps; latitude must not, or the poles bleed across
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
};

/** mix two hex colours, t=0 → a */
function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round((((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t));
  const g = Math.round((((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t));
  const bl = Math.round(((pa & 255) * (1 - t) + (pb & 255) * t));
  return `rgb(${r},${g},${bl})`;
}

/**
 * Latitude bands: `stops` are [v, colour] pairs from north pole to south, and
 * every row lerps between the pair it falls between. This is the spine of all
 * four gas giants — belts and zones really are latitude-parallel.
 */
function bandGround(x: CanvasRenderingContext2D, stops: [number, string][]) {
  for (let y = 0; y < H; y++) {
    const v = y / (H - 1);
    let i = 0;
    while (i < stops.length - 2 && stops[i + 1][0] < v) i++;
    const [v0, c0] = stops[i];
    const [v1, c1] = stops[i + 1];
    const t = v1 === v0 ? 0 : (v - v0) / (v1 - v0);
    x.fillStyle = mix(c0, c1, Math.max(0, Math.min(1, t)));
    x.fillRect(0, y, W, 1);
  }
}

/**
 * The turbulence that keeps banding from looking like a barcode: long, flat,
 * translucent streaks smeared along the bands. Wrapped copies are drawn either
 * side of the seam so a streak crossing u=0 does not get sliced in half.
 */
function turbulence(
  x: CanvasRenderingContext2D,
  seed: number,
  count: number,
  spread: number,
  alpha: number,
) {
  const rnd = rngFor(seed);
  for (let i = 0; i < count; i++) {
    const cx = rnd() * W;
    const cy = rnd() * H;
    const rx = 14 + rnd() * spread;
    const ry = 1.5 + rnd() * 4;
    const light = rnd() < 0.5;
    x.globalAlpha = alpha * (0.4 + rnd() * 0.6);
    x.fillStyle = light ? '#ffffff' : '#000000';
    for (const off of [-W, 0, W]) {
      x.beginPath();
      x.ellipse(cx + off, cy, rx, ry, 0, 0, Math.PI * 2);
      x.fill();
    }
  }
  x.globalAlpha = 1;
}

/** darken the top and bottom rows — every real planet's poles fall away */
function polarShade(x: CanvasRenderingContext2D, strength = 0.35) {
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgba(0,0,0,${strength})`);
  g.addColorStop(0.22, 'rgba(0,0,0,0)');
  g.addColorStop(0.78, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
}

/** fine grain, so nothing reads as a flat vector fill under a close eye */
function grain(x: CanvasRenderingContext2D, seed: number, alpha = 0.05) {
  const rnd = rngFor(seed);
  for (let i = 0; i < 5000; i++) {
    x.globalAlpha = alpha * rnd();
    x.fillStyle = rnd() < 0.5 ? '#ffffff' : '#000000';
    x.fillRect(rnd() * W, rnd() * H, 1.5, 1.5);
  }
  x.globalAlpha = 1;
}

/** impact cratering: a dark floor, a lit rim, a shadowed one */
function craters(x: CanvasRenderingContext2D, seed: number, count: number, maxR: number) {
  const rnd = rngFor(seed);
  for (let i = 0; i < count; i++) {
    const cx = rnd() * W;
    const cy = 12 + rnd() * (H - 24);
    // craters near the poles are squeezed by the projection, so shrink them
    const squash = Math.sin((cy / H) * Math.PI);
    const r = (2 + rnd() * maxR) * (0.4 + squash * 0.6);
    for (const off of [-W, 0, W]) {
      x.globalAlpha = 0.28;
      x.fillStyle = '#000000';
      x.beginPath();
      x.ellipse(cx + off, cy, r, r * squash, 0, 0, Math.PI * 2);
      x.fill();
      x.globalAlpha = 0.4;
      x.strokeStyle = '#ffffff';
      x.lineWidth = Math.max(0.6, r * 0.18);
      x.beginPath();
      x.ellipse(cx + off, cy - r * 0.12, r, r * squash, 0, Math.PI * 0.9, Math.PI * 2.1);
      x.stroke();
    }
  }
  x.globalAlpha = 1;
}

/** an anticyclone — Jupiter's red spot, Neptune's dark one */
function storm(
  x: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  core: string,
  edge: string,
) {
  for (const off of [-W, 0, W]) {
    const g = x.createRadialGradient(cx + off, cy, 0, cx + off, cy, rx);
    g.addColorStop(0, core);
    g.addColorStop(0.6, edge);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.save();
    x.translate(cx + off, cy);
    x.scale(1, ry / rx);
    x.beginPath();
    x.arc(0, 0, rx, 0, Math.PI * 2);
    x.fill();
    x.restore();
  }
}

/** soft white ice at one pole, ragged at its edge */
function iceCap(x: CanvasRenderingContext2D, north: boolean, depth: number, seed: number) {
  const rnd = rngFor(seed);
  const edge = north ? depth : H - depth;
  const g = north
    ? x.createLinearGradient(0, 0, 0, edge)
    : x.createLinearGradient(0, H, 0, edge);
  g.addColorStop(0, 'rgba(255,252,246,0.95)');
  g.addColorStop(0.6, 'rgba(250,246,240,0.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, north ? 0 : edge, W, depth);
  // ragged tongues reaching out of the cap, so the edge is not a ruled line
  x.globalAlpha = 0.5;
  x.fillStyle = '#fbf7f0';
  for (let i = 0; i < 26; i++) {
    const cx = rnd() * W;
    x.beginPath();
    x.ellipse(cx, edge, 6 + rnd() * 22, 3 + rnd() * 9, 0, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
}

/* ————— the bodies, one baker each ————— */

const BAKERS: Record<string, () => CanvasRenderingContext2D> = {
  // burnt, airless, and hammered flat by four billion years of impacts
  Mercury: () => {
    const x = ctx2d();
    bandGround(x, [
      [0, '#5f594f'],
      [0.5, '#847d71'],
      [1, '#5a544b'],
    ]);
    turbulence(x, 31, 90, 60, 0.08);
    craters(x, 17, 150, 13);
    grain(x, 5, 0.09);
    polarShade(x, 0.3);
    return x;
  },
  // a featureless cream lid of cloud; only the sulphuric swirls break it up
  Venus: () => {
    const x = ctx2d();
    bandGround(x, [
      [0, '#c9ab74'],
      [0.3, '#e8d3a4'],
      [0.5, '#f2e2be'],
      [0.7, '#e4cd9b'],
      [1, '#c2a46e'],
    ]);
    turbulence(x, 71, 220, 130, 0.1);
    // the long V-shaped cloud sweep the ultraviolet images are known for
    x.globalAlpha = 0.12;
    x.fillStyle = '#8a6c40';
    for (let i = 0; i < 7; i++) {
      x.save();
      x.translate((i / 7) * W, H / 2);
      x.rotate(0.22);
      x.beginPath();
      x.ellipse(0, 0, 90, 16, 0, 0, Math.PI * 2);
      x.fill();
      x.restore();
    }
    x.globalAlpha = 1;
    grain(x, 9, 0.04);
    polarShade(x, 0.28);
    return x;
  },
  // rust, dark volcanic plains, and ice at both poles
  Mars: () => {
    const x = ctx2d();
    bandGround(x, [
      [0, '#9e5535'],
      [0.35, '#c06a41'],
      [0.55, '#b35f38'],
      [0.75, '#a85832'],
      [1, '#8f4c2d'],
    ]);
    // the dark albedo features — Syrtis Major and its kin
    const rnd = rngFor(23);
    x.globalAlpha = 0.3;
    x.fillStyle = '#5d3722';
    for (let i = 0; i < 40; i++) {
      const cx = rnd() * W;
      const cy = 40 + rnd() * (H - 80);
      for (const off of [-W, 0, W]) {
        x.beginPath();
        x.ellipse(cx + off, cy, 10 + rnd() * 46, 6 + rnd() * 20, rnd() * Math.PI, 0, Math.PI * 2);
        x.fill();
      }
    }
    x.globalAlpha = 1;
    craters(x, 41, 60, 7);
    grain(x, 3, 0.06);
    iceCap(x, true, 20, 12);
    iceCap(x, false, 26, 13);
    polarShade(x, 0.2);
    return x;
  },
  // belts, zones, and the great red spot in the south tropical latitudes
  Jupiter: () => {
    const x = ctx2d();
    bandGround(x, [
      [0, '#8d7457'],
      [0.1, '#b39a76'],
      [0.2, '#d8c7a6'],
      [0.29, '#9c7248'],
      [0.38, '#efe3c8'],
      [0.46, '#b58a5c'],
      [0.54, '#f4ead2'],
      [0.63, '#a3714a'],
      [0.72, '#e3d2af'],
      [0.82, '#b9a07c'],
      [0.9, '#9a8161'],
      [1, '#7d6749'],
    ]);
    turbulence(x, 101, 340, 150, 0.14);
    storm(x, W * 0.62, H * 0.63, 34, 17, 'rgba(196,86,52,0.92)', 'rgba(168,92,60,0.5)');
    // the pale wake trailing the spot along its belt
    x.globalAlpha = 0.16;
    x.fillStyle = '#fff2d8';
    x.beginPath();
    x.ellipse(W * 0.48, H * 0.63, 62, 8, 0, 0, Math.PI * 2);
    x.fill();
    x.globalAlpha = 1;
    grain(x, 13, 0.035);
    polarShade(x, 0.42);
    return x;
  },
  // the same architecture as Jupiter, drained of contrast — Saturn is hazier
  Saturn: () => {
    const x = ctx2d();
    bandGround(x, [
      [0, '#9d8a63'],
      [0.14, '#c7b183'],
      [0.28, '#e8d7ab'],
      [0.4, '#d2bb8b'],
      [0.5, '#f0e3bd'],
      [0.62, '#dcc697'],
      [0.74, '#eadaae'],
      [0.88, '#c0a97c'],
      [1, '#96835e'],
    ]);
    turbulence(x, 211, 260, 170, 0.075);
    grain(x, 19, 0.03);
    polarShade(x, 0.4);
    return x;
  },
  // an almost blank pale-green disc; Voyager found nearly nothing on it
  Uranus: () => {
    const x = ctx2d();
    bandGround(x, [
      [0, '#a8d3d4'],
      [0.35, '#bfe2e0'],
      [0.5, '#c8e8e5'],
      [0.65, '#bcdfdd'],
      [1, '#9fc9cb'],
    ]);
    turbulence(x, 307, 120, 190, 0.045);
    grain(x, 23, 0.02);
    polarShade(x, 0.3);
    return x;
  },
  // deeper blue, faint belts, one dark storm and its bright companion cloud
  Neptune: () => {
    const x = ctx2d();
    bandGround(x, [
      [0, '#27407e'],
      [0.28, '#3a5ea8'],
      [0.44, '#4a75c0'],
      [0.56, '#4470b8'],
      [0.72, '#35589e'],
      [1, '#243a75'],
    ]);
    turbulence(x, 401, 190, 160, 0.09);
    storm(x, W * 0.34, H * 0.62, 26, 13, 'rgba(18,32,72,0.85)', 'rgba(26,44,92,0.4)');
    x.globalAlpha = 0.5;
    x.fillStyle = '#e8f2ff';
    for (const off of [-W, 0, W]) {
      x.beginPath();
      x.ellipse(W * 0.42 + off, H * 0.68, 22, 4, 0.1, 0, Math.PI * 2);
      x.fill();
      x.beginPath();
      x.ellipse(W * 0.72 + off, H * 0.4, 15, 3, -0.1, 0, Math.PI * 2);
      x.fill();
    }
    x.globalAlpha = 1;
    grain(x, 29, 0.03);
    polarShade(x, 0.35);
    return x;
  },
};

const cache = new Map<string, THREE.CanvasTexture>();

/**
 * The surface map for a body, baked on first ask and kept.
 *
 * The Earth is the one body not drawn from this module's impressions: it has
 * real Natural Earth coastline data in the repo, so it gets a true map from
 * globeTexture rather than an invented one. Everything else here is painted to
 * match that photograph-from-orbit register, so the eight sit together.
 */
export function planetMap(name: string): THREE.CanvasTexture | null {
  if (name === 'Earth') return earthMap();
  const hit = cache.get(name);
  if (hit) return hit;
  const baker = BAKERS[name];
  if (!baker) return null;
  const tex = finish(baker());
  cache.set(name, tex);
  return tex;
}

/* ————— the Sun ————— */

let sunCache: THREE.CanvasTexture | null = null;

/**
 * The Sun's photosphere: granulation cells, the darker lanes between them, and
 * a scatter of spots with their penumbrae. Drawn hot enough that it still
 * reads as a light source under a MeshBasicMaterial, which is what the Sun
 * wears — it is the one body on this chart that is not lit by something else.
 */
export function sunMap(): THREE.CanvasTexture {
  if (sunCache) return sunCache;
  const x = ctx2d();
  const rnd = rngFor(88);
  // a hot equatorial band fading to the cooler poles
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#f4881a');
  g.addColorStop(0.5, '#ffdb92');
  g.addColorStop(1, '#f4881a');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);

  // Granulation: bright convective cells over darker intergranular lanes.
  // Kept FAINT and fine. Two earlier passes read as popcorn and then as a golf
  // ball, which is the wrong target — the Sun is far too bright for an eye to
  // resolve any surface at all, so the granulation's whole job is a shimmer
  // under the glare, not a pattern you can pick features out of.
  for (let i = 0; i < 5200; i++) {
    const cx = rnd() * W;
    const cy = rnd() * H;
    const r = 1 + rnd() * 3.4;
    x.globalAlpha = 0.05 + rnd() * 0.13;
    x.fillStyle = rnd() < 0.62 ? '#fffaea' : '#e07a18';
    for (const off of [-W, 0, W]) {
      x.beginPath();
      x.ellipse(cx + off, cy, r, r * 0.85, 0, 0, Math.PI * 2);
      x.fill();
    }
  }
  x.globalAlpha = 1;

  // brighter faculae, in the same belts the spots keep to
  for (let i = 0; i < 90; i++) {
    const cx = rnd() * W;
    const cy = H * (rnd() < 0.5 ? 0.34 : 0.66) + (rnd() - 0.5) * H * 0.18;
    x.globalAlpha = 0.1 + rnd() * 0.16;
    x.fillStyle = '#fffbe8';
    for (const off of [-W, 0, W]) {
      x.beginPath();
      x.ellipse(cx + off, cy, 6 + rnd() * 22, 2 + rnd() * 5, 0, 0, Math.PI * 2);
      x.fill();
    }
  }
  x.globalAlpha = 1;

  // sunspots, which keep to the two activity belts either side of the equator.
  // Small: a spot big enough to see from across the rotunda is a blemish, and
  // the real ones are a fraction of a percent of the disc.
  for (let i = 0; i < 4; i++) {
    const cx = rnd() * W;
    const cy = H * (rnd() < 0.5 ? 0.36 : 0.64) + (rnd() - 0.5) * H * 0.1;
    const r = 2 + rnd() * 3;
    storm(x, cx, cy, r * 2.6, r * 1.8, 'rgba(150,64,8,0.4)', 'rgba(220,120,30,0.18)');
    x.globalAlpha = 0.5;
    x.fillStyle = '#7a3206';
    for (const off of [-W, 0, W]) {
      x.beginPath();
      x.ellipse(cx + off, cy, r, r * 0.72, 0, 0, Math.PI * 2);
      x.fill();
    }
    x.globalAlpha = 1;
  }
  grain(x, 37, 0.05);

  sunCache = finish(x);
  return sunCache;
}

/* ————— Saturn's rings ————— */

/** ring boundaries in Saturn radii, matching SATURN_RING's 1.11 → 2.27 span */
const RING_ZONES: [number, number, number, string][] = [
  // [inner, outer, opacity, colour]
  [1.11, 1.24, 0.1, '#8d8175'], // D — barely there
  [1.24, 1.53, 0.32, '#a2937f'], // C, the crêpe ring
  [1.53, 1.95, 0.92, '#e8d8b4'], // B, the bright one
  [1.95, 2.025, 0.06, '#6b6055'], // the Cassini division
  [2.025, 2.214, 0.62, '#d3c1a0'], // A
  [2.214, 2.229, 0.05, '#6b6055'], // the Encke gap
  [2.229, 2.27, 0.5, '#c9b795'], // A, outside Encke
];

let ringCache: THREE.CanvasTexture | null = null;

/**
 * The ring plane as a radial strip: u runs from the D ring's inner edge to the
 * A ring's outer edge. A flat translucent disc read as a plastic washer; the
 * divisions and the brightness step at the B ring are what make it Saturn.
 */
export function saturnRingMap(): THREE.CanvasTexture {
  if (ringCache) return ringCache;
  const RW = 512;
  const RH = 4;
  const c = document.createElement('canvas');
  c.width = RW;
  c.height = RH;
  const x = c.getContext('2d')!;
  const inner = RING_ZONES[0][0];
  const span = RING_ZONES[RING_ZONES.length - 1][1] - inner;
  const rnd = rngFor(67);
  for (let px = 0; px < RW; px++) {
    const r = inner + (px / (RW - 1)) * span;
    const zone = RING_ZONES.find((z) => r >= z[0] && r <= z[1]) ?? RING_ZONES[0];
    // the ringlets: every zone is really hundreds of finer bands
    const ripple = 0.82 + 0.18 * Math.sin(r * 190 + rnd() * 0.6);
    x.globalAlpha = Math.min(1, zone[2] * ripple);
    x.fillStyle = zone[3];
    x.fillRect(px, 0, 1, RH);
  }
  x.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  ringCache = t;
  return t;
}

/* ————— the labels ————— */

/**
 * An instrument names its parts. Each body carries its planetary seal over its
 * name in gold, engraved-plate style, so the chart can be read by someone who
 * does not already know which pale dot is Uranus — and so it is obvious that
 * the bodies are things you are meant to touch.
 *
 * Baked at 512×320 for a sprite about 0.19 units tall: at the scale a visitor
 * leaning on the rim actually sees it, anything smaller downsamples the name
 * into an illegible gold smudge, which is worse than no label at all.
 */
const labelCache = new Map<string, { tex: THREE.CanvasTexture; aspect: number }>();

export function planetLabel(name: string): { tex: THREE.CanvasTexture; aspect: number } {
  const hit = labelCache.get(name);
  if (hit) return hit;
  const CW = 512;
  const CH = 320;
  const c = document.createElement('canvas');
  c.width = CW;
  c.height = CH;
  const x = c.getContext('2d')!;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  // the seals sit against a dark night chart and a bright globe by turns, so
  // they carry their own shadow rather than trusting either background
  x.shadowColor = 'rgba(0,0,0,0.9)';
  x.shadowBlur = 16;
  x.fillStyle = '#ffe9b4';
  x.font = '170px "Segoe UI Symbol", "Arial Unicode MS", serif';
  // U+FE0E pins the TEXT presentation, or macOS swaps in a colour-emoji tile
  x.fillText((PLANET_LORE[name]?.glyph ?? '') + '︎', CW / 2, 112);
  x.fillStyle = '#efdcae';
  x.font = '62px "Cormorant Garamond", Georgia, serif';
  x.fillText(name.toUpperCase(), CW / 2, 254);
  // a hairline rule under the name, the way an engraved plate is finished
  x.shadowBlur = 0;
  x.globalAlpha = 0.55;
  x.strokeStyle = '#d8bd7c';
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(CW / 2 - 92, 292);
  x.lineTo(CW / 2 + 92, 292);
  x.stroke();
  x.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const made = { tex, aspect: CW / CH };
  labelCache.set(name, made);
  return made;
}

/**
 * A ring disc whose UVs run RADIALLY, which RingGeometry's own do not — its
 * default mapping is planar over the bounding box, which would smear the
 * divisions into arcs. u = fraction of the way from the inner edge out.
 */
export function saturnRingGeometry(inner: number, outer: number): THREE.RingGeometry {
  const g = new THREE.RingGeometry(inner, outer, 128, 1);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  uv.needsUpdate = true;
  return g;
}
