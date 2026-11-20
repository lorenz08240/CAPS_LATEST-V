// The ocean renderer, a port of vercel.com/fluid's ocean worker. It runs off the main thread on an
// OffscreenCanvas with WebGPU and posts every frame to the page as an ImageBitmap.
//
// Each frame: a Tessendorf ocean (a Phillips spectrum from seeded Gaussian noise, advanced in time,
// then a 2D inverse FFT as 2 × log2(N) render passes) gives a displacement and a normal/foam texture.
// An N × N grid of dots is displaced by them, projected by a fixed camera, snapped to a square pixel
// grid and drawn as tiny round sprites. Light theme: black dots with alpha; dark theme: white dots
// added up, with a bloom. The WGSL is the site's own (shaders.js); the passes, uniform layouts, sizes
// and the frame loop follow its worker line for line.

import * as WGSL from "./shaders.js";
import { CAMERA, COLORS, G, LIGHT_DEFAULT, NOISE_SEED, OCEAN_SIZE, PARTICLE_EXTENT, TIME_FACTOR, resolveSettings } from "./settings.js";

const TEX = GPUTextureUsage;
const SCENE_FORMAT = "rgba16float";
const SIM_FORMAT = "rgba32float";
const BLUR_KERNELS = [6, 10, 14, 18, 22];
// light theme: premultiplied "over"; dark theme: additive
const BLEND_LIGHT = { color: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" }, alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" } };
const BLEND_DARK = { color: { srcFactor: "src-alpha", dstFactor: "one", operation: "add" }, alpha: { srcFactor: "one", dstFactor: "one", operation: "add" } };

// ---------- uniforms (byte layouts as on the site) ----------

const floats = (bytes) => new Float32Array(bytes / 4);
const initialSpectrumUniforms = (s) => {
  const u = floats(32);
  u.set([s.particles.resolution, OCEAN_SIZE, s.ocean.windSpeed, s.ocean.windAngle, s.ocean.amplitude, 0, 0, 0]);
  return u;
};
const spectrumUniforms = (s, simTime) => Float32Array.of(s.particles.resolution, OCEAN_SIZE, simTime * TIME_FACTOR, s.ocean.choppiness);
const ifftUniforms = (n, subtransformSize, horizontal) => Float32Array.of(n, subtransformSize, +!!horizontal, 0);
const normalFoamUniforms = (s) => {
  const u = floats(32);
  u.set([s.particles.resolution, PARTICLE_EXTENT, s.ocean.displacementScale, s.ocean.choppiness, s.ocean.foamThreshold, 0, 0, 0]);
  return u;
};
function blurUniforms(direction, invSize, radius) {
  const u = floats(112);
  u.set([direction[0], direction[1], invSize[0], invSize[1]], 0);
  const coefficients = new Float32Array(24);
  const sigma = radius / 3;
  for (let i = 0; i < radius; i += 1) coefficients[i] = (0.39894 * Math.exp((-0.5 * i * i) / (sigma * sigma))) / sigma;
  u.set(coefficients, 4);
  return u;
}

// ---------- matrices (column-major, as the site builds them) ----------

function multiply(a, b) {
  const r = new Float32Array(16);
  for (let i = 0; i < 4; i++)
    for (let n = 0; n < 4; n++) r[4 * i + n] = a[n] * b[4 * i] + a[4 + n] * b[4 * i + 1] + a[8 + n] * b[4 * i + 2] + a[12 + n] * b[4 * i + 3];
  return r;
}
function normalize(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  return l === 0 ? [0, 0, 0] : [v[0] / l, v[1] / l, v[2] / l];
}
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function cameraMatrices(width, height, camera) {
  const aspect = width / Math.max(1, height);
  const lift = camera.eyeY - CAMERA.eye[1];
  const eye = [CAMERA.eye[0], camera.eyeY, CAMERA.eye[2]];
  const target = [CAMERA.target[0], CAMERA.target[1] + lift, CAMERA.target[2]];
  const z = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
  const x = normalize(cross(CAMERA.up, z));
  const y = cross(z, x);
  const lookAt = new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
  let view = lookAt;
  if (camera.pitchDegrees !== 0) {
    const p = (camera.pitchDegrees * Math.PI) / 180;
    const c = Math.cos(p);
    const s = Math.sin(p);
    view = multiply(new Float32Array([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]), lookAt);
  }
  const f = 1 / Math.tan((CAMERA.fovDegrees * Math.PI) / 180 / 2);
  const projection = new Float32Array(16);
  projection[0] = f / aspect;
  projection[5] = f;
  projection[10] = CAMERA.far / (CAMERA.near - CAMERA.far);
  projection[11] = -1;
  projection[14] = (CAMERA.far * CAMERA.near) / (CAMERA.near - CAMERA.far);
  return { view, projection };
}

