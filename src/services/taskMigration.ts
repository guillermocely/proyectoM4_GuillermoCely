import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import type { NewTask, Priority, Task } from '../types/task';
import { isValidDueDate } from '../helpers/taskValidation';

const LEGACY_KEY = 'keepup-tasks';
const BATCH_SIZE = 400;

const importFlag = (userId: string) => `keepup-imported-${userId}`;
const dismissFlag = (userId: string) => `keepup-import-dismissed-${userId}`;

export function getLegacyTasksRaw(): string | null {
  return localStorage.getItem(LEGACY_KEY);
}

export function countLegacyTasks(): number {
  try {
    const raw = getLegacyTasksRaw();
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export function hasPendingLegacyTasks(userId: string): boolean {
  return countLegacyTasks() > 0
    && !localStorage.getItem(importFlag(userId))
    && !localStorage.getItem(dismissFlag(userId));
}

// Oculta el aviso para esta cuenta sin importar ni borrar nada.
export function dismissLegacyImport(userId: string): void {
  localStorage.setItem(dismissFlag(userId), '1');
}

function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function toPriority(value: unknown): Priority {
  return value === 'alta' || value === 'baja' ? value : 'media';
}

// Importa las tareas guardadas en localStorage a la cuenta actual.
// No borra la copia local: solo escribe en Firestore.
export async function importLegacyTasks(userId: string): Promise<number> {
  if (localStorage.getItem(importFlag(userId))) return 0;

  const raw = getLegacyTasksRaw();
  if (!raw) return 0;

  const legacy = JSON.parse(raw) as Array<Partial<Task>>;
  const docs: Array<{ id: string; data: NewTask }> = [];

  for (const item of legacy) {
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!title) continue;

    const dueDate = typeof item.dueDate === 'string' && isValidDueDate(item.dueDate)
      ? item.dueDate
      : '';

    docs.push({
      id: typeof item.id === 'string' && item.id
        ? `legacy_${userId}_${item.id}`
        : `legacy_${userId}_${crypto.randomUUID()}`,
      data: {
        userId,
        title,
        description: typeof item.description === 'string' ? item.description : '',
        completed: Boolean(item.completed),
        priority: toPriority(item.priority),
        dueDate,
        createdAt: toIsoString(item.createdAt),
        repeatMonthly: Boolean(item.repeatMonthly),
      },
    });
  }

  for (let start = 0; start < docs.length; start += BATCH_SIZE) {
    const batch = writeBatch(db);
    for (const item of docs.slice(start, start + BATCH_SIZE)) {
      batch.set(doc(db, 'tasks', item.id), item.data);
    }
    await batch.commit();
  }

  localStorage.setItem(importFlag(userId), '1');
  return docs.length;
}
