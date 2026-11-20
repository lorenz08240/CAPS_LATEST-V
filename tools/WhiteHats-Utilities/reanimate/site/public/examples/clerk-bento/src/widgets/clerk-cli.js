// "Clerk CLI" card (clerk.com module 731855, "MCPServer"), without Motion for React.
//
// Hover the card and the Clerk logo on the round button lights up cyan (0.2 s) while a cyan tint fades in and a
// sheen sweeps the button face; the six AI-tool logos on the ring brighten (opacity .7 → 1). Purple→cyan light
// streaks (src/shared/meteor.js) run from the glass terminal panel along both curves into the button at 0.5 s, and
// from the button into the logo ring at 1.35 s, every 1.5 s. From 1.9 s, and then every 1.35 s, the logos step
// one slot clockwise round the ring (straight 1 s moves, cubic-bezier(.7,0,.3,1)). On hover-out the logo, tint,
// sheen and logo brightness go back (0.2 / 0.3 s), the streaks fade out (0.3 s) and are removed, and the carousel
// stops scheduling: a step in flight finishes and the logos stay where they are (no reset; the next hover goes on
// from there). Nothing is random.
//
// How clerk.com runs each value, reproduced here so that frames match:
// - tint opacity, sheen transform, logo-group opacity, the carousel's transforms, the streaks' exit opacity: Motion
//   hands them to WAAPI (cubic-bezier easings as CSS cubic-bezier()); on finish the end value is written to the
//   style and the animation cancelled. An interrupted value restarts from where it is (sampled with the easing).
// - the active logo group's SVG `opacity` attribute and the `length` motion value (which only switches the cyan
//   paths' opacity on while it is > 0): Motion's JS loop, one value per animation frame.
// - Motion's defaults: a value with no transition (tint, logo group, every hover-out except the icon) gets 0.3 s
//   cubic-bezier(.25,.1,.35,1).
// - Streaks: three <Meteor stops="dark" speed={.35}> canvases (239×105 each), mounted by AnimatePresence while the
//   card is hovered, exit {opacity: 0}. Re-hovering while they fade revives the same instances (and re-renders
//   them: Meteor's effect re-runs, clock kept); after removal a new hover starts a new clock.
// - Carousel: setTimeout(550) → setInterval(1350) while hovered; each tick moves logo r to slot (r + step) % 6
//   (useAnimate sequence, all six at once, created on the next frame and back-dated to the tick). `step`
//   persists across hovers.
// - Timing (checked frame by frame against clerk.com): hover-in tweens start at the pointer event, the streak
//   canvases mount on the next frame (their clock starts on the frame after), hover-out is applied on the next
//   frame with its WAAPI tweens back-dated to the event.
// - Hover: react-aria useHover on the card root (pointerenter/pointerleave, touch ignored).
// With prefers-reduced-motion: reduce, hover switches the cyan state instantly and runs no streaks or carousel.

import { createMeteor } from "../shared/meteor.js";

// ---------- easing (Motion's cubicBezier: binary subdivision, 12 iterations) ----------

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
  const fn = (t) => (t === 0 || t === 1 ? t : calc(tForX(t), y1, y2));
  fn.css = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  return fn;
}
const linear = (t) => t;
linear.css = "linear";

const DEFAULT = { duration: 300, ease: cubicBezier(0.25, 0.1, 0.35, 1) }; // Motion's default tween
const LENGTH_IN = { duration: 750, ease: cubicBezier(0.25, 0.75, 0, 1) };
const ICON = { duration: 200, ease: linear };
const SHEEN_IN = { duration: 500, ease: cubicBezier(0, 0.4, 0.2, 1) };
const STEP = { duration: 1000, ease: cubicBezier(0.7, 0, 0.3, 1) };
const SHEEN_REST = [-4, -4]; // rem

// the carousel's six slots on the ring (px in the 256×248 box), clockwise
const SLOTS = [[142, 13], [145, 125], [68, 161], [-13, 104], [-11, 31], [55, -20]];
const FIRST_STEP = 550; // ms after hover-in: setTimeout(…, 550) then setInterval(next, 1350)
const STEP_EVERY = 1350;

