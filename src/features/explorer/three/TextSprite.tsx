import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { LEAN_TEXTURES, TEXTURE_SCALE } from './textureBudget';

/**
 * Self-contained 3D text: renders type onto a high-DPI canvas texture.
 * No SDF worker, no font CDN — it reuses the fonts the page already loaded,
 * so the museum's labels work offline and can never suspend the scene.
 */

const FAMILIES = {
  display: "'Cormorant Garamond', 'Iowan Old Style', Georgia, serif",
  ui: "'Inter', -apple-system, 'Segoe UI', sans-serif",
};

interface TextSpriteProps {
  children: string;
  /** world-unit height of one text line */
  height?: number;
  color?: string;
  font?: keyof typeof FAMILIES;
  weight?: number;
  /** wrap to at most this many px at the 64px basis (≈ characters × 30) */
  maxWidthPx?: number;
  /** billboard (sprite) or fixed plane */
  billboard?: boolean;
  position?: [number, number, number];
  opacity?: number;
  outline?: boolean;
}

interface Baked {
  texture: THREE.CanvasTexture;
  aspect: number;
  lines: number;
}

const BASE = 64; // px font size the LAYOUT is measured at (wrap, padding, aspect)

/**
 * HOW MANY CANVAS PIXELS PER LAYOUT PIXEL — the most expensive number in the
 * building, and the one that made it unrunnable on a phone.
 *
 * Every label bakes its own canvas and a canvas is RGBA in VRAM the moment it
 * uploads. At the old flat 2 the museum's 969 labels held **1.97 GB — two
 * thirds of the whole scene's texture memory**, more than a mid-range phone
 * has to give at all.
 *
 * What costs that is WIDTH, not glyph height: the canvas is one line tall
 * (~156px at the old value) and up to 2006px wide, because a long string is
 * measured at the 64px layout basis and then doubled. So the lever is the
 * raster factor, and memory falls with its SQUARE.
 *
 * But a single flat value is the wrong shape, which a measurement of the live
 * scene showed and an assumption did not: label density ranges from 471 to
 * 3852 texels per world metre, and the 3.2 m wayfinding titles were already
 * the WORST provisioned in the building at 80 — magnified more than 3× at
 * eight metres. Halving everything equally would have starved exactly the
 * signs meant to be read across the rotunda.
 *
 * So: a floor of 1 canvas px per layout px for ordinary labels (a quarter of
 * the old memory, still ~78 texels per line — above the on-screen line height
 * anywhere you can actually stand), lifted for labels that are physically
 * large in the world until they clear MIN_PX_PER_METRE. The giant titles come
 * out SHARPER than they are today; everything else comes out far cheaper.
 */
/* On a phone every one of these is halved again (see textureBudget): 969
   labels at desktop density is ~486 MB of texture on a device whose whole tab
   budget is smaller than that, and text is the one thing that survives being
   drawn small — a glyph is high-contrast, and the outline stroke carries it. */
const RASTER_FLOOR = 1 * TEXTURE_SCALE;
const RASTER_CEIL = 2.5 * TEXTURE_SCALE;
/** the density below which a big sign starts to look like a blurred decal */
const MIN_PX_PER_METRE = 100 * TEXTURE_SCALE;
/**
 * NOTE, measured: no label in the building currently reaches the ceiling, and
 * one wayfinding title still sits at 80 px/m. That one is scaled by an
 * ANCESTOR GROUP, which this function cannot see — `height` is local, and the
 * world size is local × every parent. It is no worse than it was before this
 * pass, but if a big sign ever looks soft, that is the mechanism: fix it by
 * raising the label's own `height` rather than by scaling the group it sits in.
 */
const noRaycast = () => undefined;

