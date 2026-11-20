// GLSL copied from stripe.com's globe module (three.js r178 ShaderMaterial built-ins).

// Atmosphere halo: a camera-facing plane around the globe.
export const ATMOSPHERE_VERTEX = /* glsl */ `
varying vec2 vPlanePosition;

void main() {
  vPlanePosition = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
export const ATMOSPHERE_FRAGMENT = /* glsl */ `
uniform vec3 u_color;
uniform float u_intensity;
uniform float u_opacity;
uniform float u_innerRadius;
uniform float u_outerRadius;
uniform float u_outerFade;

varying vec2 vPlanePosition;

void main() {
  float dist = length(vPlanePosition);
  float inner = u_innerRadius;
  float outer = max(inner + 0.001, u_outerRadius);
  float fadeEnd = outer + max(0.001, u_outerFade);

  float grow = smoothstep(inner, outer, dist);
  float fade = 1.0 - smoothstep(outer, fadeEnd, dist);
  float halo = clamp(grow * fade, 0.0, 1.0);

  vec3 color = u_color;
  float alpha = halo * u_intensity * u_opacity;
  if (alpha <= 0.001) discard;
  gl_FragColor = vec4(color, alpha);
}
`;

// Globe surface: white-to-blue gradient in camera space plus a faint fresnel rim.
export const SURFACE_VERTEX = /* glsl */ `
varying float vGradient;
varying float vFresnel;
uniform vec3 u_gradientDir;
uniform vec3 u_cameraPosition;
uniform vec3 u_cameraRight;
uniform vec3 u_cameraUp;
uniform vec3 u_cameraForward;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
  vec3 surfaceDir = normalize(worldPosition.xyz);
  vec3 surfaceCamera;
  surfaceCamera.x = dot(surfaceDir, u_cameraRight);
  surfaceCamera.y = dot(surfaceDir, u_cameraUp);
  surfaceCamera.z = dot(surfaceDir, u_cameraForward);
  vGradient = dot(surfaceCamera, normalize(u_gradientDir)) * 0.5 + 0.5;
  vec3 viewDir = normalize(u_cameraPosition - worldPosition.xyz);
  float fresnel = clamp(1.0 - max(dot(viewDir, worldNormal), 0.0), 0.0, 1.0);
  vFresnel = fresnel;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
export const SURFACE_FRAGMENT = /* glsl */ `
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_fresnelColor;
uniform float u_fresnelStrength;
uniform float u_fresnelPower;
uniform float u_opacity;
uniform float u_gradientContrast;
uniform float u_gradientOffset;

varying float vGradient;
varying float vFresnel;

void main() {
  float gradient = clamp(vGradient + u_gradientOffset, 0.0, 1.0);
  gradient = clamp(
    0.5 + (gradient - 0.5) * u_gradientContrast,
    0.0,
    1.0
  );
  vec3 baseColor = mix(u_colorA, u_colorB, gradient);
  float fresnelBase = pow(clamp(vFresnel, 0.0, 1.0), u_fresnelPower);
  float rimFactor = clamp(fresnelBase * u_fresnelStrength, 0.0, 1.0);
  vec3 color = mix(baseColor, u_fresnelColor, rimFactor);
  float alpha = clamp(u_opacity, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

// Land dots: point sprites on the sphere. A share of them periodically lifts off the surface
// ("corona"); hovering the card raises the share and the distance.
export const DOTS_VERTEX = /* glsl */ `
uniform float u_timeSec;
uniform float u_radius;
uniform float u_dotSize;
uniform float u_coronaBurstDistance;
uniform float u_coronaParticipation;
uniform float u_coronaNoiseStrength;
uniform float u_coronaNoiseScale;
uniform float u_gradientAngle;
uniform vec2 u_gradientScale;
uniform vec3 u_cameraRight;
uniform vec3 u_cameraUp;
uniform vec3 u_cameraForward;
uniform vec3 u_cameraPosition;
uniform float u_coronaBaseFlightDur;
uniform float u_coronaBaseFadeDur;
uniform float u_coronaLaunchInterval;
uniform float u_canvasHeight;
uniform float u_pixelRatio;

attribute float rndId;
attribute float sizeVariation;
attribute float opacityVariation;
attribute float coronaSeed;
attribute float varianceRate;
attribute float varianceMotion;
attribute float coronaCanParticipate;

varying float vGradientCoord;
varying float vOpacityVariation;
varying float vCoronaProgress;
varying float vCoronaVisibility;
varying float vDepthFacing;

const float DESIGN_PIXEL_RATIO = 2.0;

