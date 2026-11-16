import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { getCompatibilitySummary } from "../../utilities/rules";
import { calculateScores } from "../../utilities/scoringEngine";
import { OFFLINE_COMPONENTS, DEMO_GAMING_RIG } from "../../utilities/offlineParts";
import soundManager from "../../utilities/soundManager";
import GlobalHeader from "../Navigation/GlobalHeader";
import FullscreenGate from "../FullscreenGate/FullscreenGate";
import "./CompareRigs.css";

// Built-in presets for instant side-by-side comparison
const PRESET_ENTHUSIAST_RIG = {
  case: OFFLINE_COMPONENTS.case?.[1] || OFFLINE_COMPONENTS.case?.[0],
  motherboard: OFFLINE_COMPONENTS.motherboard?.[0],
  cpu: OFFLINE_COMPONENTS.cpu?.[1],
  ram: OFFLINE_COMPONENTS.ram?.[0],
  storage: OFFLINE_COMPONENTS.storage?.[0],
  gpu: OFFLINE_COMPONENTS.gpu?.[0],
  psu: OFFLINE_COMPONENTS.psu?.[0],
};

const PRESET_BUDGET_RIG = {
  case: OFFLINE_COMPONENTS.case?.[0],
  motherboard: OFFLINE_COMPONENTS.motherboard?.[1] || OFFLINE_COMPONENTS.motherboard?.[0],
  cpu: OFFLINE_COMPONENTS.cpu?.[0],
  ram: OFFLINE_COMPONENTS.ram?.[1] || OFFLINE_COMPONENTS.ram?.[0],
  storage: OFFLINE_COMPONENTS.storage?.[1] || OFFLINE_COMPONENTS.storage?.[0],
  gpu: OFFLINE_COMPONENTS.gpu?.[2] || OFFLINE_COMPONENTS.gpu?.[0],
  psu: OFFLINE_COMPONENTS.psu?.[2] || OFFLINE_COMPONENTS.psu?.[0],
};

const COMPONENT_CATEGORIES = [
  { key: "case", label: "PC CASE", icon: "📦" },
  { key: "motherboard", label: "MOTHERBOARD", icon: "🖲️" },
  { key: "cpu", label: "PROCESSOR", icon: "⚡" },
  { key: "ram", label: "MEMORY (RAM)", icon: "💾" },
  { key: "storage", label: "STORAGE (SSD)", icon: "💿" },
  { key: "gpu", label: "GRAPHICS (GPU)", icon: "🎮" },
  { key: "psu", label: "POWER SUPPLY", icon: "🔌" },
];

