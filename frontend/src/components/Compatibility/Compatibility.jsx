import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import EyeTracker from "../EyeTracker/EyeTracker";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { getCompatibilitySummary } from "../../utilities/rules";
import soundManager from "../../utilities/soundManager";
import FullscreenGate from "../FullscreenGate/FullscreenGate";
import GlobalHeader from "../Navigation/GlobalHeader";
import StageUnlockBanner from "../Navigation/StageUnlockBanner";
import "./Compatibility.css";


const COMPAT_BOB_PHRASES = [
  "Hi there! I'm B.O.B., your compatibility inspector.",
  "Hover over any component or metric to inspect it!",
  "Pro-tip: Always leave 20-30% PSU wattage headroom for transient spikes.",
  "Never force a CPU! Look for the golden triangle alignment.",
  "Dual-channel RAM belongs in slots 2 and 4.",
  "Check GPU length clearance against your chosen PC case!",
  "Everything looks well-balanced here!"
];

const getComponentBobHint = (comp) => {
  if (!comp) return "Hardware component slot.";
  const cat = (comp.category || "").toLowerCase();
  const name = `${comp.brand || ""} ${comp.name || ""}`.trim();
  if (cat.includes("cpu")) {
    return `Inspecting CPU (${name}): Checking socket pinout and thermal TDP demand.`;
  }
  if (cat.includes("motherboard")) {
    return `Inspecting Motherboard (${name}): Validating CPU socket, RAM slots, and form factor.`;
  }
  if (cat.includes("gpu")) {
    return `Inspecting GPU (${name}): Checking PCIe x16 power draw and physical case clearance.`;
  }
  if (cat.includes("ram")) {
    return `Inspecting RAM (${name}): Validating DDR generation and channel frequency.`;
  }
  if (cat.includes("storage")) {
    return `Inspecting Storage (${name}): Checking M.2 NVMe protocol and motherboard lane speeds.`;
  }
  if (cat.includes("psu")) {
    return `Inspecting Power Supply (${name}): Verifying total wattage buffer for transient spikes.`;
  }
  if (cat.includes("case")) {
    return `Inspecting PC Case (${name}): Checking motherboard standoffs and airflow volume.`;
  }
  return `Inspecting ${name}: Verified in system hardware configuration.`;
};

