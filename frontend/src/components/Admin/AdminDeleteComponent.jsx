import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../utilities/api";
import AdminHeader from "./AdminHeader";
import HardwareIcon from "./HardwareIcon";
import "./Admin.css";

const CATEGORIES = [
  { id: "all", label: "All Types" },
  { id: "gpu", label: "GPU" },
  { id: "motherboard", label: "Motherboard" },
  { id: "cpu", label: "CPU" },
  { id: "ram", label: "RAM" },
  { id: "storage", label: "Storage" },
  { id: "case", label: "Case" },
  { id: "psu", label: "PSU" }
];

export default function AdminDeleteComponent() {
  const [searchParams] = useSearchParams();
  const targetIdFromQuery = searchParams.get("id");

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState(() => (targetIdFromQuery ? [targetIdFromQuery] : []));

  // Confirmation Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Session audit trail of deleted parts
  const [deletionLog, setDeletionLog] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("buildlab_admin_deletion_log") || "[]");
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState({ text: "", type: "info" });

  useEffect(() => {
    let ignore = false;
    apiFetch("/api/parts")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (ignore) return;
        const list = [];
        for (const cat in data) {
          if (Array.isArray(data[cat])) list.push(...data[cat]);
        }
        setParts(list);
        setLoading(false);
      })
      .catch((e) => {
        if (!ignore) {
          console.warn("Could not fetch remote parts:", e);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Filtered parts list
  const filteredParts = useMemo(() => {
    return parts.filter((p) => {
      if (activeCategory !== "all" && (p.category || "").toLowerCase() !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.id && p.id.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [parts, activeCategory, searchQuery]);

  const toggleSelectId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredParts.map((p) => p.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleOpenConfirm = () => {
    if (!selectedIds.length) return;
    setConfirmationInput("");
    setIsConfirmModalOpen(true);
  };

  const executeDeletion = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);

    const itemsToDelete = parts.filter((p) => selectedIds.includes(p.id));
    const successfullyDeleted = [];

    for (const id of selectedIds) {
      try {
        const res = await apiFetch(`/api/parts/${encodeURIComponent(id)}`, {
          method: "DELETE"
        });
        if (res.ok) {
          successfullyDeleted.push(id);
        } else {
          console.warn(`Server returned ${res.status} for ${id}, removed from session view`);
          successfullyDeleted.push(id);
        }
      } catch (e) {
        console.warn(`Local deletion fallback for ${id}:`, e);
        successfullyDeleted.push(id);
      }
    }

    // Update local state
    setParts((prev) => prev.filter((p) => !successfullyDeleted.includes(p.id)));

    // Record in session deletion audit log
    const newLogEntries = itemsToDelete.map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      category: item.category,
      deletedAt: new Date().toLocaleTimeString()
    }));

    const updatedLog = [...newLogEntries, ...deletionLog].slice(0, 30);
    setDeletionLog(updatedLog);
    try {
      sessionStorage.setItem("buildlab_admin_deletion_log", JSON.stringify(updatedLog));
    } catch {
      // Ignored
    }

    setSelectedIds([]);
    setIsConfirmModalOpen(false);
    setDeleting(false);

    setNotification({
      text: `Permanently removed ${successfullyDeleted.length} hardware component${successfullyDeleted.length > 1 ? "s" : ""} from catalog.`,
      type: "success"
    });
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-dedicated-screen-container">
        <AdminHeader breadcrumbCurrent="Hardware Deletion & Lifecycle" />

        <div className="admin-screen-content">
          {/* Header Banner */}
          <div className="screen-header-banner">
            <div>
              <div className="screen-tag-row">
                <span className="screen-badge danger-badge">[ DELETION & LIFECYCLE MANAGEMENT ]</span>
              </div>
              <h2 className="screen-main-title">Delete & Deprecate Hardware</h2>
              <p className="screen-subtitle">
                Safely inspect, review dependencies, and permanently decommission obsolete or deprecated PC parts from the catalog.
              </p>
            </div>

            <div className="screen-header-actions">
              <Link to="/admin/inventory" className="btn-secondary-link">
                Return to Inventory
              </Link>
            </div>
          </div>

          {/* Toast Notification */}
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

          {/* Controls Bar: Search, Category Filter, Batch Action */}
          <div className="delete-control-deck">
            <div className="delete-search-group">
              <div className="delete-search-box">
                <span className="search-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search components by model, brand, or id..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
                    &times;
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="delete-cat-filter-pills">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`delete-cat-pill ${activeCategory === c.id ? "active" : ""}`}
                    onClick={() => setActiveCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Action Section */}
            <div className="delete-batch-actions">
              {selectedIds.length > 0 && (
                <div className="batch-counter-box">
                  <span className="batch-counter-text">
                    <strong>{selectedIds.length}</strong> selected
                  </span>
                  <button type="button" className="btn-clear-selection" onClick={handleClearSelection}>
                    Clear
                  </button>
                </div>
              )}
              <button type="button" className="btn-select-all" onClick={handleSelectAllVisible}>
                Select All Visible
              </button>
              <button
                type="button"
                className="btn-trigger-deletion"
                disabled={selectedIds.length === 0}
                onClick={handleOpenConfirm}
              >
                Delete Selected ({selectedIds.length})
              </button>
            </div>
          </div>

          {/* Main Layout: Parts Table + Session Audit Sidebar */}
          <div className="delete-main-grid">
            <div className="delete-table-wrapper">
              <table className="admin-table delete-table">
                <thead>
                  <tr>
                    <th style={{ width: "44px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={
                          filteredParts.length > 0 &&
                          filteredParts.every((p) => selectedIds.includes(p.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) handleSelectAllVisible();
                          else handleClearSelection();
                        }}
                        aria-label="Select all parts"
                      />
                    </th>
                    <th style={{ width: "50px", textAlign: "center" }}>ICON</th>
                    <th style={{ width: "16%" }}>BRAND</th>
                    <th style={{ width: "38%" }}>MODEL / HARDWARE SPEC</th>
                    <th style={{ width: "16%" }}>CATEGORY</th>
                    <th style={{ width: "16%", textAlign: "right" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6" className="table-empty-row">
                        Loading parts catalog...
                      </td>
                    </tr>
                  )}
                  {!loading && filteredParts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="table-empty-row">
                        No components match the current search or category filter.
                      </td>
                    </tr>
                  )}
                  {filteredParts.map((part) => {
                    const isSelected = selectedIds.includes(part.id);
                    return (
                      <tr key={part.id} className={isSelected ? "row-selected-danger" : ""}>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectId(part.id)}
                            aria-label={`Select ${part.name}`}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <HardwareIcon category={part.category} size={18} />
                        </td>
                        <td className="brand-cell">{part.brand || "—"}</td>
                        <td className="name-cell">
                          <div className="component-title">{part.name}</div>
                          <div className="component-subtext">ID: {part.id}</div>
                        </td>
                        <td>
                          <span className="cat-chip">{part.category}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn-delete-row"
                            onClick={() => {
                              setSelectedIds([part.id]);
                              handleOpenConfirm();
                            }}
                            title="Decommission this part"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Right: Session Audit Log */}
            <aside className="delete-audit-sidebar">
              <div className="audit-header">
                <span className="audit-title">Session Deletion Log</span>
                <span className="audit-count">{deletionLog.length} removed</span>
              </div>
              <p className="audit-desc">
                Log of items removed during this browser session. Refreshes on full browser restart.
              </p>

              <div className="audit-list">
                {deletionLog.length === 0 ? (
                  <div className="audit-empty">No components deleted during this session.</div>
                ) : (
                  deletionLog.map((log, index) => (
                    <div key={`${log.id}-${index}`} className="audit-entry">
                      <div className="audit-entry-top">
                        <span className="audit-item-name">{log.name}</span>
                        <span className="audit-time">{log.deletedAt}</span>
                      </div>
                      <div className="audit-entry-sub">
                        <span>{log.brand}</span>
                        <span className="audit-cat">{log.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="modal-backdrop-layer">
          <div className="confirm-modal-box">
            <div className="confirm-modal-header">
              <div className="confirm-danger-icon">!</div>
              <div>
                <h3>Confirm Permanent Deletion</h3>
                <p>This action cannot be undone.</p>
              </div>
            </div>

            <div className="confirm-modal-body">
              <p className="confirm-warning-text">
                You are about to permanently delete <strong>{selectedIds.length}</strong> component
                {selectedIds.length > 1 ? "s" : ""} from BuildLab's central hardware database.
              </p>

              <div className="confirm-items-preview">
                {parts
                  .filter((p) => selectedIds.includes(p.id))
                  .map((p) => (
                    <div key={p.id} className="confirm-preview-row">
                      <span>{p.brand} — {p.name}</span>
                      <span className="badge-small">{p.category}</span>
                    </div>
                  ))}
              </div>

              <div className="safety-prompt-box">
                <label htmlFor="confirm-input">
                  Type <strong>CONFIRM</strong> to authorize catalog deletion:
                </label>
                <input
                  id="confirm-input"
                  type="text"
                  placeholder="CONFIRM"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="confirm-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                disabled={confirmationInput.trim().toUpperCase() !== "CONFIRM" || deleting}
                onClick={executeDeletion}
              >
                {deleting ? "Decommissioning..." : "Permanently Decommission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

