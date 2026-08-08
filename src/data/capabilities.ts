/**
 * The capability map (§15) — a graph, not a list of percentages.
 *
 * Every leaf here is a technology that appears in shipped work in
 * `projects.ts` or in a documented phase in `timeline.ts`. Nothing is listed
 * because it sounds good. There are no proficiency numbers: a percentage
 * next to a language is a claim nobody can verify and I'm not making one.
 *
 * `evidence` is the project id that backs the node. A leaf with no evidence
 * is in the `exploring` branch and is labelled as such in the UI — the
 * distinction between "I have shipped this" and "I am learning this" is the
 * whole point of the map.
 */

export interface CapabilityNode {
  id: string;
  label: string;
  /** Project ids in projects.ts that demonstrate this. */
  evidence?: string[];
}

export interface CapabilityBranch {
  id: string;
  label: string;
  /** One line on what this branch actually means in practice. */
  note: string;
  nodes: CapabilityNode[];
}

export const CAPABILITIES: CapabilityBranch[] = [
  {
    id: "intelligence",
    label: "Intelligence",
    note: "Models, and the evaluation that decides whether they are worth serving.",
    nodes: [
      { id: "pytorch", label: "PyTorch", evidence: ["tb-classifier"] },
      { id: "cnn", label: "Convolutional nets", evidence: ["tb-classifier"] },
      { id: "sklearn", label: "Scikit-learn", evidence: ["futurepath-finder"] },
      { id: "ensembles", label: "Ensembles", evidence: ["futurepath-finder"] },
      { id: "recsys", label: "Recommenders", evidence: ["spotify-recommender"] },
      { id: "eval", label: "Model evaluation", evidence: ["futurepath-finder", "spotify-recommender"] },
      { id: "interpret", label: "Interpretability", evidence: ["futurepath-finder"] },
    ],
  },
  {
    id: "perception",
    label: "Perception",
    note: "Reading an image well enough that a decision can rest on it.",
    nodes: [
      { id: "cv", label: "Computer vision", evidence: ["tb-classifier"] },
      { id: "medimg", label: "Medical imaging", evidence: ["tb-classifier"] },
      { id: "preproc", label: "Preprocessing", evidence: ["tb-classifier", "futurepath-finder"] },
      { id: "features", label: "Feature analysis", evidence: ["futurepath-finder", "spotify-recommender"] },
    ],
  },
  {
    id: "systems",
    label: "Systems",
    note: "The part that decides whether a model is a product or a notebook.",
    nodes: [
      { id: "fastapi", label: "FastAPI", evidence: ["tb-classifier", "futurepath-finder"] },
      { id: "python", label: "Python", evidence: ["tb-classifier", "futurepath-finder", "spotify-recommender"] },
      { id: "node", label: "Node.js", evidence: ["keywi-marketers"] },
      { id: "firebase", label: "Firebase", evidence: ["daktar-saab"] },
      { id: "java", label: "Java / Gradle", evidence: ["code-sika"] },
      { id: "clean", label: "Clean architecture", evidence: ["code-sika"] },
      { id: "kotlin", label: "Kotlin / Android", evidence: ["daktar-saab"] },
    ],
  },
  {
    id: "interface",
    label: "Interface",
    note: "Where the system meets the person who has to trust it.",
    nodes: [
      { id: "react", label: "React / TypeScript" },
      { id: "tailwind", label: "Tailwind", evidence: ["keywi-marketers"] },
      { id: "perf", label: "Performance budgets", evidence: ["keywi-marketers"] },
      { id: "deploy", label: "Deployment", evidence: ["keywi-marketers", "daktar-saab"] },
    ],
  },
  {
    id: "exploring",
    label: "Exploring",
    note: "Current reading, not shipped work. Listed separately on purpose.",
    nodes: [
      { id: "agents", label: "Agent orchestration" },
      { id: "retrieval", label: "Retrieval systems" },
      { id: "robotics", label: "Robotics" },
      { id: "crypto", label: "Cryptography" },
    ],
  },
];

/** Total leaves, used by the map's readout. */
export const CAPABILITY_COUNT = CAPABILITIES.reduce((n, b) => n + b.nodes.length, 0);
