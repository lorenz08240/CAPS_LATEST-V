import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import NepotatoGPU from '../3D/NepotatoGPU';
import ProceduralSickleFan from '../3D/ProceduralSickleFan';
import GenericPCCase from '../3D/GenericPCCase';
import ComponentModels3D from '../3D/ComponentModels3D';
import { HeroFloatingRAM } from '../3D/DDR4RAMModel';
import { HeroFloatingSSD } from '../3D/NVMeSSDModel';
import { HeroFloatingPSU } from '../3D/PSUModel';
import { preloadRAMModel, preloadNVMeSSDModel, preloadPSUModel } from '../../utilities/modelPreloader';

const HERO_STAGES = [
  { id: 'case', name: 'ATX Chassis', stageNum: 1, desc: 'Precision Airflow Chassis' },
  { id: 'motherboard', name: 'Motherboard', stageNum: 2, desc: 'Architectural PCB Traces' },
  { id: 'cpu', name: 'Thermal Cooler', stageNum: 3, desc: 'High Static Sickle Fin Assembly' },
  { id: 'ram', name: 'DDR4 Memory', stageNum: 4, desc: 'Photorealistic Dual-Channel Kit' },
  { id: 'storage', name: 'M.2 NVMe SSD', stageNum: 5, desc: 'High-Speed PCIe Gen4 Storage' },
  { id: 'gpu', name: 'Dedicated GPU', stageNum: 6, desc: 'Triple Aerofoil Cooler' },
  { id: 'psu', name: 'Modular Power', stageNum: 7, desc: '80 Plus Gold ATX Power Supply' },
];

/**
 * Floating CPU Cooler Assembly (Harmonious scale)
 */
