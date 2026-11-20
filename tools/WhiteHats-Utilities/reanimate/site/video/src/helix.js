// Every clone at once. It opens on the Resend cube filling the screen, the last of the showcase; it is a
// tile of a mosaic of all 18 clips (three staggered rows of six), and at bar 5.5 the camera pulls back to
// show the rest. At bar 6.5 the mosaic unravels into one ribbon of playing frames wound into a helix, which
// turns for a few seconds while the camera pulls back further. The mosaic's tiles become the middle of the
// ribbon. Tiles turned away are flipped (they are edge-on when it happens) so no frame is ever mirrored.
import { bar, clipInfo, clipLen, ease, el, frameUrl, hash, lerp, prog, put, setSrc, setStyle } from "./lib.js";
import { CUBE_AT } from "./showcase.js";

export const name = "helix";
export const from = CUBE_AT - 0.15;

// in the mosaic's reading order; the cube is near the middle, where the camera starts
const EXAMPLES = [
  "stripe-agentic-commerce", "stripe-issuing", "reactbits-fading-stars", "stripe-crypto", "workos-atlas", "clerk-session-management",
  "clerk-fraud", "clerk-magic-links", "resend-cube", "clerk-mfa", "liveblocks-comments", "clerk-otp",
  "clerk-social-sign-on", "clerk-bot-detection", "clerk-advanced-security", "clerk-passwords", "clerk-api-keys", "clerk-cli",
];
const CUBE = EXAMPLES.indexOf("resend-cube");
const LIGHT = new Set(["stripe-agentic-commerce", "stripe-issuing", "stripe-crypto", "workos-atlas"]); // on white; the rest are dark
// where to crop each recording into a 4:3 tile: the card's margin in the recording, and the focus point
const CROP = {
  "stripe-agentic-commerce": [0, 0.5, 0.52], "stripe-issuing": [0, 0.5, 0.42], "stripe-crypto": [0, 0.5, 0.62],
  "workos-atlas": [0, 0.5, 0.42], "clerk-session-management": [24, 0.5, 0.62], "clerk-fraud": [24, 0.5, 0.62],
  "clerk-magic-links": [24, 0.5, 0.58], "clerk-api-keys": [24, 0.42, 0.5],
};

const TW = 340, TH = 255; // tile, px
const R = 1050; // helix radius
const PER_TURN = 18; // frames almost edge to edge, like a film strip
const STEP = 360 / PER_TURN;
const PITCH = 23; // rise per tile: a turn rises a tile and a gap
const N = 54; // three turns
const MID = 27; // the middle of the ribbon, and of the mosaic
const P = 1700; // perspective
const MS = 0.76; // tile scale in the mosaic
const GAP = 20;
// the mosaic's cells, in reading order: three rows of six, the middle one set across by half a tile
const CELLS = [0, 1, 2].flatMap((r) =>
  Array.from({ length: 6 }, (_, c) => ({
    r,
    x: 960 + (c - 2.5 + (r === 1 ? 0.25 : -0.25)) * (TW * MS + GAP),
    y: 500 + (r - 1) * (TH * MS + GAP),
  })),
);
// camera distance from the helix axis when the morph lands (the front tiles a little smaller than in the
// mosaic), and once it has pulled back
const D0 = P / 0.8 - P + R;
const D1 = 2150;

const ZOOM = [bar(5.5) - 0.05, bar(5.5) + 1.3]; // the camera pulls back from the cube to the whole mosaic
const Z0 = 940 / (TH * MS); // how close it starts: the cube's tile as tall as the showcase's clips
const MORPH = [bar(6.5) - 0.05, bar(6.5) + 1.45]; // 19.45 → 20.95
const PULLED = MORPH[1] + 1.4; // the camera has pulled back from the helix
const FADE = bar(7.75); // the helix gives way to "how it works"
export const to = FADE + 1.5;

