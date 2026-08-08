import { lazy, Suspense, useEffect, useState } from "react";

const AIBackground = lazy(() =>
  import("./AIBackground").then((m) => ({ default: m.AIBackground })),
);

/**
 * Atmosphere stack — R3F canvas lazy-mounts after first paint so initial
 * load and nav jumps stay responsive.
 */
export const Atmosphere = ({ activeScene = 0 }: { activeScene?: number }) => {
  const [mount3d, setMount3d] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMount3d(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0 bg-background" aria-hidden />
      {mount3d && (
        <div className="fixed inset-0 z-0" aria-hidden>
          <Suspense fallback={null}>
            <AIBackground activeScene={activeScene} />
          </Suspense>
        </div>
      )}
      <div className="cursor-light fixed inset-0 z-[1]" aria-hidden />
      <div className="vignette" aria-hidden />
      <div className="noise" aria-hidden />
    </>
  );
};
