import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrambleText from "@/components/ScrambleText";

/**
 * BootSequence — the cinematic cold-open.
 *
 * Plays once per session (sessionStorage flag). Stages:
 *   1. Near-black. A scanline sweep. System diagnostics scramble in one by one.
 *   2. A point of light blooms and connects into a small network.
 *   3. The thesis assembles: BUILDING / INTELLIGENT / SYSTEMS.
 *   4. The name resolves. Then the whole thing lifts away to reveal the world.
 *
 * Reduced-motion visitors skip it entirely — they land straight in.
 */

const DIAGNOSTICS = [
  "SYSTEM INITIALIZING",
  "VISION MODULE · ONLINE",
  "AGENT · ACTIVE",
  "ENCRYPTION · READY",
  "NEURAL PROCESS · RUNNING",
  "ROBOT · STANDBY",
];

const STORAGE_KEY = "synaptic.boot.played";

interface Props {
  onComplete: () => void;
}

const BootSequence = ({ onComplete }: Props) => {
  const [stage, setStage] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      window.dispatchEvent(new CustomEvent("synaptic:boot-complete"));
      onComplete();
      return;
    }

    const D = DIAGNOSTICS.length;
    const timers: number[] = [];
    // Stages: 0 diagnostics, 1 network bloom, 2 thesis, 3 name, 4 lift.
    DIAGNOSTICS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStage(0), i * 180));
    });
    const t1 = D * 180 + 200;   // network bloom
    const t2 = t1 + 700;        // thesis
    const t3 = t2 + 900;        // name
    const tGone = t3 + 700;     // lift
    const tDone = tGone + 600;   // unmount
    timers.push(window.setTimeout(() => setStage(1), t1));
    timers.push(window.setTimeout(() => setStage(2), t2));
    timers.push(window.setTimeout(() => setStage(3), t3));
    timers.push(
      window.setTimeout(() => {
        setGone(true);
        sessionStorage.setItem(STORAGE_KEY, "1");
      }, tGone),
    );
    timers.push(
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("synaptic:boot-complete"));
        onComplete();
      }, tDone),
    );

    // Safety net: no matter what, never leave the visitor stuck behind the
    // overlay. Force it away after 5.5s.
    const safety = window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      window.dispatchEvent(new CustomEvent("synaptic:boot-complete"));
      setGone(true);
      onComplete();
    }, 5500);
    timers.push(safety);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[hsl(230_35%_2%)]"
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* scan sweep */}
          <div className="atmos-scanlines" style={{ opacity: 0.06 }} />
          <div className="scan-sweep absolute inset-0" />

          {/* diagnostics column */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6">
            {stage <= 1 &&
              DIAGNOSTICS.map((line, i) => {
                const visible = stage === 0 || stage === 1;
                const shown = visible && i <= Math.min(DIAGNOSTICS.length - 1, Math.floor((stage === 0 ? 99 : 99)));
                return (
                  <motion.div
                    key={line}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{
                      opacity: shown ? (i <= 4 ? 0.5 : 0.25) : 0,
                      y: 0,
                    }}
                    transition={{ duration: 0.4 }}
                    className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary-glow/70 sm:text-[11px]"
                  >
                    <ScrambleText text={line} speed={10} delay={i * 60} />
                  </motion.div>
                );
              })}
          </div>

          {/* network bloom */}
          {stage >= 1 && (
            <motion.svg
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 1 ? 0.7 : 0 }}
              transition={{ duration: 0.8 }}
            >
              {Array.from({ length: 14 }).map((_, i) => {
                const a = (i / 14) * Math.PI * 2;
                const x = 100 + Math.cos(a) * 60;
                const y = 100 + Math.sin(a) * 60;
                return (
                  <g key={i}>
                    <motion.line
                      x1="100"
                      y1="100"
                      x2={x}
                      y2={y}
                      stroke="hsl(245 90% 68%)"
                      strokeWidth="0.4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.5 }}
                      transition={{ duration: 0.8, delay: 0.1 + i * 0.04 }}
                    />
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="1.4"
                      fill="hsl(250 95% 78%)"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.04 }}
                    />
                  </g>
                );
              })}
              <motion.circle
                cx="100"
                cy="100"
                r="3"
                fill="hsl(250 95% 78%)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.svg>
          )}

          {/* thesis + name */}
          {stage >= 2 && (
            <div className="relative z-10 flex flex-col items-center px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="font-heading text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl"
              >
                <div className="overflow-hidden">
                  <div className={stage >= 2 ? "mask-reveal" : ""}>BUILDING</div>
                </div>
                <div className="overflow-hidden">
                  <div
                    className={stage >= 2 ? "mask-reveal" : ""}
                    style={{ animationDelay: "0.12s" }}
                  >
                    INTELLIGENT
                  </div>
                </div>
                <div className="overflow-hidden">
                  <div
                    className={stage >= 2 ? "mask-reveal" : ""}
                    style={{ animationDelay: "0.24s" }}
                  >
                    SYSTEMS.
                  </div>
                </div>
              </motion.div>

              {stage >= 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-8 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground sm:text-[12px]"
                >
                  <ScrambleText text="DIKSHANTA CHAPAGAIN" speed={28} />
                  <div className="mt-2 text-[10px] tracking-[0.35em] text-primary-glow/60">
                    <ScrambleText text="AI · SOFTWARE · ROBOTICS · SYSTEMS" speed={14} delay={300} />
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* corner readout */}
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50">
            <span>SYNAPTIC.CORE</span>
            <span className="flicker">● BOOT</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Has the boot sequence already played this session? */
export const bootAlreadyPlayed = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export default BootSequence;
