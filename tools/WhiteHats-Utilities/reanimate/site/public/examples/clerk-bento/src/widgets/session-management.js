// Session Management card (clerk.com module 956494), without Motion for React.
//
// On hover of the card: the laptop lid swings open (rotateX -75° → 20°, 1 s, clerk.com's soft easeInOutExpo "H"),
// the screen darkens and the Clerk logo fades in, the Device/Browser/Location labels slide left (0.6 s, staggered
// 0/50/100 ms) while the values un-blur, and a purple→cyan meteor runs along the circuit track every 2 s
// (src/shared/meteor.js). On hover-out every value returns with clerk.com's "rest" transitions and the meteor fades
// out (0.3 s) and is removed. The screen dimmer, glass sheen and button are CSS :hover transitions
// (session-management.css), as clerk.com's Tailwind group-hover classes.
//
// How clerk.com runs each value, reproduced here so that frames match:
// - transform / opacity / filter: Motion hands them to WAAPI, with function easings sampled into CSS linear()
//   (one point per 10 ms); on finish the end value is written to the style.
// - background (a colour, resolved from a CSS variable) and the glare's rotateX: Motion's JS loop, one value per
//   animation frame, colours mixed as sqrt(a²(1−p)+b²p) per channel.
// - A transition without `ease` uses Motion's default "easeOut" = cubic-bezier(0,0,.58,1); one with only a delay
//   uses Motion's default tween (0.3 s, cubic-bezier(.25,.1,.35,1)).
// - Timing, measured on clerk.com (virtual-clock captures, see .reanimate/clerk-bento/session-management/):
//   on hover-in the WAAPI animations are back-dated to the pointer event (Motion sets animation.startTime), the
//   JS-driven values start on the next frame, and the meteor mounts on the next frame (React runs its effect
//   after paint) so its clock starts one frame later still; on hover-out everything starts on the next frame.
// Interrupted animations continue from their current value, as Motion does.

import { createMeteor } from "../shared/meteor.js";

