import * as THREE from 'three';
import type { ClusterId } from '../../../domain/types';

/**
 * Hand-drawn glowing sigils — each tradition's emblem, painted in gold ink.
 * Square and compasses for the lodge, the rose cross for the brotherhood,
 * the tree of life for Kabbalah… every section wears its own sign.
 */

const SIZE = 256;
const C = SIZE / 2;
const cache = new Map<string, THREE.CanvasTexture>();

type Painter = (ctx: CanvasRenderingContext2D) => void;

function ring(ctx: CanvasRenderingContext2D, r: number, from = 0, to = Math.PI * 2) {
  ctx.beginPath();
  ctx.arc(C, C, r, from, to);
  ctx.stroke();
}

/** hermetica — the caduceus, wings and twin serpents */
const caduceus: Painter = (ctx) => {
  // staff
  ctx.beginPath();
  ctx.moveTo(C, 30);
  ctx.lineTo(C, 226);
  ctx.stroke();
  // orb
  ctx.beginPath();
  ctx.arc(C, 34, 10, 0, Math.PI * 2);
  ctx.stroke();
  // wings
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(C + s * 8, 52);
    ctx.quadraticCurveTo(C + s * 52, 26, C + s * 66, 54);
    ctx.quadraticCurveTo(C + s * 40, 58, C + s * 10, 64);
    ctx.stroke();
  }
  // twin serpents
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(C + s * 30, 78);
    for (let i = 0; i < 4; i++) {
      const y = 78 + i * 36;
      ctx.quadraticCurveTo(C + s * (i % 2 ? 34 : -34), y + 18, C + s * (i % 2 ? -28 : 28), y + 36);
    }
    ctx.stroke();
  }
};

/** alchemy — the ouroboros */
const ouroboros: Painter = (ctx) => {
  ring(ctx, 86, 0.32, Math.PI * 2 + 0.02);
  ctx.beginPath();
  ctx.moveTo(C + 78, C + 44);
  ctx.lineTo(C + 106, C + 20);
  ctx.lineTo(C + 66, C + 12);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(C + 84, C + 24, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // triangle of fire within
  ctx.beginPath();
  ctx.moveTo(C, C - 44);
  ctx.lineTo(C + 40, C + 28);
  ctx.lineTo(C - 40, C + 28);
  ctx.closePath();
  ctx.stroke();
};

/** kabbalah — the tree of life */
const treeOfLife: Painter = (ctx) => {
  const P: [number, number][] = [
    [128, 26], [180, 62], [76, 62], [180, 118], [76, 118],
    [128, 146], [180, 178], [76, 178], [128, 204], [128, 238],
  ];
  const paths = [
    [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [1, 5], [2, 5],
    [3, 5], [4, 5], [3, 6], [4, 7], [5, 6], [5, 7], [6, 7], [6, 8],
    [7, 8], [5, 8], [8, 9],
  ];
  for (const [a, b] of paths) {
    ctx.beginPath();
    ctx.moveTo(P[a][0], P[a][1]);
    ctx.lineTo(P[b][0], P[b][1]);
    ctx.stroke();
  }
  for (const [x, y] of P) {
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 13, 30, 0.9)';
    ctx.fill();
    ctx.stroke();
  }
};

/** renaissance magic — the pentagram of the microcosm */
const pentagram: Painter = (ctx) => {
  ring(ctx, 90);
  const pts: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    pts.push([C + Math.cos(a) * 78, C + Math.sin(a) * 78]);
  }
  ctx.beginPath();
  ctx.moveTo(...pts[0]);
  [2, 4, 1, 3, 0].forEach((i) => ctx.lineTo(...pts[i]));
  ctx.closePath();
  ctx.stroke();
  ring(ctx, 62);
};

