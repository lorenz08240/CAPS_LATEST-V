// Mounts the three illustrations. Like nextjs.org, where they start after hydration, they are set up once
// the document has loaded, so a page that pushes them below the fold first sees them start on scroll.
import { mountOptimizations } from "./optimizations.js";
import { mountStreaming } from "./streaming.js";
import { mountRsc } from "./rsc.js";

function mount() {
  const card = (slug) => document.querySelector(`.nf-card[data-card="${slug}"]`);
  const opt = card("optimizations")?.querySelector(".nf-canvas-wrap");
  const stream = card("streaming")?.querySelector(".nf-stream");
  const rsc = card("rsc")?.querySelector(".nf-center");
  if (opt) mountOptimizations(opt);
  if (stream) mountStreaming(stream);
  if (rsc) mountRsc(rsc);
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", mount, { once: true });
else mount();
