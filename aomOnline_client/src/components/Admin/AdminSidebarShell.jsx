"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  FiGrid,
  FiUserPlus,
  FiBookOpen,
  FiUsers,
  FiUser,
  FiCreditCard,
  FiDollarSign,
  FiClock,
  FiBarChart2,
  FiSettings,
  FiImage,
  FiLayout,
  FiVideo,
  FiMessageSquare,
  FiAward,
  FiMic,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiX,
  FiSend,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";

import { logout } from "@/redux/authSlice";
import NotificationBell from "@/components/common/NotificationBell";

// Role -> English label.
const ROLE_LABELS = {
  admin: "Admin",
  superAdmin: "Super Admin",
};

// Active navigation items.
const NAV_ITEMS = [
  { href: "/dashboard/admin", label: "Dashboard", icon: FiGrid, exact: true },
  { href: "/dashboard/admin/admissions", label: "Admissions", icon: FiUserPlus },
  { href: "/dashboard/admin/classes", label: "Classes", icon: FiBookOpen },
  { href: "/dashboard/admin/teachers", label: "Teachers", icon: FiUsers },
  { href: "/dashboard/admin/students", label: "Single Student", icon: FiUser },
  { href: "/dashboard/admin/group-students", label: "Group Student", icon: FiUsers },
  { href: "/dashboard/admin/payments", label: "Payments", icon: FiCreditCard },
  { href: "/dashboard/admin/certificates", label: "Certificates", icon: FiAward },
  { href: "/dashboard/admin/salary", label: "Salary", icon: FiDollarSign },
  { href: "/dashboard/admin/upcoming-class", label: "Upcoming Class", icon: FiClock },
  { href: "/dashboard/admin/routine", label: "Class Routine", icon: FiCalendar },
  { href: "/dashboard/admin/results", label: "Exam Results", icon: FiFileText },
  { href: "/dashboard/admin/teacher-applications", label: "Applications", icon: FiUserPlus },
  { href: "/dashboard/admin/notifications", label: "Notifications", icon: FiSend },
  { href: "/dashboard/admin/reports", label: "Reports", icon: FiBarChart2 },
  {
    href: "/dashboard/admin/homepage",
    label: "Homepage",
    icon: FiImage,
    children: [
      { href: "/dashboard/admin/homepage/hero", label: "Hero", icon: FiLayout },
      { href: "/dashboard/admin/homepage/class-demo", label: "Class Demo", icon: FiVideo },
      { href: "/dashboard/admin/testimonials", label: "Reviews", icon: FiMessageSquare },
      { href: "/dashboard/admin/achievements", label: "Achievements", icon: FiAward },
      { href: "/dashboard/admin/presentations", label: "Presentations", icon: FiMic },
    ],
  },
  { href: "/dashboard/admin/settings", label: "Settings", icon: FiSettings },
];

/**
 * AdminSidebarShell — Admin area integrated shell:
 * Left sidebar (Logo + Brand + Nav + Logout) + Topbar (Page title + Bell + Admin name).
 * Sidebar opens/closes with hamburger on mobile.
 */
const AdminSidebarShell = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [mobileOpen, setMobileOpen] = useState(false);
  // Explicit expand/collapse overrides for grouped nav items, keyed by
  // parent href. When a group's href isn't present here, it defaults to
  // "expanded if the group or one of its children is the active route".
  const [expandedOverride, setExpandedOverride] = useState({});

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  // Page title for topbar based on current route — flattens grouped items
  // so a sub-page (e.g. Parents Reviews) still resolves to its own title.
  const flatNavItems = NAV_ITEMS.flatMap((item) => (item.children ? item.children : [item]));
  const activeNav = [...flatNavItems]
    .filter((i) => isActive(i))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const pageTitle = activeNav?.label || "Dashboard";

  const roleLabel = ROLE_LABELS[user?.role] || "Admin";

  const NavContent = (
    <nav className="flex h-full flex-col">
      {/* Brand */}
      <Link
        href="/dashboard/admin"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-3 px-5 py-5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-white/10 ring-1 ring-white/15">
          <Image
            src="/logo.jpg"
            alt="AOM Logo"
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

      {/* Main Nav */}
      <div className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          if (!item.children) {
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
          }

          // Grouped item — parent link + expandable sub-menu.
          // A child route (e.g. /homepage/hero) starts with the parent href, so
          // `active` (startsWith) is true on child pages too. Highlight the
          // parent row ONLY when the parent's OWN route is active, so selecting
          // a child doesn't also light up the parent. The group still stays
          // expanded while a child is active.
          const childActive = item.children.some((c) => isActive(c));
          const selfActive = pathname === item.href;
          const expanded =
            item.href in expandedOverride ? expandedOverride[item.href] : active || childActive;
          const highlighted = selfActive;

          return (
            <div key={item.href}>
              <div
                className={`flex items-center rounded-[var(--radius-md)] transition-colors ${
                  highlighted ? "bg-white text-primary-700 shadow-soft" : "text-white/80"
                }`}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={selfActive ? "page" : undefined}
                  className={`flex flex-1 items-center gap-3 px-4 py-2.5 text-sm font-medium ${
                    highlighted ? "" : "hover:text-white"
                  }`}
                >
                  <Icon className="shrink-0 text-lg" />
                  <span>{item.label}</span>
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedOverride((o) => ({ ...o, [item.href]: !expanded }))
                  }
                  aria-label={expanded ? "Collapse" : "Expand"}
                  aria-expanded={expanded}
                  className={`shrink-0 px-3 py-2.5 ${highlighted ? "" : "hover:text-white"}`}
                >
                  <FiChevronDown
                    className={`text-sm transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {expanded && (
                <div className="ml-4 mt-1 space-y-1 border-l border-white/15 pl-3">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const childActiveItem = isActive(child);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={childActiveItem ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors ${
                          childActiveItem
                            ? "bg-white text-primary-700 shadow-soft"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <ChildIcon className="shrink-0 text-base" />
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Logout */}
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
      {/* Desktop Sidebar (Fixed) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-primary-900 lg:flex">
        {NavContent}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
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

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Topbar */}
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
              {/* Notification Bell */}
              <NotificationBell />

              {/* Admin Identity */}
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <FiUser />
                </span>
                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-semibold text-primary-900">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-primary-500">{roleLabel}</p>
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

export default AdminSidebarShell;
