import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import UserAvatar from '../UserAvatar';
import { useAuth } from '../../contexts';
import type { NavbarProps } from './Navbar.types';
import './Navbar.css';

// Barra de navegación compartida: marca, enlaces, perfil y cambio de tema.
export default function Navbar({ theme, onToggleTheme, onAbout }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `navbar__link${isActive ? ' is-active' : ''}`;

  const closeMenu = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link className="navbar__brand" to="/" aria-label="KeepUp, ir al inicio">
          <span className="brand">Keep<span>Up</span></span>
        </Link>

        <nav
          id="navbar-menu"
          className={`navbar__menu${open ? ' is-open' : ''}`}
          aria-label="Navegación principal"
        >
          <NavLink className={linkClass} to="/" end onClick={closeMenu}>Inicio</NavLink>
          <NavLink className={linkClass} to="/tareas" onClick={closeMenu}>Mis tareas</NavLink>
          <button
            className="navbar__link"
            type="button"
            onClick={() => {
              closeMenu();
              onAbout();
            }}
          >
            ¿Qué es KeepUp?
          </button>

          {isAuthenticated ? (
            <Link
              className="navbar__profile"
              to="/perfil"
              onClick={closeMenu}
              aria-label="Ver mi perfil"
            >
              <UserAvatar uid={user?.uid} email={user?.email} />
              <span>Mi perfil</span>
            </Link>
          ) : (
            <Link className="navbar__link" to="/login" onClick={closeMenu}>
              Iniciar sesión
            </Link>
          )}
        </nav>

        <div className="navbar__actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            className={`navbar__burger${open ? ' is-open' : ''}`}
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="navbar-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
