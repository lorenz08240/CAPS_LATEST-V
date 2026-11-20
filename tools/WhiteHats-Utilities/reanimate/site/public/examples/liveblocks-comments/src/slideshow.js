// liveblocks.io/comments hero slideshow. Every 6 s the next use case starts: the tabs re-flow at once, the old
// drawing fades and blurs out while the new one springs in, and a second later the comment thread crossfades,
// the panel glides to its new place and the colours change. Timings, springs and layout are liveblocks.io's
// (motion's MotionConfig transition, variants and layout animations), ported in motion.js and projection.js.
import { animate, MotionEl, mixColor } from "./motion.js";
import { LayoutGroup } from "./projection.js";
import { SCENES } from "./scenes.js";

const CASE_MS = 6000;
const CASES = [
  { type: "text-editor", name: "Text editor", accent: "#e89304", halo: "#C99236", bg: ["#0F0D0A", "#2E2C28", "#4F4C47", "#908B85"] },
  { type: "audio", name: "Media player", accent: "#f44e6b", halo: "#CE314C", bg: ["#0F0A0D", "#2E282B", "#4F474B", "#90858A"] },
  { type: "whiteboard", name: "Whiteboard", accent: "#0090ff", halo: "#0083E9", bg: ["#0A0D0F", "#282C2E", "#474C4F", "#858C90"] },
  { type: "website", name: "Website", accent: "#30a46c", halo: "#4FE09A", bg: ["#0A0F0B", "#282E29", "#474F49", "#859088"] },
  { type: "video", name: "Video editor", accent: "#8F6CEF", halo: "#724BDC", bg: ["#0C0A0F", "#2B282E", "#4A474F", "#898590"] },
];

const spring = (stiffness, damping, delay = 0) => ({ type: "spring", stiffness, damping, delay });
const IN_WINDOW = spring(60, 14, 1); // everything inside the window waits 1 s, then settles
const TABS = spring(100, 16);
const ON_LOAD = spring(60, 14, 0.8); // halo and window glow
const COLOUR = { duration: 0.3, ease: [0.25, 0.1, 0.35, 1], delay: 1 }; // motion's default tween for a colour
const FADE_OUT = { duration: 0.3, ease: [0.25, 0.1, 0.35, 1] };
const VARS = ["--hero-accent", "--hero-halo", "--hero-background-0", "--hero-background-100", "--hero-background-200", "--hero-background-300"];

const hero = document.querySelector(".lb-hero");
const stage = hero.querySelector(".lb-stage");
const win = hero.querySelector(".liveblocks-slideshow");
const panel = win.querySelector(".lb-panel");
const app = win.querySelector(".lb-app");
const tabRow = hero.querySelector(".lb-tabs");
const tabs = Object.fromEntries([...tabRow.querySelectorAll(".lb-tab")].map((b) => [b.dataset.type, b]));
const scale = () => parseFloat(getComputedStyle(hero).getPropertyValue("--hero-scale")) || 1;

let index = 0;
let timer = 0;

// ---------- colours: motion values on the hero, animated as colours ----------
const colours = [CASES[0].accent, CASES[0].halo, ...CASES[0].bg];
const colourAnims = [];
function setColours(c, start) {
  const to = [c.accent, c.halo, ...c.bg];
  VARS.forEach((name, i) => {
    colourAnims[i]?.stop();
    const from = colours[i];
    colourAnims[i] = animate(0, 1, COLOUR, (p) => {
      colours[i] = mixColor(from, to[i], p);
      hero.style.setProperty(name, colours[i]);
    }, { start });
  });
}

// ---------- the comment panel ----------
const shows = [...win.querySelectorAll("[data-show]")].map((el) => {
  const cases = el.dataset.show.split(" ");
  return { cases, m: new MotionEl(el, { opacity: cases.includes(CASES[0].type) ? 1 : 0 }) };
});
const sendRadius = (type) => (type === "whiteboard" || type === "website" ? 10 : 5) * scale();
const send = win.querySelector(".lb-send");
let sendR = sendRadius(CASES[0].type);
let sendAnim = null;

