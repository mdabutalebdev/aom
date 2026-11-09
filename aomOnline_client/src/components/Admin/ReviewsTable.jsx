"use client";

import React from "react";
import { FiEye, FiCheck, FiEdit2, FiTrash2, FiVideo } from "react-icons/fi";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { extractYouTubeId, getYouTubeThumbnail } from "@/components/shared/youtube";

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const StatusBadge = ({ status }) =>
  status === "pending" ? (
    <Badge variant="warning">Pending</Badge>
  ) : (
    <Badge variant="success">Approved</Badge>
  );

const SourceBadge = ({ source }) =>
  source === "parent" ? (
    <Badge variant="accent">Parent</Badge>
  ) : (
    <Badge variant="primary">Admin</Badge>
  );

const RowActions = ({ item, onView, onAccept, onEdit, onDelete }) => {
  const isPending = item.status === "pending";
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => onView?.(item)} title="View details">
        <FiEye />
      </Button>
      {isPending ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-secondary-700 hover:bg-secondary-50"
          onClick={() => onAccept?.(item)}
          title="Accept & publish"
        >
          <FiCheck className="mr-1" /> Accept
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => onEdit?.(item)} title="Edit">
          <FiEdit2 />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="text-danger hover:bg-red-50"
        onClick={() => onDelete?.(item)}
        title="Delete"
      >
        <FiTrash2 />
      </Button>
    </div>
  );
};

/**
 * ReviewsTable — moderation data table for parent reviews / testimonials.
 * Desktop table + mobile card view. Actions: view, accept (pending),
 * edit (approved), delete.
 */
const ReviewsTable = ({ items = [], onView, onAccept, onEdit, onDelete }) => {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 md:block">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
              <th className="px-4 py-3 font-medium">Reviewer</th>
              <th className="px-4 py-3 font-medium">Review</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => {
              const videoId = extractYouTubeId(t.youtubeUrl);
              return (
                <tr
                  key={t._id}
                  className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-900">{t.reviewerName}</p>
                    {t.location && (
                      <p className="text-xs text-primary-400">{t.location}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-primary-50 text-primary-300">
                        {videoId ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getYouTubeThumbnail(videoId)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FiVideo />
                        )}
                      </span>
                      <span className="block max-w-[260px] truncate text-primary-600">
                        {t.quoteText}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <SourceBadge source={t.source} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-primary-600">
                    {formatDate(t.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      item={t}
                      onView={onView}
                      onAccept={onAccept}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {items.map((t) => {
          const videoId = extractYouTubeId(t.youtubeUrl);
          return (
            <div
              key={t._id}
              className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <span className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-primary-50 text-primary-300">
                  {videoId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getYouTubeThumbnail(videoId)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiVideo />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-primary-900">{t.reviewerName}</p>
                  {t.location && (
                    <p className="text-xs text-primary-400">{t.location}</p>
                  )}
                </div>
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-primary-600">{t.quoteText}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SourceBadge source={t.source} />
                <StatusBadge status={t.status} />
                <span className="ml-auto text-xs text-primary-400">
                  {formatDate(t.createdAt)}
                </span>
              </div>

              <div className="mt-3 border-t border-primary-50 pt-3">
                <RowActions
                  item={t}
                  onView={onView}
                  onAccept={onAccept}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ReviewsTable;
