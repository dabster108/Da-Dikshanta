import { createContext, useContext, useEffect, useRef } from "react";

export interface SynapticContextValue {
  /** The WebGL scene actually mounted (false on failure / SSR). */
  ready: boolean;
  reducedMotion: boolean;
  total: number;
  activated: string[];
  completed: boolean;
  /** Bind a project card so it can be charged and can show its scanline. */
  registerPanel: (id: string, element: HTMLElement | null) => void;
  /** Reduced-motion fallback: scrolling a card into view counts as training. */
  markSeen: (id: string) => void;
}

const noop = () => {};

export const SynapticContext = createContext<SynapticContextValue>({
  ready: false,
  reducedMotion: false,
  total: 0,
  activated: [],
  completed: false,
  registerPanel: noop,
  markSeen: noop,
});

export const useSynaptic = () => useContext(SynapticContext);

/**
 * Card-level helper: returns the ref to attach and whether this project has
 * been trained. Charge progress is written straight to the element as a
 * `--charge` custom property rather than React state — it updates every frame
 * and has no business re-rendering the card.
 */
export const useProjectActivation = (id: string) => {
  const { registerPanel, activated, reducedMotion, markSeen } = useSynaptic();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerPanel(id, ref.current);
    return () => registerPanel(id, null);
  }, [id, registerPanel]);

  useEffect(() => {
    if (!reducedMotion || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markSeen(id);
      },
      { threshold: 0.4 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [id, markSeen, reducedMotion]);

  return {
    ref,
    isActivated: activated.includes(id),
  };
};
