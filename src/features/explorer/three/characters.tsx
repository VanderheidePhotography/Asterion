import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getGlowTexture } from './glowTexture';
import { catalogueDrawers, starryRobe } from './textures';
import { getSigilTexture } from './sigils';
import { mulberry32 } from '../../../domain/random';
import { registerPickable, unregisterPickable } from './ManualPicker';
import { APSE_HALF } from './layout';
import { getMaterial } from '../../../materials';
import { GLBModel } from './GLBModel';
import { useHeldForReveal } from './Deferred';

/**
 * The regulars. Three wizards deep in discussion over pipes at one table;
 * a troll and an elf playing cards at another. Low-poly, gentle idle
 * animation, pipe smoke that actually drifts. The library is lived-in.
 */

function PipeSmoke({ origin, seed, still }: { origin: [number, number, number]; seed: number; still: boolean }) {
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const rng = useMemo(() => mulberry32(seed), [seed]);
  const offsets = useMemo(() => Array.from({ length: 4 }, () => rng() * 6), [rng]);
  useFrame((state) => {
    if (still) return;
    const t = state.clock.elapsedTime;
    sprites.current.forEach((s, i) => {
      if (!s) return;
      const k = ((t * 0.24 + offsets[i]) % 1.6) / 1.6; // 0..1 life
      s.position.set(
        origin[0] + Math.sin((t + offsets[i]) * 1.3) * 0.07 * k,
        origin[1] + k * 1.1,
        origin[2] + Math.cos((t + offsets[i]) * 1.1) * 0.06 * k,
      );
      const mat = s.material as THREE.SpriteMaterial;
      mat.opacity = 0.24 * Math.sin(Math.PI * k);
      s.scale.setScalar(0.12 + k * 0.34);
    });
  });
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <sprite
          key={i}
          ref={(s) => {
            sprites.current[i] = s;
          }}
          position={origin}
        >
          <spriteMaterial map={getGlowTexture()} color="#cfc8d8" transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

interface WizardProps {
  robe: string;
  hat?: boolean;
  beard?: string;
  skin?: string;
  ears?: boolean;
  bulky?: boolean;
  seed: number;
  still: boolean;
  pipe?: boolean;
  /** star-and-moon spangled cloth */
  starry?: boolean;
  /** hair colour for the bare-headed */
  hair?: string;
  /** an ancient sage: a long flowing beard and a staff resting at hand */
  sage?: boolean;
}

/** a seated figure on a stool — wizard, elf, or troll by proportion */
function SeatedFigure({
  robe,
  hat = true,
  beard,
  skin = '#d9b28a',
  ears = false,
  bulky = false,
  seed,
  still,
  pipe = false,
  starry = false,
  hair,
  sage = false,
}: WizardProps) {
  const robeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: starry ? starryRobe(robe, seed) : null,
        color: starry ? '#ffffff' : robe,
        roughness: 0.85,
      }),
    [robe, starry, seed],
  );
  useEffect(() => () => robeMat.dispose(), [robeMat]);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Mesh>(null);
  const rng = useMemo(() => mulberry32(seed), [seed]);
  const phase = useMemo(() => rng() * 10, [rng]);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    if (still) return;
    const t = state.clock.elapsedTime + phase;
    if (body.current) body.current.scale.y = 1 + Math.sin(t * 1.1) * 0.012; // breathing
    if (head.current) {
      const h = head.current;
      // idle conversation nods…
      let ty = Math.sin(t * 0.35) * 0.5 + Math.sin(t * 0.11) * 0.25;
      let tx = Math.sin(t * 0.7) * 0.06;
      // …unless a visitor is close: then the head turns to follow them
      h.getWorldPosition(look);
      const dist = Math.hypot(state.camera.position.x - look.x, state.camera.position.z - look.z);
      if (dist < 6 && h.parent) {
        look.copy(state.camera.position);
        h.parent.worldToLocal(look);
        look.sub(h.position);
        const yaw = Math.atan2(look.x, look.z);
        // only if the visitor is in front — no owl necks
        if (Math.abs(yaw) < 1.2) {
          const pitch = -Math.atan2(look.y, Math.hypot(look.x, look.z)) * 0.5;
          const k = THREE.MathUtils.clamp((6 - dist) / 2.2, 0, 1);
          ty = THREE.MathUtils.lerp(ty, THREE.MathUtils.clamp(yaw, -1.0, 1.0), k);
          tx = THREE.MathUtils.lerp(tx, THREE.MathUtils.clamp(pitch, -0.35, 0.2), k);
        }
      }
      h.rotation.y = THREE.MathUtils.damp(h.rotation.y, ty, 5, delta);
      h.rotation.x = THREE.MathUtils.damp(h.rotation.x, tx, 5, delta);
    }
    if (arm.current) arm.current.rotation.z = 0.6 + Math.sin(t * 0.5) * 0.16; // gesturing / raising the pipe
  });
  const w = bulky ? 1.35 : 1;
  return (
    <group>
      {/* stool */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.26 * w, 0.3 * w, 0.08, 8]} />
        <meshStandardMaterial color="#5a4530" roughness={0.7} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.18, 0.2, Math.sin(a) * 0.18]}>
            <cylinderGeometry args={[0.03, 0.035, 0.42, 6]} />
            <meshStandardMaterial color="#4a3624" roughness={0.7} />
          </mesh>
        );
      })}
      <group ref={body} position={[0, 0.46, 0]}>
        {/* robed body */}
        <mesh position={[0, 0.42, 0]} material={robeMat}>
          <coneGeometry args={[0.34 * w, 0.95, 12]} />
        </mesh>
        {/* a belt with a brass buckle */}
        <mesh position={[0, 0.42, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.235 * w, 0.022, 6, 16]} />
          <meshStandardMaterial color="#3a2a1c" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.42, 0.235 * w]}>
          <boxGeometry args={[0.06, 0.05, 0.02]} />
          <meshStandardMaterial color="#b98a3d" metalness={0.8} roughness={0.35} />
        </mesh>
        {/* arms and hands */}
        <mesh position={[-0.26 * w, 0.62, 0.08]} rotation-z={-0.5} material={robeMat}>
          <capsuleGeometry args={[0.06 * w, 0.3, 4, 8]} />
        </mesh>
        <mesh position={[-0.34 * w, 0.5, 0.12]}>
          <sphereGeometry args={[0.045 * w, 8, 6]} />
          <meshStandardMaterial color={skin} roughness={0.75} />
        </mesh>
        <mesh ref={arm} position={[0.26 * w, 0.62, 0.08]} rotation-z={0.6} material={robeMat}>
          <capsuleGeometry args={[0.06 * w, 0.3, 4, 8]} />
        </mesh>
        <mesh position={[0.33 * w, 0.76, 0.12]}>
          <sphereGeometry args={[0.045 * w, 8, 6]} />
          <meshStandardMaterial color={skin} roughness={0.75} />
        </mesh>
        {/* head */}
        <group ref={head} position={[0, 1.02, 0]}>
          <mesh>
            <sphereGeometry args={[0.155 * w, 12, 10]} />
            <meshStandardMaterial color={skin} roughness={0.75} />
          </mesh>
          {ears &&
            [-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.15 * w, 0.04, 0]} rotation-z={s * -1.15}>
                <coneGeometry args={[0.04, 0.18, 6]} />
                <meshStandardMaterial color={skin} roughness={0.75} />
              </mesh>
            ))}
          {/* nose */}
          <mesh position={[0, -0.01, 0.145 * w]}>
            <sphereGeometry args={[0.025 * w, 6, 5]} />
            <meshStandardMaterial color={skin} roughness={0.75} />
          </mesh>
          {beard && (
            <group>
              {/* a long, flowing sage's beard cascading down the chest */}
              <mesh position={[0, sage ? -0.34 : -0.15, 0.08]} rotation-x={0.18}>
                <coneGeometry args={[0.13 * w, sage ? 0.72 : 0.34, 10]} />
                <meshStandardMaterial color={beard} roughness={0.92} />
              </mesh>
              {sage && (
                <>
                  {/* moustache + fuller cheeks so the beard frames the face */}
                  <mesh position={[0, -0.08, 0.12]} scale={[1.15, 0.7, 0.9]}>
                    <sphereGeometry args={[0.13 * w, 10, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55]} />
                    <meshStandardMaterial color={beard} roughness={0.92} />
                  </mesh>
                  {/* long silver hair falling behind */}
                  <mesh position={[0, 0.02, -0.06]} scale={[1.1, 1.15, 1.0]}>
                    <sphereGeometry args={[0.16 * w, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
                    <meshStandardMaterial color={beard} roughness={0.9} />
                  </mesh>
                </>
              )}
            </group>
          )}
          {hair && (
            <mesh position={[0, 0.05, -0.02]} scale={[1.05, 0.85, 1.05]}>
              <sphereGeometry args={[0.155 * w, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
              <meshStandardMaterial color={hair} roughness={0.85} />
            </mesh>
          )}
          {hat && (
            <group position={[0, 0.13, 0]} rotation-z={0.12}>
              <mesh material={robeMat}>
                <cylinderGeometry args={[0.2 * w, 0.24 * w, 0.03, 12]} />
              </mesh>
              <mesh position={[0, 0.19, 0]} material={robeMat}>
                <coneGeometry args={[0.13 * w, 0.42, 10]} />
              </mesh>
              {/* hat band */}
              <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.135 * w, 0.15 * w, 0.05, 10]} />
                <meshStandardMaterial color="#b98a3d" metalness={0.6} roughness={0.4} />
              </mesh>
            </group>
          )}
          {pipe && (
            <group position={[0.1 * w, -0.08, 0.13]} rotation-z={-0.4}>
              <mesh rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.012, 0.012, 0.16, 6]} />
                <meshStandardMaterial color="#3a2a1c" roughness={0.6} />
              </mesh>
              <mesh position={[0, 0, 0.09]}>
                <sphereGeometry args={[0.03, 8, 6]} />
                <meshStandardMaterial color="#3a2a1c" roughness={0.6} />
              </mesh>
            </group>
          )}
        </group>
      </group>
      {sage && (
        // an elegant staff resting against the sage's side, a lit crystal atop
        <group position={[0.5 * w, 0, 0.16]} rotation-z={-0.16} rotation-x={-0.05}>
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.032, 0.045, 2.15, 8]} />
            <meshStandardMaterial color="#4a3421" roughness={0.75} />
          </mesh>
          {/* gnarled knot near the grip */}
          <mesh position={[0, 1.55, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#3a2818" roughness={0.8} />
          </mesh>
          {/* crown of prongs cradling a glowing crystal */}
          {[0, 1, 2, 3].map((k) => {
            const a = (k / 4) * Math.PI * 2;
            return (
              <mesh key={k} position={[Math.cos(a) * 0.07, 2.14, Math.sin(a) * 0.07]} rotation-z={Math.cos(a) * 0.5} rotation-x={-Math.sin(a) * 0.5}>
                <cylinderGeometry args={[0.012, 0.02, 0.2, 5]} />
                <meshStandardMaterial color="#6a4a2a" roughness={0.7} />
              </mesh>
            );
          })}
          <mesh position={[0, 2.28, 0]}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial color="#bfe6ff" emissive="#7fb4e6" emissiveIntensity={1.4} roughness={0.1} metalness={0.2} />
          </mesh>
          <sprite position={[0, 2.28, 0]} scale={[0.7, 0.7, 1]}>
            <spriteMaterial map={getGlowTexture()} color="#a8d0ff" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <pointLight position={[0, 2.28, 0]} color="#a8d0ff" intensity={4} distance={4} decay={2} />
        </group>
      )}
    </group>
  );
}

