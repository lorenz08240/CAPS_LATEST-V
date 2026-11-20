// WebGL2 renderer of vercel.com's hero (its WGSL renderer's WebGL port, worker chunk 01yx7m50w8_tu.js):
// same targets, uniform-buffer layouts, pass order and blend state. One frame:
//   1. light sources (simulation size, RGBA16F): the SDF of the LED segments and the black triangle in
//      alpha, baked once; then each LED's colour x brightness drawn into RGB by the emitter mesh
//   2. direct raycast (half size, RGBA16F): rays from every probe gather the LED light
//   3. floor (canvas size, RGBA8): the light (or dark) floor shader turns it into the picture
//   4. present: blit to the canvas

import * as GLSL from "./shaders.js";
import { LEDS_PER_SIDE, LED_ROWS, LED_EMITTER_EXPAND, LED_CLIP_EXPAND, LED_CLIP_INSET_RANGE, TUNABLES, DESIGN_HEIGHT, cascadeFit, raycastSize, ledRadius, ledShape, triangle, insetTriangle, clampProbeDensity, clampCascadeCount, cascadeCountFor, getPointerCutoff, nonNegative } from "./config.js";
import { createLeds, updateLeds, ledVertices } from "./leds.js";
import { createFrameResolver } from "./frame.js";

export class UnsupportedError extends Error { name = "WebglUnsupportedError"; }

function compile(gl, type, src, label) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`Failed to compile shader ${label}: ${log ?? "unknown"}`);
  }
  return s;
}
function program(gl, vert, frag, label) {
  const v = compile(gl, gl.VERTEX_SHADER, vert, `${label}.vert`);
  const f = compile(gl, gl.FRAGMENT_SHADER, GLSL.FRAGMENT_PREFIX + GLSL.COMMON + frag, `${label}.frag`);
  const p = gl.createProgram();
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  gl.detachShader(p, v); gl.detachShader(p, f); gl.deleteShader(v); gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error(`Failed to link program ${label}: ${log ?? "unknown"}`);
  }
  return p;
}
function target(gl, width, height, format, label) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texStorage2D(gl.TEXTURE_2D, 1, format, width, height);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    gl.deleteFramebuffer(framebuffer); gl.deleteTexture(texture);
    throw new UnsupportedError(`Float framebuffer ${label} is incomplete (status 0x${status.toString(16)}); float render targets are required.`);
  }
  return { framebuffer, texture, width, height };
}
const dropTarget = (gl, t) => { if (t) { gl.deleteFramebuffer(t.framebuffer); gl.deleteTexture(t.texture); } };
function ubo(gl, bytes) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
  gl.bufferData(gl.UNIFORM_BUFFER, bytes, gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.UNIFORM_BUFFER, null);
  return { buffer, byteLength: bytes };
}
const writeUbo = (gl, u, data) => { gl.bindBuffer(gl.UNIFORM_BUFFER, u.buffer); gl.bufferSubData(gl.UNIFORM_BUFFER, 0, data); gl.bindBuffer(gl.UNIFORM_BUFFER, null); };
const bindBlock = (gl, p, name, index) => { const i = gl.getUniformBlockIndex(p, name); if (i !== gl.INVALID_INDEX) gl.uniformBlockBinding(p, i, index); };
const sampler = (gl, p, name, unit) => { const l = gl.getUniformLocation(p, name); if (l) gl.uniform1i(l, unit); };
const size = (w, h) => ({ width: Math.max(1, Math.floor(w)), height: Math.max(1, Math.floor(h)) });
const same = (a, b) => a.width === b.width && a.height === b.height;
const ratio = (v) => Math.max(1e-3, typeof v === "number" && Number.isFinite(v) ? v : 1);
const cascades = (count, sim) => clampCascadeCount(count) ?? cascadeCountFor(sim);
/** OKLab-ish cube roots of the edge colours, as the floor shader expects them. */
const lms = (c) => ({
  r: Math.cbrt(0.412165612 * c.r + 0.536275208 * c.g + 0.0514575653 * c.b),
  g: Math.cbrt(0.21185911 * c.r + 0.6807189584 * c.g + 0.107406579 * c.b),
  b: Math.cbrt(0.0883097947 * c.r + 0.2818474174 * c.g + 0.6302613616 * c.b),
});

