import { useEffect, useState, type ReactNode } from 'react';
import { LEAN_TEXTURES } from './textureBudget';
import { loadPhase, onLoadPhase } from './loadPhase';

/**
 * BUILD THE ROOM YOU ARE STANDING IN FIRST.
 *
 * Everything in this museum used to be constructed before a single frame was
 * presented: the rotunda, the entrance, the apse, and then four wings of
 * bookcases with a thousand grimoires on them. On a desk that is a moment. On
 * a phone it is the whole complaint — the visitor watches a loading line while
 * the machine assembles rooms they cannot see yet, because the wings are down
 * corridors and behind walls.
 *
 * So on lean devices the scene arrives in courses. The rotunda paints, the
 * visitor is standing in a building and can already look around, and the
 * wings' architecture and then their contents follow over the next handful of
 * frames. The TOTAL work is unchanged — this buys nothing on a benchmark —
 * but the time before the doors open is a fraction of it, and that is the
 * number a person actually experiences.
 *
 * Frames rather than milliseconds, deliberately. A timer fires whether or not
 * the browser managed to paint; a frame callback cannot run until it has. On a
 * slow device that difference is the whole mechanism: each course waits for
 * the previous one to be on screen instead of piling onto the same stall.
 *
 * Desktop mounts everything immediately, exactly as before.
 *
 * A COURSE DOES NOT DRIVE THE LOADING BAR, and used to claim to. Each one
 * carried a `progress` prop that reported a milestone as it landed — dead code
 * in both directions: on desktop nothing is deferred, so none of them ever
 * fired, and on a phone every one of them fires AFTER the first presented
 * frame, which is the moment the veil comes down. The bar those numbers were
 * addressed to had already gone. The courses are, correctly, what happens
 * once the visitor is already standing in the hall.
 */
/**
 * HOLD SOMETHING BACK UNTIL THE DOORS ARE OPEN — lean devices only.
 *
 * A course (above) is staged across a handful of frames and still lands inside
 * the wait. This is for work that should not be in the wait at all: fourteen
 * sculpted glTF figures, about a megabyte each, meshopt-decoded on the main
 * thread, uploaded and linked — while the visitor is looking at a loading
 * screen and the procedural stone figures that stand in for them are already
 * built and already correct.
 *
 * Nothing is lost by waiting: the stand-in is what the niche shows either way
 * until the model lands, and GLBModel dissolves the carving up through it
 * (see `beneath`), so a figure arriving after the reveal looks like a statue
 * gaining its detail rather than like a page still loading.
 *
 * Desktop is untouched: it has the headroom, and holding a model there would
 * only make an arrival visible that currently is not.
 */
export function useHeldForReveal(): boolean {
  const [held, setHeld] = useState(LEAN_TEXTURES && !loadPhase().painted);
  useEffect(() => {
    if (!held) return;
    return onLoadPhase((p) => {
      if (p.painted) setHeld(false);
    });
  }, [held]);
  return held;
}

/**
 * HOW MANY COURSES ARE STILL OUTSTANDING — for the veil, which waits for them.
 *
 * A course that lands after the reveal is a wing appearing around a visitor who
 * is already standing in the hall, and that is precisely the "still loading in"
 * look this is now asked to avoid. So the veil holds until every course has
 * mounted (capped in loadPhase, so a stall cannot lock the doors).
 *
 * On desktop nothing is deferred and nothing ever registers, so `pending` stays
 * at zero and the milestone is reported by the first check that runs.
 */
let pending = 0;
let started = false;

/** called by the veil once a frame has been presented */
export function coursesSettled(): boolean {
  return pending === 0 || !started;
}

export function Deferred({
  /** how many painted frames to wait before this course is built */
  frames = 1,
  children,
}: {
  frames?: number;
  children: ReactNode;
}) {
  const [ready, setReady] = useState(!LEAN_TEXTURES);

  useEffect(() => {
    if (ready) return;
    pending += 1;
    started = true;
    let left = frames;
    let handle = 0;
    let counted = false;
    const tick = () => {
      left -= 1;
      if (left <= 0) {
        counted = true;
        pending -= 1;
        setReady(true);
      } else handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(handle);
      if (!counted) pending -= 1;
    };
  }, [ready, frames]);

  return ready ? <>{children}</> : null;
}
