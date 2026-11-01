import React, { useRef, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const GLB_URL = '/assets/models/random_access_memory_ram_ddr4.glb';

/**
 * Preload model so it is immediately cached
 */
try {
  useGLTF.preload(GLB_URL);
} catch (e) {
  console.warn('Preload notice:', e);
}

/**
 * Fallback procedural RAM stick used while GLTF parses
 */
function ProceduralRAMFallback({ rgbColor = '#f43f5e' }) {
  return (
    <group>
      {/* PCB substrate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.6, 0.08, 0.9]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      {/* Heatspreader plate */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3.5, 0.04, 0.85]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* RGB Diffuser bar */}
      <mesh position={[0, 0.06, 0.42]}>
        <boxGeometry args={[3.4, 0.06, 0.08]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3.2} />
      </mesh>
      {/* Gold pins */}
      <mesh position={[0, 0, -0.44]}>
        <boxGeometry args={[3.4, 0.02, 0.08]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
}

/**
 * Photorealistic DDR4 RAM Stick loaded from user-supplied Sketchfab GLB
 */
function DDR4StickMesh({ rgbColor = '#f43f5e', isSelected = false, isHovered = false, enableHighlight = true }) {
  const { nodes, materials } = useGLTF(GLB_URL);

  return (
    <group dispose={null}>
      {/* Centered GLTF Node Tree */}
      <group position={[0, 0, -0.3]}>
        {/* Detail Pins & Clips Mesh */}
        {nodes['Object003_Material_#20_0'] && (
          <group position={[0, -0.095, 0]} rotation={[Math.PI / 2, 0, -Math.PI]}>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes['Object003_Material_#20_0'].geometry}
              material={materials.Material_20}
              position={[0, -0.158, -0.019]}
            />
          </group>
        )}

        {/* Main DDR4 Heatspreader & Integrated PCB */}
        {nodes['RAM_LP_Material_#21_0'] && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes['RAM_LP_Material_#21_0'].geometry}
            material={materials.Material_21}
            position={[0, -0.085, 0.304]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        )}

        {/* Cyber RGB Diffuser Top Accent Strip */}
        <mesh position={[0, 0.03, 1.14]} rotation={[0, 0, 0]}>
          <boxGeometry args={[6.8, 0.12, 0.1]} />
          <meshStandardMaterial
            color={rgbColor}
            emissive={rgbColor}
            emissiveIntensity={3.4}
            roughness={0.15}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Selection / Hover Glow Accent Edge (Only when highlights are enabled) */}
        {enableHighlight && (isSelected || isHovered) && (
          <mesh position={[0, 0, 0.3]}>
            <boxGeometry args={[7.25, 0.22, 1.8]} />
            <meshBasicMaterial
              color={isSelected ? '#00e5ff' : '#facc15'}
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

/**
 * Single DDR4 Stick with Suspense Guard
 */
export function SingleDDR4RAM({ 
  scale = 1, 
  rgbColor = '#f43f5e', 
  isSelected = false, 
  isHovered = false, 
  enableHighlight = true,
  ...props 
}) {
  return (
    <group {...props} scale={[scale, scale, scale]}>
      <Suspense fallback={<ProceduralRAMFallback rgbColor={rgbColor} />}>
        <DDR4StickMesh 
          rgbColor={rgbColor} 
          isSelected={isSelected} 
          isHovered={isHovered} 
          enableHighlight={enableHighlight}
        />
      </Suspense>
    </group>
  );
}

/**
 * Motherboard DIMM Slots RAM Kit (Supports Option A: 2 Sticks Dual Channel & Option B: 4 Sticks All Slots)
 * Properly oriented vertically along Y, seated flush inside DIMM sockets with heatspreader facing outward.
 */
export function MotherboardDDR4Kit({ 
  part,
  rgbColor = '#f43f5e', 
  isSelected = false, 
  isHovered = false,
  enableHighlight = true,
  stickCount
}) {
  // DIMM slot is vertical along Y with height 2.4.
  // RAM stick raw length is 7.2 along X, height is 1.68 along Z, thickness is ~0.1 along Y.
  // Euler rotation [-Math.PI/2, -Math.PI/2, 0] precisely maps:
  // - Model Length 7.2 -> World Vertical Y (2.3 units with 0.32 scale, fitting perfectly inside 2.4 slot)
  // - Model Height 1.68 -> World -X (pointing outward from motherboard towards glass side panel)
  // - Model Pins -> World +X (inserted flush into motherboard DIMM socket)
  // - Model Thickness -> World Z (matching narrow DIMM channel)
  const stickScale = 0.32;

  // Motherboard has 4 slots at relative Z:
  // Slot 1 (A1): -0.4
  // Slot 2 (A2): -0.2 (Primary Dual Channel)
  // Slot 3 (B1):  0.0
  // Slot 4 (B2): +0.2 (Secondary Dual Channel)
  //
  // Option A (Default for 2 sticks): Dual-channel installation into Slots 2 and 4 (A2 & B2)
  //   as recommended by motherboard manufacturers and shown in reference image.
  // Option B: 4 sticks installed across all 4 slots (Slots 1, 2, 3, and 4).
  const partName = (part?.name || '').toLowerCase();
  const isQuad = stickCount === 4 || 
                 partName.includes('4x') || 
                 partName.includes('quad') || 
                 (part?.sticks === 4);

  const slotOffsets = isQuad 
    ? [-0.4, -0.2, 0.0, 0.2]   // Option B: 4 sticks in all 4 slots
    : [-0.2, 0.2];             // Option A: 2 sticks in dual channel slots 2 and 4

  return (
    <group>
      {slotOffsets.map((zOff, idx) => (
        <group
          key={idx}
          position={[-0.14, 0, zOff]}
          rotation={[-Math.PI / 2, -Math.PI / 2, 0]}
        >
          <SingleDDR4RAM
            scale={stickScale}
            rgbColor={rgbColor}
            isSelected={isSelected}
            isHovered={isHovered}
            enableHighlight={enableHighlight}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Showcase Hero Floating DDR4 Kit (Dual Staggered Modules for Home Hero)
 */
export function HeroFloatingRAM({ rgbColor = '#f43f5e', enableHighlight = false }) {
  const groupRef = useRef();

  return (
    <group ref={groupRef} scale={[0.55, 0.55, 0.55]}>
      {/* Front Module */}
      <group position={[0, -0.2, 0.45]} rotation={[-0.15, 0.25, 0]}>
        <SingleDDR4RAM
          scale={1}
          rgbColor={rgbColor}
          isSelected={false}
          isHovered={false}
          enableHighlight={enableHighlight}
        />
      </group>

      {/* Rear Module (Staggered elevation for depth and perspective) */}
      <group position={[0.2, 0.35, -0.45]} rotation={[-0.15, 0.25, 0]}>
        <SingleDDR4RAM
          scale={1}
          rgbColor={rgbColor}
          isSelected={false}
          isHovered={false}
          enableHighlight={enableHighlight}
        />
      </group>
    </group>
  );
}

export default SingleDDR4RAM;
