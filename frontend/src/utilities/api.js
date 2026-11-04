// ═══════════════════════════════════════════════════════════════
// BUILDLAB API CLIENT & CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export const getApiUrl = (endpoint) => {
  const path = endpoint.replace(/^\/+/, "");
  return API_BASE_URL ? `${API_BASE_URL}/${path}` : `/${path}`;
};

export const getAdminHeaders = () => {
  const token =
    sessionStorage.getItem("buildlab_admin_token") ||
    localStorage.getItem("buildlab_admin_token") ||
    "admin123";
  return {
    "x-admin-key": token
  };
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const headers = {
    ...options.headers,
  };

  const isAdmin =
    sessionStorage.getItem("buildlab_admin_session") === "true" ||
    localStorage.getItem("buildlab_admin") === "true";

  if (isAdmin) {
    Object.assign(headers, getAdminHeaders());
  }

  return fetch(url, { ...options, headers });
};
