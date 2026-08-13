import { useRef } from 'react';
import * as THREE from 'three';
import { LEAN_TEXTURES } from './textureBudget';
import { useFrame, useThree } from '@react-three/fiber';
import { coursesSettled } from './Deferred';
import { reportMilestone } from './loadPhase';

/**
 * Evaluate a FIXED, SMALL number of point lights per fragment, whichever ones
 * the visitor can actually see.
 *
 * This is the fix for the dominant cost. Measured on the user's own machine:
 * turning every practical off lands the frame on exactly
 * the same number as replacing every material in the building with one flat
 * unlit shader — i.e. the whole of shading IS the lights. three.js forward-
 * renders, so all ~35 point lights are evaluated on every fragment of every
 * material, whether or not they reach it. A candle with `distance: 0.8` on a
 * table in a wing you cannot see costs precisely as much per pixel as the
 * chandelier overhead.
 *
 * The obvious fix — turn distant lights off — is FORBIDDEN here, and this is the
 * single most important thing to understand about this file. The number of
 * visible lights is a shader `#define` (NUM_POINT_LIGHTS), so changing it
 * relinks every material in the museum: measured at a 460 ms freeze, worst case
 * 3 SECONDS. A previous `lightBudget.tsx` did exactly that and had to be
 * deleted; `nicheLight.tsx` did it accidentally and was the real cause of the
 * "stutters when I walk down a hallway" reports. See the stutter rule there.
 *
 * So the count NEVER CHANGES. A fixed pool of POOL_SIZE point lights is created
 * once and lives forever. Every frame each pool light is REPOSITIONED and
 * RECOLOURED to impersonate whichever real practical currently matters most.
 * Position, colour, distance and decay are per-light UNIFORMS — free to change,
 * every frame, forever. Only the count is a define. The whole technique is
 * living inside that distinction.
 *
 * WHAT THIS COSTS VISUALLY, honestly: a practical that loses its slot stops
 * lighting the room. The ranking is built so that the ones which lose are the
 * ones contributing least — a light is scored by how much of its influence
 * sphere actually reaches the camera — and a slot always CROSS-FADES rather
 * than cutting, so a candle dims out over ~0.4 s as you walk away from it
 * instead of popping. At POOL_SIZE 12 in a building whose rooms are
 * compartmented, what you lose is mostly light from behind walls.
 */

/**
 * How many point lights the shader is compiled for, FOREVER. This is the only
 * thing in this file that costs per-fragment time, and it is the dial for
 * trading frame rate against fidelity.
 *
 * Set by A/B screenshot from the spawn point, against the unpooled scene:
 *
 *   12 — visibly darker. The two apse statues lose their key lights to nearer,
 *        brighter sources and the flanking shelves go flat. Too far.
 *   18 — matches the unpooled frame closely; statues, shelves and the drum all
 *        read as before. Chosen.
 *   35 — every practical resident, i.e. the original scene.
 *
 * 18 point + 4 spot + 2 directional + hemi + ambient = 26 lights per fragment,
 * against 43 before.
 */
const POOL_SIZE = LEAN_TEXTURES ? 10 : 18;

/*
 * TEN ON A PHONE, and the note above about 12 being "visibly darker" is why
 * this is not a free cut.
 *
 * That A/B was run at desktop exposure. The lighting cost here is per
 * fragment and per material bind, so it is the dominant term on a CPU an
 * order of magnitude slower — halving the pool is the largest single thing
 * available to an A13, and everything cheaper has already been done.
 *
 * What is lost is light from BEHIND WALLS first: the ranking scores a
 * practical by how much of its influence sphere actually reaches the camera,
 * so the slots go to what you can see. What that costs on a phone is the
 * secondary wash from candles two rooms away — the ones lighting the wall you
 * are standing at keep their slots, and every slot still cross-fades rather
 * than popping. The exposure lift below pays back the general dimming.
 */

/** one harvest, at one moment, so the relink is paid exactly once. Lights that
 *  mount later (an orrery plate the visitor switches to) are left alone: they
 *  already relink on mount today, and there are only ever two of them.
 *
 *  IT USED TO BE AT 5.0 s, behind the arrival card, on the reasoning that a
 *  freeze is invisible there. Two things had changed since: phones skip the
 *  arrival glide entirely, and the veil now lifts on the first presented frame
 *  — so 5 s put the one unavoidable relink, AND the lighting change that comes
 *  with re-rigging 35 practicals onto 18 slots, squarely in front of a visitor
 *  already walking the hall. It is the "still loading in" complaint in its most
 *  visible form: the room changes its lighting while you stand in it.
 *
 *  Now it happens as early as it possibly can — the moment every deferred
 *  course has mounted, so nothing is missed, with a floor to let the first
 *  frames through — and the veil holds until it is done (see loadPhase). The
 *  relink is paid behind the curtain, which is what "behind the intro card"
 *  was reaching for in the first place. */
const HARVEST_FLOOR = 0.25;

