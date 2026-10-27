import type { Filter } from '../../types/filter';
import type { FiltersProps } from './Filters.types';
import './Filters.css';

const OPTIONS: Filter[] = ['todas', 'pendientes', 'completadas'];

// Navegación para filtrar las tareas por estado, con contador por opción.
export default function Filters({ filter, counts, onChange }: FiltersProps) {
  return (
    <nav className="filters" aria-label="Filtrar tareas">
      {OPTIONS.map((item) => (
        <button key={item} className={`filter ${filter === item ? 'active' : ''}`} onClick={() => onChange(item)}>
          {item} <span className="filter__count">{counts[item]}</span>
        </button>
      ))}
    </nav>
  );
}
