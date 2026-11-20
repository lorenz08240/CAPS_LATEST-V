// The ocean's constants, as vercel.com/fluid ships them. Shared by the page and the worker.

export const DEFAULTS = {
  ocean: {
    windSpeed: 12.9,
    windAngle: 4.83,
    amplitude: 1.3,
    choppiness: 1.51,
    displacementScale: 0.005,
    foamThreshold: 0,
    timeScale: 0.6, // simulated seconds per second
  },
  particles: {
    pointSize: 0.75, // dot diameter is 2 × this × the pixel ratio, in device px
    resolution: 256, // the grid is N × N dots; 512 on screens 1024 px and wider
    snap: 50, // dots snap to a grid of (canvas height / 2 / snap) CSS px
    fadeNear: 60,
    fadeFar: 115,
    fadePower: 3.2,
  },
  glow: { bloomStrength: 0.08, bloomRadius: 0.46, bloomThreshold: 0.55 },
  camera: { eyeY: 19.3, pitchDegrees: -38.9 },
};

export const CAMERA = { eye: [0, 6, 60], target: [0, 4, -40], up: [0, 1, 0], fovDegrees: 60, near: 0.1, far: 2000 };
export const G = 9.81;
export const OCEAN_SIZE = 200; // the spectrum's patch size
export const TIME_FACTOR = 0.5; // spectrum time = simTime × this
export const PARTICLE_EXTENT = 400; // world size of the dot grid; also the normal pass's "worldSize"
export const NOISE_SEED = 0x6f636561; // "ocea"
export const LIGHT_DEFAULT = 0;
export const COLORS = { ocean: linearRgb(0x0a0a0a), neon: linearRgb(0xffffff), foam: linearRgb(0xffffff) };

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function linearRgb(hex) {
  return [srgbToLinear(((hex >> 16) & 255) / 255), srgbToLinear(((hex >> 8) & 255) / 255), srgbToLinear((hex & 255) / 255)];
}

/** Device pixel ratio, capped at 2 as on vercel.com. */
export function capDpr(dpr) {
  return !Number.isFinite(dpr) || dpr <= 0 ? 1 : Math.min(dpr, 2);
}

/** The settings for a phone-sized (narrower than 1024 px) or a desktop screen. */
export function resolveSettings(isMobile) {
  return {
    ocean: { ...DEFAULTS.ocean },
    particles: { ...DEFAULTS.particles, resolution: isMobile ? 256 : 512 },
    glow: { ...DEFAULTS.glow },
    camera: { ...DEFAULTS.camera },
  };
}
