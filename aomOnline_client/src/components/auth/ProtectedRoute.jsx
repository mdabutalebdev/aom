"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { fetchMe } from "@/redux/authSlice";
import { getToken, getRoleHome } from "@/config/auth";
import Spinner from "@/components/ui/Spinner";

/**
 * ProtectedRoute —  ।
 * -    /    → /login  ।
 * - allowedRoles ,  role    →   role-home  ।
 * -  fetchMe (GET /user/me)    ;   Spinner ।
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const verify = useCallback(async () => {
    const token = getToken();

    //   → Login ।
    if (!token) {
      router.replace("/login");
      return;
    }

    //    ।
    const result = await dispatch(fetchMe());

    if (!fetchMe.fulfilled.match(result)) {
      //  / → Login ।
      router.replace("/login");
      return;
    }

    const user = result.payload.user;
    const role = user?.role;

    // -  ।
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      //   →  role-home  ।
      router.replace(getRoleHome(role));
      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, [dispatch, router, allowedRoles]);

  useEffect(() => {
    //   ; setState await-   (deferred), cascading render ।
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking || !authorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">   ...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
