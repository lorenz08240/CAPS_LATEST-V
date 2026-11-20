# Implementing the motion in the user's stack

Match what the project already uses. Adding GSAP to a project that animates with CSS, or Framer Motion to a Vue app, is a change the user did not ask for. Order of preference when nothing exists yet: CSS (keyframes/transitions, scroll-driven animations where supported) → Web Animations API → the framework's motion library (Framer Motion/`motion` for React, `@vueuse/motion` or GSAP for Vue, Svelte transitions) → GSAP for timelines with many dependencies.

## Easing equivalents

| Reference | CSS | Framer Motion / motion | GSAP |
|---|---|---|---|
| easeOutExpo `cubic-bezier(0.16,1,0.3,1)` | same | `ease: [0.16, 1, 0.3, 1]` | `"expo.out"` |
| easeOutQuint `cubic-bezier(0.22,1,0.36,1)` | same | `[0.22, 1, 0.36, 1]` | `"quint.out"` |
| easeOutCubic `cubic-bezier(0.33,1,0.68,1)` | same | `[0.33, 1, 0.68, 1]` or `"easeOut"` | `"power2.out"` |
| easeInOutCubic `cubic-bezier(0.65,0,0.35,1)` | same | `[0.65, 0, 0.35, 1]` | `"power2.inOut"` |
| material standard `cubic-bezier(0.4,0,0.2,1)` | same | `[0.4, 0, 0.2, 1]` | `"power1.inOut"` ≈ |
| easeOutBack `cubic-bezier(0.34,1.56,0.64,1)` | same | `[0.34, 1.56, 0.64, 1]` | `"back.out(1.7)"` |
| spring, overshoot ~10 %, settles in ~600 ms | `linear(...)` sampled curve, or WAAPI with sampled keyframes | `type: "spring", stiffness: 300, damping: 20` (less damping → more overshoot; lower stiffness → slower) | `"elastic.out(1, 0.5)"` or `gsap` + physics plugin |
| linear | `linear` | `"linear"` | `"none"` |

Spring tuning from measurements: overshoot ≈ `exp(−π ζ / sqrt(1 − ζ²))` where `ζ = damping / (2·sqrt(stiffness·mass))`. 10 % overshoot → ζ ≈ 0.59; 5 % → 0.69; 20 % → 0.46. Settle time ≈ `4 / (ζ·ω)` with `ω = sqrt(stiffness/mass)`. Start from `mass: 1`, pick ζ from the overshoot, then stiffness from the settle time, then verify with `easing.ts`.

## Patterns

**Fade-up stagger (CSS)**
```css
.item { opacity: 0; transform: translateY(32px); animation: up 700ms cubic-bezier(.16,1,.3,1) forwards; animation-delay: calc(var(--i) * 90ms + 200ms); }
@keyframes up { to { opacity: 1; transform: none; } }
```
Set `--i` per child (`style="--i: 2"`), or `:nth-child` rules. Keep `forwards` so the end state holds.

**Framer Motion stagger**
```tsx
const parent = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } } };
const child = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } };
<motion.ul variants={parent} initial="hidden" animate="show">{items.map(i => <motion.li key={i} variants={child} />)}</motion.ul>
```

**Enter-viewport trigger**: Framer `whileInView` + `viewport={{ once: true, amount: 0.25 }}`; plain JS `IntersectionObserver` with `threshold` set to the fraction visible when the reference starts (read `track.json`: the `y` of the element at the first moving sample over the viewport height). CSS scroll-driven: `animation-timeline: view(); animation-range: entry 0% entry 40%` where supported.

**Scroll-linked**: CSS `animation-timeline: scroll()` with `animation-range`, GSAP ScrollTrigger `scrub: true`, or Framer `useScroll` + `useTransform([0, 600], [0, -120])`. The mapping is scroll px → value, take the two endpoints from the track.

**Text reveal by line/word**: split into spans with an `overflow: hidden` wrapper per line, animate `translateY(110%) → 0`. Keep accessible text intact (`aria-label` on the container, `aria-hidden` on the spans).

**Hover lift**: `transition: transform 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms` on the card; animate `transform`, not `top`. Reverse often uses the same timing; check the reference's hover-out frames too.

**Marquee**: duplicate the content once, `animation: scroll Ns linear infinite` from `translateX(0)` to `translateX(-50%)`. `N` is the measured period. Pause on hover only if the reference does.

**Clip/mask reveal**: `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`, or `mask-image` with an animated gradient position.

**Loops and idle**: `animation-iteration-count: infinite; animation-direction: alternate` for pulses; measure one period from the activity curve.

**Canvas, WebGL, 3D**: rebuild from the trace, not from the pixels (`references/webgl.md › Building`). Use the same engine and version, renderer settings and context attributes, port the user-authored shaders with their fixed uniforms, map the traced blend state to the material, and drive each animated uniform with the timing and easing its channel showed. A per-frame lag `x += (target − x) · k` stays frame-rate independent as `x += (target − x) · (1 − (1 − k) ** (dt / 16.67))`.

## Details that make or break the match

- `transform-origin`: scale-ins grow from the anchor (a menu from its button corner, a modal from centre). Read `nodes › transform-origin` in `inspect.json` if it was non-default.
- `will-change: transform` or `translateZ(0)` on elements the reference composites, to avoid jank in the comparison video.
- `overflow: hidden` wrappers decide whether a sliding element is clipped or visible outside its box; copy them.
- Order of transforms: `translate() scale()` ≠ `scale() translate()`. Use individual properties (`translate`, `scale`, `rotate`) when the stack allows it.
- Fill mode and initial state: render the pre-motion state in CSS (opacity 0 etc.) so the first frame already matches; avoid a flash of the final state before JS runs.
- `prefers-reduced-motion`: wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)` or Framer `useReducedMotion()`; if the reference ignores it, still add it unless the user says not to, and mention it.
- Fonts (pixel-faithful): load the same family and weights listed in `inspect.json › fonts` before capturing the clone (`document.fonts.ready`), otherwise every frame mismatches.
