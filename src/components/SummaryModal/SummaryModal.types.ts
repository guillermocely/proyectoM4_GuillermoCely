import type { Task } from '../../types/task';

export interface SummaryModalProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  userEmail: string;
  userName?: string;
}

