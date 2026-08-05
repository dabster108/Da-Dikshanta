import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { DeviceProfile } from "./deviceTier";

/**
 * Bloom is what turns points into glow. Threshold is deliberately low (0.15)
 * so mid-brightness nodes bloom a little too — a high threshold only lights the
 * hottest pixels and the field reads as flat dots.
 *
 * Depth of field is intentionally absent: FogExp2 in the base scene already
 * does the depth cueing, at a fraction of the cost.
 */
export class PostFX {
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
    profile: DeviceProfile,
  ) {
    if (!profile.bloom) return;

    const size = renderer.getSize(new THREE.Vector2());
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    // Bloom kept restrained: a low threshold + high strength turns the
    // central node cluster into a white blowout, which reads as a "white
    // screen" — especially on reload, when the boot overlay isn't there to
    // hide the first frames. Threshold up, strength down: glow without washout.
    this.bloom = new UnrealBloomPass(size, 0.22, 0.4, 0.45);
    this.composer.addPass(this.bloom);

    if (profile.film) {
      // Cinematic, not noisy.
      this.composer.addPass(new FilmPass(0.035, false));
    }

    this.composer.addPass(new OutputPass());
  }

  render() {
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  setSize(width: number, height: number) {
    this.composer?.setSize(width, height);
    this.bloom?.setSize(width, height);
  }

  dispose() {
    this.composer?.dispose?.();
    this.bloom?.dispose?.();
  }
}
