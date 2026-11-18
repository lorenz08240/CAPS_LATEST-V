import React, { useState, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import ComponentModels3D from "../3D/ComponentModels3D";
import NorthChalkWhiteCase from "../3D/NorthChalkWhiteCase";
import PSUModel from "../3D/PSUModel";
import { SingleNVMeSSD } from "../3D/NVMeSSDModel";
import { SingleDDR4RAM } from "../3D/DDR4RAMModel";
import NepotatoGPU from "../3D/NepotatoGPU";
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

/* ── 3D ASSEMBLED RIG COMPONENT ── */
function VirtualRigStage({ installedKeys, activeKey, postPassed, isPaused = false }) {
  const hasCase = installedKeys.includes("case");
  const hasMobo = installedKeys.includes("motherboard");
  const hasCpu = installedKeys.includes("cpu");
  const hasCooler = installedKeys.includes("cooler");
  const hasRam = installedKeys.includes("ram");
  const hasStorage = installedKeys.includes("storage");
  const hasPsu = installedKeys.includes("psu");
  const hasGpu = installedKeys.includes("gpu");

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
    <group ref={rigGroupRef} position={[0, -0.2, 0]}>
      {/* 1. Case Chassis (High-Fidelity Architectural Chassis from Home) */}
      {hasCase && (
        <group position={[0, -0.2, 0]} scale={[0.42, 0.42, 0.42]}>
          <NorthChalkWhiteCase
            rgbColor={postPassed ? "#ffffff" : "#b08d57"}
            caseColor="black"
            sidePanelMode={hasGpu && postPassed ? "glass" : "open"}
            explodedProgress={0}
            enableHighlight={activeKey === "case"}
          />
        </group>
      )}

      {/* 2. Motherboard */}
      {hasMobo && (
        <group position={[-0.2, 0.35, -0.2]}>
          <ComponentModels3D
            part={{ category: "motherboard", name: "ATX Reference Motherboard", targetPosition: [0, 0, 0] }}
            rgbColor={postPassed ? "#ffffff" : "#b08d57"}
            enableHighlight={activeKey === "motherboard"}
          />

          {/* 3. CPU */}
          {hasCpu && (
            <mesh position={[-0.14, 1.4, -0.6]}>
              <boxGeometry args={[0.06, 0.95, 0.95]} />
              <meshStandardMaterial
                color="#e2e8f0"
                metalness={0.94}
                roughness={0.16}
                emissive={postPassed ? "#ffffff" : "#000000"}
                emissiveIntensity={postPassed ? 0.35 : 0}
              />
            </mesh>
          )}

          {/* 4. CPU Cooler */}
          {hasCooler && (
            <group position={[-0.32, 1.4, -0.6]}>
              <mesh>
                <boxGeometry args={[0.35, 1.15, 1.15]} />
                <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.25} />
              </mesh>
              {/* Fan Blades */}
              <mesh position={[-0.2, 0, 0]}>
                <cylinderGeometry args={[0.48, 0.48, 0.08, 16]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>
          )}

          {/* 5. Dual-Channel RAM */}
          {hasRam && (
            <group position={[-0.12, 1.4, 0.8]}>
              <ComponentModels3D
                part={{ category: "ram", name: "DDR5 Dual-Channel Kit", targetPosition: [0, 0, 0] }}
                rgbColor={postPassed ? "#ffffff" : "#b08d57"}
                enableHighlight={activeKey === "ram"}
              />
            </group>
          )}

          {/* 6. M.2 NVMe SSD */}
          {hasStorage && (
            <group position={[-0.12, 0.35, -0.6]}>
              <ComponentModels3D
                part={{ category: "storage", name: "PCIe 4.0 M.2 NVMe", targetPosition: [0, 0, 0] }}
                rgbColor={postPassed ? "#ffffff" : "#b08d57"}
                enableHighlight={activeKey === "storage"}
              />
            </group>
          )}

          {/* 8. Dedicated GPU */}
          {hasGpu && (
            <group position={[-0.85, -0.7, -0.3]} scale={[0.72, 0.72, 0.72]}>
              <NepotatoGPU rgbColor={postPassed ? "#ffffff" : "#b08d57"} />
            </group>
          )}
        </group>
      )}

      {/* 7. PSU Mounted Properly in Lower Rear Shroud Compartment */}
      {hasPsu && (
        <group position={[0.1, -1.48, -0.85]} scale={[0.48, 0.48, 0.48]} rotation={[0, Math.PI, 0]}>
          <PSUModel rgbColor={postPassed ? "#ffffff" : "#b08d57"} isMounted={true} isStandalone={false} />
        </group>
      )}

      {/* Target indicator placeholder for active uninstalled part */}
      {!installedKeys.includes(activeKey) && (
        <Html position={[0, 0.6, 0]} center>
          <div className="wb-assembly-target-pill">
            <span className="target-pulse-dot" />
            <span>MOUNT TARGET: {ASSEMBLY_STAGES.find((s) => s.key === activeKey)?.shortName}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function VirtualAssemblyLab({
  onAssemblyComplete,
  initialCompleted = false,
  isPaused = false,
}) {
  const [installedKeys, setInstalledKeys] = useState(() => (initialCompleted ? ASSEMBLY_STAGES.map((s) => s.key) : []));
  const [activeStepIdx, setActiveStepIdx] = useState(() => (initialCompleted ? 7 : 0));
  const [bobSpeech, setBobSpeech] = useState(() =>
    initialCompleted
      ? "PC Assembly complete! All 8 parts are built and tested."
      : ASSEMBLY_STAGES[0].bobTip
  );
  const [postRunning, setPostRunning] = useState(false);
  const [postPassed, setPostPassed] = useState(initialCompleted);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const currentStage = ASSEMBLY_STAGES[activeStepIdx] || ASSEMBLY_STAGES[0];
  const allInstalled = installedKeys.length === ASSEMBLY_STAGES.length;

  // Mount a part
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
      setBobSpeech(`✓ ${stageObj?.shortName} installed! Next: ${nextStage.bobTip}`);
    } else {
      // All 8 parts mounted! Trigger POST sequence
      setBobSpeech("All 8 parts in place! Let's power it on and test (POST)...");
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
      setShowCelebration(true);
      setBobSpeech("Awesome, it booted up! All status lights are green. Your build works!");

      if (onAssemblyComplete) {
        onAssemblyComplete();
      }
    }, 2800);
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
    if (stageKey && stageKey === currentStage.key) {
      handleMountPart(stageKey);
    } else {
      try { soundManager.warning(); } catch {}
      setBobSpeech(`Install the ${currentStage.shortName} first to follow proper PC build order!`);
    }
  };

  const handleResetBuild = () => {
    try { soundManager.warning(); } catch {}
    setInstalledKeys([]);
    setActiveStepIdx(0);
    setPostPassed(false);
    setShowCelebration(false);
    setBobSpeech(ASSEMBLY_STAGES[0].bobTip);
  };

  return (
    <div className="wb-assembly-lab-wrap">
      {/* ── TOP LAB CONTROL BAR ── */}
      <div className="wb-assembly-topbar">
        <div className="assembly-top-title">
          <span className="assembly-title-badge">PRACTICAL LAB</span>
          <h3>3D Virtual PC Assembly Workstation</h3>
          <span className="assembly-step-counter">
            {installedKeys.length} of {ASSEMBLY_STAGES.length} Stages Mounted
          </span>
        </div>

        <div className="assembly-top-actions">
          {postPassed && (
            <span className="post-status-pill passed">
              <span className="status-dot green" />
              <span>POST VERIFIED // BOOT OK</span>
            </span>
          )}
          {postRunning && (
            <span className="post-status-pill testing">
              <span className="status-dot pulsing" />
              <span>TESTING EZ DEBUG LEDS...</span>
            </span>
          )}
          <button
            type="button"
            className="assembly-reset-btn"
            onClick={handleResetBuild}
            title="Reset assembly progress"
          >
            ↺ Disassemble Rig
          </button>
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
            camera={{ position: [-10, 4.2, 9.2], fov: 38 }}
          >
            <ambientLight intensity={1.1} />
            <hemisphereLight args={["#ffffff", "#64748b", 1.4]} />
            <directionalLight position={[-8, 12, 10]} intensity={2.2} />
            <directionalLight position={[8, 8, -6]} intensity={1.2} />
            <pointLight position={[0, 2, 2]} intensity={0.9} color="#ffffff" />

            <VirtualRigStage
              installedKeys={installedKeys}
              activeKey={currentStage.key}
              postPassed={postPassed}
              isPaused={isPaused}
            />

            <OrbitControls
              enableDamping
              dampingFactor={0.08}
              minDistance={4}
              maxDistance={18}
              maxPolarAngle={Math.PI / 2 + 0.05}
            />
          </Canvas>

          {/* B.O.B. Interactive Dialogue Bar */}
          <div className="wb-assembly-bob-callout">
            <div className="bob-avatar-circle">
            </div>
            <div className="bob-callout-text">
              <strong>B.O.B. Assembly Guide</strong>
              <p>{bobSpeech}</p>
            </div>
          </div>
        </div>

        {/* Component Staging Tray (Right) */}
        <aside className="wb-assembly-tray">
          <div className="tray-header">
            <h4>Component Staging Tray</h4>
            <p className="tray-sub">Drag component into 3D rig or click Install</p>
          </div>

          <div className="tray-stages-list">
            {ASSEMBLY_STAGES.map((stg, idx) => {
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

          {/* All Installed POST Action */}
          {allInstalled && !postPassed && (
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
        </aside>
      </div>

      {/* ── CELEBRATION MODAL ── */}
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

            <button
              type="button"
              className="btn-celebration-confirm"
              onClick={() => setShowCelebration(false)}
            >
              Continue to First Boot Diagnostics →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
