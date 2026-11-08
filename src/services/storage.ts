import type { Theme } from '../types/theme';

const THEME_KEY = 'keepup-theme';

// Limpia cualquier residuo previo de persistencia local (tareas, avatares o flags migratorios).
export function clearLegacyLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const legacyKeys = ['keepup-tasks', 'keepup-imported', 'keepup-dismissed'];
    legacyKeys.forEach((key) => localStorage.removeItem(key));

    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith('keepup-avatar-') ||
        key.startsWith('keepup-imported-') ||
        key.startsWith('keepup-dismissed-') ||
        key.startsWith('firebase:authUser:')
      ) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Si localStorage está restringido, omitir silenciosamente.
  }
}

export function loadStoredTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark' || saved === 'light' ? saved : null;
  } catch {
    return null;
  }
}

export function saveStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignorar
  }
}
