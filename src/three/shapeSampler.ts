/**
 * Rasterise-and-sample: draw a glyph run or an SVG silhouette to an offscreen
 * canvas, then harvest non-transparent pixels as normalised 2D coordinates.
 *
 * This is how the same network nodes become letterforms and project
 * silhouettes — no separate title mesh, no sprite overlay, the actual points
 * move.
 */

export interface SampledShape {
  /** Normalised points, x/y in roughly [-0.5, 0.5], y up. */
  points: { x: number; y: number }[];
  /** width / height of the source raster, so callers can preserve aspect. */
  aspect: number;
}

const EMPTY: SampledShape = { points: [], aspect: 1 };

const harvest = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
  step: number,
): SampledShape => {
  const { data } = ctx.getImageData(0, 0, width, height);
  const hits: { x: number; y: number }[] = [];

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 128) {
        hits.push({ x, y });
      }
    }
  }

  if (hits.length === 0) return EMPTY;

  // Deterministic shuffle so the same shape always yields the same node
  // assignment between reloads (a reshuffle every load reads as noise).
  let seed = 0x9e3779b9;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = hits.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [hits[i], hits[j]] = [hits[j], hits[i]];
  }

  const picked = hits.slice(0, Math.min(count, hits.length));
  const aspect = width / height;

  return {
    aspect,
    points: picked.map((p) => ({
      x: (p.x / width - 0.5) * aspect,
      y: -(p.y / height - 0.5),
    })),
  };
};

/** Sample the outline of a run of text (used for the hero name assembly). */
export const sampleText = (
  text: string,
  count: number,
  options: { font?: string; height?: number } = {},
): SampledShape => {
  if (typeof document === "undefined") return EMPTY;

  const height = options.height ?? 160;
  const fontSize = Math.round(height * 0.62);
  const font =
    options.font ??
    `700 ${fontSize}px "Playfair Display", Georgia, "Times New Roman", serif`;

  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return EMPTY;
  probe.font = font;
  const width = Math.max(64, Math.ceil(probe.measureText(text).width) + 32);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return EMPTY;

  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);

  return harvest(ctx, width, height, count, 2);
};

export interface ShapeDef {
  /** Filled SVG path data, authored in a 100x100 box. */
  fill?: string[];
  /** Stroked SVG path data, authored in a 100x100 box. */
  stroke?: { d: string; w: number }[];
}

/** Sample an SVG silhouette authored in a 100x100 viewBox. */
export const sampleShape = (shape: ShapeDef, count: number): SampledShape => {
  if (typeof document === "undefined" || typeof Path2D === "undefined") {
    return EMPTY;
  }

  const size = 200;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return EMPTY;

  ctx.scale(size / 100, size / 100);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const d of shape.fill ?? []) ctx.fill(new Path2D(d));
  for (const { d, w } of shape.stroke ?? []) {
    ctx.lineWidth = w;
    ctx.stroke(new Path2D(d));
  }

  return harvest(ctx, size, size, count, 3);
};
