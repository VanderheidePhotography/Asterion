import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getGlowTexture } from './glowTexture';
import { getMaterial } from '../../../materials';
import { AXIAL_TILT, celestialGlobeMap, terrestrialGlobeMap } from './globeTexture';
import { mulberry32 } from '../../../domain/random';

/**
 * The furniture of a grand antique library — every piece procedural,
 * low-poly, warm wood and brass. No assets, no downloads: the whole
 * reading room is carved out of primitives.
 */

const WOOD_DARK = '#4e3a28';
const WOOD_MID = '#6b5138';
const WOOD_LIGHT = '#8a6a45';
const BRASS = '#b98a3d';
const PARCHMENT = '#e9dcba';
const BOOK_COLORS = ['#8a4636', '#9a6a2f', '#4a6a4e', '#3c5a72', '#7a3a4c', '#8a7a50'];

function Candle({ lit = true, flicker = false, still = false }: { lit?: boolean; flicker?: boolean; still?: boolean }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (light.current && flicker && !still) {
      const t = state.clock.elapsedTime;
      light.current.intensity = 7 + Math.sin(t * 9) * 1.4 + Math.sin(t * 23) * 0.8;
    }
  });
  return (
    <group>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.032, 0.038, 0.18, 8]} />
        <meshStandardMaterial color="#e8dcc0" roughness={0.6} />
      </mesh>
      {lit && (
        <>
          <sprite position={[0, 0.24, 0]} scale={[0.32, 0.42, 1]}>
            <spriteMaterial map={getGlowTexture()} color="#ffc36a" transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          {flicker && <pointLight ref={light} position={[0, 0.3, 0]} color="#ffb45e" intensity={7} distance={7} decay={2} />}
        </>
      )}
    </group>
  );
}

function BookPile({ seed, count = 3 }: { seed: number; count?: number }) {
  const books = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => ({
      w: 0.3 + r() * 0.14,
      d: 0.2 + r() * 0.1,
      rot: (r() - 0.5) * 0.7,
      color: BOOK_COLORS[Math.floor(r() * BOOK_COLORS.length)],
      y: 0.035 + i * 0.062,
    }));
  }, [seed, count]);
  return (
    <group>
      {books.map((b, i) => (
        <mesh key={i} position={[0, b.y, 0]} rotation-y={b.rot}>
          <boxGeometry args={[b.w, 0.06, b.d]} />
          <meshStandardMaterial color={b.color} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function OpenBookProp() {
  return (
    <group rotation-y={0.4}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.13, 0.02, 0]} rotation-z={s * -0.16} rotation-y={s * 0.06}>
          <boxGeometry args={[0.26, 0.02, 0.34]} />
          <meshStandardMaterial color={PARCHMENT} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * A ladder-back chair, and the reason it is not a slab any more.
 *
 * What was here was three boxes: a seat, four dowel legs, and a SOLID
 * 0.46 × 0.62 panel for the back. At every reading table that panel stands
 * behind the tabletop with its seat hidden — so from anywhere in the rotunda
 * it reads as a brown board floating over the desk, which is the single most
 * obviously game-asset object in the room.
 *
 * The fix is what a real joined chair has and a box does not: you can SEE
 * THROUGH IT. Two stiles, three slats and a shaped crest leave four gaps for
 * the wall behind to come through, and that negative space is the whole of
 * what makes a chair read as furniture rather than as a panel.
 *
 * The rest is wear: the seat is leather rather than more oak, the back legs
 * rake as a joiner's do, and there is a stretcher between the front legs where
 * four centuries of heels have gone.
 */
function Chair({ rotationY = 0 }: { rotationY?: number }) {
  const oak = <meshStandardMaterial color={WOOD_MID} roughness={0.72} />;
  const dark = <meshStandardMaterial color={WOOD_DARK} roughness={0.74} />;
  return (
    <group rotation-y={rotationY}>
      {/* the leather seat, dished by use, sitting inside its frame */}
      <mesh position={[0, 0.455, 0.01]}>
        <boxGeometry args={[0.42, 0.035, 0.4]} />
        <meshStandardMaterial color="#5a3a30" roughness={0.9} />
      </mesh>
      {/* the seat rails the leather is stretched over */}
      {[
        [0, 0.44, 0.21, 0.46, 0.05],
        [0, 0.44, -0.19, 0.46, 0.05],
        [-0.21, 0.44, 0.01, 0.05, 0.42],
        [0.21, 0.44, 0.01, 0.05, 0.42],
      ].map(([x, y, z, w, d], i) => (
        <mesh key={`rail${i}`} position={[x, y, z]}>
          <boxGeometry args={[w, 0.07, d]} />
          {oak}
        </mesh>
      ))}
      {/* legs — the back pair raked, as a joiner rakes them */}
      {(
        [
          [-0.19, 0.19, 0, 0.44],
          [0.19, 0.19, 0, 0.44],
          [-0.19, -0.17, -0.05, 0.44],
          [0.19, -0.17, 0.05, 0.44],
        ] as [number, number, number, number][]
      ).map(([x, z, tilt, h], i) => (
        <mesh key={`leg${i}`} position={[x, h / 2, z]} rotation-x={tilt}>
          <cylinderGeometry args={[0.024, 0.032, h, 6]} />
          {dark}
        </mesh>
      ))}
      {/* the stretcher the heels have worn */}
      <mesh position={[0, 0.16, 0.19]}>
        <cylinderGeometry args={[0.018, 0.018, 0.38, 6]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.82} />
      </mesh>
      {/* the back: two stiles carried up past the seat, and the slats between
          them. Everything you can see the room through is deliberate. */}
      {[-1, 1].map((s) => (
        <mesh key={`stile${s}`} position={[s * 0.19, 0.66, -0.2]} rotation-x={-0.06}>
          <boxGeometry args={[0.048, 0.62, 0.045]} />
          {oak}
        </mesh>
      ))}
      {[0.62, 0.76, 0.9].map((y, i) => (
        <mesh key={`slat${i}`} position={[0, y, -0.2 - (y - 0.66) * 0.06]} rotation-x={-0.06}>
          <boxGeometry args={[0.34, 0.075, 0.016]} />
          {oak}
        </mesh>
      ))}
      {/* the crest rail, and the two turned finials over the stiles */}
      <mesh position={[0, 0.965, -0.218]} rotation-x={-0.06}>
        <boxGeometry args={[0.43, 0.075, 0.038]} />
        {oak}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`fin${s}`} position={[s * 0.19, 1.02, -0.222]}>
          <sphereGeometry args={[0.03, 8, 6]} />
          {dark}
        </mesh>
      ))}
    </group>
  );
}

