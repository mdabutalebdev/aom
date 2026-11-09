"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FiCamera } from "react-icons/fi";

import apiClient from "@/lib/apiClient";
import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import AdminAvatar from "@/components/Admin/AdminAvatar";

/**
 * TeacherSettings — profile photo + name only. No password field/action is
 * rendered here at all — only a Super Admin can reset a teacher's password.
 */
const TeacherSettings = () => {
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/user/me");
      setMe(res.data);
      setName(res.data?.name || "");
      setPhoto(res.data?.photo || "");
    } catch (err) {
      toast.error(err.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMe();
  }, [fetchMe]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API_BASE_URL}/user/upload-photo`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.data?.url) {
        setPhoto(data.data.url);
      } else {
        toast.error(data.message || "Photo upload failed.");
      }
    } catch {
      toast.error("Could not connect to server.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Photo only — the server's per-role whitelist also rejects a name
      // change for teachers, so sending it would just be a silent no-op.
      await apiClient.patch("/user/me", { photo });
      toast.success("Photo updated.");
      fetchMe();
    } catch (err) {
      toast.error(err.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-6 shadow-soft">
      <div className="flex flex-col items-center">
        <div className="relative">
          <AdminAvatar src={photo} name={name} size={96} />
          <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white shadow-soft hover:bg-primary-600">
            <FiCamera className="text-sm" />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploading} />
          </label>
        </div>
        {uploading && <p className="mt-2 text-xs text-primary-500">Uploading...</p>}
      </div>

      <div className="mt-6 space-y-4">
        <Input
          id="teacher-name"
          label="Name"
          value={name}
          disabled
          hint="Name cannot be changed here."
        />
        <Input id="teacher-email" label="Email" value={me?.email || ""} disabled hint="Email cannot be changed here." />
        <p className="rounded-[var(--radius-md)] bg-primary-50/60 px-3 py-2 text-xs text-primary-500">
          Only your photo can be changed here. To update your name or password,
          please contact a Super Admin.
        </p>
        <Button variant="primary" className="w-full justify-center" onClick={handleSave} isLoading={saving} disabled={saving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default TeacherSettings;
