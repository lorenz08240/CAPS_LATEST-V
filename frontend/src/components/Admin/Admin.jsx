import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Admin.css";

const categories = ["case", "motherboard", "cpu", "ram", "storage", "gpu", "psu"];

function Admin() {
  const { isAdmin, loginAdmin, logoutAdmin } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [parts, setParts] = useState([]);
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [formData, setFormData] = useState({
    id: "",
    category: "cpu",
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

      // We need a backend API to handle POST /api/parts
      // Since it's Phase 2 Step 3, we will assume we'll build the backend API for this right after.
      const res = await fetch("http://localhost:5000/api/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      if (res.ok) {
        setMessage("Component saved successfully!");
        fetchParts();
        // Reset form but keep category
        setFormData({ ...formData, id: "", img: "", brand: "", name: "", desc: "", tags: "", socket_type: "", ddr_type: "", form_factor: "", power_required: "", wattage: "", capacity: "", speed: "", type: "", efficiency: "" });
      } else {
        setMessage("Failed to save component.");
      }
    } catch (err) {
      setMessage("Error connecting to server.");
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
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage components and compatibility tagging (The Matrix)</p>
        </div>
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

      <div className="admin-content">
        {/* FORM SECTION */}
        <div className="admin-panel">
          <h2>Add New Component</h2>
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
              <input type="text" name="img" value={formData.img} onChange={handleChange} placeholder="https://example.com/image.png" />
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

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              {loading ? "Saving..." : "Add Component"}
            </button>
          </form>
        </div>

        {/* LIST SECTION */}
        <div className="admin-panel table-panel">
          <h2>Existing Components ({parts.length})</h2>
          
          {/* Category Tabs */}
          <div className="category-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`admin-submit-btn ${activeTab === cat ? 'active-tab' : ''}`}
                style={{ 
                  margin: 0, 
                  padding: '8px 16px', 
                  background: activeTab === cat ? '#00e5ff' : 'rgba(255,255,255,0.05)',
                  color: activeTab === cat ? '#000' : '#fff',
                  border: activeTab === cat ? 'none' : '1px solid rgba(255,255,255,0.1)'
                }}
                onClick={() => setActiveTab(cat)}
              >
                {cat.toUpperCase()} ({parts.filter(p => p.category === cat).length})
              </button>
            ))}
          </div>

          <div className="category-section" style={{ marginBottom: '30px' }}>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Name</th>
                    <th>{renderDynamicHeader(activeTab)}</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.filter(p => p.category === activeTab).map((part) => (
                    <tr key={part.id}>
                      <td>{part.brand}</td>
                      <td>{part.name}</td>
                      <td>{renderDynamicData(activeTab, part)}</td>
                    </tr>
                  ))}
                  {parts.filter(p => p.category === activeTab).length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "20px", color: "#888" }}>No components found in this category.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Admin;
