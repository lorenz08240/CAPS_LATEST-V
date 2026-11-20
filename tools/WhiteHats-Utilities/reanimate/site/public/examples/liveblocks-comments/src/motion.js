// The parts of motion (framer-motion v12) that liveblocks.io's hero uses, ported so the copy moves on the same
// curves: the spring and tween generators (same formulas, same rest thresholds), motion's cubic-bezier solver,
// its colour mixing, and a frame loop that samples every animation at performance.now() once per frame.

// ---------- easing ----------

const calcBezier = (t, a1, a2) => (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;

function binarySubdivide(x, lo, hi, x1, x2) {
  let cx;
  let ct;
  let i = 0;
  do {
    ct = lo + (hi - lo) / 2;
    cx = calcBezier(ct, x1, x2) - x;
    if (cx > 0) hi = ct;
    else lo = ct;
  } while (Math.abs(cx) > 1e-7 && ++i < 12);
  return ct;
}

export function cubicBezier(x1, y1, x2, y2) {
  if (x1 === y1 && x2 === y2) return (t) => t;
  return (t) => (t === 0 || t === 1 ? t : calcBezier(binarySubdivide(t, 0, 1, x1, x2), y1, y2));
}

export const EASE = {
  linear: (t) => t,
  easeIn: cubicBezier(0.42, 0, 1, 1),
  easeOut: cubicBezier(0, 0, 0.58, 1),
  easeInOut: cubicBezier(0.42, 0, 0.58, 1),
};

const easing = (e) => (typeof e === "function" ? e : Array.isArray(e) ? cubicBezier(...e) : EASE[e ?? "easeInOut"]);

// ---------- generators: next(ms since the animation's delay ended) -> { value, done } ----------

// motion's spring(): analytic solution, done when |velocity| <= restSpeed and |target - value| <= restDelta.
export function spring({ from, to, stiffness = 100, damping = 10, mass = 1, velocity = 0, restSpeed, restDelta }) {
  const V = to;
  const O = to - from;
  const E = -velocity / 1000; // motion: velocity: -millisecondsToSeconds(velocity)
  const B = damping / (2 * Math.sqrt(stiffness * mass));
  const W = Math.sqrt(stiffness / mass) / 1000;
  const granular = Math.abs(O) < 5;
  const rs = restSpeed ?? (granular ? 0.01 : 2);
  const rd = restDelta ?? (granular ? 0.005 : 0.5);
  let pos;
  let vel; // units per ms
  if (B < 1) {
    const y = W * Math.sqrt(1 - B * B);
    const b = (E + B * W * O) / y;
    const w = B * W * b + O * y;
    const T = B * W * O - b * y;
    pos = (t) => V - Math.exp(-B * W * t) * (b * Math.sin(y * t) + O * Math.cos(y * t));
    vel = (t) => Math.exp(-B * W * t) * (w * Math.sin(y * t) + T * Math.cos(y * t));
  } else if (B === 1) {
    const k = E + W * O;
    pos = (t) => V - Math.exp(-W * t) * (O + (E + W * O) * t);
    vel = (t) => Math.exp(-W * t) * (W * k * t - E);
  } else {
    const d = W * Math.sqrt(B * B - 1);
    const e = (E + B * W * O) / d;
    const i = B * W * e - O * d;
    const s = B * W * O - e * d;
    pos = (t) => V - (Math.exp(-B * W * t) * ((E + B * W * O) * Math.sinh(Math.min(d * t, 300)) + d * O * Math.cosh(Math.min(d * t, 300)))) / d;
    vel = (t) => Math.exp(-B * W * t) * (i * Math.sinh(Math.min(d * t, 300)) + s * Math.cosh(Math.min(d * t, 300)));
  }
  return (t) => {
    const p = pos(t);
    const done = Math.abs(vel(t) * 1000) <= rs && Math.abs(V - p) <= rd;
    return { value: done ? V : p, done };
  };
}

// motion's keyframes tween with one easing between two values.
export function tween({ from, to, duration = 300, ease }) {
  const f = easing(ease);
  return (t) => {
    const p = duration <= 0 ? 1 : Math.min(1, Math.max(0, t / duration));
    return { value: from + (to - from) * f(p), done: t >= duration };
  };
}

// ---------- colours (motion's mixColor: channels mixed as squares, rounded like its rgba transform) ----------

export function parseColor(c) {
  c = c.trim();
  if (c[0] === "#") {
    let h = c.slice(1);
    if (h.length <= 4) h = [...h].map((x) => x + x).join("");
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1];
  }
  const m = c.match(/[\d.]+/g).map(Number);
  return [m[0], m[1], m[2], m[3] ?? 1];
}

