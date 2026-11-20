// The robot's screen: a slowly flowing blue gradient seen through a CRT filter. On workos.com it is
// drawn by the "shaders" library on WebGPU (FlowingGradient into a texture, then CRTScreen); these are
// the WGSL modules it generated, with the same uniforms. Without WebGPU nothing is drawn and the
// black face plate shows through, exactly as on the original.

const RTT_WGSL = /* wgsl */ `
struct _Output {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
}

@vertex fn item(@builtin(vertex_index) vertexIndex: u32) -> _Output {
  const pos = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  const uv = array<vec2f, 3>(vec2f(0, 1), vec2f(2, 1), vec2f(0, -1));

  return _Output(vec4f(pos[vertexIndex], 0, 1), uv[vertexIndex]);
}

fn overComposite(base: vec4f, blended: vec3f, overlayAlpha: f32) -> vec4f {
  let baseWeight = (base.w * (1f - overlayAlpha));
  let finalAlpha = (overlayAlpha + baseWeight);
  let rgb = ((blended * overlayAlpha) + (base.xyz * baseWeight));
  return vec4f(rgb, finalAlpha);
}

fn blend_normal(base: vec4f, overlay: vec4f, opacity: f32) -> vec4f {
  let overlayAlpha = (overlay.w * opacity);
  return overComposite(base, overlay.xyz, overlayAlpha);
}

fn flowingCompose(base: vec4f, litScale: f32) -> vec4f {
  let lit = clamp((base.xyz * litScale), vec3f(), vec3f(1));
  return vec4f(lit, base.w);
}

fn p3ToSRGB(p3: vec3f) -> vec3f {
  let r = (((p3.x * 1.2249401f) - (p3.y * 0.2249404f)) - (p3.z * 0f));
  let g = (((p3.x * -0.0420569f) + (p3.y * 1.0420571f)) + (p3.z * 0f));
  let b = (((p3.x * -0.0196376f) - (p3.y * 0.0786361f)) + (p3.z * 1.0982735f));
  return vec3f(r, g, b);
}

fn rgbToOklab(rgb: vec3f) -> vec3f {
  let r = rgb.x;
  let g = rgb.y;
  let b = rgb.z;
  let l = (((r * 0.4122214708f) + (g * 0.5363325363f)) + (b * 0.0514459929f));
  let m = ((r * 0.2119034982f) + ((g * 0.6806995451f) + (b * 0.1073969566f)));
  let s = (((r * 0.0883024619f) + (g * 0.2817188376f)) + (b * 0.6299787005f));
  let l_ = (sign(l) * pow(abs(l), 0.3333333333333333f));
  let m_ = (sign(m) * pow(abs(m), 0.3333333333333333f));
  let s_ = (sign(s) * pow(abs(s), 0.3333333333333333f));
  return vec3f((((l_ * 0.2104542553f) + (m_ * 0.793617785f)) - (s_ * 0.0040720468f)), (((l_ * 1.9779984951f) - (m_ * 2.428592205f)) + (s_ * 0.4505937099f)), (((l_ * 0.0259040371f) + (m_ * 0.7827717662f)) - (s_ * 0.808675766f)));
}

fn oklabToOklch(lab: vec3f) -> vec3f {
  let L = lab.x;
  let a = lab.y;
  let b = lab.z;
  let C = sqrt(((a * a) + (b * b)));
  let h = atan2(b, a);
  return vec3f(L, C, h);
}

fn awMix(a: vec3f, b: vec3f, wA: f32, wB: f32, sw: f32) -> vec3f {
  return (((a * wA) + (b * wB)) / sw);
}

fn oklchToOklab(lch: vec3f) -> vec3f {
  let L = lch.x;
  let C = lch.y;
  let h = lch.z;
  return vec3f(L, (C * cos(h)), (C * sin(h)));
}

fn oklabToRgb(lab: vec3f) -> vec3f {
  let L = lab.x;
  let a = lab.y;
  let b = lab.z;
  let l_ = ((L + (a * 0.3963377774f)) + (b * 0.2158037573f));
  let m_ = ((L - (a * 0.1055613458f)) - (b * 0.0638541728f));
  let s_ = ((L - (a * 0.0894841775f)) - (b * 1.291485548f));
  let l = pow(l_, 3f);
  let m = pow(m_, 3f);
  let s = pow(s_, 3f);
  return vec3f((((l * 4.0767416621f) - (m * 3.3077115913f)) + (s * 0.2309699292f)), (((l * -1.2684380046f) + (m * 2.6097574011f)) - (s * 0.3413193965f)), (((l * -0.0041960863f) - (m * 0.7034186147f)) + (s * 1.707614701f)));
}

fn sRGBToP3(srgb: vec3f) -> vec3f {
  let r = (((srgb.x * 0.8224621f) + (srgb.y * 0.177538f)) + (srgb.z * 0f));
  let g = (((srgb.x * 0.0331941f) + (srgb.y * 0.9668058f)) + (srgb.z * 0f));
  let b = (((srgb.x * 0.0170826f) + (srgb.y * 0.0723974f)) + (srgb.z * 0.9105199f));
  return vec3f(r, g, b);
}

fn mixColors(colorA: vec4f, colorB: vec4f, t: f32) -> vec4f {
  let weightA = (colorA.w * (1f - t));
  let weightB = (colorB.w * t);
  let totalWeight = (weightA + weightB);
  let safeWeight = max(totalWeight, 1e-3f);
  let oklchA = oklabToOklch(rgbToOklab(p3ToSRGB(colorA.xyz)));
  let oklchB = oklabToOklch(rgbToOklab(p3ToSRGB(colorB.xyz)));
  let mixed = awMix(oklchA, oklchB, weightA, weightB, safeWeight);
  let rgb = sRGBToP3(oklabToRgb(oklchToOklab(mixed)));
  return vec4f(rgb, totalWeight);
}

struct struct_1 {
  colorA: vec4f,
  colorB: vec4f,
  colorC: vec4f,
  colorD: vec4f,
  colorSpace: f32,
  speed: f32,
  distortion: f32,
  seed: f32,
  _opacity: f32,
  _animTime: f32,
}

struct padded {
  pixelSize: f32,
  colorShift: f32,
  scanlineIntensity: f32,
  scanlineFrequency: f32,
  brightness: f32,
  contrast: f32,
  vignetteIntensity: f32,
  vignetteRadius: f32,
  _opacity: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

struct padded_1 {
  _opacity: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

struct struct_2 {
  time: f32,
  viewportSize: vec2f,
  logicalViewportSize: vec2f,
  aspect: f32,
  pointer: vec2f,
  pointerActive: f32,
}

struct combined {
  gradient: struct_1,
  crt: padded,
  root: padded_1,
  _sys: struct_2,
}

@group(0) @binding(0) var<uniform> uniforms: combined;

fn mxFade(t: f32) -> f32 {
  return (((t * t) * t) * ((t * ((t * 6f) - 15f)) + 10f));
}

fn mxRotl32(x: u32, k: i32) -> u32 {
  return ((x << u32(k)) | (x >> u32((32i - k))));
}

fn mxBjfinal(a0: u32, b0: u32, c0: u32) -> u32 {
  var a = a0;
  var b = b0;
  var c = c0;
  c = (c ^ b);
  c = (c - mxRotl32(b, 14i));
  a = (a ^ c);
  a = (a - mxRotl32(c, 11i));
  b = (b ^ a);
  b = (b - mxRotl32(a, 25i));
  c = (c ^ b);
  c = (c - mxRotl32(b, 16i));
  a = (a ^ c);
  a = (a - mxRotl32(c, 4i));
  b = (b ^ a);
  b = (b - mxRotl32(a, 14i));
  c = (c ^ b);
  c = (c - mxRotl32(b, 24i));
  return c;
}

fn mxHashInt2(x: i32, y: i32, z: i32) -> u32 {
  const len = 3u;
  let seed = ((3735928559u + (len << 2u)) + 13u);
  let a = (seed + u32(x));
  let b = (seed + u32(y));
  let c = (seed + u32(z));
  return mxBjfinal(a, b, c);
}

fn mxGradientFloat3(hash: u32, x: f32, y: f32, z: f32) -> f32 {
  let h = (hash & 15u);
  let u = select(y, x, (h < 8u));
  let inner = select(z, x, ((h == 12u) || (h == 14u)));
  let v = select(inner, y, (h < 4u));
  let uu = select(u, -(u), ((h & 1u) != 0u));
  let vv = select(v, -(v), ((h & 2u) != 0u));
  return (uu + vv);
}

fn mxTrilerp(v0: f32, v1: f32, v2: f32, v3: f32, v4: f32, v5: f32, v6: f32, v7: f32, s: f32, t: f32, r: f32) -> f32 {
  let s1 = (1f - s);
  let t1 = (1f - t);
  let r1 = (1f - r);
  return ((r1 * ((t1 * ((v0 * s1) + (v1 * s))) + (t * ((v2 * s1) + (v3 * s))))) + (r * ((t1 * ((v4 * s1) + (v5 * s))) + (t * ((v6 * s1) + (v7 * s))))));
}

fn mxGradientScale3d(v: f32) -> f32 {
  return (0.982f * v);
}

fn mxPerlinNoiseFloat3(p: vec3f) -> f32 {
  let X = i32(floor(p.x));
  let Y = i32(floor(p.y));
  let Z = i32(floor(p.z));
  let fx = (p.x - f32(X));
  let fy = (p.y - f32(Y));
  let fz = (p.z - f32(Z));
  let u = mxFade(fx);
  let v = mxFade(fy);
  let w = mxFade(fz);
  let result = mxTrilerp(mxGradientFloat3(mxHashInt2(X, Y, Z), fx, fy, fz), mxGradientFloat3(mxHashInt2((X + 1i), Y, Z), (fx - 1f), fy, fz), mxGradientFloat3(mxHashInt2(X, (Y + 1i), Z), fx, (fy - 1f), fz), mxGradientFloat3(mxHashInt2((X + 1i), (Y + 1i), Z), (fx - 1f), (fy - 1f), fz), mxGradientFloat3(mxHashInt2(X, Y, (Z + 1i)), fx, fy, (fz - 1f)), mxGradientFloat3(mxHashInt2((X + 1i), Y, (Z + 1i)), (fx - 1f), fy, (fz - 1f)), mxGradientFloat3(mxHashInt2(X, (Y + 1i), (Z + 1i)), fx, (fy - 1f), (fz - 1f)), mxGradientFloat3(mxHashInt2((X + 1i), (Y + 1i), (Z + 1i)), (fx - 1f), (fy - 1f), (fz - 1f)), u, v, w);
  return mxGradientScale3d(result);
}

fn mxNoiseFloat3(p: vec3f) -> f32 {
  return mxPerlinNoiseFloat3(p);
}

fn flowingFactors(baseUV: vec2f, viewport: vec2f, distortion: f32, seed: f32, animTime: f32) -> vec3f {
  let t = (animTime * 0.075f);
  let aspect = (viewport.x / viewport.y);
  let uv0 = (baseUV - 0.5f);
  let seedOff = (seed * 0.17f);
  let noiseVal = mxNoiseFloat3(vec3f(((uv0.x * 0.8f) + (t * 0.4f)), ((uv0.y * 0.8f) - (t * 0.25f)), seedOff));
  let angle = ((noiseVal * 12.566370614359172f) * distortion);
  let uvCorr = vec2f(uv0.x, (uv0.y / aspect));
  let ca = cos(angle);
  let sa = sin(angle);
  let rotX = ((uvCorr.x * ca) - (uvCorr.y * sa));
  let rotY = (((uvCorr.x * sa) + (uvCorr.y * ca)) * aspect);
  let ws = (t * 2f);
  let warpX = (rotX + ((sin(((rotY * 5f) + ws)) / 50f) * distortion));
  let warpY = (rotY + ((sin(((warpX * 7.5f) + ws)) / 25f) * distortion));
  let wp1 = vec3f((warpX * 2f), (warpY * 2f), ((t * 0.5f) + seedOff));
  let wx1 = mxNoiseFloat3((wp1 + vec3f(5.199999809265137, 1.2999999523162842, 0)));
  let wy1 = mxNoiseFloat3((wp1 + vec3f(1.7000000476837158, 9.199999809265137, 0)));
  let dw1X = (warpX + ((wx1 * 0.25f) * distortion));
  let dw1Y = (warpY + ((wy1 * 0.25f) * distortion));
  let wp2 = vec3f((dw1X * 1.5f), (dw1Y * 1.5f), ((t * 0.3f) + seedOff));
  let wx2 = mxNoiseFloat3((wp2 + vec3f(8.300000190734863, 2.799999952316284, 0)));
  let wy2 = mxNoiseFloat3((wp2 + vec3f(3.0999999046325684, 7.400000095367432, 0)));
  let dw2X = (dw1X + ((wx2 * 0.2f) * distortion));
  let dw2Y = (dw1Y + ((wy2 * 0.2f) * distortion));
  let zoneNoise = mxNoiseFloat3(vec3f((dw2X * 1.8f), (dw2Y * 1.8f), ((t * 0.3f) + seedOff)));
  let edgeHardness = pow(((wx1 * 0.5f) + 0.5f), 1.5f);
  let edgeWidth = mix(0.5f, 8e-3f, edgeHardness);
  let t1 = smoothstep((edgeWidth * -1f), edgeWidth, zoneNoise);
  let t2 = smoothstep((edgeWidth * -1f), edgeWidth, wy1);
  let foldMask1 = (1f - abs(((t1 * 2f) - 1f)));
  let foldMask2 = (1f - abs(((t2 * 2f) - 1f)));
  let foldHighlight = (max(foldMask1, foldMask2) * edgeHardness);
  let surfaceLight = ((((wx2 * 0.5f) + 0.5f) * 0.12f) + 0.94f);
  let litScale = (surfaceLight * (1f + (foldHighlight * 0.35f)));
  return vec3f(t1, t2, litScale);
}

struct rtt_rtt_0_Input {
  @location(0) uv: vec2f,
}

@fragment fn rtt_rtt_0(in: rtt_rtt_0_Input) -> @location(0)  vec4f {
  var uv = in.uv;
  return blend_normal(vec4f(0.0, 0.0, 0.0, 0.0), flowingCompose(mixColors(mixColors(uniforms.gradient.colorA, uniforms.gradient.colorB, (flowingFactors(uv, uniforms._sys.viewportSize, uniforms.gradient.distortion, uniforms.gradient.seed, uniforms.gradient._animTime)).x), mixColors(uniforms.gradient.colorC, uniforms.gradient.colorD, (flowingFactors(uv, uniforms._sys.viewportSize, uniforms.gradient.distortion, uniforms.gradient.seed, uniforms.gradient._animTime)).x), (flowingFactors(uv, uniforms._sys.viewportSize, uniforms.gradient.distortion, uniforms.gradient.seed, uniforms.gradient._animTime)).y), (flowingFactors(uv, uniforms._sys.viewportSize, uniforms.gradient.distortion, uniforms.gradient.seed, uniforms.gradient._animTime)).z), 1.0);
}
`;

