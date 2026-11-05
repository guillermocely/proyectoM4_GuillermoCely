import type { VercelRequest, VercelResponse } from '@vercel/node';

type MascotRole = 'user' | 'assistant';

interface MascotSettings {
  kind: string;
  name: string;
  personality: string;
  temperature: number;
  maxTokens: number;
}

interface MascotTask {
  title: string;
  priority: string;
  dueDate: string;
  completed: boolean;
}

interface GeminiModel {
  name?: string;
  supportedGenerationMethods?: string[];
}

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
}

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_HISTORY = 20;
const MAX_TASKS = 30;
const MAX_WORDS = 30;
const KINDS = ['lechuza', 'gato', 'zorro', 'robot'];
const PERSONALITIES = ['motivadora', 'divertida', 'seria'];
const PERSONALITY_PROMPTS: Record<string, string> = {
  motivadora: 'cálida, alentadora y positiva',
  divertida: 'graciosa y juguetona, con humor liviano',
  seria: 'directa, profesional y concisa, sin chistes',
};
const KIND_LABELS: Record<string, string> = {
  lechuza: 'una lechuza',
  gato: 'un gato',
  zorro: 'un zorro',
  robot: 'un robotito',
};

let cachedModel: string | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function textValue(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function numberValue(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function parseSettings(value: unknown): MascotSettings {
  const data = isRecord(value) ? value : {};
  const kind = textValue(data.kind, 20);
  const personality = textValue(data.personality, 20);

  return {
    kind: KINDS.includes(kind) ? kind : 'lechuza',
    name: textValue(data.name, 20) || 'Lumi',
    personality: PERSONALITIES.includes(personality) ? personality : 'motivadora',
    temperature: numberValue(data.temperature, 0.7, 0, 1),
    maxTokens: Math.round(numberValue(data.maxTokens, 256, 128, 1024)),
  };
}

function parseHistory(value: unknown): Array<{ role: MascotRole; content: string }> {
  if (!Array.isArray(value)) return [];

  return value.slice(-MAX_HISTORY).flatMap((item) => {
    if (!isRecord(item)) return [];
    const role = item.role === 'user' || item.role === 'assistant' ? item.role : null;
    const content = textValue(item.content, 1000);
    return role && content ? [{ role, content }] : [];
  });
}

function parseTasks(value: unknown): MascotTask[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, MAX_TASKS).flatMap((item) => {
    if (!isRecord(item)) return [];
    const title = textValue(item.title, 200);
    if (!title) return [];

    return [{
      title,
      priority: textValue(item.priority, 20) || 'media',
      dueDate: textValue(item.dueDate, 10),
      completed: item.completed === true,
    }];
  });
}

function buildInstructions(settings: MascotSettings, tasks: MascotTask[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const taskList = tasks.length
    ? tasks.map((task) => {
      const due = task.dueDate || 'sin fecha';
      const state = task.completed ? 'completada' : 'pendiente';
      return `- ${task.title} | prioridad ${task.priority} | vence ${due} | ${state}`;
    }).join('\n')
    : '(sin tareas)';

  return [
    `Sos "${settings.name}", ${KIND_LABELS[settings.kind]} que acompaña a la persona en KeepUp, una app de tareas.`,
    `Tu personalidad es ${PERSONALITY_PROMPTS[settings.personality]}.`,
    'Regla obligatoria: respondé en español rioplatense con voseo, en una sola respuesta completa de máximo 30 palabras.',
    'No uses markdown, listas, saltos de línea ni emojis. No cortes frases.',
    'No puedes crear, editar, completar, mover ni eliminar tareas. No tienes acceso de escritura a la app.',
    'Nunca digas que vas a organizar, cuadrar, mover o cambiar tareas, ni que ya lo hiciste, ni prometas hacerlo. Solo puedes dar recomendaciones.',
    'Si la persona te pide que le organices las tareas, aclara que solo das consejos y que debe crear, editar o mover las tareas en la pantalla de tareas.',
    'Ayudá con recomendaciones: qué hacer primero, vencimientos, prioridades y motivación. Si preguntan otra cosa, respondé corto y volvé a las tareas.',
    `Hoy es ${today}. Tareas del usuario:\n${taskList}`,
  ].join(' ');
}

function limitWords(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const words = normalized.split(' ').filter(Boolean);
  if (words.length <= MAX_WORDS) return normalized;

  const clipped = words.slice(0, MAX_WORDS).join(' ');
  const lastEnd = Math.max(
    clipped.lastIndexOf('.'),
    clipped.lastIndexOf('?'),
    clipped.lastIndexOf('!'),
  );

  if (lastEnd >= Math.floor(clipped.length * 0.45)) {
    return clipped.slice(0, lastEnd + 1);
  }

  return `${words.slice(0, MAX_WORDS - 1).join(' ')}.`;
}

function normalizeModelName(name: string): string {
  return name.replace(/^models\//, '').trim();
}

async function resolveModel(apiKey: string): Promise<string> {
  if (cachedModel) return cachedModel;

  const preferred = normalizeModelName(process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL);
  const response = await fetch(
    `${GEMINI_BASE}/models?key=${encodeURIComponent(apiKey)}&pageSize=1000`,
  );

  if (!response.ok) {
    console.error('No se pudo verificar el modelo de Gemini:', response.status);
    throw new ApiError(502, 'No se pudo verificar el modelo de Gemini.');
  }

  const data = (await response.json()) as { models?: GeminiModel[] };
  const available = (data.models ?? [])
    .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
    .map((model) => normalizeModelName(model.name ?? ''))
    .filter(Boolean);

  const chosen = available.includes(preferred)
    ? preferred
    : available.find((name) => name.includes('flash')) ?? available[0];

  if (!chosen) {
    throw new ApiError(502, 'No hay modelos de Gemini disponibles.');
  }

  cachedModel = chosen;
  return chosen;
}

async function verifyFirebaseToken(idToken: string): Promise<string> {
  const apiKey = process.env.FIREBASE_API_KEY?.trim()
    || process.env.VITE_FIREBASE_API_KEY?.trim();

  if (!apiKey) {
    throw new ApiError(503, 'La IA no está configurada.');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!response.ok) {
    throw new ApiError(401, 'Tu sesión no es válida. Volvé a iniciar sesión.');
  }

  const data = (await response.json()) as { users?: Array<{ localId?: string }> };
  const userId = data.users?.[0]?.localId;
  if (!userId) {
    throw new ApiError(401, 'Tu sesión no es válida. Volvé a iniciar sesión.');
  }

  return userId;
}

async function callGemini(
  apiKey: string,
  model: string,
  instructions: string,
  history: Array<{ role: MascotRole; content: string }>,
  message: string,
  settings: MascotSettings,
  maxOutputTokens: number,
): Promise<{ text: string; finishReason: string }> {
  const contents = history.map((item) => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: item.content }],
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });
  const response = await fetch(
    `${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions }] },
        contents,
        generationConfig: {
          temperature: settings.temperature,
          maxOutputTokens,
          candidateCount: 1,
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error('Error de Gemini:', response.status, detail);

    if (response.status === 429) {
      throw new ApiError(429, 'Estoy ocupada, probá de nuevo en un rato.');
    }
    if (response.status === 404) {
      cachedModel = null;
      throw new ApiError(404, 'El modelo de Gemini no está disponible.');
    }
    if (response.status === 400) {
      throw new ApiError(502, 'No pude responder ahora.');
    }
    throw new ApiError(502, 'No pude responder ahora.');
  }

  const data = (await response.json()) as GeminiResponse;
  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .map((part) => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    if (data.promptFeedback?.blockReason) {
      throw new ApiError(422, 'No puedo responder eso. Probá con otra pregunta.');
    }
    throw new ApiError(502, 'No encontré qué decirte ahora.');
  }

  return { text, finishReason: candidate?.finishReason ?? '' };
}

async function generateReply(
  apiKey: string,
  model: string,
  instructions: string,
  history: Array<{ role: MascotRole; content: string }>,
  message: string,
  settings: MascotSettings,
): Promise<string> {
  let maxOutputTokens = settings.maxTokens;
  let result = await callGemini(
    apiKey,
    model,
    instructions,
    history,
    message,
    settings,
    maxOutputTokens,
  );

  if (result.finishReason === 'MAX_TOKENS') {
    maxOutputTokens = Math.min(2048, maxOutputTokens * 2);
    result = await callGemini(
      apiKey,
      model,
      instructions,
      history,
      message,
      settings,
      maxOutputTokens,
    );
  }

  return limitWords(result.text);
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const body = request.body as unknown;
    if (!isRecord(body)) {
      throw new ApiError(400, 'El cuerpo de la petición es inválido.');
    }

    const idToken = textValue(body.idToken, 10000);
    const message = textValue(body.message, 1000);

    if (!idToken) throw new ApiError(401, 'Falta la sesión del usuario.');
    if (!message) throw new ApiError(400, 'El mensaje está vacío.');

    const apiKey = process.env.GEMINI_API_KEY?.trim()
      || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();

    if (!apiKey) {
      throw new ApiError(503, 'La IA no está configurada.');
    }

    const settings = parseSettings(body.settings);
    const history = parseHistory(body.history);
    const tasks = parseTasks(body.tasks);

    await verifyFirebaseToken(idToken);

    const model = await resolveModel(apiKey);
    const instructions = buildInstructions(settings, tasks);

    let reply: string;
    try {
      reply = await generateReply(apiKey, model, instructions, history, message, settings);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const fallbackModel = await resolveModel(apiKey);
        reply = await generateReply(
          apiKey,
          fallbackModel,
          instructions,
          history,
          message,
          settings,
        );
      } else {
        throw error;
      }
    }

    response.status(200).json({ reply, model });
  } catch (error) {
    if (error instanceof ApiError) {
      response.status(error.status).json({ error: error.message });
      return;
    }

    console.error('Error inesperado en la mascota:', error);
    response.status(500).json({ error: 'No pude responder ahora.' });
  }
}
