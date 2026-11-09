"use client";

import React from "react";
import { FiEye } from "react-icons/fi";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { STATUS_META, formatBanglaDate } from "./admissionConstants";

/**
 * AdmissionsTable — List of applications.
 * Desktop table, mobile card view (responsive).
 * Each row has a "Details" action -> onView(admission).
 */
const AdmissionsTable = ({ items = [], onView }) => {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
              <th className="px-4 py-3 font-medium">Student Name</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Guardian Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => {
              const meta = STATUS_META[a.status] || {
                label: a.status,
                variant: "neutral",
              };
              return (
                <tr
                  key={a._id}
                  className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30"
                >
                  <td className="px-4 py-3 font-medium text-primary-900">
                    {a.studentName}
                  </td>
                  <td className="px-4 py-3 text-primary-700">
                    {a.desiredClass || "—"}
                  </td>
                  <td className="px-4 py-3 text-primary-700">
                    {a.guardianPhone || "—"}
                  </td>
                  <td className="px-4 py-3 text-primary-700">
                    <span className="block max-w-[180px] truncate">
                      {a.email || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-primary-600">
                    {formatBanglaDate(a.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView?.(a)}
                    >
                      <FiEye className="mr-1" /> Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {items.map((a) => {
          const meta = STATUS_META[a.status] || {
            label: a.status,
            variant: "neutral",
          };
          return (
            <div
              key={a._id}
              className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-primary-900">
                    {a.studentName}
                  </p>
                  <p className="text-sm text-primary-500">
                    {a.desiredClass || "—"}
                  </p>
                </div>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>

              <div className="mt-3 space-y-1 text-sm text-primary-600">
                <p>
                  <span className="text-primary-400">Phone: </span>
                  {a.guardianPhone || "—"}
                </p>
                <p className="truncate">
                  <span className="text-primary-400">Email: </span>
                  {a.email || "—"}
                </p>
                <p>
                  <span className="text-primary-400">Date: </span>
                  {formatBanglaDate(a.createdAt)}
                </p>
              </div>

              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => onView?.(a)}>
                  <FiEye className="mr-1" /> Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AdmissionsTable;