// the three streaks (component `j`): box 239×105, speed .35 px/ms, "dark" stops (purple tail → cyan head)
const TOP_CURVE = "M99 47.46H81.8528C79.3577 47.46 77.0054 46.4821 75.4921 44.8156L37.579 3.06442C36.0657 1.39794 33.7134 0.42 31.2182 0.42H0";
const BOTTOM_CURVE = "M99 57.54H81.8528C79.3577 57.54 77.0054 58.5179 75.4921 60.1844L37.579 101.936C36.0657 103.602 33.7134 104.58 31.2182 104.58H0";
const STREAKS = [
  { box: ".cc-track--m1", path: "M159 52.92H235", delay: 1350, repeat: 1500 }, // button → ring
  { box: ".cc-track--m2", path: TOP_CURVE, delay: 500, repeat: 1500, direction: "reverse" }, // panel → button
  { box: ".cc-track--m3", path: BOTTOM_CURVE, delay: 500, repeat: 1500, direction: "reverse" },
];

const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const lerp = (from, to, p) => from.map((f, i) => f + (to[i] - f) * p);
const same = (a, b) => a.every((v, i) => v === b[i]);

// ---------- WAAPI value (Motion's accelerated opacity / transform) ----------

class WaapiValue {
  constructor(el, prop, format, initial) {
    Object.assign(this, { el, prop, format, v: initial, run: null });
  }
  current() {
    const r = this.run;
    if (!r) return this.v;
    const t = Number(r.anim.currentTime) || 0;
    if (t <= 0) return r.from;
    return lerp(r.from, r.to, r.ease(Math.min(t / r.duration, 1)));
  }
  set(v) {
    this.v = v;
    this.el.style[this.prop] = this.format(v);
  }
  stop() {
    const from = this.current();
    if (this.run) {
      this.run.anim.cancel();
      this.run = null;
    }
    this.set(from);
    return from;
  }
  // `since`: ms the animation is back-dated by (Motion creates it on the next frame, started at the change)
  to(target, { duration, ease }, since = 0) {
    const from = this.stop();
    if (same(from, target) || reducedMotion?.matches) {
      this.set(target);
      return;
    }
    const anim = this.el.animate(
      { [this.prop]: [this.format(from), this.format(target)] },
      { duration, easing: ease.css, fill: "both" },
    );
    if (since > 0) anim.currentTime = Math.min(since, duration);
    const run = { anim, from, to: target, duration, ease };
    this.run = run;
    anim.onfinish = () => {
      if (this.run !== run) return;
      this.run = null;
      this.set(target); // Motion commits the final keyframe to the style and cancels the animation
      anim.cancel();
    };
  }
}

// ---------- JS values on one rAF loop (Motion's frameloop + JSAnimation) ----------

const ticking = new Set();
let rafId = 0;
function tick() {
  const now = performance.now();
  for (const f of [...ticking]) f(now);
  rafId = ticking.size ? requestAnimationFrame(tick) : 0;
}
function onFrame(f) {
  ticking.add(f);
  if (!rafId) rafId = requestAnimationFrame(tick);
  return () => ticking.delete(f);
}

class JsValue {
  constructor(initial, render) {
    Object.assign(this, { v: initial, render, run: null });
  }
  sample(r, now) {
    const t = now - r.start;
    if (t <= 0) return r.from;
    return r.from + (r.to - r.from) * r.ease(Math.min(t / r.duration, 1));
  }
  to(target, { duration, ease }) {
    const now = performance.now();
    if (this.run) {
      this.v = this.sample(this.run, now);
      this.run.off();
      this.run = null;
    }
    if (this.v === target || reducedMotion?.matches) {
      this.v = target;
      this.render(target);
      return;
    }
    const run = { from: this.v, to: target, start: now, duration, ease };
    run.off = onFrame((t) => {
      this.v = this.sample(run, t);
      this.render(this.v);
      if (t - run.start >= run.duration) {
        run.off();
        if (this.run === run) this.run = null;
      }
    });
    this.run = run;
  }
}

// ---------- mount ----------

const opacityFmt = ([o]) => String(o);
const translateFmt = ([x, y]) => `translate(${x}px, ${y}px)`;

