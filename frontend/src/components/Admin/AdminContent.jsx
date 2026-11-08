import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./Admin.css";

export const AdminContent = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Drawer / Modal states
  const [editingMember, setEditingMember] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const getAdminKey = () => localStorage.getItem("adminKey") || "admin123";

  const showToast = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/content/team");
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load team content:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle image upload to backend
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WEBP).", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Image size must be less than 10MB.", "error");
      return;
    }

    try {
      setUploadingPhoto(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        try {
          const res = await fetch("/api/upload/profile-photo", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-key": getAdminKey()
            },
            body: JSON.stringify({ image: base64Data, filename: file.name })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to upload photo");
          }

          const result = await res.json();
          if (editingMember) {
            setEditingMember((prev) => ({ ...prev, photo_url: result.url }));
          }
          showToast("Profile photo uploaded! Click 'Save & Sync' to persist changes.");
        } catch (uploadErr) {
          console.error("Upload error:", uploadErr);
          showToast(uploadErr.message || "Failed to upload photo.", "error");
        } finally {
          setUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File reading error:", err);
      setUploadingPhoto(false);
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      // Normalize contributions & tech stack
      let key_contributions = editingMember.key_contributions;
      if (typeof key_contributions === "string") {
        key_contributions = key_contributions.split("\n").map((s) => s.trim()).filter(Boolean);
      }

      let tech_stack = editingMember.tech_stack;
      if (typeof tech_stack === "string") {
        tech_stack = tech_stack.split(",").map((s) => s.trim()).filter(Boolean);
      }

      const payload = {
        ...editingMember,
        key_contributions,
        tech_stack
      };

      const res = await fetch(`/api/content/team/${editingMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": getAdminKey()
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      showToast(`Operative ${editingMember.name || editingMember.id} synced to About Us!`);
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-layout-container">
        <AdminSidebar />

        <main className="admin-main-content">
          <AdminHeader breadcrumbCurrent="Content Management" />

          <div className="admin-content-inner">
            {notification && (
              <div className={`admin-alert-banner ${notification.type === "error" ? "error" : "success"}`}>
                <span className="alert-icon">{notification.type === "error" ? "⚠" : "✓"}</span>
                <span>{notification.message}</span>
              </div>
            )}

            {/* Banner Header */}
            <div className="content-mgmt-header-banner">
              <div className="content-title-group">
                <div className="content-kicker">CONTROL PANEL // PUBLIC CONTENT &amp; DOSSIERS</div>
                <h1 className="content-title">Content Management</h1>
                <p className="content-subtitle">
                  Edit developer profiles, upload high-resolution profile photos, customize tech stacks, and update personal rig specs. All updates automatically synchronize to the public <Link to="/about" target="_blank" className="text-emerald underline">About Us</Link> page.
                </p>
              </div>

              <div className="content-sync-status-card">
                <div className="sync-status-indicator">
                  <span className="sync-pulse-dot" />
                  <span className="sync-status-text">AUTO-SYNC ACTIVE</span>
                </div>
                <div className="sync-target-info">Target: /about &bull; {members.length} Operatives</div>
              </div>
            </div>

            {/* Operatives Cards Grid */}
            <div className="operatives-roster-container">
              <div className="roster-header-bar">
                <div className="roster-header-title">
                  <span className="tag-bracket">[</span>
                  <span>THE WHITEHATS &bull; DEVELOPER ROSTER</span>
                  <span className="tag-bracket">]</span>
                </div>
                <div className="roster-header-actions">
                  <Link to="/about" target="_blank" className="btn-view-live-about">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    <span>Preview Live Page</span>
                  </Link>
                  <button type="button" className="btn-refresh-accounts" onClick={fetchMembers}>
                    Sync
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="accounts-loading-state">
                  <div className="loading-spinner" />
                  <span>Loading operative dossiers...</span>
                </div>
              ) : error ? (
                <div className="accounts-error-state">
                  <span>Failed to load team content: {error}</span>
                  <button type="button" onClick={fetchMembers} className="btn-retry">Retry</button>
                </div>
              ) : (
                <div className="operatives-grid">
                  {members.map((member) => (
                    <div key={member.id} className="operative-card">
                      <div className="operative-card-header">
                        <span className="operative-id-badge">{member.id}</span>
                        <span className="operative-role-pill">{member.avatar_badge || "DEV"}</span>
                      </div>

                      <div className="operative-avatar-preview-wrap">
                        <div className="avatar-hex-frame-admin">
                          <svg viewBox="0 0 100 100" className="avatar-hex-svg">
                            <polygon points="50 3, 93 26, 93 74, 50 97, 7 74, 7 26" className="hex-outer" />
                            <polygon points="50 10, 85 29, 85 71, 50 90, 15 71, 15 29" className="hex-inner" />
                          </svg>
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="avatar-img-admin"
                              onError={(e) => {
                                e.target.style.display = "none";
                                if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="avatar-fallback-initials"
                            style={{ display: member.photo_url ? "none" : "flex" }}
                          >
                            {member.codename ? member.codename.slice(0, 3) : member.id}
                          </div>
                        </div>
                      </div>

                      <div className="operative-card-body">
                        <h3 className="operative-name">{member.name}</h3>
                        <div className="operative-designation">{member.designation}</div>
                        <div className="operative-codename">CODENAME: {member.codename}</div>

                        <div className="operative-highlight">
                          <span className="highlight-tag">{member.highlight}</span>
                        </div>

                        <p className="operative-bio-snippet">{member.bio}</p>

                        <div className="operative-tech-preview">
                          {(Array.isArray(member.tech_stack) ? member.tech_stack : []).slice(0, 3).map((t, idx) => (
                            <span key={idx} className="tech-chip">{t}</span>
                          ))}
                        </div>
                      </div>

                      <div className="operative-card-footer">
                        <button
                          type="button"
                          className="btn-edit-operative"
                          onClick={() => setEditingMember({
                            ...member,
                            key_contributions: Array.isArray(member.key_contributions) ? member.key_contributions.join("\n") : (member.key_contributions || ""),
                            tech_stack: Array.isArray(member.tech_stack) ? member.tech_stack.join(", ") : (member.tech_stack || ""),
                            rig_specs: member.rig_specs || {}
                          })}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                          <span>Edit Details &amp; Photo</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* EDIT OPERATIVE DRAWER / MODAL */}
            {editingMember && (
              <div className="admin-modal-backdrop" onClick={() => setEditingMember(null)}>
                <div className="admin-modal-card modal-lg wood-mahogany" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <div className="modal-title-wrap">
                      <span className="modal-kicker">CONTENT MANAGER // LIVE DOSSIER EDITOR</span>
                      <h2 className="modal-title">Edit Operative Profile &bull; {editingMember.id}</h2>
                    </div>
                    <button
                      type="button"
                      className="modal-close-btn"
                      onClick={() => setEditingMember(null)}
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleSaveMember} className="modal-form">
                    {/* PHOTO UPLOADER SECTION */}
                    <div className="content-photo-upload-section">
                      <label className="form-label">PROFILE PHOTO // LIVE HEXAGON PREVIEW &amp; UPLOAD</label>
                      <div className="photo-editor-row">
                        <div className="photo-preview-hex-wrap">
                          <div className="avatar-hex-frame-admin hex-large">
                            <svg viewBox="0 0 100 100" className="avatar-hex-svg">
                              <polygon points="50 3, 93 26, 93 74, 50 97, 7 74, 7 26" className="hex-outer" />
                              <polygon points="50 10, 85 29, 85 71, 50 90, 15 71, 15 29" className="hex-inner" />
                            </svg>
                            {editingMember.photo_url ? (
                              <img src={editingMember.photo_url} alt="Preview" className="avatar-img-admin" />
                            ) : null}
                            <div
                              className="avatar-fallback-initials"
                              style={{ display: editingMember.photo_url ? "none" : "flex" }}
                            >
                              {editingMember.codename ? editingMember.codename.slice(0, 3) : editingMember.id}
                            </div>
                          </div>
                        </div>

                        <div className="photo-inputs-col">
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e.target.files[0])}
                          />
                          <div className="photo-buttons-row">
                            <button
                              type="button"
                              className="btn-upload-photo-large"
                              disabled={uploadingPhoto}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                              <span>{uploadingPhoto ? "Uploading..." : "Upload Local Photo (PNG / JPG)"}</span>
                            </button>

                            {editingMember.photo_url && (
                              <button
                                type="button"
                                className="btn-remove-photo"
                                onClick={() => setEditingMember({ ...editingMember, photo_url: "" })}
                              >
                                Clear Photo
                              </button>
                            )}
                          </div>

                          <div className="photo-url-field">
                            <label className="text-xs text-muted">Or Direct Image URL:</label>
                            <input
                              type="text"
                              placeholder="https://... or /uploads/profiles/..."
                              className="form-input text-xs"
                              value={editingMember.photo_url || ""}
                              onChange={(e) => setEditingMember({ ...editingMember, photo_url: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* IDENTITY FIELDS */}
                    <div className="form-row-3">
                      <div className="form-group">
                        <label className="form-label">OPERATIVE ID *</label>
                        <input
                          type="text"
                          required
                          disabled
                          className="form-input disabled"
                          value={editingMember.id}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">FULL NAME *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Developer 01"
                          className="form-input"
                          value={editingMember.name || ""}
                          onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">CODENAME *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SYSTEM_CORE"
                          className="form-input"
                          value={editingMember.codename || ""}
                          onChange={(e) => setEditingMember({ ...editingMember, codename: e.target.value.toUpperCase() })}
                        />
                      </div>
                    </div>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label className="form-label">DESIGNATION *</label>
                        <input
                          type="text"
                          required
                          placeholder="Lead Systems Architect & Full-Stack Engineer"
                          className="form-input"
                          value={editingMember.designation || ""}
                          onChange={(e) => setEditingMember({ ...editingMember, designation: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">CATEGORY</label>
                        <select
                          className="form-select"
                          value={editingMember.role_category || "core"}
                          onChange={(e) => setEditingMember({ ...editingMember, role_category: e.target.value })}
                        >
                          <option value="core">Core &amp; 3D</option>
                          <option value="frontend">Frontend &amp; UX</option>
                          <option value="backend">Backend &amp; QA</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">BADGE TAG</label>
                        <input
                          type="text"
                          placeholder="ARCH, UI/UX, 3D/GL, etc."
                          className="form-input"
                          value={editingMember.avatar_badge || ""}
                          onChange={(e) => setEditingMember({ ...editingMember, avatar_badge: e.target.value.toUpperCase() })}
                        />
                      </div>
                    </div>

                    {/* BIO & SPECIALTY */}
                    <div className="form-group">
                      <label className="form-label">SPECIALTY FOCUS / HIGHLIGHT</label>
                      <input
                        type="text"
                        placeholder="e.g. Core Architecture & State Matrix"
                        className="form-input"
                        value={editingMember.highlight || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, highlight: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">ENGINEERING BIO</label>
                      <textarea
                        rows={3}
                        placeholder="Detailed professional bio..."
                        className="form-textarea"
                        value={editingMember.bio || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                      />
                    </div>

                    {/* KEY CONTRIBUTIONS */}
                    <div className="form-group">
                      <label className="form-label">KEY CONTRIBUTIONS (ONE PER LINE)</label>
                      <textarea
                        rows={3}
                        placeholder="Engineered multi-tier component picker&#10;Integrated Three.js WebGL canvas&#10;Architected real-time bottleneck algorithms"
                        className="form-textarea font-mono text-xs"
                        value={editingMember.key_contributions || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, key_contributions: e.target.value })}
                      />
                    </div>

                    {/* TECH STACK */}
                    <div className="form-group">
                      <label className="form-label">PRIMARY TECHNOLOGIES (COMMA SEPARATED)</label>
                      <input
                        type="text"
                        placeholder="React 19, Three.js, Node.js, Express, MySQL"
                        className="form-input font-mono text-xs"
                        value={editingMember.tech_stack || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, tech_stack: e.target.value })}
                      />
                    </div>

                    {/* PERSONAL RIG SPECS */}
                    <div className="form-rig-section">
                      <label className="form-label">PERSONAL PC RIG HARDWARE SPECS</label>
                      <div className="form-row-2">
                        <div className="form-group">
                          <label className="text-xs text-muted">CPU</label>
                          <input
                            type="text"
                            placeholder="AMD Ryzen 9 7900X"
                            className="form-input text-xs"
                            value={editingMember.rig_specs?.cpu || ""}
                            onChange={(e) => setEditingMember({
                              ...editingMember,
                              rig_specs: { ...editingMember.rig_specs, cpu: e.target.value }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="text-xs text-muted">GPU</label>
                          <input
                            type="text"
                            placeholder="NVIDIA GeForce RTX 4080 Super"
                            className="form-input text-xs"
                            value={editingMember.rig_specs?.gpu || ""}
                            onChange={(e) => setEditingMember({
                              ...editingMember,
                              rig_specs: { ...editingMember.rig_specs, gpu: e.target.value }
                            })}
                          />
                        </div>
                      </div>

                      <div className="form-row-3">
                        <div className="form-group">
                          <label className="text-xs text-muted">RAM</label>
                          <input
                            type="text"
                            placeholder="64GB DDR5-6000 CL30"
                            className="form-input text-xs"
                            value={editingMember.rig_specs?.ram || ""}
                            onChange={(e) => setEditingMember({
                              ...editingMember,
                              rig_specs: { ...editingMember.rig_specs, ram: e.target.value }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="text-xs text-muted">STORAGE</label>
                          <input
                            type="text"
                            placeholder="2TB PCIe Gen4 NVMe"
                            className="form-input text-xs"
                            value={editingMember.rig_specs?.storage || ""}
                            onChange={(e) => setEditingMember({
                              ...editingMember,
                              rig_specs: { ...editingMember.rig_specs, storage: e.target.value }
                            })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="text-xs text-muted">CHASSIS / CASE</label>
                          <input
                            type="text"
                            placeholder="Lian Li O11 Dynamic EVO"
                            className="form-input text-xs"
                            value={editingMember.rig_specs?.chassis || ""}
                            onChange={(e) => setEditingMember({
                              ...editingMember,
                              rig_specs: { ...editingMember.rig_specs, chassis: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* HARDWARE TIP & SOCIAL LINKS */}
                    <div className="form-group">
                      <label className="form-label">FAVORITE PC BUILDING TIP</label>
                      <textarea
                        rows={2}
                        placeholder="Never cheap out on your power supply..."
                        className="form-textarea"
                        value={editingMember.fav_tip || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, fav_tip: e.target.value })}
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">GITHUB PROFILE</label>
                        <input
                          type="url"
                          placeholder="https://github.com/..."
                          className="form-input text-xs"
                          value={editingMember.github || ""}
                          onChange={(e) => setEditingMember({ ...editingMember, github: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">LINKEDIN PROFILE</label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/..."
                          className="form-input text-xs"
                          value={editingMember.linkedin || ""}
                          onChange={(e) => setEditingMember({ ...editingMember, linkedin: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="modal-actions-bar">
                      <button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={() => setEditingMember(null)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-modal-submit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Save &amp; Sync to About Us</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminContent;
