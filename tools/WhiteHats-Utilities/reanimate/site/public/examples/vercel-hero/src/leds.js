// The 72 LEDs along the triangle's edges, ported from vercel.com's hero (modules 103584 and 4234513).
// Every frame each LED gets a brightness and a colour: three soft lines of light run round the edges;
// near the pointer the lines fade and the LEDs facing it light up instead; hovering a nav item lights
// one edge; a dragged file brings three brighter segments that chase round; the colour mix tints them
// (dark theme only). The result is uploaded as a 2x72 float texture the shaders read.
//
// Per LED, 8 floats: x, y, brightness, angle, r, g, b, 0. The typed arrays are Float32Array, as on
// vercel.com, so values round the same way.

import { LEDS_PER_SIDE, LED_COUNT, MODES, ANIMATION_CLOCK_START, ledLayout, DROP_BASE_MIN, DROP_BASE_MAX, DROP_SEGMENTS, DROP_SEGMENT_HALF, DROP_SEGMENT_GROW, DROP_SEGMENT_CORE, DROP_SEGMENT_SPEED, DROP_SEGMENT_SPEEDS } from "./config.js";

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a, b, t) => a + (b - a) * t;
const remap = (value, inMin, inMax, outMin, outMax) => lerp(outMin, outMax, inMin === inMax ? 0 : (value - inMin) / (inMax - inMin));
const smoothstep = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
/** Signed distance from LED i to position c round the ring of `n`. */
const ringDelta = (i, c, n) => (((i - c) % n) + n + n / 2) % n - n / 2;
const wrap = (v) => ((v % LED_COUNT) + LED_COUNT) % LED_COUNT;

// lines mode: three lines, their start positions and speeds (LEDs per second), widths and brightness
// breathing on slow sines
const LINE_START = [6, 6, 6];
const LINE_SPEED = [-3.302, -2.355, -1.636];
const WIDTH_MIN = LEDS_PER_SIDE;
const WIDTH_MAX = 1.7 * LEDS_PER_SIDE;
const WIDTH_MID = (WIDTH_MIN + WIDTH_MAX) / 2;
const WIDTH_SWING = (WIDTH_MAX - WIDTH_MIN) / 2;
const WIDTH_RATE = [0.41, 0.31, 0.23];
const WIDTH_PHASE = [0, 2.1, 4.2];
const LEVEL_RATE = [0.52, 0.38, 0.28];
const LEVEL_PHASE = [Math.PI / 2, 0.4, -0.6];
const DEFAULT_RED = { r: 0.896269, g: 0.027321, b: 0.051269 };
const DEFAULT_GREEN = { r: 0, g: 0.40724, b: 0.048172 };
const DEFAULT_BLUE = { r: 0, g: 0.278894, b: 1 };

export function createLeds(sim, prev) {
  const layout = ledLayout(sim, LEDS_PER_SIDE);
  const n = layout.positions.length;
  const data = new Float32Array(8 * n);
  const local = new Float32Array(2 * n);
  const normals = new Float32Array(2 * n);
  for (const [i, p] of layout.positions.entries()) {
    const o = 8 * i;
    const angle = p.angle ?? 0;
    data[o] = p.x; data[o + 1] = p.y; data[o + 2] = 0; data[o + 3] = angle;
    data[o + 4] = 1; data[o + 5] = 1; data[o + 6] = 1; data[o + 7] = 0;
    const dx = p.x - layout.center.x, dy = p.y - layout.center.y;
    local[2 * i] = dx; local[2 * i + 1] = dy;
    let nx = -Math.sin(angle), ny = Math.cos(angle);
    if (nx * dx + ny * dy < 0) { nx = -nx; ny = -ny; } // outward
    normals[2 * i] = nx; normals[2 * i + 1] = ny;
  }
  const g = layout.geometry;
  const mid = (a, b) => ({ x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 });
  return {
    data,
    currentState: Float32Array.from(data),
    targetState: Float32Array.from(data),
    deployingState: Float32Array.from(data),
    dropActiveState: Float32Array.from(data),
    local, normals,
    ledRadius: layout.ledRadius,
    triangleHeight: g.height,
    deployEdgeCenters: [mid(g.top, g.left), mid(g.left, g.right), mid(g.right, g.top)],
    triangleVertices: [{ x: g.top.x, y: g.top.y }, { x: g.left.x, y: g.left.y }, { x: g.right.x, y: g.right.y }],
    lastMode: prev?.lastMode,
    lastEdgeIndex: prev?.lastEdgeIndex,
    transitionStart: 0,
    transitionDuration: 0,
    transitionActive: false,
    animationClock: prev?.animationClock ?? 0,
    startupElapsed: prev?.startupElapsed ?? 0,
    lastFrameTime: prev?.lastFrameTime,
    lineCenters: prev?.lineCenters ?? Float32Array.from(LINE_START),
    lineVelocities: prev?.lineVelocities ?? Float32Array.from(LINE_SPEED),
    glowState: prev?.glowState ?? new Float32Array(LED_COUNT),
    glowDecaying: prev?.glowDecaying ?? false,
    hoverTransition: prev?.hoverTransition ?? 0,
    hoverActive: prev?.hoverActive ?? false,
  };
}

