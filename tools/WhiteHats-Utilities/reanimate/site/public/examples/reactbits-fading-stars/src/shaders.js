// Fading Stars shaders, verbatim from pro.reactbits.dev (FadingStars, three r181 ShaderMaterial, GLSL ES 3.00).
// three.js prepends "#version 300 es", highp precision and the built-in `position` / `uv` attributes;
// PREFIX below does the same for raw WebGL2.

export const VERTEX_PREFIX = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
in vec3 position;
in vec2 uv;
`;

export const FRAGMENT_PREFIX = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
`;

const LAB = `
vec3 labToLinear(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return max(vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  ), 0.0);
}
`;

// One instanced quad per star: the trail, a line from the head back along the ray.
export const trailVertex = `
in vec4 aHead;
in vec4 aShape;
in vec4 aLook;
uniform vec2 uResolution;
uniform float uPixelRatio;
uniform float uLineWidth;
uniform float uTrailGain;
out vec2 vLine;
out float vLength;
out float vHalf;
out float vGain;
out float vLayer;

void main() {
  float len = aShape.x * uPixelRatio;
  float width = uLineWidth * aShape.w * uPixelRatio;
  vLine = vec2(0.0);
  vLength = 1.0;
  vHalf = 0.0;
  vGain = 0.0;
  vLayer = aLook.z;
  if (aShape.y <= 0.0 || len < 0.05 || width <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  float body = max(width, 1.0);
  float reach = body * 0.5 + 1.0;
  vec2 dir = aHead.zw;
  vec2 side = vec2(-dir.y, dir.x);
  float along = mix(-1.0, len + 1.0, position.x);
  float across = position.y * reach;
  vec2 point = aHead.xy * uPixelRatio - dir * (len - along) + side * across;
  vLine = vec2(along, across);
  vLength = len;
  vHalf = body * 0.5;
  vGain = aShape.y * uTrailGain * min(width, 1.0);
  gl_Position = vec4(point / uResolution * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const trailFragment = `
precision highp float;
uniform vec3 uTrailLab;
uniform vec3 uHeadLab;
uniform float uFade;
in vec2 vLine;
in float vLength;
in float vHalf;
in float vGain;
in float vLayer;
out vec4 fragColor;
${LAB}

void main() {
  float t = clamp(vLine.x / vLength, 0.0, 1.0);
  float side = clamp(vHalf + 0.5 - abs(vLine.y), 0.0, 1.0);
  float cap = clamp(vLength + 0.5 - vLine.x, 0.0, 1.0);
  float e = pow(t, uFade * 2.2) * side * cap * vGain;
  vec3 color = labToLinear(mix(uTrailLab, uHeadLab, smoothstep(0.45, 1.0, t) * 0.45 * vLayer));
  fragColor = vec4(color * e, e);
}
`;

// One instanced quad per star: the head, a gaussian dot with a faint halo that twinkles.
export const headVertex = `
in vec4 aHead;
in vec4 aShape;
in vec4 aLook;
uniform vec2 uResolution;
uniform float uPixelRatio;
uniform float uStarSize;
uniform float uTime;
uniform float uTwinkle;
uniform float uHeadGain;
out vec2 vOffset;
out float vSigma;
out float vRadius;
out float vGain;
out float vLayer;

