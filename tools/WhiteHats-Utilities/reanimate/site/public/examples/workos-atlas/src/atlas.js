// workos.com/atlas, "Connected to all your tools" (SignalDome): Atlas the robot at a laptop under a
// dome of 38 integration chips. When the visual is 60% in view the chips spring out from the antenna,
// the laptop lid opens, the screen glare comes on and the eyes start reading. While it stays in view,
// every 1.65-2.18 s the antenna reaches out to one more chip (picked from a shuffled bag, away from the
// links still alive, preferring another ring and another brand hue): a line draws in, the chip swells
// inside a ring in its brand colour, a ripple goes out, and the link fades about 5 s later.
// Layout, timings, easings and the picking rules are the original's; see .reanimate/workos-atlas.

import { springEasing, tween, waapi, springFollower } from "./motion.js";
import { mountFaceShader } from "./face.js";

const ICONS = "./assets/icons/";

const LAYOUT = {
  frameW: 536,
  frameH: 536,
  botSize: 336,
  services: [
    [["salesforce", "Salesforce"], ["github", "GitHub"], ["google-drive", "Google Drive"], ["notion", "Notion"], ["linear", "Linear"]],
    [["gitlab", "GitLab"], ["snowflake", "Snowflake"], ["jira", "Jira"], ["hubspot", "HubSpot"], ["datadog", "Datadog"], ["gmail", "Gmail"], ["stripe", "Stripe"], ["sentry", "Sentry"]],
    [["mailchimp", "Mailchimp"], ["dropbox", "Dropbox"], ["quickbooks", "QuickBooks"], ["discord", "Discord"], ["airtable", "Airtable"], ["linkedin", "LinkedIn"], ["zendesk-sell", "Zendesk"], ["microsoft-teams", "Microsoft Teams"], ["intercom", "Intercom"], ["gong", "Gong"], ["front", "Front"]],
    [["typeform", "Typeform"], ["bitbucket", "Bitbucket"], ["netlify", "Netlify"], ["google", "Google"], ["digitalocean", "DigitalOcean"], ["ramp", "Ramp"], ["microsoft", "Microsoft"], ["pipedrive", "Pipedrive"], ["paypal", "PayPal"], ["survey-monkey", "SurveyMonkey"], ["gusto", "Gusto"], ["buffer", "Buffer"], ["close", "Close"], ["contentful", "Contentful"]],
  ].map((ring) => ring.map(([slug, name]) => ({ slug, name }))),
  ringDropPx: 40,
  laptop: { widthPx: 260, bottomPx: -16 },
  rings: [
    { r: 110, chip: 44, fromDeg: 20, toDeg: 160 },
    { r: 160, chip: 37, fromDeg: 11, toDeg: 169 },
    { r: 210, chip: 30, fromDeg: 5.5, toDeg: 174.5 },
    { r: 245, chip: 22, fromDeg: 2.3, toDeg: 177.7, horizon: true },
  ],
};

