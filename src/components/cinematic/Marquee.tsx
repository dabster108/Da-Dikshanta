import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Mechanic 5 — Infinite marquee.
 *
 * The list is duplicated once so it can loop seamlessly; the track animates
 * xPercent: -50 linearly over 30s, repeating forever. On container mouseenter
 * the timeline's timeScale eases to 0 (smooth pause, not a hard stop). Each
 * icon defaults to grayscale(100%) opacity(0.5); hovering one lifts it and
 * restores full colour over 0.25s.
 *
 * On reduced-motion: static, no animation.
 */
export const Marquee = ({ items }: { items: string[] }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (reduced || !trackRef.current) return;
    const tl = gsap.to(trackRef.current, {
      xPercent: -50,
      duration: 30,
      ease: "none",
      repeat: -1,
    });
    tlRef.current = tl;

    const container = containerRef.current!;
    const onEnter = () => gsap.to(tl, { timeScale: 0, duration: 0.4 });
    const onLeave = () => gsap.to(tl, { timeScale: 1, duration: 0.4 });
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    return () => {
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      tl.kill();
    };
  }, [reduced]);

  const doubled = [...items, ...items];

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden edge-fade-x"
    >
      <div ref={trackRef} className="flex w-max gap-12 will-change-transform">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-mono text-sm uppercase tracking-widest text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:text-foreground"
            style={{
              filter: reduced ? "none" : "grayscale(100%) opacity(0.5)",
              opacity: reduced ? 0.7 : undefined,
            }}
            onMouseEnter={(e) => {
              if (reduced) return;
              (e.currentTarget as HTMLElement).style.filter = "grayscale(0%) opacity(1)";
            }}
            onMouseLeave={(e) => {
              if (reduced) return;
              (e.currentTarget as HTMLElement).style.filter = "grayscale(100%) opacity(0.5)";
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
