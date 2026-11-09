"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { fetchMe } from "@/redux/authSlice";
import { getToken, getRoleHome, getStoredUser } from "@/config/auth";
import Spinner from "@/components/ui/Spinner";

/**
 * /dashboard — role resolver.
 * Lands here only when the role isn't known yet (getRoleHome fallback).
 * Uses the cached profile when present, otherwise asks the server, then
 * replaces the history entry with the real role home.
 */
const DashboardIndexPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const resolve = async () => {
      if (!getToken()) {
        router.replace("/login");
        return;
      }

      const cachedRole = getStoredUser()?.role;
      if (cachedRole) {
        router.replace(getRoleHome(cachedRole));
        return;
      }

      const result = await dispatch(fetchMe());
      if (!fetchMe.fulfilled.match(result)) {
        router.replace("/login");
        return;
      }
      router.replace(getRoleHome(result.payload.user?.role));
    };

    resolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="animate-pulse text-primary-500">Loading your dashboard...</p>
    </div>
  );
};

export default DashboardIndexPage;
