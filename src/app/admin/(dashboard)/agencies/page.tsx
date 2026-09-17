"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle, XCircle, Clock, Plus, Pencil, Trash2, Home, Send, UserCog } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StaffProfileModal, type StaffProfile } from "@/components/ui/staff-profile-modal";

type Agency = StaffProfile & {
  verified: boolean;
  created_at: string;
  staff_managed: boolean;
};

type Filter = "pending" | "verified" | "vse";

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("vse");
  const [processing, setProcessing] = useState<string | null>(null);
  const [modal, setModal] = useState<"new" | Agency | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [inviting, setInviting] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, city, region, bio, avatar_url, website, instagram, facebook, linkedin, youtube_url, cover_url, founded_year, employee_count, specializations, service_areas, verified, created_at, staff_managed")
      .eq("account_type", "agencija")
      .order("created_at", { ascending: false });
    setAgencies((data as Agency[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { (async () => { await load(); })(); }, []);

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

  const handleDelete = async (id: string) => {
    setProcessing(id);
    const res = await fetch(`/api/admin/staff-profiles/${id}`, { method: "DELETE" });
    setProcessing(null);
    if (!res.ok) { const j = await res.json(); alert(`Delete failed: ${j.error ?? "unknown error"}`); return; }
    setAgencies((prev) => prev.filter((a) => a.id !== id));
    setConfirmDeleteId(null);
  };

  const handleInvite = async (id: string) => {
    setInviting(id);
    const res = await fetch(`/api/admin/staff-profiles/${id}/invite`, { method: "POST" });
    setInviting(null);
    if (!res.ok) { const j = await res.json(); alert(`Could not send invite: ${j.error ?? "unknown error"}`); return; }
    setInviteSent(id);
    setTimeout(() => setInviteSent(null), 4000);
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
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Agencies</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {agencies.length} total ·{" "}
            {pending > 0
              ? <span className="text-amber-500 font-semibold">{pending} pending approval</span>
              : <span>all verified</span>}
          </p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> New agency
        </button>
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
        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
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
                      <div>
                        <span className="font-medium text-foreground block">{a.full_name || "—"}</span>
                        {a.staff_managed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600">
                            <UserCog className="h-3 w-3" /> Staff-managed
                          </span>
                        )}
                      </div>
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
                    <div className="flex items-center gap-1.5 justify-end flex-wrap">
                      {!a.verified && !a.staff_managed && (
                        <>
                          <button
                            onClick={() => handleVerify(a.id)}
                            disabled={processing === a.id}
                            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Verify
                          </button>
                          <button
                            onClick={() => handleReject(a.id)}
                            disabled={processing === a.id}
                            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      )}
                      <Link
                        href={`/admin/listings/new?owner=${a.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Home className="h-3.5 w-3.5" /> Add listing
                      </Link>
                      {a.staff_managed && (
                        <>
                          <button
                            onClick={() => handleInvite(a.id)}
                            disabled={inviting === a.id}
                            title="Email them a link to claim this profile"
                            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                          >
                            <Send className="h-3.5 w-3.5" /> {inviteSent === a.id ? "Sent!" : "Invite"}
                          </button>
                          <button
                            onClick={() => setModal(a)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-all"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {confirmDeleteId === a.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-destructive font-semibold whitespace-nowrap">Delete?</span>
                              <button onClick={() => handleDelete(a.id)} disabled={processing === a.id} className="text-xs font-bold bg-destructive text-white px-2 py-1.5 rounded-lg disabled:opacity-60 hover:bg-destructive/90 transition-colors">
                                {processing === a.id ? "…" : "Yes"}
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-xs font-semibold border border-border px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(a.id)} title="Delete" className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <StaffProfileModal
          accountType="agencija"
          initial={modal === "new" ? undefined : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); setFilter("vse"); load(); }}
        />
      )}
    </div>
  );
}
