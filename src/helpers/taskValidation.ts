import type { Priority } from '../types/task';

export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 5000;
const PRIORITIES: Priority[] = ['alta', 'media', 'baja'];

// Valida los datos que escribe el usuario antes de enviarlos a Firestore.
export function validateTaskInput(input: {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
}): string[] {
  const errors: string[] = [];
  const title = input.title.trim();

  if (!title) errors.push('El título es obligatorio.');
  if (title.length > TITLE_MAX_LENGTH) {
    errors.push(`El título no puede superar ${TITLE_MAX_LENGTH} caracteres.`);
  }
  if (input.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.push(`La descripción no puede superar ${DESCRIPTION_MAX_LENGTH} caracteres.`);
  }
  if (!PRIORITIES.includes(input.priority)) errors.push('La prioridad no es válida.');
  if (input.dueDate && !isValidDueDate(input.dueDate)) {
    errors.push('La fecha límite no es válida.');
  }
  return errors;
}

export function isValidDueDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day;
}
