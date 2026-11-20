// Social Sign-On card (clerk.com module 593274, export SocialSignOn), without Motion for React.
//
// On hover of the card the cloud box lights up (cyan cloud, glow, a diagonal sheen sweeps in) and both logo tracks
// brighten from 0.7 to 1. Light streaks run along the circuit lines (src/shared/meteor.js, clerk.com's canvas):
// one rises into the box from below every 1.4 s, and one shoots out of the box to the left (0.7 s, then every
// 2.8 s) and to the right (2.1 s, then every 2.8 s). Each side streak, as it starts, moves that side's six logo
// chips one slot along their track (1.2 s, cubic-bezier(.7,0,.3,1)): Discord, Google, GitHub, Notion, Linear, Apple
// on the left; LinkedIn, Microsoft, Atlassian, Dropbox, X, HubSpot on the right. On hover-out the lit state fades
// back (0.3 s) and the streaks stop at the next start of the centre streak; the logos stay where they are and the
// next hover continues from there. Nothing is random.
//
// How clerk.com runs each part, reproduced here so that frames match:
// - transform / opacity of HTML elements (glow, sheen, logo containers, logo chips): Motion hands them to WAAPI and
//   back-dates the animation to its creation (animation.startTime = createdAt); on finish the end value is written
//   to the style. A transition without `ease`/`duration` is Motion's default tween: 0.3 s cubic-bezier(.25,.1,.35,1).
// - the opacity of the active cloud (an <svg>, not an HTMLElement) is Motion's JS loop: one value per frame.
// - the streaks are clerk.com's <Meteor> inside <AnimatePresence>: mounted while hovered; on hover-out the
//   component re-renders (Meteor's effect re-runs, so a streak in flight "begins" again) and the centre streak's
//   onBegin calls usePresence's safeToRemove() and returns false (loop stops, canvas removed, no fade).
//   Re-hovering before that revives the same instance (another re-render), its clock continues.
// - the logo steps are a Motion useAnimate sequence called from the side streaks' onBegin, guarded by the
//   `hovered` prop: every chip moves one slot (at:"<", all together); the chip that wraps from the last slot to the
//   first jumps there instantly ({duration:0}), on the next frame (Motion resolves keyframes a frame later).
// - Timing (measured on clerk.com with virtual-clock captures, .reanimate/clerk-bento/social-sign-on/; every
//   element starts on the same frame as there): the hover state is a zustand store read with useSyncExternalStore,
//   so React renders, commits and runs effects in a microtask right after the pointer event. The streak canvas
//   mounts (or re-renders) then and its clock starts on the next frame, once its glow image has loaded. Motion
//   starts the declarative values at the event too, creating them on the next frame: WAAPI ones back-dated to the
//   event, the JS one evaluated from the event time.
//
// Addition (not on clerk.com): with prefers-reduced-motion: reduce, hover switches the lit state without tweens and
// shows no streaks or logo steps.

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
const ease = (p) => ({ fn: cubicBezier(...p), css: `cubic-bezier(${p.join(", ")})` });
const EASE_DEFAULT = ease([0.25, 0.1, 0.35, 1]); // Motion's default tween (0.3 s)
const EASE_SHINE = ease([0, 0.4, 0.2, 1]);
const EASE_STEP = ease([0.7, 0, 0.3, 1]);

