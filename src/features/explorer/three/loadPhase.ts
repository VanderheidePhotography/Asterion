/**
 * WHAT THE HALL IS DOING WHILE THE VISITOR WAITS.
 *
 * Until this existed the wait was silent in the worst way: the code-split chunk
 * had a "Lighting the candles…" line, but the moment it resolved that line went
 * away and the visitor was left looking at an empty dark rectangle for as long
 * as it took to build a museum — which on a phone is the part that feels
 * broken. A blank screen with no explanation is indistinguishable from a crash,
 * and several rounds of this have been reported to me as exactly that.
 *
 * A module-level phase, published by the building as it goes up and read by an
 * overlay outside the canvas. Deliberately not React state — the publishers are
 * inside the r3f tree (and one of them is not in React at all) and the reader is
 * outside it, and threading context between them for a progress bar would be a
 * lot of ceremony for one string and one number.
 *
 * THE BAR IS MILESTONES, NOT A CURVE. It used to be a single number that
 * anything could nudge, and what actually moved it was a 220 ms timer easing
 * toward 0.92 — measured on a cold load, the bar walked 0.24 → 0.77 without a
 * single report from the hall, because the only real reporters (the deferred
 * courses) fired at frames 2‥6 and the veil was already gone by frame 1. It was
 * an animation wearing a progress bar's clothes.
 *
 * So progress is now a weighted sum over named milestones, each of which is a
 * thing that either has or has not happened. The weights are the share of the
 * wait each one costs, measured rather than guessed (see WORK below). Nothing
 * can invent progress except the creep, and the creep is fenced — see `creep`.
 */

import { LEAN_TEXTURES } from './textureBudget';

export interface LoadPhase {
  /** 0‥1, for the bar */
  progress: number;
  /** what is being built, in the museum's own voice */
  label: string;
  /** true once the renderer has presented a frame the visitor can see */
  painted: boolean;
}

/**
 * THE MILESTONES, IN THE ORDER THEY HAPPEN, WITH WHAT THEY COST.
 *
 * Weights are shares of a cold desktop load (first presented frame ≈ 1.3 s):
 * the chunk and the fonts are a few tens of ms each, constructing the scene is
 * the overwhelming majority, and presenting the first frame is the tail of
 * uploads and the first draw. The exact numbers matter less than their ratio —
 * what they buy is that the bar is at 0.2 when the tree starts building and not
 * before, however long that took to reach.
 *
 * THE LIST RUNS PAST THE FIRST FRAME, and did not until now. Presenting a
 * frame is not the same as being fit to look at: at that moment the labels are
 * still baking, the wings are still mounting on a phone, the scans are still
 * arriving over their painted stand-ins, and the light pool has not been
 * harvested — so the visitor was let in to watch the building finish itself,
 * which reads as an unfinished website rather than as a museum.
 *
 * So four settling milestones follow `paint`, and the veil now waits for them.
 * They are the ones that finish in a second or so. What does NOT appear here is
 * anything slow: the ten statue models that stream in after the reveal, and the
 * long tail of scans. Those dissolve in over their stand-ins instead (see
 * GLBModel), because waiting for them would hold a walkable hall behind a
 * curtain for half a minute — the exact failure the veil exists to end.
 *
 * And the whole settle is capped: see SETTLE_CAP_MS. A slow device gets its
 * doors open on time even if nothing has settled at all.
 */
/*
 * There is no milestone here for the renderer's own creation, and there was
 * one: r3f's `onCreated` sounds like it marks the GL context arriving, but it
 * is measured firing AFTER the scene tree has committed — so the bar reported
 * "laying the foundations" while the building was already up, and then jumped
 * two milestones in 19 ms. A stage that cannot be observed in its own order is
 * not a stage; its share belongs to the build it is hiding inside.
 */
