import { useEffect, useState } from "react";

/**
 * The hero copy waits for the node-letterform intro to scatter, so the name
 * isn't being spelled out in 3D and typeset in HTML at the same time.
 *
 * Fails open: if the canvas never mounts (no WebGL, chunk error, reduced
 * motion), the copy appears on its own timer instead of never.
 */
export const useIntroGate = (fallbackMs = 3400) => {
  const [revealed, setRevealed] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (revealed) return;

    const reveal = () => setRevealed(true);
    window.addEventListener("synaptic:intro-complete", reveal);
    const timer = setTimeout(reveal, fallbackMs);

    return () => {
      window.removeEventListener("synaptic:intro-complete", reveal);
      clearTimeout(timer);
    };
  }, [fallbackMs, revealed]);

  return revealed;
};
