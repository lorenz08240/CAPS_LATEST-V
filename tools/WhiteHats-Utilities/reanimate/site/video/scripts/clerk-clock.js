// Run on clerk.com and on the copy before "how it works" films them (clips.ts, --pre-js), so both get
// the same layout and random numbers.
Math.random = () => 0.37;
document.body.style.padding = "1800px 0 900px";
// capture.ts --clock virtual fix: Motion (clerk.com) syncs its WAAPI animations with
// `animation.startTime = <performance.now() at creation>`. performance.now() is virtual but the native
// document timeline is not, so the animation would look started long ago and finish at once. Translate the
// assignment into the equivalent currentTime on the virtual clock. No-op for pages that never set startTime.
(() => {
  const desc = Object.getOwnPropertyDescriptor(Animation.prototype, "startTime");
  if (!desc || !desc.set || !window.__mcClock || !window.__mcClock.virtual) return;
  Object.defineProperty(Animation.prototype, "startTime", {
    configurable: true,
    get() { return desc.get.call(this); },
    set(v) {
      if (typeof v === "number" && this.timeline === document.timeline) {
        this.currentTime = Math.max(0, window.__mcClock.now() - v) * (this.playbackRate || 1);
      } else desc.set.call(this, v);
    },
  });
})();
