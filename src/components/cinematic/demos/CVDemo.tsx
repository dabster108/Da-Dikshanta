import { useEffect, useRef, useState } from "react";

/**
 * Computer Vision demo — bounding boxes with live confidence scores over a
 * sample scene. Boxes drift slightly and confidence jitters to feel live.
 */
const BOXES = [
  { id: "person", label: "person", x: 0.10, y: 0.18, w: 0.30, h: 0.62, base: 0.94 },
  { id: "vehicle", label: "vehicle", x: 0.52, y: 0.40, w: 0.36, h: 0.36, base: 0.88 },
  { id: "sign", label: "sign", x: 0.78, y: 0.10, w: 0.16, h: 0.20, base: 0.79 },
];

export const CVDemo = () => {
  const [boxes, setBoxes] = useState(
    BOXES.map((b) => ({ ...b, conf: b.base })),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setBoxes((prev) =>
        prev.map((b) => ({
          ...b,
          conf: Math.max(0.5, Math.min(0.99, b.base + (Math.random() - 0.5) * 0.06)),
        })),
      );
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Stylized scene */}
      <svg viewBox="0 0 100 56" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <rect width="100" height="56" fill="hsl(220 30% 12%)" />
        <rect y="38" width="100" height="18" fill="hsl(220 20% 18%)" />
        <rect x="10" y="20" width="20" height="20" fill="hsl(214 60% 40% / 0.6)" />
        <rect x="55" y="28" width="25" height="14" fill="hsl(214 60% 45% / 0.7)" />
        <rect x="80" y="10" width="10" height="10" fill="hsl(40 80% 55% / 0.7)" />
      </svg>

      {boxes.map((b) => (
        <div
          key={b.id}
          className="absolute border border-primary/80"
          style={{
            left: `${b.x * 100}%`,
            top: `${b.y * 100}%`,
            width: `${b.w * 100}%`,
            height: `${b.h * 100}%`,
          }}
        >
          <span className="absolute -top-5 left-0 whitespace-nowrap bg-primary px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary-foreground">
            {b.label} {b.conf.toFixed(2)}
          </span>
        </div>
      ))}

      <div className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-widest text-primary/70">
        yolo · live · 30fps
      </div>
    </div>
  );
};