export function mount(slot, card) {
  const q = (s) => slot.querySelector(s);
  const iconGroup = q(".cc-icon > g");
  if (!iconGroup) return;

  // the active (cyan) Clerk logo: group opacity tween + the paths' opacity = (length > 0)
  const iconPaths = [...iconGroup.querySelectorAll("path")];
  const groupOpacity = new JsValue(0, (o) => iconGroup.setAttribute("opacity", String(o)));
  const length = new JsValue(0, (l) => {
    const on = String(+(l > 0));
    for (const p of iconPaths) if (p.getAttribute("opacity") !== on) p.setAttribute("opacity", on);
  });

  const tint = new WaapiValue(q(".cc-tint"), "opacity", opacityFmt, [0]);
  const sheen = new WaapiValue(q(".cc-sheen"), "transform", ([x, y]) => `translate(${x}rem, ${y}rem)`, SHEEN_REST);
  const logosOpacity = new WaapiValue(q(".cc-logos"), "opacity", opacityFmt, [0.7]);
  const logos = [...slot.querySelectorAll(".cc-logo")].map((el) => {
    const i = Number(el.dataset.logoIndex);
    return new WaapiValue(el, "transform", translateFmt, SLOTS[i]);
  });

  // carousel: every tick moves logo r to slot (r + step) % 6, all at once; `step` persists across hovers
  let step = 0;
  let startTimer = 0;
  let stepTimer = 0;
  // Motion has to read the logos' current transforms first, so it creates the six WAAPI animations in its next
  // frame, back-dated to the tick (startTime = the time of the call)
  const next = () => {
    const s = ++step;
    const at = performance.now();
    requestAnimationFrame(() => {
      const since = performance.now() - at;
      logos.forEach((logo, r) => logo.to(SLOTS[(r + s) % SLOTS.length], STEP, since));
    });
  };

  // streaks (AnimatePresence children)
  const boxes = STREAKS.map((s) => q(s.box));
  let meteors = [];
  const showStreaks = () => {
    if (meteors.length && meteors.every((m) => m.el.isConnected)) {
      // back while they fade out: the same instances return to opacity 1 and re-render (clock kept)
      for (const m of meteors) {
        if (m.exiting) m.revive();
        m.refresh();
      }
      return;
    }
    for (const m of meteors) m.destroy();
    meteors = STREAKS.map((s, i) =>
      createMeteor(boxes[i], {
        stops: "dark",
        speed: 0.35,
        meteors: [{ width: 239, height: 105, path: s.path, delay: s.delay, repeat: s.repeat, direction: s.direction }],
      }),
    );
  };
  const hideStreaks = () => {
    for (const m of meteors) m.exit();
  };

  // Timing, as React + Motion run it on clerk.com (measured against clerk.com frame by frame):
  // - hover-in: the tweens start at the pointer event (their keyframes are known, Motion starts them in the
  //   commit); the carousel timers start there too (the effect);
  // - the Meteor canvases mount on the next animation frame (their clock starts on the frame after);
  // - hover-out: everything is applied on the next frame, WAAPI tweens back-dated to the event.
  // A hover-out and back within one frame changes nothing (React batches it).
  let hovered = false; // pointer state
  let shown = false; // hover-in tweens applied
  let streaks = false; // meteors mounted
  let changedAt = 0;
  let req = 0;
  function onNextFrame() {
    req = 0;
    if (hovered) {
      if (!streaks && !reducedMotion?.matches) {
        streaks = true;
        showStreaks();
      }
      return;
    }
    const since = performance.now() - changedAt;
    if (shown) {
      shown = false;
      length.to(0, DEFAULT);
      groupOpacity.to(0, ICON);
      tint.to([0], DEFAULT, since);
      sheen.to(SHEEN_REST, DEFAULT, since);
      logosOpacity.to([0.7], DEFAULT, since);
    }
    if (streaks) {
      streaks = false;
      hideStreaks();
    }
  }
  function setHovered(on) {
    if (on === hovered) return;
    hovered = on;
    changedAt = performance.now();
    if (!req) req = requestAnimationFrame(onNextFrame);
    if (on) {
      if (!shown) {
        shown = true;
        length.to(1, LENGTH_IN);
        groupOpacity.to(1, ICON);
        tint.to([1], DEFAULT);
        sheen.to([0, 0], SHEEN_IN);
        logosOpacity.to([1], DEFAULT);
      }
      if (!reducedMotion?.matches) {
        startTimer = window.setTimeout(() => {
          stepTimer = window.setInterval(next, STEP_EVERY);
        }, FIRST_STEP);
      }
    } else {
      window.clearTimeout(startTimer);
      window.clearInterval(stepTimer);
      startTimer = stepTimer = 0;
    }
  }

  // react-aria useHover on the card root: pointer enter/leave, touch ignored
  card.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") setHovered(true); });
  card.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") setHovered(false); });
}
