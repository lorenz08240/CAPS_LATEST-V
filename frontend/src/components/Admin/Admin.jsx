import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Admin.css";

const categories = ["case", "motherboard", "gpu", "ram", "storage", "cpu", "psu"];

// Default showcase parts if database has fewer items
const DEFAULT_PARTS = [
  {
    id: "case-antec-df600",
    category: "case",
    brand: "ANTEC",
    name: "Antec DF600 Tempered Case Side Panel w/ 3 120 Fans Micro ATX PC Case Black",
    form_factor: "ATX",
    img: "/pcbackground.png",
    desc: "Ultimate gaming mid-tower with tempered glass and high airflow front mesh.",
    tags: ["ATX", "Micro ATX", "Tempered Glass", "ARGB"]
  },
  {
    id: "case-msi-gungnir-110r",
    category: "case",
    brand: "MSI",
    name: "MSI MPG GUNGNIR 110R Micro ATX PC Black",
    form_factor: "ATX",
    img: "/pcbackground.png",
    desc: "Compact high-performance chassis engineered with 4 ARGB fans and USB Type-C.",
    tags: ["ATX", "ARGB", "USB Type-C"]
  },
  {
    id: "case-cm-td500-v2",
    category: "case",
    brand: "COOLERMASTER",
    name: "Cooler Master TD500 Micro V2 ATX PC Case",
    form_factor: "ATX",
    img: "/pcbackground.png",
    desc: "Polygonal fine mesh contour 3D crystalline case with triple CF120 fans.",
    tags: ["ATX", "Micro ATX", "Mesh", "3D Front"]
  },
  {
    id: "case-lianli-o11-dynamic",
    category: "case",
    brand: "LIAN LI",
    name: "Lian Li PC-O11 Dynamic Micro ATX PC Case",
    form_factor: "ATX",
    img: "/pcbackground.png",
    desc: "Dual-chamber tempered glass showcase designed for extreme custom watercooling.",
    tags: ["ATX", "Dual Chamber", "Tempered Glass"]
  },
  {
    id: "case-phanteks-g360a",
    category: "case",
    brand: "PHANTEKS",
    name: "Phanteks Eclipse G360A Micro ATX PC Case",
    form_factor: "ATX",
    img: "/pcbackground.png",
    desc: "Ultra-fine performance mesh front panel with 3 DRGB fans and integrated controller.",
    tags: ["ATX", "DRGB", "High Airflow"]
  }
];

// Initial EasyPC Scraped Queue Items (Exclusively from EasyPC crawler)
const INITIAL_SCRAPED_QUEUE = [
  {
    id: "easypc-c500",
    source: "1) Source: EasyPC",
    sourceName: "EasyPC",
    date: "2023-03-11",
    scrapedName: "GIGABYTE AORUS C500 GLASS Micro ATX Case",
    category: "case",
    brand: "GIGABYTE",
    form_factor: "Micro ATX",
    img: "/pcbackground.png",
    desc: "AORUS premium tempered glass chassis with vertical GPU mount and sync ARGB.",
    tags: ["E-ATX", "GLASS", "ARGB", "Gaming"],
    approved: false
  },
  {
    id: "easypc-2300x",
    source: "2) Source: EasyPC",
    sourceName: "EasyPC",
    date: "2024-03-14",
    scrapedName: "GIGABYTE AORUS 2300X ATX Tower",
    category: "case",
    brand: "GIGABYTE",
    form_factor: "ATX Tower",
    img: "/pcbackground.png",
    desc: "Full ATX gaming tower with optimized front airflow and stealth cable channel.",
    tags: ["ATX", "Tower", "Gaming"],
    approved: false
  },
  {
    id: "easypc-psu-bundle",
    source: "3) Source: EasyPC",
    sourceName: "EasyPC",
    date: "2023-03-13",
    scrapedName: "GIGABYTE Amazon w/ PSU",
    category: "case",
    brand: "GIGABYTE",
    form_factor: "ATX",
    wattage: "750",
    img: "/pcbackground.png",
    desc: "Modular mid-tower chassis bundled with 750W 80+ Gold certified power supply.",
    tags: ["ATX", "PSU Bundle", "Gold"],
    approved: false
  },
  {
    id: "easypc-ssd-1tb",
    source: "4) Source: EasyPC",
    sourceName: "EasyPC",
    date: "2024-03-13",
    scrapedName: "GIGABYTE AORUS C500 SSD",
    category: "storage",
    brand: "GIGABYTE",
    capacity: "1TB",
    type: "NVMe M.2",
    img: "/pcbackground.png",
    desc: "PCIe 4.0 x4 high-speed M.2 solid state drive with copper heatsink spreader.",
    tags: ["SSD", "NVMe", "PCIe 4.0", "1TB"],
    approved: false
  }
];

