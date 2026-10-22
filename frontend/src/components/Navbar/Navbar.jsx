import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { enterFullscreen } from "../../utilities/fullscreen";
import soundManager from "../../utilities/soundManager";
import "./Navbar.css";

function Navbar({ isPinned, setIsPinned }) {
  const { isAdmin, logoutAdmin } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Disable Sidebar completely in Admin panel (user uses Back to Component Picker button)
  if (isAdminRoute) {
    return null;
  }

  const isVisible = isPinned || isHovered;

  const scrollToBuild = (e) => {
    e.preventDefault();
    // "Build" is the app's entry point — the Component Picker on "/" is home.
    enterFullscreen(); // click gesture = permission for immersive fullscreen
    soundManager.openBox();
    if (location.pathname !== "/") {
      navigate("/");
    }
    // Ask the Home page to dismiss the welcome banner (if still showing)
    window.dispatchEvent(new Event("buildlab:enter-build"));
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 150);
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate("/");
  };

  return (
    <>
      {/* Invisible Trigger Zone */}
      {!isPinned && (
        <div 
          className="sidebar-trigger-zone" 
          onMouseEnter={() => setIsHovered(true)} 
        />
      )}

      {/* Soft Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${isHovered && !isPinned ? "active" : ""}`} 
        onClick={() => setIsHovered(false)} 
      />

      <nav 
        className={`sidebar wood-mahogany ${isVisible ? "open" : "closed"} ${isPinned ? "pinned" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle wood grain texture layer */}
        <div className="sidebar-wood-overlay" aria-hidden="true" />

        {/* Indicator Arrow when closed */}
        {!isVisible && (
          <div className="sidebar-indicator">
            <span className="indicator-arrow">›</span>
          </div>
        )}

        <div className="sidebar-container">
          <div className="sidebar-header">
            <Link to="/" className="sidebar-logo">
              {isAdminRoute ? (
                <span className="logo-admin-text">BUILDLAB <span className="admin-tag">ADMIN</span></span>
              ) : (
                <span>BUILDLAB</span>
              )}
            </Link>
            <button 
              className={`sidebar-pin-btn ${isPinned ? 'active' : ''}`}
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isPinned ? "#d4a34b" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="17" x2="12" y2="22"></line>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
              </svg>
            </button>
          </div>
          
          {/* ── ADMIN PANEL SIDEBAR VIEW ── */}
          {isAdminRoute ? (
            <div className="sidebar-admin-body">
              <div className="sidebar-admin-card">
                <div className="admin-status-badge">
                  <span className="status-dot"></span>
                  <span>ADMIN SESSION</span>
                </div>
                <p className="admin-status-sub">Control matrix & component catalog</p>
              </div>

              <div className="sidebar-admin-controls">
                {/* Dark / Light Mode Toggle */}
                <div className="theme-toggle-row">
                  <span className="theme-toggle-label">
                    {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
                  </span>
                  <button 
                    type="button" 
                    className={`theme-toggle-switch ${isDark ? "dark" : "light"}`}
                    onClick={toggleTheme}
                    title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                  >
                    <div className="theme-toggle-slider">
                      <span className="theme-icon">{isDark ? "🌙" : "☀️"}</span>
                    </div>
                  </button>
                </div>

                {/* Logout Button */}
                <button 
                  type="button" 
                  className="sidebar-logout-btn"
                  onClick={handleAdminLogout}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* ── FRONTEND REGULAR SIDEBAR VIEW ── */
            <>
              <div className="sidebar-links">
                <a href="#build-station" onClick={scrollToBuild} className="sidebar-link">
                  Build
                </a>
                <Link to="/3d-builder" className="sidebar-link studio-link">
                  🧊 3D Studio
                </Link>
                <Link to="/compatibility" className="sidebar-link">
                  Compatibility
                </Link>
                <Link to="/learn" className="sidebar-link">
                  Learn
                </Link>
                <Link to="/admin" className="sidebar-link admin-entry-link">
                  ⚙️ {isAdmin ? 'ADMIN DECK' : 'Admin Access'}
                </Link>
              </div>

              {/* Theme Toggle in Regular Sidebar Footer */}
              <div className="sidebar-footer-controls">
                <div className="theme-toggle-row">
                  <span className="theme-toggle-label">
                    {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
                  </span>
                  <button 
                    type="button" 
                    className={`theme-toggle-switch ${isDark ? "dark" : "light"}`}
                    onClick={toggleTheme}
                    title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                  >
                    <div className="theme-toggle-slider">
                      <span className="theme-icon">{isDark ? "🌙" : "☀️"}</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;