// Fit a recorded motion curve to known easings and report duration, delay and overshoot.
// Input: a track.json from capture.ts (choose selector + property) or a plain JSON array of [t_ms, value].
// Usage: bun easing.ts --track <track.json> --selector ".hero h1" --prop y
//        bun easing.ts --series '[[0,0],[100,12],[200,40],...]'
import { readJson, parseArgs, usage, num } from "./lib.ts";

const HELP = `
easing.ts — which easing is this?

  bun easing.ts --track <track.json> --selector <css> --prop <x|y|w|h|opacity|scale|translateX|translateY|rotate> [--from-ms T --to-ms T]
  bun easing.ts --series '[[t_ms, value], ...]'
  bun easing.ts --track <track.json> --selector <css> --prop y --compare-track <other.json>   # also diffs two tracks
  bun easing.ts --track <gl-track.json> --channel <key> [--compare-track <other gl-track.json> --compare-channel <key>]
                # a uniform, camera, object or material value from capture.ts --gl (key or its unique ending, e.g. uHover)

Prints: start/end values, delay (first change), duration (first → last change), overshoot, and the best-fitting
named easings with their RMSE. Use the top match as the CSS/Framer/GSAP easing in the clone, then re-run on the
clone's track to confirm the curve matches.
`;

const a = parseArgs(process.argv.slice(2));
if (a.help || (!a.track && !a.series)) usage(HELP);

function matrixPart(transform: string): { tx: number; ty: number; sx: number; sy: number; rot: number } {
  if (!transform || transform === "none") return { tx: 0, ty: 0, sx: 1, sy: 1, rot: 0 };
  const m = transform.match(/matrix(3d)?\(([^)]+)\)/);
  if (!m) return { tx: 0, ty: 0, sx: 1, sy: 1, rot: 0 };
  const v = m[2].split(",").map(Number);
  if (m[1]) return { tx: v[12], ty: v[13], sx: Math.hypot(v[0], v[1]), sy: Math.hypot(v[4], v[5]), rot: (Math.atan2(v[1], v[0]) * 180) / Math.PI };
  return { tx: v[4], ty: v[5], sx: Math.hypot(v[0], v[1]), sy: Math.hypot(v[2], v[3]), rot: (Math.atan2(v[1], v[0]) * 180) / Math.PI };
}

// gl-track.json channels: exact key, or a unique key ending in ".<name>" / "<name>"
function resolveChannel(t: any, name: string): string {
  if (t.channels[name]) return name;
  const keys = Object.keys(t.channels).filter((k) => k.endsWith("." + name) || k.endsWith(name));
  if (keys.length === 1) return keys[0];
  throw new Error(keys.length ? `channel "${name}" is ambiguous: ${keys.slice(0, 12).join(", ")}` : `no animated channel "${name}" (bun gl.ts channels <dir> lists them; constants are in gl/gl.json)`);
}

function seriesFromTrack(path: string, selector: string, prop: string, channel?: string): [number, number][] {
  const t = readJson(path);
  const outS: [number, number][] = [];
  if (t.kind === "gl-track") {
    if (!channel) throw new Error("this is a gl-track.json: pass --channel <key>");
    const k = resolveChannel(t, channel);
    for (const s of t.samples) if (s.v[k] !== undefined) outS.push([s.t, s.v[k]]);
    return outS;
  }
  for (const s of t.samples) {
    const e = s.els?.[selector];
    if (!e) continue;
    const mp = matrixPart(e.transform);
    const v: Record<string, number> = { x: e.x, y: e.y, w: e.w, h: e.h, opacity: e.opacity, translateX: mp.tx, translateY: mp.ty, scale: mp.sx, scaleX: mp.sx, scaleY: mp.sy, rotate: mp.rot };
    if (!(prop in v)) throw new Error(`unknown prop ${prop}; use one of ${Object.keys(v).join(", ")}`);
    outS.push([s.t, v[prop]]);
  }
  return outS;
}

