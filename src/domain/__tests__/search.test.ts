import { describe, expect, it } from 'vitest';
import { searchIndex } from '../../data';

describe('search', () => {
  it('finds an entity by exact name', () => {
    const hits = searchIndex().query('Golden Dawn');
    expect(hits[0]?.entity.id).toBe('golden-dawn');
  });

  it('tolerates typos', () => {
    const hits = searchIndex().query('Hermetiscm');
    expect(hits.some((h) => h.entity.id === 'hermeticism')).toBe(true);
  });

  it('is context-aware: matches inside claims, not just names', () => {
    // "Book of Thoth" appears only in a claim on the tarot entry
    const hits = searchIndex().query('book of thoth');
    expect(hits.some((h) => h.entity.id === 'tarot')).toBe(true);
  });

  it('returns nothing for an empty query', () => {
    expect(searchIndex().query('   ')).toEqual([]);
  });
});
