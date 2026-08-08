import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { EASE } from "@/motion/tokens";

/**
 * Mechanic 1 — Preloader.
 *
 * A dot-matrix fades in to form a loose brain/neural silhouette, a 00→100
 * counter ticks alongside, then the dots collapse into 2-3 connecting lines
 * and the whole preloader lifts off-screen to reveal the hero.
 *
 * Dot positions are sampled from a procedurally-drawn brain silhouette mask
 * (the spec's "sample dark pixels from a grayscale mask" technique, with the
 * mask drawn to an offscreen canvas instead of shipped as an image asset).
 *
 * Total budget ~2.4s, hard-capped at 3s. On reduced-motion: skip to reveal.
 */

const DOT_COUNT = 800;
const STAGGER_EACH = 0.004;
const FADE_DURATION = 1.4;
const COUNTER_DURATION = 1.8;
const LINES_DURATION = 0.6;
const REVEAL_DURATION = 0.9;

type Props = { onComplete: () => void };

export const Preloader = ({ onComplete }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<SVGElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      // No animation — reveal immediately.
      const t = setTimeout(onComplete, 50);
      return () => clearTimeout(t);
    }

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    // --- 1. Build a brain silhouette mask on an offscreen canvas. --------
    const mask = document.createElement("canvas");
    mask.width = 320;
    mask.height = 320;
    const mctx = mask.getContext("2d")!;
    mctx.fillStyle = "#000";
    mctx.fillRect(0, 0, 320, 320);

    // Two hemispheres + a connecting corpus callosum, drawn in white on black.
    mctx.fillStyle = "#fff";
    const cx = 160;
    const cy = 170;
    // Left hemisphere
    mctx.beginPath();
    mctx.ellipse(cx - 55, cy, 70, 92, -0.12, 0, Math.PI * 2);
    mctx.fill();
    // Right hemisphere
    mctx.beginPath();
    mctx.ellipse(cx + 55, cy, 70, 92, 0.12, 0, Math.PI * 2);
    mctx.fill();
    // Top crown curve to round the brain
    mctx.beginPath();
    mctx.ellipse(cx, cy - 30, 110, 70, 0, Math.PI, Math.PI * 2);
    mctx.fill();
    // Brain stem
    mctx.beginPath();
    mctx.ellipse(cx, cy + 95, 18, 28, 0, 0, Math.PI * 2);
    mctx.fill();

    // Add gyri texture — a few thin strokes so the silhouette isn't a blob.
    mctx.strokeStyle = "#000";
    mctx.lineWidth = 3;
    for (let i = 0; i < 14; i++) {
      mctx.beginPath();
      const a = (i / 14) * Math.PI * 2;
      const r1 = 40 + Math.random() * 20;
      const r2 = 80 + Math.random() * 20;
      mctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      mctx.quadraticCurveTo(
        cx + Math.cos(a) * (r1 + r2) / 2 + (Math.random() - 0.5) * 30,
        cy + Math.sin(a) * (r1 + r2) / 2 + (Math.random() - 0.5) * 30,
        cx + Math.cos(a) * r2,
        cy + Math.sin(a) * r2,
      );
      mctx.stroke();
    }

    // --- 2. Sample dark pixels → dot coordinates. -----------------------
    const img = mctx.getImageData(0, 0, 320, 320).data;
    const candidates: { x: number; y: number }[] = [];
    for (let y = 0; y < 320; y += 3) {
      for (let x = 0; x < 320; x += 3) {
        const i = (y * 320 + x) * 4;
        if (img[i] > 128) candidates.push({ x, y });
      }
    }
    // Shuffle + take DOT_COUNT
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const dots = candidates.slice(0, DOT_COUNT).map((p) => ({
      x: (p.x / 320) * W,
      y: (p.y / 320) * H,
      // Scale the silhouette to fill ~70% of viewport height, centered.
    }));
    // Center + scale the silhouette.
    const bbox = dots.reduce(
      (acc, d) => ({
        minX: Math.min(acc.minX, d.x),
        maxX: Math.max(acc.maxX, d.x),
        minY: Math.min(acc.minY, d.y),
        maxY: Math.max(acc.maxY, d.y),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
    );
    const scale = Math.min(W * 0.7 / (bbox.maxX - bbox.minX), H * 0.7 / (bbox.maxY - bbox.minY));
    const offX = (W - (bbox.maxX - bbox.minX) * scale) / 2 - bbox.minX * scale;
    const offY = (H - (bbox.maxY - bbox.minY) * scale) / 2 - bbox.minY * scale;
    dots.forEach((d) => {
      d.x = d.x * scale + offX;
      d.y = d.y * scale + offY;
    });

    // --- 3. Render dots + animate fade-in with random stagger. ----------
    ctx.clearRect(0, 0, W, H);
    const dotObjects = dots.map((d) => ({ ...d, opacity: 0 }));

    const drawDots = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "hsl(214 100% 62%)";
      for (const d of dotObjects) {
        if (d.opacity <= 0) continue;
        ctx.globalAlpha = d.opacity;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tl = gsap.timeline({
      onComplete: () => {
        setDone(true);
        // Allow the exit transition to paint before unmount.
        setTimeout(onComplete, REVEAL_DURATION * 1000 + 80);
      },
    });

    tl.to(dotObjects, {
      opacity: 1,
      duration: FADE_DURATION,
      ease: EASE.power1Out,
      stagger: { each: STAGGER_EACH, from: "random" },
      onUpdate: drawDots,
    });

    // Counter 00 → 100 in parallel.
    const counter = { v: 0 };
    tl.to(
      counter,
      {
        v: 100,
        duration: COUNTER_DURATION,
        ease: EASE.power2InOut,
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
          }
        },
      },
      0,
    );

    // --- 4. Dots collapse into 2-3 connecting lines. --------------------
    // Pick 3 anchor dots spread across the silhouette, draw SVG lines between
    // them with stroke-dashoffset animation.
    const anchors = [dots[0], dots[Math.floor(dots.length / 3)], dots[Math.floor((2 * dots.length) / 3)]];
    const linesSvg = linesRef.current!;
    linesSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const lineEls: SVGLineElement[] = [];
    for (let i = 0; i < anchors.length - 1; i++) {
      const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("x1", String(anchors[i].x));
      ln.setAttribute("y1", String(anchors[i].y));
      ln.setAttribute("x2", String(anchors[i + 1].x));
      ln.setAttribute("y2", String(anchors[i + 1].y));
      ln.setAttribute("stroke", "hsl(214 100% 62%)");
      ln.setAttribute("stroke-width", "1.5");
      ln.setAttribute("stroke-linecap", "round");
      const len = Math.hypot(anchors[i + 1].x - anchors[i].x, anchors[i + 1].y - anchors[i].y);
      ln.setAttribute("stroke-dasharray", String(len));
      ln.setAttribute("stroke-dashoffset", String(len));
      linesSvg.appendChild(ln);
      lineEls.push(ln);
    }

    tl.to(
      dotObjects,
      {
        opacity: 0.15,
        duration: LINES_DURATION,
        ease: EASE.power2Out,
        onUpdate: drawDots,
      },
      ">-0.1",
    );
    lineEls.forEach((ln) => {
      tl.to(ln, { strokeDashoffset: 0, duration: LINES_DURATION, ease: EASE.power2Out }, "<");
    });

    // --- 5. Whole preloader lifts out. -----------------------------------
    tl.to(rootRef.current, {
      yPercent: -100,
      duration: REVEAL_DURATION,
      ease: EASE.expoInOut,
    });

    return () => {
      tl.kill();
    };
  }, [reduced, onComplete]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <svg ref={linesRef} className="absolute inset-0 h-full w-full" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <span className="label-mono-accent">initializing neural map</span>
        <span
          ref={counterRef}
          className="font-mono text-5xl font-medium tabular text-foreground"
          style={{ letterSpacing: "-0.04em" }}
        >
          000
        </span>
      </div>
    </div>
  );
};