// ---------- the noise: mulberry32 + Box-Muller, seeded, N × N × 4 floats ----------

function gaussianNoise(n, seed = NOISE_SEED) {
  const out = new Float32Array(n * n * 4);
  let state = seed >>> 0;
  const random = () => {
    let e = (state = (state + 0x6d2b79f5) >>> 0);
    e = Math.imul(e ^ (e >>> 15), 1 | e);
    return (((e ^= e + Math.imul(e ^ (e >>> 7), 61 | e)) ^ (e >>> 14)) >>> 0) / 0x100000000;
  };
  for (let i = 0; i < out.length; i += 2) {
    const u = Math.max(random(), 5e-324);
    const v = random();
    const r = Math.sqrt(-2 * Math.log(u));
    const a = 2 * Math.PI * v;
    out[i] = r * Math.cos(a);
    if (i + 1 < out.length) out[i + 1] = r * Math.sin(a);
  }
  return out;
}

// ---------- GPU resources ----------

function uniformBuffer(device, data, label) {
  const buffer = device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, label });
  device.queue.writeBuffer(buffer, 0, data);
  return buffer;
}
const emptyUniform = (device, size, label) => device.createBuffer({ size, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, label });
const write = (device, buffer, data) => device.queue.writeBuffer(buffer, 0, data);
const simTexture = (device, n, label) =>
  device.createTexture({ size: [n, n], format: SIM_FORMAT, usage: TEX.RENDER_ATTACHMENT | TEX.TEXTURE_BINDING | TEX.COPY_SRC | TEX.COPY_DST, label });
const sceneTexture = (device, width, height, label) =>
  device.createTexture({ size: [width, height], format: SCENE_FORMAT, usage: TEX.RENDER_ATTACHMENT | TEX.TEXTURE_BINDING | TEX.COPY_SRC, label });

function fullscreenPipeline(device, label, module, format, fragmentExtra = {}) {
  return device.createRenderPipeline({
    label,
    layout: "auto",
    vertex: { module, entryPoint: "vs_main" },
    fragment: { module, entryPoint: "fs_main", targets: [{ format }], ...fragmentExtra },
    primitive: { topology: "triangle-list" },
  });
}

function fullscreenPass(encoder, label, view, pipeline, bindGroup) {
  const pass = encoder.beginRenderPass({ label, colorAttachments: [{ view, loadOp: "clear", storeOp: "store", clearValue: [0, 0, 0, 0] }] });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(3);
  pass.end();
}

