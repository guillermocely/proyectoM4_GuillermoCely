import type { TopbarProps } from './Topbar.types';
import './Topbar.css';

// Cabecera de la página del gestor: título y resumen de progreso.
export default function Topbar({ completed, total }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <h1>Mis tareas</h1>
        <p>{completed} de {total} completadas · modo local</p>
      </div>
    </header>
  );
}