interface TableSpec {
  x: number;
  z: number;
  seed: number;
  candleLit: boolean;
  rot: number;
  /** skip chairs (someone else brought stools) */
  bare?: boolean;
  /** an interactive table — keep its top clear for the reading prop */
  clear?: boolean;
  /** a round pedestal table of this top radius, sized for the zodiac wheel */
  round?: number;
}

// mirrored pairs: the wizards' and the card game flank the entrance approach,
// two quiet study tables flank the way to the apse — balance in all things.
// three of the four now carry a reading (astrology, alchemy, sacred geometry)
export const TABLE_SPECS: TableSpec[] = [
  // squared to the seated reader (who always sits on the +z side facing −z) so
  // each table's edges line up with the interactable laid on it
  // kept in step with the station positions in GrandLibrary (9 m apart)
  { x: -4.5, z: 10.6, seed: 11, candleLit: true, rot: 0, clear: true, round: 1.0 }, // the zodiac table
  { x: 4.5, z: 10.6, seed: 23, candleLit: true, rot: 0, clear: true }, // the tarot table
  { x: -4.5, z: -10.6, seed: 37, candleLit: true, rot: 0, clear: true }, // the alchemist's bench
  { x: 4.5, z: -10.6, seed: 51, candleLit: true, rot: 0, clear: true }, // the kabbalist's table
];

/**
 * The four alcove tables.
 *
 * Each of these used to bring its own rug: two flat maroon quads at y 12 and 16
 * mm, no pattern, no border, no wear, in an inline material. They are gone —
 * the alcove rugs are WOVEN INTO the Cosmographia now (see `ALCOVES` in
 * cosmographiaArt.ts, whose four positions must track `TABLE_SPECS` above).
 *
 * That is not just tidying. A rug that belongs to a table moves with the table
 * and matches nothing around it, which is exactly the "furniture, not
 * architecture" problem the floor had everywhere. Woven into the sheet, these
 * four sit in the mandala's stone course, in its palette, with its wear — and
 * they land in the inter-gate wedges rather than on a processional way, which
 * is the reason there is room for them at all.
 */
/** which way each table's chairs are shoved. Fixed rather than random so the
 *  room is the same room every visit — the point is that no two are alike, not
 *  that they move. */
const SKEW = [1, -1, -1, 1];

