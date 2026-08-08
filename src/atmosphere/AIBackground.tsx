import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * Abstract AI background — an embedding space / neural node field.
 *
 * Deliberately quiet: a few hundred points drifting on a slow lissajous,
 * connected by faint lines that pulse with the accent colour. Reads as
 * "intelligence" without ever being a robot, a dashboard, or a sci-fi demo.
 *
 * Camera reacts subtly to the pointer (parallax). On reduced-motion the
 * field is static and pointer parallax is disabled.
 */

const ACCENT = new THREE.Color("hsl(188, 100%, 50%)");
const WHITE = new THREE.Color("hsl(0, 0%, 100%)");

function NodeField({ reduced, activeScene }: { reduced: boolean; activeScene: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);
  const COUNT = 160;

  const { positions, basePositions, connections } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const basePositions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // Distribute across a wide slab in front of the camera.
      const x = (Math.random() - 0.5) * 22;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 8 - 2;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;
    }

    // Build line indices for nearby pairs — keep it sparse so the field
    // reads as structure, not as a web.
    const pairs: number[] = [];
    for (let i = 0; i < COUNT; i++) {
      let neighbours = 0;
      for (let j = i + 1; j < COUNT && neighbours < 2; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 4.5) {
          pairs.push(i, j);
          neighbours++;
        }
      }
    }
    const connections = new Uint16Array(pairs);
    return { positions, basePositions, connections };
  }, []);

  // Per-node phase for the lissajous drift.
  const phases = useMemo(() => {
    const p = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) p[i] = Math.random() * Math.PI * 2;
    return p;
  }, []);

  // Pointer parallax + scene morph target.
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const sceneTargets = useMemo(
    () => [
      { rotMul: 0.18, posMul: 0.4, pointOpacity: 0.55, lineBase: 0.06 },
      { rotMul: 0.14, posMul: 0.26, pointOpacity: 0.44, lineBase: 0.05 },
      { rotMul: 0.24, posMul: 0.52, pointOpacity: 0.68, lineBase: 0.08 },
      { rotMul: 0.16, posMul: 0.3, pointOpacity: 0.52, lineBase: 0.06 },
      { rotMul: 0.1, posMul: 0.18, pointOpacity: 0.4, lineBase: 0.04 },
    ],
    [],
  );
  const live = useRef(sceneTargets[0]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // Smooth pointer parallax.
      pointer.current.tx = (state.pointer.x) * 0.6;
      pointer.current.ty = (state.pointer.y) * 0.4;
      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.04;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.04;
      const target = sceneTargets[Math.max(0, Math.min(sceneTargets.length - 1, activeScene))];
      live.current = {
        rotMul: live.current.rotMul + (target.rotMul - live.current.rotMul) * 0.06,
        posMul: live.current.posMul + (target.posMul - live.current.posMul) * 0.06,
        pointOpacity:
          live.current.pointOpacity +
          (target.pointOpacity - live.current.pointOpacity) * 0.06,
        lineBase:
          live.current.lineBase + (target.lineBase - live.current.lineBase) * 0.06,
      };
      groupRef.current.rotation.y = pointer.current.x * live.current.rotMul;
      groupRef.current.rotation.x = -pointer.current.y * (live.current.rotMul * 0.66);
      groupRef.current.position.x = pointer.current.x * live.current.posMul;
      groupRef.current.position.y = pointer.current.y * (live.current.posMul * 0.75);
    }

    if (reduced) return;

    if (pointsRef.current) {
      const geom = pointsRef.current.geometry;
      const pos = geom.attributes.position.array as Float32Array;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      for (let i = 0; i < COUNT; i++) {
        const ph = phases[i];
        const bx = basePositions[i * 3];
        const by = basePositions[i * 3 + 1];
        const bz = basePositions[i * 3 + 2];
        pos[i * 3] = bx + Math.sin(t * 0.18 + ph) * 0.18;
        pos[i * 3 + 1] = by + Math.cos(t * 0.22 + ph * 1.3) * 0.18;
        pos[i * 3 + 2] = bz + Math.sin(t * 0.15 + ph * 0.7) * 0.18;
      }
      geom.attributes.position.needsUpdate = true;
      mat.opacity = live.current.pointOpacity;
    }

    if (linesRef.current) {
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = live.current.lineBase + (Math.sin(t * 0.4) * 0.5 + 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          sizeAttenuation
          color={WHITE}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="index" args={[connections, 1]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={ACCENT}
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export const AIBackground = ({ activeScene = 0 }: { activeScene?: number }) => {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        dpr={[1, 1.35]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : "always"}
      >
        <ambientLight intensity={0.4} />
        <NodeField reduced={reduced} activeScene={activeScene} />
      </Canvas>
    </div>
  );
};
