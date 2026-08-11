/** Shared floor plan for the Grand Library — one source of truth for
 *  the scene, the structure, and the collision code.
 *
 *  The plan is an eight-pointed star: a great domed rotunda at the heart
 *  and one wing per tradition, arranged in mirrored pairs. The entrance
 *  hall lies to the south, the Research Hall apse to the north; the
 *  hearth warms the west wall and the clock keeps the east.
 */

import { DRUM_R_IN, DRUM_R_OUT } from './drumGeometry';

export const ROT_R = 17; // rotunda inner radius
export const ROT_WALL_H = 17; // rotunda drum height — kept equal to WING_H so wing mouths seal
export const ROT_DOME_TOP = 29; // apex of the dome
export const OCULUS_R = 4.7; // skylight at the crown

/** eight wings in four mirrored pairs, leaving the cardinals free */
export const WING_ANGLES = [18, 54, 126, 162, 198, 234, 306, 342].map((d) => (d * Math.PI) / 180);
export const WING_HALF = 5.4; // half-width of a wing corridor — broad museum aisles
export const WING_U0 = 16.2; // where a wing leaves the rotunda
export const WING_U1 = 64; // outer end wall — vast twin-gallery halls of books & art
export const WING_H = 17; // wing ceiling height — matches the drum so mouths seal cleanly

/**
 * Entrance hall half-width (south, +z), and the doors.
 *
 * WIDTH 3.0; the depth is ENTRY_Z below. Both were once pushed out — to 3.5 and
 * 26.2 — to give
 * Boaz & Jachin room here, then brought back in when the pillars left for the
 * apse. The pillars are BACK (see PILLAR_Z), and only the DEPTH goes out with
 * them: at 3.0 the pair still leaves a 3.4 m walk between their steps, which is
 * wider than the doors, so the hall never needed widening — what it needed was
 * length. The pair stands mid-hall, and a gateway wants floor in front of it to
 * be seen from and floor behind it to have led somewhere.
 */
export const ENTRY_HALF = 3.0;
/**
 * The doors — brought IN to 22.4, from 28.2 (by way of 24.0).
 *
 * The same lesson the apse learned at −23.0 (see APSE_Z), which is the reason
 * that number is worth reading first: a 3 m wide, 17 m tall hall stops being a
 * room and becomes a shaft somewhere around eight metres of walk, and what is
 * at the far end of it reads as a lit dot rather than as a composition. The
 * vestibule ran ~11 m from the drum to the doors, most of it panelling with
 * nothing in it but the walk itself, and the rotunda — the thing the entrance
 * exists to deliver you to — was a long way off at the end of it.
 *
 * At 22.4 the hall is ~5 m from the drum chord and under 3 m of it is the
 * dressed vestibule — a PORCH rather than a passage. A visitor is through the
 * doors and into the rotunda in a couple of strides, with the drum's mouth
 * already framing the room as they cross the threshold. This is close to the
 * floor for the shape: the spawn stands 2.8 m inside the doors (SPAWN_Z), and
 * much less than this would put a visitor's back through them. Everything in the hall is measured off this —
 * the walls and vault in structure.tsx, the sconces and lanterns in
 * entranceDressing, the braziers, the ceremonial way, the spawn — so the whole
 * vestibule moves together and nothing is left standing outside its own doors.
 * The arrival flight is the one thing that is not: FLIGHT_CURVE in
 * GrandLibrary keeps its landing point in the rotunda and only its start moves.
 */
export const ENTRY_Z = 22.4;
/** where a visitor stands when the museum opens — just inside the doors. Was
 *  hard-coded as a bare 21 in two places in GrandLibrary; derived here so the
 *  spawn cannot drift away from the doors it is measured from. */
