import { Link } from 'react-router-dom';
import type { LandingProps } from './Landing.types';
import './Landing.css';

// Pantalla de presentación de KeepUp.
export default function Landing({ onAbout }: LandingProps) {
  return (
    <main className="landing">
      <div className="landing__card">
        <h1>Organiza tus tareas sin perder el ritmo</h1>
        <p>KeepUp es un gestor de tareas simple y enfocado. Crea, prioriza y completa tus pendientes del día con seguimiento de progreso y fechas de vencimiento.</p>
        <ul className="landing__features">
          <li>Prioridades y fechas de vencimiento</li>
          <li>Progreso visual, filtros y contadores</li>
          <li>Búsqueda, orden y tema claro u oscuro</li>
        </ul>
        <div className="landing__actions">
          <Link className="button primary" to="/tareas">Ingresar</Link>
          <button className="button secondary" onClick={onAbout}>¿Qué es KeepUp?</button>
        </div>
      </div>
    </main>
  );
}
