import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { REGIONS, regionByRoute, type RegionId } from "@/three/regions";
import { useFieldLog } from "@/contexts/FieldLogContext";
import { cn } from "@/lib/utils";

/**
 * The 2D counterpart to the 3D network.
 *
 * The 3D scene is the world; this is its legend. A row of nodes connected by
 * the same curve the camera flies along — the current node is where the
 * camera "is," visited nodes are filled, unvisited are hollow. Clicking a
 * node routes there and the camera flies to it.
 *
 * Deliberately not a navbar: no "Home | About | Projects" labels, no
 * underline-on-hover. It reads as a map of a place, not a list of links.
 */
const NodeMap = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRegionVisited, visitedRegions, discoveredConcepts } = useFieldLog();
  const [hovered, setHovered] = useState<RegionId | null>(null);

  const current = useMemo(
    () => regionByRoute(location.pathname) ?? REGIONS[0],
    [location.pathname],
  );

  // The current region counts as visited the moment the camera arrives.
  const { markRegionVisited } = useFieldLog();
  useEffect(() => {
    markRegionVisited(current.id);
  }, [current.id, markRegionVisited]);

  const discoveredCount = visitedRegions.length + discoveredConcepts.length;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:pb-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-background/55 px-3 py-2 backdrop-blur-md sm:gap-4 sm:px-4"
      >
        {/* Field-log counter — the only number on the screen. */}
        <div
          className="hidden items-center gap-1.5 border-r border-white/10 pr-3 sm:flex"
          title="Discovered regions and lab concepts"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary-glow shadow-[0_0_8px_2px_hsl(var(--primary-glow)/0.7)]" />
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {String(discoveredCount).padStart(2, "0")}
          </span>
        </div>

        <ol className="flex items-center gap-1.5 sm:gap-2">
          {REGIONS.map((region, index) => {
            const isCurrent = region.id === current.id;
            const visited = isRegionVisited(region.id);
            const showLabel = isCurrent || hovered === region.id;

            return (
              <li key={region.id} className="flex items-center">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mx-0.5 h-px w-3 transition-colors duration-500 sm:w-5",
                      isCurrent || visited
                        ? "bg-primary-glow/60"
                        : "bg-white/15",
                    )}
                  />
                )}
                <button
                  type="button"
                  onClick={() => navigate(region.route)}
                  onMouseEnter={() => setHovered(region.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(region.id)}
                  onBlur={() => setHovered(null)}
                  aria-label={`${region.label} — ${region.blurb}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className="group relative flex items-center justify-center"
                >
                  {/* The node itself: a ring that fills when visited, */}
                  {/* grows and brightens when it's where the camera is. */}
                  <span
                    className={cn(
                      "relative flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-500 sm:h-8 sm:w-8",
                      isCurrent
                        ? "border-primary-glow bg-primary-glow/15 shadow-[0_0_14px_2px_hsl(var(--primary-glow)/0.55)]"
                        : visited
                          ? "border-primary/50 bg-primary/10"
                          : "border-white/15 bg-transparent group-hover:border-white/40",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[9px] tracking-wider transition-colors sm:text-[10px]",
                        isCurrent
                          ? "text-primary-glow"
                          : visited
                            ? "text-primary/80"
                            : "text-muted-foreground/60",
                      )}
                    >
                      {region.mark}
                    </span>
                  </span>

                  {/* Label appears for the current node and on hover. */}
                  <span
                    className={cn(
                      "pointer-events-none absolute -top-8 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] transition-opacity duration-300",
                      showLabel
                        ? "opacity-100"
                        : "opacity-0",
                      isCurrent ? "text-primary-glow" : "text-muted-foreground",
                    )}
                  >
                    {region.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </motion.div>
    </div>
  );
};

export default NodeMap;
