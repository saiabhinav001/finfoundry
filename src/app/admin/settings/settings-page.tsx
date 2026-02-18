"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Toast, type ToastData } from "@/components/admin/toast";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { Save, ExternalLink, Globe, Mail, Instagram, Linkedin, Link2, Image } from "lucide-react";

interface SettingsData {
  clubName: string;
  tagline: string;
  heroTagline: string;
  email: string;
  instagram: string;
  linkedin: string;
  whatsapp: string;
  registrationLink: string;
  logoUrl: string;
}

const defaults: SettingsData = {
  clubName: "CBIT FinFoundry",
  tagline: "Where Finance Meets Innovation",
  heroTagline: "Forging Financial Intelligence at CBIT",
  email: "finfoundry@cbit.ac.in",
  instagram: "https://instagram.com/cbit_finfoundry",
  linkedin: "https://linkedin.com/company/cbit-finfoundry",
  whatsapp: "",
  registrationLink: "",
  logoUrl: "",
};

export function SettingsPage() {
  const { role } = useAuth();
  const [settings, setSettings] = useState<SettingsData>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useUnsavedChanges(isDirty);

  const isAdmin = role === "admin" || role === "super_admin";
  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object" && !data.error) setSettings({ ...defaults, ...data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!isAdmin) { showToast("Only admins can update settings.", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      showToast("Settings saved!", "success");
      setIsDirty(false);
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Failed to save.", "error"); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  const Field = ({ label, icon: Icon, field, placeholder, type = "text" }: { label: string; icon: React.ComponentType<{ className?: string }>; field: keyof SettingsData; placeholder: string; type?: string }) => (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2"><Icon className="w-4 h-4 text-teal-light/60" />{label}</label>
      <input type={type} value={settings[field]} onChange={(e) => handleChange(field, e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"
        disabled={!isAdmin} />
    </div>
  );

  return (
    <div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Global site configuration and social links.{isDirty && <span className="text-gold ml-2">● Unsaved changes</span>}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">
            <ExternalLink className="w-4 h-4" /> View Site
          </a>
          {isAdmin && (
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold hover:bg-gold-light disabled:opacity-50 transition-colors duration-200">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
            </button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="mb-6 p-4 rounded-xl bg-gold/[0.06] border border-gold/20 text-sm text-gold">Only admins can edit settings. You can view the current configuration below.</div>
      )}

      <div className="space-y-6">
        {/* General */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-6">General</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Club Name" icon={Globe} field="clubName" placeholder="CBIT FinFoundry" />
            <Field label="Tagline" icon={Globe} field="tagline" placeholder="Where Finance Meets Innovation" />
            <div className="sm:col-span-2">
              <Field label="Hero Tagline" icon={Globe} field="heroTagline" placeholder="Forging Financial Intelligence at CBIT" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Logo URL" icon={Image} field="logoUrl" placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Contact & Socials */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-6">Contact & Social Links</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Email" icon={Mail} field="email" placeholder="finfoundry@cbit.ac.in" type="email" />
            <Field label="Instagram" icon={Instagram} field="instagram" placeholder="https://instagram.com/..." />
            <Field label="LinkedIn" icon={Linkedin} field="linkedin" placeholder="https://linkedin.com/..." />
            <Field label="WhatsApp Group" icon={Link2} field="whatsapp" placeholder="https://chat.whatsapp.com/..." />
          </div>
        </div>

        {/* Registration */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <h2 className="font-heading font-semibold text-lg text-foreground mb-6">Registration</h2>
          <Field label="Registration Link" icon={Link2} field="registrationLink" placeholder="https://forms.google.com/..." />
          <p className="text-xs text-muted-foreground/50 mt-2">This link is shown across the site for new member sign-ups.</p>
        </div>
      </div>
    </div>
  );
}
