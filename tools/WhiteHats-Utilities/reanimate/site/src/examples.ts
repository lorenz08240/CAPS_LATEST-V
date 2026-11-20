// The examples on the home page, in order. To add one:
//   1. put the clone, as a standalone page, in public/examples/<name>/
//   2. put its media in public/media/<slug>/: poster.webp (the clone at rest, for the thumbnail) and,
//      for a recorded example, compare.mp4 (the original and the clone recorded the same way, side by
//      side in one file). scripts/record-media.ts makes both.
//   3. add an entry here.

export type Example = {
  slug: string;
  title: string;
  source: { name: string; url: string };
  /** What it does, in a sentence or two. */
  about: string;
  /** Shown as a margin note next to `about`. */
  note?: string;
  /** What the page shows: "video", compare.mp4 at this size in CSS px (the file is 2x); or "live", the
   *  clone itself in an iframe of this size (`live` with &embed). `stacked`: the two takes are one above the
   *  other (scripts/record-media.ts stacks recordings wider than tall); assumed when taller than wide.
   *  `background`: the live frame's colour around and behind the iframe (default: the clerk.com cards' dark).
   *  `try`: what to do with a live copy on a desktop, under it (default "hover it"; on a phone it says "tap it"). */
  show: { kind: "video" | "live"; width: number; height: number; stacked?: boolean; background?: string; try?: string };
  /** The clone running on its own. */
  live: string;
  /** What was measured, how, and the number. */
  results: [string, string, string][];
};

const CLERK = { name: "clerk.com", url: "https://clerk.com/" };
const NEXTJS = { name: "nextjs.org", url: "https://nextjs.org/" };

