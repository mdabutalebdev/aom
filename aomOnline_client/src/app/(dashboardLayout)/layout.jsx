"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";

import { logout } from "@/redux/authSlice";
import Button from "@/components/ui/Button";
import { Toaster } from "@/components/shadcn/sonner";

// Shared dashboard shell — topbar (Logo + Username + Logout).
// Admin and teacher routes render their own sidebar shells (admin/layout.jsx, teacher/layout.jsx),
// so to avoid double headers, this parent layout just passes children for those routes.
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const user = useSelector((state) => state.auth.user);

  const isAdminArea = pathname?.startsWith("/dashboard/admin");
  const isTeacherArea = pathname?.startsWith("/dashboard/teacher");
  const isStudentArea = pathname?.startsWith("/dashboard/student");
  const isGuardianArea = pathname?.startsWith("/dashboard/guardian");
  // /dashboard is the role resolver — it only shows a spinner before
  // redirecting, so the topbar would just flash in and straight back out.
  const isRoleResolver = pathname === "/dashboard";

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  // Admin/Teacher/Student/Guardian areas use their own shells; no extra topbar.
  if (
    isAdminArea ||
    isTeacherArea ||
    isStudentArea ||
    isGuardianArea ||
    isRoleResolver
  ) {
    return (
      <>
        {children}
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-40 w-full border-b border-primary-100/70 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="AOM Online Madrasa Logo"
              width={40}
              height={40}
              className="rounded-[var(--radius-md)]"
              priority
            />
            <span className="text-lg font-semibold text-primary-700">
              AOM Online Madrasa
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.name && (
              <span className="hidden text-sm font-medium text-primary-700 sm:inline">
                {user.name}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <Toaster position="top-center" richColors />
    </div>
  );
}
