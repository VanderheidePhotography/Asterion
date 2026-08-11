import * as THREE from 'three';
import { mulberry32 } from '../../../domain/random';
import { texPx } from './textureBudget';

/**
 * The texture workshop. Every surface in the library — planked floors,
 * wainscot walls, timber beams, patterned rugs, stone, leather, gilt
 * spines, stained glass — is painted here on canvases at runtime.
 * Deterministic, cached, zero downloads.
 */

const cache = new Map<string, THREE.CanvasTexture>();

/** clone a cached texture with its own repeat — the image is shared */
export function tiled(tex: THREE.CanvasTexture, rx: number, ry: number): THREE.Texture {
  const t = tex.clone();
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return t;
}

/**
 * Bake a canvas once and keep it. Exported as `makeTexture` because the
 * Cosmographia's floor art (cosmographiaArt.ts) is painted in its own module
 * but must share THIS cache — a second cache would bake the 4K mandala twice.
 */
export function makeTexture(
  key: string,
  size: [number, number],
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat = true,
): THREE.CanvasTexture {
  return make(key, size, paint, repeat);
}

function make(
  key: string,
  size: [number, number],
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat = true,
): THREE.CanvasTexture {
  const hit = cache.get(key);
  if (hit) return hit;
  // painted smaller on a phone — see textureBudget. The painter is handed the
  // scaled dimensions rather than the nominal ones, so everything it draws is
  // laid out in the canvas it actually has; nothing needs to know the scale.
  const w = texPx(size[0]);
  const h = texPx(size[1]);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  paint(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  cache.set(key, tex);
  return tex;
}

export function shade(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amount);
  return `#${c.getHexString()}`;
}

/** wavy grain streaks over a plank area */
function grain(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
  dark: string,
  count: number,
) {
  for (let i = 0; i < count; i++) {
    const gy = y + rng() * h;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.quadraticCurveTo(x + w * 0.5, gy + (rng() - 0.5) * h * 0.5, x + w, gy + (rng() - 0.5) * 4);
    ctx.strokeStyle = dark;
    ctx.globalAlpha = 0.10 + rng() * 0.12;
    ctx.lineWidth = 0.7 + rng() * 1.3;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** running-bond floor planks with knots and warm stain variation */
export function woodPlanks(base = '#6f5136', seed = 7): THREE.CanvasTexture {
  return make(`planks|${base}|${seed}`, [512, 512], (ctx, w, h) => {
    const rng = mulberry32(seed);
    const rows = 6;
    const ph = h / rows;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (w / 3);
      for (let p = -1; p < 3; p++) {
        const px = p * (w / 2) + offset;
        const tone = shade(base, (rng() - 0.5) * 0.10);
        ctx.fillStyle = tone;
        ctx.fillRect(px, r * ph, w / 2, ph);
        grain(ctx, rng, px, r * ph, w / 2, ph, shade(base, -0.18), 7);
        // occasional knot
        if (rng() > 0.72) {
          const kx = px + 20 + rng() * (w / 2 - 40);
          const ky = r * ph + ph * (0.3 + rng() * 0.4);
          const g = ctx.createRadialGradient(kx, ky, 1, kx, ky, 7 + rng() * 5);
          g.addColorStop(0, shade(base, -0.28));
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.fillRect(kx - 14, ky - 14, 28, 28);
        }
        // plank ends
        ctx.fillStyle = shade(base, -0.3);
        ctx.fillRect(px - 1, r * ph, 2, ph);
      }
      // gaps + top bevel light
      ctx.fillStyle = shade(base, -0.32);
      ctx.fillRect(0, r * ph - 1, w, 2);
      ctx.fillStyle = shade(base, 0.10);
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, r * ph + 1, w, 1);
      ctx.globalAlpha = 1;
    }
    // a floor takes the heaviest wear in the building
    woodAge(ctx, rng, w, h, base, 1.3);
  });
}

/**
 * SIX HUNDRED YEARS, applied to a wood surface.
 *
 * Every wood painter in this file ends with a call to this. That is the point:
 * the wood read as computer-generated not because the grain was wrong but
 * because it was CLEAN — a procedural grain over a flat field is a description
 * of new timber, and there is no new timber in this building. What separates
 * old wood from new is entirely damage, and damage is what this adds:
 *
 *   TOOL MARKS   the shallow scallops a hand plane leaves. Machine-planed
 *                timber is dead flat; every board here was worked by hand and
 *                catches light in bands because of it.
 *   WORM         flight holes, 1–2 px, clustered rather than scattered —
 *                furniture beetle works in colonies and a random sprinkle
 *                reads as noise instead of infestation.
 *   FILLED CRACKS  shakes that have opened along the grain and been stopped
 *                with a darker wax. The fill is what says someone maintained
 *                this; an unfilled crack alone just says neglect.
 *   POLISH       centuries of hands. Broad, soft, irregular lighter passages
 *                where a surface is touched, because oil polish builds where
 *                it is rubbed and dulls where it is not.
 *   DUST         settled into everything, and slightly cool, because the light
 *                it is catching is moonlight.
 *
 * `wear` scales the whole thing: 1 for furniture and handrails, lower for
 * surfaces nobody can reach.
 */
