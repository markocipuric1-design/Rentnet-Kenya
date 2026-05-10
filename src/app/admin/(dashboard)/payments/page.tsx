import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreditCard, TrendingUp, Clock, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

type Transaction = {
  id: string;
  created_at: string;
  updated_at: string;
  provider: string;
  provider_ref: string;
  status: string;
  amount: number;
  currency: string;
  payment_type: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  metadata: Record<string, unknown>;
};

type Subscription = {
  id: string;
  full_name: string | null;
  email: string | null;
  account_type: string;
  subscription_status: string | null;
  subscription_expires_at: string | null;
  stripe_subscription_id: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  complete:  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  pending:   "bg-amber-500/10  text-amber-600  border-amber-500/20",
  failed:    "bg-rose-500/10   text-rose-600   border-rose-500/20",
  cancelled: "bg-zinc-500/10  text-zinc-500   border-zinc-500/20",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  complete:  <CheckCircle2 className="h-3.5 w-3.5" />,
  pending:   <Clock className="h-3.5 w-3.5" />,
  failed:    <XCircle className="h-3.5 w-3.5" />,
  cancelled: <XCircle className="h-3.5 w-3.5" />,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-KE")}`;
}

export default async function AdminPaymentsPage() {
  const admin = createAdminClient();

  const [{ data: transactions }, { data: subscriptions }] = await Promise.all([
    admin
      .from("payment_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("profiles")
      .select("id, full_name, email, account_type, subscription_status, subscription_expires_at, stripe_subscription_id")
      .in("account_type", ["agencija", "fizicna_oseba"])
      .not("subscription_status", "is", null)
      .order("subscription_expires_at", { ascending: true }),
  ]);

  const txns = (transactions ?? []) as Transaction[];
  const subs = (subscriptions ?? []) as Subscription[];

  const now = new Date();

  const totalRevenue = txns.filter(t => t.status === "complete").reduce((s, t) => s + t.amount, 0);
  const pending      = txns.filter(t => t.status === "pending").length;
  const failed       = txns.filter(t => t.status === "failed").length;
  const complete     = txns.filter(t => t.status === "complete").length;

  const activeSubs  = subs.filter(s => s.subscription_status === "active" && s.subscription_expires_at && new Date(s.subscription_expires_at) > now);
  const pastDue     = subs.filter(s => s.subscription_status === "active" && s.subscription_expires_at && new Date(s.subscription_expires_at) <= now);
  const expiringSoon = activeSubs.filter(s => {
    const exp = new Date(s.subscription_expires_at!);
    const daysLeft = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 30;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Full overview of transactions and subscriptions</p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString("en-KE")}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Completed", value: complete, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Pending", value: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
          { label: "Failed", value: failed, icon: XCircle, color: "text-rose-600", bg: "bg-rose-500/10" },
        ].map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Subscription health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Active Subscriptions</p>
          <p className="text-3xl font-extrabold text-foreground mb-1">{activeSubs.length}</p>
          <p className="text-xs text-muted-foreground">Agencies with valid subscription</p>
        </div>

        <div className={`bg-card border rounded-2xl p-5 ${expiringSoon.length > 0 ? "border-amber-500/40" : "border-border"}`}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Expiring Within 30 Days</p>
          <p className={`text-3xl font-extrabold mb-1 ${expiringSoon.length > 0 ? "text-amber-600" : "text-foreground"}`}>{expiringSoon.length}</p>
          {expiringSoon.length > 0 && (
            <ul className="mt-2 space-y-1">
              {expiringSoon.slice(0, 3).map(s => (
                <li key={s.id} className="text-xs text-muted-foreground truncate">
                  {s.full_name ?? s.email} — expires {formatDate(s.subscription_expires_at!)}
                </li>
              ))}
              {expiringSoon.length > 3 && <li className="text-xs text-muted-foreground">+{expiringSoon.length - 3} more</li>}
            </ul>
          )}
        </div>

        <div className={`bg-card border rounded-2xl p-5 ${pastDue.length > 0 ? "border-rose-500/40" : "border-border"}`}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Past Due</p>
          <p className={`text-3xl font-extrabold mb-1 ${pastDue.length > 0 ? "text-rose-600" : "text-foreground"}`}>{pastDue.length}</p>
          {pastDue.length > 0 && (
            <ul className="mt-2 space-y-1">
              {pastDue.slice(0, 3).map(s => (
                <li key={s.id} className="text-xs text-muted-foreground truncate">
                  {s.full_name ?? s.email} — expired {formatDate(s.subscription_expires_at!)}
                </li>
              ))}
              {pastDue.length > 3 && <li className="text-xs text-muted-foreground">+{pastDue.length - 3} more</li>}
            </ul>
          )}
        </div>
      </div>

      {/* ── Subscription table ── */}
      {subs.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold text-foreground">All Subscriptions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["User", "Email", "Status", "Expires", "Stripe ID"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => {
                  const expired = s.subscription_expires_at && new Date(s.subscription_expires_at) <= now;
                  const expiringSoonRow = !expired && s.subscription_expires_at && (new Date(s.subscription_expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30;
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{s.full_name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          expired ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          : expiringSoonRow ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}>
                          {expired ? "Past Due" : expiringSoonRow ? "Expiring Soon" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.subscription_expires_at ? formatDate(s.subscription_expires_at) : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {s.stripe_subscription_id ? s.stripe_subscription_id.slice(0, 20) + "…" : "M-Pesa"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Transactions table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground">All Transactions</h2>
          <span className="text-xs text-muted-foreground">{txns.length} records</span>
        </div>
        {txns.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Transactions will appear here once payments are initiated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Date", "User", "Type", "Provider", "Amount", "Status", "Ref"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="font-medium text-foreground truncate">{t.user_name ?? "Guest"}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.user_email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                        {t.payment_type === "agency_subscription" ? "Agency Plan" : "Ad Purchase"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${
                        t.provider === "stripe"
                          ? "bg-violet-500/10 text-violet-600 border-violet-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      }`}>
                        {t.provider === "mpesa" ? "M-Pesa" : "Stripe"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">
                      {formatAmount(t.amount, t.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[t.status] ?? STATUS_STYLE.pending}`}>
                        {STATUS_ICON[t.status]}
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[120px] truncate" title={t.provider_ref}>
                      {t.provider_ref?.slice(0, 18)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