function FloatingCooler({ rgbColor }) {
  const groupRef = useRef();

  return (
    <group ref={groupRef} scale={[0.78, 0.78, 0.78]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 2.4, 1.4]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
      </mesh>
      {[-0.7, -0.25, 0.25, 0.7].map((x, idx) => (
        <mesh key={idx} position={[x, 1.25, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
          <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.2} />
        </mesh>
      ))}
      <group position={[0, 0, 0.8]}>
        <ProceduralSickleFan
          size={2.2}
          radius={1.0}
          hubRadius={0.35}
          rgbColor={rgbColor}
          speed={14}
        />
      </group>
    </group>
  );
}

/**
 * High-Tech Holographic Ground Shockwave Ring on Component Lock-In
 */
function HolographicShockwave({ trigger, rgbColor }) {
  const ringGroupRef = useRef();

  useFrame(() => {
    if (!ringGroupRef.current) return;
    if (trigger >= 0.70 && trigger <= 1.0) {
      ringGroupRef.current.visible = true;
      const t = (trigger - 0.70) / 0.30;
      const radius = 0.5 + t * 4.2;
      const opacity = Math.sin(t * Math.PI) * 0.85;

      const primaryMesh = ringGroupRef.current.children[0];
      const secondaryMesh = ringGroupRef.current.children[1];

      if (primaryMesh) {
        primaryMesh.scale.set(radius, radius, 1);
        primaryMesh.material.opacity = opacity;
      }
      if (secondaryMesh) {
        secondaryMesh.scale.set(radius * 0.75, radius * 0.75, 1);
        secondaryMesh.material.opacity = opacity * 0.65;
      }
    } else {
      ringGroupRef.current.visible = false;
    }
  });

  return (
    <group ref={ringGroupRef} position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <mesh>
        <ringGeometry args={[0.98, 1.04, 64]} />
        <meshBasicMaterial 
          color={rgbColor} 
          transparent 
          opacity={0} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      <mesh>
        <ringGeometry args={[0.98, 1.02, 64]} />
        <meshBasicMaterial 
          color="#38bdf8" 
          transparent 
          opacity={0} 
          side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  );
}

/**
 * Dynamic Specular Flash Lighting Sweep on Landing
 */
function SpecularFlashLight({ trigger, rgbColor }) {
  const lightRef = useRef();

  useFrame(() => {
    if (lightRef.current) {
      if (trigger >= 0.75 && trigger <= 1.0) {
        const t = (trigger - 0.75) / 0.25;
        const flashIntensity = Math.sin(t * Math.PI) * 4.5;
        lightRef.current.intensity = flashIntensity;
      } else {
        lightRef.current.intensity = 0;
      }
    }
  });

  return (
    <pointLight 
      ref={lightRef} 
      position={[0, 0.8, 3.8]} 
      intensity={0} 
      color={rgbColor} 
      distance={9} 
    />
  );
}

/**
 * Hardware Stage Model Renderer (Clean balanced scale, zero hover highlight)
 */
function HardwareStageModel({ stageId, rgbColor }) {
  switch (stageId) {
    case 'case':
      return (
        <group scale={[0.21, 0.21, 0.21]} position={[0, -0.15, 0]}>
          <GenericPCCase
            rgbColor={rgbColor}
            caseColor="black"
            glassMode="closed"
            explodedProgress={0}
            showTooltip={false}
            enableHighlight={false}
          />
        </group>
      );
    case 'motherboard':
      return (
        <group scale={[0.40, 0.40, 0.40]} rotation={[0, Math.PI / 2, 0]}>
          <ComponentModels3D
            part={{ category: 'motherboard', name: 'ATX Motherboard' }}
            rgbColor={rgbColor}
            showTooltip={false}
            enableHighlight={false}
          />
        </group>
      );
    case 'cpu':
      return <FloatingCooler rgbColor={rgbColor} />;
    case 'ram':
      return <HeroFloatingRAM rgbColor={rgbColor} enableHighlight={false} />;
    case 'storage':
      return <HeroFloatingSSD rgbColor={rgbColor} enableHighlight={false} />;
    case 'gpu':
      return (
        <group scale={[0.80, 0.80, 0.80]}>
          <NepotatoGPU 
            rgbColor={rgbColor} 
            explodedProgress={0} 
            isSelected={false} 
            isHovered={false} 
            isStandalone={true} 
          />
        </group>
      );
    case 'psu':
      return (
        <group scale={[0.82, 0.82, 0.82]}>
          <HeroFloatingPSU rgbColor={rgbColor} enableHighlight={false} />
        </group>
      );
    default:
      return null;
  }
}

/**
 * Sequential Zero-Overlap 3D Stage with 270° Angled Rotational Reveal
 * 
 * Strict Phase State Machine:
 * 1. REST (3.6s): Steady resting plane at Y=0, continuous left clockwise turntable rotation, mouse draggable.
 * 2. EXIT (0.8s): Current model smoothly glides out to screen-left and into depth. Incoming model is strictly NOT rendered.
 * 3. PAUSE (0.18s): Center stage is completely clear and empty. Zero models in view.
 * 4. ENTER (1.15s): Incoming model swoops in from screen-right with 270° angled rotational reveal and lands with shockwave.
 * 
 * Result: 100% mathematically and visually guaranteed that NO TWO MODELS CAN EVER OVERLAP!
 */
function FluidScene({ onStageChange, rgbColor, scrollProgress = 0 }) {
  const rootRef = useRef();
  const motionGroupRef = useRef();
  const turntableAngleRef = useRef(0);

  const initialStage = (typeof window !== 'undefined' && window.__BUILDLAB_HERO_STAGE__) || HERO_STAGES[0].id;
  const initialIndex = Math.max(0, HERO_STAGES.findIndex(s => s.id === initialStage));

  const [currentStageId, setCurrentStageId] = useState(initialStage);
  const [landingProgress, setLandingProgress] = useState(0);

  // Sync initial stage to parent component on mount
  useEffect(() => {
    onStageChange?.(currentStageId);
  }, [currentStageId, onStageChange]);

  // Sequential background prefetching: pre-caches next heavy asset before transition
  useEffect(() => {
    if (currentStageId === 'cpu') {
      preloadRAMModel('idle');
    } else if (currentStageId === 'ram') {
      preloadNVMeSSDModel('idle');
    } else if (currentStageId === 'gpu') {
      preloadPSUModel('idle');
    }
  }, [currentStageId]);

  // High-precision 60fps animation state ref
  const animRef = useRef({
    phase: 'rest', // 'rest' | 'exit' | 'pause' | 'enter'
    timer: 0,
    currentIndex: initialIndex,
  });

  useFrame((state, rawDelta) => {
    // Clamp delta to protect against tab defocus frame leaps
    const delta = Math.min(rawDelta, 0.08);

    // Continuous clockwise turntable rotation
    turntableAngleRef.current -= delta * 0.48;

    const anim = animRef.current;
    anim.timer += delta;

    // Camera right & forward vectors so flight trajectory is ALWAYS screen-aligned
    const camQuat = state.camera.quaternion;
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camQuat);
    right.y = 0;
    if (right.lengthSq() > 0.0001) right.normalize();
    else right.set(1, 0, 0);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camQuat);
    forward.y = 0;
    if (forward.lengthSq() > 0.0001) forward.normalize();
    else forward.set(0, 0, -1);

    // Scroll-linked vertical recession into the lower build section
    if (rootRef.current) {
      const scrollPosY = -scrollProgress * 2.2;
      const scrollScale = Math.max(0.65, 1 - scrollProgress * 0.35);
      rootRef.current.position.y = scrollPosY;
      rootRef.current.scale.set(scrollScale, scrollScale, scrollScale);
    }

    if (!motionGroupRef.current) return;

    // PHASE 1: RESTING & INSPECTION (3.6s)
    if (anim.phase === 'rest') {
      motionGroupRef.current.visible = true;
      motionGroupRef.current.position.set(0, 0, 0);
      motionGroupRef.current.rotation.set(0, turntableAngleRef.current, 0);
      motionGroupRef.current.scale.set(1, 1, 1);

      if (anim.timer >= 3.6) {
        anim.phase = 'exit';
        anim.timer = 0;
      }
    } 
    // PHASE 2: OUTGOING GLIDE-OUT (0.8s)
    // Current model smoothly accelerates to screen-left and dives into depth.
    else if (anim.phase === 'exit') {
      const t = Math.min(1.0, anim.timer / 0.8);
      const ease = Math.pow(t, 2.2);

      const outX = -9.5 * ease;
      const outZ = -4.5 * ease;
      const outY = -0.32 * ease;

      motionGroupRef.current.visible = true;
      motionGroupRef.current.position.set(0, 0, 0)
        .addScaledVector(right, outX)
        .addScaledVector(forward, outZ);
      motionGroupRef.current.position.y = outY;

      motionGroupRef.current.rotation.x = -0.35 * ease;
      motionGroupRef.current.rotation.z = 0.30 * ease;
      motionGroupRef.current.rotation.y = turntableAngleRef.current - (Math.PI * 1.2) * ease;

      const scale = Math.max(0.001, 1.0 - 0.48 * ease);
      motionGroupRef.current.scale.set(scale, scale, scale);

      if (t >= 1.0) {
        anim.phase = 'pause';
        anim.timer = 0;
        motionGroupRef.current.visible = false;
      }
    } 
    // PHASE 3: STAGE CLEARANCE PAUSE (0.18s)
    // Stage is completely clear of all models! Zero overlap guaranteed.
    else if (anim.phase === 'pause') {
      motionGroupRef.current.visible = false;

      if (anim.timer >= 0.18) {
        // Advance stage index sequentially
        const nextIndex = (anim.currentIndex + 1) % HERO_STAGES.length;
        anim.currentIndex = nextIndex;
        anim.phase = 'enter';
        anim.timer = 0;

        const nextStage = HERO_STAGES[nextIndex];
        setCurrentStageId(nextStage.id);
        onStageChange?.(nextStage.id);

        // Position immediately at offscreen start coordinates before unhiding
        motionGroupRef.current.position.set(0, 0, 0)
          .addScaledVector(right, 9.5)
          .addScaledVector(forward, -4.0);
        motionGroupRef.current.position.y = 0.45;
        motionGroupRef.current.rotation.x = 0.42;
        motionGroupRef.current.rotation.z = -0.35;
        motionGroupRef.current.rotation.y = turntableAngleRef.current + Math.PI * 1.5;
        motionGroupRef.current.scale.set(0.65, 0.65, 0.65);
        motionGroupRef.current.visible = true;
      }
    } 
    // PHASE 4: INCOMING ROTATIONAL REVEAL SWOOP (1.15s)
    // Swoops in from screen-right with 270° spin unroll and lands with specular flash.
    else if (anim.phase === 'enter') {
      const t = Math.min(1.0, anim.timer / 1.15);
      const ease = t === 1.0 ? 1.0 : 1.0 - Math.pow(2, -8 * t);

      const inX = 9.5 * (1 - ease);
      const inZ = -4.0 * (1 - ease);
      const inY = 0.45 * (1 - ease);

      motionGroupRef.current.visible = true;
      motionGroupRef.current.position.set(0, 0, 0)
        .addScaledVector(right, inX)
        .addScaledVector(forward, inZ);
      motionGroupRef.current.position.y = inY;

      // 270° Angled Rotational Reveal: unrolls into continuous turntable
      motionGroupRef.current.rotation.x = 0.42 * (1 - ease);
      motionGroupRef.current.rotation.z = -0.35 * (1 - ease);
      motionGroupRef.current.rotation.y = turntableAngleRef.current + (Math.PI * 1.5) * (1 - ease);

      const scale = 0.65 + 0.35 * ease;
      motionGroupRef.current.scale.set(scale, scale, scale);

      // Trigger holographic shockwave & specular glint during lock-in
      if (t >= 0.70) {
        setLandingProgress(t);
      }

      if (t >= 1.0) {
        anim.phase = 'rest';
        anim.timer = 0;
        setLandingProgress(0);
      }
    }
  });

  return (
    <group ref={rootRef}>
      <HolographicShockwave trigger={landingProgress} rgbColor={rgbColor} />

      <SpecularFlashLight trigger={landingProgress} rgbColor={rgbColor} />

      <group ref={motionGroupRef}>
        <HardwareStageModel stageId={currentStageId} rgbColor={rgbColor} />
      </group>
    </group>
  );
}

