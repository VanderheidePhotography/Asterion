import { useMemo } from 'react';
import * as THREE from 'three';

const VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
varying vec3 vDir;
uniform vec3 uZenith;
uniform vec3 uMid;
uniform vec3 uHorizon;
uniform float uStarDensity;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
}

void main() {
  float h = vDir.y; // -1 … 1
  vec3 col = mix(uHorizon, uMid, smoothstep(-0.05, 0.35, h));
  col = mix(col, uZenith, smoothstep(0.3, 0.95, h));

  // hand-scattered stars, brighter toward the zenith
  vec3 cell = floor(vDir * 140.0);
  float s = hash(cell);
  float star = step(1.0 - 0.004 * uStarDensity, s);
  float twinkle = 0.6 + 0.4 * hash(cell + 7.0);
  col += star * twinkle * smoothstep(0.05, 0.7, h);

  gl_FragColor = vec4(col, 1.0);
}
`;

interface DomeSkyProps {
  zenith?: string;
  mid?: string;
  horizon?: string;
  /** 0 = none, ~2 = a full night sky */
  stars?: number;
  radius?: number;
}

/** The celestial dome: a painted-gradient night sky with procedural stars. */
export function DomeSky({
  zenith = '#0c0a1e',
  mid = '#241b3f',
  horizon = '#7c5228',
  stars = 1,
  radius = 90,
}: DomeSkyProps) {
  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color(zenith) },
      uMid: { value: new THREE.Color(mid) },
      uHorizon: { value: new THREE.Color(horizon) },
      uStarDensity: { value: stars },
    }),
    [zenith, mid, horizon, stars],
  );

  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[radius, 48, 32]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
