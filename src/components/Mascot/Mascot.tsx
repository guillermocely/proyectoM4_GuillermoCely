import { useEffect, useRef, useState, type FormEvent } from 'react';
import MascotFigure from '../MascotFigure';
import { useAuth } from '../../contexts';
import {
  addMascotMessage,
  clearMascotMessages,
  getMascotMessages,
} from '../../services/mascotService';
import { mascotGreeting, type MascotMessage } from '../../types/mascot';
import type { MascotProps } from './Mascot.types';
import './Mascot.css';

interface ChatResponse {
  reply?: string | null;
  error?: string;
}

export default function Mascot({ userId, settings, tasks }: MascotProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<MascotMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = 'mascot-chat-panel';

  useEffect(() => {
    let active = true;

    getMascotMessages(userId)
      .then((history) => {
        if (active) setMessages(history);
      })
      .catch((err: unknown) => {
        console.error('Error al cargar el chat de la mascota:', err);
        if (active) setError('No se pudo cargar el historial.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ block: 'end' });
    inputRef.current?.focus();
  }, [messages, thinking, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = text.trim();
    if (!message || thinking || loading) return;

    setText('');
    setError(null);
    setThinking(true);

    const history = messages.slice(-12).map(({ role, content }) => ({ role, content }));
    const optimistic: MascotMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);
    void addMascotMessage(userId, 'user', message).catch((err: unknown) => {
      console.error('No se pudo guardar el mensaje:', err);
    });

    try {
      if (!user) throw new Error('Tenés que iniciar sesión para hablar con tu mascota.');

      const idToken = await user.getIdToken();
      const response = await fetch('/api/mascot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          message,
          history,
          settings,
          tasks: tasks.slice(0, 30).map(({ title, priority, dueDate, completed }) => ({
            title,
            priority,
            dueDate,
            completed,
          })),
        }),
      });
      const data = (await response.json()) as ChatResponse;

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'No pude responder ahora. Probá de nuevo.');
      }

      const saved = await addMascotMessage(userId, 'assistant', data.reply).catch((err: unknown) => {
        console.error('No se pudo guardar la respuesta:', err);
        return null;
      });
      const reply: MascotMessage = saved ?? {
        id: `local-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, reply]);
    } catch (err) {
      const messageText = err instanceof Error
        ? err.message
        : 'No pude responder ahora. Probá de nuevo.';
      setError(messageText);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  }

  async function handleClear() {
    if (!window.confirm('¿Querés borrar todo el historial del chat?')) return;

    setThinking(true);
    try {
      await clearMascotMessages(userId);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('No se pudo borrar el chat:', err);
      setError('No se pudo borrar el historial.');
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className={`mascot-chat${open ? ' is-open' : ''}`}>
      {open && (
        <section
          id={panelId}
          className="mascot-chat__panel"
          aria-label={`Chat con ${settings.name}`}
        >
          <header className="mascot-chat__header">
            <div className="mascot-chat__identity">
              <span className={`mascot-chat__avatar mascot-color-${settings.color}`}>
                <MascotFigure kind={settings.kind} color={settings.color} />
              </span>
              <div>
                <strong>{settings.name}</strong>
                <span>Solo consejos; no modifica tareas</span>
              </div>
            </div>
            <div className="mascot-chat__header-actions">
              <button type="button" onClick={handleClear} disabled={thinking}>
                Borrar
              </button>
              <button type="button" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>
          </header>

          <div className="mascot-chat__log" role="log" aria-live="polite">
            {loading ? (
              <p className="mascot-chat__status" role="status">Cargando historial...</p>
            ) : messages.length === 0 ? (
              <p className="mascot-chat__welcome">{mascotGreeting(settings)}</p>
            ) : (
              messages.map((message) => (
                <p
                  key={message.id}
                  className={`mascot-chat__message mascot-chat__message--${message.role}`}
                >
                  {message.content}
                </p>
              ))
            )}

            {thinking && (
              <p className="mascot-chat__dots" aria-label={`${settings.name} está pensando`}>
                <span />
                <span />
                <span />
              </p>
            )}
            {error && <p className="mascot-chat__error" role="alert">{error}</p>}
            <div ref={endRef} />
          </div>

          <form className="mascot-chat__form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              aria-label={`Preguntale a ${settings.name}`}
              placeholder={`Preguntale a ${settings.name}...`}
              value={text}
              maxLength={1000}
              autoComplete="off"
              enterKeyHint="send"
              disabled={loading}
              onChange={(event) => setText(event.target.value)}
            />
            <button type="submit" disabled={loading || thinking || !text.trim()}>
              Enviar
            </button>
          </form>
        </section>
      )}

      <button
        className="mascot-chat__trigger"
        type="button"
        aria-label={`Hablar con ${settings.name}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <MascotFigure kind={settings.kind} color={settings.color} />
      </button>
    </div>
  );
}
