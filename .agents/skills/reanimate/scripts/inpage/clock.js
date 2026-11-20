// Virtual clock, injected before any page script (capture.ts --clock virtual, --seed).
//
// Seeded Math.random: the same seed gives the same particles, arcs and noise on every capture.
// Virtual time: performance.now, Date, timers, requestAnimationFrame, requestIdleCallback,
// document.timeline.currentTime, Event.timeStamp and every CSS / Web Animations API animation follow
// one clock that the capturer advances by hand. A frame then takes as long as it takes to render (software
// GL, a slow machine) and the page still sees a steady 60 Hz, so frame k is always the state at t = k / fps.
//
// Free mode (before freeze) passes timers and frames through to the browser, with bookkeeping, so the
// page loads normally. freeze() takes the pending timers and frames over; advance(ms) then runs them in
// time order, ticking rAF every 1000 / rafHz ms and yielding to the event loop between callbacks so
// promise chains and MessageChannel schedulers (React) keep up.
(function (CFG) {
  const w = self; // also runs in workers (seed only)
  if (w.__mcClock) return;

  if (CFG.seed !== null && CFG.seed !== undefined) {
    // mulberry32
    let s = CFG.seed >>> 0 || 1;
    Math.random = function random() {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  if (!CFG.virtual) { w.__mcClock = { virtual: false, seed: CFG.seed }; return; }

  const N = {
    setTimeout: w.setTimeout.bind(w), clearTimeout: w.clearTimeout.bind(w),
    raf: w.requestAnimationFrame.bind(w), caf: w.cancelAnimationFrame.bind(w),
    perfNow: performance.now.bind(performance), dateNow: Date.now, Date: Date,
  };
  const tsDesc = Object.getOwnPropertyDescriptor(Event.prototype, "timeStamp");
  const tlDesc = w.AnimationTimeline && Object.getOwnPropertyDescriptor(AnimationTimeline.prototype, "currentTime");

  const st = {
    frozen: false, now: 0, dateOffset: N.dateNow() - N.perfNow(), nextId: 1, seq: 0, nesting: 0,
    timers: new Map(), rafs: new Map(), tick: 1000 / (CFG.rafHz || 60), nextTick: 0,
    anims: new Map(), frames: 0, startedAt: null, keeper: 0, hist: [],
  };
  const now = () => (st.frozen ? st.now : N.perfNow());

  function call(cb, args) {
    try {
      if (typeof cb === "string") (0, eval)(cb);
      else if (typeof cb === "function") cb.apply(w, args);
    } catch (e) {
      N.setTimeout(() => { throw e; });
    }
  }

  // ---------- timers ----------
  function arm(t) {
    t.native = N.setTimeout(() => { if (st.timers.get(t.id) === t && !st.frozen) fire(t); }, Math.max(0, t.due - N.perfNow()));
  }
  function addTimer(cb, delay, args, interval) {
    const id = st.nextId++;
    const nesting = st.nesting + 1;
    let d = Math.max(0, Number(delay) || 0);
    if (nesting > 5 || interval) d = Math.max(d, nesting > 5 ? 4 : 1); // browsers clamp nested timers to 4 ms
    const t = { id, cb, args, delay: d, interval, due: now() + d, seq: st.seq++, nesting, native: null };
    st.timers.set(id, t);
    if (!st.frozen) arm(t);
    return id;
  }
  function fire(t) {
    if (t.interval) { t.due = (st.frozen ? t.due : N.perfNow()) + t.delay; t.seq = st.seq++; if (!st.frozen) arm(t); }
    else st.timers.delete(t.id);
    const prev = st.nesting;
    st.nesting = t.nesting;
    call(t.cb, t.args);
    st.nesting = prev;
  }
  function clearTimer(id) {
    const t = st.timers.get(id);
    if (!t) return;
    if (t.native !== null) N.clearTimeout(t.native);
    st.timers.delete(id);
  }
  w.setTimeout = function setTimeout(cb, delay, ...args) { return addTimer(cb, delay, args, false); };
  w.setInterval = function setInterval(cb, delay, ...args) { return addTimer(cb, delay, args, true); };
  w.clearTimeout = function clearTimeout(id) { clearTimer(id); };
  w.clearInterval = function clearInterval(id) { clearTimer(id); };
  w.requestIdleCallback = function requestIdleCallback(cb, opts) {
    return addTimer(() => cb({ didTimeout: false, timeRemaining: () => 10 }), Math.min(50, (opts && opts.timeout) || 1), [], false);
  };
  w.cancelIdleCallback = function cancelIdleCallback(id) { clearTimer(id); };

  // ---------- animation frames ----------
  w.requestAnimationFrame = function requestAnimationFrame(cb) {
    const id = st.nextId++;
    const r = { cb, native: null };
    if (!st.frozen) r.native = N.raf((ts) => { if (st.rafs.get(id) === r) { st.rafs.delete(id); call(cb, [ts]); } });
    st.rafs.set(id, r);
    return id;
  };
  w.cancelAnimationFrame = function cancelAnimationFrame(id) {
    const r = st.rafs.get(id);
    if (!r) return;
    if (r.native !== null) N.caf(r.native);
    st.rafs.delete(id);
  };
  function runFrame(ts) {
    st.frames++;
    syncAnims();
    syncVideos();
    const due = [...st.rafs.entries()];
    st.rafs.clear(); // callbacks registered while these run belong to the next frame
    for (const [, r] of due) call(r.cb, [ts]);
  }

  // ---------- CSS animations, transitions and WAAPI ----------
  // Each running animation on the document timeline is paused when first seen and then seeked to
  // base + (virtual now − first seen) · playbackRate. Finite ones are finish()ed at their end so
  // `finished` promises and finish events still fire (motion / Framer Motion wait on them).
  function syncAnims() {
    let list;
    try { list = document.getAnimations(); } catch { return; }
    for (const a of list) {
      if (a.timeline && a.timeline !== document.timeline) continue; // scroll / view timelines follow scroll
      let rec = st.anims.get(a);
      if (!rec || a.playState === "running") {
        if (!rec && a.playState !== "running") continue; // paused or finished by the page
        rec = { base: a.currentTime || 0, v0: st.now };
        st.anims.set(a, rec);
        try { a.pause(); } catch { continue; }
      }
      if (!st.frozen) continue;
      const rate = a.playbackRate || 1;
      const t = rec.base + (st.now - rec.v0) * rate;
      let end = Infinity;
      try { end = a.effect ? a.effect.getComputedTiming().endTime : Infinity; } catch {}
      if ((rate > 0 && t >= end) || (rate < 0 && t <= 0)) { st.anims.delete(a); try { a.finish(); } catch {} continue; }
      try { a.currentTime = t; } catch {}
    }
  }
  // <video> plays on the decoder's real clock: pause each playing video when first seen and seek it with
  // the virtual clock; busy() holds the frame until the seek has landed.
  const videos = new Map();
  function syncVideos() {
    let list;
    try { list = document.querySelectorAll("video"); } catch { return; }
    for (const v of list) {
      let rec = videos.get(v);
      if (!rec) {
        if (v.paused) continue;
        rec = { base: v.currentTime, v0: st.now };
        videos.set(v, rec);
        try { v.pause(); } catch {}
      }
      if (!st.frozen) continue;
      let t = rec.base + ((st.now - rec.v0) / 1000) * (v.playbackRate || 1);
      if (v.loop && v.duration > 0) t %= v.duration;
      else if (v.duration > 0) t = Math.min(t, v.duration);
      if (Math.abs(v.currentTime - t) > 0.001) try { v.currentTime = t; } catch {}
    }
  }

  // While frozen but not stepping (page load for --trigger load), keep catching new animations so
  // they start from ~0 instead of running on the real clock.
  function keeper() { if (!st.frozen) return; syncAnims(); st.keeper = N.raf(keeper); }

  // ---------- time sources ----------
  performance.now = function now_() { return now(); };
  function VDate(...a) {
    if (!new.target) return new N.Date(st.dateOffset + now()).toString();
    return a.length ? new N.Date(...a) : new N.Date(st.frozen ? st.dateOffset + st.now : N.dateNow());
  }
  VDate.prototype = N.Date.prototype;
  VDate.now = () => (st.frozen ? Math.round(st.dateOffset + st.now) : N.dateNow());
  VDate.parse = N.Date.parse;
  VDate.UTC = N.Date.UTC;
  Object.defineProperty(VDate.prototype, "constructor", { value: VDate, writable: true, configurable: true });
  w.Date = VDate;
  if (tsDesc && tsDesc.get) {
    Object.defineProperty(Event.prototype, "timeStamp", { configurable: true, get() { return st.frozen ? st.now : tsDesc.get.call(this); } });
  }
  if (tlDesc && tlDesc.get) {
    Object.defineProperty(AnimationTimeline.prototype, "currentTime", { configurable: true, get() { return st.frozen && this === document.timeline ? st.now : tlDesc.get.call(this); } });
  }

  // ---------- workers ----------
  // A worker answers on its own (real) clock. The capturer waits for posted-but-unanswered messages
  // before each frame, the same way it waits for the network, so a worker reply always lands on the
  // same virtual frame. A worker that never answers stops counting after 2 s.
  const pending = new Map();
  if (w.Worker) {
    const W = w.Worker;
    const post = W.prototype.postMessage;
    W.prototype.postMessage = function () {
      if (!this.__mcSilent) pending.set(this, N.perfNow());
      if (!this.__mcListening) {
        this.__mcListening = true;
        this.addEventListener("message", () => pending.delete(this));
        this.addEventListener("error", () => pending.delete(this));
      }
      return post.apply(this, arguments);
    };
  }
  function busy() {
    let n = 0;
    for (const v of videos.keys()) if (v.seeking) n++;
    for (const [wk, t] of pending) {
      if (N.perfNow() - t > 2000) { wk.__mcSilent = true; pending.delete(wk); } else n++;
    }
    return n;
  }

  // ---------- control ----------
  const mc = new MessageChannel();
  const waiting = [];
  mc.port1.onmessage = () => { const r = waiting.shift(); if (r) r(); };
  const yieldTask = () => new Promise((r) => { waiting.push(r); mc.port2.postMessage(0); });

  function freeze() {
    if (st.frozen) return st.now;
    st.now = N.perfNow();
    st.frozen = true;
    st.nextTick = st.now + st.tick;
    for (const t of st.timers.values()) if (t.native !== null) { N.clearTimeout(t.native); t.native = null; }
    for (const r of st.rafs.values()) if (r.native !== null) { N.caf(r.native); r.native = null; }
    syncAnims();
    keeper();
    return st.now;
  }

  async function advance(ms) {
    if (!st.frozen) freeze();
    if (st.startedAt === null) st.startedAt = st.now;
    N.caf(st.keeper);
    const target = st.now + Math.max(0, ms);
    for (let guard = 0; guard < 200000; guard++) {
      let next = null;
      for (const t of st.timers.values()) if (!next || t.due < next.due || (t.due === next.due && t.seq < next.seq)) next = t;
      const nextAt = Math.min(next ? next.due : Infinity, st.nextTick);
      if (nextAt > target) break;
      if (next && next.due <= st.nextTick) { st.now = Math.max(st.now, next.due); fire(next); }
      else { st.now = st.nextTick; st.nextTick += st.tick; runFrame(st.now); }
      await yieldTask();
    }
    st.now = target;
    syncAnims();
    syncVideos();
    keeper();
    if (st.hist.length < 20000) st.hist.push([N.perfNow(), st.now]);
    return st.now;
  }

  w.__mcClock = {
    virtual: true, seed: CFG.seed,
    freeze, advance, busy,
    history: () => st.hist, // [real performance.now, virtual now] after each advance, to place worker events
    now: () => now(),
    state: () => ({ frozen: st.frozen, now: st.now, timers: st.timers.size, rafs: st.rafs.size, frames: st.frames, animations: st.anims.size }),
  };
  if (CFG.freezeAtStart) freeze();
})