export const SPAWN_Z = ENTRY_Z - 2.8;
/**
 * Research apse half-width (north, −z) — 6 m across, in from 7.
 *
 * The corridor was widened to 7 m to hold a carved recess a side: each recess
 * swung 1.75 m out of the wall, so the room had to be big enough to give that
 * away twice and still be a room. The recesses are gone and Boaz & Jachin have
 * left for the entrance hall, so the walls come back in with them. A hall is
 * only as wide as what it has to hold.
 *
 * Thinner is the safe direction. The apse mouth is cut to land on the inner
 * face of these walls (see MOUTHS in structure.tsx), so narrowing the corridor
 * hands arc BACK to the two great drum piers flanking it — the ones carrying
 * Isis & Serapis — and their niches only ever get more jamb, never less. It is
 * widening that is dangerous: past about 3.51 those two niches start quietly
 * shrinking while the other eight stay as they are, which is how a set of ten
 * matched recesses stops being a set. 3.0 is nowhere near it.
 *
 * The Librarian's catalogue bank is sized off this (CASE_W in characters.tsx),
 * so it comes in with the room rather than punching through the new walls.
 */
export const APSE_HALF = 3.0;
/**
 * Apse end wall — pulled back IN to −23.0, from −27.4.
 *
 * It was cut to −27.4 to hold three things in a row: Boaz & Jachin standing as
 * a gateway in the middle of its side walls, a stretch of open floor, and then
 * the Librarian's desk at the end. The pillars have since left for the
 * entrance hall (see PillarPorch), which took the reason for the middle two of
 * those and left the rest as corridor: nine and a half metres of empty
 * panelling to walk down before the station resolved, at 3 m wide and 17 m
 * tall. That is a shaft, not a room, and the Librarian read as someone at the
 * far end of it rather than someone the rotunda opens onto.
 *
 * At −23.0 the hall is ~5.4 m deep — one bay, the depth of a chancel rather
 * than a passage. Her station is visible as a composition from the rotunda
 * floor instead of as a lit dot down a tunnel.
 *
 * LIBRARIAN_POS is measured back from this number, so her bank keeps its
 * clearance off the end wall however deep the apse is cut.
 */
export const APSE_Z = -23.0;

/* ————— where Boaz & Jachin stand —————
 * THE APSE, one each side of the Librarian, so her station is what you see
 * framed between them and under the bow.
 *
 * They have been round the building several times and every arrangement is
 * worth keeping, because each failed differently. They began ON the apse-side
 * drum piers; those are TAKEN (Isis & Serapis are niched on them). They were
 * sunk into arched recesses carved out of the apse walls — which read well, but
 * a recess is a frame, and a frame is what you give a figure that faces you,
 * not a column you are meant to see all the way round. They stood free in a
 * 4.4 m apse, where they left barely 2.7 m to pass between them, and then in
 * the entrance hall, where they were a gateway to a corridor rather than to
 * anything.
 *
 * A gateway wants something on the far side of it. Standing them a little in
 * front of the Librarian gives the pair the one thing the vestibule could not:
 * the reason you walk between them is standing there when you do.
 */
/** the chord where a hall of half-width `w` meets the drum — written out here
 *  rather than imported because structure.tsx reads this file. */
const hallStart = (w: number) =>
  (Math.sqrt(DRUM_R_IN * DRUM_R_IN - w * w) + Math.sqrt(DRUM_R_OUT * DRUM_R_OUT - w * w)) / 2;
/** the vestibule's inner end, where its walls and ceiling start off the drum.
 *  The entrance dressing measures its sconces and lanterns from here — it used
 *  to measure them from the pillars, which is fine only while the pillars are
 *  in that hall, and they are not any more. */
export const ENTRY_INNER_Z = hallStart(ENTRY_HALF + 0.6) + 2.6;
/**
 * Where along the apse the pair stands: 1.5 m in FRONT of the Librarian, who
 * stands at APSE_Z + 2.4 (LIBRARIAN_POS in GrandLibrary.tsx, derived from the
 * same wall).
 *
 * Not level with her, and not on top of her: her desk carries a 1.7 m collision
 * circle and each pillar 0.8 m, so at her own z the two would overlap and pin a
 * visitor between them. Set forward, the circles clear, the pair reads as the
 * threshold to her station rather than as bookends on her desk, and the walk in
 * still passes between them.
 */
export const PILLAR_Z = APSE_Z + 3.9;
/** the moulded step each pillar stands on. A full circle: they stand free of
 *  the wall, and a half-disc in open floor reads as a step with a bite out. */
export const PILLAR_STEP_R = 0.7;
/**
 * How far out from the centre line each pillar stands — DERIVED, and derived
 * from the wall rather than from the middle.
 *
 * The pillar's back is 0.1 m off the apse wall's inner face (APSE_HALF + 0.15)
 * and everything else follows from the step it stands on, so the pair keeps its
 * daylight behind it however the apse is re-cut — never embedded in the wall,
 * never marooned out in the floor. At APSE_HALF 3.0 the clear passage between
 * the two steps is 3.3 m.
 */
