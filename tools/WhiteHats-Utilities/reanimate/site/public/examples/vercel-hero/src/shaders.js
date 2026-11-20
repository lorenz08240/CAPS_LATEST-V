// The hero's GLSL ES 3.00 shaders, copied unchanged from vercel.com's hero worker (the WebGL2 port of
// its WGSL renderer). Fragment shaders are compiled as FRAGMENT_PREFIX + COMMON + body, as on vercel.com.
// Do not edit by hand: .reanimate/vercel-hero/tools/extract-shaders.mjs writes this file.

export const FRAGMENT_PREFIX = "#version 300 es\nprecision highp float; precision highp int;\n";

// Shared helpers prepended to every fragment shader (after the #version line).
export const COMMON = `
// ---------------------------------------------------------------------------
// WebGL FBO read helper (Y-flip)
// ---------------------------------------------------------------------------
// WebGL2 framebuffers store row 0 at the BOTTOM, but every pass computes texel coords in the
// WGSL/WebGPU TOP-LEFT space (pixel = v_uv * resolution, with v_uv top-left from FULLSCREEN_VERT).
// A fragment that computed content for logical row Y is rasterized to physical row (H-1-Y), so a
// later texelFetch at row Y would read the vertically MIRRORED content. Wrap reads of an
// intermediate render-target (light_sources, radiance) with this to flip the row back. NOT needed
// for floor_noise (tiles isotropically) or the CPU-uploaded LED data texture (row-per-LED).
ivec2 fboTexel(in highp sampler2D tex, in ivec2 coord) {
  return ivec2(coord.x, textureSize(tex, 0).y - 1 - coord.y);
}

// ---------------------------------------------------------------------------
// hash.wgsl
// ---------------------------------------------------------------------------
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// ---------------------------------------------------------------------------
// color-utils.wgsl
// ---------------------------------------------------------------------------
// OKLab transform matrices (column-major; identical layout to the WGSL mat3x3 constants).
const mat3 OK_INV_B = mat3(
  0.4121656120, 0.2118591070, 0.0883097947,
  0.5362752080, 0.6807189584, 0.2818474174,
  0.0514575653, 0.1074065790, 0.6302613616
);
const mat3 OK_FWD_B = mat3(
  4.0767245293, -1.2681437731, -0.0041119885,
  -3.3072168827, 2.6093323231, -0.7034763098,
  0.2307590544, -0.3411344290, 1.7068625689
);
const mat3 ACES_INPUT_MAT = mat3(
  0.59719, 0.07600, 0.02840,
  0.35458, 0.90834, 0.13383,
  0.04823, 0.01566, 0.83777
);
const mat3 ACES_OUTPUT_MAT = mat3(
  1.60475, -0.10208, -0.00327,
  -0.53108, 1.10813, -0.07276,
  -0.07367, -0.00605, 1.07602
);

vec3 rgb_to_oklab(vec3 c) {
  vec3 lms = OK_INV_B * c;
  return sign(lms) * pow(abs(lms), vec3(1.0 / 3.0));
}

vec3 oklab_to_rgb(vec3 c) {
  vec3 lms = c * c * c;
  return OK_FWD_B * lms;
}

vec3 col3(float v) {
  return rgb_to_oklab(vec3(v));
}

vec3 col3v(vec3 v) {
  return rgb_to_oklab(v);
}

vec3 rrt_and_odt_fit(vec3 v) {
  vec3 a = v * (v + 0.0245786) - vec3(0.000090537);
  vec3 b = v * (0.983729 * v + 0.4329510) + vec3(0.238081);
  return a / b;
}

vec3 aces_fitted(vec3 color) {
  vec3 c = ACES_INPUT_MAT * color;
  c = rrt_and_odt_fit(c);
  c = ACES_OUTPUT_MAT * c;
  return clamp(c, vec3(0.0), vec3(1.0));
}

vec3 linear_to_srgb_pow(vec3 color) {
  return pow(color, vec3(1.0 / 2.2));
}

// --- Tonemap operators -------------------------------------------------------
// Each maps LINEAR HDR -> LINEAR [0,1], EXCEPT AgX (a full display transform) which
// returns sRGB-display directly. The tonemap() dispatcher owns the sRGB encode so
// every branch ends display-ready and there is no double gamma correction.
const uint TONEMAP_ACES = 0u;
const uint TONEMAP_HABLE = 1u;
const uint TONEMAP_LOTTES = 2u;
const uint TONEMAP_AGX = 3u;
const uint TONEMAP_REINHARD = 4u;
const uint TONEMAP = TONEMAP_LOTTES;

vec3 tonemap_reinhard(vec3 c) {
  return c / (c + vec3(1.0));
}

vec3 hable_partial(vec3 x) {
  float a = 0.15;
  float b = 0.50;
  float c = 0.10;
  float d = 0.20;
  float e = 0.02;
  float f = 0.30;
  return ((x * (a * x + c * b) + d * e) / (x * (a * x + b) + d * f)) - e / f;
}

vec3 tonemap_hable(vec3 color) {
  float exposure_bias = 2.0;
  vec3 curr = hable_partial(color * exposure_bias);
  vec3 white_scale = vec3(1.0) / hable_partial(vec3(11.2));
  return curr * white_scale;
}

vec3 tonemap_lottes(vec3 x) {
  float a = 1.6;
  float d = 0.977;
  float hdr_max = 8.0;
  float mid_in = 0.18;
  float mid_out = 0.267;
  float b =
    (-pow(mid_in, a) + pow(hdr_max, a) * mid_out)
    / ((pow(hdr_max, a * d) - pow(mid_in, a * d)) * mid_out);
  float c =
    (pow(hdr_max, a * d) * pow(mid_in, a) - pow(hdr_max, a) * pow(mid_in, a * d) * mid_out)
    / ((pow(hdr_max, a * d) - pow(mid_in, a * d)) * mid_out);
  return pow(x, vec3(a)) / (pow(x, vec3(a * d)) * b + c);
}

// Minimal AgX (Benjamin Wrensch / iolite-engine). Returns sRGB-display-encoded.
vec3 agx_tonemap(vec3 color) {
  mat3 agx_mat = mat3(
    0.842479062253094, 0.0423282422610123, 0.0423756549057051,
    0.0784335999999992, 0.878468636469772, 0.0784336,
    0.0792237451477643, 0.0791661274605434, 0.879142973793104
  );
  mat3 agx_mat_inv = mat3(
    1.19687900512017, -0.0528968517574562, -0.0529716355144438,
    -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
    -0.0990297440797205, -0.0989611768448433, 1.15107367264116
  );
  float min_ev = -12.47393;
  float max_ev = 4.026069;
  vec3 val = agx_mat * color;
  val = clamp(log2(max(val, vec3(1e-10))), vec3(min_ev), vec3(max_ev));
  val = (val - min_ev) / (max_ev - min_ev);
  // 6th-order polynomial fit of the AgX contrast sigmoid.
  vec3 x2 = val * val;
  vec3 x4 = x2 * x2;
  vec3 res =
    15.5 * x4 * x2 - 40.14 * x4 * val + 31.96 * x4
    - 6.868 * x2 * val + 0.4298 * x2 + 0.1191 * val - 0.00232;
  res = agx_mat_inv * res;
  return clamp(res, vec3(0.0), vec3(1.0));
}

// Dispatcher: LINEAR HDR in -> sRGB-display out. Default branch (ACES) is byte-identical
// to the previous linear_to_srgb_pow(aces_fitted(color)).
vec3 tonemap(vec3 color) {
  // Clamp to the finite rgba16float range, not just max(_, 0): a bright COLORED LED in
  // dark mode can overflow the half-float light texture to +Inf, which would reach the
  // pow-based tonemaps and yield Inf/Inf = NaN -> a black ("burned") pixel. Anything past
  // 65504 already saturates the tonemap to white, so this is lossless for finite values
  // and turns the burn back into the intended white.
  vec3 c = clamp(color, vec3(0.0), vec3(65504.0));
  if (TONEMAP == TONEMAP_AGX) {
    return agx_tonemap(c);
  }
  vec3 mapped;
  if (TONEMAP == TONEMAP_HABLE) {
    mapped = tonemap_hable(c);
  } else if (TONEMAP == TONEMAP_LOTTES) {
    mapped = tonemap_lottes(c);
  } else if (TONEMAP == TONEMAP_REINHARD) {
    mapped = tonemap_reinhard(c);
  } else {
    mapped = aces_fitted(c);
  }
  return linear_to_srgb_pow(clamp(mapped, vec3(0.0), vec3(1.0)));
}

float value_remap(float value, float minIn, float maxIn, float minOut, float maxOut) {
  return minOut + (value - minIn) * (maxOut - minOut) / (maxIn - minIn);
}

float value_remap_clamp(float value, float minIn, float maxIn, float minOut, float maxOut) {
  float remapped = value_remap(value, minIn, maxIn, minOut, maxOut);
  return clamp(remapped, min(minOut, maxOut), max(minOut, maxOut));
}

// ---------------------------------------------------------------------------
// geometry.wgsl
// ---------------------------------------------------------------------------
float sdf_segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float sdf_triangle_vertices(vec2 p, vec2 a, vec2 b, vec2 c) {
  float d = min(min(sdf_segment(p, a, b), sdf_segment(p, b, c)), sdf_segment(p, c, a));
  vec2 edge0 = b - a;
  vec2 edge1 = c - b;
  vec2 edge2 = a - c;
  float side0 = edge0.x * (p.y - a.y) - edge0.y * (p.x - a.x);
  float side1 = edge1.x * (p.y - b.y) - edge1.y * (p.x - b.x);
  float side2 = edge2.x * (p.y - c.y) - edge2.y * (p.x - c.x);
  bool inside = (side0 <= 0.0 && side1 <= 0.0 && side2 <= 0.0) || (side0 >= 0.0 && side1 >= 0.0 && side2 >= 0.0);
  return inside ? -d : d;
}

// ---------------------------------------------------------------------------
// floor-falloff.wgsl
// ---------------------------------------------------------------------------
// Smooth value map: input at/below lo reads 0, at/above hi reads 1 (lo > hi inverts).
float value_map01(float value, float lo, float hi) {
  float denom = hi - lo;
  float safe_denom = abs(denom) < 0.0001 ? 0.001 : denom;
  return clamp((value - lo) / safe_denom, 0.0, 1.0);
}

// CLOSE: remap the light first (so it follows the light shape), then mask with a thin SDF
// band hugging the triangle to fake a thin line.
//   near = (outer-radius scale, intensity, light-map lo, light-map hi)
float near_falloff(
  float triangle_sdf,
  float near_light,
  float fade_inner,
  float circumradius,
  vec4 near,
  float band_power,
  float enabled
) {
  float mapped = value_map01(near_light, near.z, near.w);
  float near_outer = max(circumradius * near.x, fade_inner + 0.001);
  float near_fade = value_remap_clamp(triangle_sdf, near_outer, fade_inner, 0.0, 1.0);
  float band = pow(near_fade, max(band_power, 0.001));
  return mapped * band * near.y * enabled;
}

// MIDDLE: geometric SDF distance glow shaped by power/intensity, with a smoothstep SDF fade
// on top (zero slope at 0 so high intensity never reveals a hard cutout).
//   middle = (power, intensity, _, _)
float middle_falloff(
  float triangle_sdf,
  float fade_inner,
  float circumradius,
  float outer_scale,
  vec4 middle,
  float enabled
) {
  float middle_outer = max(circumradius * outer_scale, fade_inner + 0.001);
  float middle_fade = value_remap_clamp(triangle_sdf, middle_outer, fade_inner, 0.0, 1.0);
  float value = pow(middle_fade, max(middle.x, 0.001)) * middle.y;
  return value * smoothstep(0.0, 1.0, middle_fade) * enabled;
}

// FAR: pure light fade (no SDF). Remap radiance luminance, shape with the tail power, scale
// by intensity.
//   glow = (intensity, _, light-map lo, light-map hi)
float far_falloff(
  float near_light,
  vec4 glow,
  float power,
  float enabled
) {
  float mapped = value_map01(near_light, glow.z, glow.w);
  float shaped = pow(mapped, max(power, 0.001));
  return shaped * glow.x * enabled;
}
`;

