export type Priority = 'alta' | 'media' | 'baja';
export interface Task { id: string; userId: string; title: string; description: string; completed: boolean; priority: Priority; dueDate: string; createdAt: Date; }
