import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { useEffect, useState, type ReactNode } from 'react';
import { auth } from '../firebase';
import { AuthContext } from './authContext';

// Proveedor que comparte el usuario y las acciones de sesión con toda la app.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Escucha si alguien inicia o cierra sesión.
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
