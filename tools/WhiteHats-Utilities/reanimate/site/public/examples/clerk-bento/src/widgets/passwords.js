// "Passwords" card: hover the card and the scene lifts, the field focuses and ten dots type in; after 2 s the
// keyhole dial turns 90° to unlock. It holds while hovered and reverses on hover-out.
//
// clerk.com builds it with Motion for React (module 312823): declarative `animate` per hover state, run as
// WAAPI animations with `fill: "both"` and the JS easings sampled into CSS linear() (Motion's
// generateLinearEasing, one point per 10 ms). An interrupted animation restarts from the value sampled with the
// JS easing at its current time, as Motion does. This file reproduces that with plain WAAPI.

// clerk.com's easings (module 275921): u = easeOutExpo, H = a steep easeInOutExpo (H(0) = 0.00195, not 0)
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutExpo = (t) => (t < 0.5 ? 0.5 * Math.pow(2, 16 * t - 8) : -0.5 * Math.pow(2, -16 * t + 8) + 1);

const linearCache = new Map();
function linearEasing(ease, duration) {
  const key = `${ease.name}|${duration}`;
  let css = linearCache.get(key);
  if (!css) {
    const n = Math.max(Math.round(duration / 10), 2);
    const pts = [];
    for (let i = 0; i < n; i++) pts.push(Math.round(ease(i / (n - 1)) * 10000) / 10000);
    css = `linear(${pts.join(", ")})`;
    linearCache.set(key, css);
  }
  return css;
}

const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

// One animated style property: a vector of numbers plus a formatter, like a Motion value holding a string.
class Value {
  constructor(el, prop, format, initial) {
    this.el = el;
    this.prop = prop;
    this.format = format;
    this.v = initial;
    this.run = null;
  }
  // value now: during the delay the start value, then the JS easing at the WAAPI time (Motion's sampling on stop)
  current() {
    const r = this.run;
    if (!r) return this.v;
    const t = (Number(r.anim.currentTime) || 0) - r.delay;
    if (t <= 0) return r.from;
    const p = r.ease(Math.min(t / r.duration, 1));
    return r.from.map((f, i) => f + (r.to[i] - f) * p);
  }
  set(v) {
    this.v = v;
    this.el.style[this.prop] = this.format(v);
  }
  to(target, { duration, delay = 0, ease }) {
    const from = this.current();
    if (this.run) { this.run.anim.cancel(); this.run = null; }
    this.set(from);
    if (from.every((f, i) => f === target[i])) return; // nothing to animate (Motion makes it instant)
    if (reducedMotion?.matches) { this.set(target); return; }
    const anim = this.el.animate(
      { [this.prop]: [this.format(from), this.format(target)] },
      { duration, delay, easing: linearEasing(ease, duration), fill: "both" },
    );
    const run = { anim, from, to: target, delay, duration, ease };
    this.run = run;
    anim.onfinish = () => {
      if (this.run !== run) return;
      this.run = null;
      this.set(target); // Motion commits the final keyframe to the style and cancels the animation
      anim.cancel();
    };
  }
}

const translateY = ([y]) => `translateY(${y}rem)`;
const rotate = ([a]) => `rotate(${a}deg)`;
const opacity = ([o]) => String(o);
const glint = ([x, y]) => `translateX(${x}%) translateY(${y}%) rotate(45deg) scaleY(1.2)`;

export function mount(slot, card) {
  const q = (s) => slot.querySelector(s);
  if (!q(".pw-scene")) return;

  const v = {
    scene: new Value(q(".pw-scene"), "transform", translateY, [0]),
    fieldY: new Value(q(".pw-field"), "transform", translateY, [0]),
    fieldO: new Value(q(".pw-field"), "opacity", opacity, [0.5]),
    focus: new Value(q(".pw-focus"), "opacity", opacity, [0]),
    needle: new Value(q(".pw-needle"), "transform", rotate, [0]),
    rimAR: new Value(q(".pw-rim--a"), "transform", rotate, [90]),
    rimAO: new Value(q(".pw-rim--a"), "opacity", opacity, [0]),
    rimBR: new Value(q(".pw-rim--b"), "transform", rotate, [-90]),
    rimBO: new Value(q(".pw-rim--b"), "opacity", opacity, [0]),
    glint: new Value(q(".pw-glint"), "transform", glint, [-125, -75]),
  };
  const focus = q(".pw-focus");
  let dots = [];
  let hovered = false;

  function setHovered(on) {
    if (on === hovered) return;
    hovered = on;
    // layout: scene up 2rem, field down 1rem + opaque, focus ring in; 1 s easeOutExpo both ways
    const layout = { duration: 1000, ease: easeOutExpo };
    v.scene.to([on ? -2 : 0], layout);
    v.fieldY.to([on ? 1 : 0], layout);
    v.fieldO.to([on ? 1 : 0.5], layout);
    v.focus.to([on ? 1 : 0], layout);
    // dial: unlock after 2 s with easeInOutExpo; back in 0.5 s easeOutExpo
    const dial = on ? { duration: 1000, delay: 2000, ease: easeInOutExpo } : { duration: 500, ease: easeOutExpo };
    v.needle.to([on ? 90 : 0], dial);
    v.rimAR.to([on ? 0 : 90], dial);
    v.rimAO.to([on ? 1 : 0], dial);
    v.rimBR.to([on ? 0 : -90], dial);
    v.rimBO.to([on ? 1 : 0], dial);
    v.glint.to(on ? [-50, 0] : [-125, -75], dial);
    // typed dots: mounted on hover, each un-blurs in 1 s from 0.75 s, 0.1 s apart; removed at once on hover-out
    for (const d of dots) d.remove();
    dots = [];
    if (!on) return;
    for (let i = 0; i < 10; i++) {
      const d = document.createElement("div");
      d.className = "pw-dot";
      focus.appendChild(d);
      dots.push(d);
      const timing = { duration: 1000, delay: 750 + 100 * i, ease: easeOutExpo };
      new Value(d, "opacity", opacity, [0]).to([1], timing);
      new Value(d, "filter", ([b]) => `blur(${b}px)`, [8]).to([0], timing);
    }
  }

  // react-aria useHover on the card root: pointer enter/leave, touch ignored
  card.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") setHovered(true); });
  card.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") setHovered(false); });
}
