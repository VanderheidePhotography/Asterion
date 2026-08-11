import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Hide props that are too small on screen to be worth a draw call.
 *
 * The building is draw-call bound, not fill-rate bound: rendering it at 3.3×
 * the pixel count costs about 50% more, while the frame is dominated by the
 * sheer NUMBER of things submitted. Measured from the middle of the rotunda,
 * a frame issues ~1000 draws and **~72% of them are under 50 triangles** —
 * candlesticks, inkwells, book spines, ivy sprigs, the dressing that makes the
 * place feel inhabited. Each costs a full state change and uniform upload to
 * put a handful of triangles on screen, and they are scattered out to 63 m, so
 * most of them are a few pixels wide when they are drawn at all.
 *
 * So the cull is by APPARENT SIZE rather than distance: an object is skipped
 * when its bounding sphere projects to less than a few pixels tall. That keeps
 * the near dressing — the things the visitor is actually looking at — fully
 * intact, and drops the far clutter that reads as texture rather than as
 * objects. Architecture is never affected, because a wall or a floor has a huge
 * bounding sphere and can never fall under the threshold.
 *
 * IMPORTANT — this only ever touches meshes and sprites, NEVER lights. The
 * count of visible lights is a shader define, so hiding one relinks every
 * material in the building (see the note in nicheLight.tsx). Mesh visibility
 * carries no such cost: it is a pure culling decision made per frame.
 *
 * `userData.noCull` is the opt-out, and `TextSprite` always sets it. Text is
 * content, not dressing — a hall sign or a wayfinding title exists exactly to
 * be read from across the room, which is precisely the case both culls are
 * built to drop. In a building this size that made real titles disappear
 * mid-approach, which read as broken, not as an optimisation.
 */

/** an object is culled below this projected height, as a fraction of the
 *  viewport. 0.006 of a 900 px viewport is about five pixels. */
const MIN_SCREEN_FRACTION = 0.006;

/** never cull anything nearer than this, whatever the maths says — small props
 *  on the table in front of you must not blink out because the camera dipped */
const ALWAYS_KEEP_WITHIN = 6;

/** objects whose bounding sphere is bigger than this are structure, not
 *  dressing, and are left alone entirely */
const MAX_PROP_RADIUS = 2.5;

/** re-evaluate this often; props do not move and the camera walks slowly */
const INTERVAL = 0.15;

/**
 * Total additive glow allowed on screen at once, measured in SCREENFULS.
 *
 * The building dresses its candles, lamps and shafts with soft additive
 * sprites, and they are the reason the frame collapses at full screen and in
 * the middle of the rotunda. Measured from the centre: 596 sprites covering
 * **12.6 screens** of blended area. Additive blending cannot early-z reject,
 * so that is 12.6 full-screen fragment passes before any geometry is shaded —
 * at 2560×1440 roughly 46 million blended fragments a frame. It scales with
 * pixel count, which is exactly why going full screen costs so much, and it
 * peaks where the glows overlap, which is exactly the centre.
 *
 * Culling by size alone does not fix it: no single sprite is the problem, the
 * SUM is. So they are ranked by how much screen each one covers and kept until
 * the budget runs out. The big near glows — the ones actually carrying the
 * lighting story — always win; the far small ones, which the Bloom pass
 * re-creates anyway, are dropped.
 */
const GLOW_BUDGET_SCREENS = 3;

/** glows closer than this are always kept: the candle on the table in front of
 *  you must not go out because the room behind it is busy */
const GLOW_ALWAYS_WITHIN = 4;

/**
 * Hysteresis on the budget cutoff.
 *
 * A ranked budget with a single hard edge flickers: the sprites sitting either
 * side of the cutoff swap places as the camera drifts, so every re-check turns
 * some of them on and others off, at 0.15 s intervals. On screen that is a row
 * of glows blinking in and out, which reads as a rendering fault rather than a
 * budget. A glow that is ALREADY lit is therefore allowed to overrun the budget
 * by this factor before it is dropped, so a sprite has to move decisively out
 * of contention — not merely jitter across the line — to be turned off.
 */
