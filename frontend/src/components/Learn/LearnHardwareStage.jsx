import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import ComponentModels3D from "../3D/ComponentModels3D";
import GenericPCCase from "../3D/GenericPCCase";
import PSUModel from "../3D/PSUModel";
import { SingleNVMeSSD } from "../3D/NVMeSSDModel";
import { SingleDDR4RAM } from "../3D/DDR4RAMModel";
import NepotatoGPU from "../3D/NepotatoGPU";
import soundManager from "../../utilities/soundManager";

/* ═══════════════════════════════════════════════════════════════════
   LearnHardwareStage — Interactive 3D Hardware Workbench Canvas
   Modeled after https://learn-arduino-red.vercel.app/#board:
   • Smooth isometric 3D board & component orbit stage
   • Pulsing cyan/teal anatomical hotspots (<Html>) with camera focus
   • Signal/Power flow visualization beams between buses
   • Moveable / toggleable Top-Left Bus Schematic floating window
   • Floating Part Inspector card linked to selected hotspot
   • Bottom-left Minimap & Bottom-center Viewport Toolbar
   ═══════════════════════════════════════════════════════════════════ */

const DEFAULT_CAMERAS = {
  composite: { pos: [-8.6, 2.9, 6.8], target: [-0.35, 0.05, 0.0], scale: 0.96 },
  "assembly-lab": { pos: [-9.4, 3.2, 7.8], target: [0, 0, 0], scale: 0.94 },
  motherboard: { pos: [-7.4, 1.6, 5.2], target: [0, 0.15, 0], scale: 1.05 },
  cpu: { pos: [-5.8, 2.2, 5.2], target: [-0.15, 0.65, 0.25], scale: 0.96 },
  ram: { pos: [-4.6, 1.4, 3.8], target: [0, 0.1, 0], scale: 1.6 },
  storage: { pos: [-2.8, 2.8, 2.8], target: [0, 0.05, 0], scale: 1.55 },
  gpu: { pos: [-6.4, 1.6, 5.4], target: [0, 0, 0], scale: 1.15 },
  psu: { pos: [4.8, 2.8, 4.8], target: [0, 0.1, 0], scale: 1.2 },
  case: { pos: [-12.5, 4.2, 10.5], target: [0, 0.2, 0], scale: 0.72 },
};

const ARTICLE_HOTSPOTS = [
  {
    id: "sys-cpu",
    label: "CPU & Cooler Assembly",
    pos: [-0.65, 1.55, -0.6],
    camPos: [-4.6, 2.2, 1.4],
    target: [-0.2, 1.4, -0.6],
    bus: "Socket AM5 / LGA1700",
    voltage: "1.2V VCore · 65W-253W",
    role: "Executes OS instructions, physics, and game logic over billions of cycles per second.",
    tip: "Drop into socket with Zero Insertion Force—never press down manually on pins.",
  },
  {
    id: "sys-ram",
    label: "Dual-Channel RAM (A2 / B2)",
    pos: [-0.55, 1.4, 0.9],
    camPos: [-4.4, 1.8, 2.6],
    target: [-0.15, 1.4, 0.8],
    bus: "128-Bit DDR5 / DDR4",
    voltage: "1.1V - 1.35V VDD",
    role: "Active high-speed workbench buffering textures and open applications right beside the CPU.",
    tip: "With 2 modules, skip slot 1 and populate slots 2 & 4 so dual-channel activates.",
  },
  {
    id: "sys-nvme",
    label: "M.2 NVMe Boot SSD",
    pos: [-0.45, 0.35, -0.6],
    camPos: [-3.6, 0.8, 0.9],
    target: [-0.1, 0.35, -0.6],
    bus: "PCIe 4.0 / 5.0 x4",
    voltage: "3.3V Direct Rail",
    role: "Permanent solid-state storage wired straight to CPU PCIe lanes at 7,000+ MB/s.",
    tip: "Insert at a 25-degree angle, press tail onto the standoff, and peel thermal pad film.",
  },
  {
    id: "sys-gpu",
    label: "PCIe x16 Graphics Card",
    pos: [-1.15, -0.7, -0.1],
    camPos: [-5.8, -0.2, 3.2],
    target: [-0.4, -0.7, -0.2],
    bus: "PCIe x16 + 12V-2x6",
    voltage: "115W - 450W TGP",
    role: "Massively parallel visual engine rendering every 3D polygon, ray, and frame.",
    tip: "Connect your monitor DisplayPort or HDMI directly to the back of THIS card.",
  },
  {
    id: "sys-vrm",
    label: "VRM & 24-Pin Power Bus",
    pos: [-0.35, 2.25, -1.6],
    camPos: [-4.6, 2.6, -2.8],
    target: [-0.15, 1.9, -1.0],
    bus: "12V ATX / EPS Input",
    voltage: "VRM Steps 12V -> 1.2V",
    role: "Conditions wall-converted DC rails from the PSU into ripple-free CPU boost power.",
    tip: "Remember both the 24-pin side cable AND the top-left 8-pin EPS CPU cable.",
  },
];

