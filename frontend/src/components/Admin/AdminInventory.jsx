import React, { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminLogin from "./AdminLogin";
import AdminHeader from "./AdminHeader";
import EditComponentDrawer from "./EditComponentDrawer";
import HoverImagePreview from "./HoverImagePreview";
import "./Admin.css";

const CATEGORIES = ["all", "gpu", "motherboard", "cpu", "ram", "storage", "case", "psu"];

const CATEGORY_DISPLAY = {
  all: "ALL",
  gpu: "GPU",
  motherboard: "MOTHERBOARD",
  cpu: "CPU",
  ram: "RAM",
  storage: "STORAGE",
  case: "CASE",
  psu: "PSU"
};

// Helper for component age tier and badge
const getComponentAgeInfo = (createdAt) => {
  if (!createdAt) {
    return { type: "older", badgeText: "1mo+", fullLabel: "Over 1 month ago", isRecent24h: false };
  }
  const dateObj = new Date(createdAt);
  if (isNaN(dateObj.getTime())) {
    return { type: "older", badgeText: "1mo+", fullLabel: "Over 1 month ago", isRecent24h: false };
  }
  const now = new Date();
  const diffHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 24 && diffHours >= -1) {
    const hoursAgo = Math.max(1, Math.floor(diffHours));
    return {
      type: "new",
      badgeText: "NEW",
      fullLabel: hoursAgo <= 1 ? "Just added" : `${hoursAgo}h ago`,
      isRecent24h: true
    };
  } else if (diffDays <= 7) {
    const daysAgo = Math.max(1, Math.floor(diffDays));
    return {
      type: "recent",
      badgeText: `${daysAgo}d ago`,
      fullLabel: `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`,
      isRecent24h: false
    };
  } else if (diffDays <= 30) {
    const weeksAgo = Math.max(1, Math.floor(diffDays / 7));
    return {
      type: "weeks",
      badgeText: `${weeksAgo}w ago`,
      fullLabel: `${weeksAgo} week${weeksAgo > 1 ? "s" : ""} ago`,
      isRecent24h: false
    };
  } else {
    const monthsAgo = Math.max(1, Math.floor(diffDays / 30));
    return {
      type: "older",
      badgeText: monthsAgo > 1 ? `${monthsAgo}mo+` : "1mo+",
      fullLabel: `${monthsAgo} month${monthsAgo > 1 ? "s" : ""} ago`,
      isRecent24h: false
    };
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
};

export const AdminInventory = () => {
  const { isAdmin } = useAuth();

  // Inventory parts state
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ text: "", type: "info" });

  // Filtering & Sorting state
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [quickFilter, setQuickFilter] = useState("all"); // "all", "recent24h", "recent7d"
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "name_asc", "name_desc"

  // Pagination state (Strict client-side pagination to eliminate DOM overload)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerInitialData, setDrawerInitialData] = useState(null);

  // Fetch parts from backend
  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/parts");
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();
      const flattened = [];
      for (const cat in data) {
        if (Array.isArray(data[cat])) {
          flattened.push(...data[cat]);
        }
      }
      setParts(flattened);
    } catch (err) {
      console.warn("Could not fetch remote parts, using local state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  // Filtered & Sorted list
  const filteredParts = useMemo(() => {
    let result = parts
      .filter((p) => (activeCategory === "all" ? true : (p.category || "").toLowerCase() === activeCategory))
      .filter((p) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.brand && p.brand.toLowerCase().includes(term)) ||
          (p.desc && p.desc.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term))
        );
      });

    // Quick filter by date / age
    if (quickFilter === "recent24h") {
      result = result.filter((p) => {
        const info = getComponentAgeInfo(p.created_at);
        return info.isRecent24h;
      });
    } else if (quickFilter === "recent7d") {
      result = result.filter((p) => {
        const info = getComponentAgeInfo(p.created_at);
        return info.type === "new" || info.type === "recent";
      });
    }

    // Sort components
    result.sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "oldest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      }
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "name_desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      return 0;
    });

    return result;
  }, [parts, activeCategory, searchTerm, quickFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm, quickFilter, sortBy]);

  // Strict Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredParts.length / PAGE_SIZE));
  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredParts.slice(start, start + PAGE_SIZE);
  }, [filteredParts, currentPage, PAGE_SIZE]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: parts.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== "all") {
        counts[cat] = parts.filter((p) => (p.category || "").toLowerCase() === cat).length;
      }
    });
    return counts;
  }, [parts]);

  // Handle Save from Drawer
  const handleSaveComponent = async (componentData) => {
    const isEdit = Boolean(drawerInitialData && drawerInitialData.id);
    const url = isEdit
      ? `http://localhost:5000/api/parts/${encodeURIComponent(componentData.id)}`
      : "http://localhost:5000/api/parts";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(componentData)
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: Failed to save component`);
    }

    // Update local state immediately
    setParts((prev) => {
      const exists = prev.some((p) => p.id === componentData.id);
      if (exists) {
        return prev.map((p) => (p.id === componentData.id ? { ...p, ...componentData } : p));
      }
      return [{ ...componentData, created_at: new Date().toISOString() }, ...prev];
    });

    setNotification({
      text: isEdit
        ? `Component "${componentData.name}" updated successfully.`
        : `New component "${componentData.name}" onboarded into inventory.`,
      type: "success"
    });
  };

  // Handle Delete
  const handleDeleteComponent = async (part) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${part.name}" (${part.brand}) from hardware inventory?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/parts/${encodeURIComponent(part.id)}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        console.warn("Delete API returned error status:", res.status);
      }
      setParts((prev) => prev.filter((p) => p.id !== part.id));
      setNotification({
        text: `Component "${part.name}" removed from inventory.`,
        type: "success"
      });
    } catch (err) {
      setParts((prev) => prev.filter((p) => p.id !== part.id));
      setNotification({
        text: `Removed "${part.name}" locally.`,
        type: "info"
      });
    }
  };

  // Spec column helper
  const renderSpecData = (part) => {
    const cat = (part.category || "").toLowerCase();
    switch (cat) {
      case "cpu":
        return `${part.socket_type || "Socket —"} / ${part.wattage ? `${part.wattage}W` : "TDP —"}`;
      case "motherboard":
        return `${part.socket_type || "Socket —"} / ${part.ddr_type || "DDR —"}`;
      case "ram":
        return `${part.ddr_type || "DDR"} ${part.capacity || "—"} ${part.speed ? `(${part.speed})` : ""}`;
      case "storage":
        return `${part.capacity || "Storage"} ${part.type ? `(${part.type})` : ""}`;
      case "gpu":
        return part.power_required ? `${part.power_required}W TDP` : "PCIe GPU";
      case "psu":
        return `${part.wattage ? `${part.wattage}W` : "PSU"} ${part.efficiency ? `(${part.efficiency})` : ""}`;
      case "case":
        return part.form_factor || "ATX Mid Tower";
      default:
        return "—";
    }
  };

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-page-wrapper">
      <div className="organic-waves-overlay" aria-hidden="true">
        <div className="wave-glow wave-glow-gold"></div>
        <div className="wave-glow wave-glow-burgundy"></div>
        <div className="wave-glow wave-glow-cyan"></div>
      </div>

      <div className="admin-page">
        {/* Top Header & Breadcrumbs */}
        <AdminHeader breadcrumbCurrent="Hardware Inventory" />

        {/* Notification Toast */}
        {notification.text && (
          <div className={`message-toast ${notification.type}`}>
            <span>{notification.text}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setNotification({ text: "", type: "info" })}
            >
              &times;
            </button>
          </div>
        )}

        {/* FULL-BLEED 100% WIDTH TABLE LAYOUT CONTAINER */}
        <div className="inventory-fullbleed-wrapper">
          {/* TOP ACTION ROW */}
          <div className="inventory-top-action-row">
            <div className="search-filter-controls">
              {/* Search Input */}
              <div className="inventory-search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder={`Search ${activeCategory === "all" ? "entire inventory" : activeCategory.toUpperCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search hardware inventory"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchTerm("")}
                    title="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="inventory-sort-dropdown">
                <label htmlFor="inv-sort" className="sort-label">Sort:</label>
                <select
                  id="inv-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="admin-sort-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                </select>
              </div>

              {/* Quick Age Filters */}
              <div className="quick-filter-pills">
                <button
                  type="button"
                  className={`quick-pill ${quickFilter === "all" ? "active" : ""}`}
                  onClick={() => setQuickFilter("all")}
                >
                  All ({filteredParts.length})
                </button>
                <button
                  type="button"
                  className={`quick-pill pill-new ${quickFilter === "recent24h" ? "active" : ""}`}
                  onClick={() => setQuickFilter("recent24h")}
                >
                  New (&lt;24h)
                </button>
                <button
                  type="button"
                  className={`quick-pill pill-week ${quickFilter === "recent7d" ? "active" : ""}`}
                  onClick={() => setQuickFilter("recent7d")}
                >
                  Recent (&le;7d)
                </button>
              </div>
            </div>

            {/* + Add New Component Primary Action */}
            <div className="inventory-primary-action">
              <button
                type="button"
                className="btn-add-component-neon"
                onClick={() => {
                  setDrawerInitialData(null);
                  setIsDrawerOpen(true);
                }}
              >
                <span className="btn-plus-icon">+</span>
                <span>Add New Component</span>
              </button>
            </div>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="category-tabs-wrapper">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`category-tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {CATEGORY_DISPLAY[cat]} ({count})
                </button>
              );
            })}
          </div>

          {/* FULL-BLEED INVENTORY TABLE PANEL */}
          <div className="admin-panel glass-card-panel inventory-table-panel">
            <div className="table-meta-bar">
              <div className="table-meta-title">
                <h2>
                  Component Inventory{" "}
                  <span className="count-tag">
                    {filteredParts.length} {filteredParts.length === 1 ? "Item" : "Items"}
                  </span>
                </h2>
              </div>
              <div className="table-meta-range">
                Showing {filteredParts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredParts.length)} of {filteredParts.length}
              </div>
            </div>

            <div className="table-container fullbleed-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "52px", textAlign: "center" }}>ICON</th>
                    <th style={{ width: "13%" }}>BRAND</th>
                    <th style={{ width: "30%" }}>NAME / MODEL</th>
                    <th style={{ width: "23%" }}>SPECS / MATRIX</th>
                    <th style={{ width: "16%", textAlign: "center" }}>AGE TIER</th>
                    <th style={{ width: "18%", textAlign: "center" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedParts.map((part) => {
                    const ageInfo = getComponentAgeInfo(part.created_at);
                    const cat = (part.category || "case").toLowerCase();

                    return (
                      <tr
                        key={part.id}
                        className={ageInfo.isRecent24h ? "row-highlight-new" : ""}
                      >
                        {/* ICON / LAZY HOVER THUMBNAIL */}
                        <td style={{ textAlign: "center" }}>
                          <HoverImagePreview
                            category={cat}
                            imageUrl={part.img}
                            name={part.name}
                            brand={part.brand}
                            size={36}
                          />
                        </td>

                        {/* BRAND */}
                        <td className="part-brand-cell">
                          <span className="brand-badge-pill">
                            {part.brand ? part.brand.toUpperCase() : "GENERIC"}
                          </span>
                        </td>

                        {/* NAME & CATEGORY TAG */}
                        <td className="part-name-cell">
                          <div className="part-name-text" title={part.name}>
                            {part.name}
                          </div>
                          <div className="part-submeta">
                            <span className={`cat-inline-badge cat-${cat}`}>
                              {cat.toUpperCase()}
                            </span>
                            {part.desc && (
                              <span className="desc-snippet" title={part.desc}>
                                {part.desc.slice(0, 48)}
                                {part.desc.length > 48 ? "…" : ""}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* SPECS */}
                        <td className="spec-cell">
                          <span className="spec-pill">{renderSpecData(part)}</span>
                        </td>

                        {/* AGE BADGE */}
                        <td className="part-age-cell">
                          <div className="age-badge-wrapper">
                            <span
                              className={`badge-age badge-age-${ageInfo.type}`}
                              title={`Added: ${formatDate(part.created_at)}`}
                            >
                              {ageInfo.badgeText}
                            </span>
                            <span className="age-sublabel">{ageInfo.fullLabel}</span>
                          </div>
                        </td>

                        {/* ACTIONS (EDIT & DELETE) */}
                        <td style={{ textAlign: "center" }}>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="sleek-block-action-btn edit-block-btn"
                              title={`Edit ${part.name}`}
                              onClick={() => {
                                setDrawerInitialData(part);
                                setIsDrawerOpen(true);
                              }}
                            >
                              <span className="btn-label">Edit</span>
                            </button>
                            <button
                              type="button"
                              className="sleek-block-action-btn delete-block-btn"
                              title={`Delete ${part.name}`}
                              onClick={() => handleDeleteComponent(part)}
                            >
                              <span className="btn-label">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredParts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="table-empty-cell">
                        {loading ? (
                          <div className="loading-state">Synchronizing hardware inventory...</div>
                        ) : searchTerm ? (
                          <div>No components matched your search term "{searchTerm}".</div>
                        ) : (
                          <div>No components found in category {activeCategory.toUpperCase()}.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* STRICT CLIENT-SIDE PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  type="button"
                  className="page-btn page-nav"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  &larr; Prev
                </button>

                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`page-num-btn ${currentPage === num ? "active" : ""}`}
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="page-btn page-nav"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SLIDING RIGHT DRAWER (Rendered via React Portal in document.body) */}
      <EditComponentDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setDrawerInitialData(null);
        }}
        initialData={drawerInitialData}
        onSave={handleSaveComponent}
      />
    </div>
  );
};

export default AdminInventory;
