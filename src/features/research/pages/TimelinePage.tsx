import { Link } from 'react-router-dom';
import { timeline } from '../../../data';
import { formatYear, groupByEra } from '../../../domain/timeline';
import { ERA_META, TYPE_META } from '../../../domain/types';

export function TimelinePage() {
  const eras = groupByEra(timeline());
  return (
    <>
      <h1 className="page-title">Timeline</h1>
      <p className="research-lede">
        Dated events, imprints, and foundings from the collection, from late antiquity to the
        twentieth century. Every entry also sits as a grimoire on a shelf in the{' '}
        <Link to="/">Grand Library</Link>.
      </p>
      {eras.map(({ era, items }) => (
        <section key={era} className="era-block" aria-labelledby={`era-${era}`}>
          <div className="era-head">
            <h2 id={`era-${era}`} style={{ margin: 0 }}>
              {ERA_META[era].label}
            </h2>
            <span className="era-span">{ERA_META[era].span}</span>
          </div>
          <ol className="timeline-list">
            {items.map(({ entity, year }) => (
              <li key={entity.id} className="timeline-item">
                <div className="tl-year">{formatYear(year)}</div>
                <Link to={`/research/entity/${entity.id}`}>{entity.name}</Link>{' '}
                <span className="source-kind-tag">{TYPE_META[entity.type].label}</span>
                <p className="tl-blurb">{entity.epithet}</p>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