function createSimulation(device, noise, settings) {
  const n = settings.particles.resolution;
  const initialSpectrum = simTexture(device, n, "fluid-full-h0");
  const spectrum = simTexture(device, n, "fluid-full-spectrum");
  const ping = simTexture(device, n, "fluid-full-ifft-ping");
  const pong = simTexture(device, n, "fluid-full-ifft-pong");
  const normalFoam = simTexture(device, n, "fluid-full-normal-foam");
  const layout = device.createBindGroupLayout({
    label: "fluid-full-sim-layout",
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: "unfilterable-float" } },
    ],
  });
  const pipelineLayout = device.createPipelineLayout({ label: "fluid-full-sim-pipeline-layout", bindGroupLayouts: [layout] });
  const pipeline = (label, module, constants) =>
    device.createRenderPipeline({
      label,
      layout: pipelineLayout,
      vertex: { module, entryPoint: "vs_main", constants },
      fragment: { module, entryPoint: "fs_main", constants, targets: [{ format: SIM_FORMAT }] },
      primitive: { topology: "triangle-list" },
    });
  const bind = (label, buffer, texture) =>
    device.createBindGroup({ label, layout, entries: [{ binding: 0, resource: { buffer } }, { binding: 1, resource: texture.createView() }] });

  const shader = (code) => device.createShaderModule({ code });
  const ifft = shader(WGSL.IFFT_STAGE); // one module, two pipelines (IFFT_HORIZONTAL overridden)
  const initialPipeline = pipeline("fluid-full-initial-spectrum", shader(WGSL.INITIAL_SPECTRUM));
  const spectrumPipeline = pipeline("fluid-full-spectrum", shader(WGSL.SPECTRUM));
  const horizontalPipeline = pipeline("fluid-full-ifft-horizontal", ifft, { IFFT_HORIZONTAL: 1 });
  const verticalPipeline = pipeline("fluid-full-ifft-vertical", ifft, { IFFT_HORIZONTAL: 0 });
  const normalPipeline = pipeline("fluid-full-normal-foam", shader(WGSL.NORMAL_FOAM));
  const initialUniform = uniformBuffer(device, initialSpectrumUniforms(settings), "fluid-full-initial-spectrum-uniform");
  const spectrumUniform = uniformBuffer(device, spectrumUniforms(settings, 0), "fluid-full-spectrum-uniform");
  const normalUniform = uniformBuffer(device, normalFoamUniforms(settings), "fluid-full-normal-foam-uniform");
  const initialBindGroup = bind("fluid-full-initial-spectrum-bind-group", initialUniform, noise);
  const spectrumBindGroup = bind("fluid-full-spectrum-bind-group", spectrumUniform, initialSpectrum);

  const stages = Math.log2(n);
  if (!Number.isInteger(stages)) throw new Error(`resolution must be a power of two, got ${n}`);
  const ifftSteps = [];
  const buffers = [];
  let input = spectrum;
  let output = ping;
  let spare = pong;
  for (const horizontal of [true, false]) {
    for (let t = 0; t < stages; t += 1) {
      const name = `fluid-full-ifft-${horizontal ? "horizontal" : "vertical"}-${t}`;
      const buffer = uniformBuffer(device, ifftUniforms(n, 2 ** (t + 1), horizontal), `${name}-uniform`);
      buffers.push(buffer);
      ifftSteps.push({ label: name, output, pipeline: horizontal ? horizontalPipeline : verticalPipeline, bindGroup: bind(`${name}-bind-group`, buffer, input) });
      input = output;
      [output, spare] = [spare, output];
    }
  }
  const displacement = input;
  const normalBindGroup = bind("fluid-full-normal-foam-bind-group", normalUniform, displacement);

  return {
    displacement,
    normalFoam,
    encode(encoder, settings, simTime, needsInitialSpectrum) {
      write(device, spectrumUniform, spectrumUniforms(settings, simTime));
      write(device, normalUniform, normalFoamUniforms(settings));
      if (needsInitialSpectrum) {
        write(device, initialUniform, initialSpectrumUniforms(settings));
        fullscreenPass(encoder, "fluid-full-initial-spectrum-pass", initialSpectrum.createView(), initialPipeline, initialBindGroup);
      }
      fullscreenPass(encoder, "fluid-full-spectrum-pass", spectrum.createView(), spectrumPipeline, spectrumBindGroup);
      for (const s of ifftSteps) fullscreenPass(encoder, s.label, s.output.createView(), s.pipeline, s.bindGroup);
      fullscreenPass(encoder, "fluid-full-normal-foam-pass", normalFoam.createView(), normalPipeline, normalBindGroup);
    },
    destroy() {
      for (const b of [initialUniform, spectrumUniform, normalUniform, ...buffers]) b.destroy();
      for (const t of [initialSpectrum, spectrum, ping, pong, normalFoam]) t.destroy();
    },
  };
}

