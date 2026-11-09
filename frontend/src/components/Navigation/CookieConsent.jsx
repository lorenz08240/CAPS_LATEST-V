import React, { useState, useEffect } from "react";
import soundManager from "../../utilities/soundManager";
import "./CookieConsent.css";

export default function CookieConsent() {
  const [showNotice, setShowNotice] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Category Preferences state
  const [necessaryActive] = useState(true); // Locked ON
  const [analyticsActive, setAnalyticsActive] = useState(true);
  const [functionalityActive, setFunctionalityActive] = useState(true);

  // Sub-service toggles
  const [googleAnalyticsActive, setGoogleAnalyticsActive] = useState(true);
  const [telemetryActive, setTelemetryActive] = useState(true);
  const [audioPrefsActive, setAudioPrefsActive] = useState(true);

  // Accordion expansion states
  const [expandedSections, setExpandedSections] = useState({
    necessary: false,
    analytics: false,
    functionality: false,
  });

  const toggleSection = (sectionKey) => {
    try { soundManager.click(); } catch {}
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  useEffect(() => {
    try {
      const consent = localStorage.getItem("buildlab_cookie_consent");
      if (!consent) {
        const timer = setTimeout(() => setShowNotice(true), 1000);
        return () => clearTimeout(timer);
      } else {
        const prefs = JSON.parse(localStorage.getItem("buildlab_cookie_preferences") || "{}");
        if (prefs.analytics !== undefined) setAnalyticsActive(prefs.analytics);
        if (prefs.functionality !== undefined) setFunctionalityActive(prefs.functionality);
      }
    } catch {}
  }, []);

  const saveToStorage = (type, prefs) => {
    try {
      localStorage.setItem("buildlab_cookie_consent", type);
      localStorage.setItem("buildlab_cookie_preferences", JSON.stringify(prefs));
      localStorage.setItem("buildlab_cookie_consent_date", new Date().toISOString());
    } catch {}
  };

  const handleAcceptAll = () => {
    try { soundManager.granted(); } catch {}
    setAnalyticsActive(true);
    setFunctionalityActive(true);
    setGoogleAnalyticsActive(true);
    setTelemetryActive(true);
    setAudioPrefsActive(true);
    saveToStorage("all", {
      necessary: true,
      analytics: true,
      functionality: true,
    });
    setShowNotice(false);
    setShowPreferencesModal(false);
  };

  const handleRejectAll = () => {
    try { soundManager.click(); } catch {}
    setAnalyticsActive(false);
    setFunctionalityActive(false);
    setGoogleAnalyticsActive(false);
    setTelemetryActive(false);
    setAudioPrefsActive(false);
    saveToStorage("essential_only", {
      necessary: true,
      analytics: false,
      functionality: false,
    });
    setShowNotice(false);
    setShowPreferencesModal(false);
  };

  const handleSavePreferences = () => {
    try { soundManager.granted(); } catch {}
    saveToStorage("custom", {
      necessary: true,
      analytics: analyticsActive,
      functionality: functionalityActive,
    });
    setShowNotice(false);
    setShowPreferencesModal(false);
  };

  // Listen for global open event (e.g. from footer link or settings)
  useEffect(() => {
    const handleOpenCookies = () => {
      setShowPreferencesModal(true);
    };
    window.addEventListener("buildlab:open-cookie-preferences", handleOpenCookies);
    return () => window.removeEventListener("buildlab:open-cookie-preferences", handleOpenCookies);
  }, []);

  return (
    <>
      {/* ── MINIMAL BOTTOM CONSENT BANNER ── */}
      {showNotice && !showPreferencesModal && (
        <aside className="buildlab-cookie-banner" role="dialog" aria-labelledby="cookie-title">
          <div className="cookie-banner-content">
            <div className="cookie-icon-col">
              <div className="cookie-hex-badge">
                <span className="cookie-icon">🍪</span>
              </div>
            </div>

            <div className="cookie-text-col">
              <div className="cookie-tagline">
                <span className="cookie-pulse-dot" />
                <span id="cookie-title" className="cookie-heading">COOKIE &amp; DATA USAGE NOTICE</span>
              </div>
              <p className="cookie-description">
                BuildLab uses cookies and browser storage to preserve your PC component builds, session preferences, and student certification progress. You can accept all or customize individual cookie categories.
              </p>
            </div>

            <div className="cookie-actions-col">
              <button
                type="button"
                className="cookie-btn-accept"
                onClick={handleAcceptAll}
              >
                <span>ACCEPT ALL</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
              <button
                type="button"
                className="cookie-btn-secondary"
                onClick={() => {
                  try { soundManager.click(); } catch {}
                  setShowPreferencesModal(true);
                }}
              >
                MANAGE PREFERENCES
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── FULL COOKIE PREFERENCES ACCORDION MODAL (Hero Section Themed) ── */}
      {showPreferencesModal && (
        <div
          className="cookie-prefs-overlay"
          onClick={() => setShowPreferencesModal(false)}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div
            className="cookie-prefs-dialog"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-prefs-title"
            data-scrollable="true"
          >
            {/* Header */}
            <div className="cookie-prefs-header">
              <div className="cookie-header-left">
                <div className="cookie-cyber-tag">
                  <span className="tag-bracket">[</span>
                  <span className="tag-pulse-dot" />
                  <span>SYSTEM // DATA &amp; PRIVACY</span>
                  <span className="tag-bracket">]</span>
                </div>
                <h2 id="cookie-prefs-title" className="cookie-prefs-title">
                  Cookie Preferences
                </h2>
              </div>
              <button
                type="button"
                className="cookie-prefs-close-btn"
                onClick={() => {
                  try { soundManager.modalClose(); } catch {}
                  setShowPreferencesModal(false);
                }}
                aria-label="Close Cookie Preferences"
                title="Close Preferences (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="cookie-prefs-body">
              <div className="cookie-usage-intro">
                <h3 className="cookie-usage-heading">Cookie Usage &amp; Diagnostics</h3>
                <p className="cookie-usage-desc">
                  We use cookies and client storage to enable the basic functionalities of the hardware workbench, ensure 3D simulation stability, and remember your student progress. You can inspect each cookie category below and toggle your preferences.
                </p>
              </div>

              {/* ── ACCORDION 1: Strictly Necessary Cookies (Locked ON) ── */}
              <div className={`cookie-category-card ${expandedSections.necessary ? "expanded" : ""}`}>
                <div
                  className="category-card-header"
                  onClick={() => toggleSection("necessary")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="category-header-left">
                    <span className="accordion-chevron">
                      {expandedSections.necessary ? "▲" : "▼"}
                    </span>
                    <div className="category-title-wrap">
                      <span className="category-title">Strictly Necessary Cookies</span>
                      <span className="category-status-pill locked">ALWAYS ACTIVE</span>
                    </div>
                  </div>

                  <div className="category-header-right" onClick={(e) => e.stopPropagation()}>
                    <label className="toggle-switch locked" title="Strictly necessary cookies cannot be disabled">
                      <input type="checkbox" checked={necessaryActive} disabled />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                <div className="category-card-content-wrap">
                  <div className="category-card-content">
                    <p className="category-explanation">
                      These cookies are essential for the proper functioning of the BuildLab platform. Without these cookies, basic features like component selection, session continuity, and secure admin authentication cannot operate.
                    </p>

                    <div className="cookie-details-grid">
                      <div className="cookie-detail-card">
                        <div className="cookie-detail-head">
                          <span className="cookie-name-badge">buildlab_session</span>
                          <span className="cookie-expiry-tag">SESSION</span>
                        </div>
                        <div className="cookie-detail-meta">
                          <span className="meta-label">Domain:</span>
                          <span className="meta-value">buildlab.app</span>
                        </div>
                        <p className="cookie-detail-desc">
                          Preserves user session state, active workbench selections, and builder cache across page requests.
                        </p>
                      </div>

                      <div className="cookie-detail-card">
                        <div className="cookie-detail-head">
                          <span className="cookie-name-badge">buildlab_cookie_consent</span>
                          <span className="cookie-expiry-tag">365 DAYS</span>
                        </div>
                        <div className="cookie-detail-meta">
                          <span className="meta-label">Domain:</span>
                          <span className="meta-value">buildlab.app</span>
                        </div>
                        <p className="cookie-detail-desc">
                          Remembers your customized cookie consent preferences so you are not prompted repeatedly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ACCORDION 2: Analytics Cookies (Toggleable) ── */}
              <div className={`cookie-category-card ${expandedSections.analytics ? "expanded" : ""}`}>
                <div
                  className="category-card-header"
                  onClick={() => toggleSection("analytics")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="category-header-left">
                    <span className="accordion-chevron">
                      {expandedSections.analytics ? "▲" : "▼"}
                    </span>
                    <div className="category-title-wrap">
                      <span className="category-title">Analytics &amp; Diagnostics Cookies</span>
                      <span className={`category-status-pill ${analyticsActive ? "active" : "inactive"}`}>
                        {analyticsActive ? "ENABLED" : "DISABLED"}
                      </span>
                    </div>
                  </div>

                  <div className="category-header-right" onClick={(e) => e.stopPropagation()}>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={analyticsActive}
                        onChange={(e) => {
                          const val = e.target.checked;
                          try { soundManager.click(); } catch {}
                          setAnalyticsActive(val);
                          setGoogleAnalyticsActive(val);
                          setTelemetryActive(val);
                        }}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                <div className="category-card-content-wrap">
                  <div className="category-card-content">
                    {/* Sub-toggles */}
                    <div className="sub-services-list">
                      <div className="sub-service-row">
                        <div className="sub-service-info">
                          <span className="sub-service-name">Google Analytics</span>
                          <span className="sub-service-sub">Aggregated visitor count &amp; navigation flows</span>
                        </div>
                        <label className="toggle-switch small">
                          <input
                            type="checkbox"
                            checked={googleAnalyticsActive}
                            onChange={(e) => {
                              try { soundManager.click(); } catch {}
                              setGoogleAnalyticsActive(e.target.checked);
                            }}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </div>

                      <div className="sub-service-row">
                        <div className="sub-service-info">
                          <span className="sub-service-name">BuildLab Rig Telemetry</span>
                          <span className="sub-service-sub">Hardware compatibility error diagnostics &amp; crash logs</span>
                        </div>
                        <label className="toggle-switch small">
                          <input
                            type="checkbox"
                            checked={telemetryActive}
                            onChange={(e) => {
                              try { soundManager.click(); } catch {}
                              setTelemetryActive(e.target.checked);
                            }}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    </div>

                    <p className="category-explanation">
                      These cookies collect telemetry on how learners use the 2D workbench and 3D studio. This anonymized data helps us optimize WebGL rendering performance and resolve component mismatches.
                    </p>

                    <div className="cookie-details-grid">
                      <div className="cookie-detail-card">
                        <div className="cookie-detail-head">
                          <span className="cookie-name-badge">_ga</span>
                          <span className="cookie-expiry-tag">2 YEARS</span>
                        </div>
                        <div className="cookie-detail-meta">
                          <span className="meta-label">Domain:</span>
                          <span className="meta-value">buildlab.app</span>
                        </div>
                        <p className="cookie-detail-desc">
                          Google Analytics — Used to calculate visitor, session, and campaign data for the platform.
                        </p>
                      </div>

                      <div className="cookie-detail-card">
                        <div className="cookie-detail-head">
                          <span className="cookie-name-badge">_gid</span>
                          <span className="cookie-expiry-tag">24 HOURS</span>
                        </div>
                        <div className="cookie-detail-meta">
                          <span className="meta-label">Domain:</span>
                          <span className="meta-value">buildlab.app</span>
                        </div>
                        <p className="cookie-detail-desc">
                          Google Analytics — Persists session identifiers during 24-hour learner usage periods.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ACCORDION 3: Functionality Cookies (Toggleable) ── */}
              <div className={`cookie-category-card ${expandedSections.functionality ? "expanded" : ""}`}>
                <div
                  className="category-card-header"
                  onClick={() => toggleSection("functionality")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="category-header-left">
                    <span className="accordion-chevron">
                      {expandedSections.functionality ? "▲" : "▼"}
                    </span>
                    <div className="category-title-wrap">
                      <span className="category-title">Functionality &amp; Audio Cookies</span>
                      <span className={`category-status-pill ${functionalityActive ? "active" : "inactive"}`}>
                        {functionalityActive ? "ENABLED" : "DISABLED"}
                      </span>
                    </div>
                  </div>

                  <div className="category-header-right" onClick={(e) => e.stopPropagation()}>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={functionalityActive}
                        onChange={(e) => {
                          const val = e.target.checked;
                          try { soundManager.click(); } catch {}
                          setFunctionalityActive(val);
                          setAudioPrefsActive(val);
                        }}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                <div className="category-card-content-wrap">
                  <div className="category-card-content">
                    <div className="sub-services-list">
                      <div className="sub-service-row">
                        <div className="sub-service-info">
                          <span className="sub-service-name">Sci-Fi UI &amp; Terminal Audio</span>
                          <span className="sub-service-sub">Interactive EDEX-style SFX volume and mute state</span>
                        </div>
                        <label className="toggle-switch small">
                          <input
                            type="checkbox"
                            checked={audioPrefsActive}
                            onChange={(e) => {
                              try { soundManager.click(); } catch {}
                              setAudioPrefsActive(e.target.checked);
                            }}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    </div>

                    <p className="category-explanation">
                      These cookies enable enhanced personalization, preserving your sound preferences, dark/light theme setting, and 3D studio camera sensitivities across visits.
                    </p>

                    <div className="cookie-details-grid">
                      <div className="cookie-detail-card">
                        <div className="cookie-detail-head">
                          <span className="cookie-name-badge">buildlab_audio_pref</span>
                          <span className="cookie-expiry-tag">365 DAYS</span>
                        </div>
                        <div className="cookie-detail-meta">
                          <span className="meta-label">Domain:</span>
                          <span className="meta-value">buildlab.app</span>
                        </div>
                        <p className="cookie-detail-desc">
                          Stores audio mute state and volume settings for interactive terminal sound effects.
                        </p>
                      </div>

                      <div className="cookie-detail-card">
                        <div className="cookie-detail-head">
                          <span className="cookie-name-badge">buildlab_app_mode</span>
                          <span className="cookie-expiry-tag">SESSION</span>
                        </div>
                        <div className="cookie-detail-meta">
                          <span className="meta-label">Domain:</span>
                          <span className="meta-value">buildlab.app</span>
                        </div>
                        <p className="cookie-detail-desc">
                          Preserves your selected workspace track (Learn Track vs Free Workbench) across reloads.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* More Information */}
              <div className="cookie-more-info">
                <div className="more-info-head">
                  <span className="more-info-dot" />
                  <h4 className="more-info-title">Privacy &amp; Data Transparency</h4>
                </div>
                <p className="more-info-text">
                  BuildLab does not sell your personal data. All component engineering benchmarks, socket validation algorithms, and simulation tools are provided for educational purposes. For details, read our{" "}
                  <a href="#terms" onClick={(e) => { e.preventDefault(); alert("BuildLab Terms & Privacy: Hardware benchmarks, 3D models, and certification records are stored for student educational evaluation."); }}>
                    Privacy Policy &amp; Terms of Service
                  </a>.
                </p>
              </div>
            </div>

            {/* Bottom Actions (Hero Themed Button Bar) */}
            <div className="cookie-prefs-footer">
              <button
                type="button"
                className="btn-cookie-action reject-all"
                onClick={handleRejectAll}
              >
                Reject all
              </button>
              <button
                type="button"
                className="btn-cookie-action save-prefs"
                onClick={handleSavePreferences}
              >
                Save preferences
              </button>
              <button
                type="button"
                className="btn-cookie-action accept-all"
                onClick={handleAcceptAll}
              >
                <span>Accept all</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
