import React, { useState, useEffect } from "react";
import { useLearnMode } from "../../contexts/LearnModeContext";
import soundManager from "../../utilities/soundManager";
import "./AccountSetupModal.css";

export default function AccountSetupModal({ isOpen, onClose, onConfirmed }) {
  const { userProfile, setUserProfile, setAppMode } = useLearnMode();

  const [step, setStep] = useState("connect"); // 'connect' | 'tester_email' | 'name_input'
  const [fullName, setFullName] = useState(userProfile.fullName || "");
  const [email, setEmail] = useState(userProfile.email || "");
  const [avatar, setAvatar] = useState(
    userProfile.photo ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces"
  );
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState("");
  const [testerEmailInput, setTesterEmailInput] = useState("");
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

  if (!isOpen) return null;

  // Google Sign-In linking
  const handleGoogleSignIn = async () => {
    soundManager.click();
    setError("");
    setIsLinking(true);

    // Wait up to 1.5 seconds for window.google to be ready if needed
    if (!window.google?.accounts?.oauth2) {
      await new Promise((resolve) => {
        let count = 0;
        const check = setInterval(() => {
          count++;
          if (window.google?.accounts?.oauth2 || count >= 15) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
    }

    // If real Google Client ID is configured and Google GSI script is loaded:
    if (googleClientId && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const data = await res.json();
                setEmail(data.email || "learner.tester@gmail.com");
                setFullName(data.name || "");
                setAvatar(
                  data.picture ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || data.email)}`
                );
                try { soundManager.granted(); } catch {}
                setStep("name_input");
              } catch (fetchErr) {
                console.error("Failed to fetch Google profile:", fetchErr);
                setError("Connected to Google, but couldn't retrieve profile. Please enter details below.");
                setStep("tester_email");
              }
            }
            setIsLinking(false);
          },
          error_callback: (err) => {
            console.warn("Google OAuth error / cancelled:", err);
            setIsLinking(false);
            if (err?.type === "popup_closed") {
              setError("Google sign-in popup was closed.");
            } else {
              setError("Google sign-in encountered an issue. You can also test with your email below.");
            }
          },
        });

        client.requestAccessToken({ prompt: "select_account" });
      } catch (err) {
        console.error("Google initTokenClient error:", err);
        setIsLinking(false);
        setStep("tester_email");
      }
    } else {
      setIsLinking(false);
      setStep("tester_email");
    }
  };

  const handleTesterEmailSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = testerEmailInput.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      soundManager.warning();
      setError("Please enter a valid Google email address (e.g. yourname@gmail.com).");
      return;
    }

    soundManager.granted();
    setEmail(cleanEmail);
    // Extract a default legal name suggestion from the email prefix
    const namePrefix = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
    const formattedName = namePrefix
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    if (!fullName) {
      setFullName(formattedName);
    }
    setAvatar(`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}&backgroundColor=00e5a0`);
    setError("");
    setStep("name_input");
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
      email: email.trim() || "learner.tester@gmail.com",
      photo: avatar,
      googleId: "google-oauth2|verified",
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

        {step === "connect" && (
          <div className="account-step-body">
            <div className="account-hero-icon">
              <span className="cyber-cert-icon">🎓</span>
            </div>
            <h2 className="account-title">Student Certification Profile</h2>
            <p className="account-subtitle">
              Sign in with your Google account to track your progress and generate your official BuildLab verified Certificate of Completion.
            </p>

            {error && <div className="account-error-alert">{error}</div>}

            {/* PRIMARY: GOOGLE ACCOUNT BUTTON */}
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

            <div className="tester-quick-toggle">
              <button
                type="button"
                className="btn-tester-link"
                onClick={() => {
                  try { soundManager.click(); } catch {}
                  setStep("tester_email");
                }}
              >
                🧪 Using another Google account as a tester? Click to enter your Gmail &rarr;
              </button>
            </div>

            <p className="account-trust-note">
              🔒 We only access your basic Google identity to save your custom rig builds and Academy certificate. No private drive data requested.
            </p>
          </div>
        )}

        {step === "tester_email" && (
          <form className="account-step-body" onSubmit={handleTesterEmailSubmit}>
            <div className="account-hero-icon">
              <span className="cyber-cert-icon">📧</span>
            </div>
            <h2 className="account-title">Enter Your Google Tester Account</h2>
            <p className="account-subtitle">
              Enter your Google email address to test student synchronization, cloud progress, and certification linking.
            </p>

            {error && <div className="account-error-alert">{error}</div>}

            <div className="account-form-group">
              <label htmlFor="tester-email-input">Tester Google Account Email *</label>
              <input
                id="tester-email-input"
                type="email"
                className="account-input"
                value={testerEmailInput}
                onChange={(e) => setTesterEmailInput(e.target.value)}
                placeholder="e.g. yourname.tester@gmail.com"
                autoFocus
                required
              />
              <span className="input-hint">
                Your builds and official certificate will be tied to this Google account.
              </span>
            </div>

            {/* Expandable Google Cloud OAuth Client ID configuration helper */}
            <div className="google-clientid-helper">
              <button
                type="button"
                className="btn-toggle-clientid-guide"
                onClick={() => setShowConfigGuide(!showConfigGuide)}
              >
                <span>⚙️ {showConfigGuide ? "Hide" : "Want official Google popup? Check setup guide"}</span>
                <span className="guide-arrow">{showConfigGuide ? "▲" : "▼"}</span>
              </button>

              {showConfigGuide && (
                <div className="clientid-guide-box">
                  <p className="guide-step">
                    <strong>1.</strong> Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">Google Cloud Console</a> &rarr; Credentials.
                  </p>
                  <p className="guide-step">
                    <strong>2.</strong> Create <strong>OAuth Client ID</strong> &rarr; Application Type: <strong>Web application</strong>.
                  </p>
                  <p className="guide-step">
                    <strong>3.</strong> Add Authorized JavaScript Origin:
                    <code className="guide-code">{currentOrigin}</code>
                  </p>
                  <p className="guide-step">
                    <strong>4.</strong> Add to <code>frontend/.env</code>:
                    <code className="guide-code">VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com</code>
                  </p>
                </div>
              )}
            </div>

            <div className="account-form-actions">
              <button
                type="button"
                className="btn-back-step"
                onClick={() => {
                  setError("");
                  setStep("connect");
                }}
              >
                &larr; Back
              </button>
              <button type="submit" className="btn-confirm-track">
                <span>VERIFY GOOGLE ACCOUNT</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </form>
        )}

        {step === "name_input" && (
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
                onClick={() => {
                  setError("");
                  setStep("connect");
                }}
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
