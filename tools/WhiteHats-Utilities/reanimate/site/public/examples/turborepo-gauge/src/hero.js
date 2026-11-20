// turborepo.com's hero gauge and compute-hours counter, ported from the page's own components
// (RemoteCacheGauge and RemoteCacheCounterClient) without React.
//
// On turborepo.com every animated value goes through React state: a frame computes it, and React writes it
// to the DOM in a scheduler task after that frame, so it is painted one frame later. `commit` does the same
// with a MessageChannel, so the copy paints each value in the same frame as the original. `after(n, run)`
// waits n such tasks, as many as React takes between an event and the effect that starts the animation.

const commit = (() => {
  const channel = new MessageChannel();
  const queue = [];
  channel.port1.onmessage = () => { for (const run of queue.splice(0)) run(); };
  return (run) => { if (queue.push(run) === 1) channel.port2.postMessage(0); };
})();
const after = (n, run) => (n ? commit(() => after(n - 1, run)) : run());

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const round2 = (x) => Math.round(100 * x) / 100;

// ---------- the gauge ----------
// The value is 0..100 along the arc. At rest the needle sits at 80.952; while the pointer is on the gauge it
// revs to 98. A spring (stiffness 520, damping 22, mass 1) moves it there, stepped once per frame with
// semi-implicit Euler: the first step after a change is 1/60 s, later ones the frame time, capped at 1/30 s.
// It overshoots past 100 on the way up, where the drawing clamps, and stops once within 0.01 of the target.
const REST = 80.952;
const REVVED = 98;

const svg = document.querySelector('svg[viewBox="0 0 480 340"]');
const gauge = svg.parentElement;
const dashed = [
  svg.querySelector('path[filter="url(#remote-cache-gauge-glow)"]'), // the glow under the arc
  svg.querySelector('#remote-cache-gauge-inner-indicator-mask path'), // the tinted inside, up to the needle
  svg.querySelector('path[stroke="url(#remote-cache-gauge-gradient)"]:not([filter])'), // the arc
];
const remainder = svg.querySelector("#remote-cache-gauge-inner-remainder-mask path"); // the grey inside, past it
const needles = svg.querySelectorAll('g[transform^="rotate"]'); // the needle and its shadow

let shown = "";
function draw(value) {
  const u = round2(Math.min(100, Math.max(0, value)));
  const c = round2(100 - u);
  const key = `${u} ${c}`;
  if (key === shown) return;
  shown = key;
  for (const path of dashed) path.setAttribute("stroke-dasharray", key);
  remainder.setAttribute("stroke-dasharray", `0 ${u} ${c} 0`);
  for (const g of needles) g.setAttribute("transform", `rotate(${round2(2.2 * u)} 240 240)`);
}

const needle = { target: REST, x: REST, v: 0, raf: 0, last: 0 };
function step(now) {
  const n = needle;
  const dt = n.last ? Math.min((now - n.last) / 1000, 1 / 30) : 1 / 60;
  const a = 520 * (n.target - n.x) - 22 * n.v;
  n.v += a * dt;
  n.x += n.v * dt;
  n.last = now;
  if (Math.abs(n.target - n.x) < 0.01 && Math.abs(n.v) < 0.01) {
    n.x = n.target;
    n.v = 0;
  } else {
    n.raf = requestAnimationFrame(step);
  }
  const x = n.x;
  commit(() => draw(x));
}
function rev(on) {
  const target = on ? REVVED : REST;
  if (target === needle.target) return;
  needle.target = target;
  cancelAnimationFrame(needle.raf);
  if (reduced.matches) {
    needle.x = target;
    needle.v = 0;
    draw(target);
    return;
  }
  needle.last = 0;
  needle.raf = requestAnimationFrame(step);
}

// Pointer in and out on a desktop; on a phone (as on turborepo.com, up to 767px wide) a tap toggles it.
// Embedded, the frame is narrow on any screen, so it goes by whether the device can hover.
const narrow = matchMedia("embed" in document.documentElement.dataset ? "(hover: none)" : "(max-width: 767px)");
let revved = false;
// render, effect (sets the target), render, effect (starts the spring)
const set = (on) => { revved = on; after(4, () => rev(on)); };
gauge.addEventListener("mouseenter", () => { if (!narrow.matches) set(true); });
gauge.addEventListener("mouseleave", () => { if (!narrow.matches) set(false); });
gauge.addEventListener("click", () => { if (narrow.matches) set(!revved); });

// ---------- the counter ----------
// The page renders 12,434,353 hours on the server. Once it hydrates it fetches /api/remote-cache-minutes-saved
// and every 10 s after that, and tweens the number from wherever it is to total / 60 over 1.2 s with
// easeOutCubic. The copy has no server: it uses the total turborepo.com returned on 30 Oct 2026 at
// 15:41 UTC (22,579,753 hours), adds the 15.9 hours it grew by per 10 s then, and waits as long as the
// original's hydration (90 ms after the first frame) and fetch (330 ms) took.
const SERVER_RENDERED = 0xbdbbb1; // 12,434,353
const TOTAL_MINUTES = 1354785180;
const GROWTH_PER_POLL = 15.9; // hours
const POLL_MS = 10000;
const HYDRATE_MS = 90;
const FETCH_MS = 330;
const DURATION = 1200;
const easeOutCubic = (t) => (t - 1) ** 3 + 1;
const format = Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

const number = document.querySelector("main dl dt span");
const count = { value: SERVER_RENDERED, raf: 0 };
function tweenTo(target) {
  cancelAnimationFrame(count.raf);
  const from = count.value;
  if (from === target) return;
  if (reduced.matches) {
    count.value = target;
    number.textContent = format.format(target);
    return;
  }
  let start = null;
  const frame = (now) => {
    if (start === null) start = now;
    const t = Math.min(1, Math.max(0, (now - start) / DURATION));
    const value = from + (target - from) * easeOutCubic(t);
    count.value = value;
    commit(() => { number.textContent = format.format(value); });
    if (t < 1) count.raf = requestAnimationFrame(frame);
  };
  count.raf = requestAnimationFrame(frame);
}

requestAnimationFrame(() => {
  setTimeout(() => {
    let polls = 0;
    const poll = () => {
      const hours = TOTAL_MINUTES / 60 + polls++ * GROWTH_PER_POLL;
      setTimeout(() => after(2, () => tweenTo(hours)), FETCH_MS); // render, effect (starts the tween)
    };
    poll();
    setInterval(poll, POLL_MS);
  }, HYDRATE_MS);
});

// ---------- the install command ----------
const buttons = document.querySelectorAll(".tr-toggle__button");
const command = document.querySelectorAll(".tr-command__sizer, .tr-command__value");
for (const button of buttons) {
  button.addEventListener("click", () => {
    for (const b of buttons) {
      const on = b === button;
      b.setAttribute("aria-pressed", String(on));
      b.toggleAttribute("data-active", on);
    }
    for (const el of command) el.textContent = button.dataset.command;
  });
}
document.querySelector(".tr-command__copy").addEventListener("click", () => {
  navigator.clipboard?.writeText(command[0].textContent).catch(() => {});
});
