import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from "react";
import { gsap } from "gsap";
import { PROJECTS, type Project } from "@/data/projects";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Research Console — the Projects section as a small graph, not a grid.
 *
 * Six projects sit as nodes on an ellipse (a vertical stack on touch).
 * The visitor navigates the graph, locks on to a node, and the environment
 * transforms into that project's full view. Nothing here is a bounded
 * card — every project preview is a dot, a label, and a connecting line.
 *
 * Perf notes (see the prompt's lag-fixes section, applied from the start
 * rather than retrofitted):
 *  - Cursor position is tracked in a ref, never React state, so mousemove
 *    never triggers a re-render.
 *  - Idle drift + magnetic pull for all nodes are computed in one shared
 *    gsap.ticker callback and written via gsap.quickTo — one scheduled
 *    unit of work per frame, not N independent infinite tweens.
 *  - The ticker callback is a no-op while the console is off-screen
 *    (IntersectionObserver) or while a project is locked on.
 */

const STORAGE_KEY = "console:explored:v1";
const MAGNET_RADIUS = 150;
const MAGNET_PULL = 0.08;

interface NodeLayout {
  baseX: number;
  baseY: number;
}

const readExplored = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
};

const writeExplored = (ids: string[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* private browsing / storage disabled — progress just won't persist */
  }
};

/* ------------------------------------------------------------------ *
 * Detail view — the full-viewport transform a locked-on node becomes.
 * ------------------------------------------------------------------ */

