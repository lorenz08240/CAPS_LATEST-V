import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedurally generates an authentic curved sickle aerofoil blade geometry
function createSickleBladeGeometry(hubR = 0.38, tipR = 1.14) {
  const shape = new THREE.Shape();
  const segments = 16;
  const sweepAngle = 0.54; // ~31 degrees aerodynamic backward sweep

  const span = tipR - hubR;
  const chordBase = span * 0.38;
  const chordTip = span * 0.54;

  // 1. Curved Leading Edge (smooth sickle arc curving from hub to outer tip)
  const leadPoints = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const r = hubR + span * t;
    // t^1.25 gives the characteristic aerodynamic sickle curvature seen on high-end PC fans
    const theta = Math.pow(t, 1.25) * sweepAngle;
    leadPoints.push([r * Math.cos(theta), r * Math.sin(theta)]);
  }

  // 2. Curved Trailing Edge (widening chord swept backwards)
  const trailPoints = [];
  for (let i = segments; i >= 0; i--) {
    const t = i / segments;
    const r = hubR + span * t;
    const chord = chordBase + (chordTip - chordBase) * t;
    const theta = Math.pow(t, 1.25) * sweepAngle - (chord / r);
    trailPoints.push([r * Math.cos(theta), r * Math.sin(theta)]);
  }

  // Construct closed perimeter
  shape.moveTo(leadPoints[0][0], leadPoints[0][1]);
  for (let i = 1; i < leadPoints.length; i++) {
    shape.lineTo(leadPoints[i][0], leadPoints[i][1]);
  }
  for (let i = 0; i < trailPoints.length; i++) {
    shape.lineTo(trailPoints[i][0], trailPoints[i][1]);
  }
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.007,
    bevelThickness: 0.007
  });
}

/**
 * ProceduralSickleFan
 * Ultra-detailed PC Cooling Fan matching modular Lian-Li Uni Fan aesthetics:
 * - Square modular frame with corner rubber vibration pads and screw mountings
 * - Aerodynamic sickle swept blades with true radial symmetry and angle-of-attack pitch
 * - Precision cylindrical inner tunnel with uniform tip clearance
 * - Chrome-accented motor hub with glowing center emblem
 * - Side LED diffuser lightbars
 */
