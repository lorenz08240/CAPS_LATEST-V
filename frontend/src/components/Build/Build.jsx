import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { checkCompatibility } from "../../utilities/compatibilityEngine";
import "./Build.css";

export const buildSteps = [
  {
    key: "case",
    label: "PC Case",
    icon: "🖥️",
    description: "Houses all components",
  },
  {
    key: "motherboard",
    label: "Motherboard",
    icon: "🖲️",
    description: "Connects all components",
  },
  {
    key: "cpu",
    label: "CPU (Processor)",
    icon: "⚙️",
    description: "The brain of your PC",
  },
  {
    key: "ram",
    label: "RAM (Memory)",
    icon: "💾",
    description: "Temporary data storage",
  },
  {
    key: "storage",
    label: "Storage",
    icon: "💿",
    description: "Permanent data storage",
  },
  {
    key: "gpu",
    label: "GPU (Graphics Card)",
    icon: "🎮",
    description: "Handles graphics and gaming",
  },
  {
    key: "psu",
    label: "Power Supply (PSU)",
    icon: "⚡",
    description: "Powers your entire system",
  },
];


function Build() {
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
  const [tierFilter, setTierFilter] = useState("");
  const [viewedComponent, setViewedComponent] = useState(null);

  const selectedComponents = getSelectedComponents();

  useEffect(() => {
    setViewedComponent(null);
    setSearchQuery("");
    setTierFilter("");
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
    setViewedComponent(null);

    // Automatically move to the next step
    if (currentStep < buildSteps.length - 1) {
      setCurrentStep(currentStep + 1);
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

  // Filter components based on search query
  const filteredComponents = currentComponents.filter((component) => {
    const searchLower = searchQuery.toLowerCase();
    // Safely check if tags exists and is an array before using .some()
    const tagsMatch = Array.isArray(component.tags)
      ? component.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      : typeof component.tags === "string" &&
      component.tags.toLowerCase().includes(searchLower);
    const matchesSearch =
      (component.name || "").toLowerCase().includes(searchLower) ||
      (component.brand || "").toLowerCase().includes(searchLower) ||
      tagsMatch;

    const tierKeywords = {
      "BUDGET OFFICE": ["i3", "ryzen 3", "pentium", "athlon", "a320", "a520", "h410", "h510", "h610", "8gb", "500w", "450w", "gtx 1650", "rx 580", "gt 730", "tecware", "inplay", "ygt", "darkflash", "256gb", "500gb"],
      "MID-RANGE GAMING": ["i5", "ryzen 5", "b450", "b550", "b660", "b760", "16gb", "650w", "750w", "rtx 3060", "rtx 4060", "rx 6600", "rx 7600", "1tb", "montech", "deepcool", "mag", "tuf", "prime"],
      "HIGH-END WORKSTATION": ["i7", "i9", "ryzen 7", "ryzen 9", "z690", "z790", "x570", "x670", "32gb", "64gb", "850w", "1000w", "1200w", "rtx 3080", "rtx 4080", "rtx 4090", "rx 7900", "2tb", "4tb", "rog", "aorus", "nzxt", "corsair", "lian li"]
    };

    const matchesTier = tierFilter === "" || (() => {
      const keywords = tierKeywords[tierFilter] || [];
      const combinedString = `${component.name} ${component.brand} ${Array.isArray(component.tags) ? component.tags.join(' ') : component.tags || ''}`.toLowerCase();
      // If at least one keyword matches the component's combined string, it belongs to the tier
      return keywords.some(kw => combinedString.includes(kw));
    })();

    return matchesSearch && matchesTier;
  });

  return (
    <div className="build-page">
      <div className="bg-grid"></div>
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>


      {/* Main Build Area */}
      <div className="build-main" id="build-main-area">
        <div className="build-sidebar">
          <div className="sidebar-card">
            <h3>Build Steps</h3>
            <div className="step-list">
              {buildSteps.map((step, index) => (
                <div
                  key={step.key}
                  className={`step-item ${index === currentStep ? "active" : ""} ${currentBuild[step.key] ? "completed" : ""}`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="step-icon">
                    {currentBuild[step.key] ? "✓" : step.icon}
                  </div>
                  <div className="step-content">
                    <div className="step-title">{step.label}</div>
                    <div className="step-desc">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Selected Components</h3>
            <div className="selected-components">
              {selectedComponents.length === 0 ? (
                <p className="no-components">No components selected yet</p>
              ) : (
                selectedComponents.map((comp) => (
                  <div key={comp.category} className="selected-component" style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{width: '40px', height: '40px', flexShrink: 0, background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px'}}>
                      <img src={comp.img} alt={comp.name} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'color-dodge', borderRadius: '4px'}} />
                    </div>
                    <div className="component-info" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                      <span className="component-category" style={{fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                        {comp.category}
                      </span>
                      <span className="component-name" style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--white)'}}>{comp.name}</span>
                    </div>
                    <button
                      className="remove-component"
                      onClick={() => removeComponent(comp.category)}
                      title="Remove component"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
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
              <button
                className={`tier-btn ${tierFilter === "" ? "active" : ""}`}
                onClick={() => setTierFilter("")}
              >
                [ ALL ]
              </button>
              {["BUDGET OFFICE", "MID-RANGE GAMING", "HIGH-END WORKSTATION"].map((tier) => (
                <button
                  key={tier}
                  className={`tier-btn ${tierFilter === tier ? "active" : ""}`}
                  onClick={() => setTierFilter(tierFilter === tier ? "" : tier)}
                >
                  [ {tier} ]
                </button>
              ))}
            </div>
          </div>

          <div className="build-grid-and-panel">
            <div className="components-grid-wrapper">
              <div className="components-grid compact">
                {filteredComponents.map((component) => {
                  const { isCompatible, reason } = checkCompatibility(component, currentBuild);
                  
                  return (
                    <div
                      key={component.id}
                      className={`component-card compact-card ${
                        viewedComponent?.id === component.id ? "viewed" : ""
                      } ${selectedComponent?.id === component.id ? "selected" : ""} ${!isCompatible ? "incompatible" : ""}`}
                      onClick={() => handleCardClick(component)}
                    >
                      <div className="component-image">
                        <img src={component.img} alt={component.name} />
                      </div>
                      <div className="component-details compact-details">
                        <h3 className="component-name">{component.name}</h3>
                      </div>
                      {!isCompatible && (
                        <div className="incompatible-tooltip">
                          ⚠️ {reason}
                        </div>
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
                  <h3>Specifications</h3>
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
                      <span className="spec-label" style={{marginBottom: '4px'}}>DESCRIPTION</span>
                      <p style={{margin: 0}}>{viewedComponent.desc || "N/A"}</p>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">TAGS</span>
                      <span className="spec-value" style={{textTransform: 'capitalize'}}>
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
                  
                  {(() => {
                    const { isCompatible, reason } = checkCompatibility(viewedComponent, currentBuild);
                    return (
                      <div className="spec-action">
                        {!isCompatible ? (
                          <div className="incompatible-warning">
                            ⚠️ {reason}
                          </div>
                        ) : (
                          <button 
                            className={`btn-select-component ${selectedComponent?.id === viewedComponent.id ? "is-selected" : ""}`}
                            onClick={() => handleComponentSelect(viewedComponent)}
                          >
                            {selectedComponent?.id === viewedComponent.id ? "✓ COMPONENT SELECTED" : "SELECT COMPONENT"}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="spec-empty-state" style={{flexDirection: 'column', gap: '20px'}}>
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.3, color: '#00e5a0'}}>
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  <span>Select a component to view its specifications</span>
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