const DetailView = ({
  project,
  index,
  reduced,
  onClose,
  registerEl,
}: {
  project: Project;
  index: number;
  reduced: boolean;
  onClose: () => void;
  registerEl: (el: HTMLDivElement | null) => void;
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const tint = tintRef.current;
    registerEl(root);
    if (!root) return;
    if (reduced) {
      gsap.set(root, { opacity: 1, scale: 1 });
      if (tint) gsap.set(tint, { opacity: 1 });
      return () => registerEl(null);
    }
    gsap.fromTo(
      root,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
    );
    // Per-project intensity nudge on the single accent — never a new hue.
    if (tint) {
      gsap.fromTo(tint, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" });
    }
    return () => registerEl(null);
  }, [reduced, registerEl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const intensity = 0.1 + (index % 3) * 0.035;

  return (
    <div ref={rootRef} className="relative z-10 px-6 pb-20 pt-8 sm:px-10">
      <div
        ref={tintRef}
        className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[70vh] opacity-0"
        style={{
          background: `radial-gradient(60% 60% at 50% 0%, hsl(var(--accent) / ${intensity}), transparent 70%)`,
        }}
        aria-hidden
      />

      <button
        type="button"
        onClick={onClose}
        className="label-mono inline-flex items-center gap-2 opacity-60 transition-opacity hover:opacity-100"
      >
        <span aria-hidden>←</span> Back to console
      </button>

      <div className="mx-auto mt-10 grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <span className="label-mono block">
            {String(index + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")} —{" "}
            {project.domain} · {project.year}
          </span>

          <h3 className="display-lg mt-4 text-foreground">{project.title}</h3>

          <p className="body-lg mt-5 max-w-md">{project.tagline}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-2">
            {project.pipeline.map((stage, i) => (
              <span key={stage} className="flex items-center gap-2">
                <span className="rounded-full border border-accent/20 bg-accent/5 px-2 py-0.5 label-mono text-[10px] opacity-90">
                  {stage}
                </span>
                {i < project.pipeline.length - 1 && (
                  <span className="text-accent/50" aria-hidden>→</span>
                )}
              </span>
            ))}
          </div>

          <div className="mt-7 max-w-xl">
            <span className="label-mono label-mono-accent">{project.sections[0].label}</span>
            <p className="body-md mt-2 text-foreground-soft">{project.sections[0].body}</p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground-soft"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-5">
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-magnetic">
              View source <span className="arrow" aria-hidden>↗</span>
            </a>
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer" className="label-mono hover:text-foreground">
                Live ↗
              </a>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto aspect-[4/5] max-h-[55vh] w-full max-w-md overflow-hidden rounded-[20px] border border-white/10 bg-surface lg:max-h-[70vh]">
            <img
              src={project.image}
              alt={`${project.title} — ${project.tagline}`}
              className="h-full w-full object-cover object-center"
              loading="eager"
              decoding="async"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 60%, hsl(var(--background) / 0.85) 100%)" }}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * The console itself.
 * ------------------------------------------------------------------ */

export const ResearchConsole = () => {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const nodeLayerRef = useRef<HTMLDivElement>(null);
  const outerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const detailElRef = useRef<HTMLDivElement | null>(null);

  const layoutRef = useRef<NodeLayout[]>([]);
  const cursorRef = useRef({ x: -99999, y: -99999 });
  const pausedRef = useRef(false);
  const selectedRef = useRef<number | null>(null);
  const hoveredRef = useRef<number | null>(null);
  const lockedRef = useRef(false); // true while a lock/close animation is mid-flight

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [explored, setExplored] = useState<string[]>(() => readExplored());
  const prevExploredCount = useRef(explored.length);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  // Stable identity so DetailView's mount effect never re-fires on an
  // unrelated parent re-render (e.g. the explored-count readout ticking).
  const registerDetailEl = useCallback((el: HTMLDivElement | null) => {
    detailElRef.current = el;
  }, []);

  /* --- Persist + celebrate on the 6th new module. --------------------- */
  useEffect(() => {
    writeExplored(explored);
    const prevCount = prevExploredCount.current;
    prevExploredCount.current = explored.length;
    if (prevCount < PROJECTS.length && explored.length === PROJECTS.length) {
      setJustCompleted(true);
      const id = setTimeout(() => setJustCompleted(false), 900);
      return () => clearTimeout(id);
    }
  }, [explored]);

  useEffect(() => {
    if (!justCompleted) return;
    if (readoutRef.current) {
      gsap.fromTo(
        readoutRef.current,
        { scale: 1 },
        { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" },
      );
    }
    const lines = lineRefs.current.filter(Boolean) as SVGLineElement[];
    if (lines.length) {
      gsap
        .timeline()
        .fromTo(lines, { opacity: 0 }, { opacity: 0.6, duration: 0.4, ease: "power2.out" })
        .to(lines, { opacity: 0.15, duration: 0.4, ease: "power2.in" });
    }
  }, [justCompleted]);

  /* --- Ellipse layout, recomputed on resize (desktop only). ----------- */
  useLayoutEffect(() => {
    if (isMobile) return;
    const stage = stageRef.current;
    if (!stage) return;

    const update = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const radiusX = w * 0.36;
      const radiusY = h * 0.34;
      layoutRef.current = PROJECTS.map((_, i) => {
        const angle = (i / PROJECTS.length) * Math.PI * 2 - Math.PI / 2;
        return { baseX: Math.cos(angle) * radiusX, baseY: Math.sin(angle) * radiusY };
      });
      outerRefs.current.forEach((el, i) => {
        const l = layoutRef.current[i];
        if (!el || !l) return;
        el.style.transform = `translate(-50%, -50%) translate(${l.baseX}px, ${l.baseY}px)`;
      });
      setSize({ w, h });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [isMobile]);

  /* --- Cursor tracked in a ref only — never triggers a re-render. ----- */
  useEffect(() => {
    if (reduced || isMobile) return;
    const onMove = (e: PointerEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, isMobile]);

  /* --- Pause all console motion while off-screen. ---------------------- */
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        pausedRef.current = !entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    obs.observe(root);
    return () => obs.disconnect();
  }, []);

  /* --- One shared ticker drives idle drift + magnetic pull for every
   *     node. quickTo per node avoids spinning up a fresh tween per frame. */
  useEffect(() => {
    if (reduced || isMobile) return;
    const quicks = innerRefs.current.map((el) =>
      el
        ? {
            x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" }),
          }
        : null,
    );

    const tick = () => {
      if (pausedRef.current || selectedRef.current !== null || lockedRef.current) return;
      const t = performance.now() / 1000;
      const cursor = cursorRef.current;
      innerRefs.current.forEach((el, i) => {
        const q = quicks[i];
        if (!el || !q) return;
        // Freeze the hovered node in place: letting it drift under a
        // stationary cursor fires rapid pointerover/pointerout against the
        // global custom cursor (see Cursor.tsx), which can race GSAP's
        // colour-tween parsing. A caught node reads better anyway.
        if (i === hoveredRef.current) return;
        const phase = i * 0.9;
        const idleX = Math.sin(t * 0.5 + phase) * 8;
        const idleY = Math.cos(t * 0.4 + phase * 1.3) * 5;

        let magX = 0;
        let magY = 0;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cursor.x - cx;
        const dy = cursor.y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < MAGNET_RADIUS) {
          magX = dx * MAGNET_PULL;
          magY = dy * MAGNET_PULL;
        }

        q.x(idleX + magX);
        q.y(idleY + magY);
      });
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [reduced, isMobile, size.w, size.h]);

  /* --- Lock-on / release. Works identically for the desktop ellipse and
   *     the mobile stack — the travel delta is measured live, so it never
   *     depends on the ellipse math that only exists on desktop. -------- */
  const lockOn = (index: number) => {
    if (selectedRef.current !== null || lockedRef.current) return;
    const project = PROJECTS[index];
    const inner = innerRefs.current[index];
    const stage = stageRef.current;
    lockedRef.current = true;

    // lockedRef only clears on the timeline's own onComplete below — not
    // here — so the shared ticker can't sneak an idle-drift frame in
    // while the node layer is still mid-fade-out.
    const finish = () => {
      setSelected(index);
      setExplored((prev) => (prev.includes(project.id) ? prev : [...prev, project.id]));
    };

    if (reduced || !inner || !stage) {
      finish();
      lockedRef.current = false;
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const nodeRect = inner.getBoundingClientRect();
    const dx = stageRect.left + stageRect.width / 2 - (nodeRect.left + nodeRect.width / 2);
    const dy = stageRect.top + stageRect.height / 2 - (nodeRect.top + nodeRect.height / 2);

    const tl = gsap.timeline({ onComplete: () => { lockedRef.current = false; } });
    outerRefs.current.forEach((el, i) => {
      if (!el || i === index) return;
      tl.to(el, { opacity: 0.15, scale: 0.7, duration: 0.5, ease: "power2.inOut" }, 0);
    });
    tl.to(
      inner,
      { x: `+=${dx}`, y: `+=${dy}`, scale: isMobile ? 1.7 : 3, duration: 0.7, ease: "power3.inOut" },
      0,
    );
    if (nodeLayerRef.current) {
      tl.to(nodeLayerRef.current, { opacity: 0, duration: 0.2 }, 0.5);
      tl.set(nodeLayerRef.current, { pointerEvents: "none" }, 0.5);
    }
    tl.call(finish, undefined, 0.55);
  };

  const closeDetail = () => {
    const index = selectedRef.current;
    if (index === null || lockedRef.current) return;
    lockedRef.current = true;

    const finish = () => {
      setSelected(null);
      lockedRef.current = false;
      detailElRef.current = null;
    };

    if (reduced) {
      finish();
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    if (detailElRef.current) {
      tl.to(detailElRef.current, { opacity: 0, scale: 0.96, duration: 0.3, ease: "power2.in" }, 0);
    }
    if (nodeLayerRef.current) {
      tl.set(nodeLayerRef.current, { pointerEvents: "auto" }, 0.15);
      tl.to(nodeLayerRef.current, { opacity: 1, duration: 0.3 }, 0.15);
    }
    outerRefs.current.forEach((el) => {
      if (!el) return;
      tl.to(el, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 0.15);
    });
    const inner = innerRefs.current[index];
    if (inner) {
      tl.to(inner, { x: 0, y: 0, scale: 1, duration: 0.5, ease: "power3.inOut" }, 0.15);
    }
  };

  return (
    <div ref={sectionRef} className="relative">
      {selected === null ? (
        <div ref={nodeLayerRef} className="relative">
          {isMobile ? (
            <MobileStack
              explored={explored}
              onSelect={lockOn}
              innerRefs={innerRefs}
              outerRefs={outerRefs}
            />
          ) : (
            <div ref={stageRef} className="relative mx-auto h-[62vh] max-h-[560px] min-h-[420px] w-full max-w-4xl">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
                aria-hidden
              >
                {PROJECTS.map((_, i) => {
                  const a = layoutRef.current[i];
                  const b = layoutRef.current[(i + 1) % PROJECTS.length];
                  if (!a || !b) return null;
                  const cx = size.w / 2;
                  const cy = size.h / 2;
                  const bright = hovered === i || hovered === (i + 1) % PROJECTS.length;
                  return (
                    <line
                      key={i}
                      ref={(el) => { lineRefs.current[i] = el; }}
                      className={bright ? undefined : "console-line"}
                      x1={cx + a.baseX}
                      y1={cy + a.baseY}
                      x2={cx + b.baseX}
                      y2={cy + b.baseY}
                      stroke="hsl(var(--accent))"
                      strokeWidth={1}
                      style={{ opacity: bright ? 0.5 : undefined }}
                    />
                  );
                })}
              </svg>

              {PROJECTS.map((p, i) => (
                <div
                  key={p.id}
                  ref={(el) => { outerRefs.current[i] = el; }}
                  className="absolute left-1/2 top-1/2"
                >
                  <button
                    ref={(el) => { innerRefs.current[i] = el; }}
                    type="button"
                    onClick={() => lockOn(i)}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered((h) => (h === i ? null : h))}
                    className="group relative flex items-center justify-center p-3 will-change-transform"
                    aria-label={`Open ${p.title} — ${p.domain}`}
                  >
                    <span
                      className="block h-2.5 w-2.5 rounded-full transition-[background-color,box-shadow] duration-300"
                      style={{
                        backgroundColor: explored.includes(p.id)
                          ? "hsl(var(--accent))"
                          : "hsl(0 0% 100% / 0.55)",
                        boxShadow: hovered === i ? "0 0 0 8px hsl(var(--accent) / 0.12)" : "none",
                        transform: hovered === i ? "scale(1.15)" : "scale(1)",
                      }}
                      aria-hidden
                    />
                    <span
                      className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap text-center transition-opacity duration-300"
                      style={{ opacity: hovered === i ? 1 : 0 }}
                    >
                      <span className="label-mono block text-foreground">{p.title}</span>
                      <span className="mt-1 block font-mono text-[10px] tracking-wide opacity-50">
                        {p.preview}
                      </span>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <DetailView
          project={PROJECTS[selected]}
          index={selected}
          reduced={reduced}
          onClose={closeDetail}
          registerEl={registerDetailEl}
        />
      )}

      <div className="pointer-events-none absolute bottom-2 right-2 z-20 font-mono text-[11px] tracking-wide opacity-60 sm:bottom-4 sm:right-4">
        <span ref={readoutRef} className="inline-block tabular">
          modules explored: {explored.length}/{PROJECTS.length}
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Mobile — a vertical stack. Still nodes and a connecting line, never
 * a bounded box. No magnetic cursor-follow; touch doesn't have a cursor.
 * ------------------------------------------------------------------ */

const MobileStack = ({
  explored,
  onSelect,
  innerRefs,
  outerRefs,
}: {
  explored: string[];
  onSelect: (i: number) => void;
  innerRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
  outerRefs: MutableRefObject<(HTMLDivElement | null)[]>;
}) => (
  <div className="mx-auto flex max-w-md flex-col px-6">
    {PROJECTS.map((p, i) => (
      <div key={p.id} ref={(el) => { outerRefs.current[i] = el; }} className="relative">
        <button
          ref={(el) => { innerRefs.current[i] = el; }}
          type="button"
          onClick={() => onSelect(i)}
          className="flex w-full items-start gap-4 py-5 text-left will-change-transform"
          aria-label={`Open ${p.title} — ${p.domain}`}
        >
          <span
            className="mt-1.5 block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor: explored.includes(p.id) ? "hsl(var(--accent))" : "hsl(0 0% 100% / 0.55)",
            }}
            aria-hidden
          />
          <span>
            <span className="label-mono block text-foreground">{p.title}</span>
            <span className="mt-1 block font-mono text-[11px] tracking-wide opacity-50">{p.preview}</span>
          </span>
        </button>
        {i < PROJECTS.length - 1 && (
          <span
            className="absolute left-[10.5px] top-[calc(1.875rem+0.625rem)] h-5 w-px bg-accent/15"
            aria-hidden
          />
        )}
      </div>
    ))}
  </div>
);
