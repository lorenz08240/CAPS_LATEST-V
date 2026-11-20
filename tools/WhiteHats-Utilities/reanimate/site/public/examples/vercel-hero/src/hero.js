// The page side of vercel.com's hero (its HeroShaderLayer, ported): starts the render worker, sends it the
// canvas size, the pointer, clicks on the triangle, nav hovers and drag-and-drop, and draws the frames it
// sends back. The canvas fades in over 1.2 s once the first frame is there; the static triangle behind it
// then fades out. Without Worker + OffscreenCanvas + WebGL2 float targets, or with reduced motion, the
// static triangle stays, as on vercel.com.

import { ZOOM_DESKTOP, FPS_DESKTOP, FPS_MOBILE, TRIANGLE_HEIGHT, setZoom, zoomFor, triangle } from "./config.js";

const hero = document.querySelector(".vh-hero");
const box = document.querySelector(".vh-canvas-box");
const root = document.querySelector(".vh-shader-root");
const canvas = document.querySelector("[data-triangle-led-4-hero-canvas]");
const area = document.querySelector(".vh-pointer-area");
const fallback = document.querySelector(".vh-fallback");
const nav = document.querySelector(".vh-nav");
const items = [...document.querySelectorAll(".vh-item")];

// the static triangle, with vercel.com's numbers
{
  const h = TRIANGLE_HEIGHT, r = (2 * h) / 3, n = h / 3, s = (2 * h) / Math.sqrt(3), d = 2 * r;
  const svg = fallback.querySelector("svg");
  svg.setAttribute("viewBox", `${-r} ${-r} ${d} ${d}`);
  svg.querySelector("polygon").setAttribute("points", [{ x: 0, y: -r }, { x: -(0.5 * s), y: n }, { x: 0.5 * s, y: n }].map((p) => `${p.x},${p.y}`).join(" "));
  svg.style.width = svg.style.height = `${100 * d}%`;
}

// vercel.com renders at 30 fps and at most 1.5x on small screens. ?embed is the desktop hero scaled into a
// narrow frame, so there the screen decides, not the frame's width.
const small = () => (document.documentElement.hasAttribute("data-embed") ? screen.width < 1024 : matchMedia("(max-width: 1023.98px)").matches);
/** Canvas size in layout px (the page may be scaled down to fit) and device px. */
function dimensions(el) {
  const raw = Math.max(window.devicePixelRatio || 1, 1);
  const dpr = small() ? Math.min(raw, 1.5) : raw;
  const cssWidth = Math.max(1, Math.floor(el.offsetWidth));
  const cssHeight = Math.max(1, Math.floor(el.offsetHeight));
  return { cssWidth, cssHeight, pixelWidth: Math.max(1, Math.floor(cssWidth * dpr)), pixelHeight: Math.max(1, Math.floor(cssHeight * dpr)), dpr };
}

function webgl2() {
  if (typeof OffscreenCanvas === "undefined") return false;
  try {
    const gl = new OffscreenCanvas(1, 1).getContext("webgl2");
    return !!gl && !!gl.getExtension("EXT_color_buffer_float");
  } catch {
    return false;
  }
}
function unavailable() {
  if (typeof Worker === "undefined") return "Worker is unavailable.";
  if (typeof OffscreenCanvas === "undefined") return "OffscreenCanvas is unavailable.";
  if (!canvas.getContext("2d")) return "2D canvas rendering is unavailable.";
  if (!webgl2()) return "WebGL2 is unavailable.";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "Reduced motion is enabled.";
}

const problem = unavailable();
if (problem) {
  console.warn("Hero shader unavailable.", problem);
} else start();

