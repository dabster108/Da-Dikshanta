import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download } from "lucide-react";
import { useSynaptic } from "@/contexts/SynapticContext";
import { PROJECT_ACTIVATIONS } from "@/data/projectActivations";

const CV_PATH = "/cv/DIKSHANTA_CHAPAGAIN_RESUME.pdf";

const shortNameOf = (id: string) =>
  PROJECT_ACTIVATIONS.find((p) => p.id === id)?.shortName ?? id;

/**
 * HUD for the training run: how many projects the visitor has activated, a
 * cosmetic accuracy readout that climbs with them, and — once all of them are
 * trained — the CV download that is otherwise only in the footer.
 */
const TrainingConsole = () => {
  const { ready, activated, total, completed } = useSynaptic();
  const [inProjects, setInProjects] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const queue = useRef<string[]>([]);
  const draining = useRef(false);

  // Only present while the visitor is actually in the projects corridor.
  useEffect(() => {
    const section = document.getElementById("projects");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInProjects(entry.isIntersecting),
      { threshold: 0, rootMargin: "-10% 0px -10% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // One toast at a time, queued 400ms apart so rapid activations don't stack.
  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];

    const drain = () => {
      if (draining.current) return;
      const next = queue.current.shift();
      if (!next) return;

      draining.current = true;
      setToast(next);
      timers.push(
        setTimeout(() => {
          setToast(null);
          timers.push(
            setTimeout(() => {
              draining.current = false;
              drain();
            }, 400),
          );
        }, 1800),
      );
    };

    const onActivated = (event: Event) => {
      const id = (event as CustomEvent<{ id: string }>).detail?.id;
      if (!id) return;
      queue.current.push(shortNameOf(id));
      drain();
    };

    const onCompleted = () => {
      setFlash(true);
      timers.push(setTimeout(() => setFlash(false), 420));
    };

    window.addEventListener("synaptic:activated", onActivated);
    window.addEventListener("synaptic:completed", onCompleted);
    return () => {
      window.removeEventListener("synaptic:activated", onActivated);
      window.removeEventListener("synaptic:completed", onCompleted);
      timers.forEach(clearTimeout);
      timers = [];
    };
  }, []);

  if (!ready || total === 0) return null;

  const count = activated.length;
  const ratio = count / total;
  const accuracy = Math.round(ratio * 100);

  return (
    <>
      {/* "Training complete" beat — a single soft wash, not a jump-scare. */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            aria-hidden="true"
            className="fixed inset-0 z-[60] pointer-events-none bg-primary-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.12,
              exit: { duration: 0.3 },
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            className="fixed top-24 right-6 z-[55] flex items-center gap-2 rounded-xl border border-primary/25 bg-background/55 px-3.5 py-2.5 backdrop-blur-md shadow-lg"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary-glow">
              <Check className="h-3 w-3" />
            </span>
            <span className="font-mono text-xs text-foreground/90">
              {toast} — model deployed
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inProjects && (
          <motion.aside
            key="hud"
            className="fixed bottom-6 left-6 z-[55] w-[220px] rounded-xl border border-primary/25 bg-background/55 p-4 backdrop-blur-md"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            aria-live="polite"
          >
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {completed ? "Epoch — model ready" : "Epoch"}
            </p>

            <p className="mt-1 font-mono text-lg text-primary-glow">
              {count}/{total}
            </p>

            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-primary-glow"
                initial={false}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>

            <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Accuracy
            </p>
            <p className="font-mono text-sm text-foreground/85">{accuracy}%</p>

            <AnimatePresence>
              {completed && (
                <motion.a
                  key="reward"
                  href={CV_PATH}
                  download="DIKSHANTA_CHAPAGAIN_RESUME.pdf"
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/15 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/25"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download CV
                </motion.a>
              )}
            </AnimatePresence>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default TrainingConsole;
