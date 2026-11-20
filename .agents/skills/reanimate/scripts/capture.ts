// Capture a web page (reference or your clone) the same way every time:
// video + extracted frames, an inspection dump (animations, keyframes, styles, fonts, libraries)
// and a per-frame track of chosen elements (position, size, opacity, transform).
//
// Usage: bun capture.ts --url <url|file.html> --out <dir> [options]
import { chromium, type Page, type Request, type Response } from "playwright";
import { PNG } from "pngjs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync, readdirSync, statSync, writeFileSync, rmSync, unlinkSync } from "node:fs";
import { ensureDir, ffmpeg, num, pad, parseArgs, parseRect, parseSize, usage, writeJson, abs, SCRIPTS_DIR } from "./lib.ts";
import { writeGlArtifacts } from "./gl.ts";

const HELP = `
capture.ts — record a page and dump everything needed to clone its motion.

  bun capture.ts --url <url|file.html> --out <dir> [options]

Window
  --viewport WxH        viewport, default 1440x900 (use the same for reference and clone)
  --scale N             deviceScaleFactor, default 1
  --color-scheme S      light | dark
  --reduced-motion S    no-preference (default) | reduce

What to look at
  --selector CSS        element to scroll into view and crop frames to (default: whole viewport)
  --pad PX              extra margin around the selector crop, default 0
  --clip x,y,w,h        explicit crop in CSS px (overrides --selector crop)

How to start the motion
  --trigger T           load (default) | scroll | hover | leave | move | drag | click | none
                        load: the window starts at navigation (page-load animations)
                        scroll: wheel the page in steps so scroll-reveal / scroll-linked motion plays
                        hover / click: act on --target (default: --selector)
                        leave: move the pointer off whatever it is on (hover-out); pair with --pre-hover
                        move: glide the pointer through --path inside --target (pointer-follow effects)
                        drag: like move, with the button held: down at the first --path point, glide, up at the last
                        none: just record (loops, marquees, idle animations)
  --target CSS          element to hover/click/move over
  --hover-at FX,FY      where to put the pointer on --target, as fractions of its box (default 0.5,0.5)
  --pre-hover CSS       hover this element before the trigger (uses --hover-at) and wait --pre-hover-ms
  --pre-hover-ms MS     default 1500
  --leave-to X,Y        viewport point the pointer moves to for --trigger leave, default <width/2>,8
  --path "FX,FY;…"      move/drag trigger: fractional points inside --target, visited in order
  --path-ms MS          move/drag trigger: time spent between two points, default 400 (20 pointer steps each)
  --scroll-to PX|CSS    scroll position (or element) to reach during a scroll trigger;
                        default for scroll: bring --selector into view from just below the fold
  --scroll-ms MS        how long the stepped scroll takes, default 600
  --scroll-steps N      wheel steps, default 12
  --wait-before MS      settle time after load before the trigger, default 800
  --pre-js FILE|CODE    JS to run after load, before the trigger (dismiss banners, open a menu…)
  --duration MS         how long to record after the trigger, default 3000
  --pre-roll MS         frames to keep before the trigger, default 200

Output
  --fps N               extracted frame rate, default 25 (the video is 25 fps; higher only helps with --playback-rate
                        or --clock virtual)
  --playback-rate R     slow CSS/WAAPI animations with CDP (0.25 = 4x slower). JS-driven motion is not affected.
  --track "CSS, CSS"    elements sampled every animation frame → track.json (default: --selector, if any)
  --no-video            skip the video and frames (inspection + track only)
  --headed              show the browser (needs a display)

Canvas, WebGL and 3D (see references/webgl.md)
  --clock virtual       deterministic capture: the page runs on a virtual clock (performance.now, Date, timers,
                        rAF, CSS/WAAPI animations, event timestamps) that is advanced frame by frame and
                        screenshotted, so frame k is exactly t = k/fps whatever the GPU or machine load, and
                        two captures of the same page are identical. Works for JS-driven motion too, at any fps.
  --seed N              seed Math.random (default 1 with --clock virtual). Same seed, same particles.
  --raf-hz N            virtual clock frame rate seen by the page, default 60
  --network-wait MS     virtual clock: wait up to MS for in-flight requests before each frame, default 3000
  --gl                  trace WebGL/WebGL2/WebGPU/canvas 2D and three.js: shaders, programs, draw calls, passes,
                        textures, buffers, uniforms and scene graph per frame → gl/, gl-track.json
  --gl-buffers MB       with --gl, also dump vertex/index buffer contents (first upload) up to MB, default off
  --gpu MODE            software (default, SwiftShader: identical everywhere) | hardware (real GPU, fast, and
                        WebGPU enabled). Record reference and clone with the same mode.
  --assets              save the page's 3D models, textures, shader files, Lottie/Rive/Spline files and scripts
                        → assets/ + assets.json

Writes to <out>/: video.webm (video.mp4 with --clock virtual), frames/NNNN.png, frames.json, inspect.json,
track.json, capture.json, and with --gl: gl/gl.json, gl/shaders/, gl/draws.json, gl-track.json, three/
`;

