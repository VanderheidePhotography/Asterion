import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { GLBModel } from './GLBModel';
import { useHeldForReveal } from './Deferred';
import { LEAN_TEXTURES } from './textureBudget';
import { reportModelReady, useModelSlot } from './modelQueue';
import { candleWash, getGlowTexture } from './glowTexture';
import { rugHalf } from './textures';
import { TextSprite } from './TextSprite';
import { registerPickable, unregisterPickable } from './ManualPicker';
import { AXIAL_TILT, celestialGlobeMap, terrestrialGlobeMap } from './globeTexture';
import { DRUM_PIERS, NICHE_DEPTH, NICHES } from './structure';
import { PILLAR_STEP_R, PILLAR_X, PILLAR_Z, ROT_R } from './layout';
import { mulberry32 } from '../../../domain/random';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { getMaterial } from '../../../materials';

/**
 * The rotunda's tutelary figures: one carved stone statue standing on every
 * solid stretch of drum between the openings — the patrons and personifications
 * the museum's traditions descend from.
 *
 * The drum has ten such piers and they come in two very different sizes, so
 * there are two forms of monument (see DRUM_PIERS in structure.tsx):
 *
 *   · the four WIDE piers (2.4–2.9 m, flanking the entrance and the apse) take
 *     a full standing figure on a moulded plinth;
 *   · the six NARROW piers (0.82 m, at the tight corners between wings) take a
 *     HERM — the classical tapering square shaft with a head and no arms, a
 *     form that exists precisely because it fits where a body cannot.
 *
 * Everything is sized against its own pier's `width` and asserted below, so no
 * figure can overhang into a mouth and stand in front of a wing's stacks — the
 * exact failure the old hand-listed corner chords had.
 *
 * No statue carries a light. Flames are an emissive cone plus a glow sprite;
 * the drum's chandeliers do the real lighting and the light budget is tight.
 *
 * Each figure is CLICKABLE and opens its reading in the shared ReadingDock —
 * the orrery's pattern, not the tables': no seating, no camera jump, just click
 * and read. The click target is one invisible proxy box per statue rather than
 * its dozen carved meshes, and the lit response is that figure's own stone
 * warming, which is why the materials are per-monument and not shared.
 */

const STONE = '#9a9488';
const STONE_DARK = '#7c766a';
const BRASS = '#c8b184';

/** the drum's inner face — nothing may be set deeper than this */
const FACE_R = ROT_R + 0.15;

type Full = 'hermes' | 'leontocephaline' | 'enoch';
type Herm = 'thoth' | 'sophia' | 'melchizedek' | 'prometheus' | 'zoroaster' | 'orpheus' | 'janus';

interface Mats {
  stone: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  fire: THREE.MeshBasicMaterial;
  brass: THREE.MeshStandardMaterial;
}

/** full figures take the wide piers, in bearing order. The east pier is taken
 *  bespoke by the lion-headed god (see `LeontocephalineEast`), and Enoch has
 *  the second entrance pier — the one facing Hermes across the entrance — as
 *  the other antediluvian scribe of the heavenly books. */
const FULL: { kind: Full; name: string; epithet: string }[] = [
  { kind: 'hermes', name: 'Hermes Trismegistus', epithet: 'thrice-great · the emerald tablet' },
  { kind: 'enoch', name: 'Enoch', epithet: 'the scribe of righteousness · he walked with God' },
];

/** Herms take the narrow corners, in bearing order. `thoth` and `janus` are
 *  still carved in HermFigure but no longer placed — Prometheus took Thoth's
 *  pier, and Janus never had one. */
const HERMS: { kind: Herm; name: string }[] = [
  { kind: 'prometheus', name: 'Prometheus' },
  { kind: 'sophia', name: 'Sophia' },
  // Melchizedek takes the west pier (180°), where the fireplace used to stand.
  // He must sit HERE in the list, not at the end: figures are dealt to the free
  // piers in bearing order, so appending him would shunt Zoroaster and Orpheus
  // one pier round the drum and wrap Thoth back onto a second position.
  { kind: 'melchizedek', name: 'Melchizedek' },
  { kind: 'zoroaster', name: 'Zoroaster' },
  { kind: 'orpheus', name: 'Orpheus' },
];

/** piers whose figure is a sculpted glTF rather than procedural stone, keyed by
 *  `kind`. The procedural figure stays as the Suspense fallback while the model
 *  streams in. `height` is metres (GLBModel drops feet to the floor and centres
 *  the model on the spot); `rotY` trims a model's facing if it isn't authored
 *  looking down +z. Full figures take the wide piers, so they stand taller.
 *
 *  Enoch used to carry two corrections here — a forward nudge and a squash
 *  along his own facing axis — because his wings reach much further back than
 *  he stands deep and passed through the barrel of a 1.00 m recess. Both are
 *  gone: the niches are 1.35 m deep now (see NICHE_DEPTH), which is the real
 *  fix, and he stands on the same terms as every other figure. */
const STATUE_MODELS: Record<string, { src: string; height: number; rotY?: number }> = {
  hermes: { src: '/models/hermes.glb', height: 4.3 },
  enoch: { src: '/models/enoch.glb', height: 4.3 },
  // the corner figures stand as tall as the entrance pair now (4.3 m) so every
  // niche reads at one scale — see the note on springY in structure's NICHES
  prometheus: { src: '/models/prometheus.glb', height: 4.3 },
  sophia: { src: '/models/sophia.glb', height: 4.3 },
  melchizedek: { src: '/models/melchizedek.glb', height: 4.3 },
  zoroaster: { src: '/models/zoroaster.glb', height: 4.3 },
  orpheus: { src: '/models/orpheus.glb', height: 4.3 },
  // the apse pair, niched on the two apse-side great piers (see ApseStatuary)
  isis: { src: '/models/isis.glb', height: 4.3 },
  serapis: { src: '/models/serapis.glb', height: 4.3 },
};

/**
 * One pier is already spoken for and must be left out of the AUTO placement —
 * the drum face is shared furniture, not a blank wall:
 *   · 0° (due east) — the Leontocephaline, hand-placed by
 *     `LeontocephalineEast` (this pier used to hold the grandfather clock).
 * Skipping it by bearing rather than by index means re-cutting the mouths
 * can't silently re-occupy it with a herm.
 *
 * 180° (due west) was the Fireplace's until the hearth was taken out; it now
 * carries Melchizedek like any other narrow pier.
 */
const OCCUPIED = [0];
const OCCUPIED_TOL = 0.05; // rad — piers are ≥ 2.7° apart, so this can't over-match

/** the two great piers on the apse side of the drum — where Boaz & Jachin stand */
function isPillarPier(p: { theta: number; grand: boolean }): boolean {
  return p.grand && Math.sin(p.theta) < 0;
}

/** how far into its niche a figure stands, as a fraction of the recess depth —
 *  0.35 m in absolute terms, enough for the curve to gather behind the figure
 *  without the drum face clipping its shoulders.
 *
 *  It is written as `0.35 / NICHE_DEPTH` rather than as a bare fraction on
 *  purpose. Deepening the recess used to drag every figure deeper into the wall
 *  with it — which is self-defeating, since the reason to deepen it is to buy
 *  room BEHIND the figures. Pinned this way, the setback is the same 0.35 m at
 *  any depth and the extra depth is all clearance. */
const NICHE_SET_BACK = 0.35 / NICHE_DEPTH;

/** the niche belonging to a pier, matched by bearing (they are derived from the
 *  same mouth list, so the bearings are identical, not merely close) */
function nicheAt(theta: number) {
  return NICHES.find((n) => Math.abs(n.theta - theta) < 1e-9) ?? null;
}

/** a flame that costs no light: an emissive cone inside a soft glow sprite */
function Flame({ position, mats, scale = 1 }: { position: [number, number, number]; mats: Mats; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.1, 0]} material={mats.fire}>
        <coneGeometry args={[0.09, 0.3, 8]} />
      </mesh>
      <sprite scale={[0.85, 0.85, 1]}>
        <spriteMaterial map={getGlowTexture()} color="#ffb457" transparent opacity={0.5} depthWrite={false} />
      </sprite>
    </group>
  );
}