const WORK = [
  { id: 'chunk', weight: 1, label: 'Unlocking the doors' },
  { id: 'fonts', weight: 1, label: 'Cutting the type' },
  { id: 'build', weight: 6, label: 'Raising the rotunda' },
  { id: 'paint', weight: 2, label: 'Lighting the candles' },
  // ——— the settle: everything between a first frame and a finished room ———
  { id: 'courses', weight: 1, label: 'Shelving the collection' },
  { id: 'labels', weight: 2, label: 'Lettering the signs' },
  { id: 'lights', weight: 1, label: 'Trimming the lamps' },
  { id: 'scans', weight: 2, label: 'Hanging the scans' },
] as const;

export type Milestone = (typeof WORK)[number]['id'];

/** the stages that precede a presented frame — always waited for */
const BEFORE_PAINT = new Set<Milestone>(['chunk', 'fonts', 'build', 'paint']);

const TOTAL = WORK.reduce((sum, w) => sum + w.weight, 0);

/**
 * HOW LONG THE SETTLE MAY HOLD THE DOORS SHUT, from the first presented frame.
 *
 * The point of waiting is a clean reveal, and the point of a cap is that a
 * clean reveal is worth about two seconds and not one second more. Whatever
 * has not settled by then keeps arriving behind an open hall — which is what
 * every arrival did before this existed, so the cap can only ever land the
 * visitor back where they already were, never worse.
 */
/*
 * SHORTER ON A PHONE, and the settle list is shorter there too — see
 * `SETTLE` below. A lean device is the one that can least afford to be held,
 * and it is the one where every stage of the settle takes longest, so a cap
 * written for a desktop turns into the whole complaint.
 */
const SETTLE_CAP_MS = LEAN_TEXTURES ? 700 : 2000;
let capTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * WHAT THE VEIL ACTUALLY WAITS FOR, which is not the whole list.
 *
 * On a desktop everything is built before the first frame, so every settle
 * milestone is about the room in front of you and waiting for all of them is
 * right.
 *
 * On a phone the building arrives in courses, and the courses are the WINGS —
 * which are down corridors and behind walls, invisible from the spawn point.
 * That is the entire premise of Deferred. Holding the doors shut until they
 * have mounted (and until every scan for them has landed) meant a visitor
 * waiting on rooms they cannot see from where they are standing, on the
 * slowest device, which is the opposite of what staged construction is for.
 *
 * So a lean device waits for what is actually in shot: the labels it decided
 * were worth baking, and the lamps. The wings keep building behind an open
 * hall, exactly as they were designed to.
 */
const SETTLE: readonly Milestone[] = LEAN_TEXTURES
  ? ['labels', 'lights']
  : ['courses', 'labels', 'lights', 'scans'];

/** which milestones are behind us */
let done = new Set<Milestone>();
/**
 * HOW FAR INTO THE CURRENT MILESTONE WE ARE PRETENDING TO BE, 0‥1.
 *
 * Building the scene is one uninterrupted block of work with no interior
 * signal — nothing can report from inside it, because nothing gets to run —
 * and several seconds of a frozen bar reads worse than no bar at all.
 *
 * So there is a creep, but it is fenced into the CURRENT milestone: it eases
 * toward that milestone's completion and can never reach it, let alone pass
 * it. The bar cannot claim the rotunda is raised until the rotunda is raised.
 * That is the whole difference from the curve this replaced, which was free to
 * saunter up to 0.92 while the hall had done nothing at all.
 */
let creep = 0;

/** does the veil wait for this stage on this device? */
export function waitsFor(id: Milestone): boolean {
  return BEFORE_PAINT.has(id) || SETTLE.includes(id);
}

/** the next stage the bar reports — only ones this device actually waits for,
 *  or the label would name a course the veil has already stopped caring about */
function next(): (typeof WORK)[number] | undefined {
  return WORK.find((w) => !done.has(w.id) && waitsFor(w.id));
}

/** is everything the VEIL waits for behind us? — a subset on lean, see SETTLE */
function open(): boolean {
  return next() === undefined;
}

