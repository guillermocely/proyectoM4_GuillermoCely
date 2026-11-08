import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { sendTasksSummary } from '../../services/summaryService';
import { validateEmail } from '../../helpers/validations';
import type { SummaryModalProps } from './SummaryModal.types';
import './SummaryModal.css';

// Modal para configurar y enviar el resumen de tareas por correo mediante Amazon SES.
export default function SummaryModal({
  open,
  onClose,
  tasks,
  userEmail,
  userName,
}: SummaryModalProps) {
  const [recipient, setRecipient] = useState(userEmail);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRecipient(userEmail);
      setErrorMessage(null);
    }
  }, [open, userEmail]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSending) onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, isSending]);

  if (!open) return null;

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const destination = recipient.trim();
    const emailError = validateEmail(destination);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const result = await sendTasksSummary({
        toEmail: destination,
        userEmail,
        userName,
        tasks,
      });

      toast.success(result.message || '¡Resumen de tareas enviado con éxito!');
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al enviar el resumen.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={() => !isSending && onClose()}>
      <div
        className="summary-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal__close"
          aria-label="Cerrar modal"
          type="button"
          disabled={isSending}
          onClick={onClose}
        >
          ×
        </button>

        <h2 id="summary-title">Enviar resumen de tareas</h2>
        <p className="summary-modal__desc">
          Se enviará un reporte completo con el estado de tus tareas, prioridades y fechas límite mediante <strong>Amazon SES</strong>.
        </p>

        <div className="summary-modal__stats">
          <div className="summary-modal__stat">
            <span className="summary-modal__stat-value">{total}</span>
            <span className="summary-modal__stat-label">Total</span>
          </div>
          <div className="summary-modal__stat">
            <span className="summary-modal__stat-value">{pending}</span>
            <span className="summary-modal__stat-label">Pendientes</span>
          </div>
          <div className="summary-modal__stat">
            <span className="summary-modal__stat-value">{completed}</span>
            <span className="summary-modal__stat-label">Completadas</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div className="summary-modal__field">
            <label htmlFor="summary-recipient">Enviar reporte a:</label>
            <input
              id="summary-recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isSending}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          {errorMessage && (
            <p className="summary-modal__error" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="summary-modal__actions">
            <button
              className="button ghost"
              type="button"
              disabled={isSending}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="button primary"
              type="submit"
              disabled={isSending || total === 0}
            >
              {isSending ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Enviando resumen…
                </>
              ) : (
                'Enviar por correo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