/** tapering square shaft, head, no arms — the form the tight corners need */
function HermFigure({ kind, mats }: { kind: Herm; mats: Mats }) {
  return (
    <group>
      {/* footing and the shaft, wider at the shoulders than at the ground */}
      <mesh position={[0, 0.11, 0]} material={mats.dark}>
        <boxGeometry args={[0.6, 0.22, 0.6]} />
      </mesh>
      <mesh position={[0, 1.52, 0]} rotation-y={Math.PI / 4} material={mats.stone}>
        <cylinderGeometry args={[0.3, 0.24, 2.6, 4]} />
      </mesh>
      {/* squared shoulder stubs */}
      <mesh position={[0, 2.88, 0]} material={mats.stone}>
        <boxGeometry args={[0.66, 0.16, 0.34]} />
      </mesh>
      <mesh position={[0, 3.02, 0]} material={mats.stone}>
        <cylinderGeometry args={[0.09, 0.11, 0.16, 8]} />
      </mesh>

      {/* the head, and what marks each one out */}
      {kind === 'thoth' ? (
        <group position={[0, 3.24, 0]}>
          {/* ibis: a small skull drawn out into a long curved bill */}
          <mesh material={mats.stone}>
            <sphereGeometry args={[0.16, 14, 12]} />
          </mesh>
          <mesh position={[0, -0.05, 0.28]} rotation-x={1.28} material={mats.stone}>
            <coneGeometry args={[0.055, 0.5, 8]} />
          </mesh>
        </group>
      ) : kind === 'janus' ? (
        <>
          {/* two faces, one to each hall the pier stands between */}
          <mesh position={[0, 3.24, 0.09]} material={mats.stone}>
            <sphereGeometry args={[0.19, 16, 14]} />
          </mesh>
          <mesh position={[0, 3.24, -0.09]} material={mats.stone}>
            <sphereGeometry args={[0.19, 16, 14]} />
          </mesh>
          <mesh position={[0, 3.42, 0]} material={mats.dark}>
            <cylinderGeometry args={[0.21, 0.23, 0.1, 12]} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 3.24, 0]} material={mats.stone}>
          <sphereGeometry args={[0.2, 16, 14]} />
        </mesh>
      )}

      {kind === 'sophia' && (
        /* a dove settled on the shoulder */
        <group position={[0.2, 3.02, 0.12]}>
          <mesh rotation-z={-0.3} material={mats.dark}>
            <capsuleGeometry args={[0.055, 0.11, 4, 8]} />
          </mesh>
          <mesh position={[0.02, 0.11, 0]} material={mats.dark}>
            <sphereGeometry args={[0.05, 10, 8]} />
          </mesh>
        </group>
      )}
      {kind === 'prometheus' && (
        /* the stolen fire, carried in a shallow bowl */
        <>
          <mesh position={[0, 3.0, 0.28]} material={mats.dark}>
            <cylinderGeometry args={[0.14, 0.08, 0.12, 12]} />
          </mesh>
          <Flame position={[0, 3.1, 0.28]} mats={mats} scale={0.9} />
        </>
      )}
      {kind === 'zoroaster' && (
        /* the magian: a tall pointed tiara, a long beard, and the sacred fire */
        <>
          <mesh position={[0, 3.64, 0]} material={mats.stone}>
            <coneGeometry args={[0.17, 0.52, 12]} />
          </mesh>
          {/* the beard, tapering to a point below the face */}
          <mesh position={[0, 2.98, 0.16]} rotation-x={Math.PI} material={mats.stone}>
            <coneGeometry args={[0.1, 0.46, 8]} />
          </mesh>
          {/* the fire of truth, carried before the shaft */}
          <mesh position={[0, 2.85, 0.42]} material={mats.dark}>
            <cylinderGeometry args={[0.11, 0.08, 0.14, 12]} />
          </mesh>
          <Flame position={[0, 2.95, 0.42]} mats={mats} scale={0.85} />
        </>
      )}
      {kind === 'orpheus' && (
        /* the lyre, in relief: two horns, a crossbar, three strings */
        <group position={[0, 1.95, 0.19]}>
          <mesh rotation-x={Math.PI / 2} material={mats.dark}>
            <torusGeometry args={[0.19, 0.033, 6, 16, Math.PI]} />
          </mesh>
          <mesh position={[0, 0.3, 0]} material={mats.dark}>
            <boxGeometry args={[0.4, 0.045, 0.045]} />
          </mesh>
          {[-0.08, 0, 0.08].map((x, i) => (
            <mesh key={i} position={[x, 0.16, 0]} material={mats.dark}>
              <boxGeometry args={[0.015, 0.3, 0.015]} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/** a standing robed figure on a moulded plinth, for the wide piers */
function FullFigure({ kind, mats }: { kind: Full; mats: Mats }) {
  return (
    <group>
      {/* plinth: base, die, cornice */}
      <mesh position={[0, 0.15, 0]} material={mats.dark}>
        <boxGeometry args={[1.32, 0.3, 1.32]} />
      </mesh>
      <mesh position={[0, 1.05, 0]} material={mats.stone}>
        <boxGeometry args={[1.1, 1.5, 1.1]} />
      </mesh>
      <mesh position={[0, 1.9, 0]} material={mats.dark}>
        <boxGeometry args={[1.34, 0.2, 1.34]} />
      </mesh>

      {/* robe, shoulders, head — the figure stands from y 2.0 */}
      <mesh position={[0, 3.05, 0]} material={mats.stone}>
        <coneGeometry args={[0.55, 2.1, 16]} />
      </mesh>
      <mesh position={[0, 4.02, 0]} material={mats.stone}>
        <sphereGeometry args={[0.38, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
      </mesh>
      <mesh position={[0, 4.26, 0.02]} material={mats.stone}>
        <sphereGeometry args={[0.22, 16, 14]} />
      </mesh>

      {kind === 'hermes' && (
        <>
          {/* right arm to the caduceus; the tablet held against the chest */}
          <mesh position={[0.36, 3.5, 0.14]} rotation-z={0.42} material={mats.stone}>
            <capsuleGeometry args={[0.085, 0.6, 4, 8]} />
          </mesh>
          <mesh position={[0.54, 3.2, 0.2]} material={mats.dark}>
            <cylinderGeometry args={[0.045, 0.045, 2.7, 8]} />
          </mesh>
          <mesh position={[0.54, 4.55, 0.2]} material={mats.dark}>
            <sphereGeometry args={[0.09, 12, 10]} />
          </mesh>
          {/* the twinned serpents */}
          {[0, 1].map((i) => (
            <mesh
              key={i}
              position={[0.54, 4.1 + i * 0.22, 0.2]}
              rotation-x={Math.PI / 2}
              rotation-y={i * Math.PI}
              material={mats.dark}
            >
              <torusGeometry args={[0.1, 0.028, 6, 14, Math.PI * 1.5]} />
            </mesh>
          ))}
          {/* the emerald tablet */}
          <mesh position={[-0.3, 3.35, 0.42]} rotation-x={-0.25} rotation-z={0.1}>
            <boxGeometry args={[0.42, 0.56, 0.06]} />
            <meshStandardMaterial color="#4e7f68" roughness={0.35} metalness={0.15} />
          </mesh>
          <mesh position={[-0.36, 3.2, 0.34]} rotation-z={-0.5} material={mats.stone}>
            <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
          </mesh>
        </>
      )}

      {kind === 'leontocephaline' && (
        <>
          {/* the lion's mane and muzzle over the standard head */}
          <mesh position={[0, 4.26, 0.02]} material={mats.dark}>
            <sphereGeometry args={[0.3, 16, 12]} />
          </mesh>
          <mesh position={[0, 4.22, 0.24]} rotation-x={Math.PI / 2} material={mats.stone}>
            <coneGeometry args={[0.13, 0.22, 10]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.15, 4.48, 0.02]} material={mats.stone}>
              <coneGeometry args={[0.06, 0.12, 8]} />
            </mesh>
          ))}
          {/* the pair of wings, in relief against the shoulders */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.42, 3.72, -0.16]} rotation-z={s * 0.5} material={mats.dark}>
              <boxGeometry args={[0.18, 0.9, 0.07]} />
            </mesh>
          ))}
          {/* the serpent coiled round the body, seven turns up the robe */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <mesh
              key={i}
              position={[0, 2.3 + i * 0.24, 0]}
              rotation-x={Math.PI / 2}
              rotation-z={i * 0.5}
              material={mats.dark}
            >
              <torusGeometry args={[0.52 - i * 0.045, 0.045, 6, 18, Math.PI * 1.5]} />
            </mesh>
          ))}
          {/* the two keys of the gates, held down at his right side */}
          <mesh position={[0.4, 3.4, 0.24]} rotation-z={0.3} material={mats.stone}>
            <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
          </mesh>
          {[-0.06, 0.06].map((d, i) => (
            <group key={i} position={[0.5 + d, 2.95, 0.3]}>
              <mesh material={mats.brass}>
                <cylinderGeometry args={[0.02, 0.02, 0.42, 8]} />
              </mesh>
              <mesh position={[0, 0.23, 0]} rotation-x={Math.PI / 2} material={mats.brass}>
                <torusGeometry args={[0.07, 0.02, 6, 14]} />
              </mesh>
              <mesh position={[0.05, -0.19, 0]} material={mats.brass}>
                <boxGeometry args={[0.08, 0.06, 0.02]} />
              </mesh>
            </group>
          ))}
          {/* the sceptre in the left hand */}
          <mesh position={[-0.42, 3.35, 0.28]} rotation-z={-0.18} material={mats.stone}>
            <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
          </mesh>
          <mesh position={[-0.5, 2.9, 0.32]} material={mats.dark}>
            <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
          </mesh>
        </>
      )}
    </group>
  );
}