// ---------- a numeric value rendered into one CSS property through WAAPI (Motion's accelerated path) ----------
class WaapiValue {
  constructor(el, prop, value, render) {
    Object.assign(this, { el, prop, value, render, anim: null, opts: null, from: value, to: value });
  }
  current() {
    const { anim, opts } = this;
    if (!anim) return this.value;
    const local = anim.currentTime ?? 0;
    const p = Math.min(1, Math.max(0, local / opts.duration));
    return this.from + (this.to - this.from) * opts.ease.fn(p);
  }
  set(to) {
    this.anim?.cancel();
    this.anim = null;
    this.value = this.from = this.to = to;
    this.el.style[this.prop] = this.render(to);
  }
  animate(to, { duration, ease: e = EASE_DEFAULT, startTime }) {
    const from = this.current();
    this.anim?.cancel();
    const anim = this.el.animate(
      { [this.prop]: [this.render(from), this.render(to)] },
      { duration, easing: e.css, fill: "both" },
    );
    if (startTime != null) anim.startTime = startTime; // Motion back-dates to the animation's creation
    Object.assign(this, { anim, from, to, value: from, opts: { duration, ease: e } });
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
  constructor(value, apply) {
    Object.assign(this, { value, apply, tween: null });
  }
  set(to) {
    this.tween = null;
    jsValues.delete(this);
    this.value = to;
    this.apply(to);
  }
  // called inside an animation frame: the first value is rendered in this frame, as Motion's frame loop does
  animate(to, { duration = 300, ease: e = EASE_DEFAULT, startTime = performance.now() } = {}) {
    this.tween = { from: this.value, to, duration, ease: e.fn, start: startTime };
    jsValues.add(this);
    this.step(performance.now());
    if (!ticking && jsValues.size) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }
  step(now) {
    const tw = this.tween;
    if (!tw) return jsValues.delete(this);
    const p = Math.min(1, Math.max(0, (now - tw.start) / tw.duration));
    this.value = tw.from + (tw.to - tw.from) * tw.ease(p);
    this.apply(this.value);
    if (p >= 1) {
      this.tween = null;
      jsValues.delete(this);
    }
  }
}

// ---------- logo tracks (clerk.com's LogoTrack: 6 chips, 6 slots, useAnimate sequence on next()) ----------
const LEFT_SLOTS = [
  ["-1.5rem", "0rem", { duration: 0 }],
  ["5rem", "0rem"],
  ["10rem", "0rem"],
  ["calc(10rem + 3rem)", "3rem"],
  ["calc(10rem + 3rem)", "calc(5rem + 5rem)"],
  ["calc(10rem + 3rem)", "calc(10rem + 3rem)"],
];
const RIGHT_SLOTS = [
  ["calc(10rem + 3rem)", "calc(10rem + 3rem)", { duration: 0 }],
  ["calc(10rem + 3rem)", "calc(5rem + 5rem)"],
  ["calc(10rem + 3rem)", "3rem"],
  ["10rem", "0rem"],
  ["5rem", "0rem"],
  ["-1.5rem", "0rem"],
];

function logoTrack(container, slots, reduced) {
  const chips = [...container.children];
  const anims = new Map(); // chip → running WAAPI animation
  let count = 0; // clerk.com's useRef counter: never reset, so the next hover continues where this one stopped
  const track = {
    hovered: false, // the `hovered` prop as of the last render
    next() {
      if (!track.hovered || reduced.matches) return;
      count++;
      // Motion: animate() now, keyframes resolved (current values read) on the next frame, the WAAPI animations
      // created then and back-dated to now; the chip that wraps ({duration:0}) is set on that frame.
      const created = performance.now();
      const targets = chips.map((el, r) => slots[(r + count) % slots.length]);
      requestAnimationFrame(() => {
        chips.forEach((el, r) => {
          const [x, y, t = { duration: 1.2 }] = targets[r];
          const to = `translate(${x}, ${y})`;
          // a running step is stopped where it is (Motion commits the current value, then animates from it)
          const from = getComputedStyle(el).transform;
          const running = anims.get(el);
          if (running) {
            running.cancel();
            anims.delete(el);
            el.style.transform = from;
          }
          if (t.duration === 0) {
            el.style.transform = to;
            return;
          }
          const anim = el.animate({ transform: [from, to] }, { duration: t.duration * 1000, easing: EASE_STEP.css, fill: "both" });
          anim.startTime = created;
          anims.set(el, anim);
          anim.onfinish = () => {
            if (anims.get(el) !== anim) return;
            el.style.transform = to;
            anims.delete(el);
            anim.cancel();
          };
        });
      });
    },
  };
  return track;
}

// ---------- the streaks: clerk.com's MeteorGroup ----------
const W = 98, H = 192;
const PATH_LEFT = "M88.71 131.71L3.34314 46.3431C1.84285 44.8428 1 42.808 1 40.6863V0";
const PATH_CENTRE = "M49 292V124";
const PATH_RIGHT = "M9.29 131.71L94.6569 46.3431C96.1572 44.8428 97 42.808 97 40.6863V0";

// React runs a state update made outside an event (safeToRemove → AnimatePresence) in a scheduler task
const channel = new MessageChannel();
const tasks = [];
channel.port1.onmessage = () => tasks.shift()?.();
const postTask = (fn) => {
  tasks.push(fn);
  channel.port2.postMessage(0);
};

export function mount(slot, card) {
  const $ = (s) => slot.querySelector(s);
  const column = $(".sso-column");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const glow = new WaapiValue($(".sso-glow"), "opacity", 0, String);
  const shine = new WaapiValue($(".sso-shine"), "transform", -4, (v) => `translate(${v}rem, ${v}rem)`);
  const logoOpacity = [...slot.querySelectorAll(".sso-logos")].map((el) => new WaapiValue(el, "opacity", 0.7, String));
  const cloudEl = $(".sso-cloud-active");
  const cloud = new JsValue(0, (v) => (cloudEl.style.opacity = String(v)));
  const left = logoTrack($(".sso-track--left .sso-logos"), LEFT_SLOTS, reduced);
  const right = logoTrack($(".sso-track--right .sso-logos"), RIGHT_SLOTS, reduced);

  // <AnimatePresence>{hovered && <MeteorGroup/>}</AnimatePresence>
  let meteor = null;
  let present = false; // usePresence()[0] of the mounted MeteorGroup
  let removing = false;
  const safeToRemove = () => {
    if (removing) return;
    removing = true;
    const m = meteor;
    postTask(() => {
      removing = false;
      if (meteor !== m) return;
      if (present) return; // re-hovered in between: AnimatePresence keeps it
      m.destroy();
      meteor = null;
    });
  };
  const mountMeteor = () =>
    createMeteor(column, {
      skip: 100,
      meteors: [
        { width: W, height: H, path: PATH_LEFT, delay: 700, repeat: 2800, onBegin() { left.next(); } },
        {
          width: W, height: H, path: PATH_CENTRE, repeat: 1400,
          onBegin() {
            if (!present) {
              safeToRemove();
              return false;
            }
          },
        },
        { width: W, height: H, path: PATH_RIGHT, repeat: 2800, delay: 2100, onBegin() { right.next(); } },
      ],
    });

  // Motion's WAAPI values, created on the frame after the state change and back-dated to it
  function animateWaapi(hovered, startTime) {
    if (reduced.matches) {
      glow.set(hovered ? 1 : 0);
      shine.set(hovered ? 0 : -4);
      logoOpacity.forEach((v) => v.set(hovered ? 1 : 0.7));
      return;
    }
    const t = { duration: 300, startTime };
    glow.animate(hovered ? 1 : 0, t);
    shine.animate(hovered ? 0 : -4, hovered ? { duration: 500, ease: EASE_SHINE, startTime } : t);
    logoOpacity.forEach((v) => v.animate(hovered ? 1 : 0.7, t));
  }

  // React's render after a hover change. The hover state lives in a zustand store read through
  // useSyncExternalStore, so React renders, commits and runs the effects synchronously, in a microtask right
  // after the pointer event: the MeteorGroup mounts or re-renders then (its canvas clock starts on the next frame,
  // once the glow image has loaded). Motion starts the declarative animations at the same moment and creates them
  // on the next frame.
  function commit(hovered, at) {
    left.hovered = right.hovered = hovered;
    if (hovered) {
      present = true;
      if (!reduced.matches) {
        if (meteor) meteor.refresh(); // still exiting: same instance, re-rendered
        else meteor = mountMeteor();
      }
    } else if (meteor) {
      present = false;
      meteor.refresh(); // MeteorGroup re-renders with isPresent = false
    }
    requestAnimationFrame(() => {
      animateWaapi(hovered, at);
      if (reduced.matches) cloud.set(hovered ? 1 : 0);
      else cloud.animate(hovered ? 1 : 0, { startTime: at });
    });
  }

  // ---------- hover (react-aria useHover on the card root: pointerenter/leave, touch ignored) ----------
  let hovered = false;
  const change = (h) => {
    hovered = h;
    const at = performance.now();
    queueMicrotask(() => commit(h, at));
  };
  card.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "touch" && !hovered) change(true);
  });
  card.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "touch" && hovered) change(false);
  });
}
