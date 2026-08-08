import { useEffect, useRef, useState } from "react";

/**
 * Neural Network demo — input → hidden → output. Adjusting the input sliders
 * runs a forward pass; activations light up in real time.
 */
const ARCH = [3, 5, 4, 2];
const LABELS_IN = ["x₁", "x₂", "x₃"];
const LABELS_OUT = ["y₁", "y₂"];

export const NeuralNetDemo = () => {
  const [inputs, setInputs] = useState([0.6, 0.3, 0.8]);
  const [activations, setActivations] = useState<number[][]>([]);
  const raf = useRef(0);

  useEffect(() => {
    // Forward pass: simple weighted sum + sigmoid. Weights are fixed (seeded)
    // so the demo is deterministic but the activations clearly move with
    // the inputs.
    const weights = seedWeights(ARCH);
    let a = [inputs];
    for (let l = 1; l < ARCH.length; l++) {
      const prev = a[l - 1];
      const w = weights[l - 1];
      const out = Array.from({ length: ARCH[l] }, (_, j) => {
        const sum = prev.reduce((s, v, i) => s + v * w[i][j], 0);
        return 1 / (1 + Math.exp(-sum * 2 + 0.3));
      });
      a.push(out);
    }
    setActivations(a);
  }, [inputs]);

  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-3">
        {inputs.map((v, i) => (
          <label key={i} className="flex flex-col gap-1">
            <span className="label-mono">{LABELS_IN[i]} = {v.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={v}
              onChange={(e) =>
                setInputs((prev) => prev.map((x, j) => (j === i ? Number(e.target.value) : x)))
              }
              className="accent-primary"
            />
          </label>
        ))}
      </div>
      <svg viewBox="0 0 400 200" className="w-full rounded-xl border border-white/10 bg-slate-900">
        {ARCH.map((count, li) =>
          Array.from({ length: count }, (_, ni) => {
            const x = 40 + (li * 320) / (ARCH.length - 1);
            const y = 30 + (ni * 140) / (count - 1 || 1);
            const act = activations[li]?.[ni] ?? 0;
            return (
              <g key={`${li}-${ni}`}>
                {li < ARCH.length - 1 &&
                  Array.from({ length: ARCH[li + 1] }, (_, nj) => {
                    const x2 = 40 + ((li + 1) * 320) / (ARCH.length - 1);
                    const y2 = 30 + (nj * 140) / (ARCH[li + 1] - 1 || 1);
                    const strength = act * (activations[li + 1]?.[nj] ?? 0);
                    return (
                      <line
                        key={nj}
                        x1={x}
                        y1={y}
                        x2={x2}
                        y2={y2}
                        stroke={`hsl(214 100% 62% / ${0.08 + strength * 0.4})`}
                        strokeWidth={0.4 + strength * 1.5}
                      />
                    );
                  })}
                <circle
                  cx={x}
                  cy={y}
                  r={7}
                  fill={`hsl(214 100% ${40 + act * 40}% / ${0.4 + act * 0.6})`}
                  stroke="hsl(214 100% 74% / 0.5)"
                  strokeWidth="1"
                />
                {li === 0 && (
                  <text x={x - 18} y={y + 3} fontSize="9" fontFamily="monospace" fill="hsl(210 16% 70%)">
                    {LABELS_IN[ni]}
                  </text>
                )}
                {li === ARCH.length - 1 && (
                  <text x={x + 12} y={y + 3} fontSize="9" fontFamily="monospace" fill="hsl(214 100% 74%)">
                    {LABELS_OUT[ni]}={act.toFixed(2)}
                  </text>
                )}
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
};

function seedWeights(arch: number[]) {
  const w: number[][][] = [];
  for (let l = 0; l < arch.length - 1; l++) {
    const layer: number[][] = [];
    for (let i = 0; i < arch[l]; i++) {
      const row: number[] = [];
      for (let j = 0; j < arch[l + 1]; j++) {
        // Deterministic pseudo-random weight.
        row.push(Math.sin(i * 3 + j * 7 + l * 11) * 0.9);
      }
      layer.push(row);
    }
    w.push(layer);
  }
  return w;
}