interface Placed {
  kind: string;
  name: string;
  epithet?: string;
  /** the pier's bearing — a stable, unique React key per position */
  theta: number;
  wide: boolean;
  rotY: number;
  pos: [number, number, number];
  labelZ: number;
  /** standing inside a damask-lined niche, which takes the fuller dressing */
  recessed: boolean;
}

/**
 * One statue, its own stone, and its click target.
 *
 * The materials belong to the monument rather than to the whole colonnade so
 * that lighting THIS figure on hover or while its reading is open doesn't warm
 * all eight at once.
 */
/**
 * THE PEDESTALS — all ten of them, in four draw calls.
 *
 * A clean plinth is a display stand. What makes these read as something the
 * building has HAD rather than something a designer chose is entirely in the
 * damage: corners knocked off where people brush past, the top edge chipped
 * where the figure was set down, wax run off the candle stands and set on the
 * cap, and a posy and a folded note somebody left and nobody has cleared.
 *
 * All of it is deterministic from the pier's own bearing, so the same corner
 * is missing every visit. Damage that moves is noise; damage that stays is
 * history.
 *
 * ── why they are built here and not inside `Monument` ──────────────────────
 *
 * The first cut rendered them as components: about twenty little meshes each,
 * which is two hundred draw calls added to a museum that is already draw-call
 * bound and gets around 1.5 fps back for every hundred it sheds. Nothing on a
 * pedestal ever moves, so all ten are baked into one buffer per material at
 * module scope — the same treatment the chandeliers and the vault ribs got.
 *
 * The east pier is included like the rest: its Leontocephaline is hand-placed
 * (see `LeontocephalineEast`) but stands on the SAME baked pedestal as every
 * other niched figure, so the ten read as one set of monuments.
 */
export const PEDESTAL_H = 0.34;

/** the die's projection toward the room, for a niche of a given size */
const pedDepth = (n: { r: number; depth: number }) =>
  Math.min(n.depth * 0.82, Math.min(n.r - 0.06, 1.24));

/** how far the pedestal's brass plate — and the lettering on it — stands out */
const PLATE_Z = (n: { r: number; depth: number }) => pedDepth(n) * 0.64 + 0.012;

type PedBucket = 'stone' | 'dark' | 'brass' | 'offering';

function buildPedestals(): Record<PedBucket, THREE.BufferGeometry | null> {
  const parts: Record<PedBucket, THREE.BufferGeometry[]> = {
    stone: [],
    dark: [],
    brass: [],
    offering: [],
  };
  const scratch: THREE.BufferGeometry[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();

  for (const n of NICHES) {
    // every niche gets one, the hand-placed east pier included — see
    // `LeontocephalineEast`, which stands its figure on this pedestal rather
    // than carrying a plinth of its own
    const rng = mulberry32(Math.round(Math.abs(n.theta) * 10007) + 3);
    const h = PEDESTAL_H;
    const r = Math.min(n.r - 0.06, 1.24);
    const d = pedDepth(n);
    // the monument's own frame: standing in the recess, facing the room
    const setBack = FACE_R + n.depth * NICHE_SET_BACK;
    const origin = new THREE.Vector3(Math.cos(n.theta) * setBack, 0, Math.sin(n.theta) * setBack);
    const rotY = Math.atan2(-Math.cos(n.theta), -Math.sin(n.theta));
    const frame = new THREE.Matrix4().compose(
      origin,
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)),
      new THREE.Vector3(1, 1, 1),
    );

    const add = (
      bucket: PedBucket,
      g: THREE.BufferGeometry,
      pos: [number, number, number],
      rot: [number, number, number] = [0, 0, 0],
    ) => {
      q.setFromEuler(new THREE.Euler(...rot));
      m.compose(new THREE.Vector3(...pos), q, new THREE.Vector3(1, 1, 1));
      m.premultiply(frame);
      const c = g.index ? g.toNonIndexed() : g.clone();
      c.applyMatrix4(m);
      parts[bucket].push(c);
      scratch.push(c);
      g.dispose();
    };

    // base moulding, die, and the cap the feet stand on — three stages, so the
    // block has a section instead of being a box
    add('dark', new THREE.BoxGeometry(r * 2.06, h * 0.18, d * 1.62), [0, h * 0.09, -d * 0.12]);
    add('stone', new THREE.BoxGeometry(r * 1.9, h * 0.66, d * 1.5), [0, h * 0.5, -d * 0.12]);
    add('dark', new THREE.BoxGeometry(r * 2.02, h * 0.18, d * 1.58), [0, h * 0.91, -d * 0.12]);

    // The losses. Dark facets sunk into the block: this renderer cannot cut
    // geometry, so a chip has to be read as a corner catching the light
    // differently rather than as an absence — which, at 3 cm, it is.
    for (let i = 0; i < 7; i++) {
      const a = rng() * Math.PI * 2;
      add(
        'dark',
        new THREE.DodecahedronGeometry(0.03 + rng() * 0.055, 0),
        [Math.cos(a) * r * 0.95, rng() * h, -d * 0.12 + Math.sin(a) * d * 0.74],
        [rng() * 3, a, rng() * 3],
      );
    }

    // the brass nameplate, screwed to the die. The figure's name and epithet
    // are cut into it (see `Monument`) rather than floating in front of the
    // statue's robe, which is where they used to be.
    add('brass', new THREE.BoxGeometry(r * 1.16, h * 0.62, 0.014), [0, h * 0.5, d * 0.64]);
    for (const s of [-1, 1]) {
      add('dark', new THREE.SphereGeometry(0.011, 6, 5), [s * r * 0.52, h * 0.5, d * 0.649]);
    }

    // wax run off the candle stands and set on the cap
    for (const s of [-1, 1]) {
      add(
        'offering',
        new THREE.CylinderGeometry(0.075 + rng() * 0.03, 0.09, 0.012, 10),
        [s * r * 0.62, h + 0.006, -d * 0.05],
      );
    }

    // The offerings. Not a shrine — a posy somebody left and a folded note
    // that has been there long enough to go brown. Enough to imply centuries
    // of admiration, and no more.
    const px = -r * 0.5;
    const pz = d * 0.42;
    add('dark', new THREE.CylinderGeometry(0.055, 0.04, 0.04, 8), [px, h + 0.04, pz]);
    for (let k = 0; k < 4; k++) {
      add(
        'offering',
        new THREE.SphereGeometry(0.026, 6, 5),
        [px + Math.cos(k * 1.7) * 0.03, h + 0.09 + (k % 2) * 0.018, pz + Math.sin(k * 1.7) * 0.03],
        [0.3 + k * 0.2, k * 1.1, 0],
      );
    }
    add('offering', new THREE.BoxGeometry(0.16, 0.008, 0.11), [r * 0.58, h + 0.008, d * 0.4], [0, -0.7, 0]);
  }

  const out = {} as Record<PedBucket, THREE.BufferGeometry | null>;
  for (const k of ['stone', 'dark', 'brass', 'offering'] as PedBucket[]) {
    out[k] = parts[k].length ? mergeGeometries(parts[k], false) : null;
  }
  scratch.forEach((g) => g.dispose());
  return out;
}

