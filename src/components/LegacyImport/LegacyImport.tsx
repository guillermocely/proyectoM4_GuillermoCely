import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  countLegacyTasks,
  dismissLegacyImport,
  getLegacyTasksRaw,
  hasPendingLegacyTasks,
  importLegacyTasks,
} from '../../services/taskMigration';
import type { LegacyImportProps } from './LegacyImport.types';
import './LegacyImport.css';

// Ofrece pasar las tareas viejas de localStorage a Firestore sin borrar el original.
export default function LegacyImport({ userId, onImported }: LegacyImportProps) {
  const [count] = useState(() => countLegacyTasks());
  const [pending, setPending] = useState(() => hasPendingLegacyTasks(userId));
  const [importing, setImporting] = useState(false);

  if (!pending || count === 0) return null;

  function downloadBackup() {
    const raw = getLegacyTasksRaw();
    if (!raw) return;
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'keepup-tareas-locales.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    const confirmed = window.confirm(
      `Se importarán ${count} tareas guardadas en este navegador a la cuenta actual. `
      + 'No se borrarán del navegador. Si estas tareas no son de esta cuenta, cancelá. ¿Continuar?',
    );
    if (!confirmed) return;

    setImporting(true);
    try {
      const imported = await importLegacyTasks(userId);
      setPending(false);
      await onImported();
      toast.success(`${imported} tareas importadas a tu cuenta.`);
    } catch {
      toast.error('No se pudieron importar las tareas. Intentá de nuevo.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="legacy-import" aria-label="Tareas locales">
      <div>
        <strong>Tenés {count} tareas guardadas en este navegador.</strong>
        <p>Están en el navegador, no en esta cuenta. Podés importarlas; la copia local no se borra.</p>
      </div>
      <div className="legacy-import__actions">
        <button className="button ghost" type="button" onClick={downloadBackup}>
          Descargar copia
        </button>
        <button className="button ghost" type="button" onClick={() => { dismissLegacyImport(userId); setPending(false); }}>
          Ahora no
        </button>
        <button
          className="button primary"
          type="button"
          onClick={() => void handleImport()}
          disabled={importing}
        >
          {importing ? 'Importando…' : 'Importar a mi cuenta'}
        </button>
      </div>
    </section>
  );
}
