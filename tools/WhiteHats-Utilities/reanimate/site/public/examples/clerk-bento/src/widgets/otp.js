// clerk.com "Email and SMS one-time passcodes" (EmailSMS, module 127528): hover motion without React/Motion.
//
// clerk.com drives this card with Motion for React: declarative `animate` targets that switch with the card's
// hover state. Motion runs transform / opacity / filter as Web Animations (WAAPI) and everything else
// (colours, box-shadows, SVG attributes) from JS on each animation frame. This file does the same, with the
// same durations, easings, spring, colour mixing and value formats, so the frames match:
//
//   element            hover-in                                         hover-out
//   phone box          translateY(0→-2rem) scale(.98→1), .5s, 1-2^-8t   back, .5s, 1-2^-8t
//   lock badge bg      #131316 → #5DE3FF, .3s cubic-bezier(.25,.1,.35,1) back, same
//   lock badge shadow  1 shadow → 2 shadows: not mixable, snaps          snaps back
//   padlock            highlight paths opacity 0→1, body #747686→#043048, .4s easeOut; back the same
//   notification       spring (bounce .2, .6s) after .2s: translateY(-6.5rem→0) scale(.9→1), opacity .5→1;
//                      blur 2px→0, .6s easeOut after .2s                back, .3s cubic-bezier(.25,.1,.35,1)
//   "1" badge          scale .75→1, bg #FFFFFF40→#5DE3FF, glow none→on, .5s, 1-2^-8t; back the same
//   bottom fade        translateY(0→2rem), .3s cubic-bezier(.25,.1,.35,1); back the same
//
// Plays once on hover and holds; on hover-out every value returns to rest from wherever it is.
// Nothing is random (the passcode is the fixed "764676"). With prefers-reduced-motion: reduce the card switches
// state without motion (an addition: clerk.com animates regardless).

// ---------- easings (Motion's implementations) ----------

// clerk's local ease `l`: a soft expo-out
const expoOut8 = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -8 * t));

// Motion's cubicBezier (binary subdivision, 12 steps)
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
  return (t) => (t === 0 || t === 1 ? t : calc(tForX(t), y1, y2));
}
const MOTION_DEFAULT = [0.25, 0.1, 0.35, 1]; // Motion's default tween for non-transform-shorthand values (.3s)
const EASE_OUT = [0, 0, 0.58, 1]; // Motion's "easeOut", used when a transition only sets a duration
const bezierCss = (b) => `cubic-bezier(${b.join(", ")})`;

// Motion's spring from { duration, bounce } (findSpring + underdamped generator), as an easing over [0, 1].
// With a duration the spring is "resolved from duration": it ends exactly at `duration` and snaps to the target.
function springEase(durationMs, bounce) {
  const zeta = Math.min(1, Math.max(0.05, 1 - bounce));
  const dur = Math.min(10, Math.max(0.01, durationMs / 1000));
  const damped = (w, z) => w * Math.sqrt(1 - z * z);
  const env = (w) => 0.001 - ((w * zeta) / damped(w, zeta)) * Math.exp(-w * zeta * dur);
  const der = (w) => {
    const a = w * zeta * dur, r = zeta * zeta * w * w * dur;
    return (-r * Math.exp(-a) * (-env(w) + 0.001 > 0 ? -1 : 1)) / damped(w * w, zeta);
  };
  let w = 5 / dur;
  for (let i = 1; i < 12; i++) w -= env(w) / der(w);
  const stiffness = w * w, damping = 2 * zeta * Math.sqrt(stiffness);
  const L = damping / (2 * Math.sqrt(stiffness)); // = zeta
  const W = Math.sqrt(stiffness) / 1000; // rad/ms
  const Wd = damped(W, L), O = 100, A = (L * W * O) / Wd;
  const value = (t) => 100 - Math.exp(-L * W * t) * (A * Math.sin(Wd * t) + O * Math.cos(Wd * t));
  return (p) => (p >= 1 ? 1 : value(p * durationMs) / 100);
}

// Motion hands JS easings to WAAPI as linear() sampled every 10ms
function linearEasing(ease, durationMs) {
  const n = Math.max(Math.round(durationMs / 10), 2);
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(Math.round(ease(i / (n - 1)) * 1e4) / 1e4);
  return `linear(${pts.join(", ")})`;
}

const EASE = {
  expo8: { fn: expoOut8, css: (d) => linearEasing(expoOut8, d) },
  default: { fn: cubicBezier(...MOTION_DEFAULT), css: () => bezierCss(MOTION_DEFAULT) },
  easeOut: { fn: cubicBezier(...EASE_OUT), css: () => "ease-out" },
  spring: (() => { const fn = springEase(600, 0.2); return { fn, css: (d) => linearEasing(fn, d) }; })(),
};

// ---------- value mixing (Motion's mixers) ----------

