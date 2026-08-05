import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useProjectActivation } from "@/contexts/SynapticContext";
import { PROJECT_ACTIVATIONS } from "@/data/projectActivations";
import { useFieldLog } from "@/contexts/FieldLogContext";
import { cn } from "@/lib/utils";

/**
 * Projects — the fourth region.
 *
 * Not a card grid. A list of places in the network, one per project.
 * Hovering a row charges its silhouette in the 3D scene (the same mechanic
 * the project cards use) so the 2D index and the 3D world stay linked —
 * pointing at a name lights up its shape in the air. Clicking enters the
 * case study.
 */

const projectMeta: Record<
  string,
  { role: string; tech: string[] }
> = {
  "daktar-saab": {
    role: "AI healthcare companion — Kotlin + Firebase mobile app",
    tech: ["Kotlin", "Firebase", "AI/ML", "Mobile"],
  },
  "tb-classifier": {
    role: "Tuberculosis detection from chest X-rays — CNN + FastAPI",
    tech: ["PyTorch", "CNN", "FastAPI", "Deep Learning"],
  },
  "futurepath-finder": {
    role: "Career recommendation — Random Forest + FastAPI",
    tech: ["Python", "Random Forest", "FastAPI", "ML"],
  },
  "keywi-marketers": {
    role: "Marketing site — Node + Tailwind, performance-focused",
    tech: ["JavaScript", "Node.js", "Tailwind", "Web"],
  },
  "code-sika": {
    role: "Software engineering — Java/Gradle, clean architecture",
    tech: ["Java", "Gradle", "Architecture", "Engineering"],
  },
  "spotify-recommender": {
    role: "Hybrid recommender — collaborative + content filtering",
    tech: ["Python", "ML", "Spotify API", "Recommenders"],
  },
};

const ProjectsView = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<string>(PROJECT_ACTIVATIONS[0].id);
  const { markRegionVisited } = useFieldLog();
  void markRegionVisited;

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary-glow/80">
          04 — Projects
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
          Six places in the network. Each one is a case study.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Hover a row to light up its silhouette in the field. Click to enter
          the case study — problem, system, architecture, demo, result,
          lessons. No thumbnails-as-decoration.
        </p>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* The list — the index of the network. */}
        <ol className="divide-y divide-white/8 border-y border-white/8">
          {PROJECT_ACTIVATIONS.map((project, index) => (
            <ProjectRow
              key={project.id}
              id={project.id}
              index={index}
              title={project.title}
              onActivate={() => setActive(project.id)}
              onEnter={() => navigate(`/projects/${project.id}`)}
            />
          ))}
        </ol>

        {/* The preview — updates on hover. Stays put so the eye doesn't jump. */}
        <div className="hidden lg:block">
          <AnimatePresence mode="wait">
            <PreviewPane key={active} id={active} />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const ProjectRow = ({
  id,
  index,
  title,
  onActivate,
  onEnter,
}: {
  id: string;
  index: number;
  title: string;
  onActivate: () => void;
  onEnter: () => void;
}) => {
  const { ref, isActivated } = useProjectActivation(id);
  const meta = projectMeta[id];

  return (
    <li>
      <div
        ref={ref}
        tabIndex={0}
        onMouseEnter={onActivate}
        onFocus={onActivate}
        onClick={onEnter}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onEnter();
          }
        }}
        role="button"
        aria-label={`Open case study: ${title}`}
        className="group flex cursor-pointer items-center gap-5 py-6 outline-none transition-colors focus-visible:bg-white/[0.03]"
      >
        <span className="w-6 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground/60">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Silhouette glyph — a 2D echo of the 3D shape. */}
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500",
            isActivated
              ? "border-primary-glow/60 bg-primary-glow/10"
              : "border-white/15 bg-transparent group-hover:border-white/40",
          )}
        >
          <SilhouetteGlyph id={id} />
        </span>

        <div className="flex flex-1 flex-col">
          <span className="text-lg text-foreground sm:text-xl">{title}</span>
          <span className="text-sm text-muted-foreground">{meta.role}</span>
        </div>

        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-glow" />
      </div>
    </li>
  );
};

const PreviewPane = ({ id }: { id: string }) => {
  const meta = projectMeta[id];
  const project = PROJECT_ACTIVATIONS.find((p) => p.id === id)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-24 overflow-hidden rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Case study
        </span>
        <SilhouetteGlyph id={id} large />
      </div>

      <h2 className="mt-5 font-heading text-2xl font-semibold">
        {project.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {meta.role}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {meta.tech.map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-foreground/80"
          >
            {t}
          </span>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground/80">
        Enter the case study for the problem, the system, the architecture, an
        interactive demo, the result, and what I learned building it.
      </p>
    </motion.div>
  );
};

/** A tiny 2D echo of the 3D silhouette — same shape language, flat. */
const SilhouetteGlyph = ({ id, large }: { id: string; large?: boolean }) => {
  const size = large ? "h-6 w-6" : "h-4 w-4";
  const common = "text-primary-glow/80";
  switch (id) {
    case "daktar-saab":
      return (
        <svg viewBox="0 0 24 24" className={`${size} ${common}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
        </svg>
      );
    case "tb-classifier":
      return (
        <svg viewBox="0 0 24 24" className={`${size} ${common}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v5M9 7c-3 2-5 5-5 9s3 4 4 1 1-5 1-9zM15 7c3 2 5 5 5 9s-3 4-4 1-1-5-1-9z" />
        </svg>
      );
    case "futurepath-finder":
      return (
        <svg viewBox="0 0 24 24" className={`${size} ${common}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4" r="2" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="18" cy="12" r="2" />
          <circle cx="4" cy="20" r="1.6" />
          <circle cx="10" cy="20" r="1.6" />
          <circle cx="14" cy="20" r="1.6" />
          <circle cx="20" cy="20" r="1.6" />
          <path d="M12 6v2M12 8l-5 4M12 8l5 4M6 14v3M6 17l-1 2M6 17l1 2M18 14v3M18 17l-1 2M18 17l1 2" />
        </svg>
      );
    case "keywi-marketers":
      return (
        <svg viewBox="0 0 24 24" className={`${size} ${common}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21V13M10 21V7M16 21V10M22 21V3" />
          <path d="M3 13l6-4 6-3 6-7" opacity="0.6" />
        </svg>
      );
    case "code-sika":
      return (
        <svg viewBox="0 0 24 24" className={`${size} ${common}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5L3 12l6 7M15 5l6 7-6 7M13 4l-2 16" />
        </svg>
      );
    case "spotify-recommender":
      return (
        <svg viewBox="0 0 24 24" className={`${size} ${common}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="17" r="3" />
          <circle cx="17" cy="15" r="3" />
          <path d="M10 17V7l10-2v10" />
        </svg>
      );
    default:
      return <span className={`${size} rounded-full bg-current ${common}`} />;
  }
};

export default ProjectsView;
