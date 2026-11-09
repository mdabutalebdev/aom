"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FiSearch,
  FiPlus,
  FiUsers,
  FiUser,
  FiDollarSign,
  FiArrowRight,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Skeleton from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

import AdminAvatar from "./AdminAvatar";
import TeacherFormModal from "./TeacherFormModal";
import ManagementDeleteModal from "./ManagementDeleteModal";
import { formatTaka, toBanglaDigits } from "./managementConstants";

const PAGE_LIMIT = 10;

const SUMMARY_CARDS = [
  { key: "totalTeachers", label: "Total Teachers", icon: FiUsers, tone: "bg-primary-50 text-primary-600" },
  { key: "totalStudents", label: "Total Students", icon: FiUser, tone: "bg-secondary-50 text-secondary-600" },
  { key: "totalSalaryNextMonth", label: "Total Salary (Next Month)", icon: FiDollarSign, tone: "bg-accent-50 text-accent-600", money: true },
];

/**
 * TeachersManager — Teachers List: summary cards + searchable teacher cards
 * (photo, ID, next month salary, student count) each linking to a full
 * profile (student roster + payment status). Create/edit/delete stay here.
 */
const TeachersManager = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [summary, setSummary] = useState({ totalTeachers: 0, totalStudents: 0, totalSalaryNextMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", String(PAGE_LIMIT));

      const [listRes, overviewRes] = await Promise.all([
        apiClient.get(`/teachers?${params.toString()}`),
        apiClient.get("/payments/overview?limit=1"),
      ]);

      const list = Array.isArray(listRes.data) ? listRes.data : [];
      setItems(list);
      setMeta(listRes.meta || { total: list.length, page, totalPages: 1 });
      setSummary(
        overviewRes.data?.summary || {
          totalTeachers: 0,
          totalStudents: 0,
          totalSalaryNextMonth: 0,
        },
      );
    } catch (err) {
      setError(err.message || "Failed to load teacher list.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeachers();
  }, [fetchTeachers]);

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSubmit = async (payload) => {
    setActionLoading(true);
    try {
      const isEdit = !!editing;
      if (isEdit) {
        await apiClient.patch(`/teachers/${editing._id}`, payload);
      } else {
        await apiClient.post("/teachers", payload);
      }
      setFormOpen(false);
      setEditing(null);
      toast.success(isEdit ? "Teacher updated." : "New teacher added.");
      fetchTeachers();
    } catch (err) {
      toast.error(err.message || "Save failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/teachers/${deleteTarget._id}`);
      setDeleteTarget(null);
      toast.success("Teacher deleted.");
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchTeachers();
      }
    } catch (err) {
      toast.error(err.message || "Deletion failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const totalPages = Math.max(1, meta.totalPages || 1);
  const currentPage = meta.page || page;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {SUMMARY_CARDS.map((c) => {
          const Icon = c.icon;
          const raw = summary[c.key] ?? 0;
          return (
            <Card key={c.key} size="sm" className="shadow-none">
              <CardContent className="flex items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${c.tone}`}>
                  <Icon />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{c.label}</p>
                  {loading ? (
                    <Skeleton className="mt-1 h-5 w-16" />
                  ) : (
                    <p className="truncate text-lg font-bold text-foreground">
                      {c.money ? formatTaka(raw) : toBanglaDigits(raw)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-foreground">Teachers List</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <form onSubmit={applySearch} className="relative sm:w-60">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="teacher-search"
              placeholder="Search teachers..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
          <Button variant="primary" size="sm" onClick={openCreate} className="justify-center whitespace-nowrap">
            <FiPlus className="mr-1" /> New Teacher
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => fetchTeachers()}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No teachers found.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((t) => (
              <Card key={t._id} size="sm" className="shadow-none transition-colors hover:bg-primary-50/20">
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <AdminAvatar src={t.userRef?.photo || t.photo} name={t.userRef?.name} size={44} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {t.userRef?.name || "—"}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FiUser className="text-primary-400" />
                          {t.teacherId || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiUsers className="text-primary-400" />
                          {toBanglaDigits(t.studentCount ?? 0)} students
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] text-muted-foreground">Next Month Salary</p>
                      <p className="text-sm font-bold text-secondary-600">
                        {formatTaka(t.nextMonthSalary)}
                      </p>
                    </div>
                    <Link href={`/dashboard/admin/teachers/${t._id}`}>
                      <Button variant="primary" size="sm" className="whitespace-nowrap">
                        Details <FiArrowRight className="ml-1" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary-50 hover:text-primary-700"
                          aria-label="More actions"
                        >
                          <FiMoreVertical />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(t); setFormOpen(true); }}>
                          <FiEdit2 /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(t)}>
                          <FiTrash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Showing {toBanglaDigits(items.length)} out of {toBanglaDigits(meta.total || 0)} teachers
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
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
          </div>
        </>
      )}

      {/* Form Modal */}
      <TeacherFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        loading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ManagementDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete Teacher"
        name={deleteTarget?.userRef?.name || "this teacher"}
        loading={actionLoading}
      />
    </div>
  );
};

export default TeachersManager;