/** seat positions around the council table (shared with the model wizards) */
export const COUNCIL_SEATS = [0.4, 2.4, 4.4].map((a) => ({
  a,
  x: Math.cos(a) * 1.55,
  z: Math.sin(a) * 1.55,
}));

/** the council table dressing; figures optional (real models can stand in) */
export function WizardCouncil({
  center,
  still,
  figures = true,
}: {
  center: [number, number];
  still: boolean;
  figures?: boolean;
}) {
  // legendary sages: rich purple and deep-violet robes, long silver beards
  const seats: { robe: string; beard: string; seed: number }[] = [
    { robe: '#5a3d8a', beard: '#efeae0', seed: 31 },
    { robe: '#432a66', beard: '#e6e0d4', seed: 47 },
    { robe: '#6a4aa0', beard: '#f2ede4', seed: 63 },
  ];
  return (
    <group position={[center[0], 0, center[1]]}>
      {figures &&
        COUNCIL_SEATS.map((s, i) => (
          <group key={i} position={[s.x, 0, s.z]} rotation-y={-s.a - Math.PI / 2}>
            <SeatedFigure robe={seats[i].robe} beard={seats[i].beard} seed={seats[i].seed} still={still} pipe starry sage />
            <PipeSmoke origin={[0.12, 1.5, 0.2]} seed={seats[i].seed} still={still} />
          </group>
        ))}
      {/* a shared star-chart scroll at the table's edge (the centre is kept
          clear for the zodiac wheel the reader consults) */}
      <mesh position={[-1.02, 0.86, 0.46]} rotation-y={0.5} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.6, 0.36]} />
        <meshStandardMaterial color="#e9dcba" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** a troll and an elf mid-hand — cards on the table, coins in the pot */
