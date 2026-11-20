import React, { useState, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, Grid, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import ComponentModels3D from "../3D/ComponentModels3D";
import GenericPCCase from "../3D/GenericPCCase";
import ROGStrixMotherboard from "../3D/ROGStrixMotherboard";
import NepotatoGPU from "../3D/NepotatoGPU";
import { SingleDDR4RAM } from "../3D/DDR4RAMModel";
import { SingleNVMeSSD } from "../3D/NVMeSSDModel";
import PSUModel from "../3D/PSUModel";
import soundManager from "../../utilities/soundManager";
import "./VirtualAssemblyLab.css";

/* ── 8 CANONICAL PC ASSEMBLY STAGES (ZERO COMMERCIAL BRANDS) ── */
export const ASSEMBLY_STAGES = [
  {
    step: 1,
    key: "case",
    title: "Chassis Setup & Standoffs",
    partName: "ATX Mid-Tower Clean Airflow Chassis",
    category: "Chassis",
    shortName: "Case Chassis",
    action: "Stage Chassis on Workspace",
    bobTip:
      "Step 1: Set up your PC case and make sure all 9 brass standoffs are screwed in.",
    mistakeTip: "Never install the motherboard directly onto the metal tray without standoffs; chassis steel touches short out the PCB.",
    spec: "Standard ATX 7-Slot · Steel Frame & Tempered Glass",
  },
  {
    step: 2,
    key: "motherboard",
    title: "Motherboard Mounting",
    partName: "ATX Reference Motherboard",
    category: "Motherboard",
    shortName: "Motherboard",
    action: "Fasten Motherboard to Standoffs",
    bobTip:
      "Step 2: Line up the motherboard with the rear shield, set it on the standoffs, and screw it in gently.",
    mistakeTip: "Do not overtighten screws; excessive torque crushes microscopic copper traces layered within the PCB.",
    spec: "ATX 305x244mm · 9 Brass Standoff Anchors · PCIe 4.0",
  },
  {
    step: 3,
    key: "cpu",
    title: "CPU Drop & Socket Latch",
    partName: "Multi-Core Desktop Processor",
    category: "CPU",
    shortName: "Processor (CPU)",
    action: "Align Golden Triangle & Lock Socket Lever",
    bobTip:
      "Step 3: Match the gold triangle on the corner, gently drop the CPU in, and clamp the lever down.",
    mistakeTip: "Never apply downward force manually—if the CPU is not sitting completely flat, socket pins will crush.",
    spec: "Zero Insertion Force (ZIF) · Gold Pad Contacts",
  },
  {
    step: 4,
    key: "cooler",
    title: "Thermal Compound & Cooler",
    partName: "Tower Heatsink & PWM Fan Cooler",
    category: "Cooler",
    shortName: "CPU Cooler",
    action: "Spread Thermal Paste & Mount Heatsink",
    bobTip:
      "Step 4: Put a small dot of thermal paste on the CPU, peel the cooler sticker, and screw the cooler down.",
    mistakeTip: "Leaving the transparent sticker on the cooler cold plate causes immediate 100°C thermal throttling and shutdown.",
    spec: "Direct Contact Copper Heatpipes · 4-Pin PWM Fan",
  },
  {
    step: 5,
    key: "ram",
    title: "Dual-Channel Memory (RAM)",
    partName: "High-Speed Dual-Channel Memory Kit (2x 16GB)",
    category: "Memory",
    shortName: "Dual-Channel RAM",
    action: "Snap Sticks into DIMM Slots A2 & B2",
    bobTip:
      "Step 5: Put RAM into slots 2 and 4. Line up the notch and press down until both ends click!",
    mistakeTip: "Populating slots 1 & 2 forces single-channel mode, halving bandwidth between the CPU and memory controller.",
    spec: "32GB (2x16GB) · 128-Bit Dual-Channel · Keyed Notch",
  },
  {
    step: 6,
    key: "storage",
    title: "Solid-State Storage (M.2 NVMe)",
    partName: "PCIe 4.0 x4 M.2 NVMe Solid-State Drive (1TB)",
    category: "Storage",
    shortName: "M.2 NVMe SSD",
    action: "Insert at 25° Angle & Secure Screw",
    bobTip:
      "Step 6: Slide the M.2 SSD in at an angle, push it down onto the standoff, and tighten the small screw.",
    mistakeTip: "Screwing the SSD directly to the board without a standoff underneath bows and cracks the silicon NAND flash.",
    spec: "M.2 2280 · NVMe PCIe 4.0 x4 · 7,000 MB/s",
  },
  {
    step: 7,
    key: "psu",
    title: "Power Supply Unit (PSU) & Cabling",
    partName: "80 PLUS Gold 750W Modular Power Supply",
    category: "Power Supply",
    shortName: "Modular PSU",
    action: "Slide into Shroud & Connect 24-Pin + 8-Pin",
    bobTip:
      "Step 7: Slide the power supply into the bottom, then plug in the 24-pin and 8-pin CPU power cables.",
    mistakeTip: "Never mix modular cables from another PSU model; component pinouts differ and will fry attached drives.",
    spec: "80 PLUS Gold · Fully Modular · Regulated 12V Rail",
  },
  {
    step: 8,
    key: "gpu",
    title: "Dedicated Graphics Card (GPU)",
    partName: "Dedicated PCIe 4.0 x16 Graphics Card",
    category: "Graphics Card",
    shortName: "PCIe GPU",
    action: "Seat in PCIe x16 Slot & Connect PCIe Power",
    bobTip:
      "Step 8: Push your graphics card into the top slot until it clicks, then plug in its power cable.",
    mistakeTip: "Always install the GPU last so its bulk does not block access to lower motherboard headers and power connectors.",
    spec: "PCIe 4.0 x16 · Metal Bracket Mount · 8-Pin Power",
  },
];

/* ── 8 CANONICAL PC DISASSEMBLY STAGES (STRICT REVERSE ORDER / VICE-VERSA) ── */
export const DISASSEMBLY_STAGES = [
  {
    step: 1,
    key: "gpu",
    title: "Dedicated Graphics Card (GPU)",
    partName: "Dedicated PCIe 4.0 x16 Graphics Card",
    category: "Graphics Card",
    shortName: "PCIe GPU",
    action: "Unplug PCIe Power & Release Slot Latch",
    bobTip:
      "Teardown Step 1: Start with the GPU! Unplug the 8-pin PCIe power cables, unscrew the rear chassis bracket, and push down the PCIe slot latch to lift the graphics card safely.",
    mistakeTip:
      "Never yank the GPU without releasing the slot latch; doing so tears the PCIe slot directly off the motherboard.",
    spec: "Disconnect 8-Pin Power · Unlatch PCIe Retention Lock · Store in Static Bag",
  },
  {
    step: 2,
    key: "psu",
    title: "Power Supply Unit (PSU) & Cabling",
    partName: "80 PLUS Gold 750W Modular Power Supply",
    category: "Power Supply",
    shortName: "Modular PSU",
    action: "Disconnect 24-Pin ATX & 8-Pin EPS Cables",
    bobTip:
      "Teardown Step 2: Disconnect the PSU! Squeeze the plastic clips on the 24-pin ATX and 8-pin CPU power connectors, pull them straight out, then unmount the PSU from the chassis shroud.",
    mistakeTip:
      "Always disconnect all power cables before handling internal silicon to prevent residual voltage damage.",
    spec: "Unplug 24-Pin & 8-Pin Rails · Unscrew 4 Shroud Fasteners · Slide Out PSU",
  },
  {
    step: 3,
    key: "storage",
    title: "Solid-State Storage (M.2 NVMe)",
    partName: "PCIe 4.0 x4 M.2 NVMe Solid-State Drive (1TB)",
    category: "Storage",
    shortName: "M.2 NVMe SSD",
    action: "Unscrew Standoff Screw & Pull Drive",
    bobTip:
      "Teardown Step 3: Remove the M.2 SSD! Use a precision screwdriver to remove the small standoff screw, let the drive lift at 25°, then gently pull it from the slot.",
    mistakeTip:
      "Never pull horizontally while the SSD is screwed down; always unscrew first to allow the hinge angle.",
    spec: "Loosen M.2 Standoff Screw · 25° Removal Angle · Static Shield Pouch",
  },
  {
    step: 4,
    key: "ram",
    title: "Dual-Channel Memory (RAM)",
    partName: "High-Speed Dual-Channel Memory Kit (2x 16GB)",
    category: "Memory",
    shortName: "Dual-Channel RAM",
    action: "Press DIMM Ejector Clips & Lift Sticks",
    bobTip:
      "Teardown Step 4: Unseat the RAM! Press down firmly on both side retention clips of DIMM slots 2 and 4. The sticks will pop upward so you can grab them by their edges.",
    mistakeTip:
      "Never touch the gold contact fingers on the bottom of the RAM module; skin oils cause corrosion.",
    spec: "Release Slots A2 & B2 Clips · Edge-Only Handling · Clean Storage",
  },
  {
    step: 5,
    key: "cooler",
    title: "Thermal Compound & Cooler",
    partName: "Tower Heatsink & PWM Fan Cooler",
    category: "Cooler",
    shortName: "CPU Cooler",
    action: "Unplug 4-Pin Fan Header & Loosen Cross Screws",
    bobTip:
      "Teardown Step 5: Detach the CPU Cooler! Unplug the 4-pin fan header, loosen the 4 mounting screws in a diagonal pattern, and twist gently to break thermal paste suction before lifting.",
    mistakeTip:
      "Never pull straight up violently without twisting; cold thermal paste can pull an AMD CPU right out of its locked socket!",
    spec: "Unplug 4-Pin PWM · Diagonal Screw Release · Gentle Twist & Lift",
  },
  {
    step: 6,
    key: "cpu",
    title: "CPU Drop & Socket Latch",
    partName: "Multi-Core Desktop Processor",
    category: "CPU",
    shortName: "Processor (CPU)",
    action: "Clean Paste, Lift Lever & Tray CPU",
    bobTip:
      "Teardown Step 6: Remove the CPU! Unhook and lift the socket retention lever. Carefully pick up the CPU by its substrate edges without touching pins, and place it in a protective tray.",
    mistakeTip:
      "Avoid touching the underside gold pads or dropping the chip; socket pins on LGA motherboards bend easily.",
    spec: "99% Isopropyl Clean · Zero-Force ZIF Release · Clamshell Storage",
  },
  {
    step: 7,
    key: "motherboard",
    title: "Motherboard Mounting",
    partName: "ATX Reference Motherboard",
    category: "Motherboard",
    shortName: "Motherboard",
    action: "Unscrew 9 Brass Standoffs & Lift Board",
    bobTip:
      "Teardown Step 7: Unmount the Motherboard! Remove all 9 standoff screws, disconnect front-panel headers, and lift the board out onto its non-conductive cardboard box.",
    mistakeTip:
      "Store fasteners in a magnetic tray; a loose screw left behind can cause fatal electrical shorts upon rebuild.",
    spec: "Remove 9 Brass Fasteners · Clear I/O Shield · Cardboard Staging",
  },
  {
    step: 8,
    key: "case",
    title: "Chassis Setup & Standoffs",
    partName: "ATX Mid-Tower Clean Airflow Chassis",
    category: "Chassis",
    shortName: "Case Chassis",
    action: "Inspect Standoffs & Pack Case",
    bobTip:
      "Teardown Step 8: Final Step! Inspect the empty chassis, verify all 9 brass standoffs are intact, clean the dust filters, and safely pack the case.",
    mistakeTip:
      "Never store case hardware loosely inside the chassis during transit.",
    spec: "Full Teardown Verified · Standoff Inspection · Pack Chassis Frame",
  },
];

// Predefined snap positions inside the PC Case calibrated to ROGStrixMotherboard & GenericPCCase
const TARGET_POSITIONS = {
  case: [0, -0.5, 0],
  motherboard: [1.42, 0.45, -0.6],
  cpu: [0.9, 1.76, -0.89],
  cooler: [0.6, 2.6, -0.6],
  ram: [0.9, 1.76, 0.80],
  storage: [0.9, -0.90, -0.89],
  psu: [-1.8, -3.5, -2.6],
  gpu: [0.2, -0.15, -0.85],
};

/* ── HIGH-FIDELITY CASE-MOUNTED 240MM AIO LIQUID COOLER (MATCHING IMAGE 6) ── */
function CaseMountedCooler({ postPassed, isSelected }) {
  const fan1Ref = useRef();
  const fan2Ref = useRef();
  const haloRef = useRef();

  useFrame((state, delta) => {
    if (fan1Ref.current) fan1Ref.current.rotation.z -= delta * 14;
    if (fan2Ref.current) fan2Ref.current.rotation.z -= delta * 14;
    if (haloRef.current) {
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      haloRef.current.material.opacity = pulse;
    }
  });

  // Tube Curves connecting Top Radiator to CPU Pump Block
  const tube1Curve = useMemo(() => {
    return new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.35, 3.65, -0.6), // Radiator barb 1
      new THREE.Vector3(0.35, 2.8, -0.3),   // Mid drop
      new THREE.Vector3(0.85, 2.2, -0.7),   // Downward curve
      new THREE.Vector3(1.18, 1.88, -0.78)  // Pump swivel 1
    );
  }, []);

  const tube2Curve = useMemo(() => {
    return new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.35, 3.65, -0.2), // Radiator barb 2
      new THREE.Vector3(0.45, 2.7, 0.1),    // Outer sweep
      new THREE.Vector3(0.95, 2.1, -0.6),   // Lower sweep
      new THREE.Vector3(1.18, 1.64, -0.78)  // Pump swivel 2
    );
  }, []);

  const tubeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#11141a", roughness: 0.85, metalness: 0.2 }),
    []
  );

  const glowColor = postPassed ? "#ffffff" : isSelected ? "#facc15" : "#38bdf8";

  return (
    <group>
      {/* 1. Top 240mm Radiator Mounted to Ceiling Rails */}
      <group position={[0, 3.82, 0]}>
        {/* Radiator Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.9, 0.28, 4.8]} />
          <meshStandardMaterial color="#1a1e27" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Cooling Fin Core */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[1.7, 0.02, 4.5]} />
          <meshStandardMaterial color="#0b0e14" roughness={0.95} wireframe />
        </mesh>
        {/* Fan 1 (Rear-Top) */}
        <group position={[0, -0.26, -1.15]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.82, 0.82, 0.22, 28]} />
            <meshStandardMaterial color="#131720" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.76, 0.035, 12, 32]} />
            <meshBasicMaterial color={glowColor} />
          </mesh>
          <group ref={fan1Ref} rotation={[Math.PI / 2, 0, 0]}>
            {Array.from({ length: 9 }).map((_, i) => (
              <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 9]}>
                <boxGeometry args={[0.12, 0.72, 0.02]} />
                <meshStandardMaterial color="#1f2533" roughness={0.5} />
              </mesh>
            ))}
          </group>
        </group>
        {/* Fan 2 (Front-Top) */}
        <group position={[0, -0.26, 1.15]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.82, 0.82, 0.22, 28]} />
            <meshStandardMaterial color="#131720" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.76, 0.035, 12, 32]} />
            <meshBasicMaterial color={glowColor} />
          </mesh>
          <group ref={fan2Ref} rotation={[Math.PI / 2, 0, 0]}>
            {Array.from({ length: 9 }).map((_, i) => (
              <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 9]}>
                <boxGeometry args={[0.12, 0.72, 0.02]} />
                <meshStandardMaterial color="#1f2533" roughness={0.5} />
              </mesh>
            ))}
          </group>
        </group>
        {/* Radiator Hose Barbs */}
        {[-0.6, -0.2].map((bz, idx) => (
          <mesh key={idx} position={[-0.35, -0.16, bz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.22, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 2. Braided Liquid Sleeved Tubes */}
      <mesh>
        <tubeGeometry args={[tube1Curve, 48, 0.075, 12, false]} />
        <primitive object={tubeMat} attach="material" />
      </mesh>
      <mesh>
        <tubeGeometry args={[tube2Curve, 48, 0.075, 12, false]} />
        <primitive object={tubeMat} attach="material" />
      </mesh>

      {/* 3. CPU Waterblock / Pump Unit */}
      <group position={[1.22, 1.76, -0.89]}>
        {/* Solid Copper Coldplate Base */}
        <mesh position={[0.12, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.35, 1.35, 0.06]} />
          <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.2} />
        </mesh>
        {/* Low-profile Pump Cylinder */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.74, 0.74, 0.22, 36]} />
          <meshStandardMaterial color="#161a22" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Specular Tinted Mirror Face */}
        <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.66, 0.66, 0.02, 36]} />
          <meshStandardMaterial color="#080a0f" roughness={0.05} metalness={0.95} />
        </mesh>
        {/* Pulsing Concentric Aura Halo Ring 1 */}
        <mesh ref={haloRef} position={[-0.13, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.54, 0.032, 16, 36]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.95} />
        </mesh>
        {/* Concentric Aura Halo Ring 2 */}
        <mesh position={[-0.13, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.34, 0.025, 16, 36]} />
          <meshBasicMaterial color={glowColor} />
        </mesh>
        {/* DeepCool Center Badge */}
        <mesh position={[-0.135, 0, 0]}>
          <boxGeometry args={[0.01, 0.18, 0.18]} />
          <meshBasicMaterial color={glowColor} />
        </mesh>
        {/* Swivel Hose Fittings */}
        <group position={[-0.04, 0.12, 0.11]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.16, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
        <group position={[-0.04, -0.12, 0.11]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.16, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ── 3D ASSEMBLED RIG COMPONENT (AUTHENTIC UPGRADED HARDWARE MATCHING IMAGE 6) ── */
function VirtualRigStage({
  installedKeys,
  activeKey,
  postPassed,
  isPaused = false,
  labMode = "assembly",
  currentTeardownKey = null,
  onUnmountPart = null,
}) {
  const hasCase = installedKeys.includes("case");
  const hasMobo = installedKeys.includes("motherboard");
  const hasCpu = installedKeys.includes("cpu");
  const hasCooler = installedKeys.includes("cooler");
  const hasRam = installedKeys.includes("ram");
  const hasStorage = installedKeys.includes("storage");
  const hasPsu = installedKeys.includes("psu");
  const hasGpu = installedKeys.includes("gpu");
  const allInstalled = installedKeys.length === 8;

  // Subtle floating idle motion
  const rigGroupRef = useRef();
  useFrame(({ clock }) => {
    if (isPaused) return;
    if (rigGroupRef.current && postPassed) {
      const t = clock.getElapsedTime();
      rigGroupRef.current.position.y = Math.sin(t * 1.5) * 0.04;
    }
  });

  return (
    <group ref={rigGroupRef} position={[0, 0, 0]}>
      {/* 1. Case Chassis (Arctic White Mid-Tower Case with Tempered Glass) */}
      {hasCase && (
        <GenericPCCase
          rgbColor={postPassed ? "#ffffff" : "#b08d57"}
          caseColor="white"
          glassMode={allInstalled ? "closed" : "open"}
          explodedProgress={0}
          enableHighlight={true}
          isSelected={activeKey === "case"}
        />
      )}

      {/* 2. Motherboard (Photorealistic ASUS ROG Strix B360-F Gaming) */}
      {hasMobo && (
        <group position={TARGET_POSITIONS.motherboard} rotation={[0, -Math.PI / 2, 0]} scale={0.82}>
          <ROGStrixMotherboard
            rgbColor={postPassed ? "#ffffff" : "#00e5ff"}
            enableHighlight={true}
            isSelected={activeKey === "motherboard"}
            showCpu={hasCpu}
          />
        </group>
      )}

      {/* 3. CPU Alignment Guide when active */}
      {hasCpu && activeKey === "cpu" && (
        <group position={[1.30, 1.76, -0.89]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <ringGeometry args={[0.72, 0.82, 32]} />
            <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        </group>
      )}

      {/* 4. DeepCool LE240 AIO 240mm Liquid Cooler with Braided Hoses & Infinity Mirror */}
      {hasCooler && (
        <CaseMountedCooler
          postPassed={postPassed}
          isSelected={activeKey === "cooler"}
        />
      )}

      {/* 5. Dual-Channel High-Speed DDR4 RAM (Mounted in Slots A2 & B2) */}
      {hasRam && (
        <group>
          {/* DIMM Slot A2 */}
          <group position={[1.32, 1.76, 0.47]} rotation={[-Math.PI / 2, Math.PI / 2, 0]}>
            <SingleDDR4RAM
              scale={0.28}
              rgbColor={postPassed ? "#ffffff" : "#f43f5e"}
              isSelected={activeKey === "ram"}
              enableHighlight={true}
            />
          </group>
          {/* DIMM Slot B2 */}
          <group position={[1.32, 1.76, 1.12]} rotation={[-Math.PI / 2, Math.PI / 2, 0]}>
            <SingleDDR4RAM
              scale={0.28}
              rgbColor={postPassed ? "#ffffff" : "#f43f5e"}
              isSelected={activeKey === "ram"}
              enableHighlight={true}
            />
          </group>
        </group>
      )}

      {/* 6. High-Speed M.2 NVMe SSD Seated with Thermal Armor */}
      {hasStorage && (
        <group position={[1.32, -0.90, -0.89]} rotation={[0, Math.PI / 2, 0]} scale={[0.9, 0.9, 0.75]}>
          <SingleNVMeSSD
            rgbColor={postPassed ? "#ffffff" : "#f43f5e"}
            isSelected={activeKey === "storage"}
            enableHighlight={true}
            lazy={false}
          />
        </group>
      )}

      {/* 7. Modular 80 PLUS Gold PSU in Lower Chamber Shroud */}
      {hasPsu && (
        <group position={[0, -3.5, -2.85]}>
          <PSUModel
            rgbColor="#ffffff"
            isSelected={activeKey === "psu"}
            enableHighlight={true}
            isMounted={true}
            isStandalone={false}
          />
        </group>
      )}

      {/* 8. Dedicated PCIe 4.0 x16 Graphics Card in Primary SafeSlot */}
      {hasGpu && (
        <group position={[0.6, -0.15, -0.85]}>
          <NepotatoGPU
            rgbColor={postPassed ? "#ffffff" : "#38bdf8"}
            isSelected={activeKey === "gpu"}
            isStandalone={false}
          />
        </group>
      )}

      {/* Target indicator placeholder for active uninstalled part in Assembly Mode */}
      {labMode === "assembly" && !installedKeys.includes(activeKey) && TARGET_POSITIONS[activeKey] && (
        <group position={TARGET_POSITIONS[activeKey]}>
          <Html center>
            <div className="wb-assembly-target-pill">
              <span className="target-pulse-dot" />
              <span>MOUNT: {ASSEMBLY_STAGES.find((s) => s.key === activeKey)?.shortName}</span>
            </div>
          </Html>
        </group>
      )}

      {/* Target interactive unmount indicator in Disassembly Mode */}
      {labMode === "disassembly" && currentTeardownKey && installedKeys.includes(currentTeardownKey) && TARGET_POSITIONS[currentTeardownKey] && (
        <group position={TARGET_POSITIONS[currentTeardownKey]}>
          <Html center>
            <button
              type="button"
              className="wb-assembly-target-pill is-teardown"
              onClick={() => onUnmountPart && onUnmountPart(currentTeardownKey)}
              title={`Click to safely unmount ${DISASSEMBLY_STAGES.find((s) => s.key === currentTeardownKey)?.shortName}`}
            >
              <span className="target-pulse-dot amber" />
              <span>UNMOUNT: {DISASSEMBLY_STAGES.find((s) => s.key === currentTeardownKey)?.shortName}</span>
            </button>
          </Html>
        </group>
      )}
    </group>
  );
}

export default function VirtualAssemblyLab({
  onAssemblyComplete,
  onDisassemblyComplete,
  onOpenProfile,
  onBobSpeechChange,
  onBackToLesson = null,
  initialCompleted = false,
  isPaused = false,
}) {
  const [labMode, setLabMode] = useState("assembly"); // "assembly" | "disassembly"
  const [installedKeys, setInstalledKeys] = useState(() => (initialCompleted ? ASSEMBLY_STAGES.map((s) => s.key) : []));
  const [activeStepIdx, setActiveStepIdx] = useState(() => (initialCompleted ? 7 : 0));
  const [bobSpeech, setBobSpeech] = useState(() =>
    initialCompleted
      ? "PC Assembly complete! All 8 parts are built and tested. Switch to Disassembly Lab to complete reverse ESD teardown."
      : ASSEMBLY_STAGES[0].bobTip
  );
  const [postRunning, setPostRunning] = useState(false);
  const [postPassed, setPostPassed] = useState(initialCompleted);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDisassemblyCelebration, setShowDisassemblyCelebration] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [assemblyDone, setAssemblyDone] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return (
        initialCompleted ||
        localStorage.getItem("buildlab_3d_assembly_completed") === "true" ||
        (u?.email && localStorage.getItem(`buildlab_3d_assembly_completed.${u.email}`) === "true")
      );
    } catch {
      return initialCompleted;
    }
  });

  const [disassemblyDone, setDisassemblyDone] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return (
        localStorage.getItem("buildlab_3d_disassembly_completed") === "true" ||
        (u?.email && localStorage.getItem(`buildlab_3d_disassembly_completed.${u.email}`) === "true")
      );
    } catch {
      return false;
    }
  });

  // Synchronize B.O.B. speech with CourseShell companion avatar
  const updateBobSpeech = (text) => {
    setBobSpeech(text);
    if (onBobSpeechChange) {
      onBobSpeechChange(text);
    }
  };

  useEffect(() => {
    if (onBobSpeechChange) {
      onBobSpeechChange(bobSpeech);
    }
  }, []);

  const currentStage = ASSEMBLY_STAGES[activeStepIdx] || ASSEMBLY_STAGES[0];
  const allInstalled = installedKeys.length === ASSEMBLY_STAGES.length;

  // Derive active teardown stage and target component in strict reverse order (LIFO)
  const currentTeardownStage = useMemo(() => {
    if (labMode !== "disassembly") return null;
    return DISASSEMBLY_STAGES.find((stg) => installedKeys.includes(stg.key)) || null;
  }, [labMode, installedKeys]);

  const currentTeardownKey = currentTeardownStage ? currentTeardownStage.key : null;

  // Switch to Assembly Mode
  const startAssemblyMode = () => {
    setLabMode("assembly");
    if (installedKeys.length === 8 && postPassed) {
      updateBobSpeech("Assembly Lab: Rig is fully built and POST verified. Click Reset to practice mounting again.");
    } else {
      const targetIdx = installedKeys.length < ASSEMBLY_STAGES.length ? installedKeys.length : 0;
      setActiveStepIdx(targetIdx);
      updateBobSpeech(ASSEMBLY_STAGES[targetIdx].bobTip);
    }
  };

  // Switch to Disassembly Mode
  const startDisassemblyMode = () => {
    setLabMode("disassembly");
    // Ensure all 8 parts are loaded into the rig for the student to unmount step-by-step
    if (installedKeys.length < 8) {
      setInstalledKeys(ASSEMBLY_STAGES.map((s) => s.key));
    }
    updateBobSpeech(DISASSEMBLY_STAGES[0].bobTip);
  };

  // Mount a part (Assembly)
  const handleMountPart = (stageKey) => {
    if (installedKeys.includes(stageKey)) return;

    try { soundManager.install(); } catch {}

    const nextInstalled = [...installedKeys, stageKey];
    setInstalledKeys(nextInstalled);

    const stageObj = ASSEMBLY_STAGES.find((s) => s.key === stageKey);
    const nextIdx = ASSEMBLY_STAGES.findIndex((s) => s.key === stageKey) + 1;

    if (nextIdx < ASSEMBLY_STAGES.length) {
      setActiveStepIdx(nextIdx);
      const nextStage = ASSEMBLY_STAGES[nextIdx];
      updateBobSpeech(`✓ ${stageObj?.shortName} installed! Next: ${nextStage.bobTip}`);
    } else {
      // All 8 parts mounted! Trigger POST sequence
      updateBobSpeech("All 8 parts in place! Let's power it on and test (POST)...");
      triggerPostSequence();
    }
  };

  // POST sequence
  const triggerPostSequence = () => {
    setPostRunning(true);
    try { soundManager.click(); } catch {}

    setTimeout(() => {
      try { soundManager.complete(); } catch {}
      setPostRunning(false);
      setPostPassed(true);
      setAssemblyDone(true);
      setShowCelebration(true);
      updateBobSpeech(
        "Awesome, it booted up! All status lights are green. Your build works! Now switch to Disassembly Lab to complete reverse ESD teardown."
      );

      try {
        localStorage.setItem("buildlab_3d_assembly_completed", "true");
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        if (u?.email) {
          localStorage.setItem(`buildlab_3d_assembly_completed.${u.email}`, "true");
        }
      } catch {}

      if (onAssemblyComplete) {
        onAssemblyComplete();
      }
    }, 2800);
  };

  // Unmount a part (Disassembly in strict reverse LIFO order)
  const handleUnmountPart = (stageKey) => {
    if (!installedKeys.includes(stageKey)) return;

    if (currentTeardownKey && stageKey !== currentTeardownKey) {
      try { soundManager.warning(); } catch {}
      updateBobSpeech(`Wait! Disassemble the ${currentTeardownStage?.shortName} first to follow reverse ESD order!`);
      return;
    }

    try { soundManager.click(); } catch {}

    const nextInstalled = installedKeys.filter((k) => k !== stageKey);
    setInstalledKeys(nextInstalled);

    const unmountedStage = DISASSEMBLY_STAGES.find((s) => s.key === stageKey);
    const nextStageIdx = DISASSEMBLY_STAGES.findIndex((s) => s.key === stageKey) + 1;

    if (nextStageIdx < DISASSEMBLY_STAGES.length) {
      const nextStage = DISASSEMBLY_STAGES[nextStageIdx];
      updateBobSpeech(`✓ ${unmountedStage?.shortName} safely unmounted & stored! Next: ${nextStage.bobTip}`);
    } else {
      // All 8 components unmounted in strict reverse order!
      triggerDisassemblyCompleteSequence();
    }
  };

  // Disassembly completion sequence
  const triggerDisassemblyCompleteSequence = () => {
    try { soundManager.complete(); } catch {}
    setDisassemblyDone(true);
    setShowDisassemblyCelebration(true);
    updateBobSpeech(
      "✓ Disassembly Complete! All 8 components safely unmounted following reverse-order ESD protocols. Both Assembly & Disassembly competencies verified!"
    );

    try {
      localStorage.setItem("buildlab_3d_disassembly_completed", "true");
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u?.email) {
        localStorage.setItem(`buildlab_3d_disassembly_completed.${u.email}`, "true");
      }
    } catch {}

    if (onDisassemblyComplete) {
      onDisassemblyComplete();
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, stageKey) => {
    e.dataTransfer.setData("text/plain", stageKey);
    try { soundManager.click(); } catch {}
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const stageKey = e.dataTransfer.getData("text/plain");

    if (labMode === "disassembly") {
      if (stageKey && stageKey === currentTeardownKey) {
        handleUnmountPart(stageKey);
      } else {
        try { soundManager.warning(); } catch {}
        updateBobSpeech(`Unmount the ${currentTeardownStage?.shortName || "active part"} first!`);
      }
      return;
    }

    if (stageKey && stageKey === currentStage.key) {
      handleMountPart(stageKey);
    } else {
      try { soundManager.warning(); } catch {}
      updateBobSpeech(`Install the ${currentStage.shortName} first to follow proper PC build order!`);
    }
  };

  // Reset current lab mode
  const handleResetLab = () => {
    try { soundManager.click(); } catch {}
    if (labMode === "disassembly") {
      setInstalledKeys(ASSEMBLY_STAGES.map((s) => s.key));
      updateBobSpeech(DISASSEMBLY_STAGES[0].bobTip);
    } else {
      setInstalledKeys([]);
      setActiveStepIdx(0);
      setPostPassed(false);
      updateBobSpeech(ASSEMBLY_STAGES[0].bobTip);
    }
  };

  return (
    <div className="wb-assembly-lab-wrap">
      {/* ── TOP LAB CONTROL BAR ── */}
      <div className="wb-assembly-topbar">
        {onBackToLesson && (
          <button
            type="button"
            className="btn-lab-back-module"
            onClick={onBackToLesson}
            title="Return to Lesson Presentation"
          >
            ← Back to Lesson Module
          </button>
        )}

        <div className="assembly-top-title">
          <span className="assembly-title-badge">PRACTICAL LAB</span>
          <h3>3D Virtual PC {labMode === "disassembly" ? "Disassembly" : "Assembly"} Workstation</h3>
          <span className="assembly-step-counter">
            {labMode === "disassembly"
              ? `${8 - installedKeys.length} of ${DISASSEMBLY_STAGES.length} Components Unmounted`
              : `${installedKeys.length} of ${ASSEMBLY_STAGES.length} Stages Mounted`}
          </span>
        </div>
      </div>

      {/* ── MAIN WORKSPACE: 3D RIG VIEWPORT (LEFT) + STAGING TRAY (RIGHT) ── */}
      <div className="wb-assembly-main-grid">
        {/* 3D Canvas Viewport */}
        <div
          className={`wb-assembly-canvas-box ${isDragOver ? "is-drag-target" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Canvas
            frameloop={isPaused ? "demand" : "always"}
            camera={{ position: [-13, 5.5, 13], fov: 38 }}
          >
            <color attach="background" args={["#0e1420"]} />
            <fog attach="fog" args={["#0e1420", 30, 80]} />

            <ambientLight intensity={0.9} color="#e2e8f0" />
            <directionalLight
              position={[-16, 22, 16]}
              intensity={2.4}
              castShadow
              color="#fff8ed"
            />
            <directionalLight
              position={[16, 16, -14]}
              intensity={1.1}
              color="#93c5fd"
            />
            <directionalLight
              position={[0, -6, 0]}
              intensity={0.6}
              color="#fed7aa"
            />
            <directionalLight
              position={[0, 8, 18]}
              intensity={1.0}
              color="#f8fafc"
            />

            <pointLight position={[0.5, 1.5, 0]} intensity={2.0} color="#ffffff" distance={12} />
            <pointLight position={[-0.5, -1.5, 0]} intensity={1.5} color="#ffffff" distance={10} />
            <pointLight
              position={[0, 0, 3.5]}
              intensity={1.8}
              color={postPassed ? "#ffffff" : "#facc15"}
              distance={8}
            />

            <Environment preset="studio" />

            {/* Laboratory Workbench Surface */}
            <mesh position={[0, -5.5, 0]}>
              <boxGeometry args={[48, 1.2, 38]} />
              <meshStandardMaterial color="#181f2c" roughness={0.65} metalness={0.2} />
            </mesh>
            <mesh position={[0, -4.89, 0]}>
              <boxGeometry args={[48.3, 0.04, 38.3]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
            </mesh>
            <mesh position={[0, -4.88, 0]}>
              <boxGeometry args={[28, 0.04, 22]} />
              <meshStandardMaterial color="#1e283a" roughness={0.88} metalness={0.1} />
            </mesh>

            {/* Laboratory Floor Grid */}
            <Grid
              position={[0, -4.85, 0]}
              args={[48, 38]}
              cellSize={1}
              cellThickness={1.0}
              cellColor="#2e3e58"
              sectionSize={5}
              sectionThickness={1.8}
              sectionColor="#ffffff"
              fadeDistance={36}
              fadeStrength={1.2}
            />

            {/* Soft Contact Shadows on Workbench */}
            <ContactShadows
              position={[0, -4.84, 0]}
              opacity={0.8}
              scale={28}
              blur={2.0}
              far={12}
              color="#060911"
            />

            {/* Holographic Circular Platform Under Chassis */}
            <group position={[0, -4.83, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <mesh>
                <ringGeometry args={[5.2, 5.4, 48]} />
                <meshBasicMaterial
                  color={postPassed ? "#ffffff" : "#facc15"}
                  transparent
                  opacity={0.85}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>

            <VirtualRigStage
              installedKeys={installedKeys}
              activeKey={currentStage.key}
              postPassed={postPassed}
              isPaused={isPaused}
              labMode={labMode}
              currentTeardownKey={currentTeardownKey}
              onUnmountPart={handleUnmountPart}
            />

            <OrbitControls
              enableDamping
              dampingFactor={0.08}
              minDistance={3.5}
              maxDistance={26}
              maxPolarAngle={Math.PI / 2 + 0.05}
            />
          </Canvas>

          {/* ── B.O.B. INTERACTIVE DIALOGUE BUBBLE (ANCHORED BOTTOM-LEFT TOWARDS B.O.B.) ── */}
          <div className="wb-bob-dialogue-bubble" role="dialog" aria-label="B.O.B. Workbench Guidance">
            <div className="wb-bob-bubble-head">
              <div className="wb-mini-bob-avatar" aria-hidden="true">
                <span className="mini-bob-eye left" />
                <span className="mini-bob-eye right" />
              </div>
              <div className="wb-bob-bubble-meta">
                <strong className="wb-bob-guide-title">
                  {labMode === "disassembly" ? "B.O.B. Teardown Companion" : "B.O.B. Assembly Guide"}
                </strong>
                <span className="wb-bob-live-indicator">
                  <span className="bob-live-pulse-dot" />
                  LIVE GUIDANCE
                </span>
              </div>
            </div>
            <div className="wb-bob-bubble-body">
              <p>{bobSpeech}</p>
              {labMode === "assembly" && allInstalled && postPassed && (
                <button
                  type="button"
                  className="btn-bob-bubble-action"
                  onClick={startDisassemblyMode}
                >
                  Proceed to Disassembly Lab →
                </button>
              )}
            </div>
            <div className="wb-bob-tail" aria-hidden="true" />
          </div>
        </div>

        {/* Component Staging Tray (Right) */}
        <aside className="wb-assembly-tray">
          <div className="tray-header">
            <div className="tray-header-row">
              <h4>{labMode === "disassembly" ? "Reverse Teardown Tray" : "Component Staging Tray"}</h4>
              <button
                type="button"
                className="tray-reset-btn"
                onClick={handleResetLab}
                title={labMode === "disassembly" ? "Reset teardown progress" : "Reset assembly progress"}
              >
                ↺ Reset
              </button>
            </div>
            <p className="tray-sub">
              {labMode === "disassembly"
                ? "Follow reverse ESD order (LIFO): Unmount active part"
                : "Drag component into 3D rig or click Install"}
            </p>
          </div>

          <div className="tray-stages-list">
            {labMode === "disassembly"
              ? DISASSEMBLY_STAGES.map((stg) => {
                  const isUnmounted = !installedKeys.includes(stg.key);
                  const isCurrent = currentTeardownKey === stg.key;
                  const isLocked = !isUnmounted && !isCurrent;

                  return (
                    <div
                      key={stg.key}
                      className={`tray-stage-card ${isUnmounted ? "is-unmounted" : ""} ${
                        isCurrent ? "is-current is-teardown-target" : ""
                      } ${isLocked ? "is-future" : ""}`}
                    >
                      <div className="tray-stage-head">
                        <span className="tray-step-pill">0{stg.step}</span>
                        <strong className="tray-stage-title">{stg.title}</strong>
                        {isUnmounted ? (
                          <span className="tray-badge unmounted">✓ Stored</span>
                        ) : isCurrent ? (
                          <span className="tray-badge current" style={{ background: "#d97706", borderColor: "#fbbf24" }}>
                            Current Target
                          </span>
                        ) : (
                          <span className="tray-badge locked">Locked</span>
                        )}
                      </div>

                      <p className="tray-part-name">{stg.partName}</p>
                      <span className="tray-spec-text">{stg.spec}</span>

                      {isCurrent && (
                        <div className="tray-actions-row">
                          <button
                            type="button"
                            className="btn-unmount-part"
                            onClick={() => handleUnmountPart(stg.key)}
                          >
                            ↺ Unmount &amp; Store {stg.shortName}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              : ASSEMBLY_STAGES.map((stg, idx) => {
                  const isInstalled = installedKeys.includes(stg.key);
                  const isCurrent = idx === activeStepIdx && !isInstalled;
                  const isFuture = idx > activeStepIdx && !isInstalled;

                  return (
                    <div
                      key={stg.key}
                      className={`tray-stage-card ${isInstalled ? "is-installed" : ""} ${
                        isCurrent ? "is-current" : ""
                      } ${isFuture ? "is-future" : ""}`}
                      draggable={isCurrent}
                      onDragStart={(e) => handleDragStart(e, stg.key)}
                    >
                      <div className="tray-stage-head">
                        <span className="tray-step-pill">0{stg.step}</span>
                        <strong className="tray-stage-title">{stg.title}</strong>
                        {isInstalled ? (
                          <span className="tray-badge done">✓ Mounted</span>
                        ) : isCurrent ? (
                          <span className="tray-badge current">Current Target</span>
                        ) : (
                          <span className="tray-badge locked">Locked</span>
                        )}
                      </div>

                      <p className="tray-part-name">{stg.partName}</p>
                      <span className="tray-spec-text">{stg.spec}</span>

                      {isCurrent && (
                        <div className="tray-actions-row">
                          <button
                            type="button"
                            className="btn-install-part"
                            onClick={() => handleMountPart(stg.key)}
                          >
                            Install {stg.shortName}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>

          {/* All Installed POST Action (Assembly Mode Only) */}
          {labMode === "assembly" && allInstalled && !postPassed && (
            <div className="tray-post-card">
              <h4>All 8 Components Mounted!</h4>
              <p>Execute Power-On Self-Test (POST) to verify power rails and BIOS boot.</p>
              <button
                type="button"
                className="btn-run-post"
                onClick={triggerPostSequence}
                disabled={postRunning}
              >
                {postRunning ? "Executing POST..." : "Power On & Test POST"}
              </button>
            </div>
          )}

          {/* Post-Assembly Action to Disassembly */}
          {labMode === "assembly" && allInstalled && postPassed && (
            <div className="tray-post-card" style={{ borderColor: "rgba(59, 130, 246, 0.4)" }}>
              <h4>Assembly Verified &amp; Boot OK!</h4>
              <p>Next practical competency: Follow reverse ESD order to safely deconstruct the workstation.</p>
              <button
                type="button"
                className="btn-run-post"
                onClick={startDisassemblyMode}
              >
                Proceed to Disassembly Lab →
              </button>
            </div>
          )}

          {/* Post-Disassembly Action to Rebuild / Certification */}
          {labMode === "disassembly" && installedKeys.length === 0 && (
            <div className="tray-post-card" style={{ borderColor: "rgba(34, 197, 94, 0.4)" }}>
              <h4>Teardown Practical Complete!</h4>
              <p>All hardware safely deconstructed and packed in anti-static bags.</p>
              <div style={{ display: "flex", gap: "8px", flexDirection: "column", marginTop: "10px" }}>
                {onOpenProfile && (
                  <button
                    type="button"
                    className="btn-run-post"
                    onClick={onOpenProfile}
                  >
                    View Student Profile &amp; Certificate →
                  </button>
                )}
                <button
                  type="button"
                  className="btn-run-post"
                  style={{ background: "rgba(255, 255, 255, 0.12)", color: "#ffffff" }}
                  onClick={startAssemblyMode}
                >
                  Practice Rebuild ↺
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── CELEBRATION MODAL (ASSEMBLY) ── */}
      {showCelebration && (
        <div className="wb-celebration-backdrop" role="dialog" aria-modal="true">
          <div className="wb-celebration-card">
            <span className="celebration-badge">PRACTICAL CAPSTONE COMPLETE</span>
            <h2>Virtual PC Assembled &amp; POST Verified!</h2>
            <p>
              Congratulations! You have physically constructed a complete desktop workstation adhering to DepEd / TESDA
              CSS NC II standards with zero commercial brand distractions.
            </p>

            <div className="post-leds-indicator-box">
              <div className="led-pill passed">
                <span className="led-dot green" />
                <span>CPU: OK</span>
              </div>
              <div className="led-pill passed">
                <span className="led-dot green" />
                <span>DRAM: OK</span>
              </div>
              <div className="led-pill passed">
                <span className="led-dot green" />
                <span>VGA: OK</span>
              </div>
              <div className="led-pill passed">
                <span className="led-dot green" />
                <span>BOOT: READY</span>
              </div>
            </div>

            <div className="celebration-actions-row">
              <button
                type="button"
                className="btn-celebration-disassemble"
                onClick={() => {
                  setShowCelebration(false);
                  startDisassemblyMode();
                }}
              >
                Proceed to Reverse Disassembly Practical (Required for Certificate) ↺
              </button>
              <button
                type="button"
                className="btn-celebration-confirm"
                onClick={() => setShowCelebration(false)}
              >
                Inspect Assembled Rig →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CELEBRATION MODAL (DISASSEMBLY) ── */}
      {showDisassemblyCelebration && (
        <div className="wb-celebration-backdrop" role="dialog" aria-modal="true">
          <div className="wb-celebration-card">
            <span className="celebration-badge">PRACTICAL TEARDOWN COMPLETE</span>
            <h2>Virtual PC Disassembly Verified!</h2>
            <p>
              Excellent work! You have safely deconstructed the system following reverse-order ESD protocols, discharging capacitors and securing all components in anti-static storage.
            </p>

            <div className="post-leds-indicator-box">
              <div className="led-pill passed">
                <span className="led-dot green" />
                <span>1. ESD DISCHARGE: OK</span>
              </div>
              <div className="led-pill passed">
                <span className="led-dot green" />
                <span>2. GPU / PSU UNPLUGGED: OK</span>
              </div>
              <div className="led-pill passed">
                <span className="led-dot green" />
                <span>3. SILICON PACKED: OK</span>
              </div>
            </div>

            <div className="celebration-actions-row">
              {onOpenProfile && (
                <button
                  type="button"
                  className="btn-celebration-confirm"
                  onClick={() => {
                    setShowDisassemblyCelebration(false);
                    onOpenProfile();
                  }}
                >
                  View Student Profile &amp; Get Certificate →
                </button>
              )}
              <button
                type="button"
                className="btn-celebration-secondary"
                onClick={() => {
                  setShowDisassemblyCelebration(false);
                  startAssemblyMode();
                }}
              >
                Close &amp; Practice Rebuild
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
