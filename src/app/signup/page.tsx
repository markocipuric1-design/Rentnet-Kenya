"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home, Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock, User, Phone,
  Check, Building2, Briefcase, Shield, Camera, ImagePlus, MapPin, Globe, Users,
  Calendar, Tag, FileText, ChevronDown, X,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import { processImage } from "@/lib/process-image";

const STEPS = ["Role", "Basic Info", "Details", "Finish"];

const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Kiambu", "Machakos", "Kajiado", "Murang'a", "Nyeri",
  "Meru", "Embu", "Kilifi", "Kwale", "Taita-Taveta",
  "Kisii", "Nyamira", "Migori", "Homa Bay", "Siaya",
  "Kakamega", "Bungoma", "Busia", "Vihiga", "Trans Nzoia",
  "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia",
  "Samburu", "West Pokot", "Turkana", "Marsabit", "Isiolo",
  "Garissa", "Wajir", "Mandera", "Tana River", "Lamu",
  "Kitui", "Makueni", "Nyandarua", "Kirinyaga", "Bomet",
  "Kericho", "Narok", "Kajiado", "Taita-Taveta",
];

const KENYAN_CITIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Thika", "Malindi", "Kitale", "Garissa", "Kakamega",
  "Nyeri", "Meru", "Machakos", "Kericho", "Ruiru",
  "Kiambu", "Kikuyu", "Athi River", "Ngong", "Limuru",
  "Karen", "Westlands", "Parklands", "Lavington", "Kilimani",
  "Muthaiga", "Runda", "Gigiri", "Langata", "Embakasi",
  "Syokimau", "Mlolongo", "Kiserian", "Kitengela", "Ongata Rongai",
];

const EMPLOYEE_OPTIONS = [
  { label: "1–5 employees", value: "3" },
  { label: "6–15 employees", value: "10" },
  { label: "16–30 employees", value: "23" },
  { label: "31–50 employees", value: "40" },
  { label: "51–100 employees", value: "75" },
  { label: "More than 100", value: "100" },
];

const SPECIALIZATION_OPTIONS = [
  "Apartments", "Houses", "Commercial", "Land Plots",
  "Garages", "Luxury Properties", "Investment Properties",
  "Holiday Homes",
];

const PHONE_PREFIXES = [
  { code: "+254", flag: "🇰🇪" },
  { code: "+255", flag: "🇹🇿" },
  { code: "+256", flag: "🇺🇬" },
  { code: "+251", flag: "🇪🇹" },
  { code: "+27", flag: "🇿🇦" },
  { code: "+1", flag: "🇺🇸" },
  { code: "+44", flag: "🇬🇧" },
];

const INTENTION_OPTIONS = [
  { value: "buying", label: "Looking to buy a property" },
  { value: "selling", label: "Looking to sell a property" },
  { value: "renting_out", label: "Looking to rent out a property" },
  { value: "seeking_rent", label: "Looking for a rental" },
];

type AccountType = "fizicna_oseba" | "agencija" | "partner" | "";

const DRAFT_KEY = "reg_draft_v2";

const emptyForm = {
  accountType: "" as AccountType,
  // Step 2
  firstName: "", lastName: "", contactPerson: "",
  email: "", phone: "", phonePrefix: "+254",
  city: "", region: "", bio: "",
  password: "", passwordConfirm: "",
  // Step 3A
  birthDate: "", intentions: [] as string[], isAnonymous: false, emso: "",
  // Step 3B
  agencyName: "", agencyShortName: "",
  matStevilka: "", davStevilka: "",
  address: "", postalCode: "",
  agencyPhone: "", agencyPhonePrefix: "+254", agencyEmail: "",
  website: "", agencyDesc: "",
  foundedYear: "", employeeCount: "",
  specializations: [] as string[],
  licenseNumber: "", instagram: "", facebook: "",
  // Step 4
  agreeTerms: false, agreePublish: false,
};
type FormData = typeof emptyForm;

// ─── tiny reusable field wrapper ───────────────────────────────────────────
function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", icon: Icon, disabled, list, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean; list?: string; className?: string;
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} list={list} disabled={disabled}
        className={`w-full ${Icon ? "pl-9" : "pl-3.5"} pr-3.5 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50 disabled:opacity-60 ${className}`}
      />
    </div>
  );
}

