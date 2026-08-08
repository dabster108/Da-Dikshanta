import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROFILE } from "@/data/site";
import { HeroHeadline } from "@/components/HeroHeadline";
import { Portrait } from "@/components/Portrait";
import { useSmoothScroll } from "./SmoothScrollProvider";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing — the first region.
 *
 * Minimal but deeply layered. The left column carries the headline with
 * per-word scroll parallax (each word drifts at a slightly different speed,
 * so the type breathes as you scroll) plus a pointer-driven 3D perspective
 * tilt. A faint depth layer sits behind the headline and moves on its own
 * curve. The portrait on the right parallaxes away faster than the text.
 * Everything hands off to the Story scene with no seam.
 */
export const LandingScene = ({ heroReady = true }: { heroReady?: boolean }) => {
  const rootRef = useRef<HTMLElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const depthRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();
  const reduced = useReducedMotion();

  // Scroll-driven parallax — layered, every element on its own curve.
  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const headline = headlineRef.current;
    const depth = depthRef.current;
    const portrait = portraitRef.current;
    const meta = metaRef.current;
    const cue = cueRef.current;
    if (!root || !headline || !depth || !portrait || !meta || !cue) return;

    const ctx = gsap.context(() => {
      gsap.to(headline, {
        yPercent: -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
      gsap.to(depth, {
        y: 60,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });
      // Portrait rises + fades faster — it leaves first.
      gsap.to(portrait, {
        yPercent: -14,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
      // Meta + cue fade out within the first 30%.
      gsap.to([meta, cue], {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "30% top",
          scrub: 0.6,
        },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  // Body + CTA fade in after the hero cascade — also on ready, not scroll.
  useEffect(() => {
    if (!heroReady) return;
    const body = bodyRef.current;
    const cta = ctaRef.current;
    if (!body || !cta) return;

    if (reduced) {
      gsap.set([body, cta], { opacity: 1, y: 0 });
      return;
    }

    gsap.set([body, cta], { opacity: 0, y: 24 });
    const tl = gsap.timeline({ delay: 0.9, defaults: { ease: "expo.out", duration: 0.9 } });
    tl.to(body, { opacity: 1, y: 0 }).to(cta, { opacity: 1, y: 0 }, "-=0.5");
    return () => {
      tl.kill();
    };
  }, [heroReady, reduced]);

  // Pointer-driven 3D tilt on the left column — subtle, eased.
  useEffect(() => {
    if (reduced) return;
    const column = columnRef.current;
    if (!column) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const onMove = (e: PointerEvent) => {
      const rect = column.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      tx = (px - 0.5) * 6;
      ty = -(py - 0.5) * 4;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        column.style.transform = `perspective(1400px) rotateY(${cx}deg) rotateX(${cy}deg)`;
      });
    };

    const onLeave = () => {
      tx = 0; ty = 0;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        cx += (0 - cx) * 0.08;
        cy += (0 - cy) * 0.08;
        column.style.transform = `perspective(1400px) rotateY(${cx}deg) rotateX(${cy}deg)`;
      });
    };

    column.addEventListener("pointermove", onMove);
    column.addEventListener("pointerleave", onLeave);
    return () => {
      column.removeEventListener("pointermove", onMove);
      column.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col px-6 py-8 sm:px-10 sm:py-10"
      data-scene="landing"
    >
      {/* Top row: a quiet mark. */}
      <div ref={metaRef} className="flex items-center justify-between">
        <span className="label-mono">{PROFILE.name}</span>
        <span className="hidden label-mono sm:inline opacity-60">{PROFILE.site}</span>
      </div>

      {/* Centre: headline + portrait. */}
      <div className="grid flex-1 grid-cols-1 items-center gap-10 py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div
          ref={columnRef}
          className="relative order-2 lg:order-1 will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Depth layer behind the headline — a soft accent orb that
              drifts on its own curve, giving the column real depth. */}
          <div
            ref={depthRef}
            className="pointer-events-none absolute -left-10 top-0 -z-10 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, hsl(var(--accent) / 0.18), transparent 70%)",
            }}
            aria-hidden
          />

          <div ref={headlineRef} className="will-change-transform">
            <HeroHeadline ready={heroReady} />
          </div>

          <p
            ref={bodyRef}
            className="body-lg mt-10 max-w-md will-change-transform"
            style={{ opacity: 0 }}
          >
            {PROFILE.role}. Graduating in {PROFILE.degree} at {PROFILE.institution}.
            I design, build, research and deploy intelligent software.
          </p>

          <div ref={ctaRef} className="mt-10 flex items-center gap-4" style={{ opacity: 0 }}>
            <button
              type="button"
              onClick={() => scrollTo("#story", { offset: -40 })}
              className="btn-magnetic"
            >
              Enter the work
              <span className="arrow" aria-hidden>→</span>
            </button>
            <a
              href="/cv/DIKSHANTA_CHAPAGAIN_RESUME.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="label-mono transition-colors hover:text-foreground"
            >
              Résumé ↗
            </a>
          </div>
        </div>

        <div ref={portraitRef} className="relative z-10 order-1 lg:order-2">
          <Portrait />
        </div>
      </div>

      {/* Bottom: scroll cue. */}
      <div ref={cueRef} className="flex items-end justify-between">
        <span className="label-mono opacity-60">Scroll to begin</span>
        <span className="label-mono opacity-60 tabular">01 / 05</span>
      </div>
    </section>
  );
};
