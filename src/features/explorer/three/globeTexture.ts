import * as THREE from 'three';
import { texPx } from './textureBudget';
import { mulberry32 } from '../../../domain/random';
import { LAND, LAKES, type Ring } from '../../../data/coastlines';
import { ZODIAC } from '../../../data/astrology';
import { FIGURES } from './ZodiacDome';

/**
 * The Earth's skin for the great orrery, painted at runtime like every other
 * surface in the library — but this one is drawn from real Natural Earth
 * coastlines, so the continents are where they actually are.
 *
 * The map is equirectangular (plate carrée): longitude runs linearly across
 * the canvas, latitude linearly down it. That is exactly the projection
 * THREE.SphereGeometry expects from its UVs, so the paint wraps onto the
 * sphere without any resampling — every point lands on its true parallel and
 * meridian.
 *
 * The styling is the view from space, matching the orrery's other seven bodies
 * (see planetTexture): deep ocean, a continental shelf paling toward every
 * coast, land coloured by its latitude band — taiga, temperate green, the two
 * desert belts astride the tropics, equatorial forest — ice at both caps, and
 * a thin scatter of cloud. It replaced an 18th-century parchment-globe
 * treatment, which was correct as a library prop but read as a different
 * object from the planets sharing the chart with it.
 */

/** where a longitude/latitude falls on an equirectangular canvas */
const px = (lon: number, w: number) => ((lon + 180) / 360) * w;
const py = (lat: number, h: number) => ((90 - lat) / 180) * h;

/** trace one ring's path, splitting it where it wraps the date line.
 *  A ring that crosses ±180° arrives as a jump of nearly a full canvas width;
 *  drawn naively it smears a bogus streak straight across the map, so each
 *  crossing starts a fresh subpath.
 *
 *  Antarctica is the exception, and the only ring in this data that wraps at
 *  all: it closes along the pole itself, (180, −90) → (−180, −90). That edge
 *  is not a wrap to be hidden, it IS the bottom border of the map, and
 *  splitting there would break the continent into two subpaths that no longer
 *  fill as one. So a jump between two polar points is drawn straight through. */
function tracePath(ctx: CanvasRenderingContext2D, ring: Ring, w: number, h: number) {
  let prevLon = ring[0];
  let prevLat = ring[1];
  let open = false;
  for (let i = 0; i < ring.length; i += 2) {
    const lon = ring[i];
    const lat = ring[i + 1];
    const atPole = Math.abs(lat) > 89.5 && Math.abs(prevLat) > 89.5;
    const wrapped = Math.abs(lon - prevLon) > 180 && !atPole;
    if (!open || wrapped) {
      ctx.moveTo(px(lon, w), py(lat, h));
      open = true;
    } else {
      ctx.lineTo(px(lon, w), py(lat, h));
    }
    prevLon = lon;
    prevLat = lat;
  }
}

function landPath(ctx: CanvasRenderingContext2D, rings: readonly Ring[], w: number, h: number) {
  ctx.beginPath();
  for (const ring of rings) {
    tracePath(ctx, ring, w, h);
    ctx.closePath();
  }
}

function fillRings(
  ctx: CanvasRenderingContext2D,
  rings: readonly Ring[],
  w: number,
  h: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  landPath(ctx, rings, w, h);
  ctx.fill();
}

function strokeRings(
  ctx: CanvasRenderingContext2D,
  rings: readonly Ring[],
  w: number,
  h: number,
  stroke: string,
  width: number,
  alpha = 1,
) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.lineJoin = 'round';
  landPath(ctx, rings, w, h);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** the biome bands, north pole to south: [latitude, colour]. Land is tinted by
 *  where it lies, which is what makes a small Earth read as Earth — the Sahara
 *  and Arabian belt and their southern twin are the features the eye finds
 *  first after the coastline itself. */
const BIOMES: [number, string][] = [
  [90, '#e8eef2'], // polar ice
  [72, '#cfd8d4'], // ice edge
  [64, '#6d7f68'], // tundra
  [52, '#3f5c37'], // taiga
  [38, '#4a6d34'], // temperate
  [30, '#8f8047'], // steppe, fading to desert
  [22, '#b9a067'], // the northern desert belt
  [14, '#7d8a45'], // sahel
  [4, '#33642c'], // equatorial forest
  [-8, '#356a2d'],
  [-18, '#7b8842'],
  [-26, '#b09a63'], // the southern desert belt
  [-36, '#5e7038'],
  [-50, '#4a6437'],
  [-62, '#8fa08c'],
  [-72, '#cfd8d4'],
  [-90, '#e8eef2'],
];

