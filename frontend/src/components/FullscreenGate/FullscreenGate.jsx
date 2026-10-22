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
 * FullscreenGate — immersive-mode gate for the Build experience.
 *
 * Two independent overlays, whichever blocks first:
 *  1. ROTATION — phones/tablets in portrait: "Rotate your device to begin"
 *  2. FULLSCREEN — when fullscreen is required (or was once engaged and
 *     then exited via Esc), a banner asks the user to re-enter fullscreen.
 *
 * Never traps anyone: if the browser has no Fullscreen API (iPhone Safari),
 * the fullscreen overlay is skipped entirely and only rotation applies.
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
    if (ok) soundManager.complete();
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
            <div className="fs-gate-expands">
              <span className="fs-gate-frame fs-gate-frame-small" />
              <span className="fs-gate-arrows">⤢</span>
              <span className="fs-gate-frame fs-gate-frame-large" />
            </div>
            <div className="fs-gate-badge">IMMERSIVE MODE REQUIRED</div>
            <h1 className="fs-gate-title">Return to Full Screen</h1>
            <p className="fs-gate-desc">
              You left full screen mode — your build station is paused. Hop back
              in for the complete interactive experience.
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
          </div>
        </div>
      )}

      {children}
    </>
  );
}
