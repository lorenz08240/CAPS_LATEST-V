import React, { useState, useEffect, useCallback } from "react";
import {
  enterFullscreen,
  isFullscreenActive,
  isFullscreenSupported,
  hasEngagedFullscreen,
  markFullscreenEngaged,
  needsRotation,
  onViewportChange,
} from "../../utilities/fullscreen";
import soundManager from "../../utilities/soundManager";
import "./FullscreenGate.css";

/**
 * FullscreenGate — Centered modal dialog for BuildLab's immersive workstation mode.
 *
 * Visual Reference: Dark-glassmorphic slate card with cyan-to-emerald accents,
 * side-by-side hero layout featuring the BuildLab Flask/Chip logo, vertical divider,
 * clean typography, vibrant gradient CTA button, and keyboard shortcut note.
 */
export default function FullscreenGate({ children, requireFullscreen = false }) {
  const [fullscreenActive, setFullscreenActive] = useState(isFullscreenActive());
  const [engaged, setEngaged] = useState(hasEngagedFullscreen());
  const [rotateNeeded, setRotateNeeded] = useState(needsRotation());

  useEffect(() => {
    const sync = () => {
      const active = isFullscreenActive();
      setFullscreenActive(active);
      setRotateNeeded(needsRotation());
      if (active && !hasEngagedFullscreen()) {
        markFullscreenEngaged();
        setEngaged(true);
      }
    };
    const unsubscribe = onViewportChange(sync);
    sync();
    return unsubscribe;
  }, []);

  const showRotation = rotateNeeded;
  const showFullscreen =
    !showRotation &&
    isFullscreenSupported() &&
    !fullscreenActive &&
    (requireFullscreen || engaged);

  // Freeze page scroll while the gate modal is displayed
  useEffect(() => {
    if (!(showRotation || showFullscreen)) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showRotation, showFullscreen]);

  const handleEnterFullscreen = useCallback(async () => {
    soundManager.click();
    const ok = await enterFullscreen();
    if (ok) {
      soundManager.granted();
      markFullscreenEngaged();
      setEngaged(true);
      setFullscreenActive(true);
    }
  }, []);

  // Keyboard shortcut: Press Enter to engage fullscreen while modal is open
  useEffect(() => {
    if (!showFullscreen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.repeat) {
        handleEnterFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFullscreen, handleEnterFullscreen]);

  return (
    <>
      {/* Device Rotation Gate (portrait mobile/tablets) */}
      {showRotation && (
        <div
          className="fs-gate-overlay fs-gate-rotation"
          role="dialog"
          aria-modal="true"
          aria-label="Device rotation required"
        >
          <div className="fs-gate-rotation-panel">
            <div className="fs-gate-phone">
              <span className="fs-gate-phone-notch" />
            </div>
            <div className="fs-gate-badge">DESKTOP / LANDSCAPE MODE</div>
            <h1 className="fs-gate-rot-title">Rotate Your Device</h1>
            <p className="fs-gate-rot-desc">
              BuildLab is an immersive hardware workstation. Rotate your device
              to landscape — or open it on a desktop for the complete experience.
            </p>
            <div className="fs-gate-status">
              <span>✓ HARDWARE SIMULATOR READY</span>
              <span>✓ AWAITING ORIENTATION</span>
            </div>
          </div>
        </div>
      )}

      {/* Return to Full Screen Modal Dialog */}
      {showFullscreen && (
        <div
          className="fs-gate-overlay fs-gate-fullscreen"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fs-gate-title"
          aria-describedby="fs-gate-desc"
        >
          <div className="fs-gate-card">
            {/* Top & Header Row: Side-by-Side Hero Layout */}
            <div className="fs-card-hero">
              {/* Left Column: BuildLab Flask/Chip Logo */}
              <div className="fs-hero-logo-col">
                <img
                  src="/assets/buildlab_logo_tight.png"
                  alt="BuildLab Flask & Chip Logo"
                  className="fs-hero-logo"
                  draggable={false}
                />
              </div>

              {/* Subtle Vertical Divider */}
              <div className="fs-hero-divider" aria-hidden="true" />

              {/* Right Column: Title & Fullscreen Info */}
              <div className="fs-hero-text-col">
                {/* Header Tag */}
                <div className="fs-hero-subtitle">
                  IMMERSIVE MODE REQUIRED
                </div>

                {/* Bold Heading */}
                <h1 className="fs-hero-title" id="fs-gate-title">
                  <span className="fs-title-white">
                    {engaged ? "Return to" : "Enter"}
                  </span>
                  <span className="fs-title-gradient">Full Screen</span>
                </h1>
              </div>
            </div>

            {/* Body Text / Subtext */}
            <p className="fs-card-subtext" id="fs-gate-desc">
              {engaged
                ? "You left full screen mode — your workstation is paused. Hop back in for the complete interactive experience."
                : "BuildLab is designed as an immersive hardware workstation. Enter full screen for the complete interactive experience."}
            </p>

            {/* Action Button: CTA Pill with Vibrant Cyan-to-Emerald Gradient */}
            <button
              type="button"
              className="fs-card-btn"
              onClick={handleEnterFullscreen}
              autoFocus
            >
              <svg
                className="fs-card-btn-arrow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
              <span>ENTER FULL SCREEN</span>
            </button>

            {/* Keyboard Shortcut Note */}
            <p className="fs-card-esc-hint">
              Press <kbd className="fs-kbd-f11">F11</kbd> at any time to leave (your build is saved).
            </p>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