const a = parseArgs(process.argv.slice(2));
if (a.help || !a.url || !a.out) usage(HELP);

const out = ensureDir(abs(a.out));
const viewport = parseSize(a.viewport, { width: 1440, height: 900 });
const scale = num(a.scale, 1);
const fps = num(a.fps, 25);
const rate = num(a["playback-rate"], 1);
const duration = num(a.duration, 3000);
const preRoll = num(a["pre-roll"], 200);
const waitBefore = num(a["wait-before"], 800);
const trigger: string = a.trigger || "load";
const selector: string | undefined = a.selector;
const target: string | undefined = a.target || selector;
const padPx = num(a.pad, 0);
const wantVideo = !a["no-video"];
const trackSelectors: string[] = (a.track ? String(a.track) : selector || "").split(",").map((s) => s.trim()).filter(Boolean);
let url: string = String(a.url);
if (!/^[a-z]+:/i.test(url)) url = "file://" + abs(url);

const hoverAt = String(a["hover-at"] ?? "0.5,0.5").split(",").map(Number);
const preHover: string | undefined = a["pre-hover"] ? String(a["pre-hover"]) : undefined;
const preHoverMs = num(a["pre-hover-ms"], 1500);
const leaveTo = a["leave-to"] ? String(a["leave-to"]).split(",").map(Number) : [viewport.width / 2, 8];
const movePath = String(a.path ?? "0.5,0.5").split(";").map((p) => p.split(",").map(Number));
const pathMs = num(a["path-ms"], 400);
async function pointAt(page: Page, sel: string, fx: number, fy: number) {
  const b = await page.locator(sel).first().boundingBox();
  if (!b) throw new Error(`not visible: ${sel}`);
  return { x: b.x + b.width * fx, y: b.y + b.height * fy };
}

const preJs = a["pre-js"] ? (existsSync(String(a["pre-js"])) ? readFileSync(String(a["pre-js"]), "utf8") : String(a["pre-js"])) : undefined;

const virtual = a.clock === "virtual";
if (a.clock && a.clock !== "virtual" && a.clock !== "real") throw new Error(`--clock must be virtual or real, got ${a.clock}`);
const seed: number | null = a.seed !== undefined ? num(a.seed, 1) : virtual ? 1 : null;
const rafHz = num(a["raf-hz"], 60);
const networkWait = num(a["network-wait"], 3000);
const wantGl = !!a.gl;
const glBuffersMb = a["gl-buffers"] === undefined ? 0 : num(a["gl-buffers"], 16);
const gpuMode = a.gpu === true ? "hardware" : String(a.gpu ?? "software");
if (gpuMode !== "hardware" && gpuMode !== "software") throw new Error(`--gpu must be hardware or software, got ${a.gpu}`);
const wantAssets = !!a.assets;
if (virtual && rate !== 1) console.error("--playback-rate is ignored with --clock virtual: every frame is exact, raise --fps instead");
const inpage = (file: string, cfg: object) => `(${readFileSync(join(SCRIPTS_DIR, "inpage", file), "utf8").trim().replace(/;$/, "")})(${JSON.stringify(cfg)});`;

// records which context each canvas got, so inspection never has to call getContext itself
const CTX_PROBE = `(() => {
  for (const C of [self.HTMLCanvasElement, self.OffscreenCanvas]) {
    if (!C) continue;
    const g = C.prototype.getContext;
    C.prototype.getContext = function (type) { const c = g.apply(this, arguments); if (c && !this.__mcCtx) try { this.__mcCtx = String(type); } catch {} return c; };
  }
})();`;

// ---------- in-page tracker (installed before any script runs so load-triggered motion is caught) ----------
const TRACKER = `(() => {
  const sels = __SELS__;
  const w = window;
  w.__mc = { samples: [], t0: null, running: true };
  const sample = () => {
    if (!w.__mc.running) return;
    const t = performance.now();
    const els = {};
    for (const s of sels) {
      let el = null; try { el = document.querySelector(s); } catch {}
      if (!el) { els[s] = null; continue; }
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      els[s] = { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2),
                 opacity: +(+cs.opacity).toFixed(3), transform: cs.transform, clipPath: cs.clipPath === 'none' ? undefined : cs.clipPath };
    }
    w.__mc.samples.push({ t, scrollY: w.scrollY, els });
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
})();`;

