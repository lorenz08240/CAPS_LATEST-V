// API Keys card (clerk.com module 844723, "ApiKeys"), without Motion for React.
//
// On hover of the card: the laptop sinks (y −50 → −30 px before its 1.3 scale, 0.4 s) and its lid swings open
// (rotateX −75° → 20°, 1 s), the screen darkens and the avatar + progress track fade in (0.7 s after 0.45 s); the
// progress bar fills to 0.95rem over 2.2 s; four purple→cyan light streaks run along the circuit lines, laptop → pill
// at 0.2 s, then pill → each server at 0.75 / 0.8 / 0.85 s, every 2 s (src/shared/meteor.js); the spinner in the
// "Authenticating..." pill turns (one turn per 2 s) and its text turns white; and the 144 lights of the server rack
// (108 dots, 36 bars) blink at random. On hover-out every value goes back with clerk.com's "rest" transitions, the
// lights go dark, the spinner turns back to 0° (0.5 s) and the streaks fade out (0.3 s) and are removed. The lid's
// dark cover, glass sheen and the pill text are CSS :hover transitions (api-keys.css), as clerk.com's group-hover.
//
// The lights (clerk.com components `c` and `u`): each one draws four random constants once, in a React useState
// initialiser, in DOM order (per server: 36 dots, then 12 bars):
//   dot: duration .3+.1r s, blinkDurationMs .3i+200r, intervalMs .3i+3500r, firstDelayMs 1800r
//   bar: duration .5+.1r s, blinkDurationMs 1050+200r, intervalMs .3i+500+1500r, firstDelayMs 1600r
// (r = Math.random(), i = index in its group; the .3i ms terms are clerk.com's). While hovered each light runs
// wait firstDelayMs → lit → wait blinkDurationMs → unlit → wait intervalMs → lit …; hover-out clears its timer and
// unlights it. Lit = fill #5DE3FF at opacity 1 (unlit #131316 at .5), tweened over `duration` with clerk.com's soft
// easeInOutExpo, plus a cyan drop-shadow filter that switches at once. Same Math.random sequence, same blinking.
// clerk.com draws the constants at page load (hydration); here they are drawn at the first hover, which is
// indistinguishable (they are fixed per page load either way) and lets a capture pin Math.random beforehand.
//
// How clerk.com runs each value, reproduced here so that frames match:
// - transform (the lid) and opacity (glare, screen): Motion hands them to WAAPI, function easings sampled into CSS
//   linear() (one point per 10 ms); on finish the end value is written to the style. Hover-in animations are
//   back-dated to the pointer event (Motion sets animation.startTime).
// - y, rotateX, width, background and the lights' SVG fill: Motion's JS loop, one value per animation frame, timed
//   from the change (the pointer event, or a light's state change; Motion back-dates them) and drawn from the next
//   frame; the spinner's rotate starts on the frame after its mouseenter/leave. Colours mixed as sqrt(a²(1−p)+b²p)
//   per channel; at the end the target is written as given (lights: "var(--brand-secondary, #5DE3FF)" / 1,
//   "#131316" / 0.5).
// - The glare has no `initial` on clerk.com, so after page load it turns 0° → 90° (its rest transition) once.
// - Motion defaults: a transition without `ease` uses easeOut = cubic-bezier(0,0,.58,1); one with only a delay uses
//   the default tween (0.3 s, cubic-bezier(.25,.1,.35,1)). clerk.com's `o.H` / `o.u` here are Motion's easeInOut
//   cubic-bezier(.42,0,.58,1) / easeOut, `x.H` (lights) is its soft easeInOutExpo.
// - The streaks mount on the frame after the pointer event (their clock starts on the frame after that); the
//   lights' timers start at the pointer event; on hover-out the WAAPI values, the streaks' fade and the lights
//   going dark start on the next frame. Interrupted animations continue from their current value.
// Timing measured on clerk.com with virtual-clock captures: .reanimate/clerk-bento/api-keys/ (spec.md).
// - The spinner follows mouseenter/mouseleave (clerk.com's separate isPointerOver state), the rest follows
//   pointerenter/pointerleave with touch ignored (react-aria useHover).

import { createMeteor } from "../shared/meteor.js";

