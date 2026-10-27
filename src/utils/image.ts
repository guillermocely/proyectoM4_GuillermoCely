const AVATAR_SIZE = 256;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

// Convierte una imagen del equipo en un data URL cuadrado y comprimido.
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen.');
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error('La imagen no puede superar los 5 MB.');
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('No se pudo procesar la imagen.');
  }

  // Recorte tipo "cover": llena el cuadrado y centra la imagen.
  const scale = Math.max(AVATAR_SIZE / bitmap.width, AVATAR_SIZE / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  context.drawImage(
    bitmap,
    (AVATAR_SIZE - width) / 2,
    (AVATAR_SIZE - height) / 2,
    width,
    height,
  );
  bitmap.close();

  return canvas.toDataURL('image/jpeg', 0.85);
}
