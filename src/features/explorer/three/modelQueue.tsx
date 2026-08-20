import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { LEAN_TEXTURES } from './textureBudget';

/**
 * WHICH CARVING IS ALLOWED TO DOWNLOAD NEXT.
 *
 * ── the problem ────────────────────────────────────────────────────────────
 *
 * Fourteen sculpted figures stand in this building and each is about a
 * megabyte: half meshopt-compressed geometry, half JPEG maps. Thirteen of them
 * are held out of the load entirely on a phone (see `useHeldForReveal`) and
 * released together on the frame the doors open — so the browser is handed
 * thirteen simultaneous requests for thirteen megabytes.
 *
 * On a desk that is a blink. On a phone on mobile data it is the whole
 * complaint, and the reason is that PARALLEL REQUESTS SHARE THE PIPE. Thirteen
 * downloads over one connection do not finish one after another; they all
 * finish at the end, together, each running at a thirteenth of the available
 * speed. So there is no moment where the visitor has SOME of their statues —
 * every niche in the building holds a crude procedural figure for the entire
 * download, and then all thirteen swap at once. The staging was real work and
 * the visitor got none of its benefit, because the thing that was staged was
 * the mounting and not the fetching.
 *
 * ── what this does ─────────────────────────────────────────────────────────
 *
 * A gate. A figure asks for a slot; only MAX_IN_FLIGHT of them hold one at a
 * time, and the slots go to whatever the visitor is actually looking at. The
 * figure in front of you now has the whole connection to itself and lands in a
 * second or two rather than in thirty, and the ones behind you and across the
 * building arrive quietly while you read it.
 *
 * The ranking is deliberately the same idea the light pool uses: score what a
 * thing is worth by how much of it reaches the camera. Distance alone is the
 * wrong measure on arrival, when the librarian at the far end of the axis is
 * the thing you are looking straight at and two figures on the drum behind
 * your shoulders are nearer.
 *
 * Nothing here is a cache and nothing here loads anything. It only decides
 * WHEN a component is allowed to mount the loader it was always going to
 * mount, so a figure that has been admitted is never un-admitted — taking a
 * slot back would unmount a carving that had already arrived.
 */

/*
 * TWO AT A TIME, and the number matters in both directions.
 *
 * At one, the pipe goes idle for a round trip between every figure and the
 * total takes noticeably longer. Much above three and the sharing problem
 * this exists to solve simply comes back at a smaller scale. Two keeps the
 * connection busy while still giving the figure in front of you the large
 * majority of the bandwidth.
 *
 * A desktop admits everything at once, exactly as before: it has the pipe and
 * the CPU, and the whole point of the queue is to ration a resource that is
 * only scarce on a phone.
 */
export const MAX_IN_FLIGHT = LEAN_TEXTURES ? 2 : Infinity;

/**
 * HOW LONG A SLOT MAY BE HELD BEFORE IT IS TAKEN BACK.
 *
 * The queue advances when an admitted figure reports that it has arrived. If
 * one never does — a 404, a dead connection, a decode that throws inside the
 * loader — every figure behind it in the queue would keep its procedural
 * stand-in for the rest of the visit. That is the exact failure this file
 * exists to prevent, so it must not be able to cause it.
 *
 * A slot is therefore on a timer as well. Twenty seconds is far longer than a
 * megabyte takes on any connection worth waiting for, and the cost of being
 * wrong is only that a second figure starts downloading alongside a slow one.
 */
const SLOT_TIMEOUT_MS = 20_000;

/** what being out of shot adds to a figure's distance when ranking. Larger
 *  than the building is wide, so no figure behind you ever outranks one you
 *  can see, however close it is standing. */
const OUT_OF_SIGHT = 200;

interface Entry {
  /** where the figure stands, for ranking */
  pos: THREE.Vector3;
  /**
   * Let through the gate. Never goes back to false: the component has mounted
   * its loader by now, and taking the permission away would unmount a carving
   * that may already have arrived.
   */
  admitted: boolean;
  /**
   * Actually occupying one of the MAX_IN_FLIGHT slots right now.
   *
   * Separate from `admitted` because the two stop being the same thing the
   * moment a download finishes: a figure that has landed is admitted for ever
   * and holds nothing. Folding them into one flag meant the arrival and the
   * safety timeout could each decrement `inFlight` for the same figure, and a
   * queue that double-counts releases hands out slots it does not have.
   */
  holding: boolean;
  /** told the component it may mount */
  wake: () => void;
  timer: ReturnType<typeof setTimeout> | null;
}

const waiting = new Map<string, Entry>();
let inFlight = 0;

/** give the slot back, once, whoever asks and however many times */
function release(e: Entry): void {
  if (!e.holding) return;
  e.holding = false;
  if (e.timer) clearTimeout(e.timer);
  e.timer = null;
  inFlight = Math.max(0, inFlight - 1);
}

/** the carving has arrived and is on screen — hand its slot to the next one */
export function reportModelReady(id: string): void {
  const e = waiting.get(id);
  if (!e) return;
  release(e);
  // it will never need ranking again, and leaving it in the map would make
  // every future pump walk a list of figures that are already standing
  waiting.delete(id);
}

