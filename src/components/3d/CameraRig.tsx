import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState, damp } from "@/lib/animation/sceneState";
import { activeKey, updateActiveKey } from "@/lib/animation/activeKey";

/**
 * Camera controller (§27).
 *
 * Owns two things: recomputing the blended chapter key for the whole scene,
 * and moving the camera toward it. The camera is never assigned a position
 * directly — it is damped, frame-rate independently, so a fast scroll
 * produces a fast-but-smooth push rather than a teleport.
 *
 * Pointer parallax is deliberately small (§10: "subtle"). It is applied as an
 * offset to the damped target, never to the target itself, so it can't
 * accumulate.
 */
export const CameraRig = () => {
  const { camera } = useThree();

  // Preallocated. Nothing in this loop may allocate (§46).
  const target = useRef(new THREE.Vector3(0, 0, 9.5)).current;
  const look = useRef(new THREE.Vector3()).current;
  const current = useRef(new THREE.Vector3(0, 0, 9.5)).current;
  const parallax = useRef({ x: 0, y: 0 }).current;

  useFrame((_, delta) => {
    // Clamp dt so a backgrounded tab returning doesn't fling the camera.
    const dt = Math.min(delta, 1 / 30);

    updateActiveKey();

    if (sceneState.reduced) {
      // Static framing: the composition is preserved, the movement is not.
      camera.position.set(activeKey.pos[0], activeKey.pos[1], activeKey.pos[2]);
      camera.lookAt(activeKey.look[0], activeKey.look[1], activeKey.look[2]);
      return;
    }

    // Parallax is damped separately and more slowly than the pointer moves,
    // which is what stops it feeling like the camera is attached to the mouse.
    parallax.x = damp(parallax.x, sceneState.pointerX * 0.34, 0.001, dt);
    parallax.y = damp(parallax.y, sceneState.pointerY * 0.22, 0.001, dt);

    target.set(
      activeKey.pos[0] + parallax.x,
      activeKey.pos[1] + parallax.y,
      activeKey.pos[2],
    );

    current.x = damp(current.x, target.x, 0.0015, dt);
    current.y = damp(current.y, target.y, 0.0015, dt);
    current.z = damp(current.z, target.z, 0.0015, dt);
    camera.position.copy(current);

    look.set(activeKey.look[0], activeKey.look[1], activeKey.look[2]);
    camera.lookAt(look);
  });

  return null;
};
