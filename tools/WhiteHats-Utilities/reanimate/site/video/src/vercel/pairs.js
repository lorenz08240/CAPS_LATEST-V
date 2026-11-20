// The clones, one shot each, next to their originals (shots.js). "pair": the original and the copy side by
// side (or one above the other, whichever shows them bigger), each under a tag. "wipe": the copy laid over
// the original, cut by a line that sweeps across, so whatever is left of the line is vercel.com and whatever
// is right of it is the copy. Both play the same recording time on every frame.
import { clamp, clipInfo, el, ease, frameUrl, lerp, measure, presence, put, setSrc, setStyle } from "../lib.js";
import { FRAME, GRID_AT, SHOTS } from "./shots.js";

export const name = "pairs";
export const from = 0;
export const to = GRID_AT + 0.6;

// where the recordings go, inside the frame
const AREA = { x: FRAME.left + 56, y: FRAME.top + 48, w: FRAME.right - FRAME.left - 112, h: FRAME.bottom - FRAME.top - 96 };
const GAP = 40; // between the two panels of a pair
const TAG_H = 40; // a pair's tags, above the panels
const MAX_ZOOM = 2; // the frames are 2x, so up to twice their CSS size stays sharp
const ARROWS = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-5 6 5 6M15 6l5 6-5 6"/></svg>`;

const clip = (shot, side) => `${shot.slug}-${side}`;

function panel(parent, w, h) {
  const p = el("div", "v-panel", parent);
  Object.assign(p.style, { width: `${w}px`, height: `${h}px` });
  return p;
}

function layoutPair(shot, c) {
  // side by side, or stacked: whichever lets the recordings be bigger
  const side = Math.min((AREA.w - GAP) / 2 / c.width, (AREA.h - TAG_H) / c.height);
  const stack = Math.min(AREA.w / c.width, (AREA.h - GAP - 2 * TAG_H) / 2 / c.height);
  const across = side >= stack;
  const k = Math.min(MAX_ZOOM, Math.max(side, stack));
  const w = c.width * k, h = c.height * k;
  const total = across ? [2 * w + GAP, h + TAG_H] : [w, 2 * (h + TAG_H) + GAP];
  const x0 = AREA.x + (AREA.w - total[0]) / 2;
  const y0 = AREA.y + (AREA.h - total[1]) / 2;
  return ["reference", "copy"].map((s, i) => ({
    side: s,
    x: across ? x0 + i * (w + GAP) : x0,
    y: (across ? y0 : y0 + i * (h + TAG_H + GAP)) + TAG_H,
    w,
    h,
  }));
}

function build(root, shot) {
  const c = clipInfo(clip(shot, "copy"));
  const g = { shot, parts: [] };
  g.title = el("div", "v-title", root, shot.title);
  g.source = el("div", "v-source", root, shot.source);
  g.sourceW = measure(shot.source, "v-source").w;
  g.metric = el("div", "v-metric", root, `<i></i>${shot.metric[0]} <span>${shot.metric[1]}</span>`);
  if (shot.mode === "pair") {
    g.boxes = layoutPair(shot, c);
    for (const b of g.boxes) {
      b.el = panel(root, b.w, b.h);
      b.img = el("img", "", b.el);
      b.tag = el("div", `v-tag v-tag--${b.side}`, root, b.side === "reference" ? `<i></i><b>${shot.source}</b>` : `<i></i><b>the copy</b> built with /reanimate`);
    }
  } else {
    const k = Math.min(MAX_ZOOM, AREA.w / c.width, AREA.h / c.height);
    const w = c.width * k, h = c.height * k;
    g.box = { x: AREA.x + (AREA.w - w) / 2, y: AREA.y + (AREA.h - h) / 2, w, h };
    g.box.el = panel(root, w, h);
    g.ref = el("img", "", g.box.el);
    g.copy = el("img", "", g.box.el);
    g.line = el("div", "v-line", g.box.el);
    g.line.style.height = `${h}px`;
    g.knob = el("div", "v-knob", g.box.el, ARROWS);
    g.pillRef = el("div", "v-pill v-pill--ref", g.box.el, shot.source.split("/")[0]);
    g.pillCopy = el("div", "v-pill v-pill--copy", g.box.el, "copy");
    g.pillRefW = measure(shot.source.split("/")[0], "v-pill v-pill--ref").w;
  }
  return g;
}

let shots;

export function init(root) {
  shots = SHOTS.map((s) => build(root, s));
}

export function render(t) {
  shots.forEach((g, i) => {
    const { shot } = g;
    const next = i + 1 < SHOTS.length ? SHOTS[i + 1].at : GRID_AT;
    // the first shot is already there on frame 0, so the thumbnail shows it
    const inAt = i === 0 ? -1 : shot.at - 0.12;
    const p = presence(t, inAt, 0.55, next - 0.14, 0.32);
    if (p.v <= 0) {
      for (const e of [g.title, g.source, g.metric, ...(g.boxes ?? [g.box]).flatMap((b) => [b.el, b.tag].filter(Boolean))]) put(e, { o: 0 });
      return;
    }
    const lt = shot.start + Math.max(0, t - shot.at);
    const blur = 12 * Math.max(1 - p.a, p.b);

    put(g.title, { o: p.v, x: FRAME.left + 28, y: 44 + (1 - p.a) * 14 - p.b * 8, blur });
    put(g.source, { o: p.v, x: FRAME.right - 28 - g.sourceW, y: 60 + (1 - p.a) * 14 - p.b * 8, blur });
    const m = presence(t, inAt + 0.35, 0.55, next - 0.14, 0.32);
    put(g.metric, { o: shot.metric[0] ? m.v : 0, x: FRAME.left + 28, y: FRAME.bottom + 42 + (1 - m.a) * 12, blur: 10 * Math.max(1 - m.a, m.b) });

    const s = lerp(1.035, 1, p.a) * lerp(1, 0.985, p.b);
    if (g.boxes) {
      for (const [k, b] of g.boxes.entries()) {
        const q = presence(t, inAt + k * 0.08, 0.55, next - 0.14, 0.32);
        setSrc(b.img, frameUrl(clip(shot, b.side), lt));
        put(b.el, { o: q.v, x: b.x, y: b.y, s, blur: 12 * Math.max(1 - q.a, q.b) });
        put(b.tag, { o: q.v, x: b.x + 2, y: b.y - TAG_H + 4 + (1 - q.a) * 8, blur: 8 * Math.max(1 - q.a, q.b) });
      }
      return;
    }
    const b = g.box;
    setSrc(g.ref, frameUrl(clip(shot, "reference"), lt));
    setSrc(g.copy, frameUrl(clip(shot, "copy"), lt));
    put(b.el, { o: p.v, x: b.x, y: b.y, s, blur });
    // the line starts in the middle, sweeps left (more copy), right (more original) and back
    const u = clamp((t - shot.at) / shot.dur);
    const x = b.w * (0.5 - 0.3 * Math.sin(2 * Math.PI * ease.inOutSine(u)));
    setStyle(g.copy, "clip-path", `inset(0 0 0 ${x.toFixed(1)}px)`);
    put(g.line, { x, y: 0 });
    put(g.knob, { x, y: b.h / 2 });
    put(g.pillRef, { o: clamp((x - g.pillRefW - 24) / 40), x: x - 12 - g.pillRefW, y: 0 });
    put(g.pillCopy, { o: clamp((b.w - x - 110) / 40), x: x + 12, y: 0 });
  });
}
