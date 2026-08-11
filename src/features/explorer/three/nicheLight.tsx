import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getGlowTexture } from './glowTexture';
import { DRUM_FACE_R, NICHES } from './structure';

/**
 * THE KEY LIGHT ON THE STATUARY — two real lights for ten niches.
 *
 * ── the problem ────────────────────────────────────────────────────────────
 *
 * Every figure on the drum was lit by exactly nothing. The niches carry a
 * vertex-colour bake and two additive candle plumes, which do a good job on
 * the CLOTH behind a figure and can do nothing at all for the figure itself:
 * a baked gradient lives on the shell's vertices and the statue is a separate
 * glTF standing in front of it. So the marble took only the moonlight and the
 * two ambient terms — the same light from every direction, which is another
 * way of saying no light at all. Ten evenly-lit figures in ten identical
 * alcoves, and nobody slows down for any of them.
 *
 * ── why the obvious fix is unaffordable ────────────────────────────────────
 *
 * A key, a fill and a rim per niche is thirty lights. In three's forward
 * renderer every light is evaluated by every lit fragment of all two thousand
 * draw calls regardless of its `distance` — this scene measures around 1.5 fps
 * per added light, so the honest theatrical rig costs the museum roughly half
 * its frame rate. There is no version of that trade worth making.
 *
 * ── what this does instead ─────────────────────────────────────────────────
 *
 * TWO spotlights exist, permanently, and they move to whichever niches the
 * visitor is nearest. You can only stand in front of one or two statues at
 * once, and the eight you are not looking at do not need a key light — they
 * need a silhouette, which the shell bake and the plumes already give them.
 *
 * The light count NEVER CHANGES, which is the part that matters. Adding or
 * removing a light invalidates every shader program in the scene and triggers
 * a recompile storm; an earlier experiment here measured *worse* frame rates
 * with lights switched OFF for exactly that reason. Two lights, always, moving.
 *
 * A slot only re-aims once it has faded out, so the reassignment happens in
 * the dark and there is nothing to see. And each flickers on its own clock,
 * because the two candle stands at the foot of each niche are what the light
 * is pretending to be.
 */

/** how close before a niche is worth a real light, and where it is at full */
const REACH_ON = 8.5;
const REACH_OFF = 13.0;
/** a slot may only change target once it is this dark */
const SWAP_BELOW = 0.06;

const KEY_INTENSITY = 30;

interface Aim {
  /** the lamp, hidden up inside the head of the recess */
  from: THREE.Vector3;
  /** the figure's chest */
  to: THREE.Vector3;
  /** where the visitor is judged to be standing when they look at it */
  front: THREE.Vector3;
}

