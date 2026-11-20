// clerk.com "Multifactor Authentication" card (clerk.com module 492483), rebuilt without libraries.
//
// While the card is hovered, a cyan focus box steps across six one-time-code tiles and types a random digit
// (1–9) into each; then all six flash a cyan ring and fade, and a new code starts 0.7 s later. Leaving the
// card fades the whole overlay out over 0.3 s; the dark tiles underneath never change.
//
// clerk.com mounts an overlay inside <AnimatePresence> while the card is hovered and runs three Motion
// `useAnimate` sequences on it (A: focus the first tile, B: type five more digits, C: success flash).
// sequence() below re-implements the part of Motion's sequence builder those calls use — `at: "<"` and
// `"+0.1"`, per-value transitions, default duration/ease, `null` = current value, keyframes merged per element
// and value into one WAAPI animation spanning the sequence, values committed on finish — so the three
// sequences are copied from clerk.com's source verbatim, only with elements instead of selector strings.

const EASE = { easeOut: "cubic-bezier(0, 0, 0.58, 1)", easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)" };
const easing = (e) => (Array.isArray(e) ? `cubic-bezier(${e.join(", ")})` : EASE[e] || e);
const CSS_NAME = { opacity: "opacity", transform: "transform", clipPath: "clip-path" };
const EXIT_EASE = easing([0.25, 0.1, 0.35, 1]); // Motion's default tween for opacity (0.3 s)

// Latencies measured on clerk.com (1440x900, track.json): pointer → sequence A, between chained sequences
// (await + Motion keyframe resolution), end of a run → next overlay's clock (React re-render + effect),
// pointer leave → exit fade. Each start is planned on the document timeline from the previous planned end (not
// from when the promise happened to resolve), so the loop period stays 3.5 s and never drifts.
const LAG_IN = 44;
const GAP_SEQ = 25;
const GAP_LOOP = 50;
const LAG_OUT = 20;

function defaultOffset(n) {
  const o = [0];
  for (let i = 1; i < n; i++) o.push(i / (n - 1));
  return o;
}

function nextTime(current, at, prev) {
  if (typeof at === "number") return at;
  if (at[0] === "+" || at[0] === "-") return Math.max(0, current + parseFloat(at));
  if (at === "<") return prev;
  return current;
}

const now = () => document.timeline.currentTime ?? performance.now();

// A new WAAPI animation only gets its start time when it is ready (a frame or two later). Planned starts are
// expressed as delay from `created`; once ready, the start time is moved back to `created` so the plan holds.
// (If something else drives the animation, e.g. a recorder's virtual clock, it is paused by then: left alone.)
function anchor(a, created) {
  a.ready.then(() => {
    if (a.playState === "running" && a.startTime !== null && a.startTime > created) a.startTime = created;
  }, () => {});
}

// Motion's createAnimationsFromSequence + animateSequence, for [elements[], keyframes, transition] segments.
function sequence(segments, { delay = 0, defaultTransition = {} } = {}, startAt) {
  const defaultDuration = defaultTransition.duration || 0.3;
  const values = new Map(); // element → Map(key → [{ at, value, easing }])
  let currentTime = 0;
  let prevTime = 0;
  let total = 0;
  for (const [targets, keyframes, transition = {}] of segments) {
    if (transition.at !== undefined) currentTime = nextTime(currentTime, transition.at, prevTime);
    let maxDuration = 0;
    for (const el of targets) {
      if (!values.has(el)) values.set(el, new Map());
      const byKey = values.get(el);
      for (const key of Object.keys(keyframes)) {
        const t = transition[key] || transition; // getValueTransition
        const list = [].concat(keyframes[key]);
        const times = defaultOffset(list.length);
        if (times.length === 1) times[1] = 1;
        if (list.length === 1) list.unshift(null);
        const d = t.delay || 0;
        const duration = t.duration ?? defaultDuration;
        const ease = t.ease || defaultTransition.ease || "easeOut";
        const start = currentTime + d;
        const end = start + duration;
        if (!byKey.has(key)) byKey.set(key, []);
        const seq = byKey.get(key);
        for (let i = 0; i < seq.length; i++) if (seq[i].at > start && seq[i].at < end) seq.splice(i--, 1);
        list.forEach((value, i) => seq.push({ at: start + (end - start) * times[i], value, easing: ease }));
        maxDuration = Math.max(maxDuration, d + duration);
        total = Math.max(total, end);
      }
    }
    prevTime = currentTime;
    currentTime += maxDuration;
  }

  // start at `startAt` on the document timeline, expressed as extra delay so it also works under virtual clocks
  const created = now();
  const lead = startAt - created;
  const anims = [];
  for (const [el, byKey] of values) {
    for (const [key, seq] of byKey) {
      seq.sort((a, b) => (a.at === b.at ? (a.value === null ? 1 : b.value === null ? -1 : 0) : a.at - b.at));
      const kf = [];
      const offsets = [];
      const eases = [];
      for (const k of seq) {
        kf.push(k.value);
        offsets.push(total ? k.at / total : 0);
        eases.push(k.easing || "easeOut");
      }
      if (offsets[0] !== 0) {
        offsets.unshift(0);
        kf.unshift(kf[0]);
        eases.unshift("easeInOut");
      }
      if (offsets[offsets.length - 1] !== 1) {
        offsets.push(1);
        kf.push(null);
      }
      const name = CSS_NAME[key];
      for (let i = 0; i < kf.length; i++) {
        if (kf[i] === null) kf[i] = i === 0 ? getComputedStyle(el).getPropertyValue(name) : kf[i - 1];
      }
      const frames = kf.map((v, i) => ({ [key]: String(v), offset: offsets[i], easing: easing(eases[i] || "linear") }));
      const a = el.animate(frames, { duration: total * 1000, delay: delay * 1000 + lead, fill: "both" });
      anchor(a, created);
      anims.push({ a, el, name, final: String(kf[kf.length - 1]) });
    }
  }
  const done = Promise.all(anims.map((x) => x.a.finished)).then(() => {
    for (const x of anims) {
      x.el.style.setProperty(x.name, x.final);
      x.a.cancel();
    }
  });
  done.catch(() => {});
  return {
    done,
    end: startAt + (delay + total) * 1000,
    cancel: () => anims.forEach((x) => x.a.cancel()),
  };
}

