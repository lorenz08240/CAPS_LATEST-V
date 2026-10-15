import React, { useState, Suspense, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { buildSteps } from '../Build/Build';
import { useBuild } from '../../contexts/BuildContext';
import { calculateScores } from '../../utilities/scoringEngine';
import { checkCompatibility } from '../../utilities/compatibilityEngine';
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

// Camera views dictionary
const CAMERA_PRESETS = {
  isometric: { position: [-12, 6, 12], target: [0, 0, 0] },
  whole: { position: [-14, 4.5, 14], target: [0, 0, 0] },
  interior: { position: [-7.5, 0.6, -0.6], target: [1.4, 0.4, -0.6] },
  gpu: { position: [-6.5, -0.8, 0.5], target: [0.6, -0.8, -0.2] },
  front: { position: [0, 0, 14], target: [0, 0, 0] },
  top: { position: [0, 15, 0.1], target: [0, 0, 0] }
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
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.08;
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.08;
    }
  });

  if (activeCategory !== category || isPlaced) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.4} />
      </mesh>
      <Html center position={[0, 1.3, 0]} distanceFactor={14}>
        <div className="drop-indicator-badge">
          <span className="pulse-dot">●</span> Mount {category.toUpperCase()} Here
        </div>
      </Html>
    </group>
  );
}

