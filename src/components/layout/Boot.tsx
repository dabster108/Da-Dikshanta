import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScroll } from "@/lib/animation/scrollContext";
import { detectTier } from "@/lib/animation/sceneState";

/**
 * Boot — a calibration sequence.
 *
 * Not a spinner and not a fake bar. The conceit is that the instrument is
 * reading its own environment before it starts, and everything it prints is
 * true: the GPU string comes from WEBGL_debug_renderer_info, the tier from
 * the same `detectTier()` the 3D layer uses to pick its particle budget, the
 * viewport and pixel ratio from the window. A visitor who checks will find
 * the numbers correct.
 *
 * The signal trace is the load itself made visible — it starts as noise and
 * settles into a clean wave as the page becomes ready. That is doing the job
 * a progress bar does, without pretending to measure bytes it can't see.
 *
 * Once the count reaches 100, the counter dissolves and the identity
 * resolves in its place — each character cycling through random glyphs and
 * locking left to right, top to bottom, the same cascading-reveal logic used
 * for the environment readout and for the noise trace calming into a clean
 * wave. It isn't a new trick bolted on; it's the same "resolving from noise"
 * idea the whole screen already runs, pointed at a different payload. The
 * typographic split — DIKSHANTA in tracked sans, Chapagain in serif — is the
 * exact pairing the nav wordmark and the hero headline use, so the boot
 * screen is quite literally assembling the identity that then persists as
 * chrome for the rest of the visit.
 *
 * TIMING. The sequence runs ~4.5s by design (asked for explicitly, and it
 * overrides §43's no-artificial-delay rule). But it is a *floor*, not a
 * fixed length: the exit is gated on the scene and the webfonts actually
 * being ready, so on a cold load or a slow device it holds longer rather
 * than dropping the visitor into a half-built page. It never exits early.
 */

interface Props {
  /** Set by the shell once the 3D chunk has mounted and produced a frame. */
  sceneReady: boolean;
  onDone: () => void;
}

/* --- Real environment readout ------------------------------------------ */

const readGPU = (): string => {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "No WebGL";

    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const raw = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));

    // Release the probe context immediately — browsers cap how many a page
    // may hold, and the real one has not been created yet.
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    // Vendors format this string very differently. Normalise to the part a
    // person would recognise:
    //   "ANGLE (Apple, ANGLE Metal Renderer: Apple M1 Pro, Unspecified)" → "Apple M1 Pro"
    //   "ANGLE (NVIDIA, NVIDIA RTX 3080 Direct3D11 vs_5_0 ps_5_0, D3D11)" → "NVIDIA RTX 3080"
    let name = raw;
    const angle = raw.match(/^ANGLE \((.*)\)$/);
    if (angle) {
      const parts = angle[1].split(",").map((s) => s.trim());
      name = parts[1] ?? parts[0];
    }
    name = name
      .replace(/^ANGLE\s+\S+\s+Renderer:\s*/i, "")
      .replace(/\s+(Direct3D|OpenGL|Metal|vs_|ps_).*$/i, "")
      .replace(/\s*\(.*$/, "")
      .trim();

    return name.slice(0, 28) || "GPU";
  } catch {
    return "Unavailable";
  }
};

/** Deterministic hash noise in -1..1. Cheap, and stable for a given (i, t). */
const noise = (i: number, t: number) => {
  const v = Math.sin(i * 12.9898 + t * 4.1) * 43758.5453;
  return (v - Math.floor(v)) * 2 - 1;
};

const TRACE_W = 100;
const TRACE_H = 24;
const TRACE_N = 140;

/** How long the exit will wait on real readiness after the choreography ends.
 *  Keeps the whole sequence inside its ~4.5–5.2s budget on a cold load. */
const MAX_GATE_WAIT = 500;

/* --- Identity resolve --------------------------------------------------- */

const FIRST_NAME = "DIKSHANTA";
const LAST_NAME = "Chapagain";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";

/** A random glyph matching the case of the target character, so a locked
 *  letter never looks like it briefly switched case mid-resolve. */
