import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import Register from '../pages/Register';
import Tasks from '../pages/Tasks';
import type { Theme } from '../types/theme';

interface AppRoutesProps {
  theme: Theme;
  onToggleTheme: () => void;
  onAbout: () => void;
}

// Mapa de rutas de la SPA: layout compartido, autenticación y gestor protegido.
export default function AppRoutes({ theme, onToggleTheme, onAbout }: AppRoutesProps) {
  return (
    <Routes>
      <Route element={<Layout theme={theme} onToggleTheme={onToggleTheme} onAbout={onAbout} />}>
        <Route path="/" element={<Landing onAbout={onAbout} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/tareas" element={<Tasks />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
