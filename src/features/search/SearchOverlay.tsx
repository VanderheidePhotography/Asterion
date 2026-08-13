import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchIndex } from '../../data';
import { TYPE_META } from '../../domain/types';
import { useUi } from '../../app/store';

/**
 * Command-palette search: instant, typo-tolerant, keyboard-first.
 * Enter walks you to the book's shelf in the Grand Library;
 * ⌘/Ctrl+Enter opens the quiet text entry instead.
 */
export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUi();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const hits = useMemo(() => searchIndex().query(query, 9), [query]);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setActive(0);
      // wait a frame so the element exists before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  const go = (id: string, asText: boolean) => {
    setSearchOpen(false);
    navigate(asText ? `/research/entity/${id}` : `/?focus=${id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setSearchOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && hits[active]) {
      go(hits[active].entity.id, e.metaKey || e.ctrlKey);
    }
  };

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search the collection"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setSearchOpen(false);
      }}
    >
      <div className="search-panel" onKeyDown={onKeyDown}>
        <input
          ref={inputRef}
          className="search-input"
          type="search"
          role="combobox"
          aria-expanded={hits.length > 0}
          aria-controls="search-results"
          aria-activedescendant={hits[active] ? `hit-${hits[active].entity.id}` : undefined}
          placeholder="Search people, books, symbols, ideas…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
        />
        <div className="search-results" id="search-results" role="listbox">
          {query.trim() === '' && (
            <p className="search-empty">
              Try “Hermes”, “Golden Dawn”, “tarot”, or even a misspelling — the archive forgives.
              <br />
              <small>Enter walks you to the book’s shelf · ⌘Enter reads the text entry</small>
            </p>
          )}
          {query.trim() !== '' && hits.length === 0 && (
            <p className="search-empty">Nothing in the collection matches — the Archivist may know a related path.</p>
          )}
          {hits.map((h, i) => (
            <button
              key={h.entity.id}
              id={`hit-${h.entity.id}`}
              role="option"
              aria-selected={i === active}
              className={`search-hit${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={(e) => go(h.entity.id, e.metaKey || e.ctrlKey)}
            >
              <span className="hit-meta">
                {TYPE_META[h.entity.type].label}
                {h.entity.dates ? ` · ${h.entity.dates}` : ''}
              </span>
              <div className="hit-name">{h.entity.name}</div>
              <div className="hit-epithet">{h.entity.epithet}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
