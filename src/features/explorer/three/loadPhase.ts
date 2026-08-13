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
 * NOT INCLUDED, on purpose: the scans and the label bakes. Both keep arriving
 * for many seconds after the doors open — a surface swaps its painted stand-in
 * for a photographed one, a sign fades up — and the veil deliberately does not
 * wait for them. A bar that waited for every byte would hold a walkable hall
 * behind a curtain for half a minute.
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
] as const;

export type Milestone = (typeof WORK)[number]['id'];

const TOTAL = WORK.reduce((sum, w) => sum + w.weight, 0);

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

function next(): (typeof WORK)[number] | undefined {
  return WORK.find((w) => !done.has(w.id));
}

/**
 * THE FRAME IS THE END OF THE WAIT, not the completion of the list.
 *
 * `painted` is tied to that one milestone rather than to every milestone being
 * settled, because the two can arrive out of order and the visitor's eyes side
 * with the frame. Anything still outstanding when the hall is drawn is, by
 * definition, no longer something they are waiting behind a curtain for.
 */
function compute(): LoadPhase {
  if (done.has('paint')) return { progress: 1, label: 'Open', painted: true };
  const settled = WORK.reduce((sum, w) => (done.has(w.id) ? sum + w.weight : sum), 0);
  const pending = next();
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

/** the renderer has presented a frame — the veil can go */
export function reportPainted(): void {
  reportMilestone('paint');
}

/** a fresh visit (the module outlives a client-side route change) */
export function resetLoadPhase(): void {
  done = new Set<Milestone>();
  creep = 0;
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
function fontsReady(): boolean {
  return typeof document !== 'undefined' && document.fonts?.status === 'loaded';
}

if (typeof document !== 'undefined' && document.fonts) {
  void document.fonts.ready.then(() => reportMilestone('fonts'));
}
