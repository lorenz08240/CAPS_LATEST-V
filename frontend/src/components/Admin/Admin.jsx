import React from "react";
import { Navigate } from "react-router-dom";
import AdminInventory from "./AdminInventory";
import AdminCrawler from "./AdminCrawler";
import AdminAddComponent from "./AdminAddComponent";
import AdminEditComponent from "./AdminEditComponent";
import AdminDeleteComponent from "./AdminDeleteComponent";
import EditComponentDrawer from "./EditComponentDrawer";
import AdminHeader from "./AdminHeader";
import AdminLogin from "./AdminLogin";
import AdminAuthGuard from "./AdminAuthGuard";
import AdminSidebar from "./AdminSidebar";
import AdminLogs from "./AdminLogs";
import AdminAccounts from "./AdminAccounts";
import AdminContent from "./AdminContent";
import HardwareIcon from "./HardwareIcon";
import HoverImagePreview from "./HoverImagePreview";

export {
  AdminInventory,
  AdminCrawler,
  AdminAddComponent,
  AdminEditComponent,
  AdminDeleteComponent,
  EditComponentDrawer,
  AdminHeader,
  AdminLogin,
  AdminAuthGuard,
  AdminSidebar,
  AdminLogs,
  AdminAccounts,
  AdminContent,
  HardwareIcon,
  HoverImagePreview
};

/**
 * Default entry redirecting /admin to /admin/inventory
 */
export default function Admin() {
  return <Navigate to="/admin/inventory" replace />;
}
