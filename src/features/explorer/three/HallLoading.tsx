import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { loadPhase, onLoadPhase, reportPainted, reportProgress, type LoadPhase } from './loadPhase';

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
   * A CREEP TOWARD THE NEXT MILESTONE, so the bar is never still.
   *
   * The courses report at four points, and between them nothing moves — on a
   * slow device that is several seconds of a frozen bar, which reads worse
   * than no bar. This eases toward whatever the next real milestone is and
   * never reaches it, so the motion is honest about direction without
   * inventing progress it has not made.
   */
  useEffect(() => {
    if (phase.painted) return;
    const id = setInterval(() => {
      const p = loadPhase();
      if (p.painted) return;
      reportProgress(Math.min(p.progress + (0.92 - p.progress) * 0.06, 0.92));
    }, 220);
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
