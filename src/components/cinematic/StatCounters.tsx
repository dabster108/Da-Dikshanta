import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE } from "@/motion/tokens";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export type Stat = {
  /** Pre-formatted target string, e.g. "12", "98.2", "240". */
  value: number;
  /** Decimals to display. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** One-line label below the number. */
  label: string;
  /** Inline source note — keep every number real and sourced. */
  source?: string;
};

/**
 * Mechanic 2 — Animated stat counters.
 *
 * Fires once when the row enters the viewport (start: "top 80%"). Each number
 * counts up over 1.6s (power3.out, snapped to integers or to `decimals`) and a
 * thin underline bar draws left→right in lockstep so the number and bar finish
 * together.
 *
 * On reduced-motion: numbers render at their final value, no count-up, no bar
 * animation.
 */
export const StatCounters = ({ stats }: { stats: Stat[] }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const numEls = root.querySelectorAll<HTMLElement>("[data-num]");
    const barEls = root.querySelectorAll<HTMLElement>("[data-bar]");

    if (reduced) {
      numEls.forEach((el) => {
        el.textContent = format(el);
      });
      barEls.forEach((el) => {
        el.style.transform = "scaleX(1)";
      });
      return;
    }

    const counters = Array.from(numEls).map((el) => ({
      el,
      obj: { v: 0 },
      target: Number(el.dataset.target ?? "0"),
      decimals: Number(el.dataset.decimals ?? "0"),
      prefix: el.dataset.prefix ?? "",
      suffix: el.dataset.suffix ?? "",
    }));

    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: "top 80%", once: true },
    });

    counters.forEach((c) => {
      tl.to(
        c.obj,
        {
          v: c.target,
          duration: 1.6,
          ease: EASE.power3Out,
          snap: c.decimals > 0 ? undefined : { v: 1 },
          onUpdate: () => {
            c.el.textContent =
              c.prefix + c.obj.v.toFixed(c.decimals) + c.suffix;
          },
        },
        0,
      );
    });

    barEls.forEach((el) => {
      tl.fromTo(
        el,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.6, ease: EASE.power3Out },
        0,
      );
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4"
    >
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span
              data-num
              data-target={s.value}
              data-decimals={s.decimals ?? 0}
              data-prefix={s.prefix ?? ""}
              data-suffix={s.suffix ?? ""}
              className="display-md tabular text-foreground"
            >
              {s.prefix ?? ""}
              {(0).toFixed(s.decimals ?? 0)}
              {s.suffix ?? ""}
            </span>
          </div>
          {/* Underline bar — draws left→right in lockstep with the count-up. */}
          <span
            aria-hidden
            className="mt-3 h-px w-full origin-left bg-primary/70"
            data-bar
            style={{ transform: "scaleX(0)" }}
          />
          <span className="mt-3 text-sm text-muted-foreground">{s.label}</span>
          {s.source && (
            <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              {s.source}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const format = (el: HTMLElement) => {
  const target = Number(el.dataset.target ?? "0");
  const decimals = Number(el.dataset.decimals ?? "0");
  const prefix = el.dataset.prefix ?? "";
  const suffix = el.dataset.suffix ?? "";
  return prefix + target.toFixed(decimals) + suffix;
};
