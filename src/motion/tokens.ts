/**
 * Global motion tokens — single source of truth for the cinematic scroll
 * experience. Mirrors the spec table; sections pull from here instead of
 * reinventing per-component.
 */

export const EASE = {
  power1Out: "power1.out",
  power2InOut: "power2.inOut",
  power3Out: "power3.out",
  power4InOut: "power4.inOut",
  expoInOut: "expo.inOut",
  none: "none",
} as const;

/** Text reveal: blur(12px)→0, opacity 0→1, y 24→0, 0.9s power3.out. */
export const TEXT_REVEAL = {
  blur: 12,
  y: 24,
  duration: 0.9,
  ease: EASE.power3Out,
} as const;

/** Character stagger for split-text reveals. */
export const CHAR_STAGGER = { each: 0.02, from: "start" as const };

/** Card / element hover lift. */
export const HOVER_LIFT = { y: -6, duration: 0.3, ease: EASE.power2Out };

/** Magnetic button tracking. */
export const MAGNETIC = {
  radius: 80,
  pull: 0.3,
  duration: 0.4,
  ease: EASE.power3Out,
};

/** Cursor spotlight lerp factor — the lag is what makes it feel alive. */
export const SPOTLIGHT_LERP = 0.12;

/** Section-to-section transition window. */
export const SECTION_TRANSITION = {
  duration: 1.1,
  ease: EASE.power4InOut,
};

/** Single accent — electric blue. Defined once, referenced everywhere. */
export const ACCENT = "#3B82F6";

/** Neural particle caps (mobile / desktop). */
export const NEURAL_CAPS = { mobile: 150, desktop: 400 };

/** Image-sequence section. */
export const SEQUENCE = {
  frameCount: 90,
  pinDistance: 3000,
  scrub: 0.5,
};
