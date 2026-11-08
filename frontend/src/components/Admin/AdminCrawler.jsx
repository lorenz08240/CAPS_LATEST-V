import React, { useState, useEffect, useRef, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../utilities/api";
import { parseProductMeta, buildQuickSpecs } from "../../utilities/scrapedMeta";
import AdminHeader from "./AdminHeader";
import EditComponentDrawer from "./EditComponentDrawer";
import "./Admin.css";

const CATEGORIES = ["all", "gpu", "motherboard", "cpu", "ram", "storage", "case", "psu"];

const STORES = [
  { id: "EasyPC", name: "EasyPC (Shopify API)", defaultUrl: "easypc.com.ph" },
  { id: "Bermor Techzone", name: "Bermor Techzone", defaultUrl: "bermorzone.com.ph" }
];

export const AdminCrawler = () => {
  const { isAdmin } = useAuth();

  // Crawler Console Controls with Persistent Draft across Tab Closures
  const [selectedStore, setSelectedStore] = useState(() => {
    try {
      const raw = localStorage.getItem("buildlab_admin_crawler_draft") || sessionStorage.getItem("buildlab_admin_crawler_draft");
      const draft = JSON.parse(raw || "{}");
      return draft.store || "EasyPC";
    } catch {
      return "EasyPC";
    }
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      const raw = localStorage.getItem("buildlab_admin_crawler_draft") || sessionStorage.getItem("buildlab_admin_crawler_draft");
      const draft = JSON.parse(raw || "{}");
      return draft.category || "all";
    } catch {
      return "all";
    }
  });
  const [maxPages, setMaxPages] = useState(() => {
    try {
      const raw = localStorage.getItem("buildlab_admin_crawler_draft") || sessionStorage.getItem("buildlab_admin_crawler_draft");
      const draft = JSON.parse(raw || "{}");
      return draft.maxPages || 1;
    } catch {
      return 1;
    }
  });
  const [crawlerStatus, setCrawlerStatus] = useState("Idle"); // "Idle", "Running", "Finished", "Error"
  const [isCrawling, setIsCrawling] = useState(false);

  // Sync crawler console draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "buildlab_admin_crawler_draft",
        JSON.stringify({ store: selectedStore, category: selectedCategory, maxPages })
      );
      localStorage.setItem("buildlab_admin_last_location", window.location.pathname + window.location.search);
    } catch {}
  }, [selectedStore, selectedCategory, maxPages]);

  // Terminal Log Monitor State with Persistent Retention
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [logs, setLogs] = useState(() => {
    try {
      const raw = localStorage.getItem("buildlab_admin_terminal_logs") || sessionStorage.getItem("buildlab_admin_terminal_logs");
      const savedLogs = JSON.parse(raw || "[]");
      if (Array.isArray(savedLogs) && savedLogs.length > 0) return savedLogs;
    } catch {}
    return [
      {
        time: new Date().toLocaleTimeString(),
        text: "[SYSTEM] BuildLab Ingestion Hub online. Ready to trigger headless crawler worker.",
        type: "system"
      }
    ];
  });
  const logBufferRef = useRef([]);
  const terminalScrollRef = useRef(null);

  // Scraped Review Queue State
  const [scrapedQueue, setScrapedQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueFilterCategory, setQueueFilterCategory] = useState("all");
  const [queuePage, setQueuePage] = useState(1);
  const QUEUE_PAGE_SIZE = 10; // Strict requirement: limit to 10 rows per page

  // Multi-select checkboxes (drives the Clear All / Clear All Selected button)
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [clearing, setClearing] = useState(false);

  // Dedicated BuildLab right-click context menu
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    item: null
  });

  // Edit Drawer for Quick Edit / Staging Verification
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState({ text: "", type: "info" });

  // BATCHED LOG UPDATES (Prevents continuous component re-rendering)
  const appendLog = (text, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    logBufferRef.current.push({ time: timestamp, text, type });
  };

  useEffect(() => {
    // Flush buffered logs in batches every 150ms to keep CPU usage low
    const flushInterval = setInterval(() => {
      if (logBufferRef.current.length > 0) {
        const batch = [...logBufferRef.current];
        logBufferRef.current = [];
        setLogs((prev) => {
          const updated = [...prev, ...batch].slice(-150);
          try {
            localStorage.setItem("buildlab_admin_terminal_logs", JSON.stringify(updated));
            sessionStorage.setItem("buildlab_admin_terminal_logs", JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }, 150);

    return () => clearInterval(flushInterval);
  }, []);

  // Auto-scroll terminal when logs change
  useEffect(() => {
    if (autoScroll && terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // SCRAPED QUEUE DATA FETCHING
  const fetchScrapedQueue = async () => {
    setQueueLoading(true);
    try {
      const res = await apiFetch("/api/scraped-queue");
      if (!res.ok) throw new Error("Could not fetch scraped queue");
      const data = await res.json();
      if (Array.isArray(data)) {
        setScrapedQueue(
          data.map((item) => ({
            ...item,
            source: item.source || `Source: ${item.source_name || "EasyPC"}`,
            scrapedName: item.scraped_name || item.scrapedName || item.name || "Hardware Part"
          }))
        );
      } else {
        setScrapedQueue([]);
      }
    } catch (err) {
      console.warn("Queue fetch error:", err.message);
      setScrapedQueue([]);
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    fetchScrapedQueue();
  }, []);

  // CRAWLER JOB TRIGGER
  const handleRunCrawler = async () => {
    if (isCrawling) return;

    setIsCrawling(true);
    setCrawlerStatus("Running");
    appendLog(`[START] Ingestion trigger launched for store: ${selectedStore}`, "start");
    appendLog(`[TARGET] Target Category: ${selectedCategory.toUpperCase()} | Max Depth: ${maxPages} page(s)`, "info");

    try {
      appendLog(`[DISPATCH] Sending asynchronous background crawl job to BuildLab server...`, "network");
      const res = await apiFetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store: selectedStore,
          category: selectedCategory,
          maxPages: Number(maxPages)
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setCrawlerStatus("Finished");
        appendLog(`[SUCCESS] Crawler finished successfully!`, "success");

        // Stream backend stdout lines into terminal if provided
        if (data.output) {
          const lines = data.output.split("\n").filter(Boolean);
          lines.forEach((line) => {
            appendLog(line.trim(), line.includes("Error") ? "error" : "stdout");
          });
        }

        if (selectedCategory && selectedCategory !== "all") {
          setQueueFilterCategory(selectedCategory);
        }

        setToast({
          text: `Crawl complete! ${selectedStore} (${selectedCategory === "all" ? "All Categories" : selectedCategory.toUpperCase()}) components staged in Review Queue.`,
          type: "success"
        });
        await fetchScrapedQueue();
      } else {
        setCrawlerStatus("Error");
        appendLog(`[ERROR] Server crawler error: ${data.error || "Execution failed"}`, "error");
        setToast({
          text: `Crawler notice: ${data.message || data.error || "Review terminal logs"}`,
          type: "info"
        });
        await fetchScrapedQueue();
      }
    } catch (err) {
      setCrawlerStatus("Finished");
      appendLog(`[WARN] Background job dispatched. Synchronizing staging review queue. (${err.message})`, "warn");
      await fetchScrapedQueue();
    } finally {
      setIsCrawling(false);
    }
  };

  // REVIEW QUEUE ACTIONS
  const handleApprove = async (id) => {
    try {
      const res = await apiFetch(`/api/scraped-queue/approve/${encodeURIComponent(id)}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Approval update rejected");
      setScrapedQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, approved: !item.approved } : item))
      );
    } catch {
      setToast({ text: "Could not update approval — server rejected the request.", type: "error" });
    }
  };

  const handleMergeAllApproved = async () => {
    const approvedCount = scrapedQueue.filter((i) => i.approved).length;
    if (approvedCount === 0) {
      setToast({
        text: "No components are approved yet. Tick 'Approve' on items you wish to merge into production.",
        type: "info"
      });
      return;
    }

    try {
      const res = await apiFetch("/api/scraped-queue/merge", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setToast({
          text: `Merged ${data.mergedCount || approvedCount} verified component(s) into production!`,
          type: "success"
        });
        appendLog(`[MERGE] Merged ${data.mergedCount || approvedCount} verified components into production database.`, "success");
        setSelectedIds(new Set());
        await fetchScrapedQueue();
      } else {
        setToast({
          text: `Merge notice: ${data.error || "Failed to merge components."}`,
          type: "info"
        });
      }
    } catch (err) {
      setToast({
        text: `Error merging: ${err.message}`,
        type: "error"
      });
    }
  };

  // Quick edit saves scraped item directly to production and deletes from queue
  const handleSaveVerifiedScraped = async (formData) => {
    const res = await apiFetch("/api/parts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!res.ok) {
      throw new Error("Failed to save verified component to production");
    }

    // Delete from queue
    if (editingItem?.id) {
      try {
        await apiFetch(`/api/scraped-queue/${encodeURIComponent(editingItem.id)}`, {
          method: "DELETE"
        });
      } catch {}
      setScrapedQueue((prev) => prev.filter((item) => item.id !== editingItem.id));
    }

    setToast({
      text: `Verified & merged "${formData.name}" directly into production inventory!`,
      type: "success"
    });
    appendLog(`[VERIFY] Scraped component "${formData.name}" verified & pushed to production inventory.`, "success");
  };

  // METRICS & STRICT PAGINATION
  const todayStr = new Date().toISOString().slice(0, 10);
  const totalInQueue = scrapedQueue.length;
  const crawledToday = scrapedQueue.filter((i) => (i.date || "").startsWith(todayStr)).length;
  const approvedCount = scrapedQueue.filter((i) => i.approved).length;
  const pendingCount = scrapedQueue.filter((i) => !i.approved).length;

  const filteredQueue = useMemo(() => {
    if (queueFilterCategory === "all") return scrapedQueue;
    return scrapedQueue.filter(
      (item) => (item.category || "").toLowerCase() === queueFilterCategory.toLowerCase()
    );
  }, [scrapedQueue, queueFilterCategory]);

  useEffect(() => {
    setQueuePage(1);
  }, [queueFilterCategory]);

  const queueTotalPages = Math.max(1, Math.ceil(filteredQueue.length / QUEUE_PAGE_SIZE));
  // Derived (not stored) — keeps pagination valid even after rows are cleared/merged away
  const activeQueuePage = Math.min(Math.max(1, queuePage), queueTotalPages);
  const paginatedQueue = useMemo(() => {
    const start = (activeQueuePage - 1) * QUEUE_PAGE_SIZE;
    return filteredQueue.slice(start, start + QUEUE_PAGE_SIZE);
  }, [filteredQueue, activeQueuePage, QUEUE_PAGE_SIZE]);

  // MULTI-SELECT & CLEAR (Recently Scraped Exclusion Flow)
  //   • No selection  → "Clear All" wipes the whole staging queue
  //   • With selection → "Clear All Selected (n)" wipes checked rows
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected =
    filteredQueue.length > 0 &&
    filteredQueue.every((item) => selectedIds.has(item.id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) return new Set();
      const next = new Set(prev);
      filteredQueue.forEach((item) => next.add(item.id));
      return next;
    });
  };

  // Dedicated BuildLab right-click context menu handlers
  const handleRowContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    // Auto-select row
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });

    const menuWidth = 230;
    const menuHeight = 290;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 12);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 12);

    setContextMenu({
      isOpen: true,
      x: Math.max(10, x),
      y: Math.max(10, y),
      item
    });
  };

  useEffect(() => {
    if (!contextMenu.isOpen) return;

    const handlePointerDown = (e) => {
      if (e.target.closest(".buildlab-context-menu")) return;
      setContextMenu((prev) => ({ ...prev, isOpen: false }));
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };

    const handleScroll = () => {
      setContextMenu((prev) => ({ ...prev, isOpen: false }));
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [contextMenu.isOpen]);

  const handleDiscardSingle = async (id) => {
    try {
      const res = await apiFetch(`/api/scraped-queue/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete request failed");
      setScrapedQueue((prev) => prev.filter((it) => it.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setToast({ text: "Discarded item from review queue.", type: "info" });
    } catch (err) {
      setToast({ text: `Failed to discard: ${err.message}`, type: "error" });
    }
  };

  const handleClearQueue = async () => {
    setContextMenu({ isOpen: false, x: 0, y: 0, item: null });
    const checkedIds = Array.from(selectedIds);

    // 1) Checkbox-driven exclusion: remove only the selected rows
    if (checkedIds.length > 0) {
      setClearing(true);
      try {
        const res = await apiFetch("/api/scraped-queue/clear-selected", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: checkedIds })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Clear selected failed");

        const removed = data.deleted ?? checkedIds.length;
        setToast({ text: `Cleared ${removed} selected item(s) from the review queue.`, type: "success" });
        appendLog(`[CLEAR] Removed ${removed} selected item(s) from the recently scraped queue.`, "warn");
        setSelectedIds(new Set());
        await fetchScrapedQueue();
      } catch (err) {
        // Fallback: delete sequentially if batch endpoint had any hiccups
        console.warn("Batch clear-selected failed, using sequential fallback:", err);
        try {
          let count = 0;
          for (const id of checkedIds) {
            await apiFetch(`/api/scraped-queue/${encodeURIComponent(id)}`, { method: "DELETE" });
            count++;
          }
          setToast({ text: `Cleared ${count} selected item(s) from the review queue.`, type: "success" });
          setSelectedIds(new Set());
          await fetchScrapedQueue();
        } catch (fallbackErr) {
          setToast({ text: `Clear selected failed: ${fallbackErr.message}`, type: "error" });
        }
      } finally {
        setClearing(false);
      }
      return;
    }

    // 2) No selection: wipe everything in the recently scraped queue
    if (scrapedQueue.length === 0) return;
    if (!window.confirm(`Clear all ${scrapedQueue.length} recently scraped item(s) from the review queue? This cannot be undone.`)) {
      return;
    }

    setClearing(true);
    try {
      const res = await apiFetch("/api/scraped-queue", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Clear failed");
      }
      setToast({ text: `Review queue cleared — removed ${scrapedQueue.length} scraped item(s).`, type: "success" });
      appendLog(`[CLEAR] Wiped ${scrapedQueue.length} recently scraped item(s) from the review queue.`, "warn");
      setSelectedIds(new Set());
      await fetchScrapedQueue();
    } catch (err) {
      setToast({ text: `Clear failed: ${err.message}`, type: "error" });
    } finally {
      setClearing(false);
    }
  };

  const crawlerStatusKey = crawlerStatus.toLowerCase(); // idle | running | finished | error
  const clearButtonArmed = selectedIds.size > 0;

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-page-wrapper">
      <div className="admin-layout-container crawler-full-width">
        <main className="admin-main-content">
          <AdminHeader breadcrumbCurrent="Crawler & Ingestion Hub" />

          {toast.text && (
            <div className={`message-toast ${toast.type}`}>
              <span>{toast.text}</span>
              <button
                type="button"
                className="toast-close"
                onClick={() => setToast({ text: "", type: "info" })}
              >
                &times;
              </button>
            </div>
          )}

          <div className="crawler-page-layout">
            <div className="crawler-top-deck-grid">
              <div className="admin-panel glass-card-panel crawler-console-panel">
                <div className="console-deck-header">
                  <div className="console-deck-titles">
                    <span className="console-deck-tag">[ Ingestion Control ]</span>
                    <h2 className="console-deck-title">Crawler Console</h2>
                  </div>
                  <span className={`crawler-status-badge status-${crawlerStatusKey}`}>
                    <span className="status-ping-dot" />
                    {crawlerStatus}
                  </span>
                </div>

                <div className="console-form-grid">
                  <div className="console-field">
                    <label htmlFor="store-select">Target Store</label>
                    <select
                      id="store-select"
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value)}
                      disabled={isCrawling}
                      className="console-select"
                    >
                      {STORES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="console-field">
                    <label htmlFor="category-select">Target Category</label>
                    <select
                      id="category-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      disabled={isCrawling}
                      className="console-select"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c === "all" ? "ALL CATEGORIES" : c.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="console-field">
                    <label htmlFor="pages-select">Max Pages to Ingest</label>
                    <select
                      id="pages-select"
                      value={maxPages}
                      onChange={(e) => setMaxPages(Number(e.target.value))}
                      disabled={isCrawling}
                      className="console-select"
                    >
                      <option value={1}>1 Page (50 items)</option>
                      <option value={2}>2 Pages (100 items)</option>
                      <option value={3}>3 Pages (150 items)</option>
                      <option value={5}>5 Pages (250 items)</option>
                    </select>
                  </div>
                </div>

                <div className="console-actions">
                  <button
                    type="button"
                    className={`btn-run-crawler-neon ${isCrawling ? "crawling-active" : ""}`}
                    onClick={handleRunCrawler}
                    disabled={isCrawling}
                  >
                    {isCrawling ? (
                      <>
                        <span className="crawler-btn-spinner"></span>
                        <span>Crawling {selectedStore}...</span>
                      </>
                    ) : (
                      <>
                        <span className="crawler-btn-radar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.93 4.93a10 10 0 0 1 14.14 0"></path><path d="M7.76 7.76a6 6 0 0 1 8.48 0"></path><circle cx="12" cy="12" r="2"></circle><line x1="12" y1="14" x2="12" y2="22"></line></svg></span>
                        <span>Run Web Crawler</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className={`admin-panel glass-card-panel terminal-monitor-panel ${isTerminalCollapsed ? "collapsed" : ""}`}>
                <div className="terminal-header-bar">
                  <div className="terminal-left-meta">
                    <span className="term-dot dot-red"></span>
                    <span className="term-dot dot-yellow"></span>
                    <span className="term-dot dot-green"></span>
                    <span className="terminal-title">Telemetry Terminal Monitor</span>
                    <span className="terminal-line-badge">{logs.length} lines</span>
                  </div>

                  <div className="terminal-actions">
                    <button
                      type="button"
                      className={`term-action-btn ${autoScroll ? "active" : ""}`}
                      onClick={() => setAutoScroll(!autoScroll)}
                      title="Toggle auto-scroll"
                    >
                      {autoScroll ? "Scroll: ON" : "Scroll: OFF"}
                    </button>
                    <button
                      type="button"
                      className="term-action-btn"
                      onClick={() => {
                        const resetLog = [{ time: new Date().toLocaleTimeString(), text: "[SYSTEM] Terminal buffer cleared.", type: "system" }];
                        setLogs(resetLog);
                        try { sessionStorage.removeItem("buildlab_admin_terminal_logs"); } catch {}
                      }}
                      title="Clear terminal buffer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="term-action-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(logs.map((l) => `[${l.time}] ${l.text}`).join("\n"));
                        setToast({ text: "Terminal logs copied to clipboard.", type: "info" });
                      }}
                      title="Copy logs to clipboard"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      className="term-action-btn collapse-toggle"
                      onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
                      title={isTerminalCollapsed ? "Expand Terminal" : "Collapse Terminal"}
                    >
                      {isTerminalCollapsed ? "Expand" : "Collapse"}
                    </button>
                  </div>
                </div>

                {!isTerminalCollapsed && (
                  <div className="terminal-screen" ref={terminalScrollRef}>
                    <div className="terminal-scanlines"></div>
                    {logs.map((log, idx) => (
                      <div key={idx} className={`term-line term-${log.type}`}>
                        <span className="term-timestamp">[{log.time}]</span>{" "}
                        <span className="term-content">{log.text}</span>
                      </div>
                    ))}
                    {isCrawling && (
                      <div className="term-line term-pulse-cursor">
                        <span className="term-cursor">&gt;&gt; Ingesting streams...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="scraped-review-card glass-card-panel review-queue-section">
              <div className="scraped-review-header">
                <div className="scraped-review-title">
                  <div className="review-title-row">
                    <h3>Scraped Data Review Queue</h3>
                    <span className="staging-note-tag">Admin Verification Required</span>
                  </div>
                  <p className="review-subtitle">
                    Inspect incoming component metadata, tune matrix tags, and merge approved hardware into production.
                  </p>
                </div>

                <div className="review-header-actions">
                  <div className="queue-category-filter">
                    <label htmlFor="queue-cat-select" className="queue-filter-label">Filter:</label>
                    <select
                      id="queue-cat-select"
                      value={queueFilterCategory}
                      onChange={(e) => setQueueFilterCategory(e.target.value)}
                      className="category-filter-dropdown"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c === "all" ? "ALL CATEGORIES" : c.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn-merge-all"
                    onClick={handleMergeAllApproved}
                    disabled={approvedCount === 0}
                    title="Push all items marked as Approved directly to production pc_parts"
                  >
                    <span className="btn-merge-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>
                    <span>Merge All Approved ({approvedCount})</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-clear-scraped ${clearButtonArmed ? "armed" : ""}`}
                    onClick={handleClearQueue}
                    disabled={clearing || (selectedIds.size === 0 && scrapedQueue.length === 0)}
                    title={
                      clearButtonArmed
                        ? `Delete the ${selectedIds.size} checkbox-selected item(s) from the queue`
                        : "Delete every recently scraped item in the review queue"
                    }
                  >
                    {clearing ? (
                      <span className="clear-spinner"></span>
                    ) : (
                      <span className="btn-clear-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </span>
                    )}
                    <span>{clearButtonArmed ? `Clear All Selected (${selectedIds.size})` : "Clear All"}</span>
                  </button>
                </div>
              </div>

              <div className="queue-meta-line">
                <span className="queue-meta-item">{totalInQueue} in queue</span>
                <span className="queue-meta-sep">/</span>
                <span className="queue-meta-item">{crawledToday} crawled today</span>
                <span className="queue-meta-sep">/</span>
                <span className="queue-meta-item meta-approved">{approvedCount} approved</span>
                <span className="queue-meta-sep">/</span>
                <span className="queue-meta-item meta-pending">{pendingCount} pending</span>
              </div>

              <div
                className="table-container queue-table-container"
                onContextMenu={(e) => {
                  if (!e.target.closest(".queue-row")) {
                    e.preventDefault();
                  }
                }}
              >
                <table className="admin-table queue-table">
                  <thead>
                    <tr>
                      <th style={{ width: "44px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="queue-select-box select-all"
                          checked={allVisibleSelected}
                          onChange={toggleSelectAll}
                          title="Select / deselect every row in the queue"
                          aria-label="Select all rows"
                        />
                      </th>
                      <th style={{ width: "8%" }}>SOURCE</th>
                      <th style={{ width: "11%" }}>CATEGORY</th>
                      <th style={{ width: "25%" }}>PRODUCT NAME</th>
                      <th style={{ width: "16%" }}>MODEL</th>
                      <th style={{ width: "14%" }}>PRODUCT SPECS</th>
                      <th style={{ textAlign: "center" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQueue.map((item) => {
                      const cat = (item.category || "case").toLowerCase();
                      const isApproved = Boolean(item.approved);
                      const isSelected = selectedIds.has(item.id);
                      const meta = parseProductMeta(item);
                      const quickSpecs = buildQuickSpecs(item);

                      return (
                        <tr
                          key={item.id}
                          className={`queue-row ${isApproved ? "item-approved" : ""} ${isSelected ? "row-selected" : ""}`}
                          onClick={(e) => {
                            if (e.target.closest("button, a, input, .buildlab-context-menu")) return;
                            toggleSelect(item.id);
                          }}
                          onContextMenu={(e) => handleRowContextMenu(e, item)}
                          title="Click to toggle selection • Right-click for BuildLab Command Panel"
                        >
                          <td className="queue-select-cell">
                            <input
                              type="checkbox"
                              className="queue-select-box"
                              checked={isSelected}
                              onChange={() => toggleSelect(item.id)}
                              title="Select this item to exclude from the queue"
                              aria-label={`Select ${meta.productName || item.scrapedName}`}
                            />
                          </td>

                          <td className="source-cell">
                            <span className={`source-pill ${item.source_name === "Bermor Techzone" ? "source-bermor" : "source-easypc"}`}>
                              {item.source_name || "EasyPC"}
                            </span>
                            {isApproved && <span className="approved-inline-tick"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
                          </td>

                          <td className="category-cell">
                            <span className={`scraped-category-pill badge-cat-${cat}`}>
                              {cat.toUpperCase()}
                            </span>
                          </td>

                          <td className="product-name-cell" title={item.scrapedName}>
                            <div className="queue-product-title">{meta.productName || item.scrapedName}</div>
                            <div className="queue-product-brand">
                              {(meta.brand || "Generic").toUpperCase()}
                            </div>
                          </td>

                          <td className="model-cell">
                            <span className="model-tag-pill" title={item.scrapedName}>
                              {meta.model || "—"}
                            </span>
                          </td>

                          <td className="product-specs-cell">
                            <div className="specs-pill-row">
                              <span className="spec-tag-pill">
                                {quickSpecs.length > 0 ? quickSpecs.join(" • ") : "—"}
                              </span>
                            </div>
                          </td>

                          <td style={{ textAlign: "center" }}>
                            <div className="queue-actions-cluster">
                              <button
                                type="button"
                                className={`queue-action-btn approve-btn ${isApproved ? "is-active" : ""}`}
                                onClick={() => handleApprove(item.id)}
                                title={isApproved ? "Revoke approval" : "Mark as approved for merge"}
                              >
                                <svg className="qa-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span>{isApproved ? "APPROVED" : "APPROVE"}</span>
                              </button>
                              <button
                                type="button"
                                className="queue-action-btn edit-btn"
                                onClick={() => {
                                  setEditingItem(item);
                                  setDrawerOpen(true);
                                }}
                                title="Quick-edit this item before pushing it to production"
                              >
                                <svg className="qa-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                <span>QUICK EDIT</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredQueue.length === 0 && (
                      <tr>
                        <td colSpan="7" className="table-empty-cell">
                          {queueLoading ? (
                            <div className="loading-state">Synchronizing staging queue...</div>
                          ) : (
                            <div className="queue-empty-state">
                              <span className="empty-check-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                              <span>All scraped components have been reviewed and merged into production.</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {queueTotalPages > 1 && (
                <div className="pagination-bar">
                  <button
                    type="button"
                    className="page-btn page-nav"
                    disabled={activeQueuePage === 1}
                    onClick={() => setQueuePage(activeQueuePage - 1)}
                    aria-label="Previous page"
                  >
                    &larr; Prev
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: queueTotalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`page-num-btn ${activeQueuePage === num ? "active" : ""}`}
                        onClick={() => setQueuePage(num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="page-btn page-nav"
                    disabled={activeQueuePage === queueTotalPages}
                    onClick={() => setQueuePage(activeQueuePage + 1)}
                    aria-label="Next page"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {contextMenu.isOpen && contextMenu.item && (
        <div
          className="buildlab-context-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ctx-menu-header">
            <span className="ctx-header-tag">[ BUILDLAB // COMMAND ]</span>
            <span className="ctx-item-name" title={contextMenu.item.scrapedName || contextMenu.item.name}>
              {contextMenu.item.scrapedName || contextMenu.item.name}
            </span>
          </div>

          <div className="ctx-menu-actions">
            <button
              type="button"
              className="ctx-menu-item"
              onClick={() => {
                handleApprove(contextMenu.item.id);
                setContextMenu((prev) => ({ ...prev, isOpen: false }));
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{contextMenu.item.approved ? "Revoke Approval" : "Approve for Production"}</span>
            </button>

            <button
              type="button"
              className="ctx-menu-item"
              onClick={() => {
                setEditingItem(contextMenu.item);
                setDrawerOpen(true);
                setContextMenu((prev) => ({ ...prev, isOpen: false }));
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <span>Quick Edit Specs</span>
            </button>

            <button
              type="button"
              className="ctx-menu-item"
              onClick={() => {
                toggleSelect(contextMenu.item.id);
                setContextMenu((prev) => ({ ...prev, isOpen: false }));
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                {selectedIds.has(contextMenu.item.id) && <polyline points="9 11 12 14 22 4"></polyline>}
              </svg>
              <span>{selectedIds.has(contextMenu.item.id) ? "Deselect Component" : "Select Component"}</span>
            </button>

            <button
              type="button"
              className="ctx-menu-item"
              onClick={() => {
                toggleSelectAll();
                setContextMenu((prev) => ({ ...prev, isOpen: false }));
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span>{allVisibleSelected ? "Deselect All Visible" : "Select All Visible"}</span>
            </button>

            <div className="ctx-menu-divider" />

            <button
              type="button"
              className="ctx-menu-item"
              onClick={() => {
                const textToCopy = contextMenu.item.scrapedName || contextMenu.item.name || "";
                navigator.clipboard.writeText(textToCopy);
                setToast({ text: "Component title copied to clipboard.", type: "info" });
                setContextMenu((prev) => ({ ...prev, isOpen: false }));
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy Component Title</span>
            </button>

            <button
              type="button"
              className="ctx-menu-item"
              onClick={() => {
                const query = encodeURIComponent(contextMenu.item.scrapedName || contextMenu.item.name || "");
                window.open(`https://www.google.com/search?q=${query}`, "_blank", "noopener,noreferrer");
                setContextMenu((prev) => ({ ...prev, isOpen: false }));
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Search on Google</span>
            </button>

            <div className="ctx-menu-divider" />

            <button
              type="button"
              className="ctx-menu-item ctx-item-danger"
              onClick={() => {
                handleDiscardSingle(contextMenu.item.id);
                setContextMenu((prev) => ({ ...prev, isOpen: false }));
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Discard from Queue</span>
            </button>
          </div>
        </div>
      )}

      <EditComponentDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
        onSave={handleSaveVerifiedScraped}
        isScrapedVerification={true}
      />
    </div>
  );
};

export default AdminCrawler;
