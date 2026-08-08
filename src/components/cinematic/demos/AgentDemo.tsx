import { useEffect, useRef, useState } from "react";

/**
 * AI Agent demo — three agents (planner, vision, action) shown as nodes
 * exchanging messages. A reasoning log panel surfaces each agent's decision
 * as it happens.
 */
type Msg = { from: string; to: string; body: string; ts: number };

const AGENTS = [
  { id: "planner", label: "planner", x: 50, y: 18, color: "hsl(214 100% 62%)" },
  { id: "vision", label: "vision", x: 22, y: 72, color: "hsl(180 70% 55%)" },
  { id: "action", label: "action", x: 78, y: 72, color: "hsl(280 70% 65%)" },
];

const SCRIPT: Omit<Msg, "ts">[] = [
  { from: "planner", to: "vision", body: "perceive scene → identify obstacles" },
  { from: "vision", to: "planner", body: "obstacle at (0.6, 0.4), confidence 0.91" },
  { from: "planner", to: "action", body: "route: veer left, reduce speed 0.3" },
  { from: "action", to: "planner", body: "executing — Δθ = -12°, v = 0.7" },
  { from: "planner", to: "vision", body: "re-perceive → confirm path clear" },
  { from: "vision", to: "planner", body: "path clear, confidence 0.96" },
  { from: "planner", to: "action", body: "resume nominal speed" },
];

export const AgentDemo = () => {
  const [log, setLog] = useState<Msg[]>([]);
  const [activeEdge, setActiveEdge] = useState<{ from: string; to: string } | null>(null);
  const idx = useRef(0);

  useEffect(() => {
    const tick = () => {
      const m = SCRIPT[idx.current % SCRIPT.length];
      const msg = { ...m, ts: Date.now() };
      setActiveEdge({ from: m.from, to: m.to });
      setLog((prev) => [...prev.slice(-5), msg]);
      idx.current++;
    };
    tick();
    const id = setInterval(tick, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr]">
      <svg viewBox="0 0 100 90" className="aspect-[10/9] w-full rounded-xl border border-white/10 bg-slate-900">
        {/* Edges */}
        {AGENTS.flatMap((a, i) =>
          AGENTS.slice(i + 1).map((b) => {
            const lit =
              activeEdge &&
              ((activeEdge.from === a.id && activeEdge.to === b.id) ||
                (activeEdge.from === b.id && activeEdge.to === a.id));
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={lit ? "hsl(214 100% 62%)" : "hsl(0 0% 100% / 0.08)"}
                strokeWidth={lit ? 1.2 : 0.5}
              />
            );
          }),
        )}
        {/* Agents */}
        {AGENTS.map((a) => (
          <g key={a.id}>
            <circle cx={a.x} cy={a.y} r="6" fill={a.color} fillOpacity={0.25} stroke={a.color} strokeWidth="1" />
            <circle cx={a.x} cy={a.y} r="2.5" fill={a.color} />
            <text x={a.x} y={a.y + 12} fontSize="4" fontFamily="monospace" textAnchor="middle" fill="hsl(210 16% 75%)">
              {a.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Reasoning log */}
      <div className="rounded-xl border border-white/10 bg-slate-900 p-3 font-mono text-[11px]">
        <div className="label-mono mb-2">reasoning log</div>
        <div className="flex flex-col gap-1.5">
          {log.map((m, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-muted-foreground/60">{new Date(m.ts).toLocaleTimeString([], { hour12: false }).slice(-5)}</span>
              <span className="text-primary">{m.from}</span>
              <span className="text-muted-foreground/60">→</span>
              <span className="text-primary">{m.to}</span>
              <span className="flex-1 text-foreground/80">{m.body}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
