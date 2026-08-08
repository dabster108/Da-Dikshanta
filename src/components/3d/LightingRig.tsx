import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { activeLight } from "@/lib/animation/activeKey";
import { sceneState, damp } from "@/lib/animation/sceneState";

/**
 * Lighting (§28).
 *
 * Three sources: a soft key, a coloured rim that carries the chapter's mood,
 * and a low fill so the shadow side never goes to pure black. Colours are
 * damped rather than set, so a chapter change reads as light shifting in a
 * room rather than a switch being thrown.
 *
 * The environment is built from Lightformers rather than an HDR file — the
 * metal needs something to reflect, and generating it locally avoids a
 * network fetch for a texture nobody will consciously look at.
 */
export const LightingRig = () => {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const k = keyRef.current;
    const r = rimRef.current;
    if (!k || !r) return;

    // Reduced motion still gets the chapter's colour — the light carries
    // meaning here, not movement — but it arrives immediately.
    const s = sceneState.reduced ? 0 : 0.004;

    k.color.setRGB(
      damp(k.color.r, activeLight.keyR, s, dt),
      damp(k.color.g, activeLight.keyG, s, dt),
      damp(k.color.b, activeLight.keyB, s, dt),
    );
    k.intensity = damp(k.intensity, activeLight.intensity, s, dt);

    r.color.setRGB(
      damp(r.color.r, activeLight.rimR, s, dt),
      damp(r.color.g, activeLight.rimG, s, dt),
      damp(r.color.b, activeLight.rimB, s, dt),
    );
    r.intensity = damp(r.intensity, activeLight.rimIntensity, s, dt);
  });

  return (
    <>
      <ambientLight intensity={0.22} color="#A7ADA7" />
      <directionalLight ref={keyRef} position={[4, 6, 5]} intensity={1.6} color="#F1F0E8" />
      <directionalLight ref={rimRef} position={[-5, -2, -4]} intensity={0.8} color="#8EA8FF" />

      <Environment resolution={128} frames={1}>
        <Lightformer intensity={1.1} position={[0, 4, 3]} scale={[8, 3, 1]} color="#F1F0E8" />
        <Lightformer intensity={0.5} position={[-5, 0, 1]} scale={[3, 6, 1]} color="#8EA8FF" />
        <Lightformer intensity={0.35} position={[5, -1, 2]} scale={[3, 5, 1]} color="#C8FF4D" />
        <Lightformer
          intensity={0.5}
          position={[0, -4, -3]}
          scale={[8, 3, 1]}
          color="#171B18"
        />
      </Environment>
    </>
  );
};
