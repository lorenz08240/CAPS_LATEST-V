import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import ProceduralSickleFan from './ProceduralSickleFan';

export default function GenericPCCase({ 
  position = [0, 0, 0], 
  scale = 1, 
  rgbColor = '#00e5ff',
  caseColor = 'black', // 'black' | 'white'
  glassMode = 'closed', // 'closed', 'open', 'removed'
  explodedProgress = 0, // 0 to 1
  isSelected = false,
  isHovered = false,
  showTooltip = false,
  enableHighlight = true,
  onSelect,
  onHover,
  part
}) {
  const [localHover, setLocalHover] = useState(false);
  const effectiveHover = enableHighlight && (isHovered || localHover);
  const activeSelected = enableHighlight && isSelected;

  const isWhite = caseColor === 'white';

  // Dynamic engineering materials for Black vs White finishes (calibrated for ambient occlusion & non-glare)
  const chassisColor = isWhite ? '#d8dee9' : '#1e2533';
  const chassisMetalness = isWhite ? 0.15 : 0.65;
  const chassisRoughness = isWhite ? 0.52 : 0.55;

  const interiorColor = isWhite ? '#94a3b8' : '#2d3748';
  const meshColor = isWhite ? '#475569' : '#0f172a';
  const accentColor = isWhite ? '#64748b' : '#475569';
  const psuShroudColor = isWhite ? '#cbd5e1' : '#1f2937';
  const backPanelColor = isWhite ? '#94a3b8' : '#242c3d';
  const glassBorderColor = isWhite ? '#cbd5e1' : '#0f172a';
  const glassColor = isWhite ? '#f8fafc' : '#0f172a';
  const glassOpacity = isWhite ? 0.18 : 0.32;
  const rubberGrommetColor = isWhite ? '#1e293b' : '#111827';
  const structuralFrameColor = isWhite ? '#475569' : '#0b0f19';

  // Selection / Hover Emissive highlights
  const highlightEmissive = activeSelected ? '#00e5ff' : effectiveHover ? '#38bdf8' : '#000000';
  const highlightIntensity = activeSelected ? 0.35 : effectiveHover ? 0.18 : 0;

  // Calculate exploded offsets based on explodedProgress (0 = assembled, 1 = exploded)
  const expYTop = 4.5 + explodedProgress * 3.5;
  const expYBottom = -4.5 - explodedProgress * 2.5;
  const expZFront = 4.4 + explodedProgress * 4.0;
  const expZBack = -4.4 - explodedProgress * 3.5;
  const expXRight = 2.15 + explodedProgress * 3.5;

  return (
    <group 
      position={position} 
      scale={scale}
      onPointerOver={(e) => {
        if (!enableHighlight) return;
        e.stopPropagation();
        setLocalHover(true);
        if (onHover) onHover(part || { category: 'case', name: 'ATX Mid-Tower Chassis', brand: 'Generic' }, true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        if (!enableHighlight) return;
        e.stopPropagation();
        setLocalHover(false);
        if (onHover) onHover(part || { category: 'case', name: 'ATX Mid-Tower Chassis', brand: 'Generic' }, false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        if (!onSelect) return;
        e.stopPropagation();
        onSelect(part || { category: 'case', name: 'ATX Mid-Tower Chassis', brand: 'Generic', form_factor: 'ATX' });
      }}
    >
      {/* ── Selection / Hover Indicator Ring at Chassis Base (Only when highlights enabled) ── */}
      {enableHighlight && (activeSelected || effectiveHover) && (
        <group position={[0, -4.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <ringGeometry args={[5.2, 5.4, 48]} />
            <meshBasicMaterial 
              color={activeSelected ? '#00e5ff' : '#facc15'} 
              transparent 
              opacity={0.85} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        </group>
      )}

      {/* ── Outer Metal Chassis (Dynamic Powder-Coated Materials) ── */}

      {/* Top Panel & Magnetic Dust Filter */}
      <group position={[0, expYTop, 0]}>
        <mesh>
          <boxGeometry args={[4.5, 0.2, 9]} />
          <meshStandardMaterial 
            color={chassisColor} 
            roughness={chassisRoughness} 
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
        {/* Top Vent Mesh */}
        <mesh position={[0, 0.11, 0]}>
          <boxGeometry args={[3.8, 0.02, 7.8]} />
          <meshStandardMaterial color={meshColor} roughness={0.8} wireframe={explodedProgress > 0.1} />
        </mesh>
        {/* Front I/O Ports on Top Panel */}
        <mesh position={[1.5, 0.12, 3.8]}>
          <boxGeometry args={[0.3, 0.05, 0.3]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Power Button with LED Ring */}
        <mesh position={[1.5, 0.13, 3.8]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2.0} />
        </mesh>
        <mesh position={[1.0, 0.12, 3.8]}>
          <boxGeometry args={[0.4, 0.04, 0.15]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* Bottom Panel & Rubber Feet (Ground plane touches base of feet at Y = -4.9) */}
      <group position={[0, expYBottom, 0]}>
        <mesh>
          <boxGeometry args={[4.5, 0.2, 9]} />
          <meshStandardMaterial 
            color={chassisColor} 
            roughness={chassisRoughness} 
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
        {/* 4 Rubber/Chrome Feet extending down 0.4 units to Y = -4.9 */}
        {[[-1.8, -0.2, -3.8], [1.8, -0.2, -3.8], [-1.8, -0.2, 3.8], [1.8, -0.2, 3.8]].map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <cylinderGeometry args={[0.35, 0.4, 0.4, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
      </group>

      {/* Front Panel (Bezel & Mesh Intake) */}
      <group position={[0, 0, expZFront]}>
        {/* Outer Frame */}
        <mesh>
          <boxGeometry args={[4.5, 9, 0.3]} />
          <meshStandardMaterial 
            color={chassisColor} 
            roughness={chassisRoughness} 
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
        {/* Mesh Intake Center */}
        <mesh position={[0, 0, 0.16]}>
          <boxGeometry args={[3.8, 8.2, 0.05]} />
          <meshStandardMaterial color={meshColor} roughness={0.9} wireframe={explodedProgress > 0.2} />
        </mesh>
        {/* Front Edge Bevel Accent */}
        <mesh position={[-2.15, 0, 0.1]}>
          <boxGeometry args={[0.1, 8.8, 0.2]} />
          <meshStandardMaterial color={accentColor} metalness={0.8} />
        </mesh>
      </group>

      {/* Back Panel (I/O Cutout & Expansion Slots) */}
      <group position={[0, 0, expZBack]}>
        <mesh>
          <boxGeometry args={[4.5, 9, 0.2]} />
          <meshStandardMaterial 
            color={backPanelColor} 
            roughness={chassisRoughness} 
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
        {/* PCIe Expansion Slot Brackets (Vertical Grille) */}
        <mesh position={[0.6, -1.0, 0.11]}>
          <boxGeometry args={[1.5, 2.5, 0.02]} />
          <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Motherboard I/O Shield Cutout */}
        <mesh position={[1.4, 1.4, 0.11]}>
          <boxGeometry args={[1.2, 2.0, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        {/* PSU Intake Hole at Bottom */}
        <mesh position={[0, -3.5, 0.11]}>
          <boxGeometry args={[2.8, 1.6, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      </group>

      {/* Right Panel (Solid Metal) */}
      <group position={[expXRight, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 8.8, 8.8]} />
          <meshStandardMaterial 
            color={backPanelColor} 
            roughness={chassisRoughness} 
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
      </group>

      {/* ── Internal Motherboard Tray ── */}
      <group position={[1.5, 0, -0.6]}>
        <mesh>
          <boxGeometry args={[0.08, 6.8, 6.2]} />
          <meshStandardMaterial color={interiorColor} roughness={0.7} metalness={0.5} />
        </mesh>
        {/* Rubber Grommets */}
        <mesh position={[0.05, 0.5, 2.2]}>
          <boxGeometry args={[0.04, 1.8, 0.5]} />
          <meshStandardMaterial color={rubberGrommetColor} roughness={0.95} />
        </mesh>
        <mesh position={[0.05, -1.8, 1.5]}>
          <boxGeometry args={[0.04, 0.5, 1.4]} />
          <meshStandardMaterial color={rubberGrommetColor} roughness={0.95} />
        </mesh>
        <mesh position={[-0.01, 1.4, -0.2]}>
          <boxGeometry args={[0.1, 2.0, 2.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.95} />
        </mesh>
      </group>

      {/* ── PSU Shroud (Basement Cover with Cable Cutouts) ── */}
      <group position={[0, -3.5, 0]}>
        <mesh>
          <boxGeometry args={[4.2, 1.8, 8.8]} />
          <meshStandardMaterial 
            color={psuShroudColor} 
            roughness={0.7} 
            metalness={0.6}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
        {/* Top PSU Shroud Ventilation plate */}
        <mesh position={[-0.8, 0.91, 0]}>
          <boxGeometry args={[2.0, 0.02, 6.0]} />
          <meshStandardMaterial color={meshColor} roughness={0.9} />
        </mesh>
        {/* Cable Pass-Through Hole */}
        <mesh position={[0.8, 0.91, 0.5]}>
          <boxGeometry args={[0.4, 0.03, 1.0]} />
          <meshStandardMaterial color="#0b0f19" roughness={0.95} />
        </mesh>
      </group>

      {/* ── Front Triple RGB Intake Fans (Interlocking Lian Li Uni-Fan style) ── */}
      <group position={[0, 0, 4.1]}>
        {[2.45, 0, -2.45].map((yPos, idx) => (
          <ProceduralSickleFan 
            key={`front-fan-${idx}`} 
            position={[0, yPos, 0]} 
            rgbColor={rgbColor}
            size={2.45}
            radius={1.14}
            hubRadius={0.4}
            isExhaust={false}
          />
        ))}
      </group>

      {/* ── Rear RGB Exhaust Fan ── */}
      <ProceduralSickleFan 
        position={[0.2, 1.4, -4.1]} 
        rgbColor={rgbColor}
        size={2.2}
        radius={1.02}
        hubRadius={0.38}
        isExhaust={true}
      />

      {/* ── Internal Ambient Occlusion Corner Posts & Junction Shadow Crevices ── */}
      <group>
        {/* 4 Corner Structural Posts creating natural corner ambient occlusion */}
        {[
          [-2.15, 0, 4.3],
          [2.15, 0, 4.3],
          [-2.15, 0, -4.3],
          [2.15, 0, -4.3]
        ].map((pos, idx) => (
          <mesh key={`post-${idx}`} position={pos}>
            <boxGeometry args={[0.16, 8.8, 0.16]} />
            <meshStandardMaterial color={structuralFrameColor} roughness={0.7} metalness={0.4} />
          </mesh>
        ))}

        {/* Crevice Shadow Joint between Motherboard Tray and PSU Shroud */}
        <mesh position={[1.46, -2.59, -0.6]}>
          <boxGeometry args={[0.08, 0.04, 6.2]} />
          <meshBasicMaterial color="#090d16" />
        </mesh>
      </group>

      {/* ── Left Side Panel (Tempered Glass Door with Rear Hinge) ── */}
      {glassMode !== 'removed' && (
        <group 
          position={[-2.2 - (explodedProgress * 4.5), 0, -4.4]} 
          rotation={[0, glassMode === 'open' ? -0.85 : 0, 0]}
        >
          {/* Glass Door Assembly positioned relative to rear hinge pivot at Z = 0 */}
          <group position={[0, 0, 4.4]}>
            {/* Main Tempered Glass Pane */}
            <mesh>
              <boxGeometry args={[0.08, 8.8, 8.8]} />
              <meshPhysicalMaterial 
                color={glassColor} 
                transmission={0.93} 
                opacity={glassOpacity} 
                transparent={true} 
                roughness={0.03} 
                metalness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.03}
                reflectivity={0.7}
              />
            </mesh>

            {/* 4-Edge Silk-Screened Ceramic Bezel Border */}
            {/* Top Border */}
            <mesh position={[0.042, 4.15, 0]}>
              <boxGeometry args={[0.005, 0.5, 8.8]} />
              <meshStandardMaterial color={glassBorderColor} roughness={0.9} />
            </mesh>
            {/* Bottom Border */}
            <mesh position={[0.042, -4.15, 0]}>
              <boxGeometry args={[0.005, 0.5, 8.8]} />
              <meshStandardMaterial color={glassBorderColor} roughness={0.9} />
            </mesh>
            {/* Front Border */}
            <mesh position={[0.042, 0, 4.15]}>
              <boxGeometry args={[0.005, 7.8, 0.5]} />
              <meshStandardMaterial color={glassBorderColor} roughness={0.9} />
            </mesh>
            {/* Rear Border */}
            <mesh position={[0.042, 0, -4.15]}>
              <boxGeometry args={[0.005, 7.8, 0.5]} />
              <meshStandardMaterial color={glassBorderColor} roughness={0.9} />
            </mesh>

            {/* Front Magnetic Pull Tab / Handle */}
            <mesh position={[-0.08, 0, 4.3]}>
              <boxGeometry args={[0.1, 1.2, 0.2]} />
              <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.2} />
            </mesh>

            {/* Rear Precision Steel Hinges (2x) */}
            {[2.5, -2.5].map((yHinge, idx) => (
              <mesh key={`hinge-${idx}`} position={[0.02, yHinge, -4.4]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
                <meshStandardMaterial color="#334155" metalness={0.95} roughness={0.2} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* ── Tooltip on Hover (Optional, default false) ── */}
      {showTooltip && effectiveHover && (
        <Html center position={[0, expYTop + 0.6, 0]} distanceFactor={15}>
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
            <span>{part?.name || 'ATX Mid-Tower Chassis'}</span>
            <span style={{ opacity: 0.6, fontSize: '9px', textTransform: 'uppercase' }}>({caseColor.toUpperCase()})</span>
          </div>
        </Html>
      )}
    </group>
  );
}
