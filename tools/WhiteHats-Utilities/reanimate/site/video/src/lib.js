// Shared helpers for the demo video. Everything on screen is a pure function of the time t (seconds), so
// any frame can be drawn on its own: the renderer seeks to k / FPS and screenshots.

export const W = 1920;
export const H = 1080;
export const FPS = 60;

// The grid the cuts land on: 90 bpm, bar 0 at 2.166 s (the video was first cut to a track at that tempo).
export const BEAT = 60 / 90;
export const T0 = 2.166;
export const beat = (n) => T0 + n * BEAT;
export const bar = (n) => T0 + n * 4 * BEAT;
export const DURATION = 47.5; // bar(17)
// "how it works" (how.js) is timed as if it started at 12.86 s; it plays this much later, after the clones
export const HOW_SHIFT = 16 * BEAT;

export const INK = "#141414";
export const MUTED = "#737373";
export const FAINT = "#b4b4b4";
export const SUBTLE = "#a6a6ad"; // "/reanimate", until the end card turns it to INK
export const ACCENT = "#533afd";

// ---------- maths ----------

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const prog = (t, a, b) => clamp((t - a) / (b - a));

export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u) => ((ax * u + bx) * u + cx) * u;
  const sy = (u) => ((ay * u + by) * u + cy) * u;
  const dx = (u) => (3 * ax * u + 2 * bx) * u + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(u) - x;
      if (Math.abs(e) < 1e-6) break;
      const d = dx(u);
      if (Math.abs(d) < 1e-6) break;
      u -= e / d;
    }
    return sy(clamp(u));
  };
}

export const ease = {
  linear: (x) => x,
  inCubic: (x) => x * x * x,
  outCubic: (x) => 1 - (1 - x) ** 3,
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
  outQuart: (x) => 1 - (1 - x) ** 4,
  outQuint: (x) => 1 - (1 - x) ** 5,
  inOutQuart: (x) => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2),
  outExpo: (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
  inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x) => 1 + 2.4 * (x - 1) ** 3 + 1.4 * (x - 1) ** 2,
  // the curves the site and the Clerk cards use
  expo: bezier(0.16, 1, 0.3, 1),
  soft: bezier(0.45, 0, 0.2, 1),
  inOut: bezier(0.65, 0, 0.35, 1),
};

/** Eased progress of a tween that starts at `a` and lasts `d` seconds. */
export const tw = (t, a, d, e = ease.outCubic) => e(prog(t, a, a + d));

