// The run of order-workflow, played the way vercel.com plays it.
//
// Every span bar has its own clock. It only advances while at least 35 % of the bar is on screen, one animation
// frame at a time (the first frame counts 16.67 ms, no frame more than 40 ms), so a bar that is scrolled away
// pauses and picks up where it left off. A span starts when its clock passes `start`, and grows linearly over
// its duration; the whole 925 ms run is played over 2000 ms. The workflow bar drives the status: Running when it
// starts, Completed when it ends. The Duration counts 0 → 925 linearly over 2000 ms from the frame after the start.
//
// The timing code is a port of what vercel.com runs: a shared requestAnimationFrame clock, tickers that drop to
// 30 fps after three slow frames or while the window is unfocused, IntersectionObservers shared per option set,
// and status changes applied in a task after the frame (as a React state update is).

const RUN_MS = 925; // the run, as the trace shows it
const PLAY_MS = 2000; // how long it takes on screen
const IN_VIEW = 0.35; // share of a bar that has to be visible for its clock to run

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// ---------- a task after the current one, as React's scheduler runs a state update ----------

const channel = new MessageChannel();
const tasks = [];
channel.port1.onmessage = () => tasks.splice(0).forEach((fn) => fn());
function defer(fn) {
  tasks.push(fn);
  if (tasks.length === 1) channel.port2.postMessage(0);
}

// ---------- shared animation-frame clock: one rAF, every ticker gets the same timestamp ----------

const clock = { raf: null, frame: 0, time: 0, ticks: new Map() };
function onFrame(now) {
  clock.time = now;
  clock.frame++;
  clock.raf = clock.ticks.size ? requestAnimationFrame(onFrame) : null;
  // a tick added during frame N first runs on frame N + 1
  clock.ticks.forEach((added, fn) => added < clock.frame && fn(clock.time));
  idle();
}
function idle() {
  if (clock.ticks.size === 0 && clock.raf !== null) {
    cancelAnimationFrame(clock.raf);
    clock.raf = null;
  }
}
function addTick(fn) {
  clock.ticks.set(fn, clock.frame);
  if (clock.raf === null) clock.raf = requestAnimationFrame(onFrame);
}
function removeTick(fn) {
  clock.ticks.delete(fn);
  idle();
}

// ---------- IntersectionObservers, one per option set, shared by every element observed with it ----------

const observers = new Map();
function observe(el, options, cb) {
  const key = `${options.rootMargin}|${[].concat(options.threshold).join(",")}`;
  let entry = observers.get(key);
  if (!entry) {
    const callbacks = new Map();
    const io = new IntersectionObserver((list) => list.forEach((e) => callbacks.get(e.target)?.forEach((f) => f(e))), options);
    entry = { io, callbacks };
    observers.set(key, entry);
  }
  let set = entry.callbacks.get(el);
  if (!set) entry.callbacks.set(el, (set = new Set()));
  set.add(cb);
  entry.io.observe(el);
  return () => {
    set.delete(cb);
    if (set.size === 0) {
      entry.io.unobserve(el);
      entry.callbacks.delete(el);
    }
  };
}
const STEPS_20 = Array.from({ length: 21 }, (_, i) => i / 20);

// ---------- ticker: per-frame delta, optional fps cap ----------

function createTicker(onTick, fps) {
  let interval = fps ? 1000 / fps : 0;
  let maxDelta = interval + 40;
  let last = -1;
  let next = 0;
  let elapsed = 0;
  let count = 0;
  let state = "idle";
  const info = { time: 0, delta: 0, elapsed: 0, frame: 0 };
  function tick(now) {
    if (now < next) return;
    const first = last < 0;
    const delta = first ? interval || 16.67 : now - last;
    last = now;
    if (interval > 0) {
      if (first) next = now + interval;
      else {
        const due = next + interval;
        const late = now - due;
        next = late < interval ? due : due + Math.floor(late / interval) * interval;
      }
    }
    info.time = now;
    info.delta = delta > maxDelta ? maxDelta : delta;
    elapsed += info.delta;
    info.elapsed = elapsed;
    info.frame = ++count;
    onTick(info);
  }
  return {
    get state() {
      return state;
    },
    start() {
      state = "running";
      last = -1;
      next = 0;
      elapsed = 0;
      count = 0;
      addTick(tick);
    },
    pause() {
      if (state !== "running") return;
      state = "paused";
      removeTick(tick);
    },
    resume() {
      if (state !== "paused") return;
      state = "running";
      last = -1;
      next = 0;
      addTick(tick);
    },
    stop() {
      state = "stopped";
      removeTick(tick);
    },
    setFps(f) {
      interval = f ? 1000 / f : 0;
      maxDelta = interval + 40;
      next = last < 0 ? 0 : last + interval;
    },
  };
}

// ---------- loop: a ticker that runs while its element intersects the viewport and the tab is visible ----------

