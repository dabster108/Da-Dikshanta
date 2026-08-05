import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrambleText from "@/components/ScrambleText";
import { useFieldLog } from "@/contexts/FieldLogContext";

/**
 * Robotics — a hardcoded perception pipeline.
 *
 * A scripted sequence: a ball appears → the camera sees it → a bounding region
 * locks on → the arm plans a path → the gripper retrieves it. The visitor steps
 * through the stages. Deterministic, no real perception — but it reads like a
 * real robotics pipeline: CAMERA → DETECTION → POSITION → NAVIGATION → RETRIEVAL.
 */

type Stage = "idle" | "camera" | "detection" | "position" | "navigation" | "retrieval" | "done";
const ORDER: Stage[] = ["camera", "detection", "position", "navigation", "retrieval", "done"];
const LABEL: Record<Stage, string> = {
  idle: "STANDBY",
  camera: "CAMERA",
  detection: "DETECTION",
  position: "POSITION",
  navigation: "NAVIGATION",
  retrieval: "RETRIEVAL",
  done: "COMPLETE",
};

const RoboticsView = () => {
  const [stage, setStage] = useState<Stage>("idle");
  const { markConceptDiscovered } = useFieldLog();

  const advance = () => {
    setStage((cur) => {
      if (cur === "idle") return "camera";
      const i = ORDER.indexOf(cur);
      const next = i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : cur;
      if (next !== cur) markConceptDiscovered(`robotics:${next}`);
      return next;
    });
  };

  const reset = () => setStage("idle");

  // Ball target position (fixed in the scene).
  const ball = { x: 70, y: 78 };
  const armBase = { x: 22, y: 80 };
  // Gripper tip moves toward the ball during navigation/retrieval.
  const gripper = stage === "retrieval" || stage === "done" ? ball : stage === "navigation" ? { x: 48, y: 60 } : { x: 30, y: 55 };
  const boxOpen = stage === "retrieval" || stage === "done";

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">05 — Robotics</p>
        <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
          <ScrambleText text="PERCEIVE. PLAN. ACT." speed={20} />
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          A scripted perception-to-action pipeline. Step through each stage and watch the robot locate and retrieve a target. Hardcoded — no real inference — but the shape is the same one a real pipeline takes.
        </p>
      </motion.div>

      {/* Stage strip */}
      <div className="mt-10 flex flex-wrap items-center gap-1.5">
        {ORDER.map((s, i) => {
          const active = stage === s;
          const passed = stage !== "idle" && ORDER.indexOf(stage) > i;
          return (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full transition-colors ${active ? "bg-cyan-300" : passed ? "bg-cyan-300/40" : "bg-white/15"}`} />
              <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${active ? "text-cyan-200" : "text-muted-foreground/50"}`}>
                {LABEL[s]}
              </span>
              {i < ORDER.length - 1 && <span className="h-px w-4 bg-white/10" />}
            </div>
          );
        })}
      </div>

      {/* Scene */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[hsl(225_30%_5%)]">
        <svg viewBox="0 0 100 90" className="aspect-[16/9] w-full">
          {/* floor grid */}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`v${i}`} x1={i * 10} y1="40" x2={i * 10} y2="90" stroke="hsl(200 80% 60% / 0.06)" strokeWidth="0.3" />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={40 + i * 10} x2="100" y2={40 + i * 10} stroke="hsl(200 80% 60% / 0.06)" strokeWidth="0.3" />
          ))}

          {/* camera frustum — visible during camera/detection */}
          {(stage === "camera" || stage === "detection") && (
            <motion.polygon
              points={`${armBase.x},${armBase.y - 8} 100,45 100,85`}
              fill="hsl(175 80% 55% / 0.08)"
              stroke="hsl(175 80% 55% / 0.3)"
              strokeWidth="0.3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* ball target */}
          <motion.circle
            cx={ball.x}
            cy={ball.y}
            r="2.2"
            fill="hsl(35 95% 60%)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: stage === "idle" ? 0 : 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* bounding box — detection stage onward */}
          {stage !== "idle" && stage !== "camera" && (
            <motion.rect
              x={ball.x - 4}
              y={ball.y - 4}
              width="8"
              height="8"
              fill="none"
              stroke="hsl(175 80% 55%)"
              strokeWidth="0.4"
              strokeDasharray="1.5 1"
              initial={{ opacity: 0, scale: 1.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            />
          )}

          {/* planned path — navigation stage */}
          {stage === "navigation" && (
            <motion.path
              d={`M ${armBase.x} ${armBase.y - 8} Q 35 50 ${gripper.x} ${gripper.y}`}
              fill="none"
              stroke="hsl(175 80% 55% / 0.6)"
              strokeWidth="0.4"
              strokeDasharray="1.5 1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7 }}
            />
          )}

          {/* robot arm — base + arm segments to gripper */}
          <line x1={armBase.x} y1={armBase.y} x2={armBase.x} y2={armBase.y - 8} stroke="hsl(220 14% 60%)" strokeWidth="1.2" />
          <motion.line
            x1={armBase.x}
            y1={armBase.y - 8}
            x2={gripper.x}
            y2={gripper.y}
            stroke="hsl(220 14% 75%)"
            strokeWidth="1"
            initial={false}
            animate={{ x2: gripper.x, y2: gripper.y }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* gripper */}
          <motion.g
            initial={false}
            animate={{ x: gripper.x - armBase.x, y: gripper.y - (armBase.y - 8) }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <line x1={armBase.x} y1={armBase.y - 8} x2={armBase.x - 1.5} y2={armBase.y - 10} stroke="hsl(220 14% 75%)" strokeWidth="0.6" />
            <line x1={armBase.x} y1={armBase.y - 8} x2={armBase.x + 1.5} y2={armBase.y - 10} stroke="hsl(220 14% 75%)" strokeWidth="0.6" />
            <AnimatePresence>
              {boxOpen && (
                <motion.line
                  x1={armBase.x - 1.5}
                  y1={armBase.y - 10}
                  x2={armBase.x + 1.5}
                  y2={armBase.y - 10}
                  stroke="hsl(175 80% 55%)"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                />
              )}
            </AnimatePresence>
          </motion.g>
          <circle cx={armBase.x} cy={armBase.y} r="1.6" fill="hsl(220 14% 50%)" />

          {/* HUD readout */}
          <text x="3" y="6" className="font-mono" fontSize="2.4" fill="hsl(175 80% 55% / 0.7)">
            {LABEL[stage]}
          </text>
          {stage === "detection" && (
            <text x="60" y="74" className="font-mono" fontSize="2.2" fill="hsl(175 80% 65%)">
              target: 0.97
            </text>
          )}
          {stage === "position" && (
            <text x="55" y="74" className="font-mono" fontSize="2.2" fill="hsl(175 80% 65%)">
              x:0.70 y:0.78
            </text>
          )}
        </svg>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={advance}
          disabled={stage === "done"}
          className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1.5 text-xs text-cyan-100 transition-colors hover:bg-cyan-400/20 disabled:opacity-40"
        >
          {stage === "idle" ? "Run pipeline" : stage === "done" ? "Complete" : "Next stage →"}
        </button>
        <button onClick={reset} className="rounded-full border border-white/12 px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
          Reset
        </button>
      </div>
    </section>
  );
};

export default RoboticsView;
