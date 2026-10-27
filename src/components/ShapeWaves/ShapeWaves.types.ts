// Tipos del efecto de ondas ShapeWaves.
export type ShapeWavesShapes = 'mixed' | 'squares' | 'circles' | 'triangles';

export interface ShapeWavesProps {
  text?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  textSize?: number;
  shapes?: ShapeWavesShapes;
  cellSize?: number;
  dotSize?: number;
  color?: string;
  hoverColor?: string;
  backgroundColor?: string;
  speed?: number;
  scale?: number;
  contrast?: number;
  brightness?: number;
  flow?: number;
  direction?: number;
  fade?: number;
  interactive?: boolean;
  splashRadius?: number;
  splashStrength?: number;
  glow?: number;
  intro?: boolean;
  introDuration?: number;
  introKey?: string | number;
  scroll?: boolean;
  paused?: boolean;
  onError?: (error: Error) => void;
  onReady?: () => void;
  className?: string;
}

export interface ShapeWavesSettings {
  text: string;
  fontFamily: string;
  fontWeight: string | number;
  textSize: number;
  shapes: ShapeWavesShapes;
  cellSize: number;
  dotSize: number;
  color: string;
  hoverColor: string;
  backgroundColor: string;
  speed: number;
  scale: number;
  contrast: number;
  brightness: number;
  flow: number;
  direction: number;
  fade: number;
  interactive: boolean;
  splashRadius: number;
  splashStrength: number;
  glow: number;
  intro: boolean;
  introDuration: number;
  introKey: string | number;
  scroll: boolean;
  paused: boolean;
}
