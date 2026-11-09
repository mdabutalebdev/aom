"use client";

import React from "react";

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-9 w-9 border-[3px]",
  xl: "h-12 w-12 border-4",
};

/**
 * Spinner — loading indicator using the brand teal.
 */
const Spinner = ({ size = "md", className = "" }) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-primary-200 border-t-primary-500 ${sizeMap[size] || sizeMap.md} ${className}`}
    />
  );
};

export default Spinner;
