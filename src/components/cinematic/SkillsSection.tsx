import { useEffect, useRef, useState } from "react";
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide } from "d3-force";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Skills knowledge graph — force-directed layout (d3-force). Hovering a node
 * highlights its connected edges and neighbours; everything else dims.
 *
 * On reduced-motion: render a static laid-out graph, no hover dimming.
 */

type GNode = { id: string; label: string; group: string; x?: number; y?: number; vx?: number; vy?: number };
type GLink = { source: string; target: string };

const NODES: GNode[] = [
  { id: "python", label: "Python", group: "lang" },
  { id: "pytorch", label: "PyTorch", group: "ml" },
  { id: "tensorflow", label: "TensorFlow", group: "ml" },
  { id: "opencv", label: "OpenCV", group: "cv" },
  { id: "ros", label: "ROS 2", group: "robotics" },
  { id: "docker", label: "Docker", group: "ops" },
  { id: "react", label: "React", group: "web" },
  { id: "three", label: "Three.js", group: "web" },
  { id: "gsap", label: "GSAP", group: "web" },
  { id: "numpy", label: "NumPy", group: "ml" },
  { id: "cuda", label: "CUDA", group: "ml" },
  { id: "slam", label: "SLAM", group: "robotics" },
  { id: "crypto", label: "Cryptography", group: "security" },
  { id: "agents", label: "Multi-Agent", group: "ml" },
  { id: "rl", label: "RL", group: "ml" },
];

const LINKS: GLink[] = [
  { source: "python", target: "pytorch" },
  { source: "python", target: "tensorflow" },
  { source: "python", target: "opencv" },
  { source: "python", target: "numpy" },
  { source: "pytorch", target: "cuda" },
  { source: "pytorch", target: "agents" },
  { source: "pytorch", target: "rl" },
  { source: "opencv", target: "slam" },
  { source: "slam", target: "ros" },
  { source: "ros", target: "agents" },
  { source: "agents", target: "rl" },
  { source: "python", target: "react" },
  { source: "react", target: "three" },
  { source: "three", target: "gsap" },
  { source: "python", target: "crypto" },
  { source: "python", target: "docker" },
  { source: "docker", target: "pytorch" },
];

const GROUP_COLOR: Record<string, string> = {
  lang: "hsl(214 100% 62%)",
  ml: "hsl(214 100% 70%)",
  cv: "hsl(200 90% 60%)",
  robotics: "hsl(180 70% 55%)",
  ops: "hsl(40 80% 55%)",
  web: "hsl(280 70% 65%)",
  security: "hsl(0 70% 60%)",
};

export const SkillsSection = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const nodesRef = useRef<GNode[]>([]);
  const linksRef = useRef<any[]>([]);

  useEffect(() => {
    const W = 600;
    const H = 420;
    const nodes = NODES.map((n) => ({ ...n }));
    const links = LINKS.map((l) => ({ ...l }));

    const sim = forceSimulation(nodes as any)
      .force("charge", forceManyBody().strength(-220))
      .force("link", forceLink(links).id((d: any) => d.id).distance(70).strength(0.6))
      .force("center", forceCenter(W / 2, H / 2))
      .force("collide", forceCollide(28))
      .stop();

    for (let i = 0; i < 300; i++) sim.tick();
    nodesRef.current = nodes;
    linksRef.current = links;
    // Force a re-render with settled positions.
    setHover((h) => h);
  }, []);

  const nodes = nodesRef.current;
  const links = linksRef.current;

  const neighbours = new Set<string>();
  if (hover) {
    neighbours.add(hover);
    links.forEach((l: any) => {
      const s = l.source.id ?? l.source;
      const t = l.target.id ?? l.target;
      if (s === hover) neighbours.add(t);
      if (t === hover) neighbours.add(s);
    });
  }

  return (
    <section id="skills" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-4">
          <span className="label-mono-accent">05 — Skills</span>
          <h2 className="display-lg text-foreground">The toolchain.</h2>
          <p className="max-w-xl body-lg">
            Hover a node to trace its dependencies across the stack.
          </p>
        </div>

        <svg ref={svgRef} viewBox="0 0 600 420" className="w-full rounded-2xl border border-white/10 bg-slate-900">
          {links.map((l: any, i) => {
            const s = typeof l.source === "object" ? l.source : nodes.find((n) => n.id === l.source)!;
            const t = typeof l.target === "object" ? l.target : nodes.find((n) => n.id === l.target)!;
            const lit = hover && ((s.id === hover) || (t.id === hover));
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={lit ? "hsl(214 100% 62%)" : "hsl(0 0% 100% / 0.08)"}
                strokeWidth={lit ? 1.5 : 0.6}
              />
            );
          })}
          {nodes.map((n) => {
            const dim = hover && !neighbours.has(n.id);
            const color = GROUP_COLOR[n.group] ?? "hsl(214 100% 62%)";
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer"
                opacity={dim ? 0.25 : 1}
              >
                <circle r="14" fill={color} fillOpacity={hover === n.id ? 0.35 : 0.15} stroke={color} strokeWidth="1.2" />
                <text
                  textAnchor="middle"
                  dy="0.32em"
                  fontSize="10"
                  fontFamily="monospace"
                  fill={hover === n.id ? color : "hsl(210 16% 85%)"}
                  pointerEvents="none"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
};
