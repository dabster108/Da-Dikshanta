import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * EasterEggs — the things hidden inside the portfolio.
 *
 *   - A console signature on first load, for anyone who opens devtools.
 *   - The Konami code (↑↑↓↓←→←→ba) triggers a brief "ACCESS GRANTED" flash
 *     and reveals a hidden Caesar-shifted message the visitor can decode.
 *
 * Nothing here is obvious. The feeling should be: "there are things hidden
 * inside this portfolio."
 */

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
];

// A hidden message, Caesar-shifted by 7. ROT7 of "WELL DONE — YOU FOUND ME" is:
// "WTSS KVUL — FVB MVBUK TL". (Computed below at runtime so it stays correct.)
const PLAIN = "WELL DONE — YOU FOUND ME";
const shift = (s: string, k: number) =>
  s.split("").map((ch) => {
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) return String.fromCharCode(((c - 65 + k) % 26) + 65);
    return ch;
  }).join("");

const EasterEggs = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Console signature.
    const styles = [
      "color: hsl(245 90% 68%)",
      "font-family: monospace",
      "font-size: 12px",
    ].join(";");
    console.log("%cSYNAPTIC.CORE — v1.0", styles);
    console.log(
      "%cYou found the console. Try the Konami code, or type `help` in the terminal (backtick `).",
      "color: hsl(220 10% 65%); font-family: monospace;",
    );
    console.log(
      "%cHidden ciphertext (ROT?): " + shift(PLAIN, 7),
      "color: hsl(35 95% 60%); font-family: monospace;",
    );

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[progress]) {
        const next = progress + 1;
        setProgress(next);
        if (next === KONAMI.length) {
          setUnlocked(true);
          setProgress(0);
          setTimeout(() => setUnlocked(false), 4200);
        }
      } else if (key === KONAMI[0]) {
        setProgress(1);
      } else {
        setProgress(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [progress]);

  return (
    <AnimatePresence>
      {unlocked && (
        <motion.div
          className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="rounded-xl border border-primary-glow/40 bg-card/80 px-8 py-6 text-center backdrop-blur-md"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary-glow">
              access granted
            </p>
            <p className="mt-3 font-heading text-xl text-foreground">
              You found a hidden layer.
            </p>
            <p className="mt-2 font-mono text-xs text-amber-200/80">
              ciphertext: {shift(PLAIN, 7)}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
              decode with a Caesar shift of 7
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EasterEggs;
