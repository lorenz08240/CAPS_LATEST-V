import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function GenericPCCase({ position = [0, 0, 0], scale = 1, rgbColor = '#00E676' }) {
  const fansRef = useRef();

  // Animate the RGB fans spinning
  useFrame((state, delta) => {
    if (fansRef.current) {
      fansRef.current.rotation.z -= delta * 5;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* ── Outer Metal Chassis ── */}
      {/* Top Panel */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[4.5, 0.2, 9]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Bottom Panel */}
      <mesh position={[0, -4.5, 0]}>
        <boxGeometry args={[4.5, 0.2, 9]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Front Panel (Mesh / Intake) */}
      <mesh position={[0, 0, 4.4]}>
        <boxGeometry args={[4.5, 9, 0.2]} />
        <meshStandardMaterial color="#0f0f0f" roughness={0.9} />
      </mesh>

      {/* Back Panel */}
      <mesh position={[0, 0, -4.4]}>
        <boxGeometry args={[4.5, 9, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Right Panel (Solid Metal) */}
      <mesh position={[2.15, 0, 0]}>
        <boxGeometry args={[0.2, 9, 9]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* ── Internal Motherboard Tray ── */}
      <mesh position={[1.5, 0, -1]}>
        <boxGeometry args={[0.1, 7, 6]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>

      {/* ── PSU Shroud (Bottom Cover) ── */}
      <mesh position={[0, -3.5, 0]}>
        <boxGeometry args={[4.1, 1.8, 8.8]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>

      {/* ── Front RGB Fans ── */}
      <group position={[0, 0, 4.2]} ref={fansRef}>
        {/* Fan 1 (Top) */}
        <mesh position={[0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.15, 16, 32]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2} />
        </mesh>
        {/* Fan 2 (Middle) */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.15, 16, 32]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2} />
        </mesh>
        {/* Fan 3 (Bottom) */}
        <mesh position={[0, -2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.15, 16, 32]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2} />
        </mesh>
      </group>

      {/* ── Left Side Panel (Tempered Glass) ── */}
      <mesh position={[-2.15, 0, 0]}>
        <boxGeometry args={[0.1, 8.8, 8.8]} />
        <meshPhysicalMaterial 
          color="#000000" 
          transmission={0.9} 
          opacity={0.3} 
          transparent={true} 
          roughness={0.1} 
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* ── Subtle Internal Lighting ── */}
      <pointLight position={[0, 2, 0]} color={rgbColor} intensity={0.8} distance={10} />
      <pointLight position={[0, -2, 0]} color={rgbColor} intensity={0.5} distance={10} />
    </group>
  );
}
