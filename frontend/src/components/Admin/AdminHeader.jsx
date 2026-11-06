import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const AdminHeader = ({ breadcrumbCurrent = "Hardware Inventory" }) => {
  const { logoutAdmin } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isInventory = currentPath.includes("/admin/inventory") || currentPath === "/admin";
  const isAdd = currentPath.includes("/admin/add");
  const isEdit = currentPath.includes("/admin/edit");
  const isCrawler = currentPath.includes("/admin/crawler");

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
            to="/admin/add"
            className={`admin-nav-tab ${isAdd ? "active" : ""}`}
            title="Add a new hardware component to catalog"
          >
            <span className="nav-tab-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </span>
            <span className="nav-tab-label">+ Add Component</span>
          </Link>

          <Link
            to="/admin/edit"
            className={`admin-nav-tab ${isEdit ? "active" : ""}`}
            title="Edit specs and manage component deletions"
          >
            <span className="nav-tab-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </span>
            <span className="nav-tab-label">Edit Specs</span>
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
