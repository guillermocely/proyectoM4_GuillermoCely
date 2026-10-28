import { useEffect, useRef, useState } from 'react';
import type { Priority, Task } from '../types/task';
import {
  addTask as createTask,
  completeTask,
  deleteTask,
  getTasks,
  restoreTask,
  updateTask as saveTask,
} from '../services/taskService';
import { isPermissionDenied } from '../helpers/errors';
import { validateTaskInput } from '../helpers/taskValidation';

const REMOVE_ANIMATION_MS = 280;
const UNDO_TIMEOUT_MS = 5000;

function getErrorMessage(error: unknown, fallback: string): string {
  return isPermissionDenied(error)
    ? 'No tenés permiso para acceder a estas tareas.'
    : fallback;
}

export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string[]>([]);
  const [deleted, setDeleted] = useState<{ task: Task; index: number } | null>(null);
  const pendingRemovals = useRef<number[]>([]);

  // Carga las tareas del usuario desde Firestore.
  useEffect(() => {
    if (!userId) return;
    let active = true;

    const load = async () => {
      try {
        const data = await getTasks(userId);
        if (active) {
          setTasks(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar tareas desde Firestore:', err);
        if (active) {
          setError(getErrorMessage(err, 'No se pudieron cargar las tareas.'));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [userId]);

  // Limpia los temporizadores de borrado al desmontar.
  useEffect(() => () => {
    pendingRemovals.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // Oculta el aviso de deshacer tras unos segundos.
  useEffect(() => {
    if (!deleted) return;
    const timer = window.setTimeout(() => setDeleted(null), UNDO_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [deleted]);

  async function refresh(): Promise<void> {
    if (!userId) return;
    try {
      setTasks(await getTasks(userId));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar las tareas.'));
    }
  }

  async function addTask(
    title: string,
    description: string,
    priority: Priority,
    dueDate: string,
    repeatMonthly: boolean,
  ): Promise<void> {
    const errors = validateTaskInput({ title, description, priority, dueDate });
    if (errors.length > 0) throw new Error(errors[0]);

    try {
      const task = await createTask({
        userId,
        title: title.trim(),
        description: description.trim(),
        completed: false,
        priority,
        dueDate,
        createdAt: new Date().toISOString(),
        repeatMonthly,
      });
      setTasks((current) => [task, ...current]);
      setError(null);
    } catch (err) {
      const message = getErrorMessage(err, 'No se pudo crear la tarea.');
      setError(message);
      throw new Error(message, { cause: err });
    }
  }

  async function updateTask(id: string, changes: Partial<Task>): Promise<void> {
    const target = tasks.find((task) => task.id === id);
    if (!target) return;

    try {
      // Al completar una tarea mensual se genera la siguiente ocurrencia.
      if (changes.completed === true && !target.completed && target.repeatMonthly && target.dueDate) {
        const { updated, next } = await completeTask(target);
        setTasks((current) => [
          next,
          ...current.map((task) => (task.id === id ? updated : task)),
        ]);
      } else {
        const updated = await saveTask({ ...target, ...changes });
        setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo actualizar la tarea.'));
    }
  }

  function removeTask(id: string) {
    const index = tasks.findIndex((task) => task.id === id);
    const task = tasks[index];
    if (!task) return;

    setLeaving((current) => [...current, id]);
    const timer = window.setTimeout(async () => {
      try {
        await deleteTask(task);
        setTasks((current) => current.filter((item) => item.id !== id));
        setDeleted({ task, index });
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, 'No se pudo eliminar la tarea.'));
      } finally {
        setLeaving((current) => current.filter((item) => item !== id));
        pendingRemovals.current = pendingRemovals.current.filter((item) => item !== timer);
      }
    }, REMOVE_ANIMATION_MS);

    pendingRemovals.current.push(timer);
  }

  async function undoRemove(): Promise<void> {
    if (!deleted) return;

    try {
      await restoreTask(deleted.task);
      setTasks((current) => {
        const next = [...current];
        next.splice(Math.min(deleted.index, next.length), 0, deleted.task);
        return next;
      });
      setDeleted(null);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo restaurar la tarea.'));
    }
  }

  const completed = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return {
    tasks,
    completed,
    progress,
    loading,
    error,
    leaving,
    deleted,
    addTask,
    updateTask,
    removeTask,
    undoRemove,
    refresh,
  };
}
