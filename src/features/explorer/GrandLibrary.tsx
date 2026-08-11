import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as THREE from 'three';
import { leanPath } from './three/textureBudget';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { configureMaterials, getMaterial, primeMaterials } from '../../materials';
import { TextSprite } from './three/TextSprite';
import { ManualPicker, registerPickable, unregisterPickable } from './three/ManualPicker';
import { DomeSky } from './three/DomeSky';
import { candleWash, getGlowTexture } from './three/glowTexture';
import { getSigilTexture } from './three/sigils';
import { bakeGrimoire } from './three/grimoirePages';
import { ensurePlates, preloadGrimoireArt } from './three/grimoireArt';
import { EntranceHall, ResearchApse, Rotunda, WING_WALL_HALF, WingEnclosures, WingFurnishings, WingGallery } from './three/structure';
import { EntranceDressing } from './three/entranceDressing';
import { gloriaTexture } from './three/gloriaArt';
import { WingArcade } from './three/wingArcade';
import { GALLERY_RAIL_R, GALLERY_RAIL_Y, RotundaGallery } from './three/rotundaGallery';
import { DrumUpperOrder } from './three/drumUpper';
import { StudyProps } from './three/studyProps';
import { WingSigns } from './three/wingSigns';
import { NicheBeams, NicheKeyLights } from './three/nicheLight';
import { DomeMachine } from './three/domeMachine';
import {
  Chandeliers,
  type ChandelierSpot,
  FloorBookPiles,
  Greenery,
  Ladders,
  ReadingTables,
  TABLE_SPECS,
} from './three/furniture';
import { Chickadees, Owl } from './three/creatures';
import {
  RotundaStatuary,
  MasonicPillars,
  LeontocephalineEast,
  ApseStatuary,
  NichePedestals,
  PILLAR_STANCE,
} from './three/statues';
import { Orrery, ORRERY_REACH, type OrreryMode } from './three/Orrery';
import { PLATES } from './three/PlateConsole';
import { PLATE_LORE, plateStation } from '../../data/plateLore';
import { PLANET_LORE } from '../../data/planetLore';
import { STATUE_LORE } from '../../data/statueLore';
import { PILLAR_LORE } from '../../data/pillarLore';
import { WING_LORE } from '../../data/wingLore';
import { WingChronology, clusterSpan } from './three/WingChronology';
import { TarotSpread } from './three/TarotTable';
import { dealSpread, SPREAD_POSITIONS, type TarotCard } from '../../data/tarot';
import { FlyingBooks } from './three/FlyingBooks';
import { ChandelierMoths, ShootingStars, StormWindows } from './three/ambientLife';
import { WingRadiance, HearthGlow } from './three/atmosphere';
import { LibraryLighting } from './three/lighting';
import { SceneWarmup } from './three/sceneWarmup';
import { PropCulling } from './three/propCulling';
import { StaticMerge } from './three/staticMerge';
import { MaterialDedup } from './three/materialDedup';
import { TextureDedup } from './three/textureDedup';
import { LightPool } from './three/lightPool';
import { composerHandle, resizeComposer } from './three/composerHandle';
import { ZodiacDome } from './three/ZodiacDome';
import { AstrologyWheel } from './three/AstrologyTable';
import { ZODIAC } from '../../data/astrology';
import { AlchemyBench } from './three/AlchemyTable';
import { METALS } from '../../data/alchemy';
import { KabbalahTablet } from './three/KabbalahTree';
import { SEPHIROT } from '../../data/kabbalah';
import { Librarian } from './three/characters';
import {
  SPINE_DESIGNS,
  SPINE_GILT_COLUMN,
  leather,
  onSpineScansReady,
  spineSheet,
  tiled,
  woodBeam,
} from './three/textures';
import { Cosmographia } from './three/cosmographia';
import {
  APSE_HALF,
  APSE_Z,
  BAYS,
  BAY_W,
  CASE_DEPTH,
  ENTRY_HALF,
  ENTRY_Z,
  SPAWN_Z,
  ROT_DOME_TOP,
  ROT_R,
  ROW_Y,
  SHELF_ROWS,
  SHELF_Y0,
  SHELF_PITCH,
  WING_ANGLES,
  WING_H,
  WING_U0,
  WING_U1,
  wingAxis,
  wingPoint,
  toWing,
} from './three/layout';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { useViewport } from '../../lib/useViewport';
import { useUi } from '../../app/store';
import { useProgress, type StationId } from '../../app/progress';
import { ambient } from '../audio/ambient';
import { mulberry32 } from '../../domain/random';
import { entities, entityMap, graphLayout, sourceMap } from '../../data';
import { EXTERNAL_LINKS } from '../../data/externalLinks';
import { archiveTextFor, archiveDetailsUrl } from '../../data/archiveTexts';
import { CLUSTER_META, type ClusterId, type Entity } from '../../domain/types';
import { formatYear } from '../../domain/timeline';

/* ————————————————————————————————————————————————
   The universal library: a domed rotunda with eight wings of stacks —
   one per tradition — every one a lamplit walk from the centre.
   ———————————————————————————————————————————————— */
const CLUSTERS = Object.keys(CLUSTER_META) as ClusterId[];

interface Section {
  cluster: ClusterId;
  angle: number;
  uCenter: number;
}
// one wing per tradition — eight wings, eight signs
const SECTIONS: Section[] = CLUSTERS.map((cluster, i) => ({
  cluster,
  angle: WING_ANGLES[i],
  uCenter: 23,
}));

/** the shelf cases' centre plane: CASE_DEPTH in front of the corridor wall, the
 *  same stand-off they had before the halls tightened to the doorway width. The
 *  bay plan itself (BAYS, the row pitch, the case top) lives in three/layout.ts,
 *  so the birds that land on this furniture read the same numbers the shelf
 *  builder does. */
const CASE_N = WING_WALL_HALF - CASE_DEPTH;

/** Valid grimoire stations: SIX per bay, spread proportionally across the bay's
 *  own width so a wide bay uses its whole face and a narrow one stays inside its
 *  end posts (outer slot at 0.83·half-width + a half spine still clears the
 *  post). Six per bay × eight bays × two walls × two rows = 192 places, up from
 *  the old three-per-bay/96: a wing carries far more readable books now, and at
 *  three per bay the extra grimoires were being dealt onto slots already taken,
 *  which stood two spines in the same spot. See the placement note in GRIMOIRES
 *  and the uniqueness test in the data-integrity suite. */
const SLOT_FRACTIONS = [-0.83, -0.5, -0.17, 0.17, 0.5, 0.83];
const SLOT_US = BAYS.flatMap((b) => SLOT_FRACTIONS.map((f) => b.u + f * (b.w / 2)));

/** Every wall carries every bay now. Four walls used to drop their innermost
 *  bay — the "pocket walls" jammed behind the old hearth and clock — but both
 *  features are long gone (Melchizedek and the Leontocephaline hold those piers, on the
 *  ROTUNDA side of the drum), and with the corridors run straight there is no
 *  dead-end pocket left to open up. Shelves start at the first bay on every
 *  side, which is also what the eye expects walking in. */
const baysFor = (_angle: number, _wall: number) => BAYS;
const slotsFor = (_angle: number, _wall: number) => SLOT_US;

interface Grimoire {
  entity: Entity;
  pos: THREE.Vector3;
  angle: number;
  wall: 1 | -1;
  u: number;
  rotY: number;
}

interface GrimoireSlotKey {
  angle: number;
  wall: 1 | -1;
  row: number;
}
const slotKey = (k: GrimoireSlotKey) => `${k.angle.toFixed(4)}|${k.wall}|${k.row}`;

const GRIMOIRES: Grimoire[] = (() => {
  const out: Grimoire[] = [];
  for (const section of SECTIONS) {
    // chronological, nearest-rotunda-first — so the shelf beside any point on
    // the wing's own brass floor timeline is genuinely from that period. (This
    // is the order WITHIN each binding; the two are merged below.)
    // Undated entities (none in the current collection) fall back to degree
    // centrality rather than being sorted arbitrarily.
    const members = entities
      .filter((e) => e.cluster === section.cluster)
      .sort((a, b) => {
        if (a.year !== undefined && b.year !== undefined) return a.year - b.year;
        if (a.year !== undefined) return -1;
        if (b.year !== undefined) return 1;
        return (graphLayout.degree.get(b.id) ?? 0) - (graphLayout.degree.get(a.id) ?? 0);
      });
    /**
     * SPREAD THE CLUSTER DOWN THE WHOLE CORRIDOR, not just the near end.
     *
     * Four books share a station (two walls × two rows), and this used to take
     * them in order — station 0, then 1, then 2 — so a wing of fifty entities
     * filled thirteen of its twenty-four stations and STOPPED. Everything past
     * the fifth bay was inert filler: a visitor who walked to the end of a hall
     * found the shelves there carried nothing they could open, which reads as
     * the museum thinning out rather than as a library.
     *
     * Striding the groups across the full run instead puts readable books in
     * every bay, out to the last one. It also sharpens what the ordering was
     * already for: the members are sorted chronologically and the wing floor is
     * struck as a timeline, so stretching the books over the same length the
     * timeline uses means the book beside you genuinely belongs to the date
     * under your feet.
     */
    /**
     * INTERLEAVE THE TWO BINDINGS, or a hall segregates itself by date.
     *
     * The shelves carry two readable kinds and they mean different things: a
     * crimson spine has a scan of the original on the Internet Archive, a
     * violet one opens a Wikipedia article. Sorting the whole cluster by year
     * sorted them by kind as a side effect: the people and ideas a tradition
     * starts from are ancient, and the printed books old enough to be out of
     * copyright and scanned are mostly 16th–19th century, so every wing put its
     * violets in the first bays and its crimsons in the last. Walk the near end
     * and nothing can be read in the original; walk the far end and there is no
     * context for any of it.
     *
     * Split on the SCAN, exactly as the bindings do — see the note on the two
     * materials. Striding on "is it a work" instead would spread a set that no
     * longer corresponds to a colour, and the crimsons, being far the rarer of
     * the two now, are the ones that need the spreading.
     *
     * So the two kinds are strided down the corridor SEPARATELY and merged by
     * how far each is through its own run. Each kind still reads in date order
     * from the rotunda outward — the wing's brass timeline still means
     * something within a binding — but both reach the last bay, and any bay a
     * visitor stops at offers a text and something to place it with.
     */
    const rank = new Map<string, number>();
    for (const kind of [true, false]) {
      const of = members.filter((e) => !!archiveTextFor(e) === kind);
      of.forEach((e, i) => rank.set(e.id, of.length > 1 ? i / (of.length - 1) : 0.5));
    }
    members.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));

    const stations = slotsFor(section.angle, -1).length;
    const groups = Math.ceil(members.length / 4);
    members.forEach((entity, i) => {
      const g = Math.floor(i / 4);
      /**
       * Which of the station's four places this book takes — left or right
       * wall, lower or upper row — ROTATED one place per group.
       *
       * Four books share a station and the four places used to be handed out
       * by index parity: even i went left, odd i went right. That is a
       * two-beat pattern, and the merged order above is a repeating beat of its
       * own (violet spines outnumber crimson several times over, so the merge
       * lays down a steady violet-violet-…-crimson rhythm), so the two locked
       * together and a whole hall ended up with its crimsons down one wall and
       * its violets down the other. Any fixed mapping from position in the
       * order to position in the bay has this failure mode.
       *
       * Turning the four places by one each group breaks the lock: a book that
       * keeps landing in the same slot of its group walks around all four
       * places as it goes down the corridor, so both bindings finish evenly
       * spread across both walls and both rows.
       */
      const place = (i + g) % 4;
      const wall = (place < 2 ? -1 : 1) as 1 | -1;
      const row = place % 2;
      const slot = groups > 1 ? Math.round((g * (stations - 1)) / (groups - 1)) : 0;
      // stand strictly at a shelf-bay station — never in a gallery gap; on a
      // pocket wall the innermost bay is gone, so books start one bay further in
      const slots = slotsFor(section.angle, wall);
      const u = slots[slot % slots.length];
      const [x, z] = wingPoint(section.angle, u, wall * CASE_N);
      out.push({
        entity,
        pos: new THREE.Vector3(x, ROW_Y(row), z),
        angle: section.angle,
        wall,
        u,
        rotY: -section.angle,
      });
    });
  }
  return out;
})();

const GRIMOIRE_BY_ID = new Map(GRIMOIRES.map((g) => [g.entity.id, g]));
const GRIMOIRE_POS = new Map(GRIMOIRES.map((g) => [g.entity.id, g.pos]));

/** where the shelf-filler must leave a gap: grimoire u-positions per wall row */
const GRIMOIRE_SLOTS: Map<string, number[]> = (() => {
  const m = new Map<string, number[]>();
  for (const g of GRIMOIRES) {
    const row = Math.round((g.pos.y - 1.12) / 1.45);
    const key = slotKey({ angle: g.angle, wall: g.wall, row });
    if (!m.has(key)) m.set(key, []);
    m.get(key)!.push(g.u);
  }
  return m;
})();

/* the Librarian's post: the grand reception station standing where the old
   Research Hall door used to be, in the north apse, facing the incoming hall */
/* Set well back down the lengthened apse, which is what gives Boaz & Jachin
   room to stand INSIDE the corridor as a gateway on the walk up to her (see
   MasonicPillars) with clear air both sides of them. Her catalogue bank keeps
   ~0.4 m off the apse end wall behind her.

   DERIVED from APSE_Z rather than hand-set: it was a bare −22.6, struck when
   the end wall was at −25.0, and the apse has been cut deeper since. Left as a
   literal she stayed where she was and the bank drifted off the wall it is
   meant to stand against, leaving her adrift in the middle of the corridor
   with the pillars. The 2.4 m is the clearance, and it is the thing that
   should stay fixed. */
const LIBRARIAN_POS: [number, number, number] = [0, 0, APSE_Z + 2.4];
const LIBRARIAN_ROT = 0; // desk faces south (+z) toward arrivals; shelves back to the apse wall
/* The four reading stations, set 9 m apart so their 4 m interaction radii never
   overlap and only one prompt can ever be in range. Each sits centred in the gap
   between the entrance/apse corridor and the neighbouring wing mouth. */
/* the tarot table — sit here for a reading */
const TAROT_POS: [number, number] = [4.5, 10.6];
/* the zodiac table — sit here to read the wheel */
const ASTRO_POS: [number, number] = [-4.5, 10.6];
/* the two study tables toward the apse: alchemy and the kabbalist's table */
const ALCHEMY_POS: [number, number] = [-4.5, -10.6];
const KABBALAH_POS: [number, number] = [4.5, -10.6];

/* ————— walkable space: rotunda + wings + halls, minus furniture ————— */
const OBSTACLES: { x: number; z: number; r: number }[] = [
  ...TABLE_SPECS.map((t) => ({ x: t.x, z: t.z, r: 1.9 })),
  // the reception desk in the apse — r 1.9 (was 1.7) for the widened counter,
  // and it overlaps the two pillar circles (x ±2.35, r 0.8) so there is no gap
  // to squeeze through between the desk and either pillar: you cannot walk
  // through the station, only up to it.
  { x: LIBRARIAN_POS[0], z: LIBRARIAN_POS[2] + 0.4, r: 1.9 },
  // (the hearth's 2.6 m circle is gone with it — Melchizedek stands against the
  // drum at x −16.85 and never reaches the walkable radius, so like the other
  // drum figures he needs no obstacle of his own)
  { x: 16.5, z: 0, r: 1.0 }, // the Leontocephaline & its lectern, east (was the clock)
  // Boaz & Jachin, flanking the Librarian as the gateway on the walk up to her
  // desk. Taken straight from MasonicPillars rather than copied, so the
  // collision can't drift off the models the way it did twice already.
  // 0.8 rather than 0.5: the pillars stand FREE in the apse, on a moulded
  // step of their own (PILLAR_STEP_R), and 0.5 let you walk through the step's
  // outer course and clip the plinth
  ...PILLAR_STANCE.map((p) => ({ x: p.x, z: p.z, r: 0.8 })),
  // (Isis & Serapis need no obstacle of their own — like the other niched drum
  // figures they sit against the wall, past the walkable radius)
  // the great orrery, heart of the rotunda — a round table of planets at
  // waist height, fenced at its rim so you walk up to it, never through it
  { x: 0, z: 0, r: ORRERY_REACH },
];

/* ————————————————————————————————————————————————————————————————
   TOUCH MOVEMENT

   The stick is a RING IN THE CORNER, and it activates only for a press that
   lands inside that ring. It began as a whole-quadrant zone — press anywhere
   in the lower-left and the stick jumped to your thumb — which was generous
   to the thumb and a disaster for everything else: a third of the hall, the
   third with the near tables and the lowest shelf of every case in front of
   you, could not be tapped or dragged. You reached for a book and walked into
   it instead. A control the size of a control costs you a coin's worth of
   floor and gives back the rest of the frame.

   Nothing is layered over the canvas — the ring is drawn with
   `pointer-events: none` and the canvas itself sorts the fingers — so even
   the pixels under the ring still answer the picker: a press that does not
   travel is a tap, and it opens whatever is behind the ring.
   ———————————————————————————————————————————————————————————————— */

/** the stick writes here as an analog vector; the rig reads it with the keys */
const TOUCH_MOVE = { x: 0, y: 0 };
/** knob travel, px — also the distance that means "full speed" */
const STICK_R = 52;
/** a resting thumb wanders; nothing under this many px is movement at all */
const STICK_DEAD = 8;
/**
 * The ring's own radius, and the only place a walk can begin.
 *
 * 66 is the drawn ring (132px across, see .touch-stick). The slop on top is
 * for the difference between where a finger looks like it is and where the
 * browser says it is — about 6px at a typical touch size, and without it the
 * outer ring of pixels reads as dead when the thumb is plainly on the mark.
 */
const STICK_RING_R = 66;
const STICK_GRAB_SLOP = 6;
/** the parked ring is the walk zone; everything else in the frame looks */
function inMoveZone(x: number, y: number): boolean {
  const home = stickHome();
  return Math.hypot(x - home.x, y - home.y) <= STICK_RING_R + STICK_GRAB_SLOP;
}
/**
 * How hard the view chases the drag, and the walk chases the stick.
 *
 * Both are `MathUtils.damp` rates — frame-rate independent, so a 120 Hz phone
 * and a 30 Hz one settle in the same wall-clock time. 22 is roughly a 45 ms
 * lag: enough to swallow the jitter of a finger's reported position, far too
 * little to feel like the camera is on a spring.
 */
const LOOK_DAMP = 22;
const MOVE_DAMP = 13;
/** the rig drives the on-screen stick through this; the view fills it in */
const TOUCH_STICK: {
  /** a thumb has taken the ring — light it up */
  arm?: () => void;
  /** knob offset from the ring's centre, in px */
  set?: (dx: number, dy: number) => void;
  /** let go: dim it and recentre the knob */
  hide?: () => void;
} = {};

/**
 * WHERE THE STICK LIVES — the centre of the ring, and the one point every
 * walk is measured from.
 *
 * It is a fixed corner rather than wherever a thumb happens to land. A stick
 * that materialises under the finger is invisible until you have already
 * found it, which is no use to a visitor nobody has told about it; and it
 * needs a whole quadrant of live surface to be findable, which is a third of
 * the frame taken away from tapping the room.
 *
 * The ring is 132px across, so its edge is 18px from the left of the glass
 * and 38px up from the bottom — clear of the largest home indicator and of
 * the portrait side insets by a wide margin. That is why these are two plain
 * numbers and not a reading of `env(safe-area-inset-*)`: a custom property
 * holding an `env()` does not resolve to pixels when read back from script.
 */
function stickHome(): { x: number; y: number } {
  return { x: 84, y: window.innerHeight - 104 };
}

/** the ring in the corner — presentation only, it takes no pointer events */
function TouchStick() {
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const park = () => {
      const el = base.current;
      if (!el) return;
      const { x, y } = stickHome();
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    };
    park();
    TOUCH_STICK.arm = () => base.current?.classList.add('is-live');
    TOUCH_STICK.set = (dx, dy) => {
      if (knob.current) knob.current.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
    };
    TOUCH_STICK.hide = () => {
      base.current?.classList.remove('is-live');
      if (knob.current) knob.current.style.transform = 'translate(-50%, -50%)';
    };
    window.addEventListener('resize', park);
    window.addEventListener('orientationchange', park);
    return () => {
      window.removeEventListener('resize', park);
      window.removeEventListener('orientationchange', park);
      delete TOUCH_STICK.arm;
      delete TOUCH_STICK.set;
      delete TOUCH_STICK.hide;
    };
  }, []);
  return (
    <div ref={base} className="touch-stick" aria-hidden="true">
      <div ref={knob} className="touch-stick-knob" />
      <span className="touch-stick-mark" />
    </div>
  );
}

/**
 * THE FIELD OF VIEW IS A FUNCTION OF THE WINDOW'S SHAPE.
 *
 * The camera's 64° is measured VERTICALLY, and three.js derives the
 * horizontal angle from the aspect — so the same number that framed the
 * rotunda on a laptop gave two quite different rooms at the ends of the
 * range. Upright on a phone the horizontal field collapsed to about 35°: a
 * keyhole, through which finding a doorway was a chore. On an ultrawide it
 * opened past 110°, which is the fisheye look — the pillars at the edges of
 * the frame lean and stretch, and the hall reads as a panorama photograph
 * rather than a place.
 *
 * So hold the HORIZONTAL angle inside a sane band instead and let the
 * vertical one fall out of it. Between roughly 4:3 and 16:9 — every ordinary
 * laptop and desktop window — neither bound is reached and the view is
 * precisely the 64° it always was.
 */
