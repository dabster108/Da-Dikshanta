/**
 * The spine of the experience.
 *
 * One continuous scroll, divided into chapters rather than sections. This
 * array is the single source for: the chapter indicator in the nav, the
 * ground-colour interpolation, and the scene state the 3D layer reads.
 *
 * `bg` values are raw RGB triples so ScrollController can interpolate them
 * channel-by-channel into `--chapter-bg` — the page ground is never switched,
 * only crossfaded (§3).
 *
 * `light` selects the lighting mood for the 3D layer (§28).
 */

export type ChapterId =
  | "opening"
  | "approach"
  | "research"
  | "capability"
  | "work"
  | "lab"
  | "timeline"
  | "contact";

export type LightMood = "neutral" | "cool" | "green" | "warm" | "dark";

export interface Chapter {
  id: ChapterId;
  /** Displayed index, 1-based. */
  index: string;
  /** Short label for the indicator. */
  label: string;
  /** Ground colour for this chapter, as an "r g b" triple. */
  bg: string;
  light: LightMood;
  /** Shown in the minimal top-right nav. Only the four destinations (§12). */
  inNav?: boolean;
}

export const CHAPTERS: Chapter[] = [
  { id: "opening", index: "01", label: "Opening", bg: "11 13 12", light: "neutral" },
  { id: "approach", index: "02", label: "Approach", bg: "16 19 17", light: "neutral", inNav: true },
  { id: "research", index: "03", label: "Research", bg: "18 24 21", light: "cool", inNav: true },
  { id: "capability", index: "04", label: "Capability", bg: "17 21 19", light: "green" },
  { id: "work", index: "05", label: "Work", bg: "21 25 20", light: "green", inNav: true },
  { id: "lab", index: "06", label: "Lab", bg: "17 21 26", light: "cool" },
  { id: "timeline", index: "07", label: "Timeline", bg: "20 19 15", light: "warm" },
  { id: "contact", index: "08", label: "Contact", bg: "11 13 12", light: "dark", inNav: true },
];

export const TOTAL = CHAPTERS.length;

export const NAV_LINKS = CHAPTERS.filter((c) => c.inNav);

export const chapterById = (id: ChapterId) => CHAPTERS.find((c) => c.id === id)!;
