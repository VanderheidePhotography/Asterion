/**
 * WHAT THE HALL IS DOING WHILE THE VISITOR WAITS.
 *
 * Until now the wait was silent in the worst way: the code-split chunk had a
 * "Lighting the candles…" line, but the moment it resolved that line went
 * away and the visitor was left looking at an empty dark rectangle for as
 * long as it took to build a museum — which on a phone is the part that feels
 * broken. A blank screen with no explanation is indistinguishable from a
 * crash, and several rounds of this have been reported to me as exactly that.
 *
 * This is the smallest thing that fixes it: a module-level phase, published
 * by the courses as they arrive and read by an overlay outside the canvas.
 * Deliberately not React state — the publishers are inside the r3f tree and
 * the reader is outside it, and threading context between them for a progress
 * bar would be a lot of ceremony for one string and one number.
 */

export interface LoadPhase {
  /** 0‥1, for the bar */
  progress: number;
  /** what is being built, in the museum's own voice */
  label: string;
  /** true once the renderer has presented a frame the visitor can see */
  painted: boolean;
}

const PHASES: { at: number; label: string }[] = [
  { at: 0.15, label: 'Unlocking the doors' },
  { at: 0.4, label: 'Raising the rotunda' },
  { at: 0.6, label: 'Lighting the candles' },
  { at: 0.78, label: 'Shelving the collection' },
  { at: 0.92, label: 'Lettering the signs' },
];

let current: LoadPhase = { progress: 0.05, label: 'Unlocking the doors', painted: false };
const listeners = new Set<(p: LoadPhase) => void>();

export function loadPhase(): LoadPhase {
  return current;
}

export function onLoadPhase(fn: (p: LoadPhase) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function publish(next: LoadPhase): void {
  current = next;
  listeners.forEach((fn) => fn(next));
}

/**
 * Advance the bar. Monotonic on purpose: courses can finish in a different
 * order than they were queued, and a progress bar that goes backwards reads
 * as a fault even when the thing behind it is healthy.
 */
export function reportProgress(progress: number): void {
  if (progress <= current.progress) return;
  const phase = [...PHASES].reverse().find((p) => progress >= p.at);
  publish({ ...current, progress: Math.min(1, progress), label: phase?.label ?? current.label });
}

/** the renderer has presented a frame — the veil can go */
export function reportPainted(): void {
  if (current.painted) return;
  publish({ progress: 1, label: 'Open', painted: true });
}

/** a fresh visit (the module outlives a client-side route change) */
export function resetLoadPhase(): void {
  current = { progress: 0.05, label: 'Unlocking the doors', painted: false };
}
