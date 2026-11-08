import React, { useEffect, useState } from "react";
import soundManager from "../../utilities/soundManager";
import "./StageUnlockBanner.css";

/**
 * StageUnlockBanner
 * Cyberpunk animated entrance banner matching hero section theme.
 * Displays when a new stage is unlocked in Learn Mode.
 * Automatically animates away after ~2.8s and calls onComplete().
 */
export default function StageUnlockBanner({
  stageKey,
  stageNumber = "02",
  title = "STAGE UNLOCKED",
  subtitle = "Module authorized for live inspection",
  badge = "LEARN TRACK UNLOCK",
  accentColor = "#00e5a0",
  onComplete,
}) {
  const [animState, setAnimState] = useState("entering"); // entering -> active -> exiting -> done

  useEffect(() => {
    try {
      soundManager.granted();
    } catch {}

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
  }, [onComplete]);

  const handleDismissNow = () => {
    try {
      soundManager.click();
    } catch {}
    setAnimState("exiting");
    setTimeout(() => {
      setAnimState("done");
      if (onComplete) onComplete();
    }, 400);
  };

  if (animState === "done") return null;

  return (
    <div
      className={`stage-unlock-overlay ${animState}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="stage-unlock-backdrop" onClick={handleDismissNow} />

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
            <div className={`flow-node completed`}>
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
              <span className="flow-label">04 CERT</span>
            </div>
          </div>
        </div>

        <div className="unlock-footer">
          <span className="unlock-timer-bar" />
          <button
            type="button"
            className="unlock-skip-btn"
            onClick={handleDismissNow}
          >
            CONTINUE NOW &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
