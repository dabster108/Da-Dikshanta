import * as THREE from "three";

/**
 * Synaptic Cartography palette.
 *
 * These are derived from the site's own design tokens (index.css) rather than
 * the generic "AI blue" placeholder, so the network reads as part of the brand:
 *   --background   220 25%  5%  -> #0a0c10
 *   --primary      240 75% 65%  -> #6363e9
 *   --primary-glow 250 80% 75%  -> #9d8cf2
 */
const FALLBACK = {
  background: "#0a0c10",
  node: "#8f9dff",
  edge: "#3d3f8f",
  accent: "#b7a6ff",
  accentWarm: "#d6c9ff",
  cluster: ["#6363e9", "#9d8cf2", "#6ee7ff"],
} as const;

const readVar = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) return null;
  // Tokens are stored as bare "H S% L%" triples for hsl().
  const parts = raw.split(/\s+/);
  if (parts.length < 3) return null;
  const h = Number.parseFloat(parts[0]);
  const s = Number.parseFloat(parts[1]) / 100;
  const l = Number.parseFloat(parts[2]) / 100;
  if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) {
    return null;
  }
  return `#${new THREE.Color().setHSL(h / 360, s, l).getHexString()}`;
};

export interface Palette {
  background: THREE.Color;
  node: THREE.Color;
  edge: THREE.Color;
  accent: THREE.Color;
  accentWarm: THREE.Color;
  cluster: THREE.Color[];
  /** CSS hex strings, for the DOM-side HUD so it matches the canvas exactly. */
  css: {
    accent: string;
    node: string;
    background: string;
  };
}

let cached: Palette | null = null;

export const getPalette = (): Palette => {
  if (cached) return cached;

  const background = readVar("--background") ?? FALLBACK.background;
  const primary = readVar("--primary") ?? FALLBACK.cluster[0];
  const glow = readVar("--primary-glow") ?? FALLBACK.cluster[1];

  // Node core sits between primary and white so individual points stay legible
  // against the near-black background; edges are a heavily darkened primary.
  // The white lerp is kept low so dense clusters don't sum to solid white
  // under additive blending (the "white screen" on reload).
  const node = new THREE.Color(primary).lerp(new THREE.Color("#ffffff"), 0.2);
  const edge = new THREE.Color(primary).multiplyScalar(0.55);
  const accent = new THREE.Color(glow).lerp(new THREE.Color("#ffffff"), 0.08);
  const accentWarm = new THREE.Color(glow).lerp(new THREE.Color("#fff3e0"), 0.3);

  cached = {
    background: new THREE.Color(background),
    node,
    edge,
    accent,
    accentWarm,
    cluster: [
      new THREE.Color(primary),
      new THREE.Color(glow),
      new THREE.Color(FALLBACK.cluster[2]),
    ],
    css: {
      accent: `#${accent.getHexString()}`,
      node: `#${node.getHexString()}`,
      background,
    },
  };

  return cached;
};
