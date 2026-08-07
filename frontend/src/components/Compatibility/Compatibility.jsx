import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { checkCompatibility, getCompatibilitySummary } from "../../utilities/rules";
import "./Compatibility.css";

/* Ensure Link has display properties */
const saveSlotBtnStyle = {
  display: "block",
  width: "100%",
  marginTop: "8px",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  border: "none",
  padding: "10px 16px",
  borderRadius: "var(--r-sm)",
  borderRadius: "var(--r-sm)",
  fontFamily: "var(--font-display)",
  fontSize: "19px",
  fontWeight: "700",
  letterSpacing: "0.06em",
  cursor: "pointer",
  transition: "background 0.18s, color 0.18s",
};

export default function Compatibility({ isIntegrated = false }) {
  const {
    currentBuild,
    getSelectedComponents,
    savedBuilds,
    selectedSaveSlot,
    setSelectedSaveSlot,
    getSavedBuild: originalGetSavedBuild,
    saveBuildSnapshot,
    resetBuild,
    allComponents,
  } = useBuild();

  const getSavedBuild = (slot) => {
    const b = savedBuilds[slot];
    if (!b) return null;
    return b;
  };

  const selectedComponents = getSelectedComponents().sort((a, b) => {
    const order = ["case", "motherboard", "cpu", "ram", "storage", "gpu", "psu"];
    return order.indexOf(a.category.toLowerCase()) - order.indexOf(b.category.toLowerCase());
  });
  const [compareMode, setCompareMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [bottleneckDismissed, setBottleneckDismissed] = useState(false);
  const [issueModal, setIssueModal] = useState(null); // { slot, issues[] }

  /* ── Saved build helpers ── */
  const savedComponents = useMemo(() => {
    const b = getSavedBuild(selectedSaveSlot);
    if (!b) return [];
    return Object.entries(b)
      .filter(([, v]) => v !== null)
      .map(([category, component]) => ({ category, ...component }));
  }, [selectedSaveSlot, getSavedBuild]);

  const savedBuild = getSavedBuild(selectedSaveSlot);
  const hasSavedBuild = Boolean(savedBuild && savedComponents.length > 0);
  const metrics = ["CPU", "GPU", "RAM", "SSD", "PSU"];

  const getCpuScore = (cpu) => {
    if (!cpu || !Array.isArray(cpu.tags)) return 0;
    const tag = cpu.tags.find((t) => /\d+\s*cores?/i.test(t));
    const cores = tag ? parseInt(tag.match(/(\d+)/)[1], 10) : 4;
    if (cores >= 24) return 100;
    if (cores >= 16) return 92;
    if (cores >= 8) return 76;
    if (cores >= 6) return 58;
    return 40;
  };

  const getGpuScore = (gpu) => {
    if (!gpu) return 0;
    const w = gpu.power_required || 0;
    if (w >= 700) return 100;
    if (w >= 550) return 86;
    if (w >= 400) return 68;
    if (w > 0) return 50;
    return 30;
  };

  const getRamScore = (ram) => {
    if (!ram || !Array.isArray(ram.tags)) return 0; // Dagdagan ng check
    const cap = parseInt(
      ram.tags.find((t) => /\d+GB/i.test(t))?.match(/(\d+)/)?.[1] || "8",
      10
    );
    const spd = parseInt(
      ram.tags.find((t) => /\d+MHz/i.test(t))?.match(/(\d+)/)?.[1] || "2400",
      10
    );
    let s = cap >= 32 ? 50 : cap >= 16 ? 35 : 20;
    s += spd >= 5600 ? 50 : spd >= 3600 ? 38 : 24;
    return Math.min(100, s);
  };

  const getStorageScore = (storage) => {
    if (!storage) return 0;
    const type = (
      storage.type ||
      storage.tags?.find((t) => /(nvme|ssd|hdd)/i.test(t)) ||
      ""
    ).toLowerCase();
    if (type.includes("nvme")) return 100;
    if (type.includes("ssd")) return 80;
    if (type.includes("hdd")) return 40;
    return 60;
  };

  const getPsuScore = (psu) => {
    if (!psu) return 0;
    const w = psu.wattage || 0;
    if (w >= 850) return 100;
    if (w >= 650) return 80;
    if (w >= 550) return 60;
    return 40;
  };

  const metricScore = (build, metric) => {
    if (!build) return 0;
    switch (metric) {
      case "CPU":
        return getCpuScore(build.cpu);
      case "GPU":
        return getGpuScore(build.gpu);
      case "RAM":
        return getRamScore(build.ram);
      case "SSD":
        return getStorageScore(build.storage);
      case "PSU":
        return getPsuScore(build.psu);
      default:
        return 0;
    }
  };

  const getBuildScore = (build) => {
    if (!build) return 0;
    const vals = metrics.map((m) => metricScore(build, m));
    return Math.round(vals.reduce((a, b) => a + b, 0) / metrics.length);
  };
  /* ── Radar ── */
  const getRadarPoints = (build) => {
    const cx = 130,
      cy = 130,
      r = 100;
    const step = (Math.PI * 2) / metrics.length;
    return metrics
      .map((m, i) => {
        const score = build ? metricScore(build, m) : 0;
        const norm = (score / 100) * r;
        const angle = -Math.PI / 2 + step * i;
        return `${cx + Math.cos(angle) * norm},${cy + Math.sin(angle) * norm}`;
      })
      .join(" ");
  };

  const getRadarLabels = () => {
    const cx = 130,
      cy = 130,
      r = 122;
    const step = (Math.PI * 2) / metrics.length;
    return metrics.map((m, i) => {
      const angle = -Math.PI / 2 + step * i;
      return {
        metric: m,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      };
    });
  };

  /* ── Compatibility ── */
  const checkAllCompatibility = () => {
    return getCompatibilitySummary(currentBuild, allComponents);
  };

  /* ── Check compatibility for any build object ── */
  const checkBuildCompatibility = (build) => {
    if (!build) return [];
    const issues = [];

    // CPU ↔ Motherboard socket
    if (build.cpu && build.motherboard) {
      const cpuSocket = build.cpu.socket_type;
      const mbSocket = build.motherboard.socket_type;
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        issues.push({
          category: "CPU ↔ Motherboard",
          icon: "⚙️",
          severity: "error",
          message: `CPU socket (${cpuSocket}) does not match motherboard socket (${mbSocket}).`,
          fix: "Replace the CPU or motherboard so their sockets match.",
        });
      }
    }

    // RAM ↔ Motherboard DDR type
    if (build.ram && build.motherboard) {
      const ramType = build.ram.ddr_type;
      const mbType = build.motherboard.ddr_type;
      if (ramType && mbType && ramType !== mbType) {
        issues.push({
          category: "RAM ↔ Motherboard",
          icon: "💾",
          severity: "error",
          message: `RAM type (${ramType}) is incompatible with motherboard (${mbType}).`,
          fix: `Switch to ${mbType} RAM or a motherboard that supports ${ramType}.`,
        });
      }
    }

    // PSU wattage vs GPU requirement
    if (build.psu && build.gpu) {
      const psuW = build.psu.wattage || 0;
      const gpuW = build.gpu.power_required || 0;
      const totalNeeded = gpuW + 65 + 60; // CPU TDP estimate + system
      if (psuW < totalNeeded) {
        issues.push({
          category: "PSU ↔ GPU",
          icon: "⚡",
          severity: "warning",
          message: `PSU (${psuW}W) may be insufficient. Estimated system draw: ~${totalNeeded}W.`,
          fix: `Upgrade to at least a ${Math.ceil(totalNeeded / 50) * 50}W PSU for stable operation.`,
        });
      }
    }

    if (issues.length === 0) {
      issues.push({
        category: "All Clear",
        icon: "✅",
        severity: "ok",
        message: "All components are compatible with each other!",
        fix: null,
      });
    }

    return issues;
  };

  /* ── Power estimate ── */
  const estimateWattage = (build = currentBuild) => {
    const cpu = build?.cpu;
    const gpu = build?.gpu;
    const cpuW = cpu?.tdp || 65;
    const gpuW = gpu?.power_required || 0;
    return cpuW + gpuW + 60; // +60 for rest of system
  };

  const compatibilityIssues = checkAllCompatibility();
  const slot1Build = getSavedBuild(0);
  const slot2Build = getSavedBuild(1);
  const currentScore = getBuildScore(currentBuild);
  const savedScore = getBuildScore(savedBuild);
  const radarLabels = getRadarLabels();
  const currentPoints = getRadarPoints(currentBuild);
  const savedPoints = hasSavedBuild ? getRadarPoints(savedBuild) : "";
  const estWattage = estimateWattage(currentBuild);
  const savedWattage = estimateWattage(savedBuild);

  const handleSave = (slot) => {
    saveBuildSnapshot(slot);
    setSelectedSaveSlot(slot);
    setCompareMode(true);
    setSaveMessage(`Saved to Slot ${slot + 1}`);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  /* ── Status badge ── */
  const StatusBadge = ({ ok }) =>
    ok ? (
      <span className="status-badge status-ready">● READY</span>
    ) : (
      <span className="status-badge status-issue">● ISSUE</span>
    );

  return (
    <>
      {/* ── Compatibility Issues Modal (portaled to body) ── */}
      {issueModal && createPortal(
        <div className="compat-modal-overlay" onClick={() => setIssueModal(null)}>
          <div className="compat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="compat-modal-header">
              <h2>Build {issueModal.slot + 1} — Compatibility Report</h2>
              <button className="compat-modal-close" onClick={() => setIssueModal(null)}>✕</button>
            </div>
            <div className="compat-modal-body">
              {issueModal.issues.map((issue, i) => (
                <div key={i} className={`compat-issue-card compat-issue-${issue.severity}`}>
                  <div className="compat-issue-header">
                    <span className="compat-issue-icon">{issue.icon}</span>
                    <span className="compat-issue-category">{issue.category}</span>
                  </div>
                  <p className="compat-issue-message">{issue.message}</p>
                  {issue.fix && (
                    <p className="compat-issue-fix">💡 {issue.fix}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="compat-modal-footer">
              <Link to="/build" className="btn-primary" onClick={() => setIssueModal(null)}>
                Go to Build Picker
              </Link>
              <button className="btn-outline" onClick={() => setIssueModal(null)}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

    <div className={`compat-page ${isIntegrated ? 'integrated-view' : ''}`}>
      {/* Decorative bg elements */}
      {!isIntegrated && (
        <>
          <div className="bg-grid" aria-hidden="true" />
          <div className="bg-glow bg-glow-1" aria-hidden="true" />
          <div className="bg-glow bg-glow-2" aria-hidden="true" />

          {/* ── Hero ── */}
          <section className="hero">
            <h1>
              Real-Time <span className="accent">Compatibility</span> Check
            </h1>
            <p>
              Every component is instantly verified against your existing choices.
            </p>
          </section>
        </>
      )}

      {/* ── Empty State ── */}
      {selectedComponents.length === 0 && (
        <div className="empty-wrap">
          <div className="empty-card">
            <div className="empty-img-wrap">
              <img
                src="component_picker_image_bg.png"
                alt="PC Build"
                className="empty-img"
              />
            </div>
            <h3>No Components Selected Yet</h3>
            <p>Head to the Component Picker above and start selecting parts. Compatibility results will appear here instantly.</p>
            <Link to="/build" className="btn-primary btn-pill">
              Go to Component Picker
            </Link>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      {selectedComponents.length > 0 && (
        <div className="main-layout">
          {/* ════ LEFT PANEL ════ */}
          <div className="left-panel">
            {/* Components List */}
            <div className="panel-card">
              <div className="panel-header">
                <h3 className="panel-title">
                  Your Selected Components
                </h3>
                <span className="parts-count">
                  {selectedComponents.length} parts
                </span>
              </div>
              <div className="components-list">
                {selectedComponents.map((comp, i) => {
                  const isOk = !compatibilityIssues.some((iss) =>
                    iss.components.some(
                      (c) => c.toLowerCase() === comp.category.toLowerCase()
                    )
                  );
                  return (
                    <div key={i} className="comp-item">
                      <div className="comp-header">
                        <span className="comp-cat">
                          {comp.category.toUpperCase()}
                        </span>
                        <StatusBadge ok={isOk} />
                      </div>
                      <div className="comp-body">
                        <div className="comp-img-wrap">
                          <img
                            src={comp.img}
                            alt={comp.name}
                            className="comp-img"
                          />
                        </div>
                        <div className="comp-info">
                          <h4>
                            {comp.brand} {comp.name}
                          </h4>
                          <p>{comp.desc}</p>
                          <div className="comp-tags">
                            {Array.isArray(comp.tags) &&
                              comp.tags.map((tag, j) => (
                                <span key={j} className="tag">
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>


            </div>

            {/* Bottleneck / Compatibility */}
            {compatibilityIssues.length > 0 && !bottleneckDismissed ? (
              <div className="bottleneck-card">
                <div className="bottleneck-header">
                  <span className="bottleneck-title">
                    BOTTLENECK ANALYSIS
                  </span>
                  <button
                    className="dismiss-btn"
                    onClick={() => setBottleneckDismissed(true)}
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
                {compatibilityIssues.map((iss, i) => (
                  <div key={i} className="bottleneck-body">
                    <div className="bottleneck-alert">
                      <span className="alert-label">
                        {iss.components.join(" Bottleneck Detected")} —
                      </span>
                      <p className="alert-desc">{iss.issue}</p>
                    </div>
                  </div>
                ))}
                <div className="bottleneck-actions">
                  <Link 
                    to="/build" 
                    state={{ scrollTo: "build-main-area", stepCategory: compatibilityIssues[0]?.components?.[0] || "case" }} 
                    className="fix-btn"
                  >
                    Fix Compatibility Issues
                  </Link>
                </div>
              </div>
            ) : compatibilityIssues.length === 0 ? (
              <div className="success-card">
                <span className="success-check">✅</span>
                <div>
                  <h3>All Components Are Compatible!</h3>
                  <p>All your selected components work together perfectly.</p>
                </div>
                <Link to="/build" className="btn-outline">
                  ➕ Add More
                </Link>
              </div>
            ) : null}

            {/* Feature Cards */}
            <div className="features-row">
              {[
                {
                  title: "Socket Matching",
                  desc: "Verifies that the CPU socket type matches the motherboard socket.",
                },
                {
                  title: "RAM Compatibility",
                  desc: "Checks that RAM type and speed match the motherboard specification.",
                },
                {
                  title: "Power Requirements",
                  desc: "Calculates total system power draw and verifies PSU wattage.",
                },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <span className="feature-icon">{f.icon}</span>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ════ RIGHT PANEL (Dashboard UI) ════ */}
          <div className="right-panel">
            {/* Top Grid Stats */}
            <div className="dashboard-grid">
              <div className="dash-stat-card">
                <span className="dash-icon" style={{color: "var(--amber)"}}>⚡</span>
                <div className="dash-info">
                  <span className="dash-label">EST. WATTAGE</span>
                  <span className="dash-value" style={{color: "var(--amber)"}}>{estWattage}W</span>
                </div>
              </div>
              <div className="dash-stat-card">
                <span className="dash-icon" style={{color: "var(--cyan)"}}>⚙️</span>
                <div className="dash-info">
                  <span className="dash-label">COMPONENTS</span>
                  <span className="dash-value" style={{color: "var(--cyan)"}}>{selectedComponents.length}/7</span>
                </div>
              </div>
              <div className="dash-stat-card">
                <span className="dash-icon" style={{color: "var(--orange)"}}>📈</span>
                <div className="dash-info">
                  <span className="dash-label">GAMING SCORE</span>
                  <span className="dash-value" style={{color: "var(--orange)"}}>{metricScore(currentBuild, "GPU")}</span>
                </div>
              </div>
              <div className="dash-stat-card">
                <span className="dash-icon" style={{color: "var(--purple)"}}>🧠</span>
                <div className="dash-info">
                  <span className="dash-label">PRODUCTIVITY</span>
                  <span className="dash-value" style={{color: "var(--purple)"}}>{metricScore(currentBuild, "CPU")}</span>
                </div>
              </div>
            </div>

            {/* Performance Profile (Radar) */}
            <div className="sidebar-card">
              <div className="sidebar-title">
                <span className="sidebar-title-icon">💻</span>
                Performance Profile
              </div>

              <div className="radar-wrap" style={{ marginTop: '1rem' }}>
                <svg className="radar-svg" viewBox="-20 -20 300 300">
                  {/* Hexagon Grid */}
                  {[100, 75, 50, 25].map((r, i) => (
                    <polygon
                      key={i}
                      points={metrics.map((_, j) => {
                        const angle = -Math.PI / 2 + ((Math.PI * 2) / metrics.length) * j;
                        return `${130 + Math.cos(angle) * r},${130 + Math.sin(angle) * r}`;
                      }).join(" ")}
                      className="radar-ring-poly"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Axes */}
                  {metrics.map((_, i) => {
                    const angle = -Math.PI / 2 + ((Math.PI * 2) / metrics.length) * i;
                    return (
                      <line
                        key={`axis-${i}`}
                        x1="130"
                        y1="130"
                        x2={130 + Math.cos(angle) * 100}
                        y2={130 + Math.sin(angle) * 100}
                        className="radar-axis"
                        stroke="rgba(255,255,255,0.1)"
                      />
                    );
                  })}
                  
                  {/* Current Build Polygon */}
                  <polygon
                    points={currentPoints}
                    className="radar-poly radar-current"
                    fill="rgba(0, 229, 255, 0.2)"
                    stroke="var(--cyan)"
                    strokeWidth="2"
                  />
                  
                  {/* Points on Polygon */}
                  {metrics.map((m, i) => {
                    const score = currentBuild ? metricScore(currentBuild, m) : 0;
                    const norm = (score / 100) * 100;
                    const angle = -Math.PI / 2 + ((Math.PI * 2) / metrics.length) * i;
                    const px = 130 + Math.cos(angle) * norm;
                    const py = 130 + Math.sin(angle) * norm;
                    return (
                      <circle key={`pt-${i}`} cx={px} cy={py} r="3" fill="var(--cyan)" />
                    );
                  })}

                  {/* Labels */}
                  {radarLabels.map(({ metric, x, y }) => {
                    // Adjust label positioning slightly outward
                    const dx = x - 130;
                    const dy = y - 130;
                    const nx = 130 + dx * 1.1;
                    const ny = 130 + dy * 1.1;
                    return (
                      <text
                        key={metric}
                        x={nx}
                        y={ny}
                        className="radar-label"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.7)"
                        fontSize="11px"
                      >
                        {metric}
                      </text>
                    );
                  })}
                </svg>
              </div>
              <div className="radar-legend" style={{justifyContent: 'center', marginTop: '1rem'}}>
                <div className="legend-pill">
                  <span className="legend-dot dot-current" style={{background: 'var(--cyan)'}} />
                  <span style={{color: "rgba(255,255,255,0.7)", fontSize: "12px"}}>Current Build</span>
                </div>
              </div>
            </div>

            {/* Score Breakdown (Progress Bars) */}
            <div className="sidebar-card">
              <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', textShadow: '0 0 10px rgba(255,255,255,0.2)', marginBottom: '20px' }}>
                <span className="sidebar-title-icon" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#FF5252', borderRadius: '50%', boxShadow: '0 0 6px #FF5252' }}></span>
                </span>
                <span style={{marginLeft: '12px'}}>Score Breakdown</span>
              </div>
              <div className="score-breakdown-list">
                {[
                  { label: "Gaming", score: metricScore(currentBuild, "GPU") },
                  { label: "Productivity", score: metricScore(currentBuild, "CPU") },
                  { label: "Rendering", score: Math.round((metricScore(currentBuild, "CPU") + metricScore(currentBuild, "GPU")) / 2) },
                  { label: "Storage", score: metricScore(currentBuild, "SSD") },
                  { label: "System Value", score: getBuildScore(currentBuild) },
                ].map((item, i) => {
                  let color = "#FF5252"; // Soft Crimson (Low)
                  if (item.score >= 41) color = "#FFA726"; // Amber (Medium)
                  if (item.score >= 76) color = "#00E676"; // Emerald (High)
                  
                  return (
                    <div key={i} className="score-progress-item-v2">
                      <div className="progress-label-v2">{item.label}</div>
                      <div className="progress-track-v2" style={{ border: `1px solid ${color}40` }}>
                        <div 
                          className="progress-fill-v2" 
                          style={{ 
                            width: `${Math.max(item.score, 5)}%`, // Ensure it's wide enough for text
                            backgroundColor: color
                          }} 
                        >
                           <span className="progress-fill-text">{item.score}%</span>
                        </div>
                      </div>
                      <div className="progress-value-v2" style={{ color: color }}>
                        {item.score}
                      </div>
                      {item.score <= 40 ? (
                        <div className="progress-alert-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF5252"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Build Slots (Save/Compare) */}
            <div className="sidebar-card">
              <div className="sidebar-title">
                Saved Configurations
              </div>

              <div className="slots-list">
                {[0, 1].map((slot) => {
                  const sb = getSavedBuild(slot);
                  const count = sb ? Object.values(sb).filter(Boolean).length : 0;
                  const isSelected = selectedSaveSlot === slot;
                  const targetPower = sb ? estimateWattage(sb) : 0;
                  
                  const slotTitle = slot === 0 
                    ? "Primary System Config (e.g., Budget Office / Productivity Rig)" 
                    : "Secondary System Config (e.g., High-End Gaming / Rendering Station)";

                  return (
                    <div
                      key={slot}
                      className={`slot-card ${isSelected ? "slot-selected" : ""}`}
                    >
                      <div className="slot-top-row">
                        <span className="slot-name">{slotTitle}</span>
                        <div className="slot-meta">
                          <span className="slot-parts">{count} parts saved</span>
                          {sb && <span className="slot-power">• {targetPower}W Target Power</span>}
                        </div>
                      </div>

                      <div className="slot-btn-grid">
                        <button
                          onClick={() => handleSave(slot)}
                          className="btn-update-slot"
                        >
                         Update Slot
                        </button>
                        {sb ? (
                          <button
                            onClick={() => setSelectedSaveSlot(slot)}
                            className="btn-open-config"
                          >
                           Open Configuration
                          </button>
                        ) : (
                          <button
                            disabled
                            className="btn-open-config disabled"
                          >
                          Empty Slot
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Master Call-To-Action Button */}
              {getSavedBuild(0) && getSavedBuild(1) && (
                <div className="compare-section">
                  <button 
                    onClick={() => setCompareMode(!compareMode)}
                    className="btn-eval"
                  >
                  {compareMode ? "Hide Performance Evaluation" : "Run Dual-Build Performance Evaluation"}
                  </button>
                  
                  {compareMode && (
                    <div className="compare-diff">
                      <div className="diff-grid">
                        <div className="diff-col">
                          <div className="diff-head head-b1">Build 1</div>
                          {Object.entries(getSavedBuild(0))
                            .filter(([, v]) => v)
                            .map(([cat, comp], i) => (
                              <div className="diff-item" key={`b1-${i}`}>
                                <span className="diff-cat">{cat}:</span> {comp.name}
                              </div>
                            ))}
                        </div>
                        <div className="diff-col col-right">
                          <div className="diff-head head-b2">Build 2</div>
                          {Object.entries(getSavedBuild(1))
                            .filter(([, v]) => v)
                            .map(([cat, comp], i) => (
                              <div className="diff-item" key={`b2-${i}`}>
                                <span className="diff-cat">{cat}:</span> {comp.name}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {saveMessage && (
                <div className="save-message">
                  {saveMessage}
                </div>
              )}
            </div>

            {/* Compatibility Issues List */}
            <div className="sidebar-card">
              <div className="sidebar-title">
                <span className="sidebar-title-icon" style={{color: compatibilityIssues.length > 0 ? 'var(--red)' : 'var(--green)'}}>
                  {compatibilityIssues.length > 0 ? '❌' : '✅'}
                </span>
                Compatibility
                <span className="issues-count" style={{marginLeft: 'auto', fontSize: '12px', color: 'rgba(255,255,255,0.5)'}}>
                  {compatibilityIssues.length} issues
                </span>
              </div>
              <div className="issues-list" style={{marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                {compatibilityIssues.length > 0 ? (
                  compatibilityIssues.map((iss, i) => (
                    <div key={i} className="issue-box" style={{
                      padding: '12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: 'var(--r-md)',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start'
                    }}>
                      <span style={{color: 'var(--red)', fontSize: '14px', marginTop: '2px'}}>⊗</span>
                      <p style={{margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4'}}>
                        {iss.issue}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="issue-box" style={{
                    padding: '12px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: 'var(--r-md)',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    <span style={{color: 'var(--green)', fontSize: '14px'}}>✓</span>
                    <p style={{margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)'}}>
                      All components are fully compatible.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
    </>
  );
}