// ---------- easings ----------
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
const easeInOut = cubicBezier(0.42, 0, 0.58, 1); // clerk.com o.H (Motion's easeInOut)
const easeOut = cubicBezier(0, 0, 0.58, 1); // clerk.com o.u, and Motion's default "easeOut"
const easeDefault = cubicBezier(0.25, 0.1, 0.35, 1); // Motion's default tween
const easeExpoH = (t) => (t < 0.5 ? 0.5 * Math.pow(2, 16 * t - 8) : -0.5 * Math.pow(2, -16 * t + 8) + 1); // clerk.com x.H
const linear = (t) => t;
// Motion's generateLinearEasing: max(round(duration / 10), 2) points, 4 decimals
function linearEasing(fn, duration) {
  const n = Math.max(Math.round(duration / 10), 2);
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(Math.round(1e4 * fn(i / (n - 1))) / 1e4);
  return `linear(${pts.join(", ")})`;
}
// named easings go to WAAPI as CSS keywords, functions as linear()
const EASE_OUT_NAMED = { fn: easeOut, css: "ease-out" };

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
  animate(to, { duration, delay = 0, ease = EASE_OUT_NAMED, startTime }) {
    const from = this.current();
    this.anim?.cancel();
    const e = typeof ease === "function" ? { fn: ease, css: linearEasing(ease, duration) } : ease;
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

// ---------- values driven per animation frame (Motion's JS path) ----------
const jsValues = new Set();
let ticking = false;
function tick() {
  const now = performance.now();
  for (const v of jsValues) v.step(now);
  ticking = jsValues.size > 0;
  if (ticking) requestAnimationFrame(tick);
}
function startTicking() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(tick);
  }
}
// `mix(from, to, p)` interpolates; `apply(value, done)` renders (done: the tween has ended, Motion then writes the
// target itself, not the eased value). repeat: Motion's repeat: Infinity (each run from → to).
class JsValue {
  constructor(value, mix, apply) {
    Object.assign(this, { value, mix, apply, tween: null });
  }
  // the value at time `now` (an interrupted tween is sampled at the moment of the interruption, as Motion does)
  valueAt(now) {
    const tw = this.tween;
    if (!tw || tw.repeat) return this.value;
    const t = now - tw.start - tw.delay;
    if (t <= 0) return tw.from; // Motion holds the first keyframe until the delay has passed
    const p = Math.min(1, t / tw.duration);
    return p >= 1 ? tw.to : this.mix(tw.from, tw.to, tw.ease(p));
  }
  // start: the tween's time origin (default now); it is first rendered on the next animation frame
  animate(to, { duration, delay = 0, ease = easeOut, repeat = false, start = performance.now(), from = this.valueAt(start) }) {
    this.tween = { from, to, duration, delay, ease, repeat, start };
    jsValues.add(this);
    startTicking();
  }
  step(now) {
    const tw = this.tween;
    if (!tw) return jsValues.delete(this);
    const t = now - tw.start - tw.delay;
    let p;
    if (tw.repeat) {
      p = t <= 0 ? 0 : (t % tw.duration) / tw.duration;
      if (p === 0 && t > 0) p = 1;
    } else p = Math.min(1, Math.max(0, t / tw.duration));
    const done = !tw.repeat && p >= 1;
    this.value = done ? tw.to : t < 0 ? tw.from : this.mix(tw.from, tw.to, tw.ease(p));
    this.apply(this.value, done);
    if (done) {
      this.tween = null;
      jsValues.delete(this);
    }
  }
}
const mixNumber = (a, b, p) => a + (b - a) * p;
// Motion's mixColor for opaque colours: sqrt mix per channel, rendered "rgba(r, g, b, 1)"
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixRgb = (a, b, p) => a.map((c, i) => Math.sqrt(Math.max(0, p * (b[i] * b[i] - c * c) + c * c)));
const rgbString = (c) => `rgba(${c.map((v) => Math.round(Math.max(0, Math.min(255, v)))).join(", ")}, 1)`;

// ---------- the circuit lines (paths in the 410 × 91 box) and their streaks ----------
const PATH_LAPTOP = "M161 27.2506L43.1043 27.2506L31.6449 27.2506L0 27.2506";
const PATH_TOP =
  "M289 23.5L349.401 23.5C352.085 23.5 354.59 22.1543 356.071 19.9166L366.555 4.08336C368.037 1.84567 370.542 0.499992 373.225 0.499992L394.599 0.49999";
const PATH_MIDDLE =
  "M289 27.5L334.757 27.5C337.408 27.5 339.887 28.8132 341.376 31.0065L352.23 46.9935C353.719 49.1868 356.198 50.5 358.848 50.5L393.599 50.5";
const PATH_BOTTOM =
  "M289 31.5L321.643 31.5C324.278 31.5 326.745 32.798 328.237 34.9703L363.999 87.0297C365.491 89.202 367.957 90.5 370.593 90.5L375 90.5";
const STREAKS = [
  { path: PATH_LAPTOP, delay: 200, direction: "reverse" }, // laptop → pill
  { path: PATH_TOP, delay: 750 }, // pill → top server
  { path: PATH_MIDDLE, delay: 800 }, // pill → middle server
  { path: PATH_BOTTOM, delay: 850 }, // pill → bottom server
];

