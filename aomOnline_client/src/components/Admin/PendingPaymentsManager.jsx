"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FiEye, FiAlertTriangle, FiDownload, FiImage } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import { downloadNodeAsPdf } from "@/lib/certificatePdf";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import PaymentReceipt from "@/components/shared/PaymentReceipt";
import { Textarea } from "@/components/shadcn/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shadcn/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import AdminAvatar from "@/components/Admin/AdminAvatar";
import { formatTaka } from "./managementConstants";
import { banglaMonthName } from "./paymentConstants";

// status -> { label, tone classes }. Three states, three distinct colors:
// Pending = orange, Complete = green, Rejected = red. "Rejected" is told
// apart from "Pending" via reviewedBy being set (both approve AND reject set
// it) — NOT rejectionReason, which is optional and may be blank.
const STATUS_TONES = {
  Pending: "border-accent-300 bg-accent-50 text-accent-700",
  Complete: "border-secondary-300 bg-secondary-50 text-secondary-700",
  Rejected: "border-danger/40 bg-red-50 text-danger",
};

const statusMeta = (p) => {
  if (p.status === "paid") return { label: "Complete", badgeVariant: "success" };
  if (p.reviewedBy) return { label: "Rejected", badgeVariant: "danger" };
  return { label: "Pending", badgeVariant: "warning" };
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

// A single labelled fact in the admin review card. Rendered only when it has a
// value, so the card stays tidy no matter which method the guardian used.
const DetailRow = ({ label, value }) =>
  value ? (
    <div className="flex gap-2 text-sm">
      <span className="w-40 shrink-0 text-primary-400">{label}</span>
      <span className="font-medium text-primary-800">{value}</span>
    </div>
  ) : null;

/**
 * PendingPaymentsManager — every guardian-submitted payment, newest first.
 * Rows never disappear — a claim stays listed after being resolved. Status
 * itself IS the action control: while Pending, it's a colored dropdown
 * (choose Complete or Reject); once resolved it's a locked colored pill.
 * The eye icon opens a read-only details view for that payment.
 */
const PendingPaymentsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [zoomImage, setZoomImage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef(null);

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    try {
      await downloadNodeAsPdf(receiptRef.current, `receipt-${String(detailsTarget?._id || "").slice(-8)}`);
    } catch (err) {
      toast.error(err.message || "Could not generate the PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/payments/pending");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments();
  }, [fetchPayments]);

  const markComplete = async (payment) => {
    setBusyId(payment._id);
    try {
      await apiClient.patch(`/payments/${payment._id}/approve`);
      toast.success(`${payment.studentRef?.name || "Student"}'s payment marked complete.`);
      setItems((prev) =>
        prev.map((p) => (p._id === payment._id ? { ...p, status: "paid" } : p)),
      );
    } catch (err) {
      toast.error(err.message || "Could not update this payment.");
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget._id);
    try {
      await apiClient.patch(`/payments/${rejectTarget._id}/reject`, {
        reason: reason.trim() || undefined,
      });
      toast.success("Payment rejected.");
      setItems((prev) =>
        prev.map((p) =>
          p._id === rejectTarget._id
            ? { ...p, status: "unpaid", reviewedBy: true, rejectionReason: reason.trim() || undefined }
            : p,
        ),
      );
      setRejectTarget(null);
      setReason("");
    } catch (err) {
      toast.error(err.message || "Could not reject this payment.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAction = (payment, action) => {
    if (action === "complete") markComplete(payment);
    else if (action === "reject") {
      setRejectTarget(payment);
      setReason("");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchPayments}>
          Retry
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
        No guardian payments have been submitted yet.
      </div>
    );
  }

  // Once a claim is resolved (Complete/Rejected), it's a plain static pill —
  // no Select component at all, so there is no dropdown left to open.
  const StatusCell = ({ payment }) => {
    const meta = statusMeta(payment);

    if (meta.label !== "Pending") {
      return (
        <span
          className={`inline-flex h-8 w-32 items-center justify-center rounded-full border text-sm font-medium ${STATUS_TONES[meta.label]}`}
        >
          {meta.label}
        </span>
      );
    }

    return (
      <Select value="" onValueChange={(action) => handleAction(payment, action)} disabled={busyId === payment._id}>
        <SelectTrigger
          size="sm"
          className={`h-8 w-32 rounded-full border font-medium ${STATUS_TONES.Pending}`}
        >
          <SelectValue placeholder={busyId === payment._id ? "Working…" : "Pending"} />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="complete">Complete</SelectItem>
          <SelectItem value="reject" className="text-destructive">
            Reject
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const ViewButton = ({ payment }) => (
    <button
      type="button"
      onClick={() => setDetailsTarget(payment)}
      aria-label="View payment details"
      title="View details"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-700"
    >
      <FiEye />
    </button>
  );

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 md:block">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Teacher</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <AdminAvatar src={p.studentRef?.photo} name={p.studentRef?.name} size={32} />
                    <div>
                      <p className="font-medium text-primary-900">{p.studentRef?.name || "Unknown student"}</p>
                      <p className="text-xs text-primary-400">{p.studentRef?.studentId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-primary-700">
                  {p.teacherRef?.userRef?.name || p.teacherRef?.teacherId || "—"}
                </td>
                <td className="px-4 py-3 text-primary-700">
                  {banglaMonthName(p.month)} {p.year}
                </td>
                <td className="px-4 py-3 font-medium text-primary-900">{formatTaka(p.amount)}</td>
                <td className="px-4 py-3">
                  <StatusCell payment={p} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <ViewButton payment={p} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {items.map((p) => (
          <div key={p._id} className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <AdminAvatar src={p.studentRef?.photo} name={p.studentRef?.name} size={36} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary-900">{p.studentRef?.name || "Unknown student"}</p>
                  <p className="text-xs text-primary-400">{p.studentRef?.studentId}</p>
                </div>
              </div>
              <ViewButton payment={p} />
            </div>
            <div className="mt-3 space-y-1 text-sm text-primary-600">
              <p><span className="text-primary-400">Teacher: </span>{p.teacherRef?.userRef?.name || "—"}</p>
              <p><span className="text-primary-400">Period: </span>{banglaMonthName(p.month)} {p.year}</p>
              <p><span className="text-primary-400">Amount: </span>{formatTaka(p.amount)}</p>
            </div>
            <div className="mt-3">
              <StatusCell payment={p} />
            </div>
          </div>
        ))}
      </div>

      {/* Reject reason dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-danger">
                <FiAlertTriangle className="text-lg" />
              </span>
              <div>
                <DialogTitle>Reject this payment?</DialogTitle>
                <p className="mt-0.5 text-sm text-primary-500">
                  {rejectTarget?.studentRef?.name} — the guardian will see this reason.
                </p>
              </div>
            </div>
          </DialogHeader>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-800">
              Reason <span className="font-normal text-primary-400">(optional)</span>
            </label>
            <Textarea
              placeholder="e.g. Transaction ID doesn't match any received payment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={busyId === rejectTarget?._id}
              onClick={confirmReject}
            >
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt dialog — same styled PaymentReceipt the guardian sees */}
      <Dialog open={!!detailsTarget} onOpenChange={(open) => !open && setDetailsTarget(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {detailsTarget && (
            <div>
              <div className="mb-3 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadReceipt}
                  isLoading={downloading}
                  disabled={downloading}
                  className="gap-2"
                >
                  <FiDownload />
                  {downloading ? "Preparing…" : "Download PDF"}
                </Button>
              </div>
              <div className="max-h-[70vh] space-y-4 overflow-y-auto">
                {/* Admin review card — every detail the guardian submitted,
                    clearly listed, plus the payment screenshot to verify. */}
                <div className="rounded-[var(--radius-lg)] border border-primary-100 bg-primary-50/30 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-primary-900">
                    Submitted Details
                  </h4>
                  <div className="space-y-1.5">
                    <DetailRow label="Payment Method" value={detailsTarget.paymentMethod} />
                    <DetailRow
                      label="Payment Type"
                      value={
                        detailsTarget.feeType === "Other" && detailsTarget.feeNote
                          ? `Other — ${detailsTarget.feeNote}`
                          : detailsTarget.feeType
                      }
                    />
                    <DetailRow label="Sender Number" value={detailsTarget.senderInfo} />
                    <DetailRow label="Transaction ID" value={detailsTarget.transactionId} />
                    <DetailRow label="Bank A/C Number" value={detailsTarget.bankAccountNumber} />
                    <DetailRow label="Account Holder" value={detailsTarget.bankAccountHolder} />
                    <DetailRow label="Bank Info" value={detailsTarget.bankInfo} />
                    <DetailRow
                      label="Submitted At"
                      value={formatDateTime(detailsTarget.submittedAt)}
                    />
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-primary-900">
                      Payment Screenshot
                    </p>
                    {detailsTarget.screenshotUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={detailsTarget.screenshotUrl}
                        alt="Payment screenshot"
                        onClick={() => setZoomImage(detailsTarget.screenshotUrl)}
                        className="max-h-64 cursor-zoom-in rounded-[var(--radius-lg)] border border-primary-100 object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-primary-200 bg-surface px-4 py-6 text-sm text-primary-400">
                        <FiImage /> No screenshot was provided.
                      </div>
                    )}
                  </div>
                </div>

                <PaymentReceipt ref={receiptRef} payment={detailsTarget} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Screenshot lightbox — click the review image to see it full size */}
      <Dialog open={!!zoomImage} onOpenChange={(open) => !open && setZoomImage("")}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {zoomImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={zoomImage}
              alt="Payment screenshot full size"
              className="max-h-[75vh] w-full rounded-[var(--radius-lg)] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingPaymentsManager;
