// WebGL gating, ported from stripe.com: a GPU blocklist decides whether the live particle canvas is
// mounted at all, and the renderer is then checked for the capabilities the graphics rely on.
// Anything that fails shows the static particle image instead.

const BLOCKLIST = [
  "geforce 320m", "geforce 8600", "geforce 8600m gt", "geforce 8800 gs", "geforce 8800 gt", "geforce 9400",
  "geforce 9400m g", "geforce 9400m", "geforce 9600m gt", "geforce 9600m", "geforce fx go5200", "geforce gt 120",
  "geforce gt 130", "geforce gt 330m", "geforce gtx 285", "google swiftshader", "intel g41", "intel g45",
  "intel gma 4500mhd", "intel gma x3100", "intel hd 3000", "intel q45", "legacy", "mali-2", "mali-3", "mali-4",
  "quadro fx 1500", "quadro fx 4", "quadro fx 5", "radeon hd 2400", "radeon hd 2600", "radeon hd 4670",
  "radeon hd 4850", "radeon hd 4870", "radeon hd 5670", "radeon hd 5750", "radeon hd 6290", "radeon hd 6300",
  "radeon hd 6310", "radeon hd 6320", "radeon hd 6490m", "radeon hd 6630m", "radeon hd 6750m", "radeon hd 6770m",
  "radeon hd 6970m", "sgx 543", "sgx543",
];
const LOW_END_APPLE = ["a7", "a8", "a9", "a10"];
const LOW_END_ADRENO = [205, 220, 225, 302, 303, 304, 305, 306, 308, 320, 330, 405, 418, 420, 430, 505, 506];
const LOW_END_MALI = [/mali-[234]/i, /mali-t[67]\d{2}/i, /mali-t8[0-6]\d/i, /mali-g3[01]/i, /mali-g5[01]/i];

const REQUIRED_EXTENSIONS = ["EXT_color_buffer_float", "EXT_texture_filter_anisotropic", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders"];

function device() {
  const { userAgent, platform, maxTouchPoints } = navigator;
  const isIos = /(iphone|ipod|ipad)/i.test(userAgent);
  const isIpad = platform === "iPad" || (platform === "MacIntel" && maxTouchPoints > 0 && !("MSStream" in window));
  return { isMobile: /android/i.test(userAgent) || isIos || isIpad, isSafari12: /Version\/12.+Safari/.test(userAgent) };
}

function rendererName(gl) {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  let name = (info && gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) || "";
  if (!name) name = gl.getParameter(gl.RENDERER) || "";
  return name
    .toLowerCase()
    .replace(/.*angle ?\((.+)\)(?: on vulkan [0-9.]+)?$/i, "$1")
    .replace(/\s(\d{1,2}gb|direct3d.+$)|\(r\)| \([^)]+\)$/g, "")
    .replace(/(?:vulkan|opengl) \d+\.\d+(?:\.\d+)?(?: \((.*)\))?/, "$1")
    .replace(/angle metal renderer: apple (m\d+(?:\s+(?:pro|max|ultra))?)/i, "apple $1");
}

let cached = null;

// true when the GPU is good enough for the live canvas (stripe.com's `supportsWebGL`).
export function gpuSupportsWebGL() {
  if (cached !== null) return cached;
  const { isMobile, isSafari12 } = device();
  const attrs = { alpha: false, antialias: false, depth: false, failIfMajorPerformanceCaveat: true, stencil: false };
  if (!isSafari12) attrs.powerPreference = "high-performance";
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", attrs) || canvas.getContext("experimental-webgl", attrs);
  if (!gl) return (cached = false);

  const gpu = rendererName(gl);
  const chip = gpu.match(/apple (a\d+|m\d+(?:\s+(?:pro|max|ultra))?)/i)?.[1]?.toLowerCase();
  const adreno = Number(gpu.match(/adreno[- ]?(\d+)/i)?.[1] ?? 0);
  const blocked =
    BLOCKLIST.some((entry) => gpu.includes(entry)) ||
    (isMobile && chip && LOW_END_APPLE.some((a) => chip.startsWith(a))) ||
    LOW_END_ADRENO.includes(adreno) ||
    LOW_END_MALI.some((re) => re.test(gpu)) ||
    /powervr\s*(sgx|series\s*[456])/i.test(gpu) ||
    /intel.*(gma|g4[15]|q45|hd 3000|hd graphics 3000)/i.test(gpu) ||
    /geforce.*(8\d{3}|9\d{3}|gt\s*[123]\d{2})/i.test(gpu) ||
    /radeon.*(hd\s*[2-5]\d{3})/i.test(gpu);
  return (cached = !blocked);
}

// Creates a WebGLRenderer, first refusing software rendering, then accepting it so the caller can decide.
export function createRenderer(THREE, params) {
  let renderer = null;
  let hasMajorPerformanceCaveat = false;
  try {
    renderer = new THREE.WebGLRenderer({ ...params, failIfMajorPerformanceCaveat: true });
  } catch {
    hasMajorPerformanceCaveat = true;
  }
  if (!renderer) {
    try {
      renderer = new THREE.WebGLRenderer({ ...params, failIfMajorPerformanceCaveat: false });
    } catch {
      // no WebGL at all
    }
  }
  let hasRequiredCapabilities = false;
  if (renderer) {
    const { capabilities: c, extensions } = renderer;
    hasRequiredCapabilities =
      c.isWebGL2 && c.vertexTextures && c.maxTextureSize >= 4096 && c.maxVertexUniforms >= 256 && c.maxFragmentUniforms >= 256 &&
      REQUIRED_EXTENSIONS.every((name) => extensions.get(name) !== null);
  }
  return { renderer, hasMajorPerformanceCaveat, hasRequiredCapabilities };
}

export const webglDisabledByQuery = () => new URLSearchParams(location.search).has("__disableWebGL");
