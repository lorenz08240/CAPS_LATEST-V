// The hero's ocean, as vercel.com/fluid mounts it. With WebGPU, src/ocean.worker.js renders on an
// OffscreenCanvas and posts each frame as an ImageBitmap, which is copied onto the visible 2D canvas;
// the canvas fades in over 700 ms when the first frame arrives. Without WebGPU, with reduced motion,
// with ?fluidRenderer=static, or when the worker fails, a still of the same ocean fades in instead.
//
// The worker starts on load, wherever the hero is, and pauses only once the hero has been on screen
// and then leaves it (or the tab is hidden): on vercel.com the first "paused" is posted before the
// worker exists and is lost, and this keeps that.

import { capDpr } from "./settings.js";

const hero = document.querySelector("[data-ocean-hero]");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const FALLBACK = {
  light: new URL("../assets/fallback-light.webp", import.meta.url).href,
  dark: new URL("../assets/fallback-dark.webp", import.meta.url).href,
};

/** "dark" or "light", from the theme class on <html> (see index.html), as on vercel.com. */
function theme() {
  const c = document.documentElement.classList;
  return c.contains("dark-theme") || c.contains("dark") ? "dark" : "light";
}

const el = (tag, className, attrs = {}) => {
  const e = document.createElement(tag);
  if (className) e.className = className;
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

function setHero({ mode, state, error }) {
  hero.dataset.fluidShaderMode = mode;
  hero.dataset.fluidShaderState = state;
  if (error) hero.dataset.fluidShaderError = error;
  else delete hero.dataset.fluidShaderError;
}

let mounted; // { stop() } of the live renderer or the fallback

function choose() {
  mounted?.stop();
  mounted = undefined;
  if (reducedMotion.matches) return showFallback("main");
  if (new URLSearchParams(location.search).get("fluidRenderer") === "static") return showFallback();
  if (navigator.gpu) return startLive();
  showFallback("main");
}

// ---------- the static fallback ----------

function showFallback(error) {
  setHero({ mode: "static", state: "fallback", error });
  const root = el("div", "absolute inset-0 z-0 overflow-hidden opacity-100", { "data-ocean-static-fallback": "true", "data-ocean-static-fallback-ready": "false" });
  for (const which of ["light", "dark"]) {
    const picture = el("picture", `ocean-fallback ocean-fallback--${which}`);
    const img = el("img", "ocean-fallback__img", { alt: "", width: "1512", height: "436", "aria-hidden": "true", decoding: "async", draggable: "false", src: FALLBACK[which] });
    const ready = () => {
      img.classList.add("is-ready");
      if (which === theme()) root.dataset.oceanStaticFallbackReady = "true";
    };
    img.addEventListener("load", () => (img.decode ? img.decode().then(ready, ready) : ready()), { once: true });
    picture.append(img);
    root.append(picture);
  }
  hero.append(root);
  mounted = { stop: () => root.remove() };
}

// ---------- the live renderer ----------

function startLive() {
  setHero({ mode: "webgpu", state: "starting" });
  const layer = el("div", "absolute inset-0 z-10", { "data-fluid-shader-renderer": "webgpu", "data-fluid-shader-state": "starting" });
  const canvas = el("canvas", "absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700");
  layer.append(canvas);
  hero.append(layer);
  Object.assign(canvas.dataset, { fluidShaderReady: "false", fluidShaderRenderer: "webgpu", fluidShaderState: "starting", fluidShaderFramesReceived: "0", fluidShaderFramesDrawn: "0" });
  canvas.style.opacity = "0";

  const abort = new AbortController();
  const { signal } = abort;
  let worker = null;
  let stopped = false;
  const send = (message) => worker?.postMessage(message);

  const fail = (reason, stage) => {
    if (stopped) return;
    console.warn("[fluid-ocean]", stage, reason);
    stop();
    mounted = undefined;
    showFallback(stage);
  };

  const ctx = canvas.getContext("2d", { alpha: true });
  const problem =
    typeof Worker === "undefined" ? "Worker is unavailable."
    : typeof OffscreenCanvas === "undefined" ? "OffscreenCanvas is unavailable."
    : !ctx ? "2D canvas rendering is unavailable."
    : !navigator.gpu ? "WebGPU is unavailable."
    : reducedMotion.matches ? "Reduced motion is enabled."
    : undefined;
  if (problem) {
    layer.remove();
    showFallback("main");
    return;
  }

  // Lifecycle: active while on screen (100 px margin) and the tab is visible. The first state is
  // "paused" and is "sent" before the worker exists, so it never reaches it.
  let phase = "idle";
  let intersecting = false;
  const setPhase = () => {
    const next = !document.hidden && intersecting ? "active" : "paused";
    if (next === phase) return;
    phase = next;
    send({ type: "lifecycle", lifecycle: next });
  };
  setPhase();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) intersecting = e.isIntersecting;
    setPhase();
  }, { rootMargin: "100px" });
  io.observe(layer);
  document.addEventListener("visibilitychange", setPhase, { signal });

  // Sizes: the backing store is the CSS box × the pixel ratio (capped at 2).
  const measure = () => {
    const r = layer.getBoundingClientRect();
    const dpr = capDpr(window.devicePixelRatio || 1);
    const cssWidth = Math.max(1, Math.floor(r.width || layer.clientWidth));
    const cssHeight = Math.max(1, Math.floor(r.height || layer.clientHeight));
    return { cssWidth, cssHeight, pixelWidth: Math.max(1, Math.floor(cssWidth * dpr)), pixelHeight: Math.max(1, Math.floor(cssHeight * dpr)), dpr };
  };
  let size = measure();
  let drawW = size.pixelWidth;
  let drawH = size.pixelHeight;

  worker = new Worker(new URL("./ocean.worker.js", import.meta.url), { type: "module" });
  worker.onerror = (e) => fail(e.message || "Fluid ocean worker failed.", "render");
  worker.onmessageerror = () => fail("Fluid ocean worker posted an unserializable message.", "render");
  worker.onmessage = ({ data: m }) => {
    if (stopped) return;
    switch (m.type) {
      case "ready":
        return;
      case "firstFrame": {
        canvas.style.opacity = "1";
        canvas.dataset.fluidShaderState = "ready";
        layer.dataset.fluidShaderState = "ready";
        setHero({ mode: "webgpu", state: "ready" });
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          canvas.removeEventListener("transitionend", onEnd);
          if (canvas.isConnected) canvas.dataset.fluidShaderReady = "true";
        };
        const onEnd = (e) => e.propertyName === "opacity" && finish();
        canvas.addEventListener("transitionend", onEnd);
        const timer = setTimeout(finish, 1300);
        return;
      }
      case "frame": {
        const bitmap = m.bitmap;
        canvas.dataset.fluidShaderFramesReceived = String(+canvas.dataset.fluidShaderFramesReceived + 1);
        canvas.dataset.fluidShaderLastBitmapWidth = String(bitmap.width);
        canvas.dataset.fluidShaderLastBitmapHeight = String(bitmap.height);
        try {
          if (!ctx || drawW < 1 || drawH < 1) return;
          if (canvas.width !== drawW) canvas.width = drawW;
          if (canvas.height !== drawH) canvas.height = drawH;
          // cover: a frame rendered for the previous size is scaled until the next one arrives
          const k = Math.max(drawW / bitmap.width, drawH / bitmap.height);
          const w = bitmap.width * k;
          const h = bitmap.height * k;
          ctx.globalCompositeOperation = "copy";
          ctx.drawImage(bitmap, (drawW - w) * 0.5, (drawH - h) * 0.5, w, h);
          canvas.dataset.fluidShaderFramesDrawn = String(+canvas.dataset.fluidShaderFramesDrawn + 1);
        } finally {
          bitmap.close();
        }
        return;
      }
      case "unsupported":
        return fail(m.reason, "capabilities");
      case "error":
        return fail(`${m.stage}: ${m.reason}`, m.stage);
      case "disposed":
        worker?.terminate();
        worker = null;
        return;
    }
  };
  send({ type: "init", dimensions: size, theme: theme(), isMobile: matchMedia("(max-width: 1023.98px)").matches });

  // Resizes and pixel-ratio changes reach the worker 150 ms after they settle; the visible canvas
  // follows at once (the last frame is stretched to cover it meanwhile).
  let resizeTimer;
  const pushSize = () => {
    resizeTimer = undefined;
    const next = measure();
    drawW = next.pixelWidth;
    drawH = next.pixelHeight;
    if (next.cssWidth !== size.cssWidth || next.cssHeight !== size.cssHeight || next.pixelWidth !== size.pixelWidth || next.pixelHeight !== size.pixelHeight || next.dpr !== size.dpr) {
      size = next;
      send({ type: "resize", dimensions: next });
    }
  };
  const resizeSoon = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(pushSize, 150);
  };
  const ro = new ResizeObserver(() => {
    const next = measure();
    drawW = next.pixelWidth;
    drawH = next.pixelHeight;
    resizeSoon();
  });
  ro.observe(layer);
  let dprQuery;
  const watchDpr = () => {
    dprQuery = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    dprQuery.addEventListener("change", () => (resizeSoon(), watchDpr()), { once: true, signal });
  };
  watchDpr();
  send({ type: "resize", dimensions: size }); // vercel.com sends one right after init

  const themeObserver = new MutationObserver(() => send({ type: "theme", theme: theme() }));
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  function stop() {
    if (stopped) return;
    stopped = true;
    abort.abort();
    io.disconnect();
    ro.disconnect();
    themeObserver.disconnect();
    clearTimeout(resizeTimer);
    send({ type: "dispose" });
    worker?.terminate();
    worker = null;
    layer.remove();
  }
  mounted = { stop };
}

// vercel.com mounts the ocean after hydration, when the preloaded font is in and the hero has its
// final height; waiting for the font here gives the first frame the same size.
const fontReady = Promise.race([document.fonts.load('450 64px "GeistSans"'), new Promise((r) => setTimeout(r, 3000))]).catch(() => {});
fontReady.then(() => {
  reducedMotion.addEventListener("change", choose);
  choose();
});
