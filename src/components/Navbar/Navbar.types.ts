import type { Theme } from '../../types/theme';

export interface NavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onAbout: () => void;
}
