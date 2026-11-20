// Records the examples for the demo video: each clone on the skill's virtual clock (frame k is exactly
// t = k/60 s, the same on every run), at 2x, cropped to the card. Writes video/clips/<slug>/f/NNNN.jpg
// (full size), t/NNNN.jpg (small, for the helix) and video/clips/manifest.json.
//
//   bun video/scripts/clips.ts [--only clerk-mfa,…] [--jobs 4]
//   bun video/scripts/clips.ts --masters <dir> [--only vercel-hero,…]   # the Vercel video's pairs (below)
//
// Also, for the "how it works" scene: films clerk.com's Session management card and its copy the same way,
// and cuts the stripe.com Agentic commerce card and the resend.com cube, each with its copy, out of their
// compare.mp4 recordings in public/media/. Needs ffmpeg on PATH and Playwright's Chromium.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { SITE, serve } from "./serve";

const { values: args } = parseArgs({ options: { only: { type: "string" }, jobs: { type: "string", default: "4" }, port: { type: "string", default: "4701" }, masters: { type: "string" } } });

const CAPTURE = join(SITE, "..", "skills", "reanimate", "scripts", "capture.ts");
const OUT = join(SITE, "video", "clips");
const FPS = 60;
const THUMB_W = 480; // px wide, the helix tiles

type Clip = { slug: string; url: string; flags: string[] };

// The Clerk cards sit on white here, as they do in the video; on the dark page their corners would show.
const WHITE = `document.documentElement.style.background = "#fff"; document.body.style.background = "#fff"; document.querySelector(".clerk-bento").style.background = "#fff";`;
const clerk = (card: string, w: number, h: number): Clip => ({
  slug: card.startsWith("clerk-") ? card : `clerk-${card}`,
  url: `/public/examples/clerk-bento/?card=${card}&embed`,
  flags: ["--viewport", `${w}x${h}`, "--trigger", "hover", "--selector", `[data-card="${card}"]`, "--hover-at", "0.5,0.5", "--duration", "5400", "--pre-js", WHITE],
});
const stripe = (card: string, flags: string[]): Clip => ({
  slug: `stripe-${card}`,
  url: `/public/examples/stripe-bento/?card=${card}`,
  flags: ["--viewport", "1000x720", "--selector", `.modular-solutions-bento__card-${card}`, ...flags],
});

// "How it works": clerk.com's card and the copy, hovered the same way. The copy page draws the same card.
// clerk.com keeps requests open, so each frame waits at most 150 ms for the network, not 3 s.
const CLERK_PRE = join(SITE, "video", "scripts", "clerk-clock.js");
const SESSION = 'div:has(> div.text-center a[href="/user-authentication"]) > div.mt-16 > div.grid:first-child > div:nth-child(4)';
const how = (slug: string, url: string, selector: string): Clip => ({
  slug,
  url,
  flags: ["--viewport", "1440x900", "--selector", selector, "--trigger", "hover", "--hover-at", "0.3,0.5", "--wait-before", "1208", "--network-wait", "150", "--duration", "5000", "--pre-js", CLERK_PRE],
});

const CLIPS: Clip[] = [
  stripe("agentic-commerce", ["--trigger", "load", "--duration", "6500"]),
  stripe("issuing", ["--trigger", "move", "--path", "0.2,0.3;0.78,0.32;0.75,0.74;0.25,0.7;0.5,0.45", "--path-ms", "900", "--duration", "4800"]),
  stripe("crypto", ["--trigger", "hover", "--hover-at", "0.5,0.6", "--duration", "4800"]),
  { slug: "workos-atlas", url: "/public/examples/workos-atlas/", flags: ["--viewport", "1440x900", "--selector", ".atlas-tools", "--trigger", "load", "--duration", "8000"] },
  clerk("mfa", 443, 308),
  clerk("session-management", 443, 576),
  clerk("otp", 443, 308),
  clerk("fraud", 443, 576),
  clerk("magic-links", 443, 576),
  clerk("social-sign-on", 443, 308),
  clerk("advanced-security", 443, 308),
  clerk("bot-detection", 443, 308),
  clerk("passwords", 443, 308),
  clerk("api-keys", 845, 328),
  clerk("clerk-cli", 443, 328),
  how("how-clerk-reference", "https://clerk.com/", SESSION),
  how("how-clerk-copy", "/public/examples/clerk-bento/?card=session-management", ".clerk-card--session-management"),
  // frame 0 is 5.6 s after load, 0.4 s before the window switches from the text editor to the media player
  { slug: "liveblocks-comments", url: "/public/examples/liveblocks-comments/", flags: ["--viewport", "1440x900", "--selector", ".liveblocks-slideshow", "--trigger", "none", "--wait-before", "5300", "--duration", "5600"] },
  // filming starts at 1.5 s, once the cube has faded in; it turns on its own, no pointer
  { slug: "resend-cube", url: "/public/examples/resend-cube/", flags: ["--viewport", "1440x900", "--selector", ".resend-cube", "--trigger", "none", "--duration", "5600"] },
  // --wait-before 1208, not 1200: on a whole number of 60 fps ticks the stars' rAF loop gains or drops a
  // tick at random from run to run
  { slug: "reactbits-fading-stars", url: "/public/examples/reactbits-fading-stars/", flags: ["--viewport", "1200x720", "--selector", ".fading-stars", "--trigger", "drag", "--path", "0.5,0.8;0.25,0.5;0.75,0.4;0.6,0.75", "--path-ms", "600", "--pre-roll", "800", "--wait-before", "1208", "--duration", "4700"] },
];

const only = args.only?.split(",");
const todo = args.masters ? [] : CLIPS.filter((c) => !only || only.includes(c.slug));

