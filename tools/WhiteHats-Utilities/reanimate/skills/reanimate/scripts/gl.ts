// Read what capture.ts --gl recorded from a canvas: WebGL / WebGPU / canvas 2D calls and the three.js scene.
// capture.ts calls writeGlArtifacts() to turn the raw in-page trace into files; the CLI reads them back.
//
// Usage: bun gl.ts summary <capture dir>
//        bun gl.ts channels <capture dir> [--grep RE] [--series KEY]
//        bun gl.ts compare --ref <capture dir> --clone <capture dir> [--map "refName=cloneName,…"]
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { abs, ensureDir, num, parseArgs, readJson, usage, writeJson } from "./lib.ts";

const slug = (s: string) => s.replace(/\(([^)]*)\)/g, "$1").replace(/[^\w-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
const suffix = (n: number, k: number) => (n === 1 ? "" : n <= 4 ? "." + "xyzw"[k] : `[${k}]`);
const r4 = (v: number) => +v.toPrecision(5);

type Channel = { source: "uniform" | "scene" | "webgpu"; program?: string; uniform?: string; min: number; max: number; firstChangeMs: number | null; lastChangeMs: number | null; kind: string; perSecond?: number; periodMs?: number };

// What a channel does over the capture: constant, a clock (uniform time), a transition between two rests,
// an oscillation, or several steps. The kind decides how it is cloned (drive by time, ease, loop).
function classify(ts: number[], vs: number[]): Pick<Channel, "min" | "max" | "firstChangeMs" | "lastChangeMs" | "kind" | "perSecond" | "periodMs"> {
  const min = Math.min(...vs), max = Math.max(...vs), range = max - min;
  const base = { min: r4(min), max: r4(max) };
  if (!(range > 1e-7)) return { ...base, firstChangeMs: null, lastChangeMs: null, kind: "constant" };
  const eps = range * 0.002;
  let first = -1, last = -1, ups = 0, downs = 0, turns = 0, prevSign = 0;
  for (let i = 1; i < vs.length; i++) {
    const d = vs[i] - vs[i - 1];
    if (Math.abs(d) <= eps) continue;
    if (first < 0) first = i - 1;
    last = i;
    const s = Math.sign(d);
    if (s > 0) ups++; else downs++;
    if (prevSign && s !== prevSign) turns++;
    prevSign = s;
  }
  const firstChangeMs = Math.round(ts[first + 1]), lastChangeMs = Math.round(ts[last]); // first sample that moved, sample where it settled
  const moving = ups + downs;
  const span = ts[ts.length - 1] - ts[0];
  if (turns === 0) {
    // monotonic: a clock if it moves through the whole capture at a constant rate
    const n = vs.length, mt = ts.reduce((s, t) => s + t, 0) / n, mv = vs.reduce((s, v) => s + v, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { sxy += (ts[i] - mt) * (vs[i] - mv); sxx += (ts[i] - mt) ** 2; syy += (vs[i] - mv) ** 2; }
    const r2 = sxx && syy ? (sxy * sxy) / (sxx * syy) : 0;
    if (r2 > 0.995 && lastChangeMs - firstChangeMs > span * 0.8) return { ...base, firstChangeMs, lastChangeMs, kind: "clock", perSecond: r4((sxy / sxx) * 1000) };
    return { ...base, firstChangeMs, lastChangeMs, kind: "transition" };
  }
  if (turns >= 3) {
    // period from the mean distance between same-direction turning points
    const peaks: number[] = [];
    for (let i = 1; i < vs.length - 1; i++) if (vs[i] > vs[i - 1] + eps / 2 && vs[i] >= vs[i + 1]) peaks.push(ts[i]);
    const periodMs = peaks.length >= 2 ? Math.round((peaks[peaks.length - 1] - peaks[0]) / (peaks.length - 1)) : undefined;
    return { ...base, firstChangeMs, lastChangeMs, kind: moving > vs.length * 0.6 ? "oscillation" : "steps", periodMs };
  }
  return { ...base, firstChangeMs, lastChangeMs, kind: "there-and-back" };
}

// ---------- capture.ts → files ----------
export function writeGlArtifacts(out: string, d: any, t0: number, rate: number) {
  const dir = join(out, "gl");
  rmSync(dir, { recursive: true, force: true });
  rmSync(join(out, "three"), { recursive: true, force: true });
  ensureDir(dir);
  const t = (pageMs: number) => +((pageMs - t0) * rate).toFixed(1);
  const progKey = new Map<string, string>();
  for (const p of d.programs) progKey.set(p.id, p.id + (p.label ? ":" + slug(p.label) : ""));

  // shaders
  const shaderDir = ensureDir(join(dir, "shaders"));
  for (const p of d.programs) {
    const base = progKey.get(p.id)!.replace(":", "-");
    p.files = {};
    if (p.vs) { writeFileSync(join(shaderDir, base + ".vert"), p.vs); p.files.vs = `gl/shaders/${base}.vert`; }
    if (p.fs) { writeFileSync(join(shaderDir, base + ".frag"), p.fs); p.files.fs = `gl/shaders/${base}.frag`; }
    delete p.vs; delete p.fs;
  }
  for (const m of d.gpu?.modules ?? []) {
    if (!m.code) continue;
    const f = `${m.id}${m.label ? "-" + slug(m.label) : ""}.wgsl`;
    writeFileSync(join(shaderDir, f), m.code);
    m.file = `gl/shaders/${f}`;
    delete m.code;
  }
  // buffer dumps and canvas textures
  for (const [id, dump] of Object.entries<any>(d.dumps ?? {})) {
    const f = `${id}.${dump.type.replace(/Array$/, "")}.bin`;
    writeFileSync(join(ensureDir(join(dir, "buffers")), f), Buffer.from(dump.base64, "base64"));
    const b = d.buffers.find((x: any) => x.id === id);
    if (b) b.file = `gl/buffers/${f}`;
  }
  delete d.dumps;
  for (const tx of d.textures) {
    const url: string | undefined = tx.src?.dataUrl;
    if (!url) continue;
    writeFileSync(join(ensureDir(join(dir, "textures")), `${tx.id}.png`), Buffer.from(url.split(",")[1], "base64"));
    tx.src.file = `gl/textures/${tx.id}.png`;
    delete tx.src.dataUrl;
  }
  // three.js scenes in three's own JSON format (ObjectLoader.parse() loads them back)
  if (d.three) for (const s of d.three.scenes) {
    if (s._json) { writeFileSync(join(ensureDir(join(out, "three")), `scene-${s.index}.json`), s._json); s.file = `three/scene-${s.index}.json`; delete s._json; }
  }

  // ---------- channels ----------
  const frames: any[] = d.frameData;
  type Raw = { ts: number[]; vs: number[] };
  const raw = new Map<string, Raw>();
  const put = (key: string, tm: number, v: number) => { let r = raw.get(key); if (!r) raw.set(key, (r = { ts: [], vs: [] })); r.ts.push(tm); r.vs.push(v); };
  const meta = new Map<string, Partial<Channel>>();
  // uniforms: deltas per (program, n-th draw of it in the frame), replayed into values per frame
  const state = new Map<string, Record<string, number[]>>();
  const perOrd = new Map<string, Map<number, Raw>>(); // "prog|uniform|k" → ord → series
  for (const f of frames) {
    const tm = t(f.t);
    for (const [key, delta] of Object.entries<any>(f.u ?? {})) state.set(key, { ...(state.get(key) ?? {}), ...delta });
    for (const [pid, count] of Object.entries<number>(f.pc ?? {})) {
      for (let ord = 0; ord < count; ord++) {
        const vals = state.get(`${pid}#${ord}`);
        if (!vals) continue;
        for (const [name, v] of Object.entries(vals)) {
          if (v.length > 16) continue;
          v.forEach((x, k) => {
            const id = `${pid}|${name}|${k}|${v.length}`;
            let m = perOrd.get(id);
            if (!m) perOrd.set(id, (m = new Map()));
            let r = m.get(ord);
            if (!r) m.set(ord, (r = { ts: [], vs: [] }));
            r.ts.push(tm); r.vs.push(x);
          });
        }
      }
    }
  }
  for (const [id, m] of perOrd) {
    const [pid, name, k, n] = id.split("|");
    const series = [...m.entries()].sort((x, y) => x[0] - y[0]);
    const same = series.every(([, r]) => r.vs.length === series[0][1].vs.length && r.vs.every((v, i) => v === series[0][1].vs[i]));
    for (const [ord, r] of same ? series.slice(0, 1) : series) {
      const key = `${progKey.get(pid) ?? pid}${same ? "" : "#" + ord}.${name}${suffix(+n, +k)}`;
      raw.set(key, r);
      meta.set(key, { source: "uniform", program: pid, uniform: name });
    }
  }
  // scene graphs (three.js, pixi, playcanvas, babylon, ogl): deltas of camera / object / material values per render
  const sg: Record<string, number> = {};
  for (const f of frames) {
    if (!f.sg || !f.tr) continue;
    Object.assign(sg, f.sg);
    const tm = t(f.t);
    for (const [key, v] of Object.entries(sg)) { put(key, tm, v); if (!meta.has(key)) meta.set(key, { source: "scene" }); }
  }
  // WebGPU uniform buffer writes
  const gw: Record<string, number[]> = {};
  for (const f of frames) {
    if (!f.gw || !Object.keys(f.gw).length) continue;
    Object.assign(gw, f.gw);
    const tm = t(f.t);
    for (const [key, v] of Object.entries(gw)) v.forEach((x, k) => { const ck = `gpu:${key}[${k}]`; put(ck, tm, x); if (!meta.has(ck)) meta.set(ck, { source: "webgpu" }); });
  }

  const channels: Record<string, Channel> = {};
  const constants: Record<string, number> = {};
  for (const [key, r] of raw) {
    const c = classify(r.ts, r.vs);
    if (c.kind === "constant") { if (meta.get(key)?.source !== "scene" || Object.keys(constants).length < 2000) constants[key] = r.vs[0]; continue; }
    channels[key] = { ...(meta.get(key) as any), ...c };
  }
  // samples: one per frame that drew something, values carried forward between draws
  const keys = Object.keys(channels);
  const idx = new Map(keys.map((k) => [k, 0]));
  const samples: any[] = [];
  const times = [...new Set(keys.flatMap((k) => raw.get(k)!.ts))].sort((x, y) => x - y);
  const cur: Record<string, number> = {};
  for (const tm of times) {
    for (const k of keys) {
      const r = raw.get(k)!;
      let i = idx.get(k)!;
      while (i < r.ts.length && r.ts[i] <= tm) { cur[k] = r.vs[i]; i++; }
      idx.set(k, i);
    }
    samples.push({ t: tm, v: { ...cur } });
  }
  writeJson(join(out, "gl-track.json"), {
    kind: "gl-track", note: "t in ms, 0 = trigger. One sample per rendered frame; v holds every channel that changes during the capture (constants are in gl/gl.json). Fit one with: easing.ts --track gl-track.json --channel <key>",
    channels, samples,
  });

  // ---------- passes: what one frame draws, in order, per canvas ----------
  const drawn = frames.filter((f) => f.d?.length);
  const passes: any[] = [];
  const canvasOf = new Map(d.contexts.map((c: any) => [c.id, c.canvas]));
  const ctxIds = [...new Set(drawn.flatMap((f) => f.d.map((x: any) => x.c ?? "webgpu")))];
  for (const cid of ctxIds) {
    const rep = [...drawn].reverse().find((f) => f.d.some((x: any) => (x.c ?? "webgpu") === cid));
    if (!rep) continue;
    for (const dr of rep.d.filter((x: any) => (x.c ?? "webgpu") === cid)) {
      const fb = dr.fb && d.framebuffers.find((x: any) => x.id === dr.fb);
      const target = `${cid} ${canvasOf.get(cid) ?? ""} → ` + (dr.gpu ? "webgpu" : dr.fb ? `framebuffer ${dr.fb}${fb?.color ? " → texture " + fb.color : ""}` : "screen");
      let p = passes[passes.length - 1];
      if (!p || p.target !== target) passes.push((p = { target, draws: [] }));
      const last = p.draws[p.draws.length - 1];
      const label = dr.gpu ? dr.gpu : `${progKey.get(dr.p) ?? dr.p} ${dr.m} ${dr.n}${dr.i ? " ×" + dr.i + " instances" : ""}${dr.tx ? " samples " + dr.tx.filter(Boolean).join(",") : ""} [${dr.st}]`;
      if (last && last.label === label) last.times++;
      else p.draws.push({ label, times: 1 });
    }
  }
  const drawCounts = drawn.map((f) => f.d.length + (f.more || 0));
  const avgDraws = drawCounts.length ? +(drawCounts.reduce((s, n) => s + n, 0) / drawCounts.length).toFixed(1) : 0;
  writeJson(join(dir, "draws.json"), { note: "per frame: every draw call (p program, m primitive, n vertices, i instances, fb target framebuffer, tx bound textures by unit, st state), clears, three.js render calls", frames: frames.map((f) => ({ t: t(f.t), draws: f.d, more: f.more || undefined, clears: f.cl?.length ? f.cl : undefined, three: f.tr, canvas2d: f.c2 ? Object.fromEntries(Object.entries<any>(f.c2).map(([k, v]) => [k, { n: v.n, calls: v.calls }])) : undefined })) });
  // canvas 2D call logs from sampled frames
  const logs: Record<string, string[]> = {};
  for (const f of frames) for (const [cid, v] of Object.entries<any>(f.c2 ?? {})) if (v.log) (logs[cid] = logs[cid] ?? []).push(`--- frame t=${t(f.t)}ms (${v.n} calls)`, ...v.log);
  for (const [cid, lines] of Object.entries(logs)) writeFileSync(join(dir, `canvas2d-${cid}.txt`), lines.join("\n") + "\n");

  // ---------- gl.json ----------
  const animatedBy = new Map<string, string[]>();
  for (const [k, c] of Object.entries(channels)) if (c.program) animatedBy.set(c.program + "|" + c.uniform, [...(animatedBy.get(c.program + "|" + c.uniform) ?? []), k]);
  for (const p of d.programs) {
    p.key = progKey.get(p.id);
    p.drawsPerFrame = drawn.length ? +(p.draws / drawn.length).toFixed(2) : 0;
    for (const u of p.uniforms) { const ch = animatedBy.get(p.id + "|" + u.name); if (ch) u.animated = ch; }
  }
  const glJson = {
    note: "static side of the GPU scene; animated values are channels in ../gl-track.json; shader sources in shaders/",
    renderer: d.contexts.find((c: any) => c.renderer)?.renderer ?? (d.gpu?.adapter ? `WebGPU ${[d.gpu.adapter.vendor, d.gpu.adapter.architecture, d.gpu.adapter.description].filter(Boolean).join(" ")}` : null),
    contexts: d.contexts, three: d.three, engines: d.engines && Object.keys(d.engines).length ? d.engines : undefined, workers: d.workers, frames: frames.length, drawCallsPerFrame: avgDraws, passes,
    programs: d.programs, textures: d.textures, buffers: d.buffers, framebuffers: d.framebuffers,
    webgpu: d.gpu && (d.gpu.modules.length || d.gpu.pipelines.length) ? d.gpu : undefined,
    canvas2d: Object.keys(logs).length ? Object.keys(logs).map((c) => `gl/canvas2d-${c}.txt`) : undefined,
    constants, errors: d.errors?.length ? d.errors : undefined,
  };
  writeJson(join(dir, "gl.json"), glJson);
  const sum = summarize(out);
  writeFileSync(join(dir, "summary.md"), sum + "\n");
  return { contexts: d.contexts.map((c: any) => `${c.id} ${c.type} ${c.canvas}`), programs: d.programs.length, drawCallsPerFrame: avgDraws, animatedChannels: keys.length, three: d.three?.revision ?? undefined, summary: join(dir, "summary.md") };
}

// ---------- summary ----------
export function summarize(dirIn: string): string {
  const dir = abs(dirIn);
  const g = readJson(join(dir, "gl", "gl.json"));
  const track = existsSync(join(dir, "gl-track.json")) ? readJson(join(dir, "gl-track.json")) : { channels: {} };
  const L: string[] = [];
  L.push(`# GPU trace: ${dir}`, "");
  L.push(`renderer: ${g.renderer ?? "?"} · ${g.frames} frames traced · ${g.drawCallsPerFrame} draw calls per frame`, "");
  L.push("## Canvases");
  for (const c of g.contexts) L.push(`- ${c.id} ${c.type} on ${c.canvas}: ${c.size ? c.size.join("×") : "?"} px${c.cssRect ? `, css ${c.cssRect[2]}×${c.cssRect[3]} at ${c.cssRect[0]},${c.cssRect[1]} (pixel ratio ${c.pixelRatio})` : ""}${c.attributes ? `, antialias ${c.attributes.antialias}, alpha ${c.attributes.alpha}, premultipliedAlpha ${c.attributes.premultipliedAlpha}, preserveDrawingBuffer ${c.attributes.preserveDrawingBuffer}` : ""}`);
  if (g.three) {
    L.push("", `## three.js r${g.three.revision ?? "?"}`);
    for (const r of g.three.renderers) L.push(`- ${r.kind} on ${r.canvas}: pixelRatio ${r.pixelRatio}, size ${r.size?.join("×")}, outputColorSpace ${r.outputColorSpace ?? r.outputEncoding}, toneMapping ${r.toneMapping} (exposure ${r.toneMappingExposure}), clear ${JSON.stringify(r.clearColor)} α${r.clearAlpha}, autoClear ${r.autoClear}`);
    for (const s of g.three.scenes) {
      L.push(`- scene ${s.index}${s.name ? ` "${s.name}"` : ""}: ${s.objects} objects${s.file ? `, full JSON in ${s.file} (THREE.ObjectLoader)` : ""}`);
      for (const o of s.tree.slice(0, 40)) {
        if (o.key === "scene") continue;
        const geo = o.geometry ? ` ${o.geometry.type}${o.geometry.parameters ? JSON.stringify(o.geometry.parameters) : ""} ${o.geometry.vertices ?? "?"} verts` : "";
        const mat = o.material ? " · " + o.material.map((m: any) => `${m.type}${m.name ? ` "${m.name}"` : ""}${m.transparent ? " transparent" : ""}${m.blending !== 1 && m.blending !== undefined ? ` blending=${m.blending}` : ""}${m.uniforms ? ` uniforms[${m.uniforms.join(",")}]` : ""}`).join(", ") : "";
        L.push(`  ${"  ".repeat(o.depth)}- ${o.key} ${o.type}${geo}${mat} pos ${JSON.stringify(o.position)} rot ${JSON.stringify(o.rotation)}${o.visible ? "" : " (hidden)"}`);
      }
      if (s.tree.length > 40) L.push(`  … ${s.tree.length - 40} more in gl/gl.json`);
    }
    for (const m of g.three.mixers ?? []) for (const act of m.actions) L.push(`- AnimationMixer on ${m.root}: clip "${act.clip}" ${act.duration?.toFixed?.(3)} s, ${act.tracks?.length} tracks (${act.tracks?.slice(0, 6).map((x: any) => `${x.name} ${x.keys} keys ${x.interpolation === 2300 ? "discrete" : x.interpolation === 2301 ? "linear" : x.interpolation === 2302 ? "smooth" : ""}`).join(", ")}…), ${act.running ? "running" : "stopped"}, timeScale ${act.timeScale}, loop ${act.loop === 2201 ? "repeat" : act.loop === 2200 ? "once" : act.loop === 2202 ? "pingpong" : act.loop}; keyframes in gl/gl.json › three.mixers`);
    if (g.three.loads?.length) L.push(`- loaded through three.js loaders: ${g.three.loads.map((x: any) => `${x.loader} ${x.url}`).join(", ")}`);
  }
  if (g.engines && Object.keys(g.engines).length) L.push("", "## Other engines", ...Object.entries<any>(g.engines).map(([k, v]) => `- ${k}: ${v.map((e: any) => `${e.kind}${e.version ? " v" + e.version : ""}`).join(", ")}; scene values are \`${k}:…\` channels`));
  L.push("", "## Programs (shaders in gl/shaders/)");
  for (const p of g.programs) {
    if (!p.draws) continue;
    L.push(`- **${p.key}**: ${p.drawsPerFrame}/frame, ${p.modes.join("/")} up to ${p.maxCount} verts${p.maxInstances ? ` × ${p.maxInstances} instances` : ""}, ${p.state}${p.files?.fs ? ` (${p.files.vs}, ${p.files.fs})` : ""}`);
    if (p.three?.length) L.push(`  - three.js: ${p.three.join("; ")}`);
    const anim = p.uniforms.filter((u: any) => u.animated).map((u: any) => u.name);
    const fixed = p.uniforms.filter((u: any) => !u.animated && u.value !== undefined && !/^(sampler|isampler|usampler)/.test(u.type ?? "") && (u.value?.length ?? 0) <= 4).map((u: any) => `${u.name}=${u.value.length === 1 ? u.value[0] : "[" + u.value.join(",") + "]"}`);
    if (anim.length) L.push(`  - animated: ${anim.join(", ")}`);
    if (fixed.length) L.push(`  - fixed: ${fixed.slice(0, 24).join(", ")}${fixed.length > 24 ? " …" : ""}`);
    if (p.layout?.length) L.push(`  - attributes: ${p.layout.map((x: any) => x.constant ? `${x.name}(constant)` : `${x.name} ${x.size}×${x.type} buf ${x.buffer}${x.divisor ? " per-instance" : ""}`).join(", ")}`);
  }
  const unused = g.programs.filter((p: any) => !p.draws).length;
  if (unused) L.push(`- (${unused} programs compiled but not drawn during the capture)`);
  if (g.passes?.length) {
    L.push("", "## One frame per canvas, in draw order (render target: draws)");
    for (const p of g.passes) L.push(`- ${p.target}: ${p.draws.map((x: any) => x.label + (x.times > 1 ? ` ×${x.times}` : "")).join("; ")}`);
  }
  const tex = g.textures.filter((t: any) => t.src && t.src.kind !== "empty" && t.src.kind !== "storage" && !(t.w === 1 && t.h === 1));
  if (tex.length) {
    L.push("", "## Textures with content");
    for (const t of tex.slice(0, 30)) L.push(`- ${t.id} ${t.w}×${t.h} ${t.src.kind}${t.src.url ? " " + t.src.url : ""}${t.src.file ? " → " + t.src.file : ""}${t.uploads > 1 ? ` (${t.uploads} uploads: updated while running)` : ""}`);
  }
  if (g.webgpu) L.push("", `## WebGPU`, `- ${g.webgpu.modules.length} shader modules (WGSL in gl/shaders/), ${g.webgpu.pipelines.length} pipelines`);
  if (g.canvas2d) L.push("", "## Canvas 2D", ...g.canvas2d.map((f: string) => `- call log of sampled frames: ${f}`));
  const ch = Object.entries<any>(track.channels);
  if (ch.length) {
    L.push("", `## Animated channels (${ch.length}; fit any of them with easing.ts --track gl-track.json --channel KEY)`);
    const order = ["transition", "there-and-back", "oscillation", "steps", "clock"];
    const shown = ch.sort((x, y) => order.indexOf(x[1].kind) - order.indexOf(y[1].kind) || (x[1].firstChangeMs ?? 0) - (y[1].firstChangeMs ?? 0));
    for (const [k, c] of shown.slice(0, 60)) L.push(`- ${k}: ${c.kind}${c.kind === "clock" ? ` (+${c.perSecond}/s)` : ""}${c.periodMs ? ` period ~${c.periodMs} ms` : ""}, ${c.min} → ${c.max}, changes ${c.firstChangeMs}–${c.lastChangeMs} ms`);
    if (shown.length > 60) L.push(`- … ${shown.length - 60} more: bun gl.ts channels ${dirIn}`);
  }
  if (g.errors?.length) L.push("", "## Tracer notes", ...g.errors.map((e: string) => `- ${e}`));
  return L.join("\n");
}

// ---------- compare ----------
function compareCaptures(refDir: string, cloneDir: string, map: Record<string, string>, timingLimit: number, grep: RegExp | null) {
  const R = readJson(join(refDir, "gl", "gl.json")), C = readJson(join(cloneDir, "gl", "gl.json"));
  const rt = readJson(join(refDir, "gl-track.json")), ct = readJson(join(cloneDir, "gl-track.json"));
  const L: string[] = [`# GPU compare: ${refDir} vs ${cloneDir}`, ""];
  // canvases matched by element (tag, id, classes), the probe canvases libraries make (300×150, not in the page) left out
  const ctx = (g: any) => g.contexts.filter((c: any) => /webgl|webgpu/.test(c.type) && c.cssRect && c.cssRect[2] > 0);
  const fmt = (c: any) => c ? `${c.type} ${c.size?.join("×")} px (ratio ${c.pixelRatio}), antialias ${c.attributes?.antialias}, alpha ${c.attributes?.alpha}, premultipliedAlpha ${c.attributes?.premultipliedAlpha}` : "—";
  L.push("## Canvases", "| canvas | reference | clone |", "|---|---|---|");
  const cc = ctx(C);
  for (const r of ctx(R)) {
    const c = cc.find((x: any) => x.canvas === r.canvas);
    L.push(`| ${r.canvas} | ${fmt(r)} | ${fmt(c)}${c && fmt(c) !== fmt(r) ? " **differs**" : ""} |`);
  }
  for (const c of cc) if (!ctx(R).some((r: any) => r.canvas === c.canvas)) L.push(`| ${c.canvas} | — | ${fmt(c)} |`);
  if (R.three || C.three) {
    const f = (g: any) => g.three ? g.three.renderers.map((r: any) => `${r.canvas}: r${g.three.revision} ${r.outputColorSpace ?? r.outputEncoding}, toneMapping ${r.toneMapping}, pixelRatio ${r.pixelRatio}, clear ${JSON.stringify(r.clearColor)} α${r.clearAlpha}`).join("<br>") : "—";
    L.push(`| three.js renderers | ${f(R)} | ${f(C)} |`);
  }
  // structure: drawn programs grouped by what they draw (primitive, vertex count, instances, blend/depth state)
  const sig = (g: any) => {
    const m = new Map<string, number>();
    for (const p of g.programs.filter((p: any) => p.draws)) {
      const k = `${p.modes.join("/")} ${p.maxCount}${p.maxInstances ? " ×" + p.maxInstances : ""} [${p.state}]`;
      m.set(k, +((m.get(k) ?? 0) + p.drawsPerFrame).toFixed(2));
    }
    return m;
  };
  const rs = sig(R), cs = sig(C);
  L.push("", "## Draw structure (draw calls per traced frame, by primitive · vertices · state)", "", "| draws | reference | clone |", "|---|---|---|");
  for (const k of [...new Set([...rs.keys(), ...cs.keys()])].sort()) L.push(`| ${k} | ${rs.get(k) ?? "—"} | ${cs.get(k) ?? "—"}${!rs.has(k) || !cs.has(k) ? " **only in one**" : ""} |`);
  L.push("", `draw calls per frame: ${R.drawCallsPerFrame} vs ${C.drawCallsPerFrame}. A different rate for the same draw usually means a different render cadence (every frame vs every other frame).`);

  // channels matched by uniform / property name (prefixes differ between builds), or by --map
  const tail = (k: string) => k.replace(/^(w\d+\.)?p\d+(:[\w-]+)?(#\d+)?\./, "").replace(/^(\w+):s\d+\//, "$1:").replace(/#\d+/g, "");
  const cIndex = new Map<string, string[]>();
  for (const k of Object.keys(ct.channels)) cIndex.set(tail(k), [...(cIndex.get(tail(k)) ?? []), k]);
  const series = (tr: any, k: string) => tr.samples.filter((s: any) => s.v[k] !== undefined).map((s: any) => [s.t, s.v[k]] as [number, number]);
  const at = (s: [number, number][], tm: number) => { let best = s[0]; for (const p of s) if (Math.abs(p[0] - tm) < Math.abs(best[0] - tm)) best = p; return best[1]; };
  const rows: string[] = [];
  let fails = 0;
  // several clone channels can share a name (every Group has a rotation.x): take the one that moves most alike
  const likeness = (r: any, c: any) => (c.kind === r.kind ? 0 : 1000) + Math.abs((c.firstChangeMs ?? 0) - (r.firstChangeMs ?? 0)) + Math.abs((c.lastChangeMs ?? 0) - (r.lastChangeMs ?? 0))
    + 1000 * (Math.abs(c.min - r.min) + Math.abs(c.max - r.max)) / Math.max(1e-9, Math.abs(r.max - r.min));
  const taken = new Set<string>();
  for (const [rk, r] of Object.entries<any>(rt.channels)) {
    if (r.kind === "clock" || (grep && !grep.test(rk))) continue;
    const wanted = map[tail(rk)] ?? tail(rk);
    const ck = (cIndex.get(wanted) ?? []).filter((k) => !taken.has(k)).sort((x, y) => likeness(r, ct.channels[x]) - likeness(r, ct.channels[y]))[0];
    if (ck) taken.add(ck);
    if (!ck) { rows.push(`| ${rk} | ${r.kind} ${r.min}→${r.max} ${r.firstChangeMs}–${r.lastChangeMs} ms | (no channel named ${wanted}) | | missing |`); fails++; continue; }
    const c = ct.channels[ck];
    const ds = r.firstChangeMs !== null && c.firstChangeMs !== null ? c.firstChangeMs - r.firstChangeMs : NaN;
    const de = r.lastChangeMs !== null && c.lastChangeMs !== null ? c.lastChangeMs - r.lastChangeMs : NaN;
    const span = Math.max(1e-9, r.max - r.min);
    const rsr = series(rt, rk), csr = series(ct, ck);
    const diffs = rsr.map(([tm, v]) => Math.abs(at(csr, tm) - v) / span);
    const mean = diffs.reduce((s, x) => s + x, 0) / Math.max(1, diffs.length);
    const ok = Math.abs(ds) <= timingLimit && Math.abs(de) <= timingLimit && mean <= 0.05 && c.kind === r.kind;
    if (!ok) fails++;
    rows.push(`| ${rk} | ${r.kind} ${r.min}→${r.max} ${r.firstChangeMs}–${r.lastChangeMs} ms | ${ck}: ${c.kind} ${c.min}→${c.max} ${c.firstChangeMs}–${c.lastChangeMs} ms | start ${ds >= 0 ? "+" : ""}${ds} ms, end ${de >= 0 ? "+" : ""}${de} ms, mean |Δ| ${(mean * 100).toFixed(1)} % of range | ${ok ? "pass" : "FAIL"} |`);
  }
  L.push("", `## Animated channels (${rows.length} in the reference; uniform time "clock" channels are skipped)`, "", "| reference | | clone | timing and value error | result |", "|---|---|---|---|---|", ...rows);
  L.push("", `pass: start/end within ${timingLimit} ms, same kind, mean value error ≤ 5 % of the reference range. ${fails} of ${rows.length} failing.`);
  return { md: L.join("\n"), fails };
}

if (import.meta.main) {
  const HELP = `
gl.ts — read a GPU trace written by capture.ts --gl.

  bun gl.ts summary <capture dir>                        canvases, three.js scene, programs, passes, textures, animated channels
  bun gl.ts channels <capture dir> [--grep RE] [--series KEY]   list channels (kind, range, change window) or print one as [[t, v], …]
  bun gl.ts compare --ref <dir> --clone <dir> [--grep RE] [--map "uHover=u_hover,…"] [--timing 80] [--out report.md]
                                                         canvas settings, draw structure and every animated channel, ref vs clone
`;
  const a = parseArgs(process.argv.slice(2));
  const cmd = a._[0];
  if (a.help || !cmd) usage(HELP);
  if (cmd === "summary") {
    const dir = String(a._[1] ?? a.in ?? "");
    if (!existsSync(join(dir, "gl", "gl.json"))) throw new Error(`no gl/gl.json in ${dir}: capture with --gl first`);
    console.log(summarize(dir));
  } else if (cmd === "channels") {
    const dir = String(a._[1] ?? a.in ?? "");
    const tr = readJson(join(dir, "gl-track.json"));
    if (a.series) {
      const k = String(a.series);
      const keys = Object.keys(tr.channels).filter((x) => x === k || x.endsWith("." + k) || x.endsWith(k));
      if (keys.length !== 1) throw new Error(keys.length ? `ambiguous: ${keys.join(", ")}` : `no channel ${k}`);
      console.log(JSON.stringify(tr.samples.filter((s: any) => s.v[keys[0]] !== undefined).map((s: any) => [s.t, s.v[keys[0]]])));
    } else {
      const re = a.grep ? new RegExp(String(a.grep), "i") : null;
      for (const [k, c] of Object.entries<any>(tr.channels)) if (!re || re.test(k)) console.log(`${k}\t${c.kind}\t${c.min} → ${c.max}\t${c.firstChangeMs}–${c.lastChangeMs} ms${c.perSecond ? `\t+${c.perSecond}/s` : ""}${c.periodMs ? `\tperiod ${c.periodMs} ms` : ""}`);
    }
  } else if (cmd === "compare") {
    if (!a.ref || !a.clone) usage(HELP);
    const map: Record<string, string> = {};
    for (const pair of String(a.map ?? "").split(",").filter(Boolean)) { const [x, y] = pair.split("="); map[x.trim()] = y.trim(); }
    const { md, fails } = compareCaptures(abs(String(a.ref)), abs(String(a.clone)), map, num(a.timing, 80), a.grep ? new RegExp(String(a.grep)) : null);
    if (a.out) writeFileSync(abs(String(a.out)), md + "\n");
    console.log(md);
    process.exitCode = fails ? 1 : 0;
  } else usage(HELP);
}