void main() {
  float wanted = uStarSize * aShape.z * uPixelRatio * 0.42;
  float sigma = max(wanted, 0.5);
  float radius = sigma * 4.5 + 1.0;
  vOffset = position.xy * radius;
  vSigma = sigma;
  vRadius = radius;
  vGain = 0.0;
  vLayer = aLook.z;
  if (aShape.y <= 0.0 || wanted <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  float wave = 0.5 + 0.5 * sin(uTime * (0.6 + 1.5 * aLook.x) + aLook.x * 57.0);
  float shimmer = 1.0 - uTwinkle * 0.6 * wave * wave;
  vGain = aShape.y * uHeadGain * shimmer * (1.0 + aLook.y * 0.5) * (wanted * wanted) / (sigma * sigma);
  gl_Position = vec4((aHead.xy * uPixelRatio + vOffset) / uResolution * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const headFragment = `
precision highp float;
uniform vec3 uTrailLab;
uniform vec3 uHeadLab;
uniform float uHalo;
in vec2 vOffset;
in float vSigma;
in float vRadius;
in float vGain;
in float vLayer;
out vec4 fragColor;
${LAB}

void main() {
  float d = length(vOffset);
  float x = d / vSigma;
  float body = exp(-0.5 * x * x) + uHalo * exp(-0.06 * x * x);
  float e = body * (1.0 - smoothstep(vRadius * 0.5, vRadius, d)) * vGain;
  vec3 color = labToLinear(mix(uTrailLab, uHeadLab, mix(0.5, 1.0, vLayer)));
  fragColor = vec4(color * e, e);
}
`;

// Full-screen passes.
export const screenVertex = `
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Bloom, down: a 5-tap filter at half size; the first level keeps only light above a soft threshold.
export const downFragment = `
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uThreshold;
uniform float uFloor;
in vec2 vUv;
out vec4 fragColor;

void main() {
  vec4 a = texture(uSource, vUv + uTexel * vec2(-1.0, -1.0));
  vec4 b = texture(uSource, vUv + uTexel * vec2(1.0, -1.0));
  vec4 c = texture(uSource, vUv + uTexel * vec2(-1.0, 1.0));
  vec4 d = texture(uSource, vUv + uTexel * vec2(1.0, 1.0));
  vec4 color = (a + b + c + d) * 0.125 + texture(uSource, vUv) * 0.5;
  float peak = max(color.r, max(color.g, color.b));
  float knee = uThreshold * 0.6 + 1e-4;
  float soft = clamp(peak - uThreshold + knee, 0.0, 2.0 * knee);
  float weight = max(soft * soft / (4.0 * knee), peak - uThreshold) / max(peak, 1e-4);
  color.rgb *= mix(uFloor, 1.0, clamp(weight, 0.0, 1.0));
  fragColor = color;
}
`;

// Bloom, up: a 9-tap tent of the smaller level added to the level above.
export const upFragment = `
precision highp float;
uniform sampler2D uSource;
uniform sampler2D uBase;
uniform vec2 uTexel;
in vec2 vUv;
out vec4 fragColor;

void main() {
  vec4 sum = texture(uSource, vUv) * 4.0;
  sum += texture(uSource, vUv + uTexel * vec2(-1.0, 0.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(1.0, 0.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(0.0, -1.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(0.0, 1.0)) * 2.0;
  sum += texture(uSource, vUv + uTexel * vec2(-1.0, -1.0));
  sum += texture(uSource, vUv + uTexel * vec2(1.0, -1.0));
  sum += texture(uSource, vUv + uTexel * vec2(-1.0, 1.0));
  sum += texture(uSource, vUv + uTexel * vec2(1.0, 1.0));
  fragColor = texture(uBase, vUv) + sum / 16.0;
}
`;

// To the screen: expose the light (glow) or lay down ink (light backgrounds), encode to sRGB, add grain.
export const compositeFragment = `
precision highp float;
uniform sampler2D uLines;
uniform sampler2D uBloom;
uniform vec3 uBackground;
uniform float uGlow;
uniform float uExposure;
uniform float uMode;
uniform float uGrain;
uniform float uSeed;
in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}

void main() {
  vec4 lines = texture(uLines, vUv);
  vec4 bloom = texture(uBloom, vUv);
  vec3 color;
  float amount;
  if (uMode < 0.5) {
    vec3 light = (lines.rgb + bloom.rgb * uGlow) * uExposure;
    vec3 exposed = 1.0 - exp(-light);
    float peak = max(exposed.r, max(exposed.g, exposed.b));
    exposed = mix(exposed, vec3(peak), smoothstep(0.7, 1.0, peak) * 0.4);
    color = uBackground + (1.0 - uBackground) * exposed;
    amount = peak;
  } else {
    float energy = lines.a + bloom.a * uGlow * 0.15;
    vec3 hue = (lines.rgb + bloom.rgb * uGlow * 0.15) / max(energy, 1e-4);
    float cover = clamp(1.0 - exp(-energy * uExposure), 0.0, 0.92);
    color = mix(uBackground, clamp(hue, 0.0, 1.0), cover);
    amount = cover;
  }
  float noise = hash(gl_FragCoord.xy + uSeed * 311.0) - 0.5;
  fragColor = vec4(encode(color) + noise * (1.0 / 255.0 + uGrain * 0.08 * sqrt(amount)), 1.0);
}
`;