export function NichePedestals() {
  const geom = useMemo(buildPedestals, []);
  useLayoutEffect(
    () => () => Object.values(geom).forEach((g) => g?.dispose()),
    [geom],
  );
  const stone = useMemo(
    () => getMaterial('stone_limestone_ancient', { repeat: [1.6, 1.6], overrides: { color: '#8c8373' } }),
    [],
  );
  const dark = useMemo(
    () => getMaterial('stone_granite_dark', { repeat: [2, 2], overrides: { color: '#6a6459' } }),
    [],
  );
  const brass = useMemo(
    () =>
      getMaterial('metal_brass_burnished', {
        repeat: [2, 2],
        overrides: { color: '#8a6c30', roughness: 0.42, emissive: '#241806' },
      }),
    [],
  );
  const offering = useMemo(
    () => getMaterial('book_vellum', { repeat: [2, 2], overrides: { color: '#a89772', roughness: 0.9 } }),
    [],
  );
  return (
    <group>
      {geom.stone && <mesh geometry={geom.stone} material={stone} />}
      {geom.dark && <mesh geometry={geom.dark} material={dark} />}
      {geom.brass && <mesh geometry={geom.brass} material={brass} />}
      {geom.offering && <mesh geometry={geom.offering} material={offering} />}
    </group>
  );
}

