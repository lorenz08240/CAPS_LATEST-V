// Fraud and Abuse Prevention card (clerk.com module 555385, "FraudAndAbuseDetection"), without Motion for React.
//
// On hover of the card: the sunburst spinner in the "Fraudulent sign-ups detected" pill turns (one turn per 2 s,
// linear, looping) and the pill text turns white (CSS, 0.5 s); four "blocked" rows come in one after the other
// (delays 0.25 / 0.45 / 0.65 / 0.85 s): a red ✕ disc pops in (opacity 0→1, scale 0.8→1, 0.2 s), the e-mail un-blurs
// (opacity 0→1, blur 8→0 px, 0.5 s) and, 0.2 s later, the "Blocked Aug 4 at 14:xx" line rises 8 px (0.5 s,
// easeOutExpo); and a red→orange light streak runs down the timeline every 3 s (src/shared/meteor.js). On hover-out
// every value goes back with the same delays and durations (clerk.com uses one transition for both states), the
// spinner turns back to 0° (0.5 s, easeOutExpo) and the streak fades out (0.3 s) and is removed. Nothing is random.
//
// How clerk.com (Motion for React) runs each value, reproduced here so that frames match:
// - opacity / filter / transform (the "Blocked …" line's translateY): WAAPI, with function easings sampled into CSS
//   linear() (one point per 10 ms); on finish the end value is written to the style.
// - scale (the ✕ disc) and rotate (the spinner): Motion's JS loop, one value per animation frame, rendered as
//   `transform: scale()/rotate()` ("none" at the default value).
// - Timing, measured on clerk.com (virtual-clock captures with logged pointer events, .reanimate/clerk-bento/
//   fraud/): at the pointer event the running animations are stopped (a WAAPI one is sampled at that instant and the
//   value committed; a JS one keeps its last frame); on the next frame the new animations are created from the current
//   values, all back-dated to the event (Motion's createdAt). The meteor is mounted on the next frame.
// - Motion's bookkeeping, including an edge case: an animation that ends in the same frame as a pointer event
//   clears the value's *new* animation when its finish event arrives, so on a quick re-hover Motion skips that value
//   (it looks already at its target) and it ends at its rest value for that hover. This port does the same.
//
// Addition (not on clerk.com): with prefers-reduced-motion: reduce, hover shows the rows at once, without the
// spinner turn and the streak.

import { createMeteor } from "../shared/meteor.js";

// ---------- easings (clerk.com module 275921) ----------
const easeH = (t) => (t < 0.5 ? 0.5 * Math.pow(2, 16 * t - 8) : -0.5 * Math.pow(2, -16 * t + 8) + 1); // soft easeInOutExpo
const easeU = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)); // easeOutExpo
const linear = (t) => t;
// Motion's generateLinearEasing: max(round(duration / 10), 2) points, 4 decimals
function linearEasing(fn, duration) {
  const n = Math.max(Math.round(duration / 10), 2);
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(Math.round(1e4 * fn(i / (n - 1))) / 1e4);
  return `linear(${pts.join(", ")})`;
}

const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

// ---------- Motion values ----------
// `value` is the motion value, `anim` the animation it holds (Motion's MotionValue.animation).
// stop(now) + request(to, transition, now) run at the pointer event; create(frameNow) on the next frame.
class MotionVal {
  constructor(value) {
    this.value = value;
    this.anim = null;
    this.pending = null;
  }
  // Motion's animateTarget: skip a value that is not animating and already at the target
  request(to, transition, now) {
    if (!this.anim && this.value === to) {
      this.pending = { skip: true, to };
      return;
    }
    this.stop(now);
    const a = { to, ...transition, start: now, live: false };
    this.anim = this.pending = a;
  }
}

