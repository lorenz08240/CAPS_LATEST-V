import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { SingleDDR4RAM } from './DDR4RAMModel';

/**
 * ROGStrixMotherboard - Photorealistic High-Detail 3D ATX Motherboard
 * Modeled after the ASUS ROG Strix B360-F Gaming Motherboard.
 *
 * Combines high-resolution calibrated texture mapping with authentic 3D geometry:
 * - Genuine printed circuit traces, silkscreen ROG cyber text, and component pads
 * - 3D VRM & Chipset Heatsinks with brushed gunmetal finish and cooling fins
 * - 3D Pre-Mounted I/O Armor Shroud with Aura RGB illuminated ROG eye & cutouts
 * - 3D LGA CPU Socket with polished chrome load plate and retention arm
 * - 4x 3D DDR4 DIMM Slots with keyed notches and locking latches
 * - Dual PCIe x16 SafeSlots with stainless steel armor shielding
 * - 3D M.2 Aluminum Armor Heatsink with Torx screws
 * - 3D SupremeFX audio enclosure with Nichicon gold capacitors
 * - 3D Solid aluminum capacitors, power chokes, and rear I/O connectors
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
  // Load official high-res top-down motherboard photo texture
  const pcbTexture = useLoader(THREE.TextureLoader, '/assets/3d/strix_b360f_full_top.png');

  useMemo(() => {
    if (pcbTexture) {
      pcbTexture.colorSpace = THREE.SRGBColorSpace;
      pcbTexture.anisotropy = 8;
      pcbTexture.minFilter = THREE.LinearMipmapLinearFilter;
      pcbTexture.magFilter = THREE.LinearFilter;
    }
  }, [pcbTexture]);

  // PBR Physical Materials
  const pcbBoardMat = {
    color: '#0d0f12',
    roughness: 0.88,
    metalness: 0.05,
  };

  const gunmetalHeatsinkMat = {
    color: '#23262f',
    roughness: 0.35,
    metalness: 0.82,
  };

  const steelArmorMat = {
    color: '#e2e8f0',
    roughness: 0.18,
    metalness: 0.98,
  };

  const plasticMat = {
    color: '#14161a',
    roughness: 0.7,
    metalness: 0.15,
  };

  const goldCapMat = {
    color: '#d4af37',
    roughness: 0.25,
    metalness: 0.92,
  };

  const aluCapMat = {
    color: '#cbd5e1',
    roughness: 0.22,
    metalness: 0.95,
  };

  // Selection / Hover highlights
  const highlightEmissive = isSelected ? '#00e5ff' : isHovered ? '#38bdf8' : '#000000';
  const highlightIntensity = isSelected ? 0.35 : isHovered ? 0.18 : 0;

  // Real ATX Form Factor Dimensions:
  // Width: 244mm (X = 6.1 units)
  // Height: 305mm (Y = 7.6 units)
  // Depth: 1.6mm (Z = 0.08 units)
  const W = 6.1;
  const H = 7.6;
  const halfW = W / 2; // 3.05
  const halfH = H / 2; // 3.8

  const expHeatsink = explodedProgress * 0.7;
  const expCover = explodedProgress * 1.1;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* ========================================================= */}
      {/* 1. HIGH-FIDELITY TEXTURED ATX SUBSTRATE                   */}
      {/* ========================================================= */}
      <group name="atx_pcb_substrate">
        {/* Main Board Base Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[W, H, 0.08]} />
          <meshStandardMaterial
            {...pcbBoardMat}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>

        {/* High-Resolution Printed Circuit Board Face (Zero Z-Fighting) */}
        <mesh position={[0, 0, 0.042]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial
            map={pcbTexture}
            roughness={0.75}
            metalness={0.12}
            polygonOffset={true}
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>

        {/* 9x Standard ATX Brass Standoff Mounting Holes with Ground Rings */}
        {[
          [-halfW + 0.3, halfH - 0.3],   [0, halfH - 0.3],   [halfW - 0.3, halfH - 0.3],
          [-halfW + 0.3, 0.1],           [0, 0.1],           [halfW - 0.3, 0.1],
          [-halfW + 0.3, -halfH + 0.35], [0, -halfH + 0.35], [halfW - 0.3, -halfH + 0.35]
        ].map(([sx, sy], idx) => (
          <group key={idx} position={[sx, sy, 0.046]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.15, 0.015, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <cylinderGeometry args={[0.09, 0.09, 0.015, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 2. 3D INTEGRATED PRE-MOUNTED I/O SHIELD & RGB AURA COVER   */}
      {/* ========================================================= */}
      <group name="io_armor_shroud" position={[-halfW + 0.6, 1.85, 0.45 + expCover]}>
        {/* Main Angled I/O Cover Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.05, 3.4, 0.72]} />
          <meshStandardMaterial {...gunmetalHeatsinkMat} />
        </mesh>

        {/* Sleek Facet Chamfer Edge */}
        <mesh position={[0.42, -0.4, 0.22]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.3, 2.2, 0.42]} />
          <meshStandardMaterial color="#1a1c24" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Cyber-Text Angled Vent Grooves */}
        {[-0.8, -0.3, 0.2, 0.7].map((cy, i) => (
          <mesh key={i} position={[0.52, cy, 0.08]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.04, 0.32, 0.06]} />
            <meshStandardMaterial color="#383d47" metalness={0.8} />
          </mesh>
        ))}

        {/* Glowing Aura RGB Illuminated ROG Strix Eye Diffuser */}
        <mesh position={[0.2, 0.85, 0.37]}>
          <boxGeometry args={[0.42, 0.85, 0.03]} />
          <meshStandardMaterial
            color={rgbColor}
            emissive={rgbColor}
            emissiveIntensity={3.2}
            roughness={0.15}
          />
        </mesh>

        {/* Metal Rear Ports Extrusion (HDMI, DP, USB 3.1 Type-C, LAN, Audio) */}
        <mesh position={[-0.55, 0, -0.1]}>
          <boxGeometry args={[0.15, 3.1, 0.55]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3. 3D BRUSHED GUNMETAL VRM HEATSINKS & POWER CHOKES        */}
      {/* ========================================================= */}
      <group name="vrm_cooling">
        {/* Top VRM Heatsink (Above CPU Socket) */}
        <group position={[-0.35, 3.05, 0.32 + expHeatsink]}>
          <mesh>
            <boxGeometry args={[2.4, 0.62, 0.52]} />
            <meshStandardMaterial {...gunmetalHeatsinkMat} />
          </mesh>
          {/* Beveled Cooling Fin Cuts */}
          {[-0.8, -0.4, 0.0, 0.4, 0.8].map((fx, i) => (
            <mesh key={i} position={[fx, 0, 0.26]}>
              <boxGeometry args={[0.07, 0.58, 0.08]} />
              <meshStandardMaterial color="#16181e" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* Left VRM Heatsink (Between CPU and I/O Shroud) */}
        <group position={[-1.75, 1.85, 0.32 + expHeatsink]}>
          <mesh>
            <boxGeometry args={[0.55, 1.9, 0.52]} />
            <meshStandardMaterial {...gunmetalHeatsinkMat} />
          </mesh>
          {[-0.6, -0.2, 0.2, 0.6].map((fy, i) => (
            <mesh key={i} position={[0, fy, 0.26]}>
              <boxGeometry args={[0.5, 0.07, 0.08]} />
              <meshStandardMaterial color="#16181e" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* Solid Digi+ VRM Alloy Power Inductor Chokes (R22 Cubes) */}
        {[-0.75, -0.38, 0.0, 0.38, 0.75].map((cx, i) => (
          <mesh key={i} position={[cx, 2.52, 0.16]}>
            <boxGeometry args={[0.26, 0.26, 0.2]} />
            <meshStandardMaterial color="#1c1f26" roughness={0.45} metalness={0.65} />
          </mesh>
        ))}

        {/* 8-Pin ProCool EPS CPU Power Connector (Top Left) */}
        <mesh position={[-2.1, 3.45, 0.18]}>
          <boxGeometry args={[0.7, 0.32, 0.28]} />
          <meshStandardMaterial {...plasticMat} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 4. 3D LGA CPU SOCKET & RETENTION HARDWARE                 */}
      {/* ========================================================= */}
      <group name="cpu_socket_lga" position={[-0.35, 1.6, 0.1]}>
        {/* Socket Outer Plastic Housing */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.75, 1.75, 0.1]} />
          <meshStandardMaterial color="#16181e" roughness={0.8} />
        </mesh>

        {!showCpu ? (
          /* Empty Open LGA Socket with Gold Contact Pins and Open Lever */
          <group>
            {/* Gold Pin Matrix Grid */}
            <mesh position={[0, 0, 0.05]}>
              <boxGeometry args={[1.28, 1.28, 0.02]} />
              <meshStandardMaterial color="#d97706" metalness={0.95} roughness={0.25} />
            </mesh>
            {/* Open Load Frame Hinge */}
            <mesh position={[0, 0.18, 0.12]} rotation={[-0.45, 0, 0]}>
              <boxGeometry args={[1.55, 1.55, 0.04]} />
              <meshStandardMaterial {...steelArmorMat} />
            </mesh>
            {/* Open Retention Lever */}
            <mesh position={[0.82, 0.22, 0.14]} rotation={[-0.5, 0, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 1.65, 12]} />
              <meshStandardMaterial color="#f8fafc" metalness={1.0} roughness={0.06} />
            </mesh>
          </group>
        ) : (
          /* Seated & Clamped CPU Processor */
          <group>
            {/* CPU Substrate */}
            <mesh position={[0, 0, 0.055]}>
              <boxGeometry args={[1.32, 1.32, 0.03]} />
              <meshStandardMaterial color="#0f766e" roughness={0.4} />
            </mesh>
            {/* Golden Triangle Alignment Mark on Corner */}
            <mesh position={[-0.58, -0.58, 0.072]}>
              <boxGeometry args={[0.08, 0.08, 0.005]} />
              <meshBasicMaterial color="#facc15" />
            </mesh>
            {/* Stainless Steel Outer Load Frame */}
            <mesh position={[0, 0, 0.065]}>
              <boxGeometry args={[1.55, 1.55, 0.04]} />
              <meshStandardMaterial {...steelArmorMat} />
            </mesh>
            {/* Nickel-Plated CPU Heat Spreader (IHS) Mirror Finish */}
            <mesh position={[0, 0, 0.09]}>
              <boxGeometry args={[1.15, 1.15, 0.03]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.12} />
            </mesh>
            {/* Chrome Retention Load Arm / Lever clamped */}
            <mesh position={[0.82, 0, 0.07]}>
              <cylinderGeometry args={[0.024, 0.024, 1.65, 12]} />
              <meshStandardMaterial color="#f8fafc" metalness={1.0} roughness={0.06} />
            </mesh>
            <mesh position={[0.82, 0.84, 0.07]}>
              <boxGeometry args={[0.08, 0.08, 0.04]} />
              <meshStandardMaterial color="#f8fafc" metalness={1.0} />
            </mesh>
          </group>
        )}
      </group>

      {/* ========================================================= */}
      {/* 5. 4x 3D DDR4 DUAL-CHANNEL DIMM SLOTS                      */}
      {/* ========================================================= */}
      <group name="ddr4_slots" position={[1.5, 1.6, 0.16]}>
        {[-0.6, -0.2, 0.2, 0.6].map((sx, idx) => {
          // DepEd TVL / TESDA CSS NC II Dual-Channel Standard:
          // Slots A2 (idx = 1, sx = -0.2) and B2 (idx = 3, sx = 0.6) are the primary channels
          const isSlotPopulated = showRam && (idx === 1 || idx === 3);

          return (
            <group key={idx} position={[sx, 0, 0]}>
              {/* Slot Track Housing (Dual-Color Channels: A1/B1 Black #111215, A2/B2 Gray #282d38) */}
              <mesh>
                <boxGeometry args={[0.16, 2.75, 0.22]} />
                <meshStandardMaterial color={idx % 2 === 0 ? '#111215' : '#282d38'} roughness={0.7} />
              </mesh>

              {/* Key Notch Center Post */}
              <mesh position={[0, 0.2, 0.11]}>
                <boxGeometry args={[0.17, 0.1, 0.04]} />
                <meshStandardMaterial color="#0c0e11" />
              </mesh>

              {/* Q-Latch Upper Retaining Clip (Locked when seated, open when empty) */}
              <mesh
                position={[0, isSlotPopulated ? 1.36 : 1.44, isSlotPopulated ? 0.14 : 0.06]}
                rotation={[isSlotPopulated ? 0 : 0.22, 0, 0]}
              >
                <boxGeometry args={[0.18, 0.14, 0.14]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.3} />
              </mesh>

              {/* Seated High-Speed DDR4 RAM Module in DIMM Slot A2 / B2 */}
              {isSlotPopulated && (
                <group position={[0, 0, 0.24]} rotation={[0, 0, Math.PI / 2]}>
                  <SingleDDR4RAM
                    scale={0.36}
                    rgbColor="#ffffff"
                    enableHighlight={false}
                  />
                </group>
              )}
            </group>
          );
        })}

        {/* 24-Pin ATX Main Power Socket (Right Board Edge) */}
        <group position={[1.05, 0.5, 0.08]}>
          <mesh>
            <boxGeometry args={[0.3, 1.85, 0.32]} />
            <meshStandardMaterial {...plasticMat} />
          </mesh>
          {Array.from({ length: 12 }).map((_, r) => (
            <mesh key={r} position={[0, -0.78 + r * 0.142, 0.17]}>
              <boxGeometry args={[0.18, 0.08, 0.04]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================= */}
      {/* 6. 3D PCIE SAFESLOT ARMOR & EXPANSION SLOTS               */}
      {/* ========================================================= */}
      <group name="pcie_expansion">
        {/* Primary SafeSlot PCIe 3.0 x16 (Full Stainless Steel Reinforced Shield) */}
        <group position={[-0.35, -0.65, 0.15]}>
          <mesh>
            <boxGeometry args={[3.8, 0.22, 0.24]} />
            <meshStandardMaterial {...steelArmorMat} />
          </mesh>
          <mesh position={[-1.2, 0, 0.13]}>
            <boxGeometry args={[0.08, 0.23, 0.06]} />
            <meshStandardMaterial color="#0b0d10" />
          </mesh>
          {/* Heavy-Duty Blue Q-Release Retention Latch */}
          <mesh position={[2.0, 0, 0.04]}>
            <boxGeometry args={[0.26, 0.3, 0.2]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} />
          </mesh>
        </group>

        {/* Secondary PCIe 3.0 x16 Slot */}
        <group position={[-0.35, -2.25, 0.12]}>
          <mesh>
            <boxGeometry args={[3.8, 0.2, 0.2]} />
            <meshStandardMaterial {...plasticMat} />
          </mesh>
          <mesh position={[2.0, 0, 0.03]}>
            <boxGeometry args={[0.24, 0.26, 0.16]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>

        {/* 4x PCIe x1 Short Expansion Slots */}
        {[-0.15, -1.15, -1.7, -2.85].map((py, idx) => (
          <group key={idx} position={[-1.4, py, 0.09]}>
            <mesh>
              <boxGeometry args={[1.5, 0.18, 0.16]} />
              <meshStandardMaterial {...plasticMat} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 7. 3D M.2 ARMOR HEATSINK WITH TORX HARDWARE                */}
      {/* ========================================================= */}
      <group name="m2_armor" position={[-0.35, -1.65, 0.15 + expHeatsink]}>
        {/* Brushed Gunmetal M.2 Thermal Plate */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.8, 0.34, 0.12]} />
          <meshStandardMaterial {...gunmetalHeatsinkMat} />
        </mesh>
        {/* Silver Chamfer Trim Line */}
        <mesh position={[0, 0.16, 0.04]}>
          <boxGeometry args={[2.7, 0.025, 0.05]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Dual Chrome Torx Retaining Screws */}
        {[-1.25, 1.25].map((sx, i) => (
          <mesh key={i} position={[sx, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.98} />
          </mesh>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 8. 3D B360 PCH CHIPSET HEATSINK                            */}
      {/* ========================================================= */}
      <group name="pch_chipset_heatsink" position={[1.65, -2.1, 0.26 + expHeatsink]}>
        {/* Main Angular Heatsink Block */}
        <mesh>
          <boxGeometry args={[1.8, 1.8, 0.38]} />
          <meshStandardMaterial {...gunmetalHeatsinkMat} />
        </mesh>

        {/* Diagonal Beveled Cut (Strix Architectural Styling) */}
        <mesh position={[-0.65, 0.65, 0.12]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.35, 1.1, 0.18]} />
          <meshStandardMaterial color="#1a1c22" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Brushed Silver Badge Plate */}
        <mesh position={[0.1, -0.2, 0.2]}>
          <boxGeometry args={[1.2, 0.8, 0.02]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Cyber Pattern RGB Accent Slat */}
        <mesh position={[0.1, -0.65, 0.2]}>
          <boxGeometry args={[1.0, 0.04, 0.02]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2.4} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 9. 3D SUPREMEFX AUDIO SYSTEM & GOLD CAPACITORS            */}
      {/* ========================================================= */}
      <group name="supremefx_audio_block" position={[-2.45, -2.45, 0.15]}>
        {/* SupremeFX Stainless Steel EMI Shield Enclosure */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.9, 0.9, 0.18]} />
          <meshStandardMaterial {...steelArmorMat} />
        </mesh>

        {/* Row of Real Gold Nichicon Acoustic Capacitors */}
        {[-0.25, -0.55, -0.85].map((cy, i) => (
          <mesh key={i} position={[-0.1, cy, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.26, 16]} />
            <meshStandardMaterial {...goldCapMat} />
          </mesh>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 10. 3D SOLID CAPACITORS & SATA CONNECTORS                  */}
      {/* ========================================================= */}
      <group name="onboard_components">
        {/* 6x Right-Angle SATA 6Gbps Ports */}
        <group position={[halfW - 0.35, -1.8, 0.18]}>
          {[-0.55, 0.0, 0.55].map((sy, i) => (
            <mesh key={i} position={[0, sy, 0]}>
              <boxGeometry args={[0.42, 0.38, 0.28]} />
              <meshStandardMaterial {...plasticMat} />
            </mesh>
          ))}
        </group>

        {/* Metallic Solid Aluminum Capacitors Array (VRM & DRAM Power) */}
        {[
          [-1.2, 2.65], [-1.2, 2.35], [-1.2, 2.05], [-1.2, 1.75], [-1.2, 1.45],
          [-1.2, 1.15], [-1.2, 0.85], [0.9, 3.15],  [1.2, 3.15],  [1.5, 3.15]
        ].map(([cx, cy], idx) => (
          <mesh key={idx} position={[cx, cy, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.18, 16]} />
            <meshStandardMaterial {...aluCapMat} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
