import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { enterFullscreen } from "../../utilities/fullscreen";
import soundManager from "../../utilities/soundManager";
import "./Navbar.css";

function Navbar({ isPinned: propsIsPinned, setIsPinned: propsSetIsPinned }) {
  const { isAdmin, logoutAdmin } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const sidebarCtx = useSidebar();

  // Prefer context state, falling back to props if provided
  const isPinned = propsIsPinned !== undefined ? propsIsPinned : sidebarCtx.isPinned;
  const setIsPinned = propsSetIsPinned !== undefined ? propsSetIsPinned : sidebarCtx.setIsPinned;
  const togglePin = sidebarCtx.togglePin;
  const isHovered = sidebarCtx.isHovered;
  const setIsHovered = sidebarCtx.setIsHovered;
  const isOpenManual = sidebarCtx.isOpenManual;
  const closeSidebar = sidebarCtx.closeSidebar;

  const [soundActive, setSoundActive] = useState(() => soundManager.enabled);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isVisible = isPinned || isHovered || isOpenManual;

  const handleCoreClick = (e) => {
    e.stopPropagation();
    setIsCalibrating(true);
    try {
      soundManager.play("snap");
    } catch {}
    setTimeout(() => setIsCalibrating(false), 800);
  };

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

  const currentPath = location.pathname;
  const isInventory = currentPath.includes("/admin/inventory") || currentPath === "/admin";
  const isAdd = currentPath.includes("/admin/add");
  const isEdit = currentPath.includes("/admin/edit");
  const isCrawler = currentPath.includes("/admin/crawler");

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
        onClick={closeSidebar} 
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
          {/* ════ 100X COOLER HIGH-TECH SIDEBAR HEADER ════ */}
          <div className="sidebar-header">
            <div className="sidebar-brand-group">
              {/* Interactive BuildLab Quantum Reactor Core */}
              <div 
                className={`sidebar-reactor-core ${isCalibrating ? 'calibrating' : ''}`}
                onClick={handleCoreClick}
                title="BuildLab Quantum Core // Click to Re-calibrate System Matrix"
              >
                <div className="reactor-pulse-halo" />
                <svg className="reactor-core-svg" viewBox="0 0 40 40" width="34" height="34">
                  {/* Outer rotating orbital alignment ring */}
                  <circle className="core-orbital-ring" cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
                  {/* Middle hex alignment bracket */}
                  <polygon className="core-hex-ring" points="20,5 33,12.5 33,27.5 20,35 7,27.5 7,12.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  {/* Inner glowing delta/core */}
                  <polygon className="core-inner-delta" points="20,10 29,26 11,26" fill="currentColor" />
                  {/* Center energy point */}
                  <circle className="core-center-eye" cx="20" cy="21" r="2.5" />
                </svg>
                <span className="reactor-wave-emitter" />
              </div>

              {/* Dynamic Brand Typography */}
              <Link to={isAdminRoute ? "/admin/inventory" : "/"} className="sidebar-logo-v2" onClick={() => { try { soundManager.click(); } catch(e) {} }}>
                <div className="sidebar-brand-meta">
                  <div className="brand-title-row">
                    <span className="brand-title-main">BUILDLAB</span>
                    {isAdminRoute && <span className="admin-tag-v2">ROOT LVL 4</span>}
                  </div>
                  <div className="brand-status-row">
                    <span className="status-live-dot" />
                    <span className="status-live-text">{isAdminRoute ? "COMMAND MATRIX" : "SYSTEM V2.4"}</span>
                    <span className="status-live-ping">12ms</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Tactile Magnetic Dock Latch (Upgraded from standard pushpin) */}
            <button 
              className={`sidebar-dock-latch ${isPinned ? 'docked' : 'floating'}`}
              onClick={togglePin}
              title={isPinned ? "Undock Command Deck (Auto-hide on exit)" : "Dock Command Deck to Workspace"}
              aria-label={isPinned ? "Undock Deck" : "Dock Deck"}
            >
              <div className="latch-icon-wrap">
                {isPinned ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </svg>
                )}
              </div>
              <span className="latch-status-indicator" />
            </button>
          </div>

          {/* Ultra-Cool Mini Telemetry HUD Ribbon */}
          <div className="sidebar-telemetry-ribbon">
            <div className="ribbon-pill">
              <span className="ribbon-label">CORE</span>
              <span className="ribbon-val val-ok">NOMINAL</span>
            </div>
            <div className="ribbon-divider">/</div>
            <div className="ribbon-pill">
              <span className="ribbon-label">RIG</span>
              <span className="ribbon-val val-active">ACTIVE</span>
            </div>
            <div className="ribbon-divider">/</div>
            <div 
              className="ribbon-pill sfx-toggle" 
              onClick={() => {
                const next = soundManager.toggleSound();
                setSoundActive(next);
              }}
              title={soundActive ? "SFX Active - Click to mute" : "SFX Muted - Click to unmute"}
            >
              <span className="ribbon-label">AUDIO</span>
              <span className={`ribbon-val ${soundActive ? "val-live" : "val-muted"}`}>
                {soundActive ? "LIVE" : "MUTED"}
              </span>
            </div>
          </div>
          
          {/* ── ADMIN PANEL SIDEBAR VIEW ── */}
          {isAdminRoute ? (
            <div className="sidebar-admin-body">
              <div className="sidebar-admin-card">
                <div className="admin-status-badge">
                  <span className="status-dot"></span>
                  <span>ADMIN SESSION ONLINE</span>
                </div>
                <p className="admin-status-sub">Control matrix & catalog operations</p>
              </div>

              {/* Categorized Admin Capability Links */}
              <div className="admin-sidebar-nav-group">
                <div className="admin-group-title">ADMIN CAPABILITIES</div>
                <div className="sidebar-links admin-capability-links">
                  <Link
                    to="/admin/inventory"
                    className={`sidebar-link ${isInventory ? "active" : ""}`}
                    title="Hardware component catalog and matrix"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <span>Inventory</span>
                  </Link>

                  <Link
                    to="/admin/add"
                    className={`sidebar-link ${isAdd ? "active" : ""}`}
                    title="Onboard a new hardware component"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add Component</span>
                  </Link>

                  <Link
                    to="/admin/edit"
                    className={`sidebar-link ${isEdit ? "active" : ""}`}
                    title="Modify hardware specifications and assets"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Edit Components</span>
                  </Link>

                  <Link
                    to="/admin/crawler"
                    className={`sidebar-link ${isCrawler ? "active" : ""}`}
                    title="Automated headless crawler and review queue"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5l-2.1 2.1m-8.8 8.8l-2.1 2.1m0-13l2.1 2.1m8.8 8.8l2.1 2.1"></path>
                    </svg>
                    <span>Crawler Hub</span>
                  </Link>
                </div>
              </div>

              {/* Hardware Stages Quick Navigation */}
              <div className="admin-sidebar-nav-group">
                <div className="admin-group-title">HARDWARE STAGES</div>
                <div className="admin-stage-quick-links">
                  {[
                    { key: "gpu", label: "GPU" },
                    { key: "motherboard", label: "Motherboard" },
                    { key: "cpu", label: "CPU" },
                    { key: "ram", label: "RAM" },
                    { key: "storage", label: "Storage" },
                    { key: "case", label: "Case" },
                    { key: "psu", label: "PSU" }
                  ].map((s) => (
                    <Link
                      key={s.key}
                      to={`/admin/inventory?category=${s.key}`}
                      className="admin-stage-pill"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="sidebar-admin-controls">
                {/* Return to Public Builder */}
                <Link to="/" className="sidebar-return-link" title="Return to Public PC Builder">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  <span>Public Builder</span>
                </Link>

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

                {/* Sound FX Toggle */}
                <div className="theme-toggle-row">
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

                {/* Support & Diagnostics Category */}
                <div className="sidebar-group-label" style={{ marginTop: '1.2rem', marginBottom: '0.25rem', padding: '0 0.5rem', fontSize: '0.66rem', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#d4a34b', opacity: 0.85 }}>
                  Support &amp; Intel
                </div>
                <Link to="/help" className="sidebar-link support-entry-link" style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Help &amp; Support
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