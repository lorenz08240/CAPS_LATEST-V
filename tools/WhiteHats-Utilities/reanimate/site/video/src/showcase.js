// The clones, big, one every two beats from bar 1.5, right after the prompt is entered. Each comes in with
// a quick push and blur, drifts a little while it plays from a good moment, and gives way to the next. The
// last one, the Resend cube, is a tile of the mosaic seen up close (helix.js), and the camera pulls back.
import { bar, clipInfo, ease, el, frameUrl, lerp, prog, put, setSrc } from "./lib.js";

export const name = "showcase";
export const from = bar(1.5) - 0.2;

// A clip on a card: its frames, scaled, with a soft shadow under the card inside the frame.
// inset: the card's margin inside the recording (the Clerk cards were filmed with 24 px around them).
const LOOK = {
  stripe: { inset: 0, radius: 6, shadow: true },
  clerk: { inset: 24, radius: 16, shadow: true },
  workos: { inset: 0, radius: 0, shadow: false },
  resend: { inset: 0, radius: 16, shadow: true },
  reactbits: { inset: 0, radius: 16, shadow: true },
  liveblocks: { inset: 0, radius: 14, shadow: true },
};
function card(parent, slug, scale) {
  const c = clipInfo(slug);
  const look = LOOK[slug.split("-")[0]];
  const w = c.width * scale, h = c.height * scale;
  const g = el("div", "ex-card", parent);
  Object.assign(g.style, { width: `${w}px`, height: `${h}px` });
  if (look.shadow) {
    const sh = el("div", "ex-shadow", g);
    const i = look.inset * scale;
    Object.assign(sh.style, { left: `${i}px`, top: `${i}px`, right: `${i}px`, bottom: `${i}px`, borderRadius: `${look.radius * scale}px` });
  }
  g._img = el("img", "fill", g);
  g._img.style.borderRadius = `${look.radius * scale}px`;
  Object.assign(g, { _w: w, _h: h });
  return g;
}

const BOX = [1680, 940]; // the most of the screen a clip fills, px
// [clip, where in it to start, speed], light and dark taking turns
const SLOTS = [
  ["reactbits-fading-stars", 0.5, 1],
  ["stripe-agentic-commerce", 0.4, 1.4],
  ["liveblocks-comments", 0.15, 1],
  ["workos-atlas", 0.6, 1.2],
  ["clerk-api-keys", 0.2, 1.2],
  ["stripe-issuing", 0.5, 1.1],
  ["clerk-magic-links", 0.3, 1.2],
].map(([slug, start, speed], k) => ({ slug, start, speed, at: bar(1.5 + k / 2) }));
export const CUBE_AT = bar(1.5 + SLOTS.length / 2); // bar 5: the Resend cube, in helix.js
export const to = CUBE_AT + 0.3;

let cards;

export function init(root) {
  cards = SLOTS.map((s) => {
    const c = clipInfo(s.slug);
    return Object.assign(card(root, s.slug, Math.min(BOX[0] / c.width, BOX[1] / c.height)), { _s: s });
  });
}

export function render(t) {
  cards.forEach((c, k) => {
    const { slug, start, speed, at } = c._s;
    const next = k + 1 < SLOTS.length ? SLOTS[k + 1].at : CUBE_AT;
    if (t < at - 0.1 || t > next + 0.25) return put(c, { o: 0 });
    const a = ease.expo(prog(t, at - 0.06, at + 0.4));
    const b = ease.inOutCubic(prog(t, next - 0.08, next + 0.16));
    const drift = prog(t, at, next) - 0.5; // a slow push across the slot, alternating sides
    setSrc(c._img, frameUrl(slug, start + speed * Math.max(0, t - at)));
    put(c, {
      o: a * (1 - b),
      x: 960 - c._w / 2 + (k % 2 ? 1 : -1) * 22 * drift,
      y: 540 - c._h / 2,
      s: lerp(1.07, 1, a) * (1 + 0.025 * (drift + 0.5)) * lerp(1, 0.97, b),
      blur: (1 - a) * 14 + b * 10,
    });
  });
}
