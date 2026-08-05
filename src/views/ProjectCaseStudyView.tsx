import { useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { CASE_STUDIES } from "@/data/projectCaseStudies";
import { ProjectDemo } from "@/components/ProjectDemo";
import { useFieldLog } from "@/contexts/FieldLogContext";

/**
 * A single project as a place in the network.
 *
 * The visitor arrives here from the projects region. The story is told in
 * fixed narrative order — Problem → Approach → Architecture → Decisions
 * → Demo → Result → Lessons — revealed section by section as the visitor
 * scrolls, so the technical depth unfolds instead of landing as a wall of
 * text. The demo is interactive and project-specific (see ProjectDemo).
 */
const ProjectCaseStudyView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const study = id ? CASE_STUDIES[id] : undefined;
  const { markConceptDiscovered } = useFieldLog();

  useEffect(() => {
    if (study) markConceptDiscovered(`project:${study.id}`);
  }, [study, markConceptDiscovered]);

  if (!study) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-muted-foreground">No case study at this address.</p>
        <button
          onClick={() => navigate("/projects")}
          className="mt-6 text-primary-glow underline"
        >
          Back to projects
        </button>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-3xl px-6 py-20 sm:px-10 sm:py-28">
      <Link
        to="/projects"
        className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Projects
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary-glow/80">
          Case study
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl">
          {study.title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">{study.role}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {study.tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-foreground/80"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <a
            href={study.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" /> Source
          </a>
          <a
            href={study.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" /> Demo
          </a>
        </div>
      </motion.header>

      {/* The narrative sections, revealed one by one. */}
      <div className="mt-16 space-y-16">
        {study.sections.map((section, index) => (
          <StorySection key={section.id} section={section} index={index} />
        ))}
      </div>

      {/* The interactive demonstration — project-specific. */}
      {study.demo !== "none" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary-glow/80">
            Interactive demonstration
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Hardcoded and deterministic — an illustration of the concept, not a
            live inference.
          </p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm">
            <ProjectDemo kind={study.demo} />
          </div>
        </motion.div>
      )}

      <div className="mt-24 flex items-center justify-between border-t border-white/10 pt-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>
        <Link
          to="/contact"
          className="text-sm text-primary-glow transition-colors hover:text-foreground"
        >
          Get in touch →
        </Link>
      </div>
    </section>
  );
};

const StorySection = ({
  section,
  index,
}: {
  section: { id: string; label: string; body: string };
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-[auto_1fr] gap-5 sm:grid-cols-[8rem_1fr]"
    >
      <div className="flex flex-col items-start">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="mt-1 text-sm text-foreground/90">{section.label}</span>
      </div>
      <p className="text-base leading-relaxed text-muted-foreground">
        {section.body}
      </p>
    </motion.div>
  );
};

export default ProjectCaseStudyView;
