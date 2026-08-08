import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Architecture } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

/**
 * Animated system diagram (§22).
 *
 * The stages are the project's real data path, so watching a packet travel
 * through teaches the system rather than decorating it. The packet is
 * scrubbed to scroll position — scrolling *is* the data moving — which also
 * means it reverses exactly when the visitor scrolls back up (§7).
 *
 * Layout maths instead of DOM measurement: with N equal columns, the centre
 * of column i sits at ((i + 0.5) / N) of the track. That makes the whole
 * thing responsive with no resize observer and no re-measure on refresh.
 */

export const ProjectArchitecture = ({
  architecture,
  accentColor = "rgb(var(--lime))",
}: {
  architecture: Architecture;
  accentColor?: string;
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const [lit, setLit] = useState(-1);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  const stages = architecture.stages;
  const n = stages.length;
  const first = (0.5 / n) * 100;
  const span = ((n - 1) / n) * 100;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const packet = packetRef.current;
    const rail = railRef.current;
    if (!root || !rail) return;

    if (reduced) {
      // No travelling packet; the rail is simply drawn and every stage reads
      // as active, because the diagram's job is to be legible, not to move.
      gsap.set(rail, { scaleX: 1, scaleY: 1 });
      setLit(n - 1);
      return;
    }

    const axis = mobile ? "scaleY" : "scaleX";

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: root,
        start: "top 78%",
        end: "bottom 55%",
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(rail, { [axis]: p });
          if (packet) {
            gsap.set(packet, mobile ? { top: `${first + span * p}%` } : { left: `${first + span * p}%` });
          }
          // Stage index the packet has reached. Rounded down so a stage only
          // lights once the packet is actually on it.
          const idx = Math.min(n - 1, Math.floor(p * n));
          setLit((prev) => (prev === idx ? prev : idx));
        },
      });
      return () => st.kill();
    }, root);

    return () => ctx.revert();
  }, [reduced, mobile, n, first, span]);

  return (
    <div ref={rootRef} className="w-full">
      <p className="t-body measure mb-10">{architecture.summary}</p>

      <div className="relative">
        {/* Rail */}
        <span
          aria-hidden="true"
          className="absolute md:left-0 md:right-0 md:top-[0.55rem] md:h-px md:w-full left-[0.55rem] top-0 h-full w-px"
          style={{ background: "rgb(var(--text) / 0.12)" }}
        />
        <span
          ref={railRef}
          aria-hidden="true"
          className="absolute origin-top md:origin-left md:left-0 md:right-0 md:top-[0.55rem] md:h-px md:w-full left-[0.55rem] top-0 h-full w-px"
          style={{ background: accentColor, transform: "scaleX(0) scaleY(0)" }}
        />
        {!reduced && (
          <span
            ref={packetRef}
            aria-hidden="true"
            className="absolute z-10 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full md:left-0 md:top-[0.55rem] left-[0.55rem] top-0"
            style={{ background: accentColor, boxShadow: `0 0 12px ${accentColor}` }}
          />
        )}

        {/* Stages */}
        <ol className="relative grid gap-y-8 md:grid-flow-col md:auto-cols-fr md:gap-y-0">
          {stages.map((s, i) => {
            const on = i <= lit;
            return (
              <li key={s.label} className="relative flex gap-4 md:block md:pr-6">
                {/* Node */}
                <span
                  className="relative z-[1] mt-[0.2rem] block h-[1.1rem] w-[1.1rem] shrink-0 rounded-full transition-colors duration-500 md:mx-0 md:mb-5 md:mt-0"
                  style={{
                    background: "rgb(var(--chapter-bg))",
                    border: `1px solid ${on ? accentColor : "rgb(var(--text) / 0.25)"}`,
                  }}
                >
                  <span
                    className="absolute inset-[3px] rounded-full transition-opacity duration-500"
                    style={{
                      background: s.core ? accentColor : "rgb(var(--text) / 0.5)",
                      opacity: on ? 1 : 0,
                    }}
                  />
                </span>

                <div className="min-w-0">
                  <p
                    className="text-[0.95rem] font-medium leading-tight transition-colors duration-500"
                    style={{ color: on ? "rgb(var(--text))" : "rgb(var(--text-mute))" }}
                  >
                    {s.label}
                    {s.core && (
                      <span className="t-mono ml-2 align-middle" style={{ color: accentColor }}>
                        core
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 text-[0.82rem] leading-snug text-mute">{s.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