// How much of each logo's box is ink, to even out their optical size (--icon-scale).
const ICON_METRICS = { airtable: { box: 0.735, ink: 0.564, max: 0.8 }, bitbucket: { box: 0.659, ink: 0.584, max: 0.695 }, buffer: { box: 0.756, ink: 0.524, max: 0.805 }, close: { box: 0.781, ink: 0.543, max: 0.805 }, contentful: { box: 0.756, ink: 0.537, max: 0.805 }, datadog: { box: 0.825, ink: 0.539, max: 0.849 }, digitalocean: { box: 0.801, ink: 0.54, max: 0.805 }, discord: { box: 0.733, ink: 0.617, max: 0.835 }, dropbox: { box: 0.818, ink: 0.579, max: 0.85 }, front: { box: 0.675, ink: 0.611, max: 0.667 }, github: { box: 0.831, ink: 0.555, max: 0.83 }, gitlab: { box: 0.744, ink: 0.572, max: 0.753 }, gmail: { box: 0.625, ink: 0.511, max: 0.715 }, gong: { box: 0.962, ink: 0.579, max: 0.998 }, google: { box: 0.773, ink: 0.559, max: 0.781 }, "google-drive": { box: 0.686, ink: 0.566, max: 0.725 }, gusto: { box: 0.718, ink: 0.55, max: 0.863 }, hubspot: { box: 0.981, ink: 0.553, max: 1 }, intercom: { box: 0.953, ink: 0.854, max: 0.952 }, jira: { box: 0.719, ink: 0.499, max: 0.73 }, linear: { box: 1, ink: 0.784, max: 1 }, linkedin: { box: 0.906, ink: 0.902, max: 0.906 }, mailchimp: { box: 1, ink: 0.892, max: 1 }, microsoft: { box: 0.703, ink: 0.672, max: 0.703 }, "microsoft-teams": { box: 0.968, ink: 0.799, max: 1 }, netlify: { box: 0.942, ink: 0.4, max: 1 }, notion: { box: 0.903, ink: 0.864, max: 0.92 }, paypal: { box: 0.805, ink: 0.648, max: 0.805 }, pipedrive: { box: 0.842, ink: 0.623, max: 0.949 }, quickbooks: { box: 0.994, ink: 0.883, max: 0.993 }, ramp: { box: 0.74, ink: 0.411, max: 0.805 }, salesforce: { box: 0.686, ink: 0.58, max: 0.816 }, sentry: { box: 0.777, ink: 0.456, max: 0.822 }, snowflake: { box: 0.975, ink: 0.658, max: 1 }, stripe: { box: 0.612, ink: 0.507, max: 0.725 }, "survey-monkey": { box: 0.673, ink: 0.401, max: 0.805 }, typeform: { box: 0.801, ink: 0.226, max: 0.805 }, "zendesk-sell": { box: 0.7, ink: 0.532, max: 0.8 } };

// Brand colours; null = no usable hue (falls back to the neutral #29363d).
const BRAND = { airtable: "#ed3049", bitbucket: "#2684ff", buffer: null, close: "#1463ff", contentful: "#f05751", datadog: "#632ca6", digitalocean: "#0080ff", discord: "#5865f2", dropbox: "#007ee5", front: "#ff4802", github: null, gitlab: "#e24329", gmail: "#ea4335", gong: "#7b4ff5", google: "#e54335", "google-drive": "#ffba00", gusto: "#f45d48", hubspot: "#ff7a59", intercom: "#081d34", jira: "#2684ff", linear: null, linkedin: "#0a66c2", mailchimp: "#ffe01b", microsoft: "#f35325", "microsoft-teams": "#5059c9", netlify: "#00c7b7", notion: null, paypal: "#009cde", quickbooks: "#2ca01c", ramp: null, salesforce: "#00a1e0", sentry: "#362d59", snowflake: "#29b5e8", stripe: "#635bff", pipedrive: "#017737", "survey-monkey": null, typeform: null, "zendesk-sell": "#03363d" };
const NEUTRAL = "#29363d";

// Seconds. Every link: reach (line draws in), then the chip swells and a ripple goes out, it holds,
// then releases (line and ring fade).
const T = { reachS: 0.63, firmS: 0.24, rippleS: 0.62 * 1.5, swellS: 0.83 * 1.5, holdS: 1.875, releaseS: 0.8 * 1.5 };
const EVERY = { everyS: Math.max(1.1 * 1.5, T.reachS + T.rippleS), stretch: 0.32 };
const SETTLE_S = Math.max(T.rippleS, T.swellS);
const SWELL_TIMES = [0, 0.2, 0.56, 1];
const SWELL_EASE = ["outCubic", "linear", "inOutQuad"];

const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// ---------- colour: brand hex -> OKLCH at L 0.58, C 0.17 (gamut-mapped by lowering chroma) ----------
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function hexToOklch(hex) {
  let h = hex.replace("#", "");
  h = h.length === 3 ? [...h].map((c) => c + c).join("") : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => toLinear(parseInt(h.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, c: Math.hypot(A, B), h: Math.atan2(B, A) };
}
function oklchToLinear({ l, c, h }) {
  const a = Math.cos(h) * c, b = Math.sin(h) * c;
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S];
}
const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1.0001);
const lerp = (a, b, t) => a + (b - a) * t;
function linkColor(slug) {
  const o = hexToOklch(BRAND[slug] ?? NEUTRAL);
  const grey = o.c < 0.025;
  const target = { l: lerp(o.l, 0.58, 1), c: grey ? o.c : lerp(o.c, 0.17, 1), h: o.h };
  let { c } = target, rgb = oklchToLinear(target);
  while (!inGamut(rgb) && c > 0) { c = Math.max(0, c - 0.002); rgb = oklchToLinear({ ...target, c }); }
  return "#" + rgb.map((v) => {
    const x = Math.min(1, Math.max(0, v));
    return Math.round(255 * Math.min(1, Math.max(0, x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055))).toString(16).padStart(2, "0");
  }).join("");
}
function brandHue(slug) {
  const o = hexToOklch(BRAND[slug] ?? NEUTRAL);
  return o.c < 0.025 ? null : ((180 * o.h) / Math.PI + 360) % 360;
}

