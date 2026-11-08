import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const AdminHeader = ({ breadcrumbCurrent = "Hardware Inventory" }) => {
  const { logoutAdmin } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isInventory = currentPath.includes("/admin/inventory") || currentPath === "/admin";
  const isCrawler = currentPath.includes("/admin/crawler");
  const isLogs = currentPath.includes("/admin/logs");
  const isAccounts = currentPath.includes("/admin/accounts");
  const isContent = currentPath.includes("/admin/content");

  return (
    <header className="admin-header">
      <div className="admin-breadcrumbs">
        <Link to="/" className="breadcrumb-root">BuildLab</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-deck">Admin Deck</span>
        <span className="breadcrumb-sep">&gt;</span>
        <span className="breadcrumb-active">{breadcrumbCurrent}</span>
      </div>

      <div className="admin-header-actions">
        <nav className="admin-route-nav" aria-label="Admin Route Switcher">
          <Link
            to="/admin/inventory"
            className={`admin-nav-tab ${isInventory ? "active" : ""}`}
            title="Browse and search all hardware components"
          >
            <span className="nav-tab-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </span>
            <span className="nav-tab-label">Inventory</span>
          </Link>

          <Link
            to="/admin/crawler"
            className={`admin-nav-tab ${isCrawler ? "active" : ""}`}
            title="Crawler console, terminal monitor, and staging review queue"
          >
            <span className="nav-tab-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5l-2.1 2.1m-8.8 8.8l-2.1 2.1m0-13l2.1 2.1m8.8 8.8l2.1 2.1"></path>
              </svg>
            </span>
            <span className="nav-tab-label">Crawler Hub</span>
          </Link>

          <Link
            to="/admin/logs"
            className={`admin-nav-tab ${isLogs ? "active" : ""}`}
            title="System logs, audit trails, and live engine status"
          >
            <span className="nav-tab-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            <span className="nav-tab-label">System Logs</span>
          </Link>

          <Link
            to="/admin/accounts"
            className={`admin-nav-tab ${isAccounts ? "active" : ""}`}
            title="Account manager, admin roles, and credentials"
          >
            <span className="nav-tab-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </span>
            <span className="nav-tab-label">Accounts</span>
          </Link>

          <Link
            to="/admin/content"
            className={`admin-nav-tab ${isContent ? "active" : ""}`}
            title="Content management, operative profiles, and photo sync"
          >
            <span className="nav-tab-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </span>
            <span className="nav-tab-label">Content</span>
          </Link>
        </nav>

        <button
          type="button"
          className="btn-glass-logout"
          onClick={logoutAdmin}
          title="Sign out of Admin Deck"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
