import { useEffect, useState } from "react";

export const SPLASH_HOLD_MS = 8000;
export const SPLASH_FADE_MS = 550;
const REDUCED_MOTION_HOLD_MS = 700;

export type SplashPhase = "in" | "out" | "gone";

/**
 * Controls the opening screen: it stays fully visible for `holdMs`, then fades
 * out for `fadeMs`, then reports "gone" so it can be unmounted. The wait is
 * shortened for people who ask their system for less movement.
 */
export function useSplash(holdMs = SPLASH_HOLD_MS, fadeMs = SPLASH_FADE_MS) {
  const [phase, setPhase] = useState<SplashPhase>("in");

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduced ? Math.min(holdMs, REDUCED_MOTION_HOLD_MS) : holdMs;

    const fade = window.setTimeout(() => setPhase("out"), hold);
    const done = window.setTimeout(() => setPhase("gone"), hold + fadeMs);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(done);
    };
  }, [holdMs, fadeMs]);

  return phase;
}
