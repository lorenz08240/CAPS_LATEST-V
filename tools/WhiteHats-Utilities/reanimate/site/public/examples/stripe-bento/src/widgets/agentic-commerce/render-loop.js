// Shared render loop, ported from stripe.com's WebGL helpers.
//
// One requestAnimationFrame drives every registered loop. The first 12 frames only measure the
// display refresh rate; after that each loop renders on every `frameInterval`-th frame and gets
// the time elapsed since the manager (re)started. Every 24 frames the measured frame rate is checked
// against the refresh rate: more than 10 % slower raises a warning level (up to 3), which makes
// loops skip more frames; getting faster again lowers it. Hidden tabs suspend everything.

const REFRESH_RATES = [240, 160, 144, 120, 60, 30, 24];
const ESTIMATE_FRAMES = 12;
const CHECK_FRAMES = 24;

const mean = (values) => values.reduce((a, b) => a + b) / values.length;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

class RenderLoopManager {
  static #instance = null;

  static get instance() {
    if (!RenderLoopManager.#instance) RenderLoopManager.#instance = new RenderLoopManager();
    return RenderLoopManager.#instance;
  }

  constructor() {
    this.frameTimes = [];
    this.lastFrameTime = 0;
    this.resumedTime = null;
    this.elapsedTime = 0;
    this.loops = new Set();
    this.warningLevel = 0;
    this.suspended = false;
    this.rafId = null;
    this.estimatedRefreshRate = undefined;
    this.estimatedAt = undefined;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.suspend("visibility");
      else this.resume("visibility");
    });
    this.start();
  }

  start() {
    if (this.rafId || this.suspended) return;
    this.lastFrameTime = performance.now();
    this.resumedTime = null;
    this.rafId = requestAnimationFrame(this.update);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  suspend(reason) {
    for (const loop of this.loops) loop.onRenderSuspended(reason);
    this.stop();
  }

  resume(reason) {
    this.lastFrameTime = performance.now();
    for (const loop of this.loops) loop.onRenderResumed(reason);
    this.start();
  }

  estimateRefreshRate() {
    if (!this.frameTimes.length) return undefined;
    const fps = 1000 / median(this.frameTimes);
    return REFRESH_RATES.reduce((best, rate) => (Math.abs(rate - fps) < Math.abs(best - fps) ? rate : best));
  }

  update = (now) => {
    this.rafId = requestAnimationFrame(this.update);
    this.frameTimes.push(now - this.lastFrameTime);
    this.lastFrameTime = now;

    if (this.frameTimes.length >= ESTIMATE_FRAMES && !this.estimatedRefreshRate) {
      this.estimatedRefreshRate = this.estimateRefreshRate();
      this.estimatedAt = performance.now();
      this.frameTimes = [];
      return;
    }

    // stripe.com holds every loop until the refresh rate is measured. There the manager is started by
    // the hero long before this card mounts; here it starts with the card, so loops also render while
    // it measures, otherwise the ring would appear 12 frames late.
    if (this.resumedTime === null) this.resumedTime = now - this.elapsedTime;
    this.elapsedTime = Math.max(now - this.resumedTime, 0);
    for (const loop of this.loops) {
      loop.frameCount += 1;
      if (loop.frameCount % loop.frameInterval === 0) loop.renderFunction(this.elapsedTime);
    }
    if (!this.estimatedRefreshRate || !this.estimatedAt) return;

    if (this.frameTimes.length >= CHECK_FRAMES) {
      // Average frame time without the two slowest frames.
      const times = [...this.frameTimes].sort((a, b) => a - b);
      times.splice(-2);
      const fps = 1000 / mean(times);
      const shortfall = this.estimatedRefreshRate - fps;
      if (shortfall > 0.1 * this.estimatedRefreshRate) {
        const level = Math.min(this.warningLevel + 1, 3);
        if (level !== this.warningLevel) {
          this.warningLevel = level;
          for (const loop of this.loops) loop.onPerformanceWarning(level);
        }
      } else if (shortfall < 0 && this.warningLevel > 0) {
        this.warningLevel -= 1;
        for (const loop of this.loops) loop.onPerformanceRecovered(this.warningLevel);
      }
      this.frameTimes = [];
    }
  };
}

class RenderLoop {
  constructor(renderFunction, frameInterval = 1) {
    this.renderFunction = renderFunction;
    this.frameCount = 0;
    this.frameInterval = frameInterval;
    this.initialFrameInterval = frameInterval;
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

export const createRenderLoop = (renderFunction, frameInterval = 1) => new RenderLoop(renderFunction, frameInterval);

// On stripe.com the manager is already running (other WebGL graphics started it long before this
// card mounts), so its refresh-rate measurement is done by the time the particles load. Starting it
// when this module is first imported gives the same head start.
export const warmUpRenderLoop = () => RenderLoopManager.instance;
