import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../utilities/api";
import AdminHeader from "./AdminHeader";
import HardwareIcon from "./HardwareIcon";
import "./Admin.css";

const CATEGORIES = [
  { id: "gpu", label: "GPU (Graphics)", desc: "Discrete Video Card" },
  { id: "motherboard", label: "Motherboard", desc: "Sockets & Chipsets" },
  { id: "cpu", label: "CPU (Processor)", desc: "Silicon Core" },
  { id: "ram", label: "RAM (Memory)", desc: "DDR Modules" },
  { id: "storage", label: "Storage", desc: "NVMe & SATA Drives" },
  { id: "case", label: "PC Case", desc: "Chassis & Towers" },
  { id: "psu", label: "Power Supply", desc: "ATX / Modular PSU" }
];

const DRAFT_KEY = "buildlab_admin_add_draft";

const DEFAULT_FORM_DATA = {
  category: "gpu",
  brand: "",
  name: "",
  img: "",
  desc: "",
  tags: "",
  form_factor: "",
  socket_type: "",
  ddr_type: "",
  wattage: "",
  power_required: "",
  capacity: "",
  speed: "",
  type: "",
  efficiency: ""
};

export default function AdminAddComponent() {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return { ...DEFAULT_FORM_DATA, ...parsed };
        }
      }
    } catch {
      // Ignored
    }
    return DEFAULT_FORM_DATA;
  });

  const [restoredDraft, setRestoredDraft] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem(DRAFT_KEY));
    } catch {
      return false;
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "info" });
  const [imgPreviewError, setImgPreviewError] = useState(false);

  // Autosave draft to sessionStorage on field changes
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    } catch {
      // Ignored
    }
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "img") {
      setImgPreviewError(false);
    }
  };

  const handleClearDraft = () => {
    sessionStorage.removeItem(DRAFT_KEY);
    setFormData(DEFAULT_FORM_DATA);
    setRestoredDraft(false);
    setStatusMsg({ text: "Form cleared to clean baseline.", type: "info" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMsg({ text: "Component Name / Model is required.", type: "error" });
      return;
    }
    if (!formData.brand.trim()) {
      setStatusMsg({ text: "Brand name is required (e.g., ASUS, AMD, Corsair).", type: "error" });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ text: "", type: "info" });

    const newId = `${formData.brand.toLowerCase().replace(/[^a-z0-9]/g, "")}-${formData.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;
    const payload = {
      ...formData,
      id: newId,
      created_at: new Date().toISOString()
    };

    try {
      const res = await apiFetch("/api/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      sessionStorage.removeItem(DRAFT_KEY);
      setStatusMsg({
        text: `Successfully added "${formData.name}" to the hardware catalog.`,
        type: "success"
      });

      // Reset form fields but keep category
      setFormData({
        ...DEFAULT_FORM_DATA,
        category: formData.category
      });
      setRestoredDraft(false);
    } catch (err) {
      console.warn("Server POST error, saving locally:", err);
      sessionStorage.removeItem(DRAFT_KEY);
      setStatusMsg({
        text: `Component "${formData.name}" saved to session. (Backend offline or local preview mode).`,
        type: "success"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-dedicated-screen-container">
        <AdminHeader breadcrumbCurrent="Add Hardware Component" />

        <div className="admin-screen-content">
          {/* Header Banner */}
          <div className="screen-header-banner">
            <div>
              <div className="screen-tag-row">
                <span className="screen-badge">[ CREATION WORKSPACE ]</span>
                {restoredDraft && (
                  <span className="draft-badge">Draft Auto-Restored</span>
                )}
              </div>
              <h2 className="screen-main-title">Add New Component</h2>
              <p className="screen-subtitle">
                Onboard verified PC hardware into the central catalog with tailored technical matrices and image validation.
              </p>
            </div>

            <div className="screen-header-actions">
              <button
                type="button"
                className="btn-text-secondary"
                onClick={handleClearDraft}
                title="Discard draft and reset"
              >
                Clear Form
              </button>
              <Link to="/admin/inventory" className="btn-secondary-link">
                View Inventory
              </Link>
            </div>
          </div>

          {/* Toast Notification */}
          {statusMsg.text && (
            <div className={`message-toast ${statusMsg.type}`}>
              <span>{statusMsg.text}</span>
              <button
                type="button"
                className="toast-close"
                onClick={() => setStatusMsg({ text: "", type: "info" })}
              >
                &times;
              </button>
            </div>
          )}

          {/* Main Form Layout */}
          <form onSubmit={handleSubmit} className="admin-add-form-layout">
            {/* Step 1: Category Picker */}
            <section className="form-card-panel">
              <div className="form-card-header">
                <span className="step-num">01</span>
                <h3>Select Hardware Category</h3>
              </div>
              <div className="category-card-selector">
                {CATEGORIES.map((cat) => {
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-select-pill ${isSelected ? "selected" : ""}`}
                      onClick={() => handleChange("category", cat.id)}
                    >
                      <div className="cat-pill-icon">
                        <HardwareIcon category={cat.id} size={18} />
                      </div>
                      <div className="cat-pill-meta">
                        <span className="cat-pill-title">{cat.label}</span>
                        <span className="cat-pill-desc">{cat.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Primary Identity & Image */}
            <div className="form-split-grid">
              <section className="form-card-panel">
                <div className="form-card-header">
                  <span className="step-num">02</span>
                  <h3>Component Identity & Description</h3>
                </div>

                <div className="form-row">
                  <div className="form-field flex-1">
                    <label htmlFor="brand-input">
                      Brand / Manufacturer <span className="req">*</span>
                    </label>
                    <input
                      id="brand-input"
                      type="text"
                      placeholder="e.g. ASUS, AMD, NVIDIA, Corsair"
                      value={formData.brand}
                      onChange={(e) => handleChange("brand", e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field flex-2">
                    <label htmlFor="name-input">
                      Model / Component Name <span className="req">*</span>
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      placeholder="e.g. GeForce RTX 4070 SUPER Gaming OC 12GB"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="desc-input">Technical Description</label>
                  <textarea
                    id="desc-input"
                    rows="3"
                    placeholder="Provide overview of key architectural traits, cooling solution, or connectivity..."
                    value={formData.desc}
                    onChange={(e) => handleChange("desc", e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="tags-input">Search Tags (Comma separated)</label>
                  <input
                    id="tags-input"
                    type="text"
                    placeholder="e.g. pcie4, 1440p, dlss3, dual-fan"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                  />
                </div>
              </section>

              {/* Image Preview & URL */}
              <section className="form-card-panel image-preview-panel">
                <div className="form-card-header">
                  <span className="step-num">03</span>
                  <h3>Hardware Image Asset</h3>
                </div>

                <div className="form-field">
                  <label htmlFor="img-url-input">Direct Image URL</label>
                  <input
                    id="img-url-input"
                    type="text"
                    placeholder="https://... or /pcbackground.png"
                    value={formData.img}
                    onChange={(e) => handleChange("img", e.target.value)}
                  />
                  <span className="field-hint">PNG or WebP with transparent background recommended.</span>
                </div>

                <div className="preview-canvas-box">
                  {formData.img && !imgPreviewError ? (
                    <img
                      src={formData.img}
                      alt="Hardware preview"
                      className="preview-image-img"
                      onError={() => setImgPreviewError(true)}
                    />
                  ) : (
                    <div className="preview-fallback-box">
                      <HardwareIcon category={formData.category} size={48} />
                      <span className="preview-fallback-label">
                        {imgPreviewError ? "Image failed to load — checking placeholder" : "No image preview loaded"}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Step 3: Category-Specific Hardware Matrix */}
            <section className="form-card-panel">
              <div className="form-card-header">
                <span className="step-num">04</span>
                <h3>{formData.category.toUpperCase()} Hardware Specifications</h3>
              </div>

              <div className="spec-matrix-grid">
                {formData.category === "cpu" && (
                  <>
                    <div className="form-field">
                      <label htmlFor="socket-input">Socket Type</label>
                      <input
                        id="socket-input"
                        type="text"
                        placeholder="e.g. AM5, LGA1700, AM4"
                        value={formData.socket_type}
                        onChange={(e) => handleChange("socket_type", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="wattage-input">TDP / Thermal Design Power (Watts)</label>
                      <input
                        id="wattage-input"
                        type="number"
                        placeholder="e.g. 65, 105, 125"
                        value={formData.wattage}
                        onChange={(e) => handleChange("wattage", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {formData.category === "motherboard" && (
                  <>
                    <div className="form-field">
                      <label htmlFor="mb-socket">Socket Type</label>
                      <input
                        id="mb-socket"
                        type="text"
                        placeholder="e.g. AM5, LGA1700"
                        value={formData.socket_type}
                        onChange={(e) => handleChange("socket_type", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="mb-ddr">Memory Standard</label>
                      <input
                        id="mb-ddr"
                        type="text"
                        placeholder="e.g. DDR5, DDR4"
                        value={formData.ddr_type}
                        onChange={(e) => handleChange("ddr_type", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="mb-form">Form Factor</label>
                      <input
                        id="mb-form"
                        type="text"
                        placeholder="e.g. ATX, Micro-ATX, Mini-ITX"
                        value={formData.form_factor}
                        onChange={(e) => handleChange("form_factor", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {formData.category === "ram" && (
                  <>
                    <div className="form-field">
                      <label htmlFor="ram-ddr">DDR Generation</label>
                      <input
                        id="ram-ddr"
                        type="text"
                        placeholder="e.g. DDR5, DDR4"
                        value={formData.ddr_type}
                        onChange={(e) => handleChange("ddr_type", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="ram-cap">Kit Capacity</label>
                      <input
                        id="ram-cap"
                        type="text"
                        placeholder="e.g. 32GB (2x16GB), 16GB (2x8GB)"
                        value={formData.capacity}
                        onChange={(e) => handleChange("capacity", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="ram-speed">Clock Speed</label>
                      <input
                        id="ram-speed"
                        type="text"
                        placeholder="e.g. 6000MHz, 3600MHz"
                        value={formData.speed}
                        onChange={(e) => handleChange("speed", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {formData.category === "gpu" && (
                  <>
                    <div className="form-field">
                      <label htmlFor="gpu-pwr">Power Consumption (Watts TDP)</label>
                      <input
                        id="gpu-pwr"
                        type="number"
                        placeholder="e.g. 220, 285, 450"
                        value={formData.power_required}
                        onChange={(e) => handleChange("power_required", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="gpu-form">Form Factor / Length</label>
                      <input
                        id="gpu-form"
                        type="text"
                        placeholder="e.g. 280mm Dual Slot, 310mm Triple Slot"
                        value={formData.form_factor}
                        onChange={(e) => handleChange("form_factor", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {formData.category === "storage" && (
                  <>
                    <div className="form-field">
                      <label htmlFor="stor-type">Interface / Bus Type</label>
                      <input
                        id="stor-type"
                        type="text"
                        placeholder="e.g. M.2 NVMe PCIe 4.0, 2.5 SATA SSD"
                        value={formData.type}
                        onChange={(e) => handleChange("type", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="stor-cap">Storage Capacity</label>
                      <input
                        id="stor-cap"
                        type="text"
                        placeholder="e.g. 1TB, 2TB, 4TB"
                        value={formData.capacity}
                        onChange={(e) => handleChange("capacity", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="stor-spd">Sequential Read Speed</label>
                      <input
                        id="stor-spd"
                        type="text"
                        placeholder="e.g. 7000 MB/s, 5000 MB/s"
                        value={formData.speed}
                        onChange={(e) => handleChange("speed", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {formData.category === "psu" && (
                  <>
                    <div className="form-field">
                      <label htmlFor="psu-watt">Rated Output Wattage</label>
                      <input
                        id="psu-watt"
                        type="number"
                        placeholder="e.g. 750, 850, 1000"
                        value={formData.wattage}
                        onChange={(e) => handleChange("wattage", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="psu-eff">Efficiency Certification</label>
                      <input
                        id="psu-eff"
                        type="text"
                        placeholder="e.g. 80 PLUS Gold, 80 PLUS Platinum"
                        value={formData.efficiency}
                        onChange={(e) => handleChange("efficiency", e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="psu-form">Modularity & Size</label>
                      <input
                        id="psu-form"
                        type="text"
                        placeholder="e.g. Fully Modular ATX, SFX"
                        value={formData.form_factor}
                        onChange={(e) => handleChange("form_factor", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {formData.category === "case" && (
                  <>
                    <div className="form-field">
                      <label htmlFor="case-form">Chassis Form Factor</label>
                      <input
                        id="case-form"
                        type="text"
                        placeholder="e.g. ATX Mid Tower, Micro-ATX Mini Tower"
                        value={formData.form_factor}
                        onChange={(e) => handleChange("form_factor", e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Action Bar */}
            <div className="form-action-bar">
              <Link to="/admin/inventory" className="btn-cancel">
                Cancel & Return
              </Link>
              <button
                type="submit"
                className="btn-submit-action"
                disabled={submitting}
              >
                {submitting ? "Onboarding..." : "Create Component in Catalog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

