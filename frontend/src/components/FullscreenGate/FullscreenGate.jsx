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
import EyeTracker from "../EyeTracker";
import "./FullscreenGate.css";

/**
 * FullscreenGate — immersive-mode gate for the Build experience.
 *
 * Two independent overlays, whichever blocks first:
 *  1. ROTATION — phones/tablets in portrait: "Rotate your device to begin"
 *  2. FULLSCREEN — when fullscreen is required, prompts user with
 *     an option to enter fullscreen or continue in windowed view.
 *
 * Never traps the student: windowed mode is always accessible.
 */
export default function FullscreenGate({ children, requireFullscreen = false }) {
  const [fullscreenActive, setFullscreenActive] = useState(isFullscreenActive());
  const [engaged, setEngaged] = useState(hasEngagedFullscreen());
  const [rotateNeeded, setRotateNeeded] = useState(needsRotation());
  const [windowedMode, setWindowedMode] = useState(() => {
    try {
      return sessionStorage.getItem("buildlab_windowed_mode") === "true";
    } catch {
      return false;
    }
  });

  const handleDismissToWindowed = useCallback(() => {
    setWindowedMode(true);
    try {
      sessionStorage.setItem("buildlab_windowed_mode", "true");
    } catch {}
  }, []);

  useEffect(() => {
    const sync = () => {
      const active = isFullscreenActive();
      setFullscreenActive(active);
      setRotateNeeded(needsRotation());
      if (active) {
        setWindowedMode(false);
        try {
          sessionStorage.removeItem("buildlab_windowed_mode");
        } catch {}
      }
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
    !windowedMode &&
    !showRotation &&
    isFullscreenSupported() &&
    !fullscreenActive &&
    (requireFullscreen || engaged);

  // Freeze page scroll while the gate is shown
  useEffect(() => {
    if (!(showRotation || showFullscreen)) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showRotation, showFullscreen]);

  const handleEnterFullscreen = useCallback(async () => {
    const ok = await enterFullscreen();
    if (ok) soundManager.granted();
  }, []);

  return (
    <>
      {showRotation && (
        <div
          className="fs-gate-overlay fs-gate-rotation"
          role="dialog"
          aria-live="polite"
        >
          <div className="fs-gate-panel">
            <div className="fs-gate-phone">
              <span className="fs-gate-phone-notch" />
            </div>
            <div className="fs-gate-badge">DESKTOP / LANDSCAPE MODE</div>
            <h1 className="fs-gate-title">Rotate Your Device</h1>
            <p className="fs-gate-desc">
              BuildLab is an immersive hardware workstation. Rotate your device
              to landscape — or open it on a desktop for the full experience.
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
          aria-live="polite"
        >
          <div className="fs-gate-panel">
            <EyeTracker
              size={92}
              shape="Cube"
              eyes="Squares"
              bounce={35}
              follow={70}
            />
            <div className="fs-gate-badge">IMMERSIVE WORKSPACE</div>
            <h1 className="fs-gate-title">
              {engaged ? "Return to Full Screen" : "Enter Full Screen"}
            </h1>
            <p className="fs-gate-desc">
              {engaged
                ? "You left full screen mode — your workstation is paused. Hop back in for the complete interactive experience."
                : "BuildLab is designed as an immersive hardware workstation. Enter full screen for the complete interactive experience."}
            </p>
            <button
              type="button"
              className="fs-gate-btn"
              onClick={handleEnterFullscreen}
            >
              ⤢ ENTER FULL SCREEN
            </button>
            <p className="fs-gate-hint">
              Press <kbd>Esc</kbd> at any time to leave (your build is saved)
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
    </>
  );
}
