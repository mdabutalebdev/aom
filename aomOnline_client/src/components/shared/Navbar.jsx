"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { HiMenu, HiX } from "react-icons/hi";

import { logout } from "@/redux/authSlice";
import { getRoleHome } from "@/config/auth";
import Button from "@/components/ui/Button";

// Public navigation links.
const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Admission", href: "/admission" },
  { label: "Join as Teacher", href: "/join-teacher" },
];

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Prevent hydration mismatch by using a mounted guard.
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Post-hydration single mount flag; not cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close mobile menu on route change — sync with external navigation state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
    router.push("/");
  };

  const loggedIn = mounted && isAuthenticated;

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary-100/70 bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="AOM Online Madrasa logo"
            width={44}
            height={44}
            className="rounded-[var(--radius-md)]"
            priority
          />
          <span className="text-lg font-semibold text-primary-700 sm:text-xl">
            AOM Online Madrasa
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={`relative py-1 text-[15px] font-medium transition-colors hover:text-primary-500 ${
                  isActive(link.href)
                    ? "text-primary-600"
                    : "text-primary-800"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary-500" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Call to Action / Auth State (Desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          {loggedIn ? (
            <>
              <Link href={getRoleHome(user?.role)}>
                <Button variant="outline" size="sm">
                  {user?.name || "My Account"}
                </Button>
              </Link>
              <Button variant="primary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/admission">
                <Button variant="primary" size="sm">
                  Enroll Now
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-primary-700 transition-colors hover:bg-primary-50 md:hidden"
        >
          {mobileOpen ? (
            <HiX className="h-6 w-6" />
          ) : (
            <HiMenu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="border-t border-primary-100 bg-surface md:hidden">
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`block rounded-[var(--radius-md)] px-3 py-2.5 text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary-50 text-primary-700"
                      : "text-primary-800 hover:bg-primary-50"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="pt-2">
              {loggedIn ? (
                <div className="flex flex-col gap-2">
                  <Link href={getRoleHome(user?.role)}>
                    <Button variant="outline" size="md" fullWidth>
                      {user?.name || "My Account"}
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="md" fullWidth>
                      Login
                    </Button>
                  </Link>
                  <Link href="/admission">
                    <Button variant="primary" size="md" fullWidth>
                      Enroll Now
                    </Button>
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
