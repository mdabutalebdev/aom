"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiSave, FiX, FiCamera } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";
import AdminAvatar from "./AdminAvatar";
import { STUDENT_STATUS_OPTIONS } from "./managementConstants";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  photo: "",
  classRef: "",
  teacherRef: "",
  guardianName: "",
  guardianPhone: "",
  address: "",
  monthlyFee: "",
  teacherPayoutAmount: "",
  guardianEmail: "",
  guardianPassword: "",
  status: "active",
};

/**
 * StudentForm — Student create/edit as a full page.
 * studentId prop present -> edit mode (fetches that student); absent -> create.
 * Was a Modal before; moved to its own page because the guardian-account
 * fields made it too tall/cramped as a dialog.
 */
const StudentForm = ({ studentId }) => {
  const router = useRouter();
  const isEdit = !!studentId;

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  // Has the user manually changed the fee? If so, don't override with auto-fill.
  const [feeTouched, setFeeTouched] = useState(false);

  const hasGuardianAccount = !!initial?.userRef;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [clsRes, tchRes, studentRes] = await Promise.all([
        apiClient.get(`/classes`),
        apiClient.get(`/teachers?limit=100`),
        isEdit ? apiClient.get(`/students/${studentId}`) : Promise.resolve(null),
      ]);

      const clsList = Array.isArray(clsRes)
        ? clsRes
        : Array.isArray(clsRes.data)
        ? clsRes.data
        : [];
      clsList.sort((a, b) => (a.order || 0) - (b.order || 0));
      setClasses(clsList);
      setTeachers(Array.isArray(tchRes.data) ? tchRes.data : []);

      if (studentRes) {
        const s = studentRes.data;
        setInitial(s);
        setFeeTouched(true);
        setForm({
          name: s.name || "",
          email: s.email || "",
          phone: s.phone || "",
          // <input type="date"> needs a bare yyyy-mm-dd, not a full ISO string.
          dateOfBirth: s.dateOfBirth ? String(s.dateOfBirth).slice(0, 10) : "",
          photo: s.photo || "",
          classRef: s.classRef?._id || "",
          teacherRef: s.teacherRef?._id || "",
          guardianName: s.guardianName || "",
          guardianPhone: s.guardianPhone || "",
          address: s.address || "",
          monthlyFee: s.monthlyFee != null ? String(s.monthlyFee) : "",
          teacherPayoutAmount:
            s.teacherPayoutAmount != null ? String(s.teacherPayoutAmount) : "",
          guardianEmail: s.userRef?.email || "",
          guardianPassword: s.userRef?.rawPassword || "",
          status: s.status || "active",
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load form data.");
    } finally {
      setLoading(false);
    }
  }, [isEdit, studentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Upload a student photo (admin image endpoint — falls back to local disk
  // when Cloudinary isn't configured). The returned URL is stored on the form
  // and saved with the student; it's what shows on the certificate.
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await apiClient.post("/settings/upload-image", fd);
      const url = res?.data?.url;
      if (url) {
        setField("photo", url);
        toast.success("Photo uploaded.");
      } else {
        toast.error("Photo upload failed.");
      }
    } catch (err) {
      toast.error(err.message || "Photo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  };

  // Class change -> auto-fill selected class's monthlyFee (if not manually changed).
  const onClassChange = (value) => {
    setForm((f) => {
      const next = { ...f, classRef: value };
      if (!feeTouched) {
        const cls = classes.find((c) => c._id === value);
        if (cls && cls.monthlyFee != null) {
          next.monthlyFee = String(cls.monthlyFee);
        }
      }
      return next;
    });
  };

  const onTeacherChange = (value) => setField("teacherRef", value);

  const onFeeChange = (value) => {
    setFeeTouched(true);
    setField("monthlyFee", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.classRef) next.classRef = "Please select a class.";
    if (!form.teacherRef) next.teacherRef = "Please select a teacher.";
    if (form.monthlyFee !== "" && Number(form.monthlyFee) < 0)
      next.monthlyFee = "Enter a valid fee.";
    if (form.teacherPayoutAmount !== "" && Number(form.teacherPayoutAmount) < 0)
      next.teacherPayoutAmount = "Enter a valid amount.";

    if (hasGuardianAccount) {
      if (form.guardianPassword && form.guardianPassword.length < 6) {
        next.guardianPassword = "Password must be at least 6 characters.";
      }
      if (!form.guardianEmail.trim()) {
        next.guardianEmail = "Email is required for the guardian account.";
      }
    } else {
      if (
        (form.guardianEmail.trim() || form.guardianPassword) &&
        !(form.guardianEmail.trim() && form.guardianPassword.length >= 6)
      ) {
        next.guardianEmail =
          "Provide both a valid guardian email and a password (6+ characters) to create the login, or leave both blank.";
      }
    }

    if (Object.keys(next).length) {
      setErrors(next);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      photo: form.photo || undefined,
      classRef: form.classRef,
      teacherRef: form.teacherRef,
      guardianName: form.guardianName.trim() || undefined,
      guardianPhone: form.guardianPhone.trim() || undefined,
      address: form.address.trim() || undefined,
      ...(form.monthlyFee !== "" ? { monthlyFee: Number(form.monthlyFee) } : {}),
      ...(form.teacherPayoutAmount !== ""
        ? { teacherPayoutAmount: Number(form.teacherPayoutAmount) }
        : {}),
      ...(form.guardianEmail.trim() || form.guardianPassword
        ? {
            guardianEmail: form.guardianEmail.trim(),
            ...(form.guardianPassword ? { guardianPassword: form.guardianPassword } : {}),
          }
        : {}),
      ...(isEdit ? { status: form.status } : {}),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await apiClient.patch(`/students/${studentId}`, payload);
        toast.success("Student updated.");
      } else {
        await apiClient.post(`/students`, payload);
        toast.success("New student added.");
      }
      router.push("/dashboard/admin/students");
    } catch (err) {
      toast.error(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const classOptions = classes.map((c) => ({ value: c._id, label: c.nameEn || c.name }));
  const teacherOptions = teachers.map((t) => ({
    value: t._id,
    label: `${t.userRef?.name || "—"}${t.teacherId ? ` (${t.teacherId})` : ""}`,
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-10 text-center text-danger">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {/* Student photo — shows on the certificate and profile cards */}
          <div className="flex flex-col items-center gap-2 sm:col-span-2">
            <div className="relative">
              <AdminAvatar src={form.photo} name={form.name} size={88} />
              <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white shadow-soft transition-colors hover:bg-primary-600">
                <FiCamera className="text-sm" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-xs text-primary-500">
              {uploading ? "Uploading…" : "Student photo (optional) — appears on the certificate"}
            </p>
          </div>
          <Input
            id="student-name"
            label="Name"
            placeholder="Student's full name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            error={errors.name}
          />
          <Input
            id="student-email"
            type="email"
            label="Email (Optional)"
            placeholder="student@example.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
          <Input
            id="student-phone"
            label="Phone (Optional)"
            placeholder="01XXXXXXXXX"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
          <Input
            id="student-dob"
            type="date"
            label="Date of Birth (Optional)"
            value={form.dateOfBirth}
            onChange={(e) => setField("dateOfBirth", e.target.value)}
          />
          {isEdit && (
            <Select
              id="student-status"
              label="Status"
              placeholder=""
              options={STUDENT_STATUS_OPTIONS}
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
            />
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="student-address">Address (Optional)</Label>
            <Textarea
              id="student-address"
              rows={2}
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Student's address..."
            />
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Class, Teacher & Fees</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Select
            id="student-class"
            label="Class"
            options={classOptions}
            value={form.classRef}
            onChange={(e) => onClassChange(e.target.value)}
            error={errors.classRef}
          />
          <Select
            id="student-teacher"
            label="Teacher"
            options={teacherOptions}
            value={form.teacherRef}
            onChange={(e) => onTeacherChange(e.target.value)}
            error={errors.teacherRef}
          />
          <Input
            id="student-fee"
            type="number"
            min="0"
            label="Monthly Fee (৳)"
            placeholder="Auto from class"
            value={form.monthlyFee}
            onChange={(e) => onFeeChange(e.target.value)}
            error={errors.monthlyFee}
            hint="What the guardian pays — automatic based on class, change if needed."
          />
          <Input
            id="student-teacher-payout"
            type="number"
            min="0"
            label="Teacher Payout for this Student (৳)"
            placeholder="e.g. 350"
            value={form.teacherPayoutAmount}
            onChange={(e) => setField("teacherPayoutAmount", e.target.value)}
            error={errors.teacherPayoutAmount}
            hint="What the teacher earns for this student — separate from the guardian's fee above."
          />
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Guardian</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Input
            id="student-guardian-name"
            label="Guardian Name (Optional)"
            placeholder="Guardian's name"
            value={form.guardianName}
            onChange={(e) => setField("guardianName", e.target.value)}
          />
          <Input
            id="student-guardian-phone"
            label="Guardian Phone (Optional)"
            placeholder="01XXXXXXXXX"
            value={form.guardianPhone}
            onChange={(e) => setField("guardianPhone", e.target.value)}
          />
          <Input
            id="student-guardian-email"
            type="email"
            autoComplete="off"
            label="Guardian Login Email (Optional)"
            placeholder="guardian@example.com"
            value={form.guardianEmail}
            onChange={(e) => setField("guardianEmail", e.target.value)}
            error={errors.guardianEmail}
            hint={
              hasGuardianAccount
                ? "Update email for guardian login if needed."
                : "Fill this in with a password to create the guardian's dashboard login."
            }
          />
          <Input
            id="student-guardian-password"
            type="password"
            autoComplete="new-password"
            label={hasGuardianAccount ? "Update Guardian Password" : "Guardian Login Password (Optional)"}
            placeholder={hasGuardianAccount ? "Leave blank to keep current" : "At least 6 characters"}
            value={form.guardianPassword}
            onChange={(e) => setField("guardianPassword", e.target.value)}
            error={errors.guardianPassword}
            hint={hasGuardianAccount ? "Only fill this if you want to change their password." : undefined}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/admin/students")}
          disabled={saving}
        >
          <FiX className="mr-1.5" /> Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" isLoading={saving} disabled={saving}>
          <FiSave className="mr-1.5" />
          {isEdit ? "Update Student" : "Create Student"}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