function woodAge(ctx: CanvasRenderingContext2D, rng: () => number, w: number, h: number, base: string, wear = 1): void {
  // hand-plane scallops: broad, very faint, running with the length
  for (let i = 0; i < 26 * wear; i++) {
    const y = rng() * h;
    const g = ctx.createLinearGradient(0, y, 0, y + 6 + rng() * 14);
    g.addColorStop(0, `rgba(255,246,225,${0.02 + rng() * 0.035})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, w, 20);
  }
  // uneven colour — boards from different trees, and centuries of uneven light
  for (let i = 0; i < 90; i++) {
    ctx.globalAlpha = 0.03 + rng() * 0.07;
    ctx.fillStyle = shade(base, (rng() - 0.5) * 0.24);
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h, 18 + rng() * 90, 10 + rng() * 46, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // micro-scratches, mostly along the grain
  for (let i = 0; i < 150 * wear; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const len = 4 + rng() * 26;
    ctx.globalAlpha = 0.05 + rng() * 0.1;
    ctx.strokeStyle = rng() > 0.45 ? shade(base, 0.2) : shade(base, -0.24);
    ctx.lineWidth = 0.5 + rng() * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (rng() - 0.5) * 2.5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // worm, in colonies
  for (let c = 0; c < 3 * wear; c++) {
    const cx = rng() * w;
    const cy = rng() * h;
    for (let i = 0; i < 4 + rng() * 12; i++) {
      ctx.globalAlpha = 0.4 + rng() * 0.45;
      ctx.fillStyle = shade(base, -0.5);
      const r = 0.7 + rng() * 1.1;
      ctx.beginPath();
      ctx.arc(cx + (rng() - 0.5) * 44, cy + (rng() - 0.5) * 44, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  // shakes, stopped with a darker wax
  for (let i = 0; i < 5 * wear; i++) {
    let x = rng() * w;
    let y = rng() * h;
    const n = 4 + Math.floor(rng() * 8);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < n; k++) {
      x += 6 + rng() * 20;
      y += (rng() - 0.5) * 4;
      ctx.lineTo(x, y);
    }
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = shade(base, -0.42);
    ctx.lineWidth = 1.2 + rng() * 2;
    ctx.stroke();
    // the wax fill, sitting a hair proud and catching light
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = shade(base, 0.12);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // oil polish where hands go
  for (let i = 0; i < 10 * wear; i++) {
    const cx = rng() * w;
    const cy = rng() * h;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 + rng() * 80);
    g.addColorStop(0, `rgba(255,238,206,${0.045 + rng() * 0.05})`);
    g.addColorStop(1, 'rgba(255,238,206,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 110, cy - 110, 220, 220);
  }
  // and the dust that has settled into all of it
  for (let i = 0; i < 200; i++) {
    ctx.globalAlpha = 0.015 + rng() * 0.035;
    ctx.fillStyle = '#b6b8ae';
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h, 3 + rng() * 20, 2 + rng() * 10, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * The same idea for masonry: erosion, water, lichen, efflorescence, and the
 * places the building has been mended. Nothing in here is freshly cut.
 */
function stoneAge(ctx: CanvasRenderingContext2D, rng: () => number, w: number, h: number, base: string): void {
  // erosion: the arrises are gone and the face is no longer flat
  for (let i = 0; i < 240; i++) {
    ctx.globalAlpha = 0.04 + rng() * 0.1;
    ctx.fillStyle = shade(base, (rng() - 0.5) * 0.26);
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h, 5 + rng() * 40, 4 + rng() * 22, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // claw-chisel tool marks, in parallel runs — a mason worked a face in bands
  for (let b = 0; b < 7; b++) {
    const bx = rng() * w;
    const by = rng() * h;
    const ang = rng() * Math.PI;
    for (let i = 0; i < 14; i++) {
      ctx.globalAlpha = 0.05 + rng() * 0.07;
      ctx.strokeStyle = shade(base, i % 2 ? 0.14 : -0.16);
      ctx.lineWidth = 0.9;
      const off = (i - 7) * 2.4;
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(ang + 1.57) * off, by + Math.sin(ang + 1.57) * off);
      ctx.lineTo(
        bx + Math.cos(ang + 1.57) * off + Math.cos(ang) * (18 + rng() * 26),
        by + Math.sin(ang + 1.57) * off + Math.sin(ang) * (18 + rng() * 26),
      );
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  // water: dark runs down the face with a mineral crust at their margins
  for (let i = 0; i < 12; i++) {
    const x = rng() * w;
    const top = rng() * h * 0.5;
    const len = h * (0.2 + rng() * 0.6);
    const wd = 3 + rng() * 16;
    const g = ctx.createLinearGradient(0, top, 0, top + len);
    g.addColorStop(0, 'rgba(26,28,24,0.3)');
    g.addColorStop(1, 'rgba(26,28,24,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, top, wd, len);
  }
  // efflorescence: salts wicked out and dried as a pale bloom
  for (let i = 0; i < 22; i++) {
    const cx = rng() * w;
    const cy = rng() * h;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12 + rng() * 40);
    g.addColorStop(0, `rgba(232,230,216,${0.1 + rng() * 0.14})`);
    g.addColorStop(1, 'rgba(232,230,216,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 60, cy - 60, 120, 120);
  }
  // lichen and moss, in the damp places — always at the FOOT and in the joints,
  // never scattered evenly, because that is where water sits
  for (let i = 0; i < 46; i++) {
    const cx = rng() * w;
    const cy = h * (0.55 + rng() * 0.45);
    ctx.globalAlpha = 0.1 + rng() * 0.2;
    ctx.fillStyle = rng() > 0.5 ? '#5d6b48' : '#7c7f5a';
    for (let k = 0; k < 9; k++) {
      ctx.beginPath();
      ctx.arc(cx + (rng() - 0.5) * 26, cy + (rng() - 0.5) * 18, 1.5 + rng() * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  // cracks, and a patch of mismatched repair mortar
  for (let i = 0; i < 6; i++) {
    let x = rng() * w;
    let y = rng() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < 8 + rng() * 8; k++) {
      x += (rng() - 0.5) * 22;
      y += (rng() - 0.4) * 18;
      ctx.lineTo(x, y);
    }
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = 'rgba(16,15,13,0.8)';
    ctx.lineWidth = 0.7 + rng() * 1.3;
    ctx.stroke();
  }
  for (let i = 0; i < 2; i++) {
    ctx.globalAlpha = 0.18 + rng() * 0.14;
    ctx.fillStyle = shade(base, 0.16);
    ctx.beginPath();
    ctx.ellipse(rng() * w, rng() * h, 16 + rng() * 40, 12 + rng() * 30, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** tight vertical grain for beams, columns, shelf frames */
export function woodBeam(base = '#5c4530', seed = 21): THREE.CanvasTexture {
  return make(`beam|${base}|${seed}`, [256, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 34; i++) {
      const gx = rng() * w;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.bezierCurveTo(gx + (rng() - 0.5) * 12, h * 0.33, gx + (rng() - 0.5) * 12, h * 0.66, gx + (rng() - 0.5) * 6, h);
      ctx.strokeStyle = shade(base, -0.16);
      ctx.globalAlpha = 0.12 + rng() * 0.14;
      ctx.lineWidth = 0.8 + rng() * 1.6;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // soft edge darkening so beams read as chamfered
    const edge = ctx.createLinearGradient(0, 0, w, 0);
    edge.addColorStop(0, 'rgba(0,0,0,0.28)');
    edge.addColorStop(0.12, 'rgba(0,0,0,0)');
    edge.addColorStop(0.88, 'rgba(0,0,0,0)');
    edge.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, w, h);
    // beams and shelf frames are handled, but not walked on
    woodAge(ctx, rng, w, h, base, 0.8);
  });
}

/**
 * Wainscot: stiles, rails, sunk fields and a Gothic tracery head.
 *
 * What this replaced was a raised panel with one bevel — four flat rectangles
 * with a light edge on two sides and a dark edge on the other two. From two
 * metres that is a picture of panelling rather than panelling, and it is the
 * single most-repeated surface in the building (the drum's wainscot, both
 * halls' wainscot, and every carved panel), so it was also the biggest single
 * source of "these are assets, not architecture".
 *
 * A real panelled wall is a FRAME with holes in it, and the depth is in the
 * moulding around each hole, not in a bevel drawn on the field. So this is
 * built the way a joiner builds it:
 *
 *   STILES & RAILS  the structural frame, running full height and full width,
 *                   with the mitre visible where they meet.
 *   BOLECTION       a stepped moulding standing PROUD of the frame and
 *                   returning down into the field — three steps, each with its
 *                   own lit and shadowed arris. This is where the depth comes
 *                   from; it is also where the dust collects.
 *   SUNK FIELD      set BELOW the frame, not raised above it, with a chamfer
 *                   running round it and its own grain at a different scale.
 *   TRACERY         a blind Gothic arch cut into the head of each field —
 *                   a cusped two-light opening with a quatrefoil over it. It
 *                   is the one piece of real ornament, and it is what makes
 *                   this read as a fifteenth-century room rather than a
 *                   Victorian one.
 *
 * Light is assumed to fall from the upper left throughout, consistently, which
 * is the other half of why the old version read flat: its bevels were lit from
 * one direction and its stile shadows implied another.
 */
export function wallPanels(base = '#63492f', seed = 33): THREE.CanvasTexture {
  return make(`panels|${base}|${seed}`, [512, 512], (ctx, w, h) => {
    const rng = mulberry32(seed);
    const LIT = shade(base, 0.2);
    const DIM = shade(base, -0.3);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    grain(ctx, rng, 0, 0, w, h, shade(base, -0.14), 26);

    const cols = 2;
    const rows = 2;
    const pw = w / cols;
    const ph = h / rows;
    /** the width of the frame member between fields */
    const STILE = 30;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * pw;
        const y = r * ph;
        const fx = x + STILE;
        const fy = y + STILE;
        const fw = pw - STILE * 2;
        const fh = ph - STILE * 2;

        // the bolection: three steps down into the opening. Each step gets a
        // lit top-left and a shadowed bottom-right, and each is a little
        // darker than the last, which is what reads as depth.
        const steps = 3;
        for (let s = 0; s < steps; s++) {
          const k = s * 5;
          const sx = fx - (steps - s) * 5;
          const sy = fy - (steps - s) * 5;
          const sw = fw + (steps - s) * 10;
          const sh = fh + (steps - s) * 10;
          ctx.fillStyle = shade(base, 0.09 - s * 0.06);
          ctx.fillRect(sx, sy, sw, sh);
          ctx.strokeStyle = shade(base, 0.22 - s * 0.04);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(sx, sy + sh);
          ctx.lineTo(sx, sy);
          ctx.lineTo(sx + sw, sy);
          ctx.stroke();
          ctx.strokeStyle = shade(base, -0.34 + s * 0.03);
          ctx.beginPath();
          ctx.moveTo(sx + sw, sy);
          ctx.lineTo(sx + sw, sy + sh);
          ctx.lineTo(sx, sy + sh);
          ctx.stroke();
          void k;
        }

        // the sunk field, below the frame and in its own shadow
        ctx.fillStyle = shade(base, -0.11);
        ctx.fillRect(fx, fy, fw, fh);
        grain(ctx, rng, fx, fy, fw, fh, shade(base, -0.2), 9);
        // the shadow the moulding casts down into it, upper-left
        const cast = ctx.createLinearGradient(fx, fy, fx + fw * 0.5, fy + fh * 0.5);
        cast.addColorStop(0, 'rgba(0,0,0,0.4)');
        cast.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = cast;
        ctx.fillRect(fx, fy, fw, fh);

        /* ——— the blind tracery in the head of the field ——— */
        const tw = fw * 0.72;
        const tx = fx + (fw - tw) / 2;
        const ty = fy + fh * 0.1;
        const th = fh * 0.44;
        const midX = tx + tw / 2;
        // two cusped lights under a shared arch
        ctx.lineWidth = 2.4;
        for (const side of [0, 1]) {
          const lx = side ? midX + tw * 0.04 : tx;
          const lw = tw * 0.46;
          const springY = ty + th * 0.52;
          const path = () => {
            ctx.beginPath();
            ctx.moveTo(lx, ty + th);
            ctx.lineTo(lx, springY);
            // the pointed head: two arcs meeting at the apex
            ctx.quadraticCurveTo(lx, ty + th * 0.1, lx + lw / 2, ty + th * 0.06);
            ctx.quadraticCurveTo(lx + lw, ty + th * 0.1, lx + lw, springY);
            ctx.lineTo(lx + lw, ty + th);
          };
          // the incision, then its lit lower lip a pixel below
          path();
          ctx.strokeStyle = DIM;
          ctx.stroke();
          ctx.save();
          ctx.translate(0.9, 1.3);
          path();
          ctx.strokeStyle = LIT;
          ctx.globalAlpha = 0.55;
          ctx.stroke();
          ctx.restore();
          // the cusps that make it Gothic rather than merely pointed
          for (const cy2 of [springY - th * 0.1, springY - th * 0.28]) {
            ctx.beginPath();
            ctx.arc(lx + lw * 0.5, cy2, lw * 0.2, Math.PI * 0.15, Math.PI * 0.85);
            ctx.strokeStyle = DIM;
            ctx.lineWidth = 1.7;
            ctx.stroke();
          }
        }
        // the quatrefoil in the spandrel over the two lights
        const qr = tw * 0.11;
        const qy = ty + th * 0.02;
        for (const [dx, dy] of [[0, -qr * 0.85], [qr * 0.85, 0], [0, qr * 0.85], [-qr * 0.85, 0]]) {
          ctx.beginPath();
          ctx.arc(midX + dx, qy + dy, qr * 0.62, 0, Math.PI * 2);
          ctx.strokeStyle = DIM;
          ctx.lineWidth = 1.9;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(midX + dx + 0.8, qy + dy + 1.1, qr * 0.62, Math.PI * 0.1, Math.PI * 0.9);
          ctx.strokeStyle = LIT;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // the frame's own joinery: the mitre where stile meets rail, and the peg
    // that draw-bores the joint together
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = shade(base, -0.28);
    ctx.lineWidth = 1;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * ph);
      ctx.lineTo(w, r * ph);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * pw, 0);
      ctx.lineTo(c * pw, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        for (const [px, py] of [
          [c * pw + STILE * 0.5, r * ph + STILE * 0.5],
          [c * pw + pw - STILE * 0.5, r * ph + ph - STILE * 0.5],
        ]) {
          ctx.fillStyle = shade(base, -0.2);
          ctx.beginPath();
          ctx.arc(px, py, 3.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = shade(base, 0.12);
          ctx.beginPath();
          ctx.arc(px - 0.8, py - 0.8, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // dust, settled in the mouldings rather than sprinkled over the whole face
    for (let i = 0; i < 260; i++) {
      const gx = rng() * w;
      const gy = rng() * h;
      const nearMoulding =
        Math.abs((gx % pw) - STILE) < 8 || Math.abs((gy % ph) - STILE) < 8 ||
        Math.abs((gx % pw) - (pw - STILE)) < 8 || Math.abs((gy % ph) - (ph - STILE)) < 8;
      if (!nearMoulding && rng() > 0.25) continue;
      ctx.globalAlpha = 0.05 + rng() * 0.1;
      ctx.fillStyle = '#b4b6ac';
      ctx.beginPath();
      ctx.ellipse(gx, gy, 2 + rng() * 9, 1 + rng() * 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    woodAge(ctx, rng, w, h, base, 0.9);
  });
}

/** an ornamental runner: deep red field, gold borders, diamond medallions */
export function rugRunner(field = '#7a2530', accent = '#d9a648', seed = 5): THREE.CanvasTexture {
  return make(`rug|${field}|${accent}|${seed}`, [256, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = field;
    ctx.fillRect(0, 0, w, h);
    // mottle so it reads as weave
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = shade(field, (rng() - 0.5) * 0.12);
      ctx.globalAlpha = 0.25;
      ctx.fillRect(rng() * w, rng() * h, 2.5, 1.5);
    }
    ctx.globalAlpha = 1;
    // side borders (u = across the runner)
    for (const [x0, wd, tone] of [
      [6, 5, accent],
      [16, 12, shade(field, -0.14)],
      [31, 3, accent],
    ] as const) {
      ctx.fillStyle = tone as string;
      ctx.fillRect(x0, 0, wd, h);
      ctx.fillRect(w - x0 - wd, 0, wd, h);
    }
    // guard pattern inside the wide border
    ctx.fillStyle = accent;
    for (let y = 8; y < h; y += 22) {
      for (const bx of [22, w - 28]) {
        ctx.beginPath();
        ctx.moveTo(bx, y);
        ctx.lineTo(bx + 5, y + 6);
        ctx.lineTo(bx, y + 12);
        ctx.lineTo(bx - 5, y + 6);
        ctx.closePath();
        ctx.fill();
      }
    }
    // central medallions
    const cx = w / 2;
    for (const cy of [h * 0.25, h * 0.75]) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(-26, -26, 52, 52);
      ctx.strokeRect(-16, -16, 32, 32);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      // little star points
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * 40, cy + Math.sin(ang) * 40, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

/** a fine brass double rule, meant to be tiled long and thin down the centre
 *  of a wing's runner — the "dated" ticks that ride on it are their own
 *  separate plaques, so this carries nothing but the two struck lines. The
 *  lines run the tile's full HEIGHT (not across it): the runner plane repeats
 *  this tile along its length, and only a line that already spans edge to
 *  edge on that axis tiles into one unbroken rule rather than a ladder. */
export function brassRule(field = '#241d12', accent = '#d9a648'): THREE.CanvasTexture {
  return make(`rule|${field}|${accent}`, [64, 64], (ctx, w, h) => {
    ctx.fillStyle = field;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 2;
    for (const x of [w * 0.28, w * 0.72]) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

/** rough stone blocks for the fireplace */
export function stoneBlocks(base = '#6e6258', seed = 9): THREE.CanvasTexture {
  return make(`stone|${base}|${seed}`, [256, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = shade(base, -0.22);
    ctx.fillRect(0, 0, w, h);
    const rows = 4;
    const bh = h / rows;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * 34;
      for (let x = -34; x < w; x += 66) {
        const bw = 60 + rng() * 8;
        ctx.fillStyle = shade(base, (rng() - 0.5) * 0.1);
        ctx.fillRect(x + off + 2, r * bh + 2, bw, bh - 4);
        // mottle
        for (let i = 0; i < 26; i++) {
          ctx.fillStyle = shade(base, (rng() - 0.5) * 0.16);
          ctx.globalAlpha = 0.3;
          ctx.fillRect(x + off + 4 + rng() * bw, r * bh + 4 + rng() * (bh - 8), 3, 2);
        }
        ctx.globalAlpha = 1;
        // top highlight
        ctx.fillStyle = shade(base, 0.1);
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x + off + 2, r * bh + 2, bw, 2);
        ctx.globalAlpha = 1;
      }
    }
    // erosion, tool marks, water, lichen, efflorescence and a mended patch
    stoneAge(ctx, rng, w, h, base);
  });
}

/**
 * Hand-forged metal. Brass, bronze and iron all come out of here.
 *
 * All three were `solid` — a 4×4 flat fill — which meant their entire character
 * came from two scalars, and two scalars describe a machined casting. Every
 * piece of metal in this building was worked under a hammer and has been in a
 * damp room for four centuries, and that is almost entirely a SURFACE story:
 *
 *   FACETS      a hammered surface is a field of shallow planes, each catching
 *               light differently. Painted as soft overlapping polygons, which
 *               is what breaks the flat specular better than any roughness
 *               value can.
 *   RECESSES    oxide collects in the low places and is rubbed off the high
 *               ones, so the tone varies with the facets rather than randomly.
 *   WEAR        bright, hard-edged scuffs only where a hand or a sleeve goes.
 *
 * Per alloy: brass gets crazed amber lacquer and engraved measurement lines
 * (it is the metal the instruments are made of); bronze gets green-black
 * oxidation pooling in the hollows; iron gets scale, pitting and no highlight
 * worth the name.
 */
export function forgedMetal(base = '#a8863c', alloy: 'brass' | 'bronze' | 'iron' = 'brass', seed = 41): THREE.CanvasTexture {
  return make(`forged|${base}|${alloy}|${seed}`, [256, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // hammer facets — overlapping soft polygons, the planishing marks
    for (let i = 0; i < 220; i++) {
      const cx = rng() * w;
      const cy = rng() * h;
      const r = 5 + rng() * 17;
      const n = 5 + Math.floor(rng() * 3);
      ctx.beginPath();
      for (let k = 0; k <= n; k++) {
        const t = (k / n) * Math.PI * 2;
        const rr = r * (0.75 + rng() * 0.5);
        const px = cx + Math.cos(t) * rr;
        const py = cy + Math.sin(t) * rr;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.globalAlpha = 0.1 + rng() * 0.16;
      ctx.fillStyle = shade(base, (rng() - 0.45) * 0.34);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (alloy === 'bronze') {
      // verdigris pooling in the hollows — green-black, never bright green
      for (let i = 0; i < 90; i++) {
        ctx.globalAlpha = 0.06 + rng() * 0.16;
        ctx.fillStyle = rng() > 0.4 ? '#38452f' : '#2a3328';
        ctx.beginPath();
        ctx.ellipse(rng() * w, rng() * h, 4 + rng() * 26, 3 + rng() * 16, rng() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (alloy === 'iron') {
      // black scale and the pitting under it
      for (let i = 0; i < 300; i++) {
        ctx.globalAlpha = 0.1 + rng() * 0.3;
        ctx.fillStyle = rng() > 0.7 ? '#4a3f33' : '#171513';
        ctx.beginPath();
        ctx.ellipse(rng() * w, rng() * h, 1 + rng() * 7, 1 + rng() * 5, rng() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // brass: crazed amber lacquer, and the engraved scale of an instrument
      for (let i = 0; i < 70; i++) {
        ctx.globalAlpha = 0.05 + rng() * 0.12;
        ctx.fillStyle = rng() > 0.5 ? '#6d4c1b' : '#c8a45a';
        ctx.beginPath();
        ctx.ellipse(rng() * w, rng() * h, 8 + rng() * 40, 6 + rng() * 24, rng() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = shade(base, -0.45);
      for (let i = 0; i < 40; i++) {
        const x = rng() * w;
        const y = rng() * h;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (rng() - 0.5) * 30, y + (rng() - 0.5) * 30);
        ctx.stroke();
      }
      // graduation lines, every fifth one long — this is the metal the orrery,
      // the astrolabes and every scale in the building are cut from
      ctx.globalAlpha = 0.3;
      for (let x = 0; x < w; x += 8) {
        const long = (x / 8) % 5 === 0;
        ctx.strokeStyle = shade(base, -0.5);
        ctx.lineWidth = long ? 1.1 : 0.7;
        ctx.beginPath();
        ctx.moveTo(x, h * 0.5);
        ctx.lineTo(x, h * 0.5 + (long ? 9 : 5));
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // the bright places: hard, small, and only where something rubs
    for (let i = 0; i < 34; i++) {
      ctx.globalAlpha = 0.1 + rng() * 0.22;
      ctx.fillStyle = shade(base, alloy === 'iron' ? 0.22 : 0.34);
      ctx.beginPath();
      ctx.ellipse(rng() * w, rng() * h, 2 + rng() * 13, 0.8 + rng() * 2.4, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

/** neutral-light leather so instance/material colors can tint it */
export function leather(seed = 13): THREE.CanvasTexture {
  return make(`leather|${seed}`, [256, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = '#c9beac';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = rng() > 0.5 ? '#b7ab97' : '#d6ccba';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(rng() * w, rng() * h, 2, 2);
    }
    ctx.globalAlpha = 1;
    // creases
    for (let i = 0; i < 22; i++) {
      ctx.beginPath();
      const x = rng() * w;
      const y = rng() * h;
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + (rng() - 0.5) * 60, y + (rng() - 0.5) * 60, x + (rng() - 0.5) * 90, y + (rng() - 0.5) * 90);
      ctx.strokeStyle = '#a99d88';
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

/** book spines with gilt bands, drawn light so instance colors tint them */
export function bookSpines(): THREE.CanvasTexture {
  return make('spines', [128, 128], (ctx, w, h) => {
    const rng = mulberry32(17);
    ctx.fillStyle = '#c9b9a2';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = rng() > 0.5 ? '#bcab92' : '#d6c7b0';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(rng() * w, rng() * h, 2, 2);
    }
    ctx.globalAlpha = 1;
    // gilt bands top and bottom thirds
    for (const y of [h * 0.2, h * 0.32, h * 0.74]) {
      ctx.fillStyle = '#f0dda6';
      ctx.fillRect(0, y, w, 5);
      ctx.fillStyle = '#fff3cf';
      ctx.fillRect(0, y + 1, w, 1.6);
    }
    // spine edges
    const edge = ctx.createLinearGradient(0, 0, w, 0);
    edge.addColorStop(0, 'rgba(0,0,0,0.35)');
    edge.addColorStop(0.14, 'rgba(0,0,0,0)');
    edge.addColorStop(0.86, 'rgba(0,0,0,0)');
    edge.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, w, h);
  });
}

/* ————— the spine sheet ————— */

/**
 * The photographic grounds every binding is built on.
 *
 * These are the same CC0 scans the material registry ships (see
 * src/materials/library.json): real leather and real bookbinding linen,
 * photographed, not painted. The structure of a binding — cords, gilt, labels,
 * the damage — is still drawn on top, because no scan of a flat hide has any of
 * that. What the photograph supplies is the thing painting cannot fake: grain.
 * Pores, weave, scars, and the way old calf goes blotchy rather than noisy.
 */
const SPINE_SCANS = [
  '/textures/Books/book_leather_aged/albedo.jpg',
  '/textures/Books/book_leather_cracked/albedo.jpg',
  '/textures/Books/book_cloth_binding/albedo.jpg',
  '/textures/Books/book_cloth_oxblood/albedo.jpg',
] as const;

const scanImages: (HTMLImageElement | null)[] = SPINE_SCANS.map(() => null);
let scansRequested = false;
const spineSubscribers = new Set<() => void>();
/** every sheet baked so far, so they can be repainted when the scans land */
const spineSheets = new Map<string, { tex: THREE.CanvasTexture; seed: number }>();

/**
 * Tell me when the photographic grounds have arrived.
 *
 * The scans cannot be waited for: the stacks are built during the first frame,
 * and a shelf that renders nothing until a download finishes is worse than a
 * shelf of painted bindings. So every sheet is baked procedurally straight away
 * and repainted IN PLACE when the images land — the same canvas, so no material
 * has to be rebuilt. Callers only have to flag their clones, because a cloned
 * texture shares the image but keeps its own upload state.
 */
export function onSpineScansReady(cb: () => void): () => void {
  spineSubscribers.add(cb);
  return () => spineSubscribers.delete(cb);
}

function loadSpineScans() {
  if (scansRequested || typeof Image === 'undefined') return;
  scansRequested = true;
  let outstanding = SPINE_SCANS.length;
  const settle = () => {
    if (--outstanding > 0) return;
    if (!scanImages.some(Boolean)) return; // nothing arrived; keep the painted bake
    for (const { tex, seed } of spineSheets.values()) {
      const canvas = tex.image as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      paintSpineSheet(ctx, canvas.width, canvas.height, seed);
      tex.needsUpdate = true;
    }
    for (const cb of spineSubscribers) cb();
  };
  SPINE_SCANS.forEach((src, i) => {
    const img = new Image();
    img.onload = () => {
      scanImages[i] = img;
      settle();
    };
    img.onerror = () => settle();
    img.src = src;
  });
}

/**
 * Lay a crop of one of the scans into a spine, part-desaturated.
 *
 * PART, not fully: a wall of perfectly neutral spines takes all of its colour
 * from the instance tint, and the instance tint is one flat hue per book, which
 * is how the stacks came to read as painted blocks. Leaving a third of the
 * photograph's own colour in means an aged-calf spine stays warm brown under a
 * green tint and a linen one stays olive under a red one — which is what a real
 * shelf of rebound books does. No two of them agree about what colour they are.
 */
function scanGround(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  x0: number,
  w: number,
  h: number,
  which: number,
  desaturate: number,
) {
  const img = scanImages[which % scanImages.length];
  if (!img) return false;
  // a random window into the scan, at roughly spine scale — small enough that
  // no two columns are showing the same patch of hide
  const cw = Math.min(img.width, img.height) * (0.22 + rng() * 0.12);
  const ch = cw * (h / w);
  const sx = rng() * Math.max(1, img.width - cw);
  const sy = rng() * Math.max(1, img.height - ch);
  ctx.drawImage(img, sx, sy, cw, Math.min(ch, img.height - sy), x0, 0, w, h);
  if (desaturate > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.globalAlpha = desaturate;
    ctx.fillStyle = '#808080';
    ctx.fillRect(x0, 0, w, h);
    ctx.restore();
  }
  return true;
}

/** foxing, mould, damp spotting — the blotches age puts on everything */
function foxing(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  x0: number,
  w: number,
  h: number,
  n: number,
  tone = '#8a6a3c',
) {
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = 0.08 + rng() * 0.18;
    ctx.fillStyle = tone;
    ctx.beginPath();
    ctx.ellipse(x0 + rng() * w, rng() * h, 1.5 + rng() * 5, 1.5 + rng() * 4, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** leather rubbed off a joint or a band, showing the pale board beneath */
function rubbed(ctx: CanvasRenderingContext2D, rng: () => number, x0: number, w: number, h: number, n: number) {
  for (let i = 0; i < n; i++) {
    const rx = x0 + (rng() > 0.5 ? rng() * w * 0.22 : w - rng() * w * 0.22);
    ctx.globalAlpha = 0.18 + rng() * 0.26;
    ctx.fillStyle = '#cdc2ad';
    ctx.beginPath();
    ctx.ellipse(rx, rng() * h, 2 + rng() * 7, 1.5 + rng() * 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Eight bindings side by side in one sheet, so a wall of books is not four
 * thousand copies of one book.
 *
 * `bookSpines` above is a single design tiled everywhere, and at arm's length
 * that is the loudest artificial thing in the stacks: every volume carries its
 * gilt bands at exactly the same two heights. Varying colour and size does not
 * help, because the eye locks onto the repeated BANDING, not the hue.
 *
 * Two axes of variety, and they are deliberately different axes:
 *
 *   BINDING     what the book IS — how it was sewn, covered and lettered.
 *   CONDITION   what has happened to it since. A library assembled over three
 *               centuries is largely a record of damage: sun down one edge of
 *               every spine that ever faced a window, water up the tail of
 *               anything that stood on a damp floor, headcaps torn off by two
 *               hundred years of fingers pulling books down by the top of the
 *               spine. Bindings alone read as a shop; conditions make a shelf.
 *
 *   0  RAISED CORDS   sewn on five cords standing proud, blind-tooled between,
 *                     rubbed at both joints. Aged calf.
 *   1  PAPER LABEL    plain calf, a pasted label lifting at one corner, foxed.
 *   2  GILT TOOLED    the finest binding here: gilt fillets, corner ornaments
 *                     and a morocco lettering-piece, the gold flaked where a
 *                     thumb has been for two centuries.
 *   3  SUNNED CLOTH   nineteenth-century linen, bleached to straw down the edge
 *                     that faced the room, dark where a neighbour shaded it.
 *   4  RUBBED CALF    the workhorse: crazed all over, corners bumped through to
 *                     the board, the headcap torn away.
 *   5  WATER-STAINED  a tide line up from the tail with mould speckling above.
 *   6  LIMP VELLUM    no boards, cockled and warped, hand-lettered in brown ink.
 *   7  REBACKED       a broken hinge mended in newer leather, the old spine laid
 *                     down over it, a shelf number at the tail.
 *
 * Sample one column by cloning with `repeat.x = 1/SPINE_DESIGNS` and
 * `offset.x = k/SPINE_DESIGNS`.
 */
export const SPINE_DESIGNS = 8;
/** which column carries the gilt-tooled panel — the museum's own bindings */
export const SPINE_GILT_COLUMN = 2;

function paintSpineSheet(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
  const CW = W / SPINE_DESIGNS;
  const rng = mulberry32(seed);
  ctx.clearRect(0, 0, W, H);

  for (let k = 0; k < SPINE_DESIGNS; k++) {
    const x0 = k * CW;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, 0, CW, H);
    ctx.clip();

    // ——— the ground ———
    // Which scan a binding is cut from is not arbitrary: calf for the tooled and
    // cord-sewn work, pebbled hide for the crazed one, linen for the cloth cases.
    const groundFor = [0, 0, 1, 2, 1, 3, 0, 3][k];
    const base = ['#c9b9a2', '#c3b49b', '#cdbda4', '#b8ac97', '#bfae95', '#b3a894', '#d7cdb3', '#bdae99'][k];
    ctx.fillStyle = base;
    ctx.fillRect(x0, 0, CW, H);
    const photographic = scanGround(ctx, rng, x0, CW, H, groundFor, k === 6 ? 0.85 : 0.62);
    if (!photographic) {
      // the painted stand-in, for the frames before the scans land
      for (let i = 0; i < 700; i++) {
        ctx.globalAlpha = 0.16 + rng() * 0.22;
        ctx.fillStyle = rng() > 0.5 ? shade(base, -0.09) : shade(base, 0.07);
        ctx.fillRect(x0 + rng() * CW, rng() * H, 1 + rng() * 3, 1 + rng() * 3);
      }
      ctx.globalAlpha = 1;
    } else if (k === 6) {
      // vellum is pale: lift the photograph rather than replace it, so the
      // hide's own scarring still reads through the cream
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#e6dcc0';
      ctx.fillRect(x0, 0, CW, H);
      ctx.globalAlpha = 1;
    }

    if (k === 0) {
      // raised cords: a lit top edge, the band, a shadow under it
      for (const y of [0.16, 0.34, 0.52, 0.7, 0.87]) {
        const yy = y * H;
        ctx.fillStyle = 'rgba(255,244,214,0.30)';
        ctx.fillRect(x0, yy - 10, CW, 4);
        ctx.fillStyle = shade(base, 0.05);
        ctx.fillRect(x0, yy - 6, CW, 13);
        ctx.fillStyle = 'rgba(20,14,8,0.34)';
        ctx.fillRect(x0, yy + 7, CW, 6);
      }
      ctx.strokeStyle = 'rgba(30,20,10,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x0 + CW * 0.13, 0.4 * H, CW * 0.74, 0.1 * H);
      rubbed(ctx, rng, x0, CW, H, 10);
    } else if (k === 1) {
      // the pasted label, lifting at its lower corner
      ctx.fillStyle = '#e4d7b6';
      ctx.fillRect(x0 + CW * 0.11, 0.24 * H, CW * 0.78, 0.2 * H);
      ctx.fillStyle = 'rgba(90,66,34,0.5)';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x0 + CW * 0.19, 0.28 * H + i * (H * 0.04), CW * 0.62 - rng() * CW * 0.17, 4);
      }
      ctx.fillStyle = 'rgba(20,14,8,0.28)';
      ctx.beginPath();
      ctx.moveTo(x0 + CW * 0.89, 0.44 * H);
      ctx.lineTo(x0 + CW * 0.76, 0.44 * H);
      ctx.lineTo(x0 + CW * 0.89, 0.4 * H);
      ctx.fill();
      foxing(ctx, rng, x0, CW, H, 26);
    } else if (k === SPINE_GILT_COLUMN) {
      // a gilt panel with corner ornaments, and gold that has begun to go
      ctx.strokeStyle = '#f0dda6';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x0 + CW * 0.12, 0.1 * H, CW * 0.76, 0.8 * H);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x0 + CW * 0.17, 0.13 * H, CW * 0.66, 0.74 * H);
      ctx.fillStyle = '#f0dda6';
      for (const y of [0.42, 0.56, 0.7]) {
        ctx.beginPath();
        ctx.arc(x0 + CW / 2, y * H, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const [cx, cy] of [
        [0.2, 0.14],
        [0.8, 0.14],
        [0.2, 0.86],
        [0.8, 0.86],
      ] as [number, number][]) {
        ctx.beginPath();
        ctx.arc(x0 + cx * CW, cy * H, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // the lettering-piece: a darker morocco label with a gilt rule round it
      ctx.fillStyle = 'rgba(60,26,24,0.55)';
      ctx.fillRect(x0 + CW * 0.15, 0.2 * H, CW * 0.7, 0.11 * H);
      ctx.strokeStyle = 'rgba(240,221,166,0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x0 + CW * 0.17, 0.21 * H, CW * 0.66, 0.09 * H);
      // gold flaking away
      for (let i = 0; i < 40; i++) {
        ctx.globalAlpha = 0.25 + rng() * 0.4;
        ctx.fillStyle = shade(base, -0.05);
        ctx.fillRect(x0 + rng() * CW, rng() * H, 1 + rng() * 3, 1 + rng() * 2);
      }
      ctx.globalAlpha = 1;
    } else if (k === 3) {
      // sunned cloth: bleached down the edge that faced the room
      const fade = ctx.createLinearGradient(x0, 0, x0 + CW, 0);
      fade.addColorStop(0, 'rgba(20,16,8,0.34)');
      fade.addColorStop(0.42, 'rgba(255,250,235,0.05)');
      fade.addColorStop(1, 'rgba(246,238,206,0.42)');
      ctx.fillStyle = fade;
      ctx.fillRect(x0, 0, CW, H);
      ctx.fillStyle = 'rgba(240,221,166,0.5)';
      ctx.fillRect(x0 + CW * 0.16, 0.3 * H, CW * 0.68, 3);
      ctx.fillRect(x0 + CW * 0.16, 0.62 * H, CW * 0.68, 3);
      // the head frayed away to grey board
      ctx.fillStyle = 'rgba(24,18,10,0.4)';
      for (let i = 0; i < 14; i++) ctx.fillRect(x0 + rng() * CW, rng() * (H * 0.06), 3 + rng() * 9, 2 + rng() * 5);
    } else if (k === 4) {
      // rubbed calf: crazed, bumped through at the corners, headcap gone
      ctx.strokeStyle = 'rgba(38,26,14,0.30)';
      for (let i = 0; i < 26; i++) {
        const cy = rng() * H;
        ctx.lineWidth = 0.6 + rng() * 1.1;
        ctx.beginPath();
        ctx.moveTo(x0, cy);
        ctx.bezierCurveTo(
          x0 + CW * 0.3,
          cy + (rng() - 0.5) * 24,
          x0 + CW * 0.7,
          cy + (rng() - 0.5) * 24,
          x0 + CW,
          cy + (rng() - 0.5) * 14,
        );
        ctx.stroke();
      }
      rubbed(ctx, rng, x0, CW, H, 26);
      // the torn headcap: pale board where the leather has gone entirely
      ctx.fillStyle = 'rgba(206,196,176,0.75)';
      ctx.beginPath();
      ctx.moveTo(x0 + CW * 0.2, 0);
      ctx.lineTo(x0 + CW * 0.86, 0);
      ctx.lineTo(x0 + CW * 0.7, H * 0.07);
      ctx.lineTo(x0 + CW * 0.34, H * 0.05);
      ctx.closePath();
      ctx.fill();
    } else if (k === 5) {
      // water-stained: a tide line up from the tail, mould above it
      const tide = ctx.createLinearGradient(0, H, 0, H * 0.45);
      tide.addColorStop(0, 'rgba(74,54,30,0.55)');
      tide.addColorStop(0.72, 'rgba(96,72,38,0.34)');
      tide.addColorStop(1, 'rgba(120,94,52,0)');
      ctx.fillStyle = tide;
      ctx.fillRect(x0, H * 0.45, CW, H * 0.55);
      // the line itself, darker and wavering, is what makes it read as water
      ctx.strokeStyle = 'rgba(64,44,22,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, H * 0.52);
      for (let x = 0; x <= CW; x += CW / 6) ctx.lineTo(x0 + x, H * (0.5 + rng() * 0.06));
      ctx.stroke();
      foxing(ctx, rng, x0, CW, H, 40, '#5c5b3a');
      ctx.fillStyle = 'rgba(240,221,166,0.35)';
      ctx.fillRect(x0 + CW * 0.18, 0.24 * H, CW * 0.64, 2.5);
    } else if (k === 6) {
      // limp vellum: cockled, translucent where it has warped, hand-lettered
      const cockle = ctx.createLinearGradient(x0, 0, x0 + CW, 0);
      cockle.addColorStop(0, 'rgba(120,102,70,0.35)');
      cockle.addColorStop(0.3, 'rgba(255,250,232,0.30)');
      cockle.addColorStop(0.55, 'rgba(120,102,70,0.22)');
      cockle.addColorStop(0.8, 'rgba(255,250,232,0.24)');
      cockle.addColorStop(1, 'rgba(120,102,70,0.35)');
      ctx.fillStyle = cockle;
      ctx.fillRect(x0, 0, CW, H);
      // a title written straight onto the skin, in ink gone brown
      ctx.strokeStyle = 'rgba(74,52,28,0.62)';
      ctx.lineWidth = 2.4;
      for (let i = 0; i < 5; i++) {
        const yy = 0.3 * H + i * (H * 0.045);
        ctx.beginPath();
        ctx.moveTo(x0 + CW * 0.22, yy);
        for (let x = 0.22; x < 0.78; x += 0.07) ctx.lineTo(x0 + CW * x, yy + (rng() - 0.5) * 5);
        ctx.stroke();
      }
      foxing(ctx, rng, x0, CW, H, 30, '#94764a');
    } else {
      // rebacked: newer leather up the joints, the old spine laid back on top
      ctx.fillStyle = 'rgba(52,34,20,0.45)';
      ctx.fillRect(x0, 0, CW * 0.16, H);
      ctx.fillRect(x0 + CW * 0.84, 0, CW * 0.16, H);
      // the laid-down original panel, a shade off and slightly proud
      ctx.fillStyle = 'rgba(255,246,224,0.12)';
      ctx.fillRect(x0 + CW * 0.2, H * 0.14, CW * 0.6, H * 0.66);
      ctx.strokeStyle = 'rgba(18,12,6,0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x0 + CW * 0.2, H * 0.14, CW * 0.6, H * 0.66);
      ctx.fillStyle = 'rgba(240,221,166,0.4)';
      ctx.fillRect(x0 + CW * 0.24, H * 0.26, CW * 0.52, 2.5);
      // the shelf-number label at the tail, which is how it is found again
      ctx.fillStyle = 'rgba(236,232,214,0.85)';
      ctx.fillRect(x0 + CW * 0.3, H * 0.88, CW * 0.4, H * 0.07);
      ctx.fillStyle = 'rgba(40,30,20,0.6)';
      ctx.fillRect(x0 + CW * 0.35, H * 0.905, CW * 0.3, 3);
      foxing(ctx, rng, x0, CW, H, 16);
    }

    // ——— what every spine gets ———
    // the edges rolled into shadow: this is what makes a flat quad read as the
    // rounded back of a sewn book rather than as a card
    const edge = ctx.createLinearGradient(x0, 0, x0 + CW, 0);
    edge.addColorStop(0, 'rgba(0,0,0,0.42)');
    edge.addColorStop(0.16, 'rgba(0,0,0,0)');
    edge.addColorStop(0.84, 'rgba(0,0,0,0)');
    edge.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = edge;
    ctx.fillRect(x0, 0, CW, H);
    // dust settled on the head, and the tail dark in its own shadow
    const dust = ctx.createLinearGradient(0, 0, 0, H * 0.1);
    dust.addColorStop(0, 'rgba(196,190,176,0.5)');
    dust.addColorStop(1, 'rgba(196,190,176,0)');
    ctx.fillStyle = dust;
    ctx.fillRect(x0, 0, CW, H * 0.1);
    const tail = ctx.createLinearGradient(0, H, 0, H * 0.88);
    tail.addColorStop(0, 'rgba(10,8,6,0.35)');
    tail.addColorStop(1, 'rgba(10,8,6,0)');
    ctx.fillStyle = tail;
    ctx.fillRect(x0, H * 0.88, CW, H * 0.12);
    ctx.restore();
  }
}

export function spineSheet(seed = 29): THREE.CanvasTexture {
  const CW = 160;
  const H = 384;
  const key = `spine-sheet|${seed}`;
  const tex = make(key, [CW * SPINE_DESIGNS, H], (ctx, w, h) => paintSpineSheet(ctx, w, h, seed), false);
  if (!spineSheets.has(key)) spineSheets.set(key, { tex, seed });
  loadSpineScans();
  return tex;
}

/** a pointed-arch stained-glass window for the aisle ends */
export function stainedGlassArch(seed = 3): THREE.CanvasTexture {
  return make(`glass|${seed}`, [256, 384], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.clearRect(0, 0, w, h);
    const colors = ['#e8b873', '#9fb8ff', '#f2a0c0', '#a8e08f', '#c9a0ff', '#7fd4c1', '#ffd9a0'];
    // arch silhouette path
    const arch = () => {
      ctx.beginPath();
      ctx.moveTo(18, h - 10);
      ctx.lineTo(18, h * 0.4);
      ctx.quadraticCurveTo(18, 44, w / 2, 22);
      ctx.quadraticCurveTo(w - 18, 44, w - 18, h * 0.4);
      ctx.lineTo(w - 18, h - 10);
      ctx.closePath();
    };
    arch();
    ctx.save();
    ctx.clip();
    // glass panes in a grid, each softly luminous
    const pane = 34;
    for (let y = 0; y < h; y += pane) {
      for (let x = 0; x < w; x += pane) {
        ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x, y, pane, pane);
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 3, y + 3, pane * 0.4, pane * 0.32);
        ctx.globalAlpha = 1;
      }
    }
    // rosette at the crown
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.26, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#ffdf9e';
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(w / 2 + Math.cos(a) * 22, h * 0.26 + Math.sin(a) * 22, 8, 0, Math.PI * 2);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
    }
    // lead lines
    ctx.strokeStyle = '#241c14';
    ctx.lineWidth = 4;
    for (let y = 0; y <= h; y += pane) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x <= w; x += pane) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.restore();
    // stone tracery outline
    arch();
    ctx.strokeStyle = '#3a2f24';
    ctx.lineWidth = 10;
    ctx.stroke();
  }, false);
}

/** darker planking for ceilings */
export function ceilingPlanks(base = '#4a3624'): THREE.CanvasTexture {
  return woodPlanks(base, 41);
}

/**
 * Coffers for the great dome — ONE vertical column of them, meant to be
 * repeated around the dome's circumference.
 *
 * Two things make this read as a dome rather than as wallpaper, and both are
 * geometric rather than painted. First, the canvas carries one column and is
 * tiled N times AROUND, so every coffer narrows as the dome's own radius
 * shrinks toward the crown — the columns converge because the building
 * converges, exactly as the conch coffers already do. Second, the rows
 * DIMINISH in height as they rise, which is the Pantheon's device: it
 * exaggerates the foreshortening a viewer standing underneath already sees,
 * and it is the single thing that makes a dome look tall.
 *
 * v = 0 is the springing and v = 1 the oculus, so the canvas is painted from
 * the bottom up — the reverse of canvas y, which is why the row loop walks
 * upward from `h`. Canvas TOP is therefore the eye of the dome, and that
 * matters for every weathering decision below: water gets in at the oculus and
 * runs DOWN, so the staining is heaviest at the top of this image and thins
 * toward the springing.
 *
 * ── What this is, beyond a coffer grid ────────────────────────────────────
 *
 * The dome is the thing a visitor looks at first and the thing they should
 * stop walking for, so the sunk field of every coffer is not stone. It is
 * LAPIS, with the panel's own celestial engraving in gold leaf on it: an orbit
 * with its body, a comet, a rayed star. Ultramarine ground with gilt figure is
 * what the ceilings this room is quoting actually did — Giotto's Arena Chapel,
 * the Sainte-Chapelle vaults, every star-vault in Europe — and it is also the
 * only place in the whole palette where a real blue is allowed, because it is
 * a mineral rather than a light.
 *
 * The five panel motifs cycle by row, so the same coffer never sits directly
 * above itself, and the whole column is graded: brighter and better kept at
 * the springing where the room's own light reaches, dirtier and more damaged
 * toward the eye.
 */
export function domeCoffers(base = '#5d5a48', gilt = '#b98a3d', seed = 63): THREE.CanvasTexture {
  return make(`domecoffer|${base}|${gilt}|${seed}`, [256, 1024], (ctx, w, h) => {
    const rng = mulberry32(seed);
    // Ultramarine, and NOT as dark as real lapis looks in a photograph. This
    // panel is 25 m up in a room lit at a fifteenth of daylight: at the pigment's
    // true value it read as a black hole in the middle of every coffer and the
    // gold on it disappeared with it. Painted materials in a dark scene have to
    // be pitched for the light they will actually be seen in.
    const LAPIS = '#2b4176';
    const LAPIS_LIT = '#3d5794';
    ctx.fillStyle = shade(base, -0.3);
    ctx.fillRect(0, 0, w, h);

    /** gold leaf: laid in short jittered strokes, never a clean line. Leaf on
     *  plaster is a broken, uneven surface and a ruled gilt line is the fastest
     *  way to make a painted ceiling look printed. */
    const leaf = (pts: [number, number][], width: number, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineCap = 'round';
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[i + 1];
        const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3));
        for (let k = 0; k < n; k++) {
          const t0 = k / n;
          const t1 = (k + 1) / n;
          ctx.strokeStyle = shade(gilt, (rng() - 0.5) * 0.22);
          ctx.lineWidth = width * (0.7 + rng() * 0.6);
          ctx.beginPath();
          ctx.moveTo(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0);
          ctx.lineTo(x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1);
          ctx.stroke();
        }
      }
      ctx.restore();
    };
    const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 20): [number, number][] =>
      Array.from({ length: n + 1 }, (_, i) => {
        const t = a0 + ((a1 - a0) * i) / n;
        return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry] as [number, number];
      });
    const rayedStar = (cx: number, cy: number, r: number, points: number) => {
      for (let p = 0; p < points; p++) {
        const t = (p / points) * Math.PI * 2;
        const long = p % 2 === 0 ? 1 : 0.55;
        leaf([[cx, cy], [cx + Math.cos(t) * r * long, cy + Math.sin(t) * r * long]], r * 0.1, 0.95);
      }
      ctx.fillStyle = shade(gilt, 0.14);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    };

    // heights as fractions of the whole rise, largest at the springing
    const rows = [0.255, 0.225, 0.2, 0.17, 0.15];
    // the rib between coffers: half at each edge, so tiling makes one full rib
    const RIB = w * 0.1;
    let y0 = h;
    let rowIndex = 0;
    for (const frac of rows) {
      const rh = frac * h;
      const top = y0 - rh;
      const gap = rh * 0.13;
      const x0 = RIB;
      const cw = w - RIB * 2;
      const ch = rh - gap * 2;
      // five stepped frames, each smaller and darker. A coffer is a hole cut in
      // stages and the steps are what catch a raking light; five rather than
      // four because the extra step is another lit arris and this ceiling is
      // read from 25 m away, where individual steps merge into a single soft
      // gradient unless there are enough of them to survive it.
      // The step inset is 0.05, not 0.075. At 0.075 five steps ate 75% of the
      // coffer and the lapis field came out a quarter of its width — a big
      // stone frame around a small dark hole. Half the coffer should be sky.
      const steps = 5;
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const ix = x0 + cw * 0.05 * s;
        const iy = top + gap + ch * 0.05 * s;
        const iw = cw - cw * 0.1 * s;
        const ih = ch - ch * 0.1 * s;
        ctx.fillStyle = shade(base, 0.12 - t * 0.42);
        ctx.fillRect(ix, iy, iw, ih);
        // Lit lower lip, shadowed upper lip. The light in this room comes DOWN
        // from the oculus, so the underside of every step is the bright one —
        // get this backwards and the coffers read as bosses standing proud
        // instead of holes sunk in.
        ctx.fillStyle = shade(base, -0.3);
        ctx.fillRect(ix, iy, iw, Math.max(1, ih * 0.035));
        ctx.fillStyle = shade(base, 0.2);
        ctx.fillRect(ix, iy + ih - Math.max(1, ih * 0.035), iw, Math.max(1, ih * 0.035));
        // and the two jamb returns, one of each
        ctx.fillStyle = shade(base, -0.2);
        ctx.fillRect(ix, iy, Math.max(1, iw * 0.02), ih);
        ctx.fillStyle = shade(base, 0.1);
        ctx.fillRect(ix + iw - Math.max(1, iw * 0.02), iy, Math.max(1, iw * 0.02), ih);
      }

      /* ——— the lapis field and its engraving ——— */
      const fx = x0 + cw * 0.05 * steps;
      const fy = top + gap + ch * 0.05 * steps;
      const fw = cw - cw * 0.1 * steps;
      const fh = ch - ch * 0.1 * steps;
      const cx = fx + fw / 2;
      const cy = fy + fh / 2;
      // ground: ultramarine, unevenly laid — real lapis ground is a paint film
      // over gesso and it pools and thins
      ctx.fillStyle = LAPIS;
      ctx.fillRect(fx, fy, fw, fh);
      for (let i = 0; i < 160; i++) {
        ctx.globalAlpha = 0.08 + rng() * 0.16;
        ctx.fillStyle = rng() > 0.4 ? LAPIS_LIT : shade(LAPIS, -0.06);
        ctx.beginPath();
        ctx.ellipse(fx + rng() * fw, fy + rng() * fh, 2 + rng() * 14, 1.5 + rng() * 7, rng() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      // pyrite flecks — the thing that tells you it is lapis and not smalt
      for (let i = 0; i < 40; i++) {
        ctx.globalAlpha = 0.3 + rng() * 0.5;
        ctx.fillStyle = shade(gilt, 0.2);
        ctx.fillRect(fx + rng() * fw, fy + rng() * fh, 1, 1);
      }
      ctx.globalAlpha = 1;
      // the gilt bead framing the field
      leaf(
        [[fx, fy], [fx + fw, fy], [fx + fw, fy + fh], [fx, fy + fh], [fx, fy]],
        Math.max(1.2, fw * 0.018),
        0.85,
      );

      // the panel's own figure, cycling by row
      const R = Math.min(fw, fh) * 0.36;
      switch (rowIndex % 5) {
        case 0: // an orbit with its body on it
          leaf(arc(cx, cy, R * 1.5, R * 0.72, 0, Math.PI * 2, 30), Math.max(1, R * 0.07), 0.8);
          rayedStar(cx + R * 1.5, cy, R * 0.34, 8);
          ctx.fillStyle = shade(gilt, -0.1);
          ctx.beginPath();
          ctx.arc(cx, cy, R * 0.22, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 1: // a rayed star of eight
          rayedStar(cx, cy, R, 8);
          break;
        case 2: { // a crescent with a star in its horns
          leaf(arc(cx, cy, R, R, 0.5, Math.PI * 1.5, 22), Math.max(1.4, R * 0.13), 0.9);
          leaf(arc(cx + R * 0.28, cy, R * 0.86, R * 0.86, 0.6, Math.PI * 1.4, 20), Math.max(1, R * 0.09), 0.5);
          rayedStar(cx + R * 0.5, cy, R * 0.3, 6);
          break;
        }
        case 3: { // a comet, drawn as the engravers drew them
          rayedStar(cx - R * 0.5, cy + R * 0.3, R * 0.36, 6);
          for (let k = 0; k < 7; k++) {
            const sp = -0.5 + k * 0.16;
            leaf(
              [[cx - R * 0.4, cy + R * 0.25], [cx + R * (0.9 + k * 0.06), cy - R * (0.5 + sp * 0.9)]],
              Math.max(0.9, R * 0.05),
              0.4 + rng() * 0.3,
            );
          }
          break;
        }
        default: { // a ringed planet — Saturn, the outermost the eye could see
          ctx.fillStyle = shade(gilt, -0.12);
          ctx.beginPath();
          ctx.arc(cx, cy, R * 0.44, 0, Math.PI * 2);
          ctx.fill();
          leaf(arc(cx, cy, R * 1.05, R * 0.3, 0, Math.PI * 2, 26), Math.max(1, R * 0.075), 0.85);
          break;
        }
      }

      /* ——— the rib flanking this row, carved rather than plain ——— */
      for (const side of [0, 1]) {
        const rx = side ? w - RIB : 0;
        ctx.fillStyle = shade(base, 0.06);
        ctx.fillRect(rx, top, RIB, rh);
        // a bead-and-reel run down the rib's centre
        for (let by = top + 6; by < top + rh - 4; by += 13) {
          ctx.fillStyle = shade(base, 0.17);
          ctx.beginPath();
          ctx.ellipse(rx + RIB / 2, by, RIB * 0.26, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = shade(base, -0.2);
          ctx.fillRect(rx + RIB * 0.2, by + 5.5, RIB * 0.6, 1.6);
        }
      }

      y0 = top;
      rowIndex++;
    }

    /* ══════ four hundred years of weather ══════
     * All of it graded on canvas y, because the oculus is an open hole in the
     * top of this building and everything that has happened to the dome has
     * happened from there downward.
     */

    // plaster mottle over the whole column so five rows don't read as five
    // identical rows
    for (let i = 0; i < 2200; i++) {
      ctx.fillStyle = shade(base, (rng() - 0.5) * 0.12);
      ctx.globalAlpha = 0.14;
      ctx.fillRect(rng() * w, rng() * h, 2 + rng() * 5, 2 + rng() * 5);
    }
    ctx.globalAlpha = 1;

    // WATER. Rain has come through the eye for centuries and run down the
    // shell. Long, thin, mostly vertical stains, dark at the head and diffusing
    // as they descend, with a paler mineral crust at the edges.
    for (let i = 0; i < 26; i++) {
      const x = rng() * w;
      const len = h * (0.16 + rng() * 0.55);
      const wd = 2 + rng() * 11;
      const g = ctx.createLinearGradient(0, 0, 0, len);
      g.addColorStop(0, 'rgba(28,30,24,0.4)');
      g.addColorStop(0.35, 'rgba(38,42,34,0.2)');
      g.addColorStop(1, 'rgba(38,42,34,0)');
      ctx.save();
      ctx.translate(x, 0);
      ctx.fillStyle = g;
      ctx.fillRect(-wd / 2, 0, wd, len);
      // the efflorescent crust either side of the run
      ctx.globalAlpha = 0.16 + rng() * 0.16;
      ctx.fillStyle = '#d8d4c2';
      ctx.fillRect(-wd / 2 - 1.6, 0, 1.8, len * 0.7);
      ctx.fillRect(wd / 2 - 0.2, 0, 1.8, len * 0.7);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // CRACKS. Struck from near the crown, wandering down and branching — a
    // shell in compression cracks along its meridians, so these run with the
    // canvas rather than across it.
    for (let i = 0; i < 9; i++) {
      let cx = rng() * w;
      let cy = rng() * h * 0.4;
      const walk = (steps: number, wdt: number) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        for (let k = 0; k < steps; k++) {
          cx += (rng() - 0.5) * 9;
          cy += 7 + rng() * 12;
          ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = 'rgba(18,17,14,0.55)';
        ctx.lineWidth = wdt;
        ctx.stroke();
        // the lit lip below the crack, which is what makes it read as an
        // opening rather than a drawn line
        ctx.strokeStyle = 'rgba(210,204,182,0.16)';
        ctx.lineWidth = wdt * 0.7;
        ctx.stroke();
      };
      const bx = cx;
      const by = cy;
      walk(10 + Math.floor(rng() * 12), 0.9 + rng() * 1.1);
      if (rng() > 0.45) {
        cx = bx;
        cy = by;
        walk(5 + Math.floor(rng() * 6), 0.7);
      }
    }

    // REPAIRS. Two or three patches where the shell has been made good in a
    // mortar that never matched — the clearest single signal that a building
    // has been kept rather than merely survived.
    for (let i = 0; i < 3; i++) {
      const px = rng() * w;
      const py = rng() * h * 0.8;
      const pw = 14 + rng() * 34;
      const ph = 18 + rng() * 50;
      ctx.save();
      ctx.globalAlpha = 0.3 + rng() * 0.2;
      ctx.fillStyle = shade(base, 0.12 + rng() * 0.1);
      ctx.beginPath();
      ctx.ellipse(px, py, pw / 2, ph / 2, rng() * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = 'rgba(20,18,15,0.7)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // SOOT AND AGE at the eye. Four centuries of candle smoke leaves the crown
    // of a dome darkest, and the last metre before the oculus is where weather
    // and smoke have both been working.
    const crown = ctx.createLinearGradient(0, 0, 0, h * 0.45);
    crown.addColorStop(0, 'rgba(14,14,12,0.5)');
    crown.addColorStop(1, 'rgba(14,14,12,0)');
    ctx.fillStyle = crown;
    ctx.fillRect(0, 0, w, h * 0.45);
    // and a faint cool wash at the springing, where the room's own moonlight
    // reaches the shell
    const foot = ctx.createLinearGradient(0, h, 0, h * 0.72);
    foot.addColorStop(0, 'rgba(150,168,190,0.1)');
    foot.addColorStop(1, 'rgba(150,168,190,0)');
    ctx.fillStyle = foot;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
  });
}

/**
 * One panel of the wings' barrel vaults — a single coffer that tiles in both
 * directions. Its border is drawn at HALF width against each edge, so two
 * neighbouring tiles meet to form one full rib and the vault reads as a
 * continuous coffered soffit rather than a grid of stamps.
 *
 * The field is painted, not timbered: these are the ceilings of a museum of
 * the esoteric, and a gilt star at the centre of every coffer costs nothing
 * and turns 47 m of brown boarding into a night sky held up by ribs.
 */
export function vaultCoffer(base = '#2f3b3a', gilt = '#c39a4e', seed = 67): THREE.CanvasTexture {
  return make(`vaultcoffer|${base}|${gilt}|${seed}`, [256, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    const RIB = w * 0.055; // half the rib; the neighbouring tile supplies the rest
    ctx.fillStyle = shade(base, 0.16);
    ctx.fillRect(0, 0, w, h);
    // stepped recess in from the rib
    const steps = 3;
    for (let s = 0; s < steps; s++) {
      const inset = RIB + (w * 0.055) * s;
      ctx.fillStyle = shade(base, 0.06 - s * 0.09);
      ctx.fillRect(inset, inset, w - inset * 2, h - inset * 2);
    }
    const f = RIB + w * 0.055 * steps;
    // the sunk field, and a scatter of small stars in it
    ctx.fillStyle = shade(base, -0.16);
    ctx.fillRect(f, f, w - f * 2, h - f * 2);
    ctx.fillStyle = '#cfe0e8';
    for (let i = 0; i < 14; i++) {
      ctx.globalAlpha = 0.25 + rng() * 0.5;
      const sx = f + rng() * (w - f * 2);
      const sy = f + rng() * (h - f * 2);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
    // the gilt star at the coffer's centre — eight points, drawn as two
    // crossed four-point stars so it keeps its shape at a distance
    const c = w / 2;
    const R = w * 0.115;
    ctx.fillStyle = gilt;
    for (const turn of [0, Math.PI / 4]) {
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(turn);
      ctx.globalAlpha = turn === 0 ? 0.95 : 0.6;
      ctx.beginPath();
      for (let p = 0; p < 4; p++) {
        const a = (p / 4) * Math.PI * 2;
        const a2 = a + Math.PI / 4;
        ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
        ctx.lineTo(Math.cos(a2) * R * 0.34, Math.sin(a2) * R * 0.34);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });
}

/** a circular medallion rug for the rotunda floor */
export function rugRound(field = '#6e2530', accent = '#d9a648', seed = 77): THREE.CanvasTexture {
  return make(`ruground|${field}|${accent}|${seed}`, [512, 512], (ctx, w) => {
    const rng = mulberry32(seed);
    const c = w / 2;
    ctx.fillStyle = field;
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 2400; i++) {
      ctx.fillStyle = shade(field, (rng() - 0.5) * 0.12);
      ctx.globalAlpha = 0.25;
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * c;
      ctx.fillRect(c + Math.cos(a) * r, c + Math.sin(a) * r, 2.5, 1.5);
    }
    ctx.globalAlpha = 1;
    // concentric rings
    ctx.strokeStyle = accent;
    for (const [r, lw] of [
      [c - 10, 5],
      [c - 26, 2],
      [c * 0.62, 3],
      [c * 0.3, 2.5],
    ] as const) {
      ctx.lineWidth = lw as number;
      ctx.beginPath();
      ctx.arc(c, c, r as number, 0, Math.PI * 2);
      ctx.stroke();
    }
    // eight-pointed compass star
    ctx.fillStyle = accent;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const long = i % 2 === 0 ? c * 0.52 : c * 0.36;
      ctx.beginPath();
      ctx.moveTo(c + Math.cos(a) * long, c + Math.sin(a) * long);
      ctx.lineTo(c + Math.cos(a + 0.22) * c * 0.12, c + Math.sin(a + 0.22) * c * 0.12);
      ctx.lineTo(c + Math.cos(a - 0.22) * c * 0.12, c + Math.sin(a - 0.22) * c * 0.12);
      ctx.closePath();
      ctx.fill();
    }
    // guard diamonds between the rings
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const r = c * 0.8;
      ctx.save();
      ctx.translate(c + Math.cos(a) * r, c + Math.sin(a) * r);
      ctx.rotate(a);
      ctx.fillRect(-4, -8, 8, 16);
      ctx.restore();
    }
  }, false);
}

/** wizard cloth: deep-dyed weave scattered with little gold stars and moons */
export function starryRobe(base = '#4a5a8a', seed = 44): THREE.CanvasTexture {
  return make(`robe|${base}|${seed}`, [128, 128], (ctx, w) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, w);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = shade(base, (rng() - 0.5) * 0.1);
      ctx.globalAlpha = 0.35;
      ctx.fillRect(rng() * w, rng() * w, 2, 2);
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 9; i++) {
      const x = rng() * w;
      const y = rng() * w;
      ctx.fillStyle = '#e8c977';
      if (rng() > 0.4) {
        // little star
        ctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = -Math.PI / 2 + (k * 4 * Math.PI) / 5;
          ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * 4.2, y + Math.sin(a) * 4.2);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // little moon
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = base;
        ctx.beginPath();
        ctx.arc(x + 2, y - 1, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

/** blossoms among leaves, for the flowering pots */
export function flowerCluster(petal = '#d88ab0', seed = 51): THREE.CanvasTexture {
  return make(`flowers|${petal}|${seed}`, [128, 128], (ctx, w) => {
    const rng = mulberry32(seed);
    ctx.clearRect(0, 0, w, w);
    // leaf ground
    for (let i = 0; i < 16; i++) {
      const x = w / 2 + (rng() - 0.5) * w * 0.7;
      const y = w / 2 + (rng() - 0.5) * w * 0.7;
      const a = rng() * Math.PI * 2;
      const len = 12 + rng() * 12;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = shade('#4d7c50', (rng() - 0.5) * 0.16);
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.ellipse(0, 0, len, len * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // blossoms
    for (let i = 0; i < 7; i++) {
      const x = w / 2 + (rng() - 0.5) * w * 0.62;
      const y = w / 2 + (rng() - 0.5) * w * 0.62;
      const r = 5 + rng() * 3.5;
      ctx.globalAlpha = 1;
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2 + rng();
        ctx.fillStyle = shade(petal, (rng() - 0.5) * 0.12);
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, r * 0.75, r * 0.5, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f0dda6';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

/** tabby fur: soft base with wavy darker bands, for the library cat */
export function tabbyFur(base = '#4c4854', stripe = '#332f3b', seed = 61): THREE.CanvasTexture {
  return make(`fur|${base}|${stripe}|${seed}`, [128, 128], (ctx, w) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, w);
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = shade(base, (rng() - 0.5) * 0.12);
      ctx.globalAlpha = 0.35;
      ctx.fillRect(rng() * w, rng() * w, 1.6, 2.6);
    }
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 7; i++) {
      const x0 = (i / 7) * w + rng() * 8;
      ctx.strokeStyle = stripe;
      ctx.lineWidth = 5 + rng() * 4;
      ctx.beginPath();
      ctx.moveTo(x0, -4);
      ctx.bezierCurveTo(x0 + 10, w * 0.33, x0 - 10, w * 0.66, x0 + 6, w + 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

/** layered feather speckle for the owl */
export function featherSpeckle(base = '#6b4d33', seed = 71): THREE.CanvasTexture {
  return make(`feathers|${base}|${seed}`, [128, 128], (ctx, w) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, w);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const x = col * 16 + (row % 2) * 8 + (rng() - 0.5) * 4;
        const y = row * 16 + (rng() - 0.5) * 4;
        ctx.strokeStyle = shade(base, 0.12 + rng() * 0.08);
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, 6 + rng() * 2, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = shade(base, -0.14);
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(x, y + 2, 6 + rng() * 2, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });
}

/** a cluster of painted leaves on transparent ground, for foliage sprites */
export function leafCluster(tone = '#4d7c50', seed = 15): THREE.CanvasTexture {
  return make(`leaves|${tone}|${seed}`, [128, 128], (ctx, w) => {
    const rng = mulberry32(seed);
    ctx.clearRect(0, 0, w, w);
    for (let i = 0; i < 26; i++) {
      const x = w / 2 + (rng() - 0.5) * w * 0.72;
      const y = w / 2 + (rng() - 0.5) * w * 0.72;
      const a = rng() * Math.PI * 2;
      const len = 14 + rng() * 14;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = shade(tone, (rng() - 0.5) * 0.16);
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.ellipse(0, 0, len, len * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = shade(tone, -0.2);
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }, false);
}

/**
 * Bark for the halls' timber order. The same trick as `flutes` — vertical
 * ridges shaded as rounded ribs with deep fissures between them, so a plain
 * cylinder reads as a limb of old oak without a single extra vertex. Painted
 * on its own base so a material can use it untinted, exactly as flutes is.
 */
export function bark(base = '#4a3a28', count = 9, seed = 37): THREE.CanvasTexture {
  return make(`bark|${base}|${count}|${seed}`, [256, 512], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const rw = w / count;
    for (let i = 0; i < count; i++) {
      const x0 = i * rw;
      // a rounded rib: bright along its crown, falling away to the fissure
      const g = ctx.createLinearGradient(x0, 0, x0 + rw, 0);
      g.addColorStop(0, shade(base, -0.13));
      g.addColorStop(0.42, shade(base, 0.08));
      g.addColorStop(0.58, shade(base, 0.06));
      g.addColorStop(1, shade(base, -0.13));
      ctx.fillStyle = g;
      ctx.fillRect(x0, 0, rw, h);
      // the fissure itself — wandering, not a ruled line, which is the whole
      // difference between bark and fluting
      ctx.strokeStyle = shade(base, -0.24);
      ctx.lineWidth = 1.6 + rng() * 1.4;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      let x = x0;
      ctx.moveTo(x, 0);
      for (let y = 0; y <= h; y += 24) {
        x += (rng() - 0.5) * 5;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // short cross-checks and lichen flecks so long limbs don't band
    for (let i = 0; i < 900; i++) {
      const lichen = rng() < 0.18;
      ctx.fillStyle = lichen ? shade('#6c7a4a', (rng() - 0.5) * 0.2) : shade(base, (rng() - 0.5) * 0.16);
      ctx.globalAlpha = lichen ? 0.22 : 0.3;
      ctx.fillRect(rng() * w, rng() * h, 1 + rng() * 3, 2 + rng() * 7);
    }
    ctx.globalAlpha = 1;
  });
}

/**
 * A vertical runner of ivy on transparent ground — a climbing stem with leaves
 * budding off it, for the growth that has taken the halls. Alpha-cut quads
 * carrying this are the cheapest convincing foliage there is: one draw call for
 * every creeper in the building.
 */
export function ivyRunner(tone = '#3f6340', seed = 19): THREE.CanvasTexture {
  return make(`ivy|${tone}|${seed}`, [128, 512], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.clearRect(0, 0, w, h);
    // the stem, wandering up the strip
    const xs: number[] = [];
    let x = w / 2;
    ctx.beginPath();
    ctx.moveTo(x, h);
    for (let y = h; y >= 0; y -= 16) {
      x += (rng() - 0.5) * 9;
      x = Math.max(w * 0.22, Math.min(w * 0.78, x));
      xs.push(x);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = shade(tone, -0.22);
    ctx.lineWidth = 3;
    ctx.stroke();
    // leaves budding alternately off the stem, thinning toward the tip so the
    // creeper reads as still climbing rather than stopping dead
    xs.forEach((sx, i) => {
      const y = h - i * 16;
      if (rng() > 0.62) return;
      const side = i % 2 === 0 ? 1 : -1;
      const grow = 0.45 + 0.55 * (i / xs.length < 0.8 ? 1 : 0.4);
      const r = (11 + rng() * 9) * grow;
      ctx.save();
      ctx.translate(sx + side * r * 0.6, y);
      ctx.rotate(side * (0.4 + rng() * 0.7));
      ctx.fillStyle = shade(tone, (rng() - 0.5) * 0.22);
      ctx.globalAlpha = 0.96;
      // a rough ivy leaf: three lobes off a stubby petiole
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(r * 0.7, -r * 0.75, r * 1.5, -r * 0.1);
      ctx.quadraticCurveTo(r * 0.9, r * 0.15, r * 1.35, r * 0.85);
      ctx.quadraticCurveTo(r * 0.5, r * 0.6, 0, 0);
      ctx.fill();
      ctx.strokeStyle = shade(tone, -0.24);
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }, false);
}

/**
 * A bank of card-catalogue drawers: the single most recognisable piece of
 * furniture a library owns, and the right backdrop for a Librarian who IS the
 * catalogue — walk up to her and the search opens.
 *
 * Painted rather than modelled. A wall of these is forty-odd drawers, each
 * wanting a front, a bevel, a pull and a label holder; as geometry that is
 * hundreds of meshes for something a visitor reads as texture from two metres
 * away. Baked, it is one draw call and every drawer still has its own brass
 * pull and its own hand-lettered index range.
 */
export function catalogueDrawers(): THREE.CanvasTexture {
  const COLS = 5;
  const ROWS = 8;
  return make('catalogue-drawers', [512, 768], (ctx, w, h) => {
    const rng = mulberry32(613);
    // the carcass showing between the drawers
    ctx.fillStyle = '#33241a';
    ctx.fillRect(0, 0, w, h);

    const cw = w / COLS;
    const ch = h / ROWS;
    const inset = 3;
    // the index ranges running A→Z down the bank, the way a catalogue is filed
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let cursor = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * cw + inset;
        const y = r * ch + inset;
        const dw = cw - inset * 2;
        const dh = ch - inset * 2;

        // the drawer face, lit from above so the bank has relief
        const g = ctx.createLinearGradient(0, y, 0, y + dh);
        g.addColorStop(0, '#8a6a45');
        g.addColorStop(0.5, '#75593a');
        g.addColorStop(1, '#5e4630');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, dw, dh);
        // grain
        ctx.globalAlpha = 0.07;
        for (let i = 0; i < 14; i++) {
          ctx.fillStyle = rng() > 0.5 ? '#c49a68' : '#3d2c1c';
          ctx.fillRect(x, y + rng() * dh, dw, 0.8);
        }
        ctx.globalAlpha = 1;
        // a highlight along the top edge and a shadow under the bottom
        ctx.fillStyle = 'rgba(255,225,180,0.22)';
        ctx.fillRect(x, y, dw, 1.5);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(x, y + dh - 2, dw, 2);

        // the brass label holder, and the index range written on its card
        const lw = dw * 0.52;
        const lh = dh * 0.34;
        const lx = x + (dw - lw) / 2;
        const ly = y + dh * 0.16;
        ctx.fillStyle = '#b98a3d';
        ctx.fillRect(lx - 2, ly - 2, lw + 4, lh + 4);
        ctx.fillStyle = '#efe6cf';
        ctx.fillRect(lx, ly, lw, lh);
        const a = letters[Math.min(25, cursor)];
        const b = letters[Math.min(25, cursor + 1)];
        cursor += rng() > 0.55 ? 1 : 0;
        ctx.fillStyle = '#4a3521';
        ctx.font = `${Math.round(lh * 0.62)}px Georgia, "Times New Roman", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${a}–${b}`, lx + lw / 2, ly + lh / 2 + 1);

        // the pull below it
        ctx.fillStyle = '#c9a24a';
        ctx.beginPath();
        ctx.ellipse(x + dw / 2, y + dh * 0.72, dw * 0.15, dh * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(60,42,18,0.55)';
        ctx.beginPath();
        ctx.ellipse(x + dw / 2, y + dh * 0.75, dw * 0.11, dh * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, false);
}

/**
 * The carved inscription band over the Librarian's station: the axiom of the
 * Emerald Tablet, which is the thesis the whole museum is arranged around.
 *
 * Set in Vs for Us the way a period lapidary inscription is, with the English
 * cut smaller beneath it. The letters are drawn twice — a dark stroke and a
 * bright one offset a pixel up — which is what reads as cut into stone rather
 * than painted onto it.
 */
export function inscriptionBand(): THREE.CanvasTexture {
  return make('inscription-band', [2048, 320], (ctx, w, h) => {
    // the stone ground
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#4b3a26');
    g.addColorStop(0.45, '#5d4831');
    g.addColorStop(1, '#3d2f1f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // rules above and below, with a lozenge at each end
    ctx.strokeStyle = '#c9a648';
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 4;
    for (const y of [26, h - 26]) {
      ctx.beginPath();
      ctx.moveTo(70, y);
      ctx.lineTo(w - 70, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#c9a648';
    for (const cx of [46, w - 46]) {
      ctx.beginPath();
      ctx.moveTo(cx, h / 2 - 26);
      ctx.lineTo(cx + 20, h / 2);
      ctx.lineTo(cx, h / 2 + 26);
      ctx.lineTo(cx - 20, h / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    /** Cut a line, shrinking it to fit between the end lozenges.
     *  Letter-spacing a 45-character Latin line at a fixed size overran the
     *  canvas and the ends were silently clipped — the inscription read
     *  "INFERIVS EST SICVT QVOD EST", missing a word off each end. */
    const cut = (text: string, size: number, y: number, spacing: number) => {
      const spaced = [...text].join(' '.repeat(spacing));
      const maxW = w - 330;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let px = size;
      ctx.font = `${px}px "Cormorant Garamond", Georgia, serif`;
      const measured = ctx.measureText(spaced).width;
      if (measured > maxW) {
        px = Math.floor(px * (maxW / measured));
        ctx.font = `${px}px "Cormorant Garamond", Georgia, serif`;
      }
      ctx.fillStyle = '#241a0e';
      ctx.globalAlpha = 0.9;
      ctx.fillText(spaced, w / 2, y + 3);
      ctx.fillStyle = '#f0d492';
      ctx.globalAlpha = 0.92;
      ctx.fillText(spaced, w / 2, y);
      ctx.globalAlpha = 1;
    };
    cut('QVOD EST INFERIVS EST SICVT QVOD EST SVPERIVS', 84, 128, 1);
    cut('THAT WHICH IS BELOW IS AS THAT WHICH IS ABOVE', 44, 232, 1);
  }, false);
}

/**
 * The crimson silk behind every niched figure.
 *
 * What was here was a 512² field with a quatrefoil diaper stroked over it in
 * 2 px lines: at the size this hangs — a 2.7 m barrel two metres from the
 * visitor — that read as red paint with a faint pattern printed on it, and the
 * one surface in the building whose whole job is to be sumptuous was the
 * flattest thing in the room.
 *
 * This is a *ferronerie* velvet instead: the Italian ogival "griccia", which is
 * what actually hung behind marbles in the rooms this rotunda is quoting. Three
 * things make it read as cloth rather than as a pattern:
 *
 * 1. THREE SURFACES, NOT ONE COLOUR. A cut velvet has a voided satin ground
 *    (smooth, catches the light, lighter), cut pile (matte, deep, darker), and
 *    metal thread. They are drawn as three distinct values here, and the ground
 *    carries horizontal weft-float sheen bands so the light runs across it the
 *    way it runs across silk.
 * 2. THE MOTIF IS BIG. One pomegranate every half-tile, not a sprig every
 *    64 px. Historic velvets are drawn at the scale of a hand for exactly the
 *    reason they need to read across a room.
 * 3. THE METAL IS LOOPED, NOT LINED. `bouclé` lays gold as a row of small
 *    overlapping loops with jittered tone. A stroked gold line is the single
 *    clearest tell of a painted texture; a row of loops catches light unevenly
 *    and is what the eye actually recognises as brocade.
 *
 * Held about a stop brighter than a plain wool hanging on purpose — see the
 * note on `fabric_niche_damask` in library.json. At the stock #6d222a this
 * alcove goes to brown mud under an 85%-shadow rig and the red disappears.
 *
 * Seamless across x (the barrel wraps it 2.4 times) and NOT across y: the top
 * edge is the gilt fillet at the springing, the bottom is the hem.
 */
export function nicheDamask(field = '#6d222a', seed = 91): THREE.CanvasTexture {
  // Drawn at 2048² but LAID OUT in the old 1024 space: the whole thing is
  // scaled once here, and every coordinate below is unchanged. Every motif in
  // this painter is vector — ogees, pomegranates, bouclé loops — so the extra
  // pixels go straight into their edges. The alternative, multiplying two
  // hundred hand-tuned constants by two, changes the drawing as well as its
  // resolution, and this hanging is a metre from the visitor's face: it is one
  // of the few surfaces in the building where 2k is actually resolved.
  return make(`damask2k|${field}|${seed}`, [2048, 2048], (ctx, cw, ch) => {
    const S = cw / 1024;
    ctx.scale(S, S);
    const w = cw / S;
    const h = ch / S;
    const rng = mulberry32(seed);
    // The three surfaces sit CLOSE together on purpose. The first cut ran the
    // pile a full 0.14 below the field and the stems came out near black — the
    // hanging read as dark snakes on pink rather than as one red cloth with a
    // figure in it. A real cut velvet is nearly monochrome; what separates pile
    // from ground is mostly sheen, and the tonal step is small.
    const GROUND = shade(field, 0.05); // voided satin — the lit surface
    const PILE = shade(field, -0.045); // cut pile — matte and deep
    const PILE_DK = shade(field, -0.085);
    const GOLD = '#d2ab55';
    const GOLD_DK = '#96742f';

    /* ——— the voided ground ——— */
    ctx.fillStyle = GROUND;
    ctx.fillRect(0, 0, w, h);
    // weft floats: the horizontal sheen of a satin ground, uneven because the
    // beat of a hand loom is uneven
    for (let y = 0; y < h; y += 3) {
      ctx.globalAlpha = 0.1 + rng() * 0.16;
      ctx.fillStyle = shade(GROUND, rng() > 0.5 ? 0.06 : -0.05);
      ctx.fillRect(0, y, w, 1.6);
    }
    // and the warp, much fainter — silk shows its weft, not its warp
    for (let x = 0; x < w; x += 4) {
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = shade(GROUND, -0.06);
      ctx.fillRect(x, 0, 1, h);
    }
    // A fine voided sprig over the whole ground. Historic velvets are never
    // bare between their compartments — a plain field at this scale is what
    // makes a painted texture look painted, because real cloth has no empty
    // places in it. Half-drop, tiny, and barely a value apart from the ground.
    for (let row = 0; row * 34 < h + 34; row++) {
      for (let col = 0; col * 34 < w + 34; col++) {
        const sx = col * 34 + (row % 2) * 17;
        const sy = row * 34;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(rng() * 0.3 - 0.15);
        ctx.fillStyle = shade(GROUND, -0.035);
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 3.4, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 3.4, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;

    /** a filled shape in cut pile: darker, matte, with a lifted edge where the
     *  pile is cut and the light catches the standing tufts */
    const pile = (path: () => void, tone = PILE) => {
      ctx.save();
      ctx.beginPath();
      path();
      ctx.fillStyle = tone;
      ctx.fill();
      ctx.strokeStyle = shade(tone, 0.1);
      ctx.lineWidth = 2.2;
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.restore();
    };

    /** metal thread laid as loops — see the note above on why this is not a line */
    const boucle = (pts: [number, number][], size: number, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[i + 1];
        const seg = Math.hypot(x1 - x0, y1 - y0);
        const n = Math.max(1, Math.round(seg / (size * 0.8)));
        for (let k = 0; k < n; k++) {
          const t = k / n;
          const px = x0 + (x1 - x0) * t + (rng() - 0.5) * size * 0.5;
          const py = y0 + (y1 - y0) * t + (rng() - 0.5) * size * 0.5;
          ctx.beginPath();
          ctx.arc(px, py, size * (0.45 + rng() * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = rng() > 0.42 ? GOLD : GOLD_DK;
          ctx.fill();
        }
      }
      ctx.restore();
    };

    /** sample a cubic through four points, for laying bouclé along a curve */
    const curve = (
      p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number], n = 22,
    ): [number, number][] =>
      Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n;
        const m = 1 - t;
        return [
          m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
          m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
        ] as [number, number];
      });

    /* ——— the ogival lattice ———
     * Two compartments across, two down, on a half-drop. The stems are drawn
     * TWICE, once at x and once at x ± w/2, so every curve that leaves one side
     * of the tile arrives on the other and the wrap is invisible.
     */
    const CW = w / 2; // compartment width
    const CH = h / 2; // compartment height
    const stemW = 15;

    /** one ogee stem rising from (x, y+CH) to the point at (x, y), bulging out
     *  to ±CW/2 on the way — the compartment's left or right side */
    const ogee = (x: number, y: number, dir: 1 | -1) => {
      const a: [number, number] = [x, y + CH];
      const b: [number, number] = [x + dir * CW * 0.52, y + CH * 0.72];
      const c: [number, number] = [x + dir * CW * 0.5, y + CH * 0.24];
      const d: [number, number] = [x, y];
      const spine = curve(a, b, c, d, 26);
      // the stem itself, in pile, with serrated leaf edges
      pile(() => {
        ctx.moveTo(spine[0][0] - dir * stemW, spine[0][1]);
        for (const [px, py] of spine) ctx.lineTo(px - dir * stemW * 0.5, py);
        for (let i = spine.length - 1; i >= 0; i--) {
          const [px, py] = spine[i];
          ctx.lineTo(px + dir * stemW * 0.5, py);
        }
        ctx.closePath();
      }, PILE_DK);
      // acanthus serrations budding off the outer edge
      for (let i = 3; i < spine.length - 3; i += 4) {
        const [px, py] = spine[i];
        const r = 13 + rng() * 12;
        pile(() => {
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo(px + dir * r * 1.5, py - r * 0.5, px + dir * r * 1.1, py + r * 0.9);
          ctx.quadraticCurveTo(px + dir * r * 0.4, py + r * 0.3, px, py);
        });
      }
      boucle(spine, 2.6, 0.75);
      return spine;
    };

    /** the pomegranate at the heart of a compartment: a bulb of pile scored
     *  with gold, a crown of sepals, and a pair of curling leaves */
    const pomegranate = (cx: number, cy: number, s: number) => {
      // the two leaves it sits between
      for (const dir of [-1, 1] as const) {
        pile(() => {
          ctx.moveTo(cx, cy + s * 0.5);
          ctx.quadraticCurveTo(cx + dir * s * 1.5, cy + s * 0.55, cx + dir * s * 1.15, cy - s * 0.45);
          ctx.quadraticCurveTo(cx + dir * s * 0.7, cy + s * 0.1, cx, cy + s * 0.5);
        }, PILE_DK);
      }
      // the fruit
      pile(() => {
        ctx.moveTo(cx, cy + s * 0.95);
        ctx.bezierCurveTo(cx - s * 0.92, cy + s * 0.45, cx - s * 0.78, cy - s * 0.6, cx, cy - s * 0.72);
        ctx.bezierCurveTo(cx + s * 0.78, cy - s * 0.6, cx + s * 0.92, cy + s * 0.45, cx, cy + s * 0.95);
      });
      // the scale-hatching that says pomegranate and not onion
      for (let r = 0.25; r < 1; r += 0.24) {
        const pts: [number, number][] = [];
        for (let i = 0; i <= 12; i++) {
          const t = -Math.PI * 0.86 + (i / 12) * Math.PI * 0.72;
          pts.push([cx + Math.cos(t) * s * 0.8 * r * 1.6, cy + s * 0.5 - Math.sin(t) * s * r * 1.1]);
        }
        boucle(pts, 2.1, 0.62);
      }
      // the calyx crown
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.34;
        boucle(
          [[cx, cy - s * 0.55], [cx + Math.cos(a) * s * 0.5, cy - s * 0.55 + Math.sin(a) * s * 0.5]],
          2.3,
          0.8,
        );
      }
    };

    /** a small palmette to fill the space between compartments */
    const palmette = (cx: number, cy: number, s: number) => {
      for (let i = -2; i <= 2; i++) {
        const a = -Math.PI / 2 + i * 0.42;
        pile(() => {
          ctx.moveTo(cx, cy + s * 0.4);
          ctx.quadraticCurveTo(
            cx + Math.cos(a) * s * 0.9 - Math.sin(a) * s * 0.28,
            cy + s * 0.4 + Math.sin(a) * s * 0.9 + Math.cos(a) * s * 0.28,
            cx + Math.cos(a) * s,
            cy + s * 0.4 + Math.sin(a) * s,
          );
          ctx.quadraticCurveTo(cx + Math.cos(a) * s * 0.5, cy + s * 0.4 + Math.sin(a) * s * 0.5, cx, cy + s * 0.4);
        });
      }
      boucle([[cx, cy + s * 0.45], [cx, cy - s * 0.3]], 2.4, 0.7);
    };

    // draw the lattice on a half-drop: column 0 at y 0, column 1 dropped by CH/2
    for (let col = -1; col <= 2; col++) {
      for (let row = -1; row <= 2; row++) {
        const cx = col * CW + CW / 2;
        const cy = row * CH + (col & 1 ? CH / 2 : 0);
        ogee(cx, cy, 1);
        ogee(cx, cy, -1);
        pomegranate(cx, cy + CH * 0.52, CW * 0.2);
        palmette(cx, cy + CH * 0.03, CW * 0.1);
      }
    }

    /* ——— age ———
     * The pile has been dusted, rubbed where shoulders pass, and faded at the
     * top where the light from the drum has been falling on it for a very long
     * time. None of it is strong: this is a treasured hanging, not a ruin.
     */
    // Kept small and faint. At 20–110 px these were pale clouds the size of the
    // pomegranates, and they read as bleach stains rather than as dust.
    for (let i = 0; i < 260; i++) {
      ctx.globalAlpha = 0.018 + rng() * 0.035;
      ctx.fillStyle = rng() > 0.45 ? '#d8c8a8' : '#160a0b';
      ctx.beginPath();
      ctx.ellipse(rng() * w, rng() * h, 8 + rng() * 34, 6 + rng() * 22, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // a handful of pulled threads
    for (let i = 0; i < 26; i++) {
      const x = rng() * w;
      const y = rng() * h;
      ctx.globalAlpha = 0.16 + rng() * 0.2;
      ctx.strokeStyle = shade(GROUND, 0.16);
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rng() - 0.5) * 26, y + (rng() - 0.5) * 5);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // sun-fade toward the springing, where the drum's light reaches
    const fade = ctx.createLinearGradient(0, 0, 0, h);
    fade.addColorStop(0, 'rgba(232,206,166,0.13)');
    fade.addColorStop(0.45, 'rgba(232,206,166,0)');
    fade.addColorStop(1, 'rgba(18,8,9,0.16)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, w, h);

    /* ——— the gilt fillet at the springing ———
     * Canvas y=0 is v=1 (three flips Y), and v=1 is where the barrel meets the
     * conch — so the top of this image is the top of the hanging.
     */
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.92;
    ctx.fillRect(0, 0, w, 13);
    ctx.globalAlpha = 0.45;
    ctx.fillRect(0, 17, w, 5);
    ctx.globalAlpha = 1;
    // an egg-and-dart run under it, so the fillet is a moulding and not a stripe
    for (let x = 0; x < w; x += 26) {
      ctx.fillStyle = GOLD_DK;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.ellipse(x + 13, 30, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 26, 25);
      ctx.lineTo(x + 28, 36);
      ctx.lineTo(x + 24, 36);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // and the hem at the foot, weighted and a little dusty
    ctx.fillStyle = shade(PILE_DK, -0.05);
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, h - 16, w, 16);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = GOLD_DK;
    ctx.fillRect(0, h - 19, w, 3);
    ctx.globalAlpha = 1;
  });
}

/**
 * The GOLD-TESSERA MOSAIC of a niche conch — the stand-in for
 * `stone_niche_mosaic`.
 *
 * Brick was tried here first and it fought the hanging: a cool grey-brown
 * masonry sitting straight on top of a crimson silk, two unrelated materials
 * meeting at a hard line with nothing shared between them. A gold ground is
 * the historic answer to exactly that problem — every apse from Ravenna to San
 * Marco puts gold over a red dado, because gold and crimson are the same
 * warmth at different values and the eye reads them as one surface deepening.
 * It also picks up the brass archivolt framing the recess and the candle flames
 * standing at its foot, which nothing about brick did.
 *
 * Drawn as a straight tessera grid. The quarter-sphere's UVs fan the columns
 * toward the crown on their own, which is how a real mosaicist sets an apse:
 * the courses converge and the tesserae get narrower ring by ring. Drawing the
 * fan into the map would fan it twice.
 *
 * Gold leaf tesserae are individually SET, never flush — each one is bedded at
 * its own slight angle so the wall glitters unevenly rather than reflecting
 * like a sheet. That is what the per-tessera tone jitter is doing, and it is
 * the whole difference between mosaic and gold paint.
 */
export function conchMosaic(seed = 31): THREE.CanvasTexture {
  return make(`conchmosaic|${seed}`, [1024, 512], (ctx, w, h) => {
    const rng = mulberry32(seed);
    // warm dark bedding mortar — a hair of it shows between every tessera and
    // is what keeps the gold from reading as one flat sheet
    const BED = '#3a2a1c';
    // the gold run: leaf under glass, so the range is wide and warm
    const GOLD = ['#a8813a', '#c39a4a', '#8e6b2e', '#b98c3f', '#d2ae5e', '#7d5c28'];
    // and the crimson and bronze tesserae that tie the dome to the hanging
    // below it — a mosaic ground is never pure gold, and these are what carry
    // the damask's red up into the vault
    const ACCENT = ['#7d2b31', '#93303b', '#5e2228', '#6b4a2a'];
    ctx.fillStyle = BED;
    ctx.fillRect(0, 0, w, h);

    const cols = 64;
    const rows = 26;
    const tw = w / cols;
    const th = h / rows;
    for (let r = 0; r < rows; r++) {
      // courses are laid by hand and wander; the offset per row is what stops
      // the grid reading as tile
      const off = (rng() - 0.5) * tw * 0.5 + (r % 2) * tw * 0.35;
      for (let c = -1; c <= cols; c++) {
        const jx = (rng() - 0.5) * tw * 0.18;
        const jy = (rng() - 0.5) * th * 0.14;
        const x = c * tw + off + jx;
        const y = r * th + jy;
        const iw = tw * (0.78 + rng() * 0.14);
        const ih = th * (0.78 + rng() * 0.14);
        // accents thin out toward the crown, the way a real ground does
        const accent = rng() < 0.1 * (r / rows) + 0.035;
        const pal = accent ? ACCENT : GOLD;
        const tone = pal[Math.floor(rng() * pal.length)];
        ctx.save();
        ctx.translate(x + iw / 2, y + ih / 2);
        // each tessera bedded at its own angle
        ctx.rotate((rng() - 0.5) * 0.14);
        ctx.fillStyle = tone;
        ctx.fillRect(-iw / 2, -ih / 2, iw, ih);
        // the set: a lit edge on one side, a shadow on the other, direction
        // varying per tessera because they do not all lie the same way
        const lit = rng() > 0.5;
        ctx.fillStyle = shade(tone, lit ? 0.16 : -0.14);
        ctx.fillRect(-iw / 2, -ih / 2, iw, ih * 0.22);
        ctx.fillStyle = shade(tone, lit ? -0.16 : 0.1);
        ctx.fillRect(-iw / 2, ih / 2 - ih * 0.2, iw, ih * 0.2);
        // the glass over the leaf: a specular nick, off-centre
        if (!accent && rng() > 0.45) {
          ctx.globalAlpha = 0.25 + rng() * 0.3;
          ctx.fillStyle = '#f0dca6';
          ctx.fillRect(-iw / 2 + iw * rng() * 0.5, -ih / 2 + ih * rng() * 0.4, iw * 0.22, ih * 0.16);
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }
    }

    // soot and the dulling of old leaf, gathering toward the crown — v=1 is the
    // springing, v=0 the top of the dome, and two centuries of candle smoke
    // leave in that direction
    const soot = ctx.createLinearGradient(0, 0, 0, h);
    soot.addColorStop(0, 'rgba(16,10,6,0.5)');
    soot.addColorStop(0.55, 'rgba(16,10,6,0.16)');
    soot.addColorStop(1, 'rgba(16,10,6,0.04)');
    ctx.fillStyle = soot;
    ctx.fillRect(0, 0, w, h);
    // and a few tesserae lost altogether, down to the bedding
    for (let i = 0; i < 34; i++) {
      ctx.globalAlpha = 0.5 + rng() * 0.4;
      ctx.fillStyle = shade(BED, (rng() - 0.5) * 0.1);
      ctx.fillRect(rng() * w, rng() * h, tw * 0.9, th * 0.9);
    }
    ctx.globalAlpha = 1;
  });
}

/**
 * The coffered plaster of a niche conch. Painted as a straight grid — the
 * quarter-sphere's UV mapping fans the columns toward the crown on its own,
 * which is exactly how real coffers converge on a dome. Each coffer is a
 * sunken square: lit top-left edge, shadowed bottom-right, a gilt rosette
 * boss at the centre.
 */
export function conchCoffers(seed = 47): THREE.CanvasTexture {
  return make(`coffers|${seed}`, [512, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = '#b8a888';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = shade('#b8a888', (rng() - 0.5) * 0.08);
      ctx.globalAlpha = 0.3;
      ctx.fillRect(rng() * w, rng() * h, 3, 2);
    }
    ctx.globalAlpha = 1;
    const cols = 8;
    const rows = 3;
    const cw = w / cols;
    const ch = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cw;
        const y = r * ch;
        const inset = 7;
        // sunken field
        ctx.fillStyle = '#a3906f';
        ctx.fillRect(x + inset, y + inset, cw - inset * 2, ch - inset * 2);
        ctx.fillStyle = '#8d7b5e';
        ctx.fillRect(x + inset + 6, y + inset + 6, cw - inset * 2 - 12, ch - inset * 2 - 12);
        // bevel: light above, shadow below
        ctx.strokeStyle = '#d6c6a2';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x + inset, y + ch - inset);
        ctx.lineTo(x + inset, y + inset);
        ctx.lineTo(x + cw - inset, y + inset);
        ctx.stroke();
        ctx.strokeStyle = '#6b5c46';
        ctx.beginPath();
        ctx.moveTo(x + inset, y + ch - inset);
        ctx.lineTo(x + cw - inset, y + ch - inset);
        ctx.lineTo(x + cw - inset, y + inset);
        ctx.stroke();
        // gilt rosette boss
        const bx = x + cw / 2;
        const by = y + ch / 2;
        ctx.fillStyle = '#c9a648';
        for (let p = 0; p < 8; p++) {
          const a = (p / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(bx + Math.cos(a) * 5, by + Math.sin(a) * 5, 4.5, 2.2, a, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#e8cf86';
        ctx.beginPath();
        ctx.arc(bx, by, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

/**
 * A half-round hearth rug for the foot of a statue niche: crimson field,
 * double gilt border following the curve, a fan of rays from the flat edge —
 * the rug the figure "faces down" into the rotunda.
 *
 * Painted into the UPPER half of a square canvas about its centre, because the
 * geometry is the y >= 0 half of a CircleGeometry and a circle's UVs span the
 * whole canvas about (0.5, 0.5) — the flat edge of the drawing must therefore
 * lie along the canvas's middle row, not its top edge.
 */
export function rugHalf(field = '#5e2f35', accent = '#d9a648', seed = 83): THREE.CanvasTexture {
  return make(`rughalf|${field}|${accent}|${seed}`, [512, 512], (ctx, w, h) => {
    const rng = mulberry32(seed);
    const cx = w / 2;
    const cy = h / 2;
    const R = h / 2 - 6;
    // canvas y runs DOWN, so angles PI..2PI sweep the upper half of the image
    ctx.fillStyle = field;
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI, Math.PI * 2);
    ctx.fill();
    // weave mottle
    for (let i = 0; i < 1600; i++) {
      const a = Math.PI + rng() * Math.PI;
      const r = Math.sqrt(rng()) * R;
      ctx.fillStyle = shade(field, (rng() - 0.5) * 0.12);
      ctx.globalAlpha = 0.28;
      ctx.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.5, 1.5);
    }
    ctx.globalAlpha = 1;
    // double border
    ctx.strokeStyle = accent;
    for (const [r, lw] of [
      [R - 8, 4],
      [R - 20, 2],
    ] as const) {
      ctx.lineWidth = lw as number;
      ctx.beginPath();
      ctx.arc(cx, cy, r as number, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    // rays fanning from the flat edge, every 15 degrees
    ctx.globalAlpha = 0.7;
    for (let i = 1; i < 12; i++) {
      const a = Math.PI + (i / 12) * Math.PI;
      ctx.lineWidth = i % 3 === 0 ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R * 0.24, cy + Math.sin(a) * R * 0.24);
      ctx.lineTo(cx + Math.cos(a) * (R - 26), cy + Math.sin(a) * (R - 26));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // a half sun at the centre of the flat edge
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.14, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shade(field, -0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.085, Math.PI, Math.PI * 2);
    ctx.fill();
  }, false);
}

/**
 * Fluting for the wing colonnade's shafts: vertical half-round channels,
 * each shaded as a concave groove — dark at its edges, bright up its centre,
 * a crisp arris between neighbours. Wrapped round a 24-segment cylinder the
 * stripes read as carved flutes without a single extra vertex.
 */
export function flutes(base = '#9a9488', count = 20, seed = 29): THREE.CanvasTexture {
  return make(`flutes|${base}|${count}|${seed}`, [512, 256], (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const fw = w / count;
    for (let i = 0; i < count; i++) {
      const x0 = i * fw;
      // the concave gradient of one flute
      const g = ctx.createLinearGradient(x0, 0, x0 + fw, 0);
      g.addColorStop(0, shade(base, -0.16));
      g.addColorStop(0.18, shade(base, -0.05));
      g.addColorStop(0.5, shade(base, 0.09));
      g.addColorStop(0.82, shade(base, -0.05));
      g.addColorStop(1, shade(base, -0.16));
      ctx.fillStyle = g;
      ctx.fillRect(x0, 0, fw, h);
      // the sharp arris between flutes
      ctx.fillStyle = shade(base, 0.14);
      ctx.fillRect(x0 - 0.7, 0, 1.4, h);
    }
    // faint weathering so long shafts don't band
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = shade(base, (rng() - 0.5) * 0.08);
      ctx.globalAlpha = 0.18;
      ctx.fillRect(rng() * w, rng() * h, 2, 8 + rng() * 18);
    }
    ctx.globalAlpha = 1;
  });
}
