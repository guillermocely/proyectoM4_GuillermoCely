import type { Theme } from '../../types/theme';

export interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}
