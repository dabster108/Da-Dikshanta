import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * The default entrance for text (§31).
 *
 * Lines are split and wiped up from behind a mask, staggered. Characters are
 * only ever animated where the brief asks for it — the hero — because
 * per-character motion on a paragraph is noise, not hierarchy.
 *
 * Under reduced motion the split never happens: the text renders as plain
 * markup and fades in. That matters for screen readers too — SplitText
 * rewrites the DOM into per-line spans, and skipping it entirely is the
 * cleanest accessible path.
 */

type Split = "lines" | "words" | "chars";

interface Props {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
  split?: Split;
  /** Seconds between each line/word/char. */
  stagger?: number;
  /** Delay before the entrance, in seconds. */
  delay?: number;
  /** Scroll position that fires it. */
  start?: string;
  /** Play immediately on mount instead of waiting for scroll. */
  immediate?: boolean;
}

export const RevealText = ({
  children,
  as: Tag = "div",
  className = "",
  style,
  id,
  split = "lines",
  stagger = 0.08,
  delay = 0,
  start = "top 82%",
  immediate = false,
}: Props) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          delay,
          ...(immediate
            ? {}
            : { scrollTrigger: { trigger: el, start, once: true } }),
        },
      );
      return;
    }

    const ctx = gsap.context(() => {
      let splitter: SplitText | null = null;

      const build = () => {
        splitter?.revert();
        splitter = new SplitText(el, {
          type: split,
          // A masked wipe needs a wrapper per unit to clip against.
          mask: split === "chars" ? "chars" : split === "words" ? "words" : "lines",
          linesClass: "reveal-line-inner",
        });

        const targets =
          split === "chars" ? splitter.chars : split === "words" ? splitter.words : splitter.lines;

        gsap.set(targets, { yPercent: 115, opacity: 0 });

        gsap.to(targets, {
          yPercent: 0,
          opacity: 1,
          duration: split === "chars" ? 0.75 : 1.0,
          ease: "expo.out",
          stagger,
          delay,
          ...(immediate
            ? {}
            : {
                scrollTrigger: {
                  trigger: el,
                  start,
                  once: true,
                  invalidateOnRefresh: true,
                },
              }),
        });
      };

      build();

      // Re-split on width change only — a mobile URL bar collapsing changes
      // height constantly and must not retrigger a reflow of every line.
      let lastWidth = window.innerWidth;
      const onResize = () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        build();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        splitter?.revert();
      };
    }, ref);

    return () => ctx.revert();
  }, [reduced, split, stagger, delay, start, immediate]);

  return (
    <Tag ref={ref} id={id} className={className} style={style}>
      {children}
    </Tag>
  );
};
