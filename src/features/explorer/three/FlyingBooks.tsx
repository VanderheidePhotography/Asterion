import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getGlowTexture } from './glowTexture';
import { leather } from './textures';
import { wingPoint, WING_ANGLES } from './layout';

/**
 * Enchanted books on their nightly errands. Three tomes glide through the
 * hall on slow closed curves — one circles the rotunda, one dives down a wing
 * and back, one loops the great globe — covers beating like unhurried wings.
 * Six meshes and a glow apiece; the whole flock costs less than one shelf.
 */

interface BookSpec {
  points: THREE.Vector3[];
  color: string;
  glow: string;
  /** seconds per full circuit */
  period: number;
  phase: number;
  flapHz: number;
  scale: number;
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function buildSpecs(): BookSpec[] {
  // the wing dive follows a real wing's centreline out and back
  const a = WING_ANGLES[1];
  const [x1, z1] = wingPoint(a, 22, -2);
  const [x2, z2] = wingPoint(a, 40, 0);
  const [x3, z3] = wingPoint(a, 54, 1.6);
  const [x4, z4] = wingPoint(a, 38, 2);
  const [x5, z5] = wingPoint(a, 20, 2.4);
  return [
    {
      // the grand rotunda circuit, weaving in height between the chandeliers
      points: [
        V(12.5, 5.2, 0), V(9.2, 6.4, 9.2), V(0, 4.8, 13), V(-9.2, 6.8, 9.2),
        V(-12.5, 5.4, 0), V(-9.2, 4.6, -9.2), V(0, 6.6, -13), V(9.2, 5.0, -9.2),
      ],
      color: '#7a5ad0',
      glow: '#b9a0ff',
      period: 85,
      phase: 0.15,
      flapHz: 1.9,
      scale: 1,
    },
    {
      // out along a wing over the readers' heads, a turn at the far gallery,
      // and home again through the mouth
      points: [
        V(4, 5.4, -4), V(x1, 6.4, z1), V(x2, 8.2, z2), V(x3, 7.0, z3),
        V(x4, 8.6, z4), V(x5, 6.2, z5), V(-2, 5.0, 3),
      ],
      color: '#a03c3c',
      glow: '#ff9a80',
      period: 110,
      phase: 0.55,
      flapHz: 2.3,
      scale: 0.92,
    },
    {
      // a small impatient loop above the globe, under the orrery
      points: [V(5.4, 4.6, 0), V(0, 5.8, 5.4), V(-5.4, 5.0, 0), V(0, 6.4, -5.4)],
      color: '#8a6a2f',
      glow: '#ffd98a',
      period: 46,
      phase: 0.8,
      flapHz: 2.7,
      scale: 0.8,
    },
  ];
}

function FlyingBook({ spec, still }: { spec: BookSpec; still: boolean }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(spec.points, true, 'catmullrom', 0.6),
    [spec.points],
  );
  const group = useRef<THREE.Group>(null);
  const coverL = useRef<THREE.Group>(null);
  const coverR = useRef<THREE.Group>(null);
  const scratch = useMemo(
    () => ({ pos: new THREE.Vector3(), tan: new THREE.Vector3(), tan2: new THREE.Vector3(), look: new THREE.Vector3() }),
    [],
  );
  const coverMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: leather(),
        color: spec.color,
        emissive: new THREE.Color(spec.glow),
        emissiveIntensity: 0.22,
        roughness: 0.6,
      }),
    [spec.color, spec.glow],
  );
  const pageMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#efe6cf', roughness: 0.9 }),
    [],
  );
  useEffect(
    () => () => {
      coverMat.dispose();
      pageMat.dispose();
    },
    [coverMat, pageMat],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const { pos, tan, tan2, look } = scratch;
    const u = still ? spec.phase : (t / spec.period + spec.phase) % 1;
    curve.getPointAt(u, pos);
    curve.getTangentAt(u, tan);
    const flap = still ? 0 : Math.sin(t * spec.flapHz * Math.PI * 2 + spec.phase * 9);
    g.position.copy(pos);
    g.position.y += still ? 0 : flap * 0.07;
    look.copy(pos).add(tan);
    g.lookAt(look);
    // bank into the turn
    curve.getTangentAt((u + 0.015) % 1, tan2);
    const bank = THREE.MathUtils.clamp((tan.x * tan2.z - tan.z * tan2.x) * 30, -0.55, 0.55);
    g.rotateZ(bank);
    // wings: covers beat around the spine (the flight axis)
    const spread = still ? 0.12 : 0.55 + flap * 0.48;
    if (coverL.current) coverL.current.rotation.z = spread;
    if (coverR.current) coverR.current.rotation.z = -spread;
  });

  return (
    <group ref={group} scale={spec.scale}>
      {/* spine, nose to the wind */}
      <mesh material={coverMat}>
        <boxGeometry args={[0.055, 0.05, 0.56]} />
      </mesh>
      <group ref={coverL}>
        <mesh position={[-0.21, 0, 0]} material={coverMat}>
          <boxGeometry args={[0.42, 0.018, 0.56]} />
        </mesh>
        <mesh position={[-0.19, 0.012, 0]} material={pageMat}>
          <boxGeometry args={[0.36, 0.008, 0.5]} />
        </mesh>
      </group>
      <group ref={coverR}>
        <mesh position={[0.21, 0, 0]} material={coverMat}>
          <boxGeometry args={[0.42, 0.018, 0.56]} />
        </mesh>
        <mesh position={[0.19, 0.012, 0]} material={pageMat}>
          <boxGeometry args={[0.36, 0.008, 0.5]} />
        </mesh>
      </group>
      <sprite position={[0, -0.12, 0]} scale={[0.9, 0.9, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color={spec.glow}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

export function FlyingBooks({ still }: { still: boolean }) {
  const specs = useMemo(buildSpecs, []);
  return (
    <group>
      {specs.map((s, i) => (
        <FlyingBook key={i} spec={s} still={still} />
      ))}
    </group>
  );
}
