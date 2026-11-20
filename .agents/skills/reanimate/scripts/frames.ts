// Turn a video or gif (reference recording, screen capture, exported prototype) into numbered PNG frames.
// Usage: bun frames.ts --in <file> --out <dir> [--fps 10] [--start 0:03] [--end 0:08] [--crop x,y,w,h] [--width 800]
import { join } from "node:path";
import { readdirSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { abs, ensureDir, ffmpeg, ffmpegPath, num, parseArgs, parseRect, parseTime, usage, writeJson } from "./lib.ts";

const HELP = `
frames.ts — extract frames from a video or gif.

  bun frames.ts --in <file.mp4|.mov|.webm|.gif> --out <dir> [options]

  --fps N          frames per second to keep, default 10 (use 25-30 for fast motion, 5 for long slow sequences)
  --start T        start time: "0:03", "3.5", "1500ms". default 0
  --end T          end time (same formats). default: end of file
  --crop x,y,w,h   crop in source pixels (find values on a full frame first)
  --width W        downscale frames to this width (keeps aspect). default: source size
  --probe          only print the source's duration, size and fps, extract nothing

Writes <out>/NNNN.png and <out>/frames.json (fps, count, start, source size).
Frame i is at reference time start + i/fps.
`;

const a = parseArgs(process.argv.slice(2));
if (a.help || !a.in || (!a.out && !a.probe)) usage(HELP);

const input = abs(String(a.in));
// probe with ffmpeg itself (no ffprobe in ffmpeg-static)
const probe = spawnSync(ffmpegPath(), ["-hide_banner", "-i", input], { encoding: "utf8" }).stderr;
const dur = probe.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
const durationS = dur ? Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3]) : undefined;
const vid = probe.match(/Video:.*?(\d{2,5})x(\d{2,5})/);
const srcFps = probe.match(/([\d.]+) fps/);
const info = { input, durationS, width: vid ? Number(vid[1]) : undefined, height: vid ? Number(vid[2]) : undefined, sourceFps: srcFps ? Number(srcFps[1]) : undefined };
if (a.probe) { console.log(JSON.stringify(info, null, 2)); process.exit(0); }

const out = ensureDir(abs(String(a.out)));
for (const f of readdirSync(out)) if (f.endsWith(".png")) unlinkSync(join(out, f));
const fps = num(a.fps, 10);
const start = parseTime(a.start) ?? 0;
const end = parseTime(a.end);
const crop = parseRect(a.crop);
const width = a.width ? num(a.width, 0) : 0;

const vf = [`fps=${fps}`];
if (crop) vf.push(`crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`);
if (width) vf.push(`scale=${width}:-2`);
const args = ["-y", "-ss", String(start), "-i", input];
if (end !== undefined) args.push("-t", String(end - start));
args.push("-vf", vf.join(","), "-vsync", "0", join(out, "%04d.png"));
ffmpeg(args, { quiet: true });

const count = readdirSync(out).filter((f) => f.endsWith(".png")).length;
const meta = { ...info, fps, count, start, end, crop, outWidth: width || undefined, note: "frame i (1-based file name) is at t = start + (i-1)/fps seconds of the source" };
writeJson(join(out, "frames.json"), meta);
console.log(JSON.stringify(meta, null, 2));
