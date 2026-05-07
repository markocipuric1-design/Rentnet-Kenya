"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Eye, EyeOff, Pencil, X, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format-price";

type Listing = {
  id: string;
  title: string;
  type: string;
  category: string;
  city: string;
  price: number;
  status: string;
  created_at: string;
  user_id: string;
};

const TYPE_COLORS: Record<string, string> = {
  "For Sale": "bg-primary/10 text-primary",
  "For Rent": "bg-sky-500/10 text-sky-600",
  "Buying": "bg-emerald-500/10 text-emerald-600",
  "Renting": "bg-amber-500/10 text-amber-500",
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
];

function EditModal({ listing, onClose, onSave }: {
  listing: Listing;
  onClose: () => void;
  onSave: (updated: Partial<Listing>) => Promise<void>;
}) {
  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(String(listing.price));
  const [city, setCity] = useState(listing.city);
  const [status, setStatus] = useState(listing.status);
  const [type, setType] = useState(listing.type);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ title, price: Number(price), city, status, type });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">Edit listing</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Price (KES)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                {["For Sale", "For Rent", "Buy", "Rent"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border hover:bg-accent text-foreground font-semibold py-2.5 rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("vse");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editListing, setEditListing] = useState<Listing | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, type, category, city, price, status, created_at, user_id")
        .order("created_at", { ascending: false });
      if (error) console.error("Listings fetch error:", error.message);
      setListings(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = listings.filter((l) => {
    const matchSearch = !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "vse" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleToggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "draft" : "active";
    const supabase = createClient();
    const { error } = await supabase.from("listings").update({ status: newStatus }).eq("id", id);
    if (!error) setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (!error) setListings((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
  };

  const handleSaveEdit = async (updated: Partial<Listing>) => {
    if (!editListing) return;
    const supabase = createClient();
    const { error } = await supabase.from("listings").update(updated).eq("id", editListing.id);
    if (!error) setListings((prev) => prev.map((l) => l.id === editListing.id ? { ...l, ...updated } : l));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-600";
      case "sold": return "bg-primary/10 text-primary";
      case "rented": return "bg-sky-500/10 text-sky-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Listings</h1>
        <p className="text-muted-foreground text-sm mt-1">{listings.length} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border bg-card rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-border bg-card rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 appearance-none cursor-pointer"
        >
          <option value="vse">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">City</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">
                  No results.
                </td>
              </tr>
            ) : filtered.map((l) => (
              <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-foreground truncate max-w-[200px]">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("en-KE")}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[l.type] ?? "bg-muted text-muted-foreground"}`}>
                    {l.type}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground text-sm">{l.city}</td>
                <td className="px-5 py-3.5 font-semibold text-foreground">{formatPrice(l.price, l.type)}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadge(l.status)}`}>
                    {getStatusLabel(l.status)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    {/* Toggle active/draft */}
                    <button
                      onClick={() => handleToggleStatus(l.id, l.status)}
                      title={l.status === "active" ? "Deactivate" : "Activate"}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition-all text-xs font-medium"
                    >
                      {l.status === "active"
                        ? <><EyeOff className="h-3.5 w-3.5" /> Hide</>
                        : <><Eye className="h-3.5 w-3.5" /> Activate</>}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => setEditListing(l)}
                      title="Edit"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition-all text-xs font-medium"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(l.id)}
                      disabled={deleting === l.id}
                      title="Delete"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all text-xs font-medium disabled:opacity-40"
                    >
                      {deleting === l.id
                        ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editListing && (
        <EditModal
          listing={editListing}
          onClose={() => setEditListing(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
