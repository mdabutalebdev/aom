"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FiEye, FiDownload, FiRefreshCw } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import { downloadNodeAsPdf } from "@/lib/certificatePdf";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import PaymentReceipt from "@/components/shared/PaymentReceipt";
import { formatTaka } from "@/components/Admin/managementConstants";
import { banglaMonthName } from "@/components/Admin/paymentConstants";

const statusPill = (p) => {
  if (p.status === "paid") return { label: "Confirmed", cls: "border-secondary-300 bg-secondary-50 text-secondary-700" };
  if (p.reviewedBy) return { label: "Rejected", cls: "border-danger/40 bg-red-50 text-danger" };
  return { label: "Pending", cls: "border-accent-300 bg-accent-50 text-accent-700" };
};

const receiptNo = (id) => (id ? `RCPT-${String(id).slice(-8).toUpperCase()}` : "—");

/**
 * GuardianPaymentReceipts — the guardian's payment history as a data table.
 * Each row's eye icon opens the styled PaymentReceipt (same design admin sees),
 * which can be downloaded as a PDF. A receipt becomes "Confirmed" once the
 * Super Admin approves that month's submission.
 */
const GuardianPaymentReceipts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewTarget, setViewTarget] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef(null);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/payments/my-receipts");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || "Failed to load receipts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadNodeAsPdf(receiptRef.current, `receipt-${String(viewTarget?._id || "").slice(-8)}`);
    } catch (err) {
      toast.error(err.message || "Could not generate the PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mt-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-primary-900">Payment Receipts</h2>
          <p className="text-sm text-primary-500">Your payment history — view and download each receipt.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReceipts} disabled={loading}>
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          <span className="ml-1.5">Refresh</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-14">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchReceipts}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-14 text-center text-primary-500">
          No payment receipts yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 bg-surface shadow-soft">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-primary-100 bg-primary-50/50 text-xs uppercase tracking-wider text-primary-500">
              <tr>
                <th className="px-4 py-3 font-medium">Receipt No.</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {items.map((p) => {
                const pill = statusPill(p);
                return (
                  <tr key={p._id} className="hover:bg-primary-50/30">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-primary-900">
                      {receiptNo(p._id)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-primary-700">
                      {banglaMonthName(p.month)} {p.year}
                    </td>
                    <td className="px-4 py-3 font-medium text-primary-900">{formatTaka(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium ${pill.cls}`}>
                        {pill.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {p.status === "paid" ? (
                        // Official receipt is available only after admin confirms.
                        <button
                          type="button"
                          onClick={() => setViewTarget(p)}
                          title="View receipt"
                          aria-label="View receipt"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-900"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                      ) : p.reviewedBy ? (
                        <span
                          title={p.rejectionReason || "Rejected"}
                          className="inline-block max-w-[220px] truncate align-middle text-xs font-medium text-danger"
                        >
                          ❌ Rejected{p.rejectionReason ? ` — ${p.rejectionReason}` : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-primary-400">⏳ Awaiting confirmation</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View / download modal */}
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title="Payment Receipt" size="2xl">
        {viewTarget && (
          <div className="p-1 sm:p-2">
            <div className="mb-4 flex justify-end">
              <Button
                variant="primary"
                onClick={handleDownload}
                isLoading={downloading}
                disabled={downloading}
                className="gap-2"
              >
                <FiDownload />
                {downloading ? "Preparing…" : "Download PDF"}
              </Button>
            </div>
            <PaymentReceipt ref={receiptRef} payment={viewTarget} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GuardianPaymentReceipts;
