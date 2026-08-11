import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSettings, useUi } from '../store';

const NAV = [
  { to: '/', label: 'The Grand Library', end: true },
  { to: '/research', label: 'Research Hall' },
];

export function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inResearch = pathname.startsWith('/research');
  const { soundOn, toggleSound, motion, setMotion, highContrast, toggleHighContrast } = useSettings();
  const { setSearchOpen, companionOpen, setCompanionOpen } = useUi();

  return (
    <header className="site-header">
      <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
        <span className="brand-name">ASTERION</span>
        <span className="brand-sub">A museum of esoteric history</span>
      </a>
      <nav className="header-nav" aria-label="Rooms">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="header-actions">
        <div className="mode-switch" role="group" aria-label="Viewing mode">
          <button aria-pressed={!inResearch} onClick={() => navigate('/')}>
            Explorer
          </button>
          <button aria-pressed={inResearch} onClick={() => navigate('/research')}>
            Research
          </button>
        </div>
        <button className="icon-btn" onClick={() => setSearchOpen(true)}>
          Search <span className="kbd-hint" aria-hidden="true">⌘K</span>
        </button>
        <button
          className="icon-btn"
          aria-pressed={companionOpen}
          onClick={() => setCompanionOpen(!companionOpen)}
        >
          The Archivist
        </button>
        <button
          className="icon-btn"
          aria-pressed={soundOn}
          onClick={toggleSound}
          title="Ambient sound"
        >
          {soundOn ? 'Sound on' : 'Sound off'}
        </button>
        <button
          className="icon-btn"
          aria-pressed={motion === 'reduced'}
          onClick={() => setMotion(motion === 'reduced' ? 'system' : 'reduced')}
          title="Reduce motion in immersive scenes"
        >
          Calm
        </button>
        <button
          className="icon-btn"
          aria-pressed={highContrast}
          onClick={toggleHighContrast}
          title="High contrast text"
        >
          Contrast
        </button>
      </div>
    </header>
  );
}
