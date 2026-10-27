import { useSyncExternalStore } from 'react';
import { loadAvatar, removeAvatar, saveAvatar, subscribeAvatars } from '../services/avatar';
import { fileToAvatarDataUrl } from '../utils/image';

// Avatar del usuario actual: se mantiene sincronizado entre navbar y perfil.
export function useAvatar(uid: string | undefined) {
  const avatar = useSyncExternalStore(
    subscribeAvatars,
    () => (uid ? loadAvatar(uid) : null),
    () => null,
  );

  async function updateAvatar(file: File): Promise<void> {
    if (!uid) return;
    const dataUrl = await fileToAvatarDataUrl(file);
    saveAvatar(uid, dataUrl);
  }

  function resetAvatar(): void {
    if (!uid) return;
    removeAvatar(uid);
  }

  return { avatar, updateAvatar, resetAvatar };
}
