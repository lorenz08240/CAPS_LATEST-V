// How it works, one bar per step and two for the last, each handing its result to the next. It follows
// three clones at once: the Agentic commerce card from stripe.com, the cube from resend.com and the
// Session management card from clerk.com, each filmed with its copy the same way (scripts/clips.ts).
//   record  three browsers film the originals; frames peel off into a strip
//   spec    the strip rises and a table of moving parts fills in, unknowns resolving to numbers
//   build   code types itself in; the copies appear in a preview
//   verify  the preview slides next to the originals, all replay, a scan line measures them
//   repeat  a third panel shows the real pixel difference; each round it shrinks, then a match
import { ACCENT, HOW_SHIFT, INK, MUTED, bar, blurFade, clamp, ease, el, frameUrl, lerp, mix, presence, prog, put, setSrc, setStyle, tw } from "./lib.js";
import { MATCH_AT } from "./intro.js";

// The times below are this scene's own: it plays HOW_SHIFT later, after the clones (main.js).
export const name = "how";
export const shift = HOW_SHIFT;
export const from = 12.8;
export const to = 28.85;

const S = [12.86, bar(5), bar(6), bar(7), bar(8)]; // record, spec, build, verify, repeat
const CX = 1250; // centre of the visual on the right

const STEPS = [
  ["Record", "Films the original in a real browser, frame by frame, at a fixed size and frame rate."],
  ["Spec", "Writes down every moving part: when it starts, how long it takes, how far it goes, on which curve."],
  ["Build", "Rebuilds it in your code, with what your project already uses."],
  ["Verify", "Films the copy the same way, and compares timing, easing and pixels."],
  ["Repeat", "Fixes the biggest difference and films again, until the numbers match."],
];

// the three clones: clips how-<name>-reference and how-<name>-copy, each shown in a pane `aspect` times
// as wide as it is tall (cropped to fit), with the element the recorder tracks
const SITES = [
  { name: "stripe", url: "stripe.com", aspect: 0.6, track: ".chat" },
  { name: "resend", url: "resend.com", aspect: 0.9, track: ".cube" },
  { name: "clerk", url: "clerk.com", aspect: 0.75, track: ".session" },
];
const clipOf = (site, side) => `how-${site.name}-${side}`;

const WIN_W = 560; // the small windows' own size; they're scaled into place
const PAD = 14; // around the panes in a small window
const GAP = 10; // between them
const TRIO_H = Math.floor((WIN_W - 2 * PAD - 2 * GAP) / SITES.reduce((a, s) => a + s.aspect, 0));
const BODY_H = TRIO_H + 2 * PAD;
const CHROME = 40;
// the recording windows: one per site, side by side, as tall as REC_H
const REC_H = 420;
const REC_GAP = 28;
const REC_Y = 222;
const REC_W = SITES.map((s) => Math.round(s.aspect * REC_H));
const REC_X = REC_W.map((_, i) => CX - (REC_W.reduce((a, w) => a + w, 0) + 2 * REC_GAP) / 2 + REC_W.slice(0, i).reduce((a, w) => a + w + REC_GAP, 0));
const TW = 84; // the strip's thumbnails, 84 x 112 (demo.css)

let root, texts, dashes;
let recWins, strip, thumbs;
let table, tableCount, rows, curve, curvePath, curveDot;
let editor, codeLines, chips;
let refWin, copyWin, copyFlash, scanRef, scanCopy, metrics, diffWin, diffRef, diffCopy;
let chart, roundLabel, bigValue, bars, matchPill;

// The three clips side by side, `h` tall, inside a small window's body: an <img> per pane.
function trio(parent, h = TRIO_H) {
  const box = el("div", "trio", parent);
  let x = 0;
  box._imgs = SITES.map((s) => {
    const pane = el("div", "pane", box);
    const w = Math.round(s.aspect * h);
    Object.assign(pane.style, { left: `${x}px`, width: `${w}px`, height: `${h}px` });
    x += w + GAP;
    return el("img", "fill", pane);
  });
  const w = x - GAP;
  Object.assign(box.style, { left: `${(WIN_W - w) / 2}px`, top: `${PAD}px`, width: `${w}px`, height: `${h}px` });
  return box;
}
// shows each pane's clip (`side`: reference or copy) at lt seconds into it
const play = (box, side, lt) => box._imgs.forEach((img, i) => setSrc(img, frameUrl(clipOf(SITES[i], side), Math.max(0, lt))));

