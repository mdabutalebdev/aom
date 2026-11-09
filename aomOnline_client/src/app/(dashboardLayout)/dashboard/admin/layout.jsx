import React from "react";
import AdminSidebarShell from "@/components/Admin/AdminSidebarShell";

// Admin area integrated shell — sidebar + topbar applicable to all admin pages.
export default function AdminLayout({ children }) {
  return <AdminSidebarShell>{children}</AdminSidebarShell>;
}
