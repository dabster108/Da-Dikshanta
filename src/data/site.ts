/**
 * Single source of truth for identity, contact channels and section order.
 * Anything that appears in more than one place lives here.
 */

export const PROFILE = {
  name: "Dikshanta Chapagain",
  shortName: "Dikshanta",
  role: "AI Engineer & Software Developer",
  thesis: "I design, build, research and deploy intelligent software.",
  portrait: "/images/me.jpeg",
  portraitAlt: "Portrait of Dikshanta Chapagain",
  location: "Budhanilkantha, Kathmandu",
  institution: "Softwarica College of IT and E-Commerce",
  degree: "BSc (Hons) Computing with Artificial Intelligence",
  graduation: "2026",
  site: "chapagaindikshanta.com.np",
} as const;

/** The disciplines. Order matters — this drives the hero readout and the
 *  capability rail. Each maps to a lab module or a body of shipped work. */
export const DISCIPLINES = [
  "Artificial Intelligence",
  "Machine Learning",
  "Computer Vision",
  "Robotics",
  "Cryptography",
  "Software Engineering",
  "Research",
] as const;

export type ChannelId = "email" | "linkedin" | "github" | "resume";

export interface Channel {
  id: ChannelId;
  label: string;
  /** What the visitor gets by opening it — shown under the label. */
  detail: string;
  href: string;
  external: boolean;
  /** Angle in degrees on the presence graph, 0 = right, clockwise. */
  angle: number;
}

export const CHANNELS: Channel[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    detail: "Professional history, endorsements, and what I'm working on now",
    href: "https://www.linkedin.com/in/dikshantachapagain/",
    external: true,
    angle: -90,
  },
  {
    id: "github",
    label: "GitHub",
    detail: "Source for every project on this site — commits, not screenshots",
    href: "https://github.com/dabster108",
    external: true,
    angle: -18,
  },
  {
    id: "resume",
    label: "Résumé",
    detail: "One page, PDF — education, stack, and shipped work",
    href: "/cv/DIKSHANTA_CHAPAGAIN_RESUME.pdf",
    external: true,
    angle: 54,
  },
  {
    id: "email",
    label: "Email",
    detail: "dikshanta108@gmail.com — the fastest way to reach me",
    href: "mailto:dikshanta108@gmail.com",
    external: false,
    angle: 126,
  },
];

export const CONTACT = {
  email: "dikshanta108@gmail.com",
  phone: "+977 9843410777",
  location: "Budhanilkantha, Kathmandu, Nepal",
  mapUrl: "https://maps.google.com/?q=Budhanilkantha,Kathmandu,Nepal",
  twitter: "https://x.com/_savage108",
} as const;

/** Scroll sections in document order. `t` is the normalised scroll position
 *  the 3D camera targets when this section fills the viewport. */
export interface SectionMeta {
  id: string;
  index: string;
  label: string;
  t: number;
}

export const SECTIONS: SectionMeta[] = [
  { id: "entry", index: "00", label: "Entry", t: 0 },
  { id: "identity", index: "01", label: "Identity", t: 0.18 },
  { id: "journey", index: "02", label: "Journey", t: 0.36 },
  { id: "lab", index: "03", label: "Lab", t: 0.56 },
  { id: "work", index: "04", label: "Work", t: 0.78 },
  { id: "contact", index: "05", label: "Contact", t: 1 },
];
