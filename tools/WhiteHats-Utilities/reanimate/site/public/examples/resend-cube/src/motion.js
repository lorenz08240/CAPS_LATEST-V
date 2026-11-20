// The cube's motion, as read from the trace of resend.com's Spline scene (per-frame values of
// Cube.rotation.x, rotation.rotation.y, section_3.rotation.x and section.rotation.x over 25 s).
//
// - The whole cube turns 359° in 10 s, linearly, and loops: the outer group "Cube" about its x axis
//   and the inner group "rotation" about its y axis, by the same angle.
// - The left slice ("section 3") turns half a revolution about x in 2 s, 1.5 s after the start and
//   then every 5 s, alternately to −π and back to 0.
// - The right slice ("section") does the same in 3 s, 2.5 s after the start and then every 8 s.
// - Both slice turns ease with cubic-bezier(0.42, 0, 0.58, 1) (fits the trace to 3e-5 of a turn).
// - Everything starts on the third rendered frame. Spline advances its clock by the frame delta in
//   milliseconds and wraps the loop with `t -= duration`; both are copied here, which reproduces the
//   frame on which resend.com's loop shows its end pose.

import { Euler } from "three";

const DEG = Math.PI / 180;
const SPIN_MS = 10000;
const SPIN_END = -359 * DEG;

const SLICES = [
  { path: "Cube/rotation/section 3", delay: 1500, every: 5000, duration: 2000 },
  { path: "Cube/rotation/section", delay: 2500, every: 8000, duration: 3000 },
];

// cubic-bezier solver (Newton–Raphson with a bisection fallback, as in the common bezier-easing code).
function bezier(x1, y1, x2, y2) {
  const ax = 1 - 3 * x2 + 3 * x1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
  const ay = 1 - 3 * y2 + 3 * y1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-12) return sy(t);
      const d = dx(t);
      if (Math.abs(d) < 1e-9) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 64 && hi - lo > 1e-14; i++) {
      if (sx(t) < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}
const easeInOut = bezier(0.42, 0, 0.58, 1);

// Half-turn legs: 0 → −π, hold, −π → 0, hold, …
function slice(t, { delay, every, duration }) {
  if (t < delay) return 0;
  const n = Math.floor((t - delay) / every);
  const local = t - delay - n * every;
  const p = local < duration ? easeInOut(local / duration) : 1;
  const from = n % 2 === 0 ? 0 : -Math.PI;
  const to = n % 2 === 0 ? -Math.PI : 0;
  return from + (to - from) * p;
}

export function createMotion(nodes) {
  const cube = nodes.get("Cube");
  const inner = nodes.get("Cube/rotation");
  const slices = SLICES.map((s) => ({ ...s, node: nodes.get(s.path) }));
  let frame = 0;
  let last = null;
  let elapsed = 0; // ms since the motion started
  let spin = 0; // ms into the current spin loop

  // Spline writes rotations through the quaternion, so three re-derives the Euler angles from it
  // (they wrap at ±π, and the y spin shows up as x = z = ±π past a quarter turn), as in the trace.
  const euler = new Euler();
  const turn = (node, x, y) => node.quaternion.setFromEuler(euler.set(x, y, 0));
  const apply = (angle) => {
    turn(cube, angle, 0);
    turn(inner, 0, angle);
    for (const s of slices) turn(s.node, slice(elapsed, s), 0);
  };
  apply(0);

  return {
    // Call once per rendered frame with the rAF timestamp (ms).
    step(now) {
      const dt = last === null ? 0 : now - last;
      last = now;
      if (frame++ < 3) return apply(0); // frames 0–2 show the start pose
      elapsed += dt;
      spin += dt;
      let angle;
      if (spin >= SPIN_MS) {
        angle = SPIN_END;
        spin -= SPIN_MS;
      } else angle = (SPIN_END * spin) / SPIN_MS;
      apply(angle);
    },
  };
}
