import type { CSSProperties } from 'react';
import type { MascotFigureProps } from './MascotFigure.types';
import './MascotFigure.css';

const MASCOT_COLOR_VARIABLES = {
  ambar: 'var(--mascot-ambar)',
  coral: 'var(--mascot-coral)',
  menta: 'var(--mascot-menta)',
  celeste: 'var(--mascot-celeste)',
  lila: 'var(--mascot-lila)',
} as const;

export default function MascotFigure({
  kind,
  color,
  className = 'mascot-figure',
}: MascotFigureProps) {
  const style = {
    '--mascot': MASCOT_COLOR_VARIABLES[color],
  } as CSSProperties;

  return (
    <svg
      viewBox="0 0 100 110"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {kind === 'lechuza' && <path d="M22 30 L28 8 L42 24 Z M78 30 L72 8 L58 24 Z" fill="var(--mascot)" />}
      {kind === 'gato' && <path d="M18 40 L22 6 L46 26 Z M82 40 L78 6 L54 26 Z" fill="var(--mascot)" />}
      {kind === 'zorro' && <path d="M14 44 L20 2 L46 28 Z M86 44 L80 2 L54 28 Z" fill="var(--mascot)" />}
      {kind === 'robot' && (
        <>
          <line x1="50" y1="20" x2="50" y2="7" stroke="var(--mascot)" strokeWidth="4" />
          <circle cx="50" cy="6" r="5" fill="var(--mascot)" />
        </>
      )}

      {kind === 'robot' ? (
        <rect x="14" y="20" width="72" height="84" rx="18" fill="var(--mascot)" />
      ) : (
        <ellipse cx="50" cy="62" rx="36" ry="42" fill="var(--mascot)" />
      )}

      {kind === 'zorro' ? (
        <path d="M22 60 Q50 112 78 60 Q50 76 22 60 Z" fill="var(--text)" opacity="0.92" />
      ) : kind === 'robot' ? (
        <rect x="28" y="66" width="44" height="26" rx="8" fill="var(--surface)" opacity="0.9" />
      ) : (
        <ellipse cx="50" cy="76" rx="22" ry="24" fill="var(--surface)" opacity="0.9" />
      )}

      <g className="mascot-figure__eyes">
        {kind === 'robot' ? (
          <>
            <rect x="24" y="36" width="22" height="18" rx="5" fill="var(--bg)" />
            <rect x="54" y="36" width="22" height="18" rx="5" fill="var(--bg)" />
            <circle cx="35" cy="45" r="5" fill="var(--mascot)" />
            <circle cx="65" cy="45" r="5" fill="var(--mascot)" />
          </>
        ) : (
          <>
            <circle cx="36" cy="46" r={kind === 'lechuza' ? 13 : 9} fill="var(--text)" />
            <circle cx="64" cy="46" r={kind === 'lechuza' ? 13 : 9} fill="var(--text)" />
            <circle cx="38" cy="47" r="5" fill="var(--bg)" />
            <circle cx="66" cy="47" r="5" fill="var(--bg)" />
          </>
        )}
      </g>

      {kind === 'lechuza' && <path d="M45 58 L55 58 L50 66 Z" fill="var(--bg)" />}
      {(kind === 'gato' || kind === 'zorro') && (
        <>
          <path d="M46 60 L54 60 L50 65 Z" fill="var(--bg)" />
          {kind === 'gato' && (
            <path
              d="M20 60 L36 62 M20 68 L36 66 M80 60 L64 62 M80 68 L64 66"
              stroke="var(--bg)"
              strokeWidth="2"
            />
          )}
        </>
      )}
      {kind === 'robot' && <path d="M36 78 H64 M36 84 H64" stroke="var(--mascot)" strokeWidth="3" />}
      {kind === 'lechuza' && (
        <path
          d="M14 66 Q6 80 18 92 M86 66 Q94 80 82 92"
          stroke="var(--mascot)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
