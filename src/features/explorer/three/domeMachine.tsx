import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMaterial } from '../../../materials';
import { mulberry32 } from '../../../domain/random';
import { OCULUS_R, ROT_WALL_H } from './layout';
import { DOME_BASE_R, DOME_CY, DOME_SPHERE_R } from './structure';

/**
 * THE DOME AS A MACHINE.
 *
 * The shell underneath this is a coffered lathe with one painted column of
 * coffers repeated thirty-two times round. That is a good dome and a bad
 * ceiling: everything on it is PAINTED, so at every hour of every visit it
 * catches the light identically and there is nothing on it to find. A ceiling
 * a visitor is meant to stop walking and stare at has to have relief that
 * shadows, metal that catches a moving light, and something that moves.
 *
 * So this adds three things the paint cannot do, in the order they matter:
 *
 *   RINGS      four concentric bands standing proud of the shell — two heavy
 *              carved stone courses and two thin bronze ones between them.
 *              Real geometry, so the oculus light rakes across them and the
 *              underside of every band is genuinely dark.
 *   STARS      a scatter of small brass studs inset between the rings, which
 *              is what rewards looking twice: they are far too small to read
 *              as a pattern and just bright enough to catch the eye moving.
 *
 * ── cost ───────────────────────────────────────────────────────────────────
 * The whole assembly is two draw calls plus one instanced mesh. Rings and ribs
 * merge into one buffer per material; the stars are the instanced mesh. At 1088
 * calls for the scene this is affordable — but it is affordable BECAUSE it was built merged
 * rather than merged afterwards.
 */

/** where on the meridian a band sits, as a fraction springing(0) → oculus(1) */
const BANDS = [
  { t: 0.16, w: 0.62, proud: 0.20, metal: false },
  { t: 0.40, w: 0.17, proud: 0.13, metal: true },
  { t: 0.63, w: 0.46, proud: 0.17, metal: false },
  { t: 0.83, w: 0.14, proud: 0.11, metal: true },
];

/** the meridian angle at the springing and at the oculus, on the dome's sphere */
const T0 = Math.asin(DOME_BASE_R / DOME_SPHERE_R);
const T1 = Math.asin(OCULUS_R / DOME_SPHERE_R);

/** a point on the dome's inner surface at meridian fraction `t` */
function domePoint(t: number): { r: number; y: number } {
  const a = T0 + (T1 - T0) * t;
  return { r: DOME_SPHERE_R * Math.sin(a), y: DOME_CY + DOME_SPHERE_R * Math.cos(a) };
}

/**
 * One band, as a lathe. The profile drops in from the shell, runs along the
 * band's face and returns — so the band has a real soffit and a real top edge
 * to catch light, rather than being a decal with no thickness.
 */
function bandGeometry(t: number, halfW: number, proud: number): THREE.BufferGeometry {
  const lo = domePoint(t - halfW * 0.5);
  const hi = domePoint(t + halfW * 0.5);
  // inward is toward the dome's axis, so a proud band has a SMALLER radius
  const profile = [
    new THREE.Vector2(lo.r, lo.y),
    new THREE.Vector2(lo.r - proud, lo.y),
    new THREE.Vector2(hi.r - proud, hi.y),
    new THREE.Vector2(hi.r, hi.y),
  ];
  return new THREE.LatheGeometry(profile, 96);
}

/** the carved stone courses, merged */
const STONE_BANDS = (() => {
  const parts = BANDS.filter((b) => !b.metal).map((b) => bandGeometry(b.t, b.w, b.proud));
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
})();

/**
 * The bronze framework: the two thin bands, plus sixteen meridian ribs running
 * between the two stone courses.
 *
 * Meridians were tried on this dome once before and cut for being invisible —
 * but those were dark TIMBER ribs on a timber-toned shell, which had nothing
 * to distinguish them. Bronze is a conductor: it has a specular response the
 * coffers do not, so under a raking shaft from the oculus a rib lights up along
 * one edge and vanishes along the other. That difference is the whole reason
 * they read now, and it is why they are metal rather than another moulding.
 */
