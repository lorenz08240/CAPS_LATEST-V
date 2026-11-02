import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Route protection guard for all /admin/* paths.
 * Redirects unauthenticated users to /admin/login while preserving the attempted location.
 */
export const AdminAuthGuard = ({ children }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminAuthGuard;
