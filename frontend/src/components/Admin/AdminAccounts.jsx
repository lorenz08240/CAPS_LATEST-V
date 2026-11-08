import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./Admin.css";

export const AdminAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modal / Drawer states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    email: "",
    role: "Administrator",
    passcode: "admin123",
    status: "ACTIVE",
    avatar_url: ""
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const getAdminKey = () => localStorage.getItem("adminKey") || "admin123";

  const showToast = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/accounts", {
        headers: { "x-admin-key": getAdminKey() }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP error ${res.status}`);
      }
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load admin accounts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handle image upload to backend
  const handlePhotoUpload = async (file, isEdit = false) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WEBP).", "error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("Image size must be less than 8MB.", "error");
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
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to upload photo");
          }

          const result = await res.json();
          if (isEdit && editingAccount) {
            setEditingAccount((prev) => ({ ...prev, avatar_url: result.url }));
          } else {
            setFormData((prev) => ({ ...prev, avatar_url: result.url }));
          }
          showToast("Profile photo uploaded successfully!");
        } catch (uploadErr) {
          console.error("Upload error:", uploadErr);
          showToast(uploadErr.message || "Failed to upload image.", "error");
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File reading error:", err);
      setUploadingAvatar(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.display_name.trim()) {
      showToast("Username and Display Name are required.", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": getAdminKey()
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      showToast(`Admin account '${formData.username}' created successfully.`);
      setShowCreateModal(false);
      setFormData({
        username: "",
        display_name: "",
        email: "",
        role: "Administrator",
        passcode: "admin123",
        status: "ACTIVE",
        avatar_url: ""
      });
      fetchAccounts();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!editingAccount) return;

    try {
      const res = await fetch(`/api/admin/accounts/${editingAccount.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": getAdminKey()
        },
        body: JSON.stringify({
          display_name: editingAccount.display_name,
          email: editingAccount.email,
          role: editingAccount.role,
          avatar_url: editingAccount.avatar_url,
          passcode: editingAccount.passcode,
          status: editingAccount.status
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update account");
      }

      showToast(`Admin account '${editingAccount.username}' updated.`);
      setEditingAccount(null);
      fetchAccounts();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": getAdminKey() }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      showToast("Account deleted successfully.");
      setDeleteConfirmId(null);
      fetchAccounts();
    } catch (err) {
      showToast(err.message, "error");
      setDeleteConfirmId(null);
    }
  };

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

            {/* Header Title & Action Bar */}
            <div className="accounts-header-banner">
              <div className="accounts-title-group">
                <div className="accounts-kicker">CONTROL PANEL // CREDENTIALS &amp; ROLES</div>
                <h1 className="accounts-title">Admin Account Manager</h1>
                <p className="accounts-subtitle">
                  Provision and manage administrator profiles, assign security roles, manage authentication passcodes, and upload avatar identity photos.
                </p>
              </div>
              <div className="accounts-actions-group">
                <button
                  type="button"
                  className="btn-create-account"
                  onClick={() => setShowCreateModal(true)}
                >
                  <span className="btn-icon">+</span>
                  <span>Provision New Admin</span>
                </button>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="accounts-metrics-grid">
              <div className="account-metric-card">
                <div className="metric-label">TOTAL ACCOUNTS</div>
                <div className="metric-value">{accounts.length}</div>
                <div className="metric-foot">Provisioned System Operators</div>
              </div>

              <div className="account-metric-card">
                <div className="metric-label">ACTIVE SESSIONS</div>
                <div className="metric-value text-emerald">
                  {accounts.filter((a) => a.status === "ACTIVE").length}
                </div>
                <div className="metric-foot">Verified &amp; Operational</div>
              </div>

              <div className="account-metric-card">
                <div className="metric-label">SECURITY PROTOCOL</div>
                <div className="metric-value text-amber">ROLE-BASED</div>
                <div className="metric-foot">Direct Database Isolation</div>
              </div>
            </div>

            {/* Accounts Table Container */}
            <div className="accounts-table-card">
              <div className="accounts-table-header">
                <div className="table-header-title">
                  <span className="dot-live" />
                  <span>REGISTERED ADMINISTRATORS ({accounts.length})</span>
                </div>
                <button
                  type="button"
                  className="btn-refresh-accounts"
                  onClick={fetchAccounts}
                  title="Reload Accounts Roster"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>Sync</span>
                </button>
              </div>

              {loading ? (
                <div className="accounts-loading-state">
                  <div className="loading-spinner" />
                  <span>Loading administrative accounts...</span>
                </div>
              ) : error ? (
                <div className="accounts-error-state">
                  <span className="error-icon">⚠</span>
                  <span>Failed to load accounts: {error}</span>
                  <button type="button" onClick={fetchAccounts} className="btn-retry">Retry</button>
                </div>
              ) : (
                <div className="accounts-table-responsive">
                  <table className="accounts-table">
                    <thead>
                      <tr>
                        <th>OPERATOR</th>
                        <th>ROLE</th>
                        <th>EMAIL</th>
                        <th>STATUS</th>
                        <th>SECURITY PASSCODE</th>
                        <th>LAST LOGIN</th>
                        <th className="text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((acc) => (
                        <tr key={acc.id} className="account-row">
                          <td>
                            <div className="operator-cell">
                              <div className="operator-avatar-wrap">
                                {acc.avatar_url ? (
                                  <img
                                    src={acc.avatar_url}
                                    alt={acc.display_name}
                                    className="operator-avatar-img"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="operator-avatar-fallback"
                                  style={{ display: acc.avatar_url ? "none" : "flex" }}
                                >
                                  {acc.display_name.slice(0, 2).toUpperCase()}
                                </div>
                              </div>
                              <div className="operator-names">
                                <div className="operator-display-name">{acc.display_name}</div>
                                <div className="operator-username">@{acc.username}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className={`role-badge ${acc.role?.toLowerCase().includes("super") ? "super" : "standard"}`}>
                              {acc.role || "Administrator"}
                            </span>
                          </td>

                          <td>
                            <span className="email-cell">{acc.email || "—"}</span>
                          </td>

                          <td>
                            <span className={`status-pill ${acc.status === "ACTIVE" ? "active" : "inactive"}`}>
                              <span className="status-dot" />
                              {acc.status}
                            </span>
                          </td>

                          <td>
                            <span className="passcode-masked" title="Authentication Passcode">
                              ••••••••
                            </span>
                          </td>

                          <td>
                            <span className="login-date">
                              {acc.last_login
                                ? new Date(acc.last_login).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })
                                : "Never"}
                            </span>
                          </td>

                          <td className="text-right">
                            <div className="account-actions-wrap">
                              <button
                                type="button"
                                className="btn-action-edit"
                                onClick={() => setEditingAccount(acc)}
                                title="Edit Administrator Profile"
                              >
                                Edit
                              </button>

                              {acc.username !== "admin" && (
                                <button
                                  type="button"
                                  className="btn-action-delete"
                                  onClick={() => setDeleteConfirmId(acc.id)}
                                  title="Revoke Admin Access"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* CREATE ADMIN MODAL */}
            {showCreateModal && (
              <div className="admin-modal-backdrop" onClick={() => setShowCreateModal(false)}>
                <div className="admin-modal-card wood-mahogany" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <div className="modal-title-wrap">
                      <span className="modal-kicker">SECURITY PORTAL // PROVISION OPERATOR</span>
                      <h2 className="modal-title">New Administrator Account</h2>
                    </div>
                    <button
                      type="button"
                      className="modal-close-btn"
                      onClick={() => setShowCreateModal(false)}
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleCreateAccount} className="modal-form">
                    <div className="avatar-upload-field">
                      <label className="form-label">PROFILE PHOTO</label>
                      <div className="avatar-picker-row">
                        <div className="avatar-preview-box">
                          {formData.avatar_url ? (
                            <img src={formData.avatar_url} alt="Avatar Preview" className="avatar-preview-img" />
                          ) : (
                            <span className="avatar-preview-placeholder">No Photo</span>
                          )}
                        </div>
                        <div className="avatar-picker-controls">
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e.target.files[0], false)}
                          />
                          <button
                            type="button"
                            className="btn-upload-avatar"
                            disabled={uploadingAvatar}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {uploadingAvatar ? "Uploading..." : "Upload Profile Photo"}
                          </button>
                          <input
                            type="text"
                            placeholder="Or paste external image URL..."
                            className="form-input text-xs"
                            value={formData.avatar_url}
                            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">USERNAME *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. jdoe_admin"
                          className="form-input"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">DISPLAY NAME *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          className="form-input"
                          value={formData.display_name}
                          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          placeholder="admin@buildlab.internal"
                          className="form-input"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">ROLE</label>
                        <select
                          className="form-select"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="Administrator">Administrator</option>
                          <option value="Super Admin">Super Admin</option>
                          <option value="Hardware Architect">Hardware Architect</option>
                          <option value="Inventory Lead">Inventory Lead</option>
                          <option value="QA Specialist">QA Specialist</option>
                          <option value="Content Editor">Content Editor</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">INITIAL PASSCODE</label>
                        <input
                          type="password"
                          required
                          placeholder="Access passcode"
                          className="form-input"
                          value={formData.passcode}
                          onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">STATUS</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>
                    </div>

                    <div className="modal-actions-bar">
                      <button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-modal-submit">
                        Provision Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EDIT ADMIN MODAL */}
            {editingAccount && (
              <div className="admin-modal-backdrop" onClick={() => setEditingAccount(null)}>
                <div className="admin-modal-card wood-mahogany" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <div className="modal-title-wrap">
                      <span className="modal-kicker">SECURITY PORTAL // EDIT OPERATOR</span>
                      <h2 className="modal-title">Edit @{editingAccount.username}</h2>
                    </div>
                    <button
                      type="button"
                      className="modal-close-btn"
                      onClick={() => setEditingAccount(null)}
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleUpdateAccount} className="modal-form">
                    <div className="avatar-upload-field">
                      <label className="form-label">UPDATE PROFILE PHOTO</label>
                      <div className="avatar-picker-row">
                        <div className="avatar-preview-box">
                          {editingAccount.avatar_url ? (
                            <img src={editingAccount.avatar_url} alt="Avatar Preview" className="avatar-preview-img" />
                          ) : (
                            <span className="avatar-preview-placeholder">No Photo</span>
                          )}
                        </div>
                        <div className="avatar-picker-controls">
                          <input
                            type="file"
                            ref={editFileInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e.target.files[0], true)}
                          />
                          <button
                            type="button"
                            className="btn-upload-avatar"
                            disabled={uploadingAvatar}
                            onClick={() => editFileInputRef.current?.click()}
                          >
                            {uploadingAvatar ? "Uploading..." : "Upload New Photo"}
                          </button>
                          <input
                            type="text"
                            placeholder="Or paste external image URL..."
                            className="form-input text-xs"
                            value={editingAccount.avatar_url || ""}
                            onChange={(e) => setEditingAccount({ ...editingAccount, avatar_url: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">DISPLAY NAME *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={editingAccount.display_name}
                          onChange={(e) => setEditingAccount({ ...editingAccount, display_name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          className="form-input"
                          value={editingAccount.email || ""}
                          onChange={(e) => setEditingAccount({ ...editingAccount, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">ROLE</label>
                        <select
                          className="form-select"
                          value={editingAccount.role || "Administrator"}
                          onChange={(e) => setEditingAccount({ ...editingAccount, role: e.target.value })}
                        >
                          <option value="Administrator">Administrator</option>
                          <option value="Super Admin">Super Admin</option>
                          <option value="Hardware Architect">Hardware Architect</option>
                          <option value="Inventory Lead">Inventory Lead</option>
                          <option value="QA Specialist">QA Specialist</option>
                          <option value="Content Editor">Content Editor</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">STATUS</label>
                        <select
                          className="form-select"
                          value={editingAccount.status || "ACTIVE"}
                          onChange={(e) => setEditingAccount({ ...editingAccount, status: e.target.value })}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">RESET PASSCODE (OPTIONAL)</label>
                      <input
                        type="password"
                        placeholder="Leave blank to retain current passcode"
                        className="form-input"
                        value={editingAccount.passcode || ""}
                        onChange={(e) => setEditingAccount({ ...editingAccount, passcode: e.target.value })}
                      />
                    </div>

                    <div className="modal-actions-bar">
                      <button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={() => setEditingAccount(null)}
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

            {/* DELETE CONFIRMATION DIALOG */}
            {deleteConfirmId && (
              <div className="admin-modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
                <div className="admin-modal-card modal-sm wood-mahogany" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="modal-title text-rose">Confirm Revocation</h3>
                    <button type="button" className="modal-close-btn" onClick={() => setDeleteConfirmId(null)}>&times;</button>
                  </div>
                  <p className="confirm-text">
                    Are you sure you want to permanently revoke this administrator account? All active sessions for this operator will be terminated immediately.
                  </p>
                  <div className="modal-actions-bar">
                    <button type="button" className="btn-modal-cancel" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                    <button type="button" className="btn-danger-confirm" onClick={() => handleDeleteAccount(deleteConfirmId)}>Revoke Account</button>
                  </div>
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
