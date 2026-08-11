import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { registerPickable, tableReach, unregisterPickable } from './ManualPicker';
import { engrave, SERIF } from './plateArt';
import { forgedMetal } from './textures';

/**
 * The instrument's one control: which PLATE is on the table.
 *
 * ————— why this is a console and not three tablets —————
 *
 * The old selector was three canted keyplates spread over a 0.68 rad arc of the
 * rim, and testing found the two OUTER ones already hard to notice from a
 * normal standing distance. That is the honest ceiling for that shape: four
 * keys, no more. The instrument shows three plates and has room to grow, so the
 * control is a piece of the furniture rather than three studs pressed into it.
 *
 * What is here is a CONSOLE set into the near arc — a curved walnut ledge with
 * its keys ranked along it, each numbered in Roman and named twice: the plate's
 * Latin name in the hand the charts are lettered in, and a plain English line
 * under it.
 *
 * It carried a lettered brass backboard as well, reading MVTATIO TABVLÆ over a
 * line of instruction, on the argument that the board was what made the rank
 * read as a control from across the rotunda. That was true when the keys sat on
 * a bare rim; it stopped being true once the table itself became a piece of
 * furniture, and the board's real effect was to plant a title card in the
 * middle of the chart. An instrument does not caption its own controls. The
 * keys carry their names, the ledge they are ranked along is now the same
 * timber as the trunk the whole table stands on, and the assembly reads as
 * part of the table rather than as signage laid across it.
 *
 * Every key's emblem is DRAWN, in vector, on its own canvas — a rayed sun, a
 * warded pentacle, a signet. That began as caution: a Unicode symbol here
 * renders at the mercy of whatever the host has installed, and macOS will
 * happily substitute a colour-emoji tile for an astronomical sign. It ended as
 * the better answer anyway — the miniatures read as the work of the
 * same engraver who cut the plates.
 */

/** every plate the great orrery can put on the table */
export type OrreryMode =
  | 'system'
  | 'circulus'
  | 'sigilla';

/** the little vector devices cut into the keys */
type Emblem =
  | 'sun'
  | 'pentacle'
  | 'signet';

export interface PlateSpec {
  mode: OrreryMode;
  /** the Latin name, in the hand the charts are lettered in */
  label: string;
  /** the plain line under it, so a visitor knows what they are choosing */
  sub: string;
  emblem: Emblem;
  /** the numeral cut at the head of the key */
  numeral: string;
}

export const PLATES: readonly PlateSpec[] = [
  { mode: 'system', label: 'SYSTEMA', sub: 'THE SOLAR SYSTEM', emblem: 'sun', numeral: 'I' },
  { mode: 'circulus', label: 'CIRCVLVS ARTIS', sub: 'THE CIRCLE OF ART', emblem: 'pentacle', numeral: 'II' },
  { mode: 'sigilla', label: 'CLAVICVLA', sub: 'THE SEALS OF SOLOMON', emblem: 'signet', numeral: 'III' },
];

/* ————— the drawn emblems —————
 * Each is a miniature of its own plate: a viewer who has seen the chart
 * recognises the key, and a viewer who has not gets a legible hint of what is
 * behind it. Kept to line work — these are cut into brass, not printed on it. */
