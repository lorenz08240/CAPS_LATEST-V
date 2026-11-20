# Reading frames and writing the motion spec

The spec turns "I watched it" into rows you can check. Write it before building; update it when verification teaches you something; it is the first thing to show the user when they ask "does it match?".

## spec.md template

```markdown
# <name> motion spec

Target: <url + selector | file + time range>   Viewport: 1440x900   Fps: 25
Destination: <path/Component.tsx> (<stack: React + Framer Motion | CSS | GSAP …>)
Fidelity: motion-faithful | pixel-faithful | mixed (additions: …)
Reference capture: .reanimate/<name>/ref  (command: …)

## Structure (static)
| element | role / selector (ref → clone) | box at rest (x,y,w,h) | notes (overflow, z-index, origin, clip) |

## Timeline (t=0 is the trigger)
| # | element | property | from → to | start ms | duration ms | easing | stagger / repeat | source |
| 1 | h1 | opacity | 0 → 1 | 200 | 700 | cubic-bezier(.16,1,.3,1) | – | inspect.json |
| 2 | h1 | translateY | 40px → 0 | 200 | 700 | same | – | inspect.json |
| 2b | canvas card | three:Card.rotation.x | 0 → 0.26 rad | 30 | 630 | ease-in-out (lag 0.004/ms) | follows pointer | gl-track.json + easing.ts --channel |
| 3 | p | opacity, translateY | 0→1, 30px→0 | 400 | 700 | same | +200 ms after h1 | track.json + easing.ts |
| 4 | .cta | opacity, translateY | 0→1, 24px→0 | 600 | 600 | same | +200 ms | frames #15–#30 |

Trigger: load | enters viewport (threshold ~25 %) | hover | click | scroll-linked (0–600px) | loop every N ms
Total length: <ms>   Last visible change: <ms>

## Style facts needed for the motion (and everything, if pixel-faithful)
fonts, sizes, colours, radii, shadows, gaps, assets (with URLs or where copied)

## Additions (mixed only)
what is new, where it lives, how it is kept out of the compared region or why it does not affect timing
```

## Where the numbers come from

1. **`inspect.json › animations`** (websites with CSS/WAAPI motion): `timing.delay`, `timing.duration`, per-keyframe `easing`, `iterations`, `direction`. Transitions show up as `CSSTransition` with `transitionProperty`. Copy them.
2. **`track.json` + `easing.ts`** (websites, any technology): per element and property, prints delay, visible duration, overshoot and the best-fitting named easing with its fitted duration. Run it for every moving element and property (`translateY`, `opacity`, `scale`, `x`, `w`…). Overshoot > 2 % means a spring or a back easing; note the overshoot percentage and the settle time, the implementation notes say how to map them.
3. **`gl-track.json` + `easing.ts --channel`** (canvas, WebGL, 3D, captured with `--gl`): uniforms and scene-graph values (camera, object transforms, material uniforms) per rendered frame. `gl.ts summary` lists the animated ones by kind (`clock`, `transition`, `there-and-back`, `oscillation`, `steps`) with their change windows, and the fixed uniforms are constants to copy as they are. See `references/webgl.md`.
4. **Frames** (videos, gifs, and canvas when there is no trace): for each element find the first frame where it changes and the last frame where it changes; `start = first/fps`, `duration = (last − first + 1)/fps`. Judge the easing from where the midpoint lands: if the element has covered more than half of its distance at a third of the duration it is an ease-out; less than a quarter, an ease-in; symmetric, ease-in-out; constant steps, linear. Overshoot past the final position then return: back/spring. `compare.ts` prints an activity curve per set that shows these shapes as bars even without a track.
5. **Staggers**: the gap between the start frames of siblings. Note whether it is a constant (each +80 ms), grows (ease on the stagger), or is per-character/per-word (text reveals).

## Patterns worth recognising

Most landing-page motion is one of these; naming it saves rounds.

| Pattern | Tell-tale frames | Typical numbers |
|---|---|---|
| fade-up stagger | siblings rise 16–48 px while fading, each one slightly later | 500–800 ms, ease-out-expo/quint, stagger 60–150 ms |
| text reveal (lines, words, chars) | pieces appear in order, often clipped by their line box (`overflow: hidden` wrapper) | 600–1000 ms, per-piece stagger 20–50 ms |
| clip/mask reveal | content uncovers along an edge, no fade | 800–1200 ms, ease-in-out, `clip-path: inset()` |
| scale-in (modal, menu, card) | grows from 0.9–0.96 with a fade, transform-origin at the anchor | 150–250 ms, ease-out |
| hover lift | card moves up 2–8 px, shadow grows | 150–300 ms, ease-out; reverse uses a shorter or same time |
| marquee | continuous translateX of a duplicated row | linear, period 10–40 s, loops; measure the period, not the easing |
| scroll-linked | changes only while scrolling, stops when you stop | ties to `scrollY` ranges; read `track.json` scrollY vs value |
| pinned section | element stays fixed while the page scrolls past | track `y` stays constant for a scroll range |
| parallax | layers move at different fractions of the scroll delta | ratios like 0.2 / 0.5 / 1 |
| count-up / typewriter | numbers or characters change per frame | duration plus easing on the value |
| spring | overshoots then settles, sometimes twice | stiffness/damping; see implementation notes |
| loader / skeleton pulse | opacity or gradient position oscillates | period 1–2 s, ease-in-out, infinite alternate |
| page transition | old view exits, new view enters, often with a shared element | 300–600 ms, exit shorter than enter |
| shader clock | a canvas that never rests; a `clock` channel such as `u_time` | its rate (+1000/s = ms, +1/s = seconds) and the shader that uses it |
| uniform tween | a `transition` channel on a uniform (`u_hover`, `u_progress`) | duration and easing like any tween; the shader maps 0→1 to pixels |
| pointer lag (WebGL) | a value chasing the pointer, slower for longer moves | per-frame or per-ms rate `k`; `x += (target − x)·k` |
| keyframed model (glTF) | an `AnimationMixer` in `gl.ts summary` | clip name, duration, loop, timeScale: play the same clip |

## How to read a sheet

- Go row by row with the timestamp labels. Write down, per element, the frame it first moves and the frame it rests. Do this for every element, not just the biggest one.
- Compare consecutive frames: a big jump early then small changes = ease-out; small then big = ease-in.
- Look for things that are easy to miss: a backdrop that fades, a shadow that grows, letter-spacing that tightens, a blur that clears, a border that appears, an icon that rotates. They are part of the motion.
- Note what does **not** move. A clone that animates an element the reference keeps still fails just as much.