const mixNumbers = (a, b, p) => a.map((v, i) => v + (b[i] - v) * p);
// colours: rgb mixed in squared space, alpha linearly
const sqMix = (a, b, p) => { const e = p * (b * b - a * a) + a * a; return e < 0 ? 0 : Math.sqrt(e); };
const mixColor = (a, b, p) => [sqMix(a[0], b[0], p), sqMix(a[1], b[1], p), sqMix(a[2], b[2], p), a[3] + (b[3] - a[3]) * p];
// values Motion cannot interpolate (different shadow counts) switch on the first frame with progress > 0
const mixSnap = (a, b, p) => (p > 0 ? b : a);

const r5 = (v) => Math.round(v * 1e5) / 1e5;
const clamp = (lo, hi, v) => Math.min(hi, Math.max(lo, v));
const rgba = ([r, g, b, a]) =>
  `rgba(${Math.round(clamp(0, 255, r))}, ${Math.round(clamp(0, 255, g))}, ${Math.round(clamp(0, 255, b))}, ${r5(clamp(0, 1, a))})`;
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), h.length > 7 ? parseInt(h.slice(7, 9), 16) / 255 : 1];

// ---------- a tiny animation engine: one channel per element property ----------
//
// Timing as in Motion, whose animations all count from the moment the hover state changed (Motion sets
// `startTime = createdAt`): Web Animations are created right away and, on the next animation frame, set to
// (frame time − change time) of progress; JS-driven values are applied from that frame on, in whole
// milliseconds since the change, as Motion's JS animations are.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const running = new Set(); // JS-driven channels with an active tween
const resync = new Set(); // Web Animations created since the last frame
let rafId = 0;

function tick() {
  rafId = 0;
  const now = performance.now();
  for (const ch of resync) {
    const a = ch.anim;
    // backdate through currentTime rather than startTime: same result in a browser, and it still holds when a
    // recorder virtualises performance.now() but not the native animation timeline
    if (a && a.wa) a.wa.currentTime = Math.max(0, now - a.start);
  }
  resync.clear();
  for (const ch of running) {
    ch.apply(ch.valueAt(now));
    if (ch.done(now)) { ch.cur = ch.anim.to; ch.anim = null; running.delete(ch); }
  }
  if (running.size) rafId = requestAnimationFrame(tick);
}
const schedule = () => { if (!rafId) rafId = requestAnimationFrame(tick); };

class Channel {
  // waapi: [element, CSS property] animated with element.animate(); otherwise `apply(value)` runs every frame
  constructor({ rest, mix = mixNumbers, format, waapi, apply }) {
    this.cur = rest; this.mix = mix; this.format = format; this.waapi = waapi; this.applyFn = apply;
    this.anim = null;
  }
  elapsed(now) {
    const a = this.anim;
    return (a.wa ? now - a.start : Math.round(now - a.start)) - a.delay;
  }
  progress(now) {
    const t = this.elapsed(now), a = this.anim;
    if (t <= 0) return 0;
    if (t >= a.dur) return 1;
    return a.ease.fn(t / a.dur);
  }
  valueAt(now) { return this.anim ? this.mix(this.anim.from, this.anim.to, this.progress(now)) : this.cur; }
  done(now) { return !this.anim.wa && this.elapsed(now) >= this.anim.dur; }
  apply(v) { this.applyFn(this.format(v)); }
  // tween from the current value to `target`, counting from `t0` (the hover change, i.e. now)
  to(target, { dur, delay = 0, ease }, t0) {
    const from = this.valueAt(t0);
    this.stop();
    if (reduceMotion.matches) { dur = 0; delay = 0; }
    if (dur <= 0) {
      this.cur = target;
      if (this.waapi) this.waapi[0].style[this.waapi[1]] = this.format(target); else this.apply(target);
      return;
    }
    const anim = (this.anim = { from, to: target, start: t0, delay, dur, ease, wa: null });
    if (this.waapi) {
      const [el, prop] = this.waapi;
      const wa = el.animate([{ [prop]: this.format(from) }, { [prop]: this.format(target) }],
        { duration: dur, delay, easing: ease.css(dur), fill: "both" });
      anim.wa = wa;
      wa.onfinish = () => {
        if (this.anim !== anim) return;
        el.style[prop] = this.format(target); // commit the end value, then drop the animation (as Motion does)
        wa.cancel();
        this.cur = target; this.anim = null;
      };
      resync.add(this);
    } else {
      running.add(this);
    }
    schedule();
  }
  stop() {
    if (!this.anim) return;
    if (this.anim.wa) { this.anim.wa.onfinish = null; this.anim.wa.cancel(); }
    running.delete(this);
    resync.delete(this);
    this.anim = null;
  }
}

// ---------- mount ----------

