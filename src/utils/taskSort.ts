import type { Priority, Task } from '../types/task';
import type { Sort } from '../types/filter';

// Orden numérico de las prioridades (menor = más urgente).
export const PRIORITY_ORDER: Record<Priority, number> = { alta: 0, media: 1, baja: 2 };

// Devuelve una copia ordenada de las tareas según el criterio recibido.
export function sortTasks(tasks: Task[], sort: Sort): Task[] {
  if (sort === 'recientes') return tasks;

  return [...tasks].sort((a, b) => {
    if (sort === 'prioridad') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (sort === 'titulo') return a.title.localeCompare(b.title, 'es');
    if (!a.dueDate) return b.dueDate ? 1 : 0;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}
