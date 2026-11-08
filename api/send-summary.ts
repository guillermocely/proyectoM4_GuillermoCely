import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type TaskSummaryItem = {
  title: string;
  description?: string;
  priority: 'alta' | 'media' | 'baja';
  dueDate?: string;
  completed: boolean;
  repeatMonthly?: boolean;
};

type SummaryBody = {
  toEmail?: unknown;
  userEmail?: unknown;
  userName?: unknown;
  tasks?: unknown;
};

// Genera la versión de texto plano del resumen de tareas.
function buildPlainTextSummary(params: {
  recipient: string;
  userEmail: string;
  userName: string;
  tasks: TaskSummaryItem[];
  completedCount: number;
  pendingCount: number;
  progressPercent: number;
}): string {
  const { recipient, userEmail, userName, tasks, completedCount, pendingCount, progressPercent } = params;
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const lines: string[] = [
    '========================================',
    '        KEEPUP · RESUMEN DE TAREAS      ',
    '========================================',
    '',
    `Hola ${userName || userEmail},`,
    '',
    `Este es el resumen actualizado de tus tareas en KeepUp.`,
    `Fecha: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    '',
    '----------------------------------------',
    '  ESTADO GENERAL',
    '----------------------------------------',
    `• Total de tareas: ${tasks.length}`,
    `• Completadas:    ${completedCount} (${progressPercent}%)`,
    `• Pendientes:     ${pendingCount}`,
    '',
    '----------------------------------------',
    '  TAREAS PENDIENTES',
    '----------------------------------------',
  ];

  if (pendingTasks.length === 0) {
    lines.push('¡No tienes tareas pendientes! Estás al día.');
  } else {
    pendingTasks.forEach((task, index) => {
      const priorityLabel = task.priority.toUpperCase();
      const dueDateLabel = task.dueDate ? ` | Vence: ${task.dueDate}` : '';
      const monthlyLabel = task.repeatMonthly ? ' | (Recurrente mensual)' : '';
      lines.push(`${index + 1}. [${priorityLabel}] ${task.title}${dueDateLabel}${monthlyLabel}`);
      if (task.description) {
        lines.push(`   ${task.description}`);
      }
    });
  }

  lines.push('');
  lines.push('----------------------------------------');
  lines.push('  TAREAS COMPLETADAS');
  lines.push('----------------------------------------');

  if (completedTasks.length === 0) {
    lines.push('Aún no has completado ninguna tarea.');
  } else {
    completedTasks.forEach((task) => {
      lines.push(`✓ ${task.title}`);
    });
  }

  lines.push('');
  lines.push('========================================');
  lines.push(`Enviado desde KeepUp para ${recipient}`);
  lines.push('========================================');

  return lines.join('\n');
}

// Genera la versión HTML con diseño moderno para el correo.
function buildHtmlSummary(params: {
  recipient: string;
  userEmail: string;
  userName: string;
  tasks: TaskSummaryItem[];
  completedCount: number;
  pendingCount: number;
  progressPercent: number;
}): string {
  const { userEmail, userName, tasks, completedCount, pendingCount, progressPercent } = params;
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const priorityColor: Record<string, { bg: string; text: string }> = {
    alta: { bg: '#fee2e2', text: '#b91c1c' },
    media: { bg: '#fef3c7', text: '#b45309' },
    baja: { bg: '#dcfce7', text: '#15803d' },
  };

  const pendingRows = pendingTasks.length === 0
    ? '<tr><td colspan="3" style="padding: 16px; text-align: center; color: #6b7280;">¡No tienes tareas pendientes! Estás al día. 🎉</td></tr>'
    : pendingTasks.map((t) => {
        const p = priorityColor[t.priority] || { bg: '#f3f4f6', text: '#374151' };
        return `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 12px 14px;">
              <strong style="color: #111827; font-size: 14px;">${t.title}</strong>
              ${t.description ? `<p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">${t.description}</p>` : ''}
              ${t.repeatMonthly ? `<span style="display: inline-block; margin-top: 4px; font-size: 11px; color: #6366f1;">🔄 Mensual</span>` : ''}
            </td>
            <td style="padding: 12px 14px; text-align: center; white-space: nowrap;">
              <span style="background: ${p.bg}; color: ${p.text}; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 4px 8px; border-radius: 9999px;">
                ${t.priority}
              </span>
            </td>
            <td style="padding: 12px 14px; text-align: right; color: #4b5563; font-size: 13px; white-space: nowrap;">
              ${t.dueDate || 'Sin fecha'}
            </td>
          </tr>
        `;
      }).join('');

  const completedRows = completedTasks.length === 0
    ? '<tr><td style="padding: 12px 14px; color: #9ca3af; font-size: 13px;">No hay tareas completadas aún.</td></tr>'
    : completedTasks.map((t) => `
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 14px; color: #4b5563; font-size: 13px;">
            <span style="color: #10b981; font-weight: bold; margin-right: 8px;">✓</span>
            <span style="text-decoration: line-through; color: #9ca3af;">${t.title}</span>
          </td>
        </tr>
      `).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Resumen de tareas - KeepUp</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    
    <!-- Encabezado con marca KeepUp -->
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 28px 32px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
        Keep<span style="color: #6366f1;">Up</span>
      </h1>
      <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">Resumen general de tus tareas</p>
    </div>

    <!-- Saludo y métricas -->
    <div style="padding: 28px 32px;">
      <p style="margin: 0 0 16px; font-size: 15px; color: #374151;">
        Hola <strong>${userName || userEmail}</strong>, este es el reporte de progreso de tus tareas en KeepUp.
      </p>

      <!-- Tarjetas de métricas -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center; width: 33%;">
            <div style="font-size: 24px; font-weight: 800; color: #0f172a;">${tasks.length}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 4px;">Total</div>
          </td>
          <td style="width: 12px;"></td>
          <td style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; text-align: center; width: 33%;">
            <div style="font-size: 24px; font-weight: 800; color: #15803d;">${completedCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #166534; font-weight: 600; margin-top: 4px;">Completadas</div>
          </td>
          <td style="width: 12px;"></td>
          <td style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px; text-align: center; width: 33%;">
            <div style="font-size: 24px; font-weight: 800; color: #b45309;">${pendingCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #92400e; font-weight: 600; margin-top: 4px;">Pendientes</div>
          </td>
        </tr>
      </table>

      <!-- Barra de progreso visual -->
      <div style="margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin-bottom: 6px;">
          <span>Progreso general</span>
          <strong style="color: #0f172a;">${progressPercent}%</strong>
        </div>
        <div style="background: #e2e8f0; border-radius: 9999px; height: 10px; overflow: hidden;">
          <div style="background: #6366f1; width: ${progressPercent}%; height: 100%;"></div>
        </div>
      </div>

      <!-- Tabla de tareas pendientes -->
      <h3 style="font-size: 15px; color: #0f172a; margin: 0 0 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        ⏳ Tareas pendientes (${pendingCount})
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <thead>
          <tr style="background: #f8fafc; color: #64748b; font-size: 12px; text-align: left;">
            <th style="padding: 8px 14px;">Tarea</th>
            <th style="padding: 8px 14px; text-align: center;">Prioridad</th>
            <th style="padding: 8px 14px; text-align: right;">Vencimiento</th>
          </tr>
        </thead>
        <tbody>
          ${pendingRows}
        </tbody>
      </table>

      <!-- Tareas completadas -->
      <h3 style="font-size: 15px; color: #0f172a; margin: 0 0 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        ✅ Tareas completadas (${completedCount})
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${completedRows}
        </tbody>
      </table>
    </div>

    <!-- Pie de página -->
    <div style="background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 16px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
      Enviado automáticamente por <strong>KeepUp</strong> · Mantén el ritmo de tus objetivos.
    </div>
  </div>
</body>
</html>
  `;
}

// Serverless function: envía el resumen detallado de tareas por correo con Amazon SES.
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const body = request.body as SummaryBody | undefined;

  if (!body || typeof body !== 'object') {
    response.status(400).json({ error: 'El cuerpo de la petición es inválido' });
    return;
  }

  const { toEmail, userEmail, userName, tasks } = body;

  if (!Array.isArray(tasks)) {
    response.status(400).json({ error: 'La lista de tareas es requerida y debe ser un arreglo' });
    return;
  }

  const userEmailStr = typeof userEmail === 'string' ? userEmail.trim() : '';
  const toEmailStr = typeof toEmail === 'string' && toEmail.trim() ? toEmail.trim() : userEmailStr;
  const userNameStr = typeof userName === 'string' ? userName.trim() : userEmailStr;

  const region = process.env.AWS_REGION?.trim();
  const from = process.env.SES_FROM_EMAIL?.trim();
  const defaultRecipient = process.env.SES_TO_EMAIL?.trim() || from;

  if (!region || !from) {
    console.error('Faltan variables de entorno de AWS SES (AWS_REGION o SES_FROM_EMAIL)');
    response.status(500).json({
      error: 'El servicio de correo de Amazon SES no está configurado en el servidor',
    });
    return;
  }

  // Destinatario: si toEmailStr no es válido, recurre al configurado en el servidor
  const targetEmail = toEmailStr || defaultRecipient || from;

  const validTasks = (tasks as TaskSummaryItem[]).map((t) => ({
    title: String(t.title ?? 'Sin título'),
    description: typeof t.description === 'string' ? t.description : undefined,
    priority: (['alta', 'media', 'baja'].includes(t.priority) ? t.priority : 'media') as 'alta' | 'media' | 'baja',
    dueDate: typeof t.dueDate === 'string' ? t.dueDate : undefined,
    completed: Boolean(t.completed),
    repeatMonthly: Boolean(t.repeatMonthly),
  }));

  const completedCount = validTasks.filter((t) => t.completed).length;
  const pendingCount = validTasks.length - completedCount;
  const progressPercent = validTasks.length === 0 ? 0 : Math.round((completedCount / validTasks.length) * 100);

  const plainText = buildPlainTextSummary({
    recipient: targetEmail,
    userEmail: userEmailStr,
    userName: userNameStr,
    tasks: validTasks,
    completedCount,
    pendingCount,
    progressPercent,
  });

  const htmlText = buildHtmlSummary({
    recipient: targetEmail,
    userEmail: userEmailStr,
    userName: userNameStr,
    tasks: validTasks,
    completedCount,
    pendingCount,
    progressPercent,
  });

  const sesClient = new SESClient({ region });

  try {
    const command = new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [targetEmail] },
      Message: {
        Subject: {
          Data: `KeepUp · Resumen de tareas (${completedCount}/${validTasks.length} completadas)`,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: plainText,
            Charset: 'UTF-8',
          },
          Html: {
            Data: htmlText,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const result = await sesClient.send(command);

    response.status(200).json({
      message: `Resumen de tareas enviado correctamente a ${targetEmail}`,
      messageId: result.MessageId,
      recipient: targetEmail,
    });
  } catch (error: unknown) {
    console.error('Error al enviar el resumen con Amazon SES:', error);
    const detail = error instanceof Error ? error.message : String(error);

    // Detección amigable del modo Sandbox de AWS SES
    const isSandboxError = detail.includes('Email address is not verified') || detail.includes('MessageRejected');
    const userMessage = isSandboxError
      ? `En modo Sandbox de Amazon SES, el correo destino (${targetEmail}) debe estar verificado en la consola de AWS o usar SES_TO_EMAIL.`
      : 'No se pudo enviar el resumen de tareas.';

    response.status(500).json({
      error: userMessage,
      detail,
    });
  }
}

