import * as THREE from "three";
import type { NeuralField } from "./NeuralField";

/**
 * One continuous camera move through one persistent structure. Scroll does not
 * swap scenes; it advances `t` along a fixed curve.
 *
 * Control points are in NeuralField units (the field spans z = +8.5 .. -8.5).
 */
const HIGH_PATH: [number, number, number][] = [
  [0, 0, 16], // hero      — pulled further back so the near layer doesn't wash to white
  [1.2, 0.4, 4], // about  — gliding alongside layer 2
  [-1.5, 0.8, -1], // skills   — orbiting the widest layers
  [2.0, -0.6, -6], // projects — diving between the narrowing layers
  [0, 0, -8.5], // contact  — arrived at the output cluster
];

/** Mobile gets a shorter, flatter move — less depth traversal, less GPU. */
const LOW_PATH: [number, number, number][] = [
  [0, 0, 17],
  [0.6, 0.3, 1],
  [0, 0, -7.5],
];

export interface CameraRigOptions {
  drift: boolean;
  reducedMotion: boolean;
  tier: "high" | "low";
}

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;

  private readonly curve: THREE.CatmullRomCurve3;
  private readonly options: CameraRigOptions;
  private readonly lookAt = new THREE.Vector3(0, 0, 0);
  private readonly desiredLookAt = new THREE.Vector3();
  private readonly scratch = new THREE.Vector3();
  private readonly centroid = new THREE.Vector3();

  /** Anchor for the current region. Route changes set this; the camera
   *  flies here rather than the visitor scrolling all the way through. */
  private regionT = 0;
  /** Small parallax offset added on top of the region anchor as the visitor
   *  scrolls within a single view — so a page still has depth without the
   *  camera running the whole 0..1 range on its own. */
  private scrollOffset = 0;
  /** Smoothed effective target = regionT + scrollOffset. The lag is what
   *  makes the move feel weighty. */
  private t = 0;
  /** Extra vertical offset, driven by the about-section loss curve. */
  private yOffset = 0;
  /** Lateral swing added while orbiting the widest layer (skills). */
  private readonly orbitOffset = new THREE.Vector3();

  constructor(aspect: number, options: CameraRigOptions) {
    this.options = options;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 120);

    const points = (options.tier === "low" ? LOW_PATH : HIGH_PATH).map(
      ([x, y, z]) => new THREE.Vector3(x, y, z),
    );
    this.curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.35);

    this.camera.position.copy(this.curve.getPointAt(0));
    this.camera.lookAt(0, 0, 0);
  }

  setRegionT(value: number) {
    this.regionT = THREE.MathUtils.clamp(value, 0, 1);
  }

  setScrollOffset(value: number) {
    // Parallax only — a tiny nudge so the camera doesn't feel bolted to the
    // region anchor while the visitor reads a long view.
    this.scrollOffset = THREE.MathUtils.clamp(value, -0.05, 0.05);
  }

  /** Jump instantly (used on first mount so the camera doesn't fly in from t=0). */
  snapToRegion(value: number) {
    this.regionT = THREE.MathUtils.clamp(value, 0, 1);
    this.t = this.regionT;
    this.scrollOffset = 0;
  }

  setYOffset(value: number) {
    this.yOffset = value;
  }

  setOrbitOffset(x: number, y: number, z: number) {
    this.orbitOffset.set(x, y, z);
  }

  getT() {
    return this.t;
  }

  update(dt: number, time: number, field: NeuralField) {
    if (this.options.reducedMotion) {
      // Camera motion is frozen entirely; only the nodes keep breathing.
      this.t = 0.12;
      this.camera.position.copy(this.curve.getPointAt(this.t));
      this.camera.lookAt(0, 0, 0);
      return;
    }

    // Route-driven: the camera flies to the current region's anchor, with a
    // small scroll parallax on top. This is what makes navigation feel like
    // "the camera is taking me there" instead of "I'm scrolling a long page."
    const target = THREE.MathUtils.clamp(
      this.regionT + this.scrollOffset,
      0,
      1,
    );

    // Critically-damped approach: the equivalent of a ScrollTrigger scrub of
    // ~1.2, without a second scroll library fighting the page's scroll.
    const smoothing = 1 - Math.exp(-dt / 0.32);
    this.t += (target - this.t) * smoothing;

    const position = this.curve.getPointAt(this.t, this.scratch).clone();
    position.add(this.orbitOffset);
    position.y += this.yOffset;

    if (this.options.drift && !this.options.reducedMotion) {
      // A whisper of handheld: perfectly locked cameras read as CGI.
      position.x += Math.sin(time * 0.6) * 0.015;
      position.y += Math.cos(time * 0.45) * 0.01;
    }

    this.camera.position.copy(position);

    // Aim slightly ahead on the curve, blended toward the nearest layer's
    // centroid — a directed tracking shot rather than a rollercoaster tangent.
    const ahead = this.curve.getPointAt(Math.min(1, this.t + 0.08));
    const layer = Math.min(
      field.layers.length - 1,
      Math.round(this.t * (field.layers.length - 1)),
    );
    field.layerCentroid(layer, this.centroid);

    this.desiredLookAt.copy(ahead).lerp(this.centroid, 0.55);
    this.desiredLookAt.z = Math.min(
      this.desiredLookAt.z,
      this.camera.position.z - 1.5,
    );

    const damping = 1 - Math.exp(-dt / 0.28);
    this.lookAt.lerp(this.desiredLookAt, damping);
    this.camera.lookAt(this.lookAt);

    // 55 -> 42 by the projects section: narrowing the lens as we go deeper.
    const fov = THREE.MathUtils.lerp(
      55,
      42,
      THREE.MathUtils.smoothstep(this.t, 0, 0.72),
    );
    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }

  resize(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
