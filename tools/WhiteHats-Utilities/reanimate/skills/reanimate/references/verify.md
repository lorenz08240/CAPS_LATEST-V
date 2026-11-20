# Verifying the clone

A round is: capture the clone the same way as the reference → `compare.ts` → `sheet.ts compare` → `easing.ts --compare-track` for each tracked element → read everything → fix one cause → next round. Keep every round's directory (`clone-1`, `compare-1`, `clone-2`, …) so the report can show progress.

## What compare.ts tells you

`report.md` / `report.json`:

- **offset**: the clone frame matched to reference frame 0 (auto-aligned on the first ten frames). A large offset means the clone starts late or early; fix the trigger timing or `--wait-before`, do not rely on alignment to hide it.
- **mean mismatch** and **worst frames**: fraction of pixels that differ per frame. Pixel-faithful work reads this directly. Motion-faithful work reads it as a trend: it should be low at rest and spike only where the two differ in state.
- **motion window**: first/last frame with visible change, and the peak, for both sets. The **timing error** is the difference, in seconds, of start, end, duration and peak. This is the main motion metric, independent of colours and copy.
- **activity curve**: bars of change per frame. Same shape = same easing and stagger; a clone whose bars are front-loaded against a reference whose bars are even is using a stronger ease-out, and so on.
- `diff/NNNN.png`: red where pixels differ. `sheet.ts compare --diff` puts reference, clone and diff side by side with the mismatch per row.

`easing.ts --compare-track other.json` prints `maxAbsDiff` / `meanAbsDiff` of the property over time between the two tracks (in CSS px or opacity units) and the best-fit easing of the clone, to compare with the reference's.

## Pass criteria

Motion-faithful (per spec row):

- start and end timing error ≤ 0.08 s (two frames at 25 fps); duration error ≤ 0.08 s
- easing: same best-fit family (out / in / in-out / linear / spring) and RMSE of the reference's best fit applied to the clone's track ≤ 0.05, or `meanAbsDiff` ≤ 5 % of the travel distance
- stagger order and gaps within 0.04 s
- travel distance within 10 % of the reference relative to the element size, same direction
- nothing moves in the clone that is still in the reference, and vice versa
- compare sheets: the same visual state at the same timestamp, allowing for different copy/colours

Pixel-faithful adds:

- mean mismatch ≤ 2 %, no frame above 5 % (set `--threshold 0.02`); at rest frames ≤ 0.5 %
- fonts loaded and identical (check `inspect.json › fonts` on both captures), colours and sizes equal in `nodes`
- same assets at the same size

Mixed: the cloned region passes one of the above with `--region` limited to it; the additions are shown on a sheet and described.

Canvas, WebGL, 3D (captured with `--clock virtual --gl`, see `references/webgl.md`):

- `gl.ts compare --ref ref --clone clone-N`: every animated channel in the reference has a clone channel of the same kind, start and end within 0.08 s, mean error ≤ 5 % of the reference's range (`--map` when names differ); canvas attributes, renderer settings and draw structure (primitive, vertex count, blend state, cadence) the same, or the difference explained
- the clock rate of every `clock` channel the same (`gl.ts channels`)
- pixels as above. If the clone ports the reference's generator, the seeded random gives the same particles and the sharp mismatch applies. If not, judge with `compare.ts --blur 4` and report the sharp number next to it

## Reading failures → usual fix

| Symptom | Usual cause | Fix |
|---|---|---|
| everything shifted by the same offset, shape identical | trigger latency or missing delay | add/adjust the initial delay; check `--wait-before` |
| clone shorter and front-loaded | easing too aggressive (expo vs quint), or duration from visible window instead of declared | use `easing.ts` fitted `durationMs`, set the declared duration |
| clone ends on time but starts late | delay too long, duration too short | fix both together |
| bars spread evenly in clone, spiky in reference | linear or ease-in-out where the reference is ease-out | change easing family |
| mismatch high at rest frames | layout/style differences, font fallback, crop differs | fix capture crop; for pixel-faithful load the font, fix sizes |
| reference overshoots, clone does not | spring vs bezier | use a spring (Framer `type: "spring"`, GSAP `back.out`/`elastic`, CSS `linear()` with sampled spring) |
| stagger gaps differ | per-item delay math | `delay = base + index × step`; check index source |
| activity in clone where reference is still | an element animates that should not, or a hover state is triggered by the mouse position | move the mouse out, remove the stray transition |
| only the last frames differ | fill-mode or end state (`forwards` missing), or final value rounds differently | set `animation-fill-mode: forwards` / `fill: "forwards"` |
| scroll trigger: clone starts earlier/later | IntersectionObserver threshold / rootMargin differ | match threshold to the reference's entry point in `track.json` (`y` where motion begins) |

## When to stop

- Stop when every spec row passes its criteria and the latest sheets look the same state-by-state. Say so with the numbers.
- Stop after 5 rounds without progress on a row, or when the remaining difference is outside your control (font licence, a shader or model the user may not copy, third-party embed, physics you approximated). Report the row, its last numbers, and the reason. Never relax thresholds silently; if you think the user would accept a looser bar, say which and why.
- If the reference itself is inconsistent between captures (randomised content, A/B variants, network-dependent lazy loading), capture it with `--clock virtual` (same seed) first: that removes timing and randomness, and two captures come out identical. Whatever still differs (A/B variants, server-side randomness) is the noise floor; measure it by comparing the reference against itself before judging the clone.

| Symptom (canvas) | Usual cause | Fix |
|---|---|---|
| same shapes, colours slightly off everywhere | colour management: `outputColorSpace`, texture colour space, tone mapping, three.js revision | copy the renderer settings from `gl.ts summary`; same revision |
| edges harder or softer | `antialias`, pixel ratio, `premultipliedAlpha` | copy the context attributes and pixel ratio |
| motion matches but looks steppier or smoother | render cadence (reference draws every other frame) or per-frame lag at a different rate | compare draws per frame in `gl.ts compare`; match cadence and `k` |
| particles in different places, same density | different random order or seed | port the generator's call order, or verify with `--blur` |
| channel missing in the clone | value baked into the shader, or a different uniform name | `--map ref=clone`, or expose it as a uniform |

## Report block

```markdown
## Verification (round N of M)
| element / property | timing err (start/end/dur) | easing (ref → clone) | mismatch mean / worst | result |
| h1 translateY+opacity | +0.00 / −0.04 / −0.04 s | easeOutExpo 700 → easeOutExpo 700 | 0.3 % / 1.1 % | pass |
Sheets: .reanimate/<name>/compare-N/sheets/compare-01.png …
Residuals: <none | row, numbers, reason>
```
