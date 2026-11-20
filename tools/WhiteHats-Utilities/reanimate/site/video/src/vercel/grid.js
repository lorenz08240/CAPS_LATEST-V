// Every copy at once, in two rows (the second centred when it's shorter), each one looping its recording,
// with a line above saying what they are.
import { el, frameUrl, lerp, presence, put, setSrc } from "../lib.js";
import { END_AT, FRAME, GRID_AT, SHOTS } from "./shots.js";

export const name = "grid";
export const from = GRID_AT - 0.3;
export const to = END_AT + 0.5;

const COLS = Math.ceil(SHOTS.length / 2);
const GAP = 24;
const AREA = { x: FRAME.left + 40, y: FRAME.top + 40, w: FRAME.right - FRAME.left - 80, h: FRAME.bottom - FRAME.top - 80 };
const CW = (AREA.w - (COLS - 1) * GAP) / COLS;
const CH = (AREA.h - GAP) / 2;

let lede, cells;

export function init(root) {
  lede = el("div", "v-lede", root, `<b>${SHOTS.length} animations</b> from vercel.com, nextjs.org and turborepo.com, each rebuilt by its own agent`);
  cells = SHOTS.map((s, i) => {
    const c = el("div", "v-cell", root);
    Object.assign(c.style, { width: `${CW}px`, height: `${CH}px` });
    c._img = el("img", "", c);
    c._label = el("div", "v-cell-label", c, s.source);
    const row = Math.floor(i / COLS);
    const inRow = row ? SHOTS.length - COLS : COLS;
    const x0 = AREA.x + (AREA.w - (inRow * CW + (inRow - 1) * GAP)) / 2;
    Object.assign(c, { _x: x0 + (i % COLS) * (CW + GAP), _y: AREA.y + row * (CH + GAP), _s: s });
    return c;
  });
}

export function render(t) {
  const l = presence(t, GRID_AT + 0.1, 0.6, END_AT - 0.15, 0.35);
  put(lede, { o: l.v, y: 52 + (1 - l.a) * 12, blur: 10 * Math.max(1 - l.a, l.b) });
  cells.forEach((c, i) => {
    const p = presence(t, GRID_AT - 0.1 + i * 0.07, 0.6, END_AT - 0.2 + i * 0.02, 0.35);
    // each loops its copy from where its shot started
    setSrc(c._img, frameUrl(`${c._s.slug}-copy`, c._s.start + Math.max(0, t - GRID_AT), { loop: true }));
    put(c, { o: p.v, x: c._x, y: c._y + (1 - p.a) * 30, s: lerp(0.96, 1, p.a) * lerp(1, 0.98, p.b), blur: 12 * Math.max(1 - p.a, p.b) });
  });
}
