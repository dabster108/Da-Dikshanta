/**
 * The bridge between scroll and the 3D scene.
 *
 * This is deliberately a plain mutable object rather than React state or a
 * store with subscriptions. Scroll updates at frame rate; routing that
 * through React would re-render the tree ~60 times a second for values that
 * only the render loop consumes. ScrollController writes here, `useFrame`
 * reads here, and React never learns about it (§51).
 *
 * Anything React genuinely needs — the active chapter index, which changes a
 * handful of times per visit — goes through context instead.
 */

export type DeviceTier = "high" | "mid" | "low";

export interface SceneState {
  /** Whole-document scroll, 0..1. */
  progress: number;
  /** Index into CHAPTERS. */
  chapter: number;
  /** Progress within the active chapter, 0..1. */
  chapterProgress: number;
  /** Pointer in normalised device coords, -1..1. Smoothed by the consumer. */
  pointerX: number;
  pointerY: number;
  /** Scroll velocity, roughly -1..1 after clamping. Drives particle reaction. */
  velocity: number;
  /** Set once at boot; the scene degrades itself rather than being told to. */
  tier: DeviceTier;
  /** Multiplies the chapter's own opacity. Routes that are dense with
   *  reading — the project pages — push the 3D further back with this
   *  rather than by inventing extra entries in the camera path. */
  opacityScale: number;
  reduced: boolean;
  /** False while the scene is off-screen — the render loop idles (§46). */
  visible: boolean;
}

export const sceneState: SceneState = {
  progress: 0,
  chapter: 0,
  chapterProgress: 0,
  pointerX: 0,
  pointerY: 0,
  velocity: 0,
  tier: "high",
  opacityScale: 1,
  reduced: false,
  visible: true,
};

/**
 * Device tier from the cheapest signals available at boot. No benchmark
 * loop — a frame-timing probe costs more than it saves and a wrong guess
 * here only changes particle counts.
 */
export const detectTier = (): DeviceTier => {
  if (typeof window === "undefined") return "mid";

  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;

  if (coarse && narrow) return cores >= 8 && mem >= 6 ? "mid" : "low";
  if (cores <= 4 || mem <= 4) return "mid";
  return "high";
};

/** Particle budget per tier (§30, §46). Kept small on purpose — the field is
 *  meant to read as signal, not as a galaxy. */
export const PARTICLE_BUDGET: Record<DeviceTier, number> = {
  high: 900,
  mid: 480,
  low: 200,
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent damping. `smoothing` is the fraction remaining
 *  after 1/60s, so behaviour holds at 30fps and at 144fps. */
export const damp = (current: number, target: number, smoothing: number, dt: number) =>
  lerp(current, target, 1 - Math.pow(smoothing, dt * 60));

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
