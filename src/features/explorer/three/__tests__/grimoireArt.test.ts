import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { entities } from '../../../../data';
import { plateAssignment } from '../grimoireArt';
import type { ClusterId } from '../../../../domain/types';

/**
 * The plates a book shows are dealt round its cluster's pool rather than
 * hashed into it. These are the properties that deal is supposed to buy —
 * asserted here because the failure mode (the same engraving opening two
 * books on the same shelf) is easy to reintroduce and easy to miss by eye.
 */
describe('grimoire plate deal', () => {
  const byCluster = new Map<ClusterId, typeof entities>();
  for (const e of entities) {
    const list = byCluster.get(e.cluster) ?? [];
    list.push(e);
    byCluster.set(e.cluster, list);
  }

  it('never shows the same image twice inside one book', () => {
    for (const e of entities) {
      const { front, plate } = plateAssignment(e.cluster, e.id);
      expect(front, e.id).not.toBe(plate);
    }
  });

  it('gives no two books in a cluster the same pair of plates', () => {
    for (const [cluster, list] of byCluster) {
      const seen = new Map<string, string>();
      for (const e of list) {
        const { front, plate, curated } = plateAssignment(cluster, e.id);
        // hand-picked entities deliberately share art (the whole tarot family
        // sits beside the same Magician), so they are exempt
        if (curated) continue;
        const key = `${front}|${plate}`;
        expect(seen.has(key), `${cluster}: ${e.id} repeats the pair used by ${seen.get(key)}`).toBe(false);
        seen.set(key, e.id);
      }
    }
  });

  it('never gives neighbouring books the same frontispiece or plate', () => {
    for (const [cluster, list] of byCluster) {
      for (let i = 1; i < list.length; i++) {
        const prev = plateAssignment(cluster, list[i - 1].id);
        const cur = plateAssignment(cluster, list[i].id);
        if (prev.curated || cur.curated) continue;
        expect(cur.front, `${cluster} @${i}`).not.toBe(prev.front);
        expect(cur.plate, `${cluster} @${i}`).not.toBe(prev.plate);
      }
    }
  });

  it('only ever points at plate files that exist', () => {
    const missing = new Set<string>();
    for (const e of entities) {
      const { front, plate } = plateAssignment(e.cluster, e.id);
      for (const p of [front, plate]) if (!existsSync(`public${p}`)) missing.add(p);
    }
    expect([...missing]).toEqual([]);
  });

  /**
   * Two scans of one engraving are different files with different names, so
   * nothing above catches them — and the library had eight such pairs, some
   * across clusters (the "figure of Freemasonry" and a portrait fetched as
   * "Elias Ashmole" were the same picture). The hashes are frozen by
   * scripts/plate-hashes; regenerate them when the plates change, and read a
   * failure here as "this image is already in the library under another name".
   */
  it('shows no two books an image that is visually the same', async () => {
    const hashes: Record<string, string> = (await import('./plate-hashes.json')).default;
    const inRotation = new Set<string>();
    for (const e of entities) {
      const { front, plate } = plateAssignment(e.cluster, e.id);
      inRotation.add(front);
      inRotation.add(plate);
    }
    const known = [...inRotation].filter((p) => hashes[p]);
    const hamming = (a: string, b: string) => {
      let d = 0;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
      return d;
    };
    const dupes: string[] = [];
    for (let i = 0; i < known.length; i++)
      for (let j = i + 1; j < known.length; j++)
        if (hamming(hashes[known[i]], hashes[known[j]]) <= 18) dupes.push(`${known[i]} == ${known[j]}`);
    expect(dupes).toEqual([]);
    // and the frozen set should still cover what is actually on the shelves
    expect(known.length).toBeGreaterThanOrEqual(inRotation.size - 2);
  });
});
