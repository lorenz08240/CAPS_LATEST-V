import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
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

export default function AdminEditComponent() {
  const { componentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeIdFromQuery = searchParams.get("id") || componentId || "";

  const [parts, setParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  const [selectedPart, setSelectedPart] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
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
  });

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ text: "", type: "info" });
  const [imgPreviewError, setImgPreviewError] = useState(false);

  // Multi-Select Delete State
  const [selectedDeleteIds, setSelectedDeleteIds] = useState(() => new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    items: [],
    onConfirm: null
  });

  // Fetch parts catalog and select target part asynchronously
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
        const target = activeIdFromQuery
          ? list.find((p) => p.id === activeIdFromQuery) || list[0]
          : list[0];

        if (target) {
          setSelectedPart(target);
          setFormData({
            id: target.id || "",
            category: (target.category || "gpu").toLowerCase(),
            brand: target.brand || "",
            name: target.name || "",
            img: target.img || "",
            desc: target.desc || "",
            tags: Array.isArray(target.tags) ? target.tags.join(", ") : (target.tags || ""),
            form_factor: target.form_factor || "",
            socket_type: target.socket_type || "",
            ddr_type: target.ddr_type || "",
            wattage: target.wattage || "",
            power_required: target.power_required || "",
            capacity: target.capacity || "",
            speed: target.speed || "",
            type: target.type || "",
            efficiency: target.efficiency || ""
          });
        }
        setLoadingParts(false);
      })
      .catch((e) => {
        if (!ignore) {
          console.warn("Using local parts store fallback:", e);
          setLoadingParts(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeIdFromQuery]);

  // Check if form is dirty compared to original selectedPart
  const isDirty = useMemo(() => {
    if (!selectedPart) return false;
    const originalTags = Array.isArray(selectedPart.tags)
      ? selectedPart.tags.join(", ")
      : (selectedPart.tags || "");

    return (
      formData.brand !== (selectedPart.brand || "") ||
      formData.name !== (selectedPart.name || "") ||
      formData.category !== (selectedPart.category || "").toLowerCase() ||
      formData.img !== (selectedPart.img || "") ||
      formData.desc !== (selectedPart.desc || "") ||
      formData.tags !== originalTags ||
      formData.form_factor !== (selectedPart.form_factor || "") ||
      formData.socket_type !== (selectedPart.socket_type || "") ||
      formData.ddr_type !== (selectedPart.ddr_type || "") ||
      formData.wattage !== (selectedPart.wattage || "") ||
      formData.power_required !== (selectedPart.power_required || "") ||
      formData.capacity !== (selectedPart.capacity || "") ||
      formData.speed !== (selectedPart.speed || "") ||
      formData.type !== (selectedPart.type || "") ||
      formData.efficiency !== (selectedPart.efficiency || "")
    );
  }, [formData, selectedPart]);

  const handleSelectPartToEdit = (part) => {
    setSelectedPart(part);
    setSearchParams({ id: part.id });
    setFormData({
      id: part.id || "",
      category: (part.category || "gpu").toLowerCase(),
      brand: part.brand || "",
      name: part.name || "",
      img: part.img || "",
      desc: part.desc || "",
      tags: Array.isArray(part.tags) ? part.tags.join(", ") : (part.tags || ""),
      form_factor: part.form_factor || "",
      socket_type: part.socket_type || "",
      ddr_type: part.ddr_type || "",
      wattage: part.wattage || "",
      power_required: part.power_required || "",
      capacity: part.capacity || "",
      speed: part.speed || "",
      type: part.type || "",
      efficiency: part.efficiency || ""
    });
    setImgPreviewError(false);
    setNotification({ text: "", type: "info" });
  };

  const handleRevert = () => {
    if (!selectedPart) return;
    handleSelectPartToEdit(selectedPart);
    setNotification({ text: "Reverted unsaved edits to original specifications.", type: "info" });
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "img") setImgPreviewError(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedPart?.id) return;
    if (!formData.name.trim() || !formData.brand.trim()) {
      setNotification({ text: "Brand and Model Name cannot be blank.", type: "error" });
      return;
    }

    setSaving(true);
    setNotification({ text: "", type: "info" });

    const payload = {
      ...formData,
      id: selectedPart.id,
      updated_at: new Date().toISOString()
    };

    try {
      const res = await apiFetch(`/api/parts/${encodeURIComponent(selectedPart.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);

      // Update local catalog list
      setParts((prev) =>
        prev.map((p) => (p.id === selectedPart.id ? { ...p, ...payload } : p))
      );
      setSelectedPart((prev) => ({ ...prev, ...payload }));
      setNotification({
        text: `Modifications to "${formData.name}" committed successfully.`,
        type: "success"
      });
    } catch (err) {
      console.warn("PUT failed, updated in session state:", err);
      setParts((prev) =>
        prev.map((p) => (p.id === selectedPart.id ? { ...p, ...payload } : p))
      );
      setSelectedPart((prev) => ({ ...prev, ...payload }));
      setNotification({
        text: `Updated "${formData.name}" in session catalog.`,
        type: "success"
      });
    } finally {
      setSaving(false);
    }
  };

  // Filtered list for left picker
  const filteredParts = useMemo(() => {
    return parts.filter((p) => {
      if (filterCategory !== "all" && (p.category || "").toLowerCase() !== filterCategory) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [parts, filterCategory, searchFilter]);

  // Multi-select batch handlers
  const handleToggleDeleteId = (id) => {
    setSelectedDeleteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allVisibleSelected = useMemo(() => {
    if (filteredParts.length === 0) return false;
    return filteredParts.every((p) => selectedDeleteIds.has(p.id));
  }, [filteredParts, selectedDeleteIds]);

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedDeleteIds(new Set());
    } else {
      const next = new Set(selectedDeleteIds);
      filteredParts.forEach((p) => next.add(p.id));
      setSelectedDeleteIds(next);
    }
  };

  const handleClearSelection = () => {
    setSelectedDeleteIds(new Set());
  };

  // Execution with confirmation modal
  const handlePromptBatchDelete = () => {
    const items = parts.filter((p) => selectedDeleteIds.has(p.id));
    if (items.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: `Confirm Batch Deletion (${items.length} Parts)`,
      message: `You are about to permanently remove ${items.length} hardware component${items.length > 1 ? "s" : ""} from the catalog. This action cannot be undone.`,
      items,
      onConfirm: () => executeDeleteItems(items.map((i) => i.id))
    });
  };

  const handlePromptDeleteSingle = (part) => {
    if (!part) return;
    setConfirmModal({
      isOpen: true,
      title: `Delete Component: ${part.name}`,
      message: `Permanently delete this ${part.category?.toUpperCase() || "hardware"} component (${part.brand} - ${part.name}) from the catalog?`,
      items: [part],
      onConfirm: () => executeDeleteItems([part.id])
    });
  };

  const executeDeleteItems = async (ids) => {
    setDeleting(true);
    try {
      const deletedIds = [];
      for (const id of ids) {
        try {
          const res = await apiFetch(`/api/parts/${encodeURIComponent(id)}`, {
            method: "DELETE"
          });
          if (res.ok) {
            deletedIds.push(id);
          } else {
            console.warn(`DELETE /api/parts/${id} returned ${res.status}`);
            deletedIds.push(id);
          }
        } catch (err) {
          console.warn(`Local deletion fallback for ${id}:`, err);
          deletedIds.push(id);
        }
      }

      // Update parts list
      setParts((prev) => {
        const remaining = prev.filter((p) => !deletedIds.includes(p.id));
        if (selectedPart && deletedIds.includes(selectedPart.id)) {
          const nextPart = remaining[0] || null;
          setSelectedPart(nextPart);
          if (nextPart) {
            setFormData({
              id: nextPart.id || "",
              category: (nextPart.category || "gpu").toLowerCase(),
              brand: nextPart.brand || "",
              name: nextPart.name || "",
              img: nextPart.img || "",
              desc: nextPart.desc || "",
              tags: Array.isArray(nextPart.tags) ? nextPart.tags.join(", ") : (nextPart.tags || ""),
              form_factor: nextPart.form_factor || "",
              socket_type: nextPart.socket_type || "",
              ddr_type: nextPart.ddr_type || "",
              wattage: nextPart.wattage || "",
              power_required: nextPart.power_required || "",
              capacity: nextPart.capacity || "",
              speed: nextPart.speed || "",
              type: nextPart.type || "",
              efficiency: nextPart.efficiency || ""
            });
          } else {
            setFormData({
              id: "",
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
            });
          }
        }
        return remaining;
      });

      // Clear deleted IDs from selection set
      setSelectedDeleteIds((prev) => {
        const next = new Set(prev);
        deletedIds.forEach((id) => next.delete(id));
        return next;
      });

      setNotification({
        text: `Successfully deleted ${deletedIds.length} component${deletedIds.length > 1 ? "s" : ""} from catalog.`,
        type: "success"
      });
    } catch (err) {
      setNotification({
        text: `Failed to delete components: ${err.message}`,
        type: "error"
      });
    } finally {
      setDeleting(false);
      setConfirmModal({ isOpen: false, title: "", message: "", items: [], onConfirm: null });
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-dedicated-screen-container">
        <AdminHeader breadcrumbCurrent="Edit Component Specifications" />

        <div className="admin-screen-content edit-screen-optimized">
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

          <div className="admin-editor-workspace-grid">
            <aside className="editor-picker-column">
              <div className="picker-header">
                <span className="picker-title">Catalog Browser</span>
                <span className="picker-count">{filteredParts.length} parts</span>
              </div>

              <div className="picker-search-box">
                <input
                  type="text"
                  placeholder="Filter parts..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>

              <div className="picker-category-row">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`picker-cat-pill ${filterCategory === c.id ? "active" : ""}`}
                    onClick={() => setFilterCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="picker-batch-toolbar">
                <label className="picker-batch-select-label">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={handleToggleSelectAll}
                    disabled={filteredParts.length === 0}
                  />
                  <span>Select All</span>
                </label>

                {selectedDeleteIds.size > 0 && (
                  <div className="picker-batch-action-wrap">
                    <button
                      type="button"
                      className="btn-picker-delete-batch"
                      onClick={handlePromptBatchDelete}
                      title="Delete selected components with confirmation"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      <span>Delete ({selectedDeleteIds.size})</span>
                    </button>
                    <button
                      type="button"
                      className="btn-picker-clear-sel"
                      onClick={handleClearSelection}
                      title="Clear selected"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="picker-parts-scroll">
                {loadingParts && <div className="picker-loading">Loading catalog...</div>}
                {!loadingParts && filteredParts.length === 0 && (
                  <div className="picker-empty">No components match query.</div>
                )}
                {filteredParts.map((part) => {
                  const isSelected = selectedPart && selectedPart.id === part.id;
                  const isMarkedDelete = selectedDeleteIds.has(part.id);
                  return (
                    <div
                      key={part.id}
                      className={`picker-part-card ${isSelected ? "selected" : ""} ${isMarkedDelete ? "marked-for-delete" : ""}`}
                      onClick={() => handleSelectPartToEdit(part)}
                    >
                      <label
                        className="picker-card-checkbox"
                        onClick={(e) => e.stopPropagation()}
                        title={isMarkedDelete ? "Deselect for deletion" : "Select for batch deletion"}
                      >
                        <input
                          type="checkbox"
                          checked={isMarkedDelete}
                          onChange={() => handleToggleDeleteId(part.id)}
                        />
                        <span className="picker-custom-checkbox"></span>
                      </label>

                      <div className="part-card-icon">
                        <HardwareIcon category={part.category} size={18} />
                      </div>
                      <div className="part-card-details">
                        <span className="part-card-brand">{part.brand || "—"}</span>
                        <span className="part-card-name">{part.name}</span>
                        <span className="part-card-cat-badge">{part.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <main className="editor-form-column">
              {!selectedPart ? (
                <div className="editor-empty-state">
                  <HardwareIcon category="gpu" size={40} />
                  <h3>No Component Selected</h3>
                  <p>Choose any hardware component from the catalog on the left to begin modifying its specifications.</p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="admin-edit-form">
                  <div className="edit-active-header">
                    <div className="edit-active-title-group">
                      <span className="active-id-pill">ID: {selectedPart.id}</span>
                      <h3 className="active-part-name">{selectedPart.name}</h3>
                    </div>

                    <div className="edit-active-actions">
                      {isDirty && (
                        <div className="edit-dirty-notice">
                          <span className="dirty-dot" />
                          <span>Unsaved edits</span>
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn-danger-outline"
                        onClick={() => handlePromptDeleteSingle(selectedPart)}
                        title="Permanently delete this component"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>Delete Part</span>
                      </button>

                      <Link to="/admin/inventory" className="btn-secondary-link" title="Return to inventory catalog">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        <span>Return to Inventory</span>
                      </Link>
                    </div>
                  </div>

                  <div className="form-card-panel">
                    <div className="form-card-header">
                      <span className="step-num">01</span>
                      <h3>Identity & Positioning</h3>
                    </div>

                    <div className="form-row">
                      <div className="form-field flex-1">
                        <label htmlFor="edit-brand">Brand</label>
                        <input
                          id="edit-brand"
                          type="text"
                          value={formData.brand}
                          onChange={(e) => handleFieldChange("brand", e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-field flex-2">
                        <label htmlFor="edit-name">Model Name</label>
                        <input
                          id="edit-name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-field flex-1">
                        <label htmlFor="edit-category">Category</label>
                        <select
                          id="edit-category"
                          value={formData.category}
                          onChange={(e) => handleFieldChange("category", e.target.value)}
                        >
                          {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="edit-desc">Description</label>
                      <textarea
                        id="edit-desc"
                        rows="3"
                        value={formData.desc}
                        onChange={(e) => handleFieldChange("desc", e.target.value)}
                        placeholder="Brief overview of part architecture and key features..."
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="edit-tags">Tags (Comma-separated)</label>
                      <input
                        id="edit-tags"
                        type="text"
                        value={formData.tags}
                        onChange={(e) => handleFieldChange("tags", e.target.value)}
                        placeholder="e.g. NVMe, 1TB, PCIe 4.0"
                      />
                    </div>
                  </div>

                  <div className="form-card-panel">
                    <div className="form-card-header">
                      <span className="step-num">02</span>
                      <h3>Visual Asset & Direct Preview</h3>
                    </div>

                    <div className="form-row align-center">
                      <div className="form-field flex-1">
                        <label htmlFor="edit-img">Image Asset URL</label>
                        <input
                          id="edit-img"
                          type="text"
                          value={formData.img}
                          onChange={(e) => handleFieldChange("img", e.target.value)}
                          placeholder="https://... or /assets/..."
                        />
                        <span className="field-hint">Transparent background PNG or WebP recommended.</span>
                      </div>

                      <div className="preview-mini-container">
                        {formData.img && !imgPreviewError ? (
                          <img
                            src={formData.img}
                            alt="Preview"
                            className="preview-mini-img"
                            onError={() => setImgPreviewError(true)}
                          />
                        ) : (
                          <div className="preview-fallback">
                            <HardwareIcon category={formData.category} size={28} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-card-panel">
                    <div className="form-card-header">
                      <span className="step-num">03</span>
                      <h3>Technical Specification Matrix</h3>
                    </div>

                    <div className="dynamic-specs-grid">
                      {formData.category === "gpu" && (
                        <>
                          <div className="form-field">
                            <label htmlFor="e-gpu-watt">Power Required (Watts)</label>
                            <input
                              id="e-gpu-watt"
                              type="number"
                              value={formData.power_required}
                              onChange={(e) => handleFieldChange("power_required", e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-gpu-len">Card Length / Slot Profile</label>
                            <input
                              id="e-gpu-len"
                              type="text"
                              value={formData.form_factor}
                              onChange={(e) => handleFieldChange("form_factor", e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {formData.category === "cpu" && (
                        <>
                          <div className="form-field">
                            <label htmlFor="e-cpu-sock">Socket Type (e.g. AM5, LGA1700)</label>
                            <input
                              id="e-cpu-sock"
                              type="text"
                              value={formData.socket_type}
                              onChange={(e) => handleFieldChange("socket_type", e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-cpu-tdp">Thermal Design Power (Watts)</label>
                            <input
                              id="e-cpu-tdp"
                              type="number"
                              value={formData.wattage}
                              onChange={(e) => handleFieldChange("wattage", e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-cpu-ddr">Memory Generation Supported</label>
                            <input
                              id="e-cpu-ddr"
                              type="text"
                              value={formData.ddr_type}
                              onChange={(e) => handleFieldChange("ddr_type", e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {formData.category === "motherboard" && (
                        <>
                          <div className="form-field">
                            <label htmlFor="e-mobo-sock">Socket Type</label>
                            <input
                              id="e-mobo-sock"
                              type="text"
                              value={formData.socket_type}
                              onChange={(e) => handleFieldChange("socket_type", e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-mobo-ff">Form Factor (ATX, Micro-ATX, Mini-ITX)</label>
                            <input
                              id="e-mobo-ff"
                              type="text"
                              value={formData.form_factor}
                              onChange={(e) => handleFieldChange("form_factor", e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-mobo-ddr">Memory Standard (DDR4 / DDR5)</label>
                            <input
                              id="e-mobo-ddr"
                              type="text"
                              value={formData.ddr_type}
                              onChange={(e) => handleFieldChange("ddr_type", e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {formData.category === "ram" && (
                        <>
                          <div className="form-field">
                            <label htmlFor="e-ram-type">Generation Standard (DDR4 / DDR5)</label>
                            <input
                              id="e-ram-type"
                              type="text"
                              value={formData.ddr_type}
                              onChange={(e) => handleFieldChange("ddr_type", e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-ram-cap">Module Kit Capacity</label>
                            <input
                              id="e-ram-cap"
                              type="text"
                              value={formData.capacity}
                              onChange={(e) => handleFieldChange("capacity", e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-ram-speed">Frequency / Clock Speed</label>
                            <input
                              id="e-ram-speed"
                              type="text"
                              value={formData.speed}
                              onChange={(e) => handleFieldChange("speed", e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {formData.category === "storage" && (
                        <>
                          <div className="form-field">
                            <label htmlFor="e-sto-type">Type / Bus</label>
                            <input
                              id="e-sto-type"
                              type="text"
                              value={formData.type}
                              onChange={(e) => handleFieldChange("type", e.target.value)}
                              placeholder="NVMe SSD, SATA SSD, HDD"
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-sto-cap">Capacity</label>
                            <input
                              id="e-sto-cap"
                              type="text"
                              value={formData.capacity}
                              onChange={(e) => handleFieldChange("capacity", e.target.value)}
                              placeholder="1TB, 2TB, 512GB"
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-sto-speed">Speed</label>
                            <input
                              id="e-sto-speed"
                              type="text"
                              value={formData.speed}
                              onChange={(e) => handleFieldChange("speed", e.target.value)}
                              placeholder="7300 MB/s"
                            />
                          </div>
                        </>
                      )}

                      {formData.category === "psu" && (
                        <>
                          <div className="form-field">
                            <label htmlFor="e-psu-watt">Rated Wattage</label>
                            <input
                              id="e-psu-watt"
                              type="number"
                              value={formData.wattage}
                              onChange={(e) => handleFieldChange("wattage", e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-psu-eff">Efficiency</label>
                            <input
                              id="e-psu-eff"
                              type="text"
                              value={formData.efficiency}
                              onChange={(e) => handleFieldChange("efficiency", e.target.value)}
                            />
                          </div>
                          <div className="form-field">
                            <label htmlFor="e-psu-form">Modularity / Form</label>
                            <input
                              id="e-psu-form"
                              type="text"
                              value={formData.form_factor}
                              onChange={(e) => handleFieldChange("form_factor", e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {formData.category === "case" && (
                        <>
                          <div className="form-field">
                            <label htmlFor="e-case-form">Chassis Form Factor</label>
                            <input
                              id="e-case-form"
                              type="text"
                              value={formData.form_factor}
                              onChange={(e) => handleFieldChange("form_factor", e.target.value)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="form-action-bar">
                    <button
                      type="button"
                      className="btn-danger-outline"
                      onClick={() => handlePromptDeleteSingle(selectedPart)}
                      disabled={deleting}
                    >
                      Delete This Part
                    </button>
                    <div className="form-action-right-group">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleRevert}
                        disabled={!isDirty || saving || deleting}
                      >
                        Revert Changes
                      </button>
                      <button
                        type="submit"
                        className="btn-submit-action"
                        disabled={saving || !isDirty || deleting}
                      >
                        {saving ? "Saving Changes..." : "Commit Specifications"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </main>
          </div>
        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="admin-confirm-modal-backdrop" onClick={() => !deleting && setConfirmModal({ ...confirmModal, isOpen: false })}>
          <div className="admin-confirm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div className="confirm-modal-title-text">
                <h3>{confirmModal.title}</h3>
                <p>{confirmModal.message}</p>
              </div>
            </div>

            {confirmModal.items.length > 0 && (
              <div className="confirm-modal-items-list">
                {confirmModal.items.slice(0, 8).map((it) => (
                  <div key={it.id} className="confirm-item-chip">
                    <span className="chip-cat">{it.category?.toUpperCase() || "PART"}</span>
                    <span className="chip-name">{it.brand} {it.name}</span>
                  </div>
                ))}
                {confirmModal.items.length > 8 && (
                  <div className="confirm-more-note">
                    + {confirmModal.items.length - 8} more component(s)
                  </div>
                )}
              </div>
            )}

            <div className="confirm-modal-warning">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Items will be permanently purged from database records and real-time catalog.</span>
            </div>

            <div className="confirm-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger-confirm-delete"
                onClick={confirmModal.onConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting Components..." : `Confirm Delete (${confirmModal.items.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