const panelGroup = new LayoutGroup(win);
const q = (sel) => [...panel.querySelectorAll(sel)];
panelGroup.add(panel, true, () => 8 * scale());
panelGroup.add(panel.querySelector(".lb-panel__bg"), true, () => 8 * scale());
for (const t of q(".lb-thread")) panelGroup.add(t, "position");
panelGroup.add(panel.querySelector(".lb-composer"));
panelGroup.add(panel.querySelector(".lb-composer__divider"), "position");
for (const el of q(".lb-composer__row, .lb-composer__avatar, .lb-composer__avatar > div, .lb-composer__input")) panelGroup.add(el);
for (const el of q(".lb-composer__placeholder")) panelGroup.add(el, "position");
for (const el of q(".lb-composer__actions, .lb-composer__left")) panelGroup.add(el);
for (const el of q(".lb-composer__resolve, .lb-composer__tools")) panelGroup.add(el, "position");
for (const el of q(".lb-composer__tools .lb-icon")) panelGroup.add(el);
panelGroup.add(send, true, () => sendR);
for (const el of q(".lb-send__layer, .lb-send__icon")) panelGroup.add(el);
for (const el of q(".lb-send__label")) panelGroup.add(el, "position");

// ---------- the window's top bar: three dots, or three tabs on the website ----------
const DOT = { y: -6, x: 0, width: 33.346, height: 33.346, rx: 16.673 };
const PILL = { y: 0, width: 80, height: 21.2075, rx: 10.6038 };
const PILLS = [{ ...PILL, x: -206.654 }, { ...PILL, x: -126.654 }, { ...PILL, x: -46.654 }];
const dots = [...app.querySelectorAll(".lb-topbar g g rect")].map((r) => new MotionEl(r, { ...DOT }, { svgChild: true }));
function setTopbar(type, start) {
  const web = type === "website";
  dots.forEach((m, i) => m.animate(web ? PILLS[i] : DOT, spring(50, 11, web ? [1, 1.1, 1.2][i] : [1.2, 1.1, 1][i]), start));
}

// ---------- the scene ----------
let scene = SCENES[CASES[0].type]();
app.append(...scene.nodes);
scene.enter(performance.now(), false);

// ---------- tabs ----------
const tabsGroup = new LayoutGroup(tabRow);
for (const b of Object.values(tabs)) {
  tabsGroup.add(b, true, () => 100);
  tabsGroup.add(b.querySelector(".lb-tab__icon"));
}
let name = new MotionEl(tabs[CASES[0].type].querySelector(".lb-tab__name"), { opacity: 1 });
tabsGroup.add(name.el, "position");
let progress = new MotionEl(tabs[CASES[0].type].querySelector(".lb-tab__progress"), { opacity: 0.3, scaleX: 0.1 });

function switchTabs(from, to, start) {
  const oldBtn = tabs[from.type];
  const newBtn = tabs[to.type];
  const leaving = name;
  const leavingBar = progress;
  // motion's popLayout: the leaving label is taken out of the flow where it stands, then fades
  const el = leaving.el;
  const pop = { top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight };
  const label = document.createElement("span");
  label.className = "lb-tab__name";
  label.textContent = to.name;
  const bar = document.createElement("div");
  bar.className = "lb-tab__progress";
  tabsGroup.change(() => {
    Object.assign(el.style, { position: "absolute", top: `${pop.top}px`, left: `${pop.left}px`, width: `${pop.width}px`, height: `${pop.height}px` });
    oldBtn.classList.remove("is-active");
    oldBtn.disabled = false;
    newBtn.classList.add("is-active");
    newBtn.disabled = true;
    newBtn.prepend(bar);
    newBtn.append(label);
    tabsGroup.add(label, "position");
  }, TABS, start);
  name = new MotionEl(label, { opacity: 0 });
  name.animate({ opacity: 1 }, TABS, start);
  const out = leaving.animate({ opacity: 0 }, TABS, start)[0];
  whenFinished(out, () => {
    tabsGroup.remove(el);
    el.remove();
  });
  progress = new MotionEl(bar, { opacity: 0.3, scaleX: 0.1 });
  progress.animate({ scaleX: 1 }, { duration: CASE_MS / 1000, ease: "linear" }, start);
  whenFinished(leavingBar.animate({ opacity: 0 }, FADE_OUT, start)[0], () => leavingBar.el.remove());
}

