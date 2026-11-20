// The small "phase" library nextjs.org runs its feature illustrations on (module 75486 of its bundle), ported
// without React: one shared requestAnimationFrame clock, one IntersectionObserver per option set, a ticker
// loop that runs only while its element is on screen (and the tab visible, and motion allowed), and a pointer
// tracker that reports the pointer position once per frame. The behaviour is kept as it is, quirks included:
// a second loop on an element that is already observed with the same options never hears from the observer.

// ---------- shared frame clock ----------
const clock = (globalThis[Symbol.for("phase.clock@2")] ??= { rafId: null, frame: 0, time: 0, ticks: new Map(), input: new Map() });
let failed = false;
let failure;

function idle() {
  if (clock.ticks.size === 0 && clock.input.size === 0 && clock.rafId !== null) {
    cancelAnimationFrame(clock.rafId);
    clock.rafId = null;
  }
}
function runInput(registered, fn) {
  if (registered >= clock.frame) return;
  clock.input.set(fn, -1);
  let again = false;
  try {
    again = fn(clock.time) === true;
  } catch (e) {
    if (!failed) failure = e;
    failed = true;
  }
  const state = clock.input.get(fn);
  if (state !== undefined && (again || state !== -1)) {
    clock.input.set(fn, clock.frame);
    request();
  } else clock.input.delete(fn);
}
function runTick(registered, fn) {
  if (registered < clock.frame) fn(clock.time);
}
function frame(time) {
  clock.time = time;
  clock.frame++;
  failed = false;
  clock.rafId = clock.ticks.size === 0 ? null : requestAnimationFrame(frame);
  clock.input.forEach(runInput);
  const threw = failed;
  const error = failure;
  failed = false;
  failure = undefined;
  clock.ticks.forEach(runTick);
  idle();
  if (threw) throw error;
}
function request() {
  if (clock.rafId === null) clock.rafId = requestAnimationFrame(frame);
}
function addTick(fn) {
  clock.ticks.set(fn, clock.frame);
  request();
}
function removeTick(fn) {
  clock.ticks.delete(fn);
  idle();
}
function scheduleInput(fn) {
  const state = clock.input.get(fn);
  if (state === -1) {
    clock.input.set(fn, -2);
    request();
    return;
  }
  if (state === undefined) {
    clock.input.set(fn, clock.frame);
    request();
  }
}
function cancelInput(fn) {
  clock.input.delete(fn);
  idle();
}

// ---------- media queries ----------
const REDUCED = "(prefers-reduced-motion: reduce)";
const queries = new Map();
function watchQuery(query, listener) {
  let q = queries.get(query);
  if (!q) {
    const mql = matchMedia(query);
    const listeners = new Set();
    q = { mql, listeners, handler: (e) => { for (const l of listeners) l(e.matches); } };
    mql.addEventListener("change", q.handler);
    queries.set(query, q);
  }
  q.listeners.add(listener);
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const r = queries.get(query);
    if (!r) return;
    r.listeners.delete(listener);
    if (r.listeners.size === 0) {
      r.mql.removeEventListener("change", r.handler);
      queries.delete(query);
    }
  };
}
function queryMatches(query) {
  const q = queries.get(query);
  return q ? q.mql.matches : matchMedia(query).matches;
}
export const prefersReducedMotion = () => queryMatches(REDUCED);
export function watchReducedMotion(listener) {
  listener(queryMatches(REDUCED));
  return watchQuery(REDUCED, listener);
}

// devicePixelRatio, and a callback when it changes (zoom, moving the window to another screen)
export function watchPixelRatio(listener) {
  let ratio = window.devicePixelRatio || 1;
  let mql;
  const arm = () => {
    mql = matchMedia(`(resolution: ${ratio}dppx)`);
    mql.addEventListener("change", changed);
  };
  function changed() {
    const r = window.devicePixelRatio || 1;
    if (r === ratio) return;
    ratio = r;
    mql.removeEventListener("change", changed);
    arm();
    listener(r);
  }
  arm();
  return ratio;
}

