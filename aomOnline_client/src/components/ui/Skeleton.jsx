"use client";

import React from "react";

/**
 * Skeleton — loading placeholder block with a soft shimmer.
 */
const Skeleton = ({ className = "", rounded = "md", ...props }) => {
  const radius = {
    sm: "rounded-[var(--radius-sm)]",
    md: "rounded-[var(--radius-md)]",
    lg: "rounded-[var(--radius-lg)]",
    full: "rounded-full",
  };

  return (
    <div
      className={`animate-pulse bg-primary-100/70 ${radius[rounded] || radius.md} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
