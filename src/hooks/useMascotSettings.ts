import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getMascotSettings, saveMascotSettings } from '../services/mascotService';
import { DEFAULT_MASCOT, normalizeSettings, type MascotSettings } from '../types/mascot';

export function useMascotSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<MascotSettings>(DEFAULT_MASCOT);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    getMascotSettings(userId)
      .then((loaded) => {
        if (active) {
          setSettings(loaded);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        console.error('Error al cargar la mascota:', err);
        if (active) setError('No se pudo cargar la configuración de tu mascota.');
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  async function save(next: MascotSettings): Promise<boolean> {
    if (!userId) return false;

    const clean = normalizeSettings(next);

    try {
      const saved = await saveMascotSettings(userId, clean);
      setSettings(saved);
      setError(null);
      toast.success(`${saved.name} quedó lista.`);
      return true;
    } catch (err) {
      console.error('Error al guardar la mascota:', err);
      setError('No se pudo guardar tu mascota.');
      toast.error('No se pudo guardar tu mascota.');
      return false;
    }
  }

  return { settings, ready, error, save };
}
