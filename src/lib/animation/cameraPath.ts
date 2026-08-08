import type { LightMood } from "@/data/chapters";

/**
 * Scroll choreography for the 3D layer (§27, §28, §55).
 *
 * One entry per chapter. The camera never jumps between these — CameraRig
 * damps toward the active entry and blends toward the next across the
 * chapter's own progress, so movement is continuous even though the
 * definition is discrete.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: the artifact never occupies the
 * reading column. Text runs from the left gutter to roughly 60% of the
 * viewport, so the artifact lives at positive X and negative Z for every
 * chapter that has body copy, and its opacity drops as the copy gets denser.
 * The 3D is the environment the writing sits in; the moment it competes with
 * a paragraph it has stopped doing its job.
 *
 * Visible width at z=0 with fov 38 and camera z≈9 is roughly ±4.5 units, so
 * an artifact at x≈3 sits in the right third with room to spare.
 */

export interface CameraKey {
  /** Camera position. */
  pos: [number, number, number];
  /** Look-at target. */
  look: [number, number, number];
  /** Artifact scale multiplier. */
  scale: number;
  /** Artifact position, world space. Positive X keeps it clear of the type. */
  artifact: [number, number, number];
  /** Rotation speed multiplier for the artifact. */
  spin: number;
  /** How open the lattice is: 0 closed around the core, 1 dispersed. */
  disperse: number;
  light: LightMood;
  /** Global opacity of the 3D layer — how far it gets out of the way. */
  opacity: number;
}

export const CAMERA_PATH: CameraKey[] = [
  // 01 Opening — the only chapter where the artifact is a subject rather
  // than a backdrop. Upper right, clear of the headline and the standfirst.
  {
    pos: [0, 0, 9.4],
    look: [0.4, 0.1, 0],
    scale: 0.92,
    artifact: [2.75, 0.75, -1.4],
    spin: 1,
    disperse: 0.2,
    light: "neutral",
    opacity: 0.95,
  },
  // 02 Approach — a held statement on the left. The artifact drifts further
  // right and dims; nothing should pull the eye off the sentence.
  {
    pos: [0.5, 0.2, 9.8],
    look: [0.4, 0, 0],
    scale: 0.85,
    artifact: [3.2, -0.15, -2.6],
    spin: 0.7,
    disperse: 0.34,
    light: "neutral",
    opacity: 0.5,
  },
  // 03 Research — the chapter's own graph is the visual. The artifact
  // retreats hard: it is atmosphere behind a two-column layout, nothing more.
  {
    pos: [0, 0.1, 10.4],
    look: [0, 0, 0],
    scale: 0.8,
    artifact: [3.5, 1.15, -5.2],
    spin: 0.5,
    disperse: 0.62,
    light: "cool",
    opacity: 0.3,
  },
  // 04 Capability — the dendrogram runs full width, so the artifact sits
  // high and far back, reading as depth rather than as an object.
  {
    pos: [0, 0.3, 10.2],
    look: [0, 0.1, 0],
    scale: 0.9,
    artifact: [3.3, 1.5, -5.6],
    spin: 0.45,
    disperse: 0.8,
    light: "green",
    opacity: 0.28,
  },
  // 05 Work — the projects carry everything. Right edge, well back.
  {
    pos: [0.3, 0, 9.6],
    look: [0.2, 0, 0],
    scale: 0.86,
    artifact: [3.4, 0.9, -3.4],
    spin: 0.6,
    disperse: 0.42,
    light: "green",
    opacity: 0.4,
  },
  // 06 Lab — the crypto scene owns the right column here, so the artifact
  // crosses to the left for the only time, and stays deep.
  {
    pos: [-0.3, -0.2, 10],
    look: [-0.2, 0, 0],
    scale: 0.82,
    artifact: [-3.4, -0.9, -5],
    spin: 0.85,
    disperse: 0.7,
    light: "cool",
    opacity: 0.26,
  },
  // 07 Timeline — pinned horizontal travel. The artifact goes overhead and
  // quiet so it can't be mistaken for part of the track.
  {
    pos: [0, 0.2, 11],
    look: [0, 0.1, 0],
    scale: 0.72,
    artifact: [0, 2.6, -6],
    spin: 0.35,
    disperse: 0.3,
    light: "warm",
    opacity: 0.26,
  },
  // 08 Contact — the scene withdraws; ground returns to the opening colour.
  {
    pos: [0, 0, 11.6],
    look: [0, 0, 0],
    scale: 0.6,
    artifact: [2.4, 0.4, -5],
    spin: 0.2,
    disperse: 0.12,
    light: "dark",
    opacity: 0.2,
  },
];

/** Light colour and intensity per mood (§28). Ambient moods, not neon. */
export const LIGHT_MOODS: Record<
  LightMood,
  { key: string; rim: string; intensity: number; rimIntensity: number }
> = {
  neutral: { key: "#F1F0E8", rim: "#8EA8FF", intensity: 1.5, rimIntensity: 0.7 },
  cool: { key: "#CBD8FF", rim: "#8EA8FF", intensity: 1.2, rimIntensity: 1.2 },
  green: { key: "#F1F0E8", rim: "#C8FF4D", intensity: 1.1, rimIntensity: 0.9 },
  warm: { key: "#F3E4CC", rim: "#D7B98E", intensity: 1.3, rimIntensity: 0.9 },
  dark: { key: "#A7ADA7", rim: "#8EA8FF", intensity: 0.6, rimIntensity: 0.35 },
};
