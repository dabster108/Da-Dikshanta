import * as THREE from "three";
import { SimplexNoise } from "./noise";
import { getGlowTexture, getPulseTexture } from "./glowTexture";
import { getPalette } from "./palette";
import { makePointMaterial } from "./pointMaterial";

/** Narrow -> wide -> narrow. This is an autoencoder, not a uniform grid. */
const LAYER_COUNTS = [9, 14, 20, 20, 14, 5];
const LAYER_SPACING = 3.4;
const HALF_DEPTH = ((LAYER_COUNTS.length - 1) * LAYER_SPACING) / 2; // 8.5

export const FIELD_HALF_DEPTH = HALF_DEPTH;
export const FIELD_LAYER_COUNT = LAYER_COUNTS.length;

type Ease = (t: number) => number;

export const easing = {
  linear: (t: number) => t,
  power2Out: (t: number) => 1 - (1 - t) ** 2,
  power3Out: (t: number) => 1 - (1 - t) ** 3,
  power4InOut: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - ((-2 * t + 2) ** 4) / 2,
} satisfies Record<string, Ease>;

interface MorphTween {
  index: number;
  from: number;
  to: number;
  start: number;
  duration: number;
  ease: Ease;
}

interface Pulse {
  edge: number;
  t: number;
  speed: number;
  active: boolean;
  delay: number;
  bright: number;
}

export interface NeuralFieldOptions {
  nodeScale: number;
  pulseCount: number;
  reducedMotion: boolean;
}

export class NeuralField {
  readonly group = new THREE.Group();

  /** Node indices grouped by layer. */
  readonly layers: number[][] = [];
  readonly nodeCount: number;
  readonly edgeA: Int32Array;
  readonly edgeB: Int32Array;
  readonly edgeLayer: Int32Array;

  private readonly home: Float32Array;
  private readonly current: Float32Array;
  private readonly morphTarget: Float32Array;
  private readonly morphWeight: Float32Array;
  private readonly phase: Float32Array;
  private readonly brightness: Float32Array;
  private readonly brightnessTarget: Float32Array;
  private readonly baseSize: Float32Array;
  /** Edges leaving each layer, for the forward-pass wave. */
  private readonly edgesByLayer: number[][] = [];

  private readonly noise = new SimplexNoise(20260804);
  private readonly tweens: MorphTween[] = [];
  private readonly pulses: Pulse[] = [];

  private nodes!: THREE.Points;
  private lines!: THREE.LineSegments;
  private pulseCloud!: THREE.Points;

  private nodePositions!: THREE.BufferAttribute;
  private nodeOpacity!: THREE.BufferAttribute;
  private nodeSize!: THREE.BufferAttribute;
  private nodeColor!: THREE.BufferAttribute;
  private linePositions!: THREE.BufferAttribute;
  private lineColors!: THREE.BufferAttribute;
  private pulsePositions!: THREE.BufferAttribute;
  private pulseOpacity!: THREE.BufferAttribute;

  private nextForwardPass = 3.2;
  private clockTime = 0;
  private readonly options: NeuralFieldOptions;
  private readonly palette = getPalette();
  private readonly tmp = new THREE.Vector3();