// ---------- inspection (run after the motion so getAnimations() has seen everything) ----------
const INSPECT = `(sel) => {
  const desc = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 4).join('.') : '');
  const root = sel ? document.querySelector(sel) : document.body;
  const w = window;
  const libs = [];
  const has = (c) => { try { return !!c(); } catch { return false; } };
  if (has(() => w.gsap)) libs.push('gsap' + (has(() => w.ScrollTrigger) ? '+ScrollTrigger' : ''));
  if (has(() => w.lottie || w.bodymovin || document.querySelector('lottie-player,dotlottie-player,[data-lottie],.lottie'))) libs.push('lottie');
  const canvases = [...document.querySelectorAll('canvas')].map(c => ({ el: desc(c), context: c.__mcCtx || null, size: [c.width, c.height], css: (() => { const r = c.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; })() }));
  if (has(() => w.__THREE__ || w.THREE)) libs.push('three.js r' + (w.__THREE__ || (w.THREE && w.THREE.REVISION) || '?'));
  if (canvases.some(c => /webgl/.test(c.context || ''))) libs.push('webgl canvas');
  if (canvases.some(c => c.context === 'webgpu')) libs.push('webgpu canvas');
  if (canvases.some(c => c.context === '2d')) libs.push('canvas 2d');
  if (has(() => w.BABYLON)) libs.push('babylon.js');
  if (has(() => w.pc && w.pc.Application)) libs.push('playcanvas');
  if (has(() => w.PIXI || w.__PIXI_APP__ || w.__PIXI_RENDERER__)) libs.push('pixi.js');
  if (has(() => document.querySelector('spline-viewer') || [...document.scripts].some(s => /splinetool|spline\\.design/.test(s.src)) || performance.getEntriesByType('resource').some(e => /\\.splinecode/.test(e.name)))) libs.push('spline');
  if (has(() => w.UnicornStudio || document.querySelector('[data-us-project]'))) libs.push('unicorn studio');
  if (has(() => w.VANTA)) libs.push('vanta.js');
  if (has(() => w.createREGL)) libs.push('regl');
  if (has(() => performance.getEntriesByType('resource').some(e => /\\.(glb|gltf|hdr|exr|ktx2|drc|usdz|splat)(\\?|$)/i.test(e.name)))) libs.push('3d assets (glb/gltf/hdr/ktx2…)');
  if (has(() => w.rive || document.querySelector('canvas[data-rive], .rive-canvas'))) libs.push('rive');
  if (has(() => w.anime)) libs.push('anime.js');
  if (has(() => w.Lenis || document.documentElement.classList.contains('lenis'))) libs.push('lenis smooth-scroll');
  if (has(() => w.Webflow || document.querySelector('[data-wf-page]'))) libs.push('webflow');
  if (has(() => document.querySelector('[data-framer-name],[data-framer-component-type]'))) libs.push('framer-sites');
  if (has(() => document.querySelector('[data-projection-id],[data-framer-appear-id]') || [...document.scripts].some(s => /framer-motion|motion-dom/.test(s.src)))) libs.push('framer-motion/motion');
  if (has(() => w.__NEXT_DATA__ || document.getElementById('__next'))) libs.push('next.js');
  if (has(() => w.__nuxt)) libs.push('nuxt');
  if (has(() => document.querySelector('astro-island'))) libs.push('astro');
  if (has(() => document.querySelector('.swiper, .splide, .slick-slider, .embla'))) libs.push('carousel lib');
  if (has(() => [...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => r.cssText.includes('animation-timeline')) } catch { return false } }))) libs.push('css scroll-driven animations');

  const fonts = [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '') + ' ' + f.weight + ' ' + f.style))];

  const keyframes = [];
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { keyframes.push({ unreadable: sheet.href }); continue; }
    const walk = (list) => { for (const r of list) { if (r.type === 7) keyframes.push({ name: r.name, css: r.cssText }); else if (r.cssRules) walk(r.cssRules); } };
    walk(rules);
  }

  const anims = (root ? root.getAnimations({ subtree: true }) : document.getAnimations()).slice(0, 200).map(an => {
    const eff = an.effect; const tgt = eff && eff.target;
    let kf = []; try { kf = eff.getKeyframes().slice(0, 24).map(k => { const o = {}; for (const [p, v] of Object.entries(k)) if (p !== 'computedOffset' && p !== 'composite') o[p] = v; return o; }); } catch {}
    return { kind: an.constructor.name, name: an.animationName || an.transitionProperty || an.id || '', target: tgt ? desc(tgt) : null,
             timing: eff ? eff.getTiming() : null, keyframes: kf, playState: an.playState, currentTime: an.currentTime,
             timeline: an.timeline && an.timeline.constructor.name };
  });

  const PROPS = ['opacity','transform','transform-origin','transition','animation','will-change','color','background-color','background-image','font-family','font-size','font-weight','line-height','letter-spacing','border-radius','box-shadow','filter','backdrop-filter','clip-path','overflow','position','display','gap','padding','mask-image'];
  const nodes = [];
  if (root) {
    const all = [root, ...root.querySelectorAll('*')].slice(0, 150);
    for (const el of all) {
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const style = {}; for (const p of PROPS) { const v = cs.getPropertyValue(p); if (!v || v === 'none' || v === 'normal' || v === 'auto' || v === 'static' || v === 'visible' || v === '0px' || v === 'all' || v === 'all 0s ease 0s' || v === 'rgba(0, 0, 0, 0)') continue; if (p === 'opacity' && v === '1') continue; if (p === 'transform' && v === 'matrix(1, 0, 0, 1, 0, 0)') continue; if (p === 'transform-origin') continue; style[p] = v; }
      const text = el.childElementCount === 0 ? (el.textContent || '').trim().slice(0, 60) : undefined;
      nodes.push({ el: desc(el), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], text, style,
                   src: el.currentSrc || el.src || undefined });
    }
  }
  const rect = root ? root.getBoundingClientRect() : null;
  return { url: location.href, title: document.title, viewport: [innerWidth, innerHeight], scrollY, devicePixelRatio, libs, fonts, canvases,
           target: sel ? { selector: sel, found: !!root, rect: rect && [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)] } : null,
           animations: anims, keyframes, nodes };
}`;

