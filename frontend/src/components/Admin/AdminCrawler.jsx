import React, { useState, useEffect, useRef, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminLogin from "./AdminLogin";
import AdminHeader from "./AdminHeader";
import EditComponentDrawer from "./EditComponentDrawer";
import HoverImagePreview from "./HoverImagePreview";
import "./Admin.css";

const CATEGORIES = ["all", "gpu", "motherboard", "cpu", "ram", "storage", "case", "psu"];

const STORES = [
  { id: "EasyPC", name: "EasyPC (Shopify API)", defaultUrl: "easypc.com.ph" },
  { id: "Bermor Techzone", name: "Bermor Techzone", defaultUrl: "bermorzone.com.ph" }
];

export const AdminCrawler = () => {
  const { isAdmin } = useAuth();

  // Crawler Console Controls with Session Storage Draft Persistence
  const [selectedStore, setSelectedStore] = useState(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem("buildlab_admin_crawler_draft") || "{}");
      return draft.store || "EasyPC";
    } catch (e) {
      return "EasyPC";
    }
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem("buildlab_admin_crawler_draft") || "{}");
      return draft.category || "all";
    } catch (e) {
      return "all";
    }
  });
  const [maxPages, setMaxPages] = useState(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem("buildlab_admin_crawler_draft") || "{}");
      return draft.maxPages || 1;
    } catch (e) {
      return 1;
    }
  });
  const [crawlerStatus, setCrawlerStatus] = useState("Idle"); // "Idle", "Running", "Finished", "Error"
  const [isCrawling, setIsCrawling] = useState(false);

  // Sync crawler console draft to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "buildlab_admin_crawler_draft",
        JSON.stringify({ store: selectedStore, category: selectedCategory, maxPages })
      );
    } catch (e) {}
  }, [selectedStore, selectedCategory, maxPages]);

  // Terminal Log Monitor State with Session Storage Retention
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [logs, setLogs] = useState(() => {
    try {
      const savedLogs = JSON.parse(sessionStorage.getItem("buildlab_admin_terminal_logs") || "[]");
      if (Array.isArray(savedLogs) && savedLogs.length > 0) return savedLogs;
    } catch (e) {}
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

  // Edit Drawer for Quick Edit / Staging Verification
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState({ text: "", type: "info" });

  // -------------------------------------------------------------
  // BATCHED LOG UPDATES (Prevents continuous component re-rendering)
  // -------------------------------------------------------------
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
            sessionStorage.setItem("buildlab_admin_terminal_logs", JSON.stringify(updated));
          } catch (e) {}
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

  // -------------------------------------------------------------
  // SCRAPED QUEUE DATA FETCHING
  // -------------------------------------------------------------
  const fetchScrapedQueue = async () => {
    setQueueLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/scraped-queue");
      if (!res.ok) throw new Error("Could not fetch scraped queue");
      const data = await res.json();
      if (Array.isArray(data)) {
        setScrapedQueue(
          data.map((item, index) => ({
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

  // -------------------------------------------------------------
  // CRAWLER JOB TRIGGER
  // -------------------------------------------------------------
  const handleRunCrawler = async () => {
    if (isCrawling) return;

    setIsCrawling(true);
    setCrawlerStatus("Running");
    appendLog(`[START] Ingestion trigger launched for store: ${selectedStore}`, "start");
    appendLog(`[TARGET] Target Category: ${selectedCategory.toUpperCase()} | Max Depth: ${maxPages} page(s)`, "info");

    try {
      appendLog(`[DISPATCH] Sending asynchronous background crawl job to BuildLab server...`, "network");
      const res = await fetch("http://localhost:5000/api/crawl", {
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

        setToast({
          text: `Crawl complete! New ${selectedStore} components populated in Review Queue.`,
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

  // -------------------------------------------------------------
  // REVIEW QUEUE ACTIONS
  // -------------------------------------------------------------
  const handleApprove = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/scraped-queue/approve/${encodeURIComponent(id)}`, {
        method: "POST"
      });
    } catch (e) {}

    setScrapedQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, approved: !item.approved } : item))
    );
  };

  const handleDiscard = async (id, name) => {
    try {
      await fetch(`http://localhost:5000/api/scraped-queue/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
    } catch (e) {}

    setScrapedQueue((prev) => prev.filter((item) => item.id !== id));
    setToast({
      text: `Discarded "${name || id}" from review queue.`,
      type: "info"
    });
  };

  const handleMergeAllApproved = async () => {
    const approvedCount = scrapedQueue.filter((i) => i.approved).length;
    if (approvedCount === 0) {
      alert("No components are approved yet. Click 'Approve' on items you wish to merge into production.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/scraped-queue/merge", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setToast({
          text: `Merged ${data.mergedCount || approvedCount} verified component(s) into production!`,
          type: "success"
        });
        appendLog(`[MERGE] Merged ${data.mergedCount || approvedCount} verified components into production database.`, "success");
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
    const url = "http://localhost:5000/api/parts";
    const res = await fetch(url, {
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
        await fetch(`http://localhost:5000/api/scraped-queue/${encodeURIComponent(editingItem.id)}`, {
          method: "DELETE"
        });
      } catch (e) {}
      setScrapedQueue((prev) => prev.filter((item) => item.id !== editingItem.id));
    }

    setToast({
      text: `Verified & merged "${formData.name}" directly into production inventory!`,
      type: "success"
    });
    appendLog(`[VERIFY] Scraped component "${formData.name}" verified & pushed to production inventory.`, "success");
  };

  // -------------------------------------------------------------
  // METRICS & STRICT PAGINATION
  // -------------------------------------------------------------
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
  const paginatedQueue = useMemo(() => {
    const start = (queuePage - 1) * QUEUE_PAGE_SIZE;
    return filteredQueue.slice(start, start + QUEUE_PAGE_SIZE);
  }, [filteredQueue, queuePage, QUEUE_PAGE_SIZE]);

  const renderSpecsSnippet = (item) => {
    const cat = (item.category || "").toLowerCase();
    switch (cat) {
      case "cpu":
        return `${item.socket_type || "AM5/LGA"} • ${item.wattage ? `${item.wattage}W` : "TDP"}`;
      case "motherboard":
        return `${item.socket_type || "Socket"} • ${item.ddr_type || "DDR"} • ${item.form_factor || "ATX"}`;
      case "ram":
        return `${item.ddr_type || "DDR"} ${item.capacity || ""} ${item.speed || ""}`;
      case "storage":
        return `${item.capacity || "SSD"} • ${item.type || "M.2 NVMe"}`;
      case "gpu":
        return item.power_required ? `${item.power_required}W TDP` : "PCIe 4.0/5.0";
      case "psu":
        return `${item.wattage ? `${item.wattage}W` : ""} ${item.efficiency || "80+ Gold"}`;
      case "case":
        return item.form_factor || "Micro-ATX / ATX";
      default:
        return item.price || "—";
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
        <AdminHeader breadcrumbCurrent="Crawler & Ingestion Hub" />

        {/* Notification Toast */}
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
          {/* ========================================================= */}
          {/* 1. CRAWLER CONTROL CONSOLE & TERMINAL ROW */}
          {/* ========================================================= */}
          <div className="crawler-top-deck-grid">
            {/* CRAWLER CONTROL CONSOLE */}
            <div className="admin-panel glass-card-panel crawler-console-panel">
              <div className="console-header">
                <div className="console-title-wrap">
                  <span className="console-icon">⚙️</span>
                  <div>
                    <h2>Crawler Control Console</h2>
                    <p className="panel-subtitle">Configure real-time automated ingestion endpoints</p>
                  </div>
                </div>

                {/* Status Badge Indicator */}
                <div className={`crawler-status-badge status-${crawlerStatus.toLowerCase()}`}>
                  <span className="status-ping-dot"></span>
                  <span className="status-text">{crawlerStatus.toUpperCase()}</span>
                </div>
              </div>

              <div className="console-form-grid">
                {/* Store Selector */}
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

                {/* Target Category */}
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

                {/* Max Pages */}
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

              {/* Primary Action Button */}
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
                      <span className="crawler-btn-radar">📡</span>
                      <span>Run Web Crawler</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* TERMINAL LOG MONITOR */}
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
                      try { sessionStorage.removeItem("buildlab_admin_terminal_logs"); } catch (e) {}
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
                    {isTerminalCollapsed ? "Expand ▾" : "Collapse ▴"}
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

          {/* ========================================================= */}
          {/* 2. SCRAPED DATA REVIEW QUEUE */}
          {/* ========================================================= */}
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
                {/* Category Filter Dropdown */}
                <div className="queue-category-filter">
                  <label htmlFor="queue-cat-select" className="queue-filter-label">Filter:</label>
                  <select
                    id="queue-cat-select"
                    value={queueFilterCategory}
                    onChange={(e) => setQueueFilterCategory(e.target.value)}
                    className="category-filter-dropdown min-w-[140px] px-3"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c === "all" ? "ALL CATEGORIES" : c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bulk Merge Action */}
                <button
                  type="button"
                  className="btn-merge-all"
                  onClick={handleMergeAllApproved}
                  disabled={approvedCount === 0}
                  title="Push all items marked as Approved directly to production pc_parts"
                >
                  <span className="btn-merge-icon">⚡</span>
                  <span>Merge All Approved ({approvedCount})</span>
                </button>
              </div>
            </div>

            {/* METRIC CARDS */}
            <div className="scraped-stats-row">
              <div className="scraped-stat-chip">
                <span className="stat-chip-value">{totalInQueue}</span>
                <span className="stat-chip-label">Total In Queue</span>
              </div>
              <div className="scraped-stat-chip stat-chip-today">
                <span className="stat-chip-value">{crawledToday}</span>
                <span className="stat-chip-label">Crawled Today</span>
              </div>
              <div className="scraped-stat-chip stat-chip-approved">
                <span className="stat-chip-value">{approvedCount}</span>
                <span className="stat-chip-label">Approved</span>
              </div>
              <div className="scraped-stat-chip stat-chip-pending">
                <span className="stat-chip-value">{pendingCount}</span>
                <span className="stat-chip-label">Pending</span>
              </div>
            </div>

            {/* REVIEW QUEUE TABLE CONTAINER */}
            <div className="table-container queue-table-container w-full overflow-hidden">
              <table className="admin-table queue-table table-fixed w-full">
                <thead>
                  <tr>
                    <th className="w-12 text-center" style={{ width: "48px", textAlign: "center" }}>ICON</th>
                    <th className="w-20 text-center" style={{ width: "80px", textAlign: "center" }}>SOURCE</th>
                    <th className="w-24 text-center" style={{ width: "96px", textAlign: "center" }}>DATE</th>
                    <th className="w-28 text-center" style={{ width: "110px", textAlign: "center" }}>CATEGORY</th>
                    <th className="flex-1 text-left" style={{ textAlign: "left" }}>SCRAPED PRODUCT NAME</th>
                    <th className="w-36 text-left" style={{ width: "140px", textAlign: "left" }}>PARSED SPECS</th>
                    <th className="w-72 text-right pr-5" style={{ width: "280px", textAlign: "right", paddingRight: "20px" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQueue.map((item) => {
                    const cat = (item.category || "case").toLowerCase();
                    const isApproved = Boolean(item.approved);
                    const brandStr = item.brand ? item.brand.toUpperCase() : "GENERIC";
                    let modelStr = item.scrapedName || "Component";
                    if (item.brand && modelStr.toLowerCase().startsWith(item.brand.toLowerCase())) {
                      modelStr = modelStr.slice(item.brand.length).trim();
                    }

                    return (
                      <tr
                        key={item.id}
                        className={`queue-row py-3 px-3 border-b border-white/5 hover:bg-white/[0.02] ${isApproved ? "item-approved" : ""}`}
                      >
                        {/* ICON (w-12 / 48px: centered 36x36px thumbnail) */}
                        <td className="queue-icon-cell w-12 text-center" style={{ width: "48px", textAlign: "center" }}>
                          <HoverImagePreview
                            category={cat}
                            imageUrl={item.img}
                            name={item.scrapedName}
                            brand={item.brand}
                            size={36}
                          />
                        </td>

                        {/* SOURCE (w-20 / 80px) */}
                        <td className="source-cell w-20 text-center" style={{ width: "80px", textAlign: "center" }}>
                          <span className={`source-pill ${item.source_name === "Bermor Techzone" ? "source-bermor" : "source-easypc"}`}>
                            {item.source_name || "EasyPC"}
                          </span>
                          {isApproved && <span className="approved-inline-tick">✓</span>}
                        </td>

                        {/* DATE (w-24 / 96px) */}
                        <td className="date-cell w-24 text-center" style={{ width: "96px", textAlign: "center" }}>
                          <span className="text-xs text-slate-400 font-medium">
                            {item.date || "—"}
                          </span>
                        </td>

                        {/* CATEGORY (w-28 / 110px) */}
                        <td className="category-cell w-28 text-center" style={{ width: "110px", textAlign: "center" }}>
                          <span className={`scraped-category-pill cat-badge-${cat}`}>
                            [ {cat.toUpperCase()} ]
                          </span>
                        </td>

                        {/* SCRAPED PRODUCT NAME (flex-1 / remaining space with max-w & truncate) */}
                        <td className="scraped-name-cell max-w-xs md:max-w-md lg:max-w-lg truncate pl-4" title={item.scrapedName}>
                          <div className="part-title-line max-w-xs md:max-w-md lg:max-w-lg truncate" title={item.scrapedName}>
                            <span className="brand-highlight">{brandStr}</span>
                            <span className="model-name-text truncate">{modelStr}</span>
                          </div>
                          <div className="part-subtitle-line max-w-xs md:max-w-md lg:max-w-lg truncate">
                            <span className="scraped-cat-tag">{cat.toUpperCase()}</span>
                            <span className="clean-desc-text truncate">Scraped from {item.source_name || "EasyPC"}</span>
                          </div>
                        </td>

                        {/* PARSED SPECS (w-36 / 140px) */}
                        <td className="parsed-specs-cell w-36 text-left" style={{ width: "140px", textAlign: "left" }}>
                          <span className="spec-tag-pill truncate" title={renderSpecsSnippet(item)}>
                            {renderSpecsSnippet(item)}
                          </span>
                        </td>

                        {/* ACTIONS (w-72 / 280px: right-aligned with comfortable margin) */}
                        <td className="queue-actions-cell w-72 text-right pr-5" style={{ width: "280px", textAlign: "right", paddingRight: "20px" }}>
                          <div className="queue-actions-cluster">
                            <button
                              type="button"
                              className={`queue-action-btn approve-btn ${isApproved ? "is-active" : ""}`}
                              onClick={() => handleApprove(item.id)}
                              title={isApproved ? "Revoke approval" : "Mark as approved for merge"}
                            >
                              {isApproved ? "APPROVED" : "APPROVE"}
                            </button>
                            <button
                              type="button"
                              className="queue-action-btn edit-btn"
                              onClick={() => {
                                setEditingItem(item);
                                setDrawerOpen(true);
                              }}
                              title="Tweak parsed specifications in drawer before pushing"
                            >
                              QUICK EDIT
                            </button>
                            <button
                              type="button"
                              className="queue-action-btn discard-btn"
                              onClick={() => handleDiscard(item.id, item.scrapedName)}
                              title="Discard unverified item from queue"
                            >
                              DISCARD
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
                            <span className="empty-check-icon">✓</span>
                            <span>All scraped components have been reviewed and merged into production.</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* STRICT CLIENT-SIDE PAGINATION (Limit to 10 rows per page) */}
            {queueTotalPages > 1 && (
              <div className="pagination-bar">
                <button
                  type="button"
                  className="page-btn page-nav"
                  disabled={queuePage === 1}
                  onClick={() => setQueuePage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  &larr; Prev
                </button>

                <div className="page-numbers">
                  {Array.from({ length: queueTotalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`page-num-btn ${queuePage === num ? "active" : ""}`}
                      onClick={() => setQueuePage(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="page-btn page-nav"
                  disabled={queuePage === queueTotalPages}
                  onClick={() => setQueuePage((p) => Math.min(queueTotalPages, p + 1))}
                  aria-label="Next page"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK EDIT / VERIFICATION DRAWER */}
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
