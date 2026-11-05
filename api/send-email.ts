import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Datos que envía el formulario de contacto.
type ContactBody = {
  name: unknown;
  message: unknown;
};

// Todos los comentarios del formulario llegan a este correo.
const CONTACT_RECIPIENT = 'megaguillermo@gmail.com';

// Serverless function: recibe el formulario y envía el correo con Amazon SES.
// Las credenciales de AWS viven solo acá (variables sin prefijo VITE_).
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const body = request.body as ContactBody | undefined;

  if (!body || typeof body !== 'object') {
    response.status(400).json({ error: 'El cuerpo de la petición es inválido' });
    return;
  }

  const { name, message } = body;

  if (typeof name !== 'string' || typeof message !== 'string') {
    response.status(400).json({ error: 'El cuerpo de la petición es inválido' });
    return;
  }

  const normalizedName = name.trim();
  const normalizedMessage = message.trim();

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    response.status(400).json({
      error: 'El nombre debe tener entre 2 y 100 caracteres',
    });
    return;
  }

  if (normalizedMessage.length < 10 || normalizedMessage.length > 3000) {
    response.status(400).json({
      error: 'El comentario debe tener entre 10 y 3000 caracteres',
    });
    return;
  }

  const region = process.env.AWS_REGION?.trim();
  const from = process.env.SES_FROM_EMAIL?.trim();

  if (!region || !from) {
    console.error('Faltan variables de entorno de SES');
    response.status(500).json({
      error: 'El servidor no está configurado correctamente',
    });
    return;
  }

  const sesClient = new SESClient({ region });

  try {
    const command = new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [CONTACT_RECIPIENT] },
      Message: {
        Subject: {
          Data: `Nuevo comentario de ${normalizedName}`,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: [
              `Nombre: ${normalizedName}`,
              '',
              normalizedMessage,
            ].join('\n'),
            Charset: 'UTF-8',
          },
        },
      },
    });

    const result = await sesClient.send(command);

    response.status(200).json({
      message: 'Comentario enviado correctamente',
      messageId: result.MessageId,
    });
  } catch (error: unknown) {
    console.error('Error enviando el comentario con SES:', error);
    response.status(500).json({
      error: 'No se pudo enviar el comentario',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
