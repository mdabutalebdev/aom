"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiFolder,
  FiEye,
  FiExternalLink,
} from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";

import Toast from "@/components/Admin/Toast";
import ManagementDeleteModal from "@/components/Admin/ManagementDeleteModal";
import MaterialFormModal from "./MaterialFormModal";
import {
  materialTypeMeta,
  MATERIAL_TYPE_FILTERS,
  formatBanglaDateTime,
} from "./progressConstants";

const PAGE_LIMIT = 10;

// The class a material belongs to (populated classRef.name, or a flat className).
const materialClassName = (m) => m?.classRef?.name || m?.className || "";

// A tidy, short label for a link — the file name for uploads, otherwise the
// host. The full URL still lives in the href + title tooltip.
const shortLink = (url = "") => {
  try {
    const u = new URL(url);
    const last = decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() || "");
    return last || u.hostname;
  } catch {
    return (url.split("/").filter(Boolean).pop() || url).slice(0, 40);
  }
};

/**
 * ResourceCenter — the teacher's study materials: search + type/class filters +
 * pagination + create/edit/delete, with each item downloadable or linkable.
 */
const ResourceCenter = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [classes, setClasses] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/classes`, { headers: { ...authHeaders() } });
      const data = await res.json().catch(() => ({}));
      const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setClasses(list);
    } catch {
      // filters still work without the class list
    }
  }, []);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      if (classFilter) params.set("class", classFilter);
      params.set("page", String(page));
      params.set("limit", String(PAGE_LIMIT));

      const res = await fetch(`${API_BASE_URL}/materials?${params.toString()}`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const list = Array.isArray(data.data) ? data.data : [];
        setItems(list);
        setMeta(data.meta || { total: list.length, page, totalPages: 1 });
      } else {
        setError(data.message || "Failed to load resources.");
        setItems([]);
      }
    } catch {
      setError("Could not connect to the server.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, classFilter, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMaterials();
  }, [fetchMaterials]);

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSubmit = async (payload) => {
    setActionLoading(true);
    try {
      const isEdit = !!editing;
      const url = isEdit
        ? `${API_BASE_URL}/materials/${editing._id}`
        : `${API_BASE_URL}/materials`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        setFormOpen(false);
        setEditing(null);
        showToast("success", isEdit ? "Resource updated." : "New resource added.");
        fetchMaterials();
      } else {
        showToast("error", data.message || "Could not save the resource.");
      }
    } catch {
      showToast("error", "Could not connect to the server.");
    } finally {
      setActionLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/materials/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        setDeleteTarget(null);
        showToast("success", "Resource deleted.");
        if (items.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          fetchMaterials();
        }
      } else {
        showToast("error", data.message || "Deletion failed.");
      }
    } catch {
      showToast("error", "Could not connect to the server.");
    } finally {
      setActionLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setFormOpen(true);
  };

  const classFilterOptions = [
    { value: "", label: "All Classes" },
    ...classes.map((c) => ({ value: c._id, label: c.name })),
  ];

  const totalPages = Math.max(1, meta.totalPages || 1);
  const currentPage = meta.page || page;

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
          <form onSubmit={applySearch} className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
            <Input
              id="material-search"
              placeholder="Search resources"
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>

          <Select
            id="filter-type"
            placeholder=""
            options={MATERIAL_TYPE_FILTERS}
            value={typeFilter}
            onChange={(e) => {
              setPage(1);
              setTypeFilter(e.target.value);
            }}
            className="min-w-[140px]"
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

          <Button variant="outline" onClick={() => fetchMaterials()} disabled={loading} className="justify-center">
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
          <Button variant="primary" onClick={openCreate} className="justify-center">
            <FiPlus className="mr-1" /> Add Resource
          </Button>
        </div>
      </div>

      {!loading && !error && (
        <p className="mb-3 text-sm text-primary-500">{meta.total || 0} resources</p>
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
            <Button variant="outline" size="sm" onClick={() => fetchMaterials()}>
              Try again
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          <FiFolder className="text-3xl text-primary-300" />
          <p>No resources yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 md:block">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => {
                  const tm = materialTypeMeta(m.fileType);
                  const cls = materialClassName(m);
                  return (
                    <tr key={m._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-primary-900">{m.title || "—"}</p>
                        {m.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-primary-400">{m.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={tm.variant}>{tm.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-primary-700">{cls || "All classes"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-primary-500">
                        {formatBanglaDateTime(m.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setDetailsTarget(m)}>
                            <FiEye className="mr-1" /> Details
                          </Button>
                          {m.fileUrl && (
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
                            >
                              <FiDownload /> Open
                            </a>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
                            <FiEdit2 className="mr-1" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-red-50"
                            onClick={() => setDeleteTarget(m)}
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

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {items.map((m) => {
              const tm = materialTypeMeta(m.fileType);
              const cls = materialClassName(m);
              return (
                <div key={m._id} className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-primary-900">{m.title || "—"}</p>
                      {m.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-primary-400">{m.description}</p>
                      )}
                    </div>
                    <Badge variant={tm.variant}>{tm.label}</Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-primary-600">
                    <p>
                      <span className="text-primary-400">Class: </span>
                      {cls || "All classes"}
                    </p>
                    <p>
                      <span className="text-primary-400">Added: </span>
                      {formatBanglaDateTime(m.createdAt)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDetailsTarget(m)}>
                      <FiEye className="mr-1" /> Details
                    </Button>
                    {m.fileUrl && (
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-primary-500 px-3.5 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
                      >
                        <FiDownload /> Open
                      </a>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openEdit(m)}>
                      <FiEdit2 className="mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-danger/40 text-danger hover:bg-red-50"
                      onClick={() => setDeleteTarget(m)}
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
                Page {currentPage} / {totalPages}
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

      {/* Resource details */}
      <Dialog open={!!detailsTarget} onOpenChange={(open) => !open && setDetailsTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resource Details</DialogTitle>
          </DialogHeader>
          {detailsTarget && (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-primary-900">
                  {detailsTarget.title || "—"}
                </h3>
                <Badge variant={materialTypeMeta(detailsTarget.fileType).variant}>
                  {materialTypeMeta(detailsTarget.fileType).label}
                </Badge>
              </div>

              {detailsTarget.description && (
                <p className="whitespace-pre-wrap text-sm text-primary-600">
                  {detailsTarget.description}
                </p>
              )}

              <div className="space-y-2 border-t border-primary-50 pt-3 text-sm">
                <div className="flex gap-2">
                  <span className="w-24 shrink-0 text-primary-400">Class</span>
                  <span className="font-medium text-primary-800">
                    {materialClassName(detailsTarget) || "All classes"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="w-24 shrink-0 text-primary-400">Type</span>
                  <span className="font-medium text-primary-800">
                    {materialTypeMeta(detailsTarget.fileType).label}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="w-24 shrink-0 text-primary-400">Added</span>
                  <span className="font-medium text-primary-800">
                    {formatBanglaDateTime(detailsTarget.createdAt)}
                  </span>
                </div>
                {detailsTarget.fileUrl && (
                  <div className="flex min-w-0 gap-2">
                    <span className="w-24 shrink-0 text-primary-400">Link</span>
                    <a
                      href={detailsTarget.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={detailsTarget.fileUrl}
                      className="inline-flex min-w-0 items-center gap-1 font-medium text-primary-600 hover:underline"
                    >
                      <span className="max-w-[220px] truncate">{shortLink(detailsTarget.fileUrl)}</span>
                      <FiExternalLink className="shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {detailsTarget?.fileUrl && (
              <a
                href={detailsTarget.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                <FiDownload /> Open
              </a>
            )}
            <Button variant="outline" onClick={() => setDetailsTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / edit modal */}
      <MaterialFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        classes={classes}
        loading={actionLoading}
      />

      {/* Delete confirmation */}
      <ManagementDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete Resource"
        name={deleteTarget?.title || "this resource"}
        loading={actionLoading}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default ResourceCenter;
