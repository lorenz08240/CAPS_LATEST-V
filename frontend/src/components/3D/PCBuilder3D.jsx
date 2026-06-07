import React, { useState, Suspense, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows, Environment, Html } from '@react-three/drei';
import { buildSteps } from '../Build/Build';
import { useBuild } from '../../contexts/BuildContext';
import GenericPCCase from './GenericPCCase';
import './PCBuilder3D.css';

// Predefined snap positions inside the GenericPCCase
const TARGET_POSITIONS = {
  case: [0, 0, 0],
  motherboard: [1.4, 0, -1],
  cpu: [1.6, 1.5, -1],
  ram: [1.6, 1.5, 0.2],
  gpu: [0.8, -1.0, -0.5],
  psu: [0, -3.5, -2],
  storage: [1.5, -2, 1]
};

// Floating Animated Indicator for active drop zones
function DropIndicator({ activeCategory, category, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
    }
  });

  if (activeCategory !== category) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#00E676" wireframe transparent opacity={0.3} />
      </mesh>
      <Html center position={[0, 1.5, 0]}>
        <div className="drop-indicator-label" style={{ background: 'rgba(0,230,118,0.2)', border: '1px solid #00E676', padding: '4px 10px', borderRadius: '4px', color: '#00E676', fontSize: '12px', whiteSpace: 'nowrap', pointerEvents: 'none', animation: 'pulse 1.5s infinite' }}>
          👇 Drop {category.toUpperCase()} Here
        </div>
      </Html>
    </group>
  );
}

