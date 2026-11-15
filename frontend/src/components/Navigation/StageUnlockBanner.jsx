import React, { useEffect, useState } from "react";
import soundManager from "../../utilities/soundManager";
import { enterFullscreen, isFullscreenActive, markFullscreenEngaged } from "../../utilities/fullscreen";
import "./StageUnlockBanner.css";

/**
 * StageUnlockBanner
 * Cyberpunk animated entrance banner matching hero section theme.
 * Displays when a new stage is unlocked in Learn Mode, or as an interactive
 * Welcome & Stage 01 Readiness Prompt when `requireConfirm` is true.
 */
export default function StageUnlockBanner({
  stageKey,
  stageNumber = "02",
  title = "STAGE UNLOCKED",
  subtitle = "Module authorized for live inspection",
  badge = "LEARN TRACK UNLOCK",
  accentColor = "#00e5a0",
  requireConfirm = false,
  ctaLabel = "",
  learnerProfile = null,
  autoFullscreenOnConfirm = false,
  onComplete,
}) {
  const [animState, setAnimState] = useState("entering"); // entering -> active -> exiting -> done
  const [fsActive, setFsActive] = useState(() => isFullscreenActive());

  useEffect(() => {
    const syncFs = () => setFsActive(isFullscreenActive());
    document.addEventListener("fullscreenchange", syncFs);
    document.addEventListener("webkitfullscreenchange", syncFs);
    return () => {
      document.removeEventListener("fullscreenchange", syncFs);
      document.removeEventListener("webkitfullscreenchange", syncFs);
    };
  }, []);

  useEffect(() => {
    try {
      soundManager.granted();
    } catch {}

    if (requireConfirm) {
      return undefined;
    }

    const holdTimer = setTimeout(() => {
      setAnimState("exiting");
    }, 2800);

    const exitTimer = setTimeout(() => {
      setAnimState("done");
      if (onComplete) onComplete();
    }, 3400);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete, requireConfirm]);

  const handleDismissNow = async (forceWindowed = false) => {
    try {
      soundManager.click();
    } catch {}

    if (forceWindowed) {
      try {
        sessionStorage.setItem("buildlab_windowed_mode", "true");
        window.dispatchEvent(new Event("buildlab:windowed-mode"));
      } catch {}
    } else if (autoFullscreenOnConfirm && !isFullscreenActive()) {
      const isWindowedPref =
        typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem("buildlab_windowed_mode") === "true";
      if (!isWindowedPref) {
        try {
          const ok = await enterFullscreen();
          if (ok) {
            markFullscreenEngaged();
          } else {
            // Browser prevented fullscreen: seamlessly allow windowed view so user isn't gated
            sessionStorage.setItem("buildlab_windowed_mode", "true");
            window.dispatchEvent(new Event("buildlab:windowed-mode"));
          }
        } catch {
          sessionStorage.setItem("buildlab_windowed_mode", "true");
          window.dispatchEvent(new Event("buildlab:windowed-mode"));
        }
      }
    }

    setAnimState("exiting");
    setTimeout(() => {
      setAnimState("done");
      if (onComplete) onComplete();
    }, 380);
  };

  if (animState === "done") return null;

  return (
    <div
      className={`stage-unlock-overlay ${animState}`}
      role="alert"
      aria-live="assertive"
    >
      <div
        className="stage-unlock-backdrop"
        onClick={() => {
          if (!requireConfirm) handleDismissNow(false);
        }}
      />

      <div
        className="stage-unlock-modal"
        style={{ "--stage-accent": accentColor }}
      >
        {/* Cyber scanline and decorative corners */}
        <div className="unlock-corner top-left" />
        <div className="unlock-corner top-right" />
        <div className="unlock-corner bottom-left" />
        <div className="unlock-corner bottom-right" />
        <div className="unlock-scanline" />

        <div className="unlock-meta-tag">
          <span className="unlock-pulse-dot" />
          <span className="unlock-tag-text">{badge}</span>
          <span className="unlock-stage-pill">STAGE {stageNumber}</span>
        </div>

        {learnerProfile?.fullName && (
          <div className="unlock-learner-pill">
            {learnerProfile.photo && (
              <img
                src={learnerProfile.photo}
                alt={learnerProfile.fullName}
                className="unlock-learner-avatar"
              />
            )}
            <div className="unlock-learner-info">
              <span className="unlock-learner-verified">✓ GOOGLE ACCOUNT SYNCED</span>
              <span className="unlock-learner-email">
                {learnerProfile.fullName} &middot; {learnerProfile.email}
              </span>
            </div>
          </div>
        )}

        <div className="unlock-icon-container">
          <div className="unlock-hex-glow" />
          <div className="unlock-icon-circle">
            <svg
              className="unlock-svg-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" className="unlock-shackle" />
            </svg>
          </div>
          <div className="unlock-rings">
            <span className="ring ring-1" />
            <span className="ring ring-2" />
          </div>
        </div>

        <div className="unlock-content">
          <h2 className="unlock-title">{title}</h2>
          <p className="unlock-subtitle">{subtitle}</p>

          <div className="unlock-progress-flow">
            <div className={`flow-node ${stageNumber === "01" ? "active" : "completed"}`}>
              <span className="flow-dot" />
              <span className="flow-label">01 2D RIG</span>
            </div>
            <div className="flow-line" />
            <div className={`flow-node ${stageNumber >= "02" ? "active" : ""}`}>
              <span className="flow-dot" />
              <span className="flow-label">02 COMPAT</span>
            </div>
            <div className="flow-line" />
            <div className={`flow-node ${stageNumber >= "03" ? "active" : ""}`}>
              <span className="flow-dot" />
              <span className="flow-label">03 LEARN</span>
            </div>
            <div className="flow-line" />
            <div className={`flow-node ${stageNumber >= "04" ? "active" : ""}`}>
              <span className="flow-dot" />
              <span className="flow-label">04 3D STUDIO</span>
            </div>
          </div>
        </div>

        <div className={`unlock-footer ${requireConfirm ? "is-confirm-mode" : ""}`}>
          {!requireConfirm && <span className="unlock-timer-bar" />}
          {requireConfirm ? (
            <div className="unlock-confirm-actions">
              <button
                type="button"
                className="unlock-primary-cta-btn"
                onClick={() => handleDismissNow(false)}
                autoFocus
              >
                <span>
                  {ctaLabel ||
                    (!fsActive && autoFullscreenOnConfirm
                      ? "ENTER FULL SCREEN & START B.O.B. GUIDE →"
                      : "START STAGE 01 & LAUNCH B.O.B. GUIDE →")}
                </span>
              </button>
              {!fsActive && autoFullscreenOnConfirm && (
                <button
                  type="button"
                  className="unlock-windowed-sub-btn"
                  onClick={() => handleDismissNow(true)}
                >
                  Continue in windowed view &rarr;
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="unlock-skip-btn"
              onClick={() => handleDismissNow(false)}
            >
              {ctaLabel || "CONTINUE NOW →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