// Fullscreen triangle with top-left-origin UVs, for the passes that draw it.
export const FULLSCREEN_VERT = `#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
  // Oversized triangle covering the clip rect, matching the WGSL passes' vertex array.
  vec2 positions[3] = vec2[3](
    vec2(-1.0, -3.0),
    vec2(-1.0, 1.0),
    vec2(3.0, 1.0)
  );
  vec2 p = positions[gl_VertexID];
  // Top-left-origin UV: flip Y so v_uv.y = 0 at the top of the image (WGSL/WebGPU
  // framebuffer convention). See the Y-FLIP CONVENTION note above.
  v_uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

// Bakes the scene SDF (LED segments and the black occluder) into the alpha of the light-sources target.
export const LIGHT_SOURCES_FRAG = `
layout(std140) uniform Config {
  vec2 resolution;
  float time;
  float floor_albedo;
  vec4 brush;
  vec4 colour;
  vec4 tunables;
  vec4 triangle;
  vec4 options;
  vec4 led_clip;
};

// LED storage buffer ported to a 2x72 RGBA32F data texture (column 0 = pos_brightness,
// column 1 = color). Sampled with texelFetch \u2014 no float-texture extension required.
uniform highp sampler2D u_leds;

in vec2 v_uv;
out vec4 frag_color;

const uint LED_COUNT = 72u;
// Keep the black occluder safely inside the visible triangle mesh.
const float OCCLUDER_INSET_PX = 4.0;

float signed_triangle_area(vec2 a, vec2 b, vec2 p) {
  vec2 edge = b - a;
  return edge.x * (p.y - a.y) - edge.y * (p.x - a.x);
}

bool inside_triangle(vec2 p, vec2 a, vec2 b, vec2 c) {
  float side0 = signed_triangle_area(a, b, p);
  float side1 = signed_triangle_area(b, c, p);
  float side2 = signed_triangle_area(c, a, p);
  return (side0 <= 0.0 && side1 <= 0.0 && side2 <= 0.0) || (side0 >= 0.0 && side1 >= 0.0 && side2 >= 0.0);
}

float segment_distance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float triangle_sdf(vec2 p, vec2 a, vec2 b, vec2 c) {
  float edge_dist = min(segment_distance(p, a, b), min(segment_distance(p, b, c), segment_distance(p, c, a)));
  return inside_triangle(p, a, b, c) ? -edge_dist : edge_dist;
}

void main() {
  vec2 pixel = v_uv * resolution;
  vec2 top = vec2(triangle.x, triangle.y - triangle.z);
  vec2 left = vec2(triangle.x - triangle.w, triangle.y + triangle.z * 0.5);
  vec2 right = vec2(triangle.x + triangle.w, triangle.y + triangle.z * 0.5);
  float tri_dist = triangle_sdf(pixel, top, left, right);
  // Optionally fill the canonical triangle interior as a black non-emissive surface/occluder.
  // LED RGB is overlaid by the generated emitter mesh after this SDF prepass.
  bool render_black_occluder = options.x > 0.5;
  float best_led_dist = 1e6;
  for (uint i = 0u; i < LED_COUNT; i = i + 1u) {
    vec4 led = texelFetch(u_leds, ivec2(0, int(i)), 0);
    vec2 delta = pixel - led.xy;
    vec2 edge_dir = vec2(cos(led.w), sin(led.w));
    vec2 edge_normal = vec2(-edge_dir.y, edge_dir.x);
    vec2 led_local = vec2(dot(delta, edge_dir), dot(delta, edge_normal));
    float led_half_length = options.z;
    float led_half_thickness = options.w;
    float led_dist = max(
      abs(led_local.x) - led_half_length,
      abs(led_local.y) - led_half_thickness
    );
    // triangle_sdf is negative inside; positive inset moves only the LED SDF boundary inward.
    float led_clip_dist = tri_dist + led_clip.y;
    best_led_dist = min(best_led_dist, max(led_dist, led_clip_dist));
  }
  // triangle_sdf is negative inside; adding 4px moves only the black occluder boundary inward.
  float inset_occluder_dist = tri_dist + OCCLUDER_INSET_PX;
  float occluder_dist = render_black_occluder ? inset_occluder_dist : 1e6;
  float best_dist = min(best_led_dist, occluder_dist);
  // The fullscreen pass initializes the SDF/occluder contract. LED RGB is
  // written afterward by the generated emitter mesh, including split corner caps
  // that meet on each triangle-vertex bisector.
  frag_color = vec4(vec3(0.0), best_dist);
}
`;

// The 72 LED quads plus the three split corner caps.
export const LED_EMITTERS_VERT = `#version 300 es
precision highp float;

