// "Advanced security" card: hover the card and the fingerprint draws itself in cyan, a sheen sweeps the button,
// a glow ring fades in and pulses, a WebGL2 dot field ripples out from the button, and after 0.8 s the two side
// panels slide outward. Nothing moves at rest; leaving the card reverses everything.
//
// clerk.com builds it with Motion for React (module 561502) and its own WebGL2 <Shader> runtime (modules 37288 +
// 728107). This file reproduces both without libraries:
// - Motion's declarative animations on opacity/transform run as WAAPI (`fill: "both"`, native cubic-bezier
//   easing); on finish the final value is written to the style and the animation cancelled, as Motion does. An
//   interrupted animation restarts from the value sampled with the JS easing at its current time.
// - Motion's JS animations (the stroke-draw motion value, the panels' `x`, eased with a JS easeOutExpo) run on
//   one requestAnimationFrame loop with performance.now() timestamps, like Motion's frameloop.
// - AnimatePresence children (dot field, ring) are mounted on hover and fade out (opacity → 0, 0.3 s) before
//   being removed; hovering again while they fade brings the same instance back.
// - The dot field is clerk.com's shader verbatim (same GLSL, uniforms, blending, DPR rule and 30 fps throttle,
//   u_time = seconds since its first animation frame). Its "randomness" is a GLSL hash of the cell position, so
//   it is identical on every hover and every load; Math.random is not used anywhere.

// ---------- easing (Motion's cubicBezier: binary subdivision, 12 iterations) ----------

