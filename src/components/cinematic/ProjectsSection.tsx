import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export type Project = {
  id: string;
  index: string;
  title: string;
  tagline: string;
  body: string;
  stack: string[];
  metric?: { label: string; value: string };
};

/**
 * Mechanic 6 — Pinned section swap.
 *
 * The section pins in place for `projects.length * 100%` of scroll. Scroll
 * progress maps to an active project index; projects crossfade with an
 * overlapping 0.4s transition (outgoing 1→0 / scale 1→0.96, incoming 0→1 /
 * scale 1.04→1) so the viewport never goes fully blank.
 *
 * On reduced-motion: pin is disabled, projects stack vertically as plain
 * sections instead of scrubbing.
 */
export const ProjectsSection = ({ projects }: { projects: Project[] }) => {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (reduced) {
      // No pin / scrub — render all projects stacked.
      return;
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=" + projects.length * 100 + "%",
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      onUpdate: (self) => {
        const idx = Math.min(
          projects.length - 1,
          Math.floor(self.progress * projects.length),
        );
        setActive(idx);
      },
    });

    return () => st.kill();
  }, [projects.length, reduced]);

  if (reduced) {
    return (
      <section id="projects" ref={rootRef} className="relative px-6 py-32">
        <div className="mx-auto max-w-5xl space-y-24">
          {projects.map((p) => (
            <article key={p.id} className="border-l border-white/10 pl-8">
              <span className="label-mono-accent">{p.index}</span>
              <h3 className="display-lg mt-3 text-foreground">{p.title}</h3>
              <p className="mt-4 body-lg">{p.body}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <span key={s} className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="projects" ref={rootRef} className="relative h-screen overflow-hidden">
      {/* Progress rail */}
      <div className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        {projects.map((p, i) => (
          <span
            key={p.id}
            className="block h-2 w-2 rounded-full border border-white/20 transition-colors"
            style={{
              background: i === active ? "hsl(214 100% 62%)" : "transparent",
              boxShadow: i === active ? "0 0 12px hsl(214 100% 62%)" : "none",
            }}
          />
        ))}
      </div>

      {/* Index readout */}
      <div className="absolute right-6 top-6 z-20 font-mono text-xs tracking-widest text-muted-foreground">
        {String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
      </div>

      <div ref={trackRef} className="relative h-full w-full">
        <AnimatePresence initial={false}>
          <motion.article
            key={projects[active].id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center"
          >
            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-[1fr_0.8fr] md:items-center">
              <div>
                <span className="label-mono-accent">{projects[active].index}</span>
                <h3 className="display-lg mt-4 text-foreground">
                  {projects[active].title}
                </h3>
                <p className="mt-3 text-base text-primary/80">
                  {projects[active].tagline}
                </p>
                <p className="mt-6 body-lg">{projects[active].body}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {projects[active].stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual panel — abstract per-project motif */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 panel">
                <ProjectVisual id={projects[active].id} />
                {projects[active].metric && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {projects[active].metric.label}
                      </div>
                      <div className="display-md text-foreground">
                        {projects[active].metric.value}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
};

/** Simple per-project abstract visual — pure SVG, no images needed. */
const ProjectVisual = ({ id }: { id: string }) => {
  if (id === "cv") {
    return (
      <svg viewBox="0 0 400 400" className="h-full w-full">
        <g stroke="hsl(214 100% 62% / 0.6)" strokeWidth="1.5" fill="none">
          <rect x="60" y="80" width="120" height="90" />
          <rect x="220" y="160" width="110" height="70" />
          <rect x="100" y="240" width="80" height="60" />
        </g>
        <g fill="hsl(214 100% 62% / 0.15)" stroke="hsl(214 100% 62%)" strokeWidth="1">
          <rect x="60" y="80" width="120" height="90" />
          <rect x="220" y="160" width="110" height="70" />
          <rect x="100" y="240" width="80" height="60" />
        </g>
        <g fontFamily="monospace" fontSize="10" fill="hsl(214 100% 74%)">
          <text x="64" y="74">person 0.94</text>
          <text x="224" y="154">vehicle 0.88</text>
          <text x="104" y="234">sign 0.79</text>
        </g>
      </svg>
    );
  }
  if (id === "vr") {
    return (
      <svg viewBox="0 0 400 400" className="h-full w-full">
        <g stroke="hsl(214 100% 62% / 0.5)" strokeWidth="1" fill="none">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={50 + i * 12} y={50 + i * 12} width={300 - i * 24} height={300 - i * 24} />
          ))}
        </g>
        <circle cx="200" cy="200" r="6" fill="hsl(214 100% 74%)" />
      </svg>
    );
  }
  if (id === "crypto") {
    return (
      <svg viewBox="0 0 400 400" className="h-full w-full">
        <g fontFamily="monospace" fontSize="14" fill="hsl(214 100% 74%)">
          <text x="40" y="80">0x4F2A...</text>
          <text x="40" y="120">0x9C1B...</text>
          <text x="40" y="160">0x3E7D...</text>
          <text x="40" y="200">0xA8F4...</text>
        </g>
        <g stroke="hsl(214 100% 62% / 0.4)" strokeWidth="1" fill="none">
          <line x1="40" y1="240" x2="360" y2="240" />
          <line x1="40" y1="280" x2="360" y2="280" />
          <line x1="40" y1="320" x2="360" y2="320" />
        </g>
        <g fontFamily="monospace" fontSize="14" fill="hsl(210 16% 60%)">
          <text x="40" y="260">a5f3c9... → 7b2e01...</text>
          <text x="40" y="300">d1e8f4... → 0c4a77...</text>
        </g>
      </svg>
    );
  }
  if (id === "fraud") {
    return (
      <svg viewBox="0 0 400 400" className="h-full w-full">
        <g>
          {Array.from({ length: 40 }).map((_, i) => {
            const ok = Math.random() > 0.18;
            return (
              <circle
                key={i}
                cx={20 + (i % 8) * 48 + Math.random() * 20}
                cy={20 + Math.floor(i / 8) * 48 + Math.random() * 20}
                r="4"
                fill={ok ? "hsl(214 100% 62% / 0.5)" : "hsl(0 80% 60%)"}
              />
            );
          })}
        </g>
      </svg>
    );
  }
  if (id === "agents") {
    return (
      <svg viewBox="0 0 400 400" className="h-full w-full">
        <g stroke="hsl(214 100% 62% / 0.6)" strokeWidth="1.5">
          <line x1="200" y1="80" x2="120" y2="280" />
          <line x1="200" y1="80" x2="280" y2="280" />
          <line x1="120" y1="280" x2="280" y2="280" />
          <line x1="120" y1="280" x2="200" y2="340" />
          <line x1="280" y1="280" x2="200" y2="340" />
        </g>
        <g fill="hsl(214 100% 62%)">
          <circle cx="200" cy="80" r="14" />
          <circle cx="120" cy="280" r="14" />
          <circle cx="280" cy="280" r="14" />
          <circle cx="200" cy="340" r="10" />
        </g>
        <g fontFamily="monospace" fontSize="10" fill="hsl(214 100% 74%)">
          <text x="210" y="84">planner</text>
          <text x="130" y="284">vision</text>
          <text x="290" y="284">action</text>
          <text x="210" y="344">tool</text>
        </g>
      </svg>
    );
  }
  // portfolio
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <g stroke="hsl(214 100% 62% / 0.5)" strokeWidth="1" fill="none">
        <rect x="40" y="40" width="320" height="320" />
        <line x1="40" y1="200" x2="360" y2="200" />
        <line x1="200" y1="40" x2="200" y2="360" />
        <rect x="60" y="60" width="120" height="120" />
        <rect x="220" y="220" width="120" height="120" />
      </g>
      <g fill="hsl(214 100% 74%)">
        <circle cx="120" cy="120" r="4" />
        <circle cx="280" cy="280" r="4" />
      </g>
    </svg>
  );
};
