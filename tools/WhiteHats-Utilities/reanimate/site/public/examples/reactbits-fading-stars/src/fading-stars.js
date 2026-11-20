// pro.reactbits.dev "Fading Stars": stars rise from an origin below the frame along a fan of rays, each
// drawing a trail that fades behind it. They speed up as they go (warp acceleration), fade in near the
// bottom and out before the top, and come back in at the edge. At mount every star fades in over 0.9 s.
// Moving the pointer over them speeds up the flow (a spring eases it back over about a second); a click
// launches a shell of 64 stars that rises as an arc. Off screen it pauses.
//
// The simulation is the original's, step for step, with its own random generator (mulberry32, seed
// 24301, restarted on every mount), so it draws the same stars on every load. The original renders with
// three.js r181; here the same passes go through WebGL2 directly, with three's state for each draw:
// additive instanced quads into a half-float target, a bloom chain, and a composite with film grain.
// See .reanimate/reactbits-fading-stars.

import * as GLSL from "./shaders.js";

// The preview's props on pro.reactbits.dev (preset "Violet", dark theme): the component's defaults.
export const DEFAULTS = {
  colors: ["#5227FF", "#FF9FFC"],
  backgroundColor: "#0A0A0A",
  mode: "auto",
  direction: "up",
  spread: 150,
  focus: 0.35,
  originOffset: 0.18,
  originShift: 0,
  count: 480,
  speed: 0.16,
  speedVariance: 0.6,
  acceleration: 0.9,
  trailLength: 0.45,
  trailFade: 1.6,
  lineWidth: 1,
  starSize: 2.2,
  twinkle: 0.35,
  fadeIn: 0.06,
  fadeOut: 0.3,
  depth: 0.5,
  glow: 0.45,
  intensity: 1,
  grain: 0.3,
  interactive: true,
  thrust: 1,
  burst: 64,
  paused: false,
  quality: 1,
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const finite = (v, d) => (Number.isFinite(v) ? v : d);
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

// CSS colour → sRGB 0..1, through a 2D context so any CSS colour works.
function parseColor(ctx, css, fallback) {
  if (!ctx || typeof css !== "string") return fallback;
  ctx.fillStyle = "#010203";
  ctx.fillStyle = css;
  const out = String(ctx.fillStyle);
  if (out === "#010203" && css.trim().toLowerCase() !== "#010203") return fallback;
  if (out.startsWith("#")) {
    const hex = out.slice(1);
    return [parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255];
  }
  const n = out.match(/[\d.]+/g);
  return !n || n.length < 3 ? fallback : [Number(n[0]) / 255, Number(n[1]) / 255, Number(n[2]) / 255];
}
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
function toOklab([r8, g8, b8]) {
  const r = toLinear(r8), g = toLinear(g8), b = toLinear(b8);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

// ---------------------------------------------------------------------------------------------------
// WebGL2, the way three.js r181 sets it up for this scene.

function compile(gl, vertex, fragment) {
  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, GLSL.VERTEX_PREFIX + vertex));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, GLSL.FRAGMENT_PREFIX + fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error(gl.getProgramInfoLog(program));
  const uniforms = {};
  const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) || 0;
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(program, i);
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  const attrib = (name) => gl.getAttribLocation(program, name);
  return { program, uniforms, attrib };
}

