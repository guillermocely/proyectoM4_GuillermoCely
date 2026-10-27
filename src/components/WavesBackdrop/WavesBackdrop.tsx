import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { WavesBackdropProps } from './WavesBackdrop.types';
import './WavesBackdrop.css';

const ShapeWaves = lazy(() => import('../ShapeWaves'));

const DEFAULT_BACKGROUND = '#1d1d1b';
const DEFAULT_FOREGROUND = '#f5f1e8';

type GpuProbe = {
  requestAdapter: () => Promise<{
    info?: { architecture?: string; device?: string; description?: string };
    isFallbackAdapter?: boolean;
  } | null>;
};

function readGpu(): GpuProbe | undefined {
  return (navigator as unknown as { gpu?: GpuProbe }).gpu;
}

// Canvas de respaldo para equipos sin WebGPU; conserva el efecto básico usable.
function FallbackWaves({ text }: { text: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const textRef = useRef(text);
  useEffect(() => {
    textRef.current = text;
  }, [text]);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    const colors = getComputedStyle(document.documentElement);
    const foreground = colors.getPropertyValue('--splash-foreground').trim() || DEFAULT_FOREGROUND;
    const background = colors.getPropertyValue('--splash').trim() || DEFAULT_BACKGROUND;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const draw = (now: number) => {
      const time = reduced ? 0 : now / 3500;
      context.globalAlpha = 1;
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      context.fillStyle = foreground;
      for (let y = 5; y < height; y += 10) {
        for (let x = 5; x < width; x += 10) {
          const tone = Math.sin(x / 120 + time) + Math.cos(y / 145 - time) + Math.sin((x + y) / 100 + time);
          const shape = Math.abs(Math.floor(tone * 2)) % 3;
          const edge = Math.max(0.12, 1 - Math.hypot((x - width / 2) / width, (y - height / 2) / height));
          context.globalAlpha = edge * 0.5;
          context.beginPath();
          if (shape === 0) context.rect(x - 3, y - 3, 6, 6);
          else if (shape === 1) context.arc(x, y, 3, 0, Math.PI * 2);
          else { context.moveTo(x, y - 4); context.lineTo(x + 3, y + 3); context.lineTo(x - 3, y + 3); context.closePath(); }
          context.fill();
        }
      }
      if (textRef.current) {
        context.globalAlpha = 1;
        context.font = '700 100px "Space Grotesk", sans-serif';
        const size = Math.min(160, height * 0.4, width * 0.85 / context.measureText(textRef.current).width * 100);
        context.font = `700 ${size}px "Space Grotesk", sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.strokeStyle = background;
        context.lineWidth = 10;
        context.strokeText(textRef.current, width / 2, height / 2);
        context.fillStyle = foreground;
        context.fillText(textRef.current, width / 2, height / 2);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);
  return <canvas ref={ref} className="waves-backdrop__canvas" aria-hidden="true" />;
}

// Fondo animado de ondas con texto opcional tipo marquee.
export default function WavesBackdrop({ text, scroll = false }: WavesBackdropProps) {
  const [colors] = useState<{ foreground: string; background: string }>(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      foreground: style.getPropertyValue('--splash-foreground').trim() || DEFAULT_FOREGROUND,
      background: style.getPropertyValue('--splash').trim() || DEFAULT_BACKGROUND,
    };
  });
  const [failed, setFailed] = useState(() => !readGpu());
  useEffect(() => {
    const gpu = readGpu();
    if (!gpu) return;
    void gpu.requestAdapter().then(adapter => {
      const info = adapter?.info;
      if (!adapter || adapter.isFallbackAdapter || /swiftshader|software/i.test(`${info?.architecture} ${info?.device} ${info?.description}`)) setFailed(true);
    }).catch(() => setFailed(true));
  }, []);
  return (
    <div data-waves-text={text} className="waves-backdrop" aria-hidden="true">
      {failed && <FallbackWaves text={text} />}
      {colors && !failed && (
        <Suspense fallback={null}>
          <ShapeWaves
            text={text}
            fontFamily='"Space Grotesk", sans-serif'
            fontWeight={700}
            textSize={0.6}
            color={colors.foreground}
            hoverColor={colors.foreground}
            backgroundColor={colors.background}
            shapes="mixed"
            cellSize={10}
            dotSize={0.75}
            brightness={0.4}
            glow={0}
            scroll={scroll}
            introDuration={1.6}
            onError={() => setFailed(true)}
          />
        </Suspense>
      )}
    </div>
  );
}
