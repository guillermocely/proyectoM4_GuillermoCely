import type { Task } from '../../types/task';

export interface TaskCardProps {
  task: Task;
  leaving: boolean;
  onUpdate: (id: string, changes: Partial<Task>) => Promise<void> | void;
  onRemove: (id: string) => void;
}
