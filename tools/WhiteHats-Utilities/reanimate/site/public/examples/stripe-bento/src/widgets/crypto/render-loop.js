// requestAnimationFrame driver shared by every WebGL graphic on the page (port of stripe.com's
// render-loop manager). It measures the display refresh rate over the first 12 frames, and calls
// each registered loop every frame. Every 24 frames it compares the
// achieved frame rate with the estimate: more than 10 % slower raises a warning level (1..3),
// faster than the estimate lowers it again. Loops use the level to skip frames.

const REFRESH_RATES = [240, 160, 144, 120, 60, 30, 24];
const ESTIMATE_FRAMES = 12;
const CHECK_FRAMES = 24;
const MAX_WARNING_LEVEL = 3;

const median = (values) => {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const mean = (values) => (values.length ? values.reduce((a, b) => a + b) / values.length : undefined);

class RenderLoopManager {
  static get instance() {
    // One manager per page, like stripe.com's singleton, so every graphic shares the estimate.
    if (!window.__bentoRenderLoopManager) window.__bentoRenderLoopManager = new RenderLoopManager();
    return window.__bentoRenderLoopManager;
  }

  constructor() {
    this.frameTimes = [];
    this.lastFrameTime = 0;
    this.resumedTime = null;
    this.elapsedTime = 0;
    this.loops = new Set();
    this.warningLevel = 0;
    this.estimatedRefreshRate = undefined;
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
    this.stop();
  }

  resume() {
    this.lastFrameTime = performance.now();
    this.start();
  }

  update = (time) => {
    this.rafId = requestAnimationFrame(this.update);
    const frameTime = time - this.lastFrameTime;
    this.lastFrameTime = time;
    this.frameTimes.push(frameTime);

    if (!this.estimatedRefreshRate) {
      if (this.frameTimes.length >= ESTIMATE_FRAMES) {
        const fps = 1000 / median(this.frameTimes);
        this.estimatedRefreshRate = REFRESH_RATES.reduce((best, rate) =>
          Math.abs(rate - fps) < Math.abs(best - fps) ? rate : best,
        );
        this.frameTimes = [];
      }
      // On stripe.com the hero gradient starts this singleton at page load, so the estimate is
      // long done when the bento graphics mount. Here the manager starts with the lazily loaded
      // widget, so loops run during the estimate too, rather than waiting 12 frames.
      this.runLoops(time);
      return;
    }

    this.runLoops(time);

    if (this.frameTimes.length >= CHECK_FRAMES) {
      const sorted = this.frameTimes.slice().sort((a, b) => a - b);
      sorted.splice(-2); // ignore the two slowest frames
      const deficit = this.estimatedRefreshRate - 1000 / mean(sorted);
      if (deficit > 0.1 * this.estimatedRefreshRate) {
        const level = Math.min(this.warningLevel + 1, MAX_WARNING_LEVEL);
        if (level !== this.warningLevel) {
          this.warningLevel = level;
          for (const loop of this.loops) loop.onPerformanceWarning(level);
        }
      } else if (deficit < 0 && this.warningLevel > 0) {
        this.warningLevel -= 1;
        for (const loop of this.loops) loop.onPerformanceRecovered?.(this.warningLevel);
      }
      this.frameTimes = [];
    }
  };

  runLoops(time) {
    if (this.resumedTime === null) this.resumedTime = time - this.elapsedTime;
    this.elapsedTime = Math.max(time - this.resumedTime, 0);
    for (const loop of this.loops) {
      loop.frameCount += 1;
      if (loop.frameCount % loop.frameInterval === 0) loop.renderFunction(this.elapsedTime);
    }
  }
}

export class RenderLoop {
  constructor(renderFunction, frameInterval = 1) {
    this.frameCount = 0;
    this.frameInterval = frameInterval;
    this.initialFrameInterval = frameInterval;
    this.renderFunction = renderFunction;
    this.onPerformanceWarning = (level) => {
      this.frameInterval = Math.max(level + 1, this.frameInterval);
    };
    this.onPerformanceRecovered = (level) => {
      this.frameInterval = Math.max(level + 1, this.initialFrameInterval);
    };
  }

  start() {
    RenderLoopManager.instance.loops.add(this);
  }

  stop() {
    RenderLoopManager.instance.loops.delete(this);
  }
}

/** Starts measuring the refresh rate early, so loops created a bit later can run from their first frame. */
export function warmUpRenderLoops() {
  return RenderLoopManager.instance;
}
