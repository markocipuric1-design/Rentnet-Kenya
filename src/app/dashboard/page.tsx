"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Eye, EyeOff, Trash2, CheckCircle, Clock, Home, Save, X, Star, MessageCircle, Camera, Pencil, Globe, Phone, User, Building2, Users, Calendar, Tag, MapPin, ImagePlus, AlertTriangle, Zap, Wrench, ArrowRight, Megaphone, Heart } from "lucide-react";

function YoutubeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
    </svg>
  );
}
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/client";
import { partnerCategoriesData } from "@/lib/content-data";
import { toAgentSlug } from "@/lib/utils";
import { processImage } from "@/lib/process-image";
import { formatPrice } from "@/lib/format-price";

type DayView = { view_date: string; view_count: number };
type ListingViewCount = { listing_id: string; total: number; last_30_days: number };
type ReceivedReview = {
  id: string;
  reviewer_id: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
  reviewer: { full_name: string | null } | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  account_type: string;
  verified: boolean;
  active: boolean | null;
  profile_status: string | null;
  created_at: string;
  youtube_url: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  specializations: string[] | null;
  service_areas: string[] | null;
  employee_count: number | null;
  founded_year: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_expires_at: string | null;
};

type EditForm = {
  full_name: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  founded_year: string;
  employee_count: string;
  specializations: string;
  service_areas: string;
  account_type: string;
};

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;
  if (url.includes("/embed/")) return url;
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const long = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (long) return `https://www.youtube.com/embed/${long[1]}`;
  return null;
}

type Listing = {
  id: string;
  title: string;
  type: string;
  category: string;
  city: string;
  price: number;
  status: string;
  created_at: string;
  slug: string | null;
};

type SavedListing = {
  listing_id: string;
  listings: {
    id: string;
    title: string;
    city: string;
    price: number;
    type: string;
    category: string;
    status: string;
    area: number | null;
    rooms: number | null;
    slug: string | null;
    listing_photos: { url: string; sort_order: number }[];
  } | null;
};

const TYPE_BADGE: Record<string, string> = {
  "For Sale": "bg-primary/10 text-primary",
  "For Rent": "bg-sky-500/10 text-sky-600",
  Buying: "bg-emerald-500/10 text-emerald-600",
  Renting: "bg-amber-500/10 text-amber-600",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-500/10 text-emerald-600" },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  sold: { label: "Sold", color: "bg-primary/10 text-primary" },
  rented: { label: "Rented", color: "bg-sky-500/10 text-sky-600" },
};

const ROLE_LABEL: Record<string, string> = {
  fizicna_oseba: "Individual",
  agencija: "Agency",
  administrator: "Administrator",
};
const ROLE_COLOR: Record<string, string> = {
  fizicna_oseba: "bg-emerald-500/10 text-emerald-600",
  agencija: "bg-sky-500/10 text-sky-600",
  administrator: "bg-primary/10 text-primary",
};

