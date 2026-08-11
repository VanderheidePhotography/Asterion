import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { registerPickable, unregisterPickable } from './ManualPicker';
import { ELEMENT_COLORS, ZODIAC } from '../../../data/astrology';

/**
 * The astrologers' zodiac wheel, laid physically on the sages' table. A brass
 * star-chart disc with twelve element-tinted houses and twelve glyph coins set
 * around the rim. Walk up, sit, and click a coin to choose your sun sign — the
 * chosen coin rises and gilds, a needle swings to it, and the astrologer reads
 * it aloud. No overlay — the reading happens in the room, as dialogue bubbles.
 */

const WHEEL_R = 0.82; // disc radius
const RING_R = 0.6; // radius the coins sit at
const COIN_R = 0.082;

/* ————— the star-chart disc texture, baked once on a canvas ————— */
let wheelTexCache: THREE.CanvasTexture | null = null;
function wheelTex(): THREE.CanvasTexture {
  if (wheelTexCache) return wheelTexCache;
  const S = 512;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const x = c.getContext('2d')!;
  const cx = S / 2;
  const cy = S / 2;
  const R = S / 2 - 6;

  // parchment-dark ground
  x.fillStyle = '#241b2e';
  x.beginPath();
  x.arc(cx, cy, R, 0, Math.PI * 2);
  x.fill();

  // twelve element-tinted houses
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2 - Math.PI / 12;
    const a1 = a0 + Math.PI / 6;
    x.beginPath();
    x.moveTo(cx, cy);
    x.arc(cx, cy, R * 0.9, a0, a1);
    x.closePath();
    x.fillStyle = ELEMENT_COLORS[ZODIAC[i].element];
    x.globalAlpha = 0.22;
    x.fill();
    x.globalAlpha = 1;
  }

  // gold rings
  x.strokeStyle = '#c9a648';
  x.lineWidth = 4;
  for (const rr of [R, R * 0.9, RING_R / WHEEL_R * R * 1.02, R * 0.34]) {
    x.beginPath();
    x.arc(cx, cy, rr, 0, Math.PI * 2);
    x.stroke();
  }

  // house-boundary spokes + degree ticks on the outer rim
  x.strokeStyle = 'rgba(201,166,72,0.55)';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2 - Math.PI / 12;
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * R * 0.34, cy + Math.sin(a) * R * 0.34);
    x.lineTo(cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9);
    x.stroke();
  }
  x.strokeStyle = 'rgba(201,166,72,0.45)';
  x.lineWidth = 1.5;
  for (let d = 0; d < 72; d++) {
    const a = (d / 72) * Math.PI * 2;
    const inner = d % 6 === 0 ? 0.86 : 0.9;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * R * inner, cy + Math.sin(a) * R * inner);
    x.lineTo(cx + Math.cos(a) * R * 0.96, cy + Math.sin(a) * R * 0.96);
    x.stroke();
  }

  // central sun rosette
  x.save();
  x.translate(cx, cy);
  x.fillStyle = '#e8c874';
  for (let i = 0; i < 12; i++) {
    x.beginPath();
    x.moveTo(0, -R * 0.3);
    x.lineTo(R * 0.05, 0);
    x.lineTo(0, R * 0.3);
    x.lineTo(-R * 0.05, 0);
    x.closePath();
    x.fill();
    x.rotate(Math.PI / 6);
  }
  x.fillStyle = '#241b2e';
  x.beginPath();
  x.arc(0, 0, R * 0.14, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = '#c9a648';
  x.lineWidth = 3;
  x.stroke();
  x.restore();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  wheelTexCache = t;
  return t;
}

/* ————— one glyph coin face, baked per sign ————— */
const coinTexCache = new Map<number, THREE.CanvasTexture>();
function coinTex(i: number): THREE.CanvasTexture {
  const cached = coinTexCache.get(i);
  if (cached) return cached;
  const sign = ZODIAC[i];
  const S = 128;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const x = c.getContext('2d')!;
  const r = S / 2;
  // brass coin ground
  const g = x.createRadialGradient(r, r * 0.7, 8, r, r, r);
  g.addColorStop(0, '#3a2f22');
  g.addColorStop(1, '#241b16');
  x.fillStyle = g;
  x.beginPath();
  x.arc(r, r, r - 3, 0, Math.PI * 2);
  x.fill();
  // element-tinted rim
  x.strokeStyle = ELEMENT_COLORS[sign.element];
  x.lineWidth = 8;
  x.beginPath();
  x.arc(r, r, r - 8, 0, Math.PI * 2);
  x.stroke();
  x.strokeStyle = '#c9a648';
  x.lineWidth = 3;
  x.beginPath();
  x.arc(r, r, r - 15, 0, Math.PI * 2);
  x.stroke();
  // the glyph
  x.fillStyle = '#f2e3bd';
  x.font = `${Math.round(S * 0.5)}px "Segoe UI Symbol", "Arial Unicode MS", serif`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(sign.glyph, r, r + 4);
  const t2 = new THREE.CanvasTexture(c);
  t2.colorSpace = THREE.SRGBColorSpace;
  t2.anisotropy = 8;
  coinTexCache.set(i, t2);
  return t2;
}

