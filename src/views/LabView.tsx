import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useFieldLog } from "@/contexts/FieldLogContext";
import { NeuralNetDemo, default as CVLightDemo } from "@/components/LabMore";

interface Point {
  x: number;
  y: number;
}

/**
 * Lab — the fourth region.
 *
 * A shelf of small, self-contained interactive simulations. Each one shows
 * the *shape* of a technical concept — a decision boundary, a path through a
 * grid, a neural forward pass — not a real inference. Four are live here; the
 * rest are listed as "in the next pass" so the shelf reads as a real place
 * with more to find, without inventing fake demos.
 */

const experiments = [
  { id: "boundary", title: "Decision Boundary", kind: "live" as const },
  { id: "pathfinding", title: "Pathfinding", kind: "live" as const },
  { id: "neural", title: "Neural Network", kind: "live" as const },
  { id: "cv-light", title: "CV Exposure", kind: "live" as const },
  { id: "detection", title: "Object Detection", kind: "soon" as const },
  { id: "fusion", title: "Sensor Fusion", kind: "soon" as const },
  { id: "agent", title: "Agent Decision", kind: "soon" as const },
];

const LabView = () => {
  const [active, setActive] = useState<string>("boundary");
  const { markConceptDiscovered } = useFieldLog();

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary-glow/80">
          03 — Lab
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
          Small interactive concepts. Deterministic, not live inference.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          The point isn't a working ML system in the browser — it's showing I
          understand the shape of these things: where a decision boundary
          lives, how a pathfinder explores, what an activation heatmap is
          trying to say.
        </p>
      </motion.div>

      <div className="mt-12 flex flex-wrap gap-2">
        {experiments.map((exp) => (
          <button
            key={exp.id}
            onClick={() => exp.kind === "live" && setActive(exp.id)}
            disabled={exp.kind !== "live"}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              active === exp.id
                ? "border-primary-glow/60 bg-primary-glow/15 text-foreground"
                : exp.kind === "live"
                  ? "border-white/12 text-muted-foreground hover:text-foreground"
                  : "border-white/8 text-muted-foreground/40"
            }`}
          >
            {exp.title}
            {exp.kind === "soon" && (
              <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.15em]">
                soon
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm">
        {active === "boundary" && <DecisionBoundarySim onDiscover={markConceptDiscovered} concept="boundary" />}
        {active === "pathfinding" && <PathfindingSim onDiscover={markConceptDiscovered} concept="pathfinding" />}
        {active === "neural" && <NeuralNetDemo />}
        {active === "cv-light" && <CVLightDemo />}
      </div>
    </section>
  );
};

/* --------------------------------------------- Decision boundary --- */

const DecisionBoundarySim = ({
  onDiscover,
  concept,
}: {
  onDiscover: (id: string) => void;
  concept: string;
}) => {
  const [points, setPoints] = useState<Point[]>([
    { x: 0.3, y: 0.4 },
    { x: 0.7, y: 0.6 },
    { x: 0.25, y: 0.7 },
    { x: 0.75, y: 0.3 },
  ]);
  const boxRef = useRef<HTMLDivElement>(null);

  // Hardcoded boundary: a sine curve. A point is "class A" if it's above
  // the curve at its x. Illustrative — not a trained classifier.
  const boundary = (x: number) => 0.5 + 0.18 * Math.sin(x * Math.PI * 2.5);

  const classify = (p: Point) => (p.y > boundary(p.x) ? "A" : "B");

  const onMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return;
    addPoint(e);
  };
  const addPoint = (e: React.PointerEvent) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    setPoints((p) => [...p, { x, y }]);
    onDiscover(`lab:${concept}`);
  };

  return (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">
        Click and drag on the plane to drop points. The boundary is a fixed
        sine curve; points above it are class A, below it class B.
      </p>
      <div
        ref={boxRef}
        onPointerDown={addPoint}
        onPointerMove={onMove}
        className="relative mt-4 aspect-[16/10] w-full cursor-crosshair overflow-hidden rounded-xl bg-[#0a0c10]"
      >
        <svg viewBox="0 0 100 62.5" className="absolute inset-0 h-full w-full">
          {/* Boundary curve. */}
          <path
            d={Array.from({ length: 101 }, (_, i) => {
              const x = i;
              const y = (1 - boundary(x / 100)) * 62.5;
              return `${i === 0 ? "M" : "L"}${x} ${y}`;
            }).join(" ")}
            fill="none"
            stroke="#9d8cf2"
            strokeWidth="0.6"
            strokeDasharray="2 2"
          />
          {/* Points. */}
          {points.map((p, i) => {
            const cls = classify(p);
            return (
              <circle
                key={i}
                cx={p.x * 100}
                cy={(1 - p.y) * 62.5}
                r="1.4"
                fill={cls === "A" ? "#6ee7ff" : "#b7a6ff"}
                stroke="#fff"
                strokeWidth="0.3"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          <span>class A · cyan</span>
          <span>class B · violet</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground/80">
          {points.length} points · boundary: y = 0.5 + 0.18·sin(2.5πx)
        </p>
        <button
          onClick={() => setPoints([])}
          className="rounded-full border border-white/12 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

/* ----------------------------------------------------- Pathfinding --- */

const PathfindingSim = ({
  onDiscover,
  concept,
}: {
  onDiscover: (id: string) => void;
  concept: string;
}) => {
  const COLS = 20;
  const ROWS = 12;
  const [start, setStart] = useState<{ r: number; c: number }>({ r: 2, c: 2 });
  const [end, setEnd] = useState<{ r: number; c: number }>({ r: 9, c: 17 });
  const [walls, setWalls] = useState<Set<string>>(new Set(["6-8", "6-9", "6-10", "6-11"]));
  const [mode, setMode] = useState<"wall" | "start" | "end">("wall");

  const key = (r: number, c: number) => `${r}-${c}`;

  // BFS — deterministic, real algorithm.
  const path = (() => {
    const queue: { r: number; c: number }[] = [start];
    const seen = new Set<string>([key(start.r, start.c)]);
    const parent = new Map<string, string>();
    while (queue.length) {
      const cur = queue.shift()!;
      if (cur.r === end.r && cur.c === end.c) break;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = cur.r + dr;
        const nc = cur.c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        const k = key(nr, nc);
        if (seen.has(k) || walls.has(k)) continue;
        seen.add(k);
        parent.set(k, key(cur.r, cur.c));
        queue.push({ r: nr, c: nc });
      }
    }
    const pathSet = new Set<string>();
    let curK = key(end.r, end.c);
    if (!parent.has(curK) && curK !== key(start.r, start.c)) return pathSet;
    while (curK && curK !== key(start.r, start.c)) {
      pathSet.add(curK);
      curK = parent.get(curK)!;
    }
    return pathSet;
  })();

  const onCell = (r: number, c: number) => {
    onDiscover(`lab:${concept}`);
    if (mode === "start") setStart({ r, c });
    else if (mode === "end") setEnd({ r, c });
    else {
      const k = key(r, c);
      setWalls((prev) => {
        const next = new Set(prev);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        return next;
      });
    }
  };

  return (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">
        BFS pathfinding on a grid. Toggle a mode, then click cells. The path
        updates live.
      </p>
      <div className="mt-4 flex gap-2">
        {(["wall", "start", "end"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
              mode === m
                ? "border-primary-glow/60 bg-primary-glow/15 text-foreground"
                : "border-white/12 text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "wall" ? "Add walls" : `Move ${m}`}
          </button>
        ))}
      </div>
      <div
        className="mt-4 grid w-full gap-px overflow-hidden rounded-xl bg-white/5"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const k = key(r, c);
          const isStart = start.r === r && start.c === c;
          const isEnd = end.r === r && end.c === c;
          const isWall = walls.has(k);
          const isPath = path.has(k);
          return (
            <button
              key={k}
              onClick={() => onCell(r, c)}
              className={`aspect-square transition-colors ${
                isStart
                  ? "bg-primary-glow"
                  : isEnd
                    ? "bg-amber-400"
                    : isWall
                      ? "bg-white/25"
                      : isPath
                        ? "bg-primary/40"
                        : "bg-card/40 hover:bg-white/10"
              }`}
              aria-label={`cell ${r},${c}`}
            />
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground/80">
        {path.size > 0
          ? `Path length: ${path.size + 1} cells`
          : "No path found — walls block the route."}
      </p>
    </div>
  );
};

export default LabView;
