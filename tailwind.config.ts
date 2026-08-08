import type { Config } from "tailwindcss";

/**
 * Tailwind reads every colour from the CSS custom properties in index.css.
 * Nothing is defined twice: change a token there and it changes here.
 *
 * `bg` is deliberately absent as a utility for page backgrounds — the page
 * ground is `--chapter-bg`, which ScrollController animates. Components use
 * `bg-surface` / `bg-bg-2` for local panels only.
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2.5rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-2": "rgb(var(--bg-2) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          raised: "rgb(var(--surface-raised) / <alpha-value>)",
        },
        text: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
          2: "rgb(var(--text-2) / <alpha-value>)",
          mute: "rgb(var(--text-mute) / <alpha-value>)",
        },
        lime: "rgb(var(--lime) / <alpha-value>)",
        blue: "rgb(var(--blue) / <alpha-value>)",
        warm: "rgb(var(--warm) / <alpha-value>)",
        line: "rgb(var(--line))",

        /* shadcn/ui compatibility — a handful of primitives still resolve
           these names. Mapped onto the same palette so nothing drifts. */
        border: "rgb(var(--line))",
        input: "rgb(var(--line-strong))",
        ring: "rgb(var(--lime) / <alpha-value>)",
        background: "rgb(var(--bg) / <alpha-value>)",
        foreground: "rgb(var(--text) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          foreground: "rgb(var(--text-mute) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--lime) / <alpha-value>)",
          foreground: "rgb(var(--bg) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          foreground: "rgb(var(--text-2) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(220 90 76 / <alpha-value>)",
          foreground: "rgb(var(--text) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--surface-raised) / <alpha-value>)",
          foreground: "rgb(var(--text) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          foreground: "rgb(var(--text) / <alpha-value>)",
        },
      },
      spacing: {
        gutter: "var(--gutter)",
        chapter: "var(--chapter-pad)",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "5px",
        pill: "999px",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        io: "var(--ease-io)",
      },
      zIndex: {
        scene: "0",
        content: "10",
        chrome: "40",
        cursor: "90",
        boot: "100",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
