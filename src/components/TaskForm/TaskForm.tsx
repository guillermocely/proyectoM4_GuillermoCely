import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Priority } from '../../types/task';
import './TaskForm.css';

interface TaskFormProps {
  onAdd: (
    title: string,
    description: string,
    priority: Priority,
    dueDate: string,
    repeatMonthly: boolean,
  ) => void;
}

// Formulario para crear una nueva tarea.
export default function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [dueDate, setDueDate] = useState('');
  const [repeatMonthly, setRepeatMonthly] = useState(false);

  const repeatDay = dueDate ? Number(dueDate.slice(8, 10)) : null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), description.trim(), priority, dueDate, repeatMonthly && Boolean(dueDate));
    setTitle('');
    setDescription('');
    setDueDate('');
    setRepeatMonthly(false);
  }

  return (
    <form className="task-form" onSubmit={submit} aria-label="Nueva tarea">
      <input placeholder="Título de la tarea…" value={title} onChange={(event) => setTitle(event.target.value)} />
      <textarea placeholder="Descripción (opcional)" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
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
        <button className="button primary">Agregar</button>
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
    </form>
  );
}
