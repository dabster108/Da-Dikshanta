import type { SilhouetteKey } from "@/three/silhouettes";

/**
 * The order here must match the order of the cards in ProjectsSection — the
 * card at index N charges the silhouette at index N.
 */
export interface ProjectActivation {
  id: string;
  title: string;
  /** Short name used in the "model deployed" toast. */
  shortName: string;
  silhouette: SilhouetteKey;
}

export const PROJECT_ACTIVATIONS: ProjectActivation[] = [
  {
    id: "daktar-saab",
    title: "Daktar Saab",
    shortName: "Daktar-Saab",
    silhouette: "medical-cross",
  },
  {
    id: "tb-classifier",
    title: "Tuberculosis X-ray Prediction",
    shortName: "TB-Classifier",
    silhouette: "lungs",
  },
  {
    id: "futurepath-finder",
    title: "FuturePath Finder",
    shortName: "FuturePath",
    silhouette: "decision-tree",
  },
  {
    id: "keywi-marketers",
    title: "Keywi Marketers",
    shortName: "Keywi",
    silhouette: "growth-bars",
  },
  {
    id: "code-sika",
    title: "Code Sika",
    shortName: "Code-Sika",
    silhouette: "brackets",
  },
  {
    id: "spotify-recommender",
    title: "Spotify Hybrid Recommender",
    shortName: "Spotify-Recommender",
    silhouette: "music-note",
  },
];

export const PROJECT_TOTAL = PROJECT_ACTIVATIONS.length;