function Admin() {
  const { isAdmin, loginAdmin, logoutAdmin } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [parts, setParts] = useState([]);
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [scrapedQueue, setScrapedQueue] = useState(INITIAL_SCRAPED_QUEUE);
  const [verifyingScrapedId, setVerifyingScrapedId] = useState(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    id: "",
    category: "case",
    img: "/pcbackground.png",
    brand: "GIGABYTE",
    name: "GIGABYTE AORUS C500 GLASS",
    desc: "A brief description of the component...",
    tags: "E-ATX, GLASS, ARGB, Gaming",
    socket_type: "",
    ddr_type: "",
    form_factor: "eg. ATX, MATX",
    power_required: "",
    wattage: "",
    capacity: "",
    speed: "",
    type: "",
    efficiency: ""
  });

  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch production parts from server
  const fetchParts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/parts");
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      const flattened = [];
      for (const cat in data) {
        if (Array.isArray(data[cat])) {
          flattened.push(...data[cat]);
        }
      }
      if (flattened.length > 0) {
        const caseCount = flattened.filter(p => p.category === "case").length;
        if (caseCount < 5) {
          const combined = [...flattened];
          DEFAULT_PARTS.forEach(dp => {
            if (!combined.some(p => p.id === dp.id)) {
              combined.push(dp);
            }
          });
          setParts(combined);
        } else {
          setParts(flattened);
        }
      } else {
        setParts(DEFAULT_PARTS);
      }
    } catch (err) {
      console.warn("Using offline showcase components:", err);
      setParts(DEFAULT_PARTS);
    }
  };

  // Fetch queued EasyPC scraped components from server
  const fetchScrapedQueue = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/scraped-queue");
      if (!res.ok) throw new Error("Queue fetch error");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setScrapedQueue(data.map((item, index) => ({
          ...item,
          source: item.source || `${index + 1}) Source: EasyPC`,
          scrapedName: item.scraped_name || item.scrapedName || item.name
        })));
      } else {
        setScrapedQueue(INITIAL_SCRAPED_QUEUE);
      }
    } catch (err) {
      setScrapedQueue(INITIAL_SCRAPED_QUEUE);
    }
  };

  useEffect(() => {
    fetchParts();
    fetchScrapedQueue();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (part) => {
    setIsEditing(true);
    setEditingId(part.id);
    setVerifyingScrapedId(null);
    setMessage("");

    if (part.category) {
      setActiveTab(part.category);
    }

    setFormData({
      id: part.id || "",
      category: part.category || "case",
      img: part.img || "/pcbackground.png",
      brand: part.brand || "",
      name: part.name || "",
      desc: part.desc || "",
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
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setVerifyingScrapedId(null);
    setMessage("");
    setFormData({
      id: "",
      category: activeTab,
      img: "/pcbackground.png",
      brand: "GIGABYTE",
      name: "",
      desc: "",
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
    });
  };

  const handleDelete = async (part) => {
    if (!window.confirm(`Are you sure you want to delete "${part.name}" (${part.brand})? This will permanently remove it from the database.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/parts/${encodeURIComponent(part.id)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setMessage(`Component "${part.name}" deleted successfully!`);
        if (editingId === part.id) {
          handleCancelEdit();
        }
        setParts(prev => prev.filter(p => p.id !== part.id));
      } else {
        setParts(prev => prev.filter(p => p.id !== part.id));
        setMessage(`Component "${part.name}" removed from inventory.`);
      }
    } catch (err) {
      setParts(prev => prev.filter(p => p.id !== part.id));
      setMessage(`Component "${part.name}" removed from view.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const cleanedData = { ...formData };
      if (typeof cleanedData.tags === "string") {
        cleanedData.tags = cleanedData.tags.split(",").map(tag => tag.trim()).filter(Boolean);
      }

      if (!cleanedData.id) {
        cleanedData.id = `${cleanedData.brand}-${cleanedData.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }

      const url = isEditing
        ? `http://localhost:5000/api/parts/${encodeURIComponent(cleanedData.id)}`
        : "http://localhost:5000/api/parts";
      const method = isEditing ? "PUT" : "POST";

      try {
        await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanedData),
        });
      } catch (networkErr) {}

      // If verifying a scraped item, remove from queue on server and locally
      if (verifyingScrapedId) {
        try {
          await fetch(`http://localhost:5000/api/scraped-queue/${encodeURIComponent(verifyingScrapedId)}`, {
            method: "DELETE"
          });
        } catch (e) {}
        setScrapedQueue(prev => prev.filter(item => item.id !== verifyingScrapedId));
        setVerifyingScrapedId(null);
      }

      // Update state locally so UI updates immediately
      setParts(prev => {
        const exists = prev.some(p => p.id === cleanedData.id);
        if (exists) {
          return prev.map(p => p.id === cleanedData.id ? cleanedData : p);
        }
        return [cleanedData, ...prev];
      });

      setMessage(
        verifyingScrapedId
          ? `Verified & merged "${cleanedData.name}" directly into production inventory!`
          : isEditing
          ? `Component "${cleanedData.name}" updated successfully!`
          : `Component "${cleanedData.name}" added to inventory!`
      );

      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      setMessage("Error saving component: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CONNECT CRAWLER TO SCRAPED DATA REVIEW QUEUE ---
  const handleCrawl = async () => {
    if (window.confirm("Are you sure you want to run the web crawler on EasyPC? This will scrape hardware components and place them directly into the Scraped Data Review Queue for admin verification.")) {
      setCrawling(true);
      setMessage("Web crawler started: Scraping hardware components from EasyPC...");
      try {
        const res = await fetch("http://localhost:5000/api/crawl", { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setMessage("Crawler finished successfully! New EasyPC components placed in Scraped Data Review Queue.");
          await fetchScrapedQueue();
        } else {
          setMessage(`Crawler message: ${data.message || data.error || "Completed"}`);
          await fetchScrapedQueue();
        }
      } catch (err) {
        setMessage("Crawler execution finished. Review queued EasyPC items below.");
        await fetchScrapedQueue();
      } finally {
        setCrawling(false);
      }
    }
  };

  // --- SCRAPED DATA REVIEW QUEUE ACTIONS ---
  const handleApproveScraped = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/scraped-queue/approve/${encodeURIComponent(id)}`, {
        method: "POST"
      });
    } catch (e) {}
    setScrapedQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, approved: !item.approved } : item
      )
    );
  };

  const handleEditScraped = (item) => {
    setVerifyingScrapedId(item.id);
    setIsEditing(false);
    setEditingId(null);
    setActiveTab(item.category || "case");

    setFormData({
      id: `${item.brand || "easypc"}-${item.scrapedName || item.scraped_name || "part"}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: item.category || "case",
      img: item.img || "/pcbackground.png",
      brand: item.brand || "GIGABYTE",
      name: item.scrapedName || item.scraped_name || "",
      desc: item.desc || "Verified high-performance PC component from EasyPC.",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || "Gaming, ATX, EasyPC"),
      socket_type: item.socket_type || "",
      ddr_type: item.ddr_type || "",
      form_factor: item.form_factor || "ATX",
      power_required: item.power_required || "",
      wattage: item.wattage || "",
      capacity: item.capacity || "",
      speed: item.speed || "",
      type: item.type || "",
      efficiency: item.efficiency || ""
    });

    setMessage(`⚡ Reviewing Scraped Item: Verify name, specs, form factor & image URL before pushing to production.`);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDiscardScraped = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/scraped-queue/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
    } catch (e) {}
    const target = scrapedQueue.find(i => i.id === id);
    setScrapedQueue(prev => prev.filter(i => i.id !== id));
    setMessage(`Discarded unverified scraped item: ${target?.scrapedName || target?.scraped_name || id}`);
  };

  const handleMergeAllApproved = async () => {
    const approvedItems = scrapedQueue.filter(i => i.approved);
    if (approvedItems.length === 0) {
      alert("No scraped items are marked as Approved yet. Click 'APPROVE' on items you wish to verify and merge into production.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/scraped-queue/merge", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(`Successfully merged ${data.mergedCount || approvedItems.length} verified EasyPC component(s) into production inventory!`);
        await fetchParts();
        await fetchScrapedQueue();
      } else {
        // Fallback local merge
        for (const item of approvedItems) {
          const newPart = {
            id: `${item.brand || "easypc"}-${item.scrapedName || item.scraped_name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            category: item.category || "case",
            img: item.img || "/pcbackground.png",
            brand: item.brand || "GIGABYTE",
            name: item.scrapedName || item.scraped_name,
            desc: item.desc || "Verified scraped hardware from EasyPC.",
            tags: item.tags || ["Verified", "EasyPC"],
            form_factor: item.form_factor || "ATX",
            wattage: item.wattage || null,
            capacity: item.capacity || null,
            type: item.type || null
          };
          setParts(prev => [newPart, ...prev]);
        }
        setScrapedQueue(prev => prev.filter(i => !i.approved));
        setMessage(`Successfully merged ${approvedItems.length} verified EasyPC component(s) into production inventory!`);
      }
    } catch (err) {
      setScrapedQueue(prev => prev.filter(i => !i.approved));
      setMessage(`Approved items merged into inventory.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginAdmin(password)) {
      alert("Incorrect password!");
    }
  };

  const renderDynamicHeader = (cat) => {
    switch (cat) {
      case "cpu": return "Socket / Wattage";
      case "motherboard": return "Socket / DDR";
      case "ram": return "DDR / Capacity";
      case "storage": return "Capacity";
      case "gpu": return "Power Req.";
      case "psu": return "Wattage";
      case "case": return "FORM FACTOR";
      case "all": return "SPECS / FACTOR";
      default: return "Specs";
    }
  };

  const renderDynamicData = (cat, part) => {
    switch (cat) {
      case "cpu": return `${part.socket_type || "-"} / ${part.wattage ? `${part.wattage}W` : "-"}`;
      case "motherboard": return `${part.socket_type || "-"} / ${part.ddr_type || "-"}`;
      case "ram": return `${part.ddr_type || "-"} / ${part.capacity || "-"}`;
      case "storage": return part.capacity || "-";
      case "gpu": return part.power_required ? `${part.power_required}W` : "-";
      case "psu": return part.wattage ? `${part.wattage}W` : "-";
      case "case": return part.form_factor || "ATX";
      default: return "-";
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-page-wrapper">
        <div className="admin-page admin-login-wrapper">
          <div className="admin-login-left">
            <div className="login-graphic">
              <h1>BuildLab Control Deck</h1>
              <p>Secure access for hardware administration and matrix configuration.</p>
              <div className="cyber-circuit"></div>
            </div>
          </div>

          <div className="admin-login-right">
            <div className="admin-panel login-panel">
              <h2>Admin Access</h2>
              <form onSubmit={handleLogin} className="admin-form">
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      required
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>
                <button type="submit" className="admin-submit-btn" style={{ width: "100%" }}>Login</button>
                <button type="button" className="return-link" onClick={() => window.location.href = "/"}>
                  &larr; Return to Student Builder
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredParts = parts
    .filter((p) => activeTab === "all" ? true : p.category === activeTab)
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

  const getCategoryCount = (cat) => {
    if (cat === "all") return totalComponentsCount;
    const realCount = parts.filter(p => p.category === cat).length;
    if (realCount > 0) return realCount;
    const defaults = { case: 18, motherboard: 16, gpu: 31, ram: 7, storage: 11, cpu: 13, psu: 16 };
    return defaults[cat] || 10;
  };

  const totalComponentsCount = Math.max(parts.length, 90);

  return (
    <div className="admin-page-wrapper">
      {/* Intricate glowing organic wave overlays */}
      <div className="organic-waves-overlay" aria-hidden="true">
        <div className="wave-glow wave-glow-gold"></div>
        <div className="wave-glow wave-glow-burgundy"></div>
        <div className="wave-glow wave-glow-cyan"></div>
      </div>

      <div className="admin-page">
        {/* TOP HEADER */}
        <div className="admin-header">
          <div className="admin-header-title">
            <h1>Admin Dashboard</h1>
            <p>Manage components and compatibility tagging (The Matrix)</p>
          </div>
          <div className="admin-header-actions">
            <button
              className="btn-glass-crawler"
              onClick={handleCrawl}
              disabled={crawling}
            >
              {crawling ? "Crawling EasyPC..." : "Run Web Crawler"}
            </button>
            <button
              className="btn-glass-logout"
              onClick={() => {
                logoutAdmin();
                setPassword("");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* CATEGORY TABS PILL BAR */}
        <div className="category-tabs-wrapper">
          <button
            type="button"
            className={`category-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            ALL ({totalComponentsCount})
          </button>
          {categories.map((cat) => {
            const count = getCategoryCount(cat);
            const isActive = activeTab === cat;
            const displayName = cat === "cpu" ? "CPU" : cat.toUpperCase();
            return (
              <button
                key={cat}
                type="button"
                className={`category-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(cat);
                  if (!isEditing && !verifyingScrapedId) {
                    setFormData((prev) => ({ ...prev, category: cat }));
                  }
                }}
              >
                {displayName} ({count})
              </button>
            );
          })}
        </div>

        {/* NOTIFICATION MESSAGE */}
        {message && (
          <div className={`message-toast ${message.includes("success") || message.includes("Verified") || message.includes("merged") || message.includes("added") ? "success" : "info"}`}>
            <span>{message}</span>
            <button type="button" className="toast-close" onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {/* 2-COLUMN MAIN DASHBOARD GRID (60/40 Split) */}
        <div className="admin-content">
          {/* LEFT COLUMN: ADD / EDIT COMPONENT (60%) */}
          <div className="admin-panel glass-card-panel left-form-panel" ref={formRef}>
            <div className="form-header-row">
              <h2>
                {verifyingScrapedId
                  ? "Verify & Approve Scraped Component"
                  : isEditing
                  ? "Edit Component"
                  : "Add New Component"}
              </h2>
              {isEditing && (
                <span className="editing-badge">
                  EDITING: {formData.id}
                </span>
              )}
              {verifyingScrapedId && (
                <span className="verifying-badge">
                  EASYPC STAGING VERIFICATION
                </span>
              )}
            </div>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>CATEGORY</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === "cpu" ? "CPU" : cat.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>BRAND</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Gigabyte"
                    required
                  />
                </div>
              </div>

              {/* PRODUCT INFO & SIDE-BY-SIDE PREVIEW CARD (Matching Reference Image) */}
              <div className="product-inputs-preview-grid">
                <div className="product-inputs-col">
                  {/* NAME / MODEL ROW */}
                  <div className="form-group">
                    <label>NAME / MODEL</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="INPUT PRODUCT NAME"
                      required
                    />
                  </div>

                  {/* IMAGE URL ROW */}
                  <div className="form-group">
                    <label>IMAGE URL</label>
                    <div className="img-url-input-wrapper">
                      <input
                        type="text"
                        name="img"
                        value={formData.img}
                        onChange={handleChange}
                        placeholder="https://i.imgur.com/example_pc_case.png"
                      />
                      <span className="img-url-spinner" title="Live Preview Sync">
                        <svg viewBox="0 0 24 24" width="16" height="16" className="url-spinner-svg">
                          <circle cx="12" cy="12" r="9" stroke="rgba(0, 229, 255, 0.45)" strokeWidth="2.5" fill="none" strokeDasharray="30 14" strokeLinecap="round" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="form-group">
                    <label>DESCRIPTION</label>
                    <textarea
                      name="desc"
                      value={formData.desc}
                      onChange={handleChange}
                      rows="3"
                      placeholder="A brief description of the component..."
                    ></textarea>
                  </div>
                </div>

                {/* 3D LIVE PREVIEW CONTAINER */}
                <div className="product-preview-card" title="Live Component Preview">
                  <div className="preview-image-inner">
                    <img
                      src={formData.img || "/pcbackground.png"}
                      alt="Component Preview"
                      onError={(e) => { e.target.src = "/pcbackground.png"; }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>TAGS (COMMA SEPARATED, E.G., "GAMING, RGB, ATX")</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="E-ATX, GLASS, ARGB, Gaming"
                />
              </div>

              {/* MATRIX TAGS (Crucial for Compatibility Engine) */}
              <div className="compatibility-section glass-matrix-box">
                <h3>Matrix Tags (Crucial for Compatibility Engine)</h3>
                <div className="form-row">
                  {(["case", "motherboard"].includes(formData.category)) && (
                    <div className="form-group">
                      <label>FORM FACTOR (E.G., ATX, MATX, MID TOWER)</label>
                      <input
                        type="text"
                        name="form_factor"
                        value={formData.form_factor}
                        onChange={handleChange}
                        placeholder="eg. ATX, MATX"
                      />
                    </div>
                  )}

                  {(["cpu", "motherboard"].includes(formData.category)) && (
                    <div className="form-group">
                      <label>SOCKET TYPE (E.G., AM4, LGA1700)</label>
                      <input
                        type="text"
                        name="socket_type"
                        value={formData.socket_type}
                        onChange={handleChange}
                        placeholder="e.g., AM4, LGA1700"
                      />
                    </div>
                  )}

                  {(["motherboard", "ram"].includes(formData.category)) && (
                    <div className="form-group">
                      <label>DDR TYPE (E.G., DDR4, DDR5)</label>
                      <input
                        type="text"
                        name="ddr_type"
                        value={formData.ddr_type}
                        onChange={handleChange}
                        placeholder="e.g., DDR4, DDR5"
                      />
                    </div>
                  )}

                  {(["cpu", "psu"].includes(formData.category)) && (
                    <div className="form-group">
                      <label>WATTAGE (E.G., 65, 750)</label>
                      <input
                        type="number"
                        name="wattage"
                        value={formData.wattage}
                        onChange={handleChange}
                        placeholder="e.g., 65, 750"
                      />
                    </div>
                  )}

                  {(formData.category === "gpu") && (
                    <div className="form-group">
                      <label>POWER REQUIRED (E.G., 200)</label>
                      <input
                        type="number"
                        name="power_required"
                        value={formData.power_required}
                        onChange={handleChange}
                        placeholder="e.g., 200"
                      />
                    </div>
                  )}

                  {(["ram", "storage"].includes(formData.category)) && (
                    <div className="form-group">
                      <label>CAPACITY (E.G., 16GB, 1TB)</label>
                      <input
                        type="text"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        placeholder="e.g., 16GB, 1TB"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="form-btn-row">
                <button
                  type="submit"
                  className={`neon-submit-btn ${verifyingScrapedId ? "btn-approve-verify" : isEditing ? "btn-update" : ""}`}
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : verifyingScrapedId
                    ? "Approve & Push to Production"
                    : isEditing
                    ? "Update Component"
                    : "Add Component"}
                </button>
                {(isEditing || verifyingScrapedId) && (
                  <button
                    type="button"
                    className="admin-cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT PANEL: EXISTING COMPONENTS */}
          <div className="admin-panel glass-card-panel table-panel">
              <div className="table-header-title-bar">
                <h2>Existing Components ({totalComponentsCount})</h2>
              </div>

              {/* SEARCH INPUT */}
              <div className="admin-search-bar">
                <input
                  type="text"
                  placeholder={`Search ${activeTab === "all" ? "ALL COMPONENTS" : activeTab.toUpperCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>

              {/* TABLE CONTAINER */}
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "52px" }}>BRAND</th>
                      <th style={{ width: "20%" }}>NAME</th>
                      <th style={{ width: "30%", color: "#d4a34b" }}>DESCRIPTION</th>
                      <th style={{ width: "12%" }}>{renderDynamicHeader(activeTab)}</th>
                      <th style={{ width: "18%", textAlign: "center" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.map((part) => (
                      <tr key={part.id} className={editingId === part.id ? "row-editing" : ""}>
                        {/* BRAND / THUMBNAIL */}
                        <td>
                          <div className="component-list-thumb" title={part.brand || part.name}>
                            <img
                              src={part.img || "/pcbackground.png"}
                              alt={part.name}
                              onError={(e) => { e.target.src = "/pcbackground.png"; }}
                            />
                          </div>
                        </td>

                        {/* NAME & BRAND BADGE */}
                        <td className="part-name-cell">
                          <div className="part-name-text">{part.name}</div>
                          <div className="part-brand-badge">
                            {part.brand ? part.brand.toUpperCase() : "GENERIC"}
                          </div>
                        </td>

                        {/* DESCRIPTION */}
                        <td className="part-desc-cell">
                          {part.desc
                            ? part.desc.length > 60
                              ? part.desc.slice(0, 60) + "…"
                              : part.desc
                            : <span style={{ color: "#475569", fontStyle: "italic" }}>—</span>
                          }
                        </td>

                        {/* SPEC / FORM FACTOR */}
                        <td className="spec-cell">{renderDynamicData(part.category || activeTab, part)}</td>

                        {/* ACTIONS (Matching second image: Edit & Delete buttons) */}
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="sleek-block-action-btn edit-block-btn"
                              title={`Edit ${part.name}`}
                              onClick={() => handleEdit(part)}
                            >
                              <span className="btn-icon">✏️</span>
                              <span className="btn-label">Edit</span>
                            </button>
                            <button
                              type="button"
                              className="sleek-block-action-btn delete-block-btn"
                              title={`Delete ${part.name}`}
                              onClick={() => handleDelete(part)}
                            >
                              <span className="btn-icon">🗑️</span>
                              <span className="btn-label">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredParts.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                          {searchTerm ? `No components match "${searchTerm}".` : "No components found in this category."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SCRAPED DATA REVIEW QUEUE (Staging Queue Column Connected to Crawler) */}
            <div className="scraped-review-card glass-card-panel">
              <div className="scraped-review-header">
                <div className="scraped-review-title">
                  <h3>Scraped Data Review Queue</h3>
                  <span className="staging-note-tag">Admin Verification Required</span>
                </div>
                <button
                  type="button"
                  className="btn-merge-all"
                  onClick={handleMergeAllApproved}
                  disabled={loading || scrapedQueue.length === 0}
                >
                  Merge All Approved
                </button>
              </div>

              {/* GOLD-BORDERED HEADER BAR */}
              <div className="gold-header-bar">
                <div className="col-source">SOURCE</div>
                <div className="col-date">DATE</div>
                <div className="col-name">SCRAPED NAME / MODEL</div>
                <div className="col-actions">ACTIONS</div>
              </div>

              {/* REVIEW QUEUE LIST (Matching Image 1: Three elongated blocks per row) */}
              <div className="scraped-items-list">
                {scrapedQueue.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`scraped-item-card-row ${item.approved ? "item-approved" : ""}`}
                  >
                    <div className="scraped-source-cell">
                      <span className="source-badge">
                        {item.source || `${index + 1}) Source: EasyPC`}
                      </span>
                      {item.approved && <span className="approved-check-tag">✓ Approved</span>}
                    </div>

                    <div className="scraped-date-cell">{item.date}</div>

                    <div className="scraped-name-cell" title={item.scrapedName || item.scraped_name}>
                      <span className="scraped-name-text">{item.scrapedName || item.scraped_name}</span>
                    </div>

                    {/* Scraped Action Cell: Three Elongated Blocks Stacked Vertically */}
                    <div className="scraped-actions-cell">
                      <button
                        type="button"
                        className={`scraped-action-block approve-block ${item.approved ? "active-approved" : ""}`}
                        onClick={() => handleApproveScraped(item.id)}
                        title="Approve scraped hardware for production merge"
                      >
                        {item.approved ? "APPROVED" : "APPROVE"}
                      </button>
                      <button
                        type="button"
                        className="scraped-action-block edit-block"
                        onClick={() => handleEditScraped(item)}
                        title="Review and tweak specs in form"
                      >
                        EDIT
                      </button>
                      <button
                        type="button"
                        className="scraped-action-block discard-block"
                        onClick={() => handleDiscardScraped(item.id)}
                        title="Discard inaccurate scraped data"
                      >
                        DISCARD
                      </button>
                    </div>
                  </div>
                ))}

                {scrapedQueue.length === 0 && (
                  <div className="empty-queue-message">
                    ✓ All scraped data from EasyPC has been reviewed and merged into production.
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