function createParticles(device, sim, resolution) {
  const layout = device.createBindGroupLayout({
    label: "fluid-particles-bind-group-layout",
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } },
      { binding: 1, visibility: GPUShaderStage.VERTEX, texture: { sampleType: "unfilterable-float" } },
      { binding: 2, visibility: GPUShaderStage.VERTEX, texture: { sampleType: "unfilterable-float" } },
    ],
  });
  const pipelineLayout = device.createPipelineLayout({ label: "fluid-particles-pipeline-layout", bindGroupLayouts: [layout] });
  const pipeline = (label, code, blend) => {
    const shader = device.createShaderModule({ code });
    return device.createRenderPipeline({
      label,
      layout: pipelineLayout,
      vertex: { module: shader, entryPoint: "vs_main" },
      fragment: { module: shader, entryPoint: "fs_main", targets: [{ format: SCENE_FORMAT, blend }] },
      primitive: { topology: "triangle-strip" },
    });
  };
  const dark = pipeline("fluid-particles-pass-dark", WGSL.PARTICLES_DARK, BLEND_DARK);
  const light = pipeline("fluid-particles-pass-light", WGSL.PARTICLES_LIGHT, BLEND_LIGHT);
  const uniform = emptyUniform(device, 256, "fluid-particles-uniform");
  const bindGroup = device.createBindGroup({
    label: "fluid-particles-bind-group",
    layout,
    entries: [
      { binding: 0, resource: { buffer: uniform } },
      { binding: 1, resource: sim.displacement.createView() },
      { binding: 2, resource: sim.normalFoam.createView() },
    ],
  });
  const instances = resolution * resolution;
  return {
    encode(encoder, target, o) {
      const u = floats(256);
      const s = o.settings;
      u.set(o.view, 0);
      u.set(o.projection, 16);
      u.set([o.width, o.height, o.pixelRatio, s.particles.resolution], 32);
      u.set([PARTICLE_EXTENT, OCEAN_SIZE, G, 0], 36);
      u.set([s.particles.fadeNear, s.particles.fadeFar, s.particles.fadePower, s.particles.snap], 40);
      u.set([...COLORS.ocean, 0], 44);
      u.set([...COLORS.neon, 0], 48);
      u.set([...COLORS.foam, 0], 52);
      u.set([s.ocean.displacementScale, s.particles.pointSize, o.light === undefined ? LIGHT_DEFAULT : +!!o.light, 0], 56);
      write(device, uniform, u);
      const pass = encoder.beginRenderPass({ label: "fluid-particles-pass", colorAttachments: [{ view: target.createView(), loadOp: "clear", storeOp: "store", clearValue: [0, 0, 0, 0] }] });
      pass.setPipeline(o.light ? light : dark);
      pass.setBindGroup(0, bindGroup, []);
      pass.draw(4, instances);
      pass.end();
    },
    destroy() {
      uniform.destroy();
    },
  };
}

function createBloom(device, width, height) {
  const sizes = [];
  let w = Math.max(1, Math.round(width / 2));
  let h = Math.max(1, Math.round(height / 2));
  for (let i = 0; i < 5; i += 1) {
    sizes.push({ width: w, height: h });
    w = Math.max(1, Math.round(w / 2));
    h = Math.max(1, Math.round(h / 2));
  }
  const tex = (size, label) => sceneTexture(device, size.width, size.height, label);
  const bright = tex(sizes[0], "fluid-bloom-bright");
  const horizontal = sizes.map((s, i) => tex(s, `fluid-bloom-h${i}`));
  const vertical = sizes.map((s, i) => tex(s, `fluid-bloom-v${i}`));
  const composite = tex(sizes[0], "fluid-bloom-composite");
  const sampler = device.createSampler({ minFilter: "linear", magFilter: "linear" });
  const brightPipeline = fullscreenPipeline(device, "fluid-bloom-bright", device.createShaderModule({ code: WGSL.BLOOM_BRIGHT }), SCENE_FORMAT);
  const blurModule = device.createShaderModule({ code: WGSL.BLOOM_BLUR });
  const blurPipelines = BLUR_KERNELS.map((k) => fullscreenPipeline(device, `fluid-bloom-blur-${k}`, blurModule, SCENE_FORMAT, { constants: { KERNEL_RADIUS: k } }));
  const compositePipeline = fullscreenPipeline(device, "fluid-bloom-composite", device.createShaderModule({ code: WGSL.BLOOM_COMPOSITE }), SCENE_FORMAT);
  const brightUniform = emptyUniform(device, 16, "fluid-bloom-bright-uniform");
  const hUniforms = BLUR_KERNELS.map((_, i) => emptyUniform(device, 112, `fluid-bloom-blur-h-uniform-${i}`));
  const vUniforms = BLUR_KERNELS.map((_, i) => emptyUniform(device, 112, `fluid-bloom-blur-v-uniform-${i}`));
  const compositeUniform = emptyUniform(device, 48, "fluid-bloom-composite-uniform");
  const group = (pipeline, entries) => device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: entries.map((resource, binding) => ({ binding, resource })) });

  return {
    composite,
    encode(encoder, scene, settings) {
      write(device, brightUniform, Float32Array.of(settings.glow.bloomThreshold, 0.01, 0, 0));
      fullscreenPass(encoder, "fluid-bloom-bright-pass", bright.createView(), brightPipeline, group(brightPipeline, [{ buffer: brightUniform }, scene.createView(), sampler]));
      let input = bright;
      for (let i = 0; i < 5; i += 1) {
        const size = sizes[i];
        const pipeline = blurPipelines[i];
        write(device, hUniforms[i], blurUniforms([1, 0], [1 / size.width, 1 / size.height], BLUR_KERNELS[i]));
        fullscreenPass(encoder, `fluid-bloom-blur-h${i}`, horizontal[i].createView(), pipeline, group(pipeline, [{ buffer: hUniforms[i] }, input.createView(), sampler]));
        write(device, vUniforms[i], blurUniforms([0, 1], [1 / size.width, 1 / size.height], BLUR_KERNELS[i]));
        fullscreenPass(encoder, `fluid-bloom-blur-v${i}`, vertical[i].createView(), pipeline, group(pipeline, [{ buffer: vUniforms[i] }, horizontal[i].createView(), sampler]));
        input = vertical[i];
      }
      const c = floats(48);
      c.set([settings.glow.bloomStrength, settings.glow.bloomRadius, 0, 0], 0);
      c.set([1, 0.8, 0.6, 0.4, 0.2], 4);
      write(device, compositeUniform, c);
      fullscreenPass(encoder, "fluid-bloom-composite-pass", composite.createView(), compositePipeline, group(compositePipeline, [{ buffer: compositeUniform }, ...vertical.map((t) => t.createView()), sampler]));
    },
    destroy() {
      for (const t of [bright, ...horizontal, ...vertical, composite]) t.destroy();
      for (const b of [brightUniform, ...hUniforms, ...vUniforms, compositeUniform]) b.destroy();
    },
  };
}