layout(std140) uniform Config {
  vec2 resolution;
  float time;
  float floor_albedo;
  vec4 brush;
  vec4 colour;
  vec4 tunables;
  vec4 triangle;
  vec4 options;
  vec4 led_clip;
};

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_local;
layout(location = 2) in float a_led_index;

out vec2 v_local;
out float v_led_index;
// Top-left-origin pixel space, forwarded so the fragment reconstructs WGSL's @builtin(position).
out vec2 v_pixel;

void main() {
  vec2 clip = (a_position / resolution) * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  v_local = a_local;
  v_led_index = a_led_index;
  v_pixel = a_position;
}
`;

// Writes each LED's colour times brightness into the light-sources target (RGB only).
export const LED_EMITTERS_FRAG = `
layout(std140) uniform Config {
  vec2 resolution;
  float time;
  float floor_albedo;
  vec4 brush;
  vec4 colour;
  vec4 tunables;
  vec4 triangle;
  vec4 options;
  vec4 led_clip;
};

// LED storage buffer ported to a 2x72 RGBA32F data texture (column 0 = pos_brightness,
// column 1 = color). Sampled with texelFetch \u2014 no float-texture extension required.
uniform highp sampler2D u_leds;

in vec2 v_local;
in float v_led_index;
in vec2 v_pixel;
out vec4 frag_color;

const uint LED_COUNT = 72u;

float signed_triangle_area(vec2 a, vec2 b, vec2 p) {
  vec2 edge = b - a;
  return edge.x * (p.y - a.y) - edge.y * (p.x - a.x);
}

bool inside_triangle(vec2 p, vec2 a, vec2 b, vec2 c) {
  float side0 = signed_triangle_area(a, b, p);
  float side1 = signed_triangle_area(b, c, p);
  float side2 = signed_triangle_area(c, a, p);
  return (side0 <= 0.0 && side1 <= 0.0 && side2 <= 0.0) || (side0 >= 0.0 && side1 >= 0.0 && side2 >= 0.0);
}

float segment_distance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float triangle_sdf(vec2 p, vec2 a, vec2 b, vec2 c) {
  float edge_dist = min(segment_distance(p, a, b), min(segment_distance(p, b, c), segment_distance(p, c, a)));
  return inside_triangle(p, a, b, c) ? -edge_dist : edge_dist;
}

void main() {
  vec2 pixel = v_pixel;
  vec2 top = vec2(triangle.x, triangle.y - triangle.z);
  vec2 left = vec2(triangle.x - triangle.w, triangle.y + triangle.z * 0.5);
  vec2 right = vec2(triangle.x + triangle.w, triangle.y + triangle.z * 0.5);
  float tri_dist = triangle_sdf(pixel, top, left, right);
  // Positive expansion reveals emitter pixels outside the canonical triangle.
  if (tri_dist - led_clip.x > 0.0) {
    discard;
  }

  uint raw_index = uint(max(round(v_led_index), 0.0));
  uint i = min(raw_index, LED_COUNT - 1u);
  float n01 = clamp(texelFetch(u_leds, ivec2(0, int(i)), 0).z, 0.0, 1.0);
  float intensity = mix(tunables.y, tunables.z, n01);
  vec3 emit = texelFetch(u_leds, ivec2(1, int(i)), 0).rgb * tunables.x * intensity;
  // Alpha (the LED SDF) is masked off by colorMask (RGB only) -- the fullscreen prepass owns the
  // SDF -- so the led_dist that used to go here is never written. Skip computing it.
  frag_color = vec4(emit, 0.0);
}
`;

// Marches rays from every half-resolution probe through the light-sources SDF and gathers LED light.
export const DIRECT_RAYCAST_FRAG = `
layout(std140) uniform Config {
  vec4 tri_a_b;
  vec4 tri_c_target;
  vec4 size_steps;
  vec4 params;
  vec4 target_info;
};

uniform highp sampler2D light_sources_tex;

in vec2 v_uv;
out vec4 frag_color;

struct Interval { float start; float length; bool valid; };
struct TraceHit { vec3 rgb; float distance; bool hit; };

const uint MAX_RAYS = 24u;
// Jitter amplitude as a fraction of one stratum width. 1.0 = full-width: adjacent
// strata can swap which discrete LED they sample, maximizing per-pixel variance (the
// clumpy chroma/luma noise at low ray counts). The half-res to full cubic upsample
// already protects against banding, so we attenuate the jitter and let regular
// stratification carry the signal -- each ray stays near its stratum center and
// randomization only dithers residual stratum boundaries.
const float JITTER_AMPLITUDE = 0.7;
const float DT_PI = 3.141592653589793;
const float DT_EPSILON = 1e-5;

vec2 tri_a() { return tri_a_b.xy; }
vec2 tri_b() { return tri_a_b.zw; }
vec2 tri_c() { return tri_c_target.xy; }

float cross2(vec2 a, vec2 b) {
  return a.x * b.y - a.y * b.x;
}

float wrap_pi(float angle) {
  return atan(sin(angle), cos(angle));
}

float triangle_signed_area(vec2 a, vec2 b, vec2 c) {
  return cross2(b - a, c - a);
}

bool point_in_triangle(vec2 p, vec2 a, vec2 b, vec2 c) {
  float area = triangle_signed_area(a, b, c);
  if (abs(area) <= DT_EPSILON) {
    return false;
  }
  float inv_area = 1.0 / area;
  float u = cross2(b - p, c - p) * inv_area;
  float v = cross2(c - p, a - p) * inv_area;
  float w = 1.0 - u - v;
  return u >= -DT_EPSILON && v >= -DT_EPSILON && w >= -DT_EPSILON;
}

float segment_distance(vec2 p, vec2 a, vec2 b) {
  vec2 e = b - a;
  vec2 v = p - a;
  float h = clamp(dot(v, e) / max(dot(e, e), DT_EPSILON), 0.0, 1.0);
  return length(v - e * h);
}

float triangle_edge_distance(vec2 p, vec2 a, vec2 b, vec2 c) {
  return min(
    segment_distance(p, a, b),
    min(segment_distance(p, b, c), segment_distance(p, c, a))
  );
}

Interval angular_interval(vec2 p, vec2 a, vec2 b, vec2 c) {
  if (abs(triangle_signed_area(a, b, c)) <= DT_EPSILON) {
    return Interval(0.0, 0.0, false);
  }
  if (point_in_triangle(p, a, b, c)) {
    return Interval(0.0, 0.0, false);
  }
  if (triangle_edge_distance(p, a, b, c) <= size_steps.w) {
    return Interval(0.0, 0.0, false);
  }

  vec2 center = (a + b + c) / 3.0;
  float center_angle = atan(center.y - p.y, center.x - p.x);
  float ra = wrap_pi(atan(a.y - p.y, a.x - p.x) - center_angle);
  float rb = wrap_pi(atan(b.y - p.y, b.x - p.x) - center_angle);
  float rc = wrap_pi(atan(c.y - p.y, c.x - p.x) - center_angle);
  float min_rel = min(ra, min(rb, rc));
  float max_rel = max(ra, max(rb, rc));
  float len = max_rel - min_rel;
  if (!(len > DT_EPSILON) || len >= DT_PI) {
    return Interval(0.0, 0.0, false);
  }
  return Interval(wrap_pi(center_angle + min_rel), len, true);
}

// Interleaved gradient noise (Jimenez) -> [0,1] with blue-noise-like spectrum: spatially
// high-frequency, so the per-pixel ray jitter it drives reads as fine grain (not white-noise
// clumps) and is removed far better by the half-res to full cubic upsample + the floor dither.
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

vec4 load_light_source(vec2 sample_pos) {
  ivec2 dims = textureSize(light_sources_tex, 0);
  bool inside =
    sample_pos.x >= 0.0 && sample_pos.x < float(dims.x) &&
    sample_pos.y >= 0.0 && sample_pos.y < float(dims.y);
  if (!inside) {
    return vec4(0.0, 0.0, 0.0, 1000.0);
  }
  ivec2 px = clamp(ivec2(floor(sample_pos)), ivec2(0), dims - ivec2(1));
  return texelFetch(light_sources_tex, fboTexel(light_sources_tex, px), 0);
}

