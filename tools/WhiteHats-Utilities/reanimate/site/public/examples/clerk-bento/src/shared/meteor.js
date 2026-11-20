// Meteor: clerk.com's shared light-streak canvas, ported to a plain ES module.
//
// A faithful port of clerk.com's React <Meteor> (turbopack module 242116, used by the session-management,
// fraud, social-sign-on, api-keys and clerk-cli cards). Same options, same defaults, same drawing calls in the
// same order, same clock, so a capture of this canvas matches clerk.com's pixel for pixel. No randomness.
//
// What it draws: each meteor is `segments` small squares (default 20 × 1.25 px, 2.5 px apart: 72.5 px long)
// that travel along an SVG path at `speed` px/ms (default 0.3) in a straight-line, linear motion. Each square
// is stroked with a colour taken from the `stops` ramp (tail = 0 → head = 1, channels mixed as
// sqrt(a²(1-p)+b²p), alpha linear, like popmotion's mixColor), over a faint 2.5 px glow blob (a 10×10 PNG,
// recoloured with a tail→head canvas gradient through "source-atop").
//
// ---------------------------------------------------------------------------------------------------------
// API
//
//   import { createMeteor } from "../shared/meteor.js";      // from src/widgets/<slug>.js
//
//   const meteor = createMeteor(container, {
//     meteors: [{ width: 600, height: 87, path: "M0 86h136…H600", repeat: 2000 }],
//     stops: "dark",
//   });
//   …
//   meteor.exit().then(…)   // fade out (0.3 s, as clerk.com's AnimatePresence exit) and destroy
//   meteor.destroy()        // or remove at once
//
// createMeteor(container, options) appends, like clerk.com's markup,
//     <div data-meteor>                       ← wrapper (static block; clerk.com's motion.div exit wrapper)
//       <canvas aria-hidden>                  ← position:absolute; inset:0; width:100%; height:100%
//       <svg width=0 height=0 aria-hidden><path d=…></svg>   ← one per meteor, used for getPointAtLength()
//     </div>
// to `container`. The canvas fills the nearest positioned ancestor (normally `container`: give it
// position:relative/absolute and the meteor's width × height, as clerk.com does). The backing store is
// offsetWidth × offsetHeight × clamp(devicePixelRatio, 1, 2), measured once at creation (and on refresh()).
//
// options (all as clerk.com's props; defaults in brackets):
//   meteors     required. Array of { width, height, path, delay [0], repeat, direction, onBegin, onEnd }:
//                 width, height  the coordinate box of `path` (the path is scaled by canvas CSS size / width,
//                                height; only absolute M, L, H, V, C numbers are scaled, exactly as clerk.com)
//                 path           SVG path data the meteor follows (from its start to its end)
//                 delay          ms after the clock start before the first run
//                 repeat         ms period: the run restarts every `repeat` ms (a hard wrap, even mid-flight).
//                                Without it the meteor runs once.
//                 direction      "reverse" runs the path end → start (colours flip too)
//                 onBegin()      called on the first drawn frame of each run. Returning `false` stops the
//                                whole loop at once (clerk.com's social-sign-on uses this to finish its exit).
//                 onEnd()        called when the tail has passed the end of the path
//   skip        [0]      px along the path where each run starts (the meteor is already `skip` px in)
//   segments    [20]     squares per meteor
//   minSize     [1.25]   square size and line width at the tail (px)
//   maxSize     [1.25]   … at the head (interpolated in between)
//   gap         [2.5]    px between squares
//   stops       ["light"] "light" (cyan tail → purple head), "dark" (purple tail → cyan head), or a custom
//                        list [[cssColor, offset 0..1], …] e.g. fraud's
//                        [["rgb(185 28 28 / 0)", 0], ["rgb(185 28 28)", .5], ["rgb(243 107 22)", 1]]
//                        (hex, rgb()/rgba(), hsl()/hsla() as popmotion parses them)
//   wait        [false]  idle (draw nothing, clock not started) until start() is called
//   speed       [0.3]    px per ms
//   style                inline style for the <canvas> (object or cssText string), as the React prop
//   className            class for the wrapper <div>
//
// handle = createMeteor(…):
//   handle.el          the wrapper <div>;  handle.canvas  the <canvas>
//   handle.start()     clerk.com's ref.start(): restart the clock on the next frame, every run from the
//                      beginning, and release `wait`. Also restarts the loop if it was stopped.
//   handle.stop()      stop the rAF loop (the canvas keeps its last frame)
//   handle.refresh()   what a re-render of clerk.com's <Meteor> does (its effect depends on inline props):
//                      re-measure the canvas, reset each meteor's `playing` flag (so onBegin fires again for a
//                      meteor in flight) and restart the loop on the next frame, keeping the clock
//   handle.exit({ duration = 300, easing = "cubic-bezier(.25,.1,.35,1)" } = {}) → Promise
//                      fade the wrapper to opacity 0 (Motion's default 0.3 s exit tween, the
//                      AnimatePresence `exit:{opacity:0}` wrapper the five cards use), keep drawing meanwhile,
//                      then destroy(). Resolves true when removed, false if revive() interrupted it.
//   handle.revive()    cancel a running exit: fade back to opacity 1 (same default tween), clock continues
//                      (clerk.com: re-hovering during the exit revives the same instance)
//   handle.destroy()   stop and remove the wrapper (idempotent)
//   handle.time        ms on the meteor clock (0 before the first frame);  handle.running  loop active?
//   handle.exiting     true during exit()
//
// Clock and loop (as clerk.com): the loop starts when the glow image has loaded (about one frame after
// creation); the clock origin is the first frame's performance.now(). Each frame: clearRect, then per meteor
// y = (time − delay) % repeat (or time − delay without repeat); nothing drawn while y ≤ 0; tail position
// = skip − length + y·speed. clerk.com does not pause the loop off screen (the canvas only exists while the
// card is hovered), and neither does this port.
// ---------------------------------------------------------------------------------------------------------

