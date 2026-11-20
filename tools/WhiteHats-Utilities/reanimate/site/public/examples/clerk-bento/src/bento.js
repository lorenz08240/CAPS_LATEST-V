// clerk.com feature grid shell: mounts each card's widget into its visual slot.
//
// For every [data-widget="<slug>"] slot, in parallel:
//   1. fetch ./widgets/<slug>.html  → slot.innerHTML (only on HTTP 200)
//   2. <link rel="stylesheet" href="./widgets/<slug>.css"> in <head> (a 404 just fires "error")
//   3. import("./widgets/<slug>.js") → mount(slot, card), card being the slot's .clerk-card
// A widget mounts as soon as its own three files have settled; missing files are skipped silently.
// Paths resolve against this module, i.e. src/widgets/ next to src/bento.js.
//
// With ?card=<slug> only that card's widget is mounted.
// Progress for recorders: each slot gets data-widget-state="loading" → "mounted" | "static" | "empty" |
// "error"; when every slot has settled, <html data-widgets="ready"> and window.clerkBento.ready resolves.
//
// Touch screens (an addition, clerk.com has none): the cards follow react-aria's useHover, which ignores touch,
// so on a phone they would never play. Where nothing can hover, a card plays while at least half of it is on
// screen, stops once it has left, and a tap toggles it. The shell sends the card the events a mouse would and
// sets .is-hovered for the CSS group-hover parts, so the widgets themselves are unchanged.

const WIDGETS = new URL("./widgets/", import.meta.url);

async function loadHtml(slug) {
  try {
    const res = await fetch(new URL(`${slug}.html`, WIDGETS), { cache: "no-cache" });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

function loadCss(slug) {
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(`${slug}.css`, WIDGETS).href;
    link.dataset.widgetCss = slug; // not data-widget: that marks the slots
    link.onload = () => resolve(true);
    link.onerror = () => {
      link.remove();
      resolve(false);
    };
    document.head.append(link);
  });
}

async function loadJs(slug) {
  try {
    return await import(new URL(`${slug}.js`, WIDGETS).href);
  } catch (err) {
    // a missing module is expected while widgets are added one by one; anything else is a bug worth seeing
    const missing = /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i;
    if (!missing.test(String(err?.message))) console.error(`[clerk-bento] ${slug}.js failed to load`, err);
    return null;
  }
}

async function mountWidget(slot) {
  const slug = slot.dataset.widget;
  const card = slot.closest(".clerk-card");
  slot.dataset.widgetState = "loading";
  const htmlP = loadHtml(slug).then((html) => {
    if (html !== null) slot.innerHTML = html;
    return html !== null;
  });
  const [hasHtml, hasCss, mod] = await Promise.all([htmlP, loadCss(slug), loadJs(slug)]);
  try {
    if (typeof mod?.mount === "function") {
      await mod.mount(slot, card);
      slot.dataset.widgetState = "mounted";
    } else {
      slot.dataset.widgetState = hasHtml || hasCss ? "static" : "empty";
    }
  } catch (err) {
    slot.dataset.widgetState = "error";
    console.error(`[clerk-bento] mount() of ${slug} threw`, err);
  }
}

// ?card=<slug> only shows (and so only mounts) that card's widget
const only = document.documentElement.dataset.card;
const slots = [...document.querySelectorAll("[data-widget]")].filter((s) => !only || s.dataset.widget === only);
const ready = Promise.allSettled(slots.map(mountWidget)).then(() => {
  document.documentElement.dataset.widgets = "ready";
});
window.clerkBento = { ready };

function playOnScreen(card) {
  let on = false;
  const set = (v) => {
    if (v === on) return;
    on = v;
    card.classList.toggle("is-hovered", v);
    card.dispatchEvent(new PointerEvent(v ? "pointerenter" : "pointerleave", { pointerType: "mouse", isPrimary: true }));
    card.dispatchEvent(new MouseEvent(v ? "mouseenter" : "mouseleave"));
  };
  // iOS sends a real mouseenter on tap and mouseleave on the next tap elsewhere; only the shell's count here
  for (const type of ["mouseenter", "mouseleave"]) card.addEventListener(type, (e) => e.isTrusted && e.stopImmediatePropagation(), true);
  new IntersectionObserver(([e]) => (e.intersectionRatio >= 0.5 ? set(true) : !e.isIntersecting && set(false)), { threshold: [0, 0.5] }).observe(card);
  card.addEventListener("click", () => set(!on));
}

if (matchMedia("(hover: none)").matches) {
  ready.then(() => slots.forEach((s) => s.dataset.widgetState === "mounted" && playOnScreen(s.closest(".clerk-card"))));
}
