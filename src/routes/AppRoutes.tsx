import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Landing from '../pages/Landing';
import Tasks from '../pages/Tasks';
import type { Theme } from '../types/theme';

interface AppRoutesProps {
  theme: Theme;
  onToggleTheme: () => void;
  onAbout: () => void;
}

// Mapa de rutas de la SPA: layout compartido con landing pública y gestor de tareas.
export default function AppRoutes({ theme, onToggleTheme, onAbout }: AppRoutesProps) {
  return (
    <Routes>
      <Route element={<Layout theme={theme} onToggleTheme={onToggleTheme} onAbout={onAbout} />}>
        <Route path="/" element={<Landing onAbout={onAbout} />} />
        <Route path="/tareas" element={<Tasks />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
