import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMaterial } from '../../../materials';
import { makeTexture, shade } from './textures';
import { mulberry32 } from '../../../domain/random';
import { wingAxis, wingPoint } from './layout';

/**
 * THE HALL SIGNS.
 *
 * What hung at the mouth of every wing was a `TextSprite`: a billboard of
 * coloured type floating in mid-air at six metres, turning to face the visitor
 * as they walked. It did its job — eight identical corridors need labelling —
 * and it read as a heads-up display bolted onto a building, because that is
 * exactly what it was. Nothing else in the museum turns to look at you.
 *
 * So the label becomes an OBJECT: a walnut board with its lettering cut in and
 * gilded, in a brass frame, hung on two forged chains from a bracket bolted to
 * the end post of the first bookcase. It hangs in the air of the hall the way
 * an inn sign hangs over a street — flat to the aisle, so it is square-on to
 * anyone looking down the hall from the rotunda and edge-on to nobody who
 * matters.
 *
 * The glowing sigil above it STAYS. That was the explicit call and it is the
 * right one: the sign is the object, the sigil is the wayfinding, and a
 * carved board is not readable from the far side of a 46-metre hall.
 *
 * ── cost ───────────────────────────────────────────────────────────────────
 *
 * Two draw calls for all eight. The eight boards' faces live in one atlas
 * (`signPlates`) so they share a material, and every chain, bracket, bolt and
 * frame in the museum is merged into a single ironwork buffer.
 */

/* ————————————————————— the painted boards ————————————————————— */

const CELL_W = 1024;
const CELL_H = 320;
const COLS = 2;
const ROWS = 4;

/**
 * Eight carved boards in one sheet.
 *
 * The lettering is INCISED AND GILDED, not printed: a dark cut offset down and
 * right, a lit lower lip up and left, gold between them. Painted flat it reads
 * as a label stuck to wood; cut, it reads as a board somebody spent a week on.
 */
