"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, CheckCircle, XCircle, Clock, Trash2, Pencil, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  account_type: string;
  verified: boolean;
  active: boolean;
  profile_status: string;
  avatar_url: string | null;
  created_at: string;
};

const ROLES = [
  { value: "fizicna_oseba", label: "Individual",       color: "bg-emerald-500/10 text-emerald-600" },
  { value: "agencija",      label: "Agency",            color: "bg-sky-500/10 text-sky-600" },
  { value: "partner",       label: "Business Partner",  color: "bg-amber-500/10 text-amber-600" },
  { value: "administrator", label: "Administrator",     color: "bg-primary/10 text-primary" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:    { label: "Active",           color: "bg-emerald-500/10 text-emerald-600" },
  pending:   { label: "Pending approval", color: "bg-amber-500/10 text-amber-600" },
  suspended: { label: "Suspended",        color: "bg-destructive/10 text-destructive" },
};

function Avatar({ u, size = "md" }: { u: Profile; size?: "sm" | "md" }) {
  const isPending = u.profile_status === "pending";
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold ${isPending ? "bg-amber-500/15 text-amber-600" : "bg-accent text-primary"}`}>
      {u.avatar_url
        ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
        : (u.full_name?.[0] ?? "?").toUpperCase()}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("vse");
  const [filterStatus, setFilterStatus] = useState("vse");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", account_type: "", profile_status: "", verified: false });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data }, emailRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, account_type, verified, active, profile_status, avatar_url, created_at")
          .order("created_at", { ascending: false }),
        fetch("/api/admin/user-emails"),
      ]);
      const { emails } = await emailRes.json() as { emails?: Record<string, string> };
      const authEmails = emails ?? {};
      setUsers(
        (data ?? []).map(u => ({
          ...u,
          email: u.email ?? authEmails[u.id] ?? null,
        }))
      );
      setLoading(false);
    })();

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-role-menu]") && !target.closest("[data-role-btn]")) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !search || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole   = filterRole   === "vse" || u.account_type   === filterRole;
    const matchStatus = filterStatus === "vse" || u.profile_status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const pendingCount = users.filter(u => u.profile_status === "pending").length;

  const handleChangeRole = async (userId: string, role: string) => {
    const supabase = createClient();
    await supabase.from("profiles").update({ account_type: role }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, account_type: role } : u));
    setOpenDropdown(null);
  };

  const handleToggleActive = async (userId: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from("profiles").update({ active: !current }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !current } : u));
  };

  const handleApprove = async (userId: string) => {
    const supabase = createClient();
    await supabase.from("profiles").update({ profile_status: "active" }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, profile_status: "active" } : u));
  };

  const handleReject = async (userId: string) => {
    const supabase = createClient();
    await supabase.from("profiles").update({ profile_status: "suspended" }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, profile_status: "suspended" } : u));
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingId(userId);
    const res = await fetch("/api/admin/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setDeletingId(null);
    if (!res.ok) {
      const { error } = await res.json() as { error?: string };
      alert(`Delete failed: ${error ?? "unknown error"}`);
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    setConfirmDeleteId(null);
  };

  const openEdit = (u: Profile) => {
    setEditForm({ full_name: u.full_name ?? "", account_type: u.account_type, profile_status: u.profile_status, verified: u.verified });
    setEditUserId(u.id);
  };

  const handleSaveEdit = async () => {
    if (!editUserId) return;
    setSavingEdit(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      full_name: editForm.full_name.trim() || null,
      account_type: editForm.account_type,
      profile_status: editForm.profile_status,
      verified: editForm.verified,
    }).eq("id", editUserId);
    setUsers(prev => prev.map(u => u.id === editUserId ? {
      ...u,
      full_name: editForm.full_name.trim() || null,
      account_type: editForm.account_type,
      profile_status: editForm.profile_status,
      verified: editForm.verified,
    } : u));
    setSavingEdit(false);
    setEditUserId(null);
  };

  const openRoleDropdown = (userId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openDropdown === userId) { setOpenDropdown(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpenDropdown(userId);
  };

  const roleInfo = (type: string) => ROLES.find(r => r.value === type) ?? { label: type, color: "bg-muted text-muted-foreground" };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} total</p>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={() => setFilterStatus(filterStatus === "pending" ? "vse" : "pending")}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border ${
              filterStatus === "pending"
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/20"
            }`}
          >
            <Clock className="h-4 w-4" />
            {pendingCount} pending approval
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border bg-card rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="border border-border bg-card rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 appearance-none cursor-pointer"
        >
          <option value="vse">All roles</option>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-border bg-card rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 appearance-none cursor-pointer"
        >
          <option value="vse">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending approval</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="bg-card border border-border rounded-2xl px-5 py-10 text-center text-muted-foreground text-sm">
          No results.
        </div>
      )}

      {/* ── MOBILE: card list (hidden on md+) ─────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="md:hidden flex flex-col gap-3">
          {filtered.map(u => {
            const role      = roleInfo(u.account_type);
            const statusCfg = STATUS_CONFIG[u.profile_status] ?? STATUS_CONFIG.active;
            const isPending = u.profile_status === "pending";
            return (
              <div
                key={u.id}
                className={`bg-card border rounded-2xl p-4 ${isPending ? "border-amber-500/30 bg-amber-500/5" : "border-border"}`}
              >
                {/* Top row: avatar + name + date */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar u={u} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{u.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email || "—"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(u.created_at).toLocaleDateString("en-KE")}
                    </p>
                  </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${role.color}`}>
                    {role.label}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 flex-wrap border-t border-border pt-3">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(u.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleToggleActive(u.id, u.active)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors hover:opacity-80 ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </button>
                  )}
                  <button
                    data-role-btn
                    onClick={e => openRoleDropdown(u.id, e)}
                    className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 px-3 py-1.5 rounded-xl transition-all"
                  >
                    Role <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => openEdit(u)}
                    className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-all"
                    title="Edit user"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {confirmDeleteId === u.id ? (
                    <div className="flex items-center gap-1.5 ml-1">
                      <span className="text-xs text-destructive font-semibold">Delete?</span>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={deletingId === u.id}
                        className="text-xs font-bold bg-destructive text-white px-2.5 py-1.5 rounded-lg disabled:opacity-60 transition-colors hover:bg-destructive/90"
                      >
                        {deletingId === u.id ? "…" : "Yes"}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs font-semibold border border-border px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(u.id)}
                      className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all ml-1"
                      title="Delete user"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DESKTOP: table (hidden below md) ──────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Registered</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(u => {
                const role      = roleInfo(u.account_type);
                const statusCfg = STATUS_CONFIG[u.profile_status] ?? STATUS_CONFIG.active;
                const isPending = u.profile_status === "pending";
                return (
                  <tr key={u.id} className={`transition-colors ${isPending ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-muted/20"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar u={u} size="sm" />
                        <div>
                          <span className="font-medium text-foreground">{u.full_name || "—"}</span>
                          {isPending && <span className="block text-[10px] text-amber-600 font-semibold mt-0.5">Pending approval</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-sm">{u.email || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${role.color}`}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell">
                      {new Date(u.created_at).toLocaleDateString("en-KE")}
                    </td>
                    <td className="px-5 py-3.5">
                      {isPending ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 px-2.5 py-1 rounded-full transition-colors"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(u.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive px-2.5 py-1 rounded-full transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleToggleActive(u.id, u.active)}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors hover:opacity-80 ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          data-role-btn
                          onClick={e => openRoleDropdown(u.id, e)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Role <ChevronDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all"
                          title="Edit user"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {confirmDeleteId === u.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-destructive font-semibold whitespace-nowrap">Delete?</span>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deletingId === u.id}
                              className="text-xs font-bold bg-destructive text-white px-2.5 py-1.5 rounded-lg disabled:opacity-60 hover:bg-destructive/90 transition-colors"
                            >
                              {deletingId === u.id ? "…" : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs font-semibold border border-border px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(u.id)}
                            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                            title="Delete user"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit user modal */}
      {editUserId && (() => {
        const u = users.find(u => u.id === editUserId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setEditUserId(null)}>
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-foreground">Edit User</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{u?.email || u?.full_name || editUserId}</p>
                </div>
                <button onClick={() => setEditUserId(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Full name */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="Full name"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Role</label>
                  <select
                    value={editForm.account_type}
                    onChange={e => setEditForm(f => ({ ...f, account_type: e.target.value }))}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 appearance-none cursor-pointer transition-all"
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Status</label>
                  <select
                    value={editForm.profile_status}
                    onChange={e => setEditForm(f => ({ ...f, profile_status: e.target.value }))}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 appearance-none cursor-pointer transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending approval</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                {/* Verified */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setEditForm(f => ({ ...f, verified: !f.verified }))}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${editForm.verified ? "bg-primary" : "bg-muted-foreground/30"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${editForm.verified ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">Verified</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {savingEdit
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : null}
                  {savingEdit ? "Saving…" : "Save changes"}
                </button>
                <button
                  onClick={() => setEditUserId(null)}
                  className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Role dropdown (shared) */}
      {openDropdown && (
        <div
          style={{ position: "fixed", top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}
          className="bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px]"
          data-role-menu
        >
          {ROLES.map(r => {
            const u = users.find(u => u.id === openDropdown);
            return (
              <button
                key={r.value}
                onClick={() => handleChangeRole(openDropdown, r.value)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${u?.account_type === r.value ? "text-primary font-semibold" : "text-foreground"}`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