// Procedural placeholder geometries for internal components
function Component3DModel({ part, isPlaced, rgbColor, onClick }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Drop animation: Slide down into place
  useFrame((state, delta) => {
    if (groupRef.current && groupRef.current.position.y > part.targetPosition[1]) {
      groupRef.current.position.y -= delta * 15;
      if (groupRef.current.position.y < part.targetPosition[1]) {
         groupRef.current.position.y = part.targetPosition[1];
      }
    }
    
    // Scale bounce on hover
    if (groupRef.current) {
      const targetScale = hovered ? 1.05 : 1;
      groupRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.2);
    }
  });

  const category = part.category.toLowerCase();
  const initialY = isPlaced ? part.targetPosition[1] + 8 : part.targetPosition[1];
  
  // Hover effects
  const glowIntensity = hovered ? 3 : 1;
  const baseEmissive = hovered ? "#333333" : "#000000";

  return (
    <group 
      ref={groupRef} 
      position={[part.targetPosition[0], initialY, part.targetPosition[2]]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); if(onClick) onClick(part); }}
    >
      
      {category === 'motherboard' && (
        <group>
          {/* Base PCB */}
          <mesh><boxGeometry args={[0.1, 5, 5]} /><meshStandardMaterial color="#1a1a1a" roughness={0.9} emissive={baseEmissive} /></mesh>
          {/* CPU Socket */}
          <mesh position={[0.1, 1.5, 0]}><boxGeometry args={[0.05, 1.2, 1.2]} /><meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} emissive={baseEmissive} /></mesh>
          {/* VRM Heatsink */}
          <mesh position={[0.1, 2.3, 0]}><boxGeometry args={[0.15, 0.4, 1.5]} /><meshStandardMaterial color="#444" metalness={0.9} roughness={0.4} emissive={baseEmissive} /></mesh>
          {/* PCIe Slots */}
          <mesh position={[0.1, -1, 0]}><boxGeometry args={[0.05, 0.3, 4]} /><meshStandardMaterial color="#000" roughness={0.8} /></mesh>
          {/* RAM Slots */}
          <mesh position={[0.1, 1.5, 1.2]}><boxGeometry args={[0.05, 2.5, 0.4]} /><meshStandardMaterial color="#222" roughness={0.8} /></mesh>
        </group>
      )}

      {category === 'cpu' && (
        <group>
          <mesh position={[0, -0.2, 0]}><boxGeometry args={[0.1, 1, 1]} /><meshStandardMaterial color="#b0b0b0" metalness={1} roughness={0.2} emissive={baseEmissive} /></mesh>
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.6, 0.6, 0.4, 32]} />
             <meshStandardMaterial color="#111" roughness={0.8} metalness={0.3} emissive={baseEmissive} />
          </mesh>
          {/* Hover makes RGB ring brighter */}
          <mesh position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
             <torusGeometry args={[0.4, 0.05, 32, 32]} />
             <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={hovered ? 4 : 2} />
          </mesh>
        </group>
      )}

      {category === 'ram' && (
        <group>
          <group position={[0, 0, -0.2]}>
            <mesh><boxGeometry args={[0.3, 2.4, 0.1]} /><meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} emissive={baseEmissive} /></mesh>
            <mesh position={[-0.15, 0, 0]}><boxGeometry args={[0.01, 2.4, 0.11]} /><meshStandardMaterial color="#ffd700" metalness={1} roughness={0.2} /></mesh>
            <mesh position={[0.15, 0, 0]}><boxGeometry args={[0.05, 2.4, 0.08]} /><meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={glowIntensity} /></mesh>
          </group>
          <group position={[0, 0, 0.2]}>
            <mesh><boxGeometry args={[0.3, 2.4, 0.1]} /><meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} emissive={baseEmissive} /></mesh>
            <mesh position={[-0.15, 0, 0]}><boxGeometry args={[0.01, 2.4, 0.11]} /><meshStandardMaterial color="#ffd700" metalness={1} roughness={0.2} /></mesh>
            <mesh position={[0.15, 0, 0]}><boxGeometry args={[0.05, 2.4, 0.08]} /><meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={glowIntensity} /></mesh>
          </group>
        </group>
      )}

      {category === 'gpu' && (
        <group>
          <mesh><boxGeometry args={[1.2, 0.8, 3.8]} /><meshStandardMaterial color="#151515" roughness={0.6} emissive={baseEmissive} /></mesh>
          <mesh position={[-0.65, 0, 0]}><boxGeometry args={[0.1, 0.8, 3.8]} /><meshStandardMaterial color="#333" metalness={0.9} roughness={0.4} emissive={baseEmissive} /></mesh>
          <mesh position={[0.65, 0, 1]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.35, 0.35, 0.1, 32]} /><meshStandardMaterial color="#0a0a0a" /></mesh>
          <mesh position={[0.65, 0, -1]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.35, 0.35, 0.1, 32]} /><meshStandardMaterial color="#0a0a0a" /></mesh>
          <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.8, 0.05, 2]} /><meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={glowIntensity} /></mesh>
          <pointLight position={[-1, 0, 0]} color={rgbColor} intensity={0.5} distance={2} />
        </group>
      )}

      {category === 'psu' && (
        <group>
          <mesh><boxGeometry args={[2.5, 1.5, 3]} /><meshStandardMaterial color="#151515" roughness={0.9} emissive={baseEmissive} /></mesh>
          <mesh position={[0, 0.76, 0]} rotation={[Math.PI / 2, 0, 0]}>
             <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
             <meshStandardMaterial color="#050505" metalness={0.8} emissive={baseEmissive} />
          </mesh>
        </group>
      )}

      {category === 'storage' && (
        <group>
          <mesh><boxGeometry args={[0.2, 1.2, 1.8]} /><meshStandardMaterial color="#0a0a0a" roughness={0.6} emissive={baseEmissive} /></mesh>
          <mesh position={[0.11, 0, 0]}><boxGeometry args={[0.01, 1.0, 1.6]} /><meshStandardMaterial color="#222" metalness={0.5} emissive={baseEmissive} /></mesh>
        </group>
      )}
      
      {/* HTML tooltip on hover */}
      {hovered && (
        <Html center position={[0, 1.5, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.8)', border: `1px solid ${rgbColor}`, padding: '4px 8px', borderRadius: '4px', color: '#fff', fontSize: '12px', pointerEvents: 'none' }}>
            {part.name}
          </div>
        </Html>
      )}

    </group>
  );
}

