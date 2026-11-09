"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { FiLogOut } from "react-icons/fi";

import { logout } from "@/redux/authSlice";

/**
 * StudentHeader — Student/Parent Dashboard   ।
 * AOM  +  +  +   +   + Logout ।
 */
const StudentHeader = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  return (
    <header className="relative overflow-hidden brand-gradient text-white shadow-card">
      {/* /  —    */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none opacity-20"
      >
        <span className="absolute -right-2 top-3 text-6xl sm:text-7xl">🕌</span>
        <span className="absolute right-24 top-6 hidden text-4xl sm:block">🌙</span>
        <span className="absolute right-40 top-10 hidden text-3xl md:block">⭐</span>
        <span className="absolute -left-3 -bottom-4 text-6xl">🕌</span>
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-white/95 shadow-soft ring-2 ring-white/60 sm:h-16 sm:w-16">
            <Image
              src="/logo.jpg"
              alt="AOM Online Madrasa "
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold leading-tight drop-shadow-sm sm:text-2xl lg:text-3xl">
                AOM Online Madrasa
              </h1>
              {/*   —    */}
              <span
                className="animate-bounce text-2xl sm:text-3xl"
                aria-hidden="true"
              >
                👦
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-white/90 sm:text-sm">
              Learn Quran · Awaken Iman · Serve Ummah
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/40 backdrop-blur transition-colors hover:bg-white/25"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </header>
  );
};

export default StudentHeader;