let cached: THREE.CanvasTexture | null = null;

/** the equirectangular map, painted once and shared */
export function earthMap(): THREE.CanvasTexture {
  if (cached) return cached;
  // 2:1 is the equirectangular aspect. The Earth is a 5 cm sphere on the
  // chart, so this is far more resolution than it needs at rest — but the
  // body swells on hover, and the coastlines are the whole point.
  const W = texPx(2048);
  const H = texPx(1024);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rng = mulberry32(1492);

  // — the deep ocean, with slow variation so it is never flat paint —
  x.fillStyle = '#0d2f5c';
  x.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    const cx = rng() * W;
    const cy = rng() * H;
    const r = 40 + rng() * 260;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(40,110,180,${0.05 + rng() * 0.09})`);
    g.addColorStop(1, 'rgba(40,110,180,0)');
    x.fillStyle = g;
    x.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // — the continental shelf: a pale halo just OUTSIDE every coast. Drawn
  //   before the land so the land covers its inner half, leaving the shallows
  //   showing only in the water where they belong. —
  strokeRings(x, LAND, W, H, '#2f7ab4', 16, 0.5);
  strokeRings(x, LAND, W, H, '#3d93c9', 7, 0.45);

  // — the land, then its biome bands clipped inside the coastline —
  fillRings(x, LAND, W, H, '#4a6d34');
  x.save();
  landPath(x, LAND, W, H);
  x.clip();
  for (let i = 0; i < BIOMES.length - 1; i++) {
    const [lat0, c0] = BIOMES[i];
    const [lat1, c1] = BIOMES[i + 1];
    const y0 = py(lat0, H);
    const y1 = py(lat1, H);
    const g = x.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, c0);
    g.addColorStop(1, c1);
    x.fillStyle = g;
    x.fillRect(0, y0, W, y1 - y0 + 1);
  }
  // mottling, so no band reads as a ruled stripe across a continent
  for (let i = 0; i < 900; i++) {
    const cx = rng() * W;
    const cy = rng() * H;
    const r = 6 + rng() * 46;
    x.globalAlpha = 0.05 + rng() * 0.13;
    x.fillStyle = rng() < 0.5 ? '#2c4a22' : '#a8965f';
    x.beginPath();
    x.ellipse(cx, cy, r, r * (0.4 + rng() * 0.5), rng() * Math.PI, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
  x.restore();

  // — inland seas punched back out of the land —
  fillRings(x, LAKES, W, H, '#17436f');

  // — the ice caps, over land and sea alike: the Arctic is frozen ocean, so
  //   it cannot be painted as a biome band inside the coastline —
  for (const north of [true, false]) {
    const depth = north ? H * 0.06 : H * 0.075;
    const edge = north ? depth : H - depth;
    const g = north
      ? x.createLinearGradient(0, 0, 0, edge)
      : x.createLinearGradient(0, H, 0, edge);
    g.addColorStop(0, 'rgba(244,249,252,0.97)');
    g.addColorStop(0.55, 'rgba(232,240,246,0.8)');
    g.addColorStop(1, 'rgba(232,240,246,0)');
    x.fillStyle = g;
    x.fillRect(0, north ? 0 : edge, W, depth);
    // pack ice reaching out of the cap, so the edge is not a ruled line
    x.globalAlpha = 0.55;
    x.fillStyle = '#eef4f8';
    for (let i = 0; i < 40; i++) {
      x.beginPath();
      x.ellipse(rng() * W, edge, 10 + rng() * 60, 4 + rng() * 16, 0, 0, Math.PI * 2);
      x.fill();
    }
    x.globalAlpha = 1;
  }

  // — weather: cloud drawn in latitude-parallel streaks, heaviest along the
  //   equatorial convergence and the two temperate storm belts —
  const CLOUD_BANDS = [0, 0, 12, -12, 45, -45, 58, -58, 30, -30];
  x.fillStyle = '#ffffff';
  for (const band of CLOUD_BANDS) {
    for (let i = 0; i < 30; i++) {
      const cy = py(band + (rng() - 0.5) * 16, H);
      const cx = rng() * W;
      const rx = 18 + rng() * 90;
      const ry = 4 + rng() * 14;
      x.globalAlpha = 0.1 + rng() * 0.22;
      // wrapped copies, so a cloud crossing the date line is not sliced
      for (const off of [-W, 0, W]) {
        x.beginPath();
        x.ellipse(cx + off, cy, rx, ry, 0, 0, Math.PI * 2);
        x.fill();
      }
    }
  }
  x.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  // the seam meets at the date line; wrapping across it keeps it invisible
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  cached = tex;
  return tex;
}

/** drop the shared map — only for teardown in tests */
export function disposeEarthMap() {
  cached?.dispose();
  cached = null;
}

/* ————— the pair of library globes by the Librarian —————
 *
 * A terrestrial globe and a celestial one, on matching stands. The pairing is
 * not decoration: two globes, one of the earth and one of the heavens, stand on
 * the pillars of nearly every Masonic tracing board and lodge room in the
 * period this library covers — the earth and the starry heavens, the whole
 * extent of a mason's study.
 *
 * Both are drawn as ENGRAVED antiques rather than in the view-from-space
 * register the orrery's planets use. That difference is deliberate and it is
 * the whole reason the orrery's Earth stopped being a parchment globe: these
 * are period instruments standing in a library, and they should look made,
 * where the bodies on the chart table should look observed.
 */

// Deeper than a real antique globe's wash would be on paper. Under the apse's
// warm lamps the historically-pale sage ocean (#a9b8ae) and cream land came
// back off the sphere as an almost white ball with a faint smudge of coast on
// it — accurate to the reference and useless in the room. These values put the
// map back in the same value range as the oak and brass around it.
const PARCHMENT = '#c9b184';
const OCEAN = '#75887f';
const LAND_FILL = '#b79a66';
const INK = '#3b2a19';

/** the ruled lines an antique globe carries, at their true latitudes */
const PARALLELS: { lat: number; label: string; heavy: boolean }[] = [
  { lat: 66.56, label: 'ARCTIC CIRCLE', heavy: false },
  { lat: 23.44, label: 'TROPIC OF CANCER', heavy: false },
  { lat: 0, label: 'ÆQUATOR', heavy: true },
  { lat: -23.44, label: 'TROPIC OF CAPRICORN', heavy: false },
  { lat: -66.56, label: 'ANTARCTIC CIRCLE', heavy: false },
];

/** engraved names, placed at real coordinates so they sit on their landmass */
const LEGENDS: { lon: number; lat: number; text: string; size: number; ocean?: boolean }[] = [
  { lon: -100, lat: 45, text: 'AMERICA', size: 34 },
  { lon: -58, lat: -12, text: 'AMERICA', size: 34 },
  { lon: -58, lat: -19, text: 'MERIDIONALIS', size: 22 },
  { lon: 18, lat: 8, text: 'AFRICA', size: 34 },
  { lon: 22, lat: 50, text: 'EUROPA', size: 26 },
  { lon: 92, lat: 47, text: 'ASIA', size: 34 },
  { lon: 134, lat: -25, text: 'NOVA HOLLANDIA', size: 22 },
  { lon: 0, lat: -84, text: 'TERRA AUSTRALIS', size: 24 },
  { lon: -40, lat: 22, text: 'MARE ATLANTICUM', size: 22, ocean: true },
  { lon: -150, lat: 5, text: 'MARE PACIFICUM', size: 22, ocean: true },
  { lon: 75, lat: -30, text: 'MARE INDICUM', size: 22, ocean: true },
];

let terrestrialCache: THREE.CanvasTexture | null = null;

/** the terrestrial globe's skin: sized parchment, sepia land, inked coasts */
export function terrestrialGlobeMap(): THREE.CanvasTexture {
  if (terrestrialCache) return terrestrialCache;
  const W = texPx(2048);
  const H = texPx(1024);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rng = mulberry32(1492);

  // sized parchment, then the ocean wash over it
  x.fillStyle = PARCHMENT;
  x.fillRect(0, 0, W, H);
  x.fillStyle = OCEAN;
  x.fillRect(0, 0, W, H);

  // a faint swell in the ocean wash so it does not read as flat paint
  for (let i = 0; i < 220; i++) {
    const cx = rng() * W;
    const cy = rng() * H;
    const r = 30 + rng() * 170;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(255,246,222,0.05)');
    g.addColorStop(1, 'rgba(255,246,222,0)');
    x.fillStyle = g;
    x.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // the graticule, ruled every 15° beneath the land so the coasts sit on top
  x.strokeStyle = INK;
  x.globalAlpha = 0.16;
  x.lineWidth = 1;
  x.beginPath();
  for (let lon = -180; lon <= 180; lon += 15) {
    x.moveTo(px(lon, W), 0);
    x.lineTo(px(lon, W), H);
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    x.moveTo(0, py(lat, H));
    x.lineTo(W, py(lat, H));
  }
  x.stroke();
  x.globalAlpha = 1;

  // the continents: aged sepia, with the inland seas punched back out
  fillRings(x, LAND, W, H, LAND_FILL);
  fillRings(x, LAKES, W, H, OCEAN);

  // a soft shadow just inside each coast, the way an engraver hatches a shore
  x.save();
  landPath(x, LAND, W, H);
  x.clip();
  strokeRings(x, LAND, W, H, '#8d7448', 5, 0.55);
  x.restore();

  // the inked coastline itself
  strokeRings(x, LAND, W, H, INK, 1.4);
  strokeRings(x, LAKES, W, H, INK, 0.9, 0.7);

  // the named parallels, ruled and lettered
  for (const p of PARALLELS) {
    const y = py(p.lat, H);
    x.strokeStyle = INK;
    x.globalAlpha = p.heavy ? 0.62 : 0.4;
    x.lineWidth = p.heavy ? 2 : 1.2;
    if (!p.heavy) x.setLineDash([9, 7]);
    x.beginPath();
    x.moveTo(0, y);
    x.lineTo(W, y);
    x.stroke();
    x.setLineDash([]);
    x.globalAlpha = 0.5;
    x.fillStyle = INK;
    x.font = `${p.heavy ? 17 : 13}px Georgia, "Times New Roman", serif`;
    x.textAlign = 'center';
    x.textBaseline = 'bottom';
    // lettered twice, a half-turn apart, so a name faces you from either side
    x.fillText(p.label, W * 0.25, y - 5);
    x.fillText(p.label, W * 0.75, y - 5);
    x.globalAlpha = 1;
  }

  // engraved names, letter-spaced the way a copperplate cartouche sets them
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  for (const l of LEGENDS) {
    x.font = `${l.size * 0.5}px Georgia, "Times New Roman", serif`;
    x.fillStyle = l.ocean ? '#5d6b62' : INK;
    x.globalAlpha = l.ocean ? 0.5 : 0.66;
    x.fillText(l.text.split('').join(' '), px(l.lon, W), py(l.lat, H));
    x.globalAlpha = 1;
  }

  // age: foxing blooms, and a vignette toward the poles where an old globe's
  // paper gores were pasted down and darkened first
  for (let i = 0; i < 300; i++) {
    const cx = rng() * W;
    const cy = rng() * H;
    const r = 4 + rng() * 23;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(120,86,44,${0.03 + rng() * 0.05})`);
    g.addColorStop(1, 'rgba(120,86,44,0)');
    x.fillStyle = g;
    x.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  const poles = x.createLinearGradient(0, 0, 0, H);
  poles.addColorStop(0, 'rgba(74,53,33,0.34)');
  poles.addColorStop(0.16, 'rgba(74,53,33,0)');
  poles.addColorStop(0.84, 'rgba(74,53,33,0)');
  poles.addColorStop(1, 'rgba(74,53,33,0.34)');
  x.fillStyle = poles;
  x.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  terrestrialCache = tex;
  return tex;
}