const mixLinear = (a, b, v) => {
  const e = v * (b * b - a * a) + a * a;
  return e < 0 ? 0 : Math.sqrt(e);
};

export function mixColor(from, to, v) {
  const a = parseColor(from);
  const b = parseColor(to);
  const ch = (i) => Math.round(Math.min(255, Math.max(0, mixLinear(a[i], b[i], v))));
  const alpha = Math.min(1, Math.max(0, a[3] + (b[3] - a[3]) * v));
  return `rgba(${ch(0)}, ${ch(1)}, ${ch(2)}, ${alpha})`;
}

// ---------- frame loop ----------

const anims = new Set();
const dirty = new Set(); // MotionEls to re-render this frame
const renders = new Set(); // run after every animation has stepped, once per frame
let scheduled = false;

function frame() {
  scheduled = false;
  const t = performance.now();
  for (const a of [...anims]) a.step(t);
  for (const m of dirty) m.render();
  dirty.clear();
  for (const r of [...renders]) r(t);
  if (anims.size || renders.size) schedule();
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(frame);
}

/** Runs fn(t) after the animations of every frame until the returned stop() is called. */
export function onRender(fn) {
  renders.add(fn);
  schedule();
  return () => renders.delete(fn);
}

/**
 * Animates one number. transition: { type: "spring", stiffness, damping, mass, delay (s), velocity }
 * or { duration (s), ease, delay (s) }. onUpdate(value) runs once per frame; the first frame samples
 * performance.now() - start, like motion's frame loop.
 */
export function animate(from, to, transition, onUpdate, { start = performance.now(), onComplete } = {}) {
  const tr = transition ?? {};
  const delay = (tr.delay ?? 0) * 1000;
  const gen =
    tr.type === "spring"
      ? spring({ from, to, stiffness: tr.stiffness, damping: tr.damping, mass: tr.mass, velocity: tr.velocity ?? 0, restSpeed: tr.restSpeed, restDelta: tr.restDelta })
      : tween({ from, to, duration: (tr.duration ?? 0.3) * 1000, ease: tr.ease });
  const a = {
    value: from,
    prev: from,
    prevAt: start,
    at: start,
    done: false,
    step(t) {
      const e = t - start - delay;
      if (e < 0) return;
      const r = gen(e);
      this.prev = this.value;
      this.prevAt = this.at;
      this.value = r.value;
      this.at = t;
      onUpdate(r.value);
      if (r.done) this.finish();
    },
    finish() {
      if (this.done) return;
      this.done = true;
      anims.delete(this);
      onComplete?.();
    },
    stop() {
      this.done = true;
      anims.delete(this);
    },
    // per second, from the last two frames (motion's MotionValue.getVelocity)
    velocity(t = performance.now()) {
      if (this.done || t - this.at > 30 || this.at === this.prevAt) return 0;
      return ((this.value - this.prev) / Math.min(this.at - this.prevAt, 30)) * 1000;
    },
  };
  anims.add(a);
  schedule();
  return a;
}

// ---------- motion values on elements ----------

