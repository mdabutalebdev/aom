"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

import ReviewsTable from "./ReviewsTable";
import ReviewDetailModal from "./ReviewDetailModal";
import TestimonialFormModal from "./TestimonialFormModal";
import ManagementDeleteModal from "./ManagementDeleteModal";
import Toast from "./Toast";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
];

/**
 * TestimonialsManager — parent-review moderation table.
 * Lists ALL reviews (GET /testimonials/admin). Parent submissions arrive as
 * "pending" and can be accepted (published) or deleted; admin-authored reviews
 * can be edited. Admin can also add a new review directly.
 */
const TestimonialsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials/admin`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const list = Array.isArray(data.data) ? data.data : [];
        setItems(list);
      } else {
        setError(data.message || "Failed to load reviews.");
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

  const pendingCount = useMemo(
    () => items.filter((t) => t.status === "pending").length,
    [items],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((t) => t.status === filter);
  }, [items, filter]);

  const handleSubmit = async (payload) => {
    setActionLoading(true);
    try {
      const isEdit = !!editing;
      const url = isEdit
        ? `${API_BASE_URL}/testimonials/${editing._id}`
        : `${API_BASE_URL}/testimonials`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        setFormOpen(false);
        setEditing(null);
        showToast("success", isEdit ? "Review updated." : "New review added.");
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

  const doAccept = async (item) => {
    if (!item) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/testimonials/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status: "approved" }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        setDetailTarget(null);
        showToast("success", "Review approved & published.");
        fetchItems();
      } else {
        showToast("error", data.message || "Could not approve review.");
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
      const res = await fetch(`${API_BASE_URL}/testimonials/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success)) {
        setDeleteTarget(null);
        setDetailTarget(null);
        showToast("success", "Review deleted.");
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
    setDetailTarget(null);
    setEditing(item);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {!loading && !error && (
          <div className="flex items-center gap-2 text-sm text-primary-500">
            <span>Total {items.length} reviews</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700 ring-1 ring-inset ring-accent-200">
                {pendingCount} pending
              </span>
            )}
          </div>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => fetchItems()} disabled={loading}>
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
          <Button variant="primary" onClick={openCreate}>
            <FiPlus className="mr-1" /> New Review
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      {!loading && !error && items.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? items.length
                : items.filter((t) => t.status === f.key).length;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-500 text-white shadow-soft"
                    : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>
      )}

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
          No reviews yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No {filter} reviews.
        </div>
      ) : (
        <ReviewsTable
          items={filtered}
          onView={setDetailTarget}
          onAccept={doAccept}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      )}

      <ReviewDetailModal
        isOpen={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        review={detailTarget}
        onAccept={doAccept}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <TestimonialFormModal
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
        title="Delete Review"
        name={deleteTarget?.reviewerName || "this review"}
        loading={actionLoading}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default TestimonialsManager;
