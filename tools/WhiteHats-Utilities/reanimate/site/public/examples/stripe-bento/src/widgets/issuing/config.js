// Scene settings of stripe.com's issuing bento graphic (the "issuing" wave preset).

export const ISSUING_CONFIG = {
  theme: "light",
  postProcessing: { blurAmount: 0.02, grainAmount: 1.2 },
  // Orthographic wave camera. Its rotation is overwritten by lookAt(), kept for completeness.
  camera: {
    position: { x: 100.00000000000001, y: 3.06222926004786e-13, z: 5000 },
    rotation: { x: -6.124458520095719e-17, y: 0.019997333973150535, z: 1.2246467991473532e-18, order: "XYZ" },
    lookAt: { x: 0, y: 0, z: 0 },
    zoom: 1,
  },
  wave: {
    speed: 8e-5,
    timeOffset: 2275,
    colorContrast: 1,
    colorSaturation: 1,
    colorHueShift: -0.00159265358979299,
    displaceFrequencyX: 0.005831,
    displaceFrequencyZ: 0.016001,
    displaceAmount: -7.821,
    position: { x: -200.7, y: -65.4, z: -11.0999999999999 },
    rotation: { x: -2.87559265358979, y: 3.09592653589793, z: -2.9259265358979 },
    scale: { x: 3, y: 3, z: 3 },
    twistFrequencyX: 0.0590000000000002,
    twistFrequencyY: 0.32,
    twistFrequencyZ: -0.397,
    twistPowerX: 3.63,
    twistPowerY: 0.44,
    twistPowerZ: 5.99,
    glowAmount: 3.86,
    glowPower: 0.923,
    glowRamp: 1,
    lineThickness: 0,
    lineAmount: 0,
    lineDerivativePower: 0,
  },
};

// Card planes: the textures are 822x1294, i.e. this aspect, and sit slightly below centre.
export const CARD_ASPECT = 685 / 1078;
export const CARD_OFFSET_Y = -0.062;
export const CARD_SCALE = 1.42; // cardGroup scale, same on hover and at rest
export const CARD_CAMERA = { fov: 30, near: 0.1, far: 1000, z: 3 };

// Pointer tilt: target angle = ±0.15π at the canvas edges, approached by
// current += (target - current) * EASE_PER_MS * dt every rendered frame.
export const TILT_MAX = 0.15 * Math.PI;
export const EASE_PER_MS = 0.004;

// The render loop draws every 2nd animation frame.
export const FRAME_INTERVAL = 2;

const IMG = new URL("../../../assets/img/", import.meta.url).href;
export const TEXTURES = {
  palette: IMG + "issuing-palette.webp", // RepeatWrapping
  cardForeground: IMG + "issuing_card_fg.webp", // ClampToEdgeWrapping
  cardWindow: IMG + "issuing_card_bg.webp", // ClampToEdgeWrapping
  placeholder: IMG + "issuing-card-placeholder.webp", // static fallback, 894x1456
};
