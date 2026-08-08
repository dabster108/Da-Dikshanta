import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHANNELS, PROFILE, CONTACT } from "@/data/site";
import { RevealText } from "@/components/typography/RevealText";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Contact (§40) and footer (§41).
 *
 * The closing frame. The ground has already returned to the opening colour
 * by the time this chapter is centred — ScrollController handles that — and
 * the 3D layer has faded to 22% via the camera path, so the page ends where
 * it began with the work in between.
 *
 * The channels are links, not a form. A form asks the visitor to do the
 * work of composing into a box that might go nowhere; an address is
 * something they can act on immediately.
 */

export const Contact = () => {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-channel]", {
        opacity: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-channels]", start: "top 80%", once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      data-chapter="contact"
      id="contact"
      className="relative px-gutter pt-chapter"
      aria-label="Contact"
    >
      <p className="t-mono">08 — Contact</p>

      <RevealText as="h2" className="t-chapter mt-10 max-w-[13ch]" stagger={0.1}>
        <span className="block">Let's build</span>
        <span className="block">something</span>
        <span className="serif block" style={{ fontSize: "1.1em" }}>
          intelligent.
        </span>
      </RevealText>

      <RevealText as="p" className="t-body measure mt-10">
        I'm finishing my degree in {PROFILE.graduation} and looking for work
        where the model is the hard part — or where getting it into someone's
        hands is. Either is interesting.
      </RevealText>

      {/* Channels */}
      <ul data-channels className="mt-20 border-t hairline sm:mt-28">
        {CHANNELS.map((c) => (
          <li key={c.id} data-channel className="border-b hairline">
            <a
              href={c.href}
              {...(c.external
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
              className="group grid grid-cols-[1fr_auto] items-center gap-x-6 py-7 no-underline sm:grid-cols-[10rem_1fr_auto] sm:py-9"
            >
              <span className="serif text-[clamp(1.5rem,3.4vw,2.5rem)] leading-none transition-colors duration-500 group-hover:text-[rgb(var(--lime))]">
                {c.label}
              </span>
              <span className="col-span-2 mt-2 text-[0.92rem] text-mute sm:col-span-1 sm:mt-0">
                {c.detail}
              </span>
              <span
                className="justify-self-end text-[1.1rem] text-mute transition-transform duration-500 ease-out group-hover:translate-x-1.5 group-hover:text-[rgb(var(--lime))]"
                aria-hidden="true"
              >
                {c.external ? "↗" : "→"}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {/* Footer (§41) — minimal. */}
      <footer className="mt-28 flex flex-col gap-10 pb-14 sm:mt-40 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[1.05rem]">{PROFILE.name}</p>
          <p className="t-mono mt-2.5">
            AI · Machine learning · Computer vision · Systems
          </p>
          <p className="t-mono mt-1.5">{CONTACT.location}</p>
        </div>

        <div className="sm:text-right">
          <p className="t-mono">Available for</p>
          <p className="mt-2.5 max-w-[26ch] text-[0.95rem] leading-relaxed text-2 sm:ml-auto">
            Research, collaboration, and engineering problems that are
            genuinely difficult.
          </p>
        </div>
      </footer>
    </section>
  );
};
