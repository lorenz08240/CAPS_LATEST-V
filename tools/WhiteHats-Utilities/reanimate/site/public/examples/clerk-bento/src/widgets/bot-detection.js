// clerk.com "Bot Detection" card (BotDetection, module 647283), rebuilt without React/Motion.
//
// While the card is hovered, an async loop runs passes of ~2.3 s:
//   fade  (1.0 s)  radar discs dim to 0.2 and the 8 grey dots fade out; --color tweens grey → cyan (0.3 s)
//   scan  (1.3 s)  the dots jump to the other of two layouts and fade back in row by row (delays 0/.1/.2/.3 s),
//                  the discs re-brighten from the centre out (stagger 0.1 s), the crosshair + ring and the beam
//                  swing to a random dot of the new layout (0.8 s, cubic-bezier(.7,0,.3,1)), the cyan dot blinks
//                  out and reappears on the target
//   lock-on        1 s into the scan: crosshair radius 7 → 10.5 with its four gaps closing (0.3 s), hold 0.4 s,
//                  back (0.3 s); it overlaps the next pass's fade
// Hover-out does not interrupt: the current pass finishes its scan, waits for its lock-on, then --color tweens
// back to grey (0.3 s). Nothing is reset: dots, crosshair and beam stay on the last layout and target, and the
// layout alternation carries over to the next hover.
// Random: the target, Math.floor(8 * Math.random()), one call per pass, as on clerk.com.
//
// clerk.com runs this with Motion's useAnimate sequences. `animate()` below re-implements the parts of Motion
// they use, so the sequences are copied verbatim from clerk.com's source:
//   - createAnimationsFromSequence: `at` ("<", "+0.4", "-0.6"), per-value transitions, default duration 0.3 s and
//     ease "easeOut", function delays (stagger), `null` = current value, one keyframe track per element and value
//     spanning the whole sequence, "easeInOut" filler before a value's first segment;
//   - opacity/transform of HTML elements run as Web Animations (fill both, per-keyframe easing); everything else
//     (the <svg> beam's transform, the --color variable, top/left, the crosshair's motion values) from JS on each
//     animation frame, sampled in whole ms like Motion's JS animations;
//   - keyframes are resolved on the next animation frame and the animation is backdated to its creation time
//     (Motion: `startTime = createdAt`, unless resolving took > 40 ms);
//   - Web Animations commit their last keyframe to the inline style on `finish` and are cancelled; a sequence's
//     promise resolves when all its animations have finished;
//   - colours mix in squared RGB, strings with numbers mix number by number (5 decimals), values whose
//     keyframes are all equal are set at once.

// [x offset from the centre (px), top (px), fade-in delay (s)] for the 8 dots, two layouts
const SCENES = [
  [[-2, 64, 0], [52, 81, 0.1], [-68, 68, 0.1], [102, 79, 0.2], [39, 122, 0.2], [-52, 117, 0.2], [-20, 159, 0.3], [-105, 121, 0.3]],
  [[-42, 48, 0], [30, 57, 0], [70, 66, 0.1], [-21, 94, 0.1], [-78, 102, 0.2], [71, 107, 0.2], [-54, 151, 0.3], [43, 154, 0.3]],
];
const GREY = "#747686";
const CYAN = "#5DE3FF";

// ---------- easing (Motion's) ----------

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
  if (x1 === y1 && x2 === y2) return (t) => t;
  return (t) => (t === 0 || t === 1 ? t : calc(tForX(t), y1, y2));
}
const NAMED = { easeOut: [0, 0, 0.58, 1], easeInOut: [0.42, 0, 0.58, 1], linear: [0, 0, 1, 1] };
const NATIVE = { easeOut: "ease-out", easeInOut: "ease-in-out", linear: "linear" };
const easeCache = new Map();
function easeFn(e) {
  const b = Array.isArray(e) ? e : NAMED[e] || NAMED.easeOut;
  const key = b.join();
  if (!easeCache.has(key)) easeCache.set(key, cubicBezier(...b));
  return easeCache.get(key);
}
const easeCss = (e) => (Array.isArray(e) ? `cubic-bezier(${e.join(", ")})` : NATIVE[e] || "ease-out");
const isEasingArray = (e) => Array.isArray(e) && typeof e[0] !== "number";

