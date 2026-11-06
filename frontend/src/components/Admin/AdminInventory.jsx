import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../utilities/api";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
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
  } catch {
    return dateStr;
  }
};

export const AdminInventory = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scrapedQueueCount, setScrapedQueueCount] = useState(0);

  // Directly derive active category from URL search parameters
  const rawCat = (searchParams.get("category") || "all").toLowerCase();
  const activeCategory = CATEGORIES.includes(rawCat) ? rawCat : "all";

  const handleSelectCategory = (cat) => {
    setCurrentPage(1);
    if (cat === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [quickFilter, setQuickFilter] = useState("all"); // "all", "recent24h", "recent7d"
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "name_asc", "name_desc"

  // Pagination state (Strict client-side pagination to eliminate DOM overload)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerInitialData, setDrawerInitialData] = useState(null);

  // Inventory parts state
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ text: "", type: "info" });

  // Fetch pending review count for the sidebar badge
  useEffect(() => {
    let ignore = false;
    apiFetch("/api/scraped-queue")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!ignore && Array.isArray(data)) setScrapedQueueCount(data.length);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch parts from backend
  useEffect(() => {
    let ignore = false;
    apiFetch("/api/parts")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (ignore) return;
        const flattened = [];
        for (const cat in data) {
          if (Array.isArray(data[cat])) {
            flattened.push(...data[cat]);
          }
        }
        setParts(flattened);
        setLoading(false);
      })
      .catch((err) => {
        if (!ignore) {
          console.warn("Could not fetch remote parts, using local state:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
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

  // Strict Pagination calculations with automatic clamp (no cascading render effect)
  const totalPages = Math.max(1, Math.ceil(filteredParts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedParts = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredParts.slice(start, start + PAGE_SIZE);
  }, [filteredParts, safeCurrentPage, PAGE_SIZE]);

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
    const endpoint = isEdit
      ? `/api/parts/${encodeURIComponent(componentData.id)}`
      : "/api/parts";
    const method = isEdit ? "PUT" : "POST";

    const res = await apiFetch(endpoint, {
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
      <div className="admin-layout-container">
        <AdminSidebar
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          categoryCounts={categoryCounts}
          onOpenAddDrawer={() => {
            setDrawerInitialData(null);
            setIsDrawerOpen(true);
          }}
          scrapedQueueCount={scrapedQueueCount}
        />

        <main className="admin-main-content">
        <AdminHeader breadcrumbCurrent="Hardware Inventory" />

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

        <div className="inventory-fullbleed-wrapper">
          <div className="inventory-top-action-row">
            <div className="search-filter-controls">
              <div className="inventory-search-box">
                <span className="search-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>
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

            <div className="inventory-primary-action">
              <Link
                to="/admin/add"
                className="btn-add-component-neon"
                title="Open dedicated Add Component screen"
              >
                <span className="btn-plus-icon">+</span>
                <span>Add New Component</span>
              </Link>
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
                        <td style={{ textAlign: "center" }}>
                          <HoverImagePreview
                            category={cat}
                            imageUrl={part.img}
                            name={part.name}
                            brand={part.brand}
                            size={36}
                          />
                        </td>

                        <td className="part-brand-cell">
                          <span className="brand-badge-pill">
                            {part.brand ? part.brand.toUpperCase() : "GENERIC"}
                          </span>
                        </td>

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

                        <td className="spec-cell">
                          <span className="spec-pill">{renderSpecData(part)}</span>
                        </td>

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

                        <td style={{ textAlign: "center" }}>
                          <div className="table-actions">
                            <Link
                              to={`/admin/edit?id=${encodeURIComponent(part.id)}`}
                              className="sleek-block-action-btn edit-block-btn"
                              title={`Open editor and specs for ${part.name}`}
                            >
                              <span className="btn-label">Edit</span>
                            </Link>
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
        </main>
      </div>

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
