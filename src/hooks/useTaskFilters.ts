import { useMemo, useState } from 'react';
import type { Task } from '../types/task';
import type { Filter, Sort } from '../types/filter';
import { sortTasks } from '../utils/taskSort';

export function useTaskFilters(tasks: Task[]) {
  const [filter, setFilter] = useState<Filter>('todas');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('recientes');

  // Aplica filtro de estado, búsqueda por texto y orden.
  const visibleTasks = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = tasks.filter((task) => {
      if (filter === 'completadas' && !task.completed) return false;
      if (filter === 'pendientes' && task.completed) return false;
      if (!term) return true;
      return `${task.title} ${task.description}`.toLowerCase().includes(term);
    });
    return sortTasks(filtered, sort);
  }, [tasks, filter, query, sort]);

  return { filter, setFilter, query, setQuery, sort, setSort, visibleTasks };
}
