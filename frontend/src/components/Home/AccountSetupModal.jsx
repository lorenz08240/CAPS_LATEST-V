import React, { useState } from "react";
import { useLearnMode } from "../../contexts/LearnModeContext";
import soundManager from "../../utilities/soundManager";
import "./AccountSetupModal.css";

const GOOGLE_DEMO_ACCOUNTS = [
  {
    name: "Alex J. Mercer",
    email: "alex.mercer.eng@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    institution: "Technological University",
  },
  {
    name: "Maria Santos",
    email: "maria.santos.cs@gmail.com",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces",
    institution: "Polytechnic University",
  },
];

export default function AccountSetupModal({ isOpen, onClose, onConfirmed }) {
  const { userProfile, setUserProfile, setAppMode } = useLearnMode();

  const [step, setStep] = useState("connect"); // 'connect' | 'details'
  const [fullName, setFullName] = useState(userProfile.fullName || "");
  const [email, setEmail] = useState(userProfile.email || "");
  const [institution, setInstitution] = useState(userProfile.institution || "");
  const [avatar, setAvatar] = useState(userProfile.photo || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSimulateGoogleLogin = (acc = GOOGLE_DEMO_ACCOUNTS[0]) => {
    soundManager.click();
    setFullName(acc.name);
    setEmail(acc.email);
    setAvatar(acc.avatar);
    setInstitution(acc.institution || "");
    setError("");
    setStep("details");
  };

  const handleCustomGoogleConnect = () => {
    soundManager.click();
    setFullName("Builder Student");
    setEmail("student@gmail.com");
    setAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces");
    setStep("details");
  };

  const handleSkipToExplore = () => {
    soundManager.click();
    setAppMode("explore");
    if (onConfirmed) {
      onConfirmed("explore");
    } else {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      soundManager.warning();
      setError("Please enter your Full Name as it should appear on your Certificate.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      soundManager.warning();
      setError("Please provide a valid Google account email address.");
      return;
    }

    soundManager.granted();
    setUserProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      institution: institution.trim(),
      photo: avatar,
      setupCompleted: true,
      joinedDate: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    });
    setAppMode("learn");

    if (onConfirmed) {
      onConfirmed();
    } else {
      onClose();
    }
  };

  return (
    <div className="account-modal-overlay" onClick={onClose}>
      <div className="account-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="account-modal-header">
          <div className="account-step-tag">
            <span className="step-badge">STAGE 01</span>
            <span className="step-title">LEARN MODE SETUP</span>
          </div>
          <button
            type="button"
            className="account-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
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

            <div className="google-connect-section">
              <button
                type="button"
                className="google-auth-btn"
                onClick={() => handleSimulateGoogleLogin(GOOGLE_DEMO_ACCOUNTS[0])}
              >
                <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
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
                <span>Continue with Google</span>
              </button>

              <div className="google-divider">
                <span>OR SELECT DEMO STUDENT</span>
              </div>

              <div className="demo-accounts-list">
                {GOOGLE_DEMO_ACCOUNTS.map((acc, i) => (
                  <button
                    key={i}
                    type="button"
                    className="demo-account-pill"
                    onClick={() => handleSimulateGoogleLogin(acc)}
                  >
                    <img src={acc.avatar} alt={acc.name} className="demo-avatar" />
                    <div className="demo-info">
                      <span className="demo-name">{acc.name}</span>
                      <span className="demo-email">{acc.email}</span>
                    </div>
                    <span className="demo-select-tag">SELECT &rarr;</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="account-trust-note">
              🔒 We only collect your Name and Email to inscribe onto your final certificate. No unnecessary permissions requested.
            </p>

            <div className="account-explore-alt">
              <span>Just want to explore freely without a certificate?</span>
              <button
                type="button"
                className="explore-alt-btn"
                onClick={handleSkipToExplore}
              >
                Switch to Explore Mode &rarr;
              </button>
            </div>
          </div>
        ) : (
          <form className="account-step-body" onSubmit={handleSubmit}>
            <div className="verified-google-badge">
              <img src={avatar || "/pcbackground.png"} alt="Avatar" className="verified-avatar" />
              <div className="verified-text">
                <span className="verified-pill">✓ Google Account Connected</span>
                <span className="verified-email">{email}</span>
              </div>
              <button
                type="button"
                className="change-account-btn"
                onClick={() => setStep("connect")}
              >
                Change
              </button>
            </div>

            <h3 className="details-heading">Verify Your Certificate Details</h3>
            <p className="details-sub">
              Your name below will be printed on your official Certificate of Completion. You can adjust the spelling now:
            </p>

            {error && <div className="account-error-alert">{error}</div>}

            <div className="account-form-group">
              <label htmlFor="fullname-input">Full Legal Name (For Certificate) *</label>
              <input
                id="fullname-input"
                type="text"
                className="account-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex J. Mercer"
                required
              />
              <span className="input-hint">Will appear as: <strong>{fullName || "Your Full Name"}</strong></span>
            </div>

            <div className="account-form-group">
              <label htmlFor="email-input">Google Account Email *</label>
              <input
                id="email-input"
                type="email"
                className="account-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                required
              />
            </div>

            <div className="account-form-group">
              <label htmlFor="institution-input">University / School / Affiliation (Optional)</label>
              <input
                id="institution-input"
                type="text"
                className="account-input"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Technological University of the Philippines"
              />
            </div>

            <div className="account-form-actions">
              <button
                type="button"
                className="btn-back-step"
                onClick={() => setStep("connect")}
              >
                &larr; Back
              </button>
              <button type="submit" className="btn-confirm-track">
                <span>CONFIRM & START LEARN TRACK</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
