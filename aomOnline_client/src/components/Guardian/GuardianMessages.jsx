"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FiPlus, FiInbox, FiEye, FiEdit2, FiTrash2, FiSend } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ManagementDeleteModal from "@/components/Admin/ManagementDeleteModal";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";

const emptyForm = { title: "", body: "" };

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
 * GuardianMessages — a guardian sends one-way messages to their child's teacher.
 * A "Create Message" button opens the compose modal; sent messages live in a
 * data table with view / edit / delete actions.
 */
const GuardianMessages = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Compose / edit modal.
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // message being edited (null = create)
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // View + delete modals.
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMine = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/messages/my`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setItems(data?.data?.data || []);
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
    fetchMine();
  }, [fetchMine]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ title: m.title, body: m.body });
    setFormOpen(true);
  };

  const submitForm = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Please fill in both the title and the message.");
      return;
    }
    setSaving(true);
    try {
      const url = editing
        ? `${API_BASE_URL}/messages/${editing._id}`
        : `${API_BASE_URL}/messages`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ title: form.title.trim(), body: form.body.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success === undefined || data.success)) {
        toast.success(editing ? "Message updated." : "Message sent to the teacher.");
        setFormOpen(false);
        setEditing(null);
        fetchMine();
      } else {
        toast.error(data.message || "Could not save the message.");
      }
    } catch {
      toast.error("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success === undefined || data.success)) {
        toast.success("Message deleted.");
        setDeleteTarget(null);
        fetchMine();
      } else {
        toast.error(data.message || "Could not delete the message.");
      }
    } catch {
      toast.error("Could not connect to the server.");
    } finally {
      setDeleting(false);
    }
  };

  const formFooter = (
    <>
      <Button variant="outline" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
        Cancel
      </Button>
      <Button variant="primary" size="sm" onClick={submitForm} isLoading={saving} disabled={saving}>
        <FiSend className="mr-1.5" />
        {editing ? "Save" : "Send"}
      </Button>
    </>
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {!loading && !error && (
          <p className="text-sm text-primary-500">
            {items.length} message{items.length === 1 ? "" : "s"}
          </p>
        )}
        <Button variant="primary" className="ml-auto" onClick={openCreate}>
          <FiPlus className="mr-1" /> Create Message
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="animate-pulse text-primary-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-red-50 px-4 py-8 text-center text-danger">
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchMine}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-primary-100 bg-surface px-4 py-16 text-center text-primary-500">
          <FiInbox className="text-3xl text-primary-300" />
          <p>You haven&apos;t sent any messages yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-primary-100 bg-surface shadow-soft md:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-primary-50/50 text-primary-600">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m._id} className="border-b border-primary-50 last:border-0 hover:bg-primary-50/30">
                    <td className="px-4 py-3 align-top font-medium text-primary-900">{m.title}</td>
                    <td className="px-4 py-3 align-top text-primary-600">
                      <p className="max-w-md truncate">{m.body}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-primary-400">{formatDate(m.createdAt)}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewTarget(m)} aria-label="View">
                          <FiEye />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(m)} aria-label="Edit">
                          <FiEdit2 />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-red-50"
                          onClick={() => setDeleteTarget(m)}
                          aria-label="Delete"
                        >
                          <FiTrash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {items.map((m) => (
              <div key={m._id} className="rounded-[var(--radius-lg)] border border-primary-100 bg-surface p-4 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-primary-900">{m.title}</p>
                  <span className="shrink-0 text-xs text-primary-400">{formatDate(m.createdAt)}</span>
                </div>
                <p className="mt-1 truncate text-sm text-primary-600">{m.body}</p>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewTarget(m)}>
                    <FiEye className="mr-1" /> View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(m)}>
                    <FiEdit2 className="mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-danger/40 text-danger hover:bg-red-50"
                    onClick={() => setDeleteTarget(m)}
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Compose / Edit modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Message" : "Send a Message to the Teacher"}
        size="lg"
        footer={formFooter}
      >
        <div className="space-y-4">
          <Input
            id="title"
            label="Title"
            placeholder="e.g. Class timing question"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            maxLength={200}
          />
          <div className="space-y-1.5">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              rows={5}
              placeholder="Write your message for the teacher…"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              maxLength={5000}
            />
          </div>
        </div>
      </Modal>

      {/* View modal */}
      <Modal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={viewTarget?.title || "Message"}
        size="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setViewTarget(null)}>
            Close
          </Button>
        }
      >
        {viewTarget && (
          <div>
            <p className="text-xs text-primary-400">{formatDate(viewTarget.createdAt)}</p>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-primary-800">
              {viewTarget.body}
            </p>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <ManagementDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete Message"
        name={deleteTarget?.title || "this message"}
        loading={deleting}
      />
    </div>
  );
};

export default GuardianMessages;
