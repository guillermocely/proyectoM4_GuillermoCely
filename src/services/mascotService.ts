import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  DEFAULT_MASCOT,
  normalizeSettings,
  type MascotMessage,
  type MascotRole,
  type MascotSettings,
} from '../types/mascot';

const USERS_COLLECTION = 'users';
const MASCOT_COLLECTION = 'mascot';
const SETTINGS_DOCUMENT = 'settings';
const MESSAGES_COLLECTION = 'mascotMessages';
const HISTORY_LIMIT = 80;
const BATCH_SIZE = 400;

function settingsRef(userId: string) {
  return doc(db, USERS_COLLECTION, userId, MASCOT_COLLECTION, SETTINGS_DOCUMENT);
}

function messagesRef(userId: string) {
  return collection(db, USERS_COLLECTION, userId, MESSAGES_COLLECTION);
}

export async function getMascotSettings(userId: string): Promise<MascotSettings> {
  const snapshot = await getDoc(settingsRef(userId));
  return snapshot.exists()
    ? normalizeSettings(snapshot.data() as Partial<MascotSettings>)
    : DEFAULT_MASCOT;
}

export async function saveMascotSettings(
  userId: string,
  settings: MascotSettings,
): Promise<MascotSettings> {
  const clean = normalizeSettings(settings);
  await setDoc(
    settingsRef(userId),
    { ...clean, updatedAt: new Date().toISOString() },
    { merge: true },
  );
  return clean;
}

export async function getMascotMessages(userId: string): Promise<MascotMessage[]> {
  const snapshot = await getDocs(
    query(messagesRef(userId), orderBy('createdAt', 'asc'), limit(HISTORY_LIMIT)),
  );

  return snapshot.docs.map((item) => {
    const data = item.data() as Omit<MascotMessage, 'id'>;
    return {
      id: item.id,
      role: data.role,
      content: data.content,
      createdAt: data.createdAt,
    };
  });
}

export async function addMascotMessage(
  userId: string,
  role: MascotRole,
  content: string,
): Promise<MascotMessage> {
  const message = {
    role,
    content: content.trim().slice(0, 1000),
    createdAt: new Date().toISOString(),
  };
  const reference = await addDoc(messagesRef(userId), message);
  return { id: reference.id, ...message };
}

export async function clearMascotMessages(userId: string): Promise<void> {
  const snapshot = await getDocs(messagesRef(userId));
  const docs = snapshot.docs;

  for (let start = 0; start < docs.length; start += BATCH_SIZE) {
    const batch = writeBatch(db);
    docs.slice(start, start + BATCH_SIZE).forEach((item) => {
      batch.delete(doc(db, USERS_COLLECTION, userId, MESSAGES_COLLECTION, item.id));
    });
    await batch.commit();
  }
}
