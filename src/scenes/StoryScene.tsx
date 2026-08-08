import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TIMELINE } from "@/data/timeline";
import { RevealText, RevealBlock } from "@/components/Reveal";
import { StatCounters } from "@/components/StatCounters";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Story — the about, told as a sequence of states instead of a paragraph.
 *
 * The journey is laid out as a vertical spine: each milestone is a beat that
 * rises into view, with a thin signal curve climbing beside it (how much of
 * my time that phase was spent on intelligent systems). The whole thing
 * reads as one continuous ascent from curiosity to graduation.
 *
 * No cards. No timeline boxes. Just typography, a hairline, and motion.
 */
export const StoryScene = () => {
  const rootRef = useRef<HTMLElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // The signal curve climbs as the visitor scrolls through the milestones.
  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const spine = spineRef.current;
    if (!root || !spine) return;

    const ctx = gsap.context(() => {
      gsap.to(spine, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top 70%",
          end: "bottom 80%",
          scrub: 0.6,
        },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="story"
      className="relative px-6 py-32 sm:px-10 sm:py-48"
      data-scene="story"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section opener — quiet, no harsh break from the previous scene. */}
        <div className="mb-24 flex items-baseline justify-between">
          <RevealText
            as="h2"
            className="display-lg"
            stagger={0.05}
          >
            The path here
          </RevealText>
          <RevealBlock as="span" className="label-mono" delay={0.2}>
            02 — Story
          </RevealBlock>
        </div>

        {/* The spine + milestones. */}
        <div className="relative">
          {/* Vertical hairline that grows as you scroll. */}
          <div
            className="absolute left-[7px] top-0 h-full w-px origin-top bg-gradient-to-b from-accent/50 via-accent/20 to-transparent"
            style={{ transform: "scaleY(0)" }}
            ref={spineRef}
            aria-hidden
          />

          <ol className="space-y-24 sm:space-y-32">
            {TIMELINE.map((m, i) => (
              <li
                key={m.id}
                className="relative pl-12 sm:pl-16"
              >
                {/* Node on the spine. */}
                <span
                  className="absolute left-0 top-2 flex h-4 w-4 items-center justify-center"
                  aria-hidden
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_4px_hsl(var(--accent)/0.12)]" />
                </span>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
                  <RevealBlock as="span" className="label-mono" delay={0.05}>
                    {m.period}
                  </RevealBlock>
                  <RevealBlock as="span" className="label-mono-accent label-mono" delay={0.1}>
                    signal {Math.round(m.signal * 100)}%
                  </RevealBlock>
                </div>

                <RevealText
                  as="h3"
                  className="display-md mt-3"
                  stagger={0.04}
                  delay={0.05}
                >
                  {m.title}
                </RevealText>

                <RevealBlock as="p" className="body-lg mt-4 max-w-2xl" delay={0.15}>
                  {m.summary}
                </RevealBlock>

                <RevealBlock as="p" className="body-md mt-3 max-w-2xl text-foreground-mute" delay={0.25}>
                  {m.detail}
                </RevealBlock>

                {/* Markers as a quiet inline row. */}
                <RevealBlock delay={0.35} className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {m.markers.map((mk) => (
                    <span key={mk} className="label-mono opacity-70">
                      {mk}
                    </span>
                  ))}
                </RevealBlock>

                {/* Last milestone carries the graduation beat. */}
                {i === TIMELINE.length - 1 && (
                  <RevealBlock delay={0.5} className="mt-6">
                    <span className="label-mono-accent label-mono">
                      Graduating {TIMELINE[i].period} — {TIMELINE[i].title}
                    </span>
                  </RevealBlock>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* The journey, in numbers — all derived from real site data. */}
        <div className="mt-32 sm:mt-40">
          <StatCounters />
        </div>
      </div>
    </section>
  );
};
