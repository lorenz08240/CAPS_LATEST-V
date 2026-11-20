import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const AdminHeader = ({ breadcrumbCurrent = "Hardware Inventory" }) => {
  const { logoutAdmin } = useAuth();
  const adminId = sessionStorage.getItem("buildlab_admin_id") || "root";

  return (
    <header className="admin-header">
      <div className="admin-breadcrumbs">
        <Link to="/admin/inventory" className="breadcrumb-root">Admin</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-active">{breadcrumbCurrent}</span>
      </div>

      <div className="admin-header-actions">
        <div className="admin-header-operator-pill">
          <span className="operator-status-dot" aria-hidden="true" />
          <span className="operator-label">Operator:</span>
          <span className="operator-id">{adminId}</span>
        </div>

        <button
          type="button"
          className="btn-glass-logout"
          onClick={logoutAdmin}
          title="Sign out of Admin session"
        >
          Log out
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