function createLoop(el, onTick) {
  let degraded = false;
  let unfocused = false;
  let slow = 0;
  let frameMs = 1000 / 60;
  let visible = false;
  let stopped = false;
  let ticker = null;
  const fps = () => (degraded ? 30 : undefined);
  function quality() {
    const next = unfocused || slow >= 3;
    if (next === degraded) return;
    degraded = next;
    frameMs = 1000 / (fps() ?? 60);
    ticker?.setFps(fps());
  }
  function frame(info) {
    if (info.delta <= 1.5 * frameMs) slow = 0;
    else if (++slow >= 3) quality();
    onTick(info);
  }
  function update() {
    if (stopped) return;
    if (visible && !document.hidden) {
      if (!ticker) {
        ticker = createTicker(frame, fps());
        ticker.start();
      } else ticker.resume();
    } else ticker?.pause();
  }
  const focus = () => {
    unfocused = !document.hasFocus();
    quality();
  };
  addEventListener("focus", focus);
  addEventListener("blur", focus);
  document.addEventListener("visibilitychange", update);
  const unobserve = observe(el, { rootMargin: "0px", threshold: 0 }, (e) => {
    visible = e.isIntersecting;
    update();
  });
  return function stop() {
    if (stopped) return;
    stopped = true;
    ticker?.stop();
    unobserve();
    removeEventListener("focus", focus);
    removeEventListener("blur", focus);
    document.removeEventListener("visibilitychange", update);
  };
}

// ---------- a span bar ----------

function playBar(el, { delay, duration, target, onStart, onFinish }) {
  const watched = el.querySelector(".vw-bar__track");
  const fill = el.querySelector(".vw-bar__fill");
  const label = el.querySelector(".vw-badge__ms");
  let clock = 0;
  let started = false;
  let done = false;
  let shown = "";
  let inView = false;
  let stopLoop = null;

  function render(p) {
    fill.style.width = `${p * 100}%`;
    const text = `${Math.round(target * p)}ms`;
    if (text !== shown) label.textContent = shown = text;
  }
  function start() {
    if (started) return;
    started = true;
    fill.style.opacity = "1";
    if (onStart) queueMicrotask(onStart);
  }
  function finish() {
    if (done) return;
    render(1);
    done = true;
    if (onFinish) queueMicrotask(onFinish);
    sync();
  }
  function sync() {
    const run = inView && !reduced && !done;
    if (run && !stopLoop)
      stopLoop = createLoop(watched, ({ delta }) => {
        if (done) return;
        clock += delta;
        const t = clock - delay;
        if (t < 0) return;
        const p = clamp01(t / duration);
        render(p);
        start();
        if (p >= 1) finish();
      });
    else if (!run && stopLoop) {
      stopLoop();
      stopLoop = null;
    }
  }

  fill.style.opacity = "0";
  render(reduced ? 1 : 0);
  if (reduced) {
    start();
    finish();
    return;
  }
  let ratio = 0;
  observe(watched, { rootMargin: "0px", threshold: STEPS_20 }, (e) => {
    if (e.intersectionRatio === ratio) return;
    ratio = e.intersectionRatio;
    inView = ratio >= IN_VIEW;
    sync();
  });
}

// ---------- the run header: status and duration ----------

const status = document.querySelector(".vw-status");
// the value is two text nodes, "0" and "ms", as React renders it on vercel.com; only the number changes
const durationNumber = document.querySelector("[data-duration]").firstChild;
let state = "idle";
let tweenRaf = 0;

function setStatus(next) {
  if (next === state || (state === "completed" && next === "running")) return;
  state = next;
  status.dataset.status = next;
  // a new element, so the fade-slide-in plays again
  const old = status.querySelector(".vw-status__text");
  const text = document.createElement("span");
  text.className = "vw-status__text";
  text.textContent = next === "completed" ? "Completed" : "Running";
  old.replaceWith(text);
  if (next === "running") countUp();
  else {
    cancelAnimationFrame(tweenRaf);
    durationNumber.data = String(RUN_MS);
  }
}

// Duration: 0 → 925 linearly over 2000 ms, timed by animation frames from the first frame after the start
function countUp() {
  let t0 = null;
  let value = 0;
  const step = (now) => {
    if (t0 === null) t0 = now;
    const p = clamp01((now - t0) / PLAY_MS);
    const v = p === 1 ? RUN_MS : RUN_MS * p;
    if (v !== value) {
      value = v;
      defer(() => state === "running" && (durationNumber.data = String(Math.round(value))));
    }
    if (p < 1) tweenRaf = requestAnimationFrame(step);
  };
  tweenRaf = requestAnimationFrame(step);
}

// ---------- the trace ----------

for (const el of document.querySelectorAll(".vw-bar")) {
  const start = Number(el.dataset.start);
  const span = Number(el.dataset.duration);
  const isRun = span === RUN_MS && start === 0 && el.querySelector(".vw-badge--blue");
  playBar(el, {
    delay: (PLAY_MS * start) / RUN_MS,
    duration: (PLAY_MS * span) / RUN_MS,
    target: span,
    onStart: isRun ? () => defer(() => setStatus("running")) : undefined,
    onFinish: isRun ? () => defer(() => setStatus("completed")) : undefined,
  });
}
