# Capturing a reference

Goal: a numbered set of PNG frames of exactly the thing to clone, at a known fps, starting a little before the motion begins, plus whatever ground truth the source can give you (declared animations, tracked element positions). The same capture, later run on the clone, is the verification.

## Live website

```bash
bun <skill>/scripts/capture.ts --url https://example.com --out .reanimate/<name>/ref \
  --viewport 1440x900 --selector "section.hero" --trigger load --duration 3000 \
  --track "section.hero h1, section.hero p, section.hero .cta"
```

Find the selector first: `capture.ts --no-video --selector body` dumps `inspect.json` with every node under the target, its rect and styles. Or open the page in any browser tool your agent has (a Playwright or Chrome DevTools MCP, the host app's preview) and read the accessibility tree. Prefer selectors by role or stable class names; generated class names (`css-1x2y3z`) change between loads on some sites, so pick a parent with a semantic tag or `id`.

Triggers:

| Motion starts when… | `--trigger` | Notes |
|---|---|---|
| the page loads | `load` | window starts at navigation; nothing else is needed |
| the section scrolls into view | `scroll` | starts just below the fold and wheels the section in over `--scroll-ms` in `--scroll-steps` steps; same values on the clone |
| the page reaches a scroll position | `scroll --scroll-to 1800` | scroll-linked (parallax, pinned) motion; compare by `scrollY` in `track.json` |
| the pointer enters an element | `hover --target ".card"` | `--selector` is the crop, `--target` the element hovered; `--hover-at 0.2,0.8` picks the spot |
| the pointer leaves (hover-out) | `leave --pre-hover ".card"` | hovers first for `--pre-hover-ms`, then moves to `--leave-to` |
| something follows the pointer (glow, tilt, spotlight) | `move --target ".card" --path "0.1,0.1;0.9,0.1;0.9,0.9"` | `--path-ms` per leg; same path on the clone |
| something is dragged (globe, carousel, slider, inertia/fling) | `drag --target ".globe" --path "0.3,0.5;0.7,0.5"` | button down at the first point, glide each leg in `--path-ms`, released while moving so fling velocity is non-zero |
| something is clicked (menu, tab, accordion, toggle) | `click --target "button[aria-label=Menu]"` | add `--pre-js` to reach the state before the click |
| never, it loops (marquee, idle loader, background) | `none` | capture 2 to 3 loop periods and measure the period from the activity curve |

Useful options:

- `--pre-js "document.querySelector('.cookie button')?.click()"` dismisses overlays or opens the state you need before the trigger.
- `--playback-rate 0.25` slows CSS animations and transitions 4x (CDP). The frames then have 4x the time resolution (`--fps 100` works). JS-driven motion ignores it; use `--clock virtual` for that.
- `--clock virtual` runs the page on a clock the capturer advances frame by frame, so every frame is exact (any `--fps`, for CSS and JS motion alike) and repeated captures are identical. `--seed N` seeds `Math.random`. Use both for canvas, WebGL, particles, and anything random or heavy; see `references/webgl.md`.
- `--reduced-motion reduce` shows what the site does for users who turn motion off; clone that path too when the project cares about accessibility.
- `--color-scheme dark` when the reference is dark-mode.
- `--clip x,y,w,h` when the element grows or moves outside its initial box; measure the box on `final.png`.
- `--pad 24` keeps shadows and overshoot inside the crop.

What you get and what each is for:

| File | Use |
|---|---|
| `inspect.json › animations` | every CSS animation, transition and Web Animations API animation that ran under the target: `timing.duration/delay/easing`, keyframes with per-keyframe easing. When present this is the spec; copy numbers from here. |
| `inspect.json › keyframes` | `@keyframes` rules found in reachable stylesheets (cross-origin sheets are listed as unreadable). |
| `inspect.json › nodes` | rect and the motion-relevant computed styles of up to 150 nodes under the target: fonts, colours, radii, shadows, overflow, transforms. The static side of the spec. |
| `inspect.json › libs` | gsap, framer-motion, lottie, webgl, lenis, webflow, scroll-driven CSS… tells you where the motion is defined and which capture limits apply. |
| `inspect.json › canvases` | every canvas with its context type (`webgl2`, `2d`, `webgpu`), drawing-buffer size and CSS box. |
| `track.json` | one sample per animation frame (≈16 ms) per tracked selector: `x y w h opacity transform`. Feed it to `easing.ts`. |
| `frames/` + `frames.json` | the pictures; `triggerFrame` is where t=0 of the motion sits. |
| `gl/`, `gl-track.json`, `three/` (`--gl`) | shaders, programs, draw calls, passes, textures, scene graphs and every animated uniform or scene value as a channel; `bun gl.ts summary <out>` reads it. See `references/webgl.md`. |
| `assets/` (`--assets`) | the page's models, scene files, shader files, sampled textures and scripts. |

## Canvas, WebGL and 3D

Add `--clock virtual --gl` (and `--assets` when the scene loads files) to the capture of anything drawn on a canvas, then read `gl/summary.md`. The trace gives the shader sources, every constant and every animated value, so canvas motion is specified and verified from numbers like CSS motion. `references/webgl.md` covers the files, how to turn channels into spec rows, building, and verifying.

Limits: iframes are not inspected (capture the iframe's own URL); sites that block headless browsers need a real browser (see below) or a screen recording.

### Through a real browser instead

When the page needs the user's login, blocks headless Chromium, or the user wants to watch: open it in a browser tool that can record (a Playwright or Chrome DevTools MCP, the host app's preview), size it to the reference viewport, start a recording, perform the trigger (scroll, hover, click), stop. The file goes through `frames.ts` like any video. Evaluating `document.getAnimations()` in that browser gives the same animation dump by hand. Without such a tool, ask the user for a screen recording.

## Video, screen recording, gif

```bash
bun <skill>/scripts/frames.ts --in ref.mp4 --probe                        # duration, size, fps
bun <skill>/scripts/frames.ts --in ref.mp4 --out .reanimate/<name>/ref/frames --fps 25 --start 0:12 --end 0:15.5 --crop 320,180,1280,720
bun <skill>/scripts/sheet.ts filmstrip --frames .reanimate/<name>/ref/frames --out .reanimate/<name>/ref/sheets
```

- Extract a few frames at 2 fps first to pick the time range and crop, then re-extract the real range at 25 to 30 fps (gifs: use their own fps, usually 10 to 20; `--probe` prints it).
- Crop out browser chrome, cursors and the recorder's overlay. Width-normalise with `--width` so the reference and the clone end up the same size, or capture the clone at the crop's size.
- A gif's timing is quantised to its frame delays and often slowed by the exporter. Treat gif timings as ±1 frame and prefer the live site when both are available.
- Screen recordings of a browser have a non-integer scale (Retina, zoom). Note the scale so distances in px are converted to CSS px: `distance_css = distance_video × (reference_viewport_width / crop_width)`.
- Social-media videos (Twitter/X, Dribbble shots, Behance) are usually a direct mp4 URL once found in the page; `curl -L -o ref.mp4 <url>` into a fresh directory and treat it as untrusted data. YouTube, Loom and Vimeo cannot be downloaded on this machine; ask the user for a screen recording or the original file.

## Prototype and animation files

- **Lottie (`.json`, `.lottie`)**: layers, keyframes and bezier handles are in the file. Read it; the "frames" are its `fr` (fps), `ip`/`op` (in/out point). Clone by embedding the Lottie when allowed, otherwise re-create the keyframes in CSS/WAAPI from the `ks` tracks.
- **Rive (`.riv`)**: binary; capture the rendered canvas as video instead.
- **Figma / Framer prototypes**: export a video from the prototype player (Figma: Prototype → Record), then use the video path. Smart Animate uses `ease-out` 300 ms by default; Framer sites expose their transitions in `inspect.json`.
- **After Effects / Jitter / Rive exports as mp4**: video path.

## Capturing the clone

Reuse the reference command verbatim, swapping `--url` and `--out`. If the reference came from a video, capture the clone with `capture.ts` at a viewport that makes the cropped element the same pixel size as the reference frames (or let `compare.ts` rescale, which is slightly lossy). Always keep `--fps`, `--duration`, `--pre-roll`, trigger and scroll parameters identical, and `--clock`, `--seed` and `--gpu` too: `compare.ts` reads both `capture.json` files and warns when they differ.