// Motion's stagger(duration) with from: 0
const stagger = (step) => (i) => step * i;

// ---------- value mixing (Motion's mixers) ----------

const sanitize = (v) => Math.round(v * 1e5) / 1e5;
const clamp = (lo, hi, v) => Math.min(hi, Math.max(lo, v));
const NUM = /-?(?:\d+(?:\.\d+)?|\.\d+)/g;

function parseColor(s) {
  if (typeof s !== "string") return null;
  s = s.trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1);
  }
  m = /^rgba?\(([^)]*)\)$/i.exec(s);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  return null;
}
const sqMix = (a, b, p) => { const e = p * (b * b - a * a) + a * a; return e < 0 ? 0 : Math.sqrt(e); };

function mixer(a, b) {
  if (typeof a === "number" && typeof b === "number") return (p) => a + (b - a) * p;
  const ca = parseColor(a), cb = parseColor(b);
  if (ca && cb) {
    return (p) => {
      const c = [sqMix(ca[0], cb[0], p), sqMix(ca[1], cb[1], p), sqMix(ca[2], cb[2], p), ca[3] + (cb[3] - ca[3]) * p];
      return `rgba(${Math.round(clamp(0, 255, c[0]))}, ${Math.round(clamp(0, 255, c[1]))}, ${Math.round(clamp(0, 255, c[2]))}, ${sanitize(clamp(0, 1, c[3]))})`;
    };
  }
  // complex strings ("rotate(0.3rad)"): same template → number by number, otherwise switch at once
  const sa = String(a), sb = String(b);
  const na = sa.match(NUM) || [], nb = sb.match(NUM) || [];
  const parts = sb.split(NUM);
  if (na.length && na.length === nb.length && sa.split(NUM).join("|") === parts.join("|")) {
    return (p) => parts.reduce((out, s, i) => out + s + (i < nb.length ? sanitize(+na[i] + (+nb[i] - +na[i]) * p) : ""), "");
  }
  return (p) => (p > 0 ? b : a);
}

// Motion's interpolate(times, values, { ease: [...] }) with clamping
function interpolate(input, output, eases) {
  if (output.length === 2 && output[0] === output[1]) return () => output[1];
  const mixers = [];
  for (let i = 0; i < output.length - 1; i++) {
    const mix = mixer(output[i], output[i + 1]), ease = easeFn(eases[i] || "easeOut");
    mixers.push((p) => mix(ease(p)));
  }
  const zeroRange = input[0] === input[1];
  return (v) => {
    v = clamp(input[0], input[input.length - 1], v);
    if (zeroRange && v < input[0]) return output[0];
    let i = 0;
    if (mixers.length > 1) for (; i < input.length - 2; i++) if (v < input[i + 1]) break;
    const d = input[i + 1] - input[i];
    return mixers[i](d === 0 ? 1 : (v - input[i]) / d);
  };
}

// ---------- motion values and per-element values ----------

class MotionValue {
  constructor(v) { this.v = v; this.anim = null; this.subs = new Set(); }
  get() { return this.v; }
  set(v) { this.v = v; for (const f of this.subs) f(v); }
  current() { return this.v; }
}

// Motion keeps one MotionValue per element and style key; the first read comes from the computed style
const slots = new WeakMap();
function slotFor(el, key) {
  let m = slots.get(el);
  if (!m) slots.set(el, (m = new Map()));
  let s = m.get(key);
  if (!s) {
    s = new MotionValue(undefined);
    s.current = function () {
      if (this.v === undefined) {
        const cs = getComputedStyle(el);
        this.v = (key.startsWith("--") ? cs.getPropertyValue(key) : cs[key]).trim() || 0;
      }
      return this.v;
    };
    s.set = function (v) {
      this.v = v;
      if (key.startsWith("--")) el.style.setProperty(key, v);
      else el.style[key] = v;
    };
    m.set(key, s);
  }
  return s;
}

