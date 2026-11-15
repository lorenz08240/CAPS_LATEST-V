import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import soundManager from "../../utilities/soundManager";
import { enterFullscreen, isFullscreenActive } from "../../utilities/fullscreen";
import AccountSetupModal from "../Home/AccountSetupModal";
import "./SettingsPage.css";

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
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'account' | 'appearance' | 'audio' | 'language' | 'stages'

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
  const handleConfirmResetStages = () => {
    try { soundManager.warning(); } catch {}
    resetLearnProgress();
    setShowResetConfirm(false);
    showToast("Learning stage progression reset to Stage 1.", "warning");
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
              <span className={`meta-pill ${mode === "learn" ? "learn" : "explore"}`}>
                {mode === "learn" ? "LEARN MODE" : "OPEN LAB"}
              </span>
              <span className="meta-pill lang">
                {language === "tl" ? "FILIPINO (TL)" : "ENGLISH (EN)"}
              </span>
              <span className="meta-pill theme">
                {isDark ? "DARK" : "LIGHT"}
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
              <p className="settings-subtitle">
                Customize your BuildLab environment, learner credentials, regional language, and audio-visual settings.
              </p>
            </div>
          </div>

          {/* Quick Filter Navigation Pills */}
          <div className="settings-nav-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Settings
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "account" ? "active" : ""}`}
              onClick={() => setActiveTab("account")}
            >
              Account
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "language" ? "active" : ""}`}
              onClick={() => setActiveTab("language")}
            >
              Language
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => setActiveTab("appearance")}
            >
              Appearance
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "audio" ? "active" : ""}`}
              onClick={() => setActiveTab("audio")}
            >
              Audio
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "stages" ? "active" : ""}`}
              onClick={() => setActiveTab("stages")}
            >
              Stages
            </button>
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

        {/* ── SECTION 1: ACCOUNT & LEARNER PROFILE ── */}
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
                <p className="card-desc">Your verified learner identity, credentials, and cloud database synchronization.</p>
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
          </section>
        )}

        {/* ── SECTION 2: LANGUAGE & LOCALIZATION ── */}
        {(activeTab === "all" || activeTab === "language") && (
          <section className="settings-card" id="language">
            <div className="card-header-row">
              <div className="card-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className="card-header-text">
                <h2 className="card-title">{t("language", "Language & Regional Localization")}</h2>
                <p className="card-desc">Select your preferred dialect for navigation labels, tutorial dialogues, and instructions.</p>
              </div>
            </div>

            <div className="language-selector-grid">
              <div
                className={`language-option-card ${language === "en" ? "active" : ""}`}
                onClick={() => {
                  setLanguage("en");
                  showToast("Language changed to English (US).", "success");
                }}
              >
                <div className="lang-flag">🇺🇸</div>
                <div className="lang-meta">
                  <span className="lang-name">English (US)</span>
                  <span className="lang-sub">Default Global Dialect</span>
                </div>
                <div className="lang-check">
                  {language === "en" ? "✓ Active" : "Select"}
                </div>
              </div>

              <div
                className={`language-option-card ${language === "tl" ? "active" : ""}`}
                onClick={() => {
                  setLanguage("tl");
                  showToast("Pinalitan ang wika sa Filipino (Tagalog).", "success");
                }}
              >
                <div className="lang-flag">🇵🇭</div>
                <div className="lang-meta">
                  <span className="lang-name">Filipino (Tagalog)</span>
                  <span className="lang-sub">Pateros Technological College Edition</span>
                </div>
                <div className="lang-check">
                  {language === "tl" ? "✓ Active" : "Select"}
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
                <p className="card-desc">Select your high-contrast aesthetic and visual rendering mode.</p>
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
                  <span className="theme-title">🌙 Cyber Obsidian (Dark)</span>
                  <span className="theme-subtitle">Neon accent lines with reduced eye-strain</span>
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
                  <span className="theme-title">☀️ Clean Lab (Light)</span>
                  <span className="theme-subtitle">High daylight contrast for classroom projectors</span>
                </div>
                {!isDark && <span className="theme-active-tag">Active</span>}
              </div>
            </div>
          </section>
        )}

        {/* ── SECTION 4: AUDIO & SOUND EFFECTS ── */}
        {(activeTab === "all" || activeTab === "audio") && (
          <section className="settings-card" id="audio">
            <div className="card-header-row">
              <div className="card-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </div>
              <div className="card-header-text">
                <h2 className="card-title">{t("audio", "Audio & Sound Effects")}</h2>
                <p className="card-desc">Mechanical feedback, clicks, and assembly chimes generated by BuildLab's sound engine.</p>
              </div>
            </div>

            <div className="settings-setting-row">
              <div className="setting-info">
                <span className="setting-label">Master Sound Effects</span>
                <span className="setting-sublabel">Enable tactile clicks and diagnostic chimes during part installation</span>
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
                  🔊 Click
                </button>
                <button
                  type="button"
                  className="sound-test-btn"
                  onClick={() => testSound("snap")}
                >
                  ⚡ Magnetic Snap
                </button>
                <button
                  type="button"
                  className="sound-test-btn"
                  onClick={() => testSound("install")}
                >
                  🛠️ Slot Lock
                </button>
                <button
                  type="button"
                  className="sound-test-btn"
                  onClick={() => testSound("granted")}
                >
                  ✨ Success
                </button>
                <button
                  type="button"
                  className="sound-test-btn"
                  onClick={() => testSound("warning")}
                >
                  ⚠️ Warning
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
                <p className="card-desc">Check your unlocked curriculum modules or reset progression for a fresh test run.</p>
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
                <span className="reset-title">Reset Stage Progression</span>
                <span className="reset-desc">Lock advanced stages back to Stage 1 to re-test the learning path. Your Google profile stays connected.</span>
              </div>
              <button
                type="button"
                className="settings-action-btn warning"
                onClick={() => setShowResetConfirm(true)}
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
            <div className="dialog-actions">
              <button
                type="button"
                className="dialog-btn cancel"
                onClick={() => setShowResetConfirm(false)}
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                type="button"
                className="dialog-btn confirm-warning"
                onClick={handleConfirmResetStages}
              >
                Yes, Reset Stages
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
