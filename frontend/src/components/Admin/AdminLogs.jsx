import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../utilities/api";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

const PAGE_SIZE = 15;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    return dateStr;
  }
};

const formatUptime = (seconds) => {
  if (!seconds || seconds <= 0) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const AdminLogs = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState({ text: "", type: "info" });
  const [categoryCounts, setCategoryCounts] = useState({});

  // Fetch telemetry & system status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/system-status");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSystemStatus(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch system status:", err);
    }
  }, []);

  // Fetch system logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await apiFetch("/api/admin/logs?limit=150");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.error("Failed to fetch system logs:", err);
    }
  }, []);

  // Fetch category counts for sidebar
  const fetchCategoryCounts = useCallback(async () => {
    try {
      const res = await apiFetch("/api/parts");
      if (res.ok) {
        const partsGrouped = await res.json();
        let total = 0;
        const counts = {};
        Object.keys(partsGrouped).forEach((cat) => {
          const c = (partsGrouped[cat] || []).length;
          counts[cat] = c;
          total += c;
        });
        counts.all = total;
        setCategoryCounts(counts);
      }
    } catch (err) {
      console.error("Failed to fetch parts counts:", err);
    }
  }, []);

  const loadAllData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    await Promise.allSettled([fetchStatus(), fetchLogs(), fetchCategoryCounts()]);

    if (isManual) {
      setRefreshing(false);
      setNotification({ text: "System logs and engine status refreshed.", type: "success" });
    } else {
      setLoading(false);
    }
  }, [fetchStatus, fetchLogs, fetchCategoryCounts]);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      fetchStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadAllData, fetchStatus]);

  // Purge / Clear logs handler
  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear the system logs audit history?")) {
      return;
    }
    try {
      const res = await apiFetch("/api/admin/logs", { method: "DELETE" });
      if (res.ok) {
        setLogs([]);
        setNotification({ text: "Audit history cleared successfully.", type: "success" });
        fetchStatus();
      } else {
        setNotification({ text: "Failed to clear logs.", type: "error" });
      }
    } catch (err) {
      setNotification({ text: "Network error clearing logs.", type: "error" });
    }
  };

  // Filter logs based on search and action dropdown
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          (log.action_type && log.action_type.toLowerCase().includes(term)) ||
          (log.admin_user && log.admin_user.toLowerCase().includes(term)) ||
          (log.details && log.details.toLowerCase().includes(term)) ||
          (log.target_id && log.target_id.toLowerCase().includes(term)) ||
          (log.target_category && log.target_category.toLowerCase().includes(term)) ||
          (log.status && log.status.toLowerCase().includes(term))
      );
    }

    if (filterAction !== "all") {
      result = result.filter(
        (log) =>
          (log.action_type || "").toUpperCase() === filterAction.toUpperCase() ||
          (log.target_category || "").toLowerCase() === filterAction.toLowerCase()
      );
    }

    return result;
  }, [logs, searchTerm, filterAction]);

  // Strict Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, safeCurrentPage]);

  // Reset page on search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAction]);

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const isDbHealthy = systemStatus?.services?.database?.status === "operational";

  return (
    <div className="admin-page-wrapper">
      <div className="admin-layout-container">
        <AdminSidebar categoryCounts={categoryCounts} />

        <main className="admin-main-content">
          <AdminHeader breadcrumbCurrent="System Logs" />

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
            {/* ── SYSTEM STATUS MONITOR PANELS ── */}
            <div className="system-status-grid">
              <div className="status-kpi-card engine-card">
                <div className="kpi-header">
                  <span className="kpi-tag">[ SYSTEM CORE ]</span>
                  <span className="status-live-indicator-pill pulse-online">
                    <span className="live-dot" />
                    ONLINE
                  </span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-title">BuildLab Engine {systemStatus?.system?.version || "v1.0.4"}</div>
                  <div className="kpi-sub">
                    Uptime: <span className="kpi-highlight">{formatUptime(systemStatus?.system?.uptimeSeconds)}</span>
                  </div>
                  <div className="kpi-meta-row">
                    <span>RAM Heap: <strong>{systemStatus?.system?.memoryHeapUsedMB || 0} MB</strong></span>
                    <span>RSS: <strong>{systemStatus?.system?.memoryRssMB || 0} MB</strong></span>
                  </div>
                </div>
              </div>

              <div className="status-kpi-card db-card">
                <div className="kpi-header">
                  <span className="kpi-tag">[ DATABASE ]</span>
                  <span className={`status-live-indicator-pill ${isDbHealthy ? "pulse-online" : "pulse-error"}`}>
                    <span className="live-dot" />
                    {isDbHealthy ? "CONNECTED" : "OFFLINE"}
                  </span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-title">MySQL 3306</div>
                  <div className="kpi-sub">
                    Latency: <span className="kpi-highlight">{systemStatus?.services?.database?.latencyMs ?? 0} ms</span>
                  </div>
                  <div className="kpi-meta-row">
                    <span>Total Parts: <strong>{systemStatus?.services?.database?.totalParts || 0}</strong></span>
                    <span>Review Queue: <strong>{systemStatus?.services?.database?.pendingScrapes || 0}</strong></span>
                  </div>
                </div>
              </div>

              <div className="status-kpi-card crawler-card">
                <div className="kpi-header">
                  <span className="kpi-tag">[ CRAWLER ENGINE ]</span>
                  <span className="status-live-indicator-pill pulse-online">
                    <span className="live-dot" />
                    READY
                  </span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-title">Scraper Subsystem</div>
                  <div className="kpi-sub">
                    Targets: <span className="kpi-highlight">EasyPC &bull; Bermor</span>
                  </div>
                  <div className="kpi-meta-row">
                    <span>Audit Entries: <strong>{systemStatus?.services?.apiServer?.totalAuditEntries || logs.length}</strong></span>
                    <span>Port: <strong>{systemStatus?.services?.apiServer?.port || 5000}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ACTION CONTROLS & FILTER ROW (MATCHES INVENTORY DESIGN) ── */}
            <div className="inventory-top-action-row">
              <div className="search-filter-controls">
                <div className="inventory-search-box">
                  <span className="search-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search logs by action, admin, target, or details..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search system audit logs"
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
                  <label htmlFor="log-filter" className="sort-label">Action:</label>
                  <select
                    id="log-filter"
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="admin-sort-select"
                  >
                    <option value="all">All Actions</option>
                    <option value="ADD_COMPONENT">Add Component</option>
                    <option value="UPDATE_COMPONENT">Update Component</option>
                    <option value="DELETE_COMPONENT">Delete Component</option>
                    <option value="MERGE_SCRAPED_DATA">Merge Scrapes</option>
                    <option value="SANITIZE_DATABASE">Sanitize DB</option>
                    <option value="INITIALIZE">Initialize</option>
                  </select>
                </div>

                <div className="quick-filter-pills">
                  <button
                    type="button"
                    className={`quick-pill ${filterAction === "all" ? "active" : ""}`}
                    onClick={() => setFilterAction("all")}
                  >
                    All Logs ({filteredLogs.length})
                  </button>
                  <button
                    type="button"
                    className={`quick-pill pill-new ${filterAction === "ADD_COMPONENT" ? "active" : ""}`}
                    onClick={() => setFilterAction("ADD_COMPONENT")}
                  >
                    Adds
                  </button>
                  <button
                    type="button"
                    className={`quick-pill pill-week ${filterAction === "UPDATE_COMPONENT" ? "active" : ""}`}
                    onClick={() => setFilterAction("UPDATE_COMPONENT")}
                  >
                    Updates
                  </button>
                </div>
              </div>

              <div className="inventory-primary-action" style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn-add-component-neon"
                  style={{ background: "rgba(56, 189, 248, 0.15)", borderColor: "#38bdf8", color: "#38bdf8" }}
                  onClick={() => loadAllData(true)}
                  disabled={refreshing}
                  title="Refresh logs and system status telemetry"
                >
                  <span className="btn-plus-icon">{refreshing ? "⟳" : "↻"}</span>
                  <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                </button>

                <button
                  type="button"
                  className="btn-add-component-neon"
                  style={{ background: "rgba(244, 63, 94, 0.12)", borderColor: "#f43f5e", color: "#f43f5e" }}
                  onClick={handleClearLogs}
                  title="Purge audit log records"
                >
                  <span className="btn-plus-icon">&times;</span>
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>

            {/* ── AUDIT LOGS TABLE (MATCHING INVENTORY TABLE FORMAT) ── */}
            <div className="table-container fullbleed-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px", textAlign: "center" }}>ID</th>
                    <th style={{ width: "17%" }}>ACTION / TYPE</th>
                    <th style={{ width: "12%" }}>ADMIN USER</th>
                    <th style={{ width: "38%" }}>DETAILS &amp; TARGET</th>
                    <th style={{ width: "13%", textAlign: "center" }}>STATUS</th>
                    <th style={{ width: "18%", textAlign: "center" }}>TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => {
                    const isSuccess = (log.status || "").toUpperCase() === "SUCCESS";
                    const isError = (log.status || "").toUpperCase() === "ERROR";
                    const cat = (log.target_category || "all").toLowerCase();

                    return (
                      <tr key={log.id} className={log.id === logs[0]?.id ? "row-highlight-new" : ""}>
                        <td style={{ textAlign: "center", color: "#94a3b8", fontFamily: "monospace", fontSize: "12px" }}>
                          #{log.id}
                        </td>

                        <td className="part-brand-cell">
                          <span
                            className="brand-badge-pill"
                            style={{
                              borderColor: log.action_type?.includes("DELETE")
                                ? "rgba(244, 63, 94, 0.4)"
                                : log.action_type?.includes("UPDATE")
                                ? "rgba(250, 204, 21, 0.4)"
                                : "rgba(56, 189, 248, 0.4)",
                              color: log.action_type?.includes("DELETE")
                                ? "#f43f5e"
                                : log.action_type?.includes("UPDATE")
                                ? "#facc15"
                                : "#38bdf8"
                            }}
                          >
                            {log.action_type}
                          </span>
                        </td>

                        <td className="part-name-cell">
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>
                              {log.admin_user || "Admin"}
                            </span>
                            {log.ip_address && (
                              <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                                ({log.ip_address})
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="part-name-cell">
                          <div className="part-name-text" title={log.details}>
                            {log.details || "No details provided"}
                          </div>
                          <div className="part-submeta">
                            {log.target_category && (
                              <span className={`cat-inline-badge cat-${cat}`}>
                                {log.target_category.toUpperCase()}
                              </span>
                            )}
                            {log.target_id && (
                              <span className="desc-snippet" style={{ fontFamily: "monospace" }}>
                                Target ID: {log.target_id}
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <span
                            className={`badge-age ${isSuccess ? "badge-age-new" : isError ? "badge-age-older" : "badge-age-recent"}`}
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "700",
                              letterSpacing: "0.5px"
                            }}
                          >
                            {log.status || "SUCCESS"}
                          </span>
                        </td>

                        <td className="part-age-cell" style={{ textAlign: "center" }}>
                          <div className="age-badge-wrapper">
                            <span style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: "500" }}>
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="table-empty-cell">
                        {loading ? (
                          <div className="loading-state">Synchronizing system audit logs...</div>
                        ) : searchTerm ? (
                          <div>No logs matched your search term "{searchTerm}".</div>
                        ) : (
                          <div>No system logs found in this category.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── PAGINATION BAR ── */}
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
    </div>
  );
};

export default AdminLogs;
