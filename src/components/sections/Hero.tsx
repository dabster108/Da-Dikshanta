import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PROFILE } from "@/data/site";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Opening (§9).
 *
 * The frame starts nearly empty: a coordinate, a status line, and a lot of
 * ground. The statement arrives a beat later, and the supporting information
 * only appears once the visitor has started to scroll — nothing is delivered
 * all at once.
 *
 * A tall section with a sticky inner frame rather than a hard pin (§8). The
 * scroll is never taken away from the visitor; the composition simply holds
 * while the camera moves behind it.
 */

const DISCIPLINES = [
  "Machine learning",
  "Computer vision",
  "Software systems",
  "Research",
];

export const Hero = ({ ready }: { ready: boolean }) => {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const meta = root.querySelectorAll("[data-hero-meta]");
      const lines = root.querySelectorAll<HTMLElement>("[data-hero-line]");
      const later = root.querySelectorAll("[data-hero-later]");

      if (reduced) {
        gsap.fromTo(
          [...meta, ...lines, ...later],
          { opacity: 0 },
          { opacity: 1, duration: 0.5, stagger: 0.06 },
        );
        return;
      }

      /* --- Entrance. Sequenced, not simultaneous (§54). ----------------- */
      const splits = [...lines].map(
        (l) => new SplitText(l, { type: "chars", mask: "chars" }),
      );

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.from(meta, { opacity: 0, y: 10, duration: 0.9, stagger: 0.12 })
        .from(
          splits.flatMap((s) => s.chars),
          {
            yPercent: 118,
            duration: 1.25,
            // Characters, but gently — 18ms apart reads as one wave rather
            // than as letters arriving individually (§31).
            stagger: 0.018,
          },
          "-=0.45",
        )
        .from(later, { opacity: 0, y: 14, duration: 1, stagger: 0.09 }, "-=0.7");

      /* --- Scroll. The statement recedes as the camera pushes past it. -- */
      gsap.to("[data-hero-frame]", {
        yPercent: -12,
        opacity: 0,
        filter: "blur(6px)",
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "65% top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // The cue is only useful before the visitor has scrolled.
      gsap.to("[data-hero-cue]", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "12% top", scrub: true },
      });

      return () => splits.forEach((s) => s.revert());
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section
      ref={rootRef}
      data-chapter="opening"
      id="opening"
      className="relative h-[210vh]"
      aria-label="Opening"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between px-gutter py-24 sm:py-28">
        {/* Instrument readout. Real coordinates, not decoration. */}
        <div className="flex items-start justify-between">
          <p data-hero-meta className="t-mono">
            27.7799° N &nbsp; 85.3620° E
          </p>
          <p data-hero-meta className="t-mono text-right">
            <span className="t-mono-lime">●</span> &nbsp;Available 2026
          </p>
        </div>

        {/* The statement.
            No `ch` max-width on this wrapper: `ch` resolves against the
            wrapper's own font size, not the h1's, so a 22ch cap here is
            ~190px on a phone and breaks "intelligent" across two lines. The
            headline is allowed the full column; only the standfirst below it
            is measured, where `ch` and the text size actually agree. */}
        <div data-hero-frame className="will-change-transform">
          <h1 className="t-hero max-w-[13ch]">
            <span data-hero-line className="block">
              I build
            </span>
            <span data-hero-line className="serif block" style={{ fontSize: "1.06em" }}>
              intelligent systems.
            </span>
          </h1>

          <p
            data-hero-later
            className="t-body measure mt-8 sm:mt-10"
            style={{ maxWidth: "44ch" }}
          >
            Models taken past the notebook — given a serving layer, an
            interface, and a way to say when they are unsure.
          </p>
        </div>

        {/* Supporting information, last */}
        <div className="flex items-end justify-between gap-6">
          <ul data-hero-later className="flex flex-wrap gap-x-6 gap-y-1.5">
            {DISCIPLINES.map((d) => (
              <li key={d} className="t-mono">
                {d}
              </li>
            ))}
          </ul>

          <div data-hero-cue className="hidden shrink-0 text-right sm:block">
            <p className="t-mono">Scroll</p>
            <div
              className="ml-auto mt-2 h-8 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, rgb(var(--lime)), transparent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Screen readers get the identity that the visual opening withholds. */}
      <span className="sr-only">
        {PROFILE.name} — {PROFILE.role}, {PROFILE.location}.
      </span>
    </section>
  );
};
