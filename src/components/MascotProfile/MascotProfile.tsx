import { useState } from 'react';
import { toast } from 'react-toastify';
import MascotFigure from '../MascotFigure';
import {
  MASCOT_COLORS,
  MASCOT_KINDS,
  MASCOT_PERSONALITIES,
  type MascotSettings,
} from '../../types/mascot';
import type { MascotProfileProps } from './MascotProfile.types';
import './MascotProfile.css';

export default function MascotProfile({
  settings,
  loading = false,
  error = null,
  onSave,
}: MascotProfileProps) {
  const [draftOverride, setDraftOverride] = useState<MascotSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const draft = draftOverride ?? settings;

  function update(changes: Partial<MascotSettings>) {
    setDraftOverride({ ...draft, ...changes });
    setSaved(false);
  }

  async function handleSave() {
    setBusy(true);
    const ok = await onSave(draft);
    if (ok) {
      setDraftOverride(null);
      toast.success('¡Preferencias de la mascota guardadas!');
    } else {
      toast.error('No se pudieron guardar las preferencias de la mascota.');
    }
    setBusy(false);
    setSaved(ok);
  }

  return (
    <section className="mascot-profile" aria-labelledby="mascot-profile-title">
      <header className="mascot-profile__header">
        <div className="mascot-profile__preview">
          <MascotFigure kind={draft.kind} color={draft.color} />
        </div>
        <div>
          <p className="mascot-profile__eyebrow">Tu compañera de tareas</p>
          <h2 id="mascot-profile-title">Mi mascota</h2>
          <p>Elegí cómo se ve y cómo te acompaña en KeepUp.</p>
        </div>
      </header>

      {loading ? (
        <p className="mascot-profile__status" role="status">Cargando tu mascota...</p>
      ) : (
        <>
          {error && <p className="mascot-profile__error" role="alert">{error}</p>}

          <fieldset className="mascot-profile__fieldset">
            <legend>Mascota</legend>
            <div className="mascot-profile__chips">
              {MASCOT_KINDS.map((option) => (
                <button
                  key={option.value}
                  className={`mascot-profile__chip${draft.kind === option.value ? ' is-selected' : ''}`}
                  type="button"
                  aria-pressed={draft.kind === option.value}
                  onClick={() => update({ kind: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mascot-profile__name">
            <span>Nombre</span>
            <input
              maxLength={20}
              value={draft.name}
              onChange={(event) => update({ name: event.target.value })}
            />
          </label>

          <fieldset className="mascot-profile__fieldset">
            <legend>Color</legend>
            <div className="mascot-profile__colors">
              {MASCOT_COLORS.map((option) => (
                <button
                  key={option.value}
                  className={`mascot-profile__color${draft.color === option.value ? ' is-selected' : ''}`}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={draft.color === option.value}
                  title={option.label}
                  style={{ background: `var(--mascot-${option.value})` }}
                  onClick={() => update({ color: option.value })}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="mascot-profile__fieldset">
            <legend>Personalidad</legend>
            <div className="mascot-profile__chips">
              {MASCOT_PERSONALITIES.map((option) => (
                <button
                  key={option.value}
                  className={`mascot-profile__chip${draft.personality === option.value ? ' is-selected' : ''}`}
                  type="button"
                  aria-pressed={draft.personality === option.value}
                  onClick={() => update({ personality: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mascot-profile__actions">
            <button
              className="button primary mascot-profile__save"
              type="button"
              onClick={handleSave}
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Guardando…
                </>
              ) : (
                'Guardar mascota'
              )}
            </button>
            {saved && <span className="mascot-profile__saved" role="status">Guardado</span>}
          </div>
        </>
      )}
    </section>
  );
}
