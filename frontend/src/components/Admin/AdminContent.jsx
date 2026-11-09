import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import soundManager from "../../utilities/soundManager";
import "./Admin.css";

export const AdminContent = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Drawer / Modal states
  const [editingMember, setEditingMember] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'specs'
  const [uploadingPhotoId, setUploadingPhotoId] = useState(null);
  const cardFileInputRefs = useRef({});
  const modalFileInputRef = useRef(null);

  const getAdminKey = () => localStorage.getItem("adminKey") || "admin12345";

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

  // Handle direct photo upload
  const handlePhotoUpload = async (file, targetMemberId = null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WEBP).", "error");
      return;
    }

    const memberId = targetMemberId || editingMember?.id;
    if (!memberId) return;

    try {
      setUploadingPhotoId(memberId);
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
            throw new Error("Failed to upload photo");
          }

          const result = await res.json();

          // If currently editing in modal, update modal state
          if (editingMember && editingMember.id === memberId) {
            setEditingMember((prev) => ({ ...prev, photo_url: result.url }));
          }

          // Also persist directly to database for instant sync
          await fetch(`/api/content/team/${memberId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-admin-key": getAdminKey()
            },
            body: JSON.stringify({ photo_url: result.url })
          });

          showToast("Profile photo uploaded & synced live to /about!");
          fetchMembers();
        } catch (uploadErr) {
          showToast(uploadErr.message || "Upload failed.", "error");
        } finally {
          setUploadingPhotoId(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadingPhotoId(null);
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
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

      if (!res.ok) {
        throw new Error("Failed to save profile changes");
      }

      showToast(`Operative ${editingMember.name || editingMember.id} updated & synced!`);
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
                <div className="content-kicker">CONTENT MANAGER // LIVE DOSSIER EDITOR</div>
                <h1 className="content-title">Content Management</h1>
                <p className="content-subtitle">
                  Manage the 5 WhiteHats developer profiles and photos. Any changes automatically synchronize live with the public <Link to="/about" target="_blank" className="text-emerald underline">About Us</Link> page.
                </p>
              </div>

              <div className="content-sync-status-card">
                <div className="sync-status-indicator">
                  <span className="sync-pulse-dot" />
                  <span className="sync-status-text">LIVE SYNC ACTIVE</span>
                </div>
                <div className="sync-target-info">Public Target: /about ({members.length} Operatives)</div>
              </div>
            </div>

            {/* Operatives Cards Grid */}
            <div className="operatives-roster-container">
              <div className="roster-header-bar">
                <div className="roster-header-title">
                  <span className="tag-bracket">[</span>
                  <span>THE WHITEHATS &bull; DEVELOPER PROFILES</span>
                  <span className="tag-bracket">]</span>
                </div>
                <div className="roster-header-actions">
                  <Link to="/about" target="_blank" className="btn-view-live-about">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    <span>View Live /about</span>
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

                      {/* Hexagonal Avatar with 1-Click Upload Trigger */}
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

                        {/* Quick 1-click change photo button */}
                        <input
                          type="file"
                          ref={(el) => (cardFileInputRefs.current[member.id] = el)}
                          style={{ display: "none" }}
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e.target.files[0], member.id)}
                        />
                        <button
                          type="button"
                          className="btn-quick-photo-change"
                          disabled={uploadingPhotoId === member.id}
                          onClick={() => cardFileInputRefs.current[member.id]?.click()}
                          title="Upload new profile photo"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                          </svg>
                          <span>{uploadingPhotoId === member.id ? "Uploading..." : "Change Photo"}</span>
                        </button>
                      </div>

                      <div className="operative-card-body">
                        <h3 className="operative-name">{member.name}</h3>
                        <div className="operative-designation">{member.designation}</div>
                        <div className="operative-codename">CODENAME: {member.codename}</div>

                        <div className="operative-highlight">
                          <span className="highlight-tag">{member.highlight}</span>
                        </div>

                        <p className="operative-bio-snippet">{member.bio}</p>
                      </div>

                      <div className="operative-card-footer">
                        <button
                          type="button"
                          className="btn-edit-operative"
                          onClick={() => {
                            setActiveTab("profile");
                            setEditingMember({
                              ...member,
                              key_contributions: Array.isArray(member.key_contributions)
                                ? member.key_contributions.join("\n")
                                : (member.key_contributions || ""),
                              tech_stack: Array.isArray(member.tech_stack)
                                ? member.tech_stack.join(", ")
                                : (member.tech_stack || ""),
                              rig_specs: member.rig_specs || {}
                            });
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                          <span>Edit Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MINIMAL EDIT OPERATIVE MODAL */}
            {editingMember && (
              <div className="admin-modal-backdrop" onClick={() => setEditingMember(null)}>
                <div className="admin-modal-card modal-lg wood-mahogany" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <div className="modal-title-wrap">
                      <span className="modal-kicker">LIVE DOSSIER SYNC // {editingMember.id}</span>
                      <h2 className="modal-title">Edit Operative &bull; {editingMember.name || editingMember.id}</h2>
                    </div>
                    <button
                      type="button"
                      className="modal-close-btn"
                      onClick={() => setEditingMember(null)}
                    >
                      &times;
                    </button>
                  </div>

                  {/* Clean Tab Switcher */}
                  <div className="modal-tab-nav">
                    <button
                      type="button"
                      className={`modal-tab-btn ${activeTab === "profile" ? "active" : ""}`}
                      onClick={() => setActiveTab("profile")}
                    >
                      Profile &amp; Bio
                    </button>
                    <button
                      type="button"
                      className={`modal-tab-btn ${activeTab === "specs" ? "active" : ""}`}
                      onClick={() => setActiveTab("specs")}
                    >
                      Rig Specs &amp; Tech Stack
                    </button>
                  </div>

                  <form onSubmit={handleSaveMember} className="modal-form">
                    {activeTab === "profile" ? (
                      <>
                        {/* Photo Uploader */}
                        <div className="content-photo-upload-section">
                          <label className="form-label">AVATAR PHOTO</label>
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
                                ref={modalFileInputRef}
                                style={{ display: "none" }}
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(e.target.files[0], editingMember.id)}
                              />
                              <div className="photo-buttons-row">
                                <button
                                  type="button"
                                  className="btn-upload-photo-large"
                                  disabled={uploadingPhotoId === editingMember.id}
                                  onClick={() => modalFileInputRef.current?.click()}
                                >
                                  <span>{uploadingPhotoId === editingMember.id ? "Uploading..." : "Upload Local Photo (PNG / JPG)"}</span>
                                </button>
                                {editingMember.photo_url && (
                                  <button
                                    type="button"
                                    className="btn-remove-photo"
                                    onClick={() => setEditingMember({ ...editingMember, photo_url: "" })}
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="Or paste external image URL..."
                                className="form-input text-xs"
                                value={editingMember.photo_url || ""}
                                onChange={(e) => setEditingMember({ ...editingMember, photo_url: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-row-2">
                          <div className="form-group">
                            <label className="form-label">FULL NAME *</label>
                            <input
                              type="text"
                              required
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
                              className="form-input"
                              value={editingMember.codename || ""}
                              onChange={(e) => setEditingMember({ ...editingMember, codename: e.target.value.toUpperCase() })}
                            />
                          </div>
                        </div>

                        <div className="form-row-2">
                          <div className="form-group">
                            <label className="form-label">DESIGNATION *</label>
                            <input
                              type="text"
                              required
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
                        </div>

                        <div className="form-group">
                          <label className="form-label">SPECIALTY HIGHLIGHT</label>
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
                            className="form-textarea"
                            value={editingMember.bio || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">PC BUILDING TIP</label>
                          <input
                            type="text"
                            placeholder="e.g. Never cheap out on your power supply..."
                            className="form-input"
                            value={editingMember.fav_tip || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, fav_tip: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Rig Specs & Tech Stack */}
                        <div className="form-group">
                          <label className="form-label">TECH STACK (COMMA SEPARATED)</label>
                          <input
                            type="text"
                            placeholder="React 19, Three.js, Node.js, Express, MySQL"
                            className="form-input font-mono text-xs"
                            value={editingMember.tech_stack || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, tech_stack: e.target.value })}
                          />
                        </div>

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
                                placeholder="64GB DDR5-6000"
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
                              <label className="text-xs text-muted">CHASSIS</label>
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
                      </>
                    )}

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
                        <span>Save &amp; Sync to /about</span>
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