function cubicBezier(x1, y1, x2, y2) {
  const calc = (t, a1, a2) => (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;
  const tForX = (x) => {
    let lo = 0, hi = 1, t, cx, i = 0;
    do {
      t = lo + (hi - lo) / 2;
      cx = calc(t, x1, x2) - x;
      if (cx > 0) hi = t; else lo = t;
    } while (Math.abs(cx) > 1e-7 && ++i < 12);
    return t;
  };
  const fn = (t) => (t === 0 || t === 1 ? t : calc(tForX(t), y1, y2));
  fn.css = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  return fn;
}
const linear = (t) => t;
linear.css = "linear";
// clerk.com module 275921 `u`: a JS function, so Motion runs it on the main thread
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

// Motion's default tween when a transition gives none (0.3 s), and the card's own transitions
const DEFAULT = { duration: 300, ease: cubicBezier(0.25, 0.1, 0.35, 1) };
const DRAW_IN = { duration: 750, ease: cubicBezier(0.25, 0.75, 0, 1) };
const SHEEN_IN = { duration: 500, ease: cubicBezier(0, 0.4, 0.2, 1) };
const PANELS_IN = { duration: 800, delay: 800, ease: easeOutExpo };
const PANELS_OUT = { duration: 600, ease: easeOutExpo };
const RING_IN = { duration: 800, ease: linear };
const PULSE_EASE = "cubic-bezier(0.7, 0, 0.3, 1)";
const PANEL_X = 5.1875; // rem (83 px): the panels' rest offset, tucked in towards the button

const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const lerp = (from, to, p) => from.map((f, i) => f + (to[i] - f) * p);
const same = (a, b) => a.every((v, i) => v === b[i]);

// ---------- WAAPI value (Motion's accelerated opacity / transform) ----------

class WaapiValue {
  constructor(el, prop, format, initial) {
    Object.assign(this, { el, prop, format, v: initial, run: null });
  }
  current() {
    const r = this.run;
    if (!r) return this.v;
    const t = (Number(r.anim.currentTime) || 0) - r.delay;
    if (t <= 0) return r.from;
    return lerp(r.from, r.to, r.ease(Math.min(t / r.duration, 1)));
  }
  set(v) {
    this.v = v;
    this.el.style[this.prop] = this.format(v);
  }
  stop() {
    const from = this.current();
    if (this.run) {
      this.run.anim.cancel();
      this.run = null;
    }
    this.set(from);
    return from;
  }
  to(target, { duration, delay = 0, ease }, onDone) {
    const from = this.stop();
    if (same(from, target) || reducedMotion?.matches) {
      this.set(target);
      onDone?.();
      return;
    }
    const anim = this.el.animate(
      { [this.prop]: [this.format(from), this.format(target)] },
      { duration, delay, easing: ease.css, fill: "both" },
    );
    const run = { anim, from, to: target, delay, duration, ease };
    this.run = run;
    anim.onfinish = () => {
      if (this.run !== run) return;
      this.run = null;
      this.set(target); // Motion commits the final keyframe to the style and cancels the animation
      anim.cancel();
      onDone?.();
    };
  }
}

// ---------- JS values on one rAF loop (Motion's frameloop + JSAnimation) ----------

const ticking = new Set();
let rafId = 0;
function tick() {
  const now = performance.now();
  for (const f of [...ticking]) f(now);
  rafId = ticking.size ? requestAnimationFrame(tick) : 0;
}
function onFrame(f) {
  ticking.add(f);
  if (!rafId) rafId = requestAnimationFrame(tick);
  return () => ticking.delete(f);
}

class JsValue {
  constructor(initial, render) {
    Object.assign(this, { v: initial, render, run: null });
    render(initial);
  }
  sample(r, now) {
    const t = now - r.start - r.delay;
    if (t <= 0) return r.from;
    return r.from + (r.to - r.from) * r.ease(Math.min(t / r.duration, 1));
  }
  to(target, { duration, delay = 0, ease }) {
    const now = performance.now();
    if (this.run) {
      this.v = this.sample(this.run, now);
      this.run.off();
      this.run = null;
    }
    if (this.v === target || reducedMotion?.matches) {
      this.v = target;
      this.render(target);
      return;
    }
    const run = { from: this.v, to: target, start: now, delay, duration, ease };
    run.off = onFrame((t) => {
      this.v = this.sample(run, t);
      this.render(this.v);
      if (t - run.start - run.delay >= run.duration) {
        run.off();
        if (this.run === run) this.run = null;
      }
    });
    this.run = run;
  }
}

// ---------- the WebGL2 dot field (clerk.com modules 37288 "DotMatrix" + 728107 "Shader") ----------

const VERTEX = `#version 300 es
precision mediump float;
in vec2 coordinates;

uniform vec2 u_resolution;

out vec2 fragCoord;

void main(void) {
  gl_Position = vec4(coordinates, 0.0, 1.0);
  fragCoord = (coordinates + 1.0) * 0.5 * u_resolution;
  fragCoord.y = u_resolution.y - fragCoord.y;
}
`;

// DotMatrix's source({ init, shader, center: ["x", "y"] }) with advanced-security's `shader` injection
const INTRO = `
                  float intro_offset = 0.5 + distance(u_resolution / 2.0 / u_total_size, st2) * 0.02 + (random(st2) * 0.3);
                  opacity *= step(intro_offset, u_time);
                `;
const FRAGMENT = `#version 300 es
precision mediump float;

in vec2 fragCoord;

uniform float u_time;
uniform float u_opacities[10];
uniform vec3 u_colors[6];
uniform float u_total_size;
uniform float u_dot_size;
uniform vec2 u_resolution;


out vec4 fragColor;

// https://stackoverflow.com/a/28095165
float PHI = 1.61803398874989484820459;
float random(vec2 xy) {
  return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float map_clamp(float value, float min1, float max1, float min2, float max2) {
  return clamp(map(value, min1, max1, min2, max2), min(min2, max2), max(min2, max2));
}

void main() {
  vec2 st = fragCoord.xy;

  // Center dots on canvas
  // Remove the 'floor' to allow subpixel positioning
  st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
  st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

  float opacity = step(0.0, st.x);
  opacity *= step(0.0, st.y);

  vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

  float frequency = 5.0;
  float show_offset = random(st2);
  // Without the +1.0 the first column is all the same opacity
  float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency) + 1.0);
  opacity *= u_opacities[int(rand * 10.0)];
  opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
  opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

  vec3 color = u_colors[int(show_offset * 6.0)];

  ${INTRO}

  fragColor = vec4(color, opacity);
  fragColor.rgb *= fragColor.a;
}
`;

// <DotMatrix colors={[[93,227,255]]} dotSize={1} totalSize={3} opacities={[.4,.4,.6,.6,.6,.8,.8,.8,.8,1]} />
// (maxFps defaults to 30); one colour fills all six u_colors slots
const SKY = [93 / 255, 227 / 255, 255 / 255];
const UNIFORMS = [
  ["u_colors", "uniform3fv", [SKY, SKY, SKY, SKY, SKY, SKY].flat()],
  ["u_opacities", "uniform1fv", [0.4, 0.4, 0.6, 0.6, 0.6, 0.8, 0.8, 0.8, 0.8, 1]],
  ["u_total_size", "uniform1f", 3],
  ["u_dot_size", "uniform1f", 1],
];
const MAX_FPS = 30;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s;
  console.error("advanced-security: shader error: " + gl.getShaderInfoLog(s));
  gl.deleteShader(s);
  return null;
}

