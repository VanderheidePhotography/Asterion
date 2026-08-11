import * as THREE from 'three';
import {
  BAYS,
  CASE_DEPTH,
  CASE_TOP_Y,
  SHELF_Y0,
  WING_ANGLES,
  wingAxis,
  wingPoint,
} from './layout';
import { GALLERY_U, WING_WALL_HALF } from './structure';
import { GALLERY_RAIL_R, GALLERY_RAIL_Y } from './rotundaGallery';
import { CHANDELIER_ARM_R } from './furniture';

/**
 * WHERE A BIRD CAN ACTUALLY STAND.
 *
 * The old perch tables were six and seven hand-typed points, and most of them
 * were in mid-air: the owl's "balcony rail" sat at y 8.0 on a rail that is at
 * 14.8, so the bird stood on nothing, half a storey below the gallery, facing
 * whatever direction the flight path left it facing. Nothing about that reads
 * as a bird using a building.
 *
 * So perches are DERIVED from the furniture, from the same constants the
 * furniture is built from — case tops, the gallery handrail, the chandelier
 * arm-rings, ladder tops, the bench backs and the impost ledge. Each one
 * carries three things a hand-typed Vector3 cannot:
 *
 * · `facing` — the way a bird standing there looks. A bird on a rail faces out
 *   over the drop; a bird on a case top faces the aisle. This is what stops
 *   landings ending in an arbitrary yaw.
 * · `along` + `span` — the LINE of the perch and how far it runs. Rails and
 *   case tops are long, and a real small bird does not sit on one spot: it
 *   hops along it. The hop needs to know which way the timber goes.
 * · `girth` — how thick the thing is underfoot. An owl wants a rail or a case
 *   top; a chickadee is happy on a candle-arm or a ladder rung.
 */

export type PerchKind =
  | 'caseTop' // the top board of a wing's shelf case, nine metres up
  | 'rail' // the rotunda gallery's handrail
  | 'ledge' // the impost course running round the drum
  | 'chandelier' // the arm-ring of a hanging fixture
  | 'ladder' // the top of a leaning library ladder
  | 'bench' // a reading bench's crest rail, down where the hall is
  | 'shelf' // a low shelf board — cat height, and where chickadees forage
  | 'sky'; // out through the oculus and gone a while

