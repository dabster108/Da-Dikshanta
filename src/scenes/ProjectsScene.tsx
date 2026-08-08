import { ResearchConsole } from "@/components/ResearchConsole";

/**
 * Projects — a small graph, not a grid.
 *
 * The visitor navigates a constellation of six project nodes and locks on
 * to one at a time; the environment transforms into that project's full
 * view. See ResearchConsole for the interaction itself — nothing here is
 * a bounded card, on desktop or on touch.
 */
export const ProjectsScene = () => {
  return (
    <section id="projects" data-scene="projects" className="relative">
      <div className="px-6 pb-16 pt-32 sm:px-10 sm:pt-48">
        <div className="mx-auto max-w-6xl">
          <h2 className="display-lg">Selected work</h2>
          <p className="body-lg mt-4 max-w-xl">
            Six shipped systems, laid out as a graph. Hover a node to preview it,
            click to lock on.
          </p>
        </div>
      </div>

      <div className="relative min-h-[70vh] pb-24">
        <ResearchConsole />
      </div>
    </section>
  );
};
