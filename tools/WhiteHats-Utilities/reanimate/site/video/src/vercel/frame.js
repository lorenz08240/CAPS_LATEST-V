// The frame the whole video sits in: two rules across the stage and two down it, drawn in at the start, with
// a cross where they meet, and a counter of the shots in the bottom-right corner.
import { el, ease, prog, put } from "../lib.js";
import { DURATION, FRAME, GRID_AT, SHOTS } from "./shots.js";

export const name = "frame";
export const from = 0;
export const to = DURATION + 1;

let rules, crosses, count;

export function init(root) {
  rules = [
    ["h", 0, FRAME.top],
    ["h", 0, FRAME.bottom],
    ["v", FRAME.left, 0],
    ["v", FRAME.right, 0],
  ].map(([dir, x, y]) => Object.assign(el("div", `v-rule v-rule--${dir}`, root), { _x: x, _y: y, _dir: dir }));
  crosses = [FRAME.left, FRAME.right].flatMap((x) => [FRAME.top, FRAME.bottom].map((y) => Object.assign(el("div", "v-cross", root), { _x: x - 10, _y: y - 10 })));
  count = el("div", "v-source v-count", root);
}

export function render(t) {
  const end = 1 - ease.inOutSine(prog(t, DURATION - 0.5, DURATION - 0.05));
  // already there on the first frame, so the thumbnail isn't empty
  for (const r of rules) put(r, { o: end, x: r._x, y: r._y });
  for (const c of crosses) put(c, { o: end, x: c._x, y: c._y });
  // 01 / 06 while the shots play
  const k = SHOTS.findLastIndex((s) => t >= s.at - 0.1);
  const label = t < GRID_AT - 0.1 ? `${String(k + 1).padStart(2, "0")} / ${String(SHOTS.length).padStart(2, "0")}` : "";
  if (count._t !== label) count.textContent = count._t = label;
  put(count, { o: label ? end : 0, x: FRAME.right - 28 - 200, y: FRAME.bottom + 56 });
}