// ---------- clerk.com's three sequences (selectors replaced by the overlay's elements) ----------

const seqA = (o) => [
  [o.border, { opacity: 1, transform: ["scale(1.5)", "scale(0.9)", "scale(1)"] }, { duration: 0.3, opacity: { duration: 0.1 } }],
  [o.bg, { opacity: 1 }, { at: "<" }],
  [o.cursor, { opacity: 1, transform: ["scale(1.75)", "scale(1)"] }, { at: "<" }],
  [[o.digits[0]], { opacity: 1, transform: "scale(1)" }, { duration: 0.1 }],
];

function step(o, e) {
  const r = 44 * (e + 1);
  return [
    [o.cursor, { transform: `translateX(${r / 16}rem)` }, {}],
    [[...o.bg, ...o.border], { transform: `translateX(${r / 16}rem)` }, { at: "<" }],
    [o.mask, { clipPath: `inset(0 calc(100% - ${((e + 2) * 32 + (e + 1) * 12) / 16}rem) 0 ${r / 16}rem round 0.375rem)` }, { at: "<" }],
    [[o.digits[e + 1]], { opacity: 1, transform: "scale(1)" }, { duration: 0.1, at: "+0.1" }],
    [o.border, { transform: [`translateX(${r / 16}rem) scale(0.9)`, `translateX(${r / 16}rem) scale(1)`] }, { at: "<" }],
  ];
}
const seqB = (o) => [0, 1, 2, 3, 4].flatMap((e) => step(o, e));

const seqC = (o) => [
  [o.border, { opacity: 0, transform: "translateX(13.75rem) scale(1.5)" }],
  [o.digits, { opacity: 0, transform: ["scale(1)", "scale(1.5)"] }, { at: "<" }],
  [o.finale, { opacity: [1, 0], transform: ["scale(1)", "scale(1.5)"] }, { at: "<" }],
  [o.bg, { opacity: 0 }, { at: "<" }],
  [o.cursor, { opacity: 0, transform: "translateX(13.75rem) scale(1.5)" }, { at: "<" }],
];

// ---------- overlay ----------

const MASK_CELL =
  '<div data-num class="mfa-cell" style="clip-path: polygon(0 0, 100% 0, 100% 2.125rem, 0 2.125rem)"></div>';

