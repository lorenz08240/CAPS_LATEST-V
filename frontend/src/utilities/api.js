// ═══════════════════════════════════════════════════════════════
// BUILDLAB API CLIENT & CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export const getApiUrl = (endpoint) => {
  const path = endpoint.replace(/^\/+/, "");
  return `${API_BASE_URL}/${path}`;
};

export const getAdminHeaders = () => {
  const token = localStorage.getItem("buildlab_admin_token") || "admin123";
  return {
    "x-admin-key": token
  };
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const headers = {
    ...options.headers,
  };

  if (localStorage.getItem("buildlab_admin") === "true") {
    Object.assign(headers, getAdminHeaders());
  }

  return fetch(url, { ...options, headers });
};

