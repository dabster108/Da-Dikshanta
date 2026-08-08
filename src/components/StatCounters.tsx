import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS } from "@/data/projects";
import { DISCIPLINES } from "@/data/site";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Animated stat counters.
 *
 * Every number here is derived from real site data — projects shipped comes
 * from PROJECTS.length, disciplines from DISCIPLINES.length, years from the
 * timeline (first code 2023 → graduation 2026). No invented metrics.
 *
 * Count-up fires once at "top 80%", snapped to integers, with a thin
 * underline bar that draws left→right on the same 1.6s clock so the number
 * and the bar finish together.
 */

const STATS = [
  { value: PROJECTS.length, suffix: "", label: "Systems shipped" },
  { value: 3, suffix: "+", label: "Years of building" },
  { value: DISCIPLINES.length, suffix: "", label: "Disciplines practised" },
];

export const StatCounters = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const numbers = Array.from(root.querySelectorAll<HTMLElement>("[data-stat-value]"));
    const bars = Array.from(root.querySelectorAll<HTMLElement>("[data-stat-bar]"));

    if (reduced) {
      numbers.forEach((el) => (el.textContent = el.dataset.statValue ?? ""));
      gsap.set(bars, { scaleX: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      numbers.forEach((el) => {
        const target = Number(el.dataset.statValue ?? 0);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: "power3.out",
          snap: { val: 1 },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val));
          },
          scrollTrigger: {
            trigger: root,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      });
      gsap.fromTo(
        bars,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6"
    >
      {STATS.map((s) => (
        <div key={s.label} className="flex flex-col gap-3">
          <span className="display-lg tabular">
            <span data-stat-value={s.value}>0</span>
            {s.suffix}
          </span>
          <div className="h-px w-full bg-white/10">
            <div
              data-stat-bar
              className="h-full origin-left bg-accent"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <span className="label-mono">{s.label}</span>
        </div>
      ))}
    </div>
  );
};
