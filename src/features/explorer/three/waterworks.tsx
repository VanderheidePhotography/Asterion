import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getGlowTexture } from './glowTexture';
import { mulberry32 } from '../../../domain/random';

/**
 * Stonework for the Hogwarts-courtyard feel: a running two-tier fountain and
 * carved stone guardians on plinths. Water is faked with a rippling pool disc
 * and looping droplet sprites — cheap, but it reads as alive.
 */

const STONE = '#9a9488';
const STONE_DARK = '#7c766a';

export function Fountain({ position, still = false }: { position: [number, number]; still?: boolean }) {
  const ripple = useRef<THREE.Mesh>(null);
  const drops = useRef<(THREE.Sprite | null)[]>([]);
  const seeds = useMemo(() => {
    const rng = mulberry32(position[0] * 100 + position[1]);
    return Array.from({ length: 10 }, () => ({ a: rng() * Math.PI * 2, r: 0.7 + rng() * 0.15, off: rng() }));
  }, [position]);

  useFrame((state) => {
    if (still) return;
    const t = state.clock.elapsedTime;
    if (ripple.current) {
      const k = (t * 0.5) % 1;
      ripple.current.scale.setScalar(0.4 + k * 1.5);
      (ripple.current.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - k);
    }
    // droplets fall from the upper bowl to the pool, on a loop
    drops.current.forEach((s, i) => {
      if (!s) return;
      const seed = seeds[i];
      const k = (t * 0.9 + seed.off) % 1;
      s.position.set(Math.cos(seed.a) * seed.r, 1.85 - k * 1.4, Math.sin(seed.a) * seed.r);
      (s.material as THREE.SpriteMaterial).opacity = 0.5 * Math.sin(Math.PI * k);
    });
  });

  return (
    <group position={[position[0], 0, position[1]]}>
      {/* lower basin */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[1.9, 2.05, 0.7, 32]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      {/* basin rim — laid flat (an unrotated torus stands upright and reads
          as a stone arch over the fountain) */}
      <mesh position={[0, 0.72, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.9, 0.16, 12, 40]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.85} />
      </mesh>
      {/* the pool of water + a rippling ring */}
      <mesh position={[0, 0.66, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.82, 40]} />
        <meshStandardMaterial color="#2f6486" roughness={0.12} metalness={0.25} transparent opacity={0.85} />
      </mesh>
      <mesh ref={ripple} position={[0, 0.7, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.55, 0.7, 32]} />
        <meshBasicMaterial color="#bfe0f0" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* central column + upper bowl */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.28, 0.42, 1.1, 16]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.85, 0.35, 0.42, 24]} />
        <meshStandardMaterial color={STONE} roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.9, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.78, 24]} />
        <meshStandardMaterial color="#2f6486" roughness={0.12} metalness={0.25} transparent opacity={0.85} />
      </mesh>
      {/* finial spout */}
      <mesh position={[0, 2.12, 0]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.8} />
      </mesh>
      {/* droplet sprites */}
      {seeds.map((_, i) => (
        <sprite
          key={i}
          ref={(s) => {
            drops.current[i] = s;
          }}
          scale={[0.12, 0.28, 1]}
        >
          <spriteMaterial map={getGlowTexture()} color="#cfeaf6" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
      {/* cool glow off the water */}
      <sprite position={[0, 0.9, 0]} scale={[4, 2.2, 1]}>
        <spriteMaterial map={getGlowTexture()} color="#7fb4d0" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

/** just the running water — a rippling pool + falling droplets — to lay over
 *  a real (static) fountain model so it reads as alive */
export function FountainWater({
  position,
  basinY = 1.0,
  basinR = 0.85,
  still = false,
}: {
  position: [number, number];
  basinY?: number;
  basinR?: number;
  still?: boolean;
}) {
  const ripple = useRef<THREE.Mesh>(null);
  const drops = useRef<(THREE.Sprite | null)[]>([]);
  const seeds = useMemo(() => {
    const rng = mulberry32(position[0] * 100 + position[1] + 9);
    return Array.from({ length: 10 }, () => ({ a: rng() * Math.PI * 2, r: basinR * (0.4 + rng() * 0.5), off: rng() }));
  }, [position, basinR]);
  useFrame((state) => {
    if (still) return;
    const t = state.clock.elapsedTime;
    if (ripple.current) {
      const k = (t * 0.5) % 1;
      ripple.current.scale.setScalar(0.4 + k * 1.6);
      (ripple.current.material as THREE.MeshBasicMaterial).opacity = 0.3 * (1 - k);
    }
    drops.current.forEach((s, i) => {
      if (!s) return;
      const seed = seeds[i];
      const k = (t * 0.9 + seed.off) % 1;
      s.position.set(Math.cos(seed.a) * seed.r, basinY + 1.0 - k * 1.0, Math.sin(seed.a) * seed.r);
      (s.material as THREE.SpriteMaterial).opacity = 0.5 * Math.sin(Math.PI * k);
    });
  });
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, basinY, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[basinR, 32]} />
        <meshStandardMaterial color="#2f6486" roughness={0.12} metalness={0.25} transparent opacity={0.85} />
      </mesh>
      <mesh ref={ripple} position={[0, basinY + 0.02, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.3, 0.42, 28]} />
        <meshBasicMaterial color="#bfe0f0" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {seeds.map((_, i) => (
        <sprite
          key={i}
          ref={(s) => {
            drops.current[i] = s;
          }}
          scale={[0.1, 0.24, 1]}
        >
          <spriteMaterial map={getGlowTexture()} color="#cfeaf6" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
      <sprite position={[0, basinY + 0.2, 0]} scale={[3.4, 2, 1]}>
        <spriteMaterial map={getGlowTexture()} color="#7fb4d0" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

/** a carved stone figure on a plinth — a still guardian */
export function StoneStatue({
  position,
  rotationY = 0,
  attribute = 'book',
}: {
  position: [number, number];
  rotationY?: number;
  attribute?: 'book' | 'staff' | 'orb';
}) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: STONE, roughness: 0.95 }), []);
  return (
    <group position={[position[0], 0, position[1]]} rotation-y={rotationY}>
      {/* plinth */}
      <mesh position={[0, 0.45, 0]} material={mat}>
        <boxGeometry args={[1.1, 0.9, 1.1]} />
      </mesh>
      <mesh position={[0, 0.92, 0]} material={mat}>
        <boxGeometry args={[1.25, 0.12, 1.25]} />
      </mesh>
      {/* robed body */}
      <mesh position={[0, 1.85, 0]} material={mat}>
        <coneGeometry args={[0.5, 1.9, 14]} />
      </mesh>
      {/* shoulders / cowl */}
      <mesh position={[0, 2.6, 0]} material={mat}>
        <sphereGeometry args={[0.34, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
      </mesh>
      {/* head */}
      <mesh position={[0, 2.78, 0.02]} material={mat}>
        <sphereGeometry args={[0.2, 16, 14]} />
      </mesh>
      {/* an arm holding the attribute */}
      <mesh position={[0.32, 2.05, 0.12]} rotation-z={0.5} material={mat}>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
      </mesh>
      {attribute === 'book' && (
        <mesh position={[0.42, 1.9, 0.28]} rotation-x={0.3} material={mat}>
          <boxGeometry args={[0.34, 0.1, 0.26]} />
        </mesh>
      )}
      {attribute === 'staff' && (
        <mesh position={[0.5, 1.9, 0.18]} material={mat}>
          <cylinderGeometry args={[0.045, 0.045, 2.6, 8]} />
        </mesh>
      )}
      {attribute === 'orb' && (
        <mesh position={[0.46, 2.02, 0.28]} material={mat}>
          <sphereGeometry args={[0.16, 14, 12]} />
        </mesh>
      )}
    </group>
  );
}
