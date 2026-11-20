// Dotted globe with flying arcs and payment labels: port of stripe.com's "GradientNoiseGlobe"
// (three.js r178), default variant as used by the homepage crypto bento card.
//
// Scene: a depth-only sphere hides arcs behind the globe, a translucent gradient sphere gives the
// white-to-blue body, ~18k land dots are point sprites coloured by a screen-space orange → pink →
// blue gradient and faded towards the back, and a faint purple halo sits behind it all. The globe
// is tilted (x -2°, z 8°), starts at 70° yaw and auto-rotates 0.00115 rad per 60 Hz frame
// (1.25x while the Pacific faces the camera). Rendering runs on every 2nd frame of the shared
// render loop, more frames are skipped under performance warnings, and dt is capped at 50 ms.
//
// Arcs: up to 4 "main" arcs between random cities (one end facing the camera), each a gradient
// Line2 that grows after its two ring markers pop in, then a label (wallet icon, amount,
// stablecoin) rides along it, fades out, and the line retreats. Up to 3 thin "simple" arcs with a
// shorter timeline run in parallel. All timings use performance.now(), not frame counts.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { CITIES, TRANSPACIFIC_PAIRS } from "./cities.js";
import { DragController } from "./drag.js";
import { ease } from "./easing.js";
import { isCoarsePointer, precomputeDots } from "./dots-precompute.js";
import { RenderLoop } from "./render-loop.js";
import * as SHADERS from "./shaders.js";
import { STABLECOINS, WALLETS } from "./wallets.js";

const { clamp, lerp, degToRad, randInt, smoothstep } = THREE.MathUtils;

const GLOBE = {
  DOT_COUNT_MAX_DESKTOP: 60000,
  DOT_COUNT_MAX_MOBILE: 30000,
  DOT_SIZE_DESKTOP: 12,
  DOT_SIZE_MOBILE: 14,
  CAMERA_Z_DESKTOP: 11.7,
  CAMERA_Z_MOBILE: 11.3,
  DOT_GRADIENT_STOP_COUNT: 3,
  ARC_UI_MIN_OFFSET: 0.01,
  ARC_UI_MAX_OFFSET: 0.25,
  ARC_UI_HIDE_DOT_THRESHOLD: -0.5,
  ARC_UI_MIN_SCALE: 0.75,
  ARC_UI_MAX_SCALE: 1,
  MARKER_TANGENT_OFFSET: 0.02,
};

/** Main arc timeline (ms). Line duration scales with distance; label travel too. */
const ARC_TIMING = {
  markerA: { durationMs: 600, easing: "easeOutCubic" },
  markerB: { durationMs: 550, easing: "easeOutCubic" },
  line: { durationMs: 2800, easing: "easeOutCubic" },
  uiIntro: { durationMs: 800, easing: "easeOutCubic" },
  uiTravel: { durationMs: 5000, easing: "easeInOutCubic", distanceScale: { factor: 0.12, min: 0.6, max: 1.2 } },
  uiOutro: { durationMs: 600, easing: "easeInCubic" },
  lineRetreat: { durationMs: 2200, easing: "easeInOutCubic" },
  markerFade: { durationMs: 600, easing: "easeOutCubic" },
  lineDistanceScale: { baseDurationMs: 2800, referenceKm: 8000, min: 1800, max: 4500 },
};

/** Simple (label-less) arc timeline (ms). */
const SIMPLE_ARC_TIMING = {
  markerA: { durationMs: 300, easing: "easeOutCubic" },
  markerB: { durationMs: 250, easing: "easeOutCubic" },
  line: { durationMs: 1200, easing: "easeOutCubic" },
  lineRetreat: { durationMs: 800, easing: "easeInOutCubic" },
  markerFade: { durationMs: 400, easing: "easeOutCubic" },
};

const ARC_SPAWN = {
  ENABLED: true,
  MAX_ACTIVE_ARCS: 4,
  MIN_SPAWN_INTERVAL_MS: 1500,
  MAX_SPAWN_INTERVAL_MS: 4000,
  CITY_MIN_DISTANCE_KM: 2000,
  MIN_UI_SCREEN_DISTANCE: 80,
  MAX_SPAWN_DISTANCE_ATTEMPTS: 5,
};

// ---------------------------------------------------------------------------------------------
// Renderer with stripe.com's capability gate: WebGL2 with vertex textures, 4096 textures, 256
// uniforms and a few extensions, and no "major performance caveat" (software rendering).
const REQUIRED_EXTENSIONS = [
  "EXT_color_buffer_float",
  "EXT_texture_filter_anisotropic",
  "WEBGL_debug_renderer_info",
  "WEBGL_debug_shaders",
];

export function createRenderer(params) {
  let renderer;
  let hasMajorPerformanceCaveat = false;
  try {
    renderer = new THREE.WebGLRenderer({ ...params, failIfMajorPerformanceCaveat: true });
  } catch {
    hasMajorPerformanceCaveat = true;
  }
  if (!renderer) {
    try {
      renderer = new THREE.WebGLRenderer({ ...params, failIfMajorPerformanceCaveat: false });
    } catch {}
  }
  let hasRequiredCapabilities = false;
  if (renderer) {
    const { capabilities, extensions } = renderer;
    hasRequiredCapabilities =
      capabilities.isWebGL2 &&
      capabilities.vertexTextures &&
      capabilities.maxTextureSize >= 4096 &&
      capabilities.maxVertexUniforms >= 256 &&
      capabilities.maxFragmentUniforms >= 256 &&
      REQUIRED_EXTENSIONS.every((name) => extensions.get(name) !== null);
  }
  return { renderer, hasMajorPerformanceCaveat, hasRequiredCapabilities };
}

// ---------------------------------------------------------------------------------------------
// Arc lines are LineSegments2 with one instance per segment; this clips them to a progress range
// [start, end] in the fragment shader so they can grow and retreat without new geometry.
function addVisibleRangeClip(material) {
  material.userData.visibleRange = new THREE.Vector2(0, 0);
  material.userData.totalSegments = 1;
  material.onBeforeCompile = (shader) => {
    const range = material.userData.visibleRange || new THREE.Vector2(0, 1);
    const total = material.userData.totalSegments || 1;
    shader.uniforms.u_visibleRange = { value: range };
    shader.uniforms.u_totalSegments = { value: total };
    material.userData.shader = shader;
    material.userData.u_totalSegmentsUniform = shader.uniforms.u_totalSegments;
    shader.vertexShader = `
      uniform vec2 u_visibleRange;
      uniform float u_totalSegments;
      varying float v_instanceProgress;
      ${shader.vertexShader}
    `;
    const main = "void main() {";
    shader.vertexShader = shader.vertexShader.replace(
      main,
      `
      ${main}
        float instanceProg = float(gl_InstanceID) / max(u_totalSegments, 1.0);
        v_instanceProgress = instanceProg;
      `,
    );
    shader.fragmentShader = `
      varying float v_instanceProgress;
      uniform vec2 u_visibleRange;
      ${shader.fragmentShader}
    `;
    shader.fragmentShader = shader.fragmentShader.replace(
      main,
      `
      ${main}
        if (v_instanceProgress < u_visibleRange.x || v_instanceProgress > u_visibleRange.y) {
          discard;
        }
      `,
    );
  };
}

function setTotalSegments(material, count) {
  material.userData.totalSegments = count;
  if (material.userData.u_totalSegmentsUniform) material.userData.u_totalSegmentsUniform.value = count;
  if (material.userData.shader?.uniforms?.u_totalSegments) material.userData.shader.uniforms.u_totalSegments.value = count;
}

