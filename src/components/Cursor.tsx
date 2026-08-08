import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Custom cursor — two layers, both pointer-events-none.
 *
 *   dot   — 6px accent dot, tracks the pointer with near-zero lag
 *   ring  — 36px hairline ring, springs behind the dot with expo easing
 *
 * Over interactive elements (a, button, [data-cursor]) the ring expands and
 * the dot hides; leaving, it settles back. On press, the ring contracts
 * slightly for a tactile click feel.
 *
 * Disabled on touch devices and reduced-motion. The native cursor stays
 * visible so the page remains fully usable if the custom cursor is off.
 */
export const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Quick setters — avoid React re-renders per frame.
    const setDot = (x: number, y: number) => {
      dot.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0)`;
    };
    const setRing = gsap.quickTo(ring, "x,y", {
      duration: 0.55,
      ease: "expo.out",
    });

    // Resolved once to a literal — animating a `var(--accent)`-embedded
    // colour string can race GSAP's complex-CSS-string parser when the
    // tween is re-triggered before its first render (dense hover surfaces
    // with moving elements do this), so the accent goes in as a plain hsl().
    const rootStyle = getComputedStyle(document.documentElement);
    const accentTriplet = rootStyle.getPropertyValue("--accent").trim() || "188 100% 50%";
    const ringBorder = `hsl(${accentTriplet} / 0.9)`;
    const ringFill = `hsl(${accentTriplet} / 0.06)`;

    let visible = false;
    // Guards against redundant over/out pairs for an already-current state —
    // dense hover surfaces (moving elements under a stationary pointer) can
    // fire pointerover/pointerout back-to-back on the same interactive
    // ancestor, and re-triggering a complex-colour tween before its first
    // render lands is a known GSAP race. Only real state transitions tween.
    let isOverInteractive = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      setDot(e.clientX, e.clientY);
      setRing(e.clientX, e.clientY);
    };

    const onOver = (e: Event) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [data-cursor], input, textarea, select");
      if (!interactive || isOverInteractive) return;
      isOverInteractive = true;
      try {
        gsap.to(ring, {
          scale: 1.8,
          borderColor: ringBorder,
          backgroundColor: ringFill,
          duration: 0.4,
          ease: "expo.out",
          overwrite: true,
        });
        gsap.to(dot, { scale: 0, duration: 0.3, ease: "expo.out", overwrite: true });
      } catch {
        /* defensive — a moving hover target can race GSAP's colour tween */
      }
    };
    const onOut = (e: Event) => {
      const t = e.target as HTMLElement;
      if (!t.closest("a, button, [data-cursor], input, textarea, select")) return;
      if (!isOverInteractive) return;
      isOverInteractive = false;
      try {
        gsap.to(ring, {
          scale: 1,
          borderColor: "hsl(0 0% 100% / 0.4)",
          backgroundColor: "transparent",
          duration: 0.4,
          ease: "expo.out",
          overwrite: true,
        });
        gsap.to(dot, { scale: 1, duration: 0.3, ease: "expo.out", overwrite: true });
      } catch {
        /* defensive — a moving hover target can race GSAP's colour tween */
      }
    };

    const onDown = () => gsap.to(ring, { scale: 0.85, duration: 0.18, ease: "expo.out" });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.3, ease: "expo.out" });
    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerout", onOut);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 rounded-full bg-accent opacity-0 mix-blend-difference"
        style={{ willChange: "transform" }}
        aria-hidden
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] h-9 w-9 -ml-4.5 -mt-4.5 rounded-full border border-white/40 opacity-0"
        style={{ willChange: "transform", marginLeft: "-18px", marginTop: "-18px" }}
        aria-hidden
      />
    </>
  );
};