/** a figure joins the queue */
export function registerModelSlot(
  id: string,
  x: number,
  y: number,
  z: number,
  wake: () => void,
): void {
  waiting.set(id, {
    pos: new THREE.Vector3(x, y, z),
    admitted: false,
    holding: false,
    wake,
    timer: null,
  });
}

/** it left the scene — give back its slot whether or not it ever used one */
export function unregisterModelSlot(id: string): void {
  const e = waiting.get(id);
  if (!e) return;
  release(e);
  waiting.delete(id);
}

/** how many figures hold a slot right now */
export function modelsInFlight(): number {
  return inFlight;
}

/** start from nothing — for the tests, which share one module instance */
export function resetModelQueue(): void {
  for (const e of waiting.values()) if (e.timer) clearTimeout(e.timer);
  waiting.clear();
  inFlight = 0;
}

function admit(e: Entry): void {
  e.admitted = true;
  e.holding = true;
  inFlight += 1;
  e.timer = setTimeout(() => release(e), SLOT_TIMEOUT_MS);
  e.wake();
}

/**
 * Hand out whatever slots are free, nearest-in-view first.
 *
 * Called from the frame loop a few times a second rather than every frame:
 * the answer cannot change faster than a visitor can walk, and ranking a
 * dozen entries against a camera is not work worth doing sixty times a second
 * on the device this is for.
 */
/* `limit` is a parameter only so the test can pin it: `MAX_IN_FLIGHT` is
 * Infinity off a phone, and a test running in Node is by definition off a
 * phone, so a queue that read the constant directly could not be exercised at
 * all in the one place it can be exercised deterministically. */
export function pumpModelQueue(camera: THREE.Camera, limit: number = MAX_IN_FLIGHT): void {
  if (inFlight >= limit) return;
  const eye = camera.position;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const toIt = new THREE.Vector3();

  while (inFlight < limit) {
    let bestId: string | null = null;
    let bestScore = Infinity;
    for (const [id, e] of waiting) {
      if (e.admitted) continue;
      toIt.subVectors(e.pos, eye);
      const dist = toIt.length();
      /*
       * EVERYTHING YOU CAN SEE COMES FIRST, nearest first; everything else
       * after it, nearest first. The penalty is additive and larger than the
       * building, which is what makes those two groups rather than one blurred
       * ordering — a multiplier was tried first and it quietly re-sorted them
       * together, so a figure four metres behind your shoulders outranked the
       * librarian you were walking straight at sixteen metres away.
       *
       * `> 0.15` rather than a real frustum test on purpose: a figure just off
       * the edge of the screen is about to be on it, a visitor in a rotunda
       * turns constantly, and an exact test would re-sort the queue on every
       * glance.
       */
      const facing = toIt.normalize().dot(forward); // 1 dead ahead, −1 behind
      const score = dist + (facing > 0.15 ? 0 : OUT_OF_SIGHT);
      if (score < bestScore) {
        bestScore = score;
        bestId = id;
      }
    }
    if (!bestId) return;
    admit(waiting.get(bestId)!);
  }
}

/**
 * Ask for permission to mount a sculpted model, and get told when it is given.
 *
 * Returns false until this figure is at the front of the queue. The caller
 * keeps showing whatever it was showing — for every figure in this building
 * that is the procedural carving that stands in the niche anyway, so a figure
 * waiting its turn looks exactly like a figure whose model has not landed yet,
 * which is what it is.
 *
 * Once true it never goes back to false: see the note at the top of the file.
 */
export function useModelSlot(id: string, at: [number, number], y = 0): boolean {
  const [admitted, setAdmitted] = useState(MAX_IN_FLIGHT === Infinity);
  const x = at[0];
  const z = at[1];

  /*
   * `admitted` IS DELIBERATELY NOT A DEPENDENCY HERE, and getting that wrong
   * quietly disabled the whole queue the first time. With it in the list, being
   * admitted changes the state, which re-runs the effect, which runs the
   * CLEANUP — handing the slot straight back on the same tick it was granted.
   * `inFlight` fell to zero immediately, the gate admitted two more a quarter
   * of a second later, and all thirteen were through inside two seconds: the
   * original thundering herd with extra steps.
   *
   * A slot is given up by exactly two things: the model reporting that it has
   * arrived, and this component unmounting. Neither is a state change here.
   */
  useEffect(() => {
    if (MAX_IN_FLIGHT === Infinity) return;
    registerModelSlot(id, x, y, z, () => setAdmitted(true));
    return () => unregisterModelSlot(id);
  }, [id, x, y, z]);

  return admitted;
}

/**
 * The thing that turns the crank. One per scene, inside the canvas.
 *
 * Separate from the queue itself because the queue is a plain module — the
 * figures that read it are spread across three files and several Suspense
 * boundaries, and threading a context through all of them to deliver a camera
 * position would be a great deal of ceremony for one `useFrame`.
 */
export function ModelQueue() {
  const camera = useThree((s) => s.camera);
  const next = useRef(0);
  useFrame((_, dt) => {
    next.current -= dt;
    if (next.current > 0) return;
    next.current = 0.25;
    pumpModelQueue(camera);
  });
  return null;
}