// a numeric value rendered into one CSS property through WAAPI (Motion's accelerated path)
class WaapiValue extends MotionVal {
  constructor(el, prop, value, render) {
    super(value);
    Object.assign(this, { el, prop, render });
  }
  write(v) {
    this.el.style[this.prop] = this.render(v);
  }
  set(v) {
    this.stop(performance.now());
    this.anim = this.pending = null;
    this.value = v;
    this.write(v);
  }
  // Motion samples a stopped animation with the same curve (the first keyframe during the delay)
  sample(a, now) {
    const t = Math.max(10, now - a.start) - (a.delay || 0);
    if (t < 0) return a.from;
    return t >= a.duration ? a.to : a.from + (a.to - a.from) * a.ease(t / a.duration);
  }
  // Motion's NativeAnimation.stop(): unless idle/finished, sample the curve now, commit it, cancel
  stop(now) {
    const a = this.anim;
    this.anim = null;
    if (!a || a.done) return;
    if (!a.live) return void (a.cancelled = true); // not created yet (Motion: keyframes not resolved)
    const state = a.wa.playState;
    if (state === "finished") {
      // ended, finish event still pending: Motion reads the value when the next keyframes resolve, after that event
      this.value = a.to;
    } else if (state !== "idle") {
      this.value = this.sample(a, now);
      this.write(this.value);
      a.wa.cancel();
    }
  }
  create() {
    const a = this.pending;
    this.pending = null;
    if (!a) return;
    if (a.skip) return void this.write(a.to);
    if (a.cancelled) return;
    let { duration, delay = 0, ease } = a;
    const from = (a.from = this.value);
    if (from === a.to) {
      // Motion: nothing to animate; set at once, or after the delay through a zero-length animation
      if (!delay) {
        a.done = true;
        if (this.anim === a) this.anim = null;
        return void this.write(a.to);
      }
      duration = 0;
    }
    a.duration = Math.max(duration, 1e-6);
    a.wa = this.el.animate(
      { [this.prop]: [this.render(from), this.render(a.to)] },
      { duration, delay, easing: duration ? linearEasing(ease, duration) : "linear", fill: "both" },
    );
    a.wa.startTime = a.start; // back-dated to the pointer event (Motion's createdAt)
    a.live = true;
    a.wa.onfinish = () => {
      a.done = true;
      this.value = a.to;
      this.write(a.to);
      a.wa.cancel();
      // Motion: MotionValue.start(…).then(clearAnimation) clears whatever animation the value holds by now
      Promise.resolve().then(() => {
        this.anim = null;
      });
    };
  }
}

// a value driven per animation frame (Motion's JS path)
const jsValues = new Set();
let ticking = false;
function tick() {
  const now = performance.now();
  for (const v of jsValues) v.step(now);
  ticking = jsValues.size > 0;
  if (ticking) requestAnimationFrame(tick);
}
class JsValue extends MotionVal {
  constructor(value, apply) {
    super(value);
    this.apply = apply;
  }
  set(v) {
    this.stop(null);
    this.anim = this.pending = null;
    this.value = v;
    this.apply(v);
  }
  // Motion stops a JS animation at its value at that instant
  stop(now) {
    const a = this.anim;
    this.anim = null;
    if (!a) return;
    a.cancelled = true;
    if (a.live && !a.done && now != null) this.apply((this.value = this.at(a, now)));
  }
  create(frameNow) {
    const a = this.pending;
    this.pending = null;
    if (!a) return;
    if (a.skip) return void this.apply((this.value = a.to));
    if (a.cancelled) return;
    a.from = this.value;
    a.live = true;
    jsValues.add(this);
    this.step(frameNow); // Motion ticks a new animation in the frame it is created
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }
  // the value of animation `a` at time `now`. repeat: loop forever (Motion's repeat: Infinity, repeatType "loop":
  // every run goes from → to again)
  at(a, now) {
    const t = now - a.start - (a.delay || 0);
    if (t < -1e-6) return a.from; // the first keyframe during the delay
    if (a.repeat) {
      let p = (t % a.duration) / a.duration;
      if (p === 0 && t > 0) p = 1;
      return a.from + (a.to - a.from) * a.ease(p);
    }
    if (t >= a.duration) return a.to; // Motion ends on the exact last keyframe
    return a.from + (a.to - a.from) * a.ease(Math.max(0, t) / a.duration);
  }
  step(now) {
    const a = this.anim;
    if (!a || !a.live || a.cancelled) return jsValues.delete(this);
    this.value = this.at(a, now);
    this.apply(this.value);
    const done = !a.repeat && now - a.start - (a.delay || 0) >= a.duration;
    if (done) {
      a.done = true;
      this.anim = null;
      jsValues.delete(this);
    }
  }
}

const TRACK_PATH =
  "M2 0V34.6863C2 36.808 2.84285 38.8429 4.34315 40.3431L34.6569 70.6569C36.1571 72.1571 37 74.192 37 76.3137V393";
const METEOR_STOPS = [["rgb(185 28 28 / 0)", 0], ["rgb(185 28 28)", 0.5], ["rgb(243 107 22)", 1]];

