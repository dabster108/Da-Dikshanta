import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS } from "@/data/projects";
import { useScroll } from "@/lib/animation/scrollContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Floating chapter selector (§32, §33).
 *
 * A small pill that reports which project the visitor is inside, and lets
 * them jump. When the project changes the label flips on the X axis — one
 * element rotating through 90°, with the text swapped at the point where it
 * is edge-on and invisible. That is cheaper and steadier than cross-fading
 * two stacked faces, and it is what makes the swap read as one object
 * turning rather than two labels trading places.
 *
 * It only exists while the work chapter is on screen. A persistent floating
 * control that is irrelevant for six chapters out of eight is clutter.
 */

export const ProjectSelector = () => {
  const { chapterId } = useScroll();
  const rootRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const shown = useRef(-1);
  const reduced = useReducedMotion();

  const visible = chapterId === "work";

  /* Which project is the visitor inside? */
  useLayoutEffect(() => {
    const triggers = PROJECTS.map((p, i) =>
      ScrollTrigger.create({
        trigger: `[data-project="${p.id}"]`,
        start: "top 60%",
        end: "bottom 40%",
        invalidateOnRefresh: true,
        onToggle: (self) => self.isActive && setIndex(i),
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  /* Show / hide with the chapter. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    gsap.to(el, {
      y: visible ? 0 : 28,
      opacity: visible ? 1 : 0,
      duration: reduced ? 0.15 : 0.6,
      ease: "expo.out",
      pointerEvents: visible ? "auto" : "none",
    });
    if (!visible) setOpen(false);
  }, [visible, reduced]);

  /* The flip. */
  useLayoutEffect(() => {
    const face = faceRef.current;
    if (!face) return;

    const write = () => {
      face.querySelector("[data-num]")!.textContent = PROJECTS[index].number;
      face.querySelector("[data-name]")!.textContent = PROJECTS[index].shortTitle;
    };

    // First paint, or reduced motion: no rotation, just the right content.
    if (shown.current === -1 || reduced) {
      write();
      shown.current = index;
      return;
    }
    if (shown.current === index) return;

    const forward = index > shown.current;
    shown.current = index;

    const tl = gsap.timeline();
    tl.to(face, {
      rotateX: forward ? -90 : 90,
      duration: 0.28,
      ease: "power2.in",
      onComplete: write,
    }).fromTo(
      face,
      { rotateX: forward ? 90 : -90 },
      { rotateX: 0, duration: 0.42, ease: "expo.out" },
    );

    return () => {
      tl.kill();
    };
  }, [index, reduced]);

  /* Progress across the whole work chapter. */
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const st = ScrollTrigger.create({
      trigger: '[data-chapter="work"]',
      start: "top 60%",
      end: "bottom 60%",
      invalidateOnRefresh: true,
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    });
    return () => st.kill();
  }, []);

  const jump = (slug: string) => {
    document.getElementById(slug)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className="fixed inset-x-0 bottom-6 z-chrome flex justify-center px-gutter"
      style={{ opacity: 0, transform: "translateY(28px)", pointerEvents: "none" }}
    >
      <div className="relative">
        {/* Expanded list */}
        {open && (
          <ul
            className="glass absolute bottom-[calc(100%+0.6rem)] left-0 w-full min-w-[16rem] overflow-hidden rounded-lg py-1.5"
            role="listbox"
            aria-label="Projects"
          >
            {PROJECTS.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === index}
                  onClick={() => jump(p.slug)}
                  className="flex w-full items-baseline gap-3 px-4 py-2 text-left text-[0.9rem] transition-colors hover:bg-[rgb(var(--text)/0.05)]"
                  style={{ color: i === index ? "rgb(var(--lime))" : "rgb(var(--text-2))" }}
                >
                  <span className="t-mono tabular-nums" style={{ color: "inherit" }}>
                    {p.number}
                  </span>
                  {p.shortTitle}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* The pill */}
        <div className="glass overflow-hidden rounded-pill">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={`Project ${PROJECTS[index].number}, ${PROJECTS[index].shortTitle}. Open project list.`}
            className="flex items-center gap-3.5 py-2.5 pl-4 pr-3.5"
            style={{ perspective: "420px" }}
          >
            <div
              ref={faceRef}
              className="flex items-baseline gap-3"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              <span
                data-num
                className="font-mono text-[0.75rem] tabular-nums tracking-[0.16em]"
                style={{ color: "rgb(var(--lime))" }}
              />
              <span data-name className="text-[0.9rem]" />
            </div>
            <span
              className="text-[0.7rem] text-mute transition-transform duration-400"
              style={{ transform: open ? "rotate(180deg)" : "none" }}
              aria-hidden="true"
            >
              ▲
            </span>
          </button>

          {/* Progress through the chapter */}
          <span
            ref={barRef}
            className="block h-px w-full origin-left"
            style={{ background: "rgb(var(--lime))", transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
};