// Mounts the canvas into `host` (positioned, 200x200) and starts drawing on the next animation frame.
function startDotField(host, { still = false } = {}) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.append(canvas);
  const p = Math.round(Math.max(1, Math.min(window.devicePixelRatio ?? 1, 2)));
  canvas.width = canvas.offsetWidth * p;
  canvas.height = canvas.offsetHeight * p;
  let gl = canvas.getContext("webgl2");
  if (!gl) return { destroy() {} };
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return { destroy() {} };
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("advanced-security: link error: " + gl.getProgramInfoLog(prog));
    return { destroy() {} };
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "coordinates");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, "u_resolution");
  const uTime = gl.getUniformLocation(prog, "u_time");
  const locs = UNIFORMS.map(([name]) => gl.getUniformLocation(prog, name));
  gl.uniform2f(uRes, canvas.width / p, canvas.height / p);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // the fragment writes (c·a, a): on screen the dot alpha is a²
  gl.disable(gl.DEPTH_TEST);

  const draw = (seconds) => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(uTime, seconds);
    UNIFORMS.forEach(([, type, value], i) => gl[type](locs[i], value));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // useAnimationFrame: elapsed ms since the first frame; the Shader skips frames closer than 1000/maxFps to
  // the last drawn one (the first frame, elapsed 0, is skipped too)
  let first = null;
  let last = 0;
  const off = still
    ? (draw(2), () => {})
    : onFrame((now) => {
        if (first === null) first = now;
        const e = now - first;
        if (e - last < 1000 / MAX_FPS) return;
        last = e;
        draw(e / 1000);
      });
  const ro = new ResizeObserver(() => {
    canvas.width = canvas.offsetWidth * p;
    canvas.height = canvas.offsetHeight * p;
    gl?.uniform2f(uRes, canvas.width / p, canvas.height / p);
    if (still) draw(2);
  });
  ro.observe(canvas);
  return {
    destroy() {
      off();
      ro.disconnect();
      if (!gl) return;
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl = null;
    },
  };
}

// ---------- AnimatePresence children ----------

// A hover-only layer: mounted on hover, exit {opacity: 0} with the default 0.3 s tween, then removed.
class Presence {
  constructor(build) {
    this.build = build; // () => { el, opacity: WaapiValue, enter(), destroy() }
    this.node = null;
    this.exiting = false;
  }
  show() {
    if (this.node && this.exiting) {
      // same key back while exiting: the instance stays and animates back to its target
      this.exiting = false;
      this.node.revive();
      return;
    }
    if (this.node) return;
    this.node = this.build();
    this.exiting = false;
  }
  hide() {
    if (!this.node || this.exiting) return;
    this.exiting = true;
    const node = this.node;
    node.opacity.to([0], DEFAULT, () => {
      if (this.node !== node || !this.exiting) return;
      node.destroy();
      node.el.remove();
      this.node = null;
      this.exiting = false;
    });
  }
}

