"use client";

import React from "react";

import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { hhmmTo12h, convertPreferredTime } from "@/lib/timezone";
import { STATUS_META, formatBanglaDate } from "./admissionConstants";

// The applicant's preferred class time shown in their own timezone AND
// converted to Bangladesh time, so the admin can schedule the teacher's slot.
const formatClassTime = (admission) => {
  if (!admission.classTime) return "—";
  const local = hhmmTo12h(admission.classTime);
  const tz = admission.guardianTimezone;
  if (!tz) return local;
  const conv = convertPreferredTime(admission.classTime, tz);
  if (!conv) return `${local} (${tz})`;
  const delta =
    conv.dayDelta === 1 ? " next day" : conv.dayDelta === -1 ? " prev day" : "";
  return `${local} (${tz})  =  ${conv.time} Dhaka${delta}`;
};

// Data row helper.
const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-primary-400">
      {label}
    </p>
    <p className="mt-0.5 break-words text-sm text-primary-800">
      {value || "—"}
    </p>
  </div>
);

/**
 * AdmissionDetailModal — Shows complete details + photo of an application.
 * Footer has Approve / Reject / Delete actions.
 */
const AdmissionDetailModal = ({
  admission,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
  actionLoading = false,
}) => {
  if (!admission) return null;

  const statusMeta = STATUS_META[admission.status] || {
    label: admission.status,
    variant: "neutral",
  };

  const footer = (
    <>
      {admission.status === "pending" && (
        <>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onReject?.(admission)}
            disabled={actionLoading}
          >
            Reject
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onApprove?.(admission)}
            disabled={actionLoading}
            isLoading={actionLoading}
          >
            Approve
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete?.(admission)}
        disabled={actionLoading}
      >
        Delete
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Details"
      size="xl"
      footer={footer}
    >
      <div className="space-y-5">
        {/* Top: Name, Status, Photo */}
        <div className="flex items-start gap-4">
          {admission.photo ? (
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-primary-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={admission.photo}
                alt={admission.studentName}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary-50 text-2xl font-semibold text-primary-400">
              {admission.studentName?.[0] || "?"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-primary-900">
                {admission.studentName}
              </h3>
              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-primary-500">
              Desired Class: {admission.desiredClass || "—"}
            </p>
            <p className="text-sm text-primary-500">
              Application Date: {formatBanglaDate(admission.createdAt)}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-4 rounded-[var(--radius-lg)] border border-primary-100 bg-primary-50/30 p-4 sm:grid-cols-2">
          <Field label="Guardian Name" value={admission.guardianName} />
          <Field label="Guardian Phone" value={admission.guardianPhone} />
          <Field label="Guardian's Profession" value={admission.guardianProfession} />
          <Field label="Preferred Class Time" value={formatClassTime(admission)} />
          <Field label="Email" value={admission.email} />
          <Field
            label="Date of Birth"
            value={admission.dateOfBirth ? formatBanglaDate(admission.dateOfBirth) : "—"}
          />
          <Field
            label="Preferred Teacher"
            value={
              { male: "Male Teacher", female: "Female Teacher" }[
                admission.preferredTeacherGender
              ] || "—"
            }
          />
          <Field
            label="Preferred Language"
            value={
              { bengali: "Bengali", english: "English", both: "Bengali & English" }[
                admission.preferredTeachingLanguage
              ] || "—"
            }
          />
          <div className="sm:col-span-2">
            <Field label="Address" value={admission.address} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Previous Education" value={admission.previousEducation} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Note" value={admission.note} />
          </div>
          {admission.status === "rejected" && admission.rejectionReason && (
            <div className="sm:col-span-2">
              <Field
                label="Rejection Reason"
                value={admission.rejectionReason}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AdmissionDetailModal;
