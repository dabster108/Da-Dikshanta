/**
 * Research (§14) — rendered as a graph of open questions, not a list of papers.
 *
 * I have no published papers, so this chapter does not pretend to be a
 * publication list. What it is instead: the questions each shipped system
 * left behind. Every entry traces to a documented position in `projects.ts`,
 * which is what makes it research rather than vocabulary.
 */

export interface ResearchNode {
  id: string;
  /** The question, phrased as a question. */
  question: string;
  /** The position I arrived at, so far. */
  position: string;
  /** Where this came from. */
  from: string;
  /** Project id this traces back to. */
  origin: string;
  /** Graph placement, -1..1 in both axes. Hand-placed so the graph reads. */
  x: number;
  y: number;
}

export const RESEARCH: ResearchNode[] = [
  {
    id: "uncertainty",
    question: "How does a model say it is unsure?",
    position:
      "A classifier that is confidently wrong is worse than one that abstains. Making uncertainty legible took more work than raising accuracy.",
    from: "Tuberculosis X-ray Prediction",
    origin: "tb-classifier",
    x: -0.62,
    y: -0.42,
  },
  {
    id: "interpretability",
    question: "What is accuracy worth if nobody can audit it?",
    position:
      "A random forest over a higher-ceiling model, because a decision path can be followed end to end. Auditability beat the last few points.",
    from: "FuturePath Finder",
    origin: "futurepath-finder",
    x: 0.55,
    y: -0.5,
  },
  {
    id: "objective",
    question: "What are we actually optimising for?",
    position:
      "A recommender tuned purely on predicted rating is accurate and useless. Coverage and novelty had to be measured or the model found a rut.",
    from: "Spotify Hybrid Recommender",
    origin: "spotify-recommender",
    x: 0.68,
    y: 0.3,
  },
  {
    id: "placement",
    question: "Where should inference physically run?",
    position:
      "Split by latency tolerance rather than by model capability. On-device where the wait is felt, cloud where the work is heavy.",
    from: "Daktar Saab",
    origin: "daktar-saab",
    x: -0.2,
    y: 0.62,
  },
  {
    id: "structure",
    question: "Why does adding a feature get expensive?",
    position:
      "Because of structure, not volume. Dependencies pointing inward keep the cost of change at the edge, where it belongs.",
    from: "Code Sika",
    origin: "code-sika",
    x: -0.72,
    y: 0.22,
  },
  {
    id: "constraint",
    question: "Is performance a feature or a constraint?",
    position:
      "A constraint, decided at the first commit. Treated as a final pass it becomes a rewrite.",
    from: "Keywi Marketers",
    origin: "keywi-marketers",
    x: 0.12,
    y: -0.72,
  },
];

/** Edges connect questions that constrain each other. Hand-drawn, not derived. */
export const RESEARCH_EDGES: [string, string][] = [
  ["uncertainty", "interpretability"],
  ["interpretability", "objective"],
  ["objective", "placement"],
  ["placement", "structure"],
  ["structure", "uncertainty"],
  ["constraint", "structure"],
  ["constraint", "interpretability"],
];
