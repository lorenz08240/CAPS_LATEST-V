import React, { useState } from "react";
import { useLearnMode } from "../../contexts/LearnModeContext";
import soundManager from "../../utilities/soundManager";
import "./AccountSetupModal.css";

export default function AccountSetupModal({ isOpen, onClose, onConfirmed }) {
  const { userProfile, setUserProfile, setAppMode } = useLearnMode();

  const [step, setStep] = useState("connect"); // 'connect' | 'name_input'
  const [fullName, setFullName] = useState(userProfile.fullName || "");
  const [email, setEmail] = useState(userProfile.email || "learner.student@gmail.com");
  const [avatar, setAvatar] = useState(userProfile.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces");
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Google Sign-In linking
  const handleGoogleSignIn = () => {
    soundManager.click();
    setIsLinking(true);
    setError("");

    // Simulate authentic Google OAuth redirect/token exchange with feedback
    setTimeout(() => {
      setIsLinking(false);
      try {
        soundManager.granted();
      } catch {}
      setEmail("learner.student@gmail.com");
      setAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces");
      setStep("name_input");
    }, 650);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      soundManager.warning();
      setError("Please enter your name to proceed to the Build station.");
      return;
    }

    soundManager.granted();
    const finalProfile = {
      fullName: fullName.trim(),
      email: email.trim(),
      photo: avatar,
      googleId: "google-oauth2|linked",
      setupCompleted: true,
      joinedDate: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    setUserProfile(finalProfile);
    setAppMode("learn");

    // Dispatch learner onboarding event for B.O.B.'s guide animation
    try {
      window.dispatchEvent(
        new CustomEvent("buildlab:learner-onboarding-welcome", {
          detail: { name: fullName.trim() },
        })
      );
    } catch {}

    if (onConfirmed) {
      onConfirmed("learn");
    } else {
      onClose();
    }
  };

  return (
    <div className="account-modal-overlay" onClick={onClose}>
      <div className="account-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="account-modal-header">
          <div className="account-step-tag">
            <span className="step-badge">[ 01 ]</span>
            <span className="step-title">LEARN MODE // GOOGLE AUTH</span>
          </div>
          <button
            type="button"
            className="account-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {step === "connect" ? (
          <div className="account-step-body">
            <div className="account-hero-icon">
              <span className="cyber-cert-icon">🎓</span>
            </div>
            <h2 className="account-title">Student Certification Profile</h2>
            <p className="account-subtitle">
              Sign in with your Google account to track your progress and generate your official BuildLab verified Certificate of Completion.
            </p>

            {/* ONLY OPTION: GOOGLE ACCOUNT BUTTON */}
            <div className="google-only-auth-container">
              <button
                type="button"
                className={`google-primary-auth-btn ${isLinking ? "loading" : ""}`}
                onClick={handleGoogleSignIn}
                disabled={isLinking}
              >
                {isLinking ? (
                  <div className="google-auth-spinner" />
                ) : (
                  <svg className="google-icon-svg" viewBox="0 0 24 24" width="22" height="22">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{isLinking ? "Connecting Google Account..." : "Continue with Google Account"}</span>
              </button>
            </div>

            <p className="account-trust-note">
              🔒 We only access your basic Google identity to save your custom rig builds and Academy certificate. No private drive data requested.
            </p>
          </div>
        ) : (
          <form className="account-step-body" onSubmit={handleNameSubmit}>
            <div className="verified-google-badge">
              <img src={avatar} alt="Avatar" className="verified-avatar" />
              <div className="verified-text">
                <span className="verified-pill">✓ Google Account Linked</span>
                <span className="verified-email">{email}</span>
              </div>
            </div>

            <h3 className="details-heading">Enter Your Legal Name</h3>
            <p className="details-sub">
              Please enter your full name as you wish it to appear on your verified Certificate of Completion and B.O.B. companion logs:
            </p>

            {error && <div className="account-error-alert">{error}</div>}

            <div className="account-form-group">
              <label htmlFor="fullname-input">Full Legal Name *</label>
              <input
                id="fullname-input"
                type="text"
                className="account-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex J. Mercer"
                autoFocus
                required
              />
              <span className="input-hint">
                Certificate will be issued to: <strong>{fullName || "Your Name"}</strong>
              </span>
            </div>

            <div className="account-form-actions">
              <button
                type="button"
                className="btn-back-step"
                onClick={() => setStep("connect")}
              >
                &larr; Reconnect
              </button>
              <button type="submit" className="btn-confirm-track">
                <span>PROCEED TO 2D BUILDER</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
