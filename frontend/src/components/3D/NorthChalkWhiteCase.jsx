import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import ProceduralSickleFan from './ProceduralSickleFan';

/**
 * NorthChalkWhiteCase - High-Fidelity Architectural PC Case
 * Inspired by Fractal North (Chalk White Edition) - unbranded.
 *
 * Real Proportions:
 * - Depth: 447mm (~9.0 units)
 * - Height: 469mm (~9.4 units)
 * - Width: 215mm (~4.3 units)
 *
 * Key Design Elements:
 * 1. Front Panel: 10 authentic vertical natural oak wood slats with beveling & natural variation,
 *    recessed fine intake airflow mesh, soft-beveled chalk-white outer bezel.
 * 2. Top Cover: Chalk white steel with rear acoustic fine exhaust mesh filter + faux leather pull tab.
 * 3. Front-Top I/O: Recessed brass ring power button with warm metallic reflection + audio + USB ports.
 * 4. Feet: 4 turned cylindrical brushed brass feet with black rubber vibration dampening boots.
 * 5. Side Panel: High-transparency architectural tempered glass with ceramic perimeter frit,
 *    or breathable white mesh (toggleable via prop sidePanelMode).
 * 6. Interior: Dark charcoal chassis frame, full-length PSU shroud with side cut/stepped window & cable grommets,
 *    motherboard tray with cable pass-throughs, and two spinning front intake fans.
 */
