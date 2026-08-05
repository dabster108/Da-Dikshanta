import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SynapticContext } from "@/contexts/SynapticContext";
import { ActivationSystem } from "@/three/ActivationSystem";
import type { SynapticScene as SynapticSceneType } from "@/three/SynapticScene";
import {
  PROJECT_ACTIVATIONS,
  PROJECT_TOTAL,
} from "@/data/projectActivations";

const SITE_NAME = "DIKSHANTA";

/**
 * Mounts the Synaptic Cartography background and owns the training-run state.
 *
 * The canvas is a single persistent scene for the whole page: scrolling moves a
 * camera along a curve through it rather than swapping backgrounds per section.
 */
const SynapticCartography = ({
  regionT,
  children,
}: {
  regionT: number;
  children: ReactNode;
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SynapticSceneType | null>(null);
  const panels = useRef(new Map<string, HTMLElement>());
  const detachers = useRef(new Map<string, () => void>());

  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activated, setActivated] = useState<string[]>([]);

  const system = useRef<ActivationSystem | null>(null);
  if (!system.current) {
    system.current = new ActivationSystem({
      onProgress: (id, progress) => {
        panels.current.get(id)?.style.setProperty("--charge", `${progress}`);
        sceneRef.current?.setCharge(id, progress);
      },
      onActivate: (id) => {
        sceneRef.current?.lock(id);
        panels.current.get(id)?.setAttribute("data-activated", "true");
        window.dispatchEvent(
          new CustomEvent("synaptic:activated", { detail: { id } }),
        );
      },
      onChange: (next) => setActivated([...next]),
    });
  }

  // Rehydrate whatever this session already trained.
  useEffect(() => {
    setActivated([...(system.current?.activated ?? [])]);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let scene: SynapticSceneType | null = null;

    // Lazy so the ~150KB of three + addons never blocks first paint.
    import("@/three/SynapticScene")
      .then(({ SynapticScene }) => {
        if (cancelled) return;

        scene = new SynapticScene({
          host,
          name: SITE_NAME,
          projects: PROJECT_ACTIVATIONS.map((p) => ({
            id: p.id,
            silhouette: p.silhouette,
          })),
          // The BootSequence is the cinematic intro now — skip the 3D
          // node-collapse intro so it doesn't replay behind the boot overlay
          // (first load) or hide the Entry copy behind useIntroGate (reload).
          skipIntro: true,
        });

        sceneRef.current = scene;
        setReducedMotion(scene.reducedMotion);
        setReady(true);

        // Start the camera at the current region, not t=0, so the first
        // frame already frames the right region instead of flying in.
        scene.snapToRegion(regionT);

        // Replay the session's existing activations into the fresh scene.
        for (const id of system.current?.activated ?? []) scene.lock(id);

        // Ensure the renderer + post-FX render targets match the real
        // canvas size after it's in the DOM. On reload there's no boot
        // overlay to hide the first frames, so a stale render-target size
        // shows up as a blown-out white center. A deferred resize fixes it.
        requestAnimationFrame(() => {
          if (cancelled) return;
          window.dispatchEvent(new Event("resize"));
          sceneRef.current?.setRegion(regionT);
        });
      })
      .catch((error) => {
        // No WebGL, or the chunk failed: the page is fully usable without it.
        // Still log it — a silently missing background is impossible to debug.
        console.error("[synaptic] scene failed to mount", error);
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const activationSystem = system.current;
    return () => activationSystem?.destroy();
  }, []);

  // Route changes fly the camera to the new region. On first mount the scene
  // snaps (above); this effect handles every subsequent navigation.
  useEffect(() => {
    sceneRef.current?.setRegion(regionT);
  }, [regionT]);

  // When the boot overlay lifts, the canvas may have been occluded while it
  // mounted. Nudge a resize and re-assert the region so the first visible
  // frame is correctly framed — not stale from behind the overlay.
  useEffect(() => {
    const onBootComplete = () => {
      window.dispatchEvent(new Event("resize"));
      sceneRef.current?.setRegion(regionT);
    };
    window.addEventListener("synaptic:boot-complete", onBootComplete);
    return () => window.removeEventListener("synaptic:boot-complete", onBootComplete);
  }, [regionT]);

  const completed = activated.length >= PROJECT_TOTAL && PROJECT_TOTAL > 0;

  useEffect(() => {
    sceneRef.current?.setCompleted(completed);
    if (completed) {
      window.dispatchEvent(new CustomEvent("synaptic:completed"));
    }
  }, [completed]);

  const registerPanel = useCallback(
    (id: string, element: HTMLElement | null) => {
      detachers.current.get(id)?.();
      detachers.current.delete(id);

      if (!element) {
        panels.current.delete(id);
        return;
      }

      panels.current.set(id, element);
      element.style.setProperty(
        "--charge",
        system.current?.isActivated(id) ? "1" : "0",
      );
      if (system.current?.isActivated(id)) {
        element.setAttribute("data-activated", "true");
      }

      const detach = system.current?.attach(id, element);
      if (detach) detachers.current.set(id, detach);
    },
    [],
  );

  const markSeen = useCallback((id: string) => {
    system.current?.activateImmediately(id);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      reducedMotion,
      total: PROJECT_TOTAL,
      activated,
      completed,
      registerPanel,
      markSeen,
    }),
    [ready, reducedMotion, activated, completed, registerPanel, markSeen],
  );

  return (
    <SynapticContext.Provider value={value}>
      <div
        ref={hostRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none bg-background"
      />
      {children}
    </SynapticContext.Provider>
  );
};

export default SynapticCartography;
