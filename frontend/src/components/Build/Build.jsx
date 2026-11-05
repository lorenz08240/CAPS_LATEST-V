import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { checkCompatibility } from "../../utilities/compatibilityEngine";
import soundManager from "../../utilities/soundManager";
import FullscreenGate from "../FullscreenGate/FullscreenGate";
import GlobalHeader from "../Navigation/GlobalHeader";
import "./Build.css";

export const buildSteps = [
  {
    key: "case",
    label: "PC Case",
    description: "Houses all components",
  },
  {
    key: "motherboard",
    label: "Motherboard",
    description: "Connects all components",
  },
  {
    key: "cpu",
    label: "CPU (Processor)",

    description: "The brain of your PC",
  },
  {
    key: "ram",
    label: "RAM (Memory)",
    description: "Temporary data storage",
  },
  {
    key: "storage",
    label: "Storage",
    description: "Permanent data storage",
  },
  {
    key: "gpu",
    label: "GPU (Graphics Card)",
    description: "Handles graphics and gaming",
  },
  {
    key: "psu",
    label: "Power Supply (PSU)",
    description: "Powers your entire system",
  },
];


const CATEGORY_FILTERS = {
  case: [
    { label: "ALL", filterFn: () => true },
    { label: "Mid Tower", filterFn: (c) => (c.form_factor || "").toLowerCase().includes("mid") || (c.tags || []).some(t => t.toLowerCase().includes("mid")) },
    { label: "Full Tower", filterFn: (c) => (c.form_factor || "").toLowerCase().includes("full") || (c.tags || []).some(t => t.toLowerCase().includes("full")) },
    { label: "Micro-ATX", filterFn: (c) => (c.form_factor || "").toLowerCase().includes("micro") || (c.form_factor || "").toLowerCase().includes("matx") || (c.tags || []).some(t => t.toLowerCase().includes("micro") || t.toLowerCase().includes("matx")) },
  ],
  motherboard: [
    { label: "ALL", filterFn: () => true },
    { label: "AM5", filterFn: (c) => (c.socket_type || "").toUpperCase() === "AM5" || (c.tags || []).some(t => t.toUpperCase().includes("AM5")) },
    { label: "LGA1700", filterFn: (c) => (c.socket_type || "").toUpperCase().includes("1700") || (c.tags || []).some(t => t.toUpperCase().includes("1700")) },
    { label: "AM4", filterFn: (c) => (c.socket_type || "").toUpperCase() === "AM4" || (c.tags || []).some(t => t.toUpperCase().includes("AM4")) },
    { label: "DDR5", filterFn: (c) => (c.ddr_type || "").toUpperCase() === "DDR5" || (c.tags || []).some(t => t.toUpperCase().includes("DDR5")) },
    { label: "DDR4", filterFn: (c) => (c.ddr_type || "").toUpperCase() === "DDR4" || (c.tags || []).some(t => t.toUpperCase().includes("DDR4")) },
    { label: "ATX", filterFn: (c) => (c.form_factor || "").toUpperCase() === "ATX" },
    { label: "mATX", filterFn: (c) => (c.form_factor || "").toUpperCase().includes("MATX") || (c.form_factor || "").toLowerCase().includes("micro") },
  ],
  cpu: [
    { label: "ALL", filterFn: () => true },
    { label: "AM5", filterFn: (c) => (c.socket_type || "").toUpperCase() === "AM5" || (c.tags || []).some(t => t.toUpperCase().includes("AM5")) },
    { label: "LGA1700", filterFn: (c) => (c.socket_type || "").toUpperCase().includes("1700") || (c.tags || []).some(t => t.toUpperCase().includes("1700")) },
    { label: "AM4", filterFn: (c) => (c.socket_type || "").toUpperCase() === "AM4" || (c.tags || []).some(t => t.toUpperCase().includes("AM4")) },
    { label: "Intel", filterFn: (c) => (c.brand || "").toLowerCase().includes("intel") || (c.name || "").toLowerCase().includes("intel") || (c.name || "").toLowerCase().includes("core") },
    { label: "AMD", filterFn: (c) => (c.brand || "").toLowerCase().includes("amd") || (c.name || "").toLowerCase().includes("ryzen") || (c.name || "").toLowerCase().includes("amd") },
  ],
  ram: [
    { label: "ALL", filterFn: () => true },
    { label: "DDR5", filterFn: (c) => (c.ddr_type || "").toUpperCase() === "DDR5" || (c.tags || []).some(t => t.toUpperCase().includes("DDR5")) || (c.name || "").toUpperCase().includes("DDR5") },
    { label: "DDR4", filterFn: (c) => (c.ddr_type || "").toUpperCase() === "DDR4" || (c.tags || []).some(t => t.toUpperCase().includes("DDR4")) || (c.name || "").toUpperCase().includes("DDR4") },
    { label: "16GB", filterFn: (c) => (c.capacity || "").toUpperCase().includes("16GB") || (c.name || "").toUpperCase().includes("16GB") },
    { label: "32GB", filterFn: (c) => (c.capacity || "").toUpperCase().includes("32GB") || (c.name || "").toUpperCase().includes("32GB") },
  ],
  storage: [
    { label: "ALL", filterFn: () => true },
    { label: "NVMe M.2", filterFn: (c) => (c.type || "").toUpperCase().includes("NVME") || (c.tags || []).some(t => t.toUpperCase().includes("NVME") || t.toUpperCase().includes("M.2")) || (c.name || "").toUpperCase().includes("NVME") },
    { label: "SATA SSD", filterFn: (c) => (c.type || "").toUpperCase().includes("SATA") || (c.tags || []).some(t => t.toUpperCase().includes("SATA")) || (c.name || "").toUpperCase().includes("SATA") },
    { label: "512GB", filterFn: (c) => (c.capacity || "").toUpperCase().includes("512GB") || (c.name || "").toUpperCase().includes("512GB") },
    { label: "1TB", filterFn: (c) => (c.capacity || "").toUpperCase().includes("1TB") || (c.name || "").toUpperCase().includes("1TB") },
    { label: "2TB+", filterFn: (c) => (c.capacity || "").toUpperCase().includes("2TB") || (c.name || "").toUpperCase().includes("2TB") },
  ],
  gpu: [
    { label: "ALL", filterFn: () => true },
    { label: "NVIDIA RTX", filterFn: (c) => (c.name || "").toUpperCase().includes("RTX") || (c.name || "").toUpperCase().includes("GEFORCE") || (c.tags || []).some(t => t.toUpperCase().includes("RTX")) },
    { label: "AMD Radeon", filterFn: (c) => (c.name || "").toUpperCase().includes("RADEON") || (c.name || "").toUpperCase().includes("RX") || (c.tags || []).some(t => t.toUpperCase().includes("RX")) },
    { label: "12GB+ VRAM", filterFn: (c) => (c.tags || []).some(t => t.toUpperCase().includes("12GB") || t.toUpperCase().includes("16GB") || t.toUpperCase().includes("24GB")) || (c.name || "").toUpperCase().includes("12GB") || (c.name || "").toUpperCase().includes("16GB") },
  ],
  psu: [
    { label: "ALL", filterFn: () => true },
    { label: "500W - 650W", filterFn: (c) => (Number(c.wattage) >= 500 && Number(c.wattage) <= 650) || (c.tags || []).some(t => t.includes("500W") || t.includes("650W")) },
    { label: "750W - 850W+", filterFn: (c) => Number(c.wattage) >= 750 || (c.tags || []).some(t => t.includes("750W") || t.includes("850W") || t.includes("1000W")) },
    { label: "80+ Gold / Plat", filterFn: (c) => (c.efficiency || "").toLowerCase().includes("gold") || (c.efficiency || "").toLowerCase().includes("platinum") || (c.tags || []).some(t => t.toLowerCase().includes("gold") || t.toLowerCase().includes("platinum")) },
    { label: "Modular", filterFn: (c) => (c.desc || "").toLowerCase().includes("modular") || (c.tags || []).some(t => t.toLowerCase().includes("modular")) },
  ]
};

