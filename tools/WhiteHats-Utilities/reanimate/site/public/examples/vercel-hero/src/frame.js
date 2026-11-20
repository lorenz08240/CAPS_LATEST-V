// Per-frame state of vercel.com's hero (module 4519386): it smooths every input the LEDs and the floor
// react to, on the frame clock, then updates the LEDs.
//   colour mix: 0 → 1 while a file is dragged over the page or after a click on the triangle, with a
//               0.2 s time constant; it drives the floor's prism colours and the LEDs' base brightness
//   drop factor: 0 → 1 while a file is over the page, 0.25 s time constant; brings in the LED segments
//   drop phase: how far the segments have run, reset each time a drag starts
//   brightnessMin: x4 while the pointer is inside the triangle, 0.2 s time constant

import { BRUSH, TUNABLES, PROBE_DISCARD, LIGHT_AO, LIGHT_GLOW, RADIANCE_DEBUG, DARK_FLOOR, DARK_POST, HOVER_RGB, MODES, BRIGHTNESS_MIN_INSIDE, BRIGHTNESS_MIN_SMOOTHING, DROP_SMOOTHING, STAGING_SMOOTHING, DROP_SPEEDUP } from "./config.js";
import { clamp01, lerp } from "./leds.js";

const HERO = { mode: MODES.lines, transitionDuration: 0.25, scanSpeed: 0.08, scanHeadWidth: 7.5, scanRedShift: 0.3, scanBlueShift: 0.3, scanHueRotationSpeed: 0.03, pulseSpeed: 0.25, pulseWidth: 4, edgeIndex: 0, edgeBaseBrightness: 0.05, edgeHighlightBrightness: 0.4 };
const NO_POINTER = Object.freeze({ x: -1e3, y: -1e3, active: false, inside: false, isMouse: false });

/** Exponential smoothing towards `target` with time constant `tau` seconds, steps capped at 0.25 s. */
function smoother(clampTarget = true) {
  let started = false, last = 0, value = 0;
  return (target, time, tau) => {
    const want = clampTarget ? clamp01(target) : target;
    if (!started) { started = true; last = time; return (value = want); }
    const dt = time - last;
    last = time;
    if (tau <= 0 || !Number.isFinite(tau)) return (value = want);
    const k = 1 - Math.exp(-Math.min(0.25, Math.max(0, Number.isFinite(dt) ? dt : 0)) / tau);
    value = lerp(value, want, k);
    if (Math.abs(value - want) < 1e-4) value = want;
    return value;
  };
}

export function createFrameResolver() {
  const staging = smoother(), dropping = smoother(), colour = smoother(), minimum = smoother(false);
  let lastTime;
  let wasEngaged = false, phase = 0;
  let deploying = false, deployStart = 0, deployElapsed = 0;
  // ledIntensity / brightnessMax follow mode changes with the LEDs' own cross-fade
  let ready = false, fading = false, intensityFrom = 0, intensityTo = 0, intensity = 0, maxFrom = 0, maxTo = 0, max = 0;
  const brush = { ...BRUSH, x: -1e3, y: -1e3, active: false };
  const tunables = { ...TUNABLES }, hero = { ...HERO }, probeDiscard = { ...PROBE_DISCARD }, lightAo = { ...LIGHT_AO }, lightGlow = { ...LIGHT_GLOW };
  const radianceDebug = { ...RADIANCE_DEBUG }, darkFloor = { ...DARK_FLOOR }, darkPostprocess = { ...DARK_POST }, hoverRgbTint = { ...HOVER_RGB };

  return {
    resolveFrame({ patch, tunables: tun, options, probeDiscard: pd, theme, time, updateLedsFor }) {
      Object.assign(brush, BRUSH, NO_POINTER, patch);
      Object.assign(tunables, TUNABLES, tun);
      Object.assign(hero, HERO, options?.hero);
      Object.assign(probeDiscard, PROBE_DISCARD, pd);
      Object.assign(lightAo, LIGHT_AO, options?.lightAo);
      Object.assign(lightGlow, LIGHT_GLOW, options?.lightGlow);
      Object.assign(radianceDebug, RADIANCE_DEBUG, options?.radianceDebug);
      Object.assign(darkFloor, DARK_FLOOR, options?.darkFloor);
      Object.assign(darkPostprocess, DARK_POST, options?.darkPostprocess);
      Object.assign(hoverRgbTint, HOVER_RGB, options?.hoverRgbTint);
      hoverRgbTint.amount = theme === "light" ? 0 : clamp01(hoverRgbTint.amount);

      const dropActive = options?.dropActive === true;
      const dropStaging = options?.dropStaging === true;
      const engaged = dropActive || dropStaging;
      const boost = staging(+dropStaging, time, STAGING_SMOOTHING);
      {
        const dt = lastTime !== undefined ? time - lastTime : 0;
        lastTime = time;
        const step = Math.min(0.25, Math.max(0, Number.isFinite(dt) ? dt : 0));
        const started = engaged && !wasEngaged;
        if (started) phase = 0;
        wasEngaged = engaged;
        if (engaged || boost > 1e-4) {
          const speed = lerp(1, DROP_SPEEDUP, clamp01(boost));
          if (!started) phase += step * speed;
        } else phase = 0;
      }
      const drop = dropping(+engaged, time, DROP_SMOOTHING);
      const deploy = hoverRgbTint.enabled && (options?.hoverRgbDeployActive === true || engaged);
      if (deploy && !deploying) { deployStart = time; deployElapsed = 0; }
      deploying = deploy;
      if (deploy) deployElapsed = Math.max(0, time - deployStart);
      const colorMix = colour(+deploy, time, hoverRgbTint.responseSmoothing);
      const minTarget = theme === "dark" ? tunables.brightnessMinDark : tunables.brightnessMin * colorMix;
      tunables.brightnessMin = minimum(brush.active && brush.inside === true ? minTarget * BRIGHTNESS_MIN_INSIDE : minTarget, time, BRIGHTNESS_MIN_SMOOTHING);

      const leds = updateLedsFor({
        time, tunables, settings: hero,
        hoverDeploy: { factor: colorMix, elapsed: deployElapsed, time, tint: hoverRgbTint },
        dropActive: { factor: drop, phase, boost },
        brush, theme,
      });
      const wantIntensity = tunables.ledIntensity;
      const wantMax = hero.mode === MODES.scan ? 1 : hero.mode === MODES.pulse ? 0.5 : theme === "light" ? tunables.brightnessMaxLight : tunables.brightnessMax;
      if (!ready) {
        ready = true; fading = false;
        intensityFrom = intensityTo = intensity = wantIntensity;
        maxFrom = maxTo = max = wantMax;
      } else {
        let hold = false;
        if (leds.modeChanged) { intensityFrom = intensity; intensityTo = wantIntensity; maxFrom = max; maxTo = wantMax; fading = leds.progress < 1; }
        else if (!fading) { intensityTo = intensity = wantIntensity; maxTo = max = wantMax; hold = true; }
        if (!hold) {
          if (fading) {
            intensity = lerp(intensityFrom, intensityTo, leds.easedProgress);
            max = lerp(maxFrom, maxTo, leds.easedProgress);
            if (leds.progress >= 1) fading = false;
          } else { intensity = intensityTo; max = maxTo; }
        }
      }
      tunables.ledIntensity = intensity;
      tunables.brightnessMax = max;
      return { brush, tunables, hero, probeDiscard, lightAo, lightGlow, radianceDebug, darkFloor, darkPostprocess, hoverRgbTint, colorMix };
    },
  };
}
