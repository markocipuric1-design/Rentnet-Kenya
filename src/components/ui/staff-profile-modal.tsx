"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

export type StaffProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  region: string | null;
  bio: string | null;
  website: string | null;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all";

export function StaffProfileModal({ accountType, initial, onClose, onSaved }: {
  accountType: "agencija" | "fizicna_oseba";
  initial?: StaffProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isAgency = accountType === "agencija";
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email and phone are required.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      full_name: fullName.trim(), email: email.trim(), phone: phone.trim(),
      city: city.trim(), region: region.trim(), bio: bio.trim(),
      ...(isAgency ? { website: website.trim() } : {}),
    };

    const res = initial
      ? await fetch(`/api/admin/staff-profiles/${initial.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/staff-profiles", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, account_type: accountType }),
        });

    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
          <h2 className="font-bold text-foreground">
            {initial ? "Edit" : "New"} {isAgency ? "Agency" : "Individual"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {!initial && (
            <p className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-xl px-3 py-2.5">
              This creates a profile on their behalf — no password is set. Use &quot;Send invite&quot; afterwards if they should be able to log in themselves.
            </p>
          )}
          <Field label={isAgency ? "Agency name" : "Full name"}>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} placeholder={isAgency ? "e.g. PrimeNest Realtors" : "e.g. Brian Otieno"} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="contact@example.com" />
            </Field>
            <Field label="Phone">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClass} placeholder="+254 7xx xxx xxx" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City / Town">
              <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Nairobi" />
            </Field>
            <Field label="County">
              <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass} placeholder="Nairobi" />
            </Field>
          </div>
          {isAgency && (
            <Field label="Website">
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://…" />
            </Field>
          )}
          <Field label="Description">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Short description…" />
          </Field>

          {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-border hover:bg-accent text-foreground font-semibold py-2.5 rounded-xl text-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
              {initial ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
