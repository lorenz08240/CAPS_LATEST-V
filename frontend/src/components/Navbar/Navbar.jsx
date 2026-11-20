import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import soundManager from "../../utilities/soundManager";
import AccountSetupModal from "../Home/AccountSetupModal";
import "./Navbar.css";

function Navbar({ isPinned: propsIsPinned }) {
  const { isAdmin, logoutAdmin } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { mode, userProfile, unlockedStages, logoutLearner } = useLearnMode();
  const { t } = useLanguage();
  const sidebarCtx = useSidebar();

  // Prefer context state, falling back to props if provided
  const isPinned = false; // Pin feature removed per design simplification
  const isOpenManual = sidebarCtx.isOpenManual;
  const closeSidebar = sidebarCtx.closeSidebar;
  const openSidebar = sidebarCtx.openSidebar;

  const [soundActive, setSoundActive] = useState(() => soundManager.enabled);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountSubmenuOpen, setAccountSubmenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const subpanelRef = useRef(null);
  const accountCardRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminLogin = location.pathname === "/admin/login" || location.pathname.startsWith("/admin/login");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isVisible = isOpenManual;

  // Auto-dismiss sidebar if navigating to admin login screen
  useEffect(() => {
    if (isAdminLogin && isOpenManual) {
      closeSidebar();
    }
  }, [isAdminLogin, isOpenManual, closeSidebar]);

  // Reset account sub-menu when the sidebar drawer closes
  useEffect(() => {
    if (!isOpenManual) {
      setAccountSubmenuOpen(false);
    }
  }, [isOpenManual]);

  // Dismiss popup when clicking outside or pressing Escape
  useEffect(() => {
    if (!accountSubmenuOpen) return;
    const handleClickOutside = (e) => {
      if (
        subpanelRef.current &&
        !subpanelRef.current.contains(e.target) &&
        accountCardRef.current &&
        !accountCardRef.current.contains(e.target)
      ) {
        setAccountSubmenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setAccountSubmenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountSubmenuOpen]);

  // Sidebar is strictly disabled on the admin login screen until the operator enters first
  if (isAdminLogin) {
    return null;
  }

  const handleLinkClick = () => {
    if (!isPinned) {
      closeSidebar();
    }
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate("/");
  };

  const currentPath = location.pathname;
  const isInventory = currentPath.includes("/admin/inventory") || currentPath === "/admin";
  const isCrawler = currentPath.includes("/admin/crawler");
  const isLogs = currentPath.includes("/admin/logs");
  const isAccounts = currentPath.includes("/admin/accounts");
  const isContent = currentPath.includes("/admin/content");

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
          <span className="edge-tab-arrow" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
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
            {isAdmin && isAdminRoute ? (
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
                  onClick={() => { try { soundManager.click(); } catch { } }}
                >
                  <div className="brand-title-row">
                    <span className="brand-title-main">BUILDLAB</span>
                    <span className="brand-role-tag admin">ADMIN</span>
                  </div>
                </Link>
              </div>
            ) : userProfile?.setupCompleted ? (
              <div
                ref={accountCardRef}
                className={`sidebar-account-card ${accountSubmenuOpen ? "expanded" : ""}`}
                onClick={() => {
                  try { soundManager.click(); } catch { }
                  setAccountSubmenuOpen((prev) => !prev);
                }}
                role="button"
                tabIndex={0}
                aria-expanded={accountSubmenuOpen}
                title="Account & Settings"
              >
                <div className="sidebar-account-avatar">
                  {userProfile?.photo ? (
                    <img src={userProfile.photo} alt={userProfile.fullName || "User"} className="sidebar-account-avatar-img" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  <span className={`account-avatar-dot ${userProfile?.setupCompleted ? "online" : ""}`} />
                </div>

                <div className="sidebar-account-info">
                  <div className="account-title-row">
                    <span className="account-title-main" title={userProfile?.setupCompleted && userProfile?.fullName ? userProfile.fullName : "Guest / Open Lab"}>
                      {userProfile?.setupCompleted && userProfile?.fullName ? userProfile.fullName : "Guest / Open Lab"}
                    </span>
                  </div>
                  <div className="account-action-row">
                    <span className={`account-status-dot ${userProfile?.setupCompleted ? "is-verified" : ""}`} aria-hidden="true" />
                    <span className="account-action-text">
                      {userProfile?.setupCompleted ? "Google Sync" : "Connect to save work"}
                    </span>
                  </div>
                </div>

                <div className={`sidebar-account-arrow ${accountSubmenuOpen ? "open" : ""}`} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="sidebar-signin-card"
                onClick={() => {
                  try { soundManager.click(); } catch {}
                  setShowAccountModal(true);
                }}
                aria-label="Sign in to your student account"
              >
                <span className="sidebar-signin-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </span>
                <span className="sidebar-signin-label">SIGN IN</span>
                <span className="sidebar-signin-arrow" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </button>
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

          {/* ── ACCOUNT FLOATING POPOVER (Anti-Slop Single-Line Layout) ── */}
          {accountSubmenuOpen && !isAdminRoute && userProfile?.setupCompleted && (
            <div
              className="sidebar-account-subpanel"
              ref={subpanelRef}
              role="region"
              aria-label="Account Settings"
            >
              <div className="subpanel-menu-list">
                {/* 1. Dashboard */}
                <Link
                  to="/dashboard"
                  className="subpanel-menu-item"
                  onClick={(e) => {
                    try { soundManager.click(); } catch { }
                    closeSidebar();
                    setAccountSubmenuOpen(false);
                    if (location.pathname === "/learn" || location.pathname.startsWith("/learn")) {
                      e.preventDefault();
                      window.dispatchEvent(
                        new CustomEvent("buildlab:toggle-dashboard", { detail: { open: true } })
                      );
                    }
                  }}
                  title="Dashboard"
                >
                  <div className="subpanel-icon-box">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9" />
                      <rect x="14" y="3" width="7" height="5" />
                      <rect x="14" y="12" width="7" height="9" />
                      <rect x="3" y="16" width="7" height="5" />
                    </svg>
                  </div>
                  <span className="subpanel-item-label">Dashboard</span>
                  <svg className="subpanel-nav-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>

                {/* 2. Settings */}
                <Link
                  to="/settings"
                  className="subpanel-menu-item"
                  onClick={() => {
                    try { soundManager.click(); } catch { }
                    closeSidebar();
                    setAccountSubmenuOpen(false);
                  }}
                  title="Settings"
                >
                  <div className="subpanel-icon-box settings">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </div>
                  <span className="subpanel-item-label">{t("settings", "Settings")}</span>
                  <svg className="subpanel-nav-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>

                {/* 3. Log Out */}
                {(userProfile?.setupCompleted || mode === "learn") && (
                  <button
                    type="button"
                    className="subpanel-menu-item logout"
                    onClick={() => {
                      try { soundManager.warning(); } catch { }
                      setShowLogoutConfirm(true);
                    }}
                    title="Log Out"
                  >
                    <div className="subpanel-icon-box logout">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </div>
                    <span className="subpanel-item-label logout">{t("logout", "Log Out")}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── SCROLLABLE NAVIGATION TREE ── */}
          <div className="sidebar-nav-scroll">
            {isAdmin && isAdminRoute ? (
              /* ── ADMIN ROUTE NAVIGATION ── */
              <div className="sidebar-admin-body">
                <div className="sidebar-nav-group">
                  <div className="sidebar-group-title">Manage</div>
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
                      to="/admin/accounts"
                      onClick={handleLinkClick}
                      className={`sidebar-link ${isAccounts ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                      </svg>
                      <span>Accounts</span>
                    </Link>

                    <Link
                      to="/admin/content"
                      onClick={handleLinkClick}
                      className={`sidebar-link ${isContent ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      <span>Team Profiles</span>
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
                </div>
              </div>
            ) : (
              /* ── FRONTEND REGULAR NAVIGATION ── */
              <div className="sidebar-frontend-body">
                <div className="sidebar-nav-group">
                  <div className="sidebar-group-title">Workspace</div>
                  <div className="sidebar-group-links">
                    <Link
                      to="/learn"
                      onClick={handleLinkClick}
                      className={`sidebar-link ${location.pathname.startsWith("/learn") ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      <span>Academy &amp; Learn</span>
                    </Link>
                  </div>
                </div>

                <div className="sidebar-nav-group">
                  <div className="sidebar-group-title">Support</div>
                  <div className="sidebar-group-links">
                    <Link
                      to="/help"
                      onClick={handleLinkClick}
                      className={`sidebar-link ${location.pathname === "/help" ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>Help &amp; Support</span>
                    </Link>

                    <Link
                      to="/privacy"
                      onClick={handleLinkClick}
                      className={`sidebar-link ${location.pathname === "/privacy" || location.pathname === "/privacy-policy" ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Privacy Policy</span>
                    </Link>

                    <Link
                      to="/terms"
                      onClick={handleLinkClick}
                      className={`sidebar-link ${location.pathname === "/terms" || location.pathname === "/terms-of-service" ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <span>Terms of Service</span>
                    </Link>

                    <Link
                      to="/cookies"
                      onClick={handleLinkClick}
                      className={`sidebar-link ${location.pathname === "/cookies" || location.pathname === "/cookie-policy" ? "active" : ""}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="8.5" cy="9.5" r="1" />
                        <circle cx="15" cy="10.5" r="1" />
                        <circle cx="10.5" cy="15.5" r="1" />
                      </svg>
                      <span>Cookie Policy</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── CLEAN FOOTER CONTROLS ── */}
          <div className="sidebar-footer">
            <div className="sidebar-footer-row">
              <span className="footer-control-label">Theme</span>
              <div
                className="sidebar-theme-switch-group"
                role="radiogroup"
                aria-label="Theme Mode Selection"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={isDark}
                  className={`theme-segment-btn ${isDark ? "active" : ""}`}
                  onClick={() => {
                    if (!isDark) toggleTheme();
                  }}
                  title="Switch to Dark Mode"
                >
                  <span className="theme-btn-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </span>
                  <span className="theme-btn-label">Dark</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={!isDark}
                  className={`theme-segment-btn ${!isDark ? "active" : ""}`}
                  onClick={() => {
                    if (isDark) toggleTheme();
                  }}
                  title="Switch to Light Mode"
                >
                  <span className="theme-btn-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  </span>
                  <span className="theme-btn-label">Light</span>
                </button>
              </div>
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
                {soundActive ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <span>Live</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                    <span>Muted</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── LEARNER LOGOUT / SWITCH TO FREE MODE CONFIRMATION DIALOG ── */}
      {showLogoutConfirm && (
        <div className="sidebar-logout-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="sidebar-logout-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="logout-dialog-header">
              <h4 className="logout-dialog-title">Log Out</h4>
            </div>
            <p className="logout-dialog-desc">
              Returning to Free Mode will clear active parts and restart the website from the top. Your student coursework is safely saved.
            </p>
            <div className="logout-dialog-actions">
              <button
                type="button"
                className="logout-action-btn cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                type="button"
                className="logout-action-btn confirm"
                onClick={() => {
                  try { soundManager.click(); } catch { }
                  setShowLogoutConfirm(false);
                  setAccountSubmenuOpen(false);
                  logoutLearner();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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