function CompatibilityView({ isIntegrated = false }) {
  const navigate = useNavigate();
  const { mode, seenBanners, markBannerSeen, unlockStage } = useLearnMode();
  const [showUnlockBanner, setShowUnlockBanner] = useState(() => mode === "learn" && !seenBanners?.compatibility);
  const {
    currentBuild,
    getSelectedComponents,
    savedBuilds,
    selectedSaveSlot,
    setSelectedSaveSlot,
    saveBuildSnapshot,
    allComponents,
    loadDemoBuild,
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
  const [bobSpeech, setBobSpeech] = useState(null);
  const lastSpeechRef = useRef({ text: "", time: 0 });

  const triggerBobHint = useCallback((text) => {
    if (!text) return;
    try { soundManager.click(); } catch {}
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(30); } catch {}
    }
    // Briefly clear speech to allow re-triggering same hint and re-render speech bubble
    setBobSpeech(null);
    setTimeout(() => {
      setBobSpeech(text);
    }, 40);
  }, []);

  const handleUnlockBannerComplete = useCallback(() => {
    setShowUnlockBanner(false);
    markBannerSeen("compatibility");
    setTimeout(() => {
      triggerBobHint("Stage 02 Unlocked! All 7 parts assembled. I've audited your clearances — check the metrics below!");
    }, 500);
  }, [markBannerSeen, triggerBobHint]);

  const bindBobInteract = useCallback((hintText) => {
    let touchTimer = null;
    let startPos = null;

    return {
      title: "Right-click or hold (touchscreen) to ask B.O.B.",
      onContextMenu: (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerBobHint(hintText);
      },
      onTouchStart: (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        const touch = e.touches[0];
        startPos = { x: touch.clientX, y: touch.clientY };
        clearTimeout(touchTimer);
        touchTimer = setTimeout(() => {
          triggerBobHint(hintText);
        }, 450);
      },
      onTouchMove: (e) => {
        if (!startPos || !e.touches || e.touches.length !== 1) return;
        const dx = Math.abs(e.touches[0].clientX - startPos.x);
        const dy = Math.abs(e.touches[0].clientY - startPos.y);
        if (dx > 12 || dy > 12) {
          clearTimeout(touchTimer);
          touchTimer = null;
        }
      },
      onTouchEnd: () => {
        clearTimeout(touchTimer);
        touchTimer = null;
      },
      onTouchCancel: () => {
        clearTimeout(touchTimer);
        touchTimer = null;
      },
    };
  }, [triggerBobHint]);

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
          icon: "✓",
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
      icon: "!",
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

  // Auditory feedback when entering Compatibility Checker
  useEffect(() => {
    const timer = setTimeout(() => {
      if (compatibilityIssues.length > 0) {
        soundManager.denied();
      } else if (selectedComponents.length >= 2) {
        soundManager.granted();
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = (slot) => {
    saveBuildSnapshot(slot);
    setSelectedSaveSlot(slot);
    soundManager.granted();
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
                    {issue.fix && <p className="compat-issue-fix"><strong>Recommendation:</strong> {issue.fix}</p>}
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
        {showUnlockBanner && (
          <StageUnlockBanner
            stageKey="compatibility"
            stageNumber="02"
            title="COMPATIBILITY MATRIX UNLOCKED"
            subtitle="All 7 hardware components assembled. Automated socket, power, and thermal clearance auditing online."
            accentColor="#00e5a0"
            badge="LEARN TRACK // STAGE 02"
            onComplete={handleUnlockBannerComplete}
          />
        )}
        {!isIntegrated && <GlobalHeader hideBuildPill={true} />}
        {!isIntegrated && (
          <>
            <div className="bg-grid" aria-hidden="true" />
            <div className="bg-wave bg-wave-burgundy" aria-hidden="true" />
            <div className="bg-wave bg-wave-gold" aria-hidden="true" />
            <div className="bg-wave bg-wave-navy" aria-hidden="true" />
          </>
        )}

        <div className="compat-container-wrap">
          {!isIntegrated && (
            <div className="compat-action-bar">
              <button
                type="button"
                className="compat-back-build-btn"
                onClick={() => {
                  try { soundManager.click(); } catch {}
                  navigate("/build");
                }}
                title="Return to Build Workbench"
              >
                <span className="back-btn-arrow">&larr;</span>
                <span className="back-btn-text">BACK TO BUILD WORKBENCH</span>
              </button>
            </div>
          )}

          {!isIntegrated && (
            <header className="compat-hero-title-header">
              <h1 className="compat-hero-title">
                Real-Time <span className="title-compat-accent">Compatibility</span> Check
              </h1>
              <p className="compat-hero-desc">
                Every component is instantly verified against your existing choices.
              </p>
              <div className="compat-bob-guide-pill" title="Hardware Interactive Guide">
                <span className="bob-guide-icon">🤖</span>
                <span>Right-click or hold (touchscreen) any component or metric to inspect with B.O.B.</span>
              </div>
            </header>
          )}

          {mode === "learn" && (
            <div className="compat-learn-unlock-card">
              <div className="learn-unlock-info">
                <div className="learn-unlock-badge">
                  <span className="badge-dot" />
                  <span>STAGE 02 COMPLETE // DIAGNOSTICS AUDITED</span>
                </div>
                <h3 className="learn-unlock-title">Hardware Verification Complete</h3>
                <p className="learn-unlock-desc">
                  Your 7-stage build passed comprehensive compatibility inspection. You are now authorized to unlock the BuildLab Hardware Academy and begin your certified coursework.
                </p>
              </div>
              <button
                type="button"
                className="learn-unlock-btn"
                onClick={() => {
                  try { soundManager.granted(); } catch {}
                  unlockStage("learn");
                  navigate("/learn");
                }}
              >
                <span>UNLOCK &amp; PROCEED TO LEARN LAB</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          )}

          {compatibilityIssues.length > 0 && (
            <aside className="compat-top-banner" role="alert" {...bindBobInteract("Critical Warning: Compatibility issues found between your components!")}>
              <div className="compat-banner-info">
                <span className="banner-alert-badge">COMPATIBILITY WARNING:</span>
                <span className="banner-alert-desc">
                  Several critical issues detected in your current PC build.
                </span>
              </div>
            </aside>
          )}

          {selectedComponents.length === 0 && (
            <div className="empty-wrap">
              <div className="empty-card glass-panel" {...bindBobInteract("Workspace empty! Pick at least a CPU and Motherboard to begin checking.")}>
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
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
                  <Link to="/build" className="btn-resolve-cta" style={{ maxWidth: "240px", margin: 0 }}>
                    Go to Component Picker
                  </Link>
                  <button 
                    type="button" 
                    className="btn-resolve-cta"
                    style={{ maxWidth: "240px", margin: 0, background: "rgba(0, 229, 255, 0.15)", borderColor: "#00e5ff", color: "#00e5ff", cursor: "pointer" }}
                    onClick={() => {
                      try { soundManager.click(); } catch {}
                      if (loadDemoBuild) loadDemoBuild();
                    }}
                  >
                    Load Sample Rig (Test Demo)
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedComponents.length > 0 && (
            <div className="dashboard-layout-v2">
              <section className="column-left-60">
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
                          {...bindBobInteract(getComponentBobHint(comp))}
                        >
                          <div
                            className={`brand-monogram-pill ${isOk ? "brand-ready" : "brand-issue"}`}
                          >
                            {brandTag}
                          </div>

                          <div className="component-text-meta">
                            <span className="component-category-tag">
                              {comp.category.toUpperCase()}
                            </span>
                            <h4 className="component-product-name" title={comp.name}>
                              {comp.brand} {comp.name}
                            </h4>
                          </div>

                          <div className="status-badge-wrap">
                            <span className={`status-pill ${isOk ? "pill-ready" : "pill-issue"}`}>
                              {isOk ? "READY" : "ISSUE"}
                            </span>
                          </div>

                          <div className="component-thumb-wrap">
                            {comp.img ? (
                              <img
                                src={comp.img}
                                alt={comp.name}
                                className="component-thumb-img"
                              />
                            ) : (
                              <span className="thumb-placeholder-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {compatibilityIssues.length > 0 && !bottleneckDismissed ? (
                  <div className="bottleneck-darkred-card" {...bindBobInteract("Bottleneck Analysis: Hardware mismatch detected! Review recommendations to resolve.")}>
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
                  <div className="compatibility-all-clear-card glass-panel" {...bindBobInteract("100% Hardware Compatibility! Pinouts, DDR generation, and power rails are verified.")}>
                    <span className="all-clear-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </span>
                    <div className="all-clear-copy">
                      <h4>All Components are 100% Compatible</h4>
                      <p>No socket mismatches, clearance constraints, or wattage overdraw detected.</p>
                    </div>
                  </div>
                ) : null}

                <div className="sub-diagnostics-row">
                  <div
                    className={`sub-diag-card ${hasSocketIssue ? "diag-issue" : "diag-ready"}`}
                    {...bindBobInteract("Socket Matching: Verifying pin-level socket compatibility between CPU and Motherboard.")}
                  >
                    <div className="diag-header">
                      <span className="diag-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>
                      </span>
                      <h4 className="diag-label">Socket Matching</h4>
                    </div>
                    <p className="diag-desc">
                      Pin-level socket and chipset verification between CPU and motherboard.
                    </p>
                  </div>

                  <div
                    className={`sub-diag-card ${hasRamIssue ? "diag-issue" : "diag-ready"}`}
                    {...bindBobInteract("RAM Compatibility: Ensuring DDR4 vs DDR5 standard matches your motherboard slots.")}
                  >
                    <div className="diag-header">
                      <span className="diag-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="1"/><line x1="6" y1="18" x2="6" y2="15"/><line x1="10" y1="18" x2="10" y2="15"/><line x1="14" y1="18" x2="14" y2="15"/><line x1="18" y1="18" x2="18" y2="15"/></svg>
                      </span>
                      <h4 className="diag-label">RAM Compatibility</h4>
                    </div>
                    <p className="diag-desc">
                      Memory generation (DDR4/DDR5) and slot speed validation against the board.
                    </p>
                  </div>

                  <div
                    className={`sub-diag-card ${hasPowerIssue ? "diag-issue" : "diag-ready"}`}
                    {...bindBobInteract(`Power Requirements: System estimated at ${estWattage}W. 20-30% PSU headroom is recommended.`)}
                  >
                    <div className="diag-header">
                      <span className="diag-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      </span>
                      <h4 className="diag-label">Power Requirements</h4>
                    </div>
                    <p className="diag-desc">
                      Calculates system peak draw against PSU rated wattage with safety margin.
                    </p>
                  </div>
                </div>
              </section>

              <section className="column-right-40">
                <div className="glass-panel performance-analytics-panel">
                  <h3 className="section-title">Performance Analytics</h3>

                  <div className="kpi-grid-2x2">
                    <div className="kpi-tile-box" {...bindBobInteract(`Est. Wattage (${estWattage}W): Combined peak draw of your CPU, GPU, and system baseline.`)}>
                      <span className="kpi-icon-symbol kpi-icon-red">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      </span>
                      <div className="kpi-metric-info">
                        <span className="kpi-metric-label">Est. Wattage</span>
                        <span className="kpi-metric-value">{estWattage}W</span>
                      </div>
                    </div>

                    <div className="kpi-tile-box" {...bindBobInteract(`Hardware Stages: ${selectedComponents.length} of 7 core components selected so far.`)}>
                      <span className="kpi-icon-symbol kpi-icon-green">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      </span>
                      <div className="kpi-metric-info">
                        <span className="kpi-metric-label">Components</span>
                        <span className="kpi-metric-value">{selectedComponents.length}/7</span>
                      </div>
                    </div>

                    <div className="kpi-tile-box" {...bindBobInteract("Gaming Score: Evaluates GPU rendering capabilities and frame throughput.")}>
                      <span className="kpi-icon-symbol kpi-icon-purple">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/></svg>
                      </span>
                      <div className="kpi-metric-info">
                        <span className="kpi-metric-label">Gaming Score</span>
                        <span className="kpi-metric-value">
                          {metricScore(currentBuild, "GPU")}
                        </span>
                      </div>
                    </div>

                    <div className="kpi-tile-box" {...bindBobInteract("Productivity Score: Evaluates multi-threaded processing power and memory bandwidth.")}>
                      <span className="kpi-icon-symbol kpi-icon-cyan">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                      </span>
                      <div className="kpi-metric-info">
                        <span className="kpi-metric-label">Productivity</span>
                        <span className="kpi-metric-value">
                          {metricScore(currentBuild, "CPU")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel performance-profile-panel">
                  <div className="panel-headline-group">
                    <h3 className="section-title">Performance Profile</h3>
                    <span className="section-subcaption">Radar Performance Chart</span>
                  </div>

                  <div className="radar-canvas-container" {...bindBobInteract("5-Axis Balance Radar: Visualizing the performance equilibrium across all subsystems.")}>
                    <svg className="radar-svg-canvas" viewBox="-25 -25 310 310">
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
                            <feMergeNode in={"glow"} />
                            <feMergeNode in={"SourceGraphic"} />
                          </feMerge>
                        </filter>
                      </defs>

                      <circle cx="155" cy="105" r="95" fill="url(#radarAuraWarm)" />
                      <circle cx="105" cy="155" r="95" fill="url(#radarAuraCool)" />

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

                      <polygon
                        points={currentPoints}
                        className="radar-polygon-glow"
                        fill="rgba(0, 229, 160, 0.12)"
                        stroke="#00e5a0"
                        strokeWidth="2.2"
                        filter="url(#radarGlowFilter)"
                      />

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
                    {...bindBobInteract("Convert Profile: Toggles between standard baseline and boosted performance profiles.")}
                    onClick={() => setRadarProfileMode(!radarProfileMode)}
                  >
                    {radarProfileMode ? "Standard Profile" : "Convert Profile"}
                  </button>
                </div>

                <div className="glass-panel saved-configurations-panel">
                  <h3 className="section-title">Saved Configurations</h3>

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

                  <button
                    className="btn-toggle-evaluation"
                    onClick={() => setCompareMode(!compareMode)}
                  >
                    {compareMode ? "Hide Performance Evaluation" : "Show Performance Evaluation"}
                  </button>

                  {compareMode && (
                    <div className="side-by-side-matrix" {...bindBobInteract("Comparison Matrix: Comparing technical specs between Build 1 and Build 2 side-by-side.")}>
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

                  <div className="slot-action-footer">
                    <button
                      onClick={() => handleSave(selectedSaveSlot)}
                      className="btn-save-slot-trigger"
                      {...bindBobInteract(`Save Snapshot: Stores your current build into Slot ${selectedSaveSlot + 1}.`)}
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

        <div
          className="compat-bob-overlay"
          title="B.O.B. — Compatibility Inspector (Right-click or hold to poke!)"
          {...bindBobInteract("B.O.B. online! Right-click or hold any hardware item to inspect compatibility.")}
        >
          <EyeTracker
            size={94}
            shape="Cube"
            eyes="Squares"
            bodyColor="#00e5a0"
            eyeColor="#06080e"
            follow={90}
            bounce={55}
            speechLines={COMPAT_BOB_PHRASES}
            externalSpeech={bobSpeech}
          />
        </div>
      </div>
    </>
  );
}

export default function Compatibility({ isIntegrated = false }) {
  const content = <CompatibilityView isIntegrated={isIntegrated} />;
  return isIntegrated ? content : <FullscreenGate requireFullscreen>{content}</FullscreenGate>;
}