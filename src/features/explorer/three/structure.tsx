import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getGlowTexture } from './glowTexture';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMaterial } from '../../../materials';
import { getImageTexture } from './artwork';
import { TextSprite } from './TextSprite';
// Every surface in this file now comes from the material registry. The one
// painter still imported directly is the stained glass, which feeds an unlit
// MeshBasicMaterial rather than a PBR surface — it is a light source, not a
// material, and it has no business having roughness.
import { stainedGlassArch } from './textures';
import {
  archMoulding,
  DRUM_R_IN,
  DRUM_R_OUT,
  drumWall,
  mkOpening,
  newBuilder,
  sweptBand,
  toGeometry,
  type Opening,
  type Profile,
} from './drumGeometry';
import {
  APSE_HALF,
  APSE_Z,
  ENTRY_HALF,
  ENTRY_Z,
  OCULUS_R,
  ROT_DOME_TOP,
  ROT_R,
  ROT_WALL_H,
  WING_ANGLES,
  WING_H,
  WING_HALF,
  WING_U1,
  wingPoint,
} from './layout';

/**
 * The building: a great domed rotunda with an oculus, four wings of stacks
 * on the diagonals, the entrance hall behind, the Research Hall apse ahead.
 * Stand at the centre and every destination is a sightline.
 */

/** the wing mouth half-arc — the single value the drum opening, the reveal and
 *  the pier derivation all read, so the opening edge is one place, not three.
 *
 *  The door step (the 1.94 subtracted here) is what sets it. It is wider than it
 *  was because EVERY statue niche now wants the full 1.35 m radius of the great
 *  entrance pair: a niche can only be as wide as its pier, and the pier is only
 *  as wide as the gap the mouths leave it. Trimming each mouth by this much
 *  gives even the tight corner piers a 3.40 m face — enough for the 2.70 m
 *  opening with a proper jamb, and 1.32 m of depth behind it. The halls narrow
 *  with the mouths (half-width 4.25 → 3.94 m); their LENGTH is untouched. */
export const WING_HALF_ARC = Math.asin((WING_HALF - 1.94) / ROT_R) + 0.01;

/** the drum's inner face — the radius every pier, niche and figure is set from.
 *  It lives in drumGeometry now, because the wall is generated from it. */
export const DRUM_FACE_R = DRUM_R_IN;

/** where a mouth reveal's jamb springs from: mid drum-wall band (17.15–17.55) */
export const REVEAL_R = ROT_R + 0.25;
/**
 * How deep the mouth reveal runs: a radial jamb from the drum face straight
 * back along the mouth-edge bearing. The drum reads ~1.5 m thick at every wing
 * mouth instead of a 0.4 m shell — and, decisively, it pulls the corridor
 * clear of the wedge behind the neighbouring pier, which is what the statue
 * niches hollow into (see NICHE_DEPTH).
 */
export const REVEAL_D = 1.2;
/**
 * The corridor's side-wall plane, measured from the wing axis — set exactly at
 * the jamb's far end, so wall meets jamb flush and the halls run STRAIGHT from
 * the doorway: no flared splay, no dead pocket behind the door for the player
 * to walk into. Everything in a wing — shelves, galleries, colonnade, benches,
 * the walkable corridor — is measured back from this one plane.
 */
export const WING_WALL_HALF = (REVEAL_R + REVEAL_D) * Math.sin(WING_HALF_ARC); // ≈ 3.98

interface Mouth {
  theta: number;
  halfArc: number;
  /** wings run under a barrel vault; the entrance & apse under flat ceilings.
   *  A vaulted mouth is capped by the very curve its vault continues through. */
  vault: boolean;
}
const MOUTHS: Mouth[] = [
  // wing openings are cut slightly narrower than the full hall width (a door
  // reveal) — at full width, adjacent openings overlap at the corners and the
  // neighbouring halls' bare wall backs loom through as huge brown wedges
  ...WING_ANGLES.map((a) => ({ theta: a, halfArc: WING_HALF_ARC, vault: true })),
  // the entrance and apse mouths are cut to land EXACTLY on the inner face of
  // their hall's side walls (half-width + the 0.15 m the wall's own thickness
  // straddles the opening by). The old `+ 0.02` pad made the opening 18 cm
  // wider than the hall behind it, so each wall's leading edge stood back from
  // the jamb and you looked at a step instead of a doorway.
  { theta: Math.PI / 2, halfArc: Math.asin((ENTRY_HALF + 0.15) / DRUM_R_IN), vault: false }, // entrance, +z
  { theta: (3 * Math.PI) / 2, halfArc: Math.asin((APSE_HALF + 0.15) / DRUM_R_IN), vault: false }, // apse, −z
];

/** The solid stretches of drum BETWEEN the openings — where the statuary
 *  stands. Derived from MOUTHS rather than hand-listed, so a niche can never
 *  drift into a mouth the way the old corner chords did: `width` is the real
 *  arc available at the drum's inner face, and a figure must fit inside it. */
export interface Pier {
  /** bearing of the middle of the gap */
  theta: number;
  /** angular size of the gap, radians */
  arc: number;
  /** usable width in metres at the drum's inner face */
  width: number;
  /**
   * A GREAT pier — one of the four flanking the entrance or the apse, which
   * take the full standing figures and the twin pillars. Derived from the
   * mouths either side rather than from `width`: every pier is wide now, so a
   * width threshold no longer separates them and silently mis-sorted the whole
   * colonnade when the wing mouths were trimmed.
   */
  grand: boolean;
}
export const DRUM_PIERS: Pier[] = (() => {
  const sorted = [...MOUTHS].sort((a, b) => a.theta - b.theta);
  return sorted.map((m, i) => {
    const next = sorted[(i + 1) % sorted.length];
    const start = m.theta + m.halfArc;
    let end = next.theta - next.halfArc;
    while (end < start) end += Math.PI * 2;
    const arc = end - start;
    // the entrance and apse are the two unvaulted mouths; a pier touching
    // either of them is a great one
    return { theta: start + arc / 2, arc, width: arc * DRUM_FACE_R, grand: !m.vault || !next.vault };
  });
})();

/**
 * The apsidal niche hollowed into the drum behind every pier — a semicircular
 * recess in plan, closed above the figure by a conch (quarter-dome).
 *
 * It is cut BACKWARDS out of the one wall ring, never laid in front of it: see
 * the warning further down about the two layers of slabs that were tried here
 * and reverted. The plan radius is half the pier minus a jamb each side, so a
 * niche can never eat into a neighbouring mouth however the mouths are recut.
 */
export interface Niche {
  theta: number;
  /** half-width of the opening, and the vertical radius of the conch */
  r: number;
  /** how far the recess is hollowed back behind the drum face */
  depth: number;
  /** the whole pier's angular size. The ring panels step aside over exactly
   *  this arc and ONE plate spans it instead — see the note on RING_N. */
  arc: number;
  /** height of the springing, where the barrel stops and the conch begins */
  springY: number;
}

/* THE DRUM IS ONE SURFACE. There is no ring of panels any more and no plates
 * laid over it — see the header of `drumGeometry.ts` for the four separate
 * faults that arrangement caused (interpenetrating slabs, staircase arches,
 * a flat plate meeting a round ring, 266 draw calls). Every opening in this
 * file is now handed to `drumWall` as an `Opening` and cut out of the one wall.
 *
 * The wall's UVs are in METRES, so one texture setting serves the whole drum
 * however it is cut: the old panelling read 0.55 of the texture across each
 * 0.486 m panel and repeated once every 3.4 m of height, and these are that
 * same pitch expressed per metre. */
const WALL_U = 0.55 / 0.486;
const WALL_V = 1 / 3.4;

/** wall left either side of a niche opening. It has to carry the niche's own
 *  gilt archivolt (0.22 m) and still leave the pier an edge, which the narrow
 *  3.40 m piers do with 0.13 m to spare — the mouth's archivolt springs from
 *  the impost course at 9.4 m and so never competes for this room. */
const NICHE_JAMB = 0.35;

/** every niche opens to this half-width — the great entrance pair's radius, the
 *  size the whole set is levelled to. Wider piers cap here and carry more jamb. */
const NICHE_R_MAX = 1.35;

/**
 * Depth of the recess — a TRUE semicircular apse now, near enough: depth ≈ the
 * plan radius, so the barrel is a half-cylinder and the conch a real quarter
 * dome. The old flared splays used to sweep through this wedge and capped the
 * depth at zero; with the corridors run straight at WING_WALL_HALF the wedge
 * behind every pier is clear to 1.48 m (measured against every jamb and side
 * wall with 0.28 m of slab clearance), and the niche radius — not the
 * building — is what limits the depth.
 *
 * (The z-squash machinery is kept: the rim the shells present to the room is
 * the same semicircle at any depth, so this can still be tuned shallower
 * without the wall plate's opening drifting out of register.)
 *
 * Taken from 1.00 to 1.35 m to give the figures room BEHIND them — a winged one
 * (Enoch) reaches much further back than he stands deep, and at 1.00 his wings
 * passed through the barrel. This is the whole of the 1.48 m the wedge allows,
 * less the slab clearance. Note that `NICHE_SET_BACK` over in statues.tsx was
 * re-derived at the same time so it still works out to the same 0.35 m in
 * absolute terms: the figures stand exactly where they stood, and every
 * centimetre of the extra depth goes to clearance behind them rather than
 * dragging the whole statuary deeper into the wall.
 */
export const NICHE_DEPTH = 1.35;

export const NICHES: Niche[] = DRUM_PIERS.flatMap((p) => {
  // EVERY pier is niched now — the six corners, the two entrance great piers
  // (Hermes, Enoch) and the two apse great piers (Isis, Serapis). Boaz & Jachin
  // no longer stand ON the apse piers: they have moved inboard to flank the apse
  // mouth (see MasonicPillars), freeing those piers for the same damask apse as
  // the rest of the statuary.
  // Every niche is the same width — the great entrance pair's 1.35 m radius.
  // The mouths were trimmed (see WING_HALF_ARC) so even the corner piers are
  // wide enough to give this with a full jamb; the wider grand piers keep the
  // same opening and simply carry a little more jamb each side.
  const r = Math.min(NICHE_R_MAX, Math.max(0, p.width - NICHE_JAMB * 2) / 2);
  return [{
    theta: p.theta,
    r,
    depth: NICHE_DEPTH,
    arc: p.arc,
    // EVERY niche is identical — same width, same 5.2 m springline, same depth
    // and dressing. The east pier's Leontocephaline gets the same tall apse as
    // the standing figures, and stands at the same height in it (see
    // LeontocephalineEast) so it
    // fills it rather than being given a shorter niche of her own.
    springY: 5.2,
  }];
});

/**
 * Where the vault's transverse ribs cross the hall — and so where the arcade's
 * shafts, corbels and bosses go, since those exist to carry these. Exported so
 * `wingArcade.tsx` cannot put a shaft under a rib that isn't there: the ribs
 * and the old colonnade were two unrelated hand-written lists, and not one
 * column stood under a rib.
 *
 * Two stations are pinned to the galleries (27.0 and 40.95) so each painting
 * gets a bay of its own; the spacing either side is even.
 */
export const RIB_US = [17.6, 22.3, 27.0, 31.65, 36.3, 40.95, 45.6, 50.25, 54.9, 59.55];
/** the bay pitch those ribs march at — the vault's coffer grid is tuned to it */
export const RIB_PITCH = 4.7;

/* The barrel-vault section — radius, centre height and half-angle. Shared by the
 * corridors AND the drum's mouth headers, so a wing opening is capped by the very
 * curve its vault continues through: no step where the hall meets the rotunda. */
export const VAULT_W = WING_WALL_HALF; // half-span out to the wall planes
const VAULT_SAG = 2.6; // rise from springline to crown
export const VAULT_R = VAULT_SAG / 2 + (VAULT_W * VAULT_W) / (2 * VAULT_SAG);
export const VAULT_HALF = Math.asin(VAULT_W / VAULT_R);
export const VAULT_CY = WING_H - 0.1 - VAULT_R; // crown just under the wall tops
/**
 * Where every arch in the rotunda springs from — the one height the impost
 * string course runs at, and the height all ten archivolts start from.
 *
 * The mouths used to be headed by the barrel vault's own soffit, capped flat at
 * 16.6 m. That was two mistakes: the vault's section is a shallow SEGMENT
 * (rise 2.6 m on a 7.9 m span), and the cap flattened the middle 3.2 m of it
 * outright — so a wing mouth was a flat-topped hole with rounded corners, not
 * an arch. Every opening is a TRUE SEMICIRCLE now, radius = its own half-width,
 * springing from this common line: the Roman arcade rule, and the reason the
 * ten openings read as one order rather than ten different holes.
 *
 * The vault is unaffected — it simply begins behind the header now instead of
 * being framed by it (see VAULT_U0 in WingEnclosures), which is how an arch
 * into a vaulted hall actually works.
 */
export const MOUTH_SPRING = 9.4;
/** the impost course the arches land on: its top IS the springing */
const IMPOST_TOP = MOUTH_SPRING;
const PLINTH_TOP = 0.7;

/** the ten doorways, as the wall generator wants them: the head's radius IS the
 *  opening's half-width, so head and jamb meet without a notch at any width */
