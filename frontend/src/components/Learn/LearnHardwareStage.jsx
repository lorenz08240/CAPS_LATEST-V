import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line, Environment, Grid, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import ComponentModels3D from "../3D/ComponentModels3D";
import GenericPCCase from "../3D/GenericPCCase";
import ROGStrixMotherboard from "../3D/ROGStrixMotherboard";
import PSUModel from "../3D/PSUModel";
import { SingleNVMeSSD } from "../3D/NVMeSSDModel";
import { SingleDDR4RAM } from "../3D/DDR4RAMModel";
import NepotatoGPU from "../3D/NepotatoGPU";
import soundManager from "../../utilities/soundManager";
import { ARTICLE_HOTSPOTS } from "./articleHotspots";

const DEFAULT_CAMERAS = {
  composite: { pos: [-8.6, 2.9, 6.8], target: [-0.25, 0.05, 0.0], scale: 0.96 },
  "assembly-lab": { pos: [-9.4, 3.2, 7.8], target: [0, 0, 0], scale: 0.94 },
  motherboard: { pos: [-7.4, 1.6, 5.2], target: [0, 0.15, 0], scale: 1.02 },
  cpu: { pos: [-5.2, 2.6, 4.8], target: [0, 0.25, 0], scale: 1.0 },
  ram: { pos: [-5.4, 2.4, 4.4], target: [0, 0.25, 0], scale: 1.0 },
  storage: { pos: [-4.8, 2.4, 4.2], target: [0, 0.15, 0], scale: 1.0 },
  gpu: { pos: [-6.0, 1.6, 5.2], target: [0, 0, 0], scale: 1.15 },
  psu: { pos: [4.8, 2.6, 4.8], target: [0, 0.05, 0], scale: 1.15 },
  case: { pos: [-11.5, 3.4, 9.8], target: [0, 0.1, 0], scale: 0.72 },
};

/*
 * CameraRig supports both free OrbitControls dragging/zooming AND
 * smooth animated transitions when picking hotspots, resetting view,
 * or pressing toolbar turn/zoom controls relative to current camera.
 */
