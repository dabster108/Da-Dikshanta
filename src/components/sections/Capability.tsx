import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CAPABILITIES, CAPABILITY_COUNT } from "@/data/capabilities";
import { PROJECTS } from "@/data/projects";
import { RevealText } from "@/components/typography/RevealText";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Capability (§15) — a map, not a bar chart.
 *
 * Deliberately a dendrogram rather than another free-form graph: the
 * research chapter already spent a node network, and repeating the form
 * would make the two chapters read as the same idea twice (§52).
 *
 * There are no proficiency percentages here on purpose. What each leaf
 * carries instead is *evidence*: hover one and the projects that demonstrate
 * it light up. The final branch, "Exploring", has no evidence and says so —
 * the distinction between shipped and studied is the honest part of the map
 * and it is drawn, not buried in a caption.
 */

export const Capability = () => {
  const rootRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const evidence = hovered
    ? CAPABILITIES.flatMap((b) => b.nodes).find((n) => n.id === hovered)?.evidence ?? []
    : [];

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Spines draw downward as each branch enters.
      root.querySelectorAll<HTMLElement>("[data-spine]").forEach((spine) => {
        gsap.fromTo(
          spine,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: spine.closest("[data-branch]"),
              start: "top 80%",
              end: "bottom 70%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      // Leaves arrive along their branch.
      root.querySelectorAll<HTMLElement>("[data-branch]").forEach((branch) => {
        gsap.from(branch.querySelectorAll("[data-leaf]"), {
          opacity: 0,
          x: -14,
          duration: 0.7,
          stagger: 0.05,
          ease: "power3.out",
          scrollTrigger: { trigger: branch, start: "top 72%", once: true },
        });
      });

      if (reduced) return;

      // A signal travelling down each spine. Four elements, one tween each.
      root.querySelectorAll<HTMLElement>("[data-signal]").forEach((dot, i) => {
        gsap.fromTo(
          dot,
          { top: "0%", opacity: 0 },
          {
            top: "100%",
            opacity: 1,
            duration: 3.2,
            ease: "none",
            repeat: -1,
            delay: i * 0.9,
            repeatDelay: 1.4,
            yoyo: false,
            onRepeat() {
              gsap.set(dot, { opacity: 0 });
              gsap.to(dot, { opacity: 1, duration: 0.4 });
            },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      data-chapter="capability"
      id="capability"
      className="relative px-gutter py-chapter"
      aria-label="Capability"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="t-mono">04 — Capability</p>
        <p className="t-mono">
          <span className="t-mono-lime tabular-nums">{CAPABILITY_COUNT}</span> nodes ·
          evidence-linked
        </p>
      </div>

      <RevealText as="h2" className="t-chapter mt-8 max-w-[16ch]">
        <span className="block">What I can</span>
        <span className="serif block" style={{ fontSize: "1.08em" }}>
          actually build.
        </span>
      </RevealText>

      <RevealText as="p" className="t-body measure mt-8">
        No percentages. A number next to a language is a claim nobody can
        check. Every leaf below links to the work that demonstrates it —
        except the last branch, which is what I'm reading now and is marked
        as exactly that.
      </RevealText>

      {/* The map */}
      <div className="mt-16 sm:mt-24">
        {CAPABILITIES.map((branch) => {
          const exploring = branch.id === "exploring";
          return (
            <div
              key={branch.id}
              data-branch
              className="grid gap-x-10 gap-y-5 border-t py-10 hairline sm:grid-cols-[minmax(11rem,18rem)_1fr] sm:py-14"
            >
              {/* Branch */}
              <div>
                <h3
                  className="serif text-[clamp(1.75rem,3.2vw,2.5rem)] leading-none"
                  style={{ color: exploring ? "rgb(var(--text-mute))" : undefined }}
                >
                  {branch.label}
                </h3>
                <p className="mt-3 max-w-[26ch] text-[0.9rem] leading-relaxed text-mute">
                  {branch.note}
                </p>
              </div>

              {/* Spine + leaves */}
              <div className="relative pl-6 sm:pl-8">
                <div
                  data-spine
                  className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px origin-top"
                  style={{
                    background: exploring
                      ? "repeating-linear-gradient(to bottom, rgb(var(--text) / 0.22) 0 3px, transparent 3px 7px)"
                      : "rgb(var(--text) / 0.22)",
                  }}
                />
                {!reduced && !exploring && (
                  <span
                    data-signal
                    className="absolute left-[-1.5px] h-6 w-[4px] rounded-full"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent, rgb(var(--lime)), transparent)",
                    }}
                  />
                )}

                <ul className="flex flex-col gap-1">
                  {branch.nodes.map((n) => {
                    const on = hovered === n.id;
                    const hasEvidence = !!n.evidence?.length;
                    return (
                      <li key={n.id} data-leaf className="relative">
                        {/* Elbow tick into the spine */}
                        <span
                          className="absolute left-[-1.5rem] top-1/2 h-px w-4 sm:left-[-2rem] sm:w-6"
                          style={{
                            background: on
                              ? "rgb(var(--lime))"
                              : "rgb(var(--text) / 0.22)",
                            transition: "background .35s var(--ease-out)",
                          }}
                        />
                        <button
                          type="button"
                          onMouseEnter={() => setHovered(n.id)}
                          onMouseLeave={() => setHovered(null)}
                          onFocus={() => setHovered(n.id)}
                          onBlur={() => setHovered(null)}
                          disabled={!hasEvidence}
                          aria-describedby={hasEvidence ? "capability-evidence" : undefined}
                          className="w-full py-1.5 text-left text-[1.02rem] transition-colors duration-300 disabled:cursor-default"
                          style={{
                            color: on
                              ? "rgb(var(--lime))"
                              : hasEvidence
                                ? "rgb(var(--text))"
                                : "rgb(var(--text-mute))",
                          }}
                        >
                          {n.label}
                          {!hasEvidence && (
                            <span className="t-mono ml-3 align-middle">reading</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
        <div className="border-t hairline" />
      </div>

      {/* Evidence readout — the payload of the whole interaction. */}
      <div
        id="capability-evidence"
        aria-live="polite"
        className="mt-10 flex min-h-[3.5rem] flex-wrap items-center gap-x-3 gap-y-2"
      >
        {evidence.length > 0 ? (
          <>
            <span className="t-mono">Demonstrated in</span>
            {evidence.map((id) => {
              const p = PROJECTS.find((pr) => pr.id === id);
              if (!p) return null;
              return (
                <span
                  key={id}
                  className="rounded-pill border px-3 py-1 text-[0.82rem] hairline"
                  style={{ color: "rgb(var(--lime))" }}
                >
                  {p.shortTitle}
                </span>
              );
            })}
          </>
        ) : (
          <span className="t-mono">Hover a capability to see where it was used</span>
        )}
      </div>
    </section>
  );
};
