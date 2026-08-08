/**
 * Capability tiering.
 *
 * Decided once at load from cheap signals — we never benchmark, because a
 * benchmark on the first frame is itself a jank source. Tiers scale particle
 * counts and switch off the expensive passes; they never remove a feature the
 * visitor can see, only its density.
 */

export type Tier = "high" | "mid" | "low";

export interface DeviceProfile {
  tier: Tier;
  reducedMotion: boolean;
  coarsePointer: boolean;
  /** Particles in the persistent field. */
  particles: number;
  /** Maximum simultaneous connection lines. */
  edges: number;
  /** Signals travelling the network. */
  pulses: number;
  maxPixelRatio: number;
  /** Additive second sprite pass that fakes bloom without a composer. */
  glowPass: boolean;
  antialias: boolean;
}

let cached: DeviceProfile | null = null;

export const getDevice = (): DeviceProfile => {
  if (cached) return cached;

  if (typeof window === "undefined") {
    cached = {
      tier: "low",
      reducedMotion: true,
      coarsePointer: true,
      particles: 0,
      edges: 0,
      pulses: 0,
      maxPixelRatio: 1,
      glowPass: false,
      antialias: false,
    };
    return cached;
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;

  // Anything touch-first, small, or clearly memory-constrained gets the low
  // tier. Desktop with few cores lands in the middle rather than the bottom —
  // the scene is fill-rate bound more than CPU bound.
  let tier: Tier = "high";
  if (narrow || coarsePointer || (memory !== undefined && memory <= 4)) {
    tier = "low";
  } else if (cores <= 4) {
    tier = "mid";
  }

  const profiles: Record<Tier, Omit<DeviceProfile, "tier" | "reducedMotion" | "coarsePointer">> = {
    high: {
      particles: 4200,
      edges: 1500,
      pulses: 90,
      maxPixelRatio: 1.85,
      glowPass: true,
      antialias: true,
    },
    mid: {
      particles: 2400,
      edges: 900,
      pulses: 50,
      maxPixelRatio: 1.5,
      glowPass: true,
      antialias: false,
    },
    low: {
      particles: 1100,
      edges: 420,
      pulses: 22,
      maxPixelRatio: 1.35,
      glowPass: false,
      antialias: false,
    },
  };

  cached = { tier, reducedMotion, coarsePointer, ...profiles[tier] };
  return cached;
};

/** True when we should not run continuous background animation at all. */
export const prefersStillness = () => getDevice().reducedMotion;
