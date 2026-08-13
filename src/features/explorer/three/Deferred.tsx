import { useEffect, useState, type ReactNode } from 'react';
import { LEAN_TEXTURES } from './textureBudget';
import { reportProgress } from './loadPhase';

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
 */
export function Deferred({
  /** how many painted frames to wait before this course is built */
  frames = 1,
  /** where this course leaves the loading bar, 0‥1 */
  progress,
  children,
}: {
  frames?: number;
  progress?: number;
  children: ReactNode;
}) {
  const [ready, setReady] = useState(!LEAN_TEXTURES);

  useEffect(() => {
    if (ready) return;
    let left = frames;
    let handle = 0;
    const tick = () => {
      left -= 1;
      if (left <= 0) {
        setReady(true);
        if (progress !== undefined) reportProgress(progress);
      } else handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [ready, frames, progress]);

  return ready ? <>{children}</> : null;
}
