// "/reanimate" slides in with onion-skin frames trailing behind it, the way the site's mark moves. Then it
// becomes the fixed column of a picker wheel whose other column scrolls through things to ask for, one a
// beat, like setting an alarm. The last pick is entered at 5.8 s and the line dives into the screen as the
// clones come in; it comes back as the header of "how it works", with a spinner that turns into a check
// when the copy matches.
import { ACCENT, BEAT, FAINT, HOW_SHIFT, INK, SUBTLE, T0, W, beat, bezier, blurFade, clamp, ease, el, lerp, measure, mix, presence, prog, put, setStyle } from "./lib.js";

export const name = "intro";
export const from = 0;
export const to = 28.85 + HOW_SHIFT;

const WORD = "/reanimate";
const BIG = 168; // title size, px
const ROW = 56; // wheel size, px
const STEP = 20; // degrees between rows on the wheel
const ROW_GAP = 86; // px between the centre row and the next
const R = ROW_GAP / Math.sin((STEP * Math.PI) / 180);
const MID = 540; // the wheel's centre line
const GAP = 24; // between "/reanimate" and the prompt
const TAIL = 96; // room after the prompt for the caret and the key
const HEADER_Y = 96;
const HEADER_S = 0.44;
export const MATCH_AT = 27.62; // the spinner in the header turns into a check (how.js: round 4, in its own time)
const HEADER_IN = 12.86 + HOW_SHIFT - 0.45; // the line is back as the header
const HEADER_OUT = 28.38 + HOW_SHIFT;

// the sources in [brackets] are tinted when the row is picked; the last one is "how it works"' header
const PROMPTS = [
  "the hero on [example.com], into Hero.tsx",
  "this loader, 0:03 to 0:05 of [loader.mov]",
  "the card hover in [this gif], pixel-perfect",
  "the logo marquee in [this video], with our logos",
  "the globe on [stripe.com], in three.js",
  "[this Lottie file], as CSS keyframes",
  "the feature cards on [clerk.com]",
  "the robot on [workos.com], into Hero.tsx",
  "the page transition in [demo.mp4]",
  "three widgets from [stripe.com], [resend.com] and [clerk.com]",
];
const LAST = PROMPTS.length - 1;
const promptHtml = (p) => p.replace(/\[([^\]]+)\]/g, `<span class="intro-src">$1</span>`);

// The wheel position (index of the row in the middle) over time: a step every beat, landing on the
// beat, then a flick through the rest that settles on the last prompt.
const SPIN = bezier(0.5, 0, 0.12, 1);
const STEPS = [
  [1.9, 2.5, -2.6, 0, ease.expo],
  ...[1, 2, 3].map((n, i) => [beat(n) - 0.36, beat(n) + 0.02, i, i + 1, ease.soft]),
  [beat(3) + 0.12, beat(5), 3, LAST, SPIN],
];
function wheelAt(t) {
  let p = STEPS[0][2];
  for (const [a, b, p0, p1, e] of STEPS) {
    if (t < a) break;
    p = t >= b ? p1 : lerp(p0, p1, e(prog(t, a, b)));
  }
  return p;
}

let root, glow, tagline, caption, line, band, word, chars, ghosts, wheel, rows, caret, key, status, spinner, check;
let L; // layout, measured once the fonts are in

