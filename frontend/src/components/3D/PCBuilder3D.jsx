import React, { useState, Suspense, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { buildSteps } from '../Build/Build';
import { useBuild } from '../../contexts/BuildContext';
import { calculateScores } from '../../utilities/scoringEngine';
import { checkCompatibility } from '../../utilities/compatibilityEngine';
import FullscreenGate from '../FullscreenGate/FullscreenGate';
import soundManager from '../../utilities/soundManager';
import EyeTracker from '../EyeTracker';
import GenericPCCase from './GenericPCCase';
import ComponentModels3D from './ComponentModels3D';
import './PCBuilder3D.css';

// Predefined snap positions inside the PC Case
const TARGET_POSITIONS = {
  case: [0, 0, 0],
  motherboard: [1.4, 0.2, -0.6],
  cpu: [1.32, 1.6, -1.2],
  ram: [1.32, 1.6, 0.3],
  gpu: [0.6, -0.5, -0.9],
  psu: [0, -3.5, -2.6],
  storage: [1.33, 0.55, -1.2]
};

// Progression prerequisites for Guided Mode
const STAGE_REQUIREMENTS = {
  case: [],
  motherboard: ['case'],
  cpu: ['motherboard'],
  ram: ['motherboard', 'cpu'],
  storage: ['motherboard'],
  gpu: ['motherboard', 'cpu'],
  psu: ['motherboard', 'gpu']
};

// Camera views dictionaries adapted dynamically for Tower vs Workbench Stance
const CAMERA_PRESETS_TOWER = {
  isometric: { position: [-12, 6, 12], target: [0, 0, 0] },
  whole: { position: [-14, 4.5, 14], target: [0, 0, 0] },
  interior: { position: [-7.5, 0.6, -0.6], target: [1.4, 0.4, -0.6] },
  gpu: { position: [-6.5, -0.8, 0.5], target: [0.6, -0.8, -0.2] },
  front: { position: [0, 0, 14], target: [0, 0, 0] },
  top: { position: [0, 15, 0.1], target: [0, 0, 0] },
  pov: { position: [0.0, 7.2, 7.8], target: [0.0, -2.6, 0.2] }
};

const CAMERA_PRESETS_WORKBENCH = {
  isometric: { position: [-9.5, 8.5, 9.5], target: [0, -2.6, 0.2] },
  whole: { position: [-11.0, 10.0, 10.0], target: [0, -2.6, 0.2] },
  interior: { position: [0.0, 6.2, 4.5], target: [0.0, -2.6, -0.8] },
  gpu: { position: [0.0, 4.8, 4.5], target: [0.0, -2.6, 0.8] },
  front: { position: [0.0, 1.5, 12.0], target: [0.0, -2.6, 0.0] },
  top: { position: [0.0, 13.0, 0.01], target: [0.0, -2.6, 0.0] },
  pov: { position: [0.0, 8.6, 5.8], target: [0.0, -2.6, -0.2] }
};

const CAMERA_PRESETS = CAMERA_PRESETS_TOWER;

// Stage-specific camera targets for guided student learning
const STAGE_CAMERA_FOCUS = {
  case: {
    tower: { position: [-13, 5.5, 13], target: [0, 0, 0] },
    workbench: { position: [-9.5, 8.5, 9.5], target: [0, -2.6, 0.2] },
    tip: 'Stage 01: Chassis Setup — Review outer chassis, dust filters, and motherboard standoffs'
  },
  motherboard: {
    tower: { position: [-7.5, 0.6, -0.6], target: [1.4, 0.4, -0.6] },
    workbench: { position: [0.0, 6.2, 4.5], target: [0.0, -2.6, -0.8] },
    tip: 'Stage 02: Motherboard — Align standoff screws on the interior mounting tray'
  },
  cpu: {
    tower: { position: [-4.2, 2.2, 0.5], target: [1.32, 1.6, -1.2] },
    workbench: { position: [-0.6, 4.2, 2.0], target: [-0.6, -2.6, -1.2] },
    tip: 'Stage 03: CPU (Processor) — Align the gold triangle indicator with socket pin 1'
  },
  ram: {
    tower: { position: [-4.2, 2.2, 2.0], target: [1.32, 1.6, 0.3] },
    workbench: { position: [0.8, 4.2, 2.0], target: [0.8, -2.6, -1.2] },
    tip: 'Stage 04: RAM — Align memory notch with DIMM retention clips and press firmly'
  },
  storage: {
    tower: { position: [-4.2, 1.0, 0.5], target: [1.33, 0.55, -1.2] },
    workbench: { position: [0.0, 4.0, 1.5], target: [0.0, -2.6, -0.4] },
    tip: 'Stage 05: Storage — Insert M.2 NVMe at 30° angle, then secure with standoff screw'
  },
  gpu: {
    tower: { position: [-6.5, -0.8, 0.5], target: [0.6, -0.8, -0.2] },
    workbench: { position: [0.0, 4.8, 4.5], target: [0.0, -2.6, 0.8] },
    tip: 'Stage 06: GPU — Remove rear PCIe slot covers and click card firmly into latch'
  },
  psu: {
    tower: { position: [-7.0, -3.2, 3.5], target: [0, -3.5, -2.6] },
    workbench: { position: [0.0, 4.8, 6.5], target: [0.0, -2.6, 2.5] },
    tip: 'Stage 07: PSU — Slide power supply into basement compartment and route modular cables'
  }
};

// Smooth Camera Controller that transitions on preset click and releases control completely to OrbitControls
function CameraController({ cameraTarget, orbitRef }) {
  const isTransitioningRef = useRef(false);
  const targetPosRef = useRef(new THREE.Vector3(...CAMERA_PRESETS.isometric.position));
  const targetLookRef = useRef(new THREE.Vector3(...CAMERA_PRESETS.isometric.target));

  useEffect(() => {
    if (cameraTarget) {
      targetPosRef.current.set(...cameraTarget.position);
      targetLookRef.current.set(...cameraTarget.target);
      isTransitioningRef.current = true;
    }
  }, [cameraTarget]);

  useFrame((state, delta) => {
    if (!isTransitioningRef.current || !orbitRef.current) return;

    state.camera.position.lerp(targetPosRef.current, delta * 5);
    orbitRef.current.target.lerp(targetLookRef.current, delta * 5);
    orbitRef.current.update();

    // Once close enough, release control so the user can drag freely without snapback!
    if (state.camera.position.distanceTo(targetPosRef.current) < 0.15) {
      isTransitioningRef.current = false;
    }
  });

  return null;
}

// Floating Animated Indicator for active drop zones
function DropIndicator({ activeCategory, category, position, isPlaced }) {
  const meshRef = useRef();
  const isCase = category === 'case';
  
  useFrame((state) => {
    if (meshRef.current) {
      if (!isCase) meshRef.current.rotation.y += 0.02;
      meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.04;
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.04;
    }
  });

  if (activeCategory !== category || isPlaced) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={isCase ? [4.6, 9.2, 9.2] : [1.8, 1.8, 1.8]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={isCase ? 0.35 : 0.4} />
      </mesh>
      {isCase && (
        <mesh position={[0, -4.88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.0, 5.3, 48]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Html center position={[0, isCase ? 0 : 1.3, 0]} distanceFactor={14}>
        <div className="drop-indicator-badge">
          <span className="pulse-dot">●</span> {isCase ? 'Place PC Case On Plane' : `Mount ${category.toUpperCase()} Here`}
        </div>
      </Html>
    </group>
  );
}

function PCBuilder3DWorkspace() {
  const navigate = useNavigate();
  const { currentBuild, allComponents, addComponent, removeComponent, resetBuild, loadDemoBuild } = useBuild();

  // Workspace Viewport Controls State
  const [cameraPreset, setCameraPreset] = useState('isometric');
  const [cameraTarget, setCameraTarget] = useState({
    position: CAMERA_PRESETS.isometric.position,
    target: CAMERA_PRESETS.isometric.target
  });
  const [autoRotate, setAutoRotate] = useState(false);
  const [glassMode, setGlassMode] = useState('closed'); // 'closed', 'open', 'removed'
  const [isExploded, setIsExploded] = useState(false);
  const [rgbColor, setRgbColor] = useState('#00e5ff');
  const [caseColor, setCaseColor] = useState('black'); // 'black' | 'white'
  const [rigStance, setRigStance] = useState('tower'); // 'tower' | 'workbench' (flat POV)
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled);
  const [buildMode, setBuildMode] = useState('guided'); // 'guided' or 'free'
  const [activeStep, setActiveStep] = useState(0);

  // Search in drawer
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Selected & Hovered 3D Component Inspection
  const [inspectedPart, setInspectedPart] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmDisassemble, setConfirmDisassemble] = useState(false);

  const orbitRef = useRef();

  // Play audio safely via central soundManager
  const playSound = (type) => {
    if (!soundEnabled) return;
    soundManager.play(type);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Keyboard shortcut: Escape to deselect active 3D component
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setInspectedPart(null);
        setHoveredPart(null);
        document.body.style.cursor = 'auto';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Convert currentBuild object into array of placed parts
  const placedParts = useMemo(() => {
    const list = [];
    Object.entries(currentBuild).forEach(([cat, comp]) => {
      if (comp) {
        list.push({
          ...comp,
          category: cat,
          targetPosition: TARGET_POSITIONS[cat] || [0, 0, 0]
        });
      }
    });
    return list;
  }, [currentBuild]);

  // Scores & Metrics
  const scores = useMemo(() => calculateScores(currentBuild), [currentBuild]);
  const activeCategory = buildSteps[activeStep]?.key || 'case';

  // Check if a stage is locked based on progression requirements
  const isStageLocked = (stepKey) => {
    if (buildMode === 'free') return false;
    const requirements = STAGE_REQUIREMENTS[stepKey] || [];
    return requirements.some((reqCat) => !currentBuild[reqCat]);
  };

  // Focus camera dynamically on the stage component area with student guidance
  const focusStageCamera = (stageKey) => {
    const focusData = STAGE_CAMERA_FOCUS[stageKey];
    if (!focusData) return;
    const isWorkbench = rigStance === 'workbench';
    const preset = isWorkbench ? focusData.workbench : focusData.tower;
    
    // Automatically open side panel if focusing inside the case
    if (stageKey !== 'case' && glassMode === 'closed') {
      setGlassMode('removed');
    }

    setCameraTarget({
      position: preset.position,
      target: preset.target
    });

    if (focusData.tip) {
      showToast(focusData.tip);
    }
  };

  // Handle stage selection in vertical progression rail
  const handleSelectStage = (idx) => {
    const step = buildSteps[idx];
    if (isStageLocked(step.key)) {
      const reqs = STAGE_REQUIREMENTS[step.key] || [];
      const missing = reqs.filter(r => !currentBuild[r]).map(r => r.toUpperCase()).join(' & ');
      showToast(`Stage Locked: Please install ${missing} first.`);
      playSound('click');
      return;
    }
    setActiveStep(idx);
    playSound('click');
    focusStageCamera(step.key);
  };

  // Trigger camera view preset adapting to stance
  const handleCameraPreset = (presetName) => {
    const presets = rigStance === 'workbench' ? CAMERA_PRESETS_WORKBENCH : CAMERA_PRESETS_TOWER;
    const preset = presets[presetName] || presets.isometric;
    setCameraPreset(presetName);
    
    // If entering interior/gpu/pov view, ensure glass is not blocking
    if ((presetName === 'interior' || presetName === 'gpu' || presetName === 'pov') && glassMode === 'closed') {
      setGlassMode('removed');
    }

    setCameraTarget({
      position: preset.position,
      target: preset.target
    });
  };

  // Focus camera on inspected component
  const handleFocusComponent = (part) => {
    if (part.targetPosition) {
      setCameraTarget({
        position: [part.targetPosition[0] - 5.5, part.targetPosition[1] + 0.8, part.targetPosition[2] + 4],
        target: part.targetPosition
      });
      showToast(`Focused camera on ${part.name}`);
    }
  };

  // Handle 1-Click Component Installation
  const handleInstallPart = (part, category) => {
    addComponent(category, part);
    playSound('install');
    showToast(`Mounted ${part.name}`);

    if (category === 'case') {
      const lowerName = (part.name || '').toLowerCase();
      if (lowerName.includes('white')) setCaseColor('white');
      else if (lowerName.includes('black')) setCaseColor('black');
    }

    setInspectedPart({ ...part, category, targetPosition: TARGET_POSITIONS[category] });

    // In guided mode, automatically advance to next unlocked unplaced step & focus camera
    if (buildMode === 'guided') {
      const nextIdx = buildSteps.findIndex((s, idx) => idx > activeStep && !currentBuild[s.key]);
      if (nextIdx !== -1) {
        setActiveStep(nextIdx);
        setTimeout(() => {
          focusStageCamera(buildSteps[nextIdx]?.key);
        }, 1200);
      }
    }
  };

  // Handle Component Removal
  const handleRemovePart = (category) => {
    removeComponent(category);
    playSound('click');
    if (inspectedPart?.category === category) {
      setInspectedPart(null);
    }
    showToast(`Removed ${category.toUpperCase()}`);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, part, category) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ ...part, category }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (raw) {
        const part = JSON.parse(raw);
        handleInstallPart(part, part.category);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  // Component click in 3D canvas
  const handleSelect3DPart = (part) => {
    setInspectedPart(part);
    playSound('snap');
  };

  // Category filter
  const currentCategoryComponents = allComponents[activeCategory] || [];
  const filteredComponents = currentCategoryComponents.filter((comp) => {
    const s = searchQuery.toLowerCase();
    return (comp.name || '').toLowerCase().includes(s) || (comp.brand || '').toLowerCase().includes(s);
  });

  // RGB Palette presets
  const RGB_PRESETS = [
    { label: 'Cyan', color: '#00e5ff' },
    { label: 'Razer Green', color: '#00e676' },
    { label: 'Neon Purple', color: '#a855f7' },
    { label: 'Solar Amber', color: '#facc15' },
    { label: 'Crimson', color: '#ff3366' },
    { label: 'Pure White', color: '#ffffff' }
  ];

  return (
    <div className="pc-builder-workspace cyber">
      <header className="workspace-header">
        <div className="header-left">
          <button className="back-build-btn" onClick={() => navigate('/build')} title="Return to 2D Component Configurator">
            ← Back to Build
          </button>
          <div className="workspace-brand-wrap">
            <div className="system-logo-mini" title="BuildLab System Logo (Canva 1000x1000 asset pending)">
              <img
                src="/assets/system_logo.png"
                alt="BuildLab Logo"
                className="system-logo-mini-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="system-logo-mini-fallback">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M9 1v3" />
                  <path d="M15 1v3" />
                  <path d="M9 20v3" />
                  <path d="M15 20v3" />
                  <path d="M20 9h3" />
                  <path d="M20 14h3" />
                  <path d="M1 9h3" />
                  <path d="M1 14h3" />
                </svg>
              </div>
            </div>
            <div className="workspace-title-box">
              <span className="workspace-tag">HARDWARE SIMULATION</span>
              <h1 className="workspace-title">BuildLab 3D Studio</h1>
            </div>
          </div>
        </div>

        <div className="header-center-metrics">
          <div className="metric-badge">
            <span className="metric-label">ASSEMBLY</span>
            <span className="metric-val">{placedParts.length} / 7 Parts</span>
          </div>

          <div className="metric-divider"></div>
          <div className="metric-badge">
            <span className="metric-label">EST. POWER</span>
            <span className="metric-val" style={{ color: scores.estWattage > 650 ? '#facc15' : '#00e5ff' }}>
              {scores.estWattage} W
            </span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-badge">
            <span className="metric-label">MODE</span>
            <div className="mode-toggle-pill">
              <button 
                className={`mode-btn ${buildMode === 'guided' ? 'active' : ''}`}
                onClick={() => setBuildMode('guided')}
                title="Step-by-step lock-out progression"
              >
                Guided Lock
              </button>
              <button 
                className={`mode-btn ${buildMode === 'free' ? 'active' : ''}`}
                onClick={() => setBuildMode('free')}
                title="Unlock all stages freely"
              >
                Free Mode
              </button>
            </div>
          </div>
        </div>

        <div className="header-right-actions">
          <button 
            className={`tool-icon-btn ${soundEnabled ? 'active' : ''}`} 
            onClick={() => {
              const next = soundManager.toggleSound();
              setSoundEnabled(next);
            }}
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            )}
          </button>

          <button 
            className="header-action-btn demo-btn" 
            onClick={() => {
              loadDemoBuild();
              playSound('install');
              showToast('Demo Gaming Rig Loaded (7/7 Parts Assembled)');
            }}
            title="Instantly assemble full demo PC"
          >
            Load Demo Rig
          </button>

          <button 
            className="header-action-btn compat-btn" 
            onClick={() => navigate('/compatibility')}
            title="Inspect Compatibility Matrix"
          >
            Compatibility
          </button>

          <button 
            className="header-action-btn clear-btn" 
            onClick={() => {
              playSound('click');
              setConfirmDisassemble(true);
            }}
            disabled={placedParts.length === 0}
            title="Disassemble PC"
          >
            Disassemble
          </button>
        </div>
      </header>

      <div className="workspace-main">
        <aside className={`hardware-drawer ${drawerOpen ? 'open' : 'collapsed'}`}>
          <div className="drawer-header">
            <div className="drawer-title-group">
              <span className="drawer-sub">HARDWARE INVENTORY</span>
              <h3>Assembly Stages</h3>
            </div>
            <button 
              className="drawer-collapse-btn" 
              onClick={() => setDrawerOpen(!drawerOpen)}
              title={drawerOpen ? 'Collapse Drawer' : 'Expand Drawer'}
            >
              {drawerOpen ? '◀' : '▶'}
            </button>
          </div>

          {drawerOpen && (
            <div className="drawer-split-layout">
              <div className="vertical-stages-rail">
                {buildSteps.map((step, idx) => {
                  const isInstalled = !!currentBuild[step.key];
                  const isActive = activeStep === idx;
                  const isLocked = isStageLocked(step.key);

                  return (
                    <button
                      key={step.key}
                      className={`vertical-stage-btn ${isActive ? 'active' : ''} ${isInstalled ? 'installed' : ''} ${isLocked ? 'locked' : ''}`}
                      onClick={() => handleSelectStage(idx)}
                      title={isLocked ? `Locked: Requires ${STAGE_REQUIREMENTS[step.key]?.join(' & ').toUpperCase()}` : step.label}
                    >
                      <div className="stage-num">{step.icon ? `${step.icon} ` : ''}0{idx + 1}</div>
                      <div className="stage-info">
                        <span className="stage-name">{step.label}</span>
                        <span className="stage-status-sub">
                          {isInstalled ? 'Mounted' : isLocked ? 'Locked' : 'Ready'}
                        </span>
                      </div>
                      <div className="stage-badge-indicator">
                        {isInstalled ? '✓' : isLocked ? '•' : '›'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="stage-catalog-panel">
                <div className="stage-panel-header">
                  <div className="active-stage-title-wrap">
                    <span className="active-stage-step-tag">STAGE 0{activeStep + 1}</span>
                    <h4 className="active-stage-name">{buildSteps[activeStep]?.label}</h4>
                  </div>
                  <span className="inventory-count-badge">
                    {filteredComponents.length} Models Available
                  </span>
                </div>

                <div className="drawer-search-bar">
                  <input
                    type="text"
                    placeholder={`Search ${buildSteps[activeStep]?.label}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="drawer-search-input"
                  />
                  {searchQuery && (
                    <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
                  )}
                </div>



                <div className="catalog-cards-container">
                  {filteredComponents.length === 0 ? (
                    <div className="drawer-empty-state">
                      <p>No matching components found.</p>
                    </div>
                  ) : (
                    filteredComponents.map((comp) => {
                      const isSelected = currentBuild[activeCategory]?.id === comp.id;
                      const { isCompatible, reason } = checkCompatibility(comp, currentBuild);

                      return (
                        <div 
                          key={comp.id} 
                          className={`catalog-card ${isSelected ? 'installed-active' : ''} ${!isCompatible ? 'incompatible' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, comp, activeCategory)}
                        >
                          <div className="card-thumb-wrap">
                            <img
                              src={comp.img || '/assets/favicon.svg'}
                              alt={comp.name}
                              onError={(e) => {
                                e.currentTarget.src = '/assets/favicon.svg';
                                e.currentTarget.classList.add('img-fallback');
                              }}
                            />
                            {isSelected && <span className="installed-chip">INSTALLED</span>}
                            {!isCompatible && <span className="warning-chip">MISMATCH</span>}
                          </div>

                          <div className="card-body">
                            <div className="card-brand">{comp.brand || 'GENERIC'}</div>
                            <div className="card-name" title={comp.name}>{comp.name}</div>

                            <div className="card-meta">
                              {comp.wattage && <span className="meta-tag">{comp.wattage}</span>}
                              {comp.socket_type && <span className="meta-tag">{comp.socket_type}</span>}
                              {comp.capacity && <span className="meta-tag">{comp.capacity}</span>}
                              {comp.ddr_type && <span className="meta-tag">{comp.ddr_type}</span>}
                              {comp.form_factor && <span className="meta-tag">{comp.form_factor}</span>}
                            </div>

                            {!isCompatible && (
                              <div className="compatibility-note">{reason}</div>
                            )}

                            <div className="card-actions">
                              {isSelected ? (
                                <button 
                                  className="action-btn remove-btn"
                                  onClick={() => handleRemovePart(activeCategory)}
                                >
                                  Uninstall
                                </button>
                              ) : (
                                <button 
                                  className="action-btn install-btn"
                                  onClick={() => handleInstallPart(comp, activeCategory)}
                                >
                                  Install
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>

        <section 
          className="viewport-area" 
          onDragOver={handleDragOver} 
          onDrop={handleDrop}
        >
          <div className="hud-toolbar camera-hud">
            <span className="hud-title">CAMERA</span>
            <button 
              className={`hud-btn ${cameraPreset === 'whole' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('whole')}
              title="Fit and Frame Whole PC Rig"
            >
              Whole Rig
            </button>
            <button 
              className={`hud-btn ${cameraPreset === 'isometric' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('isometric')}
              title="Isometric 3D Perspective"
            >
              Iso
            </button>
            <button 
              className={`hud-btn ${cameraPreset === 'interior' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('interior')}
              title="Motherboard & Socket Close-up"
            >
              Inside
            </button>
            <button 
              className={`hud-btn ${cameraPreset === 'gpu' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('gpu')}
              title="Graphics Card Focus"
            >
              GPU
            </button>
            <button 
              className={`hud-btn ${cameraPreset === 'front' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('front')}
              title="Front Intake Fans"
            >
              Front
            </button>
            <button 
              className={`hud-btn ${cameraPreset === 'top' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('top')}
              title="Top-Down Plan"
            >
              Top
            </button>
            <button 
              className={`hud-btn pov-cam-btn ${cameraPreset === 'pov' ? 'active' : ''}`}
              onClick={() => {
                handleCameraPreset('pov');
                if (rigStance !== 'workbench') {
                  setRigStance('workbench');
                  if (glassMode === 'closed') setGlassMode('removed');
                  showToast('Switched to Workbench Builder POV');
                }
              }}
              title="YouTube Shorts Builder POV (Over-the-shoulder looking into workbench)"
            >
              Builder POV
            </button>

            <div className="hud-divider"></div>

            <div className="auto-rotate-bob-group">
              <button 
                className={`hud-btn ${autoRotate ? 'active' : ''}`}
                onClick={() => {
                  setAutoRotate(!autoRotate);
                  playSound('click');
                }}
                title="Toggle Constant 360° Turntable Auto-Rotation"
              >
                {autoRotate ? 'Stop Spin' : 'Auto-Rotate'}
              </button>

              <div 
                className="bob-companion-dock" 
                title="B.O.B. — Your 3D Studio Companion (Poke him!)"
                style={{
                  '--bob-rgb-color': rgbColor,
                  '--bob-rgb-glow': `${rgbColor}44`,
                }}
              >
                <div className="bob-coin-pedestal">
                  <EyeTracker
                    size={42}
                    shape="Cube"
                    eyes="Squares"
                    bodyColor={rgbColor}
                    eyeColor="#06080e"
                    bounce={45}
                    follow={80}
                    speechLines={[
                      "Hi! I'm B.O.B.",
                      "Loving the RGB Aura color!",
                      "Nice airflow orientation!",
                      "Cable management looking clean.",
                      "Click auto-rotate to inspect all angles!",
                      "That tickles!",
                      "Poke me anytime while building!"
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hud-toolbar tools-hud">
            <div className="tool-pill-group">
              <span className="hud-title">STANCE</span>
              <button 
                className={`hud-btn ${rigStance === 'tower' ? 'active' : ''}`}
                onClick={() => {
                  setRigStance('tower');
                  setCameraPreset('isometric');
                  setCameraTarget(CAMERA_PRESETS_TOWER.isometric);
                  playSound('click');
                  showToast('Tower Stance: Upright Chassis Orientation');
                }}
                title="Upright Tower Stance"
              >
                Tower
              </button>
              <button 
                className={`hud-btn ${rigStance === 'workbench' ? 'active' : ''}`}
                onClick={() => {
                  setRigStance('workbench');
                  setCameraPreset('pov');
                  setCameraTarget(CAMERA_PRESETS_WORKBENCH.pov);
                  if (glassMode === 'closed') setGlassMode('removed');
                  playSound('slide');
                  showToast('Builder POV Mode: Rig lying flat on workbench (Restricted eye movement)');
                }}
                title="Workbench Flat Laying Stance (Builder POV)"
              >
                Workbench (Flat)
              </button>
            </div>

            <div className="hud-divider"></div>

            <div className="tool-pill-group">
              <span className="hud-title">CHASSIS</span>
              <button 
                className={`hud-btn ${caseColor === 'black' ? 'active' : ''}`}
                onClick={() => {
                  setCaseColor('black');
                  playSound('click');
                }}
                title="Stealth Black Finish"
              >
                Black
              </button>
              <button 
                className={`hud-btn ${caseColor === 'white' ? 'active' : ''}`}
                onClick={() => {
                  setCaseColor('white');
                  playSound('click');
                }}
                title="Arctic White Finish"
              >
                White
              </button>
            </div>

            <div className="hud-divider"></div>

            <div className="tool-pill-group">
              <span className="hud-title">SIDE PANEL</span>
              <button 
                className={`hud-btn ${glassMode === 'closed' ? 'active' : ''}`}
                onClick={() => setGlassMode('closed')}
                title="Glass Panel On"
              >
                Closed
              </button>
              <button 
                className={`hud-btn ${glassMode === 'open' ? 'active' : ''}`}
                onClick={() => setGlassMode('open')}
                title="Hinged Open"
              >
                Open
              </button>
              <button 
                className={`hud-btn ${glassMode === 'removed' ? 'active' : ''}`}
                onClick={() => setGlassMode('removed')}
                title="Panel Removed (Best for internal inspection)"
              >
                Off
              </button>
            </div>

            <div className="hud-divider"></div>

            <button 
              className={`hud-btn explode-btn ${isExploded ? 'active' : ''}`}
              onClick={() => setIsExploded(!isExploded)}
              title="Toggle Exploded Assembly Diagram"
            >
              {isExploded ? 'Assembled View' : 'Exploded View'}
            </button>
          </div>

          <div className="hud-toolbar aesthetics-hud">
            <span className="hud-title">RGB AURA</span>
            <div className="color-swatches">
              {RGB_PRESETS.map((p) => (
                <button
                  key={p.color}
                  className={`color-dot ${rgbColor === p.color ? 'active' : ''}`}
                  style={{ backgroundColor: p.color, boxShadow: rgbColor === p.color ? `0 0 10px ${p.color}` : 'none' }}
                  onClick={() => setRgbColor(p.color)}
                  title={p.label}
                />
              ))}
            </div>
          </div>

          <Canvas 
            camera={{ position: CAMERA_PRESETS.isometric.position, fov: 42 }}
            gl={{ 
              antialias: true, 
              alpha: false,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.95
            }}
            onPointerMissed={(e) => {
              // Click in empty space deselects active 3D part and closes inspector
              if (e.type === 'click') {
                setInspectedPart(null);
                setHoveredPart(null);
                document.body.style.cursor = 'auto';
              }
            }}
          >
            <color attach="background" args={['#0e1420']} />
            <fog attach="fog" args={['#0e1420', 30, 80]} />

            <ambientLight intensity={0.85} color="#e2e8f0" />
            <directionalLight 
              position={[-16, 22, 16]} 
              intensity={2.4} 
              castShadow 
              color="#fff8ed"
            />
            <directionalLight 
              position={[16, 16, -14]} 
              intensity={1.1} 
              color="#93c5fd"
            />
            <directionalLight 
              position={[0, -6, 0]} 
              intensity={0.6} 
              color="#fed7aa"
            />
            <directionalLight 
              position={[0, 8, 18]} 
              intensity={1.0} 
              color="#f8fafc"
            />
            
            <pointLight position={[0.5, 1.5, 0]} intensity={2.0} color="#ffffff" distance={12} />
            <pointLight position={[-0.5, -1.5, 0]} intensity={1.5} color="#ffffff" distance={10} />
            <pointLight position={[0, 0, 3.5]} intensity={1.8} color={rgbColor} distance={8} />

            <Environment preset="studio" />

            <CameraController cameraTarget={cameraTarget} orbitRef={orbitRef} />
            <OrbitControls 
              ref={orbitRef}
              enablePan={true}
              panSpeed={rigStance === 'workbench' ? 0.35 : 0.8}
              enableDamping={true}
              dampingFactor={0.08}
              minDistance={rigStance === 'workbench' ? 3.8 : 3.0} 
              maxDistance={rigStance === 'workbench' ? 12.0 : 28}
              minPolarAngle={rigStance === 'workbench' ? Math.PI / 4.2 : 0}
              maxPolarAngle={rigStance === 'workbench' ? Math.PI / 2.3 : Math.PI / 2 + 0.05}
              minAzimuthAngle={rigStance === 'workbench' ? -Math.PI / 5.5 : -Infinity}
              maxAzimuthAngle={rigStance === 'workbench' ? Math.PI / 5.5 : Infinity}
              autoRotate={autoRotate && rigStance !== 'workbench'}
              autoRotateSpeed={2.2}
            />

            <group position={[0, 5, -24]}>
              <mesh position={[0, 2, 0]}>
                <planeGeometry args={[70, 28]} />
                <meshStandardMaterial color="#0c101a" roughness={0.9} />
              </mesh>
              <group position={[-16, 6, 0.2]}>
                <mesh position={[0, 0, 0]}>
                  <planeGeometry args={[14, 18]} />
                  <meshBasicMaterial color="#1e293b" />
                </mesh>
                <mesh position={[0, 0, 0.05]}>
                  <boxGeometry args={[0.2, 18, 0.1]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0, 0, 0.05]}>
                  <boxGeometry args={[14, 0.2, 0.1]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0, 0, 0.02]}>
                  <planeGeometry args={[13.6, 17.6]} />
                  <meshBasicMaterial color="#e0f2fe" transparent opacity={0.12} />
                </mesh>
              </group>
              <group position={[18, 6, 0.2]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[16, 0.3, 1.5]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.7} />
                </mesh>
                <mesh position={[0, -5, 0]}>
                  <boxGeometry args={[16, 0.3, 1.5]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.7} />
                </mesh>
              </group>
            </group>

            <group position={[0, 0, 0]}>
              <mesh 
                position={[0, -5.5, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectedPart(null);
                  setHoveredPart(null);
                  document.body.style.cursor = 'auto';
                }}
              >
                <boxGeometry args={[48, 1.2, 38]} />
                <meshStandardMaterial color="#181f2c" roughness={0.65} metalness={0.2} />
              </mesh>

              <mesh position={[0, -4.89, 0]}>
                <boxGeometry args={[48.3, 0.04, 38.3]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
              </mesh>

              <mesh 
                position={[0, -4.88, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectedPart(null);
                  setHoveredPart(null);
                  document.body.style.cursor = 'auto';
                }}
              >
                <boxGeometry args={[28, 0.04, 22]} />
                <meshStandardMaterial color="#1e283a" roughness={0.88} metalness={0.1} />
              </mesh>

              <mesh position={[0, -4.87, 0]}>
                <boxGeometry args={[28.2, 0.02, 22.2]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
              </mesh>

              {[
                [-12.5, -4.86, 9.5],
                [12.5, -4.86, 9.5],
                [-12.5, -4.86, -9.5],
                [12.5, -4.86, -9.5]
              ].map((pos, idx) => (
                <group key={`tray-${idx}`} position={pos}>
                  <mesh>
                    <boxGeometry args={[2.2, 0.05, 2.2]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.9} />
                  </mesh>
                  <mesh position={[0, 0.03, 0]}>
                    <boxGeometry args={[2.0, 0.02, 2.0]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
                  </mesh>
                </group>
              ))}

              <Grid 
                position={[0, -4.85, 0]}
                args={[48, 38]} 
                cellSize={1} 
                cellThickness={1.0} 
                cellColor="#2e3e58" 
                sectionSize={5} 
                sectionThickness={1.8} 
                sectionColor="#38bdf8" 
                fadeDistance={36} 
                fadeStrength={1.2} 
              />
              <ContactShadows 
                position={[0, -4.84, 0]} 
                opacity={0.8} 
                scale={28} 
                blur={2.0} 
                far={12} 
                color="#060911" 
              />

              <Suspense fallback={null}>
                <group 
                  position={rigStance === 'workbench' ? [0, -2.60, 0] : [0, 0, 0]} 
                  rotation={rigStance === 'workbench' ? [0, Math.PI / 2, -Math.PI / 2] : [0, 0, 0]}
                >
                  {currentBuild.case && (
                    <GenericPCCase 
                      part={currentBuild.case}
                      rgbColor={rgbColor}
                      caseColor={caseColor}
                      glassMode={glassMode}
                      explodedProgress={isExploded ? 1 : 0}
                      isSelected={inspectedPart?.category === 'case'}
                      isHovered={hoveredPart?.category === 'case'}
                      onSelect={handleSelect3DPart}
                      onHover={(p, h) => setHoveredPart(h ? p : null)}
                    />
                  )}

                  {buildSteps.map((step) => (
                    <DropIndicator 
                      key={step.key}
                      activeCategory={activeCategory}
                      category={step.key}
                      position={TARGET_POSITIONS[step.key]}
                      isPlaced={!!currentBuild[step.key]}
                    />
                  ))}

                  {placedParts.filter(part => part.category !== 'case').map((part) => (
                    <ComponentModels3D 
                      key={part.category} 
                      part={part}
                      rgbColor={rgbColor}
                      explodedProgress={isExploded ? 1 : 0}
                      isSelected={inspectedPart?.category === part.category}
                      isHovered={hoveredPart?.category === part.category}
                      onSelect={handleSelect3DPart}
                      onHover={(p, h) => setHoveredPart(h ? p : null)}
                    />
                  ))}
                </group>
              </Suspense>
            </group>
          </Canvas>

          {inspectedPart && (
            <div className="inspector-card">
              <div className="inspector-header">
                <div className="inspector-category-tag">
                  {inspectedPart.category.toUpperCase()}
                </div>
                <button className="inspector-close-btn" onClick={() => setInspectedPart(null)}>✕</button>
              </div>

              <div className="inspector-body">
                <h4 className="inspector-name">{inspectedPart.name}</h4>
                <div className="inspector-brand">{inspectedPart.brand}</div>

                <div className="inspector-specs-grid">
                  {inspectedPart.socket_type && (
                    <div className="spec-item"><span className="spec-lbl">Socket</span><span className="spec-val">{inspectedPart.socket_type}</span></div>
                  )}
                  {inspectedPart.wattage && (
                    <div className="spec-item"><span className="spec-lbl">Wattage</span><span className="spec-val">{inspectedPart.wattage}</span></div>
                  )}
                  {inspectedPart.power_required && (
                    <div className="spec-item"><span className="spec-lbl">Power Req</span><span className="spec-val">{inspectedPart.power_required}</span></div>
                  )}
                  {inspectedPart.capacity && (
                    <div className="spec-item"><span className="spec-lbl">Capacity</span><span className="spec-val">{inspectedPart.capacity}</span></div>
                  )}
                  {inspectedPart.form_factor && (
                    <div className="spec-item"><span className="spec-lbl">Form Factor</span><span className="spec-val">{inspectedPart.form_factor}</span></div>
                  )}
                  {inspectedPart.ddr_type && (
                    <div className="spec-item"><span className="spec-lbl">DDR Type</span><span className="spec-val">{inspectedPart.ddr_type}</span></div>
                  )}
                </div>

                <div className="inspector-actions">
                  <button 
                    className="insp-btn focus-btn"
                    onClick={() => handleFocusComponent(inspectedPart)}
                  >
                    Focus Camera
                  </button>
                  <button 
                    className="insp-btn swap-btn"
                    onClick={() => {
                      const idx = buildSteps.findIndex(s => s.key === inspectedPart.category);
                      if (idx !== -1) setActiveStep(idx);
                      setDrawerOpen(true);
                    }}
                  >
                    Swap Part
                  </button>
                  <button 
                    className="insp-btn remove-btn"
                    onClick={() => handleRemovePart(inspectedPart.category)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {toastMessage && (
            <div className="workspace-toast">
              {toastMessage}
            </div>
          )}
        </section>
      </div>

      {confirmDisassemble && (
        <div
          className="builder-confirm-overlay"
          onClick={() => setConfirmDisassemble(false)}
        >
          <div className="builder-confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="builder-confirm-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            <h3 className="builder-confirm-title">Disassemble Rig?</h3>
            <p className="builder-confirm-desc">
              All installed components will be removed from the current 3D build.
              Your parts stay in the inventory drawer.
            </p>
            <div className="builder-confirm-actions">
              <button
                type="button"
                className="builder-confirm-btn ghost"
                onClick={() => setConfirmDisassemble(false)}
              >
                Keep Building
              </button>
              <button
                type="button"
                className="builder-confirm-btn danger"
                onClick={() => {
                  resetBuild();
                  setInspectedPart(null);
                  setConfirmDisassemble(false);
                  playSound('install');
                  showToast('Rig Disassembled');
                }}
              >
                Yes, Disassemble
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * PCBuilder3D — routed at /3d-builder with the FullscreenGate wrapper.
 * The 3D studio is an immersive workspace: the user is kept in fullscreen
 * mode (browsers still allow Esc, but the gate immediately re-prompts
 * them back in via the overlay banner).
 */
function PCBuilder3D() {
  return (
    <FullscreenGate requireFullscreen>
      <PCBuilder3DWorkspace />
    </FullscreenGate>
  );
}

export default PCBuilder3D;
