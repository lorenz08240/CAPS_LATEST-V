import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * DeepCoolLE240Cooler - High-Fidelity Architectural 3D 240mm AIO Liquid Cooler
 * Modeled after DeepCool LE240 V2 ZERO DARK Edition.
 *
 * Real AIO Proportions & Layout:
 * 1. 240mm Dual-Fan Aluminum Radiator (282mm x 120mm x 27mm):
 *    - Deep matte black powder-coated aluminum shroud
 *    - Micro-channel corrugated cooling fins visible through front & rear
 *    - Dual 120mm high-static pressure fans mounted directly on the radiator with custom blade curves
 *    - Anti-leak pressure relief valve on the end tank
 * 2. CPU Waterblock / Pump:
 *    - Low-profile cylindrical pump with stepped faceted bezel
 *    - Genuine specular dark mirror infinity face with illuminated DeepCool geometric icon
 *    - CNC milled copper micro-fin base plate with nickel-plated mounting wings
 *    - 90-degree swivel liquid fittings with chrome compression collars
 * 3. Natural Braided Liquid Sleeved Hoses:
 *    - Dual sweeping flexible liquid tubes with realistic gravity sag and braided sleeve texture
 *    - Proper origin and termination collars
 */
export default function DeepCoolLE240Cooler({
  position = [0, 0, 0],
  scale = 1,
  rgbColor = '#00e5ff',
  explodedProgress = 0,
  isSelected = false,
  isHovered = false,
  enableHighlight = false,
  onSelect,
  onHover,
  part
}) {
  const fan1Ref = useRef();
  const fan2Ref = useRef();
  const pumpHaloRef = useRef();

  // Active fan rotation & pump halo pulse
  useFrame((state, delta) => {
    if (fan1Ref.current) fan1Ref.current.rotation.z -= delta * 18;
    if (fan2Ref.current) fan2Ref.current.rotation.z -= delta * 18;
    if (pumpHaloRef.current) {
      const pulse = 0.75 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
      pumpHaloRef.current.material.opacity = pulse;
    }
  });

  // Physically Calibrated Materials
  const matteBlackAlu = {
    color: '#16181d',
    roughness: 0.55,
    metalness: 0.75,
  };

  const radiatorFinsMat = {
    color: '#0f1115',
    roughness: 0.9,
    metalness: 0.35,
  };

  const fanFrameMat = {
    color: '#1a1d24',
    roughness: 0.6,
    metalness: 0.2,
  };

  const fanBladeMat = {
    color: '#131519',
    roughness: 0.35,
    metalness: 0.25,
  };

  const braidedHoseMat = {
    color: '#111216',
    roughness: 0.88,
    metalness: 0.1,
  };

  const copperMat = {
    color: '#b45309',
    roughness: 0.25,
    metalness: 0.96,
  };

  const chromeSteelMat = {
    color: '#e2e8f0',
    roughness: 0.18,
    metalness: 0.98,
  };

  const rubberPadMat = {
    color: '#0a0a0c',
    roughness: 0.95,
  };

  // Highlight
  const highlightEmissive = isSelected ? '#00e5ff' : isHovered ? '#38bdf8' : '#000000';
  const highlightIntensity = isSelected ? 0.35 : isHovered ? 0.18 : 0;

  // Realistic Fluid Spline Curves for Liquid Tubing
  // Origin: Radiator end tank fittings (top left)
  // Termination: Pump 90-degree swivel fittings (lower center)
  const tube1Curve = useMemo(() => {
    return new THREE.CubicBezierCurve3(
      new THREE.Vector3(-2.3, 1.45, 0.4),  // Rad fitting 1
      new THREE.Vector3(-3.2, 0.4, 0.9),   // Rad outlet curve downward
      new THREE.Vector3(-1.8, -1.8, 0.8),  // Mid-way sweeping gravity sag
      new THREE.Vector3(-0.45, -1.25, 0.3) // Pump fitting 1
    );
  }, []);

  const tube2Curve = useMemo(() => {
    return new THREE.CubicBezierCurve3(
      new THREE.Vector3(-1.9, 1.45, 0.4),  // Rad fitting 2
      new THREE.Vector3(-2.8, 0.2, 1.2),   // Outer curve
      new THREE.Vector3(-1.4, -2.1, 1.1),  // Outer sweeping loop
      new THREE.Vector3(-0.15, -1.25, 0.3) // Pump fitting 2
    );
  }, []);

  return (
    <group position={position} scale={scale}>
      {/* ========================================================= */}
      {/* 1. 240MM DUAL-FAN RADIATOR ASSEMBLY                       */}
      {/* ========================================================= */}
      <group name="radiator_assembly" position={[0, 1.3, 0]}>
        {/* Main Radiator Outer Casing (240mm Form Factor: 5.8 x 2.5 x 0.55) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[5.8, 2.5, 0.55]} />
          <meshStandardMaterial
            {...matteBlackAlu}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>

        {/* DeepCool Anti-Leak Pressure Valve Cap (Far Left Tank) */}
        <mesh position={[-2.92, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.08, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Dense Micro-Channel Radiator Fin Core (Perforated Texture Depth) */}
        {[-1.25, 1.25].map((cx, idx) => (
          <group key={idx} position={[cx, 0, 0]}>
            <mesh>
              <boxGeometry args={[2.3, 2.25, 0.46]} />
              <meshStandardMaterial {...radiatorFinsMat} />
            </mesh>
            {/* Fine Aluminum Water Channels */}
            {Array.from({ length: 12 }).map((_, f) => (
              <mesh key={f} position={[-1.0 + f * 0.18, 0, 0.24]}>
                <boxGeometry args={[0.025, 2.2, 0.015]} />
                <meshStandardMaterial color="#1f232b" metalness={0.7} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Dual Radiator Hose Barb Fittings */}
        {[-2.3, -1.9].map((bx, i) => (
          <group key={i} position={[bx, 0.15, 0.3]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.22, 16]} />
              <meshStandardMaterial color="#1a1c22" roughness={0.6} metalness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 0.06, 16]} />
              <meshStandardMaterial {...chromeSteelMat} />
            </mesh>
          </group>
        ))}

        {/* ======================================================= */}
        {/* 2. DUAL 120MM ZERO DARK PWM FANS                       */}
        {/* ======================================================= */}
        <group name="dual_fans" position={[0, 0, 0.52]}>
          {[-1.25, 1.25].map((fanX, fIdx) => (
            <group key={fIdx} position={[fanX, 0, 0]}>
              {/* Outer Square Fan Frame */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2.4, 2.4, 0.5]} />
                <meshStandardMaterial {...fanFrameMat} />
              </mesh>

              {/* Cylindrical Aerodynamic Intake Tunnel */}
              <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[1.15, 1.15, 0.52, 32]} />
                <meshStandardMaterial color="#0f1115" roughness={0.7} />
              </mesh>

              {/* 4x Rubber Anti-Vibration Dampening Corners with Screws */}
              {[
                [-1.05, 1.05], [1.05, 1.05],
                [-1.05, -1.05], [1.05, -1.05]
              ].map(([rx, ry], pIdx) => (
                <group key={pIdx} position={[rx, ry, 0.25]}>
                  <mesh>
                    <boxGeometry args={[0.26, 0.26, 0.04]} />
                    <meshStandardMaterial {...rubberPadMat} />
                  </mesh>
                  <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
                    <meshStandardMaterial {...chromeSteelMat} />
                  </mesh>
                </group>
              ))}

              {/* Active High-Static Pressure Sickle Fan Blades */}
              <group ref={fIdx === 0 ? fan1Ref : fan2Ref} position={[0, 0, 0.12]}>
                {/* Motor Hub */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.42, 0.42, 0.28, 24]} />
                  <meshStandardMaterial color="#1a1c22" roughness={0.4} metalness={0.6} />
                </mesh>
                <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.38, 0.38, 0.02, 24]} />
                  <meshStandardMaterial color="#0c0e12" roughness={0.2} metalness={0.8} />
                </mesh>

                {/* 9x Aerodynamic Sickle Blades */}
                {Array.from({ length: 9 }).map((_, bIdx) => {
                  const angle = (bIdx * (Math.PI * 2)) / 9;
                  return (
                    <group key={bIdx} rotation={[0, 0, angle]}>
                      <mesh position={[0.7, 0, 0]} rotation={[0.35, 0.2, 0.1]}>
                        <boxGeometry args={[0.75, 0.26, 0.03]} />
                        <meshStandardMaterial {...fanBladeMat} />
                      </mesh>
                    </group>
                  );
                })}
              </group>
            </group>
          ))}
        </group>
      </group>

      {/* ========================================================= */}
      {/* 3. BRAIDED SLEEVED LIQUID HOSES (Flexible 3D Splines)      */}
      {/* ========================================================= */}
      <group name="liquid_tubing">
        {/* Hose 1 (Inner loop) */}
        <mesh>
          <tubeGeometry args={[tube1Curve, 64, 0.12, 16, false]} />
          <meshStandardMaterial {...braidedHoseMat} />
        </mesh>
        {/* Hose 2 (Outer loop) */}
        <mesh>
          <tubeGeometry args={[tube2Curve, 64, 0.12, 16, false]} />
          <meshStandardMaterial {...braidedHoseMat} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 4. HIGH-DETAIL CPU PUMP BLOCK & COLDPLATE ASSEMBLY        */}
      {/* ========================================================= */}
      <group name="pump_block" position={[0, -1.4, 0.3]}>
        {/* Main Low-Profile Cylindrical Pump Body */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.08, 1.08, 0.72, 36]} />
          <meshStandardMaterial
            color="#14161b"
            roughness={0.55}
            metalness={0.3}
            emissive={highlightEmissive}
            emissiveIntensity={highlightIntensity}
          />
        </mesh>

        {/* Stepped Architectural Bezel Trim */}
        <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.14, 1.14, 0.18, 36]} />
          <meshStandardMaterial color="#0f1115" roughness={0.7} metalness={0.4} />
        </mesh>

        {/* Machined Solid Copper Coldplate Base (Mounts flush to CPU) */}
        <mesh position={[0, 0, -0.42]}>
          <boxGeometry args={[1.65, 1.65, 0.1]} />
          <meshStandardMaterial {...copperMat} />
        </mesh>
        {/* CNC Milled Circular Micro-Fin Center */}
        <mesh position={[0, 0, -0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.02, 32]} />
          <meshStandardMaterial color="#92400e" metalness={0.98} roughness={0.18} />
        </mesh>

        {/* Dark Tinted Specular Mirror Cap (Pump Top Face) */}
        <mesh position={[0, 0, 0.37]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.02, 1.02, 0.04, 36]} />
          <meshStandardMaterial
            color="#050608"
            roughness={0.04}
            metalness={0.96}
          />
        </mesh>

        {/* DeepCool Infinity Halo & Geometric Accent Icon */}
        <group position={[0, 0, 0.40]}>
          {/* Inner Geometric Diamond / Square Line Accent */}
          <mesh>
            <ringGeometry args={[0.34, 0.39, 4]} rotation={[0, 0, Math.PI / 4]} />
            <meshBasicMaterial
              color={rgbColor}
              transparent
              opacity={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Outer Breathing Halo Ring */}
          <mesh ref={pumpHaloRef}>
            <ringGeometry args={[0.68, 0.76, 48]} />
            <meshBasicMaterial
              color={rgbColor}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* Dual 90-Degree Swiveling Hose Barbs on Pump Side */}
        {[-0.45, -0.15].map((bx, i) => (
          <group key={i} position={[bx, 0.88, 0]}>
            {/* Swivel Elbow Neck */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.24, 16]} />
              <meshStandardMaterial color="#1a1c22" roughness={0.6} metalness={0.4} />
            </mesh>
            {/* Chrome Compression Ring Collar */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.06, 16]} />
              <meshStandardMaterial {...chromeSteelMat} />
            </mesh>
          </group>
        ))}

        {/* Universal Nickel-Plated Steel Mounting Wings (LGA1700/AM5) */}
        <group name="metal_mounting_bracket" position={[0, 0, -0.22]}>
          {/* Left Wing Plate */}
          <mesh position={[-1.2, 0, 0]}>
            <boxGeometry args={[0.85, 0.32, 0.04]} />
            <meshStandardMaterial {...chromeSteelMat} />
          </mesh>
          {/* Right Wing Plate */}
          <mesh position={[1.2, 0, 0]}>
            <boxGeometry args={[0.85, 0.32, 0.04]} />
            <meshStandardMaterial {...chromeSteelMat} />
          </mesh>

          {/* 4x Knurled Chrome Thumb Screws & Tension Springs */}
          {[
            [-1.45, 0.85], [-1.45, -0.85],
            [1.45, 0.85], [1.45, -0.85]
          ].map(([tx, ty], sIdx) => (
            <group key={sIdx} position={[tx, ty, 0.12]}>
              {/* Knurled Thumb Screw Head */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.18, 20]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.15} />
              </mesh>
              {/* Tension Coil Spring */}
              <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.16, 16]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}