const BRONZE_FRAME = (() => {
  const parts: THREE.BufferGeometry[] = BANDS.filter((b) => b.metal).map((b) =>
    bandGeometry(b.t, b.w, b.proud),
  );
  const RIBS = 16;
  const a0 = BANDS[0].t;
  const a1 = BANDS[2].t;
  const SEGS = 14;
  for (let k = 0; k < RIBS; k++) {
    const theta = (k / RIBS) * Math.PI * 2;
    // a rib is a thin strip following the meridian: build it as a chain of
    // short boxes rather than a swept tube, which is far cheaper and reads
    // identically at this distance
    for (let s = 0; s < SEGS; s++) {
      const tA = a0 + ((a1 - a0) * s) / SEGS;
      const tB = a0 + ((a1 - a0) * (s + 1)) / SEGS;
      const pA = domePoint(tA);
      const pB = domePoint(tB);
      const midR = (pA.r + pB.r) / 2 - 0.10;
      const midY = (pA.y + pB.y) / 2;
      const len = Math.hypot(pB.r - pA.r, pB.y - pA.y) * 1.06;
      const tilt = Math.atan2(pB.y - pA.y, pB.r - pA.r);
      const g = new THREE.BoxGeometry(len, 0.075, 0.16);
      g.rotateZ(tilt);
      g.translate(midR, midY, 0);
      g.rotateY(theta);
      parts.push(g);
    }
  }
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
})();

export function DomeMachine() {
  const stone = useMemo(() => getMaterial('stone_limestone_ancient', { repeat: [24, 2] }), []);
  const bronze = useMemo(() => getMaterial('metal_bronze_aged', { repeat: [8, 1] }), []);
  /**
   * The studs get their own brass rather than the shared one, lifted with a
   * little emissive. Without it they are simply not there: they are 7 cm
   * across, fourteen metres up, on a surface the lighting rig deliberately
   * leaves at the bottom of its range. The emissive is not a glow — it is the
   * amount of light a polished stud would be returning from the candles below
   * if this renderer had any bounce, which it does not.
   */
  const brass = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        overrides: { emissive: '#5a4116', emissiveIntensity: 1.0, roughness: 0.28 },
      }),
    [],
  );

  /* ————— the brass stars inset between the bands ————— */
  const starGeom = useMemo(() => new THREE.OctahedronGeometry(0.075, 0), []);
  const stars = useMemo(() => {
    const rng = mulberry32(8821);
    const out: { pos: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < 260; i++) {
      // keep them in the two wide fields, off the bands themselves
      const band = rng() < 0.55;
      const t = band ? 0.26 + rng() * 0.1 : 0.5 + rng() * 0.09;
      const p = domePoint(t);
      const theta = rng() * Math.PI * 2;
      out.push({
        pos: [Math.cos(theta) * (p.r - 0.09), p.y, Math.sin(theta) * (p.r - 0.09)],
        scale: 0.6 + rng() * 0.7,
      });
    }
    return out;
  }, []);
  const starRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    stars.forEach((s, i) => {
      d.position.set(...s.pos);
      d.scale.setScalar(s.scale);
      d.updateMatrix();
      starRef.current!.setMatrixAt(i, d.matrix);
    });
    starRef.current!.instanceMatrix.needsUpdate = true;
  }, [stars]);

  useEffect(() => () => starGeom.dispose(), [starGeom]);

  return (
    <group>
      {/*
        COVE LIGHTING. The dome had no light of its own: the oculus shaft points
        straight down past it, and the ambient terms were cut to 0.17/0.08 for
        the 80/15/5 budget — so every band and rib built above was rendering
        into near-black and the relief may as well not have existed.

        Three concealed uplights sitting just above the gallery cornice, aimed
        into the shell. This is not a modern contrivance: hiding the source
        behind a cornice and washing the vault with it is how domes have been
        lit since there were candles to do it with, and it is the reason the
        carving reads from the floor at all.

        Three, not twelve, and short-range: they are a real cost against a
        37-light scene, and the dome only needs enough to find its own edges.
      */}
      {[0, 1, 2].map((k) => {
        const a = (k / 3) * Math.PI * 2 + 0.5;
        return (
          <pointLight
            key={k}
            position={[Math.cos(a) * (DOME_BASE_R - 2.2), ROT_WALL_H + 0.6, Math.sin(a) * (DOME_BASE_R - 2.2)]}
            color="#c8b48a"
            intensity={26}
            distance={19}
            decay={1.7}
          />
        );
      })}

      {/* the carved courses and the bronze framework — two draw calls for the
          whole of the dome's relief */}
      <mesh geometry={STONE_BANDS} material={stone} />
      <mesh geometry={BRONZE_FRAME} material={bronze} />

      {/* brass studs inset in the fields between them */}
      <instancedMesh
        ref={starRef}
        args={[starGeom, brass, stars.length]}
        frustumCulled={false}
      />

      {/* The armillary that used to hang in the eye of the dome is gone. Three
          bronze rings turning slowly under the oculus read from the floor as
          bright concentric bands lying across the one opening in the building —
          they closed the hole. The eye is empty now: nothing between the floor
          and the night. */}
    </group>
  );
}

/** the springing height, re-exported so callers can reason about the dome */
export const DOME_SPRING_Y = ROT_WALL_H;
