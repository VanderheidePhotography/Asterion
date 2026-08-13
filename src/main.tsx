import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/fonts.css';
import './styles/global.css';
import { installTextPresentation } from './features/explorer/three/glyphText';

// before anything paints: Apple platforms render the zodiac, the planets and
// the alchemical marks as colour emoji unless each one is explicitly asked for
// in its text form. See glyphText.ts.
installTextPresentation();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
