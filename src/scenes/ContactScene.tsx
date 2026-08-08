import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { PROFILE, CONTACT } from "@/data/site";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { ContactForm } from "@/components/ContactForm";

/**
 * Contact — closing beat. Content reveals via IntersectionObserver (not
 * ScrollTrigger) so nav-jumps and first paint always show visible text.
 */
export const ContactScene = () => {
  const rootRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;

    const lines = Array.from(content.querySelectorAll<HTMLElement>("[data-contact-line]"));

    if (reduced) {
      gsap.set(lines, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(lines, { opacity: 0, y: 28 });

    const reveal = () => {
      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
      });
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    obs.observe(root);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="contact"
      className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 py-32 text-center"
      data-scene="contact"
    >
      <div ref={contentRef} className="relative z-10 mx-auto max-w-4xl">
        <span data-contact-line className="label-mono block">
          05 — Contact
        </span>

        <h2 data-contact-line className="display-2xl mt-8 text-foreground">
          Let's build something intelligent.
        </h2>

        <p data-contact-line className="body-lg mx-auto mt-10 max-w-lg">
          Open to research, internships and full-time work in machine learning,
          computer vision, and applied AI.
        </p>

        <div className="mt-14">
          <ContactForm />
        </div>

        <div data-contact-line className="mt-14 flex flex-col items-center gap-6">
          <a href={`mailto:${CONTACT.email}`} className="btn-magnetic">
            {CONTACT.email}
            <span className="arrow" aria-hidden>→</span>
          </a>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="https://github.com/dabster108"
              target="_blank"
              rel="noopener noreferrer"
              className="label-mono transition-colors hover:text-foreground"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/in/dikshantachapagain/"
              target="_blank"
              rel="noopener noreferrer"
              className="label-mono transition-colors hover:text-foreground"
            >
              LinkedIn ↗
            </a>
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
      </div>

      <div className="absolute inset-x-6 bottom-8 flex items-center justify-between sm:inset-x-10">
        <span className="label-mono opacity-50">{PROFILE.name}</span>
        <span className="label-mono opacity-50">{PROFILE.site}</span>
      </div>
    </section>
  );
};
