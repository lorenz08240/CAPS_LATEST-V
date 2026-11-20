// Named easings used by the globe's arc timeline (same table as stripe.com).
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const EASINGS = {
  linear: (t) => t,
  easeOutCubic,
  easeInCubic: (t) => t * t * t,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInQuad: (t) => t * t,
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
  easeInExpo: (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
  easeOutBack: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  easeInBack: (t) => 2.70158 * t * t * t - 1.70158 * t * t,
};

/** Applies the named easing to t, clamping t to [0, 1]. Unknown names fall back to easeOutCubic. */
export function ease(t, name) {
  return (EASINGS[name] ?? easeOutCubic)(Math.max(0, Math.min(1, t)));
}