/** Ring marker: 25 % halo disc, solid ring, white centre. */
function createMarkerTexture(color) {
  const scale = Math.min(Math.ceil(window.devicePixelRatio || 1), 2);
  const c = new THREE.Color(color);
  const rgba = (alpha) => `rgba(${Math.floor(255 * c.r)},${Math.floor(255 * c.g)},${Math.floor(255 * c.b)},${alpha})`;
  const canvas = document.createElement("canvas");
  canvas.width = 128 * scale;
  canvas.height = 128 * scale;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = rgba(0.25);
  ctx.beginPath();
  ctx.arc(64, 64, 64, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = rgba(1);
  ctx.beginPath();
  ctx.arc(64, 64, 38.4, 0, 2 * Math.PI);
  ctx.arc(64, 64, 25.6, 0, 2 * Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,1.0)";
  ctx.beginPath();
  ctx.arc(64, 64, 25.6, 0, 2 * Math.PI);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function cityDistanceKm(a, b) {
  const lat1 = degToRad(a.lat);
  const lon1 = degToRad(a.lon);
  const lat2 = degToRad(b.lat);
  const lon2 = degToRad(b.lon);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 6371;
}

const findCity = (name) => CITIES.find((c) => c.name.toLowerCase() === name.toLowerCase()) ?? null;

let svgIdCounter = 0;

// ---------------------------------------------------------------------------------------------
export class Globe {
  constructor(canvas, { imageUrl, uiPool, dragRotate, autoRotate, hoverBoost }) {
    this.radius = 2;
    this.globePosition = new THREE.Vector3(0, 0, 0);
    this.globeRotationMatrix = new THREE.Matrix3();
    this.dotsStartTime = 0;
    this.activeArcs = [];
    this.activeSimpleArcs = [];

    // Main arcs: orange → pink, purple → pink, orange → purple.
    this.arcColorPalettes = [
      { start: 0xff8c57, end: 0xfd3ae6 },
      { start: 0x705bff, end: 0xfd3ae6 },
      { start: 0xff8c57, end: 0x705bff },
    ];
    // Simple arcs: light blue, light orange, light purple.
    this.simpleArcColorPalettes = [
      { start: 0x80d4ff, end: 0x4da6ff },
      { start: 0xffd480, end: 0xffa64d },
      { start: 0xd4a6ff, end: 0xa64dff },
    ];
    this.arcControllerEnabled = ARC_SPAWN.ENABLED;
    this.arcControllerMaxActive = ARC_SPAWN.MAX_ACTIVE_ARCS;
    this.arcPeakMinHeight = 0.1;
    this.arcPeakMaxHeight = 0.275;
    this.arcPeakAnglePower = 1.2;
    this.arcSpawnIntervalMin = ARC_SPAWN.MIN_SPAWN_INTERVAL_MS;
    this.arcSpawnIntervalMax = ARC_SPAWN.MAX_SPAWN_INTERVAL_MS;
    this.arcCityMinDistanceKm = ARC_SPAWN.CITY_MIN_DISTANCE_KM;
    this.arcMinUIScreenDistance = ARC_SPAWN.MIN_UI_SCREEN_DISTANCE;
    this.arcMaxSpawnDistanceAttempts = ARC_SPAWN.MAX_SPAWN_DISTANCE_ATTEMPTS;
    this.arcVisibleCityDotThreshold = 0.25;
    this.arcRightEdgeExclusionRatio = 0.3;
    this.arcPreferTranspacific = true;
    this.arcPacificWestBoundary = -170;
    this.arcPacificEastBoundary = 55;
    this.arcPacificSpeedWestBoundary = -165;
    this.arcPacificSpeedEastBoundary = 50;
    this.arcPacificSpeedMultiplier = 1.25;
    this.arcControllerNextSpawnTime = 0;
    this.lastArcPairKey = null;

    this.simpleArcControllerEnabled = true;
    this.simpleArcMaxActive = 3;
    this.simpleArcSpawnIntervalMin = 800;
    this.simpleArcSpawnIntervalMax = 2000;
    this.simpleArcMaxDistanceKm = 8000;
    this.simpleArcMinDistanceKm = 500;
    this.simpleArcControllerNextSpawnTime = 0;
    this.lastSimpleArcPairKey = null;

    // Dots: gradient #ff7c3f (top) → #fd3ae6 → #533afd (bottom) at 225°.
    this.dotSize = 12;
    this.dotColorTop = new THREE.Color(0xff7c3f);
    this.dotColorMid = new THREE.Color(0xfd3ae6);
    this.dotColorBottom = new THREE.Color(0x533afd);
    this.dotGradientStopTop = 0.024;
    this.dotGradientStopMid = 0.3794;
    this.dotGradientStopBottom = 0.7941;
    this.dotGradientAngle = 225;
    this.dotGradientWidth = 1;
    this.dotGradientHeight = 1;
    this.dotOpacity = 0.6;
    this.dotDepthFadeEnabled = true;
    this.dotDepthFadeFront = 0.25;
    this.dotDepthFadeBack = -0.1;
    this.dotDepthFadeMinOpacity = 0.15;
    this.dotDepthFadeCurve = 2;

    // Globe body: white → #005eff gradient at 20 % opacity, lilac fresnel rim.
    this.globeGradientColorA = new THREE.Color(0xffffff);
    this.globeGradientColorB = new THREE.Color(0x005eff);
    this.globeGradientClockAngle = 215;
    this.globeGradientDepth = -0.1;
    this.globeGradientContrast = 2;
    this.globeGradientOffset = -0.4;
    this.globeOpacity = 0.2;
    this.globeFresnelColor = new THREE.Color(0xc7b6ea);
    this.globeFresnelStrength = 0.1;
    this.globeFresnelPower = 0.3;

    this.atmosphereColor = new THREE.Color("#a953ff");
    this.atmosphereIntensity = 0.08;
    this.atmosphereOpacity = 0.35;
    this.atmosphereFalloff = 0.4;
    this.atmosphereRadius = 1.02;

    // Corona: a share of dots periodically lifts off; hover multiplies share and distance by 1.33.
    this.dotCoronaParticipation = 0.2;
    this.dotCoronaDistance = 0.6;
    this.dotCoronaLaunchRate = 0.15;
    this.dotCoronaTravelSpeed = 0.35;
    this.dotCoronaOpacityDrop = 0.5;
    this.dotCoronaNoiseStrength = 0.42;
    this.dotCoronaNoiseScale = 0.75;
    this.isHovered = false;
    this.hoverMultiplier = 1;
    this.hoverBoostAmount = hoverBoost ?? 1.33;
    this.hoverAttackSpeed = 0.1;
    this.hoverDecaySpeed = 0.04;

    this.renderLoop = null;
    this._paused = false;
    this.pauseStartTime = null;
    this.initialized = false;
    this.loaded = false;
    this.onLoadCallback = null;
    this.firstFrameCallbacks = [];
    this.precomputedDots = null;
    this.lastRender = null;

    this.autoRotate = autoRotate !== false;
    this.rotationSpeedX = 0;
    this.rotationSpeedY = 0.00115;
    this.currentRotationSpeedX = 0;
    this.currentRotationSpeedY = this.autoRotate ? 0.00115 : 0;
    this.rotationSpeedZ = 0;
    this.isCoasting = false;
    this.globeAxisTiltX = -2;
    this.globeAxisTiltZ = 8;
    this.globeInitialRotationY = 70;
    this.dragRotate = dragRotate;

    this.markerTextureCache = {};
    this.markerGeometry = new THREE.PlaneGeometry(0.4, 0.4);
    this.cachedWidth = 0;
    this.cachedHeight = 0;
    this.ARC_LINE_POOL_SIZE = 10;
    this.ARC_MAX_SEGMENTS = 256;
    this.SIMPLE_ARC_LINE_POOL_SIZE = 6;
    this.SIMPLE_ARC_MAX_SEGMENTS = 64;
    this.MARKER_POOL_SIZE = 20;
    this.arcLinePool = [];
    this.simpleArcLinePool = [];
    this.markerPool = [];
    this.arcPointsPool = [];
    this.simpleArcPointsPool = [];
    this.candidateCityIndices = CITIES.map((_, i) => i);
    this.cityVectors = [];

    if (new URLSearchParams(window.location.search).has("__disableWebGL")) {
      throw new Error("WebGL disabled by query param");
    }
    const { renderer, hasMajorPerformanceCaveat, hasRequiredCapabilities } = createRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    if (!renderer || !hasRequiredCapabilities || hasMajorPerformanceCaveat) {
      renderer?.dispose();
      throw new Error("WebGL disabled based on capabilities check");
    }
    this.dpr = Math.min(window.devicePixelRatio, 2);
    this.renderer = renderer;
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setPixelRatio(this.dpr);
    this.canvas = canvas;
    this.uiPool = [...uiPool];
    this.dotSize = isCoarsePointer() ? GLOBE.DOT_SIZE_MOBILE : GLOBE.DOT_SIZE_DESKTOP;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(25, 1, 0.1, 1000);
    this.dotsPrecomputePromise = precomputeDots(imageUrl).then((dots) => (this.precomputedDots = dots));
  }

  get isDragging() {
    return this.drag?.isDragging ?? false;
  }

  // -------------------------------------------------------------------------------- scene setup
  initScene() {
    if (this.initialized) return;
    this.initialized = true;
    const width = this.cachedWidth || this.canvas.clientWidth;
    const height = this.cachedHeight || this.canvas.clientHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height || 1;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(0, 0, isCoarsePointer() ? GLOBE.CAMERA_Z_MOBILE : GLOBE.CAMERA_Z_DESKTOP);
    this.camera.lookAt(0, 0, 0);
    this.createGlobe();

    // Render every `skip`-th loop frame (2 by default, more under performance warnings);
    // the arc/label state machine runs every frame.
    let frame = 0;
    let skip = 2;
    this.renderLoop = new RenderLoop(() => {
      if (frame % skip === 0) this.animate();
      this.updateUI();
      frame += 1;
    });
    this.renderLoop.onPerformanceWarning = (level) => {
      skip = Math.max(level + 1, skip);
    };
    this.renderLoop.onPerformanceRecovered = (level) => {
      skip = Math.max(level + 1, 2);
    };
    this.renderLoop.start();
  }

  createGlobe() {
    this.globeGroup = new THREE.Group();
    this.globeGroup.position.copy(this.globePosition);
    this.globeGroup.rotation.x = degToRad(this.globeAxisTiltX);
    this.globeGroup.rotation.y = degToRad(this.globeInitialRotationY);
    this.globeGroup.rotation.z = degToRad(this.globeAxisTiltZ);
    this.drag = new DragController(this.canvas, this.globeGroup, {
      axis: this.dragRotate,
      homeTiltX: degToRad(this.globeAxisTiltX),
      onRelease: (speeds) => this.applyDragRelease(speeds),
    });
    this.scene.add(this.globeGroup);

    // Depth-only occluder so arcs and markers behind the globe are hidden.
    this.backgroundSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.993 * this.radius, 64, 64),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.FrontSide, depthWrite: true, colorWrite: false }),
    );
    this.backgroundSphere.renderOrder = -1;
    this.globeGroup.add(this.backgroundSphere);

    const haloSize = 6 * this.radius;
    this.atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_color: { value: this.atmosphereColor.clone() },
        u_intensity: { value: this.atmosphereIntensity },
        u_opacity: { value: this.atmosphereOpacity },
        u_innerRadius: { value: this.radius },
        u_outerRadius: { value: this.radius * this.atmosphereRadius },
        u_outerFade: { value: Math.max(0.01, this.atmosphereFalloff) * this.radius },
      },
      vertexShader: SHADERS.ATMOSPHERE_VERTEX,
      fragmentShader: SHADERS.ATMOSPHERE_FRAGMENT,
      blending: THREE.NormalBlending,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    });
    this.atmosphereMesh = new THREE.Mesh(new THREE.PlaneGeometry(haloSize, haloSize, 1, 1), this.atmosphereMaterial);
    this.atmosphereMesh.frustumCulled = false;
    this.atmosphereMesh.renderOrder = -4;
    this.scene.add(this.atmosphereMesh);

    this.globeSurfaceMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_colorA: { value: this.globeGradientColorA.clone() },
        u_colorB: { value: this.globeGradientColorB.clone() },
        u_fresnelColor: { value: this.globeFresnelColor.clone() },
        u_fresnelStrength: { value: this.globeFresnelStrength },
        u_fresnelPower: { value: this.globeFresnelPower },
        u_opacity: { value: this.globeOpacity },
        u_gradientDir: { value: new THREE.Vector3(1, 0, 0) },
        u_gradientContrast: { value: this.globeGradientContrast },
        u_gradientOffset: { value: this.globeGradientOffset },
        u_cameraPosition: { value: this.camera.position.clone() },
        u_cameraRight: { value: new THREE.Vector3(1, 0, 0) },
        u_cameraUp: { value: new THREE.Vector3(0, 1, 0) },
        u_cameraForward: { value: new THREE.Vector3(0, 0, -1) },
      },
      vertexShader: SHADERS.SURFACE_VERTEX,
      fragmentShader: SHADERS.SURFACE_FRAGMENT,
      transparent: true,
      depthWrite: true,
      depthTest: true,
    });
    this.globeSurface = new THREE.Mesh(new THREE.SphereGeometry(0.9995 * this.radius, 128, 128), this.globeSurfaceMaterial);
    this.globeSurface.renderOrder = -0.5;
    this.globeGroup.add(this.globeSurface);
    this.updateGlobeSurfaceUniforms();
    this.updateCameraBasisUniforms();
    this.updateAtmosphereMaterial();

    // Arcs and dots live in a group turned 180° about Y relative to the globe body.
    this.arcsGroup = new THREE.Group();
    this.arcsGroup.rotation.x = -Math.PI;
    this.arcsGroup.rotation.z = -Math.PI;
    this.globeGroup.add(this.arcsGroup);
    this.dotsGroup = new THREE.Group();
    this.dotsGroup.rotation.x = -Math.PI;
    this.dotsGroup.rotation.z = -Math.PI;
    this.globeGroup.add(this.dotsGroup);

    this.loadDots();
    this.cityVectors = CITIES.map((c) => new THREE.Vector3(c.ux, c.uy, c.uz).multiplyScalar(this.radius));
    this.globeGroup.updateMatrixWorld(true);
    this.globeRotationMatrix.setFromMatrix4(this.globeGroup.matrixWorld).transpose();
  }

  loadDots() {
    const apply = (dots) => {
      this.applyDotsToScene(dots);
      this.loaded = true;
      if (this.onLoadCallback) {
        this.onLoadCallback();
        this.onLoadCallback = null;
      }
      // Draw the first frame right away. stripe.com does this because the globe is still paused when
      // its (pre-computed) dots arrive; here the dots can arrive after the globe is unpaused.
      if (this.paused || !this.lastFrameRendered) this.updateAndRender(0);
    };
    if (this.precomputedDots) apply(this.precomputedDots);
    else this.dotsPrecomputePromise.then(apply);
  }

  applyDotsToScene(dots) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(dots.positions, 3));
    geometry.setAttribute("rndId", new THREE.BufferAttribute(dots.rndIds, 1));
    geometry.setAttribute("sizeVariation", new THREE.BufferAttribute(dots.sizeVariations, 1));
    geometry.setAttribute("opacityVariation", new THREE.BufferAttribute(dots.opacityVariations, 1));
    geometry.setAttribute("coronaSeed", new THREE.BufferAttribute(dots.coronaSeeds, 1));
    geometry.setAttribute("varianceRate", new THREE.BufferAttribute(dots.varianceRates, 1));
    geometry.setAttribute("varianceMotion", new THREE.BufferAttribute(dots.varianceMotions, 1));
    geometry.setAttribute("coronaCanParticipate", new THREE.BufferAttribute(dots.coronaCanParticipate, 1));

    const travelSpeed = Math.max(0.1, this.dotCoronaTravelSpeed);
    const launchInterval = Math.max(0.45, 1 / Math.max(this.dotCoronaLaunchRate, 0.001));
    this.dotsMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        u_timeSec: { value: 0 },
        u_radius: { value: this.radius },
        u_dotSize: { value: 0.01 * this.dotSize },
        u_opacity_factor: { value: this.dotOpacity },
        u_coronaBurstDistance: { value: this.dotCoronaDistance },
        u_coronaParticipation: { value: this.dotCoronaParticipation },
        u_coronaOpacityDrop: { value: this.dotCoronaOpacityDrop },
        u_coronaNoiseStrength: { value: this.dotCoronaNoiseStrength },
        u_coronaNoiseScale: { value: this.dotCoronaNoiseScale },
        u_coronaBaseFlightDur: { value: Math.min(20, Math.max(0.3, 3.1 / travelSpeed)) },
        u_coronaBaseFadeDur: { value: Math.min(20, Math.max(0.05, 0.6 / travelSpeed)) },
        u_coronaLaunchInterval: { value: launchInterval },
        u_canvasHeight: { value: this.cachedHeight || this.canvas.clientHeight },
        u_pixelRatio: { value: this.dpr },
        u_depthFadeEnabled: { value: this.dotDepthFadeEnabled ? 1 : 0 },
        u_depthFadeFront: { value: this.dotDepthFadeFront },
        u_depthFadeBack: { value: this.dotDepthFadeBack },
        u_depthFadeMin: { value: this.dotDepthFadeMinOpacity },
        u_depthFadeCurve: { value: this.dotDepthFadeCurve },
        u_gradientAngle: { value: this.dotGradientAngle },
        u_gradientScale: {
          value: new THREE.Vector2(Math.max(0.05, this.dotGradientWidth), Math.max(0.05, this.dotGradientHeight)),
        },
        u_cameraRight: { value: new THREE.Vector3(1, 0, 0) },
        u_cameraUp: { value: new THREE.Vector3(0, 1, 0) },
        u_cameraForward: { value: new THREE.Vector3(0, 0, -1) },
        u_cameraPosition: { value: new THREE.Vector3() },
        u_gradientStops: { value: new Float32Array(GLOBE.DOT_GRADIENT_STOP_COUNT) },
        u_gradientColors: {
          value: Array.from({ length: GLOBE.DOT_GRADIENT_STOP_COUNT }, () => new THREE.Color(0xffffff)),
        },
      },
      vertexShader: SHADERS.DOTS_VERTEX,
      fragmentShader: SHADERS.DOTS_FRAGMENT,
    });
    this.updateDotGradientUniforms();
    this.updateDotDepthFadeUniforms();
    this.dotsGroup.add(new THREE.Points(geometry, this.dotsMaterial));
    this.dotsStartTime = performance.now();
  }

  updateGlobeSurfaceUniforms() {
    const u = this.globeSurfaceMaterial.uniforms;
    u.u_colorA.value.copy(this.globeGradientColorA);
    u.u_colorB.value.copy(this.globeGradientColorB);
    u.u_fresnelColor.value.copy(this.globeFresnelColor);
    u.u_fresnelStrength.value = this.globeFresnelStrength;
    u.u_fresnelPower.value = this.globeFresnelPower;
    u.u_opacity.value = this.globeOpacity;
    u.u_gradientContrast.value = this.globeGradientContrast;
    u.u_gradientOffset.value = this.globeGradientOffset;
    u.u_cameraPosition.value.copy(this.camera.position);
    u.u_gradientDir.value.copy(this.getGradientDirectionCamera());
    this.globeSurfaceMaterial.needsUpdate = true;
  }

  /** Gradient direction in camera space: a clock angle in the screen plane, pushed towards the viewer. */
  getGradientDirectionCamera() {
    const angle = degToRad(this.globeGradientClockAngle);
    const depth = clamp(this.globeGradientDepth, -1, 1);
    return new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0)
      .multiplyScalar(1 - Math.abs(depth))
      .add(new THREE.Vector3(0, 0, -depth))
      .normalize();
  }

  updateAtmosphereMaterial() {
    const u = this.atmosphereMaterial.uniforms;
    u.u_color.value.copy(this.atmosphereColor);
    u.u_intensity.value = this.atmosphereIntensity;
    u.u_opacity.value = this.atmosphereOpacity;
    u.u_innerRadius.value = this.radius;
    u.u_outerRadius.value = this.radius * this.atmosphereRadius;
    u.u_outerFade.value = Math.max(0.01, this.atmosphereFalloff) * this.radius;
    this.atmosphereMesh.position.copy(this.globeGroup.position);
    this.atmosphereMaterial.needsUpdate = true;
  }

  updateDotDepthFadeUniforms() {
    const u = this.dotsMaterial.uniforms;
    u.u_depthFadeEnabled.value = this.dotDepthFadeEnabled ? 1 : 0;
    u.u_depthFadeFront.value = this.dotDepthFadeFront;
    u.u_depthFadeBack.value = this.dotDepthFadeBack;
    u.u_depthFadeMin.value = this.dotDepthFadeMinOpacity;
    u.u_depthFadeCurve.value = Math.max(0.01, this.dotDepthFadeCurve);
  }

  updateDotGradientUniforms() {
    const u = this.dotsMaterial.uniforms;
    u.u_gradientStops.value[0] = clamp(this.dotGradientStopTop, 0, 1);
    u.u_gradientStops.value[1] = clamp(this.dotGradientStopMid, 0, 1);
    u.u_gradientStops.value[2] = clamp(this.dotGradientStopBottom, 0, 1);
    u.u_gradientColors.value[0].copy(this.dotColorTop);
    u.u_gradientColors.value[1].copy(this.dotColorMid);
    u.u_gradientColors.value[2].copy(this.dotColorBottom);
    u.u_gradientAngle.value = this.dotGradientAngle;
    u.u_gradientScale.value.set(Math.max(0.05, this.dotGradientWidth), Math.max(0.05, this.dotGradientHeight));
  }

  updateCameraBasisUniforms() {
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    const forward = new THREE.Vector3();
    this.camera.matrixWorld.extractBasis(right, up, forward);
    forward.negate();
    if (this.dotsMaterial) {
      this.dotsMaterial.uniforms.u_cameraRight.value.copy(right);
      this.dotsMaterial.uniforms.u_cameraUp.value.copy(up);
      this.dotsMaterial.uniforms.u_cameraForward.value.copy(forward);
    }
    const u = this.globeSurfaceMaterial.uniforms;
    u.u_cameraRight.value.copy(right);
    u.u_cameraUp.value.copy(up);
    u.u_cameraForward.value.copy(forward);
  }

  // -------------------------------------------------------------------------------- frame loop
  animate() {
    if (this._paused || !this.loaded) return;
    const now = performance.now();
    if (this.lastRender === null) this.lastRender = now;
    const dt = Math.min((now - this.lastRender) / 1000, 0.05);
    this.lastRender = now;
    this.updateAndRender(dt);
  }

  updateUI() {
    if (this._paused || !this.loaded) return;
    const now = performance.now();
    this.updateArcsConsolidated(now);
    this.updateSimpleArcsConsolidated(now);
    this.updateArcController(now);
    this.updateSimpleArcController(now);
  }

  updateAndRender(dt) {
    this.updateCameraBasisUniforms();
    this.globeSurfaceMaterial.uniforms.u_cameraPosition.value.copy(this.camera.position);
    this.globeSurfaceMaterial.uniforms.u_gradientDir.value.copy(this.getGradientDirectionCamera());
    this.atmosphereMesh.quaternion.copy(this.camera.quaternion);
    this.atmosphereMesh.position.copy(this.globeGroup.position);

    // Hover (or drag) eases the corona boost in at 10 % per rendered frame and out at 4 %.
    const boosted = this.isHovered || this.isDragging;
    const targetMultiplier = boosted ? this.hoverBoostAmount : 1;
    if (Math.abs(this.hoverMultiplier - targetMultiplier) >= 0.001) {
      const rate = boosted ? this.hoverAttackSpeed : this.hoverDecaySpeed;
      this.hoverMultiplier = clamp(lerp(this.hoverMultiplier, targetMultiplier, rate), 1, this.hoverBoostAmount);
      if (this.dotsMaterial) {
        const u = this.dotsMaterial.uniforms;
        u.u_coronaBurstDistance.value = this.dotCoronaDistance * this.hoverMultiplier;
        u.u_coronaParticipation.value = Math.min(1, this.dotCoronaParticipation * this.hoverMultiplier);
      }
    }

    const seconds = (performance.now() - this.dotsStartTime) * 0.001;
    if (this.dotsMaterial) {
      this.dotsMaterial.uniforms.u_timeSec.value = seconds + 100;
      this.dotsMaterial.uniforms.u_cameraPosition.value.copy(this.camera.position);
    }

    if (!this.isDragging && this.globeGroup) {
      if (this.dragRotate) {
        const targetY = this.getAutoRotateTargetY();
        const k = 1 - Math.exp(-10 * dt);
        this.currentRotationSpeedY = lerp(this.currentRotationSpeedY, targetY, k);
        this.currentRotationSpeedX = lerp(this.currentRotationSpeedX, this.rotationSpeedX, k);
        if (!this.drag?.isSettling) this.globeGroup.rotation.x += this.currentRotationSpeedX * dt * 60;
        this.globeGroup.rotation.y += this.currentRotationSpeedY * dt * 60;
        this.globeGroup.rotation.z += this.rotationSpeedZ * dt * 60;
        if (
          this.isCoasting &&
          !this.drag?.isSettling &&
          Math.abs(this.currentRotationSpeedX - this.rotationSpeedX) < 5e-5 &&
          Math.abs(this.currentRotationSpeedY - targetY) < 5e-5
        ) {
          this.currentRotationSpeedX = this.rotationSpeedX;
          this.currentRotationSpeedY = targetY;
          this.isCoasting = false;
        }
      } else if (this.autoRotate) {
        const targetY = this.isPacificForSpeedAcceleration()
          ? this.rotationSpeedY * this.arcPacificSpeedMultiplier
          : this.rotationSpeedY;
        this.currentRotationSpeedY = lerp(this.currentRotationSpeedY, targetY, 0.01);
        this.globeGroup.rotation.x += this.rotationSpeedX * dt * 60;
        this.globeGroup.rotation.y += this.currentRotationSpeedY * dt * 60;
        this.globeGroup.rotation.z += this.rotationSpeedZ * dt * 60;
      }
    }

    this.drag?.update(dt);
    this.globeGroup.updateMatrixWorld(true);
    this.arcsGroup.updateMatrixWorld(true);
    this.globeRotationMatrix.setFromMatrix4(this.globeGroup.matrixWorld).transpose();
    this.renderer.render(this.scene, this.camera);
    if (this.loaded) this.lastFrameRendered = true;
    if (this.loaded && this.firstFrameCallbacks.length) {
      const callbacks = this.firstFrameCallbacks;
      this.firstFrameCallbacks = [];
      callbacks.forEach((cb) => cb());
    }
  }

  // -------------------------------------------------------------------------------- pause / API
  shiftTimestamps(ms) {
    this.dotsStartTime += ms;
    for (const arc of this.activeArcs) {
      arc.animation.startTime += ms;
      arc.uiStartTime += ms;
      arc.finalizeStartTime += ms;
    }
    for (const arc of this.activeSimpleArcs) {
      arc.animation.startTime += ms;
      arc.finalizeStartTime += ms;
    }
    if (this.arcControllerNextSpawnTime > 0) this.arcControllerNextSpawnTime += ms;
    if (this.simpleArcControllerNextSpawnTime > 0) this.simpleArcControllerNextSpawnTime += ms;
  }

  get paused() {
    return this._paused;
  }

  /** Pausing freezes every timeline; resuming shifts them by the paused time. */
  set paused(value) {
    if (value === this._paused) return;
    if (value) {
      this.pauseStartTime = performance.now();
      this.lastRender = null;
    } else if (this.pauseStartTime !== null) {
      this.shiftTimestamps(performance.now() - this.pauseStartTime);
      this.pauseStartTime = null;
    }
    this._paused = value;
  }

  setHovered(value) {
    this.isHovered = value;
  }

  setDragRotate(axis) {
    this.dragRotate = axis;
    this.drag?.setAxis(axis);
  }

  setPosition({ x, y, z }) {
    if (x !== undefined) this.globePosition.x = x;
    if (y !== undefined) this.globePosition.y = y;
    if (z !== undefined) this.globePosition.z = z;
    if (this.globeGroup) {
      this.globeGroup.position.copy(this.globePosition);
      this.atmosphereMesh?.position.copy(this.globeGroup.position);
    }
  }

  applyDragRelease({ speedY }) {
    const tilts = this.dragRotate === "x" || this.dragRotate === "both";
    if (this.dragRotate === "y" || this.dragRotate === "both") {
      this.currentRotationSpeedY = Math.abs(speedY) > 5e-5 ? speedY : this.getAutoRotateTargetY();
    }
    if (tilts) this.currentRotationSpeedX = this.rotationSpeedX;
    this.isCoasting =
      Math.abs(this.currentRotationSpeedX - this.rotationSpeedX) > 5e-5 ||
      Math.abs(this.currentRotationSpeedY - this.getAutoRotateTargetY()) > 5e-5;
  }

  getAutoRotateTargetY() {
    if (!this.autoRotate) return 0;
    return this.isPacificForSpeedAcceleration() ? this.rotationSpeedY * this.arcPacificSpeedMultiplier : this.rotationSpeedY;
  }

  onLoad(callback) {
    if (this.loaded) callback();
    else this.onLoadCallback = callback;
  }

  /** Called once the dots are in and a frame with them has been rendered. */
  onFirstFrame(callback) {
    if (this.loaded && this.lastFrameRendered) callback();
    else this.firstFrameCallbacks.push(callback);
  }

  setSize(width, height) {
    this.cachedWidth = width;
    this.cachedHeight = height;
    this.resize();
  }

  resize() {
    const width = this.cachedWidth;
    const height = this.cachedHeight;
    if (!width || !height) return;
    this.dpr = Math.min(window.devicePixelRatio, 2);
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(this.dpr);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.dotsMaterial) {
      this.dotsMaterial.uniforms.u_canvasHeight.value = height;
      this.dotsMaterial.uniforms.u_pixelRatio.value = this.dpr;
    }
    this.arcsGroup?.children.forEach((child) => {
      const material = child.material;
      if (material?.isLineMaterial && material.resolution) material.resolution.set(width, height);
    });
  }

  dispose() {
    this.drag?.dispose();
    this.renderLoop?.stop();
    this.renderLoop = null;
    for (const arc of [...this.activeArcs, ...this.activeSimpleArcs]) this.disposeArcResources(arc);
    this.activeArcs = [];
    this.activeSimpleArcs = [];
    this.scene.traverse((object) => {
      object.geometry?.dispose?.();
      object.material?.dispose?.();
    });
    Object.values(this.markerTextureCache).forEach((texture) => texture.dispose());
    this.markerTextureCache = {};
    this.markerGeometry.dispose();
    this.renderer.dispose();
  }

  // -------------------------------------------------------------------------------- pools
  createArcLinePool(size, maxSegments, linewidth) {
    const pool = [];
    for (let i = 0; i < size; i += 1) {
      const geometry = new LineGeometry();
      const vertexCount = maxSegments + 1;
      geometry.setPositions(new Float32Array(3 * vertexCount));
      geometry.setColors(new Float32Array(3 * vertexCount));
      const material = new LineMaterial({ transparent: true, depthTest: true, depthWrite: true, linewidth, vertexColors: true });
      material.resolution.set(this.cachedWidth || this.canvas.clientWidth, this.cachedHeight || this.canvas.clientHeight);
      material.worldUnits = true;
      material.opacity = 0;
      addVisibleRangeClip(material);
      const line = new Line2(geometry, material);
      line.computeLineDistances();
      line.renderOrder = 10;
      line.visible = false;
      geometry.instanceCount = 0;
      pool.push({ line, geometry, material, inUse: false });
    }
    return pool;
  }

  acquireLine(isSimple) {
    if (isSimple && !this.simpleArcLinePool.length) {
      this.simpleArcLinePool = this.createArcLinePool(this.SIMPLE_ARC_LINE_POOL_SIZE, this.SIMPLE_ARC_MAX_SEGMENTS, 0.004);
    }
    if (!isSimple && !this.arcLinePool.length) {
      this.arcLinePool = this.createArcLinePool(this.ARC_LINE_POOL_SIZE, this.ARC_MAX_SEGMENTS, 0.007);
    }
    const item = (isSimple ? this.simpleArcLinePool : this.arcLinePool).find((it) => !it.inUse);
    if (!item) return null;
    item.inUse = true;
    if (!item.line.parent) this.arcsGroup.add(item.line);
    return item;
  }

  releaseLine(item) {
    item.inUse = false;
    item.line.visible = false;
    item.material.opacity = 0;
    item.geometry.instanceCount = 0;
    item.material.userData.visibleRange.set(0, 0);
    setTotalSegments(item.material, 1);
  }

  acquireMarker(color) {
    if (!this.markerPool.length) {
      for (let i = 0; i < this.MARKER_POOL_SIZE; i += 1) {
        const material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest: true });
        const mesh = new THREE.Mesh(this.markerGeometry, material);
        mesh.visible = false;
        this.markerPool.push({ mesh, inUse: false });
      }
    }
    const item = this.markerPool.find((it) => !it.inUse);
    if (!item) return null;
    item.inUse = true;
    this.markerTextureCache[color] ??= createMarkerTexture(color);
    item.mesh.material.map = this.markerTextureCache[color];
    item.mesh.material.needsUpdate = true;
    if (!item.mesh.parent) this.arcsGroup.add(item.mesh);
    return item.mesh;
  }

  releaseMarker(mesh) {
    const item = this.markerPool.find((it) => it.mesh === mesh);
    if (!item) return;
    item.inUse = false;
    item.mesh.visible = false;
  }

  acquirePoints(isSimple) {
    const pool = isSimple ? this.simpleArcPointsPool : this.arcPointsPool;
    if (!pool.length) {
      const size = isSimple ? this.SIMPLE_ARC_LINE_POOL_SIZE : this.ARC_LINE_POOL_SIZE;
      const count = (isSimple ? this.SIMPLE_ARC_MAX_SEGMENTS : this.ARC_MAX_SEGMENTS) + 1;
      for (let i = 0; i < size; i += 1) pool.push({ points: Array.from({ length: count }, () => new THREE.Vector3()), inUse: false });
    }
    const item = pool.find((it) => !it.inUse);
    if (!item) return null;
    item.inUse = true;
    return item;
  }

  // -------------------------------------------------------------------------------- geometry helpers
  cityToVector(city, target, radius = this.radius) {
    return target.set(city.ux * radius, city.uy * radius, city.uz * radius);
  }

  /** Cities facing the camera (dot ≥ 0.25) and left of the right 30 % band of the globe. */
  getVisibleCityIndices(threshold = this.arcVisibleCityDotThreshold) {
    const visible = [];
    const minDot = clamp(threshold, -1, 1);
    const centre = new THREE.Vector3();
    this.globeGroup.getWorldPosition(centre);
    const toCamera = this.camera.position.clone().sub(centre).normalize();
    const matrix = this.arcsGroup.matrixWorld;
    const maxNdcX = centre.clone().project(this.camera).x + 1 - 2 * this.arcRightEdgeExclusionRatio;
    const p = new THREE.Vector3();
    const dir = new THREE.Vector3();
    for (let i = 0; i < this.cityVectors.length; i += 1) {
      p.copy(this.cityVectors[i]).applyMatrix4(matrix);
      dir.copy(p).sub(centre);
      if (dir.lengthSq() <= 1e-6) continue;
      dir.normalize();
      if (dir.dot(toCamera) >= minDot && p.clone().project(this.camera).x < maxNdcX) visible.push(i);
    }
    return visible;
  }

  /** Screen position (canvas px) of a world point, plus whether it is off-screen or behind the globe. */
  computeProjection(worldPoint, centre, toCamera, width, height) {
    const ndc = worldPoint.clone().project(this.camera);
    const facing = worldPoint.clone().sub(centre).normalize().dot(toCamera);
    return {
      x: (0.5 * ndc.x + 0.5) * width,
      y: (-0.5 * ndc.y + 0.5) * height,
      isOffscreen: ndc.x < -1.1 || ndc.x > 1.1 || ndc.y < -1.1 || ndc.y > 1.1,
      isBehindGlobe: facing < GLOBE.ARC_UI_HIDE_DOT_THRESHOLD,
      depthFade: facing <= -0.1 ? smoothstep(facing, -0.35, -0.1) : 1,
    };
  }

  getPointOnArc(arc, t, target) {
    if (!arc.points.length) return target.set(0, 0, 0);
    if (!arc.totalLineLength || arc.totalLineLength <= 0) return target.copy(arc.points[arc.points.length - 1]);
    const distances = arc.pointDistances;
    const d = clamp(t, 0, 1) * arc.totalLineLength;
    for (let i = 1; i < distances.length; i += 1) {
      if (d <= distances[i]) {
        const span = distances[i] - distances[i - 1];
        const f = span <= 1e-5 ? 0 : (d - distances[i - 1]) / span;
        return target.copy(arc.points[i - 1]).lerp(arc.points[i], f);
      }
    }
    return target.copy(arc.points[arc.points.length - 1]);
  }

  // -------------------------------------------------------------------------------- arc geometry
  /**
   * Great-circle arc between two cities, lifted by sin(πt)·peak. Endpoints are nudged 0.02 along
   * the chord so the line starts just outside the markers. Returns the points, cumulative lengths
   * and per-vertex colours (start → end colour).
   */
  buildArcPoints(from, to, segments, peakFor, pointsItem, colorStart, colorEnd) {
    const p0 = this.cityToVector(from, new THREE.Vector3());
    const p3 = this.cityToVector(to, new THREE.Vector3());
    const n0 = p0.clone().normalize();
    const n3 = p3.clone().normalize();
    const chord = p3.clone().sub(p0);
    const tangentStart = chord.clone().addScaledVector(n0, -chord.dot(n0)).normalize();
    const tangentEnd = chord.clone().addScaledVector(n3, -chord.dot(n3)).normalize();
    const start = p0.clone().addScaledVector(tangentStart, GLOBE.MARKER_TANGENT_OFFSET).normalize().multiplyScalar(this.radius);
    const end = p3.clone().addScaledVector(tangentEnd, -GLOBE.MARKER_TANGENT_OFFSET).normalize().multiplyScalar(this.radius);
    const u0 = start.clone().normalize();
    const u3 = end.clone().normalize();
    const angle = Math.acos(clamp(u0.dot(u3), -1, 1));
    const peak = peakFor(angle);
    const sinAngle = Math.sin(angle);
    const points = pointsItem.points;
    const dir = new THREE.Vector3();
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      if (sinAngle > 1e-6) {
        dir.copy(u0).multiplyScalar(Math.sin((1 - t) * angle) / sinAngle).addScaledVector(u3, Math.sin(t * angle) / sinAngle).normalize();
      } else {
        dir.copy(u0).lerp(u3, t).normalize();
      }
      const lift = Math.sin(Math.PI * t) * peak;
      points[i].set(dir.x * (this.radius + lift), dir.y * (this.radius + lift), dir.z * (this.radius + lift));
    }
    const distances = [0];
    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
      total += points[i].distanceTo(points[i - 1]);
      distances.push(total);
    }
    const positions = [];
    const colors = [];
    const a = new THREE.Color().setHex(colorStart);
    const b = new THREE.Color().setHex(colorEnd);
    const c = new THREE.Color();
    for (let i = 0; i < points.length; i += 1) {
      positions.push(points[i].x, points[i].y, points[i].z);
      c.copy(a).lerp(b, i / Math.max(1, points.length - 1));
      colors.push(c.r, c.g, c.b);
    }
    return { p0, p3, points, distances, total, positions, colors };
  }

  setupArcLine(lineItem, positions, colors, vertexCount) {
    const { line, geometry, material } = lineItem;
    geometry.setPositions(positions);
    geometry.setColors(colors);
    material.resolution.set(this.cachedWidth || this.canvas.clientWidth, this.cachedHeight || this.canvas.clientHeight);
    material.opacity = 0;
    line.computeLineDistances();
    const segments = Math.max(1, vertexCount - 1);
    geometry.instanceCount = segments;
    line.visible = false;
    material.userData.visibleRange.set(0, 0);
    setTotalSegments(material, segments);
    return segments;
  }

  /** Places a ring marker on the surface at `position`, facing outwards, hidden until animated. */
  placeMarker(marker, position, initialScale) {
    marker.position.copy(position);
    marker.scale.setScalar(initialScale);
    marker.visible = true;
    marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize());
    marker.material.opacity = 0;
    marker.material.transparent = true;
  }

  drawArc({ from, to, colorStart = 0xff5fa2, colorEnd = 0x7ab8ff, currentTime }) {
    const pointsItem = this.acquirePoints(false);
    if (!pointsItem) return null;
    const minPeak = Math.max(0.01, this.arcPeakMinHeight);
    const maxPeak = Math.max(minPeak, this.arcPeakMaxHeight);
    const arcData = this.buildArcPoints(
      from,
      to,
      this.ARC_MAX_SEGMENTS,
      (angle) => lerp(minPeak, maxPeak, clamp(angle / Math.PI, 0, 1) ** clamp(this.arcPeakAnglePower, 0.01, 5)) * this.radius,
      pointsItem,
      colorStart,
      colorEnd,
    );
    const lineItem = this.acquireLine(false);
    if (!lineItem) {
      pointsItem.inUse = false;
      return null;
    }
    const segments = this.setupArcLine(lineItem, arcData.positions, arcData.colors, arcData.points.length);
    const startMarker = this.acquireMarker(colorStart);
    const endMarker = this.acquireMarker(colorEnd);
    if (!startMarker || !endMarker) {
      this.releaseLine(lineItem);
      pointsItem.inUse = false;
      if (startMarker) this.releaseMarker(startMarker);
      if (endMarker) this.releaseMarker(endMarker);
      return null;
    }
    this.placeMarker(startMarker, arcData.p0, 0.02);
    this.placeMarker(endMarker, arcData.p3, 0.02);

    // Take a free label from the pool (one not shown by another arc).
    const uiData = this.getRandomUIData();
    const busy = new Set(this.activeArcs.filter((a) => a.uiState !== "done" && a.uiElement).map((a) => a.uiElement));
    const uiElement = this.uiPool.find((el) => !busy.has(el)) ?? null;
    if (uiElement) {
      for (const other of this.activeArcs) {
        if (other.uiElement === uiElement) {
          uiElement.style.display = "none";
          other.uiElement = null;
          other.uiState = "done";
          other.uiOpacity = 0;
        }
      }
      this.updateUIElementContent(uiElement, uiData.walletIndex, uiData.amount, uiData.currencyLabel);
      uiElement.style.setProperty("--ui-opacity", "0");
      uiElement.style.setProperty("--ui-scale", "0");
      uiElement.style.setProperty("--ui-x", "0px");
      uiElement.style.setProperty("--ui-y", "0px");
      uiElement.style.display = "block";
    }

    const km = cityDistanceKm(from, to);
    const startTime = currentTime ?? performance.now();
    const { uiTravel, lineDistanceScale } = ARC_TIMING;
    const travelScale = clamp((km / 10000) * uiTravel.distanceScale.factor + 1, uiTravel.distanceScale.min, uiTravel.distanceScale.max);
    const lineDuration = clamp(
      lineDistanceScale.baseDurationMs * (km / lineDistanceScale.referenceKm),
      lineDistanceScale.min,
      lineDistanceScale.max,
    );
    const arc = {
      mesh: lineItem.line,
      points: arcData.points,
      startMarker,
      endMarker,
      uiElement,
      markerScale: 0.2,
      animation: {
        startTime,
        markerA: ARC_TIMING.markerA.durationMs,
        markerB: ARC_TIMING.markerB.durationMs,
        line: lineDuration,
        markerAEasing: ARC_TIMING.markerA.easing,
        markerBEasing: ARC_TIMING.markerB.easing,
        lineEasing: ARC_TIMING.line.easing,
      },
      lineSegmentCount: segments,
      lineProgress: 0,
      pointDistances: arcData.distances,
      totalLineLength: arcData.total,
      arcDistanceKm: km,
      uiState: "idle", // idle → intro → travel → outro → done
      uiStartTime: 0,
      uiIntroDuration: ARC_TIMING.uiIntro.durationMs,
      uiTravelDuration: uiTravel.durationMs * travelScale,
      uiOutroDuration: ARC_TIMING.uiOutro.durationMs,
      uiIntroEasing: ARC_TIMING.uiIntro.easing,
      uiTravelEasing: uiTravel.easing,
      uiOutroEasing: ARC_TIMING.uiOutro.easing,
      uiOpacity: 0,
      uiScaleValue: 0,
      uiTravelProgress: 0.05,
      uiTravelStartT: 0.05,
      uiTravelEndT: 0.95,
      uiCurrentScale: 0,
      uiOutroStartScale: 0,
      uiHideFade: 0,
      finalizeState: "idle", // idle → active (line retreat + marker fade) → done
      finalizeStartTime: 0,
      lineRetreatDuration: ARC_TIMING.lineRetreat.durationMs,
      markerFadeDuration: ARC_TIMING.markerFade.durationMs,
      lineRetreatEasing: ARC_TIMING.lineRetreat.easing,
      markerFadeEasing: ARC_TIMING.markerFade.easing,
      linePoolItem: lineItem,
      pointsPoolItem: pointsItem,
      isSimpleArc: false,
      fromCityName: from.name ?? "",
      toCityName: to.name ?? "",
    };
    this.activeArcs.push(arc);
    return arc;
  }

  drawSimpleArc({ from, to, colorStart = 0x80d4ff, colorEnd = 0x4da6ff, currentTime }) {
    const pointsItem = this.acquirePoints(true);
    if (!pointsItem) return null;
    const arcData = this.buildArcPoints(
      from,
      to,
      this.SIMPLE_ARC_MAX_SEGMENTS,
      (angle) => lerp(0.06, 0.18, clamp(angle / Math.PI, 0, 1)) * this.radius,
      pointsItem,
      colorStart,
      colorEnd,
    );
    const lineItem = this.acquireLine(true);
    if (!lineItem) {
      pointsItem.inUse = false;
      return null;
    }
    const segments = this.setupArcLine(lineItem, arcData.positions, arcData.colors, arcData.points.length);
    const startMarker = this.acquireMarker(colorStart);
    const endMarker = this.acquireMarker(colorEnd);
    if (!startMarker || !endMarker) {
      this.releaseLine(lineItem);
      pointsItem.inUse = false;
      if (startMarker) this.releaseMarker(startMarker);
      if (endMarker) this.releaseMarker(endMarker);
      return null;
    }
    this.placeMarker(startMarker, arcData.p0, 0.01);
    this.placeMarker(endMarker, arcData.p3, 0.01);
    const startTime = currentTime ?? performance.now();
    return {
      mesh: lineItem.line,
      points: arcData.points,
      startMarker,
      endMarker,
      uiElement: null,
      markerScale: 0.12,
      animation: {
        startTime,
        markerA: SIMPLE_ARC_TIMING.markerA.durationMs,
        markerB: SIMPLE_ARC_TIMING.markerB.durationMs,
        line: SIMPLE_ARC_TIMING.line.durationMs,
        markerAEasing: SIMPLE_ARC_TIMING.markerA.easing,
        markerBEasing: SIMPLE_ARC_TIMING.markerB.easing,
        lineEasing: SIMPLE_ARC_TIMING.line.easing,
      },
      lineSegmentCount: segments,
      lineProgress: 0,
      pointDistances: arcData.distances,
      totalLineLength: arcData.total,
      uiState: "done",
      uiStartTime: 0,
      uiOpacity: 0,
      uiScaleValue: 0,
      finalizeState: "idle",
      finalizeStartTime: 0,
      lineRetreatDuration: SIMPLE_ARC_TIMING.lineRetreat.durationMs,
      markerFadeDuration: SIMPLE_ARC_TIMING.markerFade.durationMs,
      lineRetreatEasing: SIMPLE_ARC_TIMING.lineRetreat.easing,
      markerFadeEasing: SIMPLE_ARC_TIMING.markerFade.easing,
      linePoolItem: lineItem,
      pointsPoolItem: pointsItem,
      isSimpleArc: true,
      fromCityName: from.name ?? "",
      toCityName: to.name ?? "",
    };
  }

  disposeArcResources(arc) {
    if (arc.linePoolItem) this.releaseLine(arc.linePoolItem);
    if (arc.pointsPoolItem) arc.pointsPoolItem.inUse = false;
    if (arc.startMarker) this.releaseMarker(arc.startMarker);
    if (arc.endMarker) this.releaseMarker(arc.endMarker);
    if (arc.uiElement) arc.uiElement.style.display = "none";
  }

  // -------------------------------------------------------------------------------- arc labels
  getRandomUIData() {
    const walletIndex = Math.floor(Math.random() * WALLETS.length);
    const isPhantom = WALLETS[walletIndex].name === "Phantom";
    return {
      walletIndex,
      amount: Math.floor(999 * Math.random()) + 1,
      currencyLabel: isPhantom ? "CASH" : STABLECOINS[Math.floor(Math.random() * STABLECOINS.length)],
    };
  }

  updateUIElementContent(element, walletIndex, amount, currency) {
    const icon = element.querySelector(".globe__arc-ui-icon");
    const amountEl = element.querySelector(".globe__arc-ui-amount");
    const currencyEl = element.querySelector(".globe__arc-ui-currency");
    if (icon) {
      icon.style.display = "";
      svgIdCounter += 1;
      const svg = WALLETS[walletIndex % WALLETS.length].svg
        .replace(/id="([^"]+)"/g, `id="$1-${svgIdCounter}"`)
        .replace(/url\(#([^)]+)\)/g, `url(#$1-${svgIdCounter})`);
      icon.replaceChildren(new DOMParser().parseFromString(svg, "image/svg+xml").documentElement);
    }
    if (amountEl) {
      amountEl.style.display = "";
      amountEl.textContent = `$${amount}`;
    }
    if (currencyEl) currencyEl.textContent = currency;
  }

  // -------------------------------------------------------------------------------- per-frame arc update
  updateArcsConsolidated(now) {
    const centre = new THREE.Vector3();
    this.globeGroup.getWorldPosition(centre);
    const toCamera = this.camera.position.clone().sub(centre).normalize();
    const width = this.cachedWidth;
    const height = this.cachedHeight;
    const hasSize = width > 0 && height > 0;
    for (let i = this.activeArcs.length - 1; i >= 0; i -= 1) {
      const arc = this.activeArcs[i];
      this.updateSingleArcAnimation(arc, now);
      if (hasSize && arc.uiElement) this.updateSingleArcUIPosition(arc, centre, toCamera, width, height);
      if (arc.finalizeState === "done" && arc.uiState === "done") {
        this.disposeArcResources(arc);
        this.activeArcs.splice(i, 1);
      }
    }
  }

  updateSimpleArcsConsolidated(now) {
    for (let i = this.activeSimpleArcs.length - 1; i >= 0; i -= 1) {
      const arc = this.activeSimpleArcs[i];
      this.updateSingleArcAnimation(arc, now);
      if (arc.lineProgress >= 0.999 && arc.finalizeState === "idle") this.startArcFinalization(arc, now);
      if (arc.finalizeState === "done") {
        this.disposeArcResources(arc);
        this.activeSimpleArcs.splice(i, 1);
      }
    }
  }

  /** Marker A pops in, then marker B, then the line grows (opacity follows its eased progress). */
  updateSingleArcAnimation(arc, now) {
    const { markerA, markerB, line, startTime, markerAEasing, markerBEasing, lineEasing } = arc.animation;
    const elapsed = Math.max(0, now - startTime);
    const { markerAlpha, retreat } = this.getArcFinalizationFactors(arc, now);
    const lineT = line <= 0 ? 1 : clamp(Math.max(0, elapsed - markerA - markerB) / line, 0, 1);

    const a = ease(markerA <= 0 ? 1 : Math.min(1, elapsed / markerA), markerAEasing);
    arc.startMarker.material.opacity = a * markerAlpha;
    arc.startMarker.scale.setScalar(Math.max(1e-4, arc.markerScale * a * markerAlpha));

    const b = elapsed >= markerA ? ease(markerB <= 0 ? 1 : Math.min(1, Math.max(0, elapsed - markerA) / markerB), markerBEasing) : 0;
    arc.endMarker.material.opacity = b * markerAlpha;
    arc.endMarker.scale.setScalar(Math.max(1e-4, arc.markerScale * b * markerAlpha));

    const material = arc.mesh.material;
    const head = ease(lineT, lineEasing);
    const tail = arc.finalizeState !== "idle" ? retreat : 0;
    material.userData.visibleRange.set(tail, head);
    setTotalSegments(material, arc.lineSegmentCount);
    if (arc.linePoolItem && arc.linePoolItem.geometry.instanceCount !== arc.lineSegmentCount) {
      arc.linePoolItem.geometry.instanceCount = arc.lineSegmentCount;
    }
    if (retreat > 1e-4 && arc.lineProgress >= 0.999 && arc.finalizeState !== "idle") {
      const opacity = Math.max(0, 1 - retreat);
      if (tail >= head || opacity <= 0.001) {
        arc.mesh.visible = false;
        material.opacity = 0;
      } else {
        arc.mesh.visible = true;
        material.opacity = opacity;
      }
    } else if (lineT <= 0) {
      arc.mesh.visible = false;
      material.opacity = 0;
    } else {
      arc.mesh.visible = true;
      material.opacity = head;
    }
    arc.lineProgress = lineT;
    this.updateArcUIState(arc, now);
  }

  startArcFinalization(arc, now) {
    if (arc.finalizeState !== "idle") return;
    arc.finalizeState = "active";
    arc.finalizeStartTime = now;
  }

  /** Line retreat (tail catches the head) and, from 80 % of it, the marker fade. */
  getArcFinalizationFactors(arc, now) {
    if (arc.finalizeState === "done") return { markerAlpha: 0, retreat: 1 };
    if (arc.finalizeState !== "active") return { markerAlpha: 1, retreat: 0 };
    const elapsed = Math.max(0, now - arc.finalizeStartTime);
    const retreatDuration = Math.max(100, arc.lineRetreatDuration);
    const retreat = ease(clamp(elapsed / retreatDuration, 0, 1), arc.lineRetreatEasing);
    const fadeDuration = Math.max(50, arc.markerFadeDuration);
    const fade = ease(clamp(Math.max(0, elapsed - 0.8 * retreatDuration) / fadeDuration, 0, 1), arc.markerFadeEasing);
    if (retreat >= 1 && fade >= 1) arc.finalizeState = "done";
    return { markerAlpha: Math.max(0, 1 - fade), retreat: clamp(retreat, 0, 1) };
  }

  /** Label: waits for the line, scales/fades in (800 ms), travels 5 → 95 % of the arc, shrinks out (600 ms). */
  updateArcUIState(arc, now) {
    if (arc.uiState === "done") {
      arc.uiOpacity = 0;
      arc.uiScaleValue = 0;
      return;
    }
    if (arc.uiState === "idle") {
      arc.uiOpacity = 0;
      arc.uiScaleValue = 0;
      arc.uiTravelProgress = arc.uiTravelStartT;
      if (arc.lineProgress >= 1) {
        arc.uiState = "intro";
        arc.uiStartTime = now;
        arc.uiScaleValue = 0;
      }
      return;
    }
    if (arc.uiState === "intro") {
      const t = (now - arc.uiStartTime) / Math.max(1, arc.uiIntroDuration);
      const e = ease(t, arc.uiIntroEasing);
      arc.uiOpacity = e;
      arc.uiScaleValue = e;
      arc.uiTravelProgress = arc.uiTravelStartT;
      if (t >= 1) {
        arc.uiState = "travel";
        arc.uiStartTime = now;
        arc.uiScaleValue = 0;
      }
      return;
    }
    if (arc.uiState === "travel") {
      const t = clamp((now - arc.uiStartTime) / Math.max(1, arc.uiTravelDuration), 0, 1);
      const e = ease(t, arc.uiTravelEasing);
      arc.uiOpacity = 1;
      arc.uiScaleValue = e;
      arc.uiTravelProgress = lerp(arc.uiTravelStartT, arc.uiTravelEndT, e);
      if (t >= 1) {
        arc.uiState = "outro";
        arc.uiStartTime = now;
        arc.uiScaleValue = 0;
        this.startArcFinalization(arc, now);
        arc.uiOutroStartScale = arc.uiCurrentScale ?? 0;
      }
      return;
    }
    if (arc.uiState === "outro") {
      const t = (now - arc.uiStartTime) / Math.max(1, arc.uiOutroDuration);
      const e = ease(t, arc.uiOutroEasing);
      arc.uiOpacity = Math.max(0, 1 - e);
      arc.uiScaleValue = e;
      arc.uiTravelProgress = arc.uiTravelEndT;
      if (t >= 1) {
        arc.uiState = "done";
        arc.uiOpacity = 0;
        arc.uiScaleValue = 0;
      }
    }
  }

  /** Positions the label just above the arc point it rides on; scale 0.75..1 grows with arc height. */
  updateSingleArcUIPosition(arc, centre, toCamera, width, height) {
    const point = this.getPointOnArc(arc, clamp(arc.uiTravelProgress ?? 0.5, 0, 1), new THREE.Vector3());
    const normal = point.clone().normalize();
    const lift = Math.max(0, point.length() - this.radius);
    const heightRatio = clamp(lift / (0.75 * this.radius), 0, 1);
    const offset = lerp(GLOBE.ARC_UI_MIN_OFFSET, GLOBE.ARC_UI_MAX_OFFSET, heightRatio);
    const anchor = point.clone().add(normal.multiplyScalar(offset)).applyMatrix4(this.arcsGroup.matrixWorld);
    const { x, y, isOffscreen, isBehindGlobe, depthFade } = this.computeProjection(anchor, centre, toCamera, width, height);
    const hidden = isBehindGlobe || isOffscreen;
    arc.uiHideFade = lerp(arc.uiHideFade, hidden ? 1 : 0, hidden ? 0.25 : 0.15);
    const opacity = clamp(arc.uiOpacity ?? 0, 0, 1) * depthFade * (1 - arc.uiHideFade);
    if (!(opacity > 0.001)) {
      arc.uiElement.style.display = "none";
      return;
    }
    const fullScale = lerp(GLOBE.ARC_UI_MIN_SCALE, GLOBE.ARC_UI_MAX_SCALE, heightRatio);
    const progress = clamp(arc.uiScaleValue ?? 0, 0, 1);
    let scale = 0;
    if (arc.uiState === "intro") scale = lerp(0, fullScale, progress);
    else if (arc.uiState === "travel") scale = fullScale;
    else if (arc.uiState === "outro") scale = lerp(arc.uiOutroStartScale > 0 ? arc.uiOutroStartScale : fullScale, 0, progress);

    const style = arc.uiElement.style;
    const px = Math.round(x);
    const py = Math.round(y);
    if (arc.uiLastX === undefined || arc.uiLastY === undefined || Math.abs(px - arc.uiLastX) >= 1 || Math.abs(py - arc.uiLastY) >= 1) {
      style.setProperty("--ui-x", `${px}px`);
      style.setProperty("--ui-y", `${py}px`);
      arc.uiLastX = px;
      arc.uiLastY = py;
    }
    if (arc.uiCurrentScale !== scale) style.setProperty("--ui-scale", scale.toFixed(3));
    style.setProperty("--ui-opacity", opacity.toFixed(3));
    if (style.display === "none") style.display = "block";
    arc.uiCurrentScale = scale;
  }

  // -------------------------------------------------------------------------------- spawning
  updateArcController(now) {
    if (!this.arcControllerEnabled || CITIES.length < 2) return;
    if (this.arcControllerNextSpawnTime === 0) this.arcControllerNextSpawnTime = now;
    if (now < this.arcControllerNextSpawnTime) return;
    if (this.activeArcs.length >= this.arcControllerMaxActive) {
      this.arcControllerNextSpawnTime = now + 250;
      return;
    }
    let spawned = false;
    for (let attempt = 0; attempt < 2 && !spawned; attempt += 1) spawned = this.spawnRandomCityArc(now);
    if (spawned) {
      const min = Math.max(0, Math.floor(this.arcSpawnIntervalMin));
      const max = Math.max(min, Math.floor(this.arcSpawnIntervalMax));
      this.arcControllerNextSpawnTime = now + Math.max(100, min === max ? min : randInt(min, max));
    } else {
      this.arcControllerNextSpawnTime = now + 200;
    }
  }

  spawnRandomCityArc(now) {
    const pair = this.pickRandomCityPair();
    if (!pair) return false;
    const palette = this.arcColorPalettes[Math.floor(Math.random() * this.arcColorPalettes.length)];
    const arc = this.drawArc({ from: pair.from, to: pair.to, colorStart: palette.start, colorEnd: palette.end, currentTime: now });
    if (arc) this.updateSingleArcAnimation(arc, now);
    return !!arc;
  }

  updateSimpleArcController(now) {
    if (!this.simpleArcControllerEnabled || CITIES.length < 2) return;
    if (this.simpleArcControllerNextSpawnTime === 0) this.simpleArcControllerNextSpawnTime = now;
    if (now < this.simpleArcControllerNextSpawnTime) return;
    const running = this.activeSimpleArcs.filter((arc) => arc.finalizeState !== "done").length;
    if (running >= this.simpleArcMaxActive) {
      this.simpleArcControllerNextSpawnTime = now + 150;
      return;
    }
    let spawned = false;
    for (let attempt = 0; attempt < 2 && !spawned; attempt += 1) spawned = this.spawnSimpleArc(now);
    if (spawned) {
      const min = Math.max(0, Math.floor(this.simpleArcSpawnIntervalMin));
      const max = Math.max(min, Math.floor(this.simpleArcSpawnIntervalMax));
      this.simpleArcControllerNextSpawnTime = now + Math.max(50, min === max ? min : randInt(min, max));
    } else {
      this.simpleArcControllerNextSpawnTime = now + 150;
    }
  }

  spawnSimpleArc(now) {
    const pair = this.pickSimpleArcCityPair();
    if (!pair) return false;
    const palette = this.simpleArcColorPalettes[Math.floor(Math.random() * this.simpleArcColorPalettes.length)];
    const arc = this.drawSimpleArc({ from: pair.from, to: pair.to, colorStart: palette.start, colorEnd: palette.end, currentTime: now });
    if (!arc) return false;
    this.activeSimpleArcs.push(arc);
    this.updateSingleArcAnimation(arc, now);
    return true;
  }

  /** Cities used by labelled arcs are off-limits for simple arcs, so labels stay readable. */
  pickSimpleArcCityPair() {
    const candidates = this.candidateCityIndices;
    const count = candidates.length;
    if (count < 2) return null;
    const busy = new Set();
    for (const arc of this.activeArcs) {
      if (!arc.uiElement) continue;
      if (arc.fromCityName) busy.add(arc.fromCityName);
      if (arc.toCityName) busy.add(arc.toCityName);
    }
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const a = candidates[Math.floor(Math.random() * count)];
      let b = candidates[Math.floor(Math.random() * count)];
      for (let retry = 0; b === a && retry < 10; retry += 1) b = candidates[Math.floor(Math.random() * count)];
      if (b === a) continue;
      const from = CITIES[a];
      const to = CITIES[b];
      if (!from || !to || busy.has(from.name) || busy.has(to.name)) continue;
      const key = `${from.name}-${to.name}`;
      if (key === this.lastSimpleArcPairKey) continue;
      const km = cityDistanceKm(from, to);
      if (km >= this.simpleArcMinDistanceKm && km <= this.simpleArcMaxDistanceKm) {
        this.lastSimpleArcPairKey = key;
        return { from, to };
      }
    }
    return null;
  }

  /** Keeps a new label ≥ 80 px from live labels and ≥ 56 px from their markers (screen space). */
  checkArcSpawnDistance(from, to) {
    if (this.activeArcs.length === 0) return true;
    const minDistance = this.arcMinUIScreenDistance;
    if (minDistance <= 0) return true;
    const a = this.cityToVector(from, new THREE.Vector3());
    const b = this.cityToVector(to, new THREE.Vector3());
    const mid = a.lerp(b, 0.5).normalize().multiplyScalar(1.1 * this.radius).applyMatrix4(this.arcsGroup.matrixWorld);
    const ndc = mid.clone().project(this.camera);
    const width = this.cachedWidth;
    const height = this.cachedHeight;
    if (width === 0 || height === 0) return true;
    const x = (0.5 * ndc.x + 0.5) * width;
    const y = (-0.5 * ndc.y + 0.5) * height;
    if (ndc.z > 1 || ndc.x < -1.2 || ndc.x > 1.2 || ndc.y < -1.2 || ndc.y > 1.2) return true;
    const toScreen = (marker) => {
      const p = marker.position.clone().applyMatrix4(this.arcsGroup.matrixWorld).project(this.camera);
      return { x: (0.5 * p.x + 0.5) * width, y: (-0.5 * p.y + 0.5) * height };
    };
    for (const arc of this.activeArcs) {
      if (arc.uiState === "done" || arc.uiState === "outro") continue;
      if (arc.uiLastX !== undefined && arc.uiLastY !== undefined && Math.hypot(x - arc.uiLastX, y - arc.uiLastY) < minDistance) {
        return false;
      }
      const s = toScreen(arc.startMarker);
      const e = toScreen(arc.endMarker);
      const markerDistance = 0.7 * minDistance;
      if (Math.hypot(x - s.x, y - s.y) < markerDistance) return false;
      if (Math.hypot(x - e.x, y - e.y) < markerDistance) return false;
    }
    return true;
  }

  getViewedLongitude() {
    let yaw = this.globeGroup.rotation.y % (2 * Math.PI);
    if (yaw > Math.PI) yaw -= 2 * Math.PI;
    if (yaw < -Math.PI) yaw += 2 * Math.PI;
    return -((180 / Math.PI) * yaw);
  }

  isPacificOceanVisible() {
    const lon = this.getViewedLongitude();
    return lon <= this.arcPacificWestBoundary || lon >= this.arcPacificEastBoundary;
  }

  isPacificForSpeedAcceleration() {
    const lon = this.getViewedLongitude();
    return lon <= this.arcPacificSpeedWestBoundary || lon >= this.arcPacificSpeedEastBoundary;
  }

  hasActiveTranspacificArc() {
    for (const arc of this.activeArcs) {
      const a = arc.startMarker.position;
      const b = arc.endMarker.position;
      const lonA = Math.atan2(a.x, a.z) * (180 / Math.PI);
      const lonB = Math.atan2(b.x, b.z) * (180 / Math.PI);
      if ((lonA < -100 && lonB > 100) || (lonA > 100 && lonB < -100)) return true;
    }
    return false;
  }

  pickTranspacificPair() {
    for (const pair of [...TRANSPACIFIC_PAIRS].sort(() => Math.random() - 0.5)) {
      let from = findCity(pair.from);
      let to = findCity(pair.to);
      if (!from || !to) continue;
      if (Math.random() < 0.5) [from, to] = [to, from];
      const key = `${from.name}-${to.name}`;
      const reverse = `${to.name}-${from.name}`;
      if (key !== this.lastArcPairKey && reverse !== this.lastArcPairKey && this.checkArcSpawnDistance(from, to)) {
        return { from, to };
      }
    }
    return null;
  }

  /**
   * One end must face the camera (randomly the start or the end); prefers pairs ≥ 2000 km apart
   * that keep labels apart, falling back to the farthest pair found in up to 276 attempts.
   */
  pickRandomCityPair() {
    const candidates = this.candidateCityIndices;
    const count = candidates.length;
    if (count < 2) return null;
    if (this.arcPreferTranspacific && this.isPacificOceanVisible() && !this.hasActiveTranspacificArc()) {
      const pair = this.pickTranspacificPair();
      if (pair) {
        this.lastArcPairKey = `${pair.from.name}-${pair.to.name}`;
        return pair;
      }
    }
    const minKm = Math.max(0, this.arcCityMinDistanceKm);
    const attempts = Math.max(20, 4 * count);
    const maxBlocked = this.arcMaxSpawnDistanceAttempts;
    let best = null;
    let bestKm = -Infinity;
    let bestIsSpaced = false;
    let fromPool = candidates;
    let toPool = candidates;
    const visible = this.getVisibleCityIndices();
    if (visible.length > 0) {
      const visibleSet = new Set(visible);
      const visibleCandidates = candidates.length < CITIES.length ? visible.filter((i) => visibleSet.has(i)) : visible;
      if (visibleCandidates.length > 0) {
        if (Math.random() < 0.5) fromPool = visibleCandidates;
        else toPool = visibleCandidates;
      }
    }
    let blocked = 0;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const a = fromPool[Math.floor(Math.random() * fromPool.length)];
      let b = toPool[Math.floor(Math.random() * toPool.length)];
      for (let retry = 0; b === a && retry < toPool.length + 5; retry += 1) b = toPool[Math.floor(Math.random() * toPool.length)];
      if (b === a) continue;
      const from = CITIES[a];
      const to = CITIES[b];
      if (!from || !to || from === to) continue;
      const key = `${from.name}-${to.name}`;
      if (key === this.lastArcPairKey && count > 2) continue;
      const km = cityDistanceKm(from, to);
      if (this.checkArcSpawnDistance(from, to)) {
        if (km > bestKm || !bestIsSpaced) {
          bestKm = km;
          best = { from, to };
          bestIsSpaced = true;
        }
        if (km >= minKm) {
          this.lastArcPairKey = key;
          return { from, to };
        }
      } else {
        blocked += 1;
        if (!bestIsSpaced && km > bestKm) {
          bestKm = km;
          best = { from, to };
        }
      }
      if (blocked >= maxBlocked && !bestIsSpaced && best && km >= minKm) {
        this.lastArcPairKey = key;
        return { from, to };
      }
    }
    if (best) {
      this.lastArcPairKey = `${best.from.name}-${best.to.name}`;
      return best;
    }
    return null;
  }
}