const MOUTH_OPENINGS: Opening[] = MOUTHS.map((m) =>
  mkOpening(m.theta, m.halfArc * DRUM_R_IN, MOUTH_SPRING, true),
);
/** the ten niches. Cut a centimetre narrower than the shell behind them so the
 *  WALL always laps the SHELL — the rim can then never show as a bright slot,
 *  whatever the recess's depth or the drum's curvature do to it. */
const NICHE_OPENINGS: Opening[] = NICHES.map((n) => mkOpening(n.theta, n.r - 0.01, n.springY, false));
const DRUM_OPENINGS: Opening[] = [...MOUTH_OPENINGS, ...NICHE_OPENINGS];

/**
 * The ten doorways, as anything hanging an order on the wall above them needs
 * to read them: bearing, half-arc, the radius of the semicircular head and the
 * line it springs from.
 *
 * Exported because `drumUpper.tsx` has to BREAK its bands round every arch. A
 * horizontal course that flies across an opening is the single most obvious
 * way to give away that a wall was decorated rather than built, and deriving
 * the break from the same openings the wall is cut to means it can never drift
 * out of register with them the way a hand-listed set of angles would.
 */
export const DRUM_MOUTHS = MOUTH_OPENINGS.map((o) => ({
  theta: o.theta,
  halfArc: o.halfArc,
  headR: o.headR,
  springY: o.springY,
}));
/** how far outside an opening's own edge its archivolt runs (see `bandGeom`) */
export const MOUTH_ARCHIVOLT = 0.3;


/** drum wall, headers, pilasters, dome, oculus, balcony, floor & rug */
/* ————— the dome's own geometry, struck once and shared ————— */

/**
 * How many coffer columns run round the dome. 32 is enough that they are still
 * legible as coffers where they crowd together near the oculus.
 *
 * There are no meridian RIBS. Eight were built here and then cut: they were
 * measured rendering, 224 instances of them, and contributed nothing a viewer
 * could see — dark timber meridians simply disappear among the coffer frames,
 * which already carry the radial rhythm a rib would have given. They were also
 * confused, mixing a Gothic timber device into a coffered masonry shell. The
 * old dome's twelve straight ribs read only because the surface behind them
 * was blank.
 */
const DOME_COLS = 32;
/** the sphere through both rims — see the note on `domeMat`. Derived from the
 *  drum head and the oculus so it cannot drift out of agreement with them. */
export const DOME_BASE_R = ROT_R + 0.5;
export const DOME_TOP_R = OCULUS_R + 0.15;
export const DOME_CY =
  (DOME_BASE_R * DOME_BASE_R + ROT_WALL_H * ROT_WALL_H - DOME_TOP_R * DOME_TOP_R - ROT_DOME_TOP * ROT_DOME_TOP) /
  (2 * (ROT_WALL_H - ROT_DOME_TOP));
export const DOME_SPHERE_R = Math.hypot(DOME_BASE_R, ROT_WALL_H - DOME_CY);
/** the meridian, springing → oculus, as the lathe wants it (x = radius) */
const DOME_PROFILE = (() => {
  const t0 = Math.asin(DOME_BASE_R / DOME_SPHERE_R);
  const t1 = Math.asin(DOME_TOP_R / DOME_SPHERE_R);
  const N = 28;
  return Array.from({ length: N + 1 }, (_, i) => {
    const t = t0 + (t1 - t0) * (i / N);
    return new THREE.Vector2(DOME_SPHERE_R * Math.sin(t), DOME_CY + DOME_SPHERE_R * Math.cos(t));
  });
})();

