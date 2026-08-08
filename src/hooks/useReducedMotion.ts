import { useEffect, useState } from "react";

/**
 * Reactive `prefers-reduced-motion`. Re-evaluates if the setting is changed
 * while the page is open, so the experience degrades live rather than only
 * at load.
 */
export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
};
