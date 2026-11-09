"use client";

import React from "react";
import { FiDownload, FiFolder } from "react-icons/fi";

import Card from "@/components/ui/Card";
import { fileTypeMeta } from "./studentDashboardConstants";

/**
 * StudentMaterials —    ।
 *       +  + "" ।
 */
const StudentMaterials = ({ materials }) => {
  const items = Array.isArray(materials) ? materials : [];

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary-100">
          <FiDownload />
        </span>
        <h3 className="text-lg font-bold text-primary-900">
            
        </h3>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-primary-200 bg-surface-soft px-4 py-12 text-center text-primary-400">
          <FiFolder className="text-3xl text-primary-300" />
          <p className="text-sm">     ।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((m) => {
            const meta = fileTypeMeta(m.fileType);
            return (
              <div
                key={m._id}
                className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft transition-shadow hover:shadow-card"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-xl ring-1 ring-inset ${meta.tint}`}
                    aria-hidden="true"
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary-900" title={m.title}>
                      {m.title || meta.label}
                    </p>
                    {m.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-primary-400">
                        {m.description}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-primary-400">
                        {meta.label}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-200 transition-colors hover:bg-primary-100"
                >
                  <FiDownload />
                  
                </a>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default StudentMaterials;
