import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const AdminHeader = ({ breadcrumbCurrent = "Hardware Inventory" }) => {
  const { logoutAdmin } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isInventory = currentPath.includes("/admin/inventory") || currentPath === "/admin";
  const isCrawler = currentPath.includes("/admin/crawler");

  return (
    <header className="admin-header">
      <div className="admin-header-title">
        {/* Top Breadcrumb Navigation */}
        <div className="admin-breadcrumbs">
          <Link to="/" className="breadcrumb-root">BuildLab</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-deck">Admin Deck</span>
          <span className="breadcrumb-sep">&gt;</span>
          <span className="breadcrumb-active">{breadcrumbCurrent}</span>
        </div>

        <div className="admin-title-row">
          <h1>Admin Command Deck</h1>
          <div className="header-status-pill">
            <span className="pulse-indicator-dot"></span>
            <span className="status-label">Engine Online</span>
          </div>
        </div>
      </div>

      <div className="admin-header-actions">
        {/* Route Navigation Switcher Pills */}
        <nav className="admin-route-nav" aria-label="Admin Route Switcher">
          <Link
            to="/admin/inventory"
            className={`admin-nav-tab ${isInventory ? "active" : ""}`}
            title="Browse and edit all hardware components"
          >
            <span className="nav-tab-icon">📦</span>
            <span className="nav-tab-label">Hardware Inventory</span>
          </Link>
          <Link
            to="/admin/crawler"
            className={`admin-nav-tab ${isCrawler ? "active" : ""}`}
            title="Crawler console, terminal monitor, and staging review queue"
          >
            <span className="nav-tab-icon">🕷️</span>
            <span className="nav-tab-label">Crawler & Ingestion Hub</span>
          </Link>
        </nav>

        {/* Logout Action */}
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
