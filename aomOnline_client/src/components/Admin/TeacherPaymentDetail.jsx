"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiSearch,
  FiUsers,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiInfo,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

import AdminAvatar from "./AdminAvatar";
import PaymentToggle from "./PaymentToggle";
import TeacherFormModal from "./TeacherFormModal";
import ManagementDeleteModal from "./ManagementDeleteModal";
import { formatTaka, toBanglaDigits } from "./managementConstants";
import {
  PAYMENT_STATUS_META,
  PAYMENT_STATUS_FILTERS,
  banglaMonthName,
} from "./paymentConstants";

const EMPTY_STATS = {
  totalPaid: 0,
  totalUnpaid: 0,
  totalCollected: 0,
  totalDue: 0,
  paidPercent: 0,
  unpaidPercent: 0,
};

const StatTile = ({ icon: Icon, label, value, tone }) => (
  <div className={`rounded-[var(--radius-lg)] border p-3.5 text-center ${tone}`}>
    <div className="flex items-center justify-center gap-1.5 text-sm opacity-80">
      <Icon /> {label}
    </div>
    <p className="mt-1 text-xl font-bold">{value}</p>
  </div>
);

/**
 * TeacherPaymentDetail — Teacher Profile: identity + stat tiles + paid/unpaid
 * bar + searchable/filterable student roster with a payment toggle per row.
 */