const MIN_H_FOV = (74 * Math.PI) / 180;
const MAX_H_FOV = (100 * Math.PI) / 180;
/** upright, the vertical angle is allowed to open this far and no further */
const MAX_V_FOV = 92;
/** and on a cinema-shaped window it may close to this, but not past it */
const MIN_V_FOV = 50;
function AspectFov() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam.isPerspectiveCamera) return;
    const aspect = size.width / Math.max(size.height, 1);
    const forH = (h: number) => (2 * Math.atan(Math.tan(h / 2) / aspect) * 180) / Math.PI;
    // narrow window: open up until the horizontal field is decent again
    // wide window: close down until it stops bending the architecture
    const fov = THREE.MathUtils.clamp(
      Math.min(Math.max(64, forH(MIN_H_FOV)), Math.max(MIN_V_FOV, forH(MAX_H_FOV))),
      MIN_V_FOV,
      MAX_V_FOV,
    );
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  }, [camera, size]);
  return null;
}


function walkable(x: number, z: number): boolean {
  for (const o of OBSTACLES) {
    const dx = x - o.x;
    const dz = z - o.z;
    if (dx * dx + dz * dz < o.r * o.r) return false;
  }
  if (x * x + z * z < (ROT_R - 0.8) * (ROT_R - 0.8)) return true;
  if (Math.abs(x) < ENTRY_HALF - 0.35 && z > 0 && z < ENTRY_Z - 0.6) return true;
  if (Math.abs(x) < APSE_HALF - 0.3 && z < 0 && z > APSE_Z + 0.4) return true;
  for (const a of WING_ANGLES) {
    const { u, n } = toWing(a, x, z);
    if (u > WING_U0 - 1.5 && u < WING_U1 - 0.7 && Math.abs(n) < CASE_N - 0.9) return true;
  }
  return false;
}

/**
 * Is this floor point inside the OPEN VOLUME of some room?
 *
 * A looser sibling of `walkable`: it ignores furniture (you can see over a
 * table, and past a pillar at most angles) and it measures to the true wall
 * faces rather than the walker's padded clearance, because a book standing on
 * a shelf against the wall must still be visible from the corridor. All it
 * answers is "is there air here, or is this inside masonry".
 */
function openSpace(x: number, z: number): boolean {
  if (x * x + z * z < ROT_R * ROT_R) return true;
  if (Math.abs(x) < ENTRY_HALF + 0.3 && z > 0 && z < ENTRY_Z) return true;
  if (Math.abs(x) < APSE_HALF + 0.3 && z < 0 && z > APSE_Z) return true;
  for (const a of WING_ANGLES) {
    const { u, n } = toWing(a, x, z);
    if (u > WING_U0 - 1.5 && u < WING_U1 && Math.abs(n) < WING_WALL_HALF) return true;
  }
  return false;
}

/**
 * Line of sight from the eye to a click target, walked along the floor plan.
 *
 * The picker raycasts its registry alone, so before this a grimoire, statue or
 * plate answered the cursor through whatever stood in front of it: you could
 * open a book in the north-east hall while standing in the south-west one, or
 * click a statue through the drum. Sampling the segment against `openSpace`
 * catches exactly that — any sample that lands inside masonry means a wall is
 * in the way.
 *
 * Both ends are trimmed: the target end because the thing you are clicking is
 * usually flat against a wall (its own surface is "inside" the masonry by a few
 * centimetres), the eye end because the camera can stand within a hand's width
 * of a wall it is facing along.
 */
const SIGHT_STEP = 0.5;
const SIGHT_END_SLACK = 0.7;
function occludedByWall(from: THREE.Vector3, to: THREE.Vector3): boolean {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dz);
  if (len < SIGHT_END_SLACK * 2) return false; // arm's reach: nothing fits between
  const steps = Math.ceil((len - SIGHT_END_SLACK * 2) / SIGHT_STEP);
  for (let i = 0; i <= steps; i++) {
    const t = (SIGHT_END_SLACK + (i / steps) * (len - SIGHT_END_SLACK * 2)) / len;
    if (!openSpace(from.x + dx * t, from.z + dz * t)) return true;
  }
  return false;
}

interface Jump {
  x: number;
  z: number;
  yaw: number;
  pitch?: number;
  /**
   * Eye height to hold while seated, if the default chair height is wrong for
   * this table. The tarot spread lies FLAT: from 1.5 you see three cards
   * almost edge-on, foreshortened into slivers, and the art on them is
   * unreadable. Sitting up and leaning over the table — which is what anyone
   * reading a spread actually does — puts the eye above the cards and shows
   * them nearly face-on, without leaving the chair's point of view.
   */
  eye?: number;
  n: number;
}

/**
 * The arrival: a slow glide from the doors to the heart of the hall.
 *
 * Both ends are fixed by something real, so the curve is written between them
 * rather than typed out. It LANDS at 11.6 — that is the rotunda floor in front
 * of the orrery, and it does not care how long the entrance hall is. It STARTS
 * a fixed distance inside the doors, so shortening the vestibule (see ENTRY_Z)
 * shortens the flight instead of leaving it to begin out in the porch. The two
 * middle points carry the drift left and right that stops the glide reading as
 * a rail, and are placed by fraction of the run so they keep their shape at any
 * length.
 */
const FLIGHT_END = 11.6;
const FLIGHT_START = ENTRY_Z - 5;
const FLIGHT_RUN = FLIGHT_START - FLIGHT_END;
const flightZ = (t: number) => FLIGHT_START - t * FLIGHT_RUN;
const FLIGHT_CURVE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 3.3, flightZ(0)),
    new THREE.Vector3(1.5, 2.9, flightZ(0.4)),
    new THREE.Vector3(-1.3, 2.5, flightZ(0.74)),
    new THREE.Vector3(0, 2.2, flightZ(1)),
  ],
  false,
  'catmullrom',
  0.6,
);
/** held at the pace the long version flew — ~1.66 m a second */
const FLIGHT_SECONDS = FLIGHT_RUN / 1.66;

function FirstPersonRig({
  still,
  frozen,
  seated,
  jump,
  flight,
  onFlightDone,
}: {
  still: boolean;
  frozen: boolean;
  /** sitting at a reading table — drop to a chair-height eye level */
  seated: boolean;
  jump: Jump | null;
  flight: boolean;
  onFlightDone: () => void;
}) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());
  // whether the walk zone is armed at all — read live inside the listeners,
  // because the window can change shape without this effect ever re-running
  const { stick: stickOn } = useViewport();
  const stickRef = useRef(stickOn);
  stickRef.current = stickOn;
  // widened mid-walk (or the phone was turned): drop the stick rather than
  // leave the walk vector latched at whatever it held when the zone vanished
  useEffect(() => {
    if (stickOn) return;
    TOUCH_MOVE.x = 0;
    TOUCH_MOVE.y = 0;
    TOUCH_STICK.hide?.();
  }, [stickOn]);
  // ?cam=x,z,yawDeg drops you straight onto a spot facing a given bearing —
  // a dev aid for checking a piece of the building without walking to it.
  // Like ?view and ?focus it skips the arrival glide.
  const spawn = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get('cam');
    if (!raw) return null;
    const [x, z, deg] = raw.split(',').map(Number);
    if ([x, z, deg].some((v) => !Number.isFinite(v))) return null;
    return { x, z, yaw: (deg * Math.PI) / 180 };
  }, []);
  /**
   * WHERE THE LOOK IS HEADED, and where it has got to.
   *
   * A drag used to write straight into the camera's rotation, which is exact
   * and, on a touch screen, horrible: a finger reports in coarse jumps, so a
   * slow pan came out as a series of small snaps. The gesture now moves a
   * TARGET and the view chases it — the same total travel, arriving a frame or
   * two late and perfectly smooth. The chase is fast enough (see LOOK_DAMP)
   * that a mouse still feels one-to-one.
   */
  const yaw = useRef(spawn ? spawn.yaw : 0);
  const pitch = useRef(-0.02);
  const yawView = useRef(yaw.current);
  const pitchView = useRef(pitch.current);
  /** the walk input, damped — a thumb slammed to the rim shouldn't teleport */
  const moveVel = useRef({ f: 0, s: 0 });
  const pos = useRef(new THREE.Vector3(spawn ? spawn.x : 0, 2.2, spawn ? spawn.z : SPAWN_Z));
  const walked = useRef(0);
  const eye = useRef(2.2);
  /** the eye height this seat asked for; the standing height is 2.2 */
  const seatEye = useRef(1.5);
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  useEffect(() => {
    if (jump) {
      pos.current.set(jump.x, 2.2, jump.z);
      yaw.current = jump.yaw;
      pitch.current = jump.pitch ?? -0.02;
      // a seat is a CUT, not a pan: the smoothed view snaps with the target,
      // or sitting down swings the head across the room to get there
      yawView.current = yaw.current;
      pitchView.current = pitch.current;
      seatEye.current = jump.eye ?? 1.5;
    }
  }, [jump]);

  useEffect(() => {
    camera.rotation.order = 'YXZ';
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement && Boolean(t.closest('input, textarea, select, [contenteditable]'));
    const down = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      keys.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    // drag-to-look tracks its own deltas per pointer id — movementX/Y is
    // unreliable on touch (iOS reports zeros), and two thumbs must not fight
    let dragId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    /** the walking thumb, and the ring centre it is being measured from */
    let moveId: number | null = null;
    let originX = 0;
    let originY = 0;
    const releaseStick = () => {
      moveId = null;
      TOUCH_MOVE.x = 0;
      TOUCH_MOVE.y = 0;
      TOUCH_STICK.hide?.();
    };
    const onPointerDown = (e: PointerEvent) => {
      // A press ON THE RING walks; it never also turns the head.
      //
      // The test is the LAYOUT, not the input device. At phone width the
      // ring is drawn on screen, and something drawn on screen has to work
      // under whatever is pointing at it — a mouse on a narrow desk window
      // included. On a wide window the ring does not exist at all and the
      // whole frame is drag-to-look, exactly as it was.
      if (
        stickRef.current &&
        moveId === null &&
        !frozenRef.current &&
        (e.pointerType !== 'mouse' || e.button === 0) &&
        inMoveZone(e.clientX, e.clientY)
      ) {
        moveId = e.pointerId;
        // measured from the RING'S CENTRE, not from where the thumb landed:
        // the ring stays put now, so pressing its upper edge already means
        // forward, and re-zeroing on the touch point would have thrown that
        // away and made you drag a further 50px to get the same walk
        const home = stickHome();
        originX = home.x;
        originY = home.y;
        TOUCH_STICK.arm?.();
        onPointerMove(e);
        return;
      }
      if (dragId === null && (e.pointerType !== 'mouse' || e.button === 0)) {
        dragId = e.pointerId;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId === moveId) {
        let dx = e.clientX - originX;
        let dy = e.clientY - originY;
        const len = Math.hypot(dx, dy);
        if (len > STICK_R) {
          // the knob stops at the rim and the DIRECTION goes on tracking the
          // thumb past it — so a thumb that slides outside the ring still
          // steers at full speed instead of dropping the walk, and the ring
          // itself never wanders off its corner
          dx *= STICK_R / len;
          dy *= STICK_R / len;
        }
        TOUCH_STICK.set?.(dx, dy);
        const m = Math.hypot(dx, dy);
        if (m < STICK_DEAD) {
          TOUCH_MOVE.x = 0;
          TOUCH_MOVE.y = 0;
        } else {
          // radial deadzone: the vector keeps its DIRECTION and loses only the
          // first few px of length, so a gentle push is a slow walk in a
          // straight line rather than an axis-snapped stagger
          const s = (m - STICK_DEAD) / (STICK_R - STICK_DEAD) / m;
          TOUCH_MOVE.x = dx * s;
          TOUCH_MOVE.y = dy * s;
        }
        return;
      }
      if (e.pointerId !== dragId || frozenRef.current) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      // a thumb travels far less than a mouse for the same intent, and it has
      // a much shorter runway before it leaves the glass
      const gain = e.pointerType === 'touch' ? 1.35 : 1;
      yaw.current -= dx * 0.0033 * gain;
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.0024 * gain, -0.6, 0.85);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId === moveId) releaseStick();
      if (e.pointerId === dragId) dragId = null;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    const el = gl.domElement;
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      releaseStick();
    };
  }, [camera, gl]);

  const flightT = useRef(0);
  const flightScratch = useMemo(() => ({ p: new THREE.Vector3(), f: new THREE.Vector3() }), []);

  useFrame((state, delta) => {
    // the arrival glide owns the camera until it lands (or is skipped)
    if (flight) {
      flightT.current = Math.min(1, flightT.current + delta / FLIGHT_SECONDS);
      const raw = flightT.current;
      const k = raw * raw * (3 - 2 * raw); // ease in-out
      const { p, f } = flightScratch;
      FLIGHT_CURVE.getPointAt(k, p);
      pos.current.copy(p);
      // the gaze drifts down from the dome to the orrery table at the heart
      // of the hall — the arrival ends on the centrepiece, not the empty
      // apse corridor
      f.set(0, THREE.MathUtils.lerp(7.5, 1.15, k), THREE.MathUtils.lerp(2, 0, k));
      const dx = f.x - p.x;
      const dy = f.y - p.y;
      const dz = f.z - p.z;
      yaw.current = Math.atan2(-dx, -dz);
      pitch.current = Math.atan2(dy, Math.hypot(dx, dz));
      yawView.current = yaw.current;
      pitchView.current = pitch.current;
      camera.position.set(pos.current.x, pos.current.y, pos.current.z);
      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;
      if (flightT.current >= 1) onFlightDone();
      return;
    }
    const k = keys.current;
    let bob = 0;
    if (!frozen) {
      // arrows turn; Q turns left. (E is reserved for the interact key, so it
      // must NOT also turn — otherwise turning re-triggers a nearby station.)
      const turn = (k.has('ArrowLeft') || k.has('KeyQ') ? 1 : 0) - (k.has('ArrowRight') ? 1 : 0);
      yaw.current += turn * 1.6 * delta;

      const wantF = THREE.MathUtils.clamp(
        (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) -
          (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) -
          TOUCH_MOVE.y,
        -1,
        1,
      );
      const wantS = THREE.MathUtils.clamp(
        (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0) + TOUCH_MOVE.x,
        -1,
        1,
      );
      // the walk eases in and out over about a tenth of a second. Keys are
      // on/off and a thumb is not much better, and stepping straight from
      // still to 5 m/s (and back) is what made touch walking read as sliding.
      const v = moveVel.current;
      v.f = THREE.MathUtils.damp(v.f, wantF, MOVE_DAMP, delta);
      v.s = THREE.MathUtils.damp(v.s, wantS, MOVE_DAMP, delta);
      if (Math.abs(v.f) < 0.001) v.f = 0;
      if (Math.abs(v.s) < 0.001) v.s = 0;
      const forward = v.f;
      const strafe = v.s;
      // a thumb pressed to the rim of the stick is a run, the same as Shift
      const pushed = Math.hypot(TOUCH_MOVE.x, TOUCH_MOVE.y) > 0.94;
      const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? 9.5 : pushed ? 7.4 : 5.2;

      if (forward || strafe) {
        const sin = Math.sin(yaw.current);
        const cos = Math.cos(yaw.current);
        // diagonals must not be faster than a straight line, and an analog
        // stick's magnitude is the whole point of having one
        const mag = Math.min(1, Math.hypot(forward, strafe));
        const step = speed * mag * delta;
        const dx = ((-sin * forward + cos * strafe) / (Math.hypot(forward, strafe) || 1)) * step;
        const dz = ((-cos * forward - sin * strafe) / (Math.hypot(forward, strafe) || 1)) * step;
        if (walkable(pos.current.x + dx, pos.current.z)) pos.current.x += dx;
        if (walkable(pos.current.x, pos.current.z + dz)) pos.current.z += dz;
        walked.current += step;
      }

      const moving = forward !== 0 || strafe !== 0;
      bob = still || !moving ? 0 : Math.sin(walked.current * 1.9) * 0.05;
    } else {
      // sat down mid-stride: let go of the walk, or standing up resumes it
      moveVel.current.f = 0;
      moveVel.current.s = 0;
    }
    // drop to chair-height when seated at a reading table, stand back up on leave
    const wantEye = seated ? seatEye.current : 2.2;
    eye.current = THREE.MathUtils.damp(eye.current, wantEye, 9, delta);
    // the view catches up with where the drag has pointed it
    yawView.current = THREE.MathUtils.damp(yawView.current, yaw.current, LOOK_DAMP, delta);
    pitchView.current = THREE.MathUtils.damp(pitchView.current, pitch.current, LOOK_DAMP, delta);
    // always apply position so a jump (e.g. sitting at the table) takes effect
    camera.position.set(pos.current.x, eye.current + (seated ? 0 : bob), pos.current.z);
    camera.rotation.y = yawView.current;
    camera.rotation.x = pitchView.current + (still ? 0 : Math.sin(state.clock.elapsedTime * 0.4) * 0.004);
  });
  return null;
}

/* `Runners` stood here: nine loose planes, eight down the wings and one from
 * the entrance, each 1.8–2.2 m wide, each on its own inline material, none of
 * them touching anything else. It is gone. Its work — and a great deal it never
 * attempted — is done by `Cosmographia` in three/cosmographia.tsx, where the
 * ways leave from under the mandala's own rim, carry the same weave and border
 * as the rotunda, pause on stone at both galleries, and are trimmed in brass at
 * every gate. A runner that starts on bare boards two metres inside a doorway
 * is the thing the whole redesign is against. */

/* ————— the stacks ————— */
/** books per bay, kept at a constant spine density however wide the bay is */
const BOOKS_PER_BAY = 15;
const booksFor = (w: number) => Math.round(((w - 0.7) / (BAY_W - 0.7)) * BOOKS_PER_BAY);

/**
 * HOW HIGH A ROW IS, 0 at the reachable shelves and 1 at the top of the case.
 *
 * This one number does all the work of hiding the interaction system.
 *
 * The old stacks gave the game away instantly: the two lowest rows carried the
 * readable grimoires, which glowed, and every other row carried the same flat
 * cream filler. A visitor did not learn "those books are within reach" — they
 * learned "the lit ones are buttons and the grey ones are wallpaper", and from
 * then on they were looking at an interface instead of at a library.
 *
 * So the shelves are graded by HEIGHT instead of by function. Up top the
 * bindings go darker, greyer and dustier, exactly as they would nine metres up
 * over a room lit from below by candles; down here they are warm and saturated
 * because that is where the light is and where hands have polished them. The
 * eye reads "too high to reach", which is true, instead of "disabled", which
 * is an implementation detail.
 */
const rowHeight = (row: number) => row / (SHELF_ROWS - 1);

/** what the top shelves are drifting toward: a cold, dead grey. Bindings are
 *  lerped into it rather than merely darkened — a shelf that has only lost
 *  brightness looks like a shelf with the lights off, and one that has lost
 *  its COLOUR looks like a shelf nobody has dusted in a century. */
const DUST = new THREE.Color('#6d6a63');