// helix tile for each mosaic cell: the middle of the ribbon, the light ones spread out along it and the
// Resend cube in front when it lands
const RIBBON = [6, 7, 0, 2, 12, 1, 13, 10, 14, 8, 15, 3, 11, 16, 9, 4, 17, 5]; // EXAMPLES indices, in ribbon order
const HALF = Math.floor(EXAMPLES.length / 2);
const cellTile = (k) => MID - HALF + RIBBON.indexOf(k);

let root, world, tiles;

// rotation: still during the morph, then speeding up to SPEED deg/s, easing off at the end
const SPEED = 24;
function spin(t) {
  const a = MORPH[1] - 0.6;
  const ramp = 1.6;
  const u = t - a;
  if (u <= 0) return 0;
  const x = Math.min(u, ramp) / ramp;
  let d = SPEED * ramp * (x ** 3 - x ** 4 / 2); // ∫ smoothstep
  if (u > ramp) d += SPEED * (u - ramp);
  return d;
}

export function init(r) {
  root = r;
  world = el("div", "helix-world", root);
  // which example each helix tile shows: the mosaic's cells get theirs; the rest alternate light (Stripe,
  // WorkOS) and dark (the others) so neither clumps
  const show = new Array(N).fill(-1);
  CELLS.forEach((_, k) => (show[cellTile(k)] = k));
  const all = EXAMPLES.map((_, i) => i);
  const pools = [all.filter((i) => LIGHT.has(EXAMPLES[i])), all.filter((i) => !LIGHT.has(EXAMPLES[i]))];
  const next = [0, 0];
  for (let i = 0; i < N; i++) {
    if (show[i] >= 0) continue;
    const pool = pools[i % 2];
    let e;
    do e = pool[next[i % 2]++ % pool.length];
    while (e === show[i - 1] || e === show[i + 1] || e === show[i - PER_TURN] || e === show[i + PER_TURN]);
    show[i] = e;
  }
  tiles = Array.from({ length: N }, (_, i) => {
    const tile = el("div", "tile", world);
    const slug = EXAMPLES[show[i]];
    const info = clipInfo(slug);
    const [inset, fx, fy] = (CROP[slug] ?? [0, 0.5, 0.5]).map((v, j) => (j === 0 && slug.startsWith("clerk") ? 8 : v)); // Clerk: keep a white margin round the card
    const iw = info.width - 2 * inset, ih = info.height - 2 * inset;
    const k = Math.max(TW / iw, TH / ih);
    const img = el("img", "", tile);
    Object.assign(img.style, {
      width: `${info.width * k}px`,
      height: `${info.height * k}px`,
      left: `${-(inset + (iw - TW / k) * fx) * k}px`,
      top: `${-(inset + (ih - TH / k) * fy) * k}px`,
    });
    Object.assign(tile, { _img: img, _slug: slug, _off: hash(i * 7 + 3) * clipLen(slug), _theta: i * STEP, _y: (i - MID) * PITCH });
    return tile;
  });
  tiles.forEach((tile) => (tile._cell = null));
  CELLS.forEach((cell, k) => (tiles[cellTile(k)]._cell = cell));
  tiles[cellTile(CUBE)]._cube = true;
}

