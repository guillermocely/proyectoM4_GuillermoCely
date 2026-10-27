import type { Task } from '../../types/task';

export interface TaskCardProps {
  task: Task;
  leaving: boolean;
  onUpdate: (id: string, changes: Partial<Task>) => void;
  onRemove: (id: string) => void;
}
