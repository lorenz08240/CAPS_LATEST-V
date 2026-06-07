import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { checkCompatibility } from "../../utilities/compatibilityEngine";
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

  const selectedComponents = getSelectedComponents();

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
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    resetBuild();
    setCurrentStep(0); // Balik sa Step 1 (PC Case)
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
    return (
      (component.name || "").toLowerCase().includes(searchLower) ||
      (component.brand || "").toLowerCase().includes(searchLower) ||
      (component.desc || "").toLowerCase().includes(searchLower) ||
      tagsMatch
    );
  });

  return (
    <div className="build-page">
      <div className="bg-grid"></div>
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="hero-landing">
        <div className="hero-landing-content">
          <div className="hero-text-side">
            <h1>Build Your Perfect PC</h1>
            <p>
              Customize every detail of your setup with our intelligent builder.
              High-performance gaming is just a few clicks away.
            </p>
            <button
              className="btn-start-now"
              onClick={() =>
                document
                  .getElementById("build-main-area")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              START NOW
            </button>
          </div>
          <div className="hero-image-side">
            <img src="pcbackground.png" alt="Featured Gaming PC" />
          </div>
        </div>
      </div>

      {/* Add the ID 'build-main-area' here for smooth scroll */}
      <div className="build-main" id="build-main-area"></div>
      <div className="build-main">
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
                  <div key={comp.category} className="selected-component">
                    <div className="component-info">
                      <span className="component-category">
                        {comp.category}
                      </span>
                      <span className="component-name">{comp.name}</span>
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

                {selectedComponents.length === buildSteps.length ? (
                  <Link
                    to="/3d-builder"
                    className="sidebar-cta-btn sidebar-cta-3d"
                  >
                    <span className="sidebar-cta-icon">🧊</span>
                    <div className="sidebar-cta-text">
                      <span className="sidebar-cta-label">Launch 3D Builder</span>
                      <span className="sidebar-cta-sub">Visualize your full PC</span>
                    </div>
                  </Link>
                ) : (
                  <div className="sidebar-cta-btn sidebar-cta-3d sidebar-cta-locked">
                    <span className="sidebar-cta-icon">🔒</span>
                    <div className="sidebar-cta-text">
                      <span className="sidebar-cta-label">Launch 3D Builder</span>
                      <span className="sidebar-cta-sub">
                        {buildSteps.length - selectedComponents.length} more part{buildSteps.length - selectedComponents.length !== 1 ? "s" : ""} needed
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Reset Button */}
            <button onClick={handleReset} className="reset-build-btn">
              Reset Build
            </button>
          </div>

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
          <div className="components-grid">
            {filteredComponents.map((component) => {
              const { isCompatible, reason } = checkCompatibility(component, currentBuild);
              
              return (
                <div
                  key={component.id}
                  className={`component-card ${
                    selectedComponent?.id === component.id ? "selected" : ""
                  } ${!isCompatible ? "incompatible" : ""}`}
                  onClick={() => isCompatible && handleComponentSelect(component)}
                >
                  <div className="component-image">
                    <img src={component.img} alt={component.name} />
                  </div>
                  <div className="component-details">
                    <div className="component-brand">{component.brand}</div>
                    <h3 className="component-name">{component.name}</h3>
                    <p className="component-description">{component.desc}</p>
                    <div className="component-tags">
                      {Array.isArray(component.tags) &&
                        component.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                    </div>
                    <div className="component-footer">
                      <span className="component-status">
                        {!isCompatible
                          ? "🔒 Incompatible"
                          : selectedComponent?.id === component.id
                          ? "✓ Selected"
                          : "Click to select"}
                      </span>
                    </div>
                    {!isCompatible && (
                      <div className="incompatible-tooltip">
                        ⚠️ {reason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Build;
