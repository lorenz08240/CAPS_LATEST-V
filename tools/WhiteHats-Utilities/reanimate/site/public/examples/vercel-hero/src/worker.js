// The hero's render worker, as on vercel.com: it owns an OffscreenCanvas with a WebGL2 context, renders
// at the page's frame rate and posts each frame to the page as an ImageBitmap. The page tells it about
// the canvas size, the pointer, clicks, drag-and-drop, nav hovers, theme and visibility.

import { createRenderer, UnsupportedError } from "./renderer.js";
import { defaultSettings, heroModeFor, clampProbeDensity, clampCascadeCount, setZoom, zoomFor, simScale, setPointerCutoff, FPS_MOBILE } from "./config.js";

let state;
let initialized = false;
const queue = [];
const post = (msg, transfer) => self.postMessage(msg, transfer ?? []);
const reason = (e) => (e instanceof Error ? e.message : String(e));

function dimensions(d) {
  const finite = (v, f) => (Number.isFinite(v) ? v : f);
  const dpr = Math.max(1, finite(d.dpr, 1));
  const cssWidth = Math.max(1, Math.floor(finite(d.cssWidth, 1)));
  const cssHeight = Math.max(1, Math.floor(finite(d.cssHeight, 1)));
  return { cssWidth, cssHeight, pixelWidth: Math.max(1, Math.floor(finite(d.pixelWidth, cssWidth * dpr))), pixelHeight: Math.max(1, Math.floor(finite(d.pixelHeight, cssHeight * dpr))), dpr };
}
const sameDims = (a, b) => a?.cssWidth === b.cssWidth && a.cssHeight === b.cssHeight && a.pixelWidth === b.pixelWidth && a.pixelHeight === b.pixelHeight && a.dpr === b.dpr;
/** The pointer in simulation px (the simulation is at least 360 px tall). */
const brushFrom = (base, p) =>
  p && p.active ? { ...base, x: p.x, y: p.y, active: true, inside: p.inside ?? false, isMouse: p.isMouse ?? false } : { ...base, x: -1e3, y: -1e3, active: false, inside: false, isMouse: false };

function schedule(s) {
  if (s.disposed || s.lifecycle !== "active" || s.animationHandle !== undefined || s.timerHandle !== undefined) return;
  if (typeof self.requestAnimationFrame === "function") {
    s.animationHandle = self.requestAnimationFrame((t) => { s.animationHandle = undefined; tick(t); });
    return;
  }
  s.timerHandle = setTimeout(() => { s.timerHandle = undefined; tick(performance.now()); }, s.targetFrameMs);
}
function unschedule(s) {
  if (s.animationHandle !== undefined) { self.cancelAnimationFrame?.(s.animationHandle); s.animationHandle = undefined; }
  if (s.timerHandle !== undefined) { clearTimeout(s.timerHandle); s.timerHandle = undefined; }
}

function tick(now) {
  const s = state;
  if (!s || s.disposed || s.lifecycle !== "active") return;
  schedule(s);
  if (now - s.lastRenderAt < s.targetFrameMs - 0.5) return; // frame pacing (30 fps on small screens)
  s.lastRenderAt = now;
  try {
    // resizes are applied at most every 66 ms
    const pending = s.pendingResizeDimensions;
    if (pending) {
      if (sameDims(s.dimensions, pending)) s.pendingResizeDimensions = undefined;
      else {
        const since = s.lastResizeCommitAt === undefined ? 66 : now - s.lastResizeCommitAt;
        if (s.lastResizeCommitAt === undefined || !(since < 66)) {
          s.pendingResizeDimensions = undefined;
          s.dimensions = pending;
          s.lastResizeCommitAt = now;
          if (s.canvas.width !== pending.pixelWidth) s.canvas.width = pending.pixelWidth;
          if (s.canvas.height !== pending.pixelHeight) s.canvas.height = pending.pixelHeight;
          setZoom(zoomFor(s.baseCameraZoom, pending.cssHeight, s.heroMobile));
        }
      }
    }
    const time = (now - s.pauseTimeOffset) / 1e3;
    const { cssWidth, cssHeight, dpr } = s.dimensions;
    const k = simScale(cssHeight);
    const sim = { simulationWidth: cssWidth * k, simulationHeight: cssHeight * k, pixelRatio: dpr, probeDensity: s.probeDensity, ...(s.cascadeCount !== undefined ? { cascadeCount: s.cascadeCount } : {}) };
    const options = {
      renderBlackOccluder: s.settings.occluderTriangle.showOccluderTriangle,
      hero: s.settings.hero, theme: s.theme, lightAo: s.settings.lightAo, lightGlow: s.settings.lightGlow, radianceDebug: s.settings.radianceDebug,
      darkFloor: s.settings.darkFloor, darkPostprocess: s.settings.darkPostprocess, hoverRgbTint: s.settings.hoverRgbTint,
      hoverRgbDeployActive: s.rgbDeployActive, dropActive: s.dropActive, dropStaging: s.dropStaging,
      showForegroundTriangle: s.settings.occluderTriangle.showOccluderTriangle,
    };
    if (!s.renderer.render(s.canvas.width, s.canvas.height, s.brush, time, s.settings.tunables, sim, options, s.settings.probeDiscard)) return;
    if (!s.firstFrameSent && s.renderer.stats.cascadeCount > 0) { s.firstFrameSent = true; post({ type: "firstFrame" }); }
    const bitmap = s.canvas.transferToImageBitmap();
    post({ type: "frame", bitmap }, [bitmap]);
  } catch (e) {
    post({ type: "error", stage: "render", reason: reason(e) });
    unschedule(s);
  }
}

