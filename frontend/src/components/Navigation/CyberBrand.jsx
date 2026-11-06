import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import soundManager from "../../utilities/soundManager";
import systemLogo from "../../assets/system_logo.png";
import "./CyberBrand.css";

const TELEMETRY_METRICS = [
  { label: "7/7 STAGES ARMED", icon: "◈", status: "ready" },
  { label: "THERMALS: 32°C OPTIMAL", icon: "❄", status: "cool" },
  { label: "650W PSU BALANCED", icon: "⚡", status: "power" },
  { label: "SNAP-FIT VERIFIED", icon: "✓", status: "ok" },
  { label: "MATRIX SYNC: 12ms", icon: "●", status: "ping" },
];

export default function CyberBrand({ onNavigateHome }) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [metricIndex, setMetricIndex] = useState(0);
  const navigate = useNavigate();

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

  const handleBrandTextClick = (e) => {
    try {
      soundManager.click();
    } catch {}
    if (onNavigateHome) {
      onNavigateHome(e);
    } else {
      navigate("/");
    }
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
          /* Standard BuildLab Triangle / Logo when Closed */
          <div className="deck-closed-logo">
            <img
              src={systemLogo}
              alt="BuildLab Logo"
              className="cyber-logo-img"
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="cyber-logo-fallback">▲</span>
          </div>
        )}
      </button>

      <div className="cyber-brand-info" onClick={handleBrandTextClick}>
        {isSidebarOpen ? (
          /* 100x Cooler Telemetry HUD Readout (Replaces Redundant Logo) */
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
        ) : (
          /* Standard Brand Typography when Closed */
          <div className="cyber-standard-brand">
            <span className="cyber-brand-title">BUILDLAB</span>
            <span className="cyber-brand-badge">SYSTEM V2.4</span>
          </div>
        )}
      </div>
    </div>
  );
}
