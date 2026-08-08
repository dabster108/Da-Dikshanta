import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { LightingRig } from "./LightingRig";
import { ResearchArtifact } from "./ResearchArtifact";
import { ParticleField } from "./ParticleField";
import { sceneState } from "@/lib/animation/sceneState";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The 3D layer (§26).
 *
 * A single fixed canvas behind the whole document — one WebGL context for the
 * entire experience, not one per section. Content scrolls over it; the scene
 * responds through `sceneState`.
 *
 * Cost control:
 *  - DPR is capped by tier. Retina at 2x on a mid laptop is the single
 *    biggest avoidable cost in a scene like this.
 *  - The loop stops entirely when the tab is hidden.
 *  - Antialiasing is on only where there is headroom for it.
 */

export const Scene = ({ onReady }: { onReady?: () => void }) => {
  const [hidden, setHidden] = useState(false);
  const reduced = useReducedMotion();
  const tier = sceneState.tier;

  // A backgrounded tab must not keep a WebGL loop alive.
  useEffect(() => {
    const onVis = () => {
      const isHidden = document.hidden;
      setHidden(isHidden);
      sceneState.visible = !isHidden;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const maxDpr = tier === "high" ? 1.8 : tier === "mid" ? 1.4 : 1;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-scene"
      aria-hidden="true"
      data-cursor="rotate"
    >
      <Canvas
        dpr={[1, maxDpr]}
        frameloop={hidden ? "never" : "always"}
        gl={{
          antialias: tier === "high",
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 0, 9.5], fov: 38, near: 0.1, far: 60 }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          onReady?.();
        }}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <LightingRig />
          <ResearchArtifact />
          {/* The particle field is the first thing to go on a weak device —
              it is atmosphere, and the artifact is the content. */}
          {!(reduced && tier === "low") && <ParticleField />}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
