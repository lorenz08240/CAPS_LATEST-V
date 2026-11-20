// "Access borderless money movement with stablecoins and crypto" card: rotating dotted globe with
// arcs and payment labels (port of stripe.com's <Globe position={{ y: -1 }} />).
//
// mount() builds the same DOM as stripe.com (.globe > canvas.globe__canvas + .globe__ui-container
// with five .globe__arc-ui labels), creates the WebGL globe paused, and resolves once the dots are
// in and the first frame is drawn. The globe then runs while it is on screen (IntersectionObserver,
// 10 % visible with a 100 px margin) and stays paused on that first frame for
// prefers-reduced-motion. Hovering the card boosts the dot corona. Without WebGL (or when the
// capability check fails, as for software renderers on stripe.com) a static image is shown.
import { precomputeDots } from "./crypto/dots-precompute.js";
import { warmUpRenderLoops } from "./crypto/render-loop.js";

const MAP_URL = new URL("../../assets/img/map-dots.png", import.meta.url).href;
const FALLBACK_URL = new URL("../../assets/img/money-movement-fallback_2x.png", import.meta.url).href;
const LABEL_POOL_SIZE = 5;
const RESIZE_DEBOUNCE_MS = 150;

// Start the shared refresh-rate estimate and the dot precompute right away, before three.js is even
// fetched (stripe.com does both long before the card scrolls in).
warmUpRenderLoops();
precomputeDots(MAP_URL);
const globeModule = import("./crypto/globe.js");

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function createLabel() {
  const label = el("div", "globe__arc-ui");
  label.style.display = "none";
  const content = el("div", "globe__arc-ui-content");
  const text = el("div", "globe__arc-ui-text");
  text.append(el("span", "globe__arc-ui-amount"), el("span", "globe__arc-ui-currency"));
  content.append(el("div", "globe__arc-ui-icon"), text);
  label.append(content);
  return label;
}

function hasWebGL() {
  if (new URLSearchParams(window.location.search).has("__disableWebGL")) return false;
  const canvas = document.createElement("canvas");
  const attrs = { alpha: false, antialias: false, depth: false, failIfMajorPerformanceCaveat: true, stencil: false, powerPreference: "high-performance" };
  return !!(canvas.getContext("webgl", attrs) || canvas.getContext("experimental-webgl", attrs));
}

function mountFallback(container) {
  const root = el("div", "globe");
  const wrap = el("div", "globe__static");
  const img = el("img");
  img.src = FALLBACK_URL;
  img.width = 894;
  img.height = 1456;
  img.alt = "";
  wrap.append(img);
  root.append(wrap);
  container.replaceChildren(root);
  return img.decode().catch(() => {});
}

function debounce(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

export async function mount(container, { card }) {
  if (!hasWebGL()) return mountFallback(container);

  const root = el("div", "globe");
  root.setAttribute("aria-hidden", "true");
  const canvas = el("canvas", "globe__canvas");
  canvas.setAttribute("aria-hidden", "true");
  const ui = el("div", "globe__ui-container");
  const labels = Array.from({ length: LABEL_POOL_SIZE }, createLabel);
  ui.append(...labels);
  root.append(canvas, ui);
  container.replaceChildren(root);

  const { Globe } = await globeModule;
  let globe;
  try {
    globe = new Globe(canvas, { imageUrl: MAP_URL, uiPool: labels });
  } catch {
    return mountFallback(container);
  }
  globe.setPosition({ y: -1 });
  globe.paused = true;
  globe.initScene();

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let onScreen = false;
  const syncPaused = () => {
    globe.paused = onScreen ? reducedMotion.matches : true;
  };
  reducedMotion.addEventListener("change", syncPaused);
  new IntersectionObserver(
    (entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      syncPaused();
    },
    { threshold: 0.1, rootMargin: "100px" },
  ).observe(root);

  let lastSize = "";
  new ResizeObserver(
    debounce((entries) => {
      const entry = entries[entries.length - 1];
      const box = entry.borderBoxSize?.[0];
      const width = Math.round(box ? box.inlineSize : entry.contentRect.width);
      const height = Math.round(box ? box.blockSize : entry.contentRect.height);
      if (!width || !height || `${width}x${height}` === lastSize) return;
      lastSize = `${width}x${height}`;
      globe.setSize(width, height);
    }, RESIZE_DEBOUNCE_MS),
  ).observe(root);

  card.addEventListener("mouseenter", () => globe.setHovered(true));
  card.addEventListener("mouseleave", () => globe.setHovered(false));

  // Resolves once the dots are applied and a frame showing them has been rendered (drawn right
  // away while paused, otherwise by the next render-loop frame).
  await new Promise((resolve) => globe.onFirstFrame(resolve));
}
