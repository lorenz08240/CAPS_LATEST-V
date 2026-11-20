// The stage every video page shares: a 1920x1080 frame drawn from the time alone. `start` mounts the
// scenes and puts `window.__video` on the page for scripts/render.ts; without ?render it adds a player:
// space plays and pauses, ←/→ step a frame (shift: a second), ?t=12.5 starts there.
import { FPS, H, W, setManifest, settleImages, show } from "./lib.js";

/**
 * scenes: modules with `name`, `from`, `to`, `init(root)`, `render(t)` and optionally `shift`, a delay that
 * lets a scene keep its own clock. fonts: font shorthands to load before anything is measured.
 */
export async function start({ scenes, duration, fonts }) {
  const roots = new Map();
  const stage = document.getElementById("stage");

  const draw = (t) => {
    for (const s of scenes) {
      const lt = t - (s.shift ?? 0);
      const on = lt >= s.from && lt < s.to;
      show(roots.get(s), on);
      if (on) s.render(lt);
    }
  };

  await Promise.all(fonts.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  setManifest(await (await fetch("clips/manifest.json")).json());
  for (const s of scenes) {
    const root = document.createElement("section");
    root.className = `scene scene--${s.name}`;
    stage.append(root);
    roots.set(s, root);
    s.init(root);
  }
  window.__video = {
    duration,
    fps: FPS,
    size: [W, H],
    async seek(t) {
      draw(t);
      await settleImages();
    },
  };
  if (document.documentElement.hasAttribute("data-render")) draw(0);
  else player(stage, draw, duration);
}

function player(stage, draw, duration) {
  const scrub = document.getElementById("scrub");
  const time = document.getElementById("time");
  const play = document.getElementById("play");
  const viewport = document.getElementById("viewport");
  let t = Number(new URLSearchParams(location.search).get("t") || 0);
  scrub.max = String(duration);

  const fit = () => {
    const k = Math.min(innerWidth / W, (innerHeight - 56) / H);
    stage.style.transform = `scale(${k})`;
    viewport.style.width = `${W * k}px`;
    viewport.style.height = `${H * k}px`;
  };
  fit();
  addEventListener("resize", fit);

  const paint = () => {
    draw(t);
    scrub.value = String(t);
    time.textContent = t.toFixed(2);
  };
  // playing: the video time runs with the wall clock from the moment play was pressed (or the last seek)
  let playing = false, wall0 = 0, t0 = 0;
  const loop = (now) => {
    if (!playing) return;
    t = Math.min(duration, t0 + (now - wall0) / 1000);
    if (t >= duration) playing = false;
    play.textContent = playing ? "Pause" : "Play";
    paint();
    requestAnimationFrame(loop);
  };
  const toggle = () => {
    playing = !playing;
    if (playing) {
      if (t >= duration - 0.05) t = 0;
      wall0 = performance.now();
      t0 = t;
      requestAnimationFrame(loop);
    }
    play.textContent = playing ? "Pause" : "Play";
    paint();
  };
  const seek = (to) => {
    t = Math.min(duration, Math.max(0, to));
    wall0 = performance.now();
    t0 = t;
    paint();
  };
  play.addEventListener("click", toggle);
  scrub.addEventListener("input", () => seek(Number(scrub.value)));
  addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      toggle();
    }
    if (e.code === "ArrowRight") seek(t + (e.shiftKey ? 1 : 1 / FPS));
    if (e.code === "ArrowLeft") seek(t - (e.shiftKey ? 1 : 1 / FPS));
  });
  paint();
}