function createPresent(device, format) {
  const sampler = device.createSampler({ minFilter: "linear", magFilter: "linear" });
  const pipeline = fullscreenPipeline(device, "fluid-present", device.createShaderModule({ code: WGSL.PRESENT }), format);
  return {
    encode(encoder, view, scene, bloom) {
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: scene.createView() },
          { binding: 1, resource: bloom.createView() },
          { binding: 2, resource: sampler },
        ],
      });
      fullscreenPass(encoder, "fluid-present-pass", view, pipeline, bindGroup);
    },
  };
}

function createRenderer(device, format, width, height, settings) {
  const n = settings.particles.resolution;
  const noise = simTexture(device, n, "fluid-noise");
  device.queue.writeTexture({ texture: noise }, gaussianNoise(n), { bytesPerRow: 4 * n * 4, rowsPerImage: n }, { width: n, height: n, depthOrArrayLayers: 1 });
  const scene = sceneTexture(device, width, height, "fluid-full-scene-hdr");
  const bloom = createBloom(device, width, height);
  // the light theme presents the scene with this never-written (all zero) texture as its bloom
  const blackBloom = sceneTexture(device, Math.max(1, Math.round(width / 2)), Math.max(1, Math.round(height / 2)), "fluid-black-bloom");
  const present = createPresent(device, format);
  const sim = createSimulation(device, noise, settings);
  const particles = createParticles(device, sim, n);
  return {
    width,
    height,
    format,
    resolution: n,
    spectrumKey: undefined,
    render(view, simTime, settings, pixelRatio, theme, needsInitialSpectrum) {
      const key = `${settings.particles.resolution}:${settings.ocean.windSpeed}:${settings.ocean.windAngle}:${settings.ocean.amplitude}`;
      const simEncoder = device.createCommandEncoder({ label: "fluid-full-sim-encoder" });
      sim.encode(simEncoder, settings, simTime, needsInitialSpectrum || this.spectrumKey !== key);
      device.queue.submit([simEncoder.finish()]);
      this.spectrumKey = key;

      const { view: viewMatrix, projection } = cameraMatrices(width, height, settings.camera);
      const encoder = device.createCommandEncoder({ label: "fluid-full-frame" });
      particles.encode(encoder, scene, { view: viewMatrix, projection, width, height, pixelRatio, settings, light: theme === "light" });
      if (theme === "dark") {
        bloom.encode(encoder, scene, settings);
        present.encode(encoder, view, scene, bloom.composite);
      } else {
        present.encode(encoder, view, scene, blackBloom);
      }
      device.queue.submit([encoder.finish()]);
    },
    destroy() {
      particles.destroy();
      sim.destroy();
      noise.destroy();
      bloom.destroy();
      blackBloom.destroy();
      scene.destroy();
    },
  };
}

