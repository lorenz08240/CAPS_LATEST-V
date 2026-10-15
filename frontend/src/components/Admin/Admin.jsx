import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Admin.css";

const categories = ["case", "motherboard", "cpu", "ram", "storage", "gpu", "psu"];

const INITIAL_FORM_STATE = {
  id: "",
  category: "cpu",
  img: "",
  brand: "",
  name: "",
  desc: "",
  price: "",
  tags: "",
  socket_type: "",
  ddr_type: "",
  form_factor: "",
  power_required: "",
  wattage: "",
  capacity: "",
  speed: "",
  type: "",
  efficiency: ""
};

function Admin() {
  const { isAdmin, loginAdmin, logoutAdmin } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [parts, setParts] = useState([]);
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [stats, setStats] = useState({
    totalParts: 0,
    totalSavedBuilds: 0,
    categories: {},
    dbConnected: false,
    uptimeSeconds: 0
  });

  const formRef = useRef(null);

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage((prev) => (prev.text === text ? { text: "", type: "" } : prev));
    }, 4500);
  };

  // Fetch live stats from backend
  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats((prev) => ({ ...prev, dbConnected: false }));
      }
    } catch {
      setStats((prev) => ({ ...prev, dbConnected: false }));
    }
  };

  // Fetch all parts
  const fetchParts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/parts");
      if (res.ok) {
        const data = await res.json();
        const flattened = [];
        for (const cat in data) {
          flattened.push(...data[cat]);
        }
        setParts(flattened);
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to fetch parts", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchParts();
      fetchStats();
      const interval = setInterval(fetchStats, 15000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Load existing component into form for editing
  const handleEdit = (part) => {
    setIsEditing(true);
    setFormData({
      id: part.id || "",
      category: part.category || "cpu",
      img: part.img || "",
      brand: part.brand || "",
      name: part.name || "",
      desc: part.desc || "",
      price: part.price || "",
      tags: Array.isArray(part.tags) ? part.tags.join(", ") : (part.tags || ""),
      socket_type: part.socket_type || "",
      ddr_type: part.ddr_type || "",
      form_factor: part.form_factor || "",
      power_required: part.power_required || "",
      wattage: part.wattage || "",
      capacity: part.capacity || "",
      speed: part.speed || "",
      type: part.type || "",
      efficiency: part.efficiency || ""
    });

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    showToast(`Editing: ${part.name}`, "info");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(INITIAL_FORM_STATE);
  };

  // Delete component from database
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the database?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/parts/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`✓ Removed ${name} from database!`, "success");
        if (formData.id === id) {
          handleCancelEdit();
        }
        fetchParts();
      } else {
        showToast(data.error || "Failed to delete component", "error");
      }
    } catch {
      showToast("Network error deleting component", "error");
    }
  };

  // Submit Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedData = { ...formData };
      if (typeof cleanedData.tags === "string") {
        cleanedData.tags = cleanedData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }

      if (!cleanedData.id) {
        cleanedData.id = `${cleanedData.brand}-${cleanedData.name}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
      }

      const url = isEditing
        ? `http://localhost:5000/api/parts/${cleanedData.id}`
        : "http://localhost:5000/api/parts";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData)
      });

      const resData = await res.json();

      if (res.ok) {
        showToast(isEditing ? `✓ Updated ${cleanedData.name}!` : `✓ Added ${cleanedData.name}!`, "success");
        fetchParts();
        setIsEditing(false);
        setFormData(INITIAL_FORM_STATE);
      } else {
        showToast(resData.error || "Failed to save component.", "error");
      }
    } catch {
      showToast("Error connecting to backend server.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Trigger web crawler
  const handleCrawl = async () => {
    if (window.confirm("Run live hardware web crawler? This will scrape components and update database.")) {
      setCrawling(true);
      showToast("🕷️ Crawler started. Querying live hardware feeds...", "info");
      try {
        const res = await fetch("http://localhost:5000/api/crawl", { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          showToast("✓ Crawling completed and components updated!", "success");
          fetchParts();
        } else {
          showToast(`Crawler error: ${data.error}`, "error");
        }
      } catch {
        showToast("Error connecting to server to run crawler.", "error");
      } finally {
        setCrawling(false);
      }
    }
  };

  // Trigger database sanitization
  const handleCleanDB = async () => {
    if (window.confirm("Clean database now? This purges laptops, solar panels, and corrupt scraped records.")) {
      setCleaning(true);
      try {
        const res = await fetch("http://localhost:5000/api/admin/clean-db", { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || `✓ Database cleaned! Removed ${data.deletedCount} items.`, "success");
          fetchParts();
        } else {
          showToast(data.error || "Database cleanup failed", "error");
        }
      } catch {
        showToast("Network error executing database cleanup.", "error");
      } finally {
        setCleaning(false);
      }
    }
  };

  // Export database catalog as JSON backup
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parts, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `buildlab_catalog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("✓ Exported component catalog backup to JSON!", "success");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginAdmin(password)) {
      alert("Incorrect admin password!");
    }
  };

  // Filtered parts for active category and search query
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchCategory = part.category === activeTab;
      if (!matchCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const nameMatch = (part.name || "").toLowerCase().includes(q);
      const brandMatch = (part.brand || "").toLowerCase().includes(q);
      const socketMatch = (part.socket_type || "").toLowerCase().includes(q);
      const formMatch = (part.form_factor || "").toLowerCase().includes(q);
      const ddrMatch = (part.ddr_type || "").toLowerCase().includes(q);
      return nameMatch || brandMatch || socketMatch || formMatch || ddrMatch;
    });
  }, [parts, activeTab, searchQuery]);

  const renderDynamicHeader = (cat) => {
    switch (cat) {
      case "cpu": return "Socket / Wattage";
      case "motherboard": return "Socket / DDR / Form Factor";
      case "ram": return "DDR / Capacity / Speed";
      case "storage": return "Capacity / Type";
      case "gpu": return "Power Req / Form Factor";
      case "psu": return "Wattage / Efficiency";
      case "case": return "Form Factor";
      default: return "Specs";
    }
  };

  const renderDynamicData = (cat, part) => {
    switch (cat) {
      case "cpu":
        return `${part.socket_type || "N/A"} • ${part.wattage ? `${part.wattage}W` : "TDP N/A"}`;
      case "motherboard":
        return `${part.socket_type || "N/A"} • ${part.ddr_type || "N/A"} • ${part.form_factor || "ATX"}`;
      case "ram":
        return `${part.ddr_type || "DDR"} • ${part.capacity || "N/A"} • ${part.speed || ""}`;
      case "storage":
        return `${part.capacity || "N/A"} • ${part.type || "M.2 NVMe"}`;
      case "gpu":
        return `${part.power_required ? `${part.power_required}W Power` : "Power N/A"}`;
      case "psu":
        return `${part.wattage ? `${part.wattage}W` : "N/A"} • ${part.efficiency || "80+ Gold"}`;
      case "case":
        return `${part.form_factor || "Mid Tower"}`;
      default:
        return "-";
    }
  };

  // LOGIN SCREEN
  if (!isAdmin) {
    return (
      <div className="admin-page admin-login-wrapper">
        <div className="admin-login-left">
          <div className="login-graphic">
            <span className="admin-badge-pill">BUILDLAB SECURE GATEWAY</span>
            <h1>Hardware Matrix Control Deck</h1>
            <p>Authorized access for catalog administration, compatibility matrix tuning, and crawler pipelines.</p>
            <div className="cyber-circuit"></div>
          </div>
        </div>

        <div className="admin-login-right">
          <div className="admin-panel login-panel">
            <div className="panel-header-accent">
              <span className="auth-icon">🛡️</span>
              <h2>Admin Authentication</h2>
            </div>
            <form onSubmit={handleLogin} className="admin-form">
              <div className="form-group">
                <label>Admin Security Passkey</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password (default: admin123)"
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              <button type="submit" className="admin-submit-btn" style={{ width: "100%" }}>
                Unlock Deck
              </button>

              <button type="button" className="return-link" onClick={() => (window.location.href = "/")}>
                &larr; Return to Student Builder
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD
  return (
    <div className="admin-page">
      {/* ── TOP HEADER ── */}
      <div className="admin-header">
        <div className="admin-title-wrap">
          <div className="admin-status-badge">
            <span className={`status-indicator-dot ${stats.dbConnected ? "online" : "offline"}`}></span>
            <span>{stats.dbConnected ? "MYSQL CONNECTED" : "OFFLINE / FALLBACK"}</span>
          </div>
          <h1>BuildLab Admin Deck</h1>
          <p>Hardware catalog administration, live crawler triggers, and compatibility tagging matrix.</p>
        </div>

        <div className="admin-header-actions">
          <button
            className="action-btn-clean"
            onClick={handleCleanDB}
            disabled={cleaning}
            title="Purge miscategorized laptops, solar panels, and invalid scraped entries"
          >
            {cleaning ? "Cleaning..." : "🧹 Clean Database"}
          </button>

          <button
            className="action-btn-crawl"
            onClick={handleCrawl}
            disabled={crawling}
            title="Scrape live PC components"
          >
            {crawling ? "Crawling..." : "🕷️ Run Web Crawler"}
          </button>

          <button
            className="action-btn-export"
            onClick={handleExportJSON}
            title="Download catalog as JSON backup"
          >
            📥 Export JSON
          </button>

          <button
            className="btn-logout"
            onClick={() => {
              logoutAdmin();
              setPassword("");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── KPI METRIC CARDS ── */}
      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">TOTAL COMPONENTS</span>
            <span className="kpi-icon">📦</span>
          </div>
          <div className="kpi-val">{stats.totalParts || parts.length}</div>
          <div className="kpi-sub">Active in database catalog</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">DATABASE HEALTH</span>
            <span className="kpi-icon">🖧</span>
          </div>
          <div className="kpi-val" style={{ color: stats.dbConnected ? "#00e676" : "#facc15" }}>
            {stats.dbConnected ? "Active Pool" : "Fallback Mode"}
          </div>
          <div className="kpi-sub">MySQL Port 3306 • Node Server 5000</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">USER SAVED BUILDS</span>
            <span className="kpi-icon">💾</span>
          </div>
          <div className="kpi-val">{stats.totalSavedBuilds || 0}</div>
          <div className="kpi-sub">Rig slots saved in database</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">CATEGORIES AUDITED</span>
            <span className="kpi-icon">🛡️</span>
          </div>
          <div className="kpi-val">7 / 7 Complete</div>
          <div className="kpi-sub">Matrix rules linked & enforced</div>
        </div>
      </div>

      {/* ── TOAST MESSAGE NOTIFICATION ── */}
      {message.text && (
        <div className={`message-banner ${message.type}`}>
          <span>{message.text}</span>
          <button className="msg-close-btn" onClick={() => setMessage({ text: "", type: "" })}>✕</button>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTENT GRID ── */}
      <div className="admin-content">
        {/* ── 1. FORM SECTION (CREATE & EDIT) ── */}
        <div className="admin-panel form-panel" ref={formRef}>
          <div className="panel-title-row">
            <div>
              <h2>{isEditing ? `Edit Component: ${formData.brand} ${formData.name}` : "Add New Component"}</h2>
              <span className="panel-sub">
                {isEditing ? "Modify hardware specifications and matrix tags" : "Insert new hardware into BuildLab catalog"}
              </span>
            </div>
            {isEditing && (
              <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                ✕ Cancel Edit
              </button>
            )}
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Brand / Manufacturer</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., ASUS, Corsair, AMD, Intel"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Model Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., ROG Strix B650-E Gaming"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price (PHP)</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., ₱14,500"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Image URL & Live Preview</label>
              <div className="img-input-row">
                <input
                  type="text"
                  name="img"
                  value={formData.img}
                  onChange={handleChange}
                  placeholder="https://example.com/component.jpg"
                />
                <div className="admin-img-preview">
                  {formData.img ? (
                    <img
                      src={formData.img}
                      alt="Preview"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="no-img-text">No image</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="desc"
                value={formData.desc}
                onChange={handleChange}
                rows="2"
                placeholder="High-performance gaming component with PCIe 5.0 and robust power stages..."
              ></textarea>
            </div>

            <div className="form-group">
              <label>Tags (Comma separated, e.g. "Gaming, RGB, PCIe 5.0")</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., AM5, DDR5, High-Airflow"
              />
            </div>

            {/* ── DYNAMIC COMPATIBILITY MATRIX TAGS ── */}
            <div className="compatibility-section">
              <div className="matrix-badge-title">
                <span className="matrix-icon">⚡</span>
                <h3>Matrix Compatibility Specifications ({formData.category.toUpperCase()})</h3>
              </div>
              <p className="matrix-hint">
                These tags feed directly into the compatibility engine and guided builder lockouts.
              </p>

              <div className="form-row">
                {["cpu", "motherboard"].includes(formData.category) && (
                  <div className="form-group">
                    <label>Socket Type (e.g. AM4, AM5, LGA1700)</label>
                    <input
                      type="text"
                      name="socket_type"
                      value={formData.socket_type}
                      onChange={handleChange}
                      placeholder="e.g., AM5"
                    />
                  </div>
                )}

                {["motherboard", "ram"].includes(formData.category) && (
                  <div className="form-group">
                    <label>DDR Memory Type (e.g. DDR4, DDR5)</label>
                    <input
                      type="text"
                      name="ddr_type"
                      value={formData.ddr_type}
                      onChange={handleChange}
                      placeholder="e.g., DDR5"
                    />
                  </div>
                )}

                {["case", "motherboard"].includes(formData.category) && (
                  <div className="form-group">
                    <label>Form Factor (e.g. ATX, Micro-ATX, Mini-ITX)</label>
                    <input
                      type="text"
                      name="form_factor"
                      value={formData.form_factor}
                      onChange={handleChange}
                      placeholder="e.g., ATX"
                    />
                  </div>
                )}

                {["cpu", "psu"].includes(formData.category) && (
                  <div className="form-group">
                    <label>{formData.category === "cpu" ? "TDP Wattage (W)" : "Output Wattage (W)"}</label>
                    <input
                      type="number"
                      name="wattage"
                      value={formData.wattage}
                      onChange={handleChange}
                      placeholder={formData.category === "cpu" ? "e.g., 105" : "e.g., 750"}
                    />
                  </div>
                )}

                {formData.category === "gpu" && (
                  <div className="form-group">
                    <label>Estimated Power Required (W)</label>
                    <input
                      type="number"
                      name="power_required"
                      value={formData.power_required}
                      onChange={handleChange}
                      placeholder="e.g., 250"
                    />
                  </div>
                )}

                {["ram", "storage"].includes(formData.category) && (
                  <div className="form-group">
                    <label>Storage / RAM Capacity (e.g. 16GB, 32GB, 1TB)</label>
                    <input
                      type="text"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="e.g., 32GB or 1TB"
                    />
                  </div>
                )}

                {formData.category === "ram" && (
                  <div className="form-group">
                    <label>Memory Clock Speed</label>
                    <input
                      type="text"
                      name="speed"
                      value={formData.speed}
                      onChange={handleChange}
                      placeholder="e.g., 6000MHz"
                    />
                  </div>
                )}

                {formData.category === "storage" && (
                  <div className="form-group">
                    <label>Storage Form Type (e.g. M.2 NVMe, SATA 2.5")</label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      placeholder="e.g., NVMe SSD"
                    />
                  </div>
                )}

                {formData.category === "psu" && (
                  <div className="form-group">
                    <label>80 Plus Efficiency Rating</label>
                    <input
                      type="text"
                      name="efficiency"
                      value={formData.efficiency}
                      onChange={handleChange}
                      placeholder="e.g., 80+ Gold, 80+ Platinum"
                    />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              {loading ? "Processing..." : isEditing ? "Save Component Changes" : "+ Add Component to Catalog"}
            </button>
          </form>
        </div>

        {/* ── 2. CATALOG INVENTORY & TABLE SECTION ── */}
        <div className="admin-panel table-panel">
          <div className="table-header-toolbar">
            <div>
              <h2>Catalog Inventory ({parts.length} Total)</h2>
              <span className="panel-sub">Manage, edit, or delete existing hardware parts</span>
            </div>

            {/* Instant Search Bar */}
            <div className="search-bar-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by model, brand, socket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs with live count chips */}
          <div className="category-tabs-row">
            {categories.map((cat) => {
              const count = parts.filter((p) => p.category === cat).length;
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`category-tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(cat)}
                >
                  <span className="tab-name">{cat.toUpperCase()}</span>
                  <span className="tab-count-chip">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Components Table */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>Preview</th>
                  <th style={{ width: "22%" }}>Brand</th>
                  <th style={{ width: "34%" }}>Model / Name</th>
                  <th style={{ width: "18%" }}>{renderDynamicHeader(activeTab)}</th>
                  <th style={{ width: "16%", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((part) => (
                  <tr key={part.id} className={formData.id === part.id ? "row-editing" : ""}>
                    {/* Thumbnail */}
                    <td>
                      <div className="table-thumb-box">
                        <img
                          src={part.img || "placeholder.png"}
                          alt={part.name}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    </td>

                    {/* Brand */}
                    <td>
                      <span className="table-brand-tag">{part.brand || "Generic"}</span>
                    </td>

                    {/* Name & Price */}
                    <td>
                      <div className="table-name-wrap">
                        <span className="table-part-name" title={part.name}>
                          {part.name}
                        </span>
                        {part.price && <span className="table-price-tag">{part.price}</span>}
                      </div>
                    </td>

                    {/* Dynamic Specs */}
                    <td>
                      <span className="table-specs-val">{renderDynamicData(activeTab, part)}</span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="row-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(part)}
                          title="Edit this component"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(part.id, part.name)}
                          title="Delete from database"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredParts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="table-empty-state">
                      {searchQuery
                        ? `No components found matching "${searchQuery}" in ${activeTab.toUpperCase()}.`
                        : `No components stored in ${activeTab.toUpperCase()} category.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
