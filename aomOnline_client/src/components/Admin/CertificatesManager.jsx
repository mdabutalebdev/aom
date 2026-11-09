"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiRefreshCw, FiPlus, FiUploadCloud, FiX } from "react-icons/fi";
import { toast } from "sonner";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import { downloadCertificatePdf } from "@/lib/certificatePdf";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import CertificateCard from "@/components/shared/CertificateCard";

import CertificatesTable from "./CertificatesTable";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const todayStr = () => new Date().toISOString().slice(0, 10);

const CertificatesManager = ({ isTeacher = false }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Certificate view modal + PDF capture target
  const [viewTarget, setViewTarget] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);

  // Students (for the "Create Certificate" picker) — admin only.
  const [students, setStudents] = useState([]);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createStudent, setCreateStudent] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createImage, setCreateImage] = useState(""); // the uploaded certificate image URL
  const [uploadingCertImage, setUploadingCertImage] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [editDate, setEditDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/certificates`, { headers: { ...authHeaders() } });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setItems(Array.isArray(data.data) ? data.data : []);
      } else {
        setError(data.message || "Failed to load certificates.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/students?limit=1000`, { headers: { ...authHeaders() } });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const list = Array.isArray(data.data) ? data.data : data.data?.data || [];
        setStudents(list);
      }
    } catch {
      /* non-fatal — the picker just stays empty */
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
    if (!isTeacher) fetchStudents();
  }, [fetchCertificates, fetchStudents, isTeacher]);

  const doDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Certificate deleted successfully.");
        setDeleteTarget(null);
        fetchCertificates();
      } else {
        toast.error(data.message || "Deletion failed.");
      }
    } catch {
      toast.error("Could not connect to server.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Create ────────────────────────────────────────────────
  const openCreate = () => {
    setCreateStudent("");
    setCreateDate(todayStr());
    setCreateImage("");
    setCreateOpen(true);
  };

  const onSelectStudent = (id) => setCreateStudent(id);

  // Upload the ready-made certificate image (designed externally). It becomes
  // the certificate itself; stored on the certificate record as imageUrl.
  const handleCertImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCertImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API_BASE_URL}/settings/upload-image`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.data?.url) {
        toast.error(data.message || "Certificate image upload failed.");
        return;
      }
      setCreateImage(data.data.url);
      toast.success("Certificate image uploaded.");
    } catch {
      toast.error("Could not connect to server.");
    } finally {
      setUploadingCertImage(false);
      e.target.value = "";
    }
  };

  const saveCreate = async () => {
    if (!createStudent) {
      toast.error("Please select a student.");
      return;
    }
    if (!createImage) {
      toast.error("Please upload the certificate image.");
      return;
    }
    setSavingCreate(true);
    try {
      const selected = students.find((s) => s._id === createStudent);
      const classRef = selected?.classRef?._id || selected?.classRef || undefined;
      // Link the student's teacher too, so the certificate also shows on the
      // teacher's certificate list (which is scoped to their own students).
      const teacherRef = selected?.teacherRef?._id || selected?.teacherRef || undefined;
      const res = await fetch(`${API_BASE_URL}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          studentRef: createStudent,
          classRef,
          teacherRef,
          imageUrl: createImage,
          issuedAt: createDate || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Certificate created — it's now in the student's guardian portal.");
        setCreateOpen(false);
        fetchCertificates();
      } else {
        toast.error(data.message || "Could not create certificate.");
      }
    } catch {
      toast.error("Could not connect to server.");
    } finally {
      setSavingCreate(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────
  const openEdit = (item) => {
    setEditTarget(item);
    setEditName(item.studentName || item.studentRef?.name || item.studentRef?.userRef?.name || "");
    setEditCourse(item.courseName || item.classRef?.nameEn || item.classRef?.name || "");
    setEditNumber(item.certificateNumber || "");
    setEditDate(item.issuedAt ? new Date(item.issuedAt).toISOString().slice(0, 10) : "");
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    if (!editNumber.trim()) {
      toast.error("Certificate number cannot be empty.");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/certificates/${editTarget._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          studentName: editName.trim(),
          courseName: editCourse.trim(),
          certificateNumber: editNumber.trim(),
          issuedAt: editDate || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Certificate updated.");
        setEditTarget(null);
        fetchCertificates();
      } else {
        toast.error(data.message || "Update failed.");
      }
    } catch {
      toast.error("Could not connect to server.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const name = viewTarget?.certificateNumber || "certificate";
      if (viewTarget?.imageUrl) {
        // An uploaded certificate — download the original image exactly as-is.
        try {
          const res = await fetch(viewTarget.imageUrl);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const ext = (viewTarget.imageUrl.split("?")[0].split(".").pop() || "png").toLowerCase();
          a.download = `${name}.${ext}`;
          a.click();
          URL.revokeObjectURL(url);
        } catch {
          // Cross-origin read blocked — open it so the user can save manually.
          window.open(viewTarget.imageUrl, "_blank", "noopener");
        }
      } else {
        await downloadCertificatePdf(certRef.current, name);
      }
    } catch (err) {
      toast.error(err.message || "Could not download the certificate.");
    } finally {
      setDownloading(false);
    }
  };

  const studentOptions = students.map((s) => ({
    value: s._id,
    label: `${s.name || "Unnamed"}${s.studentId ? ` (${s.studentId})` : ""}`,
  }));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft">
        {!isTeacher ? (
          <Button variant="primary" onClick={openCreate}>
            <FiPlus />
            <span className="ml-1.5">Create Certificate</span>
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-primary-500 sm:inline">
            Showing {items.length} certificates
          </span>
          <Button variant="outline" onClick={() => fetchCertificates()} disabled={loading} className="justify-center">
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => fetchCertificates()}>
              Try again
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No certificates yet.{!isTeacher && " Click “Create Certificate” to issue one."}
        </div>
      ) : (
        <CertificatesTable
          items={items}
          onView={(item) => setViewTarget(item)}
          onEdit={openEdit}
          onDelete={(item) => setDeleteTarget(item)}
        />
      )}

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete Certificate"
        description={`Are you sure you want to delete certificate ${deleteTarget?.certificateNumber}? This action cannot be undone.`}
        loading={actionLoading}
      />

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Certificate"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={savingCreate}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveCreate} isLoading={savingCreate} disabled={savingCreate}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            id="create-student"
            label="Student"
            placeholder="Select a student"
            options={studentOptions}
            value={createStudent}
            onChange={(e) => onSelectStudent(e.target.value)}
            hint="Who this certificate is for — it appears in their guardian portal (also used for filtering)."
          />

          {/* The designed certificate image — this IS the certificate. */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-800">
              Certificate Image
            </label>
            {createImage ? (
              <div className="flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={createImage}
                  alt="Certificate preview"
                  className="max-h-72 w-full rounded-[var(--radius-lg)] border border-primary-100 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setCreateImage("")}
                  className="inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-md)] border border-primary-200 px-3 py-1.5 text-sm text-primary-600 transition-colors hover:bg-primary-50"
                >
                  <FiX /> Remove
                </button>
              </div>
            ) : (
              <label
                htmlFor="cert-image"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-primary-200 bg-primary-50/40 px-4 py-8 text-center text-primary-500 transition-colors hover:border-primary-400 hover:bg-primary-50"
              >
                {uploadingCertImage ? (
                  <>
                    <Spinner size="md" />
                    <span className="text-sm font-medium">Uploading…</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud className="text-2xl" />
                    <span className="text-sm font-medium">Click to upload the certificate</span>
                    <span className="text-xs text-primary-400">JPG, PNG or WEBP — your designed certificate</span>
                  </>
                )}
              </label>
            )}
            <input
              id="cert-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCertImageChange}
              disabled={uploadingCertImage}
            />
          </div>

          <Input
            id="create-date"
            type="date"
            label="Issue Date"
            value={createDate}
            onChange={(e) => setCreateDate(e.target.value)}
          />
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="View Certificate" size="xl">
        {viewTarget && (
          <div className="p-2 sm:p-4">
            <div className="mb-5 flex justify-end">
              <Button
                variant="primary"
                onClick={handleDownload}
                isLoading={downloading}
                disabled={downloading}
                className="gap-2"
              >
                {downloading ? "Preparing…" : viewTarget?.imageUrl ? "Download Image" : "Download PDF"}
              </Button>
            </div>
            <CertificateCard ref={certRef} cert={viewTarget} />
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Certificate"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditTarget(null)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveEdit} isLoading={savingEdit} disabled={savingEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        {editTarget && (
          <div className="space-y-4">
            <Input
              id="edit-cert-name"
              label="Name on Certificate"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Student's name as shown"
            />
            <Input
              id="edit-cert-course"
              label="Achievement / Course"
              value={editCourse}
              onChange={(e) => setEditCourse(e.target.value)}
              placeholder="e.g. Juz 30"
            />
            <Input
              id="edit-cert-number"
              label="Certificate Number"
              value={editNumber}
              onChange={(e) => setEditNumber(e.target.value)}
              placeholder="e.g. CERT-AOM-260723-AB12"
            />
            <Input
              id="edit-cert-date"
              type="date"
              label="Issued Date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CertificatesManager;
