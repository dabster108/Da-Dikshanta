import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { TIMELINE } from "@/data/timeline";
import { RevealText } from "@/components/typography/RevealText";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/**
 * Timeline (§25, §39) — the one horizontal moment on the page.
 *
 * Vertical scroll drives horizontal travel. This is the only place that
 * happens, which is what makes it land; a site that goes sideways three
 * times has just made scrolling unpredictable.
 *
 * Behind the panels is the signal curve from `timeline.ts` — how much of each
 * phase went into intelligent systems rather than general software. It draws
 * itself as the track moves, so the shape of the story is legible before any
 * of the text is read.
 *
 * Below 768px the whole mechanism is replaced with a vertical list rather
 * than scaled down (§44): horizontal scroll inside a touch scroll is a fight
 * the visitor always loses.
 */

export const Timeline = () => {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const mm = gsap.matchMedia();

    // Desktop and tablet: the horizontal moment.
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.from("[data-signal-path]", {
          drawSVG: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      }, root);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  const points = TIMELINE.map((m, i) => {
    const x = (i / (TIMELINE.length - 1)) * 100;
    const y = 100 - m.signal * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <section
      ref={rootRef}
      data-chapter="timeline"
      id="timeline"
      className="relative overflow-hidden"
      aria-label="Timeline"
    >
      <div className="px-gutter pt-chapter">
        <p className="t-mono">07 — Timeline</p>
        <RevealText as="h2" className="t-chapter mt-8 max-w-[15ch]">
          <span className="block">Three years,</span>
          <span className="serif block" style={{ fontSize: "1.08em" }}>
            in order.
          </span>
        </RevealText>
      </div>

      {/* Track. On mobile this is a plain vertical list. */}
      <div
        ref={trackRef}
        className="mt-16 flex flex-col gap-16 px-gutter pb-chapter md:mt-24 md:h-[62vh] md:flex-row md:items-stretch md:gap-0 md:pb-0"
      >
        {/* Signal curve, desktop only — it needs the horizontal axis to mean
            anything, and on mobile the list order already carries it. */}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-[18%] hidden h-[38%] w-full md:block"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ width: `${TIMELINE.length * 62}vw` }}
        >
          <polyline
            data-signal-path
            points={points}
            fill="none"
            stroke="rgb(var(--lime) / 0.45)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {TIMELINE.map((m, i) => (
          <article
            key={m.id}
            className="relative flex shrink-0 flex-col justify-between border-t pt-8 md:w-[62vw] md:border-l md:border-t-0 md:pl-10 md:pr-16 md:pt-0 hairline lg:w-[48vw]"
          >
            <div>
              <div className="flex items-baseline gap-5">
                <span className="t-mono t-mono-lime tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="t-mono">{m.period}</span>
              </div>

              <h3
                className="serif mt-6 leading-[0.95]"
                style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}
              >
                {m.title}
              </h3>

              <p className="t-statement mt-6 max-w-[22ch]" style={{ fontSize: "clamp(1.1rem,1.9vw,1.6rem)" }}>
                {m.summary}
              </p>

              <p className="t-body measure mt-6 max-w-[38ch]">{m.detail}</p>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-2 gap-y-2">
              {m.markers.map((mk) => (
                <li
                  key={mk}
                  className="rounded-pill border px-3 py-1 text-[0.8rem] text-mute hairline"
                >
                  {mk}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};
