// A small subset of what the original gets from Framer Motion: cubic-bezier easings, the spring
// solver (same formulas, rest thresholds and 50 ms duration search), springs turned into WAAPI
// linear() easings, and a rAF tween for SVG attributes and motion values.

export const EASE = {
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  swift: [0.2, 0, 0, 1],
  outCubic: [0.33, 1, 0.68, 1],
  inOutQuad: [0.45, 0, 0.55, 1],
};

const css = (e) => (e[0] === 0 && e[1] === 0 && e[2] === 1 && e[3] === 1 ? "linear" : `cubic-bezier(${e.join(", ")})`);
export const cssEase = (e) => css(typeof e === "string" ? EASE[e] : e);

// cubic-bezier solver (binary subdivision, like Framer Motion's)
export function bezier(e) {
  const [x1, y1, x2, y2] = typeof e === "string" ? EASE[e] : e;
  if (x1 === y1 && x2 === y2) return (t) => t;
  const calc = (t, a1, a2) => (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;
  const solve = (x) => {
    let lo = 0, hi = 1, t = 0, cur;
    for (let i = 0; i < 12; i++) {
      t = lo + (hi - lo) / 2;
      cur = calc(t, x1, x2) - x;
      if (cur > 0) hi = t; else lo = t;
      if (Math.abs(cur) <= 1e-7) break;
    }
    return t;
  };
  return (x) => (x === 0 || x === 1 ? x : calc(solve(x), y1, y2));
}

// Spring generator: options in Framer Motion's units (stiffness, damping, mass, or bounce +
// visualDuration). Returns value(tMs) and done(tMs) for keyframes [from, to].
export function springGenerator({ from = 0, to = 1, velocity = 0, stiffness = 100, damping = 10, mass = 1, bounce, visualDuration, restDelta, restSpeed }) {
  if (visualDuration !== undefined) {
    const root = (2 * Math.PI) / (visualDuration * 1.2);
    stiffness = root * root;
    damping = 2 * Math.min(1, Math.max(0.05, 1 - (bounce || 0))) * Math.sqrt(stiffness);
    mass = 1;
  }
  const delta = to - from;
  const granular = Math.abs(delta) < 5;
  restSpeed ??= granular ? 0.01 : 2;
  restDelta ??= granular ? 0.005 : 0.5;
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const w0 = Math.sqrt(stiffness / mass) / 1000; // per ms
  const v0 = -velocity / 1000; // Framer passes -velocity (units per second) in ms
  let resolve;
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    resolve = (t) => {
      const env = Math.exp(-zeta * w0 * t);
      return to - env * (((v0 + zeta * w0 * delta) / wd) * Math.sin(wd * t) + delta * Math.cos(wd * t));
    };
  } else if (zeta === 1) {
    resolve = (t) => to - Math.exp(-w0 * t) * (delta + (v0 + w0 * delta) * t);
  } else {
    const wd = w0 * Math.sqrt(zeta * zeta - 1);
    resolve = (t) => {
      const env = Math.exp(-zeta * w0 * t);
      const f = Math.min(wd * t, 300);
      return to - (env * ((v0 + zeta * w0 * delta) * Math.sinh(f) + wd * delta * Math.cosh(f))) / wd;
    };
  }
  const done = (t) => {
    const cur = resolve(t);
    let vel = 0;
    if (zeta < 1) vel = t === 0 ? v0 * 1000 : (cur - resolve(Math.max(0, t - 5))) / (Math.min(t, 5) / 1000);
    return Math.abs(vel) <= restSpeed && Math.abs(to - cur) <= restDelta;
  };
  let duration = 0;
  while (!done(duration) && duration < 20000) duration += 50;
  return { value: (t) => (t >= duration || done(t) ? to : resolve(t)), done, duration };
}

