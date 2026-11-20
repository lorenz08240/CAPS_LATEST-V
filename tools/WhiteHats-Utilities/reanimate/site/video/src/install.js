// The end card: "/reanimate" slides in again with its onion skins, the install command types itself into
// a dark pill, the copy button is pressed, then how to start and where to find it. The word, gray all
// video, turns to ink a letter at a time. Fades to white at the end.
import { BEAT, DURATION, INK, SUBTLE, T0, bar, clamp, ease, el, lerp, mix, presence, prog, put, setStyle } from "./lib.js";

export const name = "install";
export const from = 39.2;
export const to = DURATION + 1;

const AT = bar(14.25); // 40.17
const INK_AT = bar(15.75); // the word turns from SUBTLE to INK
const CMD = "npx skills add NiazMorshed2007/reanimate -g";

let root, glow, word, chars, ghosts, pill, typed, caret, copy, copyLabel, hint, links, wordW;

export function init(r) {
  root = r;
  glow = el("div", "intro-glow end-glow", root);
  ghosts = [0.2, 0.11, 0.06].map((alpha) => {
    const g = el("div", "end-word", root, "/reanimate");
    g.style.color = `rgb(140 140 148 / ${alpha})`;
    return g;
  });
  word = el("div", "end-word", root);
  chars = [..."/reanimate"].map((c) => el("span", "intro-char", word, c));
  wordW = word.getBoundingClientRect().width;
  pill = el("div", "end-pill", root, `<span class="end-dollar">$</span>`);
  typed = el("span", "end-typed", pill);
  caret = el("i", "end-caret", pill);
  copy = el("span", "end-copy", pill);
  copyLabel = el("span", "", copy, "Copy");
  copy._check = el("span", "end-copied", copy, `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Copied`);
  hint = el("p", "end-hint", root, `Then, in Claude Code, type <code>/reanimate</code> and say what you want.`);
  links = el("p", "end-links", root, `reanimate.niazmorshed.dev<i>·</i>github.com/NiazMorshed2007/reanimate`);
  // the pill is as wide as the whole command, so it doesn't grow while typing
  typed.textContent = CMD;
  pill._w = pill.getBoundingClientRect().width;
  pill.style.width = `${pill._w}px`;
  typed.textContent = "";
}

export function render(t) {
  const end = 1 - ease.inOutSine(prog(t, DURATION - 0.45, DURATION - 0.02));

  const g = presence(t, AT - 0.4, 1.6).v;
  put(glow, { o: g * 0.9 * end, y: -70, s: lerp(0.9, 1, g) });

  // the word, as in the intro: in from the left, onion skins behind, letters de-blurring
  const slide = (u) => -150 * (1 - ease.outQuart(prog(u, AT - 0.1, AT + 1.0)));
  const x = 960 - wordW / 2;
  put(word, { o: end, x: x + slide(t), y: 296 });
  chars.forEach((c, i) => {
    const a = ease.expo(prog(t, AT - 0.05 + i * 0.045, AT + 0.6 + i * 0.045));
    put(c, { o: a, y: (1 - a) * 30, blur: (1 - a) * 14 });
    setStyle(c, "color", mix(SUBTLE, INK, ease.inOutSine(prog(t, INK_AT - 0.15 + i * 0.06, INK_AT + 0.55 + i * 0.06))));
  });
  const skins = presence(t, AT - 0.05, 0.3, AT + 0.6, 0.5).v;
  ghosts.forEach((gh, k) => {
    const lag = (k + 1) * 0.08;
    put(gh, { o: skins * clamp((slide(t) - slide(t - lag)) / 14) * end, x: x + slide(t - lag), y: 296, blur: 1 + k });
  });

  // the command
  const pp = presence(t, AT + 0.45, 0.6);
  put(pill, { o: pp.v * end, x: 960 - pill._w / 2, y: 512 + (1 - pp.a) * 24, s: lerp(0.96, 1, pp.a), blur: (1 - pp.a) * 12 });
  const n = Math.round(CMD.length * prog(t, AT + 0.75, AT + 0.75 + 4 * BEAT * 0.55));
  if (typed._n !== n) typed.textContent = CMD.slice(0, (typed._n = n));
  const typing = n < CMD.length;
  put(caret, { o: typing || ((t - T0) / BEAT) % 1 < 0.55 ? 1 : 0 });
  const cp = presence(t, AT + 2.3, 0.5);
  put(copy, { o: cp.v, x: 0, s: lerp(0.9, 1, cp.a) * (1 - 0.08 * Math.sin(Math.PI * prog(t, AT + 3.3, AT + 3.5))) });
  const copied = ease.expo(prog(t, AT + 3.42, AT + 3.8));
  put(copyLabel, { o: 1 - copied, blur: copied * 6 });
  put(copy._check, { o: copied, blur: (1 - copied) * 6 });
  setStyle(copy, "color", copied > 0.5 ? "#d9d3ff" : "#a1a1aa");

  const h = presence(t, AT + 2.05, 0.6);
  put(hint, { o: h.v * end, y: 668 + (1 - h.a) * 16, blur: (1 - h.a) * 10 });
  const l = presence(t, AT + 2.75, 0.7);
  put(links, { o: l.v * end, y: 968 + (1 - l.a) * 12, blur: (1 - l.a) * 8 });
}
