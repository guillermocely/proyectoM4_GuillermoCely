import type { ThemeToggleProps } from './ThemeToggle.types';
import './ThemeToggle.css';

// Botón para alternar entre tema claro y oscuro.
export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const next = theme === 'dark' ? 'claro' : 'oscuro';
  return (
    <button
      className="button secondary theme-toggle"
      type="button"
      aria-label={`Cambiar a tema ${next}`}
      title={`Cambiar a tema ${next}`}
      onClick={onToggle}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}