// ---------- easings (clerk.com module 275921, Motion defaults) ----------
const easeH = (t) => (t < 0.5 ? 0.5 * Math.pow(2, 16 * t - 8) : -0.5 * Math.pow(2, -16 * t + 8) + 1);
const easeU = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
function cubicBezier(x1, y1, x2, y2) {
  const bez = (t, a, b) => (((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t + 3 * a) * t;
  return (x) => {
    if (x <= 0 || x >= 1) return x <= 0 ? 0 : 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 24; i++) {
      t = (lo + hi) / 2;
      if (bez(t, x1, x2) < x) lo = t;
      else hi = t;
    }
    return bez(t, y1, y2);
  };
}
const EASE_OUT = { fn: cubicBezier(0, 0, 0.58, 1), css: "ease-out" }; // Motion's WAAPI default
const EASE_DEFAULT = { fn: cubicBezier(0.25, 0.1, 0.35, 1), css: "cubic-bezier(0.25, 0.1, 0.35, 1)" }; // Motion's default tween
// Motion's generateLinearEasing: max(round(duration / 10), 2) points, 4 decimals
function linearEasing(fn, duration) {
  const n = Math.max(Math.round(duration / 10), 2);
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(Math.round(1e4 * fn(i / (n - 1))) / 1e4);
  return `linear(${pts.join(", ")})`;
}
const waapiEase = (ease, duration) =>
  typeof ease === "function" ? { fn: ease, css: linearEasing(ease, duration) } : ease;

// ---------- a numeric value rendered into one CSS property through WAAPI (Motion's accelerated path) ----------
class WaapiValue {
  constructor(el, prop, value, render) {
    Object.assign(this, { el, prop, value, render, anim: null, opts: null, from: value, to: value });
  }
  current() {
    const { anim, opts } = this;
    if (!anim) return this.value;
    const local = anim.currentTime ?? 0;
    const p = Math.min(1, Math.max(0, (local - opts.delay) / opts.duration));
    return this.from + (this.to - this.from) * opts.ease.fn(p);
  }
  animate(to, { duration, delay = 0, ease = EASE_OUT, startTime }) {
    const from = this.current();
    this.anim?.cancel();
    const e = waapiEase(ease, duration);
    const anim = this.el.animate(
      { [this.prop]: [this.render(from), this.render(to)] },
      { duration, delay, easing: e.css, fill: "both" },
    );
    if (startTime != null) anim.startTime = startTime; // Motion back-dates to the state change
    Object.assign(this, { anim, from, to, value: from, opts: { duration, delay, ease: e } });
    anim.onfinish = () => {
      if (this.anim !== anim) return;
      this.el.style[this.prop] = this.render(to);
      this.value = to;
      this.anim = null;
      anim.cancel();
    };
  }
}

// ---------- a value driven per animation frame (Motion's JS path) ----------
const jsValues = new Set();
let ticking = false;
function tick() {
  const now = performance.now();
  for (const v of jsValues) v.step(now);
  ticking = jsValues.size > 0;
  if (ticking) requestAnimationFrame(tick);
}
class JsValue {
  constructor(value, mix, apply) {
    Object.assign(this, { value, mix, apply, tween: null });
  }
  animate(to, { duration, delay = 0, ease = EASE_OUT.fn }) {
    this.tween = { from: this.value, to, duration, delay, ease, start: performance.now() };
    jsValues.add(this);
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }
  step(now) {
    const tw = this.tween;
    if (!tw) return jsValues.delete(this);
    const p = Math.min(1, Math.max(0, (now - tw.start - tw.delay) / tw.duration));
    this.value = this.mix(tw.from, tw.to, tw.ease(p));
    this.apply(this.value);
    if (p >= 1) {
      this.tween = null;
      jsValues.delete(this);
    }
  }
}

// Motion's mixColor for two opaque hex colours ("rgba(r, g, b, 1)" output)
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixRgb = (a, b, p) => a.map((c, i) => Math.sqrt(Math.max(0, p * (b[i] * b[i] - c * c) + c * c)));
const rgbString = (c) => `rgba(${c.map((v) => Math.round(Math.max(0, Math.min(255, v)))).join(", ")}, 1)`;

const TRACK_PATH =
  "M0 86h136.686a8 8 0 0 0 5.657-2.343l80.314-80.314A8 8 0 0 1 228.314 1h143.372a8 8 0 0 1 5.657 2.343l80.314 80.314A8 8 0 0 0 463.314 86H600";

export function mount(slot, card) {
  const $ = (s) => slot.querySelector(s);
  const lid = $(".sm-lid");
  const glare = $(".sm-glare");
  const icon = $(".sm-icon");
  const track = $(".sm-track");
  const labels = [...slot.querySelectorAll(".sm-label")];
  const valuesEls = [...slot.querySelectorAll(".sm-value")];

  const cs = getComputedStyle(lid);
  const screenOn = hexRgb(cs.getPropertyValue("--sm-screen-on-color").trim() || "#5e5f6e"); // gray-600
  const screenOff = hexRgb(cs.getPropertyValue("--sm-screen-off-color").trim() || "#212126"); // gray-900

  // rest values (clerk.com's SSR inline styles)
  const lidRot = new WaapiValue(lid, "transform", -75, (v) => `rotateX(${v}deg) translateX(-50%)`);
  const lidBg = new JsValue(screenOn, mixRgb, (c) => (lid.style.background = rgbString(c)));
  const glareRot = new JsValue(90, (a, b, p) => a + (b - a) * p, (v) => {
    glare.style.transform = parseFloat(v) === 0 ? "none" : `rotateX(${v}deg)`;
  });
  const glareOpacity = new WaapiValue(glare, "opacity", 1, String);
  const iconOpacity = new WaapiValue(icon, "opacity", 0, String);
  const LABEL_X = [5.45, 5.25, 5.15]; // rem
  const labelX = labels.map((el, i) => new WaapiValue(el, "transform", LABEL_X[i], (v) => `translateX(${v}rem)`));
  const valueBlur = valuesEls.map((el) => new WaapiValue(el, "filter", 8, (v) => `blur(${v}px)`));
  const valueOpacity = valuesEls.map((el) => new WaapiValue(el, "opacity", 0, String));

  // the glare has no `initial` on clerk.com: after hydration it turns 0° → 90° with its rest transition
  glare.style.transform = "none";
  glareRot.value = 0;
  glareRot.animate(90, { duration: 2000, delay: 400, ease: easeU });

  // Motion's WAAPI values (transform, opacity, filter). startTime: Motion back-dates hover-in animations to their
  // creation (animation.startTime = createdAt).
  function animateWaapi(hovered, startTime) {
    if (hovered) {
      lidRot.animate(20, { duration: 1000, ease: easeH, startTime });
      glareOpacity.animate(0, { duration: 1000, startTime }); // {duration:1} → ease-out
      iconOpacity.animate(1, { duration: 2000, delay: 500, ease: easeU, startTime });
      labelX.forEach((v, i) => v.animate(0, { duration: 600, delay: 50 * i, ease: easeH, startTime }));
      valuesEls.forEach((_, i) => {
        const t = { duration: 600, delay: 200 + 50 * i, startTime }; // ease-out
        valueBlur[i].animate(0, t);
        valueOpacity[i].animate(1, t);
      });
    } else {
      lidRot.animate(-75, { duration: 1000, ease: easeH });
      glareOpacity.animate(1, { duration: 2000, delay: 400, ease: easeU });
      iconOpacity.animate(0, { duration: 500, delay: 250, ease: easeU });
      labelX.forEach((v, i) => v.animate(LABEL_X[i], { duration: 600, delay: 50 * i, ease: easeH }));
      valuesEls.forEach((_, i) => {
        const t = { duration: 1000, delay: i === 2 ? 200 : 0, ease: easeU };
        valueBlur[i].animate(8, t);
        valueOpacity[i].animate(0, t);
      });
    }
  }
  // Motion's JS-driven values (frame loop)
  function animateJs(hovered) {
    if (hovered) {
      lidBg.animate(screenOff, { duration: 500 }); // {duration:.5} → Motion's default ease, easeOut
      glareRot.animate(0, { duration: 1000 }); // {duration:1} → easeOut
    } else {
      lidBg.animate(screenOn, { duration: 300, delay: 300, ease: EASE_DEFAULT.fn }); // {delay:.3} → default tween
      glareRot.animate(90, { duration: 2000, delay: 400, ease: easeU });
    }
  }

  // ---------- hover (react-aria useHover on the card root: pointerenter/leave, touch ignored) ----------
  // Timing as measured on clerk.com: on hover-in the WAAPI animations start with the pointer event, the JS values
  // and the meteor on the next frame (React runs the meteor's effect after paint, so its clock starts one frame
  // later still); on hover-out everything starts on the next frame.
  let hovered = false;
  let waapiOn = false;
  let jsOn = false;
  let pending = false;
  let meteor = null;
  const sync = () => {
    pending = false;
    if (hovered) {
      if (jsOn) return;
      jsOn = true;
      // AnimatePresence: mount the meteor, or revive the one still fading out (its clock continues)
      if (meteor?.el.isConnected) {
        if (meteor.exiting) meteor.revive();
      } else {
        meteor = createMeteor(track, {
          stops: "dark",
          meteors: [{ width: 600, height: 87, path: TRACK_PATH, repeat: 2000 }],
        });
      }
      animateJs(true);
    } else {
      if (waapiOn) {
        waapiOn = false;
        animateWaapi(false);
      }
      if (jsOn) {
        jsOn = false;
        animateJs(false);
        meteor?.exit();
      }
    }
  };
  const schedule = () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(sync);
    }
  };

  card.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "touch" || hovered) return;
    hovered = true;
    if (!waapiOn) {
      waapiOn = true;
      animateWaapi(true, performance.now());
    }
    schedule();
  });
  card.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "touch" || !hovered) return;
    hovered = false;
    schedule();
  });
}