export function CardGame({ center, still }: { center: [number, number]; still: boolean }) {
  const cardFlick = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (still || !cardFlick.current) return;
    const t = state.clock.elapsedTime;
    const k = (t % 5) / 5;
    // every five seconds someone plays a card
    cardFlick.current.position.y = 0.87 + (k < 0.12 ? Math.sin((k / 0.12) * Math.PI) * 0.22 : 0);
    cardFlick.current.rotation.z = k < 0.12 ? Math.sin((k / 0.12) * Math.PI) * 0.7 : 0;
  });
  return (
    <group position={[center[0], 0, center[1]]}>
      <group position={[1.45, 0, 0.2]} rotation-y={-Math.PI / 2 - 0.2}>
        <SeatedFigure robe="#5e6a48" hat={false} skin="#7a9460" bulky hair="#3a4432" seed={71} still={still} />
      </group>
      <group position={[-1.45, 0, -0.2]} rotation-y={Math.PI / 2 + 0.2}>
        <SeatedFigure robe="#7a5a8a" hat={false} skin="#e8cba8" ears hair="#e6d9a8" seed={87} still={still} />
      </group>
      {/* the troll's tankard */}
      <group position={[0.85, 0.865, 0.55]}>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.14, 10]} />
          <meshStandardMaterial color="#8a7a5c" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0.075, 0.07, 0]} rotation-y={Math.PI / 2} rotation-z={-Math.PI / 2}>
          <torusGeometry args={[0.035, 0.01, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#8a7a5c" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>
      {/* the hand in play */}
      {[
        [-0.3, 0.15, 0.35],
        [-0.05, -0.1, -0.5],
        [0.25, 0.05, 1.2],
        [0.05, 0.32, 2.2],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.865, z]} rotation={[-Math.PI / 2, 0, r as number]}>
          <planeGeometry args={[0.16, 0.24]} />
          <meshStandardMaterial color="#efe6cf" roughness={0.8} />
        </mesh>
      ))}
      <mesh ref={cardFlick} position={[0.4, 0.87, -0.25]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <planeGeometry args={[0.16, 0.24]} />
        <meshStandardMaterial color="#e2d5b6" roughness={0.8} />
      </mesh>
      {/* the pot */}
      {[
        [0.02, 0.02], [-0.08, 0.09], [0.09, 0.1], [0.0, -0.08], [0.12, -0.04],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.875 + i * 0.013, z]}>
          <cylinderGeometry args={[0.045, 0.045, 0.012, 10]} />
          <meshStandardMaterial color="#c9a648" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/* ————— the Librarian: walk up and she opens the catalogue ————— */

/**
 * The catalogue bank spans the apse wall to wall, so it is DERIVED from the
 * corridor rather than hand-set: it was a hard-coded 5.0 m, which happened to
 * match the apse exactly, and punched straight through the side walls the
 * moment the corridor was narrowed. The pieces below are laid out against the
 * old 5.0 m and scaled by CASE_K, so the whole bank follows APSE_HALF.
 */
const CASE_W = APSE_HALF * 2 - 0.1; // a hair of daylight at each wall
const CASE_K = CASE_W / 5.0;

/** the bowed circulation counter: radius, and how much arc it sweeps.
 *  Widened 2026-08-05 (1.62 → 1.82, span 2.5 → 2.62) so the counter FILLS the
 *  gateway between Boaz & Jachin: at sin(span/2)·R its arc now reaches x ±1.72,
 *  just inside the pillars' moulded steps (inner edge 1.65 → the low course is
 *  grazed, not overrun), where before a metre of empty floor showed each side
 *  of the desk and the wizard read as marooned behind the pair. */
const DESK_R = 1.82;
/** the inner face of the carcass — the counter is 0.62 m deep front to back,
 *  which is the depth of a desk somebody works at rather than a parapet */
const DESK_IN = DESK_R - 0.62;
const DESK_SPAN = 2.62;
/** the card-catalogue banks now rise to the cloud line on the apse wall behind
 *  her (was a 2.85 m carcass topped at a 2.98 cornice). CASE_TOP is the top of
 *  the joinery; the drawer sheet tiles DRAWER_TILE_Y times up it so drawers
 *  keep their height instead of stretching. */
const CASE_TOP = 5.1;
const CASE_BOTTOM = 0.18;
const CASE_MID = (CASE_TOP + CASE_BOTTOM) / 2;
const CASE_H = CASE_TOP - CASE_BOTTOM;
const DRAWER_TILE_Y = 1.85;

/** RingGeometry measures theta from +x and lies in XY; laid flat with a −π/2
 *  rotation about X its +y goes to −z, so the arc has to be swung a quarter
 *  turn to bow toward arrivals at +z. */
const RING_START = -Math.PI / 2 - DESK_SPAN / 2;

/** the drifting index cards: one slow circuit each, at its own radius, height
 *  and rate, so the flock never pulses in unison */
const CARD_PHASES = Array.from({ length: 11 }, (_, i) => ({
  radius: 1.15 + (i % 4) * 0.26,
  height: 1.75 + ((i * 7) % 9) * 0.13,
  rate: 0.07 + (i % 5) * 0.018,
  phase: (i / 11) * Math.PI * 2,
  bob: 0.5 + (i % 3) * 0.31,
}));
/**
 * A standing robed figure behind the circulation desk near the entrance.
 * She is the search interface made flesh: approach her (or click) and the
 * catalogue opens. A green reading lamp and a soft beacon mark her post so
 * newcomers know where to ask.
 */
export function Librarian({
  position,
  rotationY = 0,
  onSummon,
  active,
  still,
}: {
  position: [number, number, number];
  rotationY?: number;
  onSummon: () => void;
  active: boolean;
  still: boolean;
}) {
  const held = useHeldForReveal();
  const head = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Sprite>(null);
  const sign = useRef<THREE.Sprite>(null);
  const deskRef = useRef<THREE.Mesh>(null);
  // Her robe was a cold slate blue, and it was the only cold thing in the
  // apse: walnut, brass, candlelight and the crimson of the niches everywhere
  // else. A deep wine ground keeps the starred robe — she is still the figure
  // the catalogue is written on — while putting her in the room's own key
  // instead of two rooms away from it.
  const robeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: starryRobe('#43222c', 71), color: '#ffffff', roughness: 0.85 }),
    [],
  );
  const cards = useRef<(THREE.Group | null)[]>([]);
  /* ————— the station's surfaces, from the registry —————
   *
   * Every one of these was an inline `MeshStandardMaterial` with a flat colour
   * and no map at all: `#4a3421` for the counter, `#3a2a1c` for the case, a
   * bare `#b98a3d` for the brass. That is why the desk read as a curved sheet
   * of plastic and the catalogue banks as brown card — a museum's joinery in
   * candlelight is almost entirely grain and specular, and neither exists on
   * an untextured surface.
   *
   * They are registry surfaces now, like the rest of the building (see
   * `materials/library.json`), which also means the desk shares its walnut
   * with the reading tables and its brass with the niche archivolts and the
   * entrance doors. NONE of them may be disposed here: they are cached and
   * shared, and disposing one would blank every other surface using it.
   */
  const deskMat = useMemo(
    () =>
      getMaterial('wood_walnut_ancient', {
        repeat: [3, 1],
        // lifted well above the scan's own value, for the same reason the
        // entrance doors were: the apse is lit by one lamp on the counter and
        // a distant rose window, and at the stock tone the whole front of the
        // desk — plinth, pilasters, panels — went to one black curve
        overrides: { side: 'double', roughness: 0.55, color: '#7d5c3a' },
      }),
    [],
  );
  // the counter top is the one surface people put their hands on: waxed, and a
  // shade lighter than the panelled front under it
  const topMat = useMemo(
    () => getMaterial('wood_table_top', { repeat: [2, 2], overrides: { side: 'double', color: '#8a6641', roughness: 0.42 } }),
    [],
  );
  const carcassMat = useMemo(
    () => getMaterial('wood_shelving_library', { repeat: [1.4, 2.2], overrides: { color: '#6a5136' } }),
    [],
  );
  const brassMat = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        overrides: { color: '#c09551', metalness: 0.75, roughness: 0.36, side: 'double', emissive: '#2a1e0c' },
      }),
    [],
  );
  // the writing surface of the return counter behind her — worn oxblood
  const leatherMat = useMemo(
    () => getMaterial('leather_upholstery', { repeat: [2, 1], overrides: { color: '#5b2b28', roughness: 0.62 } }),
    [],
  );
  const drawerMat = useMemo(() => {
    // the banks now rise ~5 m (up to the cloud line behind her), so the 5×8
    // drawer sheet is tiled ~1.85× up the wall to keep each drawer its own
    // height rather than stretching into tall letter-slots
    const map = catalogueDrawers();
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1, DRAWER_TILE_Y);
    return new THREE.MeshStandardMaterial({ map, roughness: 0.72 });
  }, []);
  // the apse is dim and the cards are small; a little self-light keeps them
  // legible as paper rather than as grey flecks
  const cardMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#efe4c6',
        roughness: 0.9,
        side: THREE.DoubleSide,
        emissive: new THREE.Color('#6b6047'),
        emissiveIntensity: 0.45,
      }),
    [],
  );
  const emblem = useMemo(() => getSigilTexture('scholarship', '#ffd9a0'), []);
  // Only the materials this file OWNS are disposed. The four registry surfaces
  // above are shared across the building and must outlive this station.
  useEffect(
    () => () => {
      robeMat.dispose();
      drawerMat.dispose();
      cardMat.dispose();
    },
    [robeMat, drawerMat, cardMat],
  );

  useEffect(() => {
    const m = deskRef.current;
    if (!m) return;
    registerPickable(m, { onPick: onSummon, maxDist: 6 });
    return () => unregisterPickable(m);
  }, [onSummon]);

  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (head.current && !still) {
      const h = head.current;
      // survey the hall — until a visitor approaches, then meet their eye
      let ty = Math.sin(t * 0.4) * 0.35;
      let tx = Math.sin(t * 0.6) * 0.05;
      h.getWorldPosition(look);
      const dist = Math.hypot(state.camera.position.x - look.x, state.camera.position.z - look.z);
      if (dist < 8 && h.parent) {
        look.copy(state.camera.position);
        h.parent.worldToLocal(look);
        look.sub(h.position);
        const yaw = Math.atan2(look.x, look.z);
        if (Math.abs(yaw) < 1.2) {
          const pitch = -Math.atan2(look.y, Math.hypot(look.x, look.z)) * 0.5;
          const k = THREE.MathUtils.clamp((8 - dist) / 2.5, 0, 1);
          ty = THREE.MathUtils.lerp(ty, THREE.MathUtils.clamp(yaw, -1.0, 1.0), k);
          tx = THREE.MathUtils.lerp(tx, THREE.MathUtils.clamp(pitch, -0.3, 0.25), k);
        }
      }
      h.rotation.y = THREE.MathUtils.damp(h.rotation.y, ty, 5, delta);
      h.rotation.x = THREE.MathUtils.damp(h.rotation.x, tx, 5, delta);
    }
    if (beacon.current) {
      const mat = beacon.current.material as THREE.SpriteMaterial;
      mat.opacity = (active ? 0.5 : 0.26) + (still ? 0 : Math.sin(t * 2) * 0.07);
      const bob = still ? 0 : Math.sin(t * 1.3) * 0.06;
      beacon.current.position.y = 3.05 + bob;
      if (sign.current) {
        // the emblem rides just above the halo, brightening when she is in range
        const sm = sign.current.material as THREE.SpriteMaterial;
        sm.opacity = (active ? 0.92 : 0.68) + (still ? 0 : Math.sin(t * 2) * 0.06);
        sign.current.position.y = 3.15 + bob;
      }
    }
    // the index cards circling above the desk, each on its own slow orbit.
    // A stilled scene holds them where they are, like everything else.
    if (!still) {
      CARD_PHASES.forEach((p, i) => {
        const g = cards.current[i];
        if (!g) return;
        g.rotation.y = p.phase + t * p.rate;
        g.position.y = p.height + Math.sin(t * p.bob + p.phase) * 0.07;
        // a lazy tumble, so they read as loose paper rather than as billboards
        g.children[0].rotation.set(Math.sin(t * 0.3 + p.phase) * 0.4, t * p.rate * 2.2, 0.3);
      });
    }
  });

  return (
    <group position={position} rotation-y={rotationY}>
      {/* ————— the card catalogue, banked either side of her —————
          Everything in here is drawn against the original 5 m bank and squeezed
          to the apse's actual width by CASE_K, so it can never overrun the
          corridor walls again however narrow they are cut. */}
      <group scale-x={CASE_K}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.55, 0, -1.45]}>
          {/* the carcass, run up to the cloud line */}
          <mesh position={[0, CASE_MID, 0]} material={carcassMat}>
            <boxGeometry args={[1.8, CASE_H, 0.45]} />
          </mesh>
          {/* the drawer fronts, painted rather than modelled — see the note on
              catalogueDrawers for why forty drawers are one draw call here. The
              sheet tiles up the taller carcass (DRAWER_TILE_Y). */}
          <mesh position={[0, CASE_MID, 0.23]} material={drawerMat}>
            <planeGeometry args={[1.7, CASE_H - 0.16]} />
          </mesh>
        </group>
      ))}
      {/* three drawers actually pulled out, so the bank has real depth and
          reads as a thing in use rather than a painted flat */}
      {(
        [
          [1.2, 1.92, 0.2],
          [-1.9, 1.12, 0.13],
          [-1.2, 2.34, 0.08],
        ] as [number, number, number][]
      ).map(([dx, dy, out], i) => (
        <group key={i} position={[dx, dy, -1.22 + out / 2]}>
          <mesh material={carcassMat}>
            <boxGeometry args={[0.3, 0.16, out]} />
          </mesh>
          <mesh position={[0, 0, out / 2 + 0.005]} material={brassMat}>
            <boxGeometry args={[0.3, 0.16, 0.01]} />
          </mesh>
          {/* the cards standing in the open one */}
          {i === 0 && (
            <mesh position={[0, 0.06, 0]} material={cardMat}>
              <boxGeometry args={[0.25, 0.1, out * 0.8]} />
            </mesh>
          )}
        </group>
      ))}
      {/* cornice and plinth tying the two banks into one wall — the cornice
          rides up with the banks, just under the cloud line */}
      <mesh position={[0, CASE_TOP + 0.12, -1.42]} material={carcassMat}>
        <boxGeometry args={[5.0, 0.24, 0.62]} />
      </mesh>
      <mesh position={[0, 0.09, -1.42]} material={carcassMat}>
        <boxGeometry args={[5.0, 0.18, 0.58]} />
      </mesh>

      {/* ————— the niche between the banks, with the lamp of learning —————
          Its backing panel runs the full height so the tall banks read as one
          continuous cabinet wall; the arch, columns and emblem below still
          frame her alcove at the bottom of it. */}
      <mesh position={[0, CASE_MID, -1.55]} material={carcassMat}>
        <boxGeometry args={[1.5, CASE_H, 0.12]} />
      </mesh>
      {[-0.72, 0.72].map((cx) => (
        <mesh key={cx} position={[cx, 1.1, -1.4]} material={brassMat}>
          <cylinderGeometry args={[0.055, 0.055, 2.2, 10]} />
        </mesh>
      ))}
      {/* the arch springs off the columns at 2.2 and crowns at 2.92, just
          under the cornice — any higher and it breaks through it */}
      <mesh position={[0, 2.2, -1.4]} material={brassMat}>
        <torusGeometry args={[0.72, 0.055, 8, 28, Math.PI]} />
      </mesh>
      </group>
      {/* The lamp of learning, the emblem this library files scholarship under.
          Outside the squeeze above, so the sigil stays round rather than going
          oval with the bank.
          It hangs in the arch's opening, clear above her head: at head height it
          simply sat behind her and read as a smear. Tone-mapped and held well
          under full opacity, because the sigil textures are painted with their
          own shadowBlur halo and burn out to a white blob drawn raw. */}
      <mesh position={[0, 2.38, -1.46]}>
        <planeGeometry args={[0.86, 0.86]} />
        <meshBasicMaterial map={emblem} transparent opacity={0.55} depthWrite={false} />
      </mesh>

      {/* ————— the curved circulation desk ————— */}
      {/* the bowed front. It is the pickable hit-target: the desk IS the
          search interface, so the whole counter answers a click. */}
      <mesh ref={deskRef} position={[0, 0.51, 0]} material={deskMat}>
        <cylinderGeometry
          args={[DESK_R, DESK_R + 0.07, 1.02, 48, 1, true, -DESK_SPAN / 2, DESK_SPAN]}
        />
      </mesh>
      {/* ————— what closes the counter —————
          The desk was THREE open shells and a narrow ring: a bowed front with
          no back, no ends and no underside, and a 0.28 m lip of top that did
          not reach across to anything. From the visitor's side that passes;
          from anywhere else — walking up at an angle, standing at her shoulder,
          looking down from the rotunda — you saw straight into the hollow and
          out through the far side of it, and the parts you did see were
          back-faces. It is a closed carcass now: a full worktop reaching in to
          DESK_IN, an inner shell dropping from it to the floor, and a flat end
          panel at each side of the arc. Nothing about the front changed. */}
      <mesh position={[0, 0.51, 0]} material={deskMat}>
        <cylinderGeometry
          args={[DESK_IN, DESK_IN, 1.02, 32, 1, true, -DESK_SPAN / 2, DESK_SPAN]}
        />
      </mesh>
      {[-1, 1].map((s) => {
        const a = (s * DESK_SPAN) / 2;
        const mid = (DESK_R + DESK_IN) / 2;
        return (
          <mesh
            key={s}
            position={[Math.sin(a) * mid, 0.51, Math.cos(a) * mid]}
            rotation-y={a}
            material={deskMat}
          >
            <boxGeometry args={[DESK_R - DESK_IN + 0.07, 1.02, 0.06]} />
          </mesh>
        );
      })}
      {/* the counter top, and a brass edge along it. RingGeometry lies in XY
          with theta measured from +x, so laying it flat sends its +y to −z —
          hence the −π/2 offset that swings the arc round to face arrivals. */}
      <mesh position={[0, 1.03, 0]} rotation-x={-Math.PI / 2} material={topMat}>
        <ringGeometry args={[DESK_IN, DESK_R + 0.18, 48, 1, RING_START, DESK_SPAN]} />
      </mesh>
      <mesh position={[0, 1.045, 0]} rotation-x={-Math.PI / 2} material={brassMat}>
        <ringGeometry args={[DESK_R + 0.17, DESK_R + 0.21, 48, 1, RING_START, DESK_SPAN]} />
      </mesh>
      {/* ————— what makes it a counter and not a curved wall —————
          A plinth on the floor, pilasters standing at the ends and either side
          of centre, and a brass foot rail across the front. The bare bowed
          cylinder had no bottom, no divisions and nothing to stand a foot on,
          which is why it read as a sheet of card bent round rather than as a
          piece of joinery someone built in a shop. */}
      <mesh position={[0, 0.06, 0]} rotation-x={-Math.PI / 2} material={deskMat}>
        <ringGeometry args={[DESK_IN, DESK_R + 0.16, 48, 1, RING_START, DESK_SPAN]} />
      </mesh>
      <mesh position={[0, 0.11, 0]} material={deskMat}>
        <cylinderGeometry args={[DESK_R + 0.14, DESK_R + 0.16, 0.22, 48, 1, true, -DESK_SPAN / 2, DESK_SPAN]} />
      </mesh>
      {[-0.46, -0.16, 0.16, 0.46].map((f) => {
        // spaced by fraction of the sweep, so the divisions stay even whatever
        // DESK_SPAN is set to
        const a = f * DESK_SPAN;
        return (
          <mesh
            key={f}
            position={[Math.sin(a) * (DESK_R + 0.03), 0.58, Math.cos(a) * (DESK_R + 0.03)]}
            rotation-y={a}
            material={deskMat}
          >
            <boxGeometry args={[0.14, 0.92, 0.09]} />
          </mesh>
        );
      })}
      {/* ————— what makes it the ESOTERIC library's desk —————
          A brass roundel let into the centre of the bow, carrying the lamp of
          learning the niche behind her also flies, and a small rosette over
          each pilaster. A circulation counter with nothing on its face is a
          bank counter; one plate of engraved brass at the centre of the arc is
          the whole difference, and it is the first thing at eye level a
          visitor walking up the hall meets. Set proud of the bow on its own
          radius so it never z-fights the curve it sits on. */}
      <mesh position={[0, 0.62, DESK_R + 0.045]} rotation-x={Math.PI / 2} material={brassMat}>
        <cylinderGeometry args={[0.3, 0.3, 0.03, 28]} />
      </mesh>
      <mesh position={[0, 0.62, DESK_R + 0.075]}>
        <planeGeometry args={[0.46, 0.46]} />
        <meshBasicMaterial map={emblem} transparent opacity={0.6} depthWrite={false} />
      </mesh>
      {[-0.31, 0.31].map((f) => {
        const a = f * DESK_SPAN;
        return (
          <group
            key={f}
            position={[Math.sin(a) * (DESK_R + 0.05), 0.62, Math.cos(a) * (DESK_R + 0.05)]}
            rotation-y={a}
          >
            <mesh rotation-x={Math.PI / 2} material={brassMat}>
              <cylinderGeometry args={[0.075, 0.075, 0.03, 12]} />
            </mesh>
          </group>
        );
      })}

      {/* the foot rail: brass, and set out at the height a boot finds it */}
      <mesh position={[0, 0.22, 0]} rotation-x={-Math.PI / 2} material={brassMat}>
        <ringGeometry args={[DESK_R + 0.2, DESK_R + 0.25, 40, 1, RING_START, DESK_SPAN * 0.94]} />
      </mesh>

      {/* a low return counter behind her, where the work actually happens —
          leather-topped, because this is the surface she writes on */}
      <mesh position={[0, 0.44, -0.95]} material={deskMat}>
        <boxGeometry args={[2.6, 0.88, 0.5]} />
      </mesh>
      <mesh position={[0, 0.885, -0.95]} rotation-x={-Math.PI / 2} material={leatherMat}>
        <planeGeometry args={[2.44, 0.36]} />
      </mesh>

      {/* ————— the banker's lamp —————
          The shade was a green disc floating over a brass stem with a light
          inside it and no lit GLASS anywhere: the pool on the counter had no
          visible source. It has a proper cast base, a shade with its underside
          glowing, and a pull chain. The point light is the one that was always
          here — nothing has been added to the light count. */}
      <group position={[0.78, 1.06, 0.95]}>
        <mesh position={[0, 0.01, 0]} material={brassMat}>
          <cylinderGeometry args={[0.09, 0.11, 0.03, 14]} />
        </mesh>
        <mesh position={[0, 0.15, 0]} material={brassMat}>
          <cylinderGeometry args={[0.018, 0.018, 0.3, 8]} />
        </mesh>
        <mesh position={[0, 0.29, 0]}>
          <cylinderGeometry args={[0.16, 0.17, 0.07, 16, 1, true]} />
          <meshStandardMaterial
            color="#1f5c3a"
            roughness={0.35}
            metalness={0.25}
            side={THREE.DoubleSide}
            /* the inside of a bankers' shade is white enamel, and it is the
               only reason the green reads as glass rather than as paint */
            emissive="#2e6f47"
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0, 0.255, 0]} rotation-x={Math.PI / 2}>
          <circleGeometry args={[0.155, 16]} />
          <meshBasicMaterial color="#ffdc9c" toneMapped={false} />
        </mesh>
        <mesh position={[0.16, 0.2, 0]} material={brassMat}>
          <cylinderGeometry args={[0.004, 0.004, 0.13, 5]} />
        </mesh>
        <pointLight position={[0, 0.1, 0]} color="#ffe6a8" intensity={6} distance={5} decay={2} />
      </group>

      {/* ————— what is out on the counter —————
          A desk with one ledger on it is a desk nobody works at. This is the
          minimum a circulation counter carries: the day book open at today,
          a tray of cards waiting to be filed, the call bell, and an inkstand.
          All of it on the visitor's side of the arc, where it reads. */}
      <mesh position={[-0.35, 1.05, 1.05]} rotation-x={-Math.PI / 2} material={cardMat}>
        <planeGeometry args={[0.72, 0.5]} />
      </mesh>
      <mesh position={[-0.35, 1.03, 1.05]} material={deskMat}>
        <boxGeometry args={[0.76, 0.05, 0.54]} />
      </mesh>
      <mesh position={[0.12, 1.09, 1.28]} material={carcassMat}>
        <boxGeometry args={[0.34, 0.12, 0.22]} />
      </mesh>
      {/* the call bell — the one object that says "ring for the librarian"
          without a word of interface text */}
      <group position={[-0.95, 1.06, 0.86]}>
        <mesh material={brassMat}>
          <cylinderGeometry args={[0.075, 0.085, 0.015, 14]} />
        </mesh>
        <mesh position={[0, 0.05, 0]} material={brassMat}>
          <sphereGeometry args={[0.062, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, 0.055, 0]} material={brassMat}>
          <sphereGeometry args={[0.016, 8, 6]} />
        </mesh>
      </group>
      {/* the inkstand, and a pen lying where it was put down */}
      <group position={[0.45, 1.05, 1.14]}>
        <mesh material={deskMat}>
          <boxGeometry args={[0.2, 0.03, 0.12]} />
        </mesh>
        <mesh position={[-0.04, 0.04, 0]} material={brassMat}>
          <cylinderGeometry args={[0.028, 0.034, 0.05, 10]} />
        </mesh>
        <mesh position={[0.05, 0.035, 0]} rotation-z={0.35} rotation-y={0.5} material={cardMat}>
          <cylinderGeometry args={[0.004, 0.011, 0.19, 6]} />
        </mesh>
      </group>
      {/* a short stack of returns, not yet shelved */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[-0.75, 1.06 + i * 0.055, 1.24]}
          rotation-y={0.1 - i * 0.09}
          material={carcassMat}
        >
          <boxGeometry args={[0.3, 0.05, 0.21]} />
        </mesh>
      ))}

      {/* ————— the catalogue, awake —————
          A slow drift of index cards circling above her desk. She is the
          search made flesh; this is the only thing in the room that says so
          before you walk up and ask. */}
      {CARD_PHASES.map((p, i) => (
        <group
          key={i}
          ref={(g) => {
            cards.current[i] = g;
          }}
        >
          <mesh position={[p.radius, 0, 0]} material={cardMat}>
            <planeGeometry args={[0.15, 0.1]} />
          </mesh>
        </group>
      ))}

      {/* ————— the librarian herself, standing behind the desk —————
          A scanned robed figure (public/models/librarian.glb, re-encoded by
          scripts/optimize-models.mjs from 38 MB to 2 MB like the statuary).
          The hand-built figure below is the Suspense fallback, so a slow load
          still leaves someone at the counter; its `head` ref simply goes null
          once the model takes over, and the survey-the-hall frame loop above
          is written to tolerate that. */}
      {held ? (
        <ProceduralLibrarian head={head} robeMat={robeMat} brassMat={brassMat} />
      ) : (
      <Suspense fallback={<ProceduralLibrarian head={head} robeMat={robeMat} brassMat={brassMat} />}>
        {/* Taller than life at 2.4 m (was 2.0): she stands behind a 0.92 m
            counter with a 2.98 m cornice over her, and now that the counter is
            wider and set forward she has to grow with it to keep command of the
            gateway — at 2.0 the enlarged desk read as taller than she was. Her
            head lands ~2.4 m, still well under the arch crown at 2.92. */}
        <GLBModel src="/models/librarian.glb" targetHeight={2.4} position={[0, -0.55]} />
      </Suspense>
      )}

      {/* ————— the "ask here" sign —————
          A soft halo with the lamp-of-learning emblem billboarded in front of
          it, hanging over the desk so a visitor reads the station as
          interactable from clear across the rotunda. Enlarged 2026-08-05 (halo
          1.05 → 1.7, plus a legible 0.8 m emblem) at the user's request for a
          "larger sign" — but held to modest opacity and a slow bob so it marks
          the desk without becoming a beacon that outshines the Gloria behind
          her. Both billboard, so the sign faces you from anywhere in the hall.
          The emblem rides just above the halo and both pulse together. */}
      <sprite ref={beacon} position={[0, 3.05, 0]} scale={[1.7, 1.7, 1]}>
        <spriteMaterial map={getGlowTexture()} color={active ? '#ffe6a8' : '#a8e0d0'} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={sign} position={[0, 3.15, 0]} scale={[0.82, 0.82, 1]}>
        <spriteMaterial map={emblem} transparent opacity={0.72} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

