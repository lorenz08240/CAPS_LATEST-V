import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
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

export const FullscreenGateContext = createContext(false);

/**
 * FullscreenGate — Centered modal dialog for BuildLab's immersive workstation mode.
 *
 * Visual Reference: Dark-glassmorphic slate card with cyan-to-emerald accents,
 * side-by-side hero layout featuring the BuildLab Flask/Chip logo, vertical divider,
 * clean typography, vibrant gradient CTA button, and keyboard shortcut note.
 */
export default function FullscreenGate({ children, requireFullscreen = true, disabled = false }) {
  const isNested = useContext(FullscreenGateContext);
  if (isNested) {
    // If nested inside an active global FullscreenGate, pass children through directly
    return <>{children}</>;
  }

  const [fullscreenActive, setFullscreenActive] = useState(() => isFullscreenActive());
  const [engaged, setEngaged] = useState(() => hasEngagedFullscreen());
  const [rotateNeeded, setRotateNeeded] = useState(() => needsRotation());
  const [windowedMode, setWindowedMode] = useState(false);
  const [hasSeenPreloader, setHasSeenPreloader] = useState(() => {
    try {
      return sessionStorage.getItem("buildlab_preloader_seen") === "true";
    } catch {
      return true;
    }
  });

  const handleDismissToWindowed = useCallback(() => {
    setWindowedMode(true);
  }, []);

  // Listen for preloader completion so we don't flash the gate underneath the welcome splash
  useEffect(() => {
    const handlePreloaderDone = () => {
      setHasSeenPreloader(true);
      const active = isFullscreenActive();
      setFullscreenActive(active);
      if (active) {
        setWindowedMode(false);
        markFullscreenEngaged();
        setEngaged(true);
      }
    };
    window.addEventListener("buildlab:preloader-completed", handlePreloaderDone);
    return () => window.removeEventListener("buildlab:preloader-completed", handlePreloaderDone);
  }, []);

  useEffect(() => {
    if (disabled) return;

    const sync = () => {
      const active = isFullscreenActive();
      setFullscreenActive(active);
      setRotateNeeded(needsRotation());
      if (active) {
        setWindowedMode(false);
        markFullscreenEngaged();
        setEngaged(true);
      }
    };

    const unsubscribe = onViewportChange(sync);
    sync();
    return unsubscribe;
  }, [disabled]);

  const showRotation = !disabled && rotateNeeded;
  const showFullscreen =
    !disabled &&
    !windowedMode &&
    !showRotation &&
    isFullscreenSupported() &&
    !fullscreenActive &&
    hasSeenPreloader;

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
      setWindowedMode(false);
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
    <FullscreenGateContext.Provider value={true}>
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

      {showFullscreen && (
        <div
          className="fs-gate-overlay fs-gate-fullscreen"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fs-gate-title"
          aria-describedby="fs-gate-desc"
        >
          <div className="fs-gate-card">
            <div className="fs-card-hero">
              <div className="fs-hero-logo-col">
                <img
                  src="/assets/buildlab_logo_tight.png"
                  alt="BuildLab Flask & Chip Logo"
                  className="fs-hero-logo"
                  draggable={false}
                />
              </div>

              <div className="fs-hero-divider" aria-hidden="true" />

              <div className="fs-hero-text-col">
                <div className="fs-hero-subtitle">
                  IMMERSIVE MODE REQUIRED
                </div>

                <h1 className="fs-hero-title" id="fs-gate-title">
                  <span className="fs-title-white">
                    {engaged ? "Return to" : "Enter"}
                  </span>
                  <span className="fs-title-gradient">Full Screen</span>
                </h1>
              </div>
            </div>

            <p className="fs-card-subtext" id="fs-gate-desc">
              {engaged
                ? "You left full screen mode — your workstation is paused. Hop back in for the complete interactive experience."
                : "BuildLab is designed as an immersive hardware workstation. Enter full screen for the complete interactive experience."}
            </p>

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

            <p className="fs-card-esc-hint">
              Press <kbd className="fs-kbd-f11">F11</kbd> at any time to toggle fullscreen.
            </p>

            <button
              type="button"
              className="fs-gate-btn-secondary"
              onClick={handleDismissToWindowed}
              style={{
                marginTop: "12px",
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "0.82rem",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Continue in windowed view →
            </button>
          </div>
        </div>
      )}

      {children}
    </FullscreenGateContext.Provider>
  );
}
