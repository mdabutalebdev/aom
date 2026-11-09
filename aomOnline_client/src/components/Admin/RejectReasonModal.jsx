"use client";

import React, { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

/**
 * RejectReasonModal — Prompt for an optional rejection reason.
 * Calls onConfirm(reason); reason can be empty.
 */
const RejectReasonModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
  const [reason, setReason] = useState("");

  // Reset reason field when modal opens — synced with external open-state, not cascading.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setReason("");
  }, [isOpen]);

  const footer = (
    <>
      <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => onConfirm?.(reason.trim())}
        disabled={loading}
        isLoading={loading}
      >
        Confirm Rejection
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Application"
      size="md"
      footer={footer}
    >
      <p className="text-sm text-primary-600">
        You may optionally provide a reason for rejection. This will be saved
        with the application.
      </p>
      <textarea
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter rejection reason..."
        className="mt-3 w-full rounded-[var(--radius-md)] border border-primary-200 bg-surface px-4 py-2.5 text-base text-primary-900 placeholder:text-primary-300 outline-none transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
      />
    </Modal>
  );
};

export default RejectReasonModal;
