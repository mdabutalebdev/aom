"use client";

import React, { useState } from "react";
import { FaCheckCircle, FaRegCopy } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

// A credential row (label + value + copy button).
const CredentialRow = ({ label, value, copyLabel, copied, onCopy }) => (
  <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-primary-100 bg-primary-50/40 px-4 py-3">
    <div className="min-w-0">
      <p className="text-xs font-medium text-primary-400">{label}</p>
      <p className="mt-0.5 break-all font-mono text-sm text-primary-900">
        {value || "—"}
      </p>
    </div>
    {value && (
      <button
        type="button"
        onClick={() => onCopy(copyLabel, value)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border border-primary-200 px-2.5 py-1.5 text-xs text-primary-600 transition-colors hover:bg-primary-50"
        aria-label={`Copy ${label}`}
      >
        {copied === copyLabel ? (
          <>
            <FiCheck /> Copied
          </>
        ) : (
          <>
            <FaRegCopy /> Copy
          </>
        )}
      </button>
    )}
  </div>
);

/**
 * ApproveResultModal — Shows the email and temporary password (tempPassword)
 * of the account created after approval, so the admin can share it.
 */
const ApproveResultModal = ({ isOpen, onClose, result }) => {
  const [copied, setCopied] = useState("");

  const email = result?.user?.email || "";
  const tempPassword = result?.tempPassword || "";

  const copy = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      // Clipboard unavailable — fail silently.
    }
  };

  const footer = (
    <Button variant="primary" size="sm" onClick={onClose}>
      OK
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Approved"
      size="md"
      footer={footer}
    >
      <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-700">
        <FaCheckCircle className="mt-0.5 shrink-0 text-base" />
        <span>
          Account created successfully. Please share the following login details
          with the guardian/student. This temporary password will not be shown again.
        </span>
      </div>

      <div className="space-y-3">
        <CredentialRow
          label="Email"
          value={email}
          copyLabel="email"
          copied={copied}
          onCopy={copy}
        />
        <CredentialRow
          label="Temporary Password"
          value={tempPassword}
          copyLabel="password"
          copied={copied}
          onCopy={copy}
        />
      </div>
    </Modal>
  );
};

export default ApproveResultModal;