const FINAL_WGSL = /* wgsl */ `
struct _Output {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
}

@vertex fn item(@builtin(vertex_index) vertexIndex: u32) -> _Output {
  const pos = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  const uv = array<vec2f, 3>(vec2f(0, 1), vec2f(2, 1), vec2f(0, -1));

  return _Output(vec4f(pos[vertexIndex], 0, 1), uv[vertexIndex]);
}

fn flowingCompose(base: vec4f, litScale: f32) -> vec4f {
  let lit = clamp((base.xyz * litScale), vec3f(), vec3f(1));
  return vec4f(lit, base.w);
}

fn p3ToSRGB(p3: vec3f) -> vec3f {
  let r = (((p3.x * 1.2249401f) - (p3.y * 0.2249404f)) - (p3.z * 0f));
  let g = (((p3.x * -0.0420569f) + (p3.y * 1.0420571f)) + (p3.z * 0f));
  let b = (((p3.x * -0.0196376f) - (p3.y * 0.0786361f)) + (p3.z * 1.0982735f));
  return vec3f(r, g, b);
}

fn rgbToOklab(rgb: vec3f) -> vec3f {
  let r = rgb.x;
  let g = rgb.y;
  let b = rgb.z;
  let l = (((r * 0.4122214708f) + (g * 0.5363325363f)) + (b * 0.0514459929f));
  let m = ((r * 0.2119034982f) + ((g * 0.6806995451f) + (b * 0.1073969566f)));
  let s = (((r * 0.0883024619f) + (g * 0.2817188376f)) + (b * 0.6299787005f));
  let l_ = (sign(l) * pow(abs(l), 0.3333333333333333f));
  let m_ = (sign(m) * pow(abs(m), 0.3333333333333333f));
  let s_ = (sign(s) * pow(abs(s), 0.3333333333333333f));
  return vec3f((((l_ * 0.2104542553f) + (m_ * 0.793617785f)) - (s_ * 0.0040720468f)), (((l_ * 1.9779984951f) - (m_ * 2.428592205f)) + (s_ * 0.4505937099f)), (((l_ * 0.0259040371f) + (m_ * 0.7827717662f)) - (s_ * 0.808675766f)));
}

fn oklabToOklch(lab: vec3f) -> vec3f {
  let L = lab.x;
  let a = lab.y;
  let b = lab.z;
  let C = sqrt(((a * a) + (b * b)));
  let h = atan2(b, a);
  return vec3f(L, C, h);
}

fn awMix(a: vec3f, b: vec3f, wA: f32, wB: f32, sw: f32) -> vec3f {
  return (((a * wA) + (b * wB)) / sw);
}

fn oklchToOklab(lch: vec3f) -> vec3f {
  let L = lch.x;
  let C = lch.y;
  let h = lch.z;
  return vec3f(L, (C * cos(h)), (C * sin(h)));
}

fn oklabToRgb(lab: vec3f) -> vec3f {
  let L = lab.x;
  let a = lab.y;
  let b = lab.z;
  let l_ = ((L + (a * 0.3963377774f)) + (b * 0.2158037573f));
  let m_ = ((L - (a * 0.1055613458f)) - (b * 0.0638541728f));
  let s_ = ((L - (a * 0.0894841775f)) - (b * 1.291485548f));
  let l = pow(l_, 3f);
  let m = pow(m_, 3f);
  let s = pow(s_, 3f);
  return vec3f((((l * 4.0767416621f) - (m * 3.3077115913f)) + (s * 0.2309699292f)), (((l * -1.2684380046f) + (m * 2.6097574011f)) - (s * 0.3413193965f)), (((l * -0.0041960863f) - (m * 0.7034186147f)) + (s * 1.707614701f)));
}

fn sRGBToP3(srgb: vec3f) -> vec3f {
  let r = (((srgb.x * 0.8224621f) + (srgb.y * 0.177538f)) + (srgb.z * 0f));
  let g = (((srgb.x * 0.0331941f) + (srgb.y * 0.9668058f)) + (srgb.z * 0f));
  let b = (((srgb.x * 0.0170826f) + (srgb.y * 0.0723974f)) + (srgb.z * 0.9105199f));
  return vec3f(r, g, b);
}

fn mixColors(colorA: vec4f, colorB: vec4f, t: f32) -> vec4f {
  let weightA = (colorA.w * (1f - t));
  let weightB = (colorB.w * t);
  let totalWeight = (weightA + weightB);
  let safeWeight = max(totalWeight, 1e-3f);
  let oklchA = oklabToOklch(rgbToOklab(p3ToSRGB(colorA.xyz)));
  let oklchB = oklabToOklch(rgbToOklab(p3ToSRGB(colorB.xyz)));
  let mixed = awMix(oklchA, oklchB, weightA, weightB, safeWeight);
  let rgb = sRGBToP3(oklabToRgb(oklchToOklab(mixed)));
  return vec4f(rgb, totalWeight);
}

struct struct_1 {
  colorA: vec4f,
  colorB: vec4f,
  colorC: vec4f,
  colorD: vec4f,
  colorSpace: f32,
  speed: f32,
  distortion: f32,
  seed: f32,
  _opacity: f32,
  _animTime: f32,
}

struct padded {
  pixelSize: f32,
  colorShift: f32,
  scanlineIntensity: f32,
  scanlineFrequency: f32,
  brightness: f32,
  contrast: f32,
  vignetteIntensity: f32,
  vignetteRadius: f32,
  _opacity: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

struct padded_1 {
  _opacity: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32,
}

struct struct_2 {
  time: f32,
  viewportSize: vec2f,
  logicalViewportSize: vec2f,
  aspect: f32,
  pointer: vec2f,
  pointerActive: f32,
}

struct combined {
  gradient: struct_1,
  crt: padded,
  root: padded_1,
  _sys: struct_2,
}

@group(0) @binding(0) var<uniform> uniforms: combined;

fn mxFade(t: f32) -> f32 {
  return (((t * t) * t) * ((t * ((t * 6f) - 15f)) + 10f));
}

fn mxRotl32(x: u32, k: i32) -> u32 {
  return ((x << u32(k)) | (x >> u32((32i - k))));
}

fn mxBjfinal(a0: u32, b0: u32, c0: u32) -> u32 {
  var a = a0;
  var b = b0;
  var c = c0;
  c = (c ^ b);
  c = (c - mxRotl32(b, 14i));
  a = (a ^ c);
  a = (a - mxRotl32(c, 11i));
  b = (b ^ a);
  b = (b - mxRotl32(a, 25i));
  c = (c ^ b);
  c = (c - mxRotl32(b, 16i));
  a = (a ^ c);
  a = (a - mxRotl32(c, 4i));
  b = (b ^ a);
  b = (b - mxRotl32(a, 14i));
  c = (c ^ b);
  c = (c - mxRotl32(b, 24i));
  return c;
}

fn mxHashInt2(x: i32, y: i32, z: i32) -> u32 {
  const len = 3u;
  let seed = ((3735928559u + (len << 2u)) + 13u);
  let a = (seed + u32(x));
  let b = (seed + u32(y));
  let c = (seed + u32(z));
  return mxBjfinal(a, b, c);
}

fn mxGradientFloat3(hash: u32, x: f32, y: f32, z: f32) -> f32 {
  let h = (hash & 15u);
  let u = select(y, x, (h < 8u));
  let inner = select(z, x, ((h == 12u) || (h == 14u)));
  let v = select(inner, y, (h < 4u));
  let uu = select(u, -(u), ((h & 1u) != 0u));
  let vv = select(v, -(v), ((h & 2u) != 0u));
  return (uu + vv);
}

fn mxTrilerp(v0: f32, v1: f32, v2: f32, v3: f32, v4: f32, v5: f32, v6: f32, v7: f32, s: f32, t: f32, r: f32) -> f32 {
  let s1 = (1f - s);
  let t1 = (1f - t);
  let r1 = (1f - r);
  return ((r1 * ((t1 * ((v0 * s1) + (v1 * s))) + (t * ((v2 * s1) + (v3 * s))))) + (r * ((t1 * ((v4 * s1) + (v5 * s))) + (t * ((v6 * s1) + (v7 * s))))));
}

fn mxGradientScale3d(v: f32) -> f32 {
  return (0.982f * v);
}

fn mxPerlinNoiseFloat3(p: vec3f) -> f32 {
  let X = i32(floor(p.x));
  let Y = i32(floor(p.y));
  let Z = i32(floor(p.z));
  let fx = (p.x - f32(X));
  let fy = (p.y - f32(Y));
  let fz = (p.z - f32(Z));
  let u = mxFade(fx);
  let v = mxFade(fy);
  let w = mxFade(fz);
  let result = mxTrilerp(mxGradientFloat3(mxHashInt2(X, Y, Z), fx, fy, fz), mxGradientFloat3(mxHashInt2((X + 1i), Y, Z), (fx - 1f), fy, fz), mxGradientFloat3(mxHashInt2(X, (Y + 1i), Z), fx, (fy - 1f), fz), mxGradientFloat3(mxHashInt2((X + 1i), (Y + 1i), Z), (fx - 1f), (fy - 1f), fz), mxGradientFloat3(mxHashInt2(X, Y, (Z + 1i)), fx, fy, (fz - 1f)), mxGradientFloat3(mxHashInt2((X + 1i), Y, (Z + 1i)), (fx - 1f), fy, (fz - 1f)), mxGradientFloat3(mxHashInt2(X, (Y + 1i), (Z + 1i)), fx, (fy - 1f), (fz - 1f)), mxGradientFloat3(mxHashInt2((X + 1i), (Y + 1i), (Z + 1i)), (fx - 1f), (fy - 1f), (fz - 1f)), u, v, w);
  return mxGradientScale3d(result);
}

fn mxNoiseFloat3(p: vec3f) -> f32 {
  return mxPerlinNoiseFloat3(p);
}

fn flowingFactors(baseUV: vec2f, viewport: vec2f, distortion: f32, seed: f32, animTime: f32) -> vec3f {
  let t = (animTime * 0.075f);
  let aspect = (viewport.x / viewport.y);
  let uv0 = (baseUV - 0.5f);
  let seedOff = (seed * 0.17f);
  let noiseVal = mxNoiseFloat3(vec3f(((uv0.x * 0.8f) + (t * 0.4f)), ((uv0.y * 0.8f) - (t * 0.25f)), seedOff));
  let angle = ((noiseVal * 12.566370614359172f) * distortion);
  let uvCorr = vec2f(uv0.x, (uv0.y / aspect));
  let ca = cos(angle);
  let sa = sin(angle);
  let rotX = ((uvCorr.x * ca) - (uvCorr.y * sa));
  let rotY = (((uvCorr.x * sa) + (uvCorr.y * ca)) * aspect);
  let ws = (t * 2f);
  let warpX = (rotX + ((sin(((rotY * 5f) + ws)) / 50f) * distortion));
  let warpY = (rotY + ((sin(((warpX * 7.5f) + ws)) / 25f) * distortion));
  let wp1 = vec3f((warpX * 2f), (warpY * 2f), ((t * 0.5f) + seedOff));
  let wx1 = mxNoiseFloat3((wp1 + vec3f(5.199999809265137, 1.2999999523162842, 0)));
  let wy1 = mxNoiseFloat3((wp1 + vec3f(1.7000000476837158, 9.199999809265137, 0)));
  let dw1X = (warpX + ((wx1 * 0.25f) * distortion));
  let dw1Y = (warpY + ((wy1 * 0.25f) * distortion));
  let wp2 = vec3f((dw1X * 1.5f), (dw1Y * 1.5f), ((t * 0.3f) + seedOff));
  let wx2 = mxNoiseFloat3((wp2 + vec3f(8.300000190734863, 2.799999952316284, 0)));
  let wy2 = mxNoiseFloat3((wp2 + vec3f(3.0999999046325684, 7.400000095367432, 0)));
  let dw2X = (dw1X + ((wx2 * 0.2f) * distortion));
  let dw2Y = (dw1Y + ((wy2 * 0.2f) * distortion));
  let zoneNoise = mxNoiseFloat3(vec3f((dw2X * 1.8f), (dw2Y * 1.8f), ((t * 0.3f) + seedOff)));
  let edgeHardness = pow(((wx1 * 0.5f) + 0.5f), 1.5f);
  let edgeWidth = mix(0.5f, 8e-3f, edgeHardness);
  let t1 = smoothstep((edgeWidth * -1f), edgeWidth, zoneNoise);
  let t2 = smoothstep((edgeWidth * -1f), edgeWidth, wy1);
  let foldMask1 = (1f - abs(((t1 * 2f) - 1f)));
  let foldMask2 = (1f - abs(((t2 * 2f) - 1f)));
  let foldHighlight = (max(foldMask1, foldMask2) * edgeHardness);
  let surfaceLight = ((((wx2 * 0.5f) + 0.5f) * 0.12f) + 0.94f);
  let litScale = (surfaceLight * (1f + (foldHighlight * 0.35f)));
  return vec3f(t1, t2, litScale);
}

fn unpremultiplyAlpha(color: vec4f) -> vec4f {
  let alpha = color.w;
  let straightRGB = select(vec3f(), (color.xyz / alpha), (alpha > 1e-3f));
  return vec4f(straightRGB, alpha);
}

fn crtCompose(redSample: vec4f, greenSample: vec4f, blueSample: vec4f, uv: vec2f, aspect: f32, pixelSize: f32, scanlineIntensity: f32, scanlineFrequency: f32, brightness: f32, contrast: f32, vignetteIntensity: f32, vignetteRadius: f32) -> vec4f {
  let baseColor = vec3f(redSample.x, greenSample.y, blueSample.z);
  let adjustedColor = ((((baseColor - vec3f(0.5)) * contrast) + vec3f(0.5)) * brightness);
  let scanlinePosition = (uv.y * scanlineFrequency);
  let scanlineWave = sin((scanlinePosition * 6.28318f));
  let scanlineEffect = (1f - (scanlineIntensity * ((scanlineWave * 0.5f) + 0.5f)));
  let scanlinedColor = (adjustedColor * scanlineEffect);
  let phosphorScale = (pixelSize * 0.5f);
  let pixelPhase = fract((uv * phosphorScale));
  let redMask = ((sin((pixelPhase.x * 6.28318f)) * 0.1f) + 0.95f);
  let greenMask = ((sin(((pixelPhase.x * 6.28318f) + 2.09f)) * 0.1f) + 0.95f);
  let blueMask = ((sin(((pixelPhase.x * 6.28318f) + 4.18f)) * 0.1f) + 0.95f);
  let phosphorColor = vec3f((scanlinedColor.x * redMask), (scanlinedColor.y * greenMask), (scanlinedColor.z * blueMask));
  let centeredUV = (uv - vec2f(0.5));
  let aspectCorrectedUV = vec2f((centeredUV.x * aspect), centeredUV.y);
  let vignetteDistance = length(aspectCorrectedUV);
  let innerEdge = (1f - (vignetteRadius * 0.9f));
  let outerEdge = (innerEdge + 0.5f);
  let vignetteValue = (1f - smoothstep(innerEdge, outerEdge, vignetteDistance));
  let vignette = mix(1f, vignetteValue, vignetteIntensity);
  let finalColor = (phosphorColor * vignette);
  return vec4f(finalColor.x, finalColor.y, finalColor.z, 1f);
}

fn crtSampleUV(uv: vec2f, colorShift: f32, dir: f32) -> vec2f {
  let scaledColorShift = (colorShift * 2e-3f);
  return vec2f((uv.x + (scaledColorShift * dir)), uv.y);
}

fn tone_linear(color: vec3f) -> vec3f {
  return vec3f(color.x, color.y, color.z);
}

fn linearToSrgb(color: vec3f) -> vec3f {
  let a = ((pow(color, vec3f(0.41666001081466675)) * 1.055f) - 0.055f);
  let b = (color * 12.92f);
  let factor = (color <= vec3f(0.0031308000907301903));
  return select(a, b, factor);
}

@group(1) @binding(0) var rtt_0: texture_2d<f32>;

@group(2) @binding(0) var linearClamp: sampler;

struct final_Input {
  @location(0) uv: vec2f,
}

@fragment fn final_1(in: final_Input) -> @location(0)  vec4f {
  var uv = in.uv;
  var composed_0 = mix(flowingCompose(mixColors(mixColors(uniforms.gradient.colorA, uniforms.gradient.colorB, (flowingFactors(uv, uniforms._sys.viewportSize, uniforms.gradient.distortion, uniforms.gradient.seed, uniforms.gradient._animTime)).x), mixColors(uniforms.gradient.colorC, uniforms.gradient.colorD, (flowingFactors(uv, uniforms._sys.viewportSize, uniforms.gradient.distortion, uniforms.gradient.seed, uniforms.gradient._animTime)).x), (flowingFactors(uv, uniforms._sys.viewportSize, uniforms.gradient.distortion, uniforms.gradient.seed, uniforms.gradient._animTime)).y), (flowingFactors(uv, uniforms._sys.viewportSize, uniforms.gradient.distortion, uniforms.gradient.seed, uniforms.gradient._animTime)).z), unpremultiplyAlpha(crtCompose(textureSample(rtt_0, linearClamp, crtSampleUV(uv, uniforms.crt.colorShift, 1.0)), textureSample(rtt_0, linearClamp, uv), textureSample(rtt_0, linearClamp, crtSampleUV(uv, uniforms.crt.colorShift, -1.0)), uv, uniforms._sys.aspect, uniforms.crt.pixelSize, uniforms.crt.scanlineIntensity, uniforms.crt.scanlineFrequency, uniforms.crt.brightness, uniforms.crt.contrast, uniforms.crt.vignetteIntensity, uniforms.crt.vignetteRadius)), uniforms.crt._opacity);
  return vec4f(linearToSrgb(tone_linear(composed_0.rgb)) * composed_0.a, composed_0.a);
}
`;

