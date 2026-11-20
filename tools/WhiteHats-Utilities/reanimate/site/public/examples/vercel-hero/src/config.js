// Settings and triangle geometry of vercel.com's hero, ported from its bundle (modules 6552015, 2462e3
// and 4077675 of the vercel-marketing build). Numbers are vercel.com's; names are ours.
// Runs in the worker and on the page; each keeps its own camera zoom, as on vercel.com.

/** Triangle height as a fraction of the simulation height, before the camera zoom. */
export const TRIANGLE_HEIGHT = (180 / 630) * 0.8;
export const LEDS_PER_SIDE = 24;
export const LED_COUNT = 3 * LEDS_PER_SIDE;
export const LED_ROWS = LED_COUNT;
export const DESIGN_HEIGHT = 720;
export const ZOOM_DESKTOP = 1.3;
export const ZOOM_MOBILE = 1.6;
export const FPS_DESKTOP = 60;
export const FPS_MOBILE = 30;
export const ANIMATION_CLOCK_START = 10;
export const BRIGHTNESS_MIN_INSIDE = 4; // brightnessMin is multiplied by this while the pointer is inside
export const BRIGHTNESS_MIN_SMOOTHING = 0.2;
export const DROP_SMOOTHING = 0.25; // seconds, the drop factor's time constant
export const STAGING_SMOOTHING = 0.25;
export const DROP_SPEEDUP = 4; // the drop segments run up to 4x faster while staging
export const DROP_SEGMENTS = 3;
export const DROP_SEGMENT_SPEED = (72 * 0.3) / 1.2 * 0.5; // LEDs per second
export const DROP_SEGMENT_HALF = 3.5;
export const DROP_SEGMENT_CORE = 1;
export const DROP_SEGMENT_GROW = 2;
export const DROP_BASE_MIN = 0.5;
export const DROP_BASE_MAX = 0.5;
export const DROP_SEGMENT_SPEEDS = Array.from({ length: 3 }, (_, i) => {
  const v = 43758.5453 * Math.sin(12.9898 * i + 78.233);
  return 0.2 + 0.8 * (v - Math.floor(v));
});
export const LED_EMITTER_EXPAND = 1; // px the emitter quads grow past the LED shape
export const LED_CLIP_EXPAND = 2;

export const MODES = { coding: "coding", scan: "scan", pulse: "pulse", edge: "edge", lines: "lines", lines2: "lines2" };

