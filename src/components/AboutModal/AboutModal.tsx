import { useEffect } from 'react';
import type { AboutModalProps } from './AboutModal.types';
import './AboutModal.css';

// Modal informativo que explica qué es KeepUp.
export default function AboutModal({ open, onClose }: AboutModalProps) {
  // Cierra con Escape y bloquea el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal__close" aria-label="Cerrar" onClick={onClose}>×</button>
        <span className="brand">Keep<span>Up</span></span>
        <h2 id="about-title">¿Qué es KeepUp?</h2>
        <p>KeepUp es un gestor de tareas orientado a la acción: captura lo pendiente, ordénalo por prioridad y observa tu avance de un vistazo.</p>
        <ul className="modal__list">
          <li><strong>Captura rápida:</strong> título, descripción, prioridad y fecha de vencimiento.</li>
          <li><strong>Progreso visible:</strong> barra de avance y contador por estado.</li>
          <li><strong>Encuentra todo:</strong> búsqueda por texto y orden por prioridad, vencimiento o título.</li>
          <li><strong>A tu gusto:</strong> tema claro u oscuro y datos guardados en tu navegador.</li>
        </ul>
        <button className="button primary" onClick={onClose}>Entendido</button>
      </div>
    </div>
  );
}
