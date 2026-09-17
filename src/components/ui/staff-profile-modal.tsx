"use client";

import { useState, useRef } from "react";
import { X, Save, ImagePlus, Camera } from "lucide-react";
import { processImage } from "@/lib/process-image";

export type StaffProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  region: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  youtube_url: string | null;
  cover_url: string | null;
  founded_year: number | null;
  employee_count: number | null;
  specializations: string[] | null;
  service_areas: string[] | null;
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

async function uploadImage(profileId: string, file: File, kind: "avatar" | "cover", maxWidth: number) {
  const processed = await processImage(file, maxWidth);
  const form = new FormData();
  form.append("file", processed);
  form.append("kind", kind);
  const res = await fetch(`/api/admin/staff-profiles/${profileId}/photo`, { method: "POST", body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Upload failed");
  return json.url as string;
}

export function StaffProfileModal({ accountType, initial, onClose, onSaved }: {
  accountType: "agencija" | "fizicna_oseba";
  initial?: StaffProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isAgency = accountType === "agencija";
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [instagram, setInstagram] = useState(initial?.instagram ?? "");
  const [facebook, setFacebook] = useState(initial?.facebook ?? "");
  const [linkedin, setLinkedin] = useState(initial?.linkedin ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtube_url ?? "");
  const [foundedYear, setFoundedYear] = useState(initial?.founded_year ? String(initial.founded_year) : "");
  const [employeeCount, setEmployeeCount] = useState(initial?.employee_count ? String(initial.employee_count) : "");
  const [specializations, setSpecializations] = useState((initial?.specializations ?? []).join(", "));
  const [serviceAreas, setServiceAreas] = useState((initial?.service_areas ?? []).join(", "));

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(initial?.avatar_url ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(initial?.cover_url ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pickAvatar = (f: File | undefined) => {
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };
  const pickCover = (f: File | undefined) => {
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

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
      ...(isAgency ? {
        website: website.trim(), instagram: instagram.trim(), facebook: facebook.trim(),
        linkedin: linkedin.trim(), youtube_url: youtubeUrl.trim(),
        founded_year: foundedYear ? parseInt(foundedYear) : null,
        employee_count: employeeCount ? parseInt(employeeCount) : null,
        specializations: specializations.split(",").map(s => s.trim()).filter(Boolean),
        service_areas: serviceAreas.split(",").map(s => s.trim()).filter(Boolean),
      } : {}),
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
    if (!res.ok) { setError(json.error ?? "Something went wrong."); setSaving(false); return; }

    const profileId = initial?.id ?? json.id;
    try {
      if (avatarFile) await uploadImage(profileId, avatarFile, "avatar", 400);
      if (coverFile && isAgency) await uploadImage(profileId, coverFile, "cover", 1200);
    } catch {
      // profile itself saved fine — photo upload failing shouldn't block the save
    }

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
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

          <Field label={isAgency ? "Logo" : "Profile photo"}>
            <div className="flex items-center gap-4">
              <button
                type="button" onClick={() => avatarInputRef.current?.click()}
                className={`relative flex-shrink-0 overflow-hidden border-2 border-dashed border-border hover:border-primary/50 bg-muted/40 hover:bg-muted/60 transition-all ${isAgency ? "w-16 h-16 rounded-xl" : "w-16 h-16 rounded-full"}`}
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                  : <div className="flex items-center justify-center h-full"><ImagePlus className="h-5 w-5 text-muted-foreground/40" /></div>}
              </button>
              <button type="button" onClick={() => avatarInputRef.current?.click()} className="text-xs font-semibold text-primary hover:underline">
                {avatarPreview ? "Change" : "Choose image"}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickAvatar(e.target.files?.[0])} />
            </div>
          </Field>

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
          <Field label="Description">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Short description…" />
          </Field>

          {isAgency && (
            <>
              <Field label="Cover photo">
                <div className="flex items-center gap-4">
                  <button
                    type="button" onClick={() => coverInputRef.current?.click()}
                    className="relative flex-shrink-0 overflow-hidden border-2 border-dashed border-border hover:border-primary/50 bg-muted/40 hover:bg-muted/60 transition-all w-28 h-16 rounded-xl"
                  >
                    {coverPreview
                      ? <img src={coverPreview} alt="" className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                      : <div className="flex items-center justify-center h-full"><Camera className="h-5 w-5 text-muted-foreground/40" /></div>}
                  </button>
                  <button type="button" onClick={() => coverInputRef.current?.click()} className="text-xs font-semibold text-primary hover:underline">
                    {coverPreview ? "Change" : "Choose image"}
                  </button>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickCover(e.target.files?.[0])} />
                </div>
              </Field>

              <Field label="Website">
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://…" />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Instagram">
                  <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputClass} placeholder="https://instagram.com/…" />
                </Field>
                <Field label="Facebook">
                  <input value={facebook} onChange={(e) => setFacebook(e.target.value)} className={inputClass} placeholder="https://facebook.com/…" />
                </Field>
                <Field label="LinkedIn">
                  <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputClass} placeholder="https://linkedin.com/company/…" />
                </Field>
              </div>

              <Field label="YouTube video URL">
                <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className={inputClass} placeholder="https://youtube.com/watch?v=…" />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Year founded">
                  <input type="number" min="1900" max={new Date().getFullYear()} value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} className={inputClass} placeholder="2005" />
                </Field>
                <Field label="Number of employees">
                  <input type="number" min="1" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} className={inputClass} placeholder="10" />
                </Field>
              </div>

              <Field label="Specialisations (comma-separated)">
                <input value={specializations} onChange={(e) => setSpecializations(e.target.value)} className={inputClass} placeholder="Apartments, Houses, Commercial" />
              </Field>
              <Field label="Service areas (comma-separated)">
                <input value={serviceAreas} onChange={(e) => setServiceAreas(e.target.value)} className={inputClass} placeholder="Nairobi, Mombasa, Kisumu" />
              </Field>
            </>
          )}

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
