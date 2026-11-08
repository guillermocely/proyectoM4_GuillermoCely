import { useEffect, useState } from 'react';
import { removeAvatar, saveAvatar, subscribeAvatar } from '../services/avatar';
import { fileToAvatarDataUrl } from '../utils/image';

// Avatar del usuario actual: sincronizado en tiempo real desde Cloud Firestore.
export function useAvatar(uid: string | undefined) {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setAvatar(null);
      return;
    }
    const unsubscribe = subscribeAvatar(uid, (url) => {
      setAvatar(url);
    });
    return () => unsubscribe();
  }, [uid]);

  async function updateAvatar(file: File): Promise<void> {
    if (!uid) return;
    const dataUrl = await fileToAvatarDataUrl(file);
    await saveAvatar(uid, dataUrl);
  }

  async function resetAvatar(): Promise<void> {
    if (!uid) return;
    await removeAvatar(uid);
  }

  return { avatar, updateAvatar, resetAvatar };
}
