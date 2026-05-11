"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, Trash2, ArrowRight, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type SavedSearch = {
  id: string;
  name: string;
  filters: Record<string, string>;
  email_alerts: boolean;
  created_at: string;
};

function filtersToUrl(filters: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v && v !== "All" && v !== "") params.set(k, v); });
  return `/listings?${params.toString()}`;
}

function filterSummary(filters: Record<string, string>) {
  return [
    filters.type && filters.type !== "All" ? filters.type : null,
    filters.category && filters.category !== "All" ? filters.category : null,
    filters.city && filters.city !== "All" ? `in ${filters.city}` : null,
    filters.minPrice ? `from KES ${Number(filters.minPrice).toLocaleString("en-KE")}` : null,
    filters.maxPrice ? `up to KES ${Number(filters.maxPrice).toLocaleString("en-KE")}` : null,
    filters.beds && filters.beds !== "All" ? `${filters.beds} beds` : null,
  ].filter(Boolean).join(" · ") || "All listings";
}

export function SavedSearchesSection() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("saved_searches")
        .select("id, name, filters, email_alerts, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setSearches((data ?? []) as SavedSearch[]);
      setLoading(false);
    })();
  }, []);

  const toggleAlerts = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from("saved_searches").update({ email_alerts: !current }).eq("id", id);
    setSearches(prev => prev.map(s => s.id === id ? { ...s, email_alerts: !current } : s));
    toast(!current ? "Email alerts enabled" : "Email alerts disabled");
  };

  const deleteSearch = async (id: string) => {
    const supabase = createClient();
    await supabase.from("saved_searches").delete().eq("id", id);
    setSearches(prev => prev.filter(s => s.id !== id));
    toast("Search removed");
  };

  if (loading || searches.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-5">
        <Bell className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Saved Searches</h2>
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{searches.length}</span>
      </div>
      <div className="flex flex-col gap-3">
        {searches.map(s => (
          <div key={s.id} className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Search className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{filterSummary(s.filters)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleAlerts(s.id, s.email_alerts)}
                title={s.email_alerts ? "Disable email alerts" : "Enable email alerts"}
                className={`p-2 rounded-xl border transition-all ${s.email_alerts ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"}`}
              >
                {s.email_alerts ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </button>
              <Link href={filtersToUrl(s.filters)}
                className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-xl transition-all">
                View <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button onClick={() => deleteSearch(s.id)}
                className="p-2 rounded-xl border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-all">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
