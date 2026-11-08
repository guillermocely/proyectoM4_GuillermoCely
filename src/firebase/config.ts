import { initializeApp } from 'firebase/app';
import {
  browserSessionPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase tomada de las variables de entorno (.env).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa Firebase.
export const app = initializeApp(firebaseConfig);
// Autenticación con email y contraseña.
export const auth = getAuth(app);

// Persistencia de sesión en el navegador: la sesión se elimina al cerrar la pestaña/navegador.
// Evita dejar tokens indefinidos en localStorage.
void setPersistence(auth, browserSessionPersistence);

// Proveedor para iniciar sesión con Google: siempre solicita elegir cuenta.
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Base de datos Cloud Firestore.
export const db = getFirestore(app);