void main() {
  vec3 baseNormal = normalize(position);
  vec3 pos = baseNormal * u_radius;
  float coronaEase = 0.0;

  if (u_coronaParticipation > 0.001 && coronaCanParticipate > 0.5) {
    float varianceScale = mix(0.667, 1.5, varianceMotion);
    float flightDuration = u_coronaBaseFlightDur * varianceScale;
    float fadeDuration = u_coronaBaseFadeDur * varianceScale;
    float desiredInterval = u_coronaLaunchInterval * mix(0.7, 1.7, varianceRate);
    float cycleLength = flightDuration + fadeDuration + max(desiredInterval - (flightDuration + fadeDuration), 0.0);

    float phase = mod(u_timeSec + coronaSeed * cycleLength, cycleLength);
    float launchIndex = mod(floor((u_timeSec + coronaSeed * cycleLength) / cycleLength), 100.0);

    float h = fract((coronaSeed * 127.1 + launchIndex * 311.7) * 0.00001 + coronaSeed);
    float coronaActive = step(h, u_coronaParticipation);

    float inFlight = step(phase, flightDuration);
    float travelPhase = phase / flightDuration;
    coronaEase = coronaActive * inFlight * smoothstep(0.0, 1.0, travelPhase);

    float fadeOut = smoothstep(0.65, 1.0, travelPhase);
    float fadePhase = clamp((phase - flightDuration) / fadeDuration, 0.0, 1.0);
    float fadeVisibility = mix(1.0 - fadeOut, 1.0, fadePhase);
    float idlePhase = step(flightDuration + fadeDuration, phase);
    float atSurface = 1.0 - coronaActive + (1.0 - inFlight);

    vCoronaProgress = coronaEase;
    vCoronaVisibility = mix(mix(fadeVisibility, 1.0, idlePhase), 1.0, idlePhase * atSurface);

    if (coronaEase > 0.001) {
      vec3 tangent = normalize(cross(baseNormal, vec3(0.0, 1.0, 0.0)));
      if (dot(tangent, tangent) < 0.01) tangent = normalize(cross(baseNormal, vec3(1.0, 0.0, 0.0)));
      vec3 bitangent = cross(baseNormal, tangent);

      float motionRate = 1.0 / varianceScale;
      float pathPhase = (launchIndex + mod(u_timeSec * motionRate, 6.283)) * u_coronaNoiseScale + rndId * 12.37;
      vec3 flow = tangent * sin(pathPhase) + bitangent * cos(pathPhase * 0.8);
      vec3 pathOffset = flow * (0.6 * u_coronaNoiseStrength * coronaEase);

      pos = baseNormal * (u_radius + u_coronaBurstDistance * coronaEase) + pathOffset;
    }
  } else {
    vCoronaProgress = 0.0;
    vCoronaVisibility = 1.0;
  }

  vec3 worldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  vec3 worldNormal = normalize(mat3(modelMatrix) * baseNormal);

  vec3 viewDir = normalize(u_cameraPosition - worldPosition);
  vDepthFacing = dot(viewDir, worldNormal);

  vec3 worldDir = normalize(worldPosition);
  vec2 planar = vec2(dot(worldDir, u_cameraRight), dot(worldDir, u_cameraUp)) / max(u_gradientScale, vec2(0.001));
  float angleRad = radians(u_gradientAngle);
  vGradientCoord = dot(planar, vec2(cos(angleRad), sin(angleRad))) * 0.5 + 0.5;

  vOpacityVariation = opacityVariation;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float coronaScale = mix(1.0, 0.35, smoothstep(0.15, 0.85, coronaEase));

  float refHeight = 800.0;
  float heightScale = u_canvasHeight / refHeight;
  float perspective = 300.0 / -mvPosition.z;
  float scaledDotSize = u_dotSize * (u_pixelRatio / DESIGN_PIXEL_RATIO);

  gl_PointSize = scaledDotSize * sizeVariation * coronaScale * heightScale * perspective;
}
`;
export const DOTS_FRAGMENT = /* glsl */ `
precision mediump float;

uniform float u_opacity_factor;
uniform float u_coronaOpacityDrop;
uniform float u_depthFadeEnabled;
uniform float u_depthFadeFront;
uniform float u_depthFadeBack;
uniform float u_depthFadeMin;
uniform float u_depthFadeCurve;
uniform float u_gradientStops[3];
uniform vec3 u_gradientColors[3];

varying float vGradientCoord;
varying float vOpacityVariation;
varying float vCoronaProgress;
varying float vCoronaVisibility;
varying float vDepthFacing;

vec3 sampleGradient(float t) {
  float clamped = clamp(t, 0.0, 1.0);
  float s0 = u_gradientStops[0];
  float s1 = u_gradientStops[1];

  float t01 = clamp((clamped - s0) / max(1e-5, s1 - s0), 0.0, 1.0);
  float t12 = clamp((clamped - s1) / max(1e-5, u_gradientStops[2] - s1), 0.0, 1.0);

  vec3 c = mix(u_gradientColors[0], u_gradientColors[1], t01);
  c = mix(c, u_gradientColors[2], t12 * step(s1, clamped));
  return c;
}

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  if (dist > 0.5) discard;

  float alpha = smoothstep(0.5, 0.4, dist);
  vec3 color = sampleGradient(vGradientCoord);

  alpha *= u_opacity_factor * vOpacityVariation;
  alpha *= mix(1.0, max(0.0, 1.0 - u_coronaOpacityDrop), vCoronaProgress) * vCoronaVisibility;

  if (u_depthFadeEnabled > 0.5) {
    float range = max(0.0001, u_depthFadeFront - u_depthFadeBack);
    float mapped = clamp((vDepthFacing - u_depthFadeBack) / range, 0.0, 1.0);
    float fadeFactor = pow(mapped, max(0.01, u_depthFadeCurve));
    alpha *= mix(clamp(u_depthFadeMin, 0.0, 1.0), 1.0, fadeFactor);
  }

  color = mix(color, vec3(1.0), vCoronaProgress * 0.45);

  gl_FragColor = vec4(color, alpha);
}
`;
