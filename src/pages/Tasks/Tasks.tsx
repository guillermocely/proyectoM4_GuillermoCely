import Topbar from '../../components/Topbar';
import TaskForm from '../../components/TaskForm';
import Toolbar from '../../components/Toolbar';
import Filters from '../../components/Filters';
import TaskList from '../../components/TaskList';
import Toast from '../../components/Toast';
import { useTasks } from '../../hooks/useTasks';
import { useTaskFilters } from '../../hooks/useTaskFilters';
import './Tasks.css';

// Página del gestor: compone cabecera, formulario, filtros y lista de tareas.
export default function Tasks() {
  const { tasks, completed, progress, leaving, deleted, addTask, updateTask, removeTask, undoRemove } = useTasks();
  const { filter, setFilter, query, setQuery, sort, setSort, visibleTasks } = useTaskFilters(tasks);

  return (
    <>
      <main className="app-shell">
        <Topbar completed={completed} total={tasks.length} />
        <div className="progress-track" aria-label={`Progreso ${progress}%`}><div style={{ width: `${progress}%` }} /></div>
        <TaskForm onAdd={addTask} />
        <Toolbar query={query} onQueryChange={setQuery} sort={sort} onSortChange={setSort} />
        <Filters
          filter={filter}
          onChange={setFilter}
          counts={{ todas: tasks.length, pendientes: tasks.length - completed, completadas: completed }}
        />
        <TaskList tasks={visibleTasks} query={query} leaving={leaving} onUpdate={updateTask} onRemove={removeTask} />
      </main>
      <Toast visible={Boolean(deleted)} message="Tarea eliminada" actionLabel="Deshacer" onAction={undoRemove} />
    </>
  );
}
