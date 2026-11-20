// Dot layout for the globe (port of stripe.com's dot generator). Points are laid on a
// Fibonacci-style spiral, nudged by a deterministic hash ("poisson jitter"), and kept only where
// the land mask (map-dots.png alpha) is set. Positions and opacity are deterministic; size and
// the corona seeds derive from Math.random(), so they differ per page load, as on stripe.com.

const hash3 = (x, y, z) => {
  const v = 43758.5453 * Math.sin(12.9898 * x + 78.233 * y + 37.719 * z);
  return v - Math.floor(v);
};
const hash1 = (x) => {
  const v = 43758.5453 * Math.sin(x);
  return v - Math.floor(v);
};
const normalize = (v) => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return len === 0 ? { x: 0, y: 0, z: 0 } : { x: v.x / len, y: v.y / len, z: v.z / len };
};

/** Equirectangular uv of the direction from `from` towards `to` (here: from the dot to the centre). */
const directionUv = (from, to) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return {
    u: 1 - (0.5 + Math.atan2(dz / len, dx / len) / (2 * Math.PI)),
    v: 0.5 + Math.asin(dy / len) / Math.PI,
  };
};

export function generateDots({
  imageWidth,
  imageHeight,
  imageData,
  dotCount,
  radius,
  poissonJitter,
  dotSizeVariation,
  dotOpacityVariation,
}) {
  const positions = [];
  const rndIds = [];
  const sizeVariations = [];
  const opacityVariations = [];
  const coronaSeeds = [];
  const varianceRates = [];
  const varianceMotions = [];
  const coronaCanParticipate = [];
  const centre = { x: 0, y: 0, z: 0 };

  for (let i = dotCount - 1; i >= 0; i -= 1) {
    const phi = Math.acos(-1 + (2 * i) / dotCount);
    const theta = Math.sqrt(dotCount * Math.PI) * phi;
    const ring = Math.sin(phi) * radius;
    let p = { x: ring * Math.sin(theta), y: Math.cos(phi) * radius, z: ring * Math.cos(theta) };

    if (poissonJitter > 0) {
      const amount = 0.15 * poissonJitter;
      let offset = {
        x: (hash3(p.x, p.y, p.z) - 0.5) * 2,
        y: (hash3(p.y, p.z, p.x) - 0.5) * 2,
        z: (hash3(p.z, p.x, p.y) - 0.5) * 2,
      };
      const n = normalize(p);
      const d = offset.x * n.x + offset.y * n.y + offset.z * n.z;
      offset = normalize({ x: offset.x - n.x * d, y: offset.y - n.y * d, z: offset.z - n.z * d }); // tangent only
      const moved = normalize({ x: p.x + offset.x * amount, y: p.y + offset.y * amount, z: p.z + offset.z * amount });
      p = { x: moved.x * radius, y: moved.y * radius, z: moved.z * radius };
    }

    const { u, v } = directionUv(p, centre);
    const alpha = imageData[4 * Math.floor(u * imageWidth) + 4 * imageWidth * Math.floor(v * imageHeight) + 3];
    if (!(alpha > 0)) continue;

    positions.push(p.x, p.y, p.z);
    const rnd = Math.random();
    rndIds.push(rnd);
    sizeVariations.push(1 + (rnd - 0.5) * dotSizeVariation);
    opacityVariations.push(1 - hash3(100 * p.x, 100 * p.y, 100 * p.z) * dotOpacityVariation);
    const seed = hash1(173.17 * rnd);
    coronaSeeds.push(seed);
    varianceRates.push(hash1((rnd + 0.31) * 97.13));
    varianceMotions.push(hash1((rnd + 0.73) * 57.77));
    coronaCanParticipate.push(seed < 0.25 ? 1 : 0);
  }

  return {
    positions: new Float32Array(positions),
    rndIds: new Float32Array(rndIds),
    sizeVariations: new Float32Array(sizeVariations),
    opacityVariations: new Float32Array(opacityVariations),
    coronaSeeds: new Float32Array(coronaSeeds),
    varianceRates: new Float32Array(varianceRates),
    varianceMotions: new Float32Array(varianceMotions),
    coronaCanParticipate: new Float32Array(coronaCanParticipate),
  };
}

export const transferables = (dots) => Object.values(dots).map((array) => array.buffer);
