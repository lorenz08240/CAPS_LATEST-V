import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// The sidebar already links to Inventory, Accounts and Team Profiles,
// so the header only carries the two pages the sidebar does not list.
export const AdminHeader = ({ breadcrumbCurrent = "Hardware Inventory" }) => {
  const { logoutAdmin } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCrawler = currentPath.includes("/admin/crawler");
  const isLogs = currentPath.includes("/admin/logs");

  return (
    <header className="admin-header">
      <div className="admin-breadcrumbs">
        <Link to="/admin/inventory" className="breadcrumb-root">Admin</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-active">{breadcrumbCurrent}</span>
      </div>

      <div className="admin-header-actions">
        <nav className="admin-route-nav" aria-label="Admin pages">
          <Link
            to="/admin/crawler"
            className={`admin-nav-tab ${isCrawler ? "active" : ""}`}
          >
            <span className="nav-tab-label">Crawler Hub</span>
          </Link>

          <Link
            to="/admin/logs"
            className={`admin-nav-tab ${isLogs ? "active" : ""}`}
          >
            <span className="nav-tab-label">System Logs</span>
          </Link>
        </nav>

        <button
          type="button"
          className="btn-glass-logout"
          onClick={logoutAdmin}
        >
          Log out
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
