"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { logout } from "@/redux/authSlice";
import { Card, CardBody, Badge, Button } from "@/components/ui";

//  →   ।
const roleLabels = {
  admin: "Admin",
  superAdmin: "Super Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

/**
 * DashboardWelcome — Phase-2 ।
 * Login   +   + Logout  ।
 */
const DashboardWelcome = ({ title }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Card>
        <CardBody className="text-center">
          <Badge variant="accent" className="mb-4">
            {title}
          </Badge>

          <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
            Assalamu Alaikum{user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="mt-3 text-primary-600">
            AOM Online Madrasa  ।  Dashboard   
            ।
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-primary-500">Your Role:</span>
            <Badge variant="primary">
              {roleLabels[user?.role] || user?.role || "Student"}
            </Badge>
          </div>

          <div className="mt-8">
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DashboardWelcome;