export function Rotunda() {
  // ONE material for the whole drum — inner face, outer face, every jamb and
  // soffit. Its UVs come out of the generator in metres (see WALL_U/WALL_V), so
  // the panelling keeps one pitch across a surface that is cut ten different
  // ways. The three materials this replaced could not: each was scaled 0..1 per
  // face, so the header panels, the wall panels and the pier plates all carried
  // the boards at different sizes and the joins showed.
  const wallMat = useMemo(() => getMaterial('wood_rotunda_wainscot', { repeat: [WALL_U, WALL_V] }), []);
  const beamMat = useMemo(() => getMaterial('wood_rotunda_timber', { repeat: [1, 5] }), []);
  /**
   * THE DOME. What was here was a `cylinderGeometry(OCULUS_R, ROT_R, …, true)`
   * — a straight-sided truncated CONE with floor planks stretched over it.
   * That is a lampshade, not a dome, and it is why the crown of the building
   * read as the cheapest thing in it: a cone has no section, so there is no
   * point anywhere on it where the light changes, and the eye gets no
   * curvature to follow up to the oculus.
   *
   * It is now a real shell of revolution, struck as a segment of a sphere that
   * passes through BOTH rims — the drum head at r 17.5 / y 17 and the oculus
   * at r 4.85 / y 29. Solving those two conditions gives one sphere, centre
   * y 11.22 and radius 18.43, and DOME_PROFILE below walks it. Nothing here is
   * eyeballed: move the drum or the oculus and the dome re-strikes itself.
   */
  // one painted column of coffers, repeated DOME_COLS times around. The canvas
  // is not tiled vertically — it spans springing to oculus once, so its
  // diminishing rows land where they were drawn to land.
  const domeMat = useMemo(
    () => getMaterial('stone_dome_coffer', { repeat: [DOME_COLS, 1], overrides: { vertexColors: true } }),
    [],
  );
  /**
   * The dome shell — and the light on it, baked in.
   *
   * This needs saying because it is not obvious and it cost a whole pass to
   * find: the dome's inner face receives NO light in this scene. It is
   * `BackSide` and it faces down and inward, the moon is outside the building,
   * and the ambient terms are down at 0.11/0.055 because the room is meant to
   * be dark. So when the coffers were repainted with lapis fields and gilt
   * engraving, none of it was visible — the most detailed surface in the
   * building rendered as a black shell with a star chart floating in front of
   * it.
   *
   * A light would fix it and cost about 1.5 fps. A vertex bake fixes it for
   * nothing, and it can describe the real situation better than a point light
   * could, because the dome is lit by three different things at once:
   *
   *   DIRECT    moonlight coming straight down through the eye and grazing the
   *             coffers immediately around it. Sharpest and coolest.
   *   BOUNCE    the same moonlight off the pale floor of the rotunda, arriving
   *             at the springing from below. This is what stops the dome from
   *             simply fading to black at its base.
   *   PRACTICAL the chandeliers and candles far below, warm, reaching only the
   *             lowest courses.
   *
   * The middle band gets least of all three, which is exactly right: it is the
   * part of a real dome that disappears, and having it disappear is what gives
   * the shell its height.
   */
  const domeGeom = useMemo(() => {
    const g = new THREE.LatheGeometry(DOME_PROFILE, 96);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const r = Math.hypot(pos.getX(i), pos.getZ(i));
      /** 0 at the springing, 1 at the oculus */
      const t = Math.min(1, Math.max(0, (y - ROT_WALL_H) / (ROT_DOME_TOP - ROT_WALL_H)));
      // direct: only the last fifth of the rise, falling off fast
      const direct = Math.pow(Math.max(0, t - 0.55) / 0.45, 1.6);
      // bounce off the floor: strongest at the springing, gone by mid-height,
      // and a touch stronger on the wider courses because they see more floor
      const bounce = Math.pow(1 - t, 2.4) * (0.6 + 0.4 * (r / DOME_BASE_R));
      // 0.34 rather than 0.16 as the floor: the middle band is meant to
      // disappear, but below about a third it crushes to black and takes the
      // coffer steps with it, and a dome with no readable section in its middle
      // is a dark cap rather than a shell.
      const k = 0.34 + 0.8 * direct + 0.55 * bounce;
      // The direct term is moonlight and the bounce is warmed by the timber
      // floor and the candles under it, so the shell runs cool at the crown and
      // warm at its foot — the same split the whole building is graded on.
      col[i * 3] = k * (1 + 0.16 * bounce - 0.05 * direct);
      col[i * 3 + 1] = k * (1 + 0.04 * bounce);
      col[i * 3 + 2] = k * (1 - 0.14 * bounce + 0.1 * direct);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  // Registry-driven: the definition lives in `materials/library.json`, and
  // dropping a scan into `public/textures/wood_floor_polished/` re-dresses this
  // floor with normal, roughness and AO without touching a line of this file.
  const floorMat = useMemo(() => getMaterial('wood_floor_polished', { repeat: [16, 16] }), []);
  // The recess is DRESSED, not panelled: crimson damask lines the barrel — the
  // deep red field the great museum rotondas hang behind their marbles, and
  // what sets a pale figure off the dark timber drum — and the conch above is
  // coffered plaster with gilt rosette bosses. Panelling the recess in the same
  // timber as the wall was tried first and the niche vanished: at this scale a
  // shallow curve in an identical material reads as flat wall. The change of
  // material is what makes it read as carved depth.
  //
  // The damask's v-repeat is exactly 1 so its gilt top fillet lands once, at
  // the springing where cloth meets conch. The coffer canvas is likewise one
  // repeat over the whole quarter-dome: its straight 8×3 grid fans toward the
  // crown on the sphere's own UVs, which is how real coffers converge.
  //
  // Both shells read their tone from baked vertex colours rather than a flat
  // material tint — see `nicheShells`. A single tint cannot describe a hollow:
  // the lip of the recess is in the room's light and the back of it is not, and
  // with no ambient occlusion in this renderer that gradient is the ONLY thing
  // telling the eye the surface curves away instead of lying flat. A uniform
  // darker tint was tried and read as a dark flat panel, not as depth.
  //
  // The damask is PAINTED CLOTH ON A REAL VELVET. `nicheDamask` draws the
  // pattern — no scan is going to hand us an ogival griccia with pomegranates
  // in this exact crimson — but the pattern was carrying the whole surface on
  // its own, and a flat pattern at a metre's range is where a painted texture
  // gives itself away. `velour_velvet` (Poly Haven, CC0) now supplies the
  // normal, roughness and AO, so the pile has real nap and catches the candles
  // unevenly, and `paintedAlbedo` keeps the velvet's own grey out of the
  // colour slot. The drawing itself went to 2048² in the same pass.
  const nicheMat = useMemo(
    () =>
      getMaterial('fabric_niche_damask', {
        repeat: [2.4, 1],
        paintedAlbedo: true,
        overrides: { side: 'back', vertexColors: true },
      }),
    [],
  );
  // The conch needs an EMISSIVE floor, and it is not decoration — without it
  // the quarter-dome renders pitch black. Nothing in the building actually
  // lights it: the room's ambient is 0.058 and the hemisphere 0.095 (see
  // lighting.tsx), and the only lamp that ever points into a recess is the
  // travelling key in nicheLight.tsx, which HANGS INSIDE THE HEAD OF THE CONCH
  // and aims DOWN at the figure's chest — so the whole vault sits behind its
  // cone and receives not one photon from it. The barrel gets away with the
  // same starvation because the two additive candle plumes are drawn over it;
  // the vault has no such layer, so its baked vertex gradient — however
  // carefully graded — was being multiplied by nothing and came out as the
  // black half-disc at the top of every niche.
  //
  // A light would fix it and cost ~1.5 fps apiece (nicheLight.tsx explains why
  // that trade is never worth making). Emissive is free — but it must be
  // MAPPED. A flat emissive colour is uniform across the shell, and on a
  // surface this dark it is the only thing being seen: it swamped the scan and
  // the vault came out as one plain sheet of colour. `emissiveFromAlbedo` puts
  // the same texture in the emissive slot, so the self-light carries the
  // masonry rather than washing over it.
  //
  // The conch is a GOLD-TESSERA MOSAIC — `stone_niche_mosaic`: the painted
  // `conchMosaic` tesserae over the `old_mosaic_floor` scan (Poly Haven, CC0),
  // which supplies real set-tile relief in the normal and roughness.
  //
  // It has been plaster, then brick, and the brick was the instructive
  // failure: cool grey-brown masonry meeting crimson silk at a hard line, two
  // materials with nothing in common between them. Gold is what every apse
  // from Ravenna onward puts over a red dado, and for a reason that is about
  // colour rather than history — gold and crimson are the same warmth at
  // different values, so the vault reads as the hanging deepening rather than
  // as a different wall bolted above it. It also finally agrees with the brass
  // archivolt around the recess and the two candle flames at its foot.
  //
  // Kept DARK deliberately: `emissiveIntensity` is the dial, and it is low
  // because the vault must stay a shade behind the figure's head. A mosaic
  // semi-dome in an unlit alcove is a surface that catches light, not one that
  // makes it — push this past about 0.25 and the gold starts glowing out into
  // the room and the silhouette the whole shell bake exists to protect is gone.
  const conchMat = useMemo(
    () =>
      getMaterial('stone_niche_mosaic', {
        repeat: [1, 1],
        // the tesserae are the DESIGN — the scan is a floor and its own colour
        // is a grey-beige that would put the gold straight back out of the
        // recess. We take its relief and keep our own palette.
        paintedAlbedo: true,
        emissiveFromAlbedo: true,
        overrides: {
          side: 'back',
          vertexColors: true,
          emissive: '#6a4f28',
          emissiveIntensity: 0.16,
        },
      }),
    [],
  );
  // the gilt archivolt and jamb fillets framing each niche — brass, warmed by
  // a touch of emissive because the metalness has no environment to mirror
  const trimMat = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        overrides: { color: '#b28a46', roughness: 0.45, metalness: 0.35, emissive: '#2e2210' },
      }),
    [],
  );
  // Only the geometry is ours to dispose now. Registry materials are cached and
  // shared across the whole building — disposing one here would blank every
  // other surface using it the moment the explorer unmounts and remounts.
  useLayoutEffect(
    () => () => {
      domeGeom.dispose();
    },
    [domeGeom],
  );

  /** the entire drum — both faces, all twenty openings, every reveal — in one
   *  geometry. Nothing here is placed by hand, so nothing here can drift. */
  const wallGeom = useMemo(() => drumWall(DRUM_OPENINGS, ROT_WALL_H), []);
  useLayoutEffect(() => () => wallGeom.dispose(), [wallGeom]);

  /**
   * The horizontal orders: a plinth on the floor, an impost course at the
   * springing of the arches, and a cornice under the dome. All three are real
   * swept profiles, not tubes — the torus that used to ring the drum here read
   * as a brown pipe flying through the room precisely because a circle of
   * constant section is not a moulding.
   *
   * The plinth and the impost BREAK at the openings, as they must: an
   * unbroken band would fly across every doorway. The break list is derived
   * from the openings themselves, widened by each archivolt's own width, so a
   * band can never run into a moulding.
   */
  const bandGeom = useMemo(() => {
    const b = newBuilder();
    const plinth: Profile = [
      [0, 0],
      [0.1, 0],
      [0.1, 0.5],
      [0.06, 0.6],
      [0, PLINTH_TOP],
    ];
    const impost: Profile = [
      [0, IMPOST_TOP - 0.42],
      [0.06, IMPOST_TOP - 0.34],
      [0.12, IMPOST_TOP - 0.2],
      [0.12, IMPOST_TOP - 0.06],
      [0, IMPOST_TOP],
    ];
    const cornice: Profile = [
      [0, ROT_WALL_H - 1.1],
      [0.08, ROT_WALL_H - 0.85],
      [0.16, ROT_WALL_H - 0.42],
      [0.22, ROT_WALL_H - 0.12],
      [0.22, ROT_WALL_H],
      [0, ROT_WALL_H],
    ];
    // gaps between openings, given each opening's own clearance
    const gaps = (list: { theta: number; halfArc: number; pad: number }[]) => {
      const os = [...list].sort((a, b) => a.theta - b.theta);
      return os.map((o, i) => {
        const next = os[(i + 1) % os.length];
        const t0 = o.theta + o.halfArc + o.pad;
        let t1 = next.theta - next.halfArc - next.pad;
        while (t1 <= t0) t1 += Math.PI * 2;
        return [t0, t1] as [number, number];
      });
    };
    const NICHE_TRIM = 0.24 / DRUM_R_IN;
    for (const [t0, t1] of gaps([
      ...MOUTH_OPENINGS.map((o) => ({ theta: o.theta, halfArc: o.halfArc, pad: 0 })),
      ...NICHE_OPENINGS.map((o) => ({ theta: o.theta, halfArc: o.halfArc, pad: NICHE_TRIM })),
    ]))
      sweptBand(b, plinth, t0, t1, true);
    // the niches stop well below the impost, so it only steps aside for doorways
    for (const [t0, t1] of gaps(MOUTH_OPENINGS.map((o) => ({ theta: o.theta, halfArc: o.halfArc, pad: 0 }))))
      sweptBand(b, impost, t0, t1, true);
    sweptBand(b, cornice, 0, Math.PI * 2, false);
    // and the archivolt over every doorway, springing off the impost it lands on
    for (const o of MOUTH_OPENINGS)
      archMoulding(
        b,
        o,
        [
          { off: 0.02, proud: 0 },
          { off: 0.06, proud: 0.12 },
          { off: 0.26, proud: 0.12 },
          { off: 0.3, proud: 0 },
        ],
        MOUTH_SPRING,
        true,
      );
    return toGeometry(b);
  }, []);
  useLayoutEffect(() => () => bandGeom.dispose(), [bandGeom]);

  /** the gilt archivolt round every niche — jambs and head in one continuous
   *  moulding, generated from the same outline the opening is cut to, so it
   *  follows the drum's curve instead of cutting the chord a flat ring cuts */
  const nicheTrimGeom = useMemo(() => {
    const b = newBuilder();
    for (const o of NICHE_OPENINGS)
      archMoulding(
        b,
        o,
        [
          { off: 0.03, proud: 0 },
          { off: 0.06, proud: 0.07 },
          { off: 0.19, proud: 0.07 },
          { off: 0.22, proud: 0 },
        ],
        PLINTH_TOP,
        false,
      );
    return toGeometry(b);
  }, []);
  useLayoutEffect(() => () => nicheTrimGeom.dispose(), [nicheTrimGeom]);

  /**
   * The two shells of each recess, with the hollow's own shading baked in — and
   * with the candlelight in it.
   *
   * `t` is how far a vertex has withdrawn from the drum face, 0 at the rim and
   * 1 at the very back of the shell, read off the UNSQUASHED local z so the
   * gradient is the same whatever depth the niche is given.
   *
   * ── The candle wash, and why it replaced a flat fall to the floor ─────────
   *
   * This used to be `k = 1 − 0.5t² − 0.18·down`: darkest at the floor, on the
   * reasoning that a recess is darkest at its foot. That is true of a recess
   * lit from a window. It is exactly backwards for THIS one, which is lit by
   * two brass candle stands standing on the plinth at y ≈ 1.25 (see `Monument`
   * in statues.tsx) — and it was the real reason the statues read as flatly
   * lit: the brightest thing in the alcove was the empty top of it, so the
   * figure had nothing behind its head and nothing under its chin.
   *
   * What is baked now is what two candles at the foot of a red silk barrel
   * actually do:
   *
   *   · a WASH peaking at the flame line and falling away with distance, so the
   *     cloth is hottest where the figure's knees and waist are;
   *   · carried UP the back of the recess behind the figure's head, because the
   *     back of a barrel is the surface most nearly facing a flame at its foot;
   *   · a WARM CAST in the same falloff — candle flame is close to 1900 K, and
   *     tinting the vertex colour is free where an extra light would cost about
   *     1.5 fps × ten niches;
   *   · the rim left DARK, so the recess frames the figure instead of glowing
   *     out into the room.
   *
   * The point of all of it is silhouette. A dark museum lights the wall behind
   * a marble rather than the marble, and lets the figure come forward as a
   * shape against it — which is a thing this renderer can do for nothing, and
   * ten spotlights are a thing it cannot afford at all.
   */
  const shells = useMemo(
    () =>
      NICHES.map((n) => {
        const barrel = new THREE.CylinderGeometry(n.r, n.r, n.springY, 64, 24, true, Math.PI / 2, Math.PI);
        const conch = new THREE.SphereGeometry(n.r, 64, 32, Math.PI, Math.PI, 0, Math.PI / 2);
        /** the flames stand at about this height above the niche floor */
        const FLAME_Y = 1.25;
        for (const g of [barrel, conch]) {
          const pos = g.attributes.position;
          const col = new Float32Array(pos.count * 3);
          for (let i = 0; i < pos.count; i++) {
            const z = -pos.getZ(i);
            const t = Math.min(1, Math.max(0, z / n.r));
            // height above the niche floor: the barrel's own y runs ±springY/2
            // about its middle, and the conch sits on top of the whole barrel
            const y = g === barrel ? pos.getY(i) + n.springY / 2 : n.springY + pos.getY(i);
            // distance from the flame line, as a fraction of the niche's own
            // height, so a tall niche and a short one are lit the same way
            const d = Math.abs(y - FLAME_Y) / n.springY;
            // the wash: strong at the flames, gone by the springing. The `t`
            // term is what carries it up the BACK of the recess rather than
            // spilling onto the rim.
            const wash = Math.exp(-d * d * 5.5) * (0.35 + 0.65 * t);
            /**
             * The ambient fall into the hollow.
             *
             * The barrel keeps the old curve. The CONCH does not, and cannot:
             * this bake was calibrated when the recess was 1.00 m deep and the
             * shells were z-squashed to 0.74, so the quarter-dome was a shallow
             * saucer whose crown sat barely behind its rim. At the true 1.35 m
             * the dome is a real hemisphere — the crown is a third of a metre
             * further back, the whole vault is out at high `t`, and the same
             * 0.55 fall put nearly all of it at the floor of the curve at once.
             * It stopped reading as a lit vault receding and started reading as
             * a black half-disc capping the niche.
             *
             * So the conch falls off far more gently and never goes near as
             * dark, with a lift toward the springing — the part of a real
             * coffered vault that catches most of what comes off the back of
             * the recess, and the part the visitor actually sees over the
             * figure's head.
             *
             * The BARREL gets a lift of its own over its top third. The wash is
             * a candle wash and is long gone by 5.2 m, so the cloth arrived at
             * the springing at the floor of its own falloff — which put a black
             * seam right where it meets the vault, and no amount of brightening
             * the conch alone fixes a dark ring under it.
             */
            const isConch = g !== barrel;
            // 0 below the top third of the barrel, 1 at the springing
            const high = Math.max(0, (y - n.springY * 0.62) / (n.springY * 0.38));
            const base = isConch
              ? 1 - 0.16 * t * t + 0.26 * (1 - t)
              : 1 - 0.55 * t * t + 0.24 * high * high;
            /**
             * THE FILL, added with the theatrical rig (see `nicheLight.tsx`).
             *
             * A key and a rim on their own give a figure a lit side and a hole
             * where the other side should be. What a real alcove has instead
             * is a little cold light coming back UP off the pale boards in
             * front of it — moonlight that has come down the oculus, crossed
             * the floor and bounced. It arrives only at the recess's front lip
             * and only low down, which is exactly where the key cannot reach.
             *
             * It is cool where everything else in the niche is warm, and that
             * temperature split is what stops the shadow side reading as
             * underexposure rather than as shadow.
             */
            const fill = Math.pow(Math.max(0, 1 - t / 0.45), 2) * Math.pow(Math.max(0, 1 - y / 2.4), 1.6);
            const k = base + 0.62 * wash + 0.16 * fill;
            // warm with the wash, cool with the fill, never above the diffuse
            // it multiplies
            col[i * 3] = Math.min(1.35, k * (1 + 0.1 * wash - 0.05 * fill));
            col[i * 3 + 1] = Math.min(1.35, k * (1 - 0.02 * wash + 0.01 * fill));
            col[i * 3 + 2] = Math.min(1.35, k * (1 - 0.16 * wash + 0.12 * fill));
          }
          g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        }
        return { barrel, conch };
      }),
    [],
  );
  useLayoutEffect(
    () => () =>
      shells.forEach(({ barrel, conch }) => {
        barrel.dispose();
        conch.dispose();
      }),
    [shells],
  );

  return (
    <group>
      {/* The board floor. What used to sit on it here — a 7 m circle of Persian
          rug dropped under the centre table — is gone: the rotunda's floor is
          the Cosmographia now (three/cosmographia.tsx), one 31.6 m woven sheet
          that reaches the wing mouths and hands off to a way at every gate.
          That rug could not be widened into the job, because it began where the
          building's other floors ended and referred to none of them. */}
      <mesh rotation-x={-Math.PI / 2} material={floorMat}>
        <circleGeometry args={[48, 64]} />
      </mesh>

      {/* ————— the drum: one wall, generated, not assembled —————
          Twenty openings are cut out of a single surface: ten doorways headed
          by true semicircles springing off the impost course, and ten niches
          sunk into the inner face. Read `drumGeometry.ts` before touching it —
          in particular, nothing may be laid IN FRONT of this wall to patch it.
          Every attempt to do that (corner chords, jamb-and-bead reveals, pier
          plates) ended as two slabs fighting over the same 25 centimetres. */}
      <mesh geometry={wallGeom} material={wallMat} />
      <mesh geometry={bandGeom} material={beamMat} />
      <mesh geometry={nicheTrimGeom} material={trimMat} />

      {/* ————— the apsidal niches —————
          One per pier, recessed BEHIND the drum face into the dead wedge
          between the wings: a half-cylinder barrel from the floor to the
          springing, closed by a conch above it. Both are open shells rendered
          BackSide, because we only ever stand inside them looking in. Local +z
          points at the room, so the half we keep is the far half (z < 0) —
          the near half would be the part standing proud of the drum, which the
          note below forbids.

          Segment counts are high for the size of these — the hollow is a metre
          across and read from two metres away, close enough that facets on the
          conch are the first thing the eye finds. */}
      {NICHES.map((n, i) => {
        // A centimetre BEHIND the drum face, not on it. The shells' rim is flat
        // and the wall is round, so a rim set flush at the middle would stand
        // proud of the wall at the crown of the conch by the sagitta of a 2.7 m
        // chord — 5 cm of shell hanging in the room. Set back, the whole rim is
        // at or behind the face, and the wall's own 5 cm return laps it.
        const r = DRUM_FACE_R + 0.01;
        const x = Math.cos(n.theta) * r;
        const z = Math.sin(n.theta) * r;
        const rotY = Math.atan2(-Math.cos(n.theta), -Math.sin(n.theta));
        return (
          // squashing local z is what turns the round barrel and its
          // quarter-sphere into the ellipse the splays leave room for. Width
          // and the conch's rise are untouched, so the rim the shells present
          // to the room stays the exact semicircle the plate is cut to.
          <group key={`niche-${i}`} position={[x, 0, z]} rotation-y={rotY} scale={[1, 1, n.depth / n.r]}>
            <mesh position={[0, n.springY / 2, 0]} geometry={shells[i].barrel} material={nicheMat} />
            <mesh position={[0, n.springY, 0]} geometry={shells[i].conch} material={conchMat} />
          </group>
        );
      })}

      {/* (the old cornice torus ringing the drum is gone — from the floor it
          read as a huge brown tube sweeping through the hall) */}

      {/* ————— ONE wall layer at the drum, and only one —————
          The panel ring above is the whole drum. Two further layers used to be
          stacked on top of it here and both are gone:

          · hand-listed "flat corner walls" — chords at r 16.90–17.40 laid over
            the ring at 17.15–17.55, so the slabs interpenetrated by 0.25 m and
            stood 0.25 m proud of the drum's inner face. Their widths were
            guessed, not derived: a narrow corner's gap is 0.82 m of arc but the
            chord was 2.6 m, overhanging 0.89 m into EACH neighbouring opening
            and standing squarely in front of the stacks behind it.
          · jamb-and-bead "mouth reveals" — an attempt to give the openings
            visible depth. They started at r 17.00, INSIDE the ring's own inner
            face, so they clipped straight through it, and the bead was proud of
            the drum by design. Three overlapping slabs at every mouth edge.

          The ring alone seals every non-mouth angle at the correct radius and
          needs no help. If an opening's edge ever wants more definition, it has
          to come OUT of this one wall — a rebate cut into the ring, or panels
          whose radius is derived from it — never a new slab laid in front. And
          nothing may stand proud of the drum into the rotunda: protruding piers
          were tried here once and rejected. */}

      {/* the dome: a coffered shell of revolution rising to the oculus */}
      <mesh geometry={domeGeom} material={domeMat} />
      {/* the cornice the dome springs from. A dome that meets its drum on a
          bare joint reads as a lid set on a tube; a real one lands on a ring
          that visibly gathers the thrust, and it is also what hides the seam
          where two different surfaces meet. */}
      <mesh position={[0, ROT_WALL_H + 0.12, 0]} rotation-x={Math.PI / 2} material={beamMat}>
        <torusGeometry args={[ROT_R + 0.34, 0.3, 8, 72]} />
      </mesh>
      <mesh position={[0, ROT_WALL_H - 0.22, 0]} rotation-x={Math.PI / 2} material={beamMat}>
        <torusGeometry args={[ROT_R + 0.16, 0.16, 6, 72]} />
      </mesh>
      {/* ————— the oculus glazing —————
          A pane over the eye, so the moonlight has something to gleam ON as it
          comes through. This is NOT the old glass disc: that one was a flat
          `meshBasic` in pale blue at 0.1, an unlit film of colour laid across the
          hole — it could not catch anything, it could only tint.

          This is a smooth dark standard material instead, so it does nothing at
          all except where a light hits it at the right angle: the moon directional
          rakes across it and comes back as one specular sheen on the moonward side
          of the disc, which is exactly what a sheet of old glass in a night sky
          does. Where nothing hits it, it stays black and the stars show through.

          No collar, no glazing bars, no ring. The eye reads as an opening with
          glass in it, not as a window frame hanging over the room. */}
      <mesh position={[0, ROT_DOME_TOP + 0.04, 0]} rotation-x={Math.PI / 2}>
        <circleGeometry args={[OCULUS_R, 48]} />
        <meshStandardMaterial
          color="#070a12"
          roughness={0.06}
          metalness={0.2}
          transparent
          opacity={0.5}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

    </group>
  );
}

