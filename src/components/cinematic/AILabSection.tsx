import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextReveal } from "@/motion/primitives";
import { EASE, SEQUENCE } from "@/motion/tokens";
import { useReducedMotion } from "@/motion/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Mechanic 3 — Canvas image-sequence scroll-scrub (re-skinned).
 *
 * The reference site pre-renders ~90 still frames and scrubs the frame index
 * by scroll. We don't have the frame assets, so we render the equivalent shot
 * procedurally on a single canvas: a neural network forming layer by layer,
 * connections drawing, a forward pass lighting up, settling into a clean
 * architecture diagram. Scroll progress drives the render directly — same
 * pinned/scrubbed feel, no asset pipeline.
 *
 * Pinned for SEQUENCE.pinDistance px, scrub 0.5, anticipatePin 1 — matching
 * the spec's hardcoded ScrollTrigger config.
 *
 * On reduced-motion: render the final-state frame statically, no pin/scrub.
 */
export const AILabSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d")!;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = section.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(progressRef.current);
    };
    resize();
    window.addEventListener("resize", resize);

    // Network architecture: [4, 6, 6, 3]
    const layers = [4, 6, 6, 3];
    const labels = ["INPUT", "HIDDEN", "HIDDEN", "OUTPUT"];

    const render = (p: number) => {
      const r = section.getBoundingClientRect();
      const W = r.width;
      const H = r.height;
      ctx.clearRect(0, 0, W, H);

      const padX = W * 0.12;
      const padY = H * 0.18;
      const usableW = W - padX * 2;
      const usableH = H - padY * 2;

      // Compute node positions
      const positions = layers.map((count, li) => {
        const x = padX + (usableW * li) / (layers.length - 1);
        return Array.from({ length: count }, (_, ni) => ({
          x,
          y: padY + (usableH * (ni + 1)) / (count + 1),
        }));
      });

      // Phase boundaries
      const PH_NODES = 0.3;      // nodes fade in
      const PH_LINKS = 0.6;      // connections draw
      const PH_PASS = 0.85;      // forward pass lights up
      // 0.85-1.0 settles into clean diagram

      // --- Connections (draw before nodes so nodes sit on top) ---
      for (let li = 0; li < positions.length - 1; li++) {
        for (const a of positions[li]) {
          for (const b of positions[li + 1]) {
            // Each connection has a per-pair phase offset for staggered draw.
            const pairIdx = li * 100 + Math.round(a.y) + Math.round(b.y);
            const stagger = (pairIdx % 50) / 50; // 0..1
            let drawP = 0;
            if (p > PH_NODES) {
              drawP = Math.min(1, (p - PH_NODES) / (PH_LINKS - PH_NODES) - stagger * 0.15);
              drawP = Math.max(0, Math.min(1, drawP));
            }
            if (drawP <= 0) continue;

            // Forward-pass brightness
            let bright = 0;
            if (p > PH_LINKS) {
              const passP = (p - PH_LINKS) / (PH_PASS - PH_LINKS);
              // Signal travels left→right; light up based on layer position.
              const layerReach = passP * layers.length;
              bright = Math.max(0, Math.min(1, layerReach - li - 0.5));
              // Fade out as we settle
              if (p > PH_PASS) bright *= 1 - (p - PH_PASS) / 0.15;
            }

            const ex = a.x + (b.x - a.x) * drawP;
            const ey = a.y + (b.y - a.y) * drawP;
            ctx.strokeStyle = `hsla(214, 100%, ${50 + bright * 30}%, ${0.12 + bright * 0.5})`;
            ctx.lineWidth = 0.6 + bright * 1.2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(ex, ey);
            ctx.stroke();
          }
        }
      }

      // --- Nodes ---
      for (let li = 0; li < positions.length; li++) {
        for (let ni = 0; ni < positions[li].length; ni++) {
          const n = positions[li][ni];
          const stagger = (ni % 6) / 6;
          let appear = 0;
          if (p > stagger * PH_NODES * 0.5) {
            appear = Math.min(1, (p - stagger * PH_NODES * 0.5) / (PH_NODES * 0.6));
          }
          if (appear <= 0) continue;

          // Activation brightness during forward pass
          let bright = 0;
          if (p > PH_LINKS) {
            const passP = (p - PH_LINKS) / (PH_PASS - PH_LINKS);
            const layerReach = passP * (layers.length + 1);
            bright = Math.max(0, Math.min(1, layerReach - li - 0.5));
            if (p > PH_PASS) bright *= 1 - (p - PH_PASS) / 0.15;
          }

          const r = 6 + bright * 4;
          ctx.fillStyle = `hsla(214, 100%, ${50 + bright * 30}%, ${0.5 * appear + 0.5 * bright})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();

          // Ring on settled state
          if (p > PH_PASS) {
            const settle = (p - PH_PASS) / 0.15;
            ctx.strokeStyle = `hsla(214, 100%, 74%, ${0.4 * settle})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // --- Layer labels (settle phase) ---
      if (p > PH_PASS) {
        const a = Math.min(1, (p - PH_PASS) / 0.1);
        ctx.fillStyle = `hsla(214, 100%, 74%, ${0.7 * a})`;
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        for (let li = 0; li < layers.length; li++) {
          const x = padX + (usableW * li) / (layers.length - 1);
          ctx.fillText(labels[li], x, padY - 14);
          ctx.fillText(`[${layers[li]}]`, x, H - padY + 26);
        }
      }
    };

    if (reduced) {
      progressRef.current = 1;
      render(1);
      return () => {
        window.removeEventListener("resize", resize);
      };
    }

    const seq = { frame: 0 };
    const tween = gsap.to(seq, {
      frame: SEQUENCE.frameCount - 1,
      snap: "frame",
      ease: EASE.none,
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=" + SEQUENCE.pinDistance,
        scrub: SEQUENCE.scrub,
        pin: true,
        anticipatePin: 1,
      },
      onUpdate: () => {
        progressRef.current = seq.frame / (SEQUENCE.frameCount - 1);
        render(progressRef.current);
      },
    });

    return () => {
      window.removeEventListener("resize", resize);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="lab"
      className="relative h-screen w-full overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Overlaid copy — fades out as the sequence plays. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-start px-6 pt-[8vh]">
        <span className="label-mono-accent">04 — AI Laboratory</span>
        <TextReveal as="h2" className="display-lg mt-3 text-center text-foreground">
          A network, forming.
        </TextReveal>
        <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
          Scroll to drive the formation — nodes appear, connections draw, a
          forward pass lights up layer by layer.
        </p>
      </div>
    </section>
  );
};
