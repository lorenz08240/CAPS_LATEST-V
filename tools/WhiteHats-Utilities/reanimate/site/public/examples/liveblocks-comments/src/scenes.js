// The five app drawings behind the comment panel, with the shapes, delays and springs of liveblocks.io's
// hero (motion variants $, q, et, er, en, ec, ed, em, ex, ep, ef, eg). Each scene enters when its use case
// starts and leaves (fades, shrinks to 90 % and blurs) when the next one starts.
import { MotionEl, whenDone } from "./motion.js";

const NS = "http://www.w3.org/2000/svg";
function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  el.append(...kids);
  return el;
}
function h(tag, cls, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  el.append(...kids);
  return el;
}

const Y = [0.5, 0, 0.75, 0]; // ease-in
const X = [0.75, 0, 0.25, 1];
const spring = (stiffness, damping, delay = 0) => ({ type: "spring", stiffness, damping, delay });
const FADE = { duration: 1, ease: Y };
const SCENE = { initial: { opacity: 0, scale: 1, blur: 0 }, entry: { opacity: 1, scale: 1, blur: 0 }, exit: { opacity: 0, scale: 0.9, blur: 20 } };

const avatar = (name) => {
  const img = h("img", "", { src: `./assets/people/${name}-256.webp`, srcset: `./assets/people/${name}-128.webp 1x, ./assets/people/${name}-256.webp 2x`, width: 120, height: 120, alt: "", decoding: "async" });
  return img;
};

const TEXT_EDITOR = [
  "M266 161.138C266 153.33 272.33 147 280.138 147H500.862C508.67 147 515 153.33 515 161.138V174.862C515 182.67 508.67 189 500.862 189H280.138C272.33 189 266 182.67 266 174.862V161.138Z",
  "M615.72 249.5c0-5.8 4.75-10.5 10.6-10.5h90.08c5.86 0 10.6 4.7 10.6 10.5s-4.75 10.5-10.6 10.5h-90.08c-5.85 0-10.6-4.7-10.6-10.5Zm-349.72 0c0-5.8 4.75-10.5 10.6-10.5h321.46c5.86 0 10.6 4.7 10.6 10.5s-4.74 10.5-10.6 10.5H276.6c-5.86 0-10.6-4.7-10.6-10.5Z",
  "M266 277.5C266 271.701 270.752 267 276.613 267H607.387C613.248 267 618 271.701 618 277.5C618 283.299 613.248 288 607.387 288H276.613C270.752 288 266 283.299 266 277.5Z",
  "M266 305.5C266 299.701 270.747 295 276.603 295H642.397C648.253 295 653 299.701 653 305.5C653 311.299 648.253 316 642.397 316H276.603C270.747 316 266 311.299 266 305.5Z",
  "M266 373.5C266 367.701 270.76 363 276.632 363H356.368C362.24 363 367 367.701 367 373.5C367 379.299 362.24 384 356.368 384H276.632C270.76 384 266 379.299 266 373.5Z",
  "M266 373.5C266 367.701 270.76 363 276.632 363H356.368C362.24 363 367 367.701 367 373.5C367 379.299 362.24 384 356.368 384H276.632C270.76 384 266 379.299 266 373.5Z",
  "M266 415.5C266 409.701 270.744 405 276.597 405H693.403C699.256 405 704 409.701 704 415.5C704 421.299 699.256 426 693.403 426H276.597C270.744 426 266 421.299 266 415.5Z",
  "M266 443.5C266 437.701 270.752 433 276.613 433H607.387C613.248 433 618 437.701 618 443.5C618 449.299 613.248 454 607.387 454H276.613C270.752 454 266 449.299 266 443.5Z",
  "M266 471.5C266 465.701 270.742 461 276.592 461H744.408C750.258 461 755 465.701 755 471.5C755 477.299 750.258 482 744.408 482H276.592C270.742 482 266 477.299 266 471.5Z",
  "M266 499.5C266 493.701 270.744 489 276.597 489H693.403C699.256 489 704 493.701 704 499.5C704 505.299 699.256 510 693.403 510H276.597C270.744 510 266 505.299 266 499.5Z",
  "M266 527.5C266 521.701 270.746 517 276.6 517H785.4C791.254 517 796 521.701 796 527.5C796 533.299 791.254 538 785.4 538H276.6C270.746 538 266 533.299 266 527.5Z",
];

