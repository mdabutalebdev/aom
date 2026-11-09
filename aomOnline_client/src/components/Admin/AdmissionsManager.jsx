"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiSearch, FiRefreshCw } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

import AdmissionsTable from "./AdmissionsTable";
import AdmissionDetailModal from "./AdmissionDetailModal";
import RejectReasonModal from "./RejectReasonModal";
import ApproveResultModal from "./ApproveResultModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import Toast from "./Toast";
import {
  STATUS_FILTERS,
  CLASS_FILTERS,
  toBanglaDigits,
} from "./admissionConstants";

const PAGE_LIMIT = 10;

const AdmissionsManager = () => {
  // Filter state.
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [desiredClass, setDesiredClass] = useState("");
  const [page, setPage] = useState(1);

  // Data state.
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal/Action state.
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [approveResult, setApproveResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Load list — server-side filter/pagination.
  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (desiredClass) params.set("desiredClass", desiredClass);
      params.set("page", String(page));
      params.set("limit", String(PAGE_LIMIT));

      const res = await fetch(`${API_BASE_URL}/admissions?${params.toString()}`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setItems(Array.isArray(data.data) ? data.data : []);
        setMeta(
          data.meta || {
            total: data.data?.length || 0,
            page,
            totalPages: 1,
          }
        );
      } else {
        setError(data.message || "Failed to load application list.");
        setItems([]);
      }
    } catch {
      setError("Could not connect to server.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, desiredClass, page]);

  useEffect(() => {
    // Re-fetch on filter/page change; deferred fetch, not cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdmissions();
  }, [fetchAdmissions]);

  // Search submit — apply search on page 1.
  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const showToast = (type, message) => setToast({ type, message });

  // Open detail modal.
  const openDetail = (admission) => {
    setSelected(admission);
    setDetailOpen(true);
  };

  // Approve -> PATCH /admissions/:id/approve.
  const doApprove = async (admission) => {
    setActionLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admissions/${admission._id}/approve`,
        { method: "PATCH", headers: { ...authHeaders() } }
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setDetailOpen(false);
        setSelected(null);
        // Show created account + temporary password.
        setApproveResult({
          user: data.data?.user,
          tempPassword: data.data?.tempPassword,
        });
        showToast("success", "Application approved.");
        fetchAdmissions();
      } else {
        showToast("error", data.message || "Approval failed.");
      }
    } catch {
      showToast("error", "Could not connect to server.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject confirm -> PATCH /admissions/:id/reject { reason? }.
  const doReject = async (reason) => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admissions/${rejectTarget._id}/reject`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(reason ? { reason } : {}),
        }
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setRejectTarget(null);
        setDetailOpen(false);
        setSelected(null);
        showToast("success", "Application rejected.");
        fetchAdmissions();
      } else {
        showToast("error", data.message || "Rejection failed.");
      }
    } catch {
      showToast("error", "Could not connect to server.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete confirm -> DELETE /admissions/:id.
  const doDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admissions/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setDeleteTarget(null);
        setDetailOpen(false);
        setSelected(null);
        showToast("success", "Application deleted.");
        // Go back one page if the last item on current page was deleted.
        if (items.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          fetchAdmissions();
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

  const totalPages = Math.max(1, meta.totalPages || 1);
  const currentPage = meta.page || page;

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-5 rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <form onSubmit={applySearch} className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
            <Input
              id="search"
              placeholder="Search by name, phone or email"
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>

          <Select
            id="statusFilter"
            placeholder=""
            options={STATUS_FILTERS}
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="min-w-[150px]"
          />

          <Select
            id="classFilter"
            placeholder=""
            options={CLASS_FILTERS}
            value={desiredClass}
            onChange={(e) => {
              setPage(1);
              setDesiredClass(e.target.value);
            }}
            className="min-w-[140px]"
          />

          <Button
            variant="outline"
            onClick={() => fetchAdmissions()}
            disabled={loading}
            className="justify-center"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Summary */}
      {!loading && !error && (
        <p className="mb-3 text-sm text-primary-500">
          Total {meta.total || 0} applications
        </p>
      )}

      {/* Content: Loading / Error / Empty / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => fetchAdmissions()}>
              Try again
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          No applications found.
        </div>
      ) : (
        <>
          <AdmissionsTable items={items} onView={openDetail} />

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

      {/* Detail Modal */}
      <AdmissionDetailModal
        admission={selected}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onApprove={doApprove}
        onReject={(a) => setRejectTarget(a)}
        onDelete={(a) => setDeleteTarget(a)}
        actionLoading={actionLoading}
      />

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={doReject}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        admission={deleteTarget}
        loading={actionLoading}
      />

      {/* Approve Result (Email + Temp Password) */}
      <ApproveResultModal
        isOpen={!!approveResult}
        onClose={() => setApproveResult(null)}
        result={approveResult}
      />

      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default AdmissionsManager;