export function mount(slot, card) {
  const spinnerEl = slot.querySelector(".fr-spinner");
  const track = slot.querySelector(".fr-track");

  // rest values (clerk.com's SSR inline styles)
  const spinner = new JsValue(0, (v) => {
    spinnerEl.style.transform = v === 0 ? "none" : `rotate(${v}deg)`;
  });
  const rows = [...slot.querySelectorAll(".fr-row")].map((row, i) => {
    const block = row.querySelector(".fr-block");
    const title = row.querySelector(".fr-title");
    const desc = row.querySelector(".fr-desc");
    return {
      delay: (0.2 * i + 0.25) * 1000, // clerk.com: delay .2*r+.25 s
      blockOpacity: new WaapiValue(block, "opacity", 0, String),
      blockScale: new JsValue(0.8, (v) => {
        block.style.transform = v === 1 ? "none" : `scale(${v})`;
      }),
      titleOpacity: new WaapiValue(title, "opacity", 0, String),
      titleBlur: new WaapiValue(title, "filter", 8, (v) => `blur(${v}px)`),
      descOpacity: new WaapiValue(desc, "opacity", 0, String),
      descY: new WaapiValue(desc, "transform", 0.5, (v) => `translateY(${v}rem)`),
    };
  });
  const all = [spinner, ...rows.flatMap((r) => [r.blockOpacity, r.blockScale, r.titleOpacity, r.titleBlur, r.descOpacity, r.descY])];

  // the targets and transitions of each state (clerk.com passes one `transition` for both states of a row)
  function request(hovered, now) {
    if (hovered) spinner.request(360, { duration: 2000, ease: linear, repeat: true }, now);
    else spinner.request(0, { duration: 500, ease: easeU }, now);
    for (const r of rows) {
      const t1 = { duration: 200, delay: r.delay, ease: easeH }; // the ✕ disc
      const t2 = { duration: 500, delay: r.delay, ease: easeH }; // the e-mail
      const t3 = { duration: 500, delay: r.delay + 200, ease: easeU }; // the "Blocked …" line
      r.blockOpacity.request(hovered ? 1 : 0, t1, now);
      r.blockScale.request(hovered ? 1 : 0.8, t1, now);
      r.titleOpacity.request(hovered ? 1 : 0, t2, now);
      r.titleBlur.request(hovered ? 0 : 8, t2, now);
      r.descOpacity.request(hovered ? 1 : 0, t3, now);
      r.descY.request(hovered ? 0 : 0.5, t3, now);
    }
  }
  function setAll(hovered) {
    spinner.set(0);
    for (const r of rows) {
      r.blockOpacity.set(hovered ? 1 : 0);
      r.blockScale.set(hovered ? 1 : 0.8);
      r.titleOpacity.set(hovered ? 1 : 0);
      r.titleBlur.set(hovered ? 0 : 8);
      r.descOpacity.set(hovered ? 1 : 0);
      r.descY.set(hovered ? 0 : 0.5);
    }
  }

  // ---------- hover (react-aria useHover on the card root: pointerenter/leave, touch ignored) ----------
  let hovered = false;
  let meteor = null;
  let mounted = null; // the meteor mounted by the latest pointer event (nothing to fade for it)
  let eventAt = 0;
  let frame = 0;
  const nextFrame = () => {
    frame = 0;
    const frameNow = performance.now();
    for (const v of all) v.create(frameNow);
    if (reducedMotion?.matches) return;
    if (meteor?.el.isConnected && meteor !== mounted) {
      // AnimatePresence exit (opacity → 0, then removed) or, during that exit, back to opacity 1 (same instance,
      // clock continues); like every Motion animation here, back-dated to the pointer event
      const wanted = !hovered || meteor.exiting;
      if (!hovered) meteor.exit();
      else if (meteor.exiting) meteor.revive();
      if (wanted) {
        const list = meteor.el.getAnimations();
        list.forEach((a, i) => (i < list.length - 1 ? a.cancel() : (a.startTime = eventAt)));
      }
    }
  };
  const onHover = (on) => {
    hovered = on;
    eventAt = performance.now();
    if (reducedMotion?.matches) {
      setAll(on);
      if (!on) meteor?.destroy();
      return;
    }
    request(on, eventAt);
    // the meteor wrapper's running fade stops where it is, like the other values
    meteor?.el.getAnimations().forEach((a) => a.pause());
    if (on && !meteor?.el.isConnected) {
      // AnimatePresence mounts the meteor with the state change (React commits right after the event); its clock
      // starts on its first frame once the glow image has loaded
      mounted = meteor = createMeteor(track, {
        stops: METEOR_STOPS,
        meteors: [{ width: 39, height: 393, path: TRACK_PATH, repeat: 3000 }],
      });
    } else mounted = null;
    if (!frame) frame = requestAnimationFrame(nextFrame);
  };
  card.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "touch" && !hovered) onHover(true);
  });
  card.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "touch" && hovered) onHover(false);
  });
}
