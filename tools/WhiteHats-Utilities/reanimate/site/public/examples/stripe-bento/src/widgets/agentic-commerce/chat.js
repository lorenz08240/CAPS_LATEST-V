// The chat in the agentic-commerce card, ported from stripe.com (AgenticCommerceGraphic + DomGraphic).
//
// The graphic is laid out at a fixed 324x378 design size and scaled down to its box when narrower.
// When 10 % of it is visible the entrance sequence plays once: the user bubble rises in, the agent
// bubble follows and its words fade in one after another, then the product card rises in.

const IMG = new URL("../../../assets/img/", import.meta.url).href;
const SOURCE_WIDTH = 324;
const SOURCE_HEIGHT = 378;
const RESIZE_THROTTLE_MS = 500;

const USER_MESSAGE = "I’m refreshing my wardrobe. Can you recommend some cozy, comfortable basics in size M?";
const AGENT_MESSAGE = "Absolutely. Here are a few comfy essentials that pair well and could be a good starting point:";
const DESCRIPTION =
  "AI chatbot interface showing a user request to purchase specific items. The chatbot interface offers a “Buy now” option for these selected items.";
const BRAND = "Cartsy";
const PRODUCTS = [
  { description: "Deluxe Shirt", variant: "Blue - Medium", price: "$26.00", image: "shirt-blue" },
  { description: "Essential Hoodie", variant: "Navy - Medium", price: "$48.00", image: "hoodie-navy" },
];

// Easings from stripe.com's easing table and motion's defaults.
const EASE_OUT_QUART = "cubic-bezier(0.165, 0.84, 0.44, 1)";
const EASE_OUT = "cubic-bezier(0, 0, 0.58, 1)"; // motion "easeOut", the default for sequence segments
const RISE_FROM = { opacity: 0, transform: "translateY(20px)" };
const RISE_TO = { opacity: 1, transform: "translateY(0)" };

// Entrance sequence (seconds), as in stripe.com's motion `animate` sequence.
const SEQUENCE = {
  user: { at: 0.25, duration: 0.75 },
  agent: { at: 1.0, duration: 0.35 },
  words: { at: 1.2, duration: 0.1, stagger: 0.06 },
  products: { at: 1.4, duration: 0.5 },
};

const html = String.raw;
const C = "agentic-commerce-graphic";

function template() {
  const words = AGENT_MESSAGE.split(" ").map((word) => html`<span>${word} </span>`).join("");
  const each = (render) => PRODUCTS.map(render).join("");
  return html`
    <div class="${C}__wrapper">
      <div class="dom-graphic dom-graphic--variant-default ${C}" data-status="measuring" role="img" aria-label="${DESCRIPTION}"
        style="--graphic-source-width: ${SOURCE_WIDTH}px; --graphic-source-height: ${SOURCE_HEIGHT}px; --graphic-aspect-ratio: ${SOURCE_WIDTH} / ${SOURCE_HEIGHT}; --graphic-scale: 1; --graphic-max-width: ${SOURCE_WIDTH}px;">
        <div class="dom-graphic__content dom-graphic__content--horizontal-scale-left" aria-hidden="true">
          <div class="${C}__layout">
            <div class="${C}__chat">
              <div class="${C}__chat-bubble ${C}__chat-bubble--user">${USER_MESSAGE}</div>
              <div class="${C}__chat-bubble ${C}__chat-bubble--agent">${words}</div>
            </div>
            <div class="${C}__products">
              <div class="${C}__products-grid">
                <div class="${C}__product-cards__layout">${each(() => html`<div class="${C}__product-card"></div>`)}</div>
                ${each((p) => html`<div class="${C}__product-image"><picture>
                  <source type="image/webp" srcset="${IMG}${p.image}-160.webp 1x, ${IMG}${p.image}-320.webp 2x">
                  <img loading="lazy" width="320" height="228" alt="" src="${IMG}${p.image}-160.webp">
                </picture></div>`)}
                ${each((p) => html`<div class="${C}__product-description">${p.description}</div>`)}
                ${each((p) => html`<div class="${C}__product-variant">${p.variant}</div>`)}
                ${each((p) => html`<div class="${C}__product-price tabular-nums--tight">${p.price}</div>`)}
                ${each(() => html`<div class="${C}__product-brand">${BRAND}</div>`)}
              </div>
              <div class="${C}__cta"><div class="${C}__cta-button">Buy now</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// DomGraphic: scale the fixed-size content down to the measured width, and report "ready" once measured.
function fitToWidth(graphic) {
  let last = 0;
  let pending = null;
  const apply = () => {
    pending = null;
    last = performance.now();
    const width = Math.round(graphic.getBoundingClientRect().width);
    if (width <= 0) return;
    graphic.style.setProperty("--graphic-scale", String(Math.min(1, width / SOURCE_WIDTH)));
    graphic.dataset.status = "ready";
  };
  apply();
  new ResizeObserver(() => {
    if (pending) return;
    const wait = Math.max(0, RESIZE_THROTTLE_MS - (performance.now() - last));
    pending = setTimeout(apply, wait);
  }).observe(graphic);
}

const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");

function playEntrance(root) {
  const q = (sel) => root.querySelector(sel);
  const user = q(`.${C}__chat-bubble--user`);
  const agent = q(`.${C}__chat-bubble--agent`);
  const products = q(`.${C}__products`);
  const words = [...agent.children];
  const animations = [];

  // The starting state applies at once (the sequence's zero-length first steps). The timeline starts
  // two frames later, as on stripe.com: motion reads the keyframes in the next frame and its clock
  // starts on the frame after that (measured lag ≈ 50 ms behind the starting state there).
  // The rest state is then set inline (as motion leaves it) and each animation fills backwards, so an
  // element holds its starting state until its own start time.
  const steps = [];
  const run = (el, from, to, { at, duration }, easing) => {
    Object.assign(el.style, from);
    steps.push(() => {
      Object.assign(el.style, to);
      animations.push(el.animate([from, to], { duration: duration * 1000, delay: at * 1000, easing, fill: "backwards" }));
    });
  };
  run(user, RISE_FROM, RISE_TO, SEQUENCE.user, EASE_OUT_QUART);
  run(agent, RISE_FROM, RISE_TO, SEQUENCE.agent, EASE_OUT_QUART);
  run(products, RISE_FROM, RISE_TO, SEQUENCE.products, EASE_OUT_QUART);
  const { at, duration, stagger } = SEQUENCE.words;
  words.forEach((word, i) => run(word, { opacity: 0 }, { opacity: 1 }, { at: at + i * stagger, duration }, EASE_OUT));
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (reducedMotionQuery.matches) return finish();
      for (const step of steps) step();
    }),
  );

  // Turning reduced motion on mid-sequence jumps to the end state.
  const finish = () => {
    for (const el of [user, agent, products, ...words]) el.style.cssText = "";
    for (const a of animations) a.cancel();
    reducedMotionQuery.removeEventListener("change", onChange);
  };
  const onChange = () => {
    if (reducedMotionQuery.matches) finish();
  };
  reducedMotionQuery.addEventListener("change", onChange);
}

export function mountChat(container) {
  container.innerHTML = template().trim().replace(/>\s+</g, "><");
  const wrapper = container.firstElementChild;
  fitToWidth(wrapper.querySelector(".dom-graphic"));

  const io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry || !entry.isIntersecting || entry.intersectionRatio < 0.1) return;
      io.disconnect();
      wrapper.classList.add(`${C}__wrapper--showing`);
      if (!reducedMotionQuery.matches) playEntrance(wrapper);
    },
    { threshold: 0.1 },
  );
  io.observe(wrapper);
}
