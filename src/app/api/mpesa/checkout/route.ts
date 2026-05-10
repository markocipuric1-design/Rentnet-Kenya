import { NextRequest, NextResponse } from "next/server";
import { intasend, AGENCY_ANNUAL_PRICE_KES, normalisePhone } from "@/lib/intasend";
import { createClient } from "@/lib/supabase/server";
import { logPayment } from "@/lib/payment-log";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("account_type, full_name, email")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 400 });
    }

    if (profile.account_type === "administrator") {
      return NextResponse.json({ error: "Administrators cannot subscribe to this plan." }, { status: 403 });
    }

    const { phone_number: phone_raw } = await req.json();
    if (!phone_raw) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    const phone_number = normalisePhone(phone_raw);

    const response = await intasend.collection().mpesaStkPush({
      phone_number,
      email: profile.email ?? user.email,
      amount: AGENCY_ANNUAL_PRICE_KES,
      narrative: "RentNet Agency Annual Plan",
      api_ref: `agency:${user.id}`,
    });

    const invoiceId: string = response?.invoice?.invoice_id ?? response?.id;
    if (!invoiceId) {
      return NextResponse.json({ error: "Failed to initiate M-Pesa payment. Please try again." }, { status: 502 });
    }

    await supabase.from("profiles").update({ mpesa_checkout_id: invoiceId }).eq("id", user.id);

    await logPayment({
      provider: "mpesa",
      provider_ref: `agency:${user.id}`,
      status: "pending",
      amount: AGENCY_ANNUAL_PRICE_KES,
      payment_type: "agency_subscription",
      user_id: user.id,
      user_email: profile.email ?? user.email,
      user_name: profile.full_name,
      metadata: { invoice_id: invoiceId },
    });

    return NextResponse.json({ checkout_id: invoiceId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[mpesa/checkout]", msg);
    return NextResponse.json({ error: `Payment initiation failed: ${msg}` }, { status: 500 });
  }
}
