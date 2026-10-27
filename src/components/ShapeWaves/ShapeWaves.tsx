'use client';

// Inspired by https://vercel.com/labs
/* eslint-disable react-hooks/refs -- React Bits ShapeWaves keeps the latest props/settings in refs so the WebGPU render loop always reads current values. */
import { useEffect, useRef, useState } from 'react';
import { effect, frame, init, sampler, storage, surface, target, uniforms } from 'vgpu';
import { prepareShader } from '@vgpu/wgsl/prepare';
import type { Gpu, StorageBuffer, Texture } from 'vgpu';

import { BLUR_SHADER, COMPOSITE_SHADER, INTRO_END, SCENE_SHADER } from './ShapeWaves.shaders';
import type { ShapeWavesProps, ShapeWavesSettings, ShapeWavesShapes } from './ShapeWaves.types';
import './ShapeWaves.css';

type ChargeBuffer = StorageBuffer & { destroy(): void };

const SHAPE_MODES: Record<ShapeWavesShapes, number> = { mixed: 0, squares: 1, circles: 2, triangles: 3 };

const MAX_DPR = 2;
const MAX_MASK_SIZE = 1024;
const NOISE_CELLS = 32;
const TIME_RATE = 0.1;
const SIMULATION_STEP = 1 / 60;
const WAVE_SPEED = 0.42;
const WAVE_FRICTION = 0.94;
const WAVE_DECAY = 0.972;
const SETTLED_THRESHOLD = 0.01;
const MARQUEE_SPEED = 0.2;

const parseColor = (value: string | undefined, fallback: string): [number, number, number] => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d');
  if (!context) return [0, 0, 0];
  context.fillStyle = fallback;
  context.fillStyle = value || fallback;
  context.fillRect(0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  return [(pixel[0] ?? 0) / 255, (pixel[1] ?? 0) / 255, (pixel[2] ?? 0) / 255];
};

