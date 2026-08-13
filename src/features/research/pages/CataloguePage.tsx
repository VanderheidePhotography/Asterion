import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { entities, searchIndex } from '../../../data';
import { CLUSTER_META, TYPE_META, type ClusterId, type EntityType } from '../../../domain/types';

const TYPES = Object.keys(TYPE_META) as EntityType[];
const CLUSTERS = Object.keys(CLUSTER_META) as ClusterId[];

export function CataloguePage() {
  const [params, setParams] = useSearchParams();
  const typeFilter = (params.get('type') as EntityType | null) ?? null;
  const clusterFilter = (params.get('cluster') as ClusterId | null) ?? null;
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const base = query.trim()
      ? searchIndex().query(query, 60).map((h) => h.entity)
      : [...entities].sort((a, b) => a.name.localeCompare(b.name));
    return base.filter(
      (e) => (!typeFilter || e.type === typeFilter) && (!clusterFilter || e.cluster === clusterFilter),
    );
  }, [query, typeFilter, clusterFilter]);

  const setFilter = (key: 'type' | 'cluster', value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <h1 className="page-title">Catalogue</h1>
      <p className="research-lede">
        {entities.length} entries, every one connected to the others. Filter by kind or current,
        or just start typing.
      </p>

      <input
        className="search-input"
        style={{
          border: '1px solid var(--line)',
          borderRadius: 10,
          background: 'var(--bg-raised)',
          color: 'var(--text)',
          marginTop: '0.6rem',
        }}
        type="search"
        placeholder="Filter the catalogue…"
        aria-label="Filter the catalogue"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="filters-row" role="group" aria-label="Filter by kind">
        <button className="filter-toggle" aria-pressed={!typeFilter} onClick={() => setFilter('type', null)}>
          All kinds
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            className="filter-toggle"
            aria-pressed={typeFilter === t}
            onClick={() => setFilter('type', typeFilter === t ? null : t)}
          >
            {TYPE_META[t].plural}
          </button>
        ))}
      </div>
      <div className="filters-row" role="group" aria-label="Filter by current">
        <button className="filter-toggle" aria-pressed={!clusterFilter} onClick={() => setFilter('cluster', null)}>
          All currents
        </button>
        {CLUSTERS.map((c) => (
          <button
            key={c}
            className="filter-toggle"
            aria-pressed={clusterFilter === c}
            onClick={() => setFilter('cluster', clusterFilter === c ? null : c)}
          >
            {CLUSTER_META[c].label}
          </button>
        ))}
      </div>

      <ul className="entity-grid">
        {shown.map((e) => (
          <li key={e.id} style={{ display: 'contents' }}>
            <Link className="entity-card" to={`/research/entity/${e.id}`}>
              <span className="card-kind">
                {TYPE_META[e.type].label}
                {e.dates ? ` · ${e.dates}` : ''}
              </span>
              <h3>{e.name}</h3>
              <span className="card-epithet">{e.epithet}</span>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p>Nothing matches those filters.</p>}
    </>
  );
}
