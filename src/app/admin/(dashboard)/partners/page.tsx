"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Pencil, CheckCircle, XCircle, MapPin, Wrench, Globe, Phone, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { partnerCategoriesData } from "@/lib/content-data";
import { PartnerRegistrationForm, ExistingPartner } from "@/components/ui/partner-registration-form";

async function adminUpdatePartner(id: string, payload: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch("/api/admin/update-partner", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    if (res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return (data as { error?: string }).error ?? `HTTP ${res.status}`;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

type Partner = {
  id: string;
  category: string;
  subcategory: string | null;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  city: string;
  description: string | null;
  verified: boolean;
  created_at: string;
  logo_url: string | null;
  promo_banner_url: string | null;
  metadata: Record<string, unknown> | null;
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("partners")
        .select("id, category, subcategory, company_name, contact_name, email, phone, website, city, description, verified, created_at, logo_url, promo_banner_url, metadata")
        .order("created_at", { ascending: false });
      setPartners(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = partners.filter((p) => {
    const matchSearch = !search ||
      p.company_name.toLowerCase().includes(search.toLowerCase()) ||
      p.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || p.category === filterCategory;
    const matchStatus = filterStatus === "all" || (filterStatus === "verified" ? p.verified : !p.verified);
    return matchSearch && matchCategory && matchStatus;
  });

  const handleToggleVerified = async (id: string, current: boolean) => {
    setToggling(id);
    const supabase = createClient();
    const { error } = await supabase.from("partners").update({ verified: !current }).eq("id", id);
    if (!error) setPartners((prev) => prev.map((p) => p.id === id ? { ...p, verified: !current } : p));
    setToggling(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this partner listing? This cannot be undone.")) return;
    setDeleting(id);
    const supabase = createClient();

    const partner = partners.find((p) => p.id === id);
    if (partner) {
      const toPath = (url: string | null | undefined) => {
        if (!url) return null;
        const marker = "/partner-assets/";
        const idx = url.indexOf(marker);
        return idx !== -1 ? url.slice(idx + marker.length) : null;
      };
      const paths = [
        toPath(partner.logo_url),
        toPath(partner.promo_banner_url),
        toPath((partner.metadata as { catalog_url?: string } | null)?.catalog_url),
      ].filter((p): p is string => !!p);
      if (paths.length > 0) {
        await supabase.storage.from("partner-assets").remove(paths);
      }
    }

    const { error } = await supabase.from("partners").delete().eq("id", id);
    if (!error) setPartners((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  const refetchPartners = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("partners")
      .select("id, category, subcategory, company_name, contact_name, email, phone, website, city, description, verified, created_at, logo_url, promo_banner_url, metadata")
      .order("created_at", { ascending: false });
    setPartners(data ?? []);
  };

  const pendingCount = partners.filter((p) => !p.verified).length;

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Partners</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {partners.length} total
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                {pendingCount} pending approval
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by company, contact, email or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border bg-card rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-border bg-card rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 appearance-none cursor-pointer"
        >
          <option value="all">All categories</option>
          {partnerCategoriesData.map((c) => (
            <option key={c.slug} value={c.slug}>{c.title}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-border bg-card rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 appearance-none cursor-pointer"
        >
          <option value="all">All statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Company</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">
                  No partners found.
                </td>
              </tr>
            ) : filtered.map((p) => {
              const categoryLabel = partnerCategoriesData.find((c) => c.slug === p.category)?.title ?? p.category;
              return (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground truncate max-w-[160px]">{p.company_name}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-KE")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{categoryLabel}</span>
                    {p.subcategory && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{p.subcategory}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-foreground font-medium">{p.contact_name}</p>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate max-w-[140px]">{p.email}</span>
                    </div>
                    {p.phone && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" /> {p.phone}
                      </div>
                    )}
                    {p.website && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Globe className="h-3 w-3 flex-shrink-0" />
                        <a href={p.website} target="_blank" rel="noopener noreferrer" className="truncate max-w-[140px] hover:text-primary transition-colors">
                          {p.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" /> {p.city}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.verified ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {p.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleToggleVerified(p.id, p.verified)}
                        disabled={toggling === p.id}
                        title={p.verified ? "Revoke verification" : "Approve"}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-40 ${
                          p.verified
                            ? "border-border hover:border-amber-400/40 hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600"
                            : "border-border hover:border-emerald-400/40 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600"
                        }`}
                      >
                        {toggling === p.id
                          ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          : p.verified
                            ? <><XCircle className="h-3.5 w-3.5" /> Revoke</>
                            : <><CheckCircle className="h-3.5 w-3.5" /> Approve</>}
                      </button>
                      <button
                        onClick={() => setEditPartner(p)}
                        title="Edit"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition-all text-xs font-medium"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        title="Delete"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all text-xs font-medium disabled:opacity-40"
                      >
                        {deleting === p.id
                          ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editPartner && (
        <PartnerRegistrationForm
          category={editPartner.category}
          subcategories={partnerCategoriesData.find((c) => c.slug === editPartner.category)?.subcategories}
          mode="edit"
          existingPartner={{
            id: editPartner.id,
            subcategory: editPartner.subcategory,
            company_name: editPartner.company_name,
            contact_name: editPartner.contact_name,
            email: editPartner.email,
            phone: editPartner.phone,
            website: editPartner.website,
            city: editPartner.city,
            description: editPartner.description,
            logo_url: editPartner.logo_url,
            promo_banner_url: editPartner.promo_banner_url,
            metadata: editPartner.metadata as ExistingPartner["metadata"],
          }}
          saveHandler={adminUpdatePartner}
          onClose={async () => {
            setEditPartner(null);
            await refetchPartners();
          }}
        />
      )}
    </div>
  );
}
