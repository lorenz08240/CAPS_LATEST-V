import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { getCompatibilitySummary } from "../../utilities/rules";
import "./Compatibility.css";

export default function Compatibility({ isIntegrated = false }) {
  const {
    currentBuild,
    getSelectedComponents,
    savedBuilds,
    selectedSaveSlot,
    setSelectedSaveSlot,
    saveBuildSnapshot,
    allComponents,
  } = useBuild();

  const getSavedBuild = (slot) => {
    const b = savedBuilds?.[slot];
    if (!b) return null;
    return b;
  };

  const selectedComponents = getSelectedComponents().sort((a, b) => {
    const order = ["case", "motherboard", "cpu", "ram", "storage", "gpu", "psu"];
    return order.indexOf(a.category.toLowerCase()) - order.indexOf(b.category.toLowerCase());
  });

  const [compareMode, setCompareMode] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [bottleneckDismissed, setBottleneckDismissed] = useState(false);
  const [issueModal, setIssueModal] = useState(null); // { slot, issues[] }
  const [radarProfileMode, setRadarProfileMode] = useState(false);

  /* ── Saved build helpers ── */
  const savedComponents = useMemo(() => {
    const b = getSavedBuild(selectedSaveSlot);
    if (!b) return [];
    return Object.entries(b)
      .filter(([, v]) => v !== null)
      .map(([category, component]) => ({ category, ...component }));
  }, [selectedSaveSlot, savedBuilds]);

  const savedBuild = getSavedBuild(selectedSaveSlot);
  const hasSavedBuild = Boolean(savedBuild && savedComponents.length > 0);
  const metrics = ["CPU", "GPU", "RAM", "SSD", "PSU"];

  const nodeColors = {
    CPU: "#FACC15", // Amber / Gold
    GPU: "#F43F5E", // Pink / Magenta
    RAM: "#10B981", // Bright Emerald Green
    SSD: "#FB923C", // Warm Orange / Red
    PSU: "#06B6D4", // Bright Cyan
  };

  /* ── Component Scoring Logic ── */
  const getCpuScore = (cpu) => {
    if (!cpu || !Array.isArray(cpu.tags)) return 60;
    const tag = cpu.tags.find((t) => /\d+\s*cores?/i.test(t));
    const cores = tag ? parseInt(tag.match(/(\d+)/)[1], 10) : 6;
    if (cores >= 24) return 100;
    if (cores >= 16) return 94;
    if (cores >= 8) return 82;
    if (cores >= 6) return 68;
    return 50;
  };

  const getGpuScore = (gpu) => {
    if (!gpu) return 65;
    const w = gpu.power_required || 0;
    if (w >= 700) return 98;
    if (w >= 550) return 88;
    if (w >= 400) return 74;
    if (w > 0) return 60;
    return 45;
  };

  const getRamScore = (ram) => {
    if (!ram || !Array.isArray(ram.tags)) return 70;
    const cap = parseInt(
      ram.tags.find((t) => /\d+GB/i.test(t))?.match(/(\d+)/)?.[1] || "16",
      10
    );
    const spd = parseInt(
      ram.tags.find((t) => /\d+MHz/i.test(t))?.match(/(\d+)/)?.[1] || "3200",
      10
    );
    let s = cap >= 64 ? 50 : cap >= 32 ? 45 : cap >= 16 ? 35 : 20;
    s += spd >= 6000 ? 50 : spd >= 5200 ? 44 : spd >= 3600 ? 38 : 25;
    return Math.min(100, s);
  };

  const getStorageScore = (storage) => {
    if (!storage) return 70;
    const type = (
      storage.type ||
      storage.tags?.find((t) => /(nvme|ssd|hdd)/i.test(t)) ||
      ""
    ).toLowerCase();
    if (type.includes("nvme")) return 96;
    if (type.includes("ssd")) return 82;
    if (type.includes("hdd")) return 45;
    return 65;
  };

  const getPsuScore = (psu) => {
    if (!psu) return 65;
    const w = psu.wattage || 0;
    if (w >= 1000) return 100;
    if (w >= 850) return 92;
    if (w >= 750) return 80;
    if (w >= 650) return 68;
    return 50;
  };

  const metricScore = (build, metric) => {
    if (!build) {
      if (metric === "GPU") return 98;
      if (metric === "CPU") return 92;
      return 85;
    }
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
        return 75;
    }
  };

  const getBuildScore = (build) => {
    if (!build) return 85;
    const vals = metrics.map((m) => metricScore(build, m));
    return Math.round(vals.reduce((a, b) => a + b, 0) / metrics.length);
  };

  /* ── Radar Coordinates ── */
  const getRadarPoints = (build, isBoosted = false) => {
    const cx = 130, cy = 130, r = 100;
    const step = (Math.PI * 2) / metrics.length;
    return metrics
      .map((m, i) => {
        let score = metricScore(build, m);
        if (isBoosted) {
          score = Math.min(100, Math.round(score * 1.12));
        }
        const norm = Math.max((score / 100) * r, 20);
        const angle = -Math.PI / 2 + step * i;
        return `${cx + Math.cos(angle) * norm},${cy + Math.sin(angle) * norm}`;
      })
      .join(" ");
  };

  const getRadarLabels = () => {
    const cx = 130, cy = 130, r = 120;
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

  /* ── Compatibility Summary ── */
  const checkAllCompatibility = () => {
    return getCompatibilitySummary(currentBuild, allComponents);
  };

  const checkBuildCompatibility = (build) => {
    if (!build) return [];
    const rawIssues = getCompatibilitySummary(build, allComponents);

    if (!rawIssues || rawIssues.length === 0) {
      return [
        {
          category: "All Clear",
          icon: "✅",
          severity: "ok",
          message: "All selected components are fully compatible with each other!",
          fix: null,
        },
      ];
    }

    return rawIssues.map((iss) => ({
      category: Array.isArray(iss.components)
        ? iss.components.map((c) => c.toUpperCase()).join(" ↔ ")
        : "Compatibility Notice",
      icon: "⚠️",
      severity: "error",
      message: iss.issue,
      fix: iss.tip || "Verify component specifications and adjust your selection in the picker.",
    }));
  };

  /* ── Power Estimation ── */
  const estimateWattage = (build = currentBuild) => {
    const cpu = build?.cpu;
    const gpu = build?.gpu;
    const cpuW = cpu?.tdp || 105;
    const gpuW = gpu?.power_required || 320;
    return cpuW + gpuW + 75; // +75 for motherboard, RAM, storage & fans
  };

  const compatibilityIssues = checkAllCompatibility();
  const radarLabels = getRadarLabels();
  const currentPoints = getRadarPoints(currentBuild, radarProfileMode);
  const estWattage = estimateWattage(currentBuild);

  // Diagnostic filter checks
  const hasSocketIssue = compatibilityIssues.some((iss) =>
    iss.components.some((c) => c.toLowerCase() === "cpu" || c.toLowerCase() === "motherboard")
  );
  const hasRamIssue = compatibilityIssues.some((iss) =>
    iss.components.some((c) => c.toLowerCase() === "ram")
  );
  const hasPowerIssue = compatibilityIssues.some((iss) =>
    iss.components.some((c) => c.toLowerCase() === "psu" || c.toLowerCase() === "gpu")
  );

  const handleSave = (slot) => {
    saveBuildSnapshot(slot);
    setSelectedSaveSlot(slot);
    setSaveMessage(`Build saved to Slot ${slot + 1}!`);
    setTimeout(() => setSaveMessage(""), 3500);
  };

  /* ── Brand Monogram Helper ── */
  const getBrandMonogram = (comp) => {
    if (!comp) return "PART";
    const name = (comp.name || "").toUpperCase();
    const brand = (comp.brand || "").toUpperCase();
    const cat = (comp.category || "").toUpperCase();

    if (brand.includes("ANTEC") || name.includes("ANTEC")) return "ANTEC";
    if (brand.includes("ASUS") || name.includes("ASUS")) return "ASUS";
    if (brand.includes("AMD") || name.includes("RYZEN")) return "AMD";
    if (brand.includes("INTEL") || name.includes("CORE")) return "INTEL";
    if (brand.includes("LEXAR") || name.includes("LEXAR")) return "LEXAR";
    if (brand.includes("SAMSUNG") || name.includes("EVO") || name.includes("970")) return "SSD";
    if (brand.includes("NVIDIA") || name.includes("RTX") || name.includes("GEFORCE")) return "NVIDIA";
    if (brand.includes("MSI") || name.includes("MAG")) return "MSI";
    if (brand.includes("CORSAIR") || name.includes("CORSAIR")) return "CORSAIR";
    if (brand.includes("GIGABYTE") || name.includes("AORUS")) return "AORUS";

    if (comp.brand && comp.brand.length <= 7) return comp.brand.toUpperCase();
    if (cat.includes("STORAGE") || cat.includes("SSD")) return "SSD";
    return cat.slice(0, 5);
  };

  /* ── Comparison Fallback Helpers ── */
  const getCompDisplayName = (comp, fallback) => {
    if (!comp) return fallback;
    return `${comp.brand || ""} ${comp.name || ""}`.trim() || fallback;
  };

  const getCompTag = (ramComp, fallback) => {
    if (!ramComp) return fallback;
    if (Array.isArray(ramComp.tags)) {
      const ddr = ramComp.tags.find((t) => /DDR\d/i.test(t));
      if (ddr) return ddr;
    }
    return fallback;
  };

  const getCompWattage = (psuComp, fallback) => {
    if (!psuComp) return fallback;
    if (psuComp.wattage) return `${psuComp.wattage}W`;
    return fallback;
  };

  return (
    <>
      {/* ── Compatibility Issues Modal (Portaled) ── */}
      {issueModal &&
        createPortal(
          <div className="compat-modal-overlay" onClick={() => setIssueModal(null)}>
            <div className="compat-modal" onClick={(e) => e.stopPropagation()}>
              <div className="compat-modal-header">
                <h2>Build {issueModal.slot + 1} — Compatibility Report</h2>
                <button className="compat-modal-close" onClick={() => setIssueModal(null)}>
                  ✕
                </button>
              </div>
              <div className="compat-modal-body">
                {issueModal.issues.map((issue, i) => (
                  <div key={i} className={`compat-issue-card compat-issue-${issue.severity}`}>
                    <div className="compat-issue-header">
                      <span className="compat-issue-icon">{issue.icon}</span>
                      <span className="compat-issue-category">{issue.category}</span>
                    </div>
                    <p className="compat-issue-message">{issue.message}</p>
                    {issue.fix && <p className="compat-issue-fix">💡 {issue.fix}</p>}
                  </div>
                ))}
              </div>
              <div className="compat-modal-footer">
                <Link to="/build" className="btn-primary" onClick={() => setIssueModal(null)}>
                  Go to Build Picker
                </Link>
                <button className="btn-outline" onClick={() => setIssueModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <div className={`compat-page ${isIntegrated ? "integrated-view" : ""}`}>
        {/* Organic layered waves and mesh background */}
        {!isIntegrated && (
          <>
            <div className="bg-grid" aria-hidden="true" />
            <div className="bg-wave bg-wave-burgundy" aria-hidden="true" />
            <div className="bg-wave bg-wave-gold" aria-hidden="true" />
            <div className="bg-wave bg-wave-navy" aria-hidden="true" />
          </>
        )}

        <div className="compat-container-wrap">
          {/* ════ HERO TITLE HEADER ════ */}
          {!isIntegrated && (
            <header className="compat-hero-title-header">
              <h1 className="compat-hero-title">
                Real-Time <span className="title-compat-accent">Compatibility</span> Check
              </h1>
              <p className="compat-hero-desc">
                Every component is instantly verified against your existing choices.
              </p>
            </header>
          )}

          {/* ════ TOP ALERT BANNER ════ */}
          {compatibilityIssues.length > 0 && (
            <aside className="compat-top-banner" role="alert">
              <div className="compat-banner-info">
                <span className="banner-alert-badge">COMPATIBILITY WARNING:</span>
                <span className="banner-alert-desc">
                  Several critical issues detected in your current PC build.
                </span>
              </div>
            </aside>
          )}

          {/* ── Empty State ── */}
          {selectedComponents.length === 0 && (
            <div className="empty-wrap">
              <div className="empty-card glass-panel">
                <div className="empty-img-wrap">
                  <img
                    src="/assets/component_picker_image_bg.png"
                    alt="PC Build"
                    className="empty-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <h3>No Components Selected Yet</h3>
                <p>
                  Head to the Component Picker and begin assembling your PC. Real-time compatibility
                  checks and performance telemetry will appear here instantly.
                </p>
                <Link to="/build" className="btn-resolve-cta" style={{ maxWidth: "260px", margin: "16px auto 0" }}>
                  Go to Component Picker
                </Link>
              </div>
            </div>
          )}

          {/* ════ 2-COLUMN DASHBOARD (60 / 40 SPLIT) ════ */}
          {selectedComponents.length > 0 && (
            <div className="dashboard-layout-v2">
              {/* ════ LEFT COLUMN (60%) ════ */}
              <section className="column-left-60">
                {/* Selected Components Panel */}
                <div className="glass-panel components-container-card">
                  <div className="components-card-header">
                    <h3 className="section-title">
                      Your Selected Components ({selectedComponents.length} parts)
                    </h3>
                  </div>

                  <div className="component-cards-stack">
                    {selectedComponents.map((comp, i) => {
                      const isOk = !compatibilityIssues.some((iss) =>
                        iss.components.some(
                          (c) => c.toLowerCase() === comp.category.toLowerCase()
                        )
                      );
                      const brandTag = getBrandMonogram(comp);

                      return (
                        <div
                          key={i}
                          className={`component-row-card ${isOk ? "card-status-ready" : "card-status-issue"}`}
                        >
                          {/* Brand Monogram Tag */}
                          <div
                            className={`brand-monogram-pill ${isOk ? "brand-ready" : "brand-issue"}`}
                          >
                            {brandTag}
                          </div>

                          {/* Component Details */}
                          <div className="component-text-meta">
                            <span className="component-category-tag">
                              {comp.category.toUpperCase()}
                            </span>
                            <h4 className="component-product-name" title={comp.name}>
                              {comp.brand} {comp.name}
                            </h4>
                          </div>

                          {/* Status Pill Badge */}
                          <div className="status-badge-wrap">
                            <span className={`status-pill ${isOk ? "pill-ready" : "pill-issue"}`}>
                              {isOk ? "READY" : "ISSUE"}
                            </span>
                          </div>

                          {/* Thumbnail Image */}
                          <div className="component-thumb-wrap">
                            {comp.img ? (
                              <img
                                src={comp.img}
                                alt={comp.name}
                                className="component-thumb-img"
                              />
                            ) : (
                              <span className="thumb-placeholder-icon">🖥️</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottleneck Analysis Card */}
                {compatibilityIssues.length > 0 && !bottleneckDismissed ? (
                  <div className="bottleneck-darkred-card">
                    <div className="bottleneck-card-header">
                      <h3 className="bottleneck-card-title">Bottleneck Analysis</h3>

                    </div>

                    <div className="bottleneck-conflicts-list">
                      {compatibilityIssues.map((iss, i) => (
                        <div key={i} className="bottleneck-conflict-item">
                          <span className="conflict-dot" />
                          <div className="conflict-copy">
                            <strong className="conflict-headline">
                              {iss.components.join(" / ")} Conflict
                            </strong>
                            <span className="conflict-dash">•</span>
                            <span className="conflict-desc">{iss.issue}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/build"
                      state={{
                        scrollTo: "build-main-area",
                        stepCategory: compatibilityIssues[0]?.components?.[0] || "case",
                      }}
                      className="btn-resolve-cta"
                    >
                      Fix Compatibility Issues
                    </Link>
                  </div>
                ) : compatibilityIssues.length === 0 ? (
                  <div className="compatibility-all-clear-card glass-panel">
                    <span className="all-clear-icon">✅</span>
                    <div className="all-clear-copy">
                      <h4>All Components are 100% Compatible</h4>
                      <p>No socket mismatches, clearance constraints, or wattage overdraw detected.</p>
                    </div>
                  </div>
                ) : null}

                {/* Sub-system Diagnostic Cards */}
                <div className="sub-diagnostics-row">
                  <div
                    className={`sub-diag-card ${hasSocketIssue ? "diag-issue" : "diag-ready"}`}
                  >
                    <div className="diag-header">
                      <span className="diag-icon">🔲</span>
                      <h4 className="diag-label">Socket Matching</h4>
                    </div>
                    <p className="diag-desc">
                      Socket matches connect matchers are as socket matching.
                    </p>
                  </div>

                  <div
                    className={`sub-diag-card ${hasRamIssue ? "diag-issue" : "diag-ready"}`}
                  >
                    <div className="diag-header">
                      <span className="diag-icon">💾</span>
                      <h4 className="diag-label">RAM Compatibility</h4>
                    </div>
                    <p className="diag-desc">
                      Compatibilities are to the RAM quality and RAM compatibility.
                    </p>
                  </div>

                  <div
                    className={`sub-diag-card ${hasPowerIssue ? "diag-issue" : "diag-ready"}`}
                  >
                    <div className="diag-header">
                      <span className="diag-icon">⚡</span>
                      <h4 className="diag-label">Power Requirements</h4>
                    </div>
                    <p className="diag-desc">
                      Power requirements must be checked and meet power requirements.
                    </p>
                  </div>
                </div>
              </section>

              {/* ════ RIGHT COLUMN (40%) ════ */}
              <section className="column-right-40">
                {/* 1. Performance Analytics (2x2 KPI Grid) */}
                <div className="glass-panel performance-analytics-panel">
                  <h3 className="section-title">Performance Analytics</h3>

                  <div className="kpi-grid-2x2">
                    {/* Est. Wattage */}
                    <div className="kpi-tile-box">
                      <span className="kpi-icon-symbol kpi-icon-red">⚡</span>
                      <div className="kpi-metric-info">
                        <span className="kpi-metric-label">Est. Wattage</span>
                        <span className="kpi-metric-value">{estWattage}W</span>
                      </div>
                    </div>

                    {/* Components Count */}
                    <div className="kpi-tile-box">
                      <span className="kpi-icon-symbol kpi-icon-green">⊞</span>
                      <div className="kpi-metric-info">
                        <span className="kpi-metric-label">Components</span>
                        <span className="kpi-metric-value">{selectedComponents.length}/7</span>
                      </div>
                    </div>

                    {/* Gaming Score */}
                    <div className="kpi-tile-box">
                      <span className="kpi-icon-symbol kpi-icon-purple">🎮</span>
                      <div className="kpi-metric-info">
                        <span className="kpi-metric-label">Gaming Score</span>
                        <span className="kpi-metric-value">
                          {metricScore(currentBuild, "GPU")}
                        </span>
                      </div>
                    </div>

                    {/* Productivity Score */}
                    <div className="kpi-tile-box">
                      <span className="kpi-icon-symbol kpi-icon-cyan">📊</span>
                      <div className="kpi-metric-info">
                        <span className="kpi-metric-label">Productivity</span>
                        <span className="kpi-metric-value">
                          {metricScore(currentBuild, "CPU")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Performance Profile (5-Axis Radar Chart) */}
                <div className="glass-panel performance-profile-panel">
                  <div className="panel-headline-group">
                    <h3 className="section-title">Performance Profile</h3>
                    <span className="section-subcaption">Radar Performance Chart</span>
                  </div>

                  <div className="radar-canvas-container">
                    <svg className="radar-svg-canvas" viewBox="-25 -25 310 310">
                      {/* Gradient & Glow Definitions */}
                      <defs>
                        <radialGradient id="radarAuraWarm" cx="65%" cy="35%" r="60%">
                          <stop offset="0%" stopColor="rgba(239, 68, 68, 0.28)" />
                          <stop offset="50%" stopColor="rgba(245, 158, 11, 0.14)" />
                          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                        </radialGradient>
                        <radialGradient id="radarAuraCool" cx="35%" cy="65%" r="60%">
                          <stop offset="0%" stopColor="rgba(0, 229, 160, 0.22)" />
                          <stop offset="50%" stopColor="rgba(6, 182, 212, 0.1)" />
                          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                        </radialGradient>
                        <filter id="radarGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2.5" result="glow" />
                          <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Atmospheric Dual-Tone Glow Behind Grid */}
                      <circle cx="155" cy="105" r="95" fill="url(#radarAuraWarm)" />
                      <circle cx="105" cy="155" r="95" fill="url(#radarAuraCool)" />

                      {/* Concentric Pentagonal Web Rings */}
                      {[100, 75, 50, 25].map((r, i) => (
                        <polygon
                          key={i}
                          points={metrics
                            .map((_, j) => {
                              const angle = -Math.PI / 2 + ((Math.PI * 2) / metrics.length) * j;
                              return `${130 + Math.cos(angle) * r},${130 + Math.sin(angle) * r}`;
                            })
                            .join(" ")}
                          className="radar-web-ring"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Radial Spoke Lines */}
                      {metrics.map((_, i) => {
                        const angle = -Math.PI / 2 + ((Math.PI * 2) / metrics.length) * i;
                        return (
                          <line
                            key={`spoke-${i}`}
                            x1="130"
                            y1="130"
                            x2={130 + Math.cos(angle) * 100}
                            y2={130 + Math.sin(angle) * 100}
                            stroke="rgba(255, 255, 255, 0.12)"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Outer Grid Vertex Dots (Matching Screenshot) */}
                      {metrics.map((_, i) => {
                        const angle = -Math.PI / 2 + ((Math.PI * 2) / metrics.length) * i;
                        const gx = 130 + Math.cos(angle) * 100;
                        const gy = 130 + Math.sin(angle) * 100;
                        const gridDots = ["#f59e0b", "#facc15", "#d97706", "rgba(0, 229, 160, 0.6)", "rgba(0, 229, 160, 0.6)"];
                        return (
                          <circle
                            key={`grid-vertex-${i}`}
                            cx={gx}
                            cy={gy}
                            r="2.5"
                            fill={gridDots[i]}
                            opacity="0.8"
                          />
                        );
                      })}

                      {/* Glowing Radar Active Data Polygon */}
                      <polygon
                        points={currentPoints}
                        className="radar-polygon-glow"
                        fill="rgba(0, 229, 160, 0.12)"
                        stroke="#00e5a0"
                        strokeWidth="2.2"
                        filter="url(#radarGlowFilter)"
                      />

                      {/* Active Mint Nodes on Polygon */}
                      {metrics.map((m, i) => {
                        let score = metricScore(currentBuild, m);
                        if (radarProfileMode) {
                          score = Math.min(100, Math.round(score * 1.12));
                        }
                        const norm = Math.max((score / 100) * 100, 25);
                        const angle = -Math.PI / 2 + ((Math.PI * 2) / metrics.length) * i;
                        const px = 130 + Math.cos(angle) * norm;
                        const py = 130 + Math.sin(angle) * norm;

                        return (
                          <g key={`data-node-${i}`}>
                            <circle cx={px} cy={py} r="7" fill="#00e5a0" opacity="0.4" />
                            <circle cx={px} cy={py} r="3.5" fill="#a7f3d0" stroke="#00e5a0" strokeWidth="1.5" />
                          </g>
                        );
                      })}

                      {/* Axis Label Tags */}
                      {radarLabels.map(({ metric, x, y }) => {
                        const dx = x - 130;
                        const dy = y - 130;
                        const nx = 130 + dx * 1.16;
                        const ny = 130 + dy * 1.16;

                        return (
                          <text
                            key={metric}
                            x={nx}
                            y={ny}
                            className="radar-axis-label"
                            dominantBaseline="middle"
                            textAnchor="middle"
                          >
                            {metric}
                          </text>
                        );
                      })}
                    </svg>
                  </div>

                  <button
                    className="btn-convert-profile"
                    onClick={() => setRadarProfileMode(!radarProfileMode)}
                  >
                    {radarProfileMode ? "Standard Profile" : "Convert Profile"}
                  </button>
                </div>

                {/* 3. Saved Configurations & Comparison */}
                <div className="glass-panel saved-configurations-panel">
                  <h3 className="section-title">Saved Configurations</h3>

                  {/* Preset Selector Tabs (BUILD 1 and BUILD 2 only) */}
                  <div className="preset-tabs-row">
                    {[0, 1].map((slot) => (
                      <button
                        key={slot}
                        className={`preset-tab-btn ${selectedSaveSlot === slot ? "tab-active" : ""}`}
                        onClick={() => setSelectedSaveSlot(slot)}
                      >
                        BUILD {slot + 1}
                        <span className="preset-subtext">Presets</span>
                      </button>
                    ))}
                  </div>

                  {/* Toggle Comparison Button */}
                  <button
                    className="btn-toggle-evaluation"
                    onClick={() => setCompareMode(!compareMode)}
                  >
                    {compareMode ? "Hide Performance Evaluation" : "Show Performance Evaluation"}
                  </button>

                  {/* Side-by-Side Comparison Tables */}
                  {compareMode && (
                    <div className="side-by-side-matrix">
                      {/* Column BUILD 1 */}
                      <div className="matrix-column col-left">
                        <div className="matrix-column-title">BUILD 1</div>
                        <div className="matrix-item-row">
                          <span className="spec-label">CPU</span>
                          <span className="spec-val">
                            {getCompDisplayName(getSavedBuild(0)?.cpu, "Intel Core i9")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">MOTHERBOARD</span>
                          <span className="spec-val">
                            {getCompDisplayName(getSavedBuild(0)?.motherboard, "Ainboard")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">RAM</span>
                          <span className="spec-val spec-green">
                            {getCompTag(getSavedBuild(0)?.ram, "DDR5")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">STORAGE</span>
                          <span className="spec-val">
                            {getCompDisplayName(getSavedBuild(0)?.storage, "3.58 GB")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">GPU</span>
                          <span className="spec-val">
                            {getCompDisplayName(getSavedBuild(0)?.gpu, "Geforce 7600")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">PSU</span>
                          <span className="spec-val spec-red">
                            {getCompWattage(getSavedBuild(0)?.psu, "15GB")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">CASE</span>
                          <span className="spec-val">
                            {getCompDisplayName(getSavedBuild(0)?.case, "Case")}
                          </span>
                        </div>
                      </div>

                      {/* Column BUILD 2 */}
                      <div className="matrix-column col-right">
                        <div className="matrix-column-title">BUILD 2</div>
                        <div className="matrix-item-row">
                          <span className="spec-label">CPU</span>
                          <span className="spec-val">
                            {getCompDisplayName(getSavedBuild(1)?.cpu, "Intel Core i9")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">MOTHERBOARD</span>
                          <span className="spec-val">
                            {getCompDisplayName(getSavedBuild(1)?.motherboard, "Altiboard")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">RAM</span>
                          <span className="spec-val spec-green">
                            {getCompTag(getSavedBuild(1)?.ram, "DDR5")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">STORAGE</span>
                          <span className="spec-val">
                            {getCompDisplayName(getSavedBuild(1)?.storage, "3.58 GB")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">GPU</span>
                          <span className="spec-val">
                            {getCompDisplayName(getSavedBuild(1)?.gpu, "Geforce 7600")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">PSU</span>
                          <span className="spec-val spec-red">
                            {getCompWattage(getSavedBuild(1)?.psu, "16GB")}
                          </span>
                        </div>
                        <div className="matrix-item-row">
                          <span className="spec-label">CASE</span>
                          <span className="spec-val">
                            {getCompDisplayName(getSavedBuild(1)?.case, "Case")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save build to current slot CTA */}
                  <div className="slot-action-footer">
                    <button
                      onClick={() => handleSave(selectedSaveSlot)}
                      className="btn-save-slot-trigger"
                    >
                      Save Current Build to Slot {selectedSaveSlot + 1}
                    </button>
                    {saveMessage && <span className="save-toast-text">{saveMessage}</span>}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}