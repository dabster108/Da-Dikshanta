import { useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Project-specific interactive demonstrations.
 *
 * All hardcoded and deterministic — illustrations of the concept behind each
 * project, not live inferences. No backend, no real ML. The point is to show
 * the visitor the *shape* of the work: a heatmap over a scan, a path through
 * a tree, a similarity graph around a track.
 */

export type DemoKind = "tb-heatmap" | "decision-tree" | "recommender-graph" | "none";

export const ProjectDemo = ({ kind }: { kind: DemoKind }) => {
  switch (kind) {
    case "tb-heatmap":
      return <TBHeatmapDemo />;
    case "decision-tree":
      return <DecisionTreeDemo />;
    case "recommender-graph":
      return <RecommenderGraphDemo />;
    default:
      return null;
  }
};

/* ----------------------------------------------------------------- TB --- */

/**
 * Hover the scan; a hardcoded "activation" heatmap blooms under the cursor,
 * peaking on the lower-right lung field — the same shape a Grad-CAM would
 * show for a TB-positive X-ray, without claiming to be one.
 */
const TBHeatmapDemo = () => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    setPos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  // Heatmap peaks toward the lower-right lung field. Deterministic.
  const heat = (x: number, y: number) => {
    if (x == null || y == null) return 0;
    const cx = 0.62;
    const cy = 0.6;
    const d = Math.hypot(x - cx, y - cy);
    return Math.max(0, 1 - d * 1.8);
  };

  return (
    <div className="relative">
      <div
        ref={boxRef}
        onPointerMove={onMove}
        onPointerLeave={() => setPos(null)}
        className="relative aspect-[4/3] w-full cursor-crosshair overflow-hidden bg-[#0a0c10]"
      >
        {/* Stylized chest X-ray — two lung fields + spine + heart shadow. */}
        <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="lung" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a2233" />
              <stop offset="100%" stopColor="#0a0c10" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill="url(#lung)" />
          {/* Spine */}
          <rect x="197" y="20" width="6" height="260" rx="3" fill="#0d1018" />
          {/* Left lung */}
          <path
            d="M170 60 C120 80 90 140 95 220 C100 270 150 275 165 240 C175 215 175 130 170 60 Z"
            fill="#12182a"
            stroke="#1e2a44"
            strokeWidth="1.5"
          />
          {/* Right lung */}
          <path
            d="M230 60 C280 80 310 140 305 220 C300 270 250 275 235 240 C225 215 225 130 230 60 Z"
            fill="#12182a"
            stroke="#1e2a44"
            strokeWidth="1.5"
          />
          {/* Heart shadow */}
          <ellipse cx="215" cy="170" rx="22" ry="30" fill="#0d1018" />
        </svg>

        {/* Activation heatmap overlay. */}
        {pos && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-200"
            style={{
              opacity: 0.85,
              background: `radial-gradient(circle at ${pos.x * 100}% ${pos.y * 100}%, rgba(255,90,40,${heat(pos.x, pos.y)}) 0%, rgba(255,160,40,0.4) 30%, transparent 60%)`,
              mixBlendMode: "screen",
            }}
          />
        )}

        {/* Readout */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          <span>Chest X-ray · illustrative</span>
          <span className={heat(pos?.x ?? 0, pos?.y ?? 0) > 0.4 ? "text-amber-400" : ""}>
            {pos ? `activation ${Math.round(heat(pos.x, pos.y) * 100)}%` : "hover to scan"}
          </span>
        </div>
      </div>
      <DemoCaption>
        A Grad-CAM-style heatmap. The model's attention peaks on the lower
        lung field — where TB lesions concentrate. Not a real inference.
      </DemoCaption>
    </div>
  );
};

/* ------------------------------------------------------- Decision tree --- */

interface TreeNode {
  id: string;
  question: string;
  options: { label: string; next: string }[];
  leaf?: string;
}

const TREE: Record<string, TreeNode> = {
  root: {
    id: "root",
    question: "Which do you enjoy more?",
    options: [
      { label: "Building math models", next: "math" },
      { label: "Building products", next: "product" },
    ],
  },
  math: {
    id: "math",
    question: "Prefer reasoning over data, or over code?",
    options: [
      { label: "Over data", next: "data" },
      { label: "Over code", next: "ml-eng" },
    ],
  },
  product: {
    id: "product",
    question: "Closer to the user, or to the system?",
    options: [
      { label: "To the user", next: "frontend" },
      { label: "To the system", next: "backend" },
    ],
  },
  data: { id: "data", question: "", options: [], leaf: "Data Science" },
  "ml-eng": { id: "ml-eng", question: "", options: [], leaf: "ML Engineering" },
  frontend: { id: "frontend", question: "", options: [], leaf: "Frontend / UI" },
  backend: { id: "backend", question: "", options: [], leaf: "Backend / Systems" },
};