const TRANSFORM_ORDER = ["x", "y", "scale", "scaleX", "scaleY", "rotateX"];
const DEFAULTS = { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotateX: 0 };
const fmt = { x: (v) => `translateX(${v}px)`, y: (v) => `translateY(${v}px)`, scale: (v) => `scale(${v})`, scaleX: (v) => `scaleX(${v})`, scaleY: (v) => `scaleY(${v})`, rotateX: (v) => `rotateX(${v}deg)` };

/**
 * An element whose opacity, transform, transform origin, blur and SVG path length are motion values, rendered
 * the way motion renders them: transforms in motion's fixed order ("none" when all are at rest), SVG children
 * transformed about their fill box, path length as pathLength=1 + stroke-dasharray.
 */
export class MotionEl {
  constructor(el, values = {}, { svgChild = false } = {}) {
    this.el = el;
    this.svgChild = svgChild;
    this.v = { ...values };
    this.running = {};
    this.render();
  }
  set(key, value) {
    this.v[key] = value;
    dirty.add(this);
  }
  render() {
    const { el, v } = this;
    const s = el.style;
    if ("opacity" in v) s.opacity = String(v.opacity);
    if ("blur" in v) s.filter = `blur(${v.blur}px)`;
    if ("width" in v) el.setAttribute("width", String(v.width));
    if ("height" in v) el.setAttribute("height", String(v.height));
    if ("rx" in v) el.setAttribute("rx", String(v.rx));
    if ("pathLength" in v) {
      el.setAttribute("pathLength", "1");
      el.setAttribute("stroke-dashoffset", "0px");
      el.setAttribute("stroke-dasharray", `${v.pathLength}px 1px`);
    }
    let tf = "";
    let any = false;
    for (const k of TRANSFORM_ORDER) {
      if (!(k in v)) continue;
      any = true;
      if (v[k] !== DEFAULTS[k]) tf += fmt[k](v[k]) + " ";
    }
    if (any) {
      s.transform = tf.trim() || "none";
      if (this.svgChild) {
        s.transformBox = "fill-box";
        if (!("originX" in v) && !("originY" in v)) s.transformOrigin = "50% 50%";
      }
    }
    if ("originX" in v || "originY" in v) {
      const ox = "originX" in v ? `${v.originX * 100}%` : "50%";
      const oy = "originY" in v ? `${v.originY * 100}%` : "50%";
      s.transformOrigin = `${ox} ${oy} 0`;
      if (this.svgChild) s.transformBox = "fill-box";
    }
  }
  /** Animates key from its current value to `to`; a running animation of the key is replaced (keeping its velocity). */
  to(key, to, transition, start) {
    const cur = this.running[key];
    const velocity = cur && !cur.done ? cur.velocity(start) : 0;
    cur?.stop();
    const from = this.v[key] ?? DEFAULTS[key] ?? 0;
    if (from === to && !velocity) return null;
    const tr = transition.type === "spring" ? { ...transition, velocity } : transition;
    const a = animate(from, to, tr, (val) => {
      this.v[key] = val;
      queueRender(this);
    }, { start });
    this.running[key] = a;
    return a;
  }
  /** Animates several keys with one transition (or a per-key transition map with a `default`). */
  animate(target, transition, start = performance.now()) {
    const out = [];
    for (const [k, val] of Object.entries(target)) {
      const tr = transition[k] ?? transition.default ?? transition;
      const a = this.to(k, val, tr, start);
      if (a) out.push(a);
    }
    return out;
  }
  stopAll() {
    for (const a of Object.values(this.running)) a.stop();
  }
}

function queueRender(m) {
  dirty.add(m);
}

/** Resolves once every animation in the list has finished (motion's AnimatePresence waits like this). */
export function whenDone(list) {
  return new Promise((resolve) => {
    const check = () => (list.every((a) => a.done) ? (stopCheck(), resolve()) : 0);
    const stopCheck = onRender(check);
    check();
  });
}
