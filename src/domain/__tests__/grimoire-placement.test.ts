import { describe, expect, it } from 'vitest';
import { entities } from '../../data';
import { archiveTextFor } from '../../data/archiveTexts';
import { BAYS } from '../../features/explorer/three/layout';
import { computeLayout } from '../graph';

/**
 * No two grimoires may stand in the same place. The bug this guards against: as
 * books were added to a wing, the placement dealt more groups than there were
 * stations and collapsed two spines onto one spot. This mirrors the placement
 * in GrandLibrary's GRIMOIRES (six slots per bay, four places per station); if
 * that logic changes, change this with it.
 */
const SLOT_FRACTIONS = [-0.83, -0.5, -0.17, 0.17, 0.5, 0.83];
const SLOT_US = BAYS.flatMap((b) => SLOT_FRACTIONS.map((f) => b.u + f * (b.w / 2)));

describe('grimoire placement', () => {
  const graph = computeLayout(entities);
  const clusters = [...new Set(entities.map((e) => e.cluster))];

  it('never stands two books in the same spot, in any wing', () => {
    for (const cluster of clusters) {
      const members = entities
        .filter((e) => e.cluster === cluster)
        .sort((a, b) => {
          if (a.year !== undefined && b.year !== undefined) return a.year - b.year;
          if (a.year !== undefined) return -1;
          if (b.year !== undefined) return 1;
          return (graph.degree.get(b.id) ?? 0) - (graph.degree.get(a.id) ?? 0);
        });
      const rank = new Map<string, number>();
      for (const kind of [true, false]) {
        const of = members.filter((e) => !!archiveTextFor(e) === kind);
        of.forEach((e, i) => rank.set(e.id, of.length > 1 ? i / (of.length - 1) : 0.5));
      }
      members.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));

      const stations = SLOT_US.length;
      const groups = Math.ceil(members.length / 4);
      const seen = new Set<string>();
      members.forEach((e, i) => {
        const g = Math.floor(i / 4);
        const place = (i + g) % 4;
        const wall = place < 2 ? -1 : 1;
        const row = place % 2;
        const slot = groups > 1 ? Math.round((g * (stations - 1)) / (groups - 1)) : 0;
        const u = SLOT_US[slot % SLOT_US.length];
        const key = `${wall}|${row}|${u.toFixed(3)}`;
        expect(seen.has(key), `${cluster}: ${e.id} overlaps another book`).toBe(false);
        seen.add(key);
      });
    }
  });
});
