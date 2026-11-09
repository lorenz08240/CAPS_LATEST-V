import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import soundManager from "../../utilities/soundManager";
import "./Admin.css";

export const AdminAccounts = () => {
  const [rootAccount, setRootAccount] = useState(null);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Root Modal
  const [showEditRootModal, setShowEditRootModal] = useState(false);
  const [rootPasscode, setRootPasscode] = useState("admin12345");
  const [rootDisplayName, setRootDisplayName] = useState("Root Administrator");
  const [rootAvatar, setRootAvatar] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const getAdminKey = () => localStorage.getItem("adminKey") || "admin12345";

  const showToast = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch single root account
      const adminRes = await fetch("/api/admin/accounts", {
        headers: { "x-admin-key": getAdminKey() }
      });
      if (adminRes.ok) {
        const admins = await adminRes.json();
        const root = (Array.isArray(admins) ? admins : []).find((a) => a.username === "root") || admins[0];
        if (root) {
          setRootAccount(root);
          setRootPasscode(root.passcode || "admin12345");
          setRootDisplayName(root.display_name || "Root Administrator");
          setRootAvatar(root.avatar_url || "");
        }
      }

      // Fetch Google Learners
      const learnerRes = await fetch("/api/admin/learners", {
        headers: { "x-admin-key": getAdminKey() }
      });
      if (learnerRes.ok) {
        const learnerData = await learnerRes.json();
        setLearners(Array.isArray(learnerData) ? learnerData : []);
      }
    } catch (err) {
      console.error("Failed to load accounts data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WEBP).", "error");
      return;
    }

    try {
      setUploadingAvatar(true);
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
          setRootAvatar(result.url);
          showToast("Profile avatar uploaded!");
        } catch (uploadErr) {
          showToast(uploadErr.message || "Upload failed.", "error");
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateRoot = async (e) => {
    e.preventDefault();
    if (!rootAccount) return;

    try {
      const res = await fetch(`/api/admin/accounts/${rootAccount.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": getAdminKey()
        },
        body: JSON.stringify({
          display_name: rootDisplayName.trim(),
          passcode: rootPasscode.trim(),
          avatar_url: rootAvatar,
          role: "Root Administrator"
        })
      });

      if (!res.ok) {
        throw new Error("Failed to update root credentials");
      }

      showToast("Root administrator credentials updated successfully!");
      setShowEditRootModal(false);
      fetchData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteLearner = async (id, name) => {
    if (!window.confirm(`Remove learner account for ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/learners/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": getAdminKey() }
      });
      if (!res.ok) throw new Error("Failed to delete learner account");
      showToast(`Learner ${name} removed.`);
      fetchData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const filteredLearners = learners.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.full_name && l.full_name.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-page-wrapper">
      <div className="admin-layout-container">
        <AdminSidebar />

        <main className="admin-main-content">
          <AdminHeader breadcrumbCurrent="Account Manager" />

          <div className="admin-content-inner">
            {notification && (
              <div className={`admin-alert-banner ${notification.type === "error" ? "error" : "success"}`}>
                <span className="alert-icon">{notification.type === "error" ? "⚠" : "✓"}</span>
                <span>{notification.message}</span>
              </div>
            )}

            {/* Banner Header */}
            <div className="accounts-header-banner">
              <div className="accounts-title-group">
                <div className="accounts-kicker">CONTROL PANEL // ACCOUNTS &amp; GOOGLE AUTH</div>
                <h1 className="accounts-title">Account Manager</h1>
                <p className="accounts-subtitle">
                  Single shared Root Administrator credentials management and live directory of Google Sign-In learner accounts.
                </p>
              </div>

              <div className="accounts-actions-group">
                <button type="button" className="btn-refresh-accounts" onClick={fetchData} title="Sync accounts data">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>Sync Directory</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: SINGLE SHARED ROOT ADMINISTRATOR CARD */}
            <div className="root-admin-card-container">
              <div className="section-header-row">
                <div className="section-title-tag">
                  <span className="tag-bracket">[</span>
                  <span>SYSTEM AUTHORITY // SHARED CREDENTIAL</span>
                  <span className="tag-bracket">]</span>
                </div>
                <span className="auth-level-tag">SINGLE ADMIN PROFILE</span>
              </div>

              <div className="root-admin-card wood-mahogany">
                <div className="root-admin-profile-left">
                  <div className="root-avatar-wrap">
                    {rootAvatar ? (
                      <img src={rootAvatar} alt="Root Admin" className="root-avatar-img" />
                    ) : (
                      <div className="root-avatar-fallback">ROOT</div>
                    )}
                  </div>
                  <div className="root-meta-info">
                    <div className="root-display-title">
                      <h2>{rootAccount?.display_name || "Root Administrator"}</h2>
                      <span className="root-badge">SUPER ADMIN</span>
                    </div>
                    <div className="root-credentials-preview">
                      <span className="cred-chip"><strong>ID:</strong> root</span>
                      <span className="cred-chip"><strong>PASS:</strong> {rootAccount?.passcode || "admin12345"}</span>
                      <span className="cred-chip status-chip">
                        <span className="status-dot-green" /> ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                <div className="root-admin-actions">
                  <button
                    type="button"
                    className="btn-edit-root"
                    onClick={() => setShowEditRootModal(true)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Edit Root Passcode &amp; Avatar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: GOOGLE LEARN MODE STUDENT DIRECTORY */}
            <div className="google-learners-container">
              <div className="learners-header-bar">
                <div className="learners-header-title">
                  <span className="google-g-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </span>
                  <span>GOOGLE SIGN-IN LEARNER ACCOUNTS ({learners.length})</span>
                </div>

                <div className="learners-search-wrap">
                  <input
                    type="text"
                    placeholder="Search learners by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="learners-search-input"
                  />
                  {searchQuery && (
                    <button type="button" className="btn-clear-search" onClick={() => setSearchQuery("")}>
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="accounts-loading-state">
                  <div className="loading-spinner" />
                  <span>Loading learner accounts...</span>
                </div>
              ) : error ? (
                <div className="accounts-error-state">
                  <span>Error: {error}</span>
                  <button type="button" onClick={fetchData} className="btn-retry">Retry</button>
                </div>
              ) : filteredLearners.length === 0 ? (
                <div className="accounts-empty-state">
                  <p>No Google learner accounts found matching &quot;{searchQuery}&quot;.</p>
                </div>
              ) : (
                <div className="accounts-table-card">
                  <div className="accounts-table-responsive">
                    <table className="accounts-table">
                      <thead>
                        <tr>
                          <th>STUDENT / LEARNER</th>
                          <th>GOOGLE ACCOUNT</th>
                          <th>INSTITUTION</th>
                          <th>PROGRESS / STAGES</th>
                          <th>LAST ACTIVE</th>
                          <th className="text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLearners.map((learner) => (
                          <tr key={learner.id} className="learner-row">
                            <td>
                              <div className="operator-cell">
                                <div className="operator-avatar-wrap">
                                  {learner.avatar_url ? (
                                    <img
                                      src={learner.avatar_url}
                                      alt={learner.full_name}
                                      className="operator-avatar-img"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="operator-avatar-fallback"
                                    style={{ display: learner.avatar_url ? "none" : "flex" }}
                                  >
                                    {learner.full_name ? learner.full_name.slice(0, 2).toUpperCase() : "ST"}
                                  </div>
                                </div>
                                <div className="operator-names">
                                  <div className="operator-display-name">{learner.full_name}</div>
                                  <div className="learner-google-tag">Google Verified</div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="email-cell font-mono">{learner.email}</span>
                            </td>

                            <td>
                              <span className="institution-cell">{learner.institution || "PTC"}</span>
                            </td>

                            <td>
                              <div className="stages-pills-wrap">
                                {(Array.isArray(learner.unlocked_stages) ? learner.unlocked_stages : ["build"]).map((st, i) => (
                                  <span key={i} className="stage-chip">{st}</span>
                                ))}
                              </div>
                            </td>

                            <td>
                              <span className="login-date">
                                {learner.last_active
                                  ? new Date(learner.last_active).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                    })
                                  : "Recently"}
                              </span>
                            </td>

                            <td className="text-right">
                              <button
                                type="button"
                                className="btn-action-delete"
                                onClick={() => handleDeleteLearner(learner.id, learner.full_name)}
                                title="Remove learner profile"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* EDIT ROOT ADMINISTRATOR MODAL */}
            {showEditRootModal && (
              <div className="admin-modal-backdrop" onClick={() => setShowEditRootModal(false)}>
                <div className="admin-modal-card wood-mahogany" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <div className="modal-title-wrap">
                      <span className="modal-kicker">ROOT SECURITY // SHARED CREDENTIALS</span>
                      <h2 className="modal-title">Edit Root Administrator</h2>
                    </div>
                    <button
                      type="button"
                      className="modal-close-btn"
                      onClick={() => setShowEditRootModal(false)}
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleUpdateRoot} className="modal-form">
                    <div className="avatar-upload-field">
                      <label className="form-label">ADMIN AVATAR</label>
                      <div className="avatar-picker-row">
                        <div className="avatar-preview-box">
                          {rootAvatar ? (
                            <img src={rootAvatar} alt="Root Avatar" className="avatar-preview-img" />
                          ) : (
                            <span className="avatar-preview-placeholder">ROOT</span>
                          )}
                        </div>
                        <div className="avatar-picker-controls">
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e.target.files[0])}
                          />
                          <button
                            type="button"
                            className="btn-upload-avatar"
                            disabled={uploadingAvatar}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {uploadingAvatar ? "Uploading..." : "Upload New Photo"}
                          </button>
                          <input
                            type="text"
                            placeholder="Or paste image URL..."
                            className="form-input text-xs"
                            value={rootAvatar}
                            onChange={(e) => setRootAvatar(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">OPERATOR ID (SHARED)</label>
                      <input
                        type="text"
                        disabled
                        value="root"
                        className="form-input disabled"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">DISPLAY TITLE</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={rootDisplayName}
                        onChange={(e) => setRootDisplayName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">SHARED SECURITY PASSCODE *</label>
                      <input
                        type="text"
                        required
                        className="form-input font-mono"
                        value={rootPasscode}
                        onChange={(e) => setRootPasscode(e.target.value)}
                      />
                      <span className="text-xs text-muted" style={{ marginTop: 4, display: "block" }}>
                        Default: <code>admin12345</code>
                      </span>
                    </div>

                    <div className="modal-actions-bar">
                      <button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={() => setShowEditRootModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-modal-submit">
                        Save Changes
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

export default AdminAccounts;
