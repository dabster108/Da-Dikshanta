export type Tier = "high" | "low";

export interface DeviceProfile {
  tier: Tier;
  reducedMotion: boolean;
  /** Multiplier applied to per-layer node counts. */
  nodeScale: number;
  pulseCount: number;
  maxPixelRatio: number;
  bloom: boolean;
  film: boolean;
  drift: boolean;
  antialias: boolean;
}

export const detectDevice = (): DeviceProfile => {
  if (typeof window === "undefined") {
    return {
      tier: "low",
      reducedMotion: true,
      nodeScale: 0.5,
      pulseCount: 0,
      maxPixelRatio: 1,
      bloom: false,
      film: false,
      drift: false,
      antialias: false,
    };
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isNarrow = window.matchMedia("(max-width: 768px)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const low = isNarrow || coarse || cores <= 4;

  if (low) {
    return {
      tier: "low",
      reducedMotion,
      nodeScale: 0.5,
      pulseCount: 26,
      maxPixelRatio: 1.5,
      bloom: false,
      film: false,
      drift: false,
      antialias: false,
    };
  }

  return {
    tier: "high",
    reducedMotion,
    nodeScale: 1,
    pulseCount: 72,
    maxPixelRatio: 2,
    bloom: true,
    film: true,
    drift: true,
    antialias: true,
  };
};
