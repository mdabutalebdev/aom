"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiBell, FiCheck, FiInbox } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";

// Notification type -> left border color (subtle visual cue).
const TYPE_ACCENT = {
  success: "border-l-secondary-500",
  info: "border-l-primary-500",
  warning: "border-l-accent-500",
  error: "border-l-danger",
};

// createdAt -> relative time in English (e.g., "5 mins ago").
const relativeTime = (iso) => {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} mins ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hours ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} days ago`;
  const mon = Math.floor(day / 30);
  return `${mon} months ago`;
};

/**
 * NotificationBell — Topbar notification bell.
 * Fetches list + unreadCount via GET /notifications; shows badge;
 * Dropdown shows recent notifications, per-item "read" & "mark all read" actions.
 * Usable in both admin and teacher shells (authHeaders() token).
 */
const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wrapRef = useRef(null);

  // Sound-on-new-notification: remembers the newest _id seen so far, and
  // whether a user gesture has unlocked audio playback yet (browsers block
  // audio until the user has interacted with the page at least once).
  const lastSeenIdRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    const unlock = () => {
      audioUnlockedRef.current = true;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Short two-tone "ding" via Web Audio API — no external audio asset needed.
  const playChime = () => {
    if (!audioUnlockedRef.current) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      [880, 1320].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.22);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.24);
      });
    } catch {
      // Audio isn't essential — fail silently.
    }
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/notifications?page=1&limit=8`,
        { headers: { ...authHeaders() } }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const payload = data.data || {};
        const list = Array.isArray(payload.notifications)
          ? payload.notifications
          : [];
        const newestId = list[0]?._id ?? null;
        if (
          lastSeenIdRef.current !== null &&
          newestId &&
          newestId !== lastSeenIdRef.current
        ) {
          playChime();
        }
        if (newestId) lastSeenIdRef.current = newestId;

        setItems(list);
        setUnreadCount(Number(payload.unreadCount) || 0);
      } else {
        setError(data.message || "Failed to load notifications.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once on mount (to show badge) — then refresh every 60 seconds.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close when clicking outside dropdown.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications();
  };

  const markRead = async (id) => {
    // Optimistic update.
    setItems((list) =>
      list.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { ...authHeaders() },
      });
    } catch {
      // If fails, next refresh will bring back the correct state.
    }
  };

  const markAllRead = async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { ...authHeaders() },
      });
    } catch {
      // Silent.
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        aria-expanded={open}
        title="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-primary-600 transition-colors hover:bg-primary-50"
      >
        <FiBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[var(--radius-lg)] border border-primary-100 bg-surface shadow-lift">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-primary-100 px-4 py-3">
            <p className="text-sm font-semibold text-primary-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-700">
                  {unreadCount} unread
                </span>
              )}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-800"
              >
                <FiCheck className="text-sm" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[22rem] overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-primary-400">
                Loading...
              </p>
            ) : error ? (
              <p className="px-4 py-8 text-center text-sm text-danger">{error}</p>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-primary-400">
                <FiInbox className="text-2xl" />
                <p className="text-sm">No notifications.</p>
              </div>
            ) : (
              <ul className="divide-y divide-primary-50">
                {items.map((n) => (
                  <li
                    key={n._id}
                    className={`border-l-4 px-4 py-3 transition-colors ${
                      TYPE_ACCENT[n.type] || "border-l-primary-300"
                    } ${n.read ? "bg-surface" : "bg-primary-50/40"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm ${
                            n.read
                              ? "font-medium text-primary-700"
                              : "font-semibold text-primary-900"
                          }`}
                        >
                          {n.title || "Notification"}
                        </p>
                        {n.message && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-primary-500">
                            {n.message}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-primary-400">
                          {relativeTime(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => markRead(n._id)}
                          aria-label="Mark as read"
                          title="Mark as read"
                          className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-700"
                        >
                          <FiCheck className="text-sm" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