// uniforms (combined struct, 208 bytes), constants as traced on workos.com
const COLORS = [
  0.00328449, 0.0178861, 0.0840526, 1, // colorA #002555 (linear Display P3)
  0.0391623, 0.188344, 0.399579, 1, // colorB #117AAE
  0.00776463, 0.0422833, 0.257105, 1, // colorC #003B90
  0.00776463, 0.0422833, 0.257105, 1, // colorD #003B90
];
const SPEED = 10;

// Mounts the canvas into host and starts drawing; returns a function that removes it again.
export function mountFaceShader(host) {
  const shader = document.createElement("div");
  shader.className = "shader";
  const canvas = document.createElement("canvas");
  canvas.dataset.renderer = "shaders";
  shader.append(canvas);
  host.append(shader);
  let stopped = false, raf = 0, device = null;
  start().catch(() => {});
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    shader.remove();
    device?.destroy();
  };

  async function start() {
    if (!navigator.gpu) return;
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter || stopped) return;
    device = await adapter.requestDevice();
    if (stopped) return device.destroy();

    // canvas size: CSS size of the face screen x min(devicePixelRatio, 2), as the library does
    const cssW = host.offsetWidth || 168, cssH = host.offsetHeight || 111;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(cssW * dpr)), h = Math.max(1, Math.round(cssH * dpr));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("webgpu");
    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: "premultiplied" });

    const ubuf = device.createBuffer({ size: 208, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const u = new Float32Array(52);
    u.set(COLORS, 0);
    u[16] = 1; u[17] = SPEED; u[18] = 0; u[19] = 52; u[20] = 1; // colorSpace, speed, distortion, seed, opacity
    u.set([117, 6.3, 0.2, 200, 1.5, 1, 1, 0.72, 1], 24); // CRT pixelSize, colorShift, scanlineIntensity/Frequency, brightness, contrast, vignetteIntensity/Radius, opacity
    u[36] = 1;
    u[42] = w; u[43] = h; u[44] = cssW; u[45] = cssH; u[46] = w / h; u[48] = 0.5; u[49] = 0.5;

    const rtt = device.createTexture({ size: [w, h], format: "rgba16float", usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING });
    const sampler = device.createSampler({ magFilter: "linear", minFilter: "linear", mipmapFilter: "linear", addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge" });
    const mod1 = device.createShaderModule({ code: RTT_WGSL });
    const mod2 = device.createShaderModule({ code: FINAL_WGSL });
    const p1 = device.createRenderPipeline({ layout: "auto", vertex: { module: mod1, entryPoint: "item" }, fragment: { module: mod1, entryPoint: "rtt_rtt_0", targets: [{ format: "rgba16float" }] } });
    const p2 = device.createRenderPipeline({ layout: "auto", vertex: { module: mod2, entryPoint: "item" }, fragment: { module: mod2, entryPoint: "final_1", targets: [{ format }] } });
    const bg1 = device.createBindGroup({ layout: p1.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubuf } }] });
    const bg2u = device.createBindGroup({ layout: p2.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubuf } }] });
    const bg2t = device.createBindGroup({ layout: p2.getBindGroupLayout(1), entries: [{ binding: 0, resource: rtt.createView() }] });
    const bg2s = device.createBindGroup({ layout: p2.getBindGroupLayout(2), entries: [{ binding: 0, resource: sampler }] });

    const t0 = performance.now();
    const frame = (now) => {
      if (stopped) return;
      const t = Math.max(0, (now - t0) / 1000);
      u[40] = t; // _sys.time, seconds
      u[21] = t * SPEED; // _animTime
      device.queue.writeBuffer(ubuf, 0, u.buffer, 0, 208);
      const enc = device.createCommandEncoder();
      let pass = enc.beginRenderPass({ colorAttachments: [{ view: rtt.createView(), loadOp: "clear", storeOp: "store", clearValue: [0, 0, 0, 0] }] });
      pass.setPipeline(p1); pass.setBindGroup(0, bg1); pass.draw(3); pass.end();
      pass = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), loadOp: "clear", storeOp: "store", clearValue: [0, 0, 0, 0] }] });
      pass.setPipeline(p2); pass.setBindGroup(0, bg2u); pass.setBindGroup(1, bg2t); pass.setBindGroup(2, bg2s); pass.draw(3); pass.end();
      device.queue.submit([enc.finish()]);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }
}
