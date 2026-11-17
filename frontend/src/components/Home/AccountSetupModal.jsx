import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { enterFullscreen, isFullscreenActive, markFullscreenEngaged } from "../../utilities/fullscreen";
import soundManager from "../../utilities/soundManager";
import "./AccountSetupModal.css";

const STRAND_OPTIONS = [
  "Grade 11 TVL - Computer Systems Servicing (CSS)",
  "Grade 12 TVL - Information & Communications Tech (ICT)",
  "BS Information Technology (PTC-IICT)",
  "BS Computer Science / Computer Engineering",
  "General PC Builder & Tech Enthusiast",
];

const INTEREST_OPTIONS = [
  { id: "assembly_safety", label: "Desktop PC Assembly & Lab Safety", icon: "⚡" },
  { id: "sockets_keying", label: "Component Keying & Sockets", icon: "🧩" },
  { id: "psu_cables", label: "PSU Wattage & Keyed Cables", icon: "🔌" },
  { id: "cooling_airflow", label: "Airflow Physics & Cooling", icon: "❄️" },
  { id: "post_debug", label: "POST Troubleshooting & LEDs", icon: "🛠️" },
  { id: "gaming_esports", label: "High-FPS Esports & Gaming Builds", icon: "🎮" },
];

const EXPERIENCE_OPTIONS = [
  "Beginner (First time touching bare PC hardware)",
  "Novice (Familiar with parts, practicing assembly)",
  "Intermediate (Built a PC before, mastering standards)",
];