const HERO = { mode: MODES.lines, transitionDuration: 0.25, scanSpeed: 0.08, scanHeadWidth: 7.5, scanRedShift: 0.3, scanBlueShift: 0.3, scanHueRotationSpeed: 0.03, pulseSpeed: 0.25, pulseWidth: 4, edgeIndex: 0, edgeBaseBrightness: 0.05, edgeHighlightBrightness: 0.4 };
export const BRUSH = { radius: 28, friction: 5, colour: { r: 1, g: 1, b: 1 }, glowEnabled: true, glowRadius: 165, glowStrength: 1, glowSmoothing: 0.23, glowFacingEnabled: true, glowFacingFullDeg: 90, glowFacingZeroDeg: 100, linesFadeDistance: 0.6 };
export const TUNABLES = { darkFloorAlbedo: 1, lightFloorAlbedo: 1, ledIntensity: 1, noiseScale: 0.01, rotationSpeed: -0.2, brightnessMin: 0.09, brightnessMinDark: 0.05, brightnessMax: 1, brightnessMaxLight: 1.02, ledHitThreshold: 1, ledRaycastClipInsetPx: 2, particleExposureBoostMin: 5.2, particleExposureBoostMax: 60, particleSpawnSpread: 118, particleNoiseOffset: 1 };
export const LED_CLIP_INSET_RANGE = { min: -4, max: 8 };
export const HOVER_RGB = { enabled: true, amount: 1, radius: 173, power: 3, responseSmoothing: 0.2, deployDurationSeconds: 0.5, noiseBrightnessMin: 0.3, noiseBrightnessMax: 10, noiseBrightnessPower: 2, edgeRedLinear: { r: 0.896269, g: 0.027321, b: 0.051269 }, edgeGreenLinear: { r: 0, g: 0.40724, b: 0.048172 }, edgeBlueLinear: { r: 0, g: 0.278894, b: 1 }, edgeOverlap: 1 };
export const PROBE_DISCARD = { lightAabbPadding: 0 };
export const LIGHT_AO = { radiance: 0.07, contactOpacity: 0.1, contactSize: 3, contactFalloffPower: 1.6, highlightPower: 0.7, highlightStrength: 1.25 };
export const RADIANCE_DEBUG = { enabled: false, redMultiplier: 1, greenMultiplier: 1, blueMultiplier: 1 };
export const DARK_FLOOR = { sdfFadeDistanceScale: 0.75, sdfFadeEdgePx: 0, nearFalloffPower: 4, nearFalloffDistanceScale: 0.046, nearFalloffIntensity: 1.2, nearFalloffMapMin: 2.74, nearFalloffMapMax: 5, middleFalloffPower: 1, middleFalloffIntensity: 0.16, tailIntensity: 0.65, tailMapMin: 0, tailMapMax: 8.85, tailPower: 0.05, nearFalloffEnabled: true, middleFalloffEnabled: false, farFalloffEnabled: true, noiseEnabled: true, radianceJitterPx: 16, vibrancy: 2 };
export const DARK_POST = { contrast: 1.05, exposure: 0.25 };
export const LIGHT_GLOW = { nearDistanceScale: 0.268, nearIntensity: 4, nearMapMin: 0, nearMapMax: 20, nearPower: 8, nearEnabled: true, middleOuterScale: 3.95, middlePower: 3.3, middleIntensity: 1.6, highlightNoise: 0.5, highlightDebug: false, middleEnabled: true, farIntensity: 1.2, farMapMin: 0, farMapMax: 3, farPower: 0.71, farEnabled: true, fadeInner: 41, contrast: 1.06, nearDistanceScaleColor: 0.116, nearIntensityColor: 0.2, nearMapMinColor: 0.36, nearMapMaxColor: 4, nearPowerColor: 1.95, nearEnabledColor: true, middleOuterScaleColor: 3.95, middlePowerColor: 5.3, middleIntensityColor: 0.34, middleEnabledColor: true, farIntensityColor: 0.45, farMapMinColor: 0, farMapMaxColor: 1.25, farPowerColor: 0.22, farEnabledColor: true, fadeInnerColor: 0, contrastColor: 1.58, aoStrength: 0.18, aoRadiusScale: 0.8, aoPower: 4, aoEnabled: true, ao2Strength: 0.15, ao2RadiusScale: 0.14, ao2Power: 1.6, ao2Enabled: true, ao3Strength: 0.21, ao3RadiusScale: 0.18, ao3Power: 3.8, ao3Enabled: true, edgeRedRgb: { r: 0.8667, g: 0.2745, b: 0.302 }, edgeGreenRgb: { r: 0.3294, g: 0.698, b: 0.3255 }, edgeBlueRgb: { r: 0.1804, g: 0.3451, b: 1 }, edgeOverlap: 0.4 };
export const OCCLUDER = { showOccluderTriangle: true };

// Direct raycast pass (module 4077675): half-resolution probes.
export const raycastSize = (sim) => ({ width: Math.max(1, Math.ceil(0.5 * sim.width)), height: Math.max(1, Math.ceil(0.5 * sim.height)) });

// Hovering nav item 0, 1 or 2 lights one edge of the triangle; otherwise the lines run.
const EDGE_FOR_ITEM = [0, 2, 1];
export function heroModeFor(activeItem) {
  if (activeItem === 0 || activeItem === 1 || activeItem === 2) return { mode: MODES.edge, edgeIndex: EDGE_FOR_ITEM[activeItem] };
  return { mode: MODES.lines, edgeIndex: HERO.edgeIndex };
}

export function defaultSettings(activeItem = -1) {
  return {
    tunables: { ...TUNABLES },
    hero: { ...HERO, ...heroModeFor(activeItem) },
    brush: { ...BRUSH },
    probeDiscard: { ...PROBE_DISCARD },
    lightAo: { ...LIGHT_AO },
    lightGlow: { ...LIGHT_GLOW },
    radianceDebug: { ...RADIANCE_DEBUG },
    darkFloor: { ...DARK_FLOOR },
    darkPostprocess: { ...DARK_POST },
    hoverRgbTint: { ...HOVER_RGB },
    occluderTriangle: { ...OCCLUDER },
  };
}

// ---------- camera zoom (each realm keeps its own, set from the canvas height) ----------
let zoom = 1;
let pointerCutoff = 0.2;
export const setZoom = (z) => { zoom = Number.isFinite(z) && z > 0 ? z : 1; };
export const setPointerCutoff = (v) => { pointerCutoff = Number.isFinite(v) && v >= 0 ? v : 0.2; };
export const getPointerCutoff = () => pointerCutoff;
/** Desktop canvases shorter than 560 px keep the triangle's on-screen size. */
export const zoomFor = (base, cssHeight, mobile = false) =>
  mobile || !Number.isFinite(cssHeight) || cssHeight <= 0 ? base : base * Math.min(1, 560 / cssHeight);
