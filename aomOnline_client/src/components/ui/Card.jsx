"use client";

import React from "react";

/**
 * Card — soft, rounded surface container using the design tokens.
 */
const Card = ({ children, className = "", hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-surface rounded-[var(--radius-2xl)] border border-primary-100/60 shadow-soft ${hoverable ? "transition-shadow duration-200 hover:shadow-card" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 pt-6 pb-3 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-semibold text-primary-800 ${className}`}>
    {children}
  </h3>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`px-6 pt-3 pb-6 ${className}`}>{children}</div>
);

export default Card;
