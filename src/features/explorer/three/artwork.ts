import * as THREE from 'three';
import { mulberry32 } from '../../../domain/random';

/**
 * The picture gallery: plates in the manner of old esoteric emblem books —
 * the cosmic man, the marriage of sun and moon, the world tree, the serpent
 * and the cup, the celestial vault. Ink and gold on toned paper, painted at
 * runtime, hung in gilt frames around the rotunda.
 */

const W = 340;
const H = 430;
const INK = '#2e2418';
const GOLD = '#a8842f';
const cache = new Map<string, THREE.CanvasTexture>();

/** load a real bundled image (public-domain art) as an sRGB texture, cached */
const imgCache = new Map<string, THREE.Texture>();
export function getImageTexture(path: string): THREE.Texture {
  let t = imgCache.get(path);
  if (!t) {
    t = new THREE.TextureLoader().load(path);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    imgCache.set(path, t);
  }
  return t;
}

type Plate = (ctx: CanvasRenderingContext2D) => void;

function paper(ctx: CanvasRenderingContext2D, seed: number) {
  const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, H * 0.7);
  g.addColorStop(0, '#e8d9b4');
  g.addColorStop(1, '#cdb888');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const rng = mulberry32(seed);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(110, 86, 48, ${0.04 + rng() * 0.05})`;
    ctx.beginPath();
    ctx.arc(rng() * W, rng() * H, 1 + rng() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(24, 24, W - 48, H - 48);
}

function caption(ctx: CanvasRenderingContext2D, text: string) {
  ctx.font = 'italic 600 17px Georgia, serif';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText(text, W / 2, H - 38);
}

/** the microcosmic man within the rings of heaven */
const cosmicMan: Plate = (ctx) => {
  const cx = W / 2;
  const cy = H / 2 - 16;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  for (const r of [128, 112]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // zodiac ticks
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 112, cy + Math.sin(a) * 112);
    ctx.lineTo(cx + Math.cos(a) * 128, cy + Math.sin(a) * 128);
    ctx.stroke();
  }
  // pentagram
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.4;
  const pts: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    pts.push([cx + Math.cos(a) * 104, cy + Math.sin(a) * 104]);
  }
  ctx.beginPath();
  ctx.moveTo(...pts[0]);
  [2, 4, 1, 3, 0].forEach((i) => ctx.lineTo(...pts[i]));
  ctx.closePath();
  ctx.stroke();
  // the figure
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy - 78, 16, 0, Math.PI * 2); // head
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 62);
  ctx.lineTo(cx, cy + 34); // torso
  ctx.moveTo(cx, cy - 40);
  ctx.lineTo(cx - 96, cy - 8); // arms to the star points
  ctx.moveTo(cx, cy - 40);
  ctx.lineTo(cx + 96, cy - 8);
  ctx.moveTo(cx, cy + 34);
  ctx.lineTo(cx - 62, cy + 96); // legs
  ctx.moveTo(cx, cy + 34);
  ctx.lineTo(cx + 62, cy + 96);
  ctx.stroke();
  caption(ctx, 'HOMO · MVNDVS · MINOR');
};

/** sol and luna over the chemical wedding */
const sunAndMoon: Plate = (ctx) => {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  // sun
  ctx.beginPath();
  ctx.arc(96, 120, 42, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(96 + Math.cos(a) * 48, 120 + Math.sin(a) * 48);
    ctx.lineTo(96 + Math.cos(a) * (i % 2 ? 60 : 68), 120 + Math.sin(a) * (i % 2 ? 60 : 68));
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(88, 114, 4, 0, Math.PI * 2);
  ctx.arc(108, 114, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(96, 126, 14, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // moon
  ctx.beginPath();
  ctx.arc(244, 120, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(258, 120, 36, Math.PI * 0.55, Math.PI * 1.45, true);
  ctx.stroke();
  // rays falling into the cup
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  for (const sx of [96, 244]) {
    ctx.beginPath();
    ctx.moveTo(sx, 168);
    ctx.quadraticCurveTo(sx, 230, W / 2, 268);
    ctx.stroke();
  }
  // the cup
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 42, 268);
  ctx.quadraticCurveTo(W / 2, 322, W / 2 + 42, 268);
  ctx.moveTo(W / 2, 300);
  ctx.lineTo(W / 2, 344);
  ctx.moveTo(W / 2 - 26, 352);
  ctx.lineTo(W / 2 + 26, 352);
  ctx.stroke();
  // stars
  ctx.fillStyle = GOLD;
  for (const [x, y] of [[60, 220], [280, 220], [170, 84], [50, 60], [290, 60]] as const) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
      ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * 7, y + Math.sin(a) * 7);
    }
    ctx.closePath();
    ctx.fill();
  }
  caption(ctx, 'CONIVNCTIO · SOLIS · ET · LVNAE');
};

/** the world tree with roots in the deep */
const worldTree: Plate = (ctx) => {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  const cx = W / 2;
  // trunk
  ctx.beginPath();
  ctx.moveTo(cx - 8, 300);
  ctx.quadraticCurveTo(cx - 4, 210, cx, 170);
  ctx.moveTo(cx + 8, 300);
  ctx.quadraticCurveTo(cx + 4, 210, cx, 170);
  ctx.stroke();
  // branches with fruit-circles
  ctx.lineWidth = 2.2;
  const fruits: [number, number][] = [];
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    const bx = cx + Math.cos(a) * (66 + (i % 2) * 26);
    const by = 150 + Math.sin(a) * 62 - 8;
    ctx.beginPath();
    ctx.moveTo(cx, 172);
    ctx.quadraticCurveTo((cx + bx) / 2, by - 34, bx, by);
    ctx.stroke();
    fruits.push([bx, by]);
  }
  ctx.strokeStyle = GOLD;
  for (const [x, y] of fruits) {
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  // roots
  ctx.strokeStyle = INK;
  for (const s of [-1, -0.4, 0.4, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 6, 300);
    ctx.quadraticCurveTo(cx + s * 40, 330, cx + s * 78, 356);
    ctx.stroke();
  }
  // ground line and the waters below
  ctx.beginPath();
  ctx.moveTo(50, 300);
  ctx.lineTo(W - 50, 300);
  ctx.stroke();
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(64, 322 + i * 14);
    for (let x = 64; x < W - 64; x += 16) {
      ctx.quadraticCurveTo(x + 4, 316 + i * 14, x + 16, 322 + i * 14);
    }
    ctx.stroke();
  }
  caption(ctx, 'ARBOR · IN · MEDIO · MVNDI');
};

/** the serpent and the cup of wisdom */
const serpentCup: Plate = (ctx) => {
  const cx = W / 2;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  // cup
  ctx.beginPath();
  ctx.moveTo(cx - 58, 120);
  ctx.quadraticCurveTo(cx, 196, cx + 58, 120);
  ctx.moveTo(cx, 160);
  ctx.lineTo(cx, 300);
  ctx.moveTo(cx - 40, 312);
  ctx.lineTo(cx + 40, 312);
  ctx.stroke();
  // serpent winding the stem
  ctx.lineWidth = 4;
  ctx.strokeStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx - 44, 296);
  for (let i = 0; i < 4; i++) {
    const y = 296 - i * 38;
    ctx.quadraticCurveTo(cx + (i % 2 ? -52 : 52), y - 19, cx + (i % 2 ? 30 : -30), y - 38);
  }
  ctx.stroke();
  // head over the rim
  ctx.beginPath();
  ctx.arc(cx - 30, 138, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx - 32, 136, 2.4, 0, Math.PI * 2);
  ctx.fill();
  // radiance from the bowl
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 66, 118 + Math.sin(a) * 46);
    ctx.lineTo(cx + Math.cos(a) * 92, 118 + Math.sin(a) * 70);
    ctx.stroke();
  }
  caption(ctx, 'POCVLVM · SAPIENTIAE');
};

/** the celestial vault */
const celestialVault: Plate = (ctx) => {
  const rng = mulberry32(99);
  const cx = W / 2;
  const cy = H / 2 - 14;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  for (const r of [132, 100, 66]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // ecliptic band
  ctx.beginPath();
  ctx.ellipse(cx, cy, 132, 44, -0.4, 0, Math.PI * 2);
  ctx.stroke();
  // scattered stars, some joined into constellations
  ctx.fillStyle = GOLD;
  const stars: [number, number][] = [];
  for (let i = 0; i < 26; i++) {
    const a = rng() * Math.PI * 2;
    const r = 20 + rng() * 118;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.92;
    stars.push([x, y]);
    ctx.beginPath();
    ctx.arc(x, y, 2.4 + rng() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    const a = stars[Math.floor(rng() * stars.length)];
    const b = stars[Math.floor(rng() * stars.length)];
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }
  // the earth at centre
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy);
  ctx.lineTo(cx + 12, cy);
  ctx.moveTo(cx, cy - 12);
  ctx.lineTo(cx, cy + 12);
  ctx.stroke();
  caption(ctx, 'SPHAERA · STELLARVM · FIXARVM');
};
export const PLATES: Plate[] = [cosmicMan, sunAndMoon, worldTree, serpentCup, celestialVault];

/* ————— figurehead portraits: the key figure of each tradition ————— */
export interface FigureheadSpec {
  name: string;
  dates: string;
  role: string;
  color: string;
  beard?: boolean;
  hat?: 'pointed' | 'cap' | 'none';
  seed: number;
}

/** an emblematic bust portrait in a gilt oval, name-plate below */
export function getFigureheadTexture(spec: FigureheadSpec): THREE.CanvasTexture {
  const key = `fig|${spec.name}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  paper(ctx, spec.seed);
  const cx = W / 2;
  const cy = 168;
  const skin = '#d9b892';
  const cloth = spec.color;

  // gilt oval
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 118, 138, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 112, 132, 0, 0, Math.PI * 2);
  ctx.clip();

  // toned backdrop within the oval
  const bg = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy, 150);
  bg.addColorStop(0, '#efe2c0');
  bg.addColorStop(1, '#c3ac7e');
  ctx.fillStyle = bg;
  ctx.fillRect(cx - 130, cy - 150, 260, 300);

  // faint halo of the tradition's colour
  ctx.fillStyle = cloth + '55';
  ctx.beginPath();
  ctx.arc(cx, cy - 26, 74, 0, Math.PI * 2);
  ctx.fill();

  // shoulders / robe
  ctx.fillStyle = cloth;
  ctx.beginPath();
  ctx.moveTo(cx - 96, cy + 150);
  ctx.quadraticCurveTo(cx - 70, cy + 34, cx, cy + 28);
  ctx.quadraticCurveTo(cx + 70, cy + 34, cx + 96, cy + 150);
  ctx.closePath();
  ctx.fill();
  // collar
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy + 40);
  ctx.lineTo(cx, cy + 92);
  ctx.lineTo(cx + 30, cy + 40);
  ctx.stroke();

  // neck + head
  ctx.fillStyle = skin;
  ctx.fillRect(cx - 16, cy + 6, 32, 34);
  ctx.beginPath();
  ctx.arc(cx, cy - 18, 42, 0, Math.PI * 2);
  ctx.fill();

  // hair / brow shadow
  ctx.fillStyle = 'rgba(60,44,28,0.55)';
  ctx.beginPath();
  ctx.arc(cx, cy - 26, 42, Math.PI * 1.05, Math.PI * 1.95);
  ctx.fill();

  // eyes + nose
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy - 20);
  ctx.lineTo(cx - 10, cy - 20);
  ctx.moveTo(cx + 10, cy - 20);
  ctx.lineTo(cx + 20, cy - 20);
  ctx.moveTo(cx, cy - 16);
  ctx.lineTo(cx - 4, cy - 2);
  ctx.lineTo(cx + 3, cy - 2);
  ctx.stroke();

  if (spec.beard) {
    ctx.fillStyle = '#e6ddce';
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy - 4);
    ctx.quadraticCurveTo(cx, cy + 78, cx + 30, cy - 4);
    ctx.quadraticCurveTo(cx, cy + 20, cx - 30, cy - 4);
    ctx.fill();
  }
  if (spec.hat === 'pointed') {
    ctx.fillStyle = cloth;
    ctx.beginPath();
    ctx.moveTo(cx - 46, cy - 44);
    ctx.lineTo(cx, cy - 150);
    ctx.lineTo(cx + 46, cy - 44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = GOLD;
    for (const [dx, dy] of [[-8, -84], [12, -110], [-2, -64]] as const) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (spec.hat === 'cap') {
    ctx.fillStyle = cloth;
    ctx.beginPath();
    ctx.arc(cx, cy - 40, 44, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 44, cy - 44, 88, 10);
  }
  ctx.restore();

  // name-plate
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = '700 24px Georgia, serif';
  const nm = spec.name.toUpperCase();
  ctx.fillText(nm.length > 18 ? nm.slice(0, 17) + '…' : nm, cx, 344);
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillStyle = '#5a4a30';
  ctx.fillText(spec.dates, cx, 368);
  ctx.font = '500 14px Georgia, serif';
  ctx.fillText(spec.role, cx, 392);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

export function getPlateTexture(index: number): THREE.CanvasTexture {
  const key = `plate|${index}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  paper(ctx, 300 + index * 13);
  PLATES[index % PLATES.length](ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}
