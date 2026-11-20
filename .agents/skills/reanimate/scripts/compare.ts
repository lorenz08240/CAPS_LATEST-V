// Compare the clone's frames against the reference's, frame by frame.
// Produces per-frame mismatch (pixel diff), an "activity curve" (how much changes between consecutive
// frames, which captures timing and easing regardless of colours or copy), diff images, and a report.
// Usage: bun compare.ts --ref <frames dir> --clone <frames dir> --out <dir> [--auto-align] [--threshold 0.05]
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from "node:fs";
import { abs, ensureDir, ffmpeg, listFrames, num, parseArgs, parseRect, readJson, usage, writeJson, pad } from "./lib.ts";

const HELP = `
compare.ts — frame-by-frame comparison of clone vs reference.

  bun compare.ts --ref <dir> --clone <dir> --out <dir> [options]

  --auto-align        find the clone frame offset (±--max-shift) that best matches the reference start, default on
  --offset K          fixed offset instead (clone frame = ref frame + K)
  --max-shift N       search range for auto-align, default 15 frames
  --region x,y,w,h    only compare this region (in reference pixel coordinates)
  --pixel-threshold T pixelmatch colour sensitivity 0..1, default 0.1 (raise to ignore anti-aliasing/noise)
  --threshold T       pass if mean mismatch ≤ T (fraction of pixels), default 0.05; use 0.01-0.02 for pixel fidelity
  --motion-threshold T pass if activity-curve timing error ≤ T seconds, default 0.08
  --fps N             frames per second (default: frames.json beside --ref or next to it, else 25)
  --blur R            box-blur both sets by R px before comparing: particles, noise and grain that are placed
                      differently but have the same density, colour and motion stop counting as mismatch
                      (try 4-8). Reports both the sharp and the blurred mismatch.
  --no-diffs          skip writing diff PNGs

Output in <out>/: report.json, report.md, diff/NNNN.png (red = differing pixels)
Both frame sets must share fps and be clipped to the same region; the clone is rescaled to the reference size if needed.
`;

const a = parseArgs(process.argv.slice(2));
if (a.help || !a.ref || !a.clone || !a.out) usage(HELP);
const refDir = abs(String(a.ref)), cloneDir = abs(String(a.clone)), out = ensureDir(abs(String(a.out)));
// frames.ts writes frames.json beside the frames, capture.ts one level up
const framesJson = [join(refDir, "frames.json"), join(refDir, "..", "frames.json")].find((p) => existsSync(p));
const fps = num(a.fps, framesJson ? Number(readJson(framesJson).fps) || 25 : 25);
const pixelThreshold = num(a["pixel-threshold"], 0.1);
const threshold = num(a.threshold, 0.05);
const motionThreshold = num(a["motion-threshold"], 0.08);
const region = parseRect(a.region);
const wantDiffs = !a["no-diffs"];

const blurR = num(a.blur, 0);

// Captures made with different settings measure the setup, not the clone. capture.json sits next to frames/.
const capOf = (dir: string) => { const p = join(dir, "..", "capture.json"); return existsSync(p) ? readJson(p) : null; };
const capRef = capOf(refDir), capClone = capOf(cloneDir);
const setupWarnings: string[] = [];
if (capRef && capClone) {
  const same = (k: string, f = (c: any) => JSON.stringify(c[k] ?? null)) => { if (f(capRef) !== f(capClone)) setupWarnings.push(`${k}: reference ${f(capRef)}, clone ${f(capClone)}`); };
  for (const k of ["viewport", "scale", "fps", "trigger", "duration", "preRoll", "clock", "seed", "gpu", "rafHz", "rate"]) same(k);
  if (capRef.renderer && capClone.renderer && capRef.renderer !== capClone.renderer) setupWarnings.push(`renderer: reference "${capRef.renderer}", clone "${capClone.renderer}"`);
  for (const w of setupWarnings) console.error(`warning: captures differ in ${w}`);
}

const refFiles = listFrames(refDir);
let cloneFiles = listFrames(cloneDir);
if (!refFiles.length || !cloneFiles.length) throw new Error("no frames found");

const readPng = (p: string) => PNG.sync.read(readFileSync(p));
const ref0 = readPng(refFiles[0]);
const c0 = readPng(cloneFiles[0]);
// rescale the clone set once if sizes differ (keeps the comparison honest, but prefer capturing at the same size)
if (c0.width !== ref0.width || c0.height !== ref0.height) {
  const scaled = ensureDir(join(out, ".clone-scaled"));
  for (const f of readdirSync(scaled)) unlinkSync(join(scaled, f));
  console.error(`clone frames are ${c0.width}x${c0.height}, reference ${ref0.width}x${ref0.height}: rescaling clone`);
  cloneFiles.forEach((p, i) => ffmpeg(["-y", "-i", p, "-vf", `scale=${ref0.width}:${ref0.height}:flags=lanczos`, join(scaled, `${pad(i)}.png`)], { quiet: true }));
  cloneFiles = listFrames(scaled);
}
const W = ref0.width, H = ref0.height;

