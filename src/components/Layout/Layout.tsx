import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import type { LayoutProps } from './Layout.types';
import './Layout.css';

// Marco común de las páginas: barra de navegación y contenido de la ruta.
export default function Layout({ theme, onToggleTheme, onAbout }: LayoutProps) {
  return (
    <div className="layout">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} onAbout={onAbout} />
      <Outlet />
    </div>
  );
}
