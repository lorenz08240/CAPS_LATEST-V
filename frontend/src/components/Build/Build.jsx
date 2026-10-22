import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { checkCompatibility } from "../../utilities/compatibilityEngine";
import FullscreenGate from "../FullscreenGate/FullscreenGate";
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
  } = useBuild();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(() => {
    if (location.state?.stepCategory) {
      const idx = buildSteps.findIndex((s) => s.key.toLowerCase() === location.state.stepCategory.toLowerCase());
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewedComponent, setViewedComponent] = useState(null);

  const selectedComponents = getSelectedComponents();

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
    setViewedComponent(component);
  };

  const handleReset = () => {
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
    <div className={`build-page ${isIntegrated ? '' : 'standalone'}`}>
      {/* Main Build Area */}
      <div className="build-main" id="build-main-area">
        <div className="build-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-header-row">
              <h3>Build Steps</h3>
              <span className="build-step-progress-badge">
                {selectedComponents.length} / {buildSteps.length}
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
                      {picked ? "✓" : step.icon}
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
          </div>
        </div>

        <div className="build-content">
          <div className="step-header">
            <div className="step-info">
              <div className="content-cta-row">
                <Link
                  to="/compatibility"
                  className="sidebar-cta-btn sidebar-cta-compat"
                >
                  <span className="sidebar-cta-icon">🛡️</span>
                  <div className="sidebar-cta-text">
                    <span className="sidebar-cta-label">Check Compatibility</span>
                    <span className="sidebar-cta-sub">Verify your build parts</span>
                  </div>
                </Link>

                <Link
                  to="/3d-builder"
                  className="sidebar-cta-btn sidebar-cta-3d"
                >
                  <span className="sidebar-cta-icon">🧊</span>
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
            {/* Reset Button */}
            <button onClick={handleReset} className="reset-build-btn">
              Reset Build
            </button>
          </div>

          <div className="search-and-filters">
            <div className="search-container">
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
                  [ {filter.label.toUpperCase()} ]
                </button>
              ))}
            </div>
          </div>

          <div className="build-guide-subbar">
            <span className="build-guide-text">
              Select your components and build your custom rig step by step.
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
                        <span className="card-installed-tag">✓ SELECTED</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="specifications-panel">
              {viewedComponent ? (
                <>
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
                      {selectedComponent?.id === viewedComponent.id ? "✓ COMPONENT SELECTED" : "SELECT COMPONENT"}
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
                    <span className="spec-overview-tag">RIG STATUS</span>
                    <h3 className="spec-overview-title">Build Overview</h3>
                  </div>

                  {/* Total Selected Progress */}
                  <div className="build-progress-box">
                    <div className="progress-top-row">
                      <span className="progress-label">TOTAL SELECTED</span>
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
                        ? "🎉 Complete rig assembled! Ready for 3D Studio."
                        : `${buildSteps.length - selectedComponents.length} component${buildSteps.length - selectedComponents.length === 1 ? '' : 's'} remaining to complete rig.`}
                    </span>
                  </div>

                  {/* Next Step Instruction */}
                  <div className="next-step-prompt">
                    <div className="next-step-badge">
                      <span className="next-step-icon">👉</span>
                      <div className="next-step-content">
                        <div className="next-step-title">CURRENT STEP: {currentStepData.label.toUpperCase()}</div>
                        <div className="next-step-desc">
                          {selectedComponent
                            ? `Selected: "${selectedComponent.name}". Click any card in grid to switch or inspect.`
                            : `Please select a compatible ${currentStepData.label.toLowerCase()} from the grid.`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility status pill */}
                  <div className="spec-compat-banner">
                    <span className="compat-shield">🛡️</span>
                    <span>
                      {selectedComponents.length > 0
                        ? "Live pin & wattage compatibility active"
                        : "Ready to assemble. Choose your case to begin."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
