import type { MascotColor, MascotKind } from '../../types/mascot';

export interface MascotFigureProps {
  kind: MascotKind;
  color: MascotColor;
  className?: string;
}