let series: [number, number][] = a.series ? JSON.parse(String(a.series)) : seriesFromTrack(String(a.track), String(a.selector), String(a.prop || "y"), a.channel ? String(a.channel) : undefined);
const fromMs = num(a["from-ms"], -Infinity), toMs = num(a["to-ms"], Infinity);
series = series.filter(([t]) => t >= fromMs && t <= toMs);
if (series.length < 4) { console.log("not enough samples (element missing from track, or window too narrow)"); process.exit(1); }

// bezier easings (CSS cubic-bezier) and a few others, sampled numerically
const bez = (x1: number, y1: number, x2: number, y2: number) => (t: number) => {
  // solve x(u)=t for u by bisection, return y(u)
  let lo = 0, hi = 1, u = t;
  for (let i = 0; i < 30; i++) { u = (lo + hi) / 2; const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u ** 2 * x2 + u ** 3; if (x < t) lo = u; else hi = u; }
  return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3;
};
const EASINGS: Record<string, (t: number) => number> = {
  "linear": (t) => t,
  "ease": bez(0.25, 0.1, 0.25, 1), "ease-in": bez(0.42, 0, 1, 1), "ease-out": bez(0, 0, 0.58, 1), "ease-in-out": bez(0.42, 0, 0.58, 1),
  "cubic-bezier(0.4,0,0.2,1) material standard": bez(0.4, 0, 0.2, 1),
  "cubic-bezier(0.2,0,0,1) material emphasized": bez(0.2, 0, 0, 1),
  "cubic-bezier(0.16,1,0.3,1) easeOutExpo": bez(0.16, 1, 0.3, 1),
  "cubic-bezier(0.22,1,0.36,1) easeOutQuint": bez(0.22, 1, 0.36, 1),
  "cubic-bezier(0.33,1,0.68,1) easeOutCubic": bez(0.33, 1, 0.68, 1),
  "cubic-bezier(0.25,1,0.5,1) easeOutQuart": bez(0.25, 1, 0.5, 1),
  "cubic-bezier(0.5,1,0.89,1) easeOutQuad": bez(0.5, 1, 0.89, 1),
  "cubic-bezier(0.65,0,0.35,1) easeInOutCubic": bez(0.65, 0, 0.35, 1),
  "cubic-bezier(0.83,0,0.17,1) easeInOutQuint": bez(0.83, 0, 0.17, 1),
  "cubic-bezier(0.87,0,0.13,1) easeInOutExpo": bez(0.87, 0, 0.13, 1),
  "cubic-bezier(0.76,0,0.24,1) easeInOutQuart": bez(0.76, 0, 0.24, 1),
  "cubic-bezier(0.45,0,0.55,1) easeInOutQuad": bez(0.45, 0, 0.55, 1),
  "cubic-bezier(0.32,0,0.67,0) easeInCubic": bez(0.32, 0, 0.67, 0),
  "cubic-bezier(0.7,0,0.84,0) easeInExpo": bez(0.7, 0, 0.84, 0),
  "cubic-bezier(0.34,1.56,0.64,1) easeOutBack": bez(0.34, 1.56, 0.64, 1),
  "cubic-bezier(0.68,-0.6,0.32,1.6) easeInOutBack": bez(0.68, -0.6, 0.32, 1.6),
  "cubic-bezier(0.19,1,0.22,1) 'expo' (common in landing pages)": bez(0.19, 1, 0.22, 1),
  "cubic-bezier(0.77,0,0.175,1) 'power3.inOut' (gsap)": bez(0.77, 0, 0.175, 1),
  "cubic-bezier(0.075,0.82,0.165,1) easeOutCirc": bez(0.075, 0.82, 0.165, 1),
  "cubic-bezier(0.23,1,0.32,1) ease-out-quint variant": bez(0.23, 1, 0.32, 1),
};

