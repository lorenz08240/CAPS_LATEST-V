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
  const [soundActive, setSoundActive] = useState(() => soundManager.enabled);
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
                    {isDark ? "Dark Theme" : "Light Theme"}
                  </span>
                  <button 
                    type="button" 
                    className={`theme-toggle-switch ${isDark ? "dark" : "light"}`}
                    onClick={toggleTheme}
                    title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                  >
                    <div className="theme-toggle-slider">
                      <span className="theme-icon">
                        {isDark ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        )}
                      </span>
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  3D Studio
                </Link>
                <Link to="/compatibility" className="sidebar-link">
                  Compatibility
                </Link>
                <Link to="/learn" className="sidebar-link">
                  Learn
                </Link>
                <Link to="/admin" className="sidebar-link admin-entry-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  {isAdmin ? 'Admin Deck' : 'Admin Access'}
                </Link>
              </div>

              {/* Theme & SFX Toggle in Regular Sidebar Footer */}
              <div className="sidebar-footer-controls">
                <div className="theme-toggle-row">
                  <span className="theme-toggle-label">
                    {isDark ? "Dark Theme" : "Light Theme"}
                  </span>
                  <button 
                    type="button" 
                    className={`theme-toggle-switch ${isDark ? "dark" : "light"}`}
                    onClick={toggleTheme}
                    title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                  >
                    <div className="theme-toggle-slider">
                      <span className="theme-icon">
                        {isDark ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        )}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="theme-toggle-row" style={{ marginTop: "8px" }}>
                  <span className="theme-toggle-label">
                    {soundActive ? "Sound FX" : "SFX Muted"}
                  </span>
                  <button 
                    type="button" 
                    className={`theme-toggle-switch ${soundActive ? "dark" : "light"}`}
                    onClick={() => {
                      const next = soundManager.toggleSound();
                      setSoundActive(next);
                    }}
                    title={soundActive ? "Mute Sound Effects" : "Enable Sound Effects"}
                  >
                    <div className="theme-toggle-slider">
                      <span className="theme-icon">
                        {soundActive ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                        )}
                      </span>
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