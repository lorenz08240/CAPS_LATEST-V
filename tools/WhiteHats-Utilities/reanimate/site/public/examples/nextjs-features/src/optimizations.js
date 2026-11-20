// "Built-in Optimizations": three image frames (ORIGINAL, 1440PX, 375PX) drawn on a 2D canvas, each with a
// dotted mountain. Over the canvas the dots within 40 px of the pointer light up in six bands of blue; a
// press sends a ring out to 112 px that fades over 500 ms. Ported from nextjs.org's FeatureVisualOptimizations:
// the same dot data, drawing calls and colours, in its 322x246 coordinate space.
import { createLoop, createPointer, prefersReducedMotion, watchPixelRatio, watchReducedMotion } from "./phase.js";

const TAU = 2 * Math.PI;
const W = 322;
const H = 246;

// rows of [y, x0, x1, x2, x3 …]: a dot every 3.92 px from x0 to x1, x2 to x3 …
function dots(rows) {
  const out = [];
  for (const [y, ...xs] of rows)
    for (let i = 0; i < xs.length; i += 2) {
      const from = xs[i];
      const to = xs[i + 1];
      if (from !== undefined && to !== undefined) for (let x = from; x <= to + 0.01; x += 3.92) out.push(x, y);
    }
  return Float32Array.from(out);
}

const FRAMES = [
  {
    x: 88.5625, y: 0.5, width: 232, height: 161,
    label: "ORIGINAL", labelX: 302, labelY: 19.5, textAlign: "right", restingColorIndex: 0,
    dots: dots([
      [55.626, 151.643, 151.643], [59.546, 147.723, 155.562], [63.466, 143.803, 159.484], [67.386, 139.883, 163.403],
      [71.306, 135.962, 167.323], [75.226, 132.043, 171.243], [79.146, 128.123, 175.163], [83.066, 124.204, 179.084],
      [86.986, 120.284, 183.004], [90.906, 116.363, 186.923, 230.043, 233.962], [94.826, 112.443, 190.842, 226.123, 237.883],
      [98.746, 108.523, 194.762, 222.204, 241.803, 269.243, 273.163], [102.666, 104.603, 198.683, 218.284, 245.723, 265.323, 277.084],
      [106.586, 100.683, 202.603, 214.363, 249.643, 261.403, 281.004], [110.506, 96.762, 284.923], [114.426, 96.762, 288.842],
      [118.346, 96.762, 292.762], [122.266, 96.762, 296.683], [126.186, 96.762, 300.603], [130.106, 96.762, 304.523],
      [134.026, 96.762, 308.443], [137.946, 96.762, 312.363], [141.866, 96.762, 312.363], [145.786, 96.762, 312.363],
      [149.706, 96.762, 312.363], [153.626, 96.762, 312.363],
    ]),
  },
  {
    x: 46.5225, y: 86.366, width: 172, height: 107,
    label: "1440PX", labelX: 164, labelY: 103.5, textAlign: "start", restingColorIndex: 1,
    dots: dots([
      [115.712, 93.26, 93.26], [119.632, 89.34, 97.179], [123.552, 85.421, 101.101], [127.472, 81.501, 105.02],
      [131.392, 77.58, 108.94], [135.312, 73.66, 112.86], [139.232, 69.74, 116.78, 152.06, 152.06],
      [143.152, 65.821, 120.701, 148.14, 155.98], [147.072, 61.901, 124.621, 144.22, 159.901, 179.501, 183.421],
      [150.992, 57.98, 128.541, 140.3, 163.821, 175.58, 187.34], [154.912, 54.06, 191.26], [158.832, 54.06, 195.179],
      [162.752, 54.06, 199.101], [166.672, 54.06, 203.02], [170.592, 54.06, 206.94], [174.512, 54.06, 210.86],
      [178.432, 54.06, 210.86], [182.352, 54.06, 210.86], [186.272, 54.06, 210.86],
    ]),
  },
  {
    x: 0.5, y: 174.5, width: 109, height: 71,
    label: "375PX", labelX: 65, labelY: 190, textAlign: "start", restingColorIndex: 1,
    dots: dots([
      [197.554, 29.52, 29.52], [201.473, 25.6, 33.441], [205.394, 21.68, 37.361], [209.313, 17.76, 41.28],
      [213.234, 13.84, 45.2, 64.8, 68.719], [217.154, 9.92, 49.12, 60.88, 72.641, 84.4, 88.32], [221.074, 6, 92.241],
      [224.994, 6, 96.161], [228.914, 6, 100.081], [232.834, 6, 104], [236.754, 6, 104], [240.674, 6, 104],
    ]),
  },
];