// A spring as a WAAPI easing over a 0..100 progress (Framer animates complex strings on 0..100).
export function springEasing(opts) {
  const g = springGenerator({ ...opts, from: 0, to: 100 });
  const n = Math.max(Math.round(g.duration / 10), 2);
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(+(g.value((i / (n - 1)) * g.duration) / 100).toFixed(5));
  return { easing: `linear(${pts.join(", ")})`, duration: g.duration };
}

// WAAPI keyframes from Framer-style values/times/ease arrays.
export function waapi(el, prop, values, { duration, delay = 0, times, ease = "easeOut", fill = "both" }) {
  const n = values.length;
  const eases = Array.isArray(ease) && typeof ease[0] !== "number" ? ease : null;
  const frames = values.map((v, i) => {
    const f = { [prop]: v, offset: times ? times[i] : n === 1 ? 1 : i / (n - 1) };
    if (i < n - 1) f.easing = eases ? cssEase(eases[i]) : cssEase(ease);
    return f;
  });
  return el.animate(frames, { duration: duration * 1000, delay: delay * 1000, fill, easing: "linear" });
}

// rAF tween of numbers through keyframes (times + per-segment ease), for SVG attributes.
const running = new Set();
let rafId = 0;
function tick(now) {
  for (const a of [...running]) a.step(now);
  rafId = running.size ? requestAnimationFrame(tick) : 0;
}
export function tween(values, { duration, delay = 0, times, ease = "easeInOut", onUpdate, onComplete }) {
  const n = values.length;
  times ??= values.map((_, i) => i / (n - 1));
  const eases = (Array.isArray(ease) && typeof ease[0] !== "number" ? ease : Array(n - 1).fill(ease)).map(bezier);
  const start = performance.now() + delay * 1000;
  const total = duration * 1000;
  const at = (p) => {
    if (p <= 0) return values[0];
    if (p >= 1) return values[n - 1];
    let i = 1;
    while (i < n - 1 && times[i] < p) i++;
    const span = times[i] - times[i - 1];
    const local = span > 0 ? (p - times[i - 1]) / span : 1;
    return values[i - 1] + (values[i] - values[i - 1]) * eases[i - 1](local);
  };
  const anim = {
    stopped: false,
    step(now) {
      if (anim.stopped) return;
      const p = total > 0 ? (now - start) / total : now >= start ? 1 : 0;
      onUpdate(at(Math.min(1, p)));
      if (p >= 1) { running.delete(anim); onComplete?.(); }
    },
    stop() { anim.stopped = true; running.delete(anim); },
  };
  onUpdate(values[0]);
  running.add(anim);
  if (!rafId) rafId = requestAnimationFrame(tick);
  return anim;
}

// A value that follows a target with a spring, like Framer Motion's useSpring: a change of the
// target restarts the spring after the frame has rendered (frame.postRender), from the current
// value and velocity, so the spring keeps integrating while the target itself is animating.
export function springFollower({ stiffness, damping, mass }, onUpdate) {
  let value = 0, target = 0, gen = null, t0 = 0, pending = false, active = false;
  const velocityAt = (t) => (gen ? (gen.value(t) - gen.value(Math.max(0, t - 5))) / (Math.min(Math.max(t, 1), 5) / 1000) : 0);
  const f = {
    get: () => target,
    set(v) {
      target = v;
      pending = true;
      if (!active) { active = true; running.add(f); if (!rafId) rafId = requestAnimationFrame(tick); }
    },
    step(now) {
      if (gen) {
        const t = Math.max(0, now - t0);
        value = gen.value(t);
        onUpdate(value);
        if (pending) {
          const vel = velocityAt(t);
          gen = springGenerator({ from: value, to: target, velocity: vel, stiffness, damping, mass, restDelta: 0.001, restSpeed: 0.01 });
          t0 = now;
          pending = false;
        } else if (t >= gen.duration) gen = null;
      } else if (pending) {
        gen = springGenerator({ from: value, to: target, velocity: 0, stiffness, damping, mass, restDelta: 0.001, restSpeed: 0.01 });
        t0 = now;
        pending = false;
      }
      if (!gen && !pending) { active = false; running.delete(f); }
    },
  };
  return f;
}
