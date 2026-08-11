import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { registerPickable, tableReach, unregisterPickable } from './ManualPicker';
import { getGlowTexture } from './glowTexture';
import { studPlate } from './studPlate';
import { sealTexture } from './sealArt';
import {
  PLATE_S,
  arcEngrave,
  cartouche,
  degreeScale,
  engrave,
  nightGround,
  plate,
  ruleCircle,
  square,
  starfield,
} from './plateArt';
import { SEALS } from '../../../data/solomonSeals';

/**
 * CLAVICVLA — the seals of Solomon, thrown up as light over the middle of the
 * table.
 *
 * A brass lantern stands at the hub with its lens turned upward, and the seal
 * a visitor has chosen hangs in the air above it: a disc of light two metres
 * across, slowly turning, drawn with its versicle, its band of characters and
 * its figure — for most of the planets, that planet's own magic square, with
 * the sigil traced through it. Around the rim of the chart the ten seals stand
 * in their brass index frames; choosing one raises it into the beam and opens
 * its reading, which is the whole point: every one of these is a warrant made
 * out for one named purpose, and the purpose is the interesting part.
 *
 * ————— on putting something over this table —————
 *
 * The instrument's standing rule is that the air above the chart stays clear:
 * an armillary canopy was built here once and taken out again, because the open
 * view down onto the plate is what the table is for. A hologram is the exception
 * that proves it. It is a single translucent disc, it is additive so it never
 * occludes anything behind it, and it hangs at 1.75 m above the tabletop — that
 * is 2.7 m in world terms, comfortably above a 2.2 m eye, so a visitor looks UP
 * at it and still reads the whole chart underneath. Nothing solid, nothing
 * structural, and nothing at eye level.
 */

/** how high the hologram hangs above the chart */
const HOLO_Y = 1.75;
/** its drawn diameter, in table units */
const HOLO_R = 1.0;
/** where the index frames stand */
const INDEX_R = 0.72;

