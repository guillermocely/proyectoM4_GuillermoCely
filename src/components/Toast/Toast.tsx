import type { ToastProps } from './Toast.types';
import './Toast.css';

// Aviso flotante con acción (por ejemplo, deshacer un borrado).
export default function Toast({ visible, message, actionLabel, onAction }: ToastProps) {
  if (!visible) return null;
  return (
    <div className="toast" role="status">
      <span>{message}</span>
      <button onClick={onAction}>{actionLabel}</button>
    </div>
  );
}
