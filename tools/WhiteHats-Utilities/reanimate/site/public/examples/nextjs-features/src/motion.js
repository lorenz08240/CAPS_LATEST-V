// The part of Motion (framer-motion) the streaming card uses, ported from the build nextjs.org ships:
// keyframe tweens with per-segment easing, delay, repeat and repeatDelay, on one requestAnimationFrame batch.
// As in Motion, an animation asked for between frames starts on the next frame (its start time is that
// frame's timestamp), the time is rounded to whole milliseconds, the value holds the first keyframe during
// the delay and the last keyframe during repeatDelay.

// Motion's cubic bezier: x solved by bisection, 12 steps at most, to 1e-7
const bez = (t, a1, a2) => (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;
export function cubicBezier(x1, y1, x2, y2) {
  if (x1 === y1 && x2 === y2) return (p) => p;
  const solve = (x) => {
    let lo = 0;
    let hi = 1;
    let mid;
    let err;
    let i = 0;
    do {
      mid = lo + (hi - lo) / 2;
      err = bez(mid, x1, x2) - x;
      if (err > 0) hi = mid;
      else lo = mid;
    } while (Math.abs(err) > 1e-7 && ++i < 12);
    return mid;
  };
  return (p) => (p === 0 || p === 1 ? p : bez(solve(p), y1, y2));
}
export const easeIn = cubicBezier(0.42, 0, 1, 1);
export const easeOut = cubicBezier(0, 0, 0.58, 1);

const clamp = (lo, hi, v) => Math.min(Math.max(v, lo), hi);
const mix = (from, to, p) => from + (to - from) * p;
// numbers inside a string (an SVG path), mixed one by one; Motion rounds them to 5 decimals
const NUM = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const sanitize = (v) => Math.round(v * 1e5) / 1e5;
function mixString(from, to) {
  const a = from.match(NUM).map(Number);
  const b = to.match(NUM).map(Number);
  const parts = to.split(NUM);
  return (p) => {
    let out = parts[0];
    for (let i = 0; i < b.length; i++) out += sanitize(mix(a[i], b[i], p)) + parts[i + 1];
    return out;
  };
}

// ---------- the frame batch ----------
const running = new Set();
const starting = new Set();
let rafId = null;
function batch() {
  rafId = null;
  const now = performance.now();
  for (const a of starting) {
    a.startTime = now;
    running.add(a);
  }
  starting.clear();
  for (const a of running) a.tick(now);
  if (running.size || starting.size) rafId = requestAnimationFrame(batch);
}
function wake() {
  if (rafId === null) rafId = requestAnimationFrame(batch);
}

// keyframes: numbers or path strings; ease: one easing for every segment; times evenly spaced
export function animate({ keyframes, duration, delay = 0, ease = easeOut, repeat = 0, repeatDelay = 0, onUpdate }) {
  const ms = duration * 1000;
  const delayMs = delay * 1000;
  const repeatDelayMs = repeatDelay * 1000;
  const segments = keyframes.length - 1;
  const mixers = [];
  for (let i = 0; i < segments; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    mixers.push(typeof a === "string" ? mixString(a, b) : (p) => mix(a, b, p));
  }
  const at = (t) => {
    const x = clamp(0, 1, t / ms) * segments;
    const i = Math.min(segments - 1, Math.floor(x));
    return mixers[i](ease(clamp(0, 1, x - i)));
  };
  const resolved = ms + repeatDelayMs;
  const total = repeat === Infinity ? Infinity : resolved * (repeat + 1) - repeatDelayMs;
  const anim = {
    startTime: null,
    value: keyframes[0],
    tick(now) {
      const time = Math.round(now - anim.startTime) - delayMs;
      const inDelay = time < 0;
      let t = Math.max(time, 0);
      if (repeat) {
        const progress = Math.min(t, total) / resolved;
        let iterationProgress = progress % 1;
        if (!iterationProgress && progress >= 1) iterationProgress = 1;
        t = clamp(0, 1, iterationProgress) * resolved;
      }
      const done = !inDelay && time >= total;
      // a finished tween lands on its last keyframe exactly (a path string as written, not re-rounded)
      anim.value = inDelay ? keyframes[0] : done ? keyframes[segments] : at(t);
      onUpdate(anim.value);
      if (done) anim.stop();
    },
    stop() {
      running.delete(anim);
      starting.delete(anim);
    },
  };
  starting.add(anim);
  wake();
  return anim;
}
