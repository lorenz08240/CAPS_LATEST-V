// "Magic Links" card: hover the card and a cyan scan line sweeps the code chip, revealing a new random code, while
// the avatar outline traces in cyan and a light band crosses the noise text; the name shifts and a check mark draws
// in (3.6 s), then the profile swings out on a wheel and a random next user swings in, and the cycle repeats every
// 5.2 s while hovered. Hover-out fades the hovered layers (0.3 s) and slides the name back; the current user stays.
//
// clerk.com builds it with Motion for React (module 642634, .reanimate/clerk-bento/src/magic-links.module.js).
// This file mirrors that component tree in plain DOM:
//   - keyed parts are re-created when the user changes (NoiseCode, the cyan code, the scanner, the profile), and
//     AnimatePresence semantics are kept: exiting parts keep their last props (frozen) while their exit runs, new
//     parts are inserted after them, `popLayout` takes the exiting profile out of the flow at its last box;
//   - HTML values (transform, opacity, clip-path, background-position) run as WAAPI animations with Motion's
//     timings, all started at the same time origin (Motion backdates `startTime` to the frame of the state change;
//     after a swap the new animations take the next frame as origin, as measured on clerk.com);
//     SVG `pathLength`/`opacity` are JS-driven on rAF, as Motion does for SVG;
//   - Motion's defaults: a transition with only `delay` is 0.3 s cubic-bezier(.25,.1,.35,1), a transition with a
//     duration and no ease is easeOut (0,0,.58,1), an exit with no transition is 0.3 s cubic-bezier(.25,.1,.35,1);
//     an interrupted value restarts from its current (sampled) value;
//   - randomness is clerk.com's: the same charset and string builder `n(len)`, the 1200-char noise source per render,
//     the 200 ms scramble offsets, 16 particles with random top/delay/duration per render of the scanner, the next
//     user picked with Math.floor(Math.random() * 50), consumed in the same order per render as React does.

const SVGNS = "http://www.w3.org/2000/svg";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
// clerk.com's random string builder
function n(e) {
  let r = "";
  const t = CHARS.length;
  let i = 0;
  for (; i < e; i += 1) r += CHARS.charAt(Math.floor(Math.random() * t));
  return r;
}
const USERS = ["Marina Schroeder", "Izaiah Manning", "Jennifer Ochoa", "Winston Brennan", "Elodie Carroll", "Oscar Wong",
  "Adelaide Sloan", "Ocean Haley", "Addilynn Harvey", "Cayden Ball", "Abby Rangel", "Saint Harmon", "Maren Dudley",
  "Colter Marshall", "Adalyn Gutierrez", "Luca Hoover", "Virginia Malone", "Ruben Hodge", "Coraline Sampson",
  "Cain Pollard", "Marisol Jaramillo", "Riggs Weiss", "Lennox Norton", "Callen Harmon", "Maren Robbins",
  "Finnegan Shepard", "Noor Aguilar", "Milo Branch", "Luisa Combs", "Ahmad Rollins", "Araceli McCullough",
  "Briar Owen", "Mikayla Ayers", "Ulises Norris", "Arielle Harding", "Brodie Chambers", "Makayla Spencer", "Ace Kline",
  "Sevyn McKee", "Bjorn Daniel", "Joy Swanson", "Hugo Moss", "Bianca Waller", "Marley Sloan", "Selene Carey",
  "Watson Zamora", "Sierra Bonilla", "Aden Herman", "Paulina Peterson", "Santiago Payne"];
const EMAIL_RE = /^(\S)\S+\./;
const emailOf = (name) => name.toLowerCase().replace(" ", ".").replace(EMAIL_RE, "$1.");
const CODE_PLACEHOLDER = "Yb9WrnC5nFrvvz"; // the chip's server-rendered text (and the overlay's sizer)

