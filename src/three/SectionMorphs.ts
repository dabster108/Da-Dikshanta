import * as THREE from "three";
import { NeuralField, easing } from "./NeuralField";
import type { CameraRig } from "./CameraRig";
import { getPalette } from "./palette";
import { makePointMaterial } from "./pointMaterial";
import { getGlowTexture } from "./glowTexture";
import { sampleShape, sampleText } from "./shapeSampler";
import { PROJECT_SILHOUETTES } from "./silhouettes";
import { SimplexNoise } from "./noise";

export interface ProjectMorphSpec {
  /** Stable id used by the DOM side to charge/lock this silhouette. */
  id: string;
  silhouette: keyof typeof PROJECT_SILHOUETTES;
}

const SILHOUETTE_POINTS = 40;

/**
 * One project's silhouette: a small cloud of points that idles as ordinary
 * scattered network nodes and assembles into a recognisable shape as a visitor
 * charges it.
 */
class SilhouetteCloud {
  readonly points: THREE.Points;
  /** 0 = scattered network noise, 1 = fully formed silhouette. */
  weight = 0;
  charge = 0;
  locked = false;

  private readonly scatter: Float32Array;
  private readonly shape: Float32Array;
  private readonly count: number;
  private readonly positions: THREE.BufferAttribute;
  private readonly opacity: THREE.BufferAttribute;
  private readonly colors: THREE.BufferAttribute;
  private readonly phase: Float32Array;
  private readonly noise: SimplexNoise;

  constructor(
    spec: ProjectMorphSpec,
    center: THREE.Vector3,
    scale: number,
    seed: number,
  ) {
    const palette = getPalette();
    this.noise = new SimplexNoise(seed);

    const sampled = sampleShape(
      PROJECT_SILHOUETTES[spec.silhouette],
      SILHOUETTE_POINTS,
    );
    this.count = Math.max(sampled.points.length, 8);

    this.scatter = new Float32Array(this.count * 3);
    this.shape = new Float32Array(this.count * 3);
    this.phase = new Float32Array(this.count);

    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);

    for (let i = 0; i < this.count; i += 1) {
      const p = sampled.points[i % Math.max(1, sampled.points.length)] ?? {
        x: 0,
        y: 0,
      };

      this.shape[i * 3] = center.x + p.x * scale;
      this.shape[i * 3 + 1] = center.y + p.y * scale;
      this.shape[i * 3 + 2] = center.z + this.noise.noise2(i * 0.4, 1.1) * 0.12;

      // Idle state: indistinguishable from the surrounding field.
      const a = this.noise.noise2(i * 0.7, 3.3) * Math.PI * 2;
      const r = 1.1 + Math.abs(this.noise.noise2(i * 1.3, 5.5)) * 1.5;
      this.scatter[i * 3] = center.x + Math.cos(a) * r;
      this.scatter[i * 3 + 1] = center.y + Math.sin(a) * r * 0.8;
      this.scatter[i * 3 + 2] =
        center.z + this.noise.noise2(i * 0.9, 7.7) * 1.4;

      this.phase[i] = this.noise.noise2(i * 0.21, 9.1) * Math.PI * 2;
      colors[i * 3] = palette.accent.r;
      colors[i * 3 + 1] = palette.accent.g;
      colors[i * 3 + 2] = palette.accent.b;
      sizes[i] = 40 + Math.abs(this.noise.noise2(i * 0.33, 4.2)) * 18;
    }

    const geometry = new THREE.BufferGeometry();
    this.positions = new THREE.BufferAttribute(
      new Float32Array(this.scatter),
      3,
    );
    this.opacity = new THREE.BufferAttribute(new Float32Array(this.count), 1);
    this.colors = new THREE.BufferAttribute(colors, 3);

    geometry.setAttribute("position", this.positions);
    geometry.setAttribute("aOpacity", this.opacity);
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aColor", this.colors);