const TeacherPaymentDetail = ({ teacherId }) => {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [monthInfo, setMonthInfo] = useState({ month: null, year: null });
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [togglingId, setTogglingId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/payments/teacher/${teacherId}`);
      const payload = res.data || {};
      setTeacher(payload.teacher || null);
      setMonthInfo({ month: payload.month, year: payload.year });
      setStudents(Array.isArray(payload.students) ? payload.students : []);
      setStats(payload.stats || EMPTY_STATS);
    } catch (err) {
      setError(err.message || "Failed to load teacher details.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetail();
  }, [fetchDetail]);

  const applySearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim().toLowerCase());
  };

  const visibleStudents = useMemo(() => {
    return students.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (search) {
        const hay = `${s.name || ""} ${s.studentId || ""}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [students, search, statusFilter]);

  const handleToggle = async (student) => {
    if (togglingId) return;
    setTogglingId(student._id);
    try {
      const res = await apiClient.patch("/payments/toggle", { studentId: student._id });
      const payload = res.data || {};
      const newStatus = payload.payment?.status;
      const newPaymentId = payload.payment?._id;

      setStudents((prev) =>
        prev.map((s) =>
          s._id === student._id
            ? { ...s, status: newStatus || (s.status === "paid" ? "unpaid" : "paid"), paymentId: newPaymentId ?? s.paymentId }
            : s
        )
      );
      if (payload.stats) setStats(payload.stats);
      const finalStatus = newStatus || (student.status === "paid" ? "unpaid" : "paid");
      toast.success(finalStatus === "paid" ? `${student.name || "Student"} marked as paid.` : `${student.name || "Student"} marked as unpaid.`);
    } catch (err) {
      toast.error(err.message || "Payment update failed.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleEditSubmit = async (payload) => {
    setEditLoading(true);
    try {
      await apiClient.patch(`/teachers/${teacherId}`, payload);
      toast.success("Teacher updated.");
      setEditOpen(false);
      fetchDetail();
    } catch (err) {
      toast.error(err.message || "Save failed.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/teachers/${teacherId}`);
      toast.success("Teacher deleted.");
      router.push("/dashboard/admin/teachers");
    } catch (err) {
      toast.error(err.message || "Deletion failed.");
      setDeleteLoading(false);
    }
  };

  const monthLabel = monthInfo.month && monthInfo.year ? `${banglaMonthName(monthInfo.month)} ${monthInfo.year}` : "";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">Loading...</p>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-10 text-center text-danger">
        <p>{error || "Teacher not found."}</p>
        <div className="mt-4 flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchDetail()}>Try again</Button>
          <Link href="/dashboard/admin/teachers"><Button variant="ghost" size="sm">Back to Teachers</Button></Link>
        </div>
      </div>
    );
  }

  const paidPercent = Math.round(stats.paidPercent ?? 0);
  const unpaidPercent = Math.round(stats.unpaidPercent ?? 0);

  return (
    <div>
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <Link href="/dashboard/admin/teachers" className="inline-flex items-center gap-1.5 text-sm text-primary-500 transition-colors hover:text-primary-700">
          <FiArrowLeft /> Back to Teachers
        </Link>
        <h1 className="text-base font-semibold text-primary-900">Teacher Profile</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-500 transition-colors hover:bg-primary-50" aria-label="More actions">
              <FiMoreVertical />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <FiEdit2 /> Edit Teacher
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <FiTrash2 /> Delete Teacher
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile + Stats */}
      <div className="rounded-[var(--radius-lg)] border border-primary-100/60 bg-surface p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <AdminAvatar src={teacher.photo} name={teacher.name} size={72} />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-primary-900">{teacher.name || "—"}</h2>
              <p className="text-sm text-primary-500">Teacher ID: {teacher.teacherId || "—"}</p>
              <div className="mt-1.5 flex flex-col gap-0.5 text-sm text-primary-600 sm:flex-row sm:flex-wrap sm:gap-x-4">
                {teacher.email && (
                  <span className="flex items-center gap-1.5"><FiMail className="text-primary-400" /> {teacher.email}</span>
                )}
                {teacher.phone && (
                  <span className="flex items-center gap-1.5"><FiPhone className="text-primary-400" /> {toBanglaDigits(teacher.phone)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
            <StatTile icon={FiUsers} label="Total Students" value={toBanglaDigits(teacher.studentCount ?? 0)} tone="border-primary-100 bg-primary-50/60 text-primary-800" />
            <StatTile icon={FiDollarSign} label="Next Month Salary" value={formatTaka(teacher.nextMonthSalary)} tone="border-secondary-100 bg-secondary-50/60 text-secondary-700" />
          </div>
        </div>

        {/* Paid / Unpaid bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-sm font-medium">
            <span className="text-secondary-600">Paid Students: {toBanglaDigits(stats.totalPaid)} ({paidPercent}%)</span>
            <span className="text-danger">Unpaid Students: {toBanglaDigits(stats.totalUnpaid)} ({unpaidPercent}%)</span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-red-100">
            <div className="h-full bg-secondary-500 transition-all duration-500" style={{ width: `${paidPercent}%` }} />
            <div className="h-full flex-1 bg-danger/80 transition-all duration-500" />
          </div>
        </div>
      </div>

      {/* Student List Header */}
      <div className="mb-3 mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-primary-900">Students List</h3>
          {monthLabel && <p className="text-xs text-primary-500">{monthLabel} Payment</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <form onSubmit={applySearch} className="relative sm:w-56">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            <Input
              id="student-search"
              placeholder="Search students..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value.trim() === "") setSearch("");
              }}
            />
          </form>
          <Select
            id="filter-status"
            placeholder=""
            options={PAYMENT_STATUS_FILTERS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[150px]"
          />
        </div>
      </div>

      {/* Table */}
      {students.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No students under this teacher.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 md:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Student Name</th>
                  <th className="px-4 py-3 font-medium">Monthly Fee</th>
                  <th className="px-4 py-3 font-medium">Payment Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((s, idx) => {
                  const meta = PAYMENT_STATUS_META[s.status] || { label: s.status || "—", variant: "neutral" };
                  const paid = s.status === "paid";
                  return (
                    <tr key={s._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30">
                      <td className="px-4 py-3 text-primary-400">{toBanglaDigits(idx + 1)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/admin/students/${s._id}`} className="flex items-center gap-3 hover:opacity-80">
                          <AdminAvatar src={s.photo} name={s.name} size={32} />
                          <span className="font-medium text-primary-900 hover:underline">{s.name || "—"}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-primary-700">{formatTaka(s.monthlyFee)}</td>
                      <td className="px-4 py-3"><Badge variant={meta.variant}>{meta.label}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <PaymentToggle checked={paid} loading={togglingId === s._id} disabled={!!togglingId && togglingId !== s._id} onChange={() => handleToggle(s)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleStudents.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-primary-500">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="space-y-3 md:hidden">
            {visibleStudents.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-10 text-center text-primary-500">No students found.</div>
            ) : (
              visibleStudents.map((s) => {
                const meta = PAYMENT_STATUS_META[s.status] || { label: s.status || "—", variant: "neutral" };
                const paid = s.status === "paid";
                return (
                  <div key={s._id} className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/dashboard/admin/students/${s._id}`} className="flex min-w-0 items-center gap-3">
                        <AdminAvatar src={s.photo} name={s.name} size={40} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-primary-900 hover:underline">{s.name || "—"}</p>
                          <p className="text-sm text-primary-500">{formatTaka(s.monthlyFee)}</p>
                        </div>
                      </Link>
                      <PaymentToggle checked={paid} loading={togglingId === s._id} disabled={!!togglingId && togglingId !== s._id} onChange={() => handleToggle(s)} />
                    </div>
                    <div className="mt-3"><Badge variant={meta.variant}>{meta.label}</Badge></div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Paid", value: toBanglaDigits(stats.totalPaid), icon: FiCheckCircle, tone: "border-secondary-200 bg-secondary-50 text-secondary-600" },
          { label: "Total Unpaid", value: toBanglaDigits(stats.totalUnpaid), icon: FiXCircle, tone: "border-red-200 bg-red-50 text-danger" },
          { label: "Total Collected", value: formatTaka(stats.totalCollected), icon: FiTrendingUp, tone: "border-primary-200 bg-primary-50 text-primary-600" },
          { label: "Total Due", value: formatTaka(stats.totalDue), icon: FiDollarSign, tone: "border-accent-200 bg-accent-50 text-accent-600" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`flex items-center gap-3 rounded-[var(--radius-lg)] border p-3.5 ${c.tone}`}>
              <Icon className="shrink-0 text-xl" />
              <div className="min-w-0">
                <p className="truncate text-xs opacity-80">{c.label}</p>
                <p className="text-sm font-bold">{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info tip */}
      <div className="mt-3 flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-primary-100 bg-primary-50/50 px-4 py-2.5 text-sm text-primary-600">
        <FiInfo className="shrink-0 text-primary-500" />
        Click the toggle switch to update payment status manually.
      </div>

      {/* Edit modal */}
      <TeacherFormModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        initial={
          teacher
            ? { userRef: { name: teacher.name, email: teacher.email, phone: teacher.phone }, subject: teacher.subject, ratePerStudent: teacher.ratePerStudent, photo: teacher.photo }
            : null
        }
        loading={editLoading}
      />

      {/* Delete confirm */}
      <ManagementDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Teacher"
        name={teacher?.name || "this teacher"}
        loading={deleteLoading}
      />
    </div>
  );
};

export default TeacherPaymentDetail;
