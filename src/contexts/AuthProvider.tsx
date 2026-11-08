import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState, type ReactNode } from 'react';
import { auth, db } from '../firebase';
import { AuthContext } from './authContext';

// Proveedor que comparte el usuario y las acciones de sesión con toda la app.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Escucha si alguien inicia o cierra sesión y sincroniza el perfil/sesión en Firestore.
  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          const now = new Date().toISOString();

          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email ?? '',
              displayName: currentUser.displayName ?? '',
              photoURL: currentUser.photoURL ?? null,
              createdAt: currentUser.metadata.creationTime ?? now,
              lastLoginAt: now,
            });
          } else {
            await setDoc(
              userRef,
              {
                email: currentUser.email ?? '',
                displayName: currentUser.displayName || userDoc.data()?.displayName || '',
                lastLoginAt: now,
              },
              { merge: true },
            );
          }
        } catch (error) {
          // Si las reglas en Firebase Console aún no fueron publicadas para /users/{userId}
          console.warn(
            'Nota: Si ves error de permisos en /users, publica las reglas actualizadas de firestore.rules en Firebase Console.',
            error,
          );
        }
      }
    });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.clear();
      } catch {
        // ignorar
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
