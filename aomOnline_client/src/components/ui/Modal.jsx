"use client";

import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  "2xl": "max-w-4xl",
};

/**
 * Modal — accessible dialog with backdrop.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  footer = null,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : "Dialog"}
    >
      <div
        className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${sizes[size] || sizes.md} animate-fade-in-up rounded-[var(--radius-2xl)] bg-surface shadow-card`}
      >
        <div className="flex items-center justify-between border-b border-primary-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-primary-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-primary-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
