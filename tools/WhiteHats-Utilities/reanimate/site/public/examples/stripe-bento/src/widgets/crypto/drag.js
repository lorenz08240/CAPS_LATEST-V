// Pointer-drag rotation for the globe (port of stripe.com's controller). Horizontal drag spins
// the globe (rotation.y), vertical drag tilts it (rotation.x) with a soft limit: past 60° the tilt
// is damped quadratically up to a hard stop at 90°. On release the last 80 ms of pointer samples
// give a fling speed, and a spring returns the tilt home ("snap" to ±60° first when beyond it).
//
// stripe.com's bento card creates the globe without `dragRotate`, so this controller binds no
// listeners there; it is used only when an axis ("x", "y" or "both") is passed.
import * as THREE from "three";

const SOFT_TILT = THREE.MathUtils.degToRad(60);
const TILT_OVERSHOOT = THREE.MathUtils.degToRad(30);
const MAX_TILT = SOFT_TILT + TILT_OVERSHOOT;
const SAMPLE_WINDOW_MS = 80;

function dampedTilt(angle, delta) {
  const over = Math.min(Math.max(Math.abs(angle) - SOFT_TILT, 0) / TILT_OVERSHOOT, 1);
  return THREE.MathUtils.clamp(angle + (1 - over) * (1 - over) * delta, -MAX_TILT, MAX_TILT);
}

function applyTiltDelta(angle, delta) {
  if (delta === 0) return angle;
  const next = angle + delta;
  if (!(Math.abs(next) > Math.abs(angle))) return THREE.MathUtils.clamp(next, -MAX_TILT, MAX_TILT);
  if (Math.abs(angle) < SOFT_TILT) {
    if (Math.abs(next) <= SOFT_TILT) return next;
    const sign = Math.sign(next);
    const free = sign * SOFT_TILT - angle;
    return dampedTilt(sign * SOFT_TILT, delta - free);
  }
  return dampedTilt(angle, delta);
}

export class DragController {
  constructor(canvas, target, { axis, homeTiltX, onRelease }) {
    this.canvas = canvas;
    this.target = target;
    this.homeTiltX = homeTiltX;
    this.onRelease = onRelease;
    this.axis = undefined;
    this.dragging = false;
    this.listenersBound = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.activePointerId = null;
    this.dragSamples = [];
    this.tiltSpringing = false;
    this.tiltReturnPhase = null; // "snap" | "home" | null
    this.tiltSpringVelocity = 0;
    this.tiltSpringTarget = 0;
    this.setAxis(axis);
  }

  get isDragging() {
    return this.dragging;
  }

  get isSettling() {
    return this.tiltSpringing;
  }

  setAxis(axis) {
    if (this.axis === axis && (axis ? this.listenersBound : !this.listenersBound)) return;
    this.axis = axis;
    if (axis) {
      this.bindListeners();
    } else {
      this.endDrag({ skipSpring: true });
      this.tiltSpringing = false;
      this.tiltReturnPhase = null;
      this.unbindListeners();
    }
  }

  update(dt) {
    this.updateTiltSpring(dt);
  }

  dispose() {
    this.endDrag({ skipSpring: true });
    this.tiltSpringing = false;
    this.tiltReturnPhase = null;
    this.unbindListeners();
  }

  onPointerDown = (event) => {
    if (!this.axis || event.button !== 0) return;
    this.dragging = true;
    this.tiltSpringing = false;
    this.tiltReturnPhase = null;
    this.tiltSpringVelocity = 0;
    this.dragSamples = [];
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    this.activePointerId = event.pointerId;
    this.recordDragSample(event.clientX, event.clientY, performance.now());
    this.canvas.setPointerCapture(event.pointerId);
    this.canvas.classList.add("globe__canvas--dragging");
    event.preventDefault();
  };

  onPointerMove = (event) => {
    if (!this.dragging || event.pointerId !== this.activePointerId || !this.axis) return;
    const dx = event.clientX - this.lastPointerX;
    const dy = event.clientY - this.lastPointerY;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    this.recordDragSample(event.clientX, event.clientY, performance.now());
    const width = this.canvas.clientWidth || 1;
    const height = this.canvas.clientHeight || 1;
    if (this.axis === "y" || this.axis === "both") this.target.rotation.y += (dx / width) * Math.PI * 2;
    if (this.axis === "x" || this.axis === "both") {
      this.target.rotation.x = applyTiltDelta(this.target.rotation.x, (dy / height) * Math.PI);
    }
    event.preventDefault();
  };

  onPointerUp = (event) => {
    if (event.pointerId === this.activePointerId) this.endDrag();
  };

  bindListeners() {
    if (this.listenersBound) return;
    this.canvas.addEventListener("pointerdown", this.onPointerDown, { passive: false });
    this.canvas.addEventListener("pointermove", this.onPointerMove, { passive: false });
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("pointercancel", this.onPointerUp);
    this.listenersBound = true;
  }

