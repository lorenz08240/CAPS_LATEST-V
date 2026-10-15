import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Admin.css";

const categories = ["case", "motherboard", "cpu", "ram", "storage", "gpu", "psu"];

function Admin() {
  const { isAdmin, loginAdmin, logoutAdmin } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [parts, setParts] = useState([]);
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    id: "",
    category: "case",
    img: "",
    brand: "",
    name: "",
    desc: "",
    tags: "", // We'll parse this as array later
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

  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all parts
  const fetchParts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/parts");
      const data = await res.json();
      // data is grouped by category, let's flatten it for the table
      const flattened = [];
      for (const cat in data) {
        flattened.push(...data[cat]);
      }
      setParts(flattened);
    } catch (err) {
      console.error("Failed to fetch parts", err);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (part) => {
    setIsEditing(true);
    setEditingId(part.id);
    setMessage("");

    if (part.category) {
      setActiveTab(part.category);
    }

    setFormData({
      id: part.id || "",
      category: part.category || "case",
      img: part.img || "",
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
    setMessage("");
    setFormData({
      id: "",
      category: activeTab,
      img: "",
      brand: "",
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
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(`Component "${part.name}" deleted successfully!`);
        if (editingId === part.id) {
          handleCancelEdit();
        }
        fetchParts();
      } else {
        setMessage(`Failed to delete component: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      setMessage("Error connecting to server to delete component.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Clean tags (comma separated string to array)
      const cleanedData = { ...formData };
      if (typeof cleanedData.tags === "string") {
        cleanedData.tags = cleanedData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      }

      // Automatically generate an ID if empty
      if (!cleanedData.id) {
        cleanedData.id = `${cleanedData.brand}-${cleanedData.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }

      const url = isEditing
        ? `http://localhost:5000/api/parts/${encodeURIComponent(cleanedData.id)}`
        : "http://localhost:5000/api/parts";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      if (res.ok) {
        setMessage(isEditing ? `Component "${cleanedData.name}" updated successfully!` : "Component saved successfully!");
        fetchParts();
        setIsEditing(false);
        setEditingId(null);
        // Reset form but keep category
        setFormData({
          id: "",
          category: activeTab,
          img: "",
          brand: "",
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
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(`Failed to save component: ${data.error || "Server error"}`);
      }
    } catch (err) {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCrawl = async () => {
    if (window.confirm("Are you sure you want to run the crawler? This will scrape live data and may take a few seconds.")) {
      setCrawling(true);
      setMessage("Crawler is running. Please wait...");
      try {
        const res = await fetch("http://localhost:5000/api/crawl", { method: "POST" });
        const data = await res.json();
        if (res.ok) {
          setMessage("Crawling completed successfully!");
          fetchParts(); // Refresh table
        } else {
          setMessage(`Crawling failed: ${data.error}`);
        }
      } catch (err) {
        setMessage("Error connecting to server to run crawler.");
      } finally {
        setCrawling(false);
      }
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
      case 'cpu': return 'Socket / Wattage';
      case 'motherboard': return 'Socket / DDR';
      case 'ram': return 'DDR / Capacity';
      case 'storage': return 'Capacity';
      case 'gpu': return 'Power Req.';
      case 'psu': return 'Wattage';
      case 'case': return 'Form Factor';
      default: return 'Specs';
    }
  };

  const renderDynamicData = (cat, part) => {
    switch (cat) {
      case 'cpu': return `${part.socket_type || '-'} / ${part.wattage ? `${part.wattage}W` : '-'}`;
      case 'motherboard': return `${part.socket_type || '-'} / ${part.ddr_type || '-'}`;
      case 'ram': return `${part.ddr_type || '-'} / ${part.capacity || '-'}`;
      case 'storage': return part.capacity || '-';
      case 'gpu': return part.power_required ? `${part.power_required}W` : '-';
      case 'psu': return part.wattage ? `${part.wattage}W` : '-';
      case 'case': return part.form_factor || '-';
      default: return '-';
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
                <button type="submit" className="admin-submit-btn" style={{ width: '100%' }}>Login</button>

                <button type="button" className="return-link" onClick={() => window.location.href = '/'}>
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
    .filter((p) => p.category === activeTab)
    .filter((p) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.brand && p.brand.toLowerCase().includes(term)) ||
        (p.desc && p.desc.toLowerCase().includes(term))
      );
    });

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page">
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage components and compatibility tagging (The Matrix)</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              className="btn-logout"
              style={{ backgroundColor: 'var(--yellow)', color: 'var(--dark)' }}
              onClick={handleCrawl}
              disabled={crawling}
            >
              {crawling ? "Crawling..." : "Run Web Crawler"}
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

        {/* CATEGORY TABS PILL BAR (Moved to match screenshot) */}
        <div className="category-tabs-wrapper">
          {categories.map((cat) => {
            const count = parts.filter((p) => p.category === cat).length;
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`category-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(cat);
                  if (!isEditing) {
                    setFormData((prev) => ({ ...prev, category: cat }));
                  }
                }}
              >
                {cat.toUpperCase()} ({count})
              </button>
            );
          })}
        </div>

        <div className="admin-content">
          {/* FORM SECTION */}
          <div className="admin-panel" ref={formRef}>
            <div className="form-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ margin: 0, color: isEditing ? '#00e5ff' : '#ffffff' }}>
                {isEditing ? "Edit Component" : "Add New Component"}
              </h2>
              {isEditing && (
                <span className="editing-badge">
                  EDITING: {formData.id}
                </span>
              )}
            </div>
            {message && <div className={`message ${message.includes("success") ? "success" : "error"}`}>{message}</div>}

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., ASUS, MSI" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Name / Model</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., ROG Strix Z690-E" required />
                </div>
                <div className="form-group">
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="img"
                    value={formData.img}
                    onChange={handleChange}
                    placeholder="https://example.com/image.png"
                    style={{ flex: 1 }}
                  />
                  {formData.img && (
                    <div className="brand-thumbnail-wrapper" style={{ width: '42px', height: '42px', flexShrink: 0, margin: 0 }}>
                      <img
                        src={formData.img}
                        alt="Preview"
                        className="brand-thumbnail-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="desc" value={formData.desc} onChange={handleChange} rows="2" placeholder="A brief description of the component..."></textarea>
              </div>

              <div className="form-group">
                <label>Tags (Comma separated, e.g. "Gaming, RGB, ATX")</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., Gaming, RGB, ATX" />
              </div>

              {/* DYNAMIC COMPATIBILITY TAGGING - "THE MATRIX" */}
              <div className="compatibility-section">
                <h3>Matrix Tags (Crucial for Compatibility Engine)</h3>
                <div className="form-row">
                  {/* Show depending on category */}
                  {(["cpu", "motherboard"].includes(formData.category)) && (
                    <div className="form-group">
                      <label>Socket Type (e.g. AM4, LGA1700)</label>
                      <input type="text" name="socket_type" value={formData.socket_type} onChange={handleChange} placeholder="e.g., AM4, LGA1700" />
                    </div>
                  )}

                  {(["motherboard", "ram"].includes(formData.category)) && (
                    <div className="form-group">
                      <label>DDR Type (e.g. DDR4, DDR5)</label>
                      <input type="text" name="ddr_type" value={formData.ddr_type} onChange={handleChange} placeholder="e.g., DDR4, DDR5" />
                    </div>
                  )}

                  {(["case", "motherboard"].includes(formData.category)) && (
                    <div className="form-group">
                      <label>Form Factor (e.g. ATX, mATX, Mid Tower)</label>
                      <input type="text" name="form_factor" value={formData.form_factor} onChange={handleChange} placeholder="e.g., ATX, mATX" />
                    </div>
                  )}

                  {(["cpu", "psu"].includes(formData.category)) && (
                    <div className="form-group">
                      <label>Wattage (e.g. 65, 750)</label>
                      <input type="number" name="wattage" value={formData.wattage} onChange={handleChange} placeholder="e.g., 65" />
                    </div>
                  )}

                  {(formData.category === "gpu") && (
                    <div className="form-group">
                      <label>Power Required (e.g. 200)</label>
                      <input type="number" name="power_required" value={formData.power_required} onChange={handleChange} placeholder="e.g., 200" />
                    </div>
                  )}

                  {(["ram", "storage"].includes(formData.category)) && (
                    <div className="form-group">
                      <label>Capacity (e.g. 16GB, 1TB)</label>
                      <input type="text" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="e.g., 16GB, 1TB" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-btn-row" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="submit"
                  className={`admin-submit-btn ${isEditing ? 'btn-update' : ''}`}
                  style={{ flex: 1, marginTop: 0 }}
                  disabled={loading}
                >
                  {loading ? "Saving..." : isEditing ? "Update Component" : "Add Component"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    className="admin-cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LIST SECTION */}
          <div className="admin-panel table-panel">
            <h2>Existing Components ({parts.length})</h2>

            {/* Search bar inside Existing Components */}
            <div className="admin-search-bar">
              <input
                type="text"
                placeholder={`Search ${activeTab.toUpperCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="category-section" style={{ marginBottom: '10px' }}>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Name</th>
                      <th>{renderDynamicHeader(activeTab)}</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.map((part) => (
                      <tr key={part.id} className={editingId === part.id ? "row-editing" : ""}>
                        <td>
                          <div className="brand-thumbnail-wrapper" title={part.brand || part.name}>
                            {part.img ? (
                              <img
                                src={part.img}
                                alt={part.brand || part.name}
                                className="brand-thumbnail-img"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className="brand-thumbnail-fallback"
                              style={{ display: part.img ? "none" : "flex" }}
                            >
                              {part.brand ? part.brand.slice(0, 4).toUpperCase() : "PART"}
                            </div>
                          </div>
                        </td>
                        <td title={part.name} className="part-name-cell">
                          <div className="part-name-text">{part.name}</div>
                          {part.brand && <div className="part-brand-subtext">{part.brand}</div>}
                        </td>
                        <td className="spec-cell">{renderDynamicData(activeTab, part)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              title={`Edit ${part.name}`}
                              onClick={() => handleEdit(part)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              title={`Delete ${part.name}`}
                              onClick={() => handleDelete(part)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredParts.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                          {searchTerm ? `No components match "${searchTerm}".` : "No components found in this category."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Admin;
