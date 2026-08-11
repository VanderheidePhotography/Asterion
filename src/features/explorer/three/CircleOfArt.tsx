import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { registerPickable, tableReach, unregisterPickable } from './ManualPicker';
import { getGlowTexture } from './glowTexture';
import { studPlate } from './studPlate';
import {
  PLATE_S,
  SERIF,
  arcEngrave,
  cartouche,
  engrave,
  plate,
  ruleCircle,
  seeded,
  square,
} from './plateArt';
import { DIVINE_NAMES, EAST, QUARTERS, TRIANGLE_NAMES } from '../../../data/goetia';

/**
 * CIRCVLVS ARTIS — the table as the circle it already is.
 *
 * The chart is the working floor: three ruled rings of divine names with the
 * pentagram and the hexagram of Solomon inside them, the four archangels at the
 * quarters, and — set OUTSIDE the circle, two feet clear of it, to the east —
 * the Triangle of Art with a black mirror in its middle. Standing on the table
 * are the instruments the Key of Solomon requires the operator to make: the
 * brazen vessel, the censer, and the sword.
 *
 * The geometry is the argument. The operator's boundary and the place of
 * appearance are two separate figures with a deliberate gap between them, and
 * everything about the drawing is arranged to keep them apart. Nothing here is
 * decorative: the names are the ten sephirot as the Golden Dawn regularised
 * them, the triangle carries the three names the manuscripts letter on it, and
 * the mirror is where a scryer would actually have looked.
 */

/** the circle's outer ruled edge, as a fraction of the plate */
const CIRCLE_R = 0.6;
/** the triangle's centre, out beyond the circle to the east */
const TRI_R = 0.81;
const TRI_SIDE = 0.3;

