// Particle ring behind the agentic-commerce chat, ported from stripe.com (AgenticGraphicBackground, three r178).
//
// 10 000 point sprites sit on a 180 px circle with random depth. The vertex shader scatters them along
// the radius with simplex noise; `u_scatterPower` sets how tight the ring is (1 = loose cloud, 12 = thin
// ring), a rotating "thinking" vector tightens and ripples the part of the ring it points at, and the
// pointer pulls nearby points back onto the ring. All targets are approached with a first-order lag.

import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders.js";
import { createRenderLoop } from "./render-loop.js";
import { createRenderer, webglDisabledByQuery } from "./webgl-support.js";

const SPRITESHEET_URL = new URL("../../../assets/img/point_spritesheet.webp", import.meta.url).href;
const RING_RADIUS = 180;
const RING_DEPTH = 100;
const POINTS_DESKTOP = 10000;
const POINTS_TOUCH = 6000;
const POINT_SIZE_DESKTOP = 6;
const POINT_SIZE_TOUCH = 8;
const FRAME_INTERVAL = 2; // render every other frame
const LAG = 0.002; // per-ms rate towards scatter / mouse-strength / thinking targets
const MOUSE_LAG = 0.004 * 3; // per-ms rate of the pointer position
const THINKING_TURN = -0.1 * 0.06; // radians per ms (clockwise)
const SCATTER_REST = 3;
const SCATTER_THINKING = 12;

const isTouch = () => matchMedia("(pointer: coarse)").matches && "ontouchstart" in window;
// Camera zoom shrinks the ring on narrow canvases; the vertical offset centres it on short ones.
const cameraZoom = (width) => THREE.MathUtils.clamp(width / 400, 0, 1);
const cameraY = (height) => 240 * (1 - THREE.MathUtils.clamp(height / 646, 0, 1));

function pageRect(el) {
  const r = el.getBoundingClientRect();
  if (getComputedStyle(el).position === "fixed") return r;
  return new DOMRect(r.left + scrollX, r.top + scrollY, r.width, r.height);
}

