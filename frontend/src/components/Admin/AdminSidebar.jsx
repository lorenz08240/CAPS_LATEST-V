import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Admin.css";

const CATEGORIES = [
  { key: "all", label: "All Components", step: "00", desc: "Complete Inventory" },
  { key: "case", label: "PC Case", step: "01", desc: "Chassis & Towers" },
  { key: "motherboard", label: "Motherboard", step: "02", desc: "Sockets & Chipsets" },
  { key: "cpu", label: "CPU (Processor)", step: "03", desc: "Silicon Core" },
  { key: "ram", label: "RAM (Memory)", step: "04", desc: "DDR Modules" },
  { key: "storage", label: "Storage", step: "05", desc: "NVMe & SATA" },
  { key: "gpu", label: "GPU (Graphics)", step: "06", desc: "Discrete Video" },
  { key: "psu", label: "Power Supply", step: "07", desc: "ATX / Modular" }
];

export const AdminSidebar = ({
  activeCategory = "all",
  onSelectCategory,
  categoryCounts = {}
}) => {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isInventory = location.pathname.includes("/admin/inventory") || location.pathname === "/admin";
  const isAccounts = location.pathname.includes("/admin/accounts");
  const isContent = location.pathname.includes("/admin/content");

  const handleCategoryClick = (catKey) => {
    if (onSelectCategory) {
      onSelectCategory(catKey);
    }
    if (!isInventory) {
      navigate(`/admin/inventory?category=${catKey}`);
    }
  };

  return (
    <aside className="admin-sidebar" aria-label="Admin Navigation Sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-brand-group">
          <div className="admin-sidebar-brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="admin-sidebar-brand-text">
            <div className="admin-brand-title-row">
              <span className="admin-brand-title-main">BUILDLAB</span>
              <span className="admin-brand-role-tag">ADMIN</span>
              <span className="admin-brand-version-tag">v1.0.4</span>
            </div>
            <div className="admin-brand-status-row">
              <span className="admin-brand-status-dot" />
              <span className="admin-brand-status-text">CONTROL PANEL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Management Section */}
      <div className="admin-sidebar-section management-section">
        <div className="admin-section-tag">
          <span className="tag-bracket">[</span>
          <span className="tag-text">MANAGEMENT</span>
          <span className="tag-bracket">]</span>
        </div>

        <div className="admin-management-list">
          <Link
            to="/admin/accounts"
            className={`admin-mgmt-item ${isAccounts ? "active" : ""}`}
            title="Manage admin accounts, security passcodes, and avatars"
          >
            <div className="mgmt-item-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <div className="mgmt-item-info">
              <div className="mgmt-item-title">Account Manager</div>
              <div className="mgmt-item-desc">Admin Roles &amp; Security</div>
            </div>
          </Link>

          <Link
            to="/admin/content"
            className={`admin-mgmt-item ${isContent ? "active" : ""}`}
            title="Manage developer dossiers, photos, and auto-sync with About Us"
          >
            <div className="mgmt-item-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div className="mgmt-item-info">
              <div className="mgmt-item-title">Content Management</div>
              <div className="mgmt-item-desc">Operatives &amp; Profile Photos</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Hardware Inventory Stages */}
      <div className="admin-sidebar-section categories-section">
        <div className="admin-section-tag">
          <span className="tag-bracket">[</span>
          <span className="tag-text">INVENTORY STAGES</span>
          <span className="tag-bracket">]</span>
        </div>

        <div className="admin-category-list">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.key] ?? (cat.key === "all" ? categoryCounts.all : 0) ?? 0;
            const isSelected = isInventory && activeCategory === cat.key;

            return (
              <div
                key={cat.key}
                className={`admin-category-item ${isSelected ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCategoryClick(cat.key);
                  }
                }}
              >
                <div className="category-step-badge">
                  <span>{cat.step}</span>
                </div>
                <div className="category-info">
                  <div className="category-title">{cat.label}</div>
                  <div className="category-desc">{cat.desc}</div>
                </div>
                <div className="category-count-badge">
                  <span>{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
