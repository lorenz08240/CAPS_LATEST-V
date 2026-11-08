import React, { useRef, Suspense, useMemo, useState, useEffect, Component } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { PSU_MODEL_URL } from '../../utilities/modelPreloader';

/**
 * Procedural Fallback ATX Power Supply
 * Used while GLTF parses, during initial hydration, or in error states.
 */
export function ProceduralPSUFallback({ rgbColor = '#00e5ff', isSelected = false }) {
  return (
    <group>
      {/* Main PSU Box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.72, 1.52, 2.62]} />
        <meshStandardMaterial 
          color="#1e2229" 
          roughness={0.4} 
          metalness={0.7} 
          emissive={isSelected ? '#00e5ff' : '#000000'}
          emissiveIntensity={isSelected ? 0.8 : 0}
        />
      </mesh>
      {/* Rear Honeycomb Vent */}
      <mesh position={[0, 0, 1.32]}>
        <boxGeometry args={[2.5, 1.35, 0.02]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} wireframe />
      </mesh>
      {/* AC Socket */}
      <mesh position={[0.7, -0.2, 1.33]}>
        <boxGeometry args={[0.55, 0.38, 0.05]} />
        <meshStandardMaterial color="#090d16" roughness={0.9} />
      </mesh>
      {/* Rocker Switch */}
      <mesh position={[-0.7, -0.2, 1.33]}>
        <boxGeometry args={[0.28, 0.38, 0.06]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
      </mesh>
      {/* Fan Intake Grill (Top) */}
      <mesh position={[0, 0.77, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 1.15, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      {/* Side Badge */}
      <mesh position={[1.37, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.8, 0.8, 0.01]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Error boundary for safe 3D mesh rendering
 */
export class PSUErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('PSU GLTF load warning, falling back to procedural model:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

/**
 * High-Detail ATX Modular Power Supply Mesh
 * Loaded from Basic_PSU.glb with exact bounding-box centering,
 * PBR metallic chassis, spinning 135mm fan, illuminated rocker switch,
 * 80-Plus Gold / Titanium spec plate, and modular cable harnesses.
 */
function PSUModelMesh({
  rgbColor = '#00e5ff',
  isSelected = false,
  isHovered = false,
  enableHighlight = true,
  isMounted = false,
  isStandalone = false
}) {
  const { scene } = useGLTF(PSU_MODEL_URL);
  const fanRef = useRef();

  // Exact raw model center offset: size is (3.206, 1.787, 3.076), raw center is (0.6028, -0.1066, -0.4272)
  const CENTER_OFFSET = useMemo(() => [-0.6028, 0.1066, 0.4272], []);

  // Clone scene and apply premium PBR materials to individual meshes
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const name = child.name;

        // 1. Main Chassis Frame — Powder-coated deep obsidian titanium finish
        // We filter out the occluding flat roof triangles covering the fan well,
        // revealing the full high-detail 3D aerofoil fan rotor beneath!
        if (name === 'Object_4') {
          const geom = child.geometry.clone();
          const pos = geom.attributes.position;
          const index = geom.index;

          if (pos && index) {
            const newIndices = [];
            for (let i = 0; i < index.count; i += 3) {
              const a = index.getX(i);
              const b = index.getX(i + 1);
              const c = index.getX(i + 2);

              const yA = pos.getY(a), yB = pos.getY(b), yC = pos.getY(c);

              // Top face occluding plate check
              if (yA > 0.75 && yB > 0.75 && yC > 0.75) {
                const distA = Math.hypot(pos.getX(a) - 0.344, pos.getZ(a) - (-0.448));
                const distB = Math.hypot(pos.getX(b) - 0.344, pos.getZ(b) - (-0.448));
                const distC = Math.hypot(pos.getX(c) - 0.344, pos.getZ(c) - (-0.448));
                if (distA < 1.25 && distB < 1.25 && distC < 1.25) {
                  continue; // Filter out flat occluding cap!
                }
              }
              newIndices.push(a, b, c);
            }
            geom.setIndex(newIndices);
            geom.computeVertexNormals();
            child.geometry = geom;
          }

          child.material = new THREE.MeshStandardMaterial({
            color: '#181d26',
            metalness: 0.58,
            roughness: 0.42,
            envMapIntensity: 1.1
          });
        }
        // 2. Power Port (C14 AC Inlet Socket)
        else if (name === 'Object_6') {
          child.material = new THREE.MeshStandardMaterial({
            color: '#080a10',
            metalness: 0.15,
            roughness: 0.85
          });
        }
        // 3. Power Rocker Switch (Red neon illuminated)
        else if (name === 'Object_8') {
          child.material = new THREE.MeshStandardMaterial({
            color: '#ef4444',
            emissive: '#dc2626',
            emissiveIntensity: 1.6,
            roughness: 0.25,
            metalness: 0.2
          });
        }
        // 4. Cooling Fan (135mm Aerofoil Rotor) — Sleek dark slate aerofoil blades
        else if (name === 'Object_10') {
          child.material = new THREE.MeshStandardMaterial({
            color: '#334155',
            metalness: 0.62,
            roughness: 0.32,
            envMapIntensity: 1.3
          });
        }
        // 5. Vent Cover (Honeycomb Laser-Cut Steel Grill)
        else if (name === 'Object_12') {
          child.material = new THREE.MeshStandardMaterial({
            color: '#3f4756',
            metalness: 0.88,
            roughness: 0.22
          });
        }
        // 6. Modular Ports Block
        else if (name === 'Object_14') {
          child.material = new THREE.MeshStandardMaterial({
            color: '#0a0d14',
            metalness: 0.35,
            roughness: 0.65
          });
        }
        // 7. Internal Capacitor Cylinders
        else if (name === 'Object_16') {
          child.material = new THREE.MeshStandardMaterial({
            color: '#b45309',
            metalness: 0.95,
            roughness: 0.18
          });
        }
      }
    });

    return clone;
  }, [scene]);

  // Locate the fan mesh inside cloned scene for continuous rotation
  useEffect(() => {
    if (!clonedScene) return;
    const fan = clonedScene.getObjectByName('Object_10');
    if (fan) {
      fanRef.current = fan;
    }
  }, [clonedScene]);

  // Continuous realistic 135mm fan rotation in useFrame
  useFrame((_, delta) => {
    if (fanRef.current) {
      fanRef.current.rotation.y += delta * 6.5;
    }
  });

  const effectiveHover = enableHighlight && isHovered;
  const activeSelected = enableHighlight && isSelected;
  const accentColor = activeSelected ? '#facc15' : effectiveHover ? '#38bdf8' : rgbColor;

  return (
    <group dispose={null}>
      {/* Centered GLTF Scene Wrapper */}
      <group position={CENTER_OFFSET}>
        <primitive object={clonedScene} />
      </group>

      {/* Dynamic ARGB Ring & Illumination under the Top 135mm Intake Fan */}
      <group position={[-0.26, 0.70, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.36, 1.14, 36]} />
          <meshBasicMaterial 
            color={accentColor} 
            transparent 
            opacity={activeSelected ? 0.8 : effectiveHover ? 0.65 : 0.42} 
            side={THREE.DoubleSide} 
          />
        </mesh>
        <pointLight 
          color={accentColor} 
          intensity={activeSelected ? 2.5 : 1.4} 
          distance={3.2} 
          decay={2} 
        />
      </group>

      {/* Concentric Laser-Cut Fan Grille & Premium Center Hub Badge */}
      <group position={[-0.26, 0.896, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Outer Circular Bezel */}
        <mesh>
          <ringGeometry args={[1.18, 1.25, 48]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Concentric Wire Rings */}
        {[0.98, 0.78, 0.58, 0.40].map((radius, rIdx) => (
          <mesh key={`grill-ring-${rIdx}`}>
            <ringGeometry args={[radius - 0.022, radius + 0.022, 48]} />
            <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.18} />
          </mesh>
        ))}
        {/* 4 Radial Cross-Spokes */}
        {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((ang, sIdx) => (
          <mesh key={`spoke-${sIdx}`} rotation={[0, 0, ang]}>
            <boxGeometry args={[0.04, 2.36, 0.015]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {/* Center Metallic Hub Plaque */}
        <mesh position={[0, 0, 0.012]}>
          <circleGeometry args={[0.30, 36]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.018]}>
          <ringGeometry args={[0.22, 0.28, 36]} />
          <meshStandardMaterial color="#facc15" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>

      {/* Side Specification Badge & 80-Plus Gold Emblem (Visible on left/right sides) */}
      {[1.61, -1.61].map((xPos, idx) => (
        <group 
          key={`side-badge-${idx}`} 
          position={[xPos, 0, 0]} 
          rotation={[0, idx === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          {/* Badge Backplate */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.1, 0.95, 0.015]} />
            <meshStandardMaterial 
              color="#0f172a" 
              metalness={0.92} 
              roughness={0.25} 
            />
          </mesh>

          {/* 80-Plus Gold Emblem Plate */}
          <mesh position={[-0.68, 0, 0.012]}>
            <boxGeometry args={[0.52, 0.62, 0.01]} />
            <meshStandardMaterial 
              color="#facc15" 
              metalness={0.95} 
              roughness={0.15} 
            />
          </mesh>
          <mesh position={[-0.68, 0, 0.018]}>
            <boxGeometry args={[0.44, 0.54, 0.01]} />
            <meshStandardMaterial 
              color="#1e293b" 
              metalness={0.8} 
              roughness={0.3} 
            />
          </mesh>
          <mesh position={[-0.68, 0, 0.024]}>
            <boxGeometry args={[0.34, 0.12, 0.005]} />
            <meshStandardMaterial 
              color="#facc15" 
              metalness={0.95} 
              roughness={0.15} 
            />
          </mesh>

          {/* Specs Plate Text Details Simulation */}
          <mesh position={[0.26, 0.2, 0.012]}>
            <boxGeometry args={[1.15, 0.16, 0.008]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.3} 
              roughness={0.4} 
            />
          </mesh>
          <mesh position={[0.26, -0.02, 0.012]}>
            <boxGeometry args={[1.15, 0.12, 0.008]} />
            <meshStandardMaterial 
              color="#94a3b8" 
              metalness={0.5} 
              roughness={0.5} 
            />
          </mesh>
          <mesh position={[0.26, -0.22, 0.012]}>
            <boxGeometry args={[1.15, 0.12, 0.008]} />
            <meshStandardMaterial 
              color="#64748b" 
              metalness={0.6} 
              roughness={0.5} 
            />
          </mesh>

          {/* Glowing Aura Accent Stripe along top of badge */}
          <mesh position={[0, 0.44, 0.015]}>
            <boxGeometry args={[2.05, 0.035, 0.01]} />
            <meshStandardMaterial 
              color={accentColor} 
              emissive={accentColor} 
              emissiveIntensity={activeSelected ? 3.5 : effectiveHover ? 2.5 : 1.8} 
            />
          </mesh>
        </group>
      ))}

      {/* Modular Sleeved Cable Harnesses (Curving forward from modular ports when mounted in case) */}
      {isMounted && (
        <group position={[0, -0.05, -1.6]}>
          {/* Main 24-Pin ATX Braided Cable Bundle */}
          <mesh position={[-0.55, 0.12, -0.55]} rotation={[0.35, 0.2, 0]}>
            <cylinderGeometry args={[0.22, 0.24, 1.2, 24]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
          {/* Cable Comb 1 */}
          <mesh position={[-0.55, 0.18, -0.65]} rotation={[0.35, 0.2, 0]}>
            <boxGeometry args={[0.48, 0.08, 0.28]} />
            <meshStandardMaterial color="#0b0f19" roughness={0.7} metalness={0.2} />
          </mesh>

          {/* Dual 8-Pin PCIe Power Cables */}
          <mesh position={[0.25, -0.08, -0.5]} rotation={[0.25, -0.15, 0]}>
            <cylinderGeometry args={[0.16, 0.17, 1.1, 20]} />
            <meshStandardMaterial color="#181c24" roughness={0.92} />
          </mesh>
          <mesh position={[0.65, -0.08, -0.48]} rotation={[0.22, -0.25, 0]}>
            <cylinderGeometry args={[0.15, 0.16, 1.05, 20]} />
            <meshStandardMaterial color="#181c24" roughness={0.92} />
          </mesh>
        </group>
      )}

      {/* Selection / Hover Holographic Bounding Rings */}
      {enableHighlight && (activeSelected || effectiveHover) && (
        <group>
          {/* Wireframe Highlight Box */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[3.26, 1.84, 3.14]} />
            <meshBasicMaterial 
              color={activeSelected ? '#00e5ff' : '#facc15'} 
              wireframe 
              transparent 
              opacity={activeSelected ? 0.65 : 0.35} 
            />
          </mesh>
          {/* Ground Aura Ring */}
          <mesh position={[0, -0.92, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.7, 1.9, 48]} />
            <meshBasicMaterial 
              color={activeSelected ? '#00e5ff' : '#facc15'} 
              transparent 
              opacity={0.7} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Main PSUModel Component
 * Supports mounted mode (inside PC case) and standalone mode (Hero showcase)
 */
export default function PSUModel({
  rgbColor = '#00e5ff',
  isSelected = false,
  isHovered = false,
  enableHighlight = true,
  isMounted = false,
  isStandalone = false,
  scale = 1
}) {
  const groupRef = useRef();

  // In mounted mode:
  // - Raw model rear (+Z) needs to face world -Z (towards case rear cutout).
  // - Therefore, rotation is [0, Math.PI, 0].
  // - Target dimensions: ~2.72 width x 1.52 height x 2.61 depth (scale = 0.85).
  // In standalone mode:
  // - Slight dynamic tilt so top fan, side branding, and modular ports are all displayed.
  const mountedScale = 0.85 * scale;
  const standaloneScale = 0.88 * scale;

  return (
    <group ref={groupRef}>
      <PSUErrorBoundary fallback={<ProceduralPSUFallback rgbColor={rgbColor} isSelected={isSelected} />}>
        <Suspense fallback={<ProceduralPSUFallback rgbColor={rgbColor} isSelected={isSelected} />}>
          {isMounted ? (
            <group 
              rotation={[0, Math.PI, 0]} 
              scale={[mountedScale, mountedScale, mountedScale]}
            >
              <PSUModelMesh
                rgbColor={rgbColor}
                isSelected={isSelected}
                isHovered={isHovered}
                enableHighlight={enableHighlight}
                isMounted={true}
                isStandalone={false}
              />
            </group>
          ) : isStandalone ? (
            <group 
              rotation={[-0.52, -0.58, 0.08]} 
              scale={[standaloneScale, standaloneScale, standaloneScale]}
            >
              <PSUModelMesh
                rgbColor={rgbColor}
                isSelected={isSelected}
                isHovered={isHovered}
                enableHighlight={enableHighlight}
                isMounted={false}
                isStandalone={true}
              />
            </group>
          ) : (
            <group scale={[scale, scale, scale]}>
              <PSUModelMesh
                rgbColor={rgbColor}
                isSelected={isSelected}
                isHovered={isHovered}
                enableHighlight={enableHighlight}
                isMounted={false}
                isStandalone={false}
              />
            </group>
          )}
        </Suspense>
      </PSUErrorBoundary>
    </group>
  );
}

/**
 * Dedicated Hero Section Floating PSU Showcase Component
 */
export function HeroFloatingPSU({ rgbColor = '#00e5ff', enableHighlight = false }) {
  const groupRef = useRef();

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      <PSUModel
        rgbColor={rgbColor}
        isSelected={false}
        isHovered={false}
        enableHighlight={enableHighlight}
        isStandalone={true}
      />
    </group>
  );
}