export function mount(slot, card) {
  const $ = (s) => slot.querySelector(s);
  const box = $(".otp-box"), lock = $(".otp-lock"), notif = $(".otp-notif"), badge = $(".otp-badge"), fade = $(".otp-fade");
  const lockPaths = [1, 2, 3, 4].map((i) => $(`[data-otp-lock-path="${i}"]`));
  const setStyle = (el, prop) => (v) => { el.style[prop] = v; };
  const setAttr = (els, name) => (v) => { for (const el of els) el.setAttribute(name, v); };

  const LOCK_SHADOW_REST = "0 1px rgb(255 255 255 / 0.05)";
  const GLOW = "0 0 8px 1px rgb(107 231 255 / 0.3), 0 1px rgb(255 255 255 / 0.2) inset";

  const ch = {
    box: new Channel({ rest: [0, 0.98], waapi: [box, "transform"], format: ([y, s]) => `translateY(${r5(y)}rem) scale(${r5(s)})` }),
    lockBg: new Channel({ rest: hex("#131316"), mix: mixColor, format: rgba, apply: setStyle(lock, "backgroundColor") }),
    lockShadow: new Channel({ rest: LOCK_SHADOW_REST, mix: mixSnap, format: (v) => v, apply: setStyle(lock, "boxShadow") }),
    lockHi: new Channel({ rest: [0], format: ([o]) => String(r5(o)), apply: setAttr(lockPaths.slice(0, 2), "opacity") }),
    lockFill: new Channel({ rest: hex("#747686"), mix: mixColor, format: rgba, apply: setAttr(lockPaths.slice(2), "fill") }),
    notif: new Channel({ rest: [-6.5, 0.9], waapi: [notif, "transform"], format: ([y, s]) => `translateY(${r5(y)}rem) scale(${r5(s)})` }),
    notifOpacity: new Channel({ rest: [0.5], waapi: [notif, "opacity"], format: ([o]) => String(r5(o)) }),
    notifBlur: new Channel({ rest: [2], waapi: [notif, "filter"], format: ([b]) => `blur(${r5(b)}px)` }),
    badge: new Channel({ rest: [0.75], waapi: [badge, "transform"], format: ([s]) => `scale(${r5(s)})` }),
    badgeBg: new Channel({ rest: hex("#FFFFFF40"), mix: mixColor, format: rgba, apply: setStyle(badge, "background") }),
    // from "none", Motion animates from the target with every number at 0 and every colour transparent
    badgeGlow: new Channel({
      rest: [0, 0, 0, 0, 0],
      format: ([blur, spread, a1, y, a2]) =>
        `0 0 ${r5(blur)}px ${r5(spread)}px rgba(107, 231, 255, ${r5(a1)}), 0 ${r5(y)}px rgba(255, 255, 255, ${r5(a2)}) inset`,
      apply: setStyle(badge, "boxShadow"),
    }),
    fade: new Channel({ rest: [0], waapi: [fade, "transform"], format: ([y]) => `translateY(${r5(y)}rem)` }),
  };
  badge.style.boxShadow = "none";

  const DEFAULT = { dur: 300, ease: EASE.default };
  const show = (t0) => {
    ch.box.to([-2, 1], { dur: 500, ease: EASE.expo8 }, t0);
    ch.lockBg.to(hex("#5DE3FF"), DEFAULT, t0);
    ch.lockShadow.to(GLOW, DEFAULT, t0);
    ch.lockHi.to([1], { dur: 400, ease: EASE.easeOut }, t0);
    ch.lockFill.to(hex("#043048"), { dur: 400, ease: EASE.easeOut }, t0);
    ch.notif.to([0, 1], { dur: 600, delay: 200, ease: EASE.spring }, t0);
    ch.notifOpacity.to([1], { dur: 600, delay: 200, ease: EASE.spring }, t0);
    ch.notifBlur.to([0], { dur: 600, delay: 200, ease: EASE.easeOut }, t0);
    ch.badge.to([1], { dur: 500, ease: EASE.expo8 }, t0);
    ch.badgeBg.to(hex("#5DE3FF"), { dur: 500, ease: EASE.expo8 }, t0);
    ch.badgeGlow.to([8, 1, 0.3, 1, 0.2], { dur: 500, ease: EASE.expo8 }, t0);
    ch.fade.to([2], DEFAULT, t0);
  };
  const hide = (t0) => {
    ch.box.to([0, 0.98], { dur: 500, ease: EASE.expo8 }, t0);
    ch.lockBg.to(hex("#131316"), DEFAULT, t0);
    ch.lockShadow.to(LOCK_SHADOW_REST, DEFAULT, t0);
    ch.lockHi.to([0], { dur: 400, ease: EASE.easeOut }, t0);
    ch.lockFill.to(hex("#747686"), { dur: 400, ease: EASE.easeOut }, t0);
    ch.notif.to([-6.5, 0.9], DEFAULT, t0);
    ch.notifOpacity.to([0.5], DEFAULT, t0);
    ch.notifBlur.to([2], DEFAULT, t0);
    ch.badge.to([0.75], { dur: 500, ease: EASE.expo8 }, t0);
    ch.badgeBg.to(hex("#FFFFFF40"), { dur: 500, ease: EASE.expo8 }, t0);
    ch.badgeGlow.to([0, 0, 0, 0, 0], { dur: 500, ease: EASE.expo8 }, t0);
    ch.fade.to([0], DEFAULT, t0);
  };

  // Hover as react-aria's useHover on the card root: pointerenter/leave, touch ignored.
  let hovered = false;
  const set = (on) => {
    if (on === hovered) return;
    hovered = on;
    if (on) show(performance.now()); else hide(performance.now());
  };
  card.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") set(true); });
  card.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") set(false); });
}
