import * as THREE from "three";

/**
 * Shared additive point material for every cloud in the scene, so nodes,
 * pulses and silhouette points are visually the same substance.
 *
 * Fog is applied by hand: three's fog chunk mixes toward the fog colour, which
 * under additive blending would *add* brightness with distance. Attenuating
 * alpha instead is what actually reads as depth here.
 */
export const makePointMaterial = (map: THREE.Texture) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: map },
      uPixelRatio: { value: 1 },
      uFogDensity: { value: 0.024 },
      uGlobalAlpha: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aOpacity;
      attribute vec3 aColor;

      uniform float uPixelRatio;

      varying float vOpacity;
      varying vec3 vColor;
      varying float vDepth;

      void main() {
        vOpacity = aOpacity;
        vColor = aColor;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mvPosition.z;
        gl_PointSize = aSize * uPixelRatio / max(vDepth, 0.001);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uFogDensity;
      uniform float uGlobalAlpha;

      varying float vOpacity;
      varying vec3 vColor;
      varying float vDepth;

      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        float fog = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
        float alpha = tex.a * vOpacity * uGlobalAlpha * (1.0 - fog);
        if (alpha < 0.004) discard;
        // Do NOT premultiply: AdditiveBlending is (SrcAlpha, One), so the
        // blender already scales by alpha. Doing it here too squares it and
        // the glow falloff disappears.
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
