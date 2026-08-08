import { useState } from "react";
import { TextReveal } from "@/motion/primitives";
import { CVDemo } from "./demos/CVDemo";
import { ClusteringDemo } from "./demos/ClusteringDemo";
import { NeuralNetDemo } from "./demos/NeuralNetDemo";
import { CryptoDemo } from "./demos/CryptoDemo";
import { RecommendationDemo } from "./demos/RecommendationDemo";
import { AgentDemo } from "./demos/AgentDemo";

const TABS = [
  { id: "cv", label: "Computer Vision", comp: CVDemo },
  { id: "ml", label: "Machine Learning", comp: ClusteringDemo },
  { id: "nn", label: "Neural Network", comp: NeuralNetDemo },
  { id: "crypto", label: "Cryptography", comp: CryptoDemo },
  { id: "rec", label: "Recommendation", comp: RecommendationDemo },
  { id: "agent", label: "AI Agent", comp: AgentDemo },
] as const;

export const LabDemosSection = () => {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("cv");
  const Active = TABS.find((t) => t.id === active)!.comp;

  return (
    <section id="lab-demos" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-4">
          <span className="label-mono-accent">04b — Interactive Lab</span>
          <TextReveal as="h2" className="display-lg text-foreground">
            Pull the levers.
          </TextReveal>
          <p className="max-w-xl body-lg">
            Each module below is a small isolated component — not part of the
            scroll sequence. Tweak the inputs and watch the model respond.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                active === t.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-white/10 text-muted-foreground hover:border-white/30"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="panel p-6">
          <Active />
        </div>
      </div>
    </section>
  );
};
