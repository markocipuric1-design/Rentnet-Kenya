import { createAdminClient } from "./supabase/admin";

export async function logPayment(data: {
  provider: "stripe" | "mpesa";
  provider_ref: string;
  status: "pending" | "complete" | "failed";
  amount: number;
  currency?: string;
  payment_type: "agency_subscription" | "ad_purchase";
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const client = createAdminClient();
  await client.from("payment_transactions").insert({
    provider: data.provider,
    provider_ref: data.provider_ref,
    status: data.status,
    amount: data.amount,
    currency: data.currency ?? "KES",
    payment_type: data.payment_type,
    user_id: data.user_id ?? null,
    user_email: data.user_email ?? null,
    user_name: data.user_name ?? null,
    metadata: data.metadata ?? {},
  });
}

export async function updatePaymentStatus(providerRef: string, status: "complete" | "failed") {
  const client = createAdminClient();
  await client
    .from("payment_transactions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("provider_ref", providerRef)
    .eq("status", "pending");
}