/**
 * Home3DHero — Interactive 3D Hero Stage for BuildLab
 * - Guaranteed zero-overlap sequential transitions
 * - Relaxed cinematic reveal pacing (~2.1s transition, 3.6s steady inspection)
 * - Steady turntable clockwise rotation (zero bobbing)
 * - Interactive mouse dragging (OrbitControls)
 */
export default function Home3DHero({ 
  activeModel,
  setActiveModel, 
  rgbColor = '#f43f5e', 
  scrollProgress = 0 
}) {
  return (
    <div className="home-3d-hero-container">
      <div className="home-3d-canvas-wrap">
        <Canvas
          camera={{ position: [0, 0.6, 7.2], fov: 42 }}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15
          }}
        >
          <ambientLight intensity={1.3} color="#f8fafc" />
          <directionalLight position={[-8, 12, 10]} intensity={2.8} color="#ffffff" />
          <directionalLight position={[8, -4, -6]} intensity={2.2} color="#f43f5e" />
          <pointLight position={[0, 0, 4]} intensity={2.4} color={rgbColor} distance={12} />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            rotateSpeed={0.72} 
            dampingFactor={0.08} 
          />

          <Sparkles
            count={60}
            scale={16}
            size={3.2}
            speed={0.65}
            opacity={0.4}
            color={rgbColor}
          />

          <Suspense fallback={null}>
            <Environment preset="night" />
            <FluidScene 
              onStageChange={setActiveModel}
              rgbColor={rgbColor} 
              scrollProgress={scrollProgress} 
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
