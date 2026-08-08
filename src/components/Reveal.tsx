import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Split a string into per-word spans wrapped in a mask, then rise them into
 * view on scroll. Apple-keynote pacing: slow, soft, staggered, never bouncy.
 *
 * Usage:
 *   <RevealText as="h1" className="display-xl">Building Intelligent Systems</RevealText>
 */
export const RevealText = ({
  children,
  as,
  className,
  stagger = 0.08,
  delay = 0,
  y = "110%",
  duration = 1.1,
  start = "top 85%",
}: {
  children: string;
  as?: ElementType;
  className?: string;
  stagger?: number;
  delay?: number;
  y?: string;
  duration?: number;
  start?: string;
}) => {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>(".rt-word > span");
    if (reduced) {
      gsap.set(targets, { y: "0%", opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.set(targets, { yPercent: 110, opacity: 0 });
      gsap.to(targets, {
        yPercent: 0,
        opacity: 1,
        duration,
        ease: "expo.out",
        stagger,
        delay,
        scrollTrigger: { trigger: el, start },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced, stagger, delay, duration, start]);

  const words = children.split(" ");

  // background-clip:text breaks when the clipped element has transformed
  // children (Chrome paints them on separate layers and the gradient never
  // reaches them — the text goes invisible because color is transparent).
  // So the gradient class moves off the container onto the innermost span,
  // which clips against its own text and always renders.
  const hasFade = className?.includes("text-fade-b") ?? false;
  const tagClassName = hasFade
    ? className!.replace("text-fade-b", "").trim()
    : className;

  return (
    <Tag ref={ref} className={tagClassName} aria-label={children}>
      {words.map((w, i) => (
        <span key={i} aria-hidden>
          <span className="rt-word mask-rise">
            <span className={hasFade ? "text-fade-b" : undefined}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
};

/**
 * Fade + soft upward motion for paragraphs and supporting text.
 */
export const RevealBlock = ({
  children,
  as,
  className,
  delay = 0,
  y = 24,
  duration = 1.0,
  start = "top 88%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  start?: string;
}) => {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          ease: "expo.out",
          delay,
          scrollTrigger: { trigger: el, start },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced, delay, y, duration, start]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
};

/**
 * Blur-to-sharp reveal for large display type. Pairs well with RevealText
 * (use one or the other, not both on the same node).
 */
export const RevealBlur = ({
  children,
  as,
  className,
  delay = 0,
  duration = 1.4,
  start = "top 85%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  start?: string;
}) => {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      gsap.set(el, { opacity: 1, filter: "blur(0px)" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, filter: "blur(14px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration,
          ease: "expo.out",
          delay,
          scrollTrigger: { trigger: el, start },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced, delay, duration, start]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
};
