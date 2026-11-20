// What the Vercel video shows, in order, and when. Each shot is one clone with its original, filmed the same
// way by scripts/record-media.ts and cut into frames by scripts/clips.ts --masters: clips <slug>-reference
// and <slug>-copy.
//   mode "pair": the two side by side; "wipe": one over the other, a line sweeping between them
//   start: where in the recordings the shot starts, s; dur: how long it stays, s
//   metric: the number from the clone's last comparison, as on the site (src/examples.ts)

export const SHOTS = [
  { slug: "vercel-previews", mode: "pair", title: "Vercel Toolbar", source: "vercel.com/products/previews", metric: ["417 of 417", "frames identical"], start: 0.4, dur: 6.4 },
  { slug: "vercel-hero", mode: "wipe", title: "Drop to deploy", source: "vercel.com", metric: ["785 of 803", "frames byte-identical, the rest ≤ 1 level off"], start: 2.4, dur: 5.6 },
  { slug: "vercel-fluid", mode: "wipe", title: "Fluid ocean, in WebGPU", source: "vercel.com/fluid", metric: ["0 px", "differ, frame for frame"], start: 0, dur: 4 },
  { slug: "vercel-workflow", mode: "wipe", title: "Inspect every run", source: "vercel.com/workflow", metric: ["0 ms", "off, on every step"], start: 0, dur: 4.4 },
  { slug: "turborepo-gauge", mode: "wipe", title: "Speedometer", source: "turborepo.com", metric: ["0 px", "differ while hovering, light and dark"], start: 0.3, dur: 4.2 },
  { slug: "nextjs-rsc", mode: "wipe", title: "React Server Components", source: "nextjs.org", metric: ["17 of 17", "animated values identical, every frame"], start: 0.5, dur: 4.2 },
];

let t = 0;
for (const s of SHOTS) {
  s.at = t;
  t += s.dur;
}
export const GRID_AT = t; // every copy at once
export const END_AT = GRID_AT + 4.4; // the install command
export const DURATION = END_AT + 4.4;

// the frame every scene sits in: rules across the stage at these lines, a cross where they meet
export const FRAME = { top: 132, bottom: 948, left: 96, right: 1824 };
