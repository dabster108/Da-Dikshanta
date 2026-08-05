import * as THREE from "three";
import { NeuralField } from "./NeuralField";
import { CameraRig } from "./CameraRig";
import { SectionMorphs, type ProjectMorphSpec } from "./SectionMorphs";
import { PostFX } from "./PostFX";
import { detectDevice, type DeviceProfile } from "./deviceTier";
import { getPalette } from "./palette";
import { disposeGlowTextures } from "./glowTexture";

export interface SynapticSceneOptions {
  host: HTMLElement;
  name: string;
  projects: ProjectMorphSpec[];
  /** Skip the 3D node-collapse intro and reveal the network immediately. */
  skipIntro?: boolean;
}

export class SynapticScene {
  readonly profile: DeviceProfile;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly field: NeuralField;
  private readonly rig: CameraRig;
  private readonly morphs: SectionMorphs;
  private readonly postFX: PostFX;
  private readonly host: HTMLElement;

  private readonly clock = new THREE.Clock();
  private frame = 0;
  private running = false;
  private visible = true;
  private disposed = false;

  constructor(options: SynapticSceneOptions) {
    this.host = options.host;
    this.profile = detectDevice();

    const palette = getPalette();

    this.renderer = new THREE.WebGLRenderer({
      antialias: this.profile.antialias,
      powerPreference: "high-performance",
      alpha: false,
    });
    this.renderer.setClearColor(palette.background, 1);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, this.profile.maxPixelRatio),
    );
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.host.appendChild(this.renderer.domElement);

    // Fog does 80% of the depth cueing that DOF would, for free.
    this.scene.fog = new THREE.FogExp2(palette.background.getHex(), 0.024);

    this.field = new NeuralField({
      nodeScale: this.profile.nodeScale,
      pulseCount: this.profile.reducedMotion ? 0 : this.profile.pulseCount,
      reducedMotion: this.profile.reducedMotion,
    });
    this.field.setPixelRatio(this.renderer.getPixelRatio());
    this.scene.add(this.field.group);

    this.rig = new CameraRig(window.innerWidth / window.innerHeight, {
      drift: this.profile.drift,
      reducedMotion: this.profile.reducedMotion,
      tier: this.profile.tier,
    });

    this.morphs = new SectionMorphs(this.field, this.rig, {
      name: options.name,
      projects: options.projects,
      reducedMotion: this.profile.reducedMotion,
      tier: this.profile.tier,
    });
    this.scene.add(this.morphs.group);

    this.postFX = new PostFX(
      this.renderer,
      this.scene,
      this.rig.camera,
      this.profile,
    );

    this.morphs.setPixelRatio(this.renderer.getPixelRatio());

    this.bind();
    // The BootSequence is the cinematic intro now. Skip the 3D node-collapse
    // intro when it would just replay behind (or after) the boot overlay —
    // otherwise the Entry copy stays hidden behind useIntroGate on reload.
    if (options.skipIntro) {
      this.morphs.revealIntro();
    } else {
      this.morphs.runIntro(0);
    }
    this.start();
  }

  // ------------------------------------------------------------------ public

  /**
   * Fly the camera to a region. Called on route change. The rig lerps there
   * over ~0.3s, so navigation reads as "the camera is taking me there."
   */
  setRegion(t: number) {
    this.rig.setRegionT(t);
  }

  /** Used on first mount so the camera starts at the entry region, not t=0. */
  snapToRegion(t: number) {
    this.rig.snapToRegion(t);
  }

  setCharge(id: string, progress: number) {
    this.morphs.setCharge(id, progress);
  }

  lock(id: string) {
    this.morphs.lock(id);
  }

  setCompleted(value: boolean) {
    this.morphs.setCompleted(value);
  }

  /** Reduced-motion visitors get silhouettes on scroll, no hold required. */
  get reducedMotion() {
    return this.profile.reducedMotion;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.unbind();

    this.field.dispose();
    this.morphs.dispose();
    this.postFX.dispose();
    disposeGlowTextures();

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  // ----------------------------------------------------------------- wiring

  private onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, this.profile.maxPixelRatio),
    );
    this.renderer.setSize(width, height);
    this.field.setPixelRatio(this.renderer.getPixelRatio());
    this.morphs.setPixelRatio(this.renderer.getPixelRatio());
    this.rig.resize(width / height);
    this.postFX.setSize(width, height);
  };

  private onVisibility = () => {
    if (document.hidden) this.stop();
    else if (this.visible) this.start();
  };

  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.stop();
  };

  private onContextRestored = () => {
    this.start();
  };

  private observer: IntersectionObserver | null = null;

  private bind() {
    window.addEventListener("resize", this.onResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    this.renderer.domElement.addEventListener(
      "webglcontextlost",
      this.onContextLost,
    );
    this.renderer.domElement.addEventListener(
      "webglcontextrestored",
      this.onContextRestored,
    );

    // Most portfolios burn GPU on a canvas nobody is looking at.
    if (typeof IntersectionObserver !== "undefined") {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          this.visible = entry.isIntersecting;
          if (this.visible && !document.hidden) this.start();
          else this.stop();
        },
        { threshold: 0 },
      );
      this.observer.observe(this.host);
    }
  }

  private unbind() {
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.renderer.domElement.removeEventListener(
      "webglcontextlost",
      this.onContextLost,
    );
    this.renderer.domElement.removeEventListener(
      "webglcontextrestored",
      this.onContextRestored,
    );
    this.observer?.disconnect();
  }

  // ------------------------------------------------------------------- loop

  private start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.clock.getDelta(); // discard the gap spent paused
    this.frame = requestAnimationFrame(this.tick);
  }

  private stop() {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private tick = () => {
    if (!this.running) return;
    this.frame = requestAnimationFrame(this.tick);

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.elapsedTime;

    this.rig.update(dt, time, this.field);
    this.field.update(dt, time);
    this.morphs.update(dt, time, this.rig.getT());

    this.postFX.render();
  };
}