/**
 * THE VEIL LIFTS WHEN THE ROOM IS FIT TO LOOK AT, not when a frame exists.
 *
 * It used to lift on `paint` alone, and that was the right call against a
 * blank screen and the wrong one against a finished museum: the frame is real,
 * but for a second after it the hall is visibly assembling — signs blank, wings
 * arriving, lamps about to be re-rigged.
 *
 * "Fit to look at" is device-dependent, though, which the first version of this
 * missed: see SETTLE. And SETTLE_CAP_MS ends the wait either way.
 */
function compute(): LoadPhase {
  const settled = WORK.reduce((sum, w) => (done.has(w.id) ? sum + w.weight : sum), 0);
  const pending = next();
  if (open()) return { progress: 1, label: 'Open', painted: true };
  const progress = (settled + (pending ? pending.weight * creep : 0)) / TOTAL;
  return {
    progress: Math.min(1, progress),
    label: pending?.label ?? 'Open',
    painted: false,
  };
}

let current: LoadPhase = compute();
const listeners = new Set<(p: LoadPhase) => void>();

export function loadPhase(): LoadPhase {
  return current;
}

export function onLoadPhase(fn: (p: LoadPhase) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function publish(): void {
  const at = compute();
  // monotonic: milestones can settle out of order (fonts often land while the
  // scene is building), and a bar that goes backwards reads as a fault even
  // when the thing behind it is healthy
  if (at.progress < current.progress && !at.painted) at.progress = current.progress;
  current = at;
  listeners.forEach((fn) => fn(at));
}

/** has this stage happened yet? */
export function milestoneDone(id: Milestone): boolean {
  return done.has(id);
}

/** something the hall was waiting on has happened */
export function reportMilestone(id: Milestone): void {
  if (done.has(id)) return;
  done.add(id);
  creep = 0;
  publish();
}

/**
 * Ease into the milestone in flight, so the bar is never still. Called on a
 * timer by the veil; deliberately cannot complete anything.
 */
export function creepTick(): void {
  if (current.painted) return;
  creep += (1 - creep) * 0.08;
  publish();
}

/**
 * The renderer has presented a frame. That starts the settle rather than
 * ending the wait — and starts the clock that ends the settle whatever else
 * happens, so nothing downstream can hold the doors shut by never reporting.
 */
export function reportPainted(): void {
  if (done.has('paint')) return;
  reportMilestone('paint');
  if (capTimer) clearTimeout(capTimer);
  capTimer = setTimeout(() => {
    capTimer = null;
    for (const w of WORK) done.add(w.id);
    publish();
  }, SETTLE_CAP_MS);
}

/** a fresh visit (the module outlives a client-side route change) */
export function resetLoadPhase(): void {
  done = new Set<Milestone>();
  creep = 0;
  if (capTimer) {
    clearTimeout(capTimer);
    capTimer = null;
  }
  // we are only ever called from the hall's own render, which cannot happen
  // until its chunk has been fetched and evaluated
  done.add('chunk');
  if (fontsReady()) done.add('fonts');
  current = compute();
}

/**
 * THE FONTS ARE A REAL PART OF THE WAIT, not a formality.
 *
 * Every one of the museum's ~969 labels refuses to bake until the real face has
 * arrived (see TextSprite) — baking in a fallback and re-baking on arrival was
 * 1,887 canvases and double the peak texture memory. So on a cold cache the
 * type is genuinely load-bearing for how soon the hall can be lettered, and it
 * is the one milestone here that is pure network.
 */
/**
 * Note this asks for the LABEL face, not `document.fonts.ready` — the same
 * narrowing TextSprite makes, and for the same reason: the page also loads the
 * two faces an opened grimoire's pages are set in, and the hall does not wait
 * on those, so a bar that did would be reporting somebody else's download.
 */
const LABEL_FACE = "600 64px 'Cormorant Garamond'";

function fontsReady(): boolean {
  return typeof document !== 'undefined' && Boolean(document.fonts?.check(LABEL_FACE));
}

if (typeof document !== 'undefined' && document.fonts) {
  void document.fonts
    .load(LABEL_FACE)
    .catch(() => undefined)
    .then(() => reportMilestone('fonts'));
}
