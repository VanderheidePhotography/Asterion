import * as THREE from 'three';
import { SATOR, kamea, type Seal } from '../../../data/solomonSeals';
import { SERIF, arcText, plate, seeded, square } from './plateArt';

/**
 * The seals themselves, drawn as figures of LIGHT.
 *
 * These are not baked as brass like the rest of the instrument's plates,
 * because they are not brass: the plate throws them into the air over the
 * table, so each is drawn on a transparent ground in a single luminous ink and
 * rendered additively. Everything that is not line is nothing at all.
 *
 * The drawing follows the manuscripts' own grammar rather than copying any one
 * printed source. A pentacle of the Key of Solomon is: an outer ruled circle;
 * a band carrying the versicle; a second band of CHARACTERS — which are not
 * letters in any alphabet and never were, but a conventional repertoire of
 * strokes-with-terminals that every grimoire draws slightly differently; and a
 * figure at the middle, which for most of the planets is that planet's magic
 * square. Drawing the characters procedurally is therefore not a cheat: it is
 * the same operation a copyist performed, and the results are the same kind of
 * object.
 */

const S = 1024;
const C = S / 2;

export function sealTexture(seal: Seal): THREE.CanvasTexture {
  return plate('sigilla', `seal-${seal.key}`, () => bake(seal));
}

/** the characters: strokes with little terminal rings and crossbars, in the
 *  manner of the grimoires' "characters of the spirits" */
function characters(x: CanvasRenderingContext2D, radius: number, count: number, seed: number, ink: string) {
  const rng = seeded(seed);
  x.save();
  x.strokeStyle = ink;
  x.fillStyle = ink;
  x.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    x.save();
    x.translate(C + Math.cos(a) * radius, C + Math.sin(a) * radius);
    x.rotate(a + Math.PI / 2);
    x.globalAlpha = 0.9;
    x.lineWidth = 3.2;
    const h = 22 + rng() * 10;
    // a spine, one or two crossbars, and a terminal — the whole vocabulary
    x.beginPath();
    x.moveTo(0, -h);
    x.lineTo(rng() < 0.5 ? 0 : (rng() - 0.5) * 14, h);
    x.stroke();
    const bars = 1 + Math.floor(rng() * 2);
    for (let b = 0; b < bars; b++) {
      const y = -h + ((b + 1) / (bars + 1)) * h * 2;
      const w = 6 + rng() * 9;
      x.beginPath();
      x.moveTo(-w, y);
      x.lineTo(w, y);
      x.stroke();
    }
    const term = rng();
    x.beginPath();
    if (term < 0.4) x.arc(0, -h, 4.5, 0, Math.PI * 2);
    else if (term < 0.7) {
      x.moveTo(-7, -h - 7);
      x.lineTo(7, -h + 1);
      x.moveTo(7, -h - 7);
      x.lineTo(-7, -h + 1);
    } else x.arc(0, h, 4.5, 0, Math.PI * 2);
    x.stroke();
    x.restore();
  }
  x.restore();
}