export default function NorthChalkWhiteCase({
  position = [0, 0, 0],
  scale = 1,
  sidePanelMode = 'glass', // 'glass' | 'mesh' | 'open'
  caseColor = 'black', // 'black' | 'white'
  rgbColor = '#ffffff',
  explodedProgress = 0,
  isSelected = false,
  isHovered = false,
  enableHighlight = false,
  onSelect,
  onHover,
  part
}) {
  const isWhite = caseColor === 'white';

  // Palette & Materials
  // Chassis outer shell powder coat
  const outerCoat = isWhite ? '#f3f4f6' : '#1a1e27';
  const outerBezel = isWhite ? '#e5e7eb' : '#12151d';
  const chassisMetalness = isWhite ? 0.15 : 0.45;
  const chassisRoughness = isWhite ? 0.55 : 0.65;

  // Interior dark chassis
  const interiorCharcoal = isWhite ? '#1a1d24' : '#14161c';
  const interiorSteel = isWhite ? '#222631' : '#1c202a';
  const grommetColor = '#0b0d11';

  // Wood tones: Authentic Walnut (Black Case) vs Scandinavian Oak (White Case)
  const oakTones = isWhite
    ? [
        '#c8a168', '#b99258', '#d0a970', '#c29b61', '#b79056',
        '#cca46d', '#bf975e', '#cfab73', '#ba935a', '#c79f66'
      ]
    : [
        '#422e1e', '#4c3624', '#392719', '#483323', '#3d2b1c',
        '#453121', '#372618', '#4a3525', '#3f2c1d', '#443022'
      ];

  // Turned brushed brass
  const brassColor = '#d4af37';
  const brassLip = '#e2c158';

  // Highlight
  const highlightEmissive = isSelected ? '#ffffff' : isHovered ? '#f5e6c7' : '#000000';
  const highlightIntensity = isSelected ? 0.35 : isHovered ? 0.18 : 0;

  // Real Case Dimensions (standard ATX proportion)
  const W = 4.3; // Width (X)
  const H = 9.4; // Height (Y)
  const D = 9.0; // Depth (Z)

  const halfW = W / 2; // 2.15
  const halfH = H / 2; // 4.7
  const halfD = D / 2; // 4.5

  // Slat array math (10 slats spaced across front opening)
  const slatCount = 10;
  const slatW = 0.18;
  const slatD = 0.24;
  const slatH = H - 0.7; // 8.7
  const slatAreaWidth = W - 0.8; // 3.5
  const slatSpacing = slatAreaWidth / (slatCount - 1); // ~0.388
  const startX = -slatAreaWidth / 2;

  // Exploded offsets
  const expYTop = halfH + explodedProgress * 3.5;
  const expZFront = halfD + explodedProgress * 4.0;
  const expZBack = -halfD - explodedProgress * 3.5;
  const expXLeft = -halfW - explodedProgress * 3.8;
  const expXRight = halfW + explodedProgress * 3.5;

  return (
    <group position={position} scale={scale}>
      {/* ========================================================= */}
      {/* 1. INTERNAL ATX CHASSIS CAGE (Motherboard Tray & PSU Shroud) */}
      {/* ========================================================= */}
      <group name="interior_chassis">
        {/* Motherboard tray (recessed into right half) */}
        <mesh position={[1.4, 0.6, -0.4]}>
          <boxGeometry args={[0.06, 7.0, 6.8]} />
          <meshStandardMaterial color={interiorCharcoal} roughness={0.8} metalness={0.4} />
        </mesh>

        {/* Rubber cable management grommets */}
        {[
          [1.44, 1.8, 1.2],
          [1.44, 0.0, 1.2],
          [1.44, -1.6, 1.2],
          [1.44, 3.2, -1.8]
        ].map(([gx, gy, gz], idx) => (
          <mesh key={idx} position={[gx, gy, gz]}>
            <boxGeometry args={[0.04, 1.1, 0.45]} />
            <meshStandardMaterial color={grommetColor} roughness={0.95} />
          </mesh>
        ))}

        {/* Full-length PSU Shroud / Lower Basement */}
        <group position={[0, -halfH + 1.05, 0]}>
          {/* Shroud Top Deck */}
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[W - 0.1, 0.06, D - 0.2]} />
            <meshStandardMaterial color={interiorSteel} roughness={0.75} metalness={0.5} />
          </mesh>
          {/* Shroud Ventilation Honeycomb Cutout (Top) */}
          <mesh position={[-0.7, 0.99, 0]}>
            <boxGeometry args={[1.8, 0.02, 5.8]} />
            <meshStandardMaterial color="#111317" roughness={0.9} />
          </mesh>
          {/* Shroud Left Facing Wall (Solid baseline) */}
          <mesh position={[-halfW + 0.08, 0, 0]}>
            <boxGeometry args={[0.06, 1.9, D - 0.2]} />
            <meshStandardMaterial color={interiorSteel} roughness={0.75} metalness={0.5} />
          </mesh>
        </group>

        {/* 2x Front Intake Spinning Sickle Fans (Visible through slats) */}
        <group position={[0, 0.8, halfD - 0.45]}>
          <ProceduralSickleFan
            position={[0, 1.4, 0]}
            rgbColor={rgbColor}
            size={2.4}
            radius={1.12}
            hubRadius={0.38}
            isExhaust={false}
          />
          <ProceduralSickleFan
            position={[0, -1.4, 0]}
            rgbColor={rgbColor}
            size={2.4}
            radius={1.12}
            hubRadius={0.38}
            isExhaust={false}
          />
        </group>

        {/* 1x Rear Exhaust Fan */}
        <group position={[0.2, 1.8, -halfD + 0.35]}>
          <ProceduralSickleFan
            rgbColor={rgbColor}
            size={2.2}
            radius={1.02}
            hubRadius={0.36}
            isExhaust={true}
          />
        </group>

        {/* Chassis Internal Corner Posts */}
        {[
          [-halfW + 0.08, 0, halfD - 0.08],
          [halfW - 0.08, 0, halfD - 0.08],
          [-halfW + 0.08, 0, -halfD + 0.08],
          [halfW - 0.08, 0, -halfD + 0.08]
        ].map(([px, py, pz], idx) => (
          <mesh key={idx} position={[px, py, pz]}>
            <boxGeometry args={[0.14, H - 0.2, 0.14]} />
            <meshStandardMaterial color={interiorCharcoal} roughness={0.7} metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 2. SIGNATURE FRONT FACADE (Natural Oak Slats + Fine Mesh)  */}
      {/* ========================================================= */}
      <group name="front_facade" position={[0, 0, expZFront]}>
        {/* Recessed Dark Intake Acoustic Mesh Layer */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[slatAreaWidth + 0.2, slatH + 0.1, 0.04]} />
          <meshStandardMaterial color="#14161a" roughness={0.92} metalness={0.2} />
        </mesh>

        {/* 10 Vertical Real Wood Slats */}
        <group name="wood_slats">
          {Array.from({ length: slatCount }).map((_, i) => {
            const x = startX + i * slatSpacing;
            const slatColor = oakTones[i % oakTones.length];
            return (
              <mesh key={i} position={[x, 0, slatD / 2]}>
                <boxGeometry args={[slatW, slatH, slatD]} />
                <meshStandardMaterial
                  color={slatColor}
                  roughness={0.68}
                  metalness={0.0}
                />
              </mesh>
            );
          })}
        </group>

        {/* Outer Chalk White Front Bezel (Framing the wood slats) */}
        {/* Left vertical border */}
        <mesh position={[-halfW + 0.18, 0, 0.1]}>
          <boxGeometry args={[0.36, H, 0.32]} />
          <meshStandardMaterial
            color={outerBezel}
            roughness={chassisRoughness}
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
        {/* Right vertical border */}
        <mesh position={[halfW - 0.18, 0, 0.1]}>
          <boxGeometry args={[0.36, H, 0.32]} />
          <meshStandardMaterial
            color={outerBezel}
            roughness={chassisRoughness}
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
        {/* Top header border */}
        <mesh position={[0, halfH - 0.18, 0.1]}>
          <boxGeometry args={[W, 0.36, 0.32]} />
          <meshStandardMaterial
            color={outerBezel}
            roughness={chassisRoughness}
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
        {/* Bottom footer border */}
        <mesh position={[0, -halfH + 0.18, 0.1]}>
          <boxGeometry args={[W, 0.36, 0.32]} />
          <meshStandardMaterial
            color={outerBezel}
            roughness={chassisRoughness}
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3. TOP PANEL & BRASS I/O CLUSTER                           */}
      {/* ========================================================= */}
      <group name="top_panel" position={[0, expYTop, 0]}>
        {/* Main Chalk White Top Steel Sheet */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[W, 0.16, D]} />
          <meshStandardMaterial
            color={outerCoat}
            roughness={chassisRoughness}
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>

        {/* Top Recessed Ventilation Mesh (Rear 65% of top deck) */}
        <mesh position={[0, 0.085, -0.9]}>
          <boxGeometry args={[W - 0.8, 0.02, D - 3.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} metalness={0.25} />
        </mesh>

        {/* Faux Leather Pull Tab at the rear of top mesh */}
        <mesh position={[0, 0.12, -halfD + 0.5]}>
          <boxGeometry args={[0.5, 0.05, 0.35]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>

        {/* Front-Top I/O Strip with Brushed Brass Accents */}
        <group name="top_io_cluster" position={[0, 0.09, halfD - 0.6]}>
          {/* Power Button Outer Brass Collar Ring */}
          <mesh position={[-1.2, 0.01, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.04, 32]} />
            <meshStandardMaterial color={brassLip} roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Power Button Center Actuator */}
          <mesh position={[-1.2, 0.02, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.05, 32]} />
            <meshStandardMaterial color={brassColor} roughness={0.25} metalness={0.92} />
          </mesh>

          {/* Headphone / Mic 3.5mm Port */}
          <mesh position={[-0.4, 0.01, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
            <meshStandardMaterial color={brassColor} roughness={0.3} metalness={0.9} />
          </mesh>

          {/* Dual USB 3.0 Type-A Ports with Brass Chamfer Frame */}
          <mesh position={[0.3, 0.01, 0]}>
            <boxGeometry args={[0.42, 0.04, 0.18]} />
            <meshStandardMaterial color={brassColor} roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[0.9, 0.01, 0]}>
            <boxGeometry args={[0.42, 0.04, 0.18]} />
            <meshStandardMaterial color={brassColor} roughness={0.3} metalness={0.9} />
          </mesh>

          {/* USB 3.1 Type-C Port */}
          <mesh position={[1.5, 0.01, 0]}>
            <boxGeometry args={[0.26, 0.04, 0.12]} />
            <meshStandardMaterial color={brassColor} roughness={0.3} metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 4. MODULAR LEFT SIDE PANEL (Tempered Glass vs Mesh vs Open)*/}
      {/* ========================================================= */}
      {sidePanelMode !== 'open' && (
        <group name="left_side_panel" position={[expXLeft, 0, 0]}>
          {sidePanelMode === 'mesh' ? (
            /* Fine Perforated Steel Breathable Mesh Side Panel */
            <group name="mesh_side">
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.08, H - 0.2, D - 0.2]} />
                <meshStandardMaterial
                  color={outerCoat}
                  roughness={0.7}
                  metalness={0.2}
                  emissive={highlightEmissive}
                  emissiveIntensity={highlightIntensity}
                />
              </mesh>
            </group>
          ) : (
            /* High-Clarity Tempered Glass Panel */
            <group name="tempered_glass_side">
              {/* Architectural Glass Sheet */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.06, H - 0.2, D - 0.2]} />
                <meshPhysicalMaterial
                  color={isWhite ? "#eef2f6" : "#64748b"}
                  roughness={0.03}
                  metalness={0.05}
                  transmission={0.92}
                  transparent={true}
                  opacity={isWhite ? 0.25 : 0.32}
                  ior={1.52}
                  reflectivity={0.7}
                  clearcoat={1.0}
                  clearcoatRoughness={0.02}
                />
              </mesh>

              {/* Dark Silk-Screened Perimeter Frit Border (Real TG Feature) */}
              {/* Top border */}
              <mesh position={[-0.032, halfH - 0.25, 0]}>
                <boxGeometry args={[0.005, 0.3, D - 0.22]} />
                <meshStandardMaterial color="#1e2229" roughness={0.85} />
              </mesh>
              {/* Bottom border */}
              <mesh position={[-0.032, -halfH + 0.25, 0]}>
                <boxGeometry args={[0.005, 0.3, D - 0.22]} />
                <meshStandardMaterial color="#1e2229" roughness={0.85} />
              </mesh>
              {/* Front vertical border */}
              <mesh position={[-0.032, 0, halfD - 0.25]}>
                <boxGeometry args={[0.005, H - 0.22, 0.3]} />
                <meshStandardMaterial color="#1e2229" roughness={0.85} />
              </mesh>
              {/* Rear vertical border */}
              <mesh position={[-0.032, 0, -halfD + 0.25]}>
                <boxGeometry args={[0.005, H - 0.22, 0.3]} />
                <meshStandardMaterial color="#1e2229" roughness={0.85} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* ========================================================= */}
      {/* 5. SOLID RIGHT STEEL SIDE PANEL                           */}
      {/* ========================================================= */}
      <group name="right_side_panel" position={[expXRight, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.08, H - 0.2, D - 0.2]} />
          <meshStandardMaterial
            color={outerCoat}
            roughness={chassisRoughness}
            metalness={chassisMetalness}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 6. REAR I/O & EXPANSION PANEL                             */}
      {/* ========================================================= */}
      <group name="rear_panel" position={[0, 0, expZBack]}>
        {/* Main Rear Steel Plate */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[W, H - 0.2, 0.08]} />
          <meshStandardMaterial color={interiorCharcoal} roughness={0.8} metalness={0.5} />
        </mesh>

        {/* Motherboard Rear I/O Cutout */}
        <mesh position={[0.7, 1.8, 0.04]}>
          <boxGeometry args={[1.5, 2.3, 0.04]} />
          <meshStandardMaterial color="#0c0e12" roughness={0.9} />
        </mesh>

        {/* 120mm Rear Fan Honeycomb Exhaust Grille */}
        <mesh position={[-0.7, 1.8, 0.04]}>
          <cylinderGeometry args={[1.15, 1.15, 0.04, 24]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#0f1115" roughness={0.9} />
        </mesh>

        {/* 7x Bridged PCIe Expansion Brackets */}
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[0.3, -0.6 - i * 0.34, 0.04]}>
            <boxGeometry args={[2.5, 0.22, 0.04]} />
            <meshStandardMaterial color="#2d333f" metalness={0.6} roughness={0.5} />
          </mesh>
        ))}

        {/* ATX PSU Mounting Frame */}
        <mesh position={[0, -3.4, 0.04]}>
          <boxGeometry args={[3.2, 1.6, 0.04]} />
          <meshStandardMaterial color="#0c0e12" roughness={0.9} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 7. BOTTOM CHASSIS & TURNED BRUSHED BRASS ACCENT FEET      */}
      {/* ========================================================= */}
      <group name="bottom_chassis">
        {/* Bottom floor steel plate */}
        <mesh position={[0, -halfH + 0.08, 0]}>
          <boxGeometry args={[W - 0.1, 0.16, D - 0.2]} />
          <meshStandardMaterial color={interiorSteel} roughness={0.8} metalness={0.4} />
        </mesh>

        {/* PSU Intake Dust Filter (Bottom) */}
        <mesh position={[0, -halfH + 0.01, -1.8]}>
          <boxGeometry args={[3.0, 0.02, 3.8]} />
          <meshStandardMaterial color="#0f1115" roughness={0.95} />
        </mesh>

        {/* 4x Turned Brushed Brass Cylindrical Feet with Rubber Dampeners */}
        {[
          [-halfW + 0.45, -halfH - 0.22, halfD - 0.65],  // Front Left
          [halfW - 0.45, -halfH - 0.22, halfD - 0.65],   // Front Right
          [-halfW + 0.45, -halfH - 0.22, -halfD + 0.65], // Rear Left
          [halfW - 0.45, -halfH - 0.22, -halfD + 0.65],  // Rear Right
        ].map(([fx, fy, fz], idx) => (
          <group key={idx} position={[fx, fy, fz]}>
            {/* Upper Turned Brass Cylinder */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.28, 32]} />
              <meshStandardMaterial color={brassColor} roughness={0.25} metalness={0.92} />
            </mesh>
            {/* Micro Chamfer Accent Rim */}
            <mesh position={[0, 0.21, 0]}>
              <cylinderGeometry args={[0.34, 0.32, 0.04, 32]} />
              <meshStandardMaterial color={brassLip} roughness={0.2} metalness={0.95} />
            </mesh>
            {/* Lower Vibration Dampener Rubber Boot */}
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.1, 24]} />
              <meshStandardMaterial color="#111111" roughness={0.95} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
