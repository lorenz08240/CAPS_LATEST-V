import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import ProceduralSickleFan from './ProceduralSickleFan';
import NepotatoGPU from './NepotatoGPU';
import { MotherboardDDR4Kit } from './DDR4RAMModel';
import { MotherboardNVMeSSD } from './NVMeSSDModel';

// Procedural high-detail 3D models for all PC components (Clean Generic Models per Panel Specs)
export default function ComponentModels3D({ 
  part, 
  rgbColor = '#00e5ff', 
  explodedProgress = 0,
  isSelected = false,
  isHovered = false,
  showTooltip = false,
  enableHighlight = true,
  onSelect,
  onHover
}) {
  const groupRef = useRef();
  const [localHover, setLocalHover] = useState(false);

  // Gentle hover scale effect (only when highlights are enabled)
  useFrame(() => {
    if (groupRef.current) {
      const targetScale = enableHighlight && (isHovered || localHover) ? 1.03 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    }
  });

  const category = part.category.toLowerCase();
  const basePos = part.targetPosition || [0, 0, 0];

  // Calculate exploded vectors depending on component type
  const explodedOffset = useMemo(() => {
    switch (category) {
      case 'motherboard':
        return [-explodedProgress * 1.5, 0, 0];
      case 'cpu':
        return [-explodedProgress * 2.8, 0, 0];
      case 'ram':
        return [-explodedProgress * 2.4, 0, 0];
      case 'gpu':
        return [-explodedProgress * 3.2, 0, 0];
      case 'psu':
        return [0, 0, -explodedProgress * 3.5];
      case 'storage':
        return [-explodedProgress * 2.0, 0, 0];
      default:
        return [0, 0, 0];
    }
  }, [category, explodedProgress]);

  const finalPos = [
    basePos[0] + explodedOffset[0],
    basePos[1] + explodedOffset[1],
    basePos[2] + explodedOffset[2]
  ];

  const effectiveHover = enableHighlight && (isHovered || localHover);
  const activeSelected = enableHighlight && isSelected;
  const highlightEmissive = activeSelected ? '#00e5ff' : effectiveHover ? '#475569' : '#000000';
  const highlightIntensity = activeSelected ? 1.5 : effectiveHover ? 0.8 : 0;

  return (
    <group
      ref={groupRef}
      position={finalPos}
      onPointerOver={(e) => {
        if (!enableHighlight) return;
        e.stopPropagation();
        setLocalHover(true);
        if (onHover) onHover(part, true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        if (!enableHighlight) return;
        e.stopPropagation();
        setLocalHover(false);
        if (onHover) onHover(part, false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        if (!onSelect) return;
        e.stopPropagation();
        onSelect(part);
      }}
    >
      {/* Selection / Hover Indicator Ring (Only rendered when highlights enabled) */}
      {enableHighlight && (activeSelected || effectiveHover) && (
        <mesh position={[-0.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[1.5, 1.6, 32]} />
          <meshBasicMaterial 
            color={activeSelected ? '#00e5ff' : '#facc15'} 
            transparent 
            opacity={0.75} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. GENERIC ARCHITECTURAL MOTHERBOARD (No Brands / Clean PCB)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {category === 'motherboard' && (
        <group>
          {/* Main PCB Board (High-Contrast Matte Dark Alloy) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 5.6, 5.2]} />
            <meshStandardMaterial 
              color="#1e2532"
              roughness={0.65} 
              metalness={0.35}
              emissive={highlightEmissive}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>

          {/* Procedural Copper/Gold Circuit Traces */}
          {[-1.8, -0.6, 0.6, 1.8].map((z, idx) => (
            <mesh key={`trace-${idx}`} position={[-0.052, 0, z]}>
              <boxGeometry args={[0.005, 5.2, 0.04]} />
              <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          {[-1.5, 0, 1.5].map((y, idx) => (
            <mesh key={`htrace-${idx}`} position={[-0.052, y, 0]}>
              <boxGeometry args={[0.005, 0.04, 4.8]} />
              <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.6} />
            </mesh>
          ))}

          {/* Top VRM Aluminum Heatsink */}
          <group position={[-0.14, 2.3, -0.6]}>
            <mesh>
              <boxGeometry args={[0.22, 0.6, 2.2]} />
              <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.2} />
            </mesh>
            {[-0.8, -0.4, 0, 0.4, 0.8].map((z, idx) => (
              <mesh key={idx} position={[-0.05, 0.1, z]}>
                <boxGeometry args={[0.15, 0.4, 0.04]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
            ))}
          </group>

          {/* Left VRM Heatsink & Integrated Rear I/O Cover */}
          <group position={[-0.16, 1.5, -2.1]}>
            <mesh>
              <boxGeometry args={[0.25, 2.4, 0.8]} />
              <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.25} />
            </mesh>
            {/* Glowing Generic Accent Line */}
            <mesh position={[-0.13, 0, 0]}>
              <boxGeometry args={[0.02, 1.8, 0.08]} />
              <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3.0} />
            </mesh>
          </group>

          {/* CPU Socket Housing (Universal AM5/LGA bracket) */}
          <group position={[-0.08, 1.4, -0.6]}>
            <mesh>
              <boxGeometry args={[0.06, 1.4, 1.4]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Retention Bracket Frame (Silver) */}
            <mesh position={[-0.03, 0, 0]}>
              <boxGeometry args={[0.03, 1.25, 1.25]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.12} />
            </mesh>
            {/* Metal Latch Lever Arm */}
            <mesh position={[-0.04, 0, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
              <meshStandardMaterial color="#f1f5f9" metalness={1.0} roughness={0.1} />
            </mesh>
          </group>

          {/* 4 DDR5 RAM DIMM Slots */}
          {[-0.3, -0.1, 0.1, 0.3].map((zOffset, idx) => (
            <group key={idx} position={[-0.08, 1.4, 0.8 + zOffset]}>
              <mesh>
                <boxGeometry args={[0.06, 2.4, 0.12]} />
                <meshStandardMaterial color={idx % 2 === 0 ? "#1e293b" : "#475569"} roughness={0.6} />
              </mesh>
              {/* Retention Latches */}
              <mesh position={[-0.02, 1.22, 0]}>
                <boxGeometry args={[0.08, 0.1, 0.14]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
              </mesh>
              <mesh position={[-0.02, -1.22, 0]}>
                <boxGeometry args={[0.08, 0.1, 0.14]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
              </mesh>
            </group>
          ))}

          {/* CLEARLY DEFINED M.2 NVMe SLOT (Between CPU and GPU) */}
          <group position={[-0.07, 0.35, -0.6]}>
            {/* White Silkscreen Slot Outline on Board */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.01, 0.42, 1.9]} />
              <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.8} />
            </mesh>
            {/* M.2 Keyed Connector Socket at Top */}
            <mesh position={[-0.02, 0, 0.88]}>
              <boxGeometry args={[0.06, 0.34, 0.12]} />
              <meshStandardMaterial color="#090d16" roughness={0.8} />
            </mesh>
            {/* Chrome Standoff Nut at Bottom */}
            <mesh position={[-0.02, 0, -0.88]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.95} />
            </mesh>
          </group>

          {/* Primary PCIe 5.0 Steel Armor Slot (for GPU) */}
          <group position={[-0.08, -0.7, -0.3]}>
            <mesh>
              <boxGeometry args={[0.08, 0.22, 3.6]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.98} roughness={0.12} />
            </mesh>
            {/* Retention Clip */}
            <mesh position={[0, 0, 1.85]}>
              <boxGeometry args={[0.1, 0.28, 0.2]} />
              <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.0} />
            </mesh>
          </group>

          {/* Secondary PCIe Slot */}
          <mesh position={[-0.08, -1.8, -0.3]}>
            <boxGeometry args={[0.06, 0.18, 3.2]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>

          {/* Chipset Heatsink (Bottom Right) */}
          <group position={[-0.1, -1.6, 1.4]}>
            <mesh>
              <boxGeometry args={[0.12, 1.4, 1.4]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.25} />
            </mesh>
            {/* RGB Illuminated Geometric Accent */}
            <mesh position={[-0.07, 0, 0]}>
              <boxGeometry args={[0.01, 0.6, 0.6]} />
              <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2.8} />
            </mesh>
          </group>

          {/* Gold Audio Capacitors */}
          {[-1.2, -1.5, -1.8, -2.1].map((y, idx) => (
            <mesh key={idx} position={[-0.1, y, -2.1]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
            </mesh>
          ))}
        </group>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. CPU + COOLER (Infinity Mirror Torus correctly facing X)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {category === 'cpu' && (
        <group>
          {/* CPU Substrate PCB */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.04, 1.15, 1.15]} />
            <meshStandardMaterial color="#0d9488" roughness={0.5} />
          </mesh>

          {/* Nickel-Plated Copper Integrated Heat Spreader (IHS) */}
          <mesh position={[-0.03, 0, 0]}>
            <boxGeometry args={[0.05, 0.95, 0.95]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
          </mesh>

          {/* Generic CPU Spec Plate */}
          <mesh position={[-0.06, 0, 0]}>
            <boxGeometry args={[0.005, 0.6, 0.6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
          </mesh>

          {/* Premium AIO Liquid Cooler Pump Block */}
          <group position={[-0.45, 0, 0]}>
            {/* Cylindrical Pump Block Body (aligned with X axis) */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.7, 0.7, 0.65, 32]} />
              <meshStandardMaterial color="#1e293b" metalness={0.88} roughness={0.25} />
            </mesh>

            {/* Infinity Mirror Face (faces -X in YZ plane) */}
            <mesh position={[-0.33, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.62, 0.62, 0.02, 32]} />
              <meshStandardMaterial color="#090d16" metalness={0.95} roughness={0.08} />
            </mesh>

            {/* Glowing Infinity Mirror Rings (Face X in YZ plane: rotation={[0, Math.PI/2, 0]}) */}
            <mesh position={[-0.34, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.55, 0.04, 16, 32]} />
              <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3.8} />
            </mesh>
            <mesh position={[-0.34, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.35, 0.03, 16, 32]} />
              <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3.0} />
            </mesh>

            {/* Center Glowing Logo Gem */}
            <mesh position={[-0.345, 0, 0]}>
              <boxGeometry args={[0.01, 0.2, 0.2]} />
              <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={4.5} />
            </mesh>

            {/* Rotary 90-Degree Swivel Barb Fittings */}
            <mesh position={[0.1, 0.55, 0.22]}>
              <boxGeometry args={[0.18, 0.18, 0.18]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            <mesh position={[0.1, 0.55, -0.22]}>
              <boxGeometry args={[0.18, 0.18, 0.18]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          </group>

          {/* Top 240mm Radiator + Dual Fan Assembly (Mounted flush beneath top chassis roof) */}
          <group position={[-0.3, 2.25, 1.2]}>
            {/* Radiator Core Tank (Black Anodized Aluminum) */}
            <mesh>
              <boxGeometry args={[1.8, 0.24, 4.6]} />
              <meshStandardMaterial color="#1e2533" metalness={0.85} roughness={0.3} />
            </mesh>

            {/* Micro-Fin Heat Exchanger Matrix */}
            <mesh position={[0, -0.13, 0]}>
              <boxGeometry args={[1.6, 0.02, 4.4]} />
              <meshStandardMaterial color="#0f172a" roughness={0.95} wireframe />
            </mesh>

            {/* End Tank Water Chambers */}
            <mesh position={[0, 0, -2.4]}>
              <boxGeometry args={[1.8, 0.26, 0.35]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 2.4]}>
              <boxGeometry args={[1.8, 0.26, 0.35]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Radiator Swivel Hose Inlets */}
            <mesh position={[-0.4, -0.15, -2.1]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.95} />
            </mesh>
            <mesh position={[0.2, -0.15, -2.1]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.95} />
            </mesh>

            {/* Dual 120mm High Static Pressure Radiator Fans (True Sickle Rotors) */}
            {[-1.1, 1.1].map((fanZ, fIdx) => (
              <ProceduralSickleFan
                key={`radfan-${fIdx}`}
                position={[0, -0.22, fanZ]}
                rotation={[Math.PI / 2, 0, 0]}
                rgbColor={rgbColor}
                size={1.9}
                radius={0.88}
                hubRadius={0.32}
                speed={8}
                isExhaust={true}
              />
            ))}
          </group>

          {/* Braided Nylon Coolant Hoses connecting CPU block to top radiator */}
          {/* Hose 1 */}
          <group>
            <mesh position={[-0.4, 0.9, -0.8]} rotation={[0.4, 0, 0.3]}>
              <cylinderGeometry args={[0.075, 0.075, 1.2, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.85} />
            </mesh>
            <mesh position={[-0.42, 1.6, -0.95]} rotation={[0.1, 0, 0.05]}>
              <cylinderGeometry args={[0.075, 0.075, 0.8, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.85} />
            </mesh>
          </group>

          {/* Hose 2 */}
          <group>
            <mesh position={[-0.32, 0.85, -1.2]} rotation={[0.45, 0, 0.2]}>
              <cylinderGeometry args={[0.075, 0.075, 1.2, 16]} />
              <meshStandardMaterial color="#334155" roughness={0.85} />
            </mesh>
            <mesh position={[-0.28, 1.55, -1.1]} rotation={[0.15, 0, 0.02]}>
              <cylinderGeometry args={[0.075, 0.075, 0.8, 16]} />
              <meshStandardMaterial color="#334155" roughness={0.85} />
            </mesh>
          </group>
        </group>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. DUAL RAM KIT (PHOTOREALISTIC DDR4 MODULES WITH PBR TEXTURES) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {category === 'ram' && (
        <MotherboardDDR4Kit
          part={part}
          rgbColor={rgbColor}
          isSelected={activeSelected}
          isHovered={effectiveHover}
          enableHighlight={enableHighlight}
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. GPU (GRAPHICS CARD - TRIPLE FAN NEPOTATO PROCEDURAL MODEL) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {category === 'gpu' && (
        <NepotatoGPU 
          rgbColor={rgbColor} 
          explodedProgress={explodedProgress} 
          isSelected={isSelected} 
          isHovered={isHovered || localHover} 
        />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. POWER SUPPLY (MODULAR ATX PSU)                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {category === 'psu' && (
        <group>
          {/* Main Steel Enclosure */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.5, 1.5, 3.2]} />
            <meshStandardMaterial 
              color="#2d3748" 
              roughness={0.65} 
              metalness={0.65}
              emissive={highlightEmissive}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>

          {/* Honeycomb Rear Exhaust Grille */}
          <mesh position={[0, 0, -1.61]}>
            <boxGeometry args={[2.3, 1.3, 0.02]} />
            <meshStandardMaterial color="#111827" roughness={0.9} wireframe />
          </mesh>

          {/* AC Power Socket */}
          <mesh position={[0.7, -0.2, -1.62]}>
            <boxGeometry args={[0.6, 0.4, 0.05]} />
            <meshStandardMaterial color="#090d16" />
          </mesh>

          {/* Rocker Power Switch */}
          <mesh position={[-0.7, -0.2, -1.62]}>
            <boxGeometry args={[0.3, 0.4, 0.06]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} />
          </mesh>

          {/* Modular Output Ports */}
          <mesh position={[0, 0, 1.61]}>
            <boxGeometry args={[2.2, 1.2, 0.03]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* Braided Black Main Cable Loom */}
          <mesh position={[0.4, 0.2, 2.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 1.0, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>

          {/* Side 80 Plus Gold Badge */}
          <mesh position={[-1.26, 0, 0]}>
            <boxGeometry args={[0.01, 0.8, 1.6]} />
            <meshStandardMaterial color="#facc15" metalness={0.92} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. STORAGE (HIGH-FIDELITY M.2 NVMe SSD SEATED IN MOTHERBOARD) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {category === 'storage' && (
        <MotherboardNVMeSSD 
          rgbColor={rgbColor}
          isSelected={isSelected}
          isHovered={effectiveHover}
          enableHighlight={enableHighlight}
        />
      )}

      {/* Tooltip on hover (Optional, default false) */}
      {showTooltip && effectiveHover && (
        <Html center position={[0, 1.6, 0]} distanceFactor={15}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: `1px solid ${isSelected ? '#00e5ff' : rgbColor}`,
            padding: '6px 12px',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ color: rgbColor, fontSize: '13px' }}>●</span>
            <span>{part.name || part.label || category.toUpperCase()}</span>
            <span style={{ opacity: 0.6, fontSize: '9px', textTransform: 'uppercase' }}>({category})</span>
          </div>
        </Html>
      )}
    </group>
  );
}