// media player: one vertical line every 8 px from x=66, from this y down to 442
const WAVE = [344, 332, 328, 322, 337, 354, 342, 344, 350, 362, 398, 403, 392, 397, 384, 367, 342, 344, 337, 340, 332, 328, 330, 325, 348, 342, 362, 357, 354, 358, 373, 354, 334, 328, 328, 322, 337, 344, 357, 384, 394, 391, 404, 427, 414, 417, 404, 409, 414, 423, 412, 404, 407, 398, 404, 405, 402, 394, 378, 362, 344, 334, 328, 328, 322, 337, 344, 337, 364, 371, 337, 324, 323, 327, 334, 324, 344, 334, 337, 328, 322, 337, 344, 377, 381, 364, 357, 349, 337, 344, 364, 378, 375, 375, 371, 333, 344, 337, 354, 366, 358, 354, 354, 349, 337, 344, 377, 384, 394, 407, 434, 427, 414, 418, 416, 414, 414, 413, 387, 381, 378, 381, 374, 394, 378, 362, 358, 360, 364, 357, 344, 341, 337, 347, 357];

const WEBSITE = [
  "M524 191C524 186.582 527.582 183 532 183H676C680.418 183 684 186.582 684 191C684 195.418 680.418 199 676 199H532C527.582 199 524 195.418 524 191Z",
  "M298 235.5C298 224.178 307.178 215 318.5 215H887.5C898.822 215 908 224.178 908 235.5C908 246.822 898.822 256 887.5 256H318.5C307.178 256 298 246.822 298 235.5Z",
  "M401 287.5C401 281.701 405.701 277 411.5 277H796.5C802.299 277 807 281.701 807 287.5C807 293.299 802.299 298 796.5 298H411.5C405.701 298 401 293.299 401 287.5Z",
  "M421 321.547C420.999 315.772 425.698 311.09 431.497 311.088L774.497 311C780.296 310.999 784.998 315.679 785 321.453C785.001 327.228 780.302 331.91 774.503 331.912L431.503 332C425.704 332.001 421.001 327.321 421 321.547Z",
  "M504 378a14 14 0 0 1 14-14h66a14 14 0 1 1 0 28h-66a14 14 0 0 1-14-14Zm106 0a14 14 0 0 1 14-14h66a14 14 0 1 1 0 28h-66a14 14 0 0 1-14-14Z",
  "M140 474C139.999 465.163 147.162 458 155.999 458H1049.98C1058.82 458 1065.98 465.163 1065.98 474L1066 754C1066 762.837 1058.84 770 1050 770H156.018C147.182 770 140.018 762.837 140.018 754L140 474Z",
];

const WHITEBOARD_STROKE =
  "M408 656.63c51.15-39.78 110.26-68.7 162.88-106.47 19.36-13.9 37.05-30.07 53.35-47.42 6.76-7.2 13.04-14.98 16.35-24.42 2.78-7.96-6.34-6.02-11.86-5.52-15.57 1.42-25.6 12.27-30.86 26.47-23.9 64.62 78.52 49.33 111.39 40.57C787.1 519.07 859.18 478.2 906.47 412";

/**
 * A scene: its DOM nodes (appended to the app window), parts = [{ m: MotionEl, initial, entry, transition, exit?, exitTransition? }].
 * enter(start, animated) plays the entry (or jumps to it), exit(start) plays the exit and resolves when done.
 */
class Scene {
  constructor(nodes, parts, extra = {}) {
    this.nodes = nodes;
    this.parts = parts;
    Object.assign(this, extra);
  }
  enter(start, animated) {
    for (const p of this.parts) {
      if (!animated && !p.always) {
        Object.assign(p.m.v, p.entry);
        p.m.render();
      } else p.m.animate(p.entry, p.transition, start);
    }
    this.onEnter?.(start, animated);
  }
  async exit(start) {
    const anims = [];
    for (const p of this.parts) if (p.exit) anims.push(...p.m.animate(p.exit, p.exitTransition, start));
    await whenDone(anims);
    for (const p of this.parts) p.m.stopAll();
    for (const n of this.nodes) n.remove();
    this.onRemove?.();
  }
}

const sceneSvg = (attrs = {}) => s("svg", { class: "lb-scene", viewBox: "0 0 1208 770", xmlns: NS, ...attrs });