/** The simulation is at least 360 px tall. */
export const simScale = (cssHeight) => Math.max(1, 360 / Math.max(1, cssHeight));

// ---------- triangle ----------
export function triangle(size) {
  const height = size.height * TRIANGLE_HEIGHT * zoom;
  const circumradius = (2 * height) / 3;
  const inradius = height / 3;
  const sideLength = (2 * height) / Math.sqrt(3);
  const cx = 0.5 * size.width;
  const cy = 0.5 * size.height;
  return {
    center: { x: cx, y: cy },
    top: { x: cx, y: cy - circumradius },
    left: { x: cx - 0.5 * sideLength, y: cy + inradius },
    right: { x: cx + 0.5 * sideLength, y: cy + inradius },
    height, circumradius, inradius, sideLength,
  };
}
export const ledRadius = (size) => 0.0236 * triangle(size).height;
export function ledShape(size, perSide) {
  const tri = triangle(size);
  const cornerTrim = Math.min(2 * ledRadius(size) * Math.sqrt(3) + 1, 0.45 * triangle(size).sideLength);
  const centerSpacing = Math.max(0, tri.sideLength - 2 * cornerTrim) / Math.max(1, perSide);
  return { normalHalfThickness: 2 * ledRadius(size), tangentHalfLength: Math.max(0, 0.5 * centerSpacing - 0.5), cornerTrim, centerSpacing };
}
function scaleTriangle(tri, s) {
  const c = tri.center;
  const p = (v) => ({ x: c.x + (v.x - c.x) * s, y: c.y + (v.y - c.y) * s });
  return { center: c, top: p(tri.top), left: p(tri.left), right: p(tri.right), height: tri.height * s, circumradius: tri.circumradius * s, inradius: tri.inradius * s, sideLength: tri.sideLength * s };
}
/** The LEDs sit 5 design px inside the triangle's edge. */
function insetScale(tri) {
  const ref = DESIGN_HEIGHT * TRIANGLE_HEIGHT;
  const inset = (5 * Math.min(tri.height, ref)) / ref;
  return tri.inradius > inset ? (tri.inradius - inset) / tri.inradius : 1;
}
export function insetTriangle(size) {
  const tri = triangle(size);
  return scaleTriangle(tri, insetScale(tri));
}
/** Centres and angles of the LEDs, 24 per side, clockwise from the top corner. */
export function ledLayout(size, perSide) {
  const tri = triangle(size);
  const s = insetScale(tri);
  const geometry = scaleTriangle(tri, s);
  const { top, left, right, center } = geometry;
  const scaled = { width: size.width, height: size.height * s };
  const shape = ledShape(scaled, perSide);
  const positions = [];
  for (const [a, b] of [[top, left], [left, right], [right, top]]) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), angle = Math.atan2(dy, dx);
    const trim = len > 0 ? shape.cornerTrim / len : 0;
    const step = len > 0 ? shape.centerSpacing / len : 0;
    for (let i = 0; i < perSide; i++) {
      const u = trim + (i + 0.5) * step;
      positions.push({ x: a.x + dx * u, y: a.y + dy * u, angle });
    }
  }
  return { center, positions, geometry, ledRadius: ledRadius(scaled), ledShape: shape };
}
export const clampProbeDensity = (v, d = 2) => (v === undefined || !Number.isFinite(v) || v <= 0 ? d : Math.min(4, Math.max(0.5, v)));
export function clampCascadeCount(v) {
  if (v !== undefined && Number.isFinite(v) && !(v <= 0)) return Math.min(5, Math.max(1, Math.floor(v)));
}
export function cascadeCountFor(size) {
  const diag = Math.hypot(size.width, size.height);
  for (let k = 0; k < 16; k++) if ((4 ** (k + 1) - 1) / 3 > diag) return Math.min(k + 1, 5);
  return 5;
}
export function cascadeFit(size, density = 2) {
  const w = Math.max(1, Math.round(size.width * density));
  const h = Math.max(1, Math.round(size.height * density));
  return { originX: 0, originY: 0, width: w, height: h, fullWidth: w, fullHeight: h, alignment: 32, areaRatio: 1, originSceneX: 0, originSceneY: 0, widthScene: size.width, heightScene: size.height };
}
export const nonNegative = (v) => (Number.isFinite(v) ? Math.max(0, v) : 0);