function SparklineChart({ dailyViews }: { dailyViews: DayView[] }) {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });
  const map = Object.fromEntries(dailyViews.map((d) => [d.view_date, d.view_count]));
  const counts = days.map((d) => map[d] ?? 0);
  const max = Math.max(...counts, 1);

  return (
    <div>
      <div className="flex items-end gap-0.5 h-14">
        {counts.map((count, i) => (
          <div
            key={days[i]}
            className="group relative flex-1 flex items-end"
            style={{ height: "100%" }}
          >
            <div
              className="w-full bg-primary/25 hover:bg-primary/60 rounded-sm transition-colors cursor-default"
              style={{ height: `${Math.max((count / max) * 100, count > 0 ? 8 : 3)}%` }}
              title={`${days[i]}: ${count} ogledov`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
        <span>{new Date(days[0]).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</span>
        <span>today</span>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; count: number; colorClass: string }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-32 text-right flex-shrink-0">{d.label}</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${d.colorClass}`}
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-foreground w-5 text-right flex-shrink-0">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProfilPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingLimit, setListingLimit] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dailyViews, setDailyViews] = useState<DayView[]>([]);
  const [listingViewCounts, setListingViewCounts] = useState<ListingViewCount[]>([]);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeSaving, setYoutubeSaving] = useState(false);
  const [youtubeEditMode, setYoutubeEditMode] = useState(false);
  const [receivedReviews, setReceivedReviews] = useState<ReceivedReview[]>([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [dashUserId, setDashUserId] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({ full_name: "", phone: "", website: "", instagram: "", facebook: "", linkedin: "", founded_year: "", employee_count: "", specializations: "", service_areas: "", account_type: "fizicna_oseba" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [myPartners, setMyPartners] = useState<{ id: string; category: string; subcategory: string | null; company_name: string; city: string; verified: boolean; created_at: string }[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) { router.push("/login?redirect=/dashboard"); return; }
        setDashUserId(user.id);

        const { data: prof, error: profError } = await supabase
          .from("profiles").select("*").eq("id", user.id).single();

        if (profError && profError.code !== "PGRST116") {
          setError(`Error loading profile: ${profError.message}`);
          return;
        }

        if (!prof) {
          const { data: newProf, error: upsertError } = await supabase
            .from("profiles").upsert({
              id: user.id,
              full_name: user.user_metadata?.full_name ?? null,
              email: user.email ?? null,
              phone: user.user_metadata?.phone ?? null,
              account_type: user.user_metadata?.account_type ?? "fizicna_oseba",
              slug: toAgentSlug(user.user_metadata?.full_name),
            }).select().single();
          if (upsertError) {
            setError(`Error creating profile: ${upsertError.message}`);
            return;
          }
          setProfile(newProf);
          setYoutubeInput(newProf?.youtube_url ?? "");
        } else {
          setProfile(prof);
          setYoutubeInput(prof.youtube_url ?? "");
        }

        const [{ data: list }, { data: daily }, { data: viewCounts }, { data: reviews }, { data: settingsRows }, { data: savedRows }] = await Promise.all([
          supabase.from("listings")
            .select("id, title, type, category, city, price, status, created_at, slug")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase.rpc("get_my_daily_views", { days_back: 30 }),
          supabase.rpc("get_my_listing_view_counts"),
          supabase
            .from("reviews")
            .select("id, reviewer_id, rating, title, body, created_at, reviewer:profiles!reviewer_id(full_name)")
            .eq("reviewed_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase.from("site_settings").select("key, value"),
          supabase
            .from("saved_listings")
            .select("listing_id, listings(id, title, type, category, city, price, status, area, rooms, slug, listing_photos(url, sort_order))")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(24),
        ]);

        const s = Object.fromEntries((settingsRows ?? []).map(r => [r.key, r.value]));
        const accountType = prof?.account_type ?? "fizicna_oseba";
        const limitKey = `limit_${accountType}`;
        setListingLimit(parseInt(s[limitKey] ?? "3"));

        setListings(list ?? []);
        setDailyViews(daily ?? []);
        setListingViewCounts(viewCounts ?? []);
        setReceivedReviews((reviews as unknown as ReceivedReview[]) ?? []);
        setSavedListings((savedRows as unknown as SavedListing[]) ?? []);

        const { data: partnerRows } = await supabase
          .from("partners")
          .select("id, category, subcategory, company_name, city, verified, created_at")
          .eq("email", user.email)
          .order("created_at", { ascending: false });
        setMyPartners(partnerRows ?? []);

        // Unread message count
        const { data: convs } = await supabase
          .from("conversations")
          .select("id")
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);
        if (convs?.length) {
          const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .in("conversation_id", convs.map((c) => c.id))
            .neq("sender_id", user.id)
            .is("read_at", null);
          setUnreadMsgCount(count ?? 0);
        }
      } catch (e) {
        setError(`Unexpected error: ${e}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // Live unread count — updates without page refresh when a message arrives
  useEffect(() => {
    if (!dashUserId) return;
    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async () => {
        const { data: convs } = await supabase.from("conversations").select("id")
          .or(`participant_1.eq.${dashUserId},participant_2.eq.${dashUserId}`);
        if (!convs?.length) return;
        const { count } = await supabase.from("messages").select("id", { count: "exact", head: true })
          .in("conversation_id", convs.map(c => c.id))
          .neq("sender_id", dashUserId).is("read_at", null);
        setUnreadMsgCount(count ?? 0);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dashUserId]);

  const handleSaveYoutube = async () => {
    const embedUrl = youtubeInput.trim() ? getYouTubeEmbedUrl(youtubeInput.trim()) : null;
    if (youtubeInput.trim() && !embedUrl) return;
    setYoutubeSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ youtube_url: youtubeInput.trim() || null }).eq("id", profile!.id);
    setProfile((p) => p ? { ...p, youtube_url: youtubeInput.trim() || null } : p);
    setYoutubeSaving(false);
    setYoutubeEditMode(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    setAvatarUploading(true);
    const supabase = createClient();
    const processed = await processImage(file, 400);
    const path = `${profile.id}/avatar.webp`;
    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, processed, { upsert: true, contentType: "image/webp" });
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl + `?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
      setProfile((p) => p ? { ...p, avatar_url: url } : p);
    }
    setAvatarUploading(false);
    e.target.value = "";
  };

  const openEdit = () => {
    if (!profile) return;
    setEditForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      website: profile.website ?? "",
      instagram: profile.instagram ?? "",
      facebook: profile.facebook ?? "",
      linkedin: profile.linkedin ?? "",
      founded_year: profile.founded_year?.toString() ?? "",
      employee_count: profile.employee_count?.toString() ?? "",
      specializations: (profile.specializations ?? []).join(", "),
      service_areas: (profile.service_areas ?? []).join(", "),
      account_type: profile.account_type,
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    const supabase = createClient();
    const upgradingToAgency = editForm.account_type === "agencija" && profile.account_type !== "agencija";

    // Never save account_type change to agencija directly — payment required
    const updates: Record<string, unknown> = {
      full_name: editForm.full_name.trim() || null,
      phone: editForm.phone.trim() || null,
      slug: toAgentSlug(editForm.full_name.trim()),
      ...(!upgradingToAgency && { account_type: editForm.account_type }),
    };
    if (editForm.account_type === "agencija") {
      updates.website = editForm.website.trim() || null;
      updates.instagram = editForm.instagram.trim() || null;
      updates.facebook = editForm.facebook.trim() || null;
      updates.linkedin = editForm.linkedin.trim() || null;
      updates.founded_year = editForm.founded_year ? parseInt(editForm.founded_year) : null;
      updates.employee_count = editForm.employee_count ? parseInt(editForm.employee_count) : null;
      updates.specializations = editForm.specializations.trim()
        ? editForm.specializations.split(",").map(s => s.trim()).filter(Boolean)
        : null;
      updates.service_areas = editForm.service_areas.trim()
        ? editForm.service_areas.split(",").map(s => s.trim()).filter(Boolean)
        : null;
    }
    await supabase.from("profiles").update(updates).eq("id", profile.id);
    setProfile(p => p ? { ...p, ...(updates as Partial<Profile>) } : p);

    if (upgradingToAgency) {
      setSavingProfile(false);
      setIsEditing(false);
      router.push("/pricing");
      return;
    }

    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => { setProfileSaved(false); setIsEditing(false); }, 1800);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) return;
    setCoverUploading(true);
    const supabase = createClient();
    const processed = await processImage(file, 1200);
    const path = `${profile.id}/cover.webp`;
    const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, processed, { upsert: true, contentType: "image/webp" });
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl + `?t=${Date.now()}`;
      await supabase.from("profiles").update({ cover_url: url }).eq("id", profile.id);
      setProfile(p => p ? { ...p, cover_url: url } : p);
    }
    setCoverUploading(false);
    e.target.value = "";
  };

  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubscribe = () => {
    router.push("/pricing");
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "draft" : "active";
    const supabase = createClient();
    await supabase.from("listings").update({ status: newStatus }).eq("id", id);
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
  };

  const handleUnsave = async (listingId: string) => {
    if (!profile) return;
    const supabase = createClient();
    await supabase.from("saved_listings").delete().eq("user_id", profile.id).eq("listing_id", listingId);
    setSavedListings(prev => prev.filter(s => s.listing_id !== listingId));
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    const res = await fetch("/api/user/delete-account", { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json() as { error?: string };
      alert(`Could not delete account: ${error ?? "unknown error"}`);
      setDeletingAccount(false);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-5 py-4 rounded-2xl mb-4">
            {error}
          </div>
          <button onClick={() => window.location.reload()} className="text-sm text-primary hover:underline">
            Try again
          </button>
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );

  const total = listings.length;
  const active = listings.filter((l) => l.status === "active").length;
  const draft = listings.filter((l) => l.status === "draft").length;
  const sold = listings.filter((l) => l.status === "sold" || l.status === "rented").length;
  const totalViews = listingViewCounts.reduce((s, v) => s + Number(v.total), 0);
  const viewsThisMonth = listingViewCounts.reduce((s, v) => s + Number(v.last_30_days), 0);
  const viewMap = Object.fromEntries(listingViewCounts.map((v) => [v.listing_id, v]));

  const typeData = [
    { label: "For Sale", colorClass: "bg-primary" },
    { label: "For Rent", colorClass: "bg-sky-500" },
    { label: "Buying", colorClass: "bg-emerald-500" },
    { label: "Renting", colorClass: "bg-amber-500" },
  ].map((t) => ({ ...t, count: listings.filter((l) => l.type === t.label).length }))
   .filter((t) => t.count > 0);

  const categoryData = ["Apartment", "House", "Commercial", "Land plot", "Garage"]
    .map((c) => ({ label: c, count: listings.filter((l) => l.category === c).length, colorClass: "bg-primary" }))
    .filter((c) => c.count > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Subscription success banner */}
        {searchParams.get("subscription") === "success" && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-4 mb-6">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Subscription successfully activated! Welcome to the Agency plan.</p>
          </div>
        )}

        {/* Agency — no active subscription warning */}
        {profile.account_type === "agencija" && (
          profile.subscription_status !== "active" ||
          !profile.subscription_expires_at ||
          new Date(profile.subscription_expires_at) <= new Date()
        ) && (
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4 mb-6">
            <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Your agency has no active subscription</p>
              <p className="text-xs text-amber-600/80 mt-0.5">Without an active subscription you cannot publish listings. Activate the Agency plan for KES 25,000/year.</p>
            </div>
            <button
              onClick={handleSubscribe}
              className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              Activate
            </button>
          </div>
        )}

        {/* Pending approval banner */}
        {profile.profile_status === "pending" && (
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4 mb-6">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Your profile is awaiting approval</p>
              <p className="text-xs text-amber-600/80 mt-0.5">An administrator will review and approve your profile within 24 hours. Until then your profile is not publicly visible.</p>
            </div>
          </div>
        )}
        {profile.profile_status === "suspended" && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-2xl px-5 py-4 mb-6">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-destructive">Your profile has been suspended</p>
              <p className="text-xs text-destructive/70 mt-0.5">Your profile is not publicly visible. Contact the site administrator for more information.</p>
            </div>
          </div>
        )}

        {/* Profile header */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with edit overlay */}
          <div className="relative flex-shrink-0 group">
            <div className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 ${!profile.avatar_url ? "bg-primary/10" : ""}`}>
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-primary">
                  {(profile.full_name?.[0] ?? "?").toUpperCase()}
                </span>
              )}
            </div>
            {/* Camera overlay */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              title="Change photo"
              className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
            >
              {avatarUploading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Camera className="h-5 w-5 text-white" />}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-foreground">{profile.full_name || "—"}</h1>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLOR[profile.account_type] ?? "bg-muted text-muted-foreground"}`}>
                {ROLE_LABEL[profile.account_type] ?? profile.account_type}
              </span>
              {profile.account_type === "agencija" && (
                profile.verified
                  ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  : <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                      <Clock className="h-3 w-3" /> Pending verification
                    </span>
              )}
            </div>
            {profile.email && <p className="text-sm text-muted-foreground">{profile.email}</p>}
            {profile.phone && <p className="text-sm text-muted-foreground">{profile.phone}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Member since {new Date(profile.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {profile.account_type === "agencija" &&
              profile.subscription_status === "active" &&
              profile.subscription_expires_at &&
              new Date(profile.subscription_expires_at) > new Date() && (
              <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold px-4 py-2.5 rounded-xl text-sm">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>Active until {new Date(profile.subscription_expires_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            )}
            <button
              onClick={openEdit}
              className="flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent text-foreground font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              <Pencil className="h-4 w-4 text-muted-foreground" /> Edit Profile
            </button>
            <div ref={moreMenuRef} className="relative">
              <button
                onClick={() => setShowMoreMenu((v) => !v)}
                className="flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent text-foreground font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
              >
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-foreground/60" />
                  <span className="w-1 h-1 rounded-full bg-foreground/60" />
                  <span className="w-1 h-1 rounded-full bg-foreground/60" />
                </span>
                More
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-30">
                  <Link
                    href="/dashboard/my-ads"
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Megaphone className="h-4 w-4 text-primary flex-shrink-0" />
                    My Ads
                  </Link>
                  <Link
                    href="/dashboard/my-partner-profile"
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors border-t border-border"
                  >
                    <User className="h-4 w-4 text-primary flex-shrink-0" />
                    Agent Profile
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/dashboard/messages"
              className="relative flex items-center gap-2 border border-border hover:border-primary/40 hover:bg-accent text-foreground font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              Messages
              {unreadMsgCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadMsgCount > 9 ? "9+" : unreadMsgCount}
                </span>
              )}
            </Link>
            <Link
              href="/post-listing"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/25"
            >
              <Plus className="h-4 w-4" /> New Listing
            </Link>
          </div>
        </div>

        {/* Edit profile panel */}
        {isEditing && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Role switcher */}
            {profile.account_type !== "administrator" && (
              <div className="mb-5 pb-5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Account type
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "fizicna_oseba", label: "Individual", desc: "1 listing · Free", icon: <User className="h-4 w-4" /> },
                    { value: "agencija", label: "Agency", desc: "999 listings · KES 25,000/yr", icon: <Building2 className="h-4 w-4" /> },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditForm(f => ({ ...f, account_type: opt.value }))}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        editForm.account_type === opt.value
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${editForm.account_type === opt.value ? "bg-primary/15" : "bg-muted"}`}>
                        {opt.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{opt.label}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {editForm.account_type !== profile.account_type && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    {editForm.account_type === "agencija"
                      ? "After switching you will need to activate the Agency plan (KES 25,000/year) to publish listings."
                      : "After switching to Individual your listing limit will be reduced to 1. An active subscription will not be cancelled automatically."}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ime */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {editForm.account_type === "agencija" ? "Agency Name" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Janez Novak"
                  className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+386 31 123 456"
                  className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Agency-specific fields */}
              {editForm.account_type === "agencija" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))}
                      placeholder="https://www.agencija.si"
                      className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={editForm.instagram}
                      onChange={e => setEditForm(f => ({ ...f, instagram: e.target.value }))}
                      placeholder="https://instagram.com/agencija"
                      className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={editForm.facebook}
                      onChange={e => setEditForm(f => ({ ...f, facebook: e.target.value }))}
                      placeholder="https://facebook.com/agencija"
                      className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={editForm.linkedin}
                      onChange={e => setEditForm(f => ({ ...f, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/company/agencija"
                      className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Year Founded
                    </label>
                    <input
                      type="number"
                      value={editForm.founded_year}
                      onChange={e => setEditForm(f => ({ ...f, founded_year: e.target.value }))}
                      placeholder="2005"
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Number of Employees
                    </label>
                    <input
                      type="number"
                      value={editForm.employee_count}
                      onChange={e => setEditForm(f => ({ ...f, employee_count: e.target.value }))}
                      placeholder="10"
                      min="1"
                      className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> Specialisations <span className="font-normal">(separate with a comma)</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.specializations}
                      onChange={e => setEditForm(f => ({ ...f, specializations: e.target.value }))}
                      placeholder="Apartments, Houses, Commercial"
                      className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Service Areas <span className="font-normal">(separate with a comma)</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.service_areas}
                      onChange={e => setEditForm(f => ({ ...f, service_areas: e.target.value }))}
                      placeholder="Ljubljana, Maribor, Celje"
                      className="w-full border border-border bg-muted/40 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Cover photo */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <ImagePlus className="h-3.5 w-3.5" /> Profile Cover Photo
                    </label>
                    {profile.cover_url ? (
                      <div className="relative rounded-xl overflow-hidden h-28 mb-2 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => coverInputRef.current?.click()}
                          disabled={coverUploading}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-semibold"
                        >
                          {coverUploading
                            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <><Camera className="h-4 w-4" /> Change photo</>}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => coverInputRef.current?.click()}
                        disabled={coverUploading}
                        className="w-full h-20 border-2 border-dashed border-border hover:border-primary/40 rounded-xl flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
                      >
                        {coverUploading
                          ? <span className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
                          : <><ImagePlus className="h-4 w-4" /> Add cover photo</>}
                      </button>
                    )}
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-border">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-muted text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${profileSaved ? "bg-emerald-500 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground"} disabled:opacity-60`}
              >
                {savingProfile
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save className="h-4 w-4" />}
                {savingProfile ? "Saving…" : profileSaved ? "✓ Shranjeno" : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* YouTube video — agencies only */}
        {profile.account_type === "agencija" && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <YoutubeLogo className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-bold text-foreground">Predstavitveni video</h3>
              </div>
              {!youtubeEditMode ? (
                <button
                  onClick={() => setYoutubeEditMode(true)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {profile.youtube_url ? "Edit" : "Add video"}
                </button>
              ) : (
                <button onClick={() => { setYoutubeEditMode(false); setYoutubeInput(profile.youtube_url ?? ""); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {youtubeEditMode ? (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  className="flex-1 border border-border bg-background rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
                />
                <button
                  onClick={handleSaveYoutube}
                  disabled={youtubeSaving || (!!youtubeInput.trim() && !getYouTubeEmbedUrl(youtubeInput))}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  {youtubeSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                  Shrani
                </button>
              </div>
            ) : profile.youtube_url && getYouTubeEmbedUrl(profile.youtube_url) ? (
              <div className="rounded-xl overflow-hidden aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(profile.youtube_url)!}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Predstavitveni video"
                />
              </div>
            ) : (
              <div
                onClick={() => setYoutubeEditMode(true)}
                className="border-2 border-dashed border-border hover:border-primary/40 rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors group"
              >
                <YoutubeLogo className="h-8 w-8 text-muted-foreground/40 group-hover:text-red-400 transition-colors" />
                <p className="text-sm text-muted-foreground">Click to add a YouTube video</p>
                <p className="text-xs text-muted-foreground/60">Shown to visitors on your profile</p>
              </div>
            )}

            {youtubeEditMode && youtubeInput.trim() && !getYouTubeEmbedUrl(youtubeInput) && (
              <p className="text-xs text-destructive mt-2">Invalid YouTube URL. Example: https://www.youtube.com/watch?v=...</p>
            )}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total listings", value: total, valueColor: "text-foreground" },
            { label: "Aktivni", value: active, valueColor: "text-emerald-500" },
            { label: "Drafts", value: draft, valueColor: "text-muted-foreground" },
            { label: "Sold / Rented", value: sold, valueColor: "text-primary" },
            { label: "Total views", value: totalViews, valueColor: "text-sky-500" },
            { label: "Views (30 days)", value: viewsThisMonth, valueColor: "text-amber-500" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
              <div className={`text-3xl font-extrabold mb-1 ${s.valueColor}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Views sparkline */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Views – last 30 days</h3>
            <Link href="/dashboard/analytics" className="text-xs text-primary hover:underline font-medium">
              Detailed analytics →
            </Link>
          </div>
          {totalViews > 0
            ? <SparklineChart dailyViews={dailyViews} />
            : <p className="text-sm text-muted-foreground text-center py-4">No views yet. Once your listing is visited, the chart will appear here.</p>
          }
        </div>

        {/* Advertise promo — shown to agencies and users with active listings */}
        {(profile.account_type === "agencija" || active > 0) && (
          <div className="mb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-amber-500/5 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Boost your reach — advertise on the platform</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                Place a sponsored banner on property pages, the listings grid, or partner directories. Starting from KES 1,000/week.
              </p>
            </div>
            <Link
              href="/advertise"
              className="flex-shrink-0 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20 whitespace-nowrap"
            >
              <Megaphone className="h-3.5 w-3.5" /> Book an ad
            </Link>
          </div>
        )}

        {/* Charts — only show when there's data */}
        {total > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {typeData.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm font-bold text-foreground mb-5">Razporeditev po tipu</h3>
                <BarChart data={typeData} />
              </div>
            )}
            {categoryData.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm font-bold text-foreground mb-5">Razporeditev po vrsti</h3>
                <BarChart data={categoryData} />
              </div>
            )}
          </div>
        )}

        {/* Status breakdown — only show when there's data */}
        {total > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-bold text-foreground mb-5">Listings by Status</h3>
            <div className="flex items-end gap-3 h-24">
              {[
                { label: "Aktivni", count: active, color: "bg-emerald-500" },
                { label: "Drafts", count: draft, color: "bg-border" },
                { label: "Sold", count: sold, color: "bg-primary" },
              ].map((bar) => {
                const pct = total > 0 ? (bar.count / total) * 100 : 0;
                return (
                  <div key={bar.label} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-xs font-bold text-foreground">{bar.count}</span>
                    <div className="w-full bg-muted rounded-t-lg overflow-hidden" style={{ height: "64px" }}>
                      <div
                        className={`w-full ${bar.color} rounded-t-lg transition-all duration-700`}
                        style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Received reviews */}
        {receivedReviews.length > 0 && (() => {
          const avg = receivedReviews.reduce((s, r) => s + r.rating, 0) / receivedReviews.length;
          return (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-foreground">Received reviews</h3>
                  <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-bold">{avg.toFixed(1)}</span>
                    <span className="text-[10px] text-amber-600/70">({receivedReviews.length})</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {receivedReviews.map((r) => (
                  <div key={r.id} className="flex gap-3 p-4 bg-muted/40 rounded-xl border border-border">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {r.reviewer?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{r.reviewer?.full_name ?? "Anonimni"}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {new Date(r.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {r.title && <p className="text-xs font-medium text-foreground mb-0.5">{r.title}</p>}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{r.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Listings table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground text-sm">My Listings</h2>
            <span className="text-xs text-muted-foreground">{total} total</span>
          </div>

          {/* Usage bar */}
          {(() => {
            const active = listings.filter(l => l.status === "active" || l.status === "pending").length;
            const pct = Math.min((active / listingLimit) * 100, 100);
            const near = pct >= 80;
            const full = active >= listingLimit;
            return (
              <div className="px-5 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Active listings</span>
                  <span className={`text-xs font-bold ${full ? "text-destructive" : near ? "text-amber-600" : "text-foreground"}`}>
                    {active} / {listingLimit}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${full ? "bg-destructive" : near ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {full && (
                  <p className="text-[11px] text-destructive mt-1.5">You've reached your listing limit. Delete a listing to post a new one.</p>
                )}
                {near && !full && (
                  <p className="text-[11px] text-amber-600 mt-1.5">You're approaching your listing limit.</p>
                )}
              </div>
            );
          })()}

          {listings.length === 0 ? (
            <div className="p-12 text-center">
              <Home className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-4">You have no published listings yet.</p>
              <Link
                href="/post-listing"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/25"
              >
                <Plus className="h-4 w-4" /> Add listing
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Price</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Views</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((l) => {
                  const status = STATUS_CONFIG[l.status] ?? { label: l.status, color: "bg-muted text-muted-foreground" };
                  return (
                    <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <a
                          href={`/properties/${l.slug ?? l.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-primary transition-colors truncate max-w-[180px] block"
                        >
                          {l.title}
                        </a>
                        <p className="text-xs text-muted-foreground">{l.city} · {new Date(l.created_at).toLocaleDateString("en-KE")}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[l.type] ?? "bg-muted text-muted-foreground"}`}>
                          {l.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-foreground hidden md:table-cell">
                        {formatPrice(l.price, l.type)}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{viewMap[l.id]?.total ?? 0}</span>
                          <span className="text-[10px] text-muted-foreground">{viewMap[l.id]?.last_30_days ?? 0} this month</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/dashboard/edit-listing/${l.id}`}
                            title="Edit listing"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-primary transition-all"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(l.id, l.status)}
                            title={l.status === "active" ? "Deactivate" : "Activate"}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                          >
                            {l.status === "active" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(l.id)}
                            disabled={deleting === l.id}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* My Partner Listings */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">My Partner Listings</h2>
            </div>
          </div>

          {myPartners.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Wrench className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="font-semibold text-foreground mb-1">No partner registrations yet</p>
              <p className="text-sm text-muted-foreground mb-5">Register your business in one of our partner directories to get discovered by clients.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {partnerCategoriesData.slice(0, 4).map((cat) => (
                  <a
                    key={cat.slug}
                    href={`/partners/${cat.slug}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:text-primary text-muted-foreground transition-all"
                  >
                    {cat.title}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myPartners.map((p) => {
                const cat = partnerCategoriesData.find((c) => c.slug === p.category);
                return (
                  <div key={p.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.verified ? "text-emerald-600 bg-emerald-500/10" : "text-amber-600 bg-amber-500/10"}`}>
                        {p.verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <p className="font-bold text-foreground text-sm mb-0.5">{p.company_name}</p>
                    {p.subcategory && <p className="text-xs text-primary font-semibold">{p.subcategory}</p>}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                      {p.city}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      {cat && (
                        <a
                          href={`/partners/${p.category}`}
                          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          View directory <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                      {p.category === "rentnet-agents" && (
                        <Link
                          href="/dashboard/my-partner-profile"
                          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                        >
                          Edit profile <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Saved Listings */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg font-bold text-foreground">Saved Listings</h2>
              {savedListings.length > 0 && (
                <span className="text-xs font-semibold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">{savedListings.length}</span>
              )}
            </div>
          </div>

          {savedListings.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="font-semibold text-foreground mb-1">No saved listings yet</p>
              <p className="text-sm text-muted-foreground mb-5">Browse listings and tap the heart icon to save them here.</p>
              <Link
                href="/listings"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Browse listings <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedListings.map((s) => {
                const l = s.listings;
                if (!l) return null;
                const photo = l.listing_photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
                const href = `/properties/${l.slug ?? l.id}`;
                const typeBadge = TYPE_BADGE[l.type] ?? "bg-muted text-muted-foreground";
                const statusCfg = STATUS_CONFIG[l.status] ?? { label: l.status, color: "bg-muted text-muted-foreground" };
                return (
                  <div key={s.listing_id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all group">
                    {/* Image or color bar */}
                    {photo ? (
                      <div className="relative h-36 overflow-hidden">
                        <img src={photo} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadge}`}>
                          {l.type}
                        </span>
                        <button
                          onClick={() => handleUnsave(s.listing_id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform"
                          title="Remove from saved"
                        >
                          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-1.5 bg-primary/30" />
                    )}

                    <div className="p-4">
                      {/* Header row when no image */}
                      {!photo && (
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadge}`}>{l.type}</span>
                          <button onClick={() => handleUnsave(s.listing_id)} title="Remove from saved" className="text-rose-400 hover:text-rose-600 transition-colors">
                            <Heart className="h-3.5 w-3.5 fill-rose-400" />
                          </button>
                        </div>
                      )}

                      <Link href={href}>
                        <p className="font-bold text-sm text-foreground leading-tight mb-1.5 hover:text-primary transition-colors line-clamp-2">{l.title}</p>
                      </Link>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {l.city}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-primary font-bold text-sm">{formatPrice(l.price, l.type)}</p>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                          {l.rooms != null && (
                            <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded-full">{l.rooms} bd</span>
                          )}
                          {l.area != null && (
                            <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded-full">{l.area} m²</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.color}`}>{statusCfg.label}</span>
                        <Link href={href} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-10 mb-4">
          <div className="bg-card border border-destructive/20 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-destructive/10 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h3 className="text-sm font-bold text-foreground">Danger Zone</h3>
            </div>
            <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-foreground">Delete my account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently removes your profile, listings and all associated data. This cannot be undone.
                </p>
              </div>
              {confirmDeleteAccount ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-destructive font-semibold whitespace-nowrap">Are you sure?</span>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="flex items-center gap-1.5 text-xs font-bold bg-destructive hover:bg-destructive/90 text-white px-3 py-2 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {deletingAccount
                      ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                    {deletingAccount ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteAccount(false)}
                    className="text-xs font-semibold border border-border px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteAccount(true)}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 px-3 py-2 rounded-xl transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete account
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