function drawFrame(ctx, f, c, px, py, radius, fade) {
  ctx.fillStyle = c.background;
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(f.x, f.y, f.width, f.height, 1.5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = c.label;
  ctx.font = c.monoFont;
  ctx.textAlign = f.textAlign;
  ctx.fillText(f.label, f.labelX, f.labelY);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(f.x, f.y, f.width, f.height, 1.5);
  ctx.clip();
  ctx.fillStyle = c.resting[f.restingColorIndex];
  const d = f.dots;
  ctx.beginPath();
  for (let i = 0; i < d.length; i += 2) {
    ctx.moveTo(d[i] + 1.4, d[i + 1]);
    ctx.arc(d[i], d[i + 1], 1.4, 0, TAU);
  }
  ctx.fill();
  if (radius > 0) {
    ctx.globalAlpha = 1 - fade;
    for (let i = 0; i < d.length; i += 2) {
      const x = d[i];
      const y = d[i + 1];
      const dist = Math.hypot(x - px, y - py);
      if (dist >= radius) continue;
      ctx.fillStyle = c.gradient[Math.min(c.gradient.length - 1, Math.floor((dist / radius) * c.gradient.length))];
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function mountOptimizations(wrap) {
  const canvas = wrap.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  let size = null; // the wrapper's content box
  let dpr = 1;
  let draw = null;
  const ripple = { active: false, x: 0, y: 0 };
  let rippleLoop = null;
  let reduced = false;
  watchReducedMotion((m) => (reduced = m));

  const colour = (name) => {
    canvas.style.color = `var(${name})`;
    return getComputedStyle(canvas).color;
  };
  function setup() {
    if (!size) return;
    const c = Math.min(dpr, 2);
    canvas.width = Math.round(size.width * c);
    canvas.height = Math.round(size.height * c);
    ctx.setTransform((size.width / W) * c, 0, 0, (size.height / H) * c, 0, 0);
    const root = getComputedStyle(document.documentElement);
    const colours = {
      background: colour("--color-background-200"),
      border: colour("--color-gray-500"),
      gradient: ["--color-blue-1000", "--color-blue-700", "--color-blue-600", "--color-blue-500", "--color-blue-400", "--color-blue-300"].map(colour),
      label: colour("--color-blue-900"),
      monoFont: `8px ${root.getPropertyValue("--font-mono").trim()}`,
      resting: [colour("--color-gray-300"), colour("--color-gray-400")],
    };
    canvas.style.removeProperty("color");
    draw = (px, py, radius, fade) => {
      ctx.clearRect(0, 0, W, H);
      for (const f of FRAMES) drawFrame(ctx, f, colours, px, py, radius, fade);
    };
    draw(0, 0, 0, 0);
    return colours.monoFont;
  }

  // nextjs.org draws once its fonts are in; wait for Geist Mono so the labels never start in a fallback
  let ready = false;
  const fontReady = document.fonts.load(`8px ${getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim()}`, "ORIGINAL1440PX375PX");
  fontReady.finally(() => {
    ready = true;
    setup();
  });
  new ResizeObserver((entries) => {
    for (const e of entries) {
      if (e.target !== wrap) continue;
      const box = e.contentBoxSize[0];
      if (!box || (size && box.inlineSize === size.width && box.blockSize === size.height)) continue;
      size = { width: box.inlineSize, height: box.blockSize };
      if (ready) setup();
    }
  }).observe(wrap);
  dpr = watchPixelRatio((r) => {
    dpr = r;
    if (ready) setup();
  });

  const pointer = createPointer({
    target: wrap,
    onPointer: (p) => {
      if (!draw || !size || ripple.active) return;
      if (!p.active) return void draw(0, 0, 0, 0);
      draw((p.x / size.width) * W, (p.y / size.height) * H, 40, 0);
    },
  });

  wrap.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || reduced || prefersReducedMotion()) return;
    const p = pointer.state;
    if (!p.active || !size) return;
    ripple.x = (p.x / size.width) * W;
    ripple.y = (p.y / size.height) * H;
    ripple.active = true;
    if (rippleLoop) return;
    // nextjs.org runs the ring on a second loop observing the same element with the same options as the
    // pointer tracker, so (like there) that loop only starts once the canvas leaves the screen and returns
    rippleLoop = createLoop({
      target: wrap,
      onTick: (t) => {
        if (!draw || !ripple.active) return;
        const k = Math.min(1, t.elapsed / 500);
        const eased = 1 - Math.pow(1 - k, 4);
        draw(ripple.x, ripple.y, 40 + 72 * eased, eased);
        if (k === 1) {
          ripple.active = false;
          draw(0, 0, 0, 0);
          rippleLoop.stop();
          rippleLoop = null;
        }
      },
    });
  });
}