const PATH_T = "M26.22 78.25c2.679-3.522 1.485-17.776 1.485-17.776-1.084-2.098-1.918-4.288-2.123-5.619-3.573 0-3.7-8.05-3.827-9.937-.102-1.509 1.403-1.383 2.169-1.132-.298-1.3-.92-5.408-1.021-11.446C22.775 24.794 30.94 17.75 40 17.75h.005c9.059 0 17.225 7.044 17.097 14.59-.102 6.038-.723 10.147-1.021 11.446.765-.251 2.271-.377 2.169 1.132-.128 1.887-.254 9.937-3.827 9.937-.205 1.331-1.039 3.521-2.123 5.619 0 0-1.194 14.254 1.485 17.776";
const PATH_O = "M27.705 60.474a26.884 26.884 0 0 0 1.577 2.682c1.786 2.642 5.36 6.792 10.718 6.792h.005c5.358 0 8.932-4.15 10.718-6.792a26.884 26.884 0 0 0 1.577-2.682";
const PATH_CHECK = "M3.75 6.563 5.438 8.25l2.812-4.5";

// ---------- easing ----------
function bezier(x1, y1, x2, y2) {
  const ax = 3 * x1 - 3 * x2 + 1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
  const sx = (s) => ((ax * s + bx) * s + cx) * s;
  const sy = (s) => ((ay * s + by) * s + cy) * s;
  const f = (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, s = x;
    for (let k = 0; k < 40; k++) {
      const v = sx(s);
      if (Math.abs(v - x) < 1e-7) break;
      if (v < x) lo = s; else hi = s;
      s = (lo + hi) / 2;
    }
    return sy(s);
  };
  f.css = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  return f;
}
const EASE_DEFAULT = bezier(0.25, 0.1, 0.35, 1); // Motion's default 0.3 s tween
const EASE_OUT = bezier(0, 0, 0.58, 1); // Motion's "easeOut" (= CSS ease-out)
const EASE_SWAP = bezier(0.7, 0, 0.3, 1); // profile swing, cyan code wipe-out
const LINEAR = (t) => t;
LINEAR.css = "linear";
const DEF = { duration: 300, ease: EASE_DEFAULT };

const now = () => performance.now();
// Start a WAAPI animation at time origin t0 (+ delay). A time origin in the future (the swap's next frame) becomes
// extra delay, so it behaves the same whether startTime may be set ahead or not.
function startAt(anim, t0) {
  const n = now();
  if (t0 > n) {
    const timing = anim.effect.getTiming();
    anim.effect.updateTiming({ delay: (Number(timing.delay) || 0) + (t0 - n) });
    anim.startTime = n;
  } else {
    anim.startTime = t0;
  }
  return anim;
}

// ---------- animated values ----------
// One HTML style property run as WAAPI (like Motion's NativeAnimation): `to()` starts from the value sampled with
// the JS easing at the given time; on finish the target is committed to the style and the animation cancelled.
class Value {
  constructor(el, prop, format, v, write = true) {
    this.el = el;
    this.prop = prop;
    this.format = format;
    this.v = v;
    this.run = null;
    if (write) el.style[prop] = format(v);
  }
  current(t = now()) {
    const r = this.run;
    if (!r) return this.v;
    const e = t - r.t0 - r.delay;
    if (e <= 0) return r.from;
    const p = r.duration ? r.ease(Math.min(e / r.duration, 1)) : 1;
    return r.from.map((f, i) => f + (r.to[i] - f) * p);
  }
  to(target, { t0 = now(), delay = 0, duration, ease, onDone }) {
    const from = this.current(t0);
    if (this.run) { this.run.anim.cancel(); this.run = null; }
    this.v = from;
    this.el.style[this.prop] = this.format(from);
    if (from.every((f, i) => f === target[i])) { this.v = target; onDone?.(); return; }
    const anim = this.el.animate(
      { [this.prop]: [this.format(from), this.format(target)] },
      { duration, delay, easing: ease.css, fill: "both" },
    );
    startAt(anim, t0);
    const run = { anim, from, to: target, t0, delay, duration, ease };
    this.run = run;
    anim.onfinish = () => {
      if (this.run !== run) return;
      this.run = null;
      this.v = target;
      this.el.style[this.prop] = this.format(target);
      anim.cancel();
      onDone?.();
    };
  }
  stop() { if (this.run) { const v = this.current(); this.run.anim.cancel(); this.run = null; this.v = v; this.el.style[this.prop] = this.format(v); } }
}

