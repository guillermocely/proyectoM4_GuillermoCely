import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { NewTask, Task } from '../types/task';
import { addOneMonth } from '../utils/taskDate';

const TASKS_COLLECTION = 'tasks';

// Lee las tareas del usuario autenticado, las más recientes primero.
export async function getTasks(userId: string): Promise<Task[]> {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<Task, 'id'>),
  }));
}

// Crea una tarea; Firestore genera el id del documento.
export async function addTask(task: NewTask): Promise<Task> {
  const docRef = await addDoc(collection(db, TASKS_COLLECTION), task);

  return { id: docRef.id, ...task };
}

// Actualiza todos los campos de una tarea existente.
export async function updateTask(task: Task): Promise<Task> {
  const { id, ...changes } = task;
  await updateDoc(doc(db, TASKS_COLLECTION, id), changes);
  return task;
}

// Elimina una tarea.
export async function deleteTask(task: Task): Promise<Task> {
  await deleteDoc(doc(db, TASKS_COLLECTION, task.id));
  return task;
}

// Restaura una tarea eliminada conservando su id (para "Deshacer").
export async function restoreTask(task: Task): Promise<void> {
  const { id, ...data } = task;
  await setDoc(doc(db, TASKS_COLLECTION, id), data);
}

// Completa una tarea y, si es mensual, crea la siguiente ocurrencia.
export async function completeTask(task: Task): Promise<{ updated: Task; next: Task }> {
  const updated: Task = { ...task, completed: true, repeatMonthly: false };
  const nextData: NewTask = {
    userId: task.userId,
    title: task.title,
    description: task.description,
    completed: false,
    priority: task.priority,
    dueDate: addOneMonth(task.dueDate),
    createdAt: new Date().toISOString(),
    repeatMonthly: true,
  };

  const nextRef = doc(collection(db, TASKS_COLLECTION));
  const batch = writeBatch(db);
  batch.update(doc(db, TASKS_COLLECTION, task.id), {
    completed: true,
    repeatMonthly: false,
  });
  batch.set(nextRef, nextData);
  await batch.commit();

  return { updated, next: { id: nextRef.id, ...nextData } };
}
