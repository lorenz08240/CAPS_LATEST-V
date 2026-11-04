import React, { useRef, Suspense, Component } from 'react';
import { useGLTF } from '@react-three/drei';
import { RAM_MODEL_URL } from '../../utilities/modelPreloader';

/**
 * Fallback procedural RAM stick used while GLTF parses
 */
export function ProceduralRAMFallback({ rgbColor = '#f43f5e' }) {
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
 * Robust Error Boundary for RAM 3D mesh rendering
 */
export class RAMModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('RAM GLTF load warning, falling back to procedural model:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

/**
 * Photorealistic DDR4 RAM Stick loaded from user-supplied Sketchfab GLB
 */
function DDR4StickMesh({ rgbColor = '#f43f5e', isSelected = false, isHovered = false, enableHighlight = true }) {
  const { nodes, materials } = useGLTF(RAM_MODEL_URL);

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
 * Single DDR4 Stick with Suspense Guard & Error Boundary
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
      <RAMModelErrorBoundary fallback={<ProceduralRAMFallback rgbColor={rgbColor} />}>
        <Suspense fallback={<ProceduralRAMFallback rgbColor={rgbColor} />}>
          <DDR4StickMesh 
            rgbColor={rgbColor} 
            isSelected={isSelected} 
            isHovered={isHovered} 
            enableHighlight={enableHighlight}
          />
        </Suspense>
      </RAMModelErrorBoundary>
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
  const stickScale = 0.32;

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
