import { FirebaseError } from 'firebase/app';

// Traduce los códigos de error de Firebase Auth a mensajes en español.
const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/invalid-email': 'El formato del email no es válido.',
  'auth/user-not-found': 'No existe una cuenta con ese email.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
  'auth/weak-password': 'La contraseña es demasiado débil.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de inicio de sesión.',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/network-request-failed': 'Error de red. Revisa tu conexión.',
};

const DEFAULT_MESSAGE = 'Ocurrió un error. Intenta de nuevo.';

export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    return ERROR_MESSAGES[error.code] || DEFAULT_MESSAGE;
  }
  return DEFAULT_MESSAGE;
};

// True si Firestore rechazó la operación por falta de permisos.
export const isPermissionDenied = (error: unknown): boolean =>
  error instanceof FirebaseError && error.code === 'permission-denied';
