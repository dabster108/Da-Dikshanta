import { useEffect, useRef } from "react";
import { PROFILE } from "@/data/site";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * The professional portrait as a physical object — not a card, not a
 * rectangle. A layered glass frame that tilts toward the pointer, with a
 * soft accent light that follows the cursor across its surface and a slow
 * parallax drift on scroll. Soft shadow + depth blur for premium feel.
 *
 * Layered structure:
 *   outer   — perspective container, receives pointer + scroll
 *   glow    — accent halo behind the frame, breathes
 *   frame   — the glass, tilts + scales
 *     image   — the portrait, masked to a soft vertical capsule
 *     sheen   — pointer-following accent light
 *     grain   — subtle film grain over the image
 *   caption — small mono label, sits below
 */
export const Portrait = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const outer = outerRef.current;
    const frame = frameRef.current;
    const sheen = sheenRef.current;
    const glow = glowRef.current;
    if (!outer || !frame || !sheen) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0; // tilt
    let sx = 0.5, sy = 0.5, csx = 0.5, csy = 0.5; // sheen

    const onMove = (e: PointerEvent) => {
      const rect = outer.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      // Tilt away from centre (max ~10deg).
      tx = (px - 0.5) * 16;
      ty = -(py - 0.5) * 12;
      sx = px;
      sy = py;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        csx += (sx - csx) * 0.18;
        csy += (sy - csy) * 0.18;
        frame.style.transform = `rotateY(${cx}deg) rotateX(${cy}deg)`;
        sheen.style.background =
          `radial-gradient(220px circle at ${csx * 100}% ${csy * 100}%, hsl(var(--accent) / 0.28), transparent 60%)`;
        if (glow) {
          glow.style.transform = `translate3d(${(csx - 0.5) * 30}px, ${(csy - 0.5) * 30}px, 0)`;
        }
      });
    };

    const onLeave = () => {
      tx = 0; ty = 0; sx = 0.5; sy = 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        cx += (0 - cx) * 0.1;
        cy += (0 - cy) * 0.1;
        csx += (0.5 - csx) * 0.1;
        csy += (0.5 - csy) * 0.1;
        frame.style.transform = `rotateY(${cx}deg) rotateX(${cy}deg)`;
        sheen.style.background =
          `radial-gradient(220px circle at ${csx * 100}% ${csy * 100}%, hsl(var(--accent) / 0.18), transparent 60%)`;
      });
    };

    outer.addEventListener("pointermove", onMove);
    outer.addEventListener("pointerleave", onLeave);
    return () => {
      outer.removeEventListener("pointermove", onMove);
      outer.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={outerRef}
      className="relative mx-auto aspect-[4/5] w-full max-w-[420px]"
      style={{ perspective: "1200px" }}
    >
      {/* Accent halo — breathes behind the frame. */}
      <div
        ref={glowRef}
        className="absolute -inset-10 -z-10 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, hsl(var(--accent) / 0.22), transparent 70%)",
        }}
        aria-hidden
      />

      {/* The glass frame. */}
      <div
        ref={frameRef}
        className="relative h-full w-full rounded-[28px] transition-transform duration-300 ease-expo"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Soft layered shadow for depth. */}
        <div
          className="absolute -inset-3 rounded-[32px] bg-black/60 blur-2xl"
          aria-hidden
          style={{ transform: "translateZ(-20px)" }}
        />

        {/* Image capsule. */}
        <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-surface">
          <img
            src={PROFILE.portrait}
            alt={PROFILE.portraitAlt}
            className="h-full w-full object-cover object-[center_18%]"
            decoding="async"
            fetchPriority="high"
          />
          {/* Soft bottom blend — lighter so the face stays visible */}
          <div
            className="absolute inset-x-0 bottom-0 h-[18%]"
            style={{
              background: "linear-gradient(to top, hsl(var(--background) / 0.75) 0%, transparent 100%)",
            }}
            aria-hidden
          />
          {/* Pointer sheen. */}
          <div
            ref={sheenRef}
            className="absolute inset-0 mix-blend-screen"
            style={{
              background:
                "radial-gradient(220px circle at 50% 50%, hsl(var(--accent) / 0.18), transparent 60%)",
            }}
            aria-hidden
          />
          {/* Glass top highlight. */}
          <div
            className="absolute inset-x-0 top-0 h-1/4"
            style={{
              background:
                "linear-gradient(to bottom, hsl(0 0% 100% / 0.12), transparent)",
            }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
};