const GLOW_STICKY = 1.35;

type Cullable = THREE.Mesh | THREE.Sprite;

export function PropCulling() {
  const { scene, camera, size } = useThree();
  const acc = useRef(0);
  /** the ones WE hid, so a prop switched off by its own component is never
   *  switched back on by us */
  const ours = useRef(new Set<Cullable>());
  const pos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    acc.current += delta;
    if (acc.current < INTERVAL) return;
    acc.current = 0;

    const persp = camera as THREE.PerspectiveCamera;
    const halfFov = Math.tan(((persp.fov ?? 60) * Math.PI) / 360);
    const camPos = camera.position;

    /** sprites are ranked against a shared budget, so they are gathered here
     *  and decided after the walk rather than one at a time */
    const glows: { sprite: THREE.Sprite; area: number; near: boolean }[] = [];

    scene.traverse((o) => {
      const m = o as Cullable;
      const isMesh = (m as THREE.Mesh).isMesh === true;
      const isSprite = (m as THREE.Sprite).isSprite === true;
      if (!isMesh && !isSprite) return;
      // never our business if something else is hiding it
      if (!m.visible && !ours.current.has(m)) return;

      if (m.userData.noCull) {
        // opted out (TextSprite): make sure a prior pass isn't still hiding it
        if (ours.current.delete(m)) m.visible = true;
        return;
      }

      if (isSprite) {
        const sp = m as THREE.Sprite;
        sp.getWorldPosition(pos.current);
        const d = Math.max(0.1, pos.current.distanceTo(camPos));
        const r = Math.max(sp.scale.x, sp.scale.y) * 0.5;
        const frac = r / (d * halfFov);
        glows.push({ sprite: sp, area: Math.PI * frac * frac, near: d <= GLOW_ALWAYS_WITHIN });
        return;
      }

      const geom = (m as THREE.Mesh).geometry as THREE.BufferGeometry | undefined;
      let radius: number;
      {
        if (!geom) return;
        if (!geom.boundingSphere) geom.computeBoundingSphere();
        const bs = geom.boundingSphere;
        if (!bs) return;
        // world radius: the geometry's own radius scaled by the object's scale
        const s = m.getWorldScale(pos.current);
        radius = bs.radius * Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z));
      }
      if (radius > MAX_PROP_RADIUS) {
        // structure — make sure we are not still hiding it from a previous pass
        if (ours.current.delete(m)) m.visible = true;
        return;
      }

      m.getWorldPosition(pos.current);
      const dist = pos.current.distanceTo(camPos);
      // projected height as a fraction of the viewport
      const fraction = dist <= ALWAYS_KEEP_WITHIN ? 1 : radius / (dist * halfFov);
      const want = fraction >= MIN_SCREEN_FRACTION;

      if (want) {
        if (ours.current.delete(m)) m.visible = true;
      } else if (m.visible) {
        m.visible = false;
        ours.current.add(m);
      }
    });

    // ——— spend the glow budget on the biggest contributors first ———
    glows.sort((a, b) => b.area - a.area);
    let spent = 0;
    for (const g of glows) {
      // A glow already alight keeps its place until it overruns the budget by
      // GLOW_STICKY; one currently dark has to fit inside the plain budget to
      // come back. The gap between those two thresholds is what stops the
      // sprites either side of the cutoff blinking as the camera drifts.
      const lit = g.sprite.visible;
      const ceiling = lit ? GLOW_BUDGET_SCREENS * GLOW_STICKY : GLOW_BUDGET_SCREENS;
      // a near glow is always lit and still counts against the budget, so a
      // busy foreground correctly starves the background rather than the reverse
      const keep = g.near || spent + g.area <= ceiling;
      if (keep) {
        spent += g.area;
        if (ours.current.delete(g.sprite)) g.sprite.visible = true;
      } else if (g.sprite.visible) {
        g.sprite.visible = false;
        ours.current.add(g.sprite);
      }
    }
  });

  // `size` is read so the cull re-evaluates against the current viewport
  void size;
  return null;
}
