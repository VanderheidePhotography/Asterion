import Fuse from 'fuse.js';
import type { Entity, Source } from './types';

export interface SearchHit {
  entity: Entity;
  score: number;
}

export interface SearchIndex {
  query: (q: string, limit?: number) => SearchHit[];
}

/**
 * Instant, typo-tolerant, weighted search over the whole collection.
 * Names weigh most; claims and tags keep it context-aware, so "tarot egypt"
 * surfaces Court de Gébelin's claim even though no entity is named that.
 */
export function buildSearchIndex(entities: Entity[]): SearchIndex {
  const fuse = new Fuse(entities, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.38,
    keys: [
      { name: 'name', weight: 0.42 },
      { name: 'epithet', weight: 0.16 },
      { name: 'tags', weight: 0.16 },
      { name: 'summary', weight: 0.14 },
      { name: 'claims.text', weight: 0.12 },
    ],
  });

  /**
   * SHELF STOCK RANKS BELOW THE COLLECTION PROPER.
   *
   * The wings carry dozens of real books per hall (see data/shelfBooks.ts), and
   * a good many of them are titled after their subject: Holmyard's survey is
   * called *Alchemy*, Regardie's four volumes are called *The Golden Dawn*.
   * Fuse scores those an exact name match, so searching "alchemy" stopped
   * returning the tradition and started returning a 1957 Penguin paperback —
   * the bulk stock burying the thing it is stock ABOUT.
   *
   * A small penalty rather than a filter: the books stay findable by name, and
   * a curated entry wins any tie with one. Fuse scores are 0 = perfect, so
   * adding moves a hit DOWN the list.
   */
  const SHELF_PENALTY = 0.35;
  const isShelfStock = (e: Entity) => e.tags.includes('shelf');

  return {
    query(q: string, limit = 12): SearchHit[] {
      const trimmed = q.trim();
      if (!trimmed) return [];
      return fuse
        .search(trimmed, { limit: limit * 3 })
        .map((r) => ({
          entity: r.item,
          score: (r.score ?? 1) + (isShelfStock(r.item) ? SHELF_PENALTY : 0),
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, limit);
    },
  };
}

export function sourcesCiting(entity: Entity, sources: Map<string, Source>): Source[] {
  const ids = new Set<string>();
  for (const c of entity.claims) for (const s of c.sources) ids.add(s);
  return [...ids]
    .map((id) => sources.get(id))
    .filter((s): s is Source => Boolean(s))
    .sort((a, b) => (a.kind === b.kind ? a.author.localeCompare(b.author) : a.kind === 'primary' ? -1 : 1));
}
