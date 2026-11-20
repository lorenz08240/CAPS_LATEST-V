// After render.ts: the web copy of the video for the site (public/demo.mp4, served at /demo.mp4) and the
// README's preview (../.github/assets/demo.webp), a few moments of the video cross-faded into a loop.
//
//   bun video/scripts/publish.ts
//
// Needs ffmpeg, cwebp and webpmux on PATH.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SITE } from "./serve";

const SRC = join(SITE, "video", "out", "reanimate-demo.mp4");
const WEB = join(SITE, "public", "demo.mp4");
const README = join(SITE, "..", ".github", "assets", "demo.webp");

// [from, to] in seconds of the video: the title and the prompts, the first clones, the camera pulling back
// from the cube into the helix, recording the three originals, and the install card turning to ink
const MOMENTS = [[0.3, 5.9], [6.1, 9.6], [15.4, 21.0], [24.0, 26.4], [41.0, 45.0]];
const FADE = 0.3;
const WIDTH = 760; // as wide as the README shows it
const FPS = 15;

function run(cmd: string, argv: string[]) {
  const r = spawnSync(cmd, argv, { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr?.toString().slice(-2000)}`);
}
const mb = (file: string) => `${(statSync(file).size / 1e6).toFixed(1)} MB`;

// the site's copy: smaller, starts playing before it has all downloaded (Workers serve files up to 25 MiB)
run("ffmpeg", [
  "-v", "error", "-y", "-i", SRC,
  "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-tune", "animation", "-pix_fmt", "yuv420p",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  "-an", "-movflags", "+faststart", WEB,
]);
console.log(`wrote ${WEB} (${mb(WEB)})`);

// the preview: each moment cross-fades into the next, then frames are encoded one by one and muxed (the
// way scripts/record-media.ts makes the README's other animations)
const dir = mkdtempSync(join(tmpdir(), "publish-"));
const argv = ["-v", "error", "-y"];
for (const [a, b] of MOMENTS) argv.push("-ss", String(a), "-t", String(b - a), "-i", SRC);
const graph = MOMENTS.map((_, i) => `[${i}:v]fps=${FPS},scale=${WIDTH}:-2:flags=lanczos,settb=AVTB[v${i}]`);
let last = "v0";
let length = MOMENTS[0][1] - MOMENTS[0][0];
for (let i = 1; i < MOMENTS.length; i++) {
  graph.push(`[${last}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${(length - FADE).toFixed(3)}[x${i}]`);
  last = `x${i}`;
  length += MOMENTS[i][1] - MOMENTS[i][0] - FADE;
}
run("ffmpeg", [...argv, "-filter_complex", graph.join(";"), "-map", `[${last}]`, join(dir, "%04d.png")]);
const pngs = readdirSync(dir).sort().map((f) => join(dir, f));
run("sh", ["-c", `ls "${dir}"/*.png | xargs -P 8 -I{} cwebp -quiet -q 70 -m 6 -sharp_yuv {} -o {}.webp`]);
run("webpmux", [...pngs.flatMap((f) => ["-frame", `${f}.webp`, `+${Math.round(1000 / FPS)}+0+0+0-b`]), "-loop", "0", "-o", README]);
rmSync(dir, { recursive: true });
console.log(`wrote ${README} (${mb(README)}, ${length.toFixed(1)} s)`);
