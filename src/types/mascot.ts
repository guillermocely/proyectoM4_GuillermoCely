export type MascotKind = 'lechuza' | 'gato' | 'zorro' | 'robot';
export type MascotColor = 'ambar' | 'coral' | 'menta' | 'celeste' | 'lila';
export type MascotPersonality = 'motivadora' | 'divertida' | 'seria';
export type MascotRole = 'user' | 'assistant';

export interface MascotSettings {
  kind: MascotKind;
  name: string;
  color: MascotColor;
  personality: MascotPersonality;
  temperature: number;
  maxTokens: number;
}

export interface MascotMessage {
  id: string;
  role: MascotRole;
  content: string;
  createdAt: string;
}

export interface MascotOption<T extends string> {
  value: T;
  label: string;
}

export const DEFAULT_MASCOT: MascotSettings = {
  kind: 'lechuza',
  name: 'Lumi',
  color: 'ambar',
  personality: 'motivadora',
  temperature: 0.7,
  maxTokens: 256,
};

export const MASCOT_KINDS: MascotOption<MascotKind>[] = [
  { value: 'lechuza', label: 'Lechuza' },
  { value: 'gato', label: 'Gato' },
  { value: 'zorro', label: 'Zorro' },
  { value: 'robot', label: 'Robot' },
];

export const MASCOT_COLORS: MascotOption<MascotColor>[] = [
  { value: 'ambar', label: 'Ámbar' },
  { value: 'coral', label: 'Coral' },
  { value: 'menta', label: 'Menta' },
  { value: 'celeste', label: 'Celeste' },
  { value: 'lila', label: 'Lila' },
];

export const MASCOT_PERSONALITIES: MascotOption<MascotPersonality>[] = [
  { value: 'motivadora', label: 'Motivadora' },
  { value: 'divertida', label: 'Divertida' },
  { value: 'seria', label: 'Seria' },
];

export const MASCOT_TEMPERATURE_MIN = 0;
export const MASCOT_TEMPERATURE_MAX = 1;
export const MASCOT_TOKENS_MIN = 128;
export const MASCOT_TOKENS_MAX = 1024;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeSettings(value: Partial<MascotSettings> | null | undefined): MascotSettings {
  const kind = MASCOT_KINDS.some((option) => option.value === value?.kind)
    ? value!.kind!
    : DEFAULT_MASCOT.kind;
  const color = MASCOT_COLORS.some((option) => option.value === value?.color)
    ? value!.color!
    : DEFAULT_MASCOT.color;
  const personality = MASCOT_PERSONALITIES.some((option) => option.value === value?.personality)
    ? value!.personality!
    : DEFAULT_MASCOT.personality;
  const name = (value?.name ?? '').trim().slice(0, 20) || DEFAULT_MASCOT.name;
  const temperature = Number.isFinite(value?.temperature)
    ? clamp(value!.temperature!, MASCOT_TEMPERATURE_MIN, MASCOT_TEMPERATURE_MAX)
    : DEFAULT_MASCOT.temperature;
  const maxTokens = Number.isFinite(value?.maxTokens)
    ? Math.round(clamp(value!.maxTokens!, MASCOT_TOKENS_MIN, MASCOT_TOKENS_MAX))
    : DEFAULT_MASCOT.maxTokens;

  return { kind, name, color, personality, temperature, maxTokens };
}

export function mascotGreeting(settings: MascotSettings): string {
  const greetings: Record<MascotPersonality, string> = {
    motivadora: `Hola, soy ${settings.name}. Elegí una tarea y empezamos juntos.`,
    divertida: `Hola, soy ${settings.name}. ¿Atacamos esa lista o la miramos con cara de duda?`,
    seria: `Hola, soy ${settings.name}. Decime en qué tarea querés avanzar.`,
  };

  return greetings[settings.personality];
}
