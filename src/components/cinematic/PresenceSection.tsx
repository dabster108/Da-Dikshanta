import { TextReveal, MagneticButton } from "@/motion/primitives";
import { Marquee } from "./Marquee";

const TECH = [
  "Python", "PyTorch", "TensorFlow", "OpenCV", "ROS 2", "Docker",
  "React", "Three.js", "GSAP", "Lenis", "NumPy", "CUDA", "SLAM",
  "Cryptography", "Multi-Agent", "Reinforcement L.", "Edge Inference",
];

const PRESENCE = [
  { label: "LinkedIn", href: "#", handle: "@dikshanta" },
  { label: "GitHub", href: "#", handle: "@dikshanta" },
  { label: "Resume", href: "#", handle: "PDF · 2026" },
  { label: "Email", href: "mailto:dikshanta@example.com", handle: "dikshanta@example.com" },
];

export const PresenceSection = () => (
  <section id="presence" className="relative px-6 py-32">
    <div className="mx-auto max-w-6xl">
      <div className="mb-12 flex flex-col gap-4">
        <span className="label-mono-accent">07 — Professional Presence</span>
        <TextReveal as="h2" className="display-lg text-foreground">
          Where to find the work.
        </TextReveal>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRESENCE.map((p) => (
          <MagneticButton
            key={p.label}
            href={p.href}
            className="panel sheen group relative flex flex-col gap-2 overflow-hidden p-6 transition-colors hover:border-primary/40"
            ariaLabel={p.label}
          >
            <span className="label-mono">{p.label}</span>
            <span className="text-lg text-foreground">{p.handle}</span>
            <span className="mt-auto inline-flex items-center gap-1 text-xs text-primary/70">
              open →
            </span>
          </MagneticButton>
        ))}
      </div>

      {/* Tech stack marquee */}
      <div className="mt-16">
        <div className="label-mono mb-4">stack</div>
        <Marquee items={TECH} />
      </div>
    </div>
  </section>
);
