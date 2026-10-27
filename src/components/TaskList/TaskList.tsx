import TaskCard from '../TaskCard';
import type { TaskListProps } from './TaskList.types';
import './TaskList.css';

// Lista de tareas; muestra un mensaje cuando no hay resultados.
export default function TaskList({ tasks, query, leaving, onUpdate, onRemove }: TaskListProps) {
  return (
    <section className="task-list" aria-live="polite">
      {tasks.length
        ? tasks.map((task) => (
            <TaskCard key={task.id} task={task} leaving={leaving.includes(task.id)} onUpdate={onUpdate} onRemove={onRemove} />
          ))
        : <div className="empty">{query ? 'Sin resultados para tu búsqueda.' : 'No hay tareas en esta vista todavía.'}</div>}
    </section>
  );
}
