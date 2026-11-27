import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import DiscreetFullscreenToggle from "../Navigation/DiscreetFullscreenToggle";
import "./styles/AdminBase.css";

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

let inventoryOpenPersisted = false;

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
  const isCrawler = location.pathname.includes("/admin/crawler");
  const isLogs = location.pathname.includes("/admin/logs");

  const [inventoryOpen, setInventoryOpen] = useState(() => isInventory && inventoryOpenPersisted);
  const [fetchedCounts, setFetchedCounts] = useState({});

  useEffect(() => {
    if (categoryCounts && Object.keys(categoryCounts).length > 0) {
      return;
    }
    let isMounted = true;
    fetch("/api/parts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        let total = 0;
        const counts = {};
        Object.keys(data).forEach((cat) => {
          const c = (data[cat] || []).length;
          counts[cat] = c;
          total += c;
        });
        counts.all = total;
        setFetchedCounts(counts);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [categoryCounts]);

  const effectiveCounts =
    categoryCounts && Object.keys(categoryCounts).length > 0
      ? categoryCounts
      : fetchedCounts;

  const handleCategoryClick = (catKey) => {
    if (onSelectCategory) {
      onSelectCategory(catKey);
    }
    if (!isInventory) {
      navigate(`/admin/inventory?category=${catKey}`);
    }
  };

  const handleInventoryToggle = () => {
    const nextOpen = !inventoryOpen;
    inventoryOpenPersisted = nextOpen;
    setInventoryOpen(nextOpen);
    if (nextOpen) {
      handleCategoryClick("all");
    }
  };

  const handleSectionChange = () => {
    inventoryOpenPersisted = false;
    setInventoryOpen(false);
  };

  useEffect(() => {
    if (!isInventory) {
      inventoryOpenPersisted = false;
      setInventoryOpen(false);
    }
  }, [isInventory]);

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
            </div>
          </div>
        </div>
      </div>

      {/* Admin Operations Section */}
      <div className="admin-sidebar-section operations-section">
        <div className="admin-section-tag">
          <span className="tag-text">Operations</span>
        </div>

        {/* Hardware Inventory Accordion */}
        <button
          type="button"
          className={`admin-inventory-toggle ${isInventory ? "active" : ""}`}
          onClick={handleInventoryToggle}
          aria-expanded={inventoryOpen}
        >
          <span className="inventory-toggle-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>
          <span className="inventory-toggle-label">Inventory</span>
          <span className="inventory-toggle-count">{effectiveCounts.all ?? 0}</span>
          <svg
            className={`inventory-toggle-chevron ${inventoryOpen ? "open" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {inventoryOpen && (
          <div className="admin-category-list">
            {CATEGORIES.map((cat) => {
              const count = effectiveCounts[cat.key] ?? (cat.key === "all" ? effectiveCounts.all : 0) ?? 0;
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
        )}

        {/* Crawler Hub Menu Item */}
        <Link
          to="/admin/crawler"
          className={`admin-mgmt-item ${isCrawler ? "active" : ""}`}
          onClick={handleSectionChange}
        >
          <div className="mgmt-item-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <div className="mgmt-item-info">
            <div className="mgmt-item-title">Crawler Hub</div>
            <div className="mgmt-item-desc">Hardware scrapers &amp; queue</div>
          </div>
        </Link>

        {/* System Logs Menu Item */}
        <Link
          to="/admin/logs"
          className={`admin-mgmt-item ${isLogs ? "active" : ""}`}
          onClick={handleSectionChange}
        >
          <div className="mgmt-item-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="mgmt-item-info">
            <div className="mgmt-item-title">System Logs</div>
            <div className="mgmt-item-desc">Security &amp; audit telemetry</div>
          </div>
        </Link>
      </div>

      {/* Admin Management Section */}
      <div className="admin-sidebar-section management-section">
        <div className="admin-section-tag">
          <span className="tag-text">Management</span>
        </div>

        <div className="admin-management-list">
          <Link
            to="/admin/accounts"
            className={`admin-mgmt-item ${isAccounts ? "active" : ""}`}
            onClick={handleSectionChange}
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
              <div className="mgmt-item-title">Accounts</div>
              <div className="mgmt-item-desc">Root admin &amp; learners</div>
            </div>
          </Link>

          <Link
            to="/admin/content"
            className={`admin-mgmt-item ${isContent ? "active" : ""}`}
            onClick={handleSectionChange}
          >
            <div className="mgmt-item-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="mgmt-item-info">
              <div className="mgmt-item-title">Developer Profiles</div>
              <div className="mgmt-item-desc">About Us developer cards</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Sidebar Footer with Clean Actions */}
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-footer-row">
          <Link to="/" className="admin-sidebar-return-link" title="Return to Student PC Builder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Student Builder</span>
          </Link>
          <DiscreetFullscreenToggle variant="sidebar" />
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
