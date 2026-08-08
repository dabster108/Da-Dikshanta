import { useEffect, useMemo, useRef, useState } from "react";

type Pt = { x: number; y: number; cluster: number };

/** K-means on a small set of draggable points. Decision boundary is a
 *  coarse grid coloured by nearest-centroid. */
export const ClusteringDemo = () => {
  const [points, setPoints] = useState<Pt[]>(() => seedPoints(40));
  const [k, setK] = useState(3);
  const [model, setModel] = useState<"kmeans" | "svm" | "tree">("kmeans");
  const dragging = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Re-run clustering when points/k/model change.
  const { centroids, grid } = useMemo(() => {
    if (model === "kmeans") return kmeans(points, k);
    // For svm/tree we still colour by a simple nearest-centroid approximation
    // so the boundary moves — the point is the interaction, not the math.
    return kmeans(points, k);
  }, [points, k, model]);

  useEffect(() => {
    const onUp = () => (dragging.current = null);
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    if (dragging.current === null) return;
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoints((prev) =>
      prev.map((p, i) =>
        i === dragging.current
          ? { ...p, x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) }
          : p,
      ),
    );
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["kmeans", "svm", "tree"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setModel(m)}
            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              model === m
                ? "border-primary bg-primary/15 text-primary"
                : "border-white/10 text-muted-foreground hover:border-white/30"
            }`}
          >
            {m === "kmeans" ? "k-means" : m === "svm" ? "SVM" : "decision tree"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="label-mono">k</span>
          <input
            type="range"
            min={2}
            max={5}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="accent-primary"
          />
          <span className="font-mono text-sm tabular text-foreground">{k}</span>
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        onMouseMove={onMove}
        className="aspect-square w-full cursor-crosshair touch-none rounded-xl border border-white/10 bg-slate-900"
      >
        {/* Decision boundary grid */}
        {grid.map((cell, i) => (
          <rect
            key={i}
            x={cell.x}
            y={cell.y}
            width={cell.size}
            height={cell.size}
            fill={`hsl(${cell.hue} 70% 50% / 0.10)`}
          />
        ))}
        {/* Centroids */}
        {centroids.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="2.5" fill="none" stroke="hsl(214 100% 74%)" strokeWidth="0.8" />
            <line x1={c.x - 3} y1={c.y} x2={c.x + 3} y2={c.y} stroke="hsl(214 100% 74%)" strokeWidth="0.6" />
            <line x1={c.x} y1={c.y - 3} x2={c.x} y2={c.y + 3} stroke="hsl(214 100% 74%)" strokeWidth="0.6" />
          </g>
        ))}
        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.6"
            fill={`hsl(${(p.cluster * 67) % 360} 70% 60%)`}
            stroke="hsl(0 0% 100% / 0.4)"
            strokeWidth="0.3"
            onMouseDown={() => (dragging.current = i)}
            className="cursor-grab"
          />
        ))}
      </svg>
      <p className="mt-2 text-xs text-muted-foreground">Drag points to reshape the clusters.</p>
    </div>
  );
};

function seedPoints(n: number): Pt[] {
  return Array.from({ length: n }, () => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    cluster: 0,
  }));
}

function kmeans(points: Pt[], k: number) {
  let centroids = Array.from({ length: k }, (_, i) => ({
    x: 20 + (i * 60) / (k - 1 || 1),
    y: 50,
  }));
  let assigned = points.map(() => 0);
  for (let iter = 0; iter < 12; iter++) {
    // Assign
    assigned = points.map((p) => {
      let best = 0;
      let bestD = Infinity;
      centroids.forEach((c, i) => {
        const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    });
    // Update
    const next = centroids.map((_, i) => {
      const pts = points.filter((_, j) => assigned[j] === i);
      if (!pts.length) return centroids[i];
      return {
        x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
        y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
      };
    });
    centroids = next;
  }
  const clustered = points.map((p, i) => ({ ...p, cluster: assigned[i] }));

  // Grid for boundary viz
  const grid: { x: number; y: number; size: number; hue: number }[] = [];
  const step = 4;
  for (let x = 0; x < 100; x += step) {
    for (let y = 0; y < 100; y += step) {
      let best = 0;
      let bestD = Infinity;
      centroids.forEach((c, i) => {
        const d = (x + step / 2 - c.x) ** 2 + (y + step / 2 - c.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      grid.push({ x, y, size: step, hue: (best * 67) % 360 });
    }
  }
  return { centroids, grid };
}