/** the four wings: side walls above the shelves, plank ceilings, beams,
 *  and a stained-glass window at the end of every walk */
export function WingEnclosures() {
  const glassTex = useMemo(() => stainedGlassArch(), []);
  // dense tiling (~1.7 m panels, matching the drum) — stretched any thinner
  // the walls read as smooth low-poly brown slabs at a distance.
  //
  // These read `wood_hall_wainscot`, NOT the rotunda's. The halls are their own
  // timber: walking out of the drum into a wing should be a change of room, and
  // the wood is what says so. Sharing one definition would silently weld the
  // two together the first time either is retuned.
  const wallMat = useMemo(() => getMaterial('wood_hall_wainscot', { repeat: [28, WING_H / 3.4] }), []);
  const endMat = useMemo(() => getMaterial('wood_hall_wainscot', { repeat: [7, WING_H / 3.4] }), []);
  // the flared mouth splay, ~2.5 m long — tiled to the same ~1.7 m panel pitch
  // as the side wall so the panel grid reads continuous into the corridor
  const splayMat = useMemo(() => getMaterial('wood_hall_wainscot', { repeat: [1.5, WING_H / 3.4] }), []);
  const glassMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: glassTex, transparent: true, toneMapped: false }),
    [glassTex],
  );
  /* — the great barrel vault: a curved timber ceiling spanning wall to wall,
       ribbed at every bay line, a brass ridge rail running the crown. Its
       section (VAULT_R/HALF/CY) is the shared one the drum headers also use. */

  // the FLOOR runs in to just short of the drum face; the rotunda's own disc
  // covers the last half-metre, so a full-width floor reaches every mouth
  const U0_SHELL = 16.55;
  const len = WING_U1 + 0.6 - U0_SHELL;
  const mid = (U0_SHELL + WING_U1 + 0.6) / 2;
  // the VAULT stops just past the drum's OUTER face, behind the arched header
  // (see DRUM_IN below). Its near rim is a circle-arc whose crown sits at world
  // radius VAULT_U0; any smaller and the rim reaches back through the wall and
  // shows inside the rotunda above the mouth.
  const VAULT_U0 = 17.62;
  const vaultLen = WING_U1 + 0.6 - VAULT_U0;
  const vaultMid = (VAULT_U0 + WING_U1 + 0.6) / 2;
  /* ————— where the hall meets the drum: jamb, then wall, nothing stacked —————
   * The corridor is exactly as wide as its doorway now. Each side is a radial
   * JAMB straight back from the mouth edge (REVEAL_R/REVEAL_D, module scope),
   * and the side wall picks up at the jamb's far end — same plane, WING_WALL_HALF
   * — and runs straight to the end of the hall. The old flared splay out to
   * ±5.95 is gone with the width that needed it; there is no dead pocket
   * behind the doorway any more, which is also what makes the jamb SOLID: the
   * walkable test clamps to the corridor and there is no gap to slip into.
   * The wall near-end starts at u 17.2, tucked slightly past the jamb so the
   * two solids overlap rather than butt — no seam of daylight at the junction. */
  const U0_WALL = 17.2;
  const wallLen = WING_U1 + 0.6 - U0_WALL;
  const wallMid = (U0_WALL + WING_U1 + 0.6) / 2;
  const JAMB_U0 = REVEAL_R * Math.cos(WING_HALF_ARC); // jamb near end, on the drum's mouth edge
  const JAMB_N0 = REVEAL_R * Math.sin(WING_HALF_ARC);
  const JAMB_U1 = (REVEAL_R + REVEAL_D) * Math.cos(WING_HALF_ARC); // far end, where the wall begins
  const JAMB_N1 = WING_WALL_HALF;

  /* The vault was floor planks tiled 40 x 4 — boarding stretched over a tube,
   * which is exactly as flat as it sounds. It is coffered now, and the two
   * repeats are computed rather than dialled in:
   *
   *   ACROSS  the soffit's arc is VAULT_R * 2 * VAULT_HALF ≈ 9.97 m, so 6
   *           coffers puts them at ~1.66 m — a panel a visitor reads as a
   *           panel from the floor 14 m below.
   *   ALONG   the vault's own v runs 1 per 12 m (see vaultGeom, where v is
   *           (uFar - uNear) / 12). Three coffers to each 4.7 m rib bay
   *           therefore wants 12 / 4.7 * 3, and because that is a whole number
   *           of coffers PER BAY the grid lands on the ribs instead of
   *           drifting past them down the hall.
   */
  const vaultMat = useMemo(
    () =>
      getMaterial('stone_vault_coffer', {
        repeat: [6, (12 / RIB_PITCH) * 3],
        overrides: { side: 'back' },
      }),
    [],
  );
  // the rotunda's floor disc (r 48) runs out mid-hall — every wing lays its
  // own planked floor for the full walk, boards running with the aisle and
  // scaled to match the rotunda's (one 6 m plank tile per 6 m of floor)
  const floorMat = useMemo(
    () =>
      getMaterial('wood_floor_polished', {
        repeat: [(WING_U1 + 0.6 - 16.55) / 6, (WING_WALL_HALF * 2) / 6],
      }),
    [],
  );
  const ribMat = useMemo(
    () => getMaterial('wood_hall_timber', { repeat: [1, 2], overrides: { side: 'double' } }),
    [],
  );
  const ridgeMat = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        overrides: { color: '#b98a3d', metalness: 0.75, roughness: 0.35 },
      }),
    [],
  );
  // The barrel vault, built by hand so its NEAR rim rides the drum's inner face
  // instead of ending on a flat plane. A stock cylinder ends square at one u, but
  // the drum is round — so a square rim either clips through the wall (rim pulled
  // in) or leaves an open lune above the mouth (rim pushed out). Here every rib of
  // the near rim is placed at u = √(DRUM_IN² − n²): the exact u where that height's
  // cross-section meets the drum, so the vault closes onto the wall all the way
  // round the opening, no gap and no clip. The far end stays square at uFar.
  const vaultGeom = useMemo(() => {
    const SEGS = 64;
    // The vault begins just OUTSIDE the drum's outer face now. It used to end a
    // hair inside the INNER face (17.13), because a mouth's header WAS the
    // vault's soffit and the two had to touch. The mouths are arched well below
    // the vault now (MOUTH_SPRING), so the vault has to finish BEHIND the
    // header instead — and 17.62 is the radius at which no part of the rim can
    // reach back through the wall into the rotunda even at the haunches, where
    // it swings furthest in: u = √(17.62² − 3.94²) = 17.18, clear of 17.15.
    const DRUM_IN = ROT_R + 0.62;
    const uFar = WING_U1 + 0.6;
    const g = new THREE.BufferGeometry();
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= SEGS; i++) {
      const psi = -VAULT_HALF + 2 * VAULT_HALF * (i / SEGS);
      const nn = VAULT_R * Math.sin(psi); // across the hall (local z)
      const yy = VAULT_R * Math.cos(psi); // height above VAULT_CY (local y)
      const uNear = Math.min(Math.sqrt(Math.max(0, DRUM_IN * DRUM_IN - nn * nn)), uFar - 1);
      pos.push(uNear - vaultMid, yy, nn);
      uv.push(i / SEGS, 0);
      pos.push(uFar - vaultMid, yy, nn);
      uv.push(i / SEGS, (uFar - uNear) / 12);
    }
    for (let i = 0; i < SEGS; i++) {
      const a0 = i * 2;
      const b0 = a0 + 1;
      const a1 = (i + 1) * 2;
      const b1 = a1 + 1;
      idx.push(a0, b1, b0, a0, a1, b1);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [vaultMid]);
  /** every rib of one wing's vault, baked into a single buffer in the vault's
   *  own local space — identical for all eight wings, so it is built once */
  const ribsGeom = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    const hoop = new THREE.CylinderGeometry(
      VAULT_R - 0.07,
      VAULT_R - 0.07,
      0.42,
      48,
      1,
      true,
      Math.PI / 2 - VAULT_HALF,
      VAULT_HALF * 2,
    );
    for (const u of RIB_US) {
      const g = hoop.clone();
      g.rotateZ(Math.PI / 2);
      g.translate(u - vaultMid, 0, 0);
      parts.push(g);
    }
    hoop.dispose();
    for (const k of [-2, -1, 1, 2]) {
      const psi = (k / 3) * VAULT_HALF;
      const g = new THREE.BoxGeometry(vaultLen, 0.16, 0.22);
      g.rotateX(-psi);
      g.translate(0, VAULT_R * Math.cos(psi) - 0.06, VAULT_R * Math.sin(psi));
      parts.push(g);
    }
    const merged = mergeGeometries(parts, false)!;
    parts.forEach((p) => p.dispose());
    return merged;
  }, [vaultMid, vaultLen]);

  useLayoutEffect(
    () => () => {
      // glassMat is still locally owned; the rest belong to the registry and
      // are shared across the building, so disposing them here would blank
      // every other surface using them.
      glassMat.dispose();
      vaultGeom.dispose();
      ribsGeom.dispose();
    },
    [glassMat, vaultGeom, ribsGeom],
  );

  return (
    <group>
      {WING_ANGLES.map((a) => {
        const [mx, mz] = wingPoint(a, mid, 0);
        const [vmx, vmz] = wingPoint(a, vaultMid, 0);
        const [ex, ez] = wingPoint(a, WING_U1 + 0.2, 0);
        const [wx1, wz1] = wingPoint(a, wallMid, WING_WALL_HALF);
        const [wx2, wz2] = wingPoint(a, wallMid, -WING_WALL_HALF);
        const [gx, gz] = wingPoint(a, WING_U1 - 0.25, 0);
        // per side: just the radial reveal jamb, drum mouth edge straight back
        // to the wall plane — built from its two world-space endpoints
        const flanks = [1, -1].map((s) => {
          const [jx, jz] = wingPoint(a, JAMB_U0, s * JAMB_N0);
          const [ax, az] = wingPoint(a, JAMB_U1, s * JAMB_N1);
          return { key: `jamb${s}`, cx: (jx + ax) / 2, cz: (jz + az) / 2, len: Math.hypot(ax - jx, az - jz) + 0.3, rotY: Math.atan2(-(az - jz), ax - jx) };
        });
        return (
          <group key={a}>
            {/* the hall's own planked floor, boards running with the aisle */}
            <group position={[mx, 0.008, mz]} rotation-y={-a}>
              <mesh rotation-x={-Math.PI / 2} material={floorMat}>
                <planeGeometry args={[len, WING_WALL_HALF * 2]} />
              </mesh>
            </group>
            {/* side walls, full height behind the shelves, run all the way
                from the drum to the end of the hall — one continuous plane */}
            <mesh position={[wx1, WING_H / 2, wz1]} rotation-y={-a} material={wallMat}>
              <boxGeometry args={[wallLen, WING_H, 0.4]} />
            </mesh>
            <mesh position={[wx2, WING_H / 2, wz2]} rotation-y={-a} material={wallMat}>
              <boxGeometry args={[wallLen, WING_H, 0.4]} />
            </mesh>
            {/* the mouth reveals and flared splays — jamb straight back from
                the drum opening, then the angled splay out to the side wall,
                so corridor and rotunda read as one continuous, connected wall */}
            {flanks.map(({ key, cx, cz, len, rotY }) => (
              <mesh key={key} position={[cx, WING_H / 2, cz]} rotation-y={rotY} material={splayMat}>
                <boxGeometry args={[len, WING_H, 0.4]} />
              </mesh>
            ))}
            {/* end wall + window */}
            <mesh position={[ex, WING_H / 2, ez]} rotation-y={-a} material={endMat}>
              <boxGeometry args={[0.45, WING_H, WING_WALL_HALF * 2 + 0.8]} />
            </mesh>
            <mesh position={[gx, 6.1, gz]} rotation-y={-a - Math.PI / 2} material={glassMat}>
              <planeGeometry args={[4.8, 7.4]} />
            </mesh>
            {/* the barrel vault, its ribs, and the brass ridge */}
            <group position={[vmx, VAULT_CY, vmz]} rotation-y={-a}>
              <mesh geometry={vaultGeom} material={vaultMat} />
              {/* Ten transverse hoops and four LONGITUDINAL ribs, merged into
                  one buffer. The longitudinal set is what makes this read as a
                  coffered vault rather than a tube with bands painted on it:
                  a surface hooped in one direction only has no grain, and the
                  crossings are what the eye follows away down the hall. Their
                  angles are the same sixths the coffer grid is cut on, so rib
                  and joint coincide instead of arguing.

                  All fourteen were separate meshes per wing — 112 draw calls
                  across the building for a set of members that never move
                  relative to each other. */}
              <mesh geometry={ribsGeom} material={ribMat} />
              <mesh position={[0, VAULT_R - 0.18, 0]} material={ridgeMat}>
                <boxGeometry args={[vaultLen, 0.1, 0.26]} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Where a flat-walled hall (the entrance, the apse) has to start if it is to
 * meet a ROUND drum without a slot at the corner.
 *
 * A hall wall is a plane; the drum is a cylinder that curves AWAY from that
 * plane as you move off the axis. Start the wall at the depth the drum reaches
 * on the CENTRELINE and its outer edge misses the drum entirely — which is
 * exactly what happened: the apse walls began at |z| 17.55 while the drum's
 * outer face, out at the wall's own outer edge (x 2.75), had already turned
 * back to |z| 17.33. That left a 22 cm slot at each corner of the doorway,
 * open into the dead wedge behind the drum, right where Boaz and Jachin stand.
 *
 * The fix is to measure at the WORST point — the hall's outermost edge, where
 * the drum has turned back furthest — and to land there in the MIDDLE of the
 * drum's 40 cm thickness. Both bounds matter and they pull opposite ways:
 * start any shallower than the outer face and the corner is still open; start
 * any deeper than the inner face and the wall's corner juts out of the drum
 * into the rotunda, which is the fault this hall had in the first place.
 * Halfway between leaves 20 cm of margin against each.
 *
 * `halfWidth + 0.6` is the ceiling's half-span, the widest thing the hall
 * presents to the drum — wider than the walls, and it has to be roofed too.
 */
function hallWallStart(halfWidth: number): number {
  const w = halfWidth + 0.6;
  const atInner = Math.sqrt(DRUM_R_IN * DRUM_R_IN - w * w);
  const atOuter = Math.sqrt(DRUM_R_OUT * DRUM_R_OUT - w * w);
  return (atInner + atOuter) / 2;
}

/* ————— the great doors of the entrance —————
 *
 * What stood here was two boxes, two spheres and a torus: a 1.58 × 5.4 slab
 * per leaf, a knob apiece, and a dark brown ring over the top. It is the
 * FIRST thing a visitor stands in front of and the last thing they see on the
 * way out, and it was the least made object in the building.
 *
 * The rebuild is joinery rather than decoration — every part below is a part a
 * real pair of doors has, and each one is doing the job it does in timber:
 *
 *  · STILES AND RAILS with three raised-and-fielded panels per leaf. The
 *    panels are what break a two-storey slab into something the eye can read
 *    the scale of; the bolection moulding around each is what catches the
 *    candlelight and tells you the door is thick.
 *  · A MEETING ASTRAGAL on the closing leaf, so the pair reads as two doors
 *    that shut against each other rather than one slab with a seam.
 *  · BRASS: ring pulls on foliate escutcheons, long strap hinges running back
 *    from the outer stiles, and clavos studded along every rail. Brass and not
 *    gold — it is the same `metal_brass_burnished` as the niche archivolts and
 *    the orrery pins, and repeating a metal is what makes a building feel like
 *    one hand made it.
 *  · A STONE ARCHITRAVE with a keystone, in the building's own limestone, so
 *    the opening is framed by the fabric rather than by more of the same wood.
 *  · A STAINED FANLIGHT in the arched head with radial glazing bars — the
 *    same unlit painter the wings' windows use. It is the one part of this
 *    that gives out light rather than taking it, and it is the reason the
 *    doorway reads from the middle of the rotunda.
 *
 * All of it merges to FIVE draw calls — leaves, brass, stone, glass, sill —
 * because the parts are hundreds of boxes and this scene is draw-call bound.
 */

/** a box, placed and sized in one call — the whole door is built from these */
function boxAt(w: number, h: number, d: number, x: number, y: number, z: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

/**
 * Re-cut a merged door part's UVs from its own WORLD x/y, at a fixed number of
 * texture repeats per metre.
 *
 * Without this the door is unusable. A `BoxGeometry` maps 0..1 across every
 * face whatever its size, so a 7 cm moulding bead and a 1.6 m leaf each get
 * one full tile of oak — the beads came out as black-and-tan barcode and the
 * panels as venetian blinds. Cutting the UVs from position instead gives one
 * continuous grain across the whole pair at a constant density, which is also
 * what a door made from one tree looks like.
 *
 * Everything on this door faces the viewer, so a straight planar projection is
 * enough; the returns on the edges take a stretched sliver nobody can see.
 */
function planarUV(g: THREE.BufferGeometry, perMetre: number): THREE.BufferGeometry {
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    // x → v and y → u, which turns the projection a quarter turn. The timber
    // scans are all photographed as horizontal boards, and a door whose boards
    // run across it is a gate; the grain in a stile runs with the stile.
    uv[i * 2] = pos.getY(i) * perMetre;
    uv[i * 2 + 1] = pos.getX(i) * perMetre;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
}

/** the leaf's face depth: everything proud is measured off this */
const LEAF_D = 0.26;
const LEAF_W = 1.62;
const LEAF_H = 5.4;
/** the head of the opening — the fanlight's centre and radius */
const HEAD_R = 1.72;

/**
 * One leaf: frame, three fielded panels, and the mouldings between them.
 *
 * Panel proportions are the classical ones and not three equal thirds — tall
 * below, square-ish in the middle, short at the top. Equal panels read as a
 * cupboard; this reads as a door, and it costs nothing but the numbers.
 */
function doorLeaf(sign: -1 | 1): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = [];
  const x0 = sign * (LEAF_W / 2 + 0.015);
  const yb = 0; // leaf bottom, in leaf-local y
  // the slab itself — the panels are sunk INTO this rather than the frame
  // being built up as separate stiles, which keeps the silhouette one solid
  // piece and halves the triangles
  parts.push(boxAt(LEAF_W, LEAF_H, LEAF_D, x0, yb + LEAF_H / 2, 0));

  const STILE = 0.19;
  /** [bottom, top] of each panel opening, up the leaf */
  const panels: [number, number][] = [
    [0.36, 2.12],
    [2.38, 3.92],
    [4.14, 5.06],
  ];
  const pw = LEAF_W - STILE * 2;
  for (const [p0, p1] of panels) {
    const ph = p1 - p0;
    const pc = (p0 + p1) / 2;
    // the bolection: a moulding standing PROUD of the frame around the panel,
    // mitred at the corners. Four boxes, and the reason the door has a shadow
    // line on it at every hour of the night.
    const bo = 0.055; // how far it stands out
    const bw = 0.075; // how wide the moulding reads
    const zf = -(LEAF_D / 2 + bo / 2);
    parts.push(boxAt(pw + bw * 2, bw, bo, x0, yb + p0 - bw / 2, zf));
    parts.push(boxAt(pw + bw * 2, bw, bo, x0, yb + p1 + bw / 2, zf));
    parts.push(boxAt(bw, ph + bw * 2, bo, x0 - pw / 2 - bw / 2, yb + pc, zf));
    parts.push(boxAt(bw, ph + bw * 2, bo, x0 + pw / 2 + bw / 2, yb + pc, zf));
    // the FIELD: the panel's own face, raised just short of the moulding, with
    // a smaller box on top of it standing in for the chamfer. Two boxes read
    // as a bevelled field at this distance and a real chamfer costs eight.
    parts.push(boxAt(pw, ph, 0.03, x0, yb + pc, -(LEAF_D / 2 + 0.015)));
    parts.push(boxAt(pw - 0.11, ph - 0.11, 0.05, x0, yb + pc, -(LEAF_D / 2 + 0.025)));
  }
  // the meeting astragal, on the closing leaf only — a real pair has one bead
  // covering the joint, not two
  if (sign === 1) {
    parts.push(boxAt(0.07, LEAF_H - 0.1, 0.09, x0 - LEAF_W / 2 - 0.02, yb + LEAF_H / 2, -(LEAF_D / 2 + 0.02)));
  }
  return parts;
}

/** the brass on one leaf: strap hinges, a ring pull on its escutcheon, clavos */
function doorBrass(sign: -1 | 1): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = [];
  const x0 = sign * (LEAF_W / 2 + 0.015);
  const zf = -(LEAF_D / 2 + 0.02);
  // hinge side is the OUTER stile; the straps run inward across the leaf, as
  // they must — a strap hinge carries the leaf's weight back to its pintle
  const hx = x0 + sign * (LEAF_W / 2 - 0.1);
  // set ON the rails, never across a panel: a strap crossing a fielded panel
  // is the one place a real hinge is never put, and it also fought the
  // bolection mouldings for the same 5 cm of relief
  for (const hy of [0.2, 2.24, 5.16]) {
    // the strap: three lengths, each thinner than the last, so it tapers
    const segs: [number, number][] = [
      [0.62, 0.14],
      [0.42, 0.1],
      [0.26, 0.07],
    ];
    let run = 0;
    for (const [len, th] of segs) {
      parts.push(boxAt(len, th, 0.022, hx - sign * (run + len / 2), hy, zf));
      run += len;
    }
    // the pintle barrel it turns on, at the jamb
    const barrel = new THREE.CylinderGeometry(0.055, 0.055, 0.26, 10);
    barrel.translate(hx + sign * 0.06, hy, zf);
    parts.push(barrel);
  }
  // The ring pull, on the meeting stile at the height a hand actually falls.
  // The parts must not overlap: a boss sitting ON its ring, which is how this
  // was first built, reads from across the hall as a face — two of them, one
  // per leaf, staring back down the entrance hall.
  const px = x0 - sign * (LEAF_W / 2 - 0.3);
  const py = 2.2;
  // the escutcheon: a tall plate, with the boss the ring hangs from at its top
  parts.push(boxAt(0.26, 0.5, 0.018, px, py, zf));
  const boss = new THREE.CylinderGeometry(0.055, 0.07, 0.06, 12);
  boss.rotateX(Math.PI / 2);
  boss.translate(px, py + 0.17, zf - 0.035);
  parts.push(boss);
  // and the ring hanging clear BELOW it, as a ring on a pin does
  const ring = new THREE.TorusGeometry(0.15, 0.024, 8, 26);
  ring.translate(px, py - 0.02, zf - 0.04);
  parts.push(ring);
  // a rosette boss in the head of the top panel of each leaf: the one piece of
  // ornament on the leaves, and it lands where the eye goes after the fanlight
  const rz = -(LEAF_D / 2 + 0.075);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const petal = new THREE.SphereGeometry(0.045, 8, 6);
    petal.scale(1, 1, 0.5);
    petal.translate(x0 + Math.cos(a) * 0.1, 4.6 + Math.sin(a) * 0.1, rz);
    parts.push(petal);
  }
  const eye = new THREE.SphereGeometry(0.055, 10, 8);
  eye.scale(1, 1, 0.6);
  eye.translate(x0, 4.6, rz - 0.01);
  parts.push(eye);
  // clavos: hand-forged studs down the rails, the oldest hardware idea there
  // is and the one that most reliably says "this door is heavy"
  for (const cy of [0.28, 2.24, 4.02, 5.14]) {
    for (let i = -2; i <= 2; i++) {
      const stud = new THREE.SphereGeometry(0.036, 8, 6);
      stud.translate(x0 + i * 0.3, cy, zf - 0.01);
      parts.push(stud);
    }
  }
  return parts;
}

/** the entrance hall behind you, with the doors you came in through */
export function EntranceHall() {
  // the vestibule is a hall, so it wears the halls' timber
  const wallMat = useMemo(() => getMaterial('wood_hall_wainscot', { repeat: [2.2, WING_H / 3.4] }), []);
  // The vestibule is the FIRST ceiling a visitor stands under, and it was a
  // flat coffered plane — see HallBarrelVault for why that reads as a lid
  // dropped on a hall rather than as a ceiling. It is a barrel now, on the same
  // section rule as the apse's and the wings', so a visitor who walks the whole
  // axis of the building passes under one continuous idea of a ceiling instead
  // of lid, vault, lid.
  const ceilMat = useMemo(
    () =>
      getMaterial('stone_vault_coffer', {
        repeat: hallCofferRepeat(ENTRY_HALF, ENTRY_Z + 0.4 - HALL_VAULT_Z0),
        overrides: { side: 'double' },
      }),
    [],
  );
  const ribMat = useMemo(
    () => getMaterial('wood_hall_timber', { repeat: [1, 2], overrides: { side: 'double' } }),
    [],
  );
  const ridgeMat = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        overrides: { color: '#b98a3d', metalness: 0.75, roughness: 0.35 },
      }),
    [],
  );
  // The leaves are the hall's own timber, but darker and better polished than
  // the walls behind them — a door is the one piece of joinery in a building
  // that gets waxed. Same definition, different dressing: see the note on the
  // wings' wainscot for why the halls never borrow the rotunda's wood.
  const doorMat = useMemo(
    () =>
      getMaterial('wood_hall_timber', {
        // repeat stays 1: the leaves carry their own world-space UVs (planarUV)
        repeat: [1, 1],
        // Lifted well above the walls' own timber. The entrance hall's only
        // light is the fire at the far end of it, and at the stock tone the
        // leaves went to a black rectangle from six metres — the panels, the
        // clavos and the mouldings were all still there and none of them could
        // be seen. Waxed oak in near-darkness reads lighter than raw oak in a
        // lit room, which is also simply true of a door people polish.
        overrides: { color: '#7a5836', roughness: 0.38, metalness: 0.05 },
      }),
    [],
  );
  // one brass for the whole building — the same burnished definition the niche
  // archivolts and the orrery's pins wear
  const brassMat = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        overrides: { color: '#c09551', roughness: 0.36, metalness: 0.75, emissive: '#2a1e0c' },
      }),
    [],
  );
  // The portal and its threshold are ONE stone, and that is the point. It was
  // built in the building's rubble limestone first, which put a coarse random
  // masonry against a waxed panelled door and a marble step — three unrelated
  // stories at the same doorway. A museum's entrance is DRESSED: the jambs,
  // the voussoirs, the keystone, the inscription tablet and the step you walk
  // over are all the same warm marble, and the timber and brass are then the
  // only other two materials in the composition.
  const stoneMat = useMemo(
    () => getMaterial('stone_marble_white', { repeat: [1, 1], overrides: { color: '#cdbfa4', roughness: 0.5 } }),
    [],
  );
  const sillMat = useMemo(
    () => getMaterial('stone_marble_white', { repeat: [3, 1], overrides: { color: '#cdbfa4', roughness: 0.5 } }),
    [],
  );
  const fanTex = useMemo(() => stainedGlassArch(), []);
  // unlit, like the wings' windows: this is a light source in the composition,
  // not a surface waiting to be lit — and at the end of a dark hall it is what
  // makes the doorway read from the middle of the rotunda
  // DoubleSide, and not by accident: a `CircleGeometry` faces +z, and this one
  // is hung in a doorway you approach from −z — single-sided it was there the
  // whole time, back-face culled, and the head read as an unglazed hole with
  // brass bars across it. It is also a window, so it should be glass from the
  // hall side too.
  const fanMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: fanTex,
        transparent: true,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [fanTex],
  );
  /**
   * The fanlight, and why it needs its own UVs.
   *
   * `stainedGlassArch` paints a whole arched window into a 2:3 canvas and
   * leaves the margins TRANSPARENT. A circle sector's stock UVs map its
   * bounding box to the full 0..1 of that canvas, so the semicircular head
   * sampled the painting's empty corners and the glass simply did not appear —
   * it read as an unglazed hole with brass bars over it.
   *
   * These UVs sample the painted arch's own HEAD instead: the horizontal
   * middle of the canvas, and the band from the springing (v 0.6) to the crown
   * (v 0.94). The leading in the painting then runs the same way the brass
   * bars in front of it do.
   */
  const fanGeom = useMemo(() => {
    const g = new THREE.CircleGeometry(HEAD_R - 0.06, 40, 0, Math.PI);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i);
      uv.setXY(i, 0.07 + 0.86 * u, 0.6 + 0.34 * ((v - 0.5) * 2));
    }
    uv.needsUpdate = true;
    return g;
  }, []);
  useLayoutEffect(() => () => fanGeom.dispose(), [fanGeom]);

  /** both leaves, all their panels and mouldings, in one buffer */
  // 0.55 repeats/m — the wood_hall_timber scan is a ~1.8 m board at that
  // density, so the leaves read as a few wide boards rather than as veneer
  const leavesGeom = useMemo(
    () => planarUV(mergeGeometries([...doorLeaf(-1), ...doorLeaf(1)], false), 0.55),
    [],
  );
  useLayoutEffect(() => () => leavesGeom.dispose(), [leavesGeom]);
  /** every piece of brass on the pair, likewise */
  const brassGeom = useMemo(() => {
    const parts = [...doorBrass(-1), ...doorBrass(1)];
    // and the glazing bars of the fanlight: a radial fan off the springing,
    // with two rings crossing it. Set just in front of the glass so they read
    // as leading rather than as painted lines.
    const bars = 9;
    for (let i = 1; i < bars; i++) {
      const a = (Math.PI * i) / bars;
      const bar = boxAt(0.035, HEAD_R - 0.04, 0.05, 0, 0, 0);
      bar.translate(0, (HEAD_R - 0.04) / 2, 0);
      bar.rotateZ(a - Math.PI / 2);
      bar.translate(0, LEAF_H + 0.06, -0.09);
      parts.push(bar);
    }
    for (const r of [HEAD_R * 0.45, HEAD_R * 0.82]) {
      const ring = new THREE.TorusGeometry(r, 0.028, 6, 40, Math.PI);
      ring.translate(0, LEAF_H + 0.06, -0.09);
      parts.push(ring);
    }
    return planarUV(mergeGeometries(parts, false), 1.4);
  }, []);
  useLayoutEffect(() => () => brassGeom.dispose(), [brassGeom]);
  /** the stone architrave: moulded jambs, a voussoir arch, a keystone */
  const surroundGeom = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    const halfW = LEAF_W + 0.05;
    const JW = 0.42; // jamb width
    const top = LEAF_H + HEAD_R;
    for (const s of [-1, 1]) {
      // the jamb, in two planes so it steps back toward the opening the way a
      // moulded architrave does
      parts.push(boxAt(JW, LEAF_H + 0.5, 0.3, s * (halfW + JW / 2), (LEAF_H + 0.5) / 2, -0.15));
      parts.push(boxAt(JW * 0.55, LEAF_H + 0.5, 0.16, s * (halfW + JW * 0.28), (LEAF_H + 0.5) / 2, -0.32));
    }
    // the arch: real voussoirs, each rotated to its own radius, so the head is
    // cut stone rather than a bent tube. This is what the old torus could not
    // be — a ring has no joints, and joints are the whole reading of an arch.
    const V = 15;
    for (let i = 0; i < V; i++) {
      const a = Math.PI - (Math.PI * (i + 0.5)) / V;
      const r = HEAD_R + JW / 2 + 0.02;
      const v = boxAt(JW + 0.04, (Math.PI * (HEAD_R + JW)) / V + 0.05, 0.3, 0, 0, 0);
      v.rotateZ(a - Math.PI / 2);
      v.translate(Math.cos(a) * r, LEAF_H + Math.sin(a) * r, -0.15);
      parts.push(v);
    }
    // the keystone, standing proud and taller than its neighbours — the one
    // stone the eye goes to
    parts.push(boxAt(0.44, 0.78, 0.4, 0, top + 0.16, -0.2));
    // and the impost the arch springs off, running out either side
    for (const s of [-1, 1]) {
      parts.push(boxAt(JW + 0.5, 0.16, 0.36, s * (halfW + JW / 2), LEAF_H + 0.04, -0.18));
      // a plinth block at the foot of each jamb: an architrave that runs into
      // the floor without one looks like it was cut off there
      parts.push(boxAt(JW + 0.22, 0.5, 0.4, s * (halfW + JW / 2), 0.25, -0.2));
    }
    // THE ENTABLATURE over the arch, and the tablet it carries. A doorway of
    // this size wants somewhere to say what the building is — every museum
    // portal ever built has an inscription over it, and without one this was
    // an arch that simply stopped. The cornice sits on the keystone, the
    // tablet is recessed within a raised frame, and the lettering itself is
    // typeset in the museum's own display face (see the sprites below).
    const CORN_Y = top + 0.62;
    parts.push(boxAt(halfW * 2 + JW * 2 + 1.5, 0.22, 0.52, 0, CORN_Y, -0.24));
    parts.push(boxAt(halfW * 2 + JW * 2 + 1.2, 0.14, 0.4, 0, CORN_Y - 0.18, -0.18));
    // the tablet: a sunk field inside a raised bolection, exactly as the door
    // leaves below are made — the same idea in stone
    parts.push(boxAt(halfW * 2 + JW * 2 + 0.6, 1.5, 0.34, 0, CORN_Y + 0.86, -0.16));
    for (const [w2, h2, y2, d2] of [
      [halfW * 2 + JW * 2 + 0.3, 0.08, CORN_Y + 0.2, 0.42],
      [halfW * 2 + JW * 2 + 0.3, 0.08, CORN_Y + 1.52, 0.42],
    ] as const) {
      parts.push(boxAt(w2, h2, d2, 0, y2, -0.2));
    }
    // the crowning cornice over the tablet
    parts.push(boxAt(halfW * 2 + JW * 2 + 1.7, 0.26, 0.56, 0, CORN_Y + 1.74, -0.26));
    // limestone at 0.9 repeats/m: the block coursing of the scan lands at
    // roughly the size of the voussoirs it is wrapped around
    return planarUV(mergeGeometries(parts, false), 0.9);
  }, []);
  useLayoutEffect(() => () => surroundGeom.dispose(), [surroundGeom]);
  // ceiling and walls both start at the same place — see hallWallStart. The
  // ceiling used to run in to z 16, a metre INSIDE the drum, laying a tongue of
  // plank across the top of the rotunda at the height the dome springs from;
  // pulled back to the drum's outer face instead it left the far corners of the
  // hall unroofed, because the drum curves away there too.
  const wallZ0 = hallWallStart(ENTRY_HALF);
  const wallLen = ENTRY_Z + 0.4 - wallZ0;
  const wallMid = (wallZ0 + ENTRY_Z + 0.4) / 2;
  return (
    <group>
      {/* Two unbroken side walls. They were broken at a pillar niche apiece
          when Boaz & Jachin were sunk into them; the pair stands FREE in this
          hall now (see MasonicPillars), and a vestibule with two blind recesses
          in it would be a hall remembering furniture it no longer has. */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (ENTRY_HALF + 0.35), WING_H / 2, wallMid]} material={wallMat}>
          <boxGeometry args={[0.4, WING_H, wallLen]} />
        </mesh>
      ))}
      {/* The vault runs from the door wall to the drum. Its rotunda end is at
          +HALL_VAULT_Z0 rather than at wallZ0: this hall runs the other way
          from the apse, so the sign flips, but the reason is the same one — cut
          at the drum's mid-thickness the crown stands out over the entrance
          arch, in the room. */}
      <HallBarrelVault
        halfWidth={ENTRY_HALF}
        zA={ENTRY_Z + 0.4}
        zB={HALL_VAULT_Z0}
        ceilMat={ceilMat}
        ribMat={ribMat}
        ridgeMat={ridgeMat}
      />
      {/* door wall */}
      <mesh position={[0, WING_H / 2, ENTRY_Z + 0.35]} material={wallMat}>
        <boxGeometry args={[ENTRY_HALF * 2 + 1.2, WING_H, 0.5]} />
      </mesh>
      {/* ————— the great doors —————
          Everything is built in door-local space (y from the floor, z 0 at the
          face of the leaves) and hung here in ONE group, so the whole pair can
          be moved by changing this position and nothing else. */}
      <group position={[0, 0, ENTRY_Z - 0.02]}>
        <mesh geometry={leavesGeom} material={doorMat} />
        <mesh geometry={brassGeom} material={brassMat} />
        <mesh geometry={surroundGeom} material={stoneMat} />
        {/* the fanlight, set BEHIND the glazing bars and a little behind the
            leaves' face, so the head reads as glass in a wall rather than as a
            lit disc stuck on the front of it */}
        <mesh position={[0, LEAF_H + 0.06, -0.04]} geometry={fanGeom} material={fanMat} />
        {/* ————— the inscription —————
            Cut into the tablet over the arch, in the museum's own display face
            and in Roman capitals with interpuncts, which is how a building of
            this period would letter a lintel: V for U, a raised point between
            words, and no punctuation at the end of a line. Two sizes, because
            an inscription that is all one size is a sign.

            These are unlit planes (TextSprite billboard={false}), so the words
            hold their brightness at the dark end of the hall — the same reason
            the fanlight above them is unlit. */}
        {/* Turned to FACE the visitor. A TextSprite laid flat is a plane whose
            front is +z, and this doorway is read from −z — left as it was, the
            inscription rendered through its own back and the building's name
            came out mirrored over the arch. The group turns both lines at
            once; their local +z is the hall's −z. */}
        <group rotation-y={Math.PI}>
        <TextSprite
          position={[0, LEAF_H + HEAD_R + 1.62, 0.36]}
          height={0.62}
          color="#e6c98a"
          weight={600}
          billboard={false}
          outline={false}
        >
          ASTERION
        </TextSprite>
        <TextSprite
          position={[0, LEAF_H + HEAD_R + 1.04, 0.36]}
          height={0.2}
          color="#c3ab7d"
          weight={500}
          billboard={false}
          outline={false}
          /* one line, always: the default 900px wrap broke ARCANARVM onto a
             second line and a two-line subtitle under a one-line name reads
             as a paragraph, not as an inscription */
          maxWidthPx={2000}
        >
          BIBLIOTHECA · ARTIVM · ARCANARVM
        </TextSprite>
        </group>
        {/* the threshold: one marble step, worn hollow by everyone who has
            come in. It is also what stops the leaves from meeting the boards
            in a flat line, which is the tell of a door that was never made. */}
        <mesh position={[0, 0.06, -0.24]} material={sillMat}>
          <boxGeometry args={[LEAF_W * 2 + 1.1, 0.12, 0.66]} />
        </mesh>
      </group>
    </group>
  );
}

