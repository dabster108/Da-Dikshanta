import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/data/projects";
import { RevealText } from "@/components/typography/RevealText";
import { ProjectArchitecture } from "./ProjectArchitecture";
import { ProjectPlate } from "./ProjectPlate";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * One project, told as a chapter (§16, §19).
 *
 * The beats are fixed across every project so the visitor learns the rhythm
 * once: the frame (number, title, media) → the problem → the approach → the
 * system → the way in. No cards, no grid, no eight-across.
 *
 * The media reveals with a clip wipe and parallaxes at a different rate to
 * the type, which is what gives the composition depth without a drop shadow
 * anywhere on the page.
 */

export const ProjectStory = ({ project, index }: { project: Project; index: number }) => {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      const media = root.querySelector<HTMLElement>("[data-media]");
      const glyph = root.querySelector<HTMLElement>("[data-plate-glyph]");

      if (media) {
        // The plate wipes open from below.
        gsap.fromTo(
          media,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: { trigger: media, start: "top 85%", once: true },
          },
        );

        // The glyph drifts a few percent against the plate. Small, because
        // it is centred — a large parallax would visibly decentre it.
        if (glyph) {
          gsap.fromTo(
            glyph,
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: "none",
              scrollTrigger: {
                trigger: media,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      }

      // The index drifts against the scroll — a slow background element that
      // makes the chapter feel like it has physical depth.
      gsap.fromTo(
        root.querySelector("[data-index]"),
        { yPercent: 18 },
        {
          yPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <article
      ref={rootRef}
      data-project={project.id}
      id={project.slug}
      className="relative border-t py-chapter hairline"
      aria-labelledby={`${project.slug}-title`}
    >
      {/* --- Frame ------------------------------------------------------- */}
      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <div className="flex items-baseline gap-5">
            <span
              data-index
              className="serif block leading-none will-change-transform"
              style={{
                fontSize: "clamp(3.5rem, 8vw, 7rem)",
                color: "rgb(var(--text) / 0.14)",
              }}
            >
              {project.number}
            </span>
            <div>
              <p className="t-mono t-mono-lime">{project.category}</p>
              <p className="t-mono mt-1.5">{project.year}</p>
            </div>
          </div>

          <RevealText
            as="h3"
            id={`${project.slug}-title`}
            className="serif mt-6 text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.92]"
          >
            {project.title}
          </RevealText>

          <RevealText as="p" className="t-statement mt-8 max-w-[20ch]" stagger={0.06}>
            {project.statement}
          </RevealText>
        </div>

        {/* Plate */}
        <div className="lg:col-span-5 lg:pt-16">
          <div data-media>
            <ProjectPlate
              src={project.images[0]}
              caption={`${project.number} · ${project.year}`}
            />
          </div>
          <p className="t-mono mt-4">{project.role}</p>
        </div>
      </div>

      {/* --- The problem / the approach ---------------------------------- */}
      <div className="mt-24 grid gap-12 sm:mt-32 lg:grid-cols-2 lg:gap-20">
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
      </div>

      {/* --- The system --------------------------------------------------- */}
      <div className="mt-24 sm:mt-32">
        <p className="t-mono mb-6">The system</p>
        <ProjectArchitecture architecture={project.architecture} />
      </div>

      {/* --- Technology and the way in ------------------------------------ */}
      <div className="mt-24 grid gap-10 border-t pt-10 hairline sm:mt-32 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="t-mono mb-5">Built with</p>
          <ul className="flex flex-wrap gap-x-2 gap-y-2">
            {project.technologies.map((t) => (
              <li
                key={t}
                className="rounded-pill border px-3.5 py-1.5 text-[0.85rem] text-2 hairline"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer noopener"
            className="t-mono no-underline transition-colors hover:text-[rgb(var(--lime))]"
          >
            Source ↗
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer noopener"
              className="t-mono no-underline transition-colors hover:text-[rgb(var(--lime))]"
            >
              Live ↗
            </a>
          )}
          <Link
            to={`/work/${project.slug}`}
            data-cursor="explore"
            className="group inline-flex items-center gap-3 border-b pb-1 text-[1.05rem] no-underline hairline transition-colors hover:border-[rgb(var(--lime))]"
          >
            Explore project
            <span className="transition-transform duration-500 ease-out group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};
