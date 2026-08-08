import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { NEURAL_CAPS } from "@/motion/tokens";

/**
 * Lightweight neural-network particle background — 2D canvas, not R3F.
 *
 * Capped at 150 nodes on mobile / narrow viewports, 400 on desktop. Throttled
 * to 30fps when hardwareConcurrency < 4. Lazy-mounted when the section enters
 * the viewport via IntersectionObserver, and paused when off-screen.
 *
 * On reduced-motion: not mounted at all.
 */
export const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    let running = false;
    let lastFrame = 0;
    const cores = navigator.hardwareConcurrency ?? 4;
    const minFps = cores < 4 ? 33 : 16; // ~30fps on weak, ~60fps elsewhere
    const narrow = window.innerWidth < 768;
    const cap = narrow ? NEURAL_CAPS.mobile : NEURAL_CAPS.desktop;

    const ctx = canvas.getContext("2d")!;
    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Nodes
    const nodes = Array.from({ length: cap }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.6,
    }));

    const LINK_DIST = narrow ? 110 : 150;

    const frame = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (t - lastFrame < minFps) return;
      lastFrame = t;

      ctx.clearRect(0, 0, W, H);

      // Update + integrate nodes.
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      // Spatial-hash grid so link search is O(n·k) instead of O(n²).
      const cell = LINK_DIST;
      const cols = Math.ceil(W / cell) + 1;
      const grid = new Map<number, number[]>();
      const key = (x: number, y: number) =>
        Math.floor(y / cell) * cols + Math.floor(x / cell);
      nodes.forEach((n, i) => {
        const k = key(n.x, n.y);
        const bucket = grid.get(k);
        if (bucket) bucket.push(i);
        else grid.set(k, [i]);
      });

      ctx.lineWidth = 0.6;
      const linkDist2 = LINK_DIST * LINK_DIST;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const cx = Math.floor(a.x / cell);
        const cy = Math.floor(a.y / cell);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const bucket = grid.get((cy + dy) * cols + (cx + dx));
            if (!bucket) continue;
            for (const j of bucket) {
              if (j <= i) continue;
              const b = nodes[j];
              const ddx = a.x - b.x;
              const ddy = a.y - b.y;
              const d2 = ddx * ddx + ddy * ddy;
              if (d2 < linkDist2) {
                const d = Math.sqrt(d2);
                const alpha = (1 - d / LINK_DIST) * 0.22;
                ctx.strokeStyle = `hsla(214, 100%, 62%, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // Nodes on top
      for (const n of nodes) {
        ctx.fillStyle = "hsla(214, 100%, 74%, 0.85)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Lazy mount + pause when off-screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  );
};
