import { useRef, useState } from "react";

/**
 * Additional lab experiments — a neural-network inspector and a computer-vision
 * light-level slider. Hardcoded and deterministic. Mounted by LabView.
 */

/* ------------------------------------------- Neural network inspector --- */
/**
 * A small fixed MLP. Hover a node to highlight its path; click a node to
 * inspect its role (input / weight / activation / output). No real inference —
 * activations are a deterministic squash of the input slider.
 */

interface Node {
  id: string;
  layer: number;
  index: number;
  x: number;
  y: number;
  kind: "input" | "hidden" | "output";
}

const LAYERS = [3, 4, 2];
const WIDTH = 100;
const HEIGHT = 60;

const NODES: Node[] = (() => {
  const out: Node[] = [];
  LAYERS.forEach((count, li) => {
    for (let i = 0; i < count; i++) {
      const x = (li / (LAYERS.length - 1)) * (WIDTH - 16) + 8;
      const y = (HEIGHT / (count + 1)) * (i + 1);
      out.push({
        id: `${li}-${i}`,
        layer: li,
        index: i,
        x,
        y,
        kind: li === 0 ? "input" : li === LAYERS.length - 1 ? "output" : "hidden",
      });
    }
  });
  return out;
})();

const EDGES: { from: Node; to: Node }[] = (() => {
  const e: { from: Node; to: Node }[] = [];
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const a = NODES.filter((n) => n.layer === li);
    const b = NODES.filter((n) => n.layer === li + 1);
    a.forEach((from) => b.forEach((to) => e.push({ from, to })));
  }
  return e;
})();