function CameraRig({
  specimenKey,
  activeHotspot,
  rotationAngle,
  zoomFactor,
  resetNonce,
  isPaused = false,
}) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const preset = DEFAULT_CAMERAS[specimenKey] || DEFAULT_CAMERAS.motherboard;

  const isTransitioning = useRef(true);
  const goalPos = useRef(new THREE.Vector3(...preset.pos));
  const goalTarget = useRef(new THREE.Vector3(...preset.target));

  useEffect(() => {
    const base = activeHotspot
      ? new THREE.Vector3(...activeHotspot.camPos)
      : new THREE.Vector3(...preset.pos);
    const tgt = activeHotspot
      ? new THREE.Vector3(...activeHotspot.target)
      : new THREE.Vector3(...preset.target);

    // Apply user rotation and zoom around target
    const offset = base.clone().sub(tgt);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
    offset.multiplyScalar(1 / Math.max(0.55, Math.min(1.9, zoomFactor)));
    goalPos.current.copy(tgt).add(offset);
    goalTarget.current.copy(tgt);
    isTransitioning.current = true;
  }, [specimenKey, activeHotspot, rotationAngle, zoomFactor, resetNonce, preset]);

  useFrame((_, delta) => {
    if (isPaused) return;
    const controls = controlsRef.current;
    if (!controls) return;
    if (isTransitioning.current) {
      const alpha = 1 - Math.exp(-delta * 6.5);
      camera.position.lerp(goalPos.current, alpha);
      controls.target.lerp(goalTarget.current, alpha);
      controls.update();
      if (
        camera.position.distanceTo(goalPos.current) < 0.03 &&
        controls.target.distanceTo(goalTarget.current) < 0.02
      ) {
        isTransitioning.current = false;
      }
    } else {
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={2.1}
      maxDistance={19}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
}

function SignalFlowBeams({ specimenKey, visible, isPaused = false }) {
  const dotRef1 = useRef();
  const dotRef2 = useRef();
  const dotRef3 = useRef();

  const paths = useMemo(() => {
    if (specimenKey === "composite" || specimenKey === "motherboard") {
      return [
        // VRM -> CPU power
        [
          [-0.22, 2.25, -0.6],
          [-0.14, 1.45, -0.6],
        ],
        // CPU <-> DDR5 DIMM Slots
        [
          [-0.14, 1.4, -0.6],
          [-0.14, 1.4, 0.8],
        ],
        // CPU <-> M.2 NVMe & PCIe x16 GPU
        [
          [-0.14, 1.35, -0.5],
          [-0.14, 0.35, -0.5],
          [-0.16, -0.7, -0.3],
        ],
      ];
    }
    return [
      [
        [-0.3, 0.8, -0.6],
        [-0.3, 0.0, 0.0],
        [-0.3, -0.7, 0.6],
      ],
    ];
  }, [specimenKey]);

  useFrame(({ clock }) => {
    if (isPaused || !visible) return;
    const t = (clock.getElapsedTime() * 0.65) % 1;
    const refs = [dotRef1, dotRef2, dotRef3];
    paths.forEach((pts, idx) => {
      const mesh = refs[idx]?.current;
      if (!mesh || pts.length < 2) return;
      const seg = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
      const localT = t * (pts.length - 1) - seg;
      const a = new THREE.Vector3(...pts[seg]);
      const b = new THREE.Vector3(...pts[seg + 1]);
      mesh.position.lerpVectors(a, b, localT);
    });
  });

  if (!visible) return null;
  const refs = [dotRef1, dotRef2, dotRef3];
  const colors = ["#00A896", "#38bdf8", "#f59e0b"];

  return (
    <group>
      {paths.map((pts, idx) => (
        <React.Fragment key={idx}>
          <Line
            points={pts}
            color={colors[idx % colors.length]}
            lineWidth={2.5}
            dashed
            dashSize={0.18}
            gapSize={0.12}
          />
          <mesh ref={refs[idx]}>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshBasicMaterial color={colors[idx % colors.length]} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

function StageSpecimen({
  specimenKey,
  selectedPartName,
  showSignalFlow,
  hotspots,
  selectedHotspotId,
  showHotspots,
  onSelectHotspot,
  isExploded = false,
  isPaused = false,
}) {
  const isComposite = specimenKey === "composite" || specimenKey === "assembly-lab";
  const stageScale = (DEFAULT_CAMERAS[specimenKey] || DEFAULT_CAMERAS.motherboard).scale;

  // Smooth exploded interpolation ratio
  const explodeRatioRef = useRef(0);
  const [explodeRatio, setExplodeRatio] = useState(0);

  useFrame((_, delta) => {
    if (isPaused) return;
    const target = isExploded ? 1.0 : 0.0;
    const next = THREE.MathUtils.damp(explodeRatioRef.current, target, 7, delta);
    explodeRatioRef.current = next;
    if (Math.abs(next - explodeRatio) > 0.015) {
      setExplodeRatio(next);
    }
  });

  const ex = explodeRatio;

  return (
    <group scale={[stageScale, stageScale, stageScale]}>
      {isComposite && (
        <group>
          {/* Motherboard Base */}
          <ComponentModels3D
            part={{ category: "motherboard", name: selectedPartName || "ATX Reference Board", targetPosition: [0, 0, 0] }}
            rgbColor="#00A896"
            enableHighlight={false}
          />

          {/* Embedded / Floating CPU on socket */}
          <group position={[-0.14 - 1.2 * ex, 1.4 + 0.25 * ex, -0.6]}>
            <mesh>
              <boxGeometry args={[0.06, 0.95, 0.95]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} />
            </mesh>
            {/* Cooler Assembly hovering above CPU when exploded */}
            {ex > 0.1 && (
              <group position={[-1.6 * ex, 0.3 * ex, 0]}>
                <mesh>
                  <boxGeometry args={[0.3, 1.1, 1.1]} />
                  <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[-0.18, 0, 0]}>
                  <cylinderGeometry args={[0.45, 0.45, 0.06, 16]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
              </group>
            )}
          </group>

          {/* Embedded / Floating RAM sticks in DIMM slots A2 / B2 */}
          <group position={[-0.12, 1.4 + 0.35 * ex, 0.8 + 1.2 * ex]}>
            <ComponentModels3D
              part={{ category: "ram", name: "DDR5 Dual-Channel Kit", targetPosition: [0, 0, 0] }}
              rgbColor="#00A896"
              enableHighlight={false}
            />
          </group>

          {/* Embedded / Floating NVMe SSD */}
          <group position={[-0.12 - 0.7 * ex, 0.35 + 0.45 * ex, -0.6]}>
            <ComponentModels3D
              part={{ category: "storage", name: "PCIe 4.0 M.2 NVMe", targetPosition: [0, 0, 0] }}
              rgbColor="#00A896"
              enableHighlight={false}
            />
          </group>

          {/* Embedded / Floating GPU positioned outward along PCIe x16 slot */}
          <group position={[-0.85 - 2.1 * ex, -0.7 - 0.5 * ex, -0.3]} scale={[0.72, 0.72, 0.72]}>
            <NepotatoGPU rgbColor="#00A896" />
          </group>

          {/* Exploded Modular PSU in lower quadrant */}
          {ex > 0.08 && (
            <group position={[1.4 * ex, -2.4 * ex, 1.1 * ex]} scale={[0.85, 0.85, 0.85]}>
              <PSUModel rgbColor="#00A896" isMounted={false} isStandalone={true} enableHighlight={false} />
            </group>
          )}

          {/* Exploded Chassis frame behind board */}
          {ex > 0.08 && (
            <group position={[0, 0, -2.4 * ex]} scale={[0.88, 0.88, 0.88]}>
              <GenericPCCase
                rgbColor="#00A896"
                caseColor="black"
                glassMode="open"
                explodedProgress={0.4}
                enableHighlight={false}
              />
            </group>
          )}

          {/* Exploded Connection Beams */}
          {ex > 0.25 && (
            <group>
              {/* CPU to socket line */}
              <Line
                points={[[-0.14 - 1.2 * ex, 1.4 + 0.25 * ex, -0.6], [-0.14, 1.4, -0.6]]}
                color="#00e5a0"
                lineWidth={1.5}
                dashed
                dashScale={10}
              />
              {/* RAM to DIMM slots line */}
              <Line
                points={[[-0.12, 1.4 + 0.35 * ex, 0.8 + 1.2 * ex], [-0.12, 1.4, 0.8]]}
                color="#00e5a0"
                lineWidth={1.5}
                dashed
                dashScale={10}
              />
              {/* GPU to PCIe x16 slot line */}
              <Line
                points={[[-0.85 - 2.1 * ex, -0.7 - 0.5 * ex, -0.3], [-0.85, -0.7, -0.3]]}
                color="#00e5a0"
                lineWidth={1.5}
                dashed
                dashScale={10}
              />
              {/* SSD to M.2 slot line */}
              <Line
                points={[[-0.12 - 0.7 * ex, 0.35 + 0.45 * ex, -0.6], [-0.12, 0.35, -0.6]]}
                color="#00e5a0"
                lineWidth={1.5}
                dashed
                dashScale={10}
              />
            </group>
          )}
        </group>
      )}

      {specimenKey === "motherboard" && (
        <ComponentModels3D
          part={{ category: "motherboard", name: selectedPartName || "Motherboard", targetPosition: [0, 0, 0] }}
          rgbColor="#00A896"
          enableHighlight={false}
        />
      )}

      {specimenKey === "cpu" && (
        <ComponentModels3D
          part={{ category: "cpu", name: selectedPartName || "Processor (CPU)", targetPosition: [0, 0, 0] }}
          rgbColor="#00A896"
          enableHighlight={false}
        />
      )}

      {specimenKey === "ram" && (
        <group rotation={[Math.PI * 0.42, 0.1, 0]}>
          <SingleDDR4RAM scale={1.15} rgbColor="#00A896" enableHighlight={false} />
        </group>
      )}

      {specimenKey === "storage" && (
        <group rotation={[0.25, Math.PI / 2, 0]}>
          <SingleNVMeSSD scale={1.3} rgbColor="#00A896" enableHighlight={false} />
        </group>
      )}

      {specimenKey === "gpu" && (
        <ComponentModels3D
          part={{ category: "gpu", name: selectedPartName || "Graphics Card", targetPosition: [0, 0, 0] }}
          rgbColor="#00A896"
          enableHighlight={false}
        />
      )}

      {specimenKey === "psu" && (
        <PSUModel rgbColor="#00A896" isMounted={false} isStandalone={true} enableHighlight={false} />
      )}

      {specimenKey === "case" && (
        <GenericPCCase
          rgbColor="#00A896"
          caseColor="black"
          glassMode="open"
          explodedProgress={0.18}
          enableHighlight={false}
        />
      )}

      <SignalFlowBeams specimenKey={specimenKey} visible={showSignalFlow} isPaused={isPaused} />

      {/* 3D Interactive Callout Hotspots matching learn-arduino-red.vercel.app */}
      {showHotspots &&
        hotspots.map((hs) => {
          const isActive = selectedHotspotId === hs.id;
          return (
            <Html key={hs.id} position={hs.pos} center zIndexRange={[20, 0]}>
              <button
                type="button"
                className={`workbench-hotspot-pill ${isActive ? "is-active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    soundManager.snap();
                  } catch {}
                  onSelectHotspot(isActive ? null : hs);
                }}
              >
                <span className="hotspot-dot" />
                <span className="hotspot-label">{hs.label}</span>
              </button>
            </Html>
          );
        })}
    </group>
  );
}

export default function LearnHardwareStage({
  lessonKey,
  specimenKey: propSpecimenKey,
  lessonType,
  lessonTitle,
  componentData,
  selectedBuildPart,
  selectedHotspotId,
  onSelectHotspotId,
  onOpenVideo,
  onRunDiagnosticForHotspot,
  isExploded: propExploded,
  onToggleExploded,
  isPaused = false,
}) {
  const [internalExploded, setInternalExploded] = useState(false);
  const isExploded = propExploded !== undefined ? propExploded : internalExploded;
  const toggleExploded = onToggleExploded || (() => setInternalExploded((x) => !x));
  const specimenKey = propSpecimenKey || (lessonType === "component" ? lessonKey : "composite");
  const hotspots = useMemo(() => {
    if (lessonType === "component" && componentData?.hotspots?.length) {
      return componentData.hotspots;
    }
    return ARTICLE_HOTSPOTS;
  }, [lessonType, componentData]);

  const activeHotspot = useMemo(
    () => hotspots.find((h) => h.id === selectedHotspotId) || null,
    [hotspots, selectedHotspotId]
  );

  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomFactor, setZoomFactor] = useState(1);
  const [resetNonce, setResetNonce] = useState(0);
  const [showSignalFlow, setShowSignalFlow] = useState(true);
  const [showSchematic, setShowSchematic] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

  // Reset camera & inspector smoothly when switching lesson
  useEffect(() => {
    setRotationAngle(0);
    setZoomFactor(1);
    setResetNonce((n) => n + 1);
  }, [lessonKey]);

  const handleTurn = (dir) => {
    try { soundManager.click(); } catch {}
    setRotationAngle((prev) => prev + (dir === "left" ? -Math.PI / 6 : Math.PI / 6));
  };

  const handleZoom = (delta) => {
    try { soundManager.click(); } catch {}
    setZoomFactor((prev) =>
      Math.max(0.65, Math.min(1.85, Number((prev + delta).toFixed(2))))
    );
  };

  const handleResetView = () => {
    try { soundManager.snap(); } catch {}
    setRotationAngle(0);
    setZoomFactor(1);
    onSelectHotspotId(null);
    setResetNonce((n) => n + 1);
  };

  return (
    <div className="workbench-stage">
      {/* Subtle Blueprint Grid + PCB Trace Backdrop */}
      <div className="workbench-iso-grid" aria-hidden="true" />

      {/* 3D Interactive Hardware Canvas */}
      <Canvas
        frameloop={isPaused ? "demand" : "always"}
        camera={{ position: [-7.4, 1.8, 5.4], fov: 40, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        className="workbench-canvas"
        onPointerMissed={() => onSelectHotspotId(null)}
      >
        <ambientLight intensity={0.95} />
        <hemisphereLight args={["#ffffff", "#64748b", 1.35]} />
        <directionalLight position={[-10, 9, 10]} intensity={2.1} color="#fffcf5" />
        <directionalLight position={[8, 12, 8]} intensity={1.4} color="#ffffff" />
        <directionalLight position={[8, 8, -8]} intensity={1.1} color="#d6f5f0" />
        <pointLight position={[-3, 4, 4]} intensity={0.85} color="#00A896" />

        <StageSpecimen
          specimenKey={specimenKey}
          selectedPartName={selectedBuildPart?.name}
          showSignalFlow={showSignalFlow}
          hotspots={hotspots}
          selectedHotspotId={selectedHotspotId}
          showHotspots={showHotspots}
          onSelectHotspot={(hs) => onSelectHotspotId(hs ? hs.id : null)}
          isExploded={isExploded}
          isPaused={isPaused}
        />

        <CameraRig
          specimenKey={specimenKey}
          activeHotspot={activeHotspot}
          rotationAngle={rotationAngle}
          zoomFactor={zoomFactor}
          resetNonce={resetNonce}
          isPaused={isPaused}
        />
      </Canvas>

      {/* Top-Left Moveable/Toggleable Schematic Bus Window (like learn-arduino-red) */}
      {showSchematic && (
        <div className="workbench-schematic-card">
          <div className="schematic-card-head">
            <span className="schematic-card-title">{lessonTitle}</span>
            <button
              type="button"
              className="schematic-close-btn"
              onClick={() => setShowSchematic(false)}
              title="Close schematic diagram"
              aria-label="Close schematic"
            >
              ×
            </button>
          </div>
          <div className="schematic-svg-wrap">
            <svg viewBox="0 0 260 112" className="schematic-svg" aria-label="Hardware Bus Schematic">
              {/* Main Data / Power Bus Paths */}
              <rect x="10" y="14" width="64" height="32" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <text x="42" y="29" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">PSU +12V</text>
              <text x="42" y="40" textAnchor="middle" fontSize="7" fill="#00A896">DC RAILS</text>

              <line x1="74" y1="30" x2="98" y2="30" stroke="#00A896" strokeWidth="2" />
              <rect x="98" y="10" width="66" height="40" rx="5" fill="rgba(0,168,150,0.08)" stroke="#00A896" strokeWidth="1.6" />
              <text x="131" y="27" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="currentColor">CPU / VRM</text>
              <text x="131" y="39" textAnchor="middle" fontSize="7" fill="#00A896">CORE BUS</text>

              <line x1="164" y1="30" x2="188" y2="30" stroke="#38bdf8" strokeWidth="2" />
              <rect x="188" y="14" width="62" height="32" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <text x="219" y="29" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">DDR5 RAM</text>
              <text x="219" y="40" textAnchor="middle" fontSize="7" fill="#028090">128-BIT</text>

              {/* Lower PCIe / NVMe Trunk */}
              <line x1="131" y1="50" x2="131" y2="70" stroke="#00A896" strokeWidth="1.8" />
              <line x1="56" y1="70" x2="206" y2="70" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" />
              <line x1="56" y1="70" x2="56" y2="78" stroke="currentColor" strokeWidth="1.4" />
              <line x1="206" y1="70" x2="206" y2="78" stroke="currentColor" strokeWidth="1.4" />

              <rect x="14" y="78" width="94" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <text x="61" y="94" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">PCIe x16 GPU</text>

              <rect x="152" y="78" width="96" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <text x="200" y="94" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">M.2 NVMe x4</text>
            </svg>
          </div>
          <div className="schematic-footnote">
            {showSignalFlow ? "● Live bus flow active" : "○ Signal flow paused"} · Click any pinout hotspot
          </div>
        </div>
      )}

      {/* Floating Part Inspector Card (appears when a hotspot is clicked) */}
      {activeHotspot && (
        <div className="workbench-inspector-card">
          <div className="inspector-card-head">
            <div>
              <span className="inspector-kicker">SUB-ASSEMBLY INSPECTOR</span>
              <h4>{activeHotspot.label}</h4>
            </div>
            <button
              type="button"
              className="schematic-close-btn"
              onClick={() => onSelectHotspotId(null)}
              aria-label="Close part inspector"
            >
              ×
            </button>
          </div>
          <p className="inspector-role-desc">{activeHotspot.role}</p>

          <div className="inspector-spec-pills">
            <div className="inspector-pill">
              <span>BUS / INTERFACE</span>
              <strong>{activeHotspot.bus}</strong>
            </div>
            <div className="inspector-pill">
              <span>ELECTRICAL / SPEC</span>
              <strong>{activeHotspot.voltage}</strong>
            </div>
          </div>

          <div className="inspector-tip-box">
            <strong>LAB RULE:</strong> {activeHotspot.tip}
          </div>

          <div className="inspector-actions">
            <button
              type="button"
              className="inspector-btn-secondary"
              onClick={() => {
                handleZoom(0.25);
              }}
            >
              ⌖ ZOOM IN CLOSER
            </button>
            <button
              type="button"
              className="inspector-btn-primary"
              onClick={() => onRunDiagnosticForHotspot && onRunDiagnosticForHotspot(activeHotspot)}
            >
              ▶ RUN DIAGNOSTIC
            </button>
          </div>
        </div>
      )}

      {/* Bottom-Center 3D Viewport Toolbar */}
      <div className="workbench-toolbar" role="toolbar" aria-label="3D Hardware Viewport Controls">
        <button
          type="button"
          className="wb-tool-btn"
          onClick={() => handleTurn("left")}
          data-tooltip="Turn Left (↺)"
          aria-label="Turn left"
        >
          ↺
        </button>
        <button
          type="button"
          className="wb-tool-btn"
          onClick={() => handleTurn("right")}
          data-tooltip="Turn Right (↻)"
          aria-label="Turn right"
        >
          ↻
        </button>
        <span className="wb-tool-sep" />
        <button
          type="button"
          className="wb-tool-btn"
          onClick={() => handleZoom(-0.2)}
          data-tooltip="Zoom Out (−)"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          className="wb-tool-btn"
          onClick={() => handleZoom(0.2)}
          data-tooltip="Zoom In (+)"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="wb-tool-btn"
          onClick={handleResetView}
          data-tooltip="Reset Camera (⌖)"
          aria-label="Reset view"
        >
          ⌖
        </button>
        <span className="wb-tool-sep" />
        <button
          type="button"
          className={`wb-tool-btn ${isExploded ? "is-active" : ""}`}
          onClick={() => {
            try { soundManager.click(); } catch {}
            toggleExploded();
          }}
          data-tooltip={isExploded ? "Collapse Rig (💥)" : "Explode 3D Subassemblies (💥)"}
          aria-label="Toggle Exploded View"
        >
          💥
        </button>
        <button
          type="button"
          className={`wb-tool-btn ${showSignalFlow ? "is-active" : ""}`}
          onClick={() => {
            try { soundManager.click(); } catch {}
            setShowSignalFlow((s) => !s);
          }}
          data-tooltip="Toggle Bus Power Flow (⚡)"
          aria-label="Toggle signal flow"
        >
          ⚡
        </button>
        <button
          type="button"
          className={`wb-tool-btn ${showSchematic ? "is-active" : ""}`}
          onClick={() => {
            try { soundManager.click(); } catch {}
            setShowSchematic((s) => !s);
          }}
          data-tooltip="Toggle Schematic Diagram (∿)"
          aria-label="Toggle bus schematic diagram"
        >
          ∿
        </button>
        <button
          type="button"
          className={`wb-tool-btn ${showHotspots ? "is-active" : ""}`}
          onClick={() => {
            try { soundManager.click(); } catch {}
            setShowHotspots((s) => !s);
          }}
          data-tooltip="Toggle 3D Hotspot Labels (◉)"
          aria-label="Toggle hotspots"
        >
          ◉
        </button>
        <span className="wb-tool-sep" />
        <button
          type="button"
          className="wb-tool-video-btn"
          onClick={() => {
            try { soundManager.click(); } catch {}
            onOpenVideo && onOpenVideo();
          }}
          data-tooltip="Open Lesson Lecture Video (▶)"
          aria-label="Watch lecture video"
        >
          <span>▶ LECTURE FILM</span>
        </button>
      </div>
    </div>
  );
}
