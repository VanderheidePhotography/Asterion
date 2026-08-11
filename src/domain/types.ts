/**
 * Core information model for Asterion.
 *
 * Everything in the museum is an Entity. Entities never exist in isolation:
 * relationships are first-class data, and every factual statement (Claim)
 * carries an explicit evidence level and citations into the bibliography.
 */

export type EntityType =
  | 'person'
  | 'organization'
  | 'work'
  | 'symbol'
  | 'concept'
  | 'event'
  | 'place'
  | 'tradition';

/**
 * Evidence rubric — the heart of the content principles.
 *
 * documented   — corroborated historical record (dates, publications, membership rolls)
 * primary      — asserted in a period primary source; reported, not independently verified
 * scholarship  — interpretation or finding in academic secondary literature
 * tradition    — organizational or received tradition, historically unverified
 * legend       — legendary or mythic attribution
 * speculation  — later speculative interpretation, presented as such
 */
export type EvidenceLevel =
  | 'documented'
  | 'primary'
  | 'scholarship'
  | 'tradition'
  | 'legend'
  | 'speculation';

export type RelationKind =
  | 'wrote'
  | 'translated'
  | 'founded'
  | 'member-of'
  | 'influenced'
  | 'critiqued'
  | 'attributed-to'
  | 'associated-with'
  | 'located-in'
  | 'part-of'
  | 'studied'
  | 'patron-of'
  | 'collaborated-with'
  | 'symbol-of'
  | 'derived-from';

export type ClusterId =
  | 'hermetica'
  | 'alchemy'
  | 'kabbalah'
  | 'renaissance'
  | 'early-modern'
  | 'freemasonry'
  | 'occult-revival'
  | 'scholarship';

export type EraId =
  | 'antiquity'
  | 'medieval'
  | 'renaissance'
  | 'early-modern'
  | 'enlightenment'
  | 'nineteenth'
  | 'twentieth';

export interface Claim {
  text: string;
  evidence: EvidenceLevel;
  /** ids into the Source bibliography; a claim may never cite an unknown source */
  sources: string[];
}

export interface Relation {
  kind: RelationKind;
  /** id of the target entity; validated at build/test time */
  target: string;
  note?: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  /** one-line poetic-but-accurate descriptor shown on labels and cards */
  epithet: string;
  /** display dates, e.g. "1433–1499" or "2nd–3rd c. CE" */
  dates?: string;
  /** representative year for chronology (negative = BCE) */
  year?: number;
  era: EraId;
  cluster: ClusterId;
  summary: string;
  claims: Claim[];
  relations: Relation[];
  tags: string[];
}

export interface Source {
  id: string;
  kind: 'primary' | 'secondary';
  title: string;
  author: string;
  year: string;
  citation: string;
}

export const EVIDENCE_META: Record<
  EvidenceLevel,
  { label: string; blurb: string }
> = {
  documented: {
    label: 'Documented',
    blurb: 'Corroborated historical record — dates, imprints, diaries, minutes.',
  },
  primary: {
    label: 'Primary source',
    blurb: 'Asserted in a period source; reported as the source states it, not independently verified.',
  },
  scholarship: {
    label: 'Scholarship',
    blurb: 'Finding or interpretation in peer-reviewed academic literature.',
  },
  tradition: {
    label: 'Tradition',
    blurb: 'Organizational or received tradition; historically unverified.',
  },
  legend: {
    label: 'Legend',
    blurb: 'Legendary or mythic attribution, presented as part of the story of ideas.',
  },
  speculation: {
    label: 'Later interpretation',
    blurb: 'Speculative reading proposed centuries after the fact.',
  },
};

export const TYPE_META: Record<EntityType, { label: string; plural: string }> = {
  person: { label: 'Person', plural: 'People' },
  organization: { label: 'Organization', plural: 'Organizations' },
  work: { label: 'Book & Manuscript', plural: 'Books & Manuscripts' },
  symbol: { label: 'Symbol', plural: 'Symbols' },
  concept: { label: 'Concept', plural: 'Concepts' },
  event: { label: 'Event', plural: 'Events' },
  place: { label: 'Place', plural: 'Places' },
  tradition: { label: 'Tradition', plural: 'Traditions & Movements' },
};

export const CLUSTER_META: Record<ClusterId, { label: string; color: string }> = {
  hermetica: { label: 'Hermetica & Late Antiquity', color: '#e8b873' },
  alchemy: { label: 'Alchemy', color: '#7fd4c1' },
  kabbalah: { label: 'Kabbalah', color: '#9fb8ff' },
  renaissance: { label: 'Renaissance Magic & Philosophy', color: '#ffca7a' },
  'early-modern': { label: 'Rosicrucianism & Christian Theosophy', color: '#f2a0c0' },
  freemasonry: { label: 'Freemasonry', color: '#c3d2e6' },
  'occult-revival': { label: 'The Occult Revival', color: '#c9a0ff' },
  scholarship: { label: 'The Academic Study', color: '#a8e08f' },
};

export const ERA_META: Record<EraId, { label: string; span: string; order: number }> = {
  antiquity: { label: 'Antiquity', span: 'to c. 500 CE', order: 0 },
  medieval: { label: 'The Medieval World', span: 'c. 500–1400', order: 1 },
  renaissance: { label: 'The Renaissance', span: 'c. 1400–1600', order: 2 },
  'early-modern': { label: 'The Early Modern Era', span: 'c. 1600–1720', order: 3 },
  enlightenment: { label: 'The Enlightenment', span: 'c. 1720–1800', order: 4 },
  nineteenth: { label: 'The Nineteenth Century', span: '1800–1900', order: 5 },
  twentieth: { label: 'The Twentieth Century', span: '1900–2000', order: 6 },
};

export const RELATION_META: Record<RelationKind, string> = {
  wrote: 'wrote',
  translated: 'translated',
  founded: 'founded',
  'member-of': 'member of',
  influenced: 'influenced',
  critiqued: 'critiqued',
  'attributed-to': 'attributed to',
  'associated-with': 'associated with',
  'located-in': 'located in',
  'part-of': 'part of',
  studied: 'studied',
  'patron-of': 'patron of',
  'collaborated-with': 'collaborated with',
  'symbol-of': 'symbol of',
  'derived-from': 'derived from',
};