/** Deterministic noise in [0, 1) for an integer seed. */
export function hash(n) {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

// ---------- the blur-and-fade the whole video uses ----------

/**
 * How present something is at t: fades in over [inAt, inAt + inDur], out over [outAt, outAt + outDur].
 * Returns `a` (in progress), `b` (out progress) and `v` (visible amount).
 */
export function presence(t, inAt, inDur = 0.5, outAt = Infinity, outDur = 0.4, eIn = ease.expo, eOut = ease.inOutCubic) {
  const a = eIn(prog(t, inAt, inAt + inDur));
  const b = Number.isFinite(outAt) ? eOut(prog(t, outAt, outAt + outDur)) : 0;
  return { a, b, v: a * (1 - b) };
}

/** Blur-fade an element in and out: rises `dy` px from below on the way in, drifts `dyOut` on the way out. */
export function blurFade(el, t, { inAt, inDur = 0.55, outAt = Infinity, outDur = 0.4, blur = 14, dy = 18, dyOut = -12, s0 = 1, s1 = 1, x = 0, y = 0, s = 1, eIn, eOut } = {}) {
  const { a, b, v } = presence(t, inAt, inDur, outAt, outDur, eIn, eOut);
  put(el, {
    o: v,
    x,
    y: y + (1 - a) * dy + b * dyOut,
    s: s * lerp(s0, 1, a) * lerp(1, s1, b),
    blur: blur * Math.max(1 - a, b),
  });
  return v;
}

// ---------- styles ----------

const f = (n, d = 2) => (Math.abs(n) < 1e-4 ? "0" : n.toFixed(d));

/** Sets opacity, transform and blur in one go, only writing what changed. */
export function put(el, { o = 1, x = 0, y = 0, z = 0, s = 1, sx = 1, sy = 1, rx = 0, ry = 0, rz = 0, blur = 0, raw = "" } = {}) {
  let tr = "";
  if (x || y || z) tr += `translate3d(${f(x)}px,${f(y)}px,${f(z)}px) `;
  if (rx) tr += `rotateX(${f(rx, 3)}deg) `;
  if (ry) tr += `rotateY(${f(ry, 3)}deg) `;
  if (rz) tr += `rotateZ(${f(rz, 3)}deg) `;
  if (s !== 1 || sx !== 1 || sy !== 1) tr += `scale(${f(s * sx, 4)},${f(s * sy, 4)}) `;
  tr += raw;
  const style = el.style;
  const op = o <= 0.002 ? "0" : o >= 0.998 ? "1" : o.toFixed(3);
  if (el._o !== op) {
    style.opacity = op;
    style.visibility = op === "0" ? "hidden" : "";
    el._o = op;
  }
  if (op === "0") return;
  tr = tr.trim() || "none";
  if (el._tr !== tr) style.transform = el._tr = tr;
  const fl = blur > 0.04 ? `blur(${f(blur)}px)` : "none";
  if (el._fl !== fl) style.filter = el._fl = fl;
}

export function setStyle(el, prop, value) {
  const key = "_s_" + prop;
  if (el[key] !== value) {
    el.style.setProperty(prop, value);
    el[key] = value;
  }
}

export function show(el, on) {
  const v = on ? "" : "none";
  if (el._d !== v) el.style.display = el._d = v;
}

export function mix(c1, c2, p) {
  const a = hex(c1), b = hex(c2);
  return `rgb(${Math.round(lerp(a[0], b[0], p))},${Math.round(lerp(a[1], b[1], p))},${Math.round(lerp(a[2], b[2], p))})`;
}
const hexCache = new Map();
function hex(c) {
  let v = hexCache.get(c);
  if (!v) {
    const n = parseInt(c.slice(1), 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    hexCache.set(c, v);
  }
  return v;
}

// ---------- DOM ----------

export function el(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  if (parent) parent.append(e);
  return e;
}

/** Width and height of some text in a given class, laid out off screen. */
export function measure(html, cls) {
  const probe = el("span", cls, document.body, html);
  probe.style.cssText += ";position:absolute;left:-9999px;top:0;white-space:nowrap;visibility:hidden";
  const r = probe.getBoundingClientRect();
  probe.remove();
  return { w: r.width, h: r.height };
}

// ---------- recorded clips ----------

let manifest = {};
export const setManifest = (m) => (manifest = m);
export const clipInfo = (slug) => manifest[slug];

/** Length of a clip in seconds. */
export const clipLen = (slug) => (manifest[slug].frames - 1) / manifest[slug].fps;

/** URL of the frame of `slug` at `lt` seconds into it (held at the ends, or wrapped with loop). */
export function frameUrl(slug, lt, { small = false, loop = false } = {}) {
  const c = manifest[slug];
  let i = Math.round(lt * c.fps);
  i = loop ? ((i % c.frames) + c.frames) % c.frames : clamp(i, 0, c.frames - 1);
  return `clips/${slug}/${small ? "t" : "f"}/${String(i + 1).padStart(4, "0")}.jpg`;
}

// Images whose source changed this frame; the renderer waits for them to decode before the screenshot.
let pending = [];
export function setSrc(img, url) {
  if (img._u === url) return;
  img._u = url;
  img.src = url;
  pending.push(img.decode().catch(() => {}));
}
export async function settleImages() {
  while (pending.length) {
    const p = pending;
    pending = [];
    await Promise.all(p);
  }
}

/** An <img> showing a clip, sized to `w` x `h` CSS px. */
export function clipImg(parent, slug, w, h, cls = "clip") {
  const img = el("img", cls, parent);
  img.decoding = "sync";
  img.draggable = false;
  img.width = w;
  img.height = h;
  img.alt = "";
  img.dataset.slug = slug;
  return img;
}