// Deterministic pseudo-weights so the graph has structure.
const weight = (from: Node, to: Node) =>
  ((Math.sin(from.index * 3.1 + to.index * 1.7 + from.layer) + 1) / 2);

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export const NeuralNetDemo = () => {
  const [input, setInput] = useState(0.5);
  const [hover, setHover] = useState<Node | null>(null);
  const [selected, setSelected] = useState<Node | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Forward pass — deterministic.
  const acts = (() => {
    const a: Record<string, number> = {};
    NODES.filter((n) => n.kind === "input").forEach((n, i) => {
      a[n.id] = [input, 1 - input, Math.abs(input - 0.5) * 2][i] ?? input;
    });
    for (let li = 1; li < LAYERS.length; li++) {
      NODES.filter((n) => n.layer === li).forEach((n) => {
        const incoming = EDGES.filter((e) => e.to.id === n.id);
        const sum = incoming.reduce((s, e) => s + (a[e.from.id] ?? 0) * weight(e.from, n), 0);
        a[n.id] = sigmoid(sum - 0.5);
      });
    }
    return a;
  })();

  const focus = hover ?? selected;
  const litEdges = focus
    ? new Set(
        EDGES.filter((e) => e.from.id === focus.id || e.to.id === focus.id).map((e) => `${e.from.id}|${e.to.id}`),
      )
    : new Set<string>();

  const inspect = selected
    ? {
        role: selected.kind === "input" ? "INPUT" : selected.kind === "output" ? "OUTPUT" : "HIDDEN",
        activation: (acts[selected.id] ?? 0).toFixed(3),
        layer: `L${selected.layer + 1}`,
      }
    : null;

  return (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">
        A small MLP — 3 → 4 → 2. Drag the input slider to propagate activations. Hover a node to trace its connections; click to inspect it.
      </p>

      <div ref={boxRef} className="relative mt-4 aspect-[5/3] w-full overflow-hidden rounded-xl bg-[hsl(230_35%_3%)]">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 h-full w-full">
          {EDGES.map((e) => {
            const lit = litEdges.has(`${e.from.id}|${e.to.id}`);
            const w = weight(e.from, e.to);
            return (
              <line
                key={`${e.from.id}|${e.to.id}`}
                x1={e.from.x}
                y1={e.from.y}
                x2={e.to.x}
                y2={e.to.y}
                stroke={lit ? "hsl(245 90% 68%)" : "hsl(220 14% 100% / 0.08)"}
                strokeWidth={lit ? 0.5 + w * 0.6 : 0.2}
                strokeOpacity={lit ? 0.9 : 0.5}
                style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
              />
            );
          })}
          {NODES.map((n) => {
            const a = acts[n.id] ?? 0;
            const isFocus = focus?.id === n.id;
            return (
              <g
                key={n.id}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected(selected?.id === n.id ? null : n)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isFocus ? 2.6 : 2}
                  fill={`hsl(245 90% ${30 + a * 50}%)`}
                  stroke={isFocus ? "#fff" : "hsl(220 14% 100% / 0.2)"}
                  strokeWidth={isFocus ? 0.4 : 0.2}
                  style={{ transition: "r 0.2s, fill 0.2s" }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={input}
          onChange={(e) => setInput(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60">
          <span>input 0.00</span>
          <span>{input.toFixed(2)}</span>
          <span>input 1.00</span>
        </div>
      </div>

      {inspect && (
        <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px]">
          <div className="rounded-lg border border-white/8 bg-background/40 px-3 py-2">
            <div className="text-muted-foreground/60">role</div>
            <div className="text-foreground">{inspect.role}</div>
          </div>
          <div className="rounded-lg border border-white/8 bg-background/40 px-3 py-2">
            <div className="text-muted-foreground/60">layer</div>
            <div className="text-foreground">{inspect.layer}</div>
          </div>
          <div className="rounded-lg border border-white/8 bg-background/40 px-3 py-2">
            <div className="text-muted-foreground/60">activation</div>
            <div className="text-primary-glow">{inspect.activation}</div>
          </div>
        </div>
      )}

      <p className="mt-4 border-l-2 border-white/10 pl-3 text-xs leading-relaxed text-muted-foreground/80">
        Activations are a deterministic sigmoid squash — not a trained network. The point is the shape: inputs flow forward, weights gate each edge, and a node's activation is a weighted sum passed through a nonlinearity.
      </p>
    </div>
  );
};

/* ---------------------------------------------------- CV light slider --- */
/**
 * A simulated camera feed. Drag the exposure slider from LOW LIGHT → NORMAL
 * → BRIGHT. The detection confidence and the bounding box change with it —
 * illustrating how lighting drives a perception pipeline.
 */

const CVLightDemo = () => {
  const [exposure, setExposure] = useState(0.5);
  const brightness = exposure; // 0 dark → 1 bright
  const conf = Math.max(0.12, 1 - Math.abs(0.5 - exposure) * 1.7); // peaks at normal

  const bgL = 4 + brightness * 22; // hsl lightness of the "feed"
  const boxOpacity = conf;

  return (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">
        A simulated camera feed. Drag exposure from LOW LIGHT → NORMAL → BRIGHT. Detection confidence peaks at normal lighting and drops at the extremes.
      </p>

      <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl" style={{ background: `hsl(210 20% ${bgL}%)` }}>
        {/* a "subject" silhouette */}
        <div
          className="absolute left-1/2 top-1/2 h-24 w-16 -translate-x-1/2 -translate-y-1/2 rounded-md"
          style={{ background: `hsl(210 10% ${Math.max(2, bgL - 8)}%)` }}
        />
        {/* bounding box — only confident around normal light */}
        <div
          className="absolute left-1/2 top-1/2 h-32 w-24 -translate-x-1/2 -translate-y-1/2 rounded-md border border-cyan-300"
          style={{ opacity: boxOpacity, transition: "opacity 0.2s" }}
        >
          <span className="absolute -top-5 left-0 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-300">
            subject · {Math.round(conf * 100)}%
          </span>
        </div>
        {/* scanline tint at low light */}
        {brightness < 0.3 && (
          <div className="atmos-scanlines absolute inset-0" style={{ opacity: 0.12 }} />
        )}
        {/* blown-out tint at high light */}
        {brightness > 0.8 && (
          <div className="absolute inset-0 bg-white/10" />
        )}
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={exposure}
          onChange={(e) => setExposure(Number(e.target.value))}
          className="w-full accent-cyan-300"
        />
        <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60">
          <span>low light</span>
          <span>normal</span>
          <span>bright</span>
        </div>
      </div>

      <p className="mt-4 border-l-2 border-white/10 pl-3 text-xs leading-relaxed text-muted-foreground/80">
        Computer-vision pipelines are slaves to lighting. Too dark and the sensor noise drowns the signal; too bright and highlights blow out the features. Exposure control is a first-class part of perception, not an afterthought.
      </p>
    </div>
  );
};

export default CVLightDemo;
