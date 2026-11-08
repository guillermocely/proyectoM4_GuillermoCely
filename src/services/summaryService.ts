import type { Task } from '../types/task';

export interface SendSummaryParams {
  toEmail: string;
  userEmail: string;
  userName?: string;
  tasks: Task[];
}

export interface SendSummaryResult {
  message: string;
  messageId?: string;
  recipient: string;
}

// Envía el resumen de tareas al servidor para su despacho mediante Amazon SES.
export async function sendTasksSummary(params: SendSummaryParams): Promise<SendSummaryResult> {
  const response = await fetch('/api/send-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const rawBody = await response.text();
  let data: { message?: string; error?: string; detail?: string; recipient?: string } = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      throw new Error('Respuesta no válida del servidor.');
    }
  }

  if (!response.ok) {
    const errorMsg = data.error || `Error al enviar resumen (${response.status})`;
    throw new Error(data.detail ? `${errorMsg}: ${data.detail}` : errorMsg);
  }

  return {
    message: data.message || 'Resumen de tareas enviado correctamente.',
    recipient: data.recipient || params.toEmail,
  };
}

