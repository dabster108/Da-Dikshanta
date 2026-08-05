import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * DigitalCore — the interactive centerpiece of the landing region.
 *
 * A central orb with five system nodes orbiting it: AI, ROBOTICS, CRYPTO,
 * SOFTWARE, VR. Each maps to a region. Hovering a node lights it (accent
 * only when active — the rest of the time the core is dark); clicking flies
 * the camera there. Pure SVG/CSS so it doesn't fight the WebGL neural field
 * behind it for a second context.
 */

type Sys = "ai" | "robotics" | "crypto" | "software" | "vr";

const SYSTEMS: { id: Sys; label: string; route: string; color: string; angle: number }[] = [
  { id: "ai", label: "AI", route: "/lab", color: "hsl(245 90% 68%)", angle: -90 },
  { id: "robotics", label: "ROBOTICS", route: "/robotics", color: "hsl(175 80% 55%)", angle: -18 },
  { id: "crypto", label: "CRYPTO", route: "/crypto", color: "hsl(35 95% 60%)", angle: 54 },
  { id: "software", label: "SOFTWARE", route: "/projects", color: "hsl(200 80% 60%)", angle: 126 },
  { id: "vr", label: "VR", route: "/projects", color: "hsl(320 80% 65%)", angle: 198 },
];

const DigitalCore = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<Sys | null>(null);

  const pos = (angle: number, r: number) => {
    const a = (angle * Math.PI) / 180;
    return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
  };

  return (
    <div className="relative aspect-square w-full max-w-[420px]">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {/* faint orbit ring */}
        <circle cx="50" cy="50" r="34" fill="none" stroke="hsl(220 14% 100% / 0.06)" strokeWidth="0.3" />

        {/* connections from core to each node — lit only when active */}
        {SYSTEMS.map((s) => {
          const p = pos(s.angle, 34);
          const lit = active === s.id;
          return (
            <line
              key={`line-${s.label}`}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              stroke={lit ? s.color : "hsl(220 14% 100% / 0.08)"}
              strokeWidth={lit ? 0.6 : 0.3}
              strokeOpacity={lit ? 0.8 : 0.5}
              style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
            />
          );
        })}

        {/* the core */}
        <motion.circle
          cx="50"
          cy="50"
          r="6"
          fill="hsl(230 35% 6%)"
          stroke={active ? SYSTEMS.find((s) => s.id === active)?.color : "hsl(220 14% 100% / 0.2)"}
          strokeWidth="0.5"
          animate={{ scale: active ? 1.05 : 1 }}
          style={{ transformOrigin: "50px 50px", transition: "stroke 0.3s" }}
        />
        <circle cx="50" cy="50" r="2" fill={active ? SYSTEMS.find((s) => s.id === active)?.color : "hsl(220 14% 70%)"} style={{ transition: "fill 0.3s" }} />

        {/* system nodes */}
        {SYSTEMS.map((s) => {
          const p = pos(s.angle, 34);
          const lit = active === s.id;
          return (
            <g
              key={s.label}
              onMouseEnter={() => setActive(s.id)}
              onMouseLeave={() => setActive(null)}
              onClick={() => navigate(s.route)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={lit ? 3.4 : 2.6}
                fill={lit ? s.color : "hsl(225 22% 12%)"}
                stroke={lit ? s.color : "hsl(220 14% 100% / 0.25)"}
                strokeWidth="0.4"
                style={{ transition: "r 0.25s, fill 0.25s, stroke 0.25s" }}
              />
              <text
                x={p.x}
                y={p.y - 5}
                textAnchor="middle"
                fontSize="2.6"
                fontFamily="monospace"
                fill={lit ? s.color : "hsl(220 10% 65%)"}
                style={{ transition: "fill 0.25s", letterSpacing: "0.1em" }}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* center readout */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="mt-16 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60">
            {active ? SYSTEMS.find((s) => s.id === active)?.label : "core"}
          </p>
          <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground/40">
            {active ? "click to enter" : "hover a system"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DigitalCore;
