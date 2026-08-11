import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { candleWash } from './glowTexture';
import { getMaterial } from '../../../materials';
import { ENTRY_HALF, ENTRY_INNER_Z, ENTRY_Z, WING_H } from './layout';

/**
 * THE VESTIBULE'S LIGHT AND DRESSING.
 *
 * The entrance hall was the darkest room in the building and the only one with
 * nothing in it: bare wainscot both sides, a runner, and the doors. It is also
 * the FIRST room, which is the worst place in a museum to have nothing to look
 * at — a visitor arrived in a corridor and walked its whole length before the
 * building showed them anything.
 *
 * Three things dress it, and each is doing a different job:
 *
 *  · SCONCES march the walls. They are what gives the hall a rhythm and a
 *    length — a row of lights receding is how you read a corridor's depth —
 *    and they carry no real light at all (see below).
 *  · A LANTERN hangs over the centre line. It is the room's actual light: one
 *    warm point light, ranged to lay a pool that dies before the doors and
 *    before the rotunda mouth. There were two until the hall was shortened —
 *    see LANTERN_Z.
 *  · The plants at the doors are dealt by `Greenery` from GrandLibrary, with
 *    the rest of the building's pots, so the vestibule's greenery is the same
 *    greenery as everywhere else.
 *
 * ONE LIGHT FOR THE WHOLE HALL. A sconce per bracket would have been eight,
 * and this scene is drawn with a small fixed light budget — so the sconces get
 * flames that emit no light and a warm pool falls from the lantern instead. At
 * candle distances nobody can tell which fixture is lighting the wall; what
 * they can tell is a room with eight lights in it, because it costs frames.
 *
 * DRAW CALLS. Every bracket in the hall is one merged mesh, every candle
 * another, every flame a third — three draws for eight sconces — and the
 * lanterns are merged the same way. See the draw-call note in `statues.tsx`.
 */

/** the wall face the brackets are screwed to */
const WALL_X = ENTRY_HALF + 0.13;
/** how high a bracket sits: above head height, below the wainscot's top rail */
const SCONCE_Y = 3.1;
/**
 * Where the sconces stand along the hall.
 *
 * Struck off the hall's inner end (ENTRY_INNER_Z) — where its walls start off
 * the drum — and marched down toward the doors. This used to be measured from
 * the pillars, back when Boaz & Jachin stood in this hall; they are in the apse
 * now, and left to follow them the brackets would have marched out across the
 * rotunda floor.
 */
const SCONCE_Z = [0.28, 0.5, 0.72, 0.92].map((t) => ENTRY_INNER_Z + t * (ENTRY_Z - ENTRY_INNER_Z));

/**
 * ONE hanging lantern, hung at the middle of the vestibule.
 *
 * There were two, at 0.34 and 0.68 of the hall's length, which was right when
 * the hall ran from the drum to z 28.2. It does not any more: the doors came in
 * to 22.4 and the dressed vestibule with them, and two lanterns struck at those
 * fractions of what is left hang less than a metre apart — near enough to read
 * as one fixture that has been drawn twice, and to put two overlapping pools on
 * the same three metres of floor. A porch takes one lantern.
 *
 * The survivor hangs at 0.15 — well INSIDE where either of the old pair stood.
 *
 * That is forced by the shortened hall rather than chosen. The rule the far
 * lantern was placed by still holds: the doorway — fanlight, inscription and
 * arch — is a composition of its own that a lantern must not stand in front
 * of. But the vestibule is under three metres deep now, so from the rotunda
 * axis anything hung in the middle of it projects straight onto the fanlight,
 * and from inside the hall looking up it crosses the ASTERION cartouche. Hung
 * this near the drum it reads against the vestibule's own ceiling from the
 * approach and leaves the doorway clear.
 */
const LANTERN_Z = [ENTRY_INNER_Z + 0.15 * (ENTRY_Z - ENTRY_INNER_Z)];
const LANTERN_Y = 5.4;
const LANTERN_LIGHT = '#ffb45e';

