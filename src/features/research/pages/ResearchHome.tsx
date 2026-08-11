import { Link } from 'react-router-dom';
import { entities, entityMap } from '../../../data';
import { TYPE_META, type EntityType } from '../../../domain/types';

const FEATURED = [
  'corpus-hermeticum',
  'golden-dawn',
  'tarot',
  'tree-of-life',
  'rosicrucianism',
  'john-dee',
];

export function ResearchHome() {
  const counts = new Map<EntityType, number>();
  for (const e of entities) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);

  return (
    <>
      <header>
        <h1 className="page-title">The Reading Room</h1>
        <p className="research-lede">
          The full collection of the museum in encyclopedic form: every person, book, symbol,
          organization, and idea, cross-referenced and cited. Each statement carries its evidence
          level — documented record, primary-source assertion, scholarship, tradition, legend, or
          later interpretation — so you always know what kind of knowledge you are holding.
        </p>
      </header>

      <h2 className="section-title">Wings of the collection</h2>
      <ul className="entity-grid">
        {([...counts.entries()] as [EntityType, number][]).map(([type, n]) => (
          <li key={type} style={{ display: 'contents' }}>
            <Link className="entity-card" to={`/research/catalogue?type=${type}`}>
              <span className="card-kind">{n} entries</span>
              <h3>{TYPE_META[type].plural}</h3>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="section-title">Begin anywhere</h2>
      <ul className="entity-grid">
        {FEATURED.map((id) => {
          const e = entityMap.get(id);
          if (!e) return null;
          return (
            <li key={id} style={{ display: 'contents' }}>
              <Link className="entity-card" to={`/research/entity/${e.id}`}>
                <span className="card-kind">
                  {TYPE_META[e.type].label}
                  {e.dates ? ` · ${e.dates}` : ''}
                </span>
                <h3>{e.name}</h3>
                <span className="card-epithet">{e.epithet}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p style={{ marginTop: '2rem' }}>
        Prefer to wander? Step back into the <Link to="/">Grand Library</Link> and walk the stacks
        — every entry here sits on a shelf there, waiting to be lifted down and read.
      </p>
    </>
  );
}