export function ReadingTables({ still }: { still: boolean }) {
  const topMat = useMemo(() => getMaterial('wood_table_top', { repeat: [2, 1] }), []);
  return (
    <group>
      {TABLE_SPECS.map((t, ti) => {
        const R = t.round;
        return (
          <group key={ti} position={[t.x, 0, t.z]} rotation-y={t.rot}>
            {R ? (
              <>
                {/* a round pedestal table, its top sized to hold the wheel */}
                <mesh position={[0, 0.78, 0]} material={topMat}>
                  <cylinderGeometry args={[R, R, 0.09, 48]} />
                </mesh>
                <mesh position={[0, 0.71, 0]}>
                  <cylinderGeometry args={[R - 0.06, R - 0.1, 0.06, 48]} />
                  <meshStandardMaterial color={WOOD_MID} roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.4, 0]}>
                  <cylinderGeometry args={[0.14, 0.18, 0.72, 16]} />
                  <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.05, 0]}>
                  <cylinderGeometry args={[0.46, 0.52, 0.1, 28]} />
                  <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
                </mesh>
              </>
            ) : (
              <>
                {/* rectangular reading table */}
                <mesh position={[0, 0.78, 0]} material={topMat}>
                  <boxGeometry args={[2.5, 0.09, 1.15]} />
                </mesh>
                <mesh position={[0, 0.72, 0]}>
                  <boxGeometry args={[2.3, 0.08, 1.0]} />
                  <meshStandardMaterial color={WOOD_MID} roughness={0.7} />
                </mesh>
                {[[-1.08, -0.44], [1.08, -0.44], [-1.08, 0.44], [1.08, 0.44]].map(([x, z], i) => (
                  <mesh key={i} position={[x, 0.38, z]}>
                    <cylinderGeometry args={[0.05, 0.065, 0.75, 8]} />
                    <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
                  </mesh>
                ))}
              </>
            )}
            {/* generic book clutter only on the non-interactive rectangular tables */}
            {!t.clear && !R && (
              <>
                <group position={[-0.7, 0.83, 0.12]}>
                  <BookPile seed={t.seed} count={4} />
                </group>
                <group position={[0.25, 0.83, -0.1]}>
                  <OpenBookProp />
                </group>
              </>
            )}
            {/* The table's own candle keeps its flame but no longer carries a
                point light. The four stations are dressed by `studyProps` now,
                which lays an additive pool on the boards of every table and
                lights ONE real practical (the kabbalist's candlestick) for the
                whole set — so this light would be a second one on the same
                furniture, and lights are the scene's dearest resource. */}
            <group position={R ? [0, 0.83, -(R - 0.1)] : t.clear ? [1.05, 0.83, -0.42] : [0.92, 0.83, 0.3]}>
              <Candle lit={t.candleLit} flicker={false} still={still} />
            </group>

            {!t.bare && (
              <>
                {/* Pushed ASIDE rather than pushed back. A chair squared up to
                    a desk is the tell that nobody works here — but the seated
                    reader's camera sits on the table's centre line a metre and
                    a half out (see `seatFor`), so a chair shoved further out
                    lands in their face. Sideways and skewed does the job and
                    keeps the sightline clear. */}
                <group position={[0.3 * SKEW[ti], 0, R ? R + 0.5 : 1.24]}>
                  <Chair rotationY={Math.PI + 0.26 * SKEW[ti]} />
                </group>
                {!R && (
                  <group position={[-0.62, 0, -0.98]}>
                    <Chair rotationY={0.18 + 0.22 * SKEW[ti]} />
                  </group>
                )}
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

const FLAME_VERT = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
void main() {
  vUv = uv;
  vec3 p = position;
  p.x += sin(uTime * 7.0 + position.y * 9.0) * 0.05 * uv.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;
const FLAME_FRAG = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
void main() {
  float cx = abs(vUv.x - 0.5) * 2.0;
  float body = smoothstep(1.0, 0.15, cx + vUv.y * 0.6);
  float lick = 0.75 + 0.25 * sin(uTime * 11.0 + vUv.y * 14.0);
  vec3 col = mix(vec3(1.0, 0.45, 0.1), vec3(1.0, 0.85, 0.4), vUv.y);
  gl_FragColor = vec4(col, body * lick * (1.0 - vUv.y * 0.55));
}
`;

export function Fireplace({ still }: { still: boolean }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const light = useRef<THREE.PointLight>(null);
  const stoneMat = useMemo(() => getMaterial('stone_hearth', { repeat: [2, 1.6] }), []);
  const chairMat = useMemo(() => getMaterial('leather_upholstery', { repeat: [1, 1] }), []);
  useFrame((state) => {
    uniforms.uTime.value = still ? 1 : state.clock.elapsedTime;
    if (light.current && !still) {
      const t = state.clock.elapsedTime;
      light.current.intensity = 26 + Math.sin(t * 8.3) * 4 + Math.sin(t * 17.7) * 2.5;
    }
  });
  return (
    <group position={[-16.35, 0, 0]} rotation-y={Math.PI / 2}>
      {/* hearth rug and armchairs face the fire */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.014, 2.1]}>
        <circleGeometry args={[1.9, 24]} />
        <meshStandardMaterial color="#6b3540" roughness={0.95} />
      </mesh>
      {/* stone surround */}
      <mesh position={[0, 1.3, -0.1]} material={stoneMat}>
        <boxGeometry args={[3.4, 2.6, 0.9]} />
      </mesh>
      <mesh position={[0, 2.75, -0.1]}>
        <boxGeometry args={[3.8, 0.24, 1.1]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[0, 4.6, -0.25]} material={stoneMat}>
        <boxGeometry args={[2.6, 3.6, 0.6]} />
      </mesh>
      {/* firebox */}
      <mesh position={[0, 0.95, 0.28]}>
        <boxGeometry args={[2.0, 1.9, 0.25]} />
        <meshStandardMaterial color="#181210" roughness={1} />
      </mesh>
      {/* logs */}
      {[-0.25, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.28, 0.45]} rotation-z={Math.PI / 2} rotation-y={i * 0.5}>
          <cylinderGeometry args={[0.09, 0.09, 0.9, 7]} />
          <meshStandardMaterial color="#3a2a1c" roughness={0.9} />
        </mesh>
      ))}
      {/* flames — two crossed shader planes */}
      {[0, Math.PI / 2].map((ry) => (
        <mesh key={ry} position={[0, 0.85, 0.45]} rotation-y={ry}>
          <planeGeometry args={[1.1, 1.2, 6, 6]} />
          <shaderMaterial vertexShader={FLAME_VERT} fragmentShader={FLAME_FRAG} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <sprite position={[0, 1.1, 0.5]} scale={[2.4, 2, 1]}>
        <spriteMaterial map={getGlowTexture()} color="#ff9a3c" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight ref={light} position={[0, 1.3, 1.2]} color="#ff9a4a" intensity={26} distance={16} decay={1.9} />
      {/* two armchairs, angled toward the flames */}
      {[[-1.35, 2.5, 0.5], [1.35, 2.5, -0.5]].map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={Math.PI + (r as number)}>
          <mesh position={[0, 0.42, 0]} material={chairMat}>
            <boxGeometry args={[0.72, 0.3, 0.7]} />
          </mesh>
          <mesh position={[0, 0.85, -0.3]} material={chairMat}>
            <boxGeometry args={[0.72, 0.85, 0.16]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.36, 0.62, 0]} material={chairMat}>
              <boxGeometry args={[0.12, 0.36, 0.66]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export interface ChandelierSpot {
  pos: [number, number, number];
  rod: number;
  /** mount a real point light on this fixture (they are the scene's costliest resource) */
  light?: boolean;
  /** override the fixture's lamp strength — the rotunda's four carry the drum
   *  on their own now that no sun hangs under the dome */
  intensity?: number;
  /** how far the lamp reaches. The wings run theirs SHORT on purpose: a pool of
   *  light with real dark either side is what gives a 46 m hall depth. */
  reach?: number;
}

/* ————— the chandelier, built once and shared —————
 *
 * There are THIRTY-SIX of these in the building (four under the dome, four down
 * each of eight halls), and as separate meshes each one cost about forty-seven
 * draw calls: a canopy, a stem, a cone, two rings, then per arm a scroll, a
 * bobèche, a candle, a crystal and a flame sprite. That is roughly 1,700 draw
 * calls out of the scene's 1,614-per-frame budget — the single largest expense
 * in the museum, spent on a fixture the viewer reads as one object.
 *
 * The parts are identical on every fixture, so they are built ONCE at module
 * scope, baked into their final positions, and merged by material. A chandelier
 * is now six objects instead of forty-seven, and the geometry is shared across
 * all thirty-six rather than rebuilt per instance.
 *
 * Nothing about the silhouette changes. This is purely how it is submitted.
 */

const ARMS = 8;
const ARM_R = 1.15;
/** the arm-ring's radius, exported so a bird can perch ON the fixture rather
 *  than at a number copied out of this file */
export const CHANDELIER_ARM_R = ARM_R;

/** clone a geometry, bake a transform into it, and hand it to the merger */
function placed(
  geom: THREE.BufferGeometry,
  pos: [number, number, number],
  rot?: [number, number, number],
): THREE.BufferGeometry {
  const g = geom.clone();
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  if (rot) q.setFromEuler(new THREE.Euler(...rot));
  m.compose(new THREE.Vector3(...pos), q, new THREE.Vector3(1, 1, 1));
  g.applyMatrix4(m);
  // the source primitives are disposable; only the merged result survives
  return g;
}

/** every brass part of one fixture, merged into a single buffer */
const CHANDELIER_BRASS = (() => {
  const parts: THREE.BufferGeometry[] = [
    placed(new THREE.CylinderGeometry(0.14, 0.34, 0.34, 12), [0, 0.55, 0]),
    placed(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 8), [0, 0.2, 0]),
    placed(new THREE.ConeGeometry(0.09, 0.2, 10), [0, -0.28, 0]),
    placed(new THREE.TorusGeometry(ARM_R, 0.05, 8, 40), [0, 0.16, 0], [Math.PI / 2, 0, 0]),
    placed(new THREE.TorusGeometry(ARM_R * 0.6, 0.04, 8, 32), [0, 0.42, 0], [Math.PI / 2, 0, 0]),
  ];
  for (let k = 0; k < ARMS; k++) {
    const a = (k / ARMS) * Math.PI * 2;
    const scroll = placed(new THREE.CylinderGeometry(0.028, 0.028, ARM_R * 1.05, 6), [ARM_R * 0.5, 0.14, 0], [0, 0, -0.5]);
    const cup = placed(new THREE.CylinderGeometry(0.09, 0.05, 0.05, 10), [ARM_R, 0.18, 0]);
    for (const g of [scroll, cup]) {
      g.rotateY(a);
      parts.push(g);
    }
  }
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
})();

/** the eight wax candles */
const CHANDELIER_WAX = (() => {
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < ARMS; k++) {
    const a = (k / ARMS) * Math.PI * 2;
    const g = placed(new THREE.CylinderGeometry(0.032, 0.038, 0.18, 8), [ARM_R, 0.29, 0]);
    g.rotateY(a);
    parts.push(g);
  }
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
})();

/** the eight hanging crystal drops, set between the arms */
const CHANDELIER_CRYSTAL = (() => {
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < ARMS; k++) {
    const a = (k / ARMS) * Math.PI * 2 + Math.PI / ARMS;
    const g = placed(new THREE.OctahedronGeometry(0.07, 0), [ARM_R * 0.82, 0.08, 0]);
    g.rotateY(a);
    parts.push(g);
  }
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
})();

/**
 * The flames. Eight additive sprites per fixture was 288 more draw calls across
 * the building; one `Points` carrying eight vertices is one. Points are
 * camera-facing and size-attenuated by definition, which is the entire reason a
 * sprite was being used — so the look survives the change intact.
 */
const CHANDELIER_FLAMES = (() => {
  const pos = new Float32Array(ARMS * 3);
  for (let k = 0; k < ARMS; k++) {
    const a = (k / ARMS) * Math.PI * 2;
    pos[k * 3] = Math.cos(-a) * ARM_R;
    pos[k * 3 + 1] = 0.44;
    pos[k * 3 + 2] = Math.sin(-a) * ARM_R;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return g;
})();

/* The five materials a fixture wears. Module-scope singletons, so all 36 share
 * one of each and the renderer can keep the same program bound across them.
 *
 * ── these used to be the brightest objects in the museum ────────────────────
 * The frame was polished brass at metalness 0.85 / roughness 0.35 and the
 * central globe was self-luminous. Thirty-six of them, and the result was that
 * a visitor walking in looked at the light fittings — not at the architecture,
 * not up the moonlight shaft, not at the dome. The hierarchy was upside down.
 *
 * A fixture in a room lit by its own candles is a SILHOUETTE. The iron carries
 * a thin highlight along whatever edge faces a flame and is otherwise part of
 * the ceiling's darkness. Only the flames emit.
 */
const chandelierBrass = new THREE.MeshStandardMaterial({
  // hand-forged iron, scaled and black-oxidised — not a machined brass casting
  color: '#191512',
  metalness: 0.72,
  // rough enough that the specular is a suggestion rather than a mirror; forged
  // iron never took a polish and eight centuries of candle soot finished the job
  roughness: 0.78,
});
/**
 * The globe at the heart. It kept its warmth but lost its glow — emissive down
 * from 0.9 to 0.12, which is the difference between a lamp and a bead of glass
 * catching the candles around it. It is no longer a light source; the flames
 * are the only things in the fixture that are.
 */
const chandelierGlobe = new THREE.MeshStandardMaterial({
  color: '#7a6242',
  emissive: '#3a2408',
  emissiveIntensity: 0.12,
  metalness: 0.4,
  roughness: 0.55,
});
/** tallow, not wax: dirty cream, completely matte, and it has been burning */
const chandelierWax = new THREE.MeshStandardMaterial({ color: '#cabfa2', roughness: 0.92 });
/** the hanging drops. Rock crystal is the ONE thing on the fixture allowed a
 *  real highlight — it is why drops were hung on chandeliers in the first
 *  place — but there are only eight of them and they are 7 cm across. */
const chandelierCrystal = new THREE.MeshStandardMaterial({
  color: '#b9c6d2',
  metalness: 0.1,
  roughness: 0.08,
  transparent: true,
  opacity: 0.55,
});
/**
 * The flames — now the only part of the fixture that emits anything.
 *
 * Each fixture gets its OWN clone of this, because candles do not flicker in
 * unison and thirty-six fixtures pulsing together reads instantly as a shader.
 * A PointsMaterial per fixture costs nothing here: every flame cluster is
 * already its own draw call, so there is no batching to lose.
 */
const chandelierFlameProto = new THREE.PointsMaterial({
  map: getGlowTexture(),
  color: '#ffb257',
  size: 0.3,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.52,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  toneMapped: false,
});

/** one fully-modelled hanging chandelier: a suspension rod, a tiered brass
 *  body with a central globe, curved candle-arms, and hanging crystal drops.
 *  Pivots from the ceiling anchor so it sways as a real fixture would. */
function Chandelier({ rod, still, seed, light, intensity = 38, reach = 31 }: { rod: number; still: boolean; seed: number; light: boolean; intensity?: number; reach?: number }) {
  const arm = useRef<THREE.Group>(null);
  const lampRef = useRef<THREE.PointLight>(null);

  /** this fixture's own flames, so it flickers on its own schedule */
  const flameMat = useMemo(() => {
    const m = chandelierFlameProto.clone();
    // no two fixtures are trimmed alike: a little warmer or cooler, a little
    // higher or lower, fixed per fixture so it reads as maintenance rather
    // than as noise
    const rng = mulberry32(Math.floor(seed * 1000) + 7);
    m.color = new THREE.Color('#ffb257').offsetHSL((rng() - 0.5) * 0.03, 0, (rng() - 0.5) * 0.09);
    m.opacity = 0.42 + rng() * 0.2;
    return m;
  }, [seed]);
  useEffect(() => () => flameMat.dispose(), [flameMat]);
  const baseOpacity = useMemo(() => flameMat.opacity, [flameMat]);

  useFrame((state) => {
    if (still) return;
    const t = state.clock.elapsedTime;
    if (arm.current) {
      // pivot the whole fixture from its ceiling anchor (top of the chain)
      arm.current.rotation.z = Math.sin(t * 0.4 + seed) * 0.02;
      arm.current.rotation.x = Math.cos(t * 0.33 + seed) * 0.015;
      arm.current.rotation.y = t * 0.03;
    }
    // Candle flicker. Three incommensurate frequencies rather than one, because
    // a single sine reads as a pulse and a real flame does not repeat. The
    // fixture's own seed offsets the whole thing so no two are in step.
    const f =
      1 +
      Math.sin(t * 6.1 + seed * 3.7) * 0.09 +
      Math.sin(t * 13.3 + seed * 1.9) * 0.05 +
      Math.sin(t * 27.7 + seed) * 0.025;
    flameMat.opacity = baseOpacity * f;
    if (lampRef.current) lampRef.current.intensity = intensity * f;
  });
  return (
    <group ref={arm}>
      {/* suspension rod rising to the ceiling anchor above — a single mesh
          where a chain of torus links once cost hundreds of draw calls. It
          stays separate from the merged body because its LENGTH varies: the
          rotunda's four hang on 12 m, the halls' on 3 m. */}
      <mesh position={[0, 0.45 + rod / 2, 0]} material={chandelierBrass}>
        <cylinderGeometry args={[0.04, 0.04, rod, 6]} />
      </mesh>
      {/* the fixture hangs at the origin (the given anchor point) */}
      <group position={[0, 0, 0]}>
        {/* canopy, stem, cone, both rings, eight scroll arms and eight
            bobèches — one buffer, one draw call, shared by all 36 fixtures */}
        <mesh geometry={CHANDELIER_BRASS} material={chandelierBrass} />
        {/* the glowing globe at the heart of the fixture */}
        <mesh position={[0, -0.05, 0]} material={chandelierGlobe}>
          <sphereGeometry args={[0.19, 16, 14]} />
        </mesh>
        <mesh geometry={CHANDELIER_WAX} material={chandelierWax} />
        <mesh geometry={CHANDELIER_CRYSTAL} material={chandelierCrystal} />
        {/* eight flames as one Points */}
        <points geometry={CHANDELIER_FLAMES} material={flameMat} />
        {/* warm magical pool of light — slightly stronger, as only some
            fixtures in a wing carry a real light */}
        {light && (
          <pointLight
            ref={lampRef}
            position={[0, 0, 0]}
            // deep amber rather than the old near-white gold: candles are a
            // long way down the blackbody curve and the palette wants the warm
            // and the cool genuinely separated, not both drifting to cream
            color="#ff9d42"
            intensity={intensity}
            distance={reach}
            decay={2}
          />
        )}
      </group>
    </group>
  );
}

export function Chandeliers({ still, spots }: { still: boolean; spots: ChandelierSpot[] }) {
  return (
    <group>
      {spots.map((s, i) => (
        <group key={i} position={s.pos}>
          <Chandelier rod={s.rod} still={still} seed={i * 2.1} light={s.light ?? true} intensity={s.intensity} reach={s.reach} />
        </group>
      ))}
    </group>
  );
}

interface LadderSpot {
  /** world position and yaw of the group; ladder leans toward local −z */
  pos: [number, number];
  yaw: number;
}

export function Ladders({ spots }: { spots: LadderSpot[] }) {
  return (
    <group>
      {spots.map((s, i) => (
        <group key={i} position={[s.pos[0], 0, s.pos[1]]} rotation-y={s.yaw}>
          <group rotation-x={-0.15}>
            {[-0.28, 0.28].map((x) => (
              <mesh key={x} position={[x, 2.4, 0]}>
                <boxGeometry args={[0.07, 4.8, 0.07]} />
                <meshStandardMaterial color={WOOD_MID} roughness={0.7} />
              </mesh>
            ))}
            {Array.from({ length: 9 }, (_, k) => (
              <mesh key={k} position={[0, 0.5 + k * 0.5, 0]}>
                <boxGeometry args={[0.56, 0.05, 0.06]} />
                <meshStandardMaterial color={WOOD_LIGHT} roughness={0.7} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
}

/**
 * The pair of library globes flanking the Librarian's desk: one terrestrial,
 * one celestial.
 *
 * The pairing is the point. Two globes — the earth and the starry heavens —
 * stand on the pillars of nearly every Masonic tracing board and lodge room of
 * the period this library covers, and a reading room of this date would have
 * bought them as a matched pair from the same maker. So they are built as a
 * matched pair here: identical stands, identical mountings, and the only
 * difference is what is engraved on the sphere.
 *
 * Both are mounted the way a real library globe is, which is what the earlier
 * pair of plain coloured balls was missing: the sphere turns on a polar axis
 * tilted to Earth's own obliquity, carried in a full brass meridian ring that
 * holds the poles, sitting inside a flat wooden horizon ring on a turned
 * column. See globeTexture for the two skins.
 */
const GLOBE_BALL_R = 0.52;
/** the height the horizon ring — and so the globe's centre — stands at */
const GLOBE_CENTRE_Y = 1.35;

export function Globes({ still }: { still: boolean }) {
  const balls = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((_, delta) => {
    if (still) return;
    // both turn, and at slightly different rates — a matched pair of
    // instruments, not one prop mirrored
    balls.current.forEach((b, i) => {
      if (b) b.rotation.y += delta * (i === 0 ? 0.1 : 0.075);
    });
  });
  const globes = useMemo(
    () => [
      // the two skins sit at opposite ends of the value range — pale sized
      // parchment against a night ground — so they need opposite amounts of
      // help. At one shared setting the terrestrial blew out to a white ball
      // while the celestial still read as black.
      { pos: [-5.4, 0, -14.6] as [number, number, number], map: terrestrialGlobeMap(), glow: 0.05 },
      { pos: [5.4, 0, -14.6] as [number, number, number], map: celestialGlobeMap(), glow: 0.3 },
    ],
    [],
  );
  const ballMats = useMemo(
    () =>
      globes.map(
        (g) =>
          new THREE.MeshStandardMaterial({
            map: g.map,
            roughness: 0.78,
            metalness: 0,
            // old varnish keeps a little life in the shadowed limb, and the
            // apse is dim; without it the celestial globe reads as a black ball
            emissive: new THREE.Color('#ffffff'),
            emissiveMap: g.map,
            emissiveIntensity: g.glow,
          }),
      ),
    [globes],
  );
  useEffect(() => () => ballMats.forEach((m) => m.dispose()), [ballMats]);

  return (
    <group>
      {globes.map((g, i) => (
        <group key={i} position={g.pos}>
          {/* the turned column and its splayed foot */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.3, 0.38, 0.1, 12]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.72} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.075, 0.2, 0.9, 12]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.72} />
          </mesh>
          <mesh position={[0, 1.02, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.085, 0.024, 6, 20]} />
            <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.36} />
          </mesh>
          {/* three stays from the column up to the horizon ring */}
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) => (
            <mesh
              key={a}
              position={[
                Math.cos(a) * 0.38,
                GLOBE_CENTRE_Y - 0.16,
                Math.sin(a) * 0.38,
              ]}
              rotation-z={-0.32}
              rotation-y={-a}
            >
              <cylinderGeometry args={[0.022, 0.022, 0.44, 6]} />
              <meshStandardMaterial color={WOOD_MID} roughness={0.7} />
            </mesh>
          ))}
          {/* the flat wooden horizon ring the globe sits inside */}
          <mesh position={[0, GLOBE_CENTRE_Y, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.72, 0.055, 6, 40]} />
            <meshStandardMaterial color={WOOD_LIGHT} roughness={0.68} />
          </mesh>
          {/* the tilted mounting: a full brass meridian holding the poles, the
              engraved sphere turning inside it, and a pin at each pole */}
          <group position={[0, GLOBE_CENTRE_Y, 0]} rotation-z={AXIAL_TILT}>
            <mesh>
              <torusGeometry args={[GLOBE_BALL_R + 0.09, 0.022, 8, 64]} />
              <meshStandardMaterial color={BRASS} metalness={0.82} roughness={0.34} />
            </mesh>
            {[1, -1].map((s) => (
              <mesh key={s} position={[0, s * (GLOBE_BALL_R + 0.05), 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
                <meshStandardMaterial color={BRASS} metalness={0.82} roughness={0.34} />
              </mesh>
            ))}
            <mesh
              ref={(m) => {
                balls.current[i] = m;
              }}
              material={ballMats[i]}
            >
              <sphereGeometry args={[GLOBE_BALL_R, 40, 28]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/** stray piles of books at shelf-ends and corners — a library that is used */
export function FloorBookPiles({ spots }: { spots: [number, number][] }) {
  return (
    <group>
      {spots.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <BookPile seed={100 + i * 7} count={3 + (i % 3)} />
        </group>
      ))}
    </group>
  );
}

/**
 * How many planes make up one plant, and how they are turned.
 *
 * THREE, at 60° to each other. This is the whole reason the greenery reads as
 * greenery now: what was here was `<sprite>`s, and a sprite re-faces the camera
 * every frame, so the old ferns swivelled to watch the visitor walk past and
 * were perfectly flat from every angle — a plant with no thickness and no fixed
 * orientation, which the eye reads as a decal long before it reads as a plant.
 *
 * Fixed intersecting quads solve both at once. From any direction one sheet is
 * near face-on and another near edge-on, and the pair reads as volume; walking
 * round one, the silhouette changes, because it is actually a different shape
 * from over there. Two planes is the usual budget and leaves a thin angle where
 * the plant nearly vanishes; three closes it for one extra quad.
 */
const CROSS = [0, Math.PI / 3, (2 * Math.PI) / 3];

/**
 * Potted greenery, and the creepers that have got into the building.
 *
 * `pots` are hero plants — one at each wing mouth — built individually, since
 * there are only a handful and each is a landmark. `trails` are the long
 * creepers spilling off ledges, which is where the vine cover in the rotunda
 * comes from; the wings have their own, instanced by `WingArcade`.
 *
 * All the foliage is `alphaTest` off the registry, so it lands in the opaque
 * queue: forty transparent leaf quads in one room means forty depth-sorted
 * draws every frame, and a leaf's edge is hard anyway.
 */
export function Greenery({
  pots,
  trails,
}: {
  pots: { pos: [number, number]; tall?: boolean; bloom?: boolean; seed: number }[];
  /** [x, y, z, width, drop, rotY] — a creeper hanging off a ledge */
  trails: [number, number, number, number, number, number][];
}) {
  const fernMat = useMemo(() => getMaterial('misc_fern'), []);
  const palmMat = useMemo(() => getMaterial('misc_palm'), []);
  const shrubMat = useMemo(() => getMaterial('misc_shrub'), []);
  const trailMat = useMemo(() => getMaterial('misc_trail'), []);
  const potMat = useMemo(() => getMaterial('stone_terracotta', { repeat: [3, 1] }), []);
  const soilMat = useMemo(() => getMaterial('misc_soil', { repeat: [1, 1] }), []);
  return (
    <group>
      {pots.map((p, i) => {
        const rng = mulberry32(p.seed);
        const leaf = p.bloom ? shrubMat : p.tall ? palmMat : fernMat;
        // the crown's height and spread; tall pots carry a stem first
        const crown = p.tall ? 1.55 : 0.86;
        const spread = p.tall ? 1.55 : 1.25;
        const lean = (rng() - 0.5) * 0.14; // nothing has grown perfectly upright
        return (
          <group key={i} position={[p.pos[0], 0, p.pos[1]]} rotation-y={rng() * Math.PI}>
            {/* The pot: a thrown body with a real rolled rim and a foot it
                stands on, rather than one tapered cylinder. Ten sides was also
                too few to read as round at this size — a pot is a thing the
                visitor walks right past. */}
            <mesh position={[0, 0.04, 0]} material={potMat}>
              <cylinderGeometry args={[0.235, 0.215, 0.08, 20]} />
            </mesh>
            <mesh position={[0, 0.3, 0]} material={potMat}>
              <cylinderGeometry args={[0.32, 0.235, 0.46, 20]} />
            </mesh>
            <mesh position={[0, 0.55, 0]} material={potMat}>
              <cylinderGeometry args={[0.35, 0.335, 0.08, 20]} />
            </mesh>
            {/* the rolled lip. A torus is born in the XY plane, so it is the
                MESH that lies it down — `rotateX` is a method on the geometry,
                not a prop, and passing it as one takes the whole canvas out. */}
            <mesh position={[0, 0.6, 0]} rotation-x={Math.PI / 2} material={potMat}>
              <torusGeometry args={[0.345, 0.028, 6, 24]} />
            </mesh>
            {/* the earth, sunk below the rim so you look down INTO the pot */}
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.52, 0]} material={soilMat}>
              <circleGeometry args={[0.325, 20]} />
            </mesh>
            {p.tall && (
              <mesh position={[0, 1.0, 0]} rotation-z={lean} material={potMat}>
                <cylinderGeometry args={[0.045, 0.075, 0.95, 8]} />
              </mesh>
            )}
            {/* the crown — three fixed sheets, not a swarm of billboards */}
            <group position={[0, p.tall ? 1.42 : 0.5, 0]} rotation-z={lean}>
              {CROSS.map((a, k) => (
                <mesh key={k} rotation-y={a} material={leaf} position={[0, crown / 2, 0]}>
                  <planeGeometry args={[spread, crown]} />
                </mesh>
              ))}
            </group>
            {/* growth spilling over the rim, so the plant and the pot touch
                instead of the crown floating above a clean lip */}
            {CROSS.map((a, k) => (
              <mesh key={`s${k}`} rotation-y={a + 0.4} position={[0, 0.36, 0]} material={trailMat}>
                <planeGeometry args={[0.78, 0.52]} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* creepers off a ledge: two crossed sheets each, hung from the top edge
          (the sheet is painted head-down, so the plane's own top is the ledge) */}
      {trails.map(([x, y, z, wdt, drop, rotY], i) => (
        <group key={i} position={[x, y, z]} rotation-y={rotY}>
          {[0, Math.PI / 2.6].map((a, k) => (
            <mesh key={k} rotation-y={a} position={[0, -drop / 2, 0]} material={trailMat}>
              <planeGeometry args={[wdt * (k ? 0.7 : 1), drop]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** the grandfather clock, keeping time that may not be ours */
export function GrandfatherClock({ position, rotationY, still }: { position: [number, number]; rotationY: number; still: boolean }) {
  const pendulum = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (pendulum.current && !still) pendulum.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.4) * 0.22;
  });
  return (
    <group position={[position[0], 0, position[1]]} rotation-y={rotationY}>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.9, 3.2, 0.55]} />
        <meshStandardMaterial color="#4a3421" roughness={0.6} />
      </mesh>
      {/* face */}
      <mesh position={[0, 2.6, 0.29]}>
        <circleGeometry args={[0.3, 24]} />
        <meshStandardMaterial color="#e9dcba" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.6, 0.3]} rotation-z={-0.8}>
        <boxGeometry args={[0.02, 0.22, 0.01]} />
        <meshStandardMaterial color="#2a2118" />
      </mesh>
      <mesh position={[0, 2.6, 0.3]} rotation-z={2.1}>
        <boxGeometry args={[0.02, 0.16, 0.01]} />
        <meshStandardMaterial color="#2a2118" />
      </mesh>
      {/* pendulum window */}
      <mesh position={[0, 1.15, 0.28]}>
        <planeGeometry args={[0.5, 1.5]} />
        <meshStandardMaterial color="#241a12" roughness={0.4} />
      </mesh>
      <group ref={pendulum} position={[0, 1.85, 0.3]}>
        <mesh position={[0, -0.55, 0]}>
          <boxGeometry args={[0.03, 1.1, 0.01]} />
          <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, -1.12, 0]}>
          <circleGeometry args={[0.11, 16]} />
          <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.35} />
        </mesh>
      </group>
      <mesh position={[0, 3.35, 0]} rotation-z={Math.PI}>
        <torusGeometry args={[0.42, 0.09, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#4a3421" roughness={0.6} />
      </mesh>
    </group>
  );
}
