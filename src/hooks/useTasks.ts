import { useEffect, useRef, useState } from 'react';
import type { Priority, Task } from '../types/task';
import { loadStoredTasks, saveStoredTasks } from '../services/storage';

const REMOVE_ANIMATION_MS = 280;
const UNDO_TIMEOUT_MS = 5000;

// Tareas de ejemplo que se muestran la primera vez.
const initialTasks: Task[] = [
  { id: '1', userId: 'local', title: 'Revisar pendientes del día', description: 'Organizar las tareas más importantes antes de comenzar.', completed: false, priority: 'alta', dueDate: '', createdAt: new Date() },
  { id: '2', userId: 'local', title: 'Preparar reunión de equipo', description: 'Reunir los puntos principales para la reunión semanal.', completed: true, priority: 'media', dueDate: '', createdAt: new Date() },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks(initialTasks));
  const [leaving, setLeaving] = useState<string[]>([]);
  const [deleted, setDeleted] = useState<{ task: Task; index: number } | null>(null);
  const pendingRemovals = useRef<number[]>([]);

  // Persiste las tareas cada vez que cambian.
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

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

  function addTask(title: string, description: string, priority: Priority, dueDate: string) {
    setTasks((current) => [
      { id: crypto.randomUUID(), userId: 'local', title, description, priority, dueDate, completed: false, createdAt: new Date() },
      ...current,
    ]);
  }

  function updateTask(id: string, changes: Partial<Task>) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...changes } : task)));
  }

  function removeTask(id: string) {
    const index = tasks.findIndex((task) => task.id === id);
    const task = tasks[index];
    if (!task) return;
    setLeaving((current) => [...current, id]);
    const timer = window.setTimeout(() => {
      setTasks((current) => current.filter((item) => item.id !== id));
      setLeaving((current) => current.filter((item) => item !== id));
      setDeleted({ task, index });
      pendingRemovals.current = pendingRemovals.current.filter((item) => item !== timer);
    }, REMOVE_ANIMATION_MS);
    pendingRemovals.current.push(timer);
  }

  function undoRemove() {
    if (!deleted) return;
    setTasks((current) => {
      const next = [...current];
      next.splice(Math.min(deleted.index, next.length), 0, deleted.task);
      return next;
    });
    setDeleted(null);
  }

  const completed = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return { tasks, completed, progress, leaving, deleted, addTask, updateTask, removeTask, undoRemove };
}
