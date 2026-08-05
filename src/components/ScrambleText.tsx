import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * ScrambleText — a decode/scramble reveal.
 *
 * On mount (or when it scrolls into view) the text starts as random glyphs
 * and resolves left-to-right into the final string, like a system
 * authenticating a label. Respects prefers-reduced-motion (shows the final
 * text immediately). Used for section titles and the boot diagnostics.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/\\|+=~";

interface Props {
  text: string;
  /** ms per character resolved */
  speed?: number;
  /** start delay in ms */
  delay?: number;
  className?: string;
  /** if true, scramble on every in-view; else once */
  once?: boolean;
  as?: "span" | "div" | "h1" | "h2" | "p";
}

const ScrambleText = ({
  text,
  speed = 38,
  delay = 0,
  className,
  once = true,
  as = "span",
}: Props) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, amount: 0.5 });
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number | null>(null);
  const reducedRef = useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (!inView) return;
    if (reducedRef.current) {
      setDisplay(text);
      return;
    }

    let start: number | null = null;
    const total = text.length;
    const duration = speed * total + delay;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(1, Math.max(0, (elapsed - delay) / (duration - delay)));
      const resolved = Math.floor(progress * total);

      let out = "";
      for (let i = 0; i < total; i++) {
        const ch = text[i];
        // Keep spaces and non-alphanumerics stable so words don't jitter.
        if (i < resolved || ch === " " || !/[A-Za-z0-9]/.test(ch)) {
          out += ch;
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setDisplay(out);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(text);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, text, speed, delay]);

  const Tag = as as any;
  return (
    <Tag ref={ref as any} className={className} aria-label={text}>
      {display}
    </Tag>
  );
};

export default ScrambleText;
