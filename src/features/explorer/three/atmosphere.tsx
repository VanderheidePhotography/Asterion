import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getGlowTexture } from './glowTexture';
import { CLUSTER_META, type ClusterId } from '../../../domain/types';
import { wingPoint, WING_ANGLES, WING_U1 } from './layout';

/**
 * Light with a colour of its own. Each wing's stained-glass window pours a
 * shaft of its tradition's hue into the hall — a volumetric beam thick with
 * drifting dust, a warm pool where it lands on the floor, and a soft fill that
 * bleeds the colour onto the nearest shelves. Cloth banners hang at every
 * mouth. Together they turn eight identical brown corridors into eight rooms
 * that each feel like somewhere.
 */

// wings are ordered the same as the cluster keys
const WING_CLUSTERS = Object.keys(CLUSTER_META) as ClusterId[];

/* ————— the coloured light shaft from a window ————— */

const SHAFT_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const SHAFT_FRAG = /* glsl */ `
varying vec2 vUv;
uniform vec3 uColor;
uniform float uTime;
float hash(float n) { return fract(sin(n) * 43758.5453); }
void main() {
  // soft-edged column, brightest at the window (top) fading toward the floor
  float across = smoothstep(0.0, 0.32, vUv.x) * smoothstep(1.0, 0.68, vUv.x);
  float along = smoothstep(0.0, 0.18, vUv.y) * (1.0 - vUv.y * 0.72);
  // slow motes drifting down the beam
  float lane = floor(vUv.x * 9.0);
  float m = hash(lane + floor(vUv.y * 3.0 + uTime * 0.25));
  float dust = 0.72 + 0.28 * sin(uTime * 1.3 + vUv.y * 26.0 + lane) * step(0.4, m);
  gl_FragColor = vec4(uColor, across * along * dust * 0.3);
}
`;

function WindowRadiance({ angle, color, still }: { angle: number; color: string; still: boolean }) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(color).multiplyScalar(1.15) }, uTime: { value: 0 } }),
    [color],
  );
  const poolMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getGlowTexture(),
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [color],
  );
  useEffect(() => () => poolMat.dispose(), [poolMat]);
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!still) uniforms.uTime.value = state.clock.elapsedTime;
    if (light.current && !still) {
      light.current.intensity = 12 + Math.sin(state.clock.elapsedTime * 0.7 + angle) * 1.6;
    }
  });

  // a group aligned to the wing: local +x runs outward toward the window,
  // local z runs across the hall
  const [wx, wz] = wingPoint(angle, WING_U1 - 3.6, 0);
  return (
    <group position={[wx, 0, wz]} rotation-y={-angle}>
      {/* the beam: two crossed quads leaning in from the high window down to
          the floor — the classic cathedral god-ray */}
      <group position={[-0.6, 3.6, 0]} rotation-z={0.48}>
        {[0, Math.PI / 2].map((ry) => (
          <mesh key={ry} rotation-y={ry}>
            <planeGeometry args={[5.2, 12]} />
            <shaderMaterial
              vertexShader={SHAFT_VERT}
              fragmentShader={SHAFT_FRAG}
              uniforms={uniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
      {/* the window blooms its colour into the room */}
      <sprite position={[2.9, 5.6, 0]} scale={[6, 7, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color={new THREE.Color(color)}
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      {/* the pool of colour where the shaft meets the floor */}
      <mesh position={[-2.4, 0.06, 0]} rotation-x={-Math.PI / 2} material={poolMat}>
        <planeGeometry args={[9, 5.4]} />
      </mesh>
      {/* a soft fill that tints the shelves and end wall */}
      <pointLight ref={light} position={[1.4, 5.2, 0]} color={color} intensity={18} distance={24} decay={1.8} />
    </group>
  );
}


/* ————— warm light lifting the heart of the rotunda ————— */

export function HearthGlow() {
  return (
    <group>
      {/* two warm lights, one lifting the great globe at the heart of the rotunda */}
      <pointLight position={[0, 4.2, 0]} color="#ffcb7a" intensity={9} distance={12} decay={2} />
      <pointLight position={[0, 6.5, 6]} color="#ffcb7a" intensity={6} distance={13} decay={2} />
    </group>
  );
}

/* ————— the whole atmospheric layer ————— */

export function WingRadiance({ still }: { still: boolean }) {
  return (
    <group>
      {WING_ANGLES.map((a, i) => {
        const cluster = WING_CLUSTERS[i];
        const color = CLUSTER_META[cluster].color;
        return (
          <group key={a}>
            <WindowRadiance angle={a} color={color} still={still} />
          </group>
        );
      })}
    </group>
  );
}
