import type { TopbarProps } from './Topbar.types';
import './Topbar.css';

// Cabecera de la página del gestor: título, resumen de progreso y botón de envío de resumen.
export default function Topbar({ completed, total, onSendSummary }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <h1>Mis tareas</h1>
        <p>{completed} de {total} completadas</p>
      </div>
      {onSendSummary && (
        <button
          className="button secondary topbar__summary-btn"
          type="button"
          onClick={onSendSummary}
          title="Enviar resumen de tareas por correo mediante Amazon SES"
        >
          ✉ Enviar resumen
        </button>
      )}
    </header>
  );
}
