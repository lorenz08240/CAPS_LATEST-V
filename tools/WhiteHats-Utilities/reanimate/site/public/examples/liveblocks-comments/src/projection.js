// Layout animations the way framer-motion's projection does them: the DOM jumps to its new layout at once,
// and every `layout` element is then drawn at a box that moves from where it was to where it now is.
// A box is interpolated relative to its nearest layout ancestor's box (both interpolated), "position" nodes keep
// their new size and only move, and each element gets the translate + scale that maps its real layout box onto
// that box after its ancestors' transforms. Border radii given in px are corrected for the scale, as framer does.
import { animate, onRender } from "./motion.js";

const lerp = (a, b, p) => a + (b - a) * p;

export class LayoutGroup {
  /** root: the element boxes are measured against (it must not scale). */
  constructor(root) {
    this.root = root;
    this.nodes = [];
    this.anim = null;
    this.stopRender = null;
  }

  /** mode: true (position and size) or "position"; radius: () => px, for elements with a rounded corner. */
  add(el, mode = true, radius = null) {
    this.nodes.push({ el, mode, radius });
    this.sort();
  }

  remove(el) {
    const n = this.nodes.find((x) => x.el === el);
    if (!n) return;
    this.nodes.splice(this.nodes.indexOf(n), 1);
    this.sort();
  }

  // parents before children; each node's parent is its nearest ancestor that is a node
  sort() {
    const set = new Map(this.nodes.map((n) => [n.el, n]));
    for (const n of this.nodes) {
      n.parent = null;
      for (let p = n.el.parentElement; p && p !== this.root; p = p.parentElement) {
        if (set.has(p)) { n.parent = set.get(p); break; }
      }
      n.depth = 0;
    }
    for (const n of this.nodes) for (let p = n.parent; p; p = p.parent) n.depth++;
    this.nodes.sort((a, b) => a.depth - b.depth);
  }

  box(el) {
    const r = el.getBoundingClientRect();
    const o = this.root.getBoundingClientRect();
    return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height };
  }

  /**
   * Where everything is drawn now (mid-animation boxes included), then change(), then the new layout, then
   * animate from one to the other with `transition` (a motion transition; progress runs 0 -> 1000 like framer's).
   */
  change(change, transition, start = performance.now()) {
    for (const n of this.nodes) n.snap = n.el.isConnected ? this.box(n.el) : null;
    change();
    this.clear();
    for (const n of this.nodes) n.layout = this.box(n.el);
    for (const n of this.nodes) {
      if (!n.snap) n.snap = null; // new node: rides along at its place in its parent
      else if (n.mode === "position") n.snap = { ...n.snap, w: n.layout.w, h: n.layout.h };
    }
    this.anim?.stop();
    this.progress = 0;
    this.apply(0);
    this.anim = animate(0, 1000, transition, (v) => (this.progress = v / 1000), {
      start,
      onComplete: () => {
        this.anim = null;
        this.stopRender?.();
        this.stopRender = null;
        this.clear();
      },
    });
    if (!this.stopRender) this.stopRender = onRender(() => this.anim && this.apply(this.progress));
  }

  clear() {
    for (const n of this.nodes) {
      n.el.style.transform = "";
      n.el.style.transformOrigin = "";
      if (n.radius) n.el.style.borderRadius = `${n.radius()}px`;
    }
  }

  apply(p) {
    for (const n of this.nodes) {
      const L = n.layout;
      if (!L) continue;
      let T;
      const P = n.parent;
      if (P && P.target) {
        const s0 = n.snap && P.snap ? { x: n.snap.x - P.snap.x, y: n.snap.y - P.snap.y } : { x: L.x - P.layout.x, y: L.y - P.layout.y };
        const s1 = { x: L.x - P.layout.x, y: L.y - P.layout.y };
        T = {
          x: P.target.x + lerp(s0.x, s1.x, p),
          y: P.target.y + lerp(s0.y, s1.y, p),
          w: lerp(n.snap ? n.snap.w : L.w, L.w, p),
          h: lerp(n.snap ? n.snap.h : L.h, L.h, p),
        };
      } else {
        const S = n.snap ?? L;
        T = { x: lerp(S.x, L.x, p), y: lerp(S.y, L.y, p), w: lerp(S.w, L.w, p), h: lerp(S.h, L.h, p) };
      }
      n.target = T;
      // the ancestors' combined map, per axis: screen = a * layout + b
      const A = P?.map ?? { ax: 1, bx: 0, ay: 1, by: 0 };
      const sx = L.w > 0 && T.w > 0 ? T.w / (A.ax * L.w) : 1;
      const sy = L.h > 0 && T.h > 0 ? T.h / (A.ay * L.h) : 1;
      const tx = (T.x - A.bx) / A.ax - L.x;
      const ty = (T.y - A.by) / A.ay - L.y;
      n.map = { ax: A.ax * sx, bx: A.ax * (L.x - L.x * sx + tx) + A.bx, ay: A.ay * sy, by: A.ay * (L.y - L.y * sy + ty) + A.by };
      const near = (v, to, e) => Math.abs(v - to) < e;
      const still = near(tx, 0, 0.01) && near(ty, 0, 0.01) && near(sx, 1, 1e-4) && near(sy, 1, 1e-4);
      n.el.style.transformOrigin = "0 0";
      n.el.style.transform = still ? "" : `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`;
      if (n.radius) {
        const r = n.radius();
        const vx = L.w > 0 ? T.w / L.w : 1;
        const vy = L.h > 0 ? T.h / L.h : 1;
        n.el.style.borderRadius = near(vx, 1, 1e-4) && near(vy, 1, 1e-4) ? `${r}px` : `${r / vx}px / ${r / vy}px`;
      }
    }
  }
}
