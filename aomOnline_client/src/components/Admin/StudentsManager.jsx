"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

import ManagementDeleteModal from "./ManagementDeleteModal";
import Toast from "./Toast";
import {
  formatTaka,
  toBanglaDigits,
  STUDENT_STATUS_META,
  STUDENT_STATUS_FILTERS,
} from "./managementConstants";

const PAGE_LIMIT = 10;

/**
 * StudentsManager — Student list + search + filters (teacher/class/status) +
 * pagination + create/edit/delete.
 */
const StudentsManager = ({ type }) => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // select/filter source.
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  // Load classes and teachers (filter + form select) once.
  const fetchRefs = useCallback(async () => {
    try {
      const [clsRes, tchRes] = await Promise.all([
        fetch(`${API_BASE_URL}/classes`, { headers: { ...authHeaders() } }),
        fetch(`${API_BASE_URL}/teachers?limit=100`, {
          headers: { ...authHeaders() },
        }),
      ]);
      const clsData = await clsRes.json().catch(() => ({}));
      const tchData = await tchRes.json().catch(() => ({}));

      const clsList = Array.isArray(clsData)
        ? clsData
        : Array.isArray(clsData.data)
        ? clsData.data
        : [];
      clsList.sort((a, b) => (a.order || 0) - (b.order || 0));
      setClasses(clsList);
      setTeachers(Array.isArray(tchData.data) ? tchData.data : []);
    } catch {
      // Silent ignore - list will still work even if filter source load fails.
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (teacherFilter) params.set("teacher", teacherFilter);
      if (classFilter) params.set("class", classFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (type) params.set("type", type);
      params.set("page", String(page));
      params.set("limit", String(PAGE_LIMIT));

      const res = await fetch(`${API_BASE_URL}/students?${params.toString()}`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const list = Array.isArray(data.data) ? data.data : [];
        setItems(list);
        setMeta(data.meta || { total: list.length, page, totalPages: 1 });
      } else {
        setError(data.message || "Failed to load student list.");
        setItems([]);
      }
    } catch {
      setError("Could not connect to server.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, teacherFilter, classFilter, statusFilter, page, type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRefs();
  }, [fetchRefs]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/students/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        setDeleteTarget(null);
        showToast("success", "Student deleted.");
        if (items.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          fetchStudents();
        }
      } else {
        showToast("error", data.message || "Deletion failed.");
      }
    } catch {
      showToast("error", "Could not connect to server.");
    } finally {
      setActionLoading(false);
    }
  };

  const classFilterOptions = [
    { value: "", label: "All Classes" },
    ...classes.map((c) => ({ value: c._id, label: c.nameEn || c.name })),
  ];
  const teacherFilterOptions = [
    { value: "", label: "All Teachers" },
    ...teachers.map((t) => ({
      value: t._id,
      label: t.userRef?.name || t.teacherId || "—",
    })),
  ];

  const totalPages = Math.max(1, meta.totalPages || 1);
  const currentPage = meta.page || page;

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-4 rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-3.5">
        <div className="grid gap-2.5 lg:grid-cols-[1fr_auto_auto_auto_auto_auto]">
          <form onSubmit={applySearch} className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
            <Input
              id="student-search"
              placeholder="Search by name or ID"
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>

          <Select
            id="filter-teacher"
            placeholder=""
            options={teacherFilterOptions}
            value={teacherFilter}
            onChange={(e) => {
              setPage(1);
              setTeacherFilter(e.target.value);
            }}
            className="min-w-[150px]"
          />
          <Select
            id="filter-class"
            placeholder=""
            options={classFilterOptions}
            value={classFilter}
            onChange={(e) => {
              setPage(1);
              setClassFilter(e.target.value);
            }}
            className="min-w-[140px]"
          />
          <Select
            id="filter-status"
            placeholder=""
            options={STUDENT_STATUS_FILTERS}
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="min-w-[140px]"
          />

          <Button
            variant="outline"
            onClick={() => fetchStudents()}
            disabled={loading}
            className="justify-center"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
          <Link href="/dashboard/admin/students/new" className="inline-flex">
            <Button variant="primary" className="w-full justify-center">
              <FiPlus className="mr-1" /> New Student
            </Button>
          </Link>
        </div>
      </div>

      {!loading && !error && (
        <p className="mb-2.5 text-xs text-primary-500">
          Total {toBanglaDigits(meta.total || 0)} students
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => fetchStudents()}>
              Try again
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No students found.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 md:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Teacher</th>
                  <th className="px-4 py-3 font-medium">Monthly Fee</th>
                  <th className="px-4 py-3 font-medium">Guardian</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => {
                  const sm = STUDENT_STATUS_META[s.status] || {
                    label: s.status || "—",
                    variant: "neutral",
                  };
                  return (
                    <tr
                      key={s._id}
                      className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-primary-700">
                        {s.studentId || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-primary-900">
                        <Link
                          href={`/dashboard/admin/students/${s._id}`}
                          className="hover:underline"
                        >
                          {s.name || "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-primary-700">
                        {s.classRef?.nameEn || s.classRef?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-primary-700">
                        {s.teacherRef?.userRef?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-primary-700">
                        {formatTaka(s.monthlyFee)}
                      </td>
                      <td className="px-4 py-3 text-primary-700">
                        {s.guardianName || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={sm.variant}>{sm.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/dashboard/admin/students/${s._id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <FiEdit2 className="mr-1" /> Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-red-50"
                            onClick={() => setDeleteTarget(s)}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {items.map((s) => {
              const sm = STUDENT_STATUS_META[s.status] || {
                label: s.status || "—",
                variant: "neutral",
              };
              return (
                <div
                  key={s._id}
                  className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/dashboard/admin/students/${s._id}`} className="min-w-0">
                      <p className="font-semibold text-primary-900 hover:underline">
                        {s.name || "—"}
                      </p>
                      <p className="text-xs text-primary-400">
                        {s.studentId || "—"}
                      </p>
                    </Link>
                    <Badge variant={sm.variant}>{sm.label}</Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-primary-600">
                    <p>
                      <span className="text-primary-400">Class: </span>
                      {s.classRef?.nameEn || s.classRef?.name || "—"}
                    </p>
                    <p>
                      <span className="text-primary-400">Teacher: </span>
                      {s.teacherRef?.userRef?.name || "—"}
                    </p>
                    <p>
                      <span className="text-primary-400">Monthly Fee: </span>
                      {formatTaka(s.monthlyFee)}
                    </p>
                    <p>
                      <span className="text-primary-400">Guardian: </span>
                      {s.guardianName || "—"}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Link href={`/dashboard/admin/students/${s._id}/edit`}>
                      <Button variant="outline" size="sm">
                        <FiEdit2 className="mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-danger/40 text-danger hover:bg-red-50"
                      onClick={() => setDeleteTarget(s)}
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-primary-600">
                Page {toBanglaDigits(currentPage)} / {toBanglaDigits(totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <ManagementDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete Student"
        name={deleteTarget?.name || "this student"}
        loading={actionLoading}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default StudentsManager;
