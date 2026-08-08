import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { RevealText } from "@/components/typography/RevealText";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PROFILE } from "@/data/site";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Approach (§13) — how I think, as an editorial statement rather than a bio.
 *
 * The statement is set large and held while the visitor scrolls through it.
 * Words brighten in reading order, scrubbed to scroll position: the motion
 * is doing something informational — marking where you are in the sentence —
 * rather than decorating it. Scroll back and it un-reads, exactly (§7).
 */

const DISCIPLINES = [
  { word: "Learning", note: "Models that infer the rule instead of being given it" },
  { word: "Vision", note: "Reading an image well enough to decide on it" },
  { word: "Systems", note: "The serving layer, the interface, the failure modes" },
  { word: "Research", note: "The questions each build leaves behind" },
];

export const About = () => {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      const statement = root.querySelector<HTMLElement>("[data-statement]");
      if (!statement) return;

      const split = new SplitText(statement, { type: "words" });

      // Start dim; brighten in reading order across the pinned scroll.
      gsap.set(split.words, { color: "rgb(var(--text-mute))" });
      gsap.to(split.words, {
        color: "rgb(var(--text))",
        ease: "none",
        stagger: 1,
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "70% top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      /* The portrait wipes open, then drifts inside its frame. The image is
         oversized by 12% so the drift never exposes an edge. */
      const portrait = root.querySelector<HTMLElement>("[data-portrait]");
      const portraitImg = root.querySelector<HTMLElement>("[data-portrait-img]");

      if (portrait && portraitImg) {
        gsap.fromTo(
          portrait,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: { trigger: portrait, start: "top 85%", once: true },
          },
        );

        gsap.fromTo(
          portraitImg,
          { yPercent: -3 },
          {
            yPercent: 3,
            ease: "none",
            scrollTrigger: {
              trigger: portrait,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      return () => split.revert();
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      data-chapter="approach"
      id="approach"
      className="relative"
      aria-label="Approach"
    >
      {/* The held statement */}
      <div className="h-[190vh]">
        <div className="sticky top-0 flex h-[100svh] items-center px-gutter">
          <div className="w-full max-w-[26ch]">
            <p className="t-mono mb-10">02 — Approach</p>
            <p data-statement className="t-statement">
              A model that runs on my laptop is not a system. It becomes one
              when someone else can act on what it says — and knows when not
              to.
            </p>
          </div>
        </div>
      </div>

      {/* The four things that turn into, in practice */}
      <div className="px-gutter pb-chapter">
        <ul className="border-t hairline">
          {DISCIPLINES.map((d, i) => (
            <li
              key={d.word}
              className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-b py-8 hairline sm:grid-cols-[6rem_1fr_1.2fr] sm:gap-x-10 sm:py-10"
            >
              <span className="t-mono tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <RevealText
                as="h3"
                className="serif text-[clamp(2rem,5vw,4.25rem)]"
                stagger={0}
              >
                {d.word}
              </RevealText>
              <p className="col-span-2 mt-3 text-[0.95rem] leading-relaxed text-2 sm:col-span-1 sm:mt-0">
                {d.note}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-20 grid gap-12 sm:mt-28 lg:grid-cols-[minmax(15rem,19rem)_1fr] lg:gap-20">
          {/* The portrait, framed like everything else on the page: a
              hairline plate and a mono caption. The photograph is already
              monochrome, so it needs no filter to sit in the palette — and
              a real photograph of a person is the one image here that
              shouldn't be processed. */}
          <figure data-portrait className="m-0">
            <div
              className="relative overflow-hidden border hairline"
              style={{ aspectRatio: "4 / 5", background: "rgb(var(--surface) / 0.5)" }}
            >
              <img
                data-portrait-img
                src={PROFILE.portrait}
                alt={PROFILE.portraitAlt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-[112%] w-full object-cover"
                style={{ top: "-6%" }}
              />
            </div>
            <figcaption className="t-mono mt-4">
              {PROFILE.name} — {PROFILE.location}
            </figcaption>
          </figure>

          <div className="flex flex-col justify-center gap-8 sm:gap-10">
            <RevealText as="p" className="t-body measure">
              I'm finishing a BSc (Hons) in Computing with Artificial
              Intelligence at {PROFILE.institution}, in {PROFILE.location}.
              Three years ago I wrote the first line of code to find out how
              any of it worked. The answer is still not finished.
            </RevealText>
            <RevealText as="p" className="t-body measure">
              What I keep returning to is the gap between a model that scores
              well and a system somebody can rely on. Almost everything
              interesting I've run into lives in that gap — calibration,
              interpretability, where inference should physically run, what a
              system does when it is wrong.
            </RevealText>
          </div>
        </div>
      </div>
    </section>
  );
};
