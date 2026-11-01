import type { MascotSettings } from '../../types/mascot';

export interface MascotProfileProps {
  settings: MascotSettings;
  loading?: boolean;
  error?: string | null;
  onSave: (settings: MascotSettings) => Promise<boolean>;
}