/** rosicrucianism — the rose cross */
const roseCross: Painter = (ctx) => {
  ctx.strokeRect(C - 13, 36, 26, 184);
  ctx.strokeRect(52, C - 13, 152, 26);
  ring(ctx, 30);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    ctx.beginPath();
    ctx.arc(C + Math.cos(a) * 16, C + Math.sin(a) * 16, 9, 0, Math.PI * 2);
    ctx.stroke();
  }
};

/** freemasonry — square and compasses */
const squareAndCompasses: Painter = (ctx) => {
  ctx.beginPath();
  ctx.moveTo(C, 44);
  ctx.lineTo(C - 72, 208);
  ctx.moveTo(C, 44);
  ctx.lineTo(C + 72, 208);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(C, 48, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(C - 62, 148);
  ctx.lineTo(C, 206);
  ctx.lineTo(C + 62, 148);
  ctx.stroke();
  // the letter G
  ctx.font = '600 34px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('G', C, 132);
};

/** the occult revival — the radiant eye */
const radiantEye: Painter = (ctx) => {
  // triangle
  ctx.beginPath();
  ctx.moveTo(C, 44);
  ctx.lineTo(C + 82, 190);
  ctx.lineTo(C - 82, 190);
  ctx.closePath();
  ctx.stroke();
  // eye
  ctx.beginPath();
  ctx.moveTo(C - 42, 140);
  ctx.quadraticCurveTo(C, 106, C + 42, 140);
  ctx.quadraticCurveTo(C, 168, C - 42, 140);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(C, 139, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(C, 139, 4, 0, Math.PI * 2);
  ctx.fill();
  // rays
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI * 0.82 + (i / 8) * Math.PI * 0.64;
    ctx.beginPath();
    ctx.moveTo(C + Math.cos(a) * 96, 150 + Math.sin(a) * 96);
    ctx.lineTo(C + Math.cos(a) * 118, 150 + Math.sin(a) * 118);
    ctx.stroke();
  }
};

/** scholarship — the lamp of learning on an open book */
const lampOfLearning: Painter = (ctx) => {
  // open book
  ctx.beginPath();
  ctx.moveTo(C - 84, 190);
  ctx.quadraticCurveTo(C - 40, 172, C, 186);
  ctx.quadraticCurveTo(C + 40, 172, C + 84, 190);
  ctx.lineTo(C + 84, 206);
  ctx.quadraticCurveTo(C + 40, 190, C, 202);
  ctx.quadraticCurveTo(C - 40, 190, C - 84, 206);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(C, 186);
  ctx.lineTo(C, 202);
  ctx.stroke();
  // lamp
  ctx.beginPath();
  ctx.ellipse(C, 156, 34, 16, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(C + 30, 150);
  ctx.quadraticCurveTo(C + 52, 146, C + 56, 136);
  ctx.stroke();
  // flame
  ctx.beginPath();
  ctx.moveTo(C + 56, 134);
  ctx.quadraticCurveTo(C + 64, 118, C + 56, 104);
  ctx.quadraticCurveTo(C + 50, 118, C + 56, 134);
  ctx.stroke();
  // rays of the flame
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.4;
    ctx.beginPath();
    ctx.moveTo(C + 56 + Math.cos(a) * 26, 112 + Math.sin(a) * 26);
    ctx.lineTo(C + 56 + Math.cos(a) * 40, 112 + Math.sin(a) * 40);
    ctx.stroke();
  }
};

const PAINTERS: Record<ClusterId, Painter> = {
  hermetica: caduceus,
  alchemy: ouroboros,
  kabbalah: treeOfLife,
  renaissance: pentagram,
  'early-modern': roseCross,
  freemasonry: squareAndCompasses,
  'occult-revival': radiantEye,
  scholarship: lampOfLearning,
};

export function getSigilTexture(cluster: ClusterId, color = '#ffd9a0'): THREE.CanvasTexture {
  const key = `${cluster}|${color}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 13;
  PAINTERS[cluster](ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, texture);
  return texture;
}
