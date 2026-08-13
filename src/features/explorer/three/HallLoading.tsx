import { useEffect, useLayoutEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { creepTick, loadPhase, onLoadPhase, reportMilestone, reportPainted, type LoadPhase } from './loadPhase';

/**
 * The line held while the hall is built. Long enough to be worth reading, and
 * about the place rather than about software — nobody wants a percentage from
 * a museum, but they will wait for one if the wait is furnished.
 */
const LORE = [
  '“That which is below is like that which is above.” — the Emerald Tablet',
  '“Know thyself, and thou shalt know the universe and the gods.” — the temple at Delphi',
  '“Pray, read, read, read again, labour, and thou shalt find.” — the Mutus Liber',
  '“The wise soul rules the stars.” — an alchemists’ motto',
  '“Nature delights in nature; nature conquers nature.” — pseudo-Democritus',
];

/**
 * INSIDE the canvas: the only honest signal that the hall is ready.
 *
 * Not a timer, not a React commit, not an asset count — the frame the renderer
 * actually presents. Everything else can complete while the screen is still
 * blank, which is precisely the failure this whole overlay exists to end.
 */
export function PaintWatch() {
  useFrame(() => reportPainted());
  return null;
}

/**
 * The scene tree is up: every course of the building has rendered and every
 * material, geometry and texture it asked for exists. Not the same thing as
 * being on screen — nothing has been drawn yet, which is the next milestone
 * and the one the veil actually waits for.
 *
 * Mounted LAST inside the scene, because a child's effect runs before its
 * parent's and this has to be the effect that runs after all of them.
 *
 * A LAYOUT effect, not a passive one — measured, and the difference is 1.4
 * seconds. Passive effects flush whenever React next gets a turn, which on a
 * cold load is well after r3f's loop has already drawn the hall: the trace had
 * `paint` landing before `build`, so the bar sat at 5/11 with the museum
 * already on screen behind the veil. Layout effects run inside the commit,
 * which is the moment this milestone is actually about.
 */
export function BuildWatch() {
  useLayoutEffect(() => reportMilestone('build'), []);
  return null;
}

/**
 * OUTSIDE the canvas: what the visitor looks at until that frame arrives.
 *
 * The Suspense fallback in App.tsx covers the code-split chunk and then gets
 * out of the way — after which the visitor watched an empty dark rectangle
 * for as long as it took to build a museum. On a phone that is many seconds
 * and it has been reported to me, more than once, as the site being broken. A
 * blank screen is indistinguishable from a crash.
 *
 * So the veil stays up until the renderer paints, over the top of the canvas
 * rather than instead of it, and reports what is being built as it goes. It
 * fades rather than cutting, because the first frame of a dark hall against a
 * dark veil is otherwise hard to tell from nothing happening at all.
 */
export function HallLoading() {
  const [phase, setPhase] = useState<LoadPhase>(loadPhase);
  const [quote] = useState(() => LORE[Math.floor(Math.random() * LORE.length)]);

  useEffect(() => onLoadPhase(setPhase), []);

  /**
   * A CREEP INSIDE THE MILESTONE IN FLIGHT, so the bar is never still.
   *
   * Constructing the scene is one uninterrupted block of work that nothing can
   * report from inside, and on a slow device that is seconds of a frozen bar,
   * which reads worse than no bar at all. The easing lives in loadPhase and is
   * fenced into the current milestone — it eases toward that milestone's
   * completion and cannot reach it, so the motion is honest about direction
   * without claiming a course that has not been laid.
   */
  useEffect(() => {
    if (phase.painted) return;
    const id = setInterval(creepTick, 220);
    return () => clearInterval(id);
  }, [phase.painted]);

  if (phase.painted) return null;

  return (
    <div className="hall-loading" role="status" aria-live="polite">
      <div className="hall-loading-card">
        <span className="hall-loading-name">ASTERION</span>
        <span className="hall-loading-phase">{phase.label}…</span>
        <div className="hall-loading-track">
          <div className="hall-loading-bar" style={{ transform: `scaleX(${phase.progress})` }} />
        </div>
        <span className="hall-loading-lore">{quote}</span>
      </div>
    </div>
  );
}
