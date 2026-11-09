"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FiSend, FiSearch, FiUsers, FiUser } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Textarea } from "@/components/shadcn/textarea";
import { Checkbox } from "@/components/shadcn/checkbox";

/**
 * NotificationBroadcast — Super Admin composes a notification and sends it
 * to every guardian, or to a hand-picked subset. Delivered in-app immediately
 * (guardians see it with a sound cue); email/WhatsApp are best-effort side
 * channels (server-side stub until real credentials are configured).
 */
const NotificationBroadcast = () => {
  const [mode, setMode] = useState("all"); // "all" | "select"
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [search, setSearch] = useState("");
  const [guardians, setGuardians] = useState([]);
  const [loadingGuardians, setLoadingGuardians] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const fetchGuardians = useCallback(async (q) => {
    setLoadingGuardians(true);
    try {
      const params = new URLSearchParams({ role: "parent", limit: "50" });
      if (q) params.set("search", q);
      const res = await apiClient.get(`/user?${params.toString()}`);
      setGuardians(Array.isArray(res.data) ? res.data : []);
    } catch {
      setGuardians([]);
    } finally {
      setLoadingGuardians(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "select") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGuardians(search);
  }, [mode, search, fetchGuardians]);

  const toggleSelected = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both a title and a message.");
      return;
    }
    if (mode === "select" && selected.size === 0) {
      toast.error("Select at least one guardian, or switch to \"All Guardians\".");
      return;
    }

    setSending(true);
    try {
      const res = await apiClient.post("/notifications/broadcast", {
        recipientIds: mode === "all" ? "all" : Array.from(selected),
        title: title.trim(),
        message: message.trim(),
      });
      toast.success(
        `Sent to ${res.data?.recipientCount ?? 0} guardian(s).`,
      );
      setTitle("");
      setMessage("");
      setSelected(new Set());
    } catch (err) {
      toast.error(err.message || "Could not send the notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Compose */}
      <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-6 shadow-soft">
        <h3 className="text-base font-semibold text-primary-900">Compose Notification</h3>
        <div className="mt-4 space-y-4">
          <Input
            id="broadcast-title"
            label="Title"
            placeholder="e.g. Eid Holiday Notice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary-800">Message</label>
            <Textarea
              placeholder="Write the notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-primary-800">Send to</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode("all")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border px-4 py-2.5 text-sm font-medium transition-colors ${
                  mode === "all"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-primary-200 text-primary-500 hover:bg-primary-50/50"
                }`}
              >
                <FiUsers /> All Guardians
              </button>
              <button
                type="button"
                onClick={() => setMode("select")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border px-4 py-2.5 text-sm font-medium transition-colors ${
                  mode === "select"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-primary-200 text-primary-500 hover:bg-primary-50/50"
                }`}
              >
                <FiUser /> Select Specific
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={handleSend}
            isLoading={sending}
            disabled={sending}
          >
            <FiSend className="mr-1.5" />
            {mode === "all" ? "Send to All Guardians" : `Send to ${selected.size} Guardian(s)`}
          </Button>
        </div>
      </div>

      {/* Recipient picker (only in "select" mode) */}
      {mode === "select" && (
        <div className="h-fit rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-5 shadow-soft">
          <div className="relative mb-3">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
            <Input
              id="guardian-search"
              placeholder="Search guardians..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {loadingGuardians ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : guardians.length === 0 ? (
            <p className="py-6 text-center text-sm text-primary-500">No guardians found.</p>
          ) : (
            <div className="max-h-96 space-y-1 overflow-y-auto">
              {guardians.map((g) => (
                <label
                  key={g._id}
                  className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 hover:bg-primary-50/60"
                >
                  <Checkbox
                    checked={selected.has(g._id)}
                    onCheckedChange={() => toggleSelected(g._id)}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary-900">{g.name}</p>
                    <p className="truncate text-xs text-primary-500">{g.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBroadcast;