async function runTrigger(page: Page): Promise<number> {
  const now = () => Date.now();
  switch (trigger) {
    case "load": return now(); // handled by the caller: the window starts at navigation
    case "none": return now();
    case "hover": { if (!target) throw new Error("--target or --selector needed for hover"); const pt = await pointAt(page, target, hoverAt[0], hoverAt[1]); const t = now(); await page.mouse.move(pt.x, pt.y); return t; }
    case "leave": { const t = now(); await page.mouse.move(leaveTo[0], leaveTo[1]); return t; }
    case "move": {
      if (!target) throw new Error("--target or --selector needed for move");
      const pts = [] as { x: number; y: number }[];
      for (const [fx, fy] of movePath) pts.push(await pointAt(page, target, fx, fy));
      await page.mouse.move(pts[0].x, pts[0].y);
      const t = now();
      for (let i = 1; i < pts.length; i++) {
        for (let k = 1; k <= 20; k++) { const f = k / 20; await page.mouse.move(pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f); await page.waitForTimeout(pathMs / 20); }
      }
      return t;
    }
    case "drag": {
      if (!target) throw new Error("--target or --selector needed for drag");
      const pts = [] as { x: number; y: number }[];
      for (const [fx, fy] of movePath) pts.push(await pointAt(page, target, fx, fy));
      await page.mouse.move(pts[0].x, pts[0].y);
      const t = now();
      await page.mouse.down();
      for (let i = 1; i < pts.length; i++) {
        for (let k = 1; k <= 20; k++) { const f = k / 20; await page.mouse.move(pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f); await page.waitForTimeout(pathMs / 20); }
      }
      await page.mouse.up(); // released while still moving, so fling/inertia code sees a velocity
      return t;
    }
    case "click": { if (!target) throw new Error("--target or --selector needed for click"); const t = now(); await page.click(target, { timeout: 10000, noWaitAfter: true }); return t; }
    case "scroll": {
      const steps = num(a["scroll-steps"], 12);
      const ms = num(a["scroll-ms"], 600);
      const from = await page.evaluate(() => window.scrollY);
      let to: number;
      if (a["scroll-to"] !== undefined && a["scroll-to"] !== true && /^\d+$/.test(String(a["scroll-to"]))) to = Number(a["scroll-to"]);
      else {
        const sel = (a["scroll-to"] && a["scroll-to"] !== true) ? String(a["scroll-to"]) : selector;
        if (!sel) throw new Error("--scroll-to or --selector needed for a scroll trigger");
        to = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) throw new Error("not found: " + s); return window.scrollY + el.getBoundingClientRect().top - innerHeight * 0.25; }, sel);
      }
      const t = now();
      const delta = (to - from) / steps;
      await page.mouse.move(viewport.width / 2, viewport.height / 2);
      for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, delta); await page.waitForTimeout(ms / steps); }
      return t;
    }
    default: throw new Error(`unknown trigger ${trigger}`);
  }
}

// Virtual clock: the trigger as input events scheduled at virtual times (ms after the trigger), so a
// pointer path or a stepped scroll lands on the same frames every capture.
type Action = { at: number; run: () => Promise<unknown> };
async function scrollTarget(page: Page): Promise<number> {
  if (a["scroll-to"] !== undefined && a["scroll-to"] !== true && /^\d+$/.test(String(a["scroll-to"]))) return Number(a["scroll-to"]);
  const sel = (a["scroll-to"] && a["scroll-to"] !== true) ? String(a["scroll-to"]) : selector;
  if (!sel) throw new Error("--scroll-to or --selector needed for a scroll trigger");
  return page.evaluate((s) => { const el = document.querySelector(s); if (!el) throw new Error("not found: " + s); return window.scrollY + el.getBoundingClientRect().top - innerHeight * 0.25; }, sel);
}
async function planTrigger(page: Page): Promise<Action[]> {
  const tick = 1000 / rafHz;
  const glide = (pts: { x: number; y: number }[]): Action[] => {
    const acts: Action[] = [];
    const steps = Math.max(1, Math.round(pathMs / tick));
    for (let i = 1; i < pts.length; i++) for (let k = 1; k <= steps; k++) {
      const f = k / steps, p0 = pts[i - 1], p1 = pts[i];
      acts.push({ at: (i - 1) * pathMs + f * pathMs, run: () => page.mouse.move(p0.x + (p1.x - p0.x) * f, p0.y + (p1.y - p0.y) * f) });
    }
    return acts;
  };
  switch (trigger) {
    case "load": case "none": return [];
    case "hover": { if (!target) throw new Error("--target or --selector needed for hover"); const pt = await pointAt(page, target, hoverAt[0], hoverAt[1]); return [{ at: 0, run: () => page.mouse.move(pt.x, pt.y) }]; }
    case "leave": return [{ at: 0, run: () => page.mouse.move(leaveTo[0], leaveTo[1]) }];
    case "click": { if (!target) throw new Error("--target or --selector needed for click"); return [{ at: 0, run: () => page.click(target, { timeout: 10000, noWaitAfter: true }) }]; }
    case "move": case "drag": {
      if (!target) throw new Error(`--target or --selector needed for ${trigger}`);
      const pts = [] as { x: number; y: number }[];
      for (const [fx, fy] of movePath) pts.push(await pointAt(page, target, fx, fy));
      const acts = glide(pts);
      acts.unshift({ at: 0, run: async () => { await page.mouse.move(pts[0].x, pts[0].y); if (trigger === "drag") await page.mouse.down(); } });
      if (trigger === "drag") acts.push({ at: acts[acts.length - 1].at, run: () => page.mouse.up() });
      return acts;
    }
    case "scroll": {
      const steps = num(a["scroll-steps"], 12);
      const ms = num(a["scroll-ms"], 600);
      const from = await page.evaluate(() => window.scrollY);
      const delta = ((await scrollTarget(page)) - from) / steps;
      const acts: Action[] = [{ at: 0, run: () => page.mouse.move(viewport.width / 2, viewport.height / 2) }];
      for (let i = 0; i < steps; i++) acts.push({ at: (i * ms) / steps, run: () => page.mouse.wheel(0, delta) });
      return acts;
    }
    default: throw new Error(`unknown trigger ${trigger}`);
  }
}