// ---------- shared intersection observers ----------
const observers = new Map();
const rootIds = new WeakMap();
let nextRootId = 1;
function observe({ element, onIntersect, root, rootMargin, threshold }) {
  const options = { root, rootMargin, threshold };
  let rootKey = "null";
  if (root) {
    let id = rootIds.get(root);
    if (id === undefined) rootIds.set(root, (id = nextRootId++));
    rootKey = String(id);
  }
  const key = `${rootKey}|${rootMargin ?? "0px"}|${Array.isArray(threshold) ? threshold.join(",") : String(threshold ?? 0)}`;
  let entry = observers.get(key);
  if (!entry) {
    const callbacks = new Map();
    entry = {
      callbacks,
      observer: new IntersectionObserver((records) => {
        for (const r of records) {
          const set = callbacks.get(r.target);
          if (set) for (const cb of set) cb(r);
        }
      }, options),
    };
    observers.set(key, entry);
  }
  let set = entry.callbacks.get(element);
  if (!set) entry.callbacks.set(element, (set = new Set()));
  set.add(onIntersect);
  entry.observer.observe(element); // a no-op when the element is already observed: no first callback then
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const e = observers.get(key);
    if (!e) return;
    const s = e.callbacks.get(element);
    if (s) {
      s.delete(onIntersect);
      if (s.size === 0) {
        e.observer.unobserve(element);
        e.callbacks.delete(element);
      }
    }
    if (e.callbacks.size === 0) {
      e.observer.disconnect();
      observers.delete(key);
    }
  };
}

// ---------- sight: visible = intersecting and the document not hidden ----------
function createSight({ target, intersectionOptions, onPhaseChange }) {
  let phase = "unknown";
  let stopped = false;
  let docVisible = !document.hidden;
  let intersecting = false;
  function update() {
    if (stopped) return;
    const next = docVisible && intersecting ? "visible" : "hidden";
    if (next !== phase) {
      phase = next;
      onPhaseChange?.(phase);
    }
  }
  const onVisibility = () => { docVisible = !document.hidden; update(); };
  const onPageShow = (e) => { if (e.persisted) { docVisible = true; update(); } };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", onPageShow);
  const unobserve = observe({ element: target, onIntersect: (r) => { intersecting = r.isIntersecting; update(); }, ...intersectionOptions });
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      unobserve();
    },
  };
}

// ---------- ticker: delta per frame (first frame 16.67 ms, capped at interval + 40 ms), elapsed, frame ----------
function createTicker({ fps, onTick }) {
  const toInterval = (f) => (f === undefined ? 0 : 1000 / f);
  let interval = toInterval(fps);
  let cap = interval + 40;
  let state = "idle";
  let last = -1;
  let elapsed = 0;
  let frames = 0;
  let next = 0;
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
    info.delta = delta > cap ? cap : delta;
    elapsed += info.delta;
    info.elapsed = elapsed;
    info.frame = ++frames;
    onTick(info);
  }
  return {
    start() {
      if (state === "running") return;
      if (state === "paused") return this.resume();
      state = "running";
      last = -1;
      next = 0;
      elapsed = 0;
      frames = 0;
      info.time = info.delta = info.elapsed = info.frame = 0;
      addTick(tick);
    },
    pause() {
      if (state !== "running") return;
      state = "paused";
      removeTick(tick);
    },
    resume() {
      if (state !== "paused") return;
      last = -1;
      next = 0;
      state = "running";
      addTick(tick);
    },
    stop() {
      if (state === "stopped") return;
      state = "stopped";
      removeTick(tick);
    },
    setFps(f) {
      interval = toInterval(f);
      cap = interval + 40;
      next = last < 0 ? 0 : last + interval;
    },
    get phase() { return state; },
  };
}