function setLed(arr, i, brightness, r, g, b) {
  const o = 8 * i;
  arr[o + 2] = brightness; arr[o + 4] = r; arr[o + 5] = g; arr[o + 6] = b;
}
function mixInto(out, from, to, t) {
  for (let i = 0; i < out.length; i++) {
    const a = from[i] ?? 0;
    out[i] = a + ((to[i] ?? 0) - a) * t;
  }
}

function linesTarget(leds, target, clock, dt) {
  for (let k = 0; k < 3; k++) leds.lineCenters[k] = wrap((leds.lineCenters[k] ?? 0) + (leds.lineVelocities[k] ?? 0) * dt);
  const t = clock - ANIMATION_CLOCK_START;
  const width = [], core = [], level = [];
  for (let k = 0; k < 3; k++) {
    const w = Math.max(1, 0.5 * (WIDTH_MID + WIDTH_SWING * Math.sin(t * WIDTH_RATE[k] + WIDTH_PHASE[k])));
    width[k] = w;
    core[k] = 0.5 * w;
    level[k] = 0.5 + 0.5 * Math.sin(t * LEVEL_RATE[k] + LEVEL_PHASE[k]);
  }
  for (let i = 0; i < LED_COUNT; i++) {
    let v = 0;
    for (let k = 0; k < 3; k++) {
      const d = Math.abs(ringDelta(i, leds.lineCenters[k] ?? 0, LED_COUNT));
      const w = width[k] ?? 1, c = core[k] ?? 0;
      v = Math.max(v, (d <= c ? 1 : clamp01(1 - (d - c) / (w - c))) * (level[k] ?? 0));
    }
    setLed(target, i, clamp01(v), 1, 1, 1);
  }
}

/** Signed distance from p to the triangle (negative inside). */
function triangleDistance(px, py, [v0, v1, v2]) {
  const e0x = v1.x - v0.x, e0y = v1.y - v0.y;
  const e1x = v2.x - v1.x, e1y = v2.y - v1.y;
  const e2x = v0.x - v2.x, e2y = v0.y - v2.y;
  const p0x = px - v0.x, p0y = py - v0.y;
  const p1x = px - v1.x, p1y = py - v1.y;
  const p2x = px - v2.x, p2y = py - v2.y;
  const t0 = clamp01((p0x * e0x + p0y * e0y) / (e0x * e0x + e0y * e0y || 1));
  const t1 = clamp01((p1x * e1x + p1y * e1y) / (e1x * e1x + e1y * e1y || 1));
  const t2 = clamp01((p2x * e2x + p2y * e2y) / (e2x * e2x + e2y * e2y || 1));
  let a, b, c, d, e, f;
  const dist = Math.sqrt(Math.min((a = p0x - e0x * t0) * a + (b = p0y - e0y * t0) * b, (c = p1x - e1x * t1) * c + (d = p1y - e1y * t1) * d, (e = p2x - e2x * t2) * e + (f = p2y - e2y * t2) * f));
  const s = Math.sign(e0x * e2y - e0y * e2x);
  return -dist * Math.sign(Math.min(s * (p0x * e0y - p0y * e0x), s * (p1x * e1y - p1y * e1x), s * (p2x * e2y - p2y * e2x)));
}

