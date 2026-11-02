import React from "react";
import { Navigate } from "react-router-dom";
import AdminInventory from "./AdminInventory";
import AdminCrawler from "./AdminCrawler";
import EditComponentDrawer from "./EditComponentDrawer";
import AdminHeader from "./AdminHeader";
import AdminLogin from "./AdminLogin";
import AdminAuthGuard from "./AdminAuthGuard";
import HardwareIcon from "./HardwareIcon";
import HoverImagePreview from "./HoverImagePreview";

export {
  AdminInventory,
  AdminCrawler,
  EditComponentDrawer,
  AdminHeader,
  AdminLogin,
  AdminAuthGuard,
  HardwareIcon,
  HoverImagePreview
};

/**
 * Default entry redirecting /admin to /admin/inventory
 */
export default function Admin() {
  return <Navigate to="/admin/inventory" replace />;
}
