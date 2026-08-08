import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextReveal } from "@/motion/primitives";
import { EASE } from "@/motion/tokens";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Mechanic 4 — Layered parallax.
 *
 * Three flat layers move at different vertical rates over the section's
 * scroll distance, all driven by ONE ScrollTrigger (scrub) with each layer's
 * yPercent set via a separate gsap.to sharing that same scrollTrigger config.
 *
 *  - background grid:        yPercent 20  (slowest, farthest)
 *  - floating node clusters: yPercent 45  (mid)
 *  - foreground portrait:   yPercent 70  (fastest, closest)
 *
 * Portrait also transitions grayscale → color → AI overlay (detection boxes +
 * scanlines) as it enters the viewport.
 */
export const AboutSection = () => {
  const rootRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = rootRef.current;
    if (!section || reduced) return;

    const stConfig = {
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true as const,
    };

    const t1 = gsap.to(bgRef.current, { yPercent: 20, ease: EASE.none, scrollTrigger: stConfig });
    const t2 = gsap.to(midRef.current, { yPercent: 45, ease: EASE.none, scrollTrigger: stConfig });
    const t3 = gsap.to(fgRef.current, { yPercent: 70, ease: EASE.none, scrollTrigger: stConfig });

    // Portrait grayscale → color as it enters, then AI overlay fades in.
    const t4 = gsap.fromTo(
      portraitRef.current,
      { filter: "grayscale(100%)" },
      {
        filter: "grayscale(0%)",
        duration: 1.2,
        ease: EASE.power3Out,
        scrollTrigger: { trigger: section, start: "top 60%", once: true },
      },
    );
    const t5 = gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.0,
        ease: EASE.power2Out,
        delay: 0.4,
        scrollTrigger: { trigger: section, start: "top 50%", once: true },
      },
    );

    return () => {
      [t1, t2, t3, t4, t5].forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="about"
      className="relative min-h-screen overflow-hidden px-6 py-32"
    >
      {/* Background layer — slow grid */}
      <div
        ref={bgRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(hsl(214 100% 62% / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(214 100% 62% / 0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(80% 70% at 50% 40%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(80% 70% at 50% 40%, black, transparent 75%)",
        }}
      />

      {/* Mid layer — floating node clusters */}
      <div ref={midRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <FloatingCluster className="left-[8%] top-[20%]" />
        <FloatingCluster className="right-[10%] top-[35%]" delay={0.4} />
        <FloatingCluster className="left-[18%] bottom-[15%]" delay={0.8} />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <span className="label-mono-accent mb-6 block">01 — About</span>
          <TextReveal as="h2" className="display-lg text-foreground">
            Research that ships, not just demos.
          </TextReveal>
          <div className="mt-8 space-y-5 body-lg">
            <TextReveal as="p" delay={0.1}>
              My work sits at the seam between research and production. I prototype
              in PyTorch and TensorFlow, evaluate against real benchmarks, then
              carry the model all the way to a deployed system — Dockerized,
              monitored, and held to a latency budget.
            </TextReveal>
            <TextReveal as="p" delay={0.2}>
              The throughline is perception and decision-making: computer vision
              pipelines that run on edge hardware, robotic stacks that have to be
              correct under uncertainty, and multi-agent systems where the
              interesting behaviour emerges from the protocol, not any single node.
            </TextReveal>
          </div>
        </div>

        {/* Foreground layer — portrait with AI overlay */}
        <div ref={fgRef} className="relative mx-auto aspect-[3/4] w-full max-w-sm">
          <div
            ref={portraitRef}
            className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10"
            style={{
              background:
                "linear-gradient(160deg, hsl(220 30% 14%) 0%, hsl(220 40% 8%) 60%, hsl(214 60% 18%) 100%)",
            }}
          >
            {/* Stylized portrait silhouette placeholder */}
            <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full">
              <defs>
                <radialGradient id="portraitGlow" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="hsl(214 100% 74%)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <rect width="300" height="400" fill="url(#portraitGlow)" />
              <g fill="hsl(210 20% 30%)">
                <ellipse cx="150" cy="150" rx="62" ry="74" />
                <path d="M70 400 C70 290 110 240 150 240 C190 240 230 290 230 400 Z" />
              </g>
            </svg>

            {/* AI overlay — detection boxes + scanlines, fades in on scroll */}
            <div
              ref={overlayRef}
              className="absolute inset-0"
              style={{ opacity: 0 }}
            >
              <div className="absolute left-[18%] top-[22%] h-[40%] w-[64%] border border-primary/70">
                <span className="absolute -top-5 left-0 font-mono text-[10px] tracking-widest text-primary">
                  PERSON · 0.97
                </span>
                <span className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-primary" />
                <span className="absolute -top-px -left-px h-2 w-2 border-t border-l border-primary" />
              </div>
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent 0 3px, hsl(214 100% 62% / 0.4) 3px 4px)",
                }}
              />
              <div className="absolute bottom-3 left-3 font-mono text-[9px] tracking-widest text-primary/80">
                ID:0x4F · TRACKING
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FloatingCluster = ({ className, delay = 0 }: { className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      y: -18,
      duration: 4 + delay,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }, [delay]);
  return (
    <div ref={ref} className={`absolute ${className}`}>
      <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-60">
        <g stroke="hsl(214 100% 62% / 0.5)" strokeWidth="1">
          <line x1="20" y1="20" x2="60" y2="40" />
          <line x1="60" y1="40" x2="100" y2="30" />
          <line x1="60" y1="40" x2="50" y2="90" />
          <line x1="20" y1="20" x2="40" y2="80" />
        </g>
        <g fill="hsl(214 100% 74%)">
          <circle cx="20" cy="20" r="3" />
          <circle cx="60" cy="40" r="3.5" />
          <circle cx="100" cy="30" r="3" />
          <circle cx="50" cy="90" r="3" />
          <circle cx="40" cy="80" r="2.5" />
        </g>
      </svg>
    </div>
  );
};
