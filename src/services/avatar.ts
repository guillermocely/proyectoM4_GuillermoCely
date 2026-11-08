import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Servicio de avatares en la nube: almacena y sincroniza la imagen directamente en Cloud Firestore (users/{uid}).
const USERS_COLLECTION = 'users';

function userRef(uid: string) {
  return doc(db, USERS_COLLECTION, uid);
}

export async function loadAvatar(uid: string): Promise<string | null> {
  try {
    const snapshot = await getDoc(userRef(uid));
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return (data.avatarUrl as string) || (data.photoURL as string) || null;
  } catch {
    return null;
  }
}

export async function saveAvatar(uid: string, dataUrl: string): Promise<void> {
  await setDoc(userRef(uid), { avatarUrl: dataUrl }, { merge: true });
}

export async function removeAvatar(uid: string): Promise<void> {
  await setDoc(userRef(uid), { avatarUrl: null }, { merge: true });
}

export function subscribeAvatar(
  uid: string,
  callback: (avatarUrl: string | null) => void,
): () => void {
  return onSnapshot(
    userRef(uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      const data = snapshot.data();
      callback((data.avatarUrl as string) || (data.photoURL as string) || null);
    },
    () => {
      callback(null);
    },
  );
}