// A JS-driven number (SVG pathLength / opacity attributes), stepped on rAF with the frame timestamp.
const ticker = {
  items: new Set(),
  raf: 0,
  last: 0,
  interval: 1000 / 60, // last frame interval seen (the swap starts its animations one frame after the check)
  add(item) {
    this.items.add(item);
    if (!this.raf) this.raf = requestAnimationFrame((ts) => this.tick(ts));
  },
  tick(ts) {
    this.raf = 0;
    const t = Math.max(ts, 0);
    if (this.last && t - this.last > 4 && t - this.last < 50) this.interval = t - this.last;
    this.last = t;
    for (const item of [...this.items]) if (!item.step(t)) this.items.delete(item);
    if (this.items.size) this.raf = requestAnimationFrame((x) => this.tick(x));
  },
};
class JsValue {
  constructor(apply, v) {
    this.apply = apply;
    this.v = v;
    this.run = null;
    apply(v);
  }
  current(t = now()) {
    const r = this.run;
    if (!r) return this.v;
    const e = t - r.t0 - r.delay;
    if (e < 0 || (e === 0 && r.duration)) return r.from;
    const p = r.duration ? r.ease(Math.min(e / r.duration, 1)) : 1;
    return r.from + (r.to - r.from) * p;
  }
  to(target, { t0 = now(), delay = 0, duration, ease = EASE_OUT, onDone }) {
    const from = this.current(t0);
    this.v = from;
    this.run = { from, to: target, t0, delay, duration, ease, onDone };
    ticker.add(this);
  }
  step(t) {
    const r = this.run;
    if (!r) return false;
    if (t - r.t0 - r.delay >= r.duration) {
      this.run = null;
      this.v = r.to;
      this.apply(r.to);
      r.onDone?.(t);
      return false;
    }
    this.v = this.current(t);
    this.apply(this.v);
    return true;
  }
  stop() { if (this.run) { this.v = this.current(); this.run = null; } }
}

// Motion's pathLength on an SVG path: pathLength="1", stroke-dasharray "<len> 1", stroke-dashoffset 0
function svgPath(path) {
  const len = new JsValue((v) => path.setAttribute("stroke-dasharray", `${v} 1`), 0);
  const op = new JsValue((v) => path.setAttribute("opacity", String(v)), 0);
  return { len, op };
}

// ---------- DOM helpers ----------
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function svgEl(html) {
  const t = document.createElementNS(SVGNS, "svg");
  t.innerHTML = html;
  return t;
}
// clerk.com's text writer: replace the single text node's data, else textContent
function d(e, r) {
  if (!e) return;
  const a = e.firstChild;
  if (a && !a.nextSibling && a.nodeType === Node.TEXT_NODE) a.data = r;
  else e.textContent = r;
}
const opacity = ([o]) => String(o);

