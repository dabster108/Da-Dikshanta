import { PROJECTS } from "@/data/projects";
import { ProjectStory } from "@/components/projects/ProjectStory";
import { ProjectSelector } from "@/components/projects/ProjectSelector";
import { RevealText } from "@/components/typography/RevealText";

/**
 * Work (§16) — the chapter the rest of the page exists to set up.
 *
 * Every project gets the same structure and the same amount of room. There
 * is no "featured" tier in the layout: the ordering already says what I
 * think is most interesting, and shrinking the last two into cards would
 * undo the argument the chapter is making.
 */
export const Work = () => (
  <section
    data-chapter="work"
    id="work"
    className="relative px-gutter py-chapter"
    aria-label="Work"
  >
    <div className="flex flex-wrap items-baseline justify-between gap-4">
      <p className="t-mono">05 — Work</p>
      <p className="t-mono tabular-nums">{PROJECTS.length} systems</p>
    </div>

    <RevealText as="h2" className="t-chapter mt-8 max-w-[15ch]">
      <span className="block">Selected systems</span>
      <span className="serif block" style={{ fontSize: "1.08em" }}>
        I've built.
      </span>
    </RevealText>

    <RevealText as="p" className="t-body measure mt-8">
      Each one is real, each one links to its source. Where a number would be
      needed to make a claim and I don't have one on record, no claim is made.
    </RevealText>

    <div className="mt-20 sm:mt-28">
      {PROJECTS.map((p, i) => (
        <ProjectStory key={p.id} project={p} index={i} />
      ))}
    </div>

    <ProjectSelector />
  </section>
);
