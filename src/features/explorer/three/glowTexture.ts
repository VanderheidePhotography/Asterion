import * as THREE from 'three';

let cached: THREE.CanvasTexture | null = null;

/** Shared soft radial glow sprite — one tiny canvas texture for every star in the museum. */
export function getGlowTexture(): THREE.CanvasTexture {
  if (cached) return cached;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  cached = new THREE.CanvasTexture(canvas);
  return cached;
}

let wash: THREE.CanvasTexture | null = null;

/**
 * The wash one candle throws up a wall behind it.
 *
 * A radial blob is the wrong shape for this and it is why the statue niches
 * read as flat: light from a small source close to a surface is not a circle,
 * it is a PLUME — narrow and very hot at the wick, spreading as it climbs,
 * fading out well before it reaches the top. It also has a hard-ish lower edge
 * (the stand's own shadow) and a soft upper one.
 *
 * Painted once, shared by all twenty washes in the building. Meant to be used
 * additively on a plane fixed to the wall, never on a billboard.
 */
export function candleWash(): THREE.CanvasTexture {
  if (wash) return wash;
  const W = 128;
  const H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  // The plume, built as a stack of horizontal gradient bands: each one wider
  // and dimmer than the last. `v` runs 0 at the wick (bottom) to 1 at the top.
  for (let i = 0; i < H; i++) {
    const y = H - 1 - i;
    const v = i / (H - 1);
    // spread: tight at the wick, opening out as it climbs
    const spread = 0.1 + 0.85 * Math.pow(v, 0.72);
    // Brightness: peaks just above the wick, then falls away.
    //
    // An ASYMMETRIC gaussian — tight below the flame, long above it — because
    // that is the shape of the thing. Written as a squared exponent rather than
    // a fractional `Math.pow`: `Math.pow(negative, 1.7)` is NaN, so the first
    // cut of this produced `rgba(255,255,255,NaN)` for every row below the wick
    // and took the entire canvas down with it.
    const d = v - 0.06;
    const s = d < 0 ? 0.055 : 0.34;
    const b = Math.exp(-((d / s) * (d / s))) * (1 - v * 0.85);
    if (b <= 0.002) continue;
    const g = ctx.createLinearGradient(W / 2 - (W / 2) * spread, 0, W / 2 + (W / 2) * spread, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, `rgba(255,255,255,${b.toFixed(3)})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, W, 1);
  }
  // the hot core right at the flame
  const core = ctx.createRadialGradient(W / 2, H - 14, 0, W / 2, H - 14, W * 0.3);
  core.addColorStop(0, 'rgba(255,255,255,0.85)');
  core.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, H - 90, W, 90);
  // the stand's own shadow cutting the plume off below the wick
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0, H - 8, W, 8);
  ctx.globalCompositeOperation = 'source-over';
  wash = new THREE.CanvasTexture(canvas);
  wash.colorSpace = THREE.SRGBColorSpace;
  return wash;
}