/** The hand-built robed figure the model replaced, kept as its load fallback. */
function ProceduralLibrarian({
  head,
  robeMat,
  brassMat,
}: {
  head: React.RefObject<THREE.Group | null>;
  robeMat: THREE.Material;
  brassMat: THREE.Material;
}) {
  return (
      <group position={[0, 0, -0.15]}>
        <mesh position={[0, 0.85, 0]} material={robeMat}>
          <coneGeometry args={[0.42, 1.7, 14]} />
        </mesh>
        {/* shoulders, and sleeves resting forward onto the counter — she was a
            bare cone before, which read as a traffic bollard in a gown */}
        <mesh position={[0, 1.56, 0]} scale={[1, 0.62, 0.82]} material={robeMat}>
          <sphereGeometry args={[0.3, 14, 10]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[s * 0.26, 1.3, 0.16]}
            rotation-x={0.5}
            rotation-z={-s * 0.16}
            material={robeMat}
          >
            <capsuleGeometry args={[0.075, 0.42, 4, 8]} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.32, 1.03, 0.38]}>
            <sphereGeometry args={[0.062, 10, 8]} />
            <meshStandardMaterial color="#e0bb93" roughness={0.75} />
          </mesh>
        ))}
        {/* a mozzetta over the shoulders — the short shoulder cape a keeper of
            a collection wears over the gown. It also breaks the long unbroken
            cone of the robe, which was reading as one moulded piece from the
            hem to the collar. */}
        <mesh position={[0, 1.44, 0]} scale={[1, 0.85, 0.95]}>
          <sphereGeometry args={[0.36, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#6d222a" roughness={0.88} side={THREE.DoubleSide} />
        </mesh>
        {/* a chain of office over the shoulders */}
        <mesh position={[0, 1.42, 0.02]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.19, 0.016, 6, 20]} />
          <meshStandardMaterial color="#b98a3d" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.24, 0.03, 6, 16]} />
          <meshStandardMaterial color="#b98a3d" metalness={0.7} roughness={0.4} />
        </mesh>
        <group ref={head} position={[0, 1.82, 0]}>
          <mesh>
            <sphereGeometry args={[0.17, 14, 12]} />
            <meshStandardMaterial color="#e0bb93" roughness={0.75} />
          </mesh>
          {/* hair bun */}
          <mesh position={[0, 0.05, -0.05]} scale={[1.05, 0.9, 1.05]}>
            <sphereGeometry args={[0.17, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#5a4030" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.13, -0.16]}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial color="#5a4030" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.02, 0.16]}>
            <sphereGeometry args={[0.028, 6, 5]} />
            <meshStandardMaterial color="#e0bb93" roughness={0.75} />
          </mesh>
          {/* Spectacles. Three rings of wire and she stops being a figure in a
              gown and becomes a LIBRARIAN — at this distance no amount of
              modelled face does as much work as a pair of glasses catching the
              lamp. They are the desk's own brass, so the material count of the
              station does not go up by one for a pair of frames. */}
          {[-0.065, 0.065].map((ex) => (
            <mesh key={ex} position={[ex, 0.015, 0.145]} material={brassMat}>
              <torusGeometry args={[0.045, 0.006, 6, 16]} />
            </mesh>
          ))}
          <mesh position={[0, 0.015, 0.155]} rotation-z={Math.PI / 2} material={brassMat}>
            <cylinderGeometry args={[0.005, 0.005, 0.04, 5]} />
          </mesh>
          {[-1, 1].map((s2) => (
            <mesh
              key={s2}
              position={[s2 * 0.115, 0.02, 0.09]}
              rotation-y={s2 * 0.9}
              material={brassMat}
            >
              <cylinderGeometry args={[0.004, 0.004, 0.1, 5]} />
            </mesh>
          ))}
        </group>
      </group>
  );
}