// ---------- server lights ----------
const LIT_ATTR = "var(--brand-secondary, #5DE3FF)"; // clerk.com's lit colour; the variable is not defined
const UNLIT_ATTR = "#131316";
const LIT = hexRgb("#5DE3FF");
const UNLIT = hexRgb(UNLIT_ATTR);

class Light {
  constructor(el, index, kind) {
    Object.assign(this, { el, index, kind, k: null, lit: false, timer: 0 });
    // at the end of a tween Motion writes the target as given (clerk.com: the CSS variable string, 1 / 0.5)
    this.fill = new JsValue(UNLIT, mixRgb, (c, done) =>
      el.setAttribute("fill", done ? (c === LIT ? LIT_ATTR : UNLIT_ATTR) : rgbString(c)),
    );
    this.opacity = new JsValue(0.5, mixNumber, (v) => el.setAttribute("fill-opacity", String(v)));
  }
  // clerk.com's useState initialisers (same formulas, same order of Math.random calls)
  draw() {
    const i = this.index;
    this.k =
      this.kind === "dot"
        ? {
            duration: 0.3 + 0.1 * Math.random(),
            blinkDurationMs: 0.3 * i + 200 * Math.random(),
            intervalMs: 0.3 * i + 3500 * Math.random(),
            firstDelayMs: 1800 * Math.random(),
          }
        : {
            duration: 0.5 + 0.1 * Math.random(),
            blinkDurationMs: 1050 + 200 * Math.random(),
            intervalMs: 0.3 * i + 500 + 1500 * Math.random(),
            firstDelayMs: 1600 * Math.random(),
          };
  }
  setLit(lit) {
    if (lit === this.lit) return;
    this.lit = lit;
    // the glow filter is a plain attribute on clerk.com: it switches at once; fill and opacity are tweened by Motion
    if (lit) this.el.setAttribute("filter", "url(#ak-glow)");
    else this.el.removeAttribute("filter");
    // Motion's tween is timed from the state change (it resolves the CSS-variable colour on the next frame and
    // back-dates the start), first drawn on the next frame; an interrupted tween continues from its value now
    const now = performance.now();
    const t = { duration: this.k.duration * 1000, ease: easeExpoH, start: now };
    this.fill.animate(lit ? LIT : UNLIT, { ...t, from: this.fill.valueAt(now) });
    this.opacity.animate(lit ? 1 : 0.5, { ...t, from: this.opacity.valueAt(now) });
  }
  start() {
    const { k } = this;
    const run = () => {
      this.setLit(true);
      this.timer = setTimeout(() => {
        this.setLit(false);
        this.timer = setTimeout(run, k.intervalMs);
      }, k.blinkDurationMs);
    };
    this.timer = setTimeout(run, k.firstDelayMs);
  }
  stop() {
    clearTimeout(this.timer);
  }
}
export function mount(slot, card) {
  const $ = (s) => slot.querySelector(s);
  const laptop = $(".ak-laptop");
  const lid = $(".ak-lid");
  const glare = $(".ak-glare");
  const screen = $(".ak-screen");
  const bar = $(".ak-bar");
  const spinnerEl = $(".ak-spinner");
  const meteorBoxes = [...slot.querySelectorAll(".ak-meteor")];
  // DOM order = clerk.com's render order (server, server_2, server_3; dots then bars in each)
  const lights = [...slot.querySelectorAll(".ak-leds")].flatMap((g) =>
    [...g.children].map((el, i) => new Light(el, i, g.classList.contains("ak-leds--dots") ? "dot" : "bar")),
  );

  const cs = getComputedStyle(lid);
  const screenOn = hexRgb(cs.getPropertyValue("--ak-screen-on-color").trim() || "#5e5f6e"); // gray-600
  const screenOff = hexRgb(cs.getPropertyValue("--ak-screen-off-color").trim() || "#212126"); // gray-900

  // rest values (clerk.com's SSR / post-hydration inline styles)
  const laptopY = new JsValue(-50, mixNumber, (v) => (laptop.style.transform = v === 0 ? "none" : `translateY(${v}px)`));
  const lidRot = new WaapiValue(lid, "transform", -75, (v) => `rotateX(${v}deg) translateX(-50%)`);
  const lidBg = new JsValue(screenOn, mixRgb, (c, done) => {
    lid.style.background = done ? `var(--ak-screen-${c === screenOff ? "off" : "on"}-color)` : rgbString(c);
  });
  const glareRot = new JsValue(0, mixNumber, (v) => (glare.style.transform = v === 0 ? "none" : `rotateX(${v}deg)`));
  const glareOpacity = new WaapiValue(glare, "opacity", 1, String);
  const screenOpacity = new WaapiValue(screen, "opacity", 0, String);
  const barWidth = new JsValue(0, mixNumber, (v) => (bar.style.width = `${v}rem`));
  const spinner = new JsValue(0, mixNumber, (v) => (spinnerEl.style.transform = v === 0 ? "none" : `rotate(${v}deg)`));

  // the glare has no `initial` on clerk.com: after hydration it turns 0° → 90° with its rest transition
  // (measured on clerk.com: easeOut, 2 s after 0.4 s, from the first frame)
  glareRot.animate(90, { duration: 2000, delay: 400, ease: easeOut });

  // Motion's WAAPI values (transform, opacity); startTime: the time origin (hover-in: back-dated to the event)
  function animateWaapi(hovered, startTime) {
    if (hovered) {
      lidRot.animate(20, { duration: 1000, ease: easeInOut, startTime });
      glareOpacity.animate(0, { duration: 1000, startTime }); // {duration:1} → "easeOut"
      screenOpacity.animate(1, { duration: 700, delay: 450, ease: easeOut, startTime });
    } else {
      lidRot.animate(-75, { duration: 1000, ease: easeInOut, startTime });
      glareOpacity.animate(1, { duration: 2000, delay: 400, ease: easeOut, startTime }); // dropped key → rest transition
      screenOpacity.animate(0, { duration: 250, ease: easeOut, startTime });
    }
  }
  // Motion's JS-driven values (frame loop), timed from the pointer event, first drawn on the next frame
  function animateJs(hovered, start) {
    laptopY.animate(hovered ? -30 : -50, { duration: 400, ease: easeOut, start });
    if (hovered) {
      lidBg.animate(screenOff, { duration: 500, start }); // {duration:.5} → easeOut
      glareRot.animate(0, { duration: 1000, start }); // {duration:1} → easeOut
      barWidth.animate(0.95, { duration: 2200, ease: easeInOut, start });
    } else {
      lidBg.animate(screenOn, { duration: 300, delay: 300, ease: easeDefault, start }); // {delay:.3} → default tween
      glareRot.animate(90, { duration: 2000, delay: 400, ease: easeOut, start });
      barWidth.animate(0, { duration: 200, start }); // {duration:.2} → easeOut
    }
  }

  // ---------- hover ----------
  // react-aria useHover on the card (pointerenter/leave, touch ignored) drives everything but the spinner, which
  // follows clerk.com's separate isPointerOver state (mouseenter/leave). Timing measured on clerk.com
  // (virtual-clock captures, see .reanimate/clerk-bento/api-keys/): the JS values are timed from the pointer
  // event both ways, the WAAPI values from the event on hover-in and from the next frame on hover-out; the
  // lights' timers start at the event; the spinner, the streaks and the lights going dark follow on the next frame.
  let hovered = false;
  let pointerOver = false;
  let spinOn = false;
  let streaksOn = false;
  let darken = false;
  let pending = false;
  let meteors = [];
  let drawn = false;
  let waapiOn = false;
  const sync = () => {
    pending = false;
    const now = performance.now();
    if (!hovered && waapiOn) {
      waapiOn = false;
      animateWaapi(false, now);
    }
    if (pointerOver !== spinOn) {
      spinOn = pointerOver;
      if (spinOn) spinner.animate(360, { duration: 2000, ease: linear, repeat: true });
      else spinner.animate(0, { duration: 500, ease: easeOut });
    }
    if (darken) {
      darken = false;
      for (const l of lights) l.setLit(false);
    }
    if (hovered !== streaksOn) {
      streaksOn = hovered;
      if (hovered) {
        // AnimatePresence: mount the streaks, or revive the ones still fading out (their clocks continue)
        if (meteors.length && meteors[0].el.isConnected) {
          for (const m of meteors) if (m.exiting) m.revive();
        } else {
          meteors = STREAKS.map((s, i) =>
            createMeteor(meteorBoxes[i], {
              stops: "dark",
              meteors: [{ width: 410, height: 91, path: s.path, delay: s.delay, repeat: 2000, direction: s.direction }],
            }),
          );
        }
      } else for (const m of meteors) m.exit();
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
    const now = performance.now();
    if (!waapiOn) {
      waapiOn = true;
      animateWaapi(true, now);
    }
    animateJs(true, now);
    // the lights' random constants: drawn once, at the first hover (clerk.com: at page load)
    if (!drawn) {
      drawn = true;
      for (const l of lights) l.draw();
    }
    for (const l of lights) l.start();
    schedule();
  });
  card.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "touch" || !hovered) return;
    hovered = false;
    animateJs(false, performance.now());
    for (const l of lights) l.stop();
    darken = true;
    schedule();
  });
  card.addEventListener("mouseenter", () => {
    pointerOver = true;
    schedule();
  });
  card.addEventListener("mouseleave", () => {
    pointerOver = false;
    schedule();
  });
}