export const examples: Example[] = [
  {
    slug: "vercel-previews",
    title: "Vercel Toolbar",
    source: { name: "vercel.com", url: "https://vercel.com/products/previews" },
    about:
      "A dark toolbar floats between seven tilted tags, and they all fade in one after another. Hover a button and its tag takes its colour while the other tags blur and the other icons dim. Grab the toolbar and drag it: the tags blur as it moves, and it glides back when you let go.",
    note: "vercel.com updates the hover a moment after the pointer arrives, when React gets to it. The copy waits the same moment, so every change starts on the same frame.",
    show: { kind: "live", width: 560, height: 260, background: "#fafafa" },
    live: "/examples/vercel-previews/?",
    results: [
      ["Frame match", "frames identical: the entrance, all seven buttons, a drag", "417 of 417"],
      ["Timing", "start and end of every fade, blur and colour change", "0 ms"],
      ["Layout", "every element, at rest and in each hover state", "≤ 0.02 px"],
    ],
  },
  {
    slug: "vercel-hero",
    title: "Drop to deploy",
    source: { name: "vercel.com", url: "https://vercel.com/" },
    about:
      "A black triangle sits in vercel.com’s hero, lit by 72 LEDs along its edges while soft lines of light run round it. Bring the pointer close and the edges facing it light up. Drag a file over the page and it turns into a prism: red, green and blue light spreads from its edges and “Drop to deploy” fades in.",
    note: "This is vercel.com’s own renderer, read from the page: the same shaders, run in a worker as on vercel.com. vercel.com draws it with WebGPU where it can and the copy with WebGL, vercel.com’s own fallback; the two place the grain on the triangle’s rim differently, and nothing else.",
    show: { kind: "live", width: 560, height: 373, background: "#fafafa", try: "drag any file onto it" },
    live: "/examples/vercel-hero/?",
    results: [
      ["Frame match", "pixels that differ, 803 frames: entrance, pointer, drop, click, nav", "≤ 1 level"],
      ["Drop timing", "label, text and colours, in and out", "0 ms"],
      ["WebGPU original", "pixels more than 8 levels off, same as vercel.com’s own WebGL", "0.16 %"],
    ],
  },
  {
    slug: "vercel-fluid",
    title: "Fluid ocean",
    source: { name: "vercel.com", url: "https://vercel.com/fluid" },
    about:
      "Behind the hero, a grid of 512 × 512 tiny dots rolls like a slow sea. Each dot snaps to a 4.4 px grid, so the waves read as a dot matrix. It fades in over 0.7 s once the first frame is ready. Without WebGPU you get a still of the same sea.",
    note: "This is vercel.com’s own WebGPU renderer, ported: the same shaders, constants and seeded noise. Started on the same frame, it draws the same pixels, in light and dark.",
    show: { kind: "video", width: 560, height: 376, stacked: true },
    live: "/examples/vercel-fluid/",
    results: [
      ["Frame match", "pixels that differ over 12 s of sea, light and dark, at 1x and 2x", "0 px"],
      ["Speed", "simulated seconds per second (vercel.com: 0.600)", "0.600"],
      ["Fade-in", "opacity, frame by frame", "identical"],
    ],
  },
  {
    slug: "vercel-workflow",
    title: "Inspect every run",
    source: { name: "vercel.com", url: "https://vercel.com/workflow" },
    about:
      "A copy of the Vercel dashboard shows one run of a workflow. When it scrolls into view the run plays: the status turns to Running, the duration counts up to 925 ms and the six steps fill in one after another, each with its own timer. Then the status turns to Completed.",
    note: "Each bar keeps its own clock and only moves while at least 35 % of it is on screen, as on vercel.com. Scroll away mid-run and it waits for you.",
    show: { kind: "video", width: 560, height: 454, stacked: true },
    live: "/examples/vercel-workflow/",
    results: [
      ["Frame match", "pixels that differ over 3 s after scroll-in", "0.0001 %"],
      ["Bars", "width of all six spans, every frame", "0 px"],
      ["Timing", "start and end of every span and status change", "0 ms"],
    ],
  },
  {
    slug: "turborepo-gauge",
    title: "Speedometer",
    source: { name: "turborepo.com", url: "https://turborepo.com/" },
    about:
      "A speedometer sits next to the headline, its needle resting near the red end. Point at it and the needle revs into the red, hits the end stop and settles; move away and it drops back. Below, the compute hours saved roll up to the live count once the page loads, then tick up every 10 s.",
    note: "The gauge is turborepo.com’s own SVG and the needle runs the page’s own spring. The hours are live on turborepo.com; the copy starts from the count read on 30 October 2026 and grows at the rate measured then, so its last digits differ.",
    show: { kind: "live", width: 560, height: 500, background: "#fafafa" },
    live: "/examples/turborepo-gauge/?",
    results: [
      ["Frame match", "pixels that differ over 4 s of hovering, at 1x and 2x, light and dark", "0 px"],
      ["Pointer", "from the pointer to the needle’s first move (turborepo.com: 32–34 ms)", "31–33 ms"],
      ["Counter", "start of the roll after the first frame (turborepo.com: 466–608 ms)", "456–469 ms"],
    ],
  },
  {
    slug: "nextjs-optimizations",
    title: "Built-in Optimizations",
    source: NEXTJS,
    about:
      "Three image frames, from the original down to a 375 px copy, each with a dotted mountain drawn on a canvas. Move the pointer over them and the dots within 40 px light up in six bands of blue, darkest at the centre.",
    note: "This is nextjs.org’s own canvas code, ported line for line with its dot data, so it draws the same pixels.",
    show: { kind: "live", width: 496, height: 514, background: "#fafafa" },
    live: "/examples/nextjs-features/?card=optimizations",
    results: [
      ["Frame match", "frames identical while the pointer crosses it, at 2x", "129 of 131"],
      ["At rest", "canvas pixels against nextjs.org’s, 150 frames", "identical"],
      ["Pointer", "glow, arrow and text colour against nextjs.org", "≤ 17 ms"],
    ],
  },
  {
    slug: "nextjs-streaming",
    title: "Dynamic HTML Streaming",
    source: NEXTJS,
    about:
      "A wireframe page sits on a grid. Once the card is well into view, four streaks of blue run along the grid lines into the page, each on its own loop. Every 5 s the image turns into an avatar and back, and every 8 s the content blocks change layout. Hover it and the streaks restart on a quicker 2 s loop.",
    note: "nextjs.org runs it on Motion. The copy ports the part it uses, down to Motion’s rounding of time to whole milliseconds.",
    show: { kind: "live", width: 496, height: 514, background: "#fafafa" },
    live: "/examples/nextjs-features/?card=streaming",
    results: [
      ["Timing", "start of every streak, swap and layout change", "0 ms"],
      ["Motion", "40 animated values, every frame for 10 s", "identical"],
      ["Frame match", "frames identical at 2x over 6 s", "148 of 150"],
    ],
  },
  {
    slug: "nextjs-rsc",
    title: "React Server Components",
    source: NEXTJS,
    about:
      "Dashes flow down two edges of a tree of six nodes while blue arcs glide round three of them and pulse. Hover the card and both speed up and the arcs thicken, easing back over about a second when you leave. It pauses while off screen.",
    show: { kind: "live", width: 496, height: 514, background: "#fafafa" },
    live: "/examples/nextjs-features/?card=rsc",
    results: [
      ["Motion", "17 animated values, every frame for 10 s", "identical"],
      ["Frame match", "frames identical at 2x over 6 s", "146 of 150"],
      ["Hover", "speed-up and slow-down against nextjs.org", "≤ 17 ms"],
    ],
  },
  {
    slug: "stripe-agentic-commerce",
    title: "Agentic commerce",
    source: { name: "stripe.com", url: "https://stripe.com/" },
    about:
      "A chat writes itself in when the card comes into view, word by word, then two products rise into place. Behind it, ten thousand particles pull into a ring and reach for your pointer.",
    show: { kind: "video", width: 560, height: 454 },
    live: "/examples/stripe-bento/?card=agentic-commerce",
    results: [
      ["Chat timing", "every step, within stripe.com’s own spread", "≤ 43 ms"],
      ["Chat layout", "52 of 52 elements in place", "≤ 0.05 px"],
      ["Particle ring", "tightens at 1.44 s (stripe.com: 1.44–1.48 s)", "pass"],
    ],
  },
  {
    slug: "stripe-issuing",
    title: "Card issuing",
    source: { name: "stripe.com", url: "https://stripe.com/" },
    about:
      "A three.js ribbon of colour drifts behind a Visa card. Hover it and the card tilts toward your pointer, up to 27°, then lies flat again when you leave.",
    show: { kind: "video", width: 560, height: 454 },
    live: "/examples/stripe-bento/?card=issuing",
    results: [
      ["At rest", "pixels that differ (stripe.com vs itself: 0.10 %)", "0.03–0.05 %"],
      ["Tilt", "settled pose at three pointer positions", "≤ 0.4 px"],
      ["Hover in and out", "within the noise of two stripe.com recordings", "pass"],
    ],
  },
  {
    slug: "stripe-crypto",
    title: "Stablecoins and crypto",
    source: { name: "stripe.com", url: "https://stripe.com/" },
    about:
      "A dotted globe turns slowly while payments fly between 69 cities, each with a random amount riding the arc. Hover it and the dots brighten around the edge.",
    note: "The arcs and amounts are random on every load, on stripe.com too, so they are compared by timing, not pixels.",
    show: { kind: "video", width: 560, height: 454 },
    live: "/examples/stripe-bento/?card=crypto",
    results: [
      ["Globe pose", "start angle, tilt, centre and camera", "exact"],
      ["Rotation", "per rendered frame", "0.0016°"],
      ["Arcs and labels", "within stripe.com’s own spread", "pass"],
    ],
  },
  {
    slug: "workos-atlas",
    title: "Connected to all your tools",
    source: { name: "workos.com", url: "https://workos.com/atlas" },
    about:
      "Atlas, the WorkOS robot, sits at a laptop under a dome of app icons. As it scrolls into view the icons spring out of its antenna and the laptop opens. Then every couple of seconds a line reaches out to another app, which swells inside a ring of its brand colour.",
    note: "Which app it reaches next is random, on workos.com too. For the recording both pages got the same random numbers, so they pick the same apps.",
    show: { kind: "video", width: 560, height: 274 },
    live: "/examples/workos-atlas/",
    results: [
      ["Frame match", "pixels that differ, over 10 s with the same picks", "0.05 %"],
      ["Entrance", "icons, lid and glare after scroll-in", "≤ 33 ms"],
      ["Links", "draw-in, ring and fade of each connection", "≤ 10 ms"],
    ],
  },
  {
    slug: "liveblocks-comments",
    title: "Comments in any app",
    source: { name: "liveblocks.io", url: "https://liveblocks.io/comments" },
    about:
      "An app window switches every 6 s between a text editor, a media player, a whiteboard, a website and a video editor. Each time, the drawing blurs away and the next one springs in. A second later the comment thread fades over, the panel glides to its new spot and the colours change.",
    note: "liveblocks.io sets its text in Suisse Int’l, a paid font, so the copy uses Inter spaced to the same widths. Lines break in the same places; the letters differ.",
    show: { kind: "video", width: 560, height: 732 },
    live: "/examples/liveblocks-comments/",
    results: [
      ["Frame match", "pixels that differ over the 30 s loop", "0.55 %"],
      ["Panel glide", "position and size, all five changes", "≤ 0.7 px"],
      ["Timing", "start and end of every change", "0 ms"],
    ],
  },
  {
    slug: "resend-cube",
    title: "Hero cube",
    source: { name: "resend.com", url: "https://resend.com/" },
    about:
      "A dark Rubik’s cube fades in and turns slowly on two axes, once every 10 s. Its left slice makes a half-turn every 5 s and its right slice every 8 s, while bars of light leave striped shadows across the faces.",
    note: "This is resend.com’s own Spline scene, read from the page and drawn with plain three.js: the same geometry, textures, shaders and post-processing, so it draws the same pixels.",
    show: { kind: "video", width: 560, height: 968 },
    live: "/examples/resend-cube/",
    results: [
      ["Motion", "every rotation, frame by frame over 25 s", "0 differ"],
      ["Frame match", "pixels that differ over 6 s, entrance included", "0.11 %"],
      ["Same pixels", "frames after the entrance, within one frame", "265 of 266"],
    ],
  },
  {
    slug: "reactbits-fading-stars",
    title: "Fading stars",
    source: { name: "pro.reactbits.dev", url: "https://pro.reactbits.dev/docs/components/fading-stars" },
    about:
      "Violet stars rise from below the frame in a wide fan, each on a trail that fades behind it, and speed up as they climb. Move the pointer over them and the flow surges, then settles over about a second. Click and 64 stars lift off together as an arc.",
    note: "The stars come from the component’s own random generator with a fixed seed, so they are the same on every load. The copy uses the same generator: started on the same frame, it draws the same pixels.",
    show: { kind: "video", width: 560, height: 640 },
    live: "/examples/reactbits-fading-stars/",
    results: [
      ["Frame match", "canvas pixels that differ over 4 s, at 1x and 2x", "0 px"],
      ["Pointer", "pixels that differ during a click burst and a fast drag", "0.014 %"],
      ["Timing", "star clock and film grain, every rendered frame", "0 ms"],
    ],
  },
  {
    slug: "clerk-mfa",
    title: "Multifactor authentication",
    source: CLERK,
    about:
      "A cyan cursor steps across six code tiles, typing a random digit into each. When the sixth is filled the tiles flash a cyan ring and fade, and a new code starts.",
    note: "The digits are random, on clerk.com too. The copy draws them with the same formula, so the same random numbers give the same code.",
    show: { kind: "live", width: 443, height: 308 },
    live: "/examples/clerk-bento/?card=mfa",
    results: [
      ["Loop timing", "start of each code, over 3 codes", "≤ 20 ms"],
      ["Frame match", "pixels that differ over 8 s of hovering", "0.50 %"],
      ["Same digits", "same random numbers, same code", "pass"],
    ],
  },
  {
    slug: "clerk-session-management",
    title: "Session management",
    source: CLERK,
    about:
      "The laptop lid swings open, the Clerk logo lights up on its screen and the device details slide into focus, while a light streak runs along the circuit every two seconds. Move away and everything folds back.",
    note: "The light streak is clerk.com’s own canvas code, ported line for line. It draws the same pixels, byte for byte.",
    show: { kind: "live", width: 443, height: 576 },
    live: "/examples/clerk-bento/?card=session-management",
    results: [
      ["Timing", "start of every animation, hover in and out", "0 ms"],
      ["Frame match", "frames that differ outside the text, over 6.8 s", "1 of 171"],
      ["Light streak", "canvas pixels against clerk.com’s", "identical"],
    ],
  },
  {
    slug: "clerk-otp",
    title: "Email and SMS passcodes",
    source: CLERK,
    about:
      "The phone lifts as its lock and SMS badges turn cyan, then a security alert with your passcode springs down from the top of the screen. It stays while you hover and slides back when you leave.",
    show: { kind: "live", width: 443, height: 308 },
    live: "/examples/clerk-bento/?card=otp",
    results: [
      ["Timing", "hover in and out", "≤ 3.4 ms"],
      ["Spring", "overshoot of the alert (clerk.com: 1.5 %)", "1.5 %"],
      ["Frame match", "pixels that differ in the visual", "0.59 %"],
    ],
  },
  {
    slug: "clerk-fraud",
    title: "Fraud and abuse prevention",
    source: CLERK,
    about:
      "The spinner in the “Fraudulent sign-ups detected” pill starts turning, four blocked sign-ups appear one after another with a red ✕, and a red-orange light streak runs down the timeline every 3 s. Move away and it all rewinds.",
    note: "It even copies a quirk of clerk.com’s animation library: leave and come back in the very frame a row finishes, and that row’s email stays hidden.",
    show: { kind: "live", width: 443, height: 576 },
    live: "/examples/clerk-bento/?card=fraud",
    results: [
      ["Timing", "start and end of every move", "≤ 40 ms"],
      ["Frame match", "pixels that differ outside the text", "0.004 %"],
      ["Easing", "all 22 animated values, frame by frame", "pass"],
    ],
  },
  {
    slug: "clerk-magic-links",
    title: "Magic links",
    source: CLERK,
    about:
      "A scan line sweeps the code to reveal a new one while the avatar outline draws itself in cyan. A check mark pops in, then the profile swings away like a wheel and a new user swings in. It repeats every 5.2 s while you hover.",
    note: "The code, the scrambling letters and the next user are random, on clerk.com too. The copy uses the same algorithm, so the same random numbers give the same result.",
    show: { kind: "live", width: 443, height: 576 },
    live: "/examples/clerk-bento/?card=magic-links",
    results: [
      ["Timing", "start and end of every moving part", "0 ms"],
      ["Frame match", "pixels that differ over a full loop", "0.25 %"],
      ["Loop", "new user at 3.6 s, again every 5.2 s", "pass"],
    ],
  },
  {
    slug: "clerk-social-sign-on",
    title: "Social sign-on",
    source: CLERK,
    about:
      "The cloud lights up cyan as light streaks run through the circuit. Each streak that leaves the box slides that side’s sign-in logos one step along. Move away and the light fades; the logos stay where they stopped.",
    note: "The streaks are clerk.com’s own canvas code, and they are what moves the logos, so the two can’t drift apart.",
    show: { kind: "live", width: 443, height: 308 },
    live: "/examples/clerk-bento/?card=social-sign-on",
    results: [
      ["Timing", "every animation, hover in, out and back in", "0 ms"],
      ["Frame match", "pixels that differ in the visual", "0.00 %"],
      ["Logo steps", "same frames as clerk.com, also when you leave mid-step", "pass"],
    ],
  },
  {
    slug: "clerk-advanced-security",
    title: "Advanced security",
    source: CLERK,
    about:
      "The fingerprint draws itself in cyan, a glow ring fades in and pulses, and a field of tiny dots ripples out from the button before the side panels slide apart.",
    note: "The dot field is clerk.com’s own WebGL shader, copied unchanged. Its sparkle comes from each dot’s position, so it is the same on every hover.",
    show: { kind: "live", width: 443, height: 308 },
    live: "/examples/clerk-bento/?card=advanced-security",
    results: [
      ["Timing", "start and end of every motion, hover in and out", "≤ 40 ms"],
      ["Frame match", "pixels that differ in the visual", "≤ 0.06 %"],
      ["Dot field", "same shader and same dots as clerk.com", "pass"],
    ],
  },
  {
    slug: "clerk-bot-detection",
    title: "Bot detection",
    source: CLERK,
    about:
      "A dark radar starts scanning: the dots fade out and back in a new layout, and a cyan crosshair with a light beam swings onto one of them and locks on. It picks a new dot about every 2.3 s while you hover.",
    note: "The dot it locks onto is random, on clerk.com too. The copy uses the same formula, so the same random numbers pick the same dot.",
    show: { kind: "live", width: 443, height: 308 },
    live: "/examples/clerk-bento/?card=bot-detection",
    results: [
      ["Hover in", "every moving part over two scans", "identical"],
      ["Frame match", "pixels that differ in the visual", "0.04 %"],
      ["Hover out", "leaving mid-scan, mid-fade and coming back", "pass"],
    ],
  },
  {
    slug: "clerk-passwords",
    title: "Passwords",
    source: CLERK,
    about:
      "The password field lights up with a cyan border and ten dots type in one after another. Then the keyhole dial turns a quarter to unlock and stays there until you move away.",
    show: { kind: "live", width: 443, height: 308 },
    live: "/examples/clerk-bento/?card=passwords",
    results: [
      ["Timing", "start of each motion, hover in and out", "≤ 19 ms"],
      ["At rest and held", "pixels that differ in the visual", "0 px"],
      ["Frame match", "mean, over every recording", "≤ 0.18 %"],
    ],
  },
  {
    slug: "clerk-api-keys",
    title: "API keys",
    source: CLERK,
    about:
      "A laptop opens to sign in. A progress bar fills, pulses of light run from the laptop through an “Authenticating…” badge to three servers, and their 144 status lights blink at random. Move away and everything powers down.",
    note: "The lights follow clerk.com’s own blink recipe: given the same random numbers, they blink in exactly the same rhythm.",
    show: { kind: "live", width: 845, height: 328 },
    live: "/examples/clerk-bento/?card=api-keys",
    results: [
      ["Frame match", "frames identical outside the text", "167 of 171"],
      ["Motion", "laptop, lid and progress bar against clerk.com", "≤ 0.06 px"],
      ["Random lights", "144 lights for 20 s, same random numbers", "0 differ"],
    ],
  },
  {
    slug: "clerk-cli",
    title: "Clerk CLI",
    source: CLERK,
    about:
      "The Clerk logo lights up cyan while light streaks run from the terminal panel into the button and on into a ring of AI-tool logos. Every 1.35 s the logos step one slot round the ring.",
    note: "The ring keeps its place between hovers, so each visit carries on where the last one stopped.",
    show: { kind: "live", width: 443, height: 328 },
    live: "/examples/clerk-bento/?card=clerk-cli",
    results: [
      ["Frame match", "pixels that differ in the visual, four hover runs", "≤ 0.01 %"],
      ["Timing", "start and end of every motion", "0 ms"],
      ["Logo steps", "position during each step", "0 px"],
    ],
  },
];

export const media = (slug: string, file: string) => `/media/${slug}/${file}`;
