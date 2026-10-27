import type { Sort } from '../../types/filter';
import type { ToolbarProps } from './Toolbar.types';
import './Toolbar.css';

// Barra con buscador de texto y selector de orden.
export default function Toolbar({ query, onQueryChange, sort, onSortChange }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="search">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Buscar por título o descripción…"
          aria-label="Buscar tareas"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query && <button className="clear" aria-label="Limpiar búsqueda" onClick={() => onQueryChange('')}>×</button>}
      </div>
      <label className="sort">
        Ordenar
        <select value={sort} onChange={(event) => onSortChange(event.target.value as Sort)}>
          <option value="recientes">Recientes</option>
          <option value="prioridad">Prioridad</option>
          <option value="vencimiento">Vencimiento</option>
          <option value="titulo">Título</option>
        </select>
      </label>
    </div>
  );
}
