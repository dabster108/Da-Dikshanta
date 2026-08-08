import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState, PARTICLE_BUDGET, damp } from "@/lib/animation/sceneState";
import { activeKey } from "@/lib/animation/activeKey";

/**
 * Particle field (§30).
 *
 * Signal, not a galaxy. A sparse slab of points that drifts on its own and
 * gets visibly disturbed when the visitor scrolls hard — the field reacts to
 * input, which is the only reason it earns its place.
 *
 * All motion happens in the vertex shader from a single time uniform. The
 * CPU writes four uniforms per frame and nothing else: no per-point position
 * updates, no attribute uploads, no allocation.
 */

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;
  uniform float uOpacity;
  uniform vec2  uPointer;

  attribute float aSeed;
  attribute float aScale;
  attribute float aTint;

  varying float vAlpha;
  varying float vTint;

  void main() {
    vec3 p = position;

    // Independent slow drift per axis. Different frequencies keep the field
    // from ever resolving into a visible pattern.
    p.x += cos(uTime * 0.09 + aSeed * 4.1) * 0.30;
    p.y += sin(uTime * 0.12 + aSeed * 6.3) * 0.34;
    p.z += sin(uTime * 0.07 + aSeed * 3.2) * 0.22;

    // Scroll drags the field. Nearer points move more, which reads as depth.
    p.y -= uVelocity * 1.7 * (0.35 + aSeed * 0.9);

    // Pointer parallax, again depth-weighted.
    p.xy += uPointer * (0.20 + aSeed * 0.45);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    gl_PointSize = clamp(aScale * (58.0 / max(-mv.z, 0.1)), 0.6, 5.0);

    vAlpha = uOpacity * (0.18 + aSeed * 0.72);
    vTint  = aTint;
  }
`;

const fragment = /* glsl */ `
  precision mediump float;

  varying float vAlpha;
  varying float vTint;

  void main() {
    // Round point with a soft edge. Cheaper than a texture and never blurry.
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;
    float edge = smoothstep(0.25, 0.02, d);

    vec3 warmWhite = vec3(0.945, 0.941, 0.910);
    vec3 lime      = vec3(0.784, 1.000, 0.302);
    vec3 c = mix(warmWhite, lime, vTint);

    gl_FragColor = vec4(c, vAlpha * edge);
  }
`;

export const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const smoothVel = useRef(0);
  const smoothOpacity = useRef(1);

  const count = PARTICLE_BUDGET[sceneState.tier] ?? 480;

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const scales = new Float32Array(count);
    const tints = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // A wide, shallow slab. Deep enough for parallax, not so deep that
      // points end up behind the camera.
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3;
      seeds[i] = Math.random();
      scales[i] = 0.6 + Math.random() * 1.5;
      // A small minority carry the accent. Any more and the field turns
      // green, which is exactly what the brief rules out.
      tints[i] = Math.random() < 0.07 ? 1 : 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute("aTint", new THREE.BufferAttribute(tints, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uOpacity: { value: 1 },
        uPointer: { value: new THREE.Vector2() },
      },
    });

    return { geometry, material };
  }, [count]);

  // useMemo'd Three objects are not owned by R3F's reconciler, so they are
  // disposed here explicitly rather than leaking on unmount (§46).
  useMemo(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    if (!sceneState.visible) return;
    const dt = Math.min(delta, 1 / 30);
    const u = material.uniforms;

    if (!sceneState.reduced) {
      u.uTime.value = state.clock.elapsedTime;
      smoothVel.current = damp(smoothVel.current, sceneState.velocity, 0.0006, dt);
      u.uVelocity.value = smoothVel.current;
      (u.uPointer.value as THREE.Vector2).set(
        sceneState.pointerX * 0.5,
        sceneState.pointerY * 0.35,
      );
    }

    // The field tracks the artifact's opacity so the whole 3D layer recedes
    // together rather than in pieces.
    smoothOpacity.current = damp(
      smoothOpacity.current,
      activeKey.opacity * 0.85 * sceneState.opacityScale,
      sceneState.reduced ? 0 : 0.003,
      dt,
    );
    u.uOpacity.value = smoothOpacity.current;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
};
