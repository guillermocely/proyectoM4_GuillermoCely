// Servicio de avatares: guarda la imagen (data URL) por usuario en localStorage.
const AVATAR_KEY_PREFIX = 'keepup-avatar-';
const listeners = new Set<() => void>();

const avatarKey = (uid: string) => `${AVATAR_KEY_PREFIX}${uid}`;

export function loadAvatar(uid: string): string | null {
  return localStorage.getItem(avatarKey(uid));
}

export function saveAvatar(uid: string, dataUrl: string): void {
  localStorage.setItem(avatarKey(uid), dataUrl);
  emitAvatarChange();
}

export function removeAvatar(uid: string): void {
  localStorage.removeItem(avatarKey(uid));
  emitAvatarChange();
}

export function subscribeAvatars(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitAvatarChange(): void {
  listeners.forEach((listener) => listener());
}
