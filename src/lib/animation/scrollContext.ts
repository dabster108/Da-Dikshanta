import { createContext, useContext } from "react";
import type { ChapterId } from "@/data/chapters";

/**
 * The scroll context, kept in its own module.
 *
 * It lives apart from `ScrollController` so that file exports a component and
 * nothing else — mixing a component export with hook/constant exports breaks
 * React Fast Refresh for every consumer of the module.
 */
export interface ScrollAPI {
  chapter: number;
  chapterId: ChapterId;
  scrollTo: (target: string | HTMLElement | number, opts?: { immediate?: boolean }) => void;
  /** Freeze the page behind an overlay. Exposed as a callback rather than the
   *  Lenis instance itself: the instance is created in an effect, so a context
   *  value holding it would be null for every consumer's first render and only
   *  correct itself on an unrelated re-render. */
  setLocked: (locked: boolean) => void;
}

export const ScrollContext = createContext<ScrollAPI>({
  chapter: 0,
  chapterId: "opening",
  scrollTo: () => {},
  setLocked: () => {},
});

export const useScroll = () => useContext(ScrollContext);
