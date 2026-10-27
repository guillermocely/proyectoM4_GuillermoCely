import type { Theme } from '../../types/theme';

export interface LayoutProps {
  theme: Theme;
  onToggleTheme: () => void;
  onAbout: () => void;
}
