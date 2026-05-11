import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updatePaymentStatus } from "@/lib/payment-log";

export async function POST(req: NextRequest) {
  const body = await req.text();

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Verify IntaSend challenge secret
  const webhookSecret = process.env.INTASEND_WEBHOOK_SECRET;
  if (webhookSecret && event.challenge !== webhookSecret) {
    return NextResponse.json({ error: "Invalid challenge" }, { status: 400 });
  }

  const state = event.state as string;
  const apiRef = event.api_ref as string | undefined;

  if (state !== "COMPLETE" || !apiRef) {
    return NextResponse.json({ received: true });
  }

  const supabase = await createClient();

  // Agency payment: api_ref = "agency:<userId>"
  if (apiRef.startsWith("agency:")) {
    const userId = apiRef.slice("agency:".length);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await supabase.from("profiles").update({
      account_type: "agencija",
      verified: true,
      subscription_status: "active",
      subscription_expires_at: expiresAt.toISOString(),
      mpesa_checkout_id: null,
    }).eq("id", userId);

    await updatePaymentStatus(apiRef, "complete");
    return NextResponse.json({ received: true });
  }

  // Ad purchase: api_ref = comma-separated ad UUIDs
  const adIds = apiRef.split(",").filter(Boolean);
  for (const adId of adIds) {
    const { data: ad } = await supabase
      .from("advertisements")
      .select("duration_days")
      .eq("id", adId)
      .single();

    const durationDays = ad?.duration_days ?? 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from("advertisements").update({
      active: true,
      payment_status: "paid",
      expires_at: expiresAt,
      mpesa_checkout_id: null,
    }).eq("id", adId);
  }

  await updatePaymentStatus(apiRef, "complete");
  return NextResponse.json({ received: true });
}