const opacityFmt = ([o]) => String(o);

export function mount(slot, card) {
  const q = (s) => slot.querySelector(s);
  const stage = q(".as-stage");
  const button = q(".as-button");
  if (!stage || !button) return;

  // 1. fingerprint: length 0 → 1 drives every cyan path's stroke-dasharray (pathLength = 1)
  const arcs = [...slot.querySelectorAll(".as-cyan:not(.as-cyan--spiral)")];
  const spiral = q(".as-cyan--spiral");
  const length = new JsValue(0, (l) => {
    for (const a of arcs) {
      a.setAttribute("stroke-dasharray", `${l} 2`);
      a.setAttribute("opacity", String(+(l > 0)));
    }
    // spiral: three dashes (from the start, around the middle, from the end) meeting at length 1
    const t = Math.min(Math.max(l, 0), 1) / 3;
    const gap = (1 - 3 * t) / 2;
    spiral.setAttribute("stroke-dasharray", `${t} ${gap} ${t} ${gap} 2`);
    spiral.setAttribute("opacity", String(+(t > 0)));
  });

  // 2. button tint, 3. sheen (translate in rem), 4. side panels (x in rem, JS-eased)
  const tint = new WaapiValue(q(".as-tint"), "opacity", opacityFmt, [0]);
  const sheen = new WaapiValue(q(".as-sheen__band"), "transform", ([x, y]) => `translate(${x}rem, ${y}rem)`, [-2.75, -2.75]);
  const panelFmt = (el) => (x) => { el.style.transform = x === 0 ? "none" : `translateX(${x}rem)`; };
  const panelL = new JsValue(PANEL_X, panelFmt(q(".as-panel--l")));
  const panelR = new JsValue(-PANEL_X, panelFmt(q(".as-panel--r")));

  // 5. dot field (first child of the stage, under the button)
  const dots = new Presence(() => {
    const el = document.createElement("div");
    el.className = "as-dots";
    stage.prepend(el);
    const opacity = new WaapiValue(el, "opacity", opacityFmt, [1]);
    const field = startDotField(el, { still: !!reducedMotion?.matches });
    return { el, opacity, revive: () => opacity.to([1], DEFAULT), destroy: () => field.destroy() };
  });

  // 6. glow ring (last child of the button): fades in over 0.8 s (linear), pulses .6 → 1 → .6 every 2 s
  const ring = new Presence(() => {
    const el = document.createElement("div");
    el.className = "as-ring";
    el.style.opacity = "0";
    el.innerHTML = '<div class="as-ring__pulse"><div class="as-ring__outer"></div><div class="as-ring__inner"></div></div>';
    button.append(el);
    const pulseEl = el.firstChild;
    const pulse = reducedMotion?.matches
      ? null
      : pulseEl.animate({ opacity: ["0.6", "1", "0.6"] }, { duration: 2000, easing: PULSE_EASE, iterations: Infinity, fill: "both" });
    const opacity = new WaapiValue(el, "opacity", opacityFmt, [0]);
    opacity.to([1], RING_IN);
    return { el, opacity, revive: () => opacity.to([1], RING_IN), destroy: () => pulse?.cancel() };
  });

  let hovered = false;
  function setHovered(on) {
    if (on === hovered) return;
    hovered = on;
    if (on) {
      dots.show();
      ring.show();
      length.to(1, DRAW_IN);
      tint.to([1], DEFAULT);
      sheen.to([0, 0], SHEEN_IN);
      panelL.to(0, PANELS_IN);
      panelR.to(0, PANELS_IN);
    } else {
      length.to(0, DEFAULT);
      tint.to([0], DEFAULT);
      sheen.to([-2.75, -2.75], DEFAULT);
      panelL.to(PANEL_X, PANELS_OUT);
      panelR.to(-PANEL_X, PANELS_OUT);
      ring.hide();
      dots.hide();
    }
  }

  // react-aria useHover on the card root: pointer enter/leave, touch ignored
  card.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") setHovered(true); });
  card.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") setHovered(false); });
}
