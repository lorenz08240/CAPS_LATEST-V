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
      <div className="organic-waves-overlay" aria-hidden="true">
        <div className="wave-glow wave-glow-gold"></div>
        <div className="wave-glow wave-glow-burgundy"></div>
        <div className="wave-glow wave-glow-cyan"></div>
      </div>

      <div className="admin-page admin-login-wrapper">
        <div className="admin-login-left">
          <div className="login-graphic">
            <div className="deck-tag">RESTRICTED COMMAND CENTER</div>
            <h1>BuildLab Control Deck</h1>
            <p>Administrative hardware inventory control, crawler orchestration, and compatibility matrix engineering.</p>
            <div className="session-security-pill">
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
                    {showPassword ? "👁️" : "👁️‍🗨️"}
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