/** Earth's obliquity, which both globes are mounted at */
export const AXIAL_TILT = (23.44 * Math.PI) / 180;

let celestialCache: THREE.CanvasTexture | null = null;

/**
 * The celestial globe's skin: the twelve zodiac constellations strung along
 * the ecliptic, over a night ground.
 *
 * The ecliptic is drawn where it actually falls on an equirectangular sheet —
 * a sine wave swinging 23.44° either side of the celestial equator, since the
 * two great circles are inclined by exactly that. The constellations ride it
 * rather than sitting in a straight band, which is the whole difference
 * between a celestial globe and a decorative starfield: the signs are the
 * Sun's road, and on a globe you can see the road bend.
 */
export function celestialGlobeMap(): THREE.CanvasTexture {
  if (celestialCache) return celestialCache;
  const W = texPx(2048);
  const H = texPx(1024);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rng = mulberry32(2317);

  // the night ground, deepest at the poles
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0a0d1e');
  g.addColorStop(0.5, '#182248');
  g.addColorStop(1, '#0a0d1e');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);

  // the general field of stars
  for (let i = 0; i < 1400; i++) {
    const sx = rng() * W;
    const sy = rng() * H;
    x.globalAlpha = 0.15 + rng() * 0.55;
    x.fillStyle = rng() < 0.25 ? '#cfe0ff' : '#f6efd9';
    x.beginPath();
    x.arc(sx, sy, 0.6 + rng() * 1.4, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;

  /** where the ecliptic crosses this column of the sheet */
  const eclipticY = (canvasX: number) => {
    const lambda = (canvasX / W) * Math.PI * 2;
    const dec = Math.asin(Math.sin(AXIAL_TILT) * Math.sin(lambda));
    return ((Math.PI / 2 - dec) / Math.PI) * H;
  };

  // the celestial equator, ruled straight
  x.strokeStyle = '#9fb0d8';
  x.globalAlpha = 0.4;
  x.lineWidth = 1.6;
  x.beginPath();
  x.moveTo(0, H / 2);
  x.lineTo(W, H / 2);
  x.stroke();

  // the ecliptic band, and the ecliptic itself ruled down its middle
  x.globalAlpha = 0.1;
  x.fillStyle = '#c9a648';
  x.beginPath();
  for (let sx = 0; sx <= W; sx += 4) x.lineTo(sx, eclipticY(sx) - H * 0.075);
  for (let sx = W; sx >= 0; sx -= 4) x.lineTo(sx, eclipticY(sx) + H * 0.075);
  x.closePath();
  x.fill();
  x.globalAlpha = 0.75;
  x.strokeStyle = '#e0c074';
  x.lineWidth = 2;
  x.beginPath();
  for (let sx = 0; sx <= W; sx += 4) x.lineTo(sx, eclipticY(sx));
  x.stroke();
  x.globalAlpha = 1;

  // the twelve figures, each in its own 30° of ecliptic longitude
  FIGURES.forEach((fig, i) => {
    const sectorW = W / 12;
    const at = (s: [number, number, number]) => {
      const sx = (i + s[0]) * sectorW;
      return [sx, eclipticY(sx) + (s[1] - 0.5) * H * 0.2] as const;
    };
    // the joining lines first, so the stars sit on top of them
    x.strokeStyle = '#8fa6d8';
    x.globalAlpha = 0.5;
    x.lineWidth = 1.2;
    x.beginPath();
    for (const [a, b] of fig.lines) {
      const p0 = at(fig.stars[a]);
      const p1 = at(fig.stars[b]);
      x.moveTo(p0[0], p0[1]);
      x.lineTo(p1[0], p1[1]);
    }
    x.stroke();
    // the stars, sized by their drawn magnitude
    for (const s of fig.stars) {
      const [sx, sy] = at(s);
      x.globalAlpha = 0.95;
      x.fillStyle = '#fffaea';
      x.beginPath();
      x.arc(sx, sy, s[2] * 1.15, 0, Math.PI * 2);
      x.fill();
      x.globalAlpha = 0.28;
      x.beginPath();
      x.arc(sx, sy, s[2] * 2.8, 0, Math.PI * 2);
      x.fill();
    }
    // and the sign's seal, set below its figure on the band
    const midX = (i + 0.5) * sectorW;
    x.globalAlpha = 0.85;
    x.fillStyle = '#e8cf8e';
    x.font = '46px "Segoe UI Symbol", "Arial Unicode MS", serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    // U+FE0E pins the TEXT presentation, or macOS swaps in a colour-emoji tile
    x.fillText(ZODIAC[i].glyph + '︎', midX, eclipticY(midX) + H * 0.135);
    x.globalAlpha = 0.5;
    x.font = '20px Georgia, "Times New Roman", serif';
    x.fillText(ZODIAC[i].name.toUpperCase(), midX, eclipticY(midX) + H * 0.185);
    x.globalAlpha = 1;
  });

  // the poles, ruled and named the way a celestial globe marks them
  x.strokeStyle = '#9fb0d8';
  for (const [y, label] of [
    [H * 0.06, 'POLVS BOREALIS'],
    [H * 0.94, 'POLVS AVSTRALIS'],
  ] as [number, string][]) {
    x.globalAlpha = 0.3;
    x.lineWidth = 1.2;
    x.setLineDash([8, 8]);
    x.beginPath();
    x.moveTo(0, y);
    x.lineTo(W, y);
    x.stroke();
    x.setLineDash([]);
    x.globalAlpha = 0.45;
    x.fillStyle = '#b9c8e8';
    x.font = '19px Georgia, "Times New Roman", serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(label, W * 0.25, y - 16);
    x.fillText(label, W * 0.75, y - 16);
    x.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  celestialCache = tex;
  return tex;
}