function bake(
  text: string,
  color: string,
  family: string,
  weight: number,
  maxWidthPx: number,
  outline: boolean,
  /** world height of ONE LINE of this label — sets how finely it must raster */
  worldLineHeight: number,
): Baked {
  const scratch = document.createElement('canvas').getContext('2d')!;
  scratch.font = `${weight} ${BASE}px ${family}`;
  // greedy word wrap
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (line && scratch.measureText(candidate).width > maxWidthPx) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  const lineHeight = BASE * 1.22;
  const pad = BASE * 0.4;
  const width = Math.ceil(Math.max(...lines.map((l) => scratch.measureText(l).width)) + pad * 2);
  const height = Math.ceil(lines.length * lineHeight + pad * 2);

  // the raster this label needs to hold MIN_PX_PER_METRE, never below the
  // floor and never past the ceiling (a 3 m sign does not need 4× either)
  const raster = Math.min(
    RASTER_CEIL,
    Math.max(RASTER_FLOOR, (MIN_PX_PER_METRE * worldLineHeight) / lineHeight),
  );

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.round(width * raster));
  canvas.height = Math.max(2, Math.round(height * raster));
  const ctx = canvas.getContext('2d')!;
  ctx.scale(raster, raster);
  ctx.font = `${weight} ${BASE}px ${family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((l, i) => {
    const y = pad + lineHeight * (i + 0.5);
    if (outline) {
      ctx.lineWidth = BASE * 0.12;
      ctx.strokeStyle = 'rgba(13, 10, 26, 0.9)';
      ctx.strokeText(l, width / 2, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(l, width / 2, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, aspect: width / height, lines: lines.length };
}

/**
 * ONE BAKE PER DISTINCT LABEL, however many times it is hung.
 *
 * Every `<TextSprite>` used to raster its own canvas even when the string,
 * colour, face and wrap were identical to one already resident — so the eight
 * wing plaques that share a date range, the repeated station eyebrows and
 * every duplicated caption each paid full price in VRAM and in an upload.
 *
 * Entries are reference-counted rather than left to the garbage collector,
 * because a GPU texture is not garbage-collectable: dropping the last JS
 * reference leaves the upload resident until something calls `dispose`. The
 * count is what makes that call safe — a label unmounting can no longer take
 * the texture out from under a sibling that is still showing it.
 */
interface CacheEntry {
  baked: Baked;
  refs: number;
}
const bakeCache = new Map<string, CacheEntry>();

/**
 * Baking happens during RENDER (the sprite needs the aspect ratio to size
 * itself), but counting happens on COMMIT — the two are deliberately split.
 * Under StrictMode React renders twice and throws one away, so a count kept
 * in the render phase drifts upward and nothing is ever freed. This half only
 * ensures the picture exists; it does not claim it.
 */
/**
 * BAKE THE LABELS OVER MANY FRAMES INSTEAD OF ALL AT ONCE — lean devices only.
 *
 * The legibility cull stopped 698 of these being UPLOADED, which was most of
 * the texture memory, but every one of the 969 is still rastered the moment
 * it mounts: a canvas created, the string measured, the glyphs stroked and
 * filled. That is 660 ms on a desk and, on Safari — whose text measurement is
 * markedly slower — several seconds on a phone, spent before the first frame
 * can be presented. It is the last thing standing between tapping the link
 * and standing in the hall.
 *
 * So on lean devices a label asks for its picture and gets it later. The pump
 * runs on animation frames and spends a fixed BUDGET of milliseconds per
 * frame, so the work is spread across the first second or two of a hall that
 * is already on screen and already walkable. Labels fade in over that window
 * rather than the building arriving late.
 *
 * Desktop bakes synchronously, exactly as before: there is nothing to fix on
 * a machine where the whole set costs half a frame's grace.
 */
const BUDGET_MS = 4;
const queue: { key: string; make: () => Baked; wake: () => void }[] = [];
let pumping = false;

function pump(): void {
  const until = performance.now() + BUDGET_MS;
  while (queue.length && performance.now() < until) {
    const job = queue.shift()!;
    // it may have been baked by another sprite sharing the same key
    if (!bakeCache.has(job.key)) bakeCache.set(job.key, { baked: job.make(), refs: 0 });
    job.wake();
  }
  if (queue.length) requestAnimationFrame(pump);
  else pumping = false;
}

function enqueue(key: string, make: () => Baked, wake: () => void): void {
  queue.push({ key, make, wake });
  if (!pumping) {
    pumping = true;
    requestAnimationFrame(pump);
  }
}

function peek(key: string, make: () => Baked): Baked {
  let entry = bakeCache.get(key);
  if (!entry) {
    entry = { baked: make(), refs: 0 };
    bakeCache.set(key, entry);
  }
  return entry.baked;
}

/** claim it, from an effect — paired with exactly one `release` */
function retain(key: string): void {
  const entry = bakeCache.get(key);
  if (entry) entry.refs += 1;
}

function release(key: string): void {
  const entry = bakeCache.get(key);
  if (!entry) return;
  entry.refs -= 1;
  if (entry.refs > 0) return;
  entry.baked.texture.dispose();
  bakeCache.delete(key);
}

/**
 * HAS THE PAGE'S TYPE ARRIVED YET?
 *
 * Shared, and resolved once, rather than asked per label. Every sprite used
 * to start `false`, bake itself in Georgia, and then bake again when
 * `document.fonts.ready` resolved — so the museum's 969 labels performed
 * 1,887 bakes, and 969 canvases were uploaded to the GPU only to be replaced
 * moments later. On a desk that is 660 ms nobody notices. On a phone it is
 * several seconds of the wait before the doors open, and double the peak
 * texture memory at exactly the moment memory is tightest.
 *
 * A module-level promise instead: the first label to mount starts the wait,
 * every label shares its result, and nothing bakes in a fallback face unless
 * the fonts genuinely never arrive.
 */
let fontsAreReady = typeof document !== 'undefined' && document.fonts?.status === 'loaded';
const fontWaiters = new Set<() => void>();
if (!fontsAreReady && typeof document !== 'undefined') {
  void document.fonts?.ready.then(() => {
    fontsAreReady = true;
    fontWaiters.forEach((fn) => fn());
    fontWaiters.clear();
  });
}

export function TextSprite({
  children,
  height = 0.5,
  color = '#f2e9d8',
  font = 'display',
  weight = 600,
  maxWidthPx = 900,
  billboard = true,
  position = [0, 0, 0],
  opacity = 1,
  outline = true,
}: TextSpriteProps) {
  // wait for the real face rather than baking twice — see fontsAreReady
  const [fontsReady, setFontsReady] = useState(fontsAreReady);
  useEffect(() => {
    if (fontsReady) return;
    const wake = () => setFontsReady(true);
    fontWaiters.add(wake);
    return () => {
      fontWaiters.delete(wake);
    };
  }, [fontsReady]);
  // `height` is in the key because it changes the PICTURE, not just the quad:
  // two labels of the same words at different world sizes need different
  // raster densities and so cannot share one bake.
  const key = `${font}|${weight}|${color}|${maxWidthPx}|${height}|${outline ? 'o' : '-'}|${children}`;
  // NOTHING IS BAKED IN A FALLBACK FACE. The hooks still run in the same order
  // every render — the early return is below them, where React requires it —
  // but the work inside is skipped until the real type has arrived, which is
  // what turns 1,887 bakes back into 969.
  // bumped by the pump when this label's picture is ready (lean devices).
  // It MUST be a dependency of the memo below: waking the component is not
  // enough on its own, because a memo whose deps are unchanged hands back the
  // same null it computed before the bake existed — which left 8 of 969
  // labels on screen and the rest permanently empty.
  const [bakeTick, setBakeTick] = useState(0);
  const baked = useMemo(() => {
    if (!fontsReady) return null;
    const make = () => bake(children, color, FAMILIES[font], weight, maxWidthPx, outline, height * 1.5);
    if (!LEAN_TEXTURES) return peek(key, make);
    const hit = bakeCache.get(key);
    if (hit) return hit.baked;
    enqueue(key, make, () => setBakeTick((n) => n + 1));
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fontsReady, bakeTick]);
  useEffect(() => {
    if (!baked) return;
    retain(key);
    return () => release(key);
  }, [key, baked]);

  // an empty sprite for the few hundred ms before the type lands
  if (!baked) return null;

  const blockHeight = height * baked.lines * 1.5;
  const scale: [number, number, number] = [blockHeight * baked.aspect, blockHeight, 1];

  // Text is content, not dressing: PropCulling's glow budget ranks sprites by
  // screen area and starves the small/far ones, and in a small building most
  // labels ARE small or far. That is right for a candle glow — nobody reads a
  // candle — and wrong for a hall sign or a wayfinding title, which exists
  // specifically to be read from a distance. `noCull` is PropCulling's opt-out.
  if (billboard) {
    return (
      <sprite position={position} scale={scale} raycast={noRaycast} userData={{ noCull: true }}>
        <spriteMaterial map={baked.texture} transparent opacity={opacity} depthWrite={false} />
      </sprite>
    );
  }
  return (
    <mesh position={position} scale={scale} raycast={noRaycast} userData={{ noCull: true }}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={baked.texture} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}
