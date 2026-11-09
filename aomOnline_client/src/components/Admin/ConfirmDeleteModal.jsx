"use client";

import React from "react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

/**
 * ConfirmDeleteModal — Prompt to confirm application deletion.
 */
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, admission, loading = false }) => {
  const footer = (
    <>
      <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={onConfirm}
        disabled={loading}
        isLoading={loading}
      >
        Delete
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Application"
      size="sm"
      footer={footer}
    >
      <p className="text-sm text-primary-700">
        Are you sure you want to delete the application for{" "}
        <span className="font-semibold text-primary-900">
          {admission?.studentName || "this student"}
        </span>
        ? This action cannot be undone.
      </p>
    </Modal>
  );
};

export default ConfirmDeleteModal;
