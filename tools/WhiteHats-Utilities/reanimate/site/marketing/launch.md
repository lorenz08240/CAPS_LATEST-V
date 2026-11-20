# Launch drafts

Replace `<site>` with the deployed URL. Attach `public/og.png`, or better, one of the comparison recordings (`public/media/stripe-issuing/compare.mp4`, or the README's `.github/assets/entrance.webp` and `hover.webp`).

## X / Threads / Bluesky

**Single post**

> I made a Claude Code skill that clones animations frame by frame, then proves the copy moves the same.
>
> It rebuilt three cards from the stripe.com homepage, WebGL included, and measured every one against the original: timing within 43 ms, tilt within 0.4 px.
>
> npx skills add NiazMorshed2007/reanimate -g
> <site>

**Thread**

1. I made a Claude Code skill that clones animations frame by frame, then proves the copy moves the same. Here it is rebuilding three cards from stripe.com 👇 [video: entrance, stripe.com vs clone]
2. Copying motion by eye always ends the same way: looks right in a screenshot, feels off in motion. The easing is sharper, something starts a beat late. reanimate measures instead: it records the reference, writes every timing and easing down, builds, records the copy the same way and compares.
3. The loop doesn't end until the numbers agree: timing error, pixel mismatch, easing fit, side-by-side sheets. If a row still fails after 5 rounds it says so, with the numbers. [image: comparison sheet]
4. Works from a live URL, a screen recording, an mp4 or a gif. Say "match it exactly" for pixel-level, or "clone X and add Y" to mix in your own parts. It writes in whatever your project already uses.
5. Install: npx skills add NiazMorshed2007/reanimate -g. Live demos (the clones run in the page, hover them): <site>

## LinkedIn

> Animations are the hardest part of a UI to copy well. A screenshot can match while the motion feels wrong, and nobody can say why.
>
> I built reanimate, a skill for Claude Code that treats an animation as something to measure. It records the reference (a live site, a video, a gif), reads it frame by frame, rebuilds it in your codebase, then records the copy the same way and compares the two until timing, easing and layout agree.
>
> To test it, I had it rebuild three cards from the stripe.com homepage, all three of them three.js scenes. Every card came back with numbers: chat timing within 43 ms of the original, the card tilt within 0.4 px, the globe's pose exact.
>
> Open source, MIT: <site>

## Show HN

**Title:** Show HN: reanimate – a Claude Code skill that clones animations and verifies them frame by frame

**First comment:**

> Hi HN. reanimate is a skill (a folder of instructions and scripts) for Claude Code. You point it at an animation on a site, in a video or in a gif, and it records it with Playwright, writes a spec (one row per element per property: start, duration, easing), rebuilds it in your stack, then records the clone with the same command and compares: timing error, pixel mismatch per frame, easing curve fits, and side-by-side sheets. It iterates until the rows pass, and reports any that don't after five rounds.
>
> The demo page has three cards from stripe.com rebuilt by it, running live, next to recordings of the originals. All three are three.js scenes, so it had to recover shaders and timings from what the page sent to the GPU rather than from CSS.
>
> Limits: pages behind a login need a screen recording, physics springs are fitted from their overshoot rather than read from the source, and web workers' own clocks still run in real time. Install with `npx skills add NiazMorshed2007/reanimate -g`.

## Where to post

- skills.sh lists skills automatically from installs through the skills CLI; nothing to submit.
- r/ClaudeAI and r/ClaudeCode: the thread text, with the entrance video.
- awesome-claude-code style lists on GitHub: open a PR adding the repo under Skills.
- Hacker News (Show HN) on a weekday morning US time.