function bake(seal: Seal): HTMLCanvasElement {
  const [c, x] = square(S);
  x.clearRect(0, 0, S, S);
  const ink = seal.colour;
  const pale = '#fff6de';

  const ring = (r: number, w: number, alpha = 0.9, colour = ink) => {
    x.save();
    x.strokeStyle = colour;
    x.globalAlpha = alpha;
    x.lineWidth = w;
    x.beginPath();
    x.arc(C, C, r, 0, Math.PI * 2);
    x.stroke();
    x.restore();
  };

  // a faint disc of light behind everything, so the figure reads as projected
  // rather than as line-art floating in a void
  {
    const g = x.createRadialGradient(C, C, 0, C, C, C * 0.98);
    g.addColorStop(0, 'rgba(255,246,222,0.14)');
    g.addColorStop(0.62, 'rgba(255,240,200,0.07)');
    g.addColorStop(1, 'rgba(255,240,200,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, S, S);
  }

  ring(C * 0.97, 6);
  ring(C * 0.935, 3, 0.7);
  ring(C * 0.775, 3, 0.7);
  ring(C * 0.745, 6);

  // the versicle, around the outer band
  arcText(x, C, seal.versicle, C * 0.855, -Math.PI / 2, 34, pale, 0.95, false, SERIF, 0.2);
  // and the characters, in the band inside it
  characters(x, C * 0.68, 18, seal.key.length * 977 + 13, ink);
  ring(C * 0.6, 4, 0.8);

  const inner = C * 0.55;
  switch (seal.figure) {
    case 'hexagram': {
      x.save();
      x.strokeStyle = pale;
      x.lineWidth = 8;
      x.globalAlpha = 0.95;
      for (const flip of [0, Math.PI]) {
        x.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI / 2 + flip + (i / 3) * Math.PI * 2;
          const px = C + Math.cos(a) * inner;
          const py = C + Math.sin(a) * inner;
          if (i === 0) x.moveTo(px, py);
          else x.lineTo(px, py);
        }
        x.closePath();
        x.stroke();
      }
      x.restore();
      // the divine name at the centre, as the manuscripts set it
      x.save();
      x.font = `76px ${SERIF}`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillStyle = pale;
      x.globalAlpha = 0.95;
      x.fillText('יהוה', C, C);
      x.restore();
      break;
    }
    case 'pentagram': {
      x.save();
      x.strokeStyle = pale;
      x.lineWidth = 9;
      x.beginPath();
      for (let i = 0; i <= 5; i++) {
        const a = -Math.PI / 2 + ((i * 2) / 5) * Math.PI * 2;
        const px = C + Math.cos(a) * inner;
        const py = C + Math.sin(a) * inner;
        if (i === 0) x.moveTo(px, py);
        else x.lineTo(px, py);
      }
      x.closePath();
      x.stroke();
      x.restore();
      break;
    }
    case 'wheel': {
      // the Sun's figure: a rayed wheel, because his kamea is the one order
      // the simple constructions cannot build (see data/solomonSeals)
      x.save();
      x.strokeStyle = pale;
      x.globalAlpha = 0.92;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        x.lineWidth = i % 2 ? 3 : 6;
        x.beginPath();
        x.moveTo(C + Math.cos(a) * inner * 0.3, C + Math.sin(a) * inner * 0.3);
        x.lineTo(C + Math.cos(a) * inner * (i % 2 ? 0.82 : 1), C + Math.sin(a) * inner * (i % 2 ? 0.82 : 1));
        x.stroke();
      }
      x.restore();
      ring(inner * 0.3, 6, 0.95, pale);
      ring(inner, 5, 0.8, pale);
      break;
    }
    case 'kamea': {
      const n = seal.order ?? 3;
      const grid = kamea(n);
      const cell = (inner * 1.62) / n;
      const x0 = C - (cell * n) / 2;
      const y0 = C - (cell * n) / 2;
      x.save();
      x.strokeStyle = ink;
      x.globalAlpha = 0.75;
      x.lineWidth = n > 6 ? 2 : 3.4;
      for (let i = 0; i <= n; i++) {
        x.beginPath();
        x.moveTo(x0 + i * cell, y0);
        x.lineTo(x0 + i * cell, y0 + n * cell);
        x.moveTo(x0, y0 + i * cell);
        x.lineTo(x0 + n * cell, y0 + i * cell);
        x.stroke();
      }
      x.font = `${Math.round(cell * 0.52)}px ${SERIF}`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillStyle = pale;
      x.globalAlpha = 0.95;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
          x.fillText(String(grid[i][j]), x0 + (j + 0.5) * cell, y0 + (i + 0.5) * cell);
      x.restore();
      // the sigil: the path traced from 1 through n² in order, which is what
      // the square is actually for
      const where: [number, number][] = [];
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) where[grid[i][j] - 1] = [x0 + (j + 0.5) * cell, y0 + (i + 0.5) * cell];
      x.save();
      x.strokeStyle = ink;
      x.globalAlpha = 0.55;
      x.lineWidth = 4;
      x.lineJoin = 'round';
      x.beginPath();
      where.forEach(([px, py], i) => (i === 0 ? x.moveTo(px, py) : x.lineTo(px, py)));
      x.stroke();
      x.restore();
      break;
    }
    case 'aemeth': {
      // Dee's heptagram within a heptagon, with the seven names round it
      x.save();
      x.strokeStyle = pale;
      x.globalAlpha = 0.95;
      x.lineWidth = 6;
      const pts = Array.from({ length: 7 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 7) * Math.PI * 2;
        return [C + Math.cos(a) * inner, C + Math.sin(a) * inner] as [number, number];
      });
      x.beginPath();
      pts.forEach(([px, py], i) => (i === 0 ? x.moveTo(px, py) : x.lineTo(px, py)));
      x.closePath();
      x.stroke();
      // the {7/3} star inside it
      x.lineWidth = 5;
      x.globalAlpha = 0.85;
      x.beginPath();
      for (let i = 0; i <= 7; i++) {
        const [px, py] = pts[(i * 3) % 7];
        if (i === 0) x.moveTo(px, py);
        else x.lineTo(px, py);
      }
      x.stroke();
      x.restore();
      const names = ['Zaphkiel', 'Zadkiel', 'Cumael', 'Raphael', 'Haniel', 'Michael', 'Gabriel'];
      names.forEach((nm, i) => {
        const a = -Math.PI / 2 + ((i + 0.5) / 7) * Math.PI * 2;
        arcText(x, C, nm.toUpperCase(), inner * 1.14, a, 26, ink, 0.85);
      });
      x.save();
      x.font = `64px ${SERIF}`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillStyle = pale;
      x.fillText('אמת', C, C);
      x.restore();
      break;
    }
    case 'sator': {
      const n = 5;
      const cell = (inner * 1.66) / n;
      const x0 = C - (cell * n) / 2;
      const y0 = C - (cell * n) / 2;
      x.save();
      x.strokeStyle = ink;
      x.globalAlpha = 0.7;
      x.lineWidth = 3.4;
      for (let i = 0; i <= n; i++) {
        x.beginPath();
        x.moveTo(x0 + i * cell, y0);
        x.lineTo(x0 + i * cell, y0 + n * cell);
        x.moveTo(x0, y0 + i * cell);
        x.lineTo(x0 + n * cell, y0 + i * cell);
        x.stroke();
      }
      x.font = `${Math.round(cell * 0.6)}px ${SERIF}`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillStyle = pale;
      x.globalAlpha = 0.95;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
          x.fillText(SATOR[i][j], x0 + (j + 0.5) * cell, y0 + (i + 0.5) * cell);
      // the TENET cross, which is the square's one undisputed feature
      x.strokeStyle = pale;
      x.globalAlpha = 0.42;
      x.lineWidth = cell * 0.86;
      x.beginPath();
      x.moveTo(x0 + 2.5 * cell, y0);
      x.lineTo(x0 + 2.5 * cell, y0 + n * cell);
      x.moveTo(x0, y0 + 2.5 * cell);
      x.lineTo(x0 + n * cell, y0 + 2.5 * cell);
      x.stroke();
      x.restore();
      break;
    }
    case 'cross': {
      x.save();
      x.strokeStyle = pale;
      x.lineWidth = 10;
      x.beginPath();
      x.moveTo(C, C - inner);
      x.lineTo(C, C + inner);
      x.moveTo(C - inner, C);
      x.lineTo(C + inner, C);
      x.stroke();
      x.restore();
      break;
    }
  }

  // the planet's own sign, small, at the head of the outer band
  x.save();
  x.font = `54px "Segoe UI Symbol", ${SERIF}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = pale;
  x.globalAlpha = 0.9;
  x.fillText(`${seal.glyph}︎`, C, C * 0.115);
  x.restore();

  return c;
}
