import type { Entity, Source } from '../domain/types';
import { hermetica } from './entities/hermetica';
import { alchemy } from './entities/alchemy';
import { kabbalah } from './entities/kabbalah';
import { renaissance } from './entities/renaissance';
import { earlyModern } from './entities/earlyModern';
import { freemasonry } from './entities/freemasonry';
import { occultRevival } from './entities/occultRevival';
import { scholarship } from './entities/scholarship';
import { sources as baseSources } from './sources';
import { shelfBookEntities, shelfBookSources } from './shelfBooks';
import { buildSearchIndex } from '../domain/search';
import { buildCompanion } from '../domain/retrieval';
import { computeLayout } from '../domain/graph';
import { timelineItems } from '../domain/timeline';

export const entities: Entity[] = [
  ...hermetica,
  ...alchemy,
  ...kabbalah,
  ...renaissance,
  ...earlyModern,
  ...freemasonry,
  ...occultRevival,
  ...scholarship,
  // the shelves' real books — dozens per wing, derived from one record each
  // (see shelfBooks.ts). They are appended rather than folded into the eight
  // cluster files so the curated narrative entries and the bulk stock stay
  // visibly separate.
  ...shelfBookEntities,
];

export const entityMap: Map<string, Entity> = new Map(entities.map((e) => [e.id, e]));

/** the bibliography, plus one imprint entry per shelf book */
export const sources: Source[] = [...baseSources, ...shelfBookSources];
export const sourceMap: Map<string, Source> = new Map(sources.map((s) => [s.id, s]));

/**
 * Structural validation of the collection. Runs in tests (and can be called
 * from tooling): unique ids, no dangling relations, no phantom citations,
 * and no orphaned entities — nothing exists in isolation.
 */
export function validateCollection(all: Entity[] = entities, bib: Map<string, Source> = sourceMap): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const e of all) {
    if (ids.has(e.id)) problems.push(`duplicate entity id: ${e.id}`);
    ids.add(e.id);
    if (e.claims.length === 0) problems.push(`${e.id}: has no claims`);
    for (const c of e.claims) {
      if (c.sources.length === 0) problems.push(`${e.id}: claim without citation — "${c.text.slice(0, 40)}…"`);
      for (const s of c.sources) if (!bib.has(s)) problems.push(`${e.id}: cites unknown source "${s}"`);
    }
    for (const r of e.relations) {
      if (r.target === e.id) problems.push(`${e.id}: relates to itself`);
    }
  }
  for (const e of all) {
    for (const r of e.relations) {
      if (!ids.has(r.target)) problems.push(`${e.id}: dangling relation → "${r.target}"`);
    }
  }
  // connectivity: every entity participates in at least one relation, in either direction
  const connected = new Set<string>();
  for (const e of all)
    for (const r of e.relations)
      if (ids.has(r.target)) {
        connected.add(e.id);
        connected.add(r.target);
      }
  for (const e of all) if (!connected.has(e.id)) problems.push(`${e.id}: exists in isolation (no relations in or out)`);
  return problems;
}

/**
 * Shared singletons — built once, used by search, the companion, and the
 * scenes. BUILT ON FIRST ASK, not on import.
 *
 * These were four `export const`s, which means four whole-corpus passes ran
 * during module evaluation of the ENTRY chunk on every visit: Fuse indexing
 * every entity, the companion's retrieval tables, a force layout over the
 * relation graph, and the timeline sort. A visitor who walks into the hall and
 * never opens search paid for all of it before the front door could open, and
 * module evaluation is the one place in a load where nothing else can happen —
 * no frame, no fetch callback, no paint.
 *
 * Lazily memoised, they cost exactly what they did before, at the moment
 * something actually wants them: opening search, asking the companion,
 * drawing a relation thread. Each is still built once.
 */
let _searchIndex: ReturnType<typeof buildSearchIndex> | null = null;
export function searchIndex(): ReturnType<typeof buildSearchIndex> {
  return (_searchIndex ??= buildSearchIndex(entities));
}

let _companion: ReturnType<typeof buildCompanion> | null = null;
export function companion(): ReturnType<typeof buildCompanion> {
  return (_companion ??= buildCompanion(entities, sourceMap, searchIndex()));
}

let _graphLayout: ReturnType<typeof computeLayout> | null = null;
export function graphLayout(): ReturnType<typeof computeLayout> {
  return (_graphLayout ??= computeLayout(entities));
}

let _timeline: ReturnType<typeof timelineItems> | null = null;
export function timeline(): ReturnType<typeof timelineItems> {
  return (_timeline ??= timelineItems(entities));
}