// ---------- animations ----------

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const MAX_RESOLVE_DELAY = 40;
const toResolve = new Set();
const ticking = new Set();
let rafId = 0;
const schedule = () => { if (!rafId) rafId = requestAnimationFrame(frame); };
const timelineNow = () => document.timeline.currentTime ?? performance.now();

class Anim {
  // def: { el?, key, value (MotionValue or slot), keyframes, times, ease[], duration (s), delay (s) }
  constructor(def, createdAt) {
    Object.assign(this, def);
    this.createdAt = createdAt;
    this.state = "pending";
    this.finished = new Promise((r) => (this.resolveFinished = r));
    this.waapi = !!(def.el && def.el instanceof HTMLElement && (def.key === "opacity" || def.key === "transform"));
  }
  resolve(now) {
    if (this.state !== "pending") return;
    const value = this.value;
    const kf = this.keyframes.slice();
    if (kf[0] === null) kf[0] = value.current();
    for (let i = 1; i < kf.length; i++) if (kf[i] === null) kf[i] = kf[i - 1];
    // a "none" transform animates from the target's template with zeros ("rotate(0rad)")
    if (this.key === "transform" && kf[0] === "none") kf[0] = String(kf.find((v) => v !== "none") || "none").replace(NUM, "0");
    const startTime = now - this.createdAt > MAX_RESOLVE_DELAY ? now : this.createdAt;
    const final = kf[kf.length - 1];
    let dur = this.duration * 1000, delay = this.delay * 1000;
    if (reduceMotion.matches) dur = delay = 0;
    if (dur === 0 || kf.every((v) => v === kf[0])) {
      // not animatable or instant: set the final value now
      value.set(final);
      this.finish();
      return;
    }
    if (this.waapi) {
      const frames = kf.map((v, i) => ({ [this.key]: String(v), offset: this.times[i], easing: easeCss(this.ease[i % this.ease.length]) }));
      const wa = this.el.animate(frames, { duration: dur, delay, easing: "linear", fill: "both" });
      // Motion: animation.startTime = createdAt. If the timeline it is set against is not the one
      // document.timeline reports (a recorder's virtual clock), express it as elapsed time instead.
      wa.startTime = startTime;
      const elapsed = timelineNow() - startTime;
      if (wa.currentTime === null || Math.abs(wa.currentTime - elapsed) > 50) wa.currentTime = Math.max(0, elapsed);
      const onfinish = () => {
        if (this.state !== "running" || this.wa !== wa) return;
        value.set(final); // commit the last keyframe, then drop the animation (as Motion does)
        wa.cancel();
        this.finish();
      };
      // Motion continues on the `finish` event, which Chromium dispatches with the next rendered frame. A
      // recorder that advances page time without rendering (a virtual clock between screenshots) would hold the
      // loop until something renders; carry on after 3 animation frames without it. In a browser the event
      // always comes first: it is dispatched in the same frame as `finished` resolves.
      wa.onfinish = onfinish;
      wa.finished.then(() => {
        let n = 0;
        const check = () => { if (this.state === "running" && this.wa === wa) { if (++n < 3) requestAnimationFrame(check); else onfinish(); } };
        requestAnimationFrame(check);
      }, () => {});
      this.wa = wa;
      this.state = "running";
    } else {
      this.sample = interpolate(this.times.map((t) => t * dur), kf, this.ease);
      this.start = startTime;
      this.dur = dur;
      this.delayMs = delay;
      this.final = final;
      this.state = "running";
      ticking.add(this);
    }
  }
  tick(now) {
    const t = Math.round(now - this.start) - this.delayMs;
    if (t >= this.dur) {
      this.value.set(this.final);
      ticking.delete(this);
      this.finish();
    } else {
      this.value.set(this.sample(Math.max(0, t)));
    }
  }
  finish() {
    this.state = "finished";
    if (this.value.anim === this) this.value.anim = null;
    this.resolveFinished();
  }
  // interrupted by a newer animation of the same value: keep the value where it is
  stop() {
    if (this.state === "pending") toResolve.delete(this);
    if (this.state === "running") {
      if (this.wa) {
        try { this.wa.commitStyles(); } catch {}
        this.wa.onfinish = null;
        this.wa.cancel();
        this.value.v = this.el.style[this.key];
      } else {
        ticking.delete(this);
      }
    }
    this.state = "stopped";
    if (this.value.anim === this) this.value.anim = null;
  }
}

