import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS } from "@/data/chapters";
import { sceneState, detectTier, clamp } from "./sceneState";
import { ScrollContext } from "./scrollContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * The one scroll system (§7, §50).
 *
 *   Lenis → gsap.ticker (single RAF) → ScrollTrigger → everything else
 *
 * Responsibilities, and nothing beyond them:
 *  1. Own the Lenis instance and drive it from GSAP's ticker. One RAF loop
 *     exists on this page and it lives here.
 *  2. Write scroll position, velocity and pointer into `sceneState` so the
 *     3D layer can read them without a React render.
 *  3. Interpolate the page ground between chapter colours (§3) — the
 *     background is never switched, only crossfaded.
 *  4. Publish the active chapter to React, at chapter-change frequency only.
 *
 * On reduced motion: Lenis is not created at all. Native scroll drives
 * ScrollTrigger, ground colour still transitions (it carries meaning, not
 * motion), and every scrubbed transform elsewhere is skipped by the
 * components themselves via `useReducedMotion`.
 */

const parseRGB = (triple: string) => triple.split(" ").map(Number) as [number, number, number];

export const ScrollController = ({ children }: { children: ReactNode }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const [chapter, setChapter] = useState(0);
  const reduced = useReducedMotion();
  const { pathname, hash } = useLocation();

  /* A route change replaces the document. Land at the top and let the effects
     below rebuild their triggers against the new DOM.

     The chapter is only reset on routes that actually have chapter anchors.
     A project page has none and instead parks the scene on its own framing
     in its own effect — and since child effects run before this one, forcing
     chapter 0 here would silently overwrite that and snap the artifact back
     to the full-brightness opening composition. */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    if (document.querySelector("[data-chapter]")) {
      sceneState.chapter = 0;
      sceneState.chapterProgress = 0;
      setChapter(0);
    }

    // The new tree needs a layout pass before ScrollTrigger can measure it.
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();

      // Arriving from a project page with /#work: land on that chapter once
      // measurement is current, otherwise the target's position is stale.
      const target = hash ? document.querySelector<HTMLElement>(`[data-chapter="${hash.slice(1)}"]`) : null;
      if (target) {
        lenisRef.current?.scrollTo(target, { duration: 0.9 });
        if (!lenisRef.current) target.scrollIntoView({ behavior: "auto" });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);

  // Tier + reduced flag are read by the 3D layer, which never re-renders.
  useEffect(() => {
    sceneState.tier = detectTier();
  }, []);
  useEffect(() => {
    sceneState.reduced = reduced;
  }, [reduced]);

  /* --- Lenis + the single RAF loop ------------------------------------- */
  useEffect(() => {
    if (reduced) {
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      document.fonts?.ready.then(refresh).catch(() => {});
      return () => window.removeEventListener("load", refresh);
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    // gsap.ticker is the only RAF on the page. Lenis wants milliseconds.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(() => requestAnimationFrame(refresh)).catch(() => {});

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("load", refresh);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  /* --- Scroll → sceneState. One ScrollTrigger for the whole document. --- */
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        sceneState.progress = self.progress;
        // getVelocity is px/s; 3000 is roughly a fast flick.
        sceneState.velocity = clamp(self.getVelocity() / 3000, -1, 1);
      },
    });
    return () => st.kill();
  }, []);

  /* --- Ground colour: crossfade between consecutive chapters (§3) ------- */
  useEffect(() => {
    const root = document.documentElement;
    const ctx = gsap.context(() => {
      CHAPTERS.forEach((ch, i) => {
        if (i === 0) return;
        const el = document.querySelector<HTMLElement>(`[data-chapter="${ch.id}"]`);
        if (!el) return;

        const from = parseRGB(CHAPTERS[i - 1].bg);
        const to = parseRGB(ch.bg);
        const proxy = { r: from[0], g: from[1], b: from[2] };

        gsap.to(proxy, {
          r: to[0],
          g: to[1],
          b: to[2],
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            // The fade happens across the chapter's approach, so the ground
            // has already changed by the time its first line is readable.
            start: "top bottom",
            end: "top 35%",
            scrub: true,
            invalidateOnRefresh: true,
          },
          onUpdate: () => {
            root.style.setProperty(
              "--chapter-bg",
              `${Math.round(proxy.r)} ${Math.round(proxy.g)} ${Math.round(proxy.b)}`,
            );
          },
        });
      });
    });
    return () => ctx.revert();
  }, [pathname]);

  /* --- Active chapter. Publishes to React only when the index changes. -- */
  useEffect(() => {
    const triggers = CHAPTERS.map((ch, i) => {
      const el = document.querySelector<HTMLElement>(`[data-chapter="${ch.id}"]`);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 45%",
        invalidateOnRefresh: true,
        onToggle: (self) => {
          if (!self.isActive) return;
          sceneState.chapter = i;
          setChapter((prev) => (prev === i ? prev : i));
        },
        onUpdate: (self) => {
          if (self.isActive) sceneState.chapterProgress = self.progress;
        },
      });
    }).filter(Boolean) as ScrollTrigger[];

    return () => triggers.forEach((t) => t.kill());
  }, [pathname]);

  /* --- Pointer. Written to CSS vars and sceneState once per frame. ------ */
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const root = document.documentElement;
    let frame = 0;
    let lastX = 0;
    let lastY = 0;

    const onMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty("--px", `${lastX}px`);
        root.style.setProperty("--py", `${lastY}px`);
        sceneState.pointerX = (lastX / window.innerWidth) * 2 - 1;
        sceneState.pointerY = -((lastY / window.innerHeight) * 2 - 1);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* --- Keyboard users get the native cursor and visible focus back. ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") document.body.classList.add("using-keyboard");
    };
    const onPointer = () => document.body.classList.remove("using-keyboard");
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const scrollTo = useCallback(
    (target: string | HTMLElement | number, opts?: { immediate?: boolean }) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { duration: opts?.immediate ? 0 : 1.1, lock: true });
        return;
      }
      const el =
        typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      if (typeof el === "number") window.scrollTo({ top: el, behavior: "auto" });
      else el?.scrollIntoView({ behavior: opts?.immediate ? "auto" : "smooth" });
    },
    [],
  );

  const setLocked = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (locked) lenis?.stop();
    else lenis?.start();
    // Native scroll needs locking too — Lenis isn't running under reduced
    // motion, and touch devices can still scroll the body behind an overlay.
    document.body.style.overflow = locked ? "hidden" : "";
  }, []);

  return (
    <ScrollContext.Provider
      value={{ chapter, chapterId: CHAPTERS[chapter].id, scrollTo, setLocked }}
    >
      {children}
    </ScrollContext.Provider>
  );
};