function Checkbox({ checked, onChange, label, sublabel }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${checked ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
      <div>
        <span className="text-sm text-foreground leading-snug">{label}</span>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{sublabel}</p>}
      </div>
    </label>
  );
}

function PhoneInput({ prefix, phone, onPrefix, onPhone }: {
  prefix: string; phone: string; onPrefix: (v: string) => void; onPhone: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <select
        value={prefix} onChange={e => onPrefix(e.target.value)}
        className="border border-border bg-background rounded-xl px-2 py-2.5 text-sm outline-none focus:border-primary/50 w-[90px] flex-shrink-0 appearance-none"
      >
        {PHONE_PREFIXES.map(p => (
          <option key={p.code} value={p.code}>{p.flag} {p.code}</option>
        ))}
      </select>
      <Input value={phone} onChange={onPhone} placeholder="41 123 456" icon={Phone} />
    </div>
  );
}

// ─── main component ─────────────────────────────────────────────────────────
export default function SignUpPage() {
  useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registrationPending, setRegistrationPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // draft restore / save (no passwords)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { password, passwordConfirm, ...rest } = JSON.parse(saved);
        void password; void passwordConfirm;
        setForm(prev => ({ ...prev, ...rest }));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, passwordConfirm, ...rest } = form;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
  }, [form]);

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const toggleArr = (key: "intentions" | "specializations", val: string) => {
    setForm(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(val)
        ? (prev[key] as string[]).filter(v => v !== val)
        : [...(prev[key] as string[]), val],
    }));
  };

  const isAgency = form.accountType === "agencija";
  const isPartner = form.accountType === "partner";

  const passwordStrength = (() => {
    if (!form.password) return 0;
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    if (/[^A-Za-z0-9]/.test(form.password)) s++;
    return s;
  })();

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1 && !form.accountType) e.accountType = "Please select an account type.";
    if (s === 2) {
      if (!form.firstName.trim()) e.firstName = "First name is required.";
      if (!isAgency && !isPartner && !form.lastName.trim()) e.lastName = "Last name is required.";
      if (!form.email.trim()) e.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address.";
      if (!form.phone.trim()) e.phone = "Phone number is required.";
      if (!form.city.trim()) e.city = "City is required.";
      if (!form.region && !isPartner) e.region = "County is required.";
      if (!form.password) e.password = "Password is required.";
      else if (form.password.length < 6) e.password = "At least 6 characters.";
      if (form.password !== form.passwordConfirm) e.passwordConfirm = "Passwords do not match.";
    }
    if (s === 3 && !isAgency) {
      if (!form.birthDate) e.birthDate = "Date of birth is required.";
      else {
        const age = (Date.now() - new Date(form.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000);
        if (age < 18) e.birthDate = "You must be at least 18 years old to register.";
      }
    }
    if (s === 3 && isAgency) {
      if (!form.agencyName.trim()) e.agencyName = "Agency name is required.";
      if (!form.matStevilka.trim()) e.matStevilka = "Registration number is required.";
      if (!form.davStevilka.trim()) e.davStevilka = "Tax PIN is required.";
      if (!form.address.trim()) e.address = "Address is required.";
      if (!form.postalCode.trim()) e.postalCode = "Postal code is required.";
      if (!form.agencyPhone.trim()) e.agencyPhone = "Phone number is required.";
      if (!form.agencyEmail.trim()) e.agencyEmail = "Agency email is required.";
      else if (!/\S+@\S+\.\S+/.test(form.agencyEmail)) e.agencyEmail = "Invalid email address.";
    }
    if (s === 4 && !form.agreeTerms) e.agreeTerms = "You must agree to the terms of use.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) { if (step === 2 && isPartner) setStep(4); else setStep(s => Math.min(s + 1, 4)); } };
  const back = () => { if (step === 4 && isPartner) setStep(2); else setStep(s => Math.max(s - 1, 1)); };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setAvatarError("Only image files are allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setAvatarError("Image is too large (max 5 MB)."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!validate(4)) return;
    setLoading(true);
    const supabase = createClient();
    const fullName = isAgency
      ? form.agencyName.trim()
      : `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: fullName, phone: `${form.phonePrefix}${form.phone}`, account_type: form.accountType },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setErrors({ submit: signUpError.message === "User already registered" ? "This email address is already registered." : "Registration error. Please try again." });
      setLoading(false);
      return;
    }

    let profileModerationOn = false;
    if (data.user) {
      // Check if profile moderation is enabled
      const { data: settingsRows } = await supabase.from("site_settings").select("key, value");
      const settings = Object.fromEntries((settingsRows ?? []).map(r => [r.key, r.value]));
      profileModerationOn = settings["profile_moderation_enabled"] === "true";

      let avatar_url: string | null = null;
      if (avatarFile) {
        const processed = await processImage(avatarFile, 400);
        const path = `${data.user.id}/avatar.webp`;
        const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, processed, { upsert: true, contentType: "image/webp" });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          avatar_url = urlData.publicUrl;
        }
      }

      // Core save — only confirmed columns
      const corePayload: Record<string, unknown> = {
        profile_status: profileModerationOn ? "pending" : "active",
        id: data.user.id,
        full_name: fullName,
        email: form.email.trim(),
        phone: `${form.phonePrefix}${form.phone}`.trim(),
        account_type: form.accountType,
        ...(avatar_url ? { avatar_url } : {}),
        ...((isAgency || isPartner) ? { website: form.website || null } : {}),
        ...(isAgency ? {
          instagram: form.instagram || null,
          facebook: form.facebook || null,
          specializations: form.specializations.length ? form.specializations : null,
          employee_count: form.employeeCount ? parseInt(form.employeeCount) : null,
          founded_year: form.foundedYear ? parseInt(form.foundedYear) : null,
        } : {}),
      };
      const { error: profileError } = await supabase.from("profiles").upsert(corePayload);
      if (profileError) {
        setErrors({ submit: `Account created but profile could not be saved: ${profileError.message}` });
        setLoading(false);
        return;
      }

      // Extended fields — try separately (needs SQL migration)
      const ext: Record<string, unknown> = { id: data.user.id };
      if (form.city) ext.city = form.city;
      if (form.region) ext.region = form.region;
      if (form.bio) ext.bio = form.bio;
      if (Object.keys(ext).length > 1) {
        await supabase.from("profiles").upsert(ext).then(() => {}, () => {});
      }
    }

    localStorage.removeItem(DRAFT_KEY);
    setLoading(false);
    setRegistrationPending(profileModerationOn);
    setSuccess(true);
  };

  // ─── success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center flex flex-col items-center gap-6 max-w-sm w-full">
            <div className="relative">
              {avatarPreview ? (
                <div className={`overflow-hidden border-4 border-emerald-500/30 ${isAgency || isPartner ? "w-24 h-20 rounded-2xl" : "w-24 h-24 rounded-full"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                  <Check className="h-12 w-12 text-emerald-500" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-card">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Account created!</h2>
              <p className="text-muted-foreground text-sm">
                Welcome, <strong className="text-foreground">{isAgency ? form.agencyName : form.firstName}</strong>!
                Check your email for a confirmation message.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 w-full text-left">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">What&apos;s next?</p>
              {[
                "You will receive an email with a confirmation link",
                "Click the link to activate your account",
                registrationPending
                  ? "An administrator will review and approve your profile (within 24h)"
                  : isAgency
                  ? "Our team will verify your agency profile (within 24h)"
                  : isPartner
                  ? "Visit the Partner Directory to register your business listing"
                  : "Start browsing or posting properties",
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                  <span className="text-sm text-foreground">{s}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link href={isPartner ? "/login?redirect=/partners" : "/login"} className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-6 py-3 rounded-xl text-sm shadow-lg shadow-primary/25">
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/" className="flex items-center gap-2 border border-border hover:bg-accent px-6 py-3 rounded-xl text-sm font-semibold">
                <Home className="h-4 w-4" /> Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl mb-5">
              <Home className="h-5 w-5" /> Rentnet
            </Link>
            <h1 className="text-2xl font-extrabold text-foreground mb-1.5">Create account</h1>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i + 1 < step ? "bg-primary text-primary-foreground" :
                      i + 1 === step ? "border-2 border-primary bg-primary/10 text-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-semibold whitespace-nowrap ${i + 1 === step ? "text-primary" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${i + 1 < step ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card */}
          <div className="relative bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/5 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.52_0.27_293/0.04)_1px,transparent_1px)] bg-[length:20px_20px]" />
            </div>

            <div className="relative">

              {/* ── STEP 1 ─────────────────────────────────────────────── */}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-extrabold text-foreground mb-1">What type of user are you?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Select an account type for a tailored registration process.</p>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        value: "fizicna_oseba",
                        Icon: User,
                        label: "Individual",
                        desc: "Private individual, owner, seller or landlord",
                        accent: "text-emerald-600 bg-emerald-500/10",
                        bullets: ["Buying or renting out", "Looking for a property", "Private advertiser"],
                      },
                      {
                        value: "agencija",
                        Icon: Building2,
                        label: "Agency / Company",
                        desc: "Real estate agency or company",
                        accent: "text-sky-600 bg-sky-500/10",
                        bullets: ["Professional broker", "Multiple listings", "Identity verification"],
                      },
                    ].map(t => {
                      const active = form.accountType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => set("accountType", t.value as AccountType)}
                          className={`relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all h-full ${
                            active ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-background"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? t.accent : "bg-muted"}`}>
                            <t.Icon className={`h-5 w-5 ${active ? t.accent.split(" ")[0] : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="text-sm font-bold mb-1">{t.label}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                          </div>
                          <ul className="space-y-1 mt-1">
                            {t.bullets.map(b => (
                              <li key={b} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <div className={`w-1 h-1 rounded-full flex-shrink-0 ${active ? "bg-primary" : "bg-muted-foreground/40"}`} />
                                {b}
                              </li>
                            ))}
                          </ul>
                          {active && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Business Partner card — full width, slightly smaller */}
                  <button
                    type="button"
                    onClick={() => set("accountType", "partner")}
                    className={`relative mt-3 flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all w-full ${
                      isPartner ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-background"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isPartner ? "bg-amber-500/10" : "bg-muted"}`}>
                      <Briefcase className={`h-[18px] w-[18px] ${isPartner ? "text-amber-600" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">Business Partner</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Furniture, finance, legal, design & other service providers</p>
                    </div>
                    {isPartner && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>

                  {errors.accountType && <p className="text-xs text-destructive mt-3">{errors.accountType}</p>}
                </div>
              )}

              {/* ── STEP 2 ─────────────────────────────────────────────── */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground mb-1">Basic Information</h2>
                    <p className="text-sm text-muted-foreground">Your contact details for your profile.</p>
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      {isAgency ? "Agency Logo" : isPartner ? "Company Logo" : "Profile Photo"}
                      <span className="font-normal normal-case ml-1">(optional · max 5 MB)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex-shrink-0 overflow-hidden border-2 border-dashed border-border hover:border-primary/50 bg-muted/40 hover:bg-muted/60 transition-all group ${
                          isAgency ? "w-24 h-20 rounded-2xl" : "w-20 h-20 rounded-full"
                        }`}
                      >
                        {avatarPreview ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="h-5 w-5 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImagePlus className="h-6 w-6 text-muted-foreground/40 group-hover:text-primary/50 transition-colors" />
                          </div>
                        )}
                      </button>
                      <div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold text-primary hover:underline">
                          {avatarFile ? "Change" : "Choose image"}
                        </button>
                        {avatarFile && (
                          <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }} className="text-xs text-muted-foreground hover:text-destructive ml-3 transition-colors">
                            Remove
                          </button>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">JPEG, PNG, WebP</p>
                      </div>
                    </div>
                    {avatarError && <p className="text-xs text-destructive mt-1">{avatarError}</p>}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={isAgency ? "Agency Name" : isPartner ? "Company Name" : "First Name"} required error={errors.firstName}>
                      <Input value={form.firstName} onChange={v => set("firstName", v)} placeholder={isAgency ? "Rentnet Properties Ltd" : isPartner ? "Furniture Palace Ltd" : "John"} icon={isAgency || isPartner ? Building2 : User} />
                    </Field>
                    {!isAgency && !isPartner ? (
                      <Field label="Last Name" required error={errors.lastName}>
                        <Input value={form.lastName} onChange={v => set("lastName", v)} placeholder="Kamau" />
                      </Field>
                    ) : (
                      <Field label="Contact Person">
                        <Input value={form.contactPerson} onChange={v => set("contactPerson", v)} placeholder="John Kamau" icon={User} />
                      </Field>
                    )}
                  </div>

                  {/* Email */}
                  <Field label="Email" required error={errors.email}>
                    <Input type="email" value={form.email} onChange={v => set("email", v)} placeholder="you@email.com" icon={Mail} />
                  </Field>

                  {/* Phone */}
                  <Field label="Phone" required error={errors.phone}>
                    <PhoneInput prefix={form.phonePrefix} phone={form.phone} onPrefix={v => set("phonePrefix", v)} onPhone={v => set("phone", v)} />
                  </Field>

                  {/* City + Region */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="City / Town" required error={errors.city}>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                          type="text" value={form.city} onChange={e => set("city", e.target.value)}
                          placeholder="Nairobi" list="cities-list"
                          className="w-full pl-9 pr-3.5 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                        />
                        <datalist id="cities-list">
                          {KENYAN_CITIES.map(c => <option key={c} value={c} />)}
                        </datalist>
                      </div>
                    </Field>
                    <Field label={isPartner ? "County (optional)" : "County"} required={!isPartner} error={errors.region}>
                      <div className="relative">
                        <select
                          value={form.region} onChange={e => set("region", e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 appearance-none"
                        >
                          <option value="">Select county…</option>
                          {KENYAN_COUNTIES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </Field>
                  </div>

                  {/* Website — shown for partners in step 2 */}
                  {isPartner && (
                    <Field label="Website" hint="Optional">
                      <Input type="url" value={form.website} onChange={v => set("website", v)} placeholder="https://yourcompany.co.ke" icon={Globe} />
                    </Field>
                  )}

                  {/* Bio */}
                  <Field label="Short Bio" hint={`${form.bio.length}/3000 characters`}>
                    <textarea
                      value={form.bio} onChange={e => set("bio", e.target.value)}
                      placeholder="Write a short introduction…"
                      maxLength={3000} rows={3}
                      className="w-full px-3.5 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 resize-none placeholder:text-muted-foreground/50"
                    />
                  </Field>

                  {/* Password */}
                  <div className="pt-1 border-t border-border">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-4">Account Security</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Password" required error={errors.password}>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type={showPassword ? "text" : "password"} value={form.password}
                            onChange={e => set("password", e.target.value)} placeholder="At least 6 characters"
                            className="w-full pl-9 pr-10 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                          />
                          <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {form.password && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex gap-1 flex-1">
                              {[1,2,3,4].map(i => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                  i <= passwordStrength
                                    ? (["","bg-destructive","bg-amber-400","bg-emerald-400","bg-emerald-500"])[passwordStrength]
                                    : "bg-border"
                                }`} />
                              ))}
                            </div>
                            <span className={`text-[11px] font-semibold ${passwordStrength <= 1 ? "text-destructive" : passwordStrength === 2 ? "text-amber-500" : "text-emerald-500"}`}>
                              {(["","Weak","Fair","Good","Strong"])[passwordStrength]}
                            </span>
                          </div>
                        )}
                      </Field>
                      <Field label="Confirm Password" required error={errors.passwordConfirm}>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type={showPassword ? "text" : "password"} value={form.passwordConfirm}
                            onChange={e => set("passwordConfirm", e.target.value)} placeholder="Repeat password"
                            className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 transition-all placeholder:text-muted-foreground/50 bg-background ${
                              form.passwordConfirm && form.password !== form.passwordConfirm
                                ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                                : form.passwordConfirm && form.password === form.passwordConfirm
                                ? "border-emerald-500 focus:ring-emerald-500/10 focus:border-emerald-500"
                                : "border-border focus:border-primary/50 focus:ring-primary/10"
                            }`}
                          />
                          {form.passwordConfirm && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {form.password === form.passwordConfirm
                                ? <Check className="h-4 w-4 text-emerald-500" />
                                : <X className="h-4 w-4 text-destructive" />}
                            </div>
                          )}
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3A — fizična oseba ────────────────────────────── */}
              {step === 3 && !isAgency && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground mb-1">Your Profile</h2>
                    <p className="text-sm text-muted-foreground">Additional information for a better experience.</p>
                  </div>

                  {/* Birth date */}
                  <Field label="Date of Birth" required error={errors.birthDate}
                    hint="Not shown publicly — only used for age verification.">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="date" value={form.birthDate} onChange={e => set("birthDate", e.target.value)}
                        max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().split("T")[0]}
                        className="w-full pl-9 pr-3.5 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </Field>

                  {/* Intentions */}
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      I&apos;m interested in <span className="font-normal normal-case">(select all that apply)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {INTENTION_OPTIONS.map(opt => {
                        const on = form.intentions.includes(opt.value);
                        return (
                          <button
                            key={opt.value} type="button" onClick={() => toggleArr("intentions", opt.value)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left text-sm transition-all ${
                              on ? "border-primary bg-primary/5 font-medium text-foreground" : "border-border hover:border-primary/30 text-muted-foreground"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center ${on ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                              {on && <Check className="h-2.5 w-2.5 text-white" />}
                            </div>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Anonymous */}
                  <div className="bg-muted/40 border border-border rounded-2xl p-4">
                    <Checkbox
                      checked={form.isAnonymous} onChange={v => set("isAnonymous", v)}
                      label="I want to remain anonymous"
                      sublabel="Name and phone will not be shown publicly. Contact is only possible through the portal."
                    />
                  </div>

                  {/* EMSO */}
                  <Field label="National ID / KRA PIN" hint="Optional · Increases credibility with buyers.">
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text" value={form.emso} onChange={e => set("emso", e.target.value)}
                        placeholder="1234567890123" maxLength={13}
                        className="w-full pl-9 pr-3.5 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </Field>
                </div>
              )}

              {/* ── STEP 3B — agencija ─────────────────────────────────── */}
              {step === 3 && isAgency && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground mb-1">Agency Details</h2>
                    <p className="text-sm text-muted-foreground">Official details for verification and public profile.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Agency Name" required error={errors.agencyName}>
                      <Input value={form.agencyName} onChange={v => set("agencyName", v)} placeholder="Rentnet Properties Ltd" icon={Building2} />
                    </Field>
                    <Field label="Short Name / Brand">
                      <Input value={form.agencyShortName} onChange={v => set("agencyShortName", v)} placeholder="RentnetPro" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Company Registration No." required error={errors.matStevilka}>
                      <Input value={form.matStevilka} onChange={v => set("matStevilka", v)} placeholder="PVT-1234567" />
                    </Field>
                    <Field label="KRA PIN / Tax No." required error={errors.davStevilka}>
                      <Input value={form.davStevilka} onChange={v => set("davStevilka", v)} placeholder="A123456789B" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Field label="Street Address" required error={errors.address}>
                        <Input value={form.address} onChange={v => set("address", v)} placeholder="Kenyatta Avenue, Nairobi" icon={MapPin} />
                      </Field>
                    </div>
                    <Field label="Postal Code" required error={errors.postalCode}>
                      <Input value={form.postalCode} onChange={v => set("postalCode", v)} placeholder="00100" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Agency Phone" required error={errors.agencyPhone}>
                      <PhoneInput
                        prefix={form.agencyPhonePrefix} phone={form.agencyPhone}
                        onPrefix={v => set("agencyPhonePrefix", v)} onPhone={v => set("agencyPhone", v)}
                      />
                    </Field>
                    <Field label="Agency Email" required error={errors.agencyEmail}>
                      <Input type="email" value={form.agencyEmail} onChange={v => set("agencyEmail", v)} placeholder="info@youragency.ke" icon={Mail} />
                    </Field>
                  </div>

                  <Field label="Website">
                    <Input type="url" value={form.website} onChange={v => set("website", v)} placeholder="https://www.youragency.ke" icon={Globe} />
                  </Field>

                  <Field label="Agency Description">
                    <textarea
                      value={form.agencyDesc} onChange={e => set("agencyDesc", e.target.value)}
                      placeholder="Short description of your agency (2–4 sentences)…" rows={3} maxLength={1000}
                      className="w-full px-3.5 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 resize-none placeholder:text-muted-foreground/50"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Year Founded">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                          type="number" value={form.foundedYear} onChange={e => set("foundedYear", e.target.value)}
                          placeholder="2005" min="1900" max={new Date().getFullYear()}
                          className="w-full pl-9 pr-3.5 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </Field>
                    <Field label="Number of Employees">
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select
                          value={form.employeeCount} onChange={e => set("employeeCount", e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 border border-border bg-background rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 appearance-none"
                        >
                          <option value="">Select…</option>
                          {EMPLOYEE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </Field>
                  </div>

                  {/* Specializations */}
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      <Tag className="inline h-3.5 w-3.5 mr-1" />
                      Specializations <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALIZATION_OPTIONS.map(s => {
                        const on = form.specializations.includes(s);
                        return (
                          <button
                            key={s} type="button" onClick={() => toggleArr("specializations", s)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            {on && <Check className="h-3 w-3" />} {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="License Number">
                      <Input value={form.licenseNumber} onChange={v => set("licenseNumber", v)} placeholder="RE-123/2020" icon={FileText} />
                    </Field>
                    <Field label="Instagram">
                      <Input value={form.instagram} onChange={v => set("instagram", v)} placeholder="https://instagram.com/…" />
                    </Field>
                    <Field label="Facebook">
                      <Input value={form.facebook} onChange={v => set("facebook", v)} placeholder="https://facebook.com/…" />
                    </Field>
                  </div>

                  {/* License PDF */}
                  <Field label="License / Certificate" hint="PDF document · optional">
                    <button
                      type="button" onClick={() => licenseInputRef.current?.click()}
                      className="flex items-center gap-2 border border-dashed border-border hover:border-primary/40 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all"
                    >
                      <FileText className="h-4 w-4" />
                      {licenseFile ? licenseFile.name : "Upload PDF document"}
                    </button>
                    {licenseFile && (
                      <button type="button" onClick={() => setLicenseFile(null)} className="text-[11px] text-muted-foreground hover:text-destructive mt-1 block transition-colors">
                        Remove
                      </button>
                    )}
                    <input ref={licenseInputRef} type="file" accept=".pdf" className="hidden" onChange={e => setLicenseFile(e.target.files?.[0] ?? null)} />
                  </Field>

                  <div className="flex items-start gap-3 bg-sky-500/5 border border-sky-500/20 rounded-xl px-4 py-3">
                    <Shield className="h-4 w-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Agency accounts are manually verified. After registration you will receive a verification email within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {/* ── STEP 4 ─────────────────────────────────────────────── */}
              {step === 4 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground mb-1">Finish Registration</h2>
                    <p className="text-sm text-muted-foreground">Review your details and confirm the terms.</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/40 border border-border rounded-2xl p-4">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-3">Summary</p>
                    <div className="space-y-2">
                      {[
                        { label: "Account type", value: isAgency ? "Agency" : isPartner ? "Business Partner" : "Individual" },
                        { label: "Name", value: isAgency ? form.agencyName : `${form.firstName} ${form.lastName}`.trim() },
                        { label: "Email", value: form.email },
                        { label: "Phone", value: `${form.phonePrefix} ${form.phone}` },
                        { label: "Location", value: [form.city, form.region].filter(Boolean).join(", ") },
                      ].filter(r => r.value).map(row => (
                        <div key={row.label} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-muted-foreground">{row.label}</span>
                          <span className="text-xs font-semibold text-foreground text-right">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-3">
                    <div className={`p-4 rounded-2xl border-2 transition-colors ${errors.agreeTerms ? "border-destructive/40 bg-destructive/5" : "border-border"}`}>
                      <Checkbox
                        checked={form.agreeTerms} onChange={v => set("agreeTerms", v)}
                        label="I agree to the Terms of Use and Privacy Policy"
                      />
                      {errors.agreeTerms && <p className="text-xs text-destructive mt-2 ml-8">{errors.agreeTerms}</p>}
                    </div>
                    <div className="p-4 rounded-2xl border border-border">
                      <Checkbox
                        checked={form.agreePublish} onChange={v => set("agreePublish", v)}
                        label="I agree to the public display of my details on the portal"
                        sublabel={form.isAnonymous ? "Since you chose anonymity, only a contact message will be shown." : undefined}
                      />
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
                      {errors.submit}
                    </div>
                  )}

                  <button
                    type="button" onClick={handleSubmit} disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 text-sm"
                  >
                    {loading
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <> Create account and complete registration <ArrowRight className="h-4 w-4" /> </>}
                  </button>
                </div>
              )}

              {/* ── Navigation ─────────────────────────────────────────── */}
              {step < 4 && (
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
                  <button
                    type="button" onClick={back} disabled={step === 1}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <span className="text-xs text-muted-foreground">{step} / {STEPS.length}</span>
                  <button
                    type="button" onClick={next}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-primary/20"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
