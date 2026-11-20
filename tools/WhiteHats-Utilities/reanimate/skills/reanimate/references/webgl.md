# Canvas, WebGL and 3D

A canvas only shows pixels, but everything that made them went through a few hundred API calls: shader sources, uniform values, draw calls, textures, a scene graph. `capture.ts --gl` records those calls, and `--clock virtual` makes the recording repeatable frame for frame. Together they turn a WebGL scene into the same kind of evidence a CSS animation gives you: exact constants to copy, curves to fit, and a comparison that can fail.

## Capture

```bash
bun <skill>/scripts/capture.ts --url https://example.com --out .reanimate/<name>/ref \
  --viewport 1440x900 --selector ".hero" --trigger move --target ".hero canvas" --path "0.5,0.5;0.2,0.3;0.8,0.7" \
  --duration 3000 --clock virtual --gl --assets
bun <skill>/scripts/gl.ts summary .reanimate/<name>/ref
```

| Flag | What it does | When |
|---|---|---|
| `--clock virtual` | The page runs on a clock the capturer advances: `performance.now`, `Date`, timers, `requestAnimationFrame` (a steady 60 Hz, `--raf-hz`), CSS / WAAPI animations, `<video>`, `Event.timeStamp`. Each frame is screenshotted at exactly t = k/fps however long it took to render, the network and workers look instant, and two captures of the same page are byte-identical. | Always, for canvas and WebGL. It also helps any JS-driven motion. |
| `--seed N` | Seeds `Math.random` in the page and its workers (default 1 with the virtual clock). The same seed gives the same particles, arcs and noise. | Random content. Use the same seed for reference and clone. |
| `--gl` | Traces WebGL 1/2, WebGPU, canvas 2D and the scene graphs of three.js, Pixi, PlayCanvas, Babylon and OGL, including OffscreenCanvas in workers. | Any canvas. |
| `--gl-buffers 16` | Also dumps vertex and index buffers (first upload, up to 16 MB). | Particles and point clouds whose positions you want exactly. |
| `--assets` | Saves models (glb, gltf, hdr, ktx2, drc, usdz, splat…), Spline, Rive, Lottie and Unicorn Studio files, shader files, the textures the GPU sampled (by URL) and every script. | Scenes built from files; finding the code that drives a channel. |
| `--gpu hardware` | Real GPU instead of SwiftShader (macOS: ANGLE/Metal, about 10× faster; Linux: Vulkan, needs drivers, untested here) and WebGPU enabled. | WebGPU pages, heavy scenes. Capture reference and clone with the same mode; `compare.ts` warns otherwise. |

Without `--clock virtual`, a heavy scene in software GL drops frames and its timing drifts. Random content then differs on every load, so you can only judge it against a second recording of the reference.

## What you get

| File | Read it for |
|---|---|
| `gl/summary.md` | Start here. Canvases (size, CSS size, pixel ratio, `antialias` / `alpha` / `premultipliedAlpha`), engine and version, renderer settings, scene tree, every drawn program with its fixed and animated uniforms and attributes, one frame's passes per canvas, textures, and animated channels. |
| `gl/shaders/` | The GLSL of every program as compiled (`p3-<label>.vert/.frag`) and WGSL modules (`m12-….wgsl`). For three.js these include three's injected prefix (`#define`s, built-in uniforms and attributes); the clean `vertexShader` / `fragmentShader` are in `three/scene-N.json`. |
| `gl/gl.json` | Everything in the summary in full: uniform types and final values, attribute layouts (buffer, size, type, stride, divisor), blend / depth / cull state, textures with source URL, framebuffers and the textures they write, three.js renderer settings, `AnimationMixer` clips with keyframes, loader URLs, the canvas 2D files. `constants` holds every uniform and scene value that never changed. |
| `gl-track.json` | One sample per rendered frame with every value that changed: uniforms (`p3:ShaderMaterial.u_progress`, vectors as `.x .y .z .w`, matrices as `[i]`), scene graph values (`three:s0/Card#12.rotation.x`, `three:s0/mat:ShaderMaterial#8.u_hover`, `pixi:…`, `babylon:…`, `playcanvas:…`, `ogl:…`) and WebGPU uniform buffer floats (`gpu:gb3@0[4]`). `channels` gives each one's kind, range and change window. |
| `gl/draws.json` | Every draw call of every frame: program, primitive, count, instances, target framebuffer, bound textures, state. Use it to see render cadence (every frame or every other frame) and pass order. |
| `three/scene-N.json` | The whole three.js scene in three's JSON format, with geometry, materials (ShaderMaterial source and uniforms) and embedded images. `new THREE.ObjectLoader().parse(json)` loads it back. |
| `gl/buffers/`, `gl/textures/` | Buffer dumps (`b7.Float32.bin`) and canvas-generated textures as PNG. |
| `gl/canvas2d-c1.txt` | Canvas 2D: the full call list of every 15th frame (`arc(172.3, 132.5, 8, 0, 6.283)`, `fillStyle=(hsl(30 80% 60%))`), with call counts per frame in `draws.json`. |
| `assets/` + `assets.json` | The files above, named by URL hash. |