function circlePlate(rim: number): THREE.CanvasTexture {
  return plate('circulus', `sheet-${rim.toFixed(2)}`, () => {
    const S = PLATE_S;
    const [c, x] = square(S);
    const C = S / 2;
    const rng = seeded(1640);

    /* ————— the floor: flagged stone, worn, chalked on ————— */
    x.fillStyle = '#1d1a18';
    x.fillRect(0, 0, S, S);
    {
      const g = x.createRadialGradient(C, C, 0, C, C, C);
      g.addColorStop(0, '#3a3430');
      g.addColorStop(0.6, '#2a2523');
      g.addColorStop(1, '#141210');
      x.fillStyle = g;
      x.fillRect(0, 0, S, S);
    }
    // the flags, and the mortar between them
    const flag = S / 11;
    x.save();
    x.strokeStyle = 'rgba(10,9,8,0.85)';
    x.lineWidth = 5;
    for (let i = 0; i <= 11; i++) {
      x.beginPath();
      x.moveTo(i * flag, 0);
      x.lineTo(i * flag, S);
      x.moveTo(0, i * flag);
      x.lineTo(S, i * flag);
      x.stroke();
    }
    // each flag lit a little differently, so the floor is not a grid of one tone
    for (let i = 0; i < 11; i++)
      for (let j = 0; j < 11; j++) {
        x.globalAlpha = 0.05 + rng() * 0.09;
        x.fillStyle = rng() < 0.5 ? '#6a625a' : '#0d0b0a';
        x.fillRect(i * flag + 3, j * flag + 3, flag - 6, flag - 6);
      }
    x.restore();
    // the grain of the stone
    x.save();
    for (let i = 0; i < 26000; i++) {
      const px = rng() * S;
      const py = rng() * S;
      x.globalAlpha = 0.02 + rng() * 0.06;
      x.fillStyle = rng() < 0.5 ? '#847a70' : '#100e0c';
      x.fillRect(px, py, 1.8, 1.8);
    }
    x.restore();
    x.globalAlpha = 1;

    /** everything from here is CHALK: bright, slightly ragged, sitting on top */
    const chalk = (fn: () => void, alpha = 0.92, colour = '#f0e8d4') => {
      x.save();
      x.strokeStyle = colour;
      x.fillStyle = colour;
      x.globalAlpha = alpha;
      x.lineCap = 'round';
      fn();
      x.restore();
    };

    const R = C * CIRCLE_R;
    /* ————— the three rings ————— */
    chalk(() => {
      for (const [r, w] of [
        [R, 7],
        [R * 0.9, 5],
        [R * 0.74, 5],
        [R * 0.64, 7],
      ] as [number, number][]) {
        x.lineWidth = w;
        x.beginPath();
        x.arc(C, C, r, 0, Math.PI * 2);
        x.stroke();
      }
    });

    /* ————— the ten divine names, in the outer band, with crosses between ————— */
    DIVINE_NAMES.forEach((n, i) => {
      const a = (i / DIVINE_NAMES.length) * Math.PI * 2 - Math.PI / 2;
      const mid = R * 0.95;
      /* Names on the NEAR half of the plate are lettered the other way up.
         Set every name the same way round the ring and the ones on the near
         side stand on their heads to the only person who can read them, which
         looks like a rendering fault rather than like a chalked floor. This
         plate never turns, so the choice can be made once and stay right;
         the volvelles next door deliberately do not do this, because a ring
         that rotates would have its letters flipping as it went. */
      const near = Math.sin(a) > 0;
      arcEngrave(x, C, n.latin, mid, a, 32, '#0d0b08', '#f4ecd8', 0.95, near);
      arcEngrave(x, C, n.hebrew, R * 0.815, a, 44, '#0d0b08', '#e8dcc0', 0.9, near);
      arcEngrave(x, C, n.gloss.toUpperCase(), R * 0.69, a, 20, '#0d0b08', '#b8ac94', 0.62, near);
      // the cross that closes each name off from the next
      const b = ((i + 0.5) / DIVINE_NAMES.length) * Math.PI * 2 - Math.PI / 2;
      chalk(() => {
        x.lineWidth = 5;
        const px = C + Math.cos(b) * mid;
        const py = C + Math.sin(b) * mid;
        x.beginPath();
        x.moveTo(px - Math.cos(b) * 22, py - Math.sin(b) * 22);
        x.lineTo(px + Math.cos(b) * 22, py + Math.sin(b) * 22);
        x.moveTo(px + Math.sin(b) * 16, py - Math.cos(b) * 16);
        x.lineTo(px - Math.sin(b) * 16, py + Math.cos(b) * 16);
        x.stroke();
      });
    });

    /* ————— the hexagram of Solomon, and the pentagram inside it ————— */
    const inner = R * 0.6;
    chalk(() => {
      x.lineWidth = 6;
      for (const flip of [0, Math.PI]) {
        x.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI / 2 + flip + (i / 3) * Math.PI * 2;
          const px = C + Math.cos(a) * inner;
          const py = C + Math.sin(a) * inner;
          if (i === 0) x.moveTo(px, py);
          else x.lineTo(px, py);
        }
        x.closePath();
        x.stroke();
      }
      x.lineWidth = 8;
      x.beginPath();
      for (let i = 0; i <= 5; i++) {
        const a = -Math.PI / 2 + ((i * 2) / 5) * Math.PI * 2;
        const px = C + Math.cos(a) * inner * 0.62;
        const py = C + Math.sin(a) * inner * 0.62;
        if (i === 0) x.moveTo(px, py);
        else x.lineTo(px, py);
      }
      x.closePath();
      x.stroke();
      x.lineWidth = 4;
      x.beginPath();
      x.arc(C, C, inner * 0.66, 0, Math.PI * 2);
      x.stroke();
    });
    // the operator's place, named at the middle
    engrave(x, 'HIC STAT MAGVS', C, C + inner * 0.14, 30, { light: '#f0e8d4', alpha: 0.75 });
    engrave(x, 'the operator stands here', C, C + inner * 0.14 + 40, 21, {
      light: '#b8ac94',
      alpha: 0.6,
    });

    /* ————— the four archangels at the quarters ————— */
    for (const q of QUARTERS) {
      const px = C + Math.cos(q.bearing) * R * 0.42;
      const py = C + Math.sin(q.bearing) * R * 0.42;
      x.save();
      x.translate(px, py);
      x.rotate(q.bearing + Math.PI / 2);
      engrave(x, q.hebrew, 0, -30, 46, { light: q.colour, alpha: 0.95 });
      engrave(x, q.name, 0, 20, 30, { light: q.colour, alpha: 0.9 });
      engrave(x, `${q.dir} · ${q.element.toUpperCase()}`, 0, 56, 20, {
        light: '#b8ac94',
        alpha: 0.66,
      });
      x.restore();
    }

    /* ————— the Triangle of Art, outside the circle to the east ————— */
    {
      const tcx = C + Math.cos(EAST) * C * TRI_R;
      const tcy = C + Math.sin(EAST) * C * TRI_R;
      const side = C * TRI_SIDE;
      // an equilateral triangle with one vertex pointing away from the circle
      const verts: [number, number][] = [0, 1, 2].map((i) => {
        const a = EAST + (i / 3) * Math.PI * 2;
        return [tcx + Math.cos(a) * side, tcy + Math.sin(a) * side];
      });
      chalk(() => {
        x.lineWidth = 8;
        x.beginPath();
        verts.forEach(([px, py], i) => (i === 0 ? x.moveTo(px, py) : x.lineTo(px, py)));
        x.closePath();
        x.stroke();
        x.lineWidth = 4;
        x.beginPath();
        x.arc(tcx, tcy, side * 0.62, 0, Math.PI * 2);
        x.stroke();
      });
      // the three names, one along each side
      TRIANGLE_NAMES.forEach((name, i) => {
        const [x0, y0] = verts[i];
        const [x1, y1] = verts[(i + 1) % 3];
        const mx = (x0 + x1) / 2;
        const my = (y0 + y1) / 2;
        let ang = Math.atan2(y1 - y0, x1 - x0);
        // never letter a side upside down: flip the run rather than the reader
        let flipped = false;
        if (ang > Math.PI / 2 || ang < -Math.PI / 2) {
          ang += Math.PI;
          flipped = true;
        }
        x.save();
        x.translate(mx, my);
        x.rotate(ang);
        engrave(x, name, 0, flipped ? 34 : -34, 30, { light: '#f4ecd8', alpha: 0.92 });
        x.restore();
      });
      engrave(x, 'TRIANGVLVM ARTIS', tcx, tcy + side * 1.32, 26, {
        light: '#c8bca4',
        alpha: 0.72,
      });
    }

    /* ————— the instruments' places, marked on the floor ————— */
    for (const [bearing, label] of [
      [Math.PI * 0.78, 'VAS ÆNEVM'],
      [Math.PI * 1.22, 'THVRIBVLVM'],
      [Math.PI * 1.5, 'GLADIVS'],
    ] as [number, string][]) {
      const px = C + Math.cos(bearing) * R * 0.36;
      const py = C + Math.sin(bearing) * R * 0.36;
      chalk(
        () => {
          x.lineWidth = 3;
          x.setLineDash([12, 10]);
          x.beginPath();
          x.arc(px, py, 62, 0, Math.PI * 2);
          x.stroke();
        },
        0.5,
      );
      engrave(x, label, px, py + 86, 21, { light: '#b8ac94', alpha: 0.6 });
    }

    ruleCircle(x, C, C * 0.985, '#6a6058', 0.5, 4);
    cartouche(
      x,
      C + Math.cos(-Math.PI * 0.72) * C * 0.72,
      C + Math.sin(-Math.PI * 0.72) * C * 0.72,
      C * 0.5,
      C * 0.22,
      [
        { text: 'CIRCVLVS ARTIS', size: 40 },
        { text: 'LEMEGETON · c. MDCXL', size: 22, gap: 1.7 },
        { text: 'and the Clavicula Salomonis', size: 20, gap: 1.4 },
        { text: 'A HISTORICAL DIAGRAM', size: 18, gap: 1.6 },
      ],
      { ground: 'rgba(8,7,6,0.72)', rule: '#8a7f6c', ink: '#e8dcc0' },
    );
    x.font = `20px ${SERIF}`;
    return c;
  });
}

