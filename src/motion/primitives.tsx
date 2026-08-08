import {
  createElement,
  useCallback,
  useEffect,
 useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "./useReducedMotion";
import { CHAR_STAGGER, MAGNETIC, SPOTLIGHT_LERP, TEXT_REVEAL } from "./tokens";

/* -------------------------------------------------------------------------- */
/* TextReveal — blur(12px)→sharp, opacity 0→1, y 24→0, 0.9s power3.out.        */
/* Fires once when the element enters the viewport. On reduced-motion the    */
/* text just appears.                                                          */
/* -------------------------------------------------------------------------- */

type TextRevealProps = {
  as?: ElementType;
  children: string;
  className?: string;
  /** Split into characters and stagger; otherwise animate the whole node. */
  split?: boolean;
  delay?: number;
};

export const TextReveal = ({
  as = "span",
  children,
  className,
  split = false,
  delay = 0,
}: TextRevealProps) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      gsap.set(el, { opacity: 1, filter: "none", y: 0 });
      return;
    }

    const targets = split
      ? el.querySelectorAll("[data-char]")
      : [el];

    gsap.set(el, { opacity: 1 });
    if (split) {
      gsap.from(targets, {
        opacity: 0,
        y: TEXT_REVEAL.y,
        filter: `blur(${TEXT_REVEAL.blur}px)`,
        duration: TEXT_REVEAL.duration,
        ease: TEXT_REVEAL.ease,
        stagger: CHAR_STAGGER,
        delay,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    } else {
      gsap.from(el, {
        opacity: 0,
        y: TEXT_REVEAL.y,
        filter: `blur(${TEXT_REVEAL.blur}px)`,
        duration: TEXT_REVEAL.duration,
        ease: TEXT_REVEAL.ease,
        delay,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }
  }, [reduced, split, delay]);

  const content: ReactNode = split
    ? children.split("").map((ch, i) => (
        <span
          key={i}
          data-char
          style={{ display: "inline-block", whiteSpace: ch === " " ? "pre" : "normal" }}
        >
          {ch}
        </span>
      ))
    : children;

  return createElement(as, { ref, className }, content);
};

/* -------------------------------------------------------------------------- */
/* MagneticButton — translates toward the cursor when within 80px, snaps back. */
/* -------------------------------------------------------------------------- */

type MagneticButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
  ariaLabel?: string;
};

export const MagneticButton = ({
  children,
  onClick,
  className,
  href,
  ariaLabel,
}: MagneticButtonProps) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced || !ref.current) return;
      const el = ref.current;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > MAGNETIC.radius + Math.max(rect.width, rect.height) / 2) return;
      gsap.to(el, {
        x: dx * MAGNETIC.pull,
        y: dy * MAGNETIC.pull,
        duration: MAGNETIC.duration,
        ease: MAGNETIC.ease,
        overwrite: true,
      });
    },
    [reduced],
  );

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: MAGNETIC.duration,
      ease: MAGNETIC.ease,
      overwrite: true,
    });
  }, []);

  const props = {
    ref,
    className,
    onClick,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    "aria-label": ariaLabel,
  };

  return href
    ? createElement("a", { ...props, href }, children)
    : createElement("button", props, children);
};

/* -------------------------------------------------------------------------- */
/* CursorSpotlight — fixed radial gradient that lerps toward the pointer.     */
/* -------------------------------------------------------------------------- */

export const CursorSpotlight = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    setEnabled(true);
    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    let raf = 0;
    const loop = () => {
      current.current.x += (target.current.x - current.current.x) * SPOTLIGHT_LERP;
      current.current.y += (target.current.y - current.current.y) * SPOTLIGHT_LERP;
      ref.current!.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "640px",
        height: "640px",
        pointerEvents: "none",
        zIndex: 4,
        background: `radial-gradient(closest-side, hsl(214 100% 62% / 0.10), transparent 70%)`,
        mixBlendMode: "screen",
      }}
    />
  );
};
