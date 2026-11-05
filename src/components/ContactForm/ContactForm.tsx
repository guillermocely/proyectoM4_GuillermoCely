import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { ContactFormStatus } from './ContactForm.types';
import './ContactForm.css';

type ApiResponse = {
  message?: string;
  error?: string;
  detail?: string;
};

const INITIAL_VALUES = {
  name: '',
  message: '',
};

// Formulario de contacto: envía los datos a la serverless function que usa SES.
export default function ContactForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [status, setStatus] = useState<ContactFormStatus>('idle');
  const [feedback, setFeedback] = useState('');

  const isSending = status === 'loading';

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setStatus('loading');
    setFeedback('Enviando mensaje...');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const rawBody = await response.text();
      let data: ApiResponse = {};

      if (rawBody) {
        try {
          data = JSON.parse(rawBody) as ApiResponse;
        } catch {
          throw new Error('El servidor devolvió una respuesta inválida.');
        }
      }

      if (!response.ok) {
        const errorMessage =
          data.error ?? `No se pudo enviar el mensaje (${response.status}).`;

        throw new Error(
          data.detail ? `${errorMessage}: ${data.detail}` : errorMessage,
        );
      }

      setStatus('success');
      setFeedback(data.message ?? 'Mensaje enviado correctamente.');
      setValues(INITIAL_VALUES);
    } catch (error) {
      setStatus('error');
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.',
      );
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form__field">
        <label htmlFor="contact-name">Nombre</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          minLength={2}
          maxLength={100}
          autoComplete="name"
          required
        />
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-message">Comentario</label>
        <textarea
          id="contact-message"
          name="message"
          value={values.message}
          onChange={handleChange}
          placeholder="Escribe tu consulta, sugerencia u observación..."
          minLength={10}
          maxLength={3000}
          rows={6}
          required
        />
      </div>

      <button className="button primary contact-form__submit" type="submit" disabled={isSending}>
        {isSending ? 'Enviando...' : 'Enviar mensaje'}
      </button>

      {feedback && (
        <p
          className={`contact-form__feedback is-${status}`}
          role={status === 'error' ? 'alert' : 'status'}
        >
          {feedback}
        </p>
      )}
    </form>
  );
}