export default function ShapeWaves({
  text = '',
  fontFamily = 'Geist, "Geist Sans", system-ui, sans-serif',
  fontWeight = 500,
  textSize = 0.6,
  shapes = 'mixed',
  cellSize = 10,
  dotSize = 0.75,
  color = 'var(--splash-foreground)',
  hoverColor = 'var(--splash-foreground)',
  backgroundColor = 'var(--splash)',
  speed = 1,
  scale = 1,
  contrast = 1,
  brightness = 0.4,
  flow = 0,
  direction = 0,
  fade = 0.25,
  interactive = true,
  splashRadius = 40,
  splashStrength = 0.4,
  glow = 0.35,
  intro = true,
  introDuration = 1.6,
  introKey = 0,
  scroll = false,
  paused = false,
  onError,
  onReady,
  className = ''
}: ShapeWavesProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const settingsRef = useRef<ShapeWavesSettings>(null as unknown as ShapeWavesSettings);
  const applySettingsRef = useRef<() => void>(() => {});
  const applyMaskRef = useRef<() => void>(() => {});
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onErrorRef = useRef<ShapeWavesProps['onError']>(onError);

  settingsRef.current = {
    text: String(text ?? ''),
    fontFamily,
    fontWeight,
    textSize,
    shapes,
    cellSize: Math.max(2, cellSize),
    dotSize,
    color,
    hoverColor,
    backgroundColor,
    speed,
    scale: Math.max(0.05, scale),
    contrast,
    brightness,
    flow,
    direction,
    fade,
    interactive,
    splashRadius,
    splashStrength,
    glow,
    intro,
    introDuration: Math.max(0.1, introDuration),
    introKey,
    scroll,
    paused
  };
  onErrorRef.current = onError;

  const settingsSignature = [
    shapes,
    cellSize,
    dotSize,
    color,
    hoverColor,
    backgroundColor,
    speed,
    scale,
    contrast,
    brightness,
    flow,
    direction,
    fade,
    interactive,
    splashRadius,
    splashStrength,
    glow,
    intro,
    introDuration,
    scroll,
    paused
  ].join('|');
  const maskSignature = [text, fontFamily, fontWeight, textSize, scroll].join('|');
  const replayRef = useRef<() => void>(() => {});

  useEffect(() => {
    applySettingsRef.current();
  }, [settingsSignature]);

  useEffect(() => {
    applyMaskRef.current();
  }, [maskSignature]);

  useEffect(() => {
    if (introKey) replayRef.current();
  }, [introKey]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    let disposed = false;
    let failed = false;
    let gpu: Gpu | undefined;
    let maskTexture: Texture | undefined;
    let chargeBuffer: ChargeBuffer | undefined;
    let frameId = 0;
    let lastFrameTime = 0;
    let time = 0;
    let drift: [number, number] = [0, 0];
    let marqueeOffset = 0;
    let dpr = 1;
    let visible = true;
    let presented = false;
    let cols = 1;
    let rows = 1;
    let cellPx = 10;
    let gridOrigin: [number, number] = [0, 0];
    let charges = new Float32Array(1);
    let heights = new Float32Array(1);
    let previousHeights = new Float32Array(1);
    let simulationBacklog = 0;
    let introStart = 0;
    let introProgress = INTRO_END;
    let introArmed = false;
    let chargesActive = false;
    let bounds: DOMRect | null = null;
    let unsubscribeGpuError: (() => void) | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let visibilityObserver: IntersectionObserver | undefined;
    let wakeRenderer: () => void = () => {};
    const pointer = { x: 0, y: 0, at: 0, inside: false };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const maskCanvas = document.createElement('canvas');
    const maskContext = maskCanvas.getContext('2d');
    if (!maskContext) return undefined;

    const handleWake = () => wakeRenderer();
    const invalidateBounds = () => {
      bounds = null;
    };
    const splash = (x: number, y: number, strength: number) => {
      const settings = settingsRef.current;
      const sigma = Math.max(0.5, ((settings.splashRadius * dpr) / cellPx) * 0.5);
      const reach = Math.ceil(sigma * 2.5);
      const centerCol = (x * dpr - gridOrigin[0]) / cellPx - 0.5;
      const centerRow = (y * dpr - gridOrigin[1]) / cellPx - 0.5;
      const minRow = Math.max(0, Math.floor(centerRow - reach));
      const maxRow = Math.min(rows - 1, Math.ceil(centerRow + reach));
      const minCol = Math.max(0, Math.floor(centerCol - reach));
      const maxCol = Math.min(cols - 1, Math.ceil(centerCol + reach));
      for (let row = minRow; row <= maxRow; row++) {
        const dy = row - centerRow;
        for (let col = minCol; col <= maxCol; col++) {
          const dx = col - centerCol;
          const bump = strength * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
          const index = row * cols + col;
          heights[index] = Math.min(1.2, (heights[index] ?? 0) + bump);
        }
      }
      chargesActive = true;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!settingsRef.current.interactive) return;
      if (!bounds) bounds = root.getBoundingClientRect();
      const now = performance.now();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const inside = x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height;
      if (inside) {
        const elapsed = pointer.inside ? Math.max(8, now - pointer.at) : 16;
        const travelled = pointer.inside ? Math.hypot(x - pointer.x, y - pointer.y) : 0;
        const speed = (travelled / elapsed) * 1000;
        splash(x, y, Math.min(1, 0.22 + speed * 0.0006) * settingsRef.current.splashStrength);
        wakeRenderer();
      }
      pointer.x = x;
      pointer.y = y;
      pointer.at = now;
      pointer.inside = inside;
    };

    const reportFailure = (error: unknown) => {
      if (disposed || failed) return;
      failed = true;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      unsubscribeGpuError?.();
      applySettingsRef.current = () => {};
      applyMaskRef.current = () => {};
      const failedGpu = gpu;
      gpu = undefined;
      failedGpu?.dispose();
      setReady(false);
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));
    };

    const measureSurface = (): [number, number] => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      return [Math.max(1, Math.round(canvas.clientWidth * dpr)), Math.max(1, Math.round(canvas.clientHeight * dpr))];
    };

    void (async () => {
      try {
        const activeGpu = await init({ powerPreference: 'low-power' });
        gpu = activeGpu;
        if (disposed) return activeGpu.dispose();
        unsubscribeGpuError = activeGpu.onError(reportFailure);

        const initialSize = measureSurface();
        const outputFormat = (
          navigator as Navigator & { gpu: { getPreferredCanvasFormat(): string } }
        ).gpu.getPreferredCanvasFormat();
        const output = surface(activeGpu, canvas, { dpr, size: initialSize, autoResize: false, format: outputFormat });

        const params = uniforms(activeGpu, {
          resolution: [initialSize[0], initialSize[1], 1 / initialSize[0], 1 / initialSize[1]],
          placement: [0, 0, 1, 0],
          grid: [10, 0.75, 0, 1],
          field: [320, 0.5, 2.8, 0],
          motion: [0, 0, 0, 0.25],
          color: [0.573, 0.573, 0.573, 1],
          hover: [1, 1, 1, 0],
          background: [0, 0, 0, 1],
          marquee: [0, MARQUEE_SPEED, 0, 0]
        });
        const linearSampler = sampler(activeGpu, {
          minFilter: 'linear',
          magFilter: 'linear',
          addressModeU: 'clamp-to-edge',
          addressModeV: 'clamp-to-edge'
        });
        const createMaskTexture = (maskWidth: number, maskHeight: number) =>
          activeGpu.device.createTexture({
            kind: '2d',
            size: [maskWidth, maskHeight],
            format: 'rgba8unorm',
            usage: ['texture_binding', 'copy_dst', 'render_attachment'],
            label: 'shape-waves-mask'
          });
        const initialMaskTexture = createMaskTexture(1, 1);
        maskTexture = initialMaskTexture;
        const initialChargeBuffer = storage(activeGpu, 4, 'read') as ChargeBuffer;
        initialChargeBuffer.write(charges);
        chargeBuffer = initialChargeBuffer;

        const scene = effect(activeGpu, prepareShader(SCENE_SHADER), {
          label: 'shape-waves-scene',
          set: { params, maskTexture: initialMaskTexture, maskSampler: linearSampler, charges: initialChargeBuffer }
        });
        const sceneTarget = target(activeGpu, { size: initialSize, format: 'rgba8unorm', label: 'shape-waves-scene' });
        const glowSize = (size: readonly [number, number]): [number, number] => [
          Math.max(1, Math.ceil(size[0] / 2)),
          Math.max(1, Math.ceil(size[1] / 2))
        ];
        const glowA = target(activeGpu, {
          size: glowSize(initialSize),
          format: 'rgba8unorm',
          label: 'shape-waves-glow-a'
        });
        const glowB = target(activeGpu, {
          size: glowSize(initialSize),
          format: 'rgba8unorm',
          label: 'shape-waves-glow-b'
        });
        const blurParamsX = uniforms(activeGpu, { direction: [0, 0, 4, 1] });
        const blurParamsY = uniforms(activeGpu, { direction: [0, 0, 4, 0] });
        const blurX = effect(activeGpu, prepareShader(BLUR_SHADER), {
          label: 'shape-waves-glow-x',
          set: { blur: blurParamsX, sourceTexture: sceneTarget, sourceSampler: linearSampler }
        });
        const blurY = effect(activeGpu, prepareShader(BLUR_SHADER), {
          label: 'shape-waves-glow-y',
          set: { blur: blurParamsY, sourceTexture: glowA, sourceSampler: linearSampler }
        });
        const compositeParams = uniforms(activeGpu, { strength: [2, 0, 0, 0] });
        const composite = effect(activeGpu, prepareShader(COMPOSITE_SHADER), {
          label: 'shape-waves-composite',
          set: { composite: compositeParams, sceneTexture: sceneTarget, glowTexture: glowB, linearSampler }
        });
        await Promise.all([
          scene.compile({ colors: [outputFormat] }),
          scene.compile(sceneTarget),
          blurX.compile(glowA),
          blurY.compile(glowB),
          composite.compile({ colors: [outputFormat] })
        ]);
        if (disposed) return;

        const glowEnabled = () => settingsRef.current.glow > 0;
        let lastIntro = false;

        const configureGrid = () => {
          const settings = settingsRef.current;
          const [width, height] = output.size;
          const nextCols = Math.max(1, Math.round(width / (settings.cellSize * dpr)));
          cellPx = width / nextCols;
          const nextRows = Math.max(1, Math.floor(height / cellPx));
          gridOrigin = [0, (height - nextRows * cellPx) / 2];
          if (nextCols === cols && nextRows === rows && charges.length === cols * rows) return;
          cols = nextCols;
          rows = nextRows;
          charges = new Float32Array(cols * rows);
          heights = new Float32Array(cols * rows);
          previousHeights = new Float32Array(cols * rows);
          chargesActive = false;
          const nextBuffer = storage(activeGpu, charges.byteLength, 'read') as ChargeBuffer;
          nextBuffer.write(charges);
          scene.set({ charges: nextBuffer });
          chargeBuffer?.destroy();
          chargeBuffer = nextBuffer;
        };

        const stepRipples = () => {
          const lastCol = cols - 1;
          const lastRow = rows - 1;
          let peak = 0;
          for (let row = 0; row < rows; row++) {
            const up = (row === 0 ? row : row - 1) * cols;
            const down = (row === lastRow ? row : row + 1) * cols;
            const base = row * cols;
            for (let col = 0; col < cols; col++) {
              const index = base + col;
              const left = base + (col === 0 ? col : col - 1);
              const right = base + (col === lastCol ? col : col + 1);
              const height = heights[index] ?? 0;
              const laplacian = (heights[left] ?? 0) + (heights[right] ?? 0) + (heights[up + col] ?? 0) + (heights[down + col] ?? 0) - 4 * height;
              const velocity = (height - (previousHeights[index] ?? 0)) * WAVE_FRICTION;
              const next = (height + velocity + WAVE_SPEED * laplacian) * WAVE_DECAY;
              previousHeights[index] = next;
              const charge = Math.min(1, Math.max(0, next));
              charges[index] = charge;
              if (charge > peak) peak = charge;
            }
          }
          const swap = heights;
          heights = previousHeights;
          previousHeights = swap;
          return peak;
        };

        const updateCharges = (deltaSeconds: number) => {
          if (!chargesActive) return false;
          simulationBacklog = Math.min(simulationBacklog + deltaSeconds, SIMULATION_STEP * 4);
          let peak = 1;
          while (simulationBacklog >= SIMULATION_STEP) {
            simulationBacklog -= SIMULATION_STEP;
            peak = stepRipples();
          }
          if (peak < SETTLED_THRESHOLD) {
            heights.fill(0);
            previousHeights.fill(0);
            charges.fill(0);
            chargesActive = false;
          }
          chargeBuffer?.write(charges);
          return chargesActive;
        };

        const isAnimating = () => {
          const settings = settingsRef.current;
          return visible && !document.hidden && !settings.paused && settings.speed > 0 && !reduceMotion.matches;
        };

        const render = (now: number) => {
          frameId = 0;
          if (disposed || failed) return;
          const settings = settingsRef.current;
          const deltaSeconds = lastFrameTime ? Math.min(0.1, (now - lastFrameTime) / 1000) : 0;
          lastFrameTime = now;
          const animating = isAnimating();
          if (animating) {
            time += deltaSeconds * TIME_RATE * settings.speed;
            const angle = (settings.direction * Math.PI) / 180;
            const distance = settings.flow * cellPx * deltaSeconds;
            drift = [drift[0] + Math.cos(angle) * distance, drift[1] + Math.sin(angle) * distance];
            if (settings.scroll) marqueeOffset += deltaSeconds * MARQUEE_SPEED * settings.speed;
          }
          const hovering = visible && !document.hidden && updateCharges(deltaSeconds);
          if (introArmed) {
            introArmed = false;
            introStart = now;
            introProgress = 0;
          }
          const introPlaying = introProgress < INTRO_END;
          if (introPlaying) {
            introProgress = Math.min(INTRO_END, ((now - introStart) / 1000 / settings.introDuration) * INTRO_END);
          }
          params.set({ placement: [gridOrigin[0], gridOrigin[1], rows, introProgress] });
          params.set({
            field: [
              NOISE_CELLS * cellPx * settings.scale,
              0.5 - (settings.brightness - 0.5) * 0.4,
              2.8 * settings.contrast,
              time
            ]
          });
          params.set({ motion: [drift[0], drift[1], settings.text.trim() ? 1 : 0, settings.fade] });
          params.set({ marquee: [marqueeOffset, MARQUEE_SPEED, settings.scroll && settings.text.trim() ? 1 : 0, 0] });
          try {
            frame(activeGpu, currentFrame => {
              if (!glowEnabled()) {
                currentFrame.pass(output, scene);
                return;
              }
              currentFrame.pass(sceneTarget, scene);
              currentFrame.pass(glowA, blurX);
              currentFrame.pass(glowB, blurY);
              currentFrame.pass(output, composite);
            });
          } catch (error) {
            reportFailure(error);
            return;
          }
          if (!presented) {
            presented = true;
            setReady(true);
            onReadyRef.current?.();
          }
          if (animating || hovering || introPlaying) frameId = requestAnimationFrame(render);
          else lastFrameTime = 0;
        };

        wakeRenderer = () => {
          if (disposed || failed || frameId) return;
          frameId = requestAnimationFrame(render);
        };

        const drawMask = () => {
          const settings = settingsRef.current;
          const content = settings.text.trim();
          const [surfaceWidth, surfaceHeight] = output.size;
          const hasText = content.length > 0;
          const maskScale = hasText ? Math.min(1, MAX_MASK_SIZE / Math.max(surfaceWidth, surfaceHeight)) : 0;
          const maskWidth = hasText ? Math.max(1, Math.round(surfaceWidth * maskScale)) : 1;
          const maskHeight = hasText ? Math.max(1, Math.round(surfaceHeight * maskScale)) : 1;

          maskCanvas.width = maskWidth;
          maskCanvas.height = maskHeight;
          maskContext.fillStyle = '#000';
          maskContext.fillRect(0, 0, maskWidth, maskHeight);

          if (hasText) {
            let fontPx = Math.max(1, settings.textSize * maskHeight);
            maskContext.font = `${settings.fontWeight} ${fontPx}px ${settings.fontFamily}`;
            const measured = maskContext.measureText(content).width;
            const maxWidth = maskWidth * (settings.scroll ? 0.5 : 0.9);
            if (measured > maxWidth) {
              fontPx = Math.max(1, (fontPx * maxWidth) / measured);
              maskContext.font = `${settings.fontWeight} ${fontPx}px ${settings.fontFamily}`;
            }
            maskContext.textAlign = 'center';
            maskContext.textBaseline = 'alphabetic';
            const metrics = maskContext.measureText(content);
            const x = (maskWidth + metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) / 2;
            const y = (maskHeight + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
            maskContext.fillStyle = '#fff';
            maskContext.fillText(content, x, y);
          }

          const nextTexture = createMaskTexture(maskWidth, maskHeight);
          activeGpu.gpu.queue.copyExternalImageToTexture({ source: maskCanvas }, { texture: nextTexture.gpu }, [
            maskWidth,
            maskHeight
          ]);
          scene.set({ maskTexture: nextTexture });
          maskTexture?.destroy();
          maskTexture = nextTexture;
        };

        const applySettings = () => {
          if (disposed || failed) return;
          const settings = settingsRef.current;
          configureGrid();
          params.set({
            placement: [gridOrigin[0], gridOrigin[1], rows, introProgress],
            grid: [cellPx, Math.min(1, Math.max(0.1, settings.dotSize)), SHAPE_MODES[settings.shapes] ?? 0, cols],
            color: [...parseColor(settings.color, '#929292'), 1],
            hover: [...parseColor(settings.hoverColor, '#ffffff'), glowEnabled() ? 1 : 0],
            background: [...parseColor(settings.backgroundColor, '#000000'), 1]
          });
          params.set({ marquee: [marqueeOffset, MARQUEE_SPEED, settings.scroll && settings.text.trim() ? 1 : 0, 0] });
          compositeParams.set({ strength: [2 * settings.glow, 0, 0, 0] });
          if (settings.intro !== lastIntro) {
            lastIntro = settings.intro;
            if (settings.intro && !reduceMotion.matches) introArmed = true;
          }
          if (!settings.interactive && chargesActive) {
            heights.fill(0);
            previousHeights.fill(0);
            charges.fill(0);
            chargesActive = false;
            chargeBuffer?.write(charges);
          }
          wakeRenderer();
        };

        const applyMask = () => {
          if (disposed || failed) return;
          drawMask();
          applySettings();
          const settings = settingsRef.current;
          if (!settings.text.trim() || !document.fonts?.load) return;
          document.fonts
            .load(`${settings.fontWeight} 32px ${settings.fontFamily}`)
            .then(() => {
              if (disposed || failed) return;
              drawMask();
              wakeRenderer();
            })
            .catch(() => {});
        };

        const resize = () => {
          if (disposed || failed) return;
          invalidateBounds();
          const nextSize = measureSurface();
          if (nextSize[0] !== output.size[0] || nextSize[1] !== output.size[1]) output.resize(nextSize);
          const [width, height] = output.size;
          sceneTarget.resize([width, height]);
          const half = glowSize([width, height]);
          glowA.resize(half);
          glowB.resize(half);
          blurParamsX.set({ direction: [1 / half[0], 0, 4, 1] });
          blurParamsY.set({ direction: [0, 1 / half[1], 4, 0] });
          params.set({ resolution: [width, height, 1 / width, 1 / height] });
          drawMask();
          applySettings();
        };

        applySettingsRef.current = applySettings;
        applyMaskRef.current = applyMask;
        replayRef.current = () => {
          if (disposed || failed || !settingsRef.current.intro || reduceMotion.matches) return;
          introArmed = true;
          wakeRenderer();
        };

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(root);
        visibilityObserver = new IntersectionObserver(
          entries => {
            visible = entries.some(entry => entry.isIntersecting);
            if (visible) wakeRenderer();
          },
          { threshold: 0 }
        );
        visibilityObserver.observe(root);
        document.addEventListener('visibilitychange', handleWake);
        reduceMotion.addEventListener('change', handleWake);
        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('scroll', invalidateBounds, { capture: true, passive: true });

        resize();
        applyMask();
      } catch (error) {
        reportFailure(error);
      }
    })();

    return () => {
      disposed = true;
      wakeRenderer = () => {};
      applySettingsRef.current = () => {};
      applyMaskRef.current = () => {};
      replayRef.current = () => {};
      document.removeEventListener('visibilitychange', handleWake);
      reduceMotion.removeEventListener('change', handleWake);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', invalidateBounds, { capture: true } as EventListenerOptions);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      unsubscribeGpuError?.();
      if (frameId) cancelAnimationFrame(frameId);
      maskTexture?.destroy();
      chargeBuffer?.destroy();
      gpu?.dispose();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`shape-waves ${className}`}
      data-ready={ready}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="shape-waves__canvas" />
    </div>
  );
}
