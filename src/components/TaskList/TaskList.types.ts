import type { Task } from '../../types/task';

export interface TaskListProps {
  tasks: Task[];
  query: string;
  leaving: string[];
  onUpdate: (id: string, changes: Partial<Task>) => void;
  onRemove: (id: string) => void;
}