function drawEmblem(x: CanvasRenderingContext2D, kind: Emblem, cx: number, cy: number, r: number, ink: string) {
  x.save();
  x.translate(cx, cy);
  x.strokeStyle = ink;
  x.fillStyle = ink;
  x.lineWidth = Math.max(2, r * 0.055);
  x.lineCap = 'round';
  const ring = (rr: number, w = x.lineWidth) => {
    x.lineWidth = w;
    x.beginPath();
    x.arc(0, 0, rr, 0, Math.PI * 2);
    x.stroke();
  };
  switch (kind) {
    case 'sun': {
      x.beginPath();
      x.arc(0, 0, r * 0.34, 0, Math.PI * 2);
      x.fill();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const l0 = r * 0.48;
        const l1 = r * (i % 2 ? 0.74 : 0.95);
        x.beginPath();
        x.moveTo(Math.cos(a) * l0, Math.sin(a) * l0);
        x.lineTo(Math.cos(a) * l1, Math.sin(a) * l1);
        x.stroke();
      }
      break;
    }
    case 'pentacle': {
      ring(r * 0.98, x.lineWidth * 1.4);
      ring(r * 0.84, x.lineWidth * 0.7);
      x.lineWidth = x.lineWidth * 1.1;
      x.beginPath();
      for (let i = 0; i <= 5; i++) {
        const a = -Math.PI / 2 + ((i * 2) / 5) * Math.PI * 2;
        const px = Math.cos(a) * r * 0.72;
        const py = Math.sin(a) * r * 0.72;
        if (i === 0) x.moveTo(px, py);
        else x.lineTo(px, py);
      }
      x.closePath();
      x.stroke();
      break;
    }
    case 'signet': {
      // a seal: the hexagram in its ring of characters
      ring(r * 0.98, x.lineWidth * 1.4);
      x.lineWidth = x.lineWidth * 1.05;
      for (const flip of [0, Math.PI]) {
        x.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI / 2 + flip + (i / 3) * Math.PI * 2;
          const px = Math.cos(a) * r * 0.72;
          const py = Math.sin(a) * r * 0.72;
          if (i === 0) x.moveTo(px, py);
          else x.lineTo(px, py);
        }
        x.closePath();
        x.stroke();
      }
      x.beginPath();
      x.arc(0, 0, r * 0.13, 0, Math.PI * 2);
      x.fill();
      break;
    }
  }
  x.restore();
}

/** shrink a font until the string fits the given width */
function fitText(x: CanvasRenderingContext2D, text: string, max: number, start: number, font: string): number {
  let size = start;
  for (;;) {
    x.font = `${size}px ${font}`;
    if (x.measureText(text).width <= max || size <= 10) return size;
    size -= 2;
  }
}

const keyCache = new Map<string, THREE.CanvasTexture>();
/** one baked brass key: numeral, emblem, Latin name, English line */
function keyTex(spec: PlateSpec, active: boolean): THREE.CanvasTexture {
  const id = `${spec.mode}-${active}`;
  const hit = keyCache.get(id);
  if (hit) return hit;
  const W = 512;
  const H = 400;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;

  /* The brass ground: the building's own hammered stock, tiled, with the key's
     lighting laid OVER it rather than instead of it. This was a bare four-stop
     vertical gradient, which is the same thing that made the table's rim band
     read as plastic — every key identical, every millimetre of it predictable
     from its height alone. The stock carries hammer facets and rubbed oxide, so
     no two keys in the rank are quite the same piece of metal. */
  const stock = forgedMetal('#a8863c', 'brass', 41).image as HTMLCanvasElement;
  for (let tx = 0; tx < W; tx += stock.width) {
    for (let ty = 0; ty < H; ty += stock.height) {
      x.drawImage(stock, tx, ty);
    }
  }

  // The live key is lit from above like a polished stud; the dormant ones are
  // the same metal gone dark, which is what a real console looks like — not a
  // different colour, the SAME colour without the light on it. Grey-out would
  // read as disabled rather than as unselected.
  const g = x.createLinearGradient(0, 0, 0, H);
  if (active) {
    g.addColorStop(0, '#8a6a2a');
    g.addColorStop(0.34, '#f2d38d');
    g.addColorStop(0.58, '#ffefbe');
    g.addColorStop(1, '#7a5a24');
  } else {
    g.addColorStop(0, '#42341a');
    g.addColorStop(0.4, '#7d6634');
    g.addColorStop(0.6, '#8b7139');
    g.addColorStop(1, '#33280f');
  }
  x.globalCompositeOperation = 'overlay';
  x.globalAlpha = active ? 0.85 : 1;
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  x.globalAlpha = 1;

  // and the lacquer back over the top, since two multiplies stacked take any
  // painted metal towards mud
  x.globalCompositeOperation = 'soft-light';
  x.globalAlpha = active ? 0.45 : 0.25;
  x.fillStyle = active ? '#ffd98d' : '#8a6a2a';
  x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  x.globalAlpha = 1;

  /* and the dormant keys taken down hard. The plates render UNLIT (basic
     material, tone mapping off) so that the live one stays legible from across
     a dim rotunda — which is the right call for the one key that matters, and
     the wrong one for the three that do not: unlit brass at full value sits
     above everything around it and the whole rank glows like a screen. Since
     the room's light cannot darken them, the paint has to. */
  if (!active) {
    x.globalCompositeOperation = 'multiply';
    x.globalAlpha = 1;
    x.fillStyle = '#6b5a33';
    x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'source-over';
  }

  // the bevel: a bright inner chamfer at the top, a dark one at the foot
  x.strokeStyle = active ? 'rgba(255,240,200,0.55)' : 'rgba(230,205,150,0.2)';
  x.lineWidth = 6;
  x.beginPath();
  x.moveTo(10, 12);
  x.lineTo(W - 10, 12);
  x.stroke();
  x.strokeStyle = 'rgba(20,14,4,0.55)';
  x.beginPath();
  x.moveTo(10, H - 12);
  x.lineTo(W - 10, H - 12);
  x.stroke();

  // the engraved border rule
  x.strokeStyle = active ? '#5a4014' : '#251c0c';
  x.lineWidth = 7;
  x.strokeRect(16, 16, W - 32, H - 32);

  const dark = active ? '#3a2810' : '#20180a';
  const light = active ? '#fff6da' : '#c0a468';

  // the numeral, cut small at the head where a plate's index number goes
  engrave(x, spec.numeral, W / 2, 56, 40, { dark, light, alpha: 0.85 });
  x.save();
  x.strokeStyle = light;
  x.globalAlpha = 0.35;
  x.lineWidth = 2;
  for (const sx of [-1, 1]) {
    x.beginPath();
    x.moveTo(W / 2 + sx * 52, 56);
    x.lineTo(W / 2 + sx * 150, 56);
    x.stroke();
  }
  x.restore();

  // the emblem, cut twice for the groove-and-highlight
  drawEmblem(x, spec.emblem, W / 2, 172, 78, dark);
  x.save();
  x.translate(0, -3);
  drawEmblem(x, spec.emblem, W / 2, 172, 78, light);
  x.restore();

  const nameSize = fitText(x, spec.label, W - 76, 54, SERIF);
  engrave(x, spec.label, W / 2, 296, nameSize, { dark, light });
  const subSize = fitText(x, spec.sub, W - 92, 30, SERIF);
  engrave(x, spec.sub, W / 2, 348, subSize, { dark, light, alpha: 0.62 });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  keyCache.set(id, tex);
  return tex;
}

