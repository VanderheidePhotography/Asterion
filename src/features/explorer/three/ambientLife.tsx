import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { getGlowTexture } from './glowTexture';
import { mulberry32 } from '../../../domain/random';
import { wingPoint, WING_ANGLES, WING_U1 } from './layout';
import { ambient } from '../../audio/ambient';

/**
 * Small lives that make the hall feel inhabited: moths spiralling in the
 * chandelier light, and — for whoever thinks to look up through the oculus —
 * the occasional shooting star. A dozen sprites, no lights, no geometry.
 */

/* ————— moths in the chandelier glow ————— */

interface Moth {
  anchor: [number, number, number];
  r: number;
  speed: number;
  wobble: number;
  phase: number;
  size: number;
}

export function ChandelierMoths({
  still,
  anchors,
}: {
  still: boolean;
  anchors: [number, number, number][];
}) {
  const moths = useMemo(() => {
    const rng = mulberry32(4242);
    const out: Moth[] = [];
    for (const anchor of anchors) {
      for (let i = 0; i < 3; i++) {
        out.push({
          anchor,
          r: 0.5 + rng() * 0.5,
          speed: (0.7 + rng() * 0.9) * (rng() > 0.5 ? 1 : -1),
          wobble: 1.5 + rng() * 2.5,
          phase: rng() * Math.PI * 2,
          size: 0.05 + rng() * 0.04,
        });
      }
    }
    return out;
  }, [anchors]);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);

  useFrame((state) => {
    if (still) return;
    const t = state.clock.elapsedTime;
    moths.forEach((m, i) => {
      const s = sprites.current[i];
      if (!s) return;
      const a = m.phase + t * m.speed;
      // an erratic little orbit: radius and height breathe on unrelated clocks
      const r = m.r + Math.sin(t * m.wobble + m.phase) * 0.16;
      s.position.set(
        m.anchor[0] + Math.cos(a) * r,
        m.anchor[1] + 0.05 + Math.sin(t * m.wobble * 0.7 + m.phase * 3) * 0.22,
        m.anchor[2] + Math.sin(a) * r,
      );
      (s.material as THREE.SpriteMaterial).opacity =
        0.35 + 0.3 * Math.abs(Math.sin(t * m.wobble * 2 + m.phase));
    });
  });

  if (still) return null;
  return (
    <group>
      {moths.map((m, i) => (
        <sprite
          key={i}
          ref={(el) => {
            sprites.current[i] = el;
          }}
          position={m.anchor}
          scale={[m.size, m.size, 1]}
        >
          <spriteMaterial
            map={getGlowTexture()}
            color="#ffe2b0"
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}

/* ————— the storm beyond the windows ————— */

const RAIN_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const RAIN_FRAG = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
float hash(float n) { return fract(sin(n) * 43758.5453); }
void main() {
  // thin streaks falling at staggered speeds in vertical lanes
  float lane = floor(vUv.x * 42.0);
  float speed = 0.55 + hash(lane) * 0.5;
  float phase = hash(lane * 7.3);
  float y = fract(vUv.y + uTime * speed + phase);
  float streak = smoothstep(0.0, 0.06, y) * smoothstep(0.16, 0.06, y);
  float inLane = smoothstep(0.0, 0.25, fract(vUv.x * 42.0)) * smoothstep(1.0, 0.75, fract(vUv.x * 42.0));
  float presence = step(0.35, hash(lane * 3.1)); // not every lane rains
  float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x)
             * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
  gl_FragColor = vec4(vec3(0.62, 0.72, 0.86), streak * inLane * presence * edge * 0.4);
}
`;

/** rain sliding down the great wing-end windows, with distant thunder */
export function StormWindows({ still }: { still: boolean }) {
  const { gl } = useThree();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const thunder = useRef({ nextAt: 20 + Math.random() * 30, flashUntil: 0, boomAt: 0 });
  const spots = useMemo(
    () =>
      WING_ANGLES.map((a) => {
        const [x, z] = wingPoint(a, WING_U1 - 0.6, 0);
        return { pos: [x, 8.6, z] as [number, number, number], rotY: -a + Math.PI / 2 };
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (still) return;
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;
    const th = thunder.current;
    if (t >= th.nextAt) {
      // a two-beat flash of the whole hall, then the rumble arrives late
      th.flashUntil = t + 0.45;
      th.boomAt = t + 1.4 + Math.random() * 1.2;
      th.nextAt = t + 50 + Math.random() * 70;
    }
    if (th.flashUntil > t) {
      const k = (th.flashUntil - t) / 0.45;
      const strobe = Math.sin(k * Math.PI * 4) > -0.2 ? 1 : 0.3;
      gl.toneMappingExposure = 1.3 + 0.35 * k * strobe;
    } else if (gl.toneMappingExposure !== 1.3) {
      gl.toneMappingExposure = 1.3;
    }
    if (th.boomAt && t >= th.boomAt) {
      th.boomAt = 0;
      ambient.thunder();
    }
  });
  // never leave the hall over-exposed when the storm unmounts
  useEffect(
    () => () => {
      gl.toneMappingExposure = 1.3;
    },
    [gl],
  );

  if (still) return null;
  return (
    <group>
      {spots.map((s, i) => (
        <mesh key={i} position={s.pos} rotation-y={s.rotY}>
          <planeGeometry args={[8.5, 10.5]} />
          <shaderMaterial
            vertexShader={RAIN_VERT}
            fragmentShader={RAIN_FRAG}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ————— the guiding wisp: the Librarian's errand-light ————— */

export function QuestWisp({ target }: { target: [number, number] | null }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ camera, clock }, delta) => {
    const g = group.current;
    if (!g || !target) return;
    const t = clock.elapsedTime;
    const dx = target[0] - camera.position.x;
    const dz = target[1] - camera.position.z;
    const dist = Math.hypot(dx, dz);
    let gx: number, gz: number, gy: number;
    if (dist > 3.2) {
      // fly ahead of the visitor, always a few strides toward the goal
      const k = Math.min(4.2, dist * 0.55) / (dist || 1);
      gx = camera.position.x + dx * k;
      gz = camera.position.z + dz * k;
      gy = 2.6;
    } else {
      // arrived: circle patiently over the station
      gx = target[0] + Math.cos(t * 1.3) * 0.5;
      gz = target[1] + Math.sin(t * 1.3) * 0.5;
      gy = 2.15;
    }
    gy += Math.sin(t * 2.2) * 0.13;
    g.position.set(
      THREE.MathUtils.damp(g.position.x, gx, 2.2, delta),
      THREE.MathUtils.damp(g.position.y, gy, 2.2, delta),
      THREE.MathUtils.damp(g.position.z, gz, 2.2, delta),
    );
    const flicker = 0.85 + Math.sin(t * 7.3) * 0.1;
    g.scale.setScalar(flicker);
  });
  if (!target) return null;
  return (
    <group ref={group} position={[0, 2.6, 6]}>
      <sprite scale={[0.2, 0.2, 1]}>
        <spriteMaterial map={getGlowTexture()} color="#fff6dd" transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite scale={[0.72, 0.72, 1]}>
        <spriteMaterial map={getGlowTexture()} color="#ffd98a" transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

/* ————— shooting stars, seen through the oculus ————— */

let streakTexCache: THREE.CanvasTexture | null = null;
function streakTex(): THREE.CanvasTexture {
  if (streakTexCache) return streakTexCache;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 16;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 128, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.75, 'rgba(255,240,210,0.55)');
  g.addColorStop(0.96, 'rgba(255,252,240,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 5, 128, 6);
  const t = new THREE.CanvasTexture(c);
  streakTexCache = t;
  return t;
}

export function ShootingStars({ still }: { still: boolean }) {
  const sprite = useRef<THREE.Sprite>(null);
  const state = useRef({
    nextAt: 8 + Math.random() * 10,
    active: false,
    start: 0,
    dur: 1.1,
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
  });
  const scratch = useMemo(
    () => ({ p: new THREE.Vector3(), d: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3() }),
    [],
  );

  useFrame(({ clock, camera }) => {
    const s = sprite.current;
    if (!s) return;
    const st = state.current;
    const t = clock.elapsedTime;
    if (!st.active) {
      s.visible = false;
      if (t >= st.nextAt) {
        // a chord high across the dome, always above the drum
        const az = Math.random() * Math.PI * 2;
        const el1 = 0.9 + Math.random() * 0.4; // radians of elevation
        const el2 = el1 - (0.15 + Math.random() * 0.2);
        const az2 = az + (0.5 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1);
        const R = 74;
        st.from.set(Math.cos(el1) * Math.cos(az) * R, Math.sin(el1) * R, Math.cos(el1) * Math.sin(az) * R);
        st.to.set(Math.cos(el2) * Math.cos(az2) * R, Math.sin(el2) * R, Math.cos(el2) * Math.sin(az2) * R);
        st.dur = 0.9 + Math.random() * 0.6;
        st.start = t;
        st.active = true;
      }
      return;
    }
    const k = (t - st.start) / st.dur;
    if (k >= 1) {
      st.active = false;
      st.nextAt = t + 16 + Math.random() * 26;
      s.visible = false;
      return;
    }
    const { p, d, right, up } = scratch;
    p.lerpVectors(st.from, st.to, k);
    s.position.copy(p);
    s.visible = true;
    const mat = s.material as THREE.SpriteMaterial;
    mat.opacity = Math.sin(Math.PI * k) * 0.9;
    // align the streak with its screen-space direction of travel
    d.subVectors(st.to, st.from);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    mat.rotation = Math.atan2(d.dot(up), d.dot(right));
  });

  if (still) return null;
  return (
    <sprite ref={sprite} visible={false} scale={[9, 0.6, 1]}>
      <spriteMaterial
        map={streakTex()}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </sprite>
  );
}
