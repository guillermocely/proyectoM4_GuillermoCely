import type { Task } from '../types/task';
import type { Theme } from '../types/theme';

// Integración con localStorage: único punto de acceso a la persistencia.
const TASKS_KEY = 'keepup-tasks';
const THEME_KEY = 'keepup-theme';

export function loadStoredTasks(fallback: Task[]): Task[] {
  const saved = localStorage.getItem(TASKS_KEY);
  return saved ? (JSON.parse(saved) as Task[]) : fallback;
}

export function saveStoredTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadStoredTheme(): Theme | null {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'dark' || saved === 'light' ? saved : null;
}

export function saveStoredTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
}
