import { useEffect, useState } from "react";

/** Reactive media query. */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
};

/** Breakpoints used across the experience. Desktop gets the full cinematic
 *  treatment, tablet a simplified 3D layer, mobile a rebuilt layout (§44). */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
export const useIsTouch = () => useMediaQuery("(pointer: coarse)");
