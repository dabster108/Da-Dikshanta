/**
 * The "train the model" mechanic.
 *
 * Silhouettes do not assemble just because the camera arrived — a visitor has
 * to hold on a project long enough to charge it. Bailing early gives no
 * partial credit, which keeps the rule legible: you either trained it or you
 * didn't.
 */
const STORAGE_KEY = "synaptic-activated";
const CHARGE_MS = 700;
const RELEASE_MS = 300;
/** Touch drags past this are a scroll, not a hold. */
const TOUCH_SLOP = 12;

export interface ActivationCallbacks {
  onProgress: (id: string, progress: number) => void;
  onActivate: (id: string) => void;
  onChange: (activated: Set<string>) => void;
}

export class ActivationSystem {
  readonly activated = new Set<string>();

  private readonly charging = new Map<string, number>();
  private readonly releasing = new Map<string, number>();
  private readonly callbacks: ActivationCallbacks;
  private frame = 0;
  private last = 0;
  private destroyed = false;

  constructor(callbacks: ActivationCallbacks) {
    this.callbacks = callbacks;
    this.hydrate();
  }

  /** Session-scoped on purpose: sharing the link on a shared machine should
   *  hand the next person a fresh run, not a finished one. */
  private hydrate() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      for (const id of parsed) {
        if (typeof id === "string") this.activated.add(id);
      }
    } catch {
      // Private-mode storage failures are not worth breaking the page over.
    }
  }

  private persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...this.activated]));
    } catch {
      /* ignore */
    }
  }

  attach(id: string, element: HTMLElement): () => void {
    const begin = (event: PointerEvent) => {
      if (this.activated.has(id)) return;
      if (event.pointerType === "touch") {
        this.touchOrigin = { x: event.clientX, y: event.clientY };
      }
      this.releasing.delete(id);
      if (!this.charging.has(id)) this.charging.set(id, this.progressOf(id));
      this.ensureLoop();
    };

    const end = () => {
      if (!this.charging.has(id)) return;
      const progress = this.charging.get(id) ?? 0;
      this.charging.delete(id);
      if (progress > 0) {
        this.releasing.set(id, progress);
        this.ensureLoop();
      }
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || !this.touchOrigin) return;
      const dx = event.clientX - this.touchOrigin.x;
      const dy = event.clientY - this.touchOrigin.y;
      if (Math.hypot(dx, dy) > TOUCH_SLOP) end();
    };

    // Keyboard users get the same mechanic: focus charges, blur releases.
    const focusBegin = () => begin({ pointerType: "" } as PointerEvent);

    element.addEventListener("pointerenter", begin);
    element.addEventListener("pointerdown", begin);
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", end);
    element.addEventListener("pointerup", end);
    element.addEventListener("pointercancel", end);
    element.addEventListener("focusin", focusBegin);
    element.addEventListener("focusout", end);

    return () => {
      element.removeEventListener("pointerenter", begin);
      element.removeEventListener("pointerdown", begin);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", end);
      element.removeEventListener("pointerup", end);
      element.removeEventListener("pointercancel", end);
      element.removeEventListener("focusin", focusBegin);
      element.removeEventListener("focusout", end);
      this.charging.delete(id);
      this.releasing.delete(id);
    };
  }

  /** Reduced-motion path: viewport entry counts, no hold required. */
  activateImmediately(id: string) {
    if (this.activated.has(id)) return;
    this.charging.delete(id);
    this.releasing.delete(id);
    this.commit(id);
  }

  isActivated(id: string) {
    return this.activated.has(id);
  }

  progressOf(id: string) {
    if (this.activated.has(id)) return 1;
    return this.charging.get(id) ?? this.releasing.get(id) ?? 0;
  }

  destroy() {
    this.destroyed = true;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.charging.clear();
    this.releasing.clear();
  }

  private touchOrigin: { x: number; y: number } | null = null;

  private commit(id: string) {
    this.activated.add(id);
    this.persist();
    this.callbacks.onProgress(id, 1);
    this.callbacks.onActivate(id);
    this.callbacks.onChange(new Set(this.activated));
  }

  private ensureLoop() {
    if (this.frame || this.destroyed) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    const dt = Math.min(now - this.last, 64);
    this.last = now;
    this.frame = 0;

    for (const [id, progress] of [...this.charging]) {
      const next = progress + dt / CHARGE_MS;
      if (next >= 1) {
        this.charging.delete(id);
        this.commit(id);
      } else {
        this.charging.set(id, next);
        this.callbacks.onProgress(id, next);
      }
    }

    for (const [id, progress] of [...this.releasing]) {
      const next = progress - dt / RELEASE_MS;
      if (next <= 0) {
        this.releasing.delete(id);
        this.callbacks.onProgress(id, 0);
      } else {
        this.releasing.set(id, next);
        this.callbacks.onProgress(id, next);
      }
    }

    if (!this.destroyed && (this.charging.size || this.releasing.size)) {
      this.frame = requestAnimationFrame(this.tick);
    }
  };
}
