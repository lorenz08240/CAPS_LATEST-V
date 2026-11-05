import React, { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const AdminLogin = () => {
  const { isAdmin, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const destination = location.state?.from?.pathname || "/admin/inventory";

  // If already authenticated, redirect to destination immediately
  if (isAdmin) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const success = loginAdmin(password);
    if (success) {
      navigate(destination, { replace: true });
    } else {
      setError("Invalid administrative passcode. Access denied.");
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page admin-login-wrapper">
        <div className="admin-login-left">
          <div className="login-graphic">
            <div className="deck-tag">[ RESTRICTED COMMAND CENTER ]</div>
            <h1>BuildLab Control Deck</h1>
            <p>Administrative hardware inventory control, crawler orchestration, and compatibility matrix engineering.</p>
            <div className="session-security-pill">
              <span className="security-status-indicator"></span>
              <span>Non-persistent session: Credentials automatically expire on window close</span>
            </div>
            <div className="cyber-circuit"></div>
          </div>
        </div>

        <div className="admin-login-right">
          <div className="admin-panel login-panel">
            <div className="panel-badge-lock">
            </div>
            <h2>Admin Authentication</h2>

            {error && <div className="login-error-toast">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Security Passcode</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter security passcode..."
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="admin-submit-btn" style={{ width: "100%" }}>
                Unlock Deck
              </button>

              <Link to="/" className="return-link">
                &larr; Return to Student Builder
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
