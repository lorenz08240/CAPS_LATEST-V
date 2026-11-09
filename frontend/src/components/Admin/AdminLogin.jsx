import React, { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PixelCanvas from "../Common/PixelCanvas";
import soundManager from "../../utilities/soundManager";
import systemLogo from "../../assets/system_logo.png";
import "./Admin.css";

export const AdminLogin = () => {
  const { isAdmin, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [adminId, setAdminId] = useState("root");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination =
    location.state?.from?.pathname
      ? location.state.from.pathname + (location.state.from.search || "")
      : localStorage.getItem("buildlab_admin_last_location") || "/admin/inventory";

  // If already authenticated, redirect to destination immediately
  if (isAdmin) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      soundManager.click();
    } catch {}

    const success = loginAdmin(adminId, password);
    if (success) {
      try {
        soundManager.granted();
      } catch {}
      navigate(destination, { replace: true });
    } else {
      try {
        soundManager.denied();
      } catch {}
      setError("Invalid operator ID or passcode. Access denied.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-hero-container">
      {/* ── INTERACTIVE MOUSE TRAIL PIXEL CANVAS (Whole Screen Background) ── */}
      <PixelCanvas
        colors={["#00e5a0", "#10b981", "#38bdf8", "#facc15"]}
        gap={8}
        speed={30}
        className="admin-login-pixel-trail"
      />

      {/* ── AMBIENT HERO GLOWS & GRID OVERLAY (Home Hero Parity) ── */}
      <div className="admin-login-ambient-glow" aria-hidden="true" />
      <div className="admin-login-grid-mesh" aria-hidden="true" />

      {/* ── CENTERED LOGIN CARD FORM (Hero theme container) ── */}
      <div className="admin-login-card-wrapper">
        <div className="admin-login-card">
          {/* Brand Header with BuildLab System Logo */}
          <div className="admin-login-brand-header">
            <div className="admin-login-logo-box">
              <img
                src={systemLogo}
                alt="BuildLab Logo"
                className="admin-login-logo-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/system_logo.png";
                }}
              />
            </div>
            <div className="admin-login-brand-text">
              <span className="admin-login-brand-title">BUILDLAB</span>
            </div>
          </div>

          {/* Heading with AboutUs Hero typography match */}
          <div className="admin-login-heading-group">
            <h1 className="admin-login-title">ADMIN AUTHENTICATION</h1>
          </div>

          {/* Error Message Toast */}
          {error && (
            <div className="admin-login-error-banner" role="alert">
              <span className="error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={handleSubmit} className="admin-login-form">
            {/* Input 1: Operator ID */}
            <div className="admin-login-field">
              <label className="admin-login-label">
                <span>OPERATOR ID</span>
                <span className="label-req">*</span>
              </label>
              <div className="admin-input-wrap">
                <span className="input-prefix-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => {
                    setAdminId(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. root"
                  className="admin-login-input font-mono"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Input 2: Password */}
            <div className="admin-login-field">
              <label className="admin-login-label">
                <span>SECURITY PASSCODE</span>
                <span className="label-req">*</span>
              </label>
              <div className="admin-input-wrap">
                <span className="input-prefix-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter security passcode..."
                  className="admin-login-input font-mono"
                />
                <button
                  type="button"
                  className="btn-toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  title={showPassword ? "Hide passcode" : "Show passcode"}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-admin-login-submit"
            >
              <span>{isSubmitting ? "Authenticating..." : "Unlock Deck"}</span>
              <span className="btn-arrow">&rarr;</span>
            </button>

            {/* Return Link */}
            <Link to="/" className="admin-login-return-link">
              &larr; Return to Student Builder
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
