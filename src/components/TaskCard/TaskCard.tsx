import { useState } from 'react';
import { isOverdue } from '../../utils/taskDate';
import type { TaskCardProps } from './TaskCard.types';
import './TaskCard.css';

// Tarjeta de una tarea: permite completar, editar y borrar.
export default function TaskCard({ task, leaving, onUpdate, onRemove }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const overdue = isOverdue(task);

  function save() {
    onUpdate(task.id, { title: title.trim() || task.title, description: description.trim() });
    setEditing(false);
  }

  return (
    <article className={`task-card ${task.completed ? 'done' : ''}${leaving ? ' leaving' : ''}`} aria-hidden={leaving}>
      <input className="check" type="checkbox" checked={task.completed} disabled={leaving} aria-label={`Completar ${task.title}`} onChange={() => onUpdate(task.id, { completed: !task.completed })} />
      <span className={`priority ${task.priority}`} title={`Prioridad ${task.priority}`} />
      <div className="task-content">
        {editing
          ? <>
              <input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
              <textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
            </>
          : <>
              <strong>{task.title}</strong>
              {task.description && <p>{task.description}</p>}
            </>}
        {task.dueDate && <small className={overdue ? 'overdue' : ''}>{overdue ? 'Vencida' : 'Vence'} {task.dueDate}</small>}
        {task.repeatMonthly && <small className="repeat-badge">↻ Se repite cada mes</small>}
      </div>
      <div className="card-actions">
        {editing
          ? <button onClick={save}>Guardar</button>
          : <button onClick={() => { setTitle(task.title); setDescription(task.description); setEditing(true); }}>Editar</button>}
        <button className="danger" disabled={leaving} onClick={() => onRemove(task.id)}>Borrar</button>
      </div>
    </article>
  );
}
