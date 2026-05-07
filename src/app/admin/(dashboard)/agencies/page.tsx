"use client";

import { useEffect, useState } from "react";
import { Building2, CheckCircle, XCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Agency = {
  id: string;
  full_name: string | null;
  email: string | null;
  verified: boolean;
  created_at: string;
};

type Filter = "pending" | "verified" | "vse";

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, verified, created_at")
        .eq("account_type", "agencija")
        .order("created_at", { ascending: false });
      setAgencies(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = agencies.filter((a) => {
    if (filter === "pending") return !a.verified;
    if (filter === "verified") return a.verified;
    return true;
  });

  const pending = agencies.filter((a) => !a.verified).length;

  const handleVerify = async (id: string) => {
    setProcessing(id);
    const supabase = createClient();
    await supabase.from("profiles").update({ verified: true }).eq("id", id);
    setAgencies((prev) => prev.map((a) => a.id === id ? { ...a, verified: true } : a));
    setProcessing(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this agency? Their role will be changed to 'Individual'.")) return;
    setProcessing(id);
    const supabase = createClient();
    await supabase.from("profiles").update({ account_type: "fizicna_oseba", verified: false }).eq("id", id);
    setAgencies((prev) => prev.filter((a) => a.id !== id));
    setProcessing(null);
  };

  const tabs: { value: Filter; label: string }[] = [
    { value: "pending", label: `Pending (${pending})` },
    { value: "verified", label: "Verified" },
    { value: "vse", label: "All" },
  ];

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Agencies</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {agencies.length} total ·{" "}
          {pending > 0
            ? <span className="text-amber-500 font-semibold">{pending} pending approval</span>
            : <span>all verified</span>}
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab.value
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {filter === "pending" ? "No agencies pending approval." : "No agencies."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agency</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Registered</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-sky-600" />
                      </div>
                      <span className="font-medium text-foreground">{a.full_name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{a.email || "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">
                    {new Date(a.created_at).toLocaleDateString("en-KE")}
                  </td>
                  <td className="px-5 py-4">
                    {a.verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {!a.verified && (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleVerify(a.id)}
                          disabled={processing === a.id}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Verify
                        </button>
                        <button
                          onClick={() => handleReject(a.id)}
                          disabled={processing === a.id}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
