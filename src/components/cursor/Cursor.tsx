import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * The cursor (§11).
 *
 * A 10px ring by default. It states what an element will do rather than
 * decorating the pointer: EXPLORE on a project, ROTATE over the 3D scene,
 * OPEN over an external link. Elements opt in with `data-cursor`.
 *
 * Not mounted at all on coarse pointers or under reduced motion, so there is
 * no hidden native cursor and nothing to clean up on touch.
 *
 * Position is written with gsap.quickTo — one interpolated write per frame
 * on the existing ticker, never React state.
 */

type Mode = "default" | "hover" | "explore" | "rotate" | "open";

const LABEL: Record<Mode, string> = {
  default: "",
  hover: "",
  explore: "Explore →",
  rotate: "Rotate",
  open: "Open ↗",
};

/** Ring diameter per mode. Deliberately restrained — a large cursor covers
 *  the thing the visitor is trying to look at. */
const SIZE: Record<Mode, number> = {
  default: 10,
  hover: 36,
  explore: 92,
  rotate: 72,
  open: 74,
};

export const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("default");
  const [down, setDown] = useState(false);
  const reduced = useReducedMotion();
  const fine = useMediaQuery("(pointer: fine)");
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const el = dotRef.current;
    if (!el) return;

    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.34, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.34, ease: "power3" });

    let seen = false;
    const onMove = (e: PointerEvent) => {
      if (!seen) {
        seen = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
        gsap.to(el, { opacity: 1, duration: 0.3 });
      }
      xTo(e.clientX);
      yTo(e.clientY);

      // Resolve the mode from whatever is under the pointer. Reading it here
      // rather than binding listeners per element means content added later
      // (project chapters, the 3D canvas) works with no registration step.
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(
        "[data-cursor], a, button, [role='button']",
      );
      if (!target) return setMode("default");

      const explicit = target.dataset.cursor as Mode | undefined;
      if (explicit) return setMode(explicit);
      if (target.tagName === "A" && (target as HTMLAnchorElement).target === "_blank") {
        return setMode("open");
      }
      setMode("hover");
    };

    const onLeave = () => gsap.to(el, { opacity: 0, duration: 0.2 });
    const onEnter = () => gsap.to(el, { opacity: 1, duration: 0.2 });
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      gsap.killTweensOf(el);
    };
  }, [enabled]);

  if (!enabled) return null;

  const size = SIZE[mode] * (down ? 0.88 : 1);
  const label = LABEL[mode];
  const filled = mode === "default";

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-cursor grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: filled ? "rgb(var(--lime))" : "rgb(var(--lime) / 0.07)",
        border: filled ? "none" : "1px solid rgb(var(--lime) / 0.55)",
        backdropFilter: filled ? undefined : "blur(2px)",
        transition:
          "width .42s var(--ease-out), height .42s var(--ease-out), background .3s, border-color .3s",
        mixBlendMode: filled ? "difference" : "normal",
      }}
    >
      {label && (
        <span
          className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em]"
          style={{ color: "rgb(var(--lime))" }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
