import { CAMERA_PATH, LIGHT_MOODS, type CameraKey } from "./cameraPath";
import { sceneState, lerp, clamp } from "./sceneState";

/**
 * The blended camera key for the current frame.
 *
 * CameraRig recomputes this once per frame; LightingRig, ResearchArtifact
 * and ParticleField read it. Sharing one mutable object means the blend maths
 * runs once instead of four times, and — more importantly — every part of the
 * scene is guaranteed to be describing the same moment.
 *
 * Consumers may read a value computed on the previous frame depending on
 * mount order. At 60fps that is 16ms of lag on a damped camera move, which
 * is not perceptible and costs far less than enforcing an ordering.
 */
export const activeKey: CameraKey = {
  ...CAMERA_PATH[0],
  pos: [...CAMERA_PATH[0].pos],
  look: [...CAMERA_PATH[0].look],
  artifact: [...CAMERA_PATH[0].artifact],
};

/** Light values, blended alongside the camera so a mood change is a fade. */
export const activeLight = {
  keyR: 1,
  keyG: 1,
  keyB: 1,
  rimR: 1,
  rimG: 1,
  rimB: 1,
  intensity: 1.6,
  rimIntensity: 0.8,
};

const hexToRGB = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  // sRGB → linear-ish. Three handles conversion on Color, but these values
  // are lerped as plain numbers, so an approximate gamma keeps mid-blends
  // from going muddy.
  return [
    Math.pow(((n >> 16) & 255) / 255, 2.2),
    Math.pow(((n >> 8) & 255) / 255, 2.2),
    Math.pow((n & 255) / 255, 2.2),
  ];
};

const MOOD_RGB = Object.fromEntries(
  Object.entries(LIGHT_MOODS).map(([k, v]) => [
    k,
    { key: hexToRGB(v.key), rim: hexToRGB(v.rim), i: v.intensity, ri: v.rimIntensity },
  ]),
) as Record<string, { key: number[]; rim: number[]; i: number; ri: number }>;

/**
 * Blend between the active chapter's key and the next one.
 *
 * The blend only opens up over the back half of a chapter, so the visitor
 * spends most of a chapter at its intended composition and the transition
 * reads as a deliberate move between two held frames rather than a constant
 * drift.
 */
export const updateActiveKey = () => {
  const i = clamp(sceneState.chapter, 0, CAMERA_PATH.length - 1);
  const a = CAMERA_PATH[i];
  const b = CAMERA_PATH[Math.min(i + 1, CAMERA_PATH.length - 1)];

  const raw = clamp((sceneState.chapterProgress - 0.55) / 0.45, 0, 1);
  const t = raw * raw * (3 - 2 * raw); // smoothstep

  for (let c = 0; c < 3; c++) {
    activeKey.pos[c] = lerp(a.pos[c], b.pos[c], t);
    activeKey.look[c] = lerp(a.look[c], b.look[c], t);
    activeKey.artifact[c] = lerp(a.artifact[c], b.artifact[c], t);
  }
  activeKey.scale = lerp(a.scale, b.scale, t);
  activeKey.spin = lerp(a.spin, b.spin, t);
  activeKey.disperse = lerp(a.disperse, b.disperse, t);
  activeKey.opacity = lerp(a.opacity, b.opacity, t);

  const la = MOOD_RGB[a.light];
  const lb = MOOD_RGB[b.light];
  activeLight.keyR = lerp(la.key[0], lb.key[0], t);
  activeLight.keyG = lerp(la.key[1], lb.key[1], t);
  activeLight.keyB = lerp(la.key[2], lb.key[2], t);
  activeLight.rimR = lerp(la.rim[0], lb.rim[0], t);
  activeLight.rimG = lerp(la.rim[1], lb.rim[1], t);
  activeLight.rimB = lerp(la.rim[2], lb.rim[2], t);
  activeLight.intensity = lerp(la.i, lb.i, t);
  activeLight.rimIntensity = lerp(la.ri, lb.ri, t);
};
