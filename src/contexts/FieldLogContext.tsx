import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RegionId } from "@/three/regions";

/**
 * The exploration layer of the gamification.
 *
 * The training mechanic (hold to charge a project silhouette) lives in the
 * ActivationSystem. This is the other half: a quiet log of what a visitor has
 * *seen* — which regions they've flown to, which lab concepts they've poked
 * at. It drives the field-log HUD and the "you've discovered X" toasts, and
 * gives a returning visitor on the same machine a sense that the world
 * remembers them — without inventing fake stats or locking content behind it.
 *
 * Session-scoped on purpose: a shared machine hands the next visitor a fresh
 * world, not a finished one.
 */

const REGIONS_KEY = "synaptic-regions";
const CONCEPTS_KEY = "synaptic-concepts";

export interface FieldLogValue {
  visitedRegions: RegionId[];
  discoveredConcepts: string[];
  markRegionVisited: (id: RegionId) => void;
  markConceptDiscovered: (id: string) => void;
  isRegionVisited: (id: RegionId) => boolean;
  isConceptDiscovered: (id: string) => boolean;
}

const FieldLogContext = createContext<FieldLogValue | null>(null);

const readSet = (key: string): string[] => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
};

const writeSet = (key: string, values: string[]) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(values));
  } catch {
    /* private mode — the log just won't persist, the page still works */
  }
};

export const FieldLogProvider = ({ children }: { children: React.ReactNode }) => {
  const [visitedRegions, setVisitedRegions] = useState<RegionId[]>(() =>
    readSet(REGIONS_KEY) as RegionId[],
  );
  const [discoveredConcepts, setDiscoveredConcepts] = useState<string[]>(() =>
    readSet(CONCEPTS_KEY),
  );
  const announced = useRef(new Set<string>());

  const markRegionVisited = useCallback((id: RegionId) => {
    setVisitedRegions((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeSet(REGIONS_KEY, next);
      if (!announced.current.has(`region:${id}`)) {
        announced.current.add(`region:${id}`);
        window.dispatchEvent(
          new CustomEvent("synaptic:discovered", {
            detail: { kind: "region", id },
          }),
        );
      }
      return next;
    });
  }, []);

  const markConceptDiscovered = useCallback((id: string) => {
    setDiscoveredConcepts((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeSet(CONCEPTS_KEY, next);
      if (!announced.current.has(`concept:${id}`)) {
        announced.current.add(`concept:${id}`);
        window.dispatchEvent(
          new CustomEvent("synaptic:discovered", {
            detail: { kind: "concept", id },
          }),
        );
      }
      return next;
    });
  }, []);

  const isRegionVisited = useCallback(
    (id: RegionId) => visitedRegions.includes(id),
    [visitedRegions],
  );

  const isConceptDiscovered = useCallback(
    (id: string) => discoveredConcepts.includes(id),
    [discoveredConcepts],
  );

  // Re-hydrate the "already announced" set so a returning session doesn't
  // re-fire discovery toasts for things it already saw.
  useEffect(() => {
    for (const r of visitedRegions) announced.current.add(`region:${r}`);
    for (const c of discoveredConcepts) announced.current.add(`concept:${c}`);
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<FieldLogValue>(
    () => ({
      visitedRegions,
      discoveredConcepts,
      markRegionVisited,
      markConceptDiscovered,
      isRegionVisited,
      isConceptDiscovered,
    }),
    [
      visitedRegions,
      discoveredConcepts,
      markRegionVisited,
      markConceptDiscovered,
      isRegionVisited,
      isConceptDiscovered,
    ],
  );

  return (
    <FieldLogContext.Provider value={value}>
      {children}
    </FieldLogContext.Provider>
  );
};

export const useFieldLog = (): FieldLogValue => {
  const ctx = useContext(FieldLogContext);
  if (!ctx) {
    // FieldLog is optional — if a view is rendered outside the provider it
    // shouldn't crash, just no-op.
    return {
      visitedRegions: [],
      discoveredConcepts: [],
      markRegionVisited: () => {},
      markConceptDiscovered: () => {},
      isRegionVisited: () => false,
      isConceptDiscovered: () => false,
    };
  }
  return ctx;
};