export function render(t) {
  const morph = ease.inOutCubic(prog(t, ...MORPH));
  const phi = -tiles[MID]._theta - spin(t) + spin(MORPH[1]); // the middle tile faces front when the morph lands
  const zoom = ease.inOutCubic(prog(t, MORPH[1] - 0.5, PULLED));
  const D = lerp(D0, D1, zoom) + 160 * ease.inOutSine(prog(t, PULLED, to));
  const tilt = -21 * ease.inOutCubic(prog(t, MORPH[0] + 0.3, PULLED + 0.4)) + 6 * ease.inOutSine(prog(t, PULLED + 0.4, to));
  const lean = -7 * ease.inOutCubic(prog(t, MORPH[1] - 0.4, PULLED + 0.6)) + 3 * ease.inOutSine(prog(t, PULLED + 0.6, to));
  const lift = -40 - tiles[MID]._y - 70 * ease.inOutCubic(prog(t, MORPH[0] + 0.3, PULLED + 0.4)); // the near ring sits lower; lift it to centre the coil
  const tau = (tilt * Math.PI) / 180;
  const ct = Math.cos(tau), st = Math.sin(tau);
  const fade = ease.inOutCubic(prog(t, FADE - 0.4, FADE + 1.4));
  const tq = Math.floor(t * 30) / 30; // tiles play at 30 fps

  // the camera: in on the cube (the cube's cell in the middle of the screen), then back to the whole
  // mosaic, zooming evenly; the cube cuts in like the showcase's clips
  const pull = ease.inOut(prog(t, ...ZOOM));
  const cam = Z0 ** (1 - pull);
  const cube = CELLS[CUBE];
  const enter = ease.expo(prog(t, CUBE_AT - 0.06, CUBE_AT + 0.4));
  const push = 1 + 0.025 * prog(t, CUBE_AT, ZOOM[0]);
  put(world, {
    o: enter * (1 - fade),
    blur: (1 - enter) * 14 + fade * 14,
    x: -(cube.x - 960) * cam * (1 - pull),
    y: -(cube.y - 540) * cam * (1 - pull),
    s: cam * lerp(1.07, 1, enter) * lerp(push, 1, pull) * lerp(1, 0.9, fade),
    rz: lean,
  });

  for (let i = 0; i < N; i++) {
    const tile = tiles[i];
    // on the helix
    const psi = tile._theta + phi;
    const pr = (psi * Math.PI) / 180;
    const X = R * Math.sin(pr);
    const Y0 = tile._y + lift;
    const Z0 = R * Math.cos(pr);
    const Y = Y0 * ct - Z0 * st;
    const Z = Y0 * st + Z0 * ct - D;
    // turned away from the camera? (normal · direction to the camera)
    const nx = Math.sin(pr), ny = -Math.cos(pr) * st, nz = Math.cos(pr) * ct;
    const back = nx * -X + ny * -Y + nz * (P - Z) < 0;
    let yaw = psi + (back ? 180 : 0);
    yaw = ((((yaw + 180) % 360) + 360) % 360) - 180;
    const front = (Math.cos(pr) + 1) / 2;

    let x = X, y = Y, z = Z, rx = tilt, ry = yaw, o, blur, sc = 1;
    const helixO = 0.05 + 0.95 * front ** 2.2;
    const helixBlur = (1 - front) ** 1.5 * 8;
    if (tile._cell) {
      // a mosaic cell: the cube is there from the start, the others show up as the camera pulls back;
      // then it curls onto the helix
      const { x: cx, y: cy } = tile._cell;
      const a = tile._cube ? 1 : ease.outCubic(prog(t, ZOOM[0] + 0.05, ZOOM[0] + 0.55));
      x = lerp(cx - 960, X, morph);
      y = lerp(cy - 540, Y, morph);
      z = lerp(0, Z, morph);
      rx = tilt * morph;
      ry = yaw * morph;
      o = lerp(a, helixO, morph);
      blur = helixBlur * morph;
      sc = lerp(MS, 1, morph);
    } else {
      const a = ease.expo(prog(t, MORPH[0] + 0.25 + hash(i) * 0.9, MORPH[0] + 1.1 + hash(i) * 0.9));
      o = helixO * a;
      blur = helixBlur + (1 - a) * 12;
      z -= (1 - a) * 500;
    }
    if (o <= 0.003) {
      put(tile, { o: 0 });
      continue;
    }
    // the cube is seen up close, so it plays its full-size frames from its own start
    if (tile._cube) setSrc(tile._img, frameUrl(tile._slug, t - CUBE_AT, { loop: true }));
    else setSrc(tile._img, frameUrl(tile._slug, tile._off + (tq - CUBE_AT) * 0.9, { small: true, loop: true }));
    put(tile, { o, x, y, z, rx, ry, s: sc, blur });
    setStyle(tile, "z-index", String(Math.round(z + 20000)));
  }
}