function whenFinished(a, fn) {
  if (!a) return fn();
  const check = () => (a.done ? fn() : requestAnimationFrame(check));
  check();
}

// ---------- one use case to the next ----------
function show(i, start = performance.now()) {
  if (i === index) return;
  const from = CASES[index];
  const to = CASES[i];
  index = i;
  switchTabs(from, to, start);

  panelGroup.change(() => (win.dataset.case = to.type), IN_WINDOW, start);
  for (const s of shows) s.m.animate({ opacity: s.cases.includes(to.type) ? 1 : 0 }, IN_WINDOW, start);
  sendAnim?.stop();
  sendAnim = animate(sendR, sendRadius(to.type), { ...IN_WINDOW, velocity: sendAnim?.velocity(start) ?? 0 }, (v) => {
    sendR = v;
    if (!panelGroup.anim) send.style.borderRadius = `${v}px`;
  }, { start });
  setTopbar(to.type, start);
  setColours(to, start);

  scene.exit(start);
  scene = SCENES[to.type]();
  app.append(...scene.nodes);
  scene.enter(start, true);
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    show((index + 1) % CASES.length);
    schedule();
  }, CASE_MS);
}

// the radii follow --hero-scale, which changes at the breakpoints
addEventListener("resize", () => {
  if (!panelGroup.anim) panelGroup.clear();
  if (!sendAnim || sendAnim.done) {
    sendR = sendRadius(CASES[index].type);
    if (!panelGroup.anim) send.style.borderRadius = `${sendR}px`;
  }
});

for (const [type, b] of Object.entries(tabs)) {
  b.addEventListener("click", () => {
    clearTimeout(timer);
    show(CASES.findIndex((c) => c.type === type));
    schedule();
  });
}

// Off screen the slideshow waits; back on screen it moves on to the next use case. (liveblocks.io ignores the
// first observation; if that one says "off screen" it then never restarts, so here a page that starts scrolled
// away keeps cycling until the hero is first seen.)
let observed = false;
let seen = false;
new IntersectionObserver(([e]) => {
  if (!observed) {
    observed = true;
    seen = e.isIntersecting;
    return;
  }
  if (e.isIntersecting) {
    if (!seen) return void (seen = true);
    show((index + 1) % CASES.length);
    schedule();
  } else if (seen) clearTimeout(timer);
}).observe(hero);

// ---------- on load: the first case starts, the window rises and fades in, the halo and the glow come up ----------
// Like the original, the 6 s timer starts when the page is ready (a React effect there) and the entrance
// animations on the first frame after it (motion starts its animations in a frame).
schedule();
requestAnimationFrame(() => {
  const start = performance.now();
  animate(10, 0, { duration: 2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }, (v) => (stage.style.transform = v === 0 ? "none" : `translateY(${v}%)`), {
    start,
    // the panel's own layers (will-change, as on liveblocks.io) are made once the window rests: made while
    // it rises, they kept whichever sub-pixel offset the browser last drew them at, which varied run to run
    onComplete: () => hero.classList.add("is-settled"),
  });
  animate(0, 1, { duration: 1, delay: 0.8, ease: "easeOut" }, (v) => (stage.style.opacity = String(v)), { start });
  new MotionEl(hero.querySelector(".lb-halo"), { opacity: 0, scale: 0.8 }).animate({ opacity: 0.2, scale: 1 }, ON_LOAD, start);
  new MotionEl(app.querySelector(".lb-app__glow"), { opacity: 0 }).animate({ opacity: 1 }, ON_LOAD, start);
  progress.animate({ scaleX: 1 }, { duration: CASE_MS / 1000, ease: "linear" }, start);
});