function PCBuilder3D() {
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
  const [lightingTheme, setLightingTheme] = useState('cyber'); // 'cyber', 'studio', 'stealth'
  const [rgbColor, setRgbColor] = useState('#00e5ff');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [buildMode, setBuildMode] = useState('guided'); // 'guided' or 'free'
  const [activeStep, setActiveStep] = useState(0);

  // Search & Filter in drawer
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Selected & Hovered 3D Component Inspection
  const [inspectedPart, setInspectedPart] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const orbitRef = useRef();

  // Play audio safely
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(`/sfx/${type}.wav`);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

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

  // Handle stage selection in vertical progression rail
  const handleSelectStage = (idx) => {
    const step = buildSteps[idx];
    if (isStageLocked(step.key)) {
      const reqs = STAGE_REQUIREMENTS[step.key] || [];
      const missing = reqs.filter(r => !currentBuild[r]).map(r => r.toUpperCase()).join(' & ');
      showToast(`🔒 Stage Locked: Please install ${missing} first!`);
      playSound('click');
      return;
    }
    setActiveStep(idx);
    playSound('click');
  };

  // Trigger camera view preset
  const handleCameraPreset = (presetName) => {
    const preset = CAMERA_PRESETS[presetName] || CAMERA_PRESETS.isometric;
    setCameraPreset(presetName);
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
      showToast(`🎯 Focused on ${part.name}`);
    }
  };

  // Handle 1-Click Component Installation
  const handleInstallPart = (part, category) => {
    addComponent(category, part);
    playSound('install');
    showToast(`✓ Installed ${part.name}`);

    setInspectedPart({ ...part, category, targetPosition: TARGET_POSITIONS[category] });

    // In guided mode, automatically advance to next unlocked unplaced step
    if (buildMode === 'guided') {
      const nextIdx = buildSteps.findIndex((s, idx) => idx > activeStep && !currentBuild[s.key]);
      if (nextIdx !== -1) {
        setActiveStep(nextIdx);
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
    showToast(`✕ Removed ${category.toUpperCase()}`);
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
    const matchName = (comp.name || '').toLowerCase().includes(s) || (comp.brand || '').toLowerCase().includes(s);
    if (!matchName) return false;
    if (!tierFilter) return true;
    const combined = `${comp.name} ${comp.brand} ${comp.desc || ''}`.toLowerCase();
    if (tierFilter === 'budget') return combined.includes('i3') || combined.includes('ryzen 3') || combined.includes('a520') || combined.includes('h610') || combined.includes('1650') || combined.includes('500w');
    if (tierFilter === 'mid') return combined.includes('i5') || combined.includes('ryzen 5') || combined.includes('b550') || combined.includes('b760') || combined.includes('4060') || combined.includes('650w');
    if (tierFilter === 'high') return combined.includes('i7') || combined.includes('i9') || combined.includes('ryzen 7') || combined.includes('ryzen 9') || combined.includes('4080') || combined.includes('4090') || combined.includes('850w');
    return true;
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
    <div className={`pc-builder-workspace ${lightingTheme}`}>
      {/* ── TOP HUD HEADER BAR ── */}
      <header className="workspace-header">
        <div className="header-left">
          <button className="back-build-btn" onClick={() => navigate('/build')} title="Return to 2D Component Configurator">
            ← Back to Build
          </button>
          <div className="workspace-title-box">
            <span className="workspace-tag">HARDWARE SIMULATION</span>
            <h1 className="workspace-title">BuildLab 3D Studio</h1>
          </div>
        </div>

        {/* Live Metrics Badge Row */}
        <div className="header-center-metrics">
          <div className="metric-badge">
            <span className="metric-label">ASSEMBLY</span>
            <span className="metric-val">{placedParts.length} / 7 Parts</span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-badge">
            <span className="metric-label">TOTAL COST</span>
            <span className="metric-val" style={{ color: '#00e676' }}>
              {scores.totalCostFormatted}
            </span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-badge">
            <span className="metric-label">EST. POWER</span>
            <span className="metric-val" style={{ color: scores.estWattage > 650 ? '#facc15' : '#00e5ff' }}>
              ⚡ {scores.estWattage}W
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
          {/* Sound FX Toggle */}
          <button 
            className={`tool-icon-btn ${soundEnabled ? 'active' : ''}`} 
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Load Demo Rig */}
          <button 
            className="header-action-btn demo-btn" 
            onClick={() => {
              loadDemoBuild();
              playSound('install');
              showToast('⚡ Demo Gaming Rig Loaded (7/7 Parts Assembled)');
            }}
            title="Instantly assemble full demo PC"
          >
            ⚡ Load Demo Rig
          </button>

          {/* Quick Compatibility Link */}
          <button 
            className="header-action-btn compat-btn" 
            onClick={() => navigate('/compatibility')}
            title="Inspect Compatibility Matrix"
          >
            🛡️ Compatibility
          </button>

          {/* Disassemble / Clear */}
          <button 
            className="header-action-btn clear-btn" 
            onClick={() => {
              if (window.confirm('Disassemble all components in the current 3D rig?')) {
                resetBuild();
                setInspectedPart(null);
                playSound('click');
                showToast('Rig Disassembled');
              }
            }}
            disabled={placedParts.length === 0}
            title="Disassemble PC"
          >
            🗑 Disassemble
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <div className="workspace-main">
        {/* ── LEFT HARDWARE DRAWER WITH VERTICAL PROGRESSION (PATAYO) ── */}
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
              {/* VERTICAL STAGE PROGRESSION RAIL (PATAYO) */}
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
                          {isInstalled ? '✓ Mounted' : isLocked ? '🔒 Locked' : '● Ready'}
                        </span>
                      </div>
                      <div className="stage-badge-indicator">
                        {isInstalled ? '✓' : isLocked ? '🔒' : '▶'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ACTIVE CATEGORY INVENTORY & CARDS */}
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

                {/* Search & Tier Filter Bar */}
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

                <div className="drawer-tier-pills">
                  <button className={`tier-pill ${tierFilter === '' ? 'active' : ''}`} onClick={() => setTierFilter('')}>ALL</button>
                  <button className={`tier-pill ${tierFilter === 'budget' ? 'active' : ''}`} onClick={() => setTierFilter('budget')}>BUDGET</button>
                  <button className={`tier-pill ${tierFilter === 'mid' ? 'active' : ''}`} onClick={() => setTierFilter('mid')}>MID-TIER</button>
                  <button className={`tier-pill ${tierFilter === 'high' ? 'active' : ''}`} onClick={() => setTierFilter('high')}>HIGH-END</button>
                </div>

                {/* Component Cards Grid */}
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
                            <img src={comp.img} alt={comp.name} />
                            {isSelected && <span className="installed-chip">✓ INSTALLED</span>}
                            {!isCompatible && <span className="warning-chip">⚠️ MISMATCH</span>}
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
                              <div className="compatibility-note">⚠️ {reason}</div>
                            )}

                            <div className="card-actions">
                              {isSelected ? (
                                <button 
                                  className="action-btn remove-btn"
                                  onClick={() => handleRemovePart(activeCategory)}
                                >
                                  ✕ Uninstall
                                </button>
                              ) : (
                                <button 
                                  className="action-btn install-btn"
                                  onClick={() => handleInstallPart(comp, activeCategory)}
                                >
                                  + Install in 3D
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

        {/* ── 3D VIEWPORT CANVAS AREA ── */}
        <section 
          className="viewport-area" 
          onDragOver={handleDragOver} 
          onDrop={handleDrop}
        >
          {/* ── FLOATING VIEWPORT HUD CONTROLS ── */}

          {/* 1. Camera View Angle Presets & Turntable */}
          <div className="hud-toolbar camera-hud">
            <span className="hud-title">CAMERA</span>
            <button 
              className={`hud-btn ${cameraPreset === 'whole' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('whole')}
              title="Fit and Frame Whole PC Rig"
            >
              🏠 Whole Rig
            </button>
            <button 
              className={`hud-btn ${cameraPreset === 'isometric' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('isometric')}
              title="Isometric 3D Perspective"
            >
              📐 Iso
            </button>
            <button 
              className={`hud-btn ${cameraPreset === 'interior' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('interior')}
              title="Motherboard & Socket Close-up"
            >
              🔍 Inside
            </button>
            <button 
              className={`hud-btn ${cameraPreset === 'gpu' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('gpu')}
              title="Graphics Card Focus"
            >
              🎮 GPU
            </button>
            <button 
              className={`hud-btn ${cameraPreset === 'front' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('front')}
              title="Front Intake Fans"
            >
              🚪 Front
            </button>
            <button 
              className={`hud-btn ${cameraPreset === 'top' ? 'active' : ''}`}
              onClick={() => handleCameraPreset('top')}
              title="Top-Down Plan"
            >
              ⬆️ Top
            </button>

            <div className="hud-divider"></div>

            {/* 360° Turntable Auto-Rotate Button */}
            <button 
              className={`hud-btn ${autoRotate ? 'active' : ''}`}
              onClick={() => {
                setAutoRotate(!autoRotate);
                playSound('click');
              }}
              title="Toggle Constant 360° Turntable Auto-Rotation"
            >
              {autoRotate ? '⏸️ Stop Spin' : '🔄 Auto-Rotate'}
            </button>
          </div>

          {/* 2. Chassis & Assembly Toolset */}
          <div className="hud-toolbar tools-hud">
            <div className="tool-pill-group">
              <span className="hud-title">SIDE PANEL</span>
              <button 
                className={`hud-btn ${glassMode === 'closed' ? 'active' : ''}`}
                onClick={() => setGlassMode('closed')}
                title="Glass Panel On"
              >
                🪟 Closed
              </button>
              <button 
                className={`hud-btn ${glassMode === 'open' ? 'active' : ''}`}
                onClick={() => setGlassMode('open')}
                title="Hinged Open"
              >
                📂 Open
              </button>
              <button 
                className={`hud-btn ${glassMode === 'removed' ? 'active' : ''}`}
                onClick={() => setGlassMode('removed')}
                title="Panel Removed (Best for internal inspection)"
              >
                ✕ Off
              </button>
            </div>

            <div className="hud-divider"></div>

            {/* Exploded View Toggle */}
            <button 
              className={`hud-btn explode-btn ${isExploded ? 'active' : ''}`}
              onClick={() => setIsExploded(!isExploded)}
              title="Toggle Exploded Assembly Diagram"
            >
              💥 {isExploded ? 'Assembled View' : 'Exploded View'}
            </button>
          </div>

          {/* 3. RGB Theme & Studio Lighting */}
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

            <div className="hud-divider"></div>

            <span className="hud-title">LIGHTS</span>
            <button 
              className={`hud-btn ${lightingTheme === 'cyber' ? 'active' : ''}`}
              onClick={() => setLightingTheme('cyber')}
              title="Neon Cyberpunk Studio"
            >
              🌆 Cyber
            </button>
            <button 
              className={`hud-btn ${lightingTheme === 'studio' ? 'active' : ''}`}
              onClick={() => setLightingTheme('studio')}
              title="Clean High-Key Studio"
            >
              💡 Clean
            </button>
            <button 
              className={`hud-btn ${lightingTheme === 'stealth' ? 'active' : ''}`}
              onClick={() => setLightingTheme('stealth')}
              title="Stealth Dark Room"
            >
              🌙 Dark
            </button>
          </div>

          {/* ── 3D CANVAS SCENE (With Refined Lighting, No Snapback, and No Ground Sinking) ── */}
          <Canvas 
            camera={{ position: CAMERA_PRESETS.isometric.position, fov: 42 }}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={[lightingTheme === 'studio' ? '#182130' : '#0a0e17']} />

            {/* 3-Point Studio Lighting + Brilliant Internal Chassis Fill */}
            <ambientLight intensity={lightingTheme === 'studio' ? 1.5 : 1.2} />
            <directionalLight 
              position={[-15, 20, 15]} 
              intensity={lightingTheme === 'studio' ? 3.0 : 2.5} 
              castShadow 
            />
            <directionalLight 
              position={[15, 10, -10]} 
              intensity={1.8} 
              color="#cbd5e1"
            />
            <directionalLight 
              position={[0, -5, 15]} 
              intensity={1.2} 
              color="#94a3b8"
            />
            
            {/* Direct Internal Case Illumination */}
            <pointLight position={[0.5, 1.5, 0]} intensity={3.5} color="#ffffff" distance={12} />
            <pointLight position={[-0.5, -1.5, 0]} intensity={2.2} color="#ffffff" distance={10} />
            <pointLight position={[0, 0, 3.5]} intensity={2.8} color={rgbColor} distance={8} />

            <Environment preset={lightingTheme === 'studio' ? 'city' : 'night'} />

            {/* Camera Controller & OrbitControls with Free Dragging and Auto-Rotate */}
            <CameraController cameraTarget={cameraTarget} orbitRef={orbitRef} />
            <OrbitControls 
              ref={orbitRef}
              enablePan={true}
              minDistance={5} 
              maxDistance={28}
              maxPolarAngle={Math.PI / 2 + 0.05}
              autoRotate={autoRotate}
              autoRotateSpeed={2.2}
            />

            {/* 3D Scene Root */}
            <group position={[0, 0, 0]}>
              {/* Ground Grid resting exactly at case rubber feet Y = -4.9 (NO SINKING!) */}
              <Grid 
                position={[0, -4.9, 0]}
                args={[50, 50]} 
                cellSize={1} 
                cellThickness={1} 
                cellColor="#242e42" 
                sectionSize={5} 
                sectionThickness={1.5} 
                sectionColor="#3d4d6b" 
                fadeDistance={45} 
                fadeStrength={1} 
              />
              <ContactShadows 
                position={[0, -4.89, 0]} 
                opacity={0.8} 
                scale={28} 
                blur={2.5} 
                far={14} 
              />

              <Suspense fallback={null}>
                {/* 1. PC Case Chassis */}
                <GenericPCCase 
                  rgbColor={rgbColor}
                  glassMode={glassMode}
                  explodedProgress={isExploded ? 1 : 0}
                />

                {/* 2. Active Drop Zone Indicators */}
                {buildSteps.map((step) => (
                  <DropIndicator 
                    key={step.key}
                    activeCategory={activeCategory}
                    category={step.key}
                    position={TARGET_POSITIONS[step.key]}
                    isPlaced={!!currentBuild[step.key]}
                  />
                ))}

                {/* 3. Installed Internal 3D Components */}
                {placedParts.map((part) => (
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
              </Suspense>
            </group>
          </Canvas>

          {/* ── ACTIVE INSPECTOR HUD POPUP ── */}
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
                    🎯 Focus Camera
                  </button>
                  <button 
                    className="insp-btn swap-btn"
                    onClick={() => {
                      const idx = buildSteps.findIndex(s => s.key === inspectedPart.category);
                      if (idx !== -1) setActiveStep(idx);
                      setDrawerOpen(true);
                    }}
                  >
                    🔄 Swap Part
                  </button>
                  <button 
                    className="insp-btn remove-btn"
                    onClick={() => handleRemovePart(inspectedPart.category)}
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TOAST ALERT ── */}
          {toastMessage && (
            <div className="workspace-toast">
              {toastMessage}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default PCBuilder3D;