// variants $ on the scene's root (an <svg> or a div)
const rootPart = (el) => ({ m: new MotionEl(el, { ...SCENE.initial }), entry: SCENE.entry, transition: FADE, exit: SCENE.exit, exitTransition: FADE });

// the accent comment pin (variants q), at a spot given in % of the window
function pin(style) {
  const el = h("div", "lb-pin", { style });
  const wrap = h("div", "lb-layer", {}, el);
  const part = {
    m: new MotionEl(el, { opacity: 0, scale: 0, originX: 0, originY: 1 }),
    entry: { opacity: 1, scale: 1 },
    transition: spring(60, 11, 1.3),
    exit: { opacity: 0, scale: 0 },
    exitTransition: spring(60, 11, 0.8),
  };
  return { wrap, part };
}

function textEditor() {
  const g = s("g", { fill: "var(--hero-background-100)" });
  const root = sceneSvg();
  root.append(g);
  const parts = [rootPart(root)];
  TEXT_EDITOR.forEach((d, i) => {
    const p = g.appendChild(s("path", { d }));
    parts.push({ m: new MotionEl(p, { y: 50, opacity: 0 }, { svgChild: true }), entry: { y: 0, opacity: 1 }, transition: spring(60, 11, 1 + 0.1 * i) });
  });
  const { wrap, part } = pin("top:28.7%;left:59.27%");
  parts.push(part);
  return new Scene([root, wrap], parts);
}

function media() {
  const g = s("g", { "stroke-width": "2" });
  const root = sceneSvg({ fill: "none" });
  root.append(g);
  const parts = [rootPart(root)];
  const lines = WAVE.map((top, i) => {
    const x = 66 + 8 * i;
    const p = g.appendChild(s("path", { d: `M${x} ${top}L${x} 442`, class: "lb-wave", stroke: i < 30 ? "var(--hero-background-300)" : "var(--hero-background-200)" }));
    parts.push({ m: new MotionEl(p, { scaleY: 0.5, opacity: 0, originY: 1 }, { svgChild: true }), entry: { scaleY: 1, opacity: 1 }, transition: spring(111, 15, 1 + 0.01 * i) });
    return p;
  });
  // the played part grows by one line a second (useInterval, from 30)
  let played = 30;
  let timer = 0;
  const onEnter = () => {
    timer = setInterval(() => {
      played++;
      lines.forEach((p, i) => p.setAttribute("stroke", i < played ? "var(--hero-background-300)" : "var(--hero-background-200)"));
    }, 1000);
  };
  const onRemove = () => clearInterval(timer); // it keeps counting while the scene fades out

  const people = h("div", "lb-layer");
  const at = [
    ["12.91%", "#0090ff", "steven-fabre", 0],
    ["22.19%", "#30a46c", "alicia-henriquez", 0.2],
    ["36.92%", "#8F6CEF", "nimesh-nayaju", 0.4],
    ["78.48%", "#f44e6b", "jonathan-rowny", 0.8],
  ];
  parts.push(rootPart(people));
  for (const [left, accent, name, d] of at) {
    const el = people.appendChild(h("div", "lb-person lb-person--media", { style: `left:${left};--avatar-accent:${accent}` }, avatar(name)));
    parts.push({ m: new MotionEl(el, { opacity: 0, scale: 0, originY: 0 }), entry: { opacity: 1, scale: 1 }, transition: spring(60, 11, 1.4 + d) });
  }
  return new Scene([root, people], parts, { onEnter, onRemove });
}

function whiteboard() {
  const g = s("g");
  const root = sceneSvg({ fill: "none" });
  root.append(g);
  const circle = g.appendChild(s("circle", { cx: 714.5, cy: 285.5, r: 94.5, fill: "var(--hero-background-100)" }));
  const square = g.appendChild(s("rect", { x: 243, y: 286, width: 200, height: 200, rx: 8, fill: "var(--hero-background-100)" }));
  const stroke = g.appendChild(s("path", { d: WHITEBOARD_STROKE, stroke: "var(--hero-background-100)", "stroke-width": 8, "stroke-linecap": "round" }));
  const { wrap, part } = pin("bottom:57.66%;left:55.88%");
  const parts = [
    rootPart(root),
    { m: new MotionEl(circle, { x: 60, y: -80, opacity: 0 }, { svgChild: true }), entry: { x: 0, y: 0, opacity: 1 }, transition: spring(50, 11, 1) },
    { m: new MotionEl(square, { x: -80, y: 60, opacity: 0 }, { svgChild: true }), entry: { x: 0, y: 0, opacity: 1 }, transition: spring(50, 11, 1.2) },
    { m: new MotionEl(stroke, { pathLength: 0, opacity: 0 }, { svgChild: true }), entry: { pathLength: 1, opacity: 1 }, transition: { default: { ease: X, duration: 3, delay: 0.5 }, opacity: { ease: "easeInOut", duration: 0.5, delay: 1.3 } } },
    part,
  ];
  return new Scene([root, wrap], parts);
}

