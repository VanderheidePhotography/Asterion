import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getMaterial } from '../../../materials';
import { WING_ANGLES, wingPoint } from './layout';
import {
  GALLERY2_U,
  GALLERY_U,
  RIB_US,
  VAULT_CY,
  VAULT_R,
  VAULT_W,
  WING_WALL_HALF,
} from './structure';

/**
 * The wing arcade — what carries the vault.
 *
 * WHAT THIS REPLACED, AND WHY. Each hall used to hold ten free-standing marble
 * columns, 14.3 m tall, planted a metre off the wall in the middle of the
 * floor. They carried NOTHING: no arch, no entablature, no rib. Each one rose
 * to the exact height of the vault's springing and then simply stopped in the
 * air, a metre short of the vault and with clear space above the capital. The
 * eye reads that instantly as wrong, because a column is a thing that holds
 * something up — a column holding up nothing is just a post.
 *
 * They also cost 800 draw calls to be wrong in.
 *
 * The vault already had ten transverse RIBS. They came down to the wall and
 * died there, with no member to receive them. So the fix and the replacement
 * are the same act: give every rib a real landing, and make the load path
 * legible all the way to the floor —
 *
 *     floor → pilaster → stack cornice → corbel → shaft → capital → rib → vault
 *
 * Nothing in that chain stops in mid-air. Where the wall is free (the two
 * gallery bays and the end window) the member runs all the way down as a
 * pilaster. Where the stacks are in the way — which is most of the hall — the
 * shaft is CORBELLED off the cornice that caps them. That is not a fudge; it
 * is exactly the device a medieval hall uses when stalls occupy the wall
 * below, and it is honest because the corbel visibly transfers to the wall.
 */

/**
 * THE PALETTE, AND WHY IT IS THREE STONES AND A TIMBER.
 *
 * The order used to be ONE grey stone at a single value from floor to
 * springing. That is what made the halls read as a cold neoclassical arcade
 * rather than a place: a real hall is darkest where it is damp and touched, and
 * warms only where light actually reaches it. So the single stone is split at
 * the stack cornice, which is exactly where the light from the hanging fixtures
 * stops falling —
 *
 *   BASE   below the cornice: a green-black slate, damp, in shadow anyway
 *   UPPER  above it: the same stone gone warm and lichened where light lands
 *
 * and the members that CARRY — corbel, shaft, capital — become oak rather than
 * stone. That is not decoration: it says the vault is held up by something
 * grown, which is the whole point of the halls. The load path is untouched.
 */
// The three tones this order is cut from — base #4b5147, upper #6b6a52, oak
// #4a3a28 — now live in `materials/library.json` as `stone_arcade_base`,
// `stone_arcade_upper` and `wood_arcade_timber`.
//
// All three were lifted off the near-black they started at, and the reason is
// worth keeping wherever they end up: relief you cannot SEE is not relief. At
// #3b4038 the pilasters and their bases read as one black slab in the gallery
// bays. The halls get their dark from the fog and the light pools, which is
// where atmosphere belongs — not from crushing the albedo.

/** inner face of a hall's side wall — everything here is measured off it */
const WALL_FACE = WING_WALL_HALF - 0.2;
/** the shelf bays' end posts reach 11.25 m; the cornice caps them just above */
const CORNICE_Y = 11.35;
const CORNICE_TOP = CORNICE_Y + 0.22;
/** where the vault's soffit meets the wall plane — the height every rib springs
 *  from, and therefore the height every capital has to arrive at. Derived, so
 *  the arcade cannot drift if the vault's section is ever retuned. */
export const SPRING_Y = VAULT_CY + Math.sqrt(VAULT_R * VAULT_R - VAULT_W * VAULT_W);
/** crown of the vault, where the bosses ride */
const CROWN_Y = VAULT_CY + VAULT_R;

