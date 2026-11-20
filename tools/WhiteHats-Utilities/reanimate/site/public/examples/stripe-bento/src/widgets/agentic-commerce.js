// "Monetize through agentic commerce" bento card: a chat graphic (slot "graphic") over a particle ring
// (slot "background"), both ported from stripe.com. See agentic-commerce/ for the parts.

import { mountChat } from "./agentic-commerce/chat.js";
import { AgenticParticles } from "./agentic-commerce/particles.js";
import { warmUpRenderLoop } from "./agentic-commerce/render-loop.js";
import { gpuSupportsWebGL } from "./agentic-commerce/webgl-support.js";

const FALLBACK_IMAGE = new URL("../../assets/img/agentic-particles.webp", import.meta.url).href;

warmUpRenderLoop();

function background(className, child) {
  const el = document.createElement("div");
  el.className = "agentic-graphic__background";
  const inner = document.createElement(child);
  inner.className = className;
  el.append(inner);
  return el;
}

// Static picture of the ring for GPUs that cannot run the live canvas.
function mountFallback(container) {
  const el = background("agentic-graphic__background-static", "div");
  const img = document.createElement("img");
  Object.assign(img, { src: FALLBACK_IMAGE, width: 1028, height: 1468, alt: "", loading: "lazy" });
  el.firstElementChild.append(img);
  container.replaceChildren(el);
}

function mountParticles(container) {
  if (!gpuSupportsWebGL()) return mountFallback(container);
  const el = background("agentic-graphic__background-canvas", "canvas");
  const canvas = el.firstElementChild;
  canvas.setAttribute("aria-hidden", "true");
  container.append(el);

  let particles;
  try {
    particles = new AgenticParticles(canvas);
  } catch {
    return mountFallback(container);
  }

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  const sync = () => {
    particles.paused = !visible || reducedMotion.matches;
  };
  reducedMotion.addEventListener("change", sync);

  // Like stripe.com: the scene starts once 10 % of the ring area is visible, and the ring "thinks"
  // (pulls tight and sweeps) from 1 s to 3 s after that. The container fades in once the sprite sheet
  // is loaded, so the particles fade in with it as they do on stripe.com.
  return new Promise((resolve) => {
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || !entry.isIntersecting || entry.intersectionRatio < 0.1) return;
        io.disconnect();
        visible = true;
        particles.initScene();
        sync();
        particles.think(2000, 1000);
        resolve(particles.ready);
      },
      { threshold: 0.1 },
    );
    io.observe(el);
  });
}

export function mount(container, { slot }) {
  if (slot === "graphic") return mountChat(container);
  if (slot === "background") return mountParticles(container);
}
