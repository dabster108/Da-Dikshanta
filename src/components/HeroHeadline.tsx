import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Hero name cascade — plays once when `ready` flips true (after the
 * preloader lifts), never on ScrollTrigger. ScrollTrigger + a hero that's
 * already in view is why the big headline was staying invisible.
 *
 * Title words rise through mask clips with overlapping 80ms starts and a
 * soft blur-in. Subtitle lines follow. An accent underline draws last.
 */
const TITLE = "Building Intelligent Systems";
const SUB = "Through software, artificial intelligence, and research.";

export const HeroHeadline = ({ ready }: { ready: boolean }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ready || !rootRef.current) return;

    const root = rootRef.current;
    const titleWords = Array.from(root.querySelectorAll<HTMLElement>(".hero-title-inner"));
    const subLines = Array.from(root.querySelectorAll<HTMLElement>(".hero-sub-inner"));
    const underline = underlineRef.current;

    if (reduced) {
      gsap.set([...titleWords, ...subLines], { y: "0%", opacity: 1, filter: "blur(0px)" });
      if (underline) gsap.set(underline, { scaleX: 1 });
      return;
    }

    gsap.set(titleWords, { y: "110%", opacity: 0, filter: "blur(14px)" });
    gsap.set(subLines, { y: "110%", opacity: 0 });
    if (underline) gsap.set(underline, { scaleX: 0 });

    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    titleWords.forEach((word, i) => {
      tl.to(
        word,
        { y: "0%", opacity: 1, filter: "blur(0px)", duration: 1.1 },
        i * 0.08,
      );
    });

    subLines.forEach((line, i) => {
      tl.to(line, { y: "0%", opacity: 1, duration: 0.9 }, 0.35 + i * 0.08);
    });

    if (underline) {
      tl.to(underline, { scaleX: 1, duration: 0.6, ease: "power2.out" }, "-=0.15");
    }

    return () => {
      tl.kill();
    };
  }, [ready, reduced]);

  const titleWords = TITLE.split(" ");

  return (
    <div ref={rootRef}>
      <h1 className="display-2xl text-foreground">
        {titleWords.map((word, i) => (
          <span key={word} className="mr-[0.25em] inline-block align-bottom last:mr-0">
            <span className="hero-line inline-block overflow-hidden">
              <span className="hero-title-inner inline-block will-change-transform">{word}</span>
            </span>
          </span>
        ))}
      </h1>

      <div className="mt-8 max-w-xl">
        <h2 className="display-md text-foreground-soft">
          <span className="hero-line block overflow-hidden">
            <span className="hero-sub-inner inline-block will-change-transform">{SUB}</span>
          </span>
        </h2>
      </div>

      <div
        ref={underlineRef}
        className="mt-6 h-px w-24 origin-left bg-accent"
        style={{ transform: "scaleX(0)" }}
        aria-hidden
      />
    </div>
  );
};
