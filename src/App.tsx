import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './app/chrome/Header';
import { ambient } from './features/audio/ambient';
import { SearchOverlay } from './features/search/SearchOverlay';
import { CompanionPanel } from './features/companion/CompanionPanel';
import { useSettings, useUi } from './app/store';
import { SceneBoundary } from './app/chrome/SceneBoundary';
import { ResearchLayout } from './features/research/ResearchLayout';
import { ResearchHome } from './features/research/pages/ResearchHome';
import { CataloguePage } from './features/research/pages/CataloguePage';
import { EntityPage } from './features/research/pages/EntityPage';
import { TimelinePage } from './features/research/pages/TimelinePage';
import { SourcesPage } from './features/research/pages/SourcesPage';
import { AboutPage } from './features/research/pages/AboutPage';

// The library is code-split: three.js only loads when the visitor enters,
// keeping research mode featherweight.
const GrandLibrary = lazy(() => import('./features/explorer/GrandLibrary'));

const LOADING_LORE = [
  '“That which is below is like that which is above.” — the Emerald Tablet',
  '“Know thyself, and thou shalt know the universe and the gods.” — the temple at Delphi',
  '“Pray, read, read, read, read again, labour, and thou shalt find.” — the Mutus Liber',
  '“The wise soul rules the stars.” — an alchemists’ motto',
  '“Nature delights in nature; nature conquers nature.” — pseudo-Democritus',
];

function SceneLoading() {
  const quote = LOADING_LORE[Math.floor(Math.random() * LOADING_LORE.length)];
  return (
    <div className="scene-loading" role="status">
      <span>Lighting the candles…</span>
      <span className="scene-loading-lore">{quote}</span>
    </div>
  );
}

export function App() {
  const highContrast = useSettings((s) => s.highContrast);
  const soundOn = useSettings((s) => s.soundOn);
  const { searchOpen, setSearchOpen } = useUi();

  // the ambient engine lives with the app, not the header (which the
  // immersive library hides)
  useEffect(() => {
    if (soundOn) ambient.start();
    else ambient.stop();
    return () => ambient.stop();
  }, [soundOn]);
  // the immersive Grand Library is chrome-free; the header lives in Research mode
  const { pathname } = useLocation();
  const showHeader = pathname.startsWith('/research');

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {showHeader && <Header />}
      <Suspense fallback={<SceneLoading />}>
        <Routes>
          {/* THE HALL ALWAYS GETS TO TRY.
              It used to be gated on a WebGL2 probe, and the probe was wrong
              more often than the hardware was: it exhausted iOS Safari's
              context budget by running per render, and once Safari has
              refused a site a context — which it does for a while after any
              GPU crash — the probe reports "unsupported" on a phone that ran
              the building five minutes earlier. A check that produces false
              negatives on the exact devices it exists to help is worse than
              no check, because the visitor is turned away from something that
              would have worked.
              So: mount it, and let SceneBoundary catch a real failure. The
              visitor sees the same courteous page either way, and the only
              thing lost is a slightly more specific sentence in the rare case
              the device truly has no WebGL2 at all. */}
          <Route
            path="/"
            element={
              <SceneBoundary>
                <GrandLibrary />
              </SceneBoundary>
            }
          />
          <Route path="/research" element={<ResearchLayout />}>
            <Route index element={<ResearchHome />} />
            <Route path="catalogue" element={<CataloguePage />} />
            <Route path="entity/:id" element={<EntityPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <SearchOverlay />
      <CompanionPanel />
    </>
  );
}