const t0 = series[0][0];
const start = series[0][1], end = series[series.length - 1][1];
const range = end - start;
const eps = Math.max(Math.abs(range) * 0.01, 0.002);
let firstChange = series.findIndex(([, v]) => Math.abs(v - start) > eps);
let lastChange = series.length - 1;
for (let i = series.length - 1; i > 0; i--) if (Math.abs(series[i][1] - end) > eps) { lastChange = Math.min(series.length - 1, i + 1); break; }
if (firstChange < 1) firstChange = 1;
const delayMs = series[firstChange - 1][0] - t0;
const durMs = series[lastChange][0] - series[firstChange - 1][0];
const extremes = series.map(([, v]) => v);
const overshoot = range === 0 ? 0 : Math.max(0, (Math.max(...extremes.map((v) => (v - start) * Math.sign(range))) - Math.abs(range)) / Math.abs(range));

// Fit each easing with the duration as a free parameter (1x..2x the visible duration): expo-style curves have
// long tails that fall under the 1% change floor, so the declared duration is often longer than the visible one.
const fits: { name: string; rmse: number; durationMs: number }[] = [];
if (Math.abs(range) > 0 && durMs > 0) {
  const base = series[firstChange - 1][0];
  const raw = series.slice(firstChange - 1).map(([t, v]) => [t - base, (v - start) / range] as [number, number]);
  for (const [name, fn] of Object.entries(EASINGS)) {
    let best = { rmse: Infinity, durationMs: durMs };
    for (let k = 1; k <= 2.0001; k += 0.05) {
      const d = durMs * k;
      const pts = raw.filter(([t]) => t <= d * 1.05);
      const err = Math.sqrt(pts.reduce((s, [t, y]) => s + (fn(Math.min(1, Math.max(0, t / d))) - y) ** 2, 0) / pts.length);
      if (err < best.rmse) best = { rmse: err, durationMs: Math.round(d) };
    }
    fits.push({ name, rmse: +best.rmse.toFixed(4), durationMs: best.durationMs });
  }
  fits.sort((x, y) => x.rmse - y.rmse);
}

const result = {
  samples: series.length, start: +start.toFixed(3), end: +end.toFixed(3), change: +range.toFixed(3),
  delayMs: +delayMs.toFixed(0), visibleDurationMs: +durMs.toFixed(0), overshootPct: +(overshoot * 100).toFixed(1),
  verdict: overshoot > 0.02 ? "spring-like / back easing (overshoots)" : fits[0] ? `${fits[0].name} over ~${fits[0].durationMs}ms${fits[0].rmse < 0.03 ? " (good fit)" : fits[0].rmse < 0.08 ? " (approximate)" : " (poor fit: maybe multi-step, spring, or scroll-linked)"}` : "no motion",
  note: "visibleDurationMs = time until within 1% of the final value; durationMs in bestFits is the fitted declared duration",
  bestFits: fits.slice(0, 5),
};

if (a["compare-track"]) {
  const other = seriesFromTrack(String(a["compare-track"]), String(a.selector), String(a.prop || "y"), a["compare-channel"] ? String(a["compare-channel"]) : a.channel ? String(a.channel) : undefined);
  // both tracks have t=0 at their trigger, so compare at the same t (not from each track's first sample)
  const at = (s: [number, number][], t: number) => { let best = s[0]; for (const p of s) if (Math.abs(p[0] - t) < Math.abs(best[0] - t)) best = p; return best[1]; };
  const diffs = series.map(([t, v]) => +(at(other, t) - v).toFixed(2));
  (result as any).compare = { otherSamples: other.length, maxAbsDiff: Math.max(...diffs.map(Math.abs)), meanAbsDiff: +(diffs.reduce((s, d) => s + Math.abs(d), 0) / diffs.length).toFixed(2), sampledDiffs: diffs.filter((_, i) => i % Math.ceil(diffs.length / 20) === 0) };
}
console.log(JSON.stringify(result, null, 2));