function crop(img: PNG): PNG {
  if (!region) return img;
  const o = new PNG({ width: region.width, height: region.height });
  PNG.bitblt(img, o, region.x, region.y, region.width, region.height, 0, 0);
  return o;
}
// separable box blur, two passes ≈ gaussian; RGBA in place
function blur(img: PNG, r: number): PNG {
  if (r <= 0) return img;
  const { width: w, height: h } = img;
  const src = new Float32Array(img.data), tmp = new Float32Array(src.length);
  const pass = (from: Float32Array, to: Float32Array, horizontal: boolean) => {
    const n = horizontal ? w : h, m = horizontal ? h : w;
    for (let j = 0; j < m; j++) for (let c = 0; c < 4; c++) {
      let acc = 0, cnt = 0;
      const idx = (i: number) => ((horizontal ? j * w + i : i * w + j) << 2) + c;
      for (let i = 0; i <= Math.min(r, n - 1); i++) { acc += from[idx(i)]; cnt++; }
      for (let i = 0; i < n; i++) {
        to[idx(i)] = acc / cnt;
        const add = i + r + 1, rem = i - r;
        if (add < n) { acc += from[idx(add)]; cnt++; }
        if (rem >= 0) { acc -= from[idx(rem)]; cnt--; }
      }
    }
  };
  pass(src, tmp, true); pass(tmp, src, false);
  pass(src, tmp, true); pass(tmp, src, false);
  const o = new PNG({ width: w, height: h });
  for (let i = 0; i < src.length; i++) o.data[i] = Math.round(src[i]);
  return o;
}
function mismatch(aP: PNG, bP: PNG, diff?: PNG): number {
  const n = pixelmatch(aP.data, bP.data, diff?.data, aP.width, aP.height, { threshold: pixelThreshold, includeAA: false });
  return n / (aP.width * aP.height);
}

// cache decoded + cropped frames (frames are small after clipping; fine for a few hundred)
const refSharp = refFiles.map((p) => crop(readPng(p)));
const cloneSharp = cloneFiles.map((p) => crop(readPng(p)));
const refImgs = blurR ? refSharp.map((p) => blur(p, blurR)) : refSharp;
const cloneImgs = blurR ? cloneSharp.map((p) => blur(p, blurR)) : cloneSharp;

// ---- activity curve: change between consecutive frames, per set ----
function activity(imgs: PNG[]): number[] {
  const out: number[] = [0];
  for (let i = 1; i < imgs.length; i++) out.push(mismatch(imgs[i - 1], imgs[i]));
  return out;
}
const refAct = activity(refSharp), cloneAct = activity(cloneSharp); // timing reads sharp frames, even with --blur
function motionWindow(act: number[], floor = 0.002) {
  // first and last frame where something visibly changes
  let first = -1, last = -1;
  act.forEach((v, i) => { if (v > floor) { if (first < 0) first = i; last = i; } });
  const peak = act.indexOf(Math.max(...act));
  return { first, last, peak, durationS: first < 0 ? 0 : (last - first + 1) / fps };
}

// ---- alignment ----
let offset = a.offset !== undefined ? num(a.offset, 0) : 0;
if (a.offset === undefined && !(a["auto-align"] === "false")) {
  const maxShift = num(a["max-shift"], 15);
  const probeN = Math.min(10, refImgs.length);
  let best = Infinity;
  for (let k = -maxShift; k <= maxShift; k++) {
    let sum = 0, n = 0;
    for (let i = 0; i < probeN; i++) { const j = i + k; if (j < 0 || j >= cloneImgs.length) continue; sum += mismatch(refImgs[i], cloneImgs[j]); n++; }
    if (n >= Math.min(5, probeN) && sum / n < best) { best = sum / n; offset = k; }
  }
}

