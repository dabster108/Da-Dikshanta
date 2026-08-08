import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { RESEARCH, RESEARCH_EDGES } from "@/data/research";
import { RevealText } from "@/components/typography/RevealText";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouch } from "@/hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/**
 * Research (§14) — a graph of open questions, not a grid of cards.
 *
 * Each node is a question a shipped system left behind; each edge is a place
 * where two of those questions constrain each other. Signal pulses travel
 * along the edges, which is the one piece of pure atmosphere here and is kept
 * to a handful of elements.
 *
 * The graph is SVG rather than canvas: six nodes and seven edges do not need
 * a render loop, and SVG gives real focusable elements, so the whole thing is
 * keyboard navigable without building a parallel accessibility tree.
 */

const R = 78; // graph radius in viewBox units

export const Research = () => {
  const rootRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(RESEARCH[0].id);
  const reduced = useReducedMotion();
  const touch = useIsTouch();

  const node = RESEARCH.find((n) => n.id === active)!;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;

    const ctx = gsap.context(() => {
      /* Nodes and edges draw themselves in as the chapter arrives. */
      gsap.from("[data-edge]", {
        drawSVG: 0,
        opacity: 0,
        duration: 1.1,
        stagger: 0.06,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 65%", once: true },
      });

      gsap.from("[data-node]", {
        scale: 0,
        opacity: 0,
        transformOrigin: "center",
        duration: 0.8,
        stagger: 0.07,
        ease: "back.out(2)",
        scrollTrigger: { trigger: root, start: "top 65%", once: true },
      });

      if (reduced) return;

      /* Signal pulses travelling along the edges. One repeating tween each,
         all driven by the shared ticker. The opacity keyframes fade the
         pulse in and out at the endpoints so it doesn't pop at the nodes. */
      RESEARCH_EDGES.forEach(([fromId, toId], i) => {
        const from = RESEARCH.find((n) => n.id === fromId)!;
        const to = RESEARCH.find((n) => n.id === toId)!;
        const tl = gsap.timeline({ repeat: -1, delay: i * 0.55 });
        tl.fromTo(
          `[data-pulse="${i}"]`,
          { attr: { cx: from.x * R, cy: from.y * R } },
          {
            attr: { cx: to.x * R, cy: to.y * R },
            duration: 2.6,
            ease: "none",
          },
        ).fromTo(
          `[data-pulse="${i}"]`,
          { opacity: 0 },
          { opacity: 0.9, duration: 1.3, yoyo: true, repeat: 1, ease: "none" },
          0,
        );
      });

      /* The graph turns slightly as the chapter passes — the camera moving
         around the structure rather than the structure spinning. */
      gsap.fromTo(
        svg,
        { rotate: -4, scale: 0.94 },
        {
          rotate: 4,
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      data-chapter="research"
      id="research"
      className="relative px-gutter py-chapter"
      aria-label="Research"
    >
      <p className="t-mono">03 — Research</p>

      <RevealText as="h2" className="t-chapter mt-8 max-w-[14ch]">
        <span className="block">Research is</span>
        <span className="serif block" style={{ fontSize: "1.08em" }}>
          the process.
        </span>
      </RevealText>

      <RevealText as="p" className="t-body measure mt-8">
        I have no papers to list. What I have instead is the set of questions
        each system left behind once it was working — and the positions I've
        arrived at so far. They constrain each other, which is why this is a
        graph and not a list.
      </RevealText>

      <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        {/* The graph. Capped so it stays a diagram on a wide screen rather
            than growing into a wall of dots. */}
        <div className="relative mx-auto w-full max-w-[34rem]">
          <svg
            ref={svgRef}
            viewBox="-100 -100 200 200"
            className="w-full"
            role="group"
            aria-label="Graph of open research questions"
          >
            {/* Edges */}
            {RESEARCH_EDGES.map(([a, b], i) => {
              const from = RESEARCH.find((n) => n.id === a)!;
              const to = RESEARCH.find((n) => n.id === b)!;
              const lit = active === a || active === b;
              return (
                <line
                  key={`${a}-${b}`}
                  data-edge
                  x1={from.x * R}
                  y1={from.y * R}
                  x2={to.x * R}
                  y2={to.y * R}
                  stroke={lit ? "rgb(var(--lime) / 0.5)" : "rgb(var(--text) / 0.14)"}
                  strokeWidth={lit ? 0.55 : 0.3}
                  style={{ transition: "stroke .45s var(--ease-out)" }}
                />
              );
            })}

            {/* Signal pulses */}
            {/* Pulses need real starting coordinates in the markup: GSAP
                tweens the cx/cy attributes, and reading "" as a length is a
                console error on every mount. */}
            {!reduced &&
              RESEARCH_EDGES.map(([a], i) => {
                const from = RESEARCH.find((n) => n.id === a)!;
                return (
                  <circle
                    key={i}
                    data-pulse={i}
                    cx={from.x * R}
                    cy={from.y * R}
                    r={0.6}
                    fill="rgb(var(--lime))"
                    opacity={0}
                  />
                );
              })}

            {/* Nodes */}
            {RESEARCH.map((n) => {
              const on = active === n.id;
              return (
                <g
                  key={n.id}
                  data-node
                  tabIndex={0}
                  role="button"
                  aria-pressed={on}
                  aria-label={n.question}
                  onMouseEnter={() => !touch && setActive(n.id)}
                  onFocus={() => setActive(n.id)}
                  onClick={() => setActive(n.id)}
                  style={{ cursor: "pointer", outline: "none" }}
                >
                  {/* Generous invisible hit area around a deliberately
                      small dot — the graph should read as an instrument
                      reading, not as a set of buttons. */}
                  <circle cx={n.x * R} cy={n.y * R} r={9} fill="transparent" />
                  <circle
                    cx={n.x * R}
                    cy={n.y * R}
                    r={on ? 2.3 : 1.4}
                    fill={on ? "rgb(var(--lime))" : "rgb(var(--text) / 0.65)"}
                    style={{ transition: "r .4s var(--ease-out), fill .4s" }}
                  />
                  {on && (
                    <circle
                      cx={n.x * R}
                      cy={n.y * R}
                      r={5.5}
                      fill="none"
                      stroke="rgb(var(--lime) / 0.35)"
                      strokeWidth={0.35}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* The reading panel */}
        <div aria-live="polite" className="min-h-[16rem]">
          <p className="t-mono t-mono-lime">{node.from}</p>
          <h3 className="serif mt-5 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.05]">
            {node.question}
          </h3>
          <p className="t-body mt-6">{node.position}</p>
          <a
            href={`#work`}
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector(`[data-project="${node.origin}"]`)
                ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
            }}
            className="t-mono mt-8 inline-flex items-center gap-2 no-underline transition-colors hover:text-[rgb(var(--lime))]"
          >
            See the system →
          </a>
        </div>
      </div>
    </section>
  );
};
