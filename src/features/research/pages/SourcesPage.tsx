import { Link } from 'react-router-dom';
import { entities, sources } from '../../../data';

/** Reverse index: which entries cite each source. */
function citingEntities(sourceId: string) {
  return entities.filter((e) => e.claims.some((c) => c.sources.includes(sourceId)));
}

export function SourcesPage() {
  const primary = sources.filter((s) => s.kind === 'primary');
  const secondary = sources.filter((s) => s.kind === 'secondary');

  const renderList = (list: typeof sources) => (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {list.map((s) => {
        const citing = citingEntities(s.id);
        return (
          <li key={s.id} id={s.id} className="source-item">
            <div className="src-title">
              {s.title}
              <span className="source-kind-tag">{s.kind}</span>
            </div>
            <div className="src-cite">{s.citation}</div>
            {citing.length > 0 && (
              <div className="src-cite" style={{ marginTop: '0.3rem' }}>
                Cited by:{' '}
                {citing.map((e, i) => (
                  <span key={e.id}>
                    {i > 0 && ', '}
                    <Link to={`/research/entity/${e.id}`}>{e.name}</Link>
                  </span>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <h1 className="page-title">Bibliography</h1>
      <p className="research-lede">
        Every claim in the museum cites into this list — primary sources and critical editions
        first, then the scholarship. The build fails if a claim ever cites a source that is not
        recorded here.
      </p>
      <h2 className="section-title">Primary sources & critical editions</h2>
      {renderList(primary)}
      <h2 className="section-title">Scholarship</h2>
      {renderList(secondary)}
    </>
  );
}
