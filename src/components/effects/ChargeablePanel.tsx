import { useEffect, useState, type ReactNode } from "react";
import { useProjectActivation } from "@/contexts/SynapticContext";

interface ChargeablePanelProps {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a project card so hovering (or holding, or focusing) it charges the
 * matching silhouette in the background.
 *
 * Charge progress lives in a `--charge` custom property that the activation
 * system writes every frame — the scanline and glow are pure CSS off that
 * value, so a 60fps mechanic costs zero React renders.
 */
const ChargeablePanel = ({
  id,
  label,
  children,
  className = "",
}: ChargeablePanelProps) => {
  const { ref, isActivated } = useProjectActivation(id);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const onActivated = (event: Event) => {
      if ((event as CustomEvent<{ id: string }>).detail?.id !== id) return;
      setFlash(true);
      timer = setTimeout(() => setFlash(false), 150);
    };

    window.addEventListener("synaptic:activated", onActivated);
    return () => {
      window.removeEventListener("synaptic:activated", onActivated);
      clearTimeout(timer);
    };
  }, [id]);

  return (
    <div
      ref={ref}
      tabIndex={0}
      aria-label={
        isActivated
          ? `${label} — trained`
          : `${label} — hold to train this project`
      }
      data-charge-panel={id}
      className={`group/charge relative rounded-[1.35rem] outline-none transition-shadow duration-150 ${
        flash ? "shadow-[0_0_0_2px_hsl(var(--primary-glow))]" : ""
      } ${className}`}
      style={{ ["--charge" as string]: 0 }}
    >
      {children}

      {/* Charge overlay: a scanline sweeping top to bottom over 700ms. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.35rem]"
      >
        <div
          className="absolute inset-0 bg-primary-glow/10"
          style={{ opacity: "var(--charge)" }}
        />
        <div
          className="absolute inset-x-0 h-px bg-primary-glow shadow-[0_0_12px_2px_hsl(var(--primary-glow)/0.65)]"
          style={{
            top: "calc(var(--charge) * 100%)",
            opacity: "min(1, calc(var(--charge) * 6))",
          }}
        />
      </div>

      {/* Trained badge. */}
      {isActivated && (
        <span className="pointer-events-none absolute -top-2 left-4 z-30 rounded-full border border-primary/40 bg-background/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-glow backdrop-blur-sm">
          trained
        </span>
      )}
    </div>
  );
};

export default ChargeablePanel;