// Per-edge ray/segment invariants (edge vector, origin->edge offset, their 2D cross) that don't
// change across the ray sweep -- precomputed once per pixel and reused for all MAX_RAYS directions.
struct EdgePrecomp { vec2 e; vec2 diff; float cross_diff_e; };

EdgePrecomp precompute_edge(vec2 origin, vec2 p, vec2 q) {
  vec2 e = q - p;
  vec2 diff = p - origin;
  return EdgePrecomp(e, diff, cross2(diff, e));
}

// Closed-form ray (origin + t*dir, t > minStep) vs segment -- dir-dependent part only; returns
// t >= 0 at the hit or -1 (miss/parallel). One reciprocal feeds both t and u.
float ray_segment_t(vec2 dir, EdgePrecomp pre) {
  float denom = cross2(dir, pre.e);
  if (abs(denom) < DT_EPSILON) { return -1.0; }
  float inv = 1.0 / denom;
  float t = pre.cross_diff_e * inv;
  float u = cross2(pre.diff, dir) * inv;
  if (t < size_steps.z || u < 0.0 || u > 1.0) { return -1.0; }
  return t;
}

// Analytic: the LEDs sit on the triangle edges, and angular_interval already aimed this ray
// into the triangle's arc, so the nearest ray<->edge intersection is the first lit edge it
// can reach (nearest => the near edge occludes the far edges for free). One sample of the
// LED color there replaces the SDF sphere-march -- no SDF / .w channel needed at all.
TraceHit trace_light_source(vec2 origin, vec2 dir, EdgePrecomp pre_ab, EdgePrecomp pre_bc, EdgePrecomp pre_ca) {
  float t = 1e30;
  float t0 = ray_segment_t(dir, pre_ab);
  float t1 = ray_segment_t(dir, pre_bc);
  float t2 = ray_segment_t(dir, pre_ca);
  if (t0 >= 0.0) { t = min(t, t0); }
  if (t1 >= 0.0) { t = min(t, t1); }
  if (t2 >= 0.0) { t = min(t, t2); }
  if (t > 1e29) { return TraceHit(vec3(0.0), 0.0, false); }

  vec4 source = load_light_source(origin + dir * t);
  bool source_active = max(max(source.r, source.g), source.b) > params.w;
  if (source_active) {
    return TraceHit(source.rgb, t, true);
  }
  return TraceHit(vec3(0.0), 0.0, false);
}

