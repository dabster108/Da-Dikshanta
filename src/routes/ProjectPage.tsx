import { useEffect, useLayoutEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projectBySlug, nextProject } from "@/data/projects";
import { Nav } from "@/components/navigation/Nav";
import { RevealText } from "@/components/typography/RevealText";
import { ProjectArchitecture } from "@/components/projects/ProjectArchitecture";
import { ProjectPlate } from "@/components/projects/ProjectPlate";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { sceneState } from "@/lib/animation/sceneState";
import NotFound from "./NotFound";

gsap.registerPlugin(ScrollTrigger);

/**
 * A project, as its own documentary (§20–§24).
 *
 * The homepage chapter argues why the project is interesting; this page is
 * where the argument gets its evidence. Same beats, more room, plus the
 * things that don't fit in a chapter: the lessons, the full technology set,
 * and the way through to the next project.
 *
 * The 3D layer keeps running behind this route — it is mounted above the
 * router — which is what makes arriving here read as a camera move rather
 * than a page load. The route parks the scene on the work chapter's framing
 * so the artifact doesn't snap back to the opening composition.
 */

const ProjectPage = () => {
  const { slug } = useParams();
  const project = slug ? projectBySlug(slug) : undefined;
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  /* Park the shared scene on the work chapter's framing, pushed further back
     — this route is dense with reading and the artifact is only here to keep
     the environment continuous across the navigation. The ground fades to
     the project's own colour, which is what `color` in projects.ts is for. */
  useEffect(() => {
    if (!project) return;

    sceneState.chapter = 4;
    sceneState.chapterProgress = 0;
    sceneState.opacityScale = 0.5;
    document.title = `${project.title} — Dikshanta Chapagain`;

    const root = document.documentElement;
    const from = (root.style.getPropertyValue("--chapter-bg") || "11 13 12")
      .split(" ")
      .map(Number);
    const to = project.color.split(" ").map(Number);
    const proxy = { r: from[0], g: from[1], b: from[2] };

    const tween = gsap.to(proxy, {
      r: to[0],
      g: to[1],
      b: to[2],
      duration: reduced ? 0 : 0.9,
      ease: "power2.out",
      onUpdate: () =>
        root.style.setProperty(
          "--chapter-bg",
          `${Math.round(proxy.r)} ${Math.round(proxy.g)} ${Math.round(proxy.b)}`,
        ),
    });

    return () => {
      tween.kill();
      sceneState.opacityScale = 1;
      document.title = "Dikshanta Chapagain — Intelligent Systems";
    };
  }, [project, reduced]);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || reduced || !project) return;

    const ctx = gsap.context(() => {
      // Scroll-controlled media (§23): the frame opens from a held crop out
      // to full bleed as the visitor moves into the page.
      gsap.fromTo(
        "[data-hero-media]",
        { scale: 0.82 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-media-wrap]",
            start: "top 90%",
            end: "top 10%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.to("[data-hero-type]", {
        yPercent: -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, hero);

    return () => ctx.revert();
  }, [reduced, project, slug]);

  if (!project) return <NotFound />;
  const next = nextProject(project.slug);

  return (
    <>
      <Nav variant="project" />

      <main className="relative z-content">
        {/* --- Hero (§21) ------------------------------------------------ */}
        <header ref={heroRef} className="px-gutter pb-24 pt-[26vh] sm:pb-32">
          <div data-hero-type>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span className="t-mono t-mono-lime">{project.number}</span>
              <span className="t-mono">{project.category}</span>
              <span className="t-mono">{project.year}</span>
            </div>

            <RevealText
              as="h1"
              className="serif mt-8 max-w-[16ch] text-[clamp(2.75rem,8vw,8rem)] leading-[0.9]"
              immediate
              stagger={0.1}
            >
              {project.title}
            </RevealText>

            {/* Deliberately a step below the title. Set at full statement
                size it flattens the hierarchy and the page ends up with two
                things shouting at once (§52). */}
            <p
              className="mt-10 max-w-[34ch] leading-[1.25] text-2"
              style={{ fontSize: "clamp(1.25rem, 2.3vw, 1.9rem)" }}
            >
              {project.description}
            </p>
          </div>

          {/* Technical metadata */}
          <dl className="mt-16 grid gap-x-10 gap-y-6 border-t pt-8 hairline sm:mt-24 sm:grid-cols-3">
            <div>
              <dt className="t-mono">Role</dt>
              <dd className="mt-2 text-[0.98rem]">{project.role}</dd>
            </div>
            {project.model && (
              <div>
                <dt className="t-mono">Model</dt>
                <dd className="mt-2 text-[0.98rem]">{project.model}</dd>
              </div>
            )}
            <div>
              <dt className="t-mono">Source</dt>
              <dd className="mt-2 text-[0.98rem]">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="no-underline transition-colors hover:text-[rgb(var(--lime))]"
                >
                  GitHub ↗
                </a>
                {project.demo && (
                  <>
                    <span className="mx-3 text-mute">/</span>
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="no-underline transition-colors hover:text-[rgb(var(--lime))]"
                    >
                      Live ↗
                    </a>
                  </>
                )}
              </dd>
            </div>
          </dl>
        </header>

        {/* --- Plate ------------------------------------------------------ */}
        <div data-media-wrap className="overflow-hidden px-gutter">
          <div data-hero-media className="w-full will-change-transform">
            <ProjectPlate
              src={project.images[0]}
              ratio="16 / 9"
              size="15%"
              caption={`${project.number} — ${project.category}`}
            />
          </div>
        </div>

        {/* --- Statement --------------------------------------------------- */}
        <section className="px-gutter py-chapter" aria-label="Statement">
          <RevealText
            as="p"
            className="serif max-w-[20ch] text-[clamp(1.85rem,4.6vw,3.75rem)] leading-[1.04]"
            stagger={0.09}
          >
            {project.statement}
          </RevealText>
        </section>

        {/* --- Problem / approach ----------------------------------------- */}
        <section
          className="grid gap-12 px-gutter pb-chapter lg:grid-cols-2 lg:gap-20"
          aria-label="Problem and approach"
        >
          <div>
            <p className="t-mono mb-6">The problem</p>
            <RevealText as="p" className="t-body">
              {project.problem}
            </RevealText>
          </div>
          <div>
            <p className="t-mono mb-6">The approach</p>
            <RevealText as="p" className="t-body">
              {project.solution}
            </RevealText>
          </div>
        </section>

        {/* --- Architecture (§22) ------------------------------------------ */}
        <section className="px-gutter pb-chapter" aria-label="Architecture">
          <p className="t-mono mb-6">The system</p>
          <ProjectArchitecture architecture={project.architecture} />
        </section>

        {/* --- What it does ------------------------------------------------ */}
        <section className="px-gutter pb-chapter" aria-label="Implementation notes">
          <p className="t-mono mb-10">Implementation</p>
          <ul className="border-t hairline">
            {project.highlights.map((h, i) => (
              <li
                key={h}
                className="grid grid-cols-[3rem_1fr] items-baseline gap-x-6 border-b py-6 hairline sm:grid-cols-[5rem_1fr]"
              >
                <span className="t-mono t-mono-lime tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[clamp(1.05rem,1.8vw,1.4rem)] leading-snug">{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* --- Lessons ------------------------------------------------------ */}
        <section className="px-gutter pb-chapter" aria-label="What I took from it">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-20">
            <p className="t-mono lg:w-40">What I took<br />from it</p>
            <RevealText
              as="p"
              className="t-statement max-w-[26ch]"
              style={{ fontSize: "clamp(1.25rem,2.4vw,2rem)" }}
              stagger={0.05}
            >
              {project.lessons}
            </RevealText>
          </div>
        </section>

        {/* --- Technology --------------------------------------------------- */}
        <section className="px-gutter pb-chapter" aria-label="Technology">
          <p className="t-mono mb-6">Built with</p>
          <ul className="flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <li
                key={t}
                className="rounded-pill border px-4 py-2 text-[0.9rem] text-2 hairline"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* --- Next project (§24) ------------------------------------------- */}
        <section className="border-t px-gutter py-chapter hairline" aria-label="Next project">
          <Link
            to={`/work/${next.slug}`}
            data-cursor="explore"
            className="group grid items-center gap-8 no-underline lg:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="t-mono">Next project — {next.number}</p>
              <h2 className="serif mt-5 text-[clamp(2.25rem,6.5vw,6rem)] leading-[0.92] transition-colors duration-500 group-hover:text-[rgb(var(--lime))]">
                {next.title}
              </h2>
              <p className="t-mono mt-5">{next.category}</p>
            </div>

            <ProjectPlate
              src={next.images[0]}
              ratio="16 / 10"
              size="26%"
              className="transition-opacity duration-700 ease-out group-hover:opacity-100 lg:w-[22rem]"
              style={{ opacity: 0.75 }}
            />
          </Link>

          <Link
            to="/"
            className="t-mono mt-16 inline-block no-underline transition-colors hover:text-[rgb(var(--lime))]"
          >
            ← Back to the index
          </Link>
        </section>
      </main>
    </>
  );
};

export default ProjectPage;