/* ————— the console's dimensions —————
 * All measured back from the table's rim, because the console is a piece of the
 * rim: it has to sit inside the brass fillet a hand rests on, and outside
 * anything the plates draw in their working area. */
/** how far in from the rim the ledge's centre line runs */
const LEDGE_INSET = 0.44;
/** one key's share of the ledge, in metres of arc.
 *  Up about 15% from 0.395 along with the plate itself. The backboard used to
 *  carry the console's presence at a distance; with it gone, that job falls
 *  entirely to the rank, and four keys sized for a lettered board above them
 *  are not the same as four keys standing alone. */
const KEY_PITCH = 0.46;
/** the drawn key, a little smaller than its pitch so the ledge shows between */
const KEY_W = 0.39;
const KEY_H = 0.3;
/** how high the ledge stands off the chart */
const LEDGE_Y = 0.055;
/**
 * Where the lettered face sits above its plinth, and how far out.
 *
 * The face is canted 60° off the flat, so it reaches `KEY_H/2 · cos 60` — three
 * quarters of a centimetre less than half its height — BELOW its own centre.
 * At the old 0.055 that put the foot of every key four millimetres off the
 * ledge: close enough that at any standing angle the key looked sunk into the
 * timber. This clears it by nearer three centimetres, which is what a tablet
 * standing on a plinth actually looks like.
 */
const KEY_LIFT = 0.085;
/** far enough out that the tablet's leaned-back foot still lands over its own
 *  plinth rather than hanging off the back of it, and its head still stops
 *  short of the ledge's outer lip */
const KEY_Z = 0.04;
/** the cast tablet's thickness, behind the face */
const BODY_D = 0.018;
/** how far back the body sits so the face lies just proud of it — half the
 *  thickness plus a millimetre, or the two are coplanar and z-fight */
const BODY_BACK = BODY_D / 2 + 0.001;

