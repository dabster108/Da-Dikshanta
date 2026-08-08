import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Mounts Lenis with the spec's hardcoded settings and wires it into GSAP's
 * ScrollTrigger so pinned/scrubbed sections read from the same scroll source.
 *
 * On reduced-motion: Lenis is skipped entirely — native instant scroll,
 * ScrollTrigger still works off the native scroll position.
 */
export const useLenis = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      // Tell ScrollTrigger to use native scroll directly.
      ScrollTrigger.config({ ignoreMobileResize: true });
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      duration: 1.2,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return lenisRef;
};
