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
  const [uploadingPhotoId, setUploadingPhotoId] = useState(null);
  const [isNewMember, setIsNewMember] = useState(false);
  const modalFileInputRef = useRef(null);

  const isModalOpen = editingMember !== null;

  const getAdminKey = () => localStorage.getItem("adminKey") || "admin12345";

  const setRigSpec = (key, value) => {
    setEditingMember((prev) => ({
      ...prev,
      rig_specs: { ...(prev?.rig_specs || {}), [key]: value }
    }));
  };

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

  // Keep the page behind the editor from scrolling while it is open
  useEffect(() => {
    if (!isModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalDocOverflow;
    };
  }, [isModalOpen]);

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

      let rig_specs = editingMember.rig_specs;
      if (typeof rig_specs === "string") {
        try { rig_specs = JSON.parse(rig_specs); } catch { rig_specs = {}; }
      }
      if (!rig_specs || typeof rig_specs !== "object" || Array.isArray(rig_specs)) rig_specs = {};

      const payload = {
        ...editingMember,
        key_contributions,
        tech_stack,
        rig_specs
      };

      const res = await fetch(
        isNewMember ? "/api/content/team" : `/api/content/team/${editingMember.id}`,
        {
          method: isNewMember ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": getAdminKey()
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        throw new Error(isNewMember ? "Failed to create team member" : "Failed to save profile changes");
      }

      showToast(isNewMember ? `${editingMember.name} added to the team roster.` : `${editingMember.name || editingMember.id} saved.`);
      setIsNewMember(false);
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleCreateMember = () => {
    try { soundManager.click(); } catch {}
    setIsNewMember(true);
    setEditingMember({
      id: `DEV-${Date.now().toString().slice(-6)}`,
      name: "",
      designation: "",
      codename: "",
      role_category: "core",
      avatar_badge: "DEV",
      photo_url: "",
      highlight: "",
      bio: "",
      key_contributions: "",
      tech_stack: "",
      rig_specs: {},
      fav_tip: "",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      sort_order: members.length + 1
    });
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Delete ${member.name || member.id} from the team roster?`)) return;
    try {
      const res = await fetch(`/api/content/team/${member.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": getAdminKey() }
      });
      if (!res.ok) throw new Error("Failed to delete team member");
      showToast(`${member.name || member.id} removed from roster.`);
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
          <AdminHeader breadcrumbCurrent="Developer Profiles" />

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
                <div className="content-kicker">CORE TEAM DIRECTORY // DEVELOPER PROFILES</div>
                <h1 className="content-title">Developer Profiles</h1>
                <p className="content-subtitle">
                  Photos, hardware vitae, and details for the {members.length || 5} WhiteHats developers. Saved changes automatically synchronize live with the public About Us page.
                </p>
              </div>

              <div className="roster-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button type="button" className="btn-refresh-accounts" onClick={handleCreateMember} title="Add a new developer to the roster">
                  + Add Developer
                </button>
                <Link to="/about" target="_blank" className="btn-view-live-about">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  <span>Open About Us</span>
                </Link>
              </div>
            </div>

            {/* Developer profile cards */}
            <div className="operatives-roster-container">

              {loading ? (
                <div className="accounts-loading-state">
                  <div className="loading-spinner" />
                  <span>Loading profiles...</span>
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

                      {/* Circular Avatar */}
                      <div className="operative-avatar-preview-wrap">
                        <div className="avatar-profile-frame-admin">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="avatar-img-admin"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                const fallback = parent?.querySelector(".avatar-fallback-initials");
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="avatar-fallback-initials"
                            style={{ display: member.photo_url ? "none" : "flex" }}
                          >
                            {member.name ? member.name.slice(0, 2).toUpperCase() : member.id}
                          </div>
                        </div>

                      </div>

                      <div className="operative-card-body">
                        <h3 className="operative-name">{member.name}</h3>
                        <div className="operative-designation">{member.designation}</div>

                        <div className="operative-highlight">
                          <span className="highlight-tag">{member.highlight}</span>
                        </div>

                        <p className="operative-bio-snippet">{member.bio}</p>
                      </div>

                      <div className="operative-card-footer">
                        <div className="operative-card-actions">
                        <button
                          type="button"
                          className="btn-edit-operative"
                          onClick={() => {
                            setIsNewMember(false);
                            setEditingMember({
                              ...member,
                              key_contributions: Array.isArray(member.key_contributions)
                                ? member.key_contributions.join("\n")
                                : (member.key_contributions || ""),
                              tech_stack: Array.isArray(member.tech_stack)
                                ? member.tech_stack.join(", ")
                                : (member.tech_stack || ""),
                              rig_specs: (() => {
                                const raw = member.rig_specs;
                                if (typeof raw === "string") {
                                  try { return JSON.parse(raw); } catch { return {}; }
                                }
                                return raw || {};
                              })()
                            });
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-delete-operative"
                          onClick={() => handleDeleteMember(member)}
                          title={`Delete ${member.name || member.id}`}
                        >
                          &times;
                        </button>
                        </div>
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
                      <span className="modal-kicker">{isNewMember ? "NEW DEVELOPER PROFILE" : `DEVELOPER PROFILE // ${editingMember.id}`}</span>
                      <h2 className="modal-title">{isNewMember ? "Add New Developer" : <>Edit Profile &bull; {editingMember.name || editingMember.id}</>}</h2>
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
                    {/* Photo Uploader */}
                        <div className="content-photo-upload-section">
                          <label className="form-label">AVATAR PHOTO</label>
                          <div className="photo-editor-row">
                            <div className="photo-preview-hex-wrap">
                              <div className="avatar-profile-frame-admin profile-large">
                                {editingMember.photo_url ? (
                                  <img src={editingMember.photo_url} alt="Preview" className="avatar-img-admin" />
                                ) : null}
                                <div
                                  className="avatar-fallback-initials"
                                  style={{ display: editingMember.photo_url ? "none" : "flex" }}
                                >
                                  {editingMember.name ? editingMember.name.slice(0, 2).toUpperCase() : editingMember.id}
                                </div>
                              </div>
                            </div>

                            <div className="photo-inputs-col">
                              <input
                                type="file"
                                ref={modalFileInputRef}
                                style={{ display: "none" }}
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handlePhotoUpload(e.target.files[0], editingMember.id);
                                  }
                                  e.target.value = "";
                                }}
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
                          <div className="form-group" style={{ flex: 1.6 }}>
                            <label className="form-label">FULL NAME *</label>
                            <input
                              type="text"
                              required
                              className="form-input"
                              value={editingMember.name || ""}
                              onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                            />
                          </div>

                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">ROLE BADGE</label>
                            <input
                              type="text"
                              placeholder="e.g. LEAD, DOCS"
                              className="form-input uppercase"
                              value={editingMember.avatar_badge || ""}
                              onChange={(e) => setEditingMember({ ...editingMember, avatar_badge: e.target.value.toUpperCase() })}
                            />
                          </div>
                        </div>

                        <div className="form-row-2">
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">CODENAME</label>
                            <input
                              type="text"
                              placeholder="e.g. LEAD, VERIFY_LAB"
                              className="form-input uppercase"
                              value={editingMember.codename || ""}
                              onChange={(e) => setEditingMember({ ...editingMember, codename: e.target.value.toUpperCase() })}
                            />
                          </div>

                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">ROLE CATEGORY</label>
                            <select
                              className="form-input"
                              value={editingMember.role_category || "core"}
                              onChange={(e) => setEditingMember({ ...editingMember, role_category: e.target.value })}
                            >
                              <option value="core">Core</option>
                              <option value="frontend">Frontend</option>
                              <option value="backend">Backend</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">DESIGNATION / ROLE *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Lead Full-Stack Developer & Project Lead"
                            className="form-input"
                            value={editingMember.designation || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, designation: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">SPECIALTY HIGHLIGHT</label>
                          <input
                            type="text"
                            placeholder="e.g. System Architecture & Core Logic"
                            className="form-input"
                            value={editingMember.highlight || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, highlight: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">ENGINEERING BIO</label>
                          <textarea
                            rows={3}
                            placeholder="Engineering background and responsibilities..."
                            className="form-textarea"
                            value={editingMember.bio || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">KEY CONTRIBUTIONS (ONE PER LINE)</label>
                          <textarea
                            rows={3}
                            placeholder={"Engineered the component picker\nIntegrated the 3D canvas"}
                            className="form-textarea"
                            value={typeof editingMember.key_contributions === "string"
                              ? editingMember.key_contributions
                              : (Array.isArray(editingMember.key_contributions) ? editingMember.key_contributions.join("\n") : "")}
                            onChange={(e) => setEditingMember({ ...editingMember, key_contributions: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">TECH STACK (COMMA-SEPARATED)</label>
                          <input
                            type="text"
                            placeholder="e.g. React 19, Three.js, Node.js"
                            className="form-input"
                            value={typeof editingMember.tech_stack === "string"
                              ? editingMember.tech_stack
                              : (Array.isArray(editingMember.tech_stack) ? editingMember.tech_stack.join(", ") : "")}
                            onChange={(e) => setEditingMember({ ...editingMember, tech_stack: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">RIG SPECS / HARDWARE VITAE</label>
                          <div className="form-row-2">
                            <input
                              type="text"
                              placeholder="CPU"
                              className="form-input"
                              value={editingMember.rig_specs?.cpu || ""}
                              onChange={(e) => setRigSpec("cpu", e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="GPU"
                              className="form-input"
                              value={editingMember.rig_specs?.gpu || ""}
                              onChange={(e) => setRigSpec("gpu", e.target.value)}
                            />
                          </div>
                          <div className="form-row-2">
                            <input
                              type="text"
                              placeholder="RAM"
                              className="form-input"
                              value={editingMember.rig_specs?.ram || ""}
                              onChange={(e) => setRigSpec("ram", e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="Storage"
                              className="form-input"
                              value={editingMember.rig_specs?.storage || ""}
                              onChange={(e) => setRigSpec("storage", e.target.value)}
                            />
                          </div>
                          <div className="form-row-2">
                            <input
                              type="text"
                              placeholder="Chassis"
                              className="form-input"
                              value={editingMember.rig_specs?.chassis || ""}
                              onChange={(e) => setRigSpec("chassis", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">PC BUILDING TIP (QUOTE)</label>
                          <input
                            type="text"
                            placeholder="e.g. Never cheap out on your power supply..."
                            className="form-input"
                            value={editingMember.fav_tip || ""}
                            onChange={(e) => setEditingMember({ ...editingMember, fav_tip: e.target.value })}
                          />
                        </div>

                        <div className="form-row-2">
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">GITHUB URL</label>
                            <input
                              type="text"
                              placeholder="https://github.com/..."
                              className="form-input"
                              value={editingMember.github || ""}
                              onChange={(e) => setEditingMember({ ...editingMember, github: e.target.value })}
                            />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">LINKEDIN URL</label>
                            <input
                              type="text"
                              placeholder="https://linkedin.com/in/..."
                              className="form-input"
                              value={editingMember.linkedin || ""}
                              onChange={(e) => setEditingMember({ ...editingMember, linkedin: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ maxWidth: 160 }}>
                          <label className="form-label">SORT ORDER</label>
                          <input
                            type="number"
                            min="1"
                            className="form-input"
                            value={editingMember.sort_order ?? 99}
                            onChange={(e) => setEditingMember({ ...editingMember, sort_order: Number(e.target.value) })}
                          />
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
                        <span>Save Developer Profile</span>
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