function CompareRigsView() {
  const navigate = useNavigate();
  const {
    currentBuild,
    savedBuilds,
    saveBuildSnapshot,
    allComponents,
    loadDemoBuild,
    setSelectedSaveSlot
  } = useBuild();

  // Rig 2 selection state: 'slot-0', 'slot-1', 'slot-2', 'preset-enthusiast', 'preset-budget'
  const [rig2Source, setRig2Source] = useState("preset-enthusiast");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Rig 1 is ALWAYS the active workbench rig
  const rig1 = currentBuild;

  // Rig 2 is derived from the active selection
  const rig2 = useMemo(() => {
    if (rig2Source === "preset-enthusiast") return PRESET_ENTHUSIAST_RIG;
    if (rig2Source === "preset-budget") return PRESET_BUDGET_RIG;
    if (rig2Source.startsWith("slot-")) {
      const slotIdx = parseInt(rig2Source.replace("slot-", ""), 10);
      return savedBuilds?.[slotIdx] || null;
    }
    return null;
  }, [rig2Source, savedBuilds]);

  // Check if each rig has any components
  const rig1Components = useMemo(() => {
    return Object.entries(rig1 || {})
      .filter(([, v]) => v !== null)
      .map(([category, comp]) => ({ category, ...comp }));
  }, [rig1]);

  const rig2Components = useMemo(() => {
    if (!rig2) return [];
    return Object.entries(rig2)
      .filter(([, v]) => v !== null)
      .map(([category, comp]) => ({ category, ...comp }));
  }, [rig2]);

  const hasRig1 = rig1Components.length > 0;
  const hasRig2 = rig2Components.length > 0;
  const hasTwoRigs = hasRig1 && hasRig2;

  // Compatibility evaluations
  const rig1Issues = useMemo(() => {
    if (!hasRig1) return [];
    return getCompatibilitySummary(rig1, allComponents);
  }, [rig1, allComponents, hasRig1]);

  const rig2Issues = useMemo(() => {
    if (!hasRig2) return [];
    return getCompatibilitySummary(rig2, allComponents);
  }, [rig2, allComponents, hasRig2]);

  // Scores and metrics
  const rig1Scores = useMemo(() => calculateScores(rig1 || {}), [rig1]);
  const rig2Scores = useMemo(() => calculateScores(rig2 || {}), [rig2]);

  // Power calculations
  const getWattage = (build) => {
    if (!build) return 0;
    const cpuTdp = build.cpu?.wattage || build.cpu?.tdp || 65;
    const gpuTdp = build.gpu?.power_required || 170;
    return cpuTdp + gpuTdp + 80;
  };

  const rig1Wattage = getWattage(rig1);
  const rig2Wattage = getWattage(rig2);

  const handleSaveCurrentToSlot = (slotIdx) => {
    try { soundManager.granted(); } catch {}
    saveBuildSnapshot(slotIdx);
    setSelectedSaveSlot(slotIdx);
    setSaveSuccessMsg(`Rig saved to Slot 0${slotIdx + 1}!`);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  const handleSelectSlotSource = (sourceKey) => {
    try { soundManager.click(); } catch {}
    setRig2Source(sourceKey);
  };

  // Helper for component spec summary
  const getCompSpecSummary = (comp, category) => {
    if (!comp) return { main: "Not Selected", tag: "EMPTY", isSet: false };
    const brand = comp.brand || "";
    const name = comp.name || "";
    const fullName = `${brand} ${name}`.trim();

    if (category === "ram") {
      const ddr = comp.ddr_type || (Array.isArray(comp.tags) ? comp.tags.find(t => /ddr\d/i.test(t)) : "") || "DDR4";
      return { main: fullName, tag: ddr.toUpperCase(), isSet: true };
    }
    if (category === "psu") {
      const w = comp.wattage ? `${comp.wattage}W` : "Standard";
      return { main: fullName, tag: w, isSet: true };
    }
    if (category === "motherboard") {
      const sock = comp.socket_type || (Array.isArray(comp.tags) ? comp.tags.find(t => /(am\d|lga\d+)/i.test(t)) : "") || "ATX";
      return { main: fullName, tag: sock.toUpperCase(), isSet: true };
    }
    if (category === "cpu") {
      const sock = comp.socket_type || "";
      return { main: fullName, tag: sock || (comp.wattage ? `${comp.wattage}W` : "CPU"), isSet: true };
    }
    if (category === "gpu") {
      const pwr = comp.power_required ? `${comp.power_required}W` : "PCIe";
      return { main: fullName, tag: pwr, isSet: true };
    }
    if (category === "storage") {
      const type = comp.type || "NVMe";
      return { main: fullName, tag: type.toUpperCase(), isSet: true };
    }
    return { main: fullName, tag: comp.form_factor || "STANDARD", isSet: true };
  };

  return (
    <div className="compare-rigs-page">
      <GlobalHeader hideBuildPill={true} />

      <div className="compare-ambient-glow" aria-hidden="true" />
      <div className="compare-grid-overlay" aria-hidden="true" />

      <div className="compare-main-container">
        {/* Navigation Action Bar */}
        <div className="compare-top-actions">
          <button
            type="button"
            className="compare-nav-back-btn"
            onClick={() => {
              try { soundManager.click(); } catch {}
              navigate("/compatibility");
            }}
          >
            <span className="btn-arrow">&larr;</span>
            <span>BACK TO COMPATIBILITY</span>
          </button>

          <button
            type="button"
            className="compare-nav-back-btn btn-secondary-nav"
            onClick={() => {
              try { soundManager.click(); } catch {}
              navigate("/build");
            }}
          >
            <span>BUILD WORKBENCH</span>
            <span className="btn-arrow">&rarr;</span>
          </button>
        </div>

        {/* Hero Section */}
        <header className="compare-hero-section">
          <div className="compare-telemetry-badge">
            <span className="telemetry-live-dot" />
            <span className="telemetry-label">SYSTEM ARCHITECTURE // DUAL-RIG COMPARISON MATRIX</span>
            <span className="telemetry-bracket">[ BENCHMARK AUDIT ]</span>
          </div>

          <h1 className="compare-hero-title">
            COMPARE <span className="title-accent">PC RIGS</span>
          </h1>

          <p className="compare-hero-description">
            Evaluate electrical demand, clearance constraints, memory generations, and relative gaming and productivity benchmarks side-by-side.
          </p>
        </header>

        {/* ── 2 COMPARISON CONTAINERS (LEFT & RIGHT) ── */}
        <div className="compare-dual-grid">
          {/* LEFT CONTAINER: ALWAYS RIG 1 (ACTIVE WORKBENCH) */}
          <div className="compare-rig-card card-primary-workbench">
            <div className="rig-card-header">
              <div className="rig-badge-group">
                <span className="rig-badge-live">RIG 01 // WORKBENCH</span>
                <span className="rig-badge-subtitle">Active Custom Build</span>
              </div>
              <div className="rig-compat-status-chip">
                {hasRig1 ? (
                  rig1Issues.length === 0 ? (
                    <span className="chip-badge status-ok">✓ 100% COMPATIBLE</span>
                  ) : (
                    <span className="chip-badge status-warning">⚠ {rig1Issues.length} ISSUE{rig1Issues.length > 1 ? "S" : ""}</span>
                  )
                ) : (
                  <span className="chip-badge status-empty">INCOMPLETE</span>
                )}
              </div>
            </div>

            {/* Preview Image at Top */}
            <div className="rig-preview-media-box">
              <img
                src={rig1.case?.img || "/assets/component_picker_image_bg.png"}
                alt={rig1.case?.name || "PC Rig 1"}
                className="rig-preview-image"
                onError={(e) => {
                  e.target.src = "/assets/component_picker_image_bg.png";
                }}
              />
              <div className="rig-preview-overlay-telemetry">
                <div className="telemetry-pill">
                  <span className="pill-dot red-dot" />
                  <span>{rig1Wattage}W EST.</span>
                </div>
                <div className="telemetry-pill">
                  <span className="pill-dot purple-dot" />
                  <span>SCORE {rig1Scores.gaming}</span>
                </div>
                <div className="telemetry-pill">
                  <span className="pill-dot green-dot" />
                  <span>{rig1Components.length}/7 PARTS</span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Rig 1 */}
            <div className="rig-quick-actions">
              <Link to="/build" className="btn-rig-action btn-edit-workbench" onClick={() => { try { soundManager.click(); } catch {} }}>
                <span>Edit in Workbench</span>
                <span className="action-arrow">&rarr;</span>
              </Link>
              <button
                type="button"
                className="btn-rig-action btn-snapshot-save"
                onClick={() => handleSaveCurrentToSlot(0)}
                title="Save current workbench state into Slot 01"
              >
                <span>Save Snapshot</span>
              </button>
            </div>

            {saveSuccessMsg && <div className="rig-save-toast">{saveSuccessMsg}</div>}

            {/* Detailed Specs List Below Image */}
            <div className="rig-specs-list">
              <div className="specs-list-title">HARDWARE SPECIFICATIONS</div>
              {COMPONENT_CATEGORIES.map(({ key, label, icon }) => {
                const comp = rig1[key];
                const spec = getCompSpecSummary(comp, key);
                return (
                  <div key={key} className={`spec-item-row ${spec.isSet ? "item-filled" : "item-empty"}`}>
                    <div className="spec-item-label-group">
                      <span className="spec-icon" aria-hidden="true">{icon}</span>
                      <span className="spec-category">{label}</span>
                    </div>
                    <div className="spec-item-val-group">
                      <span className="spec-name" title={spec.main}>{spec.main}</span>
                      <span className="spec-tag">{spec.tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT CONTAINER: RIG 2 (COMPARISON RIG) */}
          <div className="compare-rig-card card-secondary-comparison">
            <div className="rig-card-header">
              <div className="rig-badge-group">
                <span className="rig-badge-live badge-cyan">RIG 02 // COMPARISON</span>
                <span className="rig-badge-subtitle">Alternative Build</span>
              </div>
              <div className="rig-compat-status-chip">
                {hasRig2 ? (
                  rig2Issues.length === 0 ? (
                    <span className="chip-badge status-ok">✓ 100% COMPATIBLE</span>
                  ) : (
                    <span className="chip-badge status-warning">⚠ {rig2Issues.length} ISSUE{rig2Issues.length > 1 ? "S" : ""}</span>
                  )
                ) : (
                  <span className="chip-badge status-empty">EMPTY SLOT</span>
                )}
              </div>
            </div>

            {/* Source Switcher Tabs */}
            <div className="rig2-source-tabs">
              <button
                type="button"
                className={`source-tab-btn ${rig2Source === "preset-enthusiast" ? "active" : ""}`}
                onClick={() => handleSelectSlotSource("preset-enthusiast")}
              >
                Preset: 4K Ultra
              </button>
              <button
                type="button"
                className={`source-tab-btn ${rig2Source === "preset-budget" ? "active" : ""}`}
                onClick={() => handleSelectSlotSource("preset-budget")}
              >
                Preset: Budget
              </button>
              {[0, 1, 2].map((slotIdx) => {
                const isLoaded = Boolean(savedBuilds?.[slotIdx]);
                return (
                  <button
                    key={slotIdx}
                    type="button"
                    className={`source-tab-btn ${rig2Source === `slot-${slotIdx}` ? "active" : ""}`}
                    onClick={() => handleSelectSlotSource(`slot-${slotIdx}`)}
                  >
                    Slot 0{slotIdx + 1} {isLoaded ? "★" : ""}
                  </button>
                );
              })}
            </div>

            {/* Preview Image at Top */}
            <div className="rig-preview-media-box">
              <img
                src={rig2?.case?.img || "/assets/component_picker_image_bg.png"}
                alt={rig2?.case?.name || "PC Rig 2"}
                className="rig-preview-image"
                onError={(e) => {
                  e.target.src = "/assets/component_picker_image_bg.png";
                }}
              />
              {hasRig2 && (
                <div className="rig-preview-overlay-telemetry">
                  <div className="telemetry-pill">
                    <span className="pill-dot red-dot" />
                    <span>{rig2Wattage}W EST.</span>
                  </div>
                  <div className="telemetry-pill">
                    <span className="pill-dot purple-dot" />
                    <span>SCORE {rig2Scores.gaming}</span>
                  </div>
                  <div className="telemetry-pill">
                    <span className="pill-dot green-dot" />
                    <span>{rig2Components.length}/7 PARTS</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions for Rig 2 */}
            <div className="rig-quick-actions">
              {hasRig2 ? (
                <button
                  type="button"
                  className="btn-rig-action btn-load-to-workbench"
                  onClick={() => {
                    try { soundManager.granted(); } catch {}
                    loadDemoBuild(rig2);
                    navigate("/build");
                  }}
                  title="Load this comparison build directly into the workbench"
                >
                  <span>Load into Workbench</span>
                  <span className="action-arrow">&rarr;</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-rig-action btn-load-to-workbench"
                  onClick={() => handleSelectSlotSource("preset-enthusiast")}
                >
                  <span>Load Sample Preset</span>
                </button>
              )}
            </div>

            {/* Detailed Specs List Below Image */}
            <div className="rig-specs-list">
              <div className="specs-list-title">HARDWARE SPECIFICATIONS</div>
              {hasRig2 ? (
                COMPONENT_CATEGORIES.map(({ key, label, icon }) => {
                  const comp = rig2?.[key];
                  const spec = getCompSpecSummary(comp, key);
                  return (
                    <div key={key} className={`spec-item-row ${spec.isSet ? "item-filled" : "item-empty"}`}>
                      <div className="spec-item-label-group">
                        <span className="spec-icon" aria-hidden="true">{icon}</span>
                        <span className="spec-category">{label}</span>
                      </div>
                      <div className="spec-item-val-group">
                        <span className="spec-name" title={spec.main}>{spec.main}</span>
                        <span className="spec-tag">{spec.tag}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-rig2-prompt">
                  <p>No configuration loaded in this slot.</p>
                  <span>Pick a preset above or save your workbench build to compare.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CENTERED DEDICATED COMPATIBILITY OVERVIEW (ONLY APPEARS WHEN 2 RIGS ARE LOADED) ── */}
        {hasTwoRigs && (
          <section className="compare-dedicated-overview-card glass-panel">
            <div className="overview-header">
              <div className="compare-telemetry-badge" style={{ marginBottom: "0.8rem" }}>
                <span className="telemetry-live-dot" />
                <span className="telemetry-label">HEAD-TO-HEAD COMPATIBILITY AUDIT</span>
                <span className="telemetry-bracket">[ ACTIVE COMPARISON ]</span>
              </div>
              <h2 className="overview-title">DUAL-RIG COMPATIBILITY &amp; PERFORMANCE OVERVIEW</h2>
              <p className="overview-sub">
                Real-time differential analysis between Rig 01 (Workbench) and Rig 02 ({rig2Source.replace("-", " ").toUpperCase()}).
              </p>
            </div>

            {/* 1. Side-by-side Compatibility Inspection Results */}
            <div className="overview-compat-grid">
              <div className={`compat-verdict-box ${rig1Issues.length === 0 ? "verdict-ok" : "verdict-warn"}`}>
                <div className="verdict-header">
                  <span className="verdict-tag">RIG 01 AUDIT</span>
                  <span className="verdict-status">{rig1Issues.length === 0 ? "100% CLEAR" : `${rig1Issues.length} CONFLICT`}</span>
                </div>
                {rig1Issues.length === 0 ? (
                  <p className="verdict-desc">All 7 hardware sockets, DDR standard, and power rails are verified compatible.</p>
                ) : (
                  <ul className="verdict-issues-list">
                    {rig1Issues.map((iss, i) => (
                      <li key={i}>{iss.issue}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={`compat-verdict-box ${rig2Issues.length === 0 ? "verdict-ok" : "verdict-warn"}`}>
                <div className="verdict-header">
                  <span className="verdict-tag">RIG 02 AUDIT</span>
                  <span className="verdict-status">{rig2Issues.length === 0 ? "100% CLEAR" : `${rig2Issues.length} CONFLICT`}</span>
                </div>
                {rig2Issues.length === 0 ? (
                  <p className="verdict-desc">All selected hardware passes socket clearance, TDP demand, and pinout tests.</p>
                ) : (
                  <ul className="verdict-issues-list">
                    {rig2Issues.map((iss, i) => (
                      <li key={i}>{iss.issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 2. Head-to-Head Performance & Wattage Metrics */}
            <div className="overview-metrics-matrix">
              <div className="metric-compare-row">
                <div className="metric-name-label">
                  <span className="metric-title">ESTIMATED SYSTEM WATTAGE</span>
                  <span className="metric-caption">Peak TDP with transient headroom buffer</span>
                </div>
                <div className="metric-bar-group">
                  <div className="metric-value-col">
                    <span className="val-number">{rig1Wattage}W</span>
                    <span className="val-tag">Rig 01</span>
                  </div>
                  <div className="metric-differential-pill">
                    {rig1Wattage < rig2Wattage ? (
                      <span className="diff-green">Rig 01 is {rig2Wattage - rig1Wattage}W More Efficient</span>
                    ) : rig1Wattage > rig2Wattage ? (
                      <span className="diff-cyan">Rig 02 is {rig1Wattage - rig2Wattage}W More Efficient</span>
                    ) : (
                      <span className="diff-neutral">Identical Wattage</span>
                    )}
                  </div>
                  <div className="metric-value-col">
                    <span className="val-number">{rig2Wattage}W</span>
                    <span className="val-tag">Rig 02</span>
                  </div>
                </div>
              </div>

              <div className="metric-compare-row">
                <div className="metric-name-label">
                  <span className="metric-title">GAMING BENCHMARK SCORE</span>
                  <span className="metric-caption">GPU compute rasterization and frame pacing index</span>
                </div>
                <div className="metric-bar-group">
                  <div className="metric-value-col">
                    <span className="val-number score-purple">{rig1Scores.gaming}</span>
                    <span className="val-tag">Rig 01</span>
                  </div>
                  <div className="metric-differential-pill">
                    {rig1Scores.gaming > rig2Scores.gaming ? (
                      <span className="diff-green">Rig 01 leads by +{rig1Scores.gaming - rig2Scores.gaming} pts</span>
                    ) : rig1Scores.gaming < rig2Scores.gaming ? (
                      <span className="diff-cyan">Rig 02 leads by +{rig2Scores.gaming - rig1Scores.gaming} pts</span>
                    ) : (
                      <span className="diff-neutral">Balanced Gaming Performance</span>
                    )}
                  </div>
                  <div className="metric-value-col">
                    <span className="val-number score-purple">{rig2Scores.gaming}</span>
                    <span className="val-tag">Rig 02</span>
                  </div>
                </div>
              </div>

              <div className="metric-compare-row">
                <div className="metric-name-label">
                  <span className="metric-title">PRODUCTIVITY &amp; RENDERING</span>
                  <span className="metric-caption">Multi-threaded CPU &amp; RAM bandwidth throughput</span>
                </div>
                <div className="metric-bar-group">
                  <div className="metric-value-col">
                    <span className="val-number score-amber">{rig1Scores.productivity}</span>
                    <span className="val-tag">Rig 01</span>
                  </div>
                  <div className="metric-differential-pill">
                    {rig1Scores.productivity > rig2Scores.productivity ? (
                      <span className="diff-green">Rig 01 leads by +{rig1Scores.productivity - rig2Scores.productivity} pts</span>
                    ) : rig1Scores.productivity < rig2Scores.productivity ? (
                      <span className="diff-cyan">Rig 02 leads by +{rig2Scores.productivity - rig1Scores.productivity} pts</span>
                    ) : (
                      <span className="diff-neutral">Balanced Productivity</span>
                    )}
                  </div>
                  <div className="metric-value-col">
                    <span className="val-number score-amber">{rig2Scores.productivity}</span>
                    <span className="val-tag">Rig 02</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. BuildLab Automated Architect Summary */}
            <div className="overview-summary-banner">
              <div className="summary-icon">🤖</div>
              <div className="summary-text">
                <h4 className="summary-title">BUILDLAB ARCHITECT VERDICT</h4>
                <p className="summary-copy">
                  {rig1Scores.gaming > rig2Scores.gaming
                    ? `Rig 01 provides superior graphical horsepower (+${rig1Scores.gaming - rig2Scores.gaming} Gaming Score) with your current component combination.`
                    : rig2Scores.gaming > rig1Scores.gaming
                    ? `Rig 02 demonstrates higher graphics throughput (+${rig2Scores.gaming - rig1Scores.gaming} Gaming Score), while requiring careful consideration of power capacity.`
                    : "Both configurations offer balanced gaming and compute parity across tested hardware workloads."}
                  {" "}
                  {rig1Wattage < rig2Wattage
                    ? `Rig 01 operates cooler with an estimated ${rig2Wattage - rig1Wattage}W lower power draw.`
                    : rig1Wattage > rig2Wattage
                    ? `Rig 02 is more energy-conscious, consuming approximately ${rig1Wattage - rig2Wattage}W less power.`
                    : "Power demands are practically equivalent between both systems."}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function CompareRigs() {
  return (
    <FullscreenGate requireFullscreen>
      <CompareRigsView />
    </FullscreenGate>
  );
}

