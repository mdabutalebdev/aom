"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiInbox, FiRefreshCw, FiCheck } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

const formatDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * TeacherMessages — data table of one-way messages guardians have sent to this
 * teacher. Shows who sent it, the title/body and date, with unread highlighting
 * and a "mark read" action. No reply (one-way by design).
 */
const TeacherMessages = () => {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/messages/teacher`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setItems(data?.data?.data || []);
        setUnread(Number(data?.data?.unreadCount) || 0);
      } else {
        setError(data.message || "Failed to load messages.");
        setItems([]);
      }
    } catch {
      setError("Could not connect to the server.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
  }, [fetchMessages]);

  const markRead = async (id) => {
    // Optimistic.
    setItems((list) => list.map((m) => (m._id === id ? { ...m, read: true } : m)));
    setUnread((c) => Math.max(0, c - 1));
    try {
      await fetch(`${API_BASE_URL}/messages/${id}/read`, {
        method: "PATCH",
        headers: { ...authHeaders() },
      });
    } catch {
      // Next refresh corrects state if this failed.
    }
  };

  const senderLabel = (m) =>
    m.studentRef?.name
      ? `${m.studentRef.name}${m.guardianRef?.name ? ` (${m.guardianRef.name})` : ""}`
      : m.guardianRef?.name || "Guardian";

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {!loading && !error && (
          <p className="text-sm text-primary-500">
            {items.length} message{items.length === 1 ? "" : "s"}
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700">
                {unread} unread
              </span>
            )}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={fetchMessages}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          <span className="ml-1.5">Refresh</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchMessages}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          <FiInbox className="text-3xl text-primary-300" />
          <p>No messages yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 bg-surface shadow-soft md:block">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr
                    key={m._id}
                    className={`border-b border-primary-50 last:border-0 ${
                      m.read ? "" : "bg-primary-50/40"
                    }`}
                  >
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-primary-900">
                        {m.studentRef?.name || "—"}
                      </p>
                      {m.guardianRef?.name && (
                        <p className="text-xs text-primary-400">{m.guardianRef.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top font-medium text-primary-800">
                      {m.title}
                    </td>
                    <td className="px-4 py-3 align-top text-primary-600">
                      <p className="max-w-md whitespace-pre-wrap">{m.body}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-primary-400">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      {m.read ? (
                        <Badge variant="neutral">Read</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markRead(m._id)}
                        >
                          <FiCheck className="mr-1" /> Mark read
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {items.map((m) => (
              <div
                key={m._id}
                className={`rounded-[var(--radius-lg)] border border-primary-100 p-4 shadow-soft ${
                  m.read ? "bg-surface" : "bg-primary-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-primary-900">{m.title}</p>
                    <p className="text-xs text-primary-400">
                      {m.studentRef?.name || "—"}
                      {m.guardianRef?.name ? ` · ${m.guardianRef.name}` : ""}
                    </p>
                  </div>
                  {m.read ? (
                    <Badge variant="neutral">Read</Badge>
                  ) : (
                    <Badge variant="warning">Unread</Badge>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-primary-600">
                  {m.body}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-primary-400">{formatDate(m.createdAt)}</span>
                  {!m.read && (
                    <Button variant="outline" size="sm" onClick={() => markRead(m._id)}>
                      <FiCheck className="mr-1" /> Mark read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherMessages;
