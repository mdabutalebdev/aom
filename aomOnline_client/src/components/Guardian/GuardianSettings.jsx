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
 * GuardianSettings — profile photo + name + password are editable. Email and
 * phone are read-only (only a Super Admin can change those, via user mgmt).
 */
const GuardianSettings = () => {
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

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

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await apiClient.patch("/user/me", { name: name.trim(), photo });
      toast.success("Profile updated.");
      fetchMe();
    } catch (err) {
      toast.error(err.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || newPassword.length < 6) {
      toast.error("Enter your current password and a new password (6+ characters).");
      return;
    }
    setChangingPassword(true);
    try {
      await apiClient.post("/auth/change-password", { oldPassword, newPassword });
      toast.success("Password changed.");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.message || "Could not change password.");
    } finally {
      setChangingPassword(false);
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
    <div className="mx-auto max-w-md space-y-6">
      <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-6 shadow-soft">
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
          <Input id="guardian-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input id="guardian-email" label="Email" value={me?.email || ""} disabled hint="Contact a Super Admin to change your email." />
          <Input id="guardian-phone" label="Phone" value={me?.phone || ""} disabled hint="Contact a Super Admin to change your phone." />
          <Button variant="primary" className="w-full justify-center" onClick={handleSaveProfile} isLoading={saving} disabled={saving}>
            Save Profile
          </Button>
        </div>
      </div>

      <div className="rounded-[var(--radius-2xl)] border border-primary-100/60 bg-surface p-6 shadow-soft">
        <h3 className="text-base font-semibold text-primary-900">Change Password</h3>
        <div className="mt-4 space-y-4">
          <Input
            id="old-password"
            type="password"
            label="Current Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            id="new-password"
            type="password"
            label="New Password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={handleChangePassword}
            isLoading={changingPassword}
            disabled={changingPassword}
          >
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuardianSettings;
