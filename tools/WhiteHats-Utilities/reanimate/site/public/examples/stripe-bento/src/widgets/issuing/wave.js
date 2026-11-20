// The iridescent "wave": a 400x400 plane (128x256 segments) folded into a ribbon (wave-geometry.js),
// displaced by simplex noise over time and coloured from the palette texture. Port of stripe.com's
// wave mesh (light theme, no noise bands).

import {
  AddEquation,
  BufferAttribute,
  BufferGeometry,
  CustomBlending,
  DoubleSide,
  Mesh,
  ShaderMaterial,
  SrcColorFactor,
  Texture,
  Vector2,
  Vector3,
  ZeroFactor,
} from "three";
import { waveFragment, waveVertex } from "./shaders.js";
import { foldedWaveArrays } from "./wave-geometry.js";

// Build the ribbon in a worker (fallback: on this thread), once per page, as stripe.com does.
let sharedGeometry = null;
let pendingGeometry = null;

function toBufferGeometry({ positions, uvs, normals, indices }) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setIndex(Array.from(indices));
  geometry.computeVertexNormals();
  return geometry;
}

export function createFoldedWaveGeometry(width = 400, height = 400, subdivisionsX = 128, subdivisionsY = 256) {
  if (sharedGeometry) return Promise.resolve(sharedGeometry);
  if (pendingGeometry) return pendingGeometry;
  const params = { width, height, subdivisionsX, subdivisionsY };
  pendingGeometry = (async () => {
    let arrays;
    if (typeof Worker !== "undefined") {
      try {
        const worker = new Worker(new URL("./wave-geometry.worker.js", import.meta.url), { type: "module" });
        arrays = await new Promise((resolve) => {
          worker.onmessage = (e) => {
            worker.terminate();
            resolve(e.data);
          };
          worker.onerror = () => {
            worker.terminate();
            resolve(foldedWaveArrays(params));
          };
          worker.postMessage(params);
        });
      } catch {
        arrays = foldedWaveArrays(params);
      }
    } else {
      arrays = foldedWaveArrays(params);
    }
    sharedGeometry = toBufferGeometry(arrays);
    pendingGeometry = null;
    return sharedGeometry;
  })();
  return pendingGeometry;
}

function waveUniforms() {
  const empty = new Texture();
  return {
    u_time: { value: 0 },
    u_speed: { value: 4e-5 },
    u_resolution: { value: new Vector2() },
    u_paletteTexture: { value: empty },
    u_lutTexture: { value: empty },
    u_blueNoiseTexture: { value: empty },
    u_colorContrast: { value: 1 },
    u_colorSaturation: { value: 1 },
    u_colorHueShift: { value: 0 },
    u_displaceFrequencyX: { value: 2.25 },
    u_displaceFrequencyZ: { value: 2.25 },
    u_displaceAmount: { value: 0 },
    u_twistFrequencyY: { value: 0 },
    u_twistFrequencyX: { value: 0 },
    u_twistFrequencyZ: { value: 0 },
    u_twistPowerY: { value: 1 },
    u_twistPowerX: { value: 1 },
    u_twistPowerZ: { value: 1 },
    u_glowAmount: { value: 0.01 },
    u_glowPower: { value: 0.01 },
    u_glowRamp: { value: 1 },
    u_mousePosition: { value: new Vector2(0, 0) },
    u_lineAmount: { value: 450 },
    u_lineThickness: { value: 0.01 },
    u_lineDerivativePower: { value: 0.9 },
    u_maxWidth: { value: 1232 },
    u_clearColor: { value: new Vector3(1, 1, 1) },
  };
}

export class WaveMesh {
  constructor(paletteTexture, geometry) {
    // Light theme: the output is multiplied by itself (src·src + dst·0), which deepens the palette.
    this.material = new ShaderMaterial({
      uniforms: waveUniforms(),
      vertexShader: waveVertex,
      fragmentShader: waveFragment,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide,
      colorWrite: true,
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: SrcColorFactor,
      blendDst: ZeroFactor,
    });
    this.material.uniforms.u_paletteTexture.value = paletteTexture;
    this.mesh = new Mesh(geometry, this.material);
    this.timeOffset = 0;
  }

  applyConfig(config, clearColor) {
    const u = this.material.uniforms;
    this.timeOffset = config.timeOffset;
    u.u_speed.value = config.speed;
    u.u_colorContrast.value = config.colorContrast;
    u.u_colorSaturation.value = config.colorSaturation;
    u.u_colorHueShift.value = config.colorHueShift;
    u.u_displaceFrequencyX.value = config.displaceFrequencyX;
    u.u_displaceFrequencyZ.value = config.displaceFrequencyZ;
    u.u_displaceAmount.value = config.displaceAmount;
    u.u_twistFrequencyX.value = config.twistFrequencyX;
    u.u_twistFrequencyY.value = config.twistFrequencyY;
    u.u_twistFrequencyZ.value = config.twistFrequencyZ;
    u.u_twistPowerX.value = config.twistPowerX;
    u.u_twistPowerY.value = config.twistPowerY;
    u.u_twistPowerZ.value = config.twistPowerZ;
    u.u_glowAmount.value = config.glowAmount;
    u.u_glowPower.value = config.glowPower;
    u.u_glowRamp.value = config.glowRamp;
    u.u_lineThickness.value = config.lineThickness;
    u.u_lineAmount.value = config.lineAmount;
    u.u_lineDerivativePower.value = config.lineDerivativePower;
    u.u_clearColor.value = clearColor;
    this.mesh.position.set(config.position.x, config.position.y, config.position.z);
    this.mesh.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
    this.mesh.scale.set(config.scale.x, config.scale.y, config.scale.z);
  }

  set time(ms) {
    this.material.uniforms.u_time.value = ms + this.timeOffset;
  }

  set resolution(v) {
    this.material.uniforms.u_resolution.value = v;
  }

  set mousePosition(v) {
    this.material.uniforms.u_mousePosition.value = v;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
