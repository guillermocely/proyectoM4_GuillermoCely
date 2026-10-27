import { useEffect, useState } from 'react';
import type { Theme } from '../types/theme';
import { loadStoredTheme, saveStoredTheme } from '../services/storage';

// Tema inicial: lo guardado en storage o la preferencia del sistema.
function getInitialTheme(): Theme {
  const saved = loadStoredTheme();
  if (saved) return saved;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
}