const launchArgs: string[] = [];
if (gpuMode === "hardware") {
  launchArgs.push("--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu");
  if (process.platform === "darwin") launchArgs.push("--use-angle=metal");
  else if (process.platform === "linux") launchArgs.push("--use-angle=vulkan", "--enable-features=Vulkan,VulkanFromANGLE,DefaultANGLEVulkan");
}
if (virtual) launchArgs.push("--disable-smooth-scrolling"); // wheel scrolling animates on the compositor's real clock otherwise
const browser = await chromium.launch({ headless: !a.headed, args: launchArgs });
const context = await browser.newContext({
  viewport, deviceScaleFactor: scale,
  colorScheme: a["color-scheme"] || undefined,
  reducedMotion: a["reduced-motion"] || "no-preference",
  recordVideo: wantVideo && !virtual ? { dir: join(out, ".video"), size: viewport } : undefined,
});
// order matters: the clock replaces the time APIs first, the GL tracer wraps rAF on top, the tracker samples last
await context.addInitScript(CTX_PROBE);
if (virtual || seed !== null) await context.addInitScript(inpage("clock.js", { virtual, seed, rafHz, freezeAtStart: virtual }));
if (wantGl) await context.addInitScript(inpage("gl-hooks.js", { dumpBuffers: glBuffersMb * 1024 * 1024 }));
if (trackSelectors.length) await context.addInitScript(TRACKER.replace("__SELS__", JSON.stringify(trackSelectors)));
const page = await context.newPage();
const tPageCreated = Date.now();

// Workers: init scripts never reach them, and page.on("worker") fires after their code ran. A second CDP
// session auto-attaches with waitForDebuggerOnStart, evaluates the seed (and tracer) inside each new
// worker, then lets it run. Playwright's session can't address child sessions, hence the non-flat
// Target.sendMessageToTarget transport. Workers started by workers are not reached.
const workerSessions: { sessionId: string; url: string; idx: number }[] = [];
let workerEval: (sessionId: string, expression: string) => Promise<any> = async () => null;
if ((seed !== null || wantGl) && !a["no-workers"]) {
  const cdp = await context.newCDPSession(page);
  let msgId = 0;
  const waiting = new Map<number, (m: any) => void>();
  const send = (sessionId: string, method: string, params: object = {}) => new Promise<any>((res) => {
    const id = ++msgId;
    waiting.set(id, res);
    cdp.send("Target.sendMessageToTarget" as any, { sessionId, message: JSON.stringify({ id, method, params }) } as any).catch(() => { waiting.delete(id); res(null); });
    setTimeout(() => { if (waiting.delete(id)) res(null); }, 10000);
  });
  cdp.on("Target.receivedMessageFromTarget" as any, (e: any) => {
    try { const m = JSON.parse(e.message); if (m.id && waiting.has(m.id)) { waiting.get(m.id)!(m); waiting.delete(m.id); } } catch {}
  });
  cdp.on("Target.attachedToTarget" as any, async (e: any) => {
    const { sessionId, targetInfo, waitingForDebugger } = e;
    if (targetInfo.type === "worker") {
      const idx = workerSessions.length;
      workerSessions.push({ sessionId, url: targetInfo.url, idx });
      const parts = [];
      if (seed !== null) parts.push(inpage("clock.js", { virtual: false, seed: (seed + 7919 * (idx + 1)) >>> 0 }));
      if (wantGl) parts.push(inpage("gl-hooks.js", { dumpBuffers: glBuffersMb * 1024 * 1024, idPrefix: `w${idx}.` }));
      await send(sessionId, "Runtime.evaluate", { expression: parts.join("\n") });
    }
    if (waitingForDebugger) await send(sessionId, "Runtime.runIfWaitingForDebugger");
  });
  workerEval = async (sessionId, expression) => {
    const r = await send(sessionId, "Runtime.evaluate", { expression, returnByValue: true });
    return r?.result?.result?.value ?? null;
  };
  await cdp.send("Target.setAutoAttach" as any, { autoAttach: true, waitForDebuggerOnStart: true, flatten: false } as any);
}
if (rate !== 1 && !virtual) {
  const cdp = await context.newCDPSession(page);
  await cdp.send("Animation.enable");
  await cdp.send("Animation.setPlaybackRate", { playbackRate: rate });
}

