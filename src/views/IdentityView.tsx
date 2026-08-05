import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useFieldLog } from "@/contexts/FieldLogContext";

/**
 * Identity — the second region.
 *
 * Not a paragraph and a photo. A set of technical interests the visitor
 * opens one at a time (progressive disclosure), and a stack grouped the
 * same way the 3D network groups its widest layer — Systems / Interfaces /
 * Intelligence — so the clusters in the air and the clusters on the page
 * read as the same substance.
 */

interface Interest {
  id: string;
  title: string;
  oneLine: string;
  detail: string;
}

const interests: Interest[] = [
  {
    id: "rag",
    title: "Retrieval-Augmented Generation",
    oneLine: "Grounding language models in your own data.",
    detail:
      "Chunking strategies, hybrid (BM25 + dense) retrieval, re-ranking, and the unglamorous eval work that decides whether a RAG system is actually useful or just confidently wrong.",
  },
  {
    id: "nn",
    title: "Neural Networks",
    oneLine: "From CNNs for medical imaging to recommender hybrids.",
    detail:
      "Designing and training networks where the architecture has to earn its complexity — a TB classifier's CNN, a Random Forest for career prediction, a collaborative+content hybrid for recommendations.",
  },
  {
    id: "agents",
    title: "Multi-Agent Systems",
    oneLine: "Orchestrating specialists that talk to each other.",
    detail:
      "Decomposing a goal into roles, routing between them, and keeping the whole thing from collapsing into a single agent that does everything badly. CrewAI-style crews and hand-rolled orchestration.",
  },
  {
    id: "cv",
    title: "Computer Vision",
    oneLine: "Making pixels into decisions.",
    detail:
      "Chest X-ray classification for tuberculosis detection, with the FastAPI serving layer and the front-end that makes a model someone can actually hand to a clinician.",
  },
  {
    id: "mobile",
    title: "Mobile AI",
    oneLine: "Putting intelligence in a pocket.",
    detail:
      "Kotlin + Firebase apps where on-device inference and cloud models coexist — symptom checking, X-ray analysis, medication tracking. The hard part is the UX, not the model.",
  },
  {
    id: "fullstack",
    title: "Full-Stack AI Delivery",
    oneLine: "A model is not a product.",
    detail:
      "PyTorch in a notebook is the easy 20%. FastAPI behind it, a React or Kotlin front-end in front of it, deployment, monitoring — the rest of the work is what turns a model into something shipped.",
  },
];

const clusters = [
  {
    name: "Systems",
    tint: "var(--primary)",
    items: ["Python", "FastAPI", "Node.js", "PostgreSQL", "Docker", "REST"],
  },
  {
    name: "Interfaces",
    tint: "var(--primary-glow)",
    items: ["React", "Next.js", "TypeScript", "Tailwind", "Kotlin", "Figma"],
  },
  {
    name: "Intelligence",
    tint: "#6ee7ff",
    items: [
      "PyTorch",
      "Scikit-learn",
      "LangChain",
      "CrewAI",
      "OpenAI API",
      "Pandas / NumPy",
    ],
  },
];

const IdentityView = () => {
  const [open, setOpen] = useState<string | null>("rag");
  const { markRegionVisited } = useFieldLog();
  // Visiting this region is recorded by the Shell's effect; this is just for
  // completeness if the view is ever rendered standalone.
  void markRegionVisited;

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-32">
      {/* Header — a statement, not a "About Me" heading. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary-glow/80">
          01 — Identity
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
          I'm an AI/ML engineer who ships the whole stack — not just the model.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Curious about how intelligence can be built, grounded, and put in
          someone's hands. The work below is what I actually spend time on; the
          rest of this network is the evidence.
        </p>
      </motion.div>

      {/* Interests — progressive disclosure. One open at a time. */}
      <div className="mt-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          What I think about
        </p>
        <ul className="mt-4 divide-y divide-white/8 border-y border-white/8">
          {interests.map((interest) => {
            const isOpen = open === interest.id;
            return (
              <li key={interest.id}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : interest.id)}
                  className="group flex w-full items-center gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <Plus
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-500 ${
                      isOpen ? "rotate-45 text-primary-glow" : ""
                    }`}
                  />
                  <span className="flex flex-1 flex-col">
                    <span className="text-lg text-foreground sm:text-xl">
                      {interest.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {interest.oneLine}
                    </span>
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pl-8 pr-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {interest.detail}
                  </p>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Stack — grouped the same way the 3D network groups its widest layer. */}
      <div className="mt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          What I build with
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {clusters.map((cluster) => (
            <div
              key={cluster.name}
              className="rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: cluster.tint }}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {cluster.name}
                </span>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {cluster.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-foreground/85 transition-colors hover:border-white/30 hover:text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Currently — one line, not a card. */}
      <div className="mt-20 border-l-2 border-primary/40 pl-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Currently
        </p>
        <p className="mt-2 text-base text-foreground/90 sm:text-lg">
          Exploring agent orchestration patterns that don't fall apart at three
          specialists, and retrieval evals that catch a bad chunking strategy
          before a user does.
        </p>
      </div>
    </section>
  );
};

export default IdentityView;
