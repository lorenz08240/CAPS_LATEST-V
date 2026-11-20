import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import soundManager from "../../utilities/soundManager";
import { enterFullscreen, exitFullscreen, isFullscreenActive } from "../../utilities/fullscreen";
import AccountSetupModal from "../Home/AccountSetupModal";
import "./SettingsPage.css";

const TABS = [
  {
    id: "general",
    label: "General",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: "account",
    label: "Account",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    id: "audio",
    label: "Audio",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
  },
  {
    id: "stages",
    label: "Stages",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    id: "all",
    label: "All Settings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

const DASHBOARD_STAGES = [
  { key: "build", label: "2D PC Builder", short: "Build" },
  { key: "compatibility", label: "Compatibility Matrix", short: "Matrix" },
  { key: "learn", label: "Hardware Academy", short: "Academy" },
  { key: "certificate", label: "Official Certification", short: "Cert" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    userProfile,
    setUserProfile,
    mode,
    setAppMode,
    unlockedStages,
    resetLearnProgress,
    logoutLearner,
  } = useLearnMode();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.enabled);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [resetPin, setResetPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinBusy, setPinBusy] = useState(false);

  const unlockedCount = DASHBOARD_STAGES.filter((stage) => unlockedStages.includes(stage.key)).length;
  const progressPercent = Math.round((unlockedCount / DASHBOARD_STAGES.length) * 100);

  // Phone-inspired default tab: 'general'
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const param = new URLSearchParams(window.location.search).get("tab");
      if (param && ["general", "account", "appearance", "audio", "stages", "all"].includes(param.toLowerCase())) {
        return param.toLowerCase();
      }
    } catch {}
    return "general";
  });

  // Track Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(() => {
    try {
      return isFullscreenActive();
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleFsChange = () => {
      try {
        setIsFullscreen(isFullscreenActive());
      } catch {}
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    document.addEventListener("mozfullscreenchange", handleFsChange);
    document.addEventListener("MSFullscreenChange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      document.removeEventListener("mozfullscreenchange", handleFsChange);
      document.removeEventListener("MSFullscreenChange", handleFsChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      soundManager.click();
      if (isFullscreenActive()) {
        exitFullscreen();
        setIsFullscreen(false);
        showToast("Exited fullscreen mode.", "info");
      } else {
        const ok = await enterFullscreen();
        setIsFullscreen(ok || isFullscreenActive());
        if (ok || isFullscreenActive()) {
          showToast("Entered fullscreen mode.", "success");
        }
      }
    } catch {
      showToast("Fullscreen immersion mode toggled.", "info");
    }
  };

  const handleClearCache = () => {
    try {
      soundManager.click();
      sessionStorage.clear();
      showToast("Interface session cache cleared successfully.", "success");
    } catch {
      showToast("Session cache cleared.", "info");
    }
  };

  const showToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    try {
      if (type === "success") soundManager.granted();
      else if (type === "warning") soundManager.warning();
      else soundManager.click();
    } catch {}
    setTimeout(() => setToastMessage(null), 3800);
  };

  useEffect(() => {
    try {
      if (sessionStorage.getItem("buildlab_pin_notice") === "1") {
        sessionStorage.removeItem("buildlab_pin_notice");
        showToast("Security PIN sent to your email.", "info");
      }
    } catch {}
  }, []);

  // Google Cloud Re-Sync
  const handleSyncCloud = async () => {
    if (!userProfile?.setupCompleted && !userProfile?.email) {
      setShowAccountModal(true);
      return;
    }

    try {
      setIsSyncing(true);
      try { soundManager.click(); } catch {}

      const res = await fetch("/api/learn/sync-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: userProfile.googleId || "google-oauth2|verified",
          email: userProfile.email || "learner.tester@gmail.com",
          fullName: userProfile.fullName || "Learner",
          photo: userProfile.photo || "",
          institution: userProfile.institution || "Pateros Technological College",
          unlockedStages: unlockedStages || ["build"],
        }),
      });

      if (res.ok) {
        showToast(t("syncSuccess", "Learner profile synced with cloud database."), "success");
      } else {
        showToast("Sync completed locally.", "info");
      }
    } catch (err) {
      showToast("Sync completed with local cache.", "info");
    } finally {
      setIsSyncing(false);
    }
  };

  // Audio Toggle
  const handleToggleAudio = () => {
    const next = soundManager.toggleSound();
    setSoundEnabled(next);
    showToast(next ? "System audio enabled." : "System audio muted.", "info");
  };

  // Sound Test buttons
  const testSound = (actionName) => {
    try {
      if (actionName === "click") soundManager.click();
      else if (actionName === "granted") soundManager.granted();
      else if (actionName === "warning") soundManager.warning();
      else if (actionName === "snap") soundManager.snap();
      else if (actionName === "install") soundManager.install();
    } catch {}
  };

  // Log Out Handler
  const handleConfirmLogout = () => {
    try { soundManager.click(); } catch {}
    logoutLearner();
    setShowLogoutConfirm(false);
    showToast(t("logoutSuccess", "Logged out successfully."), "success");
  };

  // Reset Stages Handler
  const handleConfirmResetStages = async () => {
    if (!/^\d{6}$/.test(resetPin)) {
      setPinError("Enter the 6-digit PIN emailed to you.");
      return;
    }
    try {
      setPinBusy(true);
      setPinError("");
      const res = await fetch("/api/learn/reset-stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: userProfile?.googleId || "google-oauth2|verified",
          email: userProfile?.email,
          pin: resetPin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPinError(data.error || "Incorrect PIN.");
        try { soundManager.warning(); } catch {}
        return;
      }
      try { soundManager.warning(); } catch {}
      resetLearnProgress();
      setShowResetConfirm(false);
      setResetPin("");
      showToast("Learning stage progression reset to Stage 1.", "warning");
    } catch {
      setPinError("Could not verify PIN. Try again.");
    } finally {
      setPinBusy(false);
    }
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-container">
        {/* Breadcrumb & Navigation Header */}
        <header className="settings-header">
          <div className="settings-header-top">
            <button
              type="button"
              className="settings-back-btn"
              onClick={() => {
                try { soundManager.click(); } catch {}
                navigate(-1);
              }}
              title={t("back", "Back")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>{t("back", "Back")}</span>
            </button>

            <div className="settings-meta-tags">
              <span className="meta-pill lang">
                {language === "tl" ? "FILIPINO (TL)" : "ENGLISH (EN)"}
              </span>
              <span className="meta-pill theme">
                {isDark ? "DARK MODE" : "LIGHT MODE"}
              </span>
            </div>
          </div>

          <div className="settings-title-block">
            <div className="settings-icon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h1 className="settings-main-title">{t("systemSettings", "System Settings & Preferences")}</h1>
            </div>
          </div>

          {/* Quick Filter Navigation Pills (Phone-style Segmented Control) */}
          <div className="settings-nav-tabs" role="tablist" aria-label="Settings categories">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => {
                  try { soundManager.click(); } catch {}
                  setActiveTab(tab.id);
                }}
              >
                <span className="tab-btn-icon" aria-hidden="true">{tab.icon}</span>
                <span className="tab-btn-text">{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Live In-Page Toast Notification */}
        {toastMessage && (
          <div className={`settings-toast ${toastType}`}>
            <span className="toast-dot" />
            <span className="toast-text">{toastMessage}</span>
            <button
              type="button"
              className="toast-dismiss"
              onClick={() => setToastMessage(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* ── SECTION 1: GENERAL SYSTEM PREFERENCES (Phone-style Primary Category) ── */}
        {(activeTab === "all" || activeTab === "general" || activeTab === "language") && (
          <section className="settings-card" id="general">
            <div className="card-header-row">
              <div className="card-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <div className="card-header-text">
                <h2 className="card-title">General Preferences & System</h2>
              </div>
            </div>

            {/* Sub-item: Language & Localization */}
            <div className="general-subgroup">
              <div className="general-subgroup-header">
                <span className="general-subgroup-title">{t("language", "Language & Regional Localization")}</span>
                <span className="general-subgroup-desc">Select primary display language for lesson modules, interface labels, and evaluations</span>
              </div>
              <div className="language-selector-grid">
                <div
                  className={`language-option-card ${language === "en" ? "active" : ""}`}
                  onClick={() => {
                    setLanguage("en");
                    showToast("Language changed to English (US).", "success");
                  }}
                >
                  <div className="lang-flag-badge">EN</div>
                  <div className="lang-meta">
                    <span className="lang-name">English (US)</span>
                  </div>
                  <div className="lang-check">
                    {language === "en" ? "✓ Active" : "Select"}
                  </div>
                </div>

                <div
                  className={`language-option-card locked ${language === "tl" ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-disabled="true"
                  title="Coming Soon — Filipino (Tagalog) is not available yet"
                  onClick={() => showToast("Filipino (Tagalog) is coming soon.", "warning")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      showToast("Filipino (Tagalog) is coming soon.", "warning");
                    }
                  }}
                >
                  <div className="lang-flag-badge">FIL</div>
                  <div className="lang-meta">
                    <span className="lang-name">Filipino (Tagalog)</span>
                  </div>
                  <div className="lang-check lang-check-locked">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-item: Fullscreen Immersion Mode */}
            <div className="settings-setting-row" style={{ marginTop: "1.25rem" }}>
              <div className="setting-info">
                <span className="setting-label">Fullscreen Lab Immersion</span>
                <span className="setting-sublabel">Expand workspace to edge-to-edge fullscreen for distraction-free lab work</span>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${isFullscreen ? "on" : "off"}`}
                onClick={handleToggleFullscreen}
              >
                <span className="toggle-slider" />
                <span className="toggle-label">{isFullscreen ? "ENABLED" : "WINDOWED"}</span>
              </button>
            </div>

            {/* Sub-item: Platform Standards & Institutional Alignment */}
            <div className="settings-specs-box">
              <div className="specs-header-row">
                <span className="specs-section-label">System Platform & Aligned Standards</span>
              </div>
              <div className="specs-items-grid">
                <div className="spec-item">
                  <span className="spec-label">Environment</span>
                  <span className="spec-value">BuildLab Studio v2.4</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Curriculum</span>
                  <span className="spec-value">DepEd Grade 11 CSS / TESDA NC II</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Quality Standard</span>
                  <span className="spec-value">ISO/IEC 25010 Evaluated</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Host Institution</span>
                  <span className="spec-value">PTC-IICT Academic Center</span>
                </div>
              </div>
            </div>

            {/* Sub-item: Clear Local Interface Cache */}
            <div className="reset-progress-action-row" style={{ marginTop: "1rem" }}>
              <div className="reset-info-text">
                <span className="reset-title">Interface State & Session Cache</span>
                <span className="reset-desc">Reset temporary local session state and cached view models without altering your account credentials.</span>
              </div>
              <button
                type="button"
                className="settings-action-btn secondary btn-clear-cache"
                onClick={handleClearCache}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Clear Local Cache</span>
              </button>
            </div>
          </section>
        )}

        {/* ── SECTION 2: ACCOUNT & LEARNER PROFILE ── */}
        {(activeTab === "all" || activeTab === "account") && (
          <section className="settings-card" id="account">
            <div className="card-header-row">
              <div className="card-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="card-header-text">
                <h2 className="card-title">{t("accountPreferences", "Learner Account & Identity")}</h2>
              </div>
            </div>

            <div className="account-details-grid">
              <div className="account-profile-box">
                <div className="account-avatar-large">
                  {userProfile?.photo ? (
                    <img src={userProfile.photo} alt={userProfile.fullName || "User"} />
                  ) : (
                    <div className="avatar-fallback">
                      {(userProfile?.fullName || "L").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`status-badge-dot ${userProfile?.setupCompleted ? "online" : "offline"}`} />
                </div>

                <div className="account-profile-meta">
                  <div className="profile-name-row">
                    <h3 className="profile-fullname">
                      {userProfile?.fullName || "Guest Learner"}
                    </h3>
                    <span className="profile-badge">
                      {userProfile?.setupCompleted ? t("verifiedProfile", "Verified") : t("guestMode", "Guest")}
                    </span>
                  </div>
                  <p className="profile-email">{userProfile?.email || "No email connected"}</p>
                  <p className="profile-institution">
                    {userProfile?.institution || "Pateros Technological College (PTC-IICT)"}
                  </p>
                </div>
              </div>

              <div className="account-actions-column">
                <button
                  type="button"
                  className="settings-action-btn primary"
                  onClick={() => {
                    try { soundManager.click(); } catch {}
                    setShowAccountModal(true);
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>{userProfile?.setupCompleted ? "Edit Profile & Re-link" : "Connect Google Account"}</span>
                </button>

                <button
                  type="button"
                  className="settings-action-btn secondary"
                  disabled={isSyncing}
                  onClick={handleSyncCloud}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>{isSyncing ? "Syncing Cloud..." : t("googleSync", "Sync with Google Cloud")}</span>
                </button>

                {userProfile?.setupCompleted && (
                  <button
                    type="button"
                    className="settings-action-btn danger"
                    onClick={() => setShowLogoutConfirm(true)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>{t("logout", "Log Out")}</span>
                  </button>
                )}
              </div>
            </div>

            <div className={`account-dashboard ${dashboardOpen ? "open" : ""}`}>
              <button
                type="button"
                className="account-dashboard-toggle"
                onClick={() => {
                  try { soundManager.click(); } catch {}
                  setDashboardOpen((prev) => !prev);
                }}
                aria-expanded={dashboardOpen}
              >
                <span className="dashboard-toggle-label">Dashboard</span>
                <span className="dashboard-toggle-score">{unlockedCount}/{DASHBOARD_STAGES.length}</span>
                <svg className="dashboard-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div className="account-dashboard-body">
                <div className="dashboard-body-inner">
                  <div className="dashboard-ring" style={{ "--progress": `${progressPercent}%` }}>
                    <span className="dashboard-ring-core">{progressPercent}%</span>
                  </div>
                  <div className="dashboard-stage-row">
                    {DASHBOARD_STAGES.map((stage, index) => (
                      <div
                        className={`dashboard-stage ${unlockedStages.includes(stage.key) ? "done" : ""}`}
                        key={stage.key}
                        title={stage.label}
                      >
                        <span className="dashboard-stage-circle">{index + 1}</span>
                        <span className="dashboard-stage-label">{stage.short}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SECTION 3: THEME & DISPLAY ── */}
        {(activeTab === "all" || activeTab === "appearance") && (
          <section className="settings-card" id="appearance">
            <div className="card-header-row">
              <div className="card-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </div>
              <div className="card-header-text">
                <h2 className="card-title">{t("theme", "Theme & Visual Appearance")}</h2>
              </div>
            </div>

            <div className="theme-selection-grid">
              <div
                className={`theme-card dark ${isDark ? "selected" : ""}`}
                onClick={() => {
                  if (!isDark) toggleTheme();
                  showToast("Switched to Cyber Dark Mode.", "success");
                }}
              >
                <div className="theme-preview-box dark">
                  <div className="preview-nav-bar" />
                  <div className="preview-content-grid">
                    <span className="preview-block highlight" />
                    <span className="preview-block" />
                  </div>
                </div>
                <div className="theme-card-info">
                  <div className="theme-title-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    <span className="theme-title">Cyber Obsidian (Dark)</span>
                  </div>
                </div>
                {isDark && <span className="theme-active-tag">Active</span>}
              </div>

              <div
                className={`theme-card light ${!isDark ? "selected" : ""}`}
                onClick={() => {
                  if (isDark) toggleTheme();
                  showToast("Switched to Clean Lab Mode.", "success");
                }}
              >
                <div className="theme-preview-box light">
                  <div className="preview-nav-bar" />
                  <div className="preview-content-grid">
                    <span className="preview-block highlight" />
                    <span className="preview-block" />
                  </div>
                </div>
                <div className="theme-card-info">
                  <div className="theme-title-row">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    <span className="theme-title">Clean Lab (Light)</span>
                  </div>
                </div>
                {!isDark && <span className="theme-active-tag">Active</span>}
              </div>
            </div>
          </section>
        )}

        {/* ── SECTION 4: AUDIO & SOUND EFFECTS ── */}
        {(activeTab === "all" || activeTab === "audio") && (
          <section className="settings-card audio-settings-card" id="audio">
            <div className="card-header-row">
              <div className="card-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </div>
              <div className="card-header-text">
                <h2 className="card-title">{t("audio", "Audio & Sound Effects")}</h2>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${soundEnabled ? "on" : "off"}`}
                onClick={handleToggleAudio}
              >
                <span className="toggle-slider" />
                <span className="toggle-label">{soundEnabled ? "ENABLED" : "MUTED"}</span>
              </button>
            </div>

            <div className="audio-test-panel">
              <span className="test-panel-title">Audio Feedback Previews:</span>
              <div className="audio-test-buttons">
                <button
                  type="button"
                  className="sound-test-btn"
                  onClick={() => testSound("click")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  <span>Click</span>
                </button>
                <button
                  type="button"
                  className="sound-test-btn"
                  onClick={() => testSound("snap")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>Magnetic Snap</span>
                </button>
                <button
                  type="button"
                  className="sound-test-btn"
                  onClick={() => testSound("install")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Slot Lock</span>
                </button>
                <button
                  type="button"
                  className="sound-test-btn"
                  onClick={() => testSound("granted")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Success Chime</span>
                </button>
                <button
                  type="button"
                  className="sound-test-btn"
                  onClick={() => testSound("warning")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Warning Tone</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── SECTION 5: LEARNING PROGRESS & STAGES ── */}
        {(activeTab === "all" || activeTab === "stages") && (
          <section className="settings-card" id="stages">
            <div className="card-header-row">
              <div className="card-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="card-header-text">
                <h2 className="card-title">Learning Progression & Stage Access</h2>
              </div>
            </div>

            <div className="stage-status-grid">
              <div className="stage-status-box unlocked">
                <div className="stage-status-num">01</div>
                <div className="stage-status-info">
                  <span className="stage-name">2D PC Builder</span>
                  <span className="stage-status-tag">Unlocked (Core)</span>
                </div>
              </div>

              <div className={`stage-status-box ${unlockedStages.includes("compatibility") ? "unlocked" : "locked"}`}>
                <div className="stage-status-num">02</div>
                <div className="stage-status-info">
                  <span className="stage-name">{t("compatibility", "Compatibility Matrix")}</span>
                  <span className="stage-status-tag">
                    {unlockedStages.includes("compatibility") ? "Unlocked" : "Locked (Complete Stage 1)"}
                  </span>
                </div>
              </div>

              <div className={`stage-status-box ${unlockedStages.includes("learn") ? "unlocked" : "locked"}`}>
                <div className="stage-status-num">03</div>
                <div className="stage-status-info">
                  <span className="stage-name">{t("hardwareAcademy", "Hardware Academy")}</span>
                  <span className="stage-status-tag">
                    {unlockedStages.includes("learn") ? "Unlocked" : "Locked (Verify in Matrix)"}
                  </span>
                </div>
              </div>

              <div className={`stage-status-box ${unlockedStages.includes("certificate") ? "unlocked" : "locked"}`}>
                <div className="stage-status-num">04</div>
                <div className="stage-status-info">
                  <span className="stage-name">{t("officialCert", "Official Certification")}</span>
                  <span className="stage-status-tag">
                    {unlockedStages.includes("certificate") ? "Unlocked" : "Locked (Finish Academy)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="reset-progress-action-row">
              <div className="reset-info-text">
                <span className="reset-title danger">Reset Stage Progression</span>
              </div>
              <button
                type="button"
                className="settings-action-btn warning"
                onClick={() => {
                  setResetPin("");
                  setPinError("");
                  setShowResetConfirm(true);
                }}
              >
                Reset Stages
              </button>
            </div>
          </section>
        )}
      </div>

      {/* ── MODALS ── */}

      {/* Account Setup Modal (Google OAuth & Edit) */}
      <AccountSetupModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onConfirmed={(newMode, profile) => {
          setShowAccountModal(false);
          showToast("Profile credentials updated successfully.", "success");
        }}
      />

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="settings-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="settings-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <span className="dialog-badge danger">LOG OUT</span>
              <h3 className="dialog-title">{t("logoutConfirm", "Are you sure you want to log out?")}</h3>
            </div>
            <p className="dialog-body">
              Logging out will clear your active learner session on this device. You will revert to Open Lab mode. Your stage progress saved in Google Cloud can be re-synced at any time by connecting your Google account.
            </p>
            <div className="dialog-actions">
              <button
                type="button"
                className="dialog-btn cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                type="button"
                className="dialog-btn confirm-danger"
                onClick={handleConfirmLogout}
              >
                {t("logout", "Log Out")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Progress Confirmation Dialog */}
      {showResetConfirm && (
        <div className="settings-modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="settings-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <span className="dialog-badge warning">PROGRESS RESET</span>
              <h3 className="dialog-title">Reset Learn Progression?</h3>
            </div>
            <p className="dialog-body">
              This will reset stages 2 through 4 (Compatibility, Academy, and Certification) back to locked status. You will need to build your PC again to unlock them.
            </p>
            <div className="pin-confirm-field">
              <label className="pin-confirm-label" htmlFor="reset-pin">Security PIN</label>
              <input
                id="reset-pin"
                className="pin-confirm-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={resetPin}
                onChange={(e) => setResetPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={pinBusy}
              />
              <span className="pin-confirm-hint">Emailed on first sign-in.</span>
              {pinError && <span className="pin-confirm-error">{pinError}</span>}
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="dialog-btn cancel"
                onClick={() => setShowResetConfirm(false)}
                disabled={pinBusy}
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                type="button"
                className="dialog-btn confirm-warning"
                onClick={handleConfirmResetStages}
                disabled={pinBusy || resetPin.length !== 6}
              >
                {pinBusy ? "Verifying..." : "Yes, Reset Stages"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