/** Pull towards each edge's colour by distance from the edge centres, normalised to luminance 1. */
function deployTint(leds, i, tint) {
  const amount = clamp01(tint?.amount ?? 1);
  const radius = Math.max(tint?.radius ?? 1, 1);
  const power = Math.max(tint?.power ?? 1, 1e-3);
  const red = tint?.edgeRedLinear ?? DEFAULT_RED, green = tint?.edgeGreenLinear ?? DEFAULT_GREEN, blue = tint?.edgeBlueLinear ?? DEFAULT_BLUE;
  const o = 8 * i;
  const x = leds.data[o] ?? 0, y = leds.data[o + 1] ?? 0;
  const [c0, c1, c2] = leds.deployEdgeCenters;
  const sharp = 1 / Math.max(tint?.edgeOverlap ?? 1, 0.01);
  const fall = (cx, cy) => (1 / (1 + Math.hypot(x - cx, y - cy) / radius)) ** power;
  const w0 = fall(c0.x, c0.y) ** sharp, w1 = fall(c1.x, c1.y) ** sharp, w2 = fall(c2.x, c2.y) ** sharp;
  const sum = Math.max(w0 + w1 + w2, 1e-4);
  let r = (red.r * w0 + green.r * w1 + blue.r * w2) / sum;
  let g = (red.g * w0 + green.g * w1 + blue.g * w2) / sum;
  let b = (red.b * w0 + green.b * w1 + blue.b * w2) / sum;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum > 1e-4) { const k = 1 / lum; r *= k; g *= k; b *= k; }
  return { r: lerp(1, r, amount), g: lerp(1, g, amount), b: lerp(1, b, amount) };
}

/**
 * Advance the LEDs to `time` (seconds). Port of vercel.com's per-frame LED update, for the two modes
 * the homepage uses (lines; edge while a nav item is hovered).
 */