function PCBuilder3D() {
  const navigate = useNavigate();
  const { allComponents } = useBuild();
  
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const placedParts = history[historyIndex];

  const getRgbColor = () => {
    if (placedParts.length <= 1) return "#FF5252";
    if (placedParts.length <= 4) return "#FFA726";
    return "#00E676";
  };
  const currentRgb = getRgbColor();

  const updatePlacedParts = (newParts) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newParts);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1);
  };

  const handleClear = () => {
    updatePlacedParts([]);
    setActiveStep(0);
  };

  const [activeStep, setActiveStep] = useState(0);

  const handleDragStart = (e, part, category) => {
    e.dataTransfer.setData('part', JSON.stringify({ ...part, category }));
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const partData = e.dataTransfer.getData('part');
    if (partData) {
      const part = JSON.parse(partData);
      const targetPosition = TARGET_POSITIONS[part.category] || [0, 0, 0];
      
      const filtered = placedParts.filter(p => p.category !== part.category);
      updatePlacedParts([...filtered, { ...part, uid: Date.now(), targetPosition }]);

      const stepIndex = buildSteps.findIndex(s => s.key === part.category);
      if (stepIndex === activeStep && activeStep < buildSteps.length - 1) {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const isStepLocked = (stepIndex) => {
    if (stepIndex === 0) return false;
    const previousCategory = buildSteps[stepIndex - 1].key;
    return !placedParts.some(p => p.category === previousCategory);
  };

  const hasCase = placedParts.some(p => p.category === 'case');
  const activeCategory = buildSteps[activeStep].key;

  return (
    <div className="pc-builder-container">
      <div className="parts-sidebar">
        <div className="sidebar-top-bar">
          <h2>3D Builder</h2>
          <button className="exit-btn" onClick={() => navigate('/')}>✕ Exit</button>
        </div>

        <div className="sidebar-actions-bar">
          <button className="action-btn" onClick={handleUndo} disabled={historyIndex === 0}>↩ Undo</button>
          <button className="action-btn" onClick={handleRedo} disabled={historyIndex === history.length - 1}>↪ Redo</button>
          <button className="action-btn clear-btn" onClick={handleClear} disabled={placedParts.length === 0}>🗑 Clear</button>
        </div>
        <p className="sidebar-hint">Drag parts into the 3D grid in order.</p>

        <div className="accordion-container">
          {buildSteps.map((step, index) => {
            const isLocked = isStepLocked(index);
            const isExpanded = activeStep === index;
            const stepComponents = allComponents[step.key] || [];
            const isCompleted = placedParts.some(p => p.category === step.key);

            return (
              <div key={step.key} className={`accordion-item ${isLocked ? 'locked' : ''} ${isExpanded ? 'expanded' : ''}`}>
                <div className="accordion-header" onClick={() => !isLocked && setActiveStep(index)}>
                  <div className="accordion-title">
                    <span className="step-icon">{isCompleted ? "✓" : step.icon}</span>
                    {step.label}
                  </div>
                  <div className="accordion-status">
                    {isLocked ? "🔒" : isExpanded ? "▼" : "▶"}
                  </div>
                </div>
                
                <div className="accordion-content-wrapper">
                  <div className="accordion-content">
                    <div className="components-2col-grid">
                      {stepComponents.map((comp) => (
                        <div
                          key={comp.id}
                          className="draggable-comp-card"
                          draggable
                          onDragStart={(e) => handleDragStart(e, comp, step.key)}
                        >
                          <img src={comp.img} alt={comp.name} />
                          <div className="comp-info">
                            <span className="comp-brand">{comp.brand}</span>
                            <span className="comp-name">{comp.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="canvas-container" onDragOver={handleDragOver} onDrop={handleDrop}>
        {placedParts.length === 0 && (
          <div className="canvas-empty-hint" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.4)', fontSize: '20px', pointerEvents: 'none', zIndex: 10 }}>
            Drag a PC Case here to start
          </div>
        )}
        <Canvas camera={{ position: [12, 6, 12], fov: 45 }}>
          <color attach="background" args={['#0a0a0a']} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 20, 10]} intensity={2.5} penumbra={1} castShadow />
          
          <Environment preset="studio" />

          <OrbitControls 
            enablePan={false} 
            minDistance={8} 
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />

          <group position={[0, -1, 0]}>
            <Grid 
              args={[30, 30]} 
              cellSize={1} 
              cellThickness={1} 
              cellColor="#222" 
              sectionSize={5} 
              sectionThickness={1.5} 
              sectionColor="#444" 
              fadeDistance={30} 
              fadeStrength={1} 
            />
            <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={20} blur={2.5} far={10} />

            <Suspense fallback={null}>
              {hasCase && <GenericPCCase rgbColor={currentRgb} />}

              {hasCase && (
                <>
                  <DropIndicator activeCategory={activeCategory} category="motherboard" position={TARGET_POSITIONS.motherboard} />
                  <DropIndicator activeCategory={activeCategory} category="cpu" position={TARGET_POSITIONS.cpu} />
                  <DropIndicator activeCategory={activeCategory} category="ram" position={TARGET_POSITIONS.ram} />
                  <DropIndicator activeCategory={activeCategory} category="gpu" position={TARGET_POSITIONS.gpu} />
                  <DropIndicator activeCategory={activeCategory} category="psu" position={TARGET_POSITIONS.psu} />
                  <DropIndicator activeCategory={activeCategory} category="storage" position={TARGET_POSITIONS.storage} />
                </>
              )}

              {placedParts.filter(p => p.category !== 'case').map((part) => (
                <Component3DModel 
                  key={part.uid} 
                  part={part} 
                  isPlaced={true} 
                  rgbColor={currentRgb}
                  onClick={(clickedPart) => console.log('Clicked:', clickedPart.name)}
                />
              ))}
            </Suspense>
          </group>
        </Canvas>
      </div>
    </div>
  );
}

export default PCBuilder3D;
