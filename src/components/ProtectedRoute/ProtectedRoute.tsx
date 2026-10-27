import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts';

// Ruta protegida: si no hay sesión, redirige al login.
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