export function CircleOfArt({
  still = false,
  selected = null,
  onPickBody,
  radius,
}: {
  still?: boolean;
  selected?: string | null;
  onPickBody?: (key: string) => void;
  radius: number;
}) {
  const rim = radius - 0.06;
  const clock = useRef(0);
  const hovered = useRef<string | null>(null);
  const attention = useRef<Record<string, number>>({});
  const proxies = useRef<Record<string, THREE.Mesh | null>>({});
  const smoke = useRef<(THREE.Sprite | null)[]>([]);
  const mirror = useRef<THREE.Mesh>(null);
  const flames = useRef<(THREE.Sprite | null)[]>([]);

  const R = rim * CIRCLE_R;
  const tri = useMemo(
    () => ({ x: Math.cos(EAST) * rim * TRI_R, z: Math.sin(EAST) * rim * TRI_R, side: rim * TRI_SIDE }),
    [rim],
  );

  const sheetMat = useMemo(() => {
    const map = circlePlate(rim);
    return new THREE.MeshStandardMaterial({
      map,
      roughness: 0.95,
      metalness: 0,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: map,
      // the darkest plate on the instrument, and it has to stay dark: chalk on
      // a lit stone floor is the whole look, and raising this washes the
      // flagstones to grey card
      emissiveIntensity: 0.2,
    });
  }, [rim]);
  const brass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#b08840', metalness: 0.85, roughness: 0.34 }),
    [],
  );
  const steel = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#b8bfc8', metalness: 0.95, roughness: 0.22 }),
    [],
  );
  const dark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2a2622', roughness: 0.6, metalness: 0.1 }),
    [],
  );
  /** the black mirror: nearly black, very smooth, and highly reflective of the
   *  environment — a scrying glass has to give the eye nothing to hold */
  const glass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#05060a',
        metalness: 1,
        roughness: 0.08,
        emissive: new THREE.Color('#0a1420'),
        emissiveIntensity: 1,
      }),
    [],
  );

  useEffect(
    () => () => {
      sheetMat.dispose();
      brass.dispose();
      steel.dispose();
      dark.dispose();
      glass.dispose();
    },
    [sheetMat, brass, steel, dark, glass],
  );

  const studs = useMemo(() => {
    const list: [string, string, string][] = [
      ['circ:lemegeton', 'LEMEGETON', 'The Lesser Key, c. 1640'],
      ['circ:weyer', 'WEYER & SCOT', 'Preserved by the sceptics'],
      ['circ:dee', 'DEE & KELLEY', 'The angelic conversations'],
      ['circ:owners', 'WHOSE BOOKS', 'On the Hebrew names'],
      ['circ:gladius', 'INSTRVMENTA', 'Made new, and consecrated'],
      ['circ:circulus', 'CIRCVLVS', 'A claim of jurisdiction'],
    ];
    return list.map(([key, title, sub], i) => {
      const a = -Math.PI / 2 + (i - 2.5) * 0.15;
      const rr = rim * 0.955;
      return { key, title, sub, x: Math.cos(a) * rr, z: Math.sin(a) * rr, a };
    });
  }, [rim]);

  useEffect(() => {
    if (!onPickBody) return;
    const regd: THREE.Mesh[] = [];
    for (const [key, m] of Object.entries(proxies.current)) {
      if (!m) continue;
      registerPickable(m, {
        onPick: () => onPickBody(key),
        onHover: (h) => {
          if (h) hovered.current = key;
          else if (hovered.current === key) hovered.current = null;
        },
        maxDist: tableReach(radius),
      });
      regd.push(m);
    }
    return () => regd.forEach((m) => unregisterPickable(m));
  }, [onPickBody, studs, radius]);

  useFrame((_, delta) => {
    if (!still) clock.current += delta;
    const t = clock.current;
    for (const key of Object.keys(proxies.current)) {
      const want = hovered.current === key || selected === key ? 1 : 0;
      attention.current[key] = THREE.MathUtils.damp(attention.current[key] ?? 0, want, 9, delta);
    }

    // the censer's smoke: four puffs climbing, spreading and fading, then
    // recycled — a loop of four reads as continuous and costs four sprites
    smoke.current.forEach((s, i) => {
      if (!s) return;
      const p = ((t * 0.22 + i / smoke.current.length) % 1);
      s.position.y = 0.26 + p * 1.15;
      s.position.x = Math.sin(t * 0.5 + i * 2.1) * p * 0.16;
      s.position.z = Math.cos(t * 0.42 + i * 1.7) * p * 0.16;
      const sc = 0.18 + p * 0.55;
      s.scale.set(sc, sc, 1);
      (s.material as THREE.SpriteMaterial).opacity = Math.sin(p * Math.PI) * 0.2;
    });

    flames.current.forEach((f, i) => {
      if (!f) return;
      const flick = 1 + Math.sin(t * 9 + i * 2.3) * 0.12 + Math.sin(t * 21 + i) * 0.05;
      f.scale.set(0.1 * flick, 0.15 * flick, 1);
    });

    // the mirror keeps a slow shimmer, so it reads as a surface rather than a
    // hole cut in the table
    if (mirror.current) {
      const a = attention.current['circ:speculum'] ?? 0;
      glass.emissiveIntensity = 0.5 + Math.sin(t * 0.7) * 0.2 + a * 1.6;
    }
  });

  const set = (key: string) => (m: THREE.Mesh | null) => {
    proxies.current[key] = m;
  };

  return (
    <group>
      {/* candlelight, low and warm, from where the instruments stand — this
          plate is a night working and should not be lit like a chart */}
      <pointLight position={[0, 1.1, 0]} color="#ffcf90" intensity={2.6} distance={9} decay={1.4} />
      <pointLight position={[tri.x, 0.9, tri.z]} color="#9fc0e0" intensity={1.5} distance={5} decay={1.6} />

      <mesh position={[0, 0.007, 0]} rotation-x={-Math.PI / 2} material={sheetMat}>
        <circleGeometry args={[rim, 192]} />
      </mesh>

      {/* the circle's pick target, out on a bare part of the ring */}
      <mesh ref={set('circ:circulus')} visible={false} position={[Math.cos(-2.2) * R * 0.95, 0.1, Math.sin(-2.2) * R * 0.95]}>
        <boxGeometry args={[0.6, 0.3, 0.6]} />
        <meshBasicMaterial />
      </mesh>

      {/* ————— the Triangle of Art, and the black mirror in it ————— */}
      <group position={[tri.x, 0, tri.z]}>
        {/* a low brass frame standing on the chalked triangle */}
        {[0, 1, 2].map((i) => {
          const a0 = EAST + (i / 3) * Math.PI * 2;
          const a1 = EAST + ((i + 1) / 3) * Math.PI * 2;
          const x0 = Math.cos(a0) * tri.side;
          const z0 = Math.sin(a0) * tri.side;
          const x1 = Math.cos(a1) * tri.side;
          const z1 = Math.sin(a1) * tri.side;
          const len = Math.hypot(x1 - x0, z1 - z0);
          return (
            <mesh
              key={i}
              position={[(x0 + x1) / 2, 0.02, (z0 + z1) / 2]}
              rotation-y={-Math.atan2(z1 - z0, x1 - x0)}
              material={brass}
            >
              <boxGeometry args={[len, 0.03, 0.035]} />
            </mesh>
          );
        })}
        <mesh ref={mirror} position={[0, 0.03, 0]} rotation-x={-Math.PI / 2} material={glass}>
          <circleGeometry args={[tri.side * 0.6, 48]} />
        </mesh>
        <mesh position={[0, 0.024, 0]} rotation-x={Math.PI / 2} material={brass}>
          <torusGeometry args={[tri.side * 0.61, 0.018, 8, 48]} />
        </mesh>
        <mesh ref={set('circ:speculum')} visible={false} position={[0, 0.15, 0]}>
          <cylinderGeometry args={[tri.side * 0.7, tri.side * 0.7, 0.3, 12]} />
          <meshBasicMaterial />
        </mesh>
        <mesh ref={set('circ:triangulum')} visible={false} position={[Math.cos(EAST) * tri.side, 0.12, Math.sin(EAST) * tri.side]}>
          <boxGeometry args={[0.3, 0.25, 0.3]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      {/* ————— the brazen vessel ————— */}
      <group position={[Math.cos(Math.PI * 0.78) * R * 0.36, 0, Math.sin(Math.PI * 0.78) * R * 0.36]}>
        <mesh position={[0, 0.13, 0]} material={brass}>
          <sphereGeometry args={[0.15, 20, 14]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} material={brass}>
          <cylinderGeometry args={[0.09, 0.11, 0.04, 16]} />
        </mesh>
        <mesh position={[0, 0.27, 0]} material={brass}>
          <cylinderGeometry args={[0.055, 0.075, 0.06, 16]} />
        </mesh>
        {/* the seal that stoppers it */}
        <mesh position={[0, 0.31, 0]} material={brass}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 6]} />
        </mesh>
        <mesh ref={set('circ:vas')} visible={false} position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.28, 8, 6]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      {/* ————— the censer, smoking ————— */}
      <group position={[Math.cos(Math.PI * 1.22) * R * 0.36, 0, Math.sin(Math.PI * 1.22) * R * 0.36]}>
        <mesh position={[0, 0.11, 0]} material={brass}>
          <cylinderGeometry args={[0.13, 0.07, 0.14, 16]} />
        </mesh>
        <mesh position={[0, 0.03, 0]} material={brass}>
          <cylinderGeometry args={[0.05, 0.08, 0.06, 12]} />
        </mesh>
        <mesh position={[0, 0.185, 0]} material={brass}>
          <torusGeometry args={[0.13, 0.014, 6, 24]} />
        </mesh>
        {/* the coal */}
        <mesh position={[0, 0.18, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.115, 20]} />
          <meshBasicMaterial color="#ff7a3a" toneMapped={false} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <sprite
            key={i}
            ref={(m) => {
              smoke.current[i] = m;
            }}
            scale={[0.2, 0.2, 1]}
          >
            <spriteMaterial
              map={getGlowTexture()}
              color="#cfc4b0"
              transparent
              opacity={0.16}
              depthWrite={false}
            />
          </sprite>
        ))}
        <mesh ref={set('circ:thuribulum')} visible={false} position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.28, 8, 6]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      {/* ————— the sword, point down in the floor ————— */}
      <group position={[Math.cos(Math.PI * 1.5) * R * 0.36, 0, Math.sin(Math.PI * 1.5) * R * 0.36]} rotation-z={0.1}>
        <mesh position={[0, 0.44, 0]} material={steel}>
          <boxGeometry args={[0.045, 0.86, 0.011]} />
        </mesh>
        <mesh position={[0, 0.88, 0]} material={dark}>
          <cylinderGeometry args={[0.022, 0.026, 0.16, 10]} />
        </mesh>
        <mesh position={[0, 0.87, 0]} material={brass}>
          <boxGeometry args={[0.26, 0.028, 0.03]} />
        </mesh>
        <mesh position={[0, 0.97, 0]} material={brass}>
          <sphereGeometry args={[0.036, 12, 10]} />
        </mesh>
        <mesh ref={set('circ:gladius')} visible={false} position={[0, 0.6, 0]}>
          <boxGeometry args={[0.3, 0.9, 0.3]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      {/* ————— four candles at the quarters ————— */}
      {QUARTERS.map((q, i) => (
        <group
          key={q.name}
          position={[Math.cos(q.bearing) * R * 0.93, 0, Math.sin(q.bearing) * R * 0.93]}
        >
          <mesh position={[0, 0.11, 0]} material={dark}>
            <cylinderGeometry args={[0.026, 0.03, 0.22, 10]} />
          </mesh>
          <sprite
            ref={(m) => {
              flames.current[i] = m;
            }}
            position={[0, 0.26, 0]}
            scale={[0.1, 0.15, 1]}
          >
            <spriteMaterial
              map={getGlowTexture()}
              color="#ffc070"
              transparent
              opacity={0.9}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      ))}

      {/* ————— the studs ————— */}
      {studs.map((s) => (
        <group key={s.key} position={[s.x, 0, s.z]} rotation-y={-s.a + Math.PI / 2}>
          <mesh position={[0, 0.03, 0]} material={brass}>
            <cylinderGeometry args={[0.02, 0.032, 0.06, 10]} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2.7} position={[0, 0.105, 0.012]}>
            <planeGeometry args={[0.44, 0.172]} />
            <meshBasicMaterial
              map={studPlate(s.title, s.sub).tex}
              transparent
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={set(s.key)} visible={false} position={[0, 0.1, 0.01]}>
            <boxGeometry args={[0.46, 0.24, 0.22]} />
            <meshBasicMaterial />
          </mesh>
        </group>
      ))}
    </group>
  );
}