function createRenderer(canvas) {
  // three r181 always asks for an alpha channel and leaves the rest at these values
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    depth: true,
    stencil: false,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: false,
  });
  if (!gl) return null;
  // half-float targets when the GPU can render to them (three: HalfFloatType), else 8 bit
  const half = !!(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"));
  gl.getExtension("OES_texture_float_linear");

  const programs = {
    trails: compile(gl, GLSL.trailVertex, GLSL.trailFragment),
    heads: compile(gl, GLSL.headVertex, GLSL.headFragment),
    down: compile(gl, GLSL.screenVertex, GLSL.downFragment),
    up: compile(gl, GLSL.screenVertex, GLSL.upFragment),
    composite: compile(gl, GLSL.screenVertex, GLSL.compositeFragment),
  };

  const staticBuffer = (target, data) => {
    const b = gl.createBuffer();
    gl.bindBuffer(target, b);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return b;
  };

  // full-screen quad: three's PlaneGeometry(2, 2)
  const quad = gl.createVertexArray();
  gl.bindVertexArray(quad);
  const quadPos = staticBuffer(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0]));
  const quadUv = staticBuffer(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]));
  staticBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 2, 1, 2, 3, 1])); // stays bound to the vertex array
  for (const p of [programs.down, programs.up, programs.composite]) {
    const pos = p.attrib("position");
    const uv = p.attrib("uv");
    gl.bindBuffer(gl.ARRAY_BUFFER, quadPos);
    if (pos >= 0) { gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0); }
    gl.bindBuffer(gl.ARRAY_BUFFER, quadUv);
    if (uv >= 0) { gl.enableVertexAttribArray(uv); gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0); }
  }
  gl.bindVertexArray(null);

  // star quads: one corner per vertex, the star itself from the instance buffer (12 floats a star)
  const corners = {
    trails: new Float32Array([0, -1, 0, 1, -1, 0, 0, 1, 0, 1, 1, 0]),
    heads: new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]),
  };
  const starIndex = new Uint16Array([0, 1, 2, 2, 1, 3]);
  const starVaos = {};
  let instanceBuffer = null;
  let instanceCapacity = 0;
  const buildStarVaos = () => {
    for (const name of ["trails", "heads"]) {
      if (starVaos[name]) gl.deleteVertexArray(starVaos[name].vao);
      const p = programs[name];
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const corner = staticBuffer(gl.ARRAY_BUFFER, corners[name]);
      const index = staticBuffer(gl.ELEMENT_ARRAY_BUFFER, starIndex);
      const pos = p.attrib("position");
      if (pos >= 0) { gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0); }
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      ["aHead", "aShape", "aLook"].forEach((attr, k) => {
        const loc = p.attrib(attr);
        if (loc < 0) return;
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 48, 16 * k);
        gl.vertexAttribDivisor(loc, 1);
      });
      gl.bindVertexArray(null);
      starVaos[name] = { vao, corner, index };
    }
  };

  const renderer = {
    gl,
    // (re)allocates the instance buffer for `data` (a new, larger Float32Array)
    setInstanceData(data) {
      if (instanceBuffer) gl.deleteBuffer(instanceBuffer);
      instanceBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      instanceCapacity = data.length;
      buildStarVaos();
    },
    updateInstances(data, floats) {
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, Math.min(floats, instanceCapacity));
    },
    target(width, height) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texStorage2D(gl.TEXTURE_2D, 1, half ? gl.RGBA16F : gl.RGBA8, width, height);
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return {
        texture, framebuffer, width, height,
        dispose() { gl.deleteFramebuffer(framebuffer); gl.deleteTexture(texture); },
      };
    },
    bind(target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
      gl.viewport(0, 0, target ? target.width : gl.drawingBufferWidth, target ? target.height : gl.drawingBufferHeight);
    },
    // the stars, added up: CustomBlending, AddEquation, ONE / ONE for colour and alpha
    drawStars(name, count, set) {
      if (!count) return;
      const p = programs[name];
      gl.useProgram(p.program);
      set(p.uniforms);
      gl.enable(gl.BLEND);
      gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
      gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
      gl.bindVertexArray(starVaos[name].vao);
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, count);
      gl.bindVertexArray(null);
    },
    // a full-screen pass, NoBlending; textures as [uniform, target] pairs
    drawPass(name, set, textures) {
      const p = programs[name];
      gl.useProgram(p.program);
      textures.forEach(([uniform, target], unit) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, target.texture);
        gl.uniform1i(p.uniforms[uniform], unit);
      });
      set(p.uniforms);
      gl.disable(gl.BLEND);
      gl.bindVertexArray(quad);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(null);
    },
    clear() {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
    dispose() {
      for (const p of Object.values(programs)) gl.deleteProgram(p.program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
  // three's defaults for a material with side FrontSide, no depth test
  gl.disable(gl.DEPTH_TEST);
  gl.depthMask(false);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.frontFace(gl.CCW);
  return renderer;
}

// ---------------------------------------------------------------------------------------------------

/**
 * Mounts the stars into `root` (they fill it). Returns { sync(props), burst(), destroy() }, or null without
 * WebGL2.
 */
export function createFadingStars(root, initialProps = {}) {
  let props = { ...DEFAULTS, ...initialProps, reduced: !!initialProps.reduced };
  const doc = root.ownerDocument;
  const win = doc.defaultView ?? window;

  const canvas = doc.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block", pointerEvents: "none" });
  root.prepend(canvas);

  let renderer;
  try {
    renderer = createRenderer(canvas);
  } catch {
    renderer = null;
  }
  if (!renderer) {
    canvas.remove();
    return null;
  }
  let gl = renderer.gl;
  const ctx2d = doc.createElement("canvas").getContext("2d");

  // mulberry32, seeded the same on every mount
  let seed = 24301;
  const random = () => {
    let t = (seed = (seed + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    return (((t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ (t >>> 14)) >>> 0) / 0x100000000;
  };

  const shared = { trailLab: [0, 0, 0], headLab: [0, 0, 0], background: [0, 0, 0] };

  let lines = null; // the stars, full size
  let downs = []; // bloom levels, each half the one before
  let ups = [];
  let capacity = 0;
  let instances = new Float32Array(0);
  let instanceCount = 0;
  let hasBuffer = false;
  const stars = [];
  const ray = { dx: 0, dy: 1, enter: 0, exit: 0 };

  let destroyed = false;
  let lost = false;
  let rafId = 0;
  let lastTs = 0;
  let inView = true;
  let width = 1; // CSS px
  let height = 1;
  let pixelRatio = 1;
  let time = 0;
  let grainSeed = 0;
  let pointerTravel = 0; // px the pointer moved since the last frame
  let thrustTarget = 0;
  let boostVelocity = 0;
  let boost = 0;
  let ink = false;
  let colorKey = "";
  let lastPointer = null;
  let tap = null;

  const ensureCapacity = (n) => {
    if (n <= capacity && hasBuffer) return;
    capacity = Math.max(64, 2 ** Math.ceil(Math.log2(Math.max(n, 1))));
    instances = new Float32Array(12 * capacity);
    renderer.setInstanceData(instances);
    hasBuffer = true;
  };
  const disposeTargets = () => {
    lines?.dispose();
    downs.forEach((t) => t.dispose());
    ups.forEach((t) => t.dispose());
    lines = null;
    downs = [];
    ups = [];
  };
  const running = () => !props.paused && !props.reduced;

  // The fan: origin beyond the edge the stars come from, the axis they travel along, and the angles
  // of the rays that cross the frame, bent toward the centre line by `focus`.
  const fan = () => {
    const p = props;
    const offset = clamp(finite(p.originOffset, 0.18), 0, 2) * Math.min(width, height);
    const shift = clamp(finite(p.originShift, 0), -1, 1);
    const dir = p.direction;
    let ox = 0.5 * width * (1 + shift);
    let oy = -offset;
    let ax = 0;
    let ay = 1;
    let unit = height;
    if (dir === "down") {
      oy = height + offset;
      ay = -1;
    } else if (dir === "left" || dir === "right") {
      ox = dir === "left" ? width + offset : -offset;
      oy = 0.5 * height * (1 - shift);
      ax = dir === "left" ? -1 : 1;
      ay = 0;
      unit = width;
    } else if (dir === "out") {
      oy = 0.5 * height;
      unit = 0.5 * Math.hypot(width, height);
    }
    const full = dir === "out";
    const half = full ? Math.PI : (clamp(finite(p.spread, 150), 1, 180) * Math.PI) / 360;
    let lo = -half;
    let hi = half;
    if (!full) {
      let min = Infinity;
      let max = -Infinity;
      for (let k = 0; k < 4; k++) {
        const cx = (k & 1 ? width : 0) - ox;
        const cy = (k & 2 ? height : 0) - oy;
        const angle = Math.atan2(ax * cy - ay * cx, ax * cx + ay * cy);
        min = Math.min(min, angle);
        max = Math.max(max, angle);
      }
      lo = Math.max(lo, min);
      if ((hi = Math.min(hi, max)) < lo) {
        lo = 0;
        hi = 0;
      }
    }
    const bend = full ? 0 : 4.5 * clamp(finite(p.focus, 0.35), 0, 1);
    const unbend = (x) => (bend < 0.001 ? x : Math.asinh(x * Math.sinh(bend)) / bend);
    return { ox, oy, ax, ay, unit: Math.max(unit, 1), half, lo, hi, full, bend, from: unbend(lo / half), to: unbend(hi / half) };
  };
  const angleOf = (f, q) => {
    if (f.full) return (2 * q - 1) * Math.PI;
    const x = f.from + (f.to - f.from) * q;
    return f.half * (f.bend < 0.001 ? x : Math.sinh(f.bend * x) / Math.sinh(f.bend));
  };
  // Where the ray at `angle` enters and leaves the frame, in fan units; false if it misses.
  const cast = (f, angle) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const dx = f.ax * c - f.ay * s;
    const dy = f.ax * s + f.ay * c;
    let enter = 0;
    let exit = Infinity;
    if (Math.abs(dx) > 1e-9) {
      const a = -f.ox / dx;
      const b = (width - f.ox) / dx;
      enter = Math.max(enter, Math.min(a, b));
      exit = Math.min(exit, Math.max(a, b));
    } else if (f.ox < 0 || f.ox > width) exit = -1;
    if (Math.abs(dy) > 1e-9) {
      const a = -f.oy / dy;
      const b = (height - f.oy) / dy;
      enter = Math.max(enter, Math.min(a, b));
      exit = Math.min(exit, Math.max(a, b));
    } else if (f.oy < 0 || f.oy > height) exit = -1;
    ray.dx = dx;
    ray.dy = dy;
    ray.enter = enter / f.unit;
    ray.exit = exit / f.unit;
    return ray.exit - ray.enter > 1e-4;
  };
  // distance after travelling `t` under warp acceleration `a` (speed grows with distance)
  const travel = (r, t, a) => (a < 1e-4 ? r + t : (r + 1 / a) * Math.exp(a * t) - 1 / a);
  // a point `u` of the way along the ray, spaced so stars are evenly spread in time
  const along = (enter, exit, a, u) => {
    if (exit <= enter) return enter;
    if (a < 1e-4) return enter + (exit - enter) * u;
    const k = 1 / a;
    return (enter + k) * Math.pow((exit + k) / (enter + k), u) - k;
  };
  const newStar = (shell) => ({ q: 0, angle: 0, r: 0, pace: 0.5, layer: 1, gain: 1, seed: 0, glint: 0, age: 0, fade: 0, retire: 1, shell });
  const respawn = (star, f, atEdge, accel, margin) => {
    for (let i = 0; i < 4; i++) {
      star.q = random();
      star.pace = random();
      star.layer = random();
      star.gain = 0.55 + 0.45 * random();
      star.seed = random();
      star.glint = +(0.07 > random());
      if (cast(f, angleOf(f, star.q))) {
        star.r = atEdge ? Math.max(ray.enter - margin, 0) : along(ray.enter, ray.exit, accel, random());
        return;
      }
    }
    star.r = 0;
  };

  // One simulation step of `dt` seconds (0: just rebuild the instance data).
  const step = (dt) => {
    const p = props;
    const live = running();
    const f = fan();
    const speed = clamp(finite(p.speed, 0.16), 0, 2);
    const variance = clamp(finite(p.speedVariance, 0.6), 0, 1);
    const accel = clamp(finite(p.acceleration, 0.9), 0, 4);
    const trail = clamp(finite(p.trailLength, 0.45), 0, 2);
    const fadeIn = Math.max(clamp(finite(p.fadeIn, 0.06), 0, 1), 0.01);
    const fadeOut = clamp(finite(p.fadeOut, 0.3), 0, 1);
    const depth = clamp(finite(p.depth, 0.5), 0, 1);
    const margin = (2 * clamp(finite(p.starSize, 2.2), 0, 8) + 3) / f.unit;
    const flow = 1 + Math.max(boost, 0);

    // population: `count` stars in a 1280x720 frame, scaled by area
    {
      const scale = clamp(Math.sqrt((width * height) / 921600), 0.35, 1.6);
      const want = Math.round(clamp(finite(p.count, 480), 0, 3000) * clamp(finite(p.quality, 1), 0.25, 1) * scale);
      let have = 0;
      for (const s of stars) if (!s.shell && s.retire >= 1) have++;
      if (have < want) {
        for (let k = have; k < want; k++) {
          const s = newStar(false);
          respawn(s, f, false, accel, margin);
          s.fade = 0.9 * !!live;
          stars.push(s);
        }
      } else if (have > want) {
        let extra = have - want;
        for (let k = stars.length - 1; k >= 0 && extra > 0; k--) {
          const s = stars[k];
          if (!s.shell && !(s.retire < 1)) {
            s.retire = 0.999 * !!live;
            extra--;
          }
        }
      }
    }
    ensureCapacity(stars.length);

    let drawn = 0;
    let kept = 0;
    for (let k = 0; k < stars.length; k++) {
      const s = stars[k];
      if (dt > 0) {
        s.age += dt;
        if (s.retire < 1) s.retire -= dt / 0.5;
      }
      if (s.retire <= 0) continue;
      const layer = s.shell ? 1 : s.layer < depth ? 0.3 + 0.35 * (s.layer / Math.max(depth, 0.001)) : 1;
      const pace = s.shell ? 1.9 : Math.max(0.05, 1 + 0.9 * variance * (2 * s.pace - 1)) * (0.35 + 0.65 * layer);
      let inFrame = cast(f, s.shell ? s.angle : angleOf(f, s.q));
      if (inFrame && dt > 0 && speed > 0) s.r = travel(s.r, speed * pace * flow * dt, accel);
      let length = 0;
      let alpha = 0;
      if (inFrame) {
        length = Math.min((trail * pace * (1 + accel * s.r) * flow) / (1 + 0.6 * accel), Math.max(s.r - ray.enter, 0));
        const progress = (s.r - ray.enter) / (ray.exit - ray.enter);
        if (progress >= 1 && (fadeOut > 0 || s.r - length - margin >= ray.exit)) inFrame = false;
        else {
          const a = smoothstep(0, fadeIn, progress);
          const b = fadeOut > 0 ? 1 - smoothstep(1 - fadeOut, 1, progress) : 1;
          alpha = a * a * b * b;
        }
      }
      if (!inFrame) {
        if (s.shell) continue;
        respawn(s, f, live, accel, margin);
        s.fade = 0;
        stars[kept++] = s;
        continue;
      }
      stars[kept++] = s;
      if (s.fade > 0 && live) alpha *= smoothstep(0, s.fade, s.age);
      if (s.retire < 1) alpha *= smoothstep(0, 1, s.retire);
      if ((alpha *= s.gain * layer * layer) <= 1e-4) continue;
      const o = 12 * drawn;
      instances[o] = f.ox + ray.dx * s.r * f.unit;
      instances[o + 1] = f.oy + ray.dy * s.r * f.unit;
      instances[o + 2] = ray.dx;
      instances[o + 3] = ray.dy;
      instances[o + 4] = length * f.unit;
      instances[o + 5] = alpha;
      instances[o + 6] = (0.45 + 0.55 * layer) * (1 + 0.15 * s.glint) * (0.85 + 0.3 * ((7.31 * s.seed) % 1));
      instances[o + 7] = 0.55 + 0.45 * layer;
      instances[o + 8] = s.seed;
      instances[o + 9] = s.glint;
      instances[o + 10] = layer;
      instances[o + 11] = 0;
      drawn++;
    }
    stars.length = kept;
    if (hasBuffer) renderer.updateInstances(instances, 12 * Math.max(drawn, 1));
    instanceCount = drawn;
  };

  const burst = () => {
    if (destroyed || !running()) return;
    const n0 = Math.round(clamp(finite(props.burst, 64), 0, 256));
    if (!n0) return;
    let shells = 0;
    for (const s of stars) if (s.shell) shells++;
    const n = Math.min(n0, 4096 - shells);
    if (n <= 0) return;
    const f = fan();
    for (let k = 0; k < n; k++) {
      const s = newStar(true);
      s.angle = f.lo + ((f.hi - f.lo) * (k + 0.5 + (random() - 0.5) * 0.6)) / n;
      if (cast(f, s.angle)) {
        s.r = ray.enter + 0.003;
        s.seed = random();
        s.glint = 0.6;
        s.fade = 0.14;
        stars.push(s);
      }
    }
    request();
  };

  const updateColors = () => {
    const p = props;
    const [trail = "#5227FF", head = "#FF9FFC"] = p.colors ?? [];
    const key = [trail, head, p.backgroundColor, p.mode].join("|");
    if (key === colorKey) return;
    colorKey = key;
    const bg = parseColor(ctx2d, p.backgroundColor, [0.04, 0.04, 0.04]);
    const luminance = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];
    ink = p.mode === "ink" || (p.mode === "auto" && luminance > 0.5);
    let t = toOklab(parseColor(ctx2d, trail, [0.08, 0.72, 0.65]));
    let h = toOklab(parseColor(ctx2d, head, [0.8, 1, 0.96]));
    if (ink) {
      // on light backgrounds both colours are deepened into ink tones
      const mid = [t[0] + (h[0] - t[0]) * 0.35, t[1] + (h[1] - t[1]) * 0.35, t[2] + (h[2] - t[2]) * 0.35];
      t = [Math.min(t[0], 0.58), 1.08 * t[1], 1.08 * t[2]];
      h = [Math.min(mid[0], 0.4), 1.15 * mid[1], 1.15 * mid[2]];
    }
    shared.trailLab = t;
    shared.headLab = h;
    shared.background = [toLinear(bg[0]), toLinear(bg[1]), toLinear(bg[2])];
  };

  const render = () => {
    if (!lines || !downs.length || lost || destroyed) return;
    const p = props;
    updateColors();
    const common = (u) => {
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform1f(u.uPixelRatio, canvas.width / width);
      gl.uniform3f(u.uTrailLab, ...shared.trailLab);
      gl.uniform3f(u.uHeadLab, ...shared.headLab);
    };
    renderer.bind(lines);
    renderer.clear();
    renderer.drawStars("trails", instanceCount, (u) => {
      common(u);
      gl.uniform1f(u.uLineWidth, clamp(finite(p.lineWidth, 1), 0.25, 4));
      gl.uniform1f(u.uTrailGain, ink ? 1 : 0.6);
      gl.uniform1f(u.uFade, clamp(finite(p.trailFade, 1.6), 0.2, 6));
    });
    renderer.drawStars("heads", instanceCount, (u) => {
      common(u);
      gl.uniform1f(u.uStarSize, clamp(finite(p.starSize, 2.2), 0, 8));
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uTwinkle, clamp(finite(p.twinkle, 0.35), 0, 1));
      gl.uniform1f(u.uHeadGain, ink ? 1.6 : 1.7);
      gl.uniform1f(u.uHalo, 0.04 * !ink);
    });
    // bloom: down the chain (the first step keeps only the bright parts), then back up
    let source = lines;
    for (const level of downs) {
      const first = source === lines;
      renderer.bind(level);
      renderer.drawPass("down", (u) => {
        gl.uniform2f(u.uTexel, 1 / source.width, 1 / source.height);
        gl.uniform1f(u.uThreshold, first && !ink ? 0.3 : 0);
        gl.uniform1f(u.uFloor, first && !ink ? 0.22 : 1);
      }, [["uSource", source]]);
      source = level;
    }
    let bloom = downs[downs.length - 1];
    for (let k = downs.length - 2; k >= 0; k--) {
      const from = bloom;
      renderer.bind(ups[k]);
      renderer.drawPass("up", (u) => gl.uniform2f(u.uTexel, 1 / from.width, 1 / from.height), [["uSource", from], ["uBase", downs[k]]]);
      bloom = ups[k];
    }
    renderer.bind(null);
    renderer.drawPass("composite", (u) => {
      gl.uniform3f(u.uBackground, ...shared.background);
      gl.uniform1f(u.uGlow, clamp(finite(p.glow, 0.45), 0, 3));
      gl.uniform1f(u.uExposure, (ink ? 1.8 : 1) * clamp(finite(p.intensity, 1), 0, 4));
      gl.uniform1f(u.uMode, +!!ink);
      gl.uniform1f(u.uGrain, clamp(finite(p.grain, 0.3), 0, 1));
      gl.uniform1f(u.uSeed, grainSeed);
    }, [["uLines", lines], ["uBloom", bloom]]);
  };

  const frame = (ts) => {
    rafId = 0;
    if (destroyed || lost) return;
    const dt = lastTs > 0 ? clamp((ts - lastTs) / 1e3, 0, 0.05) : 1 / 60;
    lastTs = ts;
    const live = running();
    if (live) {
      time += dt;
      grainSeed = (grainSeed + 0.618034) % 1;
      const p = props;
      const diagonal = Math.max(Math.hypot(width, height), 1);
      // pointer speed in frame diagonals per second
      const pointerSpeed = p.interactive ? pointerTravel / Math.max(dt, 1 / 240) / diagonal : 0;
      pointerTravel = 0;
      thrustTarget = Math.max(2 * clamp(finite(p.thrust, 1), 0, 3) * (1 - Math.exp(-pointerSpeed / 0.8)), thrustTarget * Math.exp(-dt / 0.25));
      boostVelocity += (42.25 * (thrustTarget - boost) - 13 * boostVelocity) * dt;
      if ((boost += boostVelocity * dt) < 0) {
        boost = 0;
        boostVelocity = Math.max(boostVelocity, 0);
      }
      step(dt);
    } else step(0);
    render();
    if (live && inView && !doc.hidden) rafId = win.requestAnimationFrame(frame);
    else lastTs = 0;
  };
  function request() {
    if (destroyed || lost || rafId || !inView) return;
    rafId = win.requestAnimationFrame(frame);
  }

  const currentPixelRatio = () => Math.min(win.devicePixelRatio || 1, 2) * clamp(finite(props.quality, 1), 0.25, 1);
  const resize = () => {
    if (destroyed) return;
    const rect = root.getBoundingClientRect();
    width = Math.max(1, root.clientWidth || rect.width);
    height = Math.max(1, root.clientHeight || rect.height);
    pixelRatio = currentPixelRatio();
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    const w = canvas.width;
    const h = canvas.height;
    disposeTargets();
    lines = renderer.target(Math.max(1, w), Math.max(1, h));
    const levels = clamp(Math.floor(Math.log2(Math.min(w, h) / 8)), 3, 7);
    for (let k = 1; k <= levels; k++) {
      downs.push(renderer.target(Math.max(1, w >> k), Math.max(1, h >> k)));
      ups.push(renderer.target(Math.max(1, w >> k), Math.max(1, h >> k)));
    }
    step(0);
    render();
    request();
  };

  // pointer: moving speeds the flow up, a click (or a tap) launches a burst
  const onPointerMove = (e) => {
    if (e.pointerType === "touch" || !props.interactive || !running()) {
      lastPointer = null;
      return;
    }
    if (lastPointer) pointerTravel += Math.hypot(e.clientX - lastPointer.x, e.clientY - lastPointer.y);
    lastPointer = { x: e.clientX, y: e.clientY };
    request();
  };
  const onPointerLeave = () => {
    lastPointer = null;
    tap = null;
  };
  const onPointerDown = (e) => {
    tap = null;
    const t = e.target;
    if (!props.interactive || !e.isPrimary || (t && typeof t.closest === "function" && t.closest("a,button,input,textarea,select,label,summary,[role=button],[contenteditable=true]"))) return;
    if (e.pointerType === "touch") {
      tap = { id: e.pointerId, x: e.clientX, y: e.clientY, time: performance.now() };
      return;
    }
    if (e.button === 0) burst();
  };
  const onPointerUp = (e) => {
    const t = tap;
    tap = null;
    if (!t || t.id !== e.pointerId || Math.hypot(e.clientX - t.x, e.clientY - t.y) > 10 || performance.now() - t.time > 500) return;
    burst();
  };
  const onVisibility = () => {
    lastTs = 0;
    if (!doc.hidden) request();
  };
  const onLost = (e) => {
    e.preventDefault();
    lost = true;
    win.cancelAnimationFrame(rafId);
    rafId = 0;
    lastTs = 0;
  };
  // a restored context starts empty: rebuild programs, buffers and targets, keep the stars
  const onRestored = () => {
    let next = null;
    try {
      next = createRenderer(canvas);
    } catch {}
    if (!next || destroyed) return;
    renderer = next;
    gl = renderer.gl;
    lost = false;
    colorKey = "";
    lines = null;
    downs = [];
    ups = [];
    hasBuffer = false;
    capacity = 0;
    resize();
  };

  root.addEventListener("pointermove", onPointerMove);
  root.addEventListener("pointerleave", onPointerLeave);
  root.addEventListener("pointercancel", onPointerLeave);
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointerup", onPointerUp);
  doc.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting);
      lastTs = 0;
      if (inView) request();
    },
    { rootMargin: "80px" },
  );
  intersectionObserver.observe(root);
  ensureCapacity(64);
  resize();

  return {
    sync(next = {}) {
      props = { ...props, ...next };
      if (destroyed || lost) return;
      if (Math.abs(currentPixelRatio() - pixelRatio) > 0.001) return void resize();
      if (!rafId) {
        step(0);
        render();
      }
      request();
    },
    burst,
    destroy() {
      destroyed = true;
      win.cancelAnimationFrame(rafId);
      rafId = 0;
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("pointercancel", onPointerLeave);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerup", onPointerUp);
      doc.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      disposeTargets();
      renderer?.dispose();
      canvas.remove();
    },
  };
}