/**
 * ————— THE WALL'S SECTION —————
 *
 * The complaint this answers: the halls' side wall is ONE box, 47 m long and
 * 0.4 m thick, with a panel texture painted on it (see WingEnclosures). A
 * painted panel grid is not depth — at a grazing angle, which is how you see a
 * corridor wall, it is unmistakably a flat slab. And the members standing on
 * it stood on NOTHING: a shaft floating 0.1 m off a smooth plane reads as a
 * stick leaned against a wall, not as a member engaged in one.
 *
 * So the wall is given a real section. Every plane below is measured as a
 * DEPTH d out from the wall face, into the hall, and the whole point is that
 * they are different numbers — a wall the light can rake across:
 *
 *      d = 0     the wall face itself
 *      d = FIELD the sunk panel field of each blind-arcade bay
 *      d = PIER  the engaged pier that every shaft and pilaster now rises from
 *      d = MOULD the string course, imposts and arch rolls that band the whole
 *
 * Because they are ordered, the field READS as recessed even though nothing is
 * cut out of anything — relief is a relationship between planes, not a hole.
 * That is exactly how real blind arcading is built and exactly how it is seen.
 */
const FIELD_D = 0.085;
const PIER_D = 0.14;
const MOULD_D = 0.26;

/** the blind arcade above the stacks: where its arches spring from, and how
 *  high they rise. The band between the cornice and the vault's springing is
 *  only 2.73 m, so these are SEGMENTAL arches — a semicircle on a 4.3 m bay
 *  would need 2.15 m of rise and burst straight through the vault. */
const IMPOST_Y = CORNICE_TOP + 0.58;
const ARCH_CHORD = 4.3;
const ARCH_RISE = 1.1;
/** the arc's own radius and half-angle, from chord and rise. Derived rather
 *  than eyeballed so the arch still meets its imposts if the bay pitch moves. */
const ARCH_R = (ARCH_CHORD * ARCH_CHORD) / (8 * ARCH_RISE) + ARCH_RISE / 2;
const ARCH_HALF = Math.asin(ARCH_CHORD / 2 / ARCH_R);
/** the frieze course, tucked just under the vault's springing */
const FRIEZE_Y = SPRING_Y - 0.22;

/** how far a gallery pilaster stands either side of the art it frames — the
 *  span the old free-standing pairs used, kept so the paintings are still
 *  framed by a member at the same rhythm */
const PIER_FRAME = 1.82;
const PIER_US = [
  GALLERY_U - PIER_FRAME,
  GALLERY_U + PIER_FRAME,
  GALLERY2_U - PIER_FRAME,
  GALLERY2_U + PIER_FRAME,
  62.4, // flanking the end window, clear of the last bay (ends 61.3)
];

interface Inst {
  pos: [number, number, number];
  rotY: number;
}