function makeWindow(parent, url, w, h, chrome, cls = "") {
  const win = el("div", `win ${cls}`, parent);
  win.style.width = `${w}px`;
  const top = el("div", "win-bar", win, `<i></i><i></i><i></i><span class="win-url">${url}</span>`);
  top.style.height = `${chrome}px`;
  const body = el("div", "win-body", win);
  body.style.height = `${h}px`;
  return { win, top, body };
}

export function init(r) {
  root = r;

  // ---- the step names on the left ----
  texts = STEPS.map(([title, desc], i) => {
    const g = el("div", "how-text", root);
    el("div", "how-num", g, String(i + 1).padStart(2, "0"));
    el("div", "how-title", g, title);
    el("p", "how-desc", g, desc);
    return g;
  });
  const rail = el("div", "how-rail", root);
  dashes = STEPS.map(() => el("i", "", rail));
  root._rail = rail;

  // ---- record: a browser per original ----
  const lock = `<svg width="10" height="11" viewBox="0 0 11 12"><path d="M2 5V3.5a3.5 3.5 0 0 1 7 0V5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="0.5" y="5" width="10" height="7" rx="1.5" fill="currentColor"/></svg>`;
  recWins = SITES.map((s, i) => {
    const win = el("div", "win win--rec", root);
    win.style.width = `${REC_W[i]}px`;
    const top = el("div", "win-bar", win, `<span class="rec-dot"></span><span class="rec-url">${lock} ${s.url}</span>`);
    top.style.height = `${CHROME}px`;
    win._time = el("span", "rec-time", top, "00:00.00");
    const body = el("div", "win-body", win);
    body.style.height = `${REC_H}px`;
    win._img = el("img", "fill", body);
    win._box = el("div", "track-box", body, `<b></b><b></b><b></b><b></b><span>${s.track}</span>`);
    Object.assign(win._box.style, { left: "8px", top: "8px", right: "8px", bottom: "8px" });
    win._flash = el("div", "win-flash", body);
    return win;
  });
  strip = el("div", "strip", root);
  thumbs = Array.from({ length: 6 }, (_, j) => {
    const th = el("div", "thumb", strip);
    th._site = j % 3;
    th._img = el("img", "fill", th);
    th._label = el("span", "thumb-label", th);
    return th;
  });

  // ---- spec ----
  table = el("div", "spec", root);
  const head = el("div", "spec-bar", table, `<span>spec.md</span>`);
  tableCount = el("span", "spec-count", head);
  el("div", "spec-row spec-row--head", table, ["site", "element", "property", "start", "duration", "from → to", "easing"].map((c) => `<span>${c}</span>`).join(""));
  const ROWS = [
    ["stripe", ".chat-bubble", "opacity", "420 ms", "300 ms", "0 → 1", "linear"],
    ["stripe", ".particle-ring", "radius", "1440 ms", "900 ms", "1.4 → 1.0", "in-out"],
    ["resend", ".cube", "rotateY", "0 ms", "10 s", "0 → −359°", "linear"],
    ["resend", ".slice-left", "rotateX", "1500 ms", "2000 ms", "0 → −180°", "in-out"],
    ["clerk", ".laptop-lid", "rotateX", "hover", "1000 ms", "−75° → 20°", "expo-in-out"],
    ["clerk", ".device-value", "blur", "+200 ms", "600 ms", "8px → 0", "ease-out"],
  ];
  rows = ROWS.map((cells) => {
    const row = el("div", "spec-row", table);
    row._cells = cells.map((c, j) => {
      const cell = el("span", "", row);
      if (j < 3) {
        cell.textContent = c;
        return null;
      }
      cell.className = "spec-cell";
      const q = el("i", "spec-q", cell, "?");
      const v = el("b", "spec-v", cell, c);
      return { q, v };
    });
    return row;
  });
  curve = el("div", "curve", root, `
    <div class="curve-label">.slice-left · <span>cubic-bezier(0.42, 0, 0.58, 1)</span></div>
    <svg width="236" height="150" viewBox="-8 -8 236 150">
      <path d="M0 134H220M0 134V0" stroke="#e7e7e7" stroke-width="1.5" fill="none"/>
      <path d="M0 0H220" stroke="#efefef" stroke-width="1.5" stroke-dasharray="4 5" fill="none"/>
      <path class="curve-path" d="M0 134C92.4 134 127.6 0 220 0" stroke="${ACCENT}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <circle class="curve-dot" r="7" fill="#fff" stroke="${ACCENT}" stroke-width="3.5"/>
    </svg>`);
  curvePath = curve.querySelector(".curve-path");
  curveDot = curve.querySelector(".curve-dot");

  // ---- build ----
  editor = el("div", "editor", root, `<div class="editor-tabs"><span class="on">Clones.tsx</span><span>spec.md</span></div>`);
  const code = el("div", "editor-code", editor);
  const CODE = [
    `<c>// stripe.com, in CSS and three.js</c>`,
    `bubble.<f>animate</f>(fadeIn, { delay: <n>420</n> });`,
    `ring.<f>tighten</f>({ at: <n>1440</n>, radius: [<n>1.4</n>, <n>1</n>] });`,
    ``,
    `<c>// resend.com, in three.js</c>`,
    `cube.rotation.y = -(t / <n>10000</n>) * <k>TAU</k>;`,
    `slice.<f>turn</f>(<k>PI</k>, { at: <n>1500</n>, every: <n>5000</n> });`,
    ``,
    `<c>// clerk.com, in Framer Motion</c>`,
    `lid.<f>animate</f>({ rotateX: [<n>-75</n>, <n>20</n>] });`,
    `rows.<f>forEach</f>((r, i) => r.<f>unblur</f>(i * <n>50</n>));`,
  ];
  codeLines = CODE.map((html, i) => {
    const ln = el("div", "code-line", code, `<em>${i + 1}</em><span>${html || "&nbsp;"}</span>`);
    ln._text = ln.querySelector("span");
    return ln;
  });
  chips = ["CSS", "Framer Motion", "GSAP", "three.js"].map((c) => el("span", "chip", root, c));

  // ---- verify and repeat ----
  ({ win: refWin } = makeWindow(root, "stripe.com · resend.com · clerk.com", WIN_W, BODY_H, CHROME, "win--small win--trio"));
  refWin._trio = trio(refWin.querySelector(".win-body"));
  ({ win: copyWin } = makeWindow(root, "localhost:3000", WIN_W, BODY_H, CHROME, "win--small win--trio"));
  const copyBody = copyWin.querySelector(".win-body");
  copyWin._skeleton = el("div", "skeleton", copyBody, "<i></i><i></i><i></i>");
  copyWin._trio = trio(copyBody);
  copyFlash = el("div", "win-flash", copyBody);
  scanRef = el("div", "scan", refWin.querySelector(".win-body"));
  scanCopy = el("div", "scan", copyBody);
  metrics = el("div", "metrics", root);
  metrics._rows = [
    ["Timing", "every step of all three", 380, 43, (v) => `≤ ${Math.round(v)} ms`],
    ["Rotation", "the cube and the laptop lid, every frame", 9.6, 0, (v) => `${v.toFixed(2)}°`],
    ["Pixels", "that differ, once they settle", 6.4, 0.11, (v) => `≤ ${v.toFixed(2)} %`],
  ].map(([k, d, a, b, fmt]) => {
    const row = el("div", "metric", metrics, `<b>${k}</b><span>${d}</span>`);
    row._val = el("code", "metric-val", row);
    row._pass = el("i", "pass", row, "pass");
    Object.assign(row, { _a: a, _b: b, _fmt: fmt });
    return row;
  });
  ({ win: diffWin } = makeWindow(root, "difference", WIN_W, BODY_H, CHROME, "win--small win--diff win--trio"));
  const mixer = el("div", "diff-mix", diffWin.querySelector(".win-body"));
  diffRef = trio(mixer);
  diffCopy = trio(el("div", "diff-top", mixer));
  el("div", "diff-tint", diffWin.querySelector(".win-body"));

  chart = el("div", "chart", root);
  roundLabel = el("div", "chart-round", chart);
  bigValue = el("div", "chart-value", chart);
  el("div", "chart-sub", chart, "of pixels differ from the originals");
  matchPill = el("div", "match", chart, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Match`);
  const barBox = el("div", "chart-bars", chart);
  bars = [0, 1, 2, 3].map((i) => {
    const b = el("div", "chart-bar", barBox);
    b._fill = el("i", "", b);
    b._label = el("span", "", b, `round ${i + 1}`);
    return b;
  });
}

// ---------- rounds of the repeat step ----------
const ROUNDS = [S[4], bar(8.5), bar(9), bar(9.5)];
const MISS = [ // how far off the copy still is in each round: px, px, scale, s late
  [22, 14, 0.965, 0.42],
  [8, 5, 0.988, 0.15],
  [2.5, 1.5, 0.997, 0.05],
  [0, 0, 1, 0],
];
const VALUES = [12.4, 3.1, 0.6, 0.11];

function roundAt(t) {
  let k = 0;
  for (let i = 0; i < ROUNDS.length; i++) if (t >= ROUNDS[i]) k = i;
  return k;
}

// Where the two small windows sit: [x, y, scale] in build (copy only), verify and repeat.
const PLACES = {
  build: [1282, 372, 1],
  verifyRef: [716, 228, 520 / WIN_W],
  verifyCopy: [1264, 228, 520 / WIN_W],
  repeatRef: [715, 206, 340 / WIN_W],
  repeatCopy: [1075, 206, 340 / WIN_W],
  repeatDiff: [1435, 206, 340 / WIN_W],
};
const between = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];

export function render(t) {
  // ---- left column ----
  texts.forEach((g, i) => {
    const inAt = i === 0 ? 13.36 : S[i] - 0.14;
    const outAt = i === 4 ? 28.3 : S[i + 1] - 0.34;
    blurFade(g, t, { inAt, inDur: 0.62, outAt, outDur: 0.32, dy: 26, dyOut: -18, blur: 14 });
  });
  const railIn = presence(t, 13.45, 0.6, 28.3, 0.4);
  put(root._rail, { o: railIn.v, y: (1 - railIn.a) * 14, blur: railIn.b * 8 });
  dashes.forEach((d, i) => {
    const on = clamp(tw(t, S[i] - 0.1, 0.4) - (i < 4 ? tw(t, S[i + 1] - 0.1, 0.4) : 0));
    const done = i < 4 ? tw(t, S[i + 1] - 0.1, 0.4) : t > MATCH_AT ? 1 : 0;
    setStyle(d, "width", `${lerp(28, 72, on).toFixed(1)}px`);
    setStyle(d, "background-color", mix("#e6e6e9", done ? "#1a1a1a" : ACCENT, Math.max(on, done * 0.9)));
  });

  // ---- record: the three browsers come in one after another, film, and frames peel off ----
  const lt = Math.max(0, t - 13.0);
  const CAPS = thumbs.map((_, j) => 13.62 + j * 0.27);
  recWins.forEach((win, i) => {
    const rw = presence(t, 13.32 + i * 0.08, 0.66, 15.42 + i * 0.04, 0.42);
    put(win, { o: rw.v, x: REC_X[i], y: REC_Y + (1 - rw.a) * 40 - rw.b * 20, s: lerp(0.965, 1, rw.a) * lerp(1, 0.97, rw.b), blur: 16 * Math.max(1 - rw.a, rw.b) });
    if (rw.v <= 0) return;
    setSrc(win._img, frameUrl(clipOf(SITES[i], "reference"), lt));
    win._time.textContent = `00:${lt.toFixed(2).padStart(5, "0")}`;
    let fl = 0;
    CAPS.forEach((c, j) => {
      if (j % 3 === i && t >= c) fl = Math.max(fl, 0.55 * (1 - prog(t, c, c + 0.2)));
    });
    put(win._flash, { o: fl });
    const p = presence(t, 14.05 + i * 0.09, 0.45, 15.2, 0.3);
    put(win._box, { o: p.v, s: lerp(1.06, 1, p.a), blur: (1 - p.a) * 6 });
  });

  // strip: below the windows while recording, then it rises above the spec table
  const rise = ease.inOut(prog(t, 15.5, 16.1));
  const stripOut = presence(t, 0, 0, S[2] - 0.2, 0.4);
  const stripX = CX - (6 * TW + 5 * 12) / 2;
  const stripY = REC_Y + CHROME + REC_H + 44;
  put(strip, { o: stripOut.v, x: stripX, y: lerp(stripY, 170, rise) - stripOut.b * 16, s: lerp(1, 0.9, rise), blur: stripOut.b * 10 });
  setStyle(strip, "transform-origin", "50% 0");
  thumbs.forEach((th, j) => {
    const c = CAPS[j];
    if (t < c) return put(th, { o: 0 });
    const fly = ease.inOut(prog(t, c, c + 0.52));
    const i = th._site;
    setSrc(th._img, frameUrl(clipOf(SITES[i], "reference"), c - 13.0));
    th._label.textContent = `frame ${String(Math.round((c - 13.0) * 60)).padStart(3, "0")}`;
    // from its window's body (in strip px, before the strip moves) to slot j
    const fromX = REC_X[i] - stripX, fromY = REC_Y + CHROME - stripY;
    put(th, { o: clamp(fly * 3), x: lerp(fromX, j * (TW + 12), fly), y: lerp(fromY, 0, fly), s: lerp(REC_W[i] / TW, 1, fly) });
    put(th._label, { o: prog(fly, 0.75, 1) });
  });

  // ---- spec ----
  const sp = presence(t, 15.72, 0.62, S[2] - 0.22, 0.4);
  put(table, { o: sp.v, x: CX - 530, y: 316 + (1 - sp.a) * 36 - sp.b * 16, s: lerp(0.97, 1, sp.a) * lerp(1, 0.98, sp.b), blur: 14 * Math.max(1 - sp.a, sp.b) });
  let unknown = 0;
  rows.forEach((row, k) => {
    const a = ease.expo(prog(t, 15.9 + k * 0.1, 16.45 + k * 0.1));
    put(row, { o: a, y: (1 - a) * 14, blur: (1 - a) * 8 });
    row._cells.forEach((c, j) => {
      if (!c) return;
      const at = 16.5 + k * 0.17 + (j - 3) * 0.05;
      const r = ease.expo(prog(t, at, at + 0.4));
      if (r < 0.5) unknown++;
      put(c.q, { o: 1 - r, y: -r * 10, blur: r * 6 });
      put(c.v, { o: r, y: (1 - r) * 12, blur: (1 - r) * 6 });
    });
  });
  tableCount.textContent = `${rows.length} rows · ${unknown} unknown`;
  const cv = presence(t, 17.25, 0.6, S[2] - 0.26, 0.38);
  put(curve, { o: cv.v, x: CX + 250, y: 716 + (1 - cv.a) * 30 - cv.b * 12, blur: 12 * Math.max(1 - cv.a, cv.b) });
  const draw = ease.inOut(prog(t, 17.35, 17.95));
  setStyle(curvePath, "stroke-dasharray", "330");
  setStyle(curvePath, "stroke-dashoffset", (330 * (1 - draw)).toFixed(1));
  const u = ease.inOutSine(((t - 17.95) % 1.2 + 1.2) % 1.2 / 1.2);
  const bx = bez1(0.42, 0.58, u), by = bez1(0, 1, u);
  curveDot.setAttribute("cx", (bx * 220).toFixed(1));
  curveDot.setAttribute("cy", (134 - by * 134).toFixed(1));
  curveDot.style.opacity = t > 17.95 ? "1" : "0";

  // ---- build ----
  const ed = presence(t, S[2] - 0.05, 0.62, S[3] - 0.25, 0.4);
  put(editor, { o: ed.v, x: 700, y: 222 + (1 - ed.a) * 36, s: lerp(0.97, 1, ed.a), blur: 14 * Math.max(1 - ed.a, ed.b) });
  codeLines.forEach((ln, i) => {
    const at = S[2] + 0.18 + i * 0.105;
    const r = prog(t, at, at + 0.26);
    put(ln, { o: clamp(r * 2), blur: (1 - ease.outCubic(r)) * 3 });
    setStyle(ln._text, "clip-path", `inset(0 ${((1 - ease.outCubic(r)) * 100).toFixed(1)}% 0 0)`);
  });
  chips.forEach((c, i) => {
    const p = presence(t, S[2] + 0.4 + i * 0.07, 0.5, S[3] - 0.25, 0.35);
    put(c, { o: p.v, x: 700 + [0, 82, 262, 372][i], y: 752 + (1 - p.a) * 16, blur: 8 * Math.max(1 - p.a, p.b) });
    const used = i === 2 ? 0 : tw(t, S[2] + 1.0 + [0, 0.06, 0, 0.12][i], 0.35); // all but GSAP
    setStyle(c, "background-color", mix("#ffffff", "#efebff", used));
    setStyle(c, "color", mix(MUTED, ACCENT, used));
    setStyle(c, "border-color", mix("#e6e6e6", "#cfc6ff", used));
  });

  // ---- the copy's window: preview in build, then verify, then repeat ----
  const k = roundAt(t);
  const toVerify = ease.inOut(prog(t, S[3] - 0.3, S[3] + 0.35));
  const toRepeat = ease.inOut(prog(t, S[4] - 0.2, S[4] + 0.45));
  const allOut = presence(t, 0, 0, 28.28, 0.45);
  const cIn = presence(t, S[2] + 1.15, 0.6);
  let cp = between(PLACES.build, PLACES.verifyCopy, toVerify);
  cp = between(cp, PLACES.repeatCopy, toRepeat);
  put(copyWin, { o: cIn.v * allOut.v, x: cp[0], y: cp[1] + (1 - cIn.a) * 30, s: cp[2] * lerp(0.96, 1, cIn.a), blur: 14 * Math.max(1 - cIn.a, allOut.b) });
  const real = tw(t, S[2] + 1.55, 0.45);
  put(copyWin._skeleton, { o: 1 - real });
  let copyT;
  if (t < S[3]) copyT = Math.max(0, t - (S[2] + 1.55));
  else if (t < S[4]) copyT = t - S[3];
  else copyT = 0.6 + (t - ROUNDS[k]) - MISS[k][3];
  const miss = MISS[k];
  const copyTr = t >= S[4] ? `translate(${miss[0]}px, ${miss[1]}px) scale(${miss[2]})` : "none";
  if (cIn.v > 0) {
    play(copyWin._trio, "copy", copyT);
    put(copyWin._trio, { o: real });
    copyWin._trio._imgs.forEach((img) => setStyle(img, "transform", copyTr));
  }
  // a flash each time the copy is filmed again
  let cf = 0;
  for (const at of [S[3], ...ROUNDS]) if (t >= at) cf = 0.7 * (1 - prog(t, at, at + 0.28));
  put(copyFlash, { o: cf });

  const refIn = presence(t, S[3] - 0.05, 0.6);
  const rp = between(PLACES.verifyRef, PLACES.repeatRef, toRepeat);
  put(refWin, { o: refIn.v * allOut.v, x: rp[0], y: rp[1] + (1 - refIn.a) * 30, s: rp[2] * lerp(0.96, 1, refIn.a), blur: 14 * Math.max(1 - refIn.a, allOut.b) });
  const refT = t < S[4] ? Math.max(0, t - S[3]) : 0.6 + (t - ROUNDS[k]);
  if (refIn.v > 0) play(refWin._trio, "reference", refT);

  // the scan line runs across both while they replay
  const scan = prog(t, S[3] + 0.35, S[3] + 1.95);
  const scanO = scan > 0 && scan < 1 ? Math.min(1, Math.sin(Math.PI * scan) * 3) : 0;
  for (const s of [scanRef, scanCopy]) put(s, { o: scanO, x: ease.inOutSine(scan) * WIN_W });

  const mt = presence(t, S[3] + 0.5, 0.55, S[4] - 0.3, 0.35);
  put(metrics, { o: mt.v, x: 716, y: 590 + (1 - mt.a) * 30 - mt.b * 16, blur: 12 * Math.max(1 - mt.a, mt.b) });
  metrics._rows.forEach((row, i) => {
    const at = S[3] + 0.75 + i * 0.333;
    const a = ease.expo(prog(t, at, at + 0.5));
    put(row, { o: a, y: (1 - a) * 12, blur: (1 - a) * 6 });
    const n = ease.outExpo(prog(t, at + 0.1, at + 0.9));
    row._val.textContent = row._fmt(lerp(row._a, row._b, n));
    const ps = ease.outBack(prog(t, at + 0.8, at + 1.15));
    put(row._pass, { o: clamp(ps * 2), s: lerp(0.6, 1, ps) });
  });

  // ---- repeat ----
  const dIn = presence(t, S[4] + 0.05, 0.6);
  const dp = PLACES.repeatDiff;
  put(diffWin, { o: dIn.v * allOut.v, x: dp[0], y: dp[1] + (1 - dIn.a) * 30, s: dp[2] * lerp(0.96, 1, dIn.a), blur: 14 * Math.max(1 - dIn.a, allOut.b) });
  if (dIn.v > 0) {
    play(diffRef, "reference", refT);
    play(diffCopy, "copy", copyT);
    diffCopy._imgs.forEach((img) => setStyle(img, "transform", copyTr));
  }
  const ch = presence(t, S[4] + 0.2, 0.6);
  put(chart, { o: ch.v * allOut.v, x: 715, y: 452 + (1 - ch.a) * 30, blur: 14 * Math.max(1 - ch.a, allOut.b) });
  if (ch.v > 0) {
    const prev = k > 0 ? VALUES[k - 1] : 18;
    const n = ease.outExpo(prog(t, ROUNDS[k] + 0.05, ROUNDS[k] + 0.75));
    const v = lerp(prev, VALUES[k], n);
    bigValue.textContent = `${v < 1 ? v.toFixed(2) : v.toFixed(1)} %`;
    roundLabel.textContent = `Round ${k + 1}`;
    bars.forEach((b, i) => {
      const g = ease.expo(prog(t, ROUNDS[i] + 0.05, ROUNDS[i] + 0.6));
      const h = 230 * Math.sqrt(VALUES[i] / VALUES[0]);
      setStyle(b._fill, "height", `${Math.max(4, h * g).toFixed(1)}px`);
      setStyle(b._fill, "background-color", i === k ? ACCENT : "#dcdce0");
      put(b, { o: clamp(g * 3) });
    });
    const m = ease.outBack(prog(t, MATCH_AT, MATCH_AT + 0.45));
    put(matchPill, { o: clamp(m * 2), s: lerp(0.5, 1, m), blur: (1 - clamp(m)) * 6 });
    setStyle(bigValue, "color", mix(INK, ACCENT, tw(t, MATCH_AT, 0.4)));
  }
}

// one coordinate of a cubic bezier from (0,0) to (1,1) with control values p1, p2
function bez1(p1, p2, u) {
  const v = 1 - u;
  return 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u;
}
