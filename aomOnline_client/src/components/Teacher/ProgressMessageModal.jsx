"use client";

import React, { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import RichTextEditor from "@/components/shared/RichTextEditor";
import LevelMessageCard from "@/components/shared/LevelMessageCard";

/**
 * ProgressMessageModal — lets a teacher write/edit the rich-text message that
 * appears on the guardian's progress card. Shows a live preview of the exact
 * card the guardian will see.
 */
const ProgressMessageModal = ({ isOpen, onClose, student, saving = false, onSave }) => {
  const [note, setNote] = useState("");

  // Load the student's existing message whenever the modal opens.
  useEffect(() => {
    if (isOpen) setNote(student?.note || "");
  }, [isOpen, student]);

  const footer = (
    <>
      <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
        Cancel
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => onSave?.(note)}
        disabled={saving}
        isLoading={saving}
      >
        Save Message
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Message — ${student?.name || "Student"}`}
      size="xl"
      footer={footer}
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-primary-800">
            Write a message for the guardian
          </p>
          <RichTextEditor
            value={note}
            onChange={setNote}
            placeholder="e.g. তুমি এরাবিক লেটার সম্পূর্ণ শিখেছো, এখন তুমি জয়েনিং লেটার শিখছো…"
          />
          <p className="mt-1.5 text-xs text-primary-400">
            Make text bold, larger, or colourful with the toolbar. This shows on
            the guardian&apos;s progress card exactly as previewed below.
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-primary-800">Live preview</p>
          <LevelMessageCard
            className={student?.className}
            percentage={student?.percentage}
            note={note}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProgressMessageModal;
