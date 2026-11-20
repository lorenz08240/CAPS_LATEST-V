// "Create a card issuing program" bento background: a three.js card that tilts towards the
// pointer over an iridescent wave (port of stripe.com's IssuingGraphicBackground).
//
// mount(container, { card, slot }) is called once by the shell (src/bento.js) for the
// background slot when the card comes within 800px of the viewport. It resolves after the
// textures are loaded and the first frame is drawn; the shell then fades the container in.
//
// Like stripe.com:
// - the scene only animates while within 100px of the viewport, and never with
//   prefers-reduced-motion: reduce (one still frame is drawn instead);
// - without WebGL2 or when the capability check fails, a static card image is shown.

import { TEXTURES } from "./issuing/config.js";
import { IssuingGraphic } from "./issuing/graphic.js";
import { warmUpRenderLoop } from "./issuing/render-loop.js";

warmUpRenderLoop();

function supportsWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function mountFallback(container) {
  const background = el("div", "issuing-graphic__background");
  const wrapper = el("div", "issuing-graphic__background-static");
  const img = el("img", null, { src: TEXTURES.placeholder, width: "894", height: "1456", alt: "", decoding: "async" });
  wrapper.append(img);
  background.append(wrapper);
  container.replaceChildren(background);
  return img.decode().catch(() => {});
}

const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const prefersReducedMotion = () => !reducedMotionQuery || reducedMotionQuery.matches;

export function mount(container, { slot } = {}) {
  if (slot !== "background") return Promise.resolve();
  if (!supportsWebGL()) return mountFallback(container);

  const background = el("div", "issuing-graphic__background");
  const canvas = el("canvas", "issuing-graphic__background-canvas", { "aria-hidden": "true" });
  background.append(canvas);
  container.replaceChildren(background);

  return new Promise((resolve) => {
    let graphic;
    try {
      graphic = new IssuingGraphic(canvas, { onFirstFrame: resolve });
    } catch {
      mountFallback(container).then(resolve);
      return;
    }
    graphic.paused = true;
    graphic.initScene();

    // Animate only while near the viewport and when motion is allowed.
    let intersecting = false;
    const update = () => {
      graphic.paused = !intersecting || prefersReducedMotion();
    };
    new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        intersecting = entry.isIntersecting && entry.intersectionRatio >= 0;
        update();
      },
      { threshold: 0, rootMargin: "100px" },
    ).observe(background);
    reducedMotionQuery?.addEventListener("change", update);
  });
}
