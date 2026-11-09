"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiEye } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { getCourseIcon } from "@/components/shared/courseIcons";

import AchievementFormModal from "./AchievementFormModal";
import ManagementDeleteModal from "./ManagementDeleteModal";
import ContentDetailsModal from "./ContentDetailsModal";
import Toast from "./Toast";

/**
 * AchievementsManager — Achievement list + create/edit/delete.
 * GET /achievements (public list), POST/PATCH/DELETE (admin, authHeaders).
 */
const AchievementsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/achievements`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const list = Array.isArray(data.data) ? data.data : [];
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(list);
      } else {
        setError(data.message || "Failed to load achievements.");
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
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (payload) => {
    setActionLoading(true);
    try {
      const isEdit = !!editing;
      const url = isEdit
        ? `${API_BASE_URL}/achievements/${editing._id}`
        : `${API_BASE_URL}/achievements`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        setFormOpen(false);
        setEditing(null);
        showToast("success", isEdit ? "Achievement updated." : "New achievement added.");
        fetchItems();
      } else {
        showToast("error", data.message || "Save failed.");
      }
    } catch {
      showToast("error", "Could not connect to server.");
    } finally {
      setActionLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/achievements/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        setDeleteTarget(null);
        showToast("success", "Achievement deleted.");
        fetchItems();
      } else {
        showToast("error", data.message || "Deletion failed.");
      }
    } catch {
      showToast("error", "Could not connect to server.");
    } finally {
      setActionLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {!loading && !error && (
          <p className="text-sm text-primary-500">Total {items.length} achievements</p>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => fetchItems()} disabled={loading}>
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
          <Button variant="primary" onClick={openCreate}>
            <FiPlus className="mr-1" /> New Achievement
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
            <Button variant="outline" size="sm" onClick={() => fetchItems()}>
              Try again
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No achievements found.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface shadow-soft md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                    <th className="w-10 px-4 py-3.5 font-medium">#</th>
                    <th className="w-24 px-4 py-3.5 font-medium whitespace-nowrap">
                      Certificate
                    </th>
                    <th className="px-4 py-3.5 font-medium whitespace-nowrap">Title</th>
                    <th className="px-4 py-3.5 font-medium whitespace-nowrap">
                      Description
                    </th>
                    <th className="px-4 py-3.5 text-center font-medium whitespace-nowrap">
                      Order
                    </th>
                    <th className="px-4 py-3.5 text-right font-medium whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a, i) => {
                    const Icon = getCourseIcon(a.icon);
                    return (
                      <tr
                        key={a._id}
                        className="border-b border-primary-50 transition-colors last:border-0 hover:bg-primary-50/30"
                      >
                        <td className="px-4 py-3 text-primary-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="h-12 w-16 overflow-hidden rounded-[var(--radius-md)] border border-primary-100 bg-primary-50">
                            {a.certificateImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.certificateImage}
                                alt={a.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-primary-300">
                                <Icon />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="max-w-[220px] px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                              <Icon className="text-sm" />
                            </span>
                            <p
                              className="truncate font-medium text-primary-900"
                              title={a.title}
                            >
                              {a.title}
                            </p>
                          </div>
                        </td>
                        <td className="max-w-[280px] px-4 py-3">
                          <p
                            className="truncate text-primary-600"
                            title={a.description || ""}
                          >
                            {a.description || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums text-primary-700">
                          {a.order ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setDetailsTarget(a)}
                              aria-label={`View details of ${a.title}`}
                              title="View details"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-400 transition-colors hover:bg-primary-50 hover:text-primary-700"
                            >
                              <FiEye />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(a)}
                              aria-label={`Edit ${a.title}`}
                              title="Edit"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(a)}
                              aria-label={`Delete ${a.title}`}
                              title="Delete"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-400 transition-colors hover:bg-red-50 hover:text-danger"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-primary-100 bg-primary-50/30 px-4 py-2.5 text-xs text-primary-400">
              Showing {items.length}{" "}
              {items.length === 1 ? "achievement" : "achievements"}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {items.map((a) => {
              const Icon = getCourseIcon(a.icon);
              return (
                <div
                  key={a._id}
                  className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft"
                >
                  <div className="flex gap-3">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-primary-100 bg-primary-50">
                      {a.certificateImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.certificateImage}
                          alt={a.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-primary-300">
                          <Icon />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="shrink-0 text-primary-500" />
                        <p className="truncate font-semibold text-primary-900">
                          {a.title}
                        </p>
                      </div>
                      {a.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-primary-600">
                          {a.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-primary-50 pt-3">
                    <span className="text-xs text-primary-400">
                      Order: {a.order ?? "—"}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailsTarget(a)}
                      >
                        <FiEye className="mr-1" /> View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                        <FiEdit2 className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-red-50"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <AchievementFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        loading={actionLoading}
      />

      <ManagementDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete Achievement"
        name={deleteTarget?.title || "this achievement"}
        loading={actionLoading}
      />

      <ContentDetailsModal
        isOpen={!!detailsTarget}
        onClose={() => setDetailsTarget(null)}
        title="Achievement Details"
        heading={detailsTarget?.title}
        subheading={detailsTarget?.description}
        icon={detailsTarget ? getCourseIcon(detailsTarget.icon) : null}
        image={detailsTarget?.certificateImage}
        imageAlt={detailsTarget?.title}
        imageHref={detailsTarget?.certificateImage}
        rows={[
          { label: "Title", value: detailsTarget?.title },
          { label: "Description", value: detailsTarget?.description },
          { label: "Icon", value: detailsTarget?.icon || "Default" },
          { label: "Display Order", value: detailsTarget?.order ?? "—" },
          {
            label: "Certificate",
            value: detailsTarget?.certificateImage ? "Open image" : "Not uploaded",
            href: detailsTarget?.certificateImage || undefined,
          },
        ]}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default AchievementsManager;