export function init(r) {
  root = r;
  glow = el("div", "intro-glow", root);
  tagline = el("p", "intro-tagline", root, "Reverse-engineer animations you like. Build your own on top.");
  caption = el("p", "intro-caption", root, "Say what you want, where it is and where it should go.");
  line = el("div", "intro-line", root);
  band = el("div", "intro-band", line);
  ghosts = [0.2, 0.12, 0.07, 0.04].map((alpha) => {
    const g = el("div", "intro-word intro-word--ghost", line, WORD);
    g.style.color = `rgb(140 140 148 / ${alpha})`;
    return g;
  });
  word = el("div", "intro-word", line);
  chars = [...WORD].map((c) => el("span", "intro-char", word, c));
  wheel = el("div", "intro-wheel", line);
  rows = PROMPTS.map((p) => {
    const row = el("div", "intro-row", wheel, promptHtml(p));
    row._src = [...row.querySelectorAll(".intro-src")];
    return row;
  });
  caret = el("div", "intro-caret", line);
  key = el("div", "intro-key", line, `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 5v7a3 3 0 0 1-3 3H5"/><path d="m9 19-4-4 4-4"/></svg>`);
  status = el("div", "intro-status", line);
  spinner = el("div", "intro-spinner", status, `<svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="#e4e4e7" stroke-width="6"/><path d="M32 8a24 24 0 0 1 24 24" fill="none" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/></svg>`);
  check = el("div", "intro-check", status, `<svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${ACCENT}"/><path d="M20 33l8 8 16-17" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`);

  // layout
  const wordW = word.getBoundingClientRect().width;
  chars.forEach((c) => (c.style.color = SUBTLE));
  const promptW = PROMPTS.map((p) => measure(promptHtml(p), "intro-row").w);
  const sW = ROW / BIG;
  const rowWordW = wordW * sW;
  const total = rowWordW + GAP + Math.max(...promptW) + TAIL;
  const xW = (W - total) / 2;
  const xP = xW + rowWordW + GAP;
  const lastEnd = xP + promptW[LAST] + TAIL;
  L = { wordW, sW, promptW, xW, xP, lineCx: (xW - 36 + lastEnd) / 2 };
  rows.forEach((row) => (row.style.left = `${xP}px`));
  wheel.style.perspectiveOrigin = `${xP + Math.max(...promptW) / 2}px ${MID}px`;
}

