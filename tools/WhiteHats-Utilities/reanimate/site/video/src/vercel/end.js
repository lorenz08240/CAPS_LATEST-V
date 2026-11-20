// The end card: "/reanimate", the install command typing itself in, and where to find it. Fades out at
// the very end.
import { DURATION, FRAME, END_AT } from "./shots.js";
import { ease, el, lerp, measure, presence, prog, put } from "../lib.js";

export const name = "end";
export const from = END_AT - 0.3;
export const to = DURATION + 1;

const CMD = "npx skills add NiazMorshed2007/reanimate -g";

let word, wordW, cmd, typed, caret, cmdW, links;

export function init(root) {
  word = el("div", "v-word", root, "/reanimate");
  wordW = measure("/reanimate", "v-word").w;
  cmd = el("div", "v-cmd", root, `<span>$</span>`);
  typed = el("b", "", cmd);
  typed.style.fontWeight = "400";
  caret = el("i", "", cmd);
  typed.textContent = CMD;
  cmdW = cmd.getBoundingClientRect().width;
  cmd.style.width = `${cmdW}px`;
  typed.textContent = "";
  links = el("p", "v-links", root, `reanimate.niazmorshed.dev<i>·</i>github.com/NiazMorshed2007/reanimate`);
}

export function render(t) {
  const end = 1 - ease.inOutSine(prog(t, DURATION - 0.5, DURATION - 0.05));
  const mid = (FRAME.top + FRAME.bottom) / 2;
  const w = presence(t, END_AT, 0.7);
  put(word, { o: w.v * end, x: 960 - wordW / 2, y: mid - 196 + (1 - w.a) * 24, blur: (1 - w.a) * 14, s: lerp(0.97, 1, w.a) });
  const c = presence(t, END_AT + 0.35, 0.6);
  put(cmd, { o: c.v * end, x: 960 - cmdW / 2, y: mid - 10 + (1 - c.a) * 20, blur: (1 - c.a) * 12 });
  const n = Math.round(CMD.length * prog(t, END_AT + 0.6, END_AT + 2.0));
  if (typed._n !== n) typed.textContent = CMD.slice(0, (typed._n = n));
  put(caret, { o: n < CMD.length || (t * 1.6) % 1 < 0.55 ? 1 : 0 });
  const l = presence(t, END_AT + 1.4, 0.6);
  put(links, { o: l.v * end, y: mid + 150 + (1 - l.a) * 12, blur: (1 - l.a) * 8 });
}
