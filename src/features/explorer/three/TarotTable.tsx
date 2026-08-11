import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { registerPickable, unregisterPickable } from './ManualPicker';
import { cardImage, type TarotCard } from '../../../data/tarot';

/**
 * The tarot spread laid physically on the wizards' table. Three standing
 * cards, each a real Rider-Waite-Smith scan, face-down until you click to
 * turn it. No overlay — the reading happens in the room; the talk arrives
 * as dialogue bubbles from the players.
 */

const texCache = new Map<string, THREE.Texture>();
function frontTex(path: string): THREE.Texture {
  let t = texCache.get(path);
  if (!t) {
    t = new THREE.TextureLoader().load(path);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    texCache.set(path, t);
  }
  return t;
}

let backTexCache: THREE.CanvasTexture | null = null;
function backTex(): THREE.CanvasTexture {
  if (backTexCache) return backTexCache;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 436;
  const x = c.getContext('2d')!;
  x.fillStyle = '#2a2038';
  x.fillRect(0, 0, 256, 436);
  x.strokeStyle = '#c9a648';
  x.lineWidth = 10;
  x.strokeRect(14, 14, 228, 408);
  x.lineWidth = 3;
  x.strokeRect(26, 26, 204, 384);
  // a lattice of little diamonds
  x.fillStyle = 'rgba(201,166,72,0.35)';
  for (let iy = 0; iy < 9; iy++)
    for (let ix = 0; ix < 5; ix++) {
      const px = 52 + ix * 38;
      const py = 60 + iy * 38;
      x.beginPath();
      x.moveTo(px, py - 7);
      x.lineTo(px + 7, py);
      x.lineTo(px, py + 7);
      x.lineTo(px - 7, py);
      x.closePath();
      x.fill();
    }
  // central sunburst star
  x.translate(128, 218);
  x.fillStyle = '#e8c874';
  for (let i = 0; i < 8; i++) {
    x.beginPath();
    x.moveTo(0, -46);
    x.lineTo(9, 0);
    x.lineTo(0, 46);
    x.lineTo(-9, 0);
    x.closePath();
    x.fill();
    x.rotate(Math.PI / 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  backTexCache = t;
  return t;
}

const CARD_W = 0.34;
const CARD_H = 0.56;
const CARD_D = 0.014;
const SLOT_X = [-0.44, 0, 0.44];

export function TarotSpread({
  table,
  cards,
  revealed,
  onFlip,
  active,
}: {
  table: [number, number];
  cards: TarotCard[];
  revealed: boolean[];
  onFlip: (i: number) => void;
  active: boolean;
}) {
  const geom = useMemo(() => new THREE.BoxGeometry(CARD_W, CARD_H, CARD_D), []);
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#efe6cf', roughness: 0.85 }), []);
  const back = useMemo(() => new THREE.MeshBasicMaterial({ map: backTex(), toneMapped: false }), []);
  const fronts = useMemo(
    () => cards.map((c) => new THREE.MeshBasicMaterial({ map: frontTex(cardImage(c)), toneMapped: false })),
    [cards],
  );
  useEffect(() => () => fronts.forEach((m) => m.dispose()), [fronts]);
  useEffect(
    () => () => {
      geom.dispose();
      edgeMat.dispose();
      back.dispose();
    },
    [geom, edgeMat, back],
  );

  const groups = useRef<(THREE.Group | null)[]>([]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const dealT = useRef([0, 0, 0]);
  const liftT = useRef([0, 0, 0]);
  const hovered = useRef<number | null>(null);

  // pickable only while the reading is active
  useEffect(() => {
    if (!active) return;
    const regd: THREE.Mesh[] = [];
    meshes.current.forEach((m, i) => {
      if (m) {
        registerPickable(m, {
          onPick: () => onFlip(i),
          onHover: (h) => {
            if (h) hovered.current = i;
            else if (hovered.current === i) hovered.current = null;
          },
          maxDist: 6,
          // the cards are the only thing pickable while the visitor is seated
          station: true,
        });
        regd.push(m);
      }
    });
    return () => regd.forEach((m) => unregisterPickable(m));
  }, [active, onFlip, cards]);

  useFrame((_, delta) => {
    for (let i = 0; i < 3; i++) {
      const g = groups.current[i];
      if (!g) continue;
      // the cards lie flat on the table; a flip about their width axis turns
      // them face-up (−90°) or face-down (+90°) — a real spread being dealt
      const target = revealed[i] ? -Math.PI / 2 : Math.PI / 2;
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, target, 8, delta);
      // the spread always lies on the table; it just becomes clickable once seated
      dealT.current[i] = THREE.MathUtils.damp(dealT.current[i], 1, 6, delta);
      g.scale.setScalar(dealT.current[i]);
      // a small lift off the baize when hovered, inviting the turn
      const lift = active && hovered.current === i && !revealed[i] ? 1 : 0;
      liftT.current[i] = THREE.MathUtils.damp(liftT.current[i], lift, 10, delta);
      // while mid-turn the card stands on edge; raise it so its lower half never
      // sinks through the tabletop, settling flat again once face-up/down
      const flipLift = Math.max(0, Math.cos(g.rotation.x)) * 0.34;
      g.position.y = 0.845 + liftT.current[i] * 0.1 + flipLift;
    }
  });

  return (
    <group>
      {cards.map((c, i) => {
        const wx = table[0] + SLOT_X[i];
        const wz = table[1];
        return (
          <group
            key={`${c.num}-${i}`}
            ref={(el) => {
              groups.current[i] = el;
            }}
            position={[wx, 0.845, wz]}
            rotation-x={Math.PI / 2}
            scale={0.0001}
          >
            <mesh
              ref={(el) => {
                meshes.current[i] = el;
              }}
              geometry={geom}
              material={[edgeMat, edgeMat, edgeMat, edgeMat, fronts[i], back]}
            />
          </group>
        );
      })}
    </group>
  );
}