function claviculaPlate(rim: number): THREE.CanvasTexture {
  return plate('sigilla', `sheet-${rim.toFixed(2)}`, () => {
    const S = PLATE_S;
    const [c, x] = square(S);
    const C = S / 2;
    nightGround(x, S, '#141024');
    starfield(x, S, 620, 14, 0.2, 0.97);

    // the beam's own pool of light at the hub, painted so the lantern reads as
    // standing IN something rather than on a flat plate
    {
      const g = x.createRadialGradient(C, C, 0, C, C, C * 0.34);
      g.addColorStop(0, 'rgba(255,236,186,0.34)');
      g.addColorStop(0.45, 'rgba(255,222,160,0.12)');
      g.addColorStop(1, 'rgba(255,222,160,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, S, S);
    }

    ruleCircle(x, C, C * 0.16, '#c9a648', 0.8, 5);
    ruleCircle(x, C, C * 0.185, '#c9a648', 0.45, 2);
    arcEngrave(x, C, 'CLAVICVLA SALOMONIS', C * 0.225, -Math.PI / 2, 34, '#1b1408', '#ffe9b4', 0.9);
    arcEngrave(x, C, 'THE KEY OF SOLOMON', C * 0.225, Math.PI / 2, 26, '#1b1408', '#cfd8e8', 0.6, true);

    // the ring the index frames stand on
    ruleCircle(x, C, C * INDEX_R, '#c9a648', 0.5, 3);
    ruleCircle(x, C, C * (INDEX_R - 0.03), '#c9a648', 0.3, 1.6);

    // each seal's own place, named on the plate under its frame
    SEALS.forEach((s, i) => {
      const a = -Math.PI / 2 + (i / SEALS.length) * Math.PI * 2;
      const px = C + Math.cos(a) * C * INDEX_R;
      const py = C + Math.sin(a) * C * INDEX_R;
      x.save();
      x.strokeStyle = '#e8cf8e';
      x.globalAlpha = 0.55;
      x.lineWidth = 3;
      x.setLineDash([10, 8]);
      x.beginPath();
      x.moveTo(C + Math.cos(a) * C * 0.2, C + Math.sin(a) * C * 0.2);
      x.lineTo(px, py);
      x.stroke();
      x.restore();
      x.save();
      x.translate(px, py);
      x.rotate(a + Math.PI / 2);
      engrave(x, s.planet.toUpperCase(), 0, C * 0.075, 24, { light: s.colour, alpha: 0.8 });
      x.restore();
    });

    // the planetary band at the rim: metal, day and hour, which is what a maker
    // actually had to know before touching any of these
    const inner = C * 0.9;
    const outer = C * 0.985;
    ruleCircle(x, C, inner, '#c9a648', 0.7, 3);
    ruleCircle(x, C, outer, '#c9a648', 0.85, 4);
    degreeScale(x, C, inner + 5, outer - 5, '#c9a648', 5, 30, 0.6);
    const CHALDEAN: [string, string][] = [
      ['SATVRNVS · PLVMBVM · SATVRDAY', '♄'],
      ['IVPPITER · STANNVM · THVRSDAY', '♃'],
      ['MARS · FERRVM · TVESDAY', '♂'],
      ['SOL · AVRVM · SVNDAY', '☉'],
      ['VENVS · CVPRVM · FRIDAY', '♀'],
      ['MERCVRIVS · ARGENTVM VIVVM · WEDNESDAY', '☿'],
      ['LVNA · ARGENTVM · MONDAY', '☽'],
    ];
    CHALDEAN.forEach(([label], i) => {
      const a = -Math.PI / 2 + ((i + 0.5) / 7) * Math.PI * 2;
      // lettered the other way up on the near half, so a visitor at the console
      // is not reading four of the seven upside down
      arcEngrave(x, C, label, (inner + outer) / 2, a, 24, '#1b1408', '#e8cf8e', 0.72, Math.sin(a) > 0);
    });

    cartouche(
      x,
      C + Math.cos(-Math.PI * 0.72) * C * 0.55,
      C + Math.sin(-Math.PI * 0.72) * C * 0.55,
      C * 0.52,
      C * 0.22,
      [
        { text: 'SIGILLA ET PENTACVLA', size: 38 },
        { text: 'THE SEALS OF SOLOMON', size: 22, gap: 1.7 },
        { text: 'each made for one named office', size: 20, gap: 1.4 },
        { text: 'CHOOSE ONE TO RAISE IT', size: 20, gap: 1.6 },
      ],
    );
    return c;
  });
}

export function SolomonSeals({
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
  const [chosen, setChosen] = useState(0);
  /** eases 0 → 1 as a newly chosen seal forms in the beam */
  const forming = useRef(0);
  const holo = useRef<THREE.Group>(null);
  const holoFace = useRef<THREE.Mesh>(null);
  const holoRing = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.Mesh>(null);
  const frames = useRef<(THREE.Group | null)[]>([]);

  const sheetMat = useMemo(() => {
    const map = claviculaPlate(rim);
    return new THREE.MeshStandardMaterial({
      map,
      roughness: 0.9,
      metalness: 0.04,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: map,
      emissiveIntensity: 0.32,
    });
  }, [rim]);

  /** the hologram's face. Additive and unlit: a projected figure adds light to
   *  whatever is behind it and never occludes it, which is the whole difference
   *  between a hologram and a signboard. */
  const holoMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: sealTexture(SEALS[0]),
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const beamMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffe0a8',
        transparent: true,
        opacity: 0.055,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const brass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d8ae5e', metalness: 0.88, roughness: 0.24 }),
    [],
  );
  const brassLit = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffd88a',
        metalness: 0.8,
        roughness: 0.2,
        emissive: new THREE.Color('#7a5520'),
        emissiveIntensity: 1,
      }),
    [],
  );
  const indexMats = useMemo(
    () =>
      SEALS.map(
        (s) =>
          new THREE.MeshBasicMaterial({
            map: sealTexture(s),
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            toneMapped: false,
          }),
      ),
    [],
  );

  useEffect(
    () => () => {
      sheetMat.dispose();
      holoMat.dispose();
      beamMat.dispose();
      brass.dispose();
      brassLit.dispose();
      indexMats.forEach((m) => m.dispose());
    },
    [sheetMat, holoMat, beamMat, brass, brassLit, indexMats],
  );

  const studs = useMemo(() => {
    const list: [string, string, string][] = [
      ['sig:clavicula', 'CLAVICVLA', 'The book, and its hundred copies'],
      ['sig:making', 'FABRICA', 'How a pentacle is made'],
      ['sig:kamea', 'KAMEA', 'The planetary squares'],
    ];
    return list.map(([key, title, sub], i) => {
      const a = -Math.PI / 2 + (i - 1) * 0.16;
      const R = rim * 0.955;
      return { key, title, sub, x: Math.cos(a) * R, z: Math.sin(a) * R, a };
    });
  }, [rim]);

  useEffect(() => {
    if (!onPickBody) return;
    const regd: THREE.Mesh[] = [];
    for (const [key, m] of Object.entries(proxies.current)) {
      if (!m) continue;
      const idx = SEALS.findIndex((s) => s.key === key);
      registerPickable(m, {
        onPick: () => {
          if (idx >= 0 && idx !== chosen) {
            setChosen(idx);
            forming.current = 0;
          }
          onPickBody(key);
        },
        onHover: (h) => {
          if (h) hovered.current = key;
          else if (hovered.current === key) hovered.current = null;
        },
        maxDist: tableReach(radius),
      });
      regd.push(m);
    }
    return () => regd.forEach((m) => unregisterPickable(m));
  }, [onPickBody, studs, chosen, radius]);

  useEffect(() => {
    holoMat.map = sealTexture(SEALS[chosen]);
    holoMat.needsUpdate = true;
  }, [chosen, holoMat]);

  useFrame((_, delta) => {
    if (!still) clock.current += delta;
    const t = clock.current;
    for (const key of Object.keys(proxies.current)) {
      const want = hovered.current === key || selected === key ? 1 : 0;
      attention.current[key] = THREE.MathUtils.damp(attention.current[key] ?? 0, want, 9, delta);
    }
    if (!still) forming.current = Math.min(1, forming.current + delta * 1.6);
    const f = forming.current;

    if (holo.current) {
      holo.current.rotation.y = t * 0.11;
      // it breathes very slightly, which is what stops a flat additive disc
      // reading as a decal stuck in the air
      holo.current.position.y = HOLO_Y + (still ? 0 : Math.sin(t * 0.55) * 0.035);
      const s = 0.6 + f * 0.4;
      holo.current.scale.setScalar(s);
    }
    if (holoFace.current) {
      // the forming flicker: a projector settling, not a fade
      const flick = f < 1 && !still ? 0.6 + Math.abs(Math.sin(t * 26)) * 0.4 : 1;
      holoMat.opacity = 0.95 * f * flick;
    }
    if (holoRing.current) {
      holoRing.current.rotation.z = -t * 0.24;
      (holoRing.current.material as THREE.MeshBasicMaterial).opacity = 0.3 * f;
    }
    if (beam.current) {
      beamMat.opacity = 0.03 + 0.035 * f + (still ? 0 : Math.sin(t * 1.3) * 0.008);
    }

    frames.current.forEach((g, i) => {
      if (!g) return;
      const a = attention.current[SEALS[i].key] ?? 0;
      const live = i === chosen ? 1 : 0;
      // the chosen seal lifts and burns; the rest wait. The frame's own bearing
      // is fixed in JSX and must NOT be animated — a turning disc goes edge-on
      // twice a revolution and the ring reads as flickering.
      g.position.y = 0.24 + a * 0.05 + live * 0.06 + (still ? 0 : Math.sin(t * 1.1 + i) * 0.008);
      indexMats[i].opacity = 0.34 + a * 0.4 + live * 0.42;
    });
  });

  const set = (key: string) => (m: THREE.Mesh | null) => {
    proxies.current[key] = m;
  };

  return (
    <group>
      <pointLight position={[0, 1.2, 0]} color="#ffdca0" intensity={3.2} distance={11} decay={1.3} />
      <pointLight position={[-1.8, 2.4, 2.0]} color="#bcd0ea" intensity={1.5} distance={12} decay={1.5} />

      <mesh position={[0, 0.007, 0]} rotation-x={-Math.PI / 2} material={sheetMat}>
        <circleGeometry args={[rim, 192]} />
      </mesh>

      {/* ————— the lantern at the hub ————— */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.06, 0]} material={brass}>
          <cylinderGeometry args={[0.2, 0.28, 0.12, 20]} />
        </mesh>
        <mesh position={[0, 0.2, 0]} material={brass}>
          <cylinderGeometry args={[0.15, 0.2, 0.18, 20]} />
        </mesh>
        {/* the lens, blazing */}
        <mesh position={[0, 0.3, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.13, 24]} />
          <meshBasicMaterial color="#fff2cc" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.295, 0]} rotation-x={Math.PI / 2} material={brassLit}>
          <torusGeometry args={[0.14, 0.016, 8, 28]} />
        </mesh>
        <sprite position={[0, 0.32, 0]} scale={[0.8, 0.8, 1]}>
          <spriteMaterial
            map={getGlowTexture()}
            color="#ffe0a8"
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      </group>

      {/* the beam: a cone opening from the lens up to the figure */}
      <mesh ref={beam} position={[0, 0.3 + (HOLO_Y - 0.3) / 2, 0]} material={beamMat}>
        <cylinderGeometry args={[HOLO_R * 1.02, 0.14, HOLO_Y - 0.3, 40, 1, true]} />
      </mesh>

      {/* ————— the hologram ————— */}
      <group ref={holo} position={[0, HOLO_Y, 0]}>
        {/* two faces at right angles, so the figure reads from every side of the
            table instead of vanishing to a line as a visitor walks round */}
        <mesh ref={holoFace} material={holoMat}>
          <planeGeometry args={[HOLO_R * 2, HOLO_R * 2]} />
        </mesh>
        <mesh rotation-y={Math.PI / 2} material={holoMat}>
          <planeGeometry args={[HOLO_R * 2, HOLO_R * 2]} />
        </mesh>
        <mesh ref={holoRing} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[HOLO_R * 1.06, HOLO_R * 1.12, 64]} />
          <meshBasicMaterial
            color="#ffe0a8"
            transparent
            opacity={0.3}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <sprite scale={[HOLO_R * 3.4, HOLO_R * 3.4, 1]}>
          <spriteMaterial
            map={getGlowTexture()}
            color="#ffdca0"
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      </group>

      {/* ————— the index: ten seals in their brass frames ————— */}
      {SEALS.map((s, i) => {
        const a = -Math.PI / 2 + (i / SEALS.length) * Math.PI * 2;
        const R = rim * INDEX_R;
        return (
          <group key={s.key} position={[Math.cos(a) * R, 0, Math.sin(a) * R]}>
            {/* the stand */}
            <mesh position={[0, 0.05, 0]} material={brass}>
              <cylinderGeometry args={[0.022, 0.05, 0.1, 12]} />
            </mesh>
            {/* The seal stands UPRIGHT in its ring, facing radially outward.
                Laid flat it is edge-on to anybody standing at the rim and reads
                as a bright smudge; standing, and drawn double-sided and
                additively, it is legible from both sides of the table at once —
                which is what a ring of ten of them has to be. */}
            <group
              ref={(g) => {
                frames.current[i] = g;
              }}
              position={[0, 0.24, 0]}
              rotation-y={Math.PI / 2 - a}
            >
              <mesh material={i === chosen ? brassLit : brass}>
                <torusGeometry args={[0.145, 0.013, 8, 36]} />
              </mesh>
              <mesh material={indexMats[i]}>
                <planeGeometry args={[0.26, 0.26]} />
              </mesh>
            </group>
            {/* The name, on a small canted tablet beneath — built exactly like
                the studs below, because it IS one: same foot, same height off
                the chart, same tablet.

                It used to be a bare plane centred 0.03 above the sheet, and at
                that cant (−π/2.7) a 0.164 tablet reaches 0.033 below its own
                centre: the bottom third of every seal's name was UNDER the
                chart, sliced off along the line where the two surfaces crossed.
                A tablet is an object standing on the table, so it stands on
                something. */}
            <group rotation-y={-a + Math.PI / 2} position={[0, 0, 0.19]}>
              <mesh position={[0, 0.03, 0]} material={brass}>
                <cylinderGeometry args={[0.02, 0.032, 0.06, 10]} />
              </mesh>
              <mesh rotation-x={-Math.PI / 2.7} position={[0, 0.105, 0.012]}>
                <planeGeometry args={[0.44, 0.172]} />
                <meshBasicMaterial
                  map={studPlate(s.name.replace('The ', '').toUpperCase(), s.planet, i === chosen).tex}
                  transparent
                  side={THREE.DoubleSide}
                  toneMapped={false}
                />
              </mesh>
            </group>
            <mesh ref={set(s.key)} visible={false} position={[0, 0.18, 0.06]}>
              <boxGeometry args={[0.4, 0.42, 0.4]} />
              <meshBasicMaterial />
            </mesh>
          </group>
        );
      })}

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
