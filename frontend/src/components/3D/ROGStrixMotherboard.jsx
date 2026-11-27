import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useLoader } from '@react-three/fiber';
import { SingleDDR4RAM } from './DDR4RAMModel';

/* ────────────────────────────────────────────────────────────────────────── */
/*  PROCEDURAL HIGH-RES CANVAS TEXTURES FOR REALISTIC SILKSCREEN & METALS     */
/* ────────────────────────────────────────────────────────────────────────── */

function createRearPcbTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  // Matte dark charcoal solder mask
  ctx.fillStyle = '#11141a';
  ctx.fillRect(0, 0, 512, 640);

  // Subtle ROG diagonal cyber silkscreen striations
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
  ctx.lineWidth = 10;
  for (let i = -320; i < 720; i += 36) {
    ctx.beginPath();
    ctx.moveTo(i, 640);
    ctx.lineTo(i + 260, 0);
    ctx.stroke();
  }
  ctx.restore();

  // Copper trace routing buses (VRM -> CPU, CPU -> DIMM, CPU -> PCIe)
  ctx.strokeStyle = 'rgba(180, 120, 68, 0.15)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.moveTo(230 + i * 3, 210);
    ctx.lineTo(295 + i * 3, 210);
    ctx.lineTo(325 + i * 4, 155 + (i % 5) * 28);
    ctx.stroke();
  }
  for (let i = 0; i < 24; i++) {
    ctx.beginPath();
    ctx.moveTo(150 + i * 5, 250);
    ctx.lineTo(150 + i * 5, 360);
    ctx.lineTo(185 + i * 6, 405);
    ctx.stroke();
  }

  // SMD capacitor & PCIe through-hole solder pin banks
  ctx.fillStyle = '#94a3b8';
  // DIMM rear pin rows (4 columns x 48 pins)
  for (let col = 0; col < 4; col++) {
    const x = 355 + col * 24;
    for (let pin = 0; pin < 48; pin++) {
      ctx.fillRect(x, 86 + pin * 4.6, 2.5, 2.2);
      ctx.fillRect(x + 6, 86 + pin * 4.6, 2.5, 2.2);
    }
  }

  // PCIe x16 rear solder rows
  [372, 488].forEach((py) => {
    for (let px = 76; px < 350; px += 4.5) {
      ctx.fillRect(px, py, 2.2, 2.8);
      ctx.fillRect(px, py + 7, 2.2, 2.8);
    }
  });

  // SupremeFX audio PCB isolation boundary line (glowing muted amber trace)
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 465);
  ctx.lineTo(118, 465);
  ctx.lineTo(132, 482);
  ctx.lineTo(132, 624);
  ctx.stroke();

  // ATX mounting hole white caution rings
  const mountPts = [
    [28, 28], [256, 28], [484, 28],
    [28, 314], [256, 314], [484, 314],
    [28, 608], [256, 608], [484, 608],
  ];
  mountPts.forEach(([mx, my]) => {
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(mx, my, 12, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Silkscreen model imprint
  ctx.fillStyle = 'rgba(203, 213, 225, 0.26)';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('ROG STRIX B360-F GAMING  REV 1.00', 150, 560);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createLgaPinFieldTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#3b2b0d';
  ctx.fillRect(0, 0, 256, 256);

  // Outer dense LGA gold contact grid
  for (let y = 10; y < 246; y += 5) {
    for (let x = 10; x < 246; x += 5) {
      if (x > 84 && x < 172 && y > 76 && y < 180) continue;
      ctx.fillStyle = (x + y) % 10 === 0 ? '#eab308' : '#ca8a04';
      ctx.fillRect(x, y, 3, 3);
    }
  }

  // Center green fiberglass window & MLCC capacitor cluster
  ctx.fillStyle = '#1f4d3a';
  ctx.fillRect(86, 78, 84, 100);
  for (let y = 86; y < 170; y += 10) {
    for (let x = 94; x < 164; x += 10) {
      ctx.fillStyle = '#926c44';
      ctx.fillRect(x, y, 6, 4);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x - 1, y, 2, 4);
      ctx.fillRect(x + 5, y, 2, 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBrushedHeatsinkTexture(label, accent = '#94a3b8', angleDeg = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#2a2f3a');
  grad.addColorStop(0.5, '#3b4252');
  grad.addColorStop(1, '#232730');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle brushed-metal hairline grain
  for (let y = 0; y < 512; y += 3) {
    ctx.fillStyle = y % 6 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, y, 512, 1);
  }

  // Precision milled diagonal chamfer lines
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(40, 512);
  ctx.lineTo(155, 0);
  ctx.moveTo(375, 512);
  ctx.lineTo(465, 0);
  ctx.stroke();

  if (label) {
    ctx.save();
    ctx.translate(256, 270);
    ctx.rotate((angleDeg * Math.PI) / 180);
    ctx.fillStyle = accent;
    ctx.font = angleDeg !== 0 ? 'bold 54px "Inter", "Segoe UI", sans-serif' : 'bold 38px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function normalizeShapeUVs(geo, minX, maxX, minY, maxY) {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uv.setXY(i, (x - minX) / dx, (y - minY) / dy);
  }
  uv.needsUpdate = true;
  return geo;
}

function createIoShroudAuraTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark satin anodized shroud finish
  ctx.fillStyle = '#0f1217';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle metallic highlight along upper diagonal fold
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, 'rgba(255,255,255,0.06)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.0)');
  grad.addColorStop(1, 'rgba(255,255,255,0.04)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Glowing Aura mask canvas (white luminance used cleanly for emissiveMap)
  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = 512;
  emissiveCanvas.height = 512;
  const ectx = emissiveCanvas.getContext('2d');
  ectx.fillStyle = '#000000';
  ectx.fillRect(0, 0, 512, 512);

  // Sleek diagonal Aura RGB light slash
  ectx.save();
  const slashGrad = ectx.createLinearGradient(65, 115, 420, 415);
  slashGrad.addColorStop(0, 'rgba(255,255,255,0.18)');
  slashGrad.addColorStop(0.35, 'rgba(255,255,255,0.95)');
  slashGrad.addColorStop(0.85, 'rgba(255,255,255,1.0)');
  slashGrad.addColorStop(1, 'rgba(255,255,255,0.0)');
  ectx.strokeStyle = slashGrad;
  ectx.lineWidth = 14;
  ectx.lineCap = 'round';
  ectx.beginPath();
  ectx.moveTo(78, 128);
  ectx.lineTo(418, 412);
  ectx.stroke();

  // Razor-sharp angular ROG Cyber Eye emblem above diagonal slash
  ectx.fillStyle = '#ffffff';
  ectx.beginPath();
  // Outer sweeping blade wing
  ectx.moveTo(140, 128);
  ectx.lineTo(252, 102);
  ectx.lineTo(342, 118);
  ectx.lineTo(298, 154);
  ectx.lineTo(222, 174);
  ectx.lineTo(164, 152);
  ectx.closePath();
  ectx.fill();

  // Inner sharp geometric hollow cut
  ectx.fillStyle = '#000000';
  ectx.beginPath();
  ectx.moveTo(176, 134);
  ectx.lineTo(256, 114);
  ectx.lineTo(312, 126);
  ectx.lineTo(280, 148);
  ectx.lineTo(220, 160);
  ectx.closePath();
  ectx.fill();

  // Inner pupil shard
  ectx.fillStyle = '#ffffff';
  ectx.beginPath();
  ectx.moveTo(208, 138);
  ectx.lineTo(268, 126);
  ectx.lineTo(284, 134);
  ectx.lineTo(256, 148);
  ectx.lineTo(222, 148);
  ectx.closePath();
  ectx.fill();

  // Subtle horizontal ROG scanline notch on left tail
  ectx.fillStyle = '#000000';
  ectx.fillRect(148, 137, 26, 4);
  ectx.restore();

  const colorTex = new THREE.CanvasTexture(canvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  const emissiveTex = new THREE.CanvasTexture(emissiveCanvas);
  emissiveTex.colorSpace = THREE.SRGBColorSpace;

  return { colorTex, emissiveTex };
}

function createCmosBatteryTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
  grad.addColorStop(0, '#f1f5f9');
  grad.addColorStop(0.7, '#cbd5e1');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CR2032', 64, 58);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('3V +', 64, 82);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  COMPONENT                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

let _sharedAssets = null;

function getSharedMotherboardAssets() {
  if (_sharedAssets) return _sharedAssets;

  const W = 6.1;
  const H = 7.6;

  const pcbGeo = new RoundedBoxGeometry(W, H, 0.085, 3, 0.045);

  // Sculpted I/O Shroud Polygon matching ROG Strix B360-F left contour
  const ioShape = new THREE.Shape();
  ioShape.moveTo(-3.04, -0.34);
  ioShape.lineTo(-1.82, -0.34);
  ioShape.lineTo(-1.02, 0.84);
  ioShape.lineTo(-1.02, 1.92);
  ioShape.lineTo(-2.12, 3.74);
  ioShape.lineTo(-2.62, 3.74);
  ioShape.lineTo(-3.04, 3.22);
  ioShape.closePath();

  const ioShroudGeo = new THREE.ExtrudeGeometry(ioShape, {
    depth: 0.44,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 3,
  });

  const ioFaceGeo = normalizeShapeUVs(
    new THREE.ShapeGeometry(ioShape),
    -3.04,
    -1.02,
    -0.34,
    3.74
  );

  // Top VRM Heatsink Polygon
  const topVrmShape = new THREE.Shape();
  topVrmShape.moveTo(-1.26, 3.16);
  topVrmShape.lineTo(0.92, 3.16);
  topVrmShape.lineTo(0.92, 3.76);
  topVrmShape.lineTo(-0.88, 3.76);
  topVrmShape.closePath();

  const topVrmGeo = new THREE.ExtrudeGeometry(topVrmShape, {
    depth: 0.36,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 3,
  });

  // Left VRM Heatsink Polygon
  const leftVrmShape = new THREE.Shape();
  leftVrmShape.moveTo(-1.86, 1.72);
  leftVrmShape.lineTo(-1.46, 1.72);
  leftVrmShape.lineTo(-1.46, 3.04);
  leftVrmShape.lineTo(-1.98, 2.74);
  leftVrmShape.closePath();

  const leftVrmGeo = new THREE.ExtrudeGeometry(leftVrmShape, {
    depth: 0.32,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelSegments: 3,
  });

  // M.2 Brushed Thermal Armor
  const m2Shape = new THREE.Shape();
  m2Shape.moveTo(-1.38, -0.19);
  m2Shape.lineTo(1.24, -0.19);
  m2Shape.lineTo(1.38, -0.04);
  m2Shape.lineTo(1.38, 0.19);
  m2Shape.lineTo(-1.22, 0.19);
  m2Shape.lineTo(-1.38, 0.04);
  m2Shape.closePath();

  const m2Geo = new THREE.ExtrudeGeometry(m2Shape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 3,
  });

  const m2FaceGeo = normalizeShapeUVs(
    new THREE.ShapeGeometry(m2Shape),
    -1.38,
    1.38,
    -0.19,
    0.19
  );

  // Sleek Polygonal B360 PCH Chipset Heatsink Wing
  const pchShape = new THREE.Shape();
  pchShape.moveTo(-0.78, -0.78);
  pchShape.lineTo(0.92, -0.78);
  pchShape.lineTo(0.92, 0.16);
  pchShape.lineTo(0.08, 0.96);
  pchShape.lineTo(-0.92, 0.96);
  pchShape.lineTo(-0.92, -0.22);
  pchShape.closePath();

  const pchGeo = new THREE.ExtrudeGeometry(pchShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.045,
    bevelSegments: 3,
  });

  const pchFaceGeo = normalizeShapeUVs(
    new THREE.ShapeGeometry(pchShape),
    -0.92,
    0.92,
    -0.78,
    0.96
  );

  const chokeGeo = new RoundedBoxGeometry(0.24, 0.24, 0.15, 2, 0.025);
  const socketBaseGeo = new RoundedBoxGeometry(1.70, 1.70, 0.09, 2, 0.04);
  const safeSlotGeo = new RoundedBoxGeometry(3.82, 0.22, 0.23, 2, 0.025);
  const supremeFxGeo = new RoundedBoxGeometry(0.64, 0.64, 0.14, 2, 0.03);
  const epsPlugGeo = new RoundedBoxGeometry(0.68, 0.30, 0.25, 2, 0.02);
  const atx24Geo = new RoundedBoxGeometry(0.32, 1.88, 0.30, 2, 0.02);

  const leverCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.79, -0.78, 0.07),
    new THREE.Vector3(0.81, 0.0, 0.07),
    new THREE.Vector3(0.84, 0.68, 0.075),
    new THREE.Vector3(0.96, 0.78, 0.085),
    new THREE.Vector3(0.98, 0.90, 0.085),
  ]);
  const leverGeo = new THREE.TubeGeometry(leverCurve, 24, 0.022, 8, false);

  _sharedAssets = {
    pcbGeo,
    ioShroudGeo,
    ioFaceGeo,
    topVrmGeo,
    leftVrmGeo,
    m2Geo,
    m2FaceGeo,
    pchGeo,
    pchFaceGeo,
    chokeGeo,
    socketBaseGeo,
    safeSlotGeo,
    supremeFxGeo,
    epsPlugGeo,
    atx24Geo,
    leverGeo,
    rearPcbTex: createRearPcbTexture(),
    lgaPinTex: createLgaPinFieldTexture(),
    strixTex: createBrushedHeatsinkTexture('STRIX', '#94a3b8', 42),
    rogM2Tex: createBrushedHeatsinkTexture('REPUBLIC OF GAMERS', '#cbd5e1', 0),
    supFxTex: createBrushedHeatsinkTexture('SupremeFX', '#e2e8f0', 0),
    cmosTex: createCmosBatteryTexture(),
    ioAura: createIoShroudAuraTexture(),
  };

  return _sharedAssets;
}

