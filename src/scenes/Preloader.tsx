import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { PROFILE } from "@/data/site";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Preloader — Boot → Train → Converge → Name → Wipe.
 *
 * Same narrative as before (boot log + loss curve + epoch counter), but the
 * resolve is no longer "DC" dots — it becomes the full name
 * "Dikshanta Chapagain" in huge display type.
 *
 *   BOOT  →  TRAIN  →  CONVERGE  →  NAME (~5s)  →  WIPE
 *   0.00s    0.55s      2.00s        2.25s          6.4s
 */

const CURVE_W = 320;
const CURVE_H = 140;
const LOSS_MAX = 2.6;

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const buildCurvePath = () => {
  const rand = rng(20260806);
  const N = 64;
  const pts: string[] = [];
  for (let i = 0; i <= N; i += 1) {
    const t = i / N;
    const base = 2.41 * Math.exp(-t * 4.2) + 0.02;
    const envelope = 0.34 * Math.exp(-t * 1.9) + 0.018;
    const spike = rand() > 0.93 ? (rand() - 0.3) * envelope * 2.4 : 0;
    const loss = Math.max(0.01, base + (rand() - 0.5) * envelope * 2 + spike);
    const x = 8 + t * (CURVE_W - 16);
    const y = 8 + (1 - Math.min(loss, LOSS_MAX) / LOSS_MAX) * (CURVE_H - 18);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
};

const CURVE_D = buildCurvePath();

const BOOT_LINES = [
  "initializing environment",
  "loading model: vision · nlp · crypto · agents · graph · render",
  "allocating memory",
  "starting training loop",
];

const FINAL_READOUT = "checkpoint saved: dikshanta_chapagain.pt ✓";

const accentColor = () => {
  if (typeof window === "undefined") return "hsl(188 100% 50%)";
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  return raw ? `hsl(${raw})` : "hsl(188 100% 50%)";
};

export const Preloader = ({ onDone }: { onDone: () => void }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef<HTMLDivElement>(null);
  const curveWrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLHeadingElement>(null);
  const lastRef = useRef<HTMLHeadingElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const boot = bootRef.current;
    const curveWrap = curveWrapRef.current;
    const path = pathRef.current;
    const head = headRef.current;
    const readout = readoutRef.current;
    const name = nameRef.current;
    const first = firstRef.current;
    const last = lastRef.current;
    if (!root || !boot || !curveWrap || !path || !head || !readout || !name || !first || !last) return;

    const bootLines = Array.from(boot.querySelectorAll<HTMLElement>(".boot-line"));
    const accent = accentColor();

    /* Reduced motion: show final name, fade out. */
    if (reduced) {
      gsap.set([boot, curveWrap, head], { autoAlpha: 0 });
      gsap.set(name, { autoAlpha: 1 });
      gsap.set([first, last], { y: "0%", opacity: 1, filter: "blur(0px)" });
      readout.textContent = FINAL_READOUT;
      gsap.set(readout, { autoAlpha: 1 });
      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(root, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, 0.2);
      return () => tl.kill();
    }

    const ctx = gsap.context(() => {
      const L = path.getTotalLength();
      gsap.set(path, { strokeDasharray: L, strokeDashoffset: L, stroke: "#5c5c5c" });
      gsap.set(bootLines, { y: 8, opacity: 0 });
      gsap.set(readout, { opacity: 0 });
      gsap.set(head, { opacity: 0, scale: 1 });
      gsap.set(name, { autoAlpha: 0 });
      gsap.set([first, last], { y: "110%", opacity: 0, filter: "blur(16px)" });
      if (sweepRef.current) gsap.set(sweepRef.current, { opacity: 0, xPercent: -120 });

      const box = curveWrap.getBoundingClientRect();
      const sx = box.width / CURVE_W;
      const sy = box.height / CURVE_H;

      const tl = gsap.timeline({ onComplete: onDone });

      /* --- Phase 1 · Boot (0.00 – 0.75) --- */
      tl.to(bootLines, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out", stagger: 0.15 }, 0);

      /* --- Phase 2 · Train (0.55 – 2.00) --- */
      tl.to(readout, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.55);
      tl.to(head, { opacity: 1, duration: 0.2 }, 0.55);

      tl.to(
        path,
        {
          strokeDashoffset: 0,
          duration: 1.45,
          ease: "power2.inOut",
          onUpdate: () => {
            const off = Number(gsap.getProperty(path, "strokeDashoffset"));
            const drawn = L - off;
            const p = L > 0 ? drawn / L : 1;
            const epoch = Math.round(p * 40);
            const loss = (2.41 * Math.exp(-p * 4.2) + 0.02).toFixed(2);
            readout.textContent = `epoch ${String(epoch).padStart(2, "0")}/40 · loss ${loss}`;
            const pt = path.getPointAtLength(drawn);
            gsap.set(head, { x: pt.x * sx, y: pt.y * sy });
          },
        },
        0.55,
      );

      tl.to(path, { stroke: accent, duration: 0.5, ease: "power1.in" }, 1.5);

      /* --- Phase 3 · Converge (2.00 – 2.15) --- */
      tl.to(
        head,
        {
          scale: 1.6,
          duration: 0.15,
          ease: "power1.inOut",
          yoyo: true,
          repeat: 1,
          filter: `drop-shadow(0 0 12px ${accent})`,
        },
        2.0,
      );

      /* --- Phase 4 · Resolve to FULL NAME (slow — ~5s) --- */
      tl.to(boot, { opacity: 0, duration: 0.35, ease: "power2.in" }, 2.1);
      tl.to(curveWrap, { opacity: 0, duration: 0.4, ease: "power2.in" }, 2.12);
      tl.to(head, { opacity: 0, duration: 0.2 }, 2.15);

      // Name stage appears; huge typography rises slowly.
      tl.to(name, { autoAlpha: 1, duration: 0.35 }, 2.15);
      tl.to(
        first,
        { y: "0%", opacity: 1, filter: "blur(0px)", duration: 2.6, ease: "power3.out" },
        2.25,
      );
      tl.to(
        last,
        { y: "0%", opacity: 1, filter: "blur(0px)", duration: 2.6, ease: "power3.out" },
        3.0,
      );

      // Checkpoint lands as the last name finishes settling (~5s of name).
      tl.call(() => {
        readout.textContent = FINAL_READOUT;
      }, undefined, 5.4);

      if (sweepRef.current) {
        tl.fromTo(
          sweepRef.current,
          { xPercent: -120, opacity: 1 },
          { xPercent: 120, duration: 0.7, ease: "power1.inOut" },
          5.5,
        );
      }

      /* --- Phase 5 · Wipe — after holding the name --- */
      tl.to(root, { yPercent: -100, duration: 1.0, ease: "expo.inOut" }, 6.4);
      tl.call(
        () => window.dispatchEvent(new CustomEvent("preloader:reveal")),
        undefined,
        6.85,
      );
    }, root);

    return () => ctx.revert();
  }, [reduced, onDone]);

  const headSize = 9;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      aria-hidden
    >
      {/* Boot log */}
      <div
        ref={bootRef}
        className="absolute left-6 top-6 flex flex-col gap-1 font-mono sm:left-10 sm:top-10"
        style={{
          fontSize: "12.5px",
          letterSpacing: "0.02em",
          color: "#8a8a8a",
          opacity: reduced ? 0 : undefined,
        }}
      >
        {BOOT_LINES.map((line) => (
          <div
            key={line}
            className="boot-line will-change-transform"
            style={reduced ? undefined : { opacity: 0, transform: "translateY(8px)" }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Centre: curve, then name replaces it */}
      <div className="relative flex min-h-[40vh] w-full items-center justify-center px-6">
        {/* Loss curve */}
        <div
          ref={curveWrapRef}
          className="relative"
          style={{
            width: "min(78vw, 420px)",
            height: "168px",
            opacity: reduced ? 0 : undefined,
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
            preserveAspectRatio="none"
            fill="none"
            aria-hidden
          >
            <line
              x1="8" y1={CURVE_H - 9} x2={CURVE_W - 8} y2={CURVE_H - 9}
              stroke="currentColor" strokeWidth="1"
              className="text-foreground/10"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="8" y1="6" x2="8" y2={CURVE_H - 9}
              stroke="currentColor" strokeWidth="1"
              className="text-foreground/10"
              vectorEffect="non-scaling-stroke"
            />
            <path
              ref={pathRef}
              d={CURVE_D}
              stroke="#5c5c5c"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div
            ref={headRef}
            className="pointer-events-none absolute left-0 top-0 rounded-full bg-accent will-change-transform"
            style={{
              width: headSize,
              height: headSize,
              marginLeft: -headSize / 2,
              marginTop: -headSize / 2,
              opacity: 0,
            }}
            aria-hidden
          />
        </div>

        {/* FULL NAME — replaces DC dots */}
        <div
          ref={nameRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
          style={{ opacity: reduced ? 1 : 0 }}
        >
          <div className="relative px-4 text-center">
            <div className="overflow-hidden">
              <h1
                ref={firstRef}
                className="display-2xl text-foreground will-change-transform"
                style={reduced ? undefined : { transform: "translateY(110%)", opacity: 0 }}
              >
                Dikshanta
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1
                ref={lastRef}
                className="display-2xl text-foreground will-change-transform"
                style={reduced ? undefined : { transform: "translateY(110%)", opacity: 0 }}
              >
                Chapagain
              </h1>
            </div>

            {/* Light sweep across the finished name */}
            <div
              ref={sweepRef}
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 will-change-transform"
              style={{
                opacity: 0,
                transform: "skewX(-14deg)",
                background:
                  "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.35), transparent)",
              }}
              aria-hidden
            />
          </div>
        </div>
      </div>

      {/* Epoch / checkpoint readout */}
      <div
        ref={readoutRef}
        className="mt-10 font-mono tabular"
        style={{
          fontSize: "12.5px",
          letterSpacing: "0.02em",
          color: "#8a8a8a",
          opacity: reduced ? 1 : 0,
        }}
      >
        epoch 00/40 · loss 2.41
      </div>

      <div className="absolute inset-x-6 bottom-6 flex justify-between sm:inset-x-10">
        <span className="label-mono opacity-40">Portfolio — 2026</span>
        <span className="label-mono opacity-40">{PROFILE.site}</span>
      </div>
    </div>
  );
};
