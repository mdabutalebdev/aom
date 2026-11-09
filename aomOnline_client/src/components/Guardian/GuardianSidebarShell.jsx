"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  FiGrid,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiAward,
  FiMessageSquare,
  FiCalendar,
  FiBookOpen,
} from "react-icons/fi";

import { logout } from "@/redux/authSlice";
import NotificationBell from "@/components/common/NotificationBell";

const NAV_ITEMS = [
  { href: "/dashboard/guardian", label: "Dashboard", icon: FiGrid, exact: true },
  { href: "/dashboard/guardian/routine", label: "Class Routine", icon: FiCalendar },
  { href: "/dashboard/guardian/payments", label: "Payments", icon: FiCreditCard },
  { href: "/dashboard/guardian/certificates", label: "Certificates", icon: FiAward },
  { href: "/dashboard/guardian/messages", label: "Messages", icon: FiMessageSquare },
  { href: "/dashboard/guardian/homework", label: "Homework", icon: FiBookOpen },
  { href: "/dashboard/guardian/settings", label: "Settings", icon: FiSettings },
];

/**
 * GuardianSidebarShell — mirrors TeacherSidebarShell/AdminSidebarShell:
 * fixed left sidebar (Logo + Nav + Logout) + topbar (title + Bell + name).
 */
const GuardianSidebarShell = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const activeNav = [...NAV_ITEMS]
    .filter((i) => isActive(i))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const pageTitle = activeNav?.label || "Dashboard";

  const NavContent = (
    <nav className="flex h-full flex-col">
      <Link
        href="/dashboard/guardian"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-3 px-5 py-5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-white/10 ring-1 ring-white/15">
          <Image
            src="/logo.jpg"
            alt="AOM Online Madrasa"
            width={44}
            height={44}
            className="h-full w-full object-cover"
            priority
          />
        </span>
        <span className="text-base font-bold leading-tight text-white">
          AOM Online
          <br />
          Madrasa
        </span>
      </Link>

      <div className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white text-primary-700 shadow-soft"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="shrink-0 text-lg" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <FiLogOut className="shrink-0 text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-primary-900 lg:flex">
        {NavContent}
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-primary-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary-900 shadow-lift lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 text-white/70 transition-colors hover:text-white"
            >
              <FiX className="text-xl" />
            </button>
            {NavContent}
          </aside>
        </>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-primary-100/70 bg-surface/90 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-primary-700 transition-colors hover:bg-primary-50 lg:hidden"
              >
                <FiMenu className="text-xl" />
              </button>
              <h1 className="truncate text-lg font-bold text-primary-900 sm:text-xl">
                {pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationBell />
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <FiUser />
                </span>
                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-semibold text-primary-900">
                    {user?.name || "Guardian"}
                  </p>
                  <p className="text-xs text-primary-500">Guardian</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
};

export default GuardianSidebarShell;
