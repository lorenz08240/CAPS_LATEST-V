// vercel.com/products/previews hero toolbar: hover and drag, ported from the page's React component (HeroToolbar).
//
// State, as on vercel.com:
//   hovered  the pointer is inside the toolbar's wrapper. Every tag gets data-hover="true", which on its own
//            gives each tag its colour (you see that when the pointer comes in over the pill's edge).
//   feature  the toolbar group the pointer last entered. Its tag keeps its colour, the other tags get
//            data-fade="true" (blur 4px, grey) and the other groups data-fade="true" (icons at 25 %); the group
//            itself gets data-highlight="true". Separators and padding do not clear it, only leaving the wrapper does.
// Drag: press on the toolbar and move. The wrapper follows the pointer and both rows of tags blur by
// (|dx| + |dy|) / 10 px, at most 5 px. On release it glides back in 500 ms and the blur clears in 250 ms.
// All the transitions themselves are CSS (toolbar.css); this file only sets attributes and inline styles.

const wrapper = document.querySelector(".cursor-grab");
const rows = [...document.querySelectorAll(".vp-row")];
const tags = [...document.querySelectorAll(".vp-tag")];
const groups = [...document.querySelectorAll("._9BHB5W_toolbar > [aria-label]")];

let hovered = false;
let feature = null;

function render() {
  for (const tag of tags) {
    tag.dataset.hover = String(hovered);
    if (feature) tag.dataset.fade = String(feature !== tag.textContent);
    else delete tag.dataset.fade;
  }
  for (const group of groups) {
    const name = group.getAttribute("aria-label");
    group.dataset.fade = String(!!feature && feature !== name);
    group.dataset.highlight = String(feature === name);
  }
}

// React gives mouseenter/mouseleave updates "continuous" priority: they render in a Scheduler task (a
// MessageChannel message) after the event, not inside it. Rendering the same way keeps the transitions starting
// on the same frame as on vercel.com.
const channel = new MessageChannel();
let queued = false;
channel.port1.onmessage = () => {
  queued = false;
  render();
};
const update = () => {
  if (queued) return;
  queued = true;
  channel.port2.postMessage(null);
};

for (const group of groups) {
  group.addEventListener("mouseenter", () => {
    feature = group.getAttribute("aria-label");
    update();
  });
}
wrapper.addEventListener("mouseenter", () => {
  hovered = true;
  update();
});
wrapper.addEventListener("mouseleave", () => {
  feature = null;
  hovered = false;
  update();
});

// ---------- drag ----------
let grab = null;
const blurRows = (px) => {
  const filter = px <= 0 ? "" : `blur(${px}px)`;
  for (const row of rows) row.style.filter = filter;
};
const transitionRows = (value) => {
  for (const row of rows) row.style.transition = value;
};
const release = (e) => {
  if (!grab) return;
  grab = null;
  wrapper.releasePointerCapture(e.pointerId);
  document.body.classList.remove("geist-grabbing");
  wrapper.style.transition = "transform 500ms ease-out";
  wrapper.style.transform = "";
  transitionRows("filter 250ms ease-out");
  blurRows(0);
};

wrapper.addEventListener("pointerdown", (e) => {
  wrapper.setPointerCapture(e.pointerId);
  grab = { x: e.clientX, y: e.clientY };
  wrapper.style.transition = "none";
  transitionRows("none");
  document.body.classList.add("geist-grabbing");
});
wrapper.addEventListener("pointermove", (e) => {
  if (!grab) return;
  const dx = e.clientX - grab.x;
  const dy = e.clientY - grab.y;
  wrapper.style.transform = `translate(${dx}px, ${dy}px)`;
  blurRows(Math.min(5, Math.max(0, (Math.abs(dx) + Math.abs(dy)) / 10)));
});
wrapper.addEventListener("pointerup", release);
wrapper.addEventListener("pointercancel", release);