function dispose(stage) {
  const s = state;
  state = undefined;
  if (!s) { if (initialized) post({ type: "disposed" }); return; }
  s.disposed = true;
  unschedule(s);
  try { s.renderer.destroy(); post({ type: "disposed" }); } catch (e) { post({ type: "error", stage, reason: reason(e) }); }
}
const withState = (stage, fn) => { const s = state; if (s && !s.disposed) try { fn(s); } catch (e) { post({ type: "error", stage, reason: reason(e) }); } };

async function init(msg) {
  if (initialized || state) return post({ type: "error", stage: "init", reason: "Hero worker already initialized." });
  initialized = true;
  await Promise.resolve();
  let renderer;
  try {
    const dims = dimensions(msg.dimensions);
    const canvas = new OffscreenCanvas(dims.pixelWidth, dims.pixelHeight);
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: false, depth: false, stencil: false });
    if (!gl) throw new UnsupportedError("OffscreenCanvas WebGL2 context is unavailable.");
    if (!gl.getExtension("EXT_color_buffer_float")) throw new UnsupportedError("WebGL2 EXT_color_buffer_float is unavailable; float render targets are required.");
    gl.getExtension("OES_texture_float_linear");
    const settings = defaultSettings(msg.activeClick);
    Object.assign(settings.hero, heroModeFor(msg.activeClick));
    const fps = msg.targetFps === undefined || !Number.isFinite(msg.targetFps) || msg.targetFps <= 0 ? 60 : Math.min(120, Math.max(1, msg.targetFps));
    setPointerCutoff(fps <= FPS_MOBILE ? 0.1 : 0.2);
    const baseCameraZoom = msg.cameraZoom ?? 1;
    const heroMobile = msg.heroMobile ?? false;
    setZoom(zoomFor(baseCameraZoom, dims.cssHeight, heroMobile));
    renderer = createRenderer(gl);
    state = {
      canvas, gl, renderer, settings, dimensions: dims, pendingResizeDimensions: undefined, lastResizeCommitAt: undefined,
      theme: msg.theme, lifecycle: "active", brush: brushFrom(settings.brush), rgbDeployActive: false,
      dropActive: msg.dropActive === true, dropStaging: msg.dropStaging === true, activeClick: msg.activeClick,
      probeDensity: clampProbeDensity(msg.probeDensity), cascadeCount: clampCascadeCount(msg.cascadeCount), baseCameraZoom, heroMobile,
      targetFps: fps, targetFrameMs: 1e3 / fps, animationHandle: undefined, timerHandle: undefined, lastRenderAt: -Infinity,
      pauseTimeOffset: 0, pausedAt: undefined, firstFrameSent: false, disposed: false,
    };
    while (state && queue.length) handle(queue.shift());
    if (state && !state.disposed) { post({ type: "ready" }); schedule(state); }
  } catch (e) {
    post({ type: e instanceof UnsupportedError ? "unsupported" : "error", stage: "init", reason: reason(e) });
    if (state) dispose("dispose"); else renderer?.destroy();
  } finally {
    queue.length = 0;
  }
}

function handle(msg) {
  if (msg.type !== "init" && !state) return void queue.push(msg);
  switch (msg.type) {
    case "init": return void init(msg);
    case "resize":
      return withState("resize", (s) => {
        s.pendingResizeDimensions = dimensions(msg.dimensions);
        if (msg.cameraZoom !== undefined) s.baseCameraZoom = msg.cameraZoom;
        if (msg.heroMobile !== undefined) s.heroMobile = msg.heroMobile;
      });
    case "pointer":
      return withState("render", (s) => {
        const k = simScale(s.dimensions.cssHeight);
        s.brush = brushFrom(s.settings.brush, { ...msg.pointer, x: msg.pointer.x * k, y: msg.pointer.y * k });
      });
    case "click":
      return withState("render", (s) => { s.rgbDeployActive = msg.click.kind === "toggle" ? !s.rgbDeployActive : msg.click.deployed; });
    case "dropActive": return withState("render", (s) => { s.dropActive = msg.active; });
    case "dropStaging": return withState("render", (s) => { s.dropStaging = msg.active; });
    case "activeClick":
      return withState("render", (s) => { s.activeClick = msg.activeClick; Object.assign(s.settings.hero, heroModeFor(msg.activeClick)); });
    case "theme": return withState("render", (s) => { s.theme = msg.theme; });
    case "lifecycle":
      return withState("render", (s) => {
        const was = s.lifecycle;
        s.lifecycle = msg.lifecycle;
        if (msg.lifecycle !== "active" && was === "active") s.pausedAt = performance.now();
        else if (msg.lifecycle === "active" && was !== "active") {
          if (s.pausedAt !== undefined) { s.pauseTimeOffset += performance.now() - s.pausedAt; s.pausedAt = undefined; }
          schedule(s);
        }
        if (msg.lifecycle !== "active") unschedule(s);
        if (msg.lifecycle === "torn-down") dispose("dispose");
      });
    case "dispose": return void dispose("dispose");
    default: throw new Error(`Unhandled hero worker message: ${String(msg?.type)}`);
  }
}

self.onmessage = (e) => {
  try { handle(e.data); } catch (err) { post({ type: "error", stage: "render", reason: reason(err) }); }
};
