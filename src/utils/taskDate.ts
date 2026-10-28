import type { Task } from '../types/task';

// Indica si una tarea pendiente ya pasó su fecha de vencimiento.
export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) return false;
  return task.dueDate < new Date().toISOString().slice(0, 10);
}

// Avanza una fecha 'YYYY-MM-DD' un mes, ajustando al último día si no existe.
export function addOneMonth(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const nextMonth = new Date(year, month, 1);
  const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
  const nextDay = Math.min(day, lastDay);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}-${pad(nextDay)}`;
}
