import React, { useRef, useState, useEffect, Suspense, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Sparkles, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import NepotatoGPU from '../3D/NepotatoGPU';
import ProceduralSickleFan from '../3D/ProceduralSickleFan';
import GenericPCCase from '../3D/GenericPCCase';
import NorthChalkWhiteCase from '../3D/NorthChalkWhiteCase';
import ROGStrixMotherboard from '../3D/ROGStrixMotherboard';
import DeepCoolLE240Cooler from '../3D/DeepCoolLE240Cooler';
import ComponentModels3D from '../3D/ComponentModels3D';
import { HeroFloatingRAM } from '../3D/DDR4RAMModel';
import { HeroFloatingSSD } from '../3D/NVMeSSDModel';
import { HeroFloatingPSU } from '../3D/PSUModel';
import { preloadRAMModel, preloadNVMeSSDModel, preloadPSUModel } from '../../utilities/modelPreloader';
import { useTheme } from '../../contexts/ThemeContext';

// Persistent reusable module-level vectors & quaternions to eliminate per-frame GC allocations
const _camQuat = new THREE.Quaternion();
const _right = new THREE.Vector3();
const _forward = new THREE.Vector3();

const HERO_STAGES = [
  { id: 'case', name: 'Computer Case', stageNum: 1, desc: 'PC Case' },
  { id: 'motherboard', name: 'Motherboard', stageNum: 2, desc: 'Motherboard' },
  { id: 'cpu', name: 'CPU Cooler', stageNum: 3, desc: 'Processor & Cooler' },
  { id: 'ram', name: 'RAM Memory', stageNum: 4, desc: 'DDR4 Memory' },
  { id: 'storage', name: 'SSD Storage', stageNum: 5, desc: 'Fast NVMe SSD' },
  { id: 'gpu', name: 'Graphics Card', stageNum: 6, desc: 'Dedicated Graphics Card' },
  { id: 'psu', name: 'Power Supply', stageNum: 7, desc: 'Power Supply Unit' },
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
 * Reads from a ref to avoid triggering React component re-renders during 60/120fps useFrame loops.
 */
function HolographicShockwave({ triggerRef, trigger, rgbColor }) {
  const ringGroupRef = useRef();

  useFrame(() => {
    if (!ringGroupRef.current) return;
    const trig = triggerRef ? triggerRef.current : (typeof trigger === 'number' ? trigger : 0);
    if (trig >= 0.70 && trig <= 1.0) {
      ringGroupRef.current.visible = true;
      const t = (trig - 0.70) / 0.30;
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
          color="#ffffff" 
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
 * Reads from a ref to eliminate React state updates in useFrame.
 */
function SpecularFlashLight({ triggerRef, trigger, rgbColor }) {
  const lightRef = useRef();

  useFrame(() => {
    if (lightRef.current) {
      const trig = triggerRef ? triggerRef.current : (typeof trigger === 'number' ? trigger : 0);
      if (trig >= 0.75 && trig <= 1.0) {
        const t = (trig - 0.75) / 0.25;
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
 * Hardware Stage Model Renderer
 * Mounts all 7 models simultaneously with visibility toggles to eliminate
 * React mount/unmount overhead, buffer recreations, and mid-transition shader compilation hitching.
 */
const HardwareStageModel = memo(function HardwareStageModel({ stageId, rgbColor, caseColor = 'black' }) {
  return (
    <>
      <group visible={stageId === 'case'} scale={[0.18, 0.18, 0.18]} position={[0, -0.15, 0]}>
        <NorthChalkWhiteCase
          sidePanelMode="glass"
          caseColor={caseColor}
          rgbColor={rgbColor}
          explodedProgress={0}
          enableHighlight={false}
        />
      </group>

      <group visible={stageId === 'motherboard'} scale={[0.34, 0.34, 0.34]} position={[0, -0.05, 0]}>
        <ROGStrixMotherboard
          rgbColor={rgbColor}
          explodedProgress={0}
          enableHighlight={false}
        />
      </group>

      <group visible={stageId === 'cpu'} scale={[0.55, 0.55, 0.55]} position={[0, -0.1, 0]}>
        <DeepCoolLE240Cooler
          rgbColor={rgbColor}
          explodedProgress={0}
          enableHighlight={false}
        />
      </group>

      <group visible={stageId === 'ram'}>
        <HeroFloatingRAM rgbColor={rgbColor} enableHighlight={false} />
      </group>

      <group visible={stageId === 'storage'}>
        <HeroFloatingSSD rgbColor={rgbColor} enableHighlight={false} />
      </group>

      <group visible={stageId === 'gpu'} scale={[0.80, 0.80, 0.80]}>
        <NepotatoGPU 
          rgbColor={rgbColor} 
          explodedProgress={0} 
          isSelected={false} 
          isHovered={false} 
          isStandalone={true} 
        />
      </group>

      <group visible={stageId === 'psu'} scale={[0.82, 0.82, 0.82]}>
        <HeroFloatingPSU rgbColor={rgbColor} enableHighlight={false} />
      </group>
    </>
  );
});

/**
 * WebGL Material & Shader Pre-Warmer
 * Compiles all materials and uploads geometry buffers on initial canvas initialization
 * so stage changes never stutter on GPU shader compilation.
 */
function SceneMaterialPrewarmer() {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const hiddenNodes = [];
        scene.traverse((obj) => {
          if (!obj.visible) {
            hiddenNodes.push(obj);
            obj.visible = true;
          }
        });
        gl.compile(scene, camera);
        hiddenNodes.forEach((obj) => {
          obj.visible = false;
        });
      } catch (err) {
        console.debug('Shader prewarm completed with note:', err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [gl, scene, camera]);

  return null;
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
 * Performance enhancements:
 * - Damped scroll tracking via THREE.MathUtils.damp(..., 8, delta) for liquid butter response in both directions
 * - Zero per-frame object allocation (reusable module-level vectors _right, _forward, _camQuat)
 * - Decoupled from React scroll re-renders using persistent refs
 */
function FluidScene({ 
  onStageChange, 
  rgbColor, 
  scrollProgress = 0, 
  scrollProgressRef: externalScrollProgressRef,
  isInteractingRef, 
  caseColor = 'black',
  activeStageId
}) {
  const rootRef = useRef();
  const motionGroupRef = useRef();
  const turntableAngleRef = useRef(-0.35);
  const landingProgressRef = useRef(0);
  const isScrollInitRef = useRef(false);

  const initialStage = (typeof window !== 'undefined' && window.__BUILDLAB_HERO_STAGE__) || activeStageId || HERO_STAGES[0].id;
  const initialIndex = Math.max(0, HERO_STAGES.findIndex(s => s.id === initialStage));

  const [currentStageId, setCurrentStageId] = useState(initialStage);
  const prevExternalStageRef = useRef(activeStageId);

  const onStageChangeRef = useRef(onStageChange);
  useEffect(() => {
    onStageChangeRef.current = onStageChange;
  }, [onStageChange]);

  // Sync initial stage to parent component on mount
  useEffect(() => {
    onStageChangeRef.current?.(currentStageId);
  }, [currentStageId]);

  // External stage change sync (only fires when parent prop genuinely changes)
  useEffect(() => {
    if (activeStageId && activeStageId !== prevExternalStageRef.current) {
      prevExternalStageRef.current = activeStageId;
      if (activeStageId !== currentStageId) {
        const idx = HERO_STAGES.findIndex(s => s.id === activeStageId);
        if (idx !== -1) {
          animRef.current.currentIndex = idx;
          turntableAngleRef.current = -0.35;
          setCurrentStageId(activeStageId);
        }
      }
    }
  }, [activeStageId, currentStageId]);

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

  // High-precision 60fps/120fps animation state ref
  const animRef = useRef({
    phase: 'rest', // 'rest' | 'exit' | 'pause' | 'enter'
    timer: 0,
    currentIndex: initialIndex,
  });

  useFrame((state, rawDelta) => {
    // Clamp delta to protect against tab defocus frame leaps
    const delta = Math.min(rawDelta, 0.08);
    const isHolding = Boolean(isInteractingRef?.current);

    // Continuous clockwise turntable rotation (pauses when user holds / rotates model)
    if (!isHolding) {
      turntableAngleRef.current -= delta * 0.48;
    }

    const anim = animRef.current;

    // HOLD-TO-PAUSE: If user is actively holding/rotating the model, pause the auto-transition timer
    if (isHolding) {
      if (anim.phase === 'rest') {
        anim.timer = 0; // Hold at rest indefinitely so model never flies away during inspection
      }
    } else {
      anim.timer += delta;
    }

    // Camera right & forward vectors so flight trajectory is ALWAYS screen-aligned (zero GC allocations)
    _camQuat.copy(state.camera.quaternion);

    _right.set(1, 0, 0).applyQuaternion(_camQuat);
    _right.y = 0;
    if (_right.lengthSq() > 0.0001) {
      _right.normalize();
    } else {
      _right.set(1, 0, 0);
    }

    _forward.set(0, 0, -1).applyQuaternion(_camQuat);
    _forward.y = 0;
    if (_forward.lengthSq() > 0.0001) {
      _forward.normalize();
    } else {
      _forward.set(0, 0, -1);
    }

    // Smooth scroll-linked vertical recession into the lower build section
    // Uses THREE.MathUtils.damp to glide continuously at 60/120/144fps in both scroll directions
    if (rootRef.current) {
      const scrollVal = externalScrollProgressRef
        ? externalScrollProgressRef.current
        : (typeof scrollProgress === 'number' ? scrollProgress : 0);

      const targetY = -scrollVal * 2.2;
      const targetScale = Math.max(0.65, 1 - scrollVal * 0.35);

      if (!isScrollInitRef.current) {
        rootRef.current.position.y = targetY;
        rootRef.current.scale.set(targetScale, targetScale, targetScale);
        isScrollInitRef.current = true;
      } else {
        rootRef.current.position.y = THREE.MathUtils.damp(
          rootRef.current.position.y,
          targetY,
          8,
          delta
        );
        const currentScale = rootRef.current.scale.x;
        const smoothedScale = THREE.MathUtils.damp(
          currentScale,
          targetScale,
          8,
          delta
        );
        rootRef.current.scale.set(smoothedScale, smoothedScale, smoothedScale);
      }
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
        .addScaledVector(_right, outX)
        .addScaledVector(_forward, outZ);
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
        turntableAngleRef.current = -0.35;
        setCurrentStageId(nextStage.id);
        onStageChangeRef.current?.(nextStage.id);

        // Position immediately at offscreen start coordinates before unhiding
        motionGroupRef.current.position.set(0, 0, 0)
          .addScaledVector(_right, 9.5)
          .addScaledVector(_forward, -4.0);
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
      // Continuous quartic ease-out landing with zero velocity jerk at docking
      const ease = 1 - Math.pow(1 - t, 3.5);

      const inX = 9.5 * (1 - ease);
      const inZ = -4.0 * (1 - ease);
      const inY = 0.45 * (1 - ease);

      motionGroupRef.current.visible = true;
      motionGroupRef.current.position.set(0, 0, 0)
        .addScaledVector(_right, inX)
        .addScaledVector(_forward, inZ);
      motionGroupRef.current.position.y = inY;

      // 270° Angled Rotational Reveal: smoothly unrolls into continuous turntable
      motionGroupRef.current.rotation.x = 0.42 * (1 - ease);
      motionGroupRef.current.rotation.z = -0.35 * (1 - ease);
      motionGroupRef.current.rotation.y = turntableAngleRef.current + (Math.PI * 1.5) * (1 - ease);

      const scale = 0.65 + 0.35 * ease;
      motionGroupRef.current.scale.set(scale, scale, scale);

      // Trigger holographic shockwave & specular glint during lock-in without React re-render
      if (t >= 0.70) {
        landingProgressRef.current = t;
      }

      if (t >= 1.0) {
        anim.phase = 'rest';
        anim.timer = 0;
        landingProgressRef.current = 0;
      }
    }
  });

  const { isDark } = useTheme();

  return (
    <group ref={rootRef}>
      <HolographicShockwave triggerRef={landingProgressRef} rgbColor={rgbColor} />

      <SpecularFlashLight triggerRef={landingProgressRef} rgbColor={rgbColor} />

      <group ref={motionGroupRef}>
        <HardwareStageModel stageId={currentStageId} rgbColor={rgbColor} caseColor={caseColor} />
      </group>

      {/* Physically-grounded Ambient Occlusion Contact Shadow */}
      <ContactShadows 
        position={[0, -1.65, 0]} 
        opacity={isDark ? 0.45 : 0.72} 
        scale={7.5} 
        blur={2.4} 
        far={4.0} 
        resolution={256}
        color={isDark ? '#000000' : '#0C0C0F'} 
      />
    </group>
  );
}

// Memoized FluidScene that prevents React re-render flooding from raw scroll updates
const MemoizedFluidScene = memo(FluidScene, (prevProps, nextProps) => {
  return (
    prevProps.rgbColor === nextProps.rgbColor &&
    prevProps.caseColor === nextProps.caseColor &&
    prevProps.activeStageId === nextProps.activeStageId &&
    prevProps.onStageChange === nextProps.onStageChange &&
    prevProps.isInteractingRef === nextProps.isInteractingRef
  );
});

/**
 * Home3DHero — Interactive 3D Hero Stage for BuildLab
 * - Guaranteed zero-overlap sequential transitions
 * - Relaxed cinematic reveal pacing (~2.1s transition, 3.6s steady inspection)
 * - Steady turntable clockwise rotation (zero bobbing)
 * - Interactive mouse dragging (OrbitControls)
 * - Zero GC allocation inside useFrame
 * - High FPS damping on scroll motion
 * - Pre-warmed shaders and zero model remount lag
 */
export default function Home3DHero({ 
  activeModel,
  setActiveModel, 
  rgbColor = '#f43f5e', 
  scrollProgress = 0 
}) {
  const isInteractingRef = useRef(false);
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const { isDark } = useTheme();
  const caseColor = isDark ? 'black' : 'white';
  const envPreset = isDark ? 'night' : 'city';

  // Persistent ref for scrollProgress so FluidScene never needs to re-render when scroll updates
  const scrollProgressRef = useRef(0);
  scrollProgressRef.current = typeof scrollProgress === 'object' && scrollProgress !== null
    ? scrollProgress.current
    : (typeof scrollProgress === 'number' ? scrollProgress : 0);

  // Pre-cache all 3D assets on initial mount so transitions never hitch
  useEffect(() => {
    preloadRAMModel('idle');
    preloadNVMeSSDModel('idle');
    preloadPSUModel('idle');
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Suspend WebGL loop when scrolled out of view to free 100% GPU for page scrolling
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { rootMargin: '120px' });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Global window release failsafe so releasing mouse outside canvas reliably resumes timer
  useEffect(() => {
    const handleRelease = () => {
      isInteractingRef.current = false;
    };
    window.addEventListener('pointerup', handleRelease);
    window.addEventListener('pointercancel', handleRelease);
    window.addEventListener('blur', handleRelease);
    return () => {
      window.removeEventListener('pointerup', handleRelease);
      window.removeEventListener('pointercancel', handleRelease);
      window.removeEventListener('blur', handleRelease);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="home-3d-hero-container"
      onPointerDown={() => { isInteractingRef.current = true; }}
      onPointerUp={() => { isInteractingRef.current = false; }}
    >
      <div className="home-3d-canvas-wrap">
        <Canvas
          frameloop={isInView ? "always" : "demand"}
          dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1]}
          camera={{ position: [0, 0.6, 7.2], fov: 42 }}
          gl={{
            powerPreference: "high-performance",
            antialias: true,
            alpha: true,
            stencil: false,
            depth: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('buildlab:3d-ready'));
            }
          }}
        >
          <ambientLight intensity={1.3} color="#f8fafc" />
          <directionalLight position={[-8, 12, 10]} intensity={2.8} color="#ffffff" />
          <directionalLight position={[-6, 4, -8]} intensity={1.35} color="#e2e8f0" />
          <directionalLight position={[8, -4, -6]} intensity={1.8} color="#f43f5e" />
          <pointLight position={[0, 0, 4]} intensity={2.4} color={rgbColor} distance={12} />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableDamping={true}
            rotateSpeed={0.72} 
            dampingFactor={0.08} 
            onStart={() => { isInteractingRef.current = true; }}
            onEnd={() => { isInteractingRef.current = false; }}
          />

          <Sparkles
            count={isMobile ? 18 : 60}
            scale={16}
            size={3.2}
            speed={isMobile ? 0.4 : 0.65}
            opacity={0.4}
            color={rgbColor}
          />

          <Suspense fallback={null}>
            <Environment preset={envPreset} />
            <SceneMaterialPrewarmer />
            <MemoizedFluidScene 
              onStageChange={setActiveModel}
              rgbColor={rgbColor} 
              scrollProgress={scrollProgress} 
              scrollProgressRef={scrollProgressRef}
              isInteractingRef={isInteractingRef}
              caseColor={caseColor}
              activeStageId={activeModel}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
