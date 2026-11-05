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
      {/* 1. BRAND / CONTROL DECK HEADER */}
      <div className="admin-sidebar-header">
        <div className="sidebar-brand-box">
          <span className="brand-dot" />
          <span className="brand-subtag">[ ADMIN CONTROL DECK ]</span>
        </div>
        <div className="admin-sidebar-title-row">
          <h2 className="admin-sidebar-title">COMMAND LAB</h2>
          <span className="admin-version-tag">V2.4</span>
        </div>
        <div className="admin-engine-status">
          <span className="status-live-pulse" />
          <span className="status-live-text">ENGINE ONLINE // SECURE</span>
        </div>
      </div>

      {/* 2. CATEGORY STAGES (Parity with User-End Builder Stages) */}
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

      {/* 3. FOOTER CONTROLS */}
      <div className="admin-sidebar-footer">
        <Link to="/" className="sidebar-foot-link" title="Return to Public Student Builder">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Return to Builder</span>
        </Link>

        <button
          type="button"
          className="sidebar-logout-btn"
          onClick={logoutAdmin}
          title="Sign out of Admin Deck"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
