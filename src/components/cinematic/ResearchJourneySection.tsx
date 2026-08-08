import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextReveal } from "@/motion/primitives";
import { EASE } from "@/motion/tokens";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  { id: "curiosity", n: "01", title: "Curiosity", body: "A question that won't go away — usually a gap between what a model can do on a benchmark and what it does in the field." },
  { id: "frame", n: "02", title: "Framing", body: "Turn the question into something measurable. Define the metric, the failure mode, and the baseline before touching a model." },
  { id: "prototype", n: "03", title: "Prototype", body: "Smallest model that could disprove the hypothesis. PyTorch, a notebook, a weekend — the goal is signal, not polish." },
  { id: "evaluate", n: "04", title: "Evaluate", body: "Run it against the real distribution, not the clean one. Look at the failures, not the accuracy." },
  { id: "ship", n: "05", title: "Deploy", body: "Dockerize, serve, monitor. A model that isn't running in production is a hypothesis, not a result." },
];

/**
 * Research Journey — a horizontal pipeline of stages, each revealed via the
 * text-reveal token as it enters the viewport. A connecting line draws
 * left→right across the top of the track as you scroll.
 */
export const ResearchJourneySection = () => {
  const rootRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return;
    const t = gsap.fromTo(
      lineRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: EASE.none,
        scrollTrigger: {
          trigger: el,
          start: "top 70%",
          end: "bottom 60%",
          scrub: true,
        },
      },
    );
    return () => {
      t.scrollTrigger?.kill();
      t.kill();
    };
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="journey"
      className="relative px-6 py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 flex flex-col gap-4">
          <span className="label-mono-accent">02 — Research Journey</span>
          <TextReveal as="h2" className="display-lg text-foreground">
            How an idea becomes a system.
          </TextReveal>
        </div>

        {/* Horizontal pipeline track */}
        <div className="relative">
          <span
            aria-hidden
            className="absolute left-0 top-[14px] h-px w-full origin-left bg-primary/40"
            ref={lineRef}
            style={{ transform: "scaleX(0)" }}
          />
          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {STAGES.map((s) => (
              <li key={s.id} className="relative flex flex-col pt-10">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-[14px] w-[14px] rounded-full border-2 border-primary bg-background"
                />
                <span className="label-mono mb-3">{s.n}</span>
                <TextReveal as="h3" className="display-md text-foreground">
                  {s.title}
                </TextReveal>
                <TextReveal as="p" delay={0.1} className="mt-3 text-sm text-muted-foreground">
                  {s.body}
                </TextReveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