function CameraRig({
  specimenKey,
  cameraPreset,
  activeHotspot,
  cameraCommand,
  resetNonce,
  isPaused = false,
}) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const preset = cameraPreset || DEFAULT_CAMERAS[specimenKey] || DEFAULT_CAMERAS.motherboard;

  const isTransitioning = useRef(true);
  const goalPos = useRef(new THREE.Vector3(...preset.pos));
  const goalTarget = useRef(new THREE.Vector3(...preset.target));

  // Snap to topic preset or selected hotspot
  useEffect(() => {
    const base = activeHotspot
      ? new THREE.Vector3(...activeHotspot.camPos)
      : new THREE.Vector3(...preset.pos);
    const tgt = activeHotspot
      ? new THREE.Vector3(...activeHotspot.target)
      : new THREE.Vector3(...preset.target);

    goalPos.current.copy(base);
    goalTarget.current.copy(tgt);
    isTransitioning.current = true;
  }, [specimenKey, preset, activeHotspot, resetNonce]);

  // Apply relative turn / zoom toolbar actions around the live OrbitControls target
  useEffect(() => {
    if (!cameraCommand || cameraCommand.nonce === 0) return;
    const controls = controlsRef.current;
    const currentTgt = controls ? controls.target.clone() : goalTarget.current.clone();
    const offset = camera.position.clone().sub(currentTgt);

    if (cameraCommand.type === "turn") {
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraCommand.delta);
    } else if (cameraCommand.type === "zoom") {
      const dist = offset.length();
      const nextDist = THREE.MathUtils.clamp(dist * cameraCommand.scale, 2.0, 21.0);
      offset.normalize().multiplyScalar(nextDist);
    }

    goalTarget.current.copy(currentTgt);
    goalPos.current.copy(currentTgt).add(offset);
    isTransitioning.current = true;
  }, [cameraCommand, camera]);

  useFrame((_, delta) => {
    if (isPaused) return;
    const controls = controlsRef.current;
    if (!controls) return;
    if (isTransitioning.current) {
      const alpha = 1 - Math.exp(-delta * 7.2);
      camera.position.lerp(goalPos.current, alpha);
      controls.target.lerp(goalTarget.current, alpha);
      controls.update();
      if (
        camera.position.distanceTo(goalPos.current) < 0.025 &&
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
      dampingFactor={0.075}
      enablePan={true}
      screenSpacePanning={true}
      rotateSpeed={0.8}
      zoomSpeed={0.95}
      minDistance={1.9}
      maxDistance={21}
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI * 0.56}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
}

/* Topic-aware animated bus / airflow signal indicators */
function SignalFlowBeams({ sceneType, visible, isPaused = false }) {
  const dotRefs = [useRef(), useRef(), useRef(), useRef()];

  const { paths, colors } = useMemo(() => {
    if (sceneType === "case-airflow") {
      return {
        paths: [
          [[0, 2.2, 4.3], [0, 2.0, 0.0], [0.2, 1.5, -4.1]],
          [[0, 0.2, 4.3], [0, 0.4, 0.0], [0.2, 1.3, -4.1]],
          [[0, -2.0, 4.3], [0, -0.5, 0.4], [0, 3.8, -1.5]],
        ],
        colors: ["#93c5fd", "#93c5fd", "#f59e0b"],
      };
    }
    if (sceneType === "vrm-power") {
      return {
        paths: [
          [[-0.25, 3.04, -1.85], [-0.25, 2.68, -0.31], [-0.25, 1.45, -0.31]],
          [[-0.25, 2.68, -0.31], [-0.25, 1.45, -0.31]],
          [[-0.25, 1.45, -0.31], [-0.25, -1.85, 1.45]],
        ],
        colors: ["#f59e0b", "#f5e6c7", "#ffffff"],
      };
    }
    if (sceneType === "esd-bench" || sceneType === "bench-test") {
      return {
        paths: [
          [[-0.28, -0.5, -1.3], [1.8, -0.45, 0.2], [3.6, -0.45, 0.5]],
        ],
        colors: ["#10b981"],
      };
    }
    if (
      sceneType === "composite" ||
      sceneType === "motherboard" ||
      sceneType === "form-factors" ||
      sceneType === "io-headers" ||
      sceneType === "ez-debug" ||
      sceneType === "bench-test"
    ) {
      return {
        paths: [
          [[-0.22, 2.25, -0.31], [-0.14, 1.41, -0.31]],
          [[-0.14, 1.41, -0.31], [-0.14, 1.41, 1.49]],
          [[-0.14, 1.35, -0.31], [-0.14, 0.35, -0.31], [-0.18, -0.57, -0.31]],
        ],
        colors: ["#f5e6c7", "#C9C7C0", "#10b981"],
      };
    }
    return { paths: [], colors: [] };
  }, [sceneType]);

  useFrame(({ clock }) => {
    if (isPaused || !visible || !paths.length) return;
    const t = (clock.getElapsedTime() * 0.6) % 1;
    paths.forEach((pts, idx) => {
      const mesh = dotRefs[idx]?.current;
      if (!mesh || pts.length < 2) return;
      const seg = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
      const localT = t * (pts.length - 1) - seg;
      const a = new THREE.Vector3(...pts[seg]);
      const b = new THREE.Vector3(...pts[seg + 1]);
      mesh.position.lerpVectors(a, b, localT);
    });
  });

  if (!visible || !paths.length) return null;

  return (
    <group>
      {paths.map((pts, idx) => (
        <React.Fragment key={idx}>
          <Line
            points={pts}
            color={colors[idx % colors.length]}
            lineWidth={2}
            dashed
            dashSize={0.18}
            gapSize={0.12}
          />
          <mesh ref={dotRefs[idx]}>
            <sphereGeometry args={[0.065, 14, 14]} />
            <meshBasicMaterial color={colors[idx % colors.length]} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

/* Wide Kraft Cardboard Retail Box Bench Pad for ESD Prep (1.1) and Test Bench (7.1) */
function CardboardBenchBox() {
  return (
    <group position={[0, -1.04, 0]}>
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[5.8, 0.46, 6.8]} />
        <meshStandardMaterial color="#a47c54" roughness={0.92} metalness={0.0} />
      </mesh>
      <mesh position={[0, 0.235, 0]}>
        <boxGeometry args={[5.5, 0.02, 6.5]} />
        <meshStandardMaterial color="#8a6540" roughness={0.95} />
      </mesh>
    </group>
  );
}

/* Open LGA CPU Socket Base + Optional Seated/Hovering CPU */
function LGACPUAssembly({ ex = 0, mode = "socket" }) {
  const showCooler = mode === "cpu-cooling";

  return (
    <group scale={[1.35, 1.35, 1.35]}>
      {/* Dark PCB Socket Base Plate */}
      <mesh receiveShadow position={[0, -0.92, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[2.5, 2.5, 0.14]} />
        <meshStandardMaterial color="#14161b" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Socket Housing */}
      <mesh receiveShadow castShadow position={[0, -0.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.85, 1.85, 0.14]} />
        <meshStandardMaterial color="#1e222b" roughness={0.75} />
      </mesh>
      {/* LGA Spring Gold Pin Field */}
      <mesh position={[0, -0.70, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.38, 1.38, 0.03]} />
        <meshStandardMaterial color="#d97706" metalness={0.82} roughness={0.32} />
      </mesh>
      {/* Matching Socket Corner Pin-1 Triangle */}
      <mesh position={[-0.64, -0.68, 0.64]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.14, 0.14, 0.02]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>

      {!showCooler ? (
        <>
          {/* Open Stainless Steel Load Frame Hinged Cleanly From Rear Edge */}
          <group position={[0, -0.72, -0.92]} rotation={[-0.62, 0, 0]}>
            <mesh castShadow position={[0, 0.82, 0]}>
              <boxGeometry args={[1.62, 1.62, 0.04]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.78} roughness={0.28} />
            </mesh>
          </group>
          <mesh castShadow position={[0.92, -0.25, -0.15]} rotation={[-0.52, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 1.8, 12]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Hovering CPU tilted subtly so gold pads + corner triangle are inspectable */}
          <group position={[0, 0.42 + 0.55 * ex, 0]} rotation={[0.25, 0.18, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.45, 0.08, 1.45]} />
              <meshStandardMaterial color="#0f766e" roughness={0.42} />
            </mesh>
            {/* Underside Gold Contact Pads */}
            <mesh position={[0, -0.045, 0]}>
              <boxGeometry args={[1.36, 0.015, 1.36]} />
              <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.28} />
            </mesh>
            {/* Golden Triangle Pin 1 Marker */}
            <mesh position={[-0.62, 0.046, 0.62]}>
              <boxGeometry args={[0.13, 0.015, 0.13]} />
              <meshBasicMaterial color="#facc15" />
            </mesh>
            {/* Nickel-Plated IHS Lid (Satin finish catches studio key light cleanly) */}
            <mesh castShadow position={[0, 0.075, 0]}>
              <boxGeometry args={[1.18, 0.07, 1.18]} />
              <meshStandardMaterial color="#edf2f7" metalness={0.76} roughness={0.26} />
            </mesh>
          </group>
        </>
      ) : (
        <>
          {/* Topic 3.2: Seated CPU with IHS + Pea Thermal Paste + Hovering Copper Cooler */}
          <group position={[0, -0.64, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.45, 0.08, 1.45]} />
              <meshStandardMaterial color="#0f766e" roughness={0.42} />
            </mesh>
            <mesh castShadow position={[0, 0.07, 0]}>
              <boxGeometry args={[1.18, 0.07, 1.18]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.14} />
            </mesh>
            {/* Pea-Sized Thermal Compound Dot */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.17, 0.19, 0.04, 24]} />
              <meshStandardMaterial color="#64748b" roughness={0.75} metalness={0.1} />
            </mesh>
          </group>

          {/* 3D Copper-Plate Tower Cooler Heatsink + PWM Fan Hovering Above */}
          <group position={[0, 0.52 + 0.55 * ex, 0]}>
            {/* Clean Copper Cold Plate (Plastic Peel Removed) */}
            <mesh castShadow position={[0, -0.22, 0]}>
              <boxGeometry args={[1.12, 0.08, 1.12]} />
              <meshStandardMaterial color="#c26a3d" metalness={0.92} roughness={0.22} />
            </mesh>
            {/* 4 Heatpipes */}
            {[-0.36, -0.12, 0.12, 0.36].map((hx, idx) => (
              <mesh key={idx} castShadow position={[hx, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 1.18, 12]} />
                <meshStandardMaterial color="#b45309" metalness={0.92} roughness={0.22} />
              </mesh>
            ))}
            {/* Aluminum Fin Stack */}
            <mesh castShadow position={[0, 0.42, 0]}>
              <boxGeometry args={[1.45, 0.92, 1.05]} />
              <meshStandardMaterial color="#475569" metalness={0.78} roughness={0.32} />
            </mesh>
            {/* Side Mounted 4-Pin PWM Fan */}
            <mesh castShadow position={[0, 0.42, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.46, 0.46, 0.18, 24]} />
              <meshStandardMaterial color="#181b22" roughness={0.55} />
            </mesh>
            {/* 4 Diagonal Mounting Bracket Arms & Screws */}
            {[
              [-0.78, -0.22, -0.78],
              [0.78, -0.22, -0.78],
              [-0.78, -0.22, 0.78],
              [0.78, -0.22, 0.78],
            ].map((pos, idx) => (
              <mesh key={idx} position={pos}>
                <cylinderGeometry args={[0.06, 0.06, 0.16, 12]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.18} />
              </mesh>
            ))}
          </group>
        </>
      )}
    </group>
  );
}

/* Topic 4.1: Dedicated 4-Slot DIMM Bank with A2 & B2 Populated (Plus Explode Reveal of Key Notch) */
function RAMDualChannelBench({ ex = 0 }) {
  const slots = [-0.84, -0.28, 0.28, 0.84]; // A1, A2, B1, B2
  return (
    <group position={[0, -0.35, 0]}>
      {/* Motherboard Section Base */}
      <mesh receiveShadow position={[0, -0.22, 0]}>
        <boxGeometry args={[2.6, 0.12, 4.1]} />
        <meshStandardMaterial color="#111318" roughness={0.82} metalness={0.1} />
      </mesh>

      {slots.map((sx, idx) => {
        const isPopulated = idx === 1 || idx === 3; // A2 and B2
        return (
          <group key={idx} position={[sx, -0.05, 0]}>
            {/* Slot Track (A1/B1 Black, A2/B2 Gray) */}
            <mesh receiveShadow castShadow>
              <boxGeometry args={[0.18, 0.24, 3.5]} />
              <meshStandardMaterial color={idx % 2 === 0 ? "#12141a" : "#3a4150"} roughness={0.68} />
            </mesh>
            {/* Off-Center Physical Key Notch Bridge */}
            <mesh position={[0, 0.04, 0.28]}>
              <boxGeometry args={[0.19, 0.18, 0.1]} />
              <meshStandardMaterial color="#090a0d" />
            </mesh>
            {/* End Q-Latches */}
            {[-1.82, 1.82].map((lz, lIdx) => (
              <mesh
                key={lIdx}
                position={[0, isPopulated && ex < 0.15 ? 0.18 : 0.12, lz]}
                rotation={[isPopulated && ex < 0.15 ? 0 : (lIdx === 0 ? -0.35 : 0.35), 0, 0]}
              >
                <boxGeometry args={[0.2, 0.22, 0.14]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.45} roughness={0.35} />
              </mesh>
            ))}

            {/* Mounted DDR4 Sticks Seated Vertically Upright in A2 & B2 */}
            {isPopulated && (
              <group position={[0, 0.24 + 0.85 * ex, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
                <SingleDDR4RAM scale={0.46} rgbColor="#f5e6c7" enableHighlight={false} />
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* Topic 4.2: M.2 NVMe SSD 25-Degree Insertion on Brass Standoff + Removable Thermal Armor */
function NVMeBenchStage({ ex = 0 }) {
  const entryAngle = 0.42 * (1 - ex); // 24 deg upward tilt from left socket when inserting; levels flat when exploded/pressed
  return (
    <group position={[0, -0.35, 0]}>
      {/* Motherboard Section Base */}
      <mesh receiveShadow position={[0, -0.28, 0]}>
        <boxGeometry args={[4.4, 0.12, 1.85]} />
        <meshStandardMaterial color="#111318" roughness={0.82} metalness={0.1} />
      </mesh>
      {/* M-Key Socket Housing (Left) */}
      <mesh castShadow receiveShadow position={[-1.45, -0.1, 0]}>
        <boxGeometry args={[0.28, 0.24, 0.92]} />
        <meshStandardMaterial color="#1c2029" roughness={0.65} />
      </mesh>
      {/* Brass Standoff Spacer (Right) */}
      <mesh castShadow position={[1.38, -0.11, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.22, 6]} />
        <meshStandardMaterial color="#d97706" metalness={0.92} roughness={0.25} />
      </mesh>
      {/* SingleNVMeSSD pivoting cleanly from left M-Key Socket */}
      <group position={[-1.35, -0.02, 0]} rotation={[0, 0, entryAngle]}>
        <group position={[1.38, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <SingleNVMeSSD scale={1.38} rgbColor="#f5e6c7" enableHighlight={false} />
        </group>
      </group>
      {/* Hovering Brushed Gunmetal Thermal Armor Heatsink Plate (clear above tilted tail) */}
      <group position={[0, 1.38 + 0.45 * ex, 0]}>
        <mesh castShadow>
          <boxGeometry args={[3.15, 0.1, 0.85]} />
          <meshStandardMaterial color="#272b35" metalness={0.82} roughness={0.32} />
        </mesh>
        {/* Thermal Pad Strip Underneath */}
        <mesh position={[0, -0.06, 0]}>
          <boxGeometry args={[2.75, 0.03, 0.65]} />
          <meshStandardMaterial color="#60a5fa" roughness={0.6} transparent opacity={0.85} />
        </mesh>
      </group>
    </group>
  );
}

/* Topic 1.3: Case Brass Standoffs + Coarse 6-32 / Fine M3 / Micro M2 Fastener Comparison */
function ScrewsAndStandoffsBench({ isExploded = false }) {
  return (
    <group>
      <group position={[0, -0.2, 0]}>
        <GenericPCCase
          rgbColor="#ffffff"
          caseColor="white"
          glassMode="open"
          explodedProgress={isExploded ? 0.3 : 0}
          enableHighlight={false}
        />
      </group>
      {/* 9 Brass Standoffs Highlighted on the Motherboard Tray */}
      {[
        [1.42, 2.2, -2.5], [1.42, 2.2, -0.6], [1.42, 2.2, 1.3],
        [1.42, 0.0, -2.5], [1.42, 0.0, -0.6], [1.42, 0.0, 1.3],
        [1.42, -2.2, -2.5], [1.42, -2.2, -0.6], [1.42, -2.2, 1.3],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, 0.24, 6]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.22} />
        </mesh>
      ))}
      {/* Floating Fastener Specimen Bar (6-32, M3, M2 + Magnetic Dish) */}
      <group position={[-3.0, 0, 1.5]}>
        {/* Magnetic Tray Dish */}
        <mesh position={[0, -0.95, 0]} castShadow>
          <cylinderGeometry args={[0.72, 0.56, 0.14, 24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* 6-32 Coarse Screw */}
        <group position={[0, 1.15, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.3, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.25} />
          </mesh>
        </group>
        {/* M3 Fine Screw */}
        <group position={[0, 0.45, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.06, 16]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.75} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.24, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.25} />
          </mesh>
        </group>
        {/* M2 Micro Screw */}
        <group position={[0, -0.15, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.16, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.25} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* Topic 7.3: Physical 4-LED EZ Debug Strip Highlight */
function EZDebugIndicatorStrip({ activeHotspotId }) {
  const leds = [
    { id: "dbg-cpu", y: 2.4, color: "#ef4444" },
    { id: "dbg-dram", y: 2.1, color: "#f59e0b" },
    { id: "dbg-vga", y: 1.8, color: "#eab308" },
    { id: "dbg-boot", y: 1.5, color: "#10b981" },
  ];
  return (
    <group position={[-0.22, 0, 2.4]}>
      <mesh>
        <boxGeometry args={[0.06, 1.2, 0.16]} />
        <meshStandardMaterial color="#111318" roughness={0.8} />
      </mesh>
      {leds.map((led) => {
        const bright = activeHotspotId === led.id || (!activeHotspotId && led.id === "dbg-boot");
        return (
          <mesh key={led.id} position={[-0.04, led.y, 0]}>
            <boxGeometry args={[0.04, 0.12, 0.08]} />
            <meshStandardMaterial
              color={led.color}
              emissive={led.color}
              emissiveIntensity={bright ? 3.2 : 0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function StageSpecimen({
  specimenKey,
  sceneType,
  showSignalFlow,
  hotspots,
  selectedHotspotId,
  showHotspots,
  onSelectHotspot,
  isExploded = false,
  isPaused = false,
  cameraScale,
}) {
  const effectiveScene = sceneType || specimenKey || "composite";
  const stageScale =
    cameraScale || (DEFAULT_CAMERAS[specimenKey] || DEFAULT_CAMERAS.motherboard).scale;

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

  const isFlatBench = effectiveScene === "esd-bench" || effectiveScene === "bench-test";

  const isBoardBased =
    effectiveScene === "composite" ||
    effectiveScene === "assembly-lab" ||
    effectiveScene === "handling-zones" ||
    effectiveScene === "ez-debug";

  const isMotherboardFamily =
    effectiveScene === "motherboard" ||
    effectiveScene === "form-factors" ||
    effectiveScene === "vrm-power" ||
    effectiveScene === "io-headers";

  return (
    <group scale={[stageScale, stageScale, stageScale]}>
      {/* Topic 1.1 & 7.1: Motherboard Resting Flat Face-Up on Wide Cardboard Bench Box + Grounded PSU */}
      {isFlatBench && (
        <group>
          <CardboardBenchBox />
          <group position={[0, -0.75 + 0.6 * ex, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.82}>
            <ROGStrixMotherboard
              rgbColor="#ffffff"
              enableHighlight={false}
              showCpu={true}
              showRam={effectiveScene === "bench-test"}
            />
          </group>
          <group position={[3.9, -0.55, 0.5]} scale={[0.72, 0.72, 0.72]}>
            <PSUModel rgbColor="#ffffff" isMounted={false} isStandalone={false} enableHighlight={false} />
          </group>
        </group>
      )}

      {/* Full / Topic-Anchored Composite Motherboard Setups */}
      {isBoardBased && (
        <group>
          <group rotation={[0, -Math.PI / 2, 0]} scale={0.88}>
            <ROGStrixMotherboard
              rgbColor="#ffffff"
              enableHighlight={false}
              showCpu={true}
              showRam={ex < 0.12}
            />
          </group>

          {/* Topic 1.2: Safe Grip Edge Bars vs Caution Rings */}
          {effectiveScene === "handling-zones" && (
            <group>
              <mesh position={[-0.14, 0.1, 2.75]}>
                <boxGeometry args={[0.1, 5.2, 0.12]} />
                <meshBasicMaterial color="#10b981" />
              </mesh>
              <mesh position={[-0.14, 0.1, -2.75]}>
                <boxGeometry args={[0.1, 5.2, 0.12]} />
                <meshBasicMaterial color="#10b981" />
              </mesh>
              <mesh position={[-0.22, 1.41, -0.31]} rotation={[0, -Math.PI / 2, 0]}>
                <ringGeometry args={[0.92, 1.05, 32]} />
                <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}

          {/* CPU on socket */}
          <group position={[-0.14 - 1.2 * ex, 1.45 + 0.25 * ex, -0.32]}>
            <mesh>
              <boxGeometry args={[0.06, 0.95, 0.95]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.18} />
            </mesh>
            {ex > 0.1 && (
              <group position={[-1.6 * ex, 0.3 * ex, 0]}>
                <mesh>
                  <boxGeometry args={[0.3, 1.1, 1.1]} />
                  <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[-0.18, 0, 0]}>
                  <cylinderGeometry args={[0.45, 0.45, 0.06, 16]} />
                  <meshStandardMaterial color="#0C0C0F" />
                </mesh>
              </group>
            )}
          </group>

          {/* Exploded RAM sticks out of A2 & B2 */}
          {ex > 0.1 && (
            <group>
              <group
                position={[-0.14 - 1.4 * ex, 1.41 + 0.35 * ex, 1.144]}
                rotation={[0, -Math.PI / 2, Math.PI / 2]}
              >
                <SingleDDR4RAM scale={0.88 * 0.36} rgbColor="#ffffff" enableHighlight={false} />
              </group>
              <group
                position={[-0.14 - 1.4 * ex, 1.41 + 0.35 * ex, 1.848]}
                rotation={[0, -Math.PI / 2, Math.PI / 2]}
              >
                <SingleDDR4RAM scale={0.88 * 0.36} rgbColor="#ffffff" enableHighlight={false} />
              </group>
            </group>
          )}

          {/* NVMe SSD */}
          {effectiveScene !== "esd-bench" && effectiveScene !== "bench-test" && (
            <group position={[-0.12 - 0.7 * ex, -1.45 + 0.45 * ex, -0.32]}>
              <ComponentModels3D
                part={{ category: "storage", name: "PCIe 4.0 M.2 NVMe", targetPosition: [0, 0, 0] }}
                rgbColor="#ffffff"
                enableHighlight={false}
              />
            </group>
          )}

          {/* Dedicated GPU (hidden on raw safety-only ESD board) */}
          {effectiveScene !== "esd-bench" && effectiveScene !== "handling-zones" && (
            <group position={[-0.85 - 2.1 * ex, -0.6 - 0.5 * ex, -0.32]} scale={[0.72, 0.72, 0.72]}>
              <NepotatoGPU rgbColor="#ffffff" />
            </group>
          )}

          {/* Topic 7.3 EZ Debug LED Strip */}
          {effectiveScene === "ez-debug" && (
            <EZDebugIndicatorStrip activeHotspotId={selectedHotspotId} />
          )}

          {/* Exploded PSU + Case Frame */}
          {ex > 0.08 && (
            <>
              <group position={[1.4 * ex, -2.4 * ex, 1.1 * ex]} scale={[0.85, 0.85, 0.85]}>
                <PSUModel rgbColor="#ffffff" isMounted={false} isStandalone={true} enableHighlight={false} />
              </group>
              <group position={[0, 0, -2.4 * ex]} scale={[0.88, 0.88, 0.88]}>
                <GenericPCCase
                  rgbColor="#ffffff"
                  caseColor="white"
                  glassMode="open"
                  explodedProgress={0.4}
                  enableHighlight={false}
                />
              </group>
            </>
          )}
        </group>
      )}

      {/* Motherboard Sub-Topics (2.1 Form Factors, 2.2 VRM & Chipset, 2.3 Rear I/O & Headers) */}
      {isMotherboardFamily && (
        <group>
          <group rotation={[0, -Math.PI / 2, 0]} scale={0.88}>
            <ROGStrixMotherboard
              rgbColor="#ffffff"
              enableHighlight={false}
              showCpu={true}
              showRam={true}
              explodedProgress={effectiveScene === "vrm-power" ? 0.28 + ex * 0.6 : ex * 0.6}
            />
          </group>

          {/* Topic 2.1: Form Factor Architectural Comparison Frames (ATX / mATX / Mini-ITX) */}
          {effectiveScene === "form-factors" && (
            <group position={[-0.24, 0, 0]}>
              {/* Micro-ATX 244x244 outline anchored from top-left */}
              <Line
                points={[
                  [0, 3.34, -2.68],
                  [0, 3.34, 2.68],
                  [0, -2.02, 2.68],
                  [0, -2.02, -2.68],
                  [0, 3.34, -2.68],
                ]}
                color="#f5e6c7"
                lineWidth={1.6}
                dashed
                dashSize={0.22}
                gapSize={0.14}
              />
              {/* Mini-ITX 170x170 outline */}
              <Line
                points={[
                  [0, 3.34, -2.68],
                  [0, 3.34, 1.05],
                  [0, -0.39, 1.05],
                  [0, -0.39, -2.68],
                  [0, 3.34, -2.68],
                ]}
                color="#f59e0b"
                lineWidth={1.8}
                dashed
                dashSize={0.18}
                gapSize={0.12}
              />
            </group>
          )}

          {/* Topic 2.3: USB Speed Color Bands & Header Highlights */}
          {effectiveScene === "io-headers" && (
            <group>
              {/* USB 2.0 Black, USB 3.0 Blue, USB 3.2 Teal Port Strips on Rear I/O */}
              <mesh position={[-0.4, 2.25, -2.68]}>
                <boxGeometry args={[0.12, 0.35, 0.14]} />
                <meshBasicMaterial color="#1e293b" />
              </mesh>
              <mesh position={[-0.4, 1.75, -2.68]}>
                <boxGeometry args={[0.12, 0.45, 0.14]} />
                <meshBasicMaterial color="#2563eb" />
              </mesh>
              <mesh position={[-0.4, 1.15, -2.68]}>
                <boxGeometry args={[0.12, 0.35, 0.14]} />
                <meshBasicMaterial color="#0d9488" />
              </mesh>
              {/* Bottom F_PANEL Highlight Block */}
              <mesh position={[-0.2, -3.15, 2.0]}>
                <boxGeometry args={[0.16, 0.22, 0.55]} />
                <meshBasicMaterial color="#f5e6c7" wireframe />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* CPU Topics (3.1 Open LGA Socket Drop vs 3.2 Thermal Paste + Cooler) */}
      {(effectiveScene === "cpu" || effectiveScene === "cpu-socket" || effectiveScene === "cpu-cooling") && (
        <LGACPUAssembly ex={ex} mode={effectiveScene} />
      )}

      {/* RAM Topic (4.1 4-Slot DIMM Bank with A2 & B2 Seated) */}
      {(effectiveScene === "ram" || effectiveScene === "ram-slots") && (
        <RAMDualChannelBench ex={ex} />
      )}

      {/* Storage Topic (4.2 25-Degree M.2 NVMe Insertion & Brass Standoff) */}
      {(effectiveScene === "storage" || effectiveScene === "nvme-install") && (
        <NVMeBenchStage ex={ex} />
      )}

      {/* GPU Topic (5.1 Standalone Triple-Fan GPU) */}
      {(effectiveScene === "gpu" || effectiveScene === "gpu-standalone") && (
        <group scale={[0.85, 0.85, 0.85]}>
          <NepotatoGPU rgbColor="#f5e6c7" isStandalone={true} explodedProgress={ex} />
        </group>
      )}

      {/* PSU Topic (5.2 Standalone Modular PSU) */}
      {(effectiveScene === "psu" || effectiveScene === "psu-standalone") && (
        <PSUModel rgbColor="#f5e6c7" isMounted={false} isStandalone={true} enableHighlight={false} />
      )}

      {/* Case Topics (1.3 Standoffs & Screws, 6.1 Airflow Physics, 6.2 Cable Routing) */}
      {effectiveScene === "screws-standoffs" && <ScrewsAndStandoffsBench isExploded={isExploded} />}

      {(effectiveScene === "case" ||
        effectiveScene === "case-airflow" ||
        effectiveScene === "case-cabling") && (
        <group position={[0, -0.2, 0]}>
          <GenericPCCase
            rgbColor="#f5e6c7"
            caseColor="white"
            glassMode={isExploded || effectiveScene !== "case" ? "open" : "closed"}
            explodedProgress={isExploded ? 0.35 : 0}
            enableHighlight={false}
          />
          {effectiveScene === "case-cabling" && (
            <group>
              {/* Clean Grommet Route Preview Lines */}
              <Line
                points={[
                  [-0.4, -3.2, -1.6],
                  [1.55, -1.8, 0.9],
                  [1.55, 0.5, 1.6],
                  [1.1, 0.9, 1.4],
                ]}
                color="#f5e6c7"
                lineWidth={3}
              />
            </group>
          )}
        </group>
      )}

      <SignalFlowBeams sceneType={effectiveScene} visible={showSignalFlow} isPaused={isPaused} />

      {/* 3D Interactive Callout Hotspots */}
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
  topicConfig,
  lessonType,
  lessonTitle,
  componentData,
  hotspots: propHotspots,
  selectedBuildPart,
  selectedHotspotId,
  onSelectHotspotId,
  onOpenVideo,
  isExploded: propExploded,
  onToggleExploded,
  isPaused = false,
  isMini = false,
}) {
  const [internalExploded, setInternalExploded] = useState(false);
  const isExploded = propExploded !== undefined ? propExploded : internalExploded;
  const toggleExploded = onToggleExploded || (() => setInternalExploded((x) => !x));

  const specimenKey = propSpecimenKey || (lessonType === "component" ? lessonKey : "composite");
  const sceneType = topicConfig?.sceneType || specimenKey;
  const cameraPreset = topicConfig?.camera || DEFAULT_CAMERAS[specimenKey] || DEFAULT_CAMERAS.motherboard;
  const floorY = topicConfig?.floorY ?? -3.75;

  const hotspots = useMemo(() => {
    if (topicConfig?.hotspots?.length) {
      return topicConfig.hotspots;
    }
    if (lessonType === "component" && componentData?.hotspots?.length) {
      return componentData.hotspots;
    }
    return propHotspots?.length ? propHotspots : ARTICLE_HOTSPOTS;
  }, [topicConfig, lessonType, componentData, propHotspots]);

  const activeHotspot = useMemo(
    () => hotspots.find((h) => h.id === selectedHotspotId) || null,
    [hotspots, selectedHotspotId]
  );

  const [cameraCommand, setCameraCommand] = useState({ type: null, delta: 0, scale: 1, nonce: 0 });
  const [resetNonce, setResetNonce] = useState(0);
  const [zoomedFocus, setZoomedFocus] = useState(false);
  const [showSignalFlow, setShowSignalFlow] = useState(true);
  const [showSchematic, setShowSchematic] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

  useEffect(() => {
    setZoomedFocus(false);
    setResetNonce((n) => n + 1);
  }, [lessonKey, sceneType]);

  const handleTurn = (dir) => {
    try { soundManager.click(); } catch {}
    setCameraCommand((prev) => ({
      type: "turn",
      delta: dir === "left" ? -Math.PI / 6 : Math.PI / 6,
      scale: 1,
      nonce: prev.nonce + 1,
    }));
  };

  const handleZoom = (scaleMultiplier) => {
    try { soundManager.click(); } catch {}
    setCameraCommand((prev) => ({
      type: "zoom",
      delta: 0,
      scale: scaleMultiplier,
      nonce: prev.nonce + 1,
    }));
  };

  const handleResetView = () => {
    try { soundManager.snap(); } catch {}
    setZoomedFocus(false);
    onSelectHotspotId(null);
    setResetNonce((n) => n + 1);
  };

  const schematicNodes = topicConfig?.schematicNodes || [
    { title: "PSU +12V", sub: "DC RAILS" },
    { title: "CPU / VRM", sub: "CORE BUS" },
    { title: "DDR4 RAM", sub: "128-BIT" },
    { title: "PCIE / M.2", sub: "EXPANSION" },
  ];

  return (
    <div className={`workbench-stage ${isMini ? "is-mini-stage" : ""}`}>
      {/* 3D Interactive Hardware Canvas */}
      <Canvas
        shadows="soft"
        frameloop={isPaused ? "demand" : "always"}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.02,
        }}
        camera={
          isMini
            ? { position: [-5.6, 1.8, 4.4], fov: 36, near: 0.1, far: 100 }
            : { position: cameraPreset.pos, fov: 40, near: 0.1, far: 100 }
        }
        dpr={[1, 1.5]}
        className="workbench-canvas"
        onPointerMissed={() => onSelectHotspotId(null)}
      >
        <color attach="background" args={["#101116"]} />
        <fog attach="fog" args={["#101116", 14, 34]} />

        {/* Calibrated Studio Lighting Preserving Natural Crevices & Ambient Occlusion */}
        <ambientLight intensity={0.28} />
        <hemisphereLight args={["#edf2f7", "#14151a", 0.52]} />
        <directionalLight
          position={[-7, 10, 8]}
          intensity={1.85}
          color="#fff7ec"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[8, 6, -7]} intensity={0.85} color="#d4e2f4" />
        <pointLight position={[-4, 2.5, 4]} intensity={0.45} color="#ffffff" distance={14} />
        <Environment preset="studio" environmentIntensity={0.5} />

        {/* Subtle Architectural Studio Floor + Grid + Contact AO (Main Canvas) */}
        {!isMini && (
          <>
            <mesh position={[0, floorY - 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[52, 64]} />
              <meshStandardMaterial color="#101116" roughness={0.98} metalness={0.0} />
            </mesh>
            <Grid
              position={[0, floorY, 0]}
              args={[48, 48]}
              cellSize={0.8}
              cellThickness={0.5}
              cellColor="#252832"
              sectionSize={3.2}
              sectionThickness={0.85}
              sectionColor="#383c48"
              fadeDistance={20}
              fadeStrength={2.5}
            />
            <ContactShadows
              position={[0, floorY + 0.01, 0]}
              opacity={0.62}
              scale={16}
              blur={2.4}
              far={8.5}
              resolution={512}
              color="#040508"
            />
          </>
        )}

        <StageSpecimen
          specimenKey={specimenKey}
          sceneType={sceneType}
          selectedPartName={selectedBuildPart?.name}
          showSignalFlow={showSignalFlow && !isMini}
          hotspots={hotspots}
          selectedHotspotId={selectedHotspotId}
          showHotspots={showHotspots && !isMini}
          onSelectHotspot={(hs) => onSelectHotspotId(hs ? hs.id : null)}
          isExploded={isExploded}
          isPaused={isPaused}
          cameraScale={cameraPreset.scale}
        />

        {!isMini && (
          <CameraRig
            specimenKey={specimenKey}
            cameraPreset={cameraPreset}
            activeHotspot={activeHotspot}
            cameraCommand={cameraCommand}
            resetNonce={resetNonce}
            isPaused={isPaused}
          />
        )}

        {isMini && (
          <OrbitControls
            makeDefault
            enableRotate={true}
            enableZoom={true}
            enablePan={false}
            minDistance={2.4}
            maxDistance={12}
            autoRotate={true}
            autoRotateSpeed={1.1}
          />
        )}
      </Canvas>

      {/* Mini Viewport Mouse Interaction Hint */}
      {isMini && (
        <div className="wb-mini-mouse-hint" aria-hidden="true">
          <span>Drag to rotate · Scroll to zoom</span>
        </div>
      )}

      {/* Top-Left Topic-Anchored Schematic Window */}
      {!isMini && showSchematic && (
        <div className="workbench-schematic-card">
          <div className="schematic-card-head">
            <span className="schematic-card-title">{topicConfig?.schematicTitle || lessonTitle}</span>
            <button
              type="button"
              className="schematic-close-btn"
              onClick={() => setShowSchematic(false)}
              title="Close diagram"
              aria-label="Close diagram"
            >
              ×
            </button>
          </div>
          <div className="schematic-svg-wrap">
            <svg viewBox="0 0 260 112" className="schematic-svg" aria-label="Hardware Bus Diagram">
              <rect x="8" y="12" width="112" height="36" rx="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <text x="64" y="27" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
                {schematicNodes[0]?.title}
              </text>
              <text x="64" y="39" textAnchor="middle" fontSize="7" fill="#b08d57">
                {schematicNodes[0]?.sub}
              </text>

              <line x1="120" y1="30" x2="140" y2="30" stroke="currentColor" strokeWidth="1.6" />

              <rect x="140" y="12" width="112" height="36" rx="5" fill="rgba(255, 255, 255, 0.05)" stroke="currentColor" strokeWidth="1.4" />
              <text x="196" y="27" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
                {schematicNodes[1]?.title}
              </text>
              <text x="196" y="39" textAnchor="middle" fontSize="7" fill="#f5e6c7">
                {schematicNodes[1]?.sub}
              </text>

              <line x1="196" y1="48" x2="196" y2="64" stroke="currentColor" strokeWidth="1.4" />
              <line x1="64" y1="64" x2="196" y2="64" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" />
              <line x1="64" y1="64" x2="64" y2="70" stroke="currentColor" strokeWidth="1.4" />
              <line x1="196" y1="64" x2="196" y2="70" stroke="currentColor" strokeWidth="1.4" />

              <rect x="8" y="70" width="112" height="34" rx="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <text x="64" y="85" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
                {schematicNodes[2]?.title}
              </text>
              <text x="64" y="96" textAnchor="middle" fontSize="7" fill="#b08d57">
                {schematicNodes[2]?.sub}
              </text>

              <rect x="140" y="70" width="112" height="34" rx="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <text x="196" y="85" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
                {schematicNodes[3]?.title}
              </text>
              <text x="196" y="96" textAnchor="middle" fontSize="7" fill="#f5e6c7">
                {schematicNodes[3]?.sub}
              </text>
            </svg>
          </div>
          <div className="schematic-footnote">
            {showSignalFlow ? "Signal flow active" : "Signal flow paused"}
          </div>
        </div>
      )}

      {/* Floating Part Inspector Card */}
      {!isMini && activeHotspot && (
        <div className="workbench-inspector-card" role="region" aria-label="Part Details">
          <div className="inspector-card-head">
            <div>
              <span className="inspector-kicker">Part Inspector</span>
              <h4>{activeHotspot.label}</h4>
            </div>
            <button
              type="button"
              className="schematic-close-btn"
              onClick={() => onSelectHotspotId(null)}
              aria-label="Close part details"
            >
              ×
            </button>
          </div>
          <p className="inspector-role-desc">{activeHotspot.role}</p>

          <div className="inspector-spec-pills">
            <div className="inspector-pill">
              <span>Standard</span>
              <strong>{activeHotspot.bus}</strong>
            </div>
            <div className="inspector-pill">
              <span>Spec</span>
              <strong>{activeHotspot.voltage}</strong>
            </div>
          </div>

          <div className="inspector-tip-box">
            <strong>Rule:</strong> {activeHotspot.tip}
          </div>

          <div className="inspector-actions">
            <button
              type="button"
              className="inspector-btn-focus"
              onClick={() => {
                if (zoomedFocus) {
                  setZoomedFocus(false);
                  handleZoom(1.35);
                } else {
                  setZoomedFocus(true);
                  handleZoom(0.72);
                }
              }}
            >
              {zoomedFocus ? "Zoom Out" : "Zoom In Closer"}
            </button>
          </div>
        </div>
      )}

      {/* Bottom-Center 3D Viewport Toolbar */}
      {!isMini && (
        <div className="workbench-toolbar" role="toolbar" aria-label="3D Viewport Controls">
          <button
            type="button"
            className="wb-tool-btn"
            onClick={() => handleTurn("left")}
            title="Rotate Left"
            aria-label="Rotate left"
          >
            ↺
          </button>
          <button
            type="button"
            className="wb-tool-btn"
            onClick={() => handleTurn("right")}
            title="Rotate Right"
            aria-label="Rotate right"
          >
            ↻
          </button>
          <span className="wb-tool-sep" />
          <button
            type="button"
            className="wb-tool-btn"
            onClick={() => handleZoom(1.22)}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            className="wb-tool-btn"
            onClick={() => handleZoom(0.82)}
            title="Zoom In"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className="wb-tool-btn"
            onClick={handleResetView}
            title="Reset Camera View"
            aria-label="Reset camera view"
          >
            Reset
          </button>
          <span className="wb-tool-sep" />
          <button
            type="button"
            className={`wb-tool-btn ${isExploded ? "is-active" : ""}`}
            onClick={() => {
              try { soundManager.click(); } catch {}
              toggleExploded();
            }}
            aria-label="Toggle exploded view"
          >
            {isExploded ? "Collapse" : "Explode"}
          </button>
          <button
            type="button"
            className={`wb-tool-btn ${showSignalFlow ? "is-active" : ""}`}
            onClick={() => {
              try { soundManager.click(); } catch {}
              setShowSignalFlow((s) => !s);
            }}
            aria-label="Toggle signal flow"
          >
            Flow
          </button>
          <button
            type="button"
            className={`wb-tool-btn ${showSchematic ? "is-active" : ""}`}
            onClick={() => {
              try { soundManager.click(); } catch {}
              setShowSchematic((s) => !s);
            }}
            aria-label="Toggle diagram"
          >
            Diagram
          </button>
          <button
            type="button"
            className={`wb-tool-btn ${showHotspots ? "is-active" : ""}`}
            onClick={() => {
              try { soundManager.click(); } catch {}
              setShowHotspots((s) => !s);
            }}
            aria-label="Toggle 3D labels"
          >
            Labels
          </button>
          {onOpenVideo && (
            <>
              <span className="wb-tool-sep" />
              <button
                type="button"
                className="wb-tool-video-btn"
                onClick={() => {
                  try { soundManager.click(); } catch {}
                  onOpenVideo();
                }}
                aria-label="Watch lesson video"
              >
                Watch Video
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