export const METEOR_STOPS = {
  light: [["rgb(93 227 255 / 0)", 0], ["rgb(93 227 255)", 0.5], ["rgb(108 71 255)", 1]],
  dark: [["rgb(108 71 255 / 0)", 0], ["rgb(108 71 255)", 0.5], ["rgb(93 227 255)", 1]],
};

// clerk.com's embedded 10×10 glow blob (faint cyan, peak alpha 19/255)
const GLOW_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAMAAAC67D+PAAAAAXNSR0IArs4c6QAAAEhQTFRFAAAA////AP//AAD/AP//gID/AP//AKr/AL//ANX/AKr/ALb/AN//AL//AMb/AMbjAMz/ANH/ALnoANj/AMj/AMjtANX/AMn/G8447gAAABh0Uk5TAAEBAQICAwMEBgYHCAgJCQoLCw0ODhITA3IuUQAAAEdJREFUeNoNycENwzAMBMFdkgmQ/qs1IPHi+Q4qIioMnfXQNdPfD5KJ/op+cgrHeg8rRONSI3vI7t321i7Pngh21blEDCDwB0UUHis/7NTIAAAAAElFTkSuQmCC";

// ---------- colour parsing and mixing (popmotion / style-value-types, as bundled by clerk.com) ----------

const clamp = (min, max) => (v) => Math.max(Math.min(v, max), min);
const sanitize = (v) => (v % 1 ? Number(v.toFixed(5)) : v);
const floatRegex = /(-)?([\d]*\.?[\d])+/g;
const colorRegex =
  /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2}(-?[\d\.]+%?)\s*[\,\/]?\s*[\d\.]*%?\))$/i;
const isString = (v) => typeof v === "string";
const alpha01 = clamp(0, 1);
const percent = { transform: (v) => `${v}%` };
const isColorString = (type, key) => (v) =>
  !!((isString(v) && colorRegex.test(v) && v.startsWith(type)) || (key && Object.prototype.hasOwnProperty.call(v, key)));