export function updateLeds(leds, time, tunables, hero, hoverDeploy, brush, theme = "dark", drop) {
  let modeChanged = false;
  const first = leds.lastFrameTime === undefined;
  const dt = first ? 0 : Math.max(0, Math.min(time - leds.lastFrameTime, 0.1));
  leds.lastFrameTime = time;
  // the LED clock runs up to 10x faster while the colours switch on or off
  const clockDt = dt * (1 + 9 * Math.sin(clamp01(hoverDeploy?.factor ?? 0) * Math.PI));
  if (first) leds.animationClock = ANIMATION_CLOCK_START;
  leds.animationClock += clockDt;
  leds.startupElapsed += dt;
  const clock = leds.animationClock;
  const edgeIndex = Number.isFinite(hero.edgeIndex) ? Math.max(0, Math.min(2, Math.round(hero.edgeIndex))) : 0;
  const edgeChanged = hero.mode === MODES.edge && leds.lastEdgeIndex !== undefined && edgeIndex !== leds.lastEdgeIndex;
  const isNewMode = leds.lastMode === undefined || hero.mode !== leds.lastMode;
  if (leds.lastMode === undefined) {
    leds.lastMode = hero.mode;
    leds.lastEdgeIndex = edgeIndex;
    leds.transitionActive = false;
  } else if (hero.mode !== leds.lastMode || edgeChanged) {
    modeChanged = true;
    leds.currentState.set(leds.data);
    leds.transitionStart = time;
    leds.transitionDuration = Math.max(0, hero.transitionDuration);
    leds.transitionActive = leds.transitionDuration > 0;
    leds.lastMode = hero.mode;
    leds.lastEdgeIndex = edgeIndex;
  }
  if (isNewMode && hero.mode === MODES.lines) leds.lineCenters.set(LINE_START);

  if (hero.mode === MODES.edge) {
    const lit = theme === "light" ? clamp01(hoverDeploy?.factor ?? 0) : 0;
    const base = clamp01(0.125 * tunables.brightnessMin * (1 - 0.8 * lit));
    const high = clamp01(hero.edgeHighlightBrightness * (1 + 2 * lit));
    const from = edgeIndex * LEDS_PER_SIDE, to = from + LEDS_PER_SIDE;
    for (let i = 0; i < LED_COUNT; i++) setLed(leds.targetState, i, i >= from && i < to ? high : base, 1, 1, 1);
  } else {
    linesTarget(leds, leds.targetState, clock, clockDt);
  }

  // near the triangle (outside it) the lines fade out over ~0.3 s, so the pointer glow reads clearly
  const fades = hero.mode === MODES.lines && (brush?.linesFadeDistance ?? 0) > 0;
  let fade = 0;
  if (fades) {
    let want = 0;
    if (brush?.active === true && brush.isMouse === true && brush.inside !== true) {
      const reach = (brush.linesFadeDistance ?? 0) * leds.triangleHeight;
      const d = triangleDistance(brush.x, brush.y, leds.triangleVertices);
      if (!leds.hoverActive && d < reach) leds.hoverActive = true;
      else if (leds.hoverActive && d > 1.2 * reach) leds.hoverActive = false;
      want = leds.hoverActive ? 1 : 0;
    } else leds.hoverActive = false;
    if (leds.hoverTransition > 1e-4 || want > 0) leds.hoverTransition += (want - leds.hoverTransition) * (1 - Math.exp(-dt / 0.3));
    if ((fade = clamp01(leds.hoverTransition)) > 1e-4) {
      const keep = 1 - fade;
      for (let i = 0; i < LED_COUNT; i++) leds.targetState[8 * i + 2] *= keep;
    }
  } else if (leds.hoverTransition !== 0 || leds.hoverActive) {
    leds.hoverTransition = 0;
    leds.hoverActive = false;
  }

  // mode changes cross-fade with an ease-in over transitionDuration (0.25 s)
  let progress = 1, eased = 1;
  if (leds.transitionActive) {
    progress = clamp01((time - leds.transitionStart) / leds.transitionDuration);
    const p = clamp01(progress);
    eased = p * p;
    mixInto(leds.data, leds.currentState, leds.targetState, eased);
    if (progress >= 1) leds.transitionActive = false;
  } else leds.data.set(leds.targetState);

  // colour tint (its amount is 0 in the light theme, where the floor shader does the colour)
  const deploy = clamp01(hoverDeploy?.factor ?? 0);
  if (deploy > 0) {
    leds.deployingState.set(leds.data);
    for (let i = 0; i < LED_COUNT; i++) {
      const c = deployTint(leds, i, hoverDeploy?.tint);
      const o = 8 * i;
      leds.deployingState[o + 4] = c.r; leds.deployingState[o + 5] = c.g; leds.deployingState[o + 6] = c.b;
    }
    mixInto(leds.data, leds.data, leds.deployingState, deploy);
  }

  // a file dragged over the page: three segments chase round the edges over a half-lit base
  const dropFactor = clamp01(drop?.factor ?? 0);
  if (dropFactor > 1e-4) {
    const state = leds.dropActiveState;
    state.set(leds.data);
    const phase = Number.isFinite(drop?.phase) ? Math.max(0, drop.phase) : 0;
    const boost = clamp01(drop?.boost ?? 0);
    const base = clamp01(lerp(DROP_BASE_MIN, DROP_BASE_MAX, boost));
    const count = Math.max(1, Math.floor(DROP_SEGMENTS));
    const spacing = LED_COUNT / count;
    const half = Math.max(1e-3, Math.min(0.5 * spacing, DROP_SEGMENT_HALF * remap(boost, 0, 1, 1, DROP_SEGMENT_GROW)));
    const core = Math.max(0, Math.min(half, DROP_SEGMENT_CORE));
    const soft = Math.max(1e-3, half - core);
    for (let i = 0; i < LED_COUNT; i++) {
      let v = 0;
      for (let k = 0; k < count; k++) {
        const speed = DROP_SEGMENT_SPEEDS[k % DROP_SEGMENT_SPEEDS.length] ?? 1;
        const d = Math.abs(ringDelta(i, wrap(k * spacing + phase * DROP_SEGMENT_SPEED * speed), LED_COUNT));
        v = Math.max(v, d <= core ? 1 : clamp01(1 - (d - core) / soft));
      }
      state[8 * i + 2] = clamp01(base + (1 - base) * v);
    }
    mixInto(leds.data, leds.data, state, dropFactor);
  }

  // pointer glow: LEDs within glowRadius that face the pointer light up, smoothed over glowSmoothing
  // (0.23 s); while the lines run it is scaled by their fade, so it shows near the triangle only
  const glowScale = fades ? fade : 1;
  const strength = brush?.glowStrength ?? 0;
  const radius = brush?.glowRadius ?? 0;
  const glowing = brush?.active === true && brush.isMouse === true && brush.glowEnabled === true && strength > 0 && radius > 0;
  if (glowing || leds.glowDecaying) {
    const smoothing = brush?.glowSmoothing ?? 0;
    const k = smoothing > 0 ? 1 - Math.exp(-dt / smoothing) : 1;
    const px = brush?.x ?? 0, py = brush?.y ?? 0;
    const facing = brush?.glowFacingEnabled === true;
    const full = Math.cos(((brush?.glowFacingFullDeg ?? 90) * Math.PI) / 180);
    const zero = Math.cos(((brush?.glowFacingZeroDeg ?? 100) * Math.PI) / 180);
    const span = full - zero;
    let any = false;
    for (let i = 0; i < LED_COUNT; i++) {
      const o = 8 * i;
      let want = 0;
      if (glowing) {
        const dx = (leds.data[o] ?? 0) - px, dy = (leds.data[o + 1] ?? 0) - py;
        const d = Math.hypot(dx, dy);
        want = strength * (1 - smoothstep(0, radius, d));
        if (facing && want > 0 && d > 1e-4) {
          const f = (leds.normals[2 * i] ?? 0) * (-dx / d) + (leds.normals[2 * i + 1] ?? 0) * (-dy / d);
          want *= span > 1e-6 ? clamp01((f - zero) / span) : +(f >= full);
        }
      }
      const g = (leds.glowState[i] ?? 0) + (want - (leds.glowState[i] ?? 0)) * k;
      leds.glowState[i] = g;
      if (g > 1e-4) {
        any = true;
        const v = g * glowScale;
        if (v > 1e-4) leds.data[o + 2] = lerp(leds.data[o + 2] ?? 0, 1, v);
      }
    }
    leds.glowDecaying = glowing || any;
  }
  return { mode: hero.mode, modeChanged, progress, easedProgress: eased, active: leds.transitionActive };
}