function debounce(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

export class AgenticParticles {
  constructor(canvas) {
    if (webglDisabledByQuery()) throw new Error("WebGL disabled by query param");
    this.canvas = canvas;
    this.canvasRect = new DOMRect();
    this.dpr = Math.min(devicePixelRatio, 2);
    this.bentoCardRoot = canvas.closest("[data-bento-card-root]");

    this.thinkingVector = new THREE.Vector2(1, 0);
    this.thinkingTimeout = undefined;
    this.targetMousePosition = new THREE.Vector3();
    this.currentMousePosition = new THREE.Vector3();
    this.targetScatterPower = 1;
    this.currentScatterPower = 1;
    this.targetMouseStrength = 0;
    this.currentMouseStrength = 0;
    this.targetThinkingStrength = 0;
    this.currentThinkingStrength = 0;

    this.firstDrawTime = null;
    this.lastDrawTime = null;
    this.resumedAtTime = null;
    this.pausedAtTime = null;
    this.pausedTime = 0;
    this.loaded = false;
    this.initialized = false;
    this._paused = true;
    this.renderLoop = null;
    this.resizeObserver = null;
    this.texture = null;
    // settles once the sprite sheet has loaded (or failed) and the points are in the scene
    this.ready = new Promise((resolve) => (this.resolveReady = resolve));

    const { renderer, hasMajorPerformanceCaveat, hasRequiredCapabilities } = createRenderer(THREE, {
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    if (!renderer || !hasRequiredCapabilities || hasMajorPerformanceCaveat) {
      renderer?.dispose();
      throw new Error("WebGL disabled based on capabilities check");
    }
    this.renderer = renderer;
    renderer.autoClear = false;
    renderer.autoClearColor = false;
    renderer.autoClearDepth = false;
    renderer.setClearColor(0xffffff, 0);
    renderer.setPixelRatio(this.dpr);

    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();
    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, 1, 10000);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_frame: { value: 0 },
        u_mouse: { value: new THREE.Vector3() },
        u_time: { value: 0 },
        u_pointSize: { value: isTouch() ? POINT_SIZE_TOUCH : POINT_SIZE_DESKTOP },
        u_pixelRatio: { value: this.dpr },
        u_pointSpriteSheet: { value: new THREE.Texture() },
        u_resolution: { value: new THREE.Vector2() },
        u_mousePosition: { value: new THREE.Vector2() },
        u_mouseStrength: { value: 0 },
        u_thinkingVector: { value: new THREE.Vector2() },
        u_thinkingStrength: { value: 0 },
        u_scatterPower: { value: 3 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }

  get paused() {
    return this._paused;
  }

  set paused(value) {
    if (value) {
      this.resumedAtTime = null;
      this.pausedAtTime = this.lastDrawTime;
      this.lastDrawTime = null;
    }
    this._paused = value;
  }

  initScene() {
    if (this.initialized) return;
    this.initialized = true;
    this.canvasRect = pageRect(this.canvas);
    const size = new THREE.Vector2(this.canvasRect.width, this.canvasRect.height);
    this.renderer.setSize(size.x, size.y, false);
    this.camera.position.set(0, cameraY(size.y), 5000);
    this.sizeCamera(size);
    this.material.uniforms.u_resolution.value = size.clone().multiplyScalar(this.dpr);

    // Invisible plane the pointer ray hits, in the same units as the ring (1 unit = 1 CSS px at zoom 1).
    this.mousePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(size.x, size.y),
      new THREE.MeshBasicMaterial({ color: 0xfff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.1 }),
    );
    this.mousePlane.visible = false;
    this.scene.add(this.mousePlane);

    new THREE.TextureLoader().load(
      SPRITESHEET_URL,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.texture = texture;
        this.onLoad();
      },
      undefined,
      () => this.onLoad(),
    );
  }

  createPoints() {
    const count = isTouch() ? POINTS_TOUCH : POINTS_DESKTOP;
    const positions = [];
    const spriteUvs = [];
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      positions.push(RING_RADIUS * Math.cos(angle), RING_RADIUS * Math.sin(angle), THREE.MathUtils.randFloat(-RING_DEPTH, RING_DEPTH));
      // one of the 4x4 dots in the sprite sheet
      spriteUvs.push(0.25 * THREE.MathUtils.randInt(0, 3), 0.25 * THREE.MathUtils.randInt(0, 3));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("pointSpriteUv", new THREE.Float32BufferAttribute(spriteUvs, 2));
    return geometry;
  }

  onLoad() {
    this.resolveReady();
    if (!this.texture || this.disposed) return;
    this.material.uniforms.u_pointSpriteSheet.value = this.texture;
    this.points = new THREE.Points(this.createPoints(), this.material);
    this.scene.add(this.points);
    this.addListeners();
    this.loaded = true;
    this.renderLoop = createRenderLoop(this.updateAndRender, FRAME_INTERVAL);
    this.renderLoop.onRenderSuspended = () => this.stopThinking(true);
    this.renderLoop.start();
    if (this.paused) this.render();
  }

  updateAndRender = (now) => {
    if (this.paused || !this.loaded) return;
    if (this.firstDrawTime === null) this.firstDrawTime = now;
    if (this.resumedAtTime === null) {
      this.resumedAtTime = now;
      if (this.pausedAtTime) {
        this.pausedTime += this.resumedAtTime - this.pausedAtTime;
        this.pausedAtTime = null;
      }
    }
    if (this.lastDrawTime === null) this.lastDrawTime = now;
    const dt = now - this.lastDrawTime;
    const time = now - this.firstDrawTime - this.pausedTime;
    this.lastDrawTime = now;

    const towardMouse = this.targetMousePosition.clone().sub(this.currentMousePosition);
    this.currentMousePosition.add(towardMouse.multiplyScalar(MOUSE_LAG * dt));
    this.currentScatterPower += (this.targetScatterPower - this.currentScatterPower) * dt * LAG;
    this.currentMouseStrength += (this.targetMouseStrength - this.currentMouseStrength) * dt * LAG;
    this.currentThinkingStrength += (this.targetThinkingStrength - this.currentThinkingStrength) * dt * LAG;
    this.thinkingVector.rotateAround(new THREE.Vector2(0, 0), THINKING_TURN * dt);

    const u = this.material.uniforms;
    u.u_thinkingVector.value = this.thinkingVector;
    u.u_thinkingStrength.value = this.currentThinkingStrength;
    u.u_mouseStrength.value = this.currentMouseStrength;
    u.u_time.value = time;
    u.u_mousePosition.value = this.currentMousePosition;
    u.u_scatterPower.value = this.currentScatterPower;
    this.render();
  };

  render() {
    this.renderer.clearDepth();
    this.renderer.clearColor();
    this.renderer.render(this.scene, this.camera);
  }

  // After `delay` ms the ring pulls tight and the thinking sweep starts; `duration` ms later it relaxes.
  think(duration, delay) {
    clearTimeout(this.thinkingTimeout);
    this.thinkingTimeout = setTimeout(() => {
      this.targetScatterPower = SCATTER_THINKING;
      this.targetThinkingStrength = 1;
      this.thinkingTimeout = setTimeout(() => this.stopThinking(), duration);
    }, delay);
  }

  stopThinking(immediately = false) {
    clearTimeout(this.thinkingTimeout);
    this.thinkingTimeout = undefined;
    this.targetScatterPower = SCATTER_REST;
    this.targetThinkingStrength = 0;
    if (immediately) {
      this.targetMousePosition = new THREE.Vector3();
      this.targetMouseStrength = 0;
      this.currentScatterPower = this.targetScatterPower;
      this.currentMousePosition = this.targetMousePosition;
      this.currentMouseStrength = this.targetMouseStrength;
      this.currentThinkingStrength = this.targetThinkingStrength;
    }
  }

  sizeCamera(size) {
    this.camera.left = -size.x / 2;
    this.camera.right = size.x / 2;
    this.camera.top = size.y / 2;
    this.camera.bottom = -size.y / 2;
    this.camera.zoom = cameraZoom(size.x);
    this.camera.updateProjectionMatrix();
  }

  resize = () => {
    this.canvasRect = pageRect(this.canvas);
    const size = new THREE.Vector2(this.canvasRect.width, this.canvasRect.height);
    const current = new THREE.Vector2();
    this.renderer.getSize(current);
    if (size.x === current.x && size.y === current.y) return;
    this.renderer.setSize(size.x, size.y, false);
    this.sizeCamera(size);
    this.camera.position.y = cameraY(size.y);
    this.material.uniforms.u_resolution.value = size.clone().multiplyScalar(this.dpr);
    if (this.paused && this.loaded) this.render();
  };

  debouncedResize = debounce(this.resize, 150);

  onMouseMove = (e) => {
    const left = this.canvasRect.left - scrollX;
    const top = this.canvasRect.top - scrollY;
    const ndc = new THREE.Vector2(((e.clientX - left) / this.canvasRect.width) * 2 - 1, (-(e.clientY - top) / this.canvasRect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    if (!this.mousePlane) return;
    const hit = this.raycaster.intersectObject(this.mousePlane);
    if (hit.length > 0) this.targetMousePosition = hit[0].point.clone();
  };

  onMouseOver = () => {
    this.targetMouseStrength = 1;
  };

  onMouseOut = () => {
    this.targetMouseStrength = 0;
  };

  addListeners() {
    this.resizeObserver = new ResizeObserver(this.debouncedResize);
    this.resizeObserver.observe(document.body);
    const root = this.bentoCardRoot;
    if (!root) return;
    root.addEventListener("mousemove", this.onMouseMove);
    root.addEventListener("mouseout", this.onMouseOut);
    root.addEventListener("mouseover", this.onMouseOver);
  }

  removeListeners() {
    this.resizeObserver?.disconnect();
    const root = this.bentoCardRoot;
    if (!root) return;
    root.removeEventListener("mousemove", this.onMouseMove);
    root.removeEventListener("mouseout", this.onMouseOut);
    root.removeEventListener("mouseover", this.onMouseOver);
  }

  dispose() {
    this.disposed = true;
    this.removeListeners();
    this.renderLoop?.stop();
    this.renderLoop = null;
    clearTimeout(this.thinkingTimeout);
    this.texture?.dispose();
    this.scene.remove(...this.scene.children);
    this.renderer.dispose();
  }
}
