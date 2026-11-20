// Renderer creation with stripe.com's capability check, and its shared render loop:
// one requestAnimationFrame for every graphic, a refresh-rate estimate from the first
// 12 frames (nothing is drawn until then), per-graphic frame intervals, and a
// performance governor that skips more frames when the page cannot keep up.

import { WebGLRenderer } from "three";

const REFRESH_RATES = [240, 160, 144, 120, 60, 30, 24];
const REQUIRED_EXTENSIONS = [
  "EXT_color_buffer_float",
  "EXT_texture_filter_anisotropic",
  "WEBGL_debug_renderer_info",
  "WEBGL_debug_shaders",
];

const mean = (values) => (values.length ? values.reduce((a, b) => a + b) / values.length : undefined);

function median(values) {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function hasRequiredCapabilities(renderer, extraExtensions = []) {
  const { capabilities, extensions } = renderer;
  return (
    capabilities.isWebGL2 &&
    capabilities.vertexTextures &&
    capabilities.maxTextureSize >= 4096 &&
    capabilities.maxVertexUniforms >= 256 &&
    capabilities.maxFragmentUniforms >= 256 &&
    [...REQUIRED_EXTENSIONS, ...extraExtensions].every((name) => extensions.get(name) !== null)
  );
}

// First try without a major performance caveat, then accept one but report it.
export function createRenderer(params, extraExtensions = []) {
  let renderer;
  let hasMajorPerformanceCaveat = false;
  try {
    renderer = new WebGLRenderer({ ...params, failIfMajorPerformanceCaveat: true });
  } catch {
    hasMajorPerformanceCaveat = true;
  }
  if (!renderer) {
    try {
      renderer = new WebGLRenderer({ ...params, failIfMajorPerformanceCaveat: false });
    } catch {}
  }
  return {
    renderer,
    hasMajorPerformanceCaveat,
    hasRequiredCapabilities: renderer ? hasRequiredCapabilities(renderer, extraExtensions) : false,
  };
}

export class RenderLoop {
  constructor(renderFunction) {
    this.frameCount = 0;
    this.frameInterval = 1;
    this.initialFrameInterval = 1;
    this.renderFunction = renderFunction;
    this.onRenderSuspended = () => {};
    this.onRenderResumed = () => {};
  }
  onPerformanceWarning(level) {
    this.frameInterval = Math.max(level + 1, this.frameInterval);
  }
  onPerformanceRecovered(level) {
    this.frameInterval = Math.max(level + 1, this.initialFrameInterval);
  }
  start() {
    RenderLoopManager.instance.loops.add(this);
  }
  stop() {
    RenderLoopManager.instance.loops.delete(this);
  }
}

class RenderLoopManager {
  static get instance() {
    if (!RenderLoopManager._instance) RenderLoopManager._instance = new RenderLoopManager();
    return RenderLoopManager._instance;
  }

  constructor() {
    this.loops = new Set();
    this.frameTimes = [];
    this.lastFrameTime = 0;
    this.resumedTime = null;
    this.elapsedTime = 0;
    this.warningLevel = 0; // 0 none … 3 max
    this.estimatedRefreshRate = undefined;
    this.estimatedAt = undefined;
    this.rafId = null;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.suspend();
      else this.resume();
    });
    this.start();
  }

  start() {
    if (this.rafId) return;
    this.lastFrameTime = performance.now();
    this.resumedTime = null;
    this.rafId = requestAnimationFrame(this.update);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  suspend() {
    this.loops.forEach((loop) => loop.onRenderSuspended("visibility"));
    this.stop();
  }

  resume() {
    this.lastFrameTime = performance.now();
    this.loops.forEach((loop) => loop.onRenderResumed("visibility"));
    this.start();
  }

  update = (now) => {
    this.rafId = requestAnimationFrame(this.update);
    const dt = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameTimes.push(dt);

    if (this.frameTimes.length >= 12 && !this.estimatedRefreshRate) {
      this.estimatedRefreshRate = this.estimateRefreshRate();
      this.estimatedAt = performance.now();
      this.frameTimes = [];
      return;
    }
    if (!this.estimatedRefreshRate || !this.estimatedAt) return;

    if (this.resumedTime === null) this.resumedTime = now - this.elapsedTime;
    this.elapsedTime = Math.max(now - this.resumedTime, 0);
    this.loops.forEach((loop) => {
      loop.frameCount += 1;
      if (loop.frameCount % loop.frameInterval === 0) loop.renderFunction(this.elapsedTime);
    });

    if (this.frameTimes.length < 24) return;
    // Every 24 frames: compare the achieved frame rate (two slowest frames dropped) with the display's.
    const sorted = this.frameTimes.slice().sort((a, b) => a - b);
    sorted.splice(-2);
    const fps = 1000 / mean(sorted);
    const shortfall = this.estimatedRefreshRate - fps;
    if (shortfall > 0.1 * this.estimatedRefreshRate) {
      const level = Math.min(this.warningLevel + 1, 3);
      if (this.warningLevel !== level) {
        this.warningLevel = level;
        this.loops.forEach((loop) => loop.onPerformanceWarning(level));
      }
    } else if (shortfall < 0 && this.warningLevel > 0) {
      this.warningLevel -= 1;
      this.loops.forEach((loop) => loop.onPerformanceRecovered(this.warningLevel));
    }
    this.frameTimes = [];
  };

  estimateRefreshRate() {
    if (!this.frameTimes.length) return undefined;
    const measured = 1000 / median(this.frameTimes);
    return REFRESH_RATES.reduce((best, rate) => (Math.abs(rate - measured) < Math.abs(best - measured) ? rate : best));
  }
}

// On stripe.com the shared loop is already running (the hero gradient starts it), so the
// refresh-rate estimate is done before this graphic loads. Start it as early as possible.
export function warmUpRenderLoop() {
  return RenderLoopManager.instance;
}

// True once the refresh-rate estimate is done and loops are being called.
export function isRenderLoopWarm() {
  return !!RenderLoopManager.instance.estimatedRefreshRate;
}

export function renderLoopElapsed() {
  return RenderLoopManager.instance.elapsedTime;
}

export function createRenderLoop(renderFunction, frameInterval = 1) {
  const loop = new RenderLoop(renderFunction);
  loop.frameInterval = frameInterval;
  loop.initialFrameInterval = frameInterval;
  return loop;
}
