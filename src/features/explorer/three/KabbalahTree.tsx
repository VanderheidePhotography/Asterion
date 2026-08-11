import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { registerPickable, unregisterPickable } from './ManualPicker';
import { getGlowTexture } from './glowTexture';
import { TextSprite } from './TextSprite';
import { SEPHIROT, TREE_PATHS } from '../../../data/kabbalah';

/**
 * The kabbalist's study tablet: an arch-topped indigo stone standing on the
 * table, the Tree of Life inlaid in gold across its face. It rests there as
 * quiet dressing until the visitor sits — then the ten sephirot wake, and
 * clicking one has the kabbalist read what pours through it.
 */

const TABLET_W = 1.14;
const TABLET_H = 1.52;
const TABLET_BASE = 0.84; // the table top
const TREE_W = 0.36; // half-width of the node columns
const TREE_Y0 = TABLET_BASE + 0.2;
const TREE_H = 1.08;

const nodeLocal = (i: number): [number, number] => [
  SEPHIROT[i].x * TREE_W,
  TREE_Y0 + SEPHIROT[i].y * TREE_H,
];

export function KabbalahTablet({
  table,
  selected,
  onPick,
  active,
  still,
}: {
  table: [number, number];
  selected: number | null;
  onPick: (i: number) => void;
  active: boolean;
  still: boolean;
}) {
  const pathGeom = useMemo(() => {
    const pts: number[] = [];
    for (const [a, b] of TREE_PATHS) {
      const [ax, ay] = nodeLocal(a);
      const [bx, by] = nodeLocal(b);
      pts.push(ax, ay - TABLET_BASE, 0.055, bx, by - TABLET_BASE, 0.055);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  const pathMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: '#c9a648', transparent: true, opacity: 0.9 }),
    [],
  );
  const discGeom = useMemo(() => new THREE.CircleGeometry(0.052, 20), []);
  const discMats = useMemo(
    () => SEPHIROT.map((s) => new THREE.MeshBasicMaterial({ color: s.color, toneMapped: false })),
    [],
  );
  const slabMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#241d33', roughness: 0.7 }),
    [],
  );
  const trimMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#8a6a2f', metalness: 0.6, roughness: 0.4 }),
    [],
  );
  useEffect(
    () => () => {
      pathGeom.dispose();
      pathMat.dispose();
      discGeom.dispose();
      discMats.forEach((m) => m.dispose());
      slabMat.dispose();
      trimMat.dispose();
    },
    [pathGeom, pathMat, discGeom, discMats, slabMat, trimMat],
  );

  const discs = useRef<(THREE.Mesh | null)[]>([]);
  const hoveredSeph = useRef<number | null>(null);
  const glow = useRef<THREE.Sprite>(null);

  useEffect(() => {
    if (!active) return;
    const regd: THREE.Mesh[] = [];
    discs.current.forEach((m, i) => {
      if (m) {
        registerPickable(m, {
          onPick: () => onPick(i),
          onHover: (h) => {
            if (h) hoveredSeph.current = i;
            else if (hoveredSeph.current === i) hoveredSeph.current = null;
          },
          maxDist: 6,
          // the tree is the only thing pickable while the visitor is at it
          station: true,
        });
        regd.push(m);
      }
    });
    return () => regd.forEach((m) => unregisterPickable(m));
  }, [active, onPick]);

  useFrame((state, delta) => {
    for (let i = 0; i < SEPHIROT.length; i++) {
      const m = discs.current[i];
      if (!m) continue;
      const target = selected === i ? 1.6 : hoveredSeph.current === i ? 1.25 : 1;
      m.scale.setScalar(THREE.MathUtils.damp(m.scale.x, target, 8, delta));
    }
    if (glow.current) {
      const mat = glow.current.material as THREE.SpriteMaterial;
      if (selected === null) mat.opacity = 0;
      else {
        const [lx, ly] = nodeLocal(selected);
        glow.current.position.set(lx, ly - TABLET_BASE, 0.045);
        mat.color.set(SEPHIROT[selected].color);
        mat.opacity = 0.5 + (still ? 0 : Math.sin(state.clock.elapsedTime * 2.4) * 0.15);
      }
    }
  });

  // the tablet faces the empty seat on the table's +z side. Its origin sits on
  // the table top, so scaling shrinks it upward and keeps it standing on the
  // surface — at full size it towered over the reader and filled the whole view.
  return (
    <group position={[table[0], TABLET_BASE, table[1] - 0.12]} scale={0.68}>
      {/* foot, slab, and the arched crown */}
      <mesh position={[0, 0.035, 0]} material={trimMat}>
        <boxGeometry args={[TABLET_W + 0.18, 0.07, 0.3]} />
      </mesh>
      <mesh position={[0, TABLET_H / 2, 0]} material={slabMat}>
        <boxGeometry args={[TABLET_W, TABLET_H, 0.09]} />
      </mesh>
      {/* gilt cap */}
      <mesh position={[0, TABLET_H + 0.035, 0]} material={trimMat}>
        <boxGeometry args={[TABLET_W + 0.14, 0.07, 0.2]} />
      </mesh>
      {/* gilt border on the face */}
      <mesh position={[0, TABLET_H / 2, -0.005]} material={trimMat}>
        <boxGeometry args={[TABLET_W + 0.06, TABLET_H + 0.02, 0.08]} />
      </mesh>
      {/* the 22 paths */}
      <lineSegments geometry={pathGeom} material={pathMat} />
      {/* the ten sephirot */}
      {SEPHIROT.map((s, i) => {
        const [lx, ly] = nodeLocal(i);
        return (
          <group key={s.name} position={[lx, ly - TABLET_BASE, 0.06]}>
            <mesh
              ref={(el) => {
                discs.current[i] = el;
              }}
              geometry={discGeom}
              material={discMats[i]}
            />
            {active && (
              <TextSprite position={[0, -0.095, 0.02]} height={0.05} color="#e8dcc0" font="ui" weight={500} maxWidthPx={400}>
                {s.name}
              </TextSprite>
            )}
          </group>
        );
      })}
      {/* halo behind the chosen sephirah */}
      <sprite ref={glow} scale={[0.34, 0.34, 1]} position={[0, TREE_Y0 - TABLET_BASE, 0.045]}>
        <spriteMaterial map={getGlowTexture()} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}
