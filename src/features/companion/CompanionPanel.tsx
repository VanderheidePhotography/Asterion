import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { companion, entityMap, sourceMap } from '../../data';
import type { CompanionAnswer } from '../../domain/retrieval';
import { useUi } from '../../app/store';
import { EvidenceBadge, SourceCites } from '../shared/bits';

interface Exchange {
  question: string;
  answer: CompanionAnswer;
}

const CONFIDENCE_LABEL = { high: 'High confidence', medium: 'Moderate confidence', low: 'Uncertain' } as const;

/**
 * The Archivist. Deterministic retrieval over the curated collection —
 * every passage is a claim from the dataset with its evidence level and
 * citations attached, so nothing can be invented.
 */
export function CompanionPanel() {
  const { companionOpen, setCompanionOpen } = useUi();
  const [log, setLog] = useState<Exchange[]>([]);
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  if (!companionOpen) return null;

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    setLog((l) => [...l, { question, answer: companion.ask(question) }]);
    setDraft('');
    requestAnimationFrame(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  return (
    <aside className="companion-drawer" role="dialog" aria-label="The Archivist — research companion">
      <div className="companion-head">
        <div>
          <h2>The Archivist</h2>
          <p>Answers only from the indexed collection, with citations. When unsure, it says so.</p>
        </div>
        <button className="icon-btn" onClick={() => setCompanionOpen(false)}>
          Close
        </button>
      </div>
      <div className="companion-log" ref={logRef}>
        {log.length === 0 && (
          <div className="companion-msg-archivist">
            <p className="intro">
              Welcome to the reading room. Ask about anyone or anything in the collection — or try
              “compare Ficino and Pico”, “timeline of the Golden Dawn”, or “what should I read about alchemy?”
            </p>
            <div className="companion-followups">
              {['What is Hermeticism?', 'Compare alchemy and Kabbalah', 'Timeline of Rosicrucianism'].map((s) => (
                <button key={s} className="chip" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {log.map((x, i) => (
          <div key={i} style={{ display: 'contents' }}>
            <div className="companion-msg-user">{x.question}</div>
            <div className="companion-msg-archivist">
              <span className={`confidence confidence-${x.answer.confidence}`}>
                {CONFIDENCE_LABEL[x.answer.confidence]}
              </span>
              <p className="intro">{x.answer.intro}</p>
              {x.answer.passages.map((p, j) => (
                <div key={j} className="companion-passage">
                  <div className="p-entity">
                    <Link to={`/research/entity/${p.entityId}`}>{p.entityName}</Link>{' '}
                    <EvidenceBadge level={p.evidence} />
                  </div>
                  <p style={{ margin: '0.25rem 0' }}>{p.text}</p>
                  <SourceCites ids={p.sources} />
                </div>
              ))}
              {x.answer.readings.length > 0 && (
                <>
                  <div className="p-entity" style={{ marginTop: '0.6rem' }}>Suggested reading</div>
                  <ul className="companion-readings">
                    {x.answer.readings.map((id) => {
                      const s = sourceMap.get(id);
                      return s ? (
                        <li key={id}>
                          <Link to={`/research/sources#${id}`}>{s.title}</Link> — {s.author}, {s.year}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </>
              )}
              {x.answer.entities.length > 0 && (
                <div className="companion-followups">
                  {x.answer.entities.map((id) => {
                    const e = entityMap.get(id);
                    return e ? (
                      <Link key={id} className="chip" to={`/research/entity/${id}`}>
                        {e.name}
                      </Link>
                    ) : null;
                  })}
                </div>
              )}
              {x.answer.followUps.length > 0 && (
                <div className="companion-followups">
                  {x.answer.followUps.map((f) => (
                    <button key={f} className="chip" onClick={() => ask(f)}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <form
        className="companion-form"
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask the Archivist…"
          aria-label="Ask the Archivist"
        />
        <button className="btn btn-gold" type="submit">
          Ask
        </button>
      </form>
    </aside>
  );
}
