import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon } from "lucide-react";
import SynapticCartography from "@/components/effects/SynapticCartography";
import NodeMap from "@/components/NodeMap";
import CommandPalette from "@/components/CommandPalette";
import Terminal from "@/components/Terminal";
import BootSequence, { bootAlreadyPlayed } from "@/components/BootSequence";
import EasterEggs from "@/components/EasterEggs";
import Cursor from "@/components/Cursor";
import { FieldLogProvider } from "@/contexts/FieldLogContext";
import { ScrollProvider } from "@/contexts/ScrollContext";
import { REGIONS, regionByRoute, type RegionId } from "@/three/regions";

/**
 * The persistent world.
 *
 * The 3D scene mounts exactly once here and never remounts on navigation —
 * routes just tell the camera where to fly. Everything a visitor sees (the
 * node map, the command palette, the field log, the routed view) floats on
 * top of that one persistent canvas.
 */

/** Legacy in-page section ids → region routes, so old copy that calls
 *  scrollToSection("projects") still does the right thing in the new IA. */
const LEGACY_SECTION_TO_ROUTE: Record<string, RegionId> = {
  hero: "entry",
  about: "identity",
  skills: "lab",
  projects: "projects",
  contact: "contact",
};

const Shell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const [booting, setBooting] = useState(() => !bootAlreadyPlayed());
  const [termOpen, setTermOpen] = useState(false);

  // Backtick (`) opens the terminal — unless the visitor is already typing
  // in an input/textarea/contenteditable.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "`") return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;
      e.preventDefault();
      setTermOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Match the route to a region. Project case studies live "inside" the
  // projects region, so the camera stays at the projects anchor when a
  // visitor is reading a case study rather than flying away.
  const region = useMemo(() => {
    if (location.pathname.startsWith("/projects/")) {
      return REGIONS.find((r) => r.id === "projects")!;
    }
    return regionByRoute(location.pathname) ?? REGIONS[0];
  }, [location.pathname]);

  // Scroll to top on region change — a new view starts at the top, not at
  // whatever scroll position the previous view was at.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const scrollToSection = useCallback(
    (target: string | HTMLElement) => {
      if (typeof target !== "string") {
        target.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const regionId = LEGACY_SECTION_TO_ROUTE[target] ?? (target as RegionId);
      const targetRegion = REGIONS.find((r) => r.id === regionId);
      if (targetRegion) {
        navigate(targetRegion.route);
        return;
      }
      // Not a region — try an in-page anchor.
      const element = document.getElementById(target);
      element?.scrollIntoView({ behavior: "smooth" });
    },
    [navigate],
  );

  return (
    <FieldLogProvider>
      <ScrollProvider value={{ scrollToSection }}>
        {/* Cinematic atmosphere stack — fixed, pointer-events-none. */}
        <div className="atmos-vignette" aria-hidden />
        <div className="atmos-fog" aria-hidden />
        <div className="atmos-grain" aria-hidden />
        <div className="atmos-scanlines" aria-hidden />

        {booting && <BootSequence onComplete={() => setBooting(false)} />}

        <SynapticCartography regionT={region.t}>
          <main
            ref={mainRef}
            className="relative z-10 min-h-screen"
            data-region={region.id}
          >
            {/* Per-route key so AnimatePresence can crossfade between views. */}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname.split("/")[1] || "entry"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </SynapticCartography>
        <NodeMap />
        <CommandPalette />

        {/* Terminal trigger — a quiet chip in the corner. Backtick also opens it. */}
        <button
          onClick={() => setTermOpen(true)}
          className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full border border-white/10 bg-card/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary-glow/50 hover:text-foreground sm:flex"
          aria-label="open terminal"
        >
          <TerminalIcon className="h-3.5 w-3.5" />
          terminal
          <kbd className="ml-1 rounded border border-white/10 px-1 text-[9px]">`</kbd>
        </button>
        <Terminal open={termOpen} onClose={() => setTermOpen(false)} />
        <EasterEggs />
        <Cursor />
      </ScrollProvider>
    </FieldLogProvider>
  );
};

export default Shell;