/* (PillarPorch is GONE — the arched recess that used to be carved out of each
 * apse wall behind a pillar: a damask barrel, a gold-mosaic conch, a voussoir
 * archivolt, imposts, a brass fillet and a marble step, all struck on
 * PILLAR_BAY_R / PILLAR_BAY_SPRING, which are gone from layout.ts with it.
 *
 * It was well made and it was the wrong idea. A niche is a FRAME, and a frame
 * is what you give something that faces you — a statue has a front, and the
 * recess behind Isis is doing real work holding her against a dark ground. A
 * column has no front. It is a round thing, and the whole of it is the point;
 * wrapping it in an arch put architecture in front of architecture and left the
 * pair readable only from straight on. They stand free against a flat wall now
 * and you can walk all the way round them.
 *
 * The step survived, as a full circle rather than a half-disc, and moved into
 * `Pillar` in statues.tsx where it belongs — it is part of the monument, not
 * part of a wall. */

/**
 * The apse that leads to the Research Hall, and the hall Boaz & Jachin stand in.
 *
 * Two straight walls and a coffered ceiling — nothing else. They were broken at
 * a carved recess apiece while the pillars were sunk into them; the pillars
 * stand free in front of the wall now (see the note where PillarPorch used to
 * be), so the wall has no reason to do anything but run.
 */