function BuildPage({ isIntegrated = false }) {
  const {
    currentBuild,
    allComponents,
    addComponent,
    removeComponent,
    getSelectedComponents,
    resetBuild,
    loadDemoBuild,
  } = useBuild();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(() => {
    if (location.state?.stepCategory) {
      const idx = buildSteps.findIndex((s) => s.key.toLowerCase() === location.state.stepCategory.toLowerCase());
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return new URLSearchParams(location.search).get("search") || "";
  });
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewedComponent, setViewedComponent] = useState(null);

  const selectedComponents = getSelectedComponents();

  // Completion toast: fires once the rig selection is considered "done"
  // (every step slot filled) — nudges the user to the Compatibility Checker.
  const [showCompleteToast, setShowCompleteToast] = useState(false);

  useEffect(() => {
    if (selectedComponents.length === buildSteps.length) {
      soundManager.complete();
      setShowCompleteToast(true);
      const timer = setTimeout(() => setShowCompleteToast(false), 9000);
      return () => clearTimeout(timer);
    }
    setShowCompleteToast(false);
  }, [selectedComponents.length]);

  useEffect(() => {
    setViewedComponent(currentBuild[buildSteps[currentStep].key] || null);
    setSearchQuery("");
    setActiveFilter("ALL");
  }, [currentStep]);

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(location.state.scrollTo);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.state]);

  const handleComponentSelect = (component) => {
    const category = buildSteps[currentStep].key;
    addComponent(category, component);
    soundManager.install();

    // Automatically move to the next step
    if (currentStep < buildSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      setViewedComponent(currentBuild[buildSteps[nextStepIndex].key] || null);
    } else {
      setViewedComponent(null);
    }

    // Anchor view so user never has to scroll up and down repeatedly
    const buildArea = document.getElementById("build-main-area");
    if (buildArea) {
      const rect = buildArea.getBoundingClientRect();
      if (rect.top < -50 || rect.top > 200) {
        buildArea.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleCardClick = (component) => {
    soundManager.snap();
    setViewedComponent(component);
  };

  const handleReset = () => {
    soundManager.modalClose();
    resetBuild();
    setCurrentStep(0); // Reset to Step 1 (PC Case)
  };

  const currentCategory = buildSteps[currentStep].key;
  const currentComponents = allComponents[currentCategory] || [];
  const selectedComponent = currentBuild[currentCategory];
  const currentStepData = buildSteps[currentStep];
  const currentCategoryFilters = CATEGORY_FILTERS[currentCategory] || [{ label: "ALL", filterFn: () => true }];

  // Filter components based on search query and category filters
  const filteredComponents = currentComponents.filter((component) => {
    const searchLower = searchQuery.toLowerCase();
    const tagsMatch = Array.isArray(component.tags)
      ? component.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      : typeof component.tags === "string" &&
      component.tags.toLowerCase().includes(searchLower);
    const matchesSearch =
      (component.name || "").toLowerCase().includes(searchLower) ||
      (component.brand || "").toLowerCase().includes(searchLower) ||
      tagsMatch;

    const currentFilterObj = currentCategoryFilters.find(f => f.label === activeFilter);
    const matchesCategoryFilter = !currentFilterObj || activeFilter === "ALL" || currentFilterObj.filterFn(component);

    return matchesSearch && matchesCategoryFilter;
  });

  return (
    <div className={`build-page ${isIntegrated ? 'integrated-home' : 'standalone'}`}>
      {!isIntegrated && <GlobalHeader />}
      {/* Main Build Area */}
      <div className="build-main" id="build-main-area">
        <div className="build-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-header-row">
              <div className="sidebar-header-title-wrap">
                <div className="cyber-tag-badge mini">
                  <span className="tag-bracket">[</span>
                  <span className="tag-dot" />
                  <span className="tag-text">HARDWARE STAGES</span>
                  <span className="tag-bracket">]</span>
                </div>
                <h3>ASSEMBLY RIG</h3>
              </div>
              <span className="build-step-progress-badge">
                <span className="badge-prefix">STAGE</span>
                <span className="badge-counter">{selectedComponents.length} / {buildSteps.length}</span>
              </span>
            </div>
            <div className="step-list">
              {buildSteps.map((step, index) => {
                const picked = currentBuild[step.key];
                return (
                  <div
                    key={step.key}
                    className={`step-item ${index === currentStep ? "active" : ""} ${picked ? "completed" : ""}`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="step-icon">
                      {picked ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <span className="step-num">0{index + 1}</span>
                      )}
                    </div>
                    <div className="step-content">
                      <div className="step-title">{step.label}</div>
                      <div className={`step-desc ${picked ? "step-picked-title" : ""}`}>
                        {picked ? picked.name : step.description}
                      </div>
                    </div>
                    {picked && (
                      <button
                        type="button"
                        className="step-remove-mini"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.click();
                          removeComponent(step.key);
                        }}
                        title={`Remove ${step.label}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="sidebar-foot-row">
              <button
                onClick={handleReset}
                className="reset-build-btn sidebar-reset-btn"
                disabled={selectedComponents.length === 0}
                title="Clear all selected components"
              >
                <span>RESET BUILD</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  try { soundManager.click(); } catch(e) {}
                  if (loadDemoBuild) loadDemoBuild();
                }}
                className="load-starter-btn sidebar-starter-btn"
                title="Load a balanced, fully-compatible starter PC build"
              >
                <span>STARTER RIG</span>
              </button>
            </div>
          </div>
        </div>

        <div className="build-content">
          <div className="search-and-filters">
            <div className="search-container">
              <span className="search-icon-prefix">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder={`Search ${currentStepData.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <span className="search-results-count">
                  {filteredComponents.length} result
                  {filteredComponents.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="tier-filters">
              {currentCategoryFilters.map((filter) => (
                <button
                  key={filter.label}
                  className={`tier-btn ${activeFilter === filter.label ? "active" : ""}`}
                  onClick={() => setActiveFilter(activeFilter === filter.label ? "ALL" : filter.label)}
                >
                  <span className="tier-btn-bracket">[</span>
                  <span>{filter.label.toUpperCase()}</span>
                  <span className="tier-btn-bracket">]</span>
                </button>
              ))}
            </div>
          </div>

          <div className="build-guide-subbar">
            <div className="guide-dot" />
            <span className="build-guide-text">
              STAGE {currentStep + 1} OF {buildSteps.length} // Select compatible {currentStepData.label} to advance assembly
            </span>
          </div>

          <div className="build-grid-and-panel">
            <div className="components-grid-wrapper">
              <div className="components-grid compact">
                {filteredComponents.map((component) => {
                  const isSelected = selectedComponent?.id === component.id;
                  const isViewed = viewedComponent?.id === component.id;

                  return (
                    <div
                      key={component.id}
                      className={`component-card compact-card ${isViewed ? "viewed" : ""} ${isSelected ? "selected" : ""}`}
                      onClick={() => handleCardClick(component)}
                    >
                      <div className="component-image">
                        <img src={component.img} alt={component.name} />
                      </div>
                      <div className="component-details compact-details">
                        <span className="card-brand-label">{component.brand}</span>
                        <h3 className="component-name">{component.name}</h3>
                      </div>
                      {isSelected && (
                        <span className="card-installed-tag">✓ MOUNTED</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="specifications-panel">
              {viewedComponent ? (
                <>
                  <div className="spec-header-tag">
                    <span className="tag-bracket">[</span>
                    <span className="tag-dot" />
                    <span className="tag-text">COMPONENT TELEMETRY</span>
                    <span className="tag-bracket">]</span>
                  </div>
                  <div className="spec-image-container">
                    <img src={viewedComponent.img} alt={viewedComponent.name} />
                  </div>
                  <div className="spec-title-area">
                    <span className="spec-brand-tag">{viewedComponent.brand || "Hardware"}</span>
                    <h3 className="spec-component-title">{viewedComponent.name}</h3>
                  </div>

                  {/* Primary Select Action right at the top so it is always above the fold */}
                  <div className="spec-action-top">
                    <button
                      className={`btn-select-component ${selectedComponent?.id === viewedComponent.id ? "is-selected" : ""}`}
                      onClick={() => handleComponentSelect(viewedComponent)}
                    >
                      <span className="btn-label">
                        {selectedComponent?.id === viewedComponent.id ? "✓ COMPONENT MOUNTED" : "MOUNT COMPONENT"}
                      </span>
                      <span className="btn-arrow">&rarr;</span>
                    </button>
                  </div>

                  <div className="spec-details-list">
                    {/* ALL categories have these first four fields */}
                    <div className="spec-row">
                      <span className="spec-label">BRAND</span>
                      <span className="spec-value">{viewedComponent.brand || "N/A"}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">NAME / MODEL</span>
                      <span className="spec-value">{viewedComponent.name || "N/A"}</span>
                    </div>
                    <div className="spec-row spec-desc">
                      <span className="spec-label" style={{ marginBottom: '4px' }}>DESCRIPTION</span>
                      <p style={{ margin: 0 }}>{viewedComponent.desc || "N/A"}</p>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">TAGS</span>
                      <span className="spec-value" style={{ textTransform: 'capitalize' }}>
                        {Array.isArray(viewedComponent.tags)
                          ? viewedComponent.tags.join(', ')
                          : typeof viewedComponent.tags === 'string'
                            ? (() => {
                              try {
                                const parsedTags = JSON.parse(viewedComponent.tags);
                                return Array.isArray(parsedTags) ? parsedTags.join(', ') : viewedComponent.tags;
                              } catch (e) {
                                return viewedComponent.tags;
                              }
                            })()
                            : "N/A"}
                      </span>
                    </div>

                    {/* DYNAMIC MATRIX TAGS DEPENDING ON CATEGORY */}
                    {viewedComponent.category === 'case' && (
                      <div className="spec-row">
                        <span className="spec-label">FORM FACTOR</span>
                        <span className="spec-value">{viewedComponent.form_factor || "N/A"}</span>
                      </div>
                    )}

                    {viewedComponent.category === 'motherboard' && (
                      <>
                        <div className="spec-row">
                          <span className="spec-label">SOCKET TYPE</span>
                          <span className="spec-value">{viewedComponent.socket_type || "N/A"}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">DDR TYPE</span>
                          <span className="spec-value">{viewedComponent.ddr_type || "N/A"}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">FORM FACTOR</span>
                          <span className="spec-value">{viewedComponent.form_factor || "N/A"}</span>
                        </div>
                      </>
                    )}

                    {viewedComponent.category === 'cpu' && (
                      <>
                        <div className="spec-row">
                          <span className="spec-label">SOCKET TYPE</span>
                          <span className="spec-value">{viewedComponent.socket_type || "N/A"}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">WATTAGE</span>
                          <span className="spec-value">{viewedComponent.wattage || "N/A"}</span>
                        </div>
                      </>
                    )}

                    {viewedComponent.category === 'ram' && (
                      <>
                        <div className="spec-row">
                          <span className="spec-label">DDR TYPE</span>
                          <span className="spec-value">{viewedComponent.ddr_type || "N/A"}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">CAPACITY</span>
                          <span className="spec-value">{viewedComponent.capacity || "N/A"}</span>
                        </div>
                      </>
                    )}

                    {viewedComponent.category === 'storage' && (
                      <div className="spec-row">
                        <span className="spec-label">CAPACITY</span>
                        <span className="spec-value">{viewedComponent.capacity || "N/A"}</span>
                      </div>
                    )}

                    {viewedComponent.category === 'gpu' && (
                      <div className="spec-row">
                        <span className="spec-label">POWER REQUIRED</span>
                        <span className="spec-value">{viewedComponent.power_required || "N/A"}</span>
                      </div>
                    )}

                    {viewedComponent.category === 'psu' && (
                      <div className="spec-row">
                        <span className="spec-label">WATTAGE</span>
                        <span className="spec-value">{viewedComponent.wattage || "N/A"}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="spec-overview-card">
                  <div className="spec-overview-header">
                    <div className="spec-overview-tag">
                      <span className="tag-bracket">[</span>
                      <span className="tag-dot" />
                      <span className="tag-text">RIG TELEMETRY</span>
                      <span className="tag-bracket">]</span>
                    </div>
                    <h3 className="spec-overview-title">ASSEMBLY OVERVIEW</h3>
                  </div>

                  {/* Total Selected Progress */}
                  <div className="build-progress-box">
                    <div className="progress-top-row">
                      <span className="progress-label">HARDWARE CAPACITY</span>
                      <span className="progress-value">
                        {selectedComponents.length} / {buildSteps.length}
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${(selectedComponents.length / buildSteps.length) * 100}%` }}
                      />
                    </div>
                    <span className="progress-caption">
                      {selectedComponents.length === buildSteps.length
                        ? "Complete 7-stage rig assembled. Ready for 3D Studio."
                        : `${buildSteps.length - selectedComponents.length} component${buildSteps.length - selectedComponents.length === 1 ? '' : 's'} remaining to complete.`}
                    </span>
                  </div>

                  {/* Next Step Instruction */}
                  <div className="next-step-prompt">
                    <div className="next-step-badge">
                      <span className="next-step-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </span>
                      <div className="next-step-content">
                        <div className="next-step-title">CURRENT STAGE: {currentStepData.label.toUpperCase()}</div>
                        <div className="next-step-desc">
                          {selectedComponent
                            ? `Selected: "${selectedComponent.name}". Click any card to swap or view specs.`
                            : `Select a compatible ${currentStepData.label.toLowerCase()} to mount.`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility status pill */}
                  <div className="spec-compat-banner">
                    <span className="compat-shield">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    <span>
                      {selectedComponents.length > 0
                        ? "Live pin & socket matching active"
                        : "Ready to assemble. Choose your case to begin."}
                    </span>
                  </div>

                  {/* Secondary actions */}
                  <div className="overview-cta-row">
                    <Link to="/compatibility" className="sidebar-cta-btn sidebar-cta-compat">
                      <span className="sidebar-cta-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      </span>
                      <div className="sidebar-cta-text">
                        <span className="sidebar-cta-label">COMPATIBILITY MATRIX</span>
                        <span className="sidebar-cta-sub">Verify socket clearances</span>
                      </div>
                    </Link>

                    <Link to="/3d-builder" className="sidebar-cta-btn sidebar-cta-3d">
                      <span className="sidebar-cta-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                      </span>
                      <div className="sidebar-cta-text">
                        <span className="sidebar-cta-label">Launch 3D Studio</span>
                        <span className="sidebar-cta-sub">
                          {selectedComponents.length === 0
                            ? "Interactive 3D Assembly"
                            : `Inspect ${selectedComponents.length}/${buildSteps.length} parts in 3D`}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Build-complete toast — full-screen safe (in-app DOM, no native dialogs) */}
      {showCompleteToast && (
        <div className="build-complete-toast" role="status">
          <span className="bct-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </span>
          <div className="bct-body">
            <strong>All {buildSteps.length} parts selected — build complete!</strong>
            <span>Verify pins, sockets &amp; wattage before you buy.</span>
          </div>
          <Link
            to="/compatibility"
            className="bct-cta"
            onClick={() => {
              soundManager.click();
              setShowCompleteToast(false);
            }}
          >
            Check Compatibility
          </Link>
          <button
            className="bct-close"
            onClick={() => setShowCompleteToast(false)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default Build;

/**
 * Build — routed at /build with the FullscreenGate wrapper so the
 * standalone build experience always runs in immersive fullscreen mode.
 * The instance integrated into the Home page is gated by Home instead.
 */
function Build({ isIntegrated = false }) {
  const page = <BuildPage isIntegrated={isIntegrated} />;
  return isIntegrated ? page : <FullscreenGate requireFullscreen>{page}</FullscreenGate>;
}