function buildOverlay(host) {
  // clerk.com: useMemo(() => Array.from({ length: 6 }, () => Math.floor(9 * Math.random() + 1)), [])
  const digits = Array.from({ length: 6 }, () => Math.floor(9 * Math.random() + 1));
  const el = document.createElement("div");
  el.className = "mfa-overlay";
  el.innerHTML =
    `<div class="mfa-row">${digits
      .map((d) => `<div data-num class="mfa-cell"><div data-dot-active class="mfa-digit" style="opacity: 0; transform: scale(0.1)">${d}</div></div>`)
      .join("")}</div>` +
    `<div data-mask class="mfa-row mfa-mask" style="clip-path: inset(0 calc(100% - 2rem) 0 0 round 0.375rem)">${MASK_CELL.repeat(6)}</div>` +
    `<div class="mfa-clip"><div data-bg class="mfa-bg"></div><div data-cursor class="mfa-cursor"></div></div>` +
    `<div data-border class="mfa-border"></div>` +
    [0, 1, 2, 3, 4]
      .map((i) => `<div data-border-finale class="mfa-border mfa-border--finale" style="left: calc(44 / 16 * ${i}rem); opacity: 0"></div>`)
      .join("");
  host.append(el); // after any overlay still fading out, as AnimatePresence keeps exiting children in place
  const q = (s) => [...el.querySelectorAll(s)];
  return {
    el,
    token: 0,
    seq: null,
    fade: null,
    exiting: false,
    border: q("[data-border]"),
    bg: q("[data-bg]"),
    cursor: q("[data-cursor]"),
    mask: q("[data-mask]"),
    finale: q("[data-border-finale]"),
    digits: q("[data-dot-active]"),
  };
}

export async function mount(slot, card) {
  const host = slot.querySelector(".mfa-otp");
  if (!host) return;
  // the digits are the only Geist Mono text in the card and appear only on hover: load the face up front
  try {
    await document.fonts.load('500 16px "Geist Mono"', "0123456789");
  } catch {}

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let hovered = false;
  let live = null; // the overlay for the current hover (React key), possibly fading out

  // A → B → C, then onComplete; a newer token (restart, removal) stops the chain like clerk.com's `i = false`
  async function run(o, delay, startAt) {
    const token = ++o.token;
    o.seq?.cancel();
    try {
      o.seq = sequence(seqA(o), { delay, defaultTransition: { duration: 0.3, ease: [0.7, 0, 0.3, 1] } }, startAt);
      await o.seq.done;
      if (token !== o.token) return;
      o.seq = sequence(seqB(o), { defaultTransition: { duration: 0.15 } }, Math.max(o.seq.end + GAP_SEQ, now() - 40));
      await o.seq.done;
      if (token !== o.token) return;
      o.seq = sequence(seqC(o), {}, Math.max(o.seq.end + GAP_SEQ, now() - 40));
      await o.seq.done;
      if (token !== o.token) return;
      complete(o, o.seq.end);
    } catch {
      // cancelled
    }
  }

  // onComplete: h(.7), f(key + 1). Still hovered → the finished overlay exits (it is invisible by now) and a
  // fresh one with new digits mounts and starts after 0.7 s.
  function complete(o, end) {
    if (!hovered || live !== o || o.exiting) return;
    fadeOut(o, now());
    live = buildOverlay(host);
    run(live, 0.7, Math.max(end + GAP_LOOP, now() - 40));
  }

  function fade(o, to, startAt, onDone) {
    const from = getComputedStyle(o.el).opacity;
    o.fade?.cancel();
    const created = now();
    const a = o.el.animate([{ opacity: from }, { opacity: to }], { duration: 300, delay: startAt - created, easing: EXIT_EASE, fill: "both" });
    anchor(a, created);
    o.fade = a;
    a.finished.then(() => o.fade === a && onDone(a), () => {});
  }

  // AnimatePresence exit: opacity → 0 in 0.3 s while the sequence keeps running, then unmount (cancel all)
  function fadeOut(o, startAt) {
    o.exiting = true;
    fade(o, 0, startAt, () => {
      o.token++;
      o.seq?.cancel();
      o.el.remove();
      if (live === o) live = null;
    });
  }

  card.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "touch" || hovered) return;
    hovered = true;
    const t = Math.max(e.timeStamp, now()) + LAG_IN;
    if (reduced.matches) {
      showStill();
      return;
    }
    if (live && live.exiting) {
      // same React key still fading out: it fades back in and its sequence restarts from A, same digits
      const o = live;
      o.exiting = false;
      fade(o, 1, t, (a) => {
        a.cancel();
        o.fade = null;
      });
      run(o, 0, t);
    } else {
      live = buildOverlay(host);
      run(live, 0, t);
    }
  });

  card.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "touch" || !hovered) return;
    hovered = false;
    if (reduced.matches) {
      live?.el.remove();
      live = null;
      return;
    }
    if (live && !live.exiting) fadeOut(live, Math.max(e.timeStamp, now()) + LAG_OUT);
  });

  // prefers-reduced-motion (not handled on clerk.com): show the typed code without motion while hovered
  function showStill() {
    live?.el.remove();
    live = buildOverlay(host);
    for (const d of live.digits) Object.assign(d.style, { opacity: 1, transform: "none" });
    for (const x of [...live.border, ...live.bg, ...live.cursor]) Object.assign(x.style, { opacity: 1, transform: "translateX(13.75rem)" });
  }
}
