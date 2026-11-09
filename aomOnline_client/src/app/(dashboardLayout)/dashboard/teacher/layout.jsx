import React from "react";
import TeacherSidebarShell from "@/components/Teacher/TeacherSidebarShell";

// Teacher portal integrated shell — sidebar + topbar applicable to all teacher pages.
export default function TeacherLayout({ children }) {
  return <TeacherSidebarShell>{children}</TeacherSidebarShell>;
}