void main() {
  float target_scale = max(target_info.x, 1e-4);
  // WGSL @builtin(position).xy (top-left pixel space of the half-res target) is
  // reconstructed from the top-left-origin v_uv times the target dims.
  vec2 frag_pos = v_uv * tri_c_target.zw;
  vec2 pixel_sim = frag_pos / target_scale;
  vec2 a = tri_a();
  vec2 b = tri_b();
  vec2 c = tri_c();
  Interval interval = angular_interval(pixel_sim, a, b, c);
  if (!interval.valid) {
    frag_color = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float jitter = (ign(frag_pos) - 0.5) * JITTER_AMPLITUDE;
  // The ray angle is exactly linear in i: angle = interval.start + interval.length * t with
  // t = (i + 0.5 + jitter) / MAX_RAYS. The clamp never triggers because jitter in [-0.35, 0.35]
  // (JITTER_AMPLITUDE 0.7) keeps t strictly inside (0, 1) for every i. So sweep the direction by
  // rotating it one fixed angular step per ray -- 2 trig calls per pixel instead of 2 per ray
  // (MAX_RAYS=24). The hit point (origin + dir*t) is invariant to any tiny magnitude drift since
  // the ray/segment t absorbs it; only the angle matters, and that drifts ~MAX_RAYS ULP.
  float inv_rays = 1.0 / float(MAX_RAYS);
  float step_angle = interval.length * inv_rays;
  float start_angle = interval.start + interval.length * (0.5 + jitter) * inv_rays;
  float step_c = cos(step_angle);
  float step_s = sin(step_angle);
  vec2 dir = vec2(cos(start_angle), sin(start_angle));
  // Hoist the per-edge ray/segment invariants out of the ray loop (origin + edges are fixed).
  EdgePrecomp pre_ab = precompute_edge(pixel_sim, a, b);
  EdgePrecomp pre_bc = precompute_edge(pixel_sim, b, c);
  EdgePrecomp pre_ca = precompute_edge(pixel_sim, c, a);
  vec3 sum = vec3(0.0);
  for (uint i = 0u; i < MAX_RAYS; i = i + 1u) {
    TraceHit hit = trace_light_source(pixel_sim, dir, pre_ab, pre_bc, pre_ca);
    if (hit.hit) {
      // Geometric spreading on distance NORMALIZED to the scene size (target_info.y =
      // ref_height / sim_height) so the radiance is resolution-independent -- raw sim-px
      // distance made shorter render targets read brighter/whiter. Beer-Lambert absorption
      // (params.x already per-sim-height) eats far light through the smoke/atmosphere.
      float falloff_dist = hit.distance * target_info.y;
      float distance_weight =
        pow(max(falloff_dist, 1.0), -params.y) * exp(-params.x * hit.distance);
      sum += hit.rgb * distance_weight;
    }
    // Rotate the direction by one angular step for the next ray.
    dir = vec2(dir.x * step_c - dir.y * step_s, dir.x * step_s + dir.y * step_c);
  }

  // Match the cascade path's directional average semantics: angular sample mean,
  // independent of ray count. params.z remains the visual calibration knob.
  vec3 radiance = (sum / float(MAX_RAYS)) * params.z;
  frag_color = vec4(radiance, 1.0);
}
`;

// Bakes the 500x500 grain texture the dark floor uses.
export const FLOOR_NOISE_FRAG = `
in vec2 v_uv;
out vec4 fragColor;

// Fixed bake resolution; the texture is created at 500x500 with no UBO.
// Keep in lockstep with noiseSize in passes/main-scene-pass.ts.
const float BAKE_SIZE = 500.0;

void main() {
  // Reconstruct WGSL's floor(in.pos.xy): top-left-origin pixel coordinate.
  vec2 p = floor(v_uv * BAKE_SIZE);
  float floor_noise = hash21(p) + hash21(floor(p * 2.12)) + hash21(floor(p * 3.15));
  floor_noise *= 0.3;
  floor_noise = clamp(floor_noise, 0.0, 1.0);
  fragColor = vec4(vec3(floor_noise), 1.0);
}
`;

// Dark theme floor.
export const DARK_FLOOR_FRAG = `
layout(std140) uniform Config {
  vec4 screen;          // (width, height, isLightTheme, dpr)
  vec4 light_sources;   // (simW, simH, _, contactAoStrength)
  vec4 tunables;        // (ledIntensity, floorAlbedo, lightAoRadiance, contactAoSize)
  vec4 triangle;        // (centerX, centerY, circumradiusY, halfSideX)
  vec4 culling;         // (aabbPadX, aabbPadY, showTriangle, _)
  vec4 radiance_fit;    // (originX, originY, width, height)
  vec4 light_ao;        // (contactFalloffPower, highlightPower, highlightStrength, _)
  vec4 radiance_debug;  // (enabled, redMul, greenMul, blueMul)
  vec4 sim_transform;   // (originX, originY, scale, edgeFadeFrac)
  vec4 dark_floor;      // (sdfFadeDistanceScale, sdfFadeEdgePx, nearFalloffPower, tailPower)
  vec4 dark_glow;       // (tailIntensity, vibrancy, tailMapMin, tailMapMax)
  vec4 dark_near;       // (nearDistanceScale, nearIntensity, nearMapMin, nearMapMax)
  vec4 dark_middle;     // (middlePower, middleIntensity, radianceJitterPx, jitterNorm)
  vec4 dark_toggles;    // (nearEnabled, middleEnabled, farEnabled, contrast)
  vec4 dark_circle;     // (edgeFadeFrac, exposure, _, _)
  vec4 dark_noise;      // (noiseEnabled, _, _, _)
} cfg;

uniform sampler2D radiance_tex;
uniform sampler2D light_sources_tex;
uniform sampler2D floor_noise_tex;
uniform sampler2D particle_tex;

in vec2 v_uv;
out vec4 fragColor;

const int FLOOR_NOISE_SIZE = 500;

// Grain density in texels per CSS pixel. Anchoring to CSS px (not the device-pixel backing
// store) keeps the grain the SAME visual size at any DPR.
const float FLOOR_NOISE_DENSITY = 2.0;

// At DPR 1 the tiling floor grain reads as a coarse, visibly-repeating PATTERN, so scale its
// intensity down to this fraction there; DPR>1 (retina) keeps the full grain (1.0).
const float DARK_FLOOR_GRAIN_DPR1_SCALE = 0.5;

// Mitchell / cubic B-spline upsample coefficients. (B=1, C=0) is the cubic B-spline kernel
// (max smoothing) used for the half-res radiance upsample.
const float UPSAMPLE_B = 1.0;
const float UPSAMPLE_C = 0.0;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

// On the mobile layout the canvas is a SQUARE; widen the top/bottom fade band by this factor.
const float DARK_EDGE_FADE_MOBILE_BOOST = 2.0;

int wrapNoiseCoord(int v) {
  return ((v % FLOOR_NOISE_SIZE) + FLOOR_NOISE_SIZE) % FLOOR_NOISE_SIZE;
}

// Reads the tiling floor noise (r channel, [0,1]) at a DPR-independent position. p is device px;
// cfg.screen.w is DPR, so p / dpr is CSS px.
float sample_floor_noise(vec2 p) {
  vec2 css_px = p / max(cfg.screen.w, 1e-4);
  ivec2 noise_px = ivec2(floor(css_px * FLOOR_NOISE_DENSITY));
  ivec2 noise_uv = ivec2(wrapNoiseCoord(noise_px.x), wrapNoiseCoord(noise_px.y));
  return texelFetch(floor_noise_tex, noise_uv, 0).r;
}

// Cheap per-pixel hash (Dave Hoskins, hash12) -> [0,1]; picks the jitter angle.
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Sibling of hash12 with a different seed multiplier \u2014 independent values, used for the
// radiance multisample blend weight.
float hash12b(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1531);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 bg(vec2 p) {
  // dark_noise.x gates the floor-noise lightness modulation. Off (static bake) -> flat albedo.
  float floor_noise = sample_floor_noise(p) * cfg.dark_noise.x;
  float grain_intensity = cfg.screen.w < 1.5 ? DARK_FLOOR_GRAIN_DPR1_SCALE : 1.0;
  float floor_brightness =
    mix(cfg.tunables.y, cfg.tunables.y * 0.5, floor_noise * grain_intensity);
  // Floor base in RGB (gray); the oklab lift now happens only where an LED blends in (see main).
  return vec3(floor_brightness);
}

struct TriangleCorners { vec2 top; vec2 left; vec2 right; };

TriangleCorners triangle_corners() {
  vec2 top = vec2(cfg.triangle.x, cfg.triangle.y - cfg.triangle.z);
  vec2 left = vec2(cfg.triangle.x - cfg.triangle.w, cfg.triangle.y + cfg.triangle.z * 0.5);
  vec2 right = vec2(cfg.triangle.x + cfg.triangle.w, cfg.triangle.y + cfg.triangle.z * 0.5);
  return TriangleCorners(top, left, right);
}

// Reads the LED emitter/SDF texture in simulation space, blanking samples outside the sim rect.
vec4 sample_light_sources(vec2 pixel_screen) {
  vec2 sim_px = (pixel_screen - cfg.sim_transform.xy) / cfg.sim_transform.z;
  ivec2 px = clamp(ivec2(floor(sim_px)), ivec2(0), ivec2(cfg.light_sources.xy) - ivec2(1));
  bool inside_sim =
    sim_px.x >= 0.0 && sim_px.x < cfg.light_sources.x &&
    sim_px.y >= 0.0 && sim_px.y < cfg.light_sources.y;
  vec4 light_sources = texelFetch(light_sources_tex, fboTexel(light_sources_tex, px), 0);
  if (!inside_sim) {
    light_sources = vec4(0.0, 0.0, 0.0, 1.0);
  }
  return light_sources;
}

// Mitchell-Netravali / BC-spline cubic weight.
float bc_spline_weight(float x) {
  float ax = abs(x);
  float b = UPSAMPLE_B;
  float c = UPSAMPLE_C;
  if (ax < 1.0) {
    return ((12.0 - 9.0 * b - 6.0 * c) * ax * ax * ax
      + (-18.0 + 12.0 * b + 6.0 * c) * ax * ax
      + (6.0 - 2.0 * b)) / 6.0;
  }
  if (ax < 2.0) {
    return ((-b - 6.0 * c) * ax * ax * ax
      + (6.0 * b + 30.0 * c) * ax * ax
      + (-12.0 * b - 48.0 * c) * ax
      + (8.0 * b + 24.0 * c)) / 6.0;
  }
  return 0.0;
}

// BC-spline (Mitchell-Netravali) 4x4 sampling for the half-resolution direct radiance target.
vec3 sample_radiance_cubic(vec2 uv) {
  ivec2 dims_u = textureSize(radiance_tex, 0);
  vec2 dims = vec2(dims_u);
  vec2 texel = clamp(uv, vec2(0.0), vec2(1.0)) * dims - vec2(0.5);
  vec2 base = floor(texel);
  vec2 f = texel - base;
  vec3 sum = vec3(0.0);
  float weight_sum = 0.0;
  for (int y = -1; y <= 2; y = y + 1) {
    float wy = bc_spline_weight(f.y - float(y));
    for (int x = -1; x <= 2; x = x + 1) {
      float wx = bc_spline_weight(f.x - float(x));
      float w = wx * wy;
      ivec2 tap = clamp(ivec2(base) + ivec2(x, y), ivec2(0), dims_u - ivec2(1));
      sum += texelFetch(radiance_tex, fboTexel(radiance_tex, tap), 0).rgb * w;
      weight_sum += w;
    }
  }
  return max(sum / max(weight_sum, 1e-5), vec3(0.0));
}

// Samples the fitted radiance texture, blanking samples outside the fit rect.
vec3 sample_radiance_at(vec2 pixel_screen) {
  vec2 fitted_uv = (pixel_screen - cfg.radiance_fit.xy) / cfg.radiance_fit.zw;
  bool inside_fit =
    fitted_uv.x >= 0.0 && fitted_uv.x <= 1.0 &&
    fitted_uv.y >= 0.0 && fitted_uv.y <= 1.0;
  vec3 radiance = sample_radiance_cubic(fitted_uv);
  if (!inside_fit) {
    radiance = vec3(0.0);
  }
  return radiance;
}

// Noise-driven jittered multisample of the radiance.
vec3 sample_radiance(vec2 pixel_screen, float triangle_sdf) {
  vec3 base = sample_radiance_at(pixel_screen);
  // dark_noise.x off (static bake) -> a single radiance sample, no noise-driven jitter dither.
  if (cfg.dark_noise.x < 0.5) {
    return base;
  }
  float light_intensity = dot(base, LUMA);
  float offset_scale = value_remap_clamp(light_intensity, 0.2, 0.1, 0.0, 1.0);
  offset_scale *= value_remap_clamp(triangle_sdf, 0.0, cfg.triangle.z * 0.9, 0.0, 1.0);

  // Bright pixels (light_intensity >= 0.2) and the triangle edge clamp offset_scale to exactly
  // 0, so the offset is zero and the jittered sample would read the same texel as base
  // (mix(base, base, noise) == base to within a ULP). Skip the second 16-tap cubic fetch there.
  if (offset_scale <= 0.0) {
    return base;
  }

  float noise = hash12b(pixel_screen);
  float angle = hash12(pixel_screen) * 6.2831853;
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 offset = dir * offset_scale * cfg.dark_middle.z * cfg.dark_middle.w;
  vec3 jittered = sample_radiance_at(pixel_screen + offset);
  return mix(base, jittered, noise);
}

// Combines the floor base colour with radiance, the LED surface, vibrancy saturation, and the
// falloff envelope into the final linear-HDR colour.
vec3 compose_floor(
  vec3 base_colour,
  vec3 radiance,
  vec4 light_sources,
  float surface,
  float brightness_factor
) {
  vec3 colour = max(base_colour, vec3(0.0));
  colour *= radiance;
  colour = mix(colour, light_sources.rgb, surface);
  float sat = 1.0 + (cfg.dark_glow.y - 1.0) * brightness_factor;
  float luma = dot(colour, LUMA);
  colour = max(mix(vec3(luma), colour, sat), vec3(0.0));
  colour *= brightness_factor;
  return colour;
}

// VERTICAL-ONLY screen-edge envelope: 1 across the interior, easing to 0 only near the TOP and
// BOTTOM edges. The easing is t^0.5.
float edge_fade(vec2 pixel_screen) {
  float mobile_boost =
    cfg.screen.x < cfg.screen.y * 1.25 ? DARK_EDGE_FADE_MOBILE_BOOST : 1.0;
  float w = max(cfg.dark_circle.x * mobile_boost * cfg.screen.y, 1.0);
  float d = min(pixel_screen.y, cfg.screen.y - pixel_screen.y);
  float t = clamp(d / w, 0.0, 1.0);
  return sqrt(t);
}

// Deep occluder-interior pixels are painted pure black; skip the whole floor body (incl. the
// 16-tap radiance fetch) there. Margin keeps the ~1px anti-aliased silhouette on the full path.
const float OCCLUDER_INTERIOR_MARGIN = 4.0;

void main() {
  vec2 pixel_screen = v_uv * cfg.screen.xy;
  vec2 uv = pixel_screen / cfg.screen.xy;
  vec2 pixel = uv * cfg.screen.xy - cfg.screen.xy * 0.5;
  TriangleCorners tri = triangle_corners();
  float triangle_sdf = sdf_triangle_vertices(pixel_screen, tri.top, tri.left, tri.right);

  // The SDF screen-space gradient must be computed in uniform control flow (here, before any
  // non-uniform branch) for correct derivatives. length(dFdx, dFdy) is the true gradient magnitude;
  // fwidth's |dFdx|+|dFdy| over-widens diagonal edges by up to sqrt(2), so use length() for a true ~1px AA.
  float occluder_edge = max(length(vec2(dFdx(triangle_sdf), dFdy(triangle_sdf))), 1e-4);

  // Early-out to the exact interior value (occluder on, not radiance-debug). The gradient above is
  // in uniform control flow, so this per-pixel branch is safe.
  if (cfg.culling.z > 0.5 && cfg.radiance_debug.x <= 0.5 && triangle_sdf < -OCCLUDER_INTERIOR_MARGIN) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec4 light_sources = sample_light_sources(pixel_screen);
  vec3 radiance = sample_radiance(pixel_screen, triangle_sdf);
  if (cfg.radiance_debug.x > 0.5) {
    fragColor = vec4(clamp(radiance * cfg.radiance_debug.yzw, vec3(0.0), vec3(1.0)), 1.0);
    return;
  }

  // LED surface mask, derived from the emitter color itself.
  float surface = smoothstep(
    4.0,
    4.02,
    max(max(light_sources.r, light_sources.g), light_sources.b)
  );
  // Floor base in RGB; blend toward the LED color (cbrt-LMS space) only where an LED is present.
  vec3 floor_rgb = bg(pixel);
  vec3 base_rgb = floor_rgb;
  if (surface > 0.0) {
    base_rgb = oklab_to_rgb(mix(col3v(floor_rgb), col3v(light_sources.rgb), surface));
  }

  // Three glow layers, brightest first. Screen-blend the in-range [0,1] parts, then add any
  // over-1 overflow additively (keeps the combination monotonic past 1).
  float fade_inner = cfg.dark_floor.y;
  float near_light = dot(radiance, LUMA);
  float near = near_falloff(
    triangle_sdf,
    near_light,
    fade_inner,
    cfg.triangle.z,
    cfg.dark_near,
    cfg.dark_floor.z,
    cfg.dark_toggles.x
  );
  // middle_falloff returns 0 when its toggle (dark_toggles.y) is off (shipping default) \u2014 skip it.
  float middle = 0.0;
  if (cfg.dark_toggles.y > 0.5) {
    middle = middle_falloff(
      triangle_sdf,
      fade_inner,
      cfg.triangle.z,
      cfg.dark_floor.x,
      cfg.dark_middle,
      cfg.dark_toggles.y
    );
  }
  float far = far_falloff(
    near_light,
    cfg.dark_glow,
    cfg.dark_floor.w,
    cfg.dark_toggles.z
  );
  float screen_blend =
    1.0 - (1.0 - min(near, 1.0)) * (1.0 - min(middle, 1.0)) * (1.0 - min(far, 1.0));
  float overflow =
    max(near - 1.0, 0.0) + max(middle - 1.0, 0.0) + max(far - 1.0, 0.0);
  float brightness_factor = screen_blend + overflow;

  vec3 colour = compose_floor(
    base_rgb,
    radiance,
    light_sources,
    surface,
    brightness_factor
  );

  // Final output (no composite pass in dark mode): tonemap -> display contrast.
  float particle_mask = texelFetch(particle_tex, fboTexel(particle_tex, ivec2(pixel_screen)), 0).r;
  float exposure = cfg.dark_circle.y; // GUI: Dark \u2192 Glow \u2192 Exposure.
  float particle_exposure_boost_max = cfg.culling.w; // GUI: Drop deploy \u2192 Particle boost max.
  float contrast = cfg.dark_toggles.w; // GUI: Dark \u2192 Glow \u2192 Contrast.
  float particle_exposure = 1.0 + particle_mask * particle_exposure_boost_max;
  vec3 final_colour = tonemap(colour * exposure * particle_exposure);
  final_colour = (final_colour - vec3(0.5)) * contrast + vec3(0.5);

  // Foreground triangle occluder, drawn analytically from the same SDF. cfg.culling.z is the
  // show-triangle flag (0/1).
  float occluder = clamp(0.5 - triangle_sdf / occluder_edge, 0.0, 1.0) * cfg.culling.z;
  final_colour = mix(final_colour, vec3(0.0), occluder);

  // Screen-edge fade as a plain multiply (preserves hue).
  final_colour = final_colour * edge_fade(pixel_screen);

  fragColor = vec4(final_colour, 1.0);
}
`;

// Light theme floor: the white rim, glow, contact shadows and, with colour mix, the prism colours.
export const LIGHT_FLOOR_FRAG = `
layout(std140) uniform Config {
  vec4 screen;          // (width, height, isLightTheme, dpr)
  vec4 light_sources;   // (simW, simH, _, contactAoStrength)
  vec4 tunables;        // (ledIntensity, lightFloorAlbedo, lightAoRadiance, contactAoSize)
  vec4 triangle;        // (centerX, centerY, circumradiusY, halfSideX)
  vec4 culling;         // (aabbPadX, aabbPadY, showTriangle, _)
  vec4 radiance_fit;    // (originX, originY, width, height)
  vec4 light_ao;        // (contactFalloffPower, highlightPower, highlightStrength, _)
  vec4 radiance_debug;  // (enabled, redMul, greenMul, blueMul)
  vec4 sim_transform;   // (originX, originY, scale, edgeFadeFrac)
} cfg;

layout(std140) uniform LightGlow {
  vec4 near;         // (distanceScale, intensity, mapMin, mapMax)
  vec4 middle;       // (power, intensity, highlightNoise, _)
  vec4 glow;         // (far intensity, colorMix, mapMin, mapMax)
  vec4 params;       // (nearPower, middleOuterScale, farPower, fadeInner)
  vec4 toggles;      // (nearEnabled, middleEnabled, farEnabled, contrast)
  vec4 ao;           // (strength, radiusScale, power, enabled)
  vec4 ao2;          // (strength, radiusScale, power, enabled)
  vec4 ao3;          // (strength, radiusScale, power, enabled)
  vec4 edgeRed;      // (r, g, b, invOverlap)
  vec4 edgeGreen;    // (r, g, b, _)
  vec4 edgeBlue;     // (r, g, b, _)
  vec4 nearColor;    // COLOR copy of near
  vec4 middleColor;  // COLOR copy of middle
  vec4 glowColor;    // COLOR copy of glow (.y = highlightDebug)
  vec4 paramsColor;  // COLOR copy of params
  vec4 togglesColor; // COLOR copy of toggles
} lg;

uniform sampler2D radiance_tex;
uniform sampler2D light_sources_tex;
uniform sampler2D particle_tex;

in vec2 v_uv;
out vec4 fragColor;

// corner-crease smoothing, as a fraction of the triangle circumradius
const float AO_CORNER_SMOOTH = 0.25;

// Smooth max: like max(a,b) but rounds the transition over a width k.
float ao_smax(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (a - b) / max(k, 1e-4), 0.0, 1.0);
  return mix(b, a, h) + k * h * (1.0 - h);
}

