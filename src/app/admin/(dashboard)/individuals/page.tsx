"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Plus, Pencil, Trash2, Home, Send, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StaffProfileModal, type StaffProfile } from "@/components/ui/staff-profile-modal";

type Individual = StaffProfile & { created_at: string };

export default function AdminIndividualsPage() {
  const [people, setPeople] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | Individual | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [inviting, setInviting] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, city, region, bio, website, created_at")
      .eq("account_type", "fizicna_oseba")
      .eq("staff_managed", true)
      .order("created_at", { ascending: false });
    setPeople((data as Individual[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { (async () => { await load(); })(); }, []);

  const handleDelete = async (id: string) => {
    setProcessing(id);
    const res = await fetch(`/api/admin/staff-profiles/${id}`, { method: "DELETE" });
    setProcessing(null);
    if (!res.ok) { const j = await res.json(); alert(`Delete failed: ${j.error ?? "unknown error"}`); return; }
    setPeople((prev) => prev.filter((p) => p.id !== id));
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

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Individuals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {people.length} staff-created seller/landlord profiles
          </p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> New individual
        </button>
      </div>

      {people.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <UserPlus className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No staff-created individual profiles yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {people.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="font-medium text-foreground">{p.full_name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{p.email || "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">
                    {new Date(p.created_at).toLocaleDateString("en-KE")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 justify-end flex-wrap">
                      <Link
                        href={`/admin/listings/new?owner=${p.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Home className="h-3.5 w-3.5" /> Add listing
                      </Link>
                      <button
                        onClick={() => handleInvite(p.id)}
                        disabled={inviting === p.id}
                        title="Email them a link to claim this profile"
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" /> {inviteSent === p.id ? "Sent!" : "Invite"}
                      </button>
                      <button onClick={() => setModal(p)} title="Edit" className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-all">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {confirmDeleteId === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-destructive font-semibold whitespace-nowrap">Delete?</span>
                          <button onClick={() => handleDelete(p.id)} disabled={processing === p.id} className="text-xs font-bold bg-destructive text-white px-2 py-1.5 rounded-lg disabled:opacity-60 hover:bg-destructive/90 transition-colors">
                            {processing === p.id ? "…" : "Yes"}
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-xs font-semibold border border-border px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(p.id)} title="Delete" className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
          accountType="fizicna_oseba"
          initial={modal === "new" ? undefined : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
