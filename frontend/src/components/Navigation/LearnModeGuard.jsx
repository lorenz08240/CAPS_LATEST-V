import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLearnMode } from "../../contexts/LearnModeContext";
import soundManager from "../../utilities/soundManager";
import "./LearnModeGuard.css";

export default function LearnModeGuard({ children, requiredStage, featureName = "This Feature" }) {
  const { mode, canAccessPath, setAppMode, unlockedStages } = useLearnMode();
  const location = useLocation();
  const navigate = useNavigate();

  const isAllowed = canAccessPath(location.pathname);

  if (isAllowed) {
    return children;
  }

  // Determine helpful guidance text based on what is locked
  let reason = "This module is locked as part of your guided Learn Mode track.";
  let nextAction = "Return to 2D Build Station to select all 7 PC parts.";
  let actionTarget = "/#build-station";

  if (location.pathname.startsWith("/3d-builder")) {
    reason = "3D Studio unlocks as the final engineering sandbox in your guided Learn Track.";
    nextAction = "Complete your 2D assembly, check compatibility, and finish the Academy lessons.";
    actionTarget = unlockedStages.includes("learn")
      ? "/learn"
      : unlockedStages.includes("compatibility")
      ? "/compatibility"
      : "/#build-station";
  } else if (location.pathname.startsWith("/compatibility")) {
    reason = "The Hardware Compatibility Matrix requires a complete 7-part build before running real-time diagnostics.";
    nextAction = "Select all 7 components in the 2D Builder to unlock compatibility checking.";
    actionTarget = "/#build-station";
  } else if (location.pathname.startsWith("/learn")) {
    reason = "The Hardware Academy curriculum unlocks once you have assembled a rig and inspected its compatibility.";
    nextAction = "Finish the Compatibility inspection to unlock the Academy.";
    actionTarget = unlockedStages.includes("compatibility") ? "/compatibility" : "/#build-station";
  } else if (location.pathname.startsWith("/certificate")) {
    reason = "Official Certification is issued upon 100% completion of the Academy curriculum.";
    nextAction = "Complete all courseware lessons to earn your certificate.";
    actionTarget = "/learn";
  }

  const handleSwitchToExplore = () => {
    soundManager.click();
    setAppMode("explore");
  };

  const handleGoToCurrentStage = () => {
    soundManager.click();
    navigate(actionTarget);
  };

  return (
    <div className="learn-guard-screen">
      <div className="learn-guard-card">
        <div className="guard-cyber-header">
          <div className="guard-badge">
            <span className="guard-badge-pulse" />
            <span>LEARN TRACK LOCK // ACCESS RESTRICTED</span>
          </div>
          <div className="guard-icon-wrap">
            <span className="guard-lock-icon">🔒</span>
          </div>
        </div>

        <h1 className="guard-title">{featureName} is Locked</h1>
        <p className="guard-reason">{reason}</p>

        <div className="guard-path-box">
          <div className="guard-path-header">
            <span className="path-dot" />
            <span>REQUIRED NEXT STEP:</span>
          </div>
          <p className="guard-path-desc">{nextAction}</p>
        </div>

        <div className="guard-actions">
          <button
            type="button"
            className="guard-btn-primary"
            onClick={handleGoToCurrentStage}
          >
            <span>CONTINUE LEARN TRACK</span>
            <span className="btn-arrow">&rarr;</span>
          </button>

          <button
            type="button"
            className="guard-btn-secondary"
            onClick={handleSwitchToExplore}
            title="Switch to Explore Mode to browse with all features unlocked"
          >
            <span>SWITCH TO EXPLORE MODE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
