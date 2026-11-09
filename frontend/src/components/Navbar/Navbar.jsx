import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { enterFullscreen } from "../../utilities/fullscreen";
import soundManager from "../../utilities/soundManager";
import AccountSetupModal from "../Home/AccountSetupModal";
import "./Navbar.css";

function Navbar({ isPinned: propsIsPinned }) {
  const { isAdmin, logoutAdmin } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { mode, userProfile, unlockedStages } = useLearnMode();
  const sidebarCtx = useSidebar();

  // Prefer context state, falling back to props if provided
  const isPinned = false; // Pin feature removed per design simplification
  const isOpenManual = sidebarCtx.isOpenManual;
  const closeSidebar = sidebarCtx.closeSidebar;
  const openSidebar = sidebarCtx.openSidebar;

  const [soundActive, setSoundActive] = useState(() => soundManager.enabled);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isVisible = isOpenManual;

  const handleLinkClick = () => {
    if (!isPinned) {
      closeSidebar();
    }
  };

  const scrollToBuild = (e) => {
    e.preventDefault();
    enterFullscreen();
    if (location.pathname !== "/") {
      navigate("/");
    }
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
  const isCrawler = currentPath.includes("/admin/crawler");
  const isLogs = currentPath.includes("/admin/logs");

  return (
    <>
      {/* Click-to-toggle Edge Tab on left border when closed */}
      {!isVisible && (
        <button
          type="button"
          className="sidebar-edge-tab"
          onClick={() => {
            openSidebar();
          }}
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <span className="edge-tab-arrow">›</span>
        </button>
      )}

      {/* Backdrop overlay for drawer dismissal */}
      <div 
        className={`sidebar-backdrop ${isOpenManual ? "active" : ""}`} 
        onClick={closeSidebar} 
      />

      <aside 
        className={`sidebar ${isVisible ? "open" : "closed"}`}
        aria-label="BuildLab Global Navigation"
      >
        <div className="sidebar-container">
          {/* ── ACCOUNT / BRAND HEADER (Anti-Slop Cyber Theme) ── */}
          <div className="sidebar-header">
            {isAdminRoute ? (
              <div className="sidebar-brand-group">
                <div className="sidebar-brand-icon admin">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>

                <Link 
                  to="/admin/inventory" 
                  className="sidebar-brand-link" 
                  onClick={() => { try { soundManager.click(); } catch {} }}
                >
                  <div className="brand-title-row">
                    <span className="brand-title-main">ADMIN DECK</span>
                    <span className="brand-role-tag admin">CONTROL</span>
                  </div>
                  <div className="brand-status-row">
                    <span className="status-live-dot" />
                    <span className="status-live-text">OPERATIONS</span>
                  </div>
                </Link>
              </div>
            ) : (
              <div 
                className="sidebar-account-card" 
                onClick={() => {
                  try { soundManager.click(); } catch {}
                  setShowAccountModal(true);
                }} 
                role="button" 
                tabIndex={0}
                title="Manage Learner Account & Google Cloud Sync"
              >
                <div className="sidebar-account-avatar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="account-avatar-dot" />
                </div>

                <div className="sidebar-account-info">
                  <div className="account-title-row">
                    <span className="account-title-main">{userProfile?.fullName || "Account"}</span>
                    <span className="account-role-tag">{mode === "learn" ? "LEARN" : "EXPLORE"}</span>
                  </div>
                  <div className="account-action-row">
                    <span className="account-action-text">{userProfile?.setupCompleted ? "Verified Profile" : "Mode Setup"}</span>
                    <span className="account-google-tag">{mode === "learn" ? "GOOGLE SYNC" : "OPEN LAB"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="sidebar-header-controls">
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={closeSidebar}
                title="Close Navigation [Esc]"
                aria-label="Close Navigation"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* ── SCROLLABLE NAVIGATION TREE ── */}
          <div className="sidebar-nav-scroll">
            {isAdminRoute ? (
              /* ── ADMIN ROUTE NAVIGATION ── */
              <div className="sidebar-admin-body">
                <div className="sidebar-admin-card">
                  <div className="admin-status-badge">
                    <span className="status-dot"></span>
                    <span>Admin Session Active</span>
                  </div>
                  <p className="admin-status-sub">Hardware Catalog &amp; Operations</p>
                </div>

                <div className="sidebar-nav-group">
                  <div className="sidebar-group-title">OPERATIONS</div>
                  <div className="sidebar-group-links">
                    <Link
                      to="/admin/inventory"
                      onClick={handleLinkClick}
                      className={`sidebar-link ${isInventory ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                      <span>Inventory</span>
                    </Link>


                    <Link
                      to="/admin/crawler"
                      onClick={handleLinkClick}
                      className={`sidebar-link ${isCrawler ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5l-2.1 2.1m-8.8 8.8l-2.1 2.1m0-13l2.1 2.1m8.8 8.8l2.1 2.1"></path>
                      </svg>
                      <span>Crawler Hub</span>
                    </Link>

                    <Link
                      to="/admin/logs"
                      onClick={handleLinkClick}
                      className={`sidebar-link ${isLogs ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <span>System Logs</span>
                    </Link>
                  </div>
                </div>

                <div className="sidebar-nav-group">
                  <div className="sidebar-group-title">HARDWARE STAGES</div>
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
                        onClick={handleLinkClick}
                        className="admin-stage-pill"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="admin-bottom-actions">
                  <Link 
                    to="/" 
                    className="sidebar-return-link"
                    onClick={handleLinkClick}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <span>Public PC Builder</span>
                  </Link>

                  <button 
                    type="button" 
                    className="sidebar-logout-btn"
                    onClick={handleAdminLogout}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ── FRONTEND REGULAR NAVIGATION ── */
              <div className="sidebar-frontend-body">
                <div className="sidebar-nav-group">
                  <div className="sidebar-group-title">WORKSPACE</div>
                  <div className="sidebar-group-links">
                    <a 
                      href="#build-station" 
                      onClick={(e) => { scrollToBuild(e); handleLinkClick(); }} 
                      className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                      </svg>
                      <span>PC Builder</span>
                    </a>

                    <Link 
                      to="/3d-builder" 
                      onClick={handleLinkClick} 
                      className={`sidebar-link ${location.pathname.startsWith("/3d-builder") ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                      <span>3D Studio</span>
                      {mode === "learn" && <span style={{ marginLeft: "auto", fontSize: "11px" }} title="Locked in Learn Track">🔒</span>}
                    </Link>

                    <Link 
                      to="/compatibility" 
                      onClick={handleLinkClick} 
                      className={`sidebar-link ${location.pathname.startsWith("/compatibility") ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <polyline points="9 12 11 14 15 10"/>
                      </svg>
                      <span>Compatibility</span>
                      {mode === "learn" && !unlockedStages.includes("compatibility") && (
                        <span style={{ marginLeft: "auto", fontSize: "11px" }} title="Locked: 7 parts required">🔒</span>
                      )}
                    </Link>

                    <Link 
                      to="/learn" 
                      onClick={handleLinkClick} 
                      className={`sidebar-link ${location.pathname.startsWith("/learn") ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                      <span>Academy &amp; Learn</span>
                      {mode === "learn" && !unlockedStages.includes("learn") && (
                        <span style={{ marginLeft: "auto", fontSize: "11px" }} title="Locked: Complete compatibility check first">🔒</span>
                      )}
                    </Link>

                    {unlockedStages.includes("certificate") && (
                      <Link 
                        to="/certificate" 
                        onClick={handleLinkClick} 
                        className={`sidebar-link ${location.pathname === "/certificate" ? "active" : ""}`}
                      >
                        <span style={{ fontSize: "15px" }}>🎓</span>
                        <span>Certificate</span>
                        <span style={{ marginLeft: "auto", fontSize: "9px", fontWeight: "800", color: "#fbbf24", background: "rgba(251,191,36,0.15)", padding: "2px 6px", borderRadius: "4px" }}>VERIFIED</span>
                      </Link>
                    )}

                    <Link 
                      to="/about" 
                      onClick={handleLinkClick} 
                      className={`sidebar-link ${location.pathname === "/about" ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <span>About Us</span>
                    </Link>
                  </div>
                </div>

                <div className="sidebar-nav-group">
                  <div className="sidebar-group-title">SUPPORT &amp; PORTAL</div>
                  <div className="sidebar-group-links">
                    <Link 
                      to="/help" 
                      onClick={handleLinkClick} 
                      className={`sidebar-link ${location.pathname === "/help" ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <span>Help &amp; Support</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── CLEAN FOOTER CONTROLS ── */}
          <div className="sidebar-footer">
            <div className="sidebar-footer-row">
              <span className="footer-control-label">Appearance</span>
              <button 
                type="button" 
                className="sidebar-pill-toggle"
                onClick={toggleTheme}
                title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              >
                <span>{isDark ? "🌙 Dark" : "☀️ Light"}</span>
              </button>
            </div>

            <div className="sidebar-footer-row">
              <span className="footer-control-label">Audio</span>
              <button 
                type="button" 
                className={`sidebar-pill-toggle ${soundActive ? "active" : ""}`}
                onClick={() => {
                  const next = soundManager.toggleSound();
                  setSoundActive(next);
                }}
                title={soundActive ? "Mute Sound Effects" : "Enable Sound Effects"}
              >
                <span>{soundActive ? "🔊 Live" : "🔇 Muted"}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── LEARNER ACCOUNT & GOOGLE SIGN-IN MODAL ── */}
      <AccountSetupModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onConfirmed={() => {
          setShowAccountModal(false);
          closeSidebar();
        }}
      />
    </>
  );
}

export default Navbar;