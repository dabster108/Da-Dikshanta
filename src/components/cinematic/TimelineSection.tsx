import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const MILESTONES = [
  { year: "2019", title: "First model in production", body: "A vision pipeline that ran on a Raspberry Pi, classifying defects on a factory line." },
  { year: "2020", title: "Robotics stack", body: "Built a SLAM + control stack in ROS 2 for an indoor mobile robot." },
  { year: "2021", title: "Fraud detection at scale", body: "Shipped a real-time fraud model processing thousands of events per second." },
  { year: "2022", title: "Multi-agent systems", body: "Designed a protocol where three agents coordinate to explore an unknown environment." },
  { year: "2023", title: "Edge inference", body: "Quantized a transformer down to 240ms latency on an ARM edge device." },
  { year: "2024", title: "Research → portfolio", body: "Folded the research into this site — the work is the demo." },
];

/**
 * Timeline — horizontal scroll-jacked track. Vertical scroll translates into
 * horizontal movement; milestones scale up as they cross the viewport center.
 *
 * On reduced-motion: render as a vertical list, no scroll-jack.
 */
export const TimelineSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scales, setScales] = useState<number[]>(MILESTONES.map(() => 1));
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || reduced) return;

    const tween = gsap.to(track, {
      xPercent: -70,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: () => updateScales(),
      },
    });

    const updateScales = () => {
      const center = window.innerWidth / 2;
      const next = MILESTONES.map((_, i) => {
        const el = track.querySelector<HTMLElement>(`[data-ms="${i}"]`);
        if (!el) return 1;
        const r = el.getBoundingClientRect();
        const mid = r.left + r.width / 2;
        const d = Math.abs(mid - center);
        // Max scale 1.15 at center, 0.85 at edges.
        const norm = Math.max(0, 1 - d / (window.innerWidth * 0.45));
        return 0.85 + norm * 0.3;
      });
      setScales(next);
    };
    updateScales();
    window.addEventListener("resize", updateScales);

    return () => {
      window.removeEventListener("resize", updateScales);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section id="timeline" ref={sectionRef} className="px-6 py-32">
        <div className="mx-auto max-w-3xl space-y-10">
          <h2 className="display-lg text-foreground">Timeline</h2>
          {MILESTONES.map((m) => (
            <div key={m.year} className="border-l border-white/10 pl-6">
              <span className="label-mono-accent">{m.year}</span>
              <h3 className="display-md mt-2 text-foreground">{m.title}</h3>
              <p className="mt-2 body-lg">{m.body}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="timeline" ref={sectionRef} className="relative h-screen overflow-hidden">
      <div className="absolute left-6 top-6 z-10">
        <span className="label-mono-accent">06 — Timeline</span>
      </div>
      <div className="flex h-full items-center">
        <div ref={trackRef} className="flex gap-16 px-[20vw]">
          {MILESTONES.map((m, i) => (
            <div
              key={m.year}
              data-ms={i}
              className="w-[60vw] shrink-0 md:w-[36vw]"
              style={{
                transform: `scale(${scales[i]})`,
                transformOrigin: "center",
                transition: "transform 0.15s linear",
              }}
            >
              <div className="panel h-full p-8">
                <span className="label-mono-accent">{m.year}</span>
                <h3 className="display-md mt-4 text-foreground">{m.title}</h3>
                <p className="mt-4 body-lg">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
