import { useEffect, useRef, useState } from "react";

/**
 * Cursor — a subtle accent dot that trails the pointer and reacts to context.
 *
 * It does NOT hide the native cursor (too risky for usability). Instead it
 * adds a small dot that grows when hovering interactive elements and becomes
 * a ring when hovering project rows or the digital core. Disabled on touch
 * devices and when prefers-reduced-motion is set.
 */
type Mode = "dot" | "ring" | "reticle";

const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("dot");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let x = 0, y = 0, cx = 0, cy = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) setVisible(true);
      const t = e.target as HTMLElement | null;
      if (t?.closest("[data-cursor='reticle']")) setMode("reticle");
      else if (t?.closest("a, button, input, textarea, [role='button'], [data-cursor='ring']")) setMode("ring");
      else setMode("dot");
    };
    const onLeave = () => setVisible(false);

    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [visible]);

  if (!visible) return null;

  const size = mode === "dot" ? 6 : mode === "ring" ? 26 : 40;
  const border = mode === "dot" ? "none" : "1px solid hsl(245 90% 68% / 0.6)";
  const fill = mode === "dot" ? "hsl(245 90% 68%)" : "transparent";

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[170] rounded-full transition-[width,height,background,border] duration-200"
      style={{
        width: size,
        height: size,
        border,
        background: fill,
        mixBlendMode: "screen",
      }}
      aria-hidden
    />
  );
};

export default Cursor;
