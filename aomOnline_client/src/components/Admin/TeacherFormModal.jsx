"use client";

import React, { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Empty form state.
const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  subject: "",
  designation: "",
  zoomLink: "",
  ratePerStudent: "",
  photo: "",
};

/**
 * TeacherFormModal — Teacher create/edit form.
 * Create: name, email, password, phone, subject, ratePerStudent, photo.
 * Edit: Profile (name/phone/subject/ratePerStudent/photo) — not email/password.
 */
const TeacherFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initial = null,
  loading = false,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const isEdit = !!initial;

  // Sync form when modal opens.
  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors({});
    setForm(
      initial
        ? {
            name: initial.userRef?.name || "",
            email: initial.userRef?.email || "",
            password: initial.userRef?.rawPassword || "",
            phone: initial.userRef?.phone || "",
            subject: initial.subject || "",
            designation: initial.designation || "",
            zoomLink: initial.zoomLink || "",
            ratePerStudent:
              initial.ratePerStudent != null
                ? String(initial.ratePerStudent)
                : "",
            photo: initial.photo || "",
          }
        : emptyForm
    );
  }, [isOpen, initial]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!isEdit) {
      if (!form.email.trim()) next.email = "Email is required.";
      if (!form.password || form.password.length < 6)
        next.password = "Password must be at least 6 characters.";
    } else {
      if (form.password && form.password.length < 6)
        next.password = "Password must be at least 6 characters.";
    }
    if (form.ratePerStudent === "" || Number(form.ratePerStudent) < 0)
      next.ratePerStudent = "Enter a valid rate.";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    let payload;
    if (isEdit) {
      // Edit: Profile fields + optional password update.
      payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        designation: form.designation.trim() || undefined,
        zoomLink: form.zoomLink.trim() || undefined,
        ratePerStudent: Number(form.ratePerStudent),
        photo: form.photo.trim() || undefined,
        ...(form.password ? { password: form.password } : {}),
      };
    } else {
      payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        designation: form.designation.trim() || undefined,
        zoomLink: form.zoomLink.trim() || undefined,
        ratePerStudent: Number(form.ratePerStudent),
        photo: form.photo.trim() || undefined,
      };
    }

    onSubmit?.(payload);
  };

  const footer = (
    <>
      <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={loading}
        isLoading={loading}
      >
        {isEdit ? "Update" : "Create"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Teacher" : "New Teacher"}
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="teacher-name"
            label="Name"
            placeholder="Teacher's full name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            error={errors.name}
          />
          <Input
            id="teacher-email"
            type="email"
            label="Email"
            placeholder="teacher@example.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            error={errors.email}
            disabled={isEdit}
            hint={isEdit ? "Email cannot be changed." : undefined}
          />
          <Input
            id="teacher-password"
            type="password"
            label={isEdit ? "Update Password" : "Password"}
            placeholder={isEdit ? "Leave blank to keep current" : "At least 6 characters"}
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            error={errors.password}
            hint={isEdit ? "Only fill this if you want to change their password." : undefined}
          />
          <Input
            id="teacher-phone"
            label="Phone (Optional)"
            placeholder="01XXXXXXXXX"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
          <Input
            id="teacher-subject"
            label="Subject (Optional)"
            placeholder="e.g. Quran"
            value={form.subject}
            onChange={(e) => setField("subject", e.target.value)}
          />
          <Input
            id="teacher-designation"
            label="Designation (Optional)"
            placeholder="e.g. Quran Teacher"
            value={form.designation}
            onChange={(e) => setField("designation", e.target.value)}
          />
          <Input
            id="teacher-zoom"
            label="Zoom Room Link (Optional)"
            placeholder="https://zoom.us/j/..."
            value={form.zoomLink}
            onChange={(e) => setField("zoomLink", e.target.value)}
          />
          <Input
            id="teacher-rate"
            type="number"
            min="0"
            label="Rate per Student ()"
            placeholder="200"
            value={form.ratePerStudent}
            onChange={(e) => setField("ratePerStudent", e.target.value)}
            error={errors.ratePerStudent}
          />
          <Input
            id="teacher-photo"
            label="Photo URL (Optional)"
            placeholder="https://..."
            value={form.photo}
            onChange={(e) => setField("photo", e.target.value)}
            containerClassName="sm:col-span-2"
          />
        </div>
      </form>
    </Modal>
  );
};

export default TeacherFormModal;
