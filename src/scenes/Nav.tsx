import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "./SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  { id: "landing", label: "Landing", target: "[data-scene='landing']" },
  { id: "story", label: "Story", target: "#story" },
  { id: "projects", label: "Work", target: "#projects" },
  { id: "presence", label: "Presence", target: "#presence" },
  { id: "contact", label: "Contact", target: "#contact" },
];

export const Nav = () => {
  const lineRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState("landing");
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    const ctx = gsap.context(() => {
      gsap.to(line, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          start: 0,
          end: () => document.body.scrollHeight - window.innerHeight,
          scrub: 0.3,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = ITEMS.map((item) => document.querySelector<HTMLElement>(item.target)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target as HTMLElement | undefined;
        const id = top?.dataset.scene;
        if (id) setActive(id);
      },
      { rootMargin: "-38% 0px -48% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const jump = (target: string) => {
    scrollTo(target, { duration: 0.65, offset: -8 });
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-px bg-white/5" aria-hidden>
        <div
          ref={lineRef}
          className="h-full origin-left scale-x-0 bg-accent"
          style={{ boxShadow: "0 0 12px hsl(var(--accent) / 0.6)" }}
        />
      </div>

      <nav
        className={`fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-3 transition-opacity duration-500 sm:flex ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="Section navigation"
      >
        {ITEMS.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => jump(it.target)}
            className="group flex items-center gap-3"
          >
            <span
              className={`label-mono transition-colors duration-200 ${
                active === it.id ? "text-accent" : "text-foreground-mute group-hover:text-foreground"
              }`}
            >
              {it.label}
            </span>
            <span
              className={`h-px transition-all duration-200 ease-expo ${
                active === it.id ? "w-8 bg-accent" : "w-4 bg-foreground-mute/40 group-hover:w-6"
              }`}
            />
          </button>
        ))}
      </nav>
    </>
  );
};
