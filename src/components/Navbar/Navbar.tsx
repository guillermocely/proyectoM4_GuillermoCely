import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import type { NavbarProps } from './Navbar.types';
import './Navbar.css';

// Barra de navegación compartida: marca, enlaces y cambio de tema.
export default function Navbar({ theme, onToggleTheme, onAbout }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `navbar__link${isActive ? ' is-active' : ''}`;

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
          <NavLink className={linkClass} to="/" end onClick={() => setOpen(false)}>Inicio</NavLink>
          <NavLink className={linkClass} to="/tareas" onClick={() => setOpen(false)}>Mis tareas</NavLink>
          <button
            className="navbar__link"
            type="button"
            onClick={() => {
              setOpen(false);
              onAbout();
            }}
          >
            ¿Qué es KeepUp?
          </button>
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