## Reading the trace into the spec

Spec rows come from channels the same way DOM rows come from `track.json`:

| Channel kind | Means | Spec row |
|---|---|---|
| `clock` | Moves at a constant rate the whole time, e.g. `u_time` +1000/s or a rotation +0.3 rad/s | "drive `u_time` with elapsed ms" plus the rate; nothing to ease |
| `transition` | Goes from one rest value to another | from → to, start, duration, easing: `easing.ts --track gl-track.json --channel <key>` |
| `there-and-back` | Rises and falls once, as on hover in and out or a pointer pass | split at the turn and fit each half with `--from-ms` / `--to-ms` |
| `oscillation` | Repeats, with `periodMs` | period, amplitude, waveform (read the shader or script) |
| `steps` | A few jumps | the values and when they happen (state machines, timelines) |

- **Fixed uniforms are constants to copy, not guess**: `u_twistFrequencyX=0.059`, `u_glowAmount=3.86`, and `u_resolution` (which tells you the drawing-buffer size the shader expects).
- **Find the code that drives a channel**: `grep -l u_scatterPower assets/scripts/*` and read around it. Bundled code keeps uniform names and constants even when everything else is minified.
- **Pointer-follow motion** in WebGL is usually a lag, `x += (target − x) · k` per frame or `1 − exp(−rate·dt)` per ms. It looks like an ease-out whose length depends on how far the pointer moved. Fit it with `easing.ts` over a single pointer leg. If `k` is per frame, the motion depends on frame rate, which `--raf-hz` controls.
- **Render cadence**: a program at 0.5 draws per frame renders every other frame. Copy it, because it changes how lagged and stepped motion looks.
- **Passes**: `framebuffer f4 → texture t5` followed by a screen pass sampling `t5` is a post-processing chain. Rebuild it as render targets, or as an `EffectComposer` / pass chain in the stack you use.
- **Glb / gltf scenes with an `AnimationMixer`**: the clip is the spec, as with Lottie. Load the same file from `assets/models/` and play the clip names, `timeScale`, loop mode and weights shown in the summary.
- **Spline, Rive, Unicorn Studio and Lottie on canvas**: the scene file is the spec. Embed the runtime when the licence allows. Otherwise rebuild from the file.

## Building

