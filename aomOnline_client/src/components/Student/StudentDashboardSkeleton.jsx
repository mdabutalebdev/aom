"use client";

import React from "react";

import Skeleton from "@/components/ui/Skeleton";

/**
 * StudentDashboardSkeleton — Dashboard   (   )।
 */
const StudentDashboardSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
    {/*   */}
    <div className="lg:col-span-1">
      <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-6 shadow-soft">
        <div className="flex flex-col items-center gap-3">
          <Skeleton rounded="full" className="h-28 w-28" />
          <Skeleton className="h-5 w-40" />
          <Skeleton rounded="full" className="h-6 w-24" />
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="mt-6 h-24 w-full" rounded="lg" />
      </div>
    </div>

    {/*   */}
    <div className="space-y-5 lg:col-span-2">
      <Skeleton className="h-44 w-full" rounded="lg" />
      <Skeleton className="h-64 w-full" rounded="lg" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Skeleton className="h-20 w-full" rounded="lg" />
        <Skeleton className="h-20 w-full" rounded="lg" />
        <Skeleton className="h-20 w-full" rounded="lg" />
        <Skeleton className="h-20 w-full" rounded="lg" />
      </div>
      <Skeleton className="h-48 w-full" rounded="lg" />
    </div>
  </div>
);

export default StudentDashboardSkeleton;
