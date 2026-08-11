import { Link, useParams } from 'react-router-dom';
import { entities, entityMap, sourceMap } from '../../../data';
import {
  CLUSTER_META,
  ERA_META,
  RELATION_META,
  TYPE_META,
  type RelationKind,
} from '../../../domain/types';
import { EntityChip, EvidenceBadge, SourceCites } from '../../shared/bits';
import { sourcesCiting } from '../../../domain/search';
import { EXTERNAL_LINKS } from '../../../data/externalLinks';

export function EntityPage() {
  const { id } = useParams<{ id: string }>();
  const entity = id ? entityMap.get(id) : undefined;

  if (!entity) {
    return (
      <>
        <h1 className="page-title">Not in the collection</h1>
        <p>
          No entry by that name. Browse the <Link to="/research/catalogue">catalogue</Link> instead.
        </p>
      </>
    );
  }

  // outgoing relations, grouped by kind
  const grouped = new Map<RelationKind, { target: string; note?: string }[]>();
  for (const r of entity.relations) {
    if (!grouped.has(r.kind)) grouped.set(r.kind, []);
    grouped.get(r.kind)!.push(r);
  }
  // incoming references — nothing exists in isolation, so show both directions
  const incoming = entities.filter(
    (e) => e.id !== entity.id && e.relations.some((r) => r.target === entity.id),
  );
  const cited = sourcesCiting(entity, sourceMap);

  return (
    <article>
      <header className="article-head">
        <span className="article-kind">
          {TYPE_META[entity.type].label} · {CLUSTER_META[entity.cluster].label}
        </span>
        <h1 className="page-title">{entity.name}</h1>
        <p className="article-epithet">{entity.epithet}</p>
      </header>

      <div className="article-columns">
        <div>
          <p className="article-summary">{entity.summary}</p>

          <h2 className="section-title">What the record holds</h2>
          <ul className="claim-list" style={{ marginTop: '1rem' }}>
            {entity.claims.map((c, i) => (
              <li key={i} className="claim-item">
                <EvidenceBadge level={c.evidence} />
                <p className="claim-text">{c.text}</p>
                <SourceCites ids={c.sources} />
              </li>
            ))}
          </ul>

          {(grouped.size > 0 || incoming.length > 0) && (
            <h2 className="section-title">Threads of connection</h2>
          )}
          {[...grouped.entries()].map(([kind, rels]) => (
            <div key={kind} className="relation-group">
              <h4>{RELATION_META[kind]}</h4>
              <div className="chip-row">
                {rels.map((r) => {
                  const t = entityMap.get(r.target);
                  return t ? <EntityChip key={r.target} entity={t} /> : null;
                })}
              </div>
            </div>
          ))}
          {incoming.length > 0 && (
            <div className="relation-group">
              <h4>referenced by</h4>
              <div className="chip-row">
                {incoming.map((e) => (
                  <EntityChip key={e.id} entity={e} />
                ))}
              </div>
            </div>
          )}

          {cited.length > 0 && (
            <>
              <h2 className="section-title">Sources cited on this page</h2>
              <ul>
                {cited.map((s) => (
                  <li key={s.id} style={{ marginBottom: '0.4rem' }}>
                    <Link to={`/research/sources#${s.id}`}>{s.title}</Link>
                    <span className="source-kind-tag">{s.kind}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="article-aside" aria-label="At a glance">
          <dl>
            {entity.dates && (
              <div className="aside-row">
                <dt>Dates</dt>
                <dd>{entity.dates}</dd>
              </div>
            )}
            <div className="aside-row">
              <dt>Era</dt>
              <dd>
                {ERA_META[entity.era].label} ({ERA_META[entity.era].span})
              </dd>
            </div>
            <div className="aside-row">
              <dt>Current</dt>
              <dd>{CLUSTER_META[entity.cluster].label}</dd>
            </div>
            <div className="aside-row">
              <dt>Themes</dt>
              <dd>{entity.tags.join(' · ')}</dd>
            </div>
          </dl>
          {(EXTERNAL_LINKS[entity.id] ?? []).length > 0 && (
            <div className="aside-row" style={{ marginTop: '0.9rem' }}>
              <dt style={{ fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Elsewhere
              </dt>
              <dd style={{ margin: '0.25rem 0 0' }}>
                {EXTERNAL_LINKS[entity.id].map((l) => (
                  <div key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label} ↗
                    </a>
                  </div>
                ))}
              </dd>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <Link className="btn btn-gold" to={`/?focus=${entity.id}`}>
              Find this grimoire in the Library
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