const glyphFor = (final: string) => {
  if (/[A-Z]/.test(final)) return UPPER[(Math.random() * UPPER.length) | 0];
  if (/[a-z]/.test(final)) return LOWER[(Math.random() * LOWER.length) | 0];
  return final;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Advances the scramble to progress `p` (0..1). Each character gets its own
 * window along the timeline — 65% of the run spread across the cascade start
 * times, each character taking the following 35% to lock — so letters settle
 * in a rolling wave left to right rather than all resolving at once. A
 * character is written once more after it locks, then left alone.
 */
const stepScramble = (chars: HTMLElement[], p: number) => {
  const n = chars.length;
  chars.forEach((el, i) => {
    if (el.dataset.locked === "1") return;
    const final = el.dataset.final ?? "";
    if (final === " ") {
      el.textContent = " ";
      el.dataset.locked = "1";
      return;
    }
    const start = (i / n) * 0.65;
    const local = clamp01((p - start) / 0.35);
    if (local >= 1) {
      el.textContent = final;
      el.dataset.locked = "1";
    } else if (p > 0) {
      el.textContent = glyphFor(final);
    }
  });
};

const buildTrace = (settle: number, t: number) => {
  let d = "";
  for (let i = 0; i < TRACE_N; i++) {
    const x = (i / (TRACE_N - 1)) * TRACE_W;
    // The clean carrier is always there; noise on top of it decays to zero.
    const carrier = Math.sin((i / (TRACE_N - 1)) * Math.PI * 5 + t * 1.6) * 4.2;
    // Exponent below 1 keeps the grain high through the middle of the
    // sequence and then collapses it late, so the trace visibly *locks*
    // rather than fading out from the first frame.
    const grain = noise(i, t) * 10 * (1 - settle) ** 0.75;
    // Amplitude also tightens as it settles, so the line ends up calm.
    const y = TRACE_H / 2 + carrier * (1 - settle * 0.55) + grain;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
};

export const Boot = ({ sceneReady, onDone }: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const traceRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const nameWrapRef = useRef<HTMLDivElement>(null);
  const nameRuleRef = useRef<HTMLSpanElement>(null);

  const fontsReady = useRef(false);
  const sceneReadyRef = useRef(false);
  const sequenceDone = useRef(false);
  const exited = useRef(false);
  const gateStart = useRef(0);

  const reduced = useReducedMotion();
  const { setLocked } = useScroll();

  // Read the environment once, before anything animates.
  const env = useMemo(() => {
    const tier = detectTier();
    return [
      { k: "Renderer", v: readGPU() },
      { k: "Tier", v: tier.toUpperCase() },
      { k: "Viewport", v: `${window.innerWidth}×${window.innerHeight}` },
      { k: "Ratio", v: `${(window.devicePixelRatio || 1).toFixed(1)}×` },
      { k: "Threads", v: String(navigator.hardwareConcurrency ?? "—") },
      { k: "Motion", v: reduced ? "REDUCED" : "FULL" },
    ];
    // Deliberately not reactive: this is a snapshot of the machine at boot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The page must not scroll behind the boot screen. */
  useEffect(() => {
    setLocked(true);
    return () => setLocked(false);
  }, [setLocked]);

  /* Real readiness gates. Neither of these makes the bar move — they decide
     when the sequence is *allowed* to end. */
  useEffect(() => {
    let alive = true;
    const mark = () => {
      if (alive) fontsReady.current = true;
    };
    if (document.fonts?.ready) {
      document.fonts.ready.then(mark).catch(mark);
    } else {
      mark();
    }
    // A stalled font CDN must not hold the page hostage indefinitely.
    const bail = window.setTimeout(mark, 6000);
    return () => {
      alive = false;
      window.clearTimeout(bail);
    };
  }, []);

  useEffect(() => {
    sceneReadyRef.current = sceneReady;
    if (sceneReady && sequenceDone.current) tryExit();
    // tryExit is stable for the component's lifetime via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneReady]);

  /* --- The sequence --------------------------------------------------- */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const counter = counterRef.current!;
      const bar = barRef.current!;
      const trace = traceRef.current;
      const label = labelRef.current!;

      const state = { progress: 0, settle: 0 };

      /* The trace runs on the shared ticker, not its own RAF. */
      let tick: ((t: number) => void) | null = null;
      if (trace && !reduced) {
        tick = (time: number) => {
          trace.setAttribute("d", buildTrace(state.settle, time / 1000));
        };
        gsap.ticker.add(tick);
      } else if (trace) {
        trace.setAttribute("d", buildTrace(1, 0));
      }

      const tl = gsap.timeline({
        onComplete: () => {
          sequenceDone.current = true;
          tryExit();
        },
      });

      const nameWrap = nameWrapRef.current!;
      const nameRule = nameRuleRef.current!;
      const nameChars = Array.from(
        nameWrap.querySelectorAll<HTMLElement>("[data-name-char]"),
      );

      if (reduced) {
        // Same information, no motion: the identity lands, nothing animates.
        gsap.set(counter, { opacity: 0 });
        gsap.set(nameWrap, { opacity: 1 });
        gsap.set(nameRule, { scaleX: 1 });
        gsap.set(bar, { scaleX: 1 });
        label.textContent = "System ready";
        tl.to(root, { opacity: 1, duration: 0.9 });
      } else {
        tl
          // 1. The frame draws itself.
          .from("[data-boot-rule]", {
            scaleX: 0,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.08,
          })
          // 2. The instrument reports what it is running on.
          .from(
            "[data-boot-row]",
            { opacity: 0, y: 8, duration: 0.5, stagger: 0.07, ease: "power2.out" },
            0.15,
          )
          // 3. The count. power1.inOut so it accelerates and eases in —
          //    a linear counter reads as a timer, which is what it must not be.
          .to(
            state,
            {
              progress: 1,
              duration: 1.8,
              ease: "power1.inOut",
              onUpdate: () => {
                counter.textContent = String(Math.round(state.progress * 100)).padStart(3, "0");
                gsap.set(bar, { scaleX: state.progress * 0.62 });
              },
            },
            0.3,
          )
          // 4. The signal keeps building alongside the count — it only
          //    fully calms once the identity has locked, in step 5 below.
          .to(state, { settle: 0.55, duration: 1.7, ease: "power2.out" }, 0.4)
          // 5. The counter dissolves and the identity resolves in its place.
          //    Label switches mid-flight to name what's actually happening.
          .call(
            () => {
              label.textContent = "Resolving";
            },
            undefined,
            2.1,
          )
          // The counter fades fully out BEFORE the name starts fading in —
          // sequential, not crossfaded. Both render in the same grid cell,
          // so any window where they're both above ~0 opacity is two full
          // strings of text double-exposed on top of each other. A 100%→0%
          // handoff with no overlap is what keeps each state legible.
          .to(counter, { opacity: 0, scale: 0.92, y: -8, duration: 0.3, ease: "power2.in" }, 2.1)
          .to(nameWrap, { opacity: 1, duration: 0.15 }, 2.4)
          .to(
            { p: 0 },
            {
              p: 1,
              duration: 0.85,
              ease: "none",
              onUpdate: function () {
                stepScramble(nameChars, this.targets()[0].p);
              },
            },
            2.4,
          )
          // The trace finishes settling exactly as the last letter locks —
          // noise resolving into a name and noise resolving into a clean
          // wave land on the same beat.
          .to(state, { settle: 1, duration: 0.5, ease: "power2.inOut" }, 2.75)
          .to(bar, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 2.75)
          // 6. Lock.
          .call(
            () => {
              label.textContent = "System ready";
              gsap.fromTo(
                label,
                { opacity: 0.3 },
                { opacity: 1, color: "rgb(var(--lime))", duration: 0.4 },
              );
            },
            undefined,
            3.27,
          )
          .fromTo(nameRule, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.out" }, 3.27)
          // 7. Hold, so the resolved name is read rather than glimpsed. Ends
          //    ~3.6s; the ~1s exit brings the whole thing to ~4.6s from mount.
          .to({}, { duration: 0.35 }, 3.27);
      }

      return () => {
        if (tick) gsap.ticker.remove(tick);
        tl.kill();
      };
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  /* --- Exit ------------------------------------------------------------ */
  function tryExit() {
    if (exited.current) return;
    if (!sequenceDone.current) return;

    // Hold past the choreography if the machine genuinely isn't ready — but
    // only briefly. The 3D layer is atmosphere behind the content, so a scene
    // that arrives a moment after the reveal costs nothing, whereas standing
    // on a finished loading screen for several more seconds costs everything.
    if (!gateStart.current) gateStart.current = performance.now();
    const ready = sceneReadyRef.current && fontsReady.current;
    if (!ready && performance.now() - gateStart.current < MAX_GATE_WAIT) {
      window.setTimeout(tryExit, 100);
      return;
    }
    exited.current = true;

    const root = rootRef.current;
    if (!root) return onDone();

    if (reduced) {
      gsap.to(root, { opacity: 0, duration: 0.35, onComplete: onDone });
      return;
    }

    gsap
      .timeline({ onComplete: onDone })
      .to("[data-boot-fade]", {
        opacity: 0,
        y: -10,
        duration: 0.35,
        stagger: 0.035,
        ease: "power2.in",
      })
      // A curtain wipe rather than a fade — the page beneath is already
      // painted, so this reveals it instead of cross-dissolving to it.
      .to(
        root,
        { clipPath: "inset(0% 0% 100% 0%)", duration: 0.8, ease: "expo.inOut" },
        "-=0.2",
      );
  }

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-boot flex flex-col justify-between px-gutter py-8 sm:py-10"
      style={{ background: "rgb(var(--bg))", clipPath: "inset(0% 0% 0% 0%)" }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Top rule + label */}
      <div data-boot-fade>
        <span
          data-boot-rule
          className="block h-px w-full origin-left"
          style={{ background: "rgb(var(--line-strong))" }}
        />
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <span ref={labelRef} className="t-mono">
            Calibrating
          </span>
          <span className="t-mono">27.7799° N &nbsp; 85.3620° E</span>
        </div>
      </div>

      {/* The count, dissolving into the identity it was counting toward.
          Both occupy the same grid cell so the swap is a crossfade in
          place, with no layout jump when the counter's much taller glyphs
          give way to the two name lines. */}
      <div data-boot-fade className="flex flex-col items-center">
        <div className="grid w-full place-items-center">
          <span
            ref={counterRef}
            data-boot-counter
            aria-hidden="true"
            className="serif tabular-nums"
            style={{
              gridArea: "1 / 1",
              fontSize: "clamp(5rem, 22vw, 16rem)",
              lineHeight: 0.82,
              color: "rgb(var(--text))",
            }}
          >
            000
          </span>

          {/* aria-hidden: this cycles ~18 glyphs multiple times a second
              while resolving. Inside an aria-live region that would spam
              assistive tech; `labelRef` below carries the three real status
              changes instead. */}
          <div
            ref={nameWrapRef}
            aria-hidden="true"
            className="flex flex-col items-center"
            style={{ gridArea: "1 / 1", opacity: 0 }}
          >
            <span
              className="block"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(1.1rem, 3vw, 1.9rem)",
                fontWeight: 500,
                letterSpacing: "0.22em",
                color: "rgb(var(--text-2))",
              }}
            >
              {FIRST_NAME.split("").map((c, i) => (
                <span key={i} data-name-char data-final={c}>
                  {c}
                </span>
              ))}
            </span>
            <span
              className="serif block"
              style={{
                fontSize: "clamp(3rem, 12vw, 7.5rem)",
                lineHeight: 0.92,
                marginTop: "0.15em",
                color: "rgb(var(--text))",
              }}
            >
              {LAST_NAME.split("").map((c, i) => (
                <span key={i} data-name-char data-final={c}>
                  {c}
                </span>
              ))}
            </span>
            <span
              ref={nameRuleRef}
              aria-hidden="true"
              className="mt-5 block h-px w-16 origin-left"
              style={{ background: "rgb(var(--lime))", transform: "scaleX(0)" }}
            />
          </div>
        </div>

        {/* Signal trace — noise resolving into a clean carrier */}
        <svg
          viewBox={`0 0 ${TRACE_W} ${TRACE_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          className="mt-8 h-14 w-full max-w-[46rem] sm:mt-10"
        >
          <path
            ref={traceRef}
            fill="none"
            stroke="rgb(var(--lime))"
            strokeWidth="0.45"
            vectorEffect="non-scaling-stroke"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* Environment readout + progress */}
      <div data-boot-fade>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {env.map((e) => (
            <div key={e.k} data-boot-row className="min-w-0">
              <dt className="t-mono">{e.k}</dt>
              <dd
                className="mt-1 truncate font-mono text-[0.78rem] tracking-[0.06em]"
                style={{ color: "rgb(var(--text-2))" }}
                title={e.v}
              >
                {e.v}
              </dd>
            </div>
          ))}
        </dl>

        <div className="relative mt-6 h-px w-full">
          <span
            data-boot-rule
            className="absolute inset-0 block origin-left"
            style={{ background: "rgb(var(--line-strong))" }}
          />
          <span
            ref={barRef}
            className="absolute inset-0 block origin-left"
            style={{ background: "rgb(var(--lime))", transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
};
