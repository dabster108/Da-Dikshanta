import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Infinite tech-stack marquee.
 *
 * The list is rendered twice so xPercent: -50 loops seamlessly. Hover eases
 * the timeline's timeScale to 0 (smooth pause, never a hard stop); leaving
 * eases it back to 1. Items sit at half opacity and lift on hover.
 *
 * Text chips, not logos — no licensing questions, and it keeps the
 * single-accent-colour rule intact.
 */

// Drawn from the actual project/timeline stack — nothing listed that isn't
// used somewhere in the shipped work.
const STACK = [
  "Python",
  "PyTorch",
  "Scikit-learn",
  "FastAPI",
  "Pandas",
  "NumPy",
  "Kotlin",
  "Firebase",
  "Java",
  "Gradle",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Tailwind CSS",
  "Git",
];

export const Marquee = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    if (!track) return;
    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 30,
      ease: "none",
      repeat: -1,
    });
    tweenRef.current = tween;
    return () => {
      tween.kill();
      tweenRef.current = null;
    };
  }, [reduced]);

  const pause = () => {
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 0, duration: 0.4 });
  };
  const resume = () => {
    if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 1, duration: 0.4 });
  };

  return (
    <div
      className="edge-fade-x overflow-hidden"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div ref={trackRef} className="flex w-max items-center gap-10 py-2">
        {[...STACK, ...STACK].map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="label-mono whitespace-nowrap opacity-50 transition-all duration-300 ease-expo hover:-translate-y-1 hover:text-accent hover:opacity-100"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
};