const splitColor = (a, b, c) => (v) => {
  if (!isString(v)) return v;
  const [x, y, z, alpha] = v.match(floatRegex);
  return { [a]: parseFloat(x), [b]: parseFloat(y), [c]: parseFloat(z), alpha: alpha !== undefined ? parseFloat(alpha) : 1 };
};
const hsla = {
  test: isColorString("hsl", "hue"),
  parse: splitColor("hue", "saturation", "lightness"),
  transform: ({ hue, saturation, lightness, alpha = 1 }) =>
    "hsla(" + Math.round(hue) + ", " + percent.transform(sanitize(saturation)) + ", " +
    percent.transform(sanitize(lightness)) + ", " + sanitize(alpha01(alpha)) + ")",
};
const clamp255 = clamp(0, 255);
const rgbUnit = { transform: (v) => Math.round(clamp255(v)) };
const rgba = {
  test: isColorString("rgb", "red"),
  parse: splitColor("red", "green", "blue"),
  transform: ({ red, green, blue, alpha = 1 }) =>
    "rgba(" + rgbUnit.transform(red) + ", " + rgbUnit.transform(green) + ", " + rgbUnit.transform(blue) + ", " +
    sanitize(alpha01(alpha)) + ")",
};
const hex = {
  test: isColorString("#"),
  parse(v) {
    let r = "", g = "", b = "", a = "";
    if (v.length > 5) { r = v.substr(1, 2); g = v.substr(3, 2); b = v.substr(5, 2); a = v.substr(7, 2); }
    else { r = v.substr(1, 1); g = v.substr(2, 1); b = v.substr(3, 1); a = v.substr(4, 1); r += r; g += g; b += b; a += a; }
    return { red: parseInt(r, 16), green: parseInt(g, 16), blue: parseInt(b, 16), alpha: a ? parseInt(a, 16) / 255 : 1 };
  },
  transform: rgba.transform,
};
function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
function hslaToRgba({ hue, saturation, lightness, alpha }) {
  hue /= 360; saturation /= 100; lightness /= 100;
  let red = 0, green = 0, blue = 0;
  if (!saturation) red = green = blue = lightness;
  else {
    const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    red = hueToRgb(p, q, hue + 1 / 3); green = hueToRgb(p, q, hue); blue = hueToRgb(p, q, hue - 1 / 3);
  }
  return { red: Math.round(red * 255), green: Math.round(green * 255), blue: Math.round(blue * 255), alpha };
}
const mixLinearColor = (from, to, v) => {
  const fromExpo = from * from;
  return Math.sqrt(Math.max(0, v * (to * to - fromExpo) + fromExpo));
};
const colorTypes = [hex, rgba, hsla];
const getColorType = (v) => colorTypes.find((type) => type.test(v));
function mixColor(from, to) {
  let fromType = getColorType(from), toType = getColorType(to);
  if (!fromType || !toType) throw new Error(`[meteor] '${!fromType ? from : to}' is not an animatable color`);
  let fromColor = fromType.parse(from), toColor = toType.parse(to);
  if (fromType === hsla) { fromColor = hslaToRgba(fromColor); fromType = rgba; }
  if (toType === hsla) { toColor = hslaToRgba(toColor); toType = rgba; }
  const blended = Object.assign({}, fromColor);
  return (v) => {
    for (const key in blended) if (key !== "alpha") blended[key] = mixLinearColor(fromColor[key], toColor[key], v);
    blended.alpha = -v * fromColor.alpha + v * toColor.alpha + fromColor.alpha;
    return fromType.transform(blended);
  };
}
/** colour at h (0 = tail … 1 = head) of a stops list, as clerk.com's ramp (undefined outside the stops) */
export function stopsColor(stops) {
  const segs = stops.slice(0, -1).map((stop, i) => [mixColor(stop[0], stops[i + 1][0]), stop[1], stops[i + 1][1]]);
  return (h) => {
    for (const [mix, a, b] of segs) if (h >= a && h <= b) return mix((h - a) / (b - a));
  };
}

/** length in px of the first `count` squares and the gaps between them (count defaults to all: the meteor length) */
export function meteorLength(segments, minSize, maxSize, gap, count) {
  let len = 0;
  for (let k = 0; k < (count ?? segments); k++) len += minSize + (k / (segments - 1)) * (maxSize - minSize);
  return len + gap * ((count ?? segments) - 1);
}

const SVG_NS = "http://www.w3.org/2000/svg";

