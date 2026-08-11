import { Link } from 'react-router-dom';
import type { Entity, EvidenceLevel } from '../../domain/types';
import { EVIDENCE_META, TYPE_META } from '../../domain/types';
import { sourceMap } from '../../data';

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const meta = EVIDENCE_META[level];
  return (
    <span className={`badge-evidence ev-${level}`} title={meta.blurb}>
      <span className="dot" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function EntityChip({ entity, kind }: { entity: Entity; kind?: string }) {
  return (
    <Link className="chip" to={`/research/entity/${entity.id}`}>
      {kind && <span className="chip-kind">{kind}</span>}
      {entity.name}
      <span className="chip-kind">{TYPE_META[entity.type].label}</span>
    </Link>
  );
}

/** Inline citation chips: “[Yates 1964]” linking into the bibliography. */
export function SourceCites({ ids }: { ids: string[] }) {
  return (
    <span className="claim-cites">
      {ids.map((id, i) => {
        const s = sourceMap.get(id);
        if (!s) return null;
        return (
          <span key={id}>
            {i > 0 && ' · '}
            <Link to={`/research/sources#${id}`} title={s.citation}>
              {s.author.split(',')[0].split('(')[0].trim()} {s.year}
            </Link>
          </span>
        );
      })}
    </span>
  );
}