// network bookkeeping: in-flight requests (virtual clock waits for them) and assets to save
const inflight = new Map<Request, number>();
page.on("request", (r) => inflight.set(r, Date.now()));
page.on("requestfinished", (r) => inflight.delete(r));
page.on("requestfailed", (r) => inflight.delete(r));
async function networkQuiet() {
  const until = Date.now() + networkWait;
  while (Date.now() < until) {
    const busy = [...inflight.values()].some((t) => Date.now() - t < 10000) // long-polls and streams don't count
      || (virtual && (await page.evaluate(() => (window as any).__mcClock?.busy?.() ?? 0).catch(() => 0)) > 0); // workers still computing
    if (!busy) return;
    await new Promise((r) => setTimeout(r, 10));
  }
}
const ASSET_RE = /\.(glb|gltf|bin|hdr|exr|ktx2?|basis|drc|splinecode|riv|lottie|usdz|fbx|obj|mtl|ply|vrm|splat|ksplat|spz|glsl|vert|frag|vs|fs|wgsl)(\?|#|$)/i;
const assetJobs: Promise<void>[] = [];
const assetIndex: any[] = [];
const imageResponses = new Map<string, Response>();
async function saveAsset(res: Response, kind: string) {
  try {
    if (res.status() !== 200) return;
    const body = await res.body();
    const url = res.url();
    const name = (basename(new URL(url).pathname) || "index").replace(/[^\w.\-]+/g, "_").slice(-80);
    const file = join(kind, createHash("sha1").update(url).digest("hex").slice(0, 6) + "-" + name);
    writeFileSync(join(ensureDir(join(out, "assets", kind)), basename(file)), body);
    assetIndex.push({ kind, url, file: join("assets", file), bytes: body.length, contentType: res.headers()["content-type"] });
  } catch (e) { /* bodies of redirects, aborted or evicted responses are not available */ }
}
if (wantAssets) {
  rmSync(join(out, "assets"), { recursive: true, force: true });
  page.on("response", (res) => {
    const url = res.url();
    if (!/^https?:/.test(url)) return;
    const ct = res.headers()["content-type"] || "";
    if (ASSET_RE.test(url) || /^model\//.test(ct)) assetJobs.push(saveAsset(res, /\.(glsl|vert|frag|vs|fs|wgsl)(\?|#|$)/i.test(url) ? "shaders" : "models"));
    else if (/^image\//.test(ct)) imageResponses.set(url, res);
    else if (/javascript|ecmascript/.test(ct) || /\.m?js(\?|#|$)/.test(url)) assetJobs.push(saveAsset(res, "scripts"));
    else if (/json/.test(ct) && /lottie|anim|scene|spline|unicorn|project|rive/i.test(url)) assetJobs.push(saveAsset(res, "data"));
  });
}

let tTrigger = Date.now();
let perfAtTrigger: number | null = null; // page clock at the trigger, so track.json has t=0 at the trigger
let frames: any = null;
const framesDir = join(out, "frames");
const clipOf = async () => {
  let c = parseRect(a.clip);
  if (!c && selector) {
    const r = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }, selector);
    if (r) c = { x: Math.max(0, Math.floor(r.x - padPx)), y: Math.max(0, Math.floor(r.y - padPx)), width: Math.ceil(Math.min(viewport.width - r.x + padPx, r.width + 2 * padPx)), height: Math.ceil(Math.min(viewport.height - r.y + padPx, r.height + 2 * padPx)) };
  }
  return c;
};
// settle time before the trigger: real waiting, or the same amount of virtual time
const settle = async (ms: number) => {
  if (!virtual) return page.waitForTimeout(ms);
  for (let left = ms; left > 0; left -= 100) { await page.evaluate((x) => (window as any).__mcClock.advance(x), Math.min(100, left)); await networkQuiet(); }
};
async function prepareTrigger() {
  await settle(waitBefore);
  if (preJs) await page.evaluate(preJs);
  if (selector && trigger !== "scroll") {
    const found = await page.$(selector);
    if (!found) throw new Error(`selector not found: ${selector}`);
    await found.scrollIntoViewIfNeeded();
    await settle(300);
  } else if (trigger === "scroll" && selector) {
    // start just below the fold so the element enters the viewport during the scroll
    await page.evaluate((s) => { const el = document.querySelector(s); if (el) window.scrollTo(0, Math.max(0, window.scrollY + el.getBoundingClientRect().top - innerHeight - 20)); }, selector);
    await settle(300);
  }
  if (preHover) { const pt = await pointAt(page, preHover, hoverAt[0], hoverAt[1]); await page.mouse.move(pt.x, pt.y); await settle(preHoverMs); }
}

if (!virtual) {
  await page.goto(url, { waitUntil: trigger === "load" ? "commit" : "load", timeout: 60000 });
  if (trigger !== "load") {
    await prepareTrigger();
    perfAtTrigger = await page.evaluate(() => performance.now());
    tTrigger = await runTrigger(page);
  }
  await page.waitForTimeout(duration / rate);
} else {
  // ---------- virtual clock: step, screenshot, repeat ----------
  // The clock is frozen from the first script on and only moves when advanced, so the network looks instant
  // and every capture of the page passes through the same states. load: t=0 is navigation. Other triggers:
  // --wait-before and the other settle times pass as virtual time, then pre-roll frames, then the trigger.
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await networkQuiet();
  let pre = 0;
  if (trigger !== "load") { await prepareTrigger(); pre = preRoll; }
  const start: number = await page.evaluate(() => (window as any).__mcClock.now());
  const at0 = start + pre;
  perfAtTrigger = at0;
  const plan = (await planTrigger(page)).map((x) => ({ ...x, at: at0 + x.at })).sort((x, y) => x.at - y.at);
  const frameMs = 1000 / fps;
  const total = Math.round((pre + duration) / frameMs) + 1;
  const rawDir = ensureDir(join(out, ".raw"));
  for (const f of readdirSync(rawDir)) unlinkSync(join(rawDir, f));
  let now = start;
  const advanceTo = async (t: number) => { if (t > now + 1e-6) now = await page.evaluate((ms) => (window as any).__mcClock.advance(ms), t - now); };
  for (let k = 0; k < total; k++) {
    const ft = start + k * frameMs;
    while (plan.length && plan[0].at <= ft) { const act = plan.shift()!; await advanceTo(act.at); await act.run(); }
    await advanceTo(ft);
    await networkQuiet();
    if (wantVideo) await page.screenshot({ path: join(rawDir, `${pad(k + 1)}.png`), animations: "allow", caret: "initial" });
  }
  for (const act of plan) { await advanceTo(act.at); await act.run(); } // e.g. a drag release after the window
  if (wantVideo) {
    const clip = await clipOf();
    ensureDir(framesDir);
    for (const f of readdirSync(framesDir)) if (f.endsWith(".png")) unlinkSync(join(framesDir, f));
    for (const f of readdirSync(rawDir).sort()) {
      const png = PNG.sync.read(readFileSync(join(rawDir, f)));
      if (!clip) { writeFileSync(join(framesDir, f), PNG.sync.write(png)); continue; }
      const x = Math.round(clip.x * scale), y = Math.round(clip.y * scale);
      const cw = Math.min(Math.round(clip.width * scale), png.width - x), ch = Math.min(Math.round(clip.height * scale), png.height - y);
      const o = new PNG({ width: cw, height: ch });
      PNG.bitblt(png, o, x, y, cw, ch, 0, 0);
      writeFileSync(join(framesDir, f), PNG.sync.write(o));
    }
    rmSync(rawDir, { recursive: true, force: true });
    try {
      ffmpeg(["-y", "-framerate", String(fps), "-i", join(framesDir, "%04d.png"), "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "18", join(out, "video.mp4")], { quiet: true });
    } catch (e) { console.error("video.mp4 not written: " + String(e).split("\n")[0]); }
    frames = { fps, count: total, playbackRate: 1, preRollMs: pre, triggerFrame: Math.round((pre / 1000) * fps), clip, viewport, scale, clock: "virtual", seed, rafHz,
      note: "frame i is exactly the page state at t = i/fps seconds, with t=0 at preRoll before the trigger (virtual clock)" };
    writeJson(join(out, "frames.json"), frames);
  }
}

// crop rect, measured after the motion (use --clip if the element moves a lot)
const clip = await clipOf();

const track = trackSelectors.length ? await page.evaluate(() => { const m = (window as any).__mc; m.running = false; return m.samples; }) : [];
const inspect: any = await page.evaluate(`(${INSPECT})(${JSON.stringify(selector ?? null)})`);
const gl: any = wantGl ? await page.evaluate(() => (window as any).__mcgl ? (window as any).__mcgl.export() : null) : null;
if (gl && workerSessions.length) {
  // worker traces join the page's; their frame times move onto the page clock (through the virtual clock's history)
  const hist: [number, number][] = virtual ? await page.evaluate(() => (window as any).__mcClock.history()) : [];
  const toPage = (wt: number, wOrigin: number) => {
    const real = wt + wOrigin - gl.timeOrigin;
    if (!virtual) return real;
    let v = hist.length ? hist[0][1] : real;
    for (const [r, vv] of hist) { if (r > real) break; v = vv; }
    return v;
  };
  gl.workers = [];
  for (const w of workerSessions) {
    const json = await workerEval(w.sessionId, "self.__mcgl ? JSON.stringify(self.__mcgl.export()) : null");
    if (!json) { gl.workers.push({ url: w.url, traced: false }); continue; }
    const d = JSON.parse(json);
    gl.workers.push({ url: w.url, traced: true, contexts: d.contexts.length, programs: d.programs.length });
    for (const k of ["contexts", "programs", "textures", "buffers", "framebuffers"]) gl[k].push(...d[k]);
    for (const f of d.frameData) f.t = toPage(f.t, d.timeOrigin);
    gl.frameData = [...gl.frameData, ...d.frameData].sort((x: any, y: any) => x.t - y.t);
    Object.assign(gl.dumps, d.dumps);
    gl.gpu.modules.push(...d.gpu.modules); gl.gpu.pipelines.push(...d.gpu.pipelines);
    gl.errors.push(...d.errors.map((e: string) => `worker ${w.idx}: ${e}`));
  }
}
const renderer: string | null = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const g = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
  if (!g) return null;
  const e = g.getExtension("WEBGL_debug_renderer_info");
  const r = e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
  g.getExtension("WEBGL_lose_context")?.loseContext();
  return r;
});
await page.screenshot({ path: join(out, "final.png"), clip: clip && clip.width > 0 && clip.height > 0 ? clip : undefined });
if (wantAssets) {
  // textures the GPU actually sampled, by URL
  const texUrls = new Set<string>((gl?.textures ?? []).map((t: any) => t.src?.url).filter(Boolean));
  for (const [u, res] of imageResponses) if (!gl || texUrls.has(u)) assetJobs.push(saveAsset(res, gl ? "textures" : "images"));
  await Promise.all(assetJobs);
}
await context.close();
await browser.close();

// ---------- video → frames (real clock) ----------
if (wantVideo && !virtual) {
  const vdir = join(out, ".video");
  const webm = readdirSync(vdir).filter((f) => f.endsWith(".webm")).map((f) => join(vdir, f)).sort((x, y) => statSync(y).mtimeMs - statSync(x).mtimeMs)[0];
  if (!webm) throw new Error("no video recorded");
  renameSync(webm, join(out, "video.webm"));
  ensureDir(framesDir);
  for (const f of readdirSync(framesDir)) if (f.endsWith(".png")) unlinkSync(join(framesDir, f));
  // the video clock starts at page creation; the trigger offset is wall-clock, refine with compare.ts --auto-align
  const triggerOffset = Math.max(0, (tTrigger - tPageCreated) / 1000 - preRoll / 1000);
  const videoFps = fps * rate; // frames per *video* second so that timestamps map to reference time
  const vf = [`fps=${videoFps}`];
  if (clip) vf.push(`crop=${Math.round(clip.width * scale)}:${Math.round(clip.height * scale)}:${Math.round(clip.x * scale)}:${Math.round(clip.y * scale)}`);
  ffmpeg(["-y", "-ss", triggerOffset.toFixed(3), "-i", join(out, "video.webm"), "-t", ((duration + preRoll) / rate / 1000).toFixed(3), "-vf", vf.join(","), join(framesDir, "%04d.png")], { quiet: true });
  const count = readdirSync(framesDir).filter((f) => f.endsWith(".png")).length;
  frames = { fps, count, playbackRate: rate, preRollMs: preRoll, triggerFrame: Math.round((preRoll / 1000) * fps), clip, viewport, scale, clock: "real", seed, note: "frame i is at t = i/fps seconds of reference time, with t=0 at preRoll before the trigger" };
  writeJson(join(out, "frames.json"), frames);
}

// normalise track time: t=0 at the trigger (for --trigger load, at the first animation frame of the document)
const t0 = perfAtTrigger ?? (track.length ? track[0].t : 0);
const trackOut = { selectors: trackSelectors, playbackRate: rate, note: "t in ms of reference time, 0 = trigger; negative samples are before it",
  samples: track.map((s: any) => ({ ...s, t: +((s.t - t0) * rate).toFixed(1) })) };
if (trackSelectors.length) writeJson(join(out, "track.json"), trackOut);
writeJson(join(out, "inspect.json"), inspect);
const glSummary = gl ? writeGlArtifacts(out, gl, t0, virtual ? 1 : rate) : null;
if (wantAssets) writeJson(join(out, "assets.json"), assetIndex.sort((x, y) => x.file.localeCompare(y.file)));
writeJson(join(out, "capture.json"), { url, out, viewport, scale, fps, rate, trigger, target, selector, clip, duration, preRoll, waitBefore, scrollTo: a["scroll-to"], track: trackSelectors,
  clock: virtual ? "virtual" : "real", seed, rafHz: virtual ? rafHz : undefined, gpu: gpuMode, renderer, gl: wantGl, capturedAt: new Date().toISOString() });

console.log(JSON.stringify({
  out, frames: frames && { count: frames.count, fps, triggerFrame: frames.triggerFrame, clip, clock: frames.clock },
  libs: inspect.libs, fonts: inspect.fonts.slice(0, 8), animations: inspect.animations.length, keyframes: inspect.keyframes.length,
  target: inspect.target, trackSamples: track.length, trackSelectors, renderer,
  gl: glSummary ?? undefined, assets: wantAssets ? assetIndex.length : undefined,
}, null, 2));
