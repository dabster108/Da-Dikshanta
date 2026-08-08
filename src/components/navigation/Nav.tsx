import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS, TOTAL } from "@/data/chapters";
import { useScroll } from "@/lib/animation/scrollContext";
import { PROFILE } from "@/data/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Navigation (§12) — quiet by design.
 *
 * A wordmark, four destinations, and a chapter readout. No bar and no
 * chrome: the only surface is a veil that fades in once the visitor has left
 * the opening, plus a progress line tracking the document.
 *
 * Below 640px the four destinations do not fit alongside the wordmark at a
 * tappable size, so they move into a full-screen index instead of being
 * shrunk to 10px. Mobile gets a different control, not a smaller one (§44).
 */

const LINKS = [
  { id: "work", label: "Work" },
  { id: "research", label: "Research" },
  { id: "approach", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export const Nav = ({ variant = "home" }: { variant?: "home" | "project" }) => {
  const barRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { chapter, scrollTo, setLocked } = useScroll();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  /* The veil arrives once the opening is behind the visitor — it must not
     compete with the first frame. */
  useEffect(() => {
    if (variant === "project") return;
    const el = barRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { "--nav-veil": 0 },
        {
          "--nav-veil": 1,
          ease: "none",
          scrollTrigger: { start: "top top", end: "+=70%", scrub: true },
        },
      );
    });
    return () => ctx.revert();
  }, [variant]);

  /* Progress line. Scaled on the compositor, never laid out. */
  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => gsap.set(el, { scaleX: self.progress }),
    });
    return () => st.kill();
  }, []);

  /* The index overlay. */
  useEffect(() => {
    setLocked(open);
    const el = menuRef.current;
    if (!el) return;

    if (reduced) {
      gsap.set(el, { autoAlpha: open ? 1 : 0 });
      return;
    }

    const items = el.querySelectorAll("[data-menu-item]");
    if (open) {
      const tl = gsap.timeline();
      tl.set(el, { autoAlpha: 1 })
        .fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "expo.out" })
        .from(items, { yPercent: 60, opacity: 0, duration: 0.6, stagger: 0.06, ease: "expo.out" }, "-=0.35");
      return () => tl.kill();
    }

    const tl = gsap.timeline();
    tl.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.45, ease: "expo.in" }).set(el, {
      autoAlpha: 0,
    });
    return () => tl.kill();
  }, [open, reduced, setLocked]);

  // Escape closes it, and the lock is released if this unmounts while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setLocked(false);
    };
  }, [setLocked]);

  const go = (id: string) => {
    setOpen(false);
    if (variant === "project") {
      navigate(`/#${id}`);
      return;
    }
    // The overlay releases the scroll lock from an effect, which runs after
    // this handler — so Lenis is still stopped right now and would swallow
    // the scroll. Release it here, then move on the next frame.
    setLocked(false);
    requestAnimationFrame(() => scrollTo(`[data-chapter="${id}"]`));
  };

  const active = CHAPTERS[chapter];

  return (
    <>
      <header
        ref={barRef}
        className="fixed inset-x-0 top-0 z-chrome"
        style={
          {
            "--nav-veil": variant === "project" ? 1 : 0,
            background:
              "linear-gradient(to bottom, rgb(var(--chapter-bg) / calc(var(--nav-veil) * 0.82)), transparent)",
            backdropFilter: "blur(calc(var(--nav-veil) * 6px))",
            WebkitBackdropFilter: "blur(calc(var(--nav-veil) * 6px))",
          } as React.CSSProperties
        }
      >
        <div className="flex items-center justify-between px-gutter py-5 sm:py-6">
          <Link
            to="/"
            onClick={(e) => {
              if (variant === "home") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
              }
              setOpen(false);
            }}
            className="flex items-baseline gap-2.5 no-underline"
          >
            <span className="text-[0.82rem] font-medium uppercase tracking-[0.2em] text-[rgb(var(--text))] sm:text-[0.9rem]">
              {PROFILE.shortName}
            </span>
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: "rgb(var(--lime))" }}
            />
          </Link>

          {/* Desktop destinations */}
          <nav aria-label="Sections" className="hidden items-center gap-2 sm:flex">
            {variant === "home" ? (
              LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="group relative px-3 py-1.5 text-[0.78rem] text-[rgb(var(--text-2))] transition-colors hover:text-[rgb(var(--text))]"
                  aria-current={active.id === l.id ? "true" : undefined}
                >
                  {l.label}
                  <span
                    className="absolute inset-x-3 bottom-0.5 h-px origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"
                    style={{
                      background: "rgb(var(--lime))",
                      transform: active.id === l.id ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </button>
              ))
            ) : (
              <Link
                to="/"
                className="px-3 py-1.5 text-[0.78rem] text-[rgb(var(--text-2))] no-underline transition-colors hover:text-[rgb(var(--text))]"
              >
                ← Index
              </Link>
            )}

            {variant === "home" && (
              <div className="ml-2 hidden items-baseline gap-1.5 border-l pl-4 hairline md:flex">
                <span className="t-mono t-mono-lime tabular-nums">{active.index}</span>
                <span className="t-mono">/ {String(TOTAL).padStart(2, "0")}</span>
              </div>
            )}
          </nav>

          {/* Mobile control */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="index-overlay"
            className="flex items-center gap-3 py-1.5 sm:hidden"
          >
            {variant === "home" && (
              <span className="t-mono t-mono-lime tabular-nums">{active.index}</span>
            )}
            <span className="text-[0.8rem] text-[rgb(var(--text-2))]">
              {open ? "Close" : "Index"}
            </span>
          </button>
        </div>

        <div
          ref={lineRef}
          className="h-px w-full origin-left"
          style={{ background: "rgb(var(--lime) / 0.75)", transform: "scaleX(0)" }}
        />
      </header>

      {/* Full-screen index, mobile only */}
      <div
        ref={menuRef}
        id="index-overlay"
        /* One below the header, so the Close control stays reachable — the
           overlay filling inset-0 at the same z would bury its own button. */
        className="fixed inset-0 z-[39] flex flex-col justify-center px-gutter sm:hidden"
        style={{
          background: "rgb(var(--chapter-bg))",
          visibility: "hidden",
          opacity: 0,
        }}
        {...(!open ? { inert: "" as unknown as boolean } : {})}
      >
        <nav aria-label="Index">
          <ul>
            {(variant === "home" ? CHAPTERS : []).map((c) => (
              <li key={c.id} data-menu-item className="overflow-hidden">
                <button
                  onClick={() => go(c.id)}
                  className="flex w-full items-baseline gap-5 py-3 text-left"
                >
                  <span className="t-mono tabular-nums">{c.index}</span>
                  <span
                    className="serif text-[clamp(2rem,10vw,3rem)] leading-none"
                    style={{
                      color:
                        active.id === c.id ? "rgb(var(--lime))" : "rgb(var(--text))",
                    }}
                  >
                    {c.label}
                  </span>
                </button>
              </li>
            ))}
            {variant === "project" && (
              <li data-menu-item>
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="serif text-[clamp(2rem,10vw,3rem)] no-underline"
                >
                  ← Index
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
};