// ---------- geometry ----------
function computeLayout(L) {
  const { frameW, frameH, botSize, rings, services, ringDropPx } = L;
  const botLeft = (frameW - botSize) / 2, botTop = frameH - botSize;
  const ox = botLeft + 0.5015 * botSize, oy = botTop + 0.0879 * botSize; // antenna tip
  const cy = oy + ringDropPx; // the dome's centre sits a little below the antenna
  const nodes = [];
  rings.forEach((ring, ri) => {
    const list = services[ri], span = ring.toDeg - ring.fromDeg;
    list.forEach((service, i) => {
      const f = list.length > 1 ? i / (list.length - 1) : 0.5;
      const a = ((ring.toDeg - span * f) * Math.PI) / 180;
      const x = round(ox + ring.r * Math.cos(a)), y = round(cy - ring.r * Math.sin(a));
      let strength = 1;
      if (ring.horizon) { // the outer ring fades toward both ends
        const d = Math.abs(2 * f - 1);
        if (d > 0.5) { const k = (d - 0.5) / 0.5; strength = round(1 - k * k * (3 - 2 * k) * 0.38, 3); }
      }
      nodes.push({ id: `${ri}-${service.slug}`, service, ring: ri, x, y, size: ring.chip, radius: round(Math.hypot(x - ox, y - oy)), horizon: ring.horizon === true, strength });
    });
  });
  const ballR = 0.0317 * botSize;
  const routes = [];
  for (const n of nodes) {
    if (n.horizon) continue;
    const dx = n.x - ox, dy = n.y - oy, ux = dx / n.radius, uy = dy / n.radius, reach = n.radius - n.size / 2 - 5;
    routes.push({ nodeId: n.id, slug: n.service.slug, x1: round(ox + ux * ballR), y1: round(oy + uy * ballR), x2: round(ox + ux * reach), y2: round(oy + uy * reach), chipX: n.x, chipY: n.y, chipR: n.size / 2, length: round(reach - ballR), angleDeg: round((180 * Math.atan2(-dy, dx)) / Math.PI, 1), ring: n.ring });
  }
  let minR = Infinity, maxR = -Infinity;
  for (const n of nodes) { minR = Math.min(minR, n.radius); maxR = Math.max(maxR, n.radius); }
  const range = maxR - minR || 1;
  for (const n of nodes) n.enter = { fromX: (ox - n.x) * 0.18, fromY: (oy - n.y) * 0.18, delay: ((n.radius - minR) / range) * 0.38 };
  return { ox, oy, ballR, botLeft, botTop, nodes, routes };
}

// ---------- picking the next chip ----------
const angleGap = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
const farFromAll = (r, others) => others.every((o) => angleGap(r.angleDeg, o.angleDeg) >= 40);
function score(r, active) {
  const sameRing = active.filter((o) => o.ring === r.ring).length;
  const hue = brandHue(r.slug);
  let nearestHue = 180, bothGrey = 0;
  for (const o of active) {
    const oh = brandHue(o.slug);
    if (hue === null || oh === null) { if (hue === oh) bothGrey += 1; continue; }
    nearestHue = Math.min(nearestHue, angleGap(hue, oh));
  }
  return -100 * sameRing - 60 * bothGrey + Math.min(nearestHue, 30);
}
function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function createPicker(routes, rand = Math.random) {
  let bag = [];
  const recent = [];
  const memory = Math.min(8, Math.floor(routes.length / 2) - 1);
  const candidates = (active, keep) => {
    const skip = recent.slice(recent.length - keep);
    return bag.filter((r) => farFromAll(r, active) && !skip.includes(r));
  };
  return (active) => {
    if (bag.length === 0) bag = shuffle(routes, rand);
    let list = candidates(active, memory);
    if (list.length === 0) { bag = [...bag, ...shuffle(routes, rand)]; list = candidates(active, memory); }
    if (list.length === 0) list = candidates(active, 0);
    if (list.length === 0) return null;
    const best = list.reduce((a, b) => (score(b, active) > score(a, active) ? b : a));
    const i = bag.indexOf(best);
    if (i !== -1) bag.splice(i, 1);
    recent.push(best);
    if (recent.length > memory) recent.shift();
    return best;
  };
}
// Reduced motion: three fixed links, one per ring, 40 degrees apart.
function staticRoutes(routes) {
  const rings = [...new Set(routes.map((r) => r.ring))].sort();
  const out = [];
  let grew = true;
  while (out.length < 3 && grew) {
    grew = false;
    for (const ring of rings) {
      if (out.length === 3) break;
      const r = routes.find((x) => x.ring === ring && !out.includes(x) && farFromAll(x, out));
      if (r) { out.push(r); grew = true; }
    }
  }
  return out;
}

