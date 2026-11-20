// GPU tracer, injected before any page script (capture.ts --gl).
//
// Pixels are the only output of a canvas, but everything that produced them passes through a handful of
// API calls. This wraps those calls and records:
//   - WebGL 1/2: shader sources, programs, attribute layouts, textures (with their source URL), buffers
//     (optionally their data), framebuffers, and per frame every draw call with its program, primitive,
//     vertex/instance count, target framebuffer, bound textures, blend/depth/cull state and the uniform
//     values that changed since the previous draw of that program. Uniforms are the animation channels of
//     a GPU scene: a hover that eases a uniform from 0 to 1 over 600 ms shows up here as a curve.
//   - three.js: through the __THREE_DEVTOOLS__ hook three.js calls on every Scene and WebGLRenderer, the
//     renderer settings, the scene graph (exportable with toJSON) and per render the camera, object
//     transforms and material uniforms.
//   - WebGPU: WGSL shader modules, pipelines, draw counts and small uniform-buffer writes.
//   - Canvas 2D: call counts per frame and the full call list on sampled frames.
// window.__mcgl.export() returns all of it; capture.ts turns it into gl.json, shaders/ and gl-track.json.
(function (CFG) {
  const w = self;
  if (w.__mcgl) return;
  const now = () => performance.now();
  const G = (w.__mcgl = {
    ctxs: [], programs: [], shaders: [], textures: [], buffers: [], fbs: [], frames: [], errors: [],
    three: { revision: null, renderers: [], scenes: [], rts: [] },
    gpu: { modules: [], pipelines: [], buffers: [] },
    cur: null, inRaf: 0, frameNo: 0, dumpBytes: 0,
  });
  const MAX_FRAMES = CFG.maxFrames || 1500;
  const MAX_DRAWS = CFG.maxDrawsPerFrame || 300;
  const MAX_OBJECTS = CFG.maxObjects || 250;
  const note = (where, e) => { if (G.errors.length < 50) G.errors.push(where + ": " + String((e && e.message) || e)); };

  // ---------- frames ----------
  // A frame is one requestAnimationFrame timestamp; work outside rAF joins the frame it happens near.
  function frameStart(ts) {
    if (G.cur && G.cur.ts === ts) return G.cur;
    if (G.frameNo % 30 === 0) try { engineScan(); } catch (e) { note("engine scan", e); } // engines that only show up as globals or on the context
    return newFrame(ts);
  }
  function newFrame(ts) {
    if (G.frames.length >= MAX_FRAMES) { G.cur = { dropped: true, ts, t: now(), d: [], u: {}, sg: {}, gw: {}, pc: {}, c2: null }; return G.cur; }
    G.cur = { i: G.frameNo++, ts, t: now(), d: [], u: {}, sg: {}, gw: {}, pc: {}, c2: null, cl: [], more: 0 };
    G.frames.push(G.cur);
    return G.cur;
  }
  function frame() {
    if (G.inRaf && G.cur) return G.cur;
    if (G.cur && now() - G.cur.t < 8) return G.cur;
    return newFrame(null);
  }
  if (w.requestAnimationFrame) {
    const raf = w.requestAnimationFrame;
    w.requestAnimationFrame = function requestAnimationFrame(cb) {
      return raf.call(this, function (ts) {
        frameStart(ts);
        G.inRaf++;
        try { return cb.apply(this, arguments); } finally { G.inRaf--; }
      });
    };
  }

  // ---------- ids ----------
  const reg = new WeakMap();
  const counters = {};
  function info(obj, kind, init) {
    if (!obj) return null;
    let i = reg.get(obj);
    if (!i) {
      counters[kind] = (counters[kind] || 0) + 1;
      i = Object.assign({ id: (CFG.idPrefix || "") + kind + counters[kind] }, init || {});
      reg.set(obj, i);
    }
    return i;
  }
  const r5 = (v) => (typeof v === "number" ? (Number.isInteger(v) ? v : +v.toPrecision(6)) : typeof v === "boolean" ? +v : v);

  function describeEl(el) {
    if (!el) return null;
    if (typeof OffscreenCanvas !== "undefined" && el instanceof OffscreenCanvas) return "OffscreenCanvas";
    let s = (el.tagName || "?").toLowerCase();
    if (el.id) s += "#" + el.id;
    if (el.classList && el.classList.length) s += "." + [...el.classList].slice(0, 3).join(".");
    return s;
  }

  // ---------- contexts ----------
  function registerCtx(ctx, canvas, type, attrs) {
    if (reg.has(ctx)) return;
    const kind = /webgl2/.test(type) ? "webgl2" : /webgl/.test(type) ? "webgl" : type;
    const c = info(ctx, "c", { type: kind, canvas: describeEl(canvas), requested: attrs || null, created: now() });
    c._ctx = ctx; c._canvas = canvas;
    c.st = { prog: null, fb: 0, vao: 0, ab: null, unit: 0, units: {}, caps: {}, blend: "SRC_ALPHA,ONE_MINUS_SRC_ALPHA", eq: "ADD", vp: null, cc: [0, 0, 0, 0], attribs: { 0: {} } };
    G.ctxs.push(c);
  }
  for (const C of [w.HTMLCanvasElement, w.OffscreenCanvas]) {
    if (!C) continue;
    const orig = C.prototype.getContext;
    C.prototype.getContext = function getContext(type, attrs) {
      const ctx = orig.apply(this, arguments);
      if (ctx) try { registerCtx(ctx, this, String(type), attrs); } catch (e) { note("getContext", e); }
      return ctx;
    };
  }

  // ---------- WebGL ----------
  const BLEND = { 0: "ZERO", 1: "ONE", 0x300: "SRC_COLOR", 0x301: "ONE_MINUS_SRC_COLOR", 0x302: "SRC_ALPHA", 0x303: "ONE_MINUS_SRC_ALPHA", 0x304: "DST_ALPHA", 0x305: "ONE_MINUS_DST_ALPHA", 0x306: "DST_COLOR", 0x307: "ONE_MINUS_DST_COLOR", 0x308: "SRC_ALPHA_SATURATE", 0x8001: "CONSTANT_COLOR", 0x8002: "ONE_MINUS_CONSTANT_COLOR", 0x8003: "CONSTANT_ALPHA", 0x8004: "ONE_MINUS_CONSTANT_ALPHA" };
  const EQ = { 0x8006: "ADD", 0x800a: "SUBTRACT", 0x800b: "REVERSE_SUBTRACT", 0x8007: "MIN", 0x8008: "MAX" };
  const MODE = ["POINTS", "LINES", "LINE_LOOP", "LINE_STRIP", "TRIANGLES", "TRIANGLE_STRIP", "TRIANGLE_FAN"];
  const TYPE = { 0x1406: "float", 0x8b50: "vec2", 0x8b51: "vec3", 0x8b52: "vec4", 0x1404: "int", 0x8b53: "ivec2", 0x8b54: "ivec3", 0x8b55: "ivec4", 0x8b56: "bool", 0x8b57: "bvec2", 0x8b58: "bvec3", 0x8b59: "bvec4", 0x8b5a: "mat2", 0x8b5b: "mat3", 0x8b5c: "mat4", 0x8b5e: "sampler2D", 0x8b5f: "sampler3D", 0x8b60: "samplerCube", 0x8b62: "sampler2DShadow", 0x8dc1: "sampler2DArray", 0x1405: "uint", 0x8dc6: "uvec2", 0x8dc7: "uvec3", 0x8dc8: "uvec4", 0x8b65: "mat2x3", 0x8b66: "mat2x4", 0x8b67: "mat3x2", 0x8b68: "mat3x4", 0x8b69: "mat4x2", 0x8b6a: "mat4x3", 0x8dca: "isampler2D", 0x8dd2: "usampler2D" };
  const CAP = { 0x0be2: "BLEND", 0x0b71: "DEPTH_TEST", 0x0b44: "CULL_FACE", 0x0b90: "STENCIL_TEST", 0x0c11: "SCISSOR_TEST" };
  const DATA_TYPE = { 0x1400: "BYTE", 0x1401: "UNSIGNED_BYTE", 0x1402: "SHORT", 0x1403: "UNSIGNED_SHORT", 0x1404: "INT", 0x1405: "UNSIGNED_INT", 0x1406: "FLOAT", 0x140b: "HALF_FLOAT", 0x8d61: "HALF_FLOAT_OES" };
  const S = (gl) => { const c = reg.get(gl); return c && c.st; };

  function describeSource(src) {
    if (!src || typeof src !== "object") return null;
    try {
      if (w.HTMLImageElement && src instanceof HTMLImageElement) return { kind: "img", url: src.currentSrc || src.src, w: src.naturalWidth, h: src.naturalHeight };
      if (w.HTMLVideoElement && src instanceof HTMLVideoElement) return { kind: "video", url: src.currentSrc || src.src, w: src.videoWidth, h: src.videoHeight };
      if (w.HTMLCanvasElement && src instanceof HTMLCanvasElement) return { kind: "canvas", el: describeEl(src), w: src.width, h: src.height, _el: src };
      if (w.OffscreenCanvas && src instanceof OffscreenCanvas) return { kind: "offscreen-canvas", w: src.width, h: src.height, _el: src };
      if (w.ImageBitmap && src instanceof ImageBitmap) return { kind: "bitmap", w: src.width, h: src.height, url: src.__mcUrl };
      if (w.ImageData && src instanceof ImageData) return { kind: "imagedata", w: src.width, h: src.height };
      if (w.VideoFrame && src instanceof VideoFrame) return { kind: "videoframe", w: src.displayWidth, h: src.displayHeight };
      if (ArrayBuffer.isView(src)) return { kind: "data", type: src.constructor.name, bytes: src.byteLength };
    } catch (e) { note("describeSource", e); }
    return { kind: typeof src };
  }

  function wrap(proto, name, after) {
    const o = proto && proto[name];
    if (typeof o !== "function" || o.__mc) return;
    const f = function () {
      const r = o.apply(this, arguments);
      try { after.call(this, r, arguments); } catch (e) { note(name, e); }
      return r;
    };
    f.__mc = true;
    proto[name] = f;
  }

  function onDraw(gl, mode, count, inst) {
    const s = S(gl);
    if (!s || !s.prog) return;
    const p = s.prog;
    p.draws++;
    p.modes[MODE[mode] || mode] = 1;
    if (count > p.maxCount) p.maxCount = count;
    if (inst && inst > p.maxInst) p.maxInst = inst;
    if (!p.layout) p.layout = attribLayout(s, p);
    const f = frame();
    if (f.dropped) return;
    const ord = (f.pc[p.id] = (f.pc[p.id] || 0) + 1) - 1;
    if (f.d.length >= MAX_DRAWS) { f.more++; return; }
    const tx = [];
    for (let u = 0; u < 8; u++) if (s.units[u]) tx[u] = s.units[u];
    const state = (s.caps.BLEND ? "blend " + s.blend + (s.eq !== "ADD" ? " " + s.eq : "") : "no-blend") + (s.caps.DEPTH_TEST ? " depth" : "") + (s.caps.CULL_FACE ? " cull" : "") + (s.depthMask === false ? " no-depth-write" : "");
    if (!p.state) p.state = state;
    f.d.push({ c: reg.get(gl).id, p: p.id, m: MODE[mode] || mode, n: count, i: inst || undefined, fb: s.fb, tx: tx.length ? tx : undefined, st: state, vp: s.vp ? s.vp.join(",") : undefined });
    // uniform deltas for this (program, ordinal-in-frame)
    const key = p.id + "#" + ord;
    const last = (p.snaps[ord] = p.snaps[ord] || {});
    let delta = null;
    for (const name in p.vals) {
      const v = p.vals[name];
      const l = last[name];
      let same = !!l && l.length === v.length;
      if (same) for (let k = 0; k < v.length; k++) if (l[k] !== v[k]) { same = false; break; }
      if (!same) { (delta || (delta = {}))[name] = v; last[name] = v; }
    }
    if (delta) f.u[key] = delta;
  }

  function attribLayout(s, p) {
    const out = [];
    const table = s.attribs[s.vao] || {};
    for (const idx in p.attribs) {
      const a = table[idx];
      out.push(Object.assign({ name: p.attribs[idx], index: +idx }, a ? { buffer: a.buf, size: a.size, type: DATA_TYPE[a.type] || a.type, normalized: !!a.norm, stride: a.stride, offset: a.off, divisor: a.div || undefined } : { constant: true }));
    }
    return out;
  }

  const UNIFORMS = ["uniform1f", "uniform2f", "uniform3f", "uniform4f", "uniform1i", "uniform2i", "uniform3i", "uniform4i", "uniform1ui", "uniform2ui", "uniform3ui", "uniform4ui"];
  const UNIFORMS_V = ["uniform1fv", "uniform2fv", "uniform3fv", "uniform4fv", "uniform1iv", "uniform2iv", "uniform3iv", "uniform4iv", "uniform1uiv", "uniform2uiv", "uniform3uiv", "uniform4uiv"];
  const UNIFORMS_M = ["uniformMatrix2fv", "uniformMatrix3fv", "uniformMatrix4fv", "uniformMatrix2x3fv", "uniformMatrix3x2fv", "uniformMatrix2x4fv", "uniformMatrix4x2fv", "uniformMatrix3x4fv", "uniformMatrix4x3fv"];
  const locs = new WeakMap();
  const texById = new Map();
  const setUniform = (loc, v) => {
    const l = locs.get(loc);
    if (!l) return;
    l.p.vals[l.name] = v.length > 64 ? v.slice(0, 64).map(r5) : v.map(r5);
    if (v.length > 64) l.p.long[l.name] = v.length;
  };
  const slice = (data, off, len) => Array.prototype.slice.call(data, off || 0, len ? (off || 0) + len : undefined);

  function hookWebGL(proto) {
    if (!proto) return;
    wrap(proto, "createShader", function (sh, [type]) { const i = info(sh, "s", { type: type === 0x8b31 ? "vertex" : "fragment", src: null }); G.shaders.push(i); });
    wrap(proto, "shaderSource", function (_, [sh, src]) { const i = reg.get(sh); if (i) i.src = src; });
    wrap(proto, "createProgram", function (p) {
      const i = info(p, "p", { vs: null, fs: null, links: 0, draws: 0, modes: {}, maxCount: 0, maxInst: 0, attribs: {}, vals: {}, long: {}, snaps: [], label: null, ctx: reg.get(this) && reg.get(this).id });
      i._gl = this; i._p = p;
      G.programs.push(i);
    });
    wrap(proto, "attachShader", function (_, [p, sh]) { const i = reg.get(p), s = reg.get(sh); if (i && s) i[s.type === "vertex" ? "vs" : "fs"] = s; });
    wrap(proto, "linkProgram", function (_, [p]) {
      const i = reg.get(p);
      if (!i) return;
      i.links++;
      i.vsSrc = i.vs && i.vs.src; i.fsSrc = i.fs && i.fs.src;
      const m = /#define SHADER_NAME (.+)/.exec(i.vsSrc || "") || /#define SHADER_NAME (.+)/.exec(i.fsSrc || "");
      if (m && !i.label) i.label = m[1].trim();
      i.linkedAt = now();
    });
    wrap(proto, "deleteProgram", function (_, [p]) { const i = reg.get(p); if (i) i.deleted = true; });
    wrap(proto, "useProgram", function (_, [p]) { const s = S(this); if (s) s.prog = reg.get(p) || null; });
    wrap(proto, "getUniformLocation", function (loc, [p, name]) { const i = reg.get(p); if (loc && i) locs.set(loc, { p: i, name: String(name).replace(/\[0\]$/, "") }); });
    wrap(proto, "getAttribLocation", function (idx, [p, name]) { const i = reg.get(p); if (i && idx >= 0) i.attribs[idx] = name; });
    wrap(proto, "bindAttribLocation", function (_, [p, idx, name]) { const i = reg.get(p); if (i) i.attribs[idx] = name; });
    for (const n of UNIFORMS) wrap(proto, n, function (_, a) { setUniform(a[0], Array.prototype.slice.call(a, 1)); });
    for (const n of UNIFORMS_V) wrap(proto, n, function (_, a) { setUniform(a[0], slice(a[1], a[2], a[3])); });
    for (const n of UNIFORMS_M) wrap(proto, n, function (_, a) { setUniform(a[0], slice(a[2], a[3], a[4])); });

    wrap(proto, "drawArrays", function (_, a) { onDraw(this, a[0], a[2], 0); });
    wrap(proto, "drawElements", function (_, a) { onDraw(this, a[0], a[1], 0); });
    wrap(proto, "drawArraysInstanced", function (_, a) { onDraw(this, a[0], a[2], a[3]); });
    wrap(proto, "drawElementsInstanced", function (_, a) { onDraw(this, a[0], a[1], a[4]); });
    wrap(proto, "drawRangeElements", function (_, a) { onDraw(this, a[0], a[3], 0); });

    wrap(proto, "createFramebuffer", function (fb) { G.fbs.push(info(fb, "f", { color: null })); });
    wrap(proto, "bindFramebuffer", function (_, [target, fb]) { const s = S(this); if (s && target !== 0x8ca8) s.fb = fb ? info(fb, "f", { color: null }).id : 0; }); // skip READ_FRAMEBUFFER
    wrap(proto, "framebufferTexture2D", function (_, [, att, , tex]) { const s = S(this); const f = s && s.fb && G.fbs.find((x) => x.id === s.fb); if (f && att === 0x8ce0) f.color = tex ? info(tex, "t", {}).id : null; });
    wrap(proto, "activeTexture", function (_, [u]) { const s = S(this); if (s) s.unit = u - 0x84c0; });
    wrap(proto, "createTexture", function (t) { const i = info(t, "t", { uploads: 0 }); G.textures.push(i); texById.set(i.id, i); });
    wrap(proto, "bindTexture", function (_, [, t]) { const s = S(this); if (s) s.units[s.unit] = t ? info(t, "t", { uploads: 0 }).id : undefined; });
    const texUpload = function (a, storage) {
      const s = S(this);
      if (!s) return;
      const id = s.units[s.unit];
      const t = id && texById.get(id);
      if (!t) return;
      t.uploads = (t.uploads || 0) + 1;
      if (t.uploads > 1 && t.src && t.src.kind !== "storage" && t.src.kind !== "empty") return;
      if (storage) { t.w = a[3]; t.h = a[4]; t.src = t.src || { kind: "storage" }; return; }
      if (a[1] !== 0) return; // mip levels
      let src = null;
      for (let k = a.length - 1; k >= 5; k--) if (a[k] && typeof a[k] === "object") { src = a[k]; break; }
      if (a.length === 6 && typeof a[5] === "object") src = a[5];
      t.src = describeSource(src) || { kind: "empty" };
      if (a.length >= 8 && typeof a[3] === "number") { t.w = a[3]; t.h = a[4]; } else if (t.src) { t.w = t.src.w; t.h = t.src.h; }
    };
    wrap(proto, "texImage2D", function (_, a) { texUpload.call(this, a, false); });
    wrap(proto, "texStorage2D", function (_, a) { texUpload.call(this, a, true); });
    wrap(proto, "texStorage3D", function (_, a) { texUpload.call(this, a, true); });
    // WebGL2 three.js allocates with texStorage2D, then uploads the image with texSubImage2D
    const subUpload = function (a, depth) {
      const s = S(this);
      const id = s && s.units[s.unit];
      const t = id && texById.get(id);
      if (!t || a[1] !== 0) return;
      t.uploads = (t.uploads || 0) + 1;
      if (t.src && t.src.kind !== "storage" && t.src.kind !== "empty") return;
      let src = null;
      for (let k = a.length - 1; k >= 4; k--) if (a[k] && typeof a[k] === "object") { src = a[k]; break; }
      const d = describeSource(src);
      if (d) { t.src = d; if (!t.w) { t.w = d.w; t.h = d.h; } if (depth) t.depth = a[6]; }
    };
    wrap(proto, "texSubImage2D", function (_, a) { subUpload.call(this, a, false); });
    wrap(proto, "texImage3D", function (_, a) { const s = S(this); const id = s && s.units[s.unit]; const t = id && texById.get(id); if (t && a[1] === 0) { t.uploads = (t.uploads || 0) + 1; t.w = a[3]; t.h = a[4]; t.depth = a[5]; let src = null; for (let k = a.length - 1; k >= 8; k--) if (a[k] && typeof a[k] === "object") { src = a[k]; break; } t.src = describeSource(src) || { kind: "empty" }; } });
    wrap(proto, "texSubImage3D", function (_, a) { subUpload.call(this, a, true); });
    wrap(proto, "compressedTexImage2D", function (_, a) { const s = S(this); const id = s && s.units[s.unit]; const t = id && texById.get(id); if (t) { t.uploads = (t.uploads || 0) + 1; t.w = a[3]; t.h = a[4]; t.src = t.src || { kind: "compressed" }; } });

    wrap(proto, "createBuffer", function (b) { G.buffers.push(info(b, "b", { uploads: 0 })); });
    wrap(proto, "bindBuffer", function (_, [target, b]) { const s = S(this); if (!s) return; if (target === 0x8892) s.ab = b ? info(b, "b", { uploads: 0 }).id : null; else if (target === 0x8893) s.eb = b ? info(b, "b", { uploads: 0 }).id : null; });
    wrap(proto, "bufferData", function (_, [target, data, usage, srcOffset, length]) {
      const s = S(this);
      const id = s && (target === 0x8893 ? s.eb : s.ab);
      const b = id && G.buffers.find((x) => x.id === id);
      if (!b) return;
      b.uploads++;
      b.target = target === 0x8893 ? "ELEMENT_ARRAY_BUFFER" : target === 0x8892 ? "ARRAY_BUFFER" : target;
      b.usage = { 0x88e4: "STATIC_DRAW", 0x88e8: "DYNAMIC_DRAW", 0x88e0: "STREAM_DRAW" }[usage] || usage;
      if (typeof data === "number") { b.bytes = data; return; }
      if (!data) return;
      const view = ArrayBuffer.isView(data) ? data : new Uint8Array(data);
      b.type = view.constructor.name;
      b.bytes = view.byteLength;
      if (b.uploads === 1) {
        b.sample = Array.prototype.slice.call(view, 0, 24).map(r5);
        if (CFG.dumpBuffers && G.dumpBytes + view.byteLength <= CFG.dumpBuffers) {
          b._dump = view.slice(srcOffset || 0, length ? (srcOffset || 0) + length : undefined);
          G.dumpBytes += b._dump.byteLength;
        }
      }
    });
    wrap(proto, "bufferSubData", function (_, [target]) { const s = S(this); const id = s && (target === 0x8893 ? s.eb : s.ab); const b = id && G.buffers.find((x) => x.id === id); if (b) b.subUploads = (b.subUploads || 0) + 1; });
    wrap(proto, "vertexAttribPointer", function (_, [idx, size, type, norm, stride, off]) { const s = S(this); if (s) { const t = (s.attribs[s.vao] = s.attribs[s.vao] || {}); t[idx] = Object.assign(t[idx] || {}, { buf: s.ab, size, type, norm, stride, off }); } });
    wrap(proto, "vertexAttribIPointer", function (_, [idx, size, type, stride, off]) { const s = S(this); if (s) { const t = (s.attribs[s.vao] = s.attribs[s.vao] || {}); t[idx] = Object.assign(t[idx] || {}, { buf: s.ab, size, type, stride, off }); } });
    wrap(proto, "vertexAttribDivisor", function (_, [idx, d]) { const s = S(this); if (s) { const t = (s.attribs[s.vao] = s.attribs[s.vao] || {}); t[idx] = Object.assign(t[idx] || {}, { div: d }); } });
    wrap(proto, "bindVertexArray", function (_, [v]) { const s = S(this); if (s) s.vao = v ? info(v, "v", {}).id : 0; });

    wrap(proto, "enable", function (_, [cap]) { const s = S(this); if (s && CAP[cap]) s.caps[CAP[cap]] = true; });
    wrap(proto, "disable", function (_, [cap]) { const s = S(this); if (s && CAP[cap]) s.caps[CAP[cap]] = false; });
    wrap(proto, "blendFunc", function (_, [a, b]) { const s = S(this); if (s) s.blend = (BLEND[a] || a) + "," + (BLEND[b] || b); });
    wrap(proto, "blendFuncSeparate", function (_, [a, b, c, d]) { const s = S(this); if (s) s.blend = [a, b, c, d].map((x) => BLEND[x] || x).join(","); });
    wrap(proto, "blendEquation", function (_, [m]) { const s = S(this); if (s) s.eq = EQ[m] || m; });
    wrap(proto, "blendEquationSeparate", function (_, [m, n]) { const s = S(this); if (s) s.eq = m === n ? EQ[m] || m : (EQ[m] || m) + "," + (EQ[n] || n); });
    wrap(proto, "depthMask", function (_, [m]) { const s = S(this); if (s) s.depthMask = !!m; });
    wrap(proto, "viewport", function (_, a) { const s = S(this); if (s) s.vp = [a[0], a[1], a[2], a[3]]; });
    wrap(proto, "clearColor", function (_, a) { const s = S(this); if (s) s.cc = [a[0], a[1], a[2], a[3]].map(r5); });
    wrap(proto, "clear", function (_, [mask]) { const s = S(this); if (!s) return; const f = frame(); if (!f.dropped && f.cl.length < 32) f.cl.push({ fb: s.fb, color: mask & 0x4000 ? s.cc : undefined }); });

    wrap(proto, "getExtension", function (ext, [name]) {
      const c = reg.get(this);
      if (c) (c.ext = c.ext || {})[name] = !!ext;
      if (!ext || ext.__mcw) return;
      ext.__mcw = true;
      const gl = this;
      if (name === "ANGLE_instanced_arrays") {
        wrap(ext, "drawArraysInstancedANGLE", function (_, a) { onDraw(gl, a[0], a[2], a[3]); });
        wrap(ext, "drawElementsInstancedANGLE", function (_, a) { onDraw(gl, a[0], a[1], a[4]); });
        wrap(ext, "vertexAttribDivisorANGLE", function (_, [idx, d]) { const s = S(gl); if (s) { const t = (s.attribs[s.vao] = s.attribs[s.vao] || {}); t[idx] = Object.assign(t[idx] || {}, { div: d }); } });
      }
      if (name === "OES_vertex_array_object") wrap(ext, "bindVertexArrayOES", function (_, [v]) { const s = S(gl); if (s) s.vao = v ? info(v, "v", {}).id : 0; });
    });
  }
  hookWebGL(w.WebGLRenderingContext && WebGLRenderingContext.prototype);
  hookWebGL(w.WebGL2RenderingContext && WebGL2RenderingContext.prototype);

  // ImageBitmaps made from fetched blobs lose their URL; keep it when the blob came from a Response.
  if (w.Response && w.createImageBitmap) {
    const blob = Response.prototype.blob;
    Response.prototype.blob = function () { const url = this.url; return blob.apply(this, arguments).then((b) => { try { b.__mcUrl = url; } catch {} return b; }); };
    const cib = w.createImageBitmap;
    w.createImageBitmap = function (src) { return cib.apply(this, arguments).then((bm) => { try { if (src && src.__mcUrl) bm.__mcUrl = src.__mcUrl; else if (src && src.currentSrc) bm.__mcUrl = src.currentSrc; } catch {} return bm; }); };
  }

  // ---------- three.js ----------
  const T = G.three;
  const objIds = new WeakMap();
  let objN = 0;
  const oid = (o) => { let i = objIds.get(o); if (!i) { i = ++objN; objIds.set(o, i); } return i; };
  const label = (o) => (o.name ? o.name.replace(/[.\s#:]+/g, "_") : o.type || "Object3D") + "#" + oid(o);
  const lastVal = {};
  function pushVal(f, key, v) {
    if (typeof v === "boolean") v = +v;
    if (typeof v !== "number" || !isFinite(v)) return;
    v = r5(v);
    if (lastVal[key] !== v) { lastVal[key] = v; f.sg[key] = v; }
  }
  function pushUniform(f, key, v) {
    if (v === null || v === undefined) return;
    if (typeof v === "number" || typeof v === "boolean") return pushVal(f, key, v);
    if (v.isColor) { pushVal(f, key + ".r", v.r); pushVal(f, key + ".g", v.g); pushVal(f, key + ".b", v.b); return; }
    if (v.isVector2 || v.isVector3 || v.isVector4 || v.isQuaternion) { for (const c of ["x", "y", "z", "w"]) if (c in v) pushVal(f, key + "." + c, v[c]); return; }
    if (v.isMatrix3 || v.isMatrix4) { v.elements.forEach((e, k) => pushVal(f, key + "[" + k + "]", e)); return; }
    if (Array.isArray(v) && v.length <= 16 && typeof v[0] === "number") v.forEach((e, k) => pushVal(f, key + "[" + k + "]", e));
  }
  function pushTransform(f, key, o) {
    for (const c of ["x", "y", "z"]) pushVal(f, key + ".position." + c, o.position[c]);
    for (const c of ["x", "y", "z"]) pushVal(f, key + ".rotation." + c, o.rotation[c]);
    for (const c of ["x", "y", "z"]) pushVal(f, key + ".scale." + c, o.scale[c]);
    pushVal(f, key + ".visible", o.visible);
  }
  function recordRender(renderer, scene, camera) {
    const f = frame();
    if (f.dropped || !scene) return;
    let si = T.scenes.indexOf(scene);
    if (si < 0) { T.scenes.push(scene); si = T.scenes.length - 1; }
    const rt = renderer.getRenderTarget ? renderer.getRenderTarget() : null;
    let rti = 0;
    if (rt) { rti = T.rts.indexOf(rt) + 1; if (!rti) { T.rts.push(rt); rti = T.rts.length; } }
    (f.tr = f.tr || []).push({ engine: "three", s: si, cam: camera ? label(camera) : null, rt: rti });
    const pre = "three:s" + si + "/";
    if (camera) {
      const ck = pre + "cam:" + label(camera);
      pushTransform(f, ck, camera);
      for (const k of ["fov", "zoom", "near", "far", "left", "right", "top", "bottom"]) if (k in camera) pushVal(f, ck + "." + k, camera[k]);
    }
    let n = 0;
    const seen = new Set();
    scene.traverse((o) => {
      if (n >= MAX_OBJECTS || o === scene) return;
      n++;
      const k = pre + label(o);
      pushTransform(f, k, o);
      if (o.morphTargetInfluences) o.morphTargetInfluences.slice(0, 8).forEach((v, i) => pushVal(f, k + ".morph[" + i + "]", v));
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of mats) {
        if (seen.has(m)) continue;
        seen.add(m);
        const mk = pre + "mat:" + label(m);
        pushVal(f, mk + ".opacity", m.opacity);
        if (m.color) pushUniform(f, mk + ".color", m.color);
        if (m.emissive) pushUniform(f, mk + ".emissive", m.emissive);
        if (m.uniforms) for (const u in m.uniforms) pushUniform(f, mk + "." + u, m.uniforms[u] && m.uniforms[u].value);
      }
    });
  }
  function hookRenderer(r) {
    if (T.renderers.includes(r)) return;
    T.renderers.push(r);
    const orig = r.render;
    if (typeof orig !== "function" || orig.__mc) return;
    const f = function (scene, camera) { try { recordRender(this, scene, camera); } catch (e) { note("three.render", e); } return orig.apply(this, arguments); };
    f.__mc = true;
    r.render = f;
  }
  try {
    const dt = w.__THREE_DEVTOOLS__ || (w.__THREE_DEVTOOLS__ = new EventTarget());
    dt.addEventListener("register", (e) => { T.revision = e.detail && e.detail.revision; });
    dt.addEventListener("observe", (e) => {
      const o = e.detail;
      if (!o) return;
      if (o.isScene) { if (!T.scenes.includes(o)) T.scenes.push(o); }
      else if (o.isWebGLRenderer || o.isWebGPURenderer || o.isRenderer || (typeof o.render === "function" && o.domElement)) queueMicrotask(() => hookRenderer(o));
      else if (typeof o.clipAction === "function") T.mixers.push(o); // AnimationMixer (r183+): its clips are keyframe data
      else if (typeof o.load === "function" && "manager" in o) hookLoader(o); // Loader (r183+): which files became the scene
    });
  } catch (e) { note("three hook", e); }
  T.mixers = [];
  T.loads = [];
  function hookLoader(l) {
    const load = l.load;
    if (typeof load !== "function" || load.__mc) return;
    const f = function (url) { try { if (T.loads.length < 200) T.loads.push({ loader: l.constructor && l.constructor.name, url: String(url) }); } catch {} return load.apply(this, arguments); };
    f.__mc = true;
    l.load = f;
  }

  // ---------- other engines: scene graph values per render, same channel format as three.js ----------
  // Each hook is the engine's own devtools entry point, so it works on bundled builds without globals.
  G.engines = { pixi: [], playcanvas: [], babylon: [], ogl: [] };
  const named = (o, fallback) => String((o && (o.label || o.name)) || fallback).replace(/[.\s#:/]+/g, "_");
  function pixiSample(stage) {
    const f = frame();
    if (f.dropped || !stage) return;
    let n = 0;
    const walk = (o, path) => {
      if (n++ >= MAX_OBJECTS) return;
      const k = "pixi:" + path + named(o, o.constructor && o.constructor.name) + "#" + oid(o);
      for (const p of ["x", "y", "rotation", "alpha", "visible"]) pushVal(f, k + "." + p, o[p]);
      if (o.scale) { pushVal(f, k + ".scale.x", o.scale.x); pushVal(f, k + ".scale.y", o.scale.y); }
      if (o.children) for (const c of o.children) walk(c, "");
    };
    walk(stage, "");
    (f.tr = f.tr || []).push({ engine: "pixi" });
  }
  w.__PIXI_APP_INIT__ = function (app, version) { G.engines.pixi.push({ version, app }); };
  w.__PIXI_RENDERER_INIT__ = function (renderer, version) {
    G.engines.pixi.push({ version, renderer });
    const r = renderer.render;
    if (typeof r === "function" && !r.__mc) {
      const f = function (opts) { try { pixiSample(opts && opts.container ? opts.container : opts); } catch (e) { note("pixi", e); } return r.apply(this, arguments); };
      f.__mc = true;
      renderer.render = f;
    }
  };
  try {
    w[Symbol.for("playcanvas.inspector")] = {
      register(app, inf) {
        G.engines.playcanvas.push({ version: inf && inf.version, app });
        app.on && app.on("framerender", () => {
          const f = frame();
          if (f.dropped) return;
          let n = 0;
          const walk = (e) => {
            if (n++ >= MAX_OBJECTS) return;
            const k = "playcanvas:" + named(e, "Entity") + "#" + oid(e);
            const p = e.getLocalPosition && e.getLocalPosition(), r = e.getLocalEulerAngles && e.getLocalEulerAngles(), s = e.getLocalScale && e.getLocalScale();
            if (p) for (const c of ["x", "y", "z"]) pushVal(f, k + ".position." + c, p[c]);
            if (r) for (const c of ["x", "y", "z"]) pushVal(f, k + ".rotation." + c, r[c]);
            if (s) for (const c of ["x", "y", "z"]) pushVal(f, k + ".scale." + c, s[c]);
            pushVal(f, k + ".enabled", e.enabled);
            for (const c of e.children || []) walk(c);
          };
          try { walk(app.root); } catch (e) { note("playcanvas", e); }
          (f.tr = f.tr || []).push({ engine: "playcanvas" });
        });
      },
      unregister() {},
    };
  } catch (e) { note("playcanvas hook", e); }
  function babylonScenes() {
    const B = w.BABYLON;
    if (!B || !B.Engine || !B.Engine.Instances) return;
    for (const eng of B.Engine.Instances) for (const sc of eng.scenes || []) {
      if (sc.__mc) continue;
      sc.__mc = true;
      G.engines.babylon.push({ version: B.Engine.Version, scene: sc });
      sc.onBeforeRenderObservable.add(() => {
        const f = frame();
        if (f.dropped) return;
        let n = 0;
        const objs = [].concat(sc.activeCamera ? [sc.activeCamera] : [], sc.meshes || [], sc.transformNodes || []);
        for (const m of objs) {
          if (n++ >= MAX_OBJECTS) break;
          const k = "babylon:" + named(m, m.getClassName ? m.getClassName() : "Node") + "#" + oid(m);
          for (const prop of ["position", "rotation", "scaling"]) if (m[prop]) for (const c of ["x", "y", "z"]) pushVal(f, k + "." + prop + "." + c, m[prop][c]);
          if ("alpha" in m) pushVal(f, k + ".alpha", m.alpha);
          if ("beta" in m) pushVal(f, k + ".beta", m.beta);
          if ("radius" in m) pushVal(f, k + ".radius", m.radius);
          if ("visibility" in m) pushVal(f, k + ".visibility", m.visibility);
        }
        (f.tr = f.tr || []).push({ engine: "babylon" });
      });
    }
  }
  // OGL sets gl.renderer = this on the context it creates; wrap its render({ scene, camera })
  function oglCheck(gl) {
    const r = gl && gl.renderer;
    if (!r || r.__mc || typeof r.render !== "function") return;
    r.__mc = true;
    G.engines.ogl.push({ renderer: r });
    const render = r.render;
    r.render = function (opts) {
      try {
        const f = frame();
        const scene = opts && opts.scene;
        if (!f.dropped && scene && scene.traverse) {
          let n = 0;
          const objs = [];
          if (opts.camera) objs.push(opts.camera);
          scene.traverse((o) => { if (n++ < MAX_OBJECTS) objs.push(o); });
          for (const o of objs) {
            const k = "ogl:" + named(o, o.constructor && o.constructor.name) + "#" + oid(o);
            for (const prop of ["position", "rotation", "scale"]) if (o[prop]) for (const [i, c] of ["x", "y", "z"].entries()) pushVal(f, k + "." + prop + "." + c, o[prop][c] !== undefined ? o[prop][c] : o[prop][i]);
            if ("visible" in o) pushVal(f, k + ".visible", o.visible);
            const u = o.program && o.program.uniforms;
            if (u) for (const name in u) { const v = u[name] && u[name].value; if (typeof v === "number") pushVal(f, k + ".u." + name, v); else if (v && v.length <= 4 && typeof v[0] === "number") for (let i = 0; i < v.length; i++) pushVal(f, k + ".u." + name + "[" + i + "]", v[i]); }
          }
          (f.tr = f.tr || []).push({ engine: "ogl" });
        }
      } catch (e) { note("ogl", e); }
      return render.apply(this, arguments);
    };
  }
  const engineScan = () => { babylonScenes(); for (const c of G.ctxs) if (c._ctx) oglCheck(c._ctx); };

  // ---------- WebGPU ----------
  if (w.GPU && GPU.prototype.requestAdapter) wrap(GPU.prototype, "requestAdapter", function (pr) {
    if (pr && pr.then) pr.then((ad) => { try { if (ad && ad.info) G.gpu.adapter = { vendor: ad.info.vendor, architecture: ad.info.architecture, device: ad.info.device, description: ad.info.description }; } catch {} });
  });
  if (w.GPUDevice) {
    const gpuId = new WeakMap();
    let gn = 0;
    const gid = (o, k) => { let i = gpuId.get(o); if (!i) { i = (CFG.idPrefix || "") + k + ++gn; gpuId.set(o, i); } return i; };
    wrap(GPUDevice.prototype, "createShaderModule", function (m, [d]) { G.gpu.modules.push({ id: gid(m, "m"), label: d && d.label, code: d && d.code }); });
    const pipe = function (pl, [d], kind) {
      const blend = d && d.fragment && d.fragment.targets ? d.fragment.targets.map((t) => t && { format: t.format, blend: t.blend }) : undefined;
      G.gpu.pipelines.push({ id: gid(pl, "pl"), kind, label: d && d.label, vertex: d && d.vertex && { module: gid(d.vertex.module, "m"), entryPoint: d.vertex.entryPoint }, fragment: d && d.fragment && { module: gid(d.fragment.module, "m"), entryPoint: d.fragment.entryPoint, targets: blend }, compute: d && d.compute && { module: gid(d.compute.module, "m"), entryPoint: d.compute.entryPoint }, primitive: d && d.primitive });
    };
    wrap(GPUDevice.prototype, "createRenderPipeline", function (pl, a) { pipe(pl, a, "render"); });
    wrap(GPUDevice.prototype, "createComputePipeline", function (pl, a) { pipe(pl, a, "compute"); });
    wrap(GPUDevice.prototype, "createBuffer", function (b, [d]) { G.gpu.buffers.push({ id: gid(b, "gb"), label: d && d.label, size: d && d.size, usage: d && d.usage }); });
    if (w.GPUQueue) wrap(GPUQueue.prototype, "writeBuffer", function (_, [buf, off, data, dOff, size]) {
      const f = frame();
      if (f.dropped || !data) return;
      const bytes = ArrayBuffer.isView(data) ? data.byteLength : data.byteLength;
      if (bytes > 1024) return; // uniforms, not geometry
      const view = ArrayBuffer.isView(data) ? new Float32Array(data.buffer, data.byteOffset, Math.floor(data.byteLength / 4)) : new Float32Array(data, 0, Math.floor(data.byteLength / 4));
      const start = (dOff || 0) * (ArrayBuffer.isView(data) ? data.BYTES_PER_ELEMENT / 4 : 1 / 4);
      f.gw[gid(buf, "gb") + "@" + (off || 0)] = Array.prototype.slice.call(view, start, Math.min(view.length, start + (size ? size / 4 : 64), start + 64)).map(r5);
    });
    if (w.GPURenderPassEncoder) for (const n of ["draw", "drawIndexed", "drawIndirect", "drawIndexedIndirect"]) wrap(GPURenderPassEncoder.prototype, n, function (_, a) { const f = frame(); if (!f.dropped) { f.gd = (f.gd || 0) + 1; if (f.d.length < MAX_DRAWS) f.d.push({ gpu: n, n: a[0], i: a[1] }); } });
  }

  // ---------- Canvas 2D ----------
  if (CFG.canvas2d !== false && w.CanvasRenderingContext2D) {
    const P = CanvasRenderingContext2D.prototype;
    const every = CFG.sample2dEvery || 15;
    const fmt = (v) => typeof v === "number" ? r5(v) : typeof v === "string" ? v.slice(0, 60) : v && v.constructor ? "[" + v.constructor.name + (v.src ? " " + String(v.src).slice(-60) : "") + "]" : String(v);
    const log = (ctx, name, args) => {
      const c = reg.get(ctx);
      if (!c) return;
      const f = frame();
      if (f.dropped) return;
      const c2 = (f.c2 = f.c2 || {});
      const per = (c2[c.id] = c2[c.id] || { n: 0, calls: {} });
      per.n++;
      per.calls[name] = (per.calls[name] || 0) + 1;
      if (f.i % every === 0 && per.n <= 2000) (per.log = per.log || []).push(name + "(" + Array.prototype.map.call(args, fmt).join(", ") + ")");
    };
    for (const name of Object.getOwnPropertyNames(P)) {
      const d = Object.getOwnPropertyDescriptor(P, name);
      if (!d || name === "constructor") continue;
      if (typeof d.value === "function" && !/^(get|is|measureText)/.test(name)) wrap(P, name, function (_, a) { log(this, name, a); });
      else if (d.set && /Style|global|line|font|shadow|filter|text|imageSmoothing/.test(name)) {
        Object.defineProperty(P, name, { configurable: true, enumerable: d.enumerable, get: d.get, set(v) { d.set.call(this, v); try { log(this, name + "=", [v]); } catch {} } });
      }
    }
  }

  // ---------- export ----------
  G.export = function () {
    const out = { revision: T.revision, errors: G.errors, frames: G.frames.length, contexts: [], programs: [], textures: [], buffers: [], framebuffers: G.fbs, frameData: G.frames, three: null, gpu: G.gpu, dumps: {} };
    for (const c of G.ctxs) {
      const o = { id: c.id, type: c.type, canvas: c.canvas, requested: c.requested, created: c.created, extensions: c.ext ? Object.keys(c.ext) : undefined };
      try {
        const el = c._canvas;
        if (el) {
          o.size = [el.width, el.height];
          if (el.getBoundingClientRect) { const r = el.getBoundingClientRect(); o.cssRect = [r.x, r.y, r.width, r.height].map((v) => Math.round(v)); o.pixelRatio = r.width ? +(el.width / r.width).toFixed(3) : null; }
        }
        const gl = c._ctx;
        if (c.type === "webgl" || c.type === "webgl2") {
          o.attributes = gl.getContextAttributes();
          const dbg = gl.getExtension("WEBGL_debug_renderer_info");
          o.renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
          o.version = gl.getParameter(gl.VERSION);
          o.contextLost = gl.isContextLost();
        }
      } catch (e) { note("export ctx", e); }
      out.contexts.push(o);
    }
    // three.js renderers: settings, and their WebGLProgram names so GL programs get readable labels
    if (T.renderers.length || T.scenes.length) {
      out.three = { revision: T.revision || w.__THREE__ || null, renderers: [], scenes: [], loads: T.loads.length ? T.loads : undefined, mixers: undefined };
      if (T.mixers.length) out.three.mixers = T.mixers.map((m) => {
        const acts = (m._actions || []).map((act) => {
          const c = act.getClip ? act.getClip() : act._clip;
          return { clip: c && c.name, duration: c && c.duration, tracks: c && c.tracks.slice(0, 60).map((tr) => ({ name: tr.name, type: tr.ValueTypeName, keys: tr.times.length, times: Array.from(tr.times.slice(0, 64)).map(r5), values: Array.from(tr.values.slice(0, 256)).map(r5), interpolation: tr.getInterpolation && tr.getInterpolation() })), running: act.isRunning && act.isRunning(), time: r5(act.time), timeScale: act.timeScale, weight: act.weight, loop: act.loop, repetitions: act.repetitions, clampWhenFinished: act.clampWhenFinished };
        });
        return { root: m.getRoot && m.getRoot() && label(m.getRoot()), timeScale: m.timeScale, actions: acts };
      });
      for (const r of T.renderers) {
        const o = {};
        try {
          const cc = { r: 0, g: 0, b: 0, copy(c) { this.r = c.r; this.g = c.g; this.b = c.b; return this; } };
          if (r.getClearColor) r.getClearColor(cc);
          const size = r.getSize ? r.getSize({ set(x, y) { this.x = x; this.y = y; return this; } }) : null;
          Object.assign(o, {
            kind: r.isWebGPURenderer ? "WebGPURenderer" : r.isWebGLRenderer ? "WebGLRenderer" : "renderer",
            canvas: describeEl(r.domElement), pixelRatio: r.getPixelRatio && r.getPixelRatio(), size: size && [size.x, size.y],
            toneMapping: r.toneMapping, toneMappingExposure: r.toneMappingExposure, outputColorSpace: r.outputColorSpace, outputEncoding: r.outputEncoding,
            clearColor: [cc.r, cc.g, cc.b].map(r5), clearAlpha: r.getClearAlpha && r.getClearAlpha(), autoClear: r.autoClear, sortObjects: r.sortObjects,
            shadowMap: r.shadowMap && { enabled: r.shadowMap.enabled, type: r.shadowMap.type }, useLegacyLights: r.useLegacyLights,
            info: r.info && { render: Object.assign({}, r.info.render), memory: Object.assign({}, r.info.memory) },
          });
          const progs = (r.info && r.info.programs) || [];
          for (const wp of progs) {
            const gp = wp && wp.program && reg.get(wp.program);
            if (gp) gp.label = (wp.name ? wp.name + " " : "") + "(" + (wp.type || "material") + ")";
          }
          if (r.properties && r.properties.get) for (const sc of T.scenes) sc.traverse((o) => {
            for (const m of o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []) {
              const wp = r.properties.get(m).currentProgram;
              const gp = wp && wp.program && reg.get(wp.program);
              if (gp) { gp.three = gp.three || []; const tag = "three:s" + T.scenes.indexOf(sc) + "/mat:" + label(m) + " on " + label(o); if (!gp.three.includes(tag)) gp.three.push(tag); }
            }
          });
        } catch (e) { note("export three renderer", e); }
        out.three.renderers.push(o);
      }
      T.scenes.forEach((s, i) => {
        const o = { index: i, uuid: s.uuid, name: s.name, objects: 0, tree: [] };
        try {
          s.traverse((x) => {
            o.objects++;
            if (o.tree.length >= 400) return;
            let depth = 0; for (let p = x.parent; p && p !== s.parent; p = p.parent) depth++;
            const g = x.geometry, m = x.material;
            const mats = m ? (Array.isArray(m) ? m : [m]) : [];
            o.tree.push({
              depth, key: x === s ? "scene" : label(x), type: x.type, name: x.name || undefined, visible: x.visible, renderOrder: x.renderOrder || undefined,
              position: x.position && x.position.toArray().map(r5), rotation: x.rotation && [x.rotation.x, x.rotation.y, x.rotation.z].map(r5), scale: x.scale && x.scale.toArray().map(r5),
              geometry: g && { type: g.type, parameters: g.parameters, vertices: g.attributes && g.attributes.position ? g.attributes.position.count : undefined, attributes: g.attributes ? Object.keys(g.attributes) : undefined, instances: x.count },
              material: mats.length ? mats.map((mm) => ({ key: label(mm), type: mm.type, name: mm.name || undefined, transparent: mm.transparent, blending: mm.blending, depthTest: mm.depthTest, depthWrite: mm.depthWrite, side: mm.side, opacity: mm.opacity, color: mm.color && mm.color.getHexString && "#" + mm.color.getHexString(), map: mm.map ? (mm.map.image && (mm.map.image.currentSrc || mm.map.image.src)) || mm.map.name || "texture" : undefined, uniforms: mm.uniforms ? Object.keys(mm.uniforms) : undefined })) : undefined,
              animations: x.animations && x.animations.length ? x.animations.map((a) => ({ name: a.name, duration: a.duration, tracks: a.tracks.length })) : undefined,
            });
          });
          if (CFG.sceneJson !== false) {
            const json = JSON.stringify(s.toJSON());
            o.jsonBytes = json.length;
            if (json.length <= (CFG.maxSceneBytes || 40e6)) o._json = json;
          }
        } catch (e) { note("export three scene " + i, e); }
        out.three.scenes.push(o);
      });
    }
    out.engines = {};
    for (const [k, list] of Object.entries(G.engines)) if (list.length) out.engines[k] = list.map((e) => ({ version: e.version, kind: e.app ? "app" : e.renderer ? "renderer" : e.scene ? "scene" : "?" }));
    out.timeOrigin = performance.timeOrigin;
    for (const p of G.programs) {
      const o = { id: p.id, label: p.label, three: p.three, ctx: p.ctx, links: p.links, deleted: p.deleted || undefined, draws: p.draws, modes: Object.keys(p.modes), maxCount: p.maxCount, maxInstances: p.maxInst || undefined, state: p.state, layout: p.layout, vs: p.vsSrc, fs: p.fsSrc, uniforms: [], longUniforms: Object.keys(p.long).length ? p.long : undefined };
      try {
        const gl = p._gl;
        if (!p.deleted && gl && !gl.isContextLost()) {
          const n = gl.getProgramParameter(p._p, gl.ACTIVE_UNIFORMS) || 0;
          for (let k = 0; k < n; k++) {
            const u = gl.getActiveUniform(p._p, k);
            if (!u) continue;
            const name = u.name.replace(/\[0\]$/, "");
            o.uniforms.push({ name, type: TYPE[u.type] || u.type, size: u.size, value: p.vals[name] });
          }
          const na = gl.getProgramParameter(p._p, gl.ACTIVE_ATTRIBUTES) || 0;
          o.attributes = [];
          for (let k = 0; k < na; k++) { const a = gl.getActiveAttrib(p._p, k); if (a) o.attributes.push({ name: a.name, type: TYPE[a.type] || a.type, size: a.size }); }
        }
      } catch (e) { note("export program", e); }
      if (!o.uniforms.length) o.uniforms = Object.keys(p.vals).map((name) => ({ name, value: p.vals[name] }));
      out.programs.push(o);
    }
    for (const t of G.textures) {
      const o = { id: t.id, w: t.w, h: t.h, uploads: t.uploads };
      if (t.src) { o.src = Object.assign({}, t.src); delete o.src._el; if (t.src._el && CFG.snapshotCanvases !== false) { try { o.src.dataUrl = t.src._el.toDataURL ? t.src._el.toDataURL("image/png") : undefined; } catch {} } }
      out.textures.push(o);
    }
    for (const b of G.buffers) {
      out.buffers.push({ id: b.id, target: b.target, usage: b.usage, type: b.type, bytes: b.bytes, uploads: b.uploads, subUploads: b.subUploads, sample: b.sample });
      if (b._dump) {
        const u8 = new Uint8Array(b._dump.buffer, b._dump.byteOffset, b._dump.byteLength);
        let s = "";
        for (let k = 0; k < u8.length; k += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(k, k + 0x8000));
        out.dumps[b.id] = { type: b.type, base64: btoa(s) };
      }
    }
    return out;
  };
})