export function AstrologyWheel({
  table,
  selected,
  onPick,
  active,
}: {
  table: [number, number];
  /** index of the chosen sign, or null */
  selected: number | null;
  onPick: (i: number) => void;
  active: boolean;
}) {
  // the wheel sits centred on its round table, flat on the top
  const cx = table[0];
  const cz = table[1];
  const cy = 0.83;

  const discGeom = useMemo(() => new THREE.CircleGeometry(WHEEL_R, 64), []);
  const discMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: wheelTex(), roughness: 0.55, metalness: 0.2 }),
    [],
  );
  const coinGeom = useMemo(() => new THREE.CylinderGeometry(COIN_R, COIN_R, 0.02, 24), []);
  const rimMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8a6a45', roughness: 0.6, metalness: 0.3 }), []);
  const faceMats = useMemo(
    () => ZODIAC.map((_, i) => new THREE.MeshBasicMaterial({ map: coinTex(i), toneMapped: false })),
    [],
  );
  useEffect(
    () => () => {
      discGeom.dispose();
      discMat.dispose();
      coinGeom.dispose();
      rimMat.dispose();
      faceMats.forEach((m) => m.dispose());
    },
    [discGeom, discMat, coinGeom, rimMat, faceMats],
  );

  // each coin's flat position on the ring; sign 0 (Aries) at the top, clockwise
  const spots = useMemo(
    () =>
      ZODIAC.map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(a) * RING_R, z: cz + Math.sin(a) * RING_R, a };
      }),
    [cx, cz],
  );

  const coinGroups = useRef<(THREE.Group | null)[]>([]);
  const coinMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const lift = useRef<number[]>(ZODIAC.map(() => 0));
  const hoveredCoin = useRef<number | null>(null);
  const needle = useRef<THREE.Group | null>(null);

  // pickable only while a reading is active
  useEffect(() => {
    if (!active) return;
    const regd: THREE.Mesh[] = [];
    coinMeshes.current.forEach((m, i) => {
      if (m) {
        registerPickable(m, {
          onPick: () => onPick(i),
          onHover: (h) => {
            if (h) hoveredCoin.current = i;
            else if (hoveredCoin.current === i) hoveredCoin.current = null;
          },
          maxDist: 6,
          // the wheel is the only thing pickable while the visitor is at it
          station: true,
        });
        regd.push(m);
      }
    });
    return () => regd.forEach((m) => unregisterPickable(m));
  }, [active, onPick]);

  useFrame((_, delta) => {
    for (let i = 0; i < 12; i++) {
      const g = coinGroups.current[i];
      if (!g) continue;
      const target = selected === i ? 0.11 : hoveredCoin.current === i ? 0.05 : 0;
      lift.current[i] = THREE.MathUtils.damp(lift.current[i], target, 9, delta);
      g.position.y = cy + 0.012 + lift.current[i];
      const s = 1 + lift.current[i] * 1.4;
      g.scale.setScalar(s);
    }
    // swing the needle to the chosen sign
    if (needle.current && selected !== null) {
      const targetAngle = -spots[selected].a - Math.PI / 2;
      needle.current.rotation.y = THREE.MathUtils.damp(
        needle.current.rotation.y,
        targetAngle,
        7,
        delta,
      );
    }
  });

  return (
    <group>
      {/* the star-chart disc, lying flat */}
      <mesh
        geometry={discGeom}
        material={discMat}
        position={[cx, cy, cz]}
        rotation-x={-Math.PI / 2}
      />
      {/* gilt pointer that swings to the chosen house */}
      <group ref={needle} position={[cx, cy + 0.006, cz]}>
        <mesh position={[0, 0, -RING_R * 0.5]}>
          <boxGeometry args={[0.02, 0.008, RING_R]} />
          <meshStandardMaterial color="#e8c874" metalness={0.7} roughness={0.3} emissive="#8a6a2a" emissiveIntensity={selected === null ? 0 : 0.4} />
        </mesh>
      </group>
      {/* the twelve glyph coins */}
      {ZODIAC.map((sign, i) => {
        const chosen = selected === i;
        return (
          <group
            key={sign.name}
            ref={(el) => {
              coinGroups.current[i] = el;
            }}
            position={[spots[i].x, cy + 0.012, spots[i].z]}
          >
            <mesh
              ref={(el) => {
                coinMeshes.current[i] = el;
              }}
              geometry={coinGeom}
              material={[rimMat, faceMats[i], rimMat]}
            />
            {chosen && (
              <pointLight position={[0, 0.14, 0]} color="#ffd98a" intensity={2.4} distance={0.9} decay={2} />
            )}
          </group>
        );
      })}
    </group>
  );
}