function MegaShelves() {
  const bays = useMemo(() => {
    const out: { x: number; z: number; rotY: number; a: number; u: number; w: number; wall: number }[] = [];
    // eight bays per wall from the shared plan — two open gaps stay clear
    // for the twin art galleries; pocket walls drop their innermost bay so the
    // dead-end behind the hearth and clock opens up
    for (const a of WING_ANGLES) {
      for (const wall of [-1, 1]) {
        for (const bay of baysFor(a, wall)) {
          const [x, z] = wingPoint(a, bay.u, wall * CASE_N);
          out.push({ x, z, rotY: -a, a, u: bay.u, w: bay.w, wall });
        }
      }
    }
    return out;
  }, []);

  const bookGeom = useMemo(() => new THREE.BoxGeometry(0.22, 0.95, 0.3), []);

  /**
   * The filler bindings: FOUR spine designs × THREE height bands = twelve
   * materials, and both halves of that matter.
   *
   * DESIGNS, because a wall of books built from one tiled texture puts its
   * gilt bands at the same two heights on every volume, and the eye locks onto
   * that repeat long before it notices that the colours vary (see
   * `spineSheet`). Each design is one column of the sheet.
   *
   * BANDS, because of a subtler failure. The stacks carry a little emissive so
   * that a hall lit by four distant chandeliers does not go to flat brown —
   * but three.js does NOT multiply emissive by an instance's colour, only
   * diffuse. In a dim wing the emissive term therefore dominates, which is why
   * the per-book tinting and the dust grading were both invisible: every
   * volume rendered as the same pale cream whatever colour it had been given.
   *
   * Splitting by height gives the grading somewhere to bite. Down where a hand
   * can reach, the bindings are warm and self-lit; at the top the emissive is
   * a third of that and turns cold, so the archive recedes into the dark the
   * way it should. Twenty-four draw calls in total, on a scene that runs to two
   * thousand — the sheet went from four bindings to eight, and doubling the
   * variety of four thousand books for twelve calls is the cheapest trade in
   * the building.
   */
  const BANDS = 3;
  const bookMats = useMemo(() => {
    const sheet = spineSheet();
    const bands = [
      { emissive: '#ffe6c0', intensity: 0.2 },
      { emissive: '#e8dcc8', intensity: 0.13 },
      { emissive: '#b9bcc4', intensity: 0.06 },
    ];
    const out: THREE.MeshStandardMaterial[] = [];
    for (let band = 0; band < BANDS; band++) {
      for (let d = 0; d < SPINE_DESIGNS; d++) {
        const map = sheet.clone();
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(1 / SPINE_DESIGNS, 1);
        map.offset.set(d / SPINE_DESIGNS, 0);
        map.needsUpdate = true;
        const mat = new THREE.MeshStandardMaterial({
          map,
          roughness: 0.72 + band * 0.06,
          emissive: new THREE.Color(bands[band].emissive),
          emissiveMap: map,
          emissiveIntensity: bands[band].intensity,
        });
        /**
         * TINT THE EMISSIVE BY THE INSTANCE'S OWN HUE — its hue, not its value.
         *
         * three multiplies an instance's colour into DIFFUSE only. In a wing
         * lit by four distant chandeliers the diffuse term is a fraction of the
         * emissive one, so without this every binding in the museum renders as
         * the same pale cream whatever colour it was given: the palette, the
         * dust grading and the whole point of the pass are invisible, and the
         * only coloured things left on the shelf are the readable books —
         * which is exactly the giveaway this pass exists to remove.
         *
         * Multiplying by `vColor` outright was the first try and it blacked the
         * stacks out. Instance colours are LINEAR, so a mid-tone binding is
         * around 0.15–0.35 there, and scaling the room's own light by that
         * turned four thousand books off. Normalising by the brightest channel
         * keeps the hue and throws away the value: a navy binding and a cream
         * one now catch the same amount of candlelight, which is true, and each
         * catches it in its own colour, which is the point. How DARK a book is
         * stays the band's job (see `bands` above), where it belongs.
         */
        mat.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            `#include <emissivemap_fragment>
             #if defined( USE_INSTANCING_COLOR ) || defined( USE_COLOR )
               // .rgb, not vColor: three declares this varying as a vec4 when
               // instance colour is in play, and swizzling reads correctly
               // whichever way a future version declares it
               vec3 spineHue = vColor.rgb;
               float spinePeak = max( spineHue.r, max( spineHue.g, spineHue.b ) );
               totalEmissiveRadiance *= mix( vec3( 1.0 ), spineHue / max( spinePeak, 1e-4 ), 0.88 );
             #endif`,
          );
        };
        // so this variant does not share a compiled program with an unpatched
        // MeshStandardMaterial that happens to have the same parameters
        mat.customProgramCacheKey = () => 'spine-emissive-tinted';
        out.push(mat);
      }
    }
    return out;
  }, []);
  /** which of the three bands a shelf row belongs to */
  const bandOf = (row: number) => (row < 2 ? 0 : row < 5 ? 1 : 2);
  const frameGeom = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tiled(woodBeam('#5a4530'), 1.5, 1.5), roughness: 0.75 }),
    [],
  );
  /**
   * What is on the top shelves INSTEAD of more books: document boxes, portfolio
   * cases and slipcased sets. Two extra instanced meshes for the whole museum.
   *
   * This is the honest half of the answer to "why can't I touch those?". A wall
   * of identical books nine metres up that happens to be inert is a puzzle; a
   * shelf of boxes, cases and rolled maps is an ARCHIVE, and nobody expects to
   * browse an archive from the floor.
   */
  const boxGeom = useMemo(() => new THREE.BoxGeometry(0.42, 0.34, 0.44), []);
  const boxMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tiled(leather(), 2, 2), roughness: 0.85, color: '#6b5a48' }),
    [],
  );
  const rollGeom = useMemo(() => new THREE.CylinderGeometry(0.055, 0.055, 0.5, 7), []);
  const rollMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#9b8e6f', roughness: 0.9 }),
    [],
  );
  /**
   * Everything on the shelves, worked out once and sorted into the bucket it
   * will be drawn from.
   *
   * The placement runs BEFORE the meshes exist rather than filling them in
   * afterwards, because an `InstancedMesh` is allocated at a fixed size and
   * twelve buckets fed by a random design roll have no count anybody can
   * predict. The alternative — allocating each bucket for the worst case — is
   * a couple of megabytes of matrices that are never drawn.
   */
  const placed = useMemo(() => {
    const buckets = Array.from({ length: BANDS * SPINE_DESIGNS }, () => ({
      m: [] as number[],
      c: [] as number[],
    }));
    const frames = { m: [] as number[] };
    const boxes = { m: [] as number[], c: [] as number[] };
    const rolls = { m: [] as number[], c: [] as number[] };
    const rng = mulberry32(1717);
    const dummy = new THREE.Object3D();
    // a lean tips a book about the axis pointing OUT of the shelf, which is the
    // book's own local Z once it has been turned to face the aisle. 'YXZ' is
    // what composes those two in that order.
    dummy.rotation.order = 'YXZ';
    const color = new THREE.Color();
    /**
     * The bindings — and the two hues DELIBERATELY MISSING from them.
     *
     * Violet and crimson used to be in this list, so that the readable
     * grimoires (violet synopses, crimson original texts) would not be the only
     * two coloured things on the shelf. That worked far too well: with those
     * tones occurring all the way up the case there was no way to tell a book
     * you could open from four thousand you could not, and visitors read the
     * stacks as uniformly inert.
     *
     * So the filler is now everything EXCEPT violet and crimson — earths,
     * greens, blues, ochres, a slate. The two reserved hues are the museum's
     * own, and a spine wearing one of them means exactly one thing: you can
     * take this down and read it.
     */
    const palette = [
      '#a4543c', '#b07a36', '#5a7d5e', '#4a6f8a', '#7a6a55', '#96865c',
      '#4d6152', '#b58a54', '#5d6b7d', '#7d6b4a', '#3f4a6b', '#6e4a2c',
    ];
    for (const bay of bays) {
      const { ux, uz, nx, nz } = wingAxis(bay.a);
      const books = booksFor(bay.w);
      for (let s = 0; s <= SHELF_ROWS; s++) {
        dummy.position.set(bay.x, SHELF_Y0 + s * SHELF_PITCH, bay.z);
        dummy.rotation.set(0, bay.rotY, 0);
        dummy.scale.set(bay.w, 0.09, 0.55);
        dummy.updateMatrix();
        frames.m.push(...dummy.matrix.elements);
      }
      for (const side of [-1, 1]) {
        dummy.position.set(bay.x + ux * (bay.w / 2) * side, 5.6, bay.z + uz * (bay.w / 2) * side);
        dummy.rotation.set(0, bay.rotY, 0);
        dummy.scale.set(0.16, 11.3, 0.6);
        dummy.updateMatrix();
        frames.m.push(...dummy.matrix.elements);
      }
      for (let s = 0; s < SHELF_ROWS; s++) {
        const h = rowHeight(s);
        const shelfY = ROW_Y(s);
        // the filler leaves a gap wherever a grimoire stands in this row
        const reserved =
          s < 2 ? GRIMOIRE_SLOTS.get(slotKey({ angle: bay.a, wall: bay.wall as 1 | -1, row: s })) ?? [] : [];

        /** how much of this row is given over to boxes and rolls rather than
         *  books — none at all down here, most of it at the top */
        const archive = Math.max(0, h - 0.45) / 0.55;
        /** where along the row the archive block sits, so it is not always the
         *  same end and the boundary between books and boxes never lines up
         *  from bay to bay */
        const archiveAt = rng();
        let lastWasGap = false;

        for (let kk = 0; kk < books; kk++) {
          const t = kk / (books - 1);
          const off = -bay.w / 2 + 0.35 + t * (bay.w - 0.7) + (rng() - 0.5) * 0.05;
          const skip = reserved.some((gu) => Math.abs(bay.u + off - gu) < 0.26);
          // burn the rng draws either way so the shelves stay deterministic
          const jitter = (rng() - 0.5) * 0.05;
          const sx = 0.72 + rng() * 0.72;
          const sy = 0.7 + rng() * 0.58;
          const tone = palette[Math.floor(rng() * palette.length)];
          const lum = (rng() - 0.5) * 0.14;
          const design = Math.floor(rng() * SPINE_DESIGNS);
          const gapRoll = rng();
          const leanRoll = rng();
          const proudRoll = rng();
          // the top rows hand this stretch over to the archive instead
          const inArchive = archive > 0 && Math.abs(t - archiveAt) < archive * 0.5;
          if (skip || inArchive) {
            lastWasGap = lastWasGap || inArchive;
            continue;
          }
          // MISSING BOOKS. A shelf with no gaps in it is a shop display; a gap
          // is somebody reading, and it is also what lets the next book lean.
          if (gapRoll < 0.06 + 0.05 * h) {
            lastWasGap = true;
            continue;
          }

          // a book beside a gap falls into it — never one standing in a packed run
          const lean = lastWasGap && leanRoll < 0.55 ? (0.1 + leanRoll * 0.28) * (rng() < 0.5 ? 1 : -1) : 0;
          lastWasGap = false;
          // and the odd one is pulled out an inch toward the aisle
          const proud = proudRoll < 0.09 ? 0.05 + proudRoll * 0.3 : 0;
          /**
           * WHERE THE BOARD IS. Everything on this row is seated off this line
           * and nothing is positioned from `shelfY` directly.
           *
           * `shelfY` is the centre of a FULL-height book, and the books are
           * scaled to between 0.7 and 1.28 of that. Anything placed at `shelfY`
           * with sy < 1 therefore has its foot above the board and stands in
           * mid-air — a short book floated by up to 7 cm, which is most of the
           * gap between two rows and plainly visible from the aisle.
           */
          const boardY = shelfY - 0.475;
          /**
           * EVERY BOOK ON THIS ROW STANDS UP. There is no flat-laid case.
           *
           * There used to be one, and it could not be made to behave. Tipped
           * 90° about the aisle normal, what runs along the shelf is the book's
           * HEIGHT — up to 1.2 m, or five of this bay's 0.26 m spine stations —
           * so a flat book has to reserve a stretch of row that the filler,
           * the leaning books, the reserved grimoire slots and the archive
           * blocks all place into independently. Every version of that
           * bookkeeping left some neighbour standing inside a flat volume.
           * The prop was never worth the class of bug it kept producing.
           */
          // a book stands ON the board: its centre is half its own height up,
          // whatever that height happens to be
          const half = 0.475 * sy;
          // and a leaning book pivots on that centre, so its bottom corner
          // would swing down through the board — lift it by what the tilt costs
          const lift = half * Math.cos(lean) + 0.11 * sx * Math.abs(Math.sin(lean)) - half;
          // a proud book is pulled OUT toward the aisle rather than made
          // deeper: scaling its depth would push it back through the case
          dummy.position.set(
            bay.x + ux * off - nx * bay.wall * proud,
            boardY + half + lift,
            bay.z + uz * off - nz * bay.wall * proud,
          );
          dummy.rotation.set(0, bay.rotY + jitter, lean);
          dummy.scale.set(sx, sy, 1);
          dummy.updateMatrix();

          color.set(tone);
          color.offsetHSL(0, 0, lum);
          // HEIGHT GRADING: darker, greyer and dustier the further up the case.
          // `lerp` toward a cold dust grey does the desaturation and the dust in
          // one step — a shelf that is merely darker still looks like a shelf
          // with the lights off, where one that has lost its colour looks like
          // a shelf nobody has taken a cloth to since the last century.
          color.multiplyScalar(1 - 0.34 * h);
          color.lerp(DUST, 0.3 * h);

          const bucket = buckets[bandOf(s) * SPINE_DESIGNS + design];
          bucket.m.push(...dummy.matrix.elements);
          bucket.c.push(color.r, color.g, color.b);
        }

        // the archive block: boxes standing on the board, and rolled maps and
        // charts laid in front of them
        if (archive > 0) {
          const span = archive * (bay.w - 0.7);
          const c0 = -bay.w / 2 + 0.35 + (archiveAt - archive * 0.5) * (bay.w - 0.7);
          const nBox = Math.max(1, Math.round(span / 0.5));
          for (let k = 0; k < nBox; k++) {
            const off = c0 + ((k + 0.5) / nBox) * span;
            const sy2 = 0.85 + rng() * 0.45;
            dummy.position.set(bay.x + ux * off, shelfY - 0.475 + 0.17 * sy2, bay.z + uz * off);
            dummy.rotation.set(0, bay.rotY + (rng() - 0.5) * 0.09, 0);
            dummy.scale.set(0.8 + rng() * 0.5, sy2, 0.9 + rng() * 0.2);
            dummy.updateMatrix();
            boxes.m.push(...dummy.matrix.elements);
            color.set(k % 3 === 0 ? '#6b5a48' : k % 3 === 1 ? '#4f4438' : '#7a6449');
            color.multiplyScalar(1 - 0.3 * h);
            color.lerp(DUST, 0.32 * h);
            boxes.c.push(color.r, color.g, color.b);
          }
          // rolled maps lying in front of the boxes, a few stacked on each other
          const nRoll = Math.max(2, Math.round(span / 0.34));
          for (let k = 0; k < nRoll; k++) {
            const off = c0 + ((k + 0.5) / nRoll) * span + (rng() - 0.5) * 0.05;
            const tier = rng() < 0.3 ? 1 : 0;
            dummy.position.set(
              bay.x + ux * off,
              shelfY - 0.475 + 0.06 + tier * 0.105,
              bay.z + uz * off,
            );
            // laid along the shelf run: rotate the cylinder's axis onto it
            dummy.rotation.set(0, bay.rotY + (rng() - 0.5) * 0.12, Math.PI / 2);
            dummy.scale.set(0.8 + rng() * 0.5, 0.75 + rng() * 0.5, 0.8 + rng() * 0.5);
            dummy.updateMatrix();
            rolls.m.push(...dummy.matrix.elements);
            color.set('#9b8e6f');
            color.offsetHSL(0, 0, (rng() - 0.5) * 0.12);
            color.multiplyScalar(1 - 0.3 * h);
            color.lerp(DUST, 0.34 * h);
            rolls.c.push(color.r, color.g, color.b);
          }
        }
      }
    }
    const pack = (b: { m: number[]; c?: number[] }) => ({
      m: new Float32Array(b.m),
      c: b.c ? new Float32Array(b.c) : null,
      n: b.m.length / 16,
    });
    return { buckets: buckets.map(pack), frames: pack(frames), boxes: pack(boxes), rolls: pack(rolls) };
  }, [bays]);

  /** hand a pre-computed bucket straight to an InstancedMesh's buffers */
  const fill = (mesh: THREE.InstancedMesh | null, b: { m: Float32Array; c: Float32Array | null }) => {
    if (!mesh) return;
    mesh.instanceMatrix.array.set(b.m);
    mesh.instanceMatrix.needsUpdate = true;
    if (b.c) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(b.c, 3);
      mesh.instanceColor.needsUpdate = true;
    }
  };

  /**
   * The bindings' photographic grounds land after the first frame, and they are
   * repainted into the SAME canvas the sheet was baked on (see `spineSheet`).
   * The materials therefore need nothing rebuilt — but each of these maps is a
   * clone, and a clone shares the image while keeping its own upload state, so
   * every one of them has to be told the pixels moved or the stacks keep
   * rendering the painted stand-in for the rest of the session.
   */
  useEffect(
    () =>
      onSpineScansReady(() => {
        for (const m of bookMats) {
          if (m.map) m.map.needsUpdate = true;
          if (m.emissiveMap) m.emissiveMap.needsUpdate = true;
        }
      }),
    [bookMats],
  );

  useLayoutEffect(
    () => () => {
      [bookGeom, frameGeom, boxGeom, rollGeom].forEach((g) => g.dispose());
      [frameMat, boxMat, rollMat, ...bookMats].forEach((m) => m.dispose());
    },
    [bookGeom, bookMats, frameGeom, frameMat, boxGeom, boxMat, rollGeom, rollMat],
  );

  return (
    <group>
      <instancedMesh
        ref={(m) => fill(m, placed.frames)}
        args={[frameGeom, frameMat, Math.max(1, placed.frames.n)]}
      />
      {placed.buckets.map((b, i) =>
        b.n === 0 ? null : (
          <instancedMesh key={i} ref={(m) => fill(m, b)} args={[bookGeom, bookMats[i], b.n]} />
        ),
      )}
      {placed.boxes.n > 0 && (
        <instancedMesh ref={(m) => fill(m, placed.boxes)} args={[boxGeom, boxMat, placed.boxes.n]} />
      )}
      {placed.rolls.n > 0 && (
        <instancedMesh ref={(m) => fill(m, placed.rolls)} args={[rollGeom, rollMat, placed.rolls.n]} />
      )}
    </group>
  );
}

/* ————— the grimoires ————— */
/** one instanced flock of grimoires per colour — two draw calls for the whole
 *  library instead of one per book. Picking and the hover ease-out go through
 *  ManualPicker's instanceId path; matrices only recompose while animating. */
interface GrimoireFlock {
  list: Grimoire[];
  /** unit direction each book eases along (toward its aisle) */
  dirs: [number, number][];
  offsets: Float32Array;
  targets: Float32Array;
}

function makeFlock(list: Grimoire[]): GrimoireFlock {
  return {
    list,
    dirs: list.map((g) => {
      const { nx, nz } = wingAxis(g.angle);
      return [nx * -g.wall, nz * -g.wall];
    }),
    offsets: new Float32Array(list.length),
    targets: new Float32Array(list.length),
  };
}

