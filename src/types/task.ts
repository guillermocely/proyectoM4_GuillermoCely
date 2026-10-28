export type Priority = 'alta' | 'media' | 'baja';

// Una tarea. El userId la vincula con el usuario autenticado.
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  dueDate: string;
  createdAt: string;
  repeatMonthly: boolean;
}

// Datos que se envían al service (sin id: Firestore lo genera).
export type NewTask = Omit<Task, 'id'>;