// ---------- NoiseCode (clerk.com's `p`, keyed by the user's name) ----------
// Two blocks of 600 random characters above and below the chip, a vignette, and the gray chip. Hovered, a rAF loop
// re-slices the 1200-char source every 200 ms and writes the chip's text from it; a light band sweeps the noise.
class Noise {
  constructor(row) {
    this.row = row;
    this.y = null; // refs y/g (top/bottom strings), set from the first render's source
    this.g = null;
    this.u = "&nbsp;"; // states u/j: the hovered branch's rendered text
    this.j = "&nbsp;";
    this.hov = null; // present hovered branch
    this.rest = null; // present static branch
    this.exiting = null; // exiting hovered branch
    this.vignette = el("div", "ml-vignette");
    this.code = el("div", "ml-code", CODE_PLACEHOLDER);
    this.raf = 0;
    this.eff = null; // last effect deps
    const first = row.firstChild;
    row.insertBefore(this.vignette, first);
    row.insertBefore(this.code, first);
  }
  remove() {
    this.cleanup();
    for (const b of [this.hov, this.rest, this.exiting]) if (b) b.nodes.forEach((x) => x.remove());
    this.vignette.remove();
    this.code.remove();
  }
  insertBranch(nodes) { for (const x of nodes) this.row.insertBefore(x, this.vignette); }
  // one React render of `p` with props {hovered, enterDelay}
  render(hovered, A, t0) {
    const c = n(1200);
    if (this.y === null) { this.y = c.slice(0, 600); this.g = c.slice(600); }
    // AnimatePresence: "hovered" / "not-hovered" branches
    if (hovered) {
      if (this.rest) { this.rest.nodes.forEach((x) => x.remove()); this.rest = null; }
      if (!this.hov) {
        if (this.exiting) { // same key back while it fades out: revive (opacity back to 1, default tween)
          this.hov = this.exiting;
          this.exiting = null;
          this.hov.fades.forEach((v) => v.to([1], { t0, ...DEF }));
          d(this.hov.top, this.u);
          d(this.hov.bot, this.j);
        } else {
          this.hov = this.mountHovered(A, t0);
        }
      }
    } else {
      if (this.hov) {
        const b = this.hov;
        this.hov = null;
        this.exiting = b;
        let left = b.fades.length;
        b.fades.forEach((v) => v.to([0], { t0, ...DEF, onDone: () => {
          if (--left || this.exiting !== b) return;
          b.nodes.forEach((x) => x.remove());
          this.exiting = null;
        } }));
      }
      if (!this.rest) {
        const top = el("div", "ml-noise-top");
        const topText = el("div", "", " ");
        top.append(topText);
        const bot = el("div", "ml-noise-bot", " ");
        this.rest = { nodes: [top, bot], top: topText, bot };
        this.insertBranch(this.rest.nodes);
      }
    }
    this.effect(hovered, c);
  }
  mountHovered(A, t0) {
    const top = el("div", "ml-noise-top ml-hov");
    const topText = el("div", "ml-shimmer", this.u);
    top.append(topText);
    const bot = el("div", "ml-noise-bot ml-hov ml-shimmer", this.j);
    const nodes = [top, bot];
    this.insertBranch(nodes);
    for (const x of [topText, bot]) {
      const a = x.animate(
        { backgroundPosition: ["calc(-100% - 5rem) 0%", "calc(-200% - 5rem) 0%"] },
        { delay: (A + 0.5) * 1000, duration: 3000, easing: "linear", fill: "both" },
      );
      startAt(a, t0);
    }
    const fades = [new Value(topText, "opacity", opacity, [1], false), new Value(bot, "opacity", opacity, [1], false)];
    return { nodes, top: topText, bot, fades };
  }
  cleanup() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; }
  // useEffect(..., [hovered, 600, c]): re-runs when the hover state or the (string) source changes
  effect(hovered, c) {
    if (this.eff && this.eff.hovered === hovered && this.eff.c === c) return;
    this.cleanup();
    this.eff = { hovered, c };
    if (!hovered) {
      d(this.rest?.top, this.y);
      d(this.rest?.bot, this.g);
      const changed = this.u !== this.y || this.j !== this.g;
      this.u = this.y;
      this.j = this.g;
      if (changed) this.render(false); // setState → `p` renders again (a fresh source, same texts)
      return;
    }
    let r = 0;
    const loop = () => {
      const i = window.performance.now();
      if (i < r) { this.raf = requestAnimationFrame(loop); return; }
      r = i + 200;
      const s = 600 * Math.random() * 2;
      this.y = c.slice(s, s + 600) + c.slice(0, Math.max(0, s - 600));
      d(this.hov?.top, this.y);
      const l = 600 * Math.random() * 2;
      this.g = c.slice(l, l + 600) + c.slice(0, Math.max(0, l - 600));
      d(this.hov?.bot, this.g);
      d(this.code, this.y.slice(0, 14));
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
}

// ---------- scanner (clerk.com's `x`, keyed by name): line + glow + 16 particles, synced with the code reveal ----------
class Scanner {
  constructor(A, t0) {
    this.root = el("div", "ml-scanner");
    const clip = el("div", "ml-scanclip");
    const glow = el("div", "ml-glow");
    this.particles = el("div", "ml-particles");
    const line = el("div", "ml-line");
    clip.append(glow, this.particles);
    this.root.append(clip, line);
    const run = (node, kf, opts) => {
      startAt(node.animate(kf, { fill: "both", easing: "linear", ...opts }), t0);
    };
    const T = { delay: A * 1000, duration: 3000 };
    run(this.root, { transform: ["translateX(-110%)", "translateX(10%)"] }, T);
    run(glow, { transform: ["translateX(1.75rem)", "translateX(0rem)", "translateX(0rem)", "translate(1.75rem)"], offset: [0, 0.8 / 3, 2.6 / 3, 1] }, T);
    const fade = { offset: [0, 0.2 / 3, 2.6 / 3, 1] };
    run(this.particles, { opacity: [0, 1, 1, 0], ...fade }, T);
    run(line, { transform: ["scaleY(0.5)", "scaleY(1)", "scaleY(1)", "scaleY(0.5)"], ...fade }, T);
    run(line, { opacity: [0, 1, 1, 0], ...fade }, T);
    this.dots = [];
    for (let k = 0; k < 16; k++) {
      const i = A + +Math.random(), o = 1 + +Math.random();
      const dot = el("div", "ml-particle");
      dot.style.top = `${100 * Math.random()}%`;
      this.particles.append(dot);
      this.dots.push(dot);
      const timing = { delay: i * 1000, duration: o * 1000, easing: "ease-out", iterations: Infinity };
      run(dot, [{ opacity: 0, offset: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 0, offset: 1 }], timing);
      run(dot, { transform: ["translateX(0rem)", "translateX(-1rem)"] }, timing);
    }
  }
  // a re-render: new random top per particle (Motion keeps the running animations, the style updates)
  rerender() {
    for (const dot of this.dots) {
      Math.random(); Math.random();
      dot.style.top = `${100 * Math.random()}%`;
    }
  }
}

// ---------- overlay over the chip (present while hovered): sizer, cyan code (keyed), scanner (keyed) ----------
const clip = (p) => `polygon(${p[0]}% ${p[1]}%, ${p[2]}% ${p[3]}%, ${p[4]}% ${p[5]}%, ${p[6]}% ${p[7]}%)`;
const CLIP_HIDDEN = [-10, 0, -10, 0, -10, 110, -10, 110];
const CLIP_SHOWN = [-10, 0, 110, 0, 110, 100, -10, 100];
const CLIP_GONE = [110, 0, 110, 0, 110, 100, 110, 100];
class Overlay {
  constructor(row, user, A, t0) {
    this.el = el("div", "ml-overlay");
    this.el.append(el("span", "ml-sizer", CODE_PLACEHOLDER));
    this.op = new Value(this.el, "opacity", opacity, [1], false);
    this.cyan = null;
    this.mountKeyed(user, A, t0);
    row.append(this.el);
  }
  mountKeyed(user, A, t0) {
    const cy = el("div", "ml-cyan", user.code);
    cy.clip = new Value(cy, "clipPath", clip, CLIP_HIDDEN);
    cy.clip.to(CLIP_SHOWN, { t0, delay: A * 1000, duration: 3000, ease: LINEAR });
    this.scanner = new Scanner(A, t0);
    this.el.insertBefore(cy, this.scannerEl || null);
    this.el.append(this.scanner.root);
    this.scannerEl = this.scanner.root;
    this.cyan = cy;
  }
  // a MagicLinks render while present
  render(user, A, t0, changed) {
    if (!changed) {
      d(this.cyan, user.code);
      this.scanner.rerender();
      return;
    }
    // old cyan code wipes out left → right (its own exit), old scanner is replaced at once
    const old = this.cyan;
    old.clip.to(CLIP_GONE, { t0, delay: 500, duration: 1000, ease: EASE_SWAP, onDone: () => old.remove() });
    this.scannerEl.remove();
    this.scannerEl = null;
    this.mountKeyed(user, A, t0);
  }
  exit(t0, done) { this.op.to([0], { t0, ...DEF, onDone: done }); }
  revive(t0) { this.op.to([1], { t0, ...DEF }); }
}
// ---------- profile (keyed by name, AnimatePresence popLayout) ----------
class Profile {
  constructor(user, entering, t0) {
    this.user = user;
    this.frozen = false;
    this.el = el("div", "ml-profile");
    this.face = el("div", "ml-face");
    this.face.append(svgEl(""));
    const base = this.face.firstChild;
    for (const [k, v] of [["viewBox", "0 0 80 96"], ["fill", "none"], ["aria-hidden", "true"], ["stroke-linecap", "round"], ["stroke-linejoin", "round"], ["stroke-width", "1.5"]]) base.setAttribute(k, v);
    base.innerHTML = `<path d="${PATH_T}" class="ml-hi" transform="translate(0 1)"></path><path d="${PATH_O}" class="ml-hi" transform="translate(0 1)"></path><path d="${PATH_T}" class="ml-base"></path><path d="${PATH_O}" class="ml-base"></path>`;
    this.row = el("div", "ml-namerow");
    this.name = el("div", "ml-name", user.name);
    this.row.append(this.name);
    this.email = el("div", "ml-email", `${user.email}@⁠example.com`);
    this.el.append(this.face, this.row, this.email);
    this.rot = new Value(this.el, "transform", ([a]) => `rotate(${a}deg)`, [entering ? -45 : 0]);
    this.op = new Value(this.el, "opacity", opacity, [entering ? 0 : 1]);
    this.nameX = new Value(this.name, "transform", ([x]) => `translate(${x}rem, 0rem)`, [0], !entering);
    this.nameTarget = 0;
    this.cyan = null; // face trace (present) and its exiting copy
    this.cyanExit = null;
    this.check = null;
    this.checkExit = null;
    if (entering) {
      const swing = { t0, delay: 500, duration: 1000, ease: EASE_SWAP };
      this.rot.to([0], swing);
      this.op.to([1], swing);
    }
  }
  setEmail(user) { this.user = user; this.email.textContent = `${user.email}@⁠example.com`; }
  // a render with props {hovered, enterDelay}; an exiting profile is frozen with its last props
  update(hovered, A, t0, onCheck) {
    if (this.frozen) return;
    // name: animate changes only when the target changes
    const target = hovered ? -0.5625 : 0;
    if (target !== this.nameTarget) {
      this.nameTarget = target;
      this.nameX.to([target], hovered ? { t0, delay: (A + 3) * 1000, ...DEF } : { t0, ...DEF });
    }
    if (hovered) {
      if (!this.cyan) {
        if (this.cyanExit) { this.cyan = this.cyanExit; this.cyanExit = null; }
        else this.cyan = this.mountCyan();
        this.enterCyan(A, t0);
      }
      if (!this.check) {
        if (this.checkExit) { this.check = this.checkExit; this.checkExit = null; }
        else this.check = this.mountCheck();
        this.enterCheck(A, t0, onCheck);
      }
    } else {
      if (this.cyan) {
        const c = (this.cyanExit = this.cyan);
        this.cyan = null;
        let left = 4;
        const done = () => { if (--left || this.cyanExit !== c) return; c.svg.remove(); this.cyanExit = null; };
        for (const p of c.paths) { p.len.to(0, { t0, ...DEF, onDone: done }); p.op.to(0, { t0, ...DEF, onDone: done }); }
      }
      if (this.check) {
        const c = (this.checkExit = this.check);
        this.check = null;
        let left = 2;
        const done = () => { if (--left || this.checkExit !== c) return; c.el.remove(); this.checkExit = null; };
        c.op.to([0], { t0, ...DEF, onDone: done });
        c.scale.to([0.5], { t0, ...DEF, onDone: done });
      }
    }
  }
  mountCyan() {
    const svg = svgEl(`<path d="${PATH_T}" pathLength="1" stroke-dashoffset="0"></path><path d="${PATH_O}" pathLength="1" stroke-dashoffset="0"></path>`);
    for (const [k, v] of [["viewBox", "0 0 80 96"], ["fill", "none"], ["aria-hidden", "true"], ["class", "ml-face-cyan"], ["stroke-linecap", "round"], ["stroke-linejoin", "round"], ["stroke-width", "1.5"]]) svg.setAttribute(k, v);
    this.face.append(svg);
    return { svg, paths: [...svg.children].map(svgPath) };
  }
  enterCyan(A, t0) {
    const [T, O] = this.cyan.paths;
    T.len.to(1, { t0, delay: A * 1000, duration: 3000, ease: EASE_OUT });
    T.op.to(1, { t0, delay: (A + 0.01) * 1000, duration: 0 });
    O.len.to(1, { t0, delay: (A + 0.2) * 1000, duration: 2700, ease: EASE_OUT });
    O.op.to(1, { t0, delay: (A + 0.2 + 0.01) * 1000, duration: 0 });
  }
  mountCheck() {
    const node = el("div", "ml-check");
    const svg = svgEl(`<path stroke="#131316" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25" d="${PATH_CHECK}" pathLength="1" stroke-dashoffset="0"></path>`);
    for (const [k, v] of [["viewBox", "0 0 12 12"], ["fill", "none"], ["aria-hidden", "true"]]) svg.setAttribute(k, v);
    node.append(svg);
    this.row.append(node);
    return {
      el: node,
      op: new Value(node, "opacity", opacity, [0]),
      scale: new Value(node, "transform", ([s]) => `scale(${s})`, [0.5]),
      path: svgPath(svg.firstChild),
      pathStarted: false,
    };
  }
  enterCheck(A, t0, onCheck) {
    const c = this.check;
    const i = A + 3 + 0.1;
    c.op.to([1], { t0, delay: i * 1000, ...DEF });
    c.scale.to([1], { t0, delay: i * 1000, ...DEF });
    if (c.pathStarted) return; // the path's animate target never changes: Motion does not restart it
    c.pathStarted = true;
    // onAnimationComplete of {pathLength: 1, opacity: 1}: only while the check is present (useIsPresent)
    let left = 2;
    const done = (t) => { if (--left === 0 && this.check === c && !this.frozen) onCheck(t); };
    c.path.len.to(1, { t0, delay: (i + 0.3) * 1000, duration: 200, ease: EASE_OUT, onDone: done });
    c.path.op.to(1, { t0, delay: (i + 0.3) * 1000, duration: 0, onDone: done });
  }
  // popLayout exit: out of the flow at its last box (Motion's PopChild: computed width/height, offsetTop/Left),
  // frozen, swings to 45° and fades
  exit(t0) {
    const cs = getComputedStyle(this.el);
    const w = parseFloat(cs.width), h = parseFloat(cs.height);
    const { offsetTop: top, offsetLeft: left } = this.el;
    Object.assign(this.el.style, { top: `${top}px`, left: `${left}px`, width: `${w}px`, height: `${h}px` });
    this.el.classList.add("ml-popped");
    this.frozen = true;
    const swing = { t0, delay: 500, duration: 1000, ease: EASE_SWAP };
    this.rot.to([45], swing);
    this.op.to([0], { ...swing, onDone: () => this.el.remove() });
  }
}

// ---------- the card ----------
export function mount(slot, card) {
  const root = slot.querySelector(".ml-root");
  if (!root || !card) return;
  const row = root.querySelector(".ml-coderow");
  const bottom = root.querySelector(".ml-bottom");

  let hovered = false;
  let A = 0; // enterDelay: 0 on the first cycle of a hover, 1.6 s after each swap
  let user = { name: "Joseph Cole", email: "j.cole", code: n(14) };
  let noise = new Noise(row);
  let overlay = null;
  let overlayExit = null;
  let profile = new Profile(user, false);
  bottom.append(profile.el);
  noise.render(false, A, now());

  // one render of MagicLinks; `changed`: the user (key) changed
  function render(t0, changed) {
    if (changed) { noise.remove(); noise = new Noise(row); }
    noise.render(hovered, A, t0);
    if (hovered) {
      if (overlay) overlay.render(user, A, t0, changed);
      else if (overlayExit) { overlay = overlayExit; overlayExit = null; overlay.revive(t0); overlay.render(user, A, t0, changed); }
      else overlay = new Overlay(row, user, A, t0);
    } else if (overlay) {
      const o = (overlayExit = overlay);
      overlay = null;
      o.exit(t0, () => { if (overlayExit === o) { o.el.remove(); overlayExit = null; } });
    }
    if (changed) {
      profile.exit(t0);
      profile = new Profile(user, true, t0);
      bottom.append(profile.el);
    } else {
      profile.setEmail(user);
    }
    profile.update(hovered, A, t0, onCheck);
  }

  // the check mark finished drawing (frame time t): next random user, new code, next cycle 1.6 s later.
  // The DOM swaps in this frame; as on clerk.com (onAnimationComplete → React render → Motion), the new animations
  // take their time origin from the next frame.
  function onCheck(t) {
    const e = USERS[Math.floor(Math.random() * USERS.length)];
    const next = { name: e, email: emailOf(e), code: n(14) };
    const changed = next.name !== user.name;
    user = next;
    A = 1.6;
    render((t ?? now()) + ticker.interval, changed);
  }

  function setHovered(on) {
    if (on === hovered) return;
    hovered = on;
    if (!on) A = 0;
    render(now(), false);
  }

  // react-aria useHover on the card root: pointer enter/leave, touch ignored
  card.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") setHovered(true); });
  card.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") setHovered(false); });
}