export const PILLAR_X = APSE_HALF + 0.15 - PILLAR_STEP_R - 0.1;



/* ————— the stacks' plan —————
 * These live here, rather than in GrandLibrary where they were written, because
 * the shelf cases are the largest climbable furniture in the building and the
 * things that live in it — birds looking for a ledge, cats looking for a shelf —
 * have to be able to find a case top without copying its arithmetic. One plan,
 * one set of numbers.
 */

/** the shelf cases' centre plane: 0.55 in front of the corridor wall. Every
 *  wall-relative thing in a wing — cases, grimoires, ladders, the walkable
 *  corridor — measures from this, so the whole hall moves with its walls.
 *  (WING_WALL_HALF lives in structure.ts, which imports this file; the value is
 *  restated as CASE_N there via `shelfPlane()` below.) */
export const CASE_DEPTH = 0.55; // front-to-back of a case, and its stand-off
/** the standard bay width; the two bays nearest the rotunda run narrower so
 *  they still fit between the hall mouth and the first gallery gap */
export const BAY_W = 4.4;
export const NEAR_W = 3.6;
/** no shelf case may reach closer to the centre than this. The drum wall sits
 *  at radius 17.15–17.55, so a bay whose end ran inward of this punched
 *  through the drum and stood inside the rotunda beside the hall mouth. */
export const MOUTH_CLEAR_U = 17.3;
/** where the first gallery's shelf-free gap opens */
export const GALLERY_GAP_U0 = 24.6;

/** shelf rows per case, and the row pitch — the case's own storeys */
export const SHELF_ROWS = 7;
export const SHELF_PITCH = 1.45;
export const SHELF_Y0 = 0.55; // the plinth shelf, and the lowest thing a cat can sit on
/** row centres — grimoires stand IN the rows, shoulder to shoulder with the
 *  other books, not floating in front of them */
export const ROW_Y = (row: number) => 1.12 + row * SHELF_PITCH;
/** the top of a case: the last shelf board, which is the ledge a bird lands on */
export const CASE_TOP_Y = SHELF_Y0 + SHELF_ROWS * SHELF_PITCH + 0.045;

export interface Bay {
  /** centre along the wing axis */
  u: number;
  /** length along the wing axis */
  w: number;
}
/** shelf bays along every wing wall — the single source of truth shared by the
 *  shelf builder, the grimoire placer and the perch table, so a book (or a bird)
 *  can only ever stand where a bay actually is. Two deliberate gaps stay open
 *  for the twin galleries (art at GALLERY_U = 27.0 and GALLERY2_U = 40.95), and
 *  the near pair is pulled out to MOUTH_CLEAR_U so nothing overhangs the mouth. */
export const BAYS: Bay[] = [
  { u: MOUTH_CLEAR_U + NEAR_W / 2, w: NEAR_W }, // [17.3, 20.9], clear of the mouth
  { u: GALLERY_GAP_U0 - NEAR_W / 2, w: NEAR_W }, // [21.0, 24.6], up to the gallery gap
  { u: 31.6, w: BAY_W },
  { u: 36, w: BAY_W },
  { u: 45.9, w: BAY_W },
  { u: 50.3, w: BAY_W },
  { u: 54.7, w: BAY_W },
  { u: 59.1, w: BAY_W },
];

/** unit axis of a wing */
export function wingAxis(a: number): { ux: number; uz: number; nx: number; nz: number } {
  return { ux: Math.cos(a), uz: Math.sin(a), nx: -Math.sin(a), nz: Math.cos(a) };
}

/** world position from wing coordinates (u along, n across) */
export function wingPoint(a: number, u: number, n: number): [number, number] {
  const { ux, uz, nx, nz } = wingAxis(a);
  return [ux * u + nx * n, uz * u + nz * n];
}

/** wing-local coordinates of a world point */
export function toWing(a: number, x: number, z: number): { u: number; n: number } {
  const { ux, uz, nx, nz } = wingAxis(a);
  return { u: x * ux + z * uz, n: x * nx + z * nz };
}
