// resend.com's hero cube, ported from a reanimate trace of the Spline scene (/static/cube.splinecode,
// rendered there by Spline's runtime on three.js r149) to plain three.js r178.
//
// assets/scene.json holds what the trace recorded: the scene graph (27 rounded cubies in three
// slices, five shadow-casting bars), the two geometries, every constant uniform of every program, the
// texture settings, lights and camera. assets/shaders/ holds the programs exactly as Spline compiled
// them (its node materials, three's depth material, and the postprocessing passes). This file rebuilds
// Spline's frame: spot-light shadow map → scene into colour + velocity + depth → TAA resolve →
// luminance → 10 Kawase blur passes → bloom composite onto the transparent canvas.

import * as THREE from "three";
import { createMotion } from "./motion.js";

const ASSETS = new URL("../assets/", import.meta.url);
const KAWASE_KERNELS = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10];
const BLUR_SCALE = 0.5;

const root = document.querySelector(".resend-cube");
const canvas = root.querySelector("canvas");

const fetchText = (path) => fetch(new URL(path, ASSETS)).then((r) => r.text());

function loadTexture(def) {
  return new Promise((resolve, reject) => {
    new THREE.ImageLoader().load(new URL(def.file, ASSETS).href, (image) => {
      const t = new THREE.Texture(image);
      t.wrapS = def.wrapS;
      t.wrapT = def.wrapT;
      t.minFilter = def.minFilter;
      t.magFilter = def.magFilter;
      t.flipY = def.flipY;
      t.generateMipmaps = def.generateMipmaps;
      t.anisotropy = def.anisotropy;
      t.unpackAlignment = def.unpackAlignment;
      t.needsUpdate = true;
      resolve(t);
    }, undefined, reject);
  });
}

function decode(b64, Type) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Type(bytes.buffer);
}

function buildGeometry(def) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(decode(def.position, Float32Array), 3));
  g.setAttribute("normal", new THREE.BufferAttribute(decode(def.normal, Float32Array), 3));
  g.setAttribute("uv", new THREE.BufferAttribute(decode(def.uv, Float32Array), 2));
  g.setIndex(new THREE.BufferAttribute(decode(def.index, Uint16Array), 1));
  const s = def.boundingSphere;
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3().fromArray(s.center), s.radius);
  return g;
}

function constUniforms(defs) {
  const u = {};
  for (const [name, { value }] of Object.entries(defs)) u[name] = { value };
  return u;
}

