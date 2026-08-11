import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { registerPickable, unregisterPickable } from './ManualPicker';
import { METALS } from '../../../data/alchemy';

/**
 * The alchemist's bench: a rack of seven round-bottom phials, one for each
 * planetary metal, each glowing with its metal's hue and topped by a floating
 * planetary glyph. Walk up, sit, and click a phial to hear its place in the
 * Great Work — the chosen phial rises and brightens. No overlay; the reading
 * arrives as the alchemist's dialogue bubble.
 */

/* a planetary glyph on a transparent sprite, baked once per metal */
const glyphCache = new Map<number, THREE.CanvasTexture>();
function glyphTex(i: number): THREE.CanvasTexture {
  const cached = glyphCache.get(i);
  if (cached) return cached;
  const m = METALS[i];
  const S = 128;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const x = c.getContext('2d')!;
  x.shadowColor = m.color;
  x.shadowBlur = 14;
  x.fillStyle = '#f5ecd6';
  x.font = `${Math.round(S * 0.62)}px "Segoe UI Symbol", "Arial Unicode MS", serif`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(m.glyph, S / 2, S / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  glyphCache.set(i, t);
  return t;
}

const SLOT_X = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9];

function Phial({
  metal,
  i,
  chosen,
  onPick,
  active,
}: {
  metal: (typeof METALS)[number];
  i: number;
  chosen: boolean;
  onPick: (i: number) => void;
  active: boolean;
}) {
  const grp = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const liquidMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: metal.color,
        roughness: 0.25,
        metalness: 0.5,
        emissive: new THREE.Color(metal.color),
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.92,
      }),
    [metal.color],
  );
  const glassMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#dfe6ea', roughness: 0.1, metalness: 0, transparent: true, opacity: 0.28 }),
    [],
  );
  const glyphMat = useMemo(() => new THREE.SpriteMaterial({ map: glyphTex(i), transparent: true, depthWrite: false }), [i]);
  useEffect(
    () => () => {
      liquidMat.dispose();
      glassMat.dispose();
      glyphMat.dispose();
    },
    [liquidMat, glassMat, glyphMat],
  );

  const lift = useRef(0);
  const hover = useRef(false);
  useEffect(() => {
    if (!active) return;
    const m = body.current;
    if (!m) return;
    // `station` keeps the hall behind the bench from answering clicks meant
    // for the metals (see PickAction)
    registerPickable(m, {
      onPick: () => onPick(i),
      onHover: (h) => (hover.current = h),
      maxDist: 6,
      station: true,
    });
    return () => unregisterPickable(m);
  }, [i, onPick, active]);

  useFrame((state, delta) => {
    const g = grp.current;
    if (!g) return;
    // hovering nudges the flask up; choosing it lifts it fully
    const targetLift = chosen ? 0.13 : hover.current ? 0.06 : 0;
    lift.current = THREE.MathUtils.damp(lift.current, targetLift, 9, delta);
    g.position.y = lift.current;
    liquidMat.emissiveIntensity = 0.25 + lift.current * 5;
    // the chosen phial's contents shimmer
    if (chosen) liquidMat.emissiveIntensity += Math.sin(state.clock.elapsedTime * 5) * 0.15;
  });

  return (
    <group ref={grp}>
      {/* round-bottom flask body — the pick target */}
      <mesh ref={body} position={[0, 0.94, 0]} material={liquidMat}>
        <sphereGeometry args={[0.1, 20, 16]} />
      </mesh>
      {/* glass shoulder + neck */}
      <mesh position={[0, 1.07, 0]} material={glassMat}>
        <cylinderGeometry args={[0.032, 0.075, 0.14, 12]} />
      </mesh>
      <mesh position={[0, 1.16, 0]} material={glassMat}>
        <cylinderGeometry args={[0.032, 0.032, 0.06, 12]} />
      </mesh>
      {/* cork */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.03, 0.026, 0.04, 10]} />
        <meshStandardMaterial color="#8a5a34" roughness={0.9} />
      </mesh>
      {/* floating planetary glyph */}
      <sprite material={glyphMat} position={[0, 1.4, 0]} scale={[0.17, 0.17, 0.17]} />
      {chosen && <pointLight position={[0, 1.0, 0]} color={metal.color} intensity={2.2} distance={0.8} decay={2} />}
    </group>
  );
}

export function AlchemyBench({
  table,
  selected,
  onPick,
  active,
}: {
  table: [number, number];
  selected: number | null;
  onPick: (i: number) => void;
  active: boolean;
}) {
  const cx = table[0];
  const cz = table[1] + 0.08;
  return (
    <group>
      {/* a slate slab the phials stand on */}
      <mesh position={[cx, 0.84, cz]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.1, 0.5]} />
        <meshStandardMaterial color="#2a2530" roughness={0.7} metalness={0.2} />
      </mesh>
      {METALS.map((m, i) => (
        <group key={m.name} position={[cx + SLOT_X[i], 0, cz]}>
          <Phial metal={m} i={i} chosen={selected === i} onPick={onPick} active={active} />
        </group>
      ))}
    </group>
  );
}
