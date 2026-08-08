/**
 * The journey, told as a sequence of states rather than a paragraph.
 *
 * Each entry has a `signal` in 0..1 — how much of my time that phase was
 * spent on intelligent systems versus general software. The timeline renders
 * it as a rising curve, so the story is legible before a word is read.
 */

export interface Milestone {
  id: string;
  period: string;
  title: string;
  /** One line that carries the whole beat. */
  summary: string;
  /** Expanded on hover / focus. */
  detail: string;
  /** Concrete artefacts from this phase. */
  markers: string[];
  signal: number;
}

export const TIMELINE: Milestone[] = [
  {
    id: "curiosity",
    period: "2023",
    title: "Curiosity",
    summary: "Wrote the first line of code to find out how any of it worked.",
    detail:
      "It started as a question rather than a career plan — what actually happens between typing something and a machine doing it. The answer took about three years and is still not finished.",
    markers: ["First programs", "Self-directed learning", "Python"],
    signal: 0.08,
  },
  {
    id: "foundations",
    period: "2023 — 2024",
    title: "Foundations",
    summary: "Traded tutorials for fundamentals: data structures, algorithms, systems.",
    detail:
      "The phase where curiosity turns into engineering. Data structures and algorithms, object-oriented design in Java, version control, and the habit of reading source instead of guessing at it.",
    markers: ["Data structures", "Algorithms", "Java / Gradle", "Git"],
    signal: 0.22,
  },
  {
    id: "shipping",
    period: "2024",
    title: "Shipping",
    summary: "Started building software other people actually open.",
    detail:
      "Full-stack work — JavaScript and Node on the server, React and Tailwind on the front, real deployments with real users. This is where I learned that a project is not finished when it runs on your laptop.",
    markers: ["React / TypeScript", "Node.js", "Tailwind", "Deployment"],
    signal: 0.4,
  },
  {
    id: "learning-machines",
    period: "2024 — 2025",
    title: "Machine learning",
    summary: "Moved from writing rules to training models that infer them.",
    detail:
      "Scikit-learn, then PyTorch. Random forests and feature importance, then convolutional networks. The interesting part was never the training loop — it was evaluation, and learning how confidently wrong a model can be.",
    markers: ["PyTorch", "Scikit-learn", "Model evaluation", "Feature analysis"],
    signal: 0.62,
  },
  {
    id: "applied",
    period: "2025",
    title: "Applied intelligence",
    summary: "Put models where a decision was waiting on them.",
    detail:
      "Tuberculosis detection from chest X-rays, career recommendation from student profiles, a hybrid music recommender, an AI healthcare companion on mobile. Each one needed a serving layer and an interface before it counted as real.",
    markers: ["Computer vision", "Medical imaging", "Recommenders", "FastAPI"],
    signal: 0.82,
  },
  {
    id: "graduating",
    period: "2026",
    title: "Graduating",
    summary:
      "Finishing a BSc (Hons) in Computing with Artificial Intelligence at Softwarica College of IT and E-Commerce.",
    detail:
      "Three years after the first line of code, with a degree built specifically around artificial intelligence — and a body of work that exists outside the coursework. Now looking at agent orchestration, retrieval systems, and robotics.",
    markers: [
      "Softwarica College of IT and E-Commerce",
      "Computing with AI",
      "Research",
      "Robotics",
    ],
    signal: 1,
  },
];