  constructor(options: NeuralFieldOptions) {
    this.options = options;

    const counts = LAYER_COUNTS.map((c) =>
      Math.max(3, Math.round(c * options.nodeScale)),
    );
    const maxCount = Math.max(...counts);

    let cursor = 0;
    const homes: number[] = [];

    counts.forEach((count, layerIndex) => {
      const indices: number[] = [];
      const z = HALF_DEPTH - layerIndex * LAYER_SPACING;
      // Wider layers also sit physically wider, so "the widest layer" is a
      // place the camera can actually orbit.
      const spread = 0.8 + 0.35 * (count / maxCount);

      for (let i = 0; i < count; i += 1) {
        const n = this.noise.noise2(i * 0.37, layerIndex * 1.1);
        const radius = (1.3 + n * 1.1) * spread;
        const angle = (i / count) * Math.PI * 2 + layerIndex * 0.35;
        const wobble = this.noise.noise2(layerIndex * 2.3, i * 0.61);

        homes.push(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.78 + wobble * 0.25,
          z + wobble * 0.35,
        );
        indices.push(cursor);
        cursor += 1;
      }

      this.layers.push(indices);
    });

    this.nodeCount = cursor;
    this.home = new Float32Array(homes);
    this.current = new Float32Array(this.home);
    this.morphTarget = new Float32Array(this.nodeCount * 3);
    this.morphWeight = new Float32Array(this.nodeCount);
    this.phase = new Float32Array(this.nodeCount);
    this.brightness = new Float32Array(this.nodeCount).fill(1);
    this.brightnessTarget = new Float32Array(this.nodeCount).fill(1);
    this.baseSize = new Float32Array(this.nodeCount);

    for (let i = 0; i < this.nodeCount; i += 1) {
      this.phase[i] = this.noise.noise2(i * 0.19, 7.3) * Math.PI * 2;
      this.baseSize[i] = 42 + this.noise.noise2(i * 0.53, 2.1) * 14;
    }

    // Edges: forward-only, sparse. A fully connected mesh reads as a mess.
    const a: number[] = [];
    const b: number[] = [];
    const layerOf: number[] = [];

    for (let l = 0; l < this.layers.length - 1; l += 1) {
      const next = this.layers[l + 1];
      const bucket: number[] = [];

      for (const from of this.layers[l]) {
        const fanout = 2 + (Math.abs(this.noise.noise2(from * 0.83, l)) > 0.5 ? 1 : 0);
        const used = new Set<number>();
        for (let k = 0; k < fanout; k += 1) {
          const pick = Math.floor(
            Math.abs(this.noise.noise2(from * 1.7 + k * 3.1, l * 2.7) * 997) %
              next.length,
          );
          let target = next[pick];
          let guard = 0;
          while (used.has(target) && guard < next.length) {
            target = next[(pick + guard + 1) % next.length];
            guard += 1;
          }
          used.add(target);
          bucket.push(a.length);
          a.push(from);
          b.push(target);
          layerOf.push(l);
        }
      }

      this.edgesByLayer.push(bucket);
    }

    this.edgeA = Int32Array.from(a);
    this.edgeB = Int32Array.from(b);
    this.edgeLayer = Int32Array.from(layerOf);

    this.buildNodes();
    this.buildEdges();
    this.buildPulses();
  }

  // ---------------------------------------------------------------- building

  private buildNodes() {
    const geometry = new THREE.BufferGeometry();
    const colors = new Float32Array(this.nodeCount * 3);

    // Layers 2 and 3 (the wide ones) are split into three tinted sub-clusters
    // that the skills section labels: Systems / Interfaces / Intelligence.
    const wide = new Set([...(this.layers[2] ?? []), ...(this.layers[3] ?? [])]);

    for (let i = 0; i < this.nodeCount; i += 1) {
      const color = wide.has(i)
        ? this.palette.cluster[this.clusterOf(i)]
        : this.palette.node;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    this.nodePositions = new THREE.BufferAttribute(
      new Float32Array(this.current),
      3,
    );
    this.nodeOpacity = new THREE.BufferAttribute(
      new Float32Array(this.nodeCount).fill(0),
      1,
    );
    this.nodeSize = new THREE.BufferAttribute(
      new Float32Array(this.baseSize),
      1,
    );
    this.nodeColor = new THREE.BufferAttribute(colors, 3);

    geometry.setAttribute("position", this.nodePositions);
    geometry.setAttribute("aOpacity", this.nodeOpacity);
    geometry.setAttribute("aSize", this.nodeSize);
    geometry.setAttribute("aColor", this.nodeColor);

    this.nodes = new THREE.Points(
      geometry,
      makePointMaterial(getGlowTexture()),
    );
    this.nodes.frustumCulled = false;
    this.group.add(this.nodes);
  }

  private buildEdges() {
    const geometry = new THREE.BufferGeometry();
    const count = this.edgeA.length;

    this.linePositions = new THREE.BufferAttribute(
      new Float32Array(count * 6),
      3,
    );
    this.lineColors = new THREE.BufferAttribute(new Float32Array(count * 6), 3);

    geometry.setAttribute("position", this.linePositions);
    geometry.setAttribute("color", this.lineColors);

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: true,
    });