- **Same engine and version** when the user's stack allows (`three.js r178` in the summary). three.js changed colour management in r152 (`outputColorSpace`, sRGB textures) and lighting units in r155, so a different revision changes colours even with identical shaders. Copy `outputColorSpace`, `toneMapping`, `toneMappingExposure`, clear colour and alpha, and `autoClear` from the summary.
- **Canvas setup**: copy the context attributes (`antialias`, `alpha`, `premultipliedAlpha`) and the pixel ratio. A ratio of 1 on a 2x screen means the site caps it (`setPixelRatio(Math.min(devicePixelRatio, …))`).
- **Shaders**: port the user-authored part. For three.js that is `vertexShader` / `fragmentShader` in `three/scene-N.json`. For raw WebGL, regl or OGL it is the source in `gl/shaders/` as it is. Keep uniform names unless the project has a convention, since `gl.ts compare` matches channels by name (`--map` otherwise).
- **Blend state → three.js material**:

  | traced state | three.js |
  |---|---|
  | `blend SRC_ALPHA,ONE_MINUS_SRC_ALPHA,ONE,ONE_MINUS_SRC_ALPHA` | `NormalBlending` (default, `transparent: true`) |
  | `blend ONE,ONE_MINUS_SRC_ALPHA,ONE,ONE_MINUS_SRC_ALPHA` | `NormalBlending` with `premultipliedAlpha: true` |
  | `blend SRC_ALPHA,ONE,ONE,ONE` / `blend ONE,ONE` | `AdditiveBlending` (straight / premultiplied) |
  | `blend DST_COLOR,ONE_MINUS_SRC_ALPHA,ZERO,ONE` | `MultiplyBlending` with `premultipliedAlpha: true` |
  | anything else | `CustomBlending` with `blendSrc` / `blendDst` / `blendSrcAlpha` / `blendDstAlpha` / `blendEquation` |
  | `no-blend`, `no-depth-write`, `cull` | `transparent: false` or `NoBlending`, `depthWrite: false`, `side: FrontSide` |

- **Geometry**: `PlaneGeometry{…}` and `SphereGeometry{radius, widthSegments…}` give constructor parameters. Custom `BufferGeometry` gives its attribute names and vertex count; dump it with `--gl-buffers` when it is data (point clouds) rather than code.
- **Randomness**: port the generator with its calls in the same order and both pages see the same seeded `Math.random`, so particles land in the same places. When that isn't possible, load the dumped buffer for verification only, or judge with `compare.ts --blur`.
- **Frame-rate independence**: when the reference lerps per frame, keep the per-frame constant at 60 Hz, or convert it to `1 − (1 − k)^(dt / 16.67)` and say so in the report.

## Verifying

Capture the clone with the reference command, changing only `--url` and `--out`, then:

```bash
bun <skill>/scripts/compare.ts --ref ref/frames --clone clone-1/frames --out compare-1           # pixels and timing
bun <skill>/scripts/gl.ts compare --ref ref --clone clone-1 --grep "<canvas or scene filter>"    # canvas settings, draw structure, every channel
bun <skill>/scripts/easing.ts --track clone-1/gl-track.json --channel u_hover --compare-track ref/gl-track.json
```

- With `--clock virtual` the reference's noise floor is 0 %: two captures are identical, so every mismatch is the clone's.
- `gl.ts compare` fails a channel when its start or end is more than 80 ms off, its kind differs, or its mean error is over 5 % of the reference's range. It also lists canvas attribute, renderer setting and draw-structure differences: a missing pass, a different primitive count, a blend mode, a render cadence.
- When the content is stochastic and you did not port the generator, `compare.ts --blur 4` compares density, colour and motion, not dot positions. Report both numbers, sharp and blurred.

## Limits that remain

- Workers are seeded and traced (OffscreenCanvas included), but their clocks run in real time and workers started by workers are not reached. Main-thread waits on worker replies are still made deterministic.
- Canvases inside iframes are recorded in their frame but not exported. Capture the iframe's URL directly.
- WebGPU uniforms are raw buffer floats (`gpu:gb3@0[4]`) without names. Match them to WGSL struct fields by offset.
- Compute passes and GPU-side simulation (particles advanced in a shader) show up as their inputs only (uniforms and buffers). The motion lives in the shader you copy.
- Spector.js (`captureCanvas()` returns a JSON of one frame with full state per call) complements this for single-frame deep dives. The trace here is built for motion over time.
- Shaders, models and textures belong to their authors, like fonts and images. Read them to understand the effect, and copy them only when the user may.
