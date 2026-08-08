/**
 * One animation clock for the whole site.
 *
 * Every pointer-reactive and scroll-reactive thing on the page reads from this
 * single store instead of registering its own listener and its own
 * requestAnimationFrame. That matters here: the 3D scene, the cursor light,
 * six canvas demos and a dozen parallax layers all want the same two numbers
 * every frame, and running twenty loops to compute them is how a site like
 * this ends up at 20fps.
 *
 * The store is mutated in place and never triggers a React render. Components
 * that need per-frame values read `viewport` inside their own frame callback;
 * components that need to re-render subscribe to discrete events instead.
 */

export interface ViewportState {
  /** Pointer in CSS pixels. */
  x: number;
  y: number;
  /** Pointer normalised to -1..1 with origin at viewport centre. */
  nx: number;
  ny: number;
  /** Critically damped follow of nx/ny — what most visuals should use. */
  sx: number;
  sy: number;
  /** Pointer speed in normalised units per second, smoothed. Drives
   *  "intensity" for anything that should react harder to fast movement. */
  speed: number;
  /** True once a real pointer has moved. Avoids everything snapping from the
   *  centre on first move, and keeps touch devices calm. */
  active: boolean;
  /** Coarse pointer (touch). */
  coarse: boolean;

  /** Raw document scroll in px. */
  scrollY: number;
  /** Scroll as 0..1 over the scrollable height. */
  progress: number;
  /** Damped follow of progress. */
  sProgress: number;
  /** Signed scroll velocity in px/second, smoothed. */
  scrollVelocity: number;

  width: number;
  height: number;

  /** Seconds since the store started, and since the previous frame. */
  time: number;
  dt: number;

  reducedMotion: boolean;
}

const state: ViewportState = {
  x: 0,
  y: 0,
  nx: 0,
  ny: 0,
  sx: 0,
  sy: 0,
  speed: 0,
  active: false,
  coarse: false,
  scrollY: 0,
  progress: 0,
  sProgress: 0,
  scrollVelocity: 0,
  width: 1,
  height: 1,
  time: 0,
  dt: 1 / 60,
  reducedMotion: false,
};

export const viewport: Readonly<ViewportState> = state;

type FrameCallback = (v: ViewportState) => void;

const callbacks = new Set<FrameCallback>();
let started = false;
let rafId = 0;
let lastTs = 0;
let prevScrollY = 0;
let prevNx = 0;
let prevNy = 0;
/** Pointer x/y are written to CSS custom properties so plain CSS gradients can
 *  follow the cursor without a React render. Only write when it changed. */
let lastCssX = -1;
let lastCssY = -1;

/** Frame-rate independent damping. `lambda` is roughly "how many e-foldings
 *  per second" — higher is snappier. */
const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

const measure = () => {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
};

const readScroll = () => {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  state.scrollY = window.scrollY || doc.scrollTop || 0;
  state.progress = max > 0 ? Math.min(1, Math.max(0, state.scrollY / max)) : 0;
};

const onPointerMove = (e: PointerEvent) => {
  state.x = e.clientX;
  state.y = e.clientY;
  state.nx = (e.clientX / state.width) * 2 - 1;
  state.ny = -((e.clientY / state.height) * 2 - 1);
  state.active = true;
  state.coarse = e.pointerType !== "mouse";
};

const onPointerLeave = () => {
  // Ease back to centre rather than freezing wherever the pointer exited.
  state.nx = 0;
  state.ny = 0;
  state.active = false;
};

const tick = (ts: number) => {
  rafId = requestAnimationFrame(tick);

  if (!lastTs) lastTs = ts;
  // Clamp dt so a backgrounded tab doesn't produce one enormous step that
  // teleports every damped value on return.
  const dt = Math.min(0.05, (ts - lastTs) / 1000);
  lastTs = ts;
  state.dt = dt;
  state.time += dt;

  readScroll();

  const lambda = state.reducedMotion ? 60 : 7;
  state.sx = damp(state.sx, state.nx, lambda, dt);
  state.sy = damp(state.sy, state.ny, lambda, dt);
  state.sProgress = damp(state.sProgress, state.progress, lambda + 3, dt);

  const dx = state.nx - prevNx;
  const dy = state.ny - prevNy;
  prevNx = state.nx;
  prevNy = state.ny;
  const instantSpeed = dt > 0 ? Math.hypot(dx, dy) / dt : 0;
  // Fast attack, slow release: a flick should spike intensity and then bleed
  // off, rather than averaging itself away before anything can react.
  state.speed = damp(
    state.speed,
    Math.min(6, instantSpeed),
    instantSpeed > state.speed ? 18 : 3,
    dt,
  );

  const scrollDelta = state.scrollY - prevScrollY;
  prevScrollY = state.scrollY;
  state.scrollVelocity = damp(
    state.scrollVelocity,
    dt > 0 ? scrollDelta / dt : 0,
    10,
    dt,
  );

  const cssX = Math.round(state.x);
  const cssY = Math.round(state.y);
  if (cssX !== lastCssX || cssY !== lastCssY) {
    lastCssX = cssX;
    lastCssY = cssY;
    const root = document.documentElement.style;
    root.setProperty("--px", `${cssX}px`);
    root.setProperty("--py", `${cssY}px`);
  }

  for (const cb of callbacks) cb(state);
};

const start = () => {
  if (started || typeof window === "undefined") return;
  started = true;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  state.reducedMotion = motionQuery.matches;
  motionQuery.addEventListener("change", (e) => {
    state.reducedMotion = e.matches;
  });

  state.coarse = window.matchMedia("(pointer: coarse)").matches;

  measure();
  readScroll();
  prevScrollY = state.scrollY;
  state.sProgress = state.progress;

  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave, { passive: true });
  document.addEventListener("pointerleave", onPointerLeave, { passive: true });

  rafId = requestAnimationFrame(tick);
};

/**
 * Register a per-frame callback. Returns an unsubscribe function.
 * The loop itself only runs while at least one subscriber exists in dev; in
 * practice the scene subscribes for the lifetime of the page.
 */
export const onFrame = (cb: FrameCallback): (() => void) => {
  start();
  callbacks.add(cb);
  return () => {
    callbacks.delete(cb);
  };
};

/** Ensure the store is running even with no subscribers (CSS vars, scroll). */
export const initViewport = start;

export const stopViewport = () => {
  if (!started) return;
  cancelAnimationFrame(rafId);
  started = false;
  lastTs = 0;
};

export { damp };
