import React, { useState, useEffect } from "react";
import soundManager from "../../utilities/soundManager";
import "./CookieConsent.css";

export default function CookieConsent() {
  const [showNotice, setShowNotice] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("buildlab_cookie_consent");
      if (!consent) {
        // Slight delay so the page loads smoothly before showing notice
        const timer = setTimeout(() => setShowNotice(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAccept = () => {
    soundManager.click();
    try {
      localStorage.setItem("buildlab_cookie_consent", "accepted");
      localStorage.setItem("buildlab_cookie_consent_date", new Date().toISOString());
    } catch {}
    setShowNotice(false);
  };

  const handleDeclineNonEssential = () => {
    soundManager.click();
    try {
      localStorage.setItem("buildlab_cookie_consent", "essential_only");
      localStorage.setItem("buildlab_cookie_consent_date", new Date().toISOString());
    } catch {}
    setShowNotice(false);
  };

  if (!showNotice && !showTermsModal) return null;

  return (
    <>
      {showNotice && (
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
                <span id="cookie-title" className="cookie-heading">TERMS OF USE & COOKIE NOTICE</span>
              </div>
              <p className="cookie-description">
                BuildLab uses cookies and client-side storage to preserve your PC component builds, session preferences, and student certification progress. By using our website, you agree to our{" "}
                <button
                  type="button"
                  className="cookie-link-btn"
                  onClick={() => setShowTermsModal(true)}
                >
                  Terms & Conditions
                </button>{" "}
                and acknowledge our data collection policy.
              </p>
            </div>

            <div className="cookie-actions-col">
              <button
                type="button"
                className="cookie-btn-accept"
                onClick={handleAccept}
              >
                <span>ACCEPT & PROCEED</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
              <button
                type="button"
                className="cookie-btn-secondary"
                onClick={() => setShowTermsModal(true)}
              >
                VIEW TERMS
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="terms-modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="terms-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <div className="terms-header-tag">
                <span className="tag-bracket">[</span>
                <span className="tag-text">LEGAL NOTICE</span>
                <span className="tag-bracket">]</span>
              </div>
              <h2 className="terms-modal-title">Terms & Conditions of Service</h2>
              <button
                type="button"
                className="terms-close-btn"
                onClick={() => setShowTermsModal(false)}
                aria-label="Close Terms"
              >
                &times;
              </button>
            </div>

            <div className="terms-modal-body">
              <section className="terms-section">
                <h3>1. Acceptance of Terms</h3>
                <p>
                  By accessing and using BuildLab, you agree to comply with and be bound by these Terms and Conditions. BuildLab provides hardware simulation, real-time compatibility auditing, interactive 3D modeling, and student hardware academy courses.
                </p>
              </section>

              <section className="terms-section">
                <h3>2. Cookies & Local Storage Notice</h3>
                <p>
                  BuildLab uses essential browser local storage and session cookies exclusively to:
                </p>
                <ul>
                  <li>Save your selected hardware configurations and custom rig slots.</li>
                  <li>Track educational progress across Academy curriculum modules.</li>
                  <li>Authenticate student profiles for issuance of verified Completion Certificates.</li>
                  <li>Maintain UI preferences including mode (Explore vs. Learn) and display settings.</li>
                </ul>
                <p>
                  We do not sell, license, or transmit your personal data to external advertisers.
                </p>
              </section>

              <section className="terms-section">
                <h3>3. Student Certification & Identity</h3>
                <p>
                  Participants in <strong>Learn Mode</strong> receive an official Certificate of Competency upon completing all required modules and compatibility verification. The full name provided during Google Account setup will be inscribed upon your final certificate document.
                </p>
              </section>

              <section className="terms-section">
                <h3>4. Hardware Compatibility Disclaimer</h3>
                <p>
                  Compatibility checking algorithms evaluate standard pinouts, DDR generations, socket clearances, and estimated thermal/power envelopes. Physical component tolerances may vary by manufacturer.
                </p>
              </section>
            </div>

            <div className="terms-modal-footer">
              <button
                type="button"
                className="cookie-btn-secondary"
                onClick={handleDeclineNonEssential}
              >
                ESSENTIAL ONLY
              </button>
              <button
                type="button"
                className="cookie-btn-accept"
                onClick={handleAccept}
              >
                I AGREE & CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