/** a flame's cross-quads: the same three-sheet trick the greenery uses, so a
 *  flame has a silhouette from every angle without re-facing the camera */
const FLAME_CROSS = [0, Math.PI / 3, (2 * Math.PI) / 3];

function flameQuads(x: number, y: number, z: number, w: number, h: number): THREE.BufferGeometry[] {
  return FLAME_CROSS.map((a) => {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(a);
    g.translate(x, y + h / 2, z);
    return g;
  });
}

export function EntranceDressing({ still }: { still: boolean }) {
  const brassMat = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        overrides: { color: '#c09551', roughness: 0.36, metalness: 0.75, emissive: '#2a1e0c' },
      }),
    [],
  );
  const waxMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e8dcc0', roughness: 0.6 }), []);
  // unlit and additive, like every other flame in the building: a flame is a
  // source in the composition, not a surface waiting to be lit
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
  /** the lanterns' glass — lit from inside, so unlit here too */
  const glassMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffcf8c',
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  /** every bracket on both walls, in one buffer */
  const bracketGeom = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (const s of [-1, 1]) {
      for (const z of SCONCE_Z) {
        const x = s * WALL_X;
        // the back plate the whole thing hangs off
        const plate = new THREE.BoxGeometry(0.06, 0.5, 0.22);
        plate.translate(x, SCONCE_Y, z);
        parts.push(plate);
        // the scrolled arm, reaching out into the hall and turning up at its end
        const arm = new THREE.CylinderGeometry(0.028, 0.028, 0.42, 6);
        arm.rotateZ(Math.PI / 2);
        arm.translate(x - s * 0.21, SCONCE_Y - 0.06, z);
        parts.push(arm);
        const knee = new THREE.TorusGeometry(0.1, 0.026, 6, 14, Math.PI / 2);
        knee.rotateY(Math.PI / 2);
        knee.translate(x - s * 0.42, SCONCE_Y - 0.06, z);
        parts.push(knee);
        // the drip pan and the socket standing on it
        const pan = new THREE.CylinderGeometry(0.11, 0.09, 0.03, 12);
        pan.translate(x - s * 0.42, SCONCE_Y + 0.04, z);
        parts.push(pan);
        const socket = new THREE.CylinderGeometry(0.05, 0.06, 0.1, 10);
        socket.translate(x - s * 0.42, SCONCE_Y + 0.1, z);
        parts.push(socket);
      }
    }
    return mergeGeometries(parts, false)!;
  }, []);

  /** every taper, likewise */
  const candleGeom = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (const s of [-1, 1]) {
      for (const z of SCONCE_Z) {
        const c = new THREE.CylinderGeometry(0.032, 0.038, 0.3, 8);
        c.translate(s * WALL_X - s * 0.42, SCONCE_Y + 0.3, z);
        parts.push(c);
      }
    }
    return mergeGeometries(parts, false)!;
  }, []);

  /** every flame in the hall — the sconces' and the lanterns' — in one buffer */
  const flameGeom = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (const s of [-1, 1]) {
      for (const z of SCONCE_Z) {
        parts.push(...flameQuads(s * WALL_X - s * 0.42, SCONCE_Y + 0.44, z, 0.26, 0.4));
      }
    }
    for (const z of LANTERN_Z) parts.push(...flameQuads(0, LANTERN_Y - 0.18, z, 0.26, 0.36));
    return mergeGeometries(parts, false)!;
  }, []);

  /** both lanterns: the chain, the cage and the cap */
  const lanternGeom = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (const z of LANTERN_Z) {
      // the chain, run all the way to the coffers — a lantern hanging off
      // nothing is the tell of a light that was placed rather than hung
      const chain = new THREE.CylinderGeometry(0.02, 0.02, WING_H - LANTERN_Y - 0.4, 6);
      chain.translate(0, (WING_H + LANTERN_Y + 0.4) / 2 - 0.2, z);
      parts.push(chain);
      // the cap it hangs from, and the foot finial under the glass
      const cap = new THREE.ConeGeometry(0.3, 0.26, 8);
      cap.translate(0, LANTERN_Y + 0.42, z);
      parts.push(cap);
      const foot = new THREE.ConeGeometry(0.1, 0.16, 8);
      foot.rotateX(Math.PI);
      foot.translate(0, LANTERN_Y - 0.52, z);
      parts.push(foot);
      // four uprights, the cage the glass sits in
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i + Math.PI / 4;
        const bar = new THREE.BoxGeometry(0.035, 0.76, 0.035);
        bar.translate(Math.cos(a) * 0.19, LANTERN_Y - 0.06, z + Math.sin(a) * 0.19);
        parts.push(bar);
      }
      for (const y of [LANTERN_Y + 0.3, LANTERN_Y - 0.42]) {
        const ring = new THREE.TorusGeometry(0.26, 0.022, 6, 16);
        ring.rotateX(Math.PI / 2);
        ring.translate(0, y, z);
        parts.push(ring);
      }
    }
    return mergeGeometries(parts, false)!;
  }, []);

  /** the glazing, one merged pair */
  const glassGeom = useMemo(() => {
    const parts = LANTERN_Z.map((z) => {
      const g = new THREE.CylinderGeometry(0.22, 0.22, 0.68, 10, 1, true);
      g.translate(0, LANTERN_Y - 0.06, z);
      return g;
    });
    return mergeGeometries(parts, false)!;
  }, []);

  // the geometries and the three materials built here are ours to free. The
  // brass is NOT: it comes from the registry, which owns it and hands the same
  // instance to every other piece of brass in the building.
  useLayoutEffect(
    () => () => {
      [bracketGeom, candleGeom, flameGeom, lanternGeom, glassGeom].forEach((g) => g.dispose());
      [waxMat, flameMat, glassMat].forEach((m) => m.dispose());
    },
    [
      bracketGeom,
      candleGeom,
      flameGeom,
      lanternGeom,
      glassGeom,
      waxMat,
      flameMat,
      glassMat,
    ],
  );

  // the whole room breathes: one shared flicker driving both lanterns, so the
  // hall's light moves the way candlelight does without eight separate timers
  const lights = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!lights.current || still) return;
    const t = state.clock.elapsedTime;
    lights.current.children.forEach((c, i) => {
      const l = c as THREE.PointLight;
      l.intensity = 22 + Math.sin(t * 4.3 + i * 2.1) * 2.6 + Math.sin(t * 11 + i) * 1.3;
    });
  });

  return (
    <group>
      <mesh geometry={bracketGeom} material={brassMat} />
      <mesh geometry={candleGeom} material={waxMat} />
      <mesh geometry={lanternGeom} material={brassMat} />
      <mesh geometry={glassGeom} material={glassMat} renderOrder={2} />
      <mesh geometry={flameGeom} material={flameMat} renderOrder={3} />
      {/* THE GLORIA IS GONE from the door wall — the Eye of Providence in its
          triangle, the cloud bank, the halo behind them and the light in front
          of them all went with it, at the user's request. The wall above the
          inscription is bare wainscot again. Do not put it back. */}
      <group ref={lights}>
        {LANTERN_Z.map((z) => (
          <pointLight
            key={z}
            position={[0, LANTERN_Y - 0.1, z]}
            color={LANTERN_LIGHT}
            intensity={22}
            distance={14}
            decay={2}
            /* NOT POOLED. The vestibule is the first and last room a visitor
               sees, and pooled it went dark whenever they walked away — the
               entrance read as unlit from anywhere in the rotunda. Two
               permanent point lights, paid on every fragment forever; see the
               note on `noPool` in lightPool.tsx before adding a third. */
            userData={{ noPool: true }}
          />
        ))}
      </group>
    </group>
  );
}