export function createRenderer(gl) {
  let programs;
  let res; // size-dependent resources
  let destroyed = false;
  let firstEncode = true; // the particle target is cleared on the first frame
  const frames = createFrameResolver();

  function ensurePrograms() {
    if (programs) return programs;
    const lightSources = program(gl, GLSL.FULLSCREEN_VERT, GLSL.LIGHT_SOURCES_FRAG, "triangle-led-4-gl-light-sources");
    const ledEmitters = program(gl, GLSL.LED_EMITTERS_VERT, GLSL.LED_EMITTERS_FRAG, "triangle-led-4-gl-led-emitters");
    const directRaycast = program(gl, GLSL.FULLSCREEN_VERT, GLSL.DIRECT_RAYCAST_FRAG, "triangle-led-4-gl-direct-raycast");
    const darkFloor = program(gl, GLSL.FULLSCREEN_VERT, GLSL.DARK_FLOOR_FRAG, "triangle-led-4-gl-dark-floor");
    const lightFloor = program(gl, GLSL.FULLSCREEN_VERT, GLSL.LIGHT_FLOOR_FRAG, "triangle-led-4-gl-light-floor");
    const floorNoise = program(gl, GLSL.FULLSCREEN_VERT, GLSL.FLOOR_NOISE_FRAG, "triangle-led-4-gl-floor-noise");
    const present = program(gl, GLSL.PRESENT_VERT, GLSL.PRESENT_FRAG, "triangle-led-4-gl-present");
    gl.useProgram(lightSources); sampler(gl, lightSources, "u_leds", 0);
    gl.useProgram(ledEmitters); sampler(gl, ledEmitters, "u_leds", 0);
    gl.useProgram(directRaycast); sampler(gl, directRaycast, "light_sources_tex", 0);
    gl.useProgram(darkFloor);
    sampler(gl, darkFloor, "radiance_tex", 1); sampler(gl, darkFloor, "light_sources_tex", 2); sampler(gl, darkFloor, "floor_noise_tex", 3); sampler(gl, darkFloor, "particle_tex", 4);
    gl.useProgram(lightFloor);
    sampler(gl, lightFloor, "radiance_tex", 1); sampler(gl, lightFloor, "light_sources_tex", 2); sampler(gl, lightFloor, "particle_tex", 4);
    gl.useProgram(present); sampler(gl, present, "u_present", 0);
    gl.useProgram(null);
    for (const p of [lightSources, ledEmitters, directRaycast, darkFloor, lightFloor]) bindBlock(gl, p, "Config", 0);
    bindBlock(gl, lightFloor, "LightGlow", 1);
    const fullscreenVao = gl.createVertexArray();
    // the dark floor's grain, baked once into a 500x500 texture
    const noise = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, noise);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 500, 500);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, noise, 0);
    gl.viewport(0, 0, 500, 500);
    gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST); gl.colorMask(true, true, true, true);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(floorNoise); gl.bindVertexArray(fullscreenVao); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null); gl.useProgram(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(fb); gl.bindTexture(gl.TEXTURE_2D, null);
    gl.deleteProgram(floorNoise);
    const presentSampler = gl.createSampler();
    gl.samplerParameteri(presentSampler, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.samplerParameteri(presentSampler, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.samplerParameteri(presentSampler, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.samplerParameteri(presentSampler, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    programs = { lightSources, ledEmitters, directRaycast, darkFloor, lightFloor, present, fullscreenVao, floorNoise: noise, presentSampler };
    return programs;
  }

  function simResources(sim, density, count, prevLeds) {
    const fit = cascadeFit(sim, density);
    const cascade = raycastSize(sim);
    const leds = createLeds(sim, prevLeds);
    const ledTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, ledTexture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, 2, LED_ROWS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    const led = { texture: ledTexture, rows: LED_ROWS };
    uploadLeds(led, leds.data);
    const lightSources = target(gl, sim.width, sim.height, gl.RGBA16F, "triangle-led-4-gl-light-sources");
    const directRaycast = target(gl, cascade.width, cascade.height, gl.RGBA16F, "triangle-led-4-gl-direct-raycast");
    const verts = ledVertices(sim, LED_EMITTER_EXPAND);
    const ledVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ledVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const ledVao = gl.createVertexArray();
    gl.bindVertexArray(ledVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, ledVertexBuffer);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 24, 8);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 24, 16);
    gl.bindVertexArray(null); gl.bindBuffer(gl.ARRAY_BUFFER, null);
    const configUbo = ubo(gl, 112);
    const directRaycastUbo = ubo(gl, 256);
    // raycast constants, written once: the inset triangle, target sizes, ray length, step and hit settings
    const tri = insetTriangle(sim);
    const d = new Float32Array(64);
    d.set([tri.top.x, tri.top.y, tri.left.x, tri.left.y], 0);
    d.set([tri.right.x, tri.right.y, cascade.width, cascade.height], 4);
    const scale = Math.min(sim.height, DESIGN_HEIGHT) / DESIGN_HEIGHT;
    d.set([sim.width, sim.height, 1.5 * scale, 0.75 * scale], 8);
    d.set([2 / sim.height, 1, 50, 1e-3], 12);
    d.set([0.5, DESIGN_HEIGHT / Math.max(sim.height, 1), 0, 0], 16);
    writeUbo(gl, directRaycastUbo, d);
    return {
      simulationSize: sim, probeDensity: density, cascadeFit: fit, cascade, count, leds, ledTexture: led, lightSources, directRaycast, ledVao, ledVertexBuffer,
      ledVertexCount: verts.length / 6, ledRadius: ledRadius(sim), ledShape: ledShape(sim, LEDS_PER_SIDE), triangle: triangle(sim), configUbo, directRaycastUbo,
    };
  }
  function uploadLeds(led, data) {
    gl.bindTexture(gl.TEXTURE_2D, led.texture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 2, led.rows, gl.RGBA, gl.FLOAT, data);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  function release(r, next) {
    if (next === undefined || next.leds !== r.leds) {
      dropTarget(gl, r.lightSources); dropTarget(gl, r.directRaycast);
      gl.deleteTexture(r.ledTexture.texture); gl.deleteVertexArray(r.ledVao); gl.deleteBuffer(r.ledVertexBuffer);
      gl.deleteBuffer(r.configUbo.buffer); gl.deleteBuffer(r.directRaycastUbo.buffer);
    }
    dropTarget(gl, r.present); dropTarget(gl, r.particles);
    gl.deleteBuffer(r.floorUbo.buffer); gl.deleteBuffer(r.lightGlowUbo.buffer);
  }
  function resources(sim, pres, pixelRatio, density, count) {
    ensurePrograms();
    if (res && same(res.simulationSize, sim) && same(res.presentationSize, pres) && res.pixelRatio === pixelRatio && res.probeDensity === density && res.count === count) return res;
    const keep = res && same(res.simulationSize, sim) && res.probeDensity === density && res.count === count;
    const base = keep
      ? { simulationSize: res.simulationSize, probeDensity: res.probeDensity, cascadeFit: res.cascadeFit, cascade: res.cascade, count: res.count, leds: res.leds, ledTexture: res.ledTexture, lightSources: res.lightSources, directRaycast: res.directRaycast, ledVao: res.ledVao, ledVertexBuffer: res.ledVertexBuffer, ledVertexCount: res.ledVertexCount, ledRadius: res.ledRadius, ledShape: res.ledShape, triangle: res.triangle, configUbo: res.configUbo, directRaycastUbo: res.directRaycastUbo }
      : simResources(sim, density, count, res?.leds);
    const next = {
      ...base,
      presentationSize: pres, pixelRatio,
      present: target(gl, pres.width, pres.height, gl.RGBA8, "triangle-led-4-gl-present"),
      particles: target(gl, pres.width, pres.height, gl.R8, "triangle-led-4-gl-particles"),
      floorUbo: ubo(gl, 256), lightGlowUbo: ubo(gl, 256),
    };
    if (res) release(res, next);
    res = next;
    return next;
  }

  function draw(p, r, f, theme, time, opts) {
    const brush = f.brush, tun = f.tunables;
    const occluder = opts?.renderBlackOccluder ?? true;
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.SCISSOR_TEST);
    gl.bindVertexArray(p.fullscreenVao);
    // 1. light sources
    gl.bindFramebuffer(gl.FRAMEBUFFER, r.lightSources.framebuffer);
    gl.viewport(0, 0, r.lightSources.width, r.lightSources.height);
    const clip = Number.isFinite(tun.ledRaycastClipInsetPx) ? Math.min(LED_CLIP_INSET_RANGE.max, Math.max(LED_CLIP_INSET_RANGE.min, tun.ledRaycastClipInsetPx)) : TUNABLES.ledRaycastClipInsetPx;
    const c = new Float32Array(28);
    c.set([r.simulationSize.width, r.simulationSize.height, time, tun.darkFloorAlbedo], 0);
    c.set([brush.x, brush.y, +!!brush.active, brush.radius], 4);
    c.set([brush.colour.r, brush.colour.g, brush.colour.b, 0], 8);
    c.set([tun.ledIntensity, tun.brightnessMin, tun.brightnessMax, r.ledRadius], 12);
    c.set([r.triangle.center.x, r.triangle.center.y, r.triangle.circumradius, 0.5 * r.triangle.sideLength], 16);
    c.set([+!!occluder, tun.ledHitThreshold, r.ledShape.tangentHalfLength, r.ledShape.normalHalfThickness], 20);
    c.set([LED_CLIP_EXPAND, clip, 0, 0], 24);
    writeUbo(gl, r.configUbo, c);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, r.configUbo.buffer);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.ledTexture.texture);
    const key = `${+!!occluder}:${c[25]}`;
    if (r.lightSourcesBakeKey !== key) {
      r.lightSourcesBakeKey = key;
      gl.disable(gl.BLEND); gl.colorMask(true, true, true, true);
      gl.clearColor(0, 0, 0, 1e3); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(p.lightSources); gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    gl.useProgram(p.ledEmitters);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ONE);
    gl.blendEquationSeparate(gl.FUNC_ADD, gl.MIN);
    gl.colorMask(true, true, true, false);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.ledTexture.texture);
    gl.bindVertexArray(r.ledVao);
    gl.drawArrays(gl.TRIANGLES, 0, r.ledVertexCount);
    gl.bindVertexArray(p.fullscreenVao);
    gl.disable(gl.BLEND); gl.colorMask(true, true, true, true);
    // 2. direct raycast
    gl.bindFramebuffer(gl.FRAMEBUFFER, r.directRaycast.framebuffer);
    gl.viewport(0, 0, r.directRaycast.width, r.directRaycast.height);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(p.directRaycast);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, r.directRaycastUbo.buffer);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.lightSources.texture);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // particles (drop staging) are not part of this copy: their target is cleared once and stays empty
    if (firstEncode) {
      firstEncode = false;
      gl.bindFramebuffer(gl.FRAMEBUFFER, r.particles.framebuffer);
      gl.viewport(0, 0, r.particles.width, r.particles.height);
      gl.disable(gl.BLEND); gl.colorMask(true, true, true, true);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    }
    // 3. floor
    const light = theme === "light";
    gl.bindFramebuffer(gl.FRAMEBUFFER, r.present.framebuffer);
    gl.viewport(0, 0, r.present.width, r.present.height);
    gl.clearColor(0, 0, 0, +!light); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(light ? p.lightFloor : p.darkFloor);
    const floor = floorUniforms(r, f, theme, opts);
    if (!r.floorUboCache || !equal(r.floorUboCache, floor)) { writeUbo(gl, r.floorUbo, floor); r.floorUboCache = floor; }
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, r.floorUbo.buffer);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, r.directRaycast.texture);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, r.lightSources.texture);
    if (light) {
      writeUbo(gl, r.lightGlowUbo, glowUniforms(f.lightGlow, f.colorMix));
      gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, r.lightGlowUbo.buffer);
    } else {
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, p.floorNoise);
    }
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, r.particles.texture);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // 4. present
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, r.presentationSize.width, r.presentationSize.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(p.present);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, r.present.texture);
    gl.bindSampler(0, p.presentSampler);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindSampler(0, null);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  return {
    get stats() { return { cascadeCount: res ? res.count : 0 }; },
    /** Draws one frame at `time` seconds into the context's canvas. */
    render(width, height, brushPatch, time, tunables, sim, options, probeDiscard) {
      if (destroyed) return false;
      const pres = size(width, height);
      const simSize = size(sim?.simulationWidth ?? width, sim?.simulationHeight ?? height);
      const pixelRatio = ratio(sim?.pixelRatio);
      const density = clampProbeDensity(sim?.probeDensity);
      const r = resources(simSize, pres, pixelRatio, density, cascades(sim?.cascadeCount, simSize));
      const p = ensurePrograms();
      const theme = options?.theme ?? "dark";
      const f = frames.resolveFrame({
        patch: brushPatch, tunables, options, probeDiscard, theme, time,
        updateLedsFor: (x) => {
          const out = updateLeds(r.leds, x.time, x.tunables, x.settings, x.hoverDeploy, x.brush, x.theme, x.dropActive);
          uploadLeds(r.ledTexture, r.leds.data);
          return out;
        },
      });
      draw(p, r, f, theme, time, options);
      return true;
    },
    destroy() {
      destroyed = true;
      if (res) release(res);
      res = undefined;
      if (programs) {
        for (const k of ["lightSources", "ledEmitters", "directRaycast", "darkFloor", "lightFloor", "present"]) gl.deleteProgram(programs[k]);
        gl.deleteVertexArray(programs.fullscreenVao); gl.deleteTexture(programs.floorNoise); gl.deleteSampler(programs.presentSampler);
      }
      programs = undefined;
    },
  };
}

