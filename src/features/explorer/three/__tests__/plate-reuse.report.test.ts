import { describe, expect, it } from 'vitest';
import { entities } from '../../../../data';
import { plateAssignment } from '../grimoireArt';

/**
 * Not a guarantee, a measurement: how much of the library is showing a picture
 * of its own subject, and how thinly the shared pool is spread under the rest.
 *
 * This used to measure only the second half, because the first half did not
 * exist — every book drew both its plates from a pool of about twenty per
 * section. Most books now carry a public-domain image OF THEMSELVES (see
 * entityPlates.ts), so the interesting numbers are: how many, and whether what
 * is left over still avoids putting one engraving in a dozen books.
 */
describe('plate reuse', () => {
  it('gives most books their own picture and spreads the pool under the rest', () => {
    const all = new Map<string, number>();
    /** the books still drawing both plates from their section's shared pool */
    const pooled = new Map<string, number>();
    let own = 0;
    for (const e of entities) {
      const { front, plate, curated } = plateAssignment(e.cluster, e.id);
      if (plate.startsWith('/art/ent-')) own++;
      for (const p of [front, plate]) {
        all.set(p, (all.get(p) ?? 0) + 1);
        if (!curated) pooled.set(p, (pooled.get(p) ?? 0) + 1);
      }
    }
    const counts = [...pooled.values()].sort((a, b) => b - a);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;

    // the great majority of the collection illustrates itself
    expect(own).toBeGreaterThan(240);
    // and the library as a whole is not four hundred books sharing forty plates
    expect(all.size).toBeGreaterThan(350);
    // the hashed selection this all replaced put one image in 26 books
    expect(counts[0]).toBeLessThanOrEqual(8);
    expect(mean).toBeLessThan(6);
  });
});
