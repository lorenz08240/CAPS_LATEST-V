// "Dynamic HTML Streaming": a wireframe page on a grid. Once the card is well inside the viewport, four
// streaks of blue run along the grid lines into the page frame, each on its own loop, and every 5 s the image
// placeholder turns into an avatar (and back) while every 8 s the content blocks change layout. Hovering the
// illustration restarts the streaks on a faster 2 s loop. Ported from nextjs.org's FeatureVisualStreaming
// (React + Motion there); the timings, keyframes and easings are its own.
import { animate, cubicBezier, easeIn, easeOut } from "./motion.js";

// the four streaks: the path they run along, when they first start, and the pause between runs
const PULSES = [
  { delay: 2, repeatDelay: 2.5, initial: { x1: 0, x2: -52, y1: 33, y2: -18 }, animate: { x1: [0, 497], x2: [-52, 340], y1: [33, 33], y2: [-18, 97] } },
  { delay: 4, repeatDelay: 6, initial: { x1: 254.5, x2: 254.5, y1: 0, y2: -57 }, animate: { x1: [254.5, 20], x2: [254.5, 84], y1: [0, 227], y2: [-57, 113] } },
  { delay: 3, repeatDelay: 4, initial: { x1: -40, x2: -140, y1: 360, y2: 480 }, animate: { x1: [-40, 398], x2: [-140, 221], y1: [360, 484], y2: [480, 351] } },
  { delay: 0.5, repeatDelay: 2, initial: { x1: 423, x2: 467, y1: 197.5, y2: 197.5 }, animate: { x1: [423, 229], x2: [467, 264], y1: [197.5, 524], y2: [197.5, 257, 435] } },
];
const LOOP = { duration: 4, delay: 1.5, repeat: Infinity }; // Motion's ease for the gradient is easeOut, the stroke easeIn
const HOVER = { delay: 0, repeatDelay: 0, duration: 2 };

// the image placeholder: a 41.85 px square with a triangle, or a 23.35 px circle (the avatar)
const IMAGE = { size: 41.8457, rx: 2 };
const AVATAR = { size: 23.3515625, rx: 11.67578125 };
function triangle(size) {
  const k = size / IMAGE.size;
  const cx = 75.0781 + IMAGE.size / 2;
  const cy = 108.15 + IMAGE.size / 2;
  const ox = 75.0781 + size / 2;
  const oy = 108.15 + size / 2;
  const at = (x, y) => ({ x: ox + k * (x - cx), y: oy + k * (y - cy) });
  const a = at(96.0015, 122.556);
  const b = at(103.019, 134.71);
  const c = at(88.984, 134.71);
  return `M${a.x} ${a.y}L${b.x} ${b.y}H${c.x}Z`;
}
const LINES_Y = [158.476, 164.497, 170.517, 176.538, 182.559]; // sidebar text lines, under the image
const LINES_Y_AVATAR = [139.5015, 145.5215, 151.5415, 157.5615, 163.5815]; // moved up under the avatar
const BLOCKS = [
  { y: 130.489, height: 50.7081 }, { y: 130.489, height: 50.7081 }, { y: 188.198, height: 50.7081 },
  { y: 188.198, height: 108.416 }, { y: 245.906, height: 50.7081 },
];
const BLOCKS_ALT = [
  { y: 130.489, height: 35.708 }, { y: 130.489, height: 70.708 }, { y: 173.199, height: 65.708 },
  { y: 208.199, height: 88.416 }, { y: 245.909, height: 50.708 },
];
const SWAP = { duration: 1, ease: cubicBezier(0.76, 0, 0.24, 1) };

// a value animated like a Motion value: a new target starts from wherever the last animation got to
function motionValue(initial, render) {
  const v = { current: initial, anim: null };
  render(initial);
  v.to = (target) => {
    if (v.anim) v.anim.stop();
    if (target === v.current) return;
    v.anim = animate({ keyframes: [v.current, target], ...SWAP, onUpdate: (x) => { v.current = x; render(x); } });
  };
  return v;
}

export function mountStreaming(root) {
  const svg = root.querySelector("svg");
  const group = svg.querySelector("g[clip-path] > g");
  const [image, ...rects] = group.querySelectorAll("rect");
  const lines = rects.slice(0, 5);
  const blocks = rects.slice(5);
  const paths = [...svg.querySelectorAll('path[stroke^="url("]')];
  const grads = [...svg.querySelectorAll("defs linearGradient")];

  // the wireframe
  const imageSize = motionValue(IMAGE.size, (s) => { image.setAttribute("width", s); image.setAttribute("height", s); });
  const imageRx = motionValue(IMAGE.rx, (r) => image.setAttribute("rx", r));
  const tri = motionValue(triangle(IMAGE.size), (d) => group.querySelector("path").setAttribute("d", d));
  const translate = (el) => (y) => (el.style.transform = `translateY(${y}px)`);
  const lineY = lines.map((el, i) => motionValue(LINES_Y[i], translate(el)));
  const blockY = blocks.map((el, i) => motionValue(BLOCKS[i].y, translate(el)));
  const blockH = blocks.map((el, i) => motionValue(BLOCKS[i].height, (h) => el.setAttribute("height", h)));

  let avatar = false;
  let altBlocks = false;
  function swapImage() {
    avatar = !avatar;
    const to = avatar ? AVATAR : IMAGE;
    imageSize.to(to.size);
    imageRx.to(to.rx);
    tri.to(triangle(to.size));
    lineY.forEach((v, i) => v.to((avatar ? LINES_Y_AVATAR : LINES_Y)[i]));
  }
  function swapBlocks() {
    altBlocks = !altBlocks;
    const to = altBlocks ? BLOCKS_ALT : BLOCKS;
    blockY.forEach((v, i) => v.to(to[i].y));
    blockH.forEach((v, i) => v.to(to[i].height));
  }

  // the streaks: React remounts them whenever "in view" or "hovered" changes, so they restart from scratch
  let inView = false;
  let hover = false;
  let running = [];
  function mountPulses() {
    for (const a of running) a.stop();
    running = [];
    PULSES.forEach((p, i) => {
      const path = paths[i];
      const grad = grads[i];
      path.setAttribute("stroke-width", 2);
      for (const k of ["x1", "x2", "y1", "y2"]) grad.setAttribute(k, p.initial[k]);
      if (!inView) return;
      const timing = { ...LOOP, delay: LOOP.delay + p.delay, repeatDelay: p.repeatDelay, ...(hover ? HOVER : null) };
      for (const k of ["x1", "x2", "y1", "y2"])
        running.push(animate({ keyframes: p.animate[k], ...timing, ease: easeOut, onUpdate: (v) => grad.setAttribute(k, v) }));
      running.push(animate({ keyframes: [2, 1], ...timing, ease: easeIn, onUpdate: (v) => path.setAttribute("stroke-width", v) }));
    });
  }
  mountPulses();

  // Motion's useInView(ref, { margin: "-30%", once: true })
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || inView) continue;
        io.disconnect();
        inView = true;
        setInterval(swapImage, 5000);
        setInterval(swapBlocks, 8000);
        mountPulses();
      }
    },
    { rootMargin: "-30%", threshold: 0 },
  );
  io.observe(root);

  root.addEventListener("mouseenter", () => { hover = true; mountPulses(); });
  root.addEventListener("mouseleave", () => { hover = false; mountPulses(); });
}
