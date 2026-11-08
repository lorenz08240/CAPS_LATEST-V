import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import HardwareIcon from "./HardwareIcon";
import "./Admin.css";

const CATEGORIES = ["gpu", "motherboard", "cpu", "ram", "storage", "case", "psu"];

const CATEGORY_LABELS = {
  gpu: "GPU (Graphics Card)",
  motherboard: "Motherboard",
  cpu: "CPU (Processor)",
  ram: "RAM (Memory)",
  storage: "Storage (SSD/HDD)",
  case: "Case (Chassis)",
  psu: "PSU (Power Supply)"
};

const DRAFT_STORAGE_KEY = "buildlab_admin_drawer_draft";

export const EditComponentDrawer = ({
  isOpen,
  onClose,
  initialData = null,
  onSave,
  isScrapedVerification = false
}) => {
  const [formData, setFormData] = useState({
    id: "",
    category: "gpu",
    brand: "",
    name: "",
    img: "/pcbackground.png",
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
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const drawerRef = useRef(null);
  const scrollBodyRef = useRef(null);

  // Sync form data or restore draft from sessionStorage when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (scrollBodyRef.current) {
        scrollBodyRef.current.scrollTop = 0;
      }
      const focusTimer = setTimeout(() => {
        if (scrollBodyRef.current) {
          const firstField = scrollBodyRef.current.querySelector("input:not([type=hidden]), select, textarea");
          if (firstField && typeof firstField.focus === "function") {
            firstField.focus();
          }
        }
      }, 60);

      const currentInitialId = initialData?.id || null;
      let loadedFromDraft = false;

      // Check for active draft in localStorage (persists across accidental tab close)
      try {
        const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY) || sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (rawDraft) {
          const parsed = JSON.parse(rawDraft);
          // Only restore if the draft belongs to this context (both are new, or same item id)
          if (parsed && parsed.initialId === currentInitialId && parsed.formData) {
            setFormData(parsed.formData);
            setRestoredDraft(true);
            loadedFromDraft = true;
          }
        }
      } catch (e) {
        console.warn("Failed to parse drawer draft from storage:", e);
      }

      if (!loadedFromDraft) {
        setRestoredDraft(false);
        if (initialData) {
          setFormData({
            id: initialData.id || "",
            category: (initialData.category || "gpu").toLowerCase(),
            brand: initialData.brand || "",
            name: initialData.name || initialData.scraped_name || initialData.scrapedName || "",
            img: initialData.img || "/pcbackground.png",
            desc: initialData.desc || "",
            tags: Array.isArray(initialData.tags)
              ? initialData.tags.join(", ")
              : (initialData.tags || ""),
            form_factor: initialData.form_factor || "",
            socket_type: initialData.socket_type || "",
            ddr_type: initialData.ddr_type || "",
            wattage: initialData.wattage || "",
            power_required: initialData.power_required || "",
            capacity: initialData.capacity || "",
            speed: initialData.speed || "",
            type: initialData.type || "",
            efficiency: initialData.efficiency || ""
          });
        } else {
          // Reset to clean blank state for "+ Add New Component"
          setFormData({
            id: "",
            category: "gpu",
            brand: "",
            name: "",
            img: "/pcbackground.png",
            desc: "",
            tags: "Gaming, PCBuild",
            form_factor: "",
            socket_type: "",
            ddr_type: "",
            wattage: "",
            power_required: "",
            capacity: "",
            speed: "",
            type: "",
            efficiency: ""
          });
        }
      }

      setErrorMsg("");
      setImgError(false);
      setImgLoading(false);
    }
  }, [isOpen, initialData]);

  // Handle ESC key press and scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleCloseWithPrompt();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Persist draft to sessionStorage as user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "img") {
      setImgError(false);
      setImgLoading(true);
    }
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          initialId: initialData?.id || null,
          formData: updated,
          updatedAt: Date.now()
        })
      );
    } catch {}
  };

  // Discard draft and revert to initial state
  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setRestoredDraft(false);

    if (initialData) {
      setFormData({
        id: initialData.id || "",
        category: (initialData.category || "gpu").toLowerCase(),
        brand: initialData.brand || "",
        name: initialData.name || initialData.scraped_name || initialData.scrapedName || "",
        img: initialData.img || "/pcbackground.png",
        desc: initialData.desc || "",
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.join(", ")
          : (initialData.tags || ""),
        form_factor: initialData.form_factor || "",
        socket_type: initialData.socket_type || "",
        ddr_type: initialData.ddr_type || "",
        wattage: initialData.wattage || "",
        power_required: initialData.power_required || "",
        capacity: initialData.capacity || "",
        speed: initialData.speed || "",
        type: initialData.type || "",
        efficiency: initialData.efficiency || ""
      });
    } else {
      setFormData({
        id: "",
        category: "gpu",
        brand: "",
        name: "",
        img: "/pcbackground.png",
        desc: "",
        tags: "Gaming, PCBuild",
        form_factor: "",
        socket_type: "",
        ddr_type: "",
        wattage: "",
        power_required: "",
        capacity: "",
        speed: "",
        type: "",
        efficiency: ""
      });
    }
  };

  const handleCloseWithPrompt = () => {
    onClose();
  };

  const handleCancelAndClear = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setRestoredDraft(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Component Name / Model is required.");
      return;
    }
    if (!formData.brand.trim()) {
      setErrorMsg("Component Brand is required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      // Parse tags
      const cleaned = { ...formData };
      if (typeof cleaned.tags === "string") {
        cleaned.tags = cleaned.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }

      // Generate ID if missing
      if (!cleaned.id) {
        cleaned.id = `${cleaned.brand}-${cleaned.name}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      await onSave(cleaned);

      // Clean up draft on successful commit
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}

      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save component.");
    } finally {
      setSaving(false);
    }
  };

  const isEditing = Boolean(initialData && initialData.id && !isScrapedVerification);

  const drawerContent = (
    <div
      className="drawer-portal-root fixed inset-0 z-[999999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseWithPrompt();
      }}
    >
      <div
        className="drawer-backdrop-overlay"
        onClick={handleCloseWithPrompt}
        aria-hidden="true"
      />

      <aside
        className="drawer-panel"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-heading"
      >
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-tag">
              {isScrapedVerification
                ? "STAGING VERIFICATION"
                : isEditing
                ? "CATALOG EDIT"
                : "INVENTORY ONBOARDING"}
            </div>
            <h2 id="drawer-heading">
              {isScrapedVerification
                ? "Verify Scraped Component"
                : isEditing
                ? "Edit Component"
                : "Add New Component"}
            </h2>
            {formData.id && (
              <span className="drawer-id-badge" title="Unique Component Identifier">
                ID: {formData.id}
              </span>
            )}
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={handleCloseWithPrompt}
            aria-label="Close drawer"
          >
            &times;
          </button>
        </div>

        <div className="drawer-scroll-body" ref={scrollBodyRef}>
          {restoredDraft && (
            <div className="drawer-draft-banner">
              <div className="draft-banner-text">
                <span className="draft-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg></span>
                <span>Unsaved draft restored from your active browser session.</span>
              </div>
              <button
                type="button"
                className="draft-discard-btn"
                onClick={handleDiscardDraft}
                title="Discard this draft and revert to initial state"
              >
                Discard Draft
              </button>
            </div>
          )}

          {errorMsg && <div className="drawer-error-alert">{errorMsg}</div>}

          <form className="drawer-form" onSubmit={handleSubmit}>
            <div className="drawer-form-row">
              <div className="drawer-form-group">
                <label htmlFor="drawer-category">Category</label>
                <select
                  id="drawer-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat] || cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="drawer-form-group">
                <label htmlFor="drawer-brand">Brand</label>
                <input
                  id="drawer-brand"
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., GIGABYTE, ASUS, MSI"
                  required
                />
              </div>
            </div>

            <div className="drawer-form-group">
              <label htmlFor="drawer-name">Name / Model</label>
              <input
                id="drawer-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., AORUS GeForce RTX 4070 Ti SUPER Master 16G"
                required
              />
            </div>

            <div className="drawer-form-group">
              <label htmlFor="drawer-img">Image URL</label>
              <div className="img-input-with-preview">
                <input
                  id="drawer-img"
                  type="text"
                  name="img"
                  value={formData.img}
                  onChange={handleChange}
                  placeholder="https://example.com/component.jpg"
                />

                <div className="drawer-lazy-preview-container">
                  <div className="preview-box" title="Lazy Image Preview">
                    {imgLoading && (
                      <div className="preview-loading-spinner">
                        <span className="spinner-ring"></span>
                      </div>
                    )}
                    {imgError || !formData.img || formData.img === "/pcbackground.png" ? (
                      <div className="preview-fallback-icon">
                        <HardwareIcon category={formData.category} size={36} color="#00F2FE" />
                        <span className="fallback-text">Default Icon</span>
                      </div>
                    ) : (
                      <img
                        src={formData.img}
                        alt="Preview"
                        onLoad={() => setImgLoading(false)}
                        onError={() => {
                          setImgLoading(false);
                          setImgError(true);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="drawer-form-group">
              <label htmlFor="drawer-desc">Description</label>
              <textarea
                id="drawer-desc"
                name="desc"
                value={formData.desc}
                onChange={handleChange}
                rows="3"
                placeholder="Component technical highlights, cooling architecture, and build recommendations..."
              />
            </div>

            <div className="drawer-form-group">
              <label htmlFor="drawer-tags">Tags (Comma-Separated)</label>
              <input
                id="drawer-tags"
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., Gaming, White, ARGB, PCIe 5.0"
              />
            </div>

            <div className="matrix-tags-section">
              <div className="matrix-header">
                <span className="matrix-accent-dot"></span>
                <h3>Compatibility Matrix Tags</h3>
                <span className="matrix-badge">Engine Crucial</span>
              </div>
              <p className="matrix-desc">
                Defines physical and electrical pinout rules for BuildLab's real-time PC Compatibility Engine.
              </p>

              <div className="matrix-fields-grid">
                {(["case", "motherboard"].includes(formData.category)) && (
                  <div className="drawer-form-group">
                    <label>Form Factor (ATX, Micro-ATX, Mini-ITX)</label>
                    <input
                      type="text"
                      name="form_factor"
                      value={formData.form_factor}
                      onChange={handleChange}
                      placeholder="e.g., ATX, Micro-ATX"
                    />
                  </div>
                )}

                {(["cpu", "motherboard"].includes(formData.category)) && (
                  <div className="drawer-form-group">
                    <label>Socket Type (AM4, AM5, LGA1700, LGA1851)</label>
                    <input
                      type="text"
                      name="socket_type"
                      value={formData.socket_type}
                      onChange={handleChange}
                      placeholder="e.g., AM5, LGA1700"
                    />
                  </div>
                )}

                {(["motherboard", "ram"].includes(formData.category)) && (
                  <div className="drawer-form-group">
                    <label>DDR Memory Type (DDR4, DDR5)</label>
                    <input
                      type="text"
                      name="ddr_type"
                      value={formData.ddr_type}
                      onChange={handleChange}
                      placeholder="e.g., DDR5, DDR4"
                    />
                  </div>
                )}

                {(["cpu", "psu"].includes(formData.category)) && (
                  <div className="drawer-form-group">
                    <label>Wattage (TDP or Power Delivery in Watts)</label>
                    <input
                      type="number"
                      name="wattage"
                      value={formData.wattage}
                      onChange={handleChange}
                      placeholder="e.g., 65, 750, 850"
                    />
                  </div>
                )}

                {formData.category === "gpu" && (
                  <div className="drawer-form-group">
                    <label>Power Required (GPU TDP / Watts)</label>
                    <input
                      type="number"
                      name="power_required"
                      value={formData.power_required}
                      onChange={handleChange}
                      placeholder="e.g., 250, 320"
                    />
                  </div>
                )}

                {(["ram", "storage"].includes(formData.category)) && (
                  <div className="drawer-form-group">
                    <label>Capacity (e.g., 16GB, 32GB, 1TB, 2TB)</label>
                    <input
                      type="text"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="e.g., 32GB, 1TB"
                    />
                  </div>
                )}

                {formData.category === "ram" && (
                  <div className="drawer-form-group">
                    <label>Speed (e.g., 3200MHz, 6000MHz)</label>
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
                  <div className="drawer-form-group">
                    <label>Drive Type (NVMe M.2, 2.5" SATA)</label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      placeholder="e.g., NVMe M.2"
                    />
                  </div>
                )}

                {formData.category === "psu" && (
                  <div className="drawer-form-group">
                    <label>Efficiency Rating (80+ Gold, Bronze)</label>
                    <input
                      type="text"
                      name="efficiency"
                      value={formData.efficiency}
                      onChange={handleChange}
                      placeholder="e.g., 80+ Gold"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="drawer-actions-row">
              <button
                type="submit"
                className={`drawer-btn-primary ${isScrapedVerification ? "btn-verify-push" : ""}`}
                disabled={saving}
              >
                {saving
                  ? "Saving Changes..."
                  : isScrapedVerification
                  ? "Approve & Push to Production"
                  : isEditing
                  ? "Save Changes"
                  : "Add Component to Inventory"}
              </button>

              <button
                type="button"
                className="drawer-btn-ghost"
                onClick={handleCancelAndClear}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );

  return ReactDOM.createPortal(drawerContent, document.body);
};

export default EditComponentDrawer;
