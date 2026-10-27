import type { Task } from '../types/task';

// Indica si una tarea pendiente ya pasó su fecha de vencimiento.
export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) return false;
  return task.dueDate < new Date().toISOString().slice(0, 10);
}