export function render(t) {
  const { wordW, sW, promptW, xW, xP } = L;
  const p = wheelAt(t);
  const v = (wheelAt(t + 0.008) - wheelAt(t - 0.008)) / 0.016; // rows per second

  // ---- the word: slides in from the left, onion skins trailing; then shrinks into the wheel's line ----
  const slide = (u) => -230 * (1 - ease.outQuart(prog(u, 0.1, 1.3)));
  const toWheel = ease.inOut(prog(t, 1.85, 2.4));
  const xLeft = lerp(W / 2 - wordW / 2, xW, toWheel) + slide(t) * (1 - toWheel);
  const yC = lerp(510, MID, toWheel);
  const s = lerp(1, sW, toWheel);
  put(word, { x: xLeft, y: yC - BIG / 2, s });
  chars.forEach((c, i) => {
    const a = ease.expo(prog(t, 0.12 + i * 0.04, 0.75 + i * 0.04));
    put(c, { o: a, y: (1 - a) * 46, blur: (1 - a) * 18 });
  });
  const skins = presence(t, 0.12, 0.35, 1.15, 0.4).v;
  ghosts.forEach((g, k) => {
    const lag = (k + 1) * 0.085;
    put(g, { o: skins * clamp((slide(t) - slide(t - lag)) / 18), x: xLeft - slide(t) + slide(t - lag), y: yC - BIG / 2, blur: 1 + k * 1.2 });
  });

  const g = presence(t, 0.2, 1.0, 5.8, 0.45).v;
  const bloom = Math.exp(-(((t - 1.4) / 0.6) ** 2));
  put(glow, { o: g * (0.55 + 0.45 * bloom), s: 0.92 + 0.12 * bloom, y: lerp(0, 30, toWheel) });

  blurFade(tagline, t, { inAt: 0.75, inDur: 0.5, outAt: 1.85, outDur: 0.3, dy: 16, blur: 12 });

  // ---- the wheel ----
  const live = presence(t, 1.9, 0.5).a;
  const scatter = ease.inOutCubic(prog(t, 6.0, 6.3)); // all but the picked row, for good
  const spinBlur = Math.min(9, Math.abs(v) * 0.75);
  rows.forEach((row, i) => {
    const d = i - p;
    if (Math.abs(d) > 4.6 || live <= 0) return put(row, { o: 0 });
    const a = d * STEP;
    const rad = (a * Math.PI) / 180;
    const sel = clamp(1 - Math.abs(d));
    const away = i === LAST ? 0 : scatter;
    const fade = clamp(1 - Math.abs(d) / 4.4) ** 1.3;
    put(row, {
      o: live * fade * (1 - away) * (Math.abs(a) > 88 ? 0 : 1),
      y: R * Math.sin(rad) + Math.sign(d || 1) * away * 170,
      z: R * (Math.cos(rad) - 1),
      rx: -a,
      blur: Math.max(0, Math.abs(d) - 0.35) * 1.4 + spinBlur * (1 - sel * 0.4) + away * 12,
    });
    setStyle(row, "color", mix(FAINT, INK, sel));
    row._src.forEach((src) => setStyle(src, "color", mix(FAINT, ACCENT, sel)));
  });

  // the band behind the picked row, as wide as the prompt in it
  const i0 = clamp(Math.floor(p), 0, LAST), i1 = clamp(Math.ceil(p), 0, LAST);
  const pw = lerp(promptW[i0], promptW[i1], p - Math.floor(p));
  const bandIn = ease.expo(prog(t, 1.95, 2.5));
  const bandL = xW - 36, bandR = xP + pw + TAIL;
  setStyle(band, "width", `${(bandR - bandL).toFixed(1)}px`);
  put(band, { o: bandIn, x: bandL, y: MID - 52, sx: lerp(0.94, 1, bandIn) });

  const settled = clamp(1 - Math.abs(v) * 0.7);
  const blink = ((t - T0) / BEAT) % 1 < 0.56 ? 1 : 0;
  put(caret, { o: presence(t, 2.5, 0.2, 5.45, 0.12).v * settled * blink, x: xP + pw + 12, y: MID - 32 });

  const k = presence(t, 5.4, 0.3, 6.3, 0.25, ease.outBack);
  const press = Math.sin(Math.PI * prog(t, 5.76, 5.98));
  put(key, { o: k.v, x: xP + promptW[LAST] + 16, y: MID - 32 + press * 3, s: lerp(0.6, 1, k.a) * (1 - press * 0.08), blur: (1 - k.a) * 8 + k.b * 8 });
  setStyle(key, "background-color", mix("#ffffff", "#ececf0", press));

  const matched = MATCH_AT + HOW_SHIFT;
  const st = presence(t, HEADER_IN + 0.3, 0.4);
  const done = ease.outBack(prog(t, matched, matched + 0.4));
  put(status, { o: st.v, x: xP + promptW[LAST] + 16, y: MID - 32, s: lerp(0.5, 1, st.a) });
  put(spinner, { o: 1 - prog(t, matched, matched + 0.15), raw: `rotate(${(t * 400) % 360}deg)` });
  put(check, { o: clamp(done * 1.4), s: lerp(0.4, 1, done) });

  // ---- the line dives into the screen as the clones come in, and comes back as the header ----
  if (t < HEADER_IN - 1) {
    const gone = ease.inOutCubic(prog(t, 6.0, 6.3));
    put(line, { o: 1 - gone, s: 1 + 0.12 * gone, blur: 14 * gone });
  } else {
    const h = presence(t, HEADER_IN, 0.55, HEADER_OUT, 0.42);
    put(line, { o: h.v, x: W / 2 - L.lineCx, y: HEADER_Y - MID + (1 - h.a) * 14 - h.b * 16, s: HEADER_S, blur: 10 * Math.max(1 - h.a, h.b) });
  }
  setStyle(line, "transform-origin", `${L.lineCx.toFixed(1)}px ${MID}px`);

  blurFade(caption, t, { inAt: 2.2, inDur: 0.5, outAt: 5.85, outDur: 0.3, dy: 14, blur: 10 });
}
