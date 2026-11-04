import React, { useRef, Suspense, useMemo, useState, useEffect, Component } from 'react';
import { useGLTF } from '@react-three/drei';
import { SSD_MODEL_URL } from '../../utilities/modelPreloader';

/**
 * Fallback procedural M.2 NVMe SSD stick used while GLTF parses or on low-end hardware
 */
export function ProceduralSSDFallback({ rgbColor = '#f43f5e' }) {
  return (
    <group>
      {/* Matte black PCB substrate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.9, 0.96, 0.08]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Aluminum heatsink / label plate */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.8, 0.88, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Precision controller chip */}
      <mesh position={[0.2, 0, 0.085]}>
        <boxGeometry args={[0.35, 0.35, 0.02]} />
        <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* NAND flash memory modules */}
      {[-0.45, -0.1].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.085]}>
          <boxGeometry args={[0.3, 0.6, 0.02]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* RGB Tracer line */}
      <mesh position={[0, 0.44, 0.08]}>
        <boxGeometry args={[1.7, 0.04, 0.02]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2.5} />
      </mesh>
      {/* Golden M.2 connector edge */}
      <mesh position={[-0.92, 0, 0]}>
        <boxGeometry args={[0.08, 0.8, 0.04]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
}

/**
 * Internal Error Boundary for GLTF 3D mesh rendering
 */
export class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('3D GLTF load warning, falling back to procedural model:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

/**
 * High-fidelity M.2 NVMe SSD loaded from user-supplied GLB
 */
function NVMeSSDMesh({ 
  rgbColor = '#f43f5e', 
  isSelected = false, 
  isHovered = false, 
  enableHighlight = true 
}) {
  const { scene } = useGLTF(SSD_MODEL_URL);

  // Pure memoized clone and material tuning (no external variable mutation)
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = Math.min(child.material.roughness ?? 0.5, 0.85);
          child.material.metalness = Math.max(child.material.metalness ?? 0.25, 0.35);
        }
      }
    });
    return clone;
  }, [scene]);

  return (
    <group dispose={null}>
      {/* Centered GLTF Model */}
      <primitive object={clonedScene} />

      {/* Cyber RGB Accent Edge Strip */}
      <mesh position={[0, 0.46, 0.08]}>
        <boxGeometry args={[1.82, 0.035, 0.02]} />
        <meshStandardMaterial
          color={rgbColor}
          emissive={rgbColor}
          emissiveIntensity={2.8}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Selection / Hover Glow Accent (Rendered only when highlighted) */}
      {enableHighlight && (isSelected || isHovered) && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.0, 1.05, 0.3]} />
          <meshBasicMaterial
            color={isSelected ? '#00e5ff' : '#facc15'}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Progressive Async Loader Component for the heavy SSD Model
 */
function AsyncSSDLoader({
  rgbColor = '#f43f5e',
  isSelected = false,
  isHovered = false,
  enableHighlight = true,
  lazy = true
}) {
  // If lazy is enabled, immediately show procedural fallback and defer GLB mount
  const [canLoadGLTF, setCanLoadGLTF] = useState(!lazy);

  useEffect(() => {
    if (!lazy) return;

    let cancelled = false;
    // Schedule GLTF loading during idle time to eliminate main-thread freeze
    const scheduleLoad = () => {
      if (!cancelled) setCanLoadGLTF(true);
    };

    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(scheduleLoad, { timeout: 800 });
      return () => {
        cancelled = true;
        if (window.cancelIdleCallback) window.cancelIdleCallback(handle);
      };
    } else {
      const handle = setTimeout(scheduleLoad, 150);
      return () => {
        cancelled = true;
        clearTimeout(handle);
      };
    }
  }, [lazy]);

  if (!canLoadGLTF) {
    return <ProceduralSSDFallback rgbColor={rgbColor} />;
  }

  return (
    <ModelErrorBoundary fallback={<ProceduralSSDFallback rgbColor={rgbColor} />}>
      <Suspense fallback={<ProceduralSSDFallback rgbColor={rgbColor} />}>
        <NVMeSSDMesh
          rgbColor={rgbColor}
          isSelected={isSelected}
          isHovered={isHovered}
          enableHighlight={enableHighlight}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
}

/**
 * Standalone M.2 NVMe SSD with Progressive Lazy Loading
 */
export function SingleNVMeSSD({ 
  scale = 1, 
  rgbColor = '#f43f5e', 
  isSelected = false, 
  isHovered = false, 
  enableHighlight = true,
  lazy = true,
  ...props 
}) {
  return (
    <group {...props} scale={[scale, scale, scale]}>
      <AsyncSSDLoader
        rgbColor={rgbColor}
        isSelected={isSelected}
        isHovered={isHovered}
        enableHighlight={enableHighlight}
        lazy={lazy}
      />
    </group>
  );
}

/**
 * Motherboard-Mounted M.2 NVMe SSD
 * Oriented along the motherboard slot (between CPU socket and PCIe GPU slot).
 */
export function MotherboardNVMeSSD({
  rgbColor = '#f43f5e',
  isSelected = false,
  isHovered = false,
  enableHighlight = true,
  lazy = true
}) {
  return (
    <group 
      position={[-0.035, 0, 0]} 
      rotation={[0, Math.PI / 2, 0]}
      scale={[0.92, 0.44, 0.7]}
    >
      <SingleNVMeSSD
        rgbColor={rgbColor}
        isSelected={isSelected}
        isHovered={isHovered}
        enableHighlight={enableHighlight}
        lazy={lazy}
      />
    </group>
  );
}

/**
 * Showcase Hero Floating M.2 NVMe SSD (Optimized for Home3DHero turntable display)
 */
export function HeroFloatingSSD({ rgbColor = '#f43f5e', enableHighlight = false, lazy = true }) {
  const groupRef = useRef();

  return (
    <group ref={groupRef} scale={[1.8, 1.8, 1.8]} rotation={[0.2, 0.4, -0.1]}>
      <SingleNVMeSSD
        rgbColor={rgbColor}
        isSelected={false}
        isHovered={false}
        enableHighlight={enableHighlight}
        lazy={lazy}
      />
    </group>
  );
}

export default SingleNVMeSSD;