export function createMeteor(container, options = {}) {
  const {
    meteors,
    style,
    className,
    skip = 0,
    segments = 20,
    minSize = 1.25,
    maxSize = 1.25,
    gap = 2.5,
    stops: stopsOpt = "light",
    wait = false,
    speed = 0.3,
  } = options;
  if (!Array.isArray(meteors)) throw new Error("[meteor] options.meteors (array) is required");
  const stops = typeof stopsOpt === "string" ? METEOR_STOPS[stopsOpt] : stopsOpt;
  if (!stops) throw new Error(`[meteor] unknown stops preset "${stopsOpt}"`);
  const colorAt = stopsColor(stops);

  // DOM, as clerk.com renders it (inside its AnimatePresence motion.div)
  const el = document.createElement("div");
  el.dataset.meteor = "";
  if (className) el.className = className;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  if (typeof style === "string") canvas.style.cssText += style;
  else if (style) Object.assign(canvas.style, style);
  el.append(canvas);
  const paths = meteors.map((m) => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;"; // keeps it out of any layout
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", m.path);
    svg.append(path);
    el.append(svg);
    return path;
  });
  container.append(el);

  // refs (persist across refresh(), as React refs persist across effect runs)
  let origin = null; // clock origin (performance.now of the first frame)
  let elapsed = 0;
  let waiting = wait;
  const state = []; // per meteor: { path, meteorLength, d, totalLength, w, h, playing }
  let destroyed = false;
  let teardown = null; // cleanup of the current "effect" run
  let running = false;
  let exitAnim = null;

  // one run of clerk.com's useEffect
  function setup() {
    let raf;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio, 2));
    let ctx = canvas.getContext("2d");
    if (!ctx) return () => {};
    const W = canvas.offsetWidth * dpr;
    const H = canvas.offsetHeight * dpr;
    canvas.width = W;
    canvas.height = H;
    ctx.scale(dpr, dpr);
    if (state.length === 0)
      for (let e = 0; e < meteors.length; e++) {
        const m = meteors[e];
        const len = meteorLength(segments, minSize, maxSize, gap);
        const d = -len * (canvas.width / m.width / dpr);
        let total = paths[e].getTotalLength();
        total = (total * (canvas.width / m.width)) / dpr;
        const sx = W / m.width / dpr, sy = H / m.height / dpr;
        const path2d = new window.Path2D(
          m.path
            .replace(/H\s*([\d.]+)/g, (_, x) => `H${parseFloat(x) * sx}`)
            .replace(/V\s*([\d.]+)/g, (_, y) => `V${parseFloat(y) * sy}`)
            .replace(/(M|L)\s*([\d.]+)\s+([\d.]+)/g, (_, c, x, y) => `${c}${parseFloat(x) * sx} ${parseFloat(y) * sy}`)
            .replace(
              /C\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/g,
              (_, a, b, c, d2, e2, f) =>
                `C${parseFloat(a) * sx} ${parseFloat(b) * sy} ${parseFloat(c) * sx} ${parseFloat(d2) * sy} ${parseFloat(e2) * sx} ${parseFloat(f) * sy}`,
            ),
        );
        state[e] = { path: path2d, meteorLength: len, d, totalLength: total, w: W, h: H, playing: false };
      }
    const img = new Image();

    function frame() {
      if (waiting) {
        raf = window.requestAnimationFrame(frame);
        return;
      }
      if (!canvas || !ctx) return;
      const now = performance.now();
      if (origin === null) origin = now;
      elapsed = now - origin;
      ctx.clearRect(0, 0, W, H);
      for (let e = 0; e < state.length; e++) {
        if (!paths[e]) continue;
        const { delay = 0, repeat, width, direction } = meteors[e];
        const reverse = direction === "reverse";
        const s = state[e];
        const len = meteorLength(segments, minSize, maxSize, gap);
        let y = typeof repeat === "number" ? (elapsed - delay) % repeat : elapsed - delay;
        if ((y = Math.max(0, y)) <= 0) continue;
        const N = (skip * (canvas.width / width)) / dpr + (-len + (y * speed * (canvas.width / width)) / dpr);
        s.d = reverse ? s.totalLength - N - len : N;
        if (s.d > s.totalLength) {
          if (s.playing) {
            s.playing = false;
            meteors[e].onEnd?.();
            if (!ctx) return; // destroyed/stopped from the callback
          }
          continue;
        }
        if (!s.playing && ((s.playing = true), meteors[e].onBegin?.() === false)) {
          running = false;
          return;
        }
        if (!ctx) return; // destroyed/stopped from onBegin
        // glow blobs, recoloured by a tail → head gradient
        ctx.beginPath();
        ctx.globalAlpha = 100; // sic (out of range, ignored by canvas: alpha stays 1), as clerk.com
        for (let t = 0; t < segments; t++) {
          const r = meteorLength(segments, minSize, maxSize, gap, t + 1) + s.d;
          if (r < 0 || r > s.totalLength) continue;
          const n = (t + 1) / segments;
          const size = minSize + (reverse ? 1 - n : n) * (maxSize - minSize);
          const p = paths[e].getPointAtLength(r + size / 2);
          const u = 2 * size;
          ctx.drawImage(img, p.x - u / 2, p.y - u / 2, u, u);
        }
        ctx.globalAlpha = 1;
        const L = paths[e].getPointAtLength(s.d);
        const M = paths[e].getPointAtLength(s.d + len);
        const x0 = Math.min(L.x, M.x), x1 = Math.max(L.x, M.x), y0 = Math.min(L.y, M.y), y1 = Math.max(L.y, M.y);
        ctx.rect(x0 - 16, y0 - 16, x1 - x0 + 32, y1 - y0 + 32);
        const grad = reverse ? ctx.createLinearGradient(M.x, M.y, L.x, L.y) : ctx.createLinearGradient(L.x, L.y, M.x, M.y);
        for (const stop of stops) grad.addColorStop(stop[1], stop[0]);
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        // the squares: one dash of the full path each
        for (let t = 0; t < segments; t++) {
          const at = meteorLength(segments, minSize, maxSize, gap, t + 1) + s.d;
          if (at < 0 || at > s.totalLength) continue;
          const n = (t + 1) / segments;
          const size = minSize + (reverse ? 1 - n : n) * (maxSize - minSize);
          const h = reverse ? 1 - n : n;
          ctx.lineWidth = (size * (canvas.width / width)) / dpr;
          ctx.strokeStyle = colorAt(h);
          ctx.setLineDash([0, at, size, 999999]);
          ctx.stroke(s.path);
        }
      }
      raf = window.requestAnimationFrame(frame);
    }

    img.onload = () => {
      raf = window.requestAnimationFrame(frame);
    };
    img.src = GLOW_PNG;
    running = true;
    return () => {
      img.onload = null;
      window.cancelAnimationFrame(raf);
      ctx = null;
      state.length = 0;
      running = false;
    };
  }

  teardown = setup();

  const handle = {
    el,
    canvas,
    get time() {
      return elapsed;
    },
    get running() {
      return running;
    },
    get exiting() {
      return !!exitAnim;
    },
    start() {
      if (destroyed) return;
      origin = null;
      for (const s of state) s.d = 0;
      waiting = false;
      if (!running) {
        teardown?.();
        teardown = setup();
      }
    },
    stop() {
      if (destroyed || !running) return;
      // keep the pixels: cancel the loop without clearing
      teardown?.();
      teardown = null;
    },
    refresh() {
      if (destroyed) return;
      teardown?.();
      teardown = setup();
    },
    exit({ duration = 300, easing = "cubic-bezier(.25,.1,.35,1)" } = {}) {
      if (destroyed) return Promise.resolve(true);
      exitAnim?.cancel();
      const from = getComputedStyle(el).opacity;
      const anim = el.animate({ opacity: [from, 0] }, { duration, easing, fill: "both" });
      exitAnim = anim;
      return anim.finished.then(
        () => {
          if (exitAnim !== anim) return false;
          exitAnim = null;
          handle.destroy();
          return true;
        },
        () => false,
      );
    },
    revive({ duration = 300, easing = "cubic-bezier(.25,.1,.35,1)" } = {}) {
      if (destroyed || !exitAnim) return;
      const from = getComputedStyle(el).opacity;
      exitAnim.cancel();
      exitAnim = null;
      const anim = el.animate({ opacity: [from, 1] }, { duration, easing, fill: "both" });
      anim.finished.then(() => {
        if (!destroyed && !exitAnim) {
          el.style.opacity = "";
          anim.cancel();
        }
      }, () => {});
    },
    destroy() {
      if (destroyed) return;
      teardown?.();
      teardown = null;
      exitAnim?.cancel();
      exitAnim = null;
      destroyed = true;
      el.remove();
    },
  };
  return handle;
}
