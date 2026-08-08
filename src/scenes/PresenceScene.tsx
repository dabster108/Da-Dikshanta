import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHANNELS, PROFILE } from "@/data/site";
import { RevealText, RevealBlock } from "@/components/Reveal";
import { Marquee } from "@/components/Marquee";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Presence — the professional surface, as elegant interactive tiles.
 *
 * Resume, LinkedIn, GitHub, Email. No icons-as-decoration; each tile is a
 * large typographic surface that lifts, tilts toward the pointer, and
 * reveals its detail line on hover. A soft accent sheen follows the cursor
 * across the grid.
 */
const Tile = ({
  label,
  detail,
  href,
  external,
  index,
}: {
  label: string;
  detail: string;
  href: string;
  external: boolean;
  index: number;
}) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let rx = 0, ry = 0, cx = 0, cy = 0;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rx = (px - 0.5) * 6;
      ry = -(py - 0.5) * 6;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        cx += (rx - cx) * 0.15;
        cy += (ry - cy) * 0.15;
        el.style.transform = `perspective(900px) rotateY(${cx}deg) rotateX(${cy}deg) translateY(-4px)`;
      });
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      rx = 0; ry = 0;
      el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0px)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <RevealBlock delay={index * 0.08} className="h-full">
      <a
        ref={ref}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="sheen group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.02] p-7 transition-colors duration-500 ease-expo hover:border-accent/40 will-change-transform"
      >
        {/* Index + arrow. */}
        <div className="flex items-start justify-between">
          <span className="label-mono opacity-60">{String(index + 1).padStart(2, "0")}</span>
          <span
            className="label-mono text-foreground-mute transition-all duration-500 ease-expo group-hover:translate-x-1 group-hover:text-accent"
            aria-hidden
          >
            ↗
          </span>
        </div>

        {/* Label as large display type. */}
        <div className="mt-10">
          <h3 className="display-sm transition-all duration-500 ease-expo group-hover:tracking-tight">
            {label}
          </h3>
          <p className="body-md mt-3 max-w-xs text-foreground-mute transition-colors duration-500 ease-expo group-hover:text-foreground-soft">
            {detail}
          </p>
        </div>
      </a>
    </RevealBlock>
  );
};

export const PresenceScene = () => {
  return (
    <section
      id="presence"
      className="relative px-6 py-32 sm:px-10 sm:py-48"
      data-scene="presence"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 flex items-baseline justify-between">
          <RevealText as="h2" className="display-lg" stagger={0.05}>
            Professional surface
          </RevealText>
          <RevealBlock as="span" className="label-mono" delay={0.2}>
            04 — Presence
          </RevealBlock>
        </div>

        <RevealBlock as="p" className="body-lg mb-16 max-w-xl" delay={0.25}>
          {PROFILE.name} — {PROFILE.role}. Based in {PROFILE.location}.
          The four channels below are the fastest ways in.
        </RevealBlock>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CHANNELS.map((c, i) => (
            <Tile
              key={c.id}
              label={c.label}
              detail={c.detail}
              href={c.href}
              external={c.external}
              index={i}
            />
          ))}
        </div>

        {/* The stack — an infinite marquee that pauses on hover. */}
        <RevealBlock delay={0.2} className="mt-24">
          <span className="label-mono mb-6 block opacity-60">Working stack</span>
          <Marquee />
        </RevealBlock>
      </div>
    </section>
  );
};