/** one instanced draw call for one repeated part of the order */
function Parts({
  geom,
  mat,
  items,
}: {
  geom: THREE.BufferGeometry;
  mat: THREE.Material;
  items: Inst[];
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    items.forEach((it, i) => {
      d.position.set(it.pos[0], it.pos[1], it.pos[2]);
      d.rotation.set(0, it.rotY, 0);
      d.updateMatrix();
      ref.current!.setMatrixAt(i, d.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[geom, mat, items.length]} frustumCulled={false} />;
}

export function WingArcade() {
  const stone = useMemo(() => getMaterial('stone_arcade_base'), []);
  const upper = useMemo(() => getMaterial('stone_arcade_upper'), []);
  // the bark canvas bakes its own base, so it is used untinted — the same trap
  // the fluted shafts already document below
  const timber = useMemo(() => getMaterial('wood_arcade_timber'), []);
  /* The two recessed fields — the arcade bays and the gallery niches — are
   * coursed ashlar, not flat colour. A recess painted one flat value is the
   * same mistake as the wall it replaced: the eye needs the courses to read
   * the plane as masonry standing BEHIND the members in front of it, and the
   * joints are what catch the raking light from the hall's lamps. Two
   * materials rather than one only because the bays are wide and shallow and
   * the niches tall and narrow, so they need different course scales to keep
   * every block the same real size — roughly a 0.42 x 0.33 m ashlar in both,
   * which is a block a mason could actually lift. */
  const bayField = useMemo(() => getMaterial('stone_arcade_ashlar', { repeat: [2.8, 1.85] }), []);
  const nicheFieldMat = useMemo(() => getMaterial('stone_arcade_ashlar', { repeat: [2.4, 4.3] }), []);
  // the same brass as the drum's gilt archivolts and the vault's ridge, so the
  // halls and the rotunda read as one building — but rubbed down and duller
  // than the drum's, because in a hall this dark new gilt reads as showroom
  // trim and old bronze reads as age
  const brass = useMemo(
    () =>
      getMaterial('metal_bronze_aged', {
        overrides: { color: '#9d7736', metalness: 0.78, roughness: 0.58 },
      }),
    [],
  );
  const fluted = useMemo(() => getMaterial('stone_arcade_flutes'), []);
  const sigil = useMemo(
    () =>
      getMaterial('metal_gold_leaf', {
        overrides: {
          color: '#d8ab5c',
          metalness: 0.6,
          roughness: 0.35,
          emissive: '#6a4a12',
          emissiveIntensity: 1.4,
        },
      }),
    [],
  );
  const wardLight = useMemo(
    // the low ward-marks. Emissive only, exactly like the rib bosses: a line of
    // small green fires running away down the hall costs no lights at all, and
    // receding points of light is the single thing that reads as DEPTH.
    () =>
      new THREE.MeshStandardMaterial({
        color: '#9fd9a2',
        emissive: '#4ea86a',
        emissiveIntensity: 2.2,
        roughness: 0.5,
        toneMapped: false,
      }),
    [],
  );
  const foliage = useMemo(
    () => getMaterial('misc_ivy', { overrides: { alphaTest: 0.5, roughness: 0.85 } }),
    [],
  );
  // wardLight is the only locally owned material left here — it is a light
  // source dressed as a surface, not a material, so it stays out of the registry
  useLayoutEffect(
    () => () => wardLight.dispose(),
    [wardLight],
  );

  /* ————— the parts, each one instanced across all eight halls ————— */
  const geoms = useMemo(() => {
    const g = {
      corniceFascia: new THREE.BoxGeometry(46.2, 0.22, 0.34),
      corniceChamfer: new THREE.BoxGeometry(46.2, 0.14, 0.2),
      corbelLower: new THREE.BoxGeometry(0.46, 0.2, 0.3),
      corbelUpper: new THREE.BoxGeometry(0.62, 0.24, 0.4),
      corbelFillet: new THREE.BoxGeometry(0.7, 0.06, 0.46),
      shaftRoll: new THREE.CylinderGeometry(0.1, 0.11, 1.5, 8),
      astragal: new THREE.CylinderGeometry(0.13, 0.13, 0.1, 8),
      bell: new THREE.CylinderGeometry(0.3, 0.19, 0.24, 8),
      abacus: new THREE.CylinderGeometry(0.42, 0.38, 0.16, 8),
      boss: new THREE.CylinderGeometry(0.36, 0.3, 0.3, 8),
      bossDisc: new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16),
      pierPlinth: new THREE.BoxGeometry(0.66, 0.46, 0.44),
      pierShaft: new THREE.CylinderGeometry(0.2, 0.24, 9.9, 16),
      pierAstragal: new THREE.CylinderGeometry(0.23, 0.23, 0.1, 16),
      pierBell: new THREE.CylinderGeometry(0.34, 0.22, 0.3, 8),
      pierAbacus: new THREE.CylinderGeometry(0.46, 0.42, 0.18, 8),
      // a ward-mark set low in the base stone, one per rib bay
      wardMark: new THREE.CylinderGeometry(0.11, 0.11, 0.04, 12),

      /* ————— the wall's own relief ————— */
      // the sunk field of one blind-arcade bay: the plane the arch encloses
      arcadeField: new THREE.BoxGeometry(ARCH_CHORD + 0.34, SPRING_Y - CORNICE_TOP - 0.3, 0.08),
      // the engaged pier every corbelled shaft now rises from, instead of
      // floating clear of a smooth wall
      arcadePier: new THREE.BoxGeometry(0.66, SPRING_Y - CORNICE_TOP, PIER_D),
      // the block an arch springs from — the one member that says "the arch
      // lands HERE", and the thing whose absence made the wall read as painted
      impost: new THREE.BoxGeometry(0.84, 0.16, MOULD_D + 0.04),
      // the arch roll itself, a segmental arc struck from ARCH_R
      blindArch: new THREE.TorusGeometry(ARCH_R, 0.1, 6, 26, ARCH_HALF * 2),
      // two courses banding the whole hall: one at the springing line of the
      // arcade, one under the vault. They are what make nine bays read as ONE
      // wall rather than nine unrelated panels.
      stringCourse: new THREE.BoxGeometry(46.2, 0.13, MOULD_D),
      friezeCourse: new THREE.BoxGeometry(46.2, 0.2, MOULD_D - 0.04),
      // the full-height pilasters get an engaged pier too
      pierBack: new THREE.BoxGeometry(0.86, 10.94, PIER_D),
      // and real base mouldings — a torus ring and the scotia above it
      pierTorus: new THREE.TorusGeometry(0.25, 0.075, 6, 18),
      pierScotia: new THREE.CylinderGeometry(0.26, 0.31, 0.15, 16),
      // The gallery bay becomes a shallow niche. This was first built with a
      // SILL under the art as well as a head — and that was wrong twice over:
      // a reading bench already stands at exactly that height (WingFurnishings),
      // so the sill read as a second, floating shelf behind the seat, and a
      // ledge is furniture, not wall. The niche is made instead the same way
      // the arcade bays are: a field set back between two members that are
      // already there — the pilasters flanking the art — capped by a head.
      nicheField: new THREE.BoxGeometry(3.34, 5.7, 0.07),
      nicheHead: new THREE.BoxGeometry(3.5, 0.2, MOULD_D + 0.06),
      // the growth: alpha-cut quads, never more than these two draw calls
      ivyPier: new THREE.PlaneGeometry(1.0, 6.2),
      ivySpill: new THREE.PlaneGeometry(1.3, 2.4),
    };
    // the ward-marks lie flat against the wall, and the creepers face into the
    // hall, so both are stood upright here rather than rotated per instance
    g.wardMark.rotateX(Math.PI / 2);
    // a torus is born in the XY plane — which IS the wall plane once an
    // instance takes its hall's rotY, so the arch needs no turning, only
    // swinging so its arc is centred on the crown instead of starting at 3
    // o'clock. The pilaster's base ring is the opposite case: it has to lie
    // down and wrap the shaft.
    g.blindArch.rotateZ(Math.PI / 2 - ARCH_HALF);
    g.pierTorus.rotateX(Math.PI / 2);
    return g;
  }, []);
  useLayoutEffect(() => () => Object.values(geoms).forEach((x) => x.dispose()), [geoms]);

  const items = useMemo(() => {
    const out: Record<keyof typeof geoms, Inst[]> = {
      corniceFascia: [],
      corniceChamfer: [],
      corbelLower: [],
      corbelUpper: [],
      corbelFillet: [],
      shaftRoll: [],
      astragal: [],
      bell: [],
      abacus: [],
      boss: [],
      bossDisc: [],
      pierPlinth: [],
      pierShaft: [],
      pierAstragal: [],
      pierBell: [],
      pierAbacus: [],
      wardMark: [],
      ivyPier: [],
      ivySpill: [],
      arcadeField: [],
      arcadePier: [],
      impost: [],
      blindArch: [],
      stringCourse: [],
      friezeCourse: [],
      pierBack: [],
      pierTorus: [],
      pierScotia: [],
      nicheField: [],
      nicheHead: [],
    };
    /** place a part at wing-local (u along the hall, n across it, y up) */
    const at = (key: keyof typeof geoms, a: number, u: number, n: number, y: number) => {
      const [x, z] = wingPoint(a, u, n);
      out[key].push({ pos: [x, y, z], rotY: -a });
    };

    WING_ANGLES.forEach((a, wi) => {
      // how far the growth has taken THIS hall. Two of the eight are nearly
      // overgrown, two are barely touched, the rest sit between — eight
      // identical corridors is the other half of why they read as a showroom.
      const overgrowth = [0.9, 0.35, 0.6, 0.15, 0.95, 0.5, 0.2, 0.7][wi % 8];
      for (const s of [-1, 1]) {
        // the cornice capping the stacks — the ledge the whole arcade sits on
        at('corniceFascia', a, 40.5, s * (WALL_FACE - 0.17), CORNICE_Y + 0.11);
        at('corniceChamfer', a, 40.5, s * (WALL_FACE - 0.1), CORNICE_Y - 0.07);
        // the two courses that band the whole 46 m run and tie the bays into
        // one wall — one along the arcade's springing, one under the vault
        at('stringCourse', a, 40.5, s * (WALL_FACE - MOULD_D / 2), IMPOST_Y - 0.12);
        at('friezeCourse', a, 40.5, s * (WALL_FACE - (MOULD_D - 0.04) / 2), FRIEZE_Y);

        // ————— the blind arcade: nine bays between the ten rib lines —————
        for (let i = 0; i < RIB_US.length - 1; i++) {
          const mid = (RIB_US[i] + RIB_US[i + 1]) / 2;
          // the sunk field first, then the arch that encloses it. The field
          // stands barely proud of the wall and the arch well proud, so the
          // bay reads as cut INTO a thick wall.
          at('arcadeField', a, mid, s * (WALL_FACE - FIELD_D / 2), (CORNICE_TOP + SPRING_Y) / 2 - 0.05);
          at('blindArch', a, mid, s * (WALL_FACE - 0.155), IMPOST_Y - ARCH_R * Math.cos(ARCH_HALF));
        }

        for (const u of RIB_US) {
          // THE ENGAGED PIER. The corbelled shaft above used to spring off a
          // smooth plane; now it rises out of a pier standing proud of the
          // wall, and the arcade's arches land on that pier's impost. This is
          // the single member that stops the order reading as applied trim.
          at('arcadePier', a, u, s * (WALL_FACE - PIER_D / 2), (CORNICE_TOP + SPRING_Y) / 2);
          at('impost', a, u, s * (WALL_FACE - (MOULD_D + 0.04) / 2), IMPOST_Y);
          // corbel: a bracket growing out of the cornice, widening as it rises
          at('corbelLower', a, u, s * (WALL_FACE - 0.15), CORNICE_TOP + 0.1);
          at('corbelUpper', a, u, s * (WALL_FACE - 0.2), CORNICE_TOP + 0.32);
          at('corbelFillet', a, u, s * (WALL_FACE - 0.23), CORNICE_TOP + 0.47);
          // a cluster of three rolls, the middle one standing proudest
          for (const [du, dn] of [
            [-0.24, 0.14],
            [0, 0.22],
            [0.24, 0.14],
          ]) {
            at('shaftRoll', a, u + du, s * (WALL_FACE - dn), CORNICE_TOP + 0.5 + 0.75);
            at('astragal', a, u + du, s * (WALL_FACE - dn), CORNICE_TOP + 1.3);
          }
          // capital, arriving exactly at the springing so the rib lands on it
          at('bell', a, u, s * (WALL_FACE - 0.2), SPRING_Y - 0.24 - 0.12);
          at('abacus', a, u, s * (WALL_FACE - 0.21), SPRING_Y - 0.08);
          // the ward-mark under each bay, low enough to graze the floor stone
          at('wardMark', a, u, s * (WALL_FACE - 0.03), 0.62);
          // ivy spilling off the cornice, thicker the more overgrown the hall
          if ((u * 7 + wi * 3) % 10 < overgrowth * 10) {
            at('ivySpill', a, u + 0.3, s * (WALL_FACE - 0.28), CORNICE_Y - 1.0);
          }
        }
      }
      // a boss at the crown of every rib, its brass sigil the only thing in the
      // hall that glows without costing a light
      for (const u of RIB_US) {
        at('boss', a, u, 0, CROWN_Y - 0.38);
        at('bossDisc', a, u, 0, CROWN_Y - 0.55);
      }
      // the pilasters: where the wall is free, the member goes all the way down
      for (const s of [-1, 1]) {
        for (const u of PIER_US) {
          // the pier the pilaster is engaged in, floor to cornice
          at('pierBack', a, u, s * (WALL_FACE - PIER_D / 2), 5.47);
          at('pierPlinth', a, u, s * (WALL_FACE - 0.22), 0.23);
          // base mouldings: the torus rings the shaft's foot and the scotia
          // gathers it into the plinth. A shaft that meets the floor with a
          // flat cut is the other half of what read as unfinished.
          at('pierTorus', a, u, s * (WALL_FACE - 0.24), 0.53);
          at('pierScotia', a, u, s * (WALL_FACE - 0.24), 0.66);
          at('pierShaft', a, u, s * (WALL_FACE - 0.24), 0.46 + 4.95);
          at('pierAstragal', a, u, s * (WALL_FACE - 0.24), 10.46);
          at('pierBell', a, u, s * (WALL_FACE - 0.24), 10.66);
          at('pierAbacus', a, u, s * (WALL_FACE - 0.25), 10.9);
          // a creeper climbing the free wall beside the pilaster — only where
          // the hall has let it, and never on both sides of the same pier
          if (((u * 3 + wi * 5 + (s + 1)) % 10) < overgrowth * 10) {
            at('ivyPier', a, u + 0.42, s * (WALL_FACE - 0.3), 3.4);
          }
        }
        // between each PAIR of pilasters the wall becomes a shallow niche the
        // art hangs inside. The paintings hang at HANG_Y 4.2 and stand 3.3
        // tall (WingGallery), with their caption below — so the sill clears
        // the caption and the head clears the frame, and neither is a number
        // to re-guess if the hang ever moves.
        for (const g of [GALLERY_U, GALLERY2_U]) {
          at('nicheField', a, g, s * (WALL_FACE - 0.035), 3.95);
          at('nicheHead', a, g, s * (WALL_FACE - (MOULD_D + 0.06) / 2), 6.9);
        }
      }
    });
    return out;
  }, []);

  /** everything below the stack cornice takes the dark damp base stone (the
   *  default); these take the warmer lichened upper stone, the timber, or metal */
  const matFor: Record<string, THREE.Material> = {
    corniceFascia: upper,
    corniceChamfer: upper,
    // the carrying members — corbel through capital — are oak
    corbelLower: timber,
    corbelUpper: timber,
    corbelFillet: brass,
    shaftRoll: timber,
    astragal: brass,
    bell: timber,
    abacus: timber,
    boss: upper,
    bossDisc: sigil,
    pierAstragal: brass,
    pierBell: timber,
    pierAbacus: timber,
    pierShaft: fluted,
    wardMark: wardLight,
    ivyPier: foliage,
    ivySpill: foliage,
    // the arcade above the cornice is all lichened upper stone — EXCEPT the
    // sunk field, which takes the dark base stone. That is not only for
    // contrast: a recess really is darker than the face around it, so the
    // colour and the geometry are saying the same thing instead of fighting.
    arcadeField: bayField,
    arcadePier: upper,
    impost: upper,
    blindArch: upper,
    stringCourse: upper,
    friezeCourse: upper,
    nicheField: nicheFieldMat,
    nicheHead: upper,
  };

  return (
    <group>
      {(Object.keys(geoms) as (keyof typeof geoms)[]).map((k) => (
        <Parts key={k} geom={geoms[k]} mat={matFor[k] ?? stone} items={items[k]} />
      ))}
    </group>
  );
}

/* The bark and flute tiling that used to live here is now carried by the
 * `wood_arcade_timber` and `stone_arcade_flutes` definitions in the material
 * library, along with the tone each canvas bakes into itself. Both helpers also
 * had a latent bug worth recording: they set `repeat` on the SHARED cached
 * canvas rather than on a copy of it, so any second surface asking for the same
 * painter would have silently inherited this one's tiling. The registry hands
 * out clones, which is what makes one painter safe to reuse at two scales. */