// ---- per-frame mismatch + diffs ----
const diffDir = wantDiffs ? ensureDir(join(out, "diff")) : undefined;
if (diffDir) for (const f of readdirSync(diffDir)) if (f.endsWith(".png")) unlinkSync(join(diffDir, f));
const frames: { i: number; t: number; cloneIndex: number | null; mismatch: number | null }[] = [];
for (let i = 0; i < refImgs.length; i++) {
  const j = i + offset;
  if (j < 0 || j >= cloneImgs.length) { frames.push({ i, t: +(i / fps).toFixed(3), cloneIndex: null, mismatch: null }); continue; }
  const diff = diffDir ? new PNG({ width: refImgs[i].width, height: refImgs[i].height }) : undefined;
  const m = mismatch(refImgs[i], cloneImgs[j], diff);
  if (diff && diffDir) writeFileSync(join(diffDir, `${pad(i)}.png`), PNG.sync.write(diff));
  frames.push({ i, t: +(i / fps).toFixed(3), cloneIndex: j, mismatch: +m.toFixed(4), ...(blurR ? { sharpMismatch: +mismatch(refSharp[i], cloneSharp[j]).toFixed(4) } : {}) });
}
const compared = frames.filter((f) => f.mismatch !== null) as { i: number; t: number; mismatch: number; sharpMismatch?: number }[];
const sharpMean = blurR ? compared.reduce((s, f) => s + (f.sharpMismatch ?? 0), 0) / Math.max(1, compared.length) : null;
const mean = compared.reduce((s, f) => s + f.mismatch, 0) / Math.max(1, compared.length);
const worst = [...compared].sort((x, y) => y.mismatch - x.mismatch).slice(0, 5);
const refWin = motionWindow(refAct), cloneWin = motionWindow(cloneAct.slice(Math.max(0, offset)));
const timingError = {
  startS: +((cloneWin.first - refWin.first) / fps).toFixed(3),
  endS: +((cloneWin.last - refWin.last) / fps).toFixed(3),
  peakS: +((cloneWin.peak - refWin.peak) / fps).toFixed(3),
  durationS: +(cloneWin.durationS - refWin.durationS).toFixed(3),
};
const maxTimingErr = Math.max(Math.abs(timingError.startS), Math.abs(timingError.endS), Math.abs(timingError.durationS));
const pass = { pixels: mean <= threshold, timing: maxTimingErr <= motionThreshold };

const report = {
  fps, size: [W, H], region, offset, threshold, motionThreshold, pixelThreshold, blur: blurR || undefined, sharpMeanMismatch: sharpMean === null ? undefined : +sharpMean.toFixed(4), setupWarnings,
  frames: frames.length, compared: compared.length,
  meanMismatch: +mean.toFixed(4), maxMismatch: worst[0]?.mismatch ?? 0, worstFrames: worst,
  motion: { reference: refWin, clone: cloneWin, timingError },
  activity: { reference: refAct.map((v) => +v.toFixed(4)), clone: cloneAct.map((v) => +v.toFixed(4)) },
  pass,
  frameDetails: frames,
};
writeJson(join(out, "report.json"), report);

const bar = (v: number) => "█".repeat(Math.min(40, Math.round(v * 400))) || "·";
const md = [
  `# compare: ${refDir} vs ${cloneDir}`,
  ``,
  `- frames compared: ${compared.length}/${frames.length} at ${fps} fps, clone offset ${offset}`,
  ...setupWarnings.map((w) => `- **warning, captures differ in ${w}**: re-capture with the same settings before reading the numbers`),
  `- mean mismatch${blurR ? ` (blurred ${blurR} px)` : ""}: **${(mean * 100).toFixed(2)}%** (threshold ${(threshold * 100).toFixed(1)}%) → ${pass.pixels ? "PASS" : "FAIL"}${sharpMean !== null ? `; sharp: ${(sharpMean * 100).toFixed(2)}%` : ""}`,
  `- motion window — reference: frames ${refWin.first}–${refWin.last} (${refWin.durationS.toFixed(2)}s, peak #${refWin.peak}); clone: ${cloneWin.first}–${cloneWin.last} (${cloneWin.durationS.toFixed(2)}s, peak #${cloneWin.peak})`,
  `- timing error (clone − ref): start ${timingError.startS}s, end ${timingError.endS}s, duration ${timingError.durationS}s, peak ${timingError.peakS}s → ${pass.timing ? "PASS" : "FAIL"} (limit ${motionThreshold}s)`,
  `- worst frames: ${worst.map((w) => `#${w.i} (${(w.mismatch * 100).toFixed(1)}% @ ${w.t}s)`).join(", ")}`,
  ``,
  `## activity per frame (how much changed since the previous frame)`,
  ``,
  "```",
  `frame   t(s)   reference                                 clone`,
  ...frames.map((f) => `${String(f.i).padStart(5)} ${f.t.toFixed(2).padStart(6)}   ${bar(refAct[f.i]).padEnd(40)}  ${f.cloneIndex === null ? "" : bar(cloneAct[f.cloneIndex])}`),
  "```",
  ``,
  `Diff images: ${diffDir ?? "(skipped)"} — red pixels differ. Build labelled sheets with sheet.ts compare.`,
].join("\n");
writeFileSync(join(out, "report.md"), md + "\n");
console.log(md);
