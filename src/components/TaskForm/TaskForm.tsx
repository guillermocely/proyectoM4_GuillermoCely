import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Priority } from '../../types/task';
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  validateTaskInput,
} from '../../helpers/taskValidation';
import './TaskForm.css';

interface TaskFormProps {
  onAdd: (
    title: string,
    description: string,
    priority: Priority,
    dueDate: string,
    repeatMonthly: boolean,
  ) => Promise<void>;
}

// Formulario para crear una nueva tarea.
export default function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [dueDate, setDueDate] = useState('');
  const [repeatMonthly, setRepeatMonthly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const repeatDay = dueDate ? Number(dueDate.slice(8, 10)) : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const errors = validateTaskInput({
      title: trimmedTitle,
      description: trimmedDescription,
      priority,
      dueDate,
    });

    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onAdd(
        trimmedTitle,
        trimmedDescription,
        priority,
        dueDate,
        repeatMonthly && Boolean(dueDate),
      );
      setTitle('');
      setDescription('');
      setDueDate('');
      setRepeatMonthly(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la tarea.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={submit} aria-label="Nueva tarea">
      <input
        placeholder="Título de la tarea…"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        onChange={(event) => setTitle(event.target.value)}
      />
      <textarea
        placeholder="Descripción (opcional)"
        rows={2}
        value={description}
        maxLength={DESCRIPTION_MAX_LENGTH}
        onChange={(event) => setDescription(event.target.value)}
      />
      <div className="form-row">
        <select aria-label="Prioridad" value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <input
          aria-label="Vencimiento"
          type="date"
          value={dueDate}
          onChange={(event) => {
            setDueDate(event.target.value);
            if (!event.target.value) setRepeatMonthly(false);
          }}
        />
        <button className="button primary" disabled={submitting}>
          {submitting ? 'Agregando…' : 'Agregar'}
        </button>
      </div>
      {repeatDay !== null && (
        <label className="repeat-option">
          <input
            type="checkbox"
            checked={repeatMonthly}
            onChange={(event) => setRepeatMonthly(event.target.checked)}
          />
          <span>Repetir el día {repeatDay} de cada mes</span>
        </label>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