function frame() {
  rafId = 0;
  const now = performance.now();
  const pending = [...toResolve];
  toResolve.clear();
  for (const a of pending) a.resolve(now);
  for (const a of ticking) a.tick(now);
  for (const f of afterFrame) f();
  if (ticking.size || toResolve.size) schedule();
}
const afterFrame = new Set();

function defaultOffsets(n) {
  const o = [0];
  for (let i = 1; i < n; i++) o.push(i / (n - 1));
  return o;
}
function calcAt(current, at, prev) {
  if (typeof at === "number") return at;
  if (at.startsWith("-") || at.startsWith("+")) return Math.max(0, current + parseFloat(at));
  if (at === "<") return prev;
  return current;
}

// Motion's animate(sequence, { delay }) for [MotionValue | Element[], keyframes, transition] segments
function animate(sequence, { delay: seqDelay = 0 } = {}) {
  const defaultDuration = 0.3;
  const tracks = new Map(); // value → { el, key, entries }
  let current = 0, prev = 0, total = 0;
  for (const [subject, keyframes, transition = {}] of sequence) {
    if (transition.at !== undefined) current = calcAt(current, transition.at, prev);
    let maxDuration = 0;
    const add = (valueKeyframes, valueTransition, track, index, count) => {
      const list = [].concat(valueKeyframes);
      const { delay = 0, times = defaultOffsets(list.length), ease = "easeOut" } = valueTransition;
      const d = typeof delay === "function" ? delay(index, count) : delay;
      const duration = valueTransition.duration ?? defaultDuration;
      const start = current + d;
      if (times.length === 1 && times[0] === 0) times[1] = 1;
      if (list.length === 1) list.unshift(null);
      const end = start + duration;
      const entries = track.entries;
      for (let i = 0; i < entries.length; i++) if (entries[i].at > start && entries[i].at < end) entries.splice(i--, 1);
      for (let i = 0; i < list.length; i++) {
        entries.push({ value: list[i], at: start + (end - start) * times[i], easing: isEasingArray(ease) ? ease[i % ease.length] : ease });
      }
      maxDuration = Math.max(d + duration, maxDuration);
      total = Math.max(end, total);
    };
    const trackOf = (value, el, key) => {
      if (!tracks.has(value)) tracks.set(value, { el, key, entries: [] });
      return tracks.get(value);
    };
    if (subject instanceof MotionValue) {
      add(keyframes, transition, trackOf(subject, null, "default"), 0, 1);
    } else {
      const els = Array.isArray(subject) ? subject : [subject];
      els.forEach((el, i) => {
        for (const key of Object.keys(keyframes)) {
          const t = transition[key] ? { ...transition, ...transition[key] } : { ...transition };
          add(keyframes[key], t, trackOf(slotFor(el, key), el, key), i, els.length);
        }
      });
    }
    prev = current;
    current += maxDuration;
  }

  const createdAt = performance.now();
  const anims = [];
  for (const [value, { el, key, entries }] of tracks) {
    entries.sort((a, b) => (a.at !== b.at ? a.at - b.at : a.value === null ? 1 : b.value === null ? -1 : 0));
    const keyframes = [], times = [], ease = [];
    for (const e of entries) {
      keyframes.push(e.value);
      times.push(total ? e.at / total : 0);
      ease.push(e.easing || "easeOut");
    }
    if (times[0] !== 0) { times.unshift(0); keyframes.unshift(keyframes[0]); ease.unshift("easeInOut"); }
    if (times[times.length - 1] !== 1) { times.push(1); keyframes.push(null); }
    const a = new Anim({ el, key, value, keyframes, times, ease, duration: total, delay: seqDelay }, createdAt);
    if (value.anim) value.anim.stop(); // MotionValue.start() stops the running animation at once
    value.anim = a;
    anims.push(a);
    toResolve.add(a);
  }
  schedule();
  return Promise.all(anims.map((a) => a.finished));
}

