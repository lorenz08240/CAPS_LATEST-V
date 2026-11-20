# Widgets: one per card

`src/bento.js` fills every `<div class="clerk-card__visual" data-widget="<slug>">` in `index.html`
from up to three files here. Each one is optional and a missing one is skipped silently:

| file | what bento.js does with it |
|---|---|
| `<slug>.html` | fetched; on HTTP 200 it becomes the slot's `innerHTML` |
| `<slug>.css` | linked in `<head>` (`<link rel="stylesheet">`) |
| `<slug>.js` | `import()`ed as an ES module; its export `mount(slot, card)` is called |

- All three load in parallel. `mount` runs once the widget's own HTML is in the slot and its CSS has
  loaded (or failed), independently of the other widgets. It may be `async`.
- `slot` is the visual slot, `card` the `.clerk-card` around it. Hover is driven from the card, as on
  clerk.com (react-aria `useHover` on the card root): `card.addEventListener("pointerenter" | "pointerleave", …)`.
  The slot itself has `pointer-events: none`.
- Slugs: `mfa`, `session-management`, `otp`, `fraud`, `magic-links`, `social-sign-on`,
  `advanced-security`, `bot-detection`, `passwords`, `api-keys`, `clerk-cli`.
- Assets (SVG, images, data) go in `assets/<slug>/` at the example root; from CSS that is
  `url(../../assets/<slug>/…)`, from JS `new URL("../../assets/<slug>/…", import.meta.url)`, and from the
  HTML fragment (resolved against `index.html`) `./assets/<slug>/…`. Nothing may be loaded from other origins.
- Scope CSS to the card: `.clerk-card--<slug> …` or class names prefixed with the slug.
- Fonts are already loaded by `src/bento.css`: `var(--font-sans)` (Geist for clerk.com's Suisse Int'l,
  Geist digits as on clerk.com) and `var(--font-mono)` (Geist Mono for clerk.com's Söhne Mono). clerk.com's gray
  scale is available as `--color-gray-25` … `--color-gray-950`. Tailwind's preflight is applied globally.

The slot reproduces clerk.com's visual container (the card's `aria-hidden` flex child): full card width,
`position: relative`, `z-index: 10` (text is `z-index: 20`; `api-keys` is `20`), overflow visible (the card
clips with `overflow: hidden` + 16px radius, except `otp`), `isolation: isolate` for `magic-links`,
`advanced-security`, `passwords`, and `display: flex; flex-direction: column; justify-content: flex-end` for
`api-keys` and `clerk-cli`. Its height is clerk.com's: 164px on the 260px cards, `fraud` 392, `session-management`
412, `magic-links` 432, `api-keys` and `clerk-cli` 160.

Viewing and recording: `index.html?card=<slug>` shows one card at its clerk.com size, centred, 112.40625px from
the top (clerk.com's sub-pixel offset kept), and mounts only that card's widget. It also survives a padded body
(`document.body.style.padding = "1800px 0 900px"`): `scrollIntoView` then lands the card on the same viewport y
as on clerk.com, which has the same `scroll-padding-top: 4rem`. Each slot gets `data-widget-state` (`loading`, `mounted`, `static`,
`empty`, `error`); `<html data-widgets="ready">` and `await window.clerkBento.ready` mark the end of loading.
Recon notes, the cards' clerk.com DOM, CSS and source: `.reanimate/clerk-bento/` (`cards.md`).

## Shared modules

`src/shared/` holds code several widgets use. Import it, don't copy or edit it.

### `src/shared/meteor.js`: clerk.com's light-streak canvas ("Meteor", module 242116)

A faithful port of the React `<Meteor>` used by session-management, fraud, social-sign-on, api-keys and
clerk-cli: same options and defaults, same canvas calls, same clock, no randomness. Full documentation is in
the file's header comment.

```js
import { createMeteor } from "../shared/meteor.js";

// on hover-in (clerk.com mounts it inside AnimatePresence while the card is hovered)
const meteor = createMeteor(trackEl, {               // trackEl: positioned, meteor width × height
  stops: "dark",                                      // "light" (default) | "dark" | [[cssColor, offset], …]
  meteors: [{ width: 600, height: 87, path: "M0 86h…", delay: 0, repeat: 2000 }],
  // also: direction: "reverse", onBegin() (return false stops the loop), onEnd(); and at the top level
  // skip, segments, minSize, maxSize, gap, speed, wait (+ meteor.start()), style, className
});
// on hover-out: clerk.com's AnimatePresence exit {opacity: 0} (0.3 s, cubic-bezier(.25,.1,.35,1)), then unmount
meteor.exit();
// on re-hover while it is still fading out: meteor.revive() (same instance, clock continues)
```

Handle: `el`, `canvas`, `start()` (clerk.com's `ref.start()`), `stop()`, `refresh()` (what a React re-render
of `<Meteor>` does: re-measure, `onBegin` fires again for meteors in flight, clock kept), `exit()`, `revive()`,
`destroy()`, `time`, `running`, `exiting`. Also exported: `METEOR_STOPS`, `meteorLength()`, `stopsColor()`.
The canvas is sized once at creation to the nearest positioned ancestor × clamp(devicePixelRatio, 1, 2). Like
clerk.com, it does not pause off screen.
