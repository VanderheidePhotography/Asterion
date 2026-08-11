import { useEffect, useState } from 'react';

/**
 * WHAT SHAPE OF SCREEN IS THIS, RIGHT NOW.
 *
 * The explorer used to decide once, at mount, with a single
 * `matchMedia('(pointer: coarse)')` probe — and then never asked again. Two
 * things were wrong with that. It was a question about the INPUT DEVICE
 * standing in for a question about the LAYOUT, so a desktop window dragged
 * down to phone width got the desk controls and no thumb-stick; and it was a
 * one-shot read, so even a real device toggled in the browser's device
 * emulator needed a reload before anything changed.
 *
 * These are live `matchMedia` subscriptions instead, so every consumer
 * re-renders the moment the window is resized, the phone is turned, or the
 * emulator is switched on. The breakpoints deliberately mirror the ones in
 * global.css — the CSS moves the chrome and this moves the controls, and the
 * two must never disagree about which layout is on screen.
 */

/**
 * A NARROW, UPRIGHT FRAME — a phone held vertically, or any window as narrow
 * as one. The last arm is a phone turned sideways: wide enough to clear the
 * width test, far too short for the desk layout's stacked chrome.
 */
export const COMPACT_QUERY =
  '(max-width: 46rem), (orientation: portrait) and (pointer: coarse), (pointer: coarse) and (max-height: 30rem)';

/** a finger or a stylus — no hover, and a much bigger minimum target */
export const COARSE_QUERY = '(pointer: coarse)';

/**
 * A CINEMA-SHAPED FRAME — an ultrawide monitor, or a maximised window on one.
 * Past about 2:1 the interface has to stop growing with the glass: a hint pill
 * centred over 3440px of hall is a caption nobody's eye is anywhere near.
 */
export const WIDE_QUERY = '(min-width: 100rem) and (min-aspect-ratio: 2/1)';

function useMedia(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange(); // the window may have changed shape between render and effect
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export interface Viewport {
  /** lay this out as a phone held upright */
  compact: boolean;
  /** driven by a finger: no hover, bigger targets, no keyboard */
  coarse: boolean;
  /** an ultrawide desk monitor */
  wide: boolean;
  /**
   * Should the on-screen walk stick be live?
   *
   * Both a real phone and a narrow desk window get it — the second is not a
   * concession to testing, it is the only honest answer: at that width the
   * layout IS the phone layout, and a visitor who can see a thumb-stick
   * drawn under the cursor must be able to walk with it.
   */
  stick: boolean;
}

export function useViewport(): Viewport {
  const compact = useMedia(COMPACT_QUERY);
  const coarse = useMedia(COARSE_QUERY);
  const wide = useMedia(WIDE_QUERY);
  return { compact, coarse, wide, stick: compact || coarse };
}
