import Topbar from '../../components/Topbar';
import TaskForm from '../../components/TaskForm';
import Toolbar from '../../components/Toolbar';
import Filters from '../../components/Filters';
import TaskList from '../../components/TaskList';
import Toast from '../../components/Toast';
import Mascot from '../../components/Mascot';
import { useAuth } from '../../contexts';
import { useTasks } from '../../hooks/useTasks';
import { useTaskFilters } from '../../hooks/useTaskFilters';
import { useMascotSettings } from '../../hooks/useMascotSettings';
import './Tasks.css';

// Página del gestor: compone cabecera, formulario, filtros y lista de tareas.
export default function Tasks() {
  const { user } = useAuth();
  const mascot = useMascotSettings(user?.uid);
  const {
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
  } = useTasks(user?.uid ?? '');
  const { filter, setFilter, query, setQuery, sort, setSort, visibleTasks } = useTaskFilters(tasks);

  if (!user) return null;

  if (loading) {
    return (
      <main className="app-shell">
        <p className="tasks-status">Cargando tareas...</p>
      </main>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <main className="app-shell">
        <p className="tasks-status tasks-error" role="alert">Error: {error}</p>
      </main>
    );
  }

  return (
    <>
      <main className="app-shell">
        <Topbar completed={completed} total={tasks.length} />
        <div className="progress-track" aria-label={`Progreso ${progress}%`}><div style={{ width: `${progress}%` }} /></div>
        <TaskForm onAdd={addTask} />
        {error && <p className="tasks-error" role="alert">{error}</p>}
        <Toolbar query={query} onQueryChange={setQuery} sort={sort} onSortChange={setSort} />
        <Filters
          filter={filter}
          onChange={setFilter}
          counts={{ todas: tasks.length, pendientes: tasks.length - completed, completadas: completed }}
        />
        <TaskList tasks={visibleTasks} query={query} leaving={leaving} onUpdate={updateTask} onRemove={removeTask} />
      </main>
      <Toast visible={Boolean(deleted)} message="Tarea eliminada" actionLabel="Deshacer" onAction={undoRemove} />
      {mascot.ready && (
        <Mascot userId={user.uid} settings={mascot.settings} tasks={tasks} />
      )}
    </>
  );
}