const DecisionTreeDemo = () => {
  const [path, setPath] = useState<string[]>(["root"]);
  const current = TREE[path[path.length - 1]];

  const reset = () => setPath(["root"]);
  const choose = (next: string) => setPath((p) => [...p, next]);

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center gap-1.5">
        {path.map((nodeId, i) => (
          <span key={nodeId} className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                i === path.length - 1
                  ? "bg-primary-glow"
                  : "bg-white/25"
              }`}
            />
            {i < path.length - 1 && <span className="h-px w-4 bg-white/15" />}
          </span>
        ))}
      </div>

      {current.leaf ? (
        <div className="py-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Suggested path
          </p>
          <p className="mt-2 font-heading text-2xl text-foreground">
            {current.leaf}
          </p>
          <button
            onClick={reset}
            className="mt-5 rounded-full border border-white/15 px-4 py-1.5 text-xs text-foreground transition-colors hover:border-primary-glow/50 hover:text-primary-glow"
          >
            Run again
          </button>
        </div>
      ) : (
        <div>
          <p className="text-base text-foreground">{current.question}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {current.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => choose(opt.next)}
                className="rounded-xl border border-white/12 bg-card/40 px-4 py-3 text-sm text-foreground transition-all hover:border-primary-glow/50 hover:bg-primary/10"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <DemoCaption>
        A single path through a Random Forest — the kind of trace FuturePath
        returns, with feature importances as first-class output. Not a real
        inference.
      </DemoCaption>
    </div>
  );
};

/* ------------------------------------------------- Recommender graph --- */

interface Track {
  id: string;
  title: string;
  genre: string;
  energy: number;
  valence: number;
}

const TRACKS: Track[] = [
  { id: "a", title: "Midnight Drive", genre: "synthwave", energy: 0.8, valence: 0.4 },
  { id: "b", title: "Glass Cities", genre: "synthwave", energy: 0.7, valence: 0.5 },
  { id: "c", title: "Paper Moon", genre: "indie folk", energy: 0.3, valence: 0.7 },
  { id: "d", title: "Riverline", genre: "indie folk", energy: 0.4, valence: 0.8 },
  { id: "e", title: "Iron Lung", genre: "post-punk", energy: 0.9, valence: 0.2 },
  { id: "f", title: "Static Bloom", genre: "post-punk", energy: 0.85, valence: 0.3 },
  { id: "g", title: "Solar Drift", genre: "ambient", energy: 0.2, valence: 0.6 },
  { id: "h", title: "Quiet Year", genre: "ambient", energy: 0.25, valence: 0.7 },
];

const sim = (a: Track, b: Track) => {
  const d = Math.hypot(a.energy - b.energy, a.valence - b.valence);
  const genreBoost = a.genre === b.genre ? 0.25 : 0;
  return Math.max(0, 1 - d + genreBoost);
};

const RecommenderGraphDemo = () => {
  const [selected, setSelected] = useState<string>("a");
  const sel = TRACKS.find((t) => t.id === selected)!;

  // 2D layout by energy (x) and valence (y).
  const pos = (t: Track) => ({ x: 8 + t.energy * 84, y: 88 - t.valence * 80 });

  return (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">
        Pick a track. Lines show hybrid similarity (feature distance + genre).
        Thicker = closer.
      </p>

      <svg viewBox="0 0 100 100" className="mt-4 aspect-[5/3] w-full">
        {/* Similarity edges from the selected track. */}
        {TRACKS.filter((t) => t.id !== sel.id).map((t) => {
          const s = Math.max(0.08, sim(sel, t));
          const p1 = pos(sel);
          const p2 = pos(t);
          return (
            <line
              key={t.id}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#9d8cf2"
              strokeWidth={s * 1.2}
              strokeOpacity={0.5 + s * 0.5}
            />
          );
        })}

        {/* Tracks. */}
        {TRACKS.map((t) => {
          const p = pos(t);
          const isSel = t.id === sel.id;
          return (
            <g
              key={t.id}
              onClick={() => setSelected(t.id)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isSel ? 3.2 : 2}
                fill={isSel ? "#b7a6ff" : "#3d3f8f"}
                stroke={isSel ? "#fff" : "none"}
                strokeWidth={isSel ? 0.6 : 0}
              />
              <text
                x={p.x}
                y={p.y - 4}
                textAnchor="middle"
                fontSize="3"
                fill={isSel ? "#e6e6e6" : "#8a8aa0"}
              >
                {t.title}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex flex-wrap gap-2">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              t.id === selected
                ? "border-primary-glow/60 bg-primary-glow/15 text-foreground"
                : "border-white/12 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <DemoCaption>
        A hybrid recommender: feature-space distance (energy × valence) plus a
        genre boost. The selected track pulls its neighbours closer. Not a
        real inference.
      </DemoCaption>
    </div>
  );
};

/* ------------------------------------------------------------- Caption --- */

const DemoCaption = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 border-l-2 border-white/10 pl-3 text-xs leading-relaxed text-muted-foreground/80">
    {children}
  </p>
);