// ---------- the frame loop and the page's messages ----------

let state;
let initialized = false;
const queued = [];
let uncaptured = 0;

const post = (message, transfer) => self.postMessage(message, transfer ?? []);
const describe = (e) => ({ reason: e instanceof Error || typeof e?.message === "string" ? e.message : String(e), ts: Date.now() });

function dimensionsOf(d) {
  const finite = (v, fallback) => (Number.isFinite(v) ? v : fallback);
  const dpr = Math.max(1, finite(d.dpr, 1));
  const cssWidth = Math.max(1, Math.floor(finite(d.cssWidth, 1)));
  const cssHeight = Math.max(1, Math.floor(finite(d.cssHeight, 1)));
  return {
    cssWidth,
    cssHeight,
    pixelWidth: Math.max(1, Math.floor(finite(d.pixelWidth, cssWidth * dpr))),
    pixelHeight: Math.max(1, Math.floor(finite(d.pixelHeight, cssHeight * dpr))),
    dpr,
  };
}

function configure(context, device, format) {
  context.configure({ device, format, alphaMode: "premultiplied" });
}

function schedule(s) {
  if (s.disposed || s.lifecycle !== "active" || s.animationHandle !== undefined || s.timerHandle !== undefined) return;
  if (typeof self.requestAnimationFrame === "function") {
    s.animationHandle = self.requestAnimationFrame((t) => {
      s.animationHandle = undefined;
      tick(t);
    });
    return;
  }
  s.timerHandle = setTimeout(() => {
    s.timerHandle = undefined;
    tick(performance.now());
  }, s.targetFrameMs);
}

function unschedule(s) {
  if (s.animationHandle !== undefined) {
    self.cancelAnimationFrame?.(s.animationHandle);
    s.animationHandle = undefined;
  }
  if (s.timerHandle !== undefined) {
    clearTimeout(s.timerHandle);
    s.timerHandle = undefined;
  }
}

function tick(now) {
  const s = state;
  if (!s || s.disposed || s.lifecycle !== "active") return;
  schedule(s);
  if (!(now - s.lastRenderAt >= s.targetFrameMs - 0.5)) return; // at most targetFps
  const dt = s.lastTickAt === undefined ? 0 : (now - s.lastTickAt) / 1000;
  s.lastTickAt = now;
  s.lastRenderAt = now;
  try {
    if (s.pendingResize) {
      s.dimensions = s.pendingResize;
      s.pendingResize = undefined;
      let changed = false;
      if (s.canvas.width !== s.dimensions.pixelWidth) {
        s.canvas.width = s.dimensions.pixelWidth;
        changed = true;
      }
      if (s.canvas.height !== s.dimensions.pixelHeight) {
        s.canvas.height = s.dimensions.pixelHeight;
        changed = true;
      }
      if (changed) {
        s.context.unconfigure();
        configure(s.context, s.device, s.format);
      }
    }
    // time runs at timeScale, and never jumps more than 50 ms per frame
    s.simTime += Math.min(Number.isFinite(dt) ? Math.max(0, dt) : 0, 0.05) * s.settings.ocean.timeScale;
    const needsInitialSpectrum = s.needsInitialSpectrum;
    s.needsInitialSpectrum = false;
    const { pixelWidth: width, pixelHeight: height, dpr } = s.dimensions;
    const view = s.context.getCurrentTexture().createView();
    if (!s.renderer || s.renderer.width !== width || s.renderer.height !== height || s.renderer.format !== s.format) {
      s.renderer?.destroy();
      s.renderer = createRenderer(s.device, s.format, width, height, s.settings);
    }
    s.renderer.render(view, s.simTime, s.settings, dpr, s.theme, needsInitialSpectrum);
    if (!s.firstFrameSent) {
      s.firstFrameSent = true;
      post({ type: "firstFrame" });
    }
    const bitmap = s.canvas.transferToImageBitmap();
    post({ type: "frame", bitmap }, [bitmap]);
  } catch (e) {
    post({ type: "error", stage: "render", ...describe(e) });
    unschedule(s);
  }
}

