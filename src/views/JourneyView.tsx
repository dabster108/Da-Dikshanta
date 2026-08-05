import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { PROJECT_ACTIVATIONS } from "@/data/projectActivations";
import { useFieldLog } from "@/contexts/FieldLogContext";

/**
 * Journey — the fifth region.
 *
 * A timeline along the corridor. The projects are real milestones (they
 * exist, in shipping order). Education and early-career entries are
 * placeholder slots — the structure is here, the specific dates and
 * institutions are not invented.
 */

const placeholderMilestones = [
  { id: "edu", label: "Education", body: "[Your education — placeholder: add institution, focus, and years.]" },
  { id: "start", label: "First commit", body: "[How you started — placeholder: add the first language or project that hooked you.]" },
];

const ProjectMilestone = ({
  index,
  title,
  role,
}: {
  index: number;
  title: string;
  role: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-8"
    >
      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-primary-glow bg-background" />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Project {String(index + 1).padStart(2, "0")}
      </p>
      <p className="mt-1 text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{role}</p>
    </motion.div>
  );
};

const PlaceholderMilestone = ({
  label,
  body,
}: {
  label: string;
  body: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-8"
    >
      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-white/20 bg-transparent" />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm italic text-muted-foreground/70">{body}</p>
    </motion.div>
  );
};

const projectRoles: Record<string, string> = {
  "daktar-saab": "AI healthcare companion — Kotlin + Firebase.",
  "tb-classifier": "TB detection from X-rays — CNN + FastAPI.",
  "futurepath-finder": "Career recommendation — Random Forest + FastAPI.",
  "keywi-marketers": "Marketing site — Node + Tailwind.",
  "code-sika": "Software engineering — Java/Gradle.",
  "spotify-recommender": "Hybrid recommender — collaborative + content.",
};

const JourneyView = () => {
  const { markRegionVisited } = useFieldLog();
  void markRegionVisited;

  return (
    <section className="relative mx-auto max-w-3xl px-6 py-24 sm:px-10 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary-glow/80">
          05 — Journey
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
          A curve through time, not a wall of dates.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          The shipped projects are real milestones. The earlier entries are
          placeholders — the shape is here, the specifics aren't invented.
        </p>
      </motion.div>

      <div className="relative mt-14 border-l border-white/12 pl-0">
        <div className="space-y-10">
          {placeholderMilestones.map((m) => (
            <PlaceholderMilestone key={m.id} label={m.label} body={m.body} />
          ))}
          {PROJECT_ACTIVATIONS.map((p, i) => (
            <ProjectMilestone
              key={p.id}
              index={i}
              title={p.title}
              role={projectRoles[p.id] ?? ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneyView;