/**
 * ROGStrixMotherboard - High-Detail Sculpted 3D ATX Motherboard
 * Modeled after the ASUS ROG Strix B360-F Gaming Motherboard.
 */
export default function ROGStrixMotherboard({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  rgbColor = '#00e5ff',
  explodedProgress = 0,
  isSelected = false,
  isHovered = false,
  enableHighlight = false,
  onSelect,
  onHover,
  part,
  showCpu = false,
  showRam = false,
  showStorage = false,
  showGpu = false,
}) {
  const pcbTexture = useLoader(THREE.TextureLoader, '/assets/3d/strix_b360f_full_top.png');

  useMemo(() => {
    if (pcbTexture) {
      pcbTexture.colorSpace = THREE.SRGBColorSpace;
      pcbTexture.anisotropy = 8;
      pcbTexture.minFilter = THREE.LinearMipmapLinearFilter;
      pcbTexture.magFilter = THREE.LinearFilter;
    }
  }, [pcbTexture]);

  const assets = useMemo(() => getSharedMotherboardAssets(), []);

  // PBR Materials (calibrated satin metals so chamfers read crisply under both dark & studio HDRIs)
  const gunmetalHeatsinkMat = {
    color: '#4c5464',
    roughness: 0.34,
    metalness: 0.68,
  };

  const steelArmorMat = {
    color: '#dce3ec',
    roughness: 0.28,
    metalness: 0.72,
  };

  const plasticMat = {
    color: '#15181e',
    roughness: 0.65,
    metalness: 0.14,
  };

  const goldCapMat = {
    color: '#d4af37',
    roughness: 0.24,
    metalness: 0.92,
  };

  const aluCapMat = {
    color: '#cbd5e1',
    roughness: 0.22,
    metalness: 0.94,
  };

  const highlightEmissive = isSelected ? '#00e5ff' : isHovered ? '#38bdf8' : '#000000';
  const highlightIntensity = isSelected ? 0.35 : isHovered ? 0.18 : 0;

  const W = 6.1;
  const H = 7.6;
  const halfW = W / 2; // 3.05
  const halfH = H / 2; // 3.8

  const expHeatsink = explodedProgress * 0.7;
  const expCover = explodedProgress * 1.1;

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={enableHighlight && onSelect ? (e) => { e.stopPropagation(); onSelect(part); } : undefined}
      onPointerOver={enableHighlight && onHover ? (e) => { e.stopPropagation(); onHover(part, true); } : undefined}
      onPointerOut={enableHighlight && onHover ? (e) => { e.stopPropagation(); onHover(part, false); } : undefined}
    >
      {/* ========================================================= */}
      {/* 1. BEVELED ATX PCB SUBSTRATE + DUAL-SIDED DETAIL TEXTURE  */}
      {/* ========================================================= */}
      <group name="atx_pcb_substrate">
        <mesh geometry={assets.pcbGeo}>
          <meshStandardMaterial
            color="#101318"
            roughness={0.82}
            metalness={0.08}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>

        {/* Front High-Resolution Motherboard Top Face */}
        <mesh position={[0, 0, 0.044]}>
          <planeGeometry args={[W - 0.04, H - 0.04]} />
          <meshStandardMaterial
            map={pcbTexture}
            roughness={0.72}
            metalness={0.14}
            polygonOffset={true}
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>

        {/* Rear PCB Face (Back Traces, SMD Pads & Caution Silkscreen) */}
        <mesh position={[0, 0, -0.044]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[W - 0.04, H - 0.04]} />
          <meshStandardMaterial
            map={assets.rearPcbTex}
            roughness={0.78}
            metalness={0.15}
            polygonOffset={true}
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>

        {/* Rear LGA1151 Stamped Steel CPU Backplate + 4 Corner Mount Studs */}
        <group position={[-0.35, 1.6, -0.062]}>
          <mesh>
            <boxGeometry args={[1.48, 1.48, 0.032]} />
            <meshStandardMaterial color="#384152" metalness={0.88} roughness={0.32} />
          </mesh>
          <mesh position={[0, 0, -0.014]}>
            <boxGeometry args={[0.92, 0.92, 0.015]} />
            <meshStandardMaterial color="#1e2430" metalness={0.6} roughness={0.5} />
          </mesh>
          {[[-0.64, -0.64], [0.64, -0.64], [-0.64, 0.64], [0.64, 0.64]].map(([bx, by], i) => (
            <mesh key={i} position={[bx, by, -0.022]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.03, 12]} />
              <meshStandardMaterial {...steelArmorMat} />
            </mesh>
          ))}
        </group>

        {/* 9x Flush ATX Brass/Tin Standoff Mounting Rings (Properly Oriented) */}
        {[
          [-halfW + 0.28, halfH - 0.28], [0, halfH - 0.28], [halfW - 0.28, halfH - 0.28],
          [-halfW + 0.28, 0.1],          [0, 0.1],          [halfW - 0.28, 0.1],
          [-halfW + 0.28, -halfH + 0.34],[0, -halfH + 0.34],[halfW - 0.28, -halfH + 0.34],
        ].map(([sx, sy], idx) => (
          <group key={idx} position={[sx, sy, 0.047]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.135, 0.135, 0.006, 16]} />
              <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0, 0.002]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.007, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.22} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 2. SCULPTED PRE-MOUNTED I/O SHROUD + AURA RGB ROG EYE     */}
      {/* ========================================================= */}
      <group name="io_armor_shroud" position={[0, 0, 0.05 + expCover]}>
        <mesh geometry={assets.ioShroudGeo}>
          <meshStandardMaterial color="#171a21" metalness={0.45} roughness={0.42} />
        </mesh>

        {/* Flush Contoured Aura RGB Emblem + Diagonal Light Slash Plate */}
        <mesh geometry={assets.ioFaceGeo} position={[0, 0, 0.503]}>
          <meshStandardMaterial
            map={assets.ioAura.colorTex}
            emissiveMap={assets.ioAura.emissiveTex}
            emissive={rgbColor}
            emissiveIntensity={1.85}
            roughness={0.38}
            metalness={0.25}
          />
        </mesh>

        {/* Pre-Mounted Stainless Steel Rear I/O Shield & Stacked Port Cluster */}
        <group position={[-3.07, 1.55, 0.22]}>
          <mesh>
            <boxGeometry args={[0.06, 3.72, 0.52]} />
            <meshStandardMaterial color="#20242c" metalness={0.82} roughness={0.28} />
          </mesh>
          {/* PS/2 + USB 2.0 + DVI-D + DP + HDMI + USB 3.1 + Red LAN + Audio Stack */}
          {[
            { y: 1.55, h: 0.24, w: 0.24, col: '#111827' }, // PS/2 + Flashback
            { y: 1.15, h: 0.36, w: 0.24, col: '#0284c7' }, // USB 3.0 stack
            { y: 0.62, h: 0.56, w: 0.26, col: '#cbd5e1' }, // DVI-D Nickel Shield
            { y: 0.05, h: 0.42, w: 0.26, col: '#94a3b8' }, // HDMI + DisplayPort
            { y: -0.48, h: 0.36, w: 0.24, col: '#dc2626' }, // Intel Gigabit RJ45 + USB 3.1 Red
            { y: -0.95, h: 0.28, w: 0.24, col: '#0f172a' }, // Optical SPDIF
          ].map((p, idx) => (
            <mesh key={idx} position={[-0.03, p.y, 0.02]}>
              <boxGeometry args={[0.06, p.h, p.w]} />
              <meshStandardMaterial color={p.col} metalness={0.8} roughness={0.28} />
            </mesh>
          ))}
          {/* 5x Metallic Color-Coded 3.5mm Audio Jacks */}
          {[-1.24, -1.36, -1.48, -1.60, -1.72].map((ay, idx) => (
            <mesh key={idx} position={[-0.035, ay, idx % 2 === 0 ? 0.08 : -0.06]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.055, 0.055, 0.06, 12]} />
              <meshStandardMaterial
                color={['#22c55e', '#3b82f6', '#ec4899', '#f97316', '#1e293b'][idx]}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================= */}
      {/* 3. SCULPTED BRUSHED-ALUMINUM VRM HEATSINKS & POWER STAGE   */}
      {/* ========================================================= */}
      <group name="vrm_cooling">
        {/* Top VRM Extruded Finned Block */}
        <group position={[0, 0, 0.05 + expHeatsink]}>
          <mesh geometry={assets.topVrmGeo}>
            <meshStandardMaterial {...gunmetalHeatsinkMat} />
          </mesh>
          {/* 3 Diagonal Precision-Milled Cooling Fin Slits */}
          {[-0.48, -0.14, 0.20].map((fx, i) => (
            <mesh key={i} position={[fx, 3.46, 0.37]} rotation={[0, 0, 0.56]}>
              <boxGeometry args={[0.07, 0.62, 0.08]} />
              <meshStandardMaterial color="#181c24" metalness={0.45} roughness={0.55} />
            </mesh>
          ))}
        </group>

        {/* Left VRM Extruded Brushed Block */}
        <group position={[0, 0, 0.05 + expHeatsink]}>
          <mesh geometry={assets.leftVrmGeo}>
            <meshStandardMaterial {...gunmetalHeatsinkMat} />
          </mesh>
          {[2.02, 2.34, 2.66].map((fy, i) => (
            <mesh key={i} position={[-1.66, fy, 0.33]}>
              <boxGeometry args={[0.38, 0.055, 0.07]} />
              <meshStandardMaterial color="#12151c" metalness={0.7} roughness={0.45} />
            </mesh>
          ))}
        </group>

        {/* 9x Rounded DIGI+ VRM Alloy Chokes (Top & Left Power Stages) */}
        {[-0.86, -0.54, -0.22, 0.10, 0.42].map((cx, i) => (
          <mesh key={`tc-${i}`} geometry={assets.chokeGeo} position={[cx, 2.84, 0.12]}>
            <meshStandardMaterial color="#20252f" roughness={0.42} metalness={0.62} />
          </mesh>
        ))}
        {[2.44, 2.12, 1.80, 1.48].map((cy, i) => (
          <mesh key={`lc-${i}`} geometry={assets.chokeGeo} position={[-1.34, cy, 0.12]}>
            <meshStandardMaterial color="#20252f" roughness={0.42} metalness={0.62} />
          </mesh>
        ))}

        {/* 8-Pin ProCool EATX 12V CPU Power Socket with Pin Cells */}
        <group position={[-2.08, 3.55, 0.15]}>
          <mesh geometry={assets.epsPlugGeo}>
            <meshStandardMaterial {...plasticMat} />
          </mesh>
          <mesh position={[0, 0, 0.11]}>
            <boxGeometry args={[0.62, 0.24, 0.05]} />
            <meshStandardMaterial color="#090b0f" roughness={0.85} />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 4. SCULPTED LGA1151 CPU SOCKET & RETENTION MECHANISM      */}
      {/* ========================================================= */}
      <group name="cpu_socket_lga" position={[-0.35, 1.6, 0.09]}>
        <mesh geometry={assets.socketBaseGeo}>
          <meshStandardMaterial color="#171a20" roughness={0.75} metalness={0.1} />
        </mesh>

        {!showCpu ? (
          <group>
            {/* Micro-Grid Gold LGA Pin Matrix + Center MLCC Bank */}
            <mesh position={[0, 0, 0.048]}>
              <planeGeometry args={[1.34, 1.34]} />
              <meshStandardMaterial map={assets.lgaPinTex} metalness={0.72} roughness={0.34} />
            </mesh>
            {/* Open Stamped Stainless Steel ILM Load Frame */}
            <group position={[0, 0.16, 0.13]} rotation={[-0.4, 0, 0]}>
              {[
                { p: [0, 0.68, 0], s: [1.56, 0.18, 0.04] },
                { p: [0, -0.68, 0], s: [1.56, 0.18, 0.04] },
                { p: [-0.69, 0, 0], s: [0.18, 1.24, 0.04] },
                { p: [0.69, 0, 0], s: [0.18, 1.24, 0.04] },
              ].map((rail, idx) => (
                <mesh key={idx} position={rail.p}>
                  <boxGeometry args={rail.s} />
                  <meshStandardMaterial {...steelArmorMat} />
                </mesh>
              ))}
            </group>
            {/* Curved Retention Lever */}
            <mesh geometry={assets.leverGeo} position={[0, 0.12, 0.07]} rotation={[-0.4, 0, 0]}>
              <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.12} />
            </mesh>
          </group>
        ) : (
          <group>
            {/* Seated Green Processor Substrate */}
            <mesh position={[0, 0, 0.055]}>
              <boxGeometry args={[1.34, 1.34, 0.028]} />
              <meshStandardMaterial color="#0f6b56" roughness={0.45} metalness={0.12} />
            </mesh>
            {/* Pin-1 Corner Triangle */}
            <mesh position={[-0.58, -0.58, 0.071]}>
              <boxGeometry args={[0.07, 0.07, 0.004]} />
              <meshBasicMaterial color="#facc15" />
            </mesh>
            {/* Stamped Steel ILM Outer Bezel */}
            {[
              { p: [0, 0.68, 0.068], s: [1.56, 0.18, 0.036] },
              { p: [0, -0.68, 0.068], s: [1.56, 0.18, 0.036] },
              { p: [-0.69, 0, 0.068], s: [0.18, 1.24, 0.036] },
              { p: [0.69, 0, 0.068], s: [0.18, 1.24, 0.036] },
            ].map((rail, idx) => (
              <mesh key={idx} position={rail.p}>
                <boxGeometry args={rail.s} />
                <meshStandardMaterial {...steelArmorMat} />
              </mesh>
            ))}
            {/* Nickel-Plated Copper IHS (Rounded Stepped Heat Spreader) */}
            <mesh position={[0, 0, 0.088]}>
              <boxGeometry args={[1.14, 1.14, 0.032]} />
              <meshStandardMaterial color="#d8dee8" metalness={0.68} roughness={0.28} />
            </mesh>
            {/* Clamped Curved Retention Lever */}
            <mesh geometry={assets.leverGeo} position={[0, 0, 0.005]}>
              <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.12} />
            </mesh>
          </group>
        )}
      </group>

      {/* ========================================================= */}
      {/* 5. 4x DDR4 DIMM SLOTS + 24-PIN ATX HEADER                 */}
      {/* ========================================================= */}
      <group name="ddr4_slots" position={[1.5, 1.6, 0.16]}>
        {[-0.6, -0.2, 0.2, 0.6].map((sx, idx) => {
          const isSlotPopulated = showRam && (idx === 1 || idx === 3);

          return (
            <group key={idx} position={[sx, 0, 0]}>
              {/* Left & Right Slot Walls Leaving Inner Contact Track */}
              <mesh position={[-0.055, 0, 0]}>
                <boxGeometry args={[0.045, 2.75, 0.21]} />
                <meshStandardMaterial color={idx % 2 === 0 ? '#121419' : '#2d333f'} roughness={0.62} />
              </mesh>
              <mesh position={[0.055, 0, 0]}>
                <boxGeometry args={[0.045, 2.75, 0.21]} />
                <meshStandardMaterial color={idx % 2 === 0 ? '#121419' : '#2d333f'} roughness={0.62} />
              </mesh>
              {/* Inner Gold Contact Pins Track */}
              <mesh position={[0, 0, -0.02]}>
                <boxGeometry args={[0.04, 2.66, 0.12]} />
                <meshStandardMaterial color="#b48a2c" metalness={0.85} roughness={0.35} />
              </mesh>
              {/* Key Notch Center Post */}
              <mesh position={[0, 0.18, 0.05]}>
                <boxGeometry args={[0.15, 0.09, 0.12]} />
                <meshStandardMaterial color="#0b0d11" roughness={0.8} />
              </mesh>
              {/* Sculpted Q-DIMM Top Latch Clip */}
              <mesh
                position={[0, isSlotPopulated ? 1.38 : 1.45, isSlotPopulated ? 0.12 : 0.05]}
                rotation={[isSlotPopulated ? 0 : 0.25, 0, 0]}
              >
                <boxGeometry args={[0.16, 0.13, 0.13]} />
                <meshStandardMaterial color="#384152" metalness={0.3} roughness={0.55} />
              </mesh>
              {/* Fixed Bottom Retaining Collar */}
              <mesh position={[0, -1.39, 0.04]}>
                <boxGeometry args={[0.16, 0.11, 0.18]} />
                <meshStandardMaterial color="#1f242d" roughness={0.65} />
              </mesh>

              {/* Seated DDR4 Memory Modules in Primary Slots A2 / B2 */}
              {isSlotPopulated && (
                <group position={[0, 0, 0.24]} rotation={[0, 0, Math.PI / 2]}>
                  <SingleDDR4RAM scale={0.36} rgbColor="#ffffff" enableHighlight={false} />
                </group>
              )}
            </group>
          );
        })}

        {/* 24-Pin EATX Main Power Header (2x12 Dark Recessed Cells) */}
        <group position={[1.20, 0.25, 0.06]}>
          <mesh geometry={assets.atx24Geo}>
            <meshStandardMaterial {...plasticMat} />
          </mesh>
          <mesh position={[0, 0, 0.13]}>
            <boxGeometry args={[0.22, 1.74, 0.05]} />
            <meshStandardMaterial color="#080a0e" roughness={0.88} />
          </mesh>
          {Array.from({ length: 12 }).map((_, r) => (
            <group key={r} position={[0, -0.74 + r * 0.134, 0.138]}>
              <mesh position={[-0.052, 0, 0]}>
                <boxGeometry args={[0.04, 0.05, 0.03]} />
                <meshStandardMaterial color="#c89d28" metalness={0.88} roughness={0.3} />
              </mesh>
              <mesh position={[0.052, 0, 0]}>
                <boxGeometry args={[0.04, 0.05, 0.03]} />
                <meshStandardMaterial color="#c89d28" metalness={0.88} roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ========================================================= */}
      {/* 6. SAFESLOT PCIE X16 & EXPANSION SLOTS                    */}
      {/* ========================================================= */}
      <group name="pcie_expansion">
        {/* Primary SafeSlot PCIe 3.0 x16 (Steel Reinforced Frame + Pin Trench) */}
        <group position={[-0.35, -0.65, 0.14]}>
          <mesh geometry={assets.safeSlotGeo}>
            <meshStandardMaterial {...steelArmorMat} />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <boxGeometry args={[3.68, 0.09, 0.17]} />
            <meshStandardMaterial color="#0b0d11" roughness={0.85} />
          </mesh>
          <mesh position={[-1.18, 0, 0.09]}>
            <boxGeometry args={[0.07, 0.19, 0.10]} />
            <meshStandardMaterial color="#181b22" />
          </mesh>
          {/* ROG Q-Latch Clip */}
          <mesh position={[2.0, 0, 0.02]}>
            <boxGeometry args={[0.24, 0.27, 0.16]} />
            <meshStandardMaterial color="#334155" roughness={0.45} metalness={0.3} />
          </mesh>
        </group>

        {/* Secondary PCIe 3.0 x16 Slot */}
        <group position={[-0.35, -2.25, 0.11]}>
          <mesh>
            <boxGeometry args={[3.8, 0.19, 0.18]} />
            <meshStandardMaterial {...plasticMat} />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[3.68, 0.08, 0.13]} />
            <meshStandardMaterial color="#090b0f" />
          </mesh>
          <mesh position={[2.0, 0, 0.02]}>
            <boxGeometry args={[0.22, 0.25, 0.15]} />
            <meshStandardMaterial color="#384152" roughness={0.5} />
          </mesh>
        </group>

        {/* 4x PCIe x1 Short Expansion Slots */}
        {[-0.15, -1.15, -1.7, -2.85].map((py, idx) => (
          <group key={idx} position={[-1.4, py, 0.09]}>
            <mesh>
              <boxGeometry args={[1.48, 0.17, 0.15]} />
              <meshStandardMaterial {...plasticMat} />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[1.38, 0.07, 0.11]} />
              <meshStandardMaterial color="#090b0f" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 7. M.2 ALUMINUM ARMOR HEATSINK (REPUBLIC OF GAMERS)       */}
      {/* ========================================================= */}
      <group name="m2_armor" position={[-0.35, -1.65, 0.09 + expHeatsink]}>
        <mesh geometry={assets.m2Geo}>
          <meshStandardMaterial {...gunmetalHeatsinkMat} />
        </mesh>
        <mesh geometry={assets.m2FaceGeo} position={[0, 0, 0.118]}>
          <meshStandardMaterial map={assets.rogM2Tex} metalness={0.85} roughness={0.28} />
        </mesh>
        {[-1.24, 1.24].map((sx, i) => (
          <mesh key={i} position={[sx, 0, 0.125]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.025, 16]} />
            <meshStandardMaterial {...steelArmorMat} />
          </mesh>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 8. SCULPTED B360 PCH CHIPSET HEATSINK WING (STRIX)        */}
      {/* ========================================================= */}
      <group name="pch_chipset_heatsink" position={[1.65, -1.92, 0.07 + expHeatsink]}>
        <mesh geometry={assets.pchGeo}>
          <meshStandardMaterial {...gunmetalHeatsinkMat} />
        </mesh>
        {/* Flush Polygonal Brushed Gunmetal Strix Top Cap */}
        <mesh geometry={assets.pchFaceGeo} position={[0, 0, 0.268]}>
          <meshStandardMaterial map={assets.strixTex} metalness={0.84} roughness={0.30} />
        </mesh>
        {/* Subtle Precision Accent Hairline */}
        <mesh position={[0.05, -0.35, 0.275]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[1.05, 0.032, 0.015]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1.6} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 9. CMOS CR2032 CELL + SUPREMEFX AUDIO + GOLD CAPACITORS   */}
      {/* ========================================================= */}
      <group name="cmos_battery" position={[-1.08, -1.18, 0.08]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.07, 24]} />
          <meshStandardMaterial {...plasticMat} />
        </mesh>
        <mesh position={[0, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.20, 0.20, 0.025, 24]} />
          <meshStandardMaterial map={assets.cmosTex} metalness={0.9} roughness={0.22} />
        </mesh>
        <mesh position={[0.15, 0, 0.048]}>
          <boxGeometry args={[0.14, 0.08, 0.012]} />
          <meshStandardMaterial {...steelArmorMat} />
        </mesh>
      </group>

      <group name="supremefx_audio_block" position={[-2.52, -2.42, 0.11]}>
        <mesh geometry={assets.supremeFxGeo} position={[0, 0.45, 0]}>
          <meshStandardMaterial {...steelArmorMat} />
        </mesh>
        <mesh position={[0, 0.45, 0.074]}>
          <planeGeometry args={[0.54, 0.54]} />
          <meshStandardMaterial map={assets.supFxTex} metalness={0.85} roughness={0.26} />
        </mesh>
        {/* 8x Staggered Gold Nichicon Acoustic Capacitors */}
        {[-0.18, -0.45, -0.72, -0.99].map((cy, i) => (
          <group key={i}>
            <mesh position={[-0.15, cy, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.095, 0.095, 0.19, 16]} />
              <meshStandardMaterial {...goldCapMat} />
            </mesh>
            <mesh position={[0.12, cy, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.095, 0.095, 0.19, 16]} />
              <meshStandardMaterial {...goldCapMat} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 10. SATA PORTS, USB 3.1 HEADER & SOLID ALUMINUM CAPS      */}
      {/* ========================================================= */}
      <group name="onboard_components">
        {/* 6x Right-Angle SATA 6Gbps Ports along right edge */}
        <group position={[halfW - 0.22, -1.85, 0.14]}>
          {[-0.56, 0.0, 0.56].map((sy, i) => (
            <mesh key={i} position={[0, sy, 0]}>
              <boxGeometry args={[0.36, 0.34, 0.22]} />
              <meshStandardMaterial {...plasticMat} />
            </mesh>
          ))}
        </group>

        {/* Internal USB 3.1 Gen1 Front Header */}
        <mesh position={[halfW - 0.26, -0.05, 0.15]}>
          <boxGeometry args={[0.24, 0.62, 0.22]} />
          <meshStandardMaterial {...plasticMat} />
        </mesh>

        {/* Metallic Solid Aluminum 10K Capacitors */}
        {[
          [-1.12, 2.55], [-1.12, 2.28], [-1.12, 2.01], [-1.12, 1.74], [-1.12, 1.47],
          [-1.12, 1.20], [-1.12, 0.93], [0.85, 2.95],  [1.12, 2.95],  [2.52, 2.55],
        ].map(([cx, cy], idx) => (
          <mesh key={idx} position={[cx, cy, 0.10]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.068, 0.068, 0.14, 16]} />
            <meshStandardMaterial {...aluCapMat} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
