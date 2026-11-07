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

      {/* Footer Return & Logout navigation removed per UI specs */}
    </aside>
  );
};

export default AdminSidebar;
