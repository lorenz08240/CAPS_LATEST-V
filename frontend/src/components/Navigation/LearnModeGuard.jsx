import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLearnMode } from "../../contexts/LearnModeContext";
import soundManager from "../../utilities/soundManager";
import AccountSetupModal from "../Home/AccountSetupModal";
import "./LearnModeGuard.css";

export default function LearnModeGuard({ children, requiredStage, featureName = "This Feature" }) {
  const { mode, canAccessPath, setAppMode, unlockedStages, userProfile } = useLearnMode();
  const location = useLocation();
  const navigate = useNavigate();

  const [showAccountModal, setShowAccountModal] = useState(false);

  const isAllowed = canAccessPath(location.pathname);
  if (isAllowed) {
    return children;
  }

  const hasAccount = Boolean(userProfile && userProfile.setupCompleted && userProfile.email);

  // Determine milestone destination
  let nextAction = "Return to 2D Build Station to select all 7 PC parts.";
  let actionTarget = "/#build-station";

  if (location.pathname.startsWith("/3d-builder")) {
    nextAction = "Complete your 2D assembly, check compatibility, and finish the Academy lessons.";
    actionTarget = unlockedStages.includes("learn")
      ? "/learn"
      : unlockedStages.includes("compatibility")
      ? "/compatibility"
      : "/#build-station";
  } else if (location.pathname.startsWith("/compatibility")) {
    nextAction = "Select all 7 components in the 2D Builder to unlock compatibility checking.";
    actionTarget = "/#build-station";
  } else if (location.pathname.startsWith("/learn")) {
    nextAction = "Assemble your 7-part system in the 2D Builder to unlock the Hardware Academy.";
    actionTarget = "/build";
  } else if (location.pathname.startsWith("/certificate")) {
    nextAction = "Complete all courseware lessons to earn your certificate.";
    actionTarget = "/learn";
  }

  const handleSwitchToExplore = () => {
    try { soundManager.click(); } catch {}
    setAppMode("explore");
  };

  const handleGoToCurrentStage = () => {
    try { soundManager.click(); } catch {}
    navigate(actionTarget);
  };

  const handleConnectGoogle = () => {
    try { soundManager.click(); } catch {}
    setShowAccountModal(true);
  };

  const handleAccountConfirmed = () => {
    setShowAccountModal(false);
    setAppMode("learn");
    try { soundManager.granted(); } catch {}
  };

  return (
    <div className="learn-guard-screen">
      <div className={`learn-guard-card ${!hasAccount ? "guard-account-required" : "guard-milestone-card"}`}>
        {!hasAccount ? (
          /* ══ STATE 1: NO STUDENT ACCOUNT (STICKING STRICTLY TO ACCOUNT FLOW) ══ */
          <>
            <div className="guard-academic-header">
              <div className="guard-badge badge-account">
                <span className="guard-badge-pulse" />
                <span>STUDENT ACCOUNT REQUIRED // ACADEMIC TRACK</span>
              </div>
              <div className="guard-icon-wrap icon-academic">
                <span className="guard-icon">🎓</span>
              </div>
            </div>

            <h1 className="guard-title">Sign In to Access {featureName}</h1>
            <p className="guard-reason">
              The Academic Hardware Syllabus tracks your syllabus module progression, records real-time bus probe diagnostics, and issues an accredited completion certificate in your verified student name.
            </p>

            <div className="guard-account-benefits">
              <div className="benefit-item">
                <span className="benefit-bullet">✓</span>
                <span>Automatic Google Cloud sync for rig builds & test telemetry</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-bullet">✓</span>
                <span>Verified academic certificate inscribed with your legal name</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-bullet">✓</span>
                <span>B.O.B. Interactive Hardware Guide companion</span>
              </div>
            </div>

            <div className="guard-actions">
              <button
                type="button"
                className="guard-btn-primary guard-btn-google"
                onClick={handleConnectGoogle}
              >
                <span>🔗 CONNECT GOOGLE ACCOUNT</span>
                <span className="btn-arrow">&rarr;</span>
              </button>

              <button
                type="button"
                className="guard-btn-secondary"
                onClick={handleSwitchToExplore}
                title="Browse freely without progress saving or certification"
              >
                <span>Explore Workbench as Guest</span>
              </button>
            </div>
          </>
        ) : (
          /* ══ STATE 2: AUTHENTICATED STUDENT, SEQUENTIAL MILESTONE PREREQUISITE ══ */
          <>
            <div className="guard-academic-header">
              <div className="guard-badge badge-milestone">
                <span className="guard-badge-pulse pulse-milestone" />
                <span>ACADEMIC CURRICULUM // PREREQUISITE MILESTONE</span>
              </div>
              <div className="guard-student-pill">
                <span className="student-dot" />
                <span>Logged in as <strong>{userProfile.fullName}</strong></span>
              </div>
              <div className="guard-icon-wrap icon-milestone">
                <span className="guard-icon">🛠️</span>
              </div>
            </div>

            <h1 className="guard-title">Stage 01 Assembly Required</h1>
            <p className="guard-reason">
              To get the most out of hands-on 3D hardware inspection and live circuit diagnostics, BuildLab's curriculum requires assembling a 7-component system in Stage 01 first.
            </p>

            {/* 4-Step Interactive Curriculum Roadmap Widget */}
            <div className="guard-roadmap">
              {[
                { key: "build", num: "01", name: "2D Assembly", path: "/build" },
                { key: "compatibility", num: "02", name: "Compatibility", path: "/compatibility" },
                { key: "learn", num: "03", name: "Hardware Academy", path: "/learn" },
                { key: "studio", num: "04", name: "3D Studio", path: "/3d-builder" }
              ].map((st, idx, arr) => {
                const isUnlocked = unlockedStages.includes(st.key) || (st.key === "studio" && (unlockedStages.includes("studio") || unlockedStages.includes("3d")));
                const isTarget = (st.key === requiredStage) || (st.key === "studio" && requiredStage === "3d-builder");
                const isActive = !isUnlocked && (idx === 0 || unlockedStages.includes(arr[idx - 1].key));
                
                let stepClass = "is-locked";
                let statusLabel = "Locked";
                if (isUnlocked) {
                  stepClass = "is-completed";
                  statusLabel = "Unlocked ✓";
                } else if (isActive) {
                  stepClass = "is-active";
                  statusLabel = "Current Step";
                } else if (isTarget) {
                  stepClass = "is-target";
                  statusLabel = "Gated Target";
                }

                return (
                  <React.Fragment key={st.key}>
                    <div 
                      className={`roadmap-step ${stepClass}`}
                      onClick={() => {
                        if (isUnlocked) {
                          try { soundManager.click(); } catch {}
                          navigate(st.path);
                        }
                      }}
                      title={isUnlocked ? `Click to jump to ${st.name}` : `${st.name} (${statusLabel})`}
                    >
                      <div className="roadmap-num">{st.num}</div>
                      <div className="roadmap-info">
                        <strong>{st.name}</strong>
                        <span>{statusLabel}</span>
                      </div>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`roadmap-connector ${isUnlocked ? "is-completed" : isActive ? "is-active" : ""}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="guard-actions">
              <button
                type="button"
                className="guard-btn-primary guard-btn-milestone"
                onClick={handleGoToCurrentStage}
              >
                <span>🚀 START 2D ASSEMBLY (STAGE 01)</span>
                <span className="btn-arrow">&rarr;</span>
              </button>

              <button
                type="button"
                className="guard-btn-secondary"
                onClick={handleSwitchToExplore}
                title="Switch to Explore Mode to preview this stage immediately without losing your student profile"
              >
                <span>👁️ PREVIEW ACADEMY (EXPLORE PREVIEW)</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Built-in Google Account Setup Modal ── */}
      {showAccountModal && (
        <AccountSetupModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onConfirmed={handleAccountConfirmed}
        />
      )}
    </div>
  );
}
