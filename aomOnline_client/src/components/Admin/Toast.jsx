"use client";

import React, { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { FiAlertCircle, FiX } from "react-icons/fi";

/**
 * Toast — fixed corner notification (success/error).
 * toast = { type: 'success' | 'error', message } | null
 */
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onClose?.(), 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const success = toast.type === "success";

  return (
    <div className="fixed bottom-5 right-5 z-[60] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm shadow-card ${
          success
            ? "border-secondary-200 bg-secondary-50 text-secondary-700"
            : "border-danger/30 bg-red-50 text-danger"
        }`}
      >
        {success ? (
          <FaCheckCircle className="mt-0.5 shrink-0 text-base" />
        ) : (
          <FiAlertCircle className="mt-0.5 shrink-0 text-base" />
        )}
        <span className="flex-1">{toast.message}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
        >
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default Toast;