// Cheap per-pixel hashes (Dave Hoskins) -> [0,1]. Used to exaggerate the highlight mask.
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float hash12b(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1531);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Catmull-Rom cubic weight (LOCAL to the light shader; the dark shader uses bc_spline).
float catmull_rom_weight(float x) {
  float ax = abs(x);
  if (ax <= 1.0) {
    return 1.5 * ax * ax * ax - 2.5 * ax * ax + 1.0;
  }
  if (ax < 2.0) {
    return -0.5 * ax * ax * ax + 2.5 * ax * ax - 4.0 * ax + 2.0;
  }
  return 0.0;
}

// Catmull-Rom 4x4 sampling for the half-resolution direct radiance target.
vec3 sample_radiance_cubic(vec2 uv) {
  ivec2 dims_u = textureSize(radiance_tex, 0);
  vec2 dims = vec2(dims_u);
  vec2 texel = clamp(uv, vec2(0.0), vec2(1.0)) * dims - vec2(0.5);
  vec2 base = floor(texel);
  vec2 f = texel - base;
  vec3 sum = vec3(0.0);
  float weight_sum = 0.0;
  for (int y = -1; y <= 2; y = y + 1) {
    float wy = catmull_rom_weight(f.y - float(y));
    for (int x = -1; x <= 2; x = x + 1) {
      float wx = catmull_rom_weight(f.x - float(x));
      float w = wx * wy;
      ivec2 tap = clamp(ivec2(base) + ivec2(x, y), ivec2(0), dims_u - ivec2(1));
      sum += texelFetch(radiance_tex, fboTexel(radiance_tex, tap), 0).rgb * w;
      weight_sum += w;
    }
  }
  return max(sum / max(weight_sum, 1e-5), vec3(0.0));
}