function run(cmd: string, argv: string[]) {
  const r = spawnSync(cmd, argv, { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} ${argv.join(" ")} failed: ${r.stderr?.toString().slice(-1500)}`);
  return r.stdout.toString();
}

function capture(origin: string, clip: Clip): Promise<void> {
  const dir = join(OUT, clip.slug);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const argv = [CAPTURE, "--url", clip.url.startsWith("http") ? clip.url : origin + clip.url, "--out", join(dir, "capture"), "--scale", "2", "--fps", String(FPS), "--clock", "virtual", "--gpu", "hardware", "--pre-roll", "0", "--wait-before", "1200", ...clip.flags];
  return new Promise((resolve, reject) => {
    const p = spawn("bun", argv, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${clip.slug}: capture failed\n${err.slice(-1500)}`))));
  });
}

// PNG frames → f/ (JPEG, full size) and t/ (JPEG, THUMB_W wide); the capture folder is dropped.
function finish(slug: string) {
  const dir = join(OUT, slug);
  const cap = join(dir, "capture");
  const info = JSON.parse(readFileSync(join(cap, "frames.json"), "utf8"));
  mkdirSync(join(dir, "f"));
  mkdirSync(join(dir, "t"));
  const src = join(cap, "frames", "%04d.png");
  run("ffmpeg", ["-v", "error", "-y", "-i", src, "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2:color=white", "-q:v", "2", join(dir, "f", "%04d.jpg")]);
  run("ffmpeg", ["-v", "error", "-y", "-i", src, "-vf", `scale=${THUMB_W}:-2:flags=lanczos`, "-q:v", "3", join(dir, "t", "%04d.jpg")]);
  rmSync(cap, { recursive: true, force: true });
  const count = readdirSync(join(dir, "f")).length;
  return { slug, fps: FPS, frames: count, width: Math.round(info.clip.width), height: Math.round(info.clip.height) };
}

// Cuts the original and the copy out of a site recording (public/media/<media>/compare.mp4: the two takes
// stacked with a 24 px gap), each cropped to `box` = [x, y, w, h] in the take's px, as <slug>-reference and
// <slug>-copy. Sizes in the manifest are in CSS px, half the frames'.
function cutCompare(media: string, slug: string, box?: number[]) {
  const file = join(SITE, "public", "media", media, "compare.mp4");
  const [w, h] = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]).trim().split(",").map(Number);
  const half = Math.floor(h / 2) - 12;
  const [bx, by, bw, bh] = box ?? [0, 0, w, half];
  const out: Record<string, object> = {};
  for (const [side, y] of [["reference", 0], ["copy", h - half]] as const) {
    const dir = join(OUT, `${slug}-${side}`);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(join(dir, "f"), { recursive: true });
    run("ffmpeg", ["-v", "error", "-y", "-i", file, "-vf", `crop=${bw}:${bh}:${bx}:${y + by}`, "-q:v", "2", join(dir, "f", "%04d.jpg")]);
    out[`${slug}-${side}`] = { slug: `${slug}-${side}`, fps: FPS, frames: readdirSync(join(dir, "f")).length, width: bw / 2, height: bh / 2 };
  }
  return out;
}
const cutCompares = () => ({
  ...cutCompare("stripe-bento", "how-stripe", [4, 4, 368, 614]), // the Agentic commerce card
  ...cutCompare("resend-cube", "how-resend"),
});

// For the Vercel video (vercel.html): each clone and its original as scripts/record-media.ts filmed them for
// the site, lined up the same way, cut from the takes it keeps with `--keep <dir>` (listed in masters.json
// there) into <slug>-reference and <slug>-copy, at 2x.
function cutMasters(dir: string) {
  type Take = { file: string; from: number };
  const masters: Record<string, { ms: number; reference: Take; clone: Take }> = JSON.parse(readFileSync(join(dir, "masters.json"), "utf8"));
  const out: Record<string, object> = {};
  for (const [slug, m] of Object.entries(masters)) {
    if (only && !only.includes(slug)) continue;
    for (const [side, take] of [["reference", m.reference], ["copy", m.clone]] as const) {
      const name = `${slug}-${side}`;
      rmSync(join(OUT, name), { recursive: true, force: true });
      mkdirSync(join(OUT, name, "f"), { recursive: true });
      run("ffmpeg", ["-v", "error", "-y", "-ss", (take.from / 1000).toFixed(3), "-t", (m.ms / 1000).toFixed(3), "-i", take.file, "-q:v", "2", join(OUT, name, "f", "%04d.jpg")]);
      const [w, h] = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", take.file]).trim().split(",").map(Number);
      out[name] = { slug: name, fps: FPS, frames: readdirSync(join(OUT, name, "f")).length, width: w / 2, height: h / 2 };
      console.log(`${name}: ${(out[name] as { frames: number }).frames} frames`);
    }
  }
  return out;
}

const server = await serve(Number(args.port));
const origin = `http://localhost:${args.port}`;
const manifestFile = join(OUT, "manifest.json");
mkdirSync(OUT, { recursive: true });
const manifest: Record<string, object> = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : {};

const queue = [...todo];
const jobs = Number(args.jobs);
await Promise.all(
  Array.from({ length: jobs }, async () => {
    for (let clip = queue.shift(); clip; clip = queue.shift()) {
      const t0 = Date.now();
      await capture(origin, clip);
      manifest[clip.slug] = finish(clip.slug);
      console.log(`${clip.slug}: ${(manifest[clip.slug] as { frames: number }).frames} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
  }),
);
if (args.masters) Object.assign(manifest, cutMasters(args.masters));
else if (!only || only.some((s) => s.startsWith("compare"))) Object.assign(manifest, cutCompares());
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
server.closeAllConnections();
server.close();
console.log(`wrote ${manifestFile}`);