/* ————— the apse's own barrel vault —————
 *
 * The apse was ceiled by a FLAT coffered plane at WING_H while all eight wings
 * run under a barrel. Standing in the mouth you could see both at once, and the
 * flat one read as a lid dropped on the hall: no springline, no crown, and — the
 * thing that actually gave it away — no falloff, because a flat soffit takes the
 * light at one angle across its whole width where a curve grades from springing
 * to crown.
 *
 * The section is struck on the wings' own proportion rather than copied from
 * their numbers: VAULT_SAG/VAULT_W there is a rise of 2.6 on a half-span of
 * ~3.95, and the apse's half-span is its own. Same rule, same-looking curve, a
 * narrower hall. The three constants below are the identical formulae to
 * VAULT_R / VAULT_HALF / VAULT_CY.
 */
/**
 * The section of a straight hall's barrel vault, struck on the WINGS' own
 * proportion rather than copied from their numbers: a rise of 2.6 on a
 * half-span of ~3.95. Same rule, same-looking curve, whatever the hall's width.
 * The returned r / half / cy are the identical formulae to VAULT_R /
 * VAULT_HALF / VAULT_CY.
 *
 * `halfWidth` is the hall's nominal half-width (APSE_HALF, ENTRY_HALF). The
 * span is taken out to the OUTER face of the side walls, not the inner, and
 * that is not a detail: the room a vault has to cap is wider than the walls are
 * apart, so a barrel cut to the inner face leaves a strip of end wall standing
 * above its springing on each side with the void over the vault open behind it.
 * It reads as a rectangular duct lowered into the hall, with the real ceiling
 * visible past its edges. Springing INSIDE the wall thickness is what makes a
 * vault look carried by the walls rather than hung between them.
 */
