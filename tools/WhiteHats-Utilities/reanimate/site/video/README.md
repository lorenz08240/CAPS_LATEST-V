# Demo video

A 47-second demo of reanimate, without sound, its cuts on a 90 bpm grid. It's a web page: every frame is drawn from the time alone, then screenshotted and encoded, so the render is frame-exact. Commands run from `site/`.

| Time | Bars | What |
|---|---|---|
| 0–2 s | intro | `/reanimate` slides in with onion-skin frames behind it |
| 2–6.2 s | 0–1.5 | a picker wheel of things to ask for, one a beat; the last is entered |
| 6.2–15.5 s | 1.5–5 | the clones, big, one every two beats: React Bits' fading stars, Stripe, Liveblocks, WorkOS, Clerk |
| 15.5–23.5 s | 5–8 | the Resend cube up close; the camera pulls back to all 18 in a mosaic, which winds into a turning helix |
| 23.5–39.5 s | 8–14 | how it works, on three clones at once (stripe.com's Agentic commerce card, the resend.com cube, clerk.com's Session management card): record, spec, build, verify, repeat (the copies' pixel difference shrinking each round) |
| 39.5 s–end | 14–17 | the install command; `/reanimate`, gray all video, turns to ink |

## Make it

```sh
bun video/scripts/clips.ts     # records the 18 clones into video/clips/ (about 3 minutes)
bun video/scripts/render.ts    # video/out/reanimate-demo.mp4, 1920x1080, 60 fps
bun video/scripts/publish.ts   # public/demo.mp4 for the site, and the README's preview, ../.github/assets/demo.webp
```

`clips.ts` films each clone on the skill's virtual clock (`skills/reanimate/scripts/capture.ts --clock virtual`) at 2x and 60 fps, so a clip comes out the same on every run. For "how it works" it also films clerk.com's Session management card and its copy the same way (`how-clerk-*`), and cuts the originals and copies of the other two out of the site's recordings (`public/media/stripe-bento/compare.mp4` and `resend-cube/compare.mp4`, as `how-stripe-*` and `how-resend-*`; `--only compare` redoes just those). `--only <slug>,…` redoes some.

`render.ts` options: `--scale 2` draws at 3840x2160 and scales down (sharper, about 4x slower); `--size 3840x2160` keeps it; `--from 12 --to 29` renders a section; `--stills 1.5,13.2` writes PNGs of single moments to `video/out/stills/`. It needs Playwright's Chromium and `ffmpeg` on PATH. `publish.ts` makes a smaller copy that the site serves at `/demo.mp4` (the README links to it), and the README's preview: a few moments of the video, cross-faded into a 20-second loop. It needs `ffmpeg`, `cwebp` and `webpmux`.

## The Vercel video

`vercel.html` is a second video on the same stage and renderer: 37.6 s of the six Vercel clones (vercel.com, nextjs.org, turborepo.com), each next to its original, then all six at once and the install command. Its scenes are in `src/vercel/`; `shots.js` lists the shots, their timing and their numbers. The pairs are the site's own recordings, kept lined up by `record-media`:

```sh
bun run media --only vercel-previews,vercel-hero,vercel-fluid,vercel-workflow,turborepo-gauge,nextjs-rsc --keep <dir>
bun video/scripts/clips.ts --masters <dir>        # each as <slug>-reference and <slug>-copy
bun video/scripts/render.ts --page vercel.html     # video/out/vercel.mp4
```

The player is at `/video/vercel.html` on `serve.ts`.

## Edit it

```sh
bun video/scripts/serve.ts     # http://localhost:4700/video/
```

A player: space plays and pauses, ←/→ step a frame (shift: a second), `?t=12.5` starts there. Each scene is a module in `src/` with `from`, `to`, `init(root)` and `render(t)`, and optionally `shift` to keep its own clock (`how.js` is timed as if it began at 12.86 s and plays 4 bars later); `src/lib.js` has the beat grid (`bar(n)`, `beat(n)`), easing and the blur-and-fade helper the transitions share.