export interface Perch {
  pos: THREE.Vector3;
  /** the yaw a bird standing here faces */
  facing: number;
  /** unit direction of the timber underfoot, in the XZ plane */
  along: THREE.Vector3;
  /** how far a bird may shuffle each way along it before it runs out */
  span: number;
  /** thickness underfoot — 0.05 is a candle-arm, 0.55 a case top */
  girth: number;
  kind: PerchKind;
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** yaw of a direction, in the convention Object3D.rotation.y uses */
const yawOf = (dx: number, dz: number) => Math.atan2(dx, dz);

function build(): Perch[] {
  const out: Perch[] = [];

  /* ————— the case tops —————
   * The single biggest landing surface in the building: sixteen walls of shelf,
   * eight bays each, every one a 0.55 m board at 10.75 m. A bird lands on the
   * AISLE edge of it, because that is the edge with the drop and the view; a
   * bird standing in the middle of a nine-metre-high board can see nothing and
   * be seen by nobody.
   */
  const CASE_N = WING_WALL_HALF - CASE_DEPTH;
  for (const a of WING_ANGLES) {
    const { ux, uz, nx, nz } = wingAxis(a);
    for (const wall of [-1, 1] as const) {
      // toward the aisle is the wall normal, inverted: wall −1 sits on the −n
      // side, so its aisle is +n
      const fx = -wall * nx;
      const fz = -wall * nz;
      for (const bay of BAYS) {
        // the front lip of the board, not its centre line
        const [x, z] = wingPoint(a, bay.u, wall * (CASE_N - CASE_DEPTH * 0.32));
        out.push({
          pos: v(x, CASE_TOP_Y, z),
          facing: yawOf(fx, fz),
          along: v(ux, 0, uz),
          span: bay.w / 2 - 0.4,
          girth: 0.55,
          kind: 'caseTop',
        });
      }
      // and the lowest shelf board, where a chickadee forages and a cat sleeps
      out.push({
        pos: (() => {
          const [x, z] = wingPoint(a, BAYS[2].u, wall * (CASE_N - CASE_DEPTH * 0.3));
          return v(x, SHELF_Y0 + 0.05, z);
        })(),
        facing: yawOf(fx, fz),
        along: v(ux, 0, uz),
        span: BAYS[2].w / 2 - 0.4,
        girth: 0.5,
        kind: 'shelf',
      });
      // the reading benches under the first gallery's art — crest rail height
      {
        const [x, z] = wingPoint(a, GALLERY_U, wall * (WING_WALL_HALF - 1.25));
        out.push({
          pos: v(x, 1.11, z),
          facing: yawOf(fx, fz),
          along: v(ux, 0, uz),
          span: 0.85,
          girth: 0.12,
          kind: 'bench',
        });
      }
    }
  }

  /* ————— the rotunda gallery handrail —————
   * A continuous ring of 0.1 m timber at 14.8 m, and the best seat in the
   * building: it looks down the whole drop to the mandala. Perches are set in
   * the bays BETWEEN the wing mouths, matching where the creepers hang, so a
   * bird is never sitting in a doorway's sightline.
   */
  for (const d of [8, 28, 62, 82, 98, 118, 152, 172, 188, 208, 242, 262, 278, 298, 332, 352]) {
    const th = (d * Math.PI) / 180;
    const x = Math.cos(th) * GALLERY_RAIL_R;
    const z = Math.sin(th) * GALLERY_RAIL_R;
    out.push({
      pos: v(x, GALLERY_RAIL_Y + 0.05, z),
      // over the drop: inward, toward the axis of the room
      facing: yawOf(-x, -z),
      along: v(-Math.sin(th), 0, Math.cos(th)),
      span: 1.6,
      girth: 0.1,
      kind: 'rail',
    });
  }

  /* ————— the impost ledge —————
   * The stone course at 8.4 m that the shorter creepers grow on. Narrower and
   * far more exposed than the gallery; it is where the owl goes when it wants
   * the whole room in front of it.
   */
  for (const d of [40, 140, 220, 320]) {
    const th = (d * Math.PI) / 180;
    const r = 16.8;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    out.push({
      pos: v(x, 8.4, z),
      facing: yawOf(-x, -z),
      along: v(-Math.sin(th), 0, Math.cos(th)),
      span: 0.9,
      girth: 0.35,
      kind: 'ledge',
    });
  }

  /* ————— the chandelier arm-rings —————
   * The rotunda's four fixtures hang at r 8.5, y 9.8, and their brass ring is
   * at ARM_R with its top a little above the hub. Perching between two candles
   * is a small bird's idea, not an owl's — the ring is 5 cm of scrolled iron
   * and it sways.
   */
  for (const d of [45, 135, 225, 315]) {
    const th = (d * Math.PI) / 180;
    const cx = Math.cos(th) * 8.5;
    const cz = Math.sin(th) * 8.5;
    // two opposed spots on the ring, set between candles
    for (const k of [1, -1]) {
      const ax = Math.cos(th + (k * Math.PI) / 2) * CHANDELIER_ARM_R;
      const az = Math.sin(th + (k * Math.PI) / 2) * CHANDELIER_ARM_R;
      out.push({
        pos: v(cx + ax, 9.8 + 0.21, cz + az),
        facing: yawOf(ax, az), // outward, off the fixture
        along: v(-az, 0, ax).normalize(),
        span: 0.35,
        girth: 0.05,
        kind: 'chandelier',
      });
    }
  }

  /* ————— the ladder tops —————
   * One ladder per wing, leaning on a stocked bay. The stiles run 4.8 m at a
   * −0.15 lean, so the top rung is about 4.7 m up and a third of a metre out
   * from the foot. The exact spots are computed in GrandLibrary; the pattern
   * (wall side, u) is restated here rather than plumbed through, because the
   * perch table is built once at module load and the ladders never move.
   */
  WING_ANGLES.forEach((a, i) => {
    const { ux, uz, nx, nz } = wingAxis(a);
    const wall = i % 2 === 0 ? -1 : 1;
    const u = i % 2 === 0 ? 22.8 : 36;
    const [x, z] = wingPoint(a, u, wall * (WING_WALL_HALF - CASE_DEPTH - 0.7));
    out.push({
      pos: v(x - nx * wall * 0.72, 4.72, z - nz * wall * 0.72),
      facing: yawOf(-wall * nx, -wall * nz),
      along: v(ux, 0, uz),
      span: 0.25,
      girth: 0.07,
      kind: 'ladder',
    });
  });

  return out;
}

export const PERCHES: Perch[] = build();

/** out through the oculus. Not a perch — a bird that picks it leaves the room,
 *  and the flight code treats it as a destination it can vanish at. */
export const SKY_PERCH: Perch = {
  pos: new THREE.Vector3(0, 30.5, 0),
  facing: 0,
  along: new THREE.Vector3(1, 0, 0),
  span: 0,
  girth: 0,
  kind: 'sky',
};

/** the perches a given bird will consider. Owls want something that will hold
 *  an owl; chickadees want anything but the exposed stone. */
export function perchesFor(kind: 'owl' | 'small'): Perch[] {
  return kind === 'owl'
    ? PERCHES.filter((p) => p.girth >= 0.1 && p.pos.y > 4)
    : PERCHES.filter((p) => p.kind !== 'ledge');
}