function hallVaultSection(halfWidth: number) {
  const w = halfWidth + 0.6;
  const sag = w * (2.6 / VAULT_W);
  const r = sag / 2 + (w * w) / (2 * sag);
  return { w, r, half: Math.asin(w / r), cy: WING_H - 0.1 - r };
}

/**
 * Where a hall's barrel has to be cut at the ROTUNDA end. Signed: multiply by
 * the direction the hall runs.
 *
 * This is the number the apse got wrong twice, and both times the whole vault
 * read as an object hanging in the rotunda rather than as the ceiling of a
 * hall, which is the only thing anyone actually sees.
 *
 * The arithmetic, once, so it is not guessed at again. `hallWallStart` returns
 * the MID-thickness of the drum wall measured at the hall's width — 16.97 for a
 * 3 m half-width — but the drum is ROUND, so its inner face is further away on
 * the axis than it is at the hall's edges: 17.15 at the crown against 16.85 at
 * the springing. A tube cut square at 16.97 therefore has its crown standing
 * 0.18 m INSIDE the rotunda while its edges are still 0.12 m short of the
 * masonry, and lengthening it only pushes more of it into the room.
 *
 * Cut at the drum's inner radius and the crown is exactly flush with the wall
 * it dies into, while the edges — past the inner face by then — are buried in
 * the 0.4 m of masonry. Above each hall mouth's header the drum is solid all
 * the way to the ceiling, so there is nothing there for them to poke through.
 */
const HALL_VAULT_Z0 = DRUM_R_IN;

/**
 * The barrel over a straight hall — the apse's and the vestibule's, which are
 * the same object at two widths and were flat coffered planes until 2026-08-05.
 * The wings ran under a vault and these two ran under lids, and standing in
 * either mouth you saw both at once: no springline, no crown, and — the thing
 * that actually gives a flat soffit away — no falloff, because it takes the
 * light at one angle across its whole width where a curve grades from
 * springing to crown.
 *
 * A stock cylinder does here what a hand-built buffer has to do in the wings:
 * these halls are straight boxes between two flat walls, so there is no round
 * drum face for the near rim to ride and nothing to solve.
 *
 * `zA` is the hall's far end, `zB` its rotunda end (already cut at
 * ±HALL_VAULT_Z0 by the caller). Order does not matter.
 *
 * ————— the three things this MUST keep doing —————
 *
 * · rotation-x is −π/2, which swings the arc from +z to +y, ABOVE the axis, so
 *   the crown lands at cy + r. +π/2 hangs it BELOW the axis instead and the
 *   crown drops by 2r — in the apse that was 7.8 m, putting the ceiling at 9 m,
 *   level with the top of a picture on the end wall. It read as a black duct
 *   hanging in the middle of the room. Length, width and burial were all chased
 *   first and none of them was it. Check the sign before touching anything.
 * · the flat plane at WING_H stays, as a LID over the extrados. A barrel hung
 *   inside a box open at the top leaves a void that reads as a hole punched
 *   through the building, and the void is what the eye finds first.
 * · the four LONGITUDINAL ribs are not trim. A surface hooped in one direction
 *   only has no grain; the crossings are what make it read as a coffered vault
 *   rather than as a pipe, and they are why the wings' ceiling looks like a
 *   ceiling.
 */
function HallBarrelVault({
  halfWidth,
  zA,
  zB,
  ceilMat,
  ribMat,
  ridgeMat,
}: {
  halfWidth: number;
  zA: number;
  zB: number;
  ceilMat: THREE.Material;
  ribMat: THREE.Material;
  ridgeMat: THREE.Material;
}) {
  const { r, half, cy } = hallVaultSection(halfWidth);
  const len = Math.abs(zB - zA);
  const mid = (zA + zB) / 2;
  /** the transverse hoops, on the wings' own rib pitch so the halls' bays are
   *  all the same size */
  const ribZs = useMemo(() => {
    const n = Math.max(2, Math.round(len / RIB_PITCH) + 1);
    const z0 = Math.min(zA, zB);
    return Array.from({ length: n }, (_, i) => z0 + ((i + 0.5) * len) / n);
  }, [len, zA, zB]);

  return (
    <group>
      <mesh position={[0, WING_H, mid]} rotation-x={Math.PI / 2} material={ceilMat}>
        <planeGeometry args={[halfWidth * 2 + 1.2, len]} />
      </mesh>

      <group position={[0, cy, mid]} rotation-x={-Math.PI / 2}>
        <mesh material={ceilMat}>
          <cylinderGeometry args={[r, r, len, 48, 1, true, -half, half * 2]} />
        </mesh>
      </group>

      {ribZs.map((z) => (
        <group key={z} position={[0, cy, z]} rotation-x={-Math.PI / 2}>
          <mesh material={ribMat}>
            <cylinderGeometry args={[r - 0.06, r - 0.06, 0.34, 48, 1, true, -half, half * 2]} />
          </mesh>
        </group>
      ))}

      {/* the longitudinal ribs, at the same sixths of the arc the coffer grid is
          cut on, so rib and joint coincide instead of arguing */}
      {[-2, -1, 1, 2].map((k) => {
        const psi = (k / 3) * half;
        return (
          <mesh
            key={k}
            position={[r * Math.sin(psi), cy + r * Math.cos(psi) - 0.06, mid]}
            rotation-z={psi}
            material={ribMat}
          >
            <boxGeometry args={[0.16, 0.2, len]} />
          </mesh>
        );
      })}

      {/* the brass ridge along the crown, as in every wing */}
      <mesh position={[0, cy + r - 0.16, mid]} material={ridgeMat}>
        <boxGeometry args={[0.24, 0.1, len]} />
      </mesh>
    </group>
  );
}

/** the coffer grid for a hall vault: ~1.6 m panels, the size the wings' grid
 *  works out at, computed from the vault's own arc and length */
function hallCofferRepeat(halfWidth: number, len: number): [number, number] {
  const { r, half } = hallVaultSection(halfWidth);
  return [Math.round((r * 2 * half) / 1.6), Math.max(2, Math.round(len / 1.6))];
}


export function ResearchApse() {
  const wallMat = useMemo(() => getMaterial('wood_hall_wainscot', { repeat: [1.8, WING_H / 3.4] }), []);
  /** as in the entrance hall, and for the same reason — see hallWallStart */
  const wallZ0 = -hallWallStart(APSE_HALF);
  const wallZ1 = APSE_Z - 0.4;
  const wallLen = Math.abs(wallZ1 - wallZ0);
  const wallMid = (wallZ0 + wallZ1) / 2;

  /** the soffit, on the same stone as the wings' vault so every hall in the
   *  building is ceiled in one material */
  const ceilMat = useMemo(
    () =>
      getMaterial('stone_vault_coffer', {
        repeat: hallCofferRepeat(APSE_HALF, wallLen),
        overrides: { side: 'double' },
      }),
    [wallLen],
  );
  const ribMat = useMemo(
    () => getMaterial('wood_hall_timber', { repeat: [1, 2], overrides: { side: 'double' } }),
    [],
  );
  const ridgeMat = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        overrides: { color: '#b98a3d', metalness: 0.75, roughness: 0.35 },
      }),
    [],
  );

  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (APSE_HALF + 0.35), WING_H / 2, wallMid]} material={wallMat}>
          <boxGeometry args={[0.4, WING_H, wallLen]} />
        </mesh>
      ))}
      <HallBarrelVault
        halfWidth={APSE_HALF}
        zA={wallZ1}
        zB={-HALL_VAULT_Z0}
        ceilMat={ceilMat}
        ribMat={ribMat}
        ridgeMat={ridgeMat}
      />
    </group>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * RECONSTRUCTED 2026-08-05 from the 2026-08-01 production build.
 *
 * A bad edit deleted this block outright (it sat between two anchors a splice
 * was aiming at) and the project has no VCS, so it was recovered by decoding
 * `dist/assets/GrandLibrary-*.js`. Every number, filename, caption string and
 * material value below is byte-faithful to that build. What could NOT be
 * recovered is the original prose: the minifier drops comments, so the notes
 * that used to explain WHY these choices were made are gone for good. Nothing
 * here is invented to fill the gap — where a value's reason is not derivable
 * from surviving code, it is simply stated without one.
 * ─────────────────────────────────────────────────────────────────────────── */