    this.points = new THREE.Points(geometry, makePointMaterial(getGlowTexture()));
    this.points.frustumCulled = false;
  }

  update(dt: number, time: number, proximity: number) {
    // Charging visibly pulls the shape together; bailing lets it fall apart.
    const target = this.locked ? 1 : this.charge;
    this.weight += (target - this.weight) * Math.min(1, dt * 6);

    const positions = this.positions.array as Float32Array;
    const opacity = this.opacity.array as Float32Array;
    const base = this.locked ? 0.95 : 0.32 + this.charge * 0.68;

    for (let i = 0; i < this.count; i += 1) {
      const i3 = i * 3;
      const drift = (1 - this.weight) * 0.22;

      const sx =
        this.scatter[i3] +
        this.noise.noise3(i * 0.11, time * 0.12, 0) * drift;
      const sy =
        this.scatter[i3 + 1] +
        this.noise.noise3(i * 0.13, time * 0.1, 3.1) * drift;
      const sz =
        this.scatter[i3 + 2] +
        this.noise.noise3(i * 0.17, time * 0.08, 6.2) * drift;

      const w = easing.power3Out(this.weight);
      positions[i3] = sx + (this.shape[i3] - sx) * w;
      positions[i3 + 1] = sy + (this.shape[i3 + 1] - sy) * w;
      positions[i3 + 2] = sz + (this.shape[i3 + 2] - sz) * w;

      const breath = 0.88 + Math.sin(time * 1.4 + this.phase[i]) * 0.12;
      opacity[i] = base * breath * proximity;
    }

    this.positions.needsUpdate = true;
    this.opacity.needsUpdate = true;
  }

  setPixelRatio(ratio: number) {
    (this.points.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value =
      ratio;
  }

  setColor(color: THREE.Color) {
    const colors = this.colors.array as Float32Array;
    for (let i = 0; i < this.count; i += 1) {
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    this.colors.needsUpdate = true;
  }

  dispose() {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}

export interface SectionMorphsOptions {
  name: string;
  projects: ProjectMorphSpec[];
  reducedMotion: boolean;
  tier: "high" | "low";
}

export class SectionMorphs {
  readonly group = new THREE.Group();

  private readonly field: NeuralField;
  private readonly rig: CameraRig;
  private readonly options: SectionMorphsOptions;
  private readonly palette = getPalette();

  private readonly clouds = new Map<string, SilhouetteCloud>();
  private readonly cloudT = new Map<string, number>();

  private lossCurve: THREE.Line | null = null;
  private readonly rings: THREE.Mesh[] = [];
  private ringGroup = new THREE.Group();

  private introStarted = false;
  private introDone = false;
  private introEndsAt = Infinity;
  private nameNodes: number[] = [];
  private completed = false;

  private readonly scratch = new THREE.Vector3();
  private readonly outputCentroid = new THREE.Vector3();

  constructor(
    field: NeuralField,
    rig: CameraRig,
    options: SectionMorphsOptions,
  ) {
    this.field = field;
    this.rig = rig;
    this.options = options;

    this.buildLossCurve();
    this.buildProjectSilhouettes();
    this.buildBeacon();

    // With the camera frozen for reduced motion there is no vantage from which
    // the corridor beats read, so they are dropped rather than shown broken.
    // The training run itself still works: the HUD tracks cards as they scroll
    // past and the completion reward still unlocks.
    this.group.visible = !options.reducedMotion;
  }

  // ------------------------------------------------------------------- hero

  /**
   * Load beat: everything collapses to a point, explodes into the field, and a
   * reserved slice of layer-0/1 nodes snaps into the letterforms of the name
   * before scattering home. Same particles as the network — not a title
   * overlay.
   */
  runIntro(time: number) {
    if (this.introStarted) return;
    this.introStarted = true;

    const origin = new THREE.Vector3(0, 0, 10.7);

    if (this.options.reducedMotion) {
      this.introDone = true;
      this.introEndsAt = time;
      return;
    }

    // 1. Collapse to a single bright point...
    for (let i = 0; i < this.field.nodeCount; i += 1) {
      this.field.setMorphTarget(i, origin.x, origin.y, origin.z);
      this.field.setMorphWeight(i, 1);
    }
    // ...then explode outward into the assigned positions.
    const all = Array.from({ length: this.field.nodeCount }, (_, i) => i);
    this.field.tweenMorph(all, 0, {
      duration: 0.9,
      ease: easing.power3Out,
    });

    // 2. Reserve front-layer nodes for the letterforms.
    const pool = [
      ...(this.field.layers[0] ?? []),
      ...(this.field.layers[1] ?? []),
      ...(this.field.layers[2] ?? []),
    ];
    const sampled = sampleText(this.options.name, pool.length, { height: 180 });
    if (sampled.points.length === 0) {
      this.introDone = true;
      this.introEndsAt = time + 1;
      return;
    }

    this.nameNodes = pool.slice(0, sampled.points.length);
    const scale = 7.2;

    this.nameNodes.forEach((node, i) => {
      const p = sampled.points[i];
      this.field.setMorphTarget(node, p.x * scale, p.y * scale + 0.4, 7.4);
    });

    this.field.tweenMorph(this.nameNodes, 1, {
      duration: 1.1,
      stagger: 0.008,
      ease: easing.power4InOut,
      delay: 0.45,
    });

    // There are only ~43 nodes to spell with, so the letterform nodes burn
    // brighter and bigger while they hold the shape.
    this.field.setBrightness(this.nameNodes, 1.9);

    // 3. Hold, then scatter back into the network.
    const scatterAt = 0.45 + 1.1 + this.nameNodes.length * 0.008 + 1.1;
    this.field.tweenMorph(this.nameNodes, 0, {
      duration: 1.2,
      stagger: 0.004,
      ease: easing.power3Out,
      delay: scatterAt,
    });

    this.introEndsAt = time + scatterAt;
  }

  isIntroComplete() {
    return this.introDone;
  }

  /**
   * Skip the node-collapse intro and reveal the network in its resting state
   * immediately, dispatching `synaptic:intro-complete` so the intro gate
   * opens right away. Used when the BootSequence is the active intro (so the
   * 3D intro doesn't replay on every reload) or when the scene mounts after
   * the boot has already played.
   */
  revealIntro() {
    if (this.introDone) return;
    this.introStarted = true;
    this.introDone = true;
    this.introEndsAt = 0;
    window.dispatchEvent(new CustomEvent("synaptic:intro-complete"));
  }

  // ------------------------------------------------------------------ builds

  private buildLossCurve() {
    // y = a * e^(-x) + noise. A real descending loss curve, not a squiggle —
    // the camera literally rides it downward through the about section.
    const noise = new SimplexNoise(4242);
    const points: THREE.Vector3[] = [];
    const segments = 120;

    for (let i = 0; i <= segments; i += 1) {
      const u = i / segments;
      const x = (u - 0.5) * 9;
      const loss = 1.9 * Math.exp(-u * 3.1) + noise.noise2(u * 6, 0.5) * 0.09;
      points.push(new THREE.Vector3(x, -2.1 + loss, 6.2 - u * 6));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: this.palette.accent,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.lossCurve = new THREE.Line(geometry, material);
    this.lossCurve.frustumCulled = false;
    this.group.add(this.lossCurve);
  }

  private buildProjectSilhouettes() {
    const projects = this.options.projects;
    if (projects.length === 0) return;

    projects.forEach((spec, index) => {
      // Lay the corridor out across the projects stretch of the camera path,
      // alternating sides to match the zig-zag of the project cards.
      const u = projects.length === 1 ? 0.5 : index / (projects.length - 1);
      const t = 0.57 + u * 0.2;
      const side = index % 2 === 0 ? -1 : 1;

      const center = new THREE.Vector3(
        side * 2.9,
        0.5 - u * 0.9,
        4.6 - u * 9.2,
      );

      const cloud = new SilhouetteCloud(spec, center, 2.6, 900 + index * 37);
      this.clouds.set(spec.id, cloud);
      this.cloudT.set(spec.id, t);
      this.group.add(cloud.points);
    });
  }

  private buildBeacon() {
    const geometry = new THREE.RingGeometry(0.55, 0.68, 64);

    for (let i = 0; i < 5; i += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: this.palette.accent,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.frustumCulled = false;
      ring.userData.offset = i * 0.4; // 400ms stagger
      ring.visible = i < 3; // 3 rings until the model is fully trained
      this.rings.push(ring);
      this.ringGroup.add(ring);
    }

    this.group.add(this.ringGroup);
  }

  // ------------------------------------------------------------ interactions

  setPixelRatio(ratio: number) {
    this.clouds.forEach((cloud) => cloud.setPixelRatio(ratio));
  }

  setCharge(id: string, progress: number) {
    const cloud = this.clouds.get(id);
    if (!cloud || cloud.locked) return;
    cloud.charge = THREE.MathUtils.clamp(progress, 0, 1);
  }

  lock(id: string) {
    const cloud = this.clouds.get(id);
    if (!cloud) return;
    cloud.locked = true;
    cloud.charge = 1;
    cloud.setColor(this.palette.accentWarm);
  }

  isLocked(id: string) {
    return this.clouds.get(id)?.locked ?? false;
  }

  /** All projects activated: 5 warmer rings instead of 3. */
  setCompleted(value: boolean) {
    if (this.completed === value) return;
    this.completed = value;

    this.rings.forEach((ring, i) => {
      ring.visible = value ? true : i < 3;
      (ring.material as THREE.MeshBasicMaterial).color.copy(
        value ? this.palette.accentWarm : this.palette.accent,
      );
    });
  }

  // ------------------------------------------------------------------ frames

  update(dt: number, time: number, camT: number) {
    if (!this.introDone && time >= this.introEndsAt) {
      this.introDone = true;
      this.field.setBrightness(this.nameNodes, 1);
      window.dispatchEvent(new CustomEvent("synaptic:intro-complete"));
    }

    if (this.options.reducedMotion) return;

    this.updateAbout(camT);
    this.updateSkills(camT);
    this.updateProjects(dt, time, camT);
    this.updateContact(dt, time, camT);
  }

  private updateAbout(camT: number) {
    if (!this.lossCurve) return;

    // Visible only around the about stretch, and the camera descends with it:
    // scrolling here physically feels like gradient descent.
    const inSection = window8(camT, 0.13, 0.37);
    (this.lossCurve.material as THREE.LineBasicMaterial).opacity =
      inSection * 0.5;

    const local = THREE.MathUtils.clamp((camT - 0.15) / 0.2, 0, 1);
    this.rig.setYOffset(-0.3 * easing.power2Out(local) * inSection);
  }

  private updateSkills(camT: number) {
    if (this.options.tier === "low" || this.options.reducedMotion) {
      this.rig.setOrbitOffset(0, 0, 0);
      return;
    }

    const local = (camT - 0.35) / 0.2;
    if (local < 0 || local > 1) {
      this.rig.setOrbitOffset(0, 0, 0);
      return;
    }

    // One slow orbit of the widest layer across the section, eased in and out
    // so it never snaps at the boundaries.
    const angle = local * Math.PI * 2;
    const amplitude = Math.sin(local * Math.PI) * 1.8;
    this.rig.setOrbitOffset(
      Math.cos(angle) * amplitude,
      Math.sin(angle * 0.5) * amplitude * 0.28,
      Math.sin(angle) * amplitude * 0.4,
    );
  }

  private updateProjects(dt: number, time: number, camT: number) {
    for (const [id, cloud] of this.clouds) {
      const t = this.cloudT.get(id) ?? 0.6;
      const distance = Math.abs(camT - t);
      const near = THREE.MathUtils.clamp(1 - distance / 0.18, 0, 1);
      // Locked silhouettes stay faintly readable outside their own stretch.
      const proximity = Math.max(near, cloud.locked ? 0.25 : 0);
      cloud.update(dt, time, proximity);
    }
  }

  private updateContact(dt: number, time: number, camT: number) {
    // Converge the live nodes on the output cluster over the last 15%.
    const converge = THREE.MathUtils.clamp((camT - 0.85) / 0.15, 0, 1);
    this.field.layerCentroid(
      this.field.layers.length - 1,
      this.outputCentroid,
    );

    if (this.introDone && converge > 0) {
      const eased = easing.power2Out(converge) * 0.85;
      for (let i = 0; i < this.field.nodeCount; i += 1) {
        this.field.setMorphTarget(
          i,
          this.outputCentroid.x,
          this.outputCentroid.y,
          this.outputCentroid.z,
        );
        this.field.setMorphWeight(i, eased);
      }
    } else if (this.introDone && this.convergeWasActive) {
      for (let i = 0; i < this.field.nodeCount; i += 1) {
        this.field.setMorphWeight(i, 0);
      }
    }
    this.convergeWasActive = converge > 0;

    // Beacon: expanding transmit rings at the output cluster.
    this.ringGroup.position.copy(this.outputCentroid);
    this.ringGroup.quaternion.copy(this.rig.camera.quaternion);

    const visible = THREE.MathUtils.clamp((camT - 0.78) / 0.12, 0, 1);
    const period = 2.4;

    for (const ring of this.rings) {
      if (!ring.visible) continue;

      const offset = ring.userData.offset as number;
      const elapsed = ((time - offset) % period + period) % period;
      const local = elapsed / period;

      ring.scale.setScalar(1 + local * 5);
      (ring.material as THREE.MeshBasicMaterial).opacity =
        0.6 * (1 - local) * visible;
    }
  }

  private convergeWasActive = false;

  dispose() {
    this.clouds.forEach((cloud) => cloud.dispose());
    this.clouds.clear();

    this.lossCurve?.geometry.dispose();
    (this.lossCurve?.material as THREE.Material | undefined)?.dispose();

    this.rings.forEach((ring) => {
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
    });
  }
}

/** Smooth 0 -> 1 -> 0 window across [start, end]. */
const window8 = (t: number, start: number, end: number) => {
  if (t <= start || t >= end) return 0;
  const local = (t - start) / (end - start);
  return Math.sin(local * Math.PI) ** 0.5;
};
