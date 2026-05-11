import { NextRequest, NextResponse } from "next/server";
import { intasend } from "@/lib/intasend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get("id");
  const type = searchParams.get("type"); // "ad" | "agency"

  if (!invoiceId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  // Agency upgrades are high-value — require auth + ownership
  if (type === "agency") {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("mpesa_checkout_id")
      .eq("id", user.id)
      .single();
    if (profile?.mpesa_checkout_id !== invoiceId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  // Ad purchases support guest checkout — invoice ID (UUID) is unguessable

  try {
    const result = await intasend.collection().status(invoiceId);
    console.log("[mpesa/status] raw result:", JSON.stringify(result, null, 2));
    const rawState: string = result?.invoice?.state ?? result?.state ?? "PENDING";
    const state = rawState.toUpperCase();
    const failedReason: string | null = result?.invoice?.failed_reason ?? null;

    // On COMPLETE, activate in DB as a backup to the webhook
    if (state === "COMPLETE") {
      if (type === "agency") {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id, subscription_status")
          .eq("mpesa_checkout_id", invoiceId)
          .single();

        if (profile && profile.subscription_status !== "active") {
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          await supabaseAdmin.from("profiles").update({
            account_type: "agencija",
            verified: true,
            subscription_status: "active",
            subscription_expires_at: expiresAt.toISOString(),
            mpesa_checkout_id: null,
          }).eq("id", profile.id);
        }
      } else {
        const { data: ads } = await supabaseAdmin
          .from("advertisements")
          .select("id, duration_days, payment_status")
          .eq("mpesa_checkout_id", invoiceId);

        if (ads?.length) {
          for (const ad of ads) {
            if (ad.payment_status !== "paid") {
              const expiresAt = new Date(Date.now() + (ad.duration_days ?? 30) * 24 * 60 * 60 * 1000).toISOString();
              await supabaseAdmin.from("advertisements").update({
                active: true,
                payment_status: "paid",
                expires_at: expiresAt,
                mpesa_checkout_id: null,
              }).eq("id", ad.id);
            }
          }
        }
      }
    }

    return NextResponse.json({ state, failed_reason: failedReason });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[mpesa/status]", msg);
    return NextResponse.json({ state: "PENDING", error: msg });
  }
}
