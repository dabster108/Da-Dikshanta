import { useEffect, useState } from "react";

/**
 * Recommendation Engine demo — pick a seed item; the node graph lights up its
 * nearest neighbours and the recommendation list updates.
 */
type Item = { id: string; label: string; x: number; y: number; related: string[] };

const ITEMS: Item[] = [
  { id: "cv", label: "Computer Vision", x: 20, y: 30, related: ["slam", "edge"] },
  { id: "slam", label: "SLAM", x: 55, y: 18, related: ["cv", "robotics"] },
  { id: "edge", label: "Edge Inference", x: 50, y: 55, related: ["cv", "quant"] },
  { id: "robotics", label: "Robotics", x: 82, y: 30, related: ["slam", "control"] },
  { id: "control", label: "Control", x: 80, y: 70, related: ["robotics", "rl"] },
  { id: "rl", label: "Reinforcement L.", x: 45, y: 82, related: ["control", "agents"] },
  { id: "agents", label: "Multi-Agent", x: 18, y: 70, related: ["rl", "nlp"] },
  { id: "nlp", label: "NLP", x: 20, y: 50, related: ["agents", "cv"] },
];

export const RecommendationDemo = () => {
  const [seed, setSeed] = useState<string | null>("cv");

  const active = seed ? new Set([seed, ...(ITEMS.find((i) => i.id === seed)?.related ?? [])]) : new Set();

  return (
    <div>
      <svg viewBox="0 0 100 100" className="aspect-square w-full rounded-xl border border-white/10 bg-slate-900">
        {/* Edges */}
        {ITEMS.flatMap((a) =>
          a.related.map((rid) => {
            const b = ITEMS.find((i) => i.id === rid)!;
            const lit = active.has(a.id) && active.has(b.id);
            return (
              <line
                key={`${a.id}-${rid}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={lit ? "hsl(214 100% 62% / 0.7)" : "hsl(0 0% 100% / 0.06)"}
                strokeWidth={lit ? 0.8 : 0.4}
              />
            );
          }),
        )}
        {/* Nodes */}
        {ITEMS.map((it) => {
          const on = active.has(it.id);
          const isSeed = it.id === seed;
          return (
            <g key={it.id} className="cursor-pointer" onClick={() => setSeed(it.id)}>
              <circle
                cx={it.x}
                cy={it.y}
                r={isSeed ? 4 : 2.8}
                fill={on ? "hsl(214 100% 62%)" : "hsl(220 20% 30%)"}
                stroke="hsl(214 100% 74% / 0.5)"
                strokeWidth={isSeed ? 1 : 0.4}
              />
              <text
                x={it.x}
                y={it.y - 5}
                fontSize="3"
                fontFamily="monospace"
                textAnchor="middle"
                fill={on ? "hsl(214 100% 80%)" : "hsl(210 16% 60%)"}
              >
                {it.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3">
        <div className="label-mono mb-2">recommendations for {ITEMS.find((i) => i.id === seed)?.label ?? "—"}</div>
        <div className="flex flex-wrap gap-2">
          {(ITEMS.find((i) => i.id === seed)?.related ?? []).map((rid) => (
            <button
              key={rid}
              onClick={() => setSeed(rid)}
              className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary transition-colors hover:bg-primary/20"
            >
              {ITEMS.find((i) => i.id === rid)?.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
