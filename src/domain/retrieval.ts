import type { Entity, EvidenceLevel, Source } from './types';
import { RELATION_META } from './types';
import type { SearchIndex } from './search';

/**
 * The Archivist — Asterion's research companion.
 *
 * This is retrieval over the curated collection and nothing else. Every
 * sentence in an answer is a claim from the dataset, quoted with its evidence
 * level and citations, so the companion cannot invent references by
 * construction. The engine is deterministic; `CompanionEngine` is the seam
 * where a hosted LLM could later rephrase retrieved passages (and only
 * retrieved passages) — see docs/ARCHITECTURE.md.
 */

export type Confidence = 'high' | 'medium' | 'low';

export interface Passage {
  entityId: string;
  entityName: string;
  text: string;
  evidence: EvidenceLevel;
  sources: string[];
}

export interface CompanionAnswer {
  kind: 'answer' | 'comparison' | 'timeline' | 'readings' | 'empty';
  confidence: Confidence;
  intro: string;
  passages: Passage[];
  /** related entities worth exploring next */
  entities: string[];
  /** recommended sources (ids into the bibliography) */
  readings: string[];
  followUps: string[];
}

export interface CompanionEngine {
  ask: (query: string) => CompanionAnswer;
}

const STOPWORDS = new Set(
  'a an and are as at be by did do does for from had has have how in is it of on or the this that to was were what when where which who why with about tell me'.split(' '),
);