vec3 sample_radiance_at(vec2 pixel_screen) {
  vec2 fitted_uv = (pixel_screen - cfg.radiance_fit.xy) / cfg.radiance_fit.zw;
  bool inside_fit =
    fitted_uv.x >= 0.0 && fitted_uv.x <= 1.0 &&
    fitted_uv.y >= 0.0 && fitted_uv.y <= 1.0;
  vec3 radiance = sample_radiance_cubic(fitted_uv);
  if (!inside_fit) {
    radiance = vec3(0.0);
  }
  return radiance;
}

// Triangular angular weight: 1 at theta_i, falling linearly to 0 at 120 degrees away.
float angular_weight(float theta, float theta_i) {
  float d = theta - theta_i;
  float dist = abs(atan(sin(d), cos(d))); // shortest wrapped angular distance, [0, pi]
  return max(0.0, 1.0 - dist / 2.0943951); // 2.0943951 = 120 degrees (2pi/3)
}

vec3 floor_edge_tint(vec2 pixel, vec2 top, vec2 left, vec2 right) {
  // Conic gradient: the tint depends only on the angle around the triangle center.
  vec2 center = cfg.triangle.xy;
  float theta = atan(pixel.y - center.y, pixel.x - center.x);
  vec2 red_center = (top + left) * 0.5;
  vec2 green_center = (left + right) * 0.5;
  vec2 blue_center = (right + top) * 0.5;
  // Overlap control (lg.edgeRed.w = 1/overlap).
  float inv_overlap = lg.edgeRed.w;
  float wr = pow(angular_weight(theta, atan(red_center.y - center.y, red_center.x - center.x)), inv_overlap);
  float wg = pow(angular_weight(theta, atan(green_center.y - center.y, green_center.x - center.x)), inv_overlap);
  float wb = pow(angular_weight(theta, atan(blue_center.y - center.y, blue_center.x - center.x)), inv_overlap);
  float wsum = max(wr + wg + wb, 1e-4);

  // Vivid OKLCh-style blend: average lightness and chroma independently, take hue from the
  // weighted sum of a/b vectors (short-arc circular mean), renormalize to the averaged chroma.
  // Precomputed CPU-side (cbrt-LMS of the edge colors) and carried in edgeRed/Green/Blue.xyz.
  vec3 lab_r = lg.edgeRed.xyz;
  vec3 lab_g = lg.edgeGreen.xyz;
  vec3 lab_b = lg.edgeBlue.xyz;
  float l = (lab_r.x * wr + lab_g.x * wg + lab_b.x * wb) / wsum;
  float chroma =
    (length(lab_r.yz) * wr + length(lab_g.yz) * wg + length(lab_b.yz) * wb) / wsum;
  vec2 ab_sum = lab_r.yz * wr + lab_g.yz * wg + lab_b.yz * wb;
  float ab_len = length(ab_sum);
  vec2 ab = vec2(0.0);
  if (ab_len > 1e-5) {
    ab = (ab_sum / ab_len) * chroma;
  }
  return clamp(oklab_to_rgb(vec3(l, ab.x, ab.y)), vec3(0.0), vec3(1.0));
}

// Smooth screen-edge envelope: 1 across the interior, easing to 0 near ALL FOUR edges. The fade
// width (cfg.sim_transform.w, a fraction of canvas HEIGHT) is applied to ALPHA.
float edge_fade(vec2 pixel_screen) {
  float w = max(cfg.sim_transform.w * cfg.screen.y, 1.0);
  float dy = min(pixel_screen.y, cfg.screen.y - pixel_screen.y);
  float dx = min(pixel_screen.x, cfg.screen.x - pixel_screen.x);
  return smoothstep(0.0, w, dy) * smoothstep(0.0, w, dx);
}

// Signed distance to one triangle edge's outward half-plane (positive outside the triangle).
float ao_half_plane_distance(vec2 p, vec2 e0, vec2 e1, vec2 center) {
  vec2 edge = e1 - e0;
  vec2 n = normalize(vec2(-edge.y, edge.x));
  if (dot(n, e0 - center) < 0.0) { n = -n; } // force outward (away from centroid)
  return dot(p - e0, n);
}

// Triangle distance from its three edge half-planes (sharp/miter corners), smooth-maxed.
float ao_triangle_plane_distance(vec2 p, vec2 a, vec2 b, vec2 c) {
  vec2 center = (a + b + c) * (1.0 / 3.0);
  float k = cfg.triangle.z * AO_CORNER_SMOOTH; // cfg.triangle.z = circumradius (screen px)
  float dab = ao_half_plane_distance(p, a, b, center);
  float dbc = ao_half_plane_distance(p, b, c, center);
  float dca = ao_half_plane_distance(p, c, a, center);
  return ao_smax(ao_smax(dab, dbc, k), dca, k);
}

