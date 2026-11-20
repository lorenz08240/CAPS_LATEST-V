// Lay frames out on labelled contact sheets so a whole motion can be read in one image.
// Two modes:
//   filmstrip: one directory of frames → sheet-NN.png with the timestamp under each frame
//   compare:   reference frames vs clone frames (and diffs from compare.ts) side by side, one row per frame
// Rendered with Chromium (HTML + screenshot), so labels work without ffmpeg drawtext.
import { chromium } from "playwright";
import { join, basename } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { abs, ensureDir, listFrames, num, pad, parseArgs, readJson, usage } from "./lib.ts";

const HELP = `
sheet.ts — labelled contact sheets.

  bun sheet.ts filmstrip --frames <dir> --out <dir> [--fps N] [--cols 6] [--per-sheet 24] [--width 240] [--every K] [--from I --to J]
  bun sheet.ts compare   --ref <dir> --clone <dir> --out <dir> [--diff <dir>] [--fps N] [--per-sheet 8] [--width 420] [--every K] [--offset K]

  --fps        used for the time labels (default: fps from frames.json next to the frames, else 25)
  --every K    show every K-th frame (default 1)
  --from/--to  frame index range (0-based, inclusive)
  --offset K   compare: clone frame = ref frame + K (take it from compare.ts report.json alignment)

Writes <out>/sheet-01.png, sheet-02.png … and prints their paths. Read them with the image viewer.
`;

const a = parseArgs(process.argv.slice(2));
const mode = a._[0];
if (a.help || !mode || !a.out) usage(HELP);
const out = ensureDir(abs(String(a.out)));

// frames.ts writes frames.json beside the frames, capture.ts one level up
function fpsOf(dir: string, fallback: number) {
  for (const j of [join(dir, "frames.json"), join(dir, "..", "frames.json")]) {
    if (existsSync(j)) { const m = readJson(j); if (m.fps) return Number(m.fps); }
  }
  return fallback;
}
const label = (i: number, fps: number) => `#${i}  ${(i / fps).toFixed(2)}s`;
// data URIs: a page built with setContent has no file:// access
const fileUrl = (p: string) => "data:image/png;base64," + readFileSync(p).toString("base64");

type Sheet = { html: string; name: string };
const sheets: Sheet[] = [];
const css = `body{margin:0;background:#111;color:#ddd;font:12px/1.3 ui-monospace,Menlo,monospace;padding:10px}
.grid{display:grid;gap:10px}.cell{display:flex;flex-direction:column;gap:3px;align-items:center}
.cell img{display:block;background:#000;outline:1px solid #333}.cap{color:#9ad}.hdr{margin:0 0 8px;color:#fff;font-weight:600}
.row{display:grid;gap:8px;align-items:start;margin-bottom:10px}.row img{display:block;background:#000;outline:1px solid #333}
.colhdr{display:grid;gap:8px;color:#9ad;margin-bottom:4px}`;

if (mode === "filmstrip") {
  if (!a.frames) usage(HELP);
  const dir = abs(String(a.frames));
  const fps = num(a.fps, fpsOf(dir, 25));
  const every = num(a.every, 1), cols = num(a.cols, 6), per = num(a["per-sheet"], 24), width = num(a.width, 240);
  let frames = listFrames(dir).map((p, i) => ({ p, i }));
  const from = num(a.from, 0), to = num(a.to, frames.length - 1);
  frames = frames.filter((f) => f.i >= from && f.i <= to && (f.i - from) % every === 0);
  for (let s = 0; s * per < frames.length; s++) {
    const chunk = frames.slice(s * per, (s + 1) * per);
    const cells = chunk.map((f) => `<div class="cell"><img src="${fileUrl(f.p)}" style="width:${width}px"><div class="cap">${label(f.i, fps)}</div></div>`).join("");
    sheets.push({ name: `sheet-${String(s + 1).padStart(2, "0")}.png`, html: `<style>${css}</style><p class="hdr">${basename(dir)} · frames ${chunk[0].i}–${chunk[chunk.length - 1].i} · ${fps} fps</p><div class="grid" style="grid-template-columns:repeat(${cols},max-content)">${cells}</div>` });
  }
} else if (mode === "compare") {
  if (!a.ref || !a.clone) usage(HELP);
  const refDir = abs(String(a.ref)), cloneDir = abs(String(a.clone));
  const diffDir = a.diff ? abs(String(a.diff)) : undefined;
  const fps = num(a.fps, fpsOf(refDir, 25));
  const every = num(a.every, 1), per = num(a["per-sheet"], 8), width = num(a.width, 420), offset = num(a.offset, 0);
  const ref = listFrames(refDir), clone = listFrames(cloneDir);
  const hasDiffs = !!diffDir && listFrames(diffDir).length > 0;
  let report: any = null;
  if (diffDir && existsSync(join(diffDir, "..", "report.json"))) report = readJson(join(diffDir, "..", "report.json"));
  const n = Math.min(ref.length, clone.length - Math.max(0, offset));
  const idx: number[] = [];
  const from = num(a.from, Math.max(0, -offset)), to = num(a.to, n - 1);
  for (let i = from; i <= to && i < n; i += every) idx.push(i);
  const ncol = hasDiffs ? 3 : 2;
  for (let s = 0; s * per < idx.length; s++) {
    const chunk = idx.slice(s * per, (s + 1) * per);
    const rows = chunk.map((i) => {
      const c = clone[i + offset];
      // compare.ts names each diff after its reference frame and skips frames without a clone frame
      const d = hasDiffs ? join(diffDir!, `${pad(i)}.png`) : undefined;
      const mm = report?.frameDetails?.[i]?.mismatch ?? undefined;
      const cap = `${label(i, fps)}${mm !== undefined ? ` · mismatch ${(mm * 100).toFixed(1)}%` : ""}`;
      return `<div class="cap">${cap}</div><div class="row" style="grid-template-columns:repeat(${ncol},${width}px)"><img src="${fileUrl(ref[i])}" style="width:${width}px"><img src="${c ? fileUrl(c) : ""}" style="width:${width}px">${d && existsSync(d) ? `<img src="${fileUrl(d)}" style="width:${width}px">` : ""}</div>`;
    }).join("");
    sheets.push({ name: `compare-${String(s + 1).padStart(2, "0")}.png`, html: `<style>${css}</style><p class="hdr">reference vs clone${hasDiffs ? " vs diff" : ""} · ${fps} fps · clone offset ${offset}</p><div class="colhdr" style="grid-template-columns:repeat(${ncol},${width}px)"><div>reference</div><div>clone</div>${hasDiffs ? "<div>diff (red = differs)</div>" : ""}</div>${rows}` });
  }
} else usage(HELP);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const paths: string[] = [];
for (const s of sheets) {
  await page.setContent(s.html, { waitUntil: "load" });
  const p = join(out, s.name);
  await page.screenshot({ path: p, fullPage: true });
  paths.push(p);
}
await browser.close();
console.log(paths.join("\n") || "no frames selected");
