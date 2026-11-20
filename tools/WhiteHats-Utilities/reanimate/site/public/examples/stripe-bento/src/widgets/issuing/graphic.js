// Port of stripe.com's IssuingGraphicBackground scene.
//
// Three passes per frame, then a composite to the canvas:
//   1. wave   – the folded wave ribbon through an orthographic camera   → waveTarget
//   2. card   – the card foreground (chip, contactless, VISA, shadow)    → cardTarget
//   3. window – the card silhouette (white, rounded)                     → cardWindowTarget
//   4. composite (postFragment): inside the window the wave zoomed 1.5x; outside it the
//      angular-blurred wave mixed 70 % with white (the soft glow); the foreground on top; grain.
// The card planes live in a group that tilts towards the pointer (±0.15π) with a
// frame-time-scaled exponential approach (0.004/ms).

import {
  ClampToEdgeWrapping,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from "three";
import {
  CARD_ASPECT,
  CARD_CAMERA,
  CARD_OFFSET_Y,
  CARD_SCALE,
  EASE_PER_MS,
  FRAME_INTERVAL,
  ISSUING_CONFIG,
  TEXTURES,
  TILT_MAX,
} from "./config.js";
import { createRenderLoop, createRenderer, isRenderLoopWarm, renderLoopElapsed } from "./render-loop.js";
import { cardFragment, cardVertex, postFragment, postVertex } from "./shaders.js";
import { WaveMesh, createFoldedWaveGeometry } from "./wave.js";

// Page-space rect (viewport rect for fixed elements), like Stripe's helper.
function pageRect(el) {
  const r = el.getBoundingClientRect();
  if (getComputedStyle(el).position === "fixed") return r;
  return new DOMRect(r.left + window.scrollX, r.top + window.scrollY, r.width, r.height);
}

// Capture aid: ?__issuingFrameInterval=N starts the loop at every N-th frame, to reproduce the
// cadence Stripe's performance governor falls back to on a slow page. Not used otherwise.
function frameIntervalOverride() {
  const n = Number(new URLSearchParams(window.location.search).get("__issuingFrameInterval"));
  return Number.isInteger(n) && n > 0 ? n : 0;
}

function debounce(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}

// Textures load together; a failed one still counts, as on stripe.com (the graphic then never becomes ready).
function loadTextures(specs, onDone) {
  const loader = new TextureLoader();
  const textures = {};
  let settled = 0;
  const done = () => {
    settled += 1;
    if (settled === specs.length) onDone(textures);
  };
  for (const { id, url, wrap } of specs) {
    loader.load(
      url,
      (texture) => {
        texture.wrapS = wrap;
        texture.wrapT = wrap;
        textures[id] = texture;
        done();
      },
      undefined,
      done,
    );
  }
  return textures;
}

function cardMaterial() {
  return new ShaderMaterial({
    uniforms: { u_texture: { value: new Texture() } },
    vertexShader: cardVertex,
    fragmentShader: cardFragment,
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
}

function postProcessingMaterial() {
  const empty = new Texture();
  return new ShaderMaterial({
    uniforms: {
      u_wave: { value: null },
      u_resolution: { value: new Vector2(0, 0) },
      u_blurAmount: { value: 0.02 },
      u_blurSamples: { value: 6 },
      u_grainAmount: { value: 1 },
      u_card: { value: empty },
      u_cardWindow: { value: empty },
    },
    vertexShader: postVertex,
    fragmentShader: postFragment,
    side: DoubleSide,
  });
}

// Full-screen quad drawn straight to the canvas.
class ScreenPass {
  constructor(material) {
    this.camera = new OrthographicCamera();
    this.scene = new Scene();
    this.mesh = new Mesh(new PlaneGeometry(2, 2), material);
    this.scene.add(this.mesh);
  }
  render(renderer) {
    renderer.setRenderTarget(null);
    renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.mesh.geometry.dispose();
  }
}

export class IssuingGraphic {
  constructor(canvas, { config = ISSUING_CONFIG, onFirstFrame } = {}) {
    if (new URLSearchParams(window.location.search).has("__disableWebGL")) {
      throw new Error("WebGL disabled by query param");
    }
    this.canvas = canvas;
    this.config = config;
    this.onFirstFrame = onFirstFrame;
    this.scene = new Scene();
    this.bentoCardRoot = canvas.closest("[data-bento-card-root]");

    this.canvasRect = new DOMRect();
    this.resolution = new Vector2();
    this.mouseVector = new Vector2(0, 0);
    this.mouseRotationCurrent = new Vector2(0, 0);
    this.mouseRotationTarget = new Vector2(0, 0);
    this.mouseScaleCurrent = CARD_SCALE;
    this.mouseScaleTarget = CARD_SCALE;

    this.waveMesh = null;
    this.renderLoop = null;
    this.resizeObserver = null;
    this.firstDrawTime = null;
    this.lastDrawTime = null;
    this.resumedAtTime = null;
    this.pausedAtTime = null;
    this.pausedTime = 0;
    this._paused = true;
    this.initialized = false;
    this.loaded = false;
    this.drawn = false;
    this.onLoadCallback = null;
    this.textures = null;
    this.texturesPreloaded = false;
    this.texturePreloadCallback = null;

    const { renderer, hasMajorPerformanceCaveat, hasRequiredCapabilities } = createRenderer({
      canvas,
      antialias: false,
      alpha: false,
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
    this.dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(this.dpr);

    this.cardCamera = new PerspectiveCamera(CARD_CAMERA.fov, 1, CARD_CAMERA.near, CARD_CAMERA.far);
    this.cardCamera.position.set(0, 0, CARD_CAMERA.z);
    this.waveCamera = new OrthographicCamera(0, 0, 0, 0, 1, 10000);
    this.waveCamera.position.set(0, 0, 5000);

    this.debouncedResize = debounce(this.resize, 100);
    this.startTexturePreload();
  }

  startTexturePreload() {
    this.textures = loadTextures(
      [
        { id: "palette", url: TEXTURES.palette, wrap: RepeatWrapping },
        { id: "cardForeground", url: TEXTURES.cardForeground, wrap: ClampToEdgeWrapping },
        { id: "cardWindow", url: TEXTURES.cardWindow, wrap: ClampToEdgeWrapping },
      ],
      () => {
        this.texturesPreloaded = true;
        if (this.texturePreloadCallback) {
          this.texturePreloadCallback();
          this.texturePreloadCallback = null;
        }
      },
    );
  }

  onLoadReady(callback) {
    if (this.loaded) callback();
    else this.onLoadCallback = callback;
  }

  initScene() {
    if (this.initialized) return;
    this.initialized = true;
    this.canvasRect = pageRect(this.canvas);
    const size = new Vector2(this.canvasRect.width, this.canvasRect.height);
    this.renderer.setSize(size.width, size.height, false);
    this.resolution = size.clone().multiplyScalar(this.dpr);

    this.sizeCameras(size);
    const foreground = cardMaterial();
    this.card = new Mesh(new PlaneGeometry(CARD_ASPECT, 1), foreground);
    this.card.position.y = CARD_OFFSET_Y;
    this.cardWindow = new Mesh(new PlaneGeometry(CARD_ASPECT, 1), foreground.clone());
    this.cardWindow.position.y = this.card.position.y;
    this.cardGroup = new Group();
    this.cardGroup.add(this.card);
    this.cardGroup.add(this.cardWindow);
    this.scene.add(this.cardGroup);
    this.applyCardTransform();

    const { width, height } = this.resolution;
    this.waveTarget = new WebGLRenderTarget(width, height);
    this.cardTarget = new WebGLRenderTarget(width, height);
    this.cardWindowTarget = new WebGLRenderTarget(width, height);

    this.postProcessingMaterial = postProcessingMaterial();
    const post = this.postProcessingMaterial.uniforms;
    post.u_blurAmount.value = this.config.postProcessing.blurAmount;
    post.u_grainAmount.value = this.config.postProcessing.grainAmount;
    post.u_resolution.value = this.resolution.clone();
    post.u_wave.value = this.waveTarget.texture;
    post.u_card.value = this.cardTarget.texture;
    post.u_cardWindow.value = this.cardWindowTarget.texture;
    this.postProcessingPass = new ScreenPass(this.postProcessingMaterial);

    if (this.texturesPreloaded) this.onLoad();
    else this.texturePreloadCallback = () => this.onLoad();
  }

  onLoad = async () => {
    const { palette, cardForeground, cardWindow } = this.textures;
    if (!palette || !cardForeground || !cardWindow) return;
    this.card.material.uniforms.u_texture.value = cardForeground;
    this.cardWindow.material.uniforms.u_texture.value = cardWindow;

    const geometry = await createFoldedWaveGeometry(400, 400, 128, 256);
    if (this.disposed) return;
    this.waveMesh = new WaveMesh(palette, geometry);
    this.waveMesh.applyConfig(this.config.wave, new Vector3(1, 1, 1));
    this.waveMesh.resolution = new Vector2(this.canvasRect.width * this.dpr, this.canvasRect.height * this.dpr);
    this.scene.add(this.waveMesh.mesh);

    const cam = this.config.camera;
    this.waveCamera.position.set(cam.position.x, cam.position.y, cam.position.z);
    this.waveCamera.rotation.set(cam.rotation.x, cam.rotation.y, cam.rotation.z, cam.rotation.order);
    this.waveCamera.zoom = cam.zoom;
    this.waveCamera.lookAt(cam.lookAt.x, cam.lookAt.y, cam.lookAt.z);

    this.addListeners();
    this.loaded = true;
    if (this.onLoadCallback) {
      this.onLoadCallback();
      this.onLoadCallback = null;
    }
    this.renderLoop = createRenderLoop((elapsed) => this.updateAndRender(elapsed), frameIntervalOverride() || FRAME_INTERVAL);
    this.renderLoop.onRenderResumed = () => {
      this.mouseRotationCurrent = new Vector2(0, 0);
      this.mouseRotationTarget = new Vector2(0, 0);
    };
    this.renderLoop.start();
    // Paused (off screen or reduced motion): draw one still frame. The wave keeps u_time = 0 here.
    if (this.paused) this.render();
    // On stripe.com the shared loop is already warm (the hero gradient starts it), so the first
    // animated frame follows within two frames. Here the loop may still be estimating the refresh
    // rate (12 frames), so draw that first frame now instead.
    else if (!isRenderLoopWarm()) this.updateAndRender(renderLoopElapsed());
  };

  updateAndRender(now) {
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
    const elapsed = now - this.firstDrawTime - this.pausedTime;
    this.lastDrawTime = now;

    if (this.waveMesh) {
      this.waveMesh.mousePosition = this.mouseVector;
      this.waveMesh.time = elapsed;
    }
    const rotationStep = this.mouseRotationTarget.clone().sub(this.mouseRotationCurrent);
    this.mouseRotationCurrent.add(rotationStep.multiplyScalar(EASE_PER_MS * dt));
    this.mouseScaleCurrent += (this.mouseScaleTarget - this.mouseScaleCurrent) * dt * EASE_PER_MS;
    this.applyCardTransform();
    this.render();
  }

  applyCardTransform() {
    if (!this.cardGroup) return;
    this.cardGroup.rotation.x = this.mouseRotationCurrent.x;
    this.cardGroup.rotation.y = this.mouseRotationCurrent.y;
    this.cardGroup.scale.setScalar(this.mouseScaleCurrent);
  }

  sizeCameras(size) {
    this.cardCamera.aspect = size.width / size.height;
    this.cardCamera.updateProjectionMatrix();
    this.waveCamera.left = -size.width / 2;
    this.waveCamera.right = size.width / 2;
    this.waveCamera.top = size.height / 2;
    this.waveCamera.bottom = -size.height / 2;
    this.waveCamera.updateProjectionMatrix();
  }

  resize = () => {
    this.canvasRect = pageRect(this.canvas);
    const size = new Vector2(this.canvasRect.width, this.canvasRect.height);
    const current = new Vector2();
    this.renderer.getSize(current);
    if (this.canvasRect.width === current.width && this.canvasRect.height === current.height) return;
    this.resolution = size.clone().multiplyScalar(this.dpr);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(size.width, size.height, false);
    const { width, height } = this.resolution;
    this.waveTarget?.setSize(width, height);
    this.cardTarget?.setSize(width, height);
    this.cardWindowTarget?.setSize(width, height);
    if (this.postProcessingMaterial) this.postProcessingMaterial.uniforms.u_resolution.value = this.resolution.clone();
    this.sizeCameras(size);
    if (this.paused && this.loaded) this.render();
  };

  // Pointer position over the canvas → target tilt. Up/down tilts around x, left/right around y.
  mousemove = (e) => {
    const left = this.canvasRect.left - window.scrollX;
    const top = this.canvasRect.top - window.scrollY;
    const nx = (e.clientX - left) / this.canvasRect.width;
    const ny = 1 - (e.clientY - top) / this.canvasRect.height;
    this.mouseVector.set(nx, ny);
    const sx = MathUtils.mapLinear(nx, 0, 1, -1, 1);
    const sy = MathUtils.mapLinear(ny, 0, 1, -1, 1);
    this.mouseRotationTarget.set(-TILT_MAX * sy, TILT_MAX * sx);
  };

  // mouseout bubbles, so crossing a child resets the target until the next mousemove, as on stripe.com.
  mouseout = () => {
    this.mouseScaleTarget = CARD_SCALE;
    this.mouseRotationTarget.set(0, 0);
  };

  mouseover = () => {
    this.mouseScaleTarget = CARD_SCALE;
  };

  addListeners() {
    this.resizeObserver = new ResizeObserver(this.debouncedResize);
    this.resizeObserver.observe(document.body);
    if (!this.bentoCardRoot) return;
    this.bentoCardRoot.addEventListener("mouseover", this.mouseover);
    this.bentoCardRoot.addEventListener("mousemove", this.mousemove);
    this.bentoCardRoot.addEventListener("mouseout", this.mouseout);
  }

  removeListeners() {
    this.resizeObserver?.disconnect();
    if (!this.bentoCardRoot) return;
    this.bentoCardRoot.removeEventListener("mouseover", this.mouseover);
    this.bentoCardRoot.removeEventListener("mousemove", this.mousemove);
    this.bentoCardRoot.removeEventListener("mouseout", this.mouseout);
  }

  showElements(wave, card, cardWindow) {
    if (!this.card || !this.cardWindow || !this.waveMesh) return;
    this.waveMesh.mesh.visible = wave;
    this.card.visible = card;
    this.cardWindow.visible = cardWindow;
  }

  renderPass(target, camera) {
    this.renderer.setRenderTarget(target);
    this.renderer.clearDepth();
    this.renderer.clearColor();
    this.renderer.render(this.scene, camera);
  }

  render() {
    if (!this.waveTarget || !this.cardTarget || !this.cardWindowTarget) return;
    this.showElements(true, false, false);
    this.renderPass(this.waveTarget, this.waveCamera);
    this.showElements(false, true, false);
    this.renderPass(this.cardTarget, this.cardCamera);
    this.showElements(false, false, true);
    this.renderPass(this.cardWindowTarget, this.cardCamera);
    this.postProcessingPass.render(this.renderer);
    if (!this.drawn) {
      this.drawn = true;
      this.onFirstFrame?.();
    }
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

  dispose() {
    this.disposed = true;
    this.removeListeners();
    this.renderLoop?.stop();
    this.renderLoop = null;
    for (const t of Object.values(this.textures ?? {})) t.dispose();
    this.waveMesh?.dispose();
    this.card?.geometry.dispose();
    this.cardWindow?.geometry.dispose();
    this.waveTarget?.dispose();
    this.cardTarget?.dispose();
    this.cardWindowTarget?.dispose();
    this.postProcessingPass?.dispose();
    this.postProcessingMaterial?.dispose();
    this.scene.remove(...this.scene.children);
    this.renderer.dispose();
  }
}
