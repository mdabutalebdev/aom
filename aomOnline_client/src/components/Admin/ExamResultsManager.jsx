"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiEye,
  FiImage,
  FiDownload,
} from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import { downloadNodeAsPdf, downloadNodeAsImage } from "@/lib/certificatePdf";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import ResultSheet from "@/components/shared/ResultSheet";

import ExamResultFormModal from "./ExamResultFormModal";
import ManagementDeleteModal from "./ManagementDeleteModal";
import Toast from "./Toast";

const fileSafe = (s) =>
  String(s || "result").trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "").toLowerCase();

/**
 * ExamResultsManager — list exam result sheets + create/edit/delete, with a
 * preview modal that downloads the sheet as a PNG or PDF (same design as print).
 */
const ExamResultsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState(null);

  const sheetRef = useRef(null);

  const showToast = (type, message) => setToast({ type, message });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/exam-results");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || "Failed to load result sheets.");
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
      if (editing) {
        await apiClient.patch(`/exam-results/${editing._id}`, payload);
        showToast("success", "Result sheet updated.");
      } else {
        await apiClient.post("/exam-results", payload);
        showToast("success", "Result sheet created.");
      }
      setFormOpen(false);
      setEditing(null);
      fetchItems();
    } catch (err) {
      showToast("error", err.message || "Save failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/exam-results/${deleteTarget._id}`);
      setDeleteTarget(null);
      showToast("success", "Result sheet deleted.");
      fetchItems();
    } catch (err) {
      showToast("error", err.message || "Deletion failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const download = async (kind) => {
    if (!sheetRef.current) return;
    setDownloading(true);
    try {
      const name = fileSafe(`${previewTarget?.level}-result`);
      if (kind === "image") await downloadNodeAsImage(sheetRef.current, name);
      else await downloadNodeAsPdf(sheetRef.current, name);
    } catch (err) {
      showToast("error", err.message || "Could not generate the file.");
    } finally {
      setDownloading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {!loading && !error && (
          <p className="text-sm text-primary-500">Total {items.length} result sheets</p>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => fetchItems()} disabled={loading}>
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="ml-1.5">Refresh</span>
          </Button>
          <Button variant="primary" onClick={openCreate}>
            <FiPlus className="mr-1" /> New Result
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
          No result sheets yet. Click <span className="font-semibold">New Result</span> to create one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="w-10 px-4 py-3.5 font-medium">#</th>
                  <th className="px-4 py-3.5 font-medium">Level</th>
                  <th className="px-4 py-3.5 font-medium">Title</th>
                  <th className="px-4 py-3.5 font-medium">Columns</th>
                  <th className="px-4 py-3.5 text-center font-medium">Students</th>
                  <th className="px-4 py-3.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={item._id}
                    className="border-b border-primary-50 transition-colors last:border-0 hover:bg-primary-50/30"
                  >
                    <td className="px-4 py-3 text-primary-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                        {item.level}
                      </span>
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="truncate font-medium text-primary-900" title={item.title}>
                        {item.title}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-primary-600">
                      {item.subject1Label} · {item.subject2Label}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-primary-700">
                      {item.rows?.length ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewTarget(item)}
                          title="Preview & download"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(item);
                            setFormOpen(true);
                          }}
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-400 transition-colors hover:bg-red-50 hover:text-danger"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ExamResultFormModal
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
        title="Delete Result Sheet"
        name={deleteTarget ? `${deleteTarget.level} — ${deleteTarget.title}` : "this result"}
        loading={actionLoading}
      />

      {/* Preview + download */}
      <Modal
        isOpen={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
        title={previewTarget ? `${previewTarget.level} — Preview` : "Preview"}
        size="2xl"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => download("image")}
              disabled={downloading}
            >
              <FiImage className="mr-1" /> PNG
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => download("pdf")}
              isLoading={downloading}
              disabled={downloading}
            >
              <FiDownload className="mr-1" /> {downloading ? "Preparing…" : "PDF"}
            </Button>
          </>
        }
      >
        <div className="overflow-x-auto">
          {previewTarget && <ResultSheet ref={sheetRef} result={previewTarget} />}
        </div>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default ExamResultsManager;
