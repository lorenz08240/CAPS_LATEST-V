import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const SESSION_AUTH_KEY = "buildlab_admin_session";
const SESSION_TIMESTAMP_KEY = "buildlab_admin_timestamp";
const SESSION_TOKEN_KEY = "buildlab_admin_token";

export function AuthProvider({ children }) {
  // Session Security: store active credentials strictly in sessionStorage.
  // Tab or window closure automatically terminates the session.
  const [isAdmin, setIsAdmin] = useState(() => {
    // Purge legacy persistent localStorage to prevent security bypass
    try {
      localStorage.removeItem("buildlab_admin");
      localStorage.removeItem("buildlab_admin_token");
    } catch {}

    try {
      return sessionStorage.getItem(SESSION_AUTH_KEY) === "true";
    } catch {
      return false;
    }
  });

  const loginAdmin = (password) => {
    if (password === "admin123") {
      setIsAdmin(true);
      try {
        sessionStorage.setItem(SESSION_AUTH_KEY, "true");
        sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
        sessionStorage.setItem(SESSION_TOKEN_KEY, password);
      } catch {}
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      // Clean up session drafts upon explicit logout
      sessionStorage.removeItem("buildlab_admin_drawer_draft");
      sessionStorage.removeItem("buildlab_admin_crawler_draft");
      sessionStorage.removeItem("buildlab_admin_terminal_logs");
      // Clean up legacy localStorage if present
      localStorage.removeItem("buildlab_admin");
      localStorage.removeItem("buildlab_admin_token");
    } catch {}
  };

  // Cross-tab synchronization within the same session or storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const sessionActive = sessionStorage.getItem(SESSION_AUTH_KEY) === "true";
        setIsAdmin(sessionActive);
      } catch {}
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