void main() {
  vec2 pixel_screen = v_uv * cfg.screen.xy;
  vec2 uv = pixel_screen / cfg.screen.xy;
  // colorMix: 0 = grayscale/idle (white light), 1 = colored/deploy-active.
  float colorMix = clamp(lg.glow.y, 0.0, 1.0);

  // Rebuild the triangle vertices in screen space.
  vec2 top = vec2(cfg.triangle.x, cfg.triangle.y - cfg.triangle.z);
  vec2 left = vec2(cfg.triangle.x - cfg.triangle.w, cfg.triangle.y + cfg.triangle.z * 0.5);
  vec2 right = vec2(cfg.triangle.x + cfg.triangle.w, cfg.triangle.y + cfg.triangle.z * 0.5);
  float triangle_sdf = sdf_triangle_vertices(pixel_screen, top, left, right);

  // The SDF screen-space gradient in uniform control flow (top level) for correct derivatives.
  // length(dFdx, dFdy) is the true gradient magnitude; fwidth's |dFdx|+|dFdy| over-widens diagonal
  // edges by up to sqrt(2), so use length() for a true ~1px AA.
  float occluder_edge = max(length(vec2(dFdx(triangle_sdf), dFdy(triangle_sdf))), 1e-4);

  vec3 radiance = sample_radiance_at(pixel_screen);

  if (cfg.radiance_debug.x > 0.5) {
    fragColor = vec4(radiance, 1.0);
    return;
  }

  // Combine the three falloffs the same way dark mode does.
  float near_light = dot(radiance, vec3(0.2126, 0.7152, 0.0722));
  // Per-layer MONO->COLOR param blend by colorMix.
  vec4 near_p = mix(lg.near, lg.nearColor, colorMix);
  vec4 middle_p = mix(lg.middle, lg.middleColor, colorMix);
  vec4 glow_p = mix(lg.glow, lg.glowColor, colorMix);
  vec4 params_p = mix(lg.params, lg.paramsColor, colorMix);
  vec4 toggles_p = mix(lg.toggles, lg.togglesColor, colorMix);
  float fade_inner = params_p.w;
  // NEAR (colored only): a PURE LUMINANCE remap \u2014 NO SDF band.
  float near = pow(value_map01(near_light, near_p.z, near_p.w), max(params_p.x, 0.001))
    * near_p.y * toggles_p.x * colorMix;
  float middle = middle_falloff(
    triangle_sdf,
    fade_inner,
    cfg.triangle.z,
    params_p.y,
    middle_p,
    toggles_p.y
  ) * colorMix;
  float far = far_falloff(
    near_light,
    glow_p,
    params_p.z,
    toggles_p.z
  );
  float screen_blend =
    1.0 - (1.0 - min(near, 1.0)) * (1.0 - min(middle, 1.0)) * (1.0 - min(far, 1.0));
  float overflow =
    max(near - 1.0, 0.0) + max(middle - 1.0, 0.0) + max(far - 1.0, 0.0);
  float brightness_factor = screen_blend + overflow;

  float alpha = 1.0;

  // Foreground triangle occluder, drawn analytically from the same SDF. cfg.culling.z is the
  // show-triangle flag (0/1).
  float occluder = clamp(0.5 - triangle_sdf / occluder_edge, 0.0, 1.0) * cfg.culling.z;
  alpha = mix(alpha, 0.0, occluder);

  float highlight = near;
  highlight = clamp(highlight, 0.0, 1.0);
  highlight = pow(highlight, 0.5);
  highlight *= 1.0 - occluder; // Don't highlight where the triangle occluder is.
  // EXAGGERATE the highlight mask with per-pixel hash grain (lg.middle.z = highlightNoise).
  float hl_grain = hash12b(pixel_screen) + 0.5 * hash12(pixel_screen); // ~[0, 1.5]
  highlight = clamp(highlight * (1.0 + (hl_grain - 0.75) * lg.middle.z), 0.0, 1.0);
  // DEBUG (lg.glowColor.y): render the raw highlight variable as opaque grayscale.
  if (lg.glowColor.y > 0.5) {
    fragColor = vec4(vec3(highlight), 1.0);
    return;
  }

  // Apply dark-style contrast to the combined glow, then use it as the alpha.
  float glow_contrast = toggles_p.w; // GUI: Light \u2192 Glow (mono/color) \u2192 Contrast, blended by colorMix.
  float light_glow = (brightness_factor - 0.5) * glow_contrast + 0.5;
  float glow_alpha = clamp(light_glow, 0.0, 1.0) * alpha;

  // contrast when light is white. The old mix(pow(a,1.2)*1.2, a*1.5, 1.0) selected the second arg
  // verbatim (blend factor 1.0), so the pow branch was dead -- it is just a * 1.5.
  glow_alpha = glow_alpha * 1.5;
  glow_alpha = clamp(glow_alpha, 0.0, 1.0);

  // Screen-edge fade multiplies ALPHA (premultiplied compositing).
  glow_alpha = glow_alpha * edge_fade(pixel_screen);

  // Color output: white light or the per-edge brand tint, blended by colorMix.
  vec3 edge_tint = floor_edge_tint(pixel_screen, top, left, right);
  edge_tint += edge_tint * highlight;
  edge_tint = clamp(edge_tint, vec3(0.0), vec3(1.0));
  edge_tint = mix(edge_tint, vec3(1.0), pow(highlight, 2.2) * 0.7);
  vec3 color = mix(vec3(1.0), edge_tint, clamp(lg.glow.y, 0.0, 1.0));
  // Brightness boost only on the tinted floor: x1 at colorMix=0 ramping to x2 at colorMix=1.
  color *= mix(1.0, 2.0, colorMix);

  // Three-layer AO: all layers darken the ground near the triangle via premultiplied compositing.
  float ao_outside = max(ao_triangle_plane_distance(pixel_screen, top, left, right), 0.0);
  float ao_outside_sdf = max(triangle_sdf, 0.0);
  float ao1 = lg.ao.x  * pow(1.0 - clamp(ao_outside_sdf / max(cfg.triangle.z * lg.ao.y,  1e-4), 0.0, 1.0), max(lg.ao.z,  0.01)) * step(0.5, lg.ao.w);
  float ao2 = lg.ao2.x * pow(1.0 - clamp(ao_outside / max(cfg.triangle.z * lg.ao2.y, 1e-4), 0.0, 1.0), max(lg.ao2.z, 0.01)) * step(0.5, lg.ao2.w);
  float ao3 = lg.ao3.x * pow(1.0 - clamp(ao_outside / max(cfg.triangle.z * lg.ao3.y, 1e-4), 0.0, 1.0), max(lg.ao3.z, 0.01)) * step(0.5, lg.ao3.w);
  float ao_dark = clamp(ao1 + ao2 + ao3, 0.0, 1.0) * (1.0 - colorMix) * (1.0 - occluder);
  float out_alpha = glow_alpha + ao_dark * (1.0 - glow_alpha);
  // Paint the foreground triangle as opaque black in the canvas (premultiplied "over" the floor).
  float particle_mask = texelFetch(particle_tex, fboTexel(particle_tex, ivec2(pixel_screen)), 0).r;
  float particle_exposure_boost_max = cfg.culling.w; // GUI: Drop deploy \u2192 Particle boost max.
  float particle_exposure = 1.0 + particle_mask * particle_exposure_boost_max;
  color *= particle_exposure;
  vec3 final_rgb = color * glow_alpha * (1.0 - occluder);
  float final_alpha = out_alpha * (1.0 - occluder) + occluder;
  fragColor = vec4(final_rgb, final_alpha);
}
`;

// Upload particles (drop staging).
export const PARTICLES_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
layout(location = 1) in float a_intensity_t;
layout(location = 2) in float a_fade_in;
uniform vec4 u_origin_scale_strength;
out float v_intensity_t;
out float v_fade_in;
uniform vec4 u_rt_size;
void main() {
  vec2 screen = a_position * u_origin_scale_strength.z + u_origin_scale_strength.xy;
  vec2 ndc = vec2(screen.x / u_rt_size.x * 2.0 - 1.0, 1.0 - screen.y / u_rt_size.y * 2.0);
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_intensity_t = a_intensity_t;
  v_fade_in = a_fade_in;
  gl_PointSize = 1.0;
}
`;

// Upload particles (drop staging).
export const PARTICLES_FRAG = `
uniform vec4 u_origin_scale_strength;
uniform vec4 u_rt_size;
in float v_intensity_t;
in float v_fade_in;
out vec4 fragColor;
void main() {
  if (u_rt_size.w <= 0.0) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  float min_ratio = clamp(u_rt_size.z, 0.0, 1.0);
  float particle_scale = mix(min_ratio, 1.0, clamp(v_intensity_t, 0.0, 1.0));
  float fade_in = clamp(v_fade_in, 0.0, 1.0);
  fragColor = vec4(u_origin_scale_strength.w * particle_scale * fade_in, 0.0, 0.0, 1.0);
}
`;

// Final blit, flipping the present target's rows.
export const PRESENT_VERT = `#version 300 es
precision highp float;
out vec2 v_uv;
void main() {
  vec2 positions[3] = vec2[3](
    vec2(-1.0, -3.0),
    vec2(-1.0, 1.0),
    vec2(3.0, 1.0)
  );
  vec2 p = positions[gl_VertexID];
  // Bottom-left UV: present FBO was written top-left; sampling with a bottom-left V flips it once.
  v_uv = vec2(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

// Final blit.
export const PRESENT_FRAG = `
uniform sampler2D u_present;
in vec2 v_uv;
out vec4 fragColor;
void main() {
  fragColor = texture(u_present, v_uv);
}
`;
