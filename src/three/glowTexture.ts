import * as THREE from "three";

/**
 * 64x64 radial-gradient sprite: white core falling to fully transparent at
 * r=32. A hard-edged circle reads flat and "dotty" under additive blending;
 * the falloff is what makes points read as glowing nodes.
 */
let cachedSoft: THREE.Texture | null = null;
let cachedCore: THREE.Texture | null = null;

const build = (stops: [number, string][]): THREE.Texture => {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

/** Static network nodes: wide, soft halo. White core reined in so a dense
 *  cluster doesn't sum to solid white under additive blending — that was the
 * "white screen" on reload. */
export const getGlowTexture = (): THREE.Texture => {
  if (!cachedSoft) {
    cachedSoft = build([
      [0, "rgba(255,255,255,0.5)"],
      [0.18, "rgba(255,255,255,0.38)"],
      [0.42, "rgba(255,255,255,0.14)"],
      [0.72, "rgba(255,255,255,0.03)"],
      [1, "rgba(255,255,255,0)"],
    ]);
  }
  return cachedSoft;
};

/** Travelling pulses: tighter core so they read as a moving signal, not fog. */
export const getPulseTexture = (): THREE.Texture => {
  if (!cachedCore) {
    cachedCore = build([
      [0, "rgba(255,255,255,1)"],
      [0.28, "rgba(255,255,255,0.6)"],
      [0.6, "rgba(255,255,255,0.12)"],
      [1, "rgba(255,255,255,0)"],
    ]);
  }
  return cachedCore;
};

export const disposeGlowTextures = () => {
  cachedSoft?.dispose();
  cachedCore?.dispose();
  cachedSoft = null;
  cachedCore = null;
};
