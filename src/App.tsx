import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import WavesBackdrop from './components/WavesBackdrop';
import AboutModal from './components/AboutModal';
import AppRoutes from './routes';
import { useSplash } from './hooks/useSplash';
import { useTheme } from './hooks/useTheme';
import 'react-toastify/dist/ReactToastify.css';
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={theme}
      />
    </>
  );
}

export default App;
