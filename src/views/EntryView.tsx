import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
import { useIntroGate } from "@/hooks/use-intro-gate";
import { useFieldLog } from "@/contexts/FieldLogContext";
import DigitalCore from "@/components/DigitalCore";
import ScrambleText from "@/components/ScrambleText";

/**
 * Entry — the first region.
 *
 * The Digital Core is the centerpiece: a central orb with five system nodes
 * (AI, ROBOTICS, CRYPTO, SOFTWARE, VR). Hovering lights a node; clicking
 * flies the camera to that region. The 3D neural field assembles the name
 * behind it (SectionMorphs.runIntro); this overlay stays quiet until that
 * finishes, then fades in to point at the rest of the world.
 */
const social = [
  { icon: Github, href: "https://github.com/dabster108", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/dikshantachapagain/", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/_savage108", label: "Twitter" },
];

const EntryView = () => {
  const revealed = useIntroGate();
  const navigate = useNavigate();
  const { markRegionVisited } = useFieldLog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    markRegionVisited("entry");
  }, [markRegionVisited]);

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
      {/* Top row: a quiet mark. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Dikshanta&nbsp;Chapagain
        </span>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60 sm:inline">
          chapagaindikshanta.com.np
        </span>
      </motion.div>

      {/* Center: the Digital Core + thesis. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={revealed ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <DigitalCore />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-center"
        >
          <h1 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">
            <ScrambleText text="BUILDING INTELLIGENT SYSTEMS." speed={16} />
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            I build{" "}
            <span className="text-foreground">retrieval-augmented AI</span>,{" "}
            <span className="text-foreground">neural networks</span>, and{" "}
            <span className="text-foreground">multi-agent systems</span> — and
            ship the interfaces around them. This core is the world you're
            standing in. Pick a system to enter it.
          </p>
        </motion.div>
      </div>

      {/* Bottom row: the single affordance + socials. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={revealed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between gap-6"
      >
        <button
          type="button"
          onClick={() => navigate("/identity")}
          className="group flex items-center gap-3 text-left"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/15 transition-colors group-hover:border-primary-glow/60">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors group-hover:text-primary-glow">
              go
            </span>
            <span className="absolute inset-0 -z-10 rounded-full bg-primary-glow/0 blur-md transition-all duration-500 group-hover:bg-primary-glow/20" />
          </span>
          <span className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Enter
            </span>
            <span className="text-sm text-foreground">
              Start at Identity
            </span>
          </span>
        </button>

        <div className={`flex items-center gap-3 transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          {social.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default EntryView;
