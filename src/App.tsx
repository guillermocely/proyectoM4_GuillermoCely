import { useState } from 'react';
import WavesBackdrop from './components/WavesBackdrop';
import AboutModal from './components/AboutModal';
import AppRoutes from './routes';
import { useSplash } from './hooks/useSplash';
import { useTheme } from './hooks/useTheme';
import './App.css';

// Orquestador de la app: splash, tema, fondo animado y rutas de la SPA.
function App() {
  const splash = useSplash();
  const opening = splash !== 'gone';
  const { theme, toggleTheme } = useTheme();
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <WavesBackdrop text="KeepUp" scroll={!opening} />
      <div className={`keepup-app${opening ? ' is-opening' : ''}`} inert={opening}>
        <AppRoutes theme={theme} onToggleTheme={toggleTheme} onAbout={() => setAboutOpen(true)} />
      </div>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}

export default App;
