// "React Server Components": a tree of six nodes. The dashes on the two blue edges flow down the tree, and a
// blue arc glides round three of the nodes while it pulses. Hovering the card speeds both up and thickens the
// arcs, easing in and out over about a second. Ported from nextjs.org's FeatureVisualRsc: the same per-frame
// update on the same loop, which pauses while the card is off screen.
import { createLoop } from "./phase.js";

const DASH_SPEED = 7 / 2.4; // dash pattern units per second (one 4+3 pattern every 2.4 s)
const SPIN = (2 * Math.PI) / 5.5; // radians per second (one turn every 5.5 s)
const NODES = [
  { cx: 134.239, cy: 28.8441, r: 27.8441, startAngle: 0.85 * Math.PI },
  { cx: 81.7415, cy: 106.809, r: 27.8441, startAngle: 0.15 },
  { cx: 133.864, cy: 192.189, r: 27.8441, startAngle: -(0.7 * Math.PI) },
];

export function mountRsc(root) {
  const svg = root.querySelector("svg");
  const link = root.closest("a") ?? root;
  const edges = [...svg.querySelectorAll('path[stroke="var(--color-blue-900)"]')];
  const arcs = [...svg.querySelectorAll('circle[stroke^="url("]')];
  const grads = [...svg.querySelectorAll("defs linearGradient")];

  // at rest, as React renders it: the gradient from 0.28 r to r along the start angle
  NODES.forEach((n, i) => {
    const cos = Math.cos(n.startAngle);
    const sin = Math.sin(n.startAngle);
    grads[i].setAttribute("x1", n.cx + cos * n.r * 0.28);
    grads[i].setAttribute("x2", n.cx + cos * n.r);
    grads[i].setAttribute("y1", n.cy + sin * n.r * 0.28);
    grads[i].setAttribute("y2", n.cy + sin * n.r);
  });

  let hovered = false;
  let hover = 0;
  let dash = 0;
  let angle = 0;
  createLoop({
    target: link,
    intersectionOptions: { threshold: 0, rootMargin: "0px" },
    onTick: (t) => {
      const dt = 0.001 * t.delta;
      const h = hover + (+hovered - hover) * Math.min(1, 3.5 * dt);
      hover = h;
      dash += dt * DASH_SPEED * (1 + 2 * h);
      angle += dt * SPIN * (1 + 0.55 * h);
      const offset = -(dash % 7);
      for (const e of edges) e.setAttribute("stroke-dashoffset", String(offset));
      const opacity = 0.38 + 0.22 * h + (0.35 + 0.3 * h) * (0.5 + 0.5 * Math.sin(angle));
      const inner = 0.28 - 0.13 * h;
      const width = 1.75 + 0.75 * h;
      NODES.forEach((n, i) => {
        arcs[i].style.opacity = String(opacity);
        arcs[i].setAttribute("stroke-width", String(width));
        const a = n.startAngle + angle;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        grads[i].setAttribute("x1", String(n.cx + cos * n.r * inner));
        grads[i].setAttribute("y1", String(n.cy + sin * n.r * inner));
        grads[i].setAttribute("x2", String(n.cx + cos * n.r));
        grads[i].setAttribute("y2", String(n.cy + sin * n.r));
      });
    },
  });
  link.addEventListener("mouseenter", () => (hovered = true));
  link.addEventListener("mouseleave", () => (hovered = false));
}
