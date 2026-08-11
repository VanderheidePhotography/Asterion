import { NavLink, Outlet } from 'react-router-dom';

const SECTIONS = [
  { to: '/research', label: 'Reading Room', end: true },
  { to: '/research/catalogue', label: 'Catalogue' },
  { to: '/research/timeline', label: 'Timeline' },
  { to: '/research/sources', label: 'Bibliography' },
  { to: '/research/about', label: 'Methodology' },
];

/** Research mode: the same collection as the museum, laid out as an encyclopedia. */
export function ResearchLayout() {
  return (
    <div className="theme-light research-shell">
      <main id="main" className="research-main">
        <nav aria-label="Research sections" className="filters-row" style={{ marginTop: 0 }}>
          {SECTIONS.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              end={s.end}
              className="chip"
              style={({ isActive }) =>
                isActive ? { borderColor: 'var(--accent)', fontWeight: 600 } : undefined
              }
            >
              {s.label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </main>
    </div>
  );
}