function start() {
  const ctx = canvas.getContext("2d");
  const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
  const send = (msg) => worker.postMessage(msg);
  let pixelWidth = 0, pixelHeight = 0;
  let dims = dimensions(root);
  setZoom(zoomFor(ZOOM_DESKTOP, dims.cssHeight, false));

  // ---------- frames ----------
  worker.onmessage = ({ data }) => {
    switch (data.type) {
      case "firstFrame": {
        canvas.style.opacity = "1";
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          canvas.removeEventListener("transitionend", onEnd);
          clearTimeout(timer);
          fallback.dataset.hidden = "";
        };
        const onEnd = (e) => { if (e.propertyName === "opacity") finish(); };
        canvas.addEventListener("transitionend", onEnd);
        const timer = setTimeout(finish, 1300);
        return;
      }
      case "frame": {
        const bitmap = data.bitmap;
        try {
          if (pixelWidth < 1 || pixelHeight < 1) return;
          if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
          if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
          const k = Math.max(pixelWidth / bitmap.width, pixelHeight / bitmap.height);
          const w = bitmap.width * k, h = bitmap.height * k;
          ctx.globalCompositeOperation = "copy";
          ctx.drawImage(bitmap, (pixelWidth - w) * 0.5, (pixelHeight - h) * 0.5, w, h);
        } finally {
          bitmap.close();
        }
        return;
      }
      case "unsupported":
      case "error":
        console.warn("Hero shader unavailable.", data.stage ? `${data.stage}: ${data.reason}` : data.reason);
        canvas.style.opacity = "";
        worker.terminate();
        return;
    }
  };
  worker.onerror = (e) => {
    console.warn("Hero shader unavailable.", e.message || "Hero shader worker failed.");
    worker.terminate();
  };

  // ---------- size ----------
  let sent;
  const measure = () => {
    const d = dimensions(root);
    pixelWidth = d.pixelWidth;
    pixelHeight = d.pixelHeight;
    return d;
  };
  const resize = () => {
    const d = measure();
    dims = d;
    setZoom(zoomFor(ZOOM_DESKTOP, d.cssHeight, false));
    if (!sent || sent.cssWidth !== d.cssWidth || sent.cssHeight !== d.cssHeight || sent.pixelWidth !== d.pixelWidth || sent.pixelHeight !== d.pixelHeight || sent.dpr !== d.dpr) {
      sent = d;
      send({ type: "resize", dimensions: d });
    }
  };
  let resizeTimer;
  const later = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
  new ResizeObserver(() => { measure(); later(); }).observe(root);
  addEventListener("resize", later);

  send({
    type: "init", dimensions: dims, theme: "light", activeClick: -1, probeDensity: 2,
    targetFps: small() ? FPS_MOBILE : FPS_DESKTOP, cameraZoom: ZOOM_DESKTOP, heroMobile: false, dropActive: false, dropStaging: false,
  });
  resize();

  // ---------- pointer: position over the canvas box, whether it is inside the triangle ----------
  let paused = false, tracking = false, pointerCursor = false;
  const baseCursor = document.documentElement.style.cursor;
  const cursor = (on) => {
    if (on === pointerCursor) return;
    pointerCursor = on;
    document.documentElement.style.cursor = on ? "pointer" : baseCursor;
  };
  const lost = () => {
    if (!tracking && !pointerCursor) return;
    tracking = false;
    cursor(false);
    send({ type: "pointer", pointer: { x: -1e3, y: -1e3, active: false, inside: false } });
  };
  const cross = (a, b, p) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  const pointer = (e) => {
    if (paused) return false;
    const r = area.getBoundingClientRect();
    const w = Math.max(1, area.offsetWidth), h = Math.max(1, area.offsetHeight);
    const sx = r.width > 0 ? w / r.width : 1, sy = r.height > 0 ? h / r.height : 1;
    const x = (e.clientX - r.left) * sx, y = (e.clientY - r.top) * sy;
    if (x < 0 || x > w || y < 0 || y > h) { lost(); return false; }
    const { top, left, right } = triangle({ width: w, height: h });
    const p = { x, y };
    const s0 = cross(top, left, p), s1 = cross(left, right, p), s2 = cross(right, top, p);
    const inside = (s0 <= 0 && s1 <= 0 && s2 <= 0) || (s0 >= 0 && s1 >= 0 && s2 >= 0);
    tracking = true;
    cursor(inside);
    send({ type: "pointer", pointer: { x, y, active: true, inside, isMouse: e.pointerType === "mouse" } });
    return inside;
  };
  document.addEventListener("pointermove", pointer, { passive: true });
  // a click on the triangle switches the colours on or off
  document.addEventListener("pointerup", (e) => {
    if (paused) return;
    if (e.target instanceof Element && e.target.closest('a,button,input,select,textarea,label,[role="button"],[contenteditable="true"]')) return;
    if (pointer(e)) send({ type: "click", click: { kind: "toggle" } });
  }, { passive: true });
  addEventListener("blur", lost);
  document.addEventListener("pointerleave", lost);

  // ---------- visibility: render only while the hero is on screen ----------
  let near = true;
  const lifecycle = () => {
    const active = near && !document.hidden;
    paused = !active;
    if (!active) lost();
    send({ type: "lifecycle", lifecycle: active ? "active" : "paused" });
  };
  new IntersectionObserver(([e]) => { if (e.isIntersecting !== near) { near = e.isIntersecting; lifecycle(); } }, { rootMargin: "100px" }).observe(root);
  document.addEventListener("visibilitychange", lifecycle);

  // ---------- nav: hovering an item lights one edge (after 50 ms when coming from none) ----------
  let active = -1, pending = null;
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    items.forEach((el, k) => el.toggleAttribute("data-open", k === i));
    nav.toggleAttribute("data-none", i === -1);
    send({ type: "activeClick", activeClick: i });
  };
  const cancel = () => { if (pending !== null) { clearTimeout(pending); pending = null; } };
  items.forEach((el, i) => {
    el.addEventListener("mouseenter", () => {
      cancel();
      if (active === -1) pending = setTimeout(() => { pending = null; setActive(i); }, 50);
      else setActive(i);
    });
    el.addEventListener("mouseleave", cancel);
  });
  nav.addEventListener("mouseleave", () => { cancel(); setActive(-1); });

  // ---------- drag and drop: a file over the page, while the hero is at least half on screen ----------
  let depth = 0, dragging = false, inView = false, dropShown = false;
  const update = () => {
    const on = dragging && inView;
    hero.dataset.heroDropActive = on ? "true" : "false";
    if (on !== dropShown) { dropShown = on; send({ type: "dropActive", active: on }); }
  };
  const files = (e) => e.dataTransfer?.types.includes("Files") ?? false;
  document.addEventListener("dragenter", (e) => {
    if (!files(e)) return;
    if (!e.defaultPrevented) e.preventDefault();
    depth += 1;
    if (depth === 1) { dragging = true; update(); }
  });
  document.addEventListener("dragover", (e) => {
    if (!files(e) || e.defaultPrevented) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  });
  document.addEventListener("dragleave", (e) => {
    if (!files(e)) return;
    depth -= 1;
    if (depth <= 0) { depth = 0; dragging = false; update(); }
  });
  // this copy deploys nothing: a drop just ends the drag
  document.addEventListener("drop", (e) => {
    if (!files(e)) return;
    e.preventDefault();
    depth = 0;
    dragging = false;
    update();
  });
  new IntersectionObserver(([e]) => { inView = e.intersectionRatio >= 0.5; update(); }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }).observe(box);
}