/** seconds between re-rankings. The ranking is a sort over ~35 items, but
 *  running it every frame makes slots thrash between near-equal candidates. */
const RANK_INTERVAL = 0.15;

/** seconds for a slot to fade out its old light and fade in its new one */
const FADE = 0.4;

/**
 * How much better a challenger must score than the light already holding a slot
 * before the slot is handed over. Without this, two chandeliers scoring within
 * a percent of each other trade the same slot back and forth every RANK_INTERVAL
 * and the room reads as flickering — each swap is a full 0.4 s fade to black and
 * back. Candle flicker alone is ±17 % (see `Chandelier` in furniture.tsx), so the
 * margin has to clear that comfortably.
 */
const HYSTERESIS = 1.6;

/**
 * seconds for a source's ranking intensity to follow its real one. Practicals
 * animate their intensity hard — the chandeliers flicker ±17 % at up to 27 Hz —
 * and ranking on the instantaneous value makes the ORDER flicker at the same
 * rate. Ranking on a ~1 s average keeps "which lights matter" a property of
 * where the visitor is standing, not of which frame it is; the pool still
 * *drives* the live value, so the flicker itself is never lost.
 */
const SMOOTH_TAU = 1.0;

/**
 * How much of a light actually lands on the camera, matching three.js's own
 * windowed falloff for a point light with a finite `distance`.
 *
 * The old score was `intensity * reach / (d² + 1)`, which is monotonic in d
 * forever — so a chandelier 25 m off scored below a candle 3 m off even though
 * the candle's reach is 0.8 m and it contributes LITERALLY ZERO at that range.
 * That is the whole "distant chandeliers go dark" bug: slots were being spent on
 * sources that cannot light anything, and the fixtures that could lost them.
 * Past its own `distance` a point light is worth exactly nothing HERE, and the
 * window term below is what says so.
 *
 * "Here" is load-bearing, which is why this is a ranking term and not a filter.
 * A point light also lights SURFACES, and a candle across the room still lights
 * the table it stands on in full view of a visitor standing outside its reach.
 * So out-of-reach sources fall to the back of the queue — they never take a slot
 * from a fixture that reaches the visitor — but they still get the slots nobody
 * else wanted. See TAIL.
 */
/**
 * Ordering weight for a source that reaches nothing where the visitor stands.
 * Kept far below any real contribution — a chandelier 25 m off scores ~2e-2
 * here, a 0.8 m candle 3 m off ~6e-5 — so this only ever sorts the out-of-reach
 * lights AMONG THEMSELVES, nearest first, for the slots left over once every
 * fixture that does reach the visitor has one.
 */
const TAIL = 1e-4;

function reachAtCamera(d: number, reach: number, decay: number) {
  if (reach > 0) {
    if (d >= reach) return 0;
    const w = Math.max(0, 1 - Math.pow(d / reach, 4));
    return (w * w) / Math.pow(Math.max(d, 1), decay);
  }
  return 1 / Math.pow(Math.max(d, 1), decay);
}

/**
 * A practical that has been taken out of the render but is still ALIVE.
 *
 * The original light object is kept, merely detached from the graph, and its
 * colour and intensity are read back every frame rather than snapshotted. This
 * matters more than it looks: the components that own these lights animate them
 * — candles flicker, `nicheLight` fades its keys to near zero rather than
 * toggling `visible` (see the stutter rule) — and they hold r3f refs straight to
 * these objects, so they go on writing to them whether the light is in the scene
 * or not. Freezing the values at harvest time would put out every flame in the
 * building and leave the niches stuck at whatever they happened to be.
 *
 * What the detached light CANNOT do is update its own world matrix, so a
 * separate anchor is left behind in its parent to report position — which also
 * means a light on something that moves still tracks it.
 */
type Source = {
  anchor: THREE.Object3D;
  light: THREE.PointLight;
  /** intensity with the flame taken off it — see `smooth` */
  smoothed: number;
};

type Slot = {
  light: THREE.PointLight;
  source: Source | null;
  /** the source this slot is fading towards, once the current one is out */
  next: Source | null;
  /** 0 = dark, 1 = fully impersonating `source` */
  fade: number;
};

const world = new THREE.Vector3();