export function PlateConsole({
  mode,
  onSetMode,
  tableR,
  woodMat,
  metalMat,
}: {
  mode: OrreryMode;
  onSetMode?: (m: OrreryMode) => void;
  tableR: number;
  /** the ledge and fascia: the table's own timber, so the console is part of
   *  the furniture and not a brass tray someone left on the chart */
  woodMat: THREE.Material;
  /** the key plinths: the same burnished brass as the chart's edge bead */
  metalMat: THREE.Material;
}) {
  const proxies = useRef<(THREE.Mesh | null)[]>([]);
  const plates = useRef<(THREE.Group | null)[]>([]);
  const pips = useRef<(THREE.Mesh | null)[]>([]);
  const hovered = useRef<number | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const R = tableR - LEDGE_INSET;
  /** the whole rank's arc, from the pitch — so adding a tenth plate widens the
   *  console rather than cramming the keys */
  const SPAN = (KEY_PITCH * PLATES.length) / R;
  const slots = useMemo(
    () =>
      PLATES.map((_, i) => {
        // NEGATIVE, so numeral I lands on the visitor's left and the rank
        // reads I → IX the way the lettering on it does. World +x is to the
        // right of someone standing at +z and looking in, and world angle runs
        // anticlockwise from +x, so ascending angle walks LEFTWARD.
        const a = Math.PI / 2 - (i - (PLATES.length - 1) / 2) * (SPAN / PLATES.length);
        return { a, x: Math.cos(a) * R, z: Math.sin(a) * R };
      }),
    [R, SPAN],
  );

  const plateMats = useMemo(
    () =>
      PLATES.map(
        (p) =>
          new THREE.MeshBasicMaterial({
            map: keyTex(p, false),
            transparent: true,
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
      ),
    [],
  );
  const pipMats = useMemo(
    () =>
      PLATES.map(
        () =>
          new THREE.MeshBasicMaterial({
            color: '#ffd98d',
            transparent: true,
            opacity: 0.2,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            toneMapped: false,
          }),
      ),
    [],
  );
  /** the ledge and the fascia: a lathe-turned arc, so the console is furniture
   *  and not a decal on the chart */
  const ledgeGeom = useMemo(
    // a ring is built in its own XY plane and laid flat by rotation-x = −π/2,
    // which sends local +y to world −z: a local angle θ ends up at world angle
    // −θ. So the arc that lands on the NEAR (+z) side starts at −π/2, not +π/2.
    // Getting this backwards puts the console on the far rim, where it is both
    // unreachable and invisible.
    () => new THREE.RingGeometry(R - 0.17, R + 0.18, 72, 1, -Math.PI / 2 - SPAN / 2 - 0.09, SPAN + 0.18),
    [R, SPAN],
  );
  const fasciaGeom = useMemo(
    () =>
      new THREE.CylinderGeometry(
        R + 0.2,
        R + 0.2,
        LEDGE_Y,
        72,
        1,
        true,
        // a cylinder's theta runs the other way round from a ring's, and starts
        // from +x rather than where a ring starts; this is the arc that lands
        // the open face on the same span as the ledge above it
        -SPAN / 2 - 0.09,
        SPAN + 0.18,
      ),
    [R, SPAN],
  );

  useEffect(
    () => () => {
      plateMats.forEach((m) => m.dispose());
      pipMats.forEach((m) => m.dispose());
      ledgeGeom.dispose();
      fasciaGeom.dispose();
    },
    [plateMats, pipMats, ledgeGeom, fasciaGeom],
  );

  useEffect(() => {
    if (!onSetMode) return;
    const regd: THREE.Mesh[] = [];
    proxies.current.forEach((m, i) => {
      if (!m) return;
      registerPickable(m, {
        onPick: () => onSetMode(PLATES[i].mode),
        onHover: (h) => {
          if (h) hovered.current = i;
          else if (hovered.current === i) hovered.current = null;
        },
        maxDist: tableReach(tableR),
      });
      regd.push(m);
    });
    return () => regd.forEach((m) => unregisterPickable(m));
  }, [onSetMode, tableR]);

  useFrame((_, delta) => {
    PLATES.forEach((p, i) => {
      const active = modeRef.current === p.mode;
      const want = active ? 1 : hovered.current === i ? 0.55 : 0;
      const grp = plates.current[i];
      if (!grp) return;
      const lift = THREE.MathUtils.damp((grp.userData.lift as number) ?? 0, want, 10, delta);
      grp.userData.lift = lift;
      grp.position.y = lift * 0.028;
      plateMats[i].map = keyTex(p, active);
      plateMats[i].opacity = 0.8 + lift * 0.2;
      pipMats[i].opacity = 0.14 + lift * 0.66;
      const pip = pips.current[i];
      if (pip) pip.scale.setScalar(1 + lift * 0.5);
    });
  });

  return (
    <group>
      {/* the ledge the keys are ranked along, and the fascia under it */}
      <mesh position={[0, LEDGE_Y, 0]} rotation-x={-Math.PI / 2} material={woodMat} geometry={ledgeGeom} />
      <mesh position={[0, LEDGE_Y / 2, 0]} material={woodMat} geometry={fasciaGeom} />

      {PLATES.map((p, i) => (
        <group key={p.mode} position={[slots[i].x, LEDGE_Y, slots[i].z]} rotation-y={-slots[i].a + Math.PI / 2}>
          {/* the key's own plinth, set into the ledge */}
          <mesh position={[0, 0.012, 0]} material={metalMat}>
            <boxGeometry args={[KEY_W + 0.03, 0.024, 0.15]} />
          </mesh>
          {/* EVERYTHING IN THIS GROUP CARRIES `noMerge`.
              The group RISES when its key is chosen or pointed at, and
              StaticMerge bakes by world matrix: it looks for meshes that have
              held still across a few checks, and at six seconds after load
              nobody has touched the console yet, so all of these qualify. The
              baked copy is frozen wherever the original stood — for the key
              that happened to be live at load, that is 28 mm in the air — and
              the original is hidden behind it. The live key's body stayed up
              after the key came down and stood in front of its own lettering,
              which is how a plate ends up as a blank brass panel. */}
          <group
            ref={(g) => {
              plates.current[i] = g;
            }}
            position={[0, 0.024, 0]}
          >
            {/* The key's BODY: a cast tablet with an edge to it.

                The lettered face is a plane with an alpha'd map, and on its own
                that is a sheet of paper with no thickness — it met the ledge in
                a hairline and read as a card someone had pushed into a slot in
                the wood. Worse, it was pitched so its foot sat four
                millimetres off the ledge, which at a standing angle is no gap
                at all: the bottom of every key looked buried in the timber it
                was supposed to be standing on.

                So the face is now backed by a brass box a shade larger than
                itself, which shows as a moulded border round the lettering and
                gives the key a real silhouette against the chart, and the whole
                assembly is lifted to stand clear of the ledge. */}
            <mesh
              rotation-x={-Math.PI / 3}
              // back along the face's own normal, which at a 60° cant is
              // (0, sin 60, cos 60)
              position={[0, KEY_LIFT - BODY_BACK * 0.866, KEY_Z - BODY_BACK * 0.5]}
              material={metalMat}
              userData={{ noMerge: true }}
            >
              <boxGeometry args={[KEY_W + 0.022, KEY_H + 0.022, BODY_D]} />
            </mesh>
            {/* the lettered face, sitting just proud of the body */}
            {/* canted a little more upright than it was (π/3, from π/2.6): a
                keyplate lying nearer the flat is legible to someone leaning
                over the rim and almost edge-on to someone standing back, and
                standing back is where a visitor decides whether the thing is
                worth walking to. */}
            <mesh
              rotation-x={-Math.PI / 3}
              position={[0, KEY_LIFT, KEY_Z]}
              material={plateMats[i]}
              userData={{ noMerge: true }}
            >
              <planeGeometry args={[KEY_W, KEY_H]} />
            </mesh>
            {/* the lit pip at the key's foot — the live plate's key burns */}
            <mesh
              ref={(m) => {
                pips.current[i] = m;
              }}
              position={[0, 0.004, 0.082]}
              rotation-x={-Math.PI / 2}
              material={pipMats[i]}
              userData={{ noMerge: true }}
            >
              <circleGeometry args={[0.032, 16]} />
            </mesh>
          </group>
          {/* the pick target: generous, upright, and hidden on the MESH — a
              material's own visible flag is not reliable here and a row of
              white boxes across the rim is not a subtle failure */}
          <mesh
            visible={false}
            position={[0, 0.1, 0.01]}
            ref={(g) => {
              proxies.current[i] = g;
            }}
          >
            <boxGeometry args={[KEY_PITCH - 0.02, 0.24, 0.26]} />
            <meshBasicMaterial />
          </mesh>
        </group>
      ))}
    </group>
  );
}
