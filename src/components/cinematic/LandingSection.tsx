import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextReveal, MagneticButton } from "@/motion/primitives";
import { EASE, TEXT_REVEAL } from "@/motion/tokens";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/** Landing — preloader is handled by the parent. Name reveal via the
 *  text-reveal token, then a slow scroll-driven fade as you leave. */
export const LandingSection = () => {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return;

    // Fade + lift the hero as you scroll past it.
    const tween = gsap.to(el, {
      opacity: 0,
      y: -80,
      filter: "blur(8px)",
      ease: EASE.none,
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="landing"
      className="relative flex min-h-screen flex-col items-center justify-center px-6"
    >
      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="label-mono-accent mb-6 block">AI / ML / Robotics Research</span>
        <TextReveal
          as="h1"
          split
          className="display-xl text-foreground"
        >
          Dikshanta Chapagain
        </TextReveal>
        <div
          className="mt-6 max-w-xl"
          style={{ opacity: 0 }}
          ref={(node) => {
            if (!node || reduced) {
              if (node) node.style.opacity = "1";
              return;
            }
            gsap.to(node, {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: TEXT_REVEAL.duration,
              ease: TEXT_REVEAL.ease,
              delay: 0.5,
              scrollTrigger: { trigger: node, start: "top 90%", once: true },
            });
            gsap.set(node, { y: 24, filter: `blur(${TEXT_REVEAL.blur}px)` });
          }}
        >
          <p className="body-lg">
            I build systems that perceive, decide, and act — computer vision,
            robotics, cryptography, and multi-agent architectures, shipped to
            production and stress-tested in the field.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            href="#projects"
            className="rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-shadow hover:shadow-[0_0_40px_-8px_hsl(214_100%_62%)]"
            ariaLabel="View research work"
          >
            View the work
          </MagneticButton>
          <MagneticButton
            href="#contact"
            className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/60"
            ariaLabel="Get in touch"
          >
            Get in touch
          </MagneticButton>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <span className="label-mono">scroll</span>
      </div>
    </section>
  );
};
