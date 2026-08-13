import { describe, expect, it } from 'vitest';
import { entities, entityMap, sourceMap, timeline, validateCollection } from '../../data';
import { EXTERNAL_LINKS } from '../../data/externalLinks';

describe('collection integrity', () => {
  it('has no structural problems (dangling relations, phantom citations, orphans)', () => {
    expect(validateCollection()).toEqual([]);
  });

  it('every entity carries a summary, an epithet, and at least one tag', () => {
    for (const e of entities) {
      expect(e.summary.length, e.id).toBeGreaterThan(40);
      expect(e.epithet.length, e.id).toBeGreaterThan(5);
      expect(e.tags.length, e.id).toBeGreaterThan(0);
    }
  });

  it('every claim cites only sources that exist in the bibliography', () => {
    for (const e of entities)
      for (const c of e.claims)
        for (const s of c.sources) expect(sourceMap.has(s), `${e.id} cites ${s}`).toBe(true);
  });

  it('the timeline is sorted and contains only dated, event-like entries', () => {
    const items = timeline();
    for (let i = 1; i < items.length; i++) {
      expect(items[i].year).toBeGreaterThanOrEqual(items[i - 1].year);
    }
    for (const t of items) {
      expect(['event', 'work', 'organization']).toContain(t.entity.type);
    }
  });

  it('is a genuinely connected web — a healthy median of relations', () => {
    const total = entities.reduce((n, e) => n + e.relations.length, 0);
    expect(total / entities.length).toBeGreaterThan(1.5);
  });

  it('external links point at real entities and use https', () => {
    for (const [id, links] of Object.entries(EXTERNAL_LINKS)) {
      expect(entityMap.has(id), `external link key "${id}"`).toBe(true);
      for (const l of links) {
        expect(l.url.startsWith('https://'), l.url).toBe(true);
        expect(l.label.length).toBeGreaterThan(2);
      }
    }
  });
});