// ---------- loop: a ticker that runs while its target is visible and motion is allowed ----------
// Under load (3 frames in a row over 1.5x the frame time) or without focus it drops to 30 fps.
export function createLoop({ target, onTick, intersectionOptions }) {
  let phase = "idle";
  let started = false;
  let quality = "full";
  let slowFrames = 0;
  let frameMs = 1000 / 60;
  let unfocused = false;
  let ticker = null;
  // lifecycle
  let visible = false;
  let reduced = false;
  let lifecycle = "idle";
  let lifecycleReason = null;
  function setQuality(q) {
    const changed = quality !== q;
    quality = q;
    if (changed && phase !== "stopped") applyFps();
  }
  function checkQuality() {
    setQuality(unfocused || slowFrames >= 3 ? "degraded" : "full");
  }
  function applyFps() {
    const fps = quality === "degraded" ? 30 : undefined;
    frameMs = 1000 / (fps ?? 60);
    ticker?.setFps(fps);
    return fps;
  }
  function tick(info) {
    if (info.delta <= 1.5 * frameMs) slowFrames = 0;
    else if (++slowFrames >= 3) checkQuality();
    onTick(info);
  }
  function sync() {
    if (phase === "stopped" || !started) return;
    if (lifecycle === "paused") {
      if (ticker && phase === "running") ticker.pause();
      phase = "paused";
      return;
    }
    if (ticker) {
      if (phase === "paused") {
        ticker.resume();
        phase = "running";
      }
    } else {
      ticker = createTicker({ fps: applyFps(), onTick: tick });
      ticker.start();
      phase = "running";
    }
  }
  function lifecycleUpdate() {
    if (lifecycle === "stopped" || !started) return;
    lifecycleReason = reduced ? "reduced-motion" : visible ? null : "sight";
    lifecycle = lifecycleReason ? "paused" : "active";
    sync();
  }
  const sight = createSight({ target, intersectionOptions, onPhaseChange: (p) => { visible = p === "visible"; lifecycleUpdate(); } });
  const unwatch = watchQuery(REDUCED, (m) => { reduced = m; lifecycleUpdate(); });
  reduced = queryMatches(REDUCED);
  const onFocus = () => { unfocused = !document.hasFocus(); checkQuality(); };
  window.addEventListener("focus", onFocus);
  window.addEventListener("blur", onFocus);
  started = true;
  lifecycleUpdate();
  return {
    stop() {
      if (phase === "stopped") return;
      phase = "stopped";
      lifecycle = "stopped";
      ticker?.stop();
      sight.stop();
      unwatch();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onFocus);
    },
    get phase() { return phase; },
  };
}

// ---------- pointer: position relative to the target, reported once per frame while over it ----------
// Listens only while the target is on screen. onPointer gets { x, y, active }.
export function createPointer({ target, onPointer, intersectionOptions }) {
  const state = { x: 0, y: 0, active: false };
  let tracking = false;
  let stopped = false;
  let clientX = 0;
  let clientY = 0;
  let pending = false;
  function report() {
    if (!pending || stopped) return;
    pending = false;
    const r = target.getBoundingClientRect();
    state.x = clientX - r.left;
    state.y = clientY - r.top;
    onPointer(state);
  }
  function cancel() {
    cancelInput(report);
    pending = false;
  }
  function move(e) {
    if (stopped || !tracking) return;
    clientX = e.clientX;
    clientY = e.clientY;
    pending = true;
    scheduleInput(report);
  }
  function enter() {
    if (stopped) return;
    state.active = true;
    tracking = true;
  }
  function leave() {
    if (stopped) return;
    cancel();
    state.active = false;
    tracking = false;
    onPointer(state);
  }
  let listening = false;
  const listen = (on) => {
    if (on === listening) return;
    listening = on;
    const fn = on ? "addEventListener" : "removeEventListener";
    target[fn]("pointermove", move);
    target[fn]("pointerenter", enter);
    target[fn]("pointerleave", leave);
  };
  let intersecting = false;
  let docVisible = !document.hidden;
  function update() {
    if (stopped) return;
    if (docVisible && intersecting) listen(true);
    else {
      listen(false);
      if (state.active) {
        cancel();
        state.active = false;
        tracking = false;
      }
    }
  }
  const onVisibility = () => { docVisible = !document.hidden; update(); };
  const onPageShow = (e) => { if (e.persisted) { docVisible = true; update(); } };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", onPageShow);
  const unobserve = observe({ element: target, onIntersect: (r) => { intersecting = r.isIntersecting; update(); }, ...intersectionOptions });
  return {
    state,
    stop() {
      if (stopped) return;
      stopped = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      unobserve();
      listen(false);
      cancel();
      state.active = false;
    },
  };
}
