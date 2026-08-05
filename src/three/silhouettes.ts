import type { ShapeDef } from "./shapeSampler";

/**
 * One silhouette per project, authored in a 100x100 box.
 *
 * These are the reason this scene can't be dropped onto someone else's
 * portfolio: nobody else's background assembles a pair of lungs because nobody
 * else shipped the TB classifier.
 */
export const PROJECT_SILHOUETTES: Record<string, ShapeDef> = {
  // Daktar Saab — healthcare assistant.
  "medical-cross": {
    fill: ["M40 10 h20 v30 h30 v20 h-30 v30 h-20 v-30 h-30 v-20 h30 z"],
  },

  // Tuberculosis X-ray Prediction — chest X-ray CNN.
  lungs: {
    fill: [
      "M46 34 C40 38 33 46 28 56 C22 68 20 80 24 86 C28 92 38 91 42 84 C45 78 46 66 46 56 Z",
      "M54 34 C60 38 67 46 72 56 C78 68 80 80 76 86 C72 92 62 91 58 84 C55 78 54 66 54 56 Z",
    ],
    stroke: [{ d: "M50 8 V32 M50 20 L40 30 M50 20 L60 30", w: 6 }],
  },

  // FuturePath Finder — Random Forest career recommender.
  "decision-tree": {
    stroke: [
      {
        d:
          "M50 12 V30 M50 30 L28 48 M50 30 L72 48 M28 48 V60 M28 60 L16 80 " +
          "M28 60 L40 80 M72 48 V60 M72 60 L60 80 M72 60 L84 80",
        w: 5,
      },
    ],
    fill: [
      "M50 6 a7 7 0 1 0 0.1 0 z",
      "M28 44 a6 6 0 1 0 0.1 0 z",
      "M72 44 a6 6 0 1 0 0.1 0 z",
      "M16 82 a5 5 0 1 0 0.1 0 z",
      "M40 82 a5 5 0 1 0 0.1 0 z",
      "M60 82 a5 5 0 1 0 0.1 0 z",
      "M84 82 a5 5 0 1 0 0.1 0 z",
    ],
  },

  // Keywi Marketers — digital advertising site.
  "growth-bars": {
    fill: [
      "M14 86 h16 v-22 h-16 z",
      "M42 86 h16 v-40 h-16 z",
      "M70 86 h16 v-58 h-16 z",
    ],
    stroke: [{ d: "M16 46 L44 32 L78 12", w: 5 }],
  },

  // Code Sika — software engineering / clean architecture.
  brackets: {
    stroke: [
      { d: "M34 24 L12 50 L34 76", w: 8 },
      { d: "M66 24 L88 50 L66 76", w: 8 },
      { d: "M58 18 L42 82", w: 7 },
    ],
  },

  // Spotify Hybrid Recommender.
  "music-note": {
    fill: [
      "M26 74 a13 10 0 1 0 26 0 a13 10 0 1 0 -26 0 z",
      "M60 66 a13 10 0 1 0 26 0 a13 10 0 1 0 -26 0 z",
    ],
    stroke: [{ d: "M52 74 V24 L86 14 V66", w: 7 }, { d: "M52 38 L86 28", w: 7 }],
  },
};

export type SilhouetteKey = keyof typeof PROJECT_SILHOUETTES;
