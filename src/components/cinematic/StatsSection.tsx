import { StatCounters, type Stat } from "./StatCounters";
import { TextReveal } from "@/motion/primitives";

/**
 * Stats — animated counters (mechanic 2). Numbers are clearly-labeled
 * placeholders to be replaced with real, sourced metrics from Dikshanta's
 * actual work before publishing.
 */
const STATS: Stat[] = [
  { value: 12, suffix: "+", label: "Models shipped to production", source: "[REAL NUMBER — replace]" },
  { value: 98.2, decimals: 1, suffix: "%", label: "Inference accuracy on [benchmark]", source: "[REAL NUMBER — replace]" },
  { value: 240, suffix: " ms", label: "Average inference latency", source: "[REAL NUMBER — replace]" },
  { value: 8, suffix: "+", label: "Research projects completed", source: "[REAL NUMBER — replace]" },
];

export const StatsSection = () => (
  <section id="stats" className="relative px-6 py-24">
    <div className="mx-auto max-w-6xl">
      <div className="mb-12 flex flex-col gap-4">
        <span className="label-mono-accent">— By the numbers</span>
        <TextReveal as="h2" className="display-lg text-foreground">
          Measured, not marketed.
        </TextReveal>
      </div>
      <StatCounters stats={STATS} />
    </div>
  </section>
);