function equal(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Floor pass "Config" block (64 floats). */
function floorUniforms(r, f, theme, opts) {
  const pres = r.presentationSize, sim = r.simulationSize, light = theme === "light";
  const tun = f.tunables, ao = f.lightAo, dbg = f.radianceDebug, dark = f.darkFloor, post = f.darkPostprocess, fit = r.cascadeFit;
  const k = new Float32Array(64);
  const scale = Math.max(1e-3, pres.height / Math.max(1, sim.height));
  const ox = (pres.width - sim.width * scale) * 0.5, oy = (pres.height - sim.height * scale) * 0.5;
  const tri = triangle(sim);
  const pad = f.probeDiscard.lightAabbPadding;
  k.set([pres.width, pres.height, +light, r.pixelRatio], 0);
  k.set([sim.width, sim.height, 0, light ? ao.contactOpacity : 0], 4);
  k.set([tun.ledIntensity, light ? tun.lightFloorAlbedo : tun.darkFloorAlbedo, ao.radiance, light ? ao.contactSize : 0], 8);
  k.set([ox + tri.center.x * scale, oy + tri.center.y * scale, tri.circumradius * scale, 0.5 * tri.sideLength * scale], 12);
  k.set([pad * scale, pad * scale, +!!(opts?.showForegroundTriangle ?? true), nonNegative(tun.particleExposureBoostMax)], 16);
  k.set([ox + fit.originSceneX * scale, oy + fit.originSceneY * scale, fit.widthScene * scale, fit.heightScene * scale], 20);
  k.set([ao.contactFalloffPower, ao.highlightPower, ao.highlightStrength, 0], 24);
  k.set([+!!dbg.enabled, dbg.redMultiplier, dbg.greenMultiplier, dbg.blueMultiplier], 28);
  k.set([ox, oy, scale, getPointerCutoff()], 32);
  k.set([dark.sdfFadeDistanceScale, dark.sdfFadeEdgePx, dark.nearFalloffPower, dark.tailPower], 36);
  k.set([dark.tailIntensity, dark.vibrancy, dark.tailMapMin, dark.tailMapMax], 40);
  k.set([dark.nearFalloffDistanceScale, dark.nearFalloffIntensity, dark.nearFalloffMapMin, dark.nearFalloffMapMax], 44);
  const design = DESIGN_HEIGHT * Math.max(r.pixelRatio, 1e-4);
  k.set([dark.middleFalloffPower, dark.middleFalloffIntensity, dark.radianceJitterPx, Math.min(pres.height, design) / design], 48);
  k.set([+!!dark.nearFalloffEnabled, +!!dark.middleFalloffEnabled, +!!dark.farFalloffEnabled, post.contrast], 52);
  k.set([getPointerCutoff(), post.exposure, 0, 0], 56);
  k.set([+!!dark.noiseEnabled, 0, 0, 0], 60);
  return k;
}

/** Light floor "LightGlow" block (64 floats). */
function glowUniforms(g, colorMix) {
  const t = new Float32Array(64);
  t.set([g.nearDistanceScale, g.nearIntensity, g.nearMapMin, g.nearMapMax], 0);
  t.set([g.middlePower, g.middleIntensity, g.highlightNoise, 0], 4);
  t.set([g.farIntensity, colorMix, g.farMapMin, g.farMapMax], 8);
  t.set([g.nearPower, g.middleOuterScale, g.farPower, g.fadeInner], 12);
  t.set([+!!g.nearEnabled, +!!g.middleEnabled, +!!g.farEnabled, g.contrast], 16);
  t.set([g.aoStrength, g.aoRadiusScale, g.aoPower, +!!g.aoEnabled], 20);
  t.set([g.ao2Strength, g.ao2RadiusScale, g.ao2Power, +!!g.ao2Enabled], 24);
  t.set([g.ao3Strength, g.ao3RadiusScale, g.ao3Power, +!!g.ao3Enabled], 28);
  const red = lms(g.edgeRedRgb), green = lms(g.edgeGreenRgb), blue = lms(g.edgeBlueRgb);
  t.set([red.r, red.g, red.b, 1 / Math.max(g.edgeOverlap, 0.01)], 32);
  t.set([green.r, green.g, green.b, 0], 36);
  t.set([blue.r, blue.g, blue.b, 0], 40);
  t.set([g.nearDistanceScaleColor, g.nearIntensityColor, g.nearMapMinColor, g.nearMapMaxColor], 44);
  t.set([g.middlePowerColor, g.middleIntensityColor, 0, 0], 48);
  t.set([g.farIntensityColor, +!!g.highlightDebug, g.farMapMinColor, g.farMapMaxColor], 52);
  t.set([g.nearPowerColor, g.middleOuterScaleColor, g.farPowerColor, g.fadeInnerColor], 56);
  t.set([+!!g.nearEnabledColor, +!!g.middleEnabledColor, +!!g.farEnabledColor, g.contrastColor], 60);
  return t;
}