    this.lines = new THREE.LineSegments(geometry, material);
    this.lines.frustumCulled = false;
    this.group.add(this.lines);
  }

  private buildPulses() {
    const count = this.options.pulseCount;
    const geometry = new THREE.BufferGeometry();

    this.pulsePositions = new THREE.BufferAttribute(
      new Float32Array(Math.max(1, count) * 3),
      3,
    );
    this.pulseOpacity = new THREE.BufferAttribute(
      new Float32Array(Math.max(1, count)),
      1,
    );

    const colors = new Float32Array(Math.max(1, count) * 3);
    const sizes = new Float32Array(Math.max(1, count)).fill(64);
    for (let i = 0; i < count; i += 1) {
      colors[i * 3] = this.palette.accent.r;
      colors[i * 3 + 1] = this.palette.accent.g;
      colors[i * 3 + 2] = this.palette.accent.b;
    }

    geometry.setAttribute("position", this.pulsePositions);
    geometry.setAttribute("aOpacity", this.pulseOpacity);
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    this.pulseCloud = new THREE.Points(
      geometry,
      makePointMaterial(getPulseTexture()),
    );
    this.pulseCloud.frustumCulled = false;
    this.pulseCloud.visible = !this.options.reducedMotion;
    this.group.add(this.pulseCloud);

    for (let i = 0; i < count; i += 1) {
      this.pulses.push({
        edge: Math.floor(Math.random() * this.edgeA.length),
        t: Math.random(),
        // Randomised per pulse: lockstep motion is the tell of a lazy system.
        speed: 0.18 + Math.random() * 0.32,
        active: true,
        delay: 0,
        bright: 0.55 + Math.random() * 0.25,
      });
    }
  }

  // ------------------------------------------------------------------ public

  clusterOf(nodeIndex: number): 0 | 1 | 2 {
    const x = this.home[nodeIndex * 3];
    const y = this.home[nodeIndex * 3 + 1];
    const angle = Math.atan2(y, x) + Math.PI; // 0..2PI
    return Math.min(2, Math.floor((angle / (Math.PI * 2)) * 3)) as 0 | 1 | 2;
  }

  getPosition(index: number, out = this.tmp): THREE.Vector3 {
    return out.set(
      this.current[index * 3],
      this.current[index * 3 + 1],
      this.current[index * 3 + 2],
    );
  }

  layerCentroid(layerIndex: number, out = new THREE.Vector3()): THREE.Vector3 {
    const indices = this.layers[layerIndex] ?? [];
    out.set(0, 0, 0);
    for (const i of indices) {
      out.x += this.current[i * 3];
      out.y += this.current[i * 3 + 1];
      out.z += this.current[i * 3 + 2];
    }
    if (indices.length) out.divideScalar(indices.length);
    return out;
  }

  homeOf(index: number, out = new THREE.Vector3()): THREE.Vector3 {
    return out.set(
      this.home[index * 3],
      this.home[index * 3 + 1],
      this.home[index * 3 + 2],
    );
  }

  /** Set a node's morph destination without starting a tween. */
  setMorphTarget(index: number, x: number, y: number, z: number) {
    this.morphTarget[index * 3] = x;
    this.morphTarget[index * 3 + 1] = y;
    this.morphTarget[index * 3 + 2] = z;
  }

  /** Directly drive a node's blend between home and morph target (scroll). */
  setMorphWeight(index: number, weight: number) {
    this.morphWeight[index] = THREE.MathUtils.clamp(weight, 0, 1);
  }

  getMorphWeight(index: number) {
    return this.morphWeight[index];
  }

  tweenMorph(
    indices: number[],
    to: number,
    opts: { duration: number; stagger?: number; ease?: Ease; delay?: number } = {
      duration: 1,
    },
  ) {
    const { duration, stagger = 0, ease = easing.power3Out, delay = 0 } = opts;
    indices.forEach((index, order) => {
      // Replace any in-flight tween on this node.
      for (let i = this.tweens.length - 1; i >= 0; i -= 1) {
        if (this.tweens[i].index === index) this.tweens.splice(i, 1);
      }
      this.tweens.push({
        index,
        from: this.morphWeight[index],
        to,
        start: this.clockTime + delay + order * stagger,
        duration,
        ease,
      });
    });
  }

  setBrightness(indices: Iterable<number>, value: number) {
    for (const i of indices) this.brightnessTarget[i] = value;
  }

  /** A wave of activation from the input layer to the output layer. */
  triggerForwardPass() {
    if (this.options.reducedMotion || this.pulses.length === 0) return;

    const perLayer = Math.max(2, Math.round(this.pulses.length / 5));
    let assigned = 0;

    for (let l = 0; l < this.edgesByLayer.length; l += 1) {
      const bucket = this.edgesByLayer[l];
      if (!bucket.length) continue;

      for (let k = 0; k < perLayer && assigned < this.pulses.length; k += 1) {
        const pulse = this.pulses[assigned];
        assigned += 1;
        pulse.edge = bucket[Math.floor(Math.random() * bucket.length)];
        pulse.t = 0;
        pulse.delay = l * 0.18; // 180ms stagger per layer -> ~1.4s to arrive
        pulse.speed = 0.42 + Math.random() * 0.12;
        pulse.bright = 1;
        pulse.active = true;
      }
    }
  }

  update(dt: number, time: number) {
    this.clockTime = time;
    this.runTweens(time);
    this.updateNodes(dt, time);
    this.updateEdges();
    this.updatePulses(dt, time);
  }

  setPixelRatio(ratio: number) {
    (this.nodes.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value =
      ratio;
    (
      this.pulseCloud.material as THREE.ShaderMaterial
    ).uniforms.uPixelRatio.value = ratio;
  }

  dispose() {
    this.group.traverse((child) => {
      const mesh = child as THREE.Points;
      mesh.geometry?.dispose?.();
      const material = mesh.material as THREE.Material | THREE.Material[];
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose?.();
    });
  }

  // ------------------------------------------------------------------ frames

  private runTweens(time: number) {
    for (let i = this.tweens.length - 1; i >= 0; i -= 1) {
      const tween = this.tweens[i];
      if (time < tween.start) continue;

      const raw = Math.min(1, (time - tween.start) / tween.duration);
      this.morphWeight[tween.index] =
        tween.from + (tween.to - tween.from) * tween.ease(raw);

      if (raw >= 1) this.tweens.splice(i, 1);
    }
  }

  private updateNodes(dt: number, time: number) {
    const positions = this.nodePositions.array as Float32Array;
    const opacity = this.nodeOpacity.array as Float32Array;
    const sizes = this.nodeSize.array as Float32Array;
    const brightSpeed = Math.min(1, dt * 8);

    for (let i = 0; i < this.nodeCount; i += 1) {
      const w = this.morphWeight[i];
      const i3 = i * 3;

      // Organic drift, faded out as a node locks into a morph target so
      // silhouettes and letterforms stay crisp.
      const jitter = (1 - w) * 0.16;
      const dx = this.noise.noise3(this.home[i3] * 0.5, time * 0.09, i * 0.11);
      const dy = this.noise.noise3(this.home[i3 + 1] * 0.5, time * 0.11, i * 0.13);
      const dz = this.noise.noise3(this.home[i3 + 2] * 0.5, time * 0.07, i * 0.17);

      const hx = this.home[i3] + dx * jitter;
      const hy = this.home[i3 + 1] + dy * jitter;
      const hz = this.home[i3 + 2] + dz * jitter * 0.5;

      const x = hx + (this.morphTarget[i3] - hx) * w;
      const y = hy + (this.morphTarget[i3 + 1] - hy) * w;
      const z = hz + (this.morphTarget[i3 + 2] - hz) * w;

      this.current[i3] = x;
      this.current[i3 + 1] = y;
      this.current[i3 + 2] = z;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      this.brightness[i] +=
        (this.brightnessTarget[i] - this.brightness[i]) * brightSpeed;

      // Breathing: 0.85 -> 1.0 on a ~4s cycle, per-node phase offset.
      const breath = 0.925 + Math.sin(time * 1.57 + this.phase[i]) * 0.075;
      opacity[i] = breath * this.brightness[i] * (0.72 + 0.28 * w);
      sizes[i] = this.baseSize[i] * (1 + 0.35 * (this.brightness[i] - 1));
    }

    this.nodePositions.needsUpdate = true;
    this.nodeOpacity.needsUpdate = true;
    this.nodeSize.needsUpdate = true;
  }

  private updateEdges() {
    const positions = this.linePositions.array as Float32Array;
    const colors = this.lineColors.array as Float32Array;
    const { edge } = this.palette;

    for (let e = 0; e < this.edgeA.length; e += 1) {
      const a = this.edgeA[e] * 3;
      const b = this.edgeB[e] * 3;
      const o = e * 6;

      positions[o] = this.current[a];
      positions[o + 1] = this.current[a + 1];
      positions[o + 2] = this.current[a + 2];
      positions[o + 3] = this.current[b];
      positions[o + 4] = this.current[b + 1];
      positions[o + 5] = this.current[b + 2];

      // Edge brightness follows its endpoints, so activating a project's nodes
      // lights up its wiring too.
      const ba = this.brightness[this.edgeA[e]];
      const bb = this.brightness[this.edgeB[e]];
      colors[o] = edge.r * ba;
      colors[o + 1] = edge.g * ba;
      colors[o + 2] = edge.b * ba;
      colors[o + 3] = edge.r * bb;
      colors[o + 4] = edge.g * bb;
      colors[o + 5] = edge.b * bb;
    }

    this.linePositions.needsUpdate = true;
    this.lineColors.needsUpdate = true;
  }

  private updatePulses(dt: number, time: number) {
    if (this.options.reducedMotion || this.pulses.length === 0) return;

    if (time >= this.nextForwardPass) {
      this.triggerForwardPass();
      this.nextForwardPass = time + 4 + Math.random() * 2;
    }

    const positions = this.pulsePositions.array as Float32Array;
    const opacity = this.pulseOpacity.array as Float32Array;

    for (let i = 0; i < this.pulses.length; i += 1) {
      const pulse = this.pulses[i];
      const i3 = i * 3;

      if (pulse.delay > 0) {
        pulse.delay -= dt;
        opacity[i] = 0;
        continue;
      }

      pulse.t += pulse.speed * dt;
      if (pulse.t >= 1) {
        pulse.t = 0;
        pulse.edge = Math.floor(Math.random() * this.edgeA.length);
        pulse.speed = 0.18 + Math.random() * 0.32;
        pulse.bright = 0.55 + Math.random() * 0.25;
      }

      const a = this.edgeA[pulse.edge] * 3;
      const b = this.edgeB[pulse.edge] * 3;
      const t = pulse.t;

      positions[i3] = this.current[a] + (this.current[b] - this.current[a]) * t;
      positions[i3 + 1] =
        this.current[a + 1] + (this.current[b + 1] - this.current[a + 1]) * t;
      positions[i3 + 2] =
        this.current[a + 2] + (this.current[b + 2] - this.current[a + 2]) * t;

      // Fade in and out along the edge so pulses arrive rather than blink off.
      opacity[i] = pulse.bright * Math.sin(t * Math.PI) ** 0.6;
    }

    this.pulsePositions.needsUpdate = true;
    this.pulseOpacity.needsUpdate = true;
  }
}