function tokens(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function claimPassages(entity: Entity, queryTokens: string[], max: number): Passage[] {
  const scored = entity.claims.map((c) => {
    const text = c.text.toLowerCase();
    let s = 0;
    for (const t of queryTokens) if (text.includes(t)) s += 1;
    return { c, s };
  });
  scored.sort((a, b) => b.s - a.s);
  const anyMatch = scored.some((x) => x.s > 0);
  // if nothing matches tokens, fall back to the entity's leading claims
  const picked = (anyMatch ? scored.filter((x) => x.s > 0) : scored).slice(0, max);
  return picked.map(({ c }) => ({
    entityId: entity.id,
    entityName: entity.name,
    text: c.text,
    evidence: c.evidence,
    sources: c.sources,
  }));
}

function readingsFor(entities: Entity[], sources: Map<string, Source>, max = 5): string[] {
  const ids: string[] = [];
  for (const e of entities)
    for (const c of e.claims)
      for (const s of c.sources) if (sources.has(s) && !ids.includes(s)) ids.push(s);
  return ids.slice(0, max);
}

function followUpsFor(entity: Entity, byId: Map<string, Entity>): string[] {
  const ups: string[] = [];
  for (const r of entity.relations.slice(0, 3)) {
    const t = byId.get(r.target);
    if (!t) continue;
    ups.push(`How is ${entity.name} ${RELATION_META[r.kind]} ${t.name}?`);
  }
  if (entity.year !== undefined) ups.push(`What else was happening around ${Math.abs(entity.year)}${entity.year < 0 ? ' BCE' : ''}?`);
  return ups.slice(0, 3);
}

function confidenceFrom(score: number, passages: number): Confidence {
  if (score < 0.22 && passages >= 2) return 'high';
  if (score < 0.42) return 'medium';
  return 'low';
}

const EMPTY: CompanionAnswer = {
  kind: 'empty',
  confidence: 'low',
  intro:
    'I could not find that in the archive. I answer only from Asterion’s indexed collection — try a name, a book, a symbol, or a movement, or browse the catalogue.',
  passages: [],
  entities: [],
  readings: [],
  followUps: ['What is Hermeticism?', 'Who founded the Theosophical Society?', 'Compare alchemy and Kabbalah'],
};

export function buildCompanion(
  entities: Entity[],
  sources: Map<string, Source>,
  index: SearchIndex,
): CompanionEngine {
  const byId = new Map(entities.map((e) => [e.id, e]));

  function lookup(q: string, limit = 3): Entity[] {
    return index.query(q, limit).map((h) => h.entity);
  }

  function answerFor(query: string): CompanionAnswer {
    const hits = index.query(query, 4);
    if (hits.length === 0) return EMPTY;
    const qTokens = tokens(query);
    const top = hits[0];
    const passages = hits.slice(0, 2).flatMap((h) => claimPassages(h.entity, qTokens, 3)).slice(0, 5);
    if (passages.length === 0) return EMPTY;
    return {
      kind: 'answer',
      confidence: confidenceFrom(top.score, passages.length),
      intro: `Here is what the archive records about ${top.entity.name}${top.entity.dates ? ` (${top.entity.dates})` : ''}. ${top.entity.summary}`,
      passages,
      entities: [
        ...new Set(hits.slice(0, 3).flatMap((h) => [h.entity.id, ...h.entity.relations.slice(0, 4).map((r) => r.target)])),
      ]
        .filter((id) => byId.has(id))
        .slice(0, 6),
      readings: readingsFor(hits.slice(0, 2).map((h) => h.entity), sources),
      followUps: followUpsFor(top.entity, byId),
    };
  }

  function comparison(aQ: string, bQ: string): CompanionAnswer {
    const [a] = lookup(aQ, 1);
    const [b] = lookup(bQ, 1);
    if (!a || !b) return EMPTY;
    const passages = [
      ...claimPassages(a, tokens(aQ), 2),
      ...claimPassages(b, tokens(bQ), 2),
    ];
    return {
      kind: 'comparison',
      confidence: 'medium',
      intro: `Side by side from the archive — ${a.name}: ${a.summary} · ${b.name}: ${b.summary}`,
      passages,
      entities: [a.id, b.id],
      readings: readingsFor([a, b], sources),
      followUps: [`How did ${a.name} and ${b.name} interact?`, `What is ${a.name}?`, `What is ${b.name}?`],
    };
  }

  function timelineFor(q: string): CompanionAnswer {
    const [e] = lookup(q, 1);
    if (!e) return EMPTY;
    const related = [e.id, ...e.relations.map((r) => r.target)]
      .map((id) => byId.get(id))
      .filter((x): x is Entity => Boolean(x) && x!.year !== undefined)
      .sort((x, y) => (x.year ?? 0) - (y.year ?? 0));
    if (related.length === 0) return answerFor(q);
    const passages: Passage[] = related.slice(0, 6).map((r) => ({
      entityId: r.id,
      entityName: r.name,
      text: `${r.year! < 0 ? `${-r.year!} BCE` : r.year} — ${r.name}: ${r.summary}`,
      evidence: 'documented' as EvidenceLevel,
      sources: r.claims[0]?.sources ?? [],
    }));
    return {
      kind: 'timeline',
      confidence: 'medium',
      intro: `A chronology drawn from the archive around ${e.name}:`,
      passages,
      entities: related.slice(0, 6).map((r) => r.id),
      readings: readingsFor([e], sources),
      followUps: followUpsFor(e, byId),
    };
  }

  function readings(q: string): CompanionAnswer {
    const hits = lookup(q, 3);
    if (hits.length === 0) return EMPTY;
    const ids = readingsFor(hits, sources, 7);
    return {
      kind: 'readings',
      confidence: 'high',
      intro: `From the bibliography, the sources the archive cites on ${hits[0].name}:`,
      passages: [],
      entities: hits.map((h) => h.id),
      readings: ids,
      followUps: [`What is ${hits[0].name}?`, ...followUpsFor(hits[0], byId)].slice(0, 3),
    };
  }

  return {
    ask(query: string): CompanionAnswer {
      const q = query.trim();
      if (!q) return EMPTY;
      const cmp = /(?:compare\s+)(.+?)\s+(?:and|with|vs\.?|versus|to)\s+(.+)/i.exec(q) ??
        (/(.+?)\s+vs\.?\s+(.+)/i.exec(q) || null);
      if (cmp) return comparison(cmp[1], cmp[2]);
      if (/\b(timeline|chronology|history of|when did)\b/i.test(q)) return timelineFor(q.replace(/\b(timeline|chronology|history)\b(\s+of)?/gi, ' '));
      if (/\b(read|reading|recommend|bibliograph|books? (about|on))\b/i.test(q)) return readings(q.replace(/\b(what|should|can|i|read|reading|recommend(ations?)?|books?|about|on)\b/gi, ' '));
      return answerFor(q);
    },
  };
}
