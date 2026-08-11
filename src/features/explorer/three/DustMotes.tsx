import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '../../../domain/random';

const VERT = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uDrift;
uniform float uSize;
varying float vSeed;
varying float vDepth;
void main() {
  vSeed = aSeed;
  vec3 p = position;
  p.y += sin(uTime * 0.12 + aSeed * 40.0) * 0.6 * uDrift;
  p.x += cos(uTime * 0.09 + aSeed * 55.0) * 0.5 * uDrift;
  p.z += sin(uTime * 0.07 + aSeed * 23.0) * 0.5 * uDrift;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = -mv.z;
  // The cap matters more than the scale. Dust is dust because it is at the
  // limit of resolution — the moment a mote covers more than a pixel or two it
  // stops reading as a particle in the air and starts reading as snow.
  gl_PointSize = min((1.6 + aSeed * 2.2) * uSize * (52.0 / max(vDepth, 0.001)), 4.5 * uSize);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vSeed;
varying float vDepth;
void main() {
  float d = length(gl_PointCoord - 0.5);
  // motes right at the lens dissolve instead of flaring
  float nearFade = smoothstep(1.2, 7.0, vDepth);
  float a = smoothstep(0.5, 0.05, d) * (0.16 + vSeed * 0.2) * nearFade * uOpacity;
  gl_FragColor = vec4(uColor, a);
}
`;

interface DustMotesProps {
  count?: number;
  radius?: number;
  height?: number;
  color?: string;
  /** multiplier on mote size. Below 1 for air, at 1 for anything showier. */
  size?: number;
  /** multiplier on mote alpha */
  opacity?: number;
  /** freeze drift for reduced motion */
  still?: boolean;
}

/** GPU dust: one draw call of softly drifting motes that catch the light. */
export function DustMotes({
  count = 650,
  radius = 38,
  height = 15,
  color = '#ffd9a0',
  size = 1,
  opacity = 1,
  still = false,
}: DustMotesProps) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const rng = mulberry32(1234);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2;
      const r = radius * Math.sqrt(rng());
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = rng() * height + 0.4;
      positions[i * 3 + 2] = Math.sin(a) * r;
      seeds[i] = rng();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [count, radius, height]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // uDrift and uTime are driven per-frame below, so the memo depends only on color
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDrift: { value: 1 },
      uColor: { value: new THREE.Color(color) },
      uSize: { value: size },
      uOpacity: { value: opacity },
    }),
    [color, size, opacity],
  );

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (material.current) material.current.uniforms.uDrift.value = still ? 0 : 1;
    // the whole field leans very slightly toward the cursor
    if (group.current && !still) {
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, state.pointer.x * 0.9, 0.02);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, state.pointer.y * 0.4, 0.02);
    }
  });

  return (
    <points ref={group} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
