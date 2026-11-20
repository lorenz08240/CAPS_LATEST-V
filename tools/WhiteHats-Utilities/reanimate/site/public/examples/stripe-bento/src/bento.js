// Bento card shell: hover growth variables, pointer-following border glow, lazy widget mount.
// Each card names its widget in data-widget; src/widgets/<name>.js exports
// mount(container, { card, slot }) where slot is "graphic" (foreground DOM) or "background" (canvas),
// called once per .lazy-animation in the card. It may return a promise that resolves when the
// first frame is ready; the container fades in two frames later.

const EXPAND_AMOUNT = 12; // px the card grows on hover, split over both edges
const LAZY_ROOT_MARGIN = "800px";
const MOUSE_THROTTLE_MS = 50;

function pageRect(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
}

function debounce(fn, ms) {
  let id;
  return () => {
    clearTimeout(id);
    id = setTimeout(fn, ms);
  };
}

// Where a ray from the card centre towards the pointer leaves the card box.
function edgePoint(dirX, dirY, halfW, halfH) {
  const tx = dirX > 0 ? halfW / dirX : dirX < 0 ? -halfW / dirX : Infinity;
  const ty = dirY > 0 ? halfH / dirY : dirY < 0 ? -halfH / dirY : Infinity;
  const t = Math.min(tx, ty);
  return Number.isFinite(t) ? { x: dirX * t, y: dirY * t } : null;
}

function setupCard(card) {
  const gradient = card.querySelector(".modular-solutions-bento-card__border-color-gradient");
  let rect = pageRect(card);

  const measure = () => {
    rect = pageRect(card);
    const growY = EXPAND_AMOUNT / 2;
    const growX = (rect.width / rect.height) * growY;
    card.style.setProperty("--card-shift-x", `${-growX}px`);
    card.style.setProperty("--card-shift-y", `${-growY}px`);
    card.style.setProperty("--card-grow-x", `${growX}px`);
    card.style.setProperty("--card-grow-y", `${growY}px`);
  };
  measure();
  new ResizeObserver(debounce(measure, 300)).observe(document.body);

  if (!matchMedia("(min-width: 940px)").matches) return;
  let last = 0;
  card.addEventListener(
    "mousemove",
    (e) => {
      const now = performance.now();
      if (now - last < MOUSE_THROTTLE_MS) return;
      last = now;
      const dx = e.pageX - (rect.x + rect.width / 2);
      const dy = e.pageY - (rect.y + rect.height / 2);
      const len = Math.hypot(dx, dy);
      if (!len) return;
      const p = edgePoint(dx / len, dy / len, rect.width / 2, rect.height / 2);
      if (!p) return;
      gradient.style.setProperty("--card-mouse-x", `${p.x}px`);
      gradient.style.setProperty("--card-mouse-y", `${p.y}px`);
    },
    { passive: true },
  );
}

function setupLazy(card) {
  const name = card.dataset.widget;
  if (!name) return;
  for (const container of card.querySelectorAll(".lazy-animation")) {
    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const mod = await import(`./widgets/${name}.js`);
        await mod.mount(container, { card, slot: container.dataset.slot });
        requestAnimationFrame(() => requestAnimationFrame(() => container.classList.add("lazy-animation--loaded")));
      },
      { rootMargin: LAZY_ROOT_MARGIN },
    );
    io.observe(container);
  }
}

for (const card of document.querySelectorAll("[data-bento-card-root]")) {
  setupCard(card);
  setupLazy(card);
}