// variants ex: the frame tips up out of the screen, in perspective
const TILT = {
  initial: { opacity: 0, scale: 1.4, y: 200, rotateX: 45, originY: 1, blur: 0 },
  entry: { opacity: 1, scale: 1, y: 0, rotateX: 0, originY: 0.5, blur: 0 },
  exit: { opacity: 0, scale: 0.9, blur: 20, originY: 0.5 },
};
const tiltPart = (el) => ({ m: new MotionEl(el, { ...TILT.initial }), entry: TILT.entry, transition: spring(35, 9, 1), exit: TILT.exit, exitTransition: FADE });

function video() {
  const LONG = { duration: 7.2, ease: "linear" }; // 1.2 x the 6 s use case
  const track = s("path", { d: "M246 589H962", stroke: "var(--hero-background-200)", "stroke-width": 3, "stroke-linecap": "round" });
  const bar = s("path", { d: "M246 589H577", stroke: "white", "stroke-width": 4, "stroke-linecap": "round" });
  const barGroup = s("g", {}, bar);
  const head = s("circle", { cx: 577, cy: 589, r: 6, fill: "white" });
  const headGroup = s("g", {}, head);
  const controls = s("g", {}, track, barGroup, headGroup);
  const frame = s("rect", { x: 206, y: 180, width: 796, height: 448, rx: 12, fill: "var(--hero-background-100)" });
  const root = sceneSvg({ fill: "none" });
  root.append(s("g", { transform: "translate(0, -30)" }, frame, controls));
  const parts = [
    tiltPart(root),
    { m: new MotionEl(controls, { opacity: 0 }, { svgChild: true }), entry: { opacity: 1 }, transition: spring(60, 11, 1.75) },
    { m: new MotionEl(barGroup, { scaleX: 0, originX: 0 }, { svgChild: true }), entry: { scaleX: 1 }, transition: spring(40, 12, 2), always: true },
    { m: new MotionEl(bar, { scaleX: 1, originX: 0 }, { svgChild: true }), entry: { scaleX: 1.2 }, transition: LONG, always: true },
    { m: new MotionEl(headGroup, { x: -332, scale: 0 }, { svgChild: true }), entry: { x: 0, scale: 1 }, transition: spring(40, 12, 2), always: true },
    { m: new MotionEl(head, { x: 0 }, { svgChild: true }), entry: { x: 66.4 }, transition: LONG, always: true },
  ];
  const people = h("div", "lb-layer");
  parts.push(tiltPart(people));
  const at = [
    ["25.83%", "#0090ff", "steven-fabre", 0],
    ["39.57%", "#f44e6b", "pierre-levaillant", 0.1],
    ["62.57%", "#8F6CEF", "vincent-driessen", 0.3],
  ];
  for (const [left, accent, name, d] of at) {
    const el = people.appendChild(h("div", "lb-person lb-person--video", { style: `left:${left};--avatar-accent:${accent}` }, avatar(name)));
    parts.push({ m: new MotionEl(el, { opacity: 0, scale: 0, originY: 1 }), entry: { opacity: 1, scale: 1 }, transition: spring(60, 11, 2.2 + d) });
  }
  return new Scene([root, people], parts);
}

function website() {
  const g = s("g", { fill: "var(--hero-background-100)" });
  const root = sceneSvg();
  root.append(g);
  const parts = [rootPart(root)];
  WEBSITE.forEach((d, i) => {
    const p = g.appendChild(s("path", { d }));
    parts.push({ m: new MotionEl(p, { y: 50, opacity: 0 }, { svgChild: true }), entry: { y: 0, opacity: 1 }, transition: spring(60, 11, 1 + 0.1 * i) });
  });
  const { wrap, part } = pin("top:4.4%;left:13%");
  parts.push(part);
  return new Scene([root, wrap], parts);
}

export const SCENES = { "text-editor": textEditor, audio: media, whiteboard, website, video };