  unbindListeners() {
    if (!this.listenersBound) return;
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
    this.listenersBound = false;
  }

  recordDragSample(x, y, t) {
    this.dragSamples.push({ t, x, y });
    const cutoff = t - SAMPLE_WINDOW_MS;
    while (this.dragSamples.length > 0 && this.dragSamples[0].t < cutoff) this.dragSamples.shift();
  }

  /** Fling speed in radians per 60 Hz frame, from the samples of the last 80 ms. */
  computeReleaseSpeeds() {
    const samples = this.dragSamples;
    if (samples.length < 2) return { speedX: 0, speedY: 0 };
    const last = samples[samples.length - 1];
    if (performance.now() - last.t > 50) return { speedX: 0, speedY: 0 };
    const first = samples[0];
    const seconds = (last.t - first.t) / 1000;
    if (seconds < 0.008) return { speedX: 0, speedY: 0 };
    const width = this.canvas.clientWidth || 1;
    const height = this.canvas.clientHeight || 1;
    const spin = ((last.x - first.x) / width) * Math.PI * 2;
    return {
      speedX: (((last.y - first.y) / height) * Math.PI) / (60 * seconds),
      speedY: spin / (60 * seconds),
    };
  }

  endDrag(options) {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.activePointerId !== null && this.canvas.hasPointerCapture(this.activePointerId)) {
      this.canvas.releasePointerCapture(this.activePointerId);
    }
    this.activePointerId = null;
    this.canvas.classList.remove("globe__canvas--dragging");
    const speeds = this.computeReleaseSpeeds();
    this.dragSamples = [];
    if (options?.skipSpring) {
      this.tiltSpringing = false;
      this.tiltReturnPhase = null;
    } else {
      this.onRelease(speeds);
      this.startTiltReturn(speeds.speedX);
    }
  }

  getHomeReturnSpeed(angle) {
    return (5 / 6) * Math.abs(angle - this.homeTiltX);
  }

  startTiltReturn(speedX) {
    if (this.axis !== "x" && this.axis !== "both") return;
    const velocity = Math.abs(speedX) > 5e-5 ? speedX : 0;
    const tilt = this.target.rotation.x;
    if (Math.abs(tilt) > SOFT_TILT) {
      this.beginTiltPhase("snap", Math.sign(tilt) * SOFT_TILT, velocity);
      return;
    }
    if (Math.abs(tilt - this.homeTiltX) < 4e-4 && Math.abs(velocity) < 5e-5) {
      this.target.rotation.x = this.homeTiltX;
      return;
    }
    this.beginTiltPhase("home", this.homeTiltX, velocity);
  }

  beginTiltPhase(phase, target, velocity, options) {
    this.tiltReturnPhase = phase;
    this.tiltSpringing = true;
    this.tiltSpringTarget = target;
    if (!options?.keepVelocity) this.tiltSpringVelocity = 60 * velocity;
  }

  /** Semi-implicit spring on rotation.x: stiffness 90 while snapping back under 60°, 10 towards home, damping 12. */
  updateTiltSpring(dt) {
    if (!this.tiltSpringing || !this.tiltReturnPhase) return;
    const tilt = this.target.rotation.x;
    const homeSpeed = this.getHomeReturnSpeed(tilt);
    if (this.tiltReturnPhase === "home" && Math.abs(tilt) > SOFT_TILT && Math.abs(this.tiltSpringVelocity) > homeSpeed) {
      this.beginTiltPhase("snap", Math.sign(tilt) * SOFT_TILT, 0, { keepVelocity: true });
    }
    const stiffness = this.tiltReturnPhase === "snap" ? 90 : 10;
    const damping = 12;
    const accel = -stiffness * (tilt - this.tiltSpringTarget) - damping * this.tiltSpringVelocity;
    this.tiltSpringVelocity += accel * dt;
    let next = tilt + this.tiltSpringVelocity * dt;
    if (next > MAX_TILT) {
      next = MAX_TILT;
      this.tiltSpringVelocity = Math.min(this.tiltSpringVelocity, 0);
    } else if (next < -MAX_TILT) {
      next = -MAX_TILT;
      this.tiltSpringVelocity = Math.max(this.tiltSpringVelocity, 0);
    }
    this.target.rotation.x = next;
    if (this.tiltReturnPhase === "snap" && Math.abs(this.tiltSpringVelocity) <= this.getHomeReturnSpeed(next)) {
      this.beginTiltPhase("home", this.homeTiltX, 0, { keepVelocity: true });
      return;
    }
    if (
      this.tiltReturnPhase === "home" &&
      Math.abs(next - this.tiltSpringTarget) < 4e-4 &&
      Math.abs(this.tiltSpringVelocity) < 4e-4
    ) {
      this.target.rotation.x = this.tiltSpringTarget;
      this.tiltReturnPhase = null;
      this.tiltSpringing = false;
      this.tiltSpringVelocity = 0;
    }
  }
}