/** the gallery in every wing: real public-domain art, framed at eye level in
 *  the gap the shelves leave open. One wall carries the tradition's figure,
 *  the facing wall an emblem plate. Order matches WING_ANGLES. */
const WING_CLUSTERS = [
  'hermetica',
  'alchemy',
  'kabbalah',
  'renaissance',
  'early-modern',
  'freemasonry',
  'occult-revival',
  'scholarship',
] as const;

const FIGURE_CAPTIONS: Record<string, string> = {
  hermetica: 'Hermes Trismegistus',
  alchemy: 'Paracelsus · 1493–1541',
  kabbalah: 'The Tree of Life',
  renaissance: 'Marsilio Ficino · 1433–1499',
  'early-modern': 'Jacob Böhme · 1575–1624',
  freemasonry: 'Elias Ashmole · 1617–1692',
  'occult-revival': 'Éliphas Lévi · 1810–1875',
  scholarship: 'Robert Fludd · 1574–1637',
};

const EMBLEM_CAPTIONS: Record<string, string> = {
  hermetica: 'Tabula Smaragdina — the Emerald Tablet',
  alchemy: 'The Chymical Wedding',
  kabbalah: 'Portae Lucis — the Gates of Light',
  renaissance: 'The Pentagram & the Human Body — Agrippa',
  'early-modern': 'Böhme’s Philosophical Globe',
  freemasonry: 'First Degree Tracing Board',
  'occult-revival': 'Baphomet — Éliphas Lévi',
  scholarship: 'Integræ Naturæ — Robert Fludd',
};

/**
 * The two gallery stations, in wing-axis metres.
 *
 * Both are load-bearing well beyond this file, which is how they survived the
 * deletion intact: RIB_US pins vault ribs at exactly 27 and 40.95 so each
 * painting gets a bay of its own, `WingFurnishings` seats its benches at
 * GALLERY_U and its display cases symmetrically about GALLERY2_U, `perches.ts`
 * roosts birds on the frames, and `cosmographia.tsx` breaks the wing floor's
 * way for a roundel at each.
 */
export const GALLERY_U = 27;
export const GALLERY2_U = 40.95;

/** the second gallery's pair of plates per wing: [left wall, right wall] */
const ART2_CAPTIONS: Record<string, [string, string]> = {
  hermetica: ['Monas Hieroglyphica — John Dee', 'The Ouroboros of Cleopatra'],
  alchemy: ['The Ripley Scroll · 1624', 'The Philosopher’s Stone'],
  kabbalah: ['Kircher’s Tree of the Sephiroth', 'Shefa Tal — the Priestly Hands'],
  renaissance: ['De Occulta Philosophia — Agrippa', 'Hypnerotomachia Poliphili'],
  'early-modern': ['The Temple of the Rosy Cross', 'Fama Fraternitatis · 1614'],
  freemasonry: ['Anderson’s Constitutions · 1723', 'Third Degree Tracing Board'],
  'occult-revival': ['The Magician — Rider–Waite · 1909', 'The Rose Cross Lamen'],
  scholarship: ['Harmonia Macrocosmica — Cellarius', 'Musurgia Universalis — Kircher'],
};

/**
 * One framed engraving: a gilt box, a mat, the print, a picture lamp over it
 * and a soft additive wash standing in for the light the lamp does not cast.
 *
 * The depth ladder is the load-bearing part — frame face 0.10, mat 0.225,
 * print 0.24. The gilt frame is a SOLID box, so its front face occludes
 * anything level with or behind it; the mat and the print have to sit proud of
 * it or every painting in the building renders as a blank gold panel.
 */
export function FramedArt({ tex, w, h }: { tex: THREE.Texture; w: number; h: number }) {
  return (
    <group>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[w + 0.34, h + 0.34, 0.2]} />
        <meshStandardMaterial color="#8a6a2f" metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.225]}>
        <planeGeometry args={[w + 0.14, h + 0.14]} />
        <meshBasicMaterial color="#b9ad93" />
      </mesh>
      {/* knocked back with a tint rather than shown at full value — these are
          bright scans hanging in a dim hall */}
      <mesh position={[0, 0, 0.24]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} color="#c8b99c" />
      </mesh>
      {/* the picture lamp, and its glow — a sprite, not a light */}
      <mesh position={[0, h / 2 + 0.34, 0.5]} rotation-x={0.6}>
        <boxGeometry args={[w * 0.6, 0.08, 0.16]} />
        <meshStandardMaterial color="#b98a3d" metalness={0.7} roughness={0.35} />
      </mesh>
      <sprite position={[0, h / 2 - 0.1, 0.55]} scale={[w * 1.1, h * 0.7, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color="#ffe2b0"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/**
 * Four framed plates per wing — thirty-two in all.
 *
 * At GALLERY_U the tradition's figure faces its emblem across the aisle; at
 * GALLERY2_U a second pair does the same. Each hangs on its own wall, 0.69 m
 * in from the corridor's side-wall plane, and is turned to face across the
 * hall: `-a` for the −1 wall, `π − a` for the +1 wall.
 */
export function WingGallery() {
  const figures = useMemo(() => WING_CLUSTERS.map((c) => getImageTexture(`/art/fig-${c}.jpg`)), []);
  const emblems = useMemo(() => WING_CLUSTERS.map((c) => getImageTexture(`/art/emblem-${c}.jpg`)), []);
  const art2L = useMemo(() => WING_CLUSTERS.map((c) => getImageTexture(`/art/art2L-${c}.jpg`)), []);
  const art2R = useMemo(() => WING_CLUSTERS.map((c) => getImageTexture(`/art/art2R-${c}.jpg`)), []);
  const off = WING_WALL_HALF - 0.69;
  const Y = 4.2;
  const W = 2.5;
  const H = 3.3;
  return (
    <group>
      {WING_ANGLES.map((a, i) => {
        const cluster = WING_CLUSTERS[i];
        const [fx, fz] = wingPoint(a, GALLERY_U, -off);
        const [ex, ez] = wingPoint(a, GALLERY_U, off);
        const [lx, lz] = wingPoint(a, GALLERY2_U, -off);
        const [rx, rz] = wingPoint(a, GALLERY2_U, off);
        const art2 = ART2_CAPTIONS[cluster];
        return (
          <group key={a}>
            <group position={[fx, Y, fz]} rotation-y={-a}>
              <FramedArt tex={figures[i]} w={W} h={H} />
              <TextSprite position={[0, -2, 0.24]} height={0.24} color="#e9dcc0" maxWidthPx={900}>
                {FIGURE_CAPTIONS[cluster]}
              </TextSprite>
            </group>
            <group position={[ex, Y, ez]} rotation-y={Math.PI - a}>
              <FramedArt tex={emblems[i]} w={W} h={H} />
              <TextSprite position={[0, -2, 0.24]} height={0.2} color="#e9dcc0" maxWidthPx={1000}>
                {EMBLEM_CAPTIONS[cluster]}
              </TextSprite>
            </group>
            <group position={[lx, Y, lz]} rotation-y={-a}>
              <FramedArt tex={art2L[i]} w={W} h={H} />
              <TextSprite position={[0, -2, 0.24]} height={0.2} color="#e9dcc0" maxWidthPx={1000}>
                {art2[0]}
              </TextSprite>
            </group>
            <group position={[rx, Y, rz]} rotation-y={Math.PI - a}>
              <FramedArt tex={art2R[i]} w={W} h={H} />
              <TextSprite position={[0, -2, 0.24]} height={0.2} color="#e9dcc0" maxWidthPx={1000}>
                {art2[1]}
              </TextSprite>
            </group>
          </group>
        );
      })}
    </group>
  );
}

/* The vestibule's framed plates are GONE (they hung on the entrance hall's two
 * side walls, one a side, at ±(ENTRY_HALF + 0.15)).
 *
 * Those walls belong to Boaz & Jachin, who stand free in front of them, and a
 * picture on the same wall is a second thing asking for the same glance — the
 * plates had already been cut from four to two and pushed down to the rotunda
 * end to get out of the pillars' way, which is the tell that they were never on
 * a wall of their own. The building has plenty of picture wall: the wings' two
 * galleries hang twenty-four engravings between them (see WingGallery), and
 * that is where a plate gets looked at.
 *
 * What the walls carry instead is the sconces (entranceDressing.tsx) — a row of
 * lights receding, which is the one thing a corridor's own walls should do. */

/** A carved oak reading bench set against the wall. */
function Bench({ woodMat }: { woodMat: THREE.Material }) {
  return (
    <group>
      <mesh position={[0, 0.42, 0]} material={woodMat}>
        <boxGeometry args={[1.9, 0.14, 0.55]} />
      </mesh>
      <mesh position={[0, 0.78, -0.2]} material={woodMat}>
        <boxGeometry args={[1.9, 0.62, 0.12]} />
      </mesh>
      {[-0.82, 0.82].map((x) => (
        <mesh key={x} position={[x, 0.19, 0]} material={woodMat}>
          <boxGeometry args={[0.16, 0.42, 0.5]} />
        </mesh>
      ))}
    </group>
  );
}

/** A lit glass display case on a plinth, a glowing artifact suspended within. */
function DisplayCase({ woodMat, glassMat, seed }: { woodMat: THREE.Material; glassMat: THREE.Material; seed: number }) {
  const spin = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.4;
  });
  const hue = ['#ffd27a', '#b9e0ff', '#d4b9ff', '#a8f0c8'][seed % 4];
  return (
    <group>
      {/* plinth */}
      <mesh position={[0, 0.5, 0]} material={woodMat}>
        <boxGeometry args={[0.9, 1.0, 0.9]} />
      </mesh>
      <mesh position={[0, 1.02, 0]} material={woodMat}>
        <boxGeometry args={[1.02, 0.08, 1.02]} />
      </mesh>
      {/* glass vitrine */}
      <mesh position={[0, 1.7, 0]} material={glassMat}>
        <boxGeometry args={[0.8, 1.25, 0.8]} />
      </mesh>
      {/* brass cap */}
      <mesh position={[0, 2.36, 0]} material={woodMat}>
        <boxGeometry args={[0.92, 0.1, 0.92]} />
      </mesh>
      {/* the floating artifact */}
      <mesh ref={spin} position={[0, 1.7, 0]}>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color={hue} emissive={hue} emissiveIntensity={0.9} metalness={0.4} roughness={0.2} />
      </mesh>
      <sprite position={[0, 1.7, 0]} scale={[0.9, 0.9, 1]}>
        <spriteMaterial map={getGlowTexture()} color={hue} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

/**
 * The stone order of the halls now lives in `wingArcade.tsx`, because it is
 * STRUCTURE, not furnishing: the shafts and corbels there exist to receive the
 * vault's ribs. What used to be here was a colonnade of free-standing marble
 * columns that carried nothing and stopped in the air a metre short of the
 * vault — see that file's header.
 */
/** Dressing for the long topic wings: reading benches beneath the art, and lit
 *  display cases deep in each hall (the stone order is WingArcade).
 *  Everything hugs the walls (inside the non-walkable margin) so the broad
 *  central aisle stays clear. */
export function WingFurnishings() {
  const oak = useMemo(() => getMaterial('wood_gallery_timber', { repeat: [1, 1] }), []);
  const brass = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        overrides: { color: '#b98a3d', metalness: 0.7, roughness: 0.4 },
      }),
    [],
  );
  // the display cases' vitrines — barely-there glass, so the lit contents read
  // rather than the pane
  const glass = useMemo(
    () =>
      getMaterial('glass_crown_old', {
        overrides: {
          color: '#cfe4f2',
          transparent: true,
          opacity: 0.16,
          roughness: 0.05,
          metalness: 0.1,
          transmission: 0,
        },
      }),
    [],
  );
  useLayoutEffect(
    () => () => {
      /* all four belong to the registry — nothing local left to dispose */
    },
    [],
  );

  const N = WING_WALL_HALF - 1.25; // hug the walls, clear of the central aisle
  return (
    <group>
      {WING_ANGLES.map((a) => {
        const items: ReactNode[] = [];
        // reading benches directly beneath the first gallery's art
        for (const wall of [-1, 1]) {
          const [x, z] = wingPoint(a, GALLERY_U, wall * N);
          items.push(
            <group key={`b${wall}`} position={[x, 0, z]} rotation-y={wall < 0 ? -a : Math.PI - a}>
              <Bench woodMat={oak} />
            </group>,
          );
        }
        // lit display cases just inside the deep gallery's pillars,
        // symmetric about GALLERY2_U (40.95)
        let ci = 0;
        for (const u of [39.75, 42.15]) {
          for (const wall of [-1, 1]) {
            const [x, z] = wingPoint(a, u, wall * N);
            items.push(
              <group key={`c${u}${wall}`} position={[x, 0, z]} rotation-y={wall < 0 ? -a : Math.PI - a}>
                <DisplayCase woodMat={brass} glassMat={glass} seed={ci++} />
              </group>,
            );
          }
        }
        return <group key={a}>{items}</group>;
      })}
    </group>
  );
}

