"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { getCourseIcon } from "@/components/shared/courseIcons";

import ManagementDeleteModal from "./ManagementDeleteModal";
import Toast from "./Toast";
import { formatTaka, toBanglaDigits } from "./managementConstants";

/**
 * ClassesManager — Class list + create/edit/delete.
 * GET /classes (public list), POST/PATCH/DELETE (admin, authHeaders).
 */
const ClassesManager = () => {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  // Load list.
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/classes`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];
        // Sort by order.
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(list);
      } else {
        setError(data.message || "Failed to load class list.");
        setItems([]);
      }
    } catch {
      setError("Could not connect to server.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClasses();
  }, [fetchClasses]);

  // Delete.
  const doDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/classes/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        setDeleteTarget(null);
        showToast("success", "Class deleted.");
        fetchClasses();
      } else {
        showToast("error", data.message || "Deletion failed.");
      }
    } catch {
      showToast("error", "Could not connect to server.");
    } finally {
      setActionLoading(false);
    }
  };

  const openCreate = () => router.push("/dashboard/admin/classes/new");

  const openEdit = (cls) =>
    router.push(`/dashboard/admin/classes/${cls._id}`);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {!loading && !error && (
          <p className="text-sm text-primary-500">
            Total {items.length} classes
          </p>
        )}
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchClasses()}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
          <Button variant="primary" onClick={openCreate}>
            <FiPlus className="mr-1" /> New Class
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
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => fetchClasses()}>
              Try again
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No classes found.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 md:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Monthly Fee</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => {
                  const ClassIcon = getCourseIcon(c.icon);
                  return (
                  <tr
                    key={c._id}
                    className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                          <ClassIcon className="text-sm" />
                        </span>
                        <div>
                          <p className="font-medium text-primary-900">{c.name}</p>
                          {c.nameEn && (
                            <p className="text-xs text-primary-400">{c.nameEn}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-primary-700">
                      {formatTaka(c.monthlyFee)}
                    </td>
                    <td className="px-4 py-3 text-primary-700">
                      {c.order ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {c.isActive === false ? (
                        <Badge variant="neutral">Inactive</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(c)}
                        >
                          <FiEdit2 className="mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-red-50"
                          onClick={() => setDeleteTarget(c)}
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
            {items.map((c) => {
              const ClassIcon = getCourseIcon(c.icon);
              return (
              <div
                key={c._id}
                className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <ClassIcon className="text-sm" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-primary-900">{c.name}</p>
                      {c.nameEn && (
                        <p className="text-sm text-primary-400">{c.nameEn}</p>
                      )}
                    </div>
                  </div>
                  {c.isActive === false ? (
                    <Badge variant="neutral">Inactive</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>
                <div className="mt-3 space-y-1 text-sm text-primary-600">
                  <p>
                    <span className="text-primary-400">Monthly Fee: </span>
                    {formatTaka(c.monthlyFee)}
                  </p>
                  <p>
                    <span className="text-primary-400">Order: </span>
                    {c.order ?? "—"}
                  </p>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                    <FiEdit2 className="mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-danger/40 text-danger hover:bg-red-50"
                    onClick={() => setDeleteTarget(c)}
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      <ManagementDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete Class"
        name={deleteTarget?.name || "this class"}
        loading={actionLoading}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default ClassesManager;