function Monument({
  spec,
  selected,
  onPick,
}: {
  spec: Placed;
  selected: boolean;
  onPick?: (kind: string) => void;
}) {
  const held = useHeldForReveal();
  /* and once the doors ARE open, one figure downloads at a time, nearest in
   * view first — see modelQueue. Thirteen megabytes asked for at once means
   * every niche keeps its stand-in until the last of them lands. */
  const slot = useModelSlot(spec.kind, [spec.pos[0], spec.pos[2]], spec.pos[1]);
  const mats = useMemo<Mats>(
    () => ({
      stone: new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.95, emissive: '#6b5836' }),
      dark: new THREE.MeshStandardMaterial({ color: STONE_DARK, roughness: 0.9, emissive: '#6b5836' }),
      fire: new THREE.MeshBasicMaterial({ color: '#ffd08a' }),
      brass: new THREE.MeshStandardMaterial({ color: '#8a6a2f', roughness: 0.4, metalness: 0.35, emissive: '#241806' }),
    }),
    [],
  );
  useLayoutEffect(() => {
    mats.stone.emissiveIntensity = 0;
    mats.dark.emissiveIntensity = 0;
    return () => Object.values(mats).forEach((m) => m.dispose());
  }, [mats]);

  const hovered = useRef(false);
  const proxy = useRef<THREE.Mesh>(null);
  // the eased 0‥1 highlight, shared with the sculpted GLB so hovering warms the
  // real carving and not only the procedural fallback
  const highlight = useRef(0);

  useEffect(() => {
    const m = proxy.current;
    if (!m || !onPick) return;
    registerPickable(m, {
      onPick: () => onPick(spec.kind),
      onHover: (h) => {
        hovered.current = h;
      },
      // you have to walk up to a figure to read it. The picker tests only
      // registered objects, so walls do not occlude a ray — a long reach here
      // would let you click a statue through the drum from inside a wing.
      maxDist: 9,
    });
    return () => {
      unregisterPickable(m);
      hovered.current = false;
    };
  }, [onPick, spec.kind]);

  // ease the warmth toward "lit" while hovered or while its reading is open, and
  // drive both the procedural fallback's stone and the GLB's own materials
  useFrame((_, dt) => {
    const want = hovered.current || selected ? 1 : 0;
    const k = 1 - Math.exp(-dt * 9);
    highlight.current = THREE.MathUtils.lerp(highlight.current, want, k);
    mats.stone.emissiveIntensity = highlight.current;
    mats.dark.emissiveIntensity = highlight.current;
  });

  // every figure is a 4.3 m standing figure now, so the click proxy is the same
  // height for all; its width follows the niche opening (a hair narrower at the
  // tighter corner piers)
  const niche = nicheAt(spec.theta);
  const h = 4.9; // proxy covers plinth and figure together
  const w = niche ? Math.min(1.5, niche.r + 0.35) : 1.1;

  // the monument's floor dressing — a half-round hearth rug spread before the
  // figure, its flat edge against the plinth, its curve out into the rotunda.
  // Rug, candle stands and label all scale off the figure's own niche, so a
  // narrower corner niche keeps the SAME tall stands and generous label as the
  // entrance pair while its rug and stand spacing tuck inside the tighter walls.
  const rugMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: rugHalf(), transparent: true, roughness: 0.95 }),
    [],
  );
  useLayoutEffect(() => () => rugMat.dispose(), [rugMat]);
  const rugR = niche ? Math.min(1.55, niche.r + 0.25) : 1.15;
  const standX = niche ? Math.min(1.12, niche.r - 0.05) : 0.9;
  const standH = niche ? 1.05 : 0.8;
  /**
   * THE PEDESTAL. Every niched figure now stands on one, and until this pass
   * none of them did — they stood on the boards, feet on the same floor the
   * visitor is walking on, which is the single detail that made ten carved
   * marbles read as ten props placed in ten holes rather than as a collection
   * somebody installed.
   *
   * Kept to 0.34 m deliberately. The figures are 4.30 m and the recess springs
   * at 5.20, so this is very nearly all the height there is: any taller and
   * heads start going into the conch.
   */
  const pedH = niche ? PEDESTAL_H : 0;

  /** the procedural carving — a desktop's Suspense fallback and the thing its
   *  model dissolves up through. Never rendered on a phone; see the note on
   *  the GLBModel below. */
  const stand = spec.wide ? (
    <FullFigure kind={spec.kind as Full} mats={mats} />
  ) : (
    <HermFigure kind={spec.kind as Herm} mats={mats} />
  );

  return (
    <group position={spec.pos} rotation-y={spec.rotY}>
      {/* the pedestal itself is not built here — all ten are baked into one
          buffer by `NichePedestals`, which is mounted alongside the statuary.
          What this frame owes it is the height everything else stands at. */}
      <group position-y={pedH}>{STATUE_MODELS[spec.kind] && !held && slot ? (
        // a real sculpted model stands in place of the procedural figure; the
        // carved primitive is the fallback while the glTF streams in — and is
        // handed to the model as `beneath` as well, so the carving dissolves
        // up through it instead of replacing it in a single frame.
        // `held` keeps the whole glTF out of the load on a phone until the
        // doors are open — see useHeldForReveal
        <Suspense fallback={LEAN_TEXTURES ? null : stand}>
          <GLBModel
            src={STATUE_MODELS[spec.kind].src}
            targetHeight={STATUE_MODELS[spec.kind].height}
            position={[0, 0]}
            rotationY={STATUE_MODELS[spec.kind].rotY ?? 0}
            animate={false}
            highlightRef={highlight}
            onReady={() => reportModelReady(spec.kind)}
            /* NO STAND-IN ON A PHONE, and the niche is empty until the carving
               lands. Removed on the user's explicit instruction after they
               reported the crude figures "overlapping and taking the place of
               where the actual models are supposed to be".
               The reasoning that put them there — a figure can wait because
               something is standing in its place — assumed the stand-in read as
               the statue arriving. It does not: it is a different silhouette at
               a different height in the same alcove, so on the slow device,
               where it is up for seconds rather than a frame, what a visitor
               sees is the wrong statue and then a second one appearing over it.
               An alcove that is dressed but not yet occupied — pedestal, rug,
               candle stands, beam and label are all still there — reads as a
               statue you have not reached, which is the truth.
               `fadeIn` keeps the dissolve, so it still comes up rather than
               cutting in; there is simply nothing underneath it now. Desktop is
               untouched: it builds every figure before the doors open, so its
               stand-in is never seen and costs nothing to keep. */
            fadeIn={LEAN_TEXTURES}
            beneath={LEAN_TEXTURES ? undefined : stand}
          />
        </Suspense>
      ) : STATUE_MODELS[spec.kind] && LEAN_TEXTURES ? null : (
        stand
      )}</group>

      {/* the hearth rug — 3 cm proud of the boards so it never z-fights them */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0.42]} material={rugMat}>
        <circleGeometry args={[rugR, 36, 0, Math.PI]} />
      </mesh>

      {/* a pair of brass candle stands flanking the figure. The flames are the
          usual emissive cone + glow sprite — no lights; the budget is spent */}
      {[-1, 1].map((sSide) => (
        <group key={sSide} position={[sSide * standX, 0, 0.5]}>
          <mesh position={[0, 0.035, 0]} material={mats.brass}>
            <cylinderGeometry args={[0.14, 0.17, 0.07, 12]} />
          </mesh>
          <mesh position={[0, standH / 2, 0]} material={mats.brass}>
            <cylinderGeometry args={[0.028, 0.04, standH, 8]} />
          </mesh>
          <mesh position={[0, standH + 0.02, 0]} material={mats.brass}>
            <cylinderGeometry args={[0.09, 0.05, 0.05, 10]} />
          </mesh>
          <mesh position={[0, standH + 0.1, 0]} material={mats.fire}>
            <cylinderGeometry args={[0.03, 0.035, 0.14, 8]} />
          </mesh>
          <Flame position={[0, standH + 0.2, 0]} mats={mats} scale={0.8} />
        </group>
      ))}

      {/* ————— the candlelight on the damask —————
          What stood here was ONE camera-facing `<sprite>` carrying the shared
          radial glow texture: a flat disc of light that hung behind the figure
          at a constant size and turned to follow you round the room. It is the
          "flat circle" the redesign was asked to get rid of, and a billboard
          was always the wrong primitive for this — a wash on a wall does not
          face the viewer, it stays on the wall.

          These two are PLANES, fixed in the monument's own frame, one standing
          above each candle stand and rising up the back of the recess. Because
          they are pinned to the niche they foreshorten as you walk past, throw
          their light on the cloth rather than at the camera, and read as two
          sources rather than one halo. The plume art is painted in `candleWash`
          — narrow and hot at the wick, spreading and cooling as it climbs.

          Additive and depth-write-off, so they lay light over the damask
          without occluding the figure standing in front of them. Two per niche
          is nowhere near the bulk that made 288 flame sprites expensive. */}
      {spec.recessed &&
        [-1, 1].map((sSide) => (
          // Kept DELIBERATELY faint. The niche's own bake (see `shells` in
          // structure.tsx) is doing the heavy lifting; these only have to say
          // "two sources, there and there". At 0.5 they washed the crimson out
          // to pink and their plane edges showed as bright panels across the
          // damask — additive light over a dark red surface saturates very fast.
          <mesh key={`wash${sSide}`} position={[sSide * standX * 0.86, standH + 1.15, -0.26]}>
            <planeGeometry args={[1.15, 2.6]} />
            <meshBasicMaterial
              map={candleWash()}
              color="#ffb066"
              transparent
              opacity={0.18}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      {/* the pool the two stands throw on the plinth and the rug — the same
          light arriving from the other direction, so the figure's feet are the
          brightest part of the floor instead of the darkest */}
      {spec.recessed && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.045, 0.36]}>
          <planeGeometry args={[standX * 2.9, 2.1]} />
          <meshBasicMaterial
            map={getGlowTexture()}
            color="#ffb268"
            transparent
            opacity={0.13}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ————— the rim, which is what actually separates a figure from cloth —————
          Two narrow additive strips standing BEHIND the figure's shoulders,
          just off the damask. This is the cheap half of a three-point rig: the
          key comes from `NicheKeyLights` and costs a real light, but a rim is
          only ever a thin bright edge, and a bright edge is something a
          transparent plane can be for nothing.

          They sit at the figure's own width, not the niche's, so what a
          visitor sees is the marble's silhouette picked out against the red
          rather than a pair of glowing panels either side of it. Kept below
          0.1 opacity — additive light over dark crimson saturates fast, and
          the moment these read as objects instead of as light they are worse
          than nothing. */}
      {spec.recessed &&
        [-1, 1].map((sSide) => (
          <mesh
            key={`rim${sSide}`}
            position={[sSide * 0.42, pedH + 2.1, -0.52]}
            rotation-y={sSide * -0.34}
          >
            <planeGeometry args={[0.42, 3.4]} />
            <meshBasicMaterial
              map={getGlowTexture()}
              color="#ffc98e"
              transparent
              opacity={0.09}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}

      {/**
       * THE NAME, CUT INTO THE BRASS.
       *
       * This used to hang at 1.30 m — floating in the air in front of the
       * figure's robe, at a size that read across the rotunda. It was the same
       * fault as the old hall signs: a caption laid over an exhibit rather
       * than a thing the building has. Every marble in every museum in the
       * world carries its name on a plate at knee height, and you find out who
       * you are looking at by walking up to them, which is the whole point of
       * the pass this belongs to.
       *
       * Nothing is lost in doing it: the figures are clickable and their
       * reading gives the name, the epithet and the history in full.
       */}
      {niche ? (
        <>
          <TextSprite
            position={[0, pedH * 0.62, PLATE_Z(niche)]}
            height={0.062}
            color={BRASS}
            billboard={false}
            outline={false}
            maxWidthPx={640}
          >
            {spec.name}
          </TextSprite>
          {spec.epithet && (
            <TextSprite
              position={[0, pedH * 0.36, PLATE_Z(niche)]}
              height={0.036}
              color="#9a8c6e"
              billboard={false}
              outline={false}
              maxWidthPx={760}
            >
              {spec.epithet}
            </TextSprite>
          )}
        </>
      ) : (
        <TextSprite
          position={[0, 0.42, spec.labelZ]}
          height={0.1}
          color={BRASS}
          billboard={false}
          outline={false}
          maxWidthPx={340}
        >
          {spec.name}
        </TextSprite>
      )}

      {/* the click target: one box for the whole monument, so the raycaster
          never has to sort a dozen little carved primitives. It runs from the
          floor over the pedestal AND the figure — a visitor who clicks the
          plinth has clicked the statue. */}
      <mesh ref={proxy} position={[0, (h + pedH) / 2, 0]}>
        <boxGeometry args={[w, h + pedH, w]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

/** every free pier of the drum, with its figure */
export function RotundaStatuary({
  selected = null,
  onPick,
}: {
  /** the figure whose reading is open, by `kind` */
  selected?: string | null;
  onPick?: (kind: string) => void;
}) {
  const placed = useMemo<Placed[]>(() => {
    let fullI = 0;
    let hermI = 0;
    const free = DRUM_PIERS.filter((p) => {
      if (
        OCCUPIED.some((o) => {
          const d = Math.abs(((p.theta - o + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          return d < OCCUPIED_TOL;
        })
      )
        return false;
      // the two wide piers on the apse side (sin θ < 0) carry Boaz & Jachin now —
      // see PILLAR_PIERS / MasonicPillars below; leave them clear of statuary
      if (isPillarPier(p)) return false;
      return true;
    });
    const out: Placed[] = [];
    for (const p of free) {
      // a full figure needs its 1.34 m plinth plus clearance; only the wide
      // piers have it, and the narrow ones get a herm that fits in 0.82 m
      const wide = p.grand;
      // when the full figures run out (the east pier is hand-placed),
      // the remaining wide pier stands empty rather than repeating a figure
      const figure = wide ? FULL[fullI++] : HERMS[hermI++ % HERMS.length];
      if (!figure) continue;
      // each figure now stands INSIDE its niche, so the radius is measured out
      // past the drum face rather than back from it
      const niche = nicheAt(p.theta);
      const r = FACE_R + (niche ? niche.depth * NICHE_SET_BACK : -0.3);
      out.push({
        theta: p.theta,
        wide,
        // face the middle of the room: local +z points at the centre
        rotY: Math.atan2(-Math.cos(p.theta), -Math.sin(p.theta)),
        pos: [Math.cos(p.theta) * r, 0, Math.sin(p.theta) * r] as [number, number, number],
        // In a niche the name is cut on the drum face at the recess mouth, so
        // it reads from the hall instead of receding with the figure. On a pier
        // with no niche the figure still stands PROUD of the face, and the same
        // formula would bury the label in the wall behind it — so it goes in
        // front of the figure, as it did before there were any niches.
        labelZ: niche ? r - FACE_R + 0.05 : 0.32,
        recessed: Boolean(niche),
        ...figure,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {placed.map((s) => (
        <Monument key={s.theta} spec={s} selected={selected === s.kind} onPick={onPick} />
      ))}
    </group>
  );
}

/** Isis & Serapis, niched on the two apse-side great piers — the same damask
 *  apse, dressing, nameplate, reading and hover-warmth as every other figure on
 *  the drum. They took the piers Boaz & Jachin used to stand on; the pillars
 *  have moved inboard to flank the apse mouth (see MasonicPillars). Isis stands
 *  on Boaz's old side (−x), Serapis (Osiris Hellenised) on Jachin's (+x). */
export function ApseStatuary({
  selected = null,
  onPick,
}: {
  selected?: string | null;
  onPick?: (kind: string) => void;
}) {
  const placed = useMemo<Placed[]>(() => {
    return DRUM_PIERS.filter(isPillarPier).map((p) => {
      const west = Math.cos(p.theta) < 0; // −x, the Boaz side
      const fig = west
        ? { kind: 'isis', name: 'Isis', epithet: 'the veiled goddess · throne of the mysteries' }
        : { kind: 'serapis', name: 'Serapis', epithet: 'the Alexandrian god · Osiris made Greek' };
      const niche = nicheAt(p.theta);
      const r = FACE_R + (niche ? niche.depth * NICHE_SET_BACK : -0.3);
      return {
        theta: p.theta,
        wide: true,
        rotY: Math.atan2(-Math.cos(p.theta), -Math.sin(p.theta)),
        pos: [Math.cos(p.theta) * r, 0, Math.sin(p.theta) * r] as [number, number, number],
        labelZ: niche ? r - FACE_R + 0.05 : 0.32,
        recessed: Boolean(niche),
        ...fig,
      };
    });
  }, []);

  return (
    <group>
      {placed.map((s) => (
        <Monument key={s.theta} spec={s} selected={selected === s.kind} onPick={onPick} />
      ))}
    </group>
  );
}

/* ————— the Leontocephaline on the east pier ————— */

/** where the grandfather clock used to stand (0°, due east). The lion-headed
 *  god of the Mithraic cult, hand-placed rather than dealt a pier by the AUTO
 *  placement, but standing on the same niche pedestal as the other nine and
 *  opening its reading through the same shared statue dock. */
export function LeontocephalineEast({
  selected = false,
  onPick,
}: {
  selected?: boolean;
  onPick?: (kind: string) => void;
}) {
  const held = useHeldForReveal();
  // it queues for the connection with the other nine — see modelQueue. Its
  // spot is the east niche, worked out below as `r`; the queue only needs it
  // to within a metre, so the drum's face radius on the +x axis will do.
  const slot = useModelSlot('leontocephaline', [FACE_R, 0], 2.2);
  const mats = useMemo<Mats>(
    () => ({
      stone: new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.95 }),
      dark: new THREE.MeshStandardMaterial({ color: STONE_DARK, roughness: 0.9 }),
      fire: new THREE.MeshBasicMaterial({ color: '#ffb457' }),
      brass: new THREE.MeshStandardMaterial({ color: '#8a6a2f', roughness: 0.4, metalness: 0.35, emissive: '#241806' }),
    }),
    [],
  );
  // the same half-round hearth rug the other niches lay before their figures
  const rugMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: rugHalf(), transparent: true, roughness: 0.95 }),
    [],
  );
  useLayoutEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
      rugMat.dispose();
    },
    [mats, rugMat],
  );

  const figProxy = useRef<THREE.Mesh>(null);
  const figHover = useRef(false);
  // the eased highlight shared with its sculpted GLB, like the other statues
  const highlight = useRef(0);

  // its reading, through the same statue pick → ReadingDock as the other figures
  useEffect(() => {
    const m = figProxy.current;
    if (!m || !onPick) return;
    registerPickable(m, {
      onPick: () => onPick('leontocephaline'),
      onHover: (h) => {
        figHover.current = h;
      },
      maxDist: 9,
    });
    return () => {
      unregisterPickable(m);
      figHover.current = false;
    };
  }, [onPick]);

  // warm the figure (fallback stone + the GLB via `highlight`) while hovered
  // or while its reading is open
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 9);
    const want = figHover.current || selected ? 1 : 0;
    highlight.current = THREE.MathUtils.lerp(highlight.current, want, k);
    mats.stone.emissiveIntensity = highlight.current;
  });

  // it stands in the east niche on exactly the terms the other nine do: the
  // same setback, the same baked pedestal (mounted by `NichePedestals`, which
  // no longer skips this bearing), the same 4.3 m figure on top of it.
  const niche = nicheAt(0);
  const r = FACE_R + (niche?.depth ?? 0) * NICHE_SET_BACK;
  const rotY = Math.atan2(-1, 0); // −π/2: local +z → world −x, so it faces the centre

  return (
    <group position={[r, 0, 0]} rotation-y={rotY}>
      {/* the hearth rug and warm wash that dress every other niche */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0.42]} material={rugMat}>
        <circleGeometry args={[1.55, 36, 0, Math.PI]} />
      </mesh>
      <sprite position={[0, 2.7, -0.15]} scale={[3.1, 3.1, 1]}>
        <spriteMaterial map={getGlowTexture()} color="#ffc98a" transparent opacity={0.17} depthWrite={false} />
      </sprite>

      {/* the figure, up on the niche pedestal — the procedural lion-headed god
          is the fallback while the model streams in.

          5.0 m, not the 4.3 the other figures take. `targetHeight` scales the
          whole BOUNDING BOX, and this one carries an arm thrown straight up
          with a key in it: the head tops out at about three quarters of the
          box where the others' reach ~0.86 of theirs. Fitting the box to 4.3
          therefore lands a visibly smaller god in the niche. 5.0 puts his HEAD
          where theirs are, which is the thing an eye actually compares, and
          the raised key still clears the springing at 5.2 into the conch. */}
      <group position-y={PEDESTAL_H}>
        {held || !slot ? (
          // empty on a phone until the carving lands — the same rule as every
          // other niche, see Monument
          LEAN_TEXTURES ? null : <FullFigure kind="leontocephaline" mats={mats} />
        ) : (
          <Suspense fallback={LEAN_TEXTURES ? null : <FullFigure kind="leontocephaline" mats={mats} />}>
            <GLBModel
              src="/models/leontocephaline.glb"
              targetHeight={5.0}
              position={[0, 0]}
              rotationY={0}
              animate={false}
              highlightRef={highlight}
              onReady={() => reportModelReady('leontocephaline')}
              fadeIn={LEAN_TEXTURES}
              beneath={LEAN_TEXTURES ? undefined : <FullFigure kind="leontocephaline" mats={mats} />}
            />
          </Suspense>
        )}
      </group>

      {/* the name, on the pedestal's brass plate at knee height — the same
          position and size the other nine carry theirs at */}
      {niche && (
        <>
          <TextSprite position={[0, PEDESTAL_H * 0.62, PLATE_Z(niche)]} height={0.062} color={BRASS} billboard={false} outline={false} maxWidthPx={640}>
            Leontocephaline
          </TextSprite>
          <TextSprite position={[0, PEDESTAL_H * 0.36, PLATE_Z(niche)]} height={0.036} color="#9a8c6e" billboard={false} outline={false} maxWidthPx={760}>
            the lion-headed god · unbounded time
          </TextSprite>
        </>
      )}

      {/* click target for its reading — the pedestal and the figure on it, so
          a visitor who clicks the plinth has clicked the statue */}
      <mesh ref={figProxy} position={[0, (4.4 + PEDESTAL_H) / 2, 0]}>
        <boxGeometry args={[1.6, 4.4 + PEDESTAL_H, 1.4]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

/* ————— Boaz & Jachin: the twin pillars, each crowned with a globe ————— */

const GLOBE_R = 0.56;
/** how far the globe's centre rides above the column's capital, meridian and all */
const GLOBE_RISE = GLOBE_R + 0.12;
/**
 * THE CROWN OF THE PAIR — levelled with Isis & Serapis, and derived from them.
 *
 * The apse-side figures stand 4.3 m tall (STATUE_MODELS) on a 0.34 m pedestal
 * (PEDESTAL_H), so their heads finish at 4.64 m. That is the line the globes
 * are brought to. It is written as their height rather than as the number it
 * comes to, because the two must not be able to drift apart: rescaling the
 * statuary and leaving the pillars behind is exactly the kind of change that
 * reads as an accident from the floor.
 *
 * This REVERSES an old decision, on purpose. The column was grown from 3.6 to
 * 4.4 on the reasoning that at the smaller size the pair "read as furniture"
 * beside the taller drum figures — but that was written when they stood in the
 * entrance hall with nothing to measure against. Here they flank the two
 * figures they are meant to rhyme with, three metres away and in the same
 * sightline, and a pair standing a metre proud of Isis and Serapis does not
 * read as grander, it reads as unlevel.
 *
 * PILLAR_LIFT then raises the pair deliberately above that line: a gateway you
 * walk BETWEEN wants to overtop the figures you walk PAST, and the apse ceiling
 * carries far more height than the statuary asks for. The statue line is still
 * the base of the sum, so rescaling the statuary still moves the globes with
 * it — the pillars just keep their fixed margin over them.
 */
const PILLAR_LIFT = 1.5;
const PILLAR_TOP = STATUE_MODELS.isis.height + PEDESTAL_H + PILLAR_LIFT;
/** Height the sculpted marble column is scaled to — whatever is left under the
 *  globe once the crown is fixed. */
const PILLAR_H = PILLAR_TOP - (GLOBE_RISE + GLOBE_R);
/** height of the globe's centre above the floor — the top of the whole pillar,
 *  set so the brass meridian rests just clear of the column's capital */
const GLOBE_Y = PILLAR_H + GLOBE_RISE;
const PILLAR_BRASS = '#b98a3d';

/* ————— the rainbow arch over the pair —————
 *
 * The bow springs CLEAR OF THE GLOBES rather than off the capitals: the globes
 * are the crown of each pillar and an arch cutting through them would read as
 * two objects fighting for the same air. It starts a hand's breadth above them
 * and is struck at the pillars' own spacing, so it lands on their centre lines
 * however the hall is re-cut (PILLAR_X in layout.ts).
 *
 * UNLIT on purpose. The vestibule is the dimmest room in the building, and a
 * lit rainbow there is seven muddy browns; MeshBasicMaterial with vertex
 * colours gives the bands their own light. All seven arcs are merged into ONE
 * geometry for the same reason everything static here is — see the draw-call
 * note in the file header — and the haze is a second merged pass, so the whole
 * bow is two draw calls however many bands it has.
 *
 * MIST, not a solid bow: both passes are additive and write no depth, so the
 * bands lay light over whatever is behind them instead of cutting it out, and
 * they cross each other where they overlap the way a real bow's colours do.
 * The haze pass is the same seven arcs at four times the thickness and a tenth
 * of the strength — that is what gives the edges somewhere to fade OUT to, and
 * it is doing the work a bloom pass would if the scene had one.
 */
const ARCH_SPRING = GLOBE_Y + GLOBE_R + 0.3;
/**
 * Newton's seven, but as STOPS ON A GRADIENT rather than seven bands.
 *
 * A real bow has no lines in it. It is one continuous spread of refracted
 * light, brightest through the middle and dying out at both edges, and the
 * seven names are a convention laid over something that has no edges at all —
 * which is exactly what the first cut drew: seven separately coloured tubes,
 * each ending where the next began, so the bow read as a painted target rather
 * than as light. The colours below are now sampled ACROSS the bow's width by
 * `archSpectrum`, and the sub-arcs carrying them are close enough together to
 * blend into each other.
 */
const ARCH_COLOURS = ['#8e44c8', '#3f5bd8', '#2f9bd8', '#3faa4a', '#f2c53d', '#ee8a2b', '#d3402f'];
/** the bow's full width, unchanged from when it was 7 × 0.13 */
const ARCH_WIDTH = 0.91;
/**
 * How many sub-arcs the spread is cut into. Enough that neighbours overlap and
 * no step is visible; not so many that a bow costs more vertices than the
 * pillars holding it up. They still merge to ONE geometry either way.
 */
const ARCH_STEPS = 44;
/** radius of the innermost sub-arc, set so the spread is centred on the
 *  pillars' centre lines — the bow's feet then sit on the shafts, not beside
 *  them, whatever PILLAR_X works out to */
const ARCH_R0 = PILLAR_X - ARCH_WIDTH / 2;

/**
 * The colour at `t` across the bow, ALREADY FADED for its position.
 *
 * The fade is the second half of what stops the bow having edges. These arcs
 * are additive, so a colour multiplied toward black IS a colour fading out —
 * there is no alpha to vary per vertex on a shared material. `sin(πt)` takes
 * the spread to nothing at both rims, and the ⅔ power holds the middle open so
 * the bow does not collapse into a single bright line down its centre.
 */
function archSpectrum(t: number): THREE.Color {
  const span = (ARCH_COLOURS.length - 1) * t;
  const i = Math.min(ARCH_COLOURS.length - 2, Math.floor(span));
  const c = new THREE.Color(ARCH_COLOURS[i]).lerp(new THREE.Color(ARCH_COLOURS[i + 1]), span - i);
  return c.multiplyScalar(Math.sin(Math.PI * t) ** (2 / 3));
}
/** half-thickness of a sub-arc front to back: enough to catch the eye edge-on
 *  from the doorway, thin enough to stay a bow rather than a tunnel. Sized so
 *  neighbours OVERLAP — that overlap is what makes the spread continuous. */
const ARCH_TUBE = (ARCH_WIDTH / ARCH_STEPS) * 1.6;
/**
 * How much of the bow's own colour survives.
 *
 * Down from 0.42, and it had to come down twice over: the sub-arcs overlap
 * where the seven bands used to merely abut, so the same figure stacks more
 * light than it did, and a rainbow is a thing you see THROUGH. At this strength
 * the apse wall, the drapery and the Gloria all read straight through the bow,
 * which is the difference between light in the air and a painted arch.
 */
const ARCH_OPACITY = 0.2;
/** the soft pass around it, and how far it spreads past a band's own edge */
const ARCH_HAZE_OPACITY = 0.05;
const ARCH_HAZE_TUBE = ARCH_TUBE * 5;
/**
 * The one real light the bow casts, hung at its crown.
 *
 * ONE. A glow that only brightens the arch's own pixels reads as a decal
 * painted on the dark; this puts a wash on the pillars' capitals and the floor
 * between them, which is what tells you the thing overhead is a source. Its
 * range is capped short so it dies before the rotunda mouth and never competes
 * with the drum's rig, and so that it stays the vestibule's own light rather
 * than a second sun beside the hall's two lanterns.
 */
const ARCH_LIGHT_COLOR = '#cfe0ff';
const ARCH_LIGHT_INTENSITY = 26;
const ARCH_LIGHT_RANGE = 13;

/** which globe rides which pillar. Boaz stands to the left (−x) as you face the
 *  doors, Jachin to the right (+x); the earth is given to Boaz, the heavens to
 *  Jachin — the two-globes pairing of the period's tracing boards. */
const PILLARS: { kind: 'boaz' | 'jachin'; name: string; celestial: boolean; glow: number }[] = [
  { kind: 'boaz', name: 'Boaz', celestial: false, glow: 0.05 },
  { kind: 'jachin', name: 'Jachin', celestial: true, glow: 0.3 },
];

/** one pillar: a stone column on a moulded base, a chapiter wreathed in
 *  pomegranates, and a brass-mounted globe turning on top. The globe is the
 *  click target. */
function Pillar({
  spec,
  pos,
  rotY,
  labelZ,
  selected,
  onPick,
  still,
}: {
  spec: (typeof PILLARS)[number];
  pos: [number, number, number];
  rotY: number;
  labelZ: number;
  selected: boolean;
  onPick?: (kind: string) => void;
  still: boolean;
}) {
  const brass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: PILLAR_BRASS, metalness: 0.8, roughness: 0.34 }),
    [],
  );
  // the step's pale marble — the same stone the statue pedestals are cut from,
  // which is what ties the pair to the figures they now stand level with
  const step = useMemo(
    () => getMaterial('stone_marble_white', { repeat: [1, 1], overrides: { color: '#cdbfa4', roughness: 0.5 } }),
    [],
  );
  const map = useMemo(() => (spec.celestial ? celestialGlobeMap() : terrestrialGlobeMap()), [spec.celestial]);
  const ballMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map,
        roughness: 0.78,
        metalness: 0,
        // the apse is dim and the celestial skin is a night ground; a little
        // self-illumination keeps the shadowed limb from reading as a black ball
        emissive: new THREE.Color('#ffffff'),
        emissiveMap: map,
        emissiveIntensity: spec.glow,
      }),
    [map, spec.glow],
  );
  useLayoutEffect(() => () => [brass, ballMat].forEach((m) => m.dispose()), [brass, ballMat]);

  const ball = useRef<THREE.Mesh>(null);
  const proxy = useRef<THREE.Mesh>(null);
  const hovered = useRef(false);

  useEffect(() => {
    const m = proxy.current;
    if (!m || !onPick) return;
    registerPickable(m, {
      onPick: () => onPick(spec.kind),
      onHover: (h) => {
        hovered.current = h;
      },
      maxDist: 9,
    });
    return () => {
      unregisterPickable(m);
      hovered.current = false;
    };
  }, [onPick, spec.kind]);

  useFrame((_, dt) => {
    if (ball.current && !still) ball.current.rotation.y += dt * (spec.celestial ? 0.075 : 0.1);
    // brighten the globe while hovered or open, easing back when not
    const want = spec.glow + (hovered.current || selected ? 0.6 : 0);
    ballMat.emissiveIntensity = THREE.MathUtils.lerp(ballMat.emissiveIntensity, want, 1 - Math.exp(-dt * 9));
  });

  return (
    <group position={pos} rotation-y={rotY}>
      {/* The moulded step, in two courses. It came from the porch that used to
          be carved into the wall behind these two, and it is the one part of it
          worth keeping — a column standing straight on floorboards reads as
          dropped there rather than sited. A FULL circle now: it was a half-disc
          while the pillars stood half inside a recess, and half a step in open
          floor is a step with a bite out of it. Sized to the pillar's foot
          (PILLAR_STEP_R), and PILLAR_X is measured off it so the pair keeps its
          clearance from the wall however the apse is re-cut. */}
      <mesh position={[0, 0.08, 0]} material={step}>
        <cylinderGeometry args={[PILLAR_STEP_R, PILLAR_STEP_R + 0.04, 0.16, 44]} />
      </mesh>
      <mesh position={[0, 0.18, 0]} material={step}>
        <cylinderGeometry args={[PILLAR_STEP_R - 0.16, PILLAR_STEP_R - 0.12, 0.05, 44]} />
      </mesh>

      {/* the sculpted marble pillar itself — Boaz / Jachin, its letter carved on
          the shaft and its Corinthian capital modelled in; the procedural stone
          column it replaced is gone */}
      {/* NOT held back for the reveal, unlike the niche figures: its Suspense
          fallback is `null` because the procedural column it replaced is gone,
          so holding it would open the doors on two missing pillars and pop
          them in afterwards. A figure can wait because something is standing
          in its place; this cannot. */}
      <Suspense fallback={null}>
        <GLBModel src={`/models/${spec.kind}.glb`} targetHeight={PILLAR_H} position={[0, 0]} animate={false} />
      </Suspense>

      {/* the globe crowning it: a brass meridian tilted to the ecliptic, the
          engraved sphere turning inside it, a pin at each pole. Boaz carries the
          terrestrial globe, Jachin the celestial — the period's two-globes pair. */}
      <group position={[0, GLOBE_Y, 0]} rotation-z={AXIAL_TILT}>
        <mesh material={brass}>
          <torusGeometry args={[GLOBE_R + 0.08, 0.02, 8, 56]} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh key={s} position={[0, s * (GLOBE_R + 0.045), 0]} material={brass}>
            <cylinderGeometry args={[0.018, 0.018, 0.09, 8]} />
          </mesh>
        ))}
        <mesh ref={ball} material={ballMat}>
          <sphereGeometry args={[GLOBE_R, 40, 28]} />
        </mesh>
      </group>

      {/* the name at the base */}
      <TextSprite position={[0, 0.66, labelZ]} height={0.15} color={BRASS} billboard={false} outline={false} maxWidthPx={360}>
        {spec.name}
      </TextSprite>

      {/* the click target: a tall box around the whole pillar and its globe, so
          you can click it from the floor without threading the brass meridian */}
      <mesh ref={proxy} position={[0, (GLOBE_Y + GLOBE_R) / 2, 0]}>
        <boxGeometry args={[1.1, GLOBE_Y + GLOBE_R, 1.1]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

/**
 * Where the pillars stand — THE APSE, one each side of the Librarian.
 *
 * The history is worth keeping, because every earlier home failed the same
 * way: either something else already wanted those few metres, or there was
 * nothing on the far side of the gateway. They began ON the drum piers flanking
 * the apse mouth — which Isis & Serapis now hold, in niches that leave no room
 * beside them — were latterly sunk into recesses carved out of the apse walls,
 * which framed a column that is meant to be seen all the way round, and then
 * stood in the entrance vestibule, where they were a threshold to a corridor.
 *
 * Flanking the Librarian answers both. Nothing else stands on those two spots;
 * the apse is 6 m across, so the pair keeps clear air behind it and a 3.3 m
 * walk between the steps; and the pair now frames a person rather than an empty
 * hall — which is what a gateway is for. They stand a little in front of her so
 * their collision circles clear her desk's (see PILLAR_Z). A rainbow bow spans
 * the two above their globes (RainbowArch), which is what makes them read as
 * ONE gateway you pass under rather than two columns you happen to pass
 * between. */

/** The rainbow bow spanning Boaz & Jachin: seven concentric arcs merged into a
 *  single unlit mesh, springing clear of the two globes. See the note on
 *  ARCH_SPRING. */
function RainbowArch() {
  /** the spread cut into sub-arcs at a given thickness, merged, each carrying
   *  its own sampled and faded colour */
  const build = (tube: number, steps = ARCH_STEPS) => {
    const parts = Array.from({ length: steps }, (_, i) => {
      const t = (i + 0.5) / steps;
      // a half torus lies in XY with its arc running x = R cos θ, y = R sin θ,
      // so θ ∈ [0, π] IS the bow: feet on the floor line, crown overhead
      const g = new THREE.TorusGeometry(ARCH_R0 + t * ARCH_WIDTH, tube, 5, 48, Math.PI);
      const c = archSpectrum(t);
      const col = new Float32Array(g.attributes.position.count * 3);
      for (let v = 0; v < g.attributes.position.count; v++) c.toArray(col, v * 3);
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      return g;
    });
    const merged = mergeGeometries(parts)!;
    parts.forEach((g) => g.dispose());
    return merged;
  };
  const geom = useMemo(() => build(ARCH_TUBE), []);
  // the haze is a broad wash, so it needs a fraction of the steps
  const haze = useMemo(() => build(ARCH_HAZE_TUBE, 12), []);
  const mats = useMemo(() => {
    const common = {
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      // no depth write: the bands are mist, so they must not punch a hole in
      // each other where they overlap, nor in the doors seen through them
      depthWrite: false,
    } as const;
    return {
      band: new THREE.MeshBasicMaterial({ ...common, opacity: ARCH_OPACITY }),
      haze: new THREE.MeshBasicMaterial({ ...common, opacity: ARCH_HAZE_OPACITY }),
    };
  }, []);
  useLayoutEffect(
    () => () => {
      geom.dispose();
      haze.dispose();
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geom, haze, mats],
  );

  return (
    <group position={[0, ARCH_SPRING, PILLAR_Z]}>
      {/* the soft pass first, so the sharp bands read as its core */}
      <mesh geometry={haze} material={mats.haze} renderOrder={2} />
      <mesh geometry={geom} material={mats.band} renderOrder={3} />
      {/* what makes it a source rather than a decal — see ARCH_LIGHT_COLOR */}
      <pointLight
        position={[0, ARCH_R0 * 0.55, 0]}
        color={ARCH_LIGHT_COLOR}
        intensity={ARCH_LIGHT_INTENSITY}
        distance={ARCH_LIGHT_RANGE}
        decay={2}
      />
    </group>
  );
}

/** where the two pillars actually stand, for the walk-collision circles in
 *  GrandLibrary.tsx — exported so the obstacles cannot drift off the models */
export const PILLAR_STANCE: { x: number; z: number }[] = [
  { x: -PILLAR_X, z: PILLAR_Z },
  { x: PILLAR_X, z: PILLAR_Z },
];

/** Boaz & Jachin flanking the Librarian's station in the apse — the gateway you
 *  pass between on the walk up to her. Each stands free in front of the apse's
 *  straight side wall — against a wall, never screened by one. Positions come
 *  from layout.ts; see the note there. */
export function MasonicPillars({
  selected = null,
  onPick,
  still,
}: {
  /** the pillar whose reading is open, by `kind` */
  selected?: string | null;
  onPick?: (kind: string) => void;
  still: boolean;
}) {
  const placed = useMemo(() => {
    return PILLARS.map((spec) => {
      // Boaz to −x, Jachin to +x. Both face +z — back down the apse toward the
      // rotunda — so their carved letters read on approach, because everyone
      // who passes them is walking up to the Librarian from that end.
      const s = spec.kind === 'boaz' ? -1 : 1;
      return {
        spec,
        rotY: 0,
        pos: [s * PILLAR_X, 0, PILLAR_Z] as [number, number, number],
        labelZ: 0.5,
      };
    });
  }, []);

  return (
    <group>
      {placed.map((pl) => (
        <Pillar
          key={pl.spec.kind}
          spec={pl.spec}
          pos={pl.pos}
          rotY={pl.rotY}
          labelZ={pl.labelZ}
          selected={selected === pl.spec.kind}
          onPick={onPick}
          still={still}
        />
      ))}
      <RainbowArch />
    </group>
  );
}