function dispose(stage) {
  const s = state;
  state = undefined;
  if (!s) {
    if (initialized) post({ type: "disposed" });
    return;
  }
  s.disposed = true;
  unschedule(s);
  try {
    s.renderer?.destroy();
    s.device.destroy();
    post({ type: "disposed" });
  } catch (e) {
    post({ type: "error", stage, ...describe(e) });
  }
}

async function init(message) {
  if (initialized || state) return post({ type: "error", stage: "init", ...describe("Ocean worker already initialized.") });
  initialized = true;
  let device;
  try {
    const gpu = navigator.gpu;
    if (!gpu) return post({ type: "unsupported", ...describe("WebGPU is unavailable in this worker.") });
    const dimensions = dimensionsOf(message.dimensions);
    const canvas = new OffscreenCanvas(dimensions.pixelWidth, dimensions.pixelHeight);
    const context = canvas.getContext("webgpu");
    if (!context) return post({ type: "unsupported", ...describe("OffscreenCanvas WebGPU context is unavailable.") });
    const adapter = await gpu.requestAdapter();
    if (!adapter) throw new Error("WebGPU adapter unavailable.");
    device = await adapter.requestDevice();
    device.lost.then((info) => {
      if (info.reason === "destroyed") return;
      post({ type: "error", stage: "device", ...describe(`device lost: ${info.reason}${info.message ? ` ${info.message}` : ""}`) });
      if (state) unschedule(state);
    });
    device.onuncapturederror = (e) => {
      uncaptured += 1;
      post({ type: "error", stage: "render", ...describe(e.error) });
      if (uncaptured >= 3 && state) unschedule(state);
    };
    const format = gpu.getPreferredCanvasFormat();
    configure(context, device, format);
    const targetFps = message.isMobile ? 30 : 60;
    state = {
      canvas,
      context,
      device,
      format,
      renderer: undefined,
      settings: resolveSettings(message.isMobile),
      simTime: 0,
      needsInitialSpectrum: true,
      dimensions,
      pendingResize: undefined,
      theme: message.theme,
      lifecycle: "active",
      targetFrameMs: 1000 / targetFps,
      animationHandle: undefined,
      timerHandle: undefined,
      lastRenderAt: -Infinity,
      lastTickAt: undefined,
      firstFrameSent: false,
      disposed: false,
    };
    while (state && queued.length > 0) handle(queued.shift());
    if (state && !state.disposed) {
      post({ type: "ready" });
      schedule(state);
    }
  } catch (e) {
    const reason = describe(e).reason.toLowerCase();
    const stage = reason.includes("webgpu") ? "capabilities" : reason.includes("adapter") ? "adapter" : reason.includes("device") ? "device" : reason.includes("context") ? "context" : "renderer";
    if (stage === "capabilities") post({ type: "unsupported", ...describe(e) });
    else post({ type: "error", stage, ...describe(e) });
    if (state) dispose("dispose");
    else device?.destroy();
  } finally {
    queued.length = 0;
  }
}

function handle(message) {
  if (message.type !== "init" && !state) return void queued.push(message);
  const s = state;
  switch (message.type) {
    case "init":
      return init(message);
    case "resize":
      if (s && !s.disposed) s.pendingResize = dimensionsOf(message.dimensions);
      return;
    case "theme":
      if (s && !s.disposed) s.theme = message.theme;
      return;
    case "lifecycle":
      if (!s || s.disposed) return;
      {
        const was = s.lifecycle;
        s.lifecycle = message.lifecycle;
        if (message.lifecycle === "active" && was !== "active") {
          s.lastTickAt = undefined; // no jump in time after a pause
          schedule(s);
        } else if (message.lifecycle !== "active") unschedule(s);
        if (message.lifecycle === "torn-down") dispose("dispose");
      }
      return;
    case "dispose":
      return dispose("dispose");
  }
}

self.onmessage = (e) => {
  Promise.resolve(handle(e.data)).catch((err) => post({ type: "error", stage: "render", ...describe(err) }));
};
self.addEventListener("error", (e) => post({ type: "error", stage: "render", ...describe(e.error ?? e.message ?? "Unhandled worker error.") }));
self.onunhandledrejection = (e) => post({ type: "error", stage: "render", ...describe(e.reason ?? "Unhandled worker rejection.") });