export function signPlates(labels: string[], seed = 617): THREE.CanvasTexture {
  return makeTexture(
    `wing-signs|${labels.join('|')}|${seed}`,
    [CELL_W * COLS, CELL_H * ROWS],
    (ctx, w, h) => {
      // the boards are laid out in nominal cell pixels, and on a phone the
      // canvas is smaller than nominal (see textureBudget) — so fit the sheet
      // to it rather than drawing seven of the eight boards off the edge
      ctx.scale(w / (CELL_W * COLS), h / (CELL_H * ROWS));
      const rng = mulberry32(seed);
      for (let i = 0; i < COLS * ROWS; i++) {
        const ox = (i % COLS) * CELL_W;
        const oy = Math.floor(i / COLS) * CELL_H;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.beginPath();
        ctx.rect(0, 0, CELL_W, CELL_H);
        ctx.clip();

        // the board: quartered walnut, with the grain running the long way
        const base = '#4a3220';
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, CELL_W, CELL_H);
        for (let k = 0; k < 90; k++) {
          const y = rng() * CELL_H;
          ctx.strokeStyle = shade(base, (rng() - 0.5) * 0.16);
          ctx.globalAlpha = 0.2 + rng() * 0.35;
          ctx.lineWidth = 1 + rng() * 5;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(CELL_W * 0.3, y + (rng() - 0.5) * 26, CELL_W * 0.7, y + (rng() - 0.5) * 26, CELL_W, y + (rng() - 0.5) * 12);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // a chamfer round the edge, lit above and shadowed below
        const bevel = 16;
        ctx.fillStyle = 'rgba(255,232,190,0.14)';
        ctx.fillRect(0, 0, CELL_W, bevel);
        ctx.fillStyle = 'rgba(12,8,4,0.4)';
        ctx.fillRect(0, CELL_H - bevel, CELL_W, bevel);

        // the gilt rule inside the frame
        ctx.strokeStyle = '#b08a45';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.72;
        ctx.strokeRect(38, 34, CELL_W - 76, CELL_H - 68);
        ctx.globalAlpha = 1;

        const label = labels[i] ?? '';
        // two lines if it will not fit on one — the cluster names run long
        const words = label.split(' ');
        let lines = [label];
        ctx.font = `600 118px "Cormorant Garamond", Georgia, serif`;
        if (ctx.measureText(label).width > CELL_W - 170 && words.length > 1) {
          let best = 1;
          let bestDiff = Infinity;
          for (let s = 1; s < words.length; s++) {
            const a = words.slice(0, s).join(' ');
            const b = words.slice(s).join(' ');
            const diff = Math.abs(ctx.measureText(a).width - ctx.measureText(b).width);
            if (diff < bestDiff) {
              bestDiff = diff;
              best = s;
            }
          }
          lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
        }

        const size = lines.length > 1 ? 96 : 118;
        ctx.font = `600 ${size}px "Cormorant Garamond", Georgia, serif`;
        // shrink to fit rather than clip — a sign with its last word cut off is
        // worse than a slightly small sign
        let px = size;
        const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
        if (widest > CELL_W - 170) {
          px = Math.floor(size * ((CELL_W - 170) / widest));
          ctx.font = `600 ${px}px "Cormorant Garamond", Georgia, serif`;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        lines.forEach((line, li) => {
          const y = CELL_H / 2 + (li - (lines.length - 1) / 2) * (px * 1.06);
          ctx.fillStyle = 'rgba(10,6,2,0.85)';
          ctx.fillText(line, CELL_W / 2 + 3, y + 3);
          ctx.fillStyle = 'rgba(255,236,196,0.26)';
          ctx.fillText(line, CELL_W / 2 - 2.5, y - 2.5);
          ctx.fillStyle = '#c2a05c';
          ctx.fillText(line, CELL_W / 2, y);
        });

        // knocks, and the soot a hall of candles leaves on anything hanging
        for (let k = 0; k < 12; k++) {
          ctx.globalAlpha = 0.1 + rng() * 0.2;
          ctx.fillStyle = '#1c1208';
          ctx.beginPath();
          ctx.ellipse(rng() * CELL_W, rng() * CELL_H, 4 + rng() * 22, 3 + rng() * 9, rng() * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        const soot = ctx.createLinearGradient(0, 0, 0, CELL_H);
        soot.addColorStop(0, 'rgba(16,11,6,0.4)');
        soot.addColorStop(0.35, 'rgba(16,11,6,0)');
        ctx.fillStyle = soot;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, CELL_W, CELL_H);
        ctx.restore();
      }
    },
    false,
  );
}

/* ————————————————————— the hardware ————————————————————— */

/** the board, in metres. Its LENGTH runs across the hall and its face looks
 *  back down the aisle toward the rotunda. */
const SIGN_W = 1.9;
const SIGN_H = 0.62;
const SIGN_T = 0.07;
/** where it hangs: well over head height, well under the vault's springing */
const SIGN_Y = 4.35;
/** along the wing — the end post of the first bookcase bay, [17.3, 20.9] */
const SIGN_U = 20.9;
/** the case's own front face; the bracket is bolted to the post there */
const POST_N = 3.084;
/** how far the bracket reaches into the aisle */
const ARM_N = 1.28;

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);

interface Piece {
  g: THREE.BufferGeometry;
  pos: [number, number, number];
  rot?: [number, number, number];
  scale: [number, number, number];
}

/** world transform of a wing-local (u, n, y) point, and the yaw that faces the
 *  rotunda along the wing's own axis */
function place(angle: number, u: number, n: number): [number, number] {
  return wingPoint(angle, u, n);
}

export function WingSigns({ sections }: { sections: { cluster: string; label: string; angle: number }[] }) {
  const plateTex = useMemo(
    () => signPlates(sections.slice(0, COLS * ROWS).map((s) => s.label)),
    [sections],
  );

  /** every chain, bolt, bracket and frame in the museum, in one buffer */
  const iron = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const add = (p: Piece) => {
      q.setFromEuler(new THREE.Euler(p.rot?.[1] ?? 0, p.rot?.[0] ?? 0, p.rot?.[2] ?? 0, 'YXZ'));
      m.compose(new THREE.Vector3(...p.pos), q, new THREE.Vector3(...p.scale));
      const g = p.g.toNonIndexed();
      g.applyMatrix4(m);
      parts.push(g);
    };

    sections.slice(0, COLS * ROWS).forEach((s) => {
      const a = s.angle;
      // The −n wall of every hall, so the signs all hang on the same side and
      // a visitor learns where to look instead of hunting both walls.
      const side = -1;
      const yaw = -a; // the board's face looks back along the wing axis
      const [px, pz] = place(a, SIGN_U, side * POST_N);
      const [ax, az] = place(a, SIGN_U, side * (POST_N - ARM_N / 2));
      const [tx, tz] = place(a, SIGN_U, side * (POST_N - ARM_N));

      // the bracket: a horizontal arm off the post and a diagonal strut under it
      add({ g: BOX, pos: [ax, SIGN_Y + 0.72, az], rot: [yaw, 0, 0], scale: [0.05, 0.05, ARM_N] });
      add({
        g: BOX,
        pos: [(px + ax) / 2, SIGN_Y + 0.5, (pz + az) / 2],
        rot: [yaw, 0.62, 0],
        scale: [0.04, 0.04, 0.62],
      });
      // the plate bolted to the post, and its four bolt heads
      add({ g: BOX, pos: [px, SIGN_Y + 0.6, pz], rot: [yaw, 0, 0], scale: [0.05, 0.5, 0.16] });
      for (const dy of [-0.16, 0.16]) {
        for (const dn of [-0.05, 0.05]) {
          add({
            g: CYL,
            pos: [px - Math.sin(a) * side * dn, SIGN_Y + 0.6 + dy, pz + Math.cos(a) * side * dn],
            rot: [yaw, 0, Math.PI / 2],
            scale: [0.026, 0.06, 0.026],
          });
        }
      }
      // the scrolled tip the outer chain hangs from
      add({
        g: CYL,
        pos: [tx, SIGN_Y + 0.7, tz],
        rot: [yaw, Math.PI / 2, 0],
        scale: [0.09, 0.03, 0.09],
      });

      // two chains. Drawn as a run of small links rather than a rod — a chain
      // is one of the few things whose silhouette a viewer checks without
      // meaning to, and a smooth cylinder reads as a pipe.
      for (const frac of [0.12, 0.88]) {
        const n = side * (POST_N - ARM_N * frac);
        const [cx, cz] = place(a, SIGN_U, n);
        const top = SIGN_Y + 0.69;
        const drop = top - (SIGN_Y + SIGN_H / 2);
        const LINKS = 7;
        for (let k = 0; k < LINKS; k++) {
          add({
            g: BOX,
            pos: [cx, top - (drop * (k + 0.5)) / LINKS, cz],
            rot: [yaw, 0, k % 2 ? Math.PI / 2 : 0],
            scale: [0.016, drop / LINKS + 0.012, 0.034],
          });
        }
        // and the eye it hangs from at the board's own top edge
        add({
          g: CYL,
          pos: [cx, SIGN_Y + SIGN_H / 2, cz],
          rot: [yaw, Math.PI / 2, 0],
          scale: [0.05, 0.02, 0.05],
        });
      }

      // the brass frame round the board: four members, mitred by overlap
      const [bx, bz] = place(a, SIGN_U, side * (POST_N - ARM_N / 2));
      const nAxis: [number, number] = [-Math.sin(a) * side, Math.cos(a) * side];
      for (const dy of [-1, 1]) {
        add({
          g: BOX,
          pos: [bx, SIGN_Y + dy * (SIGN_H / 2 - 0.03), bz],
          rot: [yaw, 0, 0],
          scale: [SIGN_T + 0.02, 0.06, SIGN_W + 0.06],
        });
      }
      for (const dn of [-1, 1]) {
        add({
          g: BOX,
          pos: [bx + nAxis[0] * dn * (SIGN_W / 2), SIGN_Y, bz + nAxis[1] * dn * (SIGN_W / 2)],
          rot: [yaw, 0, 0],
          scale: [SIGN_T + 0.02, SIGN_H + 0.06, 0.06],
        });
      }
    });

    const merged = mergeGeometries(parts, false)!;
    parts.forEach((p) => p.dispose());
    return merged;
  }, [sections]);

  /** the boards themselves: one quad per face, UV'd into the atlas */
  const boards = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos: number[] = [];
    const nrm: number[] = [];
    const uvs: number[] = [];

    sections.slice(0, COLS * ROWS).forEach((s, i) => {
      const a = s.angle;
      const { ux, uz } = wingAxis(a);
      const side = -1;
      const nAxis: [number, number] = [-Math.sin(a) * side, Math.cos(a) * side];
      const [bx, bz] = place(a, SIGN_U, side * (POST_N - ARM_N / 2));
      const pad = 0.004;
      const u0 = ((i % COLS) + pad) / COLS;
      const u1 = ((i % COLS) + 1 - pad) / COLS;
      // v runs the other way: three flips every texture, and the atlas is laid
      // out in canvas rows counted from the top
      const r = Math.floor(i / COLS);
      const vTop = 1 - (r + pad) / ROWS;
      const vBot = 1 - (r + 1 - pad) / ROWS;

      // both faces, so the sign reads walking out of the hall as well as in.
      // `dir` +1 is the face toward the rotunda; its lettering must not mirror,
      // so the far face reverses u.
      for (const dir of [1, -1] as const) {
        const ox = -ux * (SIGN_T / 2) * dir;
        const oz = -uz * (SIGN_T / 2) * dir;
        const hw = SIGN_W / 2;
        const hh = SIGN_H / 2;
        const corners: [number, number, number][] = [
          [bx + ox - nAxis[0] * hw * dir, SIGN_Y - hh, bz + oz - nAxis[1] * hw * dir],
          [bx + ox + nAxis[0] * hw * dir, SIGN_Y - hh, bz + oz + nAxis[1] * hw * dir],
          [bx + ox + nAxis[0] * hw * dir, SIGN_Y + hh, bz + oz + nAxis[1] * hw * dir],
          [bx + ox - nAxis[0] * hw * dir, SIGN_Y + hh, bz + oz - nAxis[1] * hw * dir],
        ];
        const n: [number, number, number] = [-ux * dir, 0, -uz * dir];
        const uv: [number, number][] = [
          [u0, vBot],
          [u1, vBot],
          [u1, vTop],
          [u0, vTop],
        ];
        for (const [i0, i1, i2] of [
          [0, 1, 2],
          [0, 2, 3],
        ]) {
          for (const k of [i0, i1, i2]) {
            pos.push(...corners[k]);
            nrm.push(...n);
            uvs.push(...uv[k]);
          }
        }
      }
    });

    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.computeBoundingSphere();
    return g;
  }, [sections]);

  useLayoutEffect(
    () => () => {
      iron.dispose();
      boards.dispose();
    },
    [iron, boards],
  );

  const ironMat = useMemo(
    () => getMaterial('metal_iron_forged', { repeat: [3, 3], overrides: { color: '#2b2724' } }),
    [],
  );
  const boardMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: plateTex,
        roughness: 0.82,
        // The carving is painted, so nothing here is lit from within. A whisper
        // of warm emissive only — a hall at 85% shadow would otherwise swallow
        // the one object in it whose job is to be read.
        emissive: new THREE.Color('#4a3a1e'),
        emissiveMap: plateTex,
        emissiveIntensity: 0.35,
      }),
    [plateTex],
  );
  useLayoutEffect(() => () => boardMat.dispose(), [boardMat]);

  return (
    <group>
      <mesh geometry={iron} material={ironMat} />
      <mesh geometry={boards} material={boardMat} />
    </group>
  );
}
