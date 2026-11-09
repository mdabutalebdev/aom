"use client";

import React from "react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

/**
 * ManagementDeleteModal — Generic delete confirmation for Phase 5 modules.
 * Usable everywhere (classes/teachers/students) with title/name/description props.
 */
const ManagementDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete",
  name = "this item",
  loading = false,
}) => {
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
      title={title}
      size="sm"
      footer={footer}
    >
      <p className="text-sm text-primary-700">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-primary-900">{name}</span>? This
        action cannot be undone.
      </p>
    </Modal>
  );
};

export default ManagementDeleteModal;