export function NicheKeyLights({ still }: { still: boolean }) {
  const aims = useMemo<Aim[]>(
    () =>
      NICHES.map((n) => {
        const c = Math.cos(n.theta);
        const s = Math.sin(n.theta);
        const at = (r: number, y: number) => new THREE.Vector3(c * r, y, s * r);
        return {
          // just under the springing of the conch and set back into the
          // recess, so the beam rakes down the front of the figure rather
          // than flooding it from the room
          // up in the head of the conch and set back into the recess, so the
          // lamp sits at the mouth of the visible shaft rather than beside it
          from: at(DRUM_FACE_R + 0.3, n.springY + n.r * 0.35),
          to: at(DRUM_FACE_R + 0.2, 2.15),
          front: at(DRUM_FACE_R - 2.4, 1.7),
        };
      }),
    [],
  );

  const lights = useRef<(THREE.SpotLight | null)[]>([null, null]);
  const targets = useMemo(
    () => [new THREE.Object3D(), new THREE.Object3D()],
    [],
  );
  /** which niche each slot is currently serving, and how far it has faded up */
  const slots = useRef([
    { niche: 0, level: 0 },
    { niche: 1, level: 0 },
  ]);

  useFrame((state, dt) => {
    const cam = state.camera.position;
    // the two nearest niches, by where a visitor would stand to look at one
    let bestA = -1;
    let bestB = -1;
    let dA = Infinity;
    let dB = Infinity;
    for (let i = 0; i < aims.length; i++) {
      const d = cam.distanceTo(aims[i].front);
      if (d < dA) {
        dB = dA;
        bestB = bestA;
        dA = d;
        bestA = i;
      } else if (d < dB) {
        dB = d;
        bestB = i;
      }
    }
    const wanted = [
      { niche: bestA, dist: dA },
      { niche: bestB, dist: dB },
    ];
    const k = 1 - Math.exp(-dt * 3.4);

    for (let s = 0; s < 2; s++) {
      const light = lights.current[s];
      if (!light) continue;
      const slot = slots.current[s];
      const want = wanted[s];
      // a slot re-aims only once it is dark; until then it fades out
      if (slot.niche !== want.niche && slot.level < SWAP_BELOW) {
        slot.niche = want.niche;
      }
      const serving = slot.niche === want.niche && want.niche >= 0;
      const reach = serving
        ? 1 - THREE.MathUtils.clamp((want.dist - REACH_ON) / (REACH_OFF - REACH_ON), 0, 1)
        : 0;
      slot.level = THREE.MathUtils.lerp(slot.level, reach, k);

      const aim = aims[slot.niche];
      light.position.copy(aim.from);
      targets[s].position.copy(aim.to);
      targets[s].updateMatrixWorld();
      // two candle stands guttering at the foot of the recess, not a lamp
      const t = state.clock.elapsedTime;
      const flick = still
        ? 1
        : 1 + Math.sin(t * (6.9 + s * 2.3) + s * 4) * 0.07 + Math.sin(t * (19.3 + s * 3.1)) * 0.035;
      light.intensity = KEY_INTENSITY * slot.level * flick;
      // NEVER toggle `visible` here. The number of visible lights is a shader
      // DEFINE (NUM_SPOT_LIGHTS), so switching one off recompiles every
      // material in the building — measured at ~35 programs and a ~460 ms
      // freeze, landing exactly as the visitor walks up to a niche or passes
      // one in a hallway. The two slots stay lit for the life of the scene and
      // the fade above already takes their intensity to zero, which costs a
      // couple of unused lanes in the light loop and nothing else.
    }
  });

  return (
    <group>
      {[0, 1].map((s) => (
        <group key={s}>
          <primitive object={targets[s]} />
          <spotLight
            ref={(el: THREE.SpotLight | null) => {
              lights.current[s] = el;
            }}
            target={targets[s]}
            color="#ffb473"
            intensity={0}
            // narrow, with a very soft edge: a shuttered theatre lamp, not a
            // bulb. A hard-edged pool on a statue reads as a spotlight; a soft
            // one reads as the alcove being brighter than the room.
            angle={0.7}
            penumbra={0.95}
            decay={1.5}
            distance={9.5}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * The visible part of the beam, and the dust standing in it.
 *
 * A key light you cannot see is a bright patch on some marble. What makes an
 * alcove read as lit — and what makes a visitor slow down at it — is the
 * COLUMN of light between the source and the figure, which in a real building
 * is a few million motes of two centuries of paper dust.
 *
 * Both parts are free of the light budget: an open additive cone per niche at
 * six percent opacity, and every niche's motes in ONE `Points` object. They
 * are always on, even for the eight niches without a real key at any moment —
 * a shaft of dust in an unlit alcove is exactly what a distant alcove looks
 * like, and it is what gives the drum its depth from the middle of the room.
 */
export function NicheBeams({ still }: { still: boolean }) {
  const cones = useMemo(
    () =>
      NICHES.map((n) => {
        const c = Math.cos(n.theta);
        const s = Math.sin(n.theta);
        // the shaft belongs INSIDE the recess, not in front of it: set back
        // past the plane of the opening so the lit air is the alcove's own.
        const r = DRUM_FACE_R + 0.3;
        // and it must be BORN somewhere. Starting at springY - 0.2 left the
        // apex hanging in clear air below the arch; carried up into the curve
        // of the conch it starts where a light in the head of the recess would.
        const top = n.springY + n.r * 0.5;
        const drop = top - 1.5;
        return {
          pos: [c * r, top - drop / 2, s * r] as [number, number, number],
          rotY: Math.atan2(-c, -s),
          height: drop,
          radius: Math.min(n.r * 0.7, 0.82),
        };
      }),
    [],
  );

  const coneGeom = useMemo(() => new THREE.ConeGeometry(1, 1, 18, 1, true), []);
  const coneMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getGlowTexture(),
        color: '#ffc489',
        transparent: true,
        // 0.055 was enough to see the CONE — a lighter triangle with legible
        // edges printed on the damask, which is a shape, not a shaft. Halved,
        // it is only a thickening of the air, and the motes carry the rest.
        opacity: 0.028,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );

  /** the motes, all ten niches in one buffer */
  const moteGeom = useMemo(() => {
    const per = 14;
    const pos = new Float32Array(cones.length * per * 3);
    const phase = new Float32Array(cones.length * per);
    let i = 0;
    for (const c of cones) {
      for (let k = 0; k < per; k++) {
        // inside the cone, biased toward its wide end where the light is
        const t = Math.pow(Math.random(), 0.7);
        const rr = c.radius * t * Math.sqrt(Math.random());
        const a = Math.random() * Math.PI * 2;
        const nx = -Math.sin(c.rotY);
        const nz = Math.cos(c.rotY);
        const fx = Math.cos(c.rotY);
        const fz = Math.sin(c.rotY);
        pos[i * 3] = c.pos[0] + nx * Math.cos(a) * rr + fx * Math.sin(a) * rr * 0.5;
        pos[i * 3 + 1] = c.pos[1] + c.height * (0.5 - t);
        pos[i * 3 + 2] = c.pos[2] + nz * Math.cos(a) * rr + fz * Math.sin(a) * rr * 0.5;
        phase[i] = Math.random() * Math.PI * 2;
        i++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.userData.phase = phase;
    g.userData.base = pos.slice();
    return g;
  }, [cones]);

  const moteMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: getGlowTexture(),
        color: '#ffd6a4',
        size: 0.055,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const motes = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (still || !motes.current) return;
    const t = state.clock.elapsedTime;
    const attr = moteGeom.attributes.position as THREE.BufferAttribute;
    const base = moteGeom.userData.base as Float32Array;
    const phase = moteGeom.userData.phase as Float32Array;
    for (let i = 0; i < phase.length; i++) {
      // dust in still air does not fall, it wanders. Millimetres, slowly.
      attr.array[i * 3] = base[i * 3] + Math.sin(t * 0.21 + phase[i]) * 0.05;
      attr.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.13 + phase[i] * 1.7) * 0.07;
      attr.array[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.17 + phase[i]) * 0.05;
    }
    attr.needsUpdate = true;
  });

  return (
    <group>
      {cones.map((c, i) => (
        <mesh
          key={i}
          geometry={coneGeom}
          material={coneMat}
          position={c.pos}
          rotation-y={c.rotY}
          scale={[c.radius, c.height, c.radius * 0.55]}
        />
      ))}
      <points ref={motes} geometry={moteGeom} material={moteMat} />
    </group>
  );
}
