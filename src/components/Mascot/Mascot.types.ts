import type { MascotSettings } from '../../types/mascot';
import type { Task } from '../../types/task';

export interface MascotProps {
  userId: string;
  settings: MascotSettings;
  tasks: Task[];
}