function Grimoires({
  selectedId,
  still,
  onSelect,
}: {
  selectedId: string | null;
  still: boolean;
  onSelect: (id: string) => void;
}) {
  const labelRefs = useRef(new Map<string, THREE.Group>());
  /** scratch vectors for the per-frame gaze test — never allocated in-loop */
  const gazeDir = useMemo(() => new THREE.Vector3(), []);
  const toBook = useMemo(() => new THREE.Vector3(), []);
  /** two kinds of books, two colours, and the colour is a promise about the
   *  DOOR the book opens — not about what the book is:
   *  - crimson — there is a scan on the Internet Archive, and opening this
   *    volume puts the original page in front of you
   *  - violet — the door is a Wikipedia article */
  /**
   * The two bindings, and why they are lit where the filler is not.
   *
   * An earlier pass hid these: emissive down at 0.07, and violet and crimson
   * seeded through the filler palette so that a coloured spine meant nothing.
   * The intent was that a visitor should DISCOVER a book rather than be handed
   * a list of the buttons on each shelf. In practice the readable volumes
   * became indistinguishable from the four thousand inert ones around them, and
   * somebody walking a hall had no way of knowing there was anything to open.
   *
   * So the two hues are now RESERVED — the filler carries neither (see
   * `MegaShelves`) — and they are lit like lamps rather than like bindings.
   * Two colours, one meaning each, legible from the far end of a wing.
   *
   * WHAT THE COLOUR PROMISES is the door, and this is the whole of the rule:
   * crimson means there is a scan of the original on the Internet Archive and
   * you are about to be handed the page itself; violet means the door is a
   * Wikipedia article. So the split below asks `archiveTextFor`, the same
   * function the reading dock asks when it decides which link to offer, and the
   * spine cannot promise a door the dock will not open.
   *
   * It used to split on `entity.type === 'work'` — on whether the thing IS a
   * book — which is a different question with a badly different answer: 257
   * entities are works and only 65 of them have a verified scan, so 192 crimson
   * spines opened onto Wikipedia. Most of a wing's crimson was lying. Being a
   * real book is not the same as having a readable original, and the shelves
   * are full of the difference: the Ramsay Oration, the Cipher Manuscripts, and
   * the whole Academic Study wing, which is in copyright and links out to
   * articles like everything else.
   *
   * Every close-range cue still sits on top of this: the book leans toward you
   * as you pass (the curiosity term in the frame loop), its title comes up when
   * you look at it, and it lifts under the cursor.
   */
  const materials = useMemo(() => {
    /**
     * They wear the shelf's own BINDING, so the colour is doing the work alone.
     *
     * These carried a plain leather grain once, which made a grimoire a flat
     * slab between four thousand volumes with raised cords and gilt panels —
     * different in surface as well as hue, and cheap-looking for it. Column 2
     * of the spine sheet is the gilt-tooled panel, the finest binding on the
     * shelf and a fair thing for the museum's own texts to be in. What marks
     * these out is the reserved hue and the light in it, not a different
     * texture.
     */
    const bound = () => {
      const t = spineSheet().clone();
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1 / SPINE_DESIGNS, 1);
      t.offset.set(SPINE_GILT_COLUMN / SPINE_DESIGNS, 0);
      t.needsUpdate = true;
      return t;
    };
    const m = new Map<'synopsis' | 'text', THREE.MeshStandardMaterial>();
    // the emissive carries the BINDING as its map, not a flat wash. Lighting a
    // plain emissive at 0.55 floods the spine to a single value and the gilt
    // tooling, the raised cords and the panel all disappear — the book reads as
    // a coloured slab wedged in the row. Driven through the same texture the
    // spine stays as bright but keeps every line on it.
    const lit = (map: THREE.Texture, color: string, emissive: string) =>
      new THREE.MeshStandardMaterial({
        map,
        color: new THREE.Color(color),
        emissive: new THREE.Color(emissive),
        emissiveMap: map,
        emissiveIntensity: 0.8,
        roughness: 0.55,
      });
    m.set('synopsis', lit(bound(), '#8f6cff', '#9b7cff'));
    m.set('text', lit(bound(), '#d63a3a', '#ff5140'));
    return m;
  }, []);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);
  // these are clones of the shared sheet too, so they need the same nudge when
  // the photographic grounds land — see the note on the stacks' own subscription
  useEffect(
    () =>
      onSpineScansReady(() => {
        for (const m of materials.values()) {
          if (m.map) m.map.needsUpdate = true;
          if (m.emissiveMap) m.emissiveMap.needsUpdate = true;
        }
      }),
    [materials],
  );
  // sized like its shelf-mates: a spine among spines, just one that glows
  const geometry = useMemo(() => new THREE.BoxGeometry(0.24, 0.97, 0.32), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const flocks = useMemo(
    () => ({
      synopsis: makeFlock(GRIMOIRES.filter((g) => !archiveTextFor(g.entity))),
      text: makeFlock(GRIMOIRES.filter((g) => !!archiveTextFor(g.entity))),
    }),
    [],
  );
  const flockIndex = useMemo(() => {
    const m = new Map<string, { kind: 'synopsis' | 'text'; i: number }>();
    for (const kind of ['synopsis', 'text'] as const)
      flocks[kind].list.forEach((g, i) => m.set(g.entity.id, { kind, i }));
    return m;
  }, [flocks]);
  const meshes = useRef<{ synopsis: THREE.InstancedMesh | null; text: THREE.InstancedMesh | null }>({
    synopsis: null,
    text: null,
  });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const selectedRef = useRef(selectedId);
  const hoveredRef = useRef<{ kind: 'synopsis' | 'text'; i: number } | null>(null);
  /** ids the visitor has already read — their spines stay warmed with gold,
   *  seeded from the persisted library card so the memory survives visits */
  const visited = useRef(new Set<string>(useProgress.getState().read));
  const spineTints = useMemo(
    () => ({ plain: new THREE.Color(1, 1, 1), read: new THREE.Color(1.5, 1.28, 0.92) }),
    [],
  );

  const composeAll = (kind: 'synopsis' | 'text') => {
    const mesh = meshes.current[kind];
    if (!mesh) return;
    const f = flocks[kind];
    for (let i = 0; i < f.list.length; i++) composeOne(kind, i);
    mesh.instanceMatrix.needsUpdate = true;
  };
  const composeOne = (kind: 'synopsis' | 'text', i: number) => {
    const mesh = meshes.current[kind];
    if (!mesh) return;
    const f = flocks[kind];
    const g = f.list[i];
    const off = f.offsets[i];
    dummy.position.set(g.pos.x + f.dirs[i][0] * off, g.pos.y, g.pos.z + f.dirs[i][1] * off);
    dummy.rotation.set(0, g.rotY, 0);
    const s = selectedRef.current === g.entity.id ? 0.0001 : 1;
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  };

  // the opened book vanishes from the shelf (it is flying to the reader) and
  // is remembered: read spines keep a warm gilt cast ever after
  useEffect(() => {
    selectedRef.current = selectedId;
    composeAll('synopsis');
    composeAll('text');
    if (selectedId && !visited.current.has(selectedId)) {
      visited.current.add(selectedId);
      useProgress.getState().markRead(selectedId);
      const at = flockIndex.get(selectedId);
      const mesh = at && meshes.current[at.kind];
      if (at && mesh) {
        mesh.setColorAt(at.i, spineTints.read);
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const bindFlock = (kind: 'synopsis' | 'text') => (m: THREE.InstancedMesh | null) => {
    const prev = meshes.current[kind];
    if (prev) unregisterPickable(prev);
    meshes.current[kind] = m;
    if (!m) return;
    const f = flocks[kind];
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // one bounding sphere for the whole flock — instance culling would use the
    // single book's bounds and wrongly cull the lot
    m.frustumCulled = false;
    composeAll(kind);
    for (let i = 0; i < f.list.length; i++)
      m.setColorAt(i, visited.current.has(f.list[i].entity.id) ? spineTints.read : spineTints.plain);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    registerPickable(m, {
      maxDist: 14,
      onInstancePick: (i) => {
        const g = f.list[i];
        if (g) onSelect(g.entity.id);
      },
      onInstanceHover: (i) => {
        hoveredRef.current = i != null && f.list[i] ? { kind, i } : null;
      },
    });
  };

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (!still) {
      /**
       * The BREATH: a candle's worth of unsteadiness on a lit binding.
       *
       * This ran at `0.3 + sin(t · 1.6) · 0.12` once — every readable book in
       * eight halls pulsing, and pulsing IN TIME WITH EACH OTHER, which read as
       * a row of controls rather than a shelf. The amplitude here is a tenth of
       * that against a much higher floor: the spines are plainly lit, but the
       * flicker is small enough to pass for candlelight on morocco rather than
       * a synchronised blink.
       */
      const breath = 0.8 + Math.sin(t * 1.6) * 0.06;
      materials.forEach((m) => {
        m.emissiveIntensity = breath;
      });
    }
    // titles show only for the books the reader is actually LOOKING at — a
    // narrow gaze cone rather than a distance bubble. A 9.5 m bubble lit
    // dozens of labels at once and the shelves read as a wall of text.
    state.camera.getWorldDirection(gazeDir);
    const hov = hoveredRef.current;
    for (const kind of ['synopsis', 'text'] as const) {
      const f = flocks[kind];
      const mesh = meshes.current[kind];
      if (!mesh) continue;
      let dirty = false;
      for (let i = 0; i < f.list.length; i++) {
        const g = f.list[i];
        const dist = state.camera.position.distanceTo(g.pos);
        const label = labelRefs.current.get(g.entity.id);
        if (label) {
          // in view = near, AND within ~15° of the view axis (wider up close,
          // so titles don't flicker off while reading a shelf at arm's length)
          toBook.copy(g.pos).sub(state.camera.position).normalize();
          const cone = dist < 3 ? 0.86 : 0.966;
          label.visible = dist < 8.5 && toBook.dot(gazeDir) > cone;
        }
        // curious shelves: spines lean a few centimetres toward a passing
        // reader; the hovered one steps fully out of the row
        const curiosity = dist < 3.4 ? ((3.4 - dist) / 3.4) * 0.05 : 0;
        f.targets[i] = hov && hov.kind === kind && hov.i === i ? 0.1 : curiosity;
        const d = f.targets[i] - f.offsets[i];
        if (Math.abs(d) < 0.0015) continue;
        f.offsets[i] = THREE.MathUtils.damp(f.offsets[i], f.targets[i], 12, delta);
        composeOne(kind, i);
        dirty = true;
      }
      if (dirty) mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh
        ref={bindFlock('synopsis')}
        args={[geometry, materials.get('synopsis'), flocks.synopsis.list.length]}
      />
      <instancedMesh
        ref={bindFlock('text')}
        args={[geometry, materials.get('text'), flocks.text.list.length]}
      />
      {GRIMOIRES.map((g) => {
        const { nx, nz } = wingAxis(g.angle);
        const out = -g.wall; // toward the aisle
        return (
          <group
            key={g.entity.id}
            position={g.pos}
            ref={(el) => {
              if (el) labelRefs.current.set(g.entity.id, el);
            }}
            visible={false}
          >
            <TextSprite position={[nx * out * 0.42, 0.8, nz * out * 0.42]} height={0.27} color="#f6ecd9" maxWidthPx={760}>
              {g.entity.name}
            </TextSprite>
          </group>
        );
      })}
    </group>
  );
}

/* ————— threads of influence between open books ————— */
function RelationThreads({ selectedId }: { selectedId: string | null }) {
  const material = useRef<THREE.LineBasicMaterial>(null);
  const geometry = useMemo(() => {
    if (!selectedId) return null;
    const from = GRIMOIRE_POS.get(selectedId);
    const entity = entityMap.get(selectedId);
    if (!from || !entity) return null;
    const targets = new Set([
      ...entity.relations.map((r) => r.target),
      ...entities.filter((e) => e.relations.some((r) => r.target === selectedId)).map((e) => e.id),
    ]);
    const points: THREE.Vector3[] = [];
    const colors: number[] = [];
    const SAMPLES = 22;
    // Every thread starts at the shelf the reader is standing at, so drawn at
    // full strength they all converge on the eye and read as scratches across
    // the lens rather than as arcs over the hall. Fade by DISTANCE FROM THAT
    // SHELF rather than by position along the curve: a thread to a near
    // neighbour is close to the viewer for its whole length and should stay
    // out of the way, while a thread across the hall only appears once it is
    // far enough off to be seen as an arc. Under additive blending a black
    // vertex contributes nothing, so faded means genuinely absent.
    const NEAR = 5;
    const FULL = 11;
    const base = new THREE.Color('#ffd9a0');
    const push = (p: THREE.Vector3) => {
      points.push(p);
      const f = THREE.MathUtils.smoothstep(p.distanceTo(from), NEAR, FULL);
      colors.push(base.r * f, base.g * f, base.b * f);
    };
    for (const t of targets) {
      const to = GRIMOIRE_POS.get(t);
      if (!to) continue;
      const mid = from.clone().add(to).multiplyScalar(0.5);
      mid.y += from.distanceTo(to) * 0.28 + 1.5;
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      const samples = curve.getPoints(SAMPLES);
      for (let i = 0; i < samples.length - 1; i++) {
        push(samples[i]);
        push(samples[i + 1]);
      }
    }
    if (points.length === 0) return null;
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, [selectedId]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  useFrame((state) => {
    if (material.current) material.current.opacity = 0.38 + Math.sin(state.clock.elapsedTime * 2.2) * 0.16;
  });
  if (!geometry) return null;
  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        ref={material}
        vertexColors
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* ————— the open book ————— */

/**
 * The surface of a leaf.
 *
 * This was a `meshBasicMaterial` with `toneMapped={false}`, which is why the
 * open book looked like a lit screen someone had propped in the room: every
 * page rendered at full value regardless of where the visitor stood or what
 * the light in the hall was doing. It is a STANDARD material now, so the
 * book's own reading light rakes across it — but the map is also fed back in
 * as an emissive at low intensity, because a page you cannot read in a dim
 * rotunda is a worse bug than a flat one. Roughness is near 1: old rag paper
 * has no specular sheen to speak of, and the map doubles as a faint bump so
 * the fibre and the foxing catch the raking light.
 */
function PageMaterial({ map }: { map: THREE.Texture }) {
  return (
    <meshStandardMaterial
      map={map}
      emissiveMap={map}
      emissive="#ffffff"
      emissiveIntensity={0.34}
      bumpMap={map}
      bumpScale={0.012}
      roughness={0.96}
      metalness={0}
    />
  );
}

/** the open spread's half-extents in metres, at the held scale (1.34) below */
const BOOK_HALF_W = 0.48 * 1.34;
const BOOK_HALF_H = 0.34 * 1.34;
/** a little air around it — a page whose edge is on the frame reads as cropped */
const BOOK_MARGIN = 1.14;

function OpenBook({ entityId, pages, spread }: { entityId: string; pages: HTMLCanvasElement[]; spread: number }) {
  const entity = entityMap.get(entityId)!;
  const group = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const shelfPos = GRIMOIRE_POS.get(entityId) ?? new THREE.Vector3(0, 2, 0);

  const textures = useMemo(
    () =>
      pages.map((canvas) => {
        const t = new THREE.CanvasTexture(canvas);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        return t;
      }),
    [pages],
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  const leftPivot = useRef<THREE.Group>(null);
  const rightPivot = useRef<THREE.Group>(null);
  const anchor = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    progress.current = THREE.MathUtils.damp(progress.current, 1, 3.2, delta);
    const t = progress.current;
    state.camera.getWorldDirection(dir);
    // HOW FAR OUT THE BOOK IS HELD IS NOT A CONSTANT.
    //
    // At 1.1 m the spread filled a landscape window nicely and ran off both
    // edges of an upright phone — the outer third of each page, which is
    // where the text ends, was simply not on screen. So hold it at whatever
    // distance the open spread actually fits at, and never nearer than the
    // 1.1 the desk view was tuned to.
    const cam = state.camera as THREE.PerspectiveCamera;
    const halfV = Math.tan(((cam.fov * Math.PI) / 180) / 2);
    const halfH = halfV * cam.aspect;
    const fit = Math.max(
      (BOOK_HALF_W * BOOK_MARGIN) / halfH,
      (BOOK_HALF_H * BOOK_MARGIN) / halfV,
    );
    anchor.copy(state.camera.position).addScaledVector(dir, Math.max(1.1, fit));
    // sits higher than it used to: the book is bigger now, and at the old
    // height its foot ran under the action bar
    anchor.y += -0.04 + Math.sin(state.clock.elapsedTime * 0.9) * 0.01;
    if (group.current) {
      group.current.position.lerpVectors(shelfPos, anchor, t);
      group.current.quaternion.slerp(state.camera.quaternion, Math.min(1, t * 1.4));
      group.current.rotateX(-0.15);
      // held a little closer and a good deal bigger than it used to be: the
      // page is a 760px texture read across a lit room, and at the old size
      // the body copy was down near the limit of what the display can resolve
      group.current.scale.setScalar((0.35 + 0.65 * t) * 1.34);
    }
    const v = 1.45 - 1.24 * t;
    if (leftPivot.current) leftPivot.current.rotation.y = v;
    if (rightPivot.current) rightPivot.current.rotation.y = -v;
  });

  const leftTex = textures[spread * 2];
  const rightTex = textures[spread * 2 + 1];
  const coverColor = useMemo(
    () => new THREE.Color(CLUSTER_META[entity.cluster].color).multiplyScalar(0.4),
    [entity.cluster],
  );

  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={[0.05, 0.68, 0.045]} />
        <meshStandardMaterial color={coverColor} map={leather()} roughness={0.6} />
      </mesh>
      <group ref={leftPivot}>
        <mesh position={[-0.24, 0, -0.012]}>
          <boxGeometry args={[0.48, 0.68, 0.02]} />
          <meshStandardMaterial color={coverColor} map={leather()} roughness={0.6} />
        </mesh>
        {/* the leaves under the one you are reading — without this the open
            page is a decal floating on the board */}
        <mesh position={[-0.238, 0, -0.0015]}>
          <boxGeometry args={[0.462, 0.652, 0.015]} />
          <meshStandardMaterial color="#cdb98f" roughness={0.95} metalness={0} />
        </mesh>
        {leftTex && (
          <mesh position={[-0.235, 0, 0.0065]}>
            <planeGeometry args={[0.45, 0.635]} />
            <PageMaterial map={leftTex} />
          </mesh>
        )}
      </group>
      <group ref={rightPivot}>
        <mesh position={[0.24, 0, -0.012]}>
          <boxGeometry args={[0.48, 0.68, 0.02]} />
          <meshStandardMaterial color={coverColor} map={leather()} roughness={0.6} />
        </mesh>
        <mesh position={[0.238, 0, -0.0015]}>
          <boxGeometry args={[0.462, 0.652, 0.015]} />
          <meshStandardMaterial color="#cdb98f" roughness={0.95} metalness={0} />
        </mesh>
        {rightTex && (
          <mesh position={[0.235, 0, 0.0065]}>
            <planeGeometry args={[0.45, 0.635]} />
            <PageMaterial map={rightTex} />
          </mesh>
        )}
      </group>
      <pointLight position={[0, 0.5, 0.6]} color="#ffd9a0" intensity={2.2} distance={3} decay={2} />
    </group>
  );
}

/* ————— section marks: the sigil overhead, the sign on its bracket ————— */
function SectionMarks() {
  /**
   * The sigil overhead, with its name under it.
   *
   * The name-plate was taken away once, on the argument that a carved board on
   * a bracket (`WingSigns`) is an object in the building where a floating
   * caption is a label laid over it. That is true of a big building. This one
   * is small: the board hangs at 4.35 m on the wall of the hall, so from the
   * rotunda floor you get a glowing symbol with nothing to tell you what it
   * means, and you have to walk into a corridor to find out which corridor it
   * is. Wayfinding you have to walk into is not wayfinding.
   *
   * So the name is back under the sigil, and both are treated as SIGNAGE:
   * `noCull` keeps them out of PropCulling's glow budget. They are the only
   * wayfinding in eight identical forty-six-metre corridors, and a symbol that
   * blinks out because the room behind it got busy reads as a bug — which is
   * exactly what it looked like when the budget was allowed to rank them.
   */
  return (
    <group>
      {SECTIONS.map((s) => {
        const [x, z] = wingPoint(s.angle, s.uCenter, 0);
        return (
          <group key={s.cluster} position={[x, 0, z]}>
            <sprite position={[0, 8.6, 0]} scale={[3.2, 3.2, 1]} userData={{ noCull: true }}>
              <spriteMaterial
                map={getSigilTexture(s.cluster, CLUSTER_META[s.cluster].color)}
                transparent
                opacity={0.55}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
            {/* sits just clear of the sigil's lower edge (centre 8.6, half 1.6) */}
            <TextSprite position={[0, 6.75, 0]} height={0.42} color="#e9dcc0" maxWidthPx={900}>
              {CLUSTER_META[s.cluster].label}
            </TextSprite>
          </group>
        );
      })}
    </group>
  );
}

/* ————— glyph motes: faint planetary symbols rising in the moonlight ————— */
const GLYPHS = ['☿', '☉', '☽', '♄', '♃', '♀', '♂', '✶'];
const glyphCache = new Map<string, THREE.CanvasTexture>();
function glyphTexture(ch: string): THREE.CanvasTexture {
  const hit = glyphCache.get(ch);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.font = '600 62px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe0b0';
  ctx.shadowColor = '#ffd9a0';
  ctx.shadowBlur = 12;
  ctx.fillText(ch, 48, 52);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  glyphCache.set(ch, tex);
  return tex;
}

function GlyphMotes({ still }: { still: boolean }) {
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const seeds = useMemo(() => {
    const rng = mulberry32(888);
    return Array.from({ length: 12 }, () => ({
      off: rng(),
      r: 1 + rng() * 2.4,
      a: rng() * Math.PI * 2,
      spin: 0.12 + rng() * 0.2,
      ch: GLYPHS[Math.floor(rng() * GLYPHS.length)],
    }));
  }, []);
  useFrame((state) => {
    if (still) return;
    const t = state.clock.elapsedTime;
    sprites.current.forEach((s, i) => {
      if (!s) return;
      const seed = seeds[i];
      const k = (t * 0.045 + seed.off) % 1;
      const a = seed.a + t * seed.spin;
      s.position.set(Math.cos(a) * seed.r, 2 + k * 16, Math.sin(a) * seed.r);
      (s.material as THREE.SpriteMaterial).opacity = 0.5 * Math.sin(Math.PI * k);
    });
  });
  return (
    <group>
      {seeds.map((seed, i) => (
        <sprite
          key={i}
          ref={(s) => {
            sprites.current[i] = s;
          }}
          scale={[0.5, 0.5, 1]}
        >
          <spriteMaterial map={glyphTexture(seed.ch)} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  );
}

/* ————— moonbeam, moon ————— */

const SHAFT_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const SHAFT_FRAG = /* glsl */ `
varying vec2 vUv;
uniform vec3 uColor;
void main() {
  // vUv.y: 0 at the floor, 1 at the eye of the dome.
  //
  // The shaft used to be a straight-sided plane that simply STOPPED at its top
  // edge with a third of its brightness still on — a bright column ending in
  // mid-air five metres under the opening. Two things fix that: the geometry now
  // reaches the oculus, and the alpha is taken to zero at BOTH ends here, so the
  // column resolves out of the dark rather than being cut off.
  float y = vUv.y;
  // a slight taper — narrow where it leaves the opening, spreading as it falls
  float halfW = mix(0.5, 0.42, y);
  float d = abs(vUv.x - 0.5) / halfW;
  float across = smoothstep(1.0, 0.2, d);
  // held bright through the middle, faded out into the opening above and
  // dissolved into the floor pool below
  float along = smoothstep(0.0, 0.5, y) * smoothstep(1.0, 0.88, y);
  gl_FragColor = vec4(uColor, across * along * 0.065);
}
`;

/** the column of moonlight through the oculus — a cool shaft that pools on the
 *  heart of the rotunda, the counter-note to the warm hearth so the hall has
 *  real light-and-shadow instead of an even brown wash */
function OculusBeam() {
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color('#e7e2f2') } }), []);
  return (
    <group>
      {/* the physical cool key light falling straight down the oculus; its
          default target sits at the group origin, so it lands on the globe */}
      <spotLight
        position={[0, 27, 0]}
        angle={0.34}
        penumbra={0.92}
        intensity={78}
        distance={44}
        decay={1.35}
        color="#c8d4f2"
      />
      {[0, Math.PI / 2].map((ry) => (
        <mesh key={ry} position={[0, ROT_DOME_TOP / 2, 0]} rotation-y={ry}>
          {/* spans floor → oculus (0 … ROT_DOME_TOP): the shaft has to arrive
              somewhere and leave from somewhere, or it reads as a prop */}
          <planeGeometry args={[9.6, ROT_DOME_TOP]} />
          <shaderMaterial vertexShader={SHAFT_VERT} fragmentShader={SHAFT_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {/* the bright landing pool the shaft casts on the floor */}
      <sprite position={[0, 0.35, 0]} scale={[11, 5.5, 1]}>
        <spriteMaterial map={getGlowTexture()} color="#d7dcf0" transparent opacity={0.09} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
}

/**
 * The face of the moon, painted rather than photographed — same rule as every
 * other texture in the building: offline, self-contained, no download.
 *
 * What was here was a flat cream disc, which from the floor read as a hole cut
 * in the sky. A real moon has four things this draws, in order:
 *
 *   MARIA        the dark basalt seas. They are the whole silhouette — the
 *                thing that makes a disc read as THE moon and not as a lamp.
 *                Placed to the near-side arrangement: Imbrium and Serenitatis
 *                upper left, Tranquillitatis and Fecunditatis at the centre,
 *                Oceanus Procellarum down the western limb.
 *   CRATERS      bright-rimmed pits, denser over the southern highlands where
 *                the real ones are, each with a lit edge and a shadowed floor.
 *   RAYS         the splash of pale ejecta out of Tycho, low and centre. It is
 *                the single most recognisable feature on the face.
 *   LIMB         the edge darkens and then goes transparent, so the disc has a
 *                soft rim instead of a cut-out's hard one.
 */
function moonTexture(): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const R = S / 2;
  const rng = mulberry32(4077);

  ctx.clearRect(0, 0, S, S);
  ctx.save();
  // everything is clipped to the disc, so nothing has to be drawn carefully
  ctx.beginPath();
  ctx.arc(R, R, R - 1, 0, Math.PI * 2);
  ctx.clip();

  // the regolith ground, very slightly warm
  ctx.fillStyle = '#d9d5c6';
  ctx.fillRect(0, 0, S, S);

  // ——— maria ———
  // Each sea is several overlapping ellipses, not one: a single soft ellipse
  // reads as a smudge, and the real basins have lobed, irregular coasts that
  // are most of what makes the face recognisable at a glance.
  const maria: [number, number, number, number][] = [
    [0.38, 0.24, 0.17, 4], // Imbrium — the big one, upper left
    [0.58, 0.26, 0.11, 3], // Serenitatis
    [0.63, 0.42, 0.12, 4], // Tranquillitatis
    [0.75, 0.54, 0.08, 3], // Fecunditatis
    [0.55, 0.60, 0.07, 2], // Nubium
    [0.20, 0.44, 0.18, 5], // Procellarum, down the western limb
    [0.27, 0.68, 0.10, 3],
    [0.72, 0.20, 0.05, 2], // Frigoris, up on the shoulder
  ];
  for (const [mx, my, mr, lobes] of maria) {
    for (let k = 0; k < lobes; k++) {
      const off = (k / Math.max(1, lobes)) * Math.PI * 2 + rng();
      const spread = k === 0 ? 0 : mr * S * (0.35 + rng() * 0.45);
      const x = mx * S + Math.cos(off) * spread;
      const y = my * S + Math.sin(off) * spread * 0.8;
      const r = mr * S * (k === 0 ? 1 : 0.5 + rng() * 0.4);
      const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
      g.addColorStop(0, 'rgba(126,127,132,0.62)');
      g.addColorStop(0.65, 'rgba(133,133,136,0.42)');
      g.addColorStop(1, 'rgba(150,148,142,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r * (0.8 + rng() * 0.45), r, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ——— Tycho's rays, under the craters so the pits sit on top ———
  // Short, thin and few. The first cut had twenty-two long ones and it read as
  // a starburst decal rather than as ejecta.
  const tx = 0.44 * S;
  const ty = 0.79 * S;
  for (let i = 0; i < 13; i++) {
    const a = rng() * Math.PI * 2;
    const len = (0.12 + rng() * 0.34) * S;
    const grad = ctx.createLinearGradient(tx, ty, tx + Math.cos(a) * len, ty + Math.sin(a) * len);
    grad.addColorStop(0, 'rgba(246,244,234,0.30)');
    grad.addColorStop(1, 'rgba(246,244,234,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2 + rng() * 2.4;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + Math.cos(a) * len, ty + Math.sin(a) * len);
    ctx.stroke();
  }

  // ——— craters ———
  // The sun is up and to the left, matching MOON_DIR in lighting.tsx: each pit
  // gets a shadow crescent on its lower right and a lit rim on its upper left.
  // A filled disc plus a full ring — which is what was here — reads as a bubble.
  for (let i = 0; i < 170; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng()) * (R - 6);
    const x = R + Math.cos(a) * d;
    const y = R + Math.sin(a) * d;
    // heavily weighted small: a face of same-sized pits is a texture, not a moon
    const r = 1 + rng() * rng() * rng() * 22;
    const inMare = maria.some(([mx, my, mr]) => Math.hypot(x - mx * S, y - my * S) < mr * S * 0.8);
    // the seas are young basalt and nearly unmarked — skip most pits there
    if (inMare && rng() > 0.18) continue;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    // shadowed floor, offset away from the sun
    ctx.fillStyle = `rgba(108,107,104,${0.16 + rng() * 0.16})`;
    ctx.beginPath();
    ctx.arc(x + r * 0.3, y + r * 0.3, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // the lit rim, a crescent on the sunward side only
    ctx.strokeStyle = `rgba(246,244,233,${0.22 + rng() * 0.22})`;
    ctx.lineWidth = Math.max(0.7, r * 0.13);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.94, Math.PI * 0.95, Math.PI * 1.75);
    ctx.stroke();
  }
  // Tycho itself
  ctx.fillStyle = 'rgba(244,242,232,0.7)';
  ctx.beginPath();
  ctx.arc(tx, ty, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // ——— limb ———
  // Held flat across most of the face and dropping only in the last tenth: the
  // moon is a lit sphere, but a broad vignette turns it into a soft ball of
  // fluff, which is what the first cut looked like.
  const limb = ctx.createRadialGradient(R, R, R * 0.82, R, R, R);
  limb.addColorStop(0, 'rgba(0,0,0,0)');
  limb.addColorStop(1, 'rgba(26,28,40,0.45)');
  ctx.fillStyle = limb;
  ctx.fillRect(0, 0, S, S);
  ctx.restore();

  // a tight alpha edge — enough to kill the clip's staircase, no more
  ctx.globalCompositeOperation = 'destination-in';
  const edge = ctx.createRadialGradient(R, R, R * 0.975, R, R, R);
  edge.addColorStop(0, 'rgba(0,0,0,1)');
  edge.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, S, S);
  ctx.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * The moon.
 *
 * The face is a real photograph — `public/textures/Sky/moon.jpg`, a near-full
 * waning gibbous from NASA/Goddard's Scientific Visualization Studio, built from
 * Lunar Reconnaissance Orbiter data. Public domain, so it ships with the
 * project; credited in docs/MATERIALS.md anyway.
 *
 * It loads the same way every other scan in the building does: the painted
 * `moonTexture()` disc goes up immediately and the photograph replaces it when
 * the file lands, so a checkout with no network still has a moon in the sky.
 *
 * The photograph's background is black, and it is drawn with additive blending —
 * which is both what a self-luminous object in a night sky wants and the reason
 * no alpha channel is needed: black adds nothing, so the square disappears and
 * only the lit disc remains.
 */
function Moon() {
  const painted = useMemo(() => moonTexture(), []);
  const [face, setFace] = useState<THREE.Texture>(painted);

  useEffect(() => {
    let live = true;
    const tex = new THREE.TextureLoader().load(leanPath('/textures/Sky/moon.jpg'), () => {
      if (live) setFace(tex);
      else tex.dispose();
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => () => painted.dispose(), [painted]);

  const photographic = face !== painted;
  return (
    <group position={[6, 66, -8]}>
      <sprite scale={[26, 26, 1]}>
        <spriteMaterial map={getGlowTexture()} color="#dfe6ff" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {/* a sprite, not a facing plane: the moon has to keep its face turned to
          the visitor from anywhere in the building, including the wing windows */}
      <sprite scale={[9.2, 9.2, 1]}>
        <spriteMaterial
          map={face}
          transparent
          depthWrite={false}
          fog={false}
          toneMapped={false}
          // the painted disc carries its own alpha and must composite normally;
          // the photograph is a lit disc on black and wants additive
          blending={photographic ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </sprite>
    </group>
  );
}

/* The Eye of Providence that hung over the Librarian is GONE, and with it
 * `roseWindowTexture()` — a 640×1024 canvas that drew a radiant triangle, the
 * all-seeing eye, and shafts falling from it toward the desk.
 *
 * It was the loudest thing in the building and it was pointed at the quietest
 * station in it. A card catalogue is where you go to ask a question; a
 * five-by-eight-metre unlit-and-toneMapped eye staring down the hall answers
 * one instead. Its glory also fought the Emerald Tablet band directly under
 * it, so the wall made two claims at once and the reader took neither.
 *
 * Do not reinstate it here. The Gloria over the entrance doors
 * (entranceDressing.tsx) is the building's one Eye, it is at the threshold
 * where an emblem of that weight belongs, and it is untouched.
 */

/**
 * The north apse end wall, standing behind the Librarian's station.
 *
 * Nothing here leads out of the world any more. Two remnants of the old
 * Research Hall door lived at this spot and both are gone: a green translucent
 * panel labelled "to the reading rooms", and — worse, because it was invisible
 * — a trip-wire in the rig that fired navigate('/research') the instant you
 * came within 1.6 m of the apse end. Walking up to the Librarian to ask her
 * something threw you out of the library altogether.
 *
 * ————— the 2026-08-05 dressing —————
 *
 * With the Eye gone (see the note above) the wall was seventeen metres of bare
 * panelling with one inscription band across it, which is the state it was in
 * before the Eye was hung and the reason the Eye was hung. What replaces it is
 * the thing a real institution puts at the head of its reading room, and it is
 * three registers deep so the height reads as storeys rather than as one blank
 * face:
 *
 *   · the carved axiom at 4.9, where it already was — the Librarian's lintel;
 *   · above it the house's great canvas, Khunrath's oratory-and-laboratory
 *     plate, in a heavy gilt frame with its own picture lamp (FramedArt, the
 *     same frame the wing galleries hang, so the apse belongs to the same
 *     building);
 *   · a swagged brass valance and a pair of sconces flanking the canvas.
 *
 * The lighting is the aging. One flat 22-intensity point light was washing the
 * whole end wall at even value, which is what made new panelling look new: no
 * light means no soot line, no falloff, no age. It is now TWO warm lights of
 * half that each — one low over the desk, one up under the canvas — plus the
 * unlit flame quads and the additive glow they sit in, so the wall goes gold at
 * the sconces and falls off to nothing in the corners. Net cost: one light.
 */
/** where the carved dado stops and the damask field begins — just clear of the
 *  top of the axiom band at 4.9 + 0.47 */
const DADO_H = 5.6;
/** where the Gloria hangs, and how wide it is drawn. Enlarged 2026-08-05 from
 *  4.0 to 4.8 — bigger and drawn at 2048² so it reads from the rotunda floor,
 *  but held clear of the 6 m-wide wall's edges so the lodge marks can flank it.
 *  The emblem art carries transparent margin, so the bright delta+Name span
 *  ~3.4 m of the 4.8. */
const GLORIA_Y = 8.5;
const GLORIA_W = 4.8;

function ApseWall() {
  /* The Gloria, painted on a transparent canvas — see gloriaArt.ts. It stands
     where Fludd's portrait hung: an emblem the whole hall can read from the
     rotunda, rather than an engraving you have to walk up to. */
  const gloriaTex = useMemo(() => gloriaTexture(), []);
  const gloriaMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: gloriaTex,
        transparent: true,
        toneMapped: false,
        depthWrite: false,
      }),
    [gloriaTex],
  );
  /* the bloom around it — a soft radial wash, additive, hung between the
     artwork and the damask so the glow reads as coming off the wall. Without
     it the emblem is a bright rectangle on a wall exactly as dark as it was:
     a source is a bright thing WITH a gradient around it. */
  const gloriaHaloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getGlowTexture(),
        color: '#ffd79a',
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  /* the flames' wash — the same one the entrance sconces burn, so the two
     halls' candlelight is literally the same texture */
  const flameMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: candleWash(),
        color: '#ffc36a',
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  /* ————— the wall itself, in two registers —————
   *
   * It was one procedural `wallPanels()` canvas tiled 2 × 3.8 up seventeen
   * metres: the same painted arch repeated forty times, flat-lit, with no
   * change of material anywhere between the skirting and the ceiling. That is
   * what made the end of the hall read as wallpaper. A real apse is built in
   * registers, and the two this one wants are the two the rest of the building
   * already owns —
   *
   *   BELOW the axiom band, carved oak panelling, the joinery of the catalogue
   *   bank standing against it carried on up the wall;
   *   ABOVE it — as of 2026-08-05, at the user's request — dressed ashlar
   *   STONE in place of the crimson cut-velvet damask that used to line it.
   *   The red field read as loud and flat down the length of the hall and
   *   fought the gilt emblems hung on it; a dark warm stone lets the Gloria,
   *   the luminaries and the lodge marks be the only bright things on the wall.
   *   (The niches in the drum KEEP their damask — this is only the apse field.)
   *
   * Both are registry surfaces (never inline a material, never dispose one of
   * these) and both are ALREADY resident — the ashlar is the arcade stone and
   * the carved panel is the wing wainscot — so two registers cost no new
   * texture.
   */
  const dadoMat = useMemo(
    () => getMaterial('wood_panel_carved', { repeat: [3, 2.4], overrides: { color: '#7a5c3c' } }),
    [],
  );
  const fieldMat = useMemo(
    () => getMaterial('stone_arcade_ashlar', { repeat: [3, 3.2], overrides: { color: '#6f6152' } }),
    [],
  );
  /* the wall's gilt emblems: the lodge's square-and-compasses and the tree of
     life flanking the Gloria, a sun and a waning moon on the lower flanks. All
     gilt line-work on the dark stone — the "appropriate masonic or esoteric
     things" the bare field asked for. Sigils are cached/shared (do not dispose);
     the two luminary canvases are ours. */
  /* the cloud bank below the Gloria — real geometry now, not a painted smudge:
     a set of soft additive puffs layered across ~0.5 m of depth so the bank has
     volume and catches the Gloria's light along its upper edge. */
  const cloudMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: getGlowTexture(), color: '#f3e8d2', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.NormalBlending, toneMapped: false }),
    [],
  );
  const cloudPuffs = useMemo(() => {
    // an overlapping bank: wider and denser in the middle, thinning to the ends,
    // and staggered in z so the front lobes read proud of the back ones
    const P: { x: number; y: number; z: number; s: number; o: number }[] = [];
    const cols = [-2.6, -1.9, -1.25, -0.65, 0, 0.65, 1.25, 1.9, 2.6];
    cols.forEach((x, i) => {
      const mid = 1 - Math.abs(x) / 2.9; // 0 at ends, 1 in the middle
      const s = 1.5 + mid * 1.7;
      P.push({ x, y: -0.1 + mid * 0.35 + (i % 2) * 0.12, z: 0.28 + (i % 3) * 0.14, s, o: 0.32 + mid * 0.3 });
      // a smaller high lobe catching the light above each big one
      if (i % 2 === 0) P.push({ x: x * 0.9, y: 0.5 + mid * 0.4, z: 0.42, s: s * 0.6, o: 0.24 + mid * 0.22 });
    });
    return P;
  }, []);
  /* the sconces' brass, shared by both of them and by the valance — one
     material for the whole fitting-out rather than three identical ones */
  const brassMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#9c7a38', metalness: 0.72, roughness: 0.42 }),
    [],
  );
  useEffect(
    () => () => {
      // dadoMat and fieldMat belong to the material registry and are NOT ours
      // to dispose. Everything painted or built here IS ours.
      brassMat.dispose();
      flameMat.dispose();
      gloriaMat.dispose();
      gloriaHaloMat.dispose();
      gloriaTex.dispose();
      cloudMat.dispose();
    },
    [brassMat, flameMat, gloriaMat, gloriaHaloMat, gloriaTex, cloudMat],
  );
  return (
    <group position={[0, 0, APSE_Z - 0.2]}>
      {/* ————— the end wall, dado and field —————
          The dado runs to the top of the axiom band; the damask field takes it
          from there to the vault. The string course between them is what makes
          the join read as an intended break rather than as two textures meeting
          — without it the damask looks like it is peeling off the panelling. */}
      <mesh position={[0, DADO_H / 2, -0.3]} material={dadoMat}>
        <boxGeometry args={[APSE_HALF * 2 + 1.4, DADO_H, 0.5]} />
      </mesh>
      <mesh position={[0, (DADO_H + WING_H) / 2, -0.3]} material={fieldMat}>
        <boxGeometry args={[APSE_HALF * 2 + 1.4, WING_H - DADO_H, 0.5]} />
      </mesh>
      <mesh position={[0, DADO_H + 0.07, -0.02]} material={brassMat}>
        <boxGeometry args={[APSE_HALF * 2 + 1.4, 0.14, 0.12]} />
      </mesh>
      <mesh position={[0, DADO_H - 0.06, -0.04]} material={dadoMat}>
        <boxGeometry args={[APSE_HALF * 2 + 1.4, 0.3, 0.16]} />
      </mesh>
      {/* The carved Emerald-Tablet axiom band that used to hang here is GONE
          (2026-08-05, at the user's request): with the catalogue banks now run
          up to the cloud line behind the Librarian, the gilt-framed band read
          as clipping straight through the cabinet wall in front of it. */}

      {/* ————— the cloud bank the Gloria stands out of —————
          Real geometry, layered across half a metre of depth, so it reads as a
          bank with volume rather than the flat painted smudge it used to be.
          It sits BELOW and slightly proud of the emblem, its top lobes catching
          the Gloria's light. Drawn before the Gloria so the delta reads as
          rising out of it. */}
      {cloudPuffs.map((p, i) => (
        <mesh key={i} position={[p.x, GLORIA_Y - 2.75 + p.y, p.z]} material={cloudMat} renderOrder={1}>
          <planeGeometry args={[p.s * 1.7, p.s]} />
        </mesh>
      ))}

      {/* THE GLORIA — the Tetragrammaton in glory over the Eye of Providence in
          its radiant delta. It replaces Fludd's engraved portrait, which read
          as a grey rectangle from the rotunda floor; this is drawn at 2048² as
          gilt engraving so it holds its line down the length of the hall and
          is the thing the whole apse points at. Halo first, artwork proud of
          it, and a light in front of both — a painted plane alone reads as a
          decal. */}
      <mesh position={[0, GLORIA_Y, 0.05]} material={gloriaHaloMat} renderOrder={2}>
        <planeGeometry args={[GLORIA_W * 1.3, GLORIA_W * 1.3]} />
      </mesh>
      <mesh position={[0, GLORIA_Y, 0.14]} material={gloriaMat} renderOrder={3}>
        <planeGeometry args={[GLORIA_W, GLORIA_W]} />
      </mesh>
      <pointLight position={[0, GLORIA_Y - 0.3, 1.5]} color="#ffdca0" intensity={26} distance={11} decay={2} />

      {/* The four gilt marks that flanked the Gloria — the square-and-compasses,
          the tree of life, a sun in splendour and a waning moon — are GONE. The
          wall carries ONE emblem now. Four lodge devices ranged around the
          glory made the end of the apse read as a chart of symbols, and every
          one of them was competing with the thing they were arranged around. */}

      {/* A brass valance over the canvas, and a swag of drapery behind it —
          the moulding that stops a tall wall reading as one uninterrupted
          sheet. Cheap: two boxes and a half-cylinder. */}
      <mesh position={[0, 10.46, 0.28]} material={brassMat}>
        <boxGeometry args={[4.4, 0.14, 0.34]} />
      </mesh>
      <mesh position={[0, 10.22, 0.2]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.16, 0.16, 4.1, 10, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#5c1f26" roughness={0.92} />
      </mesh>

      {/* ————— the sconces —————
          A pair flanking the canvas at the band's height, where a reader's eye
          already is. Bowl, backplate, and a flame on cross-quads (the same
          three-sheet trick the entrance lanterns and the greenery use, so the
          flame keeps a silhouette from every angle without re-facing the
          camera). Unlit and toneMapped:false — a flame is a light source, and
          a tone-mapped one goes brown at this exposure. */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 2.65, 6.15, 0.12]}>
          <mesh position={[0, 0, 0.06]} material={brassMat}>
            <boxGeometry args={[0.44, 0.9, 0.1]} />
          </mesh>
          <mesh position={[0, -0.1, 0.3]} material={brassMat}>
            <cylinderGeometry args={[0.2, 0.09, 0.26, 12]} />
          </mesh>
          {/* the taper, and its flame on cross-quads. The flame needs the
              candle wash on it: a bare coloured plane is a white paper
              rectangle stuck to the wall, which is exactly what the first
              attempt looked like. */}
          <mesh position={[0, 0.19, 0.3]}>
            <cylinderGeometry args={[0.035, 0.035, 0.32, 8]} />
            <meshStandardMaterial color="#e8dcc0" roughness={0.6} />
          </mesh>
          {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a) => (
            <mesh key={a} position={[0, 0.44, 0.3]} rotation-y={a} material={flameMat} renderOrder={3}>
              <planeGeometry args={[0.2, 0.34]} />
            </mesh>
          ))}
          {/* the halo the flame throws onto the panelling behind it — this, not
              a third and fourth point light, is what ages the wall */}
          <sprite position={[0, 0.2, 0.34]} scale={[2.2, 2.6, 1]}>
            <spriteMaterial
              map={getGlowTexture()}
              color="#ffbf72"
              transparent
              opacity={0.34}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}

      {/* Three warm lights where the one flat one was: the desk's, the
          portrait's, and one up in the hall to put the VAULT on. The third is
          not decoration — an unlit barrel is a black trough hanging over the
          room, and the coffers and ribs that make it read as a vault at all
          only exist to the eye when something is grazing across them. It sits
          out in the hall rather than on the wall so the light runs ALONG the
          soffit toward the rotunda, which is the direction that shows the
          coffer grid; sat against the end wall it lit one lune and left the
          rest black.

          None of the three is POOLED (`noPool`): the apse is the one room you
          are meant to see lit FROM the rotunda floor — the Librarian framed
          between the pillars under a vault that reads — and pooled they lost
          their slots the moment the visitor turned away, so the north end of
          the building went black from every angle that matters. They are three
          permanent point lights, paid on every fragment of every material,
          forever. See lightPool.tsx before exempting any more. */}
      <pointLight
        position={[0, 4.2, 2.2]}
        color="#ffdca4"
        intensity={13}
        distance={15}
        decay={1.9}
        userData={{ noPool: true }}
      />
      <pointLight
        position={[0, 8.2, 1.6]}
        color="#ffcf90"
        intensity={11}
        distance={13}
        decay={2}
        userData={{ noPool: true }}
      />
      <pointLight
        position={[0, 12.6, 3.4]}
        color="#ffe0ac"
        intensity={16}
        distance={16}
        decay={1.7}
        userData={{ noPool: true }}
      />
    </group>
  );
}

/* ————— the listener's ears follow the camera through the hall ————— */
function SpatialAudioListener() {
  useFrame(({ camera }) => {
    if (!ambient.running) return;
    ambient.updateListener(camera.position.x, camera.position.z, camera.rotation.y);
  });
  return null;
}

/* ————— adaptive resolution: hold ~60fps by budgeting PIXELS, not ratio —————
 *
 * This used to adapt `dpr` alone, clamped to [0.6, 1.5]. That is the wrong
 * quantity, and it is why going full screen was so much worse than any
 * measurement predicted: dpr is a RATIO, so the pixel count it produces still
 * grows with the window. A 900×600 canvas at the 0.6 floor is 0.19 Mpx; the
 * same floor on a 2560×1440 display is 1.3 Mpx — seven times the shading work,
 * with the controller already bottomed out and no headroom left to give. The
 * frame is fill-rate bound at that size, so it simply ran seven times the
 * per-pixel cost and called it the floor.
 *
 * So the budget is now expressed in PIXELS. The controller moves a target pixel
 * count up and down with frame rate, and dpr is whatever satisfies it at the
 * current canvas size. Full screen now costs the same per frame as windowed —
 * it just resolves it a little softer, which on a dark, soft-lit scene is far
 * less noticeable than the stutter it replaces.
 */

/** floor: below this the scene reads as mush even in this soft lighting */
const MIN_PIXELS = 0.85e6;
/** ceiling: past this there is nothing left to see, only cost */
const MAX_PIXELS = 2.1e6;

function AdaptiveQuality() {
  const { gl } = useThree();
  const acc = useRef({ t: 0, frames: 0, target: 1.6e6, dpr: 1 });

  /** the dpr that spends exactly `target` pixels on the canvas as it is now */
  const dprFor = (target: number) => {
    const size = gl.getSize(new THREE.Vector2());
    const area = Math.max(1, size.x * size.y);
    const hardCap = Math.min(window.devicePixelRatio, 1.5);
    return Math.max(0.35, Math.min(hardCap, Math.sqrt(target / area)));
  };

  useEffect(() => {
    acc.current.dpr = dprFor(acc.current.target);
    gl.setPixelRatio(acc.current.dpr);
    resizeComposer(gl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFrame((_, delta) => {
    const a = acc.current;
    a.t += delta;
    a.frames += 1;
    if (a.t < 1) return; // sample once a second
    const fps = a.frames / a.t;
    a.t = 0;
    a.frames = 0;
    if (fps < 45) a.target = Math.max(MIN_PIXELS, a.target * 0.78);
    else if (fps > 58) a.target = Math.min(MAX_PIXELS, a.target * 1.12);
    // recomputed every second regardless of frame rate, so entering or leaving
    // full screen re-solves the same pixel budget for the new canvas size
    const next = dprFor(a.target);
    if (Math.abs(next - a.dpr) > 0.01) {
      a.dpr = next;
      gl.setPixelRatio(next);
      // WITHOUT THIS THE LINE ABOVE IS COSMETIC. The composer's render targets
      // are only re-derived when its setSize runs, and nothing re-runs it for a
      // pixel-ratio change — so the scene would go on being shaded at the old
      // resolution and merely blitted down. See composerHandle.ts.
      resizeComposer(gl);
    }
  });
  return null;
}

/* ————— the Librarian's station: proximity + the catalogue ————— */
function LibrarianStation({ still, onNear }: { still: boolean; onNear: (near: boolean) => void }) {
  const setSearchOpen = useUi((s) => s.setSearchOpen);
  const [active, setActive] = useState(false);
  const nearRef = useRef(false);
  const summon = () => setSearchOpen(true);

  useFrame((state) => {
    const dx = state.camera.position.x - LIBRARIAN_POS[0];
    const dz = state.camera.position.z - LIBRARIAN_POS[2];
    const near = dx * dx + dz * dz < 4.2 * 4.2;
    if (near !== nearRef.current) {
      nearRef.current = near;
      setActive(near);
      onNear(near);
    }
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && nearRef.current) summon();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Librarian position={LIBRARIAN_POS} rotationY={LIBRARIAN_ROT} onSummon={summon} active={active} still={still} />;
}

/* ————— a generic walk-up proximity station: near check + E to summon ————— */
function ProximityStation({
  pos,
  onNear,
  onSummon,
}: {
  pos: [number, number];
  onNear: (near: boolean) => void;
  onSummon: () => void;
}) {
  const nearRef = useRef(false);
  useFrame((state) => {
    const dx = state.camera.position.x - pos[0];
    const dz = state.camera.position.z - pos[1];
    const near = dx * dx + dz * dz < 4 * 4;
    if (near !== nearRef.current) {
      nearRef.current = near;
      onNear(near);
    }
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && nearRef.current) onSummon();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSummon]);
  return null;
}

/* ————— the card table: proximity opens the tarot reading ————— */
function TarotStation({ onNear, onSummon }: { onNear: (near: boolean) => void; onSummon: () => void }) {
  const nearRef = useRef(false);
  useFrame((state) => {
    const dx = state.camera.position.x - TAROT_POS[0];
    const dz = state.camera.position.z - TAROT_POS[1];
    const near = dx * dx + dz * dz < 4 * 4;
    if (near !== nearRef.current) {
      nearRef.current = near;
      onNear(near);
    }
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && nearRef.current) onSummon();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSummon]);
  return null;
}

/* ————— the council table: proximity opens the zodiac reading ————— */
function AstrologyStation({ onNear, onSummon }: { onNear: (near: boolean) => void; onSummon: () => void }) {
  const nearRef = useRef(false);
  useFrame((state) => {
    const dx = state.camera.position.x - ASTRO_POS[0];
    const dz = state.camera.position.z - ASTRO_POS[1];
    const near = dx * dx + dz * dz < 4 * 4;
    if (near !== nearRef.current) {
      nearRef.current = near;
      onNear(near);
    }
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && nearRef.current) onSummon();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSummon]);
  return null;
}

/* ————— scene assembly ————— */
function LibraryScene({
  still,
  onSelect,
  selectedId,
  pages,
  spread,
  jump,
  onNearLibrarian,
  onNearTarot,
  onSummonTarot,
  onNearAstro,
  onSummonAstro,
  onNearAlchemy,
  onSummonAlchemy,
  onNearKabbalah,
  onSummonKabbalah,
  paused,
  tarotActive,
  tarotCards,
  tarotRevealed,
  onFlipTarot,
  astroActive,
  astroSelected,
  onPickSign,
  alchemyActive,
  alchemySelected,
  onPickMetal,
  kabbalahActive,
  kabbalahSelected,
  onPickSephirah,
  onPickPlanet,
  planetSelected,
  orreryMode,
  onSetOrreryMode,
  onPickStatue,
  statueSelected,
  onPickPillar,
  pillarSelected,
  flightOn,
  onFlightDone,
}: {
  still: boolean;
  onSelect: (id: string) => void;
  selectedId: string | null;
  pages: HTMLCanvasElement[] | null;
  spread: number;
  jump: Jump | null;
  onNearLibrarian: (near: boolean) => void;
  onNearTarot: (near: boolean) => void;
  onSummonTarot: () => void;
  onNearAstro: (near: boolean) => void;
  onSummonAstro: () => void;
  onNearAlchemy: (near: boolean) => void;
  onSummonAlchemy: () => void;
  onNearKabbalah: (near: boolean) => void;
  onSummonKabbalah: () => void;
  paused: boolean;
  tarotActive: boolean;
  tarotCards: TarotCard[];
  tarotRevealed: boolean[];
  onFlipTarot: (i: number) => void;
  astroActive: boolean;
  astroSelected: number | null;
  onPickSign: (i: number) => void;
  alchemyActive: boolean;
  alchemySelected: number | null;
  onPickMetal: (i: number) => void;
  kabbalahActive: boolean;
  kabbalahSelected: number | null;
  onPickSephirah: (i: number) => void;
  /** a body of the great orrery was clicked — 'Earth', 'Saturn', … */
  onPickPlanet: (name: string) => void;
  onPickStatue: (kind: string) => void;
  onPickPillar: (kind: string) => void;
  /** the orrery body whose reading is currently open, if any */
  planetSelected: string | null;
  /** which chart the great orrery is showing */
  orreryMode: OrreryMode;
  onSetOrreryMode: (m: OrreryMode) => void;
  statueSelected: string | null;
  pillarSelected: string | null;
  flightOn: boolean;
  onFlightDone: () => void;
}) {
  const { scene, gl } = useThree();
  useLayoutEffect(() => {
    // A green-black haze, closing in sooner still. Two reasons for the shift
    // off violet: it is the mould-and-moss note the halls' new timber order is
    // cut to sit in, and a hall 46 m long has to go genuinely dark at its far
    // end or it has no depth — you should not be able to read a wing's end wall
    // until you have walked toward it. The coloured window light still reads
    // against it, and green is a better ground for warm amber than violet was.
    // Pulled cooler and closer, and the exposure down with it.
    //
    // The fog was a green-black at 15→64. It is a colder, bluer green now and
    // it starts biting at 12: the reference for this room is moonlight through
    // damp stone, and a warm-leaning haze is what was making the far end of a
    // hall read as "brown and far away" instead of "cold and unlit". Air in an
    // unheated building at night is the coolest thing in the frame — colder
    // than the moon, because it is scattering the moon.
    //
    // Exposure 1.32 → 1.06. This is the "darker, not dimmer" instruction taken
    // literally: the key lights went UP in lighting.tsx and the global exposure
    // came down, so the moonlight and the candle flames hold their value while
    // everything they are NOT hitting falls away. Dropping exposure alone would
    // just underexpose; raising the key alone would just brighten the room.
    //
    // Fog colour taken to near-black (#0c1418 → #04070a). Fog is what every
    // distant surface FADES INTO, so its colour is the floor on the whole
    // frame: a haze light enough to see is a grey wash over the far half of
    // every hall. It still has a trace of blue-green in it so the far end
    // reads as cold air rather than as a clipped image.
    //
    // Exposure back up a touch (1.06 → 1.14) now that the ambient, hemisphere
    // and moon terms are a fraction of what they were: the practicals — candles,
    // lamps, hearth, chandeliers — are carrying the room on their own, and they
    // need the headroom to still read as flames. Everything they do not reach
    // is darker than before, which is the point.
    scene.fog = new THREE.Fog('#04080f', 18, 72);
    gl.toneMappingExposure = 1.26;
    // Hand the material registry the renderer (for anisotropy) and let it go
    // looking for scans. Both are fire-and-forget: every surface is already
    // dressed in its painted stand-in, and anything with a real scan on disk
    // swaps itself in when the download lands.
    configureMaterials(gl);
    void primeMaterials();
    return () => {
      scene.fog = null;
      gl.toneMappingExposure = 1;
    };
  }, [scene, gl]);

  const ladderSpots = useMemo(
    () =>
      // one ladder per wing, leaning on a stocked bay (near or deep, never the gallery gap)
      WING_ANGLES.map((a, i) => {
        const wall = i % 2 === 0 ? -1 : 1;
        const u = i % 2 === 0 ? 22.8 : 36; // both are bay centres, never a seam
        const [x, z] = wingPoint(a, u, wall * (CASE_N - 0.7));
        return { pos: [x, z] as [number, number], yaw: -a + (wall === 1 ? Math.PI : 0) };
      }),
    [],
  );
  const pileSpots = useMemo<[number, number][]>(
    // just a few, by the reading tables — the floor is meant to feel open now
    () => [[14.9, -1.6], [-14.6, 2.2], [1.9, -15.6]],
    [],
  );
  const pots = useMemo(() => {
    const out: { pos: [number, number]; tall?: boolean; bloom?: boolean; seed: number }[] = [];
    // A guardian plant at each wing mouth, and a PAIR at the entrance. The
    // three kinds rotate — palm, fern, flowering shrub — so no two adjacent
    // gates carry the same silhouette; with only one sheet per kind, repetition
    // is the thing that gives the trick away.
    WING_ANGLES.forEach((a, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      out.push({
        pos: wingPoint(a, 16.1, side * 3.55) as [number, number],
        seed: 200 + i,
        tall: i % 3 === 0,
        bloom: i % 3 === 2,
      });
    });
    // The vestibule's pair is BACK, but at the DOORS rather than at the
    // pillars. The old pair stood at [±2.4, 20.6], which is where Boaz & Jachin
    // stand: each plant grew straight up the front of a shaft and hid it from
    // head-on, and a plant in front of a column is the one place a plant cannot
    // go. Set inside the threshold instead they dress the arrival and leave the
    // gateway its own air — the whole length of the hall is between the two.
    out.push(
      { pos: [-2.35, ENTRY_Z - 1.9], seed: 260, tall: true },
      { pos: [2.35, ENTRY_Z - 1.9], seed: 261, tall: true },
    );
    // THE APSE CARRIES NO PLANTS.
    //
    // There were two pairs down its side walls, at z −18.1 and −21.3, and both
    // came out at the user's request. They broke the rule written three lines
    // up for the vestibule's plants: they flank Boaz and Jachin, and a plant
    // beside a column reads as a plant IN FRONT of it from every angle on the
    // approach, which is the one place a plant cannot go. The hall reads on its
    // architecture — the two pillars, the bow, the Gloria and the Librarian's
    // bank — and it does not need dressing to do it.
    return out;
  }, []);
  /**
   * The creepers in the rotunda. `[x, y, z, width, drop, rotY]`.
   *
   * These used to be eight stacks of three leaf sprites hung at 6.7 m on the
   * bare drum — floating green blobs on a blank wall, growing out of nothing.
   * Growth has to come from somewhere, so they hang off ledges the building
   * actually has.
   *
   * Two placement lessons, both learned the hard way:
   *
   * · OVER the balustrade, not under the deck. The first cut hung them from the
   *   gallery soffit at 13.35 m — architecturally sensible, and completely
   *   invisible, because that is under a 1.95 m overhang in a room lit from
   *   above. They cascade over the handrail now, which is where a real creeper
   *   in a real gallery ends up anyway: it grows toward the light.
   * · NOT over a statue. The impost-course growth skips the four great piers —
   *   those carry Hermes, Enoch, Isis and Serapis, and ivy hanging into a
   *   niche's arch reads as neglect of the figure rather than age of the room.
   */
  const trails = useMemo(() => {
    const out: [number, number, number, number, number, number][] = [];
    const face = (r: number, d: number, y: number, w: number, drop: number) => {
      const a = (d * Math.PI) / 180;
      out.push([Math.cos(a) * r, y, Math.sin(a) * r, w, drop, Math.atan2(-Math.cos(a), -Math.sin(a))]);
    };
    // over the gallery rail — long, and set in the bays between the wing mouths
    // so nothing ever curtains a doorway
    for (const d of [8, 28, 62, 82, 98, 118, 152, 172, 188, 208, 242, 262, 278, 298, 332, 352])
      face(GALLERY_RAIL_R - 0.1, d, GALLERY_RAIL_Y, 1.5, 2.2 + ((d * 7) % 5) * 0.5);
    // shorter growth on the impost course, at the six narrow corner piers only
    for (const d of [40, 140, 220, 320]) face(ROT_R - 0.2, d, 8.4, 1.1, 1.5);
    // ————— the apse's creepers —————
    // Hung off the side walls at the height the wing galleries hang their art,
    // so the eye finds growth at the same line in both halls. A trail's plane
    // faces +z by default: rotY −π/2 turns it to face −x for the +x wall and
    // +π/2 the other way, i.e. both curtains face each other across the aisle
    // rather than into the panelling they grow out of.
    for (const z of [-18.4, -20.0, -21.6]) {
      out.push([3.08, 6.4, z, 1.3, 2.4, -Math.PI / 2]);
      out.push([-3.08, 6.4, z, 1.3, 2.4, Math.PI / 2]);
    }
    return out;
  }, []);
  const chandelierSpots = useMemo(() => {
    // lights are the scene's costliest resource: every lit pixel pays for every
    // point light in the hall. All fixtures render, but only every other wing
    // chandelier carries a real light — the pair's reach covers the whole wing,
    // and the trim nearly halves the per-pixel lighting bill for everyone.
    const out: ChandelierSpot[] = [
      45, 135, 225, 315,
    ].map((d) => {
      const a = (d * Math.PI) / 180;
      return {
        pos: [Math.cos(a) * 8.5, 9.8, Math.sin(a) * 8.5] as [number, number, number],
        rod: 12,
        light: true,
        // The rotunda's four burn harder than the wings'. Cut 30% from 68:
        // under the new grade the dome and the moonlight shaft have to be the
        // first things the eye finds, and four candle fixtures at chest-height
        // brightness were competing with both. The fixtures are meant to be
        // where the light comes FROM, not what you look at.
        intensity: 48,
      };
    });
    for (const a of WING_ANGLES) {
      for (const u of [21, 34, 48, 59]) {
        const [x, z] = wingPoint(a, u, 0);
        // ALL FOUR fixtures in a hall burn. They did not always: only u 34 and
        // u 48 carried a light, and the two on the ends hung fully modelled,
        // eight candles apiece, emitting nothing — which reads as a fault, not
        // as restraint. The stated reasons (the rotunda spills into the near
        // mouth, the stained glass fills the far end) were both after the fact.
        // The real reason was cost: every point light in the building used to be
        // evaluated on every fragment, so one more lamp taxed every pixel in the
        // museum.
        //
        // `LightPool` ended that. The shader is compiled for a FIXED 18 lights
        // however many practicals the scene holds, so a new one costs nothing
        // per-pixel — it only competes for a slot, and wins one just when the
        // visitor is near enough for it to matter. Adding practicals is cheap
        // now; adding to POOL_SIZE is not. See lightPool.tsx.
        //
        // What must NOT come back is the even wash. A corridor lit evenly has no
        // depth at any length, which is what made these read flat. So the hall
        // is still POOLS with real dark between them — the two in the middle
        // burn hard and long, the two on the ends burn low and short, lighting
        // their own brass and the bay under them and no further:
        //
        //   u 21  the mouth   50 / 24   under the rotunda's spill, so it only
        //                               has to own its own bay
        //   u 34  mid-hall    70 / 34   the near pool, and the floor for
        //   u 48  mid-hall    70 / 34   GALLERY_U = 27, whose framed engravings
        //                               are emissive and blow out unlit
        //   u 59  the window  44 / 22   lowest of the four: the glass is what
        //                               you walk towards, and a bright lamp in
        //                               front of it washes the coloured fill
        //                               straight off the end wall
        //
        // All four are POOLED. Two attempts to light a hall mouth from across
        // the rotunda were tried and both backed out: exempting the front two
        // fixtures from `LightPool` (sixteen permanent point lights, paid on
        // every fragment of every material in the building — it nearly doubled
        // the per-fragment lighting bill), and hanging emissive wall torches
        // inside each mouth. If it is tried a third time, the constraint to
        // start from is that a lamp contributes NOTHING past its own `distance`,
        // so no amount of pooling or exempting lights a mouth from 40 m — only
        // an emissive surface, or a longer reach, can.
        const ends: Record<number, [number, number]> = { 21: [50, 24], 59: [44, 22] };
        const [intensity, reach] = ends[u] ?? [70, 34];
        out.push({ pos: [x, WING_H - 3.6, z], rod: 3.0, light: true, intensity, reach });
      }
    }
    return out;
  }, []);

  return (
    <>
      {/* Pitch black. Seen through the oculus and the wing windows this used to
          be a lit violet field with a warm band at the horizon, and a bright
          sky behind the glass is a second ambient term — it sets the floor for
          how dark the room can ever read. Zenith, mid and horizon are all
          effectively black now; the only things in it are the stars. */}
      <DomeSky stars={1.6} zenith="#000000" mid="#010104" horizon="#030307" />
      <Moon />
      {/* The whole rig — moonlight, the oculus shaft, bounce, the hearth end.
          The wings are lit by their own hanging chandeliers (the [21,34,45]
          positions above), so there are no duplicate ground pools here. */}
      <LibraryLighting still={still} />

      <Rotunda />
      {/* the storeys above the statuary: pilasters, panelled fields, carved
          medallions and the bronze frieze under the gallery — everything that
          turns the drum's blank upper cylinder into architecture */}
      <DrumUpperOrder />
      {/* the mezzanine: the collection continues above where you can reach */}
      <RotundaGallery />
      {/* a tutelary figure on every pier of the drum */}
      <RotundaStatuary selected={statueSelected} onPick={onPickStatue} />
      {/* the aged plinths they stand on, all ten baked into four draw calls */}
      <NichePedestals />
      {/* The statuary's rig: two real spotlights that follow the visitor round
          the drum and key whichever figures they are standing at, plus the
          beam and the dust in it, which cost no lights at all. */}
      <NicheKeyLights still={still} />
      <NicheBeams still={still} />
      {/* the Leontocephaline on the east pier (where the clock stood), with the mysteries on a lectern */}
      <LeontocephalineEast selected={statueSelected === 'leontocephaline'} onPick={onPickStatue} />
      {/* Boaz & Jachin, crowned with the two globes, flanking the apse */}
      <MasonicPillars selected={pillarSelected} onPick={onPickPillar} still={still} />
      {/* the floor: one astronomical diagram across the whole plan, mandala to
          ways to roundels to brass — see three/cosmographia.tsx */}
      <Cosmographia />
      <WingChronology sections={SECTIONS} />
      {/* Isis & Serapis are niched on the two apse-side drum piers now — the
          same damask apse, dressing, reading and hover-warmth as the rest of
          the statuary (see ApseStatuary). The entrance keeps generic guardians. */}
      <ApseStatuary selected={statueSelected} onPick={onPickStatue} />
      {/* (the entrance corridor stands empty now. It used to be flanked by a
          pair of guardians — statue.glb at 2.7 m, with procedural StoneStatues
          behind them as the Suspense fallback — and the model reads as a
          helmeted, armoured knight: faceted plate, visored helm, nothing to do
          with the hermetic tradition the museum is about. Two of them were the
          first thing a visitor walked between. The named statuary all still
          stands: Hermes and the Leontocephaline on the wide drum piers, Isis & Serapis
          niched apse-side, Boaz & Jachin in the apse itself.) */}
      <WingEnclosures />
      <EntranceHall />
      {/* the vestibule's sconces, hanging lanterns and the light they cast —
          the first room a visitor stands in, and it used to be bare timber */}
      <EntranceDressing still={still} />
      <ResearchApse />
      {/* (the vestibule's two framed plates are gone — those walls are the
          pillars' now; see the note where Paintings used to stand in
          structure.tsx) */}
      <WingGallery />
      <WingArcade />
      <WingFurnishings />
      <WingRadiance still={still} />
      <HearthGlow />
      <MegaShelves />
      <Grimoires selectedId={selectedId} still={still} onSelect={onSelect} />
      <SectionMarks />
      {/* the hall names, as carved boards hanging off the first bookcase of
          each wing rather than as type floating in the aisle */}
      <WingSigns
        sections={SECTIONS.map((s) => ({ cluster: s.cluster, label: CLUSTER_META[s.cluster].label, angle: s.angle }))}
      />
      <Orrery still={still} selected={planetSelected} onPickBody={onPickPlanet} mode={orreryMode} onSetMode={onSetOrreryMode} />
      <OculusBeam />
      {/* the charted heavens wheeling inside the dome — the air around the
          globe is left clear, so nothing crowds it */}
      <ZodiacDome still={still} />
      {/* the dome's carved relief, bronze framework and turning armillary —
          everything the painted coffers cannot do */}
      <DomeMachine />
      <GlyphMotes still={still} />
      <ReadingTables still={still} />
      {/* what makes the four tables workstations rather than furniture: the
          apparatus, the open notebooks, the guttering candles and the stool
          somebody pushed back a minute ago (three/studyProps.tsx) */}
      <StudyProps still={still} />
      <Chandeliers still={still} spots={chandelierSpots} />
      {/* the hall's small lives: books on errands, moths in the light,
          and the odd meteor for whoever looks up through the oculus */}
      <FlyingBooks still={still} />
      <ChandelierMoths still={still} anchors={chandelierSpots.slice(0, 4).map((s) => s.pos)} />
      <ShootingStars still={still} />
      <StormWindows still={still} />
      <Ladders spots={ladderSpots} />
      <FloorBookPiles spots={pileSpots} />
      <Greenery pots={pots} trails={trails} />
      <LibrarianStation still={still} onNear={onNearLibrarian} />
      <TarotStation onNear={onNearTarot} onSummon={onSummonTarot} />
      <TarotSpread table={TAROT_POS} cards={tarotCards} revealed={tarotRevealed} onFlip={onFlipTarot} active={tarotActive} />
      <AstrologyStation onNear={onNearAstro} onSummon={onSummonAstro} />
      <AstrologyWheel table={ASTRO_POS} selected={astroSelected} onPick={onPickSign} active={astroActive} />
      <ProximityStation pos={ALCHEMY_POS} onNear={onNearAlchemy} onSummon={onSummonAlchemy} />
      <AlchemyBench table={ALCHEMY_POS} selected={alchemySelected} onPick={onPickMetal} active={alchemyActive} />
      <ProximityStation pos={KABBALAH_POS} onNear={onNearKabbalah} onSummon={onSummonKabbalah} />
      <KabbalahTablet table={KABBALAH_POS} selected={kabbalahSelected} onPick={onPickSephirah} active={kabbalahActive} still={still} />
      <Owl still={still} />
      <Chickadees still={still} />
      {/* No four-legged animals in the hall at all now, and all three removals
          were made for the same reason.
          · The rigged fox glTF went first: its skinned mesh exploded into giant
            stray triangles that smeared across the room.
          · Then the two cats — the static cat.glb standing in the west and the
            curled procedural sleeper behind it as a Suspense fallback. The glTF
            is a single unrigged mesh with one pose, and a cat that never moves
            in a room this alive reads as a prop rather than as a cat.
          · Then the ember-light SpiritFox that used to trot a lap of the
            rotunda. Orange, low and quadruped, it read to visitors as a stray
            cat rather than as the spirit it was meant to be.
          The owl and the chickadees carry the hall's life on their own, and they
          use the building's real ledges to do it (three/perches.ts). */}
      <RelationThreads selectedId={selectedId} />
      <ApseWall />
      {selectedId && pages && <OpenBook entityId={selectedId} pages={pages} spread={spread} />}
      {/* seated at a station, the room behind it stops answering clicks */}
      <ManualPicker stationOnly={paused} occluded={occludedByWall} />
      <FirstPersonRig
        still={still}
        frozen={selectedId !== null || paused}
        seated={paused}
        jump={jump}
        flight={flightOn}
        onFlightDone={onFlightDone}
      />
      {/* the finishing pass: a soft bloom so every candle, sigil, stained-glass
          window and the oculus shaft actually glow, and a gentle vignette to
          settle the eye on the heart of the hall */}
      {/* MSAA off: at 1.5× device pixels a multisampled target is a large
          bandwidth cost on exactly the machines that are already struggling,
          and the scene is dark and soft-edged enough that it reads the same
          without it. */}
      <EffectComposer ref={composerHandle} multisampling={0} enableNormalPass={false}>
        {/* Bloom was doing the opposite of its job. At threshold 0.62 it was
            catching every warm surface in the room, not just the flames — so
            the chandeliers, the gilt and the glyphs all bled outward and the
            architecture sat behind a haze. Raised to 0.82 it now only touches
            things that are genuinely emissive, and at 0.34 intensity it is a
            bloom rather than a glow. */}
        {/* resolutionScale: bloom is the one pass whose whole cost is per-pixel,
            and it runs a luminance pass plus a mip chain over the full frame. At
            half resolution that is a quarter of the work for an effect which is,
            by definition, a blur — there is nothing in it fine enough to lose. */}
        <Bloom
          mipmapBlur
          resolutionScale={0.5}
          intensity={0.34}
          luminanceThreshold={0.82}
          luminanceSmoothing={0.3}
          radius={0.6}
        />
        <Vignette offset={0.24} darkness={0.52} eskil={false} />
      </EffectComposer>
    </>
  );
}

/**
 * What a station is saying right now, in parts rather than one run-on string.
 *
 * The parts exist so the dock can typeset them differently: the reader should
 * be able to tell the speaker's line from the subject's name from its
 * attributes from the explanation without reading a word of any of them.
 */
export interface Reading {
  /** the line the table's keeper speaks — always present */
  talk: string;
  /** the subject drawn: a card, a sign, a metal, a sephirah */
  title?: string;
  /** short attributes — dates, element, ruler, planet, position in the spread */
  meta?: string[];
  /** the explanation proper */
  body?: string;
}

/**
 * The reading panel docked at the bottom of every station.
 *
 * One component for all four tables: they had drifted into four copies of the
 * same markup, so a change to the typography meant four edits and three
 * chances to miss one.
 */
function ReadingDock({
  station,
  reading,
  hint,
  handsOn = false,
  children,
}: {
  station: string;
  reading: Reading;
  hint: string;
  /**
   * Is there STILL SOMETHING TO REACH past this card?
   *
   * It decides how much of a phone's screen the card may take, and the test is
   * the table rather than the chair. At the tarot spread, the wheel, the bench
   * and the Tree you are sat down; at the great orrery you are stood up — but
   * all five are surfaces you go on touching WHILE you read, turning a card or
   * pressing a brass key on the rim, so all five keep the card small enough to
   * leave the table in view and in reach of a thumb.
   *
   * A statue, a pillar or a threshold plaque is the opposite: you have read it
   * and there is nothing left to press, so on a tall narrow screen the card is
   * free to take the room the prose actually needs. On a desktop window they
   * are all the same card; this only bites in portrait.
   */
  handsOn?: boolean;
  /** the station's buttons — leave, deal again, and so on */
  children: ReactNode;
}) {
  return (
    <div className="reading-scene">
      <div className={`reading-dock${handsOn ? '' : ' reading-dock-roomy'}`}>
        {/* the header is pinned: whatever the reading says, you can always see
            which station you are at and which card/sign/metal/sephirah you
            drew, without scrolling for it */}
        <div className="reading-head">
          <span className="reading-station">{station}</span>
          {reading.title && <h2 className="reading-title">{reading.title}</h2>}
          {reading.meta && reading.meta.length > 0 && (
            <ul className="reading-meta">
              {reading.meta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>
        {/* the explanation comes before the keeper's line: once you have drawn
            something, the paragraph about it is what you are here to read, and
            it should be the part that is visible without scrolling */}
        <div className="reading-body-scroll">
          {reading.body && <p className="reading-prose">{reading.body}</p>}
          <p className="reading-talk">{reading.talk}</p>
        </div>
        <div className="reading-actions">
          <span className="reading-hint">{hint}</span>
          <div className="reading-buttons">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ————— the room, its HUD, the reading bar, and the enlarged reader ————— */
export default function GrandLibrary() {
  const reduced = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [spread, setSpread] = useState(0);
  // walk straight into the rotunda — no opening splash
  const [entered, setEntered] = useState(true);
  // a brief welcome that fades itself away after a few seconds
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 4600);
    return () => clearTimeout(t);
  }, []);
  // the controls hint is a welcome, not furniture — it says its piece while
  // you find your feet and then gets out of the way of the hall
  const [hint, setHint] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 11000);
    return () => clearTimeout(t);
  }, []);
  const [reader, setReader] = useState(false);
  const [jump, setJump] = useState<Jump | null>(null);
  const [nearLibrarian, setNearLibrarian] = useState(false);
  const [nearTarot, setNearTarot] = useState(false);
  const [tarotSeated, setTarotSeated] = useState(false);
  // deal a spread up front so the cards lie on the table from the start; sitting
  // deals a fresh one
  const [tarotCards, setTarotCards] = useState<TarotCard[]>(() => dealSpread());
  const [tarotRevealed, setTarotRevealed] = useState<boolean[]>([false, false, false]);
  const [tarotDialogue, setTarotDialogue] = useState<Reading>({ talk: '' });
  const [nearAstro, setNearAstro] = useState(false);
  const [astroSeated, setAstroSeated] = useState(false);
  const [astroSelected, setAstroSelected] = useState<number | null>(null);
  const [astroDialogue, setAstroDialogue] = useState<Reading>({ talk: '' });
  const [nearAlchemy, setNearAlchemy] = useState(false);
  const [alchemySeated, setAlchemySeated] = useState(false);
  const [alchemySelected, setAlchemySelected] = useState<number | null>(null);
  const [alchemyDialogue, setAlchemyDialogue] = useState<Reading>({ talk: '' });
  const [nearKabbalah, setNearKabbalah] = useState(false);
  const [kabbalahSeated, setKabbalahSeated] = useState(false);
  const [kabbalahSelected, setKabbalahSelected] = useState<number | null>(null);
  const [kabbalahDialogue, setKabbalahDialogue] = useState<Reading>({ talk: '' });
  const anySeated = tarotSeated || astroSeated || alchemySeated || kabbalahSeated;
  /** the orrery body whose reading is open — 'Earth', 'Saturn', 'giza:orion', … */
  const [planetPick, setPlanetPick] = useState<string | null>(null);
  /** which of the plates the great orrery is showing. `?plate=<mode>`
   *  opens the instrument straight onto one — the plates are otherwise only
   *  reachable by walking to the table and pressing a key on its console,
   *  which makes them tedious to check and impossible to link to. */
  const [orreryMode, setOrreryMode] = useState<OrreryMode>(() => {
    const want = new URLSearchParams(window.location.search).get('plate');
    return (PLATES.find((p) => p.mode === want)?.mode ?? 'system') as OrreryMode;
  });
  // changing the chart clears any open reading — the picked body may not exist
  // on the new chart, and its gilt ring would hang over nothing
  const setMode = useCallback((m: OrreryMode) => {
    setOrreryMode(m);
    setPlanetPick(null);
  }, []);
  // stable, so the orrery's pickable registrations survive re-renders
  const pickPlanet = useCallback((name: string) => {
    setPlanetPick(name);
    setStatuePick(null); // one dock, one reading
    setPillarPick(null);
    setWingPick(null);
  }, []);
  useEffect(() => {
    if (!planetPick) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlanetPick(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [planetPick]);
  /** the statue on the drum whose reading is open — 'hermes', 'leontocephaline', … */
  const [statuePick, setStatuePick] = useState<string | null>(null);
  // stable, so the statues' pickable registrations survive re-renders
  const pickStatue = useCallback((kind: string) => {
    setStatuePick(kind);
    setPlanetPick(null); // one dock, one reading
    setPillarPick(null);
    setWingPick(null);
  }, []);
  useEffect(() => {
    if (!statuePick) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStatuePick(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [statuePick]);
  /** the pillar whose reading is open — 'boaz' | 'jachin' */
  const [pillarPick, setPillarPick] = useState<string | null>(null);
  const pickPillar = useCallback((kind: string) => {
    setPillarPick(kind);
    setPlanetPick(null); // one dock, one reading
    setStatuePick(null);
    setWingPick(null);
  }, []);
  useEffect(() => {
    if (!pillarPick) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPillarPick(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pillarPick]);
  /** the wing threshold plaque whose reading is open — a ClusterId */
  const [wingPick, setWingPick] = useState<ClusterId | null>(null);
  useEffect(() => {
    if (!wingPick) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWingPick(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [wingPick]);
  /* The guiding wisp went with the control rail above it. It was summoned by
     the ✦ button and by nothing else, so once the rail went the state behind
     it could only ever read false — a dead branch feeding a dead prop. The
     progress record it consulted (`useProgress().stations`) is untouched and
     still stamps every reading. */
  // live, not probed once at mount: resizing the window to a phone's shape
  // has to bring the phone's controls with it, and turning a phone has to
  // bring them back
  const { compact, stick: stickOn } = useViewport();
  // first arrival: a slow glide through the doors — skipped for returning
  // visitors, deep links, and reduced motion
  const [flightOn, setFlightOn] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('view') || p.get('focus') || p.get('cam') || p.get('plate')) return false;
    if (useProgress.getState().returning) return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const onFlightDone = () => {
    setFlightOn(false);
    useProgress.getState().markReturning();
  };
  useEffect(() => {
    if (!flightOn) {
      useProgress.getState().markReturning();
      return;
    }
    const skip = () => onFlightDone();
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, [flightOn]);
  // photo mode: the chrome steps aside and the hall poses
  const [photoMode, setPhotoMode] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement && Boolean(e.target.closest('input, textarea, select, [contenteditable]'));
      if (typing) return;
      if (e.code === 'KeyP') setPhotoMode((p) => !p);
      else if (e.key === 'Escape') setPhotoMode(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // Standing up must land OUTSIDE the table's collision radius (1.9) or the
  // walker gets trapped inside it — the seat sits only 1.7 from the table
  // centre, so step out to 2.3 and level the gaze before movement resumes.
  const standUp = (t: [number, number]) =>
    setJump({ x: t[0], z: t[1] + 2.3, yaw: 0, pitch: -0.02, n: (jump?.n ?? 0) + 1 });

  /**
   * Where to sit so a prop actually fits the frame.
   *
   * A fixed seat distance cannot serve every window: the camera's 64° is
   * VERTICAL, so a tall narrow window has a much smaller horizontal field
   * than a wide one, and a distance tuned on a desktop crops the outer
   * phials on a phone. Solve for the distance instead — how far back must
   * the eye be for a prop `halfW` wide to fall inside the horizontal field,
   * with a margin so nothing sits on the very edge.
   */
  const seatFor = (halfW: number, propY: number, minDist: number, eye = 1.5) => {
    const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
    const halfFovY = Math.tan(((64 * Math.PI) / 180) / 2);
    const halfFovX = Math.atan(halfFovY * aspect);
    // what matters for framing is the SLANT distance from the eye to the prop,
    // not the distance across the floor: a seat that sits high above a flat
    // table is already far enough from it to see it whole, and using the floor
    // distance would push it needlessly back across the room
    const slant = (halfW * 1.18) / Math.tan(halfFovX);
    const drop = eye - propY;
    const dist = Math.max(minDist, Math.sqrt(Math.max(slant * slant - drop * drop, 0)));
    // aim at the prop, then tip a little further down so it rides above the
    // reading dock rather than centring behind it
    return { dist, eye, pitch: -(Math.atan(drop / dist) + 0.04) };
  };

  // sitting at a station stamps the visitor's library card (first time only)
  const stampStation = (st: StationId) => {
    const p = useProgress.getState();
    if (!p.stations.includes(st)) {
      ambient.stamp();
      p.markStation(st);
    }
  };

  const sitAtTable = () => {
    setTarotCards(dealSpread());
    setTarotRevealed([false, false, false]);
    setTarotDialogue({ talk: '“Sit, friend. Turn a card when you’re ready — let us see what the night deals you.”' });
    setTarotSeated(true);
    stampStation('tarot');
    // settle into the chair and lean over the spread (outer edges at 0.61): from chair height the
    // three cards lie almost edge-on and you cannot read the art on them, so
    // this seat rides at 2.0 and looks down on them nearly face-on
    // the floor of 1.4 is not slack: a turned card LIFTS and tilts up toward
    // the reader, so it fills more of the frame than its flat footprint says
    const seat = seatFor(0.61, 0.9, 1.4, 2.0);
    setJump({
      x: TAROT_POS[0],
      z: TAROT_POS[1] + seat.dist,
      yaw: 0,
      pitch: seat.pitch,
      eye: seat.eye,
      n: (jump?.n ?? 0) + 1,
    });
  };
  const leaveTable = () => {
    setTarotSeated(false);
    // the spread stays on the table as dressing — turned face-down again, so
    // the card table always reads as a card table from across the hall
    setTarotRevealed([false, false, false]);
    standUp(TAROT_POS);
  };
  const dealAgain = () => {
    setTarotCards(dealSpread());
    setTarotRevealed([false, false, false]);
    setTarotDialogue({ talk: '“A fresh cut. The cards forget nothing, but they forgive.”' });
  };
  const flipTarot = (i: number) => {
    setTarotRevealed((r) => {
      if (r[i]) return r;
      const next = r.map((v, j) => (j === i ? true : v));
      const c = tarotCards[i];
      if (c) setTarotDialogue({ talk: c.talk, title: c.name, meta: [SPREAD_POSITIONS[i]], body: c.meaning });
      return next;
    });
  };

  const sitAtWheel = () => {
    setAstroSelected(null);
    setAstroDialogue({ talk: '“Welcome. The wheel is set — lay a hand on the sign the Sun stood in at your birth, and we shall read what the ancients made of it.”' });
    setAstroSeated(true);
    stampStation('astrology');
    // lean over the wheel, as at the tarot table: the star chart is a FLAT
    // disc, and from chair height it collapses into an ellipse with the far
    // coins crowded onto the rim. From 2.0 it reads as the round chart it is,
    // near rim and all twelve coins clear of the dock. The 1.9 floor keeps a
    // lifted coin — and the swinging needle — inside the frame.
    const seat = seatFor(0.82, 0.87, 2.1, 2.0);
    setJump({
      x: ASTRO_POS[0],
      z: ASTRO_POS[1] + seat.dist,
      yaw: 0,
      pitch: seat.pitch,
      eye: seat.eye,
      n: (jump?.n ?? 0) + 1,
    });
  };
  const leaveWheel = () => {
    setAstroSeated(false);
    setAstroSelected(null);
    standUp(ASTRO_POS);
  };
  const pickSign = (i: number) => {
    setAstroSelected(i);
    const s = ZODIAC[i];
    setAstroDialogue({
      talk: s.talk,
      title: s.name,
      meta: [s.dates, s.element, s.modality, `ruled by ${s.ruler}`],
      body: s.meaning,
    });
  };

  const sitAtBench = () => {
    setAlchemySelected(null);
    setAlchemyDialogue({ talk: '“Mind the fumes. Seven phials, seven metals, one Work — take up whichever the eye is drawn to, and I’ll tell you its stage.”' });
    setAlchemySeated(true);
    stampStation('alchemy');
    // stand back from the bench far enough that all seven phials and their
    // planetary glyphs sit inside the frame — the outer two sit at 0.9 plus
    // the flask radius, and at the old 1.25 they were pushed off the edges
    const seat = seatFor(1.0, 1.12, 2.2);
    setJump({ x: ALCHEMY_POS[0], z: ALCHEMY_POS[1] + seat.dist, yaw: 0, pitch: seat.pitch, n: (jump?.n ?? 0) + 1 });
  };
  const leaveBench = () => {
    setAlchemySeated(false);
    setAlchemySelected(null);
    standUp(ALCHEMY_POS);
  };
  const pickMetal = (i: number) => {
    setAlchemySelected(i);
    const m = METALS[i];
    setAlchemyDialogue({
      talk: m.talk,
      title: m.name,
      meta: [`${m.planet} ${m.glyph}`],
      body: m.meaning,
    });
  };

  const approachTree = () => {
    setKabbalahSelected(null);
    setKabbalahDialogue({ talk: '“The Tree, yes. Ten vessels, twenty-two paths, one light. Touch a sephirah and I will tell you what pours through it.”' });
    setKabbalahSeated(true);
    stampStation('kabbalah');
    // sit in the chair before the tablet, back far enough that Keter and
    // Malkuth both clear the reading dock along the bottom
    setJump({ x: KABBALAH_POS[0], z: KABBALAH_POS[1] + 2.2, yaw: 0, pitch: -0.18, n: (jump?.n ?? 0) + 1 });
  };
  const leaveTree = () => {
    setKabbalahSeated(false);
    setKabbalahSelected(null);
    standUp(KABBALAH_POS);
  };
  const pickSephirah = (i: number) => {
    setKabbalahSelected(i);
    const s = SEPHIROT[i];
    setKabbalahDialogue({
      talk: s.talk,
      title: `${s.name} ${s.hebrew}`,
      meta: [s.title],
      body: s.meaning,
    });
  };

  // deep link: /?view=x,z,yaw[,pitch] teleports the camera — QA/screenshots
  useEffect(() => {
    const view = params.get('view');
    if (!view) return;
    const [vx, vz, vyaw, vpitch] = view.split(',').map(Number);
    if ([vx, vz, vyaw].some((n) => Number.isNaN(n))) return;
    setEntered(true);
    setJump({ x: vx, z: vz, yaw: vyaw, pitch: Number.isNaN(vpitch) ? -0.02 : vpitch, n: Date.now() });
    const next = new URLSearchParams(params);
    next.delete('view');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // walks the visitor to a grimoire's own shelf and opens it — shared by the
  // /?focus=<id> deep link below and by any in-scene "walk me to it" control
  // (the constellation plate's stars) that wants the same trip without a
  // round trip through the URL
  const focusGrimoire = useCallback((id: string) => {
    const g = GRIMOIRE_BY_ID.get(id);
    if (!g) return;
    const [jx, jz] = wingPoint(g.angle, g.u, 0);
    const { nx, nz } = wingAxis(g.angle);
    const dx = nx * g.wall;
    const dz = nz * g.wall;
    setEntered(true);
    setJump({ x: jx, z: jz, yaw: Math.atan2(-dx, -dz), n: Date.now() });
    setSelected(id);
    setSpread(0);
  }, []);

  // deep link: /?focus=<id> walks you to the shelf and opens the book
  useEffect(() => {
    const focus = params.get('focus');
    if (!focus) return;
    focusGrimoire(focus);
    const next = new URLSearchParams(params);
    next.delete('focus');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // warm the grimoire plates once; bump a version when they're ready so any
  // open book re-bakes with its illustrations in place
  const [artVersion, setArtVersion] = useState(0);
  useEffect(() => {
    preloadGrimoireArt(() => setArtVersion((v) => v + 1));
  }, []);
  // The press sets its pages in EB Garamond and Cinzel. Canvas silently falls
  // back to Georgia for a face that has not finished downloading, and a book
  // opened in the first second would keep that fallback for as long as it was
  // open — so bump the same version once the webfonts land and let it re-bake.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) setArtVersion((v) => v + 1);
    });
    return () => {
      live = false;
    };
  }, []);
  // the extended plate pool is far too large to ship up front, so a book's
  // own two plates are fetched when it is opened; the bump re-bakes its pages
  // once they land
  useEffect(() => {
    if (!selected) return;
    const e = entityMap.get(selected);
    if (!e) return;
    let live = true;
    ensurePlates(e.cluster, e.id).then((arrived) => {
      if (live && arrived) setArtVersion((v) => v + 1);
    });
    return () => {
      live = false;
    };
  }, [selected]);

  const pages = useMemo(() => {
    if (!selected) return null;
    const e = entityMap.get(selected);
    if (!e) return null;
    const related = e.relations.map((r) => entityMap.get(r.target)?.name).filter(Boolean) as string[];
    return bakeGrimoire(e, sourceMap, related);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, artVersion]);
  const spreadCount = pages ? Math.ceil(pages.length / 2) : 1;

  const readerPages = useMemo(() => {
    if (!reader || !pages) return null;
    return [pages[spread * 2]?.toDataURL(), pages[spread * 2 + 1]?.toDataURL()];
  }, [reader, pages, spread]);

  const openBook = (id: string) => {
    setSelected(id);
    setSpread(0);
    ambient.pageTurn();
  };
  const closeBook = () => {
    setSelected(null);
    setReader(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.key === 'Escape') {
        if (reader) setReader(false);
        else closeBook();
      } else if (e.key === 'ArrowRight') setSpread((s) => Math.min(s + 1, spreadCount - 1));
      else if (e.key === 'ArrowLeft') setSpread((s) => Math.max(s - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, spreadCount, reader]);

  useEffect(() => {
    if (!tarotSeated) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leaveTable();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tarotSeated]);

  useEffect(() => {
    if (!astroSeated) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leaveWheel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [astroSeated]);

  useEffect(() => {
    if (!alchemySeated) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leaveBench();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alchemySeated]);

  useEffect(() => {
    if (!kabbalahSeated) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leaveTree();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kabbalahSeated]);

  const setSearchOpen = useUi((s) => s.setSearchOpen);
  const selectedEntity = selected ? entityMap.get(selected) : undefined;
  // a scan only exists for the books themselves; people, ideas and places
  // get the Wikipedia door below instead
  const archiveText = archiveTextFor(selectedEntity);

  // one dock serves every plate: solar-body readings come from PLANET_LORE,
  // the other plates' from PLATE_LORE (the same four-part shape)
  const planetLore = planetPick ? PLANET_LORE[planetPick] ?? PLATE_LORE[planetPick] : null;
  const planetReading: Reading | null = planetLore
    ? {
        talk: planetLore.talk,
        title: `${planetLore.glyph} ${planetLore.name}`,
        meta: planetLore.meta,
        body: planetLore.body,
      }
    : null;
  // the dock's eyebrow names whichever chart the reading belongs to
  const orreryStation = planetPick ? plateStation(planetPick) ?? 'The Great Orrery' : 'The Great Orrery';
  const statueLore = statuePick ? STATUE_LORE[statuePick] : null;
  const statueReading: Reading | null = statueLore
    ? {
        talk: statueLore.talk,
        title: `${statueLore.glyph} ${statueLore.name}`,
        meta: statueLore.meta,
        body: statueLore.body,
      }
    : null;
  const pillarLore = pillarPick ? PILLAR_LORE[pillarPick] : null;
  const pillarReading: Reading | null = pillarLore
    ? {
        talk: pillarLore.talk,
        title: `${pillarLore.glyph} ${pillarLore.name}`,
        meta: pillarLore.meta,
        body: pillarLore.body,
      }
    : null;
  const wingSpan = wingPick ? clusterSpan(wingPick) : null;
  const wingReading: Reading | null =
    wingPick && wingSpan
      ? {
          talk: 'The brass rule in the floor runs the length of it — walk out and you walk forward in time.',
          title: CLUSTER_META[wingPick].label,
          meta: [`${formatYear(wingSpan.minYear)} – ${formatYear(wingSpan.maxYear)}`, `${wingSpan.count} grimoires`],
          body: WING_LORE[wingPick],
        }
      : null;
  /**
   * Is a reading dock on screen at all?
   *
   * The four standing readings — a planet, a statue, a pillar, a wing plaque —
   * open the dock WITHOUT seating anyone, so `anySeated` does not see them and
   * the walk stick stayed lit under a card it was overlapping. On a phone the
   * dock reaches most of the way across the frame and the stick sits inside
   * its lower-left corner, so the two were fighting for the same thumb.
   */
  const anyReading = Boolean(planetReading || statueReading || pillarReading || wingReading);
  const liveDialogue = planetReading
    ? planetReading
    : statueReading
    ? statueReading
    : pillarReading
    ? pillarReading
    : wingReading
    ? wingReading
    : tarotSeated
    ? tarotDialogue
    : astroSeated
      ? astroDialogue
      : alchemySeated
        ? alchemyDialogue
        : kabbalahSeated
          ? kabbalahDialogue
          : null;

  return (
    <div className="scene-shell">
      <div className="sr-only" role="status" aria-live="polite">
        {liveDialogue
          ? [liveDialogue.talk, liveDialogue.title, liveDialogue.meta?.join(' · '), liveDialogue.body]
              .filter(Boolean)
              .join(' — ')
          : ''}
      </div>
      <Canvas
        /* lower bound matches AdaptiveQuality's floor: r3f re-applies this on
           every resize, so a higher one here would fight the pixel budget for a
           second each time the window changes size */
        dpr={[0.35, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
        camera={{ position: [0, 2.2, SPAWN_Z], fov: 64, near: 0.1, far: 220 }}
      >
        <AdaptiveQuality />
        <AspectFov />
        <SceneWarmup />
        <PropCulling />
        {/* order matters: dedup first, so StaticMerge — which groups by material
            identity — sees the collapsed set and can bake far more together */}
        {/* textures, then materials, then geometry — each pass makes the next
            one's matches possible: shared textures give materials equal map
            UUIDs, and shared materials give StaticMerge equal bucket keys */}
        <LightPool />
        <TextureDedup />
        <MaterialDedup />
        <StaticMerge />
        <SpatialAudioListener />
        <LibraryScene
          still={reduced}
          onSelect={openBook}
          selectedId={selected}
          pages={pages}
          spread={spread}
          jump={jump}
          onNearLibrarian={setNearLibrarian}
          onNearTarot={setNearTarot}
          onSummonTarot={sitAtTable}
          onNearAstro={setNearAstro}
          onSummonAstro={sitAtWheel}
          onNearAlchemy={setNearAlchemy}
          onSummonAlchemy={sitAtBench}
          paused={anySeated}
          tarotActive={tarotSeated}
          tarotCards={tarotCards}
          tarotRevealed={tarotRevealed}
          onFlipTarot={flipTarot}
          astroActive={astroSeated}
          astroSelected={astroSelected}
          onPickSign={pickSign}
          alchemyActive={alchemySeated}
          alchemySelected={alchemySelected}
          onPickMetal={pickMetal}
          onNearKabbalah={setNearKabbalah}
          onSummonKabbalah={approachTree}
          kabbalahActive={kabbalahSeated}
          kabbalahSelected={kabbalahSelected}
          onPickSephirah={pickSephirah}
          onPickPlanet={pickPlanet}
          planetSelected={planetPick}
          orreryMode={orreryMode}
          onSetOrreryMode={setMode}
          onPickStatue={pickStatue}
          statueSelected={statuePick}
          onPickPillar={pickPillar}
          pillarSelected={pillarPick}
          flightOn={flightOn}
          onFlightDone={onFlightDone}
        />
      </Canvas>

      {flightOn && <div className="flight-skip">tap or press any key to skip</div>}

      {photoMode && (
        <div className="photo-mode" aria-hidden="true" onClick={() => setPhotoMode(false)}>
          <div className="photo-bar photo-bar-top" />
          <div className="photo-bar photo-bar-bottom" />
          <span className="photo-hint">photo mode · P or tap a bar to exit</span>
        </div>
      )}

      {/* it rests in the corner for the whole visit, so there is always
          something on screen saying "walk here" — and it stands down only
          when walking itself is off: an open book, a seat at a table, photo
          mode, or the arrival glide */}
      {stickOn && !photoMode && !flightOn && !selected && !anySeated && !anyReading && <TouchStick />}

      {/* The floating control rail stood here — ambient sound, photo mode, and
          a wisp that lit a path to whichever station you had not yet read. It
          is gone for release: three unlabelled glyphs in the corner of a room
          that is meant to be walked into, and the one thing they were reliably
          good at was being the first thing a visitor clicked instead of the
          building. Sound remains a setting in the Research Hall header (and
          persists from there into the hall), and photo mode remains on P. */}

      {intro && !selected && (
        <div className="scene-intro" role="status">
          <div className="scene-intro-card">
            <span className="scene-intro-name">ASTERION</span>
            <span className="scene-intro-sub">A walkable museum of esoteric history</span>
          </div>
        </div>
      )}

      {entered && !selected && !flightOn && !photoMode && (
        <>
          {/* the phone gets its own hint line, not a truncated desk one: the
              pill never wraps, so on a narrow screen the desk hint was all
              ellipsis past the first clause */}
          {hint && (
            <div className="scene-hint" role="status">
              {compact ? (
                <>
                  left thumb to walk · drag to look · tap a{' '}
                  <strong style={{ color: '#b9a0ff' }}>violet</strong> or{' '}
                  <strong style={{ color: '#ff9a80' }}>crimson</strong> book to read it
                </>
              ) : (
                <>
                  WASD / arrows to walk · drag to look · <strong style={{ color: '#b9a0ff' }}>violet books</strong> are
                  illustrated synopses of figures &amp; events ·{' '}
                  <strong style={{ color: '#ff9a80' }}>crimson books</strong> are the original texts · the{' '}
                  <strong>Librarian</strong> keeps the great desk in the north apse
                </>
              )}
            </div>
          )}
          {/* only ever one prompt on screen: they all anchor to the same spot,
              so two stations in range at once would stack on top of each other.
              An open reading dock takes that spot too — the statues stand right
              beside the apse tables, so this fired constantly underneath it. */}
          {!anySeated && !planetPick && !statuePick && !pillarPick && !wingPick &&
            (() => {
              const prompt = nearTarot
                ? { label: 'Sit at the tarot table — turn the cards of your spread', act: sitAtTable }
                : nearAstro
                  ? { label: 'Sit at the zodiac table — read your sun sign on the wheel', act: sitAtWheel }
                  : nearAlchemy
                    ? { label: "Sit at the alchemist's bench — read the seven metals of the Great Work", act: sitAtBench }
                    : nearKabbalah
                      ? { label: "Sit at the kabbalist's table — read the Tree of Life", act: approachTree }
                      : nearLibrarian
                        ? { label: 'Ask the Librarian — search people, books, symbols & ideas', act: () => setSearchOpen(true) }
                        : null;
              if (!prompt) return null;
              return (
                <button className="librarian-prompt" onClick={prompt.act}>
                  <span className="librarian-prompt-key">E</span>
                  {prompt.label}
                </button>
              );
            })()}
        </>
      )}

      {/* Every station's reading is docked along the bottom of the frame. The
          talk used to float in a bubble over the middle of the view, which sat
          squarely on top of the prop you were meant to be clicking — the Tree's
          upper sephirot especially. Keeping speech, hint and controls in one
          bottom card leaves the whole upper frame clear for the object. */}
      {planetReading && !anySeated && (
        <ReadingDock
          station={orreryStation}
          handsOn
          reading={planetReading}
          hint="Click any body of the chart to read it — and the brass keys on the rim change the chart."
        >
          <button className="icon-btn" onClick={() => setPlanetPick(null)}>
            Close (Esc)
          </button>
        </ReadingDock>
      )}

      {statueReading && !anySeated && (
        <ReadingDock
          station="The Rotunda Statuary"
          reading={statueReading}
          hint="Walk up to any figure on the drum and click it to read them."
        >
          <button className="icon-btn" onClick={() => setStatuePick(null)}>
            Close (Esc)
          </button>
        </ReadingDock>
      )}

      {pillarReading && !anySeated && (
        <ReadingDock
          station="The Twin Pillars"
          reading={pillarReading}
          hint="Boaz and Jachin flank the Librarian’s station — click either globe to read the pillar."
        >
          <button className="icon-btn" onClick={() => setPillarPick(null)}>
            Close (Esc)
          </button>
        </ReadingDock>
      )}

      {wingReading && !anySeated && (
        <ReadingDock
          station="Threshold Plaque"
          reading={wingReading}
          hint="Every wing keeps a plaque like this beside its mouth, and a brass timeline struck into its floor."
        >
          <button className="icon-btn" onClick={() => setWingPick(null)}>
            Close (Esc)
          </button>
        </ReadingDock>
      )}

      {tarotSeated && (
        <ReadingDock
          station="The Spread"
          handsOn
          reading={tarotDialogue}
          hint={tarotRevealed.every(Boolean) ? 'The spread is turned.' : 'Click a card on the table to turn it.'}
        >
          <button className="icon-btn icon-btn-accent" onClick={dealAgain}>
            Deal a new spread
          </button>
          <button className="icon-btn" onClick={leaveTable}>
            Leave the table (Esc)
          </button>
        </ReadingDock>
      )}

      {astroSeated && (
        <ReadingDock
          station="The Heavens"
          handsOn
          reading={astroDialogue}
          hint={
            astroSelected === null
              ? 'Click a zodiac coin on the wheel to choose your sun sign.'
              : 'Pick another sign, or leave the table.'
          }
        >
          <button className="icon-btn" onClick={leaveWheel}>
            Leave the table (Esc)
          </button>
        </ReadingDock>
      )}

      {alchemySeated && (
        <ReadingDock
          station="The Great Work"
          handsOn
          reading={alchemyDialogue}
          hint={
            alchemySelected === null
              ? 'Click a phial on the bench to weigh its metal.'
              : 'Try another phial, or leave the bench.'
          }
        >
          <button className="icon-btn" onClick={leaveBench}>
            Leave the bench (Esc)
          </button>
        </ReadingDock>
      )}

      {kabbalahSeated && (
        <ReadingDock
          station="The Tree of Life"
          handsOn
          reading={kabbalahDialogue}
          hint={
            kabbalahSelected === null
              ? 'Click a sephirah on the Tree to hear its reading.'
              : 'Pick another sephirah, or leave the table.'
          }
        >
          <button className="icon-btn" onClick={leaveTree}>
            Leave the table (Esc)
          </button>
        </ReadingDock>
      )}

      {selectedEntity && (
        <>
          {!reader && <div className="book-dim" onClick={closeBook} />}
          <div className="book-bar" role="toolbar" aria-label={`Reading ${selectedEntity.name}`}>
            <div className="book-bar-head">
              <span className="book-bar-title">
                {selectedEntity.name}
                {selectedEntity.dates ? ` · ${selectedEntity.dates}` : ''}
              </span>
              <div className="book-bar-pager">
                <button className="icon-btn" aria-label="Previous pages" onClick={() => setSpread((s) => Math.max(s - 1, 0))} disabled={spread === 0}>
                  ◀
                </button>
                <span className="book-bar-pages">
                  {spread + 1} / {spreadCount}
                </span>
                <button
                  className="icon-btn"
                  aria-label="Next pages"
                  onClick={() => setSpread((s) => Math.min(s + 1, spreadCount - 1))}
                  disabled={spread >= spreadCount - 1}
                >
                  ▶
                </button>
              </div>
            </div>
            <div className="book-bar-actions">
              <button className="icon-btn" aria-pressed={reader} onClick={() => setReader(!reader)}>
                {reader ? 'Back to the book' : 'Enlarge'}
              </button>
              <Link className="icon-btn" to={`/research/entity/${selectedEntity.id}`}>
                Read as text
              </Link>
              {archiveText && (
                <a
                  className="icon-btn icon-btn-accent"
                  href={archiveDetailsUrl(archiveText)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Original on archive.org ↗
                </a>
              )}
              {EXTERNAL_LINKS[selectedEntity.id]?.[0] && (
                <a
                  className="icon-btn"
                  href={EXTERNAL_LINKS[selectedEntity.id][0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {EXTERNAL_LINKS[selectedEntity.id][0].label} ↗
                </a>
              )}
              <button className="icon-btn" onClick={closeBook}>
                Shelve it (Esc)
              </button>
            </div>
          </div>
          {reader && readerPages && (
            <div
              className="book-reader"
              role="dialog"
              aria-label={`${selectedEntity.name}, enlarged pages`}
              onClick={(e) => {
                if (e.target === e.currentTarget) setReader(false);
              }}
            >
              <div className="reader-pages">
                {readerPages[0] && <img src={readerPages[0]} alt={`${selectedEntity.name} — page ${spread * 2 + 1}`} />}
                {readerPages[1] && <img src={readerPages[1]} alt={`${selectedEntity.name} — page ${spread * 2 + 2}`} />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
