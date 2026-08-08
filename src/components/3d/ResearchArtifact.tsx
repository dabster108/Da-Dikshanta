import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState, damp, lerp } from "@/lib/animation/sceneState";
import { activeKey } from "@/lib/animation/activeKey";

/**
 * The research artifact (§10).
 *
 * Not a robot, not a brain, not a glowing neural net. An instrument: a
 * faceted glass core held inside three thin machined rings, wrapped in a
 * lattice of measurement nodes that opens outward as the page goes deeper
 * into research and closes again toward the end.
 *
 * The one idea it encodes: a system with something solid at the centre and a
 * structure of observations around it, and the observations move.
 *
 * Everything expensive is decided once at mount from the device tier. The
 * frame loop allocates nothing.
 */

const NODES: Record<string, number> = { high: 68, mid: 44, low: 24 };

/** Even distribution on a sphere. Random points clump; this doesn't. */
const fibonacciSphere = (n: number) => {
  const pts = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts[i * 3] = Math.cos(theta) * r;
    pts[i * 3 + 1] = y;
    pts[i * 3 + 2] = Math.sin(theta) * r;
  }
  return pts;
};

export const ResearchArtifact = () => {
  const tier = sceneState.tier;
  const count = NODES[tier] ?? 44;

  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const latticeRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const dummy = useRef(new THREE.Object3D()).current;
  const spin = useRef({ x: 0, y: 0 }).current;
  const smoothed = useRef({ disperse: 0.15, scale: 1, opacity: 1 }).current;

  /* --- Static geometry data, computed once ----------------------------- */
  const { dirs, pairs, linePositions, phases } = useMemo(() => {
    const dirs = fibonacciSphere(count);

    // Connect each node to its two nearest neighbours. Sparse on purpose —
    // a fully connected graph reads as a web, not as structure.
    const seen = new Set<string>();
    const pairs: number[] = [];
    for (let i = 0; i < count; i++) {
      const best: { j: number; d: number }[] = [];
      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        const dx = dirs[i * 3] - dirs[j * 3];
        const dy = dirs[i * 3 + 1] - dirs[j * 3 + 1];
        const dz = dirs[i * 3 + 2] - dirs[j * 3 + 2];
        best.push({ j, d: dx * dx + dy * dy + dz * dz });
      }
      best.sort((a, b) => a.d - b.d);
      for (let k = 0; k < 2; k++) {
        const j = best[k].j;
        const key = i < j ? `${i}:${j}` : `${j}:${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push(i, j);
      }
    }

    // Per-node drift phase so the lattice breathes unevenly, like readings
    // rather than a rotating ornament.
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) phases[i] = (i * 2.399963) % (Math.PI * 2);

    return {
      dirs,
      pairs: new Uint16Array(pairs),
      linePositions: new Float32Array(pairs.length * 3),
      phases,
    };
  }, [count]);

  /* --- Materials. Transmission is real glass and costs a render target
         per frame, so only the top tier gets it. ------------------------ */
  const coreMaterial = useMemo(() => {
    // Dark glass, not a light ball. A pale opaque sphere on a near-black
    // ground reads as a grey blob and kills any text behind it; a dark,
    // highly transmissive core only shows up where light catches an edge,
    // which is what makes it look like an instrument instead of a prop.
    if (tier === "high") {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#3A4A3E"),
        transmission: 0.97,
        thickness: 2.4,
        roughness: 0.1,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.18,
        transparent: true,
        opacity: 0.85,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2C352E"),
      metalness: 0.4,
      roughness: 0.25,
      transparent: true,
      opacity: 0.3,
    });
  }, [tier]);

  const ringMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#9AA69B"),
        metalness: 0.96,
        roughness: 0.28,
        transparent: true,
      }),
    [],
  );

  const nodeMaterial = useMemo(
    () =>
      // White base so per-instance colour decides the tint. Most nodes are a
      // dim warm grey; roughly one in eight carries the accent. A lattice
      // where every node is lime turns the whole page green, which is the
      // single thing the brief rules out hardest (§2).
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#FFFFFF"),
        metalness: 0.25,
        roughness: 0.55,
        transparent: true,
      }),
    [],
  );

  /** Which nodes get the accent. Deterministic, so it never flickers. */
  const tints = useMemo(() => {
    const quiet = new THREE.Color("#6E7A6F");
    const lime = new THREE.Color("#C8FF4D");
    return Array.from({ length: count }, (_, i) => (i % 8 === 3 ? lime : quiet));
  }, [count]);

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#8EA8FF"),
        transparent: true,
        opacity: 0.2,
      }),
    [],
  );

  // Instance colours are static, so they are written once rather than every
  // frame alongside the matrices.
  useEffect(() => {
    const inst = latticeRef.current;
    if (!inst) return;
    tints.forEach((c, i) => inst.setColorAt(i, c));
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, [tints]);

  /* --- Frame ----------------------------------------------------------- */
  useFrame((state, delta) => {
    if (!sceneState.visible) return;
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    const g = groupRef.current;
    if (!g) return;

    const reduced = sceneState.reduced;
    const s = reduced ? 0 : 0.002;

    smoothed.disperse = damp(smoothed.disperse, activeKey.disperse, s, dt);
    smoothed.scale = damp(smoothed.scale, activeKey.scale, s, dt);
    smoothed.opacity = damp(
      smoothed.opacity,
      activeKey.opacity * sceneState.opacityScale,
      s,
      dt,
    );

    g.position.x = damp(g.position.x, activeKey.artifact[0], s, dt);
    g.position.y = damp(g.position.y, activeKey.artifact[1], s, dt);
    g.position.z = damp(g.position.z, activeKey.artifact[2], s, dt);
    g.scale.setScalar(smoothed.scale);

    if (!reduced) {
      // Continuous slow rotation, plus a pointer tilt that is damped hard
      // enough to feel like weight rather than tracking.
      spin.y = damp(spin.y, sceneState.pointerX * 0.3, 0.0008, dt);
      spin.x = damp(spin.x, -sceneState.pointerY * 0.2, 0.0008, dt);
      g.rotation.y += dt * 0.14 * activeKey.spin;
      g.rotation.x = spin.x;
      g.rotation.z = spin.y * 0.35;

      // Rings counter-rotate so the object never reads as one rigid body.
      const r = ringsRef.current;
      if (r) {
        r.rotation.x += dt * 0.22 * activeKey.spin;
        r.rotation.z -= dt * 0.16 * activeKey.spin;
      }
    }

    // Materials fade as a group so the artifact can get out of the way of
    // dense typography without unmounting.
    const o = smoothed.opacity;
    coreMaterial.opacity = (tier === "high" ? 0.85 : 0.3) * o;
    ringMaterial.opacity = 0.85 * o;
    nodeMaterial.opacity = o;
    lineMaterial.opacity = 0.16 * o;

    /* Lattice: base radius grows with disperse, and each node drifts on its
       own phase. Velocity from the scroll nudges the whole shell outward,
       so a fast scroll visibly disturbs the instrument. */
    const radius = lerp(1.25, 2.15, smoothed.disperse);
    const jitter = reduced ? 0 : 0.07 + Math.abs(sceneState.velocity) * 0.1;
    const inst = latticeRef.current;

    if (inst) {
      for (let i = 0; i < count; i++) {
        const wobble = reduced ? 0 : Math.sin(t * 0.6 + phases[i]) * jitter;
        const rr = radius + wobble;
        const x = dirs[i * 3] * rr;
        const y = dirs[i * 3 + 1] * rr;
        const z = dirs[i * 3 + 2] * rr;

        dummy.position.set(x, y, z);
        dummy.rotation.set(t * 0.2 + phases[i], t * 0.15 + phases[i], 0);
        // Nodes shrink slightly as they disperse — reads as distance.
        dummy.scale.setScalar(lerp(0.038, 0.022, smoothed.disperse));
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;

      // Lines follow the nodes they connect.
      const lines = linesRef.current;
      if (lines) {
        for (let p = 0; p < pairs.length; p++) {
          const n = pairs[p];
          const wobble = reduced ? 0 : Math.sin(t * 0.6 + phases[n]) * jitter;
          const rr = radius + wobble;
          linePositions[p * 3] = dirs[n * 3] * rr;
          linePositions[p * 3 + 1] = dirs[n * 3 + 1] * rr;
          linePositions[p * 3 + 2] = dirs[n * 3 + 2] * rr;
        }
        (lines.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }
    }

    // The core contracts as the lattice opens — the structure expands, the
    // certainty at the centre gets smaller.
    const core = coreRef.current;
    if (core) core.scale.setScalar(lerp(1, 0.62, smoothed.disperse));
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Glass core — small. The instrument is the structure around it. */}
      <mesh ref={coreRef} material={coreMaterial}>
        <icosahedronGeometry args={[0.58, 1]} />
      </mesh>

      {/* Faceted shell — the "technical lines" of the instrument */}
      <lineSegments>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(0.95, 1)]} />
        <lineBasicMaterial color="#F1F0E8" transparent opacity={0.11} />
      </lineSegments>

      {/* Machined rings */}
      <group ref={ringsRef}>
        <mesh material={ringMaterial} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.75, 0.012, 8, 128]} />
        </mesh>
        <mesh material={ringMaterial} rotation={[Math.PI / 2.6, 0.5, 0]}>
          <torusGeometry args={[2.15, 0.008, 8, 128]} />
        </mesh>
        <mesh material={ringMaterial} rotation={[0.4, 0, Math.PI / 3]}>
          <torusGeometry args={[2.5, 0.006, 8, 128]} />
        </mesh>
      </group>

      {/* Measurement lattice */}
      <instancedMesh ref={latticeRef} args={[undefined, undefined, count]} material={nodeMaterial}>
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>

      <lineSegments ref={linesRef} material={lineMaterial}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
      </lineSegments>
    </group>
  );
};