export function LightPool({ enabled = true, size = POOL_SIZE }: { enabled?: boolean; size?: number }) {
  const { scene, camera } = useThree();
  const elapsed = useRef(0);
  const sinceRank = useRef(0);
  const sources = useRef<Source[] | null>(null);
  const slots = useRef<Slot[]>([]);

  useFrame((_, delta) => {
    if (!enabled) return;
    elapsed.current += delta;

    /**
     * TAKE EVERY POINT LIGHT OUT OF THE GRAPH AND KEEP ITS RECIPE.
     *
     * INCREMENTAL, which is what lets it happen early. The first version
     * harvested once and waited for every deferred course to mount first —
     * otherwise a wing chandelier arriving later stays unpooled forever, which
     * is the per-fragment cost this file exists to remove. On a phone that
     * meant waiting SIX PAINTED FRAMES for the stacks before the lamps could be
     * rigged, and the veil waited on the lamps, so a slow first few frames
     * turned directly into seconds of loading screen.
     *
     * So it harvests what is standing now, and adopts stragglers as they mount.
     * Adopting is free: the pool's SIZE is the shader define, and that never
     * changes — a new source only joins the ranking. And because a light
     * mounted in one commit is detached in the next frame's callback, before
     * the renderer has drawn with it, the light count three.js sees never moves
     * and the relink storm never happens either.
     */
    const first = !sources.current;
    if (first && elapsed.current < HARVEST_FLOOR) return;
    if (first || !coursesSettled()) {
      const found: Source[] = sources.current ?? [];
      const taken: THREE.PointLight[] = [];
      scene.traverse((o) => {
        const l = o as THREE.PointLight;
        if (!l.isPointLight || l.userData.pooled || l.userData.noPool) return;
        taken.push(l);
      });
      for (const l of taken) {
        const parent = l.parent;
        if (!parent) continue;
        // leave a marker where the light stood. It inherits the host's
        // transform, so a light on a moving prop still reports the truth.
        const anchor = new THREE.Object3D();
        anchor.position.copy(l.position);
        anchor.name = 'pooled-light-anchor';
        parent.add(anchor);
        found.push({ anchor, light: l, smoothed: l.visible ? l.intensity : 0 });
        parent.remove(l);
      }
      sources.current = found;
      reportMilestone('lights');
    }
    if (first) {
      for (let i = 0; i < size; i++) {
        const light = new THREE.PointLight(0xffffff, 0, 10, 2);
        light.userData.pooled = true;
        light.castShadow = false;
        scene.add(light);
        slots.current.push({ light, source: null, next: null, fade: 0 });
      }
      return;
    }

    const all = sources.current;
    if (!all || all.length === 0) return;

    // ——— rank: how much of each light's reach actually gets to the camera ———
    sinceRank.current += delta;
    if (sinceRank.current >= RANK_INTERVAL) {
      const dt = sinceRank.current;
      sinceRank.current = 0;

      // whoever is holding a slot right now, and is not already on its way out
      const incumbent = new Set<Source>();
      for (const slot of slots.current) if (slot.source && !slot.next) incumbent.add(slot.source);

      const scored = all.map((s) => {
        s.anchor.getWorldPosition(world);
        const d = world.distanceTo(camera.position);
        // follow the live value, but slowly: a candle guttering out or a niche
        // key fading should lose its slot, a flame's 27 Hz flicker should not
        // reorder anything. See SMOOTH_TAU.
        const live = s.light.visible ? s.light.intensity : 0;
        const k = 1 - Math.exp(-dt / SMOOTH_TAU);
        s.smoothed += (live - s.smoothed) * k;
        // what this light actually delivers where the visitor is standing, plus
        // a tail so the ones that deliver nothing here still queue sensibly
        const score =
          s.smoothed * (reachAtCamera(d, s.light.distance, s.light.decay || 2) + TAIL / (d * d + 1));
        return { s, score: incumbent.has(s) ? score * HYSTERESIS : score };
      });
      scored.sort((a, b) => b.score - a.score);
      // an unlit source is worth less than an empty slot; everything else takes
      // one, in order, until the pool is full
      const want = scored.filter((x) => x.score > 0).slice(0, size).map((x) => x.s);

      // keep a slot on its current light if that light is still wanted, so the
      // pool does not reshuffle wholesale every time the ranking wobbles
      const held = new Set<Source>();
      for (const slot of slots.current) {
        if (slot.source && want.includes(slot.source)) held.add(slot.source);
        else slot.next = null;
      }
      const free = want.filter((s) => !held.has(s));
      for (const slot of slots.current) {
        if (slot.source && held.has(slot.source)) continue;
        slot.next = free.shift() ?? null;
      }
    }

    // ——— drive: fade out, swap, fade in. Never cut. ———
    for (const slot of slots.current) {
      const wantsSwap = slot.next !== null && slot.next !== slot.source;
      const losing = slot.source === null || wantsSwap;

      if (losing && slot.fade > 0) {
        slot.fade = Math.max(0, slot.fade - delta / FADE);
      } else if (!losing) {
        slot.fade = Math.min(1, slot.fade + delta / FADE);
      }

      // fully dark: safe to become something else
      if (slot.fade === 0 && wantsSwap) {
        slot.source = slot.next;
        slot.next = null;
      }

      const s = slot.source;
      if (!s) {
        slot.light.intensity = 0;
        continue;
      }
      s.anchor.getWorldPosition(world);
      slot.light.position.copy(world);
      slot.light.color.copy(s.light.color);
      slot.light.distance = s.light.distance;
      slot.light.decay = s.light.decay;
      slot.light.intensity = (s.light.visible ? s.light.intensity : 0) * slot.fade;
    }
  });

  return null;
}
