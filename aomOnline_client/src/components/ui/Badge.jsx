"use client";

import React from "react";

const variants = {
  primary: "bg-primary-50 text-primary-700 ring-primary-200",
  secondary: "bg-secondary-50 text-secondary-700 ring-secondary-200",
  accent: "bg-accent-50 text-accent-700 ring-accent-200",
  success: "bg-secondary-50 text-secondary-700 ring-secondary-200",
  warning: "bg-accent-50 text-accent-800 ring-accent-200",
  danger: "bg-red-50 text-danger ring-red-200",
  neutral: "bg-primary-50 text-primary-600 ring-primary-100",
};

/**
 * Badge — small status/label pill. Bangla-friendly.
 */
const Badge = ({ children, variant = "primary", className = "", ...props }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-sm font-medium ring-1 ring-inset ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
