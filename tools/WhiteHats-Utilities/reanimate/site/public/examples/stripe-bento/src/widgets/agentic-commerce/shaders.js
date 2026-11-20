// Particle ring shaders, verbatim from stripe.com (AgenticGraphicBackground, three r178 ShaderMaterial).
// GLSL ES 3.00 features (floatBitsToUint, uint literals) work because three compiles ShaderMaterial
// as "#version 300 es" on WebGL2 and maps attribute/varying/texture2D/gl_FragColor for us.

export const vertexShader = /* glsl */ `attribute vec2 pointSpriteUv;
uniform vec2 u_resolution;
uniform vec2 u_mousePosition;
uniform float u_mouseStrength;
uniform float u_scatterPower;
uniform float u_thinkingStrength;
uniform vec2 u_thinkingVector;
uniform float u_pointSize;
uniform float u_pixelRatio;
uniform float u_time;

varying vec2 v_uv;
varying vec2 v_pointSpriteUv;
varying vec2 v_resolution;
varying float v_time;
varying float v_random;
varying float v_alpha;
varying vec2 v_mousePosition;

const float DESIGN_PIXEL_RATIO = 2.0;

// The origin of these popular glsl functions is a mystery, but it seems they
// were likely derived from a paper titled "On generating random numbers, with
// help of y=[(a+x)sin(bx)] mod 1", W.J.J. Rey, 22nd European Meeting of
// Statisticians and the 7th Vilnius Conference on Probability Theory and
// Mathematical Statistics, August 1998.

// https://stackoverflow.com/questions/12964279/whats-the-origin-of-this-glsl-rand-one-liner

#ifndef STRIPE_RANDOM
#define STRIPE_RANDOM
float random(in float x) {
  return fract(sin(x) * 43758.5453);
}
float random(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
float random(in vec3 pos) {
  return fract(sin(dot(pos.xyz, vec3(70.9898, 78.233, 32.4355))) * 43758.5453123);
}
#endif

// Stefan Gustavson's version;
// https://www.shadertoy.com/view/43tBDr
// https://www.researchgate.net/publication/216813608_Simplex_noise_demystified

// https://xxhash.com/
// https://github.com/Cyan4973/xxHash/blob/dev/LICENSE

#ifndef STRIPE_HASH
#define STRIPE_HASH
float xxhash(vec2 x) {
  uvec2 t = floatBitsToUint(x);
  uint h = 0xc2b2ae3du * t.x + 0x165667b9u;
  h = (h << 17u | h >> 15u) * 0x27d4eb2fu;
  h += 0xc2b2ae3du * t.y;
  h = (h << 17u | h >> 15u) * 0x27d4eb2fu;
  h ^= h >> 15u;
  h *= 0x85ebca77u;
  h ^= h >> 13u;
  h *= 0xc2b2ae3du;
  h ^= h >> 16u;
  return uintBitsToFloat(h >> 9u | 0x3f800000u) - 1.0;
}

vec2 hash(vec2 x) {
  float k = 6.283185307 * xxhash(x);
  return vec2(cos(k), sin(k));
}
#endif


#ifndef STRIPE_SIMPLEX_NOISE
#define STRIPE_SIMPLEX_NOISE
float simplexNoise(in vec2 p) {
  const float K1 = 0.366025404; // (sqrt(3)-1)/2;
  const float K2 = 0.211324865; // (3-sqrt(3))/6;

  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0))); // changed to h^3 [1]

  return dot(n, vec3(32.99)); // analytic factor (= 2916*sqrt(2)/125)
}
#endif


void main() {
  vec3 pos = position;
  vec3 dir = normalize(-pos);

  v_uv = uv;
  v_pointSpriteUv = pointSpriteUv;
  v_random = random(pos.xy);
  v_alpha = random(pos.yz);
  v_time = u_time;
  v_resolution = u_resolution;
  v_mousePosition = u_mousePosition;

  float speedInner = u_time * 0.00004;
  float speedOuter = u_time * 0.00004;
  float noiseInner = simplexNoise(vec2(pos.x * 0.25 + speedInner, pos.y * 0.25 + speedInner));
  float noiseOuter = simplexNoise(vec2(pos.x * 0.07 + speedOuter, pos.y * 0.07 + speedOuter));

  float thinkingAlignment = dot(vec3(u_thinkingVector, 0.0), normalize(vec3(pos.x, pos.y, 0.0)));
  thinkingAlignment = pow(clamp(thinkingAlignment, 0.0, 1.0), 3.0) * u_thinkingStrength;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  float mouseDistance = distance(u_mousePosition, modelPosition.xy) / u_resolution.x;
  mouseDistance = smoothstep(0.2, 0.0, mouseDistance);

  pos += dir * noiseInner * 100.0 * pow(v_random, u_scatterPower + (u_scatterPower * thinkingAlignment));
  //pos += dir * noiseInner * 20.0 * mouseDistance * u_mouseStrength;
  pos += dir * noiseInner * 20.0 * thinkingAlignment;
  pos += dir * noiseOuter * 5.0 * thinkingAlignment;
  pos = mix(pos, position, mouseDistance * u_mouseStrength + noiseOuter * 0.5);

  vec4 finalModelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * finalModelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_PointSize = (1.0 + u_pointSize * v_random) * (u_pixelRatio / DESIGN_PIXEL_RATIO);
  gl_Position = projectedPosition;
}
`;

export const fragmentShader = /* glsl */ `
uniform sampler2D u_pointSpriteSheet;
varying vec2 v_pointSpriteUv;
varying float v_time;
varying float v_random;
varying float v_alpha;
varying vec2 v_resolution;
varying vec2 v_mousePosition;

#define SPRITE_SIZE 1.0 / 4.0

void main() {
  vec2 pixel = 1.0 / v_resolution;
  vec2 st = gl_FragCoord.xy * pixel;
  vec2 spriteCoord = vec2(v_pointSpriteUv.x + gl_PointCoord.x * SPRITE_SIZE, v_pointSpriteUv.y + gl_PointCoord.y * SPRITE_SIZE);
  vec4 color = texture2D(u_pointSpriteSheet, spriteCoord);

  vec3 colorTop = vec3(1.0, 0.25, 0.41);
  vec3 colorBot = vec3(0.52, 0.21, 0.96);
  color.rgb = mix(colorTop, colorBot, 1.0 - st.y);
  color.a *= pow(v_alpha, 2.0);

  gl_FragColor = color;
}
`;