export default function AccountSetupModal({ isOpen, onClose, onConfirmed }) {
  const { userProfile, setUserProfile, setAppMode, unlockStage, restoreStudentAccount } = useLearnMode();

  const [step, setStep] = useState("connect"); // 'connect' | 'tester_email' | 'name_input' | 'about_you'
  const [fullName, setFullName] = useState(userProfile.fullName || "");
  const [email, setEmail] = useState(userProfile.email || "");
  const [avatar, setAvatar] = useState(
    userProfile.photo ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces"
  );
  const [strand, setStrand] = useState(
    userProfile.strand || "Grade 11 TVL - Computer Systems Servicing (CSS)"
  );
  const [interests, setInterests] = useState(
    userProfile.interests && userProfile.interests.length > 0
      ? userProfile.interests
      : ["Desktop PC Assembly & Lab Safety", "Component Keying & Sockets"]
  );
  const [experienceLevel, setExperienceLevel] = useState(
    userProfile.experienceLevel || "Beginner (First time touching bare PC hardware)"
  );

  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState("");
  const [testerEmailInput, setTesterEmailInput] = useState("");
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Reset the entry point each time the modal opens so a completed profile is
  // never dragged back through the name and interests questions.
  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setStep(
      userProfile?.setupCompleted && (userProfile.fullName || userProfile.email)
        ? "profile_ready"
        : "connect"
    );
  }, [isOpen]);

  // Browsers only grant fullscreen during a user gesture, so fire it immediately
  // from the sign-in action instead of after async profile work.
  const engageFullscreen = () => {
    try {
      sessionStorage.removeItem("buildlab_windowed_mode");
      if (isFullscreenActive()) return;
      const request = enterFullscreen();
      if (request && typeof request.then === "function") {
        request
          .then((ok) => {
            if (ok) markFullscreenEngaged();
            else sessionStorage.removeItem("buildlab_pending_learner_welcome");
          })
          .catch(() => {
            sessionStorage.removeItem("buildlab_pending_learner_welcome");
          });
      }
    } catch {
      sessionStorage.removeItem("buildlab_pending_learner_welcome");
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

  if (!isOpen) return null;

  const toggleInterest = (label) => {
    try { soundManager.snap(); } catch {}
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  // Google Sign-In linking
  const handleGoogleSignIn = async () => {
    try { soundManager.click(); } catch {}
    setError("");
    setIsLinking(true);

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
                const targetEmail = data.email || "learner.tester@gmail.com";
                setEmail(targetEmail);
                if (data.name) setFullName(data.name);
                const candidateAvatar = data.picture ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || targetEmail)}`;
                setAvatar(candidateAvatar);

                // Auto-restore returning student's account, build, and progress!
                if (restoreStudentAccount) {
                  const restored = restoreStudentAccount(targetEmail, {
                    fullName: data.name || undefined,
                    photo: candidateAvatar,
                  });
                  if (restored) {
                    try { soundManager.granted(); } catch {}
                    engageFullscreen();
                    setIsLinking(false);
                    if (onConfirmed) {
                      onConfirmed("learn", restored);
                    } else {
                      onClose();
                    }
                    return;
                  }
                }

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
      try { soundManager.warning(); } catch {}
      setError("Please enter a valid Google email address (e.g. yourname@gmail.com).");
      return;
    }

    // Auto-restore returning student's account, build, and progress!
    if (restoreStudentAccount) {
      const restored = restoreStudentAccount(cleanEmail);
      if (restored) {
        try { soundManager.granted(); } catch {}
        engageFullscreen();
        if (onConfirmed) {
          onConfirmed("learn", restored);
        } else {
          onClose();
        }
        return;
      }
    }

    try { soundManager.granted(); } catch {}
    setEmail(cleanEmail);
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
      try { soundManager.warning(); } catch {}
      setError("Please enter your name as it will appear on your verified certificate.");
      return;
    }

    try { soundManager.granted(); } catch {}
    setError("");
    setStep("about_you");
  };

  const handleFinalProfileSubmit = (e) => {
    e.preventDefault();
    if (interests.length === 0) {
      try { soundManager.warning(); } catch {}
      setError("Please select at least one primary hardware interest.");
      return;
    }

    try { soundManager.granted(); } catch {}
    engageFullscreen();
    const finalProfile = {
      fullName: fullName.trim(),
      email: email.trim() || "learner.tester@gmail.com",
      photo: avatar,
      googleId: "google-oauth2|verified",
      strand,
      interests,
      experienceLevel,
      setupCompleted: true,
      joinedDate: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    setUserProfile(finalProfile);
    setAppMode("learn");
    unlockStage("build");
    unlockStage("compatibility");
    unlockStage("learn");
    unlockStage("studio");

    // Save complete student identity to localStorage.user so all app parts recognize them immediately
    try {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "student_" + Date.now(),
          fullName: finalProfile.fullName,
          name: finalProfile.fullName,
          email: finalProfile.email,
          photo: finalProfile.photo,
          accountType: "student",
          schoolYear: strand.includes("Grade 12") ? "Grade 12" : strand.includes("BS") ? "College" : "Grade 11",
          strand: finalProfile.strand,
          interests: finalProfile.interests,
          experienceLevel: finalProfile.experienceLevel,
        })
      );
      localStorage.setItem("buildlab_app_mode", "learn");
      localStorage.setItem("buildlab_user_profile", JSON.stringify(finalProfile));
      localStorage.setItem("buildlab_last_learner_email", finalProfile.email.toLowerCase().trim());
      const emailKey = finalProfile.email.toLowerCase().trim();
      localStorage.setItem(`buildlab_student_profile_${emailKey}`, JSON.stringify(finalProfile));
      localStorage.setItem(`buildlab_student_stages_${emailKey}`, JSON.stringify(["build", "compatibility", "learn", "studio", "certificate"]));
      sessionStorage.setItem("buildlab_pending_learner_welcome", finalProfile.fullName);
    } catch {}

    // Sync to backend Google Learner Directory
    try {
      fetch("/api/learn/sync-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: finalProfile.googleId,
          email: finalProfile.email,
          fullName: finalProfile.fullName,
          photo: finalProfile.photo,
          institution: "Pateros Technological College",
          strand: finalProfile.strand,
          interests: finalProfile.interests,
          unlockedStages: ["build", "compatibility", "learn", "studio", "certificate"],
        }),
      }).catch(() => {});
    } catch {}

    if (onConfirmed) {
      onConfirmed("learn", finalProfile);
    } else {
      onClose();
    }
  };

  return (
    <div className="account-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="account-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="account-modal-header">
          <div className="account-step-tag">
            <span className="step-badge">
              {step === "profile_ready" && "[ SAVED ]"}
              {step === "connect" && "[ 01 / 03 ]"}
              {step === "tester_email" && "[ 01 / 03 ]"}
              {step === "name_input" && "[ 02 / 03 ]"}
              {step === "about_you" && "[ 03 / 03 ]"}
            </span>
            <span className="step-title">
              {step === "profile_ready" && "ACCOUNT READY"}
              {step === "connect" && "LEARN MODE // GOOGLE AUTH"}
              {step === "tester_email" && "LEARN MODE // TESTER EMAIL"}
              {step === "name_input" && "STUDENT CERTIFICATION NAME"}
              {step === "about_you" && "TELL US ABOUT YOU // INTERESTS"}
            </span>
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

        {/* RETURNING USER: profile already saved, skip the onboarding questions */}
        {step === "profile_ready" && (
          <div className="account-step-body">
            <div className="verified-google-badge">
              <img src={avatar} alt="Avatar" className="verified-avatar" />
              <div className="verified-text">
                <span className="verified-pill">✓ Google Account Linked</span>
                <span className="verified-email">{userProfile.email}</span>
              </div>
            </div>

            <h3 className="details-heading">Welcome back, {userProfile.fullName || fullName || "Builder"}</h3>
            <p className="details-sub">
              Your student profile is saved. You will not be asked to enter your name or interests again.
            </p>

            <div className="account-form-actions">
              <button
                type="button"
                className="btn-back-step"
                onClick={() => setStep("about_you")}
              >
                Edit interests
              </button>
              <button
                type="button"
                className="btn-confirm-track"
                onClick={() => {
                  if (onConfirmed) onConfirmed("learn", userProfile);
                  else onClose();
                }}
              >
                <span>CONTINUE TO ACADEMY →</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: CONNECT GOOGLE ACCOUNT */}
        {step === "connect" && (
          <div className="account-step-body">
            <div className="account-hero-icon">
              <span className="cyber-cert-icon">🎓</span>
            </div>
            <h2 className="account-title">Student Certification Profile</h2>
            <p className="account-subtitle">
              Sign in with Google to save your PC builds, track lesson progress, and earn an official PTC-IICT certificate.
            </p>

            {error && <div className="account-error-alert">{error}</div>}

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
                🧪 Enter tester email manually &rarr;
              </button>
            </div>

            <p className="account-trust-note">
              🔒 We only access your basic Google profile (name and email) to issue your certificate. No private drive data requested.
            </p>
            <div className="account-legal-links">
              <Link to="/privacy" onClick={onClose}>Privacy Policy</Link>
              <span>&middot;</span>
              <Link to="/terms" onClick={onClose}>Terms of Service</Link>
              <span>&middot;</span>
              <Link to="/cookies" onClick={onClose}>Cookie Policy</Link>
            </div>
          </div>
        )}

        {/* STEP 1B: TESTER EMAIL FALLBACK */}
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

        {/* STEP 2: LEGAL NAME FOR CERTIFICATE */}
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
              Enter your full legal name as you want it to appear on your verified Certificate of Completion:
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
                placeholder="e.g. Chloe Ramirez"
                autoFocus
                required
              />
              <span className="input-hint">
                E-Certificate will be officially issued to: <strong>{fullName || "Your Name"}</strong>
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
                <span>NEXT: TELL US ABOUT YOU</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: TELL US ABOUT YOU (INTERESTS & STRAND) */}
        {step === "about_you" && (
          <form className="account-step-body about-you-form" onSubmit={handleFinalProfileSubmit}>
            <div className="about-you-badge">
              <span className="about-you-sparkle">✨</span>
              <span>PERSONALIZED STUDENT PROFILE</span>
            </div>

            <h3 className="details-heading">Tell Us About You</h3>
            <p className="details-sub">
              Personalize your BuildLab experience. We'll tailor hardware challenges and curriculum tracks to match your learning interests.
            </p>

            {error && <div className="account-error-alert">{error}</div>}

            {/* 1. Academic Track / Strand */}
            <div className="account-form-group">
              <label htmlFor="strand-select">Academic Program / Strand *</label>
              <select
                id="strand-select"
                className="account-select"
                value={strand}
                onChange={(e) => setStrand(e.target.value)}
              >
                {STRAND_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="input-hint">
                Curriculum certification matches your institutional academic track.
              </span>
            </div>

            {/* 2. Primary Hardware Interests (Multi-select) */}
            <div className="account-form-group">
              <label>Primary Hardware Interests & Goals (Select all that apply) *</label>
              <div className="interests-grid">
                {INTEREST_OPTIONS.map((item) => {
                  const isChecked = interests.includes(item.label);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`interest-card-pill ${isChecked ? "is-selected" : ""}`}
                      onClick={() => toggleInterest(item.label)}
                    >
                      <span className="interest-icon">{item.icon}</span>
                      <span className="interest-label">{item.label}</span>
                      <span className="interest-checkbox">{isChecked ? "✓" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Hardware Experience Level */}
            <div className="account-form-group">
              <label htmlFor="exp-select">Hardware Assembly Experience Level</label>
              <select
                id="exp-select"
                className="account-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="account-form-actions">
              <button
                type="button"
                className="btn-back-step"
                onClick={() => {
                  setError("");
                  setStep("name_input");
                }}
              >
                &larr; Back
              </button>
              <button type="submit" className="btn-confirm-track btn-unlock-all">
                <span>COMPLETE &amp; UNLOCK ACADEMY 🎓</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