// The light uniforms three.js r149 computed for Spline (WebGLLights.setup / setupView, legacy light
// units: colour × intensity × π), from the lights' own matrices in the scene file.
function lightUniforms(L, camera, shadowCamera) {
  const view = camera.matrixWorldInverse;
  const pos = (m) => new THREE.Vector3().setFromMatrixPosition(m);
  const hex = (h, k) => new THREE.Vector3(((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255).multiplyScalar(k);

  const spotM = new THREE.Matrix4().fromArray(L.spot.matrix);
  const spotPos = pos(spotM);
  const spotTarget = spotPos.clone().sub(new THREE.Vector3().setFromMatrixColumn(spotM, 1)); // Spline lights shine along −y
  const dirM = new THREE.Matrix4().multiplyMatrices(camera.matrixWorld, new THREE.Matrix4().fromArray(L.directional.matrix));
  const hemiM = new THREE.Matrix4().fromArray(L.hemisphere.matrix);

  // spot shadow camera (SpotLightShadow.updateMatrices)
  const sh = L.spot.shadow;
  shadowCamera.fov = THREE.MathUtils.RAD2DEG * 2 * L.spot.angle;
  shadowCamera.aspect = sh.mapSize[0] / sh.mapSize[1];
  shadowCamera.near = sh.near;
  shadowCamera.far = L.spot.distance || sh.far;
  shadowCamera.updateProjectionMatrix();
  shadowCamera.position.copy(spotPos);
  shadowCamera.lookAt(spotTarget);
  shadowCamera.updateMatrixWorld();
  const shadowMatrix = new THREE.Matrix4()
    .set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1)
    .multiply(shadowCamera.projectionMatrix)
    .multiply(shadowCamera.matrixWorldInverse);

  return {
    directionalLights: { value: [{
      direction: pos(dirM).transformDirection(view),
      color: hex(L.directional.color, L.directional.intensity * Math.PI),
    }] },
    spotLights: { value: [{
      position: spotPos.clone().applyMatrix4(view),
      direction: spotPos.clone().sub(spotTarget).transformDirection(view),
      color: hex(L.spot.color, L.spot.intensity * Math.PI),
      distance: L.spot.distance,
      decay: L.spot.decay,
      coneCos: Math.cos(L.spot.angle),
      penumbraCos: Math.cos(L.spot.angle * (1 - L.spot.penumbra)),
    }] },
    spotLightShadows: { value: [{
      shadowBias: sh.bias, shadowNormalBias: sh.normalBias, shadowRadius: sh.radius,
      shadowMapSize: new THREE.Vector2(sh.mapSize[0], sh.mapSize[1]),
    }] },
    spotLightMatrix: { value: [shadowMatrix] }, // mat4[1]
    hemisphereLights: { value: [{
      direction: pos(hemiM).transformDirection(view),
      skyColor: hex(L.hemisphere.skyColor, L.hemisphere.intensity * Math.PI),
      groundColor: hex(L.hemisphere.groundColor, L.hemisphere.intensity * Math.PI),
    }] },
    ambientLightColor: { value: [0, 0, 0] },
    lightProbe: { value: new Array(27).fill(0) },
  };
}

async function main() {
  const data = await (await fetch(new URL("scene.json", ASSETS))).json();
  const shaderFiles = [...new Set(Object.values(data.programs).flatMap((p) => [p.vert, p.frag]))];
  const shaderSrc = Object.fromEntries(await Promise.all(shaderFiles.map(async (f) => [f, await fetchText(f)])));
  const textureList = Object.entries(data.textures);
  const textures = Object.fromEntries(await Promise.all(textureList.map(async ([id, def]) => [id, await loadTexture(def)])));

  // Spline's context: no antialias, no depth or stencil on the canvas, transparent, premultiplied.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, depth: false, stencil: false, powerPreference: "high-performance" });
  // three r178 uploads textures with UNPACK_COLORSPACE_CONVERSION = NONE; r149 (Spline) left the browser
  // default, which converts the one Display-P3-tagged texture (rubber terrazzo) to sRGB. Keep r149's.
  const gl = renderer.getContext();
  const pixelStorei = gl.pixelStorei.bind(gl);
  gl.pixelStorei = (pname, value) => pixelStorei(pname, pname === gl.UNPACK_COLORSPACE_CONVERSION_WEBGL ? gl.BROWSER_DEFAULT_WEBGL : value);

  renderer.autoClear = false;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(window.devicePixelRatio);
  const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
  renderer.setSize(cssW, cssH, false);
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const W = size.x, H = size.y;

  // camera: Spline's orthographic "Default Camera", one world unit per CSS pixel
  const camera = new THREE.OrthographicCamera(-cssW / 2, cssW / 2, cssH / 2, -cssH / 2, -50000, 50000);
  camera.matrixAutoUpdate = false;
  camera.matrixWorldAutoUpdate = false;
  camera.matrixWorld.fromArray(data.camera.matrixWorld);
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  const shadowCamera = new THREE.PerspectiveCamera();

  const blank = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  blank.needsUpdate = true;

  // render targets, as Spline's composer made them
  const shadowRT = new THREE.WebGLRenderTarget(1024, 1024, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, stencilBuffer: false });
  // r149 gives a render target without a depth texture a 16-bit depth renderbuffer (r178: 24-bit);
  // the shadow casters are depth-tested at that precision there, so here too.
  shadowRT.depthTexture = new THREE.DepthTexture(1024, 1024, THREE.UnsignedShortType);
  const sceneRT = new THREE.WebGLRenderTarget(W, H, { count: 2, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true, stencilBuffer: false });
  sceneRT.textures[1].type = THREE.HalfFloatType; // velocity
  sceneRT.depthTexture = new THREE.DepthTexture(W, H, THREE.FloatType);
  const rt = (w, h) => new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false });
  const taaResult = rt(W, H), taaHistory = rt(W, H), bloomRT = rt(W, H);
  const bw = Math.max(1, Math.round(W * BLUR_SCALE)), bh = Math.max(1, Math.round(H * BLUR_SCALE));
  const blurA = rt(bw, bh), blurB = rt(bw, bh);

  // shared dynamic uniforms of the node materials
  const shared = {
    frameIndex: { value: 0 },
    resolution: { value: new THREE.Vector2(W, H) },
    previousProjectionMatrix: { value: new THREE.Matrix4() },
    spotShadowMap: { value: [shadowRT.texture] }, // sampler2D[1]
    aoMap: { value: blank },
    ...lightUniforms(data.lights, camera, shadowCamera),
  };

  // Spline's materials (one program each; the five light bars share one), created in the trace's
  // draw order so three sorts the opaque ones the same way
  const materials = {};
  // Spline sets the size inputs of its image layers once each image has loaded, after the first frame
  const firstFrameOnly = [];
  for (const id of ["p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"]) {
    const p = data.programs[id];
    for (const name of p.materials) {
      const uniforms = { ...constUniforms(p.uniforms), previousModelViewMatrix: { value: new THREE.Matrix4() } };
      for (const u of ["frameIndex", "resolution", "previousProjectionMatrix", "directionalLights", "spotLights", "spotLightShadows", "spotLightMatrix", "hemisphereLights", "ambientLightColor", "lightProbe"]) uniforms[u] = shared[u];
      for (const [u, src] of Object.entries(p.samplers)) uniforms[u] = src === "@shadow" ? shared.spotShadowMap : src === "@blank" ? shared.aoMap : { value: textures[src] };
      materials[name] = new THREE.RawShaderMaterial({
        name, glslVersion: THREE.GLSL3,
        vertexShader: shaderSrc[p.vert], fragmentShader: shaderSrc[p.frag],
        uniforms, transparent: p.transparent,
      });
      for (const u of p.zeroOnFirstFrame) firstFrameOnly.push({ uniform: uniforms[u], value: uniforms[u].value });
    }
  }
  const depthMaterial = new THREE.RawShaderMaterial({
    name: "p1", glslVersion: THREE.GLSL3,
    vertexShader: shaderSrc[data.programs.p1.vert], fragmentShader: shaderSrc[data.programs.p1.frag],
    side: THREE.BackSide, blending: THREE.NoBlending,
  });

  // scene graph
  const geometries = Object.fromEntries(Object.entries(data.geometries).map(([k, v]) => [k, buildGeometry(v)]));
  const scene = new THREE.Scene();
  const nodes = new Map();
  const meshes = [];
  let mainPass = false;
  const build = (def, parent, path) => {
    let o;
    if (def.type === "Mesh") {
      o = new THREE.Mesh(geometries[def.geometry], materials[def.material]);
      o.castShadow = def.castShadow;
      o.receiveShadow = def.receiveShadow;
      const prev = new THREE.Matrix4();
      o.userData.prev = prev;
      o.onBeforeRender = (_r, _s, _c, _g, material) => {
        if (!mainPass) return;
        material.uniforms.previousModelViewMatrix.value = prev;
        material.uniformsNeedUpdate = true;
      };
      meshes.push(o);
    } else o = new THREE.Group();
    o.name = def.name;
    o.matrix.fromArray(def.matrix);
    o.matrix.decompose(o.position, o.quaternion, o.scale);
    parent.add(o);
    nodes.set(path, o);
    for (const c of def.children ?? []) build(c, o, path ? `${path}/${c.name}` : c.name);
  };
  for (const c of data.tree.children) build(c, scene, c.name);
  const motion = createMotion(nodes);

  // fullscreen passes (postprocessing's single triangle)
  const quad = new THREE.BufferGeometry();
  quad.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  quad.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
  const quadMesh = new THREE.Mesh(quad);
  quadMesh.frustumCulled = false;
  const quadScene = new THREE.Scene().add(quadMesh);
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const pass = (id, uniforms) => new THREE.RawShaderMaterial({
    name: id, glslVersion: THREE.GLSL3,
    vertexShader: shaderSrc[data.programs[id].vert], fragmentShader: shaderSrc[data.programs[id].frag],
    uniforms: { ...constUniforms(data.programs[id].uniforms), ...uniforms },
    depthTest: false, depthWrite: false, blending: THREE.NoBlending,
  });
  const taa = pass("p10", {
    resolution: { value: new THREE.Vector2(W, H) },
    inputBuffer: { value: sceneRT.textures[0] }, historyBuffer: { value: taaHistory.texture },
    velocityBuffer: { value: sceneRT.textures[1] }, depthBuffer: { value: sceneRT.depthTexture },
  });
  const copy = pass("p11", { inputBuffer: { value: taaResult.texture } });
  const luminance = pass("p12", { inputBuffer: { value: sceneRT.textures[0] } });
  const kawase = pass("p13", {
    inputBuffer: { value: null }, kernel: { value: 0 },
    texelSize: { value: new THREE.Vector2(1 / bw, 1 / bh) }, halfTexelSize: { value: new THREE.Vector2(0.5 / bw, 0.5 / bh) },
  });
  const composite = pass("p14", { inputBuffer: { value: sceneRT.textures[0] }, e0Map: { value: bloomRT.texture } });
  const draw = (material, target) => {
    quadMesh.material = material;
    renderer.setRenderTarget(target);
    renderer.render(quadScene, quadCamera);
  };

  renderer.compile(scene, camera);
  let frame = 0;
  const render = (now) => {
    motion.step(now);
    scene.updateMatrixWorld();
    shared.frameIndex.value = frame % 16;
    for (const f of firstFrameOnly) f.uniform.value = frame === 0 ? [0, 0, f.value[2]] : f.value;

    // 1. spot-light shadow map (three's RGBA-packed depth, back faces, drawn in scene order as
    //    r149's WebGLShadowMap does)
    mainPass = false;
    scene.overrideMaterial = depthMaterial;
    renderer.sortObjects = false;
    renderer.setRenderTarget(shadowRT);
    renderer.setClearColor(0xffffff, 1);
    renderer.clear(true, true, false);
    renderer.render(scene, shadowCamera);
    renderer.sortObjects = true;
    scene.overrideMaterial = null;

    // 2. scene → colour + velocity + depth
    mainPass = true;
    renderer.setRenderTarget(sceneRT);
    renderer.setClearColor(0x000000, 0);
    renderer.clear(true, true, false);
    renderer.render(scene, camera);
    mainPass = false;
    for (const m of meshes) m.userData.prev.copy(m.modelViewMatrix);
    shared.previousProjectionMatrix.value = camera.projectionMatrix;

    // 3. TAA resolve, history copy, result back into the scene buffer
    draw(taa, taaResult);
    draw(copy, taaHistory);
    draw(copy, sceneRT);

    // 4. bloom: luminance, Kawase blur (ping-pong at half size, last pass back to full size)
    draw(luminance, bloomRT);
    let input = bloomRT;
    KAWASE_KERNELS.forEach((k, i) => {
      const last = i === KAWASE_KERNELS.length - 1;
      const target = last ? bloomRT : i % 2 === 0 ? blurA : blurB;
      kawase.uniforms.kernel.value = k;
      kawase.uniforms.inputBuffer.value = input.texture;
      draw(kawase, target);
      input = target;
    });

    // 5. screen-blend the bloom over the scene, onto the canvas
    draw(composite, null);
    frame++;
    requestAnimationFrame(render);
  };
  // Spline draws its first frame as soon as the scene is ready, then keeps going on rAF.
  render(performance.now());
}

main();