// ---------- emitter mesh: one quad per LED and a split cap in each corner ----------
const basis = (angle) => {
  const dir = { x: Math.cos(angle), y: Math.sin(angle) };
  return { dir, normal: { x: -dir.y, y: dir.x } };
};
const offset = (p, d, k) => ({ x: p.x + d.x * k, y: p.y + d.y * k, n: k });
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const farther = (a, b, from) => (dist2(a, from) >= dist2(b, from) ? a : b);
function intersect(p, d, q, e) {
  const den = d.x * e.y - d.y * e.x;
  if (Math.abs(den) < 1e-6) return undefined;
  const s = ((q.x - p.x) * e.y - (q.y - p.y) * e.x) / den;
  return { x: p.x + d.x * s, y: p.y + d.y * s };
}
/** Vertices (x, y, local t, local n, LED index, 0) of the LED emitter triangles. */
export function ledVertices(sim, expand) {
  const layout = ledLayout(sim, LEDS_PER_SIDE);
  const { tangentHalfLength: half, normalHalfThickness: thick } = layout.ledShape;
  const ht = half + expand, hn = thick + expand;
  const out = [];
  const push = (i, x, y, t, n) => out.push(x, y, t, n, i, 0);
  const quad = (i, c, dir, nor, t0, t1, n0, n1) => {
    const k = [{ t: t0, n: n0 }, { t: t1, n: n0 }, { t: t1, n: n1 }, { t: t0, n: n1 }];
    for (const j of [0, 1, 2, 0, 2, 3]) {
      const v = k[j];
      push(i, c.x + dir.x * v.t + nor.x * v.n, c.y + dir.y * v.t + nor.y * v.n, v.t, v.n);
    }
  };
  for (const [i, p] of layout.positions.entries()) {
    const b = basis(p.angle ?? 0);
    quad(i, p, b.dir, b.normal, -ht, ht, -hn, hn);
  }
  const corners = [layout.geometry.top, layout.geometry.left, layout.geometry.right];
  for (let e = 0; e < 3; e++) {
    const prevIdx = ((e + 2) % 3) * LEDS_PER_SIDE + LEDS_PER_SIDE - 1;
    const nextIdx = e * LEDS_PER_SIDE;
    const prev = layout.positions[prevIdx], next = layout.positions[nextIdx], corner = corners[e];
    if (!prev || !next || !corner) continue;
    const pb = basis(prev.angle ?? 0), nb = basis(next.angle ?? 0);
    const end = { x: prev.x + pb.dir.x * ht, y: prev.y + pb.dir.y * ht };
    const start = { x: next.x - nb.dir.x * ht, y: next.y - nb.dir.y * ht };
    let bx = end.x + start.x - 2 * corner.x, by = end.y + start.y - 2 * corner.y;
    const bl = Math.hypot(bx, by);
    if (bl <= 0) { bx = 0; by = 0; } else { bx /= bl; by /= bl; }
    const tip = { x: corner.x + bx * (layout.ledShape.cornerTrim + ht), y: corner.y + by * (layout.ledShape.cornerTrim + ht) };
    const s = farther(offset(end, pb.normal, -hn), offset(end, pb.normal, hn), start);
    const f = farther(offset(start, nb.normal, -hn), offset(start, nb.normal, hn), end);
    const w = intersect(s, pb.dir, f, nb.dir) ?? corner;
    push(prevIdx, w.x, w.y, half, 0); push(prevIdx, s.x, s.y, ht, s.n); push(prevIdx, tip.x, tip.y, half, 0);
    push(nextIdx, w.x, w.y, -half, 0); push(nextIdx, tip.x, tip.y, -half, 0); push(nextIdx, f.x, f.y, -ht, f.n);
  }
  return new Float32Array(out);
}
