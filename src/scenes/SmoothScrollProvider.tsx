import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface ScrollToOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
}

interface ScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, opts?: ScrollToOptions) => void;
}

const ScrollContext = createContext<ScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
});

export const SmoothScrollProvider = ({ children }: { children: ReactNode }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      ScrollTrigger.config({ ignoreMobileResize: true });
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      if (document.fonts?.ready) document.fonts.ready.then(refresh);
      return () => window.removeEventListener("load", refresh);
    }

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    const refreshNextFrame = () => requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refreshNextFrame).catch(() => {});

    return () => {
      gsap.ticker.remove(raf);
      window.removeEventListener("load", refresh);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        document.documentElement.style.setProperty("--px", `${e.clientX}px`);
        document.documentElement.style.setProperty("--py", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const scrollTo = useCallback((target: string | number | HTMLElement, opts?: ScrollToOptions) => {
    const lenis = lenisRef.current;
    const duration = opts?.immediate ? 0 : (opts?.duration ?? 0.75);
    const offset = opts?.offset ?? 0;

    if (lenis) {
      lenis.scrollTo(target, {
        offset,
        duration,
        lock: !opts?.immediate,
        onComplete: () => ScrollTrigger.update(),
      });
      return;
    }

    if (typeof target === "string") {
      document.querySelector(target)?.scrollIntoView({ behavior: opts?.immediate ? "auto" : "smooth" });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: opts?.immediate ? "auto" : "smooth" });
    } else {
      window.scrollTo({ top: target, behavior: opts?.immediate ? "auto" : "smooth" });
    }
  }, []);

  return (
    <ScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useSmoothScroll = () => useContext(ScrollContext);