// ---------- mount ----------

export function mount(slot, card) {
  const root = slot.querySelector(".bd-root");
  const $$ = (s) => [...root.querySelectorAll(s)];
  const circle = root.querySelector("[data-crosshair] circle");

  // crosshair: r = j, gap = y, strokeDasharray = `${g} ${y}` ×4 with g = 2πj/4 − y, strokeDashoffset = −y/2
  const j = new MotionValue(7);
  const y = new MotionValue(2);
  let dirty = false;
  j.subs.add(() => (dirty = true));
  y.subs.add(() => (dirty = true));
  afterFrame.add(() => {
    if (!dirty || !circle.isConnected) return;
    dirty = false;
    const r = j.get(), gap = y.get();
    const g = (2 * Math.PI * r) / 4 - gap;
    circle.setAttribute("r", String(r));
    circle.setAttribute("stroke-dasharray", `${g} ${gap} ${g} ${gap} ${g} ${gap} ${g} ${gap}`);
    circle.setAttribute("stroke-dashoffset", String(-(gap / 2)));
  });

  let k = 0; // layout index; the first pass uses layout 1, then they alternate (kept across hovers)
  let wanted = false; // hovered
  let running = false; // a pass is in progress

  // clerk.com's loop, verbatim apart from selectors → elements
  async function pass() {
    running = true;
    k++;
    if (k >= SCENES.length) k = 0;
    const r = SCENES[k][Math.floor(8 * Math.random())];
    const a = animate([
      [$$("[data-radar]"), { opacity: 0.2 }, { duration: 1 }],
      [$$("[data-dot]"), { opacity: 0 }, { duration: 1, at: "<" }],
    ]);
    animate([[root, { "--color": CYAN }]]);
    await a;
    const t = animate([
      ...Array.from({ length: 8 }, (_, i) => [
        $$(`[data-dot="${i}"]`),
        { top: `${SCENES[k][i][1] / 16}rem`, left: `calc(50% + ${SCENES[k][i][0] / 16}rem)`, opacity: 1 },
        { top: { duration: 0 }, left: { duration: 0 }, duration: 1, at: "<", delay: SCENES[k][i][2] },
      ]),
      [$$("[data-radar]"), { opacity: 1 }, { at: "<", duration: 1, delay: stagger(0.1) }],
      [$$("[data-transform]"), { transform: `translate(${r[0] / 16}rem, ${r[1] / 16}rem)` }, { at: "<", duration: 0.8, ease: [0.7, 0, 0.3, 1] }],
      [$$("[data-spotlight]"), { transform: `rotate(${-Math.atan(r[0] / (r[1] + 76))}rad)` }, { at: "<", duration: 0.8, ease: [0.7, 0, 0.3, 1] }],
      [$$("[data-active-dot]"), { opacity: 0 }, { at: "-0.6", duration: 0.15 }],
      [$$("[data-active-dot]"), { transform: `translate(${r[0] / 16}rem, ${r[1] / 16}rem)` }, { duration: 0.01 }],
      [$$("[data-active-dot]"), { opacity: 1 }, { at: "+0.2", duration: 0.15 }],
    ]);
    const i = animate([[j, 10.5], [y, 0, { at: "<" }], [j, 7, { at: "+0.4" }], [y, 2, { at: "<" }]], { delay: 1 });
    await t;
    if (wanted && !reduceMotion.matches) {
      pass();
    } else {
      running = false;
      await i;
      if (!wanted) animate([[root, { "--color": GREY }]]);
    }
  }

  // Hover as react-aria's useHover on the card root: pointerenter/leave, touch ignored.
  let hovered = false;
  const set = (on) => {
    if (on === hovered) return;
    hovered = on;
    if (on) {
      wanted = true;
      if (!running) pass();
    } else {
      wanted = false;
      // reduced motion (an addition): one instant pass per hover, so the grey has to come back here
      if (reduceMotion.matches && !running) animate([[root, { "--color": GREY }]]);
    }
  };
  card.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") set(true); });
  card.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") set(false); });
}
