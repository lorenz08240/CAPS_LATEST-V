import React, { useState, useEffect } from "react";
import { useSidebar } from "../../contexts/SidebarContext";
import systemLogo from "../../assets/system_logo.png";
import "./CyberBrand.css";

const TELEMETRY_METRICS = [
  { label: "7/7 STAGES ARMED", icon: "◈", status: "ready" },
  { label: "THERMALS: 32°C OPTIMAL", icon: "❄", status: "cool" },
  { label: "650W PSU BALANCED", icon: "⚡", status: "power" },
  { label: "SNAP-FIT VERIFIED", icon: "✓", status: "ok" },
  { label: "MATRIX SYNC: 12ms", icon: "●", status: "ping" },
];

export default function CyberBrand() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [metricIndex, setMetricIndex] = useState(0);
  const [logoError, setLogoError] = useState(false);

  // Rotate telemetry metrics when sidebar is open
  useEffect(() => {
    if (!isSidebarOpen) return;
    const interval = setInterval(() => {
      setMetricIndex((prev) => (prev + 1) % TELEMETRY_METRICS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isSidebarOpen]);

  const handleLogoBoxClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSidebar();
  };

  const currentMetric = TELEMETRY_METRICS[metricIndex];

  return (
    <div className={`cyber-brand-wrapper ${isSidebarOpen ? "sidebar-open-mode" : "standard-mode"}`}>
      <button
        type="button"
        className={`cyber-deck-trigger ${isSidebarOpen ? "deck-active" : ""}`}
        onClick={handleLogoBoxClick}
        title={isSidebarOpen ? "Collapse Command Deck [ [ ]" : "Expand Command Deck [ [ ]"}
        aria-label="Toggle BuildLab Command Deck"
      >
        <div className="trigger-glow-ring" />
        
        {isSidebarOpen ? (
          /* Animated Cyber Equalizer / Hologram Core when Sidebar is Open */
          <div className="deck-active-core">
            <div className="active-core-bars">
              <span className="eq-bar bar-1" />
              <span className="eq-bar bar-2" />
              <span className="eq-bar bar-3" />
            </div>
            <span className="active-core-close-hint">‹</span>
          </div>
        ) : (
          /* Standard BuildLab Logo when Closed */
          <div className="deck-closed-logo">
            {!logoError ? (
              <img
                src={systemLogo}
                alt="BuildLab Logo"
                className="cyber-logo-img"
                draggable={false}
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="cyber-logo-fallback">▲</span>
            )}
          </div>
        )}
      </button>

      <div className="cyber-brand-info">
        {isSidebarOpen && (
          /* Telemetry HUD only — the logo mark carries the identity otherwise */
          <div className="cyber-telemetry-hud" title="Live Hardware Lab Telemetry">
            <div className="telemetry-top-line">
              <span className="telemetry-title">COMMAND DECK</span>
              <span className="telemetry-badge-engaged">ENGAGED</span>
            </div>
            <div className="telemetry-data-line" key={metricIndex}>
              <span className={`telemetry-dot dot-${currentMetric.status}`} />
              <span className="telemetry-metric-icon">{currentMetric.icon}</span>
              <span className="telemetry-metric-text">{currentMetric.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
