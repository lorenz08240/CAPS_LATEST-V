// Renders the demo video: every frame of video/index.html?render is drawn from its time alone, screenshotted
// in headless Chromium and piped to ffmpeg, in parallel slices, then joined. There's no sound.
//
//   bun video/scripts/render.ts                       # video/out/reanimate-demo.mp4, 1920x1080, 60 fps
//   bun video/scripts/render.ts --scale 2             # drawn at 3840x2160 (sharper), written at --size
//   bun video/scripts/render.ts --stills 1.5,12.9     # just those moments, as PNGs in video/out/stills/
//   bun video/scripts/render.ts --from 12 --to 20     # a section, without the full-length join
//   bun video/scripts/render.ts --page vercel.html    # another video page: video/out/vercel.mp4
//
// Needs the clips (bun video/scripts/clips.ts), ffmpeg on PATH and Playwright's Chromium.
import { chromium, type Browser, type CDPSession, type Page } from "playwright";
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { SITE, serve } from "./serve";

// what video/src/main.js puts on the page
type Video = { duration: number; fps: number; seek(t: number): Promise<void> };

const { values: args } = parseArgs({
  options: {
    scale: { type: "string", default: "1" },
    size: { type: "string", default: "1920x1080" },
    jobs: { type: "string", default: "6" },
    from: { type: "string" },
    to: { type: "string" },
    stills: { type: "string" },
    out: { type: "string" },
    crf: { type: "string", default: "14" },
    port: { type: "string", default: "4702" },
    page: { type: "string", default: "index.html" },
  },
});

const OUT = join(SITE, "video", "out");
const SCALE = Number(args.scale);
const [OW, OH] = args.size!.split("x").map(Number);
mkdirSync(OUT, { recursive: true });

const PORT = Number(args.port);
const server = await serve(PORT);
const url = `http://localhost:${PORT}/video/${args.page}?render`;
const NAME = args.page === "index.html" ? "reanimate-demo" : args.page!.replace(/\.html$/, "");
const stop = () => (server.closeAllConnections(), server.close());

async function open(browser: Browser): Promise<{ page: Page; cdp: CDPSession; info: { duration: number; fps: number } }> {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: SCALE });
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => (window as unknown as { __video?: Video }).__video, null, { timeout: 60_000 });
  const info = await page.evaluate(() => {
    const v = (window as unknown as { __video: Video }).__video;
    return { duration: v.duration, fps: v.fps };
  });
  return { page, cdp: await page.context().newCDPSession(page), info };
}

async function shoot(page: Page, cdp: CDPSession, t: number): Promise<Buffer> {
  await page.evaluate((t) => (window as unknown as { __video: Video }).__video.seek(t), t);
  // CDP screenshots come out in CSS px unless the clip asks for the device scale
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true, fromSurface: true, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: SCALE } });
  return Buffer.from(data, "base64");
}

const launch = () => chromium.launch({ args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=metal", "--disable-renderer-backgrounding", "--disable-background-timer-throttling", "--font-render-hinting=none"] });

if (args.stills) {
  const browser = await launch();
  const { page, cdp } = await open(browser);
  const dir = join(OUT, "stills");
  mkdirSync(dir, { recursive: true });
  for (const s of args.stills.split(",")) {
    const t = Number(s);
    writeFileSync(join(dir, `${t.toFixed(2).padStart(6, "0")}.png`), await shoot(page, cdp, t));
  }
  console.log(`stills in ${dir}`);
  await browser.close();
  stop();
  process.exit(0);
}

const probe = await launch();
const { info } = await open(probe);
await probe.close();
const total = Math.round(info.duration * info.fps);
const first = args.from ? Math.round(Number(args.from) * info.fps) : 0;
const last = args.to ? Math.min(total, Math.round(Number(args.to) * info.fps)) : total;
const jobs = Math.max(1, Number(args.jobs));
const per = Math.ceil((last - first) / jobs);
const parts = join(OUT, "parts");
rmSync(parts, { recursive: true, force: true });
mkdirSync(parts, { recursive: true });

// RGB → BT.709 YUV, tagged as such, so whites stay white and colours don't shift in players.
const encode = (file: string) => [
  "-v", "error", "-y", "-f", "image2pipe", "-framerate", String(info.fps), "-i", "-",
  "-vf", `scale=${OW}:${OH}:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p`,
  "-c:v", "libx264", "-preset", "slow", "-crf", args.crf!, "-tune", "animation",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  file,
];

const started = Date.now();
let done = 0;
const files: string[] = [];
await Promise.all(
  Array.from({ length: jobs }, async (_, j) => {
    const a = first + j * per;
    const b = Math.min(last, a + per);
    if (a >= b) return;
    const file = join(parts, `${String(j).padStart(2, "0")}.mp4`);
    files[j] = file;
    const browser = await launch();
    const { page, cdp } = await open(browser);
    const ff = spawn("ffmpeg", encode(file), { stdio: ["pipe", "inherit", "inherit"] });
    const closed = new Promise<void>((res, rej) => ff.on("exit", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
    for (let k = a; k < b; k++) {
      const png = await shoot(page, cdp, k / info.fps);
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
      if (++done % 120 === 0) {
        const s = (Date.now() - started) / 1000;
        console.log(`${done}/${last - first} frames, ${s.toFixed(0)} s, ~${((s / done) * (last - first - done)).toFixed(0)} s left`);
      }
    }
    ff.stdin.end();
    await closed;
    await browser.close();
  }),
);
stop();

const list = join(parts, "list.txt");
writeFileSync(list, files.filter(Boolean).map((f) => `file '${f}'`).join("\n"));
const name = args.out ?? (first === 0 && last === total ? `${NAME}.mp4` : `${args.page === "index.html" ? "" : `${NAME}-`}section-${(first / info.fps).toFixed(1)}-${(last / info.fps).toFixed(1)}.mp4`);
const dest = join(OUT, name);
const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", dest], { stdio: "inherit" });
if (r.status !== 0) throw new Error("ffmpeg join failed");
rmSync(parts, { recursive: true, force: true });
console.log(`wrote ${dest} in ${((Date.now() - started) / 1000).toFixed(0)} s`);