// ---------- DOM ----------
const SVG = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(SVG, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const lineD = (r) => `M ${r.x1} ${r.y1} L ${r.x2} ${r.y2}`;
let uid = 0;

// The line fades in over its first 24 px (or a third) from the antenna: a gradient mask.
function lineMask(defsParent, route, W, H) {
  const id = `atlas-mask-${uid++}`;
  const f = Math.min(24, 0.34 * route.length) / route.length;
  const grad = svgEl("linearGradient", { id: `${id}g`, gradientUnits: "userSpaceOnUse", x1: route.x1, y1: route.y1, x2: route.x1 + (route.x2 - route.x1) * f, y2: route.y1 + (route.y2 - route.y1) * f });
  grad.append(svgEl("stop", { offset: "0", "stop-color": "black" }), svgEl("stop", { offset: "1", "stop-color": "white" }));
  const mask = svgEl("mask", { id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H });
  mask.append(svgEl("rect", { x: 0, y: 0, width: W, height: H, fill: `url(#${id}g)` }));
  defsParent.append(grad, mask);
  return id;
}

function init(root) {
  const layout = computeLayout(LAYOUT);
  const { frameW: W, frameH: H, botSize, laptop } = LAYOUT;
  const stage = root.querySelector(".atlas-tools__stage");
  const botLayer = stage.querySelector(".atlas-tools__botLayer");
  botLayer.style.cssText = `left:${layout.botLeft}px;top:${layout.botTop}px;--bot-size:${botSize}px;--bot-clip:${Math.max(0, laptop.bottomPx)}px`;
  const laptopEl = stage.querySelector(".atlas-tools__laptop");
  laptopEl.style.cssText = `left:${layout.ox - laptop.widthPx / 2}px;bottom:${laptop.bottomPx}px;--lid-scale:${laptop.widthPx / 400}`;
  const lid = stage.querySelector(".atlas-tools__lid");
  const groundShadow = stage.querySelector(".atlas-tools__groundShadow");
  const glare = stage.querySelector(".atlas-tools__glare");
  const glareStreak = stage.querySelector(".atlas-tools__glareStreak");

  const fieldBelow = svgEl("svg", { class: "atlas-tools__field", width: W, height: H, viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
  const fieldAbove = svgEl("svg", { class: "atlas-tools__field", width: W, height: H, viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
  stage.append(fieldBelow);

  // chips
  const slots = new Map();
  for (const n of layout.nodes) {
    const slot = document.createElement("div");
    slot.className = "atlas-tools__slot" + (n.horizon ? " atlas-tools__horizon" : "");
    const m = ICON_METRICS[n.service.slug];
    const iconScale = m ? Math.min(0.73 / Math.sqrt(m.box * m.ink), 0.9 / m.max) : 1;
    slot.style.cssText = `left:${n.x - n.size / 2}px;top:${n.y - n.size / 2}px;width:${n.size}px;height:${n.size}px;--icon-scale:${iconScale};--chip-strength:${n.strength}`;
    const mover = document.createElement("div");
    mover.style.cssText = `width:100%;height:100%;opacity:0;transform:translate(${n.enter.fromX}px, ${n.enter.fromY}px) scale(0.55)`;
    const chip = document.createElement("div");
    chip.className = "atlas-tools__chip";
    chip.style.transform = "scale(1)";
    const img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    img.width = img.height = n.size;
    img.decoding = "async";
    img.loading = "lazy";
    img.src = `${ICONS}${n.service.slug}.svg`;
    chip.append(img);
    mover.append(chip);
    slot.append(mover);
    stage.append(slot);
    slots.set(n.id, { node: n, slot, mover, chip, anims: [] });
  }
  stage.append(fieldAbove);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const eyes = createEyes(root);
  let entered = false;

  // ---------- entrance (and its reverse when the visual is scrolled back below the fold) ----------
  const iconSpring = springEasing({ bounce: 0.32, visualDuration: 0.45 });
  const lidSpring = springEasing({ stiffness: 90, damping: 18, mass: 1 });
  const live = new WeakMap();
  // Like Framer Motion's WAAPI path: when an animation finishes, its end value is written to the
  // inline style and the animation is cancelled (so nothing stays composited after the entrance).
  const run = (el, key, anim, end) => {
    const m = live.get(el) ?? {};
    m[key]?.cancel();
    m[key] = anim;
    live.set(el, m);
    anim.finished.then(() => { if (m[key] !== anim) return; el.style[key] = end; anim.cancel(); delete m[key]; }, () => {});
  };
  const current = (el, prop) => getComputedStyle(el)[prop];
  const setReading = (on, animated) => {
    const shadowTo = on ? { opacity: 1, transform: "scale(1, 1)" } : { opacity: 0.62, transform: "scale(0.84, 0.9)" };
    const lidTo = on ? "rotateX(-20deg)" : "rotateX(60deg)";
    if (!animated) {
      lid.style.transform = lidTo;
      groundShadow.style.opacity = shadowTo.opacity;
      groundShadow.style.transform = shadowTo.transform;
      glare.style.opacity = glareStreak.style.opacity = on ? 1 : 0;
    } else {
      run(lid, "transform", lid.animate([{ transform: current(lid, "transform") }, { transform: lidTo }], { duration: lidSpring.duration, easing: lidSpring.easing, fill: "both" }), lidTo);
      run(groundShadow, "opacity", waapi(groundShadow, "opacity", [current(groundShadow, "opacity"), shadowTo.opacity], { duration: 0.6, ease: "easeOut" }), shadowTo.opacity);
      run(groundShadow, "transform", waapi(groundShadow, "transform", [current(groundShadow, "transform"), shadowTo.transform], { duration: 0.6, ease: "easeOut" }), shadowTo.transform);
      run(glare, "opacity", waapi(glare, "opacity", [current(glare, "opacity"), on ? 1 : 0], { duration: 0.5, delay: on ? 0.25 : 0 }), on ? 1 : 0);
      run(glareStreak, "opacity", waapi(glareStreak, "opacity", [current(glareStreak, "opacity"), on ? 1 : 0], { duration: 0.5, delay: on ? 0.3 : 0 }), on ? 1 : 0);
    }
    eyes.setReading(on);
  };
  const setEntered = (on) => {
    if (on === entered) return;
    entered = on;
    for (const { node, mover } of slots.values()) {
      const delay = on ? node.enter.delay : 0;
      const to = on ? "translate(0px, 0px) scale(1)" : `translate(${node.enter.fromX}px, ${node.enter.fromY}px) scale(0.55)`;
      run(mover, "transform", mover.animate([{ transform: current(mover, "transform") }, { transform: to }], { duration: iconSpring.duration, delay: delay * 1000, easing: iconSpring.easing, fill: "both" }), to);
      run(mover, "opacity", waapi(mover, "opacity", [current(mover, "opacity"), on ? 1 : 0], { duration: 0.22, delay, ease: "swift" }), on ? 1 : 0);
    }
    if (!reduced) setReading(on, true);
  };
  if (reduced) setReading(true, false); // the reduced-motion page shows the open laptop from the start

  // ---------- links ----------
  let links = [];
  let timer = 0, picker = null, key = 0;
  const removeLink = (l) => {
    for (const a of l.anims) if (a.stop) a.stop(); else a.cancel();
    l.below.remove();
    l.above.remove();
    const s = slots.get(l.route.nodeId);
    s.slot.classList.remove("atlas-tools__raised");
  };
  function addLink(route) {
    const color = linkColor(route.slug);
    const connectedAtS = T.reachS, releaseAtS = connectedAtS + SETTLE_S + T.holdS, lifetimeS = releaseAtS + T.releaseS;
    const l = { key: key++, route, anims: [], expiresAt: performance.now() + 1000 * lifetimeS };
    // below the chips: the line (masked near the antenna) and a white halo that swells with the chip
    l.below = svgEl("g");
    const maskId = lineMask(l.below, route, W, H);
    const wrap = svgEl("g", { mask: `url(#${maskId})` });
    const len = route.length;
    const path = svgEl("path", { class: "atlas-tools__wire", d: lineD(route), stroke: color, "stroke-dasharray": `${len} ${len}`, "stroke-dashoffset": len, "stroke-opacity": 0.26 });
    wrap.append(path);
    const hr = route.chipR + 5;
    const halo = svgEl("circle", { class: "atlas-tools__halo", cx: route.chipX, cy: route.chipY, r: hr });
    l.below.append(wrap, halo);
    fieldBelow.append(l.below);
    l.anims.push(tween([len, 0], { duration: T.reachS, ease: "inOutQuad", onUpdate: (v) => path.setAttribute("stroke-dashoffset", v) }));
    l.anims.push(tween([0.26, 0.26, 0.46, 0.46, 0], { duration: lifetimeS, times: [0, T.reachS / lifetimeS, (T.reachS + T.firmS) / lifetimeS, releaseAtS / lifetimeS, 1], ease: ["linear", "outCubic", "linear", "inOutQuad"], onUpdate: (v) => path.setAttribute("stroke-opacity", v) }));
    l.anims.push(tween([hr, 1.22 * hr, 1.22 * hr, hr], { duration: T.swellS, delay: connectedAtS, times: SWELL_TIMES, ease: SWELL_EASE, onUpdate: (v) => halo.setAttribute("r", v) }));
    // above the chips: the coloured contact ring and a ripple
    const big = 1.22 * hr, ringDur = releaseAtS - connectedAtS + T.releaseS;
    const [t1, t2, t3] = SWELL_TIMES.slice(1).map((t) => (t * T.swellS) / ringDur);
    l.above = svgEl("g");
    const contact = svgEl("circle", { class: "atlas-tools__contact", cx: route.chipX, cy: route.chipY, stroke: color, "stroke-opacity": 0, r: 0.88 * hr });
    const ripple = svgEl("circle", { class: "atlas-tools__ripple", cx: route.chipX, cy: route.chipY, stroke: color, "stroke-opacity": 0, r: big });
    l.above.append(contact, ripple);
    fieldAbove.append(l.above);
    const ringOpts = { duration: ringDur, delay: connectedAtS, times: [0, t1, t2, t3, (releaseAtS - connectedAtS) / ringDur, 1], ease: ["outCubic", "linear", "inOutQuad", "linear", "inOutQuad"] };
    l.anims.push(tween([0, 0.85, 0.85, 0.85, 0.85, 0], { ...ringOpts, onUpdate: (v) => contact.setAttribute("stroke-opacity", v) }));
    l.anims.push(tween([0.88 * hr, big, big, hr, hr, 1.06 * hr], { ...ringOpts, onUpdate: (v) => contact.setAttribute("r", v) }));
    const rippleOpts = { duration: T.rippleS, delay: connectedAtS, times: [0, 0.1, 1], ease: ["linear", "outCubic"] };
    l.anims.push(tween([0, 0.5, 0], { ...rippleOpts, onUpdate: (v) => ripple.setAttribute("stroke-opacity", v) }));
    l.anims.push(tween([big, 1.06 * big, 1.5 * big], { ...rippleOpts, onUpdate: (v) => ripple.setAttribute("r", v) }));
    // the chip comes to the front and swells with the halo
    const s = slots.get(route.nodeId);
    s.slot.classList.add("atlas-tools__raised");
    const swell = waapi(s.chip, "transform", ["scale(1)", "scale(1.22)", "scale(1.22)", "scale(1)"], { duration: T.swellS, delay: connectedAtS, times: SWELL_TIMES, ease: SWELL_EASE, fill: "both" });
    swell.finished.then(() => swell.cancel(), () => {});
    l.anims.push(swell);
    return l;
  }
  function step() {
    const now = performance.now();
    const alive = [];
    for (const l of links) { if (l.expiresAt > now) alive.push(l); else removeLink(l); }
    const route = picker(alive.map((l) => l.route));
    if (route) alive.push(addLink(route));
    links = alive;
    timer = setTimeout(step, 1000 * EVERY.everyS * (1 + EVERY.stretch * Math.random()));
  }
  const startLoop = () => { if (timer || reduced || document.hidden) return; picker = createPicker(layout.routes); step(); };
  const stopLoop = () => { clearTimeout(timer); timer = 0; links.forEach(removeLink); links = []; };

  if (reduced) {
    for (const route of staticRoutes(layout.routes)) {
      const color = linkColor(route.slug);
      const g = svgEl("g");
      const maskId = lineMask(g, route, W, H);
      g.append(svgEl("path", { class: "atlas-tools__wire", mask: `url(#${maskId})`, d: lineD(route), stroke: color, "stroke-opacity": 0.46 }));
      fieldBelow.append(g);
      fieldAbove.append(svgEl("circle", { class: "atlas-tools__contact", cx: route.chipX, cy: route.chipY, r: route.chipR + 5, stroke: color, "stroke-opacity": 0.85 }));
    }
  }

  // ---------- triggers: 60% of the visual in view (Framer Motion's viewport amount 0.6) ----------
  let inView = false, pageVisible = !document.hidden;
  const sync = () => (inView && pageVisible ? startLoop() : stopLoop());
  new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting === inView) continue;
      inView = e.isIntersecting;
      if (inView) setEntered(true);
      else if (e.boundingClientRect.top > 0) setEntered(false); // replays when scrolled back in from above
      sync();
    }
  }, { threshold: 0.6 }).observe(root);
  document.addEventListener("visibilitychange", () => { pageVisible = !document.hidden; sync(); });
}

// ---------- the face: screen, eyes (reading the laptop once entered) and blinks ----------
function createEyes(root) {
  const plate = root.querySelector(".atlas-tools__facePlate");
  const face = root.querySelector(".bot-face");
  const gradient = face.querySelector(".bot-face-gradient");
  const staticPlate = gradient.getAttribute("style");
  const [leftSlot, rightSlot] = face.querySelectorAll(".bot-eye-slot");
  const parts = (slot) => ({
    track: slot.querySelector(".bot-eye-track"),
    eye: slot.querySelector(".bot-eye"),
    glow: slot.querySelector(".bot-eye-glow"),
    body: slot.querySelector(".bot-eye-core-body"),
    pupil: slot.querySelector(".bot-eye-core-pupil"),
  });
  const L = parts(leftSlot), R = parts(rightSlot);
  const tr = (x, y) => (x === 0 && y === 0 ? "none" : `translateX(${x}px) translateY(${y}px)`);
  // each eye looks with a spring (stiffness 220, damping 28, mass 0.32); its layers move by parallax
  const look = (p) => {
    const s = { x: 0, y: 0 };
    const paint = () => {
      p.track.style.transform = tr(0.4 * s.x, 0.4 * s.y);
      p.glow.style.transform = tr(0.7 * s.x * 0.45, 0.7 * s.y * 0.45);
      p.body.style.transform = tr(0.7 * s.x * 0.9, 0.7 * s.y * 0.9);
      p.pupil.style.transform = tr(0.7 * s.x * 1.7, 0.7 * s.y * 1.7);
    };
    const cfg = { stiffness: 220, damping: 28, mass: 0.32 };
    return { x: springFollower(cfg, (v) => { s.x = v; paint(); }), y: springFollower(cfg, (v) => { s.y = v; paint(); }) };
  };
  const lookL = look(L), lookR = look(R);
  // the target values themselves are animated (Framer's animate(motionValue)): tween objects
  const targets = { x: 0, y: 0 };
  let targetAnims = [];
  const setX = (v) => { targets.x = v; lookL.x.set(v); lookR.x.set(v); };
  const setY = (v) => { targets.y = v; lookL.y.set(v); lookR.y.set(v); };
  const stopTargets = () => { targetAnims.forEach((a) => a.stop()); targetAnims = []; };
  const animX = (values, opts) => { stopTargets(); targetAnims = [tween(values, { ...opts, onUpdate: setX })]; };

  let near = false, reading = false, readTimers = new Set(), blinkTimers = new Set(), stopScreen = null;
  const later = (set, fn, ms) => { const id = setTimeout(() => { set.delete(id); fn(); }, ms); set.add(id); return id; };
  const clear = (set) => { set.forEach(clearTimeout); set.clear(); };

  let blink = null, openness = 1;
  const blinkTo = (closed) => {
    blink?.stop();
    blink = tween([openness, closed ? 0.22 : 1], { duration: closed ? 0.07 : 0.14, ease: closed ? "swift" : "outCubic", onUpdate: (v) => {
      openness = v;
      for (const p of [L, R]) p.eye.style.transform = v === 1 ? "none" : `scaleY(${v})`;
    } });
  };
  const scheduleBlink = () => later(blinkTimers, () => { blinkTo(true); later(blinkTimers, () => { blinkTo(false); later(blinkTimers, scheduleBlink, 230); }, 70); }, 4e3 + Math.random() ** 1.35 * 7e3);

  // Reading: the eyes drop to a line on the laptop and sweep across it, jump, drift or rest.
  const LINES = [0.82, 1.05, 1.28];
  const startReading = () => {
    const r = leftSlot.getBoundingClientRect(); // screen px, as the original measures it
    const maxX = 0.32 * r.width * 0.95, lineH = 0.26 * r.height;
    let stopped = false, line = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clampX = (v) => Math.max(-maxX, Math.min(maxX, v));
    const lineY = (i) => LINES[i % LINES.length] * lineH + rnd(-0.06, 0.06) * lineH;
    stopTargets(); setX(0); setY(lineY(0));
    const next = () => {
      if (stopped) return;
      const t = Math.random();
      if (t < 0.68) setY(lineY((line += 1))); else if (t < 0.82) setY(lineY((line += 2)));
      const pick = Math.random();
      let wait;
      if (pick < 0.5) { // sweep: snap right, then read across to the left
        const from = targets.x, right = clampX(rnd(0.82, 1) * maxX), left = clampX(-rnd(0.82, 1) * maxX), snap = rnd(0.16, 0.28), total = snap + rnd(1.5, 2.6);
        animX([from, right, left], { duration: total, times: [0, snap / total, 1], ease: ["easeOut", "easeInOut"] });
        wait = 1e3 * total + rnd(180, 520);
      } else if (pick < 0.78) { stopTargets(); setX(rnd(-0.9, 0.9) * maxX); wait = rnd(650, 1500); }
      else if (pick < 0.92) { const from = targets.x; animX([from, clampX(from + rnd(-0.35, 0.35) * maxX)], { duration: rnd(0.6, 1.1), ease: "easeInOut" }); wait = rnd(500, 1e3); }
      else { stopTargets(); setX(rnd(-0.18, 0.18) * maxX); wait = rnd(900, 1800); }
      later(readTimers, next, wait);
    };
    next();
    return () => { stopped = true; clear(readTimers); stopTargets(); setX(0); setY(0); };
  };
  let stopRead = null;
  const update = () => {
    const wantRead = reading && near;
    if (wantRead && !stopRead) stopRead = startReading();
    if (!wantRead && stopRead) { stopRead(); stopRead = null; }
  };

  // The face plate fades in when the page starts; the live screen replaces the static gradient while
  // the face is within 100px of the viewport.
  const fade = plate.querySelector(".atlas-tools__faceFade");
  const fadeIn = fade.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: "cubic-bezier(0.33, 1, 0.68, 1)", fill: "both" });
  fadeIn.finished.then(() => { fade.style.opacity = "1"; fadeIn.cancel(); }, () => {});
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting === near) return;
    near = e.isIntersecting;
    if (near) {
      gradient.removeAttribute("style");
      stopScreen = mountFaceShader(gradient);
      scheduleBlink();
    } else {
      stopScreen?.(); stopScreen = null;
      gradient.setAttribute("style", staticPlate);
      clear(blinkTimers);
      blinkTo(false);
    }
    update();
  }, { rootMargin: "100px" }).observe(plate);

  return { setReading(on) { reading = on; update(); } };
}

// GraphicFrame: the 536px drawing scales down with its container below that width.
function frame(root) {
  const fit = () => {
    const w = root.getBoundingClientRect().width;
    if (w > 0) { root.__frameScale = Math.min(1, w / 536); root.style.setProperty("--frame-scale", root.__frameScale); }
  };
  fit();
  new ResizeObserver(fit).observe(root);
}

for (const root of document.querySelectorAll(".atlas-tools")) { frame(root); init(root); }