export default function ProceduralSickleFan({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  rgbColor = '#00e5ff',
  speed = 7,
  size = 2.45,
  radius = 1.15,
  hubRadius = 0.40,
  numBlades = 7,
  showFrame = true,
  isExhaust = false
}) {
  const rotorRef = useRef();

  // Smooth continuous rotation in the aerodynamic forward direction
  useFrame((_, delta) => {
    if (rotorRef.current) {
      // Counter-clockwise forward aerodynamic stroke
      const dir = isExhaust ? -1 : 1;
      rotorRef.current.rotation.z += delta * speed * dir;
    }
  });

  // Memoize geometry so it is instantiated only once per size
  const bladeGeometry = useMemo(() => {
    return createSickleBladeGeometry(hubRadius, radius);
  }, [hubRadius, radius]);

  const cornerOffset = (size / 2) - 0.22;
  const frameDepth = 0.32;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* ── 1. MODULAR SQUARE HOUSING / FRAME ── */}
      {showFrame && (
        <group>
          {/* Inner Circular Tunnel Bore (Blades spin inside this tunnel) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[radius + 0.03, radius + 0.03, frameDepth, 36, 1, true]} />
            <meshStandardMaterial color="#1a202c" roughness={0.7} metalness={0.4} />
          </mesh>

          {/* Glowing Inner Halo Diffuser Ring */}
          <mesh position={[0, 0, frameDepth / 2 - 0.02]}>
            <torusGeometry args={[radius + 0.015, 0.035, 16, 36]} />
            <meshStandardMaterial 
              color={rgbColor} 
              emissive={rgbColor} 
              emissiveIntensity={3.2} 
            />
          </mesh>

          {/* 4 Outer Edge Enclosure Bars */}
          {/* Top & Bottom Bars */}
          {[-1, 1].map((sign) => (
            <mesh key={`h-bar-${sign}`} position={[0, sign * (size / 2 - 0.08), 0]}>
              <boxGeometry args={[size - 0.4, 0.16, frameDepth]} />
              <meshStandardMaterial color="#1e293b" roughness={0.65} metalness={0.5} />
            </mesh>
          ))}
          {/* Left & Right Bars */}
          {[-1, 1].map((sign) => (
            <mesh key={`v-bar-${sign}`} position={[sign * (size / 2 - 0.08), 0, 0]}>
              <boxGeometry args={[0.16, size - 0.4, frameDepth]} />
              <meshStandardMaterial color="#1e293b" roughness={0.65} metalness={0.5} />
            </mesh>
          ))}

          {/* 4 Interlocking Corner Mounting Tabs with Rubber Pads & Screw Holes */}
          {[
            [-cornerOffset, cornerOffset],
            [cornerOffset, cornerOffset],
            [-cornerOffset, -cornerOffset],
            [cornerOffset, -cornerOffset]
          ].map(([cx, cy], idx) => (
            <group key={`corner-${idx}`} position={[cx, cy, 0]}>
              {/* Outer Corner Block */}
              <mesh>
                <boxGeometry args={[0.42, 0.42, frameDepth]} />
                <meshStandardMaterial color="#0f172a" roughness={0.8} />
              </mesh>
              {/* Anti-Vibration Dark Silicone Corner Damper Pad */}
              <mesh position={[0, 0, frameDepth / 2 + 0.005]}>
                <boxGeometry args={[0.34, 0.34, 0.02]} />
                <meshStandardMaterial color="#111827" roughness={0.95} />
              </mesh>
              {/* Recessed Metal Screw Mounting Eyelet */}
              <mesh position={[0, 0, frameDepth / 2 + 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
                <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ))}

          {/* Side Outer LED Diffuser Lightbars (Lian Li Uni Fan aesthetic) */}
          <mesh position={[-size / 2 - 0.005, 0, 0]}>
            <boxGeometry args={[0.02, size * 0.72, 0.09]} />
            <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3.6} />
          </mesh>
          <mesh position={[size / 2 + 0.005, 0, 0]}>
            <boxGeometry args={[0.02, size * 0.72, 0.09]} />
            <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3.6} />
          </mesh>

          {/* 4 Rear Stator Support Struts (Aerodynamic Support Vanes at the Back) */}
          {[0.785, 2.356, 3.927, 5.498].map((vAngle, vIdx) => (
            <group key={`vane-${vIdx}`} position={[0, 0, -frameDepth / 2 + 0.02]} rotation={[0, 0, vAngle]}>
              <mesh position={[(radius + hubRadius) / 2, 0, 0]}>
                <boxGeometry args={[radius - hubRadius + 0.04, 0.04, 0.02]} />
                <meshStandardMaterial color="#0f172a" roughness={0.85} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ── 2. SPINNING ROTOR & SICKLE BLADE ASSEMBLY ── */}
      <group ref={rotorRef}>
        {/* Center Motor Hub Body */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[hubRadius, hubRadius, 0.24, 32]} />
          <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Diamond-Cut Chrome Outer Chamfer Ring on Hub Face */}
        <mesh position={[0, 0, 0.125]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[hubRadius, hubRadius, 0.02, 32]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.08} />
        </mesh>

        {/* Center Illuminated RGB Emblem Disc */}
        <mesh position={[0, 0, 0.136]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[hubRadius * 0.62, hubRadius * 0.62, 0.015, 32]} />
          <meshStandardMaterial 
            color={rgbColor} 
            emissive={rgbColor} 
            emissiveIntensity={3.8} 
            roughness={0.15}
          />
        </mesh>

        {/* 7 Swept Sickle Aerofoil Blades with 100% Exact Radial Symmetry */}
        {Array.from({ length: numBlades }).map((_, i) => {
          const bladeAngle = (i * Math.PI * 2) / numBlades;
          return (
            <group key={`blade-${i}`} rotation={[0, 0, bladeAngle]}>
              {/* Pitch Angle of Attack (tilted around radial span to scoop and accelerate air) */}
              <group position={[0, 0, -0.01]} rotation={[-0.38, 0, 0]}>
                <mesh geometry={bladeGeometry}>
                  <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.18}
                    metalness={0.06}
                    transparent
                    opacity={0.92}
                    emissive={rgbColor}
                    emissiveIntensity={0.5}
                  />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
}
