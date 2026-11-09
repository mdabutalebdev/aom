"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FiSave, FiInfo } from "react-icons/fi";

import API_BASE_URL from "@/config/api";
import { authHeaders } from "@/config/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";
import { Switch } from "@/components/shadcn/switch";

// Social platforms shown in the footer — each has a URL and an active toggle.
const SOCIAL_PLATFORMS = [
  { key: "facebook", activeKey: "facebookActive", label: "Facebook", placeholder: "https://facebook.com/…" },
  { key: "instagram", activeKey: "instagramActive", label: "Instagram", placeholder: "https://instagram.com/…" },
  { key: "tiktok", activeKey: "tiktokActive", label: "TikTok", placeholder: "https://tiktok.com/@…" },
  { key: "linkedin", activeKey: "linkedinActive", label: "LinkedIn", placeholder: "https://linkedin.com/company/…" },
  { key: "youtube", activeKey: "youtubeActive", label: "YouTube", placeholder: "https://youtube.com/@…" },
  { key: "whatsapp", activeKey: "whatsappActive", label: "WhatsApp", placeholder: "Number or https://wa.me/…" },
];

const SOCIAL_URL_KEYS = SOCIAL_PLATFORMS.map((p) => p.key);
const SOCIAL_ACTIVE_KEYS = SOCIAL_PLATFORMS.map((p) => p.activeKey);

// Form field definitions - grouped by section.
const SECTIONS = [
  {
    title: "General Information",
    fields: [
      { key: "siteName", label: "Site Name", type: "text" },
      { key: "tagline", label: "Slogan / Tagline", type: "text" },
      { key: "logo", label: "Logo (URL)", type: "text" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
    ],
  },
  {
    title: "Social Links",
    custom: "social", // rendered specially: URL + active toggle per platform
  },
  {
    title: "Payment Account Details",
    fields: [
      { key: "paymentBankAccountTitle", label: "Bank — A/C Title", type: "text" },
      { key: "paymentBankAccountNo", label: "Bank — Account Number", type: "text" },
      { key: "paymentBankName", label: "Bank — Name", type: "text" },
      { key: "paymentBankBranch", label: "Bank — Branch", type: "text" },
      { key: "paymentBankRouting", label: "Bank — Routing Number", type: "text" },
      { key: "paymentBkashNumber", label: "bKash — Number", type: "text" },
      { key: "paymentBkashType", label: "bKash — Type (Personal/Merchant)", type: "text" },
      { key: "paymentNagadNumber", label: "Nagad — Number", type: "text" },
      { key: "paymentNagadType", label: "Nagad — Type (Personal/Merchant)", type: "text" },
      { key: "paymentRocketNumber", label: "Rocket — Number", type: "text" },
      { key: "paymentRocketType", label: "Rocket — Type (Personal/Merchant)", type: "text" },
      {
        key: "paymentInstructions",
        label: "Payment Instructions (shown to guardians)",
        type: "textarea",
      },
    ],
  },
  {
    title: "Descriptions",
    fields: [
      { key: "aboutText", label: "About Us", type: "textarea" },
      { key: "missionText", label: "Mission", type: "textarea" },
      { key: "visionText", label: "Vision", type: "textarea" },
      { key: "footerText", label: "Footer Text", type: "textarea" },
    ],
  },
];

// Plain text/textarea keys from the generic sections.
const TEXT_KEYS = SECTIONS.flatMap((s) => (s.fields || []).map((f) => f.key));

const emptyForm = {
  ...TEXT_KEYS.reduce((acc, k) => ({ ...acc, [k]: "" }), {}),
  ...SOCIAL_URL_KEYS.reduce((acc, k) => ({ ...acc, [k]: "" }), {}),
  // Active flags default on so a newly-added URL shows without extra clicks.
  ...SOCIAL_ACTIVE_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {}),
};

/**
 * SettingsManager — Site settings form.
 * Loads via GET /settings (public), saves via PATCH /settings (admin).
 */
const SettingsManager = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        const s = body.data || {};
        setForm({
          ...TEXT_KEYS.reduce((acc, k) => ({ ...acc, [k]: s[k] ?? "" }), {}),
          ...SOCIAL_URL_KEYS.reduce((acc, k) => ({ ...acc, [k]: s[k] ?? "" }), {}),
          // Missing flag (older document) defaults to active.
          ...SOCIAL_ACTIVE_KEYS.reduce(
            (acc, k) => ({ ...acc, [k]: s[k] ?? true }),
            {},
          ),
        });
      } else {
        setError(body.message || "Failed to load settings.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Settings saved successfully.");
      } else {
        toast.error(body.message || "Failed to save settings.");
      }
    } catch {
      toast.error("Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        <p className="animate-pulse text-primary-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger/30 bg-red-50 px-4 py-10 text-center text-danger">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchSettings}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start gap-2.5 rounded-lg border border-primary-100 bg-primary-50/50 px-3 py-2.5 text-xs text-primary-700">
        <FiInfo className="mt-0.5 shrink-0 text-primary-500" />
        <p>
          Teacher rates are configured in <span className="font-medium">Teacher Management</span>, and
          class monthly fees are configured in <span className="font-medium">Class Management</span>.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <Card key={section.title} size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          {section.custom === "social" ? (
            <CardContent className="space-y-3">
              <p className="text-xs text-primary-500">
                Turn a platform on to show it in the site footer. Only active
                platforms with a link are shown.
              </p>
              {SOCIAL_PLATFORMS.map((p) => {
                const active = !!form[p.activeKey];
                const hasLink = !!String(form[p.key] || "").trim();
                return (
                  <div
                    key={p.key}
                    className="rounded-[var(--radius-md)] border border-primary-100 p-3"
                  >
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Input
                          id={p.key}
                          label={`${p.label} (URL)`}
                          placeholder={p.placeholder}
                          value={form[p.key]}
                          onChange={(e) => setField(p.key, e.target.value)}
                        />
                      </div>
                      <label
                        htmlFor={p.activeKey}
                        className="flex shrink-0 flex-col items-center gap-1.5 pb-2"
                      >
                        <span className="text-xs font-medium text-primary-600">
                          {active ? "Active" : "Hidden"}
                        </span>
                        <Switch
                          id={p.activeKey}
                          checked={active}
                          onCheckedChange={(v) => setField(p.activeKey, v)}
                        />
                      </label>
                    </div>
                    {active && !hasLink && (
                      <p className="mt-2 text-xs text-amber-600">
                        Active, but no link yet — add a URL for it to show in the footer.
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          ) : (
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {section.fields.map((field) => {
              const isTextarea = field.type === "textarea";
              return (
                <div key={field.key} className={isTextarea ? "sm:col-span-2" : ""}>
                  {isTextarea ? (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Textarea
                        id={field.key}
                        rows={2}
                        value={form[field.key]}
                        onChange={(e) => setField(field.key, e.target.value)}
                      />
                    </div>
                  ) : (
                    <Input
                      id={field.key}
                      label={field.label}
                      value={form[field.key]}
                      onChange={(e) => setField(field.key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </CardContent>
          )}
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="sm" isLoading={saving}>
          <FiSave className="mr-1.5" />
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default SettingsManager;
