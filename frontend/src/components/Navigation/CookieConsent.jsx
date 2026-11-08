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

      {/* ── FULL COOKIE PREFERENCES ACCORDION MODAL (Exact Image 2 Reference) ── */}
      {showPreferencesModal && (
        <div
          className="cookie-prefs-overlay"
          onClick={() => setShowPreferencesModal(false)}
        >
          <div
            className="cookie-prefs-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-prefs-title"
          >
            {/* Header */}
            <div className="cookie-prefs-header">
              <h2 id="cookie-prefs-title" className="cookie-prefs-title">
                Cookie Preferences
              </h2>
              <button
                type="button"
                className="cookie-prefs-close-btn"
                onClick={() => {
                  try { soundManager.modalClose(); } catch {}
                  setShowPreferencesModal(false);
                }}
                aria-label="Close Cookie Preferences"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="cookie-prefs-body">
              <div className="cookie-usage-intro">
                <h3 className="cookie-usage-heading">Cookie Usage</h3>
                <p className="cookie-usage-desc">
                  We use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want.
                </p>
              </div>

              {/* ── ACCORDION 1: Strictly Necessary Cookies (Locked ON) ── */}
              <div className={`cookie-category-card ${expandedSections.necessary ? "expanded" : ""}`}>
                <div
                  className="category-card-header"
                  onClick={() => toggleSection("necessary")}
                >
                  <div className="category-header-left">
                    <span className="accordion-chevron">
                      {expandedSections.necessary ? "▲" : "▼"}
                    </span>
                    <span className="category-title">Strictly Necessary Cookies</span>
                  </div>

                  <div className="category-header-right" onClick={(e) => e.stopPropagation()}>
                    <label className="toggle-switch locked" title="Strictly necessary cookies cannot be disabled">
                      <input type="checkbox" checked={necessaryActive} disabled />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                {expandedSections.necessary && (
                  <div className="category-card-content">
                    <p className="category-explanation">
                      These cookies are essential for the proper functioning of the website. Without these cookies, the website would not work properly. They enable basic functions like page navigation, access to secure areas, and maintain your session.
                    </p>

                    <div className="cookie-details-table">
                      <div className="cookie-detail-group">
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Cookie</span>
                          <span className="cookie-detail-val">PHPSESSID / buildlab_session</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Domain</span>
                          <span className="cookie-detail-val">buildlab.app</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Expiration</span>
                          <span className="cookie-detail-val">Session</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Description</span>
                          <span className="cookie-detail-val">Preserves user session state across page requests.</span>
                        </div>
                      </div>

                      <div className="cookie-detail-group">
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Cookie</span>
                          <span className="cookie-detail-val">buildlab_cookie_consent</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Domain</span>
                          <span className="cookie-detail-val">buildlab.app</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Expiration</span>
                          <span className="cookie-detail-val">365 days</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Description</span>
                          <span className="cookie-detail-val">Stores your cookie consent preferences.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── ACCORDION 2: Analytics Cookies (Toggleable) ── */}
              <div className={`cookie-category-card ${expandedSections.analytics ? "expanded" : ""}`}>
                <div
                  className="category-card-header"
                  onClick={() => toggleSection("analytics")}
                >
                  <div className="category-header-left">
                    <span className="accordion-chevron">
                      {expandedSections.analytics ? "▲" : "▼"}
                    </span>
                    <span className="category-title">Analytics Cookies</span>
                  </div>

                  <div className="category-header-right" onClick={(e) => e.stopPropagation()}>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={analyticsActive}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setAnalyticsActive(val);
                          setGoogleAnalyticsActive(val);
                          setTelemetryActive(val);
                        }}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                {expandedSections.analytics && (
                  <div className="category-card-content">
                    {/* Sub-toggles */}
                    <div className="sub-services-list">
                      <div className="sub-service-row">
                        <span className="sub-service-name">Google Analytics</span>
                        <label className="toggle-switch small">
                          <input
                            type="checkbox"
                            checked={googleAnalyticsActive}
                            onChange={(e) => setGoogleAnalyticsActive(e.target.checked)}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </div>

                      <div className="sub-service-row">
                        <span className="sub-service-name">BuildLab Telemetry</span>
                        <label className="toggle-switch small">
                          <input
                            type="checkbox"
                            checked={telemetryActive}
                            onChange={(e) => setTelemetryActive(e.target.checked)}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    </div>

                    <p className="category-explanation">
                      These cookies collect information about how you use our website, such as which pages you visit most often. This data helps us improve the website and promote better user experience. Data is transferred to Google LLC under Standard Contractual Clauses (SCCs).
                    </p>

                    <div className="cookie-details-table">
                      <div className="cookie-detail-group">
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Cookie</span>
                          <span className="cookie-detail-val">_ga</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Domain</span>
                          <span className="cookie-detail-val">buildlab.app</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Expiration</span>
                          <span className="cookie-detail-val">2 years</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Description</span>
                          <span className="cookie-detail-val">Google Analytics - Used to distinguish users.</span>
                        </div>
                      </div>

                      <div className="cookie-detail-group">
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Cookie</span>
                          <span className="cookie-detail-val">_gid</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Domain</span>
                          <span className="cookie-detail-val">buildlab.app</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Expiration</span>
                          <span className="cookie-detail-val">24 hours</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Description</span>
                          <span className="cookie-detail-val">Google Analytics - Used to persist session state.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── ACCORDION 3: Functionality Cookies (Toggleable) ── */}
              <div className={`cookie-category-card ${expandedSections.functionality ? "expanded" : ""}`}>
                <div
                  className="category-card-header"
                  onClick={() => toggleSection("functionality")}
                >
                  <div className="category-header-left">
                    <span className="accordion-chevron">
                      {expandedSections.functionality ? "▲" : "▼"}
                    </span>
                    <span className="category-title">Functionality Cookies</span>
                  </div>

                  <div className="category-header-right" onClick={(e) => e.stopPropagation()}>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={functionalityActive}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setFunctionalityActive(val);
                          setAudioPrefsActive(val);
                        }}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                {expandedSections.functionality && (
                  <div className="category-card-content">
                    <div className="sub-services-list">
                      <div className="sub-service-row">
                        <span className="sub-service-name">Audio &amp; Terminal Sound Effects</span>
                        <label className="toggle-switch small">
                          <input
                            type="checkbox"
                            checked={audioPrefsActive}
                            onChange={(e) => setAudioPrefsActive(e.target.checked)}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    </div>

                    <p className="category-explanation">
                      These cookies enable enhanced functionality and personalization, such as live audio SFX preferences, dark/light theme setting, and 3D camera sensitivity settings.
                    </p>

                    <div className="cookie-details-table">
                      <div className="cookie-detail-group">
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Cookie</span>
                          <span className="cookie-detail-val">buildlab_audio_pref</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Domain</span>
                          <span className="cookie-detail-val">buildlab.app</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Expiration</span>
                          <span className="cookie-detail-val">365 days</span>
                        </div>
                        <div className="cookie-detail-row">
                          <span className="cookie-detail-label">Description</span>
                          <span className="cookie-detail-val">Preserves sound effect volume and audio toggle status.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* More Information */}
              <div className="cookie-more-info">
                <h4 className="more-info-title">More Information</h4>
                <p className="more-info-text">
                  For any queries in relation to our policy on cookies and your choices, please contact us. Read our full{" "}
                  <a href="#terms" onClick={(e) => { e.preventDefault(); alert("BuildLab Terms & Privacy: All hardware models, engineering benchmarks, and simulation engines are educational resources."); }}>Privacy Policy, Cookie Policy, and Terms of Service</a>.
                </p>
              </div>
            </div>

            {/* Bottom Actions (Stacked as in screenshot) */}
            <div className="cookie-prefs-footer">
              <button
                type="button"
                className="btn-cookie-action accept-all"
                onClick={handleAcceptAll}
              >
                Accept all
              </button>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
