import { WING_U0, WING_U1 } from './layout';
import { entities } from '../../../data';
import type { ClusterId } from '../../../domain/types';

/**
 * What is left of the wing timeline: its arithmetic, and nothing else.
 *
 * ── what this used to be ────────────────────────────────────────────────────
 * The corridor floor was struck as a TIMELINE. It went in three pieces, and all
 * three are now gone: the era threshold sills that crossed the floor at each
 * change of period, then the cross-rules and struck year studs that carried the
 * dates themselves. Numerals lying on the boards of a room like this read as
 * signage — a label applied to the building rather than part of it — and they
 * were the last of the timeline left after the rest of it came out.
 *
 * ── what is left ────────────────────────────────────────────────────────────
 * Nothing on the floor. The rule itself — a slate channel with a brass fillet
 * either side — was the last piece standing and is now gone too; the reasoning
 * is at the component below. What survives is `clusterSpan`, which the
 * Librarian's dialogue uses to quote each wing's date range when you look down
 * it, and which is the only reason this file still exists.
 */

export interface ClusterSpan {
  minYear: number;
  maxYear: number;
  count: number;
  yearToU: (year: number) => number;
}

const spanCache = new Map<ClusterId, ClusterSpan>();

export function clusterSpan(cluster: ClusterId): ClusterSpan {
  const hit = spanCache.get(cluster);
  if (hit) return hit;
  const members = entities.filter((e) => e.cluster === cluster);
  const dated = members
    .filter((e): e is typeof e & { year: number } => e.year !== undefined)
    .sort((a, b) => a.year - b.year);
  const minYear = dated[0]?.year ?? 0;
  const maxYear = dated[dated.length - 1]?.year ?? minYear + 1;
  const span = Math.max(1, maxYear - minYear);
  const yearToU = (year: number) => WING_U0 + ((year - minYear) / span) * (WING_U1 - WING_U0);
  const made: ClusterSpan = { minYear, maxYear, count: members.length, yearToU };
  spanCache.set(cluster, made);
  return made;
}

/* ————————————————————————————————————————————————————————————————
 * THE RULE IS GONE.
 *
 * What stood here was the last surviving piece of the wing timeline: a slate
 * channel with a brass fillet either side, laid dead down the centre line of
 * every hall for its full 48 m. The era sills, cross-rules and year studs went
 * before it; this goes for the same reason, taken one step further.
 *
 * The argument for keeping it was that the Cosmographia's runners were WOVEN to
 * receive it — the carpet parted around a plain channel exactly this wide. That
 * argument died with the carpet it referred to. The ways are no longer banded
 * runners with ornament arranged either side of a spine; they are the rotunda's
 * own cloth carried out through the gates, one dye end to end, and there is
 * nothing left for a rule to bed into.
 *
 * What is left is what you actually saw walking down a hall: a perfectly
 * straight, perfectly bright gold line converging on the vanishing point, in a
 * corridor lit at 15%. It was the highest-contrast object in the wing and the
 * only dead-straight one, so it took the eye every time and held it — down the
 * floor, away from the shelves, the paintings and the window at the end, which
 * are the reasons the hall exists. Brass in this building now marks only where
 * the floor CHANGES: the ten gate thresholds, the two mandala rings, the rim of
 * each stone roundel.
 *
 * `clusterSpan` below outlives the floor it was written for — the Librarian
 * still quotes each wing's date range when you look down it — which is why this
 * file remains rather than being deleted.
 * ———————————————————————————————————————————————————————————————— */

export interface WingSection {
  cluster: ClusterId;
  angle: number;
}

/** kept as a no-op so the scene graph and its call site need not change shape
 *  for a deletion; React renders nothing for it */
export function WingChronology(_: { sections: readonly WingSection[] }) {
  return null;
}
