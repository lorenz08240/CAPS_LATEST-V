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

  // Inventory View Mode ("active" by default, or "archived")
  const [inventoryViewMode, setInventoryViewMode] = useState("active");

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerInitialData, setDrawerInitialData] = useState(null);

  // Delete & Archive modal states with two-step "type confirm"
  const [componentToDelete, setComponentToDelete] = useState(null);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  const [confirmStep, setConfirmStep] = useState(1); // 1 = initial confirm button, 2 = type "confirm"
  const [typeConfirmationInput, setTypeConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Inventory parts state
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ text: "", type: "info" });

  // Close delete modal on Escape key press
  useEffect(() => {
    if (!componentToDelete) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isDeleting) {
        setComponentToDelete(null);
        setConfirmStep(1);
        setTypeConfirmationInput("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [componentToDelete, isDeleting]);

  // Persist current location for admin so accidental tab closure restores exact state after re-login
  useEffect(() => {
    try {
      localStorage.setItem("buildlab_admin_last_location", window.location.pathname + window.location.search);
    } catch {}
  }, [activeCategory, inventoryViewMode, searchParams]);

  // Auto-open drawer when deep-linked or redirected with ?action=add or ?edit=id or ?id=id
  useEffect(() => {
    const action = searchParams.get("action");
    const editId = searchParams.get("edit") || searchParams.get("id");
    if (action === "add") {
      setDrawerInitialData(null);
      setIsDrawerOpen(true);
    } else if (editId && parts.length > 0) {
      const match = parts.find((p) => String(p.id).toLowerCase() === String(editId).toLowerCase());
      if (match) {
        setDrawerInitialData(match);
        setIsDrawerOpen(true);
      }
    }
  }, [searchParams, parts]);

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

  // Fetch parts from backend (including archived flag so admin can toggle between active and archived)
  useEffect(() => {
    let ignore = false;
    apiFetch("/api/parts?include_archived=true")
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

  // Active vs Archived counts
  const activePartsCount = useMemo(() => parts.filter((p) => !p.is_archived).length, [parts]);
  const archivedPartsCount = useMemo(() => parts.filter((p) => Boolean(p.is_archived)).length, [parts]);

  // Filtered & Sorted list (Main View: displays active components by default; Archived view: displays archived components)
  const filteredParts = useMemo(() => {
    let result = parts
      .filter((p) => (inventoryViewMode === "archived" ? Boolean(p.is_archived) : !p.is_archived))
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

    // Quick filter by date / age (for active view)
    if (inventoryViewMode === "active") {
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
  }, [parts, inventoryViewMode, activeCategory, searchTerm, quickFilter, sortBy]);

  // Strict Pagination calculations with automatic clamp (no cascading render effect)
  const totalPages = Math.max(1, Math.ceil(filteredParts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedParts = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredParts.slice(start, start + PAGE_SIZE);
  }, [filteredParts, safeCurrentPage, PAGE_SIZE]);

  // Category counts (Active components only)
  const categoryCounts = useMemo(() => {
    const activeList = parts.filter((p) => !p.is_archived);
    const counts = { all: activeList.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== "all") {
        counts[cat] = activeList.filter((p) => (p.category || "").toLowerCase() === cat).length;
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

  // Restore archived component to active inventory
  const handleRestoreComponent = async (part) => {
    try {
      const res = await apiFetch(`/api/parts/${encodeURIComponent(part.id)}/restore`, {
        method: "POST"
      });
      if (!res.ok) {
        throw new Error(`Failed to restore component (HTTP ${res.status})`);
      }
      setParts((prev) =>
        prev.map((p) => (p.id === part.id ? { ...p, is_archived: false, deleted_at: null } : p))
      );
      setNotification({
        text: `Component "${part.name}" restored to active inventory.`,
        type: "success"
      });
    } catch (err) {
      console.error("Restore failed:", err);
      setNotification({
        text: err.message || "Failed to restore component.",
        type: "error"
      });
    }
  };

  // Execute Delete (Soft Archive or Permanent Delete) after typing "confirm"
  const handleExecuteDeleteOrArchive = async () => {
    if (!componentToDelete) return;
    setIsDeleting(true);

    try {
      const endpoint = isPermanentDelete
        ? `/api/parts/${encodeURIComponent(componentToDelete.id)}?permanent=true`
        : `/api/parts/${encodeURIComponent(componentToDelete.id)}`;

      const res = await apiFetch(endpoint, {
        method: "DELETE"
      });

      if (!res.ok && res.status !== 404) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}: Failed to process deletion`);
      }

      if (isPermanentDelete) {
        // Permanent delete: remove completely
        setParts((prev) => prev.filter((p) => p.id !== componentToDelete.id));
        setNotification({
          text: `Component "${componentToDelete.name}" permanently purged from database records.`,
          type: "success"
        });
      } else {
        // Soft delete (archive): mark as archived
        setParts((prev) =>
          prev.map((p) =>
            p.id === componentToDelete.id
              ? { ...p, is_archived: true, deleted_at: new Date().toISOString() }
              : p
          )
        );
        setNotification({
          text: `Component "${componentToDelete.name}" archived. You can view or restore it under the Archived filter.`,
          type: "success"
        });
      }

      // If open in drawer, close drawer
      if (drawerInitialData && drawerInitialData.id === componentToDelete.id) {
        setIsDrawerOpen(false);
        setDrawerInitialData(null);
      }

      setComponentToDelete(null);
      setConfirmStep(1);
      setTypeConfirmationInput("");
    } catch (err) {
      console.error("Failed to delete/archive component:", err);
      setNotification({
        text: err.message || "Failed to delete/archive component.",
        type: "error"
      });
    } finally {
      setIsDeleting(false);
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
                  className={`quick-pill ${inventoryViewMode === "active" && quickFilter === "all" ? "active" : ""}`}
                  onClick={() => {
                    setInventoryViewMode("active");
                    setQuickFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  All ({activePartsCount})
                </button>
                <button
                  type="button"
                  className={`quick-pill pill-new ${inventoryViewMode === "active" && quickFilter === "recent24h" ? "active" : ""}`}
                  onClick={() => {
                    setInventoryViewMode("active");
                    setQuickFilter("recent24h");
                    setCurrentPage(1);
                  }}
                >
                  New (&lt;24h)
                </button>
                <button
                  type="button"
                  className={`quick-pill pill-week ${inventoryViewMode === "active" && quickFilter === "recent7d" ? "active" : ""}`}
                  onClick={() => {
                    setInventoryViewMode("active");
                    setQuickFilter("recent7d");
                    setCurrentPage(1);
                  }}
                >
                  Recent (&le;7d)
                </button>
                <button
                  type="button"
                  className={`quick-pill pill-archived ${inventoryViewMode === "archived" ? "active" : ""}`}
                  onClick={() => {
                    setInventoryViewMode("archived");
                    setCurrentPage(1);
                  }}
                  title="View archived / decommissioned components"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline-block", marginRight: "5px", verticalAlign: "middle" }}>
                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                    <rect x="1" y="3" width="22" height="5"></rect>
                    <line x1="10" y1="12" x2="14" y2="12"></line>
                  </svg>
                  Archived ({archivedPartsCount})
                </button>
              </div>
            </div>

            <div className="inventory-primary-action">
              <button
                type="button"
                className="btn-add-component-neon"
                onClick={() => {
                  setDrawerInitialData(null);
                  setIsDrawerOpen(true);
                }}
                title="Add new hardware component via drawer"
              >
                <span className="btn-plus-icon">+</span>
                <span>Add New Component</span>
              </button>
            </div>
          </div>

          {inventoryViewMode === "archived" && (
            <div className="archived-banner-alert">
              <div>
                <strong>Archived Components Repository:</strong> Showing {filteredParts.length} archived/decommissioned hardware item(s). These components are safely retained in records but hidden from active PC builder catalogs.
              </div>
              <button
                type="button"
                className="drawer-btn-ghost"
                style={{ padding: "6px 14px", fontSize: "0.8rem", color: "#fbbf24", borderColor: "rgba(245, 158, 11, 0.4)" }}
                onClick={() => {
                  setInventoryViewMode("active");
                  setCurrentPage(1);
                }}
              >
                &larr; Return to Active Inventory
              </button>
            </div>
          )}

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
                            {inventoryViewMode === "archived" ? (
                              <>
                                <button
                                  type="button"
                                  className="sleek-block-action-btn restore-block-btn"
                                  onClick={() => handleRestoreComponent(part)}
                                  title={`Restore ${part.name} to active inventory`}
                                >
                                  <span className="btn-label">Restore</span>
                                </button>
                                <button
                                  type="button"
                                  className="sleek-block-action-btn delete-block-btn text-rose-400 hover:bg-rose-500/20 border-rose-500/40"
                                  onClick={() => {
                                    setComponentToDelete(part);
                                    setIsPermanentDelete(true);
                                    setConfirmStep(1);
                                    setTypeConfirmationInput("");
                                  }}
                                  title={`Permanently delete ${part.name} from database`}
                                >
                                  <span className="btn-label">Delete</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="sleek-block-action-btn edit-block-btn"
                                  onClick={() => {
                                    setDrawerInitialData(part);
                                    setIsDrawerOpen(true);
                                  }}
                                  title={`Edit specs and matrix rules for ${part.name}`}
                                >
                                  <span className="btn-label">Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="sleek-block-action-btn delete-block-btn text-rose-400 hover:bg-rose-500/20 border-rose-500/40"
                                  onClick={() => {
                                    setComponentToDelete(part);
                                    setIsPermanentDelete(false);
                                    setConfirmStep(1);
                                    setTypeConfirmationInput("");
                                  }}
                                  title={`Archive component ${part.name}`}
                                >
                                  <span className="btn-label">Delete</span>
                                </button>
                              </>
                            )}
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
          // If URL had action or edit/id, clean it up without disturbing category
          if (searchParams.has("action") || searchParams.has("edit") || searchParams.has("id")) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete("action");
            nextParams.delete("edit");
            nextParams.delete("id");
            setSearchParams(nextParams, { replace: true });
          }
        }}
        initialData={drawerInitialData}
        onSave={handleSaveComponent}
      />

      {/* Delete / Archive Confirmation Modal */}
      {componentToDelete && (
        <div
          className="admin-confirm-modal-backdrop"
          onClick={() => !isDeleting && setComponentToDelete(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div
            className="admin-confirm-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon-wrap">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="confirm-modal-title-text">
                <h3 id="delete-dialog-title">
                  {confirmStep === 2
                    ? (isPermanentDelete ? "Security Check: Type 'confirm'" : "Authorization: Type 'confirm'")
                    : (isPermanentDelete ? "Permanent Delete Component" : "Archive Component")}
                </h3>
                <p>
                  {confirmStep === 2
                    ? `Please type "confirm" below to authorize ${isPermanentDelete ? "permanent deletion" : "archiving"} of this component.`
                    : (isPermanentDelete
                      ? "Are you sure you want to permanently delete this component?"
                      : "Are you sure you want to delete (archive) this component?")}
                </p>
              </div>
            </div>

            <div style={{ padding: "0 1.5rem 1rem" }}>
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.65)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
                {componentToDelete.img && (
                  <img
                    src={componentToDelete.img}
                    alt={componentToDelete.name}
                    style={{
                      width: "44px",
                      height: "44px",
                      objectFit: "contain",
                      borderRadius: "6px",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px"
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: "700",
                      color: "#f8fafc",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                    title={componentToDelete.name}
                  >
                    {componentToDelete.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "4px",
                      fontSize: "0.75rem",
                      color: "#94a3b8"
                    }}
                  >
                    <span
                      style={{
                        color: "#00f2fe",
                        fontWeight: "600",
                        textTransform: "uppercase"
                      }}
                    >
                      {componentToDelete.brand || "GENERIC"}
                    </span>
                    <span>•</span>
                    <span style={{ textTransform: "uppercase" }}>
                      {componentToDelete.category || "PART"}
                    </span>
                    {componentToDelete.id && (
                      <>
                        <span>•</span>
                        <span style={{ fontFamily: "monospace", opacity: 0.8 }}>
                          ID: {componentToDelete.id}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {confirmStep === 2 && (
                <div className="safety-prompt-box" style={{ marginTop: "14px" }}>
                  <label htmlFor="confirm-type-field">
                    Type <strong>confirm</strong> to authorize {isPermanentDelete ? "permanent deletion" : "archiving"}:
                  </label>
                  <input
                    id="confirm-type-field"
                    type="text"
                    placeholder="confirm"
                    value={typeConfirmationInput}
                    onChange={(e) => setTypeConfirmationInput(e.target.value)}
                    autoFocus
                    autoComplete="off"
                  />
                </div>
              )}
            </div>

            <div className="confirm-modal-warning">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>
                {isPermanentDelete
                  ? "This action cannot be undone. The record will be permanently purged from the database."
                  : "This component will be moved to the Archived repository and removed from active catalogs. You can restore it anytime."}
              </span>
            </div>

            <div className="confirm-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  if (confirmStep === 2) {
                    setConfirmStep(1);
                  } else {
                    setComponentToDelete(null);
                  }
                }}
                disabled={isDeleting}
              >
                {confirmStep === 2 ? "Back" : "Cancel"}
              </button>

              {confirmStep === 1 ? (
                <button
                  type="button"
                  className="btn-danger-confirm-delete"
                  onClick={() => {
                    setConfirmStep(2);
                    setTypeConfirmationInput("");
                  }}
                  disabled={isDeleting}
                >
                  Confirm / Delete
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-danger-confirm-delete"
                  onClick={handleExecuteDeleteOrArchive}
                  disabled={typeConfirmationInput.trim().toLowerCase() !== "confirm" || isDeleting}
                >
                  {isDeleting
                    ? (isPermanentDelete ? "Purging..." : "Archiving...")
                    : (isPermanentDelete ? "Permanently Delete" : "Archive Component")